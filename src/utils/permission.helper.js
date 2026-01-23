// utils/permission.helper.js

export function hasPermission(userPermissions = [], routePermission) {
  if (!routePermission) return true

  return (
    userPermissions.includes(routePermission) ||
    userPermissions.some(p => routePermission.startsWith(p))
  )
}

export function getUserHomeRoute(permissions = [], roles = []) {
  // superadmin always admin
  if (roles.includes('superadmin')) return '/admin'

  if (permissions.includes('view.dashboard.sales')) return '/dashboard/sales'
  if (permissions.includes('view.dashboard.marketing')) return '/dashboard/marketing'
  if (permissions.includes('view.dashboard')) return '/dashboard'

  return '/dashboard'
}
