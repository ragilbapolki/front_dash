// src/api/module.js
import request from '@/utils/request'

// Get all modules with filters
export function getAdminModules(params) {
  return request({
    url: '/admin/modules',
    method: 'get',
    params
  })
}

// Get single module by ID
export function getAdminModule(id) {
  return request({
    url: `/admin/modules/${id}`,
    method: 'get'
  })
}

// Create new module
export function createAdminModule(data) {
  return request({
    url: '/admin/modules',
    method: 'post',
    data
  })
}

// Update existing module
export function updateAdminModule(id, data) {
  return request({
    url: `/admin/modules/${id}`,
    method: 'put',
    data
  })
}

// Delete module
export function deleteAdminModule(id) {
  return request({
    url: `/admin/modules/${id}`,
    method: 'delete'
  })
}

export function getModules(params) {
  return request({
    url: '/modules',
    method: 'get',
    params
  })
}

