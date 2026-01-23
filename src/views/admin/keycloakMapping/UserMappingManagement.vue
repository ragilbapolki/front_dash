<template>
  <div class="app-container">
    <!-- Header -->
    <div class="page-header mb-4">
      <h2>User Permission Mapping</h2>
      <p class="text-muted">Assign menu permissions to users</p>
    </div>

    <!-- Filter Section -->
    <div class="filter-container mb-4">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            v-model="filters.search"
            placeholder="Search by name or email"
            clearable
            @input="handleFilter"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <!-- <el-col :span="6">
          <el-select
            v-model="filters.hasPermissions"
            placeholder="Filter by Status"
            clearable
            @change="handleFilter"
          >
            <el-option label="All Users" value="" />
            <el-option label="With Permissions" value="true" />
            <el-option label="Without Permissions" value="false" />
          </el-select>
        </el-col> -->
        <el-col :span="4">
          <!-- <el-button type="success" @click="openBulkAssignDialog">
            <el-icon><CopyDocument /></el-icon>
            Bulk Assign
          </el-button> -->
        </el-col>
        <el-col :span="2">
          <el-button @click="refreshData">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </el-col>
      </el-row>
    </div>

    <!-- Users Table -->
    <el-table
      :data="tableData"
      border
      stripe
      v-loading="loading"
      style="width: 100%"
    >
      <el-table-column type="index" label="No" width="60" align="center" />

      <el-table-column label="User" min-width="250">
        <template #default="scope">
          <div class="user-cell">
            <el-avatar :size="36" class="mr-2">
              {{ scope.row.name.charAt(0).toUpperCase() }}
            </el-avatar>
            <div>
              <div class="user-name">{{ scope.row.name }}</div>
              <div class="user-email">{{ scope.row.email }}</div>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Permissions" width="150" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.permissions_count > 0 ? 'success' : 'info'" size="small">
            {{ scope.row.permissions_count }} permissions
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="Last Updated" width="180" align="center">
        <template #default="scope">
          <span>{{ formatDate(scope.row.updated_at) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Actions" width="280" align="center" fixed="right">
        <template #default="scope">
          <el-button
            type="primary"
            size="small"
            @click="openPermissionDialog(scope.row)"
          >
            <el-icon><Setting /></el-icon>
            Manage Permissions
          </el-button>
          <!-- <el-button
            type="success"
            size="small"
            @click="openCloneDialog(scope.row)"
            link
          >
            <el-icon><CopyDocument /></el-icon>
            Clone
          </el-button> -->
        </template>
      </el-table-column>
    </el-table>

    <!-- Pagination -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- Permission Management Dialog -->
    <el-dialog
      v-model="permissionDialogVisible"
      :title="`Manage Permissions - ${selectedUser?.name}`"
      width="900px"
      top="5vh"
      :close-on-click-modal="false"
    >
      <div v-if="selectedUser" class="dialog-content">
        <!-- Quick Actions -->
        <el-row :gutter="10" class="mb-3">
          <el-col :span="24">
            <el-space wrap>
              <el-button size="small" @click="selectAllPermissions">
                <el-icon><Select /></el-icon>
                Select All
              </el-button>
              <el-button size="small" @click="clearAllPermissions">
                <el-icon><CircleClose /></el-icon>
                Clear All
              </el-button>
              <el-divider direction="vertical" />
              <span class="text-muted">Selected: {{ selectedPermissions.length }} permissions</span>
            </el-space>
          </el-col>
        </el-row>

        <!-- Module Tabs -->
        <el-tabs v-model="activeModule" type="card">
          <el-tab-pane
            v-for="module in availableModules"
            :key="module"
            :name="module"
          >
            <template #label>
              <span class="tab-label">
                {{ formatModuleName(module) }}
                <el-badge
                  :value="getModuleSelectedCount(module)"
                  :max="99"
                  :hidden="getModuleSelectedCount(module) === 0"
                  class="ml-2"
                />
              </span>
            </template>

            <div class="module-content">
              <!-- Module Actions -->
              <div class="module-actions mb-3">
                <el-checkbox
                  :model-value="isModuleFullySelected(module)"
                  :indeterminate="isModulePartiallySelected(module)"
                  @change="toggleModulePermissions(module)"
                >
                  <strong>Select All {{ formatModuleName(module) }}</strong>
                </el-checkbox>
              </div>

              <!-- Permission List -->
              <div class="permission-grid">
                <el-checkbox
                  v-for="permission in getModulePermissions(module)"
                  :key="permission.id"
                  v-model="selectedPermissions"
                  :label="permission.name"
                  class="permission-checkbox"
                >
                  <div class="permission-info">
                    <div class="permission-title">{{ permission.display_name }}</div>
                    <div class="permission-desc">{{ permission.description }}</div>
                    <el-tag size="small" type="info" class="mt-1">{{ permission.name }}</el-tag>
                  </div>
                </el-checkbox>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="permissionDialogVisible = false">Cancel</el-button>
          <el-button
            type="primary"
            @click="saveUserPermissions"
            :loading="saveLoading"
          >
            <el-icon><Check /></el-icon>
            Save Permissions
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Clone Permissions Dialog -->
    <el-dialog
      v-model="cloneDialogVisible"
      title="Clone Permissions"
      width="500px"
    >
      <div v-if="selectedUser">
        <el-alert
          title="Clone permissions from another user"
          type="info"
          :closable="false"
          class="mb-3"
        />

        <p class="mb-3">
          Clone permissions to: <strong>{{ selectedUser.name }}</strong>
        </p>

        <el-form label-width="120px">
          <el-form-item label="Source User">
            <el-select
              v-model="cloneSourceUserId"
              placeholder="Select user to clone from"
              filterable
              style="width: 100%"
            >
              <el-option
                v-for="user in users.filter(u => u.id !== selectedUser.id)"
                :key="user.id"
                :label="`${user.name} (${user.permissions_count} permissions)`"
                :value="user.id"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="cloneDialogVisible = false">Cancel</el-button>
        <el-button
          type="primary"
          @click="clonePermissions"
          :loading="cloneLoading"
          :disabled="!cloneSourceUserId"
        >
          Clone
        </el-button>
      </template>
    </el-dialog>

    <!-- Bulk Assign Dialog -->
    <el-dialog
      v-model="bulkDialogVisible"
      title="Bulk Assign Permissions"
      width="700px"
    >
      <el-alert
        title="Assign permissions to multiple users at once"
        type="warning"
        :closable="false"
        class="mb-3"
      />

      <el-form label-width="140px">
        <el-form-item label="Select Users">
          <el-select
            v-model="bulkSelectedUsers"
            placeholder="Select users"
            multiple
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="user in users"
              :key="user.id"
              :label="user.name"
              :value="user.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Select Module">
          <el-select
            v-model="bulkSelectedModule"
            placeholder="Select module"
            @change="loadModulePermissions"
            style="width: 100%"
          >
            <el-option
              v-for="module in availableModules"
              :key="module"
              :label="formatModuleName(module)"
              :value="module"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Permissions" v-if="bulkSelectedModule">
          <el-checkbox-group v-model="bulkSelectedPermissions">
            <el-checkbox
              v-for="permission in getModulePermissions(bulkSelectedModule)"
              :key="permission.id"
              :label="permission.id"
              class="bulk-permission-item"
            >
              {{ permission.display_name }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="bulkDialogVisible = false">Cancel</el-button>
        <el-button
          type="primary"
          @click="bulkAssignPermissions"
          :loading="bulkLoading"
          :disabled="bulkSelectedUsers.length === 0 || bulkSelectedPermissions.length === 0"
        >
          Assign to {{ bulkSelectedUsers.length }} User(s)
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search, Refresh, Setting, CopyDocument, Select,
  CircleClose, Check
} from '@element-plus/icons-vue'

// State
const users = ref([])
const permissions = ref([])
const loading = ref(false)

const filters = reactive({
  search: '',
  hasPermissions: ''
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// Dialog States
const permissionDialogVisible = ref(false)
const cloneDialogVisible = ref(false)
const bulkDialogVisible = ref(false)

const selectedUser = ref(null)
const selectedPermissions = ref([])
const activeModule = ref('dashboard')

const cloneSourceUserId = ref(null)
const cloneLoading = ref(false)

const bulkSelectedUsers = ref([])
const bulkSelectedModule = ref('')
const bulkSelectedPermissions = ref([])
const bulkLoading = ref(false)

const saveLoading = ref(false)

// Computed
const tableData = computed(() => {
  let result = [...users.value]

  if (filters.search) {
    const search = filters.search.toLowerCase()
    result = result.filter(user =>
      user.name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search)
    )
  }

  if (filters.hasPermissions) {
    const hasPerms = filters.hasPermissions === 'true'
    result = result.filter(user =>
      hasPerms ? user.permissions_count > 0 : user.permissions_count === 0
    )
  }

  pagination.total = result.length

  const start = (pagination.currentPage - 1) * pagination.pageSize
  const end = start + pagination.pageSize

  return result.slice(start, end)
})

const availableModules = computed(() => {
  const modules = [...new Set(permissions.value.map(p => p.module))]
  return modules.sort()
})

// Methods
const formatModuleName = (module) => {
  return module
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getModulePermissions = (module) => {
  return permissions.value.filter(p => p.module === module)
}

const getModuleSelectedCount = (module) => {
  const modulePermIds = getModulePermissions(module).map(p => p.id)
  return selectedPermissions.value.filter(id => modulePermIds.includes(id)).length
}

const isModuleFullySelected = (module) => {
  const modulePerms = getModulePermissions(module).map(p => p.id)
  return modulePerms.length > 0 &&
         modulePerms.every(id => selectedPermissions.value.includes(id))
}

const isModulePartiallySelected = (module) => {
  const modulePerms = getModulePermissions(module).map(p => p.id)
  const selected = modulePerms.filter(id => selectedPermissions.value.includes(id))
  return selected.length > 0 && selected.length < modulePerms.length
}

const toggleModulePermissions = (module) => {
  const modulePerms = getModulePermissions(module).map(p => p.id)

  if (isModuleFullySelected(module)) {
    selectedPermissions.value = selectedPermissions.value.filter(
      id => !modulePerms.includes(id)
    )
  } else {
    selectedPermissions.value = [
      ...new Set([...selectedPermissions.value, ...modulePerms])
    ]
  }
}

const selectAllPermissions = () => {
  selectedPermissions.value = permissions.value.map(p => p.id)
}

const clearAllPermissions = () => {
  selectedPermissions.value = []
}

const openPermissionDialog = async (user) => {
  selectedUser.value = user
  activeModule.value = availableModules.value[0] || 'dashboard'

  try {
    const response = await fetch(`/api/users/${user.id}/permissions`)
    const data = await response.json()

    if (data.success) {
      // Convert to permission names for the checkboxes
      selectedPermissions.value = data.data.map(p => p.name)
      console.log('Loaded permissions:', selectedPermissions.value)
    }
  } catch (error) {
    console.error('Load permissions error:', error)
    ElMessage.error('Failed to load user permissions')
  }

  permissionDialogVisible.value = true
}

const saveUserPermissions = async () => {
  if (!selectedUser.value) return

  saveLoading.value = true
  try {
    // Convert permission names to IDs
    const permissionIds = selectedPermissions.value.map(name => {
      const perm = permissions.value.find(p => p.name === name)
      return perm ? perm.id : null
    }).filter(id => id !== null)

    const response = await fetch(`/api/users/${selectedUser.value.id}/permissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        permission_ids: permissionIds // Send IDs instead of names
      })
    })

    const data = await response.json()

    if (data.success) {
      ElMessage.success('Permissions updated successfully')
      permissionDialogVisible.value = false
      await fetchUsers()
    } else {
      ElMessage.error(data.message || 'Failed to update permissions')
    }
  } catch (error) {
    console.error('Save error:', error)
    ElMessage.error('Failed to update permissions')
  } finally {
    saveLoading.value = false
  }
}

const openCloneDialog = (user) => {
  selectedUser.value = user
  cloneSourceUserId.value = null
  cloneDialogVisible.value = true
}

const clonePermissions = async () => {
  if (!selectedUser.value || !cloneSourceUserId.value) return

  cloneLoading.value = true
  try {
    const response = await fetch('/api/permissions/clone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source_user_id: cloneSourceUserId.value,
        target_user_id: selectedUser.value.id
      })
    })

    const data = await response.json()

    if (data.success) {
      ElMessage.success(data.message)
      cloneDialogVisible.value = false
      await fetchUsers()
    }
  } catch (error) {
    console.error('Clone error:', error)
    ElMessage.error('Failed to clone permissions')
  } finally {
    cloneLoading.value = false
  }
}

const openBulkAssignDialog = () => {
  bulkSelectedUsers.value = []
  bulkSelectedModule.value = ''
  bulkSelectedPermissions.value = []
  bulkDialogVisible.value = true
}

const loadModulePermissions = () => {
  bulkSelectedPermissions.value = []
}

const bulkAssignPermissions = async () => {
  if (bulkSelectedUsers.value.length === 0 || bulkSelectedPermissions.value.length === 0) {
    ElMessage.warning('Please select users and permissions')
    return
  }

  try {
    await ElMessageBox.confirm(
      `This will add ${bulkSelectedPermissions.value.length} permission(s) to ${bulkSelectedUsers.value.length} user(s). Continue?`,
      'Confirm Bulk Assignment',
      { type: 'warning' }
    )
  } catch {
    return
  }

  bulkLoading.value = true
  try {
    const updates = bulkSelectedUsers.value.map(async userId => {
      // Get current user permissions
      const currentRes = await fetch(`/api/users/${userId}/permissions`)
      const currentData = await currentRes.json()
      const currentPermIds = currentData.data?.map(p => p.id) || []

      // Merge with new permissions
      const mergedPerms = [...new Set([...currentPermIds, ...bulkSelectedPermissions.value])]

      // Update
      return fetch(`/api/users/${userId}/permissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permission_ids: mergedPerms })
      })
    })

    await Promise.all(updates)

    ElMessage.success(`Successfully assigned permissions to ${bulkSelectedUsers.value.length} user(s)`)
    bulkDialogVisible.value = false
    await fetchUsers()
  } catch (error) {
    console.error('Bulk assign error:', error)
    ElMessage.error('Failed to bulk assign permissions')
  } finally {
    bulkLoading.value = false
  }
}

const handleFilter = () => {
  pagination.currentPage = 1
}

const handleSizeChange = (val) => {
  pagination.pageSize = val
}

const handleCurrentChange = (val) => {
  pagination.currentPage = val
}

const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await fetch('/api/users')
    const data = await response.json()

    if (data.success) {
      users.value = data.data || []
    }
  } catch (error) {
    console.error('Fetch users error:', error)
    ElMessage.error('Failed to load users')
  } finally {
    loading.value = false
  }
}

const fetchPermissions = async () => {
  try {
    const response = await fetch('/api/permissions')
    const data = await response.json()

    if (data.success) {
      // Keep full permission objects with both id and name
      permissions.value = data.data || []
    }
  } catch (error) {
    console.error('Fetch permissions error:', error)
  }
}

const refreshData = async () => {
  await Promise.all([fetchUsers(), fetchPermissions()])
  ElMessage.success('Data refreshed')
}

onMounted(() => {
  fetchUsers()
  fetchPermissions()
})
</script>

<style scoped>
.app-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.text-muted {
  color: #909399;
  font-size: 14px;
}

.filter-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-cell {
  display: flex;
  align-items: center;
}

.user-name {
  font-weight: 500;
  color: #303133;
  font-size: 14px;
}

.user-email {
  color: #909399;
  font-size: 12px;
  margin-top: 2px;
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

.dialog-content {
  max-height: 65vh;
  overflow-y: auto;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.module-content {
  padding: 16px 0;
}

.module-actions {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
}

.permission-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.permission-checkbox {
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background: white;
  transition: all 0.2s;
  height: auto;
  align-items: flex-start;
}

.permission-checkbox:hover {
  border-color: #409eff;
  background: #f0f9ff;
}

.permission-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-left: 8px;
}

.permission-title {
  font-weight: 500;
  color: #303133;
  font-size: 14px;
}

.permission-desc {
  color: #606266;
  font-size: 12px;
  line-height: 1.4;
}

.bulk-permission-item {
  display: block;
  margin-bottom: 8px;
}

.mb-2 {
  margin-bottom: 8px;
}

.mb-3 {
  margin-bottom: 12px;
}

.mb-4 {
  margin-bottom: 16px;
}

.mr-2 {
  margin-right: 8px;
}

.ml-2 {
  margin-left: 8px;
}

.mt-1 {
  margin-top: 4px;
}

:deep(.el-table) {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

:deep(.el-checkbox) {
  height: auto;
  white-space: normal;
}

:deep(.el-checkbox__label) {
  white-space: normal;
  line-height: 1.5;
}

:deep(.el-tabs__item) {
  height: 50px;
  line-height: 50px;
}
</style>
