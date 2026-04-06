import axios from 'axios'

// ============================================================
// Axios instance – base URL trỏ vào proxy Vite (/api -> :8080)
// ============================================================
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// ============================================================
// REQUEST INTERCEPTOR – tự động đính kèm access token
// ============================================================
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

// ============================================================
// RESPONSE INTERCEPTOR – xử lý 401 & tự động refresh token
// ============================================================
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

    // Lỗi 401 – thử refresh token (chỉ 1 lần, _retry tránh vòng lặp)
    if (error.response?.status === 401 && !original._retry) {

      // Chính endpoint refresh bị 401 → đăng xuất hẳn
      if (original.url?.includes('/auth/refresh-token')) {
        clearTokens()
        window.location.href = '/login'
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
        window.location.href = '/login'
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
        processQueue(e, null)
        clearTokens()
        window.location.href = '/login'
        return Promise.reject(e)
      } finally {
        isRefreshing = false
      }
    }

    // Chuẩn hoá message lỗi để component chỉ cần đọc error.userMessage
    error.userMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      (typeof error.response?.data === 'string' ? error.response.data : null) ||
      error.message ||
      'Đã có lỗi xảy ra, vui lòng thử lại.'

    // Map lỗi 400 fieldErrors (từ @Valid backend)
    if (error.response?.data?.fieldErrors) {
      error.fieldErrors = error.response.data.fieldErrors
    }

    return Promise.reject(error)
  }
)

export const clearTokens = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

export default api
