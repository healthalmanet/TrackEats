// src/pages/dashboard/Meals.jsx

import React, { useEffect, useState, useCallback } from 'react';
import { Flame, Dumbbell, Sun, Droplets, HeartPulse, ShieldCheck, Activity, Brain, ChevronDown } from "lucide-react";
import { BsSunFill, BsFillCloudSunFill, BsFillMoonStarsFill } from "react-icons/bs";
import { FaBreadSlice, FaFish, FaAppleAlt, FaMugHot, FaConciergeBell, FaBed, FaLeaf, FaEye } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { Loader } from 'lucide-react';


// API Imports
import { getDietApi, getDietHistoryApi } from '../../api/dietApi'; 
import { getUserProfile } from '../../api/userProfile';
import { getDiabeticProfile } from '../../api/diabeticApi';

// --- THEME-ALIGNED LIFESTYLE RECOMMENDATION ENGINE ---
const generateHealthTips = (profile, report) => {
  if (!profile || !report) return [];
  const bmi = profile.weight_kg / ((profile.height_cm / 100) ** 2);
  
  const tipLibrary = [
    { id: 'manage_sugar', priority: 10, condition: () => profile.is_diabetic || report.hba1c > 5.7, content: { icon: <ShieldCheck />, title: "Focus on Low-GI Carbs", description: "Choose whole grains and vegetables over refined carbs to help keep your blood sugar levels stable.", bg: 'bg-[var(--color-warning-bg-subtle)]', color: 'text-[var(--color-warning-text)]' }},
    { id: 'heart_health', priority: 9, condition: () => report.ldl_cholesterol > 100 || report.triglycerides > 150 || profile.is_hypertensive, content: { icon: <HeartPulse />, title: "Support Heart Health", description: "Incorporate healthy fats from avocados and nuts, and be mindful of sodium to support healthy blood pressure.", bg: 'bg-[var(--color-danger-bg-subtle)]', color: 'text-[var(--color-danger-text)]' }},
    { id: 'weight_management_protein', priority: 8, condition: () => bmi > 25 && profile.goal === 'lose_weight', content: { icon: <Dumbbell />, title: "Prioritize Protein & Fiber", description: "Including lean protein and fiber can help you feel full longer, aiding in weight management.", bg: 'bg-[var(--color-success-bg-subtle)]', color: 'text-[var(--color-success-text)]' }},
    { id: 'vitamin_d', priority: 7, condition: () => report.vitamin_d3 < 30, content: { icon: <Sun />, title: "Get Your Daily Dose of Sunshine", description: "Aim for 15-20 minutes of morning sun and include mushrooms or fortified foods in your diet.", bg: 'bg-[var(--color-accent-1-bg-subtle)]', color: 'text-[var(--color-accent-1-text)]' }},
    { id: 'vitamin_b12', priority: 6, condition: () => report.vitamin_b12 < 300, content: { icon: <Brain />, title: "Boost Your B12 Intake", description: "Support your energy and nerve health with Vitamin B12 from dairy, eggs, or fortified foods.", bg: 'bg-[var(--color-accent-2-bg-subtle)]', color: 'text-[var(--color-accent-2-text)]' }},
    { id: 'increase_activity', priority: 5, condition: () => profile.activity_level === 'sedentary' || profile.activity_level === 'lightly_active', content: { icon: <Activity />, title: "Incorporate More Movement", description: "A brisk 30-minute walk each day can improve your metabolic health, mood, and energy.", bg: 'bg-[var(--color-info-bg-subtle)]', color: 'text-[var(--color-info-text)]' }},
    { id: 'gut_health', priority: 4, condition: () => profile.has_gastric_issues, content: { icon: <FaLeaf />, title: "Nurture Your Gut Health", description: "Support digestion with fiber-rich foods and probiotics like yogurt. Remember to stay hydrated.", bg: 'bg-[var(--color-success-bg-subtle)]', color: 'text-[var(--color-success-text)]' }},
    { id: 'hydration', priority: 1, condition: () => true, content: { icon: <Droplets />, title: "Focus on Hydration", description: "Drinking enough water is crucial for energy and digestion. Carry a water bottle as a reminder.", bg: 'bg-[var(--color-info-bg-subtle)]', color: 'text-[var(--color-info-text)]' }},
    { id: 'mindful_eating', priority: 1, condition: () => true, content: { icon: <Brain />, title: "Practice Mindful Eating", description: "Pay attention to hunger and fullness cues. Eating slowly can improve digestion and satisfaction.", bg: 'bg-[var(--color-accent-3-bg-subtle)]', color: 'text-[var(--color-accent-3-text)]' }}
  ];

  const matchedTips = tipLibrary.filter(tip => tip.condition());
  const uniqueMatchedTips = Array.from(new Map(matchedTips.map(tip => [tip.id, tip])).values());
  uniqueMatchedTips.sort((a, b) => b.priority - a.priority);
  return uniqueMatchedTips.slice(0, 4);
};

const Meals = () => {
  // ... (State and data fetching logic remains the same)
  const [showAll, setShowAll] = useState(false);
  const [activeDay, setActiveDay] = useState(null);
  const [dietData, setDietData] = useState(null);
  const [dailyMeals, setDailyMeals] = useState([]);
  const [healthTips, setHealthTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allPlans, setAllPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState('current');
  const formatDate = useCallback((dateString) => { if (!dateString) return ''; const date = new Date(dateString); return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }); }, []);
  const getMealIcon = (mealType) => ({'Early-Morning':<FaMugHot />,'Breakfast':<BsSunFill />,'Mid-Morning Snack':<FaAppleAlt />,'Lunch':<BsFillCloudSunFill />,'Afternoon Snack':<FaConciergeBell />,'Dinner':<BsFillMoonStarsFill />,'Bedtime':<FaBed />}[mealType]||<FaLeaf />);
  const processPlanData = useCallback((plan) => { if (!plan) return { processedDietData: null, processedDailyMeals: [] }; const mealsData = plan.meals?.plan_data?.meals ? plan.meals.plan_data.meals : plan.meals; if (typeof mealsData !== 'object' || mealsData === null || !Object.keys(mealsData).length || mealsData.message) { return { processedDietData: { ...plan, status: 'NO_MEALS_DATA', message: 'No detailed meal data available for this plan.' }, processedDailyMeals: [] }; } let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFats = 0; const dayCount = Object.keys(mealsData).length; Object.values(mealsData).forEach(day => Object.values(day).forEach(meal => { totalCalories += meal.Calories || 0; totalProtein += meal.Protein || 0; totalCarbs += meal.Carbs || 0; totalFats += meal.Fats || 0; })); const processedPlan = { ...plan }; processedPlan.total_average_nutrition = { calories: dayCount > 0 ? totalCalories / dayCount : 0, protein: dayCount > 0 ? totalProtein / dayCount : 0, carbs: dayCount > 0 ? totalCarbs / dayCount : 0, fats: dayCount > 0 ? totalFats / dayCount : 0, }; const startDateString = processedPlan.for_week_starting; const transformedMeals = Object.entries(mealsData).map(([dayKey, dayData]) => { const dayNumber = parseInt(dayKey.replace('Day ', ''), 10); const currentDate = new Date(startDateString); currentDate.setDate(new Date(startDateString).getDate() + dayNumber - 1); const dailyTotalCalories = Object.values(dayData).reduce((sum, meal) => sum + (meal.Calories || 0), 0); return { id: dayKey, dayOfWeek: dayKey, date: currentDate.toISOString().split('T')[0], meals: dayData, totalCalories: dailyTotalCalories }; }); return { processedDietData: processedPlan, processedDailyMeals: transformedMeals }; }, []);
  useEffect(() => { const fetchAllData = async () => { setLoading(true); try { const [currentPlanResponse, historyResponse, profileResponse, medicalResponse] = await Promise.all([ getDietApi(), getDietHistoryApi(), getUserProfile(), getDiabeticProfile() ]); let combinedPlans = []; let initialPlanToDisplay = null; let currentPlanStartDate = null; if (currentPlanResponse.status_code === "ACTIVE_PLAN_FOUND" && currentPlanResponse.plan_data) { const currentPlan = { ...currentPlanResponse.plan_data, id: 'current', label: 'Current Active Plan' }; combinedPlans.push(currentPlan); initialPlanToDisplay = currentPlan; currentPlanStartDate = currentPlan.for_week_starting; } if (historyResponse.status_code === "HISTORY_FOUND" && Array.isArray(historyResponse.plans)) { const uniqueHistory = historyResponse.plans.filter(p => p.for_week_starting !== currentPlanStartDate); const formattedHistory = uniqueHistory.map(p => ({ ...p, label: `Plan: ${formatDate(p.for_week_starting)}`})); combinedPlans = [...combinedPlans, ...formattedHistory]; } setAllPlans(combinedPlans); if (initialPlanToDisplay) { const { processedDietData, processedDailyMeals } = processPlanData(initialPlanToDisplay); setDietData(processedDietData); setDailyMeals(processedDailyMeals); setSelectedPlanId('current'); } else if (combinedPlans.length > 0) { const firstPlan = combinedPlans[0]; const { processedDietData, processedDailyMeals } = processPlanData(firstPlan); setDietData(processedDietData); setDailyMeals(processedDailyMeals); setSelectedPlanId(firstPlan.id); } else { setDietData({ status: 'NO_PLAN_FOUND', message: 'No diet plans found.' }); } if (profileResponse && medicalResponse) { setHealthTips(generateHealthTips(profileResponse, medicalResponse)); } } catch (error) { console.error("Failed to fetch diet data:", error); setDietData({ status: 'ERROR', message: 'Failed to load data.' }); } finally { setLoading(false); } }; fetchAllData(); }, [processPlanData, formatDate]);
  const handlePlanChange = (e) => { const newPlanId = e.target.value; const selectedPlan = allPlans.find(p => String(p.id) === String(newPlanId)); if (selectedPlan) { const { processedDietData, processedDailyMeals } = processPlanData(selectedPlan); setDietData(processedDietData); setDailyMeals(processedDailyMeals); setSelectedPlanId(newPlanId); setShowAll(false); setActiveDay(null); } };
  const handleCardClick = (day) => setActiveDay(day);
  const handleCloseModal = () => setActiveDay(null);
  const displayedDays = showAll ? dailyMeals : dailyMeals.slice(0, 6);
  
  if (loading) { return <div className="flex flex-col justify-center items-center h-screen bg-[var(--color-bg-app)]"><Loader className="w-16 h-16 animate-spin text-[var(--color-primary)]" /></div>; }  
  if (!dietData || dietData.status === 'NO_PLAN_FOUND' || dietData.status === 'ERROR') { return <div className="min-h-screen bg-[var(--color-bg-app)] flex items-center justify-center p-6"><div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-2xl p-8 max-w-lg w-full text-center shadow-lg opacity-0 animate-fade-up"><h1 className="text-3xl font-[var(--font-primary)] font-bold text-[var(--color-text-strong)] mb-3 capitalize">No Plan Available</h1><p className="mt-6 text-md text-[var(--color-text-default)]">{dietData?.message || 'Your diet plan is not available. Please check back later.'}</p></div></div>; }

  return (
    <div className="min-h-screen bg-[var(--color-bg-app)] p-4 sm:p-6 lg:p-10 font-[var(--font-secondary)] text-[var(--color-text-default)]">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-[var(--color-text-strong)] font-[var(--font-primary)]" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.05)' }}>Your Diet Plan</h1>
              <p className="text-lg mt-2">{dietData.for_week_starting ? `Week starting ` : ''}<span className="font-bold text-[var(--color-primary)]">{formatDate(dietData.for_week_starting)}</span></p>
            </div>
            {allPlans.length > 1 && (
              <div className="relative">
                <select id="plan-selector" value={selectedPlanId} onChange={handlePlanChange} className="appearance-none w-full sm:w-64 bg-[var(--color-bg-surface)] border-2 border-[var(--color-border-default)] text-[var(--color-text-strong)] font-semibold py-3 pl-4 pr-10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-[var(--color-border-focus)] focus:border-[var(--color-border-focus)] transition-all duration-300">
                  {allPlans.map(plan => (<option key={plan.id} value={plan.id}>{plan.label}</option>))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[var(--color-text-default)]"><ChevronDown size={20} /></div>
              </div>
            )}
          </div>
        </header>

        {healthTips.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-[var(--font-primary)] font-semibold text-[var(--color-text-strong)] mb-5 opacity-0 animate-fade-up" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>Your Top Recommendations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {healthTips.map((tip, idx) => (
                <div 
                  key={tip.id} 
                  className={`group flex items-start gap-4 p-5 rounded-2xl border-2 border-transparent shadow-md transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-2 hover:border-[var(--color-primary)] opacity-0 animate-fade-up ${tip.content.bg}`}
                  style={{ animationDelay: `${200 + idx * 100}ms`, animationFillMode: 'forwards' }}
                >
                   <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-white/60 text-2xl transition-transform duration-300 group-hover:scale-110 ${tip.content.color}`}>{tip.content.icon}</div>
                   <div><h3 className="font-[var(--font-primary)] font-bold text-[var(--color-text-strong)]">{tip.content.title}</h3><p className="text-sm text-[var(--color-text-default)] mt-1">{tip.content.description}</p></div>
                </div>
              ))}
            </div>
          </section>
        )}
        
        {(dietData.status === 'approved' || dietData.status === 'active') && dailyMeals.length > 0 ? (
          <>
            <section className="bg-[var(--color-bg-surface-glass)] backdrop-blur-sm border border-[var(--color-border-default)] rounded-2xl shadow-lg p-6 mb-10 opacity-0 animate-fade-up" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
              <h2 className="text-xl font-[var(--font-primary)] font-semibold text-[var(--color-text-strong)] mb-4">Average Daily Nutrition</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {[ { label: 'Avg Calories', value: Math.round(dietData.total_average_nutrition.calories), icon: <Flame />, bg: 'bg-[var(--color-stat-1-bg)]' }, { label: 'Avg Protein', value: `${dietData.total_average_nutrition.protein.toFixed(1)}g`, icon: <Dumbbell />, bg: 'bg-[var(--color-stat-2-bg)]' }, { label: 'Avg Carbs', value: `${dietData.total_average_nutrition.carbs.toFixed(1)}g`, icon: <FaBreadSlice />, bg: 'bg-[var(--color-stat-3-bg)]' }, { label: 'Avg Fats', value: `${dietData.total_average_nutrition.fats.toFixed(1)}g`, icon: <FaFish />, bg: 'bg-[var(--color-stat-4-bg)]' } ].map(item => ( <div key={item.label} className={`group p-4 rounded-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg ${item.bg}`}><div className="text-[var(--color-primary)] text-2xl mx-auto w-fit transition-transform duration-300 group-hover:scale-110">{item.icon}</div><p className="mt-2 text-sm font-semibold text-[var(--color-text-default)]">{item.label}</p><p className="text-2xl font-bold text-[var(--color-text-strong)]">{item.value}</p></div> ))}
              </div>
            </section>

            <section className="opacity-0 animate-fade-up" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
              <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-[var(--font-primary)] font-semibold text-[var(--color-text-strong)]">{dailyMeals.length}-Day Meal Plan</h2></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {displayedDays.map((day, idx) => ( 
                  <div key={day.id} onClick={() => handleCardClick(day)} className="group relative bg-[var(--color-bg-surface)] border-2 border-[var(--color-border-default)] rounded-2xl p-5 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer opacity-0 animate-fade-up" style={{ animationDelay: `${idx * 80}ms`, animationFillMode: 'forwards' }}>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-[var(--font-primary)] font-bold text-lg text-[var(--color-text-strong)]">{day.dayOfWeek}</h3>
                      <span className="bg-[var(--color-bg-surface-alt)] text-xs text-[var(--color-text-default)] px-3 py-1 rounded-full font-medium transition-colors duration-300 group-hover:bg-[var(--color-bg-surface)]">{formatDate(day.date).split(',')[0]}</span>
                    </div>
                    <ul className="text-sm space-y-3 text-[var(--color-text-default)]">
                      {[ 'Breakfast', 'Lunch', 'Dinner' ].map(mealType => ( <li key={mealType} className="flex items-center gap-3"><div className="w-4 h-4 text-[var(--color-primary)] flex-shrink-0">{getMealIcon(mealType)}</div><span className='truncate'>{day.meals[mealType]?.food_name || 'Not specified'}</span></li> ))}
                    </ul>
                    <div className="border-t-2 border-dashed border-[var(--color-border-default)] mt-4 pt-3 text-right">
                      <span className="font-bold text-lg text-[var(--color-text-strong)]">{Math.round(day.totalCalories)}</span>
                      <span className="text-sm text-[var(--color-primary)] ml-1 font-semibold">kcal</span>
                    </div>
                    <div className="absolute inset-0 border-2 border-transparent rounded-2xl group-hover:border-[var(--color-primary)] transition-all duration-300 pointer-events-none"></div>
                  </div> 
                ))}
              </div>
              {!showAll && dailyMeals.length > 6 && ( <div className="text-center mt-10 opacity-0 animate-fade-up" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}><button onClick={() => setShowAll(true)} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-text-on-primary)] px-8 py-3 rounded-full font-semibold font-[var(--font-primary)] shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 mx-auto"><FaEye /> View All {dailyMeals.length} Days</button></div> )}
            </section>
          </>
        ) : (
           <div className="min-h-[30vh] bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-2xl p-8 w-full text-center shadow-lg flex flex-col justify-center items-center opacity-0 animate-fade-up"><h1 className="text-2xl font-[var(--font-primary)] font-bold text-[var(--color-text-strong)] mb-3 capitalize">Plan Status: <span className="text-[var(--color-primary-hover)]">{dietData.status?.replace(/_/g, ' ') || 'Pending'}</span></h1><p className="mt-4 text-md text-[var(--color-text-default)] max-w-md">{dietData?.message || 'The details for this plan are not available.'}</p></div>
        )}
      </div>
      
      {activeDay && ( <div className="fixed inset-0 bg-[var(--color-bg-backdrop)] backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in duration-300"><div className="bg-[var(--color-bg-surface)] rounded-2xl p-6 w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar animate-fade-up duration-500"><button onClick={handleCloseModal} className="absolute top-3 right-3 text-[var(--color-text-subtle)] hover:text-[var(--color-primary-hover)] bg-[var(--color-bg-interactive-subtle)] hover:bg-red-100 rounded-full p-1.5 transition-all duration-300 transform hover:rotate-90"><IoClose size={20} /></button><h2 className="text-2xl font-[var(--font-primary)] font-bold text-[var(--color-text-strong)] mb-1">{activeDay.dayOfWeek}</h2><p className="text-sm text-[var(--color-text-default)] mb-6">{formatDate(activeDay.date)}</p><div className="space-y-4">{['Early-Morning', 'Breakfast', 'Mid-Morning Snack', 'Lunch', 'Afternoon Snack', 'Dinner', 'Bedtime'].map((mealType) => { const meal = activeDay.meals[mealType]; if (!meal) return null; return ( <div key={mealType} className="bg-[var(--color-bg-surface-alt)]/60 p-4 rounded-xl border border-[var(--color-border-default)]"><div className='flex items-center gap-3 mb-2'><span className="text-xl text-[var(--color-primary)]">{getMealIcon(mealType)}</span><p className="font-semibold font-[var(--font-primary)] text-[var(--color-text-strong)]">{mealType.replace(/-/g, ' ')}</p></div><p className="text-sm text-[var(--color-text-default)] mb-3 ml-9">{meal.food_name}</p><div className="grid grid-cols-4 gap-2 text-xs text-center ml-9"><div><p className="text-[var(--color-text-muted)]">Calories</p><p className="font-bold text-[var(--color-text-strong)]">{Math.round(meal.Calories)}</p></div><div><p className="text-[var(--color-text-muted)]">Protein</p><p className="font-bold text-[var(--color-text-strong)]">{meal.Protein}g</p></div><div><p className="text-[var(--color-text-muted)]">Carbs</p><p className="font-bold text-[var(--color-text-strong)]">{meal.Carbs}g</p></div><div><p className="text-[var(--color-text-muted)]">Fats</p><p className="font-bold text-[var(--color-text-strong)]">{meal.Fats}g</p></div></div></div> ); })}</div></div></div> )}
    </div>
  );
};

export default Meals;