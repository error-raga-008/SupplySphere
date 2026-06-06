import api from './api'

export const authService = {
  async login(email, password) {
    const res = await api.post('/auth/login/', { email, password })
    const { access, refresh, user } = res.data
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
    localStorage.setItem('user', JSON.stringify(user))
    return user
  },

  async register(data) {
    const res = await api.post('/auth/register/', data)
    return res.data
  },

  async forgotPassword(email) {
    const res = await api.post('/auth/forgot-password/', { email })
    return res.data
  },

  logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
  },

  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem('user'))
    } catch {
      return null
    }
  },

  isAuthenticated() {
    return !!localStorage.getItem('access_token')
  },
}
