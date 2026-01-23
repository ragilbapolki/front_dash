<template>
  <div class="app-container">
    <!-- Filter Section -->
    <div class="filter-container mb-4">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input
            v-model="filters.title"
            placeholder="Search by name"
            clearable
            @input="handleFilter"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="openCreateDialog">
            <el-icon><Plus /></el-icon>
             Add New
          </el-button>
        </el-col>
      </el-row>
    </div>

    <!-- Table Section -->
    <el-table
      :data="filteredData"
      border
      fit
      highlight-current-row
      v-loading="table.listLoading"
      style="width: 100%"
      :empty-text="table.listLoading ? 'Loading...' : 'No data available'"
    >
      <el-table-column align="center" label="ID" width="80" fixed>
        <template #default="scope">
          <span class="table-id">{{ scope.row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Name" prop="name" min-width="80" show-overflow-tooltip>
        <template #default="scope">
          <span class="table-name">{{ scope.row.name || 'No Name' }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Slug" prop="slug" width="150" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ scope.row.slug || 'No Slug' }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Icon" prop="icon" width="150">
        <template #default="scope">
          <span>{{ scope.row.icon || '-' }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Articles" prop="articles_count" width="100">
        <template #default="scope">
          <el-tag type="info" size="small">
            {{ scope.row.articles_count || 0 }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Created At" prop="created_at" width="180" sortable>
        <template #default="scope">
          <span>{{ formatDate(scope.row.created_at) }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Actions" width="200" fixed="right">
        <template #default="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope.row)" link>
            <el-icon><Edit /></el-icon>
            Edit
          </el-button>
          <el-button type="success" size="small" @click="handleView(scope.row)" link>
            <el-icon><View /></el-icon>
            View
          </el-button>
          <el-button type="danger" size="small" @click="openDeleteDialog(scope.row)" link>
            <el-icon><Delete /></el-icon>
            Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Pagination -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 30, 50]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- Create/Edit Dialog Form -->
    <el-dialog
      :title="dialogStatus === 'create' ? 'Create New Category' : 'Edit Category'"
      v-model="dialogFormVisible"
      width="600px"
      :before-close="handleDialogClose"
    >
      <el-form
        ref="dataFormRef"
        :rules="rules"
        :model="category"
        label-position="left"
        label-width="100px"
        class="dialog-form"
      >
        <el-form-item label="Name" prop="name">
          <el-input
            v-model="category.name"
            placeholder="Enter category name"
            @blur="generateSlug"
          />
        </el-form-item>

        <el-form-item label="Slug" prop="slug">
          <el-input v-model="category.slug" placeholder="Enter slug (auto-generated from name)" />
        </el-form-item>

        <el-form-item label="Icon" prop="icon">
          <el-input v-model="category.icon" placeholder="Enter icon class or emoji" />
        </el-form-item>

        <el-form-item label="Description">
          <el-input
            v-model="category.description"
            :autosize="{ minRows: 3, maxRows: 6}"
            type="textarea"
            placeholder="Enter category description..."
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleDialogClose" size="default">
            Cancel
          </el-button>
          <el-button
            type="primary"
            @click="handleSubmit"
            :loading="submitLoading"
            size="default"
          >
            {{ dialogStatus === 'create' ? 'Create' : 'Update' }}
          </el-button>
        </div>
      </template>
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
          <p>Are you sure you want to delete category</p>
          <p><strong>"{{ categoryToDelete?.name }}"</strong>?</p>
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
            Delete
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Plus, Edit, View, Delete, WarningFilled } from '@element-plus/icons-vue'
import { getAdminCategories, createAdminCategory, updateAdminCategory, deleteAdminCategory } from '@/api/category'

// Table data
const table = reactive({
  list: [],
  listLoading: true,
  originalList: []
})

// Dialog state
const dialogFormVisible = ref(false)
const dialogStatus = ref('create')
const submitLoading = ref(false)

// Delete dialog state
const deleteDialogVisible = ref(false)
const deleteLoading = ref(false)
const categoryToDelete = ref(null)

// Form ref
const dataFormRef = ref()

// Filters
const filters = reactive({
  title: '',
})

// Pagination
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// Form data
const category = reactive({
  id: undefined,
  name: '',
  slug: '',
  icon: '',
  description: '',
  created_at: null
})

// Form validation rules
const rules = reactive({
  name: [
    { required: true, message: 'Name is required', trigger: 'blur' },
    { min: 2, max: 100, message: 'Name should be 2-100 characters', trigger: 'blur' }
  ],
  slug: [
    { required: true, message: 'Slug is required', trigger: 'blur' },
    { pattern: /^[a-z0-9-]+$/, message: 'Slug should only contain lowercase letters, numbers, and hyphens', trigger: 'blur' }
  ]
})

// Computed properties
const filteredData = computed(() => {
  if (!table.list) return []

  let filtered = table.list.filter(item => {
    const nameMatch = !filters.title ||
      item.name?.toLowerCase().includes(filters.title.toLowerCase())
    const statusMatch = !filters.status || item.status === filters.status
    return nameMatch && statusMatch
  })

  pagination.total = filtered.length
  const start = (pagination.currentPage - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return filtered.slice(start, end)
})

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

const generateSlug = () => {
  if (category.name && (!category.slug || dialogStatus.value === 'create')) {
    category.slug = category.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-')
  }
}

const resetTemp = () => {
  Object.assign(category, {
    id: undefined,
    name: '',
    slug: '',
    icon: '',
    description: '',
    created_at: null
  })
}

const openCreateDialog = () => {
  resetTemp()
  dialogStatus.value = 'create'
  dialogFormVisible.value = true
}

const handleEdit = (row) => {
  Object.assign(category, { ...row })
  dialogStatus.value = 'edit'
  dialogFormVisible.value = true
}

const handleView = (row) => {
  ElMessageBox.alert(
    `<strong>Name:</strong> ${row.name}<br/>
     <strong>Slug:</strong> ${row.slug}<br/>
     <strong>Icon:</strong> ${row.icon || 'None'}<br/>
     <strong>Articles Count:</strong> ${row.articles_count || 0}<br/>
     <strong>Description:</strong> ${row.description || 'No description'}<br/>
     <strong>Created:</strong> ${formatDate(row.created_at)}`,
    'Category Details',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: 'Close'
    }
  )
}

// Open delete confirmation dialog
const openDeleteDialog = (row) => {
  categoryToDelete.value = row
  deleteDialogVisible.value = true
}

// Handle delete dialog close
const handleDeleteDialogClose = () => {
  deleteDialogVisible.value = false
  categoryToDelete.value = null
}

// Confirm delete action
const confirmDelete = async () => {
  if (!categoryToDelete.value) return

  deleteLoading.value = true

  try {
    // Real API call for delete
    const response = await deleteAdminCategory(categoryToDelete.value.id)

    // Check if API response indicates success
    if (response.success) {
      ElMessage.success(response.message || 'Category deleted successfully')
      // Reload data from server to ensure consistency
      await fetchData()
      handleDeleteDialogClose()
    } else {
      ElMessage.error(response.message || 'Failed to delete category')
    }
  } catch (error) {
    console.error('Delete error:', error)

    // Handle specific error cases
    if (error.response?.status === 400) {
      ElMessage.error(error.response.data.message || 'Cannot delete category with articles')
    } else {
      ElMessage.error('Failed to delete category')
    }
  } finally {
    deleteLoading.value = false
  }
}

const handleDialogClose = () => {
  if (dataFormRef.value) {
    dataFormRef.value.resetFields()
  }
  resetTemp()
  dialogFormVisible.value = false
}

const handleSubmit = async () => {
  if (!dataFormRef.value) return

  const isValid = await dataFormRef.value.validate().catch(() => false)
  if (!isValid) return

  submitLoading.value = true

  try {
    if (dialogStatus.value === 'create') {
      await createData()
    } else {
      await updateData()
    }
  } catch (error) {
    console.error('Submit error:', error)

    // Handle validation errors
    if (error.response?.status === 422) {
      const errors = error.response.data.errors
      if (errors) {
        Object.keys(errors).forEach(field => {
          ElMessage.error(`${field}: ${errors[field][0]}`)
        })
      }
    } else {
      ElMessage.error(`Failed to ${dialogStatus.value} category`)
    }
  } finally {
    submitLoading.value = false
  }
}

const createData = async () => {
  try {
    // Prepare data for API
    const newCategoryData = {
      name: category.name,
      slug: category.slug,
      icon: category.icon,
      status: category.status,
      description: category.description
    }

    // Real API call for create
    const response = await createAdminCategory(newCategoryData)

    // Check if API response indicates success
    if (response.success) {
      ElMessage.success(response.message || 'Category created successfully')
      handleDialogClose()

      // Reload data from server to ensure consistency
      await fetchData()
    } else {
      ElMessage.error(response.message || 'Failed to create category')
    }

  } catch (error) {
    console.error('Create category error:', error)
    throw error
  }
}

const updateData = async () => {
  try {
    // Prepare data for API (exclude read-only fields)
    const updateData = {
      name: category.name,
      slug: category.slug,
      icon: category.icon,
      status: category.status,
      description: category.description
    }

    // Real API call for update
    const response = await updateAdminCategory(category.id, updateData)

    // Check if API response indicates success
    if (response.success) {
      ElMessage.success(response.message || 'Category updated successfully')
      handleDialogClose()

      // Reload data from server to ensure consistency
      await fetchData()
    } else {
      ElMessage.error(response.message || 'Failed to update category')
    }

  } catch (error) {
    console.error('Update category error:', error)
    throw error
  }
}

const handleFilter = () => {
  pagination.currentPage = 1
}

const handleSizeChange = (val) => {
  pagination.pageSize = val
  pagination.currentPage = 1
}

const handleCurrentChange = (val) => {
  pagination.currentPage = val
}

const fetchData = async () => {
  table.listLoading = true

  try {
    // Real API call to fetch categories
    const response = await getAdminCategories({
      page: pagination.currentPage,
      per_page: pagination.pageSize,
      search: filters.title,
      status: filters.status
    })

    // Handle new API response format
    if (response.success) {
      table.list = response.data || []
      pagination.total = response.total || response.data?.length || 0
      table.originalList = [...table.list]
    } else {
      ElMessage.error(response.message || 'Failed to load categories')
      table.list = []
      pagination.total = 0
    }

  } catch (error) {
    console.error('Fetch error:', error)
    ElMessage.error('Failed to load categories')

    // Fallback to sample data for development/testing
    const sampleData = [
      {
        id: 1,
        name: 'Technology',
        slug: 'technology',
        icon: '💻',
        status: 'published',
        description: 'Articles about technology and programming',
        articles_count: 15,
        created_at: '2024-01-15T10:30:00.000Z'
      },
      {
        id: 2,
        name: 'Web Development',
        slug: 'web-development',
        icon: '🌐',
        status: 'published',
        description: 'Frontend and backend development tutorials',
        articles_count: 8,
        created_at: '2024-01-10T14:20:00.000Z'
      },
      {
        id: 3,
        name: 'Mobile Apps',
        slug: 'mobile-apps',
        icon: '📱',
        status: 'draft',
        description: 'Mobile application development guides',
        articles_count: 0,
        created_at: '2024-01-20T09:15:00.000Z'
      },
      {
        id: 4,
        name: 'Design',
        slug: 'design',
        icon: '🎨',
        status: 'published',
        description: 'UI/UX design principles and tutorials',
        articles_count: 12,
        created_at: '2024-01-18T16:45:00.000Z'
      }
    ]

    table.list = sampleData
    table.originalList = [...sampleData]
    pagination.total = sampleData.length

  } finally {
    table.listLoading = false
  }
}

// Refresh data manually
const refreshData = async () => {
  ElMessage.info('Refreshing data...')
  await fetchData()
}

onMounted(() => {
  fetchData()
})

// Expose refresh method for external use
defineExpose({
  refreshData,
  fetchData
})
</script>

<style scoped>
.app-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.filter-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.table-id {
  font-weight: 600;
  color: #409eff;
}

.table-name {
  font-weight: 500;
  color: #303133;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.dialog-form {
  padding: 0 20px;
}

.dialog-footer {
  text-align: right;
  padding: 20px;
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
  font-size: 12px;
  margin-top: 12px !important;
}

/* Element Plus custom styles */
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

:deep(.el-table th) {
  background-color: #fafafa;
  color: #606266;
  font-weight: 600;
}

:deep(.el-table td) {
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-table__row:hover) {
  background-color: #f5f7fa;
}

:deep(.status-col .cell) {
  padding: 0 10px;
}

:deep(.el-button + .el-button) {
  margin-left: 8px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 15px;
}

.mb-4 {
  margin-bottom: 16px;
}
</style>
