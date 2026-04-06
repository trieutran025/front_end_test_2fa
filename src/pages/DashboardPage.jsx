import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useAsync } from '../hooks/useForm'
import { Button, Alert } from '../components/ui'
import TotpSetup from '../components/totp/TotpSetup'
import TotpDisable from '../components/totp/TotpDisable'
import ChangePasswordForm from '../components/auth/ChangePasswordForm'

// ============================================================
// DashboardPage – trang sau khi đăng nhập
// ============================================================
export default function DashboardPage() {
  const { logoutUser } = useAuth()
  const [view, setView] = useState('home') // 'home' | 'setup2fa' | 'disable2fa' | 'changepw'
  const { loading, run } = useAsync()

  const handleLogout = () => run(logoutUser)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">U</span>
          </div>
          <span className="font-semibold text-gray-800">UED Auth System</span>
        </div>
        <Button
          variant="secondary"
          loading={loading}
          onClick={handleLogout}
          className="w-auto px-5"
        >
          Đăng xuất
        </Button>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">

        {/* Welcome */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Xin chào! 👋</h2>
          <p className="text-gray-500 text-sm">Bạn đã đăng nhập thành công.</p>
        </div>

        {/* Bảo mật tài khoản */}
        <div className="card space-y-4">
          <h3 className="text-base font-semibold text-gray-800 border-b pb-3">Bảo mật tài khoản</h3>

          {/* Thiết lập 2FA */}
          {view === 'setup2fa' ? (
            <TotpSetup onDone={() => setView('home')} onCancel={() => setView('home')} />
          ) : view === 'disable2fa' ? (
            <TotpDisable onDone={() => setView('home')} onCancel={() => setView('home')} />
          ) : view === 'changepw' ? (
            <ChangePasswordForm onDone={() => setView('home')} onCancel={() => setView('home')} />
          ) : (
            <div className="space-y-3">
              {/* Card: 2FA */}
              <SecurityCard
                icon="🔐"
                title="Xác thực hai lớp (2FA)"
                description="Bảo vệ tài khoản bằng Google Authenticator"
                actions={[
                  { label: 'Bật 2FA', onClick: () => setView('setup2fa'), variant: 'primary' },
                  { label: 'Tắt 2FA', onClick: () => setView('disable2fa'), variant: 'secondary' },
                ]}
              />
              {/* Card: Đổi mật khẩu */}
              <SecurityCard
                icon="🔑"
                title="Đổi mật khẩu"
                description="Cập nhật mật khẩu định kỳ để tăng bảo mật"
                actions={[
                  { label: 'Đổi mật khẩu', onClick: () => setView('changepw'), variant: 'primary' },
                ]}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SecurityCard({ icon, title, description, actions }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-sm font-medium text-gray-800">{title}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      <div className="flex gap-2">
        {actions.map((a) => (
          <button
            key={a.label}
            onClick={a.onClick}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors
              ${a.variant === 'primary'
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'border border-gray-300 text-gray-600 hover:bg-gray-100'
              }`}
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  )
}
