import React from "react";
import { Droplet, Flame, Zap } from "lucide-react";

// Reusable Card
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

const HealthSummary = ({ data = {} }) => {
  const {
    hba1c = null,
    fasting_blood_sugar = null,
    postprandial_sugar = null,
  } = data;

  const isEmpty =
    hba1c === null && fasting_blood_sugar === null && postprandial_sugar === null;

  if (isEmpty) {
    return <div className="text-gray-500">Loading health summary...</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <Card
        title="Fasting Blood Sugar"
        value={fasting_blood_sugar}
        unit="mg/dL"
        icon={<Flame className="text-blue-500" size={18} />}
        color="bg-blue-100"
        description={fasting_blood_sugar > 126 ? "High" : ""}
      />
      <Card
        title="Postprandial Sugar"
        value={postprandial_sugar}
        unit="mg/dL"
        icon={<Zap className="text-green-500" size={18} />}
        color="bg-green-100"
        description={postprandial_sugar > 180 ? "High after meal" : ""}
      />
      <Card
        title="HbA1c"
        value={hba1c}
        unit="%"
        icon={<Droplet className="text-red-500" size={18} />}
        color="bg-red-100"
        description={hba1c > 7 ? "Above target" : ""}
      />
    </div>
  );
};

export default HealthSummary;
