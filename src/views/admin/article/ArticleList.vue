<template>
  <div class="app-container">
    <!-- Filter Section -->
    <div class="filter-container mb-4">
      <el-row :gutter="15">
        <el-col :span="8">
          <el-input
            v-model="filters.search"
            placeholder="Search by title"
            clearable
            @input="handleFilter"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="3">
          <el-select
            v-model="filters.status"
            placeholder="Status"
            clearable
            @change="handleFilter"
          >
            <el-option label="Published" value="published" />
            <el-option label="Draft" value="draft" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select
            v-model="filters.category_id"
            placeholder="Category"
            clearable
            @change="handleFilter"
          >
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-col>
        <el-col :span="3">
          <el-select
            v-model="filters.type"
            placeholder="Type"
            clearable
            @change="handleFilter"
          >
            <el-option label="SOP" value="SOP" />
            <el-option label="Kebijakan" value="Kebijakan" />
            <el-option label="Panduan" value="Panduan" />
          </el-select>
        </el-col>
        <!-- <el-col :span="4">
          <el-select
            v-model="filters.penulis"
            placeholder="Penulis"
            clearable
            filterable
            @change="handleFilter"
          >
            <el-option
              v-for="penulis in penulis"
              :key="penulis.id"
              :label="penulis.name"
              :value="penulis.id"
            />
          </el-select>
        </el-col> -->

        <el-col :span="2">
          <el-button type="primary" @click="goToCreate" style="width: 100%">
            <el-icon><Plus /></el-icon>
            Add
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

      <el-table-column label="Title" prop="title" min-width="200" show-overflow-tooltip>
        <template #default="scope">
          <span class="table-title">{{ scope.row.title || 'No Title' }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Type" prop="type" width="100">
        <template #default="scope">
          <el-tag
            :type="getTypeTagType(scope.row.type)"
            size="small"
          >
            {{ scope.row.type }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Category" prop="category" width="150">
        <template #default="scope">
          <span>{{ scope.row.category?.name || 'No Category' }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Author" prop="user" width="120">
        <template #default="scope">
          <span>{{ scope.row.user?.name || 'Unknown' }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Status" prop="status" width="100">
        <template #default="scope">
          <el-tag
            :type="scope.row.status === 'published' ? 'success' : 'warning'"
            size="small"
          >
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Gallery" width="80">
        <template #default="scope">
          <el-tag type="info" size="small">
            {{ scope.row.gallery_count || 0 }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Created At" prop="created_at" width="180" sortable>
        <template #default="scope">
          <span>{{ formatDate(scope.row.created_at) }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Actions" width="220" fixed="right">
        <template #default="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope.row)" link>
            <el-icon><Edit /></el-icon>
            Edit
          </el-button>
          <el-button type="success" size="small" @click="handleView(scope.row)" link>
            <el-icon><View /></el-icon>
            View
          </el-button>
          <el-button type="info" size="small" @click="handleGallery(scope.row)" link>
            <el-icon><Picture /></el-icon>
            Gallery
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
        :page-sizes="[10, 15, 20, 30, 50]"
        :pager-count="5"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

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
          <p>Are you sure you want to delete article</p>
          <p><strong>"{{ articleToDelete?.title }}"</strong>?</p>
          <p class="warning-note">This action cannot be undone and will also delete all associated gallery images.</p>
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
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Edit, View, Delete, Picture, WarningFilled } from '@element-plus/icons-vue'
import { getEditorArticles, deleteAdminArticle } from '@/api/article'

import { getCategories } from '@/api/article'
import { getPenulis } from '@/api/user'

const router = useRouter()

// Table data
const table = reactive({
  list: [],
  listLoading: true,
  originalList: []
})

// Categories
const categories = ref([])

// Authors
const penulis = ref([])

// Delete dialog state
const deleteDialogVisible = ref(false)
const deleteLoading = ref(false)
const articleToDelete = ref(null)

// Filters
const filters = reactive({
  search: '',
  status: '',
  category_id: '',
  type: '',
  penulis: '',
  editor_id: ''
})

// Pagination
const pagination = reactive({
  currentPage: 1,
  pageSize: 15,
  total: 0
})

// Computed properties
const filteredData = computed(() => {
  if (!table.list) return []
  return table.list
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

const getTypeTagType = (type) => {
  const typeMap = {
    'SOP': 'primary',
    'Kebijakan': 'success',
    'Panduan': 'info'
  }
  return typeMap[type] || 'default'
}

const goToCreate = () => {
  router.push('/admin/articles/create')
}

const handleEdit = (row) => {
  router.push(`/admin/articles/edit/${row.id}`)
}

const handleView = (row) => {
  router.push(`/admin/articles/view/${row.id}`)
}

const handleGallery = (row) => {
  router.push(`/admin/articles/${row.id}/gallery`)
}

// Open delete confirmation dialog
const openDeleteDialog = (row) => {
  articleToDelete.value = row
  deleteDialogVisible.value = true
}

// Handle delete dialog close
const handleDeleteDialogClose = () => {
  deleteDialogVisible.value = false
  articleToDelete.value = null
}

// Confirm delete action
const confirmDelete = async () => {
  if (!articleToDelete.value) return

  deleteLoading.value = true

  try {
    const response = await deleteAdminArticle(articleToDelete.value.id)

    if (response.success !== false) {
      ElMessage.success(response.message || 'Article deleted successfully')
      await fetchData()
      handleDeleteDialogClose()
    } else {
      ElMessage.error(response.message || 'Failed to delete article')
    }
  } catch (error) {
    console.error('Delete error:', error)
    if (error.response?.status === 400) {
      ElMessage.error(error.response.data.message || 'Cannot delete this article')
    } else {
      ElMessage.error('Failed to delete article')
    }
  } finally {
    deleteLoading.value = false
  }
}

const handleFilter = () => {
  pagination.currentPage = 1
  fetchData()
}

const handleSizeChange = (val) => {
  pagination.pageSize = val
  pagination.currentPage = 1
  fetchData()
}

const handleCurrentChange = (val) => {
  pagination.currentPage = val
  fetchData()
}

const fetchCategories = async () => {
  try {
    const response = await getCategories()
    if (response.success !== false) {
      categories.value = response.data || response || []
    }
  } catch (error) {
    console.error('Fetch categories error:', error)
    categories.value = []
  }
}

const fetchAuthors = async () => {
  try {
    const response = await getPenulis()
    if (response.success !== false) {
      penulis.value = response.data || response || []
    }
  } catch (error) {
    console.error('Fetch authors error:', error)
    authors.value = []
  }
}

const fetchData = async () => {
  table.listLoading = true

  try {
    const params = {
      page: pagination.currentPage,
      per_page: pagination.pageSize,
      search: filters.search || undefined,
      status: filters.status || undefined,
      category_id: filters.category_id || undefined,
      type: filters.type || undefined,
      penulis: filters.penulis || undefined
    }

    // Remove undefined values
    Object.keys(params).forEach(key => {
      if (params[key] === undefined || params[key] === '') {
        delete params[key]
      }
    })

    const response = await getEditorArticles(params)

    // Handle nested data structure: response.data.data
    if (response.success && response.data) {
      if (Array.isArray(response.data.data)) {
        // Paginated response: { success: true, data: { data: [], current_page: 1, ... } }
        table.list = response.data.data
        pagination.total = response.data.total || response.data.data.length
        pagination.currentPage = response.data.current_page || pagination.currentPage
      } else if (Array.isArray(response.data)) {
        // Direct array response: { success: true, data: [] }
        table.list = response.data
        pagination.total = response.data.length
      } else {
        table.list = []
        pagination.total = 0
      }
    } else if (Array.isArray(response)) {
      // Direct array response without wrapper
      table.list = response
      pagination.total = response.length
    } else {
      // Ensure table.list is always an array
      table.list = []
      pagination.total = 0
    }

  } catch (error) {
    console.error('Fetch error:', error)
    ElMessage.error('Failed to load articles')

    // Always ensure table.list is an empty array on error
    table.list = []
    pagination.total = 0

  } finally {
    table.listLoading = false
  }
}

// Refresh data manually
const refreshData = async () => {
  ElMessage.info('Refreshing data...')
  await fetchData()
}

onMounted(async () => {
  await fetchCategories()
  await fetchAuthors()
  await fetchData()
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

.table-title {
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

.dialog-footer {
  text-align: right;
  padding: 20px;
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

:deep(.el-button + .el-button) {
  margin-left: 8px;
}

/* Custom pagination styles */
:deep(.el-pagination) {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

:deep(.el-pagination .btn-prev),
:deep(.el-pagination .btn-next) {
  border-radius: 6px;
  border: 1px solid #dcdfe6;
  transition: all 0.3s;
}

:deep(.el-pagination .btn-prev:hover),
:deep(.el-pagination .btn-next:hover) {
  color: #409eff;
  border-color: #409eff;
}

:deep(.el-pagination .el-pager li) {
  border-radius: 6px;
  min-width: 36px;
  height: 36px;
  line-height: 36px;
  transition: all 0.3s;
  border: 1px solid transparent;
}

:deep(.el-pagination .el-pager li:hover) {
  color: #409eff;
  border-color: #409eff;
}

:deep(.el-pagination .el-pager li.is-active) {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  color: white;
  border-color: #409eff;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.mb-4 {
  margin-bottom: 16px;
}
</style>
