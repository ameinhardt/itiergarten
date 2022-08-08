<template>
  <div class="mx-auto max-w-screen-lg">
    <div class="m-1 w-full">
      <div class="base-bg-highlight m-2 rounded shadow-md flex items-center">
        <input
          v-model="filter"
          class="bg-transparent flex-1 leading-relaxed p-2 outline-none"
          :placeholder="$t('search')"
        >
        <i-mdi-magnify class="order-first text-xl ml-3 mr-2 outline-none" />
        <button
          v-show="filter"
          class="mr-4 ml-2 my-auto flex outline-none"
          @click="filter = ''"
        >
          <i-mdi-close />
        </button>
      </div>
      <div class="py-2">
        <h2 class="flex min-h-11 items-center ml-4 text-sm">
          {{ $t('pages.disclosure.thirdPartyLibs') }}
        </h2>
        <div class="divide-y divide-grey dark:divide-petrol">
          <template v-if="!loading">
            <div
              v-for="license in filteredLicences"
              :key="license.name"
              class="mx-4 py-4"
            >
              <h2 class="mb-2">
                <a
                  target="_blank"
                  :href="license.repository || '#'"
                >{{ license.name }}</a>
              </h2>
              <p class="text-gray-500">
                v{{ license.version }}, {{ license.license }}
                <template v-if="license.author">
                  , {{ typeof license.author === 'string' ? license.author : license.author?.name }}
                </template>
              </p>
              <p class="text-gray-500">
                {{ license.description }}
              </p>
            </div>
          </template>
          <template v-else>
            <div
              v-for="i in 10"
              :key="i"
              class="mx-4 border-b border-gray-100 dark:border-petrol py-4"
            >
              <span class="w-[100px] skeleton h-4 bg-petrol dark:bg-gray-500 rounded-sm mb-4" />
              <span class="w-[80px] skeleton h-3 bg-petrol dark:bg-grey-petrol rounded-sm mb-2" />
              <span class="w-[200px] skeleton h-3 bg-petrol dark:bg-grey-petrol rounded-sm mb-2" />
            </div>
          </template>
        </div>
      </div>
      <div class="footer">
        <a
          download
          :href="`${BASE_URL}src.zip`"
        >{{ $t('pages.disclosure.download') }}</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { computed, ref } from 'vue';
import { License } from '../models/License';

const BASE_URL = import.meta.env.BASE_URL,
  licenses = ref([] as Array<License>),
  filter = ref(''),
  filteredLicences = computed(() => licenses.value.filter((license) => license.name.includes(filter.value))),
  isProduction = import.meta.env.PROD,
  loading = ref(true);

/* setTimeout(
    () =>
      import('../../dist/disclosure.json')
        .then(({ libraries }) => (licenses.value = libraries))
        .finally(() => (loading.value = false))
        .catch((err) => console.error(err)),
    2000
  ); */
if (isProduction) {
  axios
    .get('/disclosure.json')
    .then(({ data }) => (licenses.value = data.libraries))
    .finally(() => (loading.value = false))
    .catch((error) => console.error(error));
}
</script>

<style lang="scss" scoped>
  .footer {
    font-style: italic;
  }
</style>
