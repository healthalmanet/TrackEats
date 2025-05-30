import React from "react";
import { Routes, Route } from "react-router-dom";
import UserProfileForm from "./dashboard/UserProfileForm";
import Tools from "./dashboard/Tools/Tools";
import BmiCalculator from "./dashboard/Tools/BmiCalculator";
import FatCalculator from "./dashboard/Tools/FatCalculator";
import BmiResult from "./dashboard/Tools/BmiResult";
import Explore from "./dashboard/Explore";
import FatResult from "./dashboard/Tools/FatResult";
import MealLogger from "./dashboard/Tools/MealLogger";
import NutritionSearch from "./dashboard/Tools/NutritionSearch";
import WeightTracker from "./dashboard/Tools/WeightTracker";
import WaterTracker from "./dashboard/Tools/WaterTracker";
import CustomReminder from "./dashboard/Tools/CustomReminder";
import DiabeticPage from "../components/components/diabetic";
import HealthSection from "./dashboard/Tools/HealthSection";

function Dashboard() {
  return (
    <div>
      <Routes>
        {/* User Profile */}
        <Route path="user-profile" element={<UserProfileForm />} />

        {/* Tools main page with links */}
        <Route path="tools" element={<Tools />} />

        {/* Separate pages for calculators and results */}
        <Route path="tools/bmi" element={<BmiCalculator />} />
        <Route path="tools/bmi-result" element={<BmiResult />} />
        <Route path="tools/fat-calculator" element={<FatCalculator />} />
        <Route path="fat-result" element={<FatResult />} />
         <Route path="tools/meal-log" element={<MealLogger />} />
           <Route path="tools/nutrition-search" element={<NutritionSearch />} />
           <Route path="tools/weight-tracker" element={<WeightTracker />} />
           <Route path="tools/water-tracker" element={<WaterTracker />} />
           <Route path="custom-reminder" element={<CustomReminder />} />


        <Route path="explore" element={<Explore/>} />
        <Route path="diabetic" element={<HealthSection/>} />
      </Routes>
    </div>
  );
}

export default Dashboard;
