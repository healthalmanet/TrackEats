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
import { getDiabeticProfile } from "../../../api/diabeticApi";
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

const CholestrolChart = ({ refreshTrigger = 0 }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCholesterolData = async () => {
      setLoading(true);
      try {
        const res = await getDiabeticProfile();
        const results = res?.results || [];

        const sorted = [...results]
          .filter((item) => item.diagnosis_date && item.total_cholesterol != null)
          .sort(
            (a, b) =>
              new Date(a.diagnosis_date).getTime() - new Date(b.diagnosis_date).getTime()
          );

        if (sorted.length === 0) {
          toast.error("No valid cholesterol data found.");
          setChartData(null);
          setLoading(false);
          return;
        }

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
              borderColor: "#FF5733",
              backgroundColor: "#FF5733",
              tension: 0.3,
              pointBackgroundColor: "#fff",
              pointBorderColor: "#FF5733",
              pointHoverBackgroundColor: "#FF5733",
              pointHoverBorderColor: "#fff",
            },
          ],
        });
      } catch (err) {
        toast.error("Failed to load cholesterol data.");
        console.error("Cholesterol chart error:", err);
        setChartData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCholesterolData();
  }, [refreshTrigger]); // Rerun on refreshTrigger change

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#4B5563",
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
          color: "#6B7280",
        },
        grid: {
          color: "#E5E7EB",
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
        {loading ? (
          <p className="text-sm text-gray-500">Loading chart...</p>
        ) : chartData ? (
          <Line data={chartData} options={options} />
        ) : (
          <p className="text-sm text-gray-500">No chart data available.</p>
        )}
      </div>
    </div>
  );
};

export default CholestrolChart;
