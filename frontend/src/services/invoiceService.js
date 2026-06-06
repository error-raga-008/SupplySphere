import api from './api'
export const listInvoices = () => api.get('/invoices/')
export default { listInvoices }
