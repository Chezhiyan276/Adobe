import { Link } from 'react-router-dom'
import ProductGrid from '../components/ProductGrid'
import { useApp } from '../main'
export default function Wishlist(){
 const {wishlist}=useApp()
 return <section className="section"><span className="eyebrow">SAVED FOR LATER</span><h1>Your wishlist</h1>{wishlist.length?<ProductGrid products={wishlist}/>:<div className="empty"><h3>Nothing saved yet</h3><p>Tap the heart on any product to save it.</p><Link className="btn dark" to="/products">Explore products</Link></div>}</section>
}
