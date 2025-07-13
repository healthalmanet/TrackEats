import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useAnimate, animate } from 'framer-motion';
import { GlassWater, Plus, Target, Lightbulb, RefreshCw, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// --- Simplified API Integration (Using only your specified APIs) ---
import {
  getTotalWaterForDate,
  getWaterHistory,
  postWater
} from "../../../api/WaterTracker.js";

// --- Theme & Configuration ---
const DAILY_GOAL = 2500;
const THEME = {
  primaryAccent: "#FF7043", darkOrangeHover: "#F4511E", softGreen: "#AED581", complementaryBlue: "#B3E5FC", softYellow: "#FFF9C4", charcoalGray: "#263238", slateGray: "#546E7A", warmWhite: "#FFFDF9", beigeTint: "#FAF3EB", paleGrayBorder: "#ECEFF1"
};
const hydrationTips = [
  "Add lemon or cucumber for a flavor boost.", "Drink a glass of water as soon as you wake up.", "Keep a reusable bottle on your desk.", "Eat water-rich foods like watermelon.", "Set hourly reminders to drink up."
];

// --- Helper Components ---

const AnimatedNumber = ({ value }) => {
  const [dv, setDv] = useState(0);
  useEffect(() => {
    const controls = animate(dv, value, { duration: 0.8, ease: "easeOut", onUpdate: (v) => setDv(v) });
    return () => controls.stop();
  }, [value]);
  return <>{Math.round(dv)}</>;
};

const Confetti = () => {
  const colors = [THEME.primaryAccent, THEME.complementaryBlue, THEME.softGreen];
  return (
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
};

const GoalCard = ({ progress, isLoading }) => (
  <motion.div variants={{ hidden:{opacity:0, y:20}, visible:{opacity:1,y:0}}} className="bg-white/60 backdrop-blur-sm p-5 rounded-2xl border flex items-center gap-4" style={{borderColor: THEME.paleGrayBorder}}>
    <div className="w-14 h-14 flex items-center justify-center rounded-full" style={{backgroundColor: THEME.softGreen}}><Target size={28} className='text-white'/></div>
    <div>
      <p className="text-lg font-bold" style={{color: THEME.charcoalGray}}>Goal Progress</p>
      <p className="text-3xl font-bold" style={{color: THEME.softGreen}}>{isLoading ? "..." : Math.round(progress)}<span className="text-lg font-medium">%</span></p>
    </div>
  </motion.div>
);

const HydrationTipCard = ({ tip }) => (
  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 }}} className="bg-white/60 backdrop-blur-sm p-5 rounded-2xl border flex items-center gap-4" style={{borderColor: THEME.paleGrayBorder}}>
    <div className="w-14 h-14 flex items-center justify-center rounded-full shrink-0" style={{backgroundColor: THEME.softYellow}}>
      <Lightbulb size={28} className='text-yellow-700'/>
    </div>
    <div>
      <p className="text-lg font-bold" style={{color: THEME.charcoalGray}}>Hydration Tip</p>
      <p className="text-sm" style={{color: THEME.slateGray}}>{tip}</p>
    </div>
  </motion.div>
);

const HistoryChart = ({ data, isLoading }) => (
  <div className="h-40">
    {isLoading ? (<div className="flex h-full w-full items-center justify-center"><RefreshCw className="animate-spin text-slate-400" /></div>)
     : data.length === 0 ? (<div className="flex flex-col h-full items-center justify-center text-center text-slate-400 p-4"><BarChart2 size={32} className="mb-2"/><p className="text-xs">No history yet.</p></div>)
     : (<ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: -10 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={THEME.paleGrayBorder} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: THEME.slateGray }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: THEME.slateGray }} axisLine={false} tickLine={false} />
          <Tooltip cursor={{ fill: `${THEME.primaryAccent}20` }} content={({ active, payload, label }) => active && payload && payload.length ? (<div className="bg-white p-2 text-xs shadow-lg rounded-md border" style={{ borderColor: THEME.primaryAccent }}><p className='text-slate-500'>{label}</p><p className="font-bold" style={{color: THEME.primaryAccent}}>{payload[0].value} ml</p></div>) : null } />
          <Bar dataKey="total" fill={THEME.primaryAccent} radius={[6, 6, 0, 0]} />
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

  const progress = Math.min((totalWaterIntake / DAILY_GOAL) * 100, 100);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [totalRes, historyRes] = await Promise.all([
        getTotalWaterForDate(today),
        getWaterHistory(),
      ]);

      setTotalWaterIntake(totalRes.total_water_ml || 0);

      if (Array.isArray(historyRes.results)) {
        const formatted = historyRes.results.slice(0, 7).map(item => ({ total: item.amount_ml || 0, date: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }) })).reverse();
        setHistoricalData(formatted);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [today]);

  useEffect(() => { const token = localStorage.getItem('token'); if (token) fetchData(); else setIsLoading(false); }, [fetchData]);

  const addWater = async (amount) => {
    if (!amount || amount <= 0) return;
    const oldTotal = totalWaterIntake;
    const newTotal = oldTotal + amount;
    const newProgress = Math.min((newTotal / DAILY_GOAL) * 100, 100);

    const pourId = Date.now();
    setActiveBubbles(prev => [...prev, { id: pourId, progress: newProgress }]);
    setTimeout(() => { setActiveBubbles(prev => prev.filter(b => b.id !== pourId)); }, 2000);

    animateScope([
      ["#water-level", { y: `${100 - newProgress}%` }, { type: "spring", stiffness: 80, damping: 20 }],
      ["#glass-container", { scale: [1, 1.05, 1] }, { duration: 0.5 }]
    ]);

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
    <div ref={scope} className="min-h-screen p-4 sm:p-6 lg:p-8 font-sans relative" style={{ backgroundColor: THEME.beigeTint }}>
      <AnimatePresence>{showCelebration && <Confetti />}</AnimatePresence>
      <motion.main
        initial="hidden" animate="visible"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
        className="max-w-7xl mx-auto grid lg:grid-cols-5 gap-8"
      >
        <motion.div variants={{ hidden: { opacity:0, y:20 }, visible: { opacity: 1, y: 0 }}} className="lg:col-span-3 flex flex-col items-center justify-center bg-white p-8 sm:p-12 rounded-3xl border" style={{ borderColor: THEME.paleGrayBorder }}>
          <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center" style={{ color: THEME.charcoalGray }}>Daily Hydration</h1>
          <div id="glass-container" className="relative w-48 h-80 mb-6">
            <svg viewBox="0 0 100 150" className="w-full h-full relative z-10" style={{ filter: 'drop-shadow(0 4px 10px rgba(118,134,151,0.05))' }}>
              <path d="M10 0 H90 L80 150 H20 Z" fill="#FFFFFF99" stroke={THEME.paleGrayBorder} strokeWidth="2" />
            </svg>
            <div className="absolute bottom-0 left-[10px] right-[10px] top-0 overflow-hidden z-20" style={{ clipPath: 'polygon(6.67% 0, 93.33% 0, 100% 100%, 0% 100%)' }}>
              <motion.div id="water-level" className="absolute inset-0 bg-gradient-to-t" style={{ y: '100%', from: THEME.complementaryBlue, to: `${THEME.primaryAccent}80` }} animate={{ y: `${100 - progress}%` }} transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.5 }}/>
              <AnimatePresence>
                {activeBubbles.map(bubble => (
                  <div key={bubble.id} className='absolute inset-0 z-10'>
                    {[...Array(15)].map((_, i) => (
                      <motion.div
                        key={i} className="absolute w-1.5 h-1.5 bg-white/70 rounded-full"
                        initial={{ bottom: -5, opacity: 0.7, x: `${Math.random()*80+10}%` }}
                        animate={{ bottom: `${bubble.progress}%`, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 + Math.random(), ease: 'easeOut' }}
                      />
                    ))}
                  </div>
                ))}
              </AnimatePresence>
            </div>
            <AnimatePresence>
              {floatingNumbers.map(({ id, amount }) => (
                <motion.div key={id} initial={{ y:0, opacity:1, scale:0.5 }} animate={{ y:-100, opacity:0, scale:1 }} exit={{ opacity:0 }} transition={{ duration:2, ease:"easeOut" }} className="absolute top-1/2 left-1/2 text-3xl font-bold z-30" style={{ x: "-50%", y: "-50%", color: THEME.darkOrangeHover }}>
                  +{amount}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="text-center mb-10">
            <p className="text-5xl sm:text-6xl font-bold tracking-tight" style={{ color: THEME.charcoalGray }}>
              {isLoading ? '...' : <AnimatedNumber value={totalWaterIntake} />}
              <span className="text-2xl font-normal ml-2" style={{ color: THEME.slateGray }}>ml</span>
            </p>
            <p className="font-semibold mt-2" style={{ color: progress >= 100 ? THEME.softGreen : THEME.slateGray }}>
              of {DAILY_GOAL} ml goal
            </p>
          </div>
          <div className="w-full max-w-sm">
            <p className="text-center text-sm font-semibold mb-3" style={{ color: THEME.slateGray }}>Log a drink</p>
            <div className="flex justify-center gap-2.5 sm:gap-4 mb-4">
              {[150, 250, 500].map(amount => (
                <motion.button key={amount} onClick={() => addWater(amount)} whileHover={{ scale:1.05, y:-3 }} whileTap={{ scale:0.95 }} className="bg-orange-50/50 text-orange-600 font-semibold py-2.5 px-6 rounded-full border-2 border-orange-200 transition-all hover:border-orange-400 hover:bg-orange-100/50 flex items-center gap-1.5">
                  <Plus size={16} />{amount}ml
                </motion.button>
              ))}
            </div>
            <div className="flex mt-4 gap-3">
              <input type="number" value={customAmount} onChange={(e) => setCustomAmount(Number(e.target.value))} placeholder="Custom" className="w-full bg-white border-2 rounded-full px-4 py-3 text-center text-slate-800 focus:outline-none focus:ring-2 transition-colors" style={{ borderColor:THEME.paleGrayBorder, '--tw-ring-color':THEME.primaryAccent }} />
              <motion.button onClick={() => addWater(customAmount)} whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }} className="text-white font-bold px-8 py-3 rounded-full shadow-lg transition-transform" style={{ backgroundColor:THEME.primaryAccent, boxShadow:`0 4px 14px 0 ${THEME.primaryAccent}55` }}>Add</motion.button>
            </div>
          </div>
        </motion.div>
        <div className="lg:col-span-2 flex flex-col gap-6">
          <GoalCard progress={progress} isLoading={isLoading}/>
          <HydrationTipCard tip={hydrationTip}/>
          <motion.div variants={{ hidden:{opacity:0, y:20}, visible:{opacity:1,y:0}}} className="bg-white/60 backdrop-blur-sm p-5 rounded-2xl border flex flex-col" style={{ borderColor: THEME.paleGrayBorder }}>
            <h3 className="text-lg font-bold flex items-center gap-2.5 mb-4 shrink-0" style={{ color: THEME.charcoalGray }}>
              <BarChart2 size={20}/> Weekly Summary
            </h3>
            <HistoryChart data={historicalData} isLoading={isLoading}/>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}