<template>
  <div class="app-container">
    <div class="page-header">
      <h1 class="page-title">User Management</h1>
      <p class="page-subtitle">Manage system users and their permissions</p>
    </div>

    <el-card class="filter-card" shadow="never">
      <el-row :gutter="20" justify="space-between">
        <el-col :span="18">
          <el-row :gutter="12">
            <el-col :span="6">
              <el-input
                v-model="filters.search"
                placeholder="Search by name, email, or position"
                clearable
                @clear="handleSearch"
                @keyup.enter="handleSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </el-col>
            <el-col :span="5">
              <el-select
                v-model="filters.role"
                placeholder="Filter by role"
                clearable
                @change="handleSearch"
                style="width: 100%"
              >
                <el-option label="Admin" value="admin" />
                <el-option label="User" value="user" />
              </el-select>
            </el-col>
            <el-col :span="5">
              <el-select
                v-model="filters.departemen_id"
                placeholder="Filter by department"
                clearable
                filterable
                @change="handleSearch"
                style="width: 100%"
              >
                <el-option
                  v-for="dept in departments"
                  :key="dept.id"
                  :label="dept.name"
                  :value="dept.id"
                />
              </el-select>
            </el-col>
            <el-col :span="5">
              <el-select
                v-model="filters.divisi_id"
                placeholder="Filter by division"
                clearable
                filterable
                @change="handleSearch"
                style="width: 100%"
              >
                <el-option
                  v-for="div in divisions"
                  :key="div.id"
                  :label="div.name"
                  :value="div.id"
                />
              </el-select>
            </el-col>
            <el-col :span="3">
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
            Add User
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="table-card" shadow="never">
      <el-table
        v-loading="loading"
        :data="users"
        style="width: 100%"
        stripe
      >
        <el-table-column type="index" width="60" label="#" />

        <el-table-column label="Avatar" width="80">
          <template #default="{ row }">
            <el-avatar
              :size="40"
              :src="row.avatar_url"
              :icon="UserFilled"
            />
          </template>
        </el-table-column>

        <el-table-column prop="name" label="Name" min-width="150" />
        <el-table-column prop="email" label="Email" min-width="180" />

        <el-table-column label="Role" width="100">
          <template #default="{ row }">
            <el-tag :type="
              row.role === 'admin'
                ? 'danger'
                : row.role === 'editor'
                ? 'warning'
                : row.role === 'user'
                ? 'success'
                : 'info'
            "
            size="small"
          >
            {{ row.role.toUpperCase() }}
          </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="position" label="Position" min-width="130">
          <template #default="{ row }">
            {{ row.position || '-' }}
          </template>
        </el-table-column>

        <el-table-column label="Department" min-width="130">
          <template #default="{ row }">
            <el-tag v-if="row.department" type="info" size="small">
              {{ row.department.name }}
            </el-tag>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>

        <el-table-column label="Division" min-width="130">
          <template #default="{ row }">
            <el-tag v-if="row.division" type="warning" size="small">
              {{ row.division.name }}
            </el-tag>
            <span v-else class="text-muted">-</span>
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
          <el-input v-model="form.name" placeholder="Enter full name" />
        </el-form-item>

        <el-form-item label="Email" prop="email">
          <el-input v-model="form.email" placeholder="Enter email address" />
        </el-form-item>

        <el-form-item label="Password" :prop="isEdit ? '' : 'password'">
          <el-input
            v-model="form.password"
            type="password"
            :placeholder="isEdit ? 'Leave empty to keep current' : 'Enter password'"
            show-password
          />
        </el-form-item>

        <el-form-item label="Role" prop="role">
          <el-select v-model="form.role" placeholder="Select role" style="width: 100%">
            <el-option label="Admin" value="admin">
              <span style="float: left">Admin</span>
              <span style="float: right; color: #8492a6;">Full access</span>
            </el-option>
            <el-option label="Editor" value="editor">
              <span style="float: left">Editor</span>
              <span style="float: right; color: #8492a6;">Can create/edit/publish articles</span>
            </el-option>
            <el-option label="User" value="user">
              <span style="float: left">User</span>
              <span style="float: right; color: #8492a6;">Limited access</span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="Position" prop="position">
          <el-input v-model="form.position" placeholder="e.g. Manager, Staff, etc." />
        </el-form-item>

        <el-form-item label="Department" prop="departemen_id">
          <el-select
            v-model="form.departemen_id"
            placeholder="Select department"
            filterable
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="dept in departments"
              :key="dept.id"
              :label="dept.name"
              :value="dept.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Division" prop="divisi_id">
          <el-select
            v-model="form.divisi_id"
            placeholder="Select division"
            filterable
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="div in divisions"
              :key="div.id"
              :label="div.name"
              :value="div.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Moto" prop="moto">
          <el-input
            v-model="form.moto"
            type="textarea"
            :rows="3"
            placeholder="Personal moto or tagline"
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
  Delete,
  UserFilled
} from '@element-plus/icons-vue'
import {
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser
} from '@/api/user'
import { getAdminDivisions } from '@/api/division'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const formRef = ref()
const users = ref([])
const departments = ref([])
const divisions = ref([])

const filters = reactive({
  search: '',
  role: '',
  departemen_id: null,
  divisi_id: null
})

const pagination = reactive({
  current: 1,
  pageSize: 15,
  total: 0
})

const form = reactive({
  id: null,
  name: '',
  email: '',
  password: '',
  role: 'user',
  position: '',
  moto: '',
  departemen_id: null,
  divisi_id: null
})

const rules = reactive({
  name: [
    { required: true, message: 'Name is required', trigger: 'blur' },
    { min: 3, max: 255, message: 'Name must be 3-255 characters', trigger: 'blur' }
  ],
  email: [
    { required: true, message: 'Email is required', trigger: 'blur' },
    { type: 'email', message: 'Please enter a valid email', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Password is required', trigger: 'blur' },
    { min: 8, message: 'Password must be at least 8 characters', trigger: 'blur' }
  ],
  role: [
    { required: true, message: 'Role is required', trigger: 'change' }
  ]
})

const dialogTitle = computed(() => {
  return form.id ? 'Edit User' : 'Create New User'
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

const fetchUsers = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.current,
      per_page: pagination.pageSize,
      search: filters.search || undefined,
      role: filters.role || undefined,
      departemen_id: filters.departemen_id || undefined,
      divisi_id: filters.divisi_id || undefined
    }

    const response = await getAdminUsers(params)
    console.info(response)

    users.value = response.data
    pagination.total = response.total
    pagination.current = response.current_page
  } catch (error) {
    console.error('Fetch users error:', error)
    ElMessage.error('Failed to load users')
  } finally {
    loading.value = false
  }
}

const fetchDepartments = async () => {
  try {
    const response = await getAdminDivisions({ all: 'true', type: 'department' })
    departments.value = response.data || []
  } catch (error) {
    console.error('Fetch departments error:', error)
  }
}

const fetchDivisions = async () => {
  try {
    const response = await getAdminDivisions({ all: 'true', type: 'division' })
    divisions.value = response.data || []
  } catch (error) {
    console.error('Fetch divisions error:', error)
  }
}

const handleSearch = () => {
  pagination.current = 1
  fetchUsers()
}

const handlePageChange = (page) => {
  pagination.current = page
  fetchUsers()
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.current = 1
  fetchUsers()
}

const handleCreate = () => {
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  Object.assign(form, {
    id: row.id,
    name: row.name,
    email: row.email,
    password: '',
    role: row.role,
    position: row.position || '',
    moto: row.moto || '',
    departemen_id: row.departemen_id,
    divisi_id: row.divisi_id
  })
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete user "${row.name}"? This action cannot be undone.`,
      'Delete User',
      {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )

    await deleteAdminUser(row.id)

    ElNotification({
      title: 'Success',
      message: 'User deleted successfully',
      type: 'success'
    })

    fetchUsers()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete error:', error)
      ElMessage.error(error.response?.data?.message || 'Failed to delete user')
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
      email: form.email,
      role: form.role,
      position: form.position || null,
      moto: form.moto || null,
      departemen_id: form.departemen_id || null,
      divisi_id: form.divisi_id || null
    }

    if (form.password) {
      data.password = form.password
    }

    if (isEdit.value) {
      await updateAdminUser(form.id, data)
      ElNotification({
        title: 'Success',
        message: 'User updated successfully',
        type: 'success'
      })
    } else {
      data.password = form.password
      await createAdminUser(data)
      ElNotification({
        title: 'Success',
        message: 'User created successfully',
        type: 'success'
      })
    }

    dialogVisible.value = false
    fetchUsers()
  } catch (error) {
    console.error('Submit error:', error)
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors
      const errorMessages = Object.values(errors).flat().join(', ')
      ElMessage.error(`Validation errors: ${errorMessages}`)
    } else {
      ElMessage.error(error.response?.data?.message || 'Failed to save user')
    }
  } finally {
    submitLoading.value = false
  }
}

const resetForm = () => {
  Object.assign(form, {
    id: null,
    name: '',
    email: '',
    password: '',
    role: 'user',
    position: '',
    moto: '',
    departemen_id: null,
    divisi_id: null
  })
  formRef.value?.clearValidate()
}

onMounted(async () => {
  await fetchDepartments()
  await fetchDivisions()
  await fetchUsers()
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

.text-muted {
  color: #909399;
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

  :deep(.el-table__column) {
    font-size: 12px;
  }
}
</style>
