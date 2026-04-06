import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { clearTokens } from '../api/axiosInstance'
import * as authApi from '../api/authApi'

// ============================================================
// AuthContext – quản lý trạng thái đăng nhập toàn cục
// ============================================================
const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  // null = chưa biết, object = đã đăng nhập, false = chưa đăng nhập
  const [user, setUser] = useState(null)

  // State trung gian: đang chờ nhập mã TOTP
  // { tempToken: string }
  const [pendingTwoFA, setPendingTwoFA] = useState(null)

  const [loading, setLoading] = useState(true)  // khởi tạo app

  // Khởi tạo: kiểm tra token còn trong localStorage không
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      // Có token → coi như đã đăng nhập (interceptor tự refresh nếu hết hạn)
      // Có thể gọi GET /api/users/me ở đây nếu backend có endpoint đó
      setUser({ token })
    } else {
      setUser(false)
    }
    setLoading(false)
  }, [])

  // -------------------------------------------------------
  // loginStep1: gửi username + password
  // Trả về: { requiresTwoFA: bool }
  // -------------------------------------------------------
  const loginStep1 = useCallback(async ({ username, password }) => {
    const data = await authApi.login({ username, password })

    if (data.requires_2fa) {
      // Lưu tempToken để dùng ở bước 2
      setPendingTwoFA({ tempToken: data.temp_token })
      return { requiresTwoFA: true }
    }

    // Đăng nhập thành công không cần 2FA
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    setUser({ token: data.access_token })
    return { requiresTwoFA: false }
  }, [])

  // -------------------------------------------------------
  // loginStep2: gửi tempToken + mã TOTP 6 số
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
  }, [pendingTwoFA])

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
    }
  }, [])

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
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook tắt gọn
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth phải dùng bên trong AuthProvider')
  return ctx
}
