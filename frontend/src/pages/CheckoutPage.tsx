import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Smartphone } from 'lucide-react'
import { ordersApi, paymentApi } from '../services/api'
import { useCartStore } from '../store/cartStore'
import toast from 'react-hot-toast'

// Razorpay is loaded via CDN script tag in index.html or dynamically
declare global {
  interface Window { Razorpay: any }
}

const MOCK_ADDRESS = {
  id: '00000000-0000-0000-0000-000000000001',
  fullName: 'Test User',
  line1: '123 MG Road',
  city: 'Bangalore',
  state: 'Karnataka',
  pincode: '560001',
  country: 'India',
  isDefault: true,
}

export default function CheckoutPage() {
  const { cart } = useCartStore()
  const navigate = useNavigate()
  const [provider, setProvider] = useState<'RAZORPAY' | 'STRIPE'>('RAZORPAY')
  const [loading, setLoading] = useState(false)

  if (!cart || cart.items.length === 0) {
    navigate('/cart')
    return null
  }

  const total = cart.total + (cart.total >= 999 ? 0 : 99)

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const paymentData = await ordersApi.checkout(MOCK_ADDRESS.id, provider)

      if (provider === 'RAZORPAY') {
        await handleRazorpay(paymentData)
      } else {
        await handleStripe(paymentData)
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Checkout failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRazorpay = (paymentData: any) => {
    return new Promise<void>((resolve, reject) => {
      const options = {
        key:          paymentData.razorpayKeyId,
        amount:       paymentData.amount * 100,
        currency:     paymentData.currency,
        name:         'teeFI',
        description:  `Order ${paymentData.orderNumber}`,
        order_id:     paymentData.paymentOrderId,
        handler: async (response: any) => {
          try {
            await paymentApi.verifyRazorpay({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            })
            toast.success('Payment successful! 🎉')
            navigate(`/payment/success?order=${paymentData.orderNumber}`)
            resolve()
          } catch {
            toast.error('Payment verification failed')
            reject()
          }
        },
        prefill: {
          name:  MOCK_ADDRESS.fullName,
          email: '',
          contact: '',
        },
        theme: { color: '#C0392B' },
        modal: { ondismiss: () => reject(new Error('Payment dismissed')) }
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    })
  }

  const handleStripe = async (paymentData: any) => {
    // Stripe Elements integration would go here
    // For now, redirect to a Stripe hosted page or use Stripe.js
    toast.error('Stripe checkout coming soon — use Razorpay for now')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Payment method */}
        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="font-medium mb-4 text-zinc-200">Payment Method</h3>
            <div className="space-y-3">
              <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${provider === 'RAZORPAY' ? 'border-cinema-red bg-red-950/20' : 'border-zinc-700 hover:border-zinc-600'}`}>
                <input type="radio" name="provider" value="RAZORPAY" checked={provider === 'RAZORPAY'}
                  onChange={() => setProvider('RAZORPAY')} className="accent-cinema-red" />
                <Smartphone size={16} className="text-cinema-red" />
                <div>
                  <p className="text-sm font-medium">Razorpay</p>
                  <p className="text-xs text-zinc-500">UPI, Cards, Net Banking, Wallets</p>
                </div>
              </label>
              <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${provider === 'STRIPE' ? 'border-cinema-red bg-red-950/20' : 'border-zinc-700 hover:border-zinc-600'}`}>
                <input type="radio" name="provider" value="STRIPE" checked={provider === 'STRIPE'}
                  onChange={() => setProvider('STRIPE')} className="accent-cinema-red" />
                <CreditCard size={16} className="text-zinc-400" />
                <div>
                  <p className="text-sm font-medium">Stripe</p>
                  <p className="text-xs text-zinc-500">International Cards</p>
                </div>
              </label>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="card p-5">
            <h3 className="font-medium mb-3 text-zinc-200">Shipping Address</h3>
            <div className="text-sm text-zinc-400 space-y-0.5">
              <p className="text-zinc-200 font-medium">{MOCK_ADDRESS.fullName}</p>
              <p>{MOCK_ADDRESS.line1}</p>
              <p>{MOCK_ADDRESS.city}, {MOCK_ADDRESS.state} {MOCK_ADDRESS.pincode}</p>
              <p>{MOCK_ADDRESS.country}</p>
            </div>
          </div>
        </div>

        {/* Right: Order summary */}
        <div>
          <div className="card p-5 space-y-4">
            <h3 className="font-medium text-zinc-200">Order Summary</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {cart.items.map(item => (
                <div key={item.cartItemId} className="flex gap-3 text-sm">
                  <div className="w-12 h-12 bg-zinc-800 rounded flex-shrink-0 overflow-hidden">
                    {item.thumbnailUrl
                      ? <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-lg">🎬</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-200 leading-snug line-clamp-1">{item.productName}</p>
                    <p className="text-zinc-500 text-xs">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-cinema-red text-sm font-medium">₹{item.lineTotal.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-zinc-800 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span>₹{cart.total.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Shipping</span>
                <span>{cart.total >= 999 ? <span className="text-green-400">Free</span> : '₹99'}</span>
              </div>
              <div className="flex justify-between font-medium text-base pt-1 border-t border-zinc-800">
                <span>Total</span>
                <span className="text-cinema-red">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <button onClick={handleCheckout} disabled={loading}
              className="btn-primary w-full py-3 text-base disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing...</>
              ) : (
                `Pay ₹${total.toLocaleString('en-IN')} →`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
