import axios from 'axios'
import { dispatch } from '@/store'
import { ElMessage, ElMessageBox } from 'element-plus'

const service = axios.create({
  baseURL: import.meta.env.VITE_BASE_API || 'http://127.0.0.1:8000/api/v1',
  timeout: 5000
})

// request interceptor
service.interceptors.request.use(
  config => {
    const token = dispatch.user.getToken()
    if (token) {
      // jika backend pakai Bearer token
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// response interceptor
service.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code && res.code !== 20000) {
      ElMessage({
        message: res.message || 'Error',
        type: 'error',
        duration: 5000
      })

      // jika token invalid / expired
      if ([50008, 50012, 50014].includes(res.code)) {
        ElMessageBox.confirm(
          'You have been logged out, you can cancel to stay on this page, or log in again',
          'Confirm logout', {
            confirmButtonText: 'Re-Login',
            cancelButtonText: 'Cancel',
            type: 'warning'
          }
        ).then(() => {
          dispatch.user.removeToken()
          location.reload()
        })
      }
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    ElMessage({
      message: error.message,
      type: 'error',
      duration: 5000
    })
    return Promise.reject(error)
  }
)

export default service
