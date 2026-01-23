// src/api/keycloakMapping.js

import request from '@/utils/request'

/**
 * Get all user mappings
 */
export function getUserMappings(params) {
  return request({
    url: '/admin/keycloak-mappings',
    method: 'get',
    params
  })
}

/**
 * Get single user mapping
 */
export function getUserMapping(id) {
  return request({
    url: `/admin/keycloak-mappings/${id}`,
    method: 'get'
  })
}

/**
 * Create user mapping
 */
export function createUserMapping(data) {
  return request({
    url: '/admin/keycloak-mappings',
    method: 'post',
    data
  })
}

/**
 * Update user mapping
 */
export function updateUserMapping(id, data) {
  return request({
    url: `/admin/keycloak-mappings/${id}`,
    method: 'put',
    data
  })
}

/**
 * Delete user mapping
 */
export function deleteUserMapping(id) {
  return request({
    url: `/admin/keycloak-mappings/${id}`,
    method: 'delete'
  })
}

/**
 * Get internal users for mapping
 */
export function getInternalUsers() {
  return request({
    url: '/admin/keycloak-mappings/internal-users',
    method: 'get'
  })
}

/**
 * Sync user mapping
 */
export function syncUserMapping(id) {
  return request({
    url: `/admin/keycloak-mappings/${id}/sync`,
    method: 'post'
  })
}
