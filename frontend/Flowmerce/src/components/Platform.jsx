import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

const stats = [
  {
    label: "Products sold",
    value: 325,
    change: "+5.2%",
    direction: "up",
    color: "green",
    note: "from last week",
  },
  {
    label: "Orders placed",
    value: 531,
    change: "-2.8%",
    direction: "down",
    color: "red",
    note: "from last week",
  },
  {
    label: "Unique customers",
    value: 225,
    change: "+4.8%",
    direction: "up",
    color: "green",
    note: "from last week",
  },
  {
    label: "Revenue",
    value: "$12,540",
    change: "+6.3%",
    direction: "up",
    color: "green",
    note: "from last week",
  },
];

const Platform = () => {
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
