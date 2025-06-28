import React from 'react';
import useMealLogger from '../../../components/components/MealLogger/UseMealLogger';
import { Plus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { X } from 'lucide-react';


const MealLogger = () => {
  const {
    foodInputs = [],
    handleFoodChange,
    addFoodField,
    removeFoodField,
    mealType,
    setMealType,
    handleSubmit,
    unitOptions = [],
    handleQuickAdd,
    quickAddItems = [],
    dailySummary = { calories: 0, carbs: 0, protein: 0, fat: 0 },
    goals = { caloriesTarget: 2000, waterLogged: 0, waterTarget: 8 },
    loggedMeals = [],
    handleNextPage,
    handlePrevPage,
    pagination = {},
    currentPage = 1,
    handleDeleteMeal,
    searchDate,
    setSearchDate,
    searchByDate,
  } = useMealLogger();

  const mealColors = {
    breakfast: 'border-l-4 border-green-400',
    lunch: 'border-l-4 border-yellow-400',
    dinner: 'border-l-4 border-orange-400',
    snack: 'border-l-4 border-indigo-400',
  };

  const getProgressPercent = (value, target) => {
    const percent = Math.min((value / target) * 100, 100);
    return percent.toFixed(1);
  };

  return (
    <div className="bg-gray-50 min-h-screen px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">🍽️ Meal Logger</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Add Food Form */}
            <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 shadow-md space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">Add Food Item</h3>

              {foodInputs.map((input, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div>
                    <label className="text-xs text-gray-600 font-semibold mb-1 block">Food Name</label>
                    <input
                      type="text"
                      value={input.name}
                      placeholder="Search food..."
                      onChange={(e) => handleFoodChange(idx, 'name', e.target.value)}
                      className="border border-gray-300 px-3 py-2 rounded-lg w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 font-semibold mb-1 block">Unit</label>
                    <select
                      value={input.unit}
                      onChange={(e) => handleFoodChange(idx, 'unit', e.target.value)}
                      className="border border-gray-300 px-3 py-2 rounded-lg w-full"
                    >
                      <option value="">Unit</option>
                      {unitOptions.map((unit) => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 font-semibold mb-1 block">Quantity</label>
                    <input
                      type="number"
                      min={0}
                      value={input.quantity}
                      placeholder="Quantity"
                      onChange={(e) => handleFoodChange(idx, 'quantity', e.target.value)}
                      className="border border-gray-300 px-3 py-2 rounded-lg w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 font-semibold mb-1 block">Remarks</label>
                    <input
                      type="text"
                      value={input.remark}
                      placeholder="Remarks"
                      onChange={(e) => handleFoodChange(idx, 'remark', e.target.value)}
                      className="border border-gray-300 px-3 py-2 rounded-lg w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 font-semibold mb-1 block">Date</label>
                    <input
                      type="date"
                      value={input.date}
                      onChange={(e) => handleFoodChange(idx, 'date', e.target.value)}
                      className="border border-gray-300 px-3 py-2 rounded-lg w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 font-semibold mb-1 block">Time</label>
                    <input
                      type="time"
                      value={input.time}
                      onChange={(e) => handleFoodChange(idx, 'time', e.target.value)}
                      className="border border-gray-300 px-3 py-2 rounded-lg w-full"
                    />
                  </div>
                </div>
              ))}

              <div className="flex gap-3 mt-2">
                <button type="button" onClick={addFoodField} className="text-sm text-green-600 hover:underline flex items-center">
                  <Plus size={16} className="mr-1" /> Add another
                </button>
                {foodInputs.length > 1 && (
                  <button type="button" onClick={() => removeFoodField(foodInputs.length - 1)} className="text-sm text-red-500 hover:underline">
                    Remove last
                  </button>
                )}
              </div>

              <div className="flex flex-col md:flex-row gap-4 items-center mt-4">
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  className="border border-gray-300 px-3 py-2 rounded-lg w-full md:w-1/2"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>

                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold w-full md:w-auto"
                >
                  + Add Food Item
                </button>
              </div>
            </form>

            {/* Logged Meals */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Logged Meals</h3>
               <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-4">
  <label className="text-sm text-gray-700 font-sm">Search logged meals by date:</label>
  <div className="flex gap-2 w-full sm:w-auto">
   <div className="relative w-full sm:w-105">
  <input
    type="date"
    value={searchDate}
    onChange={(e) => {
      const newDate = e.target.value;
      setSearchDate(newDate);
      if (newDate === '') {
        searchByDate('');
      }
    }}
    placeholder="Search logged meals by date"
    className="border border-gray-300 px-3 py-2 rounded-lg text-sm w-full pr-10"
  />
  {searchDate && (
    <button
      type="button"
      onClick={() => {
        setSearchDate('');
        searchByDate('');
      }}
      title="Reset and show all today's meals"
      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500"
    >
      <X size={16} />
    </button>
  )}
</div>


    <button
      onClick={() => searchByDate(searchDate)}
      className="bg-green-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
    >
      Search
    </button>
  </div>
</div>

              {loggedMeals.length === 0 ? (
                <p className="text-sm text-gray-400">No meals logged yet.</p>
              ) : (
                <>
                  <ul className="space-y-4">
                    {loggedMeals.map((meal) => (
                      <li
                        key={meal.id}
                        className={`p-4 pl-5 rounded-md border bg-white shadow-sm relative ${mealColors[meal.meal_type] || 'border-l-4 border-gray-300'}`}
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="font-semibold text-gray-800 text-base">{meal.food_name}</div>
                              <button
                                onClick={() => handleDeleteMeal(meal.id)}
                                className="text-red-500 hover:text-red-600"
                                title="Remove"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                            <div className="text-sm text-gray-600 mt-0.5">
                              <span className="font-medium">{meal.quantity}</span> {meal.unit} •
                              <span className="capitalize ml-1">{meal.meal_type}</span>
                            </div>

                            {(meal.date || meal.consumed_at) && (
                              <div className="text-xs text-gray-400 mt-0.5">
                                {meal.date && <>📅 {meal.date} </>}
                                {meal.consumed_at && <>⏰ {meal.consumed_at}</>}
                              </div>
                            )}

                            {meal.remarks && (
                              <div className="text-xs text-blue-400 italic mt-1">“{meal.remarks}”</div>
                            )}
                          </div>

                          <div className="text-right min-w-[120px] mt-2 sm:mt-0">
                            {meal.calories !== undefined ? (
                              <>
                                <div className="text-sm font-semibold text-green-600">{meal.calories} cal</div>
                                <div className="text-xs text-gray-500 mt-1">
                                  <span className="text-purple-600 font-medium">{meal.protein ?? 0}g</span> P •{' '}
                                  <span className="text-yellow-600 font-medium">{meal.carbs ?? 0}g</span> C •{' '}
                                  <span className="text-pink-600 font-medium">{meal.fats ?? 0}g</span> F
                                </div>
                              </>
                            ) : (
                              <div className="text-xs text-gray-400 italic">No nutrition data</div>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Pagination */}
                  <div className="flex justify-center items-center mt-6 space-x-4">
                    <button
                      onClick={handlePrevPage}
                      disabled={!pagination.previous}
                      className={`p-2 rounded-full border ${
                        pagination.previous ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className="text-sm text-gray-500 font-medium">Page {currentPage}</span>
                    <button
                      onClick={handleNextPage}
                      disabled={!pagination.next}
                      className={`p-2 rounded-full border ${
                        pagination.next ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col items-start space-y-6">
  {/* Daily Summary (width-fit) */}
  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-md w-full">
    <h4 className="font-semibold text-sm text-gray-700 mb-3">Daily Summary</h4>
    <p className="text-xl font-bold text-green-600">{dailySummary.calories?.toFixed(1)} cal</p>
    <p className="text-xs text-gray-400 mb-3">
      {(goals.caloriesTarget ?? 0) - (dailySummary.calories ?? 0).toFixed(1)} remaining
    </p>
    <div className="space-y-4 text-sm">
      {[
        { label: 'Carbs', value: dailySummary.carbs, target: 250, color: 'bg-yellow-400' },
        { label: 'Protein', value: dailySummary.protein, target: 50, color: 'bg-orange-400' },
        { label: 'Fat', value: dailySummary.fat, target: 67, color: 'bg-green-400' },
      ].map((item) => (
        <div key={item.label}>
          <div className="flex justify-between">
            <span>{item.label}</span>
            <span>{(item.value ?? 0).toFixed(1)}g / {item.target}g</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
            <div
              className={`${item.color} h-full`}
              style={{ width: `${getProgressPercent(item.value, item.target)}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* Today's Goals */}
  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-md w-full">
    <h4 className="font-semibold text-sm text-gray-700 mb-3">Today's Goals</h4>
    <div className="text-sm space-y-2">
      <p>💧 Water: {goals?.waterLogged ?? 0}/{goals?.waterTarget ?? 0} glasses</p>
      <p>🔥 Calories: {dailySummary?.calories ?? 0}/{goals?.caloriesTarget ?? 0}</p>
    </div>
  </div>
</div>
</div>
</div>
</div>
    
  );
};

export default MealLogger;
