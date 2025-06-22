// src/components/HealthSummary.jsx

import React from "react";
import { Droplet, Flame, HeartPulse, Syringe } from "lucide-react";

const Card = ({ title, value, unit, icon, color, description }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 flex items-center gap-4">
      <div
        className={`w-10 h-10 flex items-center justify-center rounded-full ${color}`}
      >
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-medium text-gray-600">{title}</h4>
        <div className="text-lg font-semibold text-gray-800 flex items-baseline">
          {value}
          {unit && <span className="ml-1 text-sm text-gray-500">{unit}</span>}
        </div>
        {description && (
          <p className="text-xs text-red-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
};

const HealthSummary = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <Card
        title="Latest HbA1c"
        value="7.2"
        unit="%"
        icon={<Droplet className="text-red-500" size={18} />}
        color="bg-red-100"
        description="Above target"
      />
      <Card
        title="Fasting Sugar"
        value="130.5"
        unit="mg/dL"
        icon={<Flame className="text-blue-500" size={18} />}
        color="bg-blue-100"
      />
      <Card
        title="Total Cholesterol"
        value="190.5"
        unit="mg/dL"
        icon={<HeartPulse className="text-purple-500" size={18} />}
        color="bg-purple-100"
      />
      <Card
        title="Type"
        value="Type 2"
        icon={<Syringe className="text-orange-500" size={18} />}
        color="bg-orange-100"
        description="Insulin dependent"
      />
    </div>
  );
};

export default HealthSummary;
