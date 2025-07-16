import React, { useState } from 'react';
import { IoIosArrowBack } from "react-icons/io";
import { Link } from 'react-router-dom';
const PRIMARY_COLOR = '#ff5c00';

function CreateOrder() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    orderType: 'Manual',
    orderState: 'Processing',
    paymentStatus: 'Paid',
    orderDate: '',
    productName: 'Macbook M3 PRO',
    sku: 'MPM3P-M3451-31',
    warranty: '1 Year',
    quantity: '1',
    price: '2599',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const totalAmount = parseFloat(form.quantity || 0) * parseFloat(form.price || 0);

  return (
    <div className="flex justify-center items-start min-h-screen py-5">
      <div className="w-full max-w-5xl rounded-2xl bg-white shadow px-10 py-8 border border-gray-100">
        {/* Back Link */}
        <Link to="/orders">
          <div className="mb-6 flex items-center space-x-2 text-sm text-gray-500 cursor-pointer hover:text-orange-500 transition">
            <IoIosArrowBack className="text-lg" />
            <span>Back to orders</span>
          </div>
        </Link>

        {/* Header & Actions */}
        <div className="flex justify-between items-center mb-7">
          <h1 className="text-2xl font-semibold text-gray-800">Add New Order</h1>
          <div className="space-x-2">
            <button className="px-5 py-2 bg-gray-50 text-gray-500 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-100 transition">
              Cancel
            </button>
            <button
              className="px-5 py-2 rounded-lg text-sm font-semibold transition"
              style={{
                backgroundColor: PRIMARY_COLOR,
                color: '#fff',
                boxShadow: '0 2px 8px rgba(255,92,0,0.08)',
              }}
            >
              Save Order
            </button>
          </div>
        </div>

        {/* Customer Details */}
        <section className="mb-8">
          <h2 className="mb-4 font-medium text-gray-700">Customer Details</h2>
          <div className="flex flex-wrap gap-5">
            {[
              { label: 'First Name', name: 'firstName', type: 'text' },
              { label: 'Last Name', name: 'lastName', type: 'text' },
              { label: 'E-mail', name: 'email', type: 'email' },
              { label: 'Phone Number', name: 'phone', type: 'tel' },
            ].map(({ label, name, type }) => (
              <div key={name} className="flex-1 min-w-[220px]">
                <label htmlFor={name} className="block text-sm text-gray-500 mb-1">{label}</label>
                <input
                  id={name}
                  type={type}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Order Details */}
        <section className="mb-8">
          <h2 className="mb-4 font-medium text-gray-700">Order Details</h2>
          <div className="flex flex-wrap gap-5">
            {/* Order Type */}
            <div className="flex-1 min-w-[220px]">
              <label className="block text-sm text-gray-500 mb-1">Order Type</label>
              <div className="flex space-x-6">
                {['Manual', 'In-store', 'Custom'].map((type) => (
                  <label key={type} className="flex items-center gap-2 text-gray-700 cursor-pointer">
                    <input
                      type="radio"
                      name="orderType"
                      value={type}
                      checked={form.orderType === type}
                      onChange={handleChange}
                      style={{ accentColor: PRIMARY_COLOR }}
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            {/* Dropdowns */}
            {[
              {
                label: 'Order State',
                name: 'orderState',
                options: ['Processing', 'Completed', 'Pending'],
              },
              {
                label: 'Payment Status',
                name: 'paymentStatus',
                options: ['Paid', 'Pending', 'Failed'],
              },
            ].map(({ label, name, options }) => (
              <div key={name} className="flex-1 min-w-[220px]">
                <label htmlFor={name} className="block text-sm text-gray-500 mb-1">{label}</label>
                <select
                  id={name}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-200"
                >
                  {options.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </div>
            ))}

            {/* Order Date */}
            <div className="flex-1 min-w-[180px]">
              <label htmlFor="orderDate" className="block text-sm text-gray-500 mb-1">Order Date</label>
              <input
                id="orderDate"
                type="date"
                name="orderDate"
                value={form.orderDate}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
          </div>
        </section>

        {/* Tabs (Static) */}
        <div className="mb-2 border-b border-gray-200">
          <button className="px-3 pb-2 border-b-2 font-medium text-gray-900" style={{ borderColor: PRIMARY_COLOR, color: PRIMARY_COLOR }}>
            Product Items
          </button>
          <button className="px-3 pb-2 text-gray-400 font-normal cursor-not-allowed">Delivery Info</button>
          <button className="px-3 pb-2 text-gray-400 font-normal cursor-not-allowed">Others</button>
        </div>

        {/* Product Table */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="text-xs text-gray-500 bg-gray-50">
                <th className="py-3 px-2">Product</th>
                <th className="py-3 px-2">SKU</th>
                <th className="py-3 px-2">Warranty</th>
                <th className="py-3 px-2">Quantity</th>
                <th className="py-3 px-2">Price</th>
                <th className="py-3 px-2"></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {[
                  { name: 'productName', value: form.productName },
                  { name: 'sku', value: form.sku },
                  { name: 'warranty', value: form.warranty },
                ].map(({ name, value }) => (
                  <td key={name} className="py-2 px-2">
                    <input
                      type="text"
                      name={name}
                      value={value}
                      onChange={handleChange}
                      className="rounded-md border border-gray-200 px-2 py-1 w-full text-gray-700"
                    />
                  </td>
                ))}
                <td className="py-2 px-2">
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    value={form.quantity}
                    onChange={handleChange}
                    className="rounded-md border border-gray-200 px-2 py-1 w-20 text-gray-700"
                  />
                </td>
                <td className="py-2 px-2">
                  <input
                    type="number"
                    name="price"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    className="rounded-md border border-gray-200 px-2 py-1 w-24 text-gray-700"
                  />
                </td>
                <td></td>
              </tr>
              <tr>
                <td colSpan={6} className="pt-2 text-left">
                  <button
                    className="text-sm font-medium py-1 px-2 rounded hover:bg-orange-50 transition"
                    style={{ color: PRIMARY_COLOR }}
                  >
                    + Add another item
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Total Price */}
          <div className="flex justify-end pr-4 mt-2">
            <span className="text-gray-500 text-sm">Total:</span>
            <span className="ml-2 text-base font-bold" style={{ color: PRIMARY_COLOR }}>
              ${totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateOrder;
