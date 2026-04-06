import * as authApi from '../../api/authApi'
import { useForm, useAsync } from '../../hooks/useForm'
import { Input, Button, Alert, PasswordStrength } from '../ui'

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

// ============================================================
// ChangePasswordForm
// POST /api/auth/change-password
// Body: { oldPassword, newPassword, confirmNewPassword }
// ============================================================
export default function ChangePasswordForm({ onDone, onCancel }) {
  // Tất cả field khởi tạo '' – không bao giờ undefined
  const {
    values, errors, touched,
    handleChange, handleBlur,
    setErrors, setServerErrors,
  } = useForm({
    oldPassword:        '',
    newPassword:        '',
    confirmNewPassword: '',
  })

  const { loading, error, success, setSuccess, run } = useAsync()

  const validate = () => {
    const errs = {}
    if (!values.oldPassword) errs.oldPassword = 'Vui lòng nhập mật khẩu cũ'
    if (!values.newPassword) {
      errs.newPassword = 'Vui lòng nhập mật khẩu mới'
    } else if (!PASSWORD_REGEX.test(values.newPassword)) {
      errs.newPassword = 'Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt (@$!%*?&)'
    }
    if (!values.confirmNewPassword) {
      errs.confirmNewPassword = 'Vui lòng xác nhận mật khẩu mới'
    } else if (values.newPassword !== values.confirmNewPassword) {
      errs.confirmNewPassword = 'Mật khẩu xác nhận không khớp'
    }
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    await run(async () => {
      const data = await authApi.changePassword(values)
      setSuccess(data.message || 'Đổi mật khẩu thành công!')
      setTimeout(onDone, 1800)
    }).catch((err) => {
      if (err.fieldErrors) setServerErrors(err.fieldErrors)
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Input
        label="Mật khẩu hiện tại"
        name="oldPassword"
        type="password"
        value={values.oldPassword}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.oldPassword && errors.oldPassword}
        placeholder="Nhập mật khẩu hiện tại"
        autoComplete="current-password"
        required
      />

      <div>
        <Input
          label="Mật khẩu mới"
          name="newPassword"
          type="password"
          value={values.newPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.newPassword && errors.newPassword}
          placeholder="Tối thiểu 8 ký tự"
          autoComplete="new-password"
          required
        />
        <PasswordStrength password={values.newPassword} />
      </div>

      <Input
        label="Xác nhận mật khẩu mới"
        name="confirmNewPassword"
        type="password"
        value={values.confirmNewPassword}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.confirmNewPassword && errors.confirmNewPassword}
        placeholder="Nhập lại mật khẩu mới"
        autoComplete="new-password"
        required
      />

      <Alert type="error"   message={error} />
      <Alert type="success" message={success} />

      <div className="flex gap-3 pt-1">
        <Button variant="secondary" onClick={onCancel} className="flex-1">
          Huỷ
        </Button>
        <Button type="submit" loading={loading} className="flex-1">
          Đổi mật khẩu
        </Button>
      </div>
    </form>
  )
}
