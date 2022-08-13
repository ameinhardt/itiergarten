import axios, { AxiosResponse } from 'axios';
import { defineStore } from 'pinia';
import { Role, User, UserEditable } from '../models/User';

type RootState = {
  user?: User | null; // can be undefined or explicitely not present
  prefersDark: boolean;
};

interface ProfilePatchResponse {
  result: 'ok' | 'error';
  message?: string;
  status?: number;
  details?: User;
}

const jsonHeader = {
    headers: {
      Accept: 'application/json'
    }
  },
  useProfileStore = defineStore('profile', {
    state: () =>
      ({
        user: undefined,
        prefersDark: false
      } as RootState),
    getters: {
      isLoggedIn: (state) => state.user != null,
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
          this.user = null;
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
        if (this.user) {
          try {
            const { data }: AxiosResponse<ProfilePatchResponse> = await axios.patch(`/api/user/${this.user.id}`, user);
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
      async delete() {
        if (this.user) {
          try {
            await axios.delete(`/api/user/${this.user.id}`);
            await Promise.all(['api'].map((type) => caches?.delete?.(`${type}-${location.origin}`)));
            return true;
          } finally {
            this.user = null;
          }
        }
        return false;
      },
      toggleDark() {
        this.prefersDark = !this.prefersDark;
      }
    }
  });

export { useProfileStore };
