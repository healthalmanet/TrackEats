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

  const waterIntakeGlasses = useMemo(
    () => Math.floor(waterIntakeML / glassSizeML) || 0,
    [waterIntakeML]
  );

  const waterGoalGlasses = useMemo(
    () => Math.round(waterGoalML / glassSizeML),
    [waterGoalML]
  );

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        setWeight(data.weight_kg);
      } catch (error) {
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
        toast.error("Failed to load water intake data");
      }
    };
    fetchWaterIntake();
  }, [today, waterUpdateTrigger]);

  return (
    <div className="w-full relative overflow-hidden bg-gradient-to-br from-[#FF7043] via-[#F4511E] to-[#FF8A65]
text-[#263238] pt-16 pb-28 px-6 md:px-10 lg:px-12">

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
        {/* Left Info */}
        <div className="w-full md:w-2/3 space-y-6 font-poppins">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Fuel your journey with{" "}
              <span className="text-[#5ED8D1]">smart nutrition</span>
            </h1>
            <p className="mt-2 text-lg font-roboto text-[#FFFDF9]">
              Log, learn, and stay ahead of your health goals every day.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Calories Card */}
            <div className="bg-[#FFFDF9] p-5 rounded-2xl  shadow-xl hover:shadow-gray-500/50 hover:scale-110 transform transition-all duration-300 ease-in-out relative">
              <div className="absolute top-3 right-3 bg-[#F4511E] text-white p-1 rounded-full shadow">
                <Flame size={18} />
              </div>
              <p className="text-sm font-medium mb-1 text-[#546E7A]">Calories Today</p>
              <p className="text-2xl font-bold text-[#263238]">{caloriesToday}</p>
              <p className="text-sm text-[#546E7A]">Goal: {calorieGoal ?? "Loading..."}</p>
              {calorieGoal && caloriesToday >= calorieGoal && (
                <p className="text-sm text-[#F4511E] mt-1 font-semibold">
                  You've hit your calorie goal!
                </p>
              )}
            </div>

            {/* Water Card */}
            <div className="bg-[#FFFDF9] p-5 rounded-2xl  shadow-xl hover:shadow-gray-500/50 hover:scale-110 transform transition-all duration-300 ease-in-out relative">
              <div className="absolute top-3 right-3 bg-[#F4511E] text-white p-1 rounded-full shadow">
                <Droplet size={18} />
              </div>
              <p className="text-sm font-medium mb-1 text-[#546E7A]">Water Intake</p>
              <p className="text-2xl font-bold text-[#263238]">
                {waterIntakeGlasses} Glass{waterIntakeGlasses !== 1 ? "es" : ""}
              </p>
              <p className="text-sm text-[#546E7A]">Goal: {waterGoalGlasses} Glasses</p>
              {waterIntakeGlasses > waterGoalGlasses && (
                <p className="text-sm text-[#F4511E] mt-1 font-semibold">
                  Surpassed by {waterIntakeGlasses - waterGoalGlasses} Glass
                  {waterIntakeGlasses - waterGoalGlasses > 1 ? "es" : ""}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-1">({waterIntakeML} ml)</p>
            </div>

            {/* Weight Card */}
            <div className="bg-[#FFFDF9] p-5 rounded-2xl  shadow-xl hover:shadow-gray-500/50 hover:scale-110 transform transition-all duration-300 ease-in-out relative">
              <div className="absolute top-3 right-3 bg-[#F4511E] text-white p-1 rounded-full shadow">
                <Weight size={18} />
              </div>
              <p className="text-sm font-medium mb-1 text-[#546E7A]">Weight</p>
              <p className="text-2xl font-bold text-[#263238]">
                {weight !== null ? `${weight} kg` : "Loading..."}
              </p>
            </div>
          </div>
        </div>

        {/* Right Image */}
        <div className="hidden md:block w-full md:w-1/3 z-10">
          <img
            src={heroImage}
            alt="Hero"
            className="max-h-[280px] mx-auto drop-shadow-[0_10px_25px_rgba(0,0,0,0.4)] hover:scale-110 transition-all duration-300 ease-in-out rounded-xl"
          />
        </div>
      </div>

      {/* Wavy Background */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-0">
        <svg
          className="relative block w-full h-[350px]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="#FFFDF9"
            d="M0,200 C360,360 1080,80 1440,200 L1440,320 L0,320 Z"
          />
        </svg>
      </div>
    </div>
  );
};

export default HeroSection;
