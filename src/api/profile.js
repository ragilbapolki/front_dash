// src/api/profile.js
import request from '@/utils/request'

export function getProfile() {
  return request({
    url: '/profile',
    method: 'get'
  })
}

export function updateProfile(data) {
  return request({
    url: '/profile',
    method: 'put',
    data
  })
}

export function updatePassword(data) {
  return request({
    url: '/profile/password',
    method: 'put',
    data
  })
}

export function uploadAvatar(file) {
  const formData = new FormData()
  formData.append('avatar', file)

  return request({
    url: '/profile/avatar',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function deleteAvatar() {
  return request({
    url: '/profile/avatar',
    method: 'delete'
  })
}

export function updateMoto(data) {
  return request({
    url: '/profile/moto',
    method: 'put',
    data
  })
}
