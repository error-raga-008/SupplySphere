import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
  headers: { 'Content-Type': 'application/json' },
})

// Set auth header immediately on load (handles page refresh)
const storedToken = localStorage.getItem('ss_access')
if (storedToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
}

// Auto-refresh access token on 401, then retry original request
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('ss_refresh')
      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${api.defaults.baseURL}/auth/token/refresh/`,
            { refresh: refreshToken },
            { headers: { 'Content-Type': 'application/json' } }
          )
          localStorage.setItem('ss_access', data.access)
          if (data.refresh) localStorage.setItem('ss_refresh', data.refresh)
          if (data.user) localStorage.setItem('ss_user', JSON.stringify(data.user))
          if (data.permissions) localStorage.setItem('ss_permissions', JSON.stringify(data.permissions))
          api.defaults.headers.common['Authorization'] = `Bearer ${data.access}`
          originalRequest.headers['Authorization'] = `Bearer ${data.access}`
          return api(originalRequest)
        } catch {
          localStorage.removeItem('ss_access')
          localStorage.removeItem('ss_refresh')
          localStorage.removeItem('ss_user')
          localStorage.removeItem('ss_permissions')
          delete api.defaults.headers.common['Authorization']
          window.location.href = '/login'
        }
      } else {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
