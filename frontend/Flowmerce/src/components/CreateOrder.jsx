import React, { useState } from 'react';
import { IoIosArrowBack } from 'react-icons/io';
import { Link } from 'react-router-dom';

const PRIMARY_COLOR = '#ff5c00';

const inputClasses =
  "bg-[#F49CAC]/30 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 w-full";
const selectClasses = inputClasses;
const tableInputClasses =
  "bg-[#F49CAC]/30 px-2 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 w-full text-sm";

const STATUS_OPTIONS = ['Pending', 'Completed', 'Cancelled'];

function CreateOrder() {
  const [customer, setCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  // Each order item matches OrderItem model
  const [orderItems, setOrderItems] = useState([
    {
      productTitle: 'Macbook M3 PRO',
      sku: 'MPM3P-M3451-31',
      quantity: 1,
      productPrice: 2599,
      warranty: '1 Year',
    },
  ]);

  const [orderDate, setOrderDate] = useState('');
  const [status, setStatus] = useState('Pending');

  // Handlers for customer info
  const onCustomerChange = (e) => {
    setCustomer((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Handlers for order items
  const updateOrderItem = (index, field, value) => {
    setOrderItems((prev) => {
      const newItems = [...prev];
      newItems[index][field] = field === 'quantity' || field === 'productPrice' ? Number(value) : value;
      return newItems;
    });
  };

  const addOrderItem = () => {
    setOrderItems((prev) => [
      ...prev,
      { productTitle: '', sku: '', quantity: 1, productPrice: 0, warranty: '' },
    ]);
  };

  const removeOrderItem = (index) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculate total amount for all items
  const totalAmount = orderItems.reduce(
    (sum, item) => sum + Number(item.productPrice) * Number(item.quantity),
    0
  );

  return (
    <div className="flex justify-center py-10 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-md border border-gray-100 w-full max-w-6xl p-8">
        {/* Back Link */}
        <Link
          to="/orders"
          className="flex items-center text-gray-500 text-sm mb-6 hover:text-orange-500 transition"
        >
          <IoIosArrowBack className="mr-1 text-lg" />
          Back to orders
        </Link>

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">Add New Order</h1>
          <div className="space-x-2">
            <button className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button
              className="px-5 py-2 rounded-md text-sm font-semibold"
              style={{
                backgroundColor: PRIMARY_COLOR,
                color: '#fff',
                boxShadow: '0 2px 8px rgba(255,92,0,0.15)',
              }}
            >
              Save Order
            </button>
          </div>
        </div>

        {/* Customer Details */}
        <section className="mb-10">
          <h2 className="text-lg font-medium text-gray-700 mb-4">Customer Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: 'First Name', name: 'firstName', value: customer.firstName },
              { label: 'Last Name', name: 'lastName', value: customer.lastName },
              { label: 'E-mail', name: 'email', type: 'email', value: customer.email },
              { label: 'Phone Number', name: 'phone', type: 'tel', value: customer.phone },
            ].map(({ label, name, type = 'text', value }) => (
              <div key={name}>
                <label htmlFor={name} className="block text-sm text-gray-500 mb-1">
                  {label}
                </label>
                <input
                  id={name}
                  name={name}
                  type={type}
                  value={value}
                  onChange={onCustomerChange}
                  className={inputClasses}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Order Details */}
        <section className="mb-10">
          <h2 className="text-lg font-medium text-gray-700 mb-4">Order Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-lg">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Order Status</label>
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
              <label htmlFor="orderDate" className="block text-sm text-gray-500 mb-1">
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

        {/* Product Items Table */}
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
                  <th className="py-2 px-2 border border-gray-200">Product Title</th>
                  <th className="py-2 px-2 border border-gray-200">SKU</th>
                  <th className="py-2 px-2 border border-gray-200">Warranty</th>
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
                          onChange={(e) => updateOrderItem(idx, 'productTitle', e.target.value)}
                        />
                      </td>
                      <td className="py-2 px-2 border border-gray-200">
                        <input
                          className={tableInputClasses}
                          value={item.sku}
                          onChange={(e) => updateOrderItem(idx, 'sku', e.target.value)}
                        />
                      </td>
                      <td className="py-2 px-2 border border-gray-200">
                        <input
                          className={tableInputClasses}
                          value={item.warranty}
                          onChange={(e) => updateOrderItem(idx, 'warranty', e.target.value)}
                        />
                      </td>
                      <td className="py-2 px-2 border border-gray-200">
                        <input
                          type="number"
                          min="1"
                          className={tableInputClasses}
                          value={item.quantity}
                          onChange={(e) => updateOrderItem(idx, 'quantity', e.target.value)}
                        />
                      </td>
                      <td className="py-2 px-2 border border-gray-200">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className={tableInputClasses}
                          value={item.productPrice}
                          onChange={(e) => updateOrderItem(idx, 'productPrice', e.target.value)}
                        />
                      </td>
                      <td className="py-2 px-2 border border-gray-200 font-semibold">
                        ${amount.toFixed(2)}
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
              ${totalAmount.toFixed(2)}
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}

export default CreateOrder;
