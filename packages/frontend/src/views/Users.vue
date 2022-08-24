<template>
  <div class="overflow-x-auto">
    <BaseTable
      :columns="columns"
      :rows="rows"
      i18n-base="pages.users"
      editable
    />
  </div>
  <nav class="flex justify-between items-center pt-4">
    <router-link
      v-if="hasLeft"
      :to="getQuery({ dir: '<', item: from })"
    >
      <div class="btn outline primary">
        <i-mdi-chevron-left /> {{ $t('previous') }}
      </div>
    </router-link>
    <router-link
      v-if="hasRight"
      :to="getQuery({ dir: '>', item: to })"
      class="ml-auto"
    >
      <div class="btn outline primary">
        {{ $t('next') }} <i-mdi-chevron-right />
      </div>
    </router-link>
  </nav>
</template>

<script setup lang="ts">
import axios from 'axios';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { User } from '../models/User';
import { getQuery } from '../utils';

const DEFAULTPAGESIZE = 10,
  route = useRoute(),
  i18n = useI18n(),

  columns = new Set(['name', 'givenName', 'roles', 'email', 'provider', 'createdAt', 'updatedAt'] as Array<keyof User>),
  proxyParameters = ['pagesize', 'sortBy', 'dir', 'item', 'order'],

  pagesize = computed(() => {
    const firstArgument = Array.isArray(route.query.pagesize) ? route.query.pagesize[0] : route.query.pagesize,
      size = firstArgument ? Number.parseInt(firstArgument) : Number.NaN;
    return Number.isNaN(size) ? DEFAULTPAGESIZE : size;
  }),
  lte = computed(() => route.query.dir  === '<'),
  datas = ref([] as Array<User>),
  rows = computed(() => {
    const cutleft = (lte.value ? (datas.value.length > pagesize.value + 1) : datas.value[0]?.id === route.query.item) ? 1 : 0,
      cutright = (lte.value ? (datas.value[datas.value.length - 1]?.id === route.query.item) : (datas.value.length > pagesize.value + cutleft)) ? -1 : undefined;
    return datas.value.map((data) => [
      data.name,
      data.givenName,
      data.roles?.join(', '),
      data.email,
      data.provider.join(', '),
      i18n.d(data.createdAt, 'dateTime'),
      i18n.d(data.updatedAt, 'dateTime')
    ]).slice(cutleft, cutright);
  }),
  hasLeft = computed(() => lte.value ? (datas.value.length > pagesize.value + (route.query.item != null ? 1 : 0)) : (route.query.item != null)),
  hasRight = computed(() => !lte.value ? (datas.value.length > pagesize.value + (route.query.item != null ? 1 : 0)) : (route.query.item != null)),
  primarySortField = computed(() => {
    const sortField = (Array.isArray(route.query.sortBy) ? route.query.sortBy[0] : route.query.sortBy) as null | keyof User;
    return (sortField && columns.has(sortField)) ? sortField : 'id';
  }),
  from = computed(() => datas.value[1]?.[primarySortField.value]?.toString() ?? null),
  to = computed(() => datas.value[datas.value.length - 2]?.[primarySortField.value]?.toString() ?? null);

watch(() => proxyParameters.map((parameter) => route.query[parameter]), async () => {
  try {
    const { data } = await axios.get<User[]>('/api/users', {
      params: Object.fromEntries(proxyParameters
        .filter((parameter) => Object.prototype.hasOwnProperty.call(route.query, parameter))
        .map((parameter) => [parameter, route.query[parameter]])
      ),
      paramsSerializer: (parameters) => {
        const urlSearchParameters = new URLSearchParams();
        for (const key in parameters) {
          const values = Array.isArray(parameters[key]) ? parameters[key] : [parameters[key]];
          values.map((value:string) => urlSearchParameters.append(key, value ?? ''));
        }
        return urlSearchParameters.toString();
      }
    });
    datas.value = data;
  } catch {}
  /* // sample data
    newDatas = [],
    itemInt = Number.parseInt((Array.isArray(newArguments[3]) ? newArguments[3][0] : newArguments[3]) || ''),
    item = Number.isNaN(itemInt) ? undefined : itemInt,
    base = item == null ? -1 : item;
  for (let r = 0; r < pagesize.value + 2; r++) {
    const id = lte.value ? base - pagesize.value + r - 1 : base + r,
      user = {
        id: id.toString(),
        name: `John ${id}`,
        givenName: 'johnny',
        roles: ['admin'],
        email: 'john@doe.com',
        provider: ['google', 'apple'],
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 1_000_000_000)),
        updatedAt: new Date()
      } as User;
    newDatas.push(user);
  }
  if (item == null) {
    if (lte.value) {
      newDatas.pop();
    } else {
      newDatas.shift();
    }
  }
  */
}, { immediate: true });
</script>
