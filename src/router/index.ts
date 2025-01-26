import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import UserManagementView from '@/views/UserManagementView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue')
    },
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('@/views/TestView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/production',
      name: 'production',
      component: () => import('@/views/production/ProductionLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'daily-plan',
          name: 'daily-plan',
          component: () => import('@/views/production/UnderDevelopmentView.vue')
        },
        {
          path: 'period-plan',
          name: 'period-plan',
          component: () => import('@/views/production/UnderDevelopmentView.vue')
        },
        {
          path: 'performance-input',
          name: 'performance-input',
          component: () => import('@/views/production/UnderDevelopmentView.vue')
        },
        {
          path: 'performance-status',
          name: 'performance-status',
          component: () => import('@/views/production/UnderDevelopmentView.vue')
        }
      ]
    },
    {
      path: '/documents',
      name: 'documents',
      component: () => import('@/views/documents/DocumentsLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'work-daily',
          name: 'work-daily',
          component: () => import('@/views/production/UnderDevelopmentView.vue')
        },
        {
          path: 'equipment-check',
          name: 'equipment-check',
          component: () => import('@/views/production/UnderDevelopmentView.vue')
        },
        {
          path: 'self-inspection',
          name: 'self-inspection',
          component: () => import('@/views/production/UnderDevelopmentView.vue')
        },
        {
          path: 'tool-change',
          name: 'tool-change',
          component: () => import('@/views/production/UnderDevelopmentView.vue')
        }
      ]
    },
    {
      path: '/basic',
      name: 'basic',
      component: () => import('@/views/basic/BasicLayout.vue'),
      meta: { requiresAuth: true, requiresSystemAdmin: true },
      children: [
        {
          path: 'equipment',
          name: 'equipment',
          component: () => import('@/views/basic/EquipmentView.vue')
        },
        {
          path: 'tools',
          name: 'tools',
          component: () => import('@/views/basic/ToolsView.vue')
        },
        {
          path: 'lines',
          name: 'lines',
          component: () => import('@/views/basic/LinesView.vue')
        },
        {
          path: 'processes',
          name: 'processes',
          component: () => import('@/views/basic/ProcessesView.vue')
        },
        {
          path: 'inspections',
          name: 'inspections',
          component: () => import('@/views/basic/InspectionsView.vue')
        }
      ]
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/user-management',
      name: 'user-management',
      component: UserManagementView,
      meta: { 
        requiresAuth: true,
        requiresSystemAdmin: true 
      }
    },
    {
      path: '/handover',
      children: [
        {
          path: 'daily',
          name: 'handover-daily',
          component: () => import('@/views/handover/DailyView.vue')
        },
        {
          path: 'history',
          name: 'handover-history',
          component: () => import('@/views/handover/HistoryView.vue')
        }
      ]
    },
    {
      path: '/equipment',
      name: 'equipment-root',
      component: () => import('@/views/equipment/EquipmentLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'list',
          name: 'equipment-list',
          component: () => import('@/views/equipment/ListView.vue')
        },
        {
          path: 'detail/:id',
          name: 'equipment-detail',
          component: () => import('@/views/equipment/DetailView.vue')
        },
        {
          path: 'edit/:id',
          name: 'equipment-edit',
          component: () => import('@/views/equipment/EditView.vue')
        },
        {
          path: 'maintenance',
          name: 'equipment-maintenance',
          component: () => import('@/views/equipment/MaintenanceView.vue')
        },
        {
          path: 'maintenance/other',
          name: 'equipment-maintenance-other',
          component: () => import('@/views/equipment/OtherMaintenanceView.vue')
        },
        {
          path: 'inspection',
          name: 'equipment-inspection',
          component: () => import('@/views/equipment/InspectionView.vue')
        },
        {
          path: 'inspection/completed',
          name: 'equipment-inspection-completed',
          component: () => import('@/views/equipment/CompletedInspectionView.vue')
        },
        {
          path: 'transfer',
          name: 'equipment-transfer',
          component: () => import('@/views/equipment/TransferView.vue')
        },
        {
          path: 'maintenance',
          name: 'equipment-maintenance',
          component: () => import('@/views/equipment/MaintenanceView.vue')
        }
      ]
    },
    {
      path: '/tools',
      name: 'tools-root',
      component: () => import('@/views/tools/ToolsLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'inventory',
          name: 'tools-inventory',
          component: () => import('@/views/tools/InventoryView.vue')
        },
        {
          path: 'transaction',
          name: 'tools-transaction',
          component: () => import('@/views/tools/TransactionView.vue')
        },
        {
          path: 'order',
          name: 'tools-order',
          component: () => import('@/views/tools/OrderView.vue')
        }
      ]
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated
  const user = authStore.user

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
    return
  }

  if (to.meta.requiresSystemAdmin && user?.role !== 'system_admin') {
    next('/')
    return
  }

  next()
})

export default router 