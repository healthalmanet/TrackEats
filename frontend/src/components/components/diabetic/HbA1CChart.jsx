import React, { useEffect, useState } from "react";
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
import { getDiabeticProfile } from "../../../api/diabeticApi";
import { toast } from "react-hot-toast";

// Register chart components
ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);


const HbA1CChart = ({ refreshTrigger = 0 }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHbA1cData = async () => {
      setLoading(true);
      try {
        const res = await getDiabeticProfile();
        const results = res?.results || [];

        // Filter valid entries and sort by date
        const sorted = [...results]
          .filter((item) => item.diagnosis_date && item.hba1c != null)
          .sort(
            (a, b) =>
              new Date(a.diagnosis_date).getTime() -
              new Date(b.diagnosis_date).getTime()
          );

        if (sorted.length === 0) {
          toast.error("No valid HbA1c data found.");
          setChartData(null);
          setLoading(false);
          return;
        }

        const labels = sorted.map((item) =>
          new Date(item.diagnosis_date).toLocaleDateString("en-IN", {
            month: "short",
            year: "2-digit",
          })
        );

        const hba1cValues = sorted.map((item) => item.hba1c);

        setChartData({
          labels,
          datasets: [
            {
              label: "HbA1c (%)",
              data: hba1cValues,
              fill: false,
              borderColor: "#0000FF",
              backgroundColor: "#0000FF",
              tension: 0.3,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
          ],
        });
      } catch (error) {
        toast.error("Failed to load HbA1c data.");
        console.error("Chart fetch error:", error);
        setChartData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchHbA1cData();
  }, [refreshTrigger]); // 🔁 Watch for refresh

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          color: "#374151",
          font: {
            size: 12,
            weight: "bold",
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw}%`,
        },
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: "HbA1c (%)",
          color: "#6B7280",
        },
        beginAtZero: false,
        suggestedMin: 4,
        suggestedMax: 12,
        ticks: {
          stepSize: 0.5,
          color: "#6B7280",
        },
        grid: {
          color: "#E5E7EB",
        },
      },
      x: {
        ticks: {
          color: "#6B7280",
        },
        grid: {
          color: "#F3F4F6",
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">HbA1c Trend</h3>
      {loading ? (
        <p className="text-sm text-gray-500">Loading chart...</p>
      ) : chartData ? (
        <Line data={chartData} options={options} />
      ) : (
        <p className="text-sm text-gray-500">No chart data available.</p>
      )}
    </div>
  );
};

export default HbA1CChart;
