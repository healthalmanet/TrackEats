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
import { getDiabeticProfile } from "../../../api/diabeticApi"; // adjust if needed
import { toast } from "react-hot-toast";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const BloodSugarChart = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchBloodSugarData = async () => {
      try {
        const res = await getDiabeticProfile();
        const results = res?.results || [];

        // Sort by date ascending
        const sorted = [...results].sort(
          (a, b) => new Date(a.diagnosis_date) - new Date(b.diagnosis_date)
        );

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
      }
    };

    fetchBloodSugarData();
  }, []);

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
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Fasting Blood Sugar Trend</h3>
      {chartData ? (
        <Bar data={chartData} options={options} />
      ) : (
        <p className="text-sm text-gray-500">Loading chart...</p>
      )}
    </div>
  );
};

export default BloodSugarChart;
