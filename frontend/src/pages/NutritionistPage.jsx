import React from "react";
import { Routes, Route } from "react-router-dom";
import NutritionistDashboard from "../components/components/nutritionist/NutritionistDashboard";
import PatientDetailsPage from "../components/components/nutritionist/PatientDetailsPage";

const NutritionistPage = () => {
  return (
    <Routes>
      <Route path="/" element={<NutritionistDashboard />} />
      <Route path="patient/:id" element={<PatientDetailsPage />} />

    </Routes>
  );
};

export default NutritionistPage;
