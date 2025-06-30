import React from 'react';
import { FaUtensils, FaTrash } from 'react-icons/fa';
import useMealLogger from './UseMealLogger';

const QuickMealLogger = ({ onMealLogged }) => {
  const {
    foodInputs,
    handleFoodChange,
    addFoodField,
    removeFoodField,
    calendarDate,
    unitOptions,
    mealType,
    setMealType,
    handleSubmit,
    loggedMeals,
    handleDeleteMeal,
    handlePageChange,
    handlePrevPage,
    pagination,
  } = useMealLogger();

  const extractPageNumber = (url) => {
    if (!url) return 1;
    const match = url.match(/page=(\d+)/);
    return match ? parseInt(match[1], 10) : 1;
  };

  const currentPage = pagination.currentPageUrl
    ? extractPageNumber(pagination.currentPageUrl)
    : 1;

  const totalPages = Math.ceil(pagination.count / 5);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pt-10 pb-20 bg-white">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-800">Quick Meal Logger</h2>
        <p className="text-sm font-semibold text-gray-500 mt-1">
          Track your nutrition smartly & simply
        </p>
      </div>

      <div className="mx-auto w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form Section */}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await handleSubmit(e);
            if (onMealLogged) onMealLogged(); // ✅ Trigger parent update
          }}
          className="bg-gray-50 rounded-2xl p-6 border border-gray-200 shadow"
        >
          <div className="flex items-center gap-2 mb-6">
            <FaUtensils className="text-green-500" />
            <h3 className="text-xl font-semibold text-gray-700">Add a Meal</h3>
          </div>

          {foodInputs.map((item, index) => (
            <div key={index} className="mb-4 space-y-2 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleFoodChange(index, 'name', e.target.value)}
                  placeholder={`Food ${index + 1}`}
                  className="flex-1 border border-gray-300 bg-white rounded-md px-3 py-2 text-sm"
                  required
                />
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleFoodChange(index, 'quantity', e.target.value)}
                  placeholder="Qty"
                  className="w-20 border border-gray-300 bg-white rounded-md px-2 py-2 text-sm"
                />
                <select
                  value={item.unit}
                  onChange={(e) => handleFoodChange(index, 'unit', e.target.value)}
                  className="border border-gray-300 bg-white rounded-md px-2 py-2 text-sm"
                >
                  <option value="">Unit</option>
                  {unitOptions.map((unit) => (
                    <option key={unit} value={unit}>{unit}</option>
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
                className="w-full border border-gray-300 bg-white rounded-md px-3 py-2 text-sm"
              />

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="date"
                  value={item.date || calendarDate}
                  onChange={(e) => handleFoodChange(index, 'date', e.target.value)}
                  className="flex-1 border border-gray-300 bg-white rounded-md px-3 py-2 text-sm"
                />
                <input
                  type="time"
                  value={item.consumed_at}
                  onChange={(e) => handleFoodChange(index, 'consumed_at', e.target.value)}
                  className="flex-1 border border-gray-300 bg-white rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addFoodField}
            className="mb-6 text-green-600 text-sm font-medium hover:underline"
          >
            + Add Another Food
          </button>

          <div className="mb-6">
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

          <div className="flex justify-center">
            <button
              type="submit"
              className="w-full sm:w-3/5 bg-[#00bd00] hover:bg-[#00e62a] text-white px-6 py-3 rounded-md text-sm font-semibold"
            >
              + Add Food
            </button>
          </div>
        </form>

        {/* Logged Meals Section */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Meals on {calendarDate}</h3>

          {loggedMeals.length === 0 ? (
            <p className="text-sm text-gray-500">No meals logged yet.</p>
          ) : (
            <ul className="space-y-3">
              {loggedMeals.map((meal) => (
                <li
                  key={meal._id}
                  className="relative group bg-white px-4 py-3 rounded-md border border-gray-100 hover:shadow transition text-sm"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">{meal.food_name}</span>
                      <div className="text-gray-600 text-xs mt-0.5">
                        🍽️ {meal.meal_type || 'Meal'} · {meal.quantity} {meal.unit}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteMeal(meal._id)}
                      className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </div>

                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-72 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition duration-200 z-20">
                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-sm">
                      <h4 className="font-semibold text-gray-700 mb-1">{meal.food_name}</h4>
                      <p className="text-gray-600">
                        {meal.quantity} {meal.unit} • {meal.meal_type}
                      </p>
                      <p className="text-gray-500 mt-1">
                        📅 {meal.date || 'N/A'} <br /> ⏰ {meal.consumed_at || 'N/A'}
                      </p>
                      {meal.remark && (
                        <p className="mt-2 italic text-blue-500">“{meal.remark}”</p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 items-center gap-2 flex-wrap">
              <button
                onClick={handlePrevPage}
                disabled={!pagination.previous}
                className={`px-3 py-1 text-sm rounded-md border ${
                  !pagination.previous
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                ←
              </button>

              {Array.from({ length: totalPages }, (_, index) => {
                const pageNum = index + 1;
                const isCurrent = pageNum === currentPage;
                const pageUrl = `https://trackeats.onrender.com/api/logmeals/?page=${pageNum}`;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageUrl)}
                    className={`px-3 py-1 text-sm rounded-md border ${
                      isCurrent
                        ? 'bg-green-100 text-green-700 border-green-300 font-semibold'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={handlePageChange}
                disabled={!pagination.next}
                className={`px-3 py-1 text-sm rounded-md border ${
                  !pagination.next
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickMealLogger;
