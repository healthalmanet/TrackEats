// src/pages/dashboard/tools/MealLogger.jsx

import React, { useEffect, useState, useMemo } from "react";
import useMealLogger from "../../../components/components/MealLogger/UseMealLogger";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  X,
  Search,
  Loader,
} from "lucide-react";
// Import the water API
import { getTotalWaterForDate } from "../../../api/WaterTracker";
// --- UPDATED: Import both target and progress APIs ---
import { targetApi, targetProgressApi } from "../../../api/reportsApi";
import {
  FaFireAlt,
  FaBreadSlice,
  FaDrumstickBite,
  FaTint,
  FaGlassWhiskey,
  FaCoffee,
  FaAppleAlt,
  FaHamburger,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const MealLogger = () => {
  const {
    foodInputs = [],
    handleFoodChange,
    addFoodField,
    removeFoodField,
    mealType,
    setMealType,
    logDate,
    setLogDate,
    logTime,
    setLogTime,
    handleSubmit,
    unitOptions = [],
    loggedMeals = [],
    handleNextPage,
    handlePrevPage,
    pagination = {},
    currentPage = 1,
    handleDeleteMeal,
    searchDate,
    setSearchDate,
    searchByDate,
    isSubmitting,
    isFetching,
  } = useMealLogger();

  // --- UPDATED: State to hold the summary fetched from the API ---
  const [dailySummary, setDailySummary] = useState({
    calories: 0,
    carbs: 0,
    protein: 0,
    fat: 0,
  });
  const [waterLogged, setWaterLogged] = useState(0);
  const [calorieGoal, setCalorieGoal] = useState(2000); // Start with a default fallback

  const todayDate = useMemo(() => new Date().toISOString().split("T")[0], []);

  // --- UPDATED: useEffect to fetch the daily summary data using targetProgressApi ---
  useEffect(() => {
    const fetchDailySummary = async () => {
      if (!searchDate) return;
      try {
        const summaryData = await targetProgressApi(searchDate);
        setDailySummary({
          calories: summaryData.calories || 0,
          carbs: summaryData.carbs || 0,
          protein: summaryData.protein || 0,
          fat: summaryData.fats || 0, // Note: API sends 'fats', component uses 'fat'
        });
      } catch (error) {
        console.error("Failed to fetch daily summary:", error);
        // Reset on error to avoid showing stale data
        setDailySummary({ calories: 0, carbs: 0, protein: 0, fat: 0 });
      }
    };
    fetchDailySummary();
  }, [searchDate, loggedMeals]); // Refreshes when date changes or a meal is updated

  useEffect(() => {
    const fetchWaterData = async () => {
      if (!searchDate) return;
      try {
        const data = await getTotalWaterForDate(searchDate);
        const totalMl = data?.total_water_ml || 0;
        setWaterLogged(totalMl);
      } catch (error) {
        console.error("Failed to fetch water data:", error);
        setWaterLogged(0);
      }
    };
    fetchWaterData();
  }, [searchDate, loggedMeals]);

  // --- UPDATED: useEffect to fetch the dynamic calorie goal, now with date ---
  useEffect(() => {
    const fetchCalorieGoal = async () => {
      try {
        // Pass the current date to the API call
        const data = await targetApi(todayDate);
        if (data && data.recommended_calories) {
          setCalorieGoal(data.recommended_calories);
        }
      } catch (error) {
        console.error("Failed to fetch calorie goal:", error);
        // On error, the component will gracefully use the default state of 2000
      }
    };
    fetchCalorieGoal();
  }, [todayDate]); // Dependency array updated

  const waterGlasses = Math.floor((waterLogged || 0) / 250);

  const macroTargets = {
    carbs: 250,
    protein: 50,
    fat: 67,
  };

  const mealTypeStyles = {
    breakfast: {
      border: "border-[var(--color-success-text)]",
      bg: "bg-[var(--color-success-bg-subtle)]",
      iconColor: "text-[var(--color-success-text)]",
    },
    lunch: {
      border: "border-[var(--color-warning-text)]",
      bg: "bg-[var(--color-warning-bg-subtle)]",
      iconColor: "text-[var(--color-warning-text)]",
    },
    dinner: {
      border: "border-[var(--color-danger-text)]",
      bg: "bg-[var(--color-danger-bg-subtle)]",
      iconColor: "text-[var(--color-danger-text)]",
    },
    snack: {
      border: "border-[var(--color-info-text)]",
      bg: "bg-[var(--color-info-bg-subtle)]",
      iconColor: "text-[var(--color-info-text)]",
    },
  };

  const getMealIcon = (type) =>
    ({
      breakfast: <FaCoffee />,
      lunch: <FaHamburger />,
      dinner: <FaDrumstickBite />,
      snack: <FaAppleAlt />,
    }[type?.toLowerCase()] || <FaBreadSlice />);
  const getProgressPercent = (value, target) => {
    if (!target || target === 0) return 0;
    return Math.min((value / target) * 100, 100);
  };

  return (
    <div className="bg-[var(--color-bg-app)] min-h-screen text-[var(--color-text-default)] font-[var(--font-secondary)]">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-[var(--font-primary)] font-bold text-[var(--color-text-strong)]">
            Meal Logger
          </h1>
          <p className="text-lg mt-1">
            Log your daily meals to track calories, nutrients, and water intake.
          </p>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-[var(--color-bg-surface)] border-2 border-[var(--color-border-default)] rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-xl font-[var(--font-primary)] font-semibold text-[var(--color-text-strong)] mb-1">
                Log a New Meal
              </h3>
              <p className="text-sm mb-6">
                Enter one or more food items below.
              </p>

              <AnimatePresence>
                {foodInputs.map((input, idx) => (
                  <motion.div
                    key={input.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t-2 border-dashed border-[var(--color-border-default)] pt-4 mb-4 overflow-hidden"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-grow grid grid-cols-12 gap-4">
                        <div className="col-span-12 sm:col-span-6 relative">
                          <input
                            type="text"
                            value={input.name}
                            onChange={(e) =>
                              handleFoodChange(idx, "name", e.target.value)
                            }
                            className="w-full bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] rounded-lg px-3 py-2.5 text-[var(--color-text-default)] focus:outline-none focus:border-[var(--color-primary)] transition-colors peer"
                            placeholder=" "
                          />
                          <label className="absolute left-3 -top-2.5 text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-surface)] px-1 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-[var(--color-primary)] transition-all pointer-events-none">
                            Food Name
                          </label>
                        </div>
                        <div className="col-span-6 sm:col-span-3 relative">
                          <input
                            type="number"
                            value={input.quantity}
                            onChange={(e) =>
                              handleFoodChange(idx, "quantity", e.target.value)
                            }
                            className="w-full bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] rounded-lg px-3 py-2.5 text-[var(--color-text-default)] focus:outline-none focus:border-[var(--color-primary)] transition-colors peer"
                            placeholder=" "
                          />
                          <label className="absolute left-3 -top-2.5 text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-surface)] px-1 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-[var(--color-primary)] transition-all pointer-events-none">
                            Quantity
                          </label>
                        </div>
                        <div className="col-span-6 sm:col-span-3">
                          <select
                            value={input.unit}
                            onChange={(e) =>
                              handleFoodChange(idx, "unit", e.target.value)
                            }
                            className="w-full bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] rounded-lg px-3 py-2.5 text-[var(--color-text-default)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                          >
                            <option value="">Unit</option>
                            {unitOptions.map((unit) => (
                              <option key={unit} value={unit}>
                                {unit}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-12 relative">
                          <input
                            type="text"
                            value={input.remark}
                            onChange={(e) =>
                              handleFoodChange(idx, "remark", e.target.value)
                            }
                            className="w-full bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] rounded-lg px-3 py-2.5 text-[var(--color-text-default)] focus:outline-none focus:border-[var(--color-primary)] transition-colors peer"
                            placeholder=" "
                          />
                          <label className="absolute left-3 -top-2.5 text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-surface)] px-1 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-[var(--color-primary)] transition-all pointer-events-none">
                            Remarks (Optional)
                          </label>
                        </div>
                      </div>
                      {foodInputs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFoodField(idx)}
                          className="mt-1.5 p-1 rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-danger-text)] hover:bg-[var(--color-danger-bg-subtle)] transition-colors"
                          title={`Remove ${input.name || "item"}`}
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t-2 border-dashed border-[var(--color-border-default)] pt-6 mt-4">
                <div className="relative">
                  <input
                    type="date"
                    id="logDate"
                    value={logDate}
                    max={new Date().toLocaleDateString('en-CA')}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="w-full bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] rounded-lg px-3 py-2.5 text-[var(--color-text-default)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                    required
                  />
                  <label
                    htmlFor="logDate"
                    className="absolute left-3 -top-2.5 text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-surface)] px-1 pointer-events-none"
                  >
                    Date
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="time"
                    id="logTime"
                    value={logTime}
                    onChange={(e) => setLogTime(e.target.value)}
                    className="w-full bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] rounded-lg px-3 py-2.5 text-[var(--color-text-default)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                    required
                  />
                  <label
                    htmlFor="logTime"
                    className="absolute left-3 -top-2.5 text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-surface)] px-1 pointer-events-none"
                  >
                    Time
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 mt-4">
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={addFoodField}
                    className="text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] flex items-center gap-1 transition-colors transform hover:scale-105"
                  >
                    <Plus size={16} /> Add Item
                  </button>
                </div>
                <div className="flex gap-4 items-center">
                  <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value)}
                    className="w-48 bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] rounded-lg px-3 py-2.5 text-[var(--color-text-default)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                  >
                    <option value="Early-Morning">Early-Morning</option>
                    <option value="Breakfast">Breakfast</option>
                    <option value="Mid-Morning Snack">Mid-Morning Snack</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Afternoon Snack">Afternoon Snack</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Bedtime">Bedtime</option>
                  </select>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-40 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-text-on-primary)] py-2.5 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 disabled:transform-none disabled:shadow-md"
                  >
                    {isSubmitting ? (
                      <Loader className="animate-spin" />
                    ) : (
                      "Log Meal"
                    )}
                  </button>
                </div>
              </div>
            </motion.form>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-[var(--color-bg-surface)] border-2 border-[var(--color-border-default)] rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-xl font-[var(--font-primary)] font-semibold text-[var(--color-text-strong)] mb-4">
                Recently Logged
              </h3>
              <div className="mb-6 bg-[var(--color-bg-interactive-subtle)] p-4 rounded-lg">
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                  <div className="relative flex-1 w-full">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                      size={18}
                    />
                    <input
                      type="date"
                      value={searchDate}
                      max={new Date().toLocaleDateString('en-CA')}

                      onChange={(e) => {
                        const newDate = e.target.value;
                        setSearchDate(newDate);
                        searchByDate(
                          newDate || new Date().toISOString().split("T")[0]
                        );
                      }}
                      className="w-full bg-[var(--color-bg-surface)] border-2 border-[var(--color-border-default)] rounded-lg pl-10 pr-4 py-2 text-[var(--color-text-default)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {isFetching ? (
                <div className="flex items-center justify-center p-6 text-center text-[var(--color-text-muted)] gap-2">
                  <Loader className="animate-spin" />
                  Loading meals...
                </div>
              ) : loggedMeals.length === 0 ? (
                <div className="text-[var(--color-text-default)] p-6 bg-[var(--color-bg-app)] rounded-xl border-2 border-dashed border-[var(--color-border-default)] text-center">
                  <p className="font-semibold">
                    No meals logged for this date.
                  </p>
                  <p className="text-sm">Use the form above to add a meal!</p>
                </div>
              ) : (
                <>
                  <ul className="space-y-3">
                    <AnimatePresence>
                      {loggedMeals.map((meal) => {
                        const style =
                          mealTypeStyles[meal.meal_type.toLowerCase()] ||
                          mealTypeStyles.snack;
                        return (
                          <motion.li
                            key={meal.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{
                              opacity: 0,
                              x: -20,
                              transition: { duration: 0.2 },
                            }}
                            layout
                            className={`group flex items-center gap-4 p-3 rounded-lg border-2 shadow-sm relative transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-px ${style.border}`}
                          >
                            <div
                              className={`p-3 rounded-full text-xl transition-transform group-hover:scale-110 ${style.bg} ${style.iconColor}`}
                            >
                              {getMealIcon(meal.meal_type)}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-[var(--color-text-strong)] text-base">
                                {meal.food_name}
                              </p>
                              <p className="text-sm text-[var(--color-text-default)] capitalize">
                                {meal.meal_type} • {meal.quantity} {meal.unit}{" "}
                                {meal.consumed_at && (
                                  <span className="text-[var(--color-text-muted)]">
                                    {" "}
                                    •{" "}
                                    {new Date(
                                      meal.consumed_at
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                )}
                              </p>
                              {meal.remarks && (
                                <p className="text-sm italic text-[var(--color-primary)] mt-1">
                                  {meal.remarks}
                                </p>
                              )}
                            </div>
                            <div className="text-right flex items-center gap-6">
                              <div className="hidden sm:flex text-xs items-center gap-4">
                                <span className="font-bold text-[var(--color-warning-text)]">
                                  {Math.round(meal.calories ?? 0)} kcal
                                </span>
                                <span className="font-semibold text-[var(--color-primary)]">
                                  {Math.round(meal.protein ?? 0)}g P
                                </span>
                                <span className="font-semibold text-[var(--color-accent-1-text)]">
                                  {Math.round(meal.carbs ?? 0)}g C
                                </span>
                                <span className="font-semibold text-[var(--color-danger-text)]">
                                  {Math.round(meal.fats ?? 0)}g F
                                </span>
                              </div>
                              <button
                                onClick={() => handleDeleteMeal(meal.id)}
                                className="text-[var(--color-text-muted)] hover:text-[var(--color-danger-text)] transition-colors p-1 rounded-full hover:bg-[var(--color-danger-bg-subtle)]"
                                title="Remove"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </motion.li>
                        );
                      })}
                    </AnimatePresence>
                  </ul>
                  <div className="flex justify-center items-center mt-6 space-x-4">
                    <button
                      onClick={handlePrevPage}
                      disabled={!pagination.previous}
                      className="p-2 rounded-full border-2 border-[var(--color-border-default)] transition-all duration-300 enabled:hover:bg-[var(--color-bg-interactive-subtle)] enabled:hover:border-[var(--color-primary)] disabled:opacity-50"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className="text-sm text-[var(--color-text-default)] font-semibold">
                      Page {currentPage}
                    </span>
                    <button
                      onClick={handleNextPage}
                      disabled={!pagination.next}
                      className="p-2 rounded-full border-2 border-[var(--color-border-default)] transition-all duration-300 enabled:hover:bg-[var(--color-bg-interactive-subtle)] enabled:hover:border-[var(--color-primary)] disabled:opacity-50"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col items-start space-y-8"
          >
            <div className="bg-[var(--color-bg-surface)] border-2 border-[var(--color-border-default)] rounded-2xl shadow-lg p-6 w-full">
              <h4 className="font-[var(--font-primary)] font-semibold text-xl text-[var(--color-text-strong)] mb-4">
                Today's Summary
              </h4>
              <div className="flex items-center gap-3 mb-4 border-b-2 border-dashed border-[var(--color-border-default)] pb-4">
                <span className="bg-[var(--color-warning-bg-subtle)] p-3 rounded-full text-[var(--color-warning-text)] text-2xl">
                  <FaFireAlt />
                </span>
                <div>
                  <p className="text-2xl font-bold text-[var(--color-text-strong)]">
                    {dailySummary.calories?.toFixed(0) || 0} kcal
                  </p>
                  <p className="text-sm text-[var(--color-text-default)]">
                    of {calorieGoal?.toFixed(0) || 2000} goal
                  </p>
                </div>
              </div>
              <div className="space-y-4 text-sm">
                {[
                  {
                    label: "Carbs",
                    value: dailySummary.carbs,
                    target: macroTargets.carbs,
                    color: "bg-[var(--color-accent-1-text)]",
                    icon: (
                      <FaBreadSlice className="text-[var(--color-accent-1-text)]" />
                    ),
                  },
                  {
                    label: "Protein",
                    value: dailySummary.protein,
                    target: macroTargets.protein,
                    color: "bg-[var(--color-primary)]",
                    icon: (
                      <FaDrumstickBite className="text-[var(--color-primary)]" />
                    ),
                  },
                  {
                    label: "Fat",
                    value: dailySummary.fat,
                    target: macroTargets.fat,
                    color: "bg-[var(--color-danger-text)]",
                    icon: (
                      <FaTint className="text-[var(--color-danger-text)]" />
                    ),
                  },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-[var(--color-text-strong)] flex items-center gap-2">
                        {item.icon} {item.label}
                      </span>
                      <span className="text-[var(--color-text-default)]">
                        {item.value?.toFixed(1) || "0.0"}g / {item.target}g
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[var(--color-bg-interactive-subtle)] rounded-full overflow-hidden">
                      <div
                        className={`${item.color} h-full rounded-full transition-all duration-500`}
                        style={{
                          width: `${getProgressPercent(
                            item.value,
                            item.target
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[var(--color-bg-surface)] border-2 border-[var(--color-border-default)] rounded-2xl shadow-lg p-6 w-full">
              <h4 className="font-[var(--font-primary)] font-semibold text-xl text-[var(--color-text-strong)] mb-4">
                Other Goals
              </h4>
              <div className="text-base space-y-3 font-semibold text-[var(--color-text-default)]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FaGlassWhiskey className="text-[var(--color-info-text)]" />{" "}
                    Water Intake
                  </span>
                  <span>
                    {waterGlasses} glasses
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MealLogger;