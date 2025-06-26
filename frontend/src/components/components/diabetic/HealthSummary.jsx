import React from "react";
import { Droplet, Flame, HeartPulse, Syringe } from "lucide-react";

// Reusable Card component
const Card = ({ title, value, unit, icon, color, description }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 flex items-center gap-4">
      <div className={`w-10 h-10 flex items-center justify-center rounded-full ${color}`}>
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-medium text-gray-600">{title}</h4>
        <div className="text-lg font-semibold text-gray-800 flex items-baseline">
          {value ?? "N/A"}
          {unit && <span className="ml-1 text-sm text-gray-500">{unit}</span>}
        </div>
        {description && <p className="text-xs text-red-500 mt-1">{description}</p>}
      </div>
    </div>
  );
};

// HealthSummary component using props
const HealthSummary = ({ data = {} }) => {
  const {
    hba1c = null,
    bloodSugar = null,
    cholesterol = null,
    diabetesType = "type2",
    insulinDependent = false,
  } = data;

  const isEmpty = hba1c === null && bloodSugar === null && cholesterol === null;

  if (isEmpty) {
    return <div className="text-gray-500">Loading health summary...</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <Card
        title="Latest HbA1c"
        value={hba1c}
        unit="%"
        icon={<Droplet className="text-red-500" size={18} />}
        color="bg-red-100"
        description={hba1c > 7 ? "Above target" : ""}
      />
      <Card
        title="Fasting Sugar"
        value={bloodSugar}
        unit="mg/dL"
        icon={<Flame className="text-blue-500" size={18} />}
        color="bg-blue-100"
      />
      <Card
        title="Total Cholesterol"
        value={cholesterol}
        unit="mg/dL"
        icon={<HeartPulse className="text-purple-500" size={18} />}
        color="bg-purple-100"
      />
      <Card
        title="Type"
        value={diabetesType}
        icon={<Syringe className="text-orange-500" size={18} />}
        color="bg-orange-100"
        description={insulinDependent ? "Insulin dependent" : ""}
      />
    </div>
  );
};

export default HealthSummary;
