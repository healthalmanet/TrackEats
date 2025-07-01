// Meals.js

import React, { useEffect, useState } from 'react';
import { Flame, Dumbbell, Drumstick } from "lucide-react";
import { BsSunFill, BsFillCloudSunFill, BsFillMoonStarsFill } from "react-icons/bs";
import { FaFire, FaDumbbell, FaBreadSlice, FaFish } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { getDietApi } from '../../api/dietApi';

const Meals = () => {
  const [showAll, setShowAll] = useState(false);
  const [activeDay, setActiveDay] = useState(null);
  const [dietData, setDietData] = useState(null);
  const [dailyMeals, setDailyMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const response = await getDietApi();
        setDietData(response);

        if (response.meals) {
          const transformedMeals = Object.entries(response.meals).map(([date, data]) => ({
            id: date,
            date: date,
            dayOfWeek: data.day,
            meals: data.meals,
          }));
          setDailyMeals(transformedMeals);
        }
      } catch (error) {
        console.error('Error fetching meals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, []);

  const handleCardClick = (day) => {
    setActiveDay(day);
  };

  const handleCloseModal = () => {
    setActiveDay(null);
  };

  const formatDate = (dateString) => {
    const options = { month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const displayedDays = showAll ? dailyMeals : dailyMeals.slice(0, 6);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading diet plan...</div>;
  }

  if (!dietData) {
    return <div className="min-h-screen flex items-center justify-center">Could not load diet plan. Please try again later.</div>;
  }

  if (dietData.status !== 'approved') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 font-sans">
        <div className="bg-red-50 border border-red-300 rounded-xl p-8 max-w-lg w-full text-center shadow-lg">
          <h1 className="text-2xl font-bold text-red-800 mb-3 capitalize">
            🔴 Diet Plan Status: {dietData.status}
          </h1>
          <p className="text-sm text-gray-700 mb-4">
            Reviewed by: <span className="font-medium text-black">{dietData.nutritionist_full_name}</span> ({dietData.reviewed_by})
          </p>
          <p className="text-gray-800 mb-2">
            Your diet plan has been reviewed but requires changes. Please see the nutritionist's feedback below.
          </p>
          <div className="bg-red-100 p-4 rounded text-sm text-left text-red-900 italic mt-4">
            <strong>Nutritionist's Comment:</strong>
            <p className="mt-1">"{dietData.nutritionist_comment}"</p>
          </div>
          <p className="mt-6 text-sm text-gray-600">
            A revised plan will be available once it has been approved. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 font-sans text-[#001064]">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">🍴 Diet Plan Dashboard</h1>
        <p className="text-gray-500 text-sm">Week Starting: {formatDate(dietData.week_starting)}</p>
      </div>

      <div className="bg-white border rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">{dailyMeals.length}-Day Diet Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-[#f3f4fb] p-4 rounded-lg">
            <Flame className="mx-auto text-[#001064]" />
            <p className="mt-2 text-sm font-semibold">Avg Calories</p>
            <p className="text-xl font-bold text-[#001064]">{Math.round(dietData.total_average_nutrition.calories)}</p>
          </div>
          <div className="bg-[#e8fbea] p-4 rounded-lg">
            <Dumbbell className="mx-auto text-[#001064]" />
            <p className="mt-2 text-sm font-semibold">Avg Protein</p>
            <p className="text-xl font-bold text-[#001064]">{dietData.total_average_nutrition.protein.toFixed(1)}g</p>
          </div>
          <div className="bg-[#f3f4fb] p-4 rounded-lg">
            <FaBreadSlice className="mx-auto text-lg text-yellow-700" />
            <p className="mt-2 text-sm font-semibold">Avg Carbs</p>
            <p className="text-xl font-bold text-[#001064]">{dietData.total_average_nutrition.carbs.toFixed(1)}g</p>
          </div>
          <div className="bg-[#e8fbea] p-4 rounded-lg">
            <Drumstick className="mx-auto text-[#001064]" />
            <p className="mt-2 text-sm font-semibold">Avg Fats</p>
            <p className="text-xl font-bold text-[#001064]">{dietData.total_average_nutrition.fats.toFixed(1)}g</p>
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-300 rounded-xl p-4 mb-6">
        <p className="text-green-800 font-semibold mb-1 capitalize">
          🟢 Nutritionist Review: {dietData.status}
        </p>
        <p className="text-sm text-gray-700 mb-2">
          Reviewed by: <span className="font-medium text-black">{dietData.nutritionist_full_name}</span> ({dietData.reviewed_by})
        </p>
        <div className="bg-green-100 p-3 rounded text-sm text-gray-800 italic">
          "{dietData.nutritionist_comment}"
        </div>
      </div>

      <div className="font-sans text-[#001064] relative">
        <h2 className="text-lg font-semibold mb-6">{dailyMeals.length}-Day Meal Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {displayedDays.map((day) => (
            <div
              key={day.id}
              onClick={() => handleCardClick(day)}
              className="bg-white border rounded-xl p-4 shadow-md transition-transform duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-[#001064]">{day.dayOfWeek}</h3>
                <span className="bg-gray-100 text-sm text-gray-700 px-2 py-1 rounded">
                  {formatDate(day.date)}
                </span>
              </div>
              <ul className="text-sm text-gray-800 space-y-2">
                <li className="flex items-center gap-2">
                  <BsSunFill className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                  <span>{day.meals.breakfast?.name}</span>
                </li>
                <li className="flex items-center gap-2">
                  <BsFillCloudSunFill className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <span>{day.meals.lunch?.name}</span>
                </li>
                <li className="flex items-center gap-2">
                  <BsFillMoonStarsFill className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  <span>{day.meals.dinner?.name}</span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        {!showAll && dailyMeals.length > 6 && (
          <div className="text-center mt-8">
            <button
              onClick={() => setShowAll(true)}
              className="bg-[#001064] hover:bg-[#001068] text-white px-6 py-2 rounded-full font-medium shadow-md hover:shadow-lg transition duration-300"
            >
              👁 View All {dailyMeals.length} Days
            </button>
          </div>
        )}

        {activeDay && (
          <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg relative">
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-gray-600 hover:text-black text-xl"
              >
                <IoClose />
              </button>
              <h2 className="text-lg font-semibold text-blue-900 mb-4">
                {activeDay.dayOfWeek} - {formatDate(activeDay.date)}
              </h2>

              <div className="bg-gray-50 p-4 rounded-lg mb-6 shadow-sm">
                <h3 className="font-semibold text-gray-700 mb-3">Daily Meals</h3>
                <ul className="space-y-3 text-sm text-gray-800">
                  <li className="flex items-start gap-3">
                    <BsSunFill className="text-yellow-500 mt-1 flex-shrink-0" />
                    <div><strong>Breakfast:</strong> {activeDay.meals.breakfast?.name}</div>
                  </li>
                  <li className="flex items-start gap-3">
                    <BsFillCloudSunFill className="text-orange-500 mt-1 flex-shrink-0" />
                    <div><strong>Lunch:</strong> {activeDay.meals.lunch?.name}</div>
                  </li>
                  <li className="flex items-start gap-3">
                    <BsFillMoonStarsFill className="text-indigo-500 mt-1 flex-shrink-0" />
                    <div><strong>Dinner:</strong> {activeDay.meals.dinner?.name}</div>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg shadow-sm space-y-4">
                <h3 className="font-semibold text-gray-700">Meal-wise Nutrition</h3>

                {['breakfast', 'lunch', 'dinner'].map((mealType) => {
                  const meal = activeDay.meals[mealType];
                  if (!meal) return null;
                  return (
                    <div key={mealType}>
                      <p className="text-sm font-semibold mb-1 capitalize">
                        {mealType === 'breakfast' ? '🍳 Breakfast' : mealType === 'lunch' ? '🥗 Lunch' : '🍛 Dinner'}
                      </p>
                      <p className="text-xs text-gray-500 italic mb-1">{meal.name}</p>
                      <div className="grid grid-cols-4 gap-2 text-xs text-center">
                        <div>
                          <p className="text-gray-500">Cal</p>
                          <p className="font-bold">{meal.calories}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Protein</p>
                          <p className="font-bold">{meal.protein}g</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Carbs</p>
                          <p className="font-bold">{meal.carbs}g</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Fats</p>
                          <p className="font-bold">{meal.fats}g</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Meals;
