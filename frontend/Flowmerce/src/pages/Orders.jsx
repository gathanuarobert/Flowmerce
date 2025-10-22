import React, { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../utils/api";

const statusColors = {
  Pending: "text-yellow-600 bg-yellow-100",
  Completed: "text-green-600 bg-green-100",
  Cancelled: "text-red-600 bg-red-100",
  Shipped: "text-blue-600 bg-blue-100",
  Processing: "text-purple-600 bg-purple-100",
  Unfulfilled: "text-orange-600 bg-orange-100",
  Fulfilled: "text-green-600 bg-green-100",
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get("/orders/");
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.results || [];

        setOrders(data);

        // 🔹 Compute live stats from fetched orders
        const totalOrders = data.length;
        const fulfilledOrders = data.filter(
          (order) => order.status === "Completed" || order.status === "Fulfilled"
        ).length;
        const returnedOrders = data.filter(
          (order) => order.status === "Cancelled"
        ).length;
        const totalOrderItems = data.reduce(
          (sum, order) =>
            sum +
            (order.items?.reduce(
              (subSum, item) => subSum + (item.quantity || 0),
              0
            ) || 0),
          0
        );

        const statData = [
          {
            label: "Total Orders",
            value: totalOrders,
            trend: "+25.2%",
            trendColor: "text-green-600",
            sub: "last week",
          },
          {
            label: "Order items over time",
            value: totalOrderItems,
            trend: "+18.2%",
            trendColor: "text-green-600",
            sub: "last week",
          },
          {
            label: "Returned Orders",
            value: returnedOrders,
            trend: returnedOrders > 0 ? "+2.1%" : "-1.2%",
            trendColor:
              returnedOrders > 0 ? "text-red-600" : "text-green-600",
            sub: "last week",
          },
          {
            label: "Fulfilled Orders",
            value: fulfilledOrders,
            trend: "+12.2%",
            trendColor: "text-green-600",
            sub: "last week",
          },
        ];

        setStats(statData);
      } catch (err) {
        setError(err.message || "Failed to fetch orders");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getOrderValue = (order, key) => {
    if (!order) return "";
    const value = order[key];
    if (value === undefined || value === null) return "";
    if (key === "amount" && typeof value === "number") {
      return `$${value.toFixed(2)}`;
    }
    if (key === "date" && typeof value === "string") {
      const d = new Date(value);
      return d.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
    return String(value);
  };

  const sortedOrders = React.useMemo(() => {
    if (!Array.isArray(orders)) return [];
    return [...orders].sort((a, b) => {
      const aValue = getOrderValue(a, sortConfig.key);
      const bValue = getOrderValue(b, sortConfig.key);
      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [orders, sortConfig]);

  const filteredOrders = React.useMemo(() => {
    const term = searchTerm.toLowerCase();
    return sortedOrders.filter((order) => {
      try {
        return (
          getOrderValue(order, "id").toLowerCase().includes(term) ||
          getOrderValue(order, "employee_email").toLowerCase().includes(term) ||
          getOrderValue(order, "status").toLowerCase().includes(term)
        );
      } catch {
        return false;
      }
    });
  }, [sortedOrders, searchTerm]);

  const { currentOrders, totalPages } = React.useMemo(() => {
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(
      indexOfFirstOrder,
      indexOfLastOrder
    );
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    return { currentOrders, totalPages };
  }, [filteredOrders, currentPage, ordersPerPage]);

  const requestSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  if (loading) return <div className="p-8">Loading orders...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-10 bg-[#F9FAFB] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-1">Orders</h1>
        </div>
        <Link to="/createorder">
          <button className="flex items-center bg-[#ff5c00] text-white px-6 py-2 rounded-4xl font-medium shadow focus:outline-none cursor-pointer">
            <Plus className="mr-2 h-5 w-5" />
            Create order
          </button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((card) => (
          <div
            key={card.label}
            className="rounded-xl bg-white p-5 flex flex-col justify-between shadow border border-gray-100"
          >
            <div className="text-gray-600 text-sm mb-1">{card.label}</div>
            <div className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              {card.value}
              <span className={`text-xs font-medium ml-2 ${card.trendColor}`}>
                {card.trend}
              </span>
            </div>
            <div className="text-xs text-gray-400">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#F3F4F6] text-gray-600">
              <th className="py-4 px-4 font-semibold text-xs">Order</th>
              <th className="py-4 px-4 font-semibold text-xs">Date</th>
              <th className="py-4 px-4 font-semibold text-xs">Employee</th>
              <th className="py-4 px-4 font-semibold text-xs">Payment</th>
              <th className="py-4 px-4 font-semibold text-xs">Total</th>
              <th className="py-4 px-4 font-semibold text-xs">Fulfillment</th>
              <th className="py-4 px-4 font-semibold text-xs">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.length > 0 ? (
              currentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-[#ff5c00]">
                    {order.number || "N/A"}
                  </td>
                  <td className="py-3 px-4">
                    {order.order_date
                      ? new Date(order.order_date).toLocaleDateString("en-US", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "N/A"}
                  </td>
                  <td className="py-3 px-4">{order.employee_email || "N/A"}</td>
                  <td className="py-3 px-4">
                    <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-600">
                      Paid
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    Ksh {parseFloat(order.amount || 0).toFixed(2)}
                  </td>
                  <td className="py-3 px-4 font-medium">
                    <span
                      className={`text-xs px-3 py-1 rounded-full ${
                        statusColors[order.status] || "bg-gray-100"
                      }`}
                    >
                      {order.status || "N/A"}
                    </span>
                  </td>
                  <td className="py-3 px-4">...</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="py-6 text-center text-gray-500">
                  No orders available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`mx-1 px-4 py-2 rounded-4xl cursor-pointer ${
                currentPage === i + 1
                  ? "bg-[#ff5c00] text-white"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              } text-sm font-medium`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
