import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductGrid from '../components/ProductGrid'
import { useApp } from '../main'
import { trackAdobe } from '../lib/adobeDataLayer'

export default function Products() {
  const {products} = useApp()
  const [params,setParams] = useSearchParams()
  const search=params.get('search')||''
  const category=params.get('category')||'All'
  const sort=params.get('sort')||'featured'

  const filtered=useMemo(()=>{
    let p=[...products]
    if(search) p=p.filter(x=>`${x.name} ${x.brand} ${x.category} ${x.subcategory}`.toLowerCase().includes(search.toLowerCase()))
    if(category!=='All') p=p.filter(x=>x.category===category)
    if(sort==='price-low') p.sort((a,b)=>a.price-b.price)
    if(sort==='price-high') p.sort((a,b)=>b.price-a.price)
    if(sort==='new') p=p.reverse()
    return p
  },[products,search,category,sort])

  function changeCategory(e) {
    const v=e.target.value
    const next=new URLSearchParams(params)
    if(v==='All') next.delete('category'); else next.set('category',v)
    setParams(next)
  }

  return <section className="section products-page">
    <div className="listing-top">
      <div><span className="eyebrow">THE COLLECTION</span><h1>{search?`Search: ${search}`:category==='All'?'All products':category}</h1><p>{filtered.length} pieces</p></div>
      <select value={category} onChange={changeCategory}><option>All</option><option>Clothing</option><option>Shoes</option><option>Accessories</option></select>
      <select value={sort} onChange={e=>{const n=new URLSearchParams(params);n.set('sort',e.target.value);setParams(n);trackAdobe('product_list_sort',{sort:e.target.value})}}><option value="featured">Featured</option><option value="new">Newest</option><option value="price-low">Price: Low to high</option><option value="price-high">Price: High to low</option></select>
    </div>
    <ProductGrid products={filtered}/>
  </section>
}
