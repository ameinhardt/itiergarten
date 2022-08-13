import axios from 'axios';
import { createPinia } from 'pinia';
// eslint-disable-next-line import/no-unresolved
import { registerSW } from 'virtual:pwa-register';
import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import { SUPPORTED_LOCALES } from './i18n';
import routes from './routes';
import type { langs, MessageSchema } from './typings/vue-i18n';
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

const fallbackLocale = navigator.languages.find((lang) => ~SUPPORTED_LOCALES.indexOf(lang.split('-')[0] as langs)) ?? 'en';

createApp(App)
  .use(createI18n<MessageSchema, langs, false>({
    legacy: false,
    locale: fallbackLocale, // but no messages loaded, yet. Really to be defined in App.vue
    fallbackLocale,
    globalInjection: true,
    missing: import.meta.env.PROD
      ? (locale, key, instance, values) =>
          console.warn(`missing '${locale}' translation for '${key}'`, instance, values)
      : undefined
  }))
  .use(createPinia())
  .use(createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
  }))
  .mount('#app');
