import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const AddProduct = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");

  const [productData, setProductData] = useState({
    title: "",
    description: "",
    price: 0,
    category: "",
    image: null,
    quantity: 0,
    stock: 0,
    sku: "",
    tags: [],
    status: "available",
  });

  // Default categories with IDs
  const defaultCategories = [
    { id: "electronics", title: "Electronics" },
    { id: "clothing", title: "Clothing" },
    { id: "home-garden", title: "Home & Garden" },
    { id: "beauty", title: "Beauty & Personal Care" },
    { id: "sports", title: "Sports & Outdoors" },
    { id: "toys", title: "Toys & Games" },
    { id: "food", title: "Food & Beverage" },
    { id: "books", title: "Books & Media" },
    { id: "office", title: "Office Supplies" },
    { id: "health", title: "Health & Wellness" },
    { id: "auto", title: "Automotive" },
    { id: "pets", title: "Pet Supplies" },
    { id: "household", title: "Household Goods" },
    { id: "jewelry", title: "Jewelry & Accessories" },
    { id: "arts", title: "Arts & Crafts" },
    { id: "other", title: "Other" },
  ];

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsFetching(true);
      setError(null);
      try {
        const tagsRes = await api.get("tags/");
        const tagsData = Array.isArray(tagsRes.data)
          ? tagsRes.data
          : tagsRes.data?.data || [];
        setTags(tagsData);

        try {
          const categoriesRes = await api.get("categories/");
          const dbCategories = Array.isArray(categoriesRes.data)
            ? categoriesRes.data.map(cat => ({ id: cat.id, title: cat.title }))
            : [];
          setCategories([...defaultCategories, ...dbCategories]);
        } catch (categoriesError) {
          console.error("Error fetching categories, using defaults:", categoriesError);
          setCategories(defaultCategories);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setError("Failed to load initial data. Please try again later.");
        setCategories(defaultCategories);
      } finally {
        setIsFetching(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value === "other") {
      setShowCustomCategory(true);
      setProductData(prev => ({ ...prev, category: "" }));
    } else {
      setShowCustomCategory(false);
      setProductData(prev => ({ ...prev, category: value }));
      setCustomCategory("");
    }
  };

  const handleCustomCategoryChange = (e) => {
    const value = e.target.value;
    setCustomCategory(value);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProductData((prev) => ({
        ...prev,
        image: e.target.files[0],
      }));
    }
  };

  const handleTagToggle = (tagId) => {
    setProductData((prev) => {
      const newTags = prev.tags.includes(tagId)
        ? prev.tags.filter((id) => id !== tagId)
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
      let categoryId = productData.category;

      // Handle custom category creation
      if (showCustomCategory && customCategory.trim() !== "") {
        try {
          const newCategory = await api.post("categories/", { 
            title: customCategory,
            slug: customCategory.toLowerCase().replace(/\s+/g, '-')
          });
          categoryId = newCategory.data.id;
        } catch (categoryError) {
          console.error("Error saving new category:", categoryError);
          throw categoryError;
        }
      }

      // Append all product data
      Object.entries({
        ...productData,
        category: categoryId
      }).forEach(([key, value]) => {
        if (key === "tags") {
          if (Array.isArray(value) && value.length > 0) {
            value.forEach(tagId => formData.append("tags", tagId));
          }
        } else if (key === "image") {
          if (value) formData.append("image", value);
        } else {
          const formattedValue = typeof value === "number" ? value.toString() : value;
          if (formattedValue !== null && formattedValue !== undefined) {
            formData.append(key, formattedValue);
          }
        }
      });

      const response = await api.post("products/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      navigate("/products");
    } catch (error) {
      console.error("Full error:", error);
      console.error("Error response:", error.response?.data);
      setError(
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Failed to create product. Please check your inputs and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ... (keep your existing styling classes)

  return (
    <div className="p-6 bg-white rounded-xl max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {typeof error === "object" ? JSON.stringify(error) : error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information - keep all other fields the same */}

        {/* Updated Category Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            name="category"
            value={productData.category}
            onChange={handleCategoryChange}
            className={selectClasses}
            disabled={isFetching}
          >
            <option value="">Select a category (optional)</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.title}
              </option>
            ))}
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

        {/* ... rest of your form remains the same ... */}
      </form>
    </div>
  );
};

export default AddProduct;