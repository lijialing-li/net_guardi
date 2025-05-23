import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import Dashboard from '../views/Dashboard.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: Dashboard,
        meta: { title: '仪表盘' }
      },
      {
        path: 'datascreen',
        name: 'datascreen',
        component: () => import('../views/DataScreen.vue'),
        meta: { title: '数据大屏' }
      },
      {
        path: 'devices',
        name: 'devices',
        component: () => import('../views/Devices.vue'),
        meta: { title: '设备管理' }
      },
      {
        path: 'overview',
        name: 'overview',
        component: () => import('../views/Overview.vue'),
        meta: { title: '全国站点' }
      },
      {
        path: 'list',
        name: 'list',
        component: () => import('../views/List.vue'),
        meta: { title: '设备列表' }
      },
      {
        path: 'category',
        name: 'category',
        component: () => import('../views/Category.vue'),
        meta: { title: '设备分类' }
      },
      {
        path: 'alerts',
        name: 'alerts',
        component: () => import('../views/Alerts.vue'),
        meta: { title: '告警中心' }
      },
      {
        path: 'reports',
        name: 'reports',
        component: () => import('../views/Reports.vue'),
        meta: { title: '分析报告' }
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('../views/Settings.vue'),
        meta: { title: '系统设置' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
