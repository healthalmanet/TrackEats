// src/pages/reports/Reports.jsx

import React, { useState, useEffect } from 'react';
// --- RECHARTS IMPORTS ---
import {
  PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, Legend, ReferenceLine
} from "recharts";
import { FaAppleAlt, FaCoffee, FaHamburger, FaFireAlt, FaDrumstickBite, FaBreadSlice, FaTint } from "react-icons/fa";
import { Loader } from 'lucide-react';


// --- API imports ---
import { targetApi, targetProgressApi, weeklyTrack } from '../api/reportsApi';
import { getMealsByDate } from "../api/mealLog";

// --- THEME VALUES FOR CHARTS ---
// Recharts needs direct hex values. These are taken from your index.css file.
const THEME_VALUES = {
  primary: '#FF7043',
  primaryHover: '#F4511E',
  accent1: '#b45309',    // Amber
  accent2: '#4338ca',    // Indigo
  textStrong: '#263238',
  textDefault: '#546E7A',
  borderDefault: '#ECEFF1',
  dangerText: '#be123c'
};

// Colors for the Pie Chart slices, using a vibrant and distinct palette from the theme
const PIE_CHART_COLORS = [THEME_VALUES.primary, THEME_VALUES.accent1, THEME_VALUES.accent2];

// Classes for the Nutrient Cards, using the dedicated stat backgrounds from index.css
const NUTRIENT_CARD_CLASSES = [
  'bg-[var(--color-stat-1-bg)]', // Calories (Yellow)
  'bg-[var(--color-stat-2-bg)]', // Protein (Green)
  'bg-[var(--color-stat-3-bg)]', // Carbs (Blue)
  'bg-[var(--color-stat-4-bg)]'  // Fats (Red/Orange)
];

// Classes for Meal Log Icons to provide visual variety and style
const MEAL_LOG_ICON_CLASSES = [
    { bg: 'bg-[var(--color-accent-1-bg-subtle)]', text: 'text-[var(--color-accent-1-text)]' },
    { bg: 'bg-[var(--color-accent-2-bg-subtle)]', text: 'text-[var(--color-accent-2-text)]' },
    { bg: 'bg-[var(--color-accent-3-bg-subtle)]', text: 'text-[var(--color-accent-3-text)]' },
    { bg: 'bg-[var(--color-info-bg-subtle)]', text: 'text-[var(--color-info-text)]' },
];

const Reports = () => {
  const [macroData, setMacroData] = useState([]);
  const [calorieProgress, setCalorieProgress] = useState([]);
  const [nutrientProgress, setNutrientProgress] = useState([]);
  const [goalCalories, setGoalCalories] = useState(0);
  const [mealData, setMealData] = useState([]);
  const [todayDate, setTodayDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ... (Your data fetching logic remains the same)
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) { throw new Error("Authentication token not found. Please log in."); }
        const apiDate = new Date().toISOString().split('T')[0];
        const [recommendedResponse, progressResponse, weeklyDataResponse, mealLogResponse] = await Promise.all([
          targetApi(), targetProgressApi(), weeklyTrack(), getMealsByDate(token, apiDate)
        ]);
        setGoalCalories(recommendedResponse.recommended_calories || 0);
        const date = new Date(progressResponse.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        setTodayDate(date);
        setMacroData([{ name: "Protein", value: progressResponse.protein || 0 }, { name: "Carbs", value: progressResponse.carbs || 0 }, { name: "Fats", value: progressResponse.fats || 0 }]);
        setCalorieProgress(weeklyDataResponse.map(day => ({ name: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric'}), calories: day.calories })));
        setNutrientProgress([
          { title: "Calories", current: progressResponse.calories, goal: recommendedResponse.recommended_calories, value: `${Math.round(progressResponse.calories)} kcal`, goalFormatted: `${Math.round(recommendedResponse.recommended_calories)} kcal`, percentage: Math.round((progressResponse.calories / recommendedResponse.recommended_calories) * 100) || 0, icon: <FaFireAlt className="text-xl text-[var(--color-primary)]" /> },
          { title: "Protein", current: progressResponse.protein, goal: recommendedResponse.macronutrients.protein_g, value: `${progressResponse.protein.toFixed(1)}g`, goalFormatted: `${recommendedResponse.macronutrients.protein_g}g`, percentage: Math.round((progressResponse.protein / recommendedResponse.macronutrients.protein_g) * 100) || 0, icon: <FaDrumstickBite className="text-xl text-[var(--color-primary)]" /> },
          { title: "Carbs", current: progressResponse.carbs, goal: recommendedResponse.macronutrients.carbs_g, value: `${progressResponse.carbs.toFixed(1)}g`, goalFormatted: `${recommendedResponse.macronutrients.carbs_g}g`, percentage: Math.round((progressResponse.carbs / recommendedResponse.macronutrients.carbs_g) * 100) || 0, icon: <FaBreadSlice className="text-xl text-[var(--color-primary)]" /> },
          { title: "Fats", current: progressResponse.fats, goal: recommendedResponse.macronutrients.fats_g, value: `${progressResponse.fats.toFixed(1)}g`, goalFormatted: `${recommendedResponse.macronutrients.fats_g}g`, percentage: Math.round((progressResponse.fats / recommendedResponse.macronutrients.fats_g) * 100) || 0, icon: <FaTint className="text-xl text-[var(--color-primary)]" /> }
        ]);
        if (mealLogResponse && mealLogResponse.results) {
            setMealData(mealLogResponse.results
              .sort((a, b) => new Date(b.consumed_at) - new Date(a.consumed_at))
              .slice(0, 4)
              .map(meal => ({ title: meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1), meal: meal.food_name, calories: `${Math.round(meal.calories)} kcal`, time: new Date(meal.consumed_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) }))
            );
        }
      } catch (err) { console.error("Failed to load reports:", err); setError(err.message || "Failed to load report data. Please try again later.");
      } finally { setIsLoading(false); }
    };
    fetchData();
  }, []);

  const barChartData = nutrientProgress.filter(item => item.title !== "Calories").map((item) => ({ name: item.title, "Current (g)": item.current, "Goal (g)": item.goal }));
  const getIcon = (title) => ({ "breakfast": <FaCoffee />, "snack": <FaAppleAlt />, "lunch": <FaHamburger />, "dinner": <FaDrumstickBite /> }[title.toLowerCase()] || <FaAppleAlt />);
  
  
  if (isLoading) { return <div className="flex flex-col justify-center items-center h-screen bg-[var(--color-bg-app)]"><Loader className="w-16 h-16 animate-spin text-[var(--color-primary)]" /></div>; }
  if (error) { return <div className="flex justify-center items-center h-screen bg-[var(--color-bg-app)]"><p className="text-xl text-[var(--color-danger-text)] font-[var(--font-primary)]">{error}</p></div>; }

  return (
    <div className="bg-[var(--color-bg-app)] min-h-screen">
      <main className="text-[var(--color-text-default)] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto font-[var(--font-secondary)]">
        
        <header className="mb-8 opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
          <h1 className="text-4xl font-bold text-[var(--color-text-strong)] font-[var(--font-primary)]">Daily Progress</h1>
          <p className="mt-2 text-lg"><span className="font-semibold text-[var(--color-primary)]">Today: {todayDate}</span> • Your Goal: {goalCalories} kcal</p>
        </header>

        {/* Section 1: Nutrient Progress Cards with Staggered Animation and Enhanced Hover */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {nutrientProgress.map((item, idx) => (
            <div 
              key={idx} 
              className={`group p-5 rounded-2xl border-2 border-transparent shadow-md transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-2 hover:border-[var(--color-primary)] opacity-0 animate-fade-up ${NUTRIENT_CARD_CLASSES[idx]}`}
              style={{ animationDelay: `${100 + idx * 100}ms`, animationFillMode: 'forwards' }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[var(--color-text-strong)] font-[var(--font-primary)] font-semibold text-lg">{item.title}</h3>
                <span className="bg-white/60 p-2 rounded-full shadow-sm transition-transform duration-300 group-hover:scale-110">{item.icon}</span>
              </div>
              <div className="text-3xl font-bold text-[var(--color-text-strong)]">{item.value}</div>
              <div className="text-[var(--color-text-default)] text-sm">of {item.goalFormatted}</div>
              
              <div className="w-full h-2.5 mt-4 bg-black/10 rounded-full overflow-hidden">
                <div className="h-full bg-[var(--color-primary)] transition-all duration-500" style={{ width: `${item.percentage > 100 ? 100 : item.percentage}%` }}></div>
              </div>
              <div className="text-xs text-right text-[var(--color-primary)] font-semibold mt-1">{item.percentage}% Complete</div>
            </div>
          ))}
        </section>

        {/* Section 2: Charts with Animation and Enhanced Hover */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-10">
          <div className="lg:col-span-2 bg-[var(--color-bg-surface)] p-6 rounded-2xl border border-[var(--color-border-default)] shadow-md transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 hover:border-[var(--color-primary)] opacity-0 animate-fade-up" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
            <h2 className="text-[var(--color-text-strong)] font-[var(--font-primary)] font-semibold text-xl text-center mb-4">Macronutrient Breakdown</h2>
            <ResponsiveContainer width="100%" height={250}>
                {/* Chart content remains the same */}
                <PieChart>
                    <Pie data={macroData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => { const radius = innerRadius + (outerRadius - innerRadius) * 1.2; const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180)); const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180)); return (<text x={x} y={y} fill={THEME_VALUES.textDefault} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">{`${(percent * 100).toFixed(0)}%`}</text>); }}>
                        {macroData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value) => `${value.toFixed(1)}g`} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="lg:col-span-3 bg-[var(--color-bg-surface)] p-6 rounded-2xl border border-[var(--color-border-default)] shadow-md transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 hover:border-[var(--color-primary)] opacity-0 animate-fade-up" style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}>
            <h2 className="text-[var(--color-text-strong)] font-[var(--font-primary)] font-semibold text-xl text-center mb-4">Weekly Calorie Progress</h2>
            <ResponsiveContainer width="100%" height={250}>
                {/* Chart content remains the same */}
                <LineChart data={calorieProgress} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={THEME_VALUES.borderDefault} />
                    <XAxis dataKey="name" stroke={THEME_VALUES.textDefault} />
                    <YAxis stroke={THEME_VALUES.textDefault} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="calories" stroke={THEME_VALUES.primary} strokeWidth={3} name="Calories Consumed" dot={{ r: 5 }} activeDot={{ r: 8, stroke: THEME_VALUES.primary, strokeWidth: 2, fill: 'white' }} />
                    <ReferenceLine y={goalCalories} label={{ value: `Goal`, position: 'insideTopLeft', fill: THEME_VALUES.dangerText }} stroke={THEME_VALUES.dangerText} strokeDasharray="4 4" />
                </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Section 3: Bar Chart and Meal Log with Animation and Enhanced Hover */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 bg-[var(--color-bg-surface)] p-6 rounded-2xl border border-[var(--color-border-default)] shadow-md transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 hover:border-[var(--color-primary)] opacity-0 animate-fade-up" style={{ animationDelay: '700ms', animationFillMode: 'forwards' }}>
              <h2 className="text-[var(--color-text-strong)] font-[var(--font-primary)] font-semibold text-xl text-center mb-4">Macronutrient Intake – Current vs Goal</h2>
              <ResponsiveContainer width="100%" height={300}>
                {/* Chart content remains the same */}
                <BarChart data={barChartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={THEME_VALUES.borderDefault} />
                    <XAxis dataKey="name" stroke={THEME_VALUES.textDefault} />
                    <YAxis stroke={THEME_VALUES.textDefault} />
                    <Tooltip formatter={(value) => `${value.toFixed(1)}g`} />
                    <Legend />
                    <Bar dataKey="Current (g)" fill={THEME_VALUES.primary} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Goal (g)" fill={THEME_VALUES.primaryHover} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="lg:col-span-2 flex flex-col gap-4 opacity-0 animate-fade-up" style={{ animationDelay: '800ms', animationFillMode: 'forwards' }}>
              <h2 className="text-[var(--color-text-strong)] font-[var(--font-primary)] font-semibold text-xl">Today's Meal Log</h2>
              {mealData.length > 0 ? mealData.map((meal, index) => {
                const iconTheme = MEAL_LOG_ICON_CLASSES[index % MEAL_LOG_ICON_CLASSES.length];
                return (
                  <div key={index} className="group flex items-center justify-between p-4 rounded-2xl border-2 border-[var(--color-border-default)] shadow-md bg-[var(--color-bg-surface)] transition-all duration-300 ease-in-out hover:shadow-xl hover:border-[var(--color-primary)] hover:-translate-y-1">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full text-xl transition-transform duration-300 group-hover:scale-110 ${iconTheme.bg} ${iconTheme.text}`}>
                        {getIcon(meal.title)}
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--color-text-strong)]">{meal.title}</p>
                        <p className="text-sm text-[var(--color-text-default)] truncate max-w-[120px] sm:max-w-[150px]">{meal.meal}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-[var(--color-primary)] font-bold">{meal.calories}</p>
                      <p className="text-sm text-[var(--color-text-muted)]">{meal.time}</p>
                    </div>
                  </div>
                )
              }) : (
                <div className="text-[var(--color-text-default)] p-6 bg-[var(--color-bg-surface)] rounded-2xl border-2 border-dashed border-[var(--color-border-default)] shadow-sm text-center">
                  No meals logged for today.
                </div>
              )}
            </div>
        </section>
      </main>
    </div>
  );
};

export default Reports;