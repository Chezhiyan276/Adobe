import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useApp } from '../main'
import { createOrder } from '../lib/api'
import { productData, trackAdobe } from '../lib/adobeDataLayer'

export default function Checkout(){
 const {cart,user,clearCart}=useApp(); const navigate=useNavigate()
 const [form,setForm]=useState({full_name:'',phone:'',line1:'',city:'',state:'',postal_code:'',country:'India'})
 const [busy,setBusy]=useState(false),[error,setError]=useState('')
 const subtotal=cart.reduce((s,i)=>s+i.product.price*i.quantity,0),shipping=subtotal>=5000?0:149,discount=subtotal>=7500?Math.round(subtotal*.1):0,total=subtotal+shipping-discount
 async function submit(e){e.preventDefault();setBusy(true);setError('');try{const order=await createOrder(user.id,cart,form,{name:form.full_name,email:user.email,phone:form.phone});trackAdobe('purchase',{commerce:{currencyCode:'INR',value:order.total,orderId:order.order_number,products:cart.map(i=>productData(i.product,i.quantity,{size:i.size,color:i.color}))},user:{customerId:user.customer_id||user.id,email:user.email}});clearCart();navigate('/order-placed',{state:{order}})}catch(err){setError(err.message)}finally{setBusy(false)}}
 if(!user)return <Navigate to="/login" state={{from:'/checkout'}} replace/>
 if(!cart.length)return null
 return <section className="section checkout"><div><span className="eyebrow">CHECKOUT</span><h1>Almost yours.</h1><form className="checkout-form" onSubmit={submit}><h3>Delivery details</h3><div className="two"><label>Full name<input value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})} required/></label><label>Phone<input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} required/></label></div><label>Address<input value={form.line1} onChange={e=>setForm({...form,line1:e.target.value})} required/></label><div className="three"><label>City<input value={form.city} onChange={e=>setForm({...form,city:e.target.value})} required/></label><label>State<input value={form.state} onChange={e=>setForm({...form,state:e.target.value})} required/></label><label>PIN code<input value={form.postal_code} onChange={e=>setForm({...form,postal_code:e.target.value})} required/></label></div>{error&&<div className="error">{error}</div>}<div className="demo-note">No payment gateway is connected. Clicking “Place order” creates the order directly for Adobe journey testing.</div><button disabled={busy} className="btn dark"> {busy?'Placing order…':'Place order'} <ArrowRight size={17}/></button></form></div><aside className="summary"><h3>Order summary</h3>{cart.map(i=><div className="mini-product" key={i.product.sku+i.size}><img src={i.product.image_url}/><span>{i.product.name}<small>{i.quantity} × ₹{i.product.price.toLocaleString('en-IN')}</small></span></div>)}<hr/><div><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div><div><span>Shipping</span><span>{shipping?'₹'+shipping:'FREE'}</span></div>{discount>0&&<div><span>Discount</span><span>-₹{discount.toLocaleString('en-IN')}</span></div>}<div className="total"><span>Total</span><strong>₹{total.toLocaleString('en-IN')}</strong></div></aside></section>
}
