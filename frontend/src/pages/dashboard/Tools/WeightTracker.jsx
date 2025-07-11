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
  const [currentWeight, setCurrentWeight] = useState(75); // kg
  const [targetWeight, setTargetWeight] = useState(70); // kg
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
        if (index === 0) {
          return { ...entry, change: 0 };
        }
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

  const chartData = entries
    .map((entry) => ({
      date: entry.date,
      weight: parseFloat(entry.weight_kg),
      displayDate: new Date(entry.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      target: targetWeight,
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const handleSaveEntry = async () => {
    const newWeight = parseFloat(quickLogWeight);
    if (!quickLogWeight || !quickLogDate || isNaN(newWeight) || newWeight <= 0) {
      alert("Please enter a valid weight and date.");
      return;
    }

    const formData = {
      date: quickLogDate,
      weight_kg: newWeight,
    };

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

  const StatCard = ({ icon: Icon, label, value, unit, color = "text-orange-600" }) => (
    <div className="bg-white rounded-2xl p-4 lg:p-6 shadow border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-5 h-5 ${color}`} />
        <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-2xl lg:text-3xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500">{unit}</div>
    </div>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow">
          <p className="text-gray-600 text-sm">{`Date: ${label}`}</p>
          <p className="text-orange-600 font-semibold">{`Weight: ${payload[0].value} kg`}</p>
          {payload[1] && (
            <p className="text-amber-600 font-semibold">{`Target: ${payload[1].value} kg`}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Weight Tracker</h1>
            <p className="text-gray-600">Track your progress toward your goal weight</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={TrendingDown} label="Current Weight" value={currentWeight} unit="kg" />
          <StatCard icon={Target} label="Goal" value={targetWeight} unit="kg" />
          <StatCard icon={Activity} label="Progress" value={progress.toFixed(1)} unit="kg lost" />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Weight Progress</h3>
            <span className="text-sm text-gray-500">Last 30 days</span>
          </div>
          <div className="h-80">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">Loading chart data...</div>
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.05} />
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
                    dot={{ r: 4, fill: '#f97316', strokeWidth: 2 }}
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
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No data yet. Start logging your weight.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow border border-gray-100 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Log</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              value={quickLogWeight}
              onChange={(e) => setQuickLogWeight(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Weight (kg)"
            />
            <input
              type="date"
              value={quickLogDate}
              onChange={(e) => setQuickLogDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSaveEntry}
            className="w-full mt-4 bg-gradient-to-r from-orange-500 to-yellow-400 hover:from-orange-600 hover:to-yellow-500 text-white py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
          >
            Save Entry
          </button>
        </div>

        <div className="overflow-x-auto bg-white rounded-2xl shadow border border-gray-100">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-gray-500 uppercase tracking-wider">Weight</th>
                <th className="px-6 py-3 text-gray-500 uppercase tracking-wider">Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.map((entry, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 text-gray-900">{entry.date}</td>
                  <td className="px-6 py-4">{entry.weight_kg} kg</td>
                  <td className="px-6 py-4">
                    <span className={entry.change >= 0 ? "text-red-600" : "text-orange-600"}>
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
