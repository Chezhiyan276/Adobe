import ProductCard from './ProductCard'
export default function ProductGrid({products}) {
  if (!products.length) return <div className="empty"><h3>No products found</h3><p>Try a different search or filter.</p></div>
  return <div className="product-grid">{products.map(p=><ProductCard key={p.id} product={p}/>)}</div>
}
