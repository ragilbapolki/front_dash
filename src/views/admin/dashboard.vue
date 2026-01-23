<template>
  <div class="dashboard-container">
    <!-- Hero Welcome Section -->
    <div class="hero-welcome">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <div class="hero-text">
          <div class="greeting-label">👋 Selamat Datang Kembali</div>
          <h1 class="hero-title">
            <span class="user-name">{{ ctx.userInfo.name }}</span>
          </h1>
          <p class="hero-subtitle">Ini adalah ringkasan aktivitas Anda hari ini</p>
        </div>
        <div class="hero-time-card">
          <i class="el-icon-time"></i>
          <div class="time-info">
            <div class="time-day">{{ currentDay }}</div>
            <div class="time-date">{{ currentDate }}</div>
          </div>
        </div>
      </div>
      <div class="hero-decoration">
        <div class="float-circle circle-1"></div>
        <div class="float-circle circle-2"></div>
        <div class="float-circle circle-3"></div>
      </div>
    </div>

    <!-- Statistics Cards with Glassmorphism -->
    <el-row :gutter="24" class="stats-row">
      <el-col :xs="24" :sm="12" :lg="6" v-for="(stat, index) in stats" :key="index">
        <div class="stat-card" :class="`stat-${stat.color}`">
          <div class="stat-bg-pattern"></div>
          <div class="stat-header">
            <div class="stat-icon-wrapper">
              <i :class="stat.icon"></i>
            </div>
            <div class="stat-trend" :class="stat.trend">
              <i :class="stat.trend === 'up' ? 'el-icon-top' : 'el-icon-bottom'"></i>
              {{ stat.percentage }}
            </div>
          </div>
          <div class="stat-body">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
          <div class="stat-shine"></div>
        </div>
      </el-col>
    </el-row>

    <!-- Main Content Grid -->
    <el-row :gutter="24" class="main-content">
      <!-- Sales Chart -->
      <el-col :xs="24" :lg="16">
        <div class="glass-card chart-card">
          <div class="card-header">
            <div class="card-title-group">
              <i class="el-icon-data-line title-icon"></i>
              <h3 class="card-title">Statistik Penjualan</h3>
            </div>
            <el-radio-group v-model="chartPeriod" size="small" class="period-selector">
              <el-radio-button label="week">Minggu</el-radio-button>
              <el-radio-button label="month">Bulan</el-radio-button>
              <el-radio-button label="year">Tahun</el-radio-button>
            </el-radio-group>
          </div>
          <div class="chart-wrapper">
            <div class="chart-grid">
              <div class="grid-line" v-for="i in 5" :key="i"></div>
            </div>
            <div class="chart-bars">
              <div
                class="chart-bar"
                v-for="(bar, i) in chartData"
                :key="i"
                :style="{ height: bar.height + '%' }"
                @mouseenter="hoverBar = i"
                @mouseleave="hoverBar = -1"
              >
                <div class="bar-tooltip" v-if="hoverBar === i">
                  <span class="tooltip-value">{{ bar.value }}</span>
                  <span class="tooltip-label">{{ bar.label }}</span>
                </div>
                <div class="bar-fill" :style="{ animationDelay: i * 0.1 + 's' }"></div>
              </div>
            </div>
          </div>
        </div>
      </el-col>

      <!-- Activity Feed -->
      <el-col :xs="24" :lg="8">
        <div class="glass-card activity-card">
          <div class="card-header">
            <div class="card-title-group">
              <i class="el-icon-bell title-icon"></i>
              <h3 class="card-title">Aktivitas Terbaru</h3>
            </div>
            <el-badge :value="5" class="activity-badge">
              <i class="el-icon-more"></i>
            </el-badge>
          </div>
          <div class="activity-timeline">
            <div
              class="activity-item"
              v-for="(activity, i) in activities"
              :key="i"
              :style="{ animationDelay: i * 0.1 + 's' }"
            >
              <div class="activity-dot" :class="`dot-${activity.type}`"></div>
              <div class="activity-line" v-if="i < activities.length - 1"></div>
              <div class="activity-content">
                <div class="activity-icon" :class="`icon-${activity.type}`">
                  <i :class="activity.icon"></i>
                </div>
                <div class="activity-info">
                  <div class="activity-title">{{ activity.title }}</div>
                  <div class="activity-time">
                    <i class="el-icon-time"></i>
                    {{ activity.time }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- Bottom Section -->
    <el-row :gutter="24" class="bottom-section">
      <!-- Quick Actions -->
      <el-col :xs="24" :md="12">
        <div class="glass-card actions-card">
          <div class="card-header">
            <div class="card-title-group">
              <i class="el-icon-s-grid title-icon"></i>
              <h3 class="card-title">Aksi Cepat</h3>
            </div>
          </div>
          <div class="quick-actions-grid">
            <div
              class="action-item"
              v-for="(action, i) in quickActions"
              :key="i"
              :class="`action-${action.color}`"
            >
              <div class="action-icon">
                <i :class="action.icon"></i>
              </div>
              <div class="action-label">{{ action.label }}</div>
              <div class="action-hover-effect"></div>
            </div>
          </div>
        </div>
      </el-col>

      <!-- Progress Overview -->
      <el-col :xs="24" :md="12">
        <div class="glass-card progress-card">
          <div class="card-header">
            <div class="card-title-group">
              <i class="el-icon-trophy title-icon"></i>
              <h3 class="card-title">Target Progress</h3>
            </div>
          </div>
          <div class="progress-list">
            <div
              class="progress-item"
              v-for="(progress, i) in progressData"
              :key="i"
              :style="{ animationDelay: i * 0.15 + 's' }"
            >
              <div class="progress-header">
                <div class="progress-info">
                  <div class="progress-icon" :style="{ background: progress.color }">
                    <i :class="progress.icon"></i>
                  </div>
                  <span class="progress-name">{{ progress.name }}</span>
                </div>
                <span class="progress-value">{{ progress.value }}%</span>
              </div>
              <div class="progress-bar-wrapper">
                <div class="progress-bar-bg">
                  <div
                    class="progress-bar-fill"
                    :style="{
                      width: progress.value + '%',
                      background: progress.color
                    }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ctx } from '@/store'
import { ref, onMounted, onUnmounted, computed } from 'vue'

const currentDay = ref('')
const currentDate = ref('')
const chartPeriod = ref('week')
const hoverBar = ref(-1)

const stats = ref([
  { icon: 'el-icon-user-solid', value: '1,234', label: 'Total Pengguna', percentage: '12%', trend: 'up', color: 'blue' },
  { icon: 'el-icon-shopping-cart-2', value: '567', label: 'Pesanan Baru', percentage: '8%', trend: 'up', color: 'green' },
  { icon: 'el-icon-document', value: '89', label: 'Tugas Pending', percentage: '3%', trend: 'down', color: 'orange' },
  { icon: 'el-icon-coin', value: 'Rp 45M', label: 'Total Revenue', percentage: '15%', trend: 'up', color: 'purple' }
])

const chartData = ref([
  { label: 'Sen', value: 62, height: 70 },
  { label: 'Sel', value: 38, height: 45 },
  { label: 'Rab', value: 59, height: 68 },
  { label: 'Kam', value: 81, height: 92 },
  { label: 'Jum', value: 23, height: 30 },
  { label: 'Sab', value: 96, height: 100 },
  { label: 'Min', value: 53, height: 62 }
])

const activities = ref([
  { icon: 'el-icon-circle-check', title: 'Pesanan baru diterima', time: '5 menit yang lalu', type: 'success' },
  { icon: 'el-icon-warning', title: 'Stok produk menipis', time: '10 menit yang lalu', type: 'warning' },
  { icon: 'el-icon-star-on', title: 'Review positif dari pelanggan', time: '15 menit yang lalu', type: 'star' },
  { icon: 'el-icon-message', title: 'Pesan baru dari customer', time: '20 menit yang lalu', type: 'info' },
  { icon: 'el-icon-user', title: 'User baru mendaftar', time: '25 menit yang lalu', type: 'primary' }
])

const quickActions = ref([
  { icon: 'el-icon-plus', label: 'Tambah Pengguna', color: 'blue' },
  { icon: 'el-icon-document', label: 'Buat Laporan', color: 'green' },
  { icon: 'el-icon-setting', label: 'Pengaturan', color: 'orange' },
  { icon: 'el-icon-message', label: 'Kirim Pesan', color: 'purple' },
  { icon: 'el-icon-upload', label: 'Upload File', color: 'pink' },
  { icon: 'el-icon-download', label: 'Export Data', color: 'teal' }
])

const progressData = ref([
  { name: 'Target Penjualan', value: 75, icon: 'el-icon-s-marketing', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Kepuasan Pelanggan', value: 92, icon: 'el-icon-star-on', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { name: 'Efisiensi Tim', value: 68, icon: 'el-icon-s-custom', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }
])

const updateTime = () => {
  const now = new Date()
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

  currentDay.value = days[now.getDay()]
  currentDate.value = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`
}

let timeInterval

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 60000)
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

// Hero Welcome Section
.hero-welcome {
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 48px;
  margin-bottom: 32px;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.5) inset;
  overflow: hidden;

  .hero-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    z-index: 0;
  }

  .hero-content {
    position: relative;
    z-index: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 32px;
  }

  .hero-text {
    flex: 1;
  }

  .greeting-label {
    font-size: 16px;
    font-weight: 500;
    color: #667eea;
    margin-bottom: 8px;
    display: inline-block;
    animation: fadeInDown 0.6s ease-out;
  }

  .hero-title {
    font-size: 48px;
    font-weight: 800;
    color: #1a1a2e;
    margin: 0 0 12px 0;
    line-height: 1.2;
    animation: fadeInUp 0.6s ease-out 0.1s both;

    .user-name {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        bottom: -4px;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #667eea, #764ba2);
        border-radius: 2px;
        animation: expandWidth 0.8s ease-out 0.4s both;
      }
    }
  }

  .hero-subtitle {
    font-size: 18px;
    color: #666;
    margin: 0;
    animation: fadeInUp 0.6s ease-out 0.2s both;
  }

  .hero-time-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 24px 32px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
    animation: fadeInRight 0.6s ease-out 0.3s both;

    i {
      font-size: 32px;
      color: white;
    }

    .time-info {
      color: white;
    }

    .time-day {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .time-date {
      font-size: 14px;
      opacity: 0.9;
    }
  }

  .hero-decoration {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    pointer-events: none;
    z-index: 0;
  }

  .float-circle {
    position: absolute;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
    animation: float 6s ease-in-out infinite;

    &.circle-1 {
      width: 120px;
      height: 120px;
      top: -60px;
      right: 10%;
      animation-delay: 0s;
    }

    &.circle-2 {
      width: 80px;
      height: 80px;
      bottom: -40px;
      right: 30%;
      animation-delay: 2s;
    }

    &.circle-3 {
      width: 60px;
      height: 60px;
      top: 50%;
      right: 5%;
      animation-delay: 4s;
    }
  }
}

// Statistics Cards
.stats-row {
  margin-bottom: 32px;
}

.stat-card {
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 28px;
  margin-bottom: 24px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  animation: fadeInUp 0.6s ease-out both;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: linear-gradient(90deg, var(--card-color-1), var(--card-color-2));
    transition: height 0.3s ease;
  }

  .stat-bg-pattern {
    position: absolute;
    top: 0;
    right: 0;
    width: 150px;
    height: 150px;
    background: linear-gradient(135deg, var(--card-color-1), var(--card-color-2));
    opacity: 0.05;
    border-radius: 50%;
    transform: translate(30%, -30%);
    transition: all 0.4s ease;
  }

  .stat-shine {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    transform: translateX(-100%);
    transition: transform 0.6s ease;
  }

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);

    &::before {
      height: 100%;
      opacity: 0.1;
    }

    .stat-bg-pattern {
      transform: translate(40%, -40%) scale(1.2);
      opacity: 0.08;
    }

    .stat-shine {
      transform: translateX(100%);
    }
  }

  .stat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .stat-icon-wrapper {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    background: linear-gradient(135deg, var(--card-color-1), var(--card-color-2));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    color: white;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;

    .stat-card:hover & {
      transform: rotate(-10deg) scale(1.1);
    }
  }

  .stat-trend {
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 4px;

    &.up {
      background: rgba(67, 206, 126, 0.15);
      color: #43ce7e;
    }

    &.down {
      background: rgba(255, 107, 107, 0.15);
      color: #ff6b6b;
    }
  }

  .stat-body {
    .stat-value {
      font-size: 36px;
      font-weight: 800;
      color: #1a1a2e;
      margin-bottom: 8px;
      line-height: 1;
    }

    .stat-label {
      font-size: 15px;
      color: #666;
      font-weight: 500;
    }
  }

  &.stat-blue {
    --card-color-1: #667eea;
    --card-color-2: #764ba2;
    animation-delay: 0.1s;
  }

  &.stat-green {
    --card-color-1: #43ce7e;
    --card-color-2: #38b2ac;
    animation-delay: 0.2s;
  }

  &.stat-orange {
    --card-color-1: #f093fb;
    --card-color-2: #f5576c;
    animation-delay: 0.3s;
  }

  &.stat-purple {
    --card-color-1: #4facfe;
    --card-color-2: #00f2fe;
    animation-delay: 0.4s;
  }
}

// Glass Card
.glass-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  animation: fadeInUp 0.6s ease-out both;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 2px solid rgba(102, 126, 234, 0.1);
  }

  .card-title-group {
    display: flex;
    align-items: center;
    gap: 12px;

    .title-icon {
      font-size: 24px;
      color: #667eea;
    }

    .card-title {
      font-size: 20px;
      font-weight: 700;
      color: #1a1a2e;
      margin: 0;
    }
  }
}

// Chart Card
.chart-card {
  animation-delay: 0.2s;
}

.period-selector {
  ::v-deep .el-radio-button__inner {
    border-radius: 8px;
    border: none;
    background: transparent;
    box-shadow: none;
    padding: 8px 16px;
    transition: all 0.3s ease;
  }

  ::v-deep .el-radio-button__orig-radio:checked + .el-radio-button__inner {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
}

.chart-wrapper {
  position: relative;
  height: 320px;
  margin-top: 20px;
}

.chart-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .grid-line {
    height: 1px;
    background: rgba(102, 126, 234, 0.1);
  }
}

.chart-bars {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100%;
  display: flex;
  align-items: flex-end;
  gap: 16px;
  padding-bottom: 40px;
}

.chart-bar {
  flex: 1;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scaleY(1.05);

    .bar-tooltip {
      opacity: 1;
      transform: translateY(-10px);
    }
  }

  .bar-fill {
    height: 100%;
    background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px 12px 0 0;
    position: relative;
    overflow: hidden;
    animation: growBar 1s ease-out both;
    box-shadow: 0 -5px 20px rgba(102, 126, 234, 0.3);

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 30%;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.3), transparent);
    }
  }

  .bar-tooltip {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: #1a1a2e;
    color: white;
    padding: 12px 16px;
    border-radius: 12px;
    white-space: nowrap;
    opacity: 0;
    transition: all 0.3s ease;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    z-index: 10;

    &::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 6px solid transparent;
      border-top-color: #1a1a2e;
    }

    .tooltip-value {
      display: block;
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .tooltip-label {
      display: block;
      font-size: 12px;
      opacity: 0.8;
    }
  }
}

// Activity Card
.activity-card {
  animation-delay: 0.3s;

  .activity-badge {
    ::v-deep .el-badge__content {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
    }
  }
}

.activity-timeline {
  position: relative;
}

.activity-item {
  position: relative;
  padding-left: 60px;
  padding-bottom: 24px;
  animation: slideInLeft 0.5s ease-out both;

  &:last-child {
    padding-bottom: 0;
  }

  .activity-dot {
    position: absolute;
    left: 18px;
    top: 18px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: white;
    border: 3px solid;
    z-index: 2;

    &.dot-success { border-color: #43ce7e; }
    &.dot-warning { border-color: #f5576c; }
    &.dot-star { border-color: #ffd700; }
    &.dot-info { border-color: #4facfe; }
    &.dot-primary { border-color: #667eea; }
  }

  .activity-line {
    position: absolute;
    left: 23px;
    top: 30px;
    bottom: 0;
    width: 2px;
    background: linear-gradient(180deg, rgba(102, 126, 234, 0.3), transparent);
  }

  .activity-content {
    display: flex;
    gap: 16px;
    background: rgba(102, 126, 234, 0.05);
    padding: 16px;
    border-radius: 12px;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(102, 126, 234, 0.1);
      transform: translateX(8px);
    }
  }

  .activity-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: white;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

    &.icon-success { background: linear-gradient(135deg, #43ce7e, #38b2ac); }
    &.icon-warning { background: linear-gradient(135deg, #f5576c, #f093fb); }
    &.icon-star { background: linear-gradient(135deg, #ffd700, #ffed4e); }
    &.icon-info { background: linear-gradient(135deg, #4facfe, #00f2fe); }
    &.icon-primary { background: linear-gradient(135deg, #667eea, #764ba2); }
  }

  .activity-info {
    flex: 1;
  }

  .activity-title {
    font-size: 15px;
    font-weight: 600;
    color: #1a1a2e;
    margin-bottom: 6px;
  }

  .activity-time {
    font-size: 13px;
    color: #999;
    display: flex;
    align-items: center;
    gap: 6px;

    i {
      font-size: 14px;
    }
  }
}

// Actions Card
.actions-card {
  animation-delay: 0.4s;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
}

.action-item {
  position: relative;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 16px;
  padding: 24px 16px;
  text-align: center;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 2px solid transparent;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, var(--action-color-1), var(--action-color-2));
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 0;
  }

  .action-icon,
  .action-label {
    position: relative;
    z-index: 1;
    transition: all 0.3s ease;
  }

  .action-icon {
    width: 56px;
    height: 56px;
    margin: 0 auto 12px;
    border-radius: 14px;
    background: linear-gradient(135deg, var(--action-color-1), var(--action-color-2));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: white;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }

  .action-label {
    font-size: 14px;
    font-weight: 600;
    color: #1a1a2e;
  }

  .action-hover-effect {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.4), transparent);
    transform: translate(-50%, -50%);
    transition: all 0.5s ease;
  }

  &:hover {
    transform: translateY(-8px) scale(1.05);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
    border-color: var(--action-color-1);

    &::before {
      opacity: 1;
    }

    .action-icon {
      transform: scale(1.1) rotate(-10deg);
      background: white;
      color: var(--action-color-1);
    }

    .action-label {
      color: white;
    }

    .action-hover-effect {
      width: 200px;
      height: 200px;
    }
  }

  &.action-blue {
    --action-color-1: #667eea;
    --action-color-2: #764ba2;
  }

  &.action-green {
    --action-color-1: #43ce7e;
    --action-color-2: #38b2ac;
  }

  &.action-orange {
    --action-color-1: #f5576c;
    --action-color-2: #f093fb;
  }

  &.action-purple {
    --action-color-1: #4facfe;
    --action-color-2: #00f2fe;
  }

  &.action-pink {
    --action-color-1: #fa709a;
    --action-color-2: #fee140;
  }

  &.action-teal {
    --action-color-1: #30cfd0;
    --action-color-2: #330867;
  }
}

// Progress Card
.progress-card {
  animation-delay: 0.5s;
}

.progress-list {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.progress-item {
  animation: slideInRight 0.5s ease-out both;

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .progress-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .progress-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .progress-name {
    font-size: 15px;
    font-weight: 600;
    color: #1a1a2e;
  }

  .progress-value {
    font-size: 20px;
    font-weight: 800;
    color: #667eea;
  }

  .progress-bar-wrapper {
    position: relative;
  }

  .progress-bar-bg {
    height: 12px;
    background: rgba(102, 126, 234, 0.1);
    border-radius: 20px;
    overflow: hidden;
    position: relative;
  }

  .progress-bar-fill {
    height: 100%;
    border-radius: 20px;
    position: relative;
    animation: progressFill 1.5s ease-out both;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      animation: shimmer 2s infinite;
    }
  }
}

// Animations
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes expandWidth {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes growBar {
  from {
    transform: scaleY(0);
    transform-origin: bottom;
  }
  to {
    transform: scaleY(1);
    transform-origin: bottom;
  }
}

@keyframes progressFill {
  from {
    width: 0;
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

// Responsive Design
@media (max-width: 1200px) {
  .hero-title {
    font-size: 40px !important;
  }

  .stat-card {
    .stat-value {
      font-size: 30px;
    }
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 16px;
  }

  .hero-welcome {
    padding: 32px 24px;

    .hero-content {
      flex-direction: column;
      align-items: flex-start;
    }

    .hero-title {
      font-size: 32px !important;
    }

    .hero-time-card {
      width: 100%;
      justify-content: center;
    }
  }

  .stat-card {
    padding: 20px;

    .stat-icon-wrapper {
      width: 52px;
      height: 52px;
      font-size: 24px;
    }

    .stat-value {
      font-size: 28px;
    }
  }

  .chart-wrapper {
    height: 240px;
  }

  .quick-actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .glass-card {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 28px !important;
  }

  .hero-subtitle {
    font-size: 14px !important;
  }

  .stat-card {
    .stat-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 12px;
  }

  .period-selector {
    width: 100%;

    ::v-deep .el-radio-button {
      flex: 1;
    }
  }
}

::v-deep .el-row {
  margin-left: 0 !important;
  margin-right: 0 !important;
}

::v-deep .el-col {
  padding-left: 12px !important;
  padding-right: 12px !important;
}
</style>
