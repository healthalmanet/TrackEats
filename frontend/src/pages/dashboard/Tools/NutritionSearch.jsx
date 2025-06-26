import React, { useState } from 'react';
import { Search } from 'lucide-react';

const FoodNutritionApp = () => {
  const [searchQuery, setSearchQuery] = useState('apple');
  const [selectedFood, setSelectedFood] = useState('apple');

  // Sample food data
  const foodData = {
    apple: {
      name: 'Apple',
      calories: 52,
      carbs: { total: 14, sugars: 10 },
      protein: 0.3,
      fat: { total: 0.2, saturated: 0.1 },
      vitamins: {
        'Vitamin C': { amount: '4.6mg', percentage: 15 },
        'Vitamin A': { amount: '54IU', percentage: 8 }
      },
      minerals: {
        'Potassium': { amount: '107mg', percentage: 25 },
        'Calcium': { amount: '6mg', percentage: 5 }
      }
    },
    banana: {
      name: 'Banana',
      calories: 89,
      carbs: { total: 23, sugars: 12 },
      protein: 1.1,
      fat: { total: 0.3, saturated: 0.1 },
      vitamins: {
        'Vitamin C': { amount: '8.7mg', percentage: 29 },
        'Vitamin B6': { amount: '0.4mg', percentage: 20 }
      },
      minerals: {
        'Potassium': { amount: '358mg', percentage: 85 },
        'Magnesium': { amount: '27mg', percentage: 18 }
      }
    },
    'chicken breast': {
      name: 'Chicken Breast',
      calories: 165,
      carbs: { total: 0, sugars: 0 },
      protein: 31,
      fat: { total: 3.6, saturated: 1.0 },
      vitamins: {
        'Vitamin B6': { amount: '0.9mg', percentage: 45 },
        'Niacin': { amount: '14.8mg', percentage: 92 }
      },
      minerals: {
        'Phosphorus': { amount: '228mg', percentage: 65 },
        'Selenium': { amount: '27.6mcg', percentage: 95 }
      }
    },
    avocado: {
      name: 'Avocado',
      calories: 160,
      carbs: { total: 9, sugars: 0.7 },
      protein: 2,
      fat: { total: 15, saturated: 2.1 },
      vitamins: {
        'Vitamin K': { amount: '21mcg', percentage: 70 },
        'Folate': { amount: '81mcg', percentage: 40 }
      },
      minerals: {
        'Potassium': { amount: '485mg', percentage: 95 },
        'Magnesium': { amount: '29mg', percentage: 22 }
      }
    },
    quinoa: {
      name: 'Quinoa',
      calories: 120,
      carbs: { total: 22, sugars: 0.9 },
      protein: 4.4,
      fat: { total: 1.9, saturated: 0.2 },
      vitamins: {
        'Folate': { amount: '42mcg', percentage: 21 },
        'Vitamin E': { amount: '0.6mg', percentage: 12 }
      },
      minerals: {
        'Manganese': { amount: '0.6mg', percentage: 85 },
        'Phosphorus': { amount: '152mg', percentage: 43 }
      }
    },
    salmon: {
      name: 'Salmon',
      calories: 208,
      carbs: { total: 0, sugars: 0 },
      protein: 25,
      fat: { total: 12, saturated: 1.9 },
      vitamins: {
        'Vitamin D': { amount: '360IU', percentage: 90 },
        'Vitamin B12': { amount: '2.8mcg', percentage: 100 }
      },
      minerals: {
        'Selenium': { amount: '36.5mcg', percentage: 100 },
        'Phosphorus': { amount: '252mg', percentage: 72 }
      }
    }
  };

  const quickSearch = ['banana', 'chicken breast', 'avocado', 'quinoa', 'salmon'];

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const query = searchQuery.toLowerCase();
    if (foodData[query]) {
      setSelectedFood(query);
    }
  };

  const handleQuickSelect = (food) => {
    setSelectedFood(food);
    setSearchQuery(food);
  };

  const currentFood = foodData[selectedFood] || foodData.apple;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Discover Food <span className="text-green-500">Nutrition</span>
          </h1>
          <p className="text-gray-600 text-lg">
            Search any food item and get detailed nutritional information instantly
          </p>
        </div>

        {/* Search Section */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
              placeholder="apple"
              className="w-full px-4 py-3 pr-12 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-2 bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors"
            >
              <Search size={20} />
            </button>
          </div>

          {/* Quick Search Tags */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {quickSearch.map((food) => (
              <button
                key={food}
                onClick={() => handleQuickSelect(food)}
                className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm hover:bg-gray-50 transition-colors capitalize flex items-center gap-1"
              >
                <span className="text-lg">
                  {food === 'banana' ? '🍌' : 
                   food === 'chicken breast' ? '🍗' : 
                   food === 'avocado' ? '🥑' : 
                   food === 'quinoa' ? '🌾' : 
                   food === 'salmon' ? '🐟' : '🍎'}
                </span>
                {food.charAt(0).toUpperCase() + food.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Food Info Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-2xl">🍎</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{currentFood.name}</h2>
                <p className="text-gray-600">Per 100 grams</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-500">{currentFood.calories}</div>
              <div className="text-gray-600">calories</div>
            </div>
          </div>

          {/* Macronutrients */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Carbohydrates */}
            <div className="bg-green-500 text-white p-4 rounded-xl">
              <div className="text-sm font-medium mb-1">Carbohydrates</div>
              <div className="text-2xl font-bold mb-1">{currentFood.carbs.total}g</div>
              <div className="text-xs opacity-90">of which sugars: {currentFood.carbs.sugars}g</div>
            </div>

            {/* Protein */}
            <div className="bg-orange-400 text-white p-4 rounded-xl">
              <div className="text-sm font-medium mb-1">Protein</div>
              <div className="text-2xl font-bold mb-1">{currentFood.protein}g</div>
              <div className="text-xs opacity-90">Essential amino acids</div>
            </div>

            {/* Fat */}
            <div className="bg-red-400 text-white p-4 rounded-xl">
              <div className="text-sm font-medium mb-1">Fat</div>
              <div className="text-2xl font-bold mb-1">{currentFood.fat.total}g</div>
              <div className="text-xs opacity-90">Saturated: {currentFood.fat.saturated}g</div>
            </div>
          </div>

          {/* Vitamins and Minerals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Vitamins */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900">Vitamins</h3>
              </div>
              <div className="space-y-4">
                {Object.entries(currentFood.vitamins).map(([vitamin, data]) => (
                  <React.Fragment key={vitamin}>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm sm:text-base">{vitamin}</span>
                        <span className="font-semibold text-green-600 text-sm sm:text-base">{data.amount}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${Math.min(data.percentage, 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 text-right">
                        {data.percentage}% DV
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Minerals */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900">Minerals</h3>
              </div>
              <div className="space-y-4">
                {Object.entries(currentFood.minerals).map(([mineral, data]) => (
                  <React.Fragment key={mineral}>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm sm:text-base">{mineral}</span>
                        <span className="font-semibold text-orange-600 text-sm sm:text-base">{data.amount}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${Math.min(data.percentage, 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 text-right">
                        {data.percentage}% DV
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 


export default FoodNutritionApp;




