import {createRouter, createWebHistory, RouteRecordRaw} from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/design'
  },
  {
    path: '/design',
    component: () => import('@/view/Design.vue')
  }
]

export default createRouter({
  routes: routes,
  history: createWebHistory()
})

