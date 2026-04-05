import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../services/api'
import { Package, ShoppingBag } from 'lucide-react'

export default function AdminPage() {
  const [tab, setTab] = useState<'orders' | 'products'>('orders')
  const { data: orders } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => adminApi.getAllOrders(),
    enabled: tab === 'orders',
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="flex gap-3 mb-6">
        {(['orders', 'products'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-cinema-red text-white' : 'border border-zinc-700 text-zinc-400 hover:text-white'}`}>
            {t === 'orders' ? <span className="flex items-center gap-1.5"><Package size={14}/> Orders</span>
                           : <span className="flex items-center gap-1.5"><ShoppingBag size={14}/> Products</span>}
          </button>
        ))}
      </div>

      {tab === 'orders' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-800">
              <tr>
                {['Order #', 'Status', 'Amount', 'Payment', 'Date'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-zinc-400 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders?.content?.map(order => (
                <tr key={order.id} className="border-t border-zinc-800 hover:bg-zinc-800/50">
                  <td className="px-4 py-3 font-medium text-zinc-200">{order.orderNumber}</td>
                  <td className="px-4 py-3"><span className="text-xs bg-zinc-700 px-2 py-0.5 rounded">{order.status}</span></td>
                  <td className="px-4 py-3 text-cinema-red">₹{order.totalAmount.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-zinc-400">{order.paymentProvider}</td>
                  <td className="px-4 py-3 text-zinc-500">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!orders?.content?.length && (
            <div className="text-center py-12 text-zinc-500">No orders yet.</div>
          )}
        </div>
      )}

      {tab === 'products' && (
        <div className="text-center py-12 text-zinc-500">Product management UI coming soon — use the API for now.</div>
      )}
    </div>
  )
}
