import { Link } from 'react-router-dom'
import { ArrowUpRight, Sparkles } from 'lucide-react'
import ProductGrid from '../components/ProductGrid'
import { useApp } from '../main'
import { trackAdobe } from '../lib/adobeDataLayer'

export default function Home() {
  const {products} = useApp()
  const featured = products.slice(0,4)
  return <div>
    <section className="hero">
      <div className="hero-copy">
        <span className="eyebrow"><Sparkles size={15}/> NEW SEASON / 2026</span>
        <h1>Wear your<br/><em>everyday.</em></h1>
        <p>Elevated clothing, footwear and accessories designed around real life — clean lines, better materials, zero noise.</p>
        <Link className="btn dark" to="/products" onClick={()=>trackAdobe('hero_cta_click',{cta:'Shop New Season'})}>Shop New Season <ArrowUpRight size={18}/></Link>
      </div>
      <div className="hero-image"><img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=85" alt="Fashion"/></div>
    </section>
    <section className="category-strip">
      <Link to="/products?category=Clothing">CLOTHING <ArrowUpRight/></Link>
      <Link to="/products?category=Shoes">SHOES <ArrowUpRight/></Link>
      <Link to="/products?category=Accessories">ACCESSORIES <ArrowUpRight/></Link>
    </section>
    <section className="section">
      <div className="section-head"><div><span className="eyebrow">CURATED FOR YOU</span><h2>Featured pieces</h2></div><Link to="/products">View all <ArrowUpRight size={17}/></Link></div>
      <ProductGrid products={featured}/>
    </section>
    <section className="split-banner">
      <div><span className="eyebrow">THE URBANCART STANDARD</span><h2>Less trend.<br/><em>More style.</em></h2><p>Build a wardrobe that works harder. Essential silhouettes, considered details and versatile colour stories.</p><Link className="text-link" to="/products">Explore the collection <ArrowUpRight size={16}/></Link></div>
      <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1100&q=85" alt="Collection"/>
    </section>
    <section className="section">
      <div className="section-head"><div><span className="eyebrow">MOST LOVED</span><h2>Customer favourites</h2></div></div>
      <ProductGrid products={products.slice(4,8)}/>
    </section>
  </div>
}
