import 'normalize.css/normalize.css'
import '@/styles/main.scss'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import SvgIcon from './components/SvgIcon.vue'
import { ctx } from './store'
import './permission'

import keycloak from './keycloak'

async function enableMock() {
  if (import.meta.env.MODE !== 'development') return

  const { worker } = await import('../mocks/browser')
  return worker.start({
    serviceWorker: { url: '/mockServiceWorker.js' }
  })
}

let lastActivity = Date.now()
const IDLE_TIMEOUT = 30 * 60 * 1000

function updateActivity() {
  lastActivity = Date.now()
}
const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']
activityEvents.forEach(event => {
  document.addEventListener(event, updateActivity, true)
})

function checkIdleTimeout() {
  const idleTime = Date.now() - lastActivity

  if (idleTime >= IDLE_TIMEOUT) {
    console.warn('⏱️ User idle timeout - logging out')
    localStorage.removeItem('kc_token')
    localStorage.removeItem('kc_refresh')
    keycloak.logout({
      redirectUri: window.location.origin + '/'
    })
  }
}

async function bootstrap() {
  // await enableMock()
  const authenticated = await keycloak.init({
    onLoad: "login-required",
    checkLoginIframe: false,
  });

  if (authenticated) {
    console.log("🔓 Keycloak Authenticated");
    localStorage.setItem("kc_token", keycloak.token ?? "")
    localStorage.setItem("kc_refresh", keycloak.refreshToken ?? "")
  } else {
    console.log("❌ Not authenticated");
  }
  const app = createApp(App)

  app.use(router)
  app.use(ElementPlus)
  app.component('svg-icon', SvgIcon)
  app.provide('context', ctx)

  app.config.globalProperties.$keycloak = keycloak

  app.mount('#app')
  setInterval(async () => {
    checkIdleTimeout()

    const idleTime = Date.now() - lastActivity
    const isUserActive = idleTime < 5 * 60 * 1000 // 5 menit

    if (!isUserActive) {
      console.log('⏸️ User tidak aktif, skip token refresh')
      return
    }

    try {
      const refreshed = await keycloak.updateToken(30)
      if (refreshed) {
        console.log("🔁 Token diperbarui")
        localStorage.setItem("kc_token", keycloak.token ?? "")
        localStorage.setItem("kc_refresh", keycloak.refreshToken ?? "")
      }
    } catch (e) {
      console.error("❌ Gagal refresh token, redirect login...", e)
      localStorage.removeItem('kc_token')
      localStorage.removeItem('kc_refresh')
      keycloak.login()
    }
  }, 60000)

  setInterval(checkIdleTimeout, 60000)
}

bootstrap()
