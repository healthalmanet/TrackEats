import React from 'react';
import { sampleMeals } from "../../api/recommendation";
import { ArrowRight } from "lucide-react"; // A nice icon for a CTA

const DietRecommendations = () => {
  return (
    // Section uses white background and Roboto as base font
    <section className="w-full bg-white mb-10 py-16 px-6 font-['Roboto']">
      <div className="max-w-6xl mx-auto">
        {/* Headings styled with the theme's typography and colors */}
        <h2 
          className="text-3xl font-bold text-center text-[#263238] font-['Poppins'] mb-3"
          style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.1)' }}
        >
          Personalized Diet Recommendations
        </h2>
        <p className="text-center text-lg text-[#546E7A] mb-12">
          AI-powered meal suggestions based on your goals
        </p>

        {/* Layout is the same, but the styling of children is updated */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {sampleMeals.map((meal, index) => (
            // Card with shimmer effect on hover
            <div
  key={index}
  className="bg-[#FFFDF9] rounded-xl border border-[#ECEFF1] shadow-md transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-2 group relative overflow-hidden
    before:absolute before:top-0 before:left-[-75%] before:w-1/2 before:h-full before:bg-gradient-to-r before:from-transparent before:via-[#FF704350] before:to-transparent before:opacity-0 group-hover:before:opacity-100 before:animate-shine
    after:absolute after:bottom-0 after:left-0 after:w-0 group-hover:after:w-full after:h-1 after:bg-[#FF7043] after:transition-all after:duration-500 after:ease-in-out"
>

              <div className="relative">
                {/* Image has a subtle hover-to-zoom effect */}
                <img
                  src={meal.image}
                  alt={meal.title}
                  className="rounded-t-xl h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              
              <div className="p-5">
                {/* Typography updated to match the theme */}
                <h3 className="text-xl font-semibold text-[#263238] font-['Poppins'] mb-1 truncate group-hover:text-[#FF7043] transition-colors duration-300">

                  {meal.title}
                </h3>
                <p className="text-base text-[#546E7A] h-12">
                  {meal.description}
                </p>

                {/* Stats now use the theme's primary and secondary accent colors */}
                <div className="flex justify-between text-base font-bold font-['Poppins'] mt-4 pt-4 border-t border-[#ECEFF1]">
                  <span className="text-[#FF7043]">{meal.calories} Kcal</span>
                  <span className="text-[#AED581]">{meal.protein} Protein</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shimmer animation */}
      <style>{`
        @keyframes shine {
          0% { left: -75%; }
          100% { left: 125%; }
        }
        .animate-shine {
          animation: shine 1.5s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default DietRecommendations;
