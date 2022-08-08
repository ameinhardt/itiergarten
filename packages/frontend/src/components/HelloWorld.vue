<template>
  <div class="helloWorld text-center">
    <h1 class="flex flex-wrap items-center justify-center text-3xl">
      <span>{{ $t('pages.helloWorld.greeting') }}, </span>
      <Transition
        mode="out-in"
        enter-active-class="animate-fade-in animate-duration-300"
        leave-active-class="animate-fade-out animate-duration-300"
      >
        <div
          v-if="profile.isLoggedIn"
          class="flex items-center w-max-105"
        >
          <BaseInput
            v-model:value="newGivenName"
            class="inline-block"
            :label="newGivenName.length > 0 ? $t('pages.profile.givenName') : $t('pages.helloWorld.givenName')"
            @enter="updateProfile()"
          />
          <button
            class="btn outline primary px-2 pt-1 text-xl inline-block"
            :disabled="newGivenName === profile.user?.givenName"
            :class="{ disabled: newGivenName === profile.user?.givenName }"
            @click="updateProfile()"
          >
            <i-mdi-content-save class="text-lg" />
          </button>
        </div>
        <div
          v-else
          class="my-4 basis-105"
        >
          <div class="p-4 my-2 border-b border-primary">
            {{ title }}
          </div>
        </div>
      </Transition>
    </h1>
    <div>
      {{ $t('pages.helloWorld.exampleFor') }}
      <ul>
        <li>
          General:
          <template
            v-for="(link, key) in generalLinks"
            :key="key"
          >
            <a :href="link">{{ key }}</a>
          </template>
        </li>
        <li>
          Frontend:
          <template
            v-for="(link, key) in frontendLinks"
            :key="key"
          >
            <a :href="link">{{ key }}</a>
          </template>
        </li>
        <li>
          Backend:
          <template
            v-for="(link, key) in backendLinks"
            :key="key"
          >
            <a :href="link">{{ key }}</a>
          </template>
        </li>
        <li>
          Testing:
          <template
            v-for="(link, key) in testingLinks"
            :key="key"
          >
            <a :href="link">{{ key }}</a>
          </template>
        </li>
        <li>
          Supporting:
          <template
            v-for="(link, key) in developmentEnvironment"
            :key="key"
          >
            <a :href="link">{{ key }}</a>
          </template>
        </li>
      </ul>
    </div>
    <p class="my-2">
      <a
        href="https://github.com/ameinhardt/itiergarten"
        class="flex justify-center items-center"
      >
        <i-mdi-github class="mr-2" />Repository
      </a>
    </p>
    <p>{{ $t('pages.helloWorld.loaded', { when: loadedTimeAgo }) }}</p>
    <p>
      <button
        v-for="locale in SUPPORTED_LOCALES"
        :key="locale"
        class="btn"
        @click="setLocale(i18n, locale)"
      >
        {{ locale }}
      </button>
    </p>

    <button
      class="btn"
      @click="fetchUserInfoFromBackend"
    >
      {{ $t('pages.helloWorld.fetchUserinfo') }}
    </button>
    <button
      class="btn"
      @click="count++"
    >
      {{ $t('pages.helloWorld.countIs') }}: {{ count }}
    </button>
    <button
      class="btn"
      @click="profile.toggleDark"
    >
      {{ profile.prefersDark ? $t('pages.helloWorld.themeLight') : $t('pages.helloWorld.themeDark') }}
    </button>
    <button
      :class="{ disabled: !profile.isLoggedIn }"
      class="btn"
      @click="profile.isLoggedIn && broadcastHello()"
    >
      {{ $t('pages.helloWorld.helloWs') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useWindowFocus, useIntervalFn } from '@vueuse/core';
import axios, { AxiosResponse } from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { inject, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { setLocale, SUPPORTED_LOCALES } from '../i18n';
import { Toast } from '../models/Toast';
import { User } from '../models/User';
import { useProfileStore } from '../stores/profile';
import { useWsStore } from '../stores/ws';
import type { Composer } from '../typings/vue-i18n';

const profile = useProfileStore(),
  newGivenName = ref(profile.user?.givenName ?? profile.user?.name ?? ''),
  i18n = useI18n({ useScope: 'global' }) as Composer,
  toast = inject('toast') as (toastCfg: Toast | string) => undefined,
  count = ref(0),
  title = import.meta.env.VITE_TITLE,
  generalLinks = {
    pnpm: 'https://pnpm.io',
    typescript: 'https://www.typescriptlang.org',
    eslint: 'https://eslint.org'
  },
  frontendLinks = {
    'vue 3': 'https://v3.vuejs.org',
    UnoCSS: 'https://github.com/unocss/unocss',
    i18n: 'https://vue-i18n-next.intlify.dev',
    pinia: 'https://pinia.vuejs.org',
    vite: 'https://vitejs.dev',
    pwa: 'https://github.com/antfu/vite-plugin-pwa',
    workbox: 'https://developers.google.com/web/tools/workbox',
    vueuse: 'https://vueuse.org',
    dayjs: 'https://day.js.org',
    'rollup-plugin-oss': 'https://github.com/ameinhardt/rollup-plugin-oss'
  },
  backendLinks = {
    rollup: 'https://rollupjs.org',
    koajs: 'https://koajs.com',
    winston: 'https://github.com/winstonjs/winston',
    grant: 'https://github.com/simov/grant',
    'koa-jwt': 'https://github.com/koajs/jwt',
    ajv: 'https://ajv.js.org',
    ws: 'https://github.com/websockets/ws'
  },
  testingLinks = {
    jest: 'https://jestjs.io',
    'jest-json-schema': 'https://github.com/americanexpress/jest-json-schema',
    '@shelf/jest-mongodb': 'https://github.com/shelfio/jest-mongodb',
    nock: 'https://github.com/nock/nock',
    supertest: 'https://github.com/visionmedia/supertest'
  },
  developmentEnvironment = {
    vscode: 'https://code.visualstudio.com',
    volar: 'https://github.com/johnsoncodehk/volar',
    i18nally: 'https://i18nally.org',
    'vscode-eslint': 'https://github.com/Microsoft/vscode-eslint',
    'search-node-modules': 'https://github.com/jasonnutter/vscode-search-node-modules'
  },
  loadedAt = dayjs(new Date()),
  loadedTimeAgo = ref(''),
  visibility = useWindowFocus();
dayjs.extend(relativeTime);

watch(
  () => profile.isLoggedIn,
  (now, before) => {
    if (now && !before) {
      // logged in, update
      newGivenName.value = profile.user?.givenName ?? profile.user?.name ?? '';
    } else if (before && !now) {
      // logged out, reset
      newGivenName.value = '';
    }
  }
);

watch(
  () => profile.user?.givenName ?? profile.user?.name ?? '',
  (now, before) => {
    if (newGivenName.value === before) {
      newGivenName.value = now;
    }
  }
);

function updateLoadTime() {
  loadedTimeAgo.value = loadedAt.locale(i18n.locale.value).from(dayjs());
}

async function updateProfile() {
  const updated = await profile.update({
    givenName: newGivenName.value
  });
  if (!updated) {
    toast({
      message: i18n.t('pages.profile.updateError', [i18n.t('pages.profile.givenName')]),
      type: 'error'
    });
  }
}

async function fetchUserInfoFromBackend() {
  try {
    const result: AxiosResponse<User> = await axios.get('/api/user', { timeout: 3000 });
    toast(i18n.t('pages.helloWorld.response', [result.status]));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      toast({
        message: i18n.t('pages.helloWorld.response', [error.response?.status ?? '?']),
        type: 'error'
      });
    }
  }
}

const ws = useWsStore();
watch(() => ws.data, (data) => {
  if (!data) {
    return;
  }
  try {
    const message = JSON.parse(data);
    console.log(message);
  } catch {
    console.error('unknown message:', data);
  }
});

function broadcastHello() {
  ws.send(JSON.stringify({ hello: count.value }));
}

const { pause, resume } = useIntervalFn(updateLoadTime, 5000, { immediateCallback: true });

watch(visibility, (now) => (now ? resume() : pause()));
watch(i18n.locale, updateLoadTime);
</script>

<style lang="scss">
  .helloWorld {
    ul a {
      @apply text-secondary;
      &:not(:last-child):after {
        content: ', ';
      }
    }

    li {
      list-style: none;
    }
  }
</style>
