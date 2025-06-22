import React, { useEffect, useState } from "react";
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
import { getDiabeticProfile } from "../../../api/diabeticApi"; // adjust path if needed
import { toast } from "react-hot-toast";

// Register chart components
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
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchCholesterolData = async () => {
      try {
        const res = await getDiabeticProfile();
        const results = res?.results || [];

        const sorted = [...results].sort(
          (a, b) => new Date(a.diagnosis_date) - new Date(b.diagnosis_date)
        );

        const labels = sorted.map((item) =>
          new Date(item.diagnosis_date).toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
          })
        );

        const cholesterolValues = sorted.map((item) => item.total_cholesterol);

        setChartData({
          labels,
          datasets: [
            {
              label: "Total Cholesterol (mg/dL)",
              data: cholesterolValues,
              borderColor: "#8B008B", // Deep purple
              backgroundColor: "#8B008B",
              tension: 0.3,
              pointBackgroundColor: "#fff",
              pointBorderColor: "#8B008B",
              pointHoverBackgroundColor: "#8B008B",
              pointHoverBorderColor: "#fff",
            },
          ],
        });
      } catch (err) {
        toast.error("Failed to load cholesterol data.");
        console.error("Cholesterol chart error:", err);
      }
    };

    fetchCholesterolData();
  }, []);

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
        {chartData ? (
          <Line data={chartData} options={options} />
        ) : (
          <p className="text-sm text-gray-500">Loading chart...</p>
        )}
      </div>
    </div>
  );
};

export default CholestrolChart;
