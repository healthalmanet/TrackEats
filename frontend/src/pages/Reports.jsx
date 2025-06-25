
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, Legend
} from "recharts";

import { FaAppleAlt, FaCoffee, FaHamburger, FaFireAlt, FaDrumstickBite, FaBreadSlice, FaTint } from "react-icons/fa";
import Footer from '../components/components/Footer';
import { targetApi, targetProgressApi } from '../api/reportsApi';

// Donut chart colors
const COLORS = ["#00C49F", "#0088FE", "#FFBB28"];

const Reports = () => {
  const [macroData, setMacroData] = useState([]);
  const [calorieProgress, setCalorieProgress] = useState([]);
  const [nutrientProgress, setNutrientProgress] = useState([]);
  const [goalCalories, setGoalCalories] = useState(2200);
  const [mealData, setMealData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const recommended = await targetApi();
        const progress = await targetProgressApi();

        setGoalCalories(recommended?.calories || 2200);

        const macro = [
          { name: "Protein", value: progress?.protein || 0 },
          { name: "Carbs", value: progress?.carbs || 0 },
          { name: "Fat", value: progress?.fat || 0 },
        ];
        setMacroData(macro);
        setCalorieProgress(progress?.weekly_calories || []);

        const nutrients = [
          {
            title: "Calories",
            value: `${progress?.calories} kcal`,
            goal: `${recommended?.calories} kcal`,
            label: `${Math.round((progress?.calories / recommended?.calories) * 100)}%`,
            icon: <FaFireAlt className="text-xl text-green-500" />
          },
          {
            title: "Protein",
            value: `${progress?.protein}g`,
            goal: `${recommended?.protein}g`,
            label: `${Math.round((progress?.protein / recommended?.protein) * 100)}%`,
            icon: <FaDrumstickBite className="text-xl text-green-500" />
          },
          {
            title: "Carbs",
            value: `${progress?.carbs}g`,
            goal: `${recommended?.carbs}g`,
            label: `${Math.round((progress?.carbs / recommended?.carbs) * 100)}%`,
            icon: <FaBreadSlice className="text-xl text-green-500" />
          },
          {
            title: "Fats",
            value: `${progress?.fat}g`,
            goal: `${recommended?.fat}g`,
            label: `${Math.round((progress?.fat / recommended?.fat) * 100)}%`,
            icon: <FaTint className="text-xl text-green-500" />
          }
        ];
        setNutrientProgress(nutrients);

        if (progress?.meals) {
          setMealData(progress.meals);
        }
      } catch (error) {
        console.error("API Error:", error);
      }
    };

    fetchData();
  }, []);

  const barChartData = nutrientProgress.map((item) => ({
    name: item.title,
    current: parseInt(item.value),
    goal: parseInt(item.goal)
  }));

  const getIcon = (title) => {
    switch (title.toLowerCase()) {
      case "breakfast":
        return <FaCoffee />;
      case "snack":
        return <FaAppleAlt />;
      case "lunch":
        return <FaHamburger />;
      default:
        return <FaAppleAlt />;
    }
  };

  return (
    <div>
      {/* Top Section */}
      <div className="min-h-screen bg-[#f7fdfc] text-gray-800 p-6 font-sans">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-black">Daily Progress</h1>
        </header>

        <section className="mb-6">
          <p className="text-gray-600">
            <span className="text-green-500 font-semibold">Today: June 25, 2025</span> • Goal: {goalCalories} calories
          </p>
        </section>

        {/* Nutrient Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {nutrientProgress.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-4 rounded-xl shadow hover:shadow-md transition-transform duration-300 hover:scale-105"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-600 font-medium">{item.title}</h3>
                <span>{item.icon}</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{item.value}</div>
              <div className="text-gray-500 text-sm">of {item.goal}</div>
              <div className="w-full h-2 mt-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{ width: item.label }}
                ></div>
              </div>
              <div className="text-xs text-right text-green-500 mt-1">
                {item.label} Complete
              </div>
            </div>
          ))}
        </section>

        {/* Donut and Line Charts */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <h2 className="text-green-600 font-semibold mb-4">Macronutrient Breakdown</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={macroData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {macroData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-xl shadow text-center">
            <h2 className="text-green-600 font-semibold mb-4">Calorie Progress (Weekly)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={calorieProgress}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="calories" stroke="#00C49F" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Bar Chart & Meal Log Section */}
      <div className="min-h-screen bg-[#f9fdfb] p-6 flex flex-col gap-8">
        <div className="bg-white p-6 rounded-xl shadow-md w-full">
          <h2 className="text-green-600 font-semibold text-lg text-center mb-4">
            Nutrient Intake – Current vs Goal
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="current" fill="#00C49F" name="Current" />
                <Bar dataKey="goal" fill="#b2f5ea" name="Goal" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Meal Log */}
        <div className="w-full grid gap-4">
          {mealData.map((meal, index) => (
            <div
              key={index}
              className="flex items-start justify-between p-4 rounded-xl shadow bg-white hover:bg-blue-200"
            >
              <div className="flex gap-4">
                <div className="bg-[#d1fae5] p-2 rounded-full text-green-600 mt-1 text-lg">
                  {getIcon(meal.title)}
                </div>
                <div>
                  <p className="text-sm text-gray-500">{meal.title}</p>
                  <p className="font-medium">{meal.meal}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-green-500 font-semibold">{meal.calories}</p>
                <p className="text-sm text-gray-400">{meal.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Reports;









// // import React, { useState, useEffect } from 'react';
// // import axios from 'axios';
// // import { FaAppleAlt } from "react-icons/fa";
// // import { FaCoffee,  FaHamburger } from "react-icons/fa";
// // import { FaFireAlt, FaDrumstickBite, FaBreadSlice, FaTint } from "react-icons/fa";

// // import {
// //   PieChart, Pie, Cell,
// //   LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
// //   BarChart, Bar, CartesianGrid, Legend 
// // } from "recharts";

// // import Footer from '../components/components/Footer' 
// // import { targetApi } from '../api/reportsApi';
// // import { targetProgressApi } from '../api/reportsApi';



// // const Reports = () => {


// //   const [macroData, setMacroData] = useState([]);
// //   const [calorieProgress, setCalorieProgress] = useState([]);
// //   const [nutrientProgress, setNutrientProgress] = useState([]);
// //   const [goalCalories, setGoalCalories] = useState(2200);
// //   const [mealData, setMealData] = useState([]);


// // // function FetchData() {
// //   const [data, setData] = useState([]);
// //   const [progress, setProgress] = useState(null);



// // useEffect(() => {
// //   const fetchData = async () => {
// //     try {
// //       const recommended = await targetApi(); // Goal values
// //       const progress = await targetProgressApi(); // Current values

// //       console.log("Recommended:", recommended);
// //       console.log("Progress:", progress);

// //       // Set total goal calories
// //       setGoalCalories(recommended?.calories || 2200);

// //       // MacroData for donut
// //       const macro = [
// //         { name: "Protein", value: progress?.protein || 0 },
// //         { name: "Carbs", value: progress?.carbs || 0 },
// //         { name: "Fat", value: progress?.fat || 0 },
// //       ];
// //       setMacroData(macro);

// //       // Line chart: weekly calorie progress
// //       setCalorieProgress(progress?.weekly_calories || []);

// //       // Nutrient cards and bar chart
// //       const nutrientSummary = [
// //         {
// //           title: "Calories",
// //           value: `${progress?.calories} kcal`,
// //           goal: `${recommended?.calories} kcal`,
// //           label: `${Math.round((progress?.calories / recommended?.calories) * 100)}%`,
// //           icon: <FaFireAlt className="text-xl text-green-500" />,
// //         },
// //         {
// //           title: "Protein",
// //           value: `${progress?.protein}g`,
// //           goal: `${recommended?.protein}g`,
// //           label: `${Math.round((progress?.protein / recommended?.protein) * 100)}%`,
// //           icon: <FaDrumstickBite className="text-xl text-green-500" />,
// //         },
// //         {
// //           title: "Carbs",
// //           value: `${progress?.carbs}g`,
// //           goal: `${recommended?.carbs}g`,
// //           label: `${Math.round((progress?.carbs / recommended?.carbs) * 100)}%`,
// //           icon: <FaBreadSlice className="text-xl text-green-500" />,
// //         },
// //         {
// //           title: "Fats",
// //           value: `${progress?.fat}g`,
// //           goal: `${recommended?.fat}g`,
// //           label: `${Math.round((progress?.fat / recommended?.fat) * 100)}%`,
// //           icon: <FaTint className="text-xl text-green-500" />,
// //         },
// //       ];
// //       setNutrientProgress(nutrientSummary);
// //     } catch (error) {
// //       console.error("API Error:", error);
// //     }
// //   };

// //   fetchData();
// // }, []);

// //   // Convert nutrientProgress for bar chart

// //   const barChartData = nutrientProgress.map((item) => ({
// //     name: item.title,
// //     current: parseInt(item.value),
// //     goal: parseInt(item.goal),
// //   }));

// //   const getIcon = (title) => {
// //     switch (title.toLowerCase()) {
// //       case "breakfast": return <FaCoffee />;
// //       case "snack": return <FaAppleAlt />;
// //       case "lunch": return <FaHamburger />;
// //       default: return <FaAppleAlt />;
// //     }
// //   };

// //   return (
// //     <div>
// //     <div className="min-h-screen bg-[#f7fdfc] text-gray-800 p-6 font-sans">
// //       {/* Header */}
// //       <header className="flex justify-between items-center mb-6">

// //         <div className="flex items-center gap-2 text-2xl font-bold text-black">
// //           <h1>Daily Progress</h1>
// //         </div>
        
// //       </header>

// //       {/* Goal Info */}
// //       <section className="mb-6">
// //         <p className="text-gray-600">
// //           <span className="text-green-500 font-semibold">Today: June 23, 2025</span>• Goal: {goalCalories} calories 
// //         </p>
// //       </section>

// //       {/* ================================ */}

// //       <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
// //       {nutrientProgress.map((item, idx) => (
// //         // same structure as before
// //         <div
// //          key={idx}
// //           className="bg-white p-4 rounded-xl shadow hover:shadow-md transition-transform duration-300 hover:scale-105"
// //         >
// //           <div className="flex items-center justify-between mb-2">
// //             <h3 className="text-gray-600 font-medium">{item.title}</h3>
// //             <span>{item.icon}</span>
// //           </div>
// //           <div className="text-2xl font-bold text-green-600">{item.value}</div>
// //           <div className="text-gray-500 text-sm">of {item.goal}</div>
// //           <div className="w-full h-2 mt-3 bg-gray-200 rounded-full overflow-hidden">
// //             <div
// //               className="h-full bg-green-500"
// //               style={{ width: item.label }}
// //             ></div>
// //           </div>
// //           <div className="text-xs text-right text-green-500 mt-1">
// //             {item.label} Complete
// //           </div>
// //         </div>
// //       ))}
// //     </section>

// // {/* ===================================== */}
    
// //       {/* Charts */}
// //       <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //         {/* Donut Chart */}
// //         <div className="bg-white p-6 rounded-xl shadow text-center">
// //           <h2 className="text-green-600 font-semibold mb-4">Macronutrient Breakdown</h2>
// //           <ResponsiveContainer width="100%" height={250}>
// //             <PieChart>
// //               <Pie
// //                 data={macroData}
// //                 cx="50%"
// //                 cy="50%"
// //                 innerRadius={60}
// //                 outerRadius={90}
// //                 paddingAngle={5}
// //                 dataKey="value"
// //               >
// //                 {macroData.map((entry, index) => (
// //                   <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
// //                 ))}
// //               </Pie>
// //               <Tooltip />
// //             </PieChart>
// //           </ResponsiveContainer>
// //         </div>

// //         {/* Line Chart */}
// //         <div className="bg-white p-6 rounded-xl shadow text-center">
// //           <h2 className="text-green-600 font-semibold mb-4">Calorie Progress (Weekly)</h2>
// //           <ResponsiveContainer width="100%" height={250}>
// //             <LineChart data={calorieProgress}>
// //               <XAxis dataKey="name" />
// //               <YAxis />
// //               <Tooltip />
// //               <Line type="monotone" dataKey="calories" stroke="#00C49F" strokeWidth={2} />
// //             </LineChart>
// //           </ResponsiveContainer>
// //         </div>
// //       </section>
// //     </div>
// //     {/* ============================================================================== */}

// //     <div className="min-h-screen bg-[#f9fdfb] p-6 flex flex-col gap-8">
// //       {/* Bar Chart Section */}
// //       <div className="bg-white p-6 rounded-xl shadow-md w-full">
// //         <h2 className="text-green-600 font-semibold text-lg text-center mb-4">
// //           Nutrient Intake – Current vs Goal
// //         </h2>
// //         <div className="h-[300px]">
// //           <ResponsiveContainer width="100%" height="100%">
// //             <BarChart data={nutrientSummary} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
// //               <CartesianGrid strokeDasharray="3 3" />
// //               <XAxis dataKey="name" />
// //               <YAxis />
// //               <Tooltip />
// //               <Legend />
// //               <Bar dataKey="current" fill="#00C49F" name="Current" />
// //               <Bar dataKey="goal" fill="#b2f5ea" name="Goal" />
// //             </BarChart>
// //           </ResponsiveContainer>
// //         </div>
// //       </div>
// // 
// // {/* Meal Log Section */}
// // <div className="w-full grid gap-4">
// //   {mealData.map((meal, index) => {
// //     // Determine icon based on meal title
// //     const getIcon = (title) => {
// //       switch (title.toLowerCase()) {
// //         case "breakfast":
// //           return <FaCoffee />;
// //         case "snack":
// //           return <FaAppleAlt />;
// //         case "lunch":
// //           return <FaHamburger />;
// //         default:
// //           return <FaAppleAlt />;
// //       }
// //     };

// //     return (
      
// //       <div
// //         key={index}
// //         className="flex items-start justify-between p-4 rounded-xl shadow bg-white hover:bg-blue-200"
// //       >
// //         {/* Left side: Icon and details */}
// //         <div className="flex gap-4">
// //           <div className="bg-[#d1fae5] p-2 rounded-full text-green-600 mt-1 text-lg">
// //             {getIcon(meal.title)}
// //           </div>
// //           <div>
// //             <p className="text-sm text-gray-500">{meal.title}</p>
// //             <p className="font-medium">{meal.meal}</p>
// //           </div>
// //         </div>

// //         {/* Right side: calories and time */}
// //         <div className="text-right">
// //           <p className="text-green-500 font-semibold">{meal.calories}</p>
// //           <p className="text-sm text-gray-400">{meal.time}</p>
// //         </div>
// //       </div>
// //     );
// //   })}
// // </div>

// //     </div>
// // <Footer/>    

// //       </div>
// //   );
// // };

// // export default Reports









































































































































































