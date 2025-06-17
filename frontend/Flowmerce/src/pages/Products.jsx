import React, { useEffect, useState } from 'react';
import { Pencil, Trash2 } from "lucide-react";
import api from '../utils/api';



const fetchProducts = async () => {
  try {
    const response = await api.get('/products/');
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
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState([]);
  const [setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc'})
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(20);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

 useEffect(() => {
    const getProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    getProducts();
  }, [setError]);

  const filteredProducts = products.filter(product => 
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction})
  };

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0
  });

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const paginate = (pageNumber) => setCurrentPage(pageNumber)
  const handleDelete = async (id) => {
    try {
      await api.delete(`api/products/${id}/`);
      setProducts(products.filter(product => product.id !== id));
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>
  // if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 bg-white rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 bg-[#f49cac]/30 rounded-md w-1/3 focus:outline-0 focus:ring-2 focus:ring-amber-600"
        />
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-md shadow">Sort</button>
          <button className="px-4 py-2 rounded-md shadow">Filter</button>
          <button className="bg-[#ff5c00] text-white px-4 py-2 rounded-md cursor-pointer"
          onClick={() => setShowAddModal(true)}
          >
            + Add Product
          </button>
        </div>
      </div>

      {editingProduct && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
          <div className='bg-white p-6 rounded-lg w-1/2'>
          <h2 className='text-xl mb-4'>
            Edit Product
          </h2>
          <div className='flex justify-end gap-2 mt-4'>
            <button className='px-4 py-2 bg-gray-300 rounded'
            onClick={() => setEditingProduct(null)}
            >
              Cancel
            </button>
            <button className='px-4 py-2 bg-[#ff5c00] text-white rounded'
            onClick={
              //add update logic here {handleUpdate}
              setEditingProduct(null)}
            >
              Save
            </button>
          </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className='bg-white p-6 rounded-lg w-1/2'>
          <h2 className='text-xl mb-4'>Add New product</h2>
          {/* Form fields go here */}
          <div className='flex justify-end gap-2 mt-4'>
            <button
            className='px-4 py-2 bg-gray-300 rounded'
            onClick={() => setShowAddModal(false)}
            >
              Cancel
            </button>
            <button
            className='px-4 py-2 bg-[#ff5c00] text-white rounded'
            onClick={() => {
                  // Implement add logic here
                  setShowAddModal(false);
                }}
            >
              Add
            </button>
          </div>
        </div>
      )}

      <table className="w-full text-left">
        <thead>
          <tr className="bg-gray-100/30">
            <th
            className="py-2 cursor-pointer"
            onClick={() => requestSort('title')}
            >Product</th>
            <th
            className="py-2 cursor-pointer"
            onClick={() => requestSort('category')}
            >Category</th>
            <th
            className="py-2 cursor-pointer"
            onClick={() => requestSort('status')}
            >Status</th>
            <th
            className="py-2 cursor-pointer"
            onClick={() => requestSort('stock')}
            >Stock</th>
            <th
            className="py-2 cursor-pointer"
            onClick={() => requestSort('price')}
            >Price</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentProducts.map((prod) => (
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
                <Pencil
                className="w-4 h-4 text-blue-600 cursor-pointer"
                onClick={() => setEditingProduct(prod)}
                />
                <Trash2
                className="w-4 h-4 text-red-600 cursor-pointer"
                onClick={() => handleDelete(prod.id)}
                 />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {sortedProducts.length > productsPerPage && (
        <div className='flex justify-center mt-4'>
          {[...Array(Math.ceil(sortedProducts.length / productsPerPage)).keys()].map(number => (
            <button
            key={number + 1}
            onClick={() => paginate(number + 1)}
            className={`mx-1 px-3 py-1 rounded ${currentPage === number + 1 ? 'bg-[#ff5c00] text-white' : 'bg-gray-200'}`}
            >
              {number + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
