import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useAnimate, animate } from 'framer-motion';
import { GlassWater, Plus, Target, Lightbulb, RefreshCw, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getTotalWaterForDate, getWaterHistory, postWater } from "../../../api/WaterTracker.js";

// --- Theme-aligned Configuration ---
const DAILY_GOAL = 2500;
const hydrationTips = [
  "Add lemon or cucumber for a flavor boost.", "Drink a glass of water as soon as you wake up.", "Keep a reusable bottle on your desk.", "Eat water-rich foods like watermelon.", "Set hourly reminders to drink up."
];

// --- Helper Components (Now Themed) ---

const AnimatedNumber = ({ value }) => {
  const [dv, setDv] = useState(0);
  useEffect(() => {
    const controls = animate(dv, value, { duration: 0.8, ease: "easeOut", onUpdate: (v) => setDv(v) });
    return () => controls.stop();
  }, [value]);
  return <>{Math.round(dv)}</>;
};

const Confetti = ({ colors }) => (
  <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
    {Array.from({ length: 50 }).map((_, i) => (
      <motion.div
        key={i}
        initial={{ x: `${Math.random() * 100}vw`, y: -20, opacity: 1, rotate: Math.random() * 360 }}
        animate={{ y: '110vh' }}
        transition={{ duration: 2 + Math.random() * 3, ease: "linear", delay: Math.random() * 0.5 }}
        style={{ position: 'absolute', width: i % 2 === 0 ? 8 : 12, height: i % 2 === 0 ? 8 : 12, backgroundColor: colors[i % colors.length], borderRadius: i % 2 === 0 ? '2px' : '50%'}}
      />
    ))}
  </div>
);

const GoalCard = ({ progress, isLoading }) => (
  <motion.div variants={{ hidden:{opacity:0, y:20}, visible:{opacity:1,y:0}}} className="bg-section p-5 rounded-2xl border border-custom shadow-soft flex items-center gap-4">
    <div className="w-14 h-14 flex items-center justify-center rounded-full bg-primary/10"><Target size={28} className='text-primary'/></div>
    <div>
      <p className="text-lg font-['Lora'] font-bold text-heading">Goal Progress</p>
      <p className="text-3xl font-bold text-primary">{isLoading ? "..." : Math.round(progress)}<span className="text-lg font-medium">%</span></p>
    </div>
  </motion.div>
);

const HydrationTipCard = ({ tip }) => (
  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 }}} className="bg-section p-5 rounded-2xl border border-custom shadow-soft flex items-center gap-4">
    <div className="w-14 h-14 flex items-center justify-center rounded-full shrink-0 bg-accent-yellow/10">
      <Lightbulb size={28} className='text-accent-yellow'/>
    </div>
    <div>
      <p className="text-lg font-['Lora'] font-bold text-heading">Hydration Tip</p>
      <p className="text-sm text-body">{tip}</p>
    </div>
  </motion.div>
);

const HistoryChart = ({ data, isLoading, colors }) => (
  <div className="h-40">
    {isLoading ? (<div className="flex h-full w-full items-center justify-center"><RefreshCw className="animate-spin text-body/50" /></div>)
     : data.length === 0 ? (<div className="flex flex-col h-full items-center justify-center text-center text-body/50 p-4"><BarChart2 size={32} className="mb-2"/><p className="text-xs">No history yet.</p></div>)
     : (<ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: -10 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.border} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: colors.textBody }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: colors.textBody }} axisLine={false} tickLine={false} />
          <Tooltip cursor={{ fill: `${colors.primary}20` }} content={({ active, payload, label }) => active && payload && payload.length ? (<div className="bg-section p-2 text-xs shadow-lg rounded-md border" style={{ borderColor: colors.primary }}><p className='text-body'>{label}</p><p className="font-bold" style={{color: colors.primary}}>{payload[0].value} ml</p></div>) : null } />
          <Bar dataKey="total" fill={colors.primary} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>)
    }
  </div>
);

// --- Main Component ---
export default function WaterTracker() {
  const [totalWaterIntake, setTotalWaterIntake] = useState(0);
  const [historicalData, setHistoricalData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [customAmount, setCustomAmount] = useState(250);
  const [showCelebration, setShowCelebration] = useState(false);
  const [floatingNumbers, setFloatingNumbers] = useState([]);
  const [activeBubbles, setActiveBubbles] = useState([]);
  const [hydrationTip] = useState(() => hydrationTips[Math.floor(Math.random() * hydrationTips.length)]);
  const [scope, animateScope] = useAnimate();
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  
  const [themeColors, setThemeColors] = useState({
    primary: '#4CAF50', accentOrange: '#FF9800', accentYellow: '#FFC107', textBody: '#555555', border: '#DDDDDD'
  });

  useEffect(() => {
    const styles = getComputedStyle(document.documentElement);
    setThemeColors({
      primary: styles.getPropertyValue('--color-primary-accent').trim(),
      accentOrange: styles.getPropertyValue('--color-accent-orange').trim(),
      accentYellow: styles.getPropertyValue('--color-accent-yellow').trim(),
      textBody: styles.getPropertyValue('--color-text-body').trim(),
      border: styles.getPropertyValue('--color-border').trim(),
    });
  }, []);

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
    const pourId = Date.now();
    setActiveBubbles(prev => [...prev, { id: pourId, progress: newProgress }]);
    setTimeout(() => { setActiveBubbles(prev => prev.filter(b => b.id !== pourId)); }, 2000);
    animateScope([ ["#water-level", { y: `${100 - newProgress}%` }, { type: "spring", stiffness: 80, damping: 20 }], ["#glass-container", { scale: [1, 1.05, 1] }, { duration: 0.5 }] ]);
    const floatId = Date.now() + 1;
    setFloatingNumbers(prev => [...prev, { id: floatId, amount }]);
    setTimeout(() => { setFloatingNumbers(prev => prev.filter(f => f.id !== floatId)); }, 2000);
    if (newTotal >= DAILY_GOAL && oldTotal < DAILY_GOAL) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 5000);
    }
    try { await postWater({ amount_ml: amount }); fetchData(); } catch (err) { console.error("Post error:", err); }
  };

  return (
    <div ref={scope} className="min-h-screen bg-main p-4 sm:p-6 lg:p-8 font-['Poppins'] relative">
      <AnimatePresence>{showCelebration && <Confetti colors={[themeColors.primary, themeColors.accentYellow, themeColors.accentOrange]} />}</AnimatePresence>
      <motion.main initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className="max-w-7xl mx-auto grid lg:grid-cols-5 gap-8">
        <motion.div variants={{ hidden: { opacity:0, y:20 }, visible: { opacity: 1, y: 0 }}} className="lg:col-span-3 flex flex-col items-center justify-center bg-section p-8 sm:p-12 rounded-3xl border border-custom shadow-soft">
          <h1 className="text-3xl sm:text-4xl font-['Lora'] font-bold mb-8 text-center text-heading">Daily Hydration</h1>
          <div id="glass-container" className="relative w-48 h-80 mb-6">
            <svg viewBox="0 0 100 150" className="w-full h-full relative z-10" style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.05))' }}>
              <path d="M10 0 H90 L80 150 H20 Z" fill="var(--color-section)" stroke="var(--color-border)" strokeWidth="2" />
            </svg>
            <div className="absolute bottom-0 left-[10px] right-[10px] top-0 overflow-hidden z-20" style={{ clipPath: 'polygon(6.67% 0, 93.33% 0, 100% 100%, 0% 100%)' }}>
              <motion.div id="water-level" className="absolute inset-0 bg-primary" style={{ y: '100%' }} animate={{ y: `${100 - progress}%` }} transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.5 }}/>
              <AnimatePresence>
                {activeBubbles.map(bubble => (<div key={bubble.id} className='absolute inset-0 z-10'>{[...Array(15)].map((_, i) => (<motion.div key={i} className="absolute w-1.5 h-1.5 bg-light/70 rounded-full" initial={{ bottom: -5, opacity: 0.7, x: `${Math.random()*80+10}%` }} animate={{ bottom: `${bubble.progress}%`, opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 1 + Math.random(), ease: 'easeOut' }}/>))}</div>))}
              </AnimatePresence>
            </div>
            <AnimatePresence>
              {floatingNumbers.map(({ id, amount }) => (<motion.div key={id} initial={{ y:0, opacity:1, scale:0.5 }} animate={{ y:-100, opacity:0, scale:1 }} exit={{ opacity:0 }} transition={{ duration:2, ease:"easeOut" }} className="absolute top-1/2 left-1/2 text-3xl font-bold z-30 text-primary-hover"><Plus size={18} className='inline-block -mt-1'/>{amount}</motion.div>))}
            </AnimatePresence>
          </div>
          <div className="text-center mb-10">
            <p className="text-5xl sm:text-6xl font-bold tracking-tight text-heading">{isLoading ? '...' : <AnimatedNumber value={totalWaterIntake} />}<span className="text-2xl font-normal ml-2 text-body">ml</span></p>
            <p className={`font-semibold mt-2 ${progress >= 100 ? 'text-primary' : 'text-body'}`}>of {DAILY_GOAL} ml goal</p>
          </div>
          <div className="w-full max-w-sm">
            <p className="text-center text-sm font-semibold mb-3 text-body">Log a drink</p>
            <div className="flex justify-center gap-2.5 sm:gap-4 mb-4">
              {[150, 250, 500].map(amount => (
                <motion.button key={amount} onClick={() => addWater(amount)} whileHover={{ scale:1.05, y:-3 }} whileTap={{ scale:0.95 }} className="bg-primary/10 text-primary font-semibold py-2.5 px-6 rounded-full border-2 border-primary/20 transition-all hover:border-primary hover:bg-primary/20 flex items-center gap-1.5">
                  <Plus size={16} />{amount}ml
                </motion.button>
              ))}
            </div>
            <div className="flex mt-4 gap-3">
              <input type="number" value={customAmount} onChange={(e) => setCustomAmount(Number(e.target.value))} placeholder="Custom" className="w-full bg-section border-2 border-custom rounded-full px-4 py-3 text-center text-heading focus:outline-none focus:ring-2 focus:ring-primary transition-colors" />
              <motion.button onClick={() => addWater(customAmount)} whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }} className="text-light font-bold px-8 py-3 rounded-full shadow-soft transition-transform bg-primary hover:bg-primary-hover">Add</motion.button>
            </div>
          </div>
        </motion.div>
        <div className="lg:col-span-2 flex flex-col gap-6">
          <GoalCard progress={progress} isLoading={isLoading}/>
          <HydrationTipCard tip={hydrationTip}/>
          <motion.div variants={{ hidden:{opacity:0, y:20}, visible:{opacity:1,y:0}}} className="bg-section p-5 rounded-2xl border border-custom shadow-soft flex flex-col">
            <h3 className="text-lg font-['Lora'] font-bold flex items-center gap-2.5 mb-4 shrink-0 text-heading"><BarChart2 size={20}/> Weekly Summary</h3>
            <HistoryChart data={historicalData} isLoading={isLoading} colors={themeColors}/>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}