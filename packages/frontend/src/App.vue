<template>
  <Layout>
    <router-view />
  </Layout>
  <BaseToast ref="toast" />
  <UpdatePrompt />
</template>

<script setup lang="ts">
import { useDocumentVisibility } from '@vueuse/core';
import axios, { AxiosRequestHeaders, AxiosResponse } from 'axios';
import { ref, provide, watch } from 'vue';
import { useRouter } from 'vue-router';
import type { Toast as ToastType } from './models/Toast';
import { User } from './models/User';
import { useProfileStore } from './stores/profile';
import { useWsStore } from './stores/ws';
import Layout from './views/Layout.vue';

const toast = ref(),
  profile = useProfileStore(),
  ws = useWsStore(),
  visibility = useDocumentVisibility(),
  router = useRouter();
provide('toast', (toastCfg: ToastType | string) =>
  toast.value?.add(typeof toastCfg === 'string' ? { message: toastCfg } : toastCfg)
);

async function loadUser() {
  const currenRoute = router.currentRoute.value,
    headers: AxiosRequestHeaders = { Accept: 'application/json' };
  let url = '/api/user';
  if (
    router.currentRoute.value.path === '/' &&
        ['code', 'state'].every((parameter) => currenRoute.query[parameter]) // 'session_state' for some oauth provider
  ) {
    const query = location.search;
    router.replace(router.currentRoute.value.path);
    url = `/api/auth/google/callback${query}`; // resolves oauth code to token and redirects to /api/user
  }
  const { data }: AxiosResponse<User> = await axios.get(url, {
    headers
  });
  data.createdAt = new Date(data.createdAt);
  data.updatedAt = new Date(data.updatedAt);
  profile.user = data;
  return profile.user;
}

router
  .isReady()
  .then(() =>
    watch(visibility, async (now, before) => {
      if (now === 'visible' && before !== 'visible') {
        try {
          await loadUser();
        } catch {
          profile.user = undefined;
        }
      }
    }, {
      immediate: true
    })
  )
  .catch((error) => {
    console.warn(error.message);
  });

// establish websocket after login
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
</script>

<style lang="scss"></style>
