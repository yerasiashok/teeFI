import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { SlidersHorizontal, X } from 'lucide-react'
import { productsApi } from '../services/api'
import ProductCard from '../components/product/ProductCard'
import type { Language, ProductType } from '../types'

const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'HINDI',     label: 'Bollywood (Hindi)' },
  { value: 'TELUGU',    label: 'Tollywood (Telugu)' },
  { value: 'TAMIL',     label: 'Kollywood (Tamil)' },
  { value: 'MALAYALAM', label: 'Mollywood (Malayalam)' },
  { value: 'KANNADA',   label: 'Sandalwood (Kannada)' },
  { value: 'BENGALI',   label: 'Bengali' },
  { value: 'MARATHI',   label: 'Marathi' },
]

const PRODUCT_TYPES: { value: ProductType; label: string }[] = [
  { value: 'POSTER',     label: 'Posters' },
  { value: 'T_SHIRT',    label: 'T-Shirts' },
  { value: 'HOODIE',     label: 'Hoodies' },
  { value: 'MUG',        label: 'Mugs' },
  { value: 'PHONE_CASE', label: 'Phone Cases' },
  { value: 'CANVAS',     label: 'Canvas Art' },
  { value: 'TOTE_BAG',   label: 'Tote Bags' },
  { value: 'STICKER',    label: 'Stickers' },
]

export default function ProductsPage() {
  const [params, setParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(0)

  const language  = params.get('language')  as Language | null
  const type      = params.get('type')      as ProductType | null
  const q         = params.get('q')

  const { data, isLoading } = useQuery({
    queryKey: ['products', page, language, type, q],
    queryFn: () => q
      ? productsApi.search(q, page)
      : productsApi.getAll({ page, size: 20, language: language ?? undefined, type: type ?? undefined }),
  })

  const setFilter = (key: string, value: string | null) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value); else next.delete(key)
    setParams(next)
    setPage(0)
  }

  const clearFilters = () => { setParams({}); setPage(0) }
  const hasFilters = !!(language || type || q)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold">
            {q ? `Results for "${q}"` : type ? PRODUCT_TYPES.find(t => t.value === type)?.label : language ? LANGUAGES.find(l => l.value === language)?.label : 'All Products'}
          </h1>
          {data && <p className="text-zinc-500 text-sm mt-1">{data.totalElements} products</p>}
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 btn-secondary text-sm">
          <SlidersHorizontal size={14} />
          Filters {hasFilters && <span className="bg-cinema-red text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">!</span>}
        </button>
      </div>

      {/* Active Filters */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2 mb-6">
          {language && <FilterTag label={LANGUAGES.find(l => l.value === language)?.label ?? language} onRemove={() => setFilter('language', null)} />}
          {type && <FilterTag label={PRODUCT_TYPES.find(t => t.value === type)?.label ?? type} onRemove={() => setFilter('type', null)} />}
          {q && <FilterTag label={`"${q}"`} onRemove={() => setFilter('q', null)} />}
          <button onClick={clearFilters} className="text-xs text-zinc-500 hover:text-zinc-300 underline">Clear all</button>
        </div>
      )}

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        {showFilters && (
          <aside className="w-56 flex-shrink-0 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-zinc-300 mb-3">Language / Industry</h3>
              <div className="space-y-1.5">
                {LANGUAGES.map(l => (
                  <button key={l.value} onClick={() => setFilter('language', language === l.value ? null : l.value)}
                    className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${language === l.value ? 'bg-cinema-red text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-zinc-300 mb-3">Product Type</h3>
              <div className="space-y-1.5">
                {PRODUCT_TYPES.map(t => (
                  <button key={t.value} onClick={() => setFilter('type', type === t.value ? null : t.value)}
                    className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${type === t.value ? 'bg-cinema-red text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* Product Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card animate-pulse aspect-square" />
              ))}
            </div>
          ) : data?.content?.length ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.content.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
              {/* Pagination */}
              {data.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  <button disabled={data.first} onClick={() => setPage(p => p - 1)}
                    className="btn-secondary text-sm py-2 px-4 disabled:opacity-40">Previous</button>
                  <span className="px-4 py-2 text-sm text-zinc-400">
                    {data.number + 1} / {data.totalPages}
                  </span>
                  <button disabled={data.last} onClick={() => setPage(p => p + 1)}
                    className="btn-secondary text-sm py-2 px-4 disabled:opacity-40">Next</button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-24">
              <p className="text-zinc-500 text-lg">No products found.</p>
              <button onClick={clearFilters} className="mt-4 text-cinema-red hover:text-red-400 text-sm">Clear filters</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 bg-zinc-800 text-zinc-300 text-xs px-3 py-1 rounded-full">
      {label}
      <button onClick={onRemove} className="ml-1 hover:text-white"><X size={10} /></button>
    </span>
  )
}
