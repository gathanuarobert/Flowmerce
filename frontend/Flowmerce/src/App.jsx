import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Products from './pages/Products'
import Layout from './components/Layout'
import Home from './pages/Home'
import Members from './pages/Members'
import Orders from './pages/Orders'
import Analytics from './pages/Analytics'
import Reports from './pages/Reports'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path='members' element={<Members />} />
          <Route path='products' element={<Products />} />
          <Route path='orders' element={<Orders />} />
          <Route path='analytics' element={<Analytics />} />
          <Route path='reports' element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
