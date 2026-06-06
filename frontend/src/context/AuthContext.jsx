import React, { createContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ss_user') || 'null') } catch { return null }
  })
  const [permissions, setPermissions] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ss_permissions') || '[]') } catch { return [] }
  })
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('ss_access') || null)
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('ss_refresh') || null)

  useEffect(() => {
    if (accessToken) api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
    else delete api.defaults.headers.common['Authorization']
  }, [accessToken])

  const login = ({ access, refresh, user: userData, permissions: perms = [] }) => {
    setAccessToken(access)
    setRefreshToken(refresh)
    setUser(userData)
    setPermissions(perms)
    localStorage.setItem('ss_access', access)
    localStorage.setItem('ss_refresh', refresh)
    localStorage.setItem('ss_user', JSON.stringify(userData))
    localStorage.setItem('ss_permissions', JSON.stringify(perms))
  }

  const logout = async () => {
    try {
      if (refreshToken) await api.post('/auth/logout/', { refresh: refreshToken })
    } catch {}
    setAccessToken(null)
    setRefreshToken(null)
    setUser(null)
    setPermissions([])
    localStorage.removeItem('ss_access')
    localStorage.removeItem('ss_refresh')
    localStorage.removeItem('ss_user')
    localStorage.removeItem('ss_permissions')
    delete api.defaults.headers.common['Authorization']
  }

  const hasPermission = (perm) => Array.isArray(permissions) && permissions.includes(perm)

  const isAuthenticated = !!user && !!accessToken

  return (
    <AuthContext.Provider value={{ user, accessToken, refreshToken, permissions, hasPermission, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
