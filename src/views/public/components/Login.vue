<!-- LoginModal.vue -->
<template>
  <div v-if="modelValue" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">Login ke WISMILAK Knowledge Base</h3>
        <button @click="closeModal" class="modal-close">
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

          <button type="submit" class="submit-button" :disabled="loading">
            <span v-if="loading" class="loading-spinner"></span>
            {{ loading ? 'Memproses...' : 'Login' }}
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
</template>

<script setup>
import { reactive, ref, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { login } from '@/api/user'
import { dispatch } from '@/store'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const passwordType = ref('password')
const formDom = ref()
const passwordDom = ref(null)

const loginForm = reactive({
  email: 'budi@example.com',
  password: 'password123',
  remember: false
})

// Validation Functions
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

// Methods
const showPwd = async () => {
  if (passwordType.value === 'password') {
    passwordType.value = ''
  } else {
    passwordType.value = 'password'
  }
  await nextTick()
  passwordDom.value.focus()
}

const closeModal = () => {
  emit('update:modelValue', false)
}

const handleLogin = () => {
  formDom.value.validate((valid) => {
    if (valid) {
      loading.value = true
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

          closeModal()
          loading.value = false

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
          loading.value = false
          ElMessage.error(error.response?.data?.message || 'Login gagal')
        })
    } else {
      console.log('error submit!!')
      return false
    }
  })
}

const showRegisterForm = () => {
  alert('Fitur registrasi akan segera hadir!')
}
</script>

<style lang="scss" scoped>
$bg: #283443;
$light_gray: #fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

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

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
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

@media (max-width: 480px) {
  .modal-content {
    margin: 0.5rem;
  }
}
</style>
