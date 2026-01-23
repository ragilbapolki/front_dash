<template>
  <div class="app-container">
    <!-- Filter Section -->
    <div class="filter-container mb-4">
      <el-row :gutter="20">
        <el-col :span="5">
          <el-input
            v-model="filters.search"
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
          <el-select
            v-model="filters.category_id"
            placeholder="Filter by category"
            clearable
            @change="handleFilter"
            style="width: 100%"
          >
            <el-option
              v-for="cat in categories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            >
              <span>{{ cat.icon }} {{ cat.name }}</span>
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="openCreateDialog">
            <el-icon><Plus /></el-icon>
            Add Module
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
    >
      <el-table-column align="center" label="ID" width="70" fixed>
        <template #default="scope">
          <span class="table-id">{{ scope.row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Module" min-width="150" fixed>
        <template #default="scope">
          <div class="module-info">
            <div class="module-details">
              <div class="module-name">{{ scope.row.name }}</div>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Category" min-width="150">
        <template #default="scope">
          <el-tag type="info" size="small">
            {{ scope.row.category?.name || '-' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="Description" min-width="150" fixed>
        <template #default="scope">
          <div class="module-info">
            <div class="module-details">
              <div class="module-name">{{ scope.row.description }}</div>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Created" width="180" align="center" sortable>
        <template #default="scope">
          <span>{{ formatDate(scope.row.created_at) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Actions" width="200" fixed="right" align="center">
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

    <el-dialog
      :title="dialogStatus === 'create' ? 'Create New Module' : 'Edit Module'"
      v-model="dialogFormVisible"
      width="700px"
      :before-close="handleDialogClose"
    >
      <el-form
        ref="dataFormRef"
        :rules="rules"
        :model="module"
        label-position="left"
        label-width="130px"
        class="dialog-form"
      >
        <el-row :gutter="20">
          <el-col >
            <el-form-item label="Name" prop="name">
              <el-input
                v-model="module.name"
                placeholder="Module name"
                @blur="generateSlug"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="Slug" prop="slug">
          <el-input v-model="module.slug" placeholder="Auto-generated" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col>
            <el-form-item label="Category" prop="category_id">
              <el-select
                v-model="module.category_id"
                placeholder="Select category"
                style="width: 100%"
              >
                <el-option
                  v-for="cat in categories"
                  :key="cat.id"
                  :label="`${cat.name}`"
                  :value="cat.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="Description">
          <el-input
            v-model="module.description"
            :autosize="{ minRows: 3, maxRows: 6}"
            type="textarea"
            placeholder="Module description..."
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleDialogClose">Cancel</el-button>
          <el-button
            type="primary"
            @click="handleSubmit"
            :loading="submitLoading"
          >
            {{ dialogStatus === 'create' ? 'Create' : 'Update' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Delete Dialog -->
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
          <p>Are you sure you want to delete module</p>
          <p><strong>"{{ moduleToDelete?.name }}"</strong>?</p>
          <p class="warning-note">This action cannot be undone.</p>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">Cancel</el-button>
          <el-button
            type="danger"
            @click="confirmDelete"
            :loading="deleteLoading"
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Edit, View, Delete, WarningFilled } from '@element-plus/icons-vue'
import { getAdminModules, createAdminModule, updateAdminModule, deleteAdminModule } from '@/api/module'
import { getAdminCategories } from '@/api/category'

const table = reactive({
  list: [],
  listLoading: true
})

const dialogFormVisible = ref(false)
const dialogStatus = ref('create')
const submitLoading = ref(false)

const deleteDialogVisible = ref(false)
const deleteLoading = ref(false)
const moduleToDelete = ref(null)

const dataFormRef = ref()

const filters = reactive({
  search: '',
  category_id: null,
  status: '',
  is_featured: null
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const categories = ref([])

const module = reactive({
  id: undefined,
  category_id: null,
  name: '',
  slug: '',
  code: '',
  description: '',
  icon: '',
  thumbnail: '',
  version: '1.0.0',
  status: 'active',
  is_featured: false,
  sort_order: 0,
  settings: null,
  metadata: null
})

const rules = reactive({
  name: [
    { required: true, message: 'Name is required', trigger: 'blur' },
    { min: 2, max: 255, message: 'Name should be 3-255 characters', trigger: 'blur' }
  ],
  category_id: [
    { required: true, message: 'Please select a category', trigger: 'change' }
  ],
  code: [
    { pattern: /^[A-Z0-9_-]+$/, message: 'Code should only contain uppercase letters, numbers, underscores, and hyphens', trigger: 'blur' }
  ],
  slug: [
    { pattern: /^[a-z0-9-]+$/, message: 'Slug should only contain lowercase letters, numbers, and hyphens', trigger: 'blur' }
  ]
})

const filteredData = computed(() => {
  if (!table.list) return []
  return table.list
})

const getStatusType = (status) => {
  const types = {
    active: 'success',
    inactive: 'info',
    maintenance: 'warning'
  }
  return types[status] || 'info'
}

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
  if (module.name && (!module.slug || dialogStatus.value === 'create')) {
    module.slug = module.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }
}

const resetTemp = () => {
  Object.assign(module, {
    id: undefined,
    category_id: null,
    name: '',
    slug: '',
    description: '',
  })
}

const openCreateDialog = () => {
  resetTemp()
  dialogStatus.value = 'create'
  dialogFormVisible.value = true
}

const handleEdit = (row) => {
  Object.assign(module, { ...row })
  dialogStatus.value = 'edit'
  dialogFormVisible.value = true
}

const handleView = (row) => {
  ElMessageBox.alert(
    `<div style="text-align: left;">
       <p><strong>Name:</strong> ${row.name}</p>
       <p><strong>Code:</strong> ${row.code}</p>
       <p><strong>Category:</strong> ${row.category?.name}</p>
       <p><strong>Version:</strong> ${row.version}</p>
       <p><strong>Status:</strong> ${row.status}</p>
       <p><strong>Featured:</strong> ${row.is_featured ? 'Yes' : 'No'}</p>
       <p><strong>Sort Order:</strong> ${row.sort_order}</p>
       <p><strong>Description:</strong> ${row.description || 'No description'}</p>
     </div>`,
    'Module Details',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: 'Close'
    }
  )
}

const handleToggleFeatured = async (row) => {
  try {
    row.toggleLoading = true
    const response = await toggleModuleFeatured(row.id)

    if (response.success) {
      ElMessage.success('Featured status updated')
    } else {
      row.is_featured = !row.is_featured
      ElMessage.error('Failed to update featured status')
    }
  } catch (error) {
    row.is_featured = !row.is_featured
    ElMessage.error('Failed to update featured status')
  } finally {
    row.toggleLoading = false
  }
}

const handleSortChange = async (row) => {
  try {
    const response = await updateAdminModule(row.id, { sort_order: row.sort_order })
    if (response.success) {
      ElMessage.success('Sort order updated')
      await fetchData()
    }
  } catch (error) {
    ElMessage.error('Failed to update sort order')
  }
}

const openDeleteDialog = (row) => {
  moduleToDelete.value = row
  deleteDialogVisible.value = true
}

const confirmDelete = async () => {
  if (!moduleToDelete.value) return

  deleteLoading.value = true

  try {
    const response = await deleteAdminModule(moduleToDelete.value.id)

    if (response.success) {
      ElMessage.success(response.message || 'Module deleted successfully')
      await fetchData()
      deleteDialogVisible.value = false
    } else {
      ElMessage.error(response.message || 'Failed to delete module')
    }
  } catch (error) {
    console.error('Delete error:', error)
    ElMessage.error('Failed to delete module')
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
    ElMessage.error(`Failed to ${dialogStatus.value} module`)
  } finally {
    submitLoading.value = false
  }
}

const createData = async () => {
  try {
    const response = await createAdminModule(module)

    if (response.success) {
      ElMessage.success(response.message || 'Module created successfully')
      handleDialogClose()
      await fetchData()
    } else {
      ElMessage.error(response.message || 'Failed to create module')
    }
  } catch (error) {
    throw error
  }
}

const updateData = async () => {
  try {
    const response = await updateAdminModule(module.id, module)

    if (response.success) {
      ElMessage.success(response.message || 'Module updated successfully')
      handleDialogClose()
      await fetchData()
    } else {
      ElMessage.error(response.message || 'Failed to update module')
    }
  } catch (error) {
    throw error
  }
}

const handleFilter = () => {
  pagination.currentPage = 1
  fetchData()
}

const handleSizeChange = (val) => {
  pagination.pageSize = val
  fetchData()
}

const handleCurrentChange = (val) => {
  pagination.currentPage = val
  fetchData()
}

const fetchData = async () => {
  table.listLoading = true

  try {
    const response = await getAdminModules({
      page: pagination.currentPage,
      per_page: pagination.pageSize,
      search: filters.search,
      category_id: filters.category_id,
      status: filters.status,
      is_featured: filters.is_featured
    })

    if (response.success) {
      table.list = response.data || []
      pagination.total = response.total || 0
    } else {
      ElMessage.error(response.message || 'Failed to load modules')
      table.list = []
      pagination.total = 0
    }
  } catch (error) {
    console.error('Fetch error:', error)
    ElMessage.error('Failed to load modules')
    table.list = []
    pagination.total = 0
  } finally {
    table.listLoading = false
  }
}

const fetchCategories = async () => {
  try {
    const response = await getAdminCategories({ per_page: 100 })
    if (response.success) {
      categories.value = response.data || []
    }
  } catch (error) {
    console.error('Failed to load categories:', error)
  }
}

onMounted(() => {
  fetchCategories()
  fetchData()
})

defineExpose({
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

.module-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.module-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;
  border-radius: 6px;
}

.module-details {
  flex: 1;
}

.module-name {
  font-weight: 500;
  color: #303133;
  font-size: 14px;
}

.module-code {
  font-size: 12px;
  color: #909399;
  font-family: 'Courier New', monospace;
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

.delete-dialog-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 0;
}

.warning-icon {
  flex-shrink: 0;
}

.warning-text p {
  margin: 0 0 8px 0;
  color: #606266;
  font-size: 14px;
}

.warning-note {
  color: #909399;
  font-size: 12px;
  margin-top: 12px !important;
}

.mb-4 {
  margin-bottom: 16px;
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

:deep(.el-input-number) {
  width: 100%;
}
</style>
