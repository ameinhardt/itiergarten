<template>
  <ul
    v-if="profile.isLoggedIn"
    class="min-h-48 overflow-y-auto flex-grow flex-shrink-0 mb-4"
  >
    <li
      v-for="key of possibleAttributes"
      :key="key"
    >
      <BaseInput
        :value="formatValue(key)"
        :disabled="!isEditable(key)"
        :label="i18n.te(`pages.profile.${key}`) ? $t(`pages.profile.${key}`) : key"
        @update:value="(v : string) => setValue(key, v)"
      />
    </li>
  </ul>
  <div class="flex flex-wrap justify-end mt-auto">
    <template v-if="profile.isLoggedIn">
      <button
        class="btn bg-transparent border-3 border-danger border-solid font-bold rounded text-danger active:bg-secondary-error <sm:w-full <sm:flex-auto <sm:order-3"
        @click="showConfirmation = true"
      >
        <i-mdi-alert class="mr-2" />
        <span>{{ $t('pages.profile.deleteAccount') }}</span>
      </button>
      <button
        class="btn min-w-30 <sm:flex-1"
        @click="profile.logout()"
      >
        <i-mdi-lock class="mr-2" />
        <span>{{ $t('signOut') }}</span>
      </button>
      <button
        class="btn min-w-30 <sm:flex-1"
        :class="{ disabled: !hasChanged }"
        @click="updateProfile()"
      >
        <i-mdi-lock class="mr-2" />
        <span>{{ $t('save') }}</span>
      </button>
    </template>
    <button
      v-else
      class="btn ml-auto"
      @click="profile.login()"
    >
      <i-mdi-login class="mr-2" />
      <span>{{ $t('signIn') }}</span>
    </button>
  </div>
  <BasePopover
    v-model:show="showConfirmation"
    class="p-6"
  >
    {{ $t('pages.profile.confirmation') }}
    <div class="flex">
      <button
        class="ml-auto btn active:bg-secondary-error"
        @click="showConfirmation = false"
      >
        <span>{{ $t('cancel') }}</span>
      </button>
      <button
        class="btn ring-danger ring-3 bg-transparent text-danger font-bold active:bg-secondary-error"
        @click="deleteProfile"
      >
        <i-mdi-alert class="mr-2" />
        <BaseLoader v-if="deleting" />
        <span v-else>{{ $t('pages.profile.yesBye') }}</span>
      </button>
    </div>
  </BasePopover>
</template>

<script setup lang="ts">
import { computed, inject, reactive, ref } from 'vue';
import { Composer, useI18n } from 'vue-i18n';
import BasePopover from '../components/BasePopover.vue';
import { Toast } from '../models/Toast';
import type { User, UserEditable } from '../models/User';
import { useProfileStore } from '../stores/profile';

const profile = useProfileStore(),
  i18n = useI18n() as Composer,
  toast = inject('toast') as (toastCfg: Toast | string) => undefined,
  showConfirmation = ref(false),
  deleting = ref(false),
  editableAttributes: UserEditable = reactive({ givenName: undefined }),
  hasChanged = computed(() =>
    Object.entries(editableAttributes).some(
      ([key, value]) => value !== undefined && profile.user?.[key as keyof UserEditable] !== value
    )
  ),
  possibleAttributes = computed(() => {
    const profileKeys = profile.user ? Object.keys(profile.user) : [],
      optionalKeys = Object.keys(editableAttributes);
    return new Set([...profileKeys, ...optionalKeys]);
  });

function formatValue(key: string): string {
  const value = editableAttributes[key as keyof UserEditable] ?? profile.user?.[key as keyof User];
  if (value === undefined) {
    return '';
  } else if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? '' : i18n.d(value, 'dateTime');
  } else if (Array.isArray(value)) {
    value.map((v) => formatValue(v)).join(', ');
  } else if (value instanceof Object) {
    return JSON.stringify(value, undefined, 2);
  }
  return String(value).valueOf();
}

function isEditable(key: string) {
  return Object.prototype.hasOwnProperty.call(editableAttributes, key);
}

function setValue(key: string, value: string | undefined) {
  if (isEditable(key)) {
    editableAttributes[key as keyof UserEditable] = value;
  }
}

async function updateProfile() {
  if (!hasChanged.value) {
    return;
  }
  const updated = await profile.update(editableAttributes);
  if (updated) {
    for (const key in editableAttributes) {
      editableAttributes[key as keyof UserEditable] = undefined;
    }
  } else {
    toast({
      message: i18n.t('pages.profile.updateError', [i18n.t('pages.profile.title')]),
      type: 'error'
    });
  }
}

async function deleteProfile() {
  deleting.value = true;
  try {
    await profile.delete();
  } finally {
    deleting.value = false;
  }
  showConfirmation.value = false;
}
</script>

<style lang="scss"></style>
