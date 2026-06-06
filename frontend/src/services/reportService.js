import api from './api'

export const getAnalytics = () => api.get('/reports/analytics/')

export default { getAnalytics }
