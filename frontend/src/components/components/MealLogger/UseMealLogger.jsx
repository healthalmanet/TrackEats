import { useEffect, useState } from "react";
import { getMeals, createMeal, deleteMeal } from "../../../api/mealLog";
import { toast } from "react-hot-toast";

const useMealLogger = () => {
  const [foodInputs, setFoodInputs] = useState([
    { name: "", unit: "", quantity: "", remark: "", date: "", time: "" },
  ]);
  const [mealType, setMealType] = useState("breakfast");
  const [loggedMeals, setLoggedMeals] = useState([]);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ Daily nutrition totals
  const [dailySummary, setDailySummary] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  // ✅ Only water and calorie goals
  const [goals, setGoals] = useState({
    caloriesTarget: 2000,
    waterLogged: 0,
    waterTarget: 8,
  });

  const unitOptions = ["g", "ml", "piece", "cup", "bowl", "tbsp", "tsp"];
  const token = localStorage.getItem("token");

  const fetchMeals = async (url = null) => {
    try {
      const data = await getMeals(token, url);
      setLoggedMeals(data.results);
      setPagination({ next: data.next, previous: data.previous });

      // ✅ Summarize daily totals
      const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      data.results.forEach((meal) => {
        totals.calories += meal.calories || 0;
        totals.protein += meal.protein || 0;
        totals.carbs += meal.carbs || 0;
        totals.fat += meal.fats || 0;
      });
      setDailySummary(totals);
    } catch (error) {
      toast.error("Failed to fetch meals.");
      console.error("❌ Error fetching meals:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const input = foodInputs[0];
    const data = {
      food_name: input.name,
      quantity: parseFloat(input.quantity),
      unit: input.unit,
      meal_type: mealType,
      remarks: input.remark,
    };

    try {
      await createMeal(data, token);
      toast.success("Meal logged");
      fetchMeals();
      setFoodInputs([
        { name: "", unit: "", quantity: "", remark: "", date: "", time: "" },
      ]);
    } catch {
      toast.error("Failed to add meal");
    }
  };

  const handleFoodChange = (idx, field, value) => {
    setFoodInputs((prev) =>
      prev.map((input, i) => (i === idx ? { ...input, [field]: value } : input))
    );
  };

  const addFoodField = () => {
    setFoodInputs([
      ...foodInputs,
      { name: "", unit: "", quantity: "", remark: "", date: "", time: "" },
    ]);
  };

  const removeFoodField = (index) => {
    setFoodInputs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteMeal = async (id) => {
    try {
      await deleteMeal(id, token);
      toast.success("Meal deleted");
      fetchMeals();
    } catch {
      toast.error("Failed to delete meal");
    }
  };

  const handleNextPage = () => {
    if (pagination.next) {
      fetchMeals(pagination.next);
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (pagination.previous) {
      fetchMeals(pagination.previous);
      setCurrentPage((prev) => prev - 1);
    }
  };

  return {
    foodInputs,
    handleFoodChange,
    addFoodField,
    removeFoodField,
    mealType,
    setMealType,
    handleSubmit,
    unitOptions,
    loggedMeals,
    dailySummary,
    goals,
    pagination,
    currentPage,
    handleNextPage,
    handlePrevPage,
    handleDeleteMeal,
  };
};

export default useMealLogger;
