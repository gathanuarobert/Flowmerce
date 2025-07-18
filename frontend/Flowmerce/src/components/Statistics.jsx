import React, { useEffect, useRef } from "react";
import ApexCharts from "apexcharts";

const Statistics = () => {
  const chartRef = useRef(null);

  useEffect(() => {
    const options = {
      chart: {
        // add these lines to update the size of the chart
        height: 240,
        width: "100%",
        type: "area",
        fontFamily: "Inter, sans-serif",
        dropShadow: {
          enabled: false,
        },
        toolbar: {
          show: false,
        },
      },
      tooltip: {
        enabled: true,
        x: {
          show: false,
        },
        style: {
          colors:["#FF5C00", "#F49CAC"],
        },
      },
      fill: {
        type: "gradient",
        gradient: {
          opacityFrom: 0.55,
          opacityTo: 0,
          shade: "#FF5C00",
          gradientToColors: ["#1C64F2"],
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        colors: ["#FF5C00", "#F49CAC"],
        width: 6,
      },
      grid: {
        show: false,
        strokeDashArray: 4,
        padding: {
          left: 2,
          right: 2,
          top: -26,
        },
      },
      series: [
        {
          name: "Developer Edition",
          data: [1500, 1418, 1456, 1526, 1356, 1256],
          color: "#FF5C00",
        },
        {
          name: "Designer Edition",
          data: [643, 413, 765, 412, 1423, 1731],
          color: "#F49CAC",
        },
      ],
      xaxis: {
        categories: [
          "01 February",
          "02 February",
          "03 February",
          "04 February",
          "05 February",
          "06 February",
          "07 February",
        ],
        labels: {
          show: false,
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        show: false,
        labels: {
          formatter: function (value) {
            return "$" + value;
          },
        },
      },
    };
    if (chartRef.current && typeof ApexCharts !== "undefined") {
      const chart = new ApexCharts(chartRef.current, options);
      chart.render();
      return () => {
        chart.destroy();
      };
    }
  }, []);

  return (
    <div>
      <div class=" w-full bg-white rounded-xl shadow-sm p-4 md:p-6">
        <div class="flex justify-between">
          <div>
            <h5 class="leading-none text-3xl font-bold text-gray-900 dark:text-white pb-2">
              $12,423
            </h5>
            <p class="text-base font-normal text-gray-500 dark:text-gray-400">
              Sales this week
            </p>
          </div>
          <div class="flex items-center px-2.5 py-0.5 text-base font-semibold text-green-500 dark:text-green-500 text-center">
            23%
            <svg
              class="w-3 h-3 ms-1"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 10 14"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13V1m0 0L1 5m4-4 4 4"
              />
            </svg>
          </div>
        </div>
        <div ref={chartRef} id="data-series-chart" className="w-full"></div>
        
      </div>
    </div>
  );
};

export default Statistics;
