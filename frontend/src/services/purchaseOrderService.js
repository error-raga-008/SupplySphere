import api from './api'

export const listPOs = (params = {}) => api.get('/purchase-orders/', { params })
export const getPO = (id) => api.get(`/purchase-orders/${id}/`)
export const createPO = (data) => api.post('/purchase-orders/', data)
export const issuePO = (id) => api.patch(`/purchase-orders/${id}/issue/`)
export const cancelPO = (id) => api.patch(`/purchase-orders/${id}/cancel/`)

export default { listPOs, getPO, createPO, issuePO, cancelPO }
