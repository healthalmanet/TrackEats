// src/components/HeroSection.jsx
import React, { useEffect, useState } from "react";
import { Flame, Droplet, Weight } from "lucide-react";
import heroImage from "../../assets/heroImage.png";
import { getUserProfile } from "../../api/userProfile";
import { getMeals } from "../../api/mealLog";
import { toast } from "react-hot-toast";

const HeroSection = ({ calorieGoal = 2000 }) => {
  const [weight, setWeight] = useState(null);
  const [waterIntakeML, setWaterIntakeML] = useState(0);
  const [caloriesToday, setCaloriesToday] = useState(0);

  const glassSizeML = 500;
  const waterGoalGlasses = 8;

  const today = new Date().toISOString().split("T")[0];

  const waterIntakeGlasses = Math.floor(waterIntakeML / glassSizeML);

  // Fetch weight from profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        setWeight(data.weight_kg);
      } catch (error) {
        console.error("❌ Error fetching profile:", error);
        toast.error("Failed to load user profile");
      }
    };
    fetchProfile();
  }, []);

  // Fetch meals & calculate today's calories
  useEffect(() => {
    const fetchTodayCalories = async () => {
      try {
        const token = localStorage.getItem("token");
        const allData = await getMeals(token, null); // fetch all meals
        const meals = allData.results || [];

        const todayMeals = meals.filter(
          (meal) => meal.date === today && typeof meal.calories === "number"
        );

        const totalCalories = todayMeals.reduce(
          (acc, meal) => acc + meal.calories,
          0
        );

        setCaloriesToday(totalCalories.toFixed(0));
      } catch (error) {
        console.error("❌ Error fetching calories:", error);
        toast.error("Failed to load calorie data");
      }
    };

    fetchTodayCalories();
  }, [today]);

  return (
    <div className="w-full min-h-[350px] bg-gradient-to-r from-green-50 to-orange-50 p-8 md:p-12 rounded-lg flex flex-col md:flex-row justify-between items-center">
      {/* Left Side */}
      <div className="flex-1 w-full">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Welcome back!
        </h1>
        <p className="text-gray-700 text-lg font-semibold mb-8">
          Track your nutrition journey and achieve your health goals
        </p>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Calories */}
          <div className="flex-1 bg-white rounded-lg shadow p-6 border border-gray-200 transition-transform transform hover:scale-105 hover:shadow-lg relative">
            <div className="absolute top-3 right-3 text-red-500">
              <Flame size={22} />
            </div>
            <p className="text-sm text-gray-600 font-medium mb-2">
              Calories Today
            </p>
            <p className="text-2xl font-bold text-gray-800 mb-1">
              {caloriesToday}
            </p>
            <p className="text-sm text-gray-500 font-semibold mb-4">
              Goal: {calorieGoal}
            </p>
          </div>

          {/* Water */}
          <div className="flex-1 bg-white rounded-lg shadow p-6 border border-gray-200 transition-transform transform hover:scale-105 hover:shadow-lg relative">
            <div className="absolute top-3 right-3 text-blue-500">
              <Droplet size={22} />
            </div>
            <p className="text-sm text-gray-600 font-medium mb-2">
              Water Intake
            </p>
            <p className="text-2xl font-bold text-gray-800 mb-1">
              {waterIntakeGlasses}/{waterGoalGlasses} Glasses
            </p>
          </div>

          {/* Weight */}
          <div className="flex-1 bg-white rounded-lg shadow p-6 border border-gray-200 transition-transform transform hover:scale-105 hover:shadow-lg relative">
            <div className="absolute top-3 right-3 text-green-500">
              <Weight size={22} />
            </div>
            <p className="text-sm text-gray-600 font-medium mb-2">Weight</p>
            <p className="text-2xl font-bold text-gray-800 mb-1">
              {weight !== null ? `${weight} kg` : "Loading..."}
            </p>
          </div>
        </div>
      </div>

      {/* Right Side (Image) */}
      <div className="hidden md:block md:ml-10 flex-shrink-0">
        <img
          src={heroImage}
          alt="Dashboard Illustration"
          className="max-h-[300px] w-auto"
        />
      </div>
    </div>
  );
};

export default HeroSection;
