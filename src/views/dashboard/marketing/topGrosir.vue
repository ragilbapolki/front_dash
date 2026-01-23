<!-- DashboardTopGrosir.vue -->
<template>
  <div class="dashboard-page">
    <div class="dashboard-header">
      <h1 class="header-title">🏪 DASHBOARD TOP 27 GROSIR</h1>
    </div>

    <div class="filters-bar">
      <div class="filters-container">
        <div class="filters-grid">
          <div class="period-group">
            <span class="filter-group-label">
              <el-icon><Calendar /></el-icon> Period
            </span>
            <div class="period-controls">
              <el-select v-model="filters.selectedYear" class="select-sm" placeholder="Year">
                <el-option v-for="year in availableYears" :key="year" :value="year" :label="year" />
              </el-select>
              <el-select v-model="filters.selectedWeek" class="select-sm" placeholder="Week">
                <el-option v-for="week in availableWeeks" :key="week" :value="week" :label="`Week ${week}`" />
              </el-select>
            </div>
            <el-select
              v-model="filters.selectedArea"
              filterable
              placeholder="Pilih Area"
              class="select-area"
              :loading="loadingAreas"
            >
              <el-option
                v-for="area in areaOptions"
                :key="area.value"
                :value="area.value"
                :label="area.label"
              />
            </el-select>
          </div>

          <div class="filters-group">
            <span class="filter-group-label">
              <el-icon><Filter /></el-icon> Filters
            </span>
            <el-select v-model="filters.selectedFamily" multiple collapse-tags class="select-full" placeholder="Select Family">
              <el-option v-for="f in familyList" :key="f" :value="f" :label="f" />
            </el-select>
            <el-select v-model="filters.selectedTobacco" multiple collapse-tags class="select-full" placeholder="Select Tobacco">
              <el-option v-for="t in tobaccoList" :key="t" :value="t" :label="t" />
            </el-select>
            <el-select v-model="filters.selectedBrands" multiple collapse-tags filterable class="select-full" placeholder="Select Brands">
              <el-option v-for="b in filteredBrandsList" :key="b" :value="b" :label="b" />
            </el-select>
          </div>

          <div class="action-group">
            <el-button type="primary" @click="loadData" class="btn-elegant">
              <el-icon><Histogram /></el-icon> Load Data
            </el-button>
            <el-button type="warning" plain @click="downloadTableImage" class="btn-elegant">
              <el-icon><Camera /></el-icon> Image
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <transition name="fade-slide">
      <div v-if="periodInfo.year" class="period-kpi">
        <div class="kpi-card kpi-year">
          <div class="kpi-glow"></div>
          <div class="kpi-icon">📅</div>
          <div class="kpi-content">
            <div class="kpi-label">YEAR</div>
            <div class="kpi-value">{{ periodInfo.year }}</div>
          </div>
        </div>
        <div class="kpi-card kpi-week">
          <div class="kpi-glow"></div>
          <div class="kpi-icon">📊</div>
          <div class="kpi-content">
            <div class="kpi-label">WEEK</div>
            <div class="kpi-value">{{ periodInfo.week }}</div>
          </div>
        </div>
        <div class="kpi-card kpi-period">
          <div class="kpi-glow"></div>
          <div class="kpi-icon">🗓️</div>
          <div class="kpi-content">
            <div class="kpi-label">PERIOD</div>
            <div class="kpi-value">{{ periodInfo.fromDate }} – {{ periodInfo.toDate }}</div>
          </div>
        </div>
      </div>
    </transition>

    <div class="main-content-wrapper">
      <div v-if="loading" class="loading-container">
        <el-icon class="is-loading" :size="50"><Loading /></el-icon>
        <p class="loading-text">Memuat data dashboard...</p>
      </div>

      <div v-else-if="!tableData.length" class="empty-state">
        <div class="empty-icon">🏪</div>
        <h3 class="empty-title">Dashboard Belum Dimuat</h3>
        <p class="empty-text">Silakan pilih filter dan klik tombol "Load Data" untuk menampilkan data</p>
      </div>

      <div v-else class="table-container" ref="tableContainer">
        <el-table :data="displayTableData" stripe border :max-height="600" style="width: 100%"
          :header-cell-style="headerCellStyle" :row-class-name="tableRowClassName"
          @sort-change="handleSortChange" class="elegant-table">
          <el-table-column prop="No" label="No" width="70" align="center" fixed="left">
            <template #default="scope">
              <div class="cell-number">{{ scope.row.No }}</div>
            </template>
          </el-table-column>

          <el-table-column prop="Area" label="Area" width="200" sortable="custom" fixed="left">
            <template #default="scope">
              <div class="cell-area" :class="{ 'is-total': isTotalRow(scope.row) }">
                <span class="area-text">{{ scope.row.Area }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="Grosir" label="Grosir" width="220" sortable="custom" fixed="left">
            <template #default="scope">
              <div class="cell-grosir" :class="{ 'is-total': isTotalRow(scope.row) }">
                <span class="grosir-text">{{ scope.row.Grosir }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column v-for="col in dynamicColumns" :key="col.prop" :prop="col.prop" :label="col.label"
            :min-width="col.width" align="right" sortable="custom" :class-name="`col-${col.prop}`">
            <template #default="scope">
              <transition name="cell-update" mode="out-in">
                <div :key="`${scope.row.Grosir}-${col.prop}-${sortState.prop}-${sortState.order}`"
                  class="cell-value" :class="{ 'is-total': isTotalRow(scope.row) }"
                  :style="getCellColorStyle(col.prop, scope.row[col.prop], scope.row)">
                  {{ formatNumber(scope.row[col.prop]) }}{{ col.isPercentage ? '%' : '' }}
                </div>
              </transition>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Calendar, Filter, Histogram, Loading, Camera } from '@element-plus/icons-vue'
import * as XLSX from 'xlsx'
import html2canvas from 'html2canvas'

const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api',
  ENDPOINTS: { CYCLES: '/cycles', TOP_GROSIR: '/top-grosir' }
}

const loading = ref(false)
const allCycles = ref([])
const familyList = ref([])
const tobaccoList = ref([])
const brandsList = ref([])
const tableData = ref([])
const fullDataCache = ref(null)
const allProcessedData = ref([])
const tableContainer = ref(null)
const loadingAreas = ref(false)
const areaList = ref([])
const sortState = ref({ prop: 'ctbr', order: 'descending' })

const filters = reactive({
  selectedYear: '', selectedWeek: '',selectedArea: '',
  selectedFamily: [], selectedTobacco: [], selectedBrands: []
})

const periodInfo = reactive({
  year: '', week: '', fromDate: '', toDate: ''
})

const handleSortChange = ({ prop, order }) => { sortState.value = { prop, order } }

const availableYears = computed(() => {
  const years = [...new Set(allCycles.value.map(c => c.cycle_year))]
  return years.sort((a, b) => b.localeCompare(a))
})

const areaOptions = computed(() => {
  return areaList.value.map(area => ({
    value: area.sales_office,
    label: `${area.sales_office_desc} (${area.sales_office})`
  }))
})

const availableWeeks = computed(() => {
  if (!filters.selectedYear) return []
  const weeks = allCycles.value.filter(c => c.cycle_year === filters.selectedYear).map(c => c.week)
  return [...new Set(weeks)].sort((a, b) => a - b)
})

const filteredBrandsList = computed(() => {
  if (!fullDataCache.value || fullDataCache.value.length === 0) return brandsList.value
  let data = fullDataCache.value
  if (filters.selectedFamily.length > 0) data = data.filter(r => filters.selectedFamily.includes(r.family))
  if (filters.selectedTobacco.length > 0) data = data.filter(r => filters.selectedTobacco.includes(r.tobacco_group))
  const filtered = [...new Set(data.map(r => r.matgroup_desc))].filter(Boolean).sort()
  return filtered.length > 0 ? filtered : brandsList.value
})

const dynamicColumns = computed(() => {
  const year = Number(periodInfo.year)
  const currentWeek = Number(filters.selectedWeek)
  if (!year || !currentWeek) return []
  const prevYear = year - 1
  return [
    { prop: `avgVolume${prevYear}`, label: `YTD Avg ${prevYear}`, width: 140 },
    { prop: `avgVolume${year}`, label: `YTD Avg ${year}`, width: 140 },
    { prop: 'ctbr', label: 'CTBR (%)', width: 130, isPercentage: true },
    { prop: 'w1', label: `W${getWeekLabel(currentWeek, -3)}`, width: 120 },
    { prop: 'w2', label: `W${getWeekLabel(currentWeek, -2)}`, width: 120 },
    { prop: 'w3', label: `W${getWeekLabel(currentWeek, -1)}`, width: 120 },
    { prop: 'w4', label: `W${getWeekLabel(currentWeek, 0)}`, width: 120 },
    { prop: 'growthLW', label: 'Growth LW (%)', width: 150, isPercentage: true },
    { prop: 'growthYTD', label: 'Growth YTD (%)', width: 150, isPercentage: true }
  ]
})

const displayTableData = computed(() => {
  const normal = tableData.value.filter(r => !r.isTotal)
  const total = tableData.value.filter(r => r.isTotal)
  if (!sortState.value.prop || !sortState.value.order) return [...normal, ...total]
  const { prop, order } = sortState.value
  normal.sort((a, b) => {
    const aVal = isNaN(a[prop]) ? a[prop] : Number(a[prop])
    const bVal = isNaN(b[prop]) ? b[prop] : Number(b[prop])
    if (typeof aVal === 'string') return order === 'ascending' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    return order === 'ascending' ? aVal - bVal : bVal - aVal
  })
  return [...normal, ...total]
})

const parseSAPDate = (dateStr) => {
  if (dateStr && dateStr.startsWith('/Date(')) {
    const timestamp = parseInt(dateStr.substring(6, dateStr.length - 2))
    return new Date(timestamp)
  }
  return null
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
}

const formatNumber = (value) => {
  if (value == null || value === '') return '-'
  const num = parseFloat(value)
  if (isNaN(num)) return '-'
  return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)
}

const isTotalRow = (row) => row.isTotal === true
const tableRowClassName = ({ row }) => isTotalRow(row) ? 'total-row' : 'data-row'

const headerCellStyle = () => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white', fontWeight: 'bold', fontSize: '13px',
  padding: '16px 12px', borderBottom: '2px solid rgba(255,255,255,0.2)'
})

const getCellColorStyle = (prop, value, row) => {
  if (isTotalRow(row)) return {}
  const num = parseFloat(value)
  if (isNaN(num)) return {}
  const style = {}
  if (prop === 'growthLW' || prop === 'growthYTD') {
    if (num > 0) {
      Object.assign(style, {
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: 'white', fontWeight: '600', padding: '8px 12px',
        borderRadius: '8px', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
      })
    } else if (num === 0) {
      Object.assign(style, {
        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        color: '#1f2937', fontWeight: '600', padding: '8px 12px',
        borderRadius: '8px', boxShadow: '0 2px 8px rgba(251, 191, 36, 0.3)'
      })
    } else {
      Object.assign(style, {
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        color: 'white', fontWeight: '600', padding: '8px 12px',
        borderRadius: '8px', boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
      })
    }
  }
  return style
}

const getWeekLabel = (currentWeek, offset) => {
  const week = currentWeek + offset
  return week > 0 ? week : 52 + week
}

const fetchCycles = async () => {
  try {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CYCLES}`
    const response = await fetch(url)
    if (response.ok) {
      const result = await response.json()
      if (result.success) {
        allCycles.value = result.data
        if (result.data.length > 0) {
          filters.selectedYear = result.data[0].cycle_year
          const weeksForYear = result.data.filter(c => c.cycle_year === filters.selectedYear)
          filters.selectedWeek = Math.min(...weeksForYear.map(c => c.week))
        }
      }
    }
  } catch (error) {
    console.error('❌ Error fetching cycles:', error)
    ElMessage.error('Gagal memuat data cycle')
  }
}

const loadData = async () => {
  if (!filters.selectedYear || !filters.selectedWeek) {
    ElMessage.warning('⚠️ Silakan pilih Year dan Week terlebih dahulu')
    return
  }
  loading.value = true
  try {
    const selectedParam = allCycles.value.find(p => p.cycle_year === filters.selectedYear && p.week === filters.selectedWeek)
    if (selectedParam) {
      periodInfo.year = selectedParam.cycle_year
      periodInfo.cycle = selectedParam.cycle
      periodInfo.week = filters.selectedWeek
      periodInfo.fromDate = formatDate(parseSAPDate(selectedParam.fromdat))
      periodInfo.toDate = formatDate(parseSAPDate(selectedParam.todat))
    }
    const params = new URLSearchParams({ year: filters.selectedYear, week: filters.selectedWeek, vkbur: filters.selectedArea,unit: 'BOX' })
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TOP_GROSIR}?${params}`
    const response = await fetch(url)
    if(!filters.selectedArea) {
      ElMessage.error('Area tidak boleh kosong')
      loading.value = false
      return
    }
    if (!response.ok) throw new Error(`API Error: ${response.status}`)
    const result = await response.json()
    if (!result.success) throw new Error(result.error || 'Unknown error')
    let results = result.data || []
    if (results.length === 0) {
      ElMessage.error('Tidak ada data untuk periode yang dipilih')
      loading.value = false
      return
    }
    fullDataCache.value = results
    familyList.value = [...new Set(results.map(r => r.family))].filter(Boolean).sort()
    tobaccoList.value = [...new Set(results.map(r => r.tobacco_group))].filter(Boolean).sort()
    brandsList.value = [...new Set(results.map(r => r.matgroup_desc))].filter(Boolean).sort()
    if (filters.selectedFamily.length > 0) results = results.filter(r => filters.selectedFamily.includes(r.family))
    if (filters.selectedTobacco.length > 0) results = results.filter(r => filters.selectedTobacco.includes(r.tobacco_group))
    if (filters.selectedBrands.length > 0) results = results.filter(r => filters.selectedBrands.includes(r.matgroup_desc))
    if (results.length === 0) {
      ElMessage.warning('⚠️ Tidak ada data untuk filter yang dipilih')
      loading.value = false
      return
    }
    processTableData(results)
    ElMessage.success('Data berhasil dimuat!')
  } catch (error) {
    console.error('❌ Error loading data:', error)
    ElMessage.error('❌ Gagal memuat data: ' + error.message)
  } finally {
    loading.value = false
  }
}

const processTableData = (data) => {
  if (!data || data.length === 0) return
  const grouped = {}
  let totalQtyCurrent = 0
  data.forEach(item => {
    const custKey = item.cust_name || 'Unknown'
    const areaKey = item.sales_office_desc || 'Unknown'
    const groupKey = `${custKey}|||${areaKey}`
    if (!grouped[groupKey]) {
      grouped[groupKey] = {
        cust_name: custKey, area: areaKey,
        qty_current_week: 0, qty_lastweek_1: 0, qty_lastweek_2: 0, qty_lastweek_3: 0,
        avg_sales_this_year: 0, avg_sales_last_year: 0,
        sales_ytd_this_year: 0, sales_ytd_last_year: 0
      }
    }
    grouped[groupKey].qty_current_week += parseFloat(item.qty_current_week) || 0
    grouped[groupKey].qty_lastweek_1 += parseFloat(item.qty_lastweek_1) || 0
    grouped[groupKey].qty_lastweek_2 += parseFloat(item.qty_lastweek_2) || 0
    grouped[groupKey].qty_lastweek_3 += parseFloat(item.qty_lastweek_3) || 0
    grouped[groupKey].avg_sales_this_year += parseFloat(item.avg_sales_this_year) || 0
    grouped[groupKey].avg_sales_last_year += parseFloat(item.avg_sales_last_year) || 0
    grouped[groupKey].sales_ytd_this_year += parseFloat(item.sales_ytd_this_year) || 0
    grouped[groupKey].sales_ytd_last_year += parseFloat(item.sales_ytd_last_year) || 0
    totalQtyCurrent += parseFloat(item.qty_current_week) || 0
  })
  const rows = Object.entries(grouped).map(([groupKey, values]) => {
    const growthLW = values.qty_lastweek_1 !== 0 ? ((values.qty_current_week - values.qty_lastweek_1) / values.qty_lastweek_1) * 100 : 0
    const ctbr = totalQtyCurrent !== 0 ? (values.qty_current_week / totalQtyCurrent) * 100 : 0
    const growthYTD = values.sales_ytd_last_year !== 0 ? ((values.sales_ytd_this_year - values.sales_ytd_last_year) / values.sales_ytd_last_year) * 100 : 0
    const prevYear = parseInt(periodInfo.year) - 1
    return {
      Area: values.area, Grosir: values.cust_name,
      [`avgVolume${prevYear}`]: values.avg_sales_last_year,
      [`avgVolume${periodInfo.year}`]: values.avg_sales_this_year,
      w1: values.qty_lastweek_3, w2: values.qty_lastweek_2,
      w3: values.qty_lastweek_1, w4: values.qty_current_week,
      growthLW, ctbr, growthYTD, _ctbrValue: ctbr, isTotal: false
    }
  })
  rows.sort((a, b) => b._ctbrValue - a._ctbrValue)
  const allRowsWithNumbers = rows.map((row, index) => ({ ...row, No: index + 1 }))
  allProcessedData.value = allRowsWithNumbers
  const top27 = rows.slice(0, 27)
  top27.forEach((row, index) => { row.No = index + 1 })
  const prevYear = parseInt(periodInfo.year) - 1
  const top27Total = {
    No: '', Area: '', Grosir: 'Total 27 Top Grosir',
    [`avgVolume${prevYear}`]: top27.reduce((s, r) => s + r[`avgVolume${prevYear}`], 0),
    [`avgVolume${periodInfo.year}`]: top27.reduce((s, r) => s + r[`avgVolume${periodInfo.year}`], 0),
    w1: top27.reduce((s, r) => s + r.w1, 0), w2: top27.reduce((s, r) => s + r.w2, 0),
    w3: top27.reduce((s, r) => s + r.w3, 0), w4: top27.reduce((s, r) => s + r.w4, 0),
    growthLW: top27.length > 0 ? top27.reduce((s, r) => s + r.growthLW, 0) / top27.length : 0,
    ctbr: top27.reduce((s, r) => s + r.ctbr, 0),
    growthYTD: top27.length > 0 ? top27.reduce((s, r) => s + r.growthYTD, 0) / top27.length : 0,
    isTotal: true
  }
  const others = rows.slice(27)
  const othersTotal = {
    No: '', Area: '', Grosir: 'Total Others',
    [`avgVolume${prevYear}`]: others.reduce((s, r) => s + r[`avgVolume${prevYear}`], 0),
    [`avgVolume${periodInfo.year}`]: others.reduce((s, r) => s + r[`avgVolume${periodInfo.year}`], 0),
    w1: others.reduce((s, r) => s + r.w1, 0), w2: others.reduce((s, r) => s + r.w2, 0),
    w3: others.reduce((s, r) => s + r.w3, 0), w4: others.reduce((s, r) => s + r.w4, 0),
    growthLW: others.length > 0 ? others.reduce((s, r) => s + r.growthLW, 0) / others.length : 0,
    ctbr: others.reduce((s, r) => s + r.ctbr, 0),
    growthYTD: others.length > 0 ? others.reduce((s, r) => s + r.growthYTD, 0) / others.length : 0,
    isTotal: true
  }
  const totalArea = {
    No: '', Area: '', Grosir: 'Total Area',
    [`avgVolume${prevYear}`]: rows.reduce((s, r) => s + r[`avgVolume${prevYear}`], 0),
    [`avgVolume${periodInfo.year}`]: rows.reduce((s, r) => s + r[`avgVolume${periodInfo.year}`], 0),
    w1: rows.reduce((s, r) => s + r.w1, 0), w2: rows.reduce((s, r) => s + r.w2, 0),
    w3: rows.reduce((s, r) => s + r.w3, 0), w4: rows.reduce((s, r) => s + r.w4, 0),
    growthLW: rows.length > 0 ? rows.reduce((s, r) => s + r.growthLW, 0) / rows.length : 0,
    ctbr: rows.reduce((s, r) => s + r.ctbr, 0),
    growthYTD: rows.length > 0 ? rows.reduce((s, r) => s + r.growthYTD, 0) / rows.length : 0,
    isTotal: true
  }
  tableData.value = [...top27, top27Total, othersTotal, totalArea]
}

const downloadTableImage = async () => {
  try {
    if (!tableData.value || tableData.value.length === 0) {
      ElMessage.warning('⚠️ Tidak ada data untuk di-capture')
      return
    }

    ElMessage.info('📸 Menyiapkan screenshot...')

    // Create custom table HTML with all data
    const prevYear = parseInt(periodInfo.year) - 1
    const currentWeek = Number(filters.selectedWeek)

    const tableHTML = `
      <div style="background: white; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="text-align: center; color: #1f77b4; margin-bottom: 20px;">
          🏪 TOP 27 GROSIR - Year ${periodInfo.year}, Week ${filters.selectedWeek}
        </h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
              <th style="border: 1px solid #ddd; padding: 12px 8px; text-align: center;">No</th>
              <th style="border: 1px solid #ddd; padding: 12px 8px; text-align: left;">Area</th>
              <th style="border: 1px solid #ddd; padding: 12px 8px; text-align: left;">Grosir</th>
              <th style="border: 1px solid #ddd; padding: 12px 8px; text-align: right;">YTD Avg ${prevYear}</th>
              <th style="border: 1px solid #ddd; padding: 12px 8px; text-align: right;">YTD Avg ${periodInfo.year}</th>
              <th style="border: 1px solid #ddd; padding: 12px 8px; text-align: right;">CTBR (%)</th>
              <th style="border: 1px solid #ddd; padding: 12px 8px; text-align: right;">W${getWeekLabel(currentWeek, -3)}</th>
              <th style="border: 1px solid #ddd; padding: 12px 8px; text-align: right;">W${getWeekLabel(currentWeek, -2)}</th>
              <th style="border: 1px solid #ddd; padding: 12px 8px; text-align: right;">W${getWeekLabel(currentWeek, -1)}</th>
              <th style="border: 1px solid #ddd; padding: 12px 8px; text-align: right;">W${getWeekLabel(currentWeek, 0)}</th>
              <th style="border: 1px solid #ddd; padding: 12px 8px; text-align: right;">Growth LW (%)</th>
              <th style="border: 1px solid #ddd; padding: 12px 8px; text-align: right;">Growth YTD (%)</th>
            </tr>
          </thead>
          <tbody>
            ${displayTableData.value.map(row => {
              const isTotal = isTotalRow(row)
              const rowStyle = isTotal
                ? 'background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%); color: white; font-weight: bold;'
                : 'background: white;'

              const getCellStyle = (prop, value) => {
                if (isTotal) return 'border: 1px solid rgba(255,255,255,0.2); padding: 10px 8px; text-align: right;'
                const num = parseFloat(value)
                let style = 'border: 1px solid #ddd; padding: 8px; text-align: right;'
                if ((prop === 'growthLW' || prop === 'growthYTD') && !isNaN(num)) {
                  if (num > 0) {
                    style += 'background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; font-weight: 600; border-radius: 6px;'
                  } else if (num < 0) {
                    style += 'background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; font-weight: 600; border-radius: 6px;'
                  }
                }
                return style
              }

              return `
                <tr style="${rowStyle}">
                  <td style="border: 1px solid ${isTotal ? 'rgba(255,255,255,0.2)' : '#ddd'}; padding: ${isTotal ? '10px' : '8px'}; text-align: center;">${row.No || ''}</td>
                  <td style="border: 1px solid ${isTotal ? 'rgba(255,255,255,0.2)' : '#ddd'}; padding: ${isTotal ? '10px' : '8px'}; text-align: left;">${row.Area}</td>
                  <td style="border: 1px solid ${isTotal ? 'rgba(255,255,255,0.2)' : '#ddd'}; padding: ${isTotal ? '10px' : '8px'}; text-align: left;">${row.Grosir}</td>
                  <td style="${getCellStyle('avg', row[`avgVolume${prevYear}`])}">${formatNumber(row[`avgVolume${prevYear}`])}</td>
                  <td style="${getCellStyle('avg', row[`avgVolume${periodInfo.year}`])}">${formatNumber(row[`avgVolume${periodInfo.year}`])}</td>
                  <td style="${getCellStyle('ctbr', row.ctbr)}">${formatNumber(row.ctbr)}%</td>
                  <td style="${getCellStyle('w1', row.w1)}">${formatNumber(row.w1)}</td>
                  <td style="${getCellStyle('w2', row.w2)}">${formatNumber(row.w2)}</td>
                  <td style="${getCellStyle('w3', row.w3)}">${formatNumber(row.w3)}</td>
                  <td style="${getCellStyle('w4', row.w4)}">${formatNumber(row.w4)}</td>
                  <td style="${getCellStyle('growthLW', row.growthLW)}">${formatNumber(row.growthLW)}%</td>
                  <td style="${getCellStyle('growthYTD', row.growthYTD)}">${formatNumber(row.growthYTD)}%</td>
                </tr>
              `
            }).join('')}
          </tbody>
        </table>
      </div>
    `

    // Create wrapper and add HTML
    const wrapper = document.createElement('div')
    wrapper.innerHTML = tableHTML
    wrapper.style.cssText = `
      position: absolute;
      left: -9999px;
      top: 0;
      width: fit-content;
    `
    document.body.appendChild(wrapper)

    // Wait for render
    await new Promise(resolve => setTimeout(resolve, 300))

    // Capture with html2canvas
    const canvas = await html2canvas(wrapper.firstElementChild, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false
    })

    // Remove wrapper
    document.body.removeChild(wrapper)

    // Download
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Top_27_Grosir_${periodInfo.year}_Week${filters.selectedWeek}_${new Date().getTime()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      ElMessage.success('Screenshot berhasil didownload!')
    })

  } catch (error) {
    console.error('Screenshot error:', error)
    ElMessage.error('Gagal membuat screenshot: ' + error.message)
  }
}

const fetchAreas = async () => {
  loadingAreas.value = true
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/areas`)
    const result = await response.json()
    if (result.success) {
      areaList.value = result.data
    }
  } catch (error) {
    ElMessage.error('Gagal memuat daftar area')
    console.error(error)
  } finally {
    loadingAreas.value = false
  }
}

onMounted(async () => {
  await fetchCycles()
  await fetchAreas()
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
  grid-template-columns: auto 1fr auto;
  gap: 1.5rem;
  align-items: start;
  width: 100%;
}

.period-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 250px;
}

.period-controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.select-area {
  width: 100%;
}

.filters-group {
  display: grid;
  grid-template-columns: auto repeat(3, 1fr);
  gap: 0.5rem;
  align-items: center;
}

.action-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 140px;
}

.filter-group-label {
  font-weight: 600;
  font-size: 0.85rem;
  color: #374151;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 4px 0;
}

.select-sm {
  width: 100%;
}

.select-full {
  width: 100%;
}

.btn-elegant {
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
}

.btn-elegant:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.period-kpi {
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

.kpi-year .kpi-glow {
  background: linear-gradient(90deg, #3b82f6, #2563eb);
}

.kpi-week .kpi-glow {
  background: linear-gradient(90deg, #8b5cf6, #7c3aed);
}

.kpi-period .kpi-glow {
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
}

:deep(.el-table .data-row:hover) {
  background-color: #f3f4f6 !important;
}

:deep(.el-table .total-row) {
  background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%) !important;
  transition: all 0.3s ease;
}

:deep(.el-table .total-row:hover) {
  background: linear-gradient(135deg, #1e3a8a 0%, #1e293b 100%) !important;
  box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
}

:deep(.el-table .total-row td) {
  height: 56px;
  background: transparent !important;
  color: #ffffff !important;
  font-weight: 700 !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
}

.cell-number {
  font-weight: 600;
  color: #6b7280;
  transition: all 0.3s ease;
}

.cell-area {
  padding: 0.5rem 0;
  transition: all 0.3s ease;
}

.cell-area.is-total .area-text {
  font-weight: 700;
  color: white;
  letter-spacing: 0.5px;
}

.area-text {
  font-weight: 500;
  color: #1f2937;
}

.cell-grosir {
  padding: 0.5rem 0;
  transition: all 0.3s ease;
}

.cell-grosir.is-total .grosir-text {
  font-weight: 700;
  color: white;
  letter-spacing: 0.5px;
}

.grosir-text {
  font-weight: 500;
  color: #1f2937;
}

.cell-value {
  display: inline-block;
  transition: all 0.3s ease;
}

.cell-value.is-total {
  font-weight: 700;
  color: white;
}

.cell-update-enter-active,
.cell-update-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.cell-update-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.cell-update-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}

.cell-update-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}

@media (max-width: 1400px) {
  .filters-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .filters-group {
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  .filter-group-label {
    grid-column: 1 / -1;
  }

  .action-group {
    flex-direction: row;
    width: 100%;
  }

  .btn-elegant {
    flex: 1;
  }
}

@media (max-width: 1200px) {
  .period-kpi {
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

  .period-kpi {
    margin: 1rem;
  }

  .kpi-value {
    font-size: 1.2rem;
  }

  .filters-group {
    grid-template-columns: 1fr;
  }

  .period-group {
    min-width: auto;
  }

  .action-group {
    flex-direction: column;
  }
}
</style>
