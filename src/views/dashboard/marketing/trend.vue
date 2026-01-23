<!-- TrendMovingAverage.vue -->
<template>
  <div class="trend-dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <h1 class="header-title">📈 TREND MOVING AVERAGE</h1>
    </div>

    <!-- Filters Bar -->
    <div class="filters-bar">
      <div class="filters-container">
        <div class="filter-row">
          <!-- Level Filter -->
          <div class="filter-group">
            <label class="filter-label">📊 Level:</label>
            <el-select v-model="filters.level" @change="onLevelChange" size="default" style="width: 140px">
              <el-option label="NASIONAL" value="NASIONAL" />
              <el-option label="REGIONAL" value="REGIONAL" />
              <el-option label="AREA" value="AREA" />
              <el-option label="RAYON" value="RAYON" />
              <el-option label="ZONA" value="ZONA" />
            </el-select>
          </div>

          <!-- Dynamic Level Filters -->
          <div v-if="filters.level === 'REGIONAL'" class="filter-group">
            <label class="filter-label">🗺️ Regional:</label>
            <el-select
              v-model="filters.selectedRegionals"
              multiple
              collapse-tags
              placeholder="Pilih Regional"
              size="default"
              style="width: 250px"
              :disabled="!regionalOptions.length"
            >
              <el-option v-for="reg in regionalOptions" :key="reg" :value="reg" :label="reg" />
            </el-select>
          </div>

          <div v-if="filters.level === 'AREA'" class="filter-group">
            <label class="filter-label">🏢 Area:</label>
            <el-select
              v-model="filters.selectedArea"
              filterable
              placeholder="Pilih Area"
              size="default"
              style="width: 300px"
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

          <div v-if="filters.level === 'RAYON'" class="filter-group">
            <label class="filter-label">👥 Rayon:</label>
            <el-select
              v-model="filters.selectedRayon"
              filterable
              placeholder="Pilih Rayon"
              size="default"
              style="width: 300px"
              :loading="loadingRayonZona"
            >
              <el-option
                v-for="rayon in rayonOptions"
                :key="rayon.value"
                :value="rayon.value"
                :label="rayon.label"
              />
            </el-select>
          </div>

          <div v-if="filters.level === 'ZONA'" class="filter-group">
            <label class="filter-label">📍 Zona:</label>
            <el-select
              v-model="filters.selectedZona"
              filterable
              placeholder="Pilih Zona"
              size="default"
              style="width: 300px"
              :loading="loadingRayonZona"
            >
              <el-option
                v-for="zona in zonaOptions"
                :key="zona.value"
                :value="zona.value"
                :label="zona.label"
              />
            </el-select>
          </div>

          <div class="filter-divider"></div>

          <!-- Year Filter -->
          <div class="filter-group">
            <label class="filter-label">📅 Tahun:</label>
            <el-select v-model="filters.year" size="default" style="width: 100px">
              <el-option v-for="year in yearOptions" :key="year" :value="year" :label="year" />
            </el-select>
          </div>

          <!-- Load Button -->
          <el-button type="primary" @click="loadData" :loading="loading" size="default" style="margin-left: auto">
            <span v-if="!loading"><el-icon><Histogram /></el-icon> Load Data</span>
            <span v-else>⏳ Loading...</span>
          </el-button>

          <!-- Download Button -->
          <el-button
            v-if="dashboardData"
            type="warning"
            @click="downloadDashboard"
            size="default"
          >
            <el-icon><Camera /></el-icon>
            Image
          </el-button>
        </div>

        <!-- Family, Tobacco Group, Brand & Week Filters (shown after data loaded) -->
        <div v-if="dashboardData" class="filter-row" style="margin-top: 1rem; border-top: 1px solid #e5e7eb; padding-top: 1rem;">
          <!-- Family Filter -->
          <div class="filter-group">
            <label class="filter-label">👨‍👩‍👧‍👦 Family:</label>
            <el-select
              v-model="filters.selectedFamilies"
              filterable
              collapse-tags
              collapse-tags-tooltip
              :max-collapse-tags="2"
              placeholder="All Family"
              size="default"
              style="width: 250px"
              @change="onFamilyChange"
            >
              <el-option v-for="family in familyOptions" :key="family" :value="family" :label="family" />
            </el-select>
          </div>

          <!-- Tobacco Group Filter -->
          <div class="filter-group">
            <label class="filter-label">🚬 Tobacco Group:</label>
            <el-select
              v-model="filters.selectedTobaccoGroups"
              filterable
              collapse-tags
              collapse-tags-tooltip
              :max-collapse-tags="2"
              placeholder="All Tobacco"
              size="default"
              style="width: 250px"
              @change="onTobaccoGroupChange"
            >
              <el-option v-for="group in tobaccoGroupOptions" :key="group" :value="group" :label="group" />
            </el-select>
          </div>

          <!-- Brand Filter -->
          <div class="filter-group">
            <label class="filter-label">🏷️ Brand:</label>
            <el-select
              v-model="filters.selectedBrands"
              multiple
              filterable
              collapse-tags
              collapse-tags-tooltip
              :max-collapse-tags="3"
              placeholder="All Brands"
              size="default"
              style="width: 400px"
            >
              <el-option v-for="brand in filteredBrandOptions" :key="brand" :value="brand" :label="brand" />
            </el-select>
          </div>

          <div class="filter-group">
            <label class="filter-label">📅 Week Cutoff:</label>
            <el-slider
              v-model="filters.maxWeek"
              :min="1"
              :max="52"
              :step="1"
              show-input
              :show-input-controls="false"
              style="width: 250px"
            />
          </div>

          <el-button type="success" @click="applyFilters" size="default">
            <el-icon><Check /></el-icon> Apply Filters
          </el-button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <el-icon class="is-loading" :size="60"><Loading /></el-icon>
        <p>Mengambil data dari SAP...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="!dashboardData" class="empty-state">
        <div class="empty-icon">📊</div>
        <h3>Dashboard Belum Dimuat</h3>
        <p>Silakan pilih filter dan klik tombol "Load Data" untuk menampilkan grafik trend</p>
      </div>

      <!-- Dashboard Content -->
      <div v-else class="dashboard-content">
        <!-- Info Banner -->
        <el-alert
          v-if="dataInfo"
          :title="dataInfo"
          type="info"
          :closable="false"
          show-icon
        />

        <!-- Chart and Gauges (Export Container) -->
        <div id="dashboard-export-container" class="chart-gauge-container">
          <!-- Chart Section -->
          <div class="chart-section">
            <div class="section-header">
              <h3>📈 Trend Volume Total</h3>
            </div>
            <div ref="chartContainer" style="width: 100%; height: 500px;"></div>
          </div>

          <!-- Gauges Section -->
          <div class="gauges-section">
            <div class="section-header">
              <h3>🎯 ACH / GROWTH</h3>
            </div>
            <div class="gauge-card">
              <div ref="achGauge" style="width: 100%; height: 200px;"></div>
            </div>
            <div class="gauge-card">
              <div ref="growthGauge" style="width: 100%; height: 200px;"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import html2canvas from 'html2canvas'
import { Calendar, Filter, Histogram, Check, InfoFilled, Camera } from '@element-plus/icons-vue'

const API_BASE_URL = 'http://localhost:5000/api'

// State
const loading = ref(false)
const loadingAreas = ref(false)
const loadingRayonZona = ref(false)
const dashboardData = ref(null)
const rawData = ref(null)
const areaList = ref([])
const rayonZonaList = ref([])
const dataInfo = ref('')

// Refs for charts
const chartContainer = ref(null)
const achGauge = ref(null)
const growthGauge = ref(null)
let chartInstance = null
let achGaugeInstance = null
let growthGaugeInstance = null

// Filters
const filters = reactive({
  level: 'NASIONAL',
  year: new Date().getFullYear(),
  unit: 'BOX', // Fixed to BOX
  selectedArea: '',
  selectedRayon: '',
  selectedZona: '',
  selectedRegionals: [],
  selectedFamilies: [],
  selectedTobaccoGroups: [],
  selectedBrands: [],
  maxWeek: 52
})

// Computed Options
const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 10 }, (_, i) => currentYear - i)
})

const areaOptions = computed(() => {
  return areaList.value.map(area => ({
    value: area.sales_office,
    label: `${area.sales_office_desc} (${area.sales_office})`
  }))
})

const rayonOptions = computed(() => {
  if (!rayonZonaList.value.length) return []
  const rayons = rayonZonaList.value
    .filter(item => item.rayon && item.rayon_desc)
    .map(item => ({
      value: item.rayon,
      label: `${item.rayon_desc} (${item.rayon})`
    }))
  return [...new Map(rayons.map(item => [item.value, item])).values()]
})

const zonaOptions = computed(() => {
  if (!rayonZonaList.value.length) return []
  const zonas = rayonZonaList.value
    .filter(item => item.zona && item.zona_desc)
    .map(item => ({
      value: item.zona,
      label: `${item.zona_desc} (${item.zona})`
    }))
  return [...new Map(zonas.map(item => [item.value, item])).values()]
})

const regionalOptions = computed(() => {
  if (!rawData.value) return []
  const regionals = rawData.value
    .filter(item => item.regional)
    .map(item => item.regional)
  return [...new Set(regionals)].sort()
})

// Family options - dari rawData
const familyOptions = computed(() => {
  if (!rawData.value) return []
  const families = rawData.value
    .filter(item => item.family)
    .map(item => item.family)
  return [...new Set(families)].sort()
})

const tobaccoGroupOptions = computed(() => {
  if (!rawData.value) return []
  const groups = rawData.value
    .filter(item => item.tobacco_group)
    .map(item => item.tobacco_group)
  return [...new Set(groups)].sort()
})

// Brand options - semua brand dari rawData
const brandOptions = computed(() => {
  if (!rawData.value) return []
  const brands = rawData.value
    .filter(item => item.brand_categ)
    .map(item => item.brand_categ)
  return [...new Set(brands)].sort()
})

// Filtered Brand options - berdasarkan family dan tobacco group yang dipilih
const filteredBrandOptions = computed(() => {
  if (!rawData.value) return []

  let filtered = [...rawData.value]

  // Filter berdasarkan family yang dipilih
  if (filters.selectedFamilies.length > 0) {
    filtered = filtered.filter(item =>
      filters.selectedFamilies.includes(item.family)
    )
  }

  // Filter berdasarkan tobacco group yang dipilih
  if (filters.selectedTobaccoGroups.length > 0) {
    filtered = filtered.filter(item =>
      filters.selectedTobaccoGroups.includes(item.tobacco_group)
    )
  }

  // Ambil brand unik dari data yang sudah difilter
  const brands = filtered
    .filter(item => item.brand_categ)
    .map(item => item.brand_categ)

  return [...new Set(brands)].sort()
})

// Methods
const onLevelChange = () => {
  // Reset related filters
  filters.selectedArea = ''
  filters.selectedRayon = ''
  filters.selectedZona = ''
  filters.selectedRegionals = []
  dashboardData.value = null
  rawData.value = null

  // Load dropdown data if needed
  if (filters.level === 'AREA' && areaList.value.length === 0) {
    fetchAreas()
  }
  if ((filters.level === 'RAYON' || filters.level === 'ZONA') && rayonZonaList.value.length === 0) {
    fetchRayonZona()
  }
}

const onFamilyChange = () => {
  // Reset brands yang tidak sesuai dengan family yang dipilih
  if (filters.selectedFamilies.length > 0) {
    const validBrands = filteredBrandOptions.value
    filters.selectedBrands = filters.selectedBrands.filter(brand =>
      validBrands.includes(brand)
    )
  }
}

const onTobaccoGroupChange = () => {
  // Reset brands yang tidak sesuai dengan tobacco group yang dipilih
  if (filters.selectedTobaccoGroups.length > 0) {
    const validBrands = filteredBrandOptions.value
    filters.selectedBrands = filters.selectedBrands.filter(brand =>
      validBrands.includes(brand)
    )
  }
}

const fetchAreas = async () => {
  loadingAreas.value = true
  try {
    const response = await fetch(`${API_BASE_URL}/areas`)
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

const fetchRayonZona = async () => {
  loadingRayonZona.value = true
  try {
    const response = await fetch(`${API_BASE_URL}/rayon-zona`)
    const result = await response.json()
    if (result.success) {
      rayonZonaList.value = result.data
    }
  } catch (error) {
    ElMessage.error('Gagal memuat daftar rayon/zona')
    console.error(error)
  } finally {
    loadingRayonZona.value = false
  }
}

const loadData = async () => {
  // Validation
  if (filters.level === 'AREA' && !filters.selectedArea) {
    ElMessage.warning('Silakan pilih Area terlebih dahulu')
    return
  }
  if (filters.level === 'RAYON' && !filters.selectedRayon) {
    ElMessage.warning('Silakan pilih Rayon terlebih dahulu')
    return
  }
  if (filters.level === 'ZONA' && !filters.selectedZona) {
    ElMessage.warning('Silakan pilih Zona terlebih dahulu')
    return
  }

  loading.value = true

  try {
    const params = new URLSearchParams({
      year: filters.year,
      unit: filters.unit,
      level: filters.level
    })

    if (filters.level === 'AREA') params.append('vkbur', filters.selectedArea)
    if (filters.level === 'RAYON') params.append('vkgrp', filters.selectedRayon)
    if (filters.level === 'ZONA') params.append('bzirk', filters.selectedZona)

    const response = await fetch(`${API_BASE_URL}/trend-data?${params}`)
    const result = await response.json()

    if (result.success && result.data.length > 0) {
      rawData.value = result.data

      // Reset filters
      filters.selectedFamilies = []
      filters.selectedTobaccoGroups = []
      filters.selectedBrands = []
      filters.maxWeek = 52

      processData()
      ElMessage.success(` Data berhasil dimuat: ${result.count} records`)
    } else {
      ElMessage.warning('Tidak ada data yang ditemukan')
      dashboardData.value = null
    }
  } catch (error) {
    ElMessage.error('Gagal memuat data: ' + error.message)
    console.error(error)
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  if (!rawData.value) return
  processData()
  ElMessage.success('Filter berhasil diterapkan')
}

const processData = () => {
  let data = [...rawData.value]

  // Apply regional filter
  if (filters.level === 'REGIONAL' && filters.selectedRegionals.length > 0) {
    data = data.filter(item => filters.selectedRegionals.includes(item.regional))
  }

  // Apply family filter
  if (filters.selectedFamilies.length > 0) {
    data = data.filter(item => filters.selectedFamilies.includes(item.family))
  }

  // Apply tobacco group filter
  if (filters.selectedTobaccoGroups.length > 0) {
    data = data.filter(item => filters.selectedTobaccoGroups.includes(item.tobacco_group))
  }

  // Apply brand filter
  if (filters.selectedBrands.length > 0) {
    data = data.filter(item => filters.selectedBrands.includes(item.brand_categ))
  }

  // Apply week cutoff
  data = data.filter(item => item.week <= filters.maxWeek)

  // Group and aggregate data
  const grouped = groupDataByWeek(data)
  const targetData = extractTargetData(data)

  dashboardData.value = {
    grouped,
    targetData,
    currentYear: grouped.filter(d => d.cycle_year === filters.year.toString()),
    lastYear: grouped.filter(d => d.cycle_year === (filters.year - 1).toString())
  }

  nextTick(() => {
    renderChart()
    renderGauges()
  })
}

const groupDataByWeek = (data) => {
  const weekMap = new Map()

  data.forEach(item => {
    if (item.source?.toUpperCase() === 'TARGET') return

    const key = `${item.cycle_year}-${item.week}`
    if (!weekMap.has(key)) {
      weekMap.set(key, {
        cycle_year: item.cycle_year,
        week: item.week,
        volume: 0,
        pred: 0
      })
    }
    const existing = weekMap.get(key)
    existing.volume += item.volume || 0
    existing.pred += item.pred || 0
  })

  return Array.from(weekMap.values()).sort((a, b) => a.week - b.week)
}

const extractTargetData = (data) => {
  const targetMap = new Map()

  data.forEach(item => {
    if (item.source?.toUpperCase() !== 'TARGET') return
    if (item.cycle_year !== filters.year.toString()) return

    if (!targetMap.has(item.week)) {
      targetMap.set(item.week, 0)
    }
    targetMap.set(item.week, targetMap.get(item.week) + (item.target || 0))
  })

  return Array.from(targetMap.entries())
    .map(([week, target]) => ({ week, target }))
    .sort((a, b) => a.week - b.week)
}

const calculateLinearRegression = (data) => {
  const n = data.length
  if (n < 2) return null

  const sumX = data.reduce((sum, d) => sum + d.week, 0)
  const sumY = data.reduce((sum, d) => sum + d.volume, 0)
  const sumXY = data.reduce((sum, d) => sum + d.week * d.volume, 0)
  const sumX2 = data.reduce((sum, d) => sum + d.week * d.week, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  return { slope, intercept }
}

const renderChart = () => {
  if (!chartContainer.value || !dashboardData.value) return

  if (chartInstance) {
    chartInstance.dispose()
  }

  chartInstance = echarts.init(chartContainer.value)

  const currentYear = dashboardData.value.currentYear
  const lastYear = dashboardData.value.lastYear
  const targetData = dashboardData.value.targetData

  // Calculate trend line
  let trendData = []
  if (currentYear.length >= 2) {
    const regression = calculateLinearRegression(currentYear)
    if (regression) {
      trendData = Array.from({ length: filters.maxWeek }, (_, i) => {
        const week = i + 1
        const value = regression.slope * week + regression.intercept
        return [week, value > 0 ? value : null]
      })
    }
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    legend: {
      data: [`VOL ${filters.year - 1}`, `VOL ${filters.year}`, 'Trend Line', 'TMA (Pred)', `AE ${filters.year} (Target)`],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: 'Week',
      min: 0,
      max: filters.maxWeek + 1,
      interval: 5
    },
    yAxis: {
      type: 'value',
      name: `Volume (${filters.unit})`
    },
    series: [
      // Last Year
      {
        name: `VOL ${filters.year - 1}`,
        type: 'line',
        data: lastYear.map(d => [d.week, d.volume]),
        itemStyle: { color: '#FF69B4' },
        lineStyle: { width: 2.5 }
      },
      // Current Year
      {
        name: `VOL ${filters.year}`,
        type: 'line',
        data: currentYear.map(d => [d.week, d.volume]),
        itemStyle: { color: '#00D000' },
        lineStyle: { width: 3 },
        symbol: 'circle',
        symbolSize: 8
      },
      // Trend Line
      {
        name: 'Trend Line',
        type: 'line',
        data: trendData,
        itemStyle: { color: '#1E90FF' },
        lineStyle: { width: 2.5, type: 'dashed' },
        symbol: 'none'
      },
      // TMA Prediction
      {
        name: 'TMA (Pred)',
        type: 'line',
        data: currentYear.filter(d => d.pred > 0).map(d => [d.week, d.pred]),
        itemStyle: { color: '#87CEEB' },
        lineStyle: { width: 2, type: 'dotted' },
        symbol: 'diamond',
        symbolSize: 6
      },
      // Target
      {
        name: `AE ${filters.year} (Target)`,
        type: 'line',
        data: targetData.map(d => [d.week, d.target]),
        itemStyle: { color: '#FF0000' },
        lineStyle: { width: 2, type: 'dotted' },
        symbol: 'none'
      }
    ]
  }

  chartInstance.setOption(option)
}

const renderGauges = () => {
  if (!dashboardData.value) return

  const currentYear = dashboardData.value.currentYear
  const lastYear = dashboardData.value.lastYear
  const targetData = dashboardData.value.targetData

  const currentWeek = currentYear.length > 0 ? Math.max(...currentYear.map(d => d.week)) : 0
  const ytdActual = currentYear.reduce((sum, d) => sum + d.volume, 0)
  const ytdTarget = targetData.filter(d => d.week <= currentWeek).reduce((sum, d) => sum + d.target, 0)
  const ytdLastYear = lastYear.filter(d => d.week <= currentWeek).reduce((sum, d) => sum + d.volume, 0)

  const achievement = ytdTarget > 0 ? (ytdActual / ytdTarget * 100) : 0
  const growth = ytdLastYear > 0 ? ((ytdActual - ytdLastYear) / ytdLastYear * 100) : 0

  renderGauge(achGauge.value, achievement, 'Achievement', 'Achievement')
  renderGauge(growthGauge.value, growth, 'Growth', 'Growth')
}

const renderGauge = (container, value, title, type) => {
  if (!container) return

  const instance = type === 'Achievement' ? achGaugeInstance : growthGaugeInstance
  if (instance) {
    instance.dispose()
  }

  const chart = echarts.init(container)
  if (type === 'Achievement') {
    achGaugeInstance = chart
  } else {
    growthGaugeInstance = chart
  }

  let axisLineColors, min, max, splitNumber

  if (type === 'Achievement') {
    min = 0
    max = 150
    splitNumber = 6
    axisLineColors = [
      [90 / 150, '#ff0000'],   // < 90
      [100 / 150, '#FFC000'], // 90–99
      [105 / 150, '#ffff00'], // 100–104
      [110 / 150, '#92d050'], // 105–110
      [1, '#00AB00']          // > 110
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
    series: [{
      type: 'gauge',
      startAngle: 180,
      endAngle: 0,
      center: ['50%', '75%'],
      radius: '90%',
      min,
      max,
      splitNumber: 10,
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
        lineStyle: { color: 'auto', width: 2 }
      },
      splitLine: {
        length: 12,
        lineStyle: { color: 'auto', width: 3 }
      },
      axisLabel: {
        color: '#000000',
        fontSize: 9,
        distance: -38,
        fontWeight: '600'
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
        formatter: '{value}%',
        color: '#000000'
      },
      data: [{
        value: Math.round(value * 10) / 10,
        name: title
      }]
    }]
  }

  chart.setOption(option)
}

const downloadDashboard = async () => {
  try {
    ElMessage.info('📸 Sedang memproses gambar, mohon tunggu...')

    const element = document.getElementById('dashboard-export-container')
    if (!element) {
      ElMessage.error('Dashboard belum siap untuk di-download')
      return
    }

    // Wait for all charts to render
    await new Promise(resolve => setTimeout(resolve, 500))

    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true
    })

    // Convert to blob and download
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
      link.download = `trend-dashboard-${filters.year}-${filters.level}-${timestamp}.png`
      link.href = url
      link.click()

      // Cleanup
      setTimeout(() => URL.revokeObjectURL(url), 100)

      ElMessage.success(' Dashboard berhasil di-download!')
    }, 'image/png')

  } catch (error) {
    console.error('Download error:', error)
    ElMessage.error('❌ Gagal download: ' + error.message)
  }
}

onMounted(() => {
  // Auto-load areas for AREA level if needed
})
</script>

<style scoped>
.trend-dashboard {
  min-height: 100vh;
  background: #f5f7fa;
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

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-label {
  font-weight: 600;
  font-size: 0.875rem;
  color: #374151;
  white-space: nowrap;
}

.filter-divider {
  width: 1px;
  height: 30px;
  background: #d1d5db;
  margin: 0 0.5rem;
}

.main-content {
  padding: 1.5rem 2rem;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.loading-state p,
.empty-state p {
  margin-top: 1rem;
  color: #6b7280;
  font-size: 1rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0.5rem 0;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.chart-gauge-container {
  display: grid;
  grid-template-columns: 2.5fr 1fr;
  gap: 1.5rem;
}

.chart-section,
.gauges-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  margin-bottom: 1rem;
}

.section-header h3 {
  font-size: 1.25rem;
  font-weight: bold;
  color: #1f2937;
  margin: 0;
}

.gauges-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.gauge-card {
  background: #f9fafb;
  border-radius: 8px;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
}

@media (max-width: 1200px) {
  .chart-gauge-container {
    grid-template-columns: 1fr;
  }

  .gauges-section {
    flex-direction: row;
  }
}

@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }

  .gauges-section {
    flex-direction: column;
  }
}
</style>
