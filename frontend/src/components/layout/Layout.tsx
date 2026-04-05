import { Outlet, Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, Search, Film, Menu, X, LogOut, Package } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { isAuth, isAdmin, user, logout } = useAuthStore()
  const { cart, fetchCart } = useCartStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuth) fetchCart()
  }, [isAuth])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const cartCount = cart?.itemCount ?? 0

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-cinema-red rounded flex items-center justify-center">
                <Film size={16} className="text-white" />
              </div>
              <span className="font-display font-black text-xl tracking-tight">teeFI</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/products" className="text-sm text-zinc-400 hover:text-white transition-colors">All Products</Link>
              <Link to="/products?type=POSTER" className="text-sm text-zinc-400 hover:text-white transition-colors">Posters</Link>
              <Link to="/products?type=T_SHIRT" className="text-sm text-zinc-400 hover:text-white transition-colors">T-Shirts</Link>
              <Link to="/products?type=MUG" className="text-sm text-zinc-400 hover:text-white transition-colors">Mugs</Link>
              {isAdmin && (
                <Link to="/admin" className="text-sm text-cinema-gold hover:text-yellow-400 transition-colors">Admin</Link>
              )}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-zinc-400 hover:text-white transition-colors">
                <Search size={18} />
              </button>

              {isAuth ? (
                <>
                  <Link to="/orders" className="p-2 text-zinc-400 hover:text-white transition-colors hidden md:block">
                    <Package size={18} />
                  </Link>
                  <Link to="/cart" className="relative p-2 text-zinc-400 hover:text-white transition-colors">
                    <ShoppingCart size={18} />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-cinema-red text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-medium">
                        {cartCount > 9 ? '9+' : cartCount}
                      </span>
                    )}
                  </Link>
                  <div className="relative group hidden md:block">
                    <button className="flex items-center gap-1.5 p-2 text-zinc-400 hover:text-white transition-colors">
                      <User size={18} />
                      <span className="text-sm">{user?.firstName}</span>
                    </button>
                    <div className="absolute right-0 top-full mt-1 w-44 bg-zinc-900 border border-zinc-700 rounded-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                      <button onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors">
                        <LogOut size={14} /> Sign out
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <Link to="/login" className="hidden md:block btn-primary text-sm py-2 px-4">Sign in</Link>
              )}

              <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-zinc-400">
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Search bar */}
          {searchOpen && (
            <div className="py-3 border-t border-zinc-800">
              <form onSubmit={handleSearch}>
                <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="input" placeholder="Search movies, products..." />
              </form>
            </div>
          )}
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-zinc-800 bg-zinc-950 px-4 py-4 space-y-3">
            {['/', '/products', '/products?type=POSTER', '/products?type=T_SHIRT', '/cart', '/orders'].map((href, i) => {
              const labels = ['Home', 'All Products', 'Posters', 'T-Shirts', 'Cart', 'My Orders']
              return (
                <Link key={href} to={href} onClick={() => setMenuOpen(false)}
                  className="block text-zinc-300 hover:text-white py-1 text-sm">{labels[i]}</Link>
              )
            })}
            {isAuth
              ? <button onClick={() => { handleLogout(); setMenuOpen(false) }} className="text-sm text-zinc-400 hover:text-white py-1">Sign out</button>
              : <Link to="/login" onClick={() => setMenuOpen(false)} className="block btn-primary text-sm text-center mt-2">Sign in</Link>
            }
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-zinc-900 border-t border-zinc-800 py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-cinema-red rounded flex items-center justify-center">
                <Film size={14} className="text-white" />
              </div>
              <span className="font-display font-black text-lg">teeFI</span>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Premium Indian cinema merchandise. Printed on demand, delivered to your door.
            </p>
          </div>
          {[
            { title: 'Shop', links: [['All Products', '/products'], ['Posters', '/products?type=POSTER'], ['T-Shirts', '/products?type=T_SHIRT'], ['Mugs', '/products?type=MUG']] },
            { title: 'Movies', links: [['Bollywood', '/products?language=HINDI'], ['Tollywood', '/products?language=TELUGU'], ['Kollywood', '/products?language=TAMIL'], ['Mollywood', '/products?language=MALAYALAM']] },
            { title: 'Account', links: [['My Orders', '/orders'], ['Sign In', '/login'], ['Register', '/register']] },
          ].map(section => (
            <div key={section.title}>
              <h4 className="font-medium text-sm text-zinc-300 mb-3">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map(([label, href]) => (
                  <li key={label}>
                    <Link to={href} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-8 border-t border-zinc-800">
          <p className="text-zinc-600 text-sm text-center">© 2024 teeFI. Powered by Printful · Razorpay · Stripe</p>
        </div>
      </footer>
    </div>
  )
}
