import React, { createContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('ss_user') || 'null'))
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('ss_access') || null)
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('ss_refresh') || null)
  const [permissions, setPermissions] = useState(() => JSON.parse(localStorage.getItem('ss_permissions') || '[]'))

  useEffect(() => {
    if (accessToken) api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
    else delete api.defaults.headers.common['Authorization']
  }, [accessToken])

  const login = ({ access, refresh, user, permissions: grantedPermissions = [] }) => {
    const normalizedPermissions = Array.isArray(grantedPermissions) ? grantedPermissions : []
    const normalizedUser = user ? { ...user, permissions: normalizedPermissions } : null

    setAccessToken(access)
    setRefreshToken(refresh)
    setUser(normalizedUser)
    setPermissions(normalizedPermissions)
    localStorage.setItem('ss_access', access)
    localStorage.setItem('ss_refresh', refresh)
    localStorage.setItem('ss_user', JSON.stringify(normalizedUser))
    localStorage.setItem('ss_permissions', JSON.stringify(normalizedPermissions))
  }

  const logout = () => {
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

  const isAuthenticated = !!user && !!accessToken
  const hasPermission = (permission) => permissions.includes(permission)
  const hasAnyPermission = (requiredPermissions = []) =>
    requiredPermissions.length === 0 || requiredPermissions.some((permission) => permissions.includes(permission))

  return (
    <AuthContext.Provider value={{ user, permissions, accessToken, refreshToken, login, logout, isAuthenticated, hasPermission, hasAnyPermission }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
