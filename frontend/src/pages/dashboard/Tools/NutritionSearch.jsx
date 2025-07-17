import React, { useState } from 'react';
import { searchFoodNutrition } from '../../../api/nutritionApi';
import {
  Search, Loader, ClipboardList, AlertTriangle, Flame, Beef, Wheat, Droplets,
  Vegan, Drumstick, ListOrdered, Sparkles, BrainCircuit, BarChart3, Zap,
  TrendingUp, Gauge, FlaskConical, ShieldAlert, Clock, Leaf,
} from "lucide-react";

// --- Themed & Simplified Helper Components ---

const FeatureCard = ({ icon, title, description, delay }) => (
  <div className="bg-section p-6 rounded-2xl border border-custom shadow-soft transform-gpu transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-2 group animate-fade-in-up" style={{ animationDelay: delay }}>
    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4 transition-transform duration-300 group-hover:scale-110">
      {React.cloneElement(icon, { className: 'text-primary h-6 w-6' })}
    </div>
    <h3 className="text-lg font-['Lora'] font-bold text-heading mb-2">{title}</h3>
    <p className="text-sm text-body leading-relaxed">{description}</p>
  </div>
);

const NutritionCard = ({ label, value, unit, icon, accentColorClass, delay, isAnimated = false }) => (
  <div className="group relative bg-section rounded-xl p-4 border border-custom shadow-soft transform-gpu transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1.5 animate-fade-in-up" style={{ animationDelay: delay }}>
    <div className={`absolute top-0 left-0 h-1 w-full rounded-t-xl opacity-70 group-hover:opacity-100 transition-opacity ${accentColorClass}`} />
    <div className="flex justify-between items-start mb-2">
      <span className="font-semibold text-sm text-heading">{label}</span>
      {icon && React.cloneElement(icon, { className: `text-2xl transition-colors ${accentColorClass.replace('bg-', 'text-')}` })}
    </div>
    <div>
      <span className={`text-4xl font-bold ${accentColorClass.replace('bg-', 'text-')}`}>{typeof value === 'number' ? value.toFixed(value < 10 ? 1 : 0) : value || '0'}</span>
      <span className="text-sm font-medium text-body ml-1.5">{unit}</span>
    </div>
  </div>
);

const DetailRow = ({ label, value, unit = "" }) => {
  if (value === null || value === undefined || value === "" || (typeof value === 'number' && isNaN(value)) || value === 0) return null;
  return (
    <div className="flex justify-between items-center py-2.5 px-3 rounded-md transition-colors duration-200 hover:bg-light border-b border-dashed border-custom last:border-b-0">
      <span className="font-medium text-body text-sm">{label}</span>
      <span className="font-semibold text-heading text-sm">{typeof value === "number" ? value.toFixed(1) : value}{unit && <span className="text-body/70 ml-1.5">{unit}</span>}</span>
    </div>
  );
};

const InsightPill = ({ icon, label, value }) => {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0 bg-primary/10 text-primary rounded-full p-1.5">{icon}</div>
      <div>
        <p className="text-xs text-body">{label}</p>
        <p className="text-sm font-semibold text-heading capitalize">{Array.isArray(value) ? value.join(', ') : value}</p>
      </div>
    </div>
  );
};

const NutritionSearch = () => {
  const [foodItem, setFoodItem] = useState('');
  const [nutritionData, setNutritionData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchInitiated, setSearchInitiated] = useState(false);

  const safeParseList = (list) => {
    if (!list) return []; if (Array.isArray(list)) return list;
    if (typeof list === 'string') {
      try { const parsed = JSON.parse(list.replace(/'/g, '"')); return Array.isArray(parsed) ? parsed : [list]; } 
      catch (e) { return [list]; }
    }
    return [];
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setNutritionData(null); setError(null); setSearchInitiated(true);
    if (!foodItem.trim()) { setError("Please enter a food name to search."); return; }
    setIsLoading(true);
    try {
      const data = await searchFoodNutrition(foodItem);
      if (data && data.name) { setNutritionData(data); } 
      else { setNutritionData(null); setError(`No detailed nutrition data found for "${foodItem}". Try another name or check spelling.`); }
    } catch (err) { setError(err.message || "An unexpected error occurred."); } 
    finally { setIsLoading(false); }
  };
  
  // Self-contained keyframe animations needed for this component
  const AnimationStyles = () => (
    <style>{`
      @keyframes fade-in-up {
        from { opacity: 0; transform: translateY(15px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
      @keyframes shake {
        10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); }
        30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); }
      }
      .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
    `}</style>
  );

  return (
    <div className="relative min-h-screen w-full bg-main font-['Poppins'] overflow-x-hidden">
      <AnimationStyles />
      <main className="relative flex flex-col max-w-5xl mx-auto py-12 px-4 sm:px-6 text-center">
        <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <h1 className="text-4xl sm:text-5xl font-['Lora'] font-extrabold mb-4 flex items-center justify-center gap-3 text-heading">
            <ClipboardList className="text-primary" />
            Nutrition Insights
          </h1>
          <p className="text-lg text-body mb-8 max-w-2xl mx-auto">Unlock the nutritional secrets of your food. Simple, fast, and accurate.</p>
        </div>
        
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-10 justify-center items-center animate-fade-in-up" style={{ animationDelay: '250ms' }}>
          <div className="relative w-full max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-body/50" size={20} />
            <input type="text" value={foodItem} placeholder="e.g., Avocado, Brown Rice" onChange={(e) => setFoodItem(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-custom bg-section text-heading rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:border-primary transition-all duration-300 placeholder:text-body/60 shadow-sm"
            />
          </div>
          <button type="submit" disabled={isLoading}
            className="w-full sm:w-auto px-8 py-3 bg-primary text-light font-semibold rounded-lg shadow-soft hover:shadow-lg hover:bg-primary-hover hover:-translate-y-0.5 active:scale-[0.98] transform transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:bg-primary/50 disabled:shadow-none disabled:transform-none"
          >
            {isLoading ? <Loader className="animate-spin" /> : <Search size={18} />}
            <span>{isLoading ? "Searching..." : "Search"}</span>
          </button>
        </form>

        <div className="mt-6 min-h-[400px]">
          {isLoading ? (
            <div className="p-4 rounded-lg text-base font-medium text-primary bg-primary/10 flex items-center justify-center gap-3"><Loader className="animate-spin text-xl" /> Loading...</div>
          ) : error ? (
            <div className="p-4 rounded-lg text-base font-medium text-red bg-red/10 flex items-center justify-center gap-3 animate-shake"><AlertTriangle className="text-xl" /> {error}</div>
          ) : nutritionData ? (
            <div className="text-left bg-section p-4 sm:p-6 rounded-2xl border border-custom shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-custom animate-fade-in-up" style={{animationDelay: '100ms'}}>
                <h2 className="text-2xl sm:text-3xl font-['Lora'] font-bold text-heading flex items-center gap-3 capitalize">{nutritionData.name}{nutritionData.food_type?.toLowerCase() === 'vegetarian' ? <Vegan className="text-primary" title="Vegetarian" /> : <Drumstick className="text-red" title="Non-Vegetarian" />}</h2>
                <p className="text-body font-medium text-sm sm:text-base">Serving: <span className="font-semibold text-heading">{nutritionData.default_quantity} {nutritionData.default_unit}</span> (<span className="font-semibold text-heading">{nutritionData.gram_equivalent?.toFixed(0)}g</span>)</p>
              </div>
              <section className="macro-nutrients mb-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <NutritionCard label="Calories" value={nutritionData.calories} unit="kcal" icon={<Flame />} accentColorClass="bg-accent-orange" delay="200ms" />
                  <NutritionCard label="Protein" value={nutritionData.protein} unit="g" icon={<Beef />} accentColorClass="bg-primary" delay="300ms" />
                  <NutritionCard label="Carbs" value={nutritionData.carbs} unit="g" icon={<Wheat />} accentColorClass="bg-accent-yellow" delay="400ms" />
                  <NutritionCard label="Fats" value={nutritionData.fats} unit="g" icon={<Droplets />} accentColorClass="bg-accent-coral" delay="500ms" />
                </div>
              </section>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-8">
                <section className="animate-fade-in-up" style={{animationDelay: '600ms'}}>
                  <h3 className="text-lg font-['Lora'] font-semibold text-heading mb-3 flex items-center gap-2"><ListOrdered size={20} className="text-primary" /> Detailed Breakdown</h3>
                  <div className="space-y-1 bg-section p-2 rounded-lg border border-custom shadow-sm">
                    <DetailRow label="Sugar" value={nutritionData.sugar} unit="g" />
                    <DetailRow label="Fiber" value={nutritionData.fiber} unit="g" />
                    <DetailRow label="Saturated Fat" value={nutritionData.saturated_fat_g} unit="g" />
                    <DetailRow label="Trans Fat" value={nutritionData.trans_fat_g} unit="g" />
                    <DetailRow label="Glycemic Index (GI)" value={nutritionData.estimated_gi} />
                    <DetailRow label="Glycemic Load (GL)" value={nutritionData.glycemic_load} />
                    <DetailRow label="Cholesterol" value={nutritionData.cholesterol_mg} unit="mg" />
                    <DetailRow label="Sodium" value={nutritionData.sodium_mg} unit="mg" />
                  </div>
                </section>
                <section className="animate-fade-in-up" style={{animationDelay: '700ms'}}>
                    <h3 className="text-lg font-['Lora'] font-semibold text-heading mb-3 flex items-center gap-2"><Leaf size={20} className="text-primary" /> Vitamins & Minerals</h3>
                    <div className="space-y-1 bg-section p-2 rounded-lg border border-custom shadow-sm">
                        <DetailRow label="Potassium" value={nutritionData.potassium_mg} unit="mg" />
                        <DetailRow label="Iron" value={nutritionData.iron_mg} unit="mg" />
                        <DetailRow label="Calcium" value={nutritionData.calcium_mg} unit="mg" />
                        <DetailRow label="Magnesium" value={nutritionData.magnesium_mg} unit="mg" />
                        <DetailRow label="Zinc" value={nutritionData.zinc_mg} unit="mg" />
                        <DetailRow label="Selenium" value={nutritionData.selenium_mcg} unit="mcg" />
                        <DetailRow label="Iodine" value={nutritionData.iodine_mcg} unit="mcg" />
                        <DetailRow label="Omega-3" value={nutritionData.omega_3_g} unit="g" />
                        <DetailRow label="Vitamin D" value={nutritionData.vitamin_d_mcg} unit="mcg" />
                        <DetailRow label="Vitamin B12" value={nutritionData.vitamin_b12_mcg} unit="mcg" />
                    </div>
                </section>
                <section className="animate-fade-in-up" style={{animationDelay: '800ms'}}>
                  <h3 className="text-lg font-['Lora'] font-semibold text-heading mb-3 flex items-center gap-2"><Sparkles size={20} className="text-primary" /> Additional Insights</h3>
                  <div className="grid grid-cols-1 gap-y-5 bg-section p-4 rounded-lg border border-custom shadow-sm">
                    <InsightPill icon={<Clock size={20}/>} label="Meal Type" value={safeParseList(nutritionData.meal_type)} />
                    <InsightPill icon={<TrendingUp size={20}/>} label="FODMAP" value={nutritionData.fodmap_level} />
                    <InsightPill icon={<Gauge size={20}/>} label="Spice Level" value={nutritionData.spice_level} />
                    <InsightPill icon={<FlaskConical size={20}/>} label="Purine Level" value={nutritionData.purine_level} />
                    <InsightPill icon={<ShieldAlert size={20}/>} label="Allergens" value={safeParseList(nutritionData.allergens)} />
                  </div>
                </section>
              </div>
            </div>
          ) : (
             <div className="text-left">
              <h2 className="text-2xl font-['Lora'] font-bold text-heading mb-6 text-center animate-fade-in-up" style={{ animationDelay: '400ms' }}>Discover More Than Just Calories</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <FeatureCard icon={<BarChart3 />} title="Detailed Breakdown" description="Go beyond macros. Get insights into micronutrients, glycemic index, and more." delay="500ms"/>
                 <FeatureCard icon={<BrainCircuit />} title="Smart Insights" description="Learn about FODMAP, spice levels, allergens, and other helpful classifications." delay="650ms"/>
                 <FeatureCard icon={<Zap />} title="Fast & Intuitive" description="A clean, modern interface designed to give you the information you need without the clutter." delay="800ms"/>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default NutritionSearch;