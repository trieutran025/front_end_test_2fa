// ============================================================
// Reusable UI primitives
// ============================================================

// ---------- Input ----------
export const Input = ({
  label, name, type = 'text', value, onChange, onBlur,
  error, placeholder, disabled, autoComplete, required,
}) => (
  <div>
    {label && (
      <label htmlFor={name} className="label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <input
      id={name}
      name={name}
      type={type}
      value={value}        // value luôn là string → không bao giờ undefined
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled}
      autoComplete={autoComplete}
      className={`input-field ${error ? 'input-error' : ''}`}
    />
    {error && <p className="error-text">{error}</p>}
  </div>
)

// ---------- Button ----------
export const Button = ({
  children, type = 'button', variant = 'primary',
  loading = false, disabled = false, onClick, className = '',
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled || loading}
    className={`${variant === 'primary' ? 'btn-primary' : 'btn-secondary'} ${className}`}
  >
    {loading ? (
      <span className="flex items-center gap-2">
        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        Đang xử lý...
      </span>
    ) : children}
  </button>
)

// ---------- Alert ----------
export const Alert = ({ type = 'error', message }) => {
  if (!message) return null
  const styles = {
    error:   'bg-red-50 border-red-300 text-red-700',
    success: 'bg-green-50 border-green-300 text-green-700',
    info:    'bg-blue-50 border-blue-300 text-blue-700',
    warning: 'bg-yellow-50 border-yellow-300 text-yellow-700',
  }
  const icons = {
    error:   '✕',
    success: '✓',
    info:    'ℹ',
    warning: '⚠',
  }
  return (
    <div className={`flex items-start gap-2 px-4 py-3 rounded-lg border text-sm ${styles[type]}`}>
      <span className="font-bold mt-0.5">{icons[type]}</span>
      <span>{message}</span>
    </div>
  )
}

// ---------- Divider ----------
export const Divider = ({ text = '' }) => (
  <div className="relative my-4">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-gray-200" />
    </div>
    {text && (
      <div className="relative flex justify-center text-xs">
        <span className="bg-white px-3 text-gray-400">{text}</span>
      </div>
    )}
  </div>
)

// ---------- OTP Input 6 ô ----------
export const OtpInput = ({ value, onChange }) => {
  const digits = (value + '      ').slice(0, 6).split('')

  const handleKey = (e, idx) => {
    const { key } = e
    if (key === 'Backspace') {
      const arr = value.split('')
      arr[idx] = ''
      onChange(arr.join('').trimEnd())
      if (idx > 0) document.getElementById(`otp-${idx - 1}`)?.focus()
      return
    }
    if (/^\d$/.test(key)) {
      const arr = (value + '      ').slice(0, 6).split('')
      arr[idx] = key
      const next = arr.join('').replace(/ /g, '')
      onChange(next)
      if (idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus()
    }
  }

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(paste)
    document.getElementById(`otp-${Math.min(paste.length, 5)}`)?.focus()
    e.preventDefault()
  }

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          id={`otp-${i}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d.trim()}
          onChange={() => {}}   // controlled – onChange qua handleKey
          onKeyDown={(e) => handleKey(e, i)}
          onPaste={handlePaste}
          className="w-11 h-12 text-center text-lg font-bold border-2 rounded-lg
                     border-gray-300 focus:border-primary-500 focus:outline-none
                     focus:ring-2 focus:ring-primary-200 transition-colors"
        />
      ))}
    </div>
  )
}

// ---------- PasswordStrength ----------
export const PasswordStrength = ({ password }) => {
  if (!password) return null
  const checks = [
    { label: 'Tối thiểu 8 ký tự', ok: password.length >= 8 },
    { label: 'Có chữ hoa', ok: /[A-Z]/.test(password) },
    { label: 'Có chữ thường', ok: /[a-z]/.test(password) },
    { label: 'Có số', ok: /\d/.test(password) },
    { label: 'Có ký tự đặc biệt', ok: /[@$!%*?&]/.test(password) },
  ]
  const score = checks.filter((c) => c.ok).length
  const colors = ['bg-red-400', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-green-500']
  const labels = ['', 'Rất yếu', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh']

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors duration-300
              ${score >= s ? colors[score] : 'bg-gray-200'}`}
          />
        ))}
      </div>
      {score > 0 && (
        <p className={`text-xs font-medium ${score <= 2 ? 'text-red-500' : score <= 3 ? 'text-yellow-600' : 'text-green-600'}`}>
          {labels[score]}
        </p>
      )}
      <ul className="text-xs text-gray-500 space-y-0.5">
        {checks.map((c) => (
          <li key={c.label} className={`flex items-center gap-1 ${c.ok ? 'text-green-600' : ''}`}>
            <span>{c.ok ? '✓' : '○'}</span> {c.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
