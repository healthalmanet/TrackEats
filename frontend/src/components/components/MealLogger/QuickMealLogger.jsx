// src/components/dashboard/QuickMealLogger.jsx

import React from 'react';
// FIX 1: Remove unused FaTrash import
import { FaUtensils } from 'react-icons/fa';
import useMealLogger from './UseMealLogger';
// FIX 2: Add the missing Trash2 icon to the import list
import { Plus, Loader, ChevronLeft, ChevronRight, Search, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';

const QuickMealLogger = ({ onMealLogged }) => {
  const {
    foodInputs, handleFoodChange, addFoodField, removeFoodField,
    unitOptions, mealType, setMealType, handleSubmit,
    loggedMeals, handleDeleteMeal, pagination, currentPage, handlePageChange,
    searchDate, setSearchDate, searchByDate, isSubmitting, isFetching
  } = useMealLogger();

  const mealTypeMap = {
    "Early Morning": "Early-Morning", "Breakfast": "Breakfast", "Mid-Morning": "Mid-Morning Snack",
    "Lunch": "Lunch", "Afternoon": "Afternoon Snack", "Dinner": "Dinner", "Bedtime": "Bedtime",
  };

  const mealTypeStyles = {
    "early-morning": { border: 'border-[var(--color-accent-1-text)]', bg: 'bg-[var(--color-accent-1-bg-subtle)]', iconColor: 'text-[var(--color-accent-1-text)]' },
    "breakfast": { border: 'border-[var(--color-success-text)]', bg: 'bg-[var(--color-success-bg-subtle)]', iconColor: 'text-[var(--color-success-text)]' },
    "mid-morning snack": { border: 'border-[var(--color-accent-2-text)]', bg: 'bg-[var(--color-accent-2-bg-subtle)]', iconColor: 'text-[var(--color-accent-2-text)]' },
    "lunch": { border: 'border-[var(--color-warning-text)]', bg: 'bg-[var(--color-warning-bg-subtle)]', iconColor: 'text-[var(--color-warning-text)]' },
    "afternoon snack": { border: 'border-[var(--color-accent-3-text)]', bg: 'bg-[var(--color-accent-3-bg-subtle)]', iconColor: 'text-[var(--color-accent-3-text)]' },
    "dinner": { border: 'border-[var(--color-danger-text)]', bg: 'bg-[var(--color-danger-bg-subtle)]', iconColor: 'text-[var(--color-danger-text)]' },
    "bedtime": { border: 'border-[var(--color-info-text)]', bg: 'bg-[var(--color-info-bg-subtle)]', iconColor: 'text-[var(--color-info-text)]' },
  };

  return (
    <section className="w-full bg-[var(--color-bg-app)] px-6 sm:px-12 py-16 font-[var(--font-secondary)]">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-12">
          <h2 className="text-center text-2xl sm:text-3xl font-[var(--font-primary)] font-bold text-[var(--color-text-strong)]">Quick Meal Logger</h2>
          <p className="text-lg text-[var(--color-text-default)] mt-2">Track your nutrition smartly & simply</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.form
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            onSubmit={async (e) => { e.preventDefault(); await handleSubmit(e); if (onMealLogged) onMealLogged(); }}
            className="bg-[var(--color-bg-surface)] rounded-2xl p-6 shadow-xl border-2 border-[var(--color-border-default)]"
          >
            <div className="flex items-center gap-3 mb-6">
              <FaUtensils size={24} className="text-[var(--color-primary)]" />
              <h3 className="text-xl font-semibold text-[var(--color-text-strong)]">Add a Meal</h3>
            </div>
            
            <AnimatePresence>
              {foodInputs.map((item, index) => (
                <motion.div key={item.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 space-y-3 border-t-2 border-dashed border-[var(--color-border-default)] pt-4 overflow-hidden">
                  <div className="flex flex-wrap items-center gap-3">
                    <input type="text" value={item.name} onChange={(e) => handleFoodChange(index, 'name', e.target.value)} placeholder={`Food ${index + 1}`} className="flex-1 bg-[var(--color-bg-app)] text-[var(--color-text-strong)] border-2 border-[var(--color-border-default)] rounded-lg px-3 py-2 text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition" required />
                    <input type="number" value={item.quantity} onChange={(e) => handleFoodChange(index, 'quantity', e.target.value)} placeholder="Qty" className="w-20 bg-[var(--color-bg-app)] text-[var(--color-text-strong)] border-2 border-[var(--color-border-default)] rounded-lg px-2 py-2 text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition" />
                    <select value={item.unit} onChange={(e) => handleFoodChange(index, 'unit', e.target.value)} className="bg-[var(--color-bg-app)] text-[var(--color-text-strong)] border-2 border-[var(--color-border-default)] rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-[var(--color-primary)] transition"><option value="">Unit</option>{unitOptions.map((unit) => <option key={unit} value={unit}>{unit}</option>)}</select>
                  </div>
                  <input type="text" value={item.remark} onChange={(e) => handleFoodChange(index, 'remark', e.target.value)} placeholder="Remark (optional)" className="w-full bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] text-[var(--color-text-strong)] rounded-lg px-3 py-2 text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition" />
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="flex gap-4 mb-6">
              <button type="button" onClick={addFoodField} className="text-[var(--color-primary)] text-sm font-semibold hover:text-[var(--color-primary-hover)] transition-colors flex items-center gap-1"><Plus size={16}/> Add Food Item</button>
              {foodInputs.length > 1 && (<button type="button" onClick={() => removeFoodField(foodInputs.length - 1)} className="text-[var(--color-danger-text)] text-sm font-semibold hover:opacity-80 transition-colors flex items-center gap-1"><Trash2 size={16}/> Remove Last</button>)}
            </div>

            <div className="mb-6">
              <label className="block text-base mb-2 font-medium text-[var(--color-text-strong)]">Meal Type</label>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(mealTypeMap).map(([label, value]) => (
                  <label key={value} className={`px-4 py-2 rounded-full text-sm font-semibold cursor-pointer border-2 transition-all duration-200 ${ mealType === value ? 'bg-[var(--color-primary)] text-[var(--color-text-on-primary)] border-[var(--color-primary)]' : 'border-[var(--color-border-default)] text-[var(--color-text-default)] bg-[var(--color-bg-surface)] hover:border-[var(--color-primary)] hover:text-[var(--color-text-strong)]' }`}>
                    <input type="radio" name="mealType" value={value} checked={mealType === value} onChange={() => setMealType(value)} className="hidden"/>{label}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <button type="submit" disabled={isSubmitting} className="w-full sm:w-3/5 bg-[var(--color-primary)] text-[var(--color-text-on-primary)] hover:bg-[var(--color-primary-hover)] px-6 py-3 rounded-full text-lg font-bold font-[var(--font-primary)] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                {isSubmitting ? <span className="flex items-center justify-center gap-2"><Loader className="animate-spin"/>Adding...</span> : <span className="flex items-center justify-center gap-2"><Plus/> Add Food</span>}
              </button>
            </div>
          </motion.form>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-[var(--color-bg-surface)] rounded-2xl p-6 shadow-xl border-2 border-[var(--color-border-default)]">
            <h3 className="text-xl font-semibold mb-4 text-[var(--color-text-strong)] font-[var(--font-primary)]">Logged Meals</h3>
            <div className="mb-6 bg-[var(--color-bg-interactive-subtle)] p-4 rounded-lg"><div className="relative w-full"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={18}/><input type="date" value={searchDate} max={new Date().toISOString().split("T")[0]} onChange={(e) => { const newDate = e.target.value; setSearchDate(newDate); searchByDate(newDate); }} className="w-full bg-[var(--color-bg-surface)] border-2 border-[var(--color-border-default)] rounded-lg pl-10 pr-4 py-2 text-[var(--color-text-default)] focus:outline-none focus:border-[var(--color-primary)] transition-colors" /></div></div>
            
            {isFetching ? (<div className="flex items-center justify-center p-6 text-center text-[var(--color-text-muted)] gap-2"><Loader className="animate-spin"/>Loading meals...</div>) : loggedMeals.length === 0 ? (
              <div className="text-[var(--color-text-default)] p-6 bg-[var(--color-bg-app)] rounded-xl border-2 border-dashed border-[var(--color-border-default)] text-center"><p className="font-semibold">No meals logged for this date.</p><p className="text-sm">Use the form above to add a meal!</p></div>
            ) : (
              <>
                <ul className="space-y-3">
                  <AnimatePresence>
                    {loggedMeals.map((meal) => {
                      const style = mealTypeStyles[meal.meal_type?.toLowerCase()] || {};
                      return (
                        <motion.li key={meal.id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20, transition: { duration: 0.2 }}} layout className={`group flex items-center gap-4 p-3 rounded-lg border-2 shadow-sm relative transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-px ${style.border || 'border-[var(--color-border-default)]'}`}>
                          <div className={`p-3 rounded-full text-xl transition-transform group-hover:scale-110 ${style.bg} ${style.iconColor}`}><FaUtensils /></div>
                          <div className="flex-1 truncate">
                              <p className="font-semibold text-[var(--color-text-strong)] text-base truncate">{meal.food_name}</p>
                              <p className="text-sm text-[var(--color-text-default)] capitalize">{meal.meal_type || 'Meal'} • {meal.quantity} {meal.unit}</p>
                          </div>
                          <div className="text-right flex items-center gap-6">
                              <button onClick={() => handleDeleteMeal(meal.id)} className="text-[var(--color-text-muted)] hover:text-[var(--color-danger-text)] transition-colors p-1 rounded-full hover:bg-[var(--color-danger-bg-subtle)]" title="Remove"><Trash2 size={16} /></button>
                          </div>
                        </motion.li>
                      )})}
                  </AnimatePresence>
                </ul>
                {pagination.count > 5 && (
                  <div className="flex justify-center items-center mt-6 space-x-2"><button onClick={() => handlePageChange(pagination.previous)} disabled={!pagination.previous} className="p-2 rounded-full border-2 border-[var(--color-border-default)] transition-all duration-300 enabled:hover:bg-[var(--color-bg-interactive-subtle)] enabled:hover:border-[var(--color-primary)] disabled:opacity-50"><ChevronLeft size={18} /></button><span className="text-sm text-[var(--color-text-default)] font-semibold">Page {currentPage} of {Math.ceil(pagination.count/5)}</span><button onClick={() => handlePageChange(pagination.next)} disabled={!pagination.next} className="p-2 rounded-full border-2 border-[var(--color-border-default)] transition-all duration-300 enabled:hover:bg-[var(--color-bg-interactive-subtle)] enabled:hover:border-[var(--color-primary)] disabled:opacity-50"><ChevronRight size={18} /></button></div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default QuickMealLogger;