import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WaterTracker() {
  const [waterIntake, setWaterIntake] = useState(1200);
  const [customAmount, setCustomAmount] = useState(400);
  const [entries, setEntries] = useState([
    { amount: 500, time: '10:30 AM', color: 'bg-blue-500' },
    { amount: 350, time: '9:15 AM', color: 'bg-cyan-500' },
    { amount: 350, time: '8:00 AM', color: 'bg-blue-400' }
  ]);
  const [loading, setLoading] = useState(false);
  const [streak, setStreak] = useState(7);
  const [showCelebration, setShowCelebration] = useState(false);
  const dailyGoal = 2500;

  const progress = Math.min(Math.round((waterIntake / dailyGoal) * 100), 100);
  const remaining = Math.max(dailyGoal - waterIntake, 0);

  const getRandomColor = () => {
    const colors = ['bg-orange-500', 'bg-orange-400', 'bg-orange-600', 'bg-orange-300'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const addWater = async (amount) => {
    if (amount <= 0) return;
    
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
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

    const newTotal = waterIntake + amount;
    setWaterIntake(newTotal);
    setEntries(prev => [newEntry, ...prev.slice(0, 2)]);
    
    // Check if goal is reached
    if (newTotal >= dailyGoal && waterIntake < dailyGoal) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
    
    setLoading(false);
  };

  const formatAmount = (amt) => (amt >= 1000 ? `${(amt / 1000).toFixed(1)}L` : `${amt}ml`);

  const generateChartData = () => {
    const heights = [40, 80, 60, 30, 20, 20];
    return heights.map((height, index) => ({
      height: `${height}%`,
      color: progress >= (index + 1) * 100 / 6 ? 'bg-gradient-to-t from-orange-600 to-orange-400' : 'bg-gray-200',
      delay: index * 0.1,
    }));
  };

  const chartData = generateChartData();

  return (
    <div className="bg-gradient-to-br from-orange-50 via-white to-orange-50 min-h-screen p-6 md:p-12 font-sans relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-100 rounded-full opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-100 rounded-full opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-50 rounded-full opacity-30"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto relative z-10"
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">
          <Header waterIntake={waterIntake} dailyGoal={dailyGoal} formatAmount={formatAmount} loading={loading} progress={progress} />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <StatCard label="Today's Intake" value={formatAmount(waterIntake)} sub={loading ? "Loading..." : `${entries.length} entries today`} icon="💧" delay={0} />
          <StatCard label="Goal Progress" value={`${progress}%`} sub={<ProgressBar progress={progress} />} icon="🎯" delay={0.1} />
          <StatCard label="Remaining" value={formatAmount(remaining)} sub={remaining <= 0 ? "Goal achieved! 🎉" : "Keep going!"} icon="⏰" delay={0.2} />
          <StatCard label="Daily Streak" value={`${streak} days`} sub="Great consistency!" icon="🔥" delay={0.3} />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <QuickAdd customAmount={customAmount} setCustomAmount={setCustomAmount} loading={loading} addWater={addWater} />
          <ProgressChart chartData={chartData} waterIntake={waterIntake} remaining={remaining} formatAmount={formatAmount} entries={entries} loading={loading} />
        </motion.div>
      </motion.div>

      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          >
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-sm mx-4"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
                className="text-6xl mb-4"
              >
                🎉
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Goal Achieved!</h3>
              <p className="text-gray-600">You've reached your daily water intake goal!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const Header = ({ waterIntake, dailyGoal, formatAmount, loading, progress }) => {
  return (
    <>
      <div className="flex-1 max-w-xl">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-black text-gray-900 leading-tight"
        >
          Stay <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">Hydrated</span>, <br />
          Stay <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">Healthy</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-4 text-gray-600 max-w-md leading-relaxed"
        >
          Track your daily water intake with our smart hydration tracker. 
          Set goals, get reminders, and build healthy habits.
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 flex flex-wrap gap-3"
        >
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-orange-600 to-orange-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Add Water Now
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="border-2 border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-all duration-300"
          >
            View History
          </motion.button>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="relative"
      >
        <div className="w-40 h-56 rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-t from-blue-600 via-blue-400 to-blue-200 relative">
          <div className="absolute inset-0 flex flex-col justify-center items-center text-white z-10">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-2xl font-bold"
            >
              {formatAmount(waterIntake)}
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-sm opacity-90"
            >
              of {formatAmount(dailyGoal)}
            </motion.div>
            {loading && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="text-xs mt-2"
              >
                ⏳
              </motion.div>
            )}
          </div>
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: `${progress}%` }}
            transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-800 to-blue-600"
          />
          
          {/* Water bubbles animation */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20, scale: 0 }}
                animate={{ 
                  opacity: [0, 1, 0], 
                  y: [20, -20], 
                  scale: [0, 1, 0],
                  x: [0, Math.random() * 20 - 10]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  delay: i * 0.4,
                  ease: "easeInOut"
                }}
                className="absolute w-2 h-2 bg-white rounded-full opacity-30"
                style={{ 
                  left: `${20 + Math.random() * 60}%`,
                  bottom: `${10 + Math.random() * 30}%`
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
};

const StatCard = ({ label, value, sub, icon, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    whileHover={{ scale: 1.02, y: -5 }}
    className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
  >
    <div className="flex items-center gap-3 mb-3">
      <span className="text-2xl">{icon}</span>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
    <p className="text-sm font-semibold text-gray-600 mb-2">{label}</p>
    {typeof sub === 'string' ? (
      <p className="text-xs text-orange-600 font-medium">{sub}</p>
    ) : (
      sub
    )}
  </motion.div>
);

const ProgressBar = ({ progress }) => (
  <div className="w-full bg-gray-200 rounded-full h-2 mt-2 overflow-hidden">
    <motion.div 
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="bg-gradient-to-r from-orange-600 to-orange-500 h-2 rounded-full"
    />
  </div>
);

const QuickAdd = ({ customAmount, setCustomAmount, loading, addWater }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6, delay: 0.5 }}
    className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-lg max-w-xs md:max-w-none"
  >
    <h2 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
      <span className="text-xl">💧</span>
      Quick Add
    </h2>
    <div className="grid grid-cols-2 gap-3 mb-6">
      {[250, 350, 500, 1000].map((amt, idx) => (
        <motion.button
          key={idx}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => addWater(amt)}
          disabled={loading}
          className={`flex items-center justify-center gap-2 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-all duration-300 disabled:opacity-50 ${
            ['bg-gradient-to-r from-orange-600 to-orange-500', 'bg-gradient-to-r from-orange-500 to-orange-400', 'bg-gradient-to-r from-orange-400 to-orange-300', 'bg-gradient-to-r from-orange-600 to-orange-400'][idx]
          } hover:shadow-lg`}
        >
          <span className="text-lg">💧</span>
          {amt}ml
        </motion.button>
      ))}
    </div>

    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="customAmount">
      Custom Amount (ml)
    </label>
    <div className="flex gap-3">
      <input
        id="customAmount"
        type="number"
        min="0"
        max="2000"
        value={customAmount}
        onChange={(e) => setCustomAmount(Number(e.target.value))}
        className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
        placeholder="Enter amount"
      />
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => addWater(customAmount)}
        disabled={loading || customAmount <= 0}
        className="bg-gradient-to-r from-orange-600 to-orange-500 text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50"
      >
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            ⏳
          </motion.div>
        ) : (
          'Add'
        )}
      </motion.button>
    </div>
  </motion.div>
);

const ProgressChart = ({ chartData, waterIntake, remaining, formatAmount, entries, loading }) => (
  <motion.div 
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6, delay: 0.6 }}
    className="md:col-span-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-lg"
  >
    <div className="flex justify-between items-center mb-6">
      <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
        <span className="text-xl">📊</span>
        Today's Progress
      </h2>
      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
        Goal: {formatAmount(2500)}
      </span>
    </div>

    <div className="flex items-end justify-between gap-2 mb-6 h-24">
      {chartData.map((bar, index) => (
        <motion.div
          key={index}
          initial={{ height: 0 }}
          animate={{ height: bar.height }}
          transition={{ duration: 0.8, delay: bar.delay, ease: "easeOut" }}
          className={`flex-1 ${bar.color} rounded-t-lg min-w-0 shadow-sm`}
        />
      ))}
    </div>

    <div className="flex justify-between text-xs text-gray-400 mb-4">
      <span>6AM</span>
      <span>9AM</span>
      <span>12PM</span>
      <span>3PM</span>
      <span>6PM</span>
      <span>9PM</span>
    </div>

    <ProgressBar progress={Math.min((waterIntake / 2500) * 100, 100)} />

    <div className="flex justify-between text-sm text-gray-600 mb-6 mt-2">
      <span className="font-medium">{formatAmount(waterIntake)} consumed</span>
      <span className="font-medium">{formatAmount(remaining)} remaining</span>
    </div>

    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
      <span className="text-lg">📝</span>
      Recent Entries
    </h3>
    {loading ? (
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-sm text-gray-500"
      >
        Loading entries...
      </motion.div>
    ) : entries.length > 0 ? (
      <motion.ul className="space-y-3">
        <AnimatePresence>
          {entries.map((entry, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex items-center justify-between bg-gradient-to-r from-orange-50 to-orange-50 rounded-xl px-4 py-3 border border-orange-100"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">💧</span>
                <span className="font-semibold text-gray-800">{formatAmount(entry.amount)}</span>
              </div>
              <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded-lg">
                {entry.time}
              </span>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    ) : (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-sm text-gray-500 bg-gray-50 rounded-xl p-4 text-center"
      >
        No entries yet today. Start logging your water intake! 🌟
      </motion.div>
    )}
  </motion.div>
);