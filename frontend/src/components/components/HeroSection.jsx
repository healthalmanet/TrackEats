import React from "react";
import { Flame, Droplet, Weight } from "lucide-react";
import heroImage from "../../assets/heroImage.png";
import CaloriesBar from "../components/Caloriesbar";

const HeroSection = ({ calories, calorieGoal, waterIntake, waterGoal, weight }) => {
  return (
    <div className="w-full min-h-[350px] bg-gradient-to-r from-green-50 to-orange-50 p-8 md:p-12 rounded-lg flex flex-col md:flex-row justify-between items-center">
      
      {/* Left Side (Text + Stats) */}
      <div className="flex-1 w-full">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Welcome back!
        </h1>

        <p className="text-gray-700 text-lg font-semibold mb-8">
          Track your nutrition journey and achieve your health goals
        </p>

        <div className="flex flex-col md:flex-row gap-6">

          {/* Calories Card */}
          <div className="flex-1 bg-white rounded-lg shadow p-6 border border-gray-200 transition-transform transform hover:scale-105 hover:shadow-lg relative">
            <div className="absolute top-3 right-3 text-red-500">
              <Flame size={22} />
            </div>
            <p className="text-sm text-gray-600 font-medium mb-2">Calories Today</p>
            <p className="text-2xl font-bold text-gray-800 mb-1">{calories}</p>
            <p className="text-sm text-gray-500 font-semibold mb-4">Goal: {calorieGoal}</p>
          </div>

          {/* Water Intake Card */}
          <div className="flex-1 bg-white rounded-lg shadow p-6 border border-gray-200 transition-transform transform hover:scale-105 hover:shadow-lg relative">
            <div className="absolute top-3 right-3 text-blue-500">
              <Droplet size={22} />
            </div>
            <p className="text-sm text-gray-600 font-medium mb-2">Water Intake</p>
            <p className="text-2xl font-bold text-gray-800 mb-1">{waterIntake}/{waterGoal} Glasses</p>
          </div>

          {/* Weight Card */}
          <div className="flex-1 bg-white rounded-lg shadow p-6 border border-gray-200 transition-transform transform hover:scale-105 hover:shadow-lg relative">
            <div className="absolute top-3 right-3 text-green-500">
              <Weight size={22} />
            </div>
            <p className="text-sm text-gray-600 font-medium mb-2">Weight</p>
            <p className="text-2xl font-bold text-gray-800 mb-1">{weight} kg</p>
          </div>

        </div>
      </div>

      {/* Right Side (Image) */}
      <div className="hidden md:block md:ml-10 flex-shrink-0">
        <img src={heroImage} alt="Dashboard Illustration" className="max-h-[300px] w-auto" />
      </div>
    </div>
  );
};

export default HeroSection;
