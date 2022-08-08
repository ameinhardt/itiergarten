/**
 * global type definitions
 */

import type { Composer } from 'vue-i18n';
import en from '../locales/en.json';

type langs = 'en' | 'de';
type MyComposer = Composer<unknown, unknown, unknown, langs, never, string>;
type MessageSchema = typeof en;
export type { langs, MessageSchema, MyComposer as Composer };
