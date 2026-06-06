import api from './api'

export const listVendors    = (params = {}) => api.get('/vendors/', { params })
export const getVendor      = (id)          => api.get(`/vendors/${id}/`)
export const createVendor   = (data)        => api.post('/vendors/', data)
export const updateVendor   = (id, data)    => api.patch(`/vendors/${id}/`, data)
export const deleteVendor   = (id)          => api.delete(`/vendors/${id}/`)
export const blockVendor    = (id)          => api.patch(`/vendors/${id}/block/`)
export const activateVendor = (id)          => api.patch(`/vendors/${id}/activate/`)
export const blacklistVendor = (id)         => api.patch(`/vendors/${id}/blacklist/`)

export default { listVendors, getVendor, createVendor, updateVendor, deleteVendor, blockVendor, activateVendor }
