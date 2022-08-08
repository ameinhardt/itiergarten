declare module 'virtual:locales' {
  import type { langs, MessageSchema } from '@/typings/vue-i18n';
  type importer = () => Promise<MessageSchema>;
  const registry: Record<langs, importer>;
  export default registry;
}
