import axios from 'axios'
import type {
  AuthResponse, LoginRequest, RegisterRequest,
  Product, PageResponse, Cart, Order, PaymentInitResponse,
  Language, ProductType, Address
} from '../types'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

// Attach JWT to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-logout on 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ---- Auth ----
export const authApi = {
  login:    (data: LoginRequest)    => api.post<AuthResponse>('/auth/login', data).then(r => r.data),
  register: (data: RegisterRequest) => api.post<AuthResponse>('/auth/register', data).then(r => r.data),
}

// ---- Products ----
export const productsApi = {
  getAll: (params: { page?: number; size?: number; language?: Language; type?: ProductType }) =>
    api.get<PageResponse<Product>>('/products', { params }).then(r => r.data),

  getById: (id: string) =>
    api.get<Product>(`/products/${id}`).then(r => r.data),

  getFeatured: () =>
    api.get<Product[]>('/products/featured').then(r => r.data),

  search: (q: string, page = 0, size = 20) =>
    api.get<PageResponse<Product>>('/products/search', { params: { q, page, size } }).then(r => r.data),

  getMovieTitles: () =>
    api.get<string[]>('/products/movies').then(r => r.data),
}

// ---- Cart ----
export const cartApi = {
  get: () =>
    api.get<Cart>('/cart').then(r => r.data),

  addItem: (variantId: string, quantity: number) =>
    api.post<Cart>('/cart/items', { variantId, quantity }).then(r => r.data),

  updateItem: (cartItemId: string, quantity: number) =>
    api.put<Cart>(`/cart/items/${cartItemId}`, null, { params: { quantity } }).then(r => r.data),

  removeItem: (cartItemId: string) =>
    api.delete<Cart>(`/cart/items/${cartItemId}`).then(r => r.data),

  clear: () =>
    api.delete('/cart'),
}

// ---- Orders ----
export const ordersApi = {
  checkout: (addressId: string, paymentProvider: 'RAZORPAY' | 'STRIPE') =>
    api.post<PaymentInitResponse>('/orders/checkout', { addressId, paymentProvider }).then(r => r.data),

  getAll: (page = 0, size = 10) =>
    api.get<PageResponse<Order>>('/orders', { params: { page, size } }).then(r => r.data),

  getByNumber: (orderNumber: string) =>
    api.get<Order>(`/orders/${orderNumber}`).then(r => r.data),
}

// ---- Payment verification ----
export const paymentApi = {
  verifyRazorpay: (data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
    api.post('/payments/verify/razorpay', data).then(r => r.data),
}

// ---- Addresses (part of user profile) ----
export const addressApi = {
  getAll: () =>
    api.get<Address[]>('/users/addresses').then(r => r.data),

  create: (data: Omit<Address, 'id'>) =>
    api.post<Address>('/users/addresses', data).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/users/addresses/${id}`),
}

// ---- Admin ----
export const adminApi = {
  createProduct: (data: unknown) =>
    api.post<Product>('/admin/products', data).then(r => r.data),

  deleteProduct: (id: string) =>
    api.delete(`/admin/products/${id}`),

  getAllOrders: (page = 0, size = 20) =>
    api.get<PageResponse<Order>>('/admin/orders', { params: { page, size } }).then(r => r.data),
}

export default api
