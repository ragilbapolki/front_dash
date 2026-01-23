<template>
  <div class="app-container">
    <div class="page-header">
      <h1 class="page-title">Division & Department Management</h1>
      <p class="page-subtitle">Manage organizational divisions and departments</p>
    </div>

    <el-card class="filter-card" shadow="never">
      <el-row :gutter="20" justify="space-between">
        <el-col :span="18">
          <el-row :gutter="12">
            <el-col :span="8">
              <el-input
                v-model="filters.search"
                placeholder="Search by name"
                clearable
                @clear="handleSearch"
                @keyup.enter="handleSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </el-col>
            <el-col :span="6">
              <el-select
                v-model="filters.type"
                placeholder="Filter by type"
                clearable
                @change="handleSearch"
                style="width: 100%"
              >
                <el-option label="Department" value="department" />
                <el-option label="Division" value="division" />
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-button type="primary" @click="handleSearch">
                <el-icon><Search /></el-icon>
                Search
              </el-button>
            </el-col>
          </el-row>
        </el-col>
        <el-col :span="6" style="text-align: right">
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            Add New
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="table-card" shadow="never">
      <el-table
        v-loading="loading"
        :data="items"
        style="width: 100%"
        stripe
      >
        <el-table-column type="index" width="60" label="#" />

        <el-table-column prop="name" label="Name" min-width="200" />

        <el-table-column label="Type" width="150">
          <template #default="{ row }">
            <el-tag :type="row.type === 'department' ? 'primary' : 'warning'" size="small">
              {{ row.type?.toUpperCase() }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="description" label="Description" min-width="250">
          <template #default="{ row }">
            {{ row.description || '-' }}
          </template>
        </el-table-column>

        <el-table-column label="Created" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>

        <el-table-column label="Actions" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleEdit(row)"
              :icon="Edit"
              link
            >
              Edit
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(row)"
              :icon="Delete"
              link
            >
              Delete
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 15, 20, 50]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        label-position="left"
      >
        <el-form-item label="Name" prop="name">
          <el-input v-model="form.name" placeholder="Enter name" />
        </el-form-item>

        <el-form-item label="Type" prop="type">
          <el-select v-model="form.type" placeholder="Select type" style="width: 100%">
            <el-option label="Department" value="department">
              <span style="float: left">Department</span>
              <span style="float: right; color: #8492a6;">Organizational department</span>
            </el-option>
            <el-option label="Division" value="division">
              <span style="float: left">Division</span>
              <span style="float: right; color: #8492a6;">Work division</span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="Description" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="Enter description (optional)"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
          {{ isEdit ? 'Update' : 'Create' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import {
  Search,
  Plus,
  Edit,
  Delete
} from '@element-plus/icons-vue'
import {
  getAdminDivisions,
  createAdminDivision,
  updateAdminDivision,
  deleteAdminDivision
} from '@/api/division'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const formRef = ref()
const items = ref([])

const filters = reactive({
  search: '',
  type: ''
})

const pagination = reactive({
  current: 1,
  pageSize: 15,
  total: 0
})

const form = reactive({
  id: null,
  name: '',
  type: 'department',
  description: ''
})

const rules = reactive({
  name: [
    { required: true, message: 'Name is required', trigger: 'blur' },
    { min: 2, max: 255, message: 'Name must be 2-255 characters', trigger: 'blur' }
  ],
  type: [
    { required: true, message: 'Type is required', trigger: 'change' }
  ]
})

const dialogTitle = computed(() => {
  return form.id ? 'Edit Item' : 'Create New Item'
})

const isEdit = computed(() => !!form.id)

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

const fetchItems = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.current,
      per_page: pagination.pageSize,
      search: filters.search || undefined,
      type: filters.type || undefined
    }

    const response = await getAdminDivisions(params)

    items.value = response.data
    pagination.total = response.total
    pagination.current = response.current_page
  } catch (error) {
    console.error('Fetch items error:', error)
    ElMessage.error('Failed to load data')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  fetchItems()
}

const handlePageChange = (page) => {
  pagination.current = page
  fetchItems()
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.current = 1
  fetchItems()
}

const handleCreate = () => {
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  Object.assign(form, {
    id: row.id,
    name: row.name,
    type: row.type,
    description: row.description || ''
  })
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete "${row.name}"? This action cannot be undone.`,
      'Delete Confirmation',
      {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )

    await deleteAdminDivision(row.id)

    ElNotification({
      title: 'Success',
      message: 'Item deleted successfully',
      type: 'success'
    })

    fetchItems()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete error:', error)
      ElMessage.error(error.response?.data?.message || 'Failed to delete item')
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  const isValid = await formRef.value.validate().catch(() => false)
  if (!isValid) return

  submitLoading.value = true

  try {
    const data = {
      name: form.name,
      type: form.type,
      description: form.description || null
    }

    if (isEdit.value) {
      await updateAdminDivision(form.id, data)
      ElNotification({
        title: 'Success',
        message: 'Item updated successfully',
        type: 'success'
      })
    } else {
      await createAdminDivision(data)
      ElNotification({
        title: 'Success',
        message: 'Item created successfully',
        type: 'success'
      })
    }

    dialogVisible.value = false
    fetchItems()
  } catch (error) {
    console.error('Submit error:', error)
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors
      const errorMessages = Object.values(errors).flat().join(', ')
      ElMessage.error(`Validation errors: ${errorMessages}`)
    } else {
      ElMessage.error(error.response?.data?.message || 'Failed to save item')
    }
  } finally {
    submitLoading.value = false
  }
}

const resetForm = () => {
  Object.assign(form, {
    id: null,
    name: '',
    type: 'department',
    description: ''
  })
  formRef.value?.clearValidate()
}

onMounted(() => {
  fetchItems()
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

.filter-card {
  margin-bottom: 20px;
}

.table-card {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table th) {
  background-color: #fafafa;
  color: #606266;
  font-weight: 600;
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid #e4e7ed;
  padding: 20px;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-dialog__footer) {
  border-top: 1px solid #e4e7ed;
  padding: 20px;
}

@media (max-width: 768px) {
  .app-container {
    padding: 16px;
  }

  .page-title {
    font-size: 24px;
  }
}
</style>
