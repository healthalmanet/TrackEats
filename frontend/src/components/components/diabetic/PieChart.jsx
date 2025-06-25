// src/components/SummaryPieChart.jsx
import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["	#0000FF", "#00bd00", "#FF5733"];

const SummaryPieChart = ({ data }) => {
  const chartData = [
    { name: "HbA1c", value: data?.hba1c || 0 },
    { name: "Blood Sugar", value: data?.bloodSugar || 0 },
    { name: "Cholesterol", value: data?.cholesterol || 0 },
  ];

  return (
    <div className="bg-white rounded-xl shadow-md p-6 h-80 w-full">
      <h3 className="text-base font-semibold text-gray-800 mb-4">
        Overall Health Stats
      </h3>
      <div className="h-[calc(100%-2rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SummaryPieChart;
