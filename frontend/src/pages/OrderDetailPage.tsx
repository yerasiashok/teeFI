import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { ordersApi } from '../services/api'

export default function OrderDetailPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>()
  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderNumber],
    queryFn: () => ordersApi.getByNumber(orderNumber!),
    enabled: !!orderNumber,
  })

  if (isLoading) return <div className="text-center py-24 text-zinc-500 animate-pulse">Loading order...</div>
  if (!order) return <div className="text-center py-24 text-zinc-500">Order not found.</div>

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Link to="/orders" className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-sm mb-8">
        <ArrowLeft size={14} /> My Orders
      </Link>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">{order.orderNumber}</h1>
          <p className="text-zinc-500 text-sm">{new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
        </div>
        <span className="text-xs bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-full font-medium">
          {order.status.replace('_', ' ')}
        </span>
      </div>

      {order.trackingNumber && (
        <div className="card p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-500 mb-0.5">Tracking Number</p>
            <p className="font-medium text-sm">{order.trackingNumber} · {order.shippingCarrier}</p>
          </div>
          {order.trackingUrl && (
            <a href={order.trackingUrl} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 text-sm text-cinema-red hover:text-red-400">
              Track <ExternalLink size={12} />
            </a>
          )}
        </div>
      )}

      <div className="card p-5 mb-6">
        <h3 className="font-medium text-zinc-200 mb-4">Items</h3>
        <div className="space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex gap-3 text-sm pb-3 border-b border-zinc-800 last:border-0 last:pb-0">
              <div className="w-12 h-12 bg-zinc-800 rounded flex-shrink-0 overflow-hidden">
                {item.thumbnailUrl ? <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">🎬</div>}
              </div>
              <div className="flex-1">
                <p className="text-zinc-200">{item.productName}</p>
                <p className="text-zinc-500 text-xs">{item.movieTitle} · {item.variantSize} {item.variantColor}</p>
                <p className="text-zinc-400 text-xs">Qty: {item.quantity}</p>
              </div>
              <span className="text-cinema-red font-medium">₹{item.lineTotal.toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-zinc-800 mt-4 pt-4 space-y-1.5 text-sm">
          <div className="flex justify-between text-zinc-400"><span>Subtotal</span><span>₹{order.subtotal.toLocaleString('en-IN')}</span></div>
          <div className="flex justify-between text-zinc-400"><span>Shipping</span><span>₹{order.shippingCost.toLocaleString('en-IN')}</span></div>
          <div className="flex justify-between font-medium text-base pt-1"><span>Total</span><span className="text-cinema-red">₹{order.totalAmount.toLocaleString('en-IN')}</span></div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-medium text-zinc-200 mb-3">Shipping Address</h3>
        <div className="text-sm text-zinc-400 space-y-0.5">
          <p className="text-zinc-200 font-medium">{order.shippingFullName}</p>
          <p>{order.shippingLine1}</p>
          <p>{order.shippingCity}, {order.shippingState} {order.shippingPincode}</p>
          <p>{order.shippingCountry}</p>
        </div>
      </div>
    </div>
  )
}
