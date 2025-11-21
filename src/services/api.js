import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle backend response structure
api.interceptors.response.use(
  (response) => {
    // If backend returns { success: true, data: ... }, extract the data
    if (response.data && response.data.success !== undefined) {
      // If data field exists, use it
      if (response.data.data !== undefined) {
        return { ...response, data: response.data.data };
      }
      // Otherwise, use count field if it exists (for getProductsCount)
      if (response.data.count !== undefined) {
        return { ...response, data: response.data.count };
      }
      // Return the whole response.data if no data or count field
      return { ...response, data: response.data };
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

// Products API
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  search: (query) => api.get('/products/search', { params: { q: query } }),
  getLowStock: (threshold) => api.get('/products/low-stock', { params: { threshold } }),
  create: (productData) => api.post('/products', productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
};

// Orders API
export const ordersAPI = {
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  getByCustomerEmail: (email) => api.get(`/orders/customer/${email}`),
  create: (orderData) => api.post('/orders', orderData),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  cancel: (id) => api.delete(`/orders/${id}`),
};

// Payments API
export const paymentsAPI = {
  getAll: () => api.get('/payments'),
  getById: (id) => api.get(`/payments/${id}`),
  getByOrderId: (orderId) => api.get(`/payments/order/${orderId}`),
  getByStatus: (status) => api.get(`/payments/status/${status}`),
  create: (paymentData) => api.post('/payments', paymentData),
  process: (id) => api.patch(`/payments/${id}/process`),
};

// Analytics API
export const analyticsAPI = {
  // Product analytics
  getProductStats: () => api.get('/analytics/products/count'),
  getProductsByCategory: () => api.get('/analytics/products/by-category'),
  getInventoryValue: () => api.get('/analytics/products/value'),

  // Order analytics
  getOrderStats: () => api.get('/analytics/orders/stats'),
  getOrdersByStatus: () => api.get('/analytics/orders/by-status'),
  getRecentOrders: () => api.get('/analytics/orders/recent'),
  getTopProducts: () => api.get('/analytics/orders/top-products'),

  // Payment analytics
  getPaymentsByMethod: () => api.get('/analytics/payments/by-method'),
  getPaymentSuccessRate: () => api.get('/analytics/payments/success-rate'),
  getRevenueByStatus: () => api.get('/analytics/payments/revenue'),
  getDailyRevenue: (startDate, endDate) => api.get('/analytics/payments/daily', {
    params: { startDate, endDate }
  }),
};

export default api;
