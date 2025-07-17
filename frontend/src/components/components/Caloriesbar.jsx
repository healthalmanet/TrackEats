import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

// --- Themed CalorieProgressBar Component ---
const CalorieProgressBar = ({ 
  currentCalories = 0, 
  targetCalories = 2000, 
  title = "Progress"
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  // Calculate progress and state
  const progressPercentage = targetCalories > 0 ? Math.min((currentCalories / targetCalories) * 100, 100) : 0;
  const isOverTarget = currentCalories > targetCalories;
  const remainingCalories = targetCalories - currentCalories;
  
  useEffect(() => {
    // Animate the bar on change
    const timer = setTimeout(() => {
      setAnimatedProgress(progressPercentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [progressPercentage]);

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(Math.round(num));
  };

  return (
    <div className="w-full max-w-md mx-auto font-['Poppins']">
      {/* Card now uses theme's section colors */}
      <div className="bg-section border border-custom rounded-2xl p-4 sm:p-6 shadow-soft">
        
        {/* Header with themed text */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-heading font-semibold text-base sm:text-lg">
            {title}
          </h3>
          <div className="text-heading font-medium text-sm sm:text-base">
            <span className="font-bold">{formatNumber(currentCalories)}</span>
            <span className="text-body"> / {formatNumber(targetCalories)} cal</span>
          </div>
        </div>

        {/* Progress Bar with themed track and fill */}
        <div className="mb-4">
          <div className="w-full bg-light rounded-full h-3 sm:h-4 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out ${isOverTarget ? 'bg-red' : 'bg-primary'}`}
              style={{ 
                width: `${animatedProgress}%`,
                boxShadow: isOverTarget ? '0 0 8px var(--color-accent-red)' : 'none'
              }}
            />
          </div>
        </div>

        {/* Status Text (Percentage) with themed colors */}
        <div className="text-center mb-2">
          <span className={`text-base sm:text-lg font-bold ${isOverTarget ? 'text-red' : 'text-primary'}`}>
            {Math.round(progressPercentage)}% Complete
          </span>
        </div>

        {/* Improved Status/Warning Message */}
        <div className="text-center text-body text-sm sm:text-base">
          {isOverTarget ? (
            <div className="flex items-center justify-center gap-2 text-red font-medium">
              <AlertTriangle className="w-4 h-4 text-red flex-shrink-0" />
              <span>
                <span className="font-semibold">{formatNumber(currentCalories - targetCalories)}</span> calories over target
              </span>
            </div>
          ) : (
            <span>
              <span className="font-semibold text-heading">{formatNumber(remainingCalories)}</span> calories remaining
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Parent Demo Component (also themed) ---
const CalorieProgress = () => {
  const [calorieData, setCalorieData] = useState({
    current: 1200,
    target: 1995
  });

  // Example data scenarios to cycle through
  const simulateDataUpdate = () => {
    const scenarios = [
      { current: 800, target: 1995 },
      { current: 1995, target: 1995 },
      { current: 2500, target: 1995 },
      { current: 434, target: 1995 },
    ];
    const currentIndex = scenarios.findIndex(s => s.current === calorieData.current);
    const nextIndex = (currentIndex + 1) % scenarios.length;
    setCalorieData(scenarios[nextIndex]);
  };

  return (
    <div className="min-h-screen bg-main p-4 sm:p-8 font-['Poppins']">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-['Lora'] font-bold text-heading mb-2">
            Daily Calorie Progress
          </h1>
          <p className="text-body mb-6">A visual summary of your energy intake.</p>
        </div>

        <CalorieProgressBar 
          currentCalories={calorieData.current}
          targetCalories={calorieData.target}
          title="Today's Calories"
        />

        {/* Added a button to demonstrate the component's different states */}
        <div className="text-center">
          <button
            onClick={simulateDataUpdate}
            className="bg-primary text-light font-semibold px-6 py-2 rounded-lg shadow-soft hover:bg-primary-hover transition-all transform hover:scale-105"
          >
            Simulate Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalorieProgress;