import api from './api'
export const listRFQs = () => api.get('/rfqs/')
export default { listRFQs }
