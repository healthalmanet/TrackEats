import React, { useState } from "react";
import {
  Calendar,
  Plus,
  TrendingDown,
  Target,
  Activity,
  User,
  Edit2,
} from "lucide-react";

const WeightTracker = () => {
  const [currentWeight, setCurrentWeight] = useState(165.2);
  const [targetWeight, setTargetWeight] = useState(160.0);
  const [quickLogWeight, setQuickLogWeight] = useState("165.2");
  const [quickLogDate, setQuickLogDate] = useState("");
  const [entries, setEntries] = useState([
    { date: "Today", weight: 165.2, change: -0.3, bmi: 22.4 },
    { date: "Yesterday", weight: 165.5, change: -0.2, bmi: 22.5 },
    { date: "2 days ago", weight: 165.7, change: -0.4, bmi: 22.5 },
  ]);

  const progress = currentWeight - targetWeight;
  const goalProgress = Math.max(
    0,
    Math.min(100, ((170 - currentWeight) / (170 - targetWeight)) * 100)
  );
  const bmi = 22.4;

  const handleSaveEntry = () => {
    if (quickLogWeight && quickLogDate) {
      const newWeight = parseFloat(quickLogWeight);
      const newEntry = {
        date: new Date(quickLogDate).toLocaleDateString(),
        weight: newWeight,
        change: entries.length > 0 ? newWeight - entries[0].weight : 0,
        bmi: ((newWeight / 2.205 / Math.pow(1.75, 2)) * 703).toFixed(1),
      };
      setEntries([newEntry, ...entries]);
      setCurrentWeight(newWeight);
      setQuickLogWeight("");
      setQuickLogDate("");
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Weight Tracker</h1>
            <p className="text-gray-600">
              Monitor your weight progress and achieve your goals
            </p>
          </div>
          <button className="mt-4 sm:mt-0 bg-lime-500 hover:bg-lime-600 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Log Weight
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={TrendingDown}
            label="Current Weight"
            value={currentWeight}
            unit="lbs"
            color="text-lime-600"
          />
          <StatCard
            icon={Target}
            label="Goal"
            value={targetWeight}
            unit="lbs"
            color="text-amber-600"
          />
          <StatCard
            icon={Activity}
            label="This Month"
            value={progress.toFixed(1)}
            unit="lbs"
            color="text-orange-600"
          />
          <StatCard
            icon={User}
            label="BMI"
            value={bmi}
            unit="Body Mass Index"
            color="text-pink-600"
          />
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
                <th className="px-6 py-3 text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.map((entry, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 text-gray-900">{entry.date}</td>
                  <td className="px-6 py-4">{entry.weight} lbs</td>
                  <td className="px-6 py-4">
                    <span
                      className={`${
                        entry.change >= 0 ? "text-red-600" : "text-lime-600"
                      }`}
                    >
                      {entry.change >= 0 ? "+" : ""}
                      {entry.change.toFixed(1)} lbs
                    </span>
                  </td>
                  <td className="px-6 py-4">{entry.bmi}</td>
                  <td className="px-6 py-4">
                    <button className="text-gray-400 hover:text-gray-600">
                      <Edit2 className="w-4 h-4" />
                    </button>
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
