import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const CholestrolChart = () => {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Total Cholesterol",
        data: [175, 172, 170, 168, 170, 171],
        borderColor: "#8B008B", // Deep purple
        backgroundColor: "#8B008B",
        tension: 0.3,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#8B008B",
        pointHoverBackgroundColor: "#8B008B",
        pointHoverBorderColor: "#fff",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#4B5563", // gray-700
          font: {
            size: 12,
            weight: "bold",
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#6B7280", // gray-500
        },
        grid: {
          color: "#E5E7EB", // light gray
        },
      },
      y: {
        beginAtZero: false,
        ticks: {
          color: "#6B7280",
        },
        grid: {
          color: "#E5E7EB",
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 h-80 w-full">
      <h3 className="text-base font-semibold text-gray-800 mb-4">
        Cholesterol Tracking
      </h3>
      <div className="h-[calc(100%-2rem)]">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default CholestrolChart;
