// src/components/MealCompliance.jsx

import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const MealCompliance = () => {
  const compliance = 78; // Replace this with dynamic value from backend later

  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">
        Meal Plan Compliance
      </h3>
      <div className="w-24 h-24">
        <CircularProgressbar
          value={compliance}
          text={`${compliance}%`}
          styles={buildStyles({
            textSize: "16px",
            pathColor: "#3b82f6",
            textColor: "#374151",
            trailColor: "#d1d5db",
          })}
        />
      </div>
    </div>
  );
};

export default MealCompliance;
