import { Link, useLocation } from 'react-router-dom'
import { Check, ArrowRight } from 'lucide-react'
export default function OrderPlaced(){
 const {state}=useLocation(); const order=state?.order
 return <section className="success-page"><div className="success-icon"><Check size={32}/></div><span className="eyebrow">ORDER CONFIRMED</span><h1>It's on its way.</h1><p>Your UrbanCart order has been placed successfully. No payment was processed — this demo is designed for Adobe journey testing.</p><div className="order-number">{order?.order_number||'UrbanCart-DEMO'} · Placed</div><div className="success-actions"><Link className="btn dark" to="/orders">View order <ArrowRight size={17}/></Link><Link className="btn light-btn" to="/products">Continue shopping</Link></div></section>
}
