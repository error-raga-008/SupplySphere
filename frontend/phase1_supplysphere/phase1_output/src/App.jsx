import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ui/ProtectedRoute'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import './App.css'

// Placeholder — replaced in Phase 2 with real Dashboard
function DashboardPlaceholder() {
  const { logout, user } = useAuth()

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', gap: 16,
      fontFamily: 'var(--font)',
      background: 'var(--bg)',
    }}>
      <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#007dfc"/>
        <path d="M8 16L14 10L20 16L14 22L8 16Z" fill="white"/>
        <path d="M16 16L22 10L28 16L22 22L16 16Z" fill="white" opacity="0.6"/>
      </svg>
      <h1 style={{ color: 'var(--secondary)', fontSize: 28, fontFamily: 'var(--font)' }}>
        Welcome, {user?.first_name || 'User'} 👋
      </h1>
      <p style={{ color: 'var(--muted)', fontFamily: 'var(--font)' }}>
        Role: <strong>{user?.role}</strong> · Dashboard coming in Phase 2
      </p>
      <button
        onClick={logout}
        style={{
          padding: '10px 24px', background: 'var(--secondary)',
          color: '#fff', border: 'none', borderRadius: 10,
          cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 14,
        }}
      >
        Logout
      </button>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login"           element={<LoginPage />} />
          <Route path="/register"        element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPlaceholder />
              </ProtectedRoute>
            }
          />

          <Route path="/"  element={<Navigate to="/login" replace />} />
          <Route path="*"  element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
