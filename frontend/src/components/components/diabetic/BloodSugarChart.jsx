import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { getDiabeticProfile } from "../../../api/diabeticApi";
import { toast } from "react-hot-toast";

// Register chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const BloodSugarChart = ({ refreshTrigger = 0 }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBloodSugarData = async () => {
      setLoading(true);
      try {
        const res = await getDiabeticProfile();
        const results = res?.results || [];

        // Filter and sort valid entries by date ascending
        const sorted = [...results]
          .filter((item) => item.diagnosis_date && item.fasting_blood_sugar != null)
          .sort(
            (a, b) =>
              new Date(a.diagnosis_date).getTime() - new Date(b.diagnosis_date).getTime()
          );

        if (sorted.length === 0) {
          toast.error("No valid blood sugar data found.");
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

        const sugarValues = sorted.map((item) => item.fasting_blood_sugar);

        setChartData({
          labels,
          datasets: [
            {
              label: "Fasting Blood Sugar (mg/dL)",
              data: sugarValues,
              backgroundColor: "#00bd00",
              borderRadius: 6,
              barThickness: 30,
            },
          ],
        });
      } catch (error) {
        toast.error("Failed to load blood sugar data.");
        console.error("Blood Sugar Chart Error:", error);
        setChartData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBloodSugarData();
  }, [refreshTrigger]); // Refetch chart on update

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#4b5563", // Tailwind gray-600
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "mg/dL",
          color: "#6B7280",
        },
        ticks: {
          stepSize: 20,
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
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Fasting Blood Sugar Trend
      </h3>
      {loading ? (
        <p className="text-sm text-gray-500">Loading chart...</p>
      ) : chartData ? (
        <Bar data={chartData} options={options} />
      ) : (
        <p className="text-sm text-gray-500">No chart data available.</p>
      )}
    </div>
  );
};

export default BloodSugarChart;
