import React, { useState } from 'react';

export default function WaterTracker() {
  const [waterIntake, setWaterIntake] = useState(1200);
  const [customAmount, setCustomAmount] = useState(400);
  const [entries, setEntries] = useState([
    { amount: 250, time: '2:15 PM', color: 'bg-blue-500' },
    { amount: 350, time: '12:30 PM', color: 'bg-cyan-400' },
    { amount: 500, time: '9:45 AM', color: 'bg-green-400' }
  ]);
  const [streak, setStreak] = useState(7);
  const dailyGoal = 2500;
  const progressPercentage = Math.round((waterIntake / dailyGoal) * 100);
  const remaining = dailyGoal - waterIntake;

  const addWater = (amount) => {
    if (amount <= 0) return;
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    const colors = ['bg-blue-500', 'bg-cyan-400', 'bg-green-400', 'bg-purple-600'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setWaterIntake(prev => prev + amount);
    setEntries(prev => [{ amount, time: timeString, color: randomColor }, ...prev.slice(0, 2)]);
  };

  const formatAmount = (amount) => {
    return amount >= 1000 ? `${(amount / 1000).toFixed(1)}L` : `${amount}ml`;
  };

  const chartData = [
    { height: '40%', color: 'bg-blue-500' },
    { height: '80%', color: 'bg-blue-500' },
    { height: '60%', color: 'bg-cyan-400' },
    { height: '30%', color: 'bg-green-400' },
    { height: '20%', color: 'bg-slate-300' },
    { height: '20%', color: 'bg-slate-300' }
  ];

  return (
    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 min-h-screen p-6 md:p-12 font-sans">
      {/* Header */}
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
              className="bg-blue-500 text-white text-xs md:text-sm font-semibold px-4 py-2 rounded-md shadow-md hover:bg-blue-600 transition"
            >
              Add Water Now
            </button>
            <button className="border border-slate-300 text-slate-700 text-xs md:text-sm font-semibold px-4 py-2 rounded-md hover:bg-slate-100 transition">
              View Progress
            </button>
          </div>
        </div>

        {/* Water Level Visual */}
        <div className="relative w-36 h-48 rounded-xl overflow-hidden shadow-lg bg-gradient-to-t from-blue-400 via-blue-300 to-blue-100">
          <div className="absolute inset-0 flex flex-col justify-center items-center text-white">
            <div className="text-2xl font-bold">{formatAmount(waterIntake)}</div>
            <div className="text-sm opacity-80">of {formatAmount(dailyGoal)}</div>
          </div>
          <div
            className="absolute bottom-0 left-0 right-0 bg-blue-500 transition-all duration-500"
            style={{ height: `${Math.min(progressPercentage, 100)}%` }}
          />
          
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Today's Intake" value={formatAmount(waterIntake)} sub="+0.3L from yesterday" />
        <StatCard
          label="Goal Progress"
          value={`${progressPercentage}%`}
          sub={
            <div className="w-full bg-slate-200 rounded-full h-1 mt-2">
              <div
                className="bg-blue-500 h-1 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
          }
        />
        {/* <StatCard label="Day Streak" value={streak} sub="🌿 Personal best!" /> */}
        {/* <StatCard label="Next Reminder" value="2h" sub="3:30 PM" /> */}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Add */}
        <div className="border border-slate-200 rounded-lg p-4 bg-white max-w-xs md:max-w-none">
          <h2 className="font-semibold text-slate-900 mb-3 text-sm">Quick Add</h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[250, 350, 500, 1000].map((amt, idx) => (
              <button
                key={idx}
                onClick={() => addWater(amt)}
                className={`flex items-center justify-center gap-2 ${
                  idx === 0
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : idx === 1
                    ? 'bg-cyan-400 hover:bg-cyan-500'
                    : idx === 2
                    ? 'bg-green-400 hover:bg-green-500'
                    : 'bg-purple-600 hover:bg-purple-700'
                } text-white text-xs font-semibold py-2 rounded-md shadow-md transition`}
              >
                <i className="fas fa-tint" />
                {amt}ml
              </button>
            ))}
          </div>

          <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="customAmount">
            Custom Amount
          </label>
          <div className="flex gap-2">
            <input
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="customAmount"
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(Number(e.target.value))}
            />
            <button
              onClick={() => addWater(customAmount)}
              className="bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-md shadow-md hover:bg-blue-600 transition"
            >
              Add
            </button>
          </div>
        </div>

        {/* Progress Chart */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-slate-900 text-sm">Today's Progress</h2>
            <span className="text-xs text-slate-400">Goal: {formatAmount(dailyGoal)}</span>
          </div>
          <div className="flex items-end gap-3 mb-4 h-20">
            {chartData.map((bar, index) => (
              <div key={index} className={`w-6 ${bar.color} rounded-t-md transition-all duration-300`} style={{ height: bar.height }} />
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
            <ul className="space-y-2">
              {entries.map((entry, index) => (
                <li
                  key={index}
                  className={`flex items-center justify-between ${entry.color} bg-opacity-10 rounded-md px-3 py-1 text-xs font-semibold text-slate-800`}
                >
                  <div className="flex items-center gap-2">
                    <i className="fas fa-tint" />
                    {formatAmount(entry.amount)}
                  </div>
                  <span>{entry.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for stats
const StatCard = ({ label, value, sub }) => (
  <div className="flex flex-col border border-slate-200 rounded-lg p-4 text-slate-900 bg-white">
    <div className="flex items-center gap-2 mb-2 text-lg font-semibold text-slate-900">{value}</div>
    <p className="text-xs font-semibold">{label}</p>
    {typeof sub === 'string' ? <p className="text-xs text-green-600 font-semibold mt-1">{sub}</p> : sub}
  </div>
);
