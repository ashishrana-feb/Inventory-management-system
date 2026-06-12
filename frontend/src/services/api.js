import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  res => res,
  err => {
    const message = err.response?.data?.detail || err.message || 'An error occurred'
    return Promise.reject(new Error(Array.isArray(message) ? message[0]?.msg || JSON.stringify(message) : message))
  }
)

// Products
export const productsApi = {
  getAll: () => api.get('/products').then(r => r.data),
  getById: (id) => api.get(`/products/${id}`).then(r => r.data),
  create: (data) => api.post('/products', data).then(r => r.data),
  update: (id, data) => api.put(`/products/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/products/${id}`),
}

// Customers
export const customersApi = {
  getAll: () => api.get('/customers').then(r => r.data),
  getById: (id) => api.get(`/customers/${id}`).then(r => r.data),
  create: (data) => api.post('/customers', data).then(r => r.data),
  delete: (id) => api.delete(`/customers/${id}`),
}

// Orders
export const ordersApi = {
  getAll: () => api.get('/orders').then(r => r.data),
  getById: (id) => api.get(`/orders/${id}`).then(r => r.data),
  create: (data) => api.post('/orders', data).then(r => r.data),
  delete: (id) => api.delete(`/orders/${id}`),
}

// Dashboard
export const dashboardApi = {
  getStats: () => api.get('/dashboard').then(r => r.data),
}
