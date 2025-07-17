import React, { useState, useEffect } from 'react';
// --- RECHARTS IMPORTS ---
import {
  PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, Legend, ReferenceLine
} from "recharts";
import { FaAppleAlt, FaCoffee, FaHamburger, FaFireAlt, FaDrumstickBite, FaBreadSlice, FaTint } from "react-icons/fa";

// --- API imports ---
import { targetApi, targetProgressApi, weeklyTrack } from '../api/reportsApi';
import { getMealsByDate } from "../api/mealLog";

// --- THEME-ALIGNED COLORS FOR CHARTS & DYNAMIC ELEMENTS ---
// Recharts doesn't read CSS variables, so we define them here.
const THEME_COLORS = {
  primary: '#4CAF50',     // --color-primary-accent
  primaryHover: '#5cb85c',// --color-primary-hover
  accentOrange: '#FF9800',// --color-accent-orange
  accentYellow: '#FFC107',// --color-accent-yellow
  accentCoral: '#FF7043', // --color-accent-coral
  textHeading: '#2E4034',  // --color-text-heading
  textBody: '#555555',     // --color-text-body
  border: '#DDDDDD',       // --color-border
  bgLight: '#E9E9E9',      // --color-bg-light
  alertRed: '#E53935'      // --color-accent-red
};

// Colors for the Pie Chart slices, using our theme accents
const CHART_COLORS = [THEME_COLORS.primary, THEME_COLORS.accentOrange, THEME_COLORS.accentYellow];

// Colors for the Nutrient Cards, using theme accents with opacity
const cardColors = ['bg-primary/10', 'bg-accent-orange/10', 'bg-accent-yellow/10', 'bg-accent-coral/10'];

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
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error("Authentication token not found. Please log in.");
        }
        const apiDate = new Date().toISOString().split('T')[0];

        const [
          recommendedResponse,
          progressResponse,
          weeklyDataResponse,
          mealLogResponse
        ] = await Promise.all([
          targetApi(),
          targetProgressApi(),  
          weeklyTrack(),
          getMealsByDate(token, apiDate)
        ]);
        
        setGoalCalories(recommendedResponse.recommended_calories || 0);
        const date = new Date(progressResponse.date).toLocaleDateString('en-US', {
          month: 'long', day: 'numeric', year: 'numeric'
        });
        setTodayDate(date);
        
        const macro = [
          { name: "Protein", value: progressResponse.protein || 0 },
          { name: "Carbs", value: progressResponse.carbs || 0 },
          { name: "Fats", value: progressResponse.fats || 0 },
        ];
        setMacroData(macro);

        const formattedWeeklyData = weeklyDataResponse.map(day => ({
            name: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric'}),
            calories: day.calories,
        }));
        setCalorieProgress(formattedWeeklyData);

        // Icons are now theme-aligned with the primary accent color
        const nutrients = [
          { title: "Calories", current: progressResponse.calories, goal: recommendedResponse.recommended_calories, value: `${Math.round(progressResponse.calories)} kcal`, goalFormatted: `${Math.round(recommendedResponse.recommended_calories)} kcal`, percentage: Math.round((progressResponse.calories / recommendedResponse.recommended_calories) * 100) || 0, icon: <FaFireAlt className="text-xl text-primary" /> },
          { title: "Protein", current: progressResponse.protein, goal: recommendedResponse.macronutrients.protein_g, value: `${progressResponse.protein.toFixed(1)}g`, goalFormatted: `${recommendedResponse.macronutrients.protein_g}g`, percentage: Math.round((progressResponse.protein / recommendedResponse.macronutrients.protein_g) * 100) || 0, icon: <FaDrumstickBite className="text-xl text-primary" /> },
          { title: "Carbs", current: progressResponse.carbs, goal: recommendedResponse.macronutrients.carbs_g, value: `${progressResponse.carbs.toFixed(1)}g`, goalFormatted: `${recommendedResponse.macronutrients.carbs_g}g`, percentage: Math.round((progressResponse.carbs / recommendedResponse.macronutrients.carbs_g) * 100) || 0, icon: <FaBreadSlice className="text-xl text-primary" /> },
          { title: "Fats", current: progressResponse.fats, goal: recommendedResponse.macronutrients.fats_g, value: `${progressResponse.fats.toFixed(1)}g`, goalFormatted: `${recommendedResponse.macronutrients.fats_g}g`, percentage: Math.round((progressResponse.fats / recommendedResponse.macronutrients.fats_g) * 100) || 0, icon: <FaTint className="text-xl text-primary" /> }
        ];
        setNutrientProgress(nutrients);
        
        if (mealLogResponse && mealLogResponse.results) {
            const formattedMeals = mealLogResponse.results
              .sort((a, b) => new Date(b.consumed_at) - new Date(a.consumed_at))
              .slice(0, 4)
              .map(meal => ({
                title: meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1),
                meal: meal.food_name,
                calories: `${Math.round(meal.calories)} kcal`,
                time: new Date(meal.consumed_at).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })
              }));
            setMealData(formattedMeals);
        }

      } catch (err) {
        console.error("Failed to load reports:", err);
        setError(err.message || "Failed to load report data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const barChartData = nutrientProgress
    .filter(item => item.title !== "Calories")
    .map((item) => ({
      name: item.title,
      "Current (g)": item.current,
      "Goal (g)": item.goal
    }));

  const getIcon = (title) => {
    switch (title.toLowerCase()) {
      case "breakfast": return <FaCoffee />;
      case "snack": return <FaAppleAlt />;
      case "lunch": return <FaHamburger />;
      case "dinner": return <FaDrumstickBite />;
      default: return <FaAppleAlt />;
    }
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen bg-main"><p className="text-xl text-heading font-['Lora']">Loading your reports...</p></div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen bg-main"><p className="text-xl text-red font-['Poppins']">{error}</p></div>;
  }

  return (
    // Main container uses theme variables for background and text
    <div className="bg-main min-h-screen">
      <main className="text-body p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        
        <header className="mb-8">
          {/* Heading uses the secondary font 'Lora' and heading color */}
          <h1 className="text-4xl font-bold text-heading font-['Lora']">
            Daily Progress
          </h1>
          <p className="text-body mt-2 text-lg">
            {/* Highlighted text uses primary accent color */}
            <span className="font-semibold text-primary">Today: {todayDate}</span> • Your Goal: {goalCalories} kcal
          </p>
        </header>

        {/* Section 1: Nutrient Progress Cards with theme colors and soft shadows */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {nutrientProgress.map((item, idx) => (
            // Card styling uses theme classes for background, border, and shadow
            <div 
              key={idx} 
              className={`p-5 rounded-xl border-custom shadow-soft transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-2 ${cardColors[idx % cardColors.length]}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-heading font-['Lora'] font-semibold text-lg">{item.title}</h3>
                <span className="bg-section p-2 rounded-full shadow-sm">{item.icon}</span>
              </div>
              <div className="text-3xl font-bold text-heading">{item.value}</div>
              <div className="text-body text-sm">of {item.goalFormatted}</div>
              
              {/* Progress Bar uses light background and primary accent color */}
              <div className="w-full h-2.5 mt-4 bg-light rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500" 
                  style={{ width: `${item.percentage > 100 ? 100 : item.percentage}%` }}>
                </div>
              </div>
              <div className="text-xs text-right text-primary font-semibold mt-1">{item.percentage}% Complete</div>
            </div>
          ))}
        </section>

        {/* Section 2: Charts */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-10">
          {/* Pie Chart Card */}
          <div className="lg:col-span-2 bg-section p-6 rounded-xl border-custom shadow-soft transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
            <h2 className="text-heading font-['Lora'] font-semibold text-xl text-center mb-4">Macronutrient Breakdown</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={macroData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                  const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
                  const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                  const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                  return (<text x={x} y={y} fill={THEME_COLORS.textBody} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">{`${(percent * 100).toFixed(0)}%`}</text>);
                }}>
                  {macroData.map((entry, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value) => `${value.toFixed(1)}g`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Line Chart Card */}
          <div className="lg:col-span-3 bg-section p-6 rounded-xl border-custom shadow-soft transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
            <h2 className="text-heading font-['Lora'] font-semibold text-xl text-center mb-4">Weekly Calorie Progress</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={calorieProgress} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={THEME_COLORS.border} />
                <XAxis dataKey="name" stroke={THEME_COLORS.textBody} />
                <YAxis stroke={THEME_COLORS.textBody} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="calories" stroke={THEME_COLORS.primary} strokeWidth={3} name="Calories Consumed" dot={{ r: 5 }} activeDot={{ r: 8 }} />
                <ReferenceLine y={goalCalories} label={{ value: `Goal`, position: 'insideTopLeft', fill: THEME_COLORS.alertRed }} stroke={THEME_COLORS.alertRed} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Section 3: Bar Chart and Meal Log */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Bar Chart */}
            <div className="lg:col-span-3 bg-section p-6 rounded-xl border-custom shadow-soft transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
              <h2 className="text-heading font-['Lora'] font-semibold text-xl text-center mb-4">Macronutrient Intake – Current vs Goal</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={THEME_COLORS.border} />
                  <XAxis dataKey="name" stroke={THEME_COLORS.textBody} />
                  <YAxis stroke={THEME_COLORS.textBody} />
                  <Tooltip formatter={(value) => `${value.toFixed(1)}g`} />
                  <Legend />
                  <Bar dataKey="Current (g)" fill={THEME_COLORS.primary} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Goal (g)" fill={THEME_COLORS.primaryHover} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Meal Log with theme-aligned styling */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <h2 className="text-heading font-['Lora'] font-semibold text-xl">Today's Meal Log</h2>
              {mealData.length > 0 ? mealData.map((meal, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-xl border-custom shadow-soft bg-section transition-all duration-300 ease-in-out hover:shadow-lg hover:border-primary hover:-translate-y-1">
                  <div className="flex items-center gap-4">
                    {/* Themed icon container using accent orange */}
                    <div className="bg-accent-orange/20 p-3 rounded-full text-accent-orange text-xl">
                      {getIcon(meal.title)}
                    </div>
                    <div>
                      <p className="font-semibold text-heading">{meal.title}</p>
                      <p className="text-sm text-body">{meal.meal}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-primary font-bold">{meal.calories}</p>
                    <p className="text-sm text-body/70">{meal.time}</p>
                  </div>
                </div>
              )) : (
                <div className="text-body p-6 bg-section rounded-xl border border-dashed border-custom shadow-sm text-center">
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