import { createContext, useContext, useState, useCallback } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getCurrentUser())
  const [loading, setLoading] = useState(false)

  const login = useCallback(async (email, password) => {
    setLoading(true)
    try {
      const u = await authService.login(email, password)
      setUser(u)
      return u
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (data) => {
    setLoading(true)
    try {
      return await authService.register(data)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
