import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import type { Product } from '../../types'
import { useCartStore } from '../../store/cartStore'
import { useAuthStore } from '../../store/authStore'
import { useNavigate } from 'react-router-dom'

interface Props { product: Product }

export default function ProductCard({ product }: Props) {
  const { addItem } = useCartStore()
  const { isAuth } = useAuthStore()
  const navigate = useNavigate()

  const cheapestVariant = product.variants
    .filter(v => v.available)
    .sort((a, b) => a.price - b.price)[0]

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isAuth) { navigate('/login'); return }
    if (cheapestVariant) {
      await addItem(cheapestVariant.id, 1)
    } else {
      navigate(`/products/${product.id}`)
    }
  }

  const displayPrice = cheapestVariant?.price ?? product.basePrice

  return (
    <Link to={`/products/${product.id}`}
      className="card group cursor-pointer overflow-hidden hover:border-zinc-600 transition-all duration-200">
      {/* Image */}
      <div className="relative aspect-square bg-zinc-800 overflow-hidden">
        {product.thumbnailUrl ? (
          <img src={product.thumbnailUrl} alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-zinc-600 text-4xl">🎬</span>
          </div>
        )}

        {product.featured && (
          <span className="absolute top-2 left-2 bg-cinema-red text-white text-xs font-medium px-2 py-0.5 rounded">
            Featured
          </span>
        )}

        {/* Quick add button */}
        <button onClick={handleQuickAdd}
          className="absolute bottom-2 right-2 bg-cinema-red hover:bg-red-700 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
          <ShoppingCart size={14} />
        </button>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs text-zinc-500 mb-0.5">{product.movieTitle}</p>
        <h3 className="text-sm font-medium text-zinc-100 line-clamp-2 leading-snug">{product.name}</h3>
        <div className="flex items-center justify-between mt-2">
          <span className="text-cinema-red font-medium text-sm">₹{displayPrice.toLocaleString('en-IN')}</span>
          <span className="text-xs text-zinc-600">{product.language}</span>
        </div>
      </div>
    </Link>
  )
}
