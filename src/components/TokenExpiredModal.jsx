import { useAuth } from '../context/AuthContext'

const TokenExpiredModal = () => {
  const { expiredTokenMessage, clearExpiredTokenMessage } = useAuth()

  if (!expiredTokenMessage) return null

  const handleClose = () => {
    clearExpiredTokenMessage()
    window.location.href = '/login'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-[90%] shadow-xl">
        <h3 className="text-lg font-semibold mb-2">Phiên đăng nhập đã hết hạn</h3>
        <p className="text-gray-600 mb-4">{expiredTokenMessage}</p>
        <button
          onClick={handleClose}
          className="btn-primary w-full"
        >
          Đăng nhập lại
        </button>
      </div>
    </div>
  )
}

export default TokenExpiredModal
