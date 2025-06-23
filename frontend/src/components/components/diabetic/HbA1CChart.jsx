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
import { getDiabeticProfile } from "../../../api/diabeticApi"; // adjust path as needed
import { toast } from "react-hot-toast";

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
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchHbA1cData = async () => {
      try {
        const res = await getDiabeticProfile();
        const results = res?.results || [];

        // Sort by diagnosis_date ascending
        const sorted = [...results].sort(
          (a, b) => new Date(a.diagnosis_date) - new Date(b.diagnosis_date)
        );

        const labels = sorted.map((item) =>
          new Date(item.diagnosis_date).toLocaleDateString("en-IN", {
            month: "short",
            year: "2-digit",
          })
        );

        const hba1cValues = sorted.map((item) => item.hba1c);

        const chartObj = {
          labels,
          datasets: [
            {
              label: "HbA1c %",
              data: hba1cValues,
              fill: false,
              borderColor: "#3b82f6",
              backgroundColor: "#3b82f6",
              tension: 0.3,
              pointRadius: 5,
              pointHoverRadius: 6,
            },
          ],
        };

        setChartData(chartObj);
      } catch (error) {
        toast.error("Failed to load HbA1c data.");
        console.error("Chart fetch error:", error);
      }
    };

    fetchHbA1cData();
  }, []);

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
      <h3 className="text-sm font-semibold text-gray-700 mb-3">HbA1c Trend</h3>
      {chartData ? (
        <Line data={chartData} options={options} />
      ) : (
        <p className="text-sm text-gray-500">Loading chart...</p>
      )}
    </div>
  );
};

export default HbA1cChart;
