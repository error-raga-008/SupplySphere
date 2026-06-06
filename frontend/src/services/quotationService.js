import api from './api'

export const listQuotations = (params = {}) => api.get('/quotations/', { params })
export const getQuotation = (id) => api.get(`/quotations/${id}/`)
export const createQuotation = (data) => api.post('/quotations/', data)
export const submitQuotation = (id) => api.patch(`/quotations/${id}/submit/`)
export const acceptQuotation = (id) => api.patch(`/quotations/${id}/accept/`)
export const rejectQuotation = (id) => api.patch(`/quotations/${id}/reject/`)

export default { listQuotations, getQuotation, createQuotation, submitQuotation, acceptQuotation, rejectQuotation }
