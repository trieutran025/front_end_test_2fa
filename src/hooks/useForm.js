import { useState, useCallback } from 'react'

// ============================================================
// useForm – quản lý form state, tránh lỗi "controlled input"
// Tất cả field khởi tạo bằng chuỗi rỗng ''
// ============================================================
export const useForm = (initialValues) => {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
    // Xóa lỗi khi user bắt đầu sửa
    setErrors((prev) => {
      if (!prev[name]) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
  }, [])

  const handleBlur = useCallback((e) => {
    const { name } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
  }, [])

  const setFieldError = useCallback((field, msg) => {
    setErrors((prev) => ({ ...prev, [field]: msg }))
  }, [])

  const setServerErrors = useCallback((fieldErrors) => {
    if (!fieldErrors) return
    setErrors((prev) => ({ ...prev, ...fieldErrors }))
  }, [])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldError,
    setServerErrors,
    setErrors,
    reset,
  }
}

// ============================================================
// useAsync – chạy async action với loading/error state
// ============================================================
export const useAsync = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const run = useCallback(async (asyncFn) => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const result = await asyncFn()
      return result
    } catch (err) {
      setError(err.userMessage || err.message || 'Đã có lỗi xảy ra')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, error, success, setError, setSuccess, run }
}
