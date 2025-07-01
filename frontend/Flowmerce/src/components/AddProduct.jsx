import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const AddProduct = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [productData, setProductData] = useState({
    title: '',
    description: '',
    price: 0,
    category: '',
    image: null,
    quantity: 0,
    stock: 0,
    sku: '',
    tags: [],
    status: 'available'
  });

  // Fetch categories and tags when component mounts
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [categoriesRes, tagsRes] = await Promise.all([
          api.get('/categories/'),
          api.get('/tags/')
        ]);
        
        setCategories(categoriesRes.data);
        setTags(tagsRes.data);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    
    fetchInitialData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setProductData(prev => ({
      ...prev,
      image: e.target.files[0]
    }));
  };

  const handleTagToggle = (tagId) => {
    setProductData(prev => {
      const newTags = prev.tags.includes(tagId)
        ? prev.tags.filter(id => id !== tagId)
        : [...prev.tags, tagId];
      return { ...prev, tags: newTags };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      
      // Append all product data to formData
      Object.entries(productData).forEach(([key, value]) => {
        if (key === 'tags') {
          value.forEach(tagId => formData.append('tags', tagId));
        } else if (value !== null) {
          formData.append(key, value);
        }
      });

      const response = await api.post('/products/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      navigate('/products'); // Redirect to products page after success
    } catch (error) {
      console.error('Error creating product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Custom input classes for consistent styling
  const inputClasses = "bg-[#F49CAC]/30 px-4 py-2 rounded-lg focus:outline-0 focus:ring-2 focus:ring-amber-600 w-full";
  const selectClasses = "bg-[#F49CAC]/30 px-4 py-2 rounded-lg focus:outline-0 focus:ring-2 focus:ring-amber-600 w-full";
  const textareaClasses = "bg-[#F49CAC]/30 px-4 py-2 rounded-lg focus:outline-0 focus:ring-2 focus:ring-amber-600 w-full";
  const fileInputClasses = "file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#F49CAC]/50 file:text-gray-700 hover:file:bg-[#F49CAC]/70 w-full";

  return (
    <div className="p-6 bg-white rounded-xl max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Title*</label>
            <input
              type="text"
              name="title"
              value={productData.title}
              onChange={handleChange}
              required
              className={inputClasses}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SKU*</label>
            <input
              type="text"
              name="sku"
              value={productData.sku}
              onChange={handleChange}
              required
              className={inputClasses}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category*</label>
            <select
              name="category"
              value={productData.category}
              onChange={handleChange}
              required
              className={selectClasses}
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price*</label>
            <input
              type="number"
              name="price"
              min="0"
              value={productData.price}
              onChange={handleChange}
              required
              className={inputClasses}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity*</label>
            <input
              type="number"
              name="quantity"
              min="0"
              value={productData.quantity}
              onChange={handleChange}
              required
              className={inputClasses}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock*</label>
            <input
              type="number"
              name="stock"
              min="0"
              value={productData.stock}
              onChange={handleChange}
              required
              className={inputClasses}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status*</label>
            <select
              name="status"
              value={productData.status}
              onChange={handleChange}
              required
              className={selectClasses}
            >
              <option value="available">Available</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className={fileInputClasses}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={productData.description}
            onChange={handleChange}
            rows={4}
            className={textareaClasses}
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <div 
                key={tag.id}
                onClick={() => handleTagToggle(tag.id)}
                className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                  productData.tags.includes(tag.id)
                    ? 'bg-[#ff5c00] text-white'
                    : 'bg-[#F49CAC]/30 text-gray-800 hover:bg-[#F49CAC]/50'
                }`}
              >
                {tag.title}
              </div>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`px-6 py-2 rounded-lg text-white transition-colors ${
              isLoading ? 'bg-[#ff5c00]/70' : 'bg-[#ff5c00] hover:bg-[#e65100]'
            }`}
          >
            {isLoading ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;