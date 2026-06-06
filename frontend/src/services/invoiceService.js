import api from './api'

export const listInvoices = (params = {}) => api.get('/invoices/', { params })
export const getInvoice = (id) => api.get(`/invoices/${id}/`)
export const createInvoice = (data) => api.post('/invoices/', data)
export const markInvoiceSent = (id) => api.patch(`/invoices/${id}/mark-sent/`)
export const markInvoicePaid = (id) => api.patch(`/invoices/${id}/mark-paid/`)
export const emailInvoice = (id) => api.post(`/invoices/${id}/email/`)

export default { listInvoices, getInvoice, createInvoice, markInvoiceSent, markInvoicePaid, emailInvoice }
