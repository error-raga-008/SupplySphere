import api from './api'

export const listNotifications = () => api.get('/notifications/')

export const markAsRead = (id) => api.patch(`/notifications/${id}/read/`)

export const markAllAsRead = () => api.post('/notifications/mark-all-read/')

export default { listNotifications, markAsRead, markAllAsRead }
