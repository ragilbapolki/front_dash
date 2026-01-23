// src/api/division.js

import request from '@/utils/request'

export function getAdminDivisions(params) {
  return request({
    url: '/admin/divisions',
    method: 'get',
    params
  })
}

export function getDivisions(params) {
  return request({
    url: '/divisions',
    method: 'get',
    params
  })
}

export function getAdminDivision(id) {
  return request({
    url: `/admin/divisions/${id}`,
    method: 'get'
  })
}

export function createAdminDivision(data) {
  return request({
    url: '/admin/divisions',
    method: 'post',
    data
  })
}

export function updateAdminDivision(id, data) {
  return request({
    url: `/admin/divisions/${id}`,
    method: 'put',
    data
  })
}

export function deleteAdminDivision(id) {
  return request({
    url: `/admin/divisions/${id}`,
    method: 'delete'
  })
}
