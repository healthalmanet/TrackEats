import React from 'react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { FaAppleAlt } from "react-icons/fa";
import { FaCoffee,  FaHamburger } from "react-icons/fa";
import { FaFireAlt, FaDrumstickBite, FaBreadSlice, FaTint } from "react-icons/fa";
import {
  PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, Legend 
} from "recharts";


const Reports = () => {


  {/*  progress bar */}
  // Donut chart data
  const macroData = [
    { name: "Protein", value: 125 },
    { name: "Carbs", value: 180 },
    { name: "Fat", value: 68 },
  ];
  const COLORS = ["#00C49F", "#0088FE", "#FFBB28"];

  
  // Line chart data
  const calorieProgress = [
    { name: "Mon", calories: 1400 },
    { name: "Tue", calories: 1650 },
    { name: "Wed", calories: 1700 },
    { name: "Thu", calories: 1900 },
    { name: "Fri", calories: 1850 },
    { name: "Sat", calories: 2000 },
    { name: "Sun", calories: 1847 },
  ];
  



const nutrientData = [
  {
    title: "Calories",
    value: "1,847",
    goal: "2,200 kcal",
    label: "84%",
    icon: <FaFireAlt className="text-xl text-green-500" />,
  },
  {
    title: "Protein",
    value: "125g",
    goal: "150g",
    label: "83%",
    icon: <FaDrumstickBite className="text-xl text-green-500" />,
  },
  {
    title: "Carbs",
    value: "180g",
    goal: "220g",
    label: "82%",
    icon: <FaBreadSlice className="text-xl text-green-500" />,
  },
  {
    title: "Fats",
    value: "68g",
    goal: "75g",
    label: "91%",
    icon: <FaTint className="text-xl text-green-500" />,
  },
];


const mealData = [
  {
    title: "Breakfast",
    meal: "Oatmeal with berries",
    calories: "420 kcal",
    time: "2 hours ago",
  },
  {
    title: "Snack",
    meal: "Greek yogurt",
    calories: "150 kcal",
    time: "4 hours ago",
  },
  {
    title: "Lunch",
    meal: "Grilled chicken salad",
    calories: "580 kcal",
    time: "6 hours ago",
  },
];



// function FetchData() {
  const [data, setData] = useState([]);

  
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await axios.get('https://api.example.com/data', {
  //         headers: {
  //           Authorization: `Bearer YOUR_TOKEN_HERE`, // Replace with your actual token
  //           'Content-Type': 'application/json',
  //           'Custom-Header': 'custom-value'
  //         }
  //       });
  //       setData(response.data);
  //       console.log('Data:', response.data);
  //     } catch (error) {
  //       console.error('Error:', error);
  //     }
  //   };


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://api/daily/calorie-summary/trackeats.onrender.com/', {
          headers: {
            Authorization: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoyMDY1OTgxOTAxLCJpYXQiOjE3NTA2MjE5MDEsImp0aSI6IjIxYWIwNzBhMjQ5ZDQ2NWQ4ODI5ZTIwZWUxMGY3MDBhIiwidXNlcl9pZCI6Miwicm9sZSI6InVzZXIiLCJlbWFpbCI6Im1heXVyQGdtYWlsLmNvbSIsImZ1bGxfbmFtZSI6Ik1heXVyIFBhcm1hciJ9.c49-Du2B7rCVdcYzoPgq5PIcLvFhK8mban8AwS_p9bs`, // Replace with your actual token
            // 'Content-Type': 'application/json',
            // 'Custom-Header': 'custom-value'
          }
        });
        setData(response.data);
        console.log('Data:', response.data);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchData();
  }, []);



  return (
    <div>
    <div className="min-h-screen bg-[#f7fdfc] text-gray-800 p-6 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">

        <div className="flex items-center gap-2 text-2xl font-bold text-black">
          <h1>Daily Progress</h1>
        </div>
        
      </header>

      {/* Goal Info */}
      <section className="mb-6">
        <p className="text-gray-600">
          <span className="text-green-500 font-semibold">Today: June 23, 2025</span> • Goal: 2,200 calories
        </p>
      </section>

      {/* ================================ */}

      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {nutrientData.map((item, idx) => (
        <div
          key={idx}
          className="bg-white p-4 rounded-xl shadow hover:shadow-md transition"
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

{/* ===================================== */}
    
      {/* Charts */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Donut Chart */}
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

        {/* Line Chart */}
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
    {/* ============================================================================== */}

    <div className="min-h-screen bg-[#f9fdfb] p-6 flex flex-col gap-8">
      {/* Bar Chart Section */}
      <div className="bg-white p-6 rounded-xl shadow-md w-full">
        <h2 className="text-green-600 font-semibold text-lg text-center mb-4">
          Nutrient Intake – Current vs Goal
        </h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={nutrientData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
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

{/* Meal Log Section */}
<div className="w-full grid gap-4">
  {mealData.map((meal, index) => {
    // Determine icon based on meal title
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
      <div
        key={index}
        className="flex items-start justify-between p-4 rounded-xl shadow bg-white"
      >
        {/* Left side: Icon and details */}
        <div className="flex gap-4">
          <div className="bg-[#d1fae5] p-2 rounded-full text-green-600 mt-1 text-lg">
            {getIcon(meal.title)}
          </div>
          <div>
            <p className="text-sm text-gray-500">{meal.title}</p>
            <p className="font-medium">{meal.meal}</p>
          </div>
        </div>

        {/* Right side: calories and time */}
        <div className="text-right">
          <p className="text-green-500 font-semibold">{meal.calories}</p>
          <p className="text-sm text-gray-400">{meal.time}</p>
        </div>
      </div>
    );
  })}
</div>

    </div>

      </div>
  );
};

export default Reports
