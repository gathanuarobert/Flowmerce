import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2 } from "lucide-react";
import api from '../utils/api';

const statusColors = {
  "available": "text-green-600 bg-green-100",
  "out_of_stock": "text-red-600 bg-red-100",
  "coming_soon": "text-yellow-600 bg-yellow-100",
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(20);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories/");
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  fetchCategories();
}, []); 

  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products/');
        // Handle different API response structures
        const data = Array.isArray(response.data) 
          ? response.data 
          : response.data?.results || response.data?.data || [];
        setProducts(data);
        console.log("Fetched Products:", data);
      } catch (error) {
        setError(error.message);
        console.error('API error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = (products || []).filter(product => 
  product?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  getCategoryTitle(product?.category).toLowerCase().includes(searchTerm.toLowerCase())
);


  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleDelete = async (id) => {
    try {
      await api.delete(`products/${id}/`);
      setProducts(products.filter(product => product.id !== id));
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

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
          <Link to='/addproducts' relative="path">
            <button className="bg-[#ff5c00] text-white px-4 py-2 rounded-md cursor-pointer">
              + Add Product
            </button>
          </Link>
        </div>
      </div>

      {editingProduct && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
          <div className='bg-white p-6 rounded-lg w-1/2'>
            <h2 className='text-xl mb-4'>Edit Product</h2>
            <div className='flex justify-end gap-2 mt-4'>
              <button 
                className='px-4 py-2 bg-gray-300 rounded'
                onClick={() => setEditingProduct(null)}
              >
                Cancel
              </button>
              <button 
                className='px-4 py-2 bg-[#ff5c00] text-white rounded'
                onClick={() => setEditingProduct(null)}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <table className="w-full text-left">
        <thead>
          <tr className="bg-gray-100/30">
            <th className="py-2 cursor-pointer" onClick={() => requestSort('title')}>Product</th>
            <th className="py-2 cursor-pointer" onClick={() => requestSort('category')}>Category</th>
            <th className="py-2 cursor-pointer" onClick={() => requestSort('status')}>Status</th>
            <th className="py-2 cursor-pointer" onClick={() => requestSort('stock')}>Stock</th>
            <th className="py-2 cursor-pointer" onClick={() => requestSort('price')}>Price</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentProducts.map((prod) => (
            <tr key={prod.id} className="hover:bg-gray-50">
              <td className="py-3 flex items-center gap-3">
                {prod.image && (
  <img
    src={prod.image}
    alt={prod.title}
    className="w-10 h-10 rounded object-cover"
    onError={(e) => {
      e.target.style.display = 'none'; // hide broken image icons
    }}
  />
)}
                {prod.title}
              </td>
              <td>{prod.category_details?.title || "Uncategorized"}</td>
              <td>
                <span className={`px-2 py-1 rounded-full text-sm ${statusColors[prod.status] || 'bg-gray-100'}`}>
                  {prod.status === 'available' ? 'In Stock' : 
                   prod.status === 'out_of_stock' ? 'Out of Stock' : 
                   'Coming Soon'}
                </span>
              </td>
              <td>{prod.stock}</td>
              <td>KSh. {prod.price?.toFixed(2) || '0.00'}</td>
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