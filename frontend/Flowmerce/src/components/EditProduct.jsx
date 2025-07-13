import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();

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

  const defaultCategories = [
    { id: "1", title: "Electronics" },
    { id: "2", title: "Clothing" },
    { id: "3", title: "Home & Garden" },
    { id: "4", title: "Beauty & Personal Care" },
    { id: "5", title: "Sports & Outdoors" },
    { id: "6", title: "Toys & Games" },
    { id: "7", title: "Food & Beverage" },
    { id: "8", title: "Books & Media" },
    { id: "9", title: "Office Supplies" },
    { id: "10", title: "Health & Wellness" },
    { id: "11", title: "Automotive" },
    { id: "12", title: "Pet Supplies" },
    { id: "13", title: "Household Goods" },
    { id: "14", title: "Jewelry & Accessories" },
    { id: "15", title: "Arts & Crafts" },
    { id: "16", title: "Other" },
  ];

  const inputClasses =
    "bg-[#F49CAC]/30 px-4 py-2 rounded-lg focus:outline-0 focus:ring-2 focus:ring-amber-600 w-full";
  const selectClasses =
    "bg-[#F49CAC]/30 px-4 py-2 rounded-lg focus:outline-0 focus:ring-2 focus:ring-amber-600 w-full";
  const textareaClasses =
    "bg-[#F49CAC]/30 px-4 py-2 rounded-lg focus:outline-0 focus:ring-2 focus:ring-amber-600 w-full";
  const fileInputClasses =
    "file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#F49CAC]/50 file:text-gray-700 hover:file:bg-[#F49CAC]/70 w-full";

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsFetching(true);
      setError(null);
      try {
        const [tagsRes, productRes] = await Promise.all([
          api.get("tags/"),
          api.get(`products/${id}/`)
        ]);

        const tagsData = Array.isArray(tagsRes.data)
          ? tagsRes.data
          : tagsRes.data?.data || [];
        setTags(tagsData);

        const prod = productRes.data;
        setProductData({
          title: prod.title || "",
          description: prod.description || "",
          price: prod.price || 0,
          category: prod.category || "",
          image: null,
          quantity: prod.quantity || 0,
          stock: prod.stock || 0,
          sku: prod.sku || "",
          tags: prod.tags || [],
          status: prod.status || "available",
        });

        try {
          const categoriesRes = await api.get("categories/");
          const dbCategories = Array.isArray(categoriesRes.data)
            ? categoriesRes.data.map((cat) => ({
                id: cat.id,
                title: cat.title,
              }))
            : [];
          setCategories([...defaultCategories, ...dbCategories]);
        } catch {
          setCategories(defaultCategories);
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load product or tags.");
        setCategories(defaultCategories);
      } finally {
        setIsFetching(false);
      }
    };

    fetchInitialData();
  }, [id]);

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
      setProductData((prev) => ({ ...prev, category: "" }));
    } else {
      setShowCustomCategory(false);
      setProductData((prev) => ({ ...prev, category: value }));
      setCustomCategory("");
    }
  };

  const handleCustomCategoryChange = (e) => {
    setCustomCategory(e.target.value);
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

      if (showCustomCategory && customCategory.trim() !== "") {
        const newCategory = await api.post("categories/", {
          title: customCategory,
          slug: customCategory.toLowerCase().replace(/\s+/g, "-"),
        });
        categoryId = newCategory.data.id;
      }

      formData.append("title", String(productData.title));
      formData.append("description", String(productData.description));
      formData.append("price", String(productData.price));
      formData.append("category", String(categoryId));
      formData.append("quantity", String(productData.quantity));
      formData.append("stock", String(productData.stock));
      formData.append("sku", String(productData.sku));
      formData.append("status", String(productData.status));

      if (productData.image) {
        formData.append("image", productData.image);
      }

      productData.tags.forEach((tag) => {
        formData.append("tags", String(tag));
      });

      const response = await api.patch(`products/${id}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      navigate("/products");
    } catch (err) {
      console.error("Error updating product:", err);
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          err.message ||
          "Failed to update product."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {typeof error === "object" ? JSON.stringify(error) : error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Title*
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SKU*
            </label>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price*
            </label>
            <input
              type="number"
              name="price"
              min="0.01"
              step="0.01"
              value={productData.price}
              onChange={handleChange}
              required
              className={inputClasses}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity*
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock*
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status*
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className={fileInputClasses}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={productData.description}
            onChange={handleChange}
            rows={4}
            className={textareaClasses}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          {isFetching ? (
            <div className="text-gray-500">Loading tags...</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  onClick={() => handleTagToggle(tag.id)}
                  className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                    productData.tags.includes(tag.id)
                      ? "bg-[#ff5c00] text-white"
                      : "bg-[#F49CAC]/30 text-gray-800 hover:bg-[#F49CAC]/50"
                  }`}
                >
                  {tag.title}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || isFetching}
            className={`px-6 py-2 rounded-lg text-white transition-colors ${
              isLoading || isFetching
                ? "bg-[#ff5c00]/70"
                : "bg-[#ff5c00] hover:bg-[#e65100]"
            }`}
          >
            {isLoading ? "Saving..." : "Update Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
