import React, { useState } from 'react';
import { FaUtensils, FaTrash } from 'react-icons/fa';
import useMealLogger from './UseMealLogger';
import { GlassWater } from "lucide-react"; // Importing for the success toast icon

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

  const [currentPage, setCurrentPage] = useState(1);

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
    // Section now uses theme's background
    <section className="w-full bg-main px-6 sm:px-12 py-16 font-['Poppins'] animate-fade-in-up">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          {/* Heading uses Lora font and heading color */}
          <h2 className="text-center text-2xl sm:text-3xl font-['Lora'] font-bold text-heading" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.1)' }}>
            Quick Meal Logger
          </h2>
          <p className="text-lg text-body mt-2">
            Track your nutrition smartly & simply
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative overflow-visible z-10">
          {/* Form Card uses theme's section background, border, and shadow */}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await handleSubmit(e);
              if (onMealLogged) onMealLogged();
            }}
            className="bg-section rounded-xl p-6 shadow-soft border border-custom"
          >
            <div className="flex items-center gap-3 mb-6">
              <FaUtensils size={24} className="text-primary" />
              <h3 className="text-xl font-semibold text-heading">Add a Meal</h3>
            </div>

            {foodInputs.map((item, index) => (
              <div key={index} className="mb-4 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleFoodChange(index, 'name', e.target.value)}
                    placeholder={`Food ${index + 1}`}
                    className="flex-1 bg-main text-heading border border-custom rounded-lg px-3 py-2 text-sm placeholder:text-body/60 focus:ring-2 focus:ring-primary focus:border-primary transition"
                    required
                  />
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleFoodChange(index, 'quantity', e.target.value)}
                    placeholder="Qty"
                    className="w-20 bg-main text-heading border border-custom rounded-lg px-2 py-2 text-sm placeholder:text-body/60 focus:ring-2 focus:ring-primary focus:border-primary transition"
                  />
                  <select
                    value={item.unit}
                    onChange={(e) => handleFoodChange(index, 'unit', e.target.value)}
                    className="bg-main text-heading border border-custom rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
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
                      <Trash2 size={16} /> Remove
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={item.remark}
                  onChange={(e) => handleFoodChange(index, 'remark', e.target.value)}
                  placeholder="Remark (optional)"
                  className="w-full bg-main border border-custom text-heading rounded-lg px-3 py-2 text-sm placeholder:text-body/60 focus:ring-2 focus:ring-primary focus:border-primary transition"
                />
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="date"
                    value={item.date || calendarDate}
                    onChange={(e) => handleFoodChange(index, 'date', e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    className="flex-1 bg-main text-heading border border-custom rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
                  />
                  <input
                    type="time"
                    value={item.consumed_at}
                    onChange={(e) => handleFoodChange(index, 'consumed_at', e.target.value)}
                    className="flex-1 bg-main text-heading border border-custom rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addFoodField}
              className="mb-6 text-primary text-sm font-semibold hover:text-primary-hover transition-colors"
            >
              + Add Another Food
            </button>

            <div className="mb-6">
              <label className="block text-base mb-2 font-medium text-heading">Meal Type</label>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(mealTypeMap).map(([label, value]) => (
                  <label
                    key={value}
                    className={`px-4 py-2 rounded-full text-sm font-semibold cursor-pointer border-2 transition-all duration-200 ${
                      mealType === value
                        ? 'bg-primary text-light border-primary'
                        : 'border-custom text-body bg-section hover:border-primary hover:text-heading'
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
              {/* Themed primary button */}
              <button
                type="submit"
                className="w-full sm:w-3/5 bg-primary text-light hover:bg-primary-hover px-6 py-3 rounded-3xl text-lg font-bold font-['Poppins'] transition-all duration-300 shadow-soft hover:shadow-lg hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                + Add Food
              </button>
            </div>
          </form>

          {/* Logged Meals Card with themed styling */}
          <div className="bg-section rounded-xl p-6 shadow-soft border border-custom">
            <h3 className="text-xl font-semibold mb-4 text-heading font-['Poppins']">
              Logged Meals
            </h3>

            {loggedMeals.length === 0 ? (
              <div className="text-body p-6 bg-light rounded-xl border-2 border-dashed border-custom text-center">
                No meals logged yet.
              </div>
            ) : (
              <ul className="space-y-3 relative overflow-visible z-10">
                {loggedMeals.map((meal) => {
                  const style = { // This is to be read directly from index.css.
                    "Early-Morning": {
                      border: 'border-primary',
                      bg: 'bg-primary/10',
                      iconColor: 'text-primary'
                    },
                    "Breakfast": {
                      border: 'border-primary',
                      bg: 'bg-primary/10',
                      iconColor: 'text-primary'
                    },
                    "Mid-Morning Snack": {
                      border: 'border-primary',
                      bg: 'bg-accent-yellow/10',
                      iconColor: 'text-accent-yellow'
                    },
                    "Lunch": {
                      border: 'border-primary',
                      bg: 'bg-accent-orange/10',
                      iconColor: 'text-accent-orange'
                    },
                    "Afternoon Snack": {
                      border: 'border-primary',
                      bg: 'bg-accent-yellow/10',
                      iconColor: 'text-accent-yellow'
                    },
                    "Dinner": {
                      border: 'border-primary',
                      bg: 'bg-accent-coral/10',
                      iconColor: 'text-accent-coral'
                    },
                    "Bedtime": {
                      border: 'border-primary',
                      bg: 'bg-primary/10',
                      iconColor: 'text-primary'
                    },
                    default: {
                      border: 'border-custom',
                      bg: 'bg-light',
                      iconColor: 'text-body'
                    }
                  }[meal.meal_type?.toLowerCase()] || {
                    border: 'border-custom',
                    bg: 'bg-light',
                    iconColor: 'text-body'
                  };

                  return (
                    <li
  key={meal.id}
  className={`relative group flex flex-col gap-1 p-4 rounded-xl border ${style.border} bg-section shadow-sm transition-all duration-300 ease-in-out hover:shadow-lg hover:border-primary`}
>
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-4 overflow-hidden">
      <div className={`p-3 rounded-full text-xl ${style.bg} ${style.iconColor} flex-shrink-0`}>
        <FaUtensils />
      </div>
      <div className="truncate">
        <p className="font-semibold text-heading truncate">{meal.food_name}</p>
        <p className="text-sm text-body capitalize">
          {meal.meal_type || 'Meal'} • {meal.quantity} {meal.unit}
        </p>
        {meal.remarks && (
          <p className="text-xs italic text-body/70 truncate">“{meal.remarks}”</p>
        )}
      </div>
    </div>

    <button
      onClick={() => handleDeleteMeal(meal.id)}
      className="text-body/60 hover:text-red-500 transition-colors p-2 flex-shrink-0 z-40"
      title="Remove"
    >
      <FaTrash size={14} />
    </button>
  </div>

  {/* Hover Info Box below */}
  <div
  className="absolute w-[200px] left-[60%] bg-white border border-gray-300 
    rounded-md shadow-lg p-3 opacity-0 group-hover:opacity-100 
    transition-opacity duration-300 z-30 pointer-events-none"
>

    <p className="text-xs text-gray-700">
      <span className="font-semibold">📅 Date:</span> {meal.date}
    </p>
    <p className="text-xs text-gray-700">
      <span className="font-semibold">⏰ Time:</span>{' '}
      {new Date(meal.consumed_at).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}
    </p>
    <p className="text-xs text-gray-700">
      <span className="font-semibold">🔥 Calories:</span> {meal.calories} kcal
    </p>
  </div>
</li>



                  );
                })}
              </ul>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center mt-6 items-center gap-2 flex-wrap">
                <button
  onClick={() => {
    handlePrevPage();
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }}
 className="px-3 py-1 text-base rounded-md border border-custom disabled:text-body/40 disabled:cursor-not-allowed text-body bg-light hover:bg-light/80 disabled:bg-light transition-colors">
                  ←
                </button>
               {Array.from({ length: totalPages }).map((_, idx) => {
  const pageNum = idx + 1;
  const isCurrent = pageNum === currentPage;

  return (
    <button
      key={pageNum}
      onClick={() => {
  handlePageChange(`https://trackeats.onrender.com/api/logmeals/?page=${pageNum}`);
  setCurrentPage(pageNum);
}}

      className={`px-3 py-1 text-sm rounded-md border transition-colors ${
        isCurrent
          ? 'bg-primary text-light border-primary font-semibold'
          : 'bg-light text-body border-custom hover:bg-primary/10'
      }`}
    >
      {pageNum}
    </button>
  );
})}

                <button 
  onClick={() => {
    handlePageChange(pagination.next);
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }}
 className="px-3 py-1 text-base rounded-md border border-custom disabled:text-body/40 disabled:cursor-not-allowed text-body bg-light hover:bg-light/80 disabled:bg-light transition-colors">
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