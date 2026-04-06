import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import * as authApi from '../../api/authApi'
import { useAsync } from '../../hooks/useForm'
import { Button, Alert, OtpInput } from '../ui'

// ============================================================
// TotpSetup – Hướng dẫn bật 2FA
//   Bước 1: Gọi POST /api/auth/setup-2fa → nhận secretKey + qrCodeUri
//   Bước 2: Hiển thị QR code để user quet bằng Google Authenticator
//   Bước 3: User nhập mã 6 số → POST /api/auth/enable-2fa?code=...
// ============================================================
export default function TotpSetup({ onDone, onCancel }) {
  const [step, setStep] = useState(1)   // 1 = hiện QR, 2 = nhập mã xác nhận
  const [setupData, setSetupData] = useState(null)   // { secretKey, qrCodeUri, issuer }
  const [qrDataUrl, setQrDataUrl] = useState('')     // base64 image
  const [otpCode, setOtpCode] = useState('')
  const [copiedSecret, setCopiedSecret] = useState(false)

  const fetchAsync = useAsync()
  const confirmAsync = useAsync()

  // Gọi API lấy QR khi component mount
  useEffect(() => {
    fetchAsync.run(async () => {
      const data = await authApi.setup2FA()
      setSetupData(data)
      // Chuyển otpauth:// URI thành QR code ảnh base64
      const url = await QRCode.toDataURL(data.qrCodeUri, {
        width: 220,
        margin: 2,
        color: { dark: '#1e1b4b', light: '#ffffff' },
      })
      setQrDataUrl(url)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCopySecret = () => {
    navigator.clipboard.writeText(setupData.secretKey)
    setCopiedSecret(true)
    setTimeout(() => setCopiedSecret(false), 2000)
  }

  const handleConfirm = async (e) => {
    e.preventDefault()
    if (otpCode.length !== 6) {
      confirmAsync.setError('Vui lòng nhập đủ 6 chữ số')
      return
    }
    await confirmAsync.run(async () => {
      await authApi.enable2FA(parseInt(otpCode, 10))
      confirmAsync.setSuccess('Bật 2FA thành công! Tài khoản của bạn đã được bảo vệ.')
      setTimeout(onDone, 1500)
    })
  }

  // ── Loading ban đầu ──────────────────────────────────────
  if (fetchAsync.loading) {
    return (
      <div className="text-center py-10 text-gray-400">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm">Đang tạo mã QR...</p>
      </div>
    )
  }

  if (fetchAsync.error) {
    return (
      <div className="space-y-4">
        <Alert type="error" message={fetchAsync.error} />
        <Button variant="secondary" onClick={onCancel}>Đóng</Button>
      </div>
    )
  }

  // ── Bước 1: Hiển thị QR ─────────────────────────────────
  if (step === 1) {
    return (
      <div className="space-y-5">
        <div>
          <h4 className="font-semibold text-gray-800 mb-1">Bước 1: Quét mã QR</h4>
          <p className="text-sm text-gray-500">
            Mở ứng dụng <strong>Google Authenticator</strong> trên điện thoại, chọn{' '}
            <em>Thêm tài khoản</em> → <em>Quét mã QR</em>.
          </p>
        </div>

        {qrDataUrl && (
          <div className="flex justify-center">
            <div className="p-3 bg-white border-2 border-gray-200 rounded-2xl shadow-sm">
              <img src={qrDataUrl} alt="QR Code 2FA" className="w-52 h-52" />
            </div>
          </div>
        )}

        {/* Hiển thị secret key để nhập thủ công nếu không quet được */}
        {setupData?.secretKey && (
          <div>
            <p className="text-xs text-gray-500 mb-1">
              Không quét được? Nhập khóa này vào app:
            </p>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              <code className="flex-1 text-xs font-mono text-gray-700 break-all">
                {setupData.secretKey}
              </code>
              <button
                onClick={handleCopySecret}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium shrink-0"
              >
                {copiedSecret ? '✓ Đã sao chép' : 'Sao chép'}
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="secondary" onClick={onCancel} className="flex-1">
            Huỷ
          </Button>
          <Button onClick={() => setStep(2)} className="flex-1">
            Tiếp theo →
          </Button>
        </div>
      </div>
    )
  }

  // ── Bước 2: Nhập mã xác nhận ────────────────────────────
  return (
    <form onSubmit={handleConfirm} className="space-y-5">
      <div>
        <h4 className="font-semibold text-gray-800 mb-1">Bước 2: Xác nhận mã</h4>
        <p className="text-sm text-gray-500">
          Nhập mã 6 chữ số hiện tại trong Google Authenticator để xác nhận thiết lập.
        </p>
      </div>

      <OtpInput value={otpCode} onChange={setOtpCode} />

      <Alert type="error"   message={confirmAsync.error} />
      <Alert type="success" message={confirmAsync.success} />

      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">
          ← Quay lại
        </Button>
        <Button
          type="submit"
          loading={confirmAsync.loading}
          disabled={otpCode.length !== 6}
          className="flex-1"
        >
          Xác nhận bật 2FA
        </Button>
      </div>
    </form>
  )
}
