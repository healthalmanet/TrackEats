import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ChevronsUp,
  ChevronsDown,
  Scale,
  Calendar,
  Plus,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { getWeight, postWeight } from "../../../api/Weight";

// --- Helper: Reusable Card Component for consistent styling ---
const Card = ({ children, className }) => (
    <div 
        className={`bg-section p-5 rounded-2xl border border-custom shadow-soft ${className}`}
    >
        {children}
    </div>
);

// --- Helper: Custom Tooltip for the Chart (now themed) ---
const CustomTooltip = ({ active, payload, label, themeColors }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-section p-3 border rounded-lg shadow-lg" style={{ borderColor: themeColors.primary }}>
        <p className="text-body text-xs font-medium mb-1">{label}</p>
        <p className="font-bold" style={{ color: themeColors.primary }}>{payload[0].value.toFixed(1)} kg</p>
      </div>
    );
  }
  return null;
};

// --- Current Status Component (now themed) ---
const CurrentStatus = ({ entries }) => {
  if (!entries || entries.length === 0) {
    return (
      <Card className="text-center">
        <h3 className="text-md font-semibold text-heading mb-2">Welcome!</h3>
        <p className="text-sm text-body">Log your weight to begin.</p>
      </Card>
    );
  }

  const latestEntry = entries[0];
  const previousEntry = entries.length > 1 ? entries[1] : null;
  const change = previousEntry ? parseFloat(latestEntry.weight_kg) - parseFloat(previousEntry.weight_kg) : 0;
  const isIncrease = change > 0;

  return (
    <Card>
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-sm text-body">Current Weight</p>
          <p className="text-3xl font-bold text-primary">{parseFloat(latestEntry.weight_kg).toFixed(1)}<span className="text-xl text-body"> kg</span></p>
        </div>
        {change !== 0 && (
          <div className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-full ${isIncrease ? 'bg-red/10 text-red' : 'bg-primary/10 text-primary'}`}>
            {isIncrease ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
            <span>{Math.abs(change).toFixed(1)}</span>
          </div>
        )}
      </div>
      <p className="text-xs text-body">
        Logged on {new Date(latestEntry.date).toLocaleDateString("en-GB", { day: 'numeric', month: 'long' })}
      </p>
    </Card>
  );
};

// --- Weight Insights Component (now themed) ---
const WeightInsights = ({ entries }) => {
  const { highest, lowest, trend } = useMemo(() => {
    if (entries.length < 2) return { highest: null, lowest: null, trend: null };
    const weights = entries.map((e) => parseFloat(e.weight_kg));
    return { highest: Math.max(...weights), lowest: Math.min(...weights), trend: weights[0] - weights[weights.length - 1] };
  }, [entries]);

  if (entries.length < 2) return null;

  return (
    <Card>
      <h3 className="text-md font-semibold text-heading mb-4">Overall Insights</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-3"><ChevronsUp className="text-red" size={18} /><span className="text-body">Highest</span></div>
          <span className="font-semibold text-heading">{highest?.toFixed(1)} kg</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-3"><ChevronsDown className="text-primary" size={18} /><span className="text-body">Lowest</span></div>
          <span className="font-semibold text-heading">{lowest?.toFixed(1)} kg</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">{trend > 0 ? <TrendingUp className="text-red" size={18}/> : <TrendingDown className="text-primary" size={18}/>}<span className="text-body">Trend</span></div>
          <span className={`font-semibold ${trend > 0 ? 'text-red' : 'text-primary'}`}>{trend > 0 ? '+' : ''}{trend?.toFixed(1)} kg</span>
        </div>
      </div>
    </Card>
  );
};

// --- Main Component ---
const WeightTracker = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickLogWeight, setQuickLogWeight] = useState("");
  const [quickLogDate, setQuickLogDate] = useState(new Date().toISOString().split("T")[0]);
  
  // ✅ DYNAMICALLY LOAD THEME COLORS FOR RECHARTS
  const [chartColors, setChartColors] = useState({
    primary: '#4CAF50', // Fallback
    border: '#DDDDDD',  // Fallback
    textBody: '#555555', // Fallback
  });

  useEffect(() => {
    const styles = getComputedStyle(document.documentElement);
    setChartColors({
      primary: styles.getPropertyValue('--color-primary-accent').trim(),
      border: styles.getPropertyValue('--color-border').trim(),
      textBody: styles.getPropertyValue('--color-text-body').trim(),
    });
  }, []); // Run once on mount to get colors

  const fetchWeight = async () => {
    setLoading(true);
    try {
      const data = await getWeight();
      const sortedData = Array.isArray(data.results) ? [...data.results].sort((a, b) => new Date(b.date) - new Date(a.date)) : [];
      setEntries(sortedData);
    } catch (error) { console.error("Error fetching weight data:", error); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchWeight(); }, []);

  const handleSaveEntry = async () => {
    const newWeight = parseFloat(quickLogWeight);
    if (!quickLogWeight || !quickLogDate || isNaN(newWeight) || newWeight <= 0) return;
    try {
      await postWeight({ date: quickLogDate, weight_kg: newWeight });
      setQuickLogWeight("");
      fetchWeight();
    } catch (error) { console.error("Failed to post weight:", error); }
  };

  const chartData = useMemo(() => [...entries]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((entry) => ({
      date: new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      weight: parseFloat(entry.weight_kg),
    })), [entries]);

  return (
    <div className="min-h-screen bg-main font-['Poppins'] text-body">
      <div className="max-w-6xl mx-auto p-4 lg:p-6">
        <header className="mb-8">
            <h1 className="text-4xl font-['Lora'] font-extrabold text-heading">Weight Tracker</h1>
        </header>

        <div className="flex flex-col lg:flex-row gap-6">
          <motion.aside initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="w-full lg:w-80 flex-shrink-0">
            <div className="space-y-5">
              <CurrentStatus entries={entries} />
              <Card>
                <h3 className="text-md font-semibold text-heading mb-4">Log New Weight</h3>
                <div className="space-y-4">
                  <div className="relative">
                    <Scale className="absolute left-3 top-1/2 -translate-y-1/2 text-body/60" size={16}/>
                    <input type="number" value={quickLogWeight} onChange={(e) => setQuickLogWeight(e.target.value)} 
                      className="w-full bg-main text-heading border border-custom rounded-lg pl-9 pr-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none" 
                      placeholder="Weight (kg)"/>
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-body/60" size={16}/>
                    <input type="date" value={quickLogDate} onChange={(e) => setQuickLogDate(e.target.value)} 
                      className="w-full bg-main text-heading border border-custom rounded-lg pl-9 pr-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"/>
                  </div>
                  <motion.button onClick={handleSaveEntry} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }} 
                    className="w-full flex items-center justify-center gap-2 bg-primary text-light py-2.5 rounded-lg font-semibold shadow-soft hover:shadow-lg hover:bg-primary-hover transition-all">
                    <Plus size={18} />Add Entry
                  </motion.button>
                </div>
              </Card>
              <WeightInsights entries={entries} />
            </div>
          </motion.aside>

          <main className="flex-1 space-y-5">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <Card>
                <h3 className="text-md font-semibold text-heading mb-4">Progress Chart</h3>
                <div className="h-72">
                  {loading ? ( <div className="flex items-center justify-center h-full text-body">Loading Chart...</div> ) 
                  : chartData.length > 1 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <defs>
                          {/* ✅ Dynamic Gradient Colors */}
                          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.4} />
                            <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        {/* ✅ Dynamic Chart Colors */}
                        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.border} vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: chartColors.textBody }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: chartColors.textBody }} axisLine={false} tickLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
                        <Tooltip content={<CustomTooltip themeColors={chartColors} />} cursor={{ stroke: chartColors.primary, strokeWidth: 1, strokeDasharray: '3 3' }}/>
                        <Area type="monotone" dataKey="weight" stroke={chartColors.primary} fill="url(#chartGradient)" strokeWidth={2.5} activeDot={{ r: 6, fill: '#fff', stroke: chartColors.primary, strokeWidth: 2 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : ( <div className="flex flex-col items-center justify-center h-full text-body gap-2"><Scale className="w-8 h-8"/>Log another entry to see your chart.</div> )}
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
              <Card>
                <h3 className="text-md font-semibold text-heading mb-4">History</h3>
                <div className="relative">
                  <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-primary/10 rounded"></div>
                  <ul className="space-y-1">
                    <AnimatePresence>
                      {entries.map((entry, index) => {
                        const prevEntry = entries[index + 1];
                        const change = prevEntry ? parseFloat(entry.weight_kg) - parseFloat(prevEntry.weight_kg) : 0;
                        const isIncrease = change > 0;
                        const key = entry.id || entry.date;
                        return (
                          <motion.li key={key} layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -10 }} transition={{duration: 0.3}} className="relative flex items-center gap-4 py-2.5 pl-8">
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 -ml-1 w-2 h-2 bg-section border-2 border-primary rounded-full z-10"></div>
                            <div className="flex-1 flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-heading">{parseFloat(entry.weight_kg).toFixed(1)} kg</p>
                                <p className="text-xs text-body">{new Date(entry.date).toLocaleDateString("en-GB", { day: '2-digit', month: 'short' })}</p>
                              </div>
                              {prevEntry && (
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${isIncrease ? 'bg-red/10 text-red' : 'bg-primary/10 text-primary'}`}>
                                  {isIncrease ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}{Math.abs(change).toFixed(1)}</span>
                              )}
                            </div>
                          </motion.li>
                        );
                      })}
                    </AnimatePresence>
                  </ul>
                </div>
              </Card>
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default WeightTracker;