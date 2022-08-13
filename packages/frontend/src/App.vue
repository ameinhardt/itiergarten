<template>
  <Transition
    mode="out-in"
    enter-active-class="animate-fade-in animate-duration-100"
    leave-active-class="animate-fade-out animate-duration-100"
  >
    <Layout v-if="isReady">
      <RouterView v-slot="{ Component, route }">
        <template v-if="Component">
          <Transition
            mode="out-in"
            enter-active-class="animate-fade-in animate-duration-100"
            leave-active-class="animate-fade-out animate-duration-100"
          >
            <main
              :key="route.path"
              class="h-full overflow-y-auto overflow-x-hidden p-4"
            >
              <component :is="Component" />
            </main>
          </Transition>
        </template>
      </RouterView>
    </Layout>
  </Transition>
  <BaseToast ref="toast" />
  <UpdatePrompt />
</template>

<script setup lang="ts">
import { useDark, useDocumentVisibility, useTitle } from '@vueuse/core';
import axios, { AxiosRequestHeaders, AxiosResponse } from 'axios';
import { ref, provide, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { setLocale } from './i18n';
import type { Toast as ToastType } from './models/Toast';
import { Role, User } from './models/User';
import { useProfileStore } from './stores/profile';
import { useWsStore } from './stores/ws';
import { langs, MessageSchema } from './typings/vue-i18n';
import Layout from './views/Layout.vue';

const toast = ref(),
  profile = useProfileStore(),
  ws = useWsStore(),
  router = useRouter(),
  prefersDark = useDark({ storageKey: 'dark' }),
  visibility = useDocumentVisibility(),
  i18n = useI18n<MessageSchema, langs>({ useScope: 'global' }),
  isReady = ref(false);

async function loadUser({ path, query, hash } = router.currentRoute.value) {
  const headers: AxiosRequestHeaders = { Accept: 'application/json' };
  let url = '/api/user';
  if (
    path === '/' &&
        ['code', 'state'].every((parameter) => query[parameter]) // 'session_state' for some oauth provider
  ) {
    const { code, state, session_state: sessionState, ...newQuery } = query;
    router.replace({
      path,
      hash,
      query: newQuery
    });
    url = `/api/auth/google/callback?code=${code}&state=${state}&session_state=${sessionState}`; // resolves oauth code to token and redirects to /api/user
  }
  try {
    const { data }: AxiosResponse<User> = await axios.get(url, {
      headers
    });
    data.createdAt = new Date(data.createdAt);
    data.updatedAt = new Date(data.updatedAt);
    profile.user = data;
  } catch {
    profile.user = undefined;
  }
  return profile.user;
}

provide('toast', (toastCfg: ToastType | string) =>
  toast.value?.add(typeof toastCfg === 'string' ? { message: toastCfg } : toastCfg)
);

/* setup dark mode */
watch(() => profile.prefersDark, (preference) => {
  prefersDark.value = preference;
});
watch(
  prefersDark,
  (preference) => {
    profile.prefersDark = preference;
    document?.head
      ?.querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', prefersDark.value ? '#151B23' : '#FAFBFE');
  },
  {
    immediate: true
  }
);

/* setup title */
useTitle(
  computed(() => {
    const title = import.meta.env.VITE_TITLE as string,
      subtitle = router.currentRoute.value.meta?.title as string | undefined;
    if (subtitle && i18n.te(subtitle)) {
      return `${title} | ${i18n.t(subtitle)}`;
    }
    return title;
  })
);

/* establish websocket after login */
watch(
  () => profile.isLoggedIn,
  (current, old) => {
    if (!old && current) {
      ws.open();
    } else if (!current && old) {
      ws.close();
    }
  }, { immediate: true }
);

let initUser : Promise<User | null | undefined>;
async function init() {
  await router.isReady();
  await Promise.all([setLocale(i18n), initUser ||= loadUser()]);

  watch(visibility, async (now, before) => {
    if (now === 'visible' && before !== 'visible') {
      try {
        await loadUser();
      } catch {
        profile.user = undefined;
      }
    }
  });

  isReady.value = true;
}
init();

router.beforeEach(async (to, _, next) => {
  await (initUser ||= loadUser(to));
  const roles = to.meta.roles as Array<Role> | undefined;
  if (to.meta.roles == null || roles?.some((role) => profile.hasRole(role))) {
    next();
  } else {
    next({ name: 'Home' });
  }
});
</script>

<style lang="scss"></style>
