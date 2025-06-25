import React, { useEffect, useState } from 'react';
import { Flame, Dumbbell, Drumstick, Sun } from "lucide-react";
import { BsSunFill, BsFillCloudSunFill, BsFillMoonStarsFill } from "react-icons/bs";
import { FaFire, FaDumbbell, FaBreadSlice, FaFish } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
// import Footer from '../../components/components/Footer';
import { getMeals } from '../../api/mealLog'; // ✅ Use correct path to your API


const Meals = () => {
  const [showAll, setShowAll] = useState(false);
  const [activeMeal, setActiveMeal] = useState(null);
  const [mealsData, setMealsData] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const response = await getMeals(token);
        setMealsData(response.results); // assumes paginated API
        setLoading(false);
      } catch (error) {
        console.error('Error fetching meals:', error);
        setLoading(false);
      }
      console.log("")
    };

    fetchMeals();
  }, [token]);

  const handleCardClick = (meal) => {
    setActiveMeal(meal);
  };

  const handleCloseModal = () => {
    setActiveMeal(null);
  };

  const displayedMeals = showAll ? mealsData : mealsData.slice(0, 6);

  return (
    <>
      <div className="min-h-screen bg-white p-6 font-sans text-[#001064]">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            🍴 Diet Plan Dashboard
          </h1>
          <p className="text-gray-500 text-sm">Week Starting: June 18</p>
        </div>

        {/* Overview */}
        <div className="bg-white border rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">15-Day Diet Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
            <div className="bg-[#f3f4fb] p-4 rounded-lg">
              <Flame className="mx-auto text-[#001064]" />
              <p className="mt-2 text-sm font-semibold">Avg Calories</p>
              <p className="text-xl font-bold text-[#001064]">656</p>
            </div>
            <div className="bg-[#e8fbea] p-4 rounded-lg">
              <Dumbbell className="mx-auto text-[#001064]" />
              <p className="mt-2 text-sm font-semibold">Avg Protein</p>
              <p className="text-xl font-bold text-[#001064]">25.6g</p>
            </div>
            <div className="bg-[#f3f4fb] p-4 rounded-lg">
              <p className="mt-2 text-sm font-semibold">Avg Carbs</p>
              <p className="text-xl font-bold text-[#001064]">76.7g</p>
            </div>
            <div className="bg-[#e8fbea] p-4 rounded-lg">
              <Drumstick className="mx-auto text-[#001064]" />
              <p className="mt-2 text-sm font-semibold">Avg Fats</p>
              <p className="text-xl font-bold text-[#001064]">25.3g</p>
            </div>
          </div>
        </div>

        {/* Meal Plan Cards */}
        <div className="p-6 font-sans text-[#001064] relative">
          <h2 className="text-lg font-semibold mb-6">15-Day Meal Plan</h2>

          {loading ? (
            <p className="text-center text-gray-500">Loading meals...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {displayedMeals.map((meal, index) => (
                <div
                  key={index}
                  onClick={() => handleCardClick(meal)}
                  className="bg-white border rounded-xl p-4 shadow-md transition-transform duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-[#001064]">Meal #{meal.id}</h3>
                    {meal.calories && (
                      <span className="bg-gray-100 text-sm text-gray-700 px-2 py-1 rounded">
                        {meal.calories} cal
                      </span>
                    )}
                  </div>
                  <ul className="text-sm text-gray-800 space-y-1">
                    <li className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-yellow-500" />
                      {meal.food_name} ({meal.meal_type})
                    </li>
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Show All Button */}
          {!showAll && !loading && (
            <div className="text-center">
              <button
                onClick={() => setShowAll(true)}
                className="bg-[#001064] hover:bg-[#001068] text-white px-6 py-2 rounded-full font-medium shadow-md hover:shadow-lg transition duration-300"
              >
                👁 View All 15 Days
              </button>
            </div>
          )}

          {/* Modal */}
          {activeMeal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50">
              <div className="bg-white rounded-xl p-6 w-[400px] shadow-lg relative">
                <button
                  onClick={handleCloseModal}
                  className="absolute top-4 right-4 text-gray-600 hover:text-black text-xl"
                >
                  <IoClose />
                </button>

                <h2 className="text-lg font-semibold text-blue-900 mb-4">
                  {activeMeal.food_name}
                </h2>

                <div className="bg-gray-50 p-4 rounded-lg mb-6 shadow-sm">
                  <h3 className="font-semibold text-gray-700 mb-2">Details</h3>
                  <ul className="space-y-2 text-sm text-gray-800">
                    <li>
                      <BsSunFill className="inline text-yellow-500 mr-2" />
                      <strong>Type:</strong> {activeMeal.meal_type}
                    </li>
                    <li>
                      <BsFillCloudSunFill className="inline text-orange-500 mr-2" />
                      <strong>Qty:</strong> {activeMeal.quantity} {activeMeal.unit}
                    </li>
                    <li>
                      <BsFillMoonStarsFill className="inline text-indigo-500 mr-2" />
                      <strong>Remarks:</strong> {activeMeal.remarks || 'N/A'}
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-100 p-4 rounded-lg shadow-sm grid grid-cols-2 gap-4 text-center">
                  <div>
                    <FaFire className="text-red-500 text-xl mx-auto" />
                    <p className="font-medium text-sm">Calories</p>
                    <p className="font-bold text-base">{activeMeal.calories || 'N/A'}</p>
                  </div>
                  <div>
                    <FaDumbbell className="text-blue-500 text-xl mx-auto" />
                    <p className="font-medium text-sm">Protein</p>
                    <p className="font-bold text-base">{activeMeal.protein || 'N/A'}</p>
                  </div>
                  <div>
                    <FaBreadSlice className="text-yellow-700 text-xl mx-auto" />
                    <p className="font-medium text-sm">Carbs</p>
                    <p className="font-bold text-base">{activeMeal.carbs || 'N/A'}</p>
                  </div>
                  <div>
                    <FaFish className="text-green-600 text-xl mx-auto" />
                    <p className="font-medium text-sm">Fats</p>
                    <p className="font-bold text-base">{activeMeal.fats || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Meals;




































































// import React, { useState, useEffect } from 'react'
// import { Flame, Dumbbell,  Drumstick } from "lucide-react";
// import { Sun, Moon, CloudSun } from "lucide-react";
// import Footer from '../../components/components/Footer';
// import { getDietApi } from '../../api/dietApi';
// import { FaFire, FaDumbbell, FaBreadSlice, FaFish } from "react-icons/fa";
// import { IoClose } from "react-icons/io5";
// import { BsSunFill, BsFillCloudSunFill, BsFillMoonStarsFill } from "react-icons/bs";



// // const Meals = () => {

//   const Meals = ({mealpanData}) => {
//   const [showAll, setShowAll] = useState(false);
//   const [activeForm, setActiveForm] = useState(null);
//   const [diet, setDiet] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const d = await getDietApi();
  
//         console.log('diet:', d);
  
//         setDiet(d);
//       } catch (error) {
//         console.error('API Error:', error);
//       }
//     };
  
//     fetchData();
//   }, []);


//   const handleCardClick = (day) => {
//     setActiveForm(day);
//   };

//   const handleClose = () => {
//     setActiveForm(null);
//   };

//  const toggleShowAll = () => {
//     setShowAll((prev) => !prev);
//   };

//   const mealPlanData = [
//   {
//     day: "Day 1 - Monday",
//     calories: "766 cal",
//     meals: [
//       { icon: <Sun className="inline w-4 h-4" />, item: "Vegetable Upma" },
//       { icon: <CloudSun className="inline w-4 h-4" />, item: "Oats Idli" },
//       { icon: <Moon className="inline w-4 h-4" />, item: "Oats Idli" },
//     ],
    
//   },

//   {
//     day: "Day 2 - Tuesday",
//     calories: "491 cal",
//     meals: [
//       { icon: <Sun className="inline w-4 h-4" />, item: "Vegetable Upma" },
//       { icon: <CloudSun className="inline w-4 h-4" />, item: "Paneer Bhurji" },
//       { icon: <Moon className="inline w-4 h-4" />, item: "Oats Idli" },
//     ],
//   },
//   {
//     day: "Day 3 - Wednesday",
//     calories: "587 cal",
//     meals: [
//       { icon: <Sun className="inline w-4 h-4" />, item: "Vegetable Upma" },
//       { icon: <CloudSun className="inline w-4 h-4" />, item: "Rajma Chawal" },
//       { icon: <Moon className="inline w-4 h-4" />, item: "Masoor Dal" },
//     ],
//   },
//   {
//     day: "Day 4 - Thursday",
//     calories: "605 cal",
//     meals: [
//       { icon: <Sun className="inline w-4 h-4" />, item: "Vegetable Upma" },
//       { icon: <CloudSun className="inline w-4 h-4" />, item: "Grilled Fish" },
//       { icon: <Moon className="inline w-4 h-4" />, item: "Vegetable Upma" },
//     ],
//   },
//   {
//     day: "Day 5 - Friday",
//     calories: "729 cal",
//     meals: [
//       { icon: <Sun className="inline w-4 h-4" />, item: "Vegetable Upma" },
//       { icon: <CloudSun className="inline w-4 h-4" />, item: "Grilled Fish" },
//       { icon: <Moon className="inline w-4 h-4" />, item: "Mixed Fruit Salad" },
//     ],
//   },
//   {
//     day: "Day 6 - Saturday",
//     calories: "790 cal",
//     meals: [
//       { icon: <Sun className="inline w-4 h-4" />, item: "Vegetable Upma" },
//       { icon: <CloudSun className="inline w-4 h-4" />, item: "Paneer Bhurji" },
//       { icon: <Moon className="inline w-4 h-4" />, item: "Oats Idli" },
//     ],
//   },
//     {
//     day: "Day 7 - Saturday",
//     calories: "790 cal",
//     meals: [
//       { icon: <Sun className="inline w-4 h-4" />, item: "Vegetable Upma" },
//       { icon: <CloudSun className="inline w-4 h-4" />, item: "Paneer Bhurji" },
//       { icon: <Moon className="inline w-4 h-4" />, item: "Oats Idli" },
//     ],
//   },
//    {
//     day: "Day 8 - Saturday",
//     calories: "790 cal",
//     meals: [
//       { icon: <Sun className="inline w-4 h-4" />, item: "Vegetable Upma" },
//       { icon: <CloudSun className="inline w-4 h-4" />, item: "Paneer Bhurji" },
//       { icon: <Moon className="inline w-4 h-4" />, item: "Oats Idli" },
//     ],
//   },
//    {
//     day: "Day 9 - Saturday",
//     calories: "790 cal",
//     meals: [
//       { icon: <Sun className="inline w-4 h-4" />, item: "Vegetable Upma" },
//       { icon: <CloudSun className="inline w-4 h-4" />, item: "Paneer Bhurji" },
//       { icon: <Moon className="inline w-4 h-4" />, item: "Oats Idli" },
//     ],
//   },
//    {
//     day: "Day 10 - Saturday",
//     calories: "790 cal",
//     meals: [
//       { icon: <Sun className="inline w-4 h-4" />, item: "Vegetable Upma" },
//       { icon: <CloudSun className="inline w-4 h-4" />, item: "Paneer Bhurji" },
//       { icon: <Moon className="inline w-4 h-4" />, item: "Oats Idli" },
//     ],
//   },

//    {
//     day: "Day 11 - Saturday",
//     calories: "790 cal",
//     meals: [
//       { icon: <Sun className="inline w-4 h-4" />, item: "Vegetable Upma" },
//       { icon: <CloudSun className="inline w-4 h-4" />, item: "Paneer Bhurji" },
//       { icon: <Moon className="inline w-4 h-4" />, item: "Oats Idli" },
//     ],
//   },
//    {
//     day: "Day 12 - Saturday",
//     calories: "790 cal",
//     meals: [
//       { icon: <Sun className="inline w-4 h-4" />, item: "Vegetable Upma" },
//       { icon: <CloudSun className="inline w-4 h-4" />, item: "Paneer Bhurji" },
//       { icon: <Moon className="inline w-4 h-4" />, item: "Oats Idli" },
//     ],
//   },
//    {
//     day: "Day 13 - Saturday",
//     calories: "790 cal",
//     meals: [
//       { icon: <Sun className="inline w-4 h-4" />, item: "Vegetable Upma" },
//       { icon: <CloudSun className="inline w-4 h-4" />, item: "Paneer Bhurji" },
//       { icon: <Moon className="inline w-4 h-4" />, item: "Oats Idli" },
//     ],
//   },
//    {
//     day: "Day 14 - Saturday",
//     calories: "790 cal",
//     meals: [
//       { icon: <Sun className="inline w-4 h-4" />, item: "Vegetable Upma" },
//       { icon: <CloudSun className="inline w-4 h-4" />, item: "Paneer Bhurji" },
//       { icon: <Moon className="inline w-4 h-4" />, item: "Oats Idli" },
//     ],
//   },
//    {
//     day: "Day 15 - Saturday",
//     calories: "790 cal",
//     meals: [
//       { icon: <Sun className="inline w-4 h-4" />, item: "Vegetable Upma" },
//       { icon: <CloudSun className="inline w-4 h-4" />, item: "Paneer Bhurji" },
//       { icon: <Moon className="inline w-4 h-4" />, item: "Oats Idli" },
//     ],
//   },



// ];
//  const displayedDays = showAll ? mealPlanData : mealPlanData.slice(0, 6);
//   return (
//     <>
//         <div className="min-h-screen bg-white p-6 font-sans text-[#001064]">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-4">
//         <h1 className="text-2xl font-bold flex items-center gap-2">
//           <span role="img" aria-label="utensils">🍴</span> Diet Plan Dashboard
//         </h1>
//         <p className="text-gray-500 text-sm">Week Starting: June 18</p>
//       </div>

//       {/* 15-Day Diet Overview */}

//       <div className="bg-white border rounded-xl shadow p-6 mb-6">
//         <h2 className="text-lg font-semibold mb-4">15-Day Diet Overview</h2>
//         <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
//           <div className="bg-[#f3f4fb] p-4 rounded-lg">
//             <Flame className="mx-auto text-[#001064]" />
//             <p className="mt-2 text-sm font-semibold">Avg Calories</p>
//             <p className="text-xl font-bold text-[#001064]">656</p>
//           </div>
//           <div className="bg-[#e8fbea] p-4 rounded-lg">
//             <Dumbbell className="mx-auto text-[#001064]" />
//             <p className="mt-2 text-sm font-semibold">Avg Protein</p>
//             <p className="text-xl font-bold text-[#001064]">25.6g</p>
//           </div>
//           <div className="bg-[#f3f4fb] p-4 rounded-lg">
//             {/* < className="mx-auto text-[#001064]" /> */}
//             <p className="mt-2 text-sm font-semibold">Avg Carbs</p>
//             <p className="text-xl font-bold text-[#001064]">76.7g</p>
//           </div>
//           <div className="bg-[#e8fbea] p-4 rounded-lg">
//             <Drumstick className="mx-auto text-[#001064]" />
//             <p className="mt-2 text-sm font-semibold">Avg Fats</p>
//             <p className="text-xl font-bold text-[#001064]">25.3g</p>
//           </div>
//         </div>
//       </div>

//       {/* Nutritionist Review */}
//       <div className="bg-green-50 border border-green-300 rounded-xl p-4">
//         <p className="text-green-700 font-medium mb-1">
//           🟢 Nutritionist Review
//         </p>
//         <p className="text-sm text-gray-600 mb-2">
//           Reviewed by: <span className="text-black">nutritionist@gmail.com</span>
//         </p>
//         <div className="bg-green-100 p-3 rounded text-sm text-black  italic">
//           "Looks good for the patient."
//         </div>
//       </div>

//     {/* new from -------------------------------------------- */}

//  <div className="p-6 font-sans text-[#001064] relative">
//       <h2 className="text-lg font-semibold mb-6">15-Day Meal Plan</h2>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//         {displayedDays.map((day, index) => (
//           <div
//             key={index}
//             onClick={() => handleCardClick(day)}
//             className="bg-white border rounded-xl p-4 shadow-md transition-transform duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer"
//           >
//             <div className="flex justify-between items-center mb-2">
//               <h3 className="font-semibold text-[#001064]">{day.day}</h3>
//               {day.calories && (
//                 <span className="bg-gray-100 text-sm text-gray-700 px-2 py-1 rounded">
//                   {day.calories}
//                 </span>
//               )}
//             </div>
//             <ul className="text-sm text-gray-800 space-y-1">
//               {day.meals.map((meal, i) => (
//                 <li key={i} className="flex items-center gap-2">
//                   <span
//                     className={
//                       i === 0
//                         ? "text-yellow-500"
//                         : i === 1
//                         ? "text-orange-500"
//                         : "text-blue-600"
//                     }
//                   >
//                     {meal.icon}
//                   </span>
//                   {meal.item}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         ))}
//       </div>

//       {/* View All Button */}
//       {!showAll && (
//         <div className="text-center">
//           <button
//             onClick={() => setShowAll(true)}
//             className="bg-[#001064] hover:bg-[#001068] text-white px-6 py-2 rounded-full font-medium shadow-md hover:shadow-lg transition duration-300"
//           >
//             👁 View All 15 Days
//           </button>
//         </div>
//       )}
      
    

//       {activeForm && (
//         <div className="fixed inset-0  bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
//           <div className="bg-white rounded-xl p-6 w-[400px] shadow-lg relative animate-fadeIn">
//             {/* Close Icon */}
//             <button
//               onClick={handleClose}
//               className="absolute top-4 right-4 text-gray-600 hover:text-black text-xl"
//             >
//               <IoClose />
//             </button>

//             {/* Date */}
//             <h2 className="text-lg font-semibold text-blue-900 mb-4">Monday - 6/16/2025</h2>

//                  {/* Meals */}
//             <div className="bg-gray-50 p-4 rounded-lg mb-6 shadow-sm">
//               <h3 className="font-semibold text-gray-700 mb-2">Daily Meals</h3>
//               <ul className="space-y-2 text-sm text-gray-800">
//                 <li className="flex items-center gap-2">
//                   <BsSunFill className="text-yellow-400" /> <strong>Breakfast:</strong> Vegetable Upma
//                 </li>
//                 <li className="flex items-center gap-2">
//                   <BsFillCloudSunFill className="text-orange-500" /> <strong>Lunch:</strong> Oats Idli
//                 </li>
//                 <li className="flex items-center gap-2">
//                   <BsFillMoonStarsFill className="text-indigo-500" /> <strong>Dinner:</strong> Oats Idli
//                 </li>
//               </ul>
//             </div>
//    {/* Nutrition Facts */}
//             <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
//               <h3 className="font-semibold text-gray-700 mb-4">Nutrition Facts</h3>
//               <div className="grid grid-cols-2 gap-4 text-center">
//                 <div>
//                   <FaFire className="text-red-500 text-xl mx-auto" />
//                   <p className="font-medium text-sm">Calories</p>
//                   <p className="font-bold text-base">766</p>
//                 </div>
//                 <div>
//                   <FaDumbbell className="text-blue-500 text-xl mx-auto" />
//                   <p className="font-medium text-sm">Protein</p>
//                   <p className="font-bold text-base">22g</p>
//                 </div>
//                 <div>
//                   <FaBreadSlice className="text-yellow-700 text-xl mx-auto" />
//                   <p className="font-medium text-sm">Carbs</p>
//                   <p className="font-bold text-base">108g</p>
//                 </div>
//                 <div>
//                   <FaFish className="text-green-600 text-xl mx-auto" />
//                   <p className="font-medium text-sm">Fats</p>
//                   <p className="font-bold text-base">19g</p>
//                 </div>
//               </div>
//             </div>
//      </div>
//         </div>

//       )}
//     </div>
//     </div>
// <Footer/>
//     </>    
//   )
// }
// export default Meals






{/* 
      Overlay Form
      
      {activeFor && (
  <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="bg-white w-[90%] max-w-md p-6 rounded-2xl shadow-2xl relative animate-fadeIn">
      
      Close Button
      <button
        onClick={handleClose}
        className="absolute top-3 right-3 text-gray-500 hover:text-black text-2xl"
      >
        &times;
      </button>

      Modal Title
      <h3 className="text-xl font-semibold text-center text-[#001064] mb-6">
        Edit Meal Plan - {activeForm.day}
      </h3>

      Form
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meal Name</label>
          <input
            type="text"
            placeholder="e.g. Vegetable Upma"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#001064] outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Calories</label>
          <input
            type="text"
            placeholder="e.g. 350"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#001064] outline-none"
          />
        </div>

      
      </form>
    </div>
  </div> */}
