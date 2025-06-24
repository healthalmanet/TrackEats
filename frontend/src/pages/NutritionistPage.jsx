import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "../components/components/nutritionist/DashboardLayout";
import PatientList from "../components/components/nutritionist/PatientList";
import MyDashboard from "../components/components/nutritionist/MyDashboard";
import DietPlans from "../components/components/nutritionist/DietPlans";

const NutritionistPage = () => {
  return (
    <Routes>
      {/* Redirect /nutritionist to /nutritionist/patients */}
      <Route path="/" element={<Navigate to="patients" />} />

      {/* Routes under /nutritionist/* */}
      <Route path="/" element={<DashboardLayout />}>
        <Route path="patients" element={<PatientList />} />
        <Route path="dashboard" element={<MyDashboard />} />
        <Route path="diet-plans" element={<DietPlans />} />
      </Route>
    </Routes>
  );
};

export default NutritionistPage;
