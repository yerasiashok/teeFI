import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ArrowRight, Star, Truck, Shield, RefreshCw } from 'lucide-react'
import { productsApi } from '../services/api'
import ProductCard from '../components/product/ProductCard'

const LANGUAGES = ['HINDI', 'TELUGU', 'TAMIL', 'MALAYALAM', 'KANNADA']
const LANGUAGE_LABELS: Record<string, string> = {
  HINDI: 'Bollywood', TELUGU: 'Tollywood', TAMIL: 'Kollywood',
  MALAYALAM: 'Mollywood', KANNADA: 'Sandalwood'
}

export default function HomePage() {
  const { data: featured, isLoading } = useQuery({
    queryKey: ['featured'],
    queryFn: productsApi.getFeatured,
  })

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 py-24 px-4">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="relative max-w-7xl mx-auto text-center">
          <p className="text-cinema-red text-sm font-medium tracking-widest uppercase mb-4">Indian Cinema Merchandise</p>
          <h1 className="font-display text-5xl md:text-7xl font-black leading-tight mb-6">
            Wear the <span className="text-cinema-red">Story</span>.<br />Own the <span className="text-cinema-gold">Legacy</span>.
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Premium posters, apparel & accessories inspired by the greatest Indian films — printed on demand, delivered worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products" className="btn-primary inline-flex items-center gap-2">
              Shop Now <ArrowRight size={16} />
            </Link>
            <Link to="/products?featured=true" className="btn-secondary inline-flex items-center gap-2">
              View Featured
            </Link>
          </div>
        </div>
      </section>

      {/* Language/Industry Filter */}
      <section className="bg-zinc-900 border-y border-zinc-800 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {LANGUAGES.map(lang => (
              <Link key={lang}
                to={`/products?language=${lang}`}
                className="px-5 py-2 rounded-full border border-zinc-700 hover:border-cinema-red hover:text-cinema-red text-sm font-medium text-zinc-300 transition-colors">
                {LANGUAGE_LABELS[lang]}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl font-bold">Featured</h2>
            <p className="text-zinc-500 text-sm mt-1">Trending across Indian cinema</p>
          </div>
          <Link to="/products" className="text-cinema-red hover:text-red-400 text-sm flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card animate-pulse aspect-square" />
            ))}
          </div>
        ) : featured && featured.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-zinc-500">No featured products yet.</div>
        )}
      </section>

      {/* Product Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="font-display text-3xl font-bold mb-8">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { type: 'POSTER',    label: 'Posters',     emoji: '🖼️', desc: 'Wall art & prints' },
            { type: 'T_SHIRT',   label: 'T-Shirts',    emoji: '👕', desc: 'Oversized & regular' },
            { type: 'MUG',       label: 'Mugs',        emoji: '☕', desc: 'For chai lovers' },
            { type: 'PHONE_CASE',label: 'Phone Cases', emoji: '📱', desc: 'All major models' },
          ].map(cat => (
            <Link key={cat.type} to={`/products?type=${cat.type}`}
              className="card p-6 hover:border-zinc-600 transition-colors group cursor-pointer">
              <div className="text-3xl mb-3">{cat.emoji}</div>
              <h3 className="font-medium text-zinc-100 group-hover:text-white">{cat.label}</h3>
              <p className="text-sm text-zinc-500 mt-1">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-zinc-900 border-t border-zinc-800 py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Truck,     title: 'Free Shipping',    desc: 'On orders above ₹999' },
            { icon: Shield,    title: 'Secure Payments',  desc: 'Razorpay & Stripe secured' },
            { icon: RefreshCw, title: 'Easy Returns',     desc: '7-day hassle-free returns' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-cinema-red" />
              </div>
              <div>
                <h4 className="font-medium text-sm">{title}</h4>
                <p className="text-zinc-500 text-sm">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
