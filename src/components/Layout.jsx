import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Search, ShoppingBag, Heart, User, Menu, X, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../main'

export default function Layout({ children }) {
  const { user, cart, wishlist, logout } = useApp()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  const search = (e) => {
    e.preventDefault()
    navigate(`/products?search=${encodeURIComponent(query)}`)
    setOpen(false)
  }

  return (
    <div className="app-shell">
      <div className="announcement">
        FREE SHIPPING ON ORDERS OVER ₹5,000 · DESIGNED FOR EVERYDAY ICONS
      </div>

      <header className="header">
        <Link to="/" className="logo">
          UrbanCart<span>.</span>
        </Link>

        <nav className="desktop-nav">
          <Link
            className={location.pathname === '/products' ? 'active' : ''}
            to="/products"
          >
            Shop
          </Link>

          <Link to="/products?category=Men">
            Men
          </Link>

          <Link to="/products?category=Women">
            Women
          </Link>

          <Link to="/products?category=Kids">
            Kids
          </Link>

          <Link to="/products?category=Shoes">
            Shoes
          </Link>

          <Link to="/products?category=Accessories">
            Accessories
          </Link>

          <Link to="/products?category=Sports%20%26%20Activewear">
            Sports
          </Link>

          <Link to="/products?sort=new">
            New In
          </Link>
        </nav>

        <div className="header-actions">
          <form className="search" onSubmit={search}>
            <Search size={17} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search products"
            />
          </form>

          <Link
            to={user ? '/account' : '/login'}
            className="icon-btn"
          >
            <User size={20} />
          </Link>

          <Link to="/wishlist" className="icon-btn">
            <Heart size={20} />
            <b>{wishlist.length}</b>
          </Link>

          <Link to="/cart" className="icon-btn">
            <ShoppingBag size={20} />
            <b>{cart.reduce((a, b) => a + b.quantity, 0)}</b>
          </Link>

          <button
            className="mobile-menu"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {open && (
        <div className="mobile-nav">
          <Link
            onClick={() => setOpen(false)}
            to="/products"
          >
            Shop
          </Link>

          <Link
            onClick={() => setOpen(false)}
            to="/products?category=Men"
          >
            Men
          </Link>

          <Link
            onClick={() => setOpen(false)}
            to="/products?category=Women"
          >
            Women
          </Link>

          <Link
            onClick={() => setOpen(false)}
            to="/products?category=Kids"
          >
            Kids
          </Link>

          <Link
            onClick={() => setOpen(false)}
            to="/products?category=Shoes"
          >
            Shoes
          </Link>

          <Link
            onClick={() => setOpen(false)}
            to="/products?category=Accessories"
          >
            Accessories
          </Link>

          <Link
            onClick={() => setOpen(false)}
            to="/products?category=Sports%20%26%20Activewear"
          >
            Sports & Activewear
          </Link>

          <Link
            onClick={() => setOpen(false)}
            to="/products?sort=new"
          >
            New In
          </Link>

          {user ? (
            <button
              onClick={() => {
                logout()
                setOpen(false)
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          ) : (
            <Link
              onClick={() => setOpen(false)}
              to="/login"
            >
              Login
            </Link>
          )}
        </div>
      )}

      <main>{children}</main>

      <footer className="footer">
        <div>
          <div className="logo light">
            UrbanCart<span>.</span>
          </div>
          <p>Modern essentials for people who move.</p>
        </div>

        <div>
          <strong>SHOP</strong>
          <Link to="/products">All Products</Link>
          <Link to="/products?category=Men">Men</Link>
          <Link to="/products?category=Women">Women</Link>
          <Link to="/products?category=Kids">Kids</Link>
          <Link to="/products?category=Shoes">Shoes</Link>
          <Link to="/products?category=Accessories">Accessories</Link>
          <Link to="/products?category=Sports%20%26%20Activewear">
            Sports & Activewear
          </Link>
        </div>

        <div>
          <strong>ACCOUNT</strong>
          <Link to={user ? '/account' : '/login'}>
            My Account
          </Link>
          <Link to="/orders">Orders</Link>
          <Link to="/wishlist">Wishlist</Link>
        </div>

        <div>
          <strong>CDP DEMO</strong>
          <p>
            Adobe-ready event instrumentation for implementation practice.
          </p>
        </div>
      </footer>
    </div>
  )
}
