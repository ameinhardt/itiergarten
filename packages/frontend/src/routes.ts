import { RouteRecordRaw } from 'vue-router';
import Home from './views/Home.vue';
import NotFound from './views/NotFound.vue';

const routes : RouteRecordRaw[] = [
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
    component: () => import('./views/Disclosure.vue')
  },
  {
    path: '/docs/api',
    meta: {
      title: 'pages.docs.title'
    },
    component: () => import('./views/Documentation.vue')
  },
  {
    path: '/privacystatement',
    meta: {
      title: 'pages.privacyStatement.title'
    },
    component: () => import('./views/PrivacyStatement.vue')
  },
  {
    path: '/users',
    meta: {
      title: 'pages.users.title',
      roles: ['admin']
    },
    component: () => import('./views/Users.vue')
  },
  {
    path: '/404',
    component: NotFound
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
];

export default routes;
