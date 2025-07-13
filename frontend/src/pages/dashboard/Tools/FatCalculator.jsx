import React, { useState, useEffect } from "react";
import { motion, useAnimate } from "framer-motion";
import {
  Sparkles,
  Zap,
  PersonStanding,
  Cake,
  Weight,
  Ruler,
  BarChart2,
} from "lucide-react";

// --- Custom Components for a Premium Feel ---

// A more visually appealing Number Stepper
const NumberStepper = ({ label, value, onChange, icon }) => (
  <div>
    <label className="flex items-center gap-2 font-medium text-slate-600 mb-2">
      {icon}
      {label}
    </label>
    <div className="flex items-center justify-between w-full bg-slate-100/80 rounded-lg p-1.5">
      <button
        onClick={() => onChange(value > 1 ? value - 1 : 1)}
        className="size-8 rounded-md text-slate-500 bg-white shadow-sm grid place-items-center font-bold text-xl hover:bg-slate-50 active:scale-95 transition-all"
      >
        -
      </button>
      <span className="w-20 text-center font-semibold text-lg text-slate-800">
        {value}
      </span>
      <button
        onClick={() => onChange(value + 1)}
        className="size-8 rounded-md text-slate-500 bg-white shadow-sm grid place-items-center font-bold text-xl hover:bg-slate-50 active:scale-95 transition-all"
      >
        +
      </button>
    </div>
  </div>
);

// A stylish custom Range Slider
const CustomSlider = ({ label, value, onChange, min, max, unit, icon }) => {
  const progress = ((value - min) / (max - min)) * 100;
  return (
    <div className="group">
      <label className="flex items-center justify-between font-medium text-slate-600 mb-2">
        <span className="flex items-center gap-2">
          {icon}
          {label}
        </span>
        <span className="text-sm font-semibold bg-white/70 text-cyan-700 px-2 py-0.5 rounded-md shadow-sm">
          {value} {unit}
        </span>
      </label>
      <div className="relative h-2 rounded-full bg-slate-200">
        <div
          className="absolute h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
          style={{ width: `${progress}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute w-full h-2 opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
};

export default function FatCalculator() {
  const [gender, setGender] = useState("male");
  const [height, setHeight] = useState(170);
  const [age, setAge] = useState(25);
  const [weight, setWeight] = useState(70);
  const [result, setResult] = useState(null);

  // For animating the results
  const [scope, animate] = useAnimate();

  const getFatCategory = (fatPercentage) => {
    if (gender === 'male') {
        if (fatPercentage < 6) return { category: 'Essential Fat', color: 'text-blue-400' };
        if (fatPercentage <= 13) return { category: 'Athletes', color: 'text-green-400' };
        if (fatPercentage <= 17) return { category: 'Fitness', color: 'text-emerald-400' };
        if (fatPercentage <= 24) return { category: 'Acceptable', color: 'text-yellow-400' };
        return { category: 'Obese', color: 'text-red-400' };
    } else { // female
        if (fatPercentage < 14) return { category: 'Essential Fat', color: 'text-blue-400' };
        if (fatPercentage <= 20) return { category: 'Athletes', color: 'text-green-400' };
        if (fatPercentage <= 24) return { category: 'Fitness', color: 'text-emerald-400' };
        if (fatPercentage <= 31) return { category: 'Acceptable', color: 'text-yellow-400' };
        return { category: 'Obese', color: 'text-red-400' };
    }
  };

  const calculateFat = async () => {
    const bmi = weight / Math.pow(height / 100, 2);
    let fat = 0;
    if (gender === "male") {
      fat = 1.2 * bmi + 0.23 * age - 16.2;
    } else {
      fat = 1.2 * bmi + 0.23 * age - 5.4;
    }

    const finalResult = Math.max(0, parseFloat(fat.toFixed(1)));
    setResult(finalResult);

    // Animation Trigger
    animate("#result-text", { innerText: `${finalResult}%` }, { duration: 1.5 });
    
    // Animate the gauge
    const totalCircumference = 2 * Math.PI * 45; // 2 * pi * r
    const strokeDashoffset = totalCircumference - (finalResult / 50) * totalCircumference;
    animate("#result-gauge-circle", { strokeDashoffset }, { duration: 1.5, ease: "circOut" });
  };
  
  const resultCategory = result !== null ? getFatCategory(result) : null;

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center font-sans p-4">
      {/* Glassmorphism Card */}
      <div
        ref={scope}
        className="w-full max-w-4xl bg-white/60 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/30 grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        {/* Left Section - Input */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-br from-slate-800 to-slate-600 bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles className="text-slate-500" />
            Body Fat Calculator
          </h2>

          <div>
            <label className="flex items-center gap-2 font-medium text-slate-600 mb-2">
              <PersonStanding size={20} /> Gender
            </label>
            <div className="flex gap-2">
              {["male", "female"].map((g) => (
                <button
                  key={g}
                  className={`flex-1 p-3 rounded-lg font-semibold text-sm capitalize transition-all duration-300 transform
                    ${
                      gender === g
                        ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg scale-105"
                        : "bg-slate-100/80 text-slate-700 hover:bg-slate-200/80"
                    }`}
                  onClick={() => setGender(g)}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <CustomSlider
            label="Height"
            value={height}
            onChange={setHeight}
            min={100} max={220} unit="cm"
            icon={<Ruler size={20} />}
          />

          <div className="grid grid-cols-2 gap-4">
            <NumberStepper label="Age" value={age} onChange={setAge} icon={<Cake size={20} />} />
            <NumberStepper label="Weight" value={weight} onChange={setWeight} icon={<Weight size={20} />} />
          </div>

          <button
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400
                       text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 
                       shadow-lg hover:shadow-cyan-500/50 transform transition-all duration-300
                       hover:-translate-y-1 active:scale-95"
            onClick={calculateFat}
          >
            <Zap /> Calculate Now
          </button>
        </div>

        {/* Right Section - Result */}
        <div className="flex flex-col items-center justify-center text-center bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-2xl shadow-inner-xl text-white">
          {result !== null ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-4"
            >
                <div className="relative size-40">
                  {/* Gauge */}
                   <svg className="w-full h-full" viewBox="0 0 100 100">
                     <circle cx="50" cy="50" r="45" stroke="#475569" strokeWidth="8" fill="none" />
                     <motion.circle 
                       id="result-gauge-circle"
                       cx="50" cy="50" r="45" 
                       className="text-cyan-400" stroke="currentColor"
                       strokeWidth="8" fill="none"
                       strokeLinecap="round"
                       transform="rotate(-90 50 50)"
                       style={{ strokeDasharray: 2 * Math.PI * 45, strokeDashoffset: 2 * Math.PI * 45 }}
                     />
                   </svg>
                   <div id="result-text" className="absolute inset-0 flex items-center justify-center text-4xl font-extrabold text-white">
                     0%
                   </div>
                </div>

                <motion.p className={`font-semibold text-lg ${resultCategory?.color}`}>
                  {resultCategory?.category}
                </motion.p>
                <p className="text-xs text-slate-400 max-w-xs">
                    This is an estimate of your body fat percentage. For precise measurements, consult a healthcare professional.
                </p>

            </motion.div>
          ) : (
            <div className="text-slate-400 flex flex-col items-center gap-3">
              <BarChart2 className="size-16 text-slate-500" />
              <h3 className="text-xl font-semibold text-slate-300">Awaiting Details</h3>
              <p className="text-sm">
                Your body fat estimate will be calculated and displayed here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}