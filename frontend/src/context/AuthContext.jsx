import React, { createContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('ss_user') || 'null'))
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('ss_access') || null)
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('ss_refresh') || null)

  useEffect(() => {
    if (accessToken) api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
    else delete api.defaults.headers.common['Authorization']
  }, [accessToken])

  const login = ({ access, refresh, user }) => {
    setAccessToken(access)
    setRefreshToken(refresh)
    setUser(user)
    localStorage.setItem('ss_access', access)
    localStorage.setItem('ss_refresh', refresh)
    localStorage.setItem('ss_user', JSON.stringify(user))
  }

  const logout = () => {
    setAccessToken(null)
    setRefreshToken(null)
    setUser(null)
    localStorage.removeItem('ss_access')
    localStorage.removeItem('ss_refresh')
    localStorage.removeItem('ss_user')
    delete api.defaults.headers.common['Authorization']
  }

  const isAuthenticated = !!user && !!accessToken

  return (
    <AuthContext.Provider value={{ user, accessToken, refreshToken, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
