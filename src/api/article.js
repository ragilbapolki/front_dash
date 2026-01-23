// api/article.js
import request from '@/utils/request'

// Article CRUD operations
export function getAdminArticles(params) {
  return request({
    url: '/admin/articles',
    method: 'get',
    params
  })
}

export function getEditorArticles(params) {
  return request({
    url: '/editor/articles',
    method: 'get',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    params,
  })
}

export function getAdminArticle(id) {
  return request({
    url: `/admin/articles/${id}`,
    method: 'get'
  })
}

export function createAdminArticle(data) {
  return request({
    url: '/admin/articles',
    method: 'post',
    data
  })
}

export function updateAdminArticle(id, data) {
  return request({
    url: `/admin/articles/${id}`,
    method: 'post',
    data
  })
}

export function deleteAdminArticle(id) {
  return request({
    url: `/admin/articles/${id}`,
    method: 'delete'
  })
}

// Gallery operations
export function getArticleGallery(articleId) {
  return request({
    url: `/admin/articles/${articleId}/gallery`,
    method: 'get'
  })
}

export function updateArticleImage(articleId, imageId, data) {
  return request({
    url: `/admin/articles/${articleId}/gallery/${imageId}`,
    method: 'put',
    data
  })
}

export function setArticleImagePrimary(articleId, imageId) {
  return request({
    url: `/admin/articles/${articleId}/gallery/${imageId}/set-primary`,
    method: 'patch'
  })
}

// Tambahkan fungsi upload image
export const uploadArticleImage = (formData) => {
  return request.post('/admin/articles/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// Tambahkan fungsi delete image
export const deleteArticleImage = (imageId) => {
  return request.delete(`/admin/articles/images/${imageId}`)
}

// Fungsi untuk get images artikel (jika diperlukan)
export const getArticleImages = (articleId) => {
  return request.get(`/admin/articles/${articleId}/images`)
}

export function linkTemporaryImagesToArticle (articleId, sessionKey) {
  return request({
    url: '/admin/articles/gallery/link-temporary',
    method: 'post',
    data: {
      article_id: articleId,
      session_key: sessionKey
    }
  })
}

export function cleanupTemporaryImages (sessionKey) {
  return request({
    url: '/editor/articles/gallery/cleanup-temporary',
    method: 'post',
    data: {
      session_key: sessionKey
    }
  })
}

export function getTemporaryGallery (sessionKey) {
  return request({
    url: '/admin/articles/gallery/temporary',
    method: 'GET',
    data: {
      session_key: sessionKey
    }
  })
}

export function fetchArticleImages (articleId) {
  return request({
    url: `/admin/articles/${articleId}/gallery`,
    method: 'GET',
  })
}

export function getArticles(params) {
  return request({
    url: '/articles',
    method: 'get',
    params
  })
}

export function getArticle(slug) {
  return request({
    url: `/articles/${slug}`,
    method: 'get',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  })
}

export function getCategories() {
  return request({
    url: '/categories',
    method: 'get'
  })
}

export function getCategory(slug) {
  return request({
    url: `/categories/${slug}`,
    method: 'get'
  })
}

export function incrementViewCount(id) {
  return request({
    url: `/articles/${id}/view`,
    method: 'post'
  })
}

export function rateArticle(id, rating) {
  return request({
    url: `/articles/${id}/rate`,
    method: 'post',
    data: { rating }
  })
}

export function getArticleBySlug(slug) {
  return request({
    url: `/view/articles/${slug}`,
    method: 'get'
  })
}

export function getArticleGalleryBySlug(articleId) {
  return request({
    url: `/view/articles/${articleId}/gallery`,
    method: 'get'
  })
}

export function getCategoryBySlug(slug) {
  return request({
    url: `/categories/${slug}`,
    method: 'get'
  })
}

export const uploadAttachment = (formData) => {
  return request({
    url: '/admin/articles/attachment/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export const deleteAttachment = (articleId) => {
  return request({
    url: `/admin/articles/${articleId}/attachment`,
    method: 'delete'
  })
}

export const downloadAttachment = (articleId) => {
  return request({
    url: `/admin/articles/${articleId}/download`,
    method: 'get',
    responseType: 'blob'
  })
}

export const updateAdminArticleImage = (id, data) => {
  return request({
    url: `/admin/articles/images/${id}`,
    method: 'PUT',
    data
  })
}

export function createEditorArticle(data) {
  return request({
    url: '/editor/articles',
    method: 'post',
    data
  })
}

export function getEditoArticles(id) {
  return request({
    url: `/articles/${id}`,
    method: 'get'
  })
}

export function updateEditorArticle(id, data) {
  return request({
    url: `/editor/articles/${id}`,
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function bulkDeleteArticleImages(ids) {
  return request({
    url: '/articles/images/bulk-delete',
    method: 'post',
    data: { ids }
  })
}
