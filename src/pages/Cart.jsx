import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react'
import { useApp } from '../main'
import { productData, trackAdobe } from '../lib/adobeDataLayer'

export default function Cart(){
 const {cart,updateCart,removeFromCart,user}=useApp(); const navigate=useNavigate()
 const subtotal=cart.reduce((s,i)=>s+i.product.price*i.quantity,0); const shipping=subtotal>=5000?0:149; const discount=subtotal>=7500?Math.round(subtotal*.1):0; const total=subtotal+shipping-discount
 function checkout(){trackAdobe('checkout_start',{commerce:{currencyCode:'INR',value:total,products:cart.map(i=>productData(i.product,i.quantity,{size:i.size,color:i.color}))}});if(!user) navigate('/login',{state:{from:'/checkout'}}); else navigate('/checkout')}
 if(!cart.length)return <section className="section empty"><h1>Your bag is empty</h1><p>Find something you love.</p><Link className="btn dark" to="/products">Shop now</Link></section>
 return <section className="section cart-page"><div><span className="eyebrow">YOUR BAG</span><h1>Shopping bag</h1>{cart.map((i,idx)=><div className="cart-item" key={i.product.sku+i.size+i.color}><img src={i.product.image_url}/><div className="cart-main"><div><h3>{i.product.name}</h3><p>{i.product.brand} · {i.color} · Size {i.size}</p></div><strong>₹{(i.product.price*i.quantity).toLocaleString('en-IN')}</strong><div className="cart-controls"><div className="qty"><button onClick={()=>updateCart(idx,i.quantity-1)}><Minus/></button><span>{i.quantity}</span><button onClick={()=>updateCart(idx,i.quantity+1)}><Plus/></button></div><button className="remove" onClick={()=>{removeFromCart(idx);trackAdobe('remove_from_cart',{commerce:{product:productData(i.product,i.quantity)}})}}><Trash2 size={16}/> Remove</button></div></div></div>)}</div><aside className="summary"><h3>Summary</h3><div><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div><div><span>Shipping</span><span>{shipping?'₹'+shipping:'FREE'}</span></div>{discount>0&&<div><span>Member discount</span><span>-₹{discount.toLocaleString('en-IN')}</span></div>}<hr/><div className="total"><span>Total</span><strong>₹{total.toLocaleString('en-IN')}</strong></div><button className="btn dark full" onClick={checkout}>Checkout <ArrowRight size={17}/></button></aside></section>
}
