import { useState } from 'react'
import * as authApi from '../../api/authApi'
import { useAsync } from '../../hooks/useForm'
import { Button, Alert, OtpInput } from '../ui'

// ============================================================
// TotpDisable – Tắt 2FA
// POST /api/auth/disable-2fa?code=123456
// Yêu cầu xác nhận mã TOTP hiện tại trước khi tắt
// ============================================================
export default function TotpDisable({ onDone, onCancel }) {
  const [otpCode, setOtpCode] = useState('')
  const { loading, error, success, setError, setSuccess, run } = useAsync()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (otpCode.length !== 6) {
      setError('Vui lòng nhập đủ 6 chữ số')
      return
    }

    await run(async () => {
      await authApi.disable2FA(parseInt(otpCode, 10))
      setSuccess('Đã tắt 2FA thành công.')
      setTimeout(onDone, 1500)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
        <span className="text-xl mt-0.5">⚠️</span>
        <div>
          <p className="text-sm font-medium text-yellow-800">Cảnh báo bảo mật</p>
          <p className="text-xs text-yellow-700 mt-0.5">
            Tắt 2FA sẽ làm giảm mức độ bảo vệ tài khoản. Hãy chắc chắn bạn hiểu rủi ro này.
          </p>
        </div>
      </div>

      <div>
        <p className="text-sm text-gray-600 mb-3">
          Nhập mã hiện tại từ Google Authenticator để xác nhận:
        </p>
        <OtpInput value={otpCode} onChange={setOtpCode} />
      </div>

      <Alert type="error"   message={error} />
      <Alert type="success" message={success} />

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onCancel} className="flex-1">
          Huỷ
        </Button>
        <Button
          type="submit"
          loading={loading}
          disabled={otpCode.length !== 6}
          className="flex-1 !bg-red-600 hover:!bg-red-700 focus:!ring-red-500"
        >
          Xác nhận tắt 2FA
        </Button>
      </div>
    </form>
  )
}
