import axios from 'axios';
import { createPinia } from 'pinia';
// eslint-disable-next-line import/no-unresolved
import { registerSW } from 'virtual:pwa-register';
import { createApp } from 'vue';
import type { langs } from '@/typings/vue-i18n';
import App from './App.vue';
import initI18n, { SUPPORTED_LOCALES } from './i18n';
import initRouter from './router';
// eslint-disable-next-line import/no-unresolved
import 'uno.css';

import '@unocss/reset/tailwind.css';
// eslint-disable-next-line import/no-unresolved
import 'virtual:unocss-devtools';
import './assets/style.scss';

registerSW({
  onOfflineReady() {
    console?.info('ready for offline usage');
  }
});

console?.info(
  `%c ${import.meta.env.VITE_TITLE} %c v${import.meta.env.VITE_VERSION} %c `,
  'background:#FF6464;padding:1px;border-radius:3px 0 0 3px;color:#fff',
  'background:#2D3746;padding:1px;border-radius: 0 3px 3px 0;color:#fff',
  'background:transparent'
);

if (import.meta.env.PROD) {
  // eslint-disable-next-line no-eval
  window.eval = () => {
    throw new Error('that\'s eval!');
  };
}

axios.defaults.baseURL = import.meta.env.BASE_URL;
axios.interceptors.response.use(
  (result) => result,
  async (error) => {
    if (Math.floor(error.response?.status / 100) === 401) {
      await Promise.all(['api'].map((type) => caches?.delete?.(`${type}-${location.origin}`)));
    }
    throw error;
  }
);

initI18n(navigator.languages.find((lang) => ~SUPPORTED_LOCALES.indexOf(lang as langs)) as langs | undefined)
  .then((i18n) => createApp(App).use(createPinia()).use(initRouter(i18n)).use(i18n).mount('#app'))
  .catch((error) => console.error(error));
