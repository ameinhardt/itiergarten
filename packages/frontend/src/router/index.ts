import { useTitle } from '@vueuse/core';
import { computed } from 'vue';
import type { I18n } from 'vue-i18n';
import { createRouter, createWebHistory, NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import Home from '../views/Home.vue';
import NotFound from '../views/NotFound.vue';

export default function init(i18n: I18n<unknown, unknown, unknown, string, false>) {
  const routes = [
      {
        path: '/',
        name: 'Home',
        meta: {
          title: 'pages.home.title'
        },
        component: Home
      },
      {
        path: '/disclosure',
        name: 'Disclosure',
        meta: {
          title: 'pages.disclosure.title'
        },
        component: () => import('../views/Disclosure.vue')
      },
      {
        path: '/docs/api',
        meta: {
          title: 'pages.docs.title'
        },
        component: () => import('../views/Documentation.vue')
      },
      {
        path: '/privacystatement',
        meta: {
          title: 'pages.privacyStatement.title'
        },
        component: () => import('../views/PrivacyStatement.vue')
      },
      {
        path: '/404',
        component: NotFound
      },
      {
        path: '/:pathMatch(.*)*',
        redirect: '/404'
      }
    ],
    router = createRouter({
      history: createWebHistory(import.meta.env.BASE_URL),
      routes
    });

  useTitle(
    computed(() => {
      const title = import.meta.env.VITE_TITLE as string,
        subtitle = router.currentRoute.value.meta?.title as string | undefined;
      if (subtitle && i18n.global.te(subtitle)) {
        return `${title} | ${i18n.global.t(subtitle)}`;
      }
      return title;
    })
  );

  router.beforeEach((to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    next();
  });

  return router;
}
