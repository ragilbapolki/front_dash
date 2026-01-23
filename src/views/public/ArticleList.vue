<!-- ArticleList.vue - UPDATED -->
<template>
  <div class="article-list-page">
    <!--  Gunakan komponen PublicHeader -->
    <PublicHeader />

    <!-- Page Content -->
    <div class="page-content">
      <div class="content-container">
        <!-- Page Title -->
        <div class="page-title-section">
          <h1 class="page-title">📚 Semua Artikel</h1>
          <p class="page-subtitle">
            Jelajahi koleksi lengkap artikel pengetahuan WISMILAK
          </p>
        </div>

        <!-- Search and Filter Section -->
        <div class="filter-section">
          <div class="search-box">
            <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Cari artikel berdasarkan judul atau deskripsi..."
              class="search-input"
              @input="handleSearchInput"
            />
            <button v-if="filters.search" @click="clearSearch" class="clear-button">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="filter-controls">
            <div class="filter-group">
              <label class="filter-label">Kategori</label>
              <el-select v-model="filters.category" @change="applyFilters">
                <el-option value="">Semua Kategori</el-option>
                <el-option v-for="cat in categories" :key="cat.id" :value="cat.slug">
                  {{ cat.name }} ({{ cat.articles_count }})
                </el-option>
              </el-select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Module</label>
              <el-select v-model="filters.module" @change="applyFilters" placeholder="Semua Module">
                <el-option value="">Semua Module</el-option>
                <el-option v-for="mod in modules" :key="mod.id" :value="mod.id" :label="mod.name">
                  {{ mod.name }}
                </el-option>
              </el-select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Tipe</label>
              <el-select v-model="filters.type" @change="applyFilters">
                <el-option value="">Semua Tipe</el-option>
                <el-option value="SOP">📋 SOP</el-option>
                <el-option value="Kebijakan">⚖️ Kebijakan</el-option>
                <el-option value="Panduan">📖 Panduan</el-option>
              </el-select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Urutkan</label>
              <el-select v-model="filters.sort" @change="applyFilters">
                <el-option value="latest">🕒 Terbaru</el-option>
                <el-option value="popular">🔥 Terpopuler</el-option>
                <el-option value="rating">⭐ Rating Tertinggi</el-option>
                <el-option value="title">🔤 Judul (A-Z)</el-option>
              </el-select>
            </div>

            <div class="filter-group">
              <label class="filter-label">Penulis</label>
              <el-select v-model="filters.penulis" @change="applyFilters">
                <el-option value="">Semua Penulis</el-option>
                <el-option v-for="pen in penulis" :key="pen.id" :value="pen.id" :label="pen.name">
                  {{ pen.name }} ({{ pen.articles_count }})
                </el-option>
              </el-select>
            </div>

            <el-button @click="resetFilters" class="reset-button" type="info">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset
            </el-button>
          </div>
        </div>

        <!-- Active Filters Display -->
        <div v-if="hasActiveFilters" class="active-filters">
          <span class="filter-label">Filter aktif:</span>
          <div class="filter-tags">
            <span v-if="filters.search" class="filter-tag">
              🔍 "{{ filters.search }}"
              <button @click="filters.search = ''; applyFilters()" class="tag-close">×</button>
            </span>
            <span v-if="filters.category" class="filter-tag">
              📁 {{ getCategoryName(filters.category) }}
              <button @click="filters.category = ''; applyFilters()" class="tag-close">×</button>
            </span>
            <span v-if="filters.module" class="filter-tag">
              📦 {{ getModuleName(filters.module) }}
              <button @click="filters.module = ''; applyFilters()" class="tag-close">×</button>
            </span>
            <span v-if="filters.type" class="filter-tag">
              📝 {{ filters.type }}
              <button @click="filters.type = ''; applyFilters()" class="tag-close">×</button>
            </span>
          </div>
        </div>

        <!-- Results Info -->
        <div class="results-info">
          <p class="results-text">
            Menampilkan <strong>{{ articles.length }}</strong> dari
            <strong>{{ totalArticles }}</strong> artikel
          </p>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
          <div class="spinner"></div>
          <p class="loading-text">Memuat artikel...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="articles.length === 0" class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3 class="empty-title">Tidak ada artikel ditemukan</h3>
          <p class="empty-text">
            Coba ubah filter atau kata kunci pencarian Anda
          </p>
          <button @click="resetFilters" class="empty-button">
            Reset Filter
          </button>
        </div>

        <!-- Articles Grid -->
        <div v-else class="articles-grid">
          <div v-for="article in articles" :key="article.id" class="article-card">
            <div class="article-header">
              <div class="article-tags">
                <el-tag :type="getTagType(article.type)" size="small" effect="dark">
                  {{ article.type }}
                </el-tag>
                <el-tag
                  v-if="article.visibility === 'private'"
                  type="warning"
                  size="small"
                >
                  🔒 Private
                </el-tag>
                <el-tag v-else type="success" size="small">
                  🌐 Public
                </el-tag>
              </div>
              <div class="article-views">
                👁️ {{ formatNumber(article.view_count) }}
              </div>
            </div>

            <router-link
              :to="{ name: 'ArticleDetail', params: { slug: article.slug } }"
              class="read-more-btn"
            >
              <h3 class="article-title">{{ article.title }}</h3>
            </router-link>
            <p class="article-description">{{ article.description }}</p>

            <div class="article-meta">
              <span class="category-tag">
                📁 {{ article.category?.name || 'Umum' }}
              </span>
              <span class="article-date">
                🕒 {{ formatDate(article.created_at) }}
              </span>
            </div>

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

            <div class="article-actions">
              <router-link
                :to="{ name: 'ArticleDetail', params: { slug: article.slug } }"
                class="read-more-btn"
              >
                Baca Selengkapnya
                <svg class="read-more-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 5l7 7-7 7" />
                </svg>
              </router-link>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1 && !loading" class="pagination">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="pagination-button"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 19l-7-7 7-7" />
            </svg>
            Sebelumnya
          </button>

          <div class="pagination-numbers">
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="goToPage(page)"
              :class="['pagination-number', { active: page === currentPage }]"
            >
              {{ page }}
            </button>
          </div>

          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="pagination-button"
          >
            Selanjutnya
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getArticles, getCategories } from '@/api/article'
import { getModules } from '@/api/module'
import { getPenulis } from '@/api/user'
import { ElMessage } from 'element-plus'
import PublicHeader from '@/views/public/components/PublicHeader.vue'

const router = useRouter()
const route = useRoute()

// Articles State
const articles = ref([])
const loading = ref(false)
const totalArticles = ref(0)
const currentPage = ref(1)
const totalPages = ref(1)
const perPage = ref(12)
const modules = ref([])

// Categories State
const categories = ref([])
const penulis = ref([])

// Filters State
const filters = reactive({
  search: route.query.search || '',
  category: route.query.category || '',
  type: route.query.type || '',
  sort: route.query.sort || 'latest',
  penulis: route.query.penulis || '',
  module: route.query.module ? Number(route.query.module) : ''
})

// Debounce timer
let searchTimeout = null

// Computed
const hasActiveFilters = computed(() => {
  return filters.search || filters.category || filters.type || filters.module
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

// Methods
const loadArticles = async () => {
  loading.value = true

  try {
    const params = {
      page: currentPage.value,
      per_page: perPage.value,
      sort: filters.sort
    }

    if (filters.search) params.search = filters.search
    if (filters.category) params.category = filters.category
    if (filters.type) params.type = filters.type
    if (filters.penulis) params.penulis = filters.penulis
    if (filters.module) params.module = filters.module

    const response = await getArticles(params)

    if (response && response.data) {
      articles.value = Array.isArray(response.data) ? response.data : []

      if (response.total !== undefined) {
        totalArticles.value = response.total
        totalPages.value = response.last_page || 1
        currentPage.value = response.current_page || currentPage.value
      } else {
        const articlesCount = articles.value.length
        if (articlesCount < perPage.value) {
          totalPages.value = currentPage.value
          totalArticles.value = ((currentPage.value - 1) * perPage.value) + articlesCount
        } else {
          totalPages.value = currentPage.value + 1
          totalArticles.value = currentPage.value * perPage.value + 1
        }
      }
    } else {
      articles.value = []
      totalArticles.value = 0
      totalPages.value = 1
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (error) {
    console.error('Error loading articles:', error)
    ElMessage.error('Gagal memuat artikel')
    articles.value = []
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    const response = await getCategories()
    categories.value = response.data || response || []
  } catch (error) {
    console.error('Error loading categories:', error)
  }
}

const loadModules = async () => {
  try {
    const response = await getModules()
    modules.value = response.data || response || []
  } catch (error) {
    console.error('Error loading modules:', error)
  }
}

const loadPenulis = async () => {
  try {
    const response = await getPenulis()
    penulis.value = response || []
  } catch (error) {
    console.error('Error loading penulis:', error)
  }
}

const applyFilters = () => {
  currentPage.value = 1
  updateURL()
  loadArticles()
}

const handleSearchInput = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    applyFilters()
  }, 500)
}

const clearSearch = () => {
  filters.search = ''
  applyFilters()
}

const resetFilters = () => {
  filters.search = ''
  filters.category = ''
  filters.type = ''
  filters.sort = 'latest'
  filters.penulis = ''
  currentPage.value = 1
  filters.module = ''
  updateURL()
  loadArticles()
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    updateURL()
    loadArticles()
  }
}

const updateURL = () => {
  const query = {}
  if (filters.search) query.search = filters.search
  if (filters.category) query.category = filters.category
  if (filters.type) query.type = filters.type
  if (filters.sort !== 'latest') query.sort = filters.sort
  if (currentPage.value > 1) query.page = currentPage.value
  if (filters.penulis) query.penulis = filters.penulis
  if (filters.module) query.module = filters.module

  router.push({ query })
}
const getModuleName = (id) => {
  const module = modules.value.find(mod => mod.id === parseInt(id))
  return module ? `${module.name}` : id
}
const getCategoryName = (slug) => {
  const category = categories.value.find(cat => cat.slug === slug)
  return category?.name || slug
}

const formatRating = (rating) => {
  if (rating === null || rating === undefined || rating === '') {
    return '0.0'
  }
  const numRating = typeof rating === 'number' ? rating : parseFloat(rating)
  if (isNaN(numRating)) return '0.0'
  return numRating.toFixed(1)
}

const formatNumber = (num) => {
  const number = parseInt(num) || 0
  if (number >= 1000) {
    return (number / 1000).toFixed(1) + 'k'
  }
  return number.toString()
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Hari ini'
  if (diffDays === 1) return 'Kemarin'
  if (diffDays < 7) return `${diffDays} hari lalu`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} bulan lalu`
  return `${Math.floor(diffDays / 365)} tahun lalu`
}

const getTagType = (type) => {
  const typeMap = {
    'SOP': 'danger',
    'Panduan': 'success',
    'Tutorial': 'primary',
    'Kebijakan': 'warning',
    'Artikel': 'info'
  }
  return typeMap[type] || 'info'
}

onMounted(() => {
  loadCategories()
  loadPenulis()
  loadModules()
  if (route.query.page) {
    currentPage.value = parseInt(route.query.page)
  }
  loadArticles()
})

// Watch route changes
watch(filters, () => {
  if (filters.module && !modules.value.some(m => m.id === filters.module)) {
    filters.module = ''
  }
}, { deep: true })

watch(() => route.query, (newQuery) => {
  if (newQuery.search !== undefined) filters.search = newQuery.search || ''
  if (newQuery.category !== undefined) filters.category = newQuery.category || ''
  if (newQuery.module !== undefined) {filters.module = newQuery.module ? parseInt(newQuery.module) : ''}
  if (newQuery.type !== undefined) filters.type = newQuery.type || ''
  if (newQuery.sort !== undefined) filters.sort = newQuery.sort || 'latest'
  if (newQuery.page !== undefined) currentPage.value = parseInt(newQuery.page) || 1
}, { deep: true })
</script>

<style scoped>
.article-list-page {
  min-height: 100vh;
  background: #f9fafb;
}

/* Page Content */
.page-content {
  padding: 2rem 1rem;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title-section {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1.125rem;
  color: #6b7280;
}

/* Filter Section */
.filter-section {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.search-box {
  position: relative;
  margin-bottom: 1.5rem;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: #6b7280;
}

.search-input {
  width: 100%;
  padding: 0.875rem 3rem 0.875rem 3rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s ease;
}

.search-input:focus {
  border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
}

.clear-button {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: #6b7280;
  transition: color 0.2s ease;
}

.clear-button:hover {
  color: #374151;
}

.clear-button svg {
  width: 1.25rem;
  height: 1.25rem;
}

.filter-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.reset-button svg {
  width: 1.25rem;
  height: 1.25rem;
}

/* Active Filters */
.active-filters {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f0fdf4;
  border-radius: 0.75rem;
  border: 1px solid #bbf7d0;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  background: white;
  border: 1px solid #16a34a;
  border-radius: 9999px;
  font-size: 0.875rem;
  color: #166534;
  font-weight: 500;
}

.tag-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  color: #16a34a;
  padding: 0;
  margin: 0;
}

.tag-close:hover {
  color: #15803d;
}

/* Results Info */
.results-info {
  margin-bottom: 1.5rem;
}

.results-text {
  color: #6b7280;
  font-size: 0.875rem;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem 1rem;
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #16a34a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  margin-top: 1rem;
  color: #6b7280;
  font-size: 0.875rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 1rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
  margin-bottom: 1.5rem;
}

.empty-button {
  padding: 0.75rem 1.5rem;
  background: #16a34a;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.empty-button:hover {
  background: #15803d;
}

/* Articles Grid */
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

.article-tags {
  display: flex;
  gap: 0.5rem;
  flex: 1;
}

.article-views {
  white-space: nowrap;
  flex-shrink: 0;
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

.article-meta {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.category-tag,
.article-date {
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  background: #f3f4f6;
  border-radius: 9999px;
  color: #6b7280;
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

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 3rem;
  padding: 2rem 1rem;
}

.pagination-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: white;
  color: #374151;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-button:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #16a34a;
  color: #16a34a;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-button svg {
  width: 1.25rem;
  height: 1.25rem;
}

.pagination-numbers {
  display: flex;
  gap: 0.5rem;
}

.pagination-number {
  min-width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  color: #374151;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-number:hover {
  background: #f9fafb;
  border-color: #16a34a;
  color: #16a34a;
}

.pagination-number.active {
  background: #16a34a;
  color: white;
  border-color: #16a34a;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .articles-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }

  .page-subtitle {
    font-size: 1rem;
  }

  .filter-controls {
    grid-template-columns: 1fr;
  }

  .articles-grid {
    grid-template-columns: 1fr;
  }

  .pagination {
    flex-wrap: wrap;
  }

  .pagination-numbers {
    order: 3;
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .page-content {
    padding: 1rem 0.5rem;
  }

  .filter-section {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.75rem;
  }

  .active-filters {
    flex-direction: column;
    align-items: flex-start;
  }

  .article-card {
    padding: 1rem;
  }

  .pagination-button span {
    display: none;
  }
}

</style>
