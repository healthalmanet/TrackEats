import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

const CalorieProgressBar = ({ 
  currentCalories = 434348447, 
  targetCalories = 1995, 
  title = "Progress",
  showWarning = true 
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  // Calculate progress percentage
  const progressPercentage = Math.min((currentCalories / targetCalories) * 100, 100);
  const isOverTarget = currentCalories > targetCalories;
  const excessCalories = currentCalories - targetCalories;
  
 
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progressPercentage);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [progressPercentage]);

  
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 sm:p-6 shadow-sm">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-gray-700 font-medium text-base sm:text-lg">
            {title}
          </h3>
          <div className="text-gray-700 font-medium text-sm sm:text-base">
            <span className="font-semibold">{formatNumber(currentCalories)}</span>
            <span className="text-gray-500"> / {formatNumber(targetCalories)} cal</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out ${
                isOverTarget ? 'bg-red-500' : 'bg-red-400'
              }`}
              style={{ 
                width: `${animatedProgress}%`,
                boxShadow: isOverTarget ? '0 0 8px rgba(239, 68, 68, 0.5)' : 'none'
              }}
            />
          </div>
        </div>

        {/* Status Text */}
        <div className="text-center mb-2">
          <span className={`text-base sm:text-lg font-semibold ${
            isOverTarget ? 'text-red-600' : 'text-gray-700'
          }`}>
            {isOverTarget ? `${Math.round(progressPercentage)}%` : '100%'} Complete
          </span>
        </div>

        {/* Warning Message */}
        {showWarning && isOverTarget && (
          <div className="flex items-center justify-center gap-2 text-gray-600 text-sm sm:text-base">
            <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
            <span>
             <span className="font-semibold">{formatNumber(excessCalories)}</span></span>
          </div>
        )}
        
        {showWarning && !isOverTarget && (
          <div className="text-center text-gray-600 text-sm sm:text-base">
            Great job! You've reached your calorie target.
          </div>
        )}
      </div>
    </div>
  );
};


const CalorieProgress = () => {
  const [calorieData, setCalorieData] = useState({
    current: 1200,
    target: 1995
  });

   const simulateDataUpdate = () => {
    const scenarios = [
      { current: 1200, target: 1995 },
      { current: 1995, target: 1995 }, // Exact target
      { current: 2500, target: 1995 }, // Over target
      { current: 434348447, target: 1995 }, // Way over target (like your image)
      { current: 800, target: 1995 }, // Under target
    ];
    
    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    setCalorieData(randomScenario);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Calorie bar
          </h1>
          <p className="text-gray-600 mb-6">
           
          </p>
         </div>
        {/* Progress Bar Component */}
        <CalorieProgressBar 
          currentCalories={calorieData.current}
          targetCalories={calorieData.target}
        />
     </div>
    </div>
  );
};

export default CalorieProgress;