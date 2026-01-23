<!-- ArticleView.vue -->
<template>
  <div class="app-container">
    <!-- Header -->
    <div class="page-header">
      <el-row justify="space-between" align="middle">
        <el-col>
          <h1 class="page-title">Article Details</h1>
          <p class="page-subtitle" v-if="article.title">
            {{ article.title }}
          </p>
        </el-col>
        <el-col :span="6" style="text-align: right;">
          <el-button @click="goBack" size="default">
            <el-icon><ArrowLeft /></el-icon>
            Back to List
          </el-button>
          <el-button type="primary" @click="handleEdit" size="default">
            <el-icon><Edit /></el-icon>
            Edit Article
          </el-button>
        </el-col>
      </el-row>
    </div>

    <!-- Article Content -->
    <el-row :gutter="24" v-loading="loading">
      <!-- Main Content -->
      <el-col :span="16">
        <el-card class="article-card" shadow="always">
          <!-- Article Header -->
          <div class="article-header">
            <h1 class="article-title">{{ article.title }}</h1>

            <div class="article-meta">
              <el-tag
                :type="getTypeTagType(article.type)"
                size="large"
                class="type-tag"
              >
                {{ article.type }}
              </el-tag>

              <el-tag
                :type="article.status === 'published' ? 'success' : 'warning'"
                size="large"
                class="status-tag"
              >
                <el-icon v-if="article.status === 'published'"><Check /></el-icon>
                <el-icon v-else><Document /></el-icon>
                {{ article.status }}
              </el-tag>
            </div>

            <div class="article-description" v-if="article.description">
              <p>{{ article.description }}</p>
            </div>
          </div>

          <!-- Primary Image -->
          <div class="primary-image" v-if="article.primary_image">
            <img
              :src="article.primary_image"
              :alt="article.title"
              class="featured-image"
            />
          </div>

          <!-- Article Content -->
          <div class="article-content">
            <div class="content-wrapper" v-html="article.content"></div>
          </div>

          <!-- Gallery Preview -->
          <div class="gallery-section" v-if="galleryImages.length > 0">
            <el-divider content-position="left">
              <h3>Gallery ({{ galleryImages.length }} images)</h3>
            </el-divider>

            <div class="gallery-grid">
              <div
                v-for="image in galleryImages"
                :key="image.id"
                class="gallery-thumb"
                @click="previewImage(image)"
              >
                <img
                  :src="image.url || image.path"
                  :alt="image.alt_text"
                  class="thumb-image"
                />
                <div class="thumb-overlay">
                  <el-icon><ZoomIn /></el-icon>
                </div>
                <div class="thumb-info" v-if="image.is_primary">
                  <el-tag type="success" size="small">
                    <el-icon><Star /></el-icon>
                    Primary
                  </el-tag>
                </div>
              </div>
            </div>

            <div class="gallery-actions">
              <el-button type="primary" @click="goToGallery">
                <el-icon><Picture /></el-icon>
                Manage Gallery
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- Sidebar -->
      <el-col :span="8">
        <el-card class="info-card" shadow="always">
          <template #header>
            <div class="card-header">
              <span>Article Information</span>
            </div>
          </template>

          <div class="info-section">
            <div class="info-item">
              <span class="info-label">ID:</span>
              <span class="info-value">{{ article.id }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">Category:</span>
              <span class="info-value">
                <el-tag v-if="article.category" type="info">
                  {{ article.category.name }}
                </el-tag>
                <span v-else class="text-muted">No Category</span>
              </span>
            </div>

            <div class="info-item">
              <span class="info-label">Author:</span>
              <span class="info-value">{{ article.user?.name || 'Unknown' }}</span>
            </div>

            <div class="info-item" v-if="article.document_type">
              <span class="info-label">Document Type:</span>
              <span class="info-value">{{ article.document_type }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">Created:</span>
              <span class="info-value">{{ formatDate(article.created_at) }}</span>
            </div>

            <div class="info-item" v-if="article.published_at">
              <span class="info-label">Published:</span>
              <span class="info-value">{{ formatDate(article.published_at) }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">Last Updated:</span>
              <span class="info-value">{{ formatDate(article.updated_at) }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">Gallery Images:</span>
              <span class="info-value">
                <el-tag type="info">{{ article.gallery_count || 0 }} images</el-tag>
              </span>
            </div>

            <div class="info-item" v-if="article.views_count">
              <span class="info-label">Views:</span>
              <span class="info-value">
                <el-tag type="success">{{ article.views_count }} views</el-tag>
              </span>
            </div>
          </div>
        </el-card>

        <!-- Quick Actions Card -->
        <el-card class="actions-card" shadow="always">
          <template #header>
            <div class="card-header">
              <span>Quick Actions</span>
            </div>
          </template>

          <div class="action-buttons">
            <el-button type="primary" @click="handleEdit" block>
              <el-icon><Edit /></el-icon>
              Edit Article
            </el-button>

            <el-button type="info" @click="goToGallery" block>
              <el-icon><Picture /></el-icon>
              Manage Gallery
            </el-button>

            <el-button
              :type="article.status === 'published' ? 'warning' : 'success'"
              @click="toggleStatus"
              :loading="statusLoading"
              block
            >
              <el-icon v-if="article.status === 'published'"><Hide /></el-icon>
              <el-icon v-else><View /></el-icon>
              {{ article.status === 'published' ? 'Set as Draft' : 'Publish' }}
            </el-button>

            <el-button type="danger" @click="handleDelete" block>
              <el-icon><Delete /></el-icon>
              Delete Article
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Image Preview Dialog -->
    <el-dialog
      v-model="previewVisible"
      title="Image Preview"
      width="80%"
      :before-close="closePreview"
      append-to-body
    >
      <div class="preview-container" v-if="currentPreview.url">
        <img
          :src="currentPreview.url || currentPreview.path"
          :alt="currentPreview.alt_text"
          class="preview-image"
        />
        <div class="preview-info" v-if="currentPreview.alt_text || currentPreview.caption">
          <h3 v-if="currentPreview.alt_text">{{ currentPreview.alt_text }}</h3>
          <p v-if="currentPreview.caption">{{ currentPreview.caption }}</p>
        </div>
      </div>
    </el-dialog>

    <!-- Delete Confirmation Dialog -->
    <el-dialog
      title="Delete Confirmation"
      v-model="deleteDialogVisible"
      width="400px"
    >
      <div class="delete-dialog-content">
        <div class="warning-icon">
          <el-icon size="48" color="#E6A23C">
            <WarningFilled />
          </el-icon>
        </div>
        <div class="warning-text">
          <p>Are you sure you want to delete this article?</p>
          <p><strong>"{{ article.title }}"</strong></p>
          <p class="warning-note">This action cannot be undone and will also delete all associated gallery images.</p>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">Cancel</el-button>
          <el-button type="danger" @click="confirmDelete" :loading="deleteLoading">
            Delete
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft, Edit, Check, Document, ZoomIn, Star, Picture,
  Hide, View, Delete, WarningFilled
} from '@element-plus/icons-vue'
import { getAdminArticle, updateAdminArticle, deleteAdminArticle } from '@/api/article'
import { getArticleGallery } from '@/api/article'

const route = useRoute()
const router = useRouter()

// State
const loading = ref(false)
const statusLoading = ref(false)
const deleteLoading = ref(false)
const deleteDialogVisible = ref(false)
const previewVisible = ref(false)
const currentPreview = ref({})
const galleryImages = ref([])

// Article data
const article = reactive({
  id: null,
  title: '',
  description: '',
  content: '',
  type: '',
  status: '',
  category: null,
  user: null,
  document_type: '',
  gallery_count: 0,
  views_count: 0,
  primary_image: null,
  created_at: null,
  updated_at: null,
  published_at: null
})

// Methods
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getTypeTagType = (type) => {
  const typeMap = {
    'SOP': 'primary',
    'Kebijakan': 'success',
    'Panduan': 'info'
  }
  return typeMap[type] || 'default'
}

const goBack = () => {
  router.push('/admin/articles/list')
}

const handleEdit = () => {
  router.push(`/admin/articles/edit/${article.id}`)
}

const goToGallery = () => {
  router.push(`/admin/articles/${article.id}/gallery`)
}

const previewImage = (image) => {
  currentPreview.value = { ...image }
  previewVisible.value = true
}

const closePreview = () => {
  previewVisible.value = false
  currentPreview.value = {}
}

const toggleStatus = async () => {
  statusLoading.value = true

  try {
    const newStatus = article.status === 'published' ? 'draft' : 'published'

    const response = await updateAdminArticle(article.id, {
      title: article.title,
      description: article.description,
      content: article.content,
      type: article.type,
      category_id: article.category?.id,
      status: newStatus,
      document_type: article.document_type
    })

    if (response.success !== false) {
      article.status = newStatus
      ElMessage.success(`Article ${newStatus === 'published' ? 'published' : 'set as draft'} successfully`)

      // Refresh article data
      await fetchArticle()
    } else {
      ElMessage.error(response.message || 'Failed to update article status')
    }
  } catch (error) {
    console.error('Status update error:', error)
    ElMessage.error('Failed to update article status')
  } finally {
    statusLoading.value = false
  }
}

const handleDelete = () => {
  deleteDialogVisible.value = true
}

const confirmDelete = async () => {
  deleteLoading.value = true

  try {
    const response = await deleteAdminArticle(article.id)

    if (response.success !== false) {
      ElMessage.success('Article deleted successfully')
      router.push('/admin/articles/list')
    } else {
      ElMessage.error(response.message || 'Failed to delete article')
    }
  } catch (error) {
    console.error('Delete error:', error)
    ElMessage.error('Failed to delete article')
  } finally {
    deleteLoading.value = false
    deleteDialogVisible.value = false
  }
}

const fetchArticle = async () => {
  loading.value = true

  try {
    const response = await getAdminArticle(route.params.id)

    if (response.success !== false) {
      const data = response.data || response
      Object.assign(article, {
        id: data.id,
        title: data.title || '',
        description: data.description || '',
        content: data.content || '',
        type: data.type || '',
        status: data.status || 'draft',
        category: data.category,
        user: data.user,
        document_type: data.document_type || '',
        gallery_count: data.gallery_count || 0,
        views_count: data.views_count || 0,
        primary_image: data.primary_image,
        created_at: data.created_at,
        updated_at: data.updated_at,
        published_at: data.published_at
      })
    } else {
      ElMessage.error('Article not found')
      router.push('/admin/articles/list')
    }
  } catch (error) {
    console.error('Fetch article error:', error)
    ElMessage.error('Failed to load article')
    router.push('/admin/articles/list')
  } finally {
    loading.value = false
  }
}

const fetchGallery = async () => {
  try {
    const response = await getArticleGallery(route.params.id)
    if (response.success !== false) {
      galleryImages.value = (response.data || response || []).slice(0, 6) // Show first 6 images
    }
  } catch (error) {
    console.error('Fetch gallery error:', error)
    // Show sample data for development
    galleryImages.value = [
      {
        id: 1,
        url: 'https://picsum.photos/300/200?random=1',
        alt_text: 'Sample image 1',
        is_primary: true
      },
      {
        id: 2,
        url: 'https://picsum.photos/300/200?random=2',
        alt_text: 'Sample image 2',
        is_primary: false
      }
    ]
  }
}

onMounted(async () => {
  await fetchArticle()
  await fetchGallery()
})
</script>

<style scoped>
.app-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.page-subtitle {
  margin: 8px 0 0 0;
  font-size: 16px;
  color: #606266;
  font-weight: 500;
}

.article-card,
.info-card,
.actions-card {
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.article-header {
  margin-bottom: 24px;
}

.article-title {
  font-size: 32px;
  font-weight: 700;
  color: #303133;
  line-height: 1.3;
  margin: 0 0 16px 0;
}

.article-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.type-tag,
.status-tag {
  font-weight: 500;
}

.article-description {
  color: #606266;
  font-size: 16px;
  line-height: 1.6;
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.primary-image {
  margin: 24px 0;
  text-align: center;
}

.featured-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.article-content {
  margin: 24px 0;
}

.content-wrapper {
  color: #303133;
  line-height: 1.8;
  font-size: 16px;
}

.content-wrapper :deep(h1),
.content-wrapper :deep(h2),
.content-wrapper :deep(h3) {
  color: #303133;
  margin-top: 24px;
  margin-bottom: 12px;
}

.content-wrapper :deep(p) {
  margin-bottom: 16px;
}

.content-wrapper :deep(ul),
.content-wrapper :deep(ol) {
  margin: 16px 0;
  padding-left: 24px;
}

.gallery-section {
  margin-top: 32px;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  margin: 16px 0;
}

.gallery-thumb {
  position: relative;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 4/3;
}

.thumb-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.thumb-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: white;
  font-size: 20px;
}

.gallery-thumb:hover .thumb-overlay {
  opacity: 1;
}

.gallery-thumb:hover .thumb-image {
  transform: scale(1.05);
}

.thumb-info {
  position: absolute;
  top: 4px;
  right: 4px;
}

.gallery-actions {
  text-align: center;
  margin-top: 16px;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 500;
  color: #606266;
  font-size: 14px;
  min-width: 100px;
}

.info-value {
  color: #303133;
  font-size: 14px;
  text-align: right;
  flex: 1;
  margin-left: 12px;
}

.text-muted {
  color: #909399;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preview-container {
  text-align: center;
}

.preview-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 8px;
  margin-bottom: 16px;
}

.preview-info h3 {
  margin: 0 0 8px 0;
  color: #303133;
}

.preview-info p {
  margin: 0;
  color: #606266;
}

/* Delete dialog styles */
.delete-dialog-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 0;
}

.warning-icon {
  flex-shrink: 0;
}

.warning-text {
  flex: 1;
}

.warning-text p {
  margin: 0 0 8px 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

.warning-text strong {
  color: #303133;
  font-weight: 600;
}

.warning-note {
  color: #909399;
  font-size: 12
}
</style>
