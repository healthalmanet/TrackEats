import { sampleMeals } from "../../api/recommendation";

const DietRecommendations = () => {
  return (
    <section className="w-full min-h-[350px] bg-gradient-to-r from-green-50 to-orange-50 p-8 md:p-12 rounded-lg  justify-between items-center">
      <h2 className="text-2xl font-semibold text-center text-gray-800 mb-1">
        Personalized Diet Recommendations
      </h2>
      <p className="text-center text-sm font-semibold text-gray-500 mb-8">
        AI-powered meal suggestions based on your goals
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sampleMeals.map((meal, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-4 text-left"
          >
            <img
              src={meal.image}
              alt={meal.title}
              className="rounded-lg h-40 w-full object-cover mb-4"
            />
            <h3 className="text-lg font-medium text-gray-700">{meal.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{meal.description}</p>
            <div className="flex justify-between text-sm font-medium text-green-500 mt-3">
              <span>{meal.calories} cal</span>
              <span className="text-gray-600">{meal.protein}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DietRecommendations;
