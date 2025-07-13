import React, { useEffect, useState } from "react";
import useMealLogger from "../../../components/components/MealLogger/UseMealLogger";
import { Plus, ChevronLeft, ChevronRight, Trash2, X } from "lucide-react";
import { getWater } from "../../../api/WaterTracker";
// --- FaIcons for consistency with the theme ---
import { FaFireAlt, FaBreadSlice, FaDrumstickBite, FaTint, FaGlassWhiskey, FaCoffee, FaAppleAlt, FaHamburger } from "react-icons/fa";

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

  const [waterGlasses, setWaterGlasses] = useState(0);

  useEffect(() => {
    const fetchWater = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const response = await getWater(today);
        const waterLogs = response.results || [];
        const totalMl = waterLogs.reduce((acc, log) => acc + (log.amount_ml || 0), 0);
        setWaterGlasses(Math.floor(totalMl / 250));
      } catch (err) {
        console.error("Failed to fetch water data:", err);
      }
    };

    fetchWater();
    const interval = setInterval(fetchWater, 5000);
    return () => clearInterval(interval);
  }, []);
  
  // --- THEME-ALIGNED STYLES AND HELPERS ---

  // ENHANCEMENT: Meal type styling now includes background and icon colors for the list
  const mealTypeStyles = {
    breakfast: { border: 'border-[#AED581]', bg: 'bg-[#AED581]/20', iconColor: 'text-[#689F38]' },
    lunch: { border: 'border-[#FFC9B6]', bg: 'bg-[#FFC9B6]/30', iconColor: 'text-[#F4511E]' },
    dinner: { border: 'border-[#FF7043]', bg: 'bg-[#FF7043]/20', iconColor: 'text-[#D84315]' },
    snack: { border: 'border-[#B3E5FC]', bg: 'bg-[#B3E5FC]/30', iconColor: 'text-[#0288D1]' },
    default: { border: 'border-gray-400', bg: 'bg-gray-100', iconColor: 'text-gray-600' }
  };

  const getMealIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "breakfast": return <FaCoffee />;
      case "lunch": return <FaHamburger />;
      case "dinner": return <FaDrumstickBite />;
      case "snack": return <FaAppleAlt />;
      default: return <FaBreadSlice />;
    }
  };

  const getProgressPercent = (value, target) => {
    if (!target || target === 0) return 0;
    const percent = Math.min((value / target) * 100, 100);
    return percent.toFixed(1);
  };
  
  const theme = {
    card: "bg-white border border-[#ECEFF1] rounded-xl shadow-md p-6 transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1",
    input: "border border-[#ECEFF1] px-3 py-2 rounded-lg w-full bg-white font-['Roboto'] text-sm focus:ring-2 focus:ring-[#FF7043] focus:border-transparent outline-none transition-shadow",
    label: "text-xs font-['Roboto'] font-semibold text-[#546E7A] mb-1 block",
    buttonPrimary: "bg-[#FF7043] hover:bg-opacity-90 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2",
  };

  const mealTypeMap = {
  "Early Morning Snack": "Early-Morning",
  "Breakfast": "Breakfast",
  "Mid-Morning Snack": "Mid-Morning Snack",
  "Lunch": "Lunch",
  "Afternoon Snack": "Afternoon Snack",
  "Dinner": "Dinner",
  "Bedtime": "Bedtime"
};


  return (
    <div className="bg-[#FFFDF9] min-h-screen text-[#546E7A] font-['Roboto']">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-8">
            <h1 className="text-4xl font-bold text-[#263238] font-['Poppins']" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.1)' }}>
                Meal Logger
            </h1>
            <p className="text-[#546E7A] mt-2 text-lg">
                Log your daily meals to track calories, nutrients, and water intake.
            </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- Left Panel: Form & Meals --- */}
          <div className="lg:col-span-2 space-y-8">

            {/* --- ENHANCED Food Input Form Card --- */}
            <form onSubmit={handleSubmit} className={theme.card}>
              <h3 className="text-xl font-semibold text-[#263238] font-['Poppins'] mb-1">
                Log a New Meal
              </h3>
              <p className="text-sm mb-6">Enter one or more food items below.</p>

              {foodInputs.map((input, idx) => (
                <div key={idx} className="border-t border-dashed border-gray-200 pt-4 mb-4">
                  {/* Row for main food details */}
                  <div className="grid grid-cols-12 gap-4 mb-3">
                    <div className="col-span-12 sm:col-span-6">
                      <label className={theme.label}>Food Name</label>
                      <input type="text" value={input.name} onChange={(e) => handleFoodChange(idx, "name", e.target.value)} className={theme.input} placeholder="e.g., Grilled Chicken Breast"/>
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <label className={theme.label}>Quantity</label>
                      <input type="number" value={input.quantity} onChange={(e) => handleFoodChange(idx, "quantity", e.target.value)} className={theme.input} placeholder="150"/>
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <label className={theme.label}>Unit</label>
                      <select value={input.unit} onChange={(e) => handleFoodChange(idx, "unit", e.target.value)} className={theme.input}>
                        <option value="">Select</option>
                        {unitOptions.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                      </select>
                    </div>
                  </div>
                   {/* Row for secondary details */}
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 sm:col-span-6">
                      <label className={theme.label}>Remarks (Optional)</label>
                      <input type="text" value={input.remark} onChange={(e) => handleFoodChange(idx, "remark", e.target.value)} className={theme.input} placeholder="e.g., Post-workout meal" />
                    </div>
                    <div className="col-span-6">
  <label className={theme.label}>Date</label>
  <input
  type="date"
  value={input.date}
  onChange={(e) => handleFoodChange(idx, "date", e.target.value)}
  max={new Date().toISOString().split("T")[0]} // 👈 disables future dates
  className={theme.input}
/>

</div>
<div className="col-span-6">
  <label className={theme.label}>Time</label>
  <input
    type="time"
    value={input.time}
    onChange={(e) => handleFoodChange(idx, "time", e.target.value)}
    className={theme.input}
  />
</div>

                  </div>
                </div>
              ))}
              
              <div className="flex items-center justify-between border-t border-[#ECEFF1] pt-6 mt-4">
                 <div className="flex gap-4">
                  <button type="button" onClick={addFoodField} className="text-sm font-semibold text-[#FF7043] hover:text-[#F4511E] flex items-center gap-1 transition-colors">
                    <Plus size={16}/> Add Item
                  </button>
                  {foodInputs.length > 1 && (
                    <button type="button" onClick={() => removeFoodField(foodInputs.length - 1)} className="text-sm font-semibold text-red-600 hover:text-red-800 flex items-center gap-1 transition-colors">
                      <Trash2 size={16} /> Remove Item
                    </button>
                  )}
                </div>
                 <div className="flex gap-4 items-center">
                    <select value={mealType} onChange={(e) => setMealType(e.target.value)} className={theme.input + " w-48"}>
                        <option value="Breakfast">Breakfast</option>
                        <option value="Snack">Snack</option>
                        <option value="Lunch">Lunch</option>
                        <option value="Dinner">Dinner</option>
                    </select>
                    <button
  type="submit"
  className={`${theme.buttonPrimary} text-base py-2.5 px-8 whitespace-nowrap`}
>
  Log Meal
</button>
                </div>
              </div>
            </form>

            {/* --- ENHANCED Logged Meals Card --- */}
            <div className={theme.card}>
              <h3 className="text-xl font-semibold text-[#263238] font-['Poppins'] mb-4">
                Recently Logged
              </h3>
              <div className="mb-6 bg-[#FAF3EB] p-4 rounded-lg w-full">
  <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
    <label className="text-sm font-semibold text-[#546E7A] shrink-0">
      Filter by date:
    </label>
    <div className="flex items-center w-full gap-2">
      <div className="relative flex-1">
        <input
          type="date"
          value={searchDate}
          max={new Date().toISOString().split("T")[0]}
          onChange={(e) => {
            const newDate = e.target.value;
            setSearchDate(newDate);
            if (newDate === "") searchByDate("");
          }}
          className={theme.input + " w-full"}
        />
        {searchDate && (
          <button
            type="button"
            onClick={() => {
              setSearchDate("");
              searchByDate("");
            }}
            title="Reset"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>
      <button
        onClick={() => searchByDate(searchDate)}
        className="bg-[#FF7043] hover:bg-[#F4511E] text-white p-2 rounded-lg transition-colors shadow-sm hover:shadow-md flex items-center justify-center"
        title="Search"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M5.6 10.6a5 5 0 1110 0 5 5 0 01-10 0z" />
        </svg>
      </button>
    </div>
  </div>
</div>

              {loggedMeals.length === 0 ? (
                <div className="text-[#546E7A] p-6 bg-white rounded-xl border-2 border-dashed border-[#ECEFF1] text-center"><p className="font-semibold">No meals logged for this date.</p><p className="text-sm">Use the form above to add your first meal!</p></div>
              ) : (
                <>
                  <ul className="space-y-3">
                    {loggedMeals.map((meal) => {
                      const style = mealTypeStyles[meal.meal_type.toLowerCase()] || mealTypeStyles.default;
                      return (
                      <li key={meal.id} className={`flex items-center gap-4 p-3 rounded-lg border shadow-sm relative transition-all duration-300 ease-in-out hover:shadow-md hover:border-[#FF7043] hover:-translate-y-px ${style.border}`}>
                        <div className={`p-3 rounded-full text-xl ${style.bg} ${style.iconColor}`}>{getMealIcon(meal.meal_type)}</div>
                        <div className="flex-1">
                            <p className="font-semibold text-[#263238] text-base">{meal.food_name}</p>
                            <p className="text-sm text-[#546E7A] capitalize">
                                {meal.meal_type} • {meal.quantity} {meal.unit} 
                                {meal.consumed_at && (<span className="text-gray-400"> • {new Date(meal.consumed_at).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}</span>)}
                            </p>
                            {meal.remarks && (
  <p className="text-sm italic text-[#F4511E] mt-1">
    {meal.remarks}
  </p>
)}

                        </div>
                        <div className="text-right flex items-center gap-6">
                            <div className="hidden sm:flex text-xs text-[#546E7A] items-center gap-4">
                                <span className="font-bold text-[#FF7043]">{Math.round(meal.calories ?? 0)} kcal</span>
                                <span className="font-semibold text-[#689F38]">{Math.round(meal.protein ?? 0)}g P</span>
                                <span className="font-semibold text-[#0288D1]">{Math.round(meal.carbs ?? 0)}g C</span>
                                <span className="font-semibold text-[#D84315]">{Math.round(meal.fats ?? 0)}g F</span>
                            </div>
                            <button onClick={() => handleDeleteMeal(meal.id)} className="text-gray-400 hover:text-red-600 transition-colors" title="Remove"><Trash2 size={18} /></button>
                        </div>
                      </li>
                    )})}
                  </ul>
                  <div className="flex justify-center items-center mt-6 space-x-4">
                    <button onClick={handlePrevPage} disabled={!pagination.previous} className={`p-2 rounded-full border border-[#ECEFF1] transition-colors ${pagination.previous ? "hover:bg-[#FFEDD5] text-[#546E7A]" : "text-gray-300 cursor-not-allowed" }`}><ChevronLeft size={18} /></button>
                    <span className="text-sm text-[#546E7A] font-semibold font-['Roboto']">Page {currentPage}</span>
                    <button onClick={handleNextPage} disabled={!pagination.next} className={`p-2 rounded-full border border-[#ECEFF1] transition-colors ${pagination.next ? "hover:bg-[#FFEDD5] text-[#546E7A]" : "text-gray-300 cursor-not-allowed" }`}><ChevronRight size={18} /></button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* --- Right Panel: Summary (UNCHANGED as per request) --- */}
          <div className="flex flex-col items-start space-y-8">
             <div className={theme.card + " w-full"}>
              <h4 className="font-['Poppins'] font-semibold text-xl text-[#263238] mb-4">
                Today's Summary
              </h4>
              <div className="flex items-center gap-3 mb-4 border-b border-[#ECEFF1] pb-4">
                 <span className="bg-[#FFEDD5] p-3 rounded-full text-[#F4511E] text-2xl"><FaFireAlt/></span>
                 <div>
                    <p className="text-2xl font-bold text-[#263238]">{dailySummary.calories?.toFixed(0) || 0} kcal</p>
                    <p className="text-sm text-[#546E7A]">of {goals.caloriesTarget?.toFixed(0) || 2000} goal</p>
                 </div>
              </div>
              <div className="space-y-4 text-sm font-['Roboto']">
                {[
                  { label: "Carbs", value: dailySummary.carbs, target: 250, color: "bg-[#B3E5FC]", icon: <FaBreadSlice className="text-[#0288D1]" />},
                  { label: "Protein", value: dailySummary.protein, target: 50, color: "bg-[#AED581]", icon: <FaDrumstickBite className="text-[#689F38]" />},
                  { label: "Fat", value: dailySummary.fat, target: 67, color: "bg-[#FFC9B6]", icon: <FaTint className="text-[#F4511E]" />},
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-[#263238] flex items-center gap-2">{item.icon} {item.label}</span>
                        <span className="text-[#546E7A]">{item.value?.toFixed(1) || '0.0'}g / {item.target}g</span>
                    </div>
                    <div className="w-full h-2 bg-[#ECEFF1] rounded-full overflow-hidden">
                      <div className={`${item.color} h-full rounded-full transition-all duration-500`} style={{ width: `${getProgressPercent(item.value, item.target)}%`}}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={theme.card + " w-full"}>
              <h4 className="font-['Poppins'] font-semibold text-xl text-[#263238] mb-4">
                Other Goals
              </h4>
              <div className="text-base space-y-3 font-semibold text-[#546E7A]">
                 <div className="flex items-center justify-between">
                     <span className="flex items-center gap-2"><FaGlassWhiskey className="text-[#B3E5FC]"/> Water</span>
                     <span>{waterGlasses}  glasses</span>
                 </div>
                  <div className="flex items-center justify-between">
                     <span className="flex items-center gap-2"><FaFireAlt className="text-[#FF7043]"/> Calories</span>
                     <span>{dailySummary?.calories?.toFixed(0) || 0} / {goals?.caloriesTarget || 2000}</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealLogger;