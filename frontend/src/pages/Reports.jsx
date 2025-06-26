import React, { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, Legend, ReferenceLine
} from "recharts";
import { FaAppleAlt, FaCoffee, FaHamburger, FaFireAlt, FaDrumstickBite, FaBreadSlice, FaTint } from "react-icons/fa";

// --- DYNAMIC API IMPORT ---
// This now imports the functions that make real network requests.
import { targetApi, targetProgressApi, weeklyTrack } from '../api/reportsApi';
import { getMeals } from '../api/mealLog';

// Donut chart colors
const COLORS = ["#00C49F", "#0088FE", "#FFBB28"]; // Green, Blue, Yellow

const Reports = () => {
  const [macroData, setMacroData] = useState([]);
  const [calorieProgress, setCalorieProgress] = useState([]);
  const [nutrientProgress, setNutrientProgress] = useState([]);
  const [goalCalories, setGoalCalories] = useState(0);
  const [mealData, setMealData] = useState([]); // This can also be fetched from an API
  const [todayDate, setTodayDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // These functions now call your actual API
        const recommendedResponse = await targetApi();
        const progressResponse = await targetProgressApi();
        const weeklyDataResponse = await weeklyTrack();

        // The mapping logic is identical, as it's based on the API response structure
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
          { title: "Calories", current: progressResponse.calories, goal: recommendedResponse.recommended_calories, value: `${Math.round(progressResponse.calories)} kcal`, goalFormatted: `${Math.round(recommendedResponse.recommended_calories)} kcal`, percentage: Math.round((progressResponse.calories / recommendedResponse.recommended_calories) * 100) || 0, icon: <FaFireAlt className="text-xl text-green-500" /> },
          { title: "Protein", current: progressResponse.protein, goal: recommendedResponse.macronutrients.protein_g, value: `${progressResponse.protein.toFixed(1)}g`, goalFormatted: `${recommendedResponse.macronutrients.protein_g}g`, percentage: Math.round((progressResponse.protein / recommendedResponse.macronutrients.protein_g) * 100) || 0, icon: <FaDrumstickBite className="text-xl text-green-500" /> },
          { title: "Carbs", current: progressResponse.carbs, goal: recommendedResponse.macronutrients.carbs_g, value: `${progressResponse.carbs.toFixed(1)}g`, goalFormatted: `${recommendedResponse.macronutrients.carbs_g}g`, percentage: Math.round((progressResponse.carbs / recommendedResponse.macronutrients.carbs_g) * 100) || 0, icon: <FaBreadSlice className="text-xl text-green-500" /> },
          { title: "Fats", current: progressResponse.fats, goal: recommendedResponse.macronutrients.fats_g, value: `${progressResponse.fats.toFixed(1)}g`, goalFormatted: `${recommendedResponse.macronutrients.fats_g}g`, percentage: Math.round((progressResponse.fats / recommendedResponse.macronutrients.fats_g) * 100) || 0, icon: <FaTint className="text-xl text-green-500" /> }
        ];
        setNutrientProgress(nutrients);
        
        // TODO: Replace with an API call if you have a meal log endpoint
        setMealData([
            { title: "Breakfast", meal: "Coffee with milk", calories: "50 kcal", time: "8:00 AM" },
            { title: "Lunch", meal: "Small pasta dish", calories: "334 kcal", time: "1:00 PM" }
        ]);

      } catch (err) {
        setError("Failed to load report data. Please try again later.");
        console.error("Error fetching report data:", err);
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
      default: return <FaAppleAlt />;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen bg-[#f7fdfc]"><p className="text-xl text-green-600">Loading your reports...</p></div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen bg-[#f7fdfc]"><p className="text-xl text-red-600">{error}</p></div>;
  }

  return (
    // ... your JSX remains exactly the same as the previous version
    <div className="bg-[#f7fdfc]">
      <main className="text-gray-800 p-6 font-sans">
        {/* All the sections from the previous answer go here... */}
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-black">Daily Progress</h1>
        </header>

        <section className="mb-6">
          <p className="text-gray-600">
            <span className="text-green-500 font-semibold">Today: {todayDate}</span> • Goal: {goalCalories} calories
          </p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {nutrientProgress.map((item, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl shadow hover:shadow-md transition-transform duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-2"><h3 className="text-gray-600 font-medium">{item.title}</h3><span>{item.icon}</span></div>
              <div className="text-2xl font-bold text-green-600">{item.value}</div>
              <div className="text-gray-500 text-sm">of {item.goalFormatted}</div>
              <div className="w-full h-2 mt-3 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-green-500" style={{ width: `${item.percentage}%` }}></div></div>
              <div className="text-xs text-right text-green-500 mt-1">{item.percentage}% Complete</div>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-xl shadow text-center"><h2 className="text-green-600 font-semibold mb-4">Today's Macronutrient Breakdown</h2><ResponsiveContainer width="100%" height={250}><PieChart><Pie data={macroData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" label>{macroData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip formatter={(value) => `${value.toFixed(1)}g`} /><Legend /></PieChart></ResponsiveContainer></div>
          <div className="bg-white p-6 rounded-xl shadow text-center"><h2 className="text-green-600 font-semibold mb-4">Weekly Calorie Progress</h2><ResponsiveContainer width="100%" height={250}><LineChart data={calorieProgress} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Legend /><Line type="monotone" dataKey="calories" stroke="#00C49F" strokeWidth={2} name="Calories Consumed" /><ReferenceLine y={goalCalories} label={{ value: `Goal`, position: 'insideTopLeft', fill: '#ef4444' }} stroke="#ef4444" strokeDasharray="3 3" /></LineChart></ResponsiveContainer></div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-md w-full"><h2 className="text-green-600 font-semibold text-lg text-center mb-4">Macronutrient Intake – Current vs Goal</h2><ResponsiveContainer width="100%" height={300}><BarChart data={barChartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip formatter={(value) => `${value.toFixed(1)}g`} /><Legend /><Bar dataKey="Current (g)" fill="#00C49F" /><Bar dataKey="Goal (g)" fill="#b2f5ea" /></BarChart></ResponsiveContainer></div>
            <div className="lg:col-span-2 w-full flex flex-col gap-4"><h2 className="text-green-600 font-semibold text-lg">Today's Meal Log</h2>{mealData.length > 0 ? mealData.map((meal, index) => (<div key={index} className="flex items-start justify-between p-4 rounded-xl shadow bg-white hover:bg-green-50 transition-colors"><div className="flex gap-4"><div className="bg-[#d1fae5] p-2 rounded-full text-green-600 mt-1 text-lg">{getIcon(meal.title)}</div><div><p className="font-semibold text-gray-700">{meal.title}</p><p className="text-sm text-gray-500">{meal.meal}</p></div></div><div className="text-right"><p className="text-green-500 font-semibold">{meal.calories}</p><p className="text-sm text-gray-400">{meal.time}</p></div></div>)) : <p className="text-gray-500 p-4 bg-white rounded-xl shadow">No meals logged for today.</p>}</div>
        </section>
      </main>
    </div>
  );
};

export default Reports;


