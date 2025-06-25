import React, { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  TrendingDown,
  Target,
  Activity,
  User,
  Edit2,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { getWeight, postWeight } from "../../../api/Weight";

const WeightTracker = () => {
  const [currentWeight, setCurrentWeight] = useState(165.2);
  const [targetWeight, setTargetWeight] = useState(160.0);
  const [quickLogWeight, setQuickLogWeight] = useState("165.2");
  const [quickLogDate, setQuickLogDate] = useState("");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWeight = async () => {
    setLoading(true);
    try {
      const data = await getWeight();
      console.log("Fetched weight data:", data);
      setEntries(Array.isArray(data.results) ? data.results : []);
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
  const goalProgress = Math.max(
    0,
    Math.min(100, ((170 - currentWeight) / (170 - targetWeight)) * 100)
  );
  const bmi = 22.4;

  // Transform entries data for the chart
  const chartData = entries
    .map((entry, index) => ({
      date: entry.date,
      weight: parseFloat(entry.weight_kg),
      displayDate: new Date(entry.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      target: targetWeight
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const handleSaveEntry = async () => {
    if (quickLogWeight && quickLogDate) {
      const newWeight = parseFloat(quickLogWeight);
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
    }
  };

  const StatCard = ({ icon: Icon, label, value, unit, color = "text-gray-900" }) => (
    <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100">
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
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-gray-600 text-sm">{`Date: ${label}`}</p>
          <p className="text-lime-600 font-semibold">{`Weight: ${payload[0].value} lbs`}</p>
          {payload[1] && (
            <p className="text-amber-600 font-semibold">{`Target: ${payload[1].value} lbs`}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Weight Tracker</h1>
            <p className="text-gray-600">Monitor your weight progress and achieve your goals</p>
          </div>
          {/* <button className="mt-4 sm:mt-0 bg-lime-500 hover:bg-lime-600 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Log Weight
          </button> */}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={TrendingDown} label="Current Weight" value={currentWeight} unit="lbs" color="text-lime-600" />
          <StatCard icon={Target} label="Goal" value={targetWeight} unit="lbs" color="text-amber-600" />
          <StatCard icon={Activity} label="This Month" value={progress.toFixed(1)} unit="lbs" color="text-orange-600" />
          {/* <StatCard icon={User} label="BMI" value={bmi} unit="Body Mass Index" color="text-pink-600" /> */}
        </div>

        {/* Weight Progress Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
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
                <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <defs>
                    <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#84cc16" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#84cc16" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="displayDate" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#666' }}
                  />
                  <YAxis 
                    domain={['dataMin - 2', 'dataMax + 2']}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#666' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="weight"
                    stroke="#84cc16"
                    strokeWidth={3}
                    fill="url(#weightGradient)"
                    dot={{ fill: '#84cc16', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#84cc16', strokeWidth: 2, fill: '#fff' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    activeDot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-gray-500 mb-2">No weight data available</div>
                  <div className="text-sm text-gray-400">Start logging your weight to see progress</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Log */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Log</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              value={quickLogWeight}
              onChange={(e) => setQuickLogWeight(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-transparent"
              placeholder="Weight (lbs)"
            />
            <input
              type="date"
              value={quickLogDate}
              onChange={(e) => setQuickLogDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSaveEntry}
            className="w-full mt-4 bg-gradient-to-r from-lime-500 to-yellow-400 hover:from-lime-600 hover:to-yellow-500 text-white py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
          >
            Save Entry
          </button>
        </div>

        {/* Entries Table */}
        <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-100">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-gray-500 uppercase tracking-wider">Weight</th>
                <th className="px-6 py-3 text-gray-500 uppercase tracking-wider">Change</th>
                <th className="px-6 py-3 text-gray-500 uppercase tracking-wider">BMI</th>
                {/* <th className="px-6 py-3 text-gray-500 uppercase tracking-wider">Actions</th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.map((entry, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 text-gray-900">{entry.date}</td>
                  <td className="px-6 py-4">{entry.weight_kg} lbs</td>
                  <td className="px-6 py-4">
                    <span className={`${entry.change >= 0 ? "text-red-600" : "text-lime-600"}`}>
                      {entry.change >= 0 ? "+" : ""}
                      {entry.change?.toFixed(1) || "0.0"} lbs
                    </span>
                  </td>
                  {/* <td className="px-6 py-4">{entry.bmi}</td> */}
                  <td className="px-6 py-4">
                    {/* <button className="text-gray-400 hover:text-gray-600">
                      <Edit2 className="w-4 h-4" />
                    </button> */}
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