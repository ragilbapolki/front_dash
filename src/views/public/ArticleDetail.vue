<template>
  <div class="article-detail-page">
    <PublicHeader />
    <div class="breadcrumb-container">
      <div class="breadcrumb-content">
        <router-link to="/" class="breadcrumb-link">Beranda</router-link>
        <span class="breadcrumb-separator">›</span>
        <router-link
          v-if="article?.category"
          :to="{ name: 'PublicArticleList', query: { category: article.category.slug } }"
          class="breadcrumb-link"
        >
          {{ article.category.name }}
        </router-link>
        <span class="breadcrumb-separator">›</span>
        <span class="breadcrumb-current">{{ article?.title }}</span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p class="loading-text">Memuat artikel...</p>
    </div>

    <!-- Access Denied State -->
    <div v-else-if="accessDenied" class="access-denied-container">
      <div class="access-denied-card">
        <div class="access-denied-icon">
          <svg width="80" height="80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
        </div>
        <h2>Akses Ditolak</h2>
        <p class="access-denied-message">{{ accessDeniedMessage }}</p>

        <div v-if="deniedArticleInfo" class="access-info">
          <p class="access-info-title">Artikel ini hanya dapat diakses oleh:</p>
          <div class="access-tags">
            <div v-if="deniedArticleInfo.divisions && deniedArticleInfo.divisions.length > 0" class="tag-group">
              <span class="tag-label">Divisi:</span>
              <span v-for="div in deniedArticleInfo.divisions" :key="div.id" class="access-tag">
                {{ div.name }}
              </span>
            </div>
            <div v-if="deniedArticleInfo.departments && deniedArticleInfo.departments.length > 0" class="tag-group">
              <span class="tag-label">Departemen:</span>
              <span v-for="dept in deniedArticleInfo.departments" :key="dept.id" class="access-tag">
                {{ dept.name }}
              </span>
            </div>
          </div>
        </div>

        <div class="access-denied-actions">
          <button v-if="!isAuthenticated" @click="openLoginModal" class="btn-primary">
            Login untuk Melanjutkan
          </button>
          <button @click="goBack" class="btn-secondary">
            Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>

    <!-- Article Content -->
    <div v-else-if="article" class="content-wrapper">
      <div class="content-container">
        <!-- Main Content -->
        <div class="main-content">
          <!-- Article Header -->
          <div class="article-header">
            <el-tag :type="getTagType(article.type)" size="small" effect="dark">
              {{ article.type }}
            </el-tag>

            <el-tag type="info" size="small">
              {{ article.category?.name }}
            </el-tag>
            <el-tag v-if="article.module" type="" size="small" class="module-badge">
              {{ article.module.name }}
            </el-tag>
            <el-tag
              v-if="article.visibility === 'private'"
              type="warning"
              size="small"
            >
              🔒 Private
            </el-tag>
            <el-tag
              v-else
              type="success"
              size="small"
            >
              🌐 Public
            </el-tag>
          </div>

          <h1 class="article-title">{{ article.title }}</h1>

          <!-- Author Section -->
          <div class="author-section">
            <img
              :src="article.user?.avatar_url || '/default-avatar.png'"
              :alt="article.user?.name"
              class="author-avatar"
            />
            <div class="author-info">
              <div class="author-name">{{ article.user?.name }}</div>
              <div class="author-role">{{ article.user?.position || 'Manajer SDM' }}</div>
            </div>
            <div class="article-date">
              Terakhir diperbarui: {{ formatDate(article.updated_at) }}
            </div>
          </div>

          <!-- Article Stats Enhanced -->
          <div class="article-stats-enhanced">
            <div class="stat-card">
              <div class="stat-icon-wrapper views">
                <svg class="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
              </div>
              <div class="stat-content">
                <span class="stat-value">{{ article.view_count }}</span>
                <span class="stat-label">Total Views</span>
              </div>
            </div>

            <div class="stat-card clickable" @click="toggleRatingHistory">
              <div class="stat-icon-wrapper rating">
                <svg class="stat-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                </svg>
              </div>
              <div class="stat-content">
                <span class="stat-value">{{ formatRating(article.rating) }}</span>
                <span class="stat-label">{{ article.rating_count }} Ratings</span>
              </div>
              <svg class="expand-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="showRatingHistory ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'"></path>
              </svg>
            </div>
          </div>

          <!-- Rating History Panel -->
          <transition name="slide-down">
            <div v-if="showRatingHistory" class="rating-history-panel">
              <div class="rating-history-header">
                <h3>📊 Rating Distribution</h3>
                <button @click="showRatingHistory = false" class="close-history-btn">×</button>
              </div>
              <div class="rating-distribution">
                <div v-for="star in [5, 4, 3, 2, 1]" :key="star" class="distribution-row">
                  <div class="star-label">
                    <svg class="star-icon-small" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                    </svg>
                    <span>{{ star }}</span>
                  </div>
                  <div class="distribution-bar-container">
                    <div class="distribution-bar" :style="{ width: getRatingPercentage(star) + '%', backgroundColor: getBarColor(star) }"></div>
                  </div>
                  <span class="distribution-count">{{ getRatingCount(star) }}</span>
                </div>
              </div>
              <div class="rating-summary">
                <div class="summary-item">
                  <span class="summary-label">Average Rating</span>
                  <span class="summary-value">{{ formatRating(article.rating) }}/5.0</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Total Reviews</span>
                  <span class="summary-value">{{ article.rating_count }}</span>
                </div>
              </div>
            </div>
          </transition>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <button @click="handlePrint" class="btn-action btn-print">
              <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
              </svg>
              Cetak
            </button>
            <button @click="handleShare" class="btn-action btn-share">
              <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
              </svg>
              Bagikan
            </button>
          </div>

          <!-- Article Content -->
          <div class="article-content" ref="articleContentRef" v-html="article.content"></div>
          <div v-if="article.attachment_path" class="attachment-section">
            <h2 class="section-title">📎 Lampiran Dokumen</h2>
            <div class="attachment-card">
              <div class="attachment-header">
                <div class="attachment-icon">
                  📄
                </div>
                <div class="attachment-info">
                  <div class="attachment-name">{{ getAttachmentName() }}</div>
                  <div class="attachment-meta">
                    <span v-if="article.attachment_size">{{ formatFileSize(article.attachment_size) }}</span>
                  </div>
                </div>
                <button @click="downloadAttachment" class="btn-download">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                  Download
                </button>
              </div>

              <!-- PDF Preview -->
              <div class="pdf-preview">
                <iframe
                  :src="getPdfUrl()"
                  class="pdf-iframe"
                  frameborder="0"
                ></iframe>
              </div>
            </div>
          </div>
          <!-- Gallery Section -->
          <div v-if="galleryImages.length > 0" class="gallery-section">
            <h2 class="section-title">🖼️ Galeri Gambar ({{ galleryImages.length }})</h2>
            <div id="lightgallery" class="gallery-grid-5">
              <a
                v-for="(image, index) in galleryImages"
                :key="image.id"
                :href="getImageUrl(image)"
                :data-sub-html="getImageCaption(image)"
                class="gallery-item"
              >
                <div class="gallery-image-wrapper">
                  <img :src="getImageUrl(image)" :alt="image.alt_text || `Gallery ${index + 1}`" />
                  <div class="gallery-overlay">
                    <svg class="gallery-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path>
                    </svg>
                    <span class="gallery-zoom-text">Klik untuk Zoom</span>
                  </div>
                </div>
                <div class="gallery-caption" v-if="image.caption">
                  {{ image.caption }}
                </div>
              </a>
            </div>
          </div>

          <!-- Rating & Comment Section -->
          <div class="rating-comment-section">
            <h2 class="section-title">
              <svg class="section-icon" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
              </svg>
              Beri Rating & Komentar
            </h2>

            <!-- Rating Form: Show for public OR authenticated users -->
            <div v-if="canSubmitRating" class="rating-form-card">
              <div class="rating-input-wrapper">
                <label class="rating-label">
                  <svg class="label-icon" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                  </svg>
                  Rating Anda:
                </label>
                <el-rate
                  v-model="userRating.rating"
                  :size="'large'"
                  show-text
                  :texts="['Sangat Buruk', 'Buruk', 'Cukup', 'Baik', 'Sangat Baik']"
                  :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                />
              </div>

              <div class="comment-input-wrapper">
                <label class="comment-label">
                  <svg class="label-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                  </svg>
                  Komentar (Opsional):
                </label>
                <textarea
                  v-model="userRating.comment"
                  placeholder="Bagikan pengalaman Anda dengan artikel ini..."
                  class="comment-input"
                  rows="4"
                ></textarea>
              </div>

              <!-- Anonymous Info for public articles when not logged in -->
              <div v-if="!isAuthenticated && article.visibility === 'public'" class="anonymous-info">
                <span>Anda memberikan rating sebagai <strong>Anonymous</strong>. <a href="#" @click.prevent="openLoginModal" class="login-link-inline">Login</a> untuk menggunakan nama Anda.</span>
              </div>

              <div class="form-actions">
                <button
                  @click="submitRating"
                  class="btn-submit-rating"
                  :disabled="submittingRating || !userRating.rating"
                >
                  <svg v-if="!submittingRating" class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <div v-else class="spinner-small"></div>
                  {{ submittingRating ? 'Mengirim...' : 'Kirim Rating & Komentar' }}
                </button>
                <p class="helper-text">
                  💡 Rating Anda akan membantu pengguna lain menemukan artikel berkualitas
                </p>
              </div>
            </div>

            <!-- Login prompt only for private articles -->
            <div v-else class="login-prompt">
              <svg class="prompt-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              <p>Silakan <a href="#" @click.prevent="openLoginModal" class="login-link">login</a> untuk memberikan rating dan komentar</p>
            </div>

            <!-- Comments List -->
            <div class="comments-header">
              <h3 class="comments-title">
                💬 Komentar & Review ({{ article.ratings?.length || 0 }})
              </h3>
              <div class="comments-filter">
                <button
                  :class="['filter-btn', { active: commentFilter === 'all' }]"
                  @click="commentFilter = 'all'"
                >
                  Semua
                </button>
                <button
                  :class="['filter-btn', { active: commentFilter === 'with-comment' }]"
                  @click="commentFilter = 'with-comment'"
                >
                  Dengan Komentar
                </button>
              </div>
            </div>

            <div class="comments-list">
              <div
                class="comment-item"
                v-for="rating in filteredComments"
                :key="rating.id"
              >
                <div class="comment-avatar-wrapper">
                  <div
                    class="comment-avatar"
                    :class="{ 'avatar-anonymous': !rating.user }"
                  >
                    {{ rating.user?.name?.charAt(0) || '?' }}
                  </div>
                </div>
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="comment-author">
                      {{ rating.user?.name || rating.anonymous_name || 'Anonymous' }}
                    </span>
                    <span v-if="!rating.user" class="anonymous-badge">👤 Guest</span>
                    <span class="comment-date">{{ formatDateShort(rating.created_at) }}</span>
                  </div>
                  <div class="comment-rating">
                    <el-rate
                      :model-value="rating.rating"
                      disabled
                      show-score
                      text-color="#ff9900"
                      score-template="{value}"
                    />
                  </div>
                  <p v-if="rating.comment" class="comment-text">{{ rating.comment }}</p>
                  <p v-else class="comment-text-empty">Tidak ada komentar</p>
                </div>
              </div>

              <div v-if="filteredComments.length === 0" class="no-comments">
                <svg class="no-comments-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
                <p>Belum ada {{ commentFilter === 'with-comment' ? 'komentar' : 'review' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <ArticleSidebar
          :article="article"
          :related-articles="relatedArticles"
          :page-size="5"
        />
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="error-container">
      <h2>Artikel tidak ditemukan</h2>
      <button @click="goBack" class="btn-back">Kembali</button>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, computed, nextTick, onBeforeUnmount } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { getArticleBySlug, rateArticle, getArticleGalleryBySlug } from '@/api/article'
  import { ElMessage } from 'element-plus'
  import { dispatch, ctx } from '@/store'

  import hljs from 'highlight.js'
  import 'highlight.js/styles/atom-one-dark.css'

  import lightGallery from 'lightgallery'
  import 'lightgallery/css/lightgallery.css'
  import 'lightgallery/css/lg-zoom.css'
  import 'lightgallery/css/lg-thumbnail.css'
  import lgThumbnail from 'lightgallery/plugins/thumbnail'
  import lgZoom from 'lightgallery/plugins/zoom'
  import ArticleSidebar from '@/views/public/components/ArticleSidebar.vue'
  import PublicHeader from '@/views/public/components/PublicHeader.vue'

  import javascript from 'highlight.js/lib/languages/javascript'
  import python from 'highlight.js/lib/languages/python'
  import php from 'highlight.js/lib/languages/php'
  import xml from 'highlight.js/lib/languages/xml'
  import sql from 'highlight.js/lib/languages/sql'
  import css from 'highlight.js/lib/languages/css'
  import json from 'highlight.js/lib/languages/json'
  import bash from 'highlight.js/lib/languages/bash'

  hljs.registerLanguage('javascript', javascript)
  hljs.registerLanguage('python', python)
  hljs.registerLanguage('php', php)
  hljs.registerLanguage('html', xml)
  hljs.registerLanguage('xml', xml)
  hljs.registerLanguage('sql', sql)
  hljs.registerLanguage('css', css)
  hljs.registerLanguage('json', json)
  hljs.registerLanguage('bash', bash)

  const route = useRoute()
  const router = useRouter()
  const isAuthenticated = computed(() => !!dispatch.user.getToken())
  const user = computed(() => ctx.userInfo || {})
  const loading = ref(true)
  const article = ref(null)
  const relatedArticles = ref([])
  const galleryImages = ref([])
  const articleContentRef = ref(null)

  let lightGalleryInstance = null

  const accessDenied = ref(false)
  const accessDeniedMessage = ref('')
  const deniedArticleInfo = ref(null)

  const userRating = ref({
    rating: 5,
    comment: ''
  })
  const submittingRating = ref(false)

  const showRatingHistory = ref(false)
  const commentFilter = ref('all')

  const relatedCurrentPage = ref(1)
  const relatedPageSize = ref(5)

  // Computed
  const filteredComments = computed(() => {
    if (!article.value?.ratings) return []
    if (commentFilter.value === 'all') {
      return article.value.ratings
    }
    return article.value.ratings.filter(r => r.comment && r.comment.trim() !== '')
  })

  const paginatedRelatedArticles = computed(() => {
    const start = (relatedCurrentPage.value - 1) * relatedPageSize.value
    const end = start + relatedPageSize.value
    return relatedArticles.value.slice(start, end)
  })

  // Can submit rating: public artikel bisa siapa saja, private harus login dan punya akses
  const canSubmitRating = computed(() => {
    if (!article.value) return false

    // Public article: siapa saja bisa rating (login atau tidak)
    if (article.value.visibility === 'public') return true

    // Private article: hanya yang login dan punya akses
    return isAuthenticated.value && canAccessPrivateArticle(article.value)
  })

  // Rating distribution functions
  const getRatingCount = (star) => {
    if (!article.value?.ratings) return 0
    return article.value.ratings.filter(r => r.rating === star).length
  }

  const getRatingPercentage = (star) => {
    const total = article.value?.rating_count || 0
    if (total === 0) return 0
    const count = getRatingCount(star)
    return Math.round((count / total) * 100)
  }

  const getBarColor = (star) => {
    const colors = {
      5: '#16a34a',
      4: '#84cc16',
      3: '#eab308',
      2: '#f97316',
      1: '#ef4444'
    }
    return colors[star] || '#9ca3af'
  }

  const toggleRatingHistory = () => {
    showRatingHistory.value = !showRatingHistory.value
  }

  // Helper functions for images
  const getImageUrl = (image) => {
    if (image.url) return image.url
    if (image.path) {
      if (image.path.startsWith('/storage/')) {
        return image.path
      }
      if (image.path.startsWith('storage/')) {
        return `/${image.path}`
      }
      return `/storage/${image.path}`
    }
    return ''
  }

  const getImageCaption = (image) => {
    if (!image.caption && !image.alt_text) return ''

    const caption = image.caption || image.alt_text || ''
    const altText = image.alt_text && image.alt_text !== image.caption ? image.alt_text : ''

    if (caption && altText) {
      return `<div class="lg-sub-html-content">
        <h4>${caption}</h4>
        <p>${altText}</p>
      </div>`
    }

    return `<div class="lg-sub-html-content">
      <h4>${caption || altText}</h4>
    </div>`
  }

  // Initialize LightGallery
  const initLightGallery = () => {
    if (lightGalleryInstance) {
      lightGalleryInstance.destroy()
      lightGalleryInstance = null
    }

    nextTick(() => {
      const galleryElement = document.getElementById('lightgallery')
      if (galleryElement && galleryImages.value.length > 0) {
        try {
          lightGalleryInstance = lightGallery(galleryElement, {
            plugins: [lgZoom, lgThumbnail],
            speed: 500,
            licenseKey: '0000-0000-000-0000',
            thumbnail: true,
            animateThumb: true,
            showThumbByDefault: true,
            thumbWidth: 100,
            thumbHeight: '80px',
            thumbMargin: 5,
            download: true,
            counter: true,
            zoom: true,
            actualSize: false,
            closable: true,
            escKey: true,
            keyPress: true,
            controls: true,
            slideEndAnimation: true,
            hideControlOnEnd: false,
            mousewheel: true,
            getCaptionFromTitleOrAlt: false,
            appendSubHtmlTo: '.lg-sub-html',
            subHtmlSelectorRelative: false
          })

          console.log(' LightGallery initialized successfully')
        } catch (error) {
          console.error('❌ Error initializing LightGallery:', error)
        }
      }
    })
  }

  // Check access for private article
  const canAccessPrivateArticle = (articleData) => {
    // Public article dapat diakses semua orang
    if (articleData.visibility === 'public') return true

    // Private article butuh authentication
    if (!isAuthenticated.value) return false

    const currentUser = user.value

    // Admin bisa akses semua
    if (currentUser.role === 'admin') return true

    // Cek akses berdasarkan divisi dan departemen
    const allowedDivisions = articleData.divisions?.map(d => d.id) || []
    const allowedDepartments = articleData.departments?.map(d => d.id) || []

    // Jika tidak ada pembatasan divisi/departemen, semua user bisa akses
    if (allowedDivisions.length === 0 && allowedDepartments.length === 0) {
      return true
    }

    const hasDivisionAccess = allowedDivisions.length === 0 || allowedDivisions.includes(currentUser.divisi_id)
    const hasDepartmentAccess = allowedDepartments.length === 0 || allowedDepartments.includes(currentUser.departemen_id)

    return hasDivisionAccess || hasDepartmentAccess
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    const options = { day: 'numeric', month: 'long', year: 'numeric' }
    return date.toLocaleDateString('id-ID', options)
  }

  const formatDateShort = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    const options = { day: 'numeric', month: 'long', year: 'numeric' }
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

  const submitRating = async () => {
    if (!userRating.value.rating) {
      ElMessage.warning('Silakan pilih rating terlebih dahulu')
      return
    }

    submittingRating.value = true
    try {
      const payload = {
        rating: userRating.value.rating,
        comment: userRating.value.comment
      }

      // Jika tidak login (hanya untuk public article), tambahkan flag anonymous
      if (!isAuthenticated.value) {
        payload.anonymous = true
        payload.anonymous_name = 'Anonymous'
      }

      const response = await rateArticle(article.value.id, payload)

      ElMessage.success('Rating dan komentar berhasil disimpan')

      if (response.data?.article) {
        article.value = response.data.article
      } else {
        await loadArticle()
      }

      userRating.value = { rating: 5, comment: '' }
    } catch (error) {
      console.error('Error submitting rating:', error)
      ElMessage.error(error.response?.data?.message || 'Gagal menyimpan rating')
    } finally {
      submittingRating.value = false
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.value.title,
          text: article.value.description,
          url: window.location.href
        })
      } catch (error) {
        if (error.name !== 'AbortError') {
          copyToClipboard()
        }
      }
    } else {
      copyToClipboard()
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href)
    ElMessage.success('Link berhasil disalin')
  }

  const goBack = () => {
    router.push('/')
  }

  const openLoginModal = () => {
    router.push('/login')
  }

  const loadGallery = async () => {
    try {
      const response = await getArticleGalleryBySlug(article.value.id)
      const data = response.data || response

      if (Array.isArray(data) && data.length > 0) {
        galleryImages.value = data.map((img, index) => {
          let imageUrl = ''

          if (img.url) {
            imageUrl = img.url
          } else if (img.path) {
            if (img.path.startsWith('http')) {
              imageUrl = img.path
            } else if (img.path.startsWith('/storage/')) {
              imageUrl = img.path
            } else if (img.path.startsWith('storage/')) {
              imageUrl = `/${img.path}`
            } else {
              imageUrl = `/storage/${img.path}`
            }
          }

          return {
            id: img.id || index,
            url: imageUrl,
            path: img.path || imageUrl,
            caption: img.caption || img.title || '',
            alt_text: img.alt_text || img.description || img.caption || `Gallery Image ${index + 1}`
          }
        })

        console.log(' Gallery loaded from API:', galleryImages.value)
      } else {
        throw new Error('No gallery data from API')
      }
    } catch (error) {
      console.log('⚠️ Using fallback gallery from article.gallery field')

      if (article.value?.gallery) {
        let galleryData = article.value.gallery

        if (typeof galleryData === 'string') {
          try {
            galleryData = JSON.parse(galleryData)
          } catch (e) {
            console.error('Failed to parse gallery JSON:', e)
            galleryData = []
          }
        }

        if (Array.isArray(galleryData)) {
          galleryImages.value = galleryData.map((img, index) => {
            let imageUrl = ''

            if (img.url) {
              imageUrl = img.url
            } else if (img.path) {
              if (img.path.startsWith('http')) {
                imageUrl = img.path
              } else if (img.path.startsWith('/storage/')) {
                imageUrl = img.path
              } else if (img.path.startsWith('storage/')) {
                imageUrl = `/${img.path}`
              } else {
                imageUrl = `/storage/${img.path}`
              }
            } else if (img.image_url) {
              imageUrl = img.image_url
            } else if (img.src) {
              imageUrl = img.src
            }

            return {
              id: img.id || index,
              url: imageUrl,
              path: img.path || imageUrl,
              caption: img.caption || img.title || img.name || '',
              alt_text: img.alt_text || img.description || img.caption || `Gallery Image ${index + 1}`
            }
          })

          console.log(' Gallery loaded from article.gallery (JSONB):', galleryImages.value)
        }
      }
    }

    if (galleryImages.value.length > 0) {
      console.log('🖼️ Total images loaded:', galleryImages.value.length)
      await nextTick()
      setTimeout(() => {
        initLightGallery()
      }, 300)
    }
  }

  const loadArticle = async () => {
    loading.value = true
    accessDenied.value = false
    deniedArticleInfo.value = null

    try {
      const response = await getArticleBySlug(route.params.slug)
      const data = response.data || response

      // Handle response dengan success = false
      if (response.success === false && response.message) {
        // Jika artikel tidak ditemukan
        if (response.message.includes('tidak ditemukan')) {
          article.value = null
          loading.value = false
          return
        }

        // Jika access denied
        accessDenied.value = true
        accessDeniedMessage.value = response.message

        // Coba ambil info artikel untuk ditampilkan di access denied
        if (response.article) {
          deniedArticleInfo.value = {
            divisions: response.article.divisions || [],
            departments: response.article.departments || []
          }
        }

        loading.value = false
        return
      }

      article.value = data.article

      // Cek akses untuk private article
      if (article.value.visibility === 'private' && !canAccessPrivateArticle(article.value)) {
        accessDenied.value = true
        deniedArticleInfo.value = {
          divisions: article.value.divisions || [],
          departments: article.value.departments || []
        }

        if (!isAuthenticated.value) {
          accessDeniedMessage.value = 'Artikel ini bersifat private. Silakan login untuk mengakses.'
        } else {
          accessDeniedMessage.value = 'Anda tidak memiliki akses ke artikel ini. Artikel ini hanya dapat diakses oleh divisi atau departemen tertentu.'
        }

        loading.value = false
        return
      }

      relatedArticles.value = data.related_articles || []
      relatedCurrentPage.value = 1

      if (article.value && article.value.gallery) {
        article.value.galleries = article.value.gallery
      }

      if (article.value?.id) {
        await loadGallery()
      }

    } catch (error) {
      console.error('❌ Error loading article:', error)

      if (error.response?.status === 403) {
        accessDenied.value = true
        accessDeniedMessage.value = error.response.data?.message || 'Anda tidak memiliki akses ke artikel ini.'

        if (error.response.data?.article) {
          deniedArticleInfo.value = {
            divisions: error.response.data.article.divisions || [],
            departments: error.response.data.article.departments || []
          }
        }
      } else if (error.response?.status === 404) {
        article.value = null
      } else {
        ElMessage.error('Gagal memuat artikel')
      }
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    loadArticle()
  })

  onBeforeUnmount(() => {
    if (lightGalleryInstance) {
      lightGalleryInstance.destroy()
    }
  })
</script>

<style scoped>
/* ===================================
   BASE STYLES
   =================================== */
.article-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
}

/* Breadcrumb */
.breadcrumb-container {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 0;
}

.breadcrumb-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.breadcrumb-link {
  color: #6b7280;
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb-link:hover {
  color: #111827;
}

.breadcrumb-separator {
  color: #d1d5db;
}

.breadcrumb-current {
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 400px;
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #111827;
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

.spinner-small {
  width: 1rem;
  height: 1rem;
  border: 2px solid #ffffff40;
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

/* Access Denied */
.access-denied-container {
  max-width: 600px;
  margin: 4rem auto;
  padding: 2rem;
}

.access-denied-card {
  background: white;
  border-radius: 0.5rem;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.access-denied-icon {
  color: #f59e0b;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
}

.access-denied-card h2 {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1rem;
}

.access-denied-message {
  color: #6b7280;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.access-info {
  background: #fef9e7;
  border: 1px solid #fde68a;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
}

.access-info-title {
  font-weight: 600;
  color: #92400e;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.access-tags {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: flex-start;
}

.tag-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #78350f;
  min-width: 100px;
}

.access-tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: white;
  border: 1px solid #fbbf24;
  border-radius: 9999px;
  font-size: 0.75rem;
  color: #92400e;
  font-weight: 500;
}

.access-denied-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: #111827;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 0.875rem;
}

.btn-primary:hover {
  background: #1f2937;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background: white;
  color: #111827;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.btn-secondary:hover {
  background: #f9fafb;
}

/* Content */
.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.content-container {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 2rem;
}

/* Main Content */
.main-content {
  background: white;
  border-radius: 0.5rem;
  padding: 2rem;
}

.article-header {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.article-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1.5rem;
  line-height: 1.3;
}

/* Author Section */
.author-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  margin-bottom: 1.5rem;
}

.author-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  object-fit: cover;
}

.author-info {
  flex: 1;
}

.author-name {
  font-weight: 600;
  color: #111827;
}

.author-role {
  font-size: 0.875rem;
  color: #6b7280;
}

.article-date {
  font-size: 0.875rem;
  color: #6b7280;
}

/* Enhanced Stats */
.article-stats-enhanced {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  transition: all 0.3s;
}

.stat-card.clickable {
  cursor: pointer;
}

.stat-card.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #d1d5db;
}

.stat-icon-wrapper {
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon-wrapper.views {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
}

.stat-icon-wrapper.rating {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}

.stat-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #374151;
}

.stat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
  font-weight: 500;
}

.expand-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #9ca3af;
  flex-shrink: 0;
}

/* Rating History Panel */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-enter-to,
.slide-down-leave-from {
  max-height: 600px;
  opacity: 1;
  transform: translateY(0);
}

.rating-history-panel {
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.rating-history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.rating-history-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.close-history-btn {
  width: 2rem;
  height: 2rem;
  border: none;
  background: #f3f4f6;
  border-radius: 50%;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-history-btn:hover {
  background: #e5e7eb;
  color: #111827;
}

.rating-distribution {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.distribution-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.star-label {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  min-width: 2.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
}

.star-icon-small {
  width: 1rem;
  height: 1rem;
  color: #fbbf24;
}

.distribution-bar-container {
  flex: 1;
  height: 0.75rem;
  background: #f3f4f6;
  border-radius: 9999px;
  overflow: hidden;
}

.distribution-bar {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.5s ease;
}

.distribution-count {
  min-width: 2.5rem;
  text-align: right;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
}

.rating-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1rem;
  background: white;
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
}

.summary-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.summary-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.btn-action {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.btn-icon {
  width: 1.125rem;
  height: 1.125rem;
}

/* ===================================
   GALLERY SECTION - 5 COLUMNS LAYOUT
   =================================== */
.gallery-section {
  margin: 2.5rem 0;
  padding: 2rem;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.gallery-grid-5 {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
  margin-top: 1.5rem;
}

.gallery-item {
  position: relative;
  display: block;
  text-decoration: none;
  background: white;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: 2px solid transparent;
}

.gallery-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  border-color: #3b82f6;
}

.gallery-image-wrapper {
  position: relative;
  width: 100%;
  padding-bottom: 100%; /* Square aspect ratio */
  overflow: hidden;
  background: #f3f4f6;
}

.gallery-image-wrapper img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.gallery-item:hover .gallery-image-wrapper img {
  transform: scale(1.1);
}

.gallery-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.8) 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.gallery-item:hover .gallery-overlay {
  opacity: 1;
}

.gallery-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: white;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.gallery-zoom-text {
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.gallery-caption {
  padding: 0.75rem;
  font-size: 0.75rem;
  color: #374151;
  line-height: 1.4;
  text-align: center;
  background: white;
  border-top: 1px solid #e5e7eb;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gallery-item:hover .gallery-caption {
  color: #111827;
  font-weight: 500;
}

/* PDF Attachment */
.attachment-section {
  margin: 2rem 0;
}

.attachment-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.attachment-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.attachment-icon {
  font-size: 2rem;
}

.attachment-info {
  flex: 1;
}

.attachment-name {
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

.attachment-meta {
  font-size: 0.875rem;
  color: #6b7280;
}

.btn-download {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #111827;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-download:hover {
  background: #1f2937;
}

.pdf-preview {
  height: 600px;
}

.pdf-iframe {
  width: 100%;
  height: 100%;
}

/* Article Content */
.article-content {
  margin: 2rem 0;
  line-height: 1.8;
  color: #374151;
}

/* Rating & Comment Section */
.rating-comment-section {
  margin: 3rem 0;
  padding: 2rem 0;
  border-top: 2px solid #e5e7eb;
}

.section-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.rating-form-card {
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.rating-input-wrapper,
.comment-input-wrapper {
  margin-bottom: 1.5rem;
}

.rating-label,
.comment-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
}

.label-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #6b7280;
}

.comment-input {
  width: 100%;
  padding: 0.875rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s;
  background: white;
}

.comment-input:focus {
  outline: none;
  border-color: #6b7280;
  box-shadow: 0 0 0 3px rgba(107, 114, 128, 0.1);
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn-submit-rating {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.875rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-submit-rating:hover:not(:disabled) {
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-submit-rating:disabled {
  background: #d1d5db;
  cursor: not-allowed;
  transform: none;
}

.helper-text {
  font-size: 0.75rem;
  color: #6b7280;
  text-align: center;
  margin: 0;
}

.login-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  text-align: center;
  margin-bottom: 2rem;
}

.prompt-icon {
  width: 3rem;
  height: 3rem;
  color: #9ca3af;
}

.login-prompt p {
  color: #6b7280;
  margin: 0;
}

.login-link {
  color: #2563eb;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;
}

.login-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

/* Comments Header */
.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.comments-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.comments-filter {
  display: flex;
  gap: 0.5rem;
}

.filter-btn {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  color: #6b7280;
  font-weight: 500;
}

.filter-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.filter-btn.active {
  background: #111827;
  color: white;
  border-color: #111827;
}

/* Comments List */
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.comment-item {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
}

.comment-item:hover {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.comment-avatar-wrapper {
  flex-shrink: 0;
}

.comment-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #6b7280 0%, #9ca3af 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
  font-size: 1rem;
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.comment-author {
  font-weight: 600;
  color: #111827;
  font-size: 0.875rem;
}

.comment-date {
  font-size: 0.75rem;
  color: #9ca3af;
}

.comment-rating {
  margin-bottom: 0.75rem;
}

.comment-text {
  color: #374151;
  line-height: 1.6;
  margin: 0;
  font-size: 0.875rem;
}

.comment-text-empty {
  color: #9ca3af;
  font-style: italic;
  line-height: 1.6;
  margin: 0;
  font-size: 0.875rem;
}

.no-comments {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
  text-align: center;
  color: #9ca3af;
}

.no-comments-icon {
  width: 3rem;
  height: 3rem;
}

/* Error State */
.error-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 4rem 2rem;
  text-align: center;
}

.error-container h2 {
  font-size: 1.5rem;
  color: #111827;
  margin-bottom: 1rem;
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
}

.btn-back:hover {
  background: #1f2937;
}

/* Responsive */
@media (max-width: 1024px) {
  .content-container {
    grid-template-columns: 1fr;
  }

  .article-stats-enhanced {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .breadcrumb-content,
  .content-wrapper {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .main-content {
    padding: 1.5rem;
  }

  .article-title {
    font-size: 1.5rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn-action {
    width: 100%;
    justify-content: center;
  }

  .comments-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .rating-summary {
    grid-template-columns: 1fr;
  }

  .breadcrumb-current {
    max-width: 200px;
  }
}

/* Print */
@media print {
  .breadcrumb-container,
  .action-buttons,
  .rating-comment-section,
  .rating-history-panel {
    display: none !important;
  }

  .content-container {
    grid-template-columns: 1fr;
  }

  .main-content {
    box-shadow: none;
    padding: 0;
  }
}

.article-content :deep(.gallery-container) {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
}

.article-content :deep(.gallery-item) {
  position: relative;
  overflow: hidden;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: white;
  cursor: pointer;
}

.article-content :deep(.gallery-item:hover) {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.article-content :deep(.gallery-item img) {
  width: 100%;
  height: 250px;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.article-content :deep(.gallery-item:hover img) {
  transform: scale(1.1);
}

.article-content :deep(.gallery-item::before) {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.7) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.article-content :deep(.gallery-item:hover::before) {
  opacity: 1;
}

.article-content :deep(.gallery-caption) {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  transform: translateY(100%);
  transition: transform 0.3s ease;
  z-index: 2;
}

.article-content :deep(.gallery-item:hover .gallery-caption) {
  transform: translateY(0);
}

/* Masonry Gallery Style (Alternatif) */
.article-content :deep(.gallery-masonry) {
  column-count: 3;
  column-gap: 1.5rem;
  margin: 2rem 0;
}

.article-content :deep(.gallery-masonry .gallery-item) {
  break-inside: avoid;
  margin-bottom: 1.5rem;
  display: inline-block;
  width: 100%;
}

.article-content :deep(.gallery-masonry .gallery-item img) {
  height: auto;
}

/* Lightbox untuk Gallery */
.gallery-lightbox {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.lightbox-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  animation: zoomIn 0.3s ease;
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.lightbox-content img {
  max-width: 100%;
  max-height: 90vh;
  border-radius: 0.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.lightbox-close {
  position: absolute;
  top: -3rem;
  right: 0;
  width: 2.5rem;
  height: 2.5rem;
  background: white;
  border: none;
  border-radius: 50%;
  color: #111827;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.lightbox-close:hover {
  background: #f3f4f6;
  transform: rotate(90deg);
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 3rem;
  height: 3rem;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  backdrop-filter: blur(8px);
}

.lightbox-nav:hover {
  background: white;
  transform: translateY(-50%) scale(1.1);
}

.lightbox-nav.prev {
  left: -4rem;
}

.lightbox-nav.next {
  right: -4rem;
}

.lightbox-nav svg {
  width: 1.5rem;
  height: 1.5rem;
  color: #111827;
}

.lightbox-counter {
  position: absolute;
  bottom: -3rem;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  backdrop-filter: blur(8px);
}

/* Enhanced Image Styles dalam Article Content */
.article-content :deep(img:not(.gallery-item img)) {
  max-width: 100%;
  height: auto;
  border-radius: 0.75rem;
  margin: 2rem 0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
}

.article-content :deep(img:not(.gallery-item img):hover) {
  transform: scale(1.02);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Image with Caption */
.article-content :deep(figure) {
  margin: 2rem 0;
}

.article-content :deep(figure img) {
  margin: 0;
}

.article-content :deep(figcaption) {
  margin-top: 0.75rem;
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
  font-style: italic;
}

/* Grid Gallery (2 columns) */
.article-content :deep(.gallery-grid-2) {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin: 2rem 0;
}

/* Grid Gallery (3 columns) */
.article-content :deep(.gallery-grid-3) {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin: 2rem 0;
}

/* Grid Gallery (4 columns) */
.article-content :deep(.gallery-grid-4) {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin: 2rem 0;
}

/* Horizontal Scroll Gallery */
.article-content :deep(.gallery-scroll) {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  margin: 2rem 0;
  padding: 1rem 0;
  -webkit-overflow-scrolling: touch;
}

.article-content :deep(.gallery-scroll::-webkit-scrollbar) {
  height: 8px;
}

.article-content :deep(.gallery-scroll::-webkit-scrollbar-track) {
  background: #f3f4f6;
  border-radius: 4px;
}

.article-content :deep(.gallery-scroll::-webkit-scrollbar-thumb) {
  background: #9ca3af;
  border-radius: 4px;
}

.article-content :deep(.gallery-scroll::-webkit-scrollbar-thumb:hover) {
  background: #6b7280;
}

.article-content :deep(.gallery-scroll .gallery-item) {
  flex: 0 0 300px;
  scroll-snap-align: start;
}

/* Featured Image with Overlay Text */
.article-content :deep(.featured-image) {
  position: relative;
  margin: 2rem 0;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.article-content :deep(.featured-image img) {
  width: 100%;
  height: 400px;
  object-fit: cover;
  margin: 0;
}

.article-content :deep(.featured-image-overlay) {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, transparent 100%);
  color: white;
}

.article-content :deep(.featured-image-title) {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.article-content :deep(.featured-image-description) {
  font-size: 0.875rem;
  opacity: 0.9;
}

/* Responsive */
@media (max-width: 1024px) {
  .article-content :deep(.gallery-masonry) {
    column-count: 2;
  }

  .article-content :deep(.gallery-grid-4) {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .article-content :deep(.gallery-container) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    padding: 1rem;
  }

  .article-content :deep(.gallery-masonry) {
    column-count: 1;
  }

  .article-content :deep(.gallery-grid-2),
  .article-content :deep(.gallery-grid-3),
  .article-content :deep(.gallery-grid-4) {
    grid-template-columns: 1fr;
  }

  .article-content :deep(.gallery-scroll .gallery-item) {
    flex: 0 0 250px;
  }

  .article-content :deep(.featured-image img) {
    height: 250px;
  }

  .lightbox-nav {
    width: 2.5rem;
    height: 2.5rem;
  }

  .lightbox-nav.prev {
    left: 1rem;
  }

  .lightbox-nav.next {
    right: 1rem;
  }
}

@media (max-width: 480px) {
  .article-content :deep(.gallery-container) {
    grid-template-columns: 1fr;
  }

  .article-content :deep(.gallery-scroll .gallery-item) {
    flex: 0 0 200px;
  }
}
</style>
