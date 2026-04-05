import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrdersPage from './pages/OrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdminPage from './pages/AdminPage'
import PaymentSuccessPage from './pages/PaymentSuccessPage'
import { useAuthStore } from './store/authStore'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuth = useAuthStore(s => s.isAuth)
  return isAuth ? <>{children}</> : <Navigate to="/login" replace />
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuth, isAdmin } = useAuthStore()
  if (!isAuth) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/"                element={<HomePage />} />
        <Route path="/products"        element={<ProductsPage />} />
        <Route path="/products/:id"    element={<ProductDetailPage />} />
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/register"        element={<RegisterPage />} />

        <Route path="/cart" element={
          <ProtectedRoute><CartPage /></ProtectedRoute>
        }/>
        <Route path="/checkout" element={
          <ProtectedRoute><CheckoutPage /></ProtectedRoute>
        }/>
        <Route path="/orders" element={
          <ProtectedRoute><OrdersPage /></ProtectedRoute>
        }/>
        <Route path="/orders/:orderNumber" element={
          <ProtectedRoute><OrderDetailPage /></ProtectedRoute>
        }/>
        <Route path="/payment/success" element={
          <ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>
        }/>
        <Route path="/admin" element={
          <AdminRoute><AdminPage /></AdminRoute>
        }/>
      </Route>
    </Routes>
  )
}
