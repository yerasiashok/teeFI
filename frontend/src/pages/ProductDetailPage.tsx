import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ShoppingCart, ArrowLeft, Check } from 'lucide-react'
import { productsApi } from '../services/api'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import type { ProductVariant } from '../types'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addItem } = useCartStore()
  const { isAuth } = useAuthStore()

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [adding, setAdding] = useState(false)

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getById(id!),
    enabled: !!id,
    onSuccess: (p) => {
      if (p.variants.length > 0) setSelectedVariant(p.variants[0])
    }
  })

  const handleAddToCart = async () => {
    if (!isAuth) { navigate('/login'); return }
    if (!selectedVariant) return
    setAdding(true)
    await addItem(selectedVariant.id, 1)
    setAdding(false)
  }

  if (isLoading) return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="aspect-square bg-zinc-800 rounded-xl animate-pulse" />
        <div className="space-y-4">
          {[200, 100, 300, 150].map((w, i) => (
            <div key={i} className="h-6 bg-zinc-800 rounded animate-pulse" style={{ width: w }} />
          ))}
        </div>
      </div>
    </div>
  )

  if (!product) return <div className="text-center py-24 text-zinc-500">Product not found.</div>

  const images = product.imageUrls?.length ? product.imageUrls : [product.thumbnailUrl].filter(Boolean)
  const sizes  = [...new Set(product.variants.map(v => v.size).filter(Boolean))]
  const colors = [...new Set(product.variants.map(v => v.color).filter(Boolean))]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-sm mb-8 transition-colors">
        <ArrowLeft size={14} /> Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800">
            {images[selectedImage] ? (
              <img src={images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">🎬</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-colors ${i === selectedImage ? 'border-cinema-red' : 'border-zinc-700'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <p className="text-cinema-red text-sm font-medium mb-1">{product.movieTitle} · {product.language}</p>
            <h1 className="font-display text-3xl font-bold leading-tight">{product.name}</h1>
            {product.director && (
              <p className="text-zinc-500 text-sm mt-1">Dir. {product.director}{product.releaseYear ? ` · ${product.releaseYear}` : ''}</p>
            )}
          </div>

          <div className="text-2xl font-bold text-cinema-red">
            ₹{(selectedVariant?.price ?? product.basePrice).toLocaleString('en-IN')}
          </div>

          {product.description && (
            <p className="text-zinc-400 text-sm leading-relaxed">{product.description}</p>
          )}

          {/* Size selector */}
          {sizes.length > 0 && (
            <div>
              <p className="text-sm font-medium text-zinc-300 mb-2">Size</p>
              <div className="flex flex-wrap gap-2">
                {sizes.map(size => {
                  const v = product.variants.find(v => v.size === size && v.available)
                  const active = selectedVariant?.size === size
                  return (
                    <button key={size} disabled={!v}
                      onClick={() => v && setSelectedVariant(v)}
                      className={`px-4 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                        active ? 'border-cinema-red bg-cinema-red text-white'
                               : v ? 'border-zinc-700 hover:border-zinc-500 text-zinc-300'
                                   : 'border-zinc-800 text-zinc-600 cursor-not-allowed line-through'
                      }`}>
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Color selector */}
          {colors.length > 0 && (
            <div>
              <p className="text-sm font-medium text-zinc-300 mb-2">Color</p>
              <div className="flex flex-wrap gap-2">
                {colors.map(color => {
                  const v = product.variants.find(v => v.color === color && v.available)
                  const active = selectedVariant?.color === color
                  return (
                    <button key={color} disabled={!v}
                      onClick={() => v && setSelectedVariant(v)}
                      className={`px-4 py-1.5 rounded-lg border text-sm transition-colors ${
                        active ? 'border-cinema-red bg-cinema-red text-white'
                               : v ? 'border-zinc-700 hover:border-zinc-500 text-zinc-300'
                                   : 'border-zinc-800 text-zinc-600 cursor-not-allowed'
                      }`}>
                      {active && <Check size={10} className="inline mr-1" />}{color}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <button onClick={handleAddToCart}
            disabled={adding || !selectedVariant}
            className="w-full btn-primary flex items-center justify-center gap-2 py-3 text-base disabled:opacity-60">
            <ShoppingCart size={16} />
            {adding ? 'Adding...' : 'Add to Cart'}
          </button>

          {/* Tags */}
          {product.tags && (
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-zinc-800">
              {product.tags.split(',').map(tag => (
                <span key={tag} className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
                  #{tag.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
