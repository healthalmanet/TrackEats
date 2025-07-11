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
    <section className="w-full bg-white px-6 sm:px-12 py-16 font-['Poppins'] animate-fade-in-up">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-center text-2xl sm:text-3xl font-bold text-[#FF7043] drop-shadow-sm">Quick Meal Logger</h2>
          <p className="text-sm text-[#546E7A] mt-1 font-medium">
            Track your nutrition smartly & simply
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Form */}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await handleSubmit(e);
              if (onMealLogged) onMealLogged();
            }}
            className="bg-gray-100 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all border border-[#ECEFF1]"
          >
            <div className="flex items-center gap-2 mb-6 text-[#FF7043]">
              <FaUtensils size={20} />
              <h3 className="text-xl font-semibold">Add a Meal</h3>
            </div>

            {foodInputs.map((item, index) => (
              <div
                key={index}
                className="mb-4 space-y-2 bg-white/60 p-4 rounded-lg border border-[#ECEFF1]"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleFoodChange(index, 'name', e.target.value)}
                    placeholder={`Food ${index + 1}`}
                    className="flex-1 border border-[#DDD] bg-white text-[#263238] rounded-md px-3 py-2 text-sm placeholder-gray-400"
                    required
                  />
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleFoodChange(index, 'quantity', e.target.value)}
                    placeholder="Qty"
                    className="w-20 border border-[#DDD] bg-white text-[#263238] rounded-md px-2 py-2 text-sm"
                  />
                  <select
                    value={item.unit}
                    onChange={(e) => handleFoodChange(index, 'unit', e.target.value)}
                    className="border border-[#DDD] bg-white text-[#263238] rounded-md px-2 py-2 text-sm"
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
                      className="text-red-500 text-xs px-2 py-1 border border-red-400 rounded hover:bg-red-100"
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
                  className="w-full border border-[#DDD] bg-white text-[#263238] rounded-md px-3 py-2 text-sm placeholder-gray-400"
                />

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="date"
                    value={item.date || calendarDate}
                    onChange={(e) => handleFoodChange(index, 'date', e.target.value)}
                    className="flex-1 border border-[#DDD] bg-white text-[#263238] rounded-md px-3 py-2 text-sm"
                  />
                  <input
                    type="time"
                    value={item.consumed_at}
                    onChange={(e) => handleFoodChange(index, 'consumed_at', e.target.value)}
                    className="flex-1 border border-[#DDD] bg-white text-[#263238] rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addFoodField}
              className="mb-6 text-[#FF7043] text-sm font-medium hover:underline"
            >
              + Add Another Food
            </button>

            <div className="mb-6">
              <label className="block text-sm mb-1 text-[#546E7A]">Meal Type</label>
              <div className="flex gap-4">
                {['breakfast', 'lunch', 'dinner'].map((type) => (
                  <label
                    key={type}
                    className={`px-3 py-1 rounded-full text-sm cursor-pointer border transition-all duration-200 ${
                      mealType === type
                        ? 'bg-[#FF7043] text-white border-[#F4511E]'
                        : 'border-[#DDD] text-[#546E7A]'
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
                className="w-full sm:w-3/5 bg-[#FF7043] text-white hover:bg-[#F4511E] px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
              >
                + Add Food
              </button>
            </div>
          </form>

          {/* Logged Meals */}
          <div className="bg-gray-100 rounded-2xl p-6 border border-[#ECEFF1] shadow-md hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-4 text-[#263238]">
              Logged Meals
            </h3>

            {loggedMeals.length === 0 ? (
              <p className="text-sm text-[#546E7A]">No meals logged yet.</p>
            ) : (
              <ul className="space-y-3">
                {loggedMeals.map((meal) => (
                  <li
                    key={meal._id}
                    className="relative group bg-white/60 px-4 py-3 rounded-md border border-[#ECEFF1] hover:shadow-md transition text-sm text-[#263238]"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-semibold text-[#FF7043]">{meal.food_name}</span>
                        <div className="text-[#546E7A] text-xs mt-1">
                          🍽️ {meal.meal_type || 'Meal'} · {meal.quantity} {meal.unit}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteMeal(meal._id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>

                    <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 w-72 opacity-0 group-hover:opacity-100 transition duration-200 z-20">
                      <div className="bg-white border border-[#ECEFF1] rounded-lg shadow-lg p-4 text-sm text-[#263238]">
                        <h4 className="font-semibold mb-1">{meal.food_name}</h4>
                        <p className="text-[#546E7A]">
                          {meal.quantity} {meal.unit} • {meal.meal_type}
                        </p>
                        <p className="text-gray-500 mt-1">
                          📅 {meal.date || 'N/A'} <br /> ⏰ {meal.consumed_at || 'N/A'}
                        </p>
                        {meal.remark && (
                          <p className="mt-2 italic text-[#F4511E]">“{meal.remark}”</p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center mt-6 items-center gap-2 flex-wrap">
                <button
                  onClick={handlePrevPage}
                  disabled={!pagination.previous}
                  className={`px-3 py-1 text-sm rounded-md border ${
                    !pagination.previous
                      ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                      : 'bg-white text-[#263238] border-[#ECEFF1] hover:bg-[#FAF3EB]'
                  }`}
                >
                  ←
                </button>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  const isCurrent = pageNum === currentPage;
                  const pageUrl = `https://trackeats.onrender.com/api/logmeals/?page=${pageNum}`;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageUrl)}
                      className={`px-3 py-1 text-sm rounded-md border ${
                        isCurrent
                          ? 'bg-[#FF7043] text-white border-[#F4511E] font-semibold'
                          : 'bg-white text-[#263238] border-[#ECEFF1] hover:bg-[#FAF3EB]'
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
                      ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                      : 'bg-white text-[#263238] border-[#ECEFF1] hover:bg-[#FAF3EB]'
                  }`}
                >
                  →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuickMealLogger;
