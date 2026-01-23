<!-- home.vue -->
<template>
  <div class="home-page">
    <!-- Header Section -->
    <PublicHeader />

    <!-- Login Modal Component -->
    <Login v-model="showLoginModal" />

    <!-- Hero Section -->
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

        <!-- Hero Search Bar -->
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

    <!-- Articles Section -->
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
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getArticles, getCategories } from '@/api/article'
import { logout } from '@/api/user'
import { dispatch, ctx } from '@/store'
import { ElMessage } from 'element-plus'
import PublicHeader from '@/views/public/components/PublicHeader.vue'

const router = useRouter()
const route = useRoute()

// Auth State
const showLoginModal = ref(false)
const redirect = route.fullPath || '/'

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

// Helper Functions
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
</script>

<style scoped>
/* ===========================
   GLOBAL & RESET
   =========================== */
.home-page {
  min-height: 100vh;
  background: #ffffff;
}

/* ===========================
   HERO SECTION
   =========================== */
.hero-section {
  position: relative;
  background: linear-gradient(135deg, #15803d 0%, #16a34a 50%, #15803d 100%);
  color: white;
  padding: 5rem 1rem 3rem;
  min-height: 50vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at center, transparent 30%, rgba(0, 0, 0, 0.2) 100%),
    radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
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
  position: relative;
  margin-bottom: 1rem;
}

.logo-img {
  max-width: 300px;
  height: auto;
  filter: drop-shadow(0 10px 25px rgba(0, 0, 0, 0.4));
  animation: breathe 4s ease-in-out infinite;
}

@keyframes breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

/* Hero Search Bar */
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
  border-radius: 9999px;
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

/* Quick Access Buttons */
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

/* ===========================
   ARTICLES SECTION
   =========================== */
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
  margin: 0;
}

.section-nav {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.section-nav .nav-link {
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  color: #6b7280;
  text-decoration: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
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
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  border: 1px solid #f3f4f6;
  transition: all 0.3s ease;
}

.article-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
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
  margin: 0 0 0.75rem 0;
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
  font-size: 0.875rem;
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
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
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

.author-name {
  font-size: 0.875rem;
  color: #6b7280;
}

.article-rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.rating-star {
  font-size: 1rem;
}

.rating-text {
  font-size: 0.875rem;
  color: #6b7280;
}

.article-actions {
  margin-top: 1rem;
}

.read-more-btn {
  display: inline-flex;
  align-items: center;
  color: #16a34a;
  font-weight: 500;
  font-size: 0.875rem;
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
  transition: transform 0.2s ease;
}

.read-more-btn:hover .read-more-arrow {
  transform: translateX(3px);
}

/* ===========================
   CATEGORIES SECTION
   =========================== */
.categories-section {
  padding: 4rem 1rem;
  background: #f9fafb;
}

.section-header-center {
  text-align: center;
  margin-bottom: 3rem;
}

.section-header-center .section-title {
  margin: 0;
}

/* Categories Slider */
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
  border-color: #16a34a;
}

.category-card:hover .category-name {
  color: #16a34a;
}

.category-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.category-name {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #1f2937;
  transition: color 0.2s ease;
}

.category-count {
  font-size: 0.875rem;
  color: #16a34a;
  font-weight: 500;
  margin: 0;
}

/* ===========================
   LOADING SPINNER
   =========================== */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
  min-height: 200px;
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

/* ===========================
   RESPONSIVE DESIGN
   =========================== */

/* Tablet */
@media (max-width: 1024px) {
  .articles-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

/* Mobile Large */
@media (max-width: 768px) {

  .section-nav {
    justify-content: center;
  }

  .articles-grid {
    grid-template-columns: 1fr;
  }

  .hero-section {
    padding: 4rem 1rem 3rem;
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

/* Mobile Small */
@media (max-width: 480px) {
  .hero-section {
    padding: 3.5rem 0.5rem 2.5rem;
    min-height: 45vh;
    margin-top: 60px;
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

  .section-title {
    font-size: 1.5rem;
  }

  .section-nav .nav-link {
    padding: 0.375rem 0.75rem;
    font-size: 0.8125rem;
  }

  .article-card {
    padding: 1.25rem;
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

/* Extra Small Mobile */
@media (max-width: 360px) {
  .logo-img {
    max-width: 180px;
  }

  .hero-section {
    padding: 3rem 0.5rem 2rem;
  }

  .quick-btn {
    padding: 0.5rem 0.875rem;
    font-size: 0.7rem;
  }

  .articles-section,
  .categories-section {
    padding: 3rem 0.75rem;
  }

  .section-title {
    font-size: 1.375rem;
  }
}
</style>
