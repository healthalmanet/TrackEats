import { sampleMeals } from "../../api/recommendation";

const DietRecommendations = () => {
  return (
    <section className="w-full bg-white mb-10 py-16 px-6 font-['Poppins'] text-[#263238]">
      <h2 className="text-3xl font-bold text-center text-[#FF7043] mb-2 drop-shadow-sm">
        Personalized Diet Recommendations
      </h2>
      <p className="text-center text-sm font-medium text-[#546E7A] mb-10">
        AI-powered meal suggestions based on your goals
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {sampleMeals.map((meal, index) => (
          <div
            key={index}
            className="bg-[#FAF3EB] rounded-2xl border border-[#ECEFF1] p-5 shadow-md hover:shadow-xl transition duration-300 group relative overflow-hidden animate-fade-in-up"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#FFF3E0] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>

            <img
              src={meal.image}
              alt={meal.title}
              className="rounded-lg h-40 w-full object-cover mb-4 z-10 relative group-hover:scale-105 transition-transform duration-300"
            />

            <h3 className="text-lg font-semibold text-[#263238] z-10 relative">
              {meal.title}
            </h3>
            <p className="text-sm text-[#546E7A] mt-1 z-10 relative">
              {meal.description}
            </p>

            <div className="flex justify-between text-sm font-semibold mt-3 z-10 relative">
              <span className="text-[#FF7043]">{meal.calories} cal</span>
              <span className="text-[#00BFA5]">{meal.protein}</span>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-1 bg-[#FF7043] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DietRecommendations;
