<template>
  <nav>
    <span class="text-sm">Showing <span class="font-semibold">{{ (page - 1) * pagesize + 1 }} - {{ Math.min(page * pagesize, total) }}</span> of <span class="font-semibold"> {{ total }}</span></span>
    <ul>
      <li v-if="page > 1">
        <router-link
          :to="getQuery({ page: 1 })"
          class="base-border"
        >
          1
        </router-link>
      </li>
      <li v-if="page > 2">
        <router-link
          :to="getQuery({ page: page - 1 })"
          class="base-border"
        >
          ...
        </router-link>
      </li>
      <li>
        <span
          class="base-border"
        >{{ page }}</span>
      </li>
      <li v-if="page < maxpage - 1">
        <router-link
          :to="getQuery({ page: page + 1 })"
          class="base-border"
        >
          ...
        </router-link>
      </li>
      <li v-if="page < maxpage">
        <router-link
          :to="getQuery({ page: maxpage })"
          class="base-border"
        >
          {{ maxpage }}
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { computed, toRefs, watch } from 'vue';
import { useRoute, useRouter, LocationQueryValue } from 'vue-router';
import { getQuery } from '../utils';

const route = useRoute(),
  router = useRouter(),
  page = computed(() => {
    const p = Array.isArray(route.query.page) ? route.query.page[0] : route.query.page;
    return (p && Number.parseInt(p)) || 1;
  }),
  properties = defineProps({
    pagesize: {
      type: Number,
      default: 10
    },
    total: {
      type: Number,
      required: true
    }
  }),
  { pagesize, total } = toRefs(properties),
  // pagesize = ref(10),
  // total = ref(123),
  maxpage = computed(() => Math.ceil(total.value / pagesize.value));

function removeBadPageQuery(queryValue : LocationQueryValue | LocationQueryValue[]) {
  queryValue = Array.isArray(route.query.page) ? route.query.page[0] : route.query.page;
  const p = (queryValue && Number.parseInt(queryValue)) || 0;
  if (p < 2) {
    const queries = new URLSearchParams(location.search);
    if (queries.has('page')) {
      queries.delete('page');
      router.replace(`?${queries.toString()}`);
    }
  }
}

watch(() => route.query.page, removeBadPageQuery, { immediate: true });

</script>

<style lang="scss" scoped>
nav {
  @apply flex justify-between items-center pt-4;
  > ul {
    @apply inline-flex items-center -space-x-px;
    > li:first-child {
      a, span {
        @apply rounded-l-lg;
      }
    }
    > li:last-child {
      a, span {
        @apply rounded-r-lg;
      }
    }
    a, span {
      @apply block py-2 px-3 leading-tight border hover:bg-white dark:hover:bg-gray-700;
    }
  }
}
</style>
