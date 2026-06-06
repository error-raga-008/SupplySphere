import api from './api'
export const listVendors = () => api.get('/vendors/')
export default { listVendors }
