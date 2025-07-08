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

        const categoriesRes = await api.get("categories/");
        const dbCategories = Array.isArray(categoriesRes.data)
          ? categoriesRes.data.map((cat) => ({
              id: parseInt(cat.id),
              title: cat.title,
            }))
          : [];
        setCategories(dbCategories);
      } catch (err) {
        console.error("Failed to fetch initial data:", err);
        setError("Failed to load initial data.");
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
      setProductData((prev) => ({ ...prev, category: "" }));
    } else {
      setShowCustomCategory(false);
      setProductData((prev) => ({ ...prev, category: parseInt(value) }));
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

      if (showCustomCategory && customCategory.trim()) {
        const newCategoryRes = await api.post("categories/", {
          title: customCategory,
          slug: customCategory.toLowerCase().replace(/\s+/g, "-"),
        });
        categoryId = parseInt(newCategoryRes.data.id);
      }

      formData.append("title", productData.title);
      formData.append("description", productData.description);
      formData.append("price", productData.price);
      formData.append("category", categoryId);
      formData.append("quantity", productData.quantity);
      formData.append("stock", productData.stock);
      formData.append("sku", productData.sku);
      formData.append("status", productData.status);

      if (productData.image) {
        formData.append("image", productData.image);
      }

      productData.tags.forEach((tag) => {
        formData.append("tags", tag);
      });

      await api.post("products/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      console.log(
        "%c✅ Product created successfully!",
        "color: green; font-weight: bold;"
      );
      console.log("🛍️ Created Product:", response.data);

      navigate("/products");
    } catch (err) {
      console.error("Error submitting product:", err);
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          err.message ||
          "Failed to create product."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses =
    "bg-[#F49CAC]/30 px-4 py-2 rounded-lg focus:outline-0 focus:ring-2 focus:ring-amber-600 w-full";
  const selectClasses =
    "bg-[#F49CAC]/30 px-4 py-2 rounded-lg focus:outline-0 focus:ring-2 focus:ring-amber-600 w-full";
  const textareaClasses =
    "bg-[#F49CAC]/30 px-4 py-2 rounded-lg focus:outline-0 focus:ring-2 focus:ring-amber-600 w-full";
  const fileInputClasses =
    "file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#F49CAC]/50 file:text-gray-700 hover:file:bg-[#F49CAC]/70 w-full";

  return (
    <div className="p-6 bg-white rounded-xl max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>

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
              <option value="other">Other</option>
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
            {isLoading ? "Saving..." : "Save Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
