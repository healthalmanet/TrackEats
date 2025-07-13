import React, { useState } from 'react';
import { searchFoodNutrition } from '../../../api/nutritionApi'; // Ensure this path is correct

// Lucide icons
import {
  Search,
  Loader,
  ClipboardList,
  AlertTriangle,
  Info,
  Flame,
  Beef,
  Wheat,
  Droplets,
  Vegan,
  Drumstick,
  ListOrdered,
  Sparkles
} from "lucide-react";

const NutritionSearch = () => {
  const [foodItem, setFoodItem] = useState('');
  const [nutritionData, setNutritionData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchInitiated, setSearchInitiated] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setNutritionData(null);
    setError(null);
    setSearchInitiated(true);

    if (!foodItem.trim()) {
      setError("Please enter a food name to search.");
      return;
    }

    setIsLoading(true);
    try {
      // Simulate a slightly longer network request for a better UX feel
      await new Promise(resolve => setTimeout(resolve, 500)); 
      const data = await searchFoodNutrition(foodItem);
      if (data && data.name) {
        setNutritionData(data);
      } else {
        setNutritionData(null);
        setError(`No detailed nutrition data found for "${foodItem}". Try another name!`);
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred. Please try again later.");
      console.error("Search error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderNutritionDetail = (label, value, unit = "") => {
    if (value === null || value === undefined || value === "" || (typeof value === 'number' && isNaN(value))) return null;
    const key = `${label.replace(/\s/g, '-')}-${value}`;
    return (
      <div key={key} className="flex justify-between items-center py-2 border-b border-dotted border-gray-200/80 last:border-b-0">
        <span className="font-medium text-gray-500 text-sm">{label}</span>
        <span className="font-semibold text-gray-800 text-sm">
          {typeof value === "number" ? value.toFixed(1) : value}
          {unit && <span className="text-gray-400 ml-1.5">{unit}</span>}
        </span>
      </div>
    );
  };

  const formatList = (list) => {
    if (!list) return <span className="text-gray-500 italic text-sm">N/A</span>;
    let items = [];
    if (typeof list === 'string') { try { items = JSON.parse(list.replace(/'/g, '"')); } catch (e) { items = [list]; } }
    else if (Array.isArray(list)) { items = list; }
    else { return <span className="text-gray-500 italic text-sm">N/A</span>; }
    if (items.length === 0) return <span className="text-gray-500 italic text-sm">None listed</span>;

    return items.map((item, index) => {
      let colorClass = 'bg-gray-100 text-gray-700 ring-gray-200';
      const lower = item.toLowerCase();
      if (lower.includes('low')) colorClass = 'bg-green-50 text-green-700 ring-green-200/80';
      else if (lower.includes('medium')) colorClass = 'bg-yellow-50 text-yellow-700 ring-yellow-200/80';
      else if (lower.includes('high')) colorClass = 'bg-red-50 text-red-700 ring-red-200/80';
      else if (lower === 'vegetarian') colorClass = 'bg-green-50 text-green-700 ring-green-200/80';
      else if (lower === 'non-vegetarian') colorClass = 'bg-red-50 text-red-700 ring-red-200/80';

      return <span key={index} className={`px-3 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${colorClass}`}>{item}</span>;
    });
  };

  // Upgraded Nutrition Card with a more modern, accent-border style
  const NutritionCard = ({ label, value, unit, icon, accentColor }) => (
    <div className={`group relative bg-white rounded-xl p-4 border border-gray-200/80 shadow-sm
                     transform-gpu transition-all duration-300 ease-in-out
                     hover:shadow-lg hover:-translate-y-1.5`}>
        {/* Subtle glowing accent border on top */}
        <div className={`absolute top-0 left-0 h-1 w-full rounded-t-xl opacity-70 group-hover:opacity-100 transition-opacity ${accentColor} `} />

      <div className="flex justify-between items-start mb-2">
        <span className="font-semibold text-sm text-gray-700">{label}</span>
        {icon && React.cloneElement(icon, { className: `text-2xl text-gray-400 transition-colors group-hover:text-transparent group-hover:bg-clip-text group-hover:${accentColor}` })}
      </div>
      <div>
        <span className={`text-4xl font-bold text-transparent bg-clip-text ${accentColor}`}>
          {typeof value === 'number' ? value.toFixed(value < 10 ? 1 : 0) : value || '0'}
        </span>
        <span className="text-sm font-medium text-gray-500 ml-1.5">{unit}</span>
      </div>
    </div>
  );

  return (
    // Added a subtle radial gradient to the background
    <div className="max-w-4xl mx-auto my-10 p-4 sm:p-6 bg-gray-50 rounded-2xl shadow-xl border border-gray-100/50 text-center animate-fade-in-up">
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-8 flex items-center justify-center gap-3 bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
        <ClipboardList className="text-orange-500" />
        Nutrition Insights
      </h1>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-8 justify-center items-center">
        <div className="relative w-full max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={foodItem}
            placeholder="e.g., Quinoa, Almonds, Salmon Fillet"
            onChange={(e) => setFoodItem(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 bg-white text-gray-800 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 focus:border-orange-500
                       transition-all duration-300 placeholder:text-gray-400 shadow-sm"
          />
        </div>
        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-semibold rounded-lg shadow-md
                     hover:shadow-lg hover:shadow-orange-500/40 hover:-translate-y-0.5
                     active:scale-[0.98]
                     transform transition-all duration-200
                     flex items-center justify-center gap-2
                     disabled:opacity-60 disabled:from-gray-500 disabled:to-gray-400 disabled:shadow-none disabled:transform-none"
          disabled={isLoading}
        >
          {isLoading ? <Loader className="animate-spin" /> : <Search size={18} />}
          <span>{isLoading ? "Searching..." : "Search"}</span>
        </button>
      </form>

      {/* --- Status Messages --- */}
      {isLoading && (
        <div className="p-4 rounded-lg mt-4 text-base font-medium text-blue-800 bg-blue-100/70 flex items-center justify-center gap-3">
          <Loader className="animate-spin text-xl" /> Loading nutrition data...
        </div>
      )}
      {error && (
        <div className="p-4 rounded-lg mt-4 text-base font-medium text-red-800 bg-red-100/70 flex items-center justify-center gap-3 animate-shake">

          <AlertTriangle className="text-xl" /> {error}
        </div>
      )}
      {!searchInitiated && !isLoading && !error && (
        <div className="p-4 rounded-lg mt-4 text-base font-medium text-green-800 bg-green-100/70 flex items-center justify-center gap-3 animate-fade-in">
          <Info className="text-xl" /> Enter a food name to discover its nutritional value.
        </div>
      )}

      {/* --- Nutrition Data Display --- */}
      {nutritionData && (
        <div className="text-left mt-6 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4 pb-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              {nutritionData.name || "Unknown Food"}
              {nutritionData.food_type?.toLowerCase() === 'vegetarian'
                ? <Vegan className="text-green-600" title="Vegetarian" />
                : <Drumstick className="text-red-600" title="Non-Vegetarian" />
              }
            </h2>
            <p className="text-gray-500 font-medium text-sm sm:text-base">
              Serving: <span className="font-semibold text-gray-700">{nutritionData.default_quantity} {nutritionData.default_unit}</span> (
              <span className="font-semibold text-gray-700">{nutritionData.gram_equivalent?.toFixed(0) || "N/A"}g</span>)
            </p>
          </div>

          <section className="macro-nutrients my-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2"><Flame size={20} className="text-orange-500" /> Key Nutrients</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <NutritionCard label="Calories" value={nutritionData.calories} unit="kcal" icon={<Flame />} accentColor="bg-gradient-to-r from-red-500 to-orange-500" />
              <NutritionCard label="Protein" value={nutritionData.protein} unit="g" icon={<Beef />} accentColor="bg-gradient-to-r from-green-500 to-emerald-500" />
              <NutritionCard label="Carbs" value={nutritionData.carbs} unit="g" icon={<Wheat />} accentColor="bg-gradient-to-r from-blue-500 to-sky-500" />
              <NutritionCard label="Fats" value={nutritionData.fats} unit="g" icon={<Droplets />} accentColor="bg-gradient-to-r from-purple-500 to-indigo-500" />
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 mt-6">
            <section>
              <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2"><ListOrdered size={20} className="text-orange-500" /> Detailed Breakdown</h3>
              <div className="space-y-1 bg-white p-4 rounded-lg border border-gray-200/80 shadow-sm">
                {renderNutritionDetail("Sugar", nutritionData.sugar, "g")}
                {renderNutritionDetail("Fiber", nutritionData.fiber, "g")}
                {renderNutritionDetail("Saturated Fat", nutritionData.saturated_fat_g, "g")}
                {/* ... Add other details back here ... */}
                {renderNutritionDetail("Cholesterol", nutritionData.cholesterol_mg, "mg")}
                {renderNutritionDetail("Sodium", nutritionData.sodium_mg, "mg")}
                {renderNutritionDetail("Potassium", nutritionData.potassium_mg, "mg")}
              </div>
            </section>
            <section>
              <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2"><Sparkles size={20} className="text-orange-500" /> Additional Insights</h3>
              <div className="space-y-4 bg-white p-4 rounded-lg border border-gray-200/80 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <span className="font-semibold text-gray-600 text-sm min-w-[100px]">Meal Types:</span>
                  <div className="flex flex-wrap gap-2">{formatList(nutritionData.meal_type)}</div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <span className="font-semibold text-gray-600 text-sm min-w-[100px]">FODMAP:</span>
                  <div className="flex flex-wrap gap-2">{formatList(nutritionData.fodmap_level)}</div>
                </div>
                 {/* ... Add other insights back here ... */}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionSearch;