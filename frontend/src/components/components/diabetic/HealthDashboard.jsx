// src/pages/Dashboard.jsx

import React from "react";
import HealthSummary from "./HealthSummary";
import HbA1cChart from "./HbA1CChart";
import BloodSugarChart from "./BloodSugarChart";
import CholesterolChart from "./CholestrolChart";

import AddInfoButton from "./AddInfoButton";
import HealthTabs from "./HealthTabs";

const HealthDashboard = () => {
  return (
    
    <div className="p-6 bg-gray-50 min-h-screen">
        <div className="p-6">
      <HealthTabs />
      {/* other dashboard sections */}
    </div>
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
        <h2 className="text-xl font-semibold text-gray-700">
          Health Reports & Analytics
        </h2>
        <AddInfoButton />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <HbA1cChart />
        <BloodSugarChart />
        <CholesterolChart />
        
      </div>
    </div>
  );
};

export default HealthDashboard;
