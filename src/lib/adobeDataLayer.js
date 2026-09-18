function ensureLayer() {
  window.adobeDataLayer = window.adobeDataLayer || []
  return window.adobeDataLayer
}

export function trackAdobe(event, data = {}) {
  const payload = {
    event,
    timestamp: new Date().toISOString(),
    ...data
  }

  ensureLayer().push(payload)

  window.dispatchEvent(
    new CustomEvent('adobe-commerce-event', {
      detail: payload
    })
  )

  console.debug('[Adobe CDP Demo]', payload)
  return payload
}

export function productData(product, quantity = 1, extras = {}) {
  return {
    productID: product.sku,
    productName: product.name,
    brand: product.brand,
    category: product.category,
    subcategory: product.subcategory,
    price: Number(product.price),
    quantity,
    ...extras
  }
}
