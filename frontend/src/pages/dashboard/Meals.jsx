// src/pages/dashboard/Meals.jsx

import React, { useEffect, useState, useCallback } from 'react';
import { Flame, Dumbbell, Sun, Droplets, HeartPulse, ShieldCheck, Activity, Brain, ChevronDown } from "lucide-react";
import { BsSunFill, BsFillCloudSunFill, BsFillMoonStarsFill } from "react-icons/bs";
import { FaBreadSlice, FaFish, FaAppleAlt, FaMugHot, FaConciergeBell, FaBed, FaLeaf, FaEye } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

// API Imports - Assumes you have the axios-based API file
import { getDietApi, getDietHistoryApi } from '../../api/dietApi'; 
import { getUserProfile } from '../../api/userProfile';
import { getDiabeticProfile } from '../../api/diabeticApi';

// --- LIFESTYLE RECOMMENDATION ENGINE (Unchanged) ---
const generateHealthTips = (profile, report) => {
  if (!profile || !report) return [];
  const bmi = profile.weight_kg / ((profile.height_cm / 100) ** 2);
  const tipLibrary = [
    { id: 'manage_sugar', priority: 10, condition: () => profile.is_diabetic || report.hba1c > 5.7, content: { icon: <ShieldCheck />, title: "Focus on Low-GI Carbs", description: "Choose whole grains, legumes, and vegetables over refined carbs to help keep your blood sugar levels stable and manage energy.", bg: 'bg-orange-100/60', color: 'text-orange-700' }},
    { id: 'heart_health_fats', priority: 9, condition: () => report.ldl_cholesterol > 100 || report.triglycerides > 150, content: { icon: <HeartPulse />, title: "Embrace Healthy Fats", description: "Support your heart by choosing foods rich in healthy fats like avocados, nuts, seeds, and olive oil instead of saturated fats.", bg: 'bg-rose-100/60', color: 'text-rose-700' }},
    { id: 'heart_health_bp', priority: 9, condition: () => profile.is_hypertensive || report.blood_pressure_systolic >= 130, content: { icon: <HeartPulse />, title: "Be Mindful of Sodium", description: "To support healthy blood pressure, be mindful of your sodium intake from processed foods and add flavor with herbs and spices instead.", bg: 'bg-rose-100/60', color: 'text-rose-700' }},
    { id: 'weight_management_protein', priority: 8, condition: () => bmi > 25 && profile.goal === 'lose_weight', content: { icon: <Dumbbell />, title: "Prioritize Protein & Fiber", description: "Including lean protein and high-fiber foods in your meals can help you feel full longer, aiding in weight management and muscle support.", bg: 'bg-lime-100/60', color: 'text-lime-700' }},
    { id: 'vitamin_d', priority: 7, condition: () => report.vitamin_d3 < 30, content: { icon: <Sun />, title: "Get Your Daily Dose of Sunshine", description: "Aim for 15-20 minutes of morning sun to help your body produce Vitamin D. Also, include mushrooms and fortified foods in your diet.", bg: 'bg-amber-100/60', color: 'text-amber-700' }},
    { id: 'vitamin_b12', priority: 6, condition: () => report.vitamin_b12 < 300, content: { icon: <Brain />, title: "Boost Your B12 Intake", description: "To support your energy and nerve health, ensure you're getting enough Vitamin B12 from sources like dairy, eggs, or fortified foods.", bg: 'bg-indigo-100/60', color: 'text-indigo-700' }},
    { id: 'increase_activity', priority: 5, condition: () => profile.activity_level === 'sedentary' || profile.activity_level === 'lightly_active', content: { icon: <Activity />, title: "Incorporate More Movement", description: "Even a brisk 30-minute walk each day can significantly improve your metabolic health, mood, and energy levels.", bg: 'bg-sky-100/60', color: 'text-sky-700' }},
    { id: 'gut_health', priority: 4, condition: () => profile.has_gastric_issues, content: { icon: <FaLeaf />, title: "Nurture Your Gut Health", description: "Support your digestive system by including fiber-rich foods and probiotics like yogurt. Remember to stay well-hydrated.", bg: 'bg-green-100/60', color: 'text-green-700' }},
    { id: 'hydration', priority: 1, condition: () => true, content: { icon: <Droplets />, title: "Focus on Hydration", description: "Drinking enough water is crucial for energy, digestion, and overall health. Carry a water bottle as a reminder.", bg: 'bg-blue-100/60', color: 'text-blue-700' }},
    { id: 'mindful_eating', priority: 1, condition: () => true, content: { icon: <Brain />, title: "Practice Mindful Eating", description: "Pay attention to your body's hunger and fullness cues. Eating slowly without distractions can improve digestion and satisfaction.", bg: 'bg-purple-100/60', color: 'text-purple-700' }}
  ];
  const matchedTips = tipLibrary.filter(tip => tip.condition());
  const uniqueMatchedTips = Array.from(new Map(matchedTips.map(tip => [tip.id, tip])).values());
  uniqueMatchedTips.sort((a, b) => b.priority - a.priority);
  return uniqueMatchedTips.slice(0, 4);
};

const Meals = () => {
  const [showAll, setShowAll] = useState(false);
  const [activeDay, setActiveDay] = useState(null);
  const [dietData, setDietData] = useState(null);
  const [dailyMeals, setDailyMeals] = useState([]);
  const [healthTips, setHealthTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allPlans, setAllPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState('current');

  // --- UTILITY FUNCTIONS ---
  const formatDate = useCallback((dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      // CORRECTED LINE
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return dateString; // Fallback for unexpected formats
    }
  }, []);
  
  const getMealIcon = (mealType) => ({'Early-Morning':<FaMugHot />,'Breakfast':<BsSunFill />,'Mid-Morning Snack':<FaAppleAlt />,'Lunch':<BsFillCloudSunFill />,'Afternoon Snack':<FaConciergeBell />,'Dinner':<BsFillMoonStarsFill />,'Bedtime':<FaBed />}[mealType]||<FaLeaf />);
  
  const processPlanData = useCallback((plan) => {
    if (!plan) return { processedDietData: null, processedDailyMeals: [] };

    const mealsData = plan.meals?.plan_data?.meals ? plan.meals.plan_data.meals : plan.meals;
    
    if (typeof mealsData !== 'object' || mealsData === null || !Object.keys(mealsData).length || mealsData.message) {
      const noMealDataPlan = { ...plan, status: 'NO_MEALS_DATA', message: 'No detailed meal data available for this plan.' };
      return { processedDietData: noMealDataPlan, processedDailyMeals: [] };
    }

    let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFats = 0;
    const dayCount = Object.keys(mealsData).length;

    Object.values(mealsData).forEach(day => 
      Object.values(day).forEach(meal => {
        totalCalories += meal.Calories || 0;
        totalProtein += meal.Protein || 0;
        totalCarbs += meal.Carbs || 0;
        totalFats += meal.Fats || 0;
      })
    );

    const processedPlan = { ...plan };
    processedPlan.total_average_nutrition = {
      calories: dayCount > 0 ? totalCalories / dayCount : 0,
      protein: dayCount > 0 ? totalProtein / dayCount : 0,
      carbs: dayCount > 0 ? totalCarbs / dayCount : 0,
      fats: dayCount > 0 ? totalFats / dayCount : 0,
    };
    
    const startDateString = processedPlan.for_week_starting;
    const transformedMeals = Object.entries(mealsData).map(([dayKey, dayData]) => {
      const dayNumber = parseInt(dayKey.replace('Day ', ''), 10);
      const startDate = new Date(startDateString);
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + dayNumber - 1);
      
      const dailyTotalCalories = Object.values(dayData).reduce((sum, meal) => sum + (meal.Calories || 0), 0);
      
      return {
        id: dayKey,
        dayOfWeek: dayKey,
        date: currentDate.toISOString().split('T')[0],
        meals: dayData,
        totalCalories: dailyTotalCalories
      };
    });
    
    return { processedDietData: processedPlan, processedDailyMeals: transformedMeals };
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [currentPlanResponse, historyResponse, profileResponse, medicalResponse] = await Promise.all([
          getDietApi(),
          getDietHistoryApi(),
          getUserProfile(),
          getDiabeticProfile()
        ]);

        let combinedPlans = [];
        let initialPlanToDisplay = null;

        if (currentPlanResponse.status_code === "ACTIVE_PLAN_FOUND" && currentPlanResponse.plan_data) {
          const currentPlan = { 
            ...currentPlanResponse.plan_data, 
            id: 'current', 
            label: 'Current Active Plan' 
          };
          combinedPlans.push(currentPlan);
          initialPlanToDisplay = currentPlan;
        }

        if (historyResponse.status_code === "HISTORY_FOUND" && Array.isArray(historyResponse.plans)) {
          const formattedHistory = historyResponse.plans.map(p => ({
              ...p,
              label: `Plan: ${formatDate(p.for_week_starting)}`
          }));
          combinedPlans = [...combinedPlans, ...formattedHistory];
        }

        setAllPlans(combinedPlans);

        if (initialPlanToDisplay) {
          const { processedDietData, processedDailyMeals } = processPlanData(initialPlanToDisplay);
          setDietData(processedDietData);
          setDailyMeals(processedDailyMeals);
          setSelectedPlanId('current');
        } else if (combinedPlans.length > 0) {
          const firstPlan = combinedPlans[0];
          const { processedDietData, processedDailyMeals } = processPlanData(firstPlan);
          setDietData(processedDietData);
          setDailyMeals(processedDailyMeals);
          setSelectedPlanId(firstPlan.id);
        } else {
          setDietData({ status: 'NO_PLAN_FOUND', message: 'No diet plans found.' });
        }
        
        if (profileResponse && medicalResponse) {
          const tips = generateHealthTips(profileResponse, medicalResponse);
          setHealthTips(tips);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setDietData({ status: 'ERROR', message: 'Failed to load data.' });
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [processPlanData, formatDate]); 
  
  const handlePlanChange = (e) => {
    const newPlanId = e.target.value;
    const selectedPlan = allPlans.find(p => String(p.id) === String(newPlanId));
    
    if (selectedPlan) {
      const { processedDietData, processedDailyMeals } = processPlanData(selectedPlan);
      setDietData(processedDietData);
      setDailyMeals(processedDailyMeals);
      setSelectedPlanId(newPlanId);
      setShowAll(false);
      setActiveDay(null);
    }
  };
  
  const handleCardClick = (day) => setActiveDay(day);
  const handleCloseModal = () => setActiveDay(null);

  const displayedDays = showAll ? dailyMeals : dailyMeals.slice(0, 6);
  
  if (loading) { return <div className="flex flex-col justify-center items-center h-screen bg-[#FFFDF9]"><div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-[#FF7043]"></div><p className="text-xl text-[#546E7A] font-['Poppins'] mt-4">Loading Your Diet Plan...</p></div>; }
  
  if (!dietData || dietData.status === 'NO_PLAN_FOUND' || dietData.status === 'ERROR') { 
    return <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center p-6 font-['Roboto']"><div className="bg-white border border-[#ECEFF1] rounded-2xl p-8 max-w-lg w-full text-center shadow-xl"><h1 className="text-3xl font-['Poppins'] font-bold text-[#263238] mb-3 capitalize">No Plan Available</h1><p className="mt-6 text-md text-[#546E7A]">{dietData?.message || 'Your diet plan is not available. Please check back later.'}</p></div></div>; 
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] p-4 sm:p-6 lg:p-10 font-['Roboto'] text-[#546E7A]">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-[#263238] font-['Poppins']" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.05)' }}>Your Diet Plan</h1>
              <p className="text-lg mt-2">
                {dietData.for_week_starting ? `Week starting ` : ''} 
                <span className="font-bold text-[#FF7043]">{formatDate(dietData.for_week_starting)}</span>
              </p>
            </div>
            {allPlans.length > 1 && (
              <div className="relative">
                <select
                  id="plan-selector"
                  value={selectedPlanId}
                  onChange={handlePlanChange}
                  className="appearance-none w-full sm:w-64 bg-white border border-[#ECEFF1] text-[#263238] font-semibold py-3 pl-4 pr-10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF7043] focus:border-[#FF7043] transition"
                >
                  {allPlans.map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {plan.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#546E7A]">
                  <ChevronDown size={20} />
                </div>
              </div>
            )}
          </div>
        </header>

        {healthTips.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-['Poppins'] font-semibold text-[#263238] mb-5">Your Top Recommendations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {healthTips.map((tip) => (
                <div key={tip.id} className={`flex items-start gap-4 p-5 rounded-2xl border border-transparent transition-all duration-300 hover:shadow-lg hover:border-[#FF7043]/50 hover:-translate-y-1 ${tip.content.bg}`}>
                   <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-white/60 text-2xl ${tip.content.color}`}>{tip.content.icon}</div>
                   <div><h3 className="font-['Poppins'] font-bold text-[#263238]">{tip.content.title}</h3><p className="text-sm text-[#546E7A] mt-1">{tip.content.description}</p></div>
                </div>
              ))}
            </div>
          </section>
        )}
        
        {(dietData.status === 'approved' || dietData.status === 'active') && dailyMeals.length > 0 ? (
          <>
            <section className="bg-white/70 backdrop-blur-sm border border-[#ECEFF1] rounded-2xl shadow-lg p-6 mb-10">
              <h2 className="text-xl font-['Poppins'] font-semibold text-[#263238] mb-4">Average Daily Nutrition</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {[ { label: 'Avg Calories', value: Math.round(dietData.total_average_nutrition.calories), icon: <Flame />, bg: 'bg-[#FFF9C4]/50' }, { label: 'Avg Protein', value: `${dietData.total_average_nutrition.protein.toFixed(1)}g`, icon: <Dumbbell />, bg: 'bg-[#AED581]/40' }, { label: 'Avg Carbs', value: `${dietData.total_average_nutrition.carbs.toFixed(1)}g`, icon: <FaBreadSlice />, bg: 'bg-[#B3E5FC]/40' }, { label: 'Avg Fats', value: `${dietData.total_average_nutrition.fats.toFixed(1)}g`, icon: <FaFish />, bg: 'bg-[#FFCCBC]/40' } ].map(item => ( <div key={item.label} className={`${item.bg} p-4 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md`}><div className="text-[#FF7043] text-2xl mx-auto w-fit">{item.icon}</div><p className="mt-2 text-sm font-semibold text-[#546E7A]">{item.label}</p><p className="text-2xl font-bold text-[#263238]">{item.value}</p></div> ))}
              </div>
            </section>

            <section>
              <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-['Poppins'] font-semibold text-[#263238]">{dailyMeals.length}-Day Meal Plan</h2></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {displayedDays.map((day) => ( <div key={day.id} onClick={() => handleCardClick(day)} className="group bg-white border border-[#ECEFF1] rounded-2xl p-5 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer"><div className="flex justify-between items-center mb-4"><h3 className="font-['Poppins'] font-bold text-lg text-[#263238]">{day.dayOfWeek}</h3><span className="bg-[#FAF3EB] text-xs text-[#546E7A] px-3 py-1 rounded-full font-medium">{formatDate(day.date).split(',')[0]}</span></div><ul className="text-sm space-y-3 text-[#546E7A]">{[ 'Breakfast', 'Lunch', 'Dinner' ].map(mealType => ( <li key={mealType} className="flex items-center gap-3"><div className="w-4 h-4 text-[#FF7043] flex-shrink-0">{getMealIcon(mealType)}</div><span className='truncate'>{day.meals[mealType]?.food_name || 'Not specified'}</span></li> ))}</ul><div className="border-t border-dashed border-[#ECEFF1] mt-4 pt-3 text-right"><span className="font-bold text-lg text-[#263238]">{Math.round(day.totalCalories)}</span><span className="text-sm text-[#FF7043] ml-1">kcal</span></div><div className="absolute inset-0 border-2 border-transparent rounded-2xl group-hover:border-[#FF7043] transition-all duration-300 pointer-events-none"></div></div> ))}
              </div>
              {!showAll && dailyMeals.length > 6 && ( <div className="text-center mt-10"><button onClick={() => setShowAll(true)} className="bg-[#FF7043] hover:bg-[#F4511E] text-white px-8 py-3 rounded-full font-semibold font-['Poppins'] shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 mx-auto"><FaEye /> View All {dailyMeals.length} Days</button></div> )}
            </section>
          </>
        ) : (
           <div className="min-h-[30vh] bg-white border border-[#ECEFF1] rounded-2xl p-8 w-full text-center shadow-xl flex flex-col justify-center items-center"><h1 className="text-2xl font-['Poppins'] font-bold text-[#263238] mb-3 capitalize">Plan Status: <span className="text-[#F4511E]">{dietData.status?.replace(/_/g, ' ') || 'Pending'}</span></h1><p className="mt-4 text-md text-[#546E7A] max-w-md">{dietData?.message || 'The details for this plan are not available.'}</p></div>
        )}
      </div>
      
      {activeDay && ( <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-300"><div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300"><button onClick={handleCloseModal} className="absolute top-3 right-3 text-gray-400 hover:text-[#F4511E] bg-gray-100 rounded-full p-1.5 transition-colors"><IoClose size={20} /></button><h2 className="text-2xl font-['Poppins'] font-bold text-[#263238] mb-1">{activeDay.dayOfWeek}</h2><p className="text-sm text-[#546E7A] mb-6">{formatDate(activeDay.date)}</p><div className="space-y-4">{['Early-Morning', 'Breakfast', 'Mid-Morning Snack', 'Lunch', 'Afternoon Snack', 'Dinner', 'Bedtime'].map((mealType) => { const meal = activeDay.meals[mealType]; if (!meal) return null; return ( <div key={mealType} className="bg-[#FAF3EB]/60 p-4 rounded-xl border border-[#ECEFF1]"><div className='flex items-center gap-3 mb-2'><span className="text-xl text-[#FF7043]">{getMealIcon(mealType)}</span><p className="font-semibold font-['Poppins'] text-[#263238]">{mealType.replace(/-/g, ' ')}</p></div><p className="text-sm text-[#546E7A] mb-3 ml-9">{meal.food_name}</p><div className="grid grid-cols-4 gap-2 text-xs text-center ml-9"><div><p className="text-gray-500">Calories</p><p className="font-bold text-[#263238]">{Math.round(meal.Calories)}</p></div><div><p className="text-gray-500">Protein</p><p className="font-bold text-[#263238]">{meal.Protein}g</p></div><div><p className="text-gray-500">Carbs</p><p className="font-bold text-[#263238]">{meal.Carbs}g</p></div><div><p className="text-gray-500">Fats</p><p className="font-bold text-[#263238]">{meal.Fats}g</p></div></div></div> ); })}</div></div></div> )}
    </div>
  );
};

export default Meals;