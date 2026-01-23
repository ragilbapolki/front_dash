<!-- ArtikelForm.vue - TinyMCE Editor with Table Support -->
<template>
  <div class="app-container">
    <!-- Header -->
    <div class="page-header">
      <el-row justify="space-between" align="middle">
        <el-col :span="2" style="text-align: right;">
          <el-button @click="goBack" size="default">
            <el-icon><ArrowLeft /></el-icon>
            Back to List
          </el-button>
        </el-col>
        <el-col :span="20">
          <h1 class="page-title">
            {{ isEdit ? 'Edit Article' : 'Create New Article' }}
          </h1>
          <p class="page-subtitle" v-if="isEdit && article.title">
            Editing: {{ article.title }}
          </p>
        </el-col>
      </el-row>
    </div>

    <!-- Form Card -->
    <el-card class="form-card" shadow="always">
      <el-form
        ref="formRef"
        :model="article"
        :rules="rules"
        label-width="120px"
        label-position="left"
        size="default"
        v-loading="formLoading"
      >
        <el-row :gutter="24">
          <!-- Left Column -->
          <el-col :span="16">
            <el-form-item label="Title" prop="title">
              <el-input
                v-model="article.title"
                placeholder="Enter article title"
                maxlength="255"
                show-word-limit
                size="large"
              />
            </el-form-item>

            <el-form-item label="Description" prop="description">
              <el-input
                v-model="article.description"
                type="textarea"
                :autosize="{ minRows: 3, maxRows: 6 }"
                placeholder="Enter article description"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="Content" prop="content" class="content-editor-item">
              <Editor
                v-model="article.content"
                api-key="q9gbl7y13jri6um8nbtsv7by5f1hfso5j7gfn39hskptlq3c"
                :init=editorConfig
              />
            </el-form-item>

            <el-form-item label="Images">
              <div class="upload-section">
                <el-upload
                  ref="uploadRef"
                  v-model:file-list="fileList"
                  :http-request="handleUploadRequest"
                  :on-success="handleUploadSuccess"
                  :on-error="handleUploadError"
                  :on-remove="handleRemove"
                  :on-preview="handlePreview"
                  :before-upload="beforeUpload"
                  :limit="80"
                  :on-exceed="handleExceed"
                  list-type="picture-card"
                  multiple
                  accept="image/*"
                  :auto-upload="true"
                >
                  <el-icon class="upload-icon"><Plus /></el-icon>
                  <div class="upload-text">Upload Images</div>
                </el-upload>

                <div class="upload-tips">
                  <el-text size="small" type="info">
                    <el-icon><InfoFilled /></el-icon>
                    Support JPG, PNG, GIF formats. Max 5MB per image. Maximum 80 images.
                  </el-text>
                </div>

                <!-- Gallery Images with Caption -->
                <div v-if="uploadedImages.length > 0" class="uploaded-gallery-list">
                  <div v-for="(image, index) in uploadedImages" :key="image.id" class="gallery-card">
                    <div class="gallery-card-image">
                      <img :src="image.url" :alt="image.alt_text" />
                    </div>
                    <div class="gallery-card-content">
                      <el-input
                        v-model="image.caption"
                        placeholder="Enter caption..."
                        size="small"
                        @blur="updateImageCaption(image)"
                      />
                      <div class="gallery-card-actions">
                        <el-button
                          type="danger"
                          size="small"
                          @click="removeUploadedImage(index)"
                          :icon="Delete"
                        >
                          Remove
                        </el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-form-item>

            <el-form-item label="PDF Attachment">
              <div class="attachment-section">
                <!-- Upload Area -->
                <el-upload
                  v-if="!article.attachment"
                  ref="attachmentUploadRef"
                  :http-request="handleAttachmentUpload"
                  :before-upload="beforeAttachmentUpload"
                  :show-file-list="false"
                  accept=".pdf"
                  drag
                >
                  <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                  <div class="el-upload__text">
                    Drop PDF file here or <em>click to upload</em>
                  </div>
                  <template #tip>
                    <div class="el-upload__tip">
                      PDF files only. Maximum size: 10MB
                    </div>
                  </template>
                </el-upload>

                <!-- Attachment Preview -->
                <div v-else class="attachment-preview">
                  <div class="attachment-info">
                    <el-icon class="pdf-icon" :size="40"><document /></el-icon>
                    <div class="attachment-details">
                      <div class="attachment-name">{{ article.attachment.name }}</div>
                      <div class="attachment-size">{{ article.attachment.formatted_size }}</div>
                    </div>
                  </div>
                  <div class="attachment-actions">
                    <el-button
                      type="primary"
                      size="small"
                      @click="downloadAttachment"
                      :icon="Download"
                    >
                      Download
                    </el-button>
                    <el-button
                      type="danger"
                      size="small"
                      @click="removeAttachment"
                      :icon="Delete"
                    >
                      Remove
                    </el-button>
                  </div>
                </div>
              </div>
            </el-form-item>
          </el-col>

          <!-- Right Column -->
          <el-col :span="8">
            <div class="sidebar-form">
              <el-form-item label="Type" prop="type">
                <el-select
                  v-model="article.type"
                  placeholder="Select type"
                  style="width: 100%"
                  size="large"
                >
                  <el-option label="SOP" value="SOP">
                    <span style="float: left">SOP</span>
                    <span style="float: right; color: #8492a6;">Standard Operating Procedure</span>
                  </el-option>
                  <el-option label="Kebijakan" value="Kebijakan">
                    <span style="float: left">Kebijakan</span>
                    <span style="float: right; color: #8492a6;">Policy</span>
                  </el-option>
                  <el-option label="Panduan" value="Panduan">
                    <span style="float: left">Panduan</span>
                    <span style="float: right; color: #8492a6;">Guide</span>
                  </el-option>
                </el-select>
              </el-form-item>

              <el-form-item label="Category" prop="category_id">
                <el-select
                  v-model="article.category_id"
                  placeholder="Select category"
                  style="width: 100%"
                  filterable
                  @change="handleCategoryChange"
                >
                  <el-option
                    v-for="category in categories"
                    :key="category.id"
                    :label="category.name"
                    :value="category.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item
                v-if="article.category_id"
                label="Module"
                prop="module_id"
              >
                <el-select
                  v-model="article.module_id"
                  placeholder="Select module (optional)"
                  style="width: 100%"
                  filterable
                  clearable
                  :loading="modulesLoading"
                  :disabled="!filteredModules.length"
                >
                  <el-option
                    v-for="module in filteredModules"
                    :key="module.id"
                    :label="module.name"
                    :value="String(module.id)"
                  >
                    <span style="float: left">{{ module.name }}</span>
                    <span
                      v-if="module.description"
                      style="float: right; color: #8492a6; font-size: 12px;"
                    >
                      {{ module.description }}
                    </span>
                  </el-option>
                </el-select>
                <el-text v-if="!filteredModules.length && article.category_id" size="small" type="info" style="margin-top: 4px;">
                  No modules available for this category
                </el-text>
              </el-form-item>
              <el-form-item label="Status" prop="status">
                <el-radio-group v-model="article.status" style="width: 100%">
                  <el-radio-button label="draft" style="width: 50%">
                    <el-icon><Document /></el-icon>
                    Draft
                  </el-radio-button>
                  <el-radio-button label="published" style="width: 50%">
                    <el-icon><Check /></el-icon>
                    Published
                  </el-radio-button>
                </el-radio-group>
              </el-form-item>

              <!-- Visibility Section -->
              <el-divider content-position="left">Visibility Settings</el-divider>

              <el-form-item label="Visibility" prop="visibility">
                <el-radio-group v-model="article.visibility" style="width: 100%">
                  <el-radio-button label="public" style="width: 50%">
                    <el-icon><UserFilled /></el-icon>
                    Public
                  </el-radio-button>
                  <el-radio-button label="private" style="width: 50%">
                    <el-icon><Lock /></el-icon>
                    Private
                  </el-radio-button>
                </el-radio-group>
              </el-form-item>

              <!-- Show divisions and departments if private -->
              <div v-if="article.visibility === 'private'" class="access-control">
                <el-alert
                  title="Private Article"
                  type="warning"
                  description="This article will only be accessible to selected divisions and departments"
                  :closable="false"
                  show-icon
                  style="margin-bottom: 16px;"
                />

                <el-form-item label="Divisions" prop="divisions">
                  <el-select
                    v-model="article.divisions"
                    placeholder="Select divisions"
                    style="width: 100%"
                    multiple
                    filterable
                  >
                    <el-option
                      v-for="division in divisions"
                      :key="division.id"
                      :label="division.name"
                      :value="division.id"
                    />
                  </el-select>
                </el-form-item>

                <el-form-item label="Departments" prop="departments">
                  <el-select
                    v-model="article.departments"
                    placeholder="Select departments"
                    style="width: 100%"
                    multiple
                    filterable
                  >
                    <el-option
                      v-for="department in departments"
                      :key="department.id"
                      :label="`${department.name} (${department.division?.name || 'N/A'})`"
                      :value="department.id"
                    />
                  </el-select>
                </el-form-item>
              </div>

              <!-- Article Info (for edit mode) -->
              <div v-if="isEdit && article.id" class="article-info">
                <el-divider content-position="left">Article Information</el-divider>

                <div class="info-item">
                  <span class="info-label">ID:</span>
                  <span class="info-value">{{ article.id }}</span>
                </div>

                <div class="info-item">
                  <span class="info-label">Created:</span>
                  <span class="info-value">{{ formatDate(article.created_at) }}</span>
                </div>

                <div class="info-item" v-if="article.published_at">
                  <span class="info-label">Published:</span>
                  <span class="info-value">{{ formatDate(article.published_at) }}</span>
                </div>

                <div class="info-item" v-if="article.user">
                  <span class="info-label">Author:</span>
                  <span class="info-value">{{ article.user.name }}</span>
                </div>

                <el-divider />

                <el-button
                  type="info"
                  @click="goToGallery"
                  style="width: 100%;"
                  :disabled="!article.id"
                >
                  <el-icon><Picture /></el-icon>
                  Manage Gallery ({{ article.gallery_count || 0 }})
                </el-button>
              </div>
            </div>
          </el-col>
        </el-row>

        <!-- Action Buttons -->
        <el-divider />
        <div class="form-actions">
          <el-button @click="goBack" size="large">
            Cancel
          </el-button>
          <el-button
            type="primary"
            @click="handleSubmit"
            :loading="submitLoading"
            size="large"
          >
            <el-icon><Check /></el-icon>
            {{ isEdit ? 'Update Article' : 'Create Article' }}
          </el-button>
          <el-button
            v-if="isEdit"
            type="success"
            @click="handleSubmitAndPublish"
            :loading="submitLoading"
            :disabled="article.status === 'published'"
            size="large"
          >
            <el-icon><Upload /></el-icon>
            Save & Publish
          </el-button>
        </div>
      </el-form>
    </el-card>

    <!-- Image Preview Dialog -->
    <el-dialog
      v-model="previewDialogVisible"
      title="Image Preview"
      width="50%"
      center
    >
      <el-image
        :src="previewImageUrl"
        style="width: 100%; max-height: 70vh;"
        fit="contain"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, computed, onUnmounted, watch } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { ElMessage, ElNotification } from 'element-plus'
import { getAdminModules } from  '@/api/module'
import {
  ArrowLeft,
  Document,
  Check,
  Upload,
  Picture,
  Plus,
  InfoFilled,
  Delete,
  Download,
  UploadFilled,
  UserFilled,
  Lock
} from '@element-plus/icons-vue'
import {
  getEditoArticles,
  createEditorArticle,
  updateEditorArticle,
  uploadArticleImage,
  deleteArticleImage,
  linkTemporaryImagesToArticle,
  cleanupTemporaryImages,
  updateAdminArticleImage
} from '@/api/article'
import { getCategories } from '@/api/article'
import { getDivisions } from '@/api/division'
import Editor from '@tinymce/tinymce-vue'

const route = useRoute()
const router = useRouter()

const attachmentUploadRef = ref()
const attachmentFile = ref(null)

// State
const formRef = ref()
const uploadRef = ref()
const formLoading = ref(false)
const submitLoading = ref(false)
const categories = ref([])
const divisions = ref([])
const departments = ref([])
const fileList = ref([])
const uploadedImages = ref([])
const previewDialogVisible = ref(false)
const modulesLoading = ref(false)
const previewImageUrl = ref('')
const modules = ref([])
const filteredModules = computed(() => {
  if (!article.category_id) return []
    return modules.value.filter(module => module.category_id === article.category_id)
})
const handleCategoryChange = (newCategoryId) => {
  article.module_id = null
}
// TinyMCE Configuration
const editorConfig = ref({
  height: 500,
  menubar: true,
  width: '100%',
  plugins: [
    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
  ],
  toolbar: 'undo redo | blocks | ' +
    'bold italic forecolor | alignleft aligncenter ' +
    'alignright alignjustify | bullist numlist outdent indent | ' +
    'table | removeformat | help',
  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
  table_toolbar: 'tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol',
  table_appearance_options: true,
  table_grid: true,
  table_resize_bars: true,
  table_default_attributes: {
    border: '1'
  },
  table_default_styles: {
    'border-collapse': 'collapse',
    width: '100%'
  },
  branding: false,
  promotion: false
})

// Computed
const isEdit = computed(() => !!route.params.id)
const articleId = computed(() => route.params.id)

// Form data
const article = reactive({
  id: null,
  title: '',
  description: '',
  content: '',
  type: '',
  category_id: null,
  status: 'draft',
  visibility: 'public',
  divisions: [],
  departments: [],
  document_type: '',
  gallery_count: 0,
  created_at: null,
  published_at: null,
  user: null,
  images: [],
  attachment: null,
  module_id: null
})

// Validation rules
const rules = reactive({
  title: [
    { required: true, message: 'Title is required', trigger: 'blur' },
    { min: 5, max: 255, message: 'Title should be 5-255 characters', trigger: 'blur' }
  ],
  type: [
    { required: true, message: 'Type is required', trigger: 'change' }
  ],
  category_id: [
    { required: true, message: 'Category is required', trigger: 'change' }
  ],
  status: [
    { required: true, message: 'Status is required', trigger: 'change' }
  ],
  visibility: [
    { required: true, message: 'Visibility is required', trigger: 'change' }
  ],
  divisions: [
    {
      type: 'array',
      required: true,
      message: 'At least one division is required for private articles',
      trigger: 'change',
      validator: (rule, value, callback) => {
        if (article.visibility === 'private' && (!value || value.length === 0)) {
          callback(new Error('At least one division is required'))
        } else {
          callback()
        }
      }
    }
  ],
  departments: [
    {
      type: 'array',
      required: true,
      message: 'At least one department is required for private articles',
      trigger: 'change',
      validator: (rule, value, callback) => {
        if (article.visibility === 'private' && (!value || value.length === 0)) {
          callback(new Error('At least one department is required'))
        } else {
          callback()
        }
      }
    }
  ]
})

// Watch visibility changes
watch(() => article.visibility, (newValue) => {
  if (newValue === 'public') {
    article.divisions = []
    article.departments = []
  }
})

const beforeAttachmentUpload = (file) => {
  const isPDF = file.type === 'application/pdf'
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isPDF) {
    ElMessage.error('Only PDF files are allowed!')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('PDF size must be less than 10MB!')
    return false
  }

  return true
}

const handleAttachmentUpload = async (options) => {
  const { file } = options

  try {
    attachmentFile.value = file

    article.attachment = {
      name: file.name,
      size: file.size,
      formatted_size: formatFileSize(file.size),
      file: file
    }

    ElNotification({
      title: 'Success',
      message: 'PDF attached successfully! Remember to save the article.',
      type: 'success',
      duration: 3000
    })
  } catch (error) {
    console.error('Attachment error:', error)
    ElMessage.error('Failed to attach PDF')
  }
}

const removeAttachment = async () => {
  try {
    article.attachment = null
    attachmentFile.value = null
    ElNotification({
      title: 'Success',
      message: 'Attachment removed',
      type: 'success'
    })
  } catch (error) {
    console.error('Remove attachment error:', error)
    ElMessage.error('Failed to remove attachment')
  }
}

const downloadAttachment = async () => {
  if (!article.id) {
    ElMessage.warning('Please save the article first')
    return
  }

  try {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    const url = `${baseUrl}/storage/${article.attachment_path}`

    const link = document.createElement('a')
    link.href = url
    link.download = article.attachment.name
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    ElNotification({
      title: 'Success',
      message: 'Download started',
      type: 'success'
    })
  } catch (error) {
    console.error('Download error:', error)
    ElMessage.error('Failed to download attachment')
  }
}

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unit = 0

  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024
    unit++
  }

  return `${size.toFixed(2)} ${units[unit]}`
}

// Methods
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const goBack = () => {
  router.push('/admin/articles/list')
}

const goToGallery = () => {
  if (article.id) {
    router.push(`/admin/articles/${article.id}/gallery`)
  }
}

// Upload methods
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('Only image files are allowed!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('Image size must be less than 5MB!')
    return false
  }

  return true
}

const generateSessionKey = () => {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

const sessionKey = ref(generateSessionKey())

const handleUploadRequest = async (options) => {
  const { file, onProgress, onSuccess, onError } = options

  try {
    const formData = new FormData()
    formData.append('file', file)

    if (isEdit.value && article.id) {
      formData.append('article_id', article.id)
    } else {
      formData.append('session_key', sessionKey.value)
    }

    onProgress({ percent: 30 })

    const response = await uploadArticleImage(formData)

    onProgress({ percent: 100 })

    if (response.success) {
      onSuccess(response, file)
    } else {
      onError(new Error(response.message || 'Upload failed'), response)
    }
  } catch (error) {
    console.error('Upload error:', error)

    if (error.response) {
      const errorMessage = error.response.data?.message || `Server error: ${error.response.status}`
      onError(new Error(errorMessage), error.response.data)
    } else {
      onError(error)
    }
  }
}

const updateImageCaption = async (image) => {
  if (!image.id) return

  try {
    const payload = {
      caption: image.caption || '',
      alt_text: image.alt_text || ''
    }

    const response = await updateAdminArticleImage(image.id, payload)

    if (response.success !== false) {
      ElNotification({
        title: 'Success',
        message: 'Image caption updated successfully',
        type: 'success',
        duration: 2000
      })
    } else {
      ElMessage.error(response.message || 'Failed to update caption')
    }
  } catch (error) {
    console.error('Error updating image caption:', error)
    ElMessage.error('Error updating image caption')
  }
}

const removeUploadedImage = async (index) => {
  try {
    const image = uploadedImages.value[index]

    const response = await deleteArticleImage(image.id)

    if (response.success) {
      uploadedImages.value.splice(index, 1)
      article.images = [...uploadedImages.value]

      const uploadIndex = fileList.value.findIndex(f => {
        const uploadedId = f.response?.data?.id || f.id
        return uploadedId === image.id
      })
      if (uploadIndex > -1) {
        fileList.value.splice(uploadIndex, 1)
      }

      if (previewDialogVisible.value && previewImageUrl.value === image.url) {
        previewDialogVisible.value = false
        previewImageUrl.value = ''
      }

      if (isEdit.value) {
        article.gallery_count = uploadedImages.value.length
      }

      ElNotification({
        title: 'Success',
        message: 'Image deleted successfully!',
        type: 'success'
      })
    } else {
      ElMessage.error(response.message || 'Failed to delete image')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete image error:', error)
      ElMessage.error('Failed to delete image')
    }
  }
}

const handleUploadError = (error, file, fileList) => {
  console.error('Upload error:', error)
  ElMessage.error('Upload failed!')

  const index = fileList.findIndex(item => item.uid === file.uid)
  if (index > -1) {
    fileList.splice(index, 1)
  }
}

const handleRemove = (file, fileList) => {
  if (file.response && file.response.success) {
    const imageIndex = uploadedImages.value.findIndex(img => img.id === file.response.data.id)
    if (imageIndex > -1) {
      uploadedImages.value.splice(imageIndex, 1)
      article.images = [...uploadedImages.value]

      if (isEdit.value) {
        article.gallery_count = uploadedImages.value.length
      }
    }
  }
}

const handlePreview = (file) => {
  if (file.url) {
    previewImageUrl.value = file.url
  } else if (file.response && file.response.data.url) {
    previewImageUrl.value = file.response.data.url
  } else {
    const reader = new FileReader()
    reader.onload = (e) => {
      previewImageUrl.value = e.target.result
    }
    reader.readAsDataURL(file.raw)
  }
  previewDialogVisible.value = true
}

const handleExceed = (files, fileList) => {
  ElMessage.warning(`Maximum 80 images allowed. You selected ${files.length} files, current total: ${fileList.length}`)
}

const temporaryImages = ref([])

const fetchModules = async () => {
  try {
    modulesLoading.value = true
    const response = await getAdminModules()
    if (response.success !== false) {
      modules.value = response.data || response || []
    }
  } catch (error) {
    console.error('Fetch modules error:', error)
    ElMessage.error('Failed to load modules')
  } finally {
    modulesLoading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const response = await getCategories()
    if (response.success !== false) {
      categories.value = response.data || response || []
    }
  } catch (error) {
    console.error('Fetch categories error:', error)
    ElMessage.error('Failed to load categories')
  }
}

const fetchDivisionsAndDepartments = async () => {
  try {
    const response = await getDivisions()
    if (response.success !== false) {
      const allData = response.data || response || []

      divisions.value = allData.filter(item => item.type === 'division')
      departments.value = allData.filter(item => item.type === 'department')
    }
  } catch (error) {
    console.error('Fetch divisions/departments error:', error)
    ElMessage.error('Failed to load divisions and departments')
  }
}

const fetchArticle = async () => {
  if (!articleId.value) return

  formLoading.value = true
  try {
    const response = await getEditoArticles(articleId.value)

    if (response.success !== false) {
      const data = response.article || response

      Object.assign(article, {
        id: data.id,
        title: data.title || '',
        description: data.description || '',
        content: data.content || '',
        type: data.type || '',
        category_id: data.category_id,
        module_id: data.module_id,
        status: data.status || 'draft',
        visibility: data.visibility || 'public',
        divisions: data.divisions?.map(d => d.id) || [],
        departments: data.departments?.map(d => d.id) || [],
        document_type: data.document_type || '',
        gallery_count: data.gallery_count || 0,
        created_at: data.created_at,
        published_at: data.published_at,
        user: data.user,
        images: data.images || [],
        attachment: data.attachment || null
      })

      if (data.images && data.images.length > 0) {
        uploadedImages.value = data.images.map(img => ({
          id: img.id,
          url: img.url,
          name: img.name,
          size: img.size,
          caption: img.caption || '',
          alt_text: img.alt_text || ''
        }))
      }
    } else {
      ElMessage.error('Article not found')
      goBack()
    }
  } catch (error) {
    console.error('Fetch article error:', error)
    ElMessage.error('Failed to load article')
    goBack()
  } finally {
    formLoading.value = false
  }
}

const handleSubmit = async (publishAfterSave = false) => {
  if (!formRef.value) return

  const isValid = await formRef.value.validate().catch(() => false)
  if (!isValid) return

  submitLoading.value = true

  try {
    let response

    if (isEdit.value) {
      const formData = new FormData()
      formData.append('title', article.title)
      formData.append('description', article.description)
      formData.append('content', article.content)
      formData.append('type', article.type)
      formData.append('category_id', article.category_id)
      formData.append('status', publishAfterSave ? 'published' : article.status)
      formData.append('visibility', article.visibility)
      if (article.module_id) {
        formData.append('module_id', article.module_id)
      }
      if (article.visibility === 'private') {
        article.divisions.forEach(divisionId => {
          formData.append('divisions[]', divisionId)
        })
        article.departments.forEach(departmentId => {
          formData.append('departments[]', departmentId)
        })
      }

      if (article.document_type) {
        formData.append('document_type', article.document_type)
      }

      if (attachmentFile.value) {
        formData.append('attachment', attachmentFile.value)
      }

      if (!article.attachment && !attachmentFile.value) {
        formData.append('remove_attachment', '1')
      }

      formData.append('_method', 'PUT')

      response = await updateEditorArticle(article.id, formData)

    } else {
      const formData = new FormData()
      formData.append('title', article.title)
      formData.append('description', article.description)
      formData.append('content', article.content)
      formData.append('type', article.type)
      formData.append('category_id', article.category_id)
      formData.append('status', publishAfterSave ? 'published' : article.status)
      formData.append('visibility', article.visibility)
      if (article.module_id) {
        formData.append('module_id', article.module_id)
      }
      if (article.visibility === 'private') {
        article.divisions.forEach(divisionId => {
          formData.append('divisions[]', divisionId)
        })
        article.departments.forEach(departmentId => {
          formData.append('departments[]', departmentId)
        })
      }

      if (article.document_type) {
        formData.append('document_type', article.document_type)
      }

      if (attachmentFile.value) {
        formData.append('attachment', attachmentFile.value)
      }

      response = await createEditorArticle(formData)

      if (response.success !== false && uploadedImages.value.length > 0) {
        const newArticleId = response.id || response.data.id
        await linkTemporaryImagesToArticleFixed(newArticleId)
      }
    }

    if (response.success !== false) {
      const action = isEdit.value ? 'updated' : 'created'
      const publishText = publishAfterSave ? ' and published' : ''

      ElNotification({
        title: 'Success',
        message: `Article ${action}${publishText} successfully`,
        type: 'success',
        duration: 3000
      })

      if (!isEdit.value && (response.id || response.data?.id)) {
        const newId = response.id || response.data.id
        router.push(`/admin/articles/edit/${newId}`)
      } else if (isEdit.value) {
        await fetchArticle()
      }
    } else {
      ElMessage.error(response.message || `Failed to ${isEdit.value ? 'update' : 'create'} article`)
    }
  } catch (error) {
    console.error('Submit error:', error)

    if (error.response?.data?.errors) {
      const errors = error.response.data.errors
      const errorMessages = Object.values(errors).flat().join(', ')
      ElMessage.error(`Validation errors: ${errorMessages}`)
    } else if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('Failed to save article')
    }
  } finally {
    submitLoading.value = false
  }
}

const linkTemporaryImagesToArticleFixed = async (articleId) => {
  try {
    const response = await linkTemporaryImagesToArticle(articleId, sessionKey.value)

    if (response.success) {
      console.log(`Linked ${response.linked_count || 0} temporary images to article`)
    } else {
      console.error('Failed to link temporary images:', response.message)
    }
  } catch (error) {
    console.error('Error linking temporary images:', error)
  }
}

const cleanupTemporaryImagesFixed = async () => {
  if (!isEdit.value && uploadedImages.value.length > 0) {
    try {
      const response = await cleanupTemporaryImages(sessionKey.value)
      if (response.success) {
        console.log('Temporary images cleaned up successfully')
      }
    } catch (error) {
      console.error('Error cleaning up temporary images:', error)
    }
  }
}

onUnmounted(() => {
  cleanupTemporaryImagesFixed()
})

onBeforeRouteLeave((to, from, next) => {
  if (!isEdit.value && uploadedImages.value.length > 0) {
    cleanupTemporaryImagesFixed()
    next()
  } else {
    next()
  }
})

const handleUploadSuccess = (response, file, fileList) => {
  if (response.success) {
    ElNotification({
      title: 'Success',
      message: 'Image uploaded successfully!',
      type: 'success',
      duration: 2000
    })

    const imageData = {
      id: response.data.id,
      url: response.data.url,
      name: response.data.name,
      size: response.data.size,
      formatted_size: response.data.formatted_size,
      dimensions: response.data.dimensions,
      alt_text: response.data.alt_text || '',
      caption: response.data.caption || '',
      is_primary: response.data.is_primary
    }

    if (isEdit.value) {
      uploadedImages.value.push(imageData)
      article.images = [...uploadedImages.value]
      article.gallery_count = uploadedImages.value.length
    } else {
      temporaryImages.value.push(response.data.id)
      uploadedImages.value.push(imageData)
    }
  } else {
    ElMessage.error(response.message || 'Upload failed!')
    const index = fileList.findIndex(item => item.uid === file.uid)
    if (index > -1) {
      fileList.splice(index, 1)
    }
  }
}

const resetForm = () => {
  Object.assign(article, {
    id: null,
    title: '',
    description: '',
    content: '',
    type: '',
    module_id:'',
    category_id: null,
    status: 'draft',
    visibility: 'public',
    divisions: [],
    departments: [],
    document_type: '',
    gallery_count: 0,
    created_at: null,
    published_at: null,
    user: null,
    images: []
  })

  fileList.value = []
  uploadedImages.value = []
  temporaryImages.value = []
}

const handleSubmitAndPublish = async () => {
  await handleSubmit(true)
}

onMounted(async () => {
  await fetchCategories()
  await fetchDivisionsAndDepartments()
  await fetchModules()
  if (isEdit.value) {
    await fetchArticle()
  }
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

.form-card {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.sidebar-form {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.access-control {
  background: #fef9e7;
  padding: 16px;
  border-radius: 6px;
  margin-bottom: 16px;
}

.editor-container {
  position: relative;
  width: 100%;
  margin-bottom: 50px;
}

.upload-section {
  width: 100%;
}

.upload-tips {
  margin-top: 8px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 4px;
  border-left: 4px solid #409eff;
}

.upload-icon {
  font-size: 28px;
  color: #c0c4cc;
}

.upload-text {
  margin-top: 8px;
  color: #606266;
  font-size: 12px;
}

.uploaded-gallery-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.gallery-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.gallery-card-image {
  width: 100%;
  height: 150px;
  overflow: hidden;
  background: #f5f7fa;
}

.gallery-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-card-content {
  padding: 12px;
}

.gallery-card-actions {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
}

.attachment-section {
  width: 100%;
}

.attachment-preview {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  background: #f8f9fa;
}

.attachment-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.pdf-icon {
  color: #f56c6c;
}

.attachment-details {
  flex: 1;
}

.attachment-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.attachment-size {
  font-size: 12px;
  color: #909399;
}

.attachment-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.article-info {
  margin-top: 20px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 0;
}

.info-label {
  font-weight: 500;
  color: #606266;
  font-size: 14px;
}

.info-value {
  color: #303133;
  font-size: 14px;
  text-align: right;
  flex: 1;
  margin-left: 12px;
}

.form-actions {
  text-align: center;
  padding: 20px 0;
}

.form-actions .el-button {
  margin: 0 8px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

:deep(.el-input__wrapper) {
  border-radius: 6px;
}

:deep(.el-select .el-input__wrapper) {
  border-radius: 6px;
}

:deep(.el-textarea__inner) {
  border-radius: 6px;
  font-family: inherit;
}

:deep(.el-radio-button__inner) {
  border-radius: 4px !important;
}

:deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-radius: 4px 0 0 4px !important;
}

:deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 0 4px 4px 0 !important;
}

:deep(.el-card__body) {
  padding: 30px;
}

:deep(.el-upload--picture-card) {
  width: 148px;
  height: 148px;
  border-radius: 6px;
}

:deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 148px;
  height: 148px;
  border-radius: 6px;
}

:deep(.ql-container) {
  font-size: 15px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

:deep(.ql-editor) {
  min-height: 350px;
  max-height: 500px;
  overflow-y: auto;
}

:deep(.ql-toolbar) {
  border-radius: 6px 6px 0 0;
  background: #fafafa;
}

:deep(.ql-container) {
  border-radius: 0 0 6px 6px;
}

@media (max-width: 1200px) {
  .app-container {
    padding: 16px;
  }

  :deep(.el-col) {
    margin-bottom: 16px;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 24px;
  }

  .form-actions .el-button {
    margin: 4px;
    width: calc(50% - 8px);
  }

  .uploaded-gallery-list {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
:deep(.ql-snow .ql-editor table) {
  border-collapse: collapse;
  width: 100%;
  margin: 20px 0;
}

:deep(.ql-snow .ql-editor table td),
:deep(.ql-snow .ql-editor table th) {
  border: 1px solid #dcdfe6;
  padding: 8px 12px;
  vertical-align: top;
}

:deep(.ql-snow .ql-editor table th) {
  background-color: #f5f7fa;
  font-weight: 600;
  text-align: left;
}

:deep(.ql-snow .ql-editor table tr:hover) {
  background-color: #fafafa;
}

/* Table Operation Menu Styling */
:deep(.qlbt-operation-menu) {
  background: white;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 8px;
  z-index: 1000;
}

:deep(.qlbt-operation-menu-item) {
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-radius: 4px;
  font-size: 14px;
}

:deep(.qlbt-operation-menu-item:hover) {
  background-color: #f5f7fa;
  color: #409eff;
}

/* Custom Insert Table Button */
:deep(.ql-snow .ql-toolbar button.ql-insertTable) {
  width: auto !important;
}

:deep(.ql-snow .ql-toolbar button.ql-insertTable::before) {
  content: "📊";
  font-size: 16px;
}

/* Selected cell highlight */
:deep(.ql-snow .ql-editor .qlbt-col-tool),
:deep(.ql-snow .ql-editor .qlbt-selection-line) {
  background-color: #409eff !important;
}

/* Table resize handles */
:deep(.qlbt-col-tool-cell-holder) {
  cursor: col-resize;
}

:deep(.qlbt-col-tool-cell-holder:hover) {
  background-color: #409eff;
}

.content-editor-item {
  width: 100%;
}

.content-editor {
  width: 100%;
}

.content-editor :deep(.tox-tinymce) {
  width: 100% !important;
  max-width: 100%;
  box-sizing: border-box;
}

.el-form-item__content {
  width: 100%;
}
</style>
