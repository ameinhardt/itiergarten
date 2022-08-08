import axios from 'axios';
import dayjs from 'dayjs';
// eslint-disable-next-line import/no-unresolved
import locales from 'virtual:locales';
import { nextTick } from 'vue';
import { createI18n } from 'vue-i18n';
import type { I18n } from 'vue-i18n';
import type { langs, MessageSchema, Composer } from './typings/vue-i18n';

const SUPPORTED_LOCALES = Object.keys(locales) as Array<langs>,
  dateTimeFormat = {
    dateTime: {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit'
    },
    shortTime: {
      hour: 'numeric',
      minute: '2-digit'
    },
    shortDate: {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit'
    },
    longDate: {
      weekday: 'short',
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    }
  },
  numberFormat = {
    short: {
      maximumFractionDigits: 2
    }
  };

async function loadLocaleMessages(composer: Composer, locale: langs): Promise<void> {
  // load locale messages with dynamic import
  const messages = await locales[locale]();

  console.debug(`setting sourceLocale ${locale}`);
  // set locale and locale message
  composer.setLocaleMessage(locale, messages);

  return nextTick();
}

async function setLocale(composer: Composer, locale = composer.locale.value as langs) {
  // load locale messages
  await loadLocaleMessages(composer, locale);
  composer.setDateTimeFormat(locale, dateTimeFormat);
  composer.setNumberFormat(locale, numberFormat);
  composer.locale.value = locale;
  dayjs.locale(locale);
  axios.defaults.headers.common['Accept-Language'] = locale;
  document.querySelector('html')?.setAttribute('lang', locale);

  return composer;
}

async function init(defaultLocale: langs = 'en'): Promise<I18n<unknown, unknown, unknown, string, false>> {
  const i18n = createI18n<[MessageSchema], langs, false>({
    legacy: false,
    locale: defaultLocale, // but no messages loaded, yet. Really to be defined in App.vue
    fallbackLocale: defaultLocale,
    globalInjection: true,
    missing: import.meta.env.PROD
      ? (locale, key, instance, values) =>
          console.warn(`missing '${locale}' translation for '${key}'`, instance, values)
      : undefined
  });

  await setLocale(i18n.global);
  return i18n;
}

export default init;
export { setLocale, SUPPORTED_LOCALES };
