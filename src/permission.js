import router from './router'
import { asyncRoutes } from './router'
import { ctx, dispatch } from './store'
import keycloak from '@/keycloak'
import NProgress from 'nprogress'
import { ElMessage } from 'element-plus'
import 'nprogress/nprogress.css'
import axios from 'axios'

NProgress.configure({ showSpinner: false })

const whiteList = ['/', '/404', '/403', '/articlesList', '/articles']
const publicRoutePatterns = ['/articles/', '/author/', '/articlesList']

function isPublicRoute(path) {
  if (whiteList.includes(path)) return true
  return publicRoutePatterns.some(pattern => path.startsWith(pattern))
}

/**
 * Filter routes berdasarkan permissions
 * Parent akan muncul jika punya permission ATAU punya child yang accessible
 */
function filterAsyncRoutes(routes, permissions) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }

    console.log('🔍 Checking route:', tmp.path)
    console.log('   Required permission:', tmp.meta?.permission)

    // Cek permission parent
    const hasParentPermission = !tmp.meta?.permission || permissions.includes(tmp.meta.permission)
    console.log('   Has parent permission:', hasParentPermission)

    // Proses children recursively
    if (tmp.children && tmp.children.length > 0) {
      console.log('   Processing', tmp.children.length, 'children...')
      tmp.children = filterAsyncRoutes(tmp.children, permissions)
      console.log('   Children after filter:', tmp.children.length)

      // ✅ FIX: Update redirect ke first accessible child
      if (tmp.children.length > 0 && tmp.redirect) {
        const firstChild = tmp.children[0]
        if (firstChild.path) {
          // Handle nested path
          const childPath = firstChild.path.startsWith('/') ? firstChild.path : firstChild.path
          tmp.redirect = tmp.path + '/' + childPath
          console.log(`   🔄 Updated redirect to: ${tmp.redirect}`)
        }
      }
    }

    const hasAccessibleChildren = tmp.children && tmp.children.length > 0
    console.log('   Has accessible children:', hasAccessibleChildren)

    // Parent MASUK jika punya permission ATAU punya accessible children
    if (hasParentPermission || hasAccessibleChildren) {
      console.log('   ✅ ACCEPTED:', tmp.path)
      res.push(tmp)
    } else {
      console.log('   ❌ REJECTED:', tmp.path)
    }
  })

  console.log('📦 Total routes filtered:', res.length)
  return res
}

/**
 * Tambahkan routes dinamis ke router
 */
function addRoutes(routes) {
  console.log('\n➕ ===== ADDING ROUTES TO ROUTER =====')
  console.log('   Total routes to add:', routes.length)

  routes.forEach(route => {
    console.log('\n   📍 Adding route:', route.path)

    try {
      router.addRoute(route)
      console.log('      ✅ Successfully added:', route.path)

      // Log children untuk debug
      if (route.children && route.children.length > 0) {
        console.log('      Children:')
        route.children.forEach(child => {
          const childFullPath = route.path + '/' + child.path
          console.log('         -', childFullPath, child.name ? `(${child.name})` : '')
        })
      }
    } catch (error) {
      console.error('      ❌ Failed to add route:', route.path, error)
    }
  })

  // ⚠️ PENTING: 404 catch-all harus di akhir setelah semua routes
  console.log('\n   📍 Adding 404 catch-all route')
  router.addRoute({
    path: '/:pathMatch(.*)*',
    redirect: '/404',
    hidden: true
  })

  console.log('\n📋 ===== ROUTER STATUS =====')
  console.log('   Total registered routes:', router.getRoutes().length)
  console.log('   All routes:')
  router.getRoutes().forEach(r => {
    if (!r.path.includes('pathMatch')) {
      console.log('      -', r.path, r.name ? `(${r.name})` : '')
    }
  })
  console.log('================================\n')
}

/**
 * Verify user dari Laravel berdasarkan Keycloak
 */
async function verifyKeycloakUser() {
  const tokenParsed = keycloak.tokenParsed

  const { data } = await axios.post('/api/auth/keycloak/verify', {
    keycloak_sub: keycloak.subject,
    email: tokenParsed.email,
    name: tokenParsed.name,
    preferred_username: tokenParsed.preferred_username,
    realm_roles: tokenParsed.realm_access?.roles || []
  })

  if (!data.success) {
    throw new Error(data.message)
  }

  return data.data
}

/**
 * Main Navigation Guard
 */
router.beforeEach(async (to, from, next) => {
  NProgress.start()

  console.log('\n🚦 ===== NAVIGATION =====')
  console.log('   From:', from.path)
  console.log('   To:', to.path)
  console.log('   Routes loaded?', ctx.routesLoaded)

  // Set document title
  document.title = to.meta.title
    ? `${to.meta.title} - WISMILAK Knowledge Base`
    : 'WISMILAK Knowledge Base'

  // ❌ CRITICAL: Jika navigasi ke 404 tapi routes belum loaded, tunggu
  if (to.path === '/404' && !ctx.routesLoaded && keycloak.authenticated) {
    console.warn('⚠️ Intercepting 404 navigation - routes not loaded yet')
    // Biarkan proses continue untuk load routes
  }

  // Cek Keycloak authenticated
  if (!keycloak.authenticated) {
    console.log('   User not authenticated')

    // Kalau halaman public, boleh akses
    if (isPublicRoute(to.path) && to.path !== '/') {
      console.log('   ✅ Public route - allowing access')
      next()
      NProgress.done()
      return
    }

    // Kalau bukan public, redirect ke Keycloak login
    console.log('   🔐 Redirecting to Keycloak login')
    keycloak.login({
      redirectUri: window.location.origin + to.fullPath
    })
    NProgress.done()
    return
  }

  console.log('   ✅ User authenticated')

  // User sudah login Keycloak
  try {
    // Cek apakah sudah punya user info dan routes sudah di-load
    if (!ctx.userInfo || !ctx.userInfo.permissions || !ctx.routesLoaded) {
      console.log('\n🔄 ===== LOADING USER DATA & ROUTES =====')

      // Ambil data user dari backend
      const userData = await verifyKeycloakUser()
      console.log('   User data loaded:', userData.name)

      // Simpan user info ke store
      dispatch.user.saveInfo({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        permissions: userData.permissions,
      })

      console.log('   👤 User Permissions:', userData.permissions)

      // Filter routes berdasarkan permission
      const accessibleRoutes = filterAsyncRoutes(asyncRoutes, userData.permissions)

      console.log('\n🎯 ===== ACCESSIBLE ROUTES =====')
      console.log('   Total accessible routes:', accessibleRoutes.length)
      accessibleRoutes.forEach(route => {
        console.log('   -', route.path, `(${route.children?.length || 0} children)`)
      })

      // Tambahkan routes ke router
      addRoutes(accessibleRoutes)

      // Simpan ke store
      ctx.accessibleRoutes = accessibleRoutes
      ctx.routesLoaded = true

      console.log('✅ Routes loaded and saved to store')

      // ===== HANDLE NAVIGATION TARGET =====
      let targetPath = to.path

      // 1. Handle root/admin paths - redirect ke default route
      if (to.path === '/' || to.path === '/admin' || to.path === '/admin/dashboard') {
        targetPath = userData.default_route || '/admin/keycloak-mappings/list'
        console.log('\n🔄 Root path detected, redirecting to:', targetPath)

        next({ path: targetPath, replace: true })
        NProgress.done()
        return
      }

      // 2. Handle 404 navigation - redirect ke first accessible route
      if (to.path === '/404' || to.path.includes('404')) {
        console.log('\n⚠️ 404 path detected after loading routes')

        const firstRoute = accessibleRoutes[0]
        if (firstRoute?.children?.[0]) {
          targetPath = firstRoute.path + '/' + firstRoute.children[0].path
          console.log('   Redirecting to first accessible route:', targetPath)
        } else if (firstRoute?.path) {
          targetPath = firstRoute.path
          console.log('   Redirecting to first route:', targetPath)
        } else {
          targetPath = '/'
          console.log('   No accessible routes, redirecting to home')
        }

        next({ path: targetPath, replace: true })
        NProgress.done()
        return
      }

      // 3. Verify target route exists
      const resolved = router.resolve(targetPath)
      const routeExists = resolved.matched.length > 0

      console.log('\n🎯 Verifying target route:', targetPath)
      console.log('   Route exists:', routeExists)
      console.log('   Matched routes:', resolved.matched.length)

      if (!routeExists) {
        console.warn('   ⚠️ Target route NOT FOUND:', targetPath)

        // Fallback ke first accessible route
        const firstRoute = accessibleRoutes[0]
        if (firstRoute?.children?.[0]) {
          const fallbackPath = firstRoute.path + '/' + firstRoute.children[0].path
          console.log('   🔄 Redirecting to first accessible route:', fallbackPath)
          next({ path: fallbackPath, replace: true })
        } else {
          console.log('   ❌ No accessible routes, redirecting to 403')
          next({ path: '/403', replace: true })
        }
        NProgress.done()
        return
      }

      // 4. Re-navigate dengan replace untuk apply new routes
      console.log('   ✅ Target route valid, re-navigating...')
      next({ ...to, replace: true })
      NProgress.done()
      return
    }

    // ===== ROUTES SUDAH DI-LOAD - CHECK PERMISSION =====
    console.log('\n✅ Routes already loaded, checking permission...')

    // Cek permission untuk route yang memerlukan permission
    if (to.meta.permission) {
      const userPermissions = ctx.userInfo.permissions || []
      const hasPermission = userPermissions.includes(to.meta.permission)

      console.log('   Required permission:', to.meta.permission)
      console.log('   User has permission:', hasPermission)

      if (!hasPermission) {
        console.warn('   ❌ Permission denied!')
        ElMessage.error('Anda tidak memiliki akses ke halaman ini')
        next('/403')
        NProgress.done()
        return
      }
    }

    console.log('   ✅ Permission check passed')
    next()

  } catch (error) {
    console.error('\n❌ ===== PERMISSION ERROR =====')
    console.error('   Error:', error.message)
    console.error('   Details:', error.response?.data)
    console.error('   Stack:', error.stack)

    // Tampilkan error message
    const errorMessage = error.response?.data?.message || error.message || 'Gagal memverifikasi user'
    ElMessage.error(errorMessage)

    // Clear user data
    dispatch.user.removeInfo()
    ctx.accessibleRoutes = []
    ctx.routesLoaded = false

    console.log('   Redirecting to 403')
    next('/403')
    NProgress.done()
  }
})

router.afterEach(() => {
  NProgress.done()
  console.log('===== NAVIGATION COMPLETE =====\n')
})
