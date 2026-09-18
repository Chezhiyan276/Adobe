import React, { createContext, useContext, useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import AdobePageView from './components/AdobePageView'
import { getCurrentUser, getOrders, getProducts, signOut } from './lib/api'
import { supabase, supabaseConfigured } from './lib/supabase'
import './styles.css'

const Context = createContext(null)
export const useApp = () => useContext(Context)

const readArray = key => {
  try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] }
}

function Provider({ children }) {
  const [products, setProducts] = useState([])
  const [user, setUser] = useState(null)
  const [cart, setCart] = useState(() => readArray('urbancart_cart'))
  const [wishlist, setWishlist] = useState(() => readArray('urbancart_wishlist'))
  const [orders, setOrders] = useState([])

  useEffect(() => { getProducts().then(setProducts); getCurrentUser().then(setUser) }, [])
  useEffect(() => localStorage.setItem('urbancart_cart', JSON.stringify(cart)), [cart])
  useEffect(() => localStorage.setItem('urbancart_wishlist', JSON.stringify(wishlist)), [wishlist])
  useEffect(() => { if (user?.id) getOrders(user.id).then(setOrders) }, [user])

  useEffect(() => {
    if (!supabaseConfigured) return
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user || null))
    return () => data.subscription.unsubscribe()
  }, [])

  const addToCart = (product, { size, color, quantity = 1 }) => setCart(current => {
    const index = current.findIndex(i => i.product.sku === product.sku && i.size === size && i.color === color)
    if (index >= 0) {
      const next = [...current]
      next[index] = { ...next[index], quantity: next[index].quantity + quantity }
      return next
    }
    return [...current, { product, size, color, quantity }]
  })

  const updateCart = (index, quantity) => setCart(current => quantity <= 0 ? current.filter((_, i) => i !== index) : current.map((x, i) => i === index ? { ...x, quantity } : x))
  const removeFromCart = index => setCart(current => current.filter((_, i) => i !== index))
  const clearCart = () => setCart([])
  const toggleWishlist = product => setWishlist(current => current.some(p => p.sku === product.sku) ? current.filter(p => p.sku !== product.sku) : [...current, product])
  const logout = async () => { await signOut(); setUser(null); setOrders([]) }

  return <Context.Provider value={{ products, user, setUser, cart, wishlist, orders, addToCart, updateCart, removeFromCart, clearCart, toggleWishlist, logout }}>{children}</Context.Provider>
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <HashRouter>
    <Provider>
      <AdobePageView />
      <App />
    </Provider>
  </HashRouter>
)
