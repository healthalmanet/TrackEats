import React, { useState, useEffect } from "react";
import { TrendingDown, Target, Activity } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
} from "recharts";
import { getWeight, postWeight } from "../../../api/Weight";

const WeightTracker = () => {
  const [currentWeight, setCurrentWeight] = useState(75);
  const [targetWeight, setTargetWeight] = useState(70);
  const [quickLogWeight, setQuickLogWeight] = useState("75");
  const [quickLogDate, setQuickLogDate] = useState("");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWeight = async () => {
    setLoading(true);
    try {
      const data = await getWeight();
      const sortedData = Array.isArray(data.results)
        ? [...data.results].sort((a, b) => new Date(a.date) - new Date(b.date))
        : [];

      const dataWithChanges = sortedData.map((entry, index, arr) => {
        if (index === 0) return { ...entry, change: 0 };
        const prev = parseFloat(arr[index - 1].weight_kg);
        const curr = parseFloat(entry.weight_kg);
        const change = isNaN(prev) || isNaN(curr) ? 0 : curr - prev;
        return { ...entry, change };
      });

      setEntries(dataWithChanges);
    } catch (error) {
      console.error("Error fetching weight data:", error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeight();
  }, []);

  const progress = currentWeight - targetWeight;

  const chartData = entries.map((entry) => ({
    date: entry.date,
    weight: parseFloat(entry.weight_kg),
    displayDate: new Date(entry.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    target: targetWeight,
  }));

  const handleSaveEntry = async () => {
    const newWeight = parseFloat(quickLogWeight);
    if (!quickLogWeight || !quickLogDate || isNaN(newWeight) || newWeight <= 0 || quickLogWeight.length > 4) {
      alert("Please enter a valid weight and date.");
      return;
    }

    const formData = { date: quickLogDate, weight_kg: newWeight };

    try {
      await postWeight(formData);
      setCurrentWeight(newWeight);
      setQuickLogWeight("");
      setQuickLogDate("");
      fetchWeight();
    } catch (error) {
      console.error("Failed to post weight:", error);
    }
  };

  const StatCard = ({ icon: Icon, label, value, unit, color }) => (
    <div className="bg-white transition hover:shadow-xl rounded-3xl p-5 border border-gray-200 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Icon className={`w-6 h-6 ${color}`} />
        <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-3xl font-bold text-gray-800">{value}</div>
      <div className="text-sm text-gray-400">{unit}</div>
    </div>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-xl">
          <p className="text-gray-600 text-sm">Date: {label}</p>
          <p className="text-orange-600 font-semibold">Weight: {payload[0].value} kg</p>
          {payload[1] && (
            <p className="text-yellow-600 font-semibold">Target: {payload[1].value} kg</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 p-6">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Weight Tracker</h1>
          <p className="text-gray-600">Track your progress towards your fitness goal with clarity and confidence</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard icon={TrendingDown} label="Current Weight" value={currentWeight} unit="kg" color="text-orange-500" />
          <StatCard icon={Target} label="Goal" value={targetWeight} unit="kg" color="text-yellow-500" />
          <StatCard icon={Activity} label="Progress" value={progress.toFixed(1)} unit="kg lost" color="text-rose-500" />
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Weight Progress</h3>
            <span className="text-sm text-gray-400">Last 30 days</span>
          </div>
          <div className="h-80">
            {loading ? (
              <div className="flex items-center justify-center h-full text-gray-400 animate-pulse">
                Loading chart data...
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="displayDate" tick={{ fontSize: 12 }} />
                  <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="weight"
                    stroke="#f97316"
                    fill="url(#gradient)"
                    strokeWidth={3}
                    dot={{ r: 3, fill: '#f97316', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#fff', stroke: '#f97316', strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#fbbf24"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">No data available.</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Log</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              value={quickLogWeight}
              onChange={(e) => setQuickLogWeight(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              placeholder="Weight (kg)"
            />
            <input
              type="date"
              value={quickLogDate}
              onChange={(e) => setQuickLogDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>
          <button
            onClick={handleSaveEntry}
            className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition transform hover:scale-105"
          >
            Save Entry
          </button>
        </div>

        <div className="overflow-x-auto bg-white rounded-3xl shadow-md border border-gray-100">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-gray-500 uppercase tracking-wider">Weight</th>
                <th className="px-6 py-3 text-gray-500 uppercase tracking-wider">Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.map((entry, index) => (
                <tr key={index} className="hover:bg-orange-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900">{entry.date}</td>
                  <td className="px-6 py-4 text-gray-700">{entry.weight_kg} kg</td>
                  <td className="px-6 py-4">
                    <span className={entry.change >= 0 ? "text-red-600" : "text-green-600"}>
                      {!isNaN(entry.change)
                        ? `${entry.change >= 0 ? "+" : "-"}${Math.abs(entry.change).toFixed(1)} kg`
                        : "0.0 kg"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WeightTracker;