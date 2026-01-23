// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'
import PublicHome from '@/views/public/home.vue'
import PublicArticleDetail from '@/views/public/ArticleDetail.vue'
import PublicAuthorProfile from '@/views/public/AuthorProfile.vue'
import PublicArticleList from '@/views/public/ArticleList.vue'

// Import icons - Tambahkan icon baru yang lebih menarik
import {
  DataAnalysis,
  DataLine,
  Document,
  DocumentCopy,
  Grape,
  Grid,
  Histogram,
  MapLocation,
  OfficeBuilding,
  User,
  TrendCharts,
  PieChart,
  Location,
  FolderOpened,
  Reading,
  Avatar,
  Postcard,
  Management,
  LocationFilled,
  Link,
  Shop
} from '@element-plus/icons-vue'

// Icon mapping - Tambahkan icon baru
export const iconMap = {
  DataAnalysis,
  DataLine,
  Document,
  DocumentCopy,
  Grape,
  Grid,
  Histogram,
  MapLocation,
  OfficeBuilding,
  User,
  TrendCharts,
  PieChart,
  Location,
  FolderOpened,
  Reading,
  Avatar,
  Postcard,
  Management
}

// Static routes (tidak perlu permission)
const constantRoutes = [
  {
    path: '/account/login',
    name: 'login',
    hidden: true,
    component: () => import('@/views/account/login.vue'),
  },
  {
    path: '/',
    name: 'Home',
    component: PublicHome,
    hidden: true,
    meta: {
      title: 'Home',
      requiresAuth: false
    }
  },
  {
    path: '/articlesList',
    name: 'PublicArticleList',
    component: PublicArticleList,
    hidden: true,
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/articles/:slug',
    name: 'ArticleDetail',
    component: PublicArticleDetail,
    hidden: true,
    props: true,
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/author/:id',
    name: 'AuthorProfile',
    component: PublicAuthorProfile,
    hidden: true,
    props: true,
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/404',
    component: () => import('@/views/404.vue'),
    hidden: true
  },
  {
    path: '/403',
    component: () => import('@/views/404.vue'),
    hidden: true,
    meta: {
      title: 'Access Denied'
    }
  },
]

export const asyncRoutes = [
  {
    path: '/admin',
    component: Layout,
    redirect: '/admin/dashboard',
    meta: {
      requiresAuth: true,
      permission: 'view.dashboard'
    },
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/admin/dashboard.vue'),
      meta: {
        title: 'Dashboard',
        icon: 'DataAnalysis', // 📊 Icon dashboard analytics
        keepAlive: true,
        affix: true,
        requiresAuth: true,
        permission: 'view.dashboard'
      }
    }]
  },
  {
    path: '/admin/keycloak-mappings',
    component: Layout,
    redirect: '/admin/keycloak-mappings/list',
    meta: {
      title: 'User Mapping',
      icon: 'Connection', // 🔗 Icon connection untuk mapping
      requiresAuth: true,
      permission: 'view.user.mappings'
    },
    children: [
      {
        path: 'list',
        name: 'UserMappingList',
        component: () => import('@/views/admin/keycloakMapping/UserMappingManagement.vue'),
        meta: {
          title: 'Keycloak User Mapping',
          icon: Link,
          requiresAuth: true,
          permission: 'view.user.mappings',
          breadcrumb: [
            { title: 'User Mapping', to: '/admin/keycloak-mappings/list' },
            { title: 'List' }
          ]
        }
      }
    ]
  },
  {
    path: '/dashboard/marketing',
    component: Layout,
    redirect: '/dashboard/marketing/maps',
    meta: {
      title: 'Marketing',
      icon: Grid,
      requiresAuth: true,
      permission: 'view.dashboard.marketing'
    },
    children: [
      {
        path: 'maps',
        name: 'Maps',
        component: () => import('@/views/dashboard/marketing/maps.vue'),
        meta: {
          title: 'Maps',
          icon: LocationFilled,
          permission: 'view.marketing.maps'
        }
      },
      {
        path: 'trend',
        name: 'Trend',
        component: () => import('@/views/dashboard/marketing/trend.vue'),
        meta: {
          title: 'Trend',
          icon: DataLine,
          permission: 'view.marketing.trend'
        }
      },
      {
        path: 'pareto',
        name: 'Pareto',
        redirect: '/dashboard/marketing/pareto/area',
        meta: {
          title: 'Pareto',
          icon: PieChart,
          permission: 'view.marketing.pareto'
        },
        children: [
          {
            path: 'area',
            name: 'ParetoArea',
            component: () => import('@/views/dashboard/marketing/pareto.vue'),
            meta: {
              title: 'Area',
              icon: Histogram,
              permission: 'view.marketing.pareto'
            }
          },
          {
            path: 'rayon',
            name: 'ParetoRayon',
            component: () => import('@/views/dashboard/marketing/pareto.vue'),
            meta: {
              title: 'Rayon',
              icon: Histogram,
              permission: 'view.marketing.pareto'
            }
          },
          {
            path: 'zona',
            name: 'ParetoZona',
            component: () => import('@/views/dashboard/marketing/pareto.vue'),
            meta: {
              title: 'Zona',
              icon: Histogram,
              permission: 'view.marketing.pareto'
            }
          }
        ]
      },
      {
        path: 'topGrosir',
        name: 'TopGrosir',
        component: () => import('@/views/dashboard/marketing/topGrosir.vue'),
        meta: {
          title: 'Top Grosir',
          icon: Shop,
          permission: 'view.marketing.top_grosir'
        }
      },
    ]
  },
  {
    path: '/admin/categories',
    component: Layout,
    redirect: '/admin/categories/list',
    meta: {
      title: 'Categories',
      icon: 'Grid', // 📱 Icon grid untuk categories
      requiresAuth: true,
      permission: 'view.categories'
    },
    children: [
      {
        path: 'list',
        name: 'CategoryList',
        component: () => import('@/views/admin/category/index.vue'),
        meta: {
          title: 'Kategori',
          icon: 'FolderOpened', // 📂 Icon folder terbuka
          permission: 'view.categories',
          breadcrumb: [
            { title: 'Categories', to: '/admin/categories/list' },
            { title: 'List' }
          ]
        }
      },
    ]
  },
  {
    path: '/admin/module',
    component: Layout,
    redirect: '/admin/module/list',
    meta: {
      title: 'Modules',
      icon: 'Reading', // 📖 Icon buku untuk modules
      requiresAuth: true,
      permission: 'view.modules'
    },
    children: [
      {
        path: 'list',
        name: 'ModuleList',
        component: () => import('@/views/admin/module/index.vue'),
        meta: {
          title: 'Modul',
          icon: 'Document', // 📄 Icon document
          permission: 'view.modules',
          breadcrumb: [
            { title: 'Modules', to: '/admin/module/list' },
            { title: 'List' }
          ]
        }
      },
    ]
  },
  {
    path: '/admin/divisi',
    component: Layout,
    redirect: '/admin/divisi/list',
    meta: {
      title: 'Division',
      icon: 'OfficeBuilding', // 🏢 Icon gedung kantor
      requiresAuth: true,
      permission: 'view.divisions'
    },
    children: [
      {
        path: 'list',
        name: 'DivisionList',
        component: () => import('@/views/admin/division/DivisionManagement.vue'),
        meta: {
          title: 'Divisi / Departemen',
          icon: 'Management', // 👥 Icon management
          permission: 'view.divisions',
          breadcrumb: [
            { title: 'Divisi', to: '/admin/division/list' },
            { title: 'List' }
          ]
        }
      },
    ]
  },
  {
    path: '/profile',
    component: Layout,
    redirect: '/profile/me',
    meta: {
      title: 'Profile',
      icon: 'Avatar', // 👤 Icon avatar untuk profile
      requiresAuth: true
    },
    hidden: true,
    children: [
      {
        path: 'me',
        name: 'MyProfile',
        component: () => import('@/views/admin/profile/MyProfile.vue'),
        meta: {
          title: 'My Profile',
          icon: 'User',
          requiresAuth: true
        }
      },
    ]
  },
  {
    path: '/admin/users',
    component: Layout,
    redirect: '/admin/users/list',
    meta: {
      title: 'Users',
      icon: 'User', // 👤 Icon user
      requiresAuth: true,
      permission: 'view.users'
    },
    children: [
      {
        path: 'list',
        name: 'UserList',
        component: () => import('@/views/admin/user/UserList.vue'),
        meta: {
          title: 'Users',
          icon: 'Avatar', // 👥 Icon avatar untuk user list
          requiresAuth: true,
          permission: 'view.users',
          breadcrumb: [
            { title: 'Users', to: '/admin/users/list' },
            { title: 'List' }
          ]
        }
      }
    ]
  },
  {
    path: '/admin/articles',
    component: Layout,
    redirect: '/admin/articles/list',
    meta: {
      title: 'Articles',
      icon: 'Postcard', // 📮 Icon postcard untuk articles
      requiresAuth: true,
      permission: 'view.articles'
    },
    children: [
      {
        path: 'list',
        name: 'AdminArticleList',
        component: () => import('@/views/admin/article/ArticleList.vue'),
        meta: {
          title: 'Article List',
          icon: 'DocumentCopy', // 📋 Icon document copy
          requiresAuth: true,
          permission: 'view.articles',
          breadcrumb: [
            { title: 'Articles', to: '/admin/articles/list' },
            { title: 'List' }
          ]
        }
      },
      {
        path: 'create',
        name: 'ArticleCreate',
        component: () => import('@/views/admin/article/ArticleForm.vue'),
        hidden: true,
        meta: {
          title: 'Create Article',
          requiresAuth: true,
          permission: 'create.articles',
          breadcrumb: [
            { title: 'Articles', to: '/admin/articles/list' },
            { title: 'Create' }
          ]
        }
      },
      {
        path: 'edit/:id',
        name: 'ArticleEdit',
        component: () => import('@/views/admin/article/ArticleForm.vue'),
        hidden: true,
        meta: {
          title: 'Edit Article',
          requiresAuth: true,
          permission: 'edit.articles',
          breadcrumb: [
            { title: 'Articles', to: '/admin/articles/list' },
            { title: 'Edit' }
          ]
        }
      },
      {
        path: 'view/:id',
        name: 'ArticleView',
        component: () => import('@/views/admin/article/ArticleView.vue'),
        hidden: true,
        meta: {
          title: 'View Article',
          requiresAuth: true,
          permission: 'view.articles',
          breadcrumb: [
            { title: 'Articles', to: '/admin/articles/list' },
            { title: 'View' }
          ]
        }
      },
      {
        path: ':id/gallery',
        name: 'ArticleGallery',
        component: () => import('@/views/admin/article/ArticleGallery.vue'),
        hidden: true,
        meta: {
          title: 'Article Gallery',
          requiresAuth: true,
          permission: 'view.articles',
          breadcrumb: [
            { title: 'Articles', to: '/admin/articles/list' },
            { title: 'Gallery' }
          ]
        }
      },
    ]
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_URL),
  routes: constantRoutes
})

export function resetRouter() {
  const newRouter = createRouter({
    history: createWebHistory(import.meta.env.VITE_BASE_URL),
    routes: constantRoutes
  })
  router.matcher = newRouter.matcher
}

export default router
