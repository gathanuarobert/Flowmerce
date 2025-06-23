import React, { useState, useEffect } from 'react';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';
import api from '../utils/api';

const statusColors = {
  "Pending": "text-yellow-600 bg-yellow-100",
  "Completed": "text-green-600 bg-green-100",
  "Cancelled": "text-red-600 bg-red-100",
  "Shipped": "text-blue-600 bg-blue-100",
  "Processing": "text-purple-600 bg-purple-100"
};

const paymentColors = {
  "Paid": "text-green-600 bg-green-100",
  "Pending": "text-yellow-600 bg-yellow-100",
  "Failed": "text-red-600 bg-red-100"
};

// Helper function to safely access and format order data
const getOrderValue = (order, key) => {
  if (!order) return '';
  
  const value = order[key];
  if (value === undefined || value === null) return '';
  
  if (key === 'amount' && typeof value === 'number') {
    return `$${value.toFixed(2)}`;
  }
  
  return String(value);
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  // Fetch orders from API with proper error handling
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get('/orders/');
        
        // Validate response data structure
        if (!response.data) {
          throw new Error('Invalid API response: data missing');
        }
        
        const data = Array.isArray(response.data) ? response.data : [];
        setOrders(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch orders');
        setOrders([]); // Reset to empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Safe sorting function
  const sortedOrders = React.useMemo(() => {
    if (!Array.isArray(orders)) return [];
    
    return [...orders].sort((a, b) => {
      const aValue = getOrderValue(a, sortConfig.key);
      const bValue = getOrderValue(b, sortConfig.key);
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [orders, sortConfig]);

  // Safe filtering function
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

  // Safe pagination
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

  if (loading) return <div className="p-6">Loading orders...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 bg-white rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Order Management</h1>
        <div className="relative w-1/3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-lg focus:outline-none bg-[#F49CAC]/30 focus:ring-2 focus:ring-amber-600"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-100/30 text-gray-600">
              {['id', 'customer', 'orderDate', 'payment', 'status', 'amount'].map((key) => (
                <th 
                  key={key}
                  className="py-3 px-4 cursor-pointer"
                  onClick={() => requestSort(key)}
                >
                  <div className="flex items-center ">
                    {{
                      id: 'ORDER',
                      customer: 'CUSTOMER',
                      orderDate: 'DATE',
                      payment: 'PAYMENT',
                      status: 'STATUS',
                      amount: 'AMOUNT'
                    }[key]}
                    {sortConfig.key === key && (
                      sortConfig.direction === 'asc' ? 
                        <ChevronUp className="ml-1 h-4 w-4" /> : 
                        <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentOrders.length > 0 ? (
              currentOrders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-4">{getOrderValue(order, 'id')}</td>
                  <td className="py-4 px-4">{getOrderValue(order, 'customer')}</td>
                  <td className="py-4 px-4">{getOrderValue(order, 'orderDate')}</td>
                  <td className="py-4 px-4">
                    <span className={`text-xs px-3 py-1 rounded-full ${
                      paymentColors[order.payment] || 'bg-gray-100'
                    }`}>
                      {getOrderValue(order, 'payment')}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`text-xs px-3 py-1 rounded-full ${
                      statusColors[order.status] || 'bg-gray-100'
                    }`}>
                      {getOrderValue(order, 'status')}
                    </span>
                  </td>
                  <td className="py-4 px-4">{getOrderValue(order, 'amount')}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-6 text-center text-gray-500">
                  {orders.length === 0 ? 'No orders available' : 'No matching orders found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`mx-1 px-4 py-2 rounded-md ${
                currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
              }`}
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