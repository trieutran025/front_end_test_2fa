import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// Bảo vệ route – chuyển hướng về /login nếu chưa đăng nhập
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-gray-400">Đang kiểm tra phiên đăng nhập...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}
