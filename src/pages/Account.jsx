import { Link, Navigate } from 'react-router-dom'
import { Package, Heart, MapPin, LogOut, ArrowUpRight } from 'lucide-react'
import { useApp } from '../main'
export default function Account(){
 const {user,logout,orders,wishlist}=useApp()
 if(!user)return <Navigate to="/login"/>
 return <section className="section account"><div className="account-head"><div><span className="eyebrow">MY ACCOUNT</span><h1>Hi, {user.user_metadata?.first_name||user.first_name||'there'}.</h1><p>{user.email}</p></div><button className="text-button" onClick={logout}><LogOut size={16}/> Sign out</button></div><div className="account-cards"><Link to="/orders"><Package/><span><strong>{orders.length}</strong><small>Orders</small></span></Link><Link to="/wishlist"><Heart/><span><strong>{wishlist.length}</strong><small>Wishlist</small></span></Link><Link to="/checkout"><MapPin/><span><strong>Fast</strong><small>Checkout</small></span></Link></div><div className="account-grid"><div><h3>Quick links</h3><Link to="/orders">Order history <ArrowUpRight/></Link><Link to="/wishlist">Saved favourites <ArrowUpRight/></Link><Link to="/products">Continue shopping <ArrowUpRight/></Link></div><div><h3>CDP profile</h3><p>Customer ID</p><strong>{user.customer_id||user.id}</strong><p className="small-muted">Use this identity in AEP testing and audience qualification.</p></div></div></section>
}
