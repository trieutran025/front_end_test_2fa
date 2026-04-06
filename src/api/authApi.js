import api from './axiosInstance'

// -------------------------------------------------------
// POST /api/auth/register
// Body: { username, email, password, confirmPassword }
// Returns: string message
// -------------------------------------------------------
export const register = (data) =>
  api.post('/auth/register', data).then((r) => r.data)

// -------------------------------------------------------
// POST /api/auth/login
// Body: { username, password }
// Returns: AuthenticationResponse
//   - No 2FA:  { authenticated, access_token, refresh_token, message }
//   - Has 2FA: { requires_2fa: true, temp_token, message }
// -------------------------------------------------------
export const login = (data) =>
  api.post('/auth/login', data).then((r) => r.data)

// -------------------------------------------------------
// POST /api/auth/verify-2fa
// Body: { tempToken, code }
// Returns: AuthenticationResponse (full JWT)
// -------------------------------------------------------
export const verify2FA = (data) =>
  api.post('/auth/verify-2fa', data).then((r) => r.data)

// -------------------------------------------------------
// POST /api/auth/logout   (requires Bearer token)
// Returns: string "Dang xuat thanh cong"
// -------------------------------------------------------
export const logout = () =>
  api.post('/auth/logout').then((r) => r.data)

// -------------------------------------------------------
// POST /api/auth/setup-2fa  (requires Bearer)
// Returns: { secretKey, qrCodeUri, issuer }
// -------------------------------------------------------
export const setup2FA = () =>
  api.post('/auth/setup-2fa').then((r) => r.data)

// -------------------------------------------------------
// POST /api/auth/enable-2fa?code=123456  (requires Bearer)
// -------------------------------------------------------
export const enable2FA = (code) =>
  api.post(`/auth/enable-2fa?code=${code}`).then((r) => r.data)

// -------------------------------------------------------
// POST /api/auth/disable-2fa?code=123456  (requires Bearer)
// -------------------------------------------------------
export const disable2FA = (code) =>
  api.post(`/auth/disable-2fa?code=${code}`).then((r) => r.data)

// -------------------------------------------------------
// POST /api/auth/change-password  (requires Bearer)
// Body: { oldPassword, newPassword, confirmNewPassword }
// -------------------------------------------------------
export const changePassword = (data) =>
  api.post('/auth/change-password', data).then((r) => r.data)
