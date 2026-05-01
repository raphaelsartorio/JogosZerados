import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('./pages/Dashboard.vue'),
  },
  {
    path: '/jogos',
    name: 'games',
    component: () => import('./pages/Jogos.vue'),
  },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
})
