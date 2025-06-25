// src/components/HealthDashboard.jsx
import React, { useEffect, useState } from "react";
import { getDiabeticProfile } from "../../../api/diabeticApi";

import HealthSummary from "./HealthSummary";
import HbA1cChart from "./HbA1cChart";
import BloodSugarChart from "./BloodSugarChart";
import CholesterolChart from "./CholestrolChart";
import AddInfoButton from "./AddInfoButton";
import AddDiabeticInfoModal from "./AddDiabeticInfoModal";
import SummaryPieChart from "./PieChart";

const HealthDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [summaryData, setSummaryData] = useState({
    hba1c: 0,
    bloodSugar: 0,
    cholesterol: 0,
  });

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = (formData) => {
    console.log("Form submitted:", formData);
    fetchProfileData(); // Refresh after submitting
    closeModal();
  };

  const fetchProfileData = async () => {
    try {
      const response = await getDiabeticProfile();
      const results = response?.results || [];
      const latest = results[results.length - 1];

      if (latest) {
        setSummaryData({
          hba1c: latest.hba1c || 0,
          bloodSugar: latest.fasting_blood_sugar || 0,
          cholesterol: latest.total_cholesterol || 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen px-6 py-10 sm:px-10 md:px-10 lg:px-32 xl:px-30">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-blue-900 text-white rounded-full text-sm font-semibold">
            Diabetes
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-600 rounded-full text-sm font-medium">
            Thyroid
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-600 rounded-full text-sm font-medium">
            Heart
          </button>
        </div>
      </div>

      {/* Health Summary Cards */}
      <HealthSummary />

      {/* Section Title & Add Info */}
      <div className="flex justify-between items-center mt-10 mb-4">
        <h2 className="text-xl font-semibold text-gray-700">Health Reports & Analytics</h2>
        <AddInfoButton onClick={openModal} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
        <HbA1cChart />
        <BloodSugarChart />
        <CholesterolChart />
        <SummaryPieChart data={summaryData} />
      </div>

      {/* Add Info Modal */}
      <AddDiabeticInfoModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default HealthDashboard;
