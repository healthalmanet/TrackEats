import React, { useState, useEffect } from 'react';
import { getWater, postWater } from '../../../api/WaterTracker';

export default function WaterTracker() {
  const [waterIntake, setWaterIntake] = useState(0);
  const [customAmount, setCustomAmount] = useState(400);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [streak, setStreak] = useState(7);
  const dailyGoal = 2500;

  const progress = Math.min(Math.round((waterIntake / dailyGoal) * 100), 100);
  const remaining = Math.max(dailyGoal - waterIntake, 0);

  const getRandomColor = () => {
    const colors = ['bg-orange-500', 'bg-orange-400', 'bg-orange-300', 'bg-orange-600'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const fetchWaterData = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const data = await getWater(today);

      const waterEntries = Array.isArray(data) ? data : data?.results || [];
      const total = waterEntries.reduce((sum, entry) => sum + (entry.amount || 0), 0);
      setWaterIntake(total);

      const sortedEntries = waterEntries
        .sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date))
        .slice(0, 3)
        .map(entry => ({
          amount: entry.amount,
          time: new Date(entry.created_at || entry.date).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          }),
          color: getRandomColor(),
        }));

      setEntries(sortedEntries);
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

  const addWater = async (amount) => {
    if (amount <= 0) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      await postWater({ amount_ml: amount, date: today });

      const now = new Date();
      const newEntry = {
        amount,
        time: now.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }),
        color: getRandomColor(),
      };

      setWaterIntake(prev => prev + amount);
      setEntries(prev => [newEntry, ...prev.slice(0, 2)]);
    } catch (error) {
      console.error('Error posting water data:', error.response?.data || error.message);
      alert('Failed to add water entry. Please try again.');
    }
  };

  const formatAmount = (amt) => (amt >= 1000 ? `${(amt / 1000).toFixed(1)}L` : `${amt}ml`);

  const generateChartData = () => {
    const chartTemplate = ['40%', '80%', '60%', '30%', '20%', '20%'];
    return chartTemplate.map((height, index) => ({
      height,
      color: progress >= (index + 1) * 100 / 6 ? chartTemplateColor(index) : 'bg-slate-300',
    }));
  };

  const chartTemplateColor = (index) =>
    ['bg-orange-500', 'bg-orange-400', 'bg-orange-300', 'bg-orange-300', 'bg-slate-300', 'bg-slate-300'][index];

  const chartData = generateChartData();

  return (
    <div className="bg-white min-h-screen p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-start md:justify-between gap-10">
        <Header waterIntake={waterIntake} dailyGoal={dailyGoal} formatAmount={formatAmount} loading={loading} />
      </div>

      <div className="max-w-7xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Today's Intake" value={formatAmount(waterIntake)} sub={loading ? "Loading..." : `${entries.length} entries today`} />
        <StatCard label="Goal Progress" value={`${progress}%`} sub={<ProgressBar progress={progress} />} />
        <StatCard label="Remaining" value={formatAmount(remaining)} sub={remaining <= 0 ? "Goal achieved! 🎉" : "Keep going!"} />
        <StatCard label="Daily Streak" value={`${streak} days`} sub="Great consistency!" />
      </div>

      <div className="max-w-7xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickAdd customAmount={customAmount} setCustomAmount={setCustomAmount} loading={loading} addWater={addWater} />
        <ProgressChart chartData={chartData} waterIntake={waterIntake} remaining={remaining} formatAmount={formatAmount} entries={entries} loading={loading} />
      </div>
    </div>
  );
}

const Header = ({ waterIntake, dailyGoal, formatAmount, loading }) => {
  const progress = Math.min((waterIntake / dailyGoal) * 100, 100);
  return (
    <>
      <div className="flex-1 max-w-xl">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
          Stay <span className="text-orange-500">Hydrated</span>, Stay <br /> <span className="font-extrabold">Healthy</span>
        </h1>
        <p className="mt-2 text-sm text-slate-700 max-w-md">
          Track your daily water intake with our smart hydration tracker. <br />
          Set goals, get reminders, and build healthy habits.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={() => window.location.reload()} className="bg-orange-500 text-white text-xs md:text-sm font-semibold px-4 py-2 rounded-md shadow-md hover:bg-orange-600 transition">
            Add Water Now
          </button>
          <button onClick={() => window.location.reload()} className="border border-slate-300 text-slate-700 text-xs md:text-sm font-semibold px-4 py-2 rounded-md hover:bg-slate-100 transition">
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
        <div className="absolute bottom-0 left-0 right-0 bg-orange-500 transition-all duration-500" style={{ height: `${progress}%` }} />
      </div>
    </>
  );
};

const StatCard = ({ label, value, sub }) => (
  <div className="flex flex-col border border-slate-200 rounded-lg p-4 text-slate-900 bg-white">
    <div className="flex items-center gap-2 mb-2 text-lg font-semibold">{value}</div>
    <p className="text-xs font-semibold">{label}</p>
    {typeof sub === 'string' ? <p className="text-xs text-orange-600 font-semibold mt-1">{sub}</p> : sub}
  </div>
);

const ProgressBar = ({ progress }) => (
  <div className="w-full bg-slate-200 rounded-full h-1 mt-2">
    <div className="bg-orange-500 h-1 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
  </div>
);

const QuickAdd = ({ customAmount, setCustomAmount, loading, addWater }) => (
  <div className="border border-slate-200 rounded-lg p-4 bg-white max-w-xs md:max-w-none">
    <h2 className="font-semibold text-slate-900 mb-3 text-sm">Quick Add</h2>
    <div className="grid grid-cols-2 gap-3 mb-4">
      {[250, 350, 500, 1000].map((amt, idx) => (
        <button
          key={idx}
          onClick={() => addWater(amt)}
          disabled={loading}
          className={`flex items-center justify-center gap-2 text-white text-xs font-semibold py-2 rounded-md shadow-md transition disabled:opacity-50 ${
            ['bg-orange-500', 'bg-orange-400', 'bg-orange-300', 'bg-orange-600'][idx]
          } hover:brightness-110`}
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
        id="customAmount"
        type="number"
        min="0"
        max="2000"
        value={customAmount}
        onChange={(e) => setCustomAmount(Number(e.target.value))}
        className="w-full border border-slate-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
        placeholder="Enter amount"
      />
      <button
        onClick={() => addWater(customAmount)}
        disabled={loading || customAmount <= 0}
        className="bg-orange-500 text-white text-xs font-semibold px-4 py-2 rounded-md shadow-md hover:bg-orange-600 transition disabled:opacity-50"
      >
        Add
      </button>
    </div>
  </div>
);

const ProgressChart = ({ chartData, waterIntake, remaining, formatAmount, entries, loading }) => (
  <div className="md:col-span-2 bg-white border border-slate-200 rounded-lg p-4">
    <div className="flex justify-between items-center mb-3">
      <h2 className="font-semibold text-slate-900 text-sm">Today's Progress</h2>
      <span className="text-xs text-slate-400">Goal: {formatAmount(2500)}</span>
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

    <ProgressBar progress={Math.min((waterIntake / 2500) * 100, 100)} />

    <div className="flex justify-between text-xs text-slate-400 mb-4">
      <span>{formatAmount(waterIntake)} consumed</span>
      <span>{formatAmount(remaining)} remaining</span>
    </div>

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
            <div className="flex items-center gap-2">💧 {formatAmount(entry.amount)}</div>
            <span>{entry.time}</span>
          </li>
        ))}
      </ul>
    ) : (
      <div className="text-xs text-slate-500">No entries yet today. Start logging your water intake!</div>
    )}
  </div>
);
