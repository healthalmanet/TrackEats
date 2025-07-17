import React, { useEffect, useState, useCallback } from 'react';
import { Flame, Dumbbell, Sun, Droplets, HeartPulse, ShieldCheck, Activity, Brain, ChevronDown } from "lucide-react";
import { BsSunFill, BsFillCloudSunFill, BsFillMoonStarsFill } from "react-icons/bs";
import { FaBreadSlice, FaFish, FaAppleAlt, FaMugHot, FaConciergeBell, FaBed, FaLeaf, FaEye } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

// API Imports
import { getDietApi, getDietHistoryApi } from '../../api/dietApi'; 
import { getUserProfile } from '../../api/userProfile';
import { getDiabeticProfile } from '../../api/diabeticApi';

// --- THEME-ALIGNED LIFESTYLE RECOMMENDATION ENGINE ---
const generateHealthTips = (profile, report) => {
  if (!profile || !report) return [];
  const bmi = profile.weight_kg / ((profile.height_cm / 100) ** 2);
  
  const tipLibrary = [
    // All icons now use 'text-primary' for a consistent, branded look.
    // Backgrounds are still varied for visual interest.
    { id: 'manage_sugar', priority: 10, condition: () => profile.is_diabetic || report.hba1c > 5.7, content: { icon: <ShieldCheck />, title: "Focus on Low-GI Carbs", description: "Choose whole grains and vegetables over refined carbs to help keep your blood sugar levels stable.", bg: 'bg-primary/10', color: 'text-primary' }},
    { id: 'heart_health_fats', priority: 9, condition: () => report.ldl_cholesterol > 100 || report.triglycerides > 150, content: { icon: <HeartPulse />, title: "Embrace Healthy Fats", description: "Support your heart with foods rich in healthy fats like avocados, nuts, seeds, and olive oil.", bg: 'bg-accent-coral/10', color: 'text-primary' }},
    { id: 'heart_health_bp', priority: 9, condition: () => profile.is_hypertensive || report.blood_pressure_systolic >= 130, content: { icon: <HeartPulse />, title: "Be Mindful of Sodium", description: "Support healthy blood pressure by being mindful of sodium and adding flavor with herbs and spices.", bg: 'bg-accent-coral/10', color: 'text-primary' }},
    { id: 'weight_management_protein', priority: 8, condition: () => bmi > 25 && profile.goal === 'lose_weight', content: { icon: <Dumbbell />, title: "Prioritize Protein & Fiber", description: "Including lean protein and fiber can help you feel full longer, aiding in weight management.", bg: 'bg-primary/10', color: 'text-primary' }},
    { id: 'vitamin_d', priority: 7, condition: () => report.vitamin_d3 < 30, content: { icon: <Sun />, title: "Get Your Daily Dose of Sunshine", description: "Aim for 15-20 minutes of morning sun and include mushrooms or fortified foods in your diet.", bg: 'bg-accent-yellow/10', color: 'text-primary' }},
    { id: 'vitamin_b12', priority: 6, condition: () => report.vitamin_b12 < 300, content: { icon: <Brain />, title: "Boost Your B12 Intake", description: "Support your energy and nerve health with Vitamin B12 from dairy, eggs, or fortified foods.", bg: 'bg-accent-orange/10', color: 'text-primary' }},
    { id: 'increase_activity', priority: 5, condition: () => profile.activity_level === 'sedentary' || profile.activity_level === 'lightly_active', content: { icon: <Activity />, title: "Incorporate More Movement", description: "A brisk 30-minute walk each day can improve your metabolic health, mood, and energy.", bg: 'bg-primary/10', color: 'text-primary' }},
    { id: 'gut_health', priority: 4, condition: () => profile.has_gastric_issues, content: { icon: <FaLeaf />, title: "Nurture Your Gut Health", description: "Support digestion with fiber-rich foods and probiotics like yogurt. Remember to stay hydrated.", bg: 'bg-primary/10', color: 'text-primary' }},
    { id: 'hydration', priority: 1, condition: () => true, content: { icon: <Droplets />, title: "Focus on Hydration", description: "Drinking enough water is crucial for energy and digestion. Carry a water bottle as a reminder.", bg: 'bg-accent-yellow/10', color: 'text-primary' }},
    { id: 'mindful_eating', priority: 1, condition: () => true, content: { icon: <Brain />, title: "Practice Mindful Eating", description: "Pay attention to hunger and fullness cues. Eating slowly can improve digestion and satisfaction.", bg: 'bg-accent-coral/10', color: 'text-primary' }}
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

  const formatDate = useCallback((dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }, []);
  
  const getMealIcon = (mealType) => ({'Early-Morning':<FaMugHot />,'Breakfast':<BsSunFill />,'Mid-Morning Snack':<FaAppleAlt />,'Lunch':<BsFillCloudSunFill />,'Afternoon Snack':<FaConciergeBell />,'Dinner':<BsFillMoonStarsFill />,'Bedtime':<FaBed />}[mealType]||<FaLeaf />);
  
  const processPlanData = useCallback((plan) => {
    if (!plan) return { processedDietData: null, processedDailyMeals: [] };
    const mealsData = plan.meals?.plan_data?.meals ? plan.meals.plan_data.meals : plan.meals;
    if (typeof mealsData !== 'object' || mealsData === null || !Object.keys(mealsData).length || mealsData.message) {
      return { processedDietData: { ...plan, status: 'NO_MEALS_DATA', message: 'No detailed meal data available for this plan.' }, processedDailyMeals: [] };
    }
    let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFats = 0;
    const dayCount = Object.keys(mealsData).length;
    Object.values(mealsData).forEach(day => Object.values(day).forEach(meal => {
        totalCalories += meal.Calories || 0; totalProtein += meal.Protein || 0;
        totalCarbs += meal.Carbs || 0; totalFats += meal.Fats || 0;
    }));
    const processedPlan = { ...plan };
    processedPlan.total_average_nutrition = {
      calories: dayCount > 0 ? totalCalories / dayCount : 0, protein: dayCount > 0 ? totalProtein / dayCount : 0,
      carbs: dayCount > 0 ? totalCarbs / dayCount : 0, fats: dayCount > 0 ? totalFats / dayCount : 0,
    };
    const startDateString = processedPlan.for_week_starting;
    const transformedMeals = Object.entries(mealsData).map(([dayKey, dayData]) => {
      const dayNumber = parseInt(dayKey.replace('Day ', ''), 10);
      const currentDate = new Date(startDateString);
      currentDate.setDate(new Date(startDateString).getDate() + dayNumber - 1);
      const dailyTotalCalories = Object.values(dayData).reduce((sum, meal) => sum + (meal.Calories || 0), 0);
      return { id: dayKey, dayOfWeek: dayKey, date: currentDate.toISOString().split('T')[0], meals: dayData, totalCalories: dailyTotalCalories };
    });
    return { processedDietData: processedPlan, processedDailyMeals: transformedMeals };
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [currentPlanResponse, historyResponse, profileResponse, medicalResponse] = await Promise.all([
          getDietApi(), getDietHistoryApi(), getUserProfile(), getDiabeticProfile()
        ]);
        let combinedPlans = [], initialPlanToDisplay = null;
        if (currentPlanResponse.status_code === "ACTIVE_PLAN_FOUND" && currentPlanResponse.plan_data) {
          const currentPlan = { ...currentPlanResponse.plan_data, id: 'current', label: 'Current Active Plan' };
          combinedPlans.push(currentPlan);
          initialPlanToDisplay = currentPlan;
        }
        if (historyResponse.status_code === "HISTORY_FOUND" && Array.isArray(historyResponse.plans)) {
          const formattedHistory = historyResponse.plans.map(p => ({ ...p, label: `Plan: ${formatDate(p.for_week_starting)}`}));
          combinedPlans = [...combinedPlans, ...formattedHistory];
        }
        setAllPlans(combinedPlans);
        if (initialPlanToDisplay) {
          const { processedDietData, processedDailyMeals } = processPlanData(initialPlanToDisplay);
          setDietData(processedDietData); setDailyMeals(processedDailyMeals); setSelectedPlanId('current');
        } else if (combinedPlans.length > 0) {
          const firstPlan = combinedPlans[0];
          const { processedDietData, processedDailyMeals } = processPlanData(firstPlan);
          setDietData(processedDietData); setDailyMeals(processedDailyMeals); setSelectedPlanId(firstPlan.id);
        } else {
          setDietData({ status: 'NO_PLAN_FOUND', message: 'No diet plans found.' });
        }
        if (profileResponse && medicalResponse) {
          setHealthTips(generateHealthTips(profileResponse, medicalResponse));
        }
      } catch (error) {
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
      setDietData(processedDietData); setDailyMeals(processedDailyMeals); setSelectedPlanId(newPlanId);
      setShowAll(false); setActiveDay(null);
    }
  };
  
  const handleCardClick = (day) => setActiveDay(day);
  const handleCloseModal = () => setActiveDay(null);

  const displayedDays = showAll ? dailyMeals : dailyMeals.slice(0, 6);
  
  if (loading) { return <div className="flex flex-col justify-center items-center h-screen bg-main"><div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div><p className="text-xl text-body font-['Poppins'] mt-4">Loading Your Diet Plan...</p></div>; }
  
  if (!dietData || dietData.status === 'NO_PLAN_FOUND' || dietData.status === 'ERROR') { 
    return <div className="min-h-screen bg-main flex items-center justify-center p-6"><div className="bg-section border border-custom rounded-2xl p-8 max-w-lg w-full text-center shadow-soft"><h1 className="text-3xl font-['Lora'] font-bold text-heading mb-3 capitalize">No Plan Available</h1><p className="mt-6 text-md text-body">{dietData?.message || 'Your diet plan is not available. Please check back later.'}</p></div></div>; 
  }

  return (
    <div className="min-h-screen bg-main p-4 sm:p-6 lg:p-10 font-['Poppins'] text-body">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-heading font-['Lora']">Your Diet Plan</h1>
              <p className="text-lg mt-2">{dietData.for_week_starting ? `Week starting ` : ''}<span className="font-bold text-primary">{formatDate(dietData.for_week_starting)}</span></p>
            </div>
            {allPlans.length > 1 && (
              <div className="relative">
                <select id="plan-selector" value={selectedPlanId} onChange={handlePlanChange} className="appearance-none w-full sm:w-64 bg-section border border-custom text-heading font-semibold py-3 pl-4 pr-10 rounded-xl shadow-soft focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition">
                  {allPlans.map(plan => (<option key={plan.id} value={plan.id}>{plan.label}</option>))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-body"><ChevronDown size={20} /></div>
              </div>
            )}
          </div>
        </header>

        {healthTips.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-['Lora'] font-semibold text-heading mb-5">Your Top Recommendations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {healthTips.map((tip) => (
                <div key={tip.id} className={`flex items-start gap-4 p-5 rounded-2xl border border-transparent transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1 ${tip.content.bg}`}>
                   <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-section/60 text-2xl ${tip.content.color}`}>{tip.content.icon}</div>
                   <div><h3 className="font-['Poppins'] font-bold text-heading">{tip.content.title}</h3><p className="text-sm text-body mt-1">{tip.content.description}</p></div>
                </div>
              ))}
            </div>
          </section>
        )}
        
        {(dietData.status === 'approved' || dietData.status === 'active') && dailyMeals.length > 0 ? (
          <>
            <section className="bg-section/70 backdrop-blur-sm border border-custom rounded-2xl shadow-soft p-6 mb-10">
              <h2 className="text-xl font-['Lora'] font-semibold text-heading mb-4">Average Daily Nutrition</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {[ { label: 'Avg Calories', value: Math.round(dietData.total_average_nutrition.calories), icon: <Flame />, bg: 'bg-accent-yellow/20' }, { label: 'Avg Protein', value: `${dietData.total_average_nutrition.protein.toFixed(1)}g`, icon: <Dumbbell />, bg: 'bg-primary/20' }, { label: 'Avg Carbs', value: `${dietData.total_average_nutrition.carbs.toFixed(1)}g`, icon: <FaBreadSlice />, bg: 'bg-accent-orange/20' }, { label: 'Avg Fats', value: `${dietData.total_average_nutrition.fats.toFixed(1)}g`, icon: <FaFish />, bg: 'bg-accent-coral/20' } ].map(item => ( <div key={item.label} className={`${item.bg} p-4 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md`}><div className="text-primary text-2xl mx-auto w-fit">{item.icon}</div><p className="mt-2 text-sm font-semibold text-body">{item.label}</p><p className="text-2xl font-bold text-heading">{item.value}</p></div> ))}
              </div>
            </section>

            <section>
              <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-['Lora'] font-semibold text-heading">{dailyMeals.length}-Day Meal Plan</h2></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {displayedDays.map((day) => ( <div key={day.id} onClick={() => handleCardClick(day)} className="group bg-section border border-custom rounded-2xl p-5 shadow-soft transition-all duration-300 hover:shadow-lg hover:-translate-y-2 cursor-pointer hover:bg-light"><div className="flex justify-between items-center mb-4"><h3 className="font-['Poppins'] font-bold text-lg text-heading">{day.dayOfWeek}</h3><span className="bg-light text-xs text-body px-3 py-1 rounded-full font-medium">{formatDate(day.date).split(',')[0]}</span></div><ul className="text-sm space-y-3 text-body">{[ 'Breakfast', 'Lunch', 'Dinner' ].map(mealType => ( <li key={mealType} className="flex items-center gap-3"><div className="w-4 h-4 text-primary flex-shrink-0">{getMealIcon(mealType)}</div><span className='truncate'>{day.meals[mealType]?.food_name || 'Not specified'}</span></li> ))}</ul><div className="border-t border-dashed border-custom mt-4 pt-3 text-right"><span className="font-bold text-lg text-heading">{Math.round(day.totalCalories)}</span><span className="text-sm text-primary ml-1">kcal</span></div><div className="absolute inset-0 border-2 border-transparent rounded-2xl group-hover:border-primary transition-all duration-300 pointer-events-none"></div></div> ))}
              </div>
              {!showAll && dailyMeals.length > 6 && ( <div className="text-center mt-10"><button onClick={() => setShowAll(true)} className="bg-primary hover:bg-primary-hover text-light px-8 py-3 rounded-full font-semibold font-['Poppins'] shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 mx-auto"><FaEye /> View All {dailyMeals.length} Days</button></div> )}
            </section>
          </>
        ) : (
           <div className="min-h-[30vh] bg-section border border-custom rounded-2xl p-8 w-full text-center shadow-soft flex flex-col justify-center items-center"><h1 className="text-2xl font-['Lora'] font-bold text-heading mb-3 capitalize">Plan Status: <span className="text-red">{dietData.status?.replace(/_/g, ' ') || 'Pending'}</span></h1><p className="mt-4 text-md text-body max-w-md">{dietData?.message || 'The details for this plan are not available.'}</p></div>
        )}
      </div>
      
      {activeDay && ( <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in"><div className="bg-section border border-custom rounded-2xl p-6 w-full max-w-md shadow-xl relative max-h-[90vh] overflow-y-auto custom-scrollbar animate-fade-up"><button onClick={handleCloseModal} className="absolute top-3 right-3 text-body/70 hover:text-red bg-light rounded-full p-1.5 transition-colors"><IoClose size={20} /></button><h2 className="text-2xl font-['Lora'] font-bold text-heading mb-1">{activeDay.dayOfWeek}</h2><p className="text-sm text-body mb-6">{formatDate(activeDay.date)}</p><div className="space-y-4">{['Early-Morning', 'Breakfast', 'Mid-Morning Snack', 'Lunch', 'Afternoon Snack', 'Dinner', 'Bedtime'].map((mealType) => { const meal = activeDay.meals[mealType]; if (!meal) return null; return ( <div key={mealType} className="bg-main p-4 rounded-xl border border-custom"><div className='flex items-center gap-3 mb-2'><span className="text-xl text-primary">{getMealIcon(mealType)}</span><p className="font-semibold font-['Poppins'] text-heading">{mealType.replace(/-/g, ' ')}</p></div><p className="text-sm text-body mb-3 ml-9">{meal.food_name}</p><div className="grid grid-cols-4 gap-2 text-xs text-center ml-9"><div><p className="text-body/80">Calories</p><p className="font-bold text-heading">{Math.round(meal.Calories)}</p></div><div><p className="text-body/80">Protein</p><p className="font-bold text-heading">{meal.Protein}g</p></div><div><p className="text-body/80">Carbs</p><p className="font-bold text-heading">{meal.Carbs}g</p></div><div><p className="text-body/80">Fats</p><p className="font-bold text-heading">{meal.Fats}g</p></div></div></div> ); })}</div></div></div> )}
    </div>
  );
};

export default Meals;