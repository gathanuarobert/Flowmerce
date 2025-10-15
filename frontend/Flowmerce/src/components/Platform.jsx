import React, { useEffect, useState } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import api from "../utils/api";

const Platform = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          api.get("orders/"),
          api.get("products/"),
        ]);

        const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
        const products = Array.isArray(productsRes.data) ? productsRes.data : [];

        const totalOrders = orders.length;
        const totalProductsSold = orders.reduce(
          (sum, order) =>
            sum +
            ((order.items || []).reduce(
              (subSum, item) => subSum + (item.quantity || 0),
              0
            ) || 0),
          0
        );

        const totalRevenue = orders.reduce(
          (sum, order) => sum + (parseFloat(order.amount) || 0),
          0
        );

        const uniqueCustomers = new Set(
          orders.map((order) => order.employee_email)
        ).size;

        const statsData = [
          {
            label: "Products sold",
            value: totalProductsSold,
            change: "+5.2%",
            direction: "up",
            color: "green",
            note: "from last week",
          },
          {
            label: "Orders placed",
            value: totalOrders,
            change: "-2.8%",
            direction: "down",
            color: "red",
            note: "from last week",
          },
          {
            label: "Unique customers",
            value: uniqueCustomers,
            change: "+4.8%",
            direction: "up",
            color: "green",
            note: "from last week",
          },
          {
            label: "Revenue",
            value: `$${totalRevenue.toLocaleString()}`,
            change: "+6.3%",
            direction: "up",
            color: "green",
            note: "from last week",
          },
        ];

        setStats(statsData);
      } catch (error) {
        console.error("Error fetching platform stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <p className="text-gray-600">Loading stats...</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="bg-white rounded-xl p-4 shadow flex flex-col gap-1"
        >
          <h2 className="text-2xl font-semibold">{stat.value}</h2>
          <p className="text-gray-600 text-sm">{stat.label}</p>
          <div className="flex items-center text-xs gap-1 mt-1">
            {stat.direction === "up" ? (
              <ArrowUpRight className="w-4 h-4 text-green-600" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-red-600" />
            )}
            <span
              className={`font-medium ${
                stat.color === "green" ? "text-green-600" : "text-red-600"
              }`}
            >
              {stat.change}
            </span>
            <span className="text-gray-500">{stat.note}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Platform;
