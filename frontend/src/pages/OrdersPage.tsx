import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Package, ChevronRight } from 'lucide-react'
import { ordersApi } from '../services/api'
import type { OrderStatus } from '../types'

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING:           'text-yellow-400 bg-yellow-400/10',
  PAYMENT_INITIATED: 'text-yellow-400 bg-yellow-400/10',
  PAID:              'text-blue-400 bg-blue-400/10',
  SENT_TO_POD:       'text-purple-400 bg-purple-400/10',
  FULFILLING:        'text-purple-400 bg-purple-400/10',
  SHIPPED:           'text-green-400 bg-green-400/10',
  DELIVERED:         'text-green-400 bg-green-400/10',
  CANCELLED:         'text-red-400 bg-red-400/10',
  REFUNDED:          'text-zinc-400 bg-zinc-400/10',
}

export default function OrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.getAll(),
  })

  if (isLoading) return <div className="text-center py-24 text-zinc-500 animate-pulse">Loading orders...</div>

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl font-bold mb-8">My Orders</h1>
      {!data?.content?.length ? (
        <div className="text-center py-24">
          <Package size={48} className="text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500">No orders yet.</p>
          <Link to="/products" className="mt-4 inline-block btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {data.content.map(order => (
            <Link key={order.id} to={`/orders/${order.orderNumber}`}
              className="card p-4 flex items-center justify-between hover:border-zinc-600 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center">
                  <Package size={16} className="text-zinc-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">{order.orderNumber}</p>
                  <p className="text-xs text-zinc-500">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-cinema-red">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
                <ChevronRight size={14} className="text-zinc-600" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
