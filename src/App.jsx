import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import {Login,Register} from './pages/Auth'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderPlaced from './pages/OrderPlaced'
import Account from './pages/Account'
import Orders from './pages/Orders'
import Wishlist from './pages/Wishlist'

export default function App(){
 return <Layout><Routes>
  <Route path="/" element={<Home/>}/>
  <Route path="/products" element={<Products/>}/>
  <Route path="/product/:id" element={<ProductDetail/>}/>
  <Route path="/login" element={<Login/>}/>
  <Route path="/register" element={<Register/>}/>
  <Route path="/cart" element={<Cart/>}/>
  <Route path="/checkout" element={<Checkout/>}/>
  <Route path="/order-placed" element={<OrderPlaced/>}/>
  <Route path="/account" element={<Account/>}/>
  <Route path="/orders" element={<Orders/>}/>
  <Route path="/wishlist" element={<Wishlist/>}/>
 </Routes></Layout>
}
