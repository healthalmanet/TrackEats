import React from 'react';
import { sampleMeals } from "../../api/recommendation";
import { ArrowRight } from "lucide-react";

const DietRecommendations = () => {
  return (
    // Section uses the theme's section background and Poppins as the base font
    <section className="w-full bg-section mb-10 py-16 px-6 font-['Poppins']">
      <div className="max-w-6xl mx-auto">
        {/* Headings styled with the theme's Lora font and heading color */}
        <h2 
          className="text-3xl font-['Lora'] font-bold text-center text-heading mb-3"
        >
          Personalized Diet Recommendations
        </h2>
        <p className="text-center text-lg text-body mb-12">
          AI-powered meal suggestions based on your goals
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {sampleMeals.map((meal, index) => (
            // Card now uses the theme's standard hover effects for a consistent experience
            <div
              key={index}
              className="bg-section rounded-xl border border-custom shadow-soft transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-2 group relative overflow-hidden hover:border-primary"
            >
              <div className="relative">
                {/* Image still has the subtle hover-to-zoom effect */}
                <img
                  src={meal.image}
                  alt={meal.title}
                  className="rounded-t-xl h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              
              <div className="p-5">
                {/* Typography updated to match the theme */}
                <h3 className="text-xl font-['Lora'] font-semibold text-heading mb-1 truncate group-hover:text-primary transition-colors duration-300">
                  {meal.title}
                </h3>
                <p className="text-base text-body h-12">
                  {meal.description}
                </p>

                {/* Stats now use the theme's accent colors */}
                <div className="flex justify-between text-base font-bold mt-4 pt-4 border-t border-custom">
                  <span className="text-accent-orange">{meal.calories} Kcal</span>
                  <span className="text-primary">{meal.protein} Protein</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Added a Call to Action button for better UX */}
        <div className="text-center mt-16">
            <button className="bg-primary text-light font-semibold px-8 py-3 rounded-lg shadow-soft hover:bg-primary-hover transition-all duration-300 transform hover:scale-105 flex items-center gap-2 mx-auto">
                View More Recipes
                <ArrowRight size={20} />
            </button>
        </div>
      </div>
    </section>
  );
};

export default DietRecommendations;