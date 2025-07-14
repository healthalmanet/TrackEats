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
import { getMealsByDate } from "../api/mealLog"; // <-- ADDED API IMPORT

// --- THEME-ALIGNED CHART COLORS ---
const CHART_COLORS = ["#FF7043", "#AED581", "#B3E5FC"];

const Reports = () => {
  const [macroData, setMacroData] = useState([]);
  const [calorieProgress, setCalorieProgress] = useState([]);
  const [nutrientProgress, setNutrientProgress] = useState([]);
  const [goalCalories, setGoalCalories] = useState(0);
  const [mealData, setMealData] = useState([]); // This will now be populated from the API
  const [todayDate, setTodayDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // --- Get auth token and today's date for API calls ---
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error("Authentication token not found. Please log in.");
        }
        const apiDate = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD

        // --- Fetch all data in parallel for better performance ---
        const [
          recommendedResponse,
          progressResponse,
          weeklyDataResponse,
          mealLogResponse
        ] = await Promise.all([
          targetApi(),
          targetProgressApi(),  
          weeklyTrack(),
          getMealsByDate(token, apiDate) // <-- NEW API CALL
        ]);
        
        // --- Process Target and Progress data (same as before) ---
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

        const nutrients = [
          { title: "Calories", current: progressResponse.calories, goal: recommendedResponse.recommended_calories, value: `${Math.round(progressResponse.calories)} kcal`, goalFormatted: `${Math.round(recommendedResponse.recommended_calories)} kcal`, percentage: Math.round((progressResponse.calories / recommendedResponse.recommended_calories) * 100) || 0, icon: <FaFireAlt className="text-xl text-[#FF7043]" /> },
          { title: "Protein", current: progressResponse.protein, goal: recommendedResponse.macronutrients.protein_g, value: `${progressResponse.protein.toFixed(1)}g`, goalFormatted: `${recommendedResponse.macronutrients.protein_g}g`, percentage: Math.round((progressResponse.protein / recommendedResponse.macronutrients.protein_g) * 100) || 0, icon: <FaDrumstickBite className="text-xl text-[#FF7043]" /> },
          { title: "Carbs", current: progressResponse.carbs, goal: recommendedResponse.macronutrients.carbs_g, value: `${progressResponse.carbs.toFixed(1)}g`, goalFormatted: `${recommendedResponse.macronutrients.carbs_g}g`, percentage: Math.round((progressResponse.carbs / recommendedResponse.macronutrients.carbs_g) * 100) || 0, icon: <FaBreadSlice className="text-xl text-[#FF7043]" /> },
          { title: "Fats", current: progressResponse.fats, goal: recommendedResponse.macronutrients.fats_g, value: `${progressResponse.fats.toFixed(1)}g`, goalFormatted: `${recommendedResponse.macronutrients.fats_g}g`, percentage: Math.round((progressResponse.fats / recommendedResponse.macronutrients.fats_g) * 100) || 0, icon: <FaTint className="text-xl text-[#FF7043]" /> }
        ];
        setNutrientProgress(nutrients);
        
        // --- Process Meal Log Data from the new API ---
        if (mealLogResponse && mealLogResponse.results) {
            const formattedMeals = mealLogResponse.results
              // Sort by consumed_at time to get the latest first
              .sort((a, b) => new Date(b.consumed_at) - new Date(a.consumed_at))
              // Take only the latest 4 meals
              .slice(0, 4)
              // Map to the format the UI component needs
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
      case "dinner": return <FaDrumstickBite />; // Added dinner icon for completeness
      default: return <FaAppleAlt />;
    }
  };
  
  // Theme-based colors for the nutrient cards
  const cardColors = ['bg-[#AED581]/20', 'bg-[#B3E5FC]/30', 'bg-[#FFF9C4]/40', 'bg-[#FAF3EB]'];


  if (isLoading) {
    return <div className="flex justify-center items-center h-screen bg-[#FFFDF9]"><p className="text-xl text-[#263238] font-['Poppins']">Loading your reports...</p></div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen bg-[#FFFDF9]"><p className="text-xl text-red-600 font-['Poppins']">{error}</p></div>;
  }

  return (
    // Main container uses Warm White background from the theme
    <div className="bg-[#FFFDF9] min-h-screen">
      <main className="text-[#546E7A] p-4 sm:p-6 lg:p-8 font-['Roboto'] max-w-7xl mx-auto">
        
        <header className="mb-8">
          {/* Heading uses Poppins font and Charcoal Gray color with a subtle drop shadow */}
          <h1 className="text-4xl font-bold text-[#263238] font-['Poppins']" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.1)' }}>
            Daily Progress
          </h1>
          <p className="text-[#546E7A] mt-2 text-lg">
            {/* Highlighted text uses Primary Accent color */}
            <span className="font-semibold text-[#FF7043]">Today: {todayDate}</span> • Your Goal: {goalCalories} kcal
          </p>
        </header>

        {/* Section 1: Nutrient Progress Cards with BEST HOVER ANIMATIONS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {nutrientProgress.map((item, idx) => (
            // Card styling: soft tint backgrounds, pale border, and engaging hover effect
            <div 
              key={idx} 
              className={`p-5 rounded-xl border border-[#ECEFF1] shadow-md transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-2 ${cardColors[idx % cardColors.length]}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[#263238] font-['Poppins'] font-semibold text-lg">{item.title}</h3>
                {/* Icon is wrapped for better alignment and styling */}
                <span className="bg-white p-2 rounded-full shadow-sm">{item.icon}</span>
              </div>
              <div className="text-3xl font-bold text-[#263238]">{item.value}</div>
              <div className="text-[#546E7A] text-sm">of {item.goalFormatted}</div>
              
              {/* Progress Bar with theme colors */}
              <div className="w-full h-2.5 mt-4 bg-[#ECEFF1] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#FF7043] transition-all duration-500" 
                  style={{ width: `${item.percentage > 100 ? 100 : item.percentage}%` }}>
                </div>
              </div>
              <div className="text-xs text-right text-[#FF7043] font-semibold mt-1">{item.percentage}% Complete</div>
            </div>
          ))}
        </section>

        {/* Section 2: Charts */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-10">
          {/* Pie Chart Card */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-[#ECEFF1] shadow-md transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
            <h2 className="text-[#263238] font-['Poppins'] font-semibold text-xl text-center mb-4">Macronutrient Breakdown</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={macroData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                  const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
                  const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                  const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                  return (<text x={x} y={y} fill="#546E7A" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">{`${(percent * 100).toFixed(0)}%`}</text>);
                }}>
                  {macroData.map((entry, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value) => `${value.toFixed(1)}g`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Line Chart Card */}
          <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-[#ECEFF1] shadow-md transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
            <h2 className="text-[#263238] font-['Poppins'] font-semibold text-xl text-center mb-4">Weekly Calorie Progress</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={calorieProgress} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ECEFF1" />
                <XAxis dataKey="name" stroke="#546E7A" />
                <YAxis stroke="#546E7A" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="calories" stroke="#FF7043" strokeWidth={3} name="Calories Consumed" dot={{ r: 5 }} activeDot={{ r: 8 }} />
                <ReferenceLine y={goalCalories} label={{ value: `Goal`, position: 'insideTopLeft', fill: '#F4511E' }} stroke="#F4511E" strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Section 3: Bar Chart and Meal Log */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Bar Chart */}
            <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-[#ECEFF1] shadow-md transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
              <h2 className="text-[#263238] font-['Poppins'] font-semibold text-xl text-center mb-4">Macronutrient Intake – Current vs Goal</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ECEFF1" />
                  <XAxis dataKey="name" stroke="#546E7A" />
                  <YAxis stroke="#546E7A" />
                  <Tooltip formatter={(value) => `${value.toFixed(1)}g`} />
                  <Legend />
                  <Bar dataKey="Current (g)" fill="#FF7043" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Goal (g)" fill="#FFC9B6" radius={[4, 4, 0, 0]} /> {/* Lighter tint of Orange */}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Meal Log with HOVER ANIMATIONS and DYNAMIC DATA */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <h2 className="text-[#263238] font-['Poppins'] font-semibold text-xl">Today's Meal Log</h2>
              {mealData.length > 0 ? mealData.map((meal, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-xl border border-[#ECEFF1] shadow-md bg-white transition-all duration-300 ease-in-out hover:shadow-lg hover:border-[#FF7043] hover:-translate-y-1">
                  <div className="flex items-center gap-4">
                    {/* Themed icon container */}
                    <div className="bg-[#FFEDD5] p-3 rounded-full text-[#F4511E] text-xl">
                      {getIcon(meal.title)}
                    </div>
                    <div>
                      <p className="font-semibold text-[#263238]">{meal.title}</p>
                      <p className="text-sm text-[#546E7A]">{meal.meal}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[#FF7043] font-bold">{meal.calories}</p>
                    <p className="text-sm text-gray-400">{meal.time}</p>
                  </div>
                </div>
              )) : (
                <div className="text-[#546E7A] p-6 bg-white rounded-xl border border-dashed border-[#ECEFF1] shadow-sm text-center">
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