import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)))
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    // 1. Chuẩn hóa message lỗi (luôn thực hiện trước)
    error.userMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      (typeof error.response?.data === 'string' ? error.response.data : null) ||
      error.message ||
      'Đã có lỗi xảy ra, vui lòng thử lại.'

    // 2. Map lỗi 400 fieldErrors
    if (error.response?.data?.fieldErrors) {
      error.fieldErrors = error.response.data.fieldErrors
    }

    // 3. Xử lý refresh token cho lỗi 401
    if (error.response?.status === 401 && !original._retry) {
      // Bỏ qua xử lý refresh cho endpoint đăng nhập
      if (original.url?.includes('/auth/login')) {
        return Promise.reject(error)
      }

      // Refresh token endpoint bị 401 -> thông báo hết hạn
      if (original.url?.includes('/auth/refresh-token')) {
        clearTokens()
        window.dispatchEvent(new CustomEvent('auth-token-expired', {
          detail: { message: error.userMessage }
        }))
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => failedQueue.push({ resolve, reject }))
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`
            return api(original)
          })
      }

      original._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) {
        clearTokens()
        window.dispatchEvent(new CustomEvent('auth-token-expired', {
          detail: { message: error.userMessage }
        }))
        return Promise.reject(error)
      }

      try {
        const { data } = await api.post(
          '/auth/refresh-token',
          {},
          { headers: { Authorization: `Bearer ${refreshToken}` } }
        )
        const newAccess = data.access_token
        localStorage.setItem('access_token', newAccess)
        if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token)
        processQueue(null, newAccess)
        original.headers.Authorization = `Bearer ${newAccess}`
        return api(original)
      } catch (e) {
        clearTokens()
        const msg = e.userMessage || error.userMessage || 'Phiên đăng nhập đã hết hạn'
        window.dispatchEvent(new CustomEvent('auth-token-expired', {
          detail: { message: msg }
        }))
        processQueue(e, null)
        return Promise.reject(e)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export const clearTokens = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

export default api
