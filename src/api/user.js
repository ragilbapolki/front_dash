import request from '@/utils/request'

// login user
export function login(data) {
  return request({
    url: '/login',
    method: 'post',
    data
  })
}

// ambil info user
export function getInfo(token) {
  return request({
    url: '/user',
    method: 'get',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}

// logout
export function logout(token) {
  return request({
    url: '/logout',
    method: 'post',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}

export function getAdminUsers(params) {
  return request({
    url: '/admin/users',
    method: 'get',
    params
  })
}

// Get single user
export function getAdminUser(id) {
  return request({
    url: `/admin/users/${id}`,
    method: 'get'
  })
}

// Create user
export function createAdminUser(data) {
  return request({
    url: '/admin/users',
    method: 'post',
    data
  })
}

// Update user
export function updateAdminUser(id, data) {
  return request({
    url: `/admin/users/${id}`,
    method: 'put',
    data
  })
}

// Delete user
export function deleteAdminUser(id) {
  return request({
    url: `/admin/users/${id}`,
    method: 'delete'
  })
}

// Upload avatar
export function uploadUserAvatar(id, formData) {
  return request({
    url: `/admin/users/${id}/avatar`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// Delete avatar
export function deleteUserAvatar(id) {
  return request({
    url: `/admin/users/${id}/avatar`,
    method: 'delete'
  })
}

export function getPenulis() {
  return request({
    url: '/users/penulis',
    method: 'get'
  })
}

export function getPenulisShow(id) {
  return request({
    url: `/users/${id}`,
    method: 'get'
  })
}

export function getArtikelPenulisShow(id) {
  return request({
    url: `/users/${id}/articles`,
    method: 'get'
  })
}
