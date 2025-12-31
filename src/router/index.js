// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'events',
      component: () => import('@/views/EventsView.vue')
    },
    {
      path: '/meetings',
      name: 'meetings',
      component: () => import('@/views/MeetingsView.vue')
    },
    {
      path: '/market',
      name: 'market',
      component: () => import('@/views/MarketView.vue')
    },
    {
      path: '/account',
      name: 'account',
      component: () => import('@/views/AccountView.vue')
    }
  ]
})

export default router