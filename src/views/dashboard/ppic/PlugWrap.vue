<template>
  <div class="dashboard-page">
    <!-- Header -->
    <div class="dashboard-header">
      <h1 class="header-title">📦 DASHBOARD PPIC - Plug Wrap</h1>
    </div>

    <!-- Filters Bar -->
    <div class="filters-bar">
      <div class="filters-container">
        <div class="filters-grid">
          <!-- USER SELECTION -->
          <div class="user-group">
            <span class="filter-group-label">
              <el-icon><User /></el-icon> User
            </span>
            <el-select
              v-model="filters.selectedUser"
              filterable
              class="select-full"
              placeholder="Select User"
              @change="onUserChange"
            >
              <el-option
                v-for="user in userList"
                :key="user"
                :value="user"
                :label="user"
              />
            </el-select>
          </div>

          <!-- FILTERS -->
          <div class="filters-group">
            <span class="filter-group-label">
              <el-icon><Filter /></el-icon> Filters
            </span>
            <el-input
              v-model="filters.searchMaterial"
              placeholder="Search Material"
              clearable
              class="input-full"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>

          <!-- ACTION -->
          <div class="action-group">
            <el-button type="primary" @click="loadData" class="btn-elegant">
              <el-icon><Refresh /></el-icon>
              Load Data
            </el-button>
            <el-button type="success" plain @click="downloadExcel" class="btn-elegant">
              <font-awesome-icon icon="file-excel" />
              Excel
            </el-button>
            <el-button type="danger" plain @click="downloadPDF" class="btn-elegant">
              <font-awesome-icon icon="file-pdf" />
              PDF
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary KPI Cards -->
    <transition name="fade-slide">
      <div v-if="summaryData.user" class="summary-kpi">
        <div class="kpi-card kpi-user">
          <div class="kpi-glow"></div>
          <div class="kpi-icon">👤</div>
          <div class="kpi-content">
            <div class="kpi-label">USER</div>
            <div class="kpi-value">{{ summaryData.user }}</div>
          </div>
        </div>

        <div class="kpi-card kpi-materials">
          <div class="kpi-glow"></div>
          <div class="kpi-icon">📦</div>
          <div class="kpi-content">
            <div class="kpi-label">TOTAL MATERIALS</div>
            <div class="kpi-value">{{ summaryData.totalMaterials }}</div>
          </div>
        </div>

        <div class="kpi-card kpi-status">
          <div class="kpi-glow"></div>
          <div class="kpi-icon">📊</div>
          <div class="kpi-content">
            <div class="kpi-label">LAST UPDATED</div>
            <div class="kpi-value">{{ summaryData.lastUpdate }}</div>
          </div>
        </div>
      </div>
    </transition>

    <div class="main-content-wrapper">
      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <el-icon class="is-loading" :size="50"><Loading /></el-icon>
        <p class="loading-text">Loading PPIC data...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="!tableData.length" class="empty-state">
        <div class="empty-icon">📦</div>
        <h3 class="empty-title">No Data Available</h3>
        <p class="empty-text">Please select a user and click "Refresh Data" to load PPIC information</p>
      </div>

      <!-- Table -->
      <div v-else class="table-container" ref="tableContainer">
        <el-table
          :data="displayTableData"
          stripe
          border
          :max-height="600"
          style="width: 100%"
          :header-cell-style="headerCellStyle"
          :row-class-name="tableRowClassName"
          @sort-change="handleSortChange"
          class="elegant-table"
          @row-click="handleRowClick"
          show-summary
          :summary-method="getSummaries"
        >
          <!-- Fixed Columns: Material No, Deskripsi, Unit -->
          <el-table-column
            prop="matnr"
            label="Material No"
            width="150"
            sortable="custom"
            fixed="left"
            align="left"
          >
            <template #default="scope">
              <div class="cell-material">
                <el-tag type="primary" size="small">{{ scope.row.matnr }}</el-tag>
              </div>
            </template>
          </el-table-column>

          <el-table-column
            prop="maktx"
            label="Deskripsi"
            min-width="250"
            sortable="custom"
            fixed="left"
            align="left"
          >
            <template #default="scope">
              <div class="cell-description">
                {{ scope.row.maktx }}
              </div>
            </template>
          </el-table-column>

          <el-table-column
            prop="meins"
            label="Unit"
            width="100"
            align="left"
          >
            <template #default="scope">
              <div class="cell-unit">{{ scope.row.meins }}</div>
            </template>
          </el-table-column>

          <!-- Dynamic Month Columns -->
          <el-table-column
            v-for="(monthLabel, index) in monthHeaders"
            :key="`month-${index}`"
            :prop="`month${index + 1}`"
            :label="monthLabel"
            width="150"
            align="right"
            sortable="custom"
          >
            <template #default="scope">
              <div class="cell-value">
                {{ formatCellValue(scope.row[`month${index + 1}`], 'number') }}
              </div>
            </template>
          </el-table-column>

          <!-- Other Columns -->
          <el-table-column
            v-for="col in otherColumns"
            :key="col.prop"
            :prop="col.prop"
            :label="col.label"
            :width="col.width"
            align="right"
            sortable="custom"
          >
            <template #default="scope">
              <div
                class="cell-value"
                :style="getCellColorStyle(col.prop, scope.row[col.prop])"
              >
                {{ formatCellValue(scope.row[col.prop], col.type) }}
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- Material Detail Dialog -->
    <el-dialog
      v-model="showDetailDialog"
      :title="`Material Details - ${selectedMaterial?.matnr}`"
      width="70%"
      :before-close="handleCloseDetail"
    >
      <div v-if="materialDetail" class="material-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="Material Code">
            <el-tag type="primary">{{ materialDetail.matnr }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="Description">
            {{ materialDetail.maktx }}
          </el-descriptions-item>
          <el-descriptions-item label="Unit">
            {{ materialDetail.meins }}
          </el-descriptions-item>
          <el-descriptions-item label="User">
            {{ materialDetail.input_user }}
          </el-descriptions-item>
          <el-descriptions-item label="Last Updated">
            {{ formatDate(materialDetail.last_update) }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="additional-info">
          <h4>Monthly Data</h4>
          <el-descriptions :column="3" border>
            <el-descriptions-item
              v-for="(monthLabel, index) in monthHeaders"
              :key="`detail-month-${index}`"
              :label="monthLabel"
            >
              {{ formatCellValue(materialDetail[`month${index + 1}`], 'number') }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="additional-info">
          <h4>Stock Information</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="Total">{{ formatCellValue(materialDetail.total, 'number') }}</el-descriptions-item>
            <el-descriptions-item label="Rata-rata">{{ formatCellValue(materialDetail.average, 'number') }}</el-descriptions-item>
            <el-descriptions-item label="Closing Stock">{{ formatCellValue(materialDetail.closing_stock, 'number') }}</el-descriptions-item>
            <el-descriptions-item label="Manual Stock">{{ formatCellValue(materialDetail.manual_stock, 'number') }}</el-descriptions-item>
            <el-descriptions-item label="Cover Stock">{{ formatCellValue(materialDetail.cover_stock, 'number') }}</el-descriptions-item>
            <el-descriptions-item label="Std Week Cover">{{ formatCellValue(materialDetail.std_week_cover, 'number') }}</el-descriptions-item>
            <el-descriptions-item label="Delivery Time">{{ formatCellValue(materialDetail.deliv_time, 'number') }}</el-descriptions-item>
            <el-descriptions-item label="Outstanding PO">{{ formatCellValue(materialDetail.outstanding_po, 'number') }}</el-descriptions-item>
            <el-descriptions-item label="PR Plan Week">{{ formatCellValue(materialDetail.pr_plan_week, 'number') }}</el-descriptions-item>
            <el-descriptions-item label="PR Plan Qty">{{ formatCellValue(materialDetail.pr_plan_qty, 'number') }}</el-descriptions-item>
            <el-descriptions-item label="Cover Stock PO">{{ formatCellValue(materialDetail.cover_stock_po, 'number') }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
      <div v-else class="loading-detail">
        <el-icon class="is-loading" :size="40"><Loading /></el-icon>
        <p>Loading material details...</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import autoTable from 'jspdf-autotable'
import {
  User,
  Filter,
  Refresh,
  Loading,
  Search
} from '@element-plus/icons-vue'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const route = useRoute()
const router = useRouter()

const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api',
  ENDPOINTS: {
    PPIC_DATA: '/ppic-data',
    PPIC_USERS: '/ppic-users',
    PPIC_SUMMARY: '/ppic-summary',
    PPIC_MATERIAL: '/ppic-material'
  }
}

const loading = ref(false)
const userList = ref([])
const tableData = ref([])
const fullDataCache = ref([])
const tableContainer = ref(null)
const sortState = ref({ prop: '', order: '' })
const showDetailDialog = ref(false)
const selectedMaterial = ref(null)
const materialDetail = ref(null)
const paramMonth = ref(0)
const inputMonth = ref(0)
const inputYear = ref(0)

const filters = reactive({
  selectedUser: '',
  searchMaterial: ''
})

const summaryData = reactive({
  user: '',
  totalMaterials: 0,
  lastUpdate: ''
})

// Month names mapping
const monthNames = {
  1: 'Januari', 2: 'Februari', 3: 'Maret', 4: 'April',
  5: 'Mei', 6: 'Juni', 7: 'Juli', 8: 'Agustus',
  9: 'September', 10: 'Oktober', 11: 'November', 12: 'Desember'
}

// Generate month headers (reversed order like Streamlit)
const monthHeaders = computed(() => {
  if (!paramMonth.value || !inputMonth.value || !inputYear.value) return []

  const headers = []
  let month = inputMonth.value
  let year = inputYear.value

  for (let i = 0; i < paramMonth.value; i++) {
    month -= 1
    if (month <= 0) {
      month = 12
      year -= 1
    }
    headers.push(`${monthNames[month]} ${year}`)
  }

  return headers
})

// Other columns definition (sesuai Streamlit)
const otherColumns = computed(() => [
  { prop: 'total', label: 'Total', width: 150, type: 'number' },
  { prop: 'average', label: 'Rata-rata', width: 150, type: 'number' },
  { prop: 'closing_stock', label: 'Closing Stock', width: 150, type: 'number' },
  { prop: 'manual_stock', label: 'Manual Stock', width: 150, type: 'number' },
  { prop: 'cover_stock', label: 'Cover Stock', width: 150, type: 'number' },
  { prop: 'std_week_cover', label: 'Std Week Cover', width: 150, type: 'number' },
  { prop: 'deliv_time', label: 'Delivery Time', width: 150, type: 'number' },
  { prop: 'outstanding_po', label: 'Outstanding PO', width: 150, type: 'number' },
  { prop: 'pr_plan_week', label: 'PR Plan Week', width: 150, type: 'number' },
  { prop: 'pr_plan_qty', label: 'PR Plan Qty', width: 150, type: 'number' },
  { prop: 'cover_stock_po', label: 'Cover Stock PO', width: 150, type: 'number' }
])

const displayTableData = computed(() => {
  let data = [...tableData.value]

  // Apply search filter
  if (filters.searchMaterial) {
    const searchTerm = filters.searchMaterial.toLowerCase()
    data = data.filter(row =>
      row.matnr.toLowerCase().includes(searchTerm) ||
      row.maktx.toLowerCase().includes(searchTerm)
    )
  }

  // Apply sorting
  if (sortState.value.prop && sortState.value.order) {
    const { prop, order } = sortState.value
    data.sort((a, b) => {
      const aVal = a[prop]
      const bVal = b[prop]

      if (typeof aVal === 'string') {
        return order === 'ascending'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }

      return order === 'ascending' ? aVal - bVal : bVal - aVal
    })
  }

  return data
})

// Calculate totals for summary row
const getSummaries = (param) => {
  const { columns, data } = param
  const sums = []

  columns.forEach((column, index) => {
    // First column shows "TOTAL"
    if (index === 0) {
      sums[index] = 'TOTAL'
      return
    }

    // Skip Material No, Deskripsi, Unit columns
    if (index === 1 || index === 2) {
      sums[index] = ''
      return
    }

    const values = data.map(item => Number(item[column.property]))

    if (!values.every(value => isNaN(value))) {
      const sum = values.reduce((prev, curr) => {
        const value = Number(curr)
        if (!isNaN(value)) {
          return prev + value
        } else {
          return prev
        }
      }, 0)

      sums[index] = formatCellValue(sum, 'number')
    } else {
      sums[index] = '-'
    }
  })

  return sums
}

// Watch for URL changes
watch(() => route.query.user, (newUser) => {
  if (newUser && newUser !== filters.selectedUser) {
    filters.selectedUser = newUser
    onUserChange()
  }
}, { immediate: true })

const handleSortChange = ({ prop, order }) => {
  sortState.value = { prop, order }
}

const formatCellValue = (value, type) => {
  if (value == null || value === '') return '-'

  if (type === 'number') {
    const num = parseFloat(value)
    if (isNaN(num)) return value

    // Format sesuai Streamlit: Indonesian number format
    let formatted = num.toLocaleString('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3
    })

    // Remove trailing zeros after comma
    if (formatted.includes(',')) {
      formatted = formatted.replace(/,?0+$/, '')
    }

    return formatted
  }

  return value
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  } catch {
    return dateStr
  }
}

const tableRowClassName = () => 'data-row'

const headerCellStyle = () => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  fontWeight: 'bold',
  fontSize: '13px',
  padding: '16px 12px',
  borderBottom: '2px solid rgba(255,255,255,0.2)',
  textAlign: 'center'
})

const getCellColorStyle = (prop, value) => {
  const style = {}

  // Add color coding for stock levels
  if (prop.toLowerCase().includes('stock') || prop.toLowerCase().includes('cover')) {
    const num = parseFloat(value)
    if (!isNaN(num)) {
      if (num < 100) {
        style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
        style.color = 'white'
        style.fontWeight = '600'
        style.padding = '8px 12px'
        style.borderRadius = '8px'
      } else if (num < 500) {
        style.background = 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
        style.color = '#1f2937'
        style.fontWeight = '600'
        style.padding = '8px 12px'
        style.borderRadius = '8px'
      } else {
        style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
        style.color = 'white'
        style.fontWeight = '600'
        style.padding = '8px 12px'
        style.borderRadius = '8px'
      }
    }
  }

  return style
}

// Update URL when user changes
const updateURL = (user) => {
  router.push({
    query: { ...route.query, user }
  })
}

const fetchUsers = async () => {
  try {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PPIC_USERS}`
    console.log('🔍 Fetching users from:', url)

    const response = await fetch(url)

    if (response.ok) {
      const result = await response.json()
      console.log('📥 Users response:', result)

      if (result.success && result.data) {
        userList.value = result.data

        // Set initial user from URL or first user
        if (route.query.user && result.data.includes(route.query.user)) {
          filters.selectedUser = route.query.user
        } else if (result.data.length > 0) {
          filters.selectedUser = result.data[0]
          updateURL(filters.selectedUser)
        }
      }
    } else {
      console.error('❌ Failed to fetch users:', response.status, response.statusText)
      ElMessage.error(`Failed to load user list: ${response.status}`)
    }
  } catch (error) {
    console.error('❌ Error fetching users:', error)
    ElMessage.error('Failed to load user list: ' + error.message)
  }
}

const fetchSummary = async (user) => {
  if (!user) return

  try {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PPIC_SUMMARY}?user=${encodeURIComponent(user)}`
    console.log('📊 Fetching summary from:', url)

    const response = await fetch(url)

    if (response.ok) {
      const result = await response.json()
      console.log('📥 Summary response:', result)

      if (result.success && result.data) {
        summaryData.user = result.data.input_user || user
        summaryData.totalMaterials = result.data.total_materials || 0
        summaryData.lastUpdate = formatDate(result.data.last_update)
      }
    } else {
      console.error('❌ Failed to fetch summary:', response.status)
    }
  } catch (error) {
    console.error('❌ Error fetching summary:', error)
  }
}

const onUserChange = async () => {
  if (filters.selectedUser) {
    console.log('👤 User changed to:', filters.selectedUser)
    updateURL(filters.selectedUser)
    await fetchSummary(filters.selectedUser)
    await loadData()
  }
}

const loadData = async () => {
  if (!filters.selectedUser) {
    ElMessage.warning('⚠️ Please select a user first')
    return
  }

  loading.value = true

  try {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PPIC_DATA}?user=${encodeURIComponent(filters.selectedUser)}`
    console.log('📦 Loading data from:', url)

    const response = await fetch(url)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API Error:', response.status, errorText)
      throw new Error(`API Error: ${response.status}`)
    }

    const result = await response.json()
    console.log('📥 Data response:', result)

    if (!result.success) {
      throw new Error(result.error || 'Unknown error')
    }

    let results = result.data || []

    if (results.length === 0) {
      ElMessage.warning(`No data found for user: ${filters.selectedUser}`)
      tableData.value = []
      fullDataCache.value = []
      loading.value = false
      return
    }

    // Extract param_month, input_month, input_year
    if (results.length > 0) {
      paramMonth.value = parseInt(results[0].param_input_month || 0)
      inputMonth.value = parseInt(results[0].input_month || 0)
      inputYear.value = parseInt(results[0].input_year || 0)
    }

    fullDataCache.value = results
    tableData.value = results

    ElMessage.success(`✅ Loaded ${results.length} materials for ${filters.selectedUser}`)
  } catch (error) {
    console.error('❌ Error loading data:', error)
    ElMessage.error('❌ Failed to load data: ' + error.message)
  } finally {
    loading.value = false
  }
}

const handleRowClick = async (row) => {
  selectedMaterial.value = row
  showDetailDialog.value = true
  materialDetail.value = null

  try {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PPIC_MATERIAL}/${row.matnr}?user=${encodeURIComponent(filters.selectedUser)}`
    console.log('🔍 Fetching material detail from:', url)

    const response = await fetch(url)

    if (response.ok) {
      const result = await response.json()
      console.log('📥 Material detail response:', result)

      if (result.success && result.data) {
        materialDetail.value = result.data
      }
    } else {
      console.error('❌ Failed to fetch material detail:', response.status)
      ElMessage.error('Failed to load material details')
    }
  } catch (error) {
    console.error('❌ Error fetching material detail:', error)
    ElMessage.error('Failed to load material details')
  }
}

const handleCloseDetail = () => {
  showDetailDialog.value = false
  selectedMaterial.value = null
  materialDetail.value = null
}

const downloadExcel = () => {
  try {
    if (!displayTableData.value || displayTableData.value.length === 0) {
      ElMessage.warning('⚠️ No data to export')
      return
    }

    const headerInfo = [
      ['PPIC DASHBOARD - PLUG WRAP'],
      [`User: ${summaryData.user}`],
      [`Total Materials: ${summaryData.totalMaterials}`],
      [`Generated: ${new Date().toLocaleString('id-ID')}`],
      []
    ]

    // Build headers: Material No, Deskripsi, Unit, Months..., Others...
    const headers = ['Material No', 'Deskripsi', 'Unit', ...monthHeaders.value, ...otherColumns.value.map(col => col.label)]

    const dataRows = displayTableData.value.map(row => {
      const rowData = [row.matnr, row.maktx, row.meins]

      // Add month values
      for (let i = 1; i <= paramMonth.value; i++) {
        rowData.push(row[`month${i}`])
      }

      // Add other column values
      otherColumns.value.forEach(col => {
        rowData.push(row[col.prop])
      })

      return rowData
    })

    // Calculate totals
    const totalRow = ['TOTAL', '', '']

    // Month totals
    for (let i = 1; i <= paramMonth.value; i++) {
      const values = displayTableData.value.map(row => Number(row[`month${i}`]))
      const sum = values.reduce((prev, curr) => prev + (isNaN(curr) ? 0 : curr), 0)
      totalRow.push(sum)
    }

    // Other column totals
    otherColumns.value.forEach(col => {
      const values = displayTableData.value.map(row => Number(row[col.prop]))
      const sum = values.reduce((prev, curr) => prev + (isNaN(curr) ? 0 : curr), 0)
      totalRow.push(sum)
    })

    const excelData = [
      ...headerInfo,
      headers,
      ...dataRows,
      totalRow
    ]

    const ws = XLSX.utils.aoa_to_sheet(excelData)

    ws['!cols'] = [
      { wch: 15 }, // Material No
      { wch: 40 }, // Deskripsi
      { wch: 10 }, // Unit
      ...monthHeaders.value.map(() => ({ wch: 15 })),
      ...otherColumns.value.map(() => ({ wch: 15 }))
    ]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'PPIC Plug Wrap')

    XLSX.writeFile(wb, `PPIC_PlugWrap_${summaryData.user}_${new Date().getTime()}.xlsx`)
    ElMessage.success('✅ Excel downloaded successfully!')
  } catch (err) {
    console.error(err)
    ElMessage.error('❌ Failed to download Excel')
  }
}

const downloadPDF = () => {
  try {
    if (!displayTableData.value || displayTableData.value.length === 0) {
      ElMessage.warning('⚠️ No data to export')
      return
    }

    ElMessage.info('📄 Generating PDF...')

    const doc = new jsPDF('landscape', 'mm', 'a4')

    // Add title
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('PPIC DASHBOARD - PLUG WRAP', 14, 15)

    // Add metadata
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`User: ${summaryData.user}`, 14, 22)
    doc.text(`Total Materials: ${summaryData.totalMaterials}`, 14, 27)
    doc.text(`Generated: ${new Date().toLocaleString('id-ID')}`, 14, 32)

    // Prepare table headers (limit months to first 6 for PDF width)
    const limitedMonths = monthHeaders.value.slice(0, Math.min(6, monthHeaders.value.length))
    const headers = [['Material No', 'Deskripsi', 'Unit', ...limitedMonths, 'Total', 'Closing Stock']]

    // Prepare table data
    const tableRows = displayTableData.value.map(row => {
      const rowData = [row.matnr, row.maktx, row.meins]

      // Add limited month values
      for (let i = 1; i <= Math.min(6, paramMonth.value); i++) {
        rowData.push(formatCellValue(row[`month${i}`], 'number'))
      }

      rowData.push(formatCellValue(row.total, 'number'))
      rowData.push(formatCellValue(row.closing_stock, 'number'))

      return rowData
    })

    // Calculate totals
    const totalRow = ['TOTAL', '', '']

    for (let i = 1; i <= Math.min(6, paramMonth.value); i++) {
      const values = displayTableData.value.map(row => Number(row[`month${i}`]))
      const sum = values.reduce((prev, curr) => prev + (isNaN(curr) ? 0 : curr), 0)
      totalRow.push(formatCellValue(sum, 'number'))
    }

    const totalValues = displayTableData.value.map(row => Number(row.total))
    const totalSum = totalValues.reduce((prev, curr) => prev + (isNaN(curr) ? 0 : curr), 0)
    totalRow.push(formatCellValue(totalSum, 'number'))

    const closingValues = displayTableData.value.map(row => Number(row.closing_stock))
    const closingSum = closingValues.reduce((prev, curr) => prev + (isNaN(curr) ? 0 : curr), 0)
    totalRow.push(formatCellValue(closingSum, 'number'))

    tableRows.push(totalRow)

    // ✅ Gunakan autoTable (bukan doc.autoTable)
    autoTable(doc, {
      head: headers,
      body: tableRows,
      startY: 38,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [102, 126, 234],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 25 },
        1: { halign: 'left', cellWidth: 50 },
        2: { halign: 'left', cellWidth: 15 },
      },
      didParseCell: function(data) {
        // Align numbers to right
        if (data.column.index >= 3) {
          data.cell.styles.halign = 'right'
        }

        // Style total row
        if (data.row.index === tableRows.length - 1) {
          data.cell.styles.fillColor = [231, 230, 230]
          data.cell.styles.fontStyle = 'bold'
          data.cell.styles.textColor = [0, 0, 0]
        }
      },
      margin: { top: 38, right: 14, bottom: 14, left: 14 },
    })

    // Save PDF
    doc.save(`PPIC_PlugWrap_${summaryData.user}_${new Date().getTime()}.pdf`)
    ElMessage.success('✅ PDF downloaded successfully!')

  } catch (error) {
    console.error('PDF generation error:', error)
    ElMessage.error('❌ Failed to generate PDF: ' + error.message)
  }
}

onMounted(async () => {
  console.log('🚀 Component mounted')
  console.log('📍 Current route query:', route.query)

  await fetchUsers()

  if (filters.selectedUser) {
    await fetchSummary(filters.selectedUser)
    await loadData()
  }
})
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%);
}

.dashboard-header {
  background: linear-gradient(135deg, #1f77b4 0%, #2196F3 100%);
  color: white;
  padding: 1.5rem 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-title {
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0;
}

.filters-bar {
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.filters-container {
  max-width: 100%;
  padding: 1rem 2rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: minmax(250px, auto) minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: center;
}

.user-group {
  display: grid;
  grid-template-columns: auto minmax(150px, 1fr);
  gap: 0.5rem;
  align-items: center;
}

.filters-group {
  display: grid;
  grid-template-columns: auto minmax(200px, 1fr);
  gap: 0.5rem;
  align-items: center;
}

.action-group {
  display: flex;
  gap: 0.5rem;
  white-space: nowrap;
}

.filter-group-label {
  font-weight: 600;
  font-size: 0.8rem;
  color: #374151;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.select-full,
.input-full {
  width: 100% !important;
}

.btn-elegant {
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-elegant:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.summary-kpi {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin: 1.5rem 2rem;
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.kpi-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 1.5rem 1.75rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.kpi-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
}

.kpi-glow {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
  background-size: 200% 100%;
  animation: glow 3s ease infinite;
}

@keyframes glow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.kpi-user .kpi-glow {
  background: linear-gradient(90deg, #3b82f6, #2563eb);
}

.kpi-materials .kpi-glow {
  background: linear-gradient(90deg, #8b5cf6, #7c3aed);
}

.kpi-status .kpi-glow {
  background: linear-gradient(90deg, #ec4899, #db2777);
}

.kpi-icon {
  font-size: 2.5rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.kpi-content {
  flex: 1;
}

.kpi-label {
  font-size: 0.7rem;
  letter-spacing: 0.15em;
  font-weight: 700;
  color: #6b7280;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}

.kpi-value {
  font-size: 1.6rem;
  font-weight: 800;
  color: #111827;
  white-space: nowrap;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.5s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.main-content-wrapper {
  padding: 1.5rem 2rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.loading-text {
  margin-top: 1rem;
  color: #6b7280;
  font-size: 1rem;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.empty-text {
  color: #6b7280;
  font-size: 1rem;
  line-height: 1.6;
}

.table-container {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.elegant-table {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.el-table) {
  border-radius: 12px;
  overflow: visible !important;
}

:deep(.el-table .data-row) {
  transition: all 0.3s ease;
  cursor: pointer;
}

:deep(.el-table .data-row:hover) {
  background-color: #f3f4f6 !important;
}

:deep(.el-table__footer-wrapper) {
  background: #E7E6E6;
}

:deep(.el-table__footer) {
  background: #E7E6E6;
  font-weight: 700;
  color: #1f2937;
}

:deep(.el-table__footer .cell) {
  font-size: 13px;
  padding: 12px 8px;
  font-weight: 700;
}

.cell-material {
  display: flex;
  align-items: center;
}

.cell-description {
  font-weight: 500;
  color: #1f2937;
}

.cell-unit {
  font-weight: 500;
  color: #6b7280;
}

.cell-value {
  display: inline-block;
  transition: all 0.3s ease;
}

.material-detail {
  padding: 1rem 0;
}

.additional-info {
  margin-top: 2rem;
}

.additional-info h4 {
  margin-bottom: 1rem;
  color: #1f2937;
  font-size: 1.1rem;
}

.loading-detail {
  text-align: center;
  padding: 3rem;
}

.loading-detail p {
  margin-top: 1rem;
  color: #6b7280;
}

@media (max-width: 1200px) {
  .filters-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .summary-kpi {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .header-title {
    font-size: 1.25rem;
  }

  .filters-container {
    padding: 0.75rem 1rem;
  }

  .main-content-wrapper {
    padding: 1rem;
  }

  .summary-kpi {
    margin: 1rem;
  }

  .kpi-value {
    font-size: 1.2rem;
  }
}
</style>
