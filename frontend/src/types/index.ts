// ---- Enums ----
export type Language   = 'HINDI' | 'TELUGU' | 'TAMIL' | 'MALAYALAM' | 'KANNADA' | 'BENGALI' | 'MARATHI' | 'PUNJABI'
export type ProductType = 'POSTER' | 'T_SHIRT' | 'HOODIE' | 'MUG' | 'PHONE_CASE' | 'CANVAS' | 'TOTE_BAG' | 'STICKER'
export type OrderStatus = 'PENDING' | 'PAYMENT_INITIATED' | 'PAID' | 'SENT_TO_POD' | 'FULFILLING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'
export type PaymentProvider = 'RAZORPAY' | 'STRIPE'

// ---- Auth ----
export interface AuthResponse {
  accessToken:   string
  refreshToken:  string
  tokenType:     string
  email:         string
  firstName:     string
  lastName:      string
  role:          string
}

export interface LoginRequest   { email: string; password: string }
export interface RegisterRequest { email: string; password: string; firstName: string; lastName: string; phone?: string }

// ---- Product ----
export interface ProductVariant {
  id:                 string
  size:               string
  color:              string
  material:           string
  price:              number
  available:          boolean
  printfulVariantId:  string
  sku:                string
}

export interface Product {
  id:          string
  name:        string
  description: string
  movieTitle:  string
  language:    Language
  productType: ProductType
  basePrice:   number
  thumbnailUrl: string
  imageUrls:   string[]
  featured:    boolean
  director:    string
  releaseYear: number
  tags:        string
  variants:    ProductVariant[]
  createdAt:   string
}

export interface PageResponse<T> {
  content:          T[]
  totalElements:    number
  totalPages:       number
  number:           number
  size:             number
  first:            boolean
  last:             boolean
}

// ---- Cart ----
export interface CartItem {
  cartItemId:  string
  variantId:   string
  productId:   string
  productName: string
  movieTitle:  string
  thumbnailUrl: string
  size:        string
  color:       string
  unitPrice:   number
  quantity:    number
  lineTotal:   number
}

export interface Cart {
  cartId:    string
  items:     CartItem[]
  total:     number
  itemCount: number
}

// ---- Address ----
export interface Address {
  id:        string
  fullName:  string
  line1:     string
  line2?:    string
  city:      string
  state:     string
  pincode:   string
  country:   string
  phone?:    string
  isDefault: boolean
}

// ---- Order ----
export interface OrderItem {
  productName:  string
  movieTitle:   string
  thumbnailUrl: string
  variantSize:  string
  variantColor: string
  unitPrice:    number
  quantity:     number
  lineTotal:    number
}

export interface Order {
  id:               string
  orderNumber:      string
  status:           OrderStatus
  items:            OrderItem[]
  subtotal:         number
  shippingCost:     number
  totalAmount:      number
  paymentProvider:  PaymentProvider
  paymentId:        string
  trackingNumber:   string
  trackingUrl:      string
  shippingCarrier:  string
  shippingFullName: string
  shippingLine1:    string
  shippingCity:     string
  shippingState:    string
  shippingPincode:  string
  shippingCountry:  string
  createdAt:        string
}

// ---- Payment ----
export interface PaymentInitResponse {
  orderId:             string
  orderNumber:         string
  paymentOrderId:      string
  provider:            PaymentProvider
  amount:              number
  currency:            string
  razorpayKeyId?:      string
  stripePublishableKey?: string
}
