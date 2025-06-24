import { Routes, Route, useLocation } from "react-router-dom";
import UserProfileForm from "./dashboard/UserProfileForm";
import Tools from "./dashboard/Tools/Tools";
import BmiCalculator from "./dashboard/Tools/BmiCalculator";
import FatCalculator from "./dashboard/Tools/FatCalculator";
// import BmiResult from "./dashboard/Tools/BmiResult";
import Explore from "./dashboard/Explore";
import FatResult from "./dashboard/Tools/FatResult";
import MealLogger from "./dashboard/Tools/MealLogger";
import NutritionSearch from "./dashboard/Tools/NutritionSearch";
import WeightTracker from "./dashboard/Tools/WeightTracker";
import WaterTracker from "./dashboard/Tools/WaterTracker";
import CustomReminder from "./dashboard/Tools/CustomReminder";

import HealthSection from "./dashboard/Tools/HealthSection";
import Caloriesbar from "../components/components/Caloriesbar";
import HeroSection from "../components/components/HeroSection";
import QuickMealLogger from "../components/components/MealLogger/QuickMealLogger";
import WaterIntakeWidget from "../components/components/WaterTracker/WaterWidget"; // ✅ ADD THIS
import HealthTools from "../components/components/HealthSection";
import DietRecommendations from "../components/components/RecommendationSection";
import Meals from "./dashboard/Meals";
import Footer from "../components/components/Footer";
import Reports from "./Reports"


function Dashboard() {
  const location = useLocation();

  return (
    <div>
      {location.pathname === "/dashboard" && (
        <>
          <HeroSection />
          <QuickMealLogger />
          <WaterIntakeWidget/> 
          <HealthTools/> 
          <DietRecommendations/>
          <Footer/>
        </>
      )}

      <Routes>
        <Route path="user-profile" element={<UserProfileForm />} />
        <Route path="tools" element={<Tools />} />
        <Route path="tools/bmi" element={<BmiCalculator />} />
        {/* <Route path="tools/bmi-result" element={<BmiResult />} /> */}
        <Route path="tools/fat-calculator" element={<FatCalculator />} />
        <Route path="fat-result" element={<FatResult />} />
        <Route path="tools/meal-log" element={<MealLogger />} />
        <Route path="tools/nutrition-search" element={<NutritionSearch />} />
        <Route path="tools/weight-tracker" element={<WeightTracker />} />
        <Route path="tools/water-tracker" element={<WaterTracker />} />
        <Route path="tools/custom-reminder" element={<CustomReminder />} />
        <Route path="health-section" element={<HealthSection />} />
        <Route path="meals" element={<Meals/>} />
        <Route path="reports" element={<Reports/>} />
      
      </Routes>
    </div>
  );
}

export default Dashboard;
