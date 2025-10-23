import React, { useEffect, useState } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import api from "../utils/api";

const Platform = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("analytics/summary/");
        setStats(res.data);
      } catch (error) {
        console.error("Error fetching analytics summary:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <p className="text-gray-600">Loading stats...</p>;
  }

  if (!stats) {
    return <p className="text-red-500">No stats data available.</p>;
  }

  const formattedStats = [
    {
      label: "Total Orders",
      value: stats.total_orders,
      change: "+5.2%",
      direction: "up",
      color: "green",
      note: "from last week",
    },
    {
      label: "Total Revenue",
      value: `KSh ${Number(stats.total_revenue).toLocaleString()}`,
      change: "+6.3%",
      direction: "up",
      color: "green",
      note: "from last week",
    },
    {
      label: "Average Order Value",
      value: `KSh ${Number(stats.avg_order_value).toFixed(2)}`,
      change: "+2.1%",
      direction: "up",
      color: "green",
      note: "from last week",
    },
    {
      label: "Total Products",
      value: stats.total_products,
      change: "-1.4%",
      direction: "down",
      color: "red",
      note: "from last week",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {formattedStats.map((stat, idx) => (
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
