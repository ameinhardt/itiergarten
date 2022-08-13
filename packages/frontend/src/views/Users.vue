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
      v-if="direction === '<' ? (datas.length > pagesize + (route.query.item ? 1 : 0)) : (route.query.item != null)"
      :to="getQuery({ sortBy, dir: '<', item: from, pagesize: pagesize === DEFAULTPAGESIZE ? null : pagesize })"
    >
      <div class="btn outline primary">
        <i-mdi-chevron-left /> Previous
      </div>
    </router-link>
    <router-link
      v-if="direction === '>' ? (datas.length > pagesize + (route.query.item ? 1 : 0)) : (route.query.item != null)"
      :to="getQuery({ sortBy, dir: '>', item: to, pagesize: pagesize === DEFAULTPAGESIZE ? null : pagesize })"
      class="ml-auto"
    >
      <div class="btn outline primary">
        Next <i-mdi-chevron-right />
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
  pagesize = ref(10),
  sortBy = ref('id'),
  direction = computed(() => (route.query.dir && ['<', '>'].includes(route.query.dir.toString())) ? route.query.dir : '>'),
  columns = ['name', 'givenname', 'roles', 'email', 'provider', 'createdAt', 'updatedAt'],
  datas = ref([] as Array<User>),
  rows = computed(() => {
    const cutleft = (direction.value === '>' ? route.query.item : (datas.value.length > pagesize.value + 1)) ? 1 : 0,
      cutright = (direction.value === '>' ? (datas.value.length > pagesize.value + cutleft) : route.query.item) ? -1 : undefined;
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
  from = computed(() => datas.value[1]?.id ?? null),
  to = computed(() => datas.value[datas.value.length - 2]?.id ?? null),
  proxyParameters = ['pagesize', 'sortBy', 'dir', 'item'];

// sample data
watch(() => proxyParameters.map((parameter) => route.query[parameter]), async () => {
  try {
    const { data } = await axios.get<User[]>('/api/users', {
      params: Object.fromEntries(proxyParameters.map((parameter) => [parameter, route.query[parameter]]))
    });
    datas.value = data;
  } catch {}
  /*
    newDatas = [],
    itemInt = Number.parseInt((Array.isArray(newArguments[3]) ? newArguments[3][0] : newArguments[3]) || ''),
    item = Number.isNaN(itemInt) ? undefined : itemInt,
    base = item == null ? -1 : item;
  for (let r = 0; r < pagesize.value + 2; r++) {
    const id = direction.value === '>' ? base + r : base - pagesize.value + r - 1,
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
    if (direction.value === '>') {
      newDatas.shift();
    } else {
      newDatas.pop();
    }
  }
  */
}, { immediate: true });
</script>
