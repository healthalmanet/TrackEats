// src/components/NutritionSearch.jsx
import React, { useState } from 'react';
import { searchFoodNutrition } from '../../../api/nutritionApi';
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
      // `data` here will now correctly be the single food object (e.g., {id: 3, name: "sprouts paratha", ...})
      const data = await searchFoodNutrition(foodItem);
      if (data) {
        setNutritionData(data);
      } else {
        setNutritionData(null);
        setError("No food found matching your search. Try another name!");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
      console.error("Search error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderNutritionDetail = (label, value, unit = "") => {
    if (value === null || value === undefined || value === "") {
      return null;
    }
    // No change needed here, it correctly handles 0 values if they come from API
    return (
      <div className="flex justify-between pb-1 border-b border-dashed border-gray-200 last:border-b-0 sm:[&:nth-last-child(2)]:border-b-0">
        <span className="font-medium text-gray-700">{label}:</span>
        <span className="font-semibold text-primary">
          {typeof value === "number" ? value.toFixed(1) : value}
          {unit}
        </span>
      </div>
    );
  };

  const formatList = (list) => {
    if (!list) return <span className="text-gray-500">N/A</span>;
    let items = [];
    if (typeof list === 'string') {
      try {
        items = JSON.parse(list.replace(/'/g, '"'));
      } catch (e) {
        items = [list];
      }
    } else if (Array.isArray(list)) {
      items = list;
    } else {
      return <span className="text-gray-500">N/A</span>;
    }

    return items.map((item, index) => (
      <span
        key={index}
        className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap
                   ${item.toLowerCase() === 'low' ? 'bg-green-100 text-green-800' : ''}
                   ${item.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-800' : ''}
                   ${item.toLowerCase() === 'high' ? 'bg-red-100 text-red-800' : ''}
                   ${item.toLowerCase() === 'vegetarian' ? 'bg-green-500 text-white' : ''}
                   ${item.toLowerCase() === 'non-vegetarian' ? 'bg-red-500 text-white' : ''}
                   ${item.toLowerCase().includes('breakfast') ? 'bg-orange-100 text-orange-800' : ''}
                   ${item.toLowerCase().includes('lunch') ? 'bg-blue-100 text-blue-800' : ''}
                   ${item.toLowerCase().includes('dinner') ? 'bg-purple-100 text-purple-800' : ''}
                   ${item.toLowerCase().includes('gluten') ? 'bg-red-100 text-red-800' : ''}
                   ${!['low', 'medium', 'high', 'vegetarian', 'non-vegetarian', 'breakfast', 'lunch', 'dinner', 'gluten'].some(keyword => item.toLowerCase().includes(keyword)) ? 'bg-teal-100 text-teal-800' : ''}
                  `}
      >
        {item}
      </span>
    ));
  };


  return (
    <div className="max-w-4xl mx-auto my-10 p-8 bg-card-bg rounded-xl shadow-lg border border-border-light text-center">
      <h1 className="text-3xl font-extrabold text-primary mb-8">Food Nutrition Insights</h1>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 mb-10 justify-center">
        <input
          type="text"
          value={foodItem}
          placeholder="e.g., Paratha, Apple, Chicken Breast"
          onChange={(e) => setFoodItem(e.target.value)}
          className="flex-grow max-w-md px-5 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          aria-label="Search for food"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? "Searching..." : "Search Nutrition"}
        </button>
      </form>

      {isLoading && (
        <div className="p-5 rounded-lg mt-5 text-lg font-medium bg-blue-100 text-blue-700">
          Loading nutrition data...
        </div>
      )}

      {error && (
        <div className="p-5 rounded-lg mt-5 text-lg font-medium bg-red-100 text-red-700">
          {error}
        </div>
      )}

      {!searchInitiated && !isLoading && !error && (
        <div className="p-5 rounded-lg mt-5 text-lg font-medium bg-green-50 text-green-600">
          Enter a food name above to discover its nutritional value!
        </div>
      )}

      {nutritionData && (
        <div className="text-left mt-8">
          <h2 className="text-3xl font-bold text-text-dark mb-2 flex items-center gap-3">
            {nutritionData.name || "Unknown Food"}
            <span
              className={`text-xs px-3 py-1 rounded-full font-semibold uppercase text-white
                ${nutritionData.food_type?.toLowerCase() === 'vegetarian' ? 'bg-green-500' : 'bg-red-500'}
              `}
            >
              {nutritionData.food_type}
            </span>
          </h2>
          <p className="text-text-light mb-6 pb-4 border-b border-gray-200">
            Serving: {nutritionData.default_quantity}{" "}
            {nutritionData.default_unit} (
            {nutritionData.gram_equivalent?.toFixed(0) || "N/A"}g)
          </p>

          <div className="macro-nutrients">
            <h3 className="text-2xl font-semibold text-primary mt-8 mb-4 pb-2 inline-block border-b-2 border-primary">
              Key Nutrients
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
              <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200 shadow-sm flex flex-col justify-center items-center">
                <span className="text-3xl font-bold mb-1 text-[#E65100]">
                  {nutritionData.calories?.toFixed(0) || "0"}
                </span>
                <span className="text-sm text-text-light font-medium">Calories (kcal)</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200 shadow-sm flex flex-col justify-center items-center">
                <span className="text-3xl font-bold mb-1 text-[#1565C0]">
                  {nutritionData.protein?.toFixed(1) || "0"}g
                </span>
                <span className="text-sm text-text-light font-medium">Protein</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200 shadow-sm flex flex-col justify-center items-center">
                <span className="text-3xl font-bold mb-1 text-[#D32F2F]">
                  {nutritionData.carbs?.toFixed(1) || "0"}g
                </span>
                <span className="text-sm text-text-light font-medium">Carbs</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200 shadow-sm flex flex-col justify-center items-center">
                <span className="text-3xl font-bold mb-1 text-[#6A1B9A]">
                  {nutritionData.fats?.toFixed(1) || "0"}g
                </span>
                <span className="text-sm text-text-light font-medium">Fats</span>
              </div>
            </div>
          </div>

          <div className="other-nutrients">
            <h3 className="text-2xl font-semibold text-primary mt-8 mb-4 pb-2 inline-block border-b-2 border-primary">
              Detailed Breakdown
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 py-2">
              {renderNutritionDetail("Sugar", nutritionData.sugar, "g")}
              {renderNutritionDetail("Fiber", nutritionData.fiber, "g")}
              {renderNutritionDetail("Saturated Fat", nutritionData.saturated_fat_g, "g")}
              {renderNutritionDetail("Trans Fat", nutritionData.trans_fat_g, "g")}
              {renderNutritionDetail("Omega-3", nutritionData.omega_3_g, "g")}
              {renderNutritionDetail("Cholesterol", nutritionData.cholesterol_mg, "mg")}
              {renderNutritionDetail("Sodium", nutritionData.sodium_mg, "mg")}
              {renderNutritionDetail("Potassium", nutritionData.potassium_mg, "mg")}
              {renderNutritionDetail("Iron", nutritionData.iron_mg, "mg")}
              {renderNutritionDetail("Calcium", nutritionData.calcium_mg, "mg")}
              {renderNutritionDetail("Iodine", nutritionData.iodine_mcg, "mcg")}
              {renderNutritionDetail("Zinc", nutritionData.zinc_mg, "mg")}
              {renderNutritionDetail("Magnesium", nutritionData.magnesium_mg, "mg")}
              {renderNutritionDetail("Selenium", nutritionData.selenium_mcg, "mcg")}
              {renderNutritionDetail("Vitamin D", nutritionData.vitamin_d_mcg, "mcg")}
              {renderNutritionDetail("Vitamin B12", nutritionData.vitamin_b12_mcg, "mcg")}
              {renderNutritionDetail("Estimated GI", nutritionData.estimated_gi)}
              {renderNutritionDetail("Glycemic Load", nutritionData.glycemic_load)}
            </div>
          </div>

          <div className="additional-info mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-2xl font-semibold text-primary mt-8 mb-4 pb-2 inline-block border-b-2 border-primary">
              Additional Information
            </h3>
            <div className="flex flex-col gap-4">
                <div className="flex items-center flex-wrap gap-x-4 gap-y-2">
                    <span className="font-semibold text-text-dark min-w-[120px]">Meal Types:</span>
                    <div className="flex flex-wrap gap-2">
                        {formatList(nutritionData.meal_type)}
                    </div>
                </div>
                <div className="flex items-center flex-wrap gap-x-4 gap-y-2">
                    <span className="font-semibold text-text-dark min-w-[120px]">FODMAP Level:</span>
                    {formatList(nutritionData.fodmap_level)}
                </div>
                <div className="flex items-center flex-wrap gap-x-4 gap-y-2">
                    <span className="font-semibold text-text-dark min-w-[120px]">Spice Level:</span>
                    {formatList(nutritionData.spice_level)}
                </div>
                <div className="flex items-center flex-wrap gap-x-4 gap-y-2">
                    <span className="font-semibold text-text-dark min-w-[120px]">Purine Level:</span>
                    {formatList(nutritionData.purine_level)}
                </div>
                <div className="flex items-center flex-wrap gap-x-4 gap-y-2">
                    <span className="font-semibold text-text-dark min-w-[120px]">Allergens:</span>
                    <div className="flex flex-wrap gap-2">
                        {formatList(nutritionData.allergens)}
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionSearch;