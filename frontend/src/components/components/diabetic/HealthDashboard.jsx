// src/components/HealthDashboard.jsx
import React, { useEffect, useState } from "react";
import { getDiabeticProfile } from "../../../api/diabeticApi";
 import { Link } from "react-router-dom";

import HealthSummary from "./HealthSummary";
import HbA1CChart from "./HbA1CChart";
import BloodSugarChart from "./BloodSugarChart";
import CholesterolChart from "./CholestrolChart";
import AddInfoButton from "./AddInfoButton";
import AddDiabeticInfoModal from "./AddDiabeticInfoModal";
import SummaryPieChart from "./PieChart";

const HealthDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0); // 🔁 trigger for chart refresh

 const [summaryData, setSummaryData] = useState({
  hba1c: 0,
  fasting_blood_sugar: 0,
  postprandial_sugar: 0,
});

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = () => {
    fetchProfileData();
    setRefreshCount((prev) => prev + 1); // 🔁 update chart components
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
        fasting_blood_sugar: latest.fasting_blood_sugar || 0,
        postprandial_sugar: latest.postprandial_sugar || 0,
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
        

      {/* Header Tabs */}
      <div className="flex justify-between items-center mb-6">
  {/* Tabs on the left */}
  <div className="flex gap-4">
    <Link to="/dashboard/health-section">
      <button
        className={`px-4 py-2 rounded-full text-sm font-semibold transition duration-200 ${
          location.pathname === "/diabetes"
            ? "bg-[#FF7043] text-white shadow-md"
            : "bg-[#FAF3EB] text-[#546E7A] hover:bg-[#FFE0B2]"
        }`}
      >
        Diabetes
      </button>
    </Link>

    <Link to="/thyroid">
      <button
        className={`px-4 py-2 rounded-full text-sm font-semibold transition duration-200 ${
          location.pathname === "/thyroid"
            ? "bg-[#FF7043] text-white shadow-md"
            : "bg-[#FAF3EB] text-[#546E7A] hover:bg-[#FFE0B2]"
        }`}
      >
        Thyroid
      </button>
    </Link>

    <Link to="/heart">
      <button
        className={`px-4 py-2 rounded-full text-sm font-semibold transition duration-200 ${
          location.pathname === "/heart"
            ? "bg-[#FF7043] text-white shadow-md"
            : "bg-[#FAF3EB] text-[#546E7A] hover:bg-[#FFE0B2]"
        }`}
      >
        Heart
      </button>
    </Link>
  </div>

  {/* Add Button on the right */}
  <div>
    <AddInfoButton onClick={openModal} />
  </div>
</div>

  
 

      {/* Health Summary Cards */}
      <HealthSummary
  data={{
    hba1c: summaryData.hba1c,
    fasting_blood_sugar: summaryData.fasting_blood_sugar,
    postprandial_sugar: summaryData.postprandial_sugar,
  }}
/>


      {/* Section Title & Add Info */}
      <div className="flex justify-between items-center mt-10 mb-4">
        <h2 className="text-xl font-semibold text-gray-700">Health Reports & Analytics</h2>
        
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
        <HbA1CChart refreshTrigger={refreshCount} />
        <BloodSugarChart refreshTrigger={refreshCount} />
        <CholesterolChart refreshTrigger={refreshCount} />
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
