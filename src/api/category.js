import request from '@/utils/request'

// ==============================
// Admin Categories API
// ==============================

// List semua kategori
export function getAdminCategories(params = {}) {
  return request({
    url: '/admin/categories',
    method: 'get',
    params
  })
}

// Detail kategori
export function getAdminCategory(id) {
  return request({
    url: `/admin/categories/${id}`,
    method: 'get'
  })
}

// Tambah kategori baru
export function createAdminCategory(data) {
  return request({
    url: '/admin/categories',
    method: 'post',
    data
  })
}

// Update kategori
export function updateAdminCategory(id, data) {
  return request({
    url: `/admin/categories/${id}`,
    method: 'put',
    data
  })
}

// Hapus kategori
export function deleteAdminCategory(id) {
  return request({
    url: `/admin/categories/${id}`,
    method: 'delete'
  })
}
