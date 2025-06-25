import React, { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Products from './pages/Products'
import Layout from './components/Layout'
import Home from './pages/Home'
import Users from './pages/Users'
import Orders from './pages/Orders'
import Analytics from './pages/Analytics'
import Reports from './pages/Reports'
import Login from './components/Login'
import Register from './components/Register'
import AddProduct from './components/AddProduct'

const useAuthCheck = () => {
  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('access_token')
      if (!token && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    };
    checkToken();
  }, [])
}

const App = () => {
  useAuthCheck();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path='users' element={<Users />} />
          <Route path='products' element={<Products />} />
          <Route path='orders' element={<Orders />} />
          <Route path='analytics' element={<Analytics />} />
          <Route path='reports' element={<Reports />} />
          <Route path='login' element={<Login />} />
          <Route path='register' element={<Register />} />
          <Route path='addproducts' element={<AddProduct />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
