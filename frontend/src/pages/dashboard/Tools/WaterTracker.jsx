import React, { useState, useEffect } from 'react';
import { getWater, postWater } from '../../../api/WaterTracker';

export default function WaterTracker() {
  const [waterIntake, setWaterIntake] = useState(0);
  const [customAmount, setCustomAmount] = useState(400);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [streak, setStreak] = useState(7);
  const dailyGoal = 2500;
  const progressPercentage = Math.round((waterIntake / dailyGoal) * 100);
  const remaining = dailyGoal - waterIntake;

  // ✅ Move this helper ABOVE usage
  const getRandomColor = () => {
    const colors = ['bg-blue-500', 'bg-cyan-400', 'bg-green-400', 'bg-purple-600'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // ✅ Fetch today's water data on mount
  const fetchWaterData = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const data = await getWater(today);

      console.log('Fetched water data:', data);

      const waterEntries = Array.isArray(data) ? data : (data?.results || []);
      const total = waterEntries.reduce((sum, entry) => sum + (entry.amount || 0), 0);
      setWaterIntake(total);

      setEntries(
        waterEntries
          .sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date))
          .slice(0, 3)
          .map(entry => ({
            amount: entry.amount || 0,
            time: (entry.created_at || entry.date)
              ? new Date(entry.created_at || entry.date).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })
              : 'Unknown',
            color: getRandomColor()
          }))
      );
    } catch (error) {
      console.error('Error fetching water data:', error);
      setWaterIntake(0);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaterData();
  }, []);

  const addWater = async (amount_ml) => {
  if (amount_ml <= 0) return;

  try {
    const today = new Date().toISOString().split('T')[0]; // e.g., "2025-06-25"
    const waterData = {
      amount_ml,
      date: today,
    };

    await postWater(waterData);

    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const randomColor = getRandomColor();

    setWaterIntake(prev => prev + amount_ml);
    setEntries(prev => [
      { amount: amount_ml, time: timeString, color: randomColor },
      ...prev.slice(0, 2)
    ]);

    console.log(`Successfully added ${amount_ml}ml of water`);
  } catch (error) {
    console.error('Error posting water data:', error.response?.data || error.message);
    alert('Failed to add water entry. Please try again.');
  }
};


  const formatAmount = (amount) => {
    return amount >= 1000 ? `${(amount / 1000).toFixed(1)}L` : `${amount}ml`;
  };

  const generateChartData = () => {
    const baseData = [
      { height: '40%', color: 'bg-blue-500' },
      { height: '80%', color: 'bg-blue-500' },
      { height: '60%', color: 'bg-cyan-400' },
      { height: '30%', color: 'bg-green-400' },
      { height: '20%', color: 'bg-slate-300' },
      { height: '20%', color: 'bg-slate-300' }
    ];

    return baseData.map((bar, index) => {
      const shouldBeActive = (index + 1) * (100 / 6) <= progressPercentage;
      return {
        ...bar,
        color: shouldBeActive ? bar.color : 'bg-slate-300'
      };
    });
  };

  const chartData = generateChartData();

  return (
    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 min-h-screen p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-start md:justify-between gap-10">
        <div className="flex-1 max-w-xl">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
            Stay <span className="text-blue-500">Hydrated</span>, Stay <br /> <span className="font-extrabold">Healthy</span>
          </h1>
          <p className="mt-2 text-sm text-slate-700 max-w-md">
            Track your daily water intake with our smart hydration tracker. <br />
            Set goals, get reminders, and build healthy habits.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => addWater(250)}
              disabled={loading}
              className="bg-blue-500 text-white text-xs md:text-sm font-semibold px-4 py-2 rounded-md shadow-md hover:bg-blue-600 transition disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Add Water Now'}
            </button>
            <button
              onClick={fetchWaterData}
              className="border border-slate-300 text-slate-700 text-xs md:text-sm font-semibold px-4 py-2 rounded-md hover:bg-slate-100 transition"
            >
              Refresh Data
            </button>
          </div>
        </div>

        <div className="relative w-36 h-48 rounded-xl overflow-hidden shadow-lg bg-gradient-to-t from-blue-400 via-blue-300 to-blue-100">
          <div className="absolute inset-0 flex flex-col justify-center items-center text-white">
            <div className="text-2xl font-bold">{formatAmount(waterIntake)}</div>
            <div className="text-sm opacity-80">of {formatAmount(dailyGoal)}</div>
            {loading && <div className="text-xs mt-1">Loading...</div>}
          </div>
          <div
            className="absolute bottom-0 left-0 right-0 bg-blue-500 transition-all duration-500"
            style={{ height: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Today's Intake" value={formatAmount(waterIntake)} sub={loading ? "Loading..." : `${entries.length} entries today`} />
        <StatCard label="Goal Progress" value={`${progressPercentage}%`} sub={
          <div className="w-full bg-slate-200 rounded-full h-1 mt-2">
            <div className="bg-blue-500 h-1 rounded-full transition-all duration-500" style={{ width: `${Math.min(progressPercentage, 100)}%` }} />
          </div>
        } />
        <StatCard label="Remaining" value={formatAmount(Math.max(remaining, 0))} sub={remaining <= 0 ? "Goal achieved! 🎉" : "Keep going!"} />
        <StatCard label="Daily Streak" value={`${streak} days`} sub="Great consistency!" />
      </div>

      <div className="max-w-7xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-slate-200 rounded-lg p-4 bg-white max-w-xs md:max-w-none">
          <h2 className="font-semibold text-slate-900 mb-3 text-sm">Quick Add</h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[250, 350, 500, 1000].map((amt, idx) => (
              <button
                key={idx}
                onClick={() => addWater(amt)}
                disabled={loading}
                className={`flex items-center justify-center gap-2 ${
                  idx === 0
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : idx === 1
                    ? 'bg-cyan-400 hover:bg-cyan-500'
                    : idx === 2
                    ? 'bg-green-400 hover:bg-green-500'
                    : 'bg-purple-600 hover:bg-purple-700'
                } text-white text-xs font-semibold py-2 rounded-md shadow-md transition disabled:opacity-50`}
              >
                💧 {amt}ml
              </button>
            ))}
          </div>

          <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="customAmount">
            Custom Amount (ml)
          </label>
          <div className="flex gap-2">
            <input
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="customAmount"
              type="number"
              min="0"
              max="2000"
              value={customAmount}
              onChange={(e) => setCustomAmount(Number(e.target.value))}
              placeholder="Enter amount"
            />
            <button
              onClick={() => addWater(customAmount)}
              disabled={loading || customAmount <= 0}
              className="bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-md shadow-md hover:bg-blue-600 transition disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>

        <div className="md:col-span-2 bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-slate-900 text-sm">Today's Progress</h2>
            <span className="text-xs text-slate-400">Goal: {formatAmount(dailyGoal)}</span>
          </div>
          <div className="flex items-end gap-3 mb-4 h-20">
            {chartData.map((bar, index) => (
              <div
                key={index}
                className={`w-6 ${bar.color} rounded-t-md transition-all duration-300`}
                style={{ height: bar.height }}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span>6AM</span>
            <span>9AM</span>
            <span>12PM</span>
            <span>3PM</span>
            <span>6PM</span>
            <span>9PM</span>
          </div>
          <div className="w-full h-1 bg-slate-200 rounded-full mb-2 relative">
            <div
              className="bg-blue-500 h-1 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400 mb-4">
            <span>{formatAmount(waterIntake)} consumed</span>
            <span>{formatAmount(Math.max(remaining, 0))} remaining</span>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-2 text-xs">Recent Entries</h3>
            {loading ? (
              <div className="text-xs text-slate-500">Loading entries...</div>
            ) : entries.length > 0 ? (
              <ul className="space-y-2">
                {entries.map((entry, index) => (
                  <li
                    key={index}
                    className={`flex items-center justify-between ${entry.color} bg-opacity-10 rounded-md px-3 py-1 text-xs font-semibold text-slate-800`}
                  >
                    <div className="flex items-center gap-2">
                      💧 {formatAmount(entry.amount)}
                    </div>
                    <span>{entry.time}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-slate-500">No entries yet today. Start logging your water intake!</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ label, value, sub }) => (
  <div className="flex flex-col border border-slate-200 rounded-lg p-4 text-slate-900 bg-white">
    <div className="flex items-center gap-2 mb-2 text-lg font-semibold text-slate-900">{value}</div>
    <p className="text-xs font-semibold">{label}</p>
    {typeof sub === 'string' ? <p className="text-xs text-green-600 font-semibold mt-1">{sub}</p> : sub}
  </div>
);
