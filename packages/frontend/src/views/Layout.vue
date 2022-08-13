<template>
  <div class="flex flex-col h-full base-bg base-text">
    <header class="min-h-14 flex items-center text-xl border-b base-border">
      <div
        v-show="!drawer"
        class="flex items-center"
      >
        <button
          class="rounded-1/2 hover:bg-gray-100/10 h-12 w-12 flex items-center justify-center m-1"
          @click="drawer = !drawer"
        >
          <i-mdi-menu />
        </button>
        <label class="ml-3">{{ title }}</label>
      </div>
      <div class="ml-auto relative">
        <button
          ref="toolbarMenuTrigger"
          class="rounded-1/2 hover:bg-gray-100/10 h-12 w-12 flex items-center justify-center m-1"
          @click="toolbarMenu = !toolbarMenu"
        >
          <i-mdi-dots-horizontal />
        </button>
        <Transition
          enter-active-class="animate-fade-in animate-duration-300"
          leave-active-class="animate-fade-out animate-duration-300"
        >
          <div
            v-if="toolbarMenu"
            ref="toolbarMenuReference"
            class="fixed z-50 base-bg-highlight divide-y base-divide shadow right-4 min-w-15rem"
            @click="toolbarMenu = false"
          >
            <ul v-if="profile.isLoggedIn">
              <li
                class="menu-item block py-3 px-4 text-sm flex"
                @click="showProfile = true"
              >
                <span class="truncate">
                  {{ (profile.user?.givenName || profile.user?.name) ?? $t('pages.profile.title') }}
                </span>
              </li>
              <li
                class="menu-item block py-3 px-4 text-sm flex"
                @click="profile.logout()"
              >
                <span>
                  {{ $t('signOut') }}
                </span>
                <i-mdi-lock class="ml-auto" />
              </li>
            </ul>
            <ul
              v-else
              class="p-3"
            >
              <li
                class="signInWithGoogle block cursor-pointer text-sm mt-3"
                @click="profile.login('google')"
              >
                <div>
                  <img src="@/assets/icons/SignInWithGoogle.svg">
                </div>
                <span> {{ $t('signIn', ['Google']) }} </span>
              </li>
              <!--li
                class="signInWithApple block cursor-pointer text-sm mt-3"
                @click="profile.login('apple')"
              >
                <i-mdi-apple />
                <span> {{ $t('signIn', ['Apple']) }} </span>
              </li-->
            </ul>
          </div>
        </Transition>
      </div>
    </header>
    <div
      v-if="drawer"
      class="base-backdrop z-10"
      @click="drawer = false"
    />
    <Transition
      enter-active-class="animate-slide-in-left animate-duration-300"
      leave-active-class="animate-slide-out-left animate-duration-300"
      leave-to-class="hidden"
    >
      <div
        v-if="drawer"
        class="nav-menu absolute z-10 h-full w-75 flex flex-col base-bg-highlight border-r base-border"
      >
        <header class="min-h-14 flex items-center text-xl border-b base-border">
          <button
            class="rounded-1/2 hover:bg-gray-100/10 h-12 w-12 flex items-center justify-center m-1"
            @click="drawer = !drawer"
          >
            <i-mdi-menu />
          </button>
          <label class="ml-3">{{ title }}</label>
        </header>
        <div class="flex-grow">
          <ul class="overflow-y-auto divide-y base-divide">
            <li class="menu-item">
              <router-link to="/">
                <i-mdi-home-outline class="mr-2" />
                <span>{{ $t('pages.home.title') }}</span>
              </router-link>
            </li>
            <li
              v-if="profile.isLoggedIn && profile.hasRole('admin')"
              class="menu-item"
            >
              <router-link to="/users">
                <i-mdi-account-multiple class="mr-2" />
                <span>{{ $t('pages.users.title') }}</span>
              </router-link>
            </li>
            <li
              v-if="profile.isLoggedIn"
              class="menu-item"
            >
              <router-link to="/docs/api">
                <i-mdi-file-document-multiple-outline class="mr-2" />
                <span>{{ $t('pages.docs.title') }}</span>
              </router-link>
            </li>
            <li class="menu-item">
              <router-link to="/disclosure">
                <i-mdi-file-document-multiple-outline class="mr-2" />
                <span>{{ $t('pages.disclosure.title') }}</span>
              </router-link>
            </li>
            <li class="menu-item">
              <router-link to="/privacystatement">
                <i-mdi-scale-balance class="mr-2" />
                <span>{{ $t('pages.privacyStatement.title') }}</span>
              </router-link>
            </li>
          </ul>
        </div>
        <footer class="flex items-center justify-center min-h-14 border-t base-border">
          v{{ version }}, {{ isProduction ? 'production' : 'development' }}
        </footer>
      </div>
    </Transition>

    <BaseModal v-model:show="showProfile">
      <template #header>
        <button
          class="absolute left-0 flex items-center text-primary font-semibold"
          @click="showProfile = false"
        >
          <i-mdi-chevron-left />
          <span>{{ $t('cancel') }}</span>
        </button>
        <h2 class="font-medium text-xl">
          {{ $t('pages.profile.title') }}
        </h2>
        <button
          v-if="profile.isLoggedIn"
          class="absolute right-0 flex items-center text-primary font-semibold"
          @click="profile.refresh()"
        >
          <span>{{ $t('refresh') }}</span>
        </button>
      </template>
      <Profile />
    </BaseModal>
    <slot />
    <footer class="flex items-center justify-center min-h-14 border-t base-border" />
  </div>
</template>

<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import { ref, watch } from 'vue';
import { useProfileStore } from '../stores/profile';
import Profile from '../views/Profile.vue';

const profile = useProfileStore(),
  toolbarMenu = ref(false),
  toolbarMenuTrigger = ref(),
  toolbarMenuReference = ref(),
  drawer = ref(false),
  showProfile = ref(false),
  title = import.meta.env.VITE_TITLE,
  version = import.meta.env.VITE_VERSION,
  isProduction = import.meta.env.PROD;

onClickOutside(toolbarMenuReference, () => (toolbarMenu.value = false), {
  ignore: [toolbarMenuTrigger]
});

watch(
  () => profile.isLoggedIn,
  (isLoggedInNow, isLoggedInBefore) => {
    if (isLoggedInBefore && !isLoggedInNow) {
      showProfile.value = false;
    }
  }
);
</script>

<style lang="scss" scoped>
  .menu-item {
    @apply hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer;
  }
  .signInWithGoogle {
    @apply light:border min-h-10.5 flex items-center justify-start rounded-sm p-[1px] font-roboto;
    background: white;
    @at-root {
      .dark & {
        background: #4285f4;
      }
    }
    &:hover {
      box-shadow: 0 0 6px #4285f4;
    }
    &:active {
      background: #1669f2;
    }
    > div {
      @apply flex items-center justify-center h-10 w-10 bg-white;
      > img {
        @apply h-4.5 w-4.5;
      }
    }
    > span {
      @apply mx-4 text-[14px] whitespace-nowrap;
    }
  }
  /*.signInWithApple {
    @apply min-h-10.5 flex items-center justify-center rounded-sm p-[1px] text-white dark:text-black bg-black dark:bg-white rounded-sm border border-black min-w-35 px-[11px];
    > span {
      @apply mx-4 text-[14px] whitespace-nowrap;
    }
  }*/
  .nav-menu {
    .menu-item a {
      @apply block p-3 flex items-center;
      &.router-link-active {
        text-decoration: underline;
      }
    }
  }
</style>
