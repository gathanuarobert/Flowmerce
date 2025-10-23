import React, { useEffect, useRef, useState } from "react";
import ApexCharts from "apexcharts";
import api from "../utils/api"; // Adjust path if needed

const Statistics = () => {
  const chartRef = useRef(null);
  const [chartData, setChartData] = useState({
    months: [],
    total_revenue: [],
    total_orders: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("analytics/monthly-sales/");
        setChartData(response.data);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!chartRef.current || chartData.months.length === 0) return;

    const options = {
      chart: {
        height: 260,
        width: "100%",
        type: "area",
        fontFamily: "Inter, sans-serif",
        toolbar: { show: false },
      },
      tooltip: {
        enabled: true,
        theme: "light",
        y: {
          formatter: (val) => `KSh ${val.toLocaleString("en-KE")}`,
          title: {
            formatter: (seriesName) =>
              seriesName.includes("Revenue") ? "Revenue" : "Orders",
          },
        },
      },
      fill: {
        type: "gradient",
        gradient: {
          opacityFrom: 0.55,
          opacityTo: 0,
          shade: "#FF5C00",
          gradientToColors: ["#F49CAC"],
        },
      },
      dataLabels: { enabled: false },
      stroke: { colors: ["#FF5C00", "#F49CAC"], width: 3 },
      grid: {
        borderColor: "#E5E7EB",
        strokeDashArray: 4,
        padding: { left: 15, right: 15, top: 10, bottom: 10 },
      },
      series: [
        {
          name: "Total Revenue (KSh)",
          data: chartData.total_revenue,
          color: "#FF5C00",
        },
        {
          name: "Total Orders",
          data: chartData.total_orders,
          color: "#F49CAC",
        },
      ],
      xaxis: {
        categories: chartData.months,
        labels: {
          show: true,
          style: {
            colors: "#6B7280",
            fontSize: "12px",
            fontWeight: 500,
          },
          rotate: -45,
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: [
        {
          labels: {
            formatter: (value) => `KSh ${value.toLocaleString("en-KE")}`,
            style: {
              colors: "#6B7280",
              fontSize: "12px",
              fontWeight: 500,
            },
            offsetX: -10,
          },
          tickAmount: 5,
          forceNiceScale: true,
        },
      ],
      legend: {
        position: "top",
        horizontalAlign: "right",
        fontSize: "12px",
        fontWeight: 500,
        labels: { colors: "#4B5563" },
        markers: { radius: 12 },
      },
    };

    const chart = new ApexCharts(chartRef.current, options);
    chart.render();

    return () => chart.destroy();
  }, [chartData]);

  const latestRevenue =
    chartData.total_revenue.length > 0
      ? chartData.total_revenue.at(-1)
      : 0;

  return (
    <div className="w-full bg-white rounded-xl shadow-sm p-4 md:p-6">
      <div className="flex justify-between items-start">
        <div>
          <h5 className="leading-none text-3xl font-bold text-gray-900 pb-2">
            KSh {latestRevenue.toLocaleString("en-KE")}
          </h5>
          <p className="text-base font-normal text-gray-500">
            Revenue this month
          </p>
        </div>
        <div className="flex items-center px-2.5 py-0.5 text-base font-semibold text-green-500 text-center">
          23%
          <svg
            className="w-3 h-3 ms-1"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 10 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13V1m0 0L1 5m4-4 4 4"
            />
          </svg>
        </div>
      </div>
      <div ref={chartRef} id="data-series-chart" className="w-full mt-4"></div>
    </div>
  );
};

export default Statistics;
