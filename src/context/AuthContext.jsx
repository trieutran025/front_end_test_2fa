import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { clearTokens } from '../api/axiosInstance'
import * as authApi from '../api/authApi'
import TokenExpiredModal from '../components/TokenExpiredModal'

// ============================================================
// AuthContext – quản lý trạng thái đăng nhập toàn cục
// ============================================================
const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [pendingTwoFA, setPendingTwoFA] = useState(null)
  const [expiredTokenMessage, setExpiredTokenMessage] = useState(null)
  const [loading, setLoading] = useState(true)

  // Lắng nghe sự kiện token hết hạn từ axios interceptor
  useEffect(() => {
    const handler = (e) => {
      setExpiredTokenMessage(e.detail.message)
      setUser(false) // Đặt user về chưa đăng nhập
    }
    window.addEventListener('auth-token-expired', handler)
    return () => window.removeEventListener('auth-token-expired', handler)
  }, [])

  // Khởi tạo: kiểm tra token còn trong localStorage không
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      setUser({ token })
    } else {
      setUser(false)
    }
    setLoading(false)
  }, [])

  const clearExpiredTokenMessage = useCallback(() => {
    setExpiredTokenMessage(null)
  }, [])

  // -------------------------------------------------------
  // loginStep1: gửi username + password
  // -------------------------------------------------------
  const loginStep1 = useCallback(async ({ username, password }) => {
    const data = await authApi.login({ username, password })

    if (data.requires_2fa) {
      setPendingTwoFA({ tempToken: data.temp_token })
      return { requiresTwoFA: true }
    }

    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    setUser({ token: data.access_token })
    clearExpiredTokenMessage()
    return { requiresTwoFA: false }
  }, [clearExpiredTokenMessage])

  // -------------------------------------------------------
  // loginStep2: gửi tempToken + mã TOTP
  // -------------------------------------------------------
  const loginStep2 = useCallback(async (code) => {
    if (!pendingTwoFA) throw new Error('Không có phiên xác thực 2FA')
    const data = await authApi.verify2FA({
      tempToken: pendingTwoFA.tempToken,
      code,
    })
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    setUser({ token: data.access_token })
    setPendingTwoFA(null)
    clearExpiredTokenMessage()
  }, [pendingTwoFA, clearExpiredTokenMessage])

  // -------------------------------------------------------
  // logout
  // -------------------------------------------------------
  const logoutUser = useCallback(async () => {
    try {
      await authApi.logout()
    } catch (_) {
      // Dù lỗi vẫn xóa local
    } finally {
      clearTokens()
      setUser(false)
      setPendingTwoFA(null)
      clearExpiredTokenMessage()
    }
  }, [clearExpiredTokenMessage])

  const cancelTwoFA = useCallback(() => setPendingTwoFA(null), [])

  const value = {
    user,
    loading,
    pendingTwoFA,
    isAuthenticated: !!user,
    loginStep1,
    loginStep2,
    logoutUser,
    cancelTwoFA,
    expiredTokenMessage,
    clearExpiredTokenMessage,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
      <TokenExpiredModal />
    </AuthContext.Provider>
  )
}

// Hook tắt gọn
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth phải dùng bên trong AuthProvider')
  return ctx
}
