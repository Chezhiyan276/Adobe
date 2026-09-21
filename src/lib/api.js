import { supabase, supabaseConfigured } from './supabase'
import { demoProducts } from './products'

export async function getProducts() {
  if (!supabaseConfigured) return demoProducts

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Supabase products error:', error)
    throw error
  }

  if (!data?.length) {
    console.warn(
      'Supabase products table returned no active products'
    )
    return []
  }

  return data
}

export async function getProductById(id) {
  const products = await getProducts()

  return products.find(
    p => p.id === id || p.sku === id
  )
}

export async function signUp({
  email,
  password,
  firstName,
  lastName,
  phone = ''
}) {
  if (!supabaseConfigured) {
    const demoUser = {
      id: 'demo-user',
      email,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        phone
      },
      first_name: firstName,
      last_name: lastName,
      phone,
      customer_id: 'UC-CUST-DEMO01'
    }

    localStorage.setItem(
      'urbancart_demo_user',
      JSON.stringify(demoUser)
    )

    return {
      user: demoUser,
      demo: true,
      needsEmailConfirmation: false
    }
  }

  const { data, error } =
    await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone
        },
        emailRedirectTo:
          'https://chezhiyan276.github.io/Adobe/'
      }
    })

  if (error) throw error

  if (data.user) {
    const customerId =
      `UC-${data.user.id
        .replaceAll('-', '')
        .slice(0, 12)
        .toUpperCase()}`

    const { error: profileError } =
      await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          customer_id: customerId
        })

    if (profileError) {
      console.warn(
        'Profile creation warning:',
        profileError.message
      )
    }
  }

  return {
    user: data.user,
    demo: false,
    needsEmailConfirmation: !data.session
  }
}

export async function signIn({
  email,
  password
}) {
  if (!supabaseConfigured) {
    const existing =
      JSON.parse(
        localStorage.getItem(
          'urbancart_demo_user'
        ) || 'null'
      )

    const user =
      existing || {
        id: 'demo-user',
        email,
        user_metadata: {
          first_name: 'Demo',
          last_name: 'Customer'
        },
        first_name: 'Demo',
        last_name: 'Customer',
        customer_id: 'UC-CUST-DEMO01'
      }

    user.email = email

    localStorage.setItem(
      'urbancart_demo_user',
      JSON.stringify(user)
    )

    return {
      user,
      demo: true
    }
  }

  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password
    })

  if (error) throw error

  return {
    user: data.user,
    demo: false
  }
}

export async function signOut() {
  if (supabaseConfigured) {
    await supabase.auth.signOut()
  }

  localStorage.removeItem(
    'urbancart_demo_user'
  )
}

export async function getCurrentUser() {
  if (!supabaseConfigured) {
    return JSON.parse(
      localStorage.getItem(
        'urbancart_demo_user'
      ) || 'null'
    )
  }

  const { data } =
    await supabase.auth.getUser()

  return data.user || null
}

export async function createOrder(
  userId,
  cart,
  shippingAddress,
  customer = {}
) {
  const subtotal = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.product.price) *
        item.quantity,
    0
  )

  const shippingAmount =
    subtotal >= 5000 ? 0 : 149

  const discountAmount =
    subtotal >= 7500
      ? Math.round(subtotal * 0.1)
      : 0

  const total =
    subtotal +
    shippingAmount -
    discountAmount

  const orderNumber =
    `UC-${Date.now()
      .toString()
      .slice(-8)}`

  /*
   * Demo/local-storage mode
   */
  if (!supabaseConfigured) {
    const orders =
      JSON.parse(
        localStorage.getItem(
          'urbancart_demo_orders'
        ) || '[]'
      )

    const order = {
      id: crypto.randomUUID(),
      user_id: userId,
      customer_id: 'UC-CUST-DEMO01',
      order_number: orderNumber,
      status: 'placed',
      currency: 'INR',
      subtotal,
      shipping_amount: shippingAmount,
      discount_amount: discountAmount,
      total,
      customer_name:
        customer.name ||
        shippingAddress.full_name,
      customer_email:
        customer.email || '',
      customer_phone:
        customer.phone ||
        shippingAddress.phone ||
        '',
      shipping_address:
        shippingAddress,
      items: cart,
      created_at:
        new Date().toISOString()
    }

    orders.unshift(order)

    localStorage.setItem(
      'urbancart_demo_orders',
      JSON.stringify(orders)
    )

    return order
  }

  /*
   * Get the UrbanCart Customer ID
   * from the customer's profile.
   */
  const {
    data: profile,
    error: profileError
  } = await supabase
    .from('profiles')
    .select('customer_id')
    .eq('id', userId)
    .single()

  if (profileError) {
    console.error(
      'Unable to retrieve customer profile:',
      profileError
    )

    throw new Error(
      `Unable to retrieve customer ID: ${profileError.message}`
    )
  }

  const customerId =
    profile?.customer_id

  if (!customerId) {
    throw new Error(
      'Customer ID is missing from the customer profile'
    )
  }

  /*
   * Create the order
   */
  const {
    data: order,
    error
  } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      customer_id: customerId,
      order_number: orderNumber,
      status: 'placed',
      currency: 'INR',
      subtotal,
      shipping_amount: shippingAmount,
      discount_amount: discountAmount,
      total,
      customer_name:
        customer.name ||
        shippingAddress.full_name,
      customer_email:
        customer.email || '',
      customer_phone:
        customer.phone ||
        shippingAddress.phone ||
        '',
      shipping_address:
        shippingAddress
    })
    .select()
    .single()

  if (error) throw error

  /*
   * Create order items
   */
  const items = cart.map(item => ({
    order_id: order.id,

    product_id:
      item.product.id?.startsWith('demo-')
        ? null
        : item.product.id,

    sku: item.product.sku,
    product_name: item.product.name,
    quantity: item.quantity,
    unit_price:
      Number(item.product.price),
    size: item.size,
    color: item.color
  }))

  const { error: itemError } =
    await supabase
      .from('order_items')
      .insert(items)

  if (itemError) {
    throw itemError
  }

  return {
    ...order,
    items: cart
  }
}

export async function getOrders(
  userId
) {
  if (!supabaseConfigured) {
    return JSON.parse(
      localStorage.getItem(
        'urbancart_demo_orders'
      ) || '[]'
    )
  }

  const {
    data,
    error
  } = await supabase
    .from('orders')
    .select(
      '*, order_items(*)'
    )
    .eq('user_id', userId)
    .order('created_at', {
      ascending: false
    })

  if (error) {
    console.error(
      'Supabase orders error:',
      error
    )

    return []
  }

  return data || []
}

export async function saveAddress(
  userId,
  address
) {
  /*
   * Demo/local-storage mode
   */
  if (!supabaseConfigured) {
    const all =
      JSON.parse(
        localStorage.getItem(
          'urbancart_demo_addresses'
        ) || '[]'
      )

    const saved = {
      ...address,
      id: crypto.randomUUID(),
      user_id: userId,
      customer_id: 'UC-CUST-DEMO01'
    }

    all.unshift(saved)

    localStorage.setItem(
      'urbancart_demo_addresses',
      JSON.stringify(all)
    )

    return saved
  }

  /*
   * Get the UrbanCart Customer ID
   * from the customer's profile.
   */
  const {
    data: profile,
    error: profileError
  } = await supabase
    .from('profiles')
    .select('customer_id')
    .eq('id', userId)
    .single()

  if (profileError) {
    console.error(
      'Unable to retrieve customer profile:',
      profileError
    )

    throw new Error(
      `Unable to retrieve customer ID: ${profileError.message}`
    )
  }

  const customerId =
    profile?.customer_id

  if (!customerId) {
    throw new Error(
      'Customer ID is missing from the customer profile'
    )
  }

  /*
   * Save the address with both
   * Supabase user ID and UrbanCart Customer ID.
   */
  const {
    data,
    error
  } = await supabase
    .from('addresses')
    .insert({
      user_id: userId,
      customer_id: customerId,
      ...address
    })
    .select()
    .single()

  if (error) throw error

  return data
}