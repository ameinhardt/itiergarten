
// import { setCacheNameDetails } from 'workbox-core/setCacheNameDetails';
/// <reference types="vite/client" />
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope;

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// self.__WB_MANIFEST is default injection point
precacheAndRoute(self.__WB_MANIFEST);

// clean old assets
cleanupOutdatedCaches();

// to allow work offline
registerRoute(
  new NavigationRoute(createHandlerBoundToURL('index.html'), {
    denylist: [/\/(api)\//]
  })
);

registerRoute(
  ({ url }) =>
    url.pathname.startsWith(`${import.meta.env.BASE_URL}api`) &&
    !url.pathname.startsWith(`${import.meta.env.BASE_URL}api/auth`),
  new NetworkFirst({
    cacheName: `api-${location.origin}`,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20,
        purgeOnQuotaError: false
      }),
      new CacheableResponsePlugin({
        statuses: [200]
      })
    ]
  }),
  'GET'
);

// export default null;
