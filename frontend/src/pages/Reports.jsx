import React from 'react';
import {
  PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";


const Reports = () => {
  {/*  progress bar */}
  // Donut chart data
  const macroData = [
    { name: "Protein", value: 125 },
    { name: "Carbs", value: 180 },
    { name: "Fat", value: 68 },
  ];
  const COLORS = ["#00C49F", "#0088FE", "#FFBB28"];

  
  // Line chart data
  const calorieProgress = [
    { name: "Mon", calories: 1400 },
    { name: "Tue", calories: 1650 },
    { name: "Wed", calories: 1700 },
    { name: "Thu", calories: 1900 },
    { name: "Fri", calories: 1850 },
    { name: "Sat", calories: 2000 },
    { name: "Sun", calories: 1847 },
  ];

  return (
    <div>
    <div className="min-h-screen bg-[#f7fdfc] text-gray-800 p-6 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 text-xl font-bold text-green-600">
          <span className="bg-green-100 p-2 rounded-lg">🥗</span> NutriTrack
        </div>
        <div className="flex items-center gap-4">
          <button className="text-green-500 hover:text-green-700">🔔</button>
          <div className="w-8 h-8 rounded-full bg-gray-300"></div>
          <button className="text-green-500">⚙️</button>
        </div>
      </header>

      {/* Goal Info */}
      <section className="mb-6">
        <p className="text-gray-600">
          <span className="text-green-500 font-semibold">Today: Dec 18, 2024</span> • Goal: 2,200 calories
        </p>
      </section>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { value: "1,847", goal: "2,200 kcal", label: "84%" },
          { value: "125g", goal: "150g", label: "83%" },
          { value: "180g", goal: "220g", label: "82%" },
          { value: "68g", goal: "75g", label: "91%" },
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-white p-4 rounded-xl shadow hover:shadow-md transition"
          >
            <div className="text-2xl font-bold text-green-600">{item.value}</div>
            <div className="text-gray-500 text-sm">of {item.goal}</div>
            <div className="w-full h-2 mt-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500"
                style={{ width: item.label }}
              ></div>
            </div>
            <div className="text-xs text-right text-green-500 mt-1">
              {item.label} Complete
            </div>
          </div>
        ))}
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Donut Chart */}
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <h2 className="text-green-600 font-semibold mb-4">Macronutrient Breakdown</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={macroData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {macroData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart */}
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <h2 className="text-green-600 font-semibold mb-4">Calorie Progress (Weekly)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={calorieProgress}>
              {/* <XAxis dataKey="name" /> */}
              {/* <YAxis /> */}
              <Tooltip />
              <Line type="monotone" dataKey="calories" stroke="#00C49F" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>

    </div>
  );
};

export default Reports
