import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import api from "../utils/api";

const statusColors = {
  available: "text-green-600 bg-green-100",
  out_of_stock: "text-red-600 bg-red-100",
  coming_soon: "text-yellow-600 bg-yellow-100",
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(20);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [rawSearchTerm, setRawSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    category: "",
  });
  const [showFilters, setShowFilters] = useState(false);
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

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchTerm(rawSearchTerm);
    }, 300); // delay 300ms before filtering
    return () => clearTimeout(timeout);
  }, [rawSearchTerm]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories/");
        const dbCategories = Array.isArray(res.data)
          ? res.data.map((cat) => ({
              id: String(cat.id),
              title: cat.title,
            }))
          : [];

        setCategories([...defaultCategories, ...dbCategories]);
      } catch (error) {
        console.error("Failed to fetch categories, using defaults");
        setCategories(defaultCategories);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products/");
        // Handle different API response structures
        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.results || response.data?.data || [];
        setProducts(data);
        console.log("Fetched Products:", data);
      } catch (error) {
        setError(error.message);
        console.error("API error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
  console.log("FILTER CATEGORY:", filters.category);
  console.log("PRODUCT CATEGORIES:", products.map(p => ({
    id: p.id,
    cat: p.category,
    cat_details: p.category_details?.id
  })));
}, [filters.category]);


  const filteredProducts = products.filter((product) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      product?.title?.toLowerCase().includes(search) ||
      product?.category_details?.title?.toLowerCase().includes(search) ||
      product?.status?.toLowerCase().includes(search);

    const matchesStatus = !filters.status || product.status === filters.status;

    const matchesCategory =
      !filters.category ||
      String(product.category_details?.id) === String(filters.category);

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleDelete = async (id) => {
    try {
      await api.delete(`products/${id}/`);
      setProducts(products.filter((product) => product.id !== id));
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 md:bg-white rounded-xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-4">
        <input
          type="text"
          placeholder="Search by product, category, or status..."
          value={rawSearchTerm}
          onChange={(e) => setRawSearchTerm(e.target.value)}
          className="px-4 py-2 bg-[#f49cac]/30 rounded-4xl w-full sm:w-1/3 focus:outline-0 focus:ring-2 focus:ring-amber-600"
        />

        {showFilters && (
          <div className="flex flex-wrap gap-4 mb-4 justify-center">
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="px-3 py-2 rounded-4xl bg-[#f49cac]/30 focus:outline-0 focus:ring-2 focus:ring-amber-600"
            >
              <option value="">All Statuses</option>
              <option value="available">In Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>

            <select
              value={filters.category}
              onChange={(e) =>
                setFilters({ ...filters, category: e.target.value })
              }
              className="px-3 py-2 rounded-4xl bg-[#f49cac]/30 focus:outline-0 focus:ring-2 focus:ring-amber-600"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.title}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="px-4 py-2 rounded-4xl shadow bg-white"
          >
            Filter
          </button>
          <Link to="/addproducts" relative="path">
            <button className="bg-[#ff5c00] text-white px-4 py-2 rounded-4xl cursor-pointer">
              + Add Product
            </button>
          </Link>
        </div>
      </div>

      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-1/2">
            <h2 className="text-xl mb-4">Edit Product</h2>
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setEditingProduct(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-[#ff5c00] text-white rounded"
                onClick={() => setEditingProduct(null)}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="hidden md:block">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-100/30">
              <th
                className="py-2 cursor-pointer"
                onClick={() => requestSort("title")}
              >
                Product
              </th>
              <th
                className="py-2 cursor-pointer"
                onClick={() => requestSort("category")}
              >
                Category
              </th>
              <th
                className="py-2 cursor-pointer"
                onClick={() => requestSort("status")}
              >
                Status
              </th>
              <th
                className="py-2 cursor-pointer"
                onClick={() => requestSort("stock")}
              >
                Stock
              </th>
              <th
                className="py-2 cursor-pointer"
                onClick={() => requestSort("price")}
              >
                Price
              </th>
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
                        e.target.style.display = "none"; // hide broken image icons
                      }}
                    />
                  )}
                  {prod.title}
                </td>
                <td>{prod.category_details?.title || "Uncategorized"}</td>
                <td>
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      statusColors[prod.status] || "bg-gray-100"
                    }`}
                  >
                    {prod.status === "available"
                      ? "In Stock"
                      : prod.status === "out_of_stock"
                      ? "Out of Stock"
                      : "Coming Soon"}
                  </span>
                </td>
                <td>{prod.stock}</td>
                <td>KSh. {prod.price?.toFixed(2) || "0.00"}</td>
                <td className="flex gap-2">
                  <Link to={`/editproduct/${prod.id}`}>
                    <Pencil className="w-4 h-4 text-blue-600 cursor-pointer" />
                  </Link>
                  <Trash2
                    className="w-4 h-4 text-red-600 cursor-pointer"
                    onClick={() => handleDelete(prod.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-4">
        {currentProducts.map((prod) => (
          <div key={prod.id} className="rounded-xl p-4 shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-2">
              {prod.image && (
                <img
                  src={prod.image}
                  alt={prod.title}
                  className="w-12 h-12 rounded object-cover"
                  onError={(e) => (e.target.style.display = "none")}
                />
              )}
              <div>
                <p className="font-semibold">{prod.title}</p>
                <p className="text-sm text-gray-500">
                  {prod.category_details?.title || "Uncategorized"}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm mb-2">
              <span
                className={`px-2 py-1 rounded-full ${
                  statusColors[prod.status] || "bg-gray-100"
                }`}
              >
                {prod.status === "available"
                  ? "In Stock"
                  : prod.status === "out_of_stock"
                  ? "Out of Stock"
                  : "Coming Soon"}
              </span>
              <span className="font-medium">
                KSh. {prod.price?.toFixed(2) || "0.00"}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Stock: {prod.stock}</span>
              <div className="flex gap-3">
                <Link to={`/editproduct/${prod.id}`}>
                  <Pencil className="w-4 h-4 text-blue-600" />
                </Link>
                <Trash2
                  className="w-4 h-4 text-red-600"
                  onClick={() => handleDelete(prod.id)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedProducts.length > productsPerPage && (
        <div className="flex justify-center mt-4">
          {[
            ...Array(Math.ceil(sortedProducts.length / productsPerPage)).keys(),
          ].map((number) => (
            <button
              key={number + 1}
              onClick={() => paginate(number + 1)}
              className={`mx-1 px-3 py-1 rounded ${
                currentPage === number + 1
                  ? "bg-[#ff5c00] text-white"
                  : "bg-gray-200"
              }`}
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
