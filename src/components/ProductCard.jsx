import { Link } from 'react-router-dom'
import { Heart, Star } from 'lucide-react'
import { useApp } from '../main'
import { productData, trackAdobe } from '../lib/adobeDataLayer'

export default function ProductCard({product}) {
  const {wishlist, toggleWishlist} = useApp()
  const wished = wishlist.some(p=>p.sku===product.sku)

  function click() {
    trackAdobe('product_click', {commerce:{product:productData(product)}})
  }

  function wish(e) {
    e.preventDefault()
    toggleWishlist(product)
    trackAdobe('wishlist_add', {commerce:{product:productData(product)}})
  }

  return <Link to={`/product/${product.id}`} className="product-card" onClick={click}>
    <div className="product-image">
      <img src={product.image_url} alt={product.name}/>
      {product.compare_at_price && <span className="sale-tag">SALE</span>}
      <button className={`wish-float ${wished?'selected':''}`} onClick={wish}><Heart size={18} fill={wished?'currentColor':'none'}/></button>
    </div>
    <div className="product-info">
      <div className="product-meta"><span>{product.brand}</span><span><Star size={13} fill="currentColor"/> {product.rating}</span></div>
      <h3>{product.name}</h3>
      <div><strong>₹{Number(product.price).toLocaleString('en-IN')}</strong> {product.compare_at_price && <del>₹{Number(product.compare_at_price).toLocaleString('en-IN')}</del>}</div>
    </div>
  </Link>
}
