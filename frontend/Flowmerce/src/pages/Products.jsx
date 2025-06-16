import React, { useState } from 'react';
import { Pencil, Trash2 } from "lucide-react";
import api from '../utils/api';

const products = [
  {
    id: 1,
    image: "https://i.pinimg.com/736x/74/22/e3/7422e3d6bd8fd16026db52a10de2cfd0.jpg",
    name: "Mens T-shirt",
    category: "Clothes",
    status: "Out of Stock",
    stock: 449,
    price: 172.0,
  },
  {
    id: 2,
    image: "https://i.pinimg.com/736x/74/52/c3/7452c3eaf206fc15e95e3530359b8489.jpg",
    name: "Leather Hand Bag",
    category: "Bag",
    status: "In Stock",
    stock: 223,
    price: 112.0,
  },
  // Add more...
];

const fetchProducts = async () => {
  try {
    const response = await api.get('api/products/');
    return response.data
  } catch (error) {
    console.error('API error:', error);
    throw error
  }
}

const statusColors = {
  "In Stock": "text-green-600 bg-green-100",
  "Out of Stock": "text-red-600 bg-red-100",
  "Coming Soon": "text-yellow-600 bg-yellow-100",
};

const Products = () => {
  return (
    <div className="p-6 bg-white rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search..."
          className="px-4 py-2 bg-[#f49cac]/30 rounded-md w-1/3 focus:outline-0 focus:ring-2 focus:ring-amber-600"
        />
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-md shadow">Sort</button>
          <button className="px-4 py-2 rounded-md shadow">Filter</button>
          <button className="bg-[#ff5c00] text-white px-4 py-2 rounded-md cursor-pointer">
            + Add Product
          </button>
        </div>
      </div>

      <table className="w-full text-left">
        <thead>
          <tr className="bg-gray-100/30">
            <th className="py-2">Product</th>
            <th>Category</th>
            <th>Status</th>
            <th>Stock</th>
            <th>Price</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((prod) => (
            <tr key={prod.id} className="hover:bg-gray-50">
              <td className="py-3 flex items-center gap-3">
                <img src={prod.image} alt={prod.name} className="w-10 h-10 rounded" />
                {prod.name}
              </td>
              <td>{prod.category}</td>
              <td>
                <span
                  className={`px-2 py-1 rounded-full text-sm ${statusColors[prod.status]}`}
                >
                  {prod.status}
                </span>
              </td>
              <td>{prod.stock}</td>
              <td>${prod.price.toFixed(2)}</td>
              <td className="flex gap-2">
                <Pencil className="w-4 h-4 text-blue-600 cursor-pointer" />
                <Trash2 className="w-4 h-4 text-red-600 cursor-pointer" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Products;
