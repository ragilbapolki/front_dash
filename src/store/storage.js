import {
  tokenKey,
  sidebarOpenedCacheKey
} from './config.js'

export function getToken() {
  return localStorage.getItem(tokenKey)
}

export function setToken(token) {
  return localStorage.setItem(tokenKey, token)
}

export function removeToken() {
  return localStorage.removeItem(tokenKey)
}

export function getSidebarStatus() {
  const status = localStorage.getItem(sidebarOpenedCacheKey)
  return status ? !!+status : true
}

export function setSidebarStatus(status) {
  localStorage.setItem(sidebarOpenedCacheKey, status ? 1 : 0)
}
