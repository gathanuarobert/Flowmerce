import React from "react";
import { BrowserRouter, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import Products from "./pages/Products";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Users from "./pages/Users";
import Orders from "./pages/Orders";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import Login from "./components/Login";
import Register from "./components/Register";
import AddProduct from "./components/AddProduct";
import EditProduct from "./components/EditProduct";
import CreateOrder from "./components/CreateOrder";
import { useEffect } from "react";

const useAuthCheck = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token && !["/login", "/register"].includes(location.pathname)) {
      navigate("/login", { replace: true });
    }
  }, [location.pathname, navigate]);
};

const AppRoutes = () => {
  useAuthCheck();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="users" element={<Users />} />
        <Route path="products" element={<Products />} />
        <Route path="orders" element={<Orders />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="reports" element={<Reports />} />
        <Route path="addproducts" element={<AddProduct />} />
        <Route path="editproduct/:id" element={<EditProduct />} />
        <Route path="createorder" element={<CreateOrder />} />
      </Route>
    </Routes>
  );
};

const App = () => (
  <BrowserRouter>
    <AppRoutes />
  </BrowserRouter>
);

export default App;
