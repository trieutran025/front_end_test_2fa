import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as authApi from '../api/authApi'
import { useForm, useAsync } from '../hooks/useForm'
import { Input, Button, Alert, PasswordStrength } from '../components/ui'

// Regex khớp với @Pattern backend
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/

// ============================================================
// RegisterPage
// POST /api/auth/register
// Body: { username, email, password, confirmPassword }
// ============================================================
export default function RegisterPage() {
  const navigate = useNavigate()
  const [showPwStrength, setShowPwStrength] = useState(false)

  // Tất cả field khởi tạo '' – tránh "controlled input" warning
  const {
    values, errors, touched,
    handleChange, handleBlur,
    setErrors, setServerErrors,
  } = useForm({
    username:        '',
    email:           '',
    password:        '',
    confirmPassword: '',
  })

  const { loading, error, success, setSuccess, run } = useAsync()

  // Client-side validation trước khi gửi API
  const validate = () => {
    const errs = {}
    if (!values.username.trim()) {
      errs.username = 'Username không được để trống'
    } else if (values.username.length < 3 || values.username.length > 50) {
      errs.username = 'Username từ 3 đến 50 ký tự'
    } else if (!USERNAME_REGEX.test(values.username)) {
      errs.username = 'Username chỉ chứa chữ, số và gạch dưới'
    }

    if (!values.email.trim()) {
      errs.email = 'Email không được để trống'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errs.email = 'Email không hợp lệ'
    }

    if (!values.password) {
      errs.password = 'Mật khẩu không được để trống'
    } else if (!PASSWORD_REGEX.test(values.password)) {
      errs.password = 'Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt'
    }

    if (!values.confirmPassword) {
      errs.confirmPassword = 'Vui lòng xác nhận mật khẩu'
    } else if (values.password !== values.confirmPassword) {
      errs.confirmPassword = 'Mật khẩu xác nhận không khớp'
    }

    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    await run(async () => {
      const msg = await authApi.register(values)
      setSuccess(msg || 'Đăng ký thành công! Đang chuyển hướng...')
      setTimeout(() => navigate('/login'), 2000)
    }).catch((err) => {
      // Lỗi 400 fieldErrors từ @Valid backend
      if (err.fieldErrors) setServerErrors(err.fieldErrors)
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-indigo-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">U</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Tạo tài khoản</h1>
          <p className="text-sm text-gray-500 mt-1">Điền đầy đủ thông tin bên dưới</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            <Input
              label="Username"
              name="username"
              value={values.username}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.username && errors.username}
              placeholder="vd: nguyen_van_a"
              autoComplete="username"
              required
            />

            <Input
              label="Email"
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.email && errors.email}
              placeholder="vd: email@example.com"
              autoComplete="email"
              required
            />

            <div>
              <Input
                label="Mật khẩu"
                name="password"
                type="password"
                value={values.password}
                onChange={handleChange}
                onBlur={(e) => { handleBlur(e); setShowPwStrength(false) }}
                onFocus={() => setShowPwStrength(true)}
                error={touched.password && errors.password}
                placeholder="Tối thiểu 8 ký tự"
                autoComplete="new-password"
                required
              />
              {showPwStrength && <PasswordStrength password={values.password} />}
            </div>

            <Input
              label="Xác nhận mật khẩu"
              name="confirmPassword"
              type="password"
              value={values.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.confirmPassword && errors.confirmPassword}
              placeholder="Nhập lại mật khẩu"
              autoComplete="new-password"
              required
            />

            <Alert type="error"   message={error} />
            <Alert type="success" message={success} />

            <Button type="submit" loading={loading}>
              Đăng ký
            </Button>

            <p className="text-center text-sm text-gray-600">
              Đã có tài khoản?{' '}
              <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
                Đăng nhập
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
