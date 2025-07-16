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
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const waterIntakeGlasses = useMemo(() => Math.floor(waterIntakeML / glassSizeML) || 0, [waterIntakeML]);
  const waterGoalGlasses = useMemo(() => Math.round(waterGoalML / glassSizeML), [waterGoalML]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [profileData, goalData] = await Promise.all([getUserProfile(), targetApi()]);
        setWeight(profileData.weight_kg);
        setCalorieGoal(goalData.recommended_calories || 2000);
        setWaterGoalML(goalData.water?.recommended_ml || 3000);
      } catch (error) {
        toast.error("Failed to load profile and goal data");
      }
    };
    fetchAllData();
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
        const totalCalories = todayMeals.reduce((acc, meal) => acc + meal.calories, 0);
        setCaloriesToday(Number(totalCalories.toFixed(0)));
      } catch (error) {
        // This can be noisy, so maybe a console log is better than a toast
        console.error("Failed to load today's calorie data:", error);
      }
    };
    fetchTodayCalories();
  }, [today, mealUpdateTrigger]);

  useEffect(() => {
    const fetchWaterIntake = async () => {
      try {
        const data = await getWater(today);
        const entries = data.results || [];
        const totalML = entries.reduce((sum, item) => sum + Number(item.amount_ml || 0), 0);
        setWaterIntakeML(totalML);
      } catch (error) {
        console.error("Failed to load water intake data:", error);
      }
    };
    fetchWaterIntake();
  }, [today, waterUpdateTrigger]);

  return (
    // Replaced gradient and SVG with a clean, tinted background from the theme
    <div className="w-full relative overflow-hidden bg-primary/10 text-heading pt-16 pb-20 px-6 md:px-10 lg:px-12 rounded-b-3xl">
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
        
        {/* Left Info with themed typography */}
        <div className="w-full md:w-2/3 space-y-6 font-['Poppins']">
          <div>
            <h1 className="text-3xl sm:text-4xl font-['Lora'] font-bold text-heading">
              Fuel your journey with{" "}
              <span className="text-primary">smart nutrition</span>
            </h1>
            <p className="mt-2 text-lg text-body">
              Log, learn, and stay ahead of your health goals every day.
            </p>
          </div>

          {/* Stats Cards with themed styling */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Calories Card */}
            <div className="bg-section p-5 rounded-2xl shadow-soft hover:shadow-lg hover:border-primary border border-transparent hover:-translate-y-2 transform transition-all duration-300 ease-in-out relative">
              <div className="absolute top-3 right-3 bg-accent-orange/10 text-accent-orange p-2 rounded-full">
                <Flame size={18} />
              </div>
              <p className="text-sm font-medium mb-1 text-body">Calories Today</p>
              <p className="text-2xl font-bold text-heading">{caloriesToday}</p>
              <p className="text-sm text-body">Goal: {calorieGoal ?? "..."}</p>
              {calorieGoal && caloriesToday >= calorieGoal && (
                <p className="text-sm text-primary mt-1 font-semibold">
                  Goal reached!
                </p>
              )}
            </div>

            {/* Water Card */}
            <div className="bg-section p-5 rounded-2xl shadow-soft hover:shadow-lg hover:border-primary border border-transparent hover:-translate-y-2 transform transition-all duration-300 ease-in-out relative">
              <div className="absolute top-3 right-3 bg-accent-yellow/10 text-accent-yellow p-2 rounded-full">
                <Droplet size={18} />
              </div>
              <p className="text-sm font-medium mb-1 text-body">Water Intake</p>
              <p className="text-2xl font-bold text-heading">
                {waterIntakeGlasses} Glass{waterIntakeGlasses !== 1 ? "es" : ""}
              </p>
              <p className="text-sm text-body">Goal: {waterGoalGlasses} Glasses</p>
              <p className="text-xs text-body/70 mt-1">({waterIntakeML} ml)</p>
            </div>

            {/* Weight Card */}
            <div className="bg-section p-5 rounded-2xl shadow-soft hover:shadow-lg hover:border-primary border border-transparent hover:-translate-y-2 transform transition-all duration-300 ease-in-out relative">
              <div className="absolute top-3 right-3 bg-primary/10 text-primary p-2 rounded-full">
                <Weight size={18} />
              </div>
              <p className="text-sm font-medium mb-1 text-body">Weight</p>
              <p className="text-2xl font-bold text-heading">
                {weight !== null ? `${weight} kg` : "..."}
              </p>
            </div>
          </div>
        </div>

        {/* Right Image with softened shadow */}
        <div className="hidden md:block w-full md:w-1/3 z-10">
          <img
            src={heroImage}
            alt="Healthy food bowl"
            className="max-h-[280px] mx-auto shadow-lg hover:scale-110 transition-all duration-300 ease-in-out rounded-xl"
          />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;