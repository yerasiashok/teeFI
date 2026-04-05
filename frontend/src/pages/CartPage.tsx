import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { useCartStore } from '../store/cartStore'

export default function CartPage() {
  const { cart, fetchCart, updateItem, removeItem, loading } = useCartStore()

  useEffect(() => { fetchCart() }, [])

  if (loading) return <div className="text-center py-24 text-zinc-500 animate-pulse">Loading cart...</div>

  if (!cart || cart.items.length === 0) return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <ShoppingBag size={48} className="text-zinc-700 mx-auto mb-4" />
      <h2 className="font-display text-2xl font-bold mb-2">Your cart is empty</h2>
      <p className="text-zinc-500 mb-6">Add some Indian cinema merch to get started.</p>
      <Link to="/products" className="btn-primary">Browse Products</Link>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl font-bold mb-8">Your Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {cart.items.map(item => (
            <div key={item.cartItemId} className="card p-4 flex gap-4">
              <div className="w-20 h-20 bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0">
                {item.thumbnailUrl
                  ? <img src={item.thumbnailUrl} alt={item.productName} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl">🎬</div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-500">{item.movieTitle}</p>
                <p className="font-medium text-sm leading-snug">{item.productName}</p>
                <div className="flex gap-2 mt-0.5">
                  {item.size  && <span className="text-xs text-zinc-500">{item.size}</span>}
                  {item.color && <span className="text-xs text-zinc-500">{item.color}</span>}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateItem(item.cartItemId, item.quantity - 1)}
                      className="w-6 h-6 rounded border border-zinc-700 flex items-center justify-center hover:border-zinc-500 transition-colors">
                      <Minus size={10} />
                    </button>
                    <span className="text-sm w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateItem(item.cartItemId, item.quantity + 1)}
                      className="w-6 h-6 rounded border border-zinc-700 flex items-center justify-center hover:border-zinc-500 transition-colors">
                      <Plus size={10} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-cinema-red font-medium text-sm">₹{item.lineTotal.toLocaleString('en-IN')}</span>
                    <button onClick={() => removeItem(item.cartItemId)} className="text-zinc-600 hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card p-5 space-y-4 sticky top-24">
            <h3 className="font-medium text-zinc-200">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal ({cart.itemCount} items)</span>
                <span>₹{cart.total.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Shipping</span>
                <span>{cart.total >= 999 ? <span className="text-green-400">Free</span> : '₹99'}</span>
              </div>
            </div>
            <div className="border-t border-zinc-800 pt-3 flex justify-between font-medium">
              <span>Total</span>
              <span className="text-cinema-red">₹{(cart.total + (cart.total >= 999 ? 0 : 99)).toLocaleString('en-IN')}</span>
            </div>
            <Link to="/checkout" className="btn-primary block text-center w-full py-3">
              Proceed to Checkout
            </Link>
            <Link to="/products" className="block text-center text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
