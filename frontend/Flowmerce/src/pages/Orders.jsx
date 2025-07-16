import React, { useState, useEffect } from 'react';
import { Search, ChevronUp, ChevronDown, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const statusColors = {
  "Pending": "text-yellow-600 bg-yellow-100",
  "Completed": "text-green-600 bg-green-100",
  "Cancelled": "text-red-600 bg-red-100",
  "Shipped": "text-blue-600 bg-blue-100",
  "Processing": "text-purple-600 bg-purple-100",
  "Unfulfilled": "text-orange-600 bg-orange-100",
  "Fulfilled": "text-green-600 bg-green-100"
};

const paymentColors = {
  "Paid": "text-green-600 bg-green-100",
  "Success": "text-green-600 bg-green-100",
  "Pending": "text-yellow-600 bg-yellow-100",
  "Failed": "text-red-600 bg-red-100"
};

const getOrderValue = (order, key) => {
  if (!order) return '';
  const value = order[key];
  if (value === undefined || value === null) return '';
  if (key === 'amount' && typeof value === 'number') {
    return `$${value.toFixed(2)}`;
  }
  if (key === 'date' && typeof value === 'string') {
    // Format as e.g. "15 Feb, 2024"
    const d = new Date(value);
    return d.toLocaleDateString("en-US", { day: '2-digit', month: 'short', year: 'numeric' });
  }
  return String(value);
};

const statCards = [
  { label: "Total Orders", value: "21", trend: "+25.2%", trendColor: "text-green-600", sub: "last week" },
  { label: "Order items over time", value: "15", trend: "+18.2%", trendColor: "text-green-600", sub: "last week" },
  { label: "Returns Orders", value: "0", trend: "-1.2%", trendColor: "text-red-600", sub: "last week" },
  { label: "Fulfilled orders over time", value: "12", trend: "+12.2%", trendColor: "text-green-600", sub: "last week" },
];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/orders/');
        setOrders(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError(err.message || 'Failed to fetch orders');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const sortedOrders = React.useMemo(() => {
    if (!Array.isArray(orders)) return [];
    return [...orders].sort((a, b) => {
      const aValue = getOrderValue(a, sortConfig.key);
      const bValue = getOrderValue(b, sortConfig.key);
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [orders, sortConfig]);

  const filteredOrders = React.useMemo(() => {
    if (!Array.isArray(sortedOrders)) return [];
    const term = searchTerm.toLowerCase();
    return sortedOrders.filter(order => {
      try {
        return (
          getOrderValue(order, 'id').toLowerCase().includes(term) ||
          getOrderValue(order, 'customer').toLowerCase().includes(term) ||
          getOrderValue(order, 'status').toLowerCase().includes(term)
        );
      } catch {
        return false;
      }
    });
  }, [sortedOrders, searchTerm]);

  const { currentOrders, totalPages } = React.useMemo(() => {
    if (!Array.isArray(filteredOrders)) {
      return { currentOrders: [], totalPages: 0 };
    }
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    return { currentOrders, totalPages };
  }, [filteredOrders, currentPage, ordersPerPage]);

  const requestSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  if (loading) return <div className="p-8">Loading orders...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-10 bg-[#F9FAFB] min-h-screen">
      {/* Heading and Create order button */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-semibold text-gray-800 mb-1">Orders</h1>
        </div>
        <Link to="/createorder">
          <button className="flex items-center bg-[#ff5c00] text-white px-6 py-2 rounded-lg font-medium shadow focus:outline-none cursor-pointer">
            <Plus className="mr-2 h-5 w-5" />
            Create order
          </button>
        </Link>
      </div>

      {/* Date Range & Search and Export */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-2">
        <div className="flex items-center gap-4">
          <span className="text-gray-500 text-sm">Jan 1 - Jan 30, 2024</span>
          <button className="text-[#ff5c00] bg-[#F3F0FF] px-3 py-1 rounded-md font-medium text-sm hover:bg-gradient-to-r hover:from-[#F3F0FF] hover:to-[#FFE5D0]">Export</button>
        </div>
        <div className="relative md:w-80 w-full ">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search order, customer, status"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-lg  bg-[#F49CAC]/30 focus:outline-0 focus:ring-2 focus:ring-amber-600"
          />
        </div>
      </div>

      {/* Statistic cards section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(card => (
          <div key={card.label} className="rounded-xl bg-white p-5 flex flex-col justify-between shadow border border-gray-100">
            <div className="text-gray-600 text-sm mb-1">{card.label}</div>
            <div className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              {card.value}
              <span className={`text-xs font-medium ml-2 ${card.trendColor}`}>{card.trend}</span>
            </div>
            <div className="text-xs text-gray-400">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Orders table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#F3F4F6] text-gray-600">
              <th className="py-4 px-4 font-semibold text-xs">Order</th>
              <th className="py-4 px-4 font-semibold text-xs">Date</th>
              <th className="py-4 px-4 font-semibold text-xs">Customer</th>
              <th className="py-4 px-4 font-semibold text-xs">Payment</th>
              <th className="py-4 px-4 font-semibold text-xs">Total</th>
              <th className="py-4 px-4 font-semibold text-xs">Delivery</th>
              <th className="py-4 px-4 font-semibold text-xs">Items</th>
              <th className="py-4 px-4 font-semibold text-xs">Fulfillment</th>
              <th className="py-4 px-4 font-semibold text-xs">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.length > 0 ? (
              currentOrders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-[#7F56D9]">#{getOrderValue(order, 'id')}</td>
                  <td className="py-3 px-4">{getOrderValue(order, 'date')}</td>
                  <td className="py-3 px-4">{getOrderValue(order, 'customer')}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-3 py-1 rounded-full ${paymentColors[order.payment] || 'bg-gray-100'}`}>
                      {getOrderValue(order, 'payment')}
                    </span>
                  </td>
                  <td className="py-3 px-4">{getOrderValue(order, 'amount')}</td>
                  <td className="py-3 px-4">{order.delivery || "N/A"}</td>
                  <td className="py-3 px-4">{order.items || "N/A"}</td>
                  <td className="py-3 px-4 font-medium">
                    <span className={`text-xs px-3 py-1 rounded-full ${statusColors[order.fulfillment] || 'bg-gray-100'}`}>
                      {order.fulfillment || "N/A"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {/* Placeholder for actions (edit/delete icons possibly) */}
                    ...
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="py-6 text-center text-gray-500">
                  {orders.length === 0 ? 'No orders available' : 'No matching orders found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`mx-1 px-4 py-2 rounded-md ${
                currentPage === i + 1
                  ? 'bg-[#7F56D9] text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
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
