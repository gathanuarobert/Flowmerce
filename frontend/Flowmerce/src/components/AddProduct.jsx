import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const AddProduct = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  
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

  // Default categories that work for most businesses
  const defaultCategories = [
    'Electronics',
    'Clothing',
    'Home & Garden',
    'Beauty & Personal Care',
    'Sports & Outdoors',
    'Toys & Games',
    'Food & Beverage',
    'Books & Media',
    'Office Supplies',
    'Health & Wellness',
    'Automotive',
    'Pet Supplies',
    'Other'
  ];

  // Fetch tags when component mounts
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsFetching(true);
      setError(null);
      try {
        const tagsRes = await api.get('/tags/');
        
        const tagsData = Array.isArray(tagsRes.data) 
          ? tagsRes.data 
          : tagsRes.data?.data || [];
        
        setTags(tagsData);
        
        // Combine default categories with any from the database
        try {
          const categoriesRes = await api.get('/categories/');
          const dbCategories = Array.isArray(categoriesRes.data)
            ? categoriesRes.data.map(cat => cat.title)
            : [];
          setCategories([...new Set([...defaultCategories, ...dbCategories])]);
        } catch (categoriesError) {
          console.error('Error fetching categories, using defaults:', categoriesError);
          setCategories(defaultCategories);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setError('Failed to load initial data. Please try again later.');
        setCategories(defaultCategories);
      } finally {
        setIsFetching(false);
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

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value === 'Other') {
      setShowCustomCategory(true);
      setProductData(prev => ({ ...prev, category: '' }));
    } else {
      setShowCustomCategory(false);
      setProductData(prev => ({ ...prev, category: value }));
      setCustomCategory('');
    }
  };

  const handleCustomCategoryChange = (e) => {
    const value = e.target.value;
    setCustomCategory(value);
    setProductData(prev => ({ ...prev, category: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProductData(prev => ({
        ...prev,
        image: e.target.files[0]
      }));
    }
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
    setError(null);
    
    try {
      const formData = new FormData();
      
      // Append all product data to formData
      Object.entries(productData).forEach(([key, value]) => {
        if (key === 'tags' && Array.isArray(value) && value.length > 0) {
          value.forEach(tagId => formData.append('tags[]', tagId));
        } else if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      // If a custom category was entered, save it to the database first
      if (showCustomCategory && customCategory.trim() !== '') {
        try {
          await api.post('/categories/', { title: customCategory });
        } catch (categoryError) {
          console.error('Error saving new category:', categoryError);
        }
      }

      await api.post('/products/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      navigate('/products');
    } catch (error) {
      console.error('Error creating product:', error);
      setError('Failed to create product. Please check your inputs and try again.');
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
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category"
              value={productData.category === customCategory ? 'Other' : productData.category}
              onChange={handleCategoryChange}
              className={selectClasses}
              disabled={isFetching}
            >
              <option value="">Select a category (optional)</option>
              {isFetching ? (
                <option disabled>Loading categories...</option>
              ) : (
                categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))
              )}
            </select>
            
            {showCustomCategory && (
              <div className="mt-2">
                <input
                  type="text"
                  name="customCategory"
                  placeholder="Enter your custom category"
                  value={customCategory}
                  onChange={handleCustomCategoryChange}
                  className={inputClasses}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price*</label>
            <input
              type="number"
              name="price"
              min="0"
              step="0.01"
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
          {isFetching ? (
            <div className="text-gray-500">Loading tags...</div>
          ) : (
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
          )}
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
            disabled={isLoading || isFetching}
            className={`px-6 py-2 rounded-lg text-white transition-colors ${
              isLoading || isFetching ? 'bg-[#ff5c00]/70' : 'bg-[#ff5c00] hover:bg-[#e65100]'
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