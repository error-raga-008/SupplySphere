import api from './api'
export const listPurchaseOrders = () => api.get('/purchase-orders/')
export default { listPurchaseOrders }
