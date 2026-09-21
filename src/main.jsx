import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import AdobePageView from './components/AdobePageView'
import {
  getCurrentUser,
  getOrders,
  getProducts,
  signOut
} from './lib/api'
import {
  supabase,
  supabaseConfigured
} from './lib/supabase'
import './styles.css'

const Context = createContext(null)

export const useApp = () =>
  useContext(Context)

const readArray = key => {
  try {
    return JSON.parse(
      localStorage.getItem(key) || '[]'
    )
  } catch {
    return []
  }
}

function Provider({ children }) {
  const [products, setProducts] =
    useState([])

  const [user, setUser] =
    useState(null)

  const [cart, setCart] =
    useState(() =>
      readArray('urbancart_cart')
    )

  const [wishlist, setWishlist] =
    useState(() =>
      readArray('urbancart_wishlist')
    )

  const [orders, setOrders] =
    useState([])

  useEffect(() => {
    getProducts().then(setProducts)
    getCurrentUser().then(setUser)
  }, [])

  useEffect(() => {
    localStorage.setItem(
      'urbancart_cart',
      JSON.stringify(cart)
    )
  }, [cart])

  useEffect(() => {
    localStorage.setItem(
      'urbancart_wishlist',
      JSON.stringify(wishlist)
    )
  }, [wishlist])

  useEffect(() => {
    if (user?.id) {
      getOrders(user.id).then(setOrders)
    }
  }, [user])

  useEffect(() => {
    if (!supabaseConfigured) return

    const { data } =
      supabase.auth.onAuthStateChange(
        (_event, session) =>
          setUser(
            session?.user || null
          )
      )

    return () =>
      data.subscription.unsubscribe()
  }, [])

  const addToCart = (
    product,
    {
      size,
      color,
      quantity = 1
    }
  ) =>
    setCart(current => {
      const index =
        current.findIndex(
          item =>
            item.product.sku ===
              product.sku &&
            item.size === size &&
            item.color === color
        )

      if (index >= 0) {
        const next = [...current]

        next[index] = {
          ...next[index],
          quantity:
            next[index].quantity +
            quantity
        }

        return next
      }

      return [
        ...current,
        {
          product,
          size,
          color,
          quantity
        }
      ]
    })

  const updateCart = (
    index,
    quantity
  ) =>
    setCart(current =>
      quantity <= 0
        ? current.filter(
            (_, i) => i !== index
          )
        : current.map(
            (item, i) =>
              i === index
                ? {
                    ...item,
                    quantity
                  }
                : item
          )
    )

  const removeFromCart = index =>
    setCart(current =>
      current.filter(
        (_, i) => i !== index
      )
    )

  const clearCart = () =>
    setCart([])

  /*
   * Wishlist
   *
   * Supabase stores:
   * user_id
   * customer_id
   * product_id
   *
   * Local storage is also maintained
   * for the existing application UI.
   */
  const toggleWishlist = async product => {
    const alreadySaved =
      wishlist.some(
        item =>
          item.sku === product.sku
      )

    /*
     * Demo/local-storage mode
     */
    if (!supabaseConfigured) {
      setWishlist(current =>
        alreadySaved
          ? current.filter(
              item =>
                item.sku !==
                product.sku
            )
          : [
              ...current,
              product
            ]
      )

      return
    }

    /*
     * User must be logged in
     * for a Supabase wishlist.
     */
    if (!user?.id) {
      console.warn(
        'User must be logged in to manage wishlist'
      )

      return
    }

    /*
     * Get UrbanCart Customer ID
     * from the profile.
     */
    const {
      data: profile,
      error: profileError
    } = await supabase
      .from('profiles')
      .select('customer_id')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error(
        'Unable to retrieve customer profile:',
        profileError
      )

      return
    }

    const customerId =
      profile?.customer_id

    if (!customerId) {
      console.error(
        'Customer ID is missing from profile'
      )

      return
    }

    /*
     * Remove from wishlist
     */
    if (alreadySaved) {
      const {
        error
      } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', product.id)

      if (error) {
        console.error(
          'Unable to remove wishlist item:',
          error
        )

        return
      }

      setWishlist(current =>
        current.filter(
          item =>
            item.sku !==
            product.sku
        )
      )

      return
    }

    /*
     * Add to wishlist
     */
    const {
      error
    } = await supabase
      .from('wishlists')
      .insert({
        user_id: user.id,
        customer_id: customerId,
        product_id: product.id
      })

    if (error) {
      console.error(
        'Unable to add wishlist item:',
        error
      )

      return
    }

    setWishlist(current => [
      ...current,
      product
    ])
  }

  const logout = async () => {
    await signOut()

    setUser(null)
    setOrders([])
  }

  return (
    <Context.Provider
      value={{
        products,
        user,
        setUser,
        cart,
        wishlist,
        orders,
        addToCart,
        updateCart,
        removeFromCart,
        clearCart,
        toggleWishlist,
        logout
      }}
    >
      {children}
    </Context.Provider>
  )
}

ReactDOM.createRoot(
  document.getElementById('root')
).render(
  <HashRouter>
    <Provider>
      <AdobePageView />
      <App />
    </Provider>
  </HashRouter>
)