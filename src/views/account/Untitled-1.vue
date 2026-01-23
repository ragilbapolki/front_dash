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
          <nav class="header-nav">
            <div class="nav-links">
              <router-link to="/" class="nav-link">Home</router-link>
              <router-link to="/articles" class="nav-link">Articles</router-link>
              <a href="#categories" class="nav-link" @click="scrollToCategories">Categories</a>
            </div>
          </nav>

          <!-- Search Bar -->
          <div class="header-search">
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
          </div>

          <!-- Login/User Section -->
          <div class="header-actions">
            <div v-if="isAuthenticated" class="user-menu">
              <div class="user-info">
                <img
                  :src="user.avatar || '/default-avatar.png'"
                  :alt="user.name"
                  class="user-avatar"
                />
                <span class="user-name">{{ user.name }}</span>
                <div class="user-dropdown">
                  <router-link v-if="user.role === 'admin'" to="/admin" class="dropdown-item">
                    🏛️ Admin Dashboard
                  </router-link>
                  <a href="#" @click.prevent="handleLogout" class="dropdown-item"> 🚪 Logout </a>
                </div>
              </div>
            </div>
            <button v-else @click="openLoginModal" class="login-button">Login</button>
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
              <div class="form-group">
                <label for="email" class="form-label">Email</label>
                <input
                  type="email"
                  id="email"
                  v-model="loginForm.email"
                  class="form-input"
                  placeholder="Masukkan email Anda"
                  required
                />
              </div>

              <div class="form-group">
                <label for="password" class="form-label">Password</label>
                <input
                  type="password"
                  id="password"
                  v-model="loginForm.password"
                  class="form-input"
                  placeholder="Masukkan password Anda"
                  required
                />
              </div>

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

      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <!-- Portal Badge -->
          <div class="portal-badge">Portal Pengetahuan Internal</div>

          <!-- Logo and Tree -->
          <div class="logo-container">
            <div class="tree-illustration">
              <!-- Stylized tree SVG -->
              <svg viewBox="0 0 200 150" class="tree-svg">
                <!-- Tree crown -->
                <circle cx="100" cy="50" r="25" fill="#4ade80" opacity="0.8" />
                <circle cx="85" cy="45" r="22" fill="#22c55e" opacity="0.9" />
                <circle cx="115" cy="45" r="22" fill="#16a34a" opacity="0.9" />
                <circle cx="100" cy="35" r="20" fill="#15803d" opacity="0.8" />
                <!-- Tree trunk -->
                <rect x="95" y="70" width="10" height="25" fill="#92400e" />
                <!-- Ground -->
                <ellipse cx="100" cy="95" rx="35" ry="5" fill="#166534" opacity="0.3" />
              </svg>
            </div>
            <h1 class="company-name">WISMILAK</h1>
          </div>

          <!-- Welcome Text -->
          <h2 class="welcome-title">
            Selamat Datang di <span class="highlight">WISMILAK</span><br />
            Knowledge Base
          </h2>

          <!-- Feature Cards -->
          <div class="feature-cards">
            <div class="feature-card">
              <div class="feature-icon">📚</div>
              <h3 class="feature-title">1000+ Artikel</h3>
              <p class="feature-desc">Pengetahuan lengkap</p>
            </div>

            <div class="feature-card">
              <div class="feature-icon">📈</div>
              <h3 class="feature-title">Update Rutin</h3>
              <p class="feature-desc">Informasi terkini</p>
            </div>

            <div class="feature-card">
              <div class="feature-icon"></div>
              <h3 class="feature-title">Terverifikasi</h3>
              <p class="feature-desc">Konten berkualitas</p>
            </div>
          </div>

          <!-- CTA Button -->
          <router-link to="/articles" class="cta-button">
            Jelajahi Knowledge Base
            <svg class="cta-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              ></path>
            </svg>
          </router-link>
        </div>
      </section>

      <!-- Featured Articles Section -->
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

              <!-- Article Content -->
              <h3 class="article-title">{{ article.title }}</h3>
              <p class="article-description">{{ article.description }}</p>

              <!-- Author & Rating -->
              <div class="article-footer">
                <div class="article-author">
                  <img
                    :src="article.user.avatar || '/default-avatar.png'"
                    :alt="article.user.name"
                    class="author-avatar"
                  />
                  <span class="author-name">{{ article.user.name }}</span>
                </div>

                <div class="article-rating">
                  <span class="rating-star">⭐</span>
                  <span class="rating-text">
                    {{ formatRating(article.rating) }} ({{ article.rating_count }})
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
          <div class="view-all-container">
            <router-link to="/articles" class="view-all-button">
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
          </div>
        </div>
      </section>

      <!-- Categories Section -->
      <section class="categories-section" id="categories">
        <div class="section-container">
          <div class="section-header-center">
            <h2 class="section-title">Kategori</h2>
          </div>

          <div v-if="categoriesLoading" class="loading-container">
            <div class="spinner"></div>
          </div>

          <div v-else class="categories-grid">
            <router-link
              v-for="category in categories"
              :key="category.id"
              :to="{ name: 'ArticleList', query: { category: category.slug } }"
              class="category-card"
            >
              <div class="category-icon">{{ getCategoryIcon(category.name) }}</div>
              <h3 class="category-name">{{ category.name }}</h3>
              <p class="category-count">{{ formatNumber(category.articles_count) }} artikel</p>
            </router-link>
          </div>
        </div>
      </section>
    </div>
</template>

  <script>
  import { mapActions, mapState } from 'vuex'

  export default {
    name: 'HomePage',

    // Data - All reactive properties
    data() {
      return {
        // Articles data
        featuredArticles: [],
        articlesLoading: true,
        activeTab: 'popular',

        // Categories data
        categories: [],
        categoriesLoading: true,

        // Search
        searchQuery: '',

        // Modal state
        showLoginModal: false,

        // Login form
        loginForm: {
          email: '',
          password: '',
          remember: false,
        },
        loginLoading: false,

        // Configuration
        articleTypeConfig: {
          SOP: { class: 'badge-red', icon: '📋' },
          Panduan: { class: 'badge-green', icon: '📖' },
          Artikel: { class: 'badge-purple', icon: '📝' },
          Kebijakan: { class: 'badge-blue', icon: '⚖️' },
        },

        categoryIconConfig: {
          'SDM & Kepegawaian': '👥',
          'IT Development': '💻',
          SAP: '🔄',
          Marketing: '📊',
          'Keuangan & Akuntansi': '💰',
          Operasional: '⚙️',
        }
      }
    },

    // Computed properties - Derived state from Vuex
    computed: {
      ...mapState('auth', ['user', 'isAuthenticated']),

      // Computed property to check if data is available
      hasArticles() {
        return this.featuredArticles && this.featuredArticles.length > 0
      },

      hasCategories() {
        return this.categories && this.categories.length > 0
      }
    },

    // Methods - All component methods
    methods: {
      // Vuex actions
      ...mapActions('articles', ['fetchArticles']),
      ...mapActions('categories', ['fetchCategories']),
      ...mapActions('auth', ['login', 'logout']),

      // ===== ARTICLE METHODS =====
      async loadFeaturedArticles() {
        await this.loadArticles('popular')
      },

      async loadPopularArticles() {
        await this.loadArticles('popular')
        this.activeTab = 'popular'
      },

      async loadLatestArticles() {
        await this.loadArticles('latest')
        this.activeTab = 'latest'
      },

      async loadTopRatedArticles() {
        await this.loadArticles('rating')
        this.activeTab = 'rating'
      },

      async loadArticles(sortType) {
        try {
          this.articlesLoading = true
          const response = await this.$http.get('/api/v1/articles', {
            params: { per_page: 6, sort: sortType },
          })
          this.featuredArticles = response.data.data || []
        } catch (error) {
          this.handleError('Gagal memuat artikel', error)
        } finally {
          this.articlesLoading = false
        }
      },

      // ===== CATEGORY METHODS =====
      async loadCategories() {
        try {
          this.categoriesLoading = true
          const response = await this.$http.get('/api/v1/categories')
          this.categories = response.data || []
        } catch (error) {
          this.handleError('Gagal memuat kategori', error)
        } finally {
          this.categoriesLoading = false
        }
      },

      // ===== UTILITY METHODS =====
      getArticleTypeClass(type) {
        return this.articleTypeConfig[type]?.class || 'badge-gray'
      },

      getCategoryIcon(categoryName) {
        return this.categoryIconConfig[categoryName] || '📋'
      },

      formatNumber(number) {
        if (!number) return '0'
        return new Intl.NumberFormat('id-ID').format(number)
      },

      formatRating(rating) {
        if (!rating) return '0.0'
        return Number(rating).toFixed(1)
      },

      // ===== MODAL METHODS =====
      openLoginModal() {
        this.showLoginModal = true
        document.body.style.overflow = 'hidden'
      },

      closeLoginModal() {
        this.showLoginModal = false
        document.body.style.overflow = ''
        this.resetLoginForm()
      },

      resetLoginForm() {
        this.loginForm = {
          email: '',
          password: '',
          remember: false,
        }
      },

      // ===== AUTHENTICATION METHODS =====
      async handleLogin() {
        if (this.loginLoading) return

        this.loginLoading = true

        try {
          console.log('🔐 Starting login process...')

          const result = await this.login(this.loginForm)
          console.log(' Login successful:', result)

          this.$toast.success(`Selamat datang, ${result.user.name}! 🎉`)
          this.closeLoginModal()

          // Wait for modal close animation
          await this.$nextTick()
          await new Promise(resolve => setTimeout(resolve, 300))

          // Redirect admin users
          if (result.user?.role === 'admin') {
            await this.redirectToAdmin()
          } else {
            this.$toast.info('Login berhasil! Selamat menjelajahi Knowledge Base.')
          }
        } catch (error) {
          this.handleLoginError(error)
        } finally {
          this.loginLoading = false
        }
      },

      async redirectToAdmin() {
        console.log('🏛️ Admin user detected, redirecting to dashboard...')

        try {
          await this.$router.push('/admin')
          console.log(' Successfully navigated to admin dashboard')
          this.$toast.info('Selamat datang di Dashboard Admin!')
        } catch (navigationError) {
          console.error('❌ Navigation failed:', navigationError)

          try {
            await this.$router.replace('/admin')
            this.$toast.info('Selamat datang di Dashboard Admin!')
          } catch (replaceError) {
            console.error('❌ Replace navigation failed:', replaceError)
            window.location.href = '/admin'
          }
        }
      },

      handleLoginError(error) {
        console.error('❌ Login error:', error)

        let errorMessage = 'Login gagal. Periksa email dan password Anda.'

        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error.response?.status === 401) {
          errorMessage = 'Email atau password salah.'
        } else if (error.response?.status >= 500) {
          errorMessage = 'Terjadi kesalahan server. Silakan coba lagi.'
        }

        this.$toast.error(errorMessage)
      },

      async handleLogout() {
        try {
          console.log('🚪 Logging out...')
          await this.logout()
          this.$toast.success('Anda berhasil keluar')

          // Redirect if on admin page
          if (this.$route.path.startsWith('/admin')) {
            await this.$router.push('/')
          }
        } catch (error) {
          console.error('❌ Logout error:', error)
          this.$toast.error('Gagal logout')
        }
      },

      // ===== NAVIGATION METHODS =====
      handleSearch() {
        if (!this.searchQuery.trim()) return

        this.$router.push({
          name: 'ArticleList',
          query: { search: this.searchQuery.trim() },
        })
      },

      scrollToCategories() {
        const element = document.getElementById('categories')
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      },

      async showRegisterForm() {
        console.log('🔄 Navigating to register...')
        this.closeLoginModal()

        await this.$nextTick()

        try {
          await this.$router.push({ name: 'Register' })
          console.log(' Successfully navigated to register')
        } catch (error) {
          console.error('❌ Navigation to register failed:', error)

          try {
            await this.$router.push('/register')
          } catch (fallbackError) {
            console.error('❌ Fallback navigation failed:', fallbackError)
            this.$toast.error('Halaman register tidak dapat diakses saat ini')
          }
        }
      },

      // ===== ERROR HANDLING =====
      handleError(message, error) {
        console.error(message + ':', error)
        this.$toast.error(message)
      }
    },

    // Lifecycle Hooks
    async mounted() {
      console.log('HomePage mounted')
      console.log('Router available:', !!this.$router)

      // Load initial data
      await Promise.all([
        this.loadFeaturedArticles(),
        this.loadCategories()
      ])
    },

    beforeUnmount() {
      // Cleanup
      document.body.style.overflow = ''
    }
  }
  </script>

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

  .user-info:hover .user-dropdown {
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

  /* Hero Section */
  .hero-section {
    position: relative;
    background: linear-gradient(135deg, #16a34a 0%, #15803d 50%, #166534 100%);
    color: white;
    padding: 4rem 1rem 1rem;
    min-height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    margin-top: 40px; /* Account for fixed header */
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
    max-width: 800px;
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
    margin-bottom: 2rem;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .logo-container {
    margin-bottom: 2rem;
  }

  .tree-illustration {
    margin-bottom: 1.5rem;
  }

  .tree-svg {
    width: 120px;
    height: 90px;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  }

  .company-name {
    font-size: 4rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    margin: 0;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }

  .welcome-title {
    font-size: 2.5rem;
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: 1.5rem;
  }

  .highlight {
    color: #86efac;
  }

  .welcome-description {
    font-size: 1.25rem;
    color: #d1fae5;
    max-width: 600px;
    margin: 0 auto 3rem;
    line-height: 1.6;
  }

  .feature-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;
    max-width: 700px;
    margin-left: auto;
    margin-right: auto;
  }

  .feature-card {
    background: rgba(22, 163, 74, 0.3);
    border-radius: 1rem;
    padding: 2rem 1.5rem;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
  }

  .feature-card:hover {
    transform: translateY(-5px);
    background: rgba(22, 163, 74, 0.4);
  }

  .feature-icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  .feature-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .feature-desc {
    color: #d1fae5;
    font-size: 0.95rem;
  }

  .cta-button {
    display: inline-flex;
    align-items: center;
    padding: 1rem 2rem;
    background: white;
    color: #15803d;
    font-weight: 600;
    border-radius: 0.75rem;
    text-decoration: none;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .cta-button:hover {
    background: #f0fdf4;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  }

  .cta-arrow {
    width: 1.25rem;
    height: 1.25rem;
    margin-left: 0.5rem;
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

  .categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1.5rem;
  }

  .category-card {
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

    .company-name {
      font-size: 3rem;
    }

    .welcome-title {
      font-size: 2rem;
    }

    .welcome-description {
      font-size: 1.125rem;
    }

    .feature-cards {
      grid-template-columns: 1fr;
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

    .categories-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .hero-section {
      padding: 6rem 1rem 4rem;
    }
  }

  @media (max-width: 480px) {
    .hero-section {
      padding: 5rem 1rem 3rem;
    }

    .company-name {
      font-size: 2.5rem;
    }

    .welcome-title {
      font-size: 1.75rem;
    }

    .categories-grid {
      grid-template-columns: 1fr;
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
  }
  </style>
