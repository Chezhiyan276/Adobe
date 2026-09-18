import { Link, Navigate } from 'react-router-dom'
import { useApp } from '../main'
export default function Orders(){
 const {user,orders}=useApp(); if(!user)return <Navigate to="/login"/>
 return <section className="section"><span className="eyebrow">ACCOUNT</span><h1>Order history</h1>{!orders.length?<div className="empty"><h3>No orders yet</h3><Link className="btn dark" to="/products">Start shopping</Link></div>:<div className="orders">{orders.map(o=><div className="order-card" key={o.id}><div><strong>{o.order_number}</strong><span>{new Date(o.created_at||Date.now()).toLocaleDateString('en-IN')}</span></div><div><span className="status">{o.status}</span><strong>₹{Number(o.total).toLocaleString('en-IN')}</strong></div></div>)}</div>}</section>
}
