import React, { useEffect, useState } from "react";
import api from "../utils/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

const Analytics = () => {
  const [summary, setSummary] = useState(null);
  const [monthlySales, setMonthlySales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [summaryRes, salesRes] = await Promise.all([
          api.get("analytics/summary/"),
          api.get("analytics/monthly-sales/"),
        ]);
        setSummary(summaryRes.data);
        setMonthlySales(salesRes.data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading)
    return (
      <div className="text-center mt-10 text-gray-600">Loading analytics...</div>
    );

  if (!summary)
    return (
      <div className="text-center mt-10 text-red-600">
        No analytics data available.
      </div>
    );

  return (
    <div className="p-6 min-h-screen bg-[#F9FAFB]">
      <h1 className="text-3xl font-semibold mb-6 text-[#ff5c00]">
        📊 Business Analytics
      </h1>

      {/* --- SUMMARY CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
        <div className="bg-white/90 p-5 rounded-2xl shadow">
          <h2 className="text-gray-600 text-sm">Total Orders</h2>
          <p className="text-3xl font-bold text-[#ff5c00]">
            {summary.total_orders}
          </p>
        </div>
        <div className="bg-white/90 p-5 rounded-2xl shadow">
          <h2 className="text-gray-600 text-sm">Total Revenue</h2>
          <p className="text-3xl font-bold text-[#ff5c00]">
            KSh {summary.total_revenue?.toLocaleString()}
          </p>
        </div>
        <div className="bg-white/90 p-5 rounded-2xl shadow">
          <h2 className="text-gray-600 text-sm">Average Order Value</h2>
          <p className="text-3xl font-bold text-[#ff5c00]">
            KSh {summary.avg_order_value?.toFixed(2)}
          </p>
        </div>
      </div>

      {/* --- MONTHLY SALES CHART --- */}
      <div className="bg-white/90 p-6 rounded-2xl shadow mb-8">
        <h2 className="text-lg font-semibold mb-4 text-[#ff5c00]">
          Monthly Sales Trend
        </h2>
        {monthlySales.length === 0 ? (
          <p className="text-gray-600">No sales data available yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="total_sales"
                stroke="#ff5c00"
                strokeWidth={3}
                dot={{ r: 4, fill: "#ff5c00" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* --- TOP PRODUCTS BAR CHART --- */}
      <div className="bg-white/90 p-6 rounded-2xl shadow mb-8">
        <h2 className="text-lg font-semibold mb-4 text-[#ff5c00]">
          Top 5 Best-Selling Products
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={summary.top_products}>
            <XAxis dataKey="product__title" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total_sold" fill="#ff5c00" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* --- ORDER STATUS COUNTS --- */}
      <div className="bg-white/90 p-6 rounded-2xl shadow">
        <h2 className="text-lg font-semibold mb-4 text-[#ff5c00]">
          Orders by Status
        </h2>
        <ul className="space-y-2">
          {summary.status_counts.map((item) => (
            <li key={item.status} className="flex justify-between">
              <span className="capitalize text-gray-700">{item.status}</span>
              <span className="font-semibold text-[#ff5c00]">{item.count}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Analytics;
