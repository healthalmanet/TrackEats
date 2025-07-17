// src/pages/dashboard/tools/WaterTracker.jsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useAnimate, animate } from 'framer-motion';
import { GlassWater, Plus, Target, Lightbulb, RefreshCw, BarChart2, Droplet, Wind } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getTotalWaterForDate, getWaterHistory, postWater } from "../../../api/WaterTracker.js";

// --- Theme-aligned Configuration ---
const DAILY_GOAL = 2500;
const hydrationTips = [
  "Add lemon or cucumber for a flavor boost.", "Drink a glass of water as soon as you wake up.", "Keep a reusable bottle on your desk.", "Eat water-rich foods like watermelon.", "Set hourly reminders to drink up."
];

// --- Helper Components ---
const AnimatedNumber = ({ value }) => {
  const [dv, setDv] = useState(0);
  useEffect(() => {
    const controls = animate(dv, value, { type: "spring", mass: 0.8, stiffness: 100, damping: 20, onUpdate: (v) => setDv(v) });
    return () => controls.stop();
  }, [value]);
  return <>{Math.round(dv)}</>;
};

const Confetti = () => (
  <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
    {Array.from({ length: 50 }).map((_, i) => (
      <motion.div
        key={i}
        initial={{ x: `${Math.random() * 100}vw`, y: -20, opacity: 1, rotate: Math.random() * 360 }}
        animate={{ y: '110vh' }}
        transition={{ duration: 2 + Math.random() * 3, ease: "linear", delay: Math.random() * 0.5 }}
        style={{ position: 'absolute', width: i % 2 === 0 ? 8 : 12, height: i % 2 === 0 ? 8 : 12, backgroundColor: `hsla(${195 + i*2}, 80%, 60%, 1)`, borderRadius: i % 2 === 0 ? '2px' : '50%'}}
      />
    ))}
  </div>
);

const Card = ({ children, delay, className = "" }) => (
    <motion.div
        variants={{ hidden:{opacity:0, y:20}, visible:{opacity:1,y:0}}}
        transition={{delay}}
        className={`bg-[var(--color-bg-surface)] p-5 rounded-2xl border-2 border-[var(--color-border-default)] shadow-lg ${className}`}
    >
        {children}
    </motion.div>
);

const GoalCard = ({ progress, isLoading }) => (
  <Card delay={0.2}>
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 flex items-center justify-center rounded-full bg-[var(--color-success-bg-subtle)]"><Target size={28} className='text-[var(--color-success-text)]'/></div>
      <div>
        <p className="text-lg font-[var(--font-primary)] font-bold text-[var(--color-text-strong)]">Goal Progress</p>
        <p className="text-3xl font-bold text-[var(--color-primary)]">{isLoading ? "..." : Math.round(progress)}<span className="text-lg font-medium">%</span></p>
      </div>
    </div>
  </Card>
);

const HydrationTipCard = ({ tip }) => (
  <Card delay={0.3}>
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 flex items-center justify-center rounded-full shrink-0 bg-[var(--color-accent-1-bg-subtle)]">
        <Lightbulb size={28} className='text-[var(--color-accent-1-text)]'/>
      </div>
      <div>
        <p className="text-lg font-[var(--font-primary)] font-bold text-[var(--color-text-strong)]">Hydration Tip</p>
        <p className="text-sm text-[var(--color-text-default)]">{tip}</p>
      </div>
    </div>
  </Card>
);

const HistoryChart = ({ data, isLoading }) => (
  <Card delay={0.4} className="flex flex-col">
    <h3 className="text-lg font-[var(--font-primary)] font-bold flex items-center gap-2.5 mb-4 shrink-0 text-[var(--color-text-strong)]"><BarChart2 size={20}/> Weekly Summary</h3>
    <div className="h-40">
      {isLoading ? (<div className="flex h-full w-full items-center justify-center"><RefreshCw className="animate-spin text-[var(--color-text-muted)]" /></div>)
       : data.length === 0 ? (<div className="flex flex-col h-full items-center justify-center text-center text-[var(--color-text-muted)] p-4"><BarChart2 size={32} className="mb-2"/><p className="text-xs">No history yet.</p></div>)
       : (<ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: -10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-default)" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: 'rgba(var(--color-primary-rgb), 0.1)' }} content={({ active, payload, label }) => active && payload && payload.length ? (<div className="bg-[var(--color-bg-surface)] p-2 text-xs shadow-lg rounded-md border-2 border-[var(--color-primary)]"><p className='text-[var(--color-text-default)]'>{label}</p><p className="font-bold text-[var(--color-primary)]">{payload[0].value} ml</p></div>) : null } />
            <Bar dataKey="total" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>)
      }
    </div>
  </Card>
);

export default function WaterTracker() {
  const [totalWaterIntake, setTotalWaterIntake] = useState(0);
  const [historicalData, setHistoricalData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [customAmount, setCustomAmount] = useState(250);
  const [showCelebration, setShowCelebration] = useState(false);
  const [floatingNumbers, setFloatingNumbers] = useState([]);
  const [hydrationTip] = useState(() => hydrationTips[Math.floor(Math.random() * hydrationTips.length)]);
  const [scope, animateScope] = useAnimate();
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  
  const progress = Math.min((totalWaterIntake / DAILY_GOAL) * 100, 100);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [totalRes, historyRes] = await Promise.all([ getTotalWaterForDate(today), getWaterHistory() ]);
      setTotalWaterIntake(totalRes.total_water_ml || 0);
      if (Array.isArray(historyRes.results)) {
        const formatted = historyRes.results.slice(0, 7).map(item => ({ total: item.amount_ml || 0, date: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }) })).reverse();
        setHistoricalData(formatted);
      }
    } catch (err) { console.error("Fetch error:", err); } 
    finally { setIsLoading(false); }
  }, [today]);

  useEffect(() => { const token = localStorage.getItem('token'); if (token) fetchData(); else setIsLoading(false); }, [fetchData]);

  const addWater = async (amount) => {
    if (!amount || amount <= 0) return;
    const oldTotal = totalWaterIntake; const newTotal = oldTotal + amount;
    const newProgress = Math.min((newTotal / DAILY_GOAL) * 100, 100);
    animateScope([ ["#water-level", { y: `${100 - newProgress}%` }, { type: "spring", stiffness: 80, damping: 15 }], ["#glass-container", { scale: [1, 1.05, 1] }, { duration: 0.5 }] ]);
    const floatId = Date.now() + 1;
    setFloatingNumbers(prev => [...prev, { id: floatId, amount }]);
    setTimeout(() => { setFloatingNumbers(prev => prev.filter(f => f.id !== floatId)); }, 2000);
    if (newTotal >= DAILY_GOAL && oldTotal < DAILY_GOAL) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 5000);
    }
    try { await postWater({ amount_ml: amount }); await fetchData(); } catch (err) { console.error("Post error:", err); }
  };

  return (
    <div ref={scope} className="min-h-screen bg-[var(--color-bg-app)] p-4 sm:p-6 lg:p-8 font-[var(--font-secondary)] relative overflow-hidden">
      <AnimatePresence>{showCelebration && <Confetti />}</AnimatePresence>
      <motion.main initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }} className="max-w-7xl mx-auto grid lg:grid-cols-5 gap-8">
        <motion.div variants={{ hidden: { opacity:0, y:20 }, visible: { opacity: 1, y: 0 }}} className="lg:col-span-3 flex flex-col items-center justify-center bg-[var(--color-bg-surface)] p-8 sm:p-12 rounded-3xl border-2 border-[var(--color-border-default)] shadow-2xl">
          <h1 className="text-3xl sm:text-4xl font-[var(--font-primary)] font-bold mb-8 text-center text-[var(--color-text-strong)]">Daily Hydration</h1>
          <div id="glass-container" className="relative w-48 h-80 mb-6">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-200/20 to-transparent rounded-t-3xl rounded-b-lg"></div>
            <motion.div id="water-level" className="absolute bottom-0 left-0 right-0 h-full bg-[var(--color-primary)] rounded-b-lg" style={{ y: '100%' }} animate={{ y: `${100 - progress}%` }} transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.5 }}/>
            <AnimatePresence>
                {Array.from({length: 5}).map((_, i) => (
                    <motion.div key={i} className="absolute w-1 h-1 bg-white/50 rounded-full" style={{ left: `${15 + i * 15}%` }}
                        initial={{bottom: 0}}
                        animate={{ bottom: '100%', opacity: [1,1,0]}}
                        transition={{ duration: 2 + Math.random(), repeat: Infinity, ease: 'linear', delay: Math.random()}}
                    />
                ))}
            </AnimatePresence>
            <AnimatePresence>
              {floatingNumbers.map(({ id, amount }) => (<motion.div key={id} initial={{ y:0, opacity:1, scale:0.5 }} animate={{ y:-100, opacity:0, scale:1 }} exit={{ opacity:0 }} transition={{ duration:2, ease:"easeOut" }} className="absolute top-1/2 left-1/2 text-3xl font-bold z-30 text-[var(--color-primary-hover)]"><Plus size={18} className='inline-block -mt-1'/>{amount}</motion.div>))}
            </AnimatePresence>
          </div>
          <div className="text-center mb-10">
            <p className="text-5xl sm:text-6xl font-bold tracking-tight text-[var(--color-text-strong)]">{isLoading ? '...' : <AnimatedNumber value={totalWaterIntake} />}<span className="text-2xl font-normal ml-2 text-[var(--color-text-default)]">ml</span></p>
            <p className={`font-semibold mt-2 ${progress >= 100 ? 'text-[var(--color-success-text)]' : 'text-[var(--color-text-default)]'}`}>of {DAILY_GOAL} ml goal</p>
          </div>
          <div className="w-full max-w-sm">
            <p className="text-center text-sm font-semibold mb-3 text-[var(--color-text-default)]">Log a drink</p>
            <div className="flex justify-center gap-2.5 sm:gap-4 mb-4">
              {[150, 250, 500].map(amount => (
                <motion.button key={amount} onClick={() => addWater(amount)} whileHover={{ scale:1.05, y:-3 }} whileTap={{ scale:0.95 }} className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-semibold py-2.5 px-6 rounded-full border-2 border-[var(--color-primary)]/20 transition-all hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 flex items-center gap-1.5">
                  <Plus size={16} />{amount}ml
                </motion.button>
              ))}
            </div>
            <div className="flex mt-4 gap-3">
              <input type="number" value={customAmount} onChange={(e) => setCustomAmount(Number(e.target.value))} placeholder="Custom" className="w-full bg-[var(--color-bg-surface)] border-2 border-[var(--color-border-default)] rounded-full px-4 py-3 text-center text-[var(--color-text-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-colors" />
              <motion.button onClick={() => addWater(customAmount)} whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }} className="text-[var(--color-text-on-primary)] font-bold px-8 py-3 rounded-full shadow-lg transition-transform bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]">Add</motion.button>
            </div>
          </div>
        </motion.div>
        <div className="lg:col-span-2 flex flex-col gap-6">
          <GoalCard progress={progress} isLoading={isLoading}/>
          <HydrationTipCard tip={hydrationTip}/>
          <HistoryChart data={historicalData} isLoading={isLoading}/>
        </div>
      </motion.main>
    </div>
  );
}