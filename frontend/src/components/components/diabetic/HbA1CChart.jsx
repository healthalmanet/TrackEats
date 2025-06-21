// src/components/HbA1cChart.jsx

import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

const HbA1cChart = () => {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "HbA1c %",
        data: [7.8, 7.5, 7.3, 7.0, 6.9, 7.1],
        fill: false,
        borderColor: "#3b82f6",
        backgroundColor: "#3b82f6",
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          color: "#374151",
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          stepSize: 0.5,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">HbA1c Trend (6 Months)</h3>
      <Line data={data} options={options} />
    </div>
  );
};

export default HbA1cChart;
