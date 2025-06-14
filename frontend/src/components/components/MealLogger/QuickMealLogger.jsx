import React from 'react';
import { FaUtensils } from 'react-icons/fa';
import useMealLogger from './UseMealLogger';

const QuickMealLogger = () => {
  const {
    foodInputs,
    handleFoodChange,
    addFoodField,
    removeFoodField,
    calendarDate,
    setCalendarDate,
    selectedDate,
    setSelectedDate,
    weekDates,
    unitOptions,
    mealType,
    setMealType,
    handleSubmit,
    loggedMeals,
  } = useMealLogger();

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pt-10">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-800">Quick Meal Logger</h2>
        <p className="text-sm text-gray-500 mt-1">Track your nutrition smartly & simply</p>
      </div>

      <div className="mx-auto w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Meal Logger Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-slate-50 rounded-xl p-6 border border-gray-200"
        >
          <div className="flex items-center gap-2 mb-6">
            <FaUtensils className="text-green-500" />
            <h3 className="text-xl font-semibold text-gray-700">Add a Meal</h3>
          </div>

          {foodInputs.map((item, index) => (
            <div
              key={index}
              className="mb-4 space-y-2 bg-white p-3 rounded-md shadow-sm border border-gray-100"
            >
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleFoodChange(index, 'name', e.target.value)}
                  placeholder={`Food ${index + 1}`}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-green-200"
                  required
                />
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleFoodChange(index, 'quantity', e.target.value)}
                  placeholder="Qty"
                  className="w-20 border border-gray-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring focus:ring-green-200"
                />
                <select
                  value={item.unit}
                  onChange={(e) => handleFoodChange(index, 'unit', e.target.value)}
                  className="border border-gray-300 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring focus:ring-green-200"
                >
                  <option value="">Unit</option>
                  {unitOptions.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
                {foodInputs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFoodField(index)}
                    className="text-red-500 text-xs px-2 py-1 border border-red-200 rounded hover:bg-red-50"
                  >
                    Remove
                  </button>
                )}
              </div>
              <input
                type="text"
                value={item.remark}
                onChange={(e) => handleFoodChange(index, 'remark', e.target.value)}
                placeholder="Remark (optional)"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-green-200"
              />
            </div>
          ))}

          <button
            type="button"
            onClick={addFoodField}
            className="mb-6 text-green-500 text-sm font-medium hover:underline"
          >
            + Add Another Food
          </button>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Meal Type</label>
            <div className="flex gap-4">
              {['breakfast', 'lunch', 'dinner'].map((type) => (
                <label
                  key={type}
                  className={`px-3 py-1 rounded-full text-sm cursor-pointer border ${
                    mealType === type
                      ? 'bg-green-100 text-green-800 border-green-300'
                      : 'border-gray-300 text-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="mealType"
                    value={type}
                    checked={mealType === type}
                    onChange={() => setMealType(type)}
                    className="hidden"
                  />
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
            <input
              type="date"
              value={calendarDate}
              onChange={(e) => setCalendarDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-green-200"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Day</label>
            <div className="flex flex-wrap gap-2">
              {weekDates.map((d) => (
                <label
                  key={d.date}
                  className={`px-3 py-1 rounded-full text-sm cursor-pointer border ${
                    selectedDate === d.date
                      ? 'bg-green-100 text-green-800 border-green-300'
                      : 'border-gray-300 text-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="day"
                    value={d.date}
                    checked={selectedDate === d.date}
                    onChange={() => setSelectedDate(d.date)}
                    className="hidden"
                  />
                  {d.day}
                </label>
              ))}
            </div>
          </div>

          {/* ✅ Add Food Button Centered and Styled */}
          <div className="mb-2 flex justify-center">
            <button
              type="submit"
              className="w-full sm:w-3/5 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-md text-sm font-semibold transition duration-200"
            >
              + Add Food
            </button>
          </div>
        </form>

        {/* Meals Display Card */}
        <div className="bg-slate-50 rounded-xl p-6 border border-gray-200 max-h-[600px] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Meals on {calendarDate}</h3>
          {loggedMeals.length === 0 ? (
            <p className="text-sm text-gray-500">No meals logged yet.</p>
          ) : (
            <ul className="space-y-4">
              {loggedMeals.map((meal, index) => (
                <li
                  key={index}
                  className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-gray-800">{meal.food}</h4>
                    <span className="text-sm text-green-500">
                      {meal.nutrition?.calories || 0} cal
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {meal.quantity} {meal.unit} · {meal.mealType} · {meal.timestamp}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Protein: {meal.nutrition?.protein || 0}g | Carbs: {meal.nutrition?.carbs || 0}g | Fat: {meal.nutrition?.fat || 0}g
                  </p>
                  {meal.remark && (
                    <p className="text-xs italic text-gray-400 mt-1">Note: {meal.remark}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickMealLogger;
