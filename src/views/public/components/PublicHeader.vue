<!-- PublicHeader.vue -->
<!-- Lokasi: src/components/PublicHeader.vue -->
<template>
  <header class="page-header">
    <div class="header-container">
      <div class="header-logo">
        <router-link to="/" class="logo-link">
          <img
            src="@/assets/images/logo_kb_no_text.png"
            alt="Wismilak Logo"
            class="company-logo"
          />
          <div class="company-text">
            <span class="company-name-header">WISMILAK</span>
            <span class="company-subtitle">Knowledge Base</span>
          </div>
        </router-link>
      </div>

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
                <el-dropdown-item command="profile">
                  👤 Profil
                </el-dropdown-item>
                <el-dropdown-item command="dashboard">
                  🏛️ Admin Dashboard
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided>
                  🚪 Logout
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <button v-else @click="openLoginModal" class="login-button">
          Login
        </button>
      </div>
    </div>

    <!-- Login Modal -->
    <Login v-model="showLoginModal" />
  </header>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { dispatch, ctx } from '@/store'
import { logout } from '@/api/user'
import { ElMessage } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import Login from '@/views/public/components/Login.vue'

const router = useRouter()

// State
const showLoginModal = ref(false)

// Auth State - Menggunakan computed untuk reactive
const isAuthenticated = computed(() => {
  const token = dispatch.user.getToken()
  const userInfo = ctx.userInfo
  console.log('🔍 Auth Check - Token:', token ? 'exists' : 'not found')
  console.log('🔍 Auth Check - User:', userInfo)
  return !!token && !!userInfo
})

const user = computed(() => ctx.userInfo || {})

// Methods
const openLoginModal = () => {
  showLoginModal.value = true
}

// Handle dropdown commands
const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile/me')
      break
    case 'dashboard':
      router.push('/admin/dashboard')
      break
    case 'logout':
      handleLogout()
      break
  }
}

// Logout handler - FIXED
const handleLogout = async () => {
  try {
    console.log('🔄 Starting logout process...')

    // 1. Call logout API
    await logout()

    // 2. Clear localStorage - CRITICAL
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.clear() // Clear everything to be safe

    // 3. Clear store
    dispatch.user.removeToken()
    dispatch.user.removeInfo()

    // 4. Clear session storage (if any)
    sessionStorage.clear()

    console.log(' Logout successful')
    console.log('Token after logout:', localStorage.getItem('token'))
    console.log('User after logout:', localStorage.getItem('user'))

    ElMessage.success('Berhasil logout')

    // 5. Redirect to home with full reload
    setTimeout(() => {
      // Force full page reload to clear all state
      window.location.href = '/'
    }, 300)
  } catch (error) {
    console.error('❌ Logout error:', error)

    // Even if API fails, clear ALL local data
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.clear()
    sessionStorage.clear()
    dispatch.user.removeToken()
    dispatch.user.removeInfo()

    ElMessage.warning('Logout berhasil (data lokal telah dihapus)')

    // Force full page reload
    setTimeout(() => {
      window.location.href = '/'
    }, 300)
  }
}
</script>

<style scoped>
/* Header Styles */
.page-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-logo .logo-link {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
}

.company-logo {
  width: 45px;
  height: 45px;
  object-fit: contain;
}

.company-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  line-height: 1.1;
}

.company-name-header {
  font-size: 1.25rem;
  font-weight: 800;
  color: #16a34a;
  letter-spacing: 0.05em;
}

.company-subtitle {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.header-actions {
  display: flex;
  align-items: center;
}

.user-menu {
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: background 0.2s;
}

.user-info:hover {
  background: #f9fafb;
}

.user-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e7eb;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
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
  box-shadow: 0 4px 8px rgba(22, 163, 74, 0.3);
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-container {
    flex-wrap: wrap;
    gap: 1rem;
  }

  .company-name-header {
    font-size: 1.1rem;
  }

  .company-logo {
    width: 35px;
    height: 35px;
  }

  .user-name {
    display: none;
  }
}

@media (max-width: 480px) {
  .header-container {
    padding: 0.75rem;
  }

  .company-name-header {
    font-size: 1rem;
  }

  .company-subtitle {
    font-size: 0.7rem;
  }
}
</style>
