import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useState } from "react";

// Import from your context
import { useAuth } from "../components/context/AuthContext"; // Adjust the path if needed

// Dashboard tools and pages
import UserProfileForm from "./dashboard/UserProfileForm";
import Tools from "./dashboard/Tools/Tools";
import BmiCalculator from "./dashboard/Tools/BmiCalculator";
import FatCalculator from "./dashboard/Tools/FatCalculator";
import FatResult from "./dashboard/Tools/FatResult";
import MealLogger from "./dashboard/Tools/MealLogger";
import NutritionSearch from "./dashboard/Tools/NutritionSearch";
import WeightTracker from "./dashboard/Tools/WeightTracker";
import WaterTracker from "./dashboard/Tools/WaterTracker";
import CustomReminder from "./dashboard/Tools/CustomReminder";
import HealthSection from "./dashboard/Tools/HealthSection";
import Meals from "./dashboard/Meals";
import Reports from "./Reports";

// Components visible on dashboard main screen
import HeroSection from "../components/components/HeroSection";
import QuickMealLogger from "../components/components/MealLogger/QuickMealLogger";
import WaterIntakeWidget from "../components/components/WaterTracker/WaterWidget";
import HealthTools from "../components/components/HealthSection";
import DietRecommendations from "../components/components/RecommendationSection";

function Dashboard() {
  const location = useLocation();
  const { user } = useAuth(); // Get logged-in user info
  const [waterUpdateTrigger, setWaterUpdateTrigger] = useState(0);

  // Redirect to homepage if user is not a regular user
  if (!user || user.role !== "user") {
    return <Navigate to="/" />;
  }

  return (
    <div>
      {location.pathname === "/dashboard" && (
        <>
          <HeroSection waterUpdateTrigger={waterUpdateTrigger} />
          <QuickMealLogger />
          <WaterIntakeWidget
            onWaterLogged={() => setWaterUpdateTrigger((prev) => prev + 1)}
          />
          <HealthTools />
          <DietRecommendations />
        </>
      )}

      <Routes>
        <Route path="user-profile" element={<UserProfileForm />} />
        <Route path="tools" element={<Tools />} />
        <Route path="tools/bmi" element={<BmiCalculator />} />
        <Route path="tools/fat-calculator" element={<FatCalculator />} />
        <Route path="fat-result" element={<FatResult />} />
        <Route path="tools/meal-log" element={<MealLogger />} />
        <Route path="tools/nutrition-search" element={<NutritionSearch />} />
        <Route path="tools/weight-tracker" element={<WeightTracker />} />
        <Route path="tools/water-tracker" element={<WaterTracker />} />
        <Route path="tools/custom-reminder" element={<CustomReminder />} />
        <Route path="health-section" element={<HealthSection />} />
        <Route path="meals" element={<Meals />} />
        <Route path="reports" element={<Reports />} />
      </Routes>
    </div>
  );
}

export default Dashboard;
