import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useForm, useAsync } from '../hooks/useForm'
import { Input, Button, Alert, OtpInput } from '../components/ui'

// ============================================================
// LoginPage – xử lý 2 bước đăng nhập
//   Bước 1: username + password  → POST /api/auth/login
//   Bước 2: mã TOTP 6 số         → POST /api/auth/verify-2fa
// ============================================================
export default function LoginPage() {
  const navigate = useNavigate()
  const { loginStep1, loginStep2, pendingTwoFA, cancelTwoFA } = useAuth()

  // ── Bước 1 ──────────────────────────────────────────────
  // Khởi tạo bằng '' để tránh lỗi "controlled input"
  const { values, errors, touched, handleChange, handleBlur, setErrors } = useForm({
    username: '',
    password: '',
  })
  const step1Async = useAsync()

  const handleLoginSubmit = async (e) => {
    e.preventDefault()

    // Validate client-side trước
    const errs = {}
    if (!values.username.trim()) errs.username = 'Vui lòng nhập username'
    if (!values.password) errs.password = 'Vui lòng nhập mật khẩu'
    if (Object.keys(errs).length) { setErrors(errs); return }

    await step1Async.run(async () => {
      const result = await loginStep1(values)
      if (!result.requiresTwoFA) navigate('/dashboard')
      // Nếu requiresTwoFA = true → AuthContext đã set pendingTwoFA
      // → component tự re-render hiển thị bước 2
    })
  }

  // ── Bước 2 ──────────────────────────────────────────────
  const [otpCode, setOtpCode] = useState('')
  const step2Async = useAsync()

  const handleVerify2FA = async (e) => {
    e.preventDefault()
    if (otpCode.length !== 6) {
      step2Async.setError('Mã OTP phải đủ 6 chữ số')
      return
    }
    await step2Async.run(async () => {
      await loginStep2(otpCode)
      navigate('/dashboard')
    })
  }

  // ── Render bước 2 (TOTP) ──────────────────────────────
  if (pendingTwoFA) {
    return (
      <AuthLayout
        title="Xác thực hai lớp"
        subtitle="Nhập mã 6 chữ số từ Google Authenticator"
      >
        <form onSubmit={handleVerify2FA} className="space-y-6">
          <Alert type="info" message="Mã thay đổi mỗi 30 giây. Kiểm tra đồng hồ điện thoại." />

          <div className="space-y-2">
            <label className="label text-center block">Mã xác thực</label>
            <OtpInput value={otpCode} onChange={setOtpCode} />
          </div>

          <Alert type="error" message={step2Async.error} />

          <Button type="submit" loading={step2Async.loading} disabled={otpCode.length !== 6}>
            Xác nhận
          </Button>

          <button
            type="button"
            onClick={() => { setOtpCode(''); cancelTwoFA() }}
            className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Quay lại đăng nhập
          </button>
        </form>
      </AuthLayout>
    )
  }

  // ── Render bước 1 (username + password) ──────────────
  return (
    <AuthLayout title="Đăng nhập" subtitle="Chào mừng trở lại!">
      <form onSubmit={handleLoginSubmit} noValidate className="space-y-5">

        <Input
          label="Username hoặc Email"
          name="username"
          value={values.username}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.username && errors.username}
          placeholder="Nhập username hoặc email"
          autoComplete="username"
          required
        />

        <Input
          label="Mật khẩu"
          name="password"
          type="password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.password && errors.password}
          placeholder="Nhập mật khẩu"
          autoComplete="current-password"
          required
        />

        <Alert type="error" message={step1Async.error} />

        <Button type="submit" loading={step1Async.loading}>
          Đăng nhập
        </Button>

        <p className="text-center text-sm text-gray-600">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700">
            Đăng ký ngay
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}

// Layout wrapper dùng chung cho các trang auth
function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-indigo-100 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">U</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="card">{children}</div>
      </div>
    </div>
  )
}
