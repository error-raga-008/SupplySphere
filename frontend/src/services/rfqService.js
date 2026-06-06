import api from './api'

export const listRFQs = (params = {}) => api.get('/rfqs/', { params })
export const getRFQ = (id) => api.get(`/rfqs/${id}/`)
export const createRFQ = (data) => api.post('/rfqs/', data)
export const updateRFQ = (id, data) => api.put(`/rfqs/${id}/`, data)
export const patchRFQ = (id, data) => api.patch(`/rfqs/${id}/`, data)
export const deleteRFQ = (id) => api.delete(`/rfqs/${id}/`)
export const publishRFQ = (id) => api.patch(`/rfqs/${id}/publish/`)
export const closeRFQ = (id) => api.patch(`/rfqs/${id}/close/`)
export const cancelRFQ = (id) => api.patch(`/rfqs/${id}/cancel/`)

export default { listRFQs, getRFQ, createRFQ, updateRFQ, patchRFQ, deleteRFQ, publishRFQ, closeRFQ, cancelRFQ }
