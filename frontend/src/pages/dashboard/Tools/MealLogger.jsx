import React, { useEffect, useState } from "react";
import useMealLogger from "../../../components/components/MealLogger/UseMealLogger";
import { Plus, ChevronLeft, ChevronRight, Trash2, X, Search } from "lucide-react";
import { getWater } from "../../../api/WaterTracker";
import { FaFireAlt, FaBreadSlice, FaDrumstickBite, FaTint, FaGlassWhiskey, FaCoffee, FaAppleAlt, FaHamburger } from "react-icons/fa";

const MealLogger = () => {
  const {
    foodInputs = [], handleFoodChange, addFoodField, removeFoodField,
    mealType, setMealType, handleSubmit, unitOptions = [],
    dailySummary = { calories: 0, carbs: 0, protein: 0, fat: 0 },
    goals = { caloriesTarget: 2000, waterLogged: 0, waterTarget: 8 },
    loggedMeals = [], handleNextPage, handlePrevPage,
    pagination = {}, currentPage = 1, handleDeleteMeal,
    searchDate, setSearchDate, searchByDate,
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
    const interval = setInterval(fetchWater, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);
  
  // --- THEME-ALIGNED STYLES AND HELPERS ---

const mealTypeStyles = {
  // All 'border' properties are now 'border-primary' for a consistent look.
  // The background and icon colors can remain varied for subtle distinction.
  breakfast: { border: 'border-primary', bg: 'bg-primary/10', iconColor: 'text-primary' },
  lunch:     { border: 'border-primary', bg: 'bg-accent-orange/10', iconColor: 'text-accent-orange' },
  dinner:    { border: 'border-primary', bg: 'bg-accent-coral/10', iconColor: 'text-accent-coral' },
  snack:     { border: 'border-primary', bg: 'bg-accent-yellow/10', iconColor: 'text-accent-yellow' },
  default:   { border: 'border-primary', bg: 'bg-light', iconColor: 'text-body' }
};

  const getMealIcon = (type) => ({
    "breakfast": <FaCoffee />, "lunch": <FaHamburger />,
    "dinner": <FaDrumstickBite />, "snack": <FaAppleAlt />,
  }[type?.toLowerCase()] || <FaBreadSlice />);

  const getProgressPercent = (value, target) => {
    if (!target || target === 0) return 0;
    return Math.min((value / target) * 100, 100).toFixed(1);
  };
  
  const theme = {
    card: "bg-section border border-custom rounded-xl shadow-soft p-6 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1",
    input: "border border-custom px-3 py-2 rounded-lg w-full bg-main text-body placeholder:text-body/60 focus:ring-2 focus:ring-primary focus:outline-none transition-shadow",
    label: "text-sm font-['Lora'] font-semibold text-heading mb-1 block",
    buttonPrimary: "bg-primary hover:bg-primary-hover text-light px-6 py-2 rounded-lg font-semibold transition-all duration-300 shadow-soft hover:shadow-lg flex items-center justify-center gap-2",
  };

  return (
    <div className="bg-main min-h-screen text-body font-['Poppins']">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-8">
            <h1 className="text-4xl font-['Lora'] font-bold text-heading">
                Meal Logger
            </h1>
            <p className="text-body mt-2 text-lg">
                Log your daily meals to track calories, nutrients, and water intake.
            </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- Left Panel: Form & Meals --- */}
          <div className="lg:col-span-2 space-y-8">

            <form onSubmit={handleSubmit} className={theme.card}>
              <h3 className="text-xl font-['Lora'] font-semibold text-heading mb-1">
                Log a New Meal
              </h3>
              <p className="text-sm mb-6">Enter one or more food items below.</p>

              {foodInputs.map((input, idx) => (
                <div key={idx} className="border-t border-dashed border-custom pt-4 mb-4">
                  <div className="grid grid-cols-12 gap-4 mb-3">
                    <div className="col-span-12 sm:col-span-6">
                      <label className={theme.label}>Food Name</label>
                      <input type="text" value={input.name} onChange={(e) => handleFoodChange(idx, "name", e.target.value)} className={theme.input} placeholder="e.g., Grilled Chicken"/>
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
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 sm:col-span-6">
                      <label className={theme.label}>Remarks (Optional)</label>
                      <input type="text" value={input.remark} onChange={(e) => handleFoodChange(idx, "remark", e.target.value)} className={theme.input} placeholder="e.g., Post-workout meal" />
                    </div>
                    <div className="col-span-6">
                      <label className={theme.label}>Date</label>
                      <input type="date" value={input.date} onChange={(e) => handleFoodChange(idx, "date", e.target.value)} max={new Date().toISOString().split("T")[0]} className={theme.input} />
                    </div>
                    <div className="col-span-6">
                      <label className={theme.label}>Time</label>
                      <input type="time" value={input.time} onChange={(e) => handleFoodChange(idx, "time", e.target.value)} className={theme.input} />
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="flex items-center justify-between border-t border-custom pt-6 mt-4">
                 <div className="flex gap-4">
                  <button type="button" onClick={addFoodField} className="text-sm font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors">
                    <Plus size={16}/> Add Item
                  </button>
                  {foodInputs.length > 1 && (
                    <button type="button" onClick={() => removeFoodField(foodInputs.length - 1)} className="text-sm font-semibold text-red hover:text-red/80 flex items-center gap-1 transition-colors">
                      <Trash2 size={16} /> Remove Item
                    </button>
                  )}
                </div>
                 <div className="flex gap-4 items-center">
                    <select value={mealType} onChange={(e) => setMealType(e.target.value)} className={theme.input + " w-48"}>
                        <option value="Breakfast">Breakfast</option> <option value="Snack">Snack</option>
                        <option value="Lunch">Lunch</option> <option value="Dinner">Dinner</option>
                    </select>
                    <button type="submit" className={`${theme.buttonPrimary} text-base py-2.5 px-8 whitespace-nowrap`}>Log Meal</button>
                </div>
              </div>
            </form>

            <div className={theme.card}>
              <h3 className="text-xl font-['Lora'] font-semibold text-heading mb-4">Recently Logged</h3>
              <div className="mb-6 bg-light p-4 rounded-lg w-full">
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                  <label className="text-sm font-semibold text-body shrink-0">Filter by date:</label>
                  <div className="flex items-center w-full gap-2">
                    <div className="relative flex-1">
                      <input type="date" value={searchDate} max={new Date().toISOString().split("T")[0]} onChange={(e) => { const newDate = e.target.value; setSearchDate(newDate); if (newDate === "") searchByDate(""); }} className={theme.input + " w-full"} />
                      {searchDate && ( <button type="button" onClick={() => { setSearchDate(""); searchByDate(""); }} title="Reset" className="absolute right-2 top-1/2 transform -translate-y-1/2 text-body/60 hover:text-red transition-colors"><X size={18} /></button> )}
                    </div>
                    <button onClick={() => searchByDate(searchDate)} className="bg-primary hover:bg-primary-hover text-light p-2 rounded-lg transition-colors shadow-soft hover:shadow-lg flex items-center justify-center" title="Search"><Search size={20} /></button>
                  </div>
                </div>
              </div>

              {loggedMeals.length === 0 ? (
                <div className="text-body p-6 bg-section rounded-xl border-2 border-dashed border-custom text-center"><p className="font-semibold">No meals logged for this date.</p><p className="text-sm">Use the form above to add your first meal!</p></div>
              ) : (
                <>
                  <ul className="space-y-3">
                    {loggedMeals.map((meal) => {
                      const style = mealTypeStyles[meal.meal_type.toLowerCase()] || mealTypeStyles.default;
                      return (
                      <li key={meal.id} className={`flex items-center gap-4 p-3 rounded-lg border shadow-sm relative transition-all duration-300 ease-in-out hover:shadow-md hover:border-primary hover:-translate-y-px ${style.border}`}>
                        <div className={`p-3 rounded-full text-xl ${style.bg} ${style.iconColor}`}>{getMealIcon(meal.meal_type)}</div>
                        <div className="flex-1">
                            <p className="font-semibold text-heading text-base">{meal.food_name}</p>
                            <p className="text-sm text-body capitalize">{meal.meal_type} • {meal.quantity} {meal.unit} {meal.consumed_at && (<span className="text-body/60"> • {new Date(meal.consumed_at).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}</span>)}</p>
                            {meal.remarks && (<p className="text-sm italic text-primary mt-1">{meal.remarks}</p>)}
                        </div>
                        <div className="text-right flex items-center gap-6">
                            <div className="hidden sm:flex text-xs text-body items-center gap-4">
                                <span className="font-bold text-accent-orange">{Math.round(meal.calories ?? 0)} kcal</span>
                                <span className="font-semibold text-primary">{Math.round(meal.protein ?? 0)}g P</span>
                                <span className="font-semibold text-accent-yellow">{Math.round(meal.carbs ?? 0)}g C</span>
                                <span className="font-semibold text-accent-coral">{Math.round(meal.fats ?? 0)}g F</span>
                            </div>
                            <button onClick={() => handleDeleteMeal(meal.id)} className="text-body/60 hover:text-red transition-colors" title="Remove"><Trash2 size={18} /></button>
                        </div>
                      </li>
                    )})}
                  </ul>
                  <div className="flex justify-center items-center mt-6 space-x-4">
                    <button onClick={handlePrevPage} disabled={!pagination.previous} className={`p-2 rounded-full border border-custom transition-colors ${pagination.previous ? "hover:bg-light text-body" : "text-body/40 cursor-not-allowed" }`}><ChevronLeft size={18} /></button>
                    <span className="text-sm text-body font-semibold">Page {currentPage}</span>
                    <button onClick={handleNextPage} disabled={!pagination.next} className={`p-2 rounded-full border border-custom transition-colors ${pagination.next ? "hover:bg-light text-body" : "text-body/40 cursor-not-allowed" }`}><ChevronRight size={18} /></button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* --- Right Panel: Summary --- */}
          <div className="flex flex-col items-start space-y-8">
             <div className={theme.card + " w-full"}>
              <h4 className="font-['Lora'] font-semibold text-xl text-heading mb-4">Today's Summary</h4>
              <div className="flex items-center gap-3 mb-4 border-b border-custom pb-4">
                 <span className="bg-accent-orange/10 p-3 rounded-full text-accent-orange text-2xl"><FaFireAlt/></span>
                 <div>
                    <p className="text-2xl font-bold text-heading">{dailySummary.calories?.toFixed(0) || 0} kcal</p>
                    <p className="text-sm text-body">of {goals.caloriesTarget?.toFixed(0) || 2000} goal</p>
                 </div>
              </div>
              <div className="space-y-4 text-sm">
                {[
                  { label: "Carbs", value: dailySummary.carbs, target: 250, color: "bg-accent-yellow", icon: <FaBreadSlice className="text-accent-yellow" />},
                  { label: "Protein", value: dailySummary.protein, target: 50, color: "bg-primary", icon: <FaDrumstickBite className="text-primary" />},
                  { label: "Fat", value: dailySummary.fat, target: 67, color: "bg-accent-coral", icon: <FaTint className="text-accent-coral" />},
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-heading flex items-center gap-2">{item.icon} {item.label}</span>
                        <span className="text-body">{item.value?.toFixed(1) || '0.0'}g / {item.target}g</span>
                    </div>
                    <div className="w-full h-2 bg-light rounded-full overflow-hidden">
                      <div className={`${item.color} h-full rounded-full transition-all duration-500`} style={{ width: `${getProgressPercent(item.value, item.target)}%`}}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={theme.card + " w-full"}>
              <h4 className="font-['Lora'] font-semibold text-xl text-heading mb-4">Other Goals</h4>
              <div className="text-base space-y-3 font-semibold text-body">
                 <div className="flex items-center justify-between">
                     <span className="flex items-center gap-2"><FaGlassWhiskey className="text-accent-yellow"/> Water</span>
                     <span>{waterGlasses}  glasses</span>
                 </div>
                  <div className="flex items-center justify-between">
                     <span className="flex items-center gap-2"><FaFireAlt className="text-accent-orange"/> Calories</span>
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