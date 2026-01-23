<template>
  <div class="app-container">
    <!-- Header -->
    <div class="page-header">
      <el-row justify="space-between" align="middle">
        <el-col>
          <h1 class="page-title">Gallery Management</h1>
          <p class="page-subtitle" v-if="article.title">
            Article: {{ article.title }}
          </p>
        </el-col>
        <el-col :span="6" style="text-align: right;">
          <el-button @click="goBack" size="default">
            <el-icon><ArrowLeft /></el-icon>
            Back to Article
          </el-button>
        </el-col>
      </el-row>
    </div>

    <!-- Upload Section -->
    <el-card class="upload-card" shadow="always">
      <template #header>
        <div class="card-header">
          <span>Upload New Images</span>
          <el-text size="small" type="info">
            Supported formats: JPG, PNG, GIF, WebP (Max: 5MB each)
          </el-text>
        </div>
      </template>

      <el-upload
        ref="uploadRef"
        class="upload-demo"
        drag
        :action="uploadAction"
        :headers="uploadHeaders"
        :data="uploadData"
        multiple
        :before-upload="beforeUpload"
        :on-success="onUploadSuccess"
        :on-error="onUploadError"
        :on-progress="onUploadProgress"
        :file-list="fileList"
        list-type="picture-card"
        accept="image/*"
      >
        <div class="upload-dragger">
          <el-icon class="upload-icon"><UploadFilled /></el-icon>
          <div class="upload-text">
            <p>Drop images here or <em>click to upload</em></p>
            <p class="upload-hint">Multiple files supported</p>
          </div>
        </div>
      </el-upload>
    </el-card>

    <!-- Gallery Grid -->
    <el-card class="gallery-card" shadow="always" v-loading="galleryLoading">
      <template #header>
        <div class="card-header">
          <span>Gallery Images ({{ gallery.length }})</span>
          <div class="header-actions">
            <el-button
              type="danger"
              size="small"
              :disabled="selectedImages.length === 0"
              @click="bulkDelete"
            >
              <el-icon><Delete /></el-icon>
              Delete Selected ({{ selectedImages.length }})
            </el-button>
            <el-button type="primary" size="small" @click="refreshGallery">
              <el-icon><Refresh /></el-icon>
              Refresh
            </el-button>
          </div>
        </div>
      </template>

      <div class="gallery-grid" v-if="gallery.length > 0">
        <div
          v-for="image in gallery"
          :key="image.id"
          class="gallery-item"
          :class="{ 'selected': selectedImages.includes(image.id) }"
        >
          <!-- Selection Checkbox -->
          <div class="image-checkbox">
            <el-checkbox
              v-model="selectedImages"
              :label="image.id"
              size="large"
            />
          </div>

          <!-- Image -->
          <div class="image-container" @click="previewImage(image)">
            <img
              :src="image.url || image.path"
              :alt="image.alt_text || 'Gallery image'"
              class="gallery-image"
              loading="lazy"
            />
            <div class="image-overlay">
              <el-button type="primary" size="small" circle>
                <el-icon><ZoomIn /></el-icon>
              </el-button>
            </div>
          </div>

          <!-- Image Info -->
          <div class="image-info">
            <el-input
              v-model="image.alt_text"
              placeholder="Alt text"
              size="small"
              @blur="updateImageInfo(image)"
              class="alt-input"
            />
            <el-input
              v-model="image.caption"
              placeholder="Caption"
              size="small"
              @blur="updateImageInfo(image)"
              class="caption-input"
            />
            <div class="image-meta">
              <el-text size="small" type="info">
                {{ formatFileSize(image.size) }} • {{ formatDate(image.created_at) }}
              </el-text>
            </div>
          </div>

          <!-- Actions -->
          <div class="image-actions">
            <el-button
              type="primary"
              size="small"
              @click="setAsPrimary(image)"
              :disabled="image.is_primary"
            >
              <el-icon><Star /></el-icon>
              {{ image.is_primary ? 'Primary' : 'Set Primary' }}
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="deleteImage(image)"
            >
              <el-icon><Delete /></el-icon>
              Delete
            </el-button>
          </div>
        </div>
      </div>

      <el-empty v-else description="No images uploaded yet" class="empty-gallery">
        <el-button type="primary" @click="scrollToUpload">
          <el-icon><Plus /></el-icon>
          Upload First Image
        </el-button>
      </el-empty>
    </el-card>

    <!-- Image Preview Dialog -->
    <el-dialog
      v-model="previewVisible"
      title="Image Preview"
      width="80%"
      :before-close="closePreview"
      append-to-body
    >
      <div class="preview-container" v-if="previewImage">
        <img
          :src="currentPreview.url || currentPreview.path"
          :alt="currentPreview.alt_text"
          class="preview-image"
        />
        <div class="preview-info">
          <h3>{{ currentPreview.alt_text || 'Untitled' }}</h3>
          <p v-if="currentPreview.caption">{{ currentPreview.caption }}</p>
          <div class="preview-meta">
            <el-tag v-if="currentPreview.is_primary" type="success" size="small">
              <el-icon><Star /></el-icon>
              Primary Image
            </el-tag>
            <el-text size="small" type="info">
              {{ formatFileSize(currentPreview.size) }} •
              {{ formatDate(currentPreview.created_at) }}
            </el-text>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- Delete Confirmation Dialog -->
    <el-dialog
      title="Delete Confirmation"
      v-model="deleteDialogVisible"
      width="400px"
      :before-close="handleDeleteDialogClose"
    >
      <div class="delete-dialog-content">
        <div class="warning-icon">
          <el-icon size="48" color="#E6A23C">
            <WarningFilled />
          </el-icon>
        </div>
        <div class="warning-text">
          <p v-if="isMultipleDelete">
            Are you sure you want to delete {{ selectedImages.length }} selected images?
          </p>
          <p v-else>
            Are you sure you want to delete this image?
          </p>
          <p class="warning-note">This action cannot be undone.</p>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleDeleteDialogClose" size="default">
            Cancel
          </el-button>
          <el-button
            type="danger"
            @click="confirmDelete"
            :loading="deleteLoading"
            size="default"
          >
            Delete {{ isMultipleDelete ? `(${selectedImages.length})` : '' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft, UploadFilled, Delete, Refresh, ZoomIn,
  Star, Plus, WarningFilled
} from '@element-plus/icons-vue'
import {
  getAdminArticle,
  getArticleGallery,
  uploadArticleImage,
  updateArticleImage,
  deleteArticleImage,
  bulkDeleteArticleImages,
  setArticleImagePrimary
} from '@/api/article'

const route = useRoute()
const router = useRouter()

// Refs
const uploadRef = ref()

// State
const galleryLoading = ref(false)
const deleteLoading = ref(false)
const fileList = ref([])
const selectedImages = ref([])

// Dialogs
const previewVisible = ref(false)
const deleteDialogVisible = ref(false)
const currentPreview = ref({})
const imageToDelete = ref(null)
const isMultipleDelete = ref(false)

// Data
const article = reactive({
  id: null,
  title: '',
  gallery_count: 0
})

const gallery = ref([])

// Computed
const articleId = computed(() => route.params.id)
const uploadAction = computed(() => `/api/admin/articles/${articleId.value}/gallery`)
const uploadHeaders = computed(() => ({
  'Authorization': `Bearer ${getAuthToken()}`,
  'Accept': 'application/json'
}))
const uploadData = computed(() => ({
  article_id: articleId.value
}))

// Methods
const getAuthToken = () => {
  // Get token from your auth store/localStorage
  return localStorage.getItem('auth_token') || ''
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const goBack = () => {
  router.push(`/admin/articles/edit/${articleId.value}`)
}

const scrollToUpload = () => {
  document.querySelector('.upload-card').scrollIntoView({
    behavior: 'smooth'
  })
}

// Fetch article info
const fetchArticle = async () => {
  try {
    const response = await getAdminArticle(articleId.value)
    if (response.success !== false) {
      const data = response.data || response
      Object.assign(article, {
        id: data.id,
        title: data.title,
        gallery_count: data.gallery_count || 0
      })
    }
  } catch (error) {
    console.error('Fetch article error:', error)
    ElMessage.error('Failed to load article information')
  }
}

// Fetch gallery images
const fetchGallery = async () => {
  galleryLoading.value = true
  try {
    const response = await getArticleGallery(articleId.value)
    if (response.success !== false) {
      gallery.value = response.data || response || []
    }
  } catch (error) {
    console.error('Fetch gallery error:', error)
    // Sample data for development
    gallery.value = [
      {
        id: 1,
        url: 'https://picsum.photos/400/300?random=1',
        alt_text: 'Sample image 1',
        caption: 'This is a sample image caption',
        size: 1024000,
        is_primary: true,
        created_at: '2024-01-15T10:30:00.000Z'
      },
      {
        id: 2,
        url: 'https://picsum.photos/400/300?random=2',
        alt_text: 'Sample image 2',
        caption: '',
        size: 2048000,
        is_primary: false,
        created_at: '2024-01-16T14:20:00.000Z'
      }
    ]
  } finally {
    galleryLoading.value = false
  }
}

const refreshGallery = async () => {
  ElMessage.info('Refreshing gallery...')
  await fetchGallery()
  selectedImages.value = []
}

// Upload handlers
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('Please upload image files only!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('Image size must be less than 5MB!')
    return false
  }
  return true
}

const onUploadSuccess = (response, file, fileList) => {
  ElMessage.success(`${file.name} uploaded successfully!`)
  refreshGallery()
}

const onUploadError = (error, file, fileList) => {
  console.error('Upload error:', error)
  ElMessage.error(`Failed to upload ${file.name}`)
}

const onUploadProgress = (event, file, fileList) => {
  // Handle upload progress if needed
}

// Image management
const previewImage = (image) => {
  currentPreview.value = { ...image }
  previewVisible.value = true
}

const closePreview = () => {
  previewVisible.value = false
  currentPreview.value = {}
}

const updateImageInfo = async (image) => {
  try {
    await updateArticleImage(articleId.value, image.id, {
      alt_text: image.alt_text,
      caption: image.caption
    })
  } catch (error) {
    console.error('Update image error:', error)
    ElMessage.error('Failed to update image information')
  }
}

const setAsPrimary = async (image) => {
  try {
    await setArticleImagePrimary(articleId.value, image.id)
    ElMessage.success('Primary image updated successfully')
    await refreshGallery()
  } catch (error) {
    console.error('Set primary error:', error)
    ElMessage.error('Failed to set primary image')
  }
}

// Delete functions
const deleteImage = (image) => {
  imageToDelete.value = image
  isMultipleDelete.value = false
  deleteDialogVisible.value = true
}

const bulkDelete = () => {
  if (selectedImages.value.length === 0) return
  isMultipleDelete.value = true
  deleteDialogVisible.value = true
}

const handleDeleteDialogClose = () => {
  deleteDialogVisible.value = false
  imageToDelete.value = null
  isMultipleDelete.value = false
}

const confirmDelete = async () => {
  deleteLoading.value = true

  try {
    if (isMultipleDelete.value) {
      await bulkDeleteArticleImages(articleId.value, selectedImages.value)
      ElMessage.success(`${selectedImages.value.length} images deleted successfully`)
      selectedImages.value = []
    } else {
      await deleteArticleImage(articleId.value, imageToDelete.value.id)
      ElMessage.success('Image deleted successfully')
    }

    await refreshGallery()
    handleDeleteDialogClose()

  } catch (error) {
    console.error('Delete error:', error)
    ElMessage.error('Failed to delete image(s)')
  } finally {
    deleteLoading.value = false
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
  font-size: 14px;
  color: #909399;
}

.upload-card,
.gallery-card {
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.upload-dragger {
  text-align: center;
  padding: 40px 0;
}

.upload-icon {
  font-size: 48px;
  color: #c0c4cc;
  margin-bottom: 16px;
}

.upload-text p {
  margin: 0;
  color: #606266;
}

.upload-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 8px !important;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 20px 0;
}

.gallery-item {
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 16px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
}

.gallery-item.selected {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.gallery-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.image-checkbox {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  padding: 4px;
}

.image-container {
  position: relative;
  cursor: pointer;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 12px;
}

.gallery-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.image-overlay {
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
}

.image-container:hover .image-overlay {
  opacity: 1;
}

.image-container:hover .gallery-image {
  transform: scale(1.05);
}

.image-info {
  margin-bottom: 12px;
}

.alt-input,
.caption-input {
  margin-bottom: 8px;
}

.image-meta {
  margin-top: 8px;
}

.image-actions {
  display: flex;
  gap: 8px;
  justify-content: space-between;
}

.image-actions .el-button {
  flex: 1;
}

.empty-gallery {
  padding: 60px 20px;
}

.preview-container {
  text-align: center;
}

.preview-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 8px;
  margin-bottom: 20px;
}

.preview-info h3 {
  margin: 0 0 8px 0;
  color: #303133;
}

.preview-info p {
  margin: 0 0 12px 0;
  color: #606266;
}

.preview-meta {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
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

.warning-note {
  color: #909399;
  font-size: 12px;
  margin-top: 12px !important;
}

.dialog-footer {
  text-align: right;
  padding: 20px;
}

/* Element Plus customizations */
:deep(.el-upload-dragger) {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  width: 100%;
  height: auto;
  position: relative;
}

:deep(.el-upload-dragger:hover) {
  border-color: #409eff;
}

:deep(.el-card__body) {
  padding: 24px;
}

/* Responsive design */
@media (max-width: 768px) {
  .gallery-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .card-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
  }

  .image-actions {
    flex-direction: column;
  }
}
</style>