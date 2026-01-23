<template>
  <div class="author-profile-page">
    <!-- Header -->
    <PublicHeader />

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Memuat profil penulis...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
      </svg>
      <h2>Penulis tidak ditemukan</h2>
      <p>Maaf, profil penulis yang Anda cari tidak tersedia.</p>
      <button @click="goBack" class="btn-back">Kembali ke Beranda</button>
    </div>

    <!-- Profile Content -->
    <div v-else-if="author" class="profile-wrapper">
      <!-- Hero Section -->
      <div class="profile-hero">
        <div class="hero-background"></div>
        <div class="hero-content">
          <div class="avatar-wrapper">
            <img
              :src="author.avatar_url || '/default-avatar.png'"
              :alt="author.name"
              class="author-avatar-large"
            />
            <div class="avatar-badge">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>

          <div class="author-main-info">
            <h1 class="author-name">{{ author.name }}</h1>
            <p class="author-position">{{ author.position || 'Kontributor' }}</p>

            <div class="author-meta">
              <div class="meta-item">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                <span>{{ author.email }}</span>
              </div>

              <div v-if="author.departemen" class="meta-item">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                <span>{{ author.departemen.name }}</span>
              </div>

              <div v-if="author.divisi" class="meta-item">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <span>{{ author.divisi.name }}</span>
              </div>
            </div>

            <div v-if="author.moto" class="author-motto">
              <svg class="quote-icon" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"></path>
              </svg>
              <p>{{ author.moto }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Section -->
      <div class="stats-container">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon articles">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ authorArticles.length }}</span>
              <span class="stat-label">Artikel Dipublikasikan</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon views">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ totalViews }}</span>
              <span class="stat-label">Total Views</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon rating">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ averageRating }}</span>
              <span class="stat-label">Rating Rata-rata</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon date">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ formatJoinDate(author.created_at) }}</span>
              <span class="stat-label">Bergabung Sejak</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Articles Section -->
      <div class="articles-container">
        <div class="section-header">
          <h2 class="section-title">
            <svg class="title-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
            </svg>
            Artikel yang Ditulis ({{ filteredArticles.length }})
          </h2>

          <div class="filter-tabs">
            <button
              :class="['filter-tab', { active: activeFilter === 'all' }]"
              @click="activeFilter = 'all'"
            >
              Semua
            </button>
            <button
              v-for="type in articleTypes"
              :key="type"
              :class="['filter-tab', { active: activeFilter === type }]"
              @click="activeFilter = type"
            >
              {{ type }}
            </button>
          </div>
        </div>

        <div v-if="paginatedArticles.length === 0" class="no-articles">
          <svg class="no-articles-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <p>Belum ada artikel yang dipublikasikan</p>
        </div>

        <div v-else class="articles-grid">
          <article
            v-for="article in paginatedArticles"
            :key="article.id"
            class="article-card"
            @click="goToArticle(article.slug)"
          >
            <div class="article-card-header">
              <el-tag :type="getTagType(article.type)" size="small" effect="dark">
                {{ article.type }}
              </el-tag>
              <span class="article-date">{{ formatDate(article.created_at) }}</span>
            </div>

            <h3 class="article-card-title">{{ article.title }}</h3>

            <p v-if="article.description" class="article-card-description">
              {{ truncateText(article.description, 120) }}
            </p>

            <div class="article-card-footer">
              <div class="footer-stats">
                <span class="stat-item">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                  {{ article.view_count || 0 }}
                </span>

                <span class="stat-item">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                  </svg>
                  {{ formatRating(article.rating) }}
                </span>

                <span v-if="article.category" class="category-badge">
                  {{ article.category.name }}
                </span>
              </div>

              <button class="btn-read-more">
                Baca
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </article>
        </div>

        <!-- Pagination -->
        <div v-if="filteredArticles.length > pageSize" class="pagination-wrapper">
          <el-pagination
            v-model:current-page="currentPage"
            background
            layout="prev, pager, next, jumper"
            :total="filteredArticles.length"
            :page-size="pageSize"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getPenulisShow, getArtikelPenulisShow } from '@/api/user'
import PublicHeader from '@/views/public/components/PublicHeader.vue'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref(false)
const author = ref(null)
const authorArticles = ref([])
const activeFilter = ref('all')
const currentPage = ref(1)
const pageSize = ref(9)
const penulisId = computed(() => route.params.id)
// Computed
const articleTypes = computed(() => {
  const types = [...new Set(authorArticles.value.map(a => a.type))]
  return types.sort()
})

const filteredArticles = computed(() => {
  if (activeFilter.value === 'all') {
    return authorArticles.value
  }
  return authorArticles.value.filter(a => a.type === activeFilter.value)
})

const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredArticles.value.slice(start, end)
})

const totalViews = computed(() => {
  return authorArticles.value.reduce((sum, article) => sum + (article.view_count || 0), 0)
})

const averageRating = computed(() => {
  const articlesWithRating = authorArticles.value.filter(a => a.rating && a.rating > 0)
  if (articlesWithRating.length === 0) return '0.0'
  const sum = articlesWithRating.reduce((total, article) => total + parseFloat(article.rating || 0), 0)
  return (sum / articlesWithRating.length).toFixed(1)
})

// Methods
const loadAuthorProfile = async () => {
  loading.value = true
  error.value = false

  try {
    // Load author data
    const authorResponse = await getPenulisShow(penulisId.value)

    author.value = authorResponse.data.data || authorResponse.data

    // Load author's articles
    const articlesResponse = await getArtikelPenulisShow(penulisId.value)
    authorArticles.value = articlesResponse.data.data || articlesResponse.data || []

    console.log(' Author profile loaded:', author.value)
    console.log(' Articles loaded:', authorArticles.value.length)

  } catch (err) {
    console.error('❌ Error loading author profile:', err)
    error.value = true
    ElMessage.error('Gagal memuat profil penulis')
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  const options = { day: 'numeric', month: 'short', year: 'numeric' }
  return date.toLocaleDateString('id-ID', options)
}

const formatJoinDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  const options = { month: 'short', year: 'numeric' }
  return date.toLocaleDateString('id-ID', options)
}

const formatRating = (rating) => {
  const numRating = parseFloat(rating) || 0
  return numRating.toFixed(1)
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

const truncateText = (text, length) => {
  if (!text) return ''
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

const handlePageChange = (page) => {
  currentPage.value = page
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

const goToArticle = (slug) => {
  router.push({ name: 'ArticleDetail', params: { slug } })
}

const goBack = () => {
  router.go(-1)
}

onMounted(() => {
  loadAuthorProfile()
})
</script>

<style scoped>
/* Loading & Error */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #111827;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-container p {
  color: #6b7280;
  font-size: 0.875rem;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
  text-align: center;
}

.error-icon {
  width: 4rem;
  height: 4rem;
  color: #ef4444;
}

.error-container h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.error-container p {
  color: #6b7280;
  max-width: 400px;
}

.btn-back {
  padding: 0.75rem 1.5rem;
  background: #111827;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 1rem;
}

.btn-back:hover {
  background: #1f2937;
}

/* Profile Hero */
.profile-hero {
  position: relative;
  background: white;
  overflow: hidden;
}

.hero-background {
  height: 200px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
}

.hero-background::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: linear-gradient(to top, white, transparent);
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  margin-top: -100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 3rem;
}

.avatar-wrapper {
  position: relative;
  margin-bottom: 1.5rem;
}

.author-avatar-large {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  object-fit: cover;
  border: 6px solid white;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.avatar-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.avatar-badge svg {
  width: 20px;
  height: 20px;
  color: white;
}

.author-main-info {
  text-align: center;
  max-width: 800px;
}

.author-name {
  font-size: 2.5rem;
  font-weight: 800;
  color: #111827;
  margin-bottom: 0.5rem;
}

.author-position {
  font-size: 1.25rem;
  color: #6b7280;
  font-weight: 500;
  margin-bottom: 1.5rem;
}

.author-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.meta-item svg {
  width: 1.25rem;
  height: 1.25rem;
  color: #9ca3af;
}

.author-motto {
  position: relative;
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
  border: 2px solid #e5e7eb;
  border-radius: 1rem;
  padding: 2rem 3rem;
  margin-top: 2rem;
}

.quote-icon {
  width: 2rem;
  height: 2rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.author-motto p {
  font-size: 1.125rem;
  font-style: italic;
  color: #374151;
  line-height: 1.8;
  margin: 0;
}

/* Stats Section */
.stats-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  border: 1px solid #e5e7eb;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  border-color: #d1d5db;
}

.stat-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon svg {
  width: 2rem;
  height: 2rem;
  color: white;
}

.stat-icon.articles {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.stat-icon.views {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.stat-icon.rating {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.stat-icon.date {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  color: #111827;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

/* Articles Section */
.articles-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem 4rem 2rem;
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
  color: #111827;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
}

.title-icon {
  width: 2rem;
  height: 2rem;
  color: #6b7280;
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-tab {
  padding: 0.5rem 1.25rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  color: #6b7280;
}

.filter-tab:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.filter-tab.active {
  background: #111827;
  color: white;
  border-color: #111827;
}

.no-articles {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 1rem;
  border: 2px dashed #e5e7eb;
  text-align: center;
}

.no-articles-icon {
  width: 4rem;
  height: 4rem;
  color: #9ca3af;
  margin-bottom: 1rem;
}

.no-articles p {
  color: #6b7280;
  font-size: 1rem;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.article-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.article-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  border-color: #d1d5db;
}

.article-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.article-date {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 500;
}

.article-card-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-card-description {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
}

.footer-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.stat-item svg {
  width: 1rem;
  height: 1rem;
  color: #9ca3af;
}

.category-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #f3f4f6;
  border-radius: 9999px;
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.btn-read-more {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  background: #111827;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-read-more:hover {
  background: #1f2937;
  transform: translateX(4px);
}

.btn-read-more svg {
  width: 1rem;
  height: 1rem;
}

/* Pagination */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 3rem;
  padding: 2rem;
  background: white;
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
}

.company-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  line-height: 1.1;
}
/* Responsive */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .articles-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .hero-content {
    padding: 0 1rem 2rem 1rem;
  }

  .author-name {
    font-size: 2rem;
  }

  .author-position {
    font-size: 1rem;
  }

  .author-meta {
    flex-direction: column;
    gap: 0.75rem;
  }

  .author-motto {
    padding: 1.5rem;
  }

  .author-motto p {
    font-size: 1rem;
  }

  .stats-container {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .articles-container {
    padding: 0 1rem 2rem 1rem;
  }

  .articles-grid {
    grid-template-columns: 1fr;
  }

  .filter-tabs {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }

  .filter-tab {
    white-space: nowrap;
  }
}

@media (max-width: 480px) {
  .author-avatar-large {
    width: 120px;
    height: 120px;
  }

  .avatar-badge {
    width: 32px;
    height: 32px;
    border-width: 3px;
  }

  .avatar-badge svg {
    width: 16px;
    height: 16px;
  }

  .author-name {
    font-size: 1.5rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .article-card {
    padding: 1rem;
  }
}
</style>
