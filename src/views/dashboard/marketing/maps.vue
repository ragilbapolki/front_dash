<!-- DashboardAchGrowth.vue - Enhanced with ECharts & Better Filters -->
<template>
  <div class="dashboard-page">
    <!-- Header -->
    <div class="dashboard-header">
      <h1 class="header-title">🗺️ NASIONAL ACH | GROWTH YTD</h1>
    </div>

    <!-- Filters Bar -->
    <div class="filters-bar">
      <div class="filters-container">
        <div class="filter-row">
          <!-- Period Filters -->
          <div class="filter-inline-group">
            <span class="filter-group-label">📅 Period:</span>
            <el-select
              v-model="filters.selectedYear"
              @change="onYearChange"
              placeholder="Year"
              size="default"
              style="width: 100px"
              filterable
            >
              <el-option v-for="year in availableYears" :key="year" :value="year" :label="year" />
            </el-select>
            <el-select
              v-model="filters.selectedCycle"
              @change="onCycleChange"
              placeholder="Cycle"
              size="default"
              style="width: 110px"
              filterable
            >
              <el-option v-for="cycle in availableCycles" :key="cycle" :value="cycle" :label="`Cycle ${cycle}`" />
            </el-select>
          </div>

          <div class="filter-divider"></div>

          <!-- Product Filters -->
          <div class="filter-inline-group">
            <span class="filter-group-label">🎯 Filters:</span>
            <el-select v-model="filters.selectedFamily" @change="onFamilyChange" placeholder="All Family" size="default" style="width: 130px" :disabled="!fullDataCache" filterable>
              <el-option value="All" label="All Family" />
              <el-option v-for="family in familyList" :key="family" :value="family" :label="family" />
            </el-select>
            <el-select v-model="filters.selectedTobacco" @change="onTobaccoChange" placeholder="All Tobacco" size="default" style="width: 140px" :disabled="!fullDataCache" filterable>
              <el-option value="All" label="All Tobacco" />
              <el-option v-for="tobacco in tobaccoList" :key="tobacco" :value="tobacco" :label="tobacco" />
            </el-select>
            <!-- Enhanced Brand Filter with Search -->
            <el-select
              v-model="filters.selectedBrands"
              multiple
              filterable
              collapse-tags
              collapse-tags-tooltip
              :max-collapse-tags="4"
              placeholder="All Brands"
              size="default"
              style="width: 350px"
              :disabled="!fullDataCache"
              @remove-tag="handleBrandRemove"
            >
              <el-option v-for="brand in filteredBrands" :key="brand" :value="brand" :label="brand" />
            </el-select>
          </div>

          <!-- Load Button -->
          <el-button type="primary" @click="loadData" :loading="loading" size="default" style="margin-left: auto">
            <template v-if="!loading">
              <span v-if="!fullDataCache"><el-icon><Histogram /></el-icon>Load Data</span>
              <span v-else><el-icon><Histogram /></el-icon> Load Data</span>
            </template>
            <template v-else>⏳ Loading...</template>
          </el-button>
          <el-button
            type="warning"
            plain
            @click="downloadDashboardAsImage"
            :disabled="!dashboardData"
          >
            <el-icon style="margin-right: 6px;"><Camera /></el-icon>
            Image
          </el-button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content-wrapper">
      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <el-icon class="is-loading" :size="50"><Loading /></el-icon>
        <p class="loading-text">Memuat data dashboard...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="!dashboardData" class="empty-state">
        <div class="empty-icon">📊</div>
        <h3 class="empty-title">Dashboard Belum Dimuat</h3>
        <p class="empty-text">Silakan pilih filter dan klik tombol "Load Dashboard" untuk menampilkan data</p>
      </div>

      <!-- Dashboard Content -->
      <div v-else class="dashboard-content" id="dashboard-export">
        <!-- Map and Gauges Section -->
        <div class="map-gauge-section">
          <div class="section-header-inline">
            <h2 class="section-title">🗺️ MAP ACH | GROWTH YTD</h2>
          </div>

          <div class="map-gauge-grid">
            <!-- Map Container -->
            <div class="map-container-wrapper">
              <div class="map-container">
                <div id="indonesiaMap" ref="mapContainer" class="leaflet-map"></div>
              </div>

              <!-- Contribution Text -->
              <div class="contribution-text">
                <strong>Contribution:</strong>
                <span v-for="(regional, index) in regionalData" :key="index">
                  {{ regional.name }} {{ regional.contribution.toFixed(0) }}%
                  <span v-if="index < regionalData.length - 1"> | </span>
                </span>
              </div>

              <div class="map-legend">
                <!-- ACHIEVEMENT -->
                <div class="legend-block">
                  <div class="legend-title">
                    📊 <strong>Achievement</strong>
                  </div>
                  <div class="legend-items">
                    <div class="legend-item">
                      <div class="legend-color" style="background:#ff0000"></div>
                      <span>&lt; 90%</span>
                    </div>
                    <div class="legend-item">
                      <div class="legend-color" style="background:#FF4500"></div>
                      <span>90–94%</span>
                    </div>
                    <div class="legend-item">
                      <div class="legend-color" style="background:#FFA500"></div>
                      <span>95–99%</span>
                    </div>
                    <div class="legend-item">
                      <div class="legend-color" style="background:#00FF00"></div>
                      <span>100–104%</span>
                    </div>
                    <div class="legend-item">
                      <div class="legend-color" style="background:#00DD00"></div>
                      <span>105–110%</span>
                    </div>
                    <div class="legend-item">
                      <div class="legend-color" style="background:#00AA00"></div>
                      <span>&gt; 110%</span>
                    </div>
                  </div>

                <!-- GROWTH -->
                <div class="legend-block">
                  <div class="legend-title">
                    📈 <strong>Growth</strong>
                  </div>
                  <div class="legend-items">
                    <div class="legend-item">
                      <div class="legend-color" style="background:#ff0000"></div>
                      <span>&lt; -10%</span>
                    </div>
                    <div class="legend-item">
                      <div class="legend-color" style="background:#FFC000"></div>
                      <span>-10% – 0%</span>
                    </div>
                    <div class="legend-item">
                      <div class="legend-color" style="background:#ffff00"></div>
                      <span>0% – 10%</span>
                    </div>
                    <div class="legend-item">
                      <div class="legend-color" style="background:#92d050"></div>
                      <span>&gt; 10%</span>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </div>

            <div class="gauges-container">
              <div class="gauges-header">
              </div>
              <div class="gauge-card">
                <div ref="achGaugeChart" style="width: 100%; height: 190px;"></div>
              </div>
              <div class="gauge-card">
                <div ref="growthGaugeChart" style="width: 100%; height: 190px;"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Table Section -->
        <div class="table-section">
          <div class="section-header-inline">
            <h2 class="section-title">📋 VOLUME BY CYCLE</h2>
          </div>
          <el-table :data="tableData" :max-height="500" style="width: 100%" :row-class-name="tableRowClassName">
            <el-table-column prop="brand" label="Brand" fixed />
            <el-table-column prop="tobacco_group" label="Tobacco" />
            <el-table-column prop="family" label="Family" />
            <el-table-column v-for="i in lastCycle" :key="`cy${i}`" :prop="`cy${i}`" :label="`CY.${i}`" align="right" />
            <el-table-column prop="ach_ae_cy" label="ACH AE CY" align="right" />
            <el-table-column prop="ach_ytd" label="ACH YTD" align="right" />
            <el-table-column prop="growth_ytd" label="GROWTH YTD"  align="right" />
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import * as echarts from 'echarts'
import leafletImage from 'leaflet-image'
import { Calendar, Filter, Histogram, Download, InfoFilled, Camera } from '@element-plus/icons-vue'

// API Configuration
const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api',
  ENDPOINTS: {
    CYCLES: '/cycles',
    ACH_GROWTH: '/ach-growth',
    REGIONAL_GEOJSON: '/regional-geojson'
  }
}

// State
const loading = ref(false)
const allCycles = ref([])
const familyList = ref([])
const tobaccoList = ref([])
const brandsList = ref([])
const filteredBrands = ref([])
const dashboardData = ref(null)
const regionalData = ref([])
const tableData = ref([])
const lastCycle = ref(10)
const fullDataCache = ref(null)
const regionalGeoJSON = ref(null)

// Refs
const achGaugeChart = ref(null)
const growthGaugeChart = ref(null)
const mapContainer = ref(null)
let mapInstance = null
let achChart = null
let growthChart = null

// Filters
const filters = reactive({
  selectedYear: '',
  selectedCycle: '',
  selectedFamily: 'All',
  selectedTobacco: 'All',
  selectedBrands: [] // Empty array = all brands
})

// Computed
const availableYears = computed(() => {
  const years = [...new Set(allCycles.value.map(c => c.cycle_year))]
  return years.sort((a, b) => b - a)
})

const availableCycles = computed(() => {
  if (!filters.selectedYear) return []
  const cycles = allCycles.value
    .filter(c => c.cycle_year === filters.selectedYear)
    .map(c => c.cycle)
  return [...new Set(cycles)].sort((a, b) => a - b) // Ascending order
})

const avgAchievement = computed(() => {
  if (!regionalData.value || regionalData.value.length === 0) return 0
  const sum = regionalData.value.reduce((acc, r) => acc + r.achievement, 0)
  return sum / regionalData.value.length
})

const avgGrowth = computed(() => {
  if (!regionalData.value || regionalData.value.length === 0) return 0
  const sum = regionalData.value.reduce((acc, r) => acc + r.growth, 0)
  return sum / regionalData.value.length
})

const handleBrandRemove = (removedBrand) => {
  filters.selectedBrands = filters.selectedBrands.filter(b => b !== removedBrand)
}

// Methods
const fetchRegionalGeoJSON = async () => {
  try {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGIONAL_GEOJSON}`
    const response = await fetch(url)

    if (response.ok) {
      const result = await response.json()
      if (result.success) {
        regionalGeoJSON.value = result.data
        console.log(' Regional GeoJSON loaded:', result.record_count, 'features')
        return true
      }
    }
  } catch (error) {
    console.error('Error fetching regional GeoJSON:', error)
  }
  return false
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
          // Get the smallest cycle for selected year
          const cyclesForYear = result.data.filter(c => c.cycle_year === result.data[0].cycle_year)
          const minCycle = Math.min(...cyclesForYear.map(c => c.cycle))
          filters.selectedCycle = minCycle
        }
      }
      await loadData()
    }
  } catch (error) {
    console.error('Error fetching cycles:', error)
    ElMessage.error('Gagal memuat data cycle')
  }
}

const onYearChange = () => {
  if (availableCycles.value.length > 0) {
    filters.selectedCycle = availableCycles.value[0]
  }
  resetFilters()
}

const onCycleChange = () => {
  resetFilters()
}

const onFamilyChange = () => {
  updateFilteredBrands()
  const validBrands = filters.selectedBrands.filter(b =>
    filteredBrands.value.includes(b)
  )
  filters.selectedBrands = validBrands
}

const onTobaccoChange = () => {
  updateFilteredBrands()
  const validBrands = filters.selectedBrands.filter(b =>
    filteredBrands.value.includes(b)
  )
  filters.selectedBrands = validBrands
}

const resetFilters = () => {
  fullDataCache.value = null
  familyList.value = []
  tobaccoList.value = []
  brandsList.value = []
  filteredBrands.value = []
  filters.selectedFamily = 'All'
  filters.selectedTobacco = 'All'
  filters.selectedBrands = []
  dashboardData.value = null
}

const updateFilteredBrands = () => {
  if (!fullDataCache.value) return

  let filteredData = fullDataCache.value

  // Filter by family first
  if (filters.selectedFamily !== 'All') {
    filteredData = filteredData.filter(d => d.family === filters.selectedFamily)
  }

  // Then filter by tobacco
  if (filters.selectedTobacco !== 'All') {
    filteredData = filteredData.filter(d => d.tobacco_group === filters.selectedTobacco)
  }

  // Get unique brands from filtered data
  const brands = [...new Set(filteredData.map(d => d.matgroup_desc))].filter(Boolean)
  filteredBrands.value = brands.sort()
}

const loadData = async () => {
  if (!filters.selectedYear || !filters.selectedCycle) {
    ElMessage.warning('⚠️ Silakan pilih Year dan Cycle terlebih dahulu')
    return
  }

  loading.value = true

  try {
    const params = new URLSearchParams({
      year: filters.selectedYear,
      cycle: filters.selectedCycle,
      unit: 'BOX'
    })

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ACH_GROWTH}?${params}`
    const response = await fetch(url)

    if (!response.ok) throw new Error(`API Error: ${response.status}`)

    const result = await response.json()
    if (!result.success) throw new Error(result.error || 'Unknown error')

    let results = result.data || []

    if (results.length === 0) {
      ElMessage.error('❌ Tidak ada data untuk periode yang dipilih')
      loading.value = false
      return
    }

    fullDataCache.value = results
    familyList.value = [...new Set(results.map(r => r.family))].filter(Boolean).sort()
    tobaccoList.value = [...new Set(results.map(r => r.tobacco_group))].filter(Boolean).sort()
    brandsList.value = [...new Set(results.map(r => r.matgroup_desc))].filter(Boolean).sort()
    filteredBrands.value = brandsList.value

    const noFiltersSelected = filters.selectedFamily === 'All' &&
                              filters.selectedTobacco === 'All' &&
                              filters.selectedBrands.length === 0

    if (noFiltersSelected) {
      ElMessage.info('ℹ️ Data berhasil dimuat. Silakan pilih minimal satu filter untuk menampilkan dashboard')
      loading.value = false
      return
    }

    // Apply filters
    if (filters.selectedBrands.length > 0) {
      results = results.filter(r => filters.selectedBrands.includes(r.matgroup_desc))
    }
    if (filters.selectedTobacco !== 'All') {
      results = results.filter(r => r.tobacco_group === filters.selectedTobacco)
    }
    if (filters.selectedFamily !== 'All') {
      results = results.filter(r => r.family === filters.selectedFamily)
    }

    if (results.length === 0) {
      ElMessage.warning('⚠️ Tidak ada data untuk filter yang dipilih')
      loading.value = false
      return
    }

    processData(results)
    ElMessage.success('Data berhasil dimuat!')
  } catch (error) {
    console.error('Error loading data:', error)
    ElMessage.error('❌ Gagal memuat data: ' + error.message)
  } finally {
    loading.value = false
  }
}

const nationalAchievement = computed(() => {
  if (!dashboardData.value || dashboardData.value.length === 0) return 0

  let totalSales = 0
  let totalAe = 0

  dashboardData.value.forEach(r => {
    totalSales += r.sales_ytd
    totalAe += r.ytd_ae
  })

  return totalAe > 0 ? (totalSales / totalAe) * 100 : 0
})

const nationalGrowth = computed(() => {
  if (!dashboardData.value || dashboardData.value.length === 0) return 0

  let totalSales = 0
  let totalSalesLy = 0

  dashboardData.value.forEach(r => {
    totalSales += r.sales_ytd
    totalSalesLy += r.sales_ytd_ly
  })

  return totalSalesLy > 0
    ? ((totalSales - totalSalesLy) / totalSalesLy) * 100
    : 0
})

const processData = (results) => {
  results.forEach(r => {
    const salesYtd = parseFloat(r.sales_ytd) || 0
    const salesYtdLy = parseFloat(r.sales_ytd_ly) || 0
    const ytdAe = parseFloat(r.ytd_ae) || 0
    const currentCycleAe = parseFloat(r.current_cycle_ae) || 0

    r.sales_ytd = salesYtd
    r.sales_ytd_ly = salesYtdLy
    r.ytd_ae = ytdAe
    r.current_cycle_ae = currentCycleAe
    r.ach_ytd = ytdAe > 0 ? (salesYtd / ytdAe) * 100 : 0
    r.growth_ytd = salesYtdLy > 0 ? ((salesYtd - salesYtdLy) / salesYtdLy) * 100 : 0

    for (let i = 1; i <= 13; i++) {
      const col = `sales_cy${i}`
      r[col] = parseFloat(r[col]) || 0
    }
  })

  dashboardData.value = results

  let last = 10
  for (let i = 13; i >= 1; i--) {
    const sum = results.reduce((acc, r) => acc + (r[`sales_cy${i}`] || 0), 0)
    if (sum > 0) {
      last = i
      break
    }
  }
  lastCycle.value = last

  processRegionalData(results)
  processTableData(results, last)

  nextTick(() => {
    drawEChartsGauge(
      achGaugeChart.value,
      nationalAchievement.value,
      'Achievement'
    )

    drawEChartsGauge(
      growthGaugeChart.value,
      nationalGrowth.value,
      'Growth'
    )
    initMap()
  })
}

const processRegionalData = (data) => {
  const regionalMap = {}

  data.forEach(item => {
    const regional = item.regional

    if (!regional) return

    if (!regionalMap[regional]) {
      regionalMap[regional] = {
        sales_ytd: 0,
        sales_ytd_ly: 0,
        ytd_ae: 0
      }
    }

    regionalMap[regional].sales_ytd += Number(item.sales_ytd) || 0
    regionalMap[regional].sales_ytd_ly += Number(item.sales_ytd_ly) || 0
    regionalMap[regional].ytd_ae += Number(item.ytd_ae) || 0
  })

  const totalAchievement = Object.values(regionalMap).reduce((sum, r) => {
    return sum + (r.ytd_ae > 0 ? (r.sales_ytd / r.ytd_ae) * 100 : 0)
  }, 0)

  regionalData.value = Object.entries(regionalMap)
    .map(([regional, values]) => {
      const regMatch = regional.match(/\d+/)

      if (!regMatch) return null

      const regNum = regMatch[0]

      const achievement =
        values.ytd_ae > 0
          ? (values.sales_ytd / values.ytd_ae) * 100
          : 0

      const growth =
        values.sales_ytd_ly > 0
          ? ((values.sales_ytd - values.sales_ytd_ly) / values.sales_ytd_ly) * 100
          : 0

      return {
        name: `R${regNum}`,
        regional,
        achievement,
        growth,
        contribution:
          totalAchievement > 0
            ? (achievement / totalAchievement) * 100
            : 0,
        ...values
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.contribution - a.contribution)
}

const processTableData = (data, last) => {
  const hasMultipleBrands = filters.selectedBrands.length > 1
  const hasSingleBrand = filters.selectedBrands.length === 1
  const hasFilters = filters.selectedTobacco !== 'All' || filters.selectedFamily !== 'All'

  if (hasMultipleBrands || hasFilters) {
    const brandMap = {}

    data.forEach(item => {
      const brand = item.matgroup_desc || 'Unknown'
      if (!brandMap[brand]) {
        brandMap[brand] = {
          brand,
          tobacco_group: item.tobacco_group || '',
          family: item.family || '',
          sales_ytd: 0,
          sales_ytd_ly: 0,
          ytd_ae: 0,
          current_cycle_ae: 0
        }
        for (let i = 1; i <= 13; i++) {
          brandMap[brand][`sales_cy${i}`] = 0
        }
      }

      brandMap[brand].sales_ytd += item.sales_ytd
      brandMap[brand].sales_ytd_ly += item.sales_ytd_ly
      brandMap[brand].ytd_ae += item.ytd_ae
      brandMap[brand].current_cycle_ae += item.current_cycle_ae

      for (let i = 1; i <= 13; i++) {
        brandMap[brand][`sales_cy${i}`] += item[`sales_cy${i}`] || 0
      }
    })

    tableData.value = Object.values(brandMap).map(item => {
      const row = {
        brand: item.brand,
        tobacco_group: item.tobacco_group,
        family: item.family
      }

      for (let i = 1; i <= last; i++) {
        row[`cy${i}`] = formatNumber(item[`sales_cy${i}`])
      }

      const achAeCy = item.current_cycle_ae > 0 ? (item[`sales_cy${last}`] / item.current_cycle_ae) * 100 : 0
      const achYtd = item.ytd_ae > 0 ? (item.sales_ytd / item.ytd_ae) * 100 : 0
      const growthYtd = item.sales_ytd_ly > 0 ? ((item.sales_ytd - item.sales_ytd_ly) / item.sales_ytd_ly) * 100 : 0

      row.ach_ae_cy = formatPercent(achAeCy)
      row.ach_ytd = formatPercent(achYtd)
      row.growth_ytd = formatPercent(growthYtd)

      return row
    })

    if (tableData.value.length > 1) {
      const totalRow = { brand: 'TOTAL', tobacco_group: '', family: '' }
      const totals = {
        sales_ytd: 0,
        sales_ytd_ly: 0,
        ytd_ae: 0,
        current_cycle_ae: 0
      }

      for (let i = 1; i <= 13; i++) {
        totals[`sales_cy${i}`] = 0
      }

      Object.values(brandMap).forEach(item => {
        totals.sales_ytd += item.sales_ytd
        totals.sales_ytd_ly += item.sales_ytd_ly
        totals.ytd_ae += item.ytd_ae
        totals.current_cycle_ae += item.current_cycle_ae
        for (let i = 1; i <= 13; i++) {
          totals[`sales_cy${i}`] += item[`sales_cy${i}`]
        }
      })

      for (let i = 1; i <= last; i++) {
        totalRow[`cy${i}`] = formatNumber(totals[`sales_cy${i}`])
      }

      const totalAchAeCy = totals.current_cycle_ae > 0 ? (totals[`sales_cy${last}`] / totals.current_cycle_ae) * 100 : 0
      const totalAchYtd = totals.ytd_ae > 0 ? (totals.sales_ytd / totals.ytd_ae) * 100 : 0
      const totalGrowthYtd = totals.sales_ytd_ly > 0 ? ((totals.sales_ytd - totals.sales_ytd_ly) / totals.sales_ytd_ly) * 100 : 0

      totalRow.ach_ae_cy = formatPercent(totalAchAeCy)
      totalRow.ach_ytd = formatPercent(totalAchYtd)
      totalRow.growth_ytd = formatPercent(totalGrowthYtd)

      tableData.value.push(totalRow)
    }
  } else {
    const summary = {
      brand: filters.selectedBrands.length === 0 ? 'All Brands' : filters.selectedBrands.join(', '),
      tobacco_group: filters.selectedTobacco === 'All' ? 'All Tobacco' : filters.selectedTobacco,
      family: filters.selectedFamily === 'All' ? 'All Family' : filters.selectedFamily
    }

    const totals = {
      sales_ytd: 0,
      sales_ytd_ly: 0,
      ytd_ae: 0,
      current_cycle_ae: 0
    }

    for (let i = 1; i <= 13; i++) {
      totals[`sales_cy${i}`] = 0
    }

    data.forEach(item => {
      totals.sales_ytd += item.sales_ytd
      totals.sales_ytd_ly += item.sales_ytd_ly
      totals.ytd_ae += item.ytd_ae
      totals.current_cycle_ae += item.current_cycle_ae
      for (let i = 1; i <= 13; i++) {
        totals[`sales_cy${i}`] += item[`sales_cy${i}`] || 0
      }
    })

    for (let i = 1; i <= last; i++) {
      summary[`cy${i}`] = formatNumber(totals[`sales_cy${i}`])
    }

    const achAeCy = totals.current_cycle_ae > 0 ? (totals[`sales_cy${last}`] / totals.current_cycle_ae) * 100 : 0
    const achYtd = totals.ytd_ae > 0 ? (totals.sales_ytd / totals.ytd_ae) * 100 : 0
    const growthYtd = totals.sales_ytd_ly > 0 ? ((totals.sales_ytd - totals.sales_ytd_ly) / totals.sales_ytd_ly) * 100 : 0

    summary.ach_ae_cy = formatPercent(achAeCy)
    summary.ach_ytd = formatPercent(achYtd)
    summary.growth_ytd = formatPercent(growthYtd)

    tableData.value = [summary]
  }
}

const formatNumber = (num) => {
  return num.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatPercent = (num) => {
  return num.toFixed(2) + '%'
}

const tableRowClassName = ({ row }) => {
  return row.brand === 'TOTAL' ? 'total-row' : ''
}

const getAchievementColor = (value) => {
  const val = Number(value)
  console.log(val)

  if (val < 90) return '#ff0000'
  if (val < 95) return '#FF4500'
  if (val < 100) return '#FFA500'
  if (val < 105) return '#00FF00'
  if (val < 110) return '#00DD00'
  return '#00AA00'
}

const getGrowthColor = (value) => {
  if (value < -10) return '#ff0000'
  if (value < 0) return '#FFC000'
  if (value < 10) return '#ffff00'
  return '#92d050'
}

// ECharts Gauge
const drawEChartsGauge = (container, value, type) => {
  if (!container) return

  let chart = type === 'Achievement' ? achChart : growthChart

  if (chart) {
    chart.dispose()
  }

  chart = echarts.init(container)

  if (type === 'Achievement') {
    achChart = chart
  } else {
    growthChart = chart
  }

  let min, max, splitNumber
  let axisLineColors

  if (type === 'Achievement') {
    min = 0
    max = 150
    splitNumber = 6
    axisLineColors = [
      [90 / 150, '#ff0000'],   // < 90
      [95 / 150, '#FF4500'],   // 90-94
      [100 / 150, '#FFA500'],  // 95-99
      [105 / 150, '#00FF00'],  // 100-104
      [110 / 150, '#00DD00'],  // 105-110
      [1, '#00AA00']           // > 110
    ]
  } else {
    min = -30
    max = 60
    splitNumber = 9
    axisLineColors = [
      [40 / 100, '#ff0000'],  // < -10
      [50 / 100, '#FFC000'],  // -10 – 0
      [60 / 100, '#ffff00'],  // 0 – 10
      [1, '#92d050']          // > 10
    ]
  }

  const option = {
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: min,
        max: max,
        splitNumber: splitNumber,
        radius: '90%',
        center: ['50%', '75%'],
        axisLine: {
          lineStyle: {
            width: 20,
            color: axisLineColors
          }
        },
        pointer: {
          icon: 'path://M2,0 L3,20 L2.5,100 L1.5,100 L1,20 Z',
          length: '70%',
          width: 5,
          offsetCenter: [0, '0%'],
          itemStyle: {
            color: '#000000',
            shadowColor: 'rgba(0, 0, 0, 0.4)',
            shadowBlur: 6,
            shadowOffsetX: 0,
            shadowOffsetY: 2
          }
        },
        anchor: {
          show: true,
          showAbove: true,
          size: 14,
          itemStyle: {
            color: '#000',
            borderWidth: 2,
            borderColor: '#fff',
            shadowColor: 'rgba(0, 0, 0, 0.3)',
            shadowBlur: 4
          }
        },
        axisTick: {
          length: 8,
          lineStyle: {
            color: 'auto',
            width: 2
          }
        },
        splitLine: {
          length: 12,
          lineStyle: {
            color: 'auto',
            width: 3
          }
        },
        axisLabel: {
          color: '#000000',
          fontSize: 9,
          distance: -38,
          fontWeight: '600',
          formatter: function (value) {
            return value.toFixed(0)
          }
        },
        title: {
          show: true,
          offsetCenter: [0, '-150%'],
          fontSize: 14,
          fontWeight: 'bold',
          color: '#1f77b4'
        },
        detail: {
          fontSize: 22,
          fontWeight: 'bold',
          offsetCenter: [0, '20%'],
          valueAnimation: true,
          formatter: function (value) {
            return value.toFixed(1) + '%'
          },
          color: '#000000'
        },
        data: [
          {
            value: value,
            name: type
          }
        ]
      }
    ]
  }

  chart.setOption(option)
}

const indonesiaGeoJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'R1', RegKey: 1 },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [94, 6],
          [106, 6],
          [106, -6],
          [94, -6],
          [94, 6]
        ]]
      }
    },

    {
      type: 'Feature',
      properties: { name: 'R2', RegKey: 2 },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [106.6, -6.0],
          [107.1, -6.0],
          [107.1, -6.5],
          [106.6, -6.5],
          [106.6, -6.0]
        ]]
      }
    },

    {
      type: 'Feature',
      properties: { name: 'R3', RegKey: 3 },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [108.5, -6.0],
          [111.5, -6.0],
          [111.5, -8.5],
          [108.5, -8.5],
          [108.5, -6.0]
        ]]
      }
    },

    {
      type: 'Feature',
      properties: { name: 'R4', RegKey: 4 },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [111.5, -6.0],
          [114.5, -6.0],
          [114.5, -8.8],
          [111.5, -8.8],
          [111.5, -6.0]
        ]]
      }
    },

    {
      type: 'Feature',
      properties: { name: 'R5', RegKey: 5 },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [108, 4],
          [119, 4],
          [119, -4],
          [108, -4],
          [108, 4]
        ]]
      }
    },

    {
      type: 'Feature',
      properties: { name: 'R6', RegKey: 6 },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [106.0, -5.5],
          [108.5, -5.5],
          [108.5, -7.5],
          [106.0, -7.5],
          [106.0, -5.5]
        ]]
      }
    }
  ]
}

const fixedPinPositions = {
  R1: { lat: 4.0, lon: 100.5 },
  R2: { lat: -3.2, lon: 106.8 },
  R3: { lat: -8.5, lon: 110.3 },
  R4: { lat: -5.8, lon: 115.5 },
  R5: { lat: -2.5, lon: 115.5 },
  R6: { lat: -6.5, lon: 106.5 }
}

onBeforeUnmount(() => {
  if (achChart) achChart.dispose()
  if (growthChart) growthChart.dispose()
  if (mapInstance) mapInstance.remove()
})

const initMap = () => {
  if (!mapContainer.value || !regionalData.value.length) return

  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }

  mapInstance = L.map(mapContainer.value, {
    center: [-2.0, 116.4],
    zoom: 4.6,
    minZoom: 4,
    maxZoom: 6,
    zoomControl: false,
    dragging: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    touchZoom: false
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(mapInstance)

  // Map style - semua region abu-abu
  const style = () => {
    return {
      fillColor: '#B0B0B0', // Abu-abu untuk semua region
      weight: 2,
      opacity: 1,
      color: '#000',
      fillOpacity: 0.7
    }
  }

  const geoJsonData = regionalGeoJSON.value || indonesiaGeoJSON
  L.geoJSON(geoJsonData, { style: style }).addTo(mapInstance)

  // Add markers with colored text
  regionalData.value.forEach(regional => {
    const position = fixedPinPositions[regional.name]
    if (!position) return

    const achColor = getAchievementColor(regional.achievement)
    const growthColor = getGrowthColor(regional.growth)

    const icon = L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div style="
          background: white;
          border: 3px solid white;
          border-radius: 10px;
          padding: 5px 11px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.45);
          outline: 2px solid #333;
          white-space: nowrap;
        ">
          <div style="font-size: 10.5px; font-weight: bold; color: #000;">
            📍 ${regional.name}(${regional.contribution.toFixed(0)}%):
            <span style="color: ${achColor}; font-weight: bold;">${regional.achievement.toFixed(1)}%</span> |
            <span style="color: ${growthColor}; font-weight: bold;">${regional.growth.toFixed(1)}%</span>
          </div>
        </div>
      `,
      iconSize: [190, 36],
      iconAnchor: [90, 18]
    })

    L.marker([position.lat, position.lon], { icon }).addTo(mapInstance)
  })
}

const exportLeafletMapAsImage = () => {
  return new Promise((resolve, reject) => {
    if (!mapInstance) return resolve(null)

    leafletImage(mapInstance, (err, canvas) => {
      if (err) {
        reject(err)
        return
      }

      const img = document.createElement('img')
      img.src = canvas.toDataURL('image/png')
      img.style.width = '100%'
      img.style.height = '100%'
      img.style.objectFit = 'cover'

      resolve(img)
    })
  })
}

const downloadDashboardAsImage = async () => {
  const element = document.getElementById('dashboard-export')
  if (!element) {
    ElMessage.error('Dashboard belum siap')
    return
  }

  try {
    ElMessage.info('📸 Memproses gambar, mohon tunggu...')

    // Import dom-to-image-more (better for complex DOM)
    const domtoimage = await import('dom-to-image-more')

    // Wait for all elements to be fully rendered
    await new Promise(resolve => setTimeout(resolve, 800))

    // Capture using dom-to-image
    const blob = await domtoimage.toBlob(element, {
      quality: 1.0,
      bgcolor: '#ffffff',
      width: element.scrollWidth,
      height: element.scrollHeight,
      style: {
        transform: 'scale(1)',
        transformOrigin: 'top left'
      },
      filter: (node) => {
        // Exclude any loading indicators or tooltips
        return !node.classList?.contains('el-loading-mask')
      }
    })

    // Download the blob
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    link.download = `dashboard-${filters.selectedYear}-C${filters.selectedCycle}-${timestamp}.png`
    link.href = url
    link.click()

    // Cleanup
    setTimeout(() => URL.revokeObjectURL(url), 100)

    ElMessage.success(' Dashboard berhasil di-download!')
  } catch (err) {
    console.error('Download error:', err)

    // Fallback to simple screenshot if dom-to-image fails
    try {
      ElMessage.info('Mencoba metode alternatif...')

      const html2canvas = (await import('html2canvas')).default

      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 1.5,
        useCORS: false,
        allowTaint: true,
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight
      })

      const link = document.createElement('a')
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
      link.download = `dashboard-${filters.selectedYear}-C${filters.selectedCycle}-${timestamp}.png`
      link.href = canvas.toDataURL('image/png', 0.95)
      link.click()

      ElMessage.success(' Dashboard berhasil di-download (metode alternatif)!')
    } catch (fallbackErr) {
      console.error('Fallback error:', fallbackErr)
      ElMessage.error('❌ Gagal download: ' + fallbackErr.message)
    }
  }
}

onMounted(() => {
  fetchCycles()
  fetchRegionalGeoJSON()
})
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: #f9fafb;
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
  background: white;
  border-bottom: 2px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.filters-container {
  max-width: 100%;
  padding: 1rem 2rem;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-inline-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group-label {
  font-weight: 600;
  font-size: 0.875rem;
  color: #374151;
  white-space: nowrap;
}

.filter-divider {
  width: 1px;
  height: 30px;
  background: #d1d5db;
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
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.loading-text {
  margin-top: 1rem;
  color: #6b7280;
  font-size: 1rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
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

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.map-gauge-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header-inline {
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: #1f2937;
  margin: 0;
}

.map-gauge-grid {
  display: grid;
  grid-template-columns: 3fr 0.9fr;
  gap: 1.5rem;
  align-items: start;
}

.map-container-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-self: start;
  height: fit-content;
}

.map-container {
  height: 420px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e5e7eb;
  margin: 0;
}

.leaflet-map {
  width: 100%;
  height: 100%;
  background: #f0f9ff;
}

.custom-div-icon {
  background: transparent !important;
  border: none !important;
}

.contribution-text {
  background: #f0fdf4;
  border-left: 4px solid #1f77b4;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #1f2937;
  border-radius: 4px;
}

.map-legend {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.legend-block {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.legend-title {
  font-size: 0.85rem;
  color: #1f2937;
}

.legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.25rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #4b5563;
}

.legend-color {
  width: 18px;
  height: 10px;
  border-radius: 2px;
  border: 1px solid #000;
}

.gauges-container {
  display: flex;
  flex-direction: column;
  /* gap: 1rem; */
  margin-top: 0;
  height: fit-content;
}

.gauge-card {
  background: #f9fafb;
  border-radius: 8px;
  padding: 0.25rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #e5e7eb;
  margin-bottom: 1rem;
}

.table-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.total-row) {
  background-color: #1f77b4 !important;
  color: white !important;
  font-weight: bold !important;
}

:deep(.total-row td) {
  color: white !important;
  font-weight: bold !important;
}

@media (max-width: 1400px) {
  .map-gauge-grid {
    grid-template-columns: 2.5fr 1fr;
  }
}

@media (max-width: 1200px) {
  .map-gauge-grid {
    grid-template-columns: 1fr;
  }

  .gauges-container {
    flex-direction: row;
  }
}

@media (max-width: 768px) {
  .header-title {
    font-size: 1.25rem;
  }

  .filters-container {
    padding: 0.75rem 1rem;
  }

  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-inline-group {
    flex-wrap: wrap;
  }

  .main-content-wrapper {
    padding: 1rem;
  }

  .gauges-container {
    flex-direction: column;
  }
}
</style>
