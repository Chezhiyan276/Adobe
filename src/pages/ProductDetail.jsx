import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Heart, Minus, Plus, ShoppingBag, Star } from 'lucide-react'
import { useApp } from '../main'
import { productData, trackAdobe } from '../lib/adobeDataLayer'
import ProductGrid from '../components/ProductGrid'

export default function ProductDetail() {
  const {id}=useParams()
  const {products,addToCart,wishlist,toggleWishlist}=useApp()
  const product=products.find(p=>p.id===id)
  const [size,setSize]=useState(product?.sizes?.[0]||'')
  const [color,setColor]=useState(product?.colors?.[0]||'')
  const [qty,setQty]=useState(1)
  const navigate=useNavigate()

  useEffect(()=>{ if(product) trackAdobe('product_view',{commerce:{product:productData(product)}}) },[product])

  if(!product) return <section className="section empty"><h2>Product not found</h2><Link to="/products">Back to shop</Link></section>

  const add=()=>{ addToCart(product,{size,color,quantity:qty}); trackAdobe('add_to_cart',{commerce:{currencyCode:'INR',value:product.price*qty,product:productData(product,qty,{size,color})}}); navigate('/cart') }
  const wish=()=>{toggleWishlist(product);trackAdobe('wishlist_add',{commerce:{product:productData(product)}})}

  return <section className="section detail">
    <div className="detail-image"><img src={product.image_url} alt={product.name}/></div>
    <div className="detail-copy">
      <div className="product-meta"><span>{product.brand} / {product.category}</span><span><Star size={14} fill="currentColor"/> {product.rating} ({product.review_count})</span></div>
      <h1>{product.name}</h1>
      <div className="detail-price"><strong>₹{Number(product.price).toLocaleString('en-IN')}</strong>{product.compare_at_price&&<del>₹{Number(product.compare_at_price).toLocaleString('en-IN')}</del>}</div>
      <p>{product.description}</p>
      <div className="option-block"><label>SIZE</label><div className="option-row">{product.sizes.map(s=><button className={size===s?'selected':''} onClick={()=>setSize(s)} key={s}>{s}</button>)}</div></div>
      <div className="option-block"><label>COLOR</label><div className="option-row">{product.colors.map(c=><button className={color===c?'selected':''} onClick={()=>setColor(c)} key={c}>{c}</button>)}</div></div>
      <div className="buy-row"><div className="qty"><button onClick={()=>setQty(Math.max(1,qty-1))}><Minus/></button><span>{qty}</span><button onClick={()=>setQty(qty+1)}><Plus/></button></div><button className="btn dark grow" onClick={add}><ShoppingBag size={18}/> Add to cart</button><button className="icon-square" onClick={wish}><Heart fill={wishlist.some(p=>p.sku===product.sku)?'currentColor':'none'}/></button></div>
      <div className="trust"><div><strong>FREE SHIPPING</strong><span>On orders over ₹5,000</span></div><div><strong>EASY RETURNS</strong><span>30 day returns</span></div><div><strong>SECURE</strong><span>Protected checkout</span></div></div>
    </div>
    <div className="detail-description"><h3>Details</h3><p>{product.description} Designed with a focus on comfort, movement and everyday versatility.</p></div>
  </section>
}
