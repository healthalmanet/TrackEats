import React from 'react';
import { FaUtensils, FaTrash } from 'react-icons/fa';
import useMealLogger from './UseMealLogger';

// Note: Ensure the Poppins and Roboto fonts are globally available in your project.

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

  // Logic is completely untouched
  const extractPageNumber = (url) => {
    if (!url) return 1;
    const match = url.match(/page=(\d+)/);
    return match ? parseInt(match[1], 10) : 1;
  };

  const currentPage = pagination.currentPageUrl ? extractPageNumber(pagination.currentPageUrl) : 1;
  const totalPages = Math.ceil(pagination.count / 5);

  const mealTypeMap = {
  "Early Morning Snack": "Early-Morning",
  "Breakfast": "Breakfast",
  "Mid-Morning Snack": "Mid-Morning Snack",
  "Lunch": "Lunch",
  "Afternoon Snack": "Afternoon Snack",
  "Dinner": "Dinner",
  "Bedtime": "Bedtime",
};


  return (
    // Section background is now white, default font is Roboto
    <section className="w-full bg-white px-6 sm:px-12 py-16 font-['Roboto'] animate-fade-in-up">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          {/* Heading now uses Poppins, Charcoal Gray color, and theme's text shadow */}
          <h2 className="text-center text-2xl sm:text-3xl font-bold text-[#263238] font-['Poppins']" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.1)' }}>
            Quick Meal Logger
          </h2>
          {/* Subtitle text is larger and uses Roboto for consistency */}
          <p className="text-lg text-[#546E7A] mt-2">
            Track your nutrition smartly & simply
          </p>
        </div>

        {/* The original 2-column layout is preserved */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative overflow-visible z-10">

          
          {/* Form Card: Redesigned with the light beige tint and theme effects */}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await handleSubmit(e);
              if (onMealLogged) onMealLogged();
            }}
            className="bg-[#FFFDF9] rounded-xl p-6 shadow-md transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 border border-[#ECEFF1]"
          >
            <div className="flex items-center gap-3 mb-6">
              {/* Themed icon and Poppins heading */}
              <FaUtensils size={24} className="text-[#FF7043]" />
              <h3 className="text-xl font-semibold text-[#263238] font-['Poppins']">Add a Meal</h3>
            </div>

            {foodInputs.map((item, index) => (
              <div key={index} className="mb-4 space-y-3 bg-white p-4 rounded-lg border border-[#ECEFF1]">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Inputs now use consistent theme styling with focus states */}
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleFoodChange(index, 'name', e.target.value)}
                    placeholder={`Food ${index + 1}`}
                    className="flex-1 border border-[#ECEFF1] bg-white text-[#263238] rounded-lg px-3 py-2 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-[#FFEDD5] focus:border-[#FF7043] transition"
                    required
                  />
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleFoodChange(index, 'quantity', e.target.value)}
                    placeholder="Qty"
                    className="w-20 border border-[#ECEFF1] bg-white text-[#263238] rounded-lg px-2 py-2 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-[#FFEDD5] focus:border-[#FF7043] transition"
                  />
                  <select
                    value={item.unit}
                    onChange={(e) => handleFoodChange(index, 'unit', e.target.value)}
                    className="border border-[#ECEFF1] bg-white text-[#263238] rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-[#FFEDD5] focus:border-[#FF7043] transition"
                  >
                    <option value="">Unit</option>
                    {unitOptions.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                  </select>
                  {foodInputs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFoodField(index)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium transition"
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
                  className="w-full border border-[#ECEFF1] bg-white text-[#263238] rounded-lg px-3 py-2 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-[#FFEDD5] focus:border-[#FF7043] transition"
                />

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
  type="date"
  value={item.date || calendarDate}
  onChange={(e) => handleFoodChange(index, 'date', e.target.value)}
  max={new Date().toISOString().split("T")[0]} // 👈 disables future dates
  className="flex-1 border border-[#ECEFF1] bg-white text-[#263238] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#FFEDD5] focus:border-[#FF7043] transition"
/>

                  <input
                    type="time"
                    value={item.consumed_at}
                    onChange={(e) => handleFoodChange(index, 'consumed_at', e.target.value)}
                    className="flex-1 border border-[#ECEFF1] bg-white text-[#263238] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#FFEDD5] focus:border-[#FF7043] transition"
                  />
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addFoodField}
              className="mb-6 text-[#FF7043] text-sm font-semibold hover:text-[#F4511E] transition-colors"
            >
              + Add Another Food
            </button>
            
           
           <div className="mb-6">
  <label className="block text-base mb-2 font-medium text-[#546E7A]">Meal Type</label>
  <div className="flex gap-2 flex-wrap">
    {Object.entries(mealTypeMap).map(([label, value]) => (
      <label
        key={value}
        className={`px-4 py-2 rounded-full text-sm font-semibold cursor-pointer border-2 transition-all duration-200 ${
          mealType === value
            ? 'bg-[#FF7043] text-white border-[#FF7043]'
            : 'border-[#ECEFF1] text-[#546E7A] bg-white hover:border-[#FFC9B6] hover:text-[#263238]'
        }`}
      >
        <input
          type="radio"
          name="mealType"
          value={value}
          checked={mealType === value}
          onChange={() => setMealType(value)}
          className="hidden"
        />
        {label}
      </label>
    ))}
  </div>
</div>



            <div className="flex justify-center">
              <button
                type="submit"
                className="w-full sm:w-3/5 bg-[#FF7043] text-white hover:bg-[#F4511E] px-6 py-3 rounded-3xl text-lg font-bold font-['Poppins'] transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1"
              >
                + Add Food
              </button>
            </div>
          </form>

          {/* Logged Meals Card: Redesigned with the light beige tint and theme effects */}
          <div className="bg-[#FFFDF9]  rounded-xl p-6 shadow-md transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 border border-[#ECEFF1]">
            <h3 className="text-xl font-semibold mb-4 text-[#263238] font-['Poppins']">
              Logged Meals
            </h3>
            
            {loggedMeals.length === 0 ? (
              <div className="text-[#546E7A] p-6 bg-white rounded-xl border-2 border-dashed border-[#ECEFF1] text-center">
                No meals logged yet.
              </div>
            ) : (
              <ul className="space-y-3 relative overflow-visible z-10">

                {loggedMeals.map((meal) => (
                 <li
  key={meal._id}
  className="relative group z-50 flex items-center justify-between p-4 rounded-xl border border-[#ECEFF1] bg-white shadow-sm transition-all duration-300 ease-in-out hover:shadow-md hover:border-[#FF7043]/50 hover:-translate-y-px"
>
  <div className="flex items-center gap-4 overflow-hidden">
    <div className="bg-[#FFEDD5] p-3 rounded-full text-[#F4511E] text-xl flex-shrink-0">
      <FaUtensils />
    </div>
    <div className="truncate">
      <p className="font-semibold text-[#FF7043] truncate">{meal.food_name}</p>
      <p className="text-sm text-[#546E7A] capitalize">{meal.meal_type || 'Meal'} • {meal.quantity} {meal.unit}</p>
      {meal.remarks && (
        <p className="text-xs italic text-[#F4511E] truncate">“{meal.remarks}”</p>
      )}
    </div>
  </div>

  <button
    onClick={() => handleDeleteMeal(meal._id)}
    className="text-gray-400 hover:text-red-500 transition-colors p-2 flex-shrink-0"
  >
    <FaTrash size={14} />
  </button>

  {/* ✅ HOVER CARD FIXED WITH z-[999] and pointer-events-auto */}
  <div className="absolute z-[999] left-1/2 -translate-x-1/2 top-full mt-2 w-72 opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-auto">
    <div className="bg-white border border-[#ECEFF1] rounded-lg shadow-2xl p-4 text-sm">
      <h4 className="font-bold mb-1 text-[#263238] font-['Poppins']">{meal.food_name}</h4>
      <p className="text-[#546E7A] capitalize">
        <span className="font-semibold">{meal.quantity} {meal.unit}</span> • {meal.meal_type}
      </p>
      <p className="text-gray-500 mt-1">📅 {meal.date} at {meal.consumed_at}</p>
      {meal.remark && <p className="mt-2 italic text-sm text-[#F4511E]">“{meal.remark}”</p>}
    </div>
  </div>
</li>

                ))}
              </ul>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center mt-6 items-center gap-2 flex-wrap">
                <button onClick={handlePrevPage} disabled={!pagination.previous} className="px-3 py-1 text-base rounded-md border border-[#ECEFF1] disabled:text-gray-300 disabled:cursor-not-allowed text-[#546E7A] bg-white hover:bg-[#FFEDD5] disabled:bg-gray-50 transition-colors">
                  ←
                </button>
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  const isCurrent = pageNum === currentPage;
                  return (
                    <button key={pageNum} onClick={() => handlePageChange(`https://trackeats.onrender.com/api/logmeals/?page=${pageNum}`)}
                      className={`px-3 py-1 text-sm rounded-md border transition-colors ${isCurrent ? 'bg-[#FF7043] text-white border-[#F4511E] font-semibold' : 'bg-white text-[#263238] border-[#ECEFF1] hover:bg-[#FFEDD5]'}`}>
                      {pageNum}
                    </button>
                  );
                })}
                <button onClick={() => handlePageChange(pagination.next)} disabled={!pagination.next} className="px-3 py-1 text-base rounded-md border border-[#ECEFF1] disabled:text-gray-300 disabled:cursor-not-allowed text-[#546E7A] bg-white hover:bg-[#FFEDD5] disabled:bg-gray-50 transition-colors">
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