// src/components/BloodSugarChart.jsx

import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

const BloodSugarChart = () => {
  const data = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Fasting Blood Sugar (mg/dL)",
        data: [115, 120, 110, 108],
        backgroundColor: "#10b981",
        borderRadius: 6,
        barThickness: 30,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#4b5563",
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 20,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Weekly Fasting Blood Sugar</h3>
      <Bar data={data} options={options} />
    </div>
  );
};

export default BloodSugarChart;
