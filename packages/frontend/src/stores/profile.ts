import { useDark } from '@vueuse/core';
import axios, { AxiosResponse } from 'axios';
import { defineStore } from 'pinia';
import { Ref, watch } from 'vue';
import { Role, User, UserEditable } from '../models/User';

type RootState = {
  user?: User;
  prefersDark: Ref<boolean>;
};

interface ProfilePatchResponse {
  result: 'ok' | 'error';
  message?: string;
  status?: number;
  details?: User;
}

const prefersDark = useDark({ storageKey: 'dark' });

watch(
  prefersDark,
  () =>
    document?.head
      ?.querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', prefersDark.value ? '#151B23' : '#FAFBFE'),
  {
    immediate: true
  }
);

const jsonHeader = {
    headers: {
      Accept: 'application/json'
    }
  },
  useProfileStore = defineStore('profile', {
    state: () =>
      ({
        user: undefined,
        prefersDark
      } as RootState),
    getters: {
      isLoggedIn: (state) => state.user !== undefined,
      hasRole: (state) => (name: Role) => state.user?.roles?.includes(name) ?? false
    },
    actions: {
      login(name = 'google') {
        window.location.href = `${import.meta.env.BASE_URL ?? '/'}api/auth/${name}`;
      },
      async logout() {
        try {
          await Promise.all(['api'].map((type) => caches?.delete?.(`${type}-${location.origin}`)));
        } finally {
          this.user = undefined;
        }
        window.location.href = `${import.meta.env.BASE_URL ?? '/'}api/auth/logout`;
      },
      async refresh() {
        try {
          const { data } = await axios.get('/api/auth/refresh', jsonHeader);
          data.createdAt = new Date(data.createdAt);
          data.updatedAt = new Date(data.updatedAt);
          this.user = data;
        } catch {
          this.login();
        }
      },
      async update(user: UserEditable) {
        if (this.isLoggedIn) {
          try {
            const { data }: AxiosResponse<ProfilePatchResponse> = await axios.patch('/api/user', user);
            if (data.details) {
              data.details.createdAt = new Date(data.details.createdAt);
              data.details.updatedAt = new Date(data.details.updatedAt);
              this.user = data.details;
              return true;
            }
          } catch {}
        }
        return false;
      },
      toggleDark() {
        this.prefersDark = !this.prefersDark;
      }
    }
  });

export { useProfileStore };
