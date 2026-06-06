import api from './api'
export const listQuotations = () => api.get('/quotations/')
export default { listQuotations }
