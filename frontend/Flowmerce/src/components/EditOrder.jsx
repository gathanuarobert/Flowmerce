import React, { useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { useEffect } from "react";


const PRIMARY_COLOR = "#ff5c00";

const inputClasses =
  "bg-[#F49CAC]/30 px-4 py-2 rounded-4xl focus:outline-none focus:ring-2 focus:ring-amber-600 w-full";
const selectClasses = inputClasses;
const tableInputClasses =
  "bg-[#F49CAC]/30 px-2 py-1 rounded-4xl focus:outline-none focus:ring-2 focus:ring-amber-600 w-full text-sm";

const STATUS_OPTIONS = ["Pending", "Completed", "Cancelled"];

function EditOrder() {
  const navigate = useNavigate();
  const { id } = useParams();


  const [orderItems, setOrderItems] = useState([
    {
      productTitle: "",
      sku: "",
      quantity: 1,
      productPrice: 0, // Changed from empty string to 0
      productId: null,
      isLoading: false,
      suggestions: [], // 👈 add this
    },
  ]);

  useEffect(() => {
  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}/`);
      const order = res.data;

      setStatus(order.status || "Pending");

      if (order.order_date) {
        setOrderDate(order.order_date.split("T")[0]);
      }

      setOrderItems(
        order.items.map((item) => ({
          productTitle: item.product_title,
          sku: item.product_sku,
          quantity: item.quantity,
          productPrice: item.product_price,
          productId: item.product,
          isLoading: false,
          suggestions: [],
        }))
      );
    } catch (error) {
      toast.error("Failed to load order");
      navigate("/orders");
    }
  };

  fetchOrder();
}, [id, navigate]);


  const [orderDate, setOrderDate] = useState("");
  const [status, setStatus] = useState("Pending");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productSuggestions, setProductSuggestions] = useState([]);

  // -- Order items field changes --
  const updateOrderItem = async (index, field, value) => {
    setOrderItems((prev) => {
      const newItems = [...prev];
      newItems[index][field] =
        field === "quantity" || field === "productPrice"
          ? Number(value)
          : value;
      if ((field === "sku" || field === "productTitle") && value.length > 2) {
        newItems[index].isLoading = true;
      }
      return newItems;
    });

    if ((field === "sku" || field === "productTitle") && value.length > 2) {
      try {
        const res = await api.get("/products/", { params: { search: value } });
        const results = Array.isArray(res.data)
          ? res.data
          : res.data.results || [];

        console.log(`Search results for row ${index}:`, results);

        setOrderItems((prevItems) => {
          const newItems = [...prevItems];
          newItems[index].suggestions = results;
          newItems[index].isLoading = false;
          return newItems;
        });
      } catch (err) {
        console.error("Product search error:", err);
        setOrderItems((prevItems) => {
          const newItems = [...prevItems];
          newItems[index].isLoading = false;
          return newItems;
        });
      }
    }
  };

  const addOrderItem = () => {
    setOrderItems((prev) => [
      ...prev,
      {
        productTitle: "",
        sku: "",
        quantity: 1,
        productPrice: 0,
        productId: null,
        isLoading: false,
        suggestions: [], // 👈 add this
      },
    ]);
  };

  const removeOrderItem = (index) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
  };

  // ---- Handle Save Order ----
  const handleUpdateOrder = async () => {
  // Debug: Log items to see why validation might fail
  console.log("Current Items:", orderItems);

  const validItems = orderItems.filter(
    (item) => item.productId && item.quantity > 0 && item.productPrice > 0
  );

  if (validItems.length === 0) {
    toast.error("Please select products from the search list to ensure they have IDs.");
    return;
  }

  setIsSubmitting(true);

  try {
    // 1. Update order main fields
    await api.patch(`/orders/${id}/`, {
      status,
      order_date: orderDate
        ? `${orderDate}T00:00:00Z`
        : new Date().toISOString(),
    });

    // 2. Delete existing order items
    await api.delete(`/orders/${id}/items/`);

    // 3. Re-create items in parallel (Better than a for loop)
    const itemPromises = validItems.map((item) =>
      api.post(`/orders/${id}/items/`, {
        product: item.productId,
        quantity: item.quantity,
        product_title: item.productTitle,
        product_price: item.productPrice,
        product_sku: item.sku,
      })
    );

    await Promise.all(itemPromises);

    toast.success("Order updated successfully!");
    
    // Use a small delay if the toast disappears too fast, 
    // or just navigate immediately
    navigate("/orders");

  } catch (error) {
    console.error("Update failed:", error.response?.data || error.message);
    toast.error("Failed to update order. Check console for details.");
  } finally {
    setIsSubmitting(false);
  }
};

  const totalAmount = orderItems.reduce(
    (sum, item) => sum + Number(item.productPrice) * Number(item.quantity),
    0
  );

  const handleSelectSuggestion = (index, product) => {
    setOrderItems((prev) => {
      const newItems = [...prev];
      newItems[index] = {
        ...newItems[index],
        productId: product.id,
        productTitle: product.title,
        sku: product.sku,
        productPrice: product.price,
        suggestions: [],
      };
      return newItems;
    });
  };

  return (
    <div className="flex justify-center py-10 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-md border border-gray-100 w-full max-w-6xl p-8">
        <Link
          to="/orders"
          className="flex items-center text-gray-500 text-sm mb-6 hover:text-orange-500 transition"
        >
          <IoIosArrowBack className="mr-1 text-lg" />
          Back to orders
        </Link>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">
            Edit Order
          </h1>
          <div className="space-x-2">
            <button onClick={() => navigate("/orders")} className="px-4 py-2 border border-gray-300 rounded-4xl text-sm text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              className={`px-5 py-2 rounded-4xl text-sm font-semibold ${
                isSubmitting ? "opacity-50 cursor-wait" : ""
              }`}
              style={{
                backgroundColor: PRIMARY_COLOR,
                color: "#fff",
                boxShadow: "0 2px 8px rgba(255,92,0,0.15)",
              }}
              onClick={handleUpdateOrder}
            >
              {isSubmitting ? "Updating..." : "Update Order"}
            </button>
          </div>
        </div>

        <section className="mb-10">
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            Order Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-lg">
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Order Status
              </label>
              <select
                name="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={selectClasses}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="orderDate"
                className="block text-sm text-gray-500 mb-1"
              >
                Order Date
              </label>
              <input
                type="date"
                id="orderDate"
                name="orderDate"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className={inputClasses}
              />
            </div>
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-700">Product Items</h2>
            <button
              className="text-sm font-medium text-orange-600 hover:bg-orange-50 px-3 py-1 rounded transition"
              onClick={addOrderItem}
              type="button"
            >
              + Add Item
            </button>
          </div>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="py-2 px-2 border border-gray-200">
                    Product Title
                  </th>
                  <th className="py-2 px-2 border border-gray-200">SKU</th>
                  <th className="py-2 px-2 border border-gray-200">Quantity</th>
                  <th className="py-2 px-2 border border-gray-200">Price</th>
                  <th className="py-2 px-2 border border-gray-200">Amount</th>
                  <th className="py-2 px-2 border border-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map((item, idx) => {
                  const amount = item.productPrice * item.quantity;
                  return (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="py-2 px-2 border border-gray-200">
                        <input
                          className={tableInputClasses}
                          value={item.productTitle}
                          onChange={(e) =>
                            updateOrderItem(idx, "productTitle", e.target.value)
                          }
                          placeholder="Type product name"
                          list={`product-title-list-${idx}`}
                          autoComplete="off"
                        />

                        {item.suggestions.length > 0 && (
                          <ul className="absolute left-0 right-0 bg-[#F49CAC]/30 backdrop-blur-md border border-[#ff5c00]/30 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto animate-fadeIn z-20">
                            {item.suggestions.map((product) => (
                              <li
                                key={product.id}
                                onClick={() =>
                                  handleSelectSuggestion(idx, product)
                                }
                                className="px-3 py-2 text-sm text-gray-800 hover:bg-[#ff5c00]/10 hover:text-[#ff5c00] cursor-pointer transition-colors duration-200 rounded-lg"
                              >
                                <div className="flex justify-between items-center">
                                  <span>{product.title}</span>
                                  <span className="text-xs text-gray-600 font-medium">
                                    Ksh {product.price}
                                  </span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}

                        {item.isLoading && (
                          <span className="text-xs text-gray-400 ml-1">
                            Loading...
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-2 border border-gray-200">
                        <input
                          className={tableInputClasses}
                          value={item.sku}
                          onChange={(e) =>
                            updateOrderItem(idx, "sku", e.target.value)
                          }
                          placeholder="Type SKU"
                          autoComplete="off"
                        />
                        {item.isLoading && (
                          <span className="text-xs text-gray-400 ml-1">
                            Loading...
                          </span>
                        )}
                      </td>

                      <td className="py-2 px-2 border border-gray-200">
                        <input
                          type="number"
                          min="1"
                          className={tableInputClasses}
                          value={item.quantity}
                          onChange={(e) =>
                            updateOrderItem(idx, "quantity", e.target.value)
                          }
                        />
                      </td>
                      <td className="py-2 px-2 border border-gray-200">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className={tableInputClasses}
                          value={item.productPrice}
                          onChange={(e) =>
                            updateOrderItem(idx, "productPrice", e.target.value)
                          }
                        />
                      </td>
                      <td className="py-2 px-2 border border-gray-200 font-semibold">
                        Ksh{amount.toFixed(2)}
                      </td>
                      <td className="py-2 px-2 border border-gray-200 text-center">
                        <button
                          className="text-red-600 hover:text-red-800 font-semibold"
                          onClick={() => removeOrderItem(idx)}
                          type="button"
                          aria-label="Remove item"
                        >
                          &times;
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end items-center border-t border-gray-200 pt-3">
            <span className="mr-4 text-gray-600 font-semibold">Total:</span>
            <span
              className="text-lg font-bold"
              style={{ color: PRIMARY_COLOR }}
            >
              Ksh {totalAmount.toFixed(2)}
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}

export default EditOrder;
