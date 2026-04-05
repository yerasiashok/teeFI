import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'

export default function PaymentSuccessPage() {
  const [params] = useSearchParams()
  const orderNumber = params.get('order')

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <CheckCircle size={64} className="text-green-400 mx-auto mb-6" />
        <h1 className="font-display text-3xl font-bold mb-2">Order Placed!</h1>
        <p className="text-zinc-400 mb-2">Your payment was successful.</p>
        {orderNumber && <p className="text-zinc-500 text-sm mb-8">Order: <span className="text-zinc-300 font-medium">{orderNumber}</span></p>}
        <p className="text-zinc-500 text-sm mb-8">We've sent it to Printful for fulfillment. You'll receive a tracking link once it ships.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to={`/orders/${orderNumber}`} className="btn-primary">View Order</Link>
          <Link to="/products" className="btn-secondary">Continue Shopping</Link>
        </div>
      </div>
    </div>
  )
}
