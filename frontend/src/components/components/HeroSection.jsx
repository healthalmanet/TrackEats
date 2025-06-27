import React, { useEffect, useState, useMemo } from "react";
import { Flame, Droplet, Weight } from "lucide-react";
import heroImage from "../../assets/heroImage.png";
import { getUserProfile } from "../../api/userProfile";
import { getMeals } from "../../api/mealLog";
import { getWater } from "../../api/WaterTracker";
import { targetApi } from "../../api/reportsApi";
import { toast } from "react-hot-toast";

const HeroSection = ({ waterUpdateTrigger = 0, mealUpdateTrigger = 0 }) => {
  const [weight, setWeight] = useState(null);
  const [waterIntakeML, setWaterIntakeML] = useState(0);
  const [caloriesToday, setCaloriesToday] = useState(0);
  const [calorieGoal, setCalorieGoal] = useState(null);
  const [waterGoalML, setWaterGoalML] = useState(3000);

  const glassSizeML = 250;
  const today = new Date().toISOString().split("T")[0];

  const waterIntakeGlasses = useMemo(() => {
    const glasses = Math.floor(waterIntakeML / glassSizeML);
    return isNaN(glasses) ? 0 : glasses;
  }, [waterIntakeML]);

  const waterGoalGlasses = useMemo(() => {
    return Math.round(waterGoalML / glassSizeML);
  }, [waterGoalML]);

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

  useEffect(() => {
    const fetchGoal = async () => {
      try {
        const data = await targetApi();
        setCalorieGoal(data.recommended_calories || 2000);
        setWaterGoalML(data.water?.recommended_ml || 3000);
      } catch (error) {
        console.error("❌ Error fetching targets:", error);
        toast.error("Failed to load nutrition goals");
        setCalorieGoal(2000);
        setWaterGoalML(3000);
      }
    };
    fetchGoal();
  }, []);

  useEffect(() => {
    const fetchTodayCalories = async () => {
      try {
        const token = localStorage.getItem("token");
        const allData = await getMeals(token, null);
        const meals = allData.results || [];

        const todayMeals = meals.filter(
          (meal) => meal.date === today && typeof meal.calories === "number"
        );

        const totalCalories = todayMeals.reduce(
          (acc, meal) => acc + meal.calories,
          0
        );

        setCaloriesToday(Number(totalCalories.toFixed(0)));
      } catch (error) {
        console.error("❌ Error fetching calories:", error);
        toast.error("Failed to load calorie data");
      }
    };

    fetchTodayCalories();
  }, [today, mealUpdateTrigger]);

  useEffect(() => {
    const fetchWaterIntake = async () => {
      try {
        const data = await getWater(today);
        const entries = data.results || [];

        const totalML = entries.reduce(
          (sum, item) => sum + Number(item.amount_ml || 0),
          0
        );

        setWaterIntakeML(totalML);
      } catch (error) {
        console.error("❌ Error fetching water intake:", error);
        toast.error("Failed to load water intake data");
      }
    };

    fetchWaterIntake();
  }, [today, waterUpdateTrigger]);

  return (
    <div className="w-full min-h-[350px] bg-gradient-to-r from-green-50 to-orange-50 p-8 md:p-12 rounded-lg flex flex-col md:flex-row justify-between items-center">
      {/* Left Section */}
      <div className="flex-1 w-full">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Welcome back!
        </h1>
        <p className="text-gray-700 text-lg font-semibold mb-8">
          Track your nutrition journey and achieve your health goals
        </p>

        <div className="flex flex-col md:flex-row gap-6">
          {/* ✅ Calories Card (updated) */}
          <div className="flex-1 bg-white rounded-lg shadow p-6 border border-gray-200 hover:scale-105 hover:shadow-lg transition-transform relative">
            <div className="absolute top-3 right-3 text-red-500">
              <Flame size={22} />
            </div>
            <p className="text-sm text-gray-600 font-medium mb-2">
              Calories Today
            </p>
            <p className="text-2xl font-bold text-gray-800 mb-1">
              {caloriesToday}
            </p>

            {calorieGoal !== null && (
              <>
                <p className="text-sm text-gray-500 font-semibold">
                  Goal: {calorieGoal}
                </p>
                {caloriesToday >= calorieGoal && (
                  <p className="text-sm text-green-600 font-semibold mt-1">
                    You've hit your calorie goal!
                  </p>
                )}
              </>
            )}
          </div>

          {/* ✅ Water Card (restored original logic & formatting) */}
          <div className="flex-1 bg-white rounded-lg shadow p-6 border border-gray-200 hover:scale-105 hover:shadow-lg transition-transform relative">
            <div className="absolute top-3 right-3 text-blue-500">
              <Droplet size={22} />
            </div>
            <p className="text-sm text-gray-600 font-medium mb-2">
              Water Intake
            </p>

            <p className="text-2xl font-bold text-gray-800 mb-1">
              {waterIntakeGlasses} Glass{waterIntakeGlasses !== 1 ? "es" : ""}
            </p>

            {waterIntakeGlasses <= waterGoalGlasses ? (
              <p className="text-sm text-gray-500 font-semibold">
                Goal: {waterGoalGlasses} Glasses
              </p>
            ) : (
              <p className="text-sm text-green-600 font-semibold">
                Goal surpassed by {waterIntakeGlasses - waterGoalGlasses} glass
                {waterIntakeGlasses - waterGoalGlasses > 1 ? "es" : ""}!
              </p>
            )}

            <p className="text-sm text-gray-400 mt-1">({waterIntakeML} ml)</p>
          </div>

          {/* ✅ Weight Card */}
          <div className="flex-1 bg-white rounded-lg shadow p-6 border border-gray-200 hover:scale-105 hover:shadow-lg transition-transform relative">
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

      {/* Right Image Section */}
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
