// src/components/HealthSummary.jsx (FINAL & WORKING)

import React from 'react';
import { Droplet, Flame, Zap } from 'lucide-react';

// Reusable Themed Card (This code relies on the safelist in tailwind.config.js)
const Card = ({ title, value, unit, icon, theme = 'gray', description }) => {
  const themeStyles = {
    blue: { bg: 'bg-sky-100/60', text: 'text-sky-700' },
    green: { bg: 'bg-lime-100/60', text: 'text-lime-700' },
    orange: { bg: 'bg-orange-100/60', text: 'text-orange-700' },
    gray: { bg: 'bg-slate-100/60', text: 'text-slate-700' },
  };
  const currentTheme = themeStyles[theme];

  return (
    <div className="bg-white/70 backdrop-blur-sm border border-[#ECEFF1] rounded-2xl shadow-lg p-5 flex items-start gap-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-[#FF7043]/50">
      <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-white/60 ${currentTheme.bg}`}>
        {React.cloneElement(icon, { className: `${currentTheme.text}`, size: 24 })}
      </div>
      <div>
        <h4 className="font-['Poppins'] font-semibold text-sm text-[#546E7A]">{title}</h4>
        <div className="text-3xl font-bold text-[#263238] font-['Poppins'] flex items-baseline mt-1">
          {value ?? "N/A"}
          {unit && <span className="ml-1.5 text-base font-medium text-[#546E7A] font-['Roboto']">{unit}</span>}
        </div>
        {description && <p className="text-sm font-medium text-rose-700 mt-2 bg-rose-100/60 px-2 py-0.5 rounded-md inline-block">{description}</p>}
      </div>
    </div>
  );
};

// Reusable Skeleton Loader Card
const SkeletonCard = () => (
    <div className="bg-white/50 border border-[#ECEFF1] rounded-2xl shadow-md p-5 flex items-start gap-4 animate-pulse">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0"></div>
        <div className="w-full">
            <div className="h-5 bg-gray-200 rounded-md w-3/4 mb-3"></div>
            <div className="h-9 bg-gray-300 rounded-md w-1/2"></div>
        </div>
    </div>
);


const HealthSummary = ({ data = {} }) => {
  const {
    hba1c,
    fasting_blood_sugar,
    postprandial_sugar,
  } = data;

  const isLoading = hba1c === undefined || fasting_blood_sugar === undefined || postprandial_sugar === undefined;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }
  
  const hasValues = hba1c !== null || fasting_blood_sugar !== null || postprandial_sugar !== null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
       {!hasValues ? (
        <div className="sm:col-span-2 lg:col-span-3 text-center bg-white/70 border border-dashed rounded-2xl p-10">
            <p className="font-semibold text-[#263238] text-lg">No Health Data Found</p>
            <p className="mt-2 text-sm">Click 'Add Info' to log your first health record and see your summary here.</p>
        </div>
      ) : (
      <>
        <Card
            title="Fasting Sugar"
            value={fasting_blood_sugar}
            unit="mg/dL"
            icon={<Flame />}
            theme="blue"
            description={fasting_blood_sugar > 126 ? "Considered High" : null}
        />
        <Card
            title="Post-Meal Sugar"
            value={postprandial_sugar}
            unit="mg/dL"
            icon={<Zap />}
            theme="green"
            description={postprandial_sugar > 180 ? "Considered High" : null}
        />
        <Card
            title="HbA1c"
            value={hba1c}
            unit="%"
            icon={<Droplet />}
            theme="orange"
            description={hba1c > 6.4 ? "Diabetic Range" : null}
        />
      </>
      )}
    </div>
  );
};

export default HealthSummary;