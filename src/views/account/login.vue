<!-- home.vue -->
<template>
  <div class="home-page">
    <!-- Header Section -->
    <header class="main-header">
      <div class="header-container">
        <div class="header-logo">
          <div class="logo-text">
            <span class="company-name-header">WISMILAK</span>
            <span class="company-subtitle">Knowledge Base</span>
          </div>
        </div>

        <!-- Navigation -->
        <!-- <nav class="header-nav">
          <div class="nav-links">
            <router-link to="/" class="nav-link">Home</router-link>
            <router-link to="/articlesList" class="nav-link">Artikel</router-link>
            <a href="#categories" class="nav-link" @click.prevent="scrollToCategories">Kategori</a>
          </div>
        </nav> -->

        <!-- Search Bar -->
        <!-- <div class="header-search">
          <div class="search-input-container">
            <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
            <input
              type="text"
              placeholder="Cari artikel, SOP, panduan..."
              class="search-input"
              v-model="searchQuery"
              @keyup.enter="handleSearch"
            />
          </div>
        </div> -->

        <!-- Login/User Section -->
        <div class="header-actions">
          <div v-if="isAuthenticated" class="user-menu">
            <el-dropdown trigger="click" @command="handleCommand">
              <div class="el-dropdown-link user-info">
                <img
                  :src="user.avatar_url || '/default-avatar.png'"
                  :alt="user.name"
                  class="user-avatar"
                />
                <span class="user-name">{{ user.name }}</span>
                <el-icon class="el-icon--right">
                  <arrow-down />
                </el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <router-link to="/profile">
                    <el-dropdown-item>
                      <el-icon class="mr-1"><i-ep-User /></el-icon>
                      My Profile
                    </el-dropdown-item>
                  </router-link>
                  <el-dropdown-item command="profile">
                    <router-link to="/admin/dashboard">
                      🏛️ Admin Dashboard
                    </router-link>
                  </el-dropdown-item>
                  <el-dropdown-item @click.native="onLogout" divided>🚪 Logout</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>

          <button v-else @click="openLoginModal" class="login-button">
            Login
          </button>
        </div>
      </div>
    </header>

    <!-- Login Modal -->
    <div v-if="showLoginModal" class="modal-overlay" @click="closeLoginModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Login ke WISMILAK Knowledge Base</h3>
          <button @click="closeLoginModal" class="modal-close">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="handleLogin" class="login-form">
            <el-form
              :model="loginForm"
              :rules="loginRules"
              autocomplete="on"
              class="login-form"
              label-position="left"
              ref="formDom"
            >
              <label for="email" class="form-label">Email</label>
              <el-form-item prop="email">
                <el-input
                  size="large"
                  autocomplete="on"
                  name="email"
                  placeholder="Username"
                  ref="email"
                  tabindex="1"
                  type="text"
                  v-model="loginForm.email"
                >
                  <template #prefix>
                    <svg-icon icon="user" />
                  </template>
                </el-input>
              </el-form-item>

              <label for="password" class="form-label">Password</label>
              <el-form-item prop="password">
                <el-input
                  size="large"
                  :type="passwordType"
                  @keyup.enter="handleLogin"
                  autocomplete="on"
                  name="password"
                  placeholder="Password"
                  ref="passwordDom"
                  tabindex="2"
                  v-model="loginForm.password"
                >
                  <template #prefix>
                    <svg-icon icon="password" />
                  </template>
                  <template #suffix>
                    <span @click="showPwd">
                      <svg-icon :icon="passwordType === 'password' ? 'eye' : 'eye-open'" />
                    </span>
                  </template>
                </el-input>
              </el-form-item>
            </el-form>
            <div class="form-group">
              <label class="checkbox-container">
                <input type="checkbox" v-model="loginForm.remember" />
                <span class="checkmark"></span>
                Ingat saya
              </label>
            </div>

            <button type="submit" class="submit-button" :disabled="loginLoading">
              <span v-if="loginLoading" class="loading-spinner"></span>
              {{ loginLoading ? 'Memproses...' : 'Login' }}
            </button>
          </form>

          <div class="modal-footer">
            <p class="footer-text">
              Belum punya akun?
              <a href="#" @click.prevent="showRegisterForm" class="footer-link">Daftar di sini</a>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Hero Section - UPDATED -->
    <section class="hero-section">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <div class="portal-badge">Portal Pengetahuan Internal</div>

        <!-- Logo and Tree -->
        <div class="logo-container">
          <div class="tree-illustration">
            <img src="@/assets/images/logo_kb.png" alt="Wismilak Logo" class="logo-img" />
          </div>
        </div>

        <!--  GANTI 3 CARDS DENGAN HERO SEARCH BAR -->
        <div class="hero-search-container">
          <div class="hero-search-wrapper">
            <svg class="hero-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
            <input
              type="text"
              placeholder="Cari artikel, SOP, panduan, atau kebijakan..."
              class="hero-search-input"
              v-model="searchQuery"
              @keyup.enter="handleSearch"
            />
            <button @click="handleSearch" class="hero-search-button">
              <svg class="search-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </button>
          </div>
          <p class="hero-search-hint">💡 Coba cari: "SOP Keuangan" atau "Panduan SAP"</p>
        </div>

        <!-- Quick Access Buttons -->
        <div class="quick-access">
          <router-link to="/articlesList" class="quick-btn">
            <span class="quick-btn-icon">📖</span>
            Semua Artikel
          </router-link>
          <a href="#categories" @click.prevent="scrollToCategories" class="quick-btn">
            <span class="quick-btn-icon">📁</span>
            Kategori
          </a>
          <router-link to="/articlesList?sort=popular" class="quick-btn">
            <span class="quick-btn-icon">🔥</span>
            Populer
          </router-link>
        </div>
      </div>
    </section>

    <section class="articles-section" id="articles">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">Artikel Pengetahuan</h2>
          <div class="section-nav">
            <a
              href="#"
              class="nav-link"
              :class="{ active: activeTab === 'popular' }"
              @click.prevent="loadPopularArticles"
            >
              🔥 Popular
            </a>
            <a
              href="#"
              class="nav-link"
              :class="{ active: activeTab === 'latest' }"
              @click.prevent="loadLatestArticles"
            >
              📖 Terbaru
            </a>
            <a
              href="#"
              class="nav-link"
              :class="{ active: activeTab === 'rating' }"
              @click.prevent="loadTopRatedArticles"
            >
              ⭐ Rating Tertinggi
            </a>
          </div>
        </div>

        <div v-if="articlesLoading" class="loading-container">
          <div class="spinner"></div>
        </div>

        <div v-else class="articles-grid">
          <div v-for="article in featuredArticles" :key="article.id" class="article-card">
            <!-- Article Type Badge -->
            <div class="article-header">
              <span :class="getArticleTypeClass(article.type)" class="article-badge">
                {{ article.type }}
              </span>
              <div class="article-views">👁️ {{ formatNumber(article.view_count) }}</div>
            </div>

            <h3 class="article-title">{{ article.title }}</h3>
            <p class="article-description">{{ article.description }}</p>

            <!-- Author & Rating -->
            <div class="article-footer">
              <div class="article-author">
                <img
                  :src="article.user?.avatar_url || '/default-avatar.png'"
                  :alt="article.user?.name || 'Unknown'"
                  class="author-avatar"
                />
                <span class="author-name">{{ article.user?.name || 'Unknown' }}</span>
              </div>

              <div class="article-rating">
                <span class="rating-star">⭐</span>
                <span class="rating-text">
                  {{ formatRating(article.rating) }} ({{ article.rating_count || 0 }})
                </span>
              </div>
            </div>

            <!-- Read More Button -->
            <div class="article-actions">
              <router-link
                :to="{ name: 'ArticleDetail', params: { slug: article.slug } }"
                class="read-more-btn"
              >
                Baca Selengkapnya
                <svg class="read-more-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  ></path>
                </svg>
              </router-link>
            </div>
          </div>
        </div>

        <!-- Lihat Semua Articles Button -->
        <!-- <div class="view-all-container">
          <router-link to="/articlesList" class="view-all-button">
            Lihat Semua Artikel
            <svg class="view-all-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              ></path>
            </svg>
          </router-link>
        </div> -->
      </div>
    </section>

    <!-- Categories Section with Slider -->
    <section class="categories-section" id="categories">
      <div class="section-container">
        <div class="section-header-center">
          <h2 class="section-title">Kategori</h2>
        </div>

        <div v-if="categoriesLoading" class="loading-container">
          <div class="spinner"></div>
        </div>

        <div v-else class="categories-slider-container">
          <button
            @click="scrollCategories('left')"
            class="slider-nav-button slider-nav-left"
            :disabled="isAtStart"
            v-if="categories.length > 6"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div class="categories-slider-wrapper">
            <div class="categories-slider" ref="categoriesSlider" @scroll="updateSliderButtons">
              <router-link
                v-for="category in categories"
                :key="category.id"
                :to="{ name: 'PublicArticleList', query: { category: category.slug } }"
                class="category-card"
              >
                <div class="category-icon">{{ getCategoryIcon(category.name) }}</div>
                <h3 class="category-name">{{ category.name }}</h3>
                <p class="category-count">{{ formatNumber(category.articles_count) }} artikel</p>
              </router-link>
            </div>
          </div>

          <button
            @click="scrollCategories('right')"
            class="slider-nav-button slider-nav-right"
            :disabled="isAtEnd"
            v-if="categories.length > 6"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { reactive, ref, nextTick, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { validUsername } from '@/utils/validate'
import { login, logout } from '@/api/user'
import { getArticles, getCategories } from '@/api/article'
import { dispatch, ctx } from '@/store'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

// Auth State
const loading = ref(false)
const passwordType = ref('password')
const showLoginModal = ref(false)
const loginLoading = ref(false)

const redirect = route.fullPath || '/'

// User State
const isAuthenticated = computed(() => !!dispatch.user.getToken())
const user = computed(() => ctx.userInfo || {})

// Search State
const searchQuery = ref('')

// Articles State
const featuredArticles = ref([])
const articlesLoading = ref(false)
const activeTab = ref('popular')

// Categories State
const categories = ref([])
const categoriesLoading = ref(false)
const categoriesSlider = ref(null)
const isAtStart = ref(true)
const isAtEnd = ref(false)

// Login Form
const loginForm = reactive({
  email: 'budi@example.com',
  password: 'password123',
  remember: false
})

// Validation Rules
const validateEmail = (rule, value, callback) => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!pattern.test(value)) {
    callback(new Error('Please enter a valid email address'))
  } else {
    callback()
  }
}

const validatePassword = (rule, value, callback) => {
  if (value.length < 6) {
    callback(new Error('The password can not be less than 6 digits'))
  } else {
    callback()
  }
}

const loginRules = reactive({
  email: [{ required: true, trigger: 'blur', validator: validateEmail }],
  password: [{ required: true, trigger: 'blur', validator: validatePassword }],
})

const passwordDom = ref(null)
const formDom = ref()

// Auth Methods
const showPwd = async () => {
  if (passwordType.value === 'password') {
    passwordType.value = ''
  } else {
    passwordType.value = 'password'
  }
  await nextTick()
  passwordDom.value.focus()
}

const openLoginModal = () => {
  showLoginModal.value = true
}

const closeLoginModal = () => {
  showLoginModal.value = false
}

const handleLogin = () => {
  formDom.value.validate((valid) => {
    if (valid) {
      loginLoading.value = true
      login(loginForm)
        .then((res) => {
          console.log(' Login Response:', res.data)

          const responseData = res.data?.data || res.data
          const token = responseData.token
          const userData = responseData.user

          if (token) {
            localStorage.setItem('token', token)
            dispatch.user.setToken(token)
            console.log(' Token saved')
          }

          if (userData) {
            if (!userData.role) {
              userData.role = 'user'
            }

            localStorage.setItem('user', JSON.stringify(userData))
            console.log('💾 User saved:', userData)
          }

          const verifyToken = localStorage.getItem('token')
          const verifyUser = localStorage.getItem('user')
          console.log('Verify - Token:', verifyToken ? 'exists' : 'not found')
          console.log('Verify - User:', verifyUser)

          showLoginModal.value = false
          loginLoading.value = false

          ElMessage.success('Login berhasil!')

          const userRole = userData?.role
          const redirect = route.query.redirect

          setTimeout(() => {
            if (redirect && redirect !== '/') {
              window.location.href = redirect
            } else if (userRole === 'admin') {
              window.location.href = '/admin/dashboard'
            } else if (userRole === 'editor') {
              window.location.href = '/admin/articles/list'
            } else {
              window.location.reload()
            }
          }, 200)
        })
        .catch((error) => {
          console.error('❌ Login error:', error)
          loginLoading.value = false
          ElMessage.error(error.response?.data?.message || 'Login gagal')
        })
    } else {
      console.log('error submit!!')
      return false
    }
  })
}

const handleLogout = () => {
  dispatch.user.removeToken()
  router.push('/account/login')
}

const showRegisterForm = () => {
  alert('Fitur registrasi akan segera hadir!')
}

// Navigation Methods
const scrollToCategories = () => {
  const element = document.getElementById('categories')
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      name: 'PublicArticleList',
      query: { search: searchQuery.value.trim() }
    })
  }
}

// Categories Slider Methods
const scrollCategories = (direction) => {
  const slider = categoriesSlider.value
  if (!slider) return

  const cardWidth = 220
  const scrollAmount = cardWidth * 3

  const newScrollLeft = direction === 'left'
    ? slider.scrollLeft - scrollAmount
    : slider.scrollLeft + scrollAmount

  slider.scrollTo({
    left: newScrollLeft,
    behavior: 'smooth'
  })

  setTimeout(() => {
    updateSliderButtons()
  }, 300)
}

const updateSliderButtons = () => {
  const slider = categoriesSlider.value
  if (!slider) return

  isAtStart.value = slider.scrollLeft <= 10
  isAtEnd.value = slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 10
}

// Articles Methods
const loadPopularArticles = async () => {
  activeTab.value = 'popular'
  articlesLoading.value = true

  try {
    const response = await getArticles({
      sort: 'popular',
      limit: 6
    })

    featuredArticles.value = response.data?.data || response.data || []
    articlesLoading.value = false
  } catch (error) {
    console.error('Error loading popular articles:', error)
    ElMessage.error('Gagal memuat artikel popular')
    articlesLoading.value = false
  }
}

const loadLatestArticles = async () => {
  activeTab.value = 'latest'
  articlesLoading.value = true

  try {
    const response = await getArticles({
      sort: 'latest',
      limit: 6
    })

    featuredArticles.value = response.data?.data || response.data || []
    articlesLoading.value = false
  } catch (error) {
    console.error('Error loading latest articles:', error)
    ElMessage.error('Gagal memuat artikel terbaru')
    articlesLoading.value = false
  }
}

const loadTopRatedArticles = async () => {
  activeTab.value = 'rating'
  articlesLoading.value = true

  try {
    const response = await getArticles({
      sort: 'rating',
      limit: 6
    })

    featuredArticles.value = response.data?.data || response.data || []
    articlesLoading.value = false
  } catch (error) {
    console.error('Error loading top rated articles:', error)
    ElMessage.error('Gagal memuat artikel rating tertinggi')
    articlesLoading.value = false
  }
}

// Categories Methods
const loadCategories = async () => {
  categoriesLoading.value = true

  try {
    const response = await getCategories()
    console.info(response)
    categories.value = response.data || response || []
    categoriesLoading.value = false

    nextTick(() => {
      updateSliderButtons()
    })
  } catch (error) {
    console.error('Error loading categories:', error)
    ElMessage.error('Gagal memuat kategori')
    categoriesLoading.value = false
  }
}

const formatRating = (rating) => {
  if (rating === null || rating === undefined || rating === '') {
    return '0.0';
  }

  const numRating = typeof rating === 'number' ? rating : parseFloat(rating);

  if (isNaN(numRating)) {
    return '0.0';
  }

  return numRating.toFixed(1);
}

const formatNumber = (num) => {
  const number = parseInt(num) || 0;
  if (number >= 1000) {
    return (number / 1000).toFixed(1) + 'k';
  }
  return number.toString();
}

const getArticleTypeClass = (type) => {
  const typeMap = {
    'SOP': 'badge-red',
    'Panduan': 'badge-green',
    'Tutorial': 'badge-blue',
    'Kebijakan': 'badge-purple',
    'Artikel': 'badge-gray'
  }
  return typeMap[type] || 'badge-gray'
}

const getCategoryIcon = (name) => {
  const iconMap = {
    'SOP': '📋',
    'Panduan': '📖',
    'Tutorial': '🎓',
    'Kebijakan': '⚖️',
    'FAQ': '❓',
    'Best Practices': '⭐',
    'Technical Support': '⚙️',
    'HR': '👥',
    'IT Development': '💻',
    'SDM & Kepegawaian': '👥',
    'Keuangan & Akuntansi': '💰',
    'Marketing': '📢',
    'Operasional': '🏭',
    'Produksi': '🏭',
    'Quality Control': '',
    'Research & Development': '🔬',
    'Legal': '⚖️',
    'Customer Service': '🤝',
    'SAP' : '🧩'
  }
  return iconMap[name] || '📄'
}

// Lifecycle Hooks
onMounted(() => {
  loadPopularArticles()
  loadCategories()

  const slider = categoriesSlider.value
  if (slider) {
    slider.addEventListener('scroll', updateSliderButtons)
  }
})

const onLogout = async () => {
  logout().then(() => {
    dispatch.user.removeInfo()
    router.push(`/account/login?redirect=${redirect}`)
  })
}
</script>

<style lang="scss">
$bg: #283443;
$light_gray: #fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

.login-container {
  .el-input {
    .el-input__wrapper {
      background: transparent;
      box-shadow: none;
    }
    input {
      -webkit-appearance: none;
      color: $light_gray;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px transparent inset !important;
        -webkit-text-fill-color: $cursor !important;
        transition: background-color 50000s ease-in-out 0s;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
  }
}
</style>

<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }
}
</style>

<style scoped>
.home-page {
  min-height: 100vh;
}

/* Header Styles */
.main-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.header-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.company-name-header {
  font-size: 1.25rem;
  font-weight: 800;
  color: #16a34a;
  letter-spacing: 0.05em;
  line-height: 1;
}

.company-subtitle {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.header-nav {
  display: flex;
  align-items: center;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-link {
  color: #374151;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
  transition: color 0.2s ease;
  cursor: pointer;
}

.nav-link:hover {
  color: #16a34a;
}

.nav-link.router-link-active {
  color: #16a34a;
  font-weight: 600;
}

.header-search {
  flex: 1;
  max-width: 400px;
}

.search-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  width: 1.25rem;
  height: 1.25rem;
  color: #6b7280;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  outline: none;
  transition: all 0.2s ease;
}

.search-input:focus {
  border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.login-button {
  padding: 0.5rem 1.5rem;
  background: #16a34a;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.login-button:hover {
  background: #15803d;
  transform: translateY(-1px);
}

/* User Menu Styles */
.user-menu {
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.user-info:hover {
  background: #f3f4f6;
}

.user-menu:hover .user-dropdown {
  display: block;
}

.user-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.user-dropdown {
  display: none;
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  min-width: 180px;
  z-index: 1000;
  margin-top: 0.5rem;
}

.dropdown-item {
  display: block;
  padding: 0.75rem 1rem;
  color: #374151;
  text-decoration: none;
  font-size: 0.875rem;
  transition: background 0.2s ease;
  cursor: pointer;
}

.dropdown-item:hover {
  background: #f3f4f6;
}

.dropdown-item:first-child {
  border-radius: 0.5rem 0.5rem 0 0;
}

.dropdown-item:last-child {
  border-radius: 0 0 0.5rem 0.5rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 1rem;
  width: 100%;
  max-width: 400px;
  margin: 1rem;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: #6b7280;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
}

.modal-close:hover {
  color: #374151;
  background: #f9fafb;
}

.modal-close svg {
  width: 1.25rem;
  height: 1.25rem;
}

.modal-body {
  padding: 1.5rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  outline: none;
  transition: all 0.2s ease;
}

.form-input:focus {
  border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  cursor: pointer;
}

.checkbox-container input[type='checkbox'] {
  margin: 0;
}

.submit-button {
  padding: 0.75rem;
  background: #16a34a;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.submit-button:hover:not(:disabled) {
  background: #15803d;
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.modal-footer {
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
  text-align: center;
}

.footer-text {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.footer-link {
  color: #16a34a;
  text-decoration: none;
  font-weight: 500;
}

.footer-link:hover {
  text-decoration: underline;
}

/*  Hero Section - UPDATED */
.hero-section {
  position: relative;
  background: linear-gradient(135deg, #16a34a 0%, #15803d 50%, #166534 100%);
  color: white;
  padding: 3rem 1rem 3rem;
  min-height: 45vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-top: 60px;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.hero-content {
  text-align: center;
  max-width: 900px;
  width: 100%;
  z-index: 1;
  position: relative;
}

.portal-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-container {
  margin-bottom: 2rem;
}

.tree-illustration {
  margin-bottom: 1rem;
}

.logo-img {
  max-width: 300px;
  height: auto;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

/*  NEW: Hero Search Bar Styles */
.hero-search-container {
  max-width: 700px;
  margin: 0 auto 2rem;
  padding: 0 1rem;
}

.hero-search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: white;
  border-radius: 9999px;
  padding: 0.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.hero-search-wrapper:focus-within {
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.3);
  transform: translateY(-2px);
}

.hero-search-icon {
  position: absolute;
  left: 1.5rem;
  width: 1.5rem;
  height: 1.5rem;
  color: #6b7280;
  pointer-events: none;
}

.hero-search-input {
  flex: 1;
  padding: 1rem 1rem 1rem 3.5rem;
  border: none;
  outline: none;
  font-size: 1rem;
  background: transparent;
  color: #1f2937;
}

.hero-search-input::placeholder {
  color: #9ca3af;
}

.hero-search-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 1.5rem;
  background: #16a34a;
  color: white;
  border: none;
  border-radius: 9999px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 60px;
}

.hero-search-button:hover {
  background: #15803d;
  transform: scale(1.05);
}

.search-btn-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.hero-search-hint {
  text-align: center;
  margin-top: 1rem;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

/*  NEW: Quick Access Buttons */
.quick-access {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 1.5rem;
}

.quick-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  text-decoration: none;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 0.875rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.quick-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.quick-btn-icon {
  font-size: 1.125rem;
}

/* Articles Section */
.articles-section {
  padding: 4rem 1rem;
  background: white;
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
}

.section-nav {
  display: flex;
  gap: 1rem;
}

.section-nav .nav-link {
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  color: #6b7280;
  text-decoration: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  cursor: pointer;
}

.section-nav .nav-link.active,
.section-nav .nav-link:hover {
  background: #16a34a;
  color: white;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.article-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #f3f4f6;
  transition: all 0.3s ease;
}

.article-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.article-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-red {
  background: #fee2e2;
  color: #dc2626;
}
.badge-green {
  background: #dcfce7;
  color: #16a34a;
}
.badge-purple {
  background: #f3e8ff;
  color: #9333ea;
}
.badge-blue {
  background: #dbeafe;
  color: #2563eb;
}
.badge-gray {
  background: #f3f4f6;
  color: #6b7280;
}

.article-views {
  font-size: 0.875rem;
  color: #6b7280;
}

.article-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.75rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-description {
  color: #6b7280;
  margin-bottom: 1rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.article-author {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.author-avatar {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  object-fit: cover;
}

.article-rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.rating-star {
  font-size: 1rem;
}

.article-actions {
  margin-top: 1rem;
}

.read-more-btn {
  display: inline-flex;
  align-items: center;
  color: #16a34a;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s ease;
}

.read-more-btn:hover {
  color: #15803d;
}

.read-more-arrow {
  width: 1rem;
  height: 1rem;
  margin-left: 0.25rem;
}

.view-all-container {
  text-align: center;
  margin-top: 3rem;
}

.view-all-button {
  display: inline-flex;
  align-items: center;
  padding: 1rem 2rem;
  background: #16a34a;
  color: white;
  text-decoration: none;
  border-radius: 0.75rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
}

.view-all-button:hover {
  background: #15803d;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(22, 163, 74, 0.4);
}

.view-all-arrow {
  width: 1.25rem;
  height: 1.25rem;
  margin-left: 0.5rem;
}

/* Categories Section */
.categories-section {
  padding: 4rem 1rem;
  background: #f9fafb;
}

.section-header-center {
  text-align: center;
  margin-bottom: 3rem;
}

/* Categories Slider Container */
.categories-slider-container {
  position: relative;
  max-width: 1320px;
  margin: 0 auto;
}

.categories-slider-wrapper {
  overflow: hidden;
  padding: 0 3rem;
}

.categories-slider {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  scroll-behavior: smooth;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 1rem 0;
}

.categories-slider::-webkit-scrollbar {
  display: none;
}

/* Slider Navigation Buttons */
.slider-nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.slider-nav-button:hover:not(:disabled) {
  background: #16a34a;
  border-color: #16a34a;
  color: white;
  box-shadow: 0 6px 12px rgba(22, 163, 74, 0.3);
}

.slider-nav-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.slider-nav-button svg {
  width: 1.25rem;
  height: 1.25rem;
}

.slider-nav-left {
  left: 0;
}

.slider-nav-right {
  right: 0;
}

.category-card {
  flex: 0 0 200px;
  min-width: 200px;
  background: white;
  border-radius: 1rem;
  padding: 2rem 1rem;
  text-align: center;
  text-decoration: none;
  color: #374151;
  transition: all 0.3s ease;
  border: 1px solid #f3f4f6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.category-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  color: #16a34a;
}

.category-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.category-name {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  transition: color 0.2s ease;
}

.category-count {
  font-size: 0.875rem;
  color: #16a34a;
  font-weight: 500;
}

/* Loading Spinner */
.loading-container {
  display: flex;
  justify-content: center;
  padding: 3rem;
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #16a34a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .header-container {
    gap: 1rem;
  }

  .header-search {
    max-width: 300px;
  }
}

@media (max-width: 768px) {
  .header-container {
    flex-wrap: wrap;
    padding: 0.75rem 1rem;
  }

  .header-nav {
    order: 3;
    width: 100%;
  }

  .nav-links {
    justify-content: center;
    width: 100%;
  }

  .header-search {
    order: 2;
    max-width: none;
    flex: 1;
    min-width: 200px;
  }

  .header-actions {
    order: 1;
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
  }

  .section-nav {
    justify-content: center;
  }

  .articles-grid {
    grid-template-columns: 1fr;
  }

  .hero-section {
    padding: 5rem 1rem 3rem;
    min-height: 50vh;
  }

  .logo-img {
    max-width: 250px;
  }

  .hero-search-container {
    padding: 0 0.5rem;
  }

  .hero-search-input {
    font-size: 0.875rem;
    padding: 0.875rem 0.875rem 0.875rem 3rem;
  }

  .hero-search-button {
    padding: 0.875rem 1.25rem;
  }

  .quick-access {
    gap: 0.75rem;
  }

  .quick-btn {
    padding: 0.75rem 1.25rem;
    font-size: 0.8125rem;
  }

  .categories-slider-wrapper {
    padding: 0 2.5rem;
  }

  .category-card {
    flex: 0 0 180px;
    min-width: 180px;
  }

  .slider-nav-button {
    width: 2rem;
    height: 2rem;
  }

  .slider-nav-button svg {
    width: 1rem;
    height: 1rem;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 4rem 0.5rem 2.5rem;
    min-height: 45vh;
  }

  .logo-img {
    max-width: 200px;
  }

  .portal-badge {
    font-size: 0.75rem;
    padding: 0.375rem 0.875rem;
  }

  .hero-search-container {
    padding: 0;
  }

  .hero-search-wrapper {
    padding: 0.375rem;
  }

  .hero-search-icon {
    left: 1rem;
    width: 1.25rem;
    height: 1.25rem;
  }

  .hero-search-input {
    font-size: 0.8125rem;
    padding: 0.75rem 0.75rem 0.75rem 2.75rem;
  }

  .hero-search-button {
    padding: 0.75rem 1rem;
    min-width: 50px;
  }

  .search-btn-icon {
    width: 1rem;
    height: 1rem;
  }

  .hero-search-hint {
    font-size: 0.75rem;
    margin-top: 0.75rem;
  }

  .quick-access {
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .quick-btn {
    padding: 0.625rem 1rem;
    font-size: 0.75rem;
  }

  .quick-btn-icon {
    font-size: 1rem;
  }

  .header-container {
    flex-direction: column;
    gap: 0.75rem;
  }

  .header-logo {
    align-self: flex-start;
  }

  .header-search {
    order: 2;
    width: 100%;
  }

  .header-actions {
    order: 3;
    align-self: flex-end;
  }

  .nav-links {
    gap: 1rem;
  }

  .modal-content {
    margin: 0.5rem;
  }

  .categories-slider-wrapper {
    padding: 0 2rem;
  }

  .category-card {
    flex: 0 0 150px;
    min-width: 150px;
    padding: 1.5rem 0.75rem;
  }

  .category-icon {
    font-size: 2.5rem;
  }

  .category-name {
    font-size: 0.875rem;
  }

  .category-count {
    font-size: 0.75rem;
  }

  .slider-nav-button {
    width: 1.75rem;
    height: 1.75rem;
  }

  .slider-nav-button svg {
    width: 0.875rem;
    height: 0.875rem;
  }
}
</style>
