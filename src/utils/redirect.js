// utils/redirect.js

/**
 * Get the first accessible route based on user permissions
 */
export function getFirstAccessibleRoute(permissions) {
  const routePriorityMap = [
    // Dashboard routes (highest priority)
    { permission: 'view.dashboard', path: '/admin/dashboard' },

    // Marketing routes
    { permission: 'view.dashboard.marketing', path: '/dashboard/marketing/maps' },
    { permission: 'view.marketing.maps', path: '/dashboard/marketing/maps' },
    { permission: 'view.marketing.pareto', path: '/dashboard/marketing/pareto/area' },
    { permission: 'view.marketing.trend', path: '/dashboard/marketing/trend' },

    // User management
    { permission: 'view.users', path: '/admin/users/list' },

    // Category management
    { permission: 'view.categories', path: '/admin/categories/list' },

    // Module management
    { permission: 'view.modules', path: '/admin/module/list' },

    // Division management
    { permission: 'view.divisions', path: '/admin/divisi/list' },
  ]

  // Find first route that user has permission for
  for (const route of routePriorityMap) {
    if (permissions.includes(route.permission)) {
      return route.path
    }
  }

  // Default fallback - profile page
  return '/profile/me'
}

/**
 * Get user's home route based on their primary permission
 */
export function getUserHomeRoute(permissions = [], roles = []) {
  console.log('[getUserHomeRoute] Input - Permissions:', permissions, 'Roles:', roles)

  if (!permissions || permissions.length === 0) {
    console.warn('[getUserHomeRoute] No permissions, returning profile')
    return '/profile/me'
  }

  // Superadmin always goes to main dashboard
  if (roles.includes('superadmin') || roles.includes('admin')) {
    console.log('[getUserHomeRoute] Admin/Superadmin → /admin/dashboard')
    return '/admin/dashboard'
  }

  // Marketing staff
  if (permissions.includes('view.dashboard.marketing') || permissions.includes('view.marketing.maps')) {
    console.log('[getUserHomeRoute] Marketing → /dashboard/marketing/maps')
    return '/dashboard/marketing/maps'
  }

  // Dashboard access
  if (permissions.includes('view.dashboard')) {
    console.log('[getUserHomeRoute] Dashboard → /admin/dashboard')
    return '/admin/dashboard'
  }

  // Get first accessible route
  const route = getFirstAccessibleRoute(permissions)
  console.log('[getUserHomeRoute] First accessible → ', route)
  return route
}

/**
 * Build route priority list for navigation
 */
export function getAccessibleRoutes(permissions) {
  const routes = []

  const allRoutes = [
    { permission: 'view.dashboard', name: 'Dashboard', path: '/admin/dashboard', icon: 'DataAnalysis' },
    { permission: 'view.marketing.maps', name: 'Maps', path: '/dashboard/marketing/maps', icon: 'MapLocation' },
    { permission: 'view.marketing.pareto', name: 'Pareto', path: '/dashboard/marketing/pareto/area', icon: 'Histogram' },
    { permission: 'view.marketing.trend', name: 'Trend', path: '/dashboard/marketing/trend', icon: 'DataLine' },
    { permission: 'view.users', name: 'Users', path: '/admin/users/list', icon: 'User' },
    { permission: 'view.categories', name: 'Categories', path: '/admin/categories/list', icon: 'Grid' },
    { permission: 'view.modules', name: 'Modules', path: '/admin/module/list', icon: 'Grape' },
    { permission: 'view.divisions', name: 'Divisions', path: '/admin/divisi/list', icon: 'OfficeBuilding' },
  ]

  allRoutes.forEach(route => {
    if (permissions.includes(route.permission)) {
      routes.push(route)
    }
  })

  return routes
}
