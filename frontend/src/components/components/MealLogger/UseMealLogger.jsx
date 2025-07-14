import { useEffect, useState } from "react";
import { getMeals, createMeal, deleteMeal, getMealsByDate } from "../../../api/mealLog";
import { toast } from "react-hot-toast";

const useMealLogger = () => {
  const [foodInputs, setFoodInputs] = useState([
    { name: "", unit: "", quantity: "", remark: "", date: "", time: "" },
  ]);
  const [mealType, setMealType] = useState("Breakfast");
  const [loggedMeals, setLoggedMeals] = useState([]);
  const [pagination, setPagination] = useState({
    next: null,
    previous: null,
    count: 0,
    currentPageUrl: null,
  });

  const [currentPage, setCurrentPage] = useState(1);

  // ✅ Match backend choices exactly
  const unitOptions = [
    "Gram", "Kilogram", "Milliliters", "Liters", "Cup", "Bowl",
    "Piece", "Tbsp", "Tsp", "Plate", "Handful", "Pinch",
    "Dash", "Sprinkle", "Other"
  ];

  // ✅ Expose backend meal type options
  const mealTypeOptions = [
    "Early-Morning", "Breakfast", "Mid-Morning Snack",
    "Lunch", "Afternoon Snack", "Dinner", "Bedtime"
  ];

  const [dailySummary, setDailySummary] = useState({
    calories: 0,
    carbs: 0,
    protein: 0,
    fat: 0,
  });

  const [goals, setGoals] = useState({
    caloriesTarget: 2000,
    waterLogged: 0,
    waterTarget: 8,
  });

  const [searchDate, setSearchDate] = useState("");

  const baseApiUrl =
    import.meta.env.VITE_API_URL || "https://trackeats.onrender.com/api/logmeals/";

  const extractPageNumber = (url) => {
    if (!url) return 1;
    const match = url.match(/page=(\d+)/);
    return match ? parseInt(match[1], 10) : 1;
  };

  const fetchMeals = async (url = null) => {
    try {
      const token = localStorage.getItem("token");
      const data = await getMeals(token, url);
      const meals = data.results || [];

      setLoggedMeals(meals);
      setPagination({
        next: data.next,
        previous: data.previous,
        count: data.count,
        currentPageUrl: url,
      });

      const pageNum = extractPageNumber(url || `${baseApiUrl}?page=1`);
      setCurrentPage(pageNum);

      const summary = meals.reduce(
        (acc, meal) => {
          acc.calories += meal.calories || 0;
          acc.carbs += meal.carbs || 0;
          acc.protein += meal.protein || 0;
          acc.fat += meal.fats || 0;
          return acc;
        },
        { calories: 0, carbs: 0, protein: 0, fat: 0 }
      );

      setDailySummary(summary);
    } catch (error) {
      toast.error("Failed to fetch meals.");
      console.error("❌ Error fetching meals:", error.response?.data || error.message);
    }
  };

  const searchByDate = async (date) => {
    if (!date) {
      fetchMeals();
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const data = await getMealsByDate(token, date);
      const meals = data.results || [];

      setLoggedMeals(meals);
      setPagination({
        next: null,
        previous: null,
        count: meals.length,
        currentPageUrl: null,
      });

      const summary = meals.reduce(
        (acc, meal) => {
          acc.calories += meal.calories || 0;
          acc.carbs += meal.carbs || 0;
          acc.protein += meal.protein || 0;
          acc.fat += meal.fats || 0;
          return acc;
        },
        { calories: 0, carbs: 0, protein: 0, fat: 0 }
      );

      setDailySummary(summary);
    } catch (error) {
      toast.error("Failed to search meals by date.");
      console.error("❌ Error searching meals by date:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, []);

const handleSubmit = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");

  const mealTypeMap = {
    "Early Morning Snack": "Early-Morning",
    "Breakfast": "Breakfast",
    "Mid-Morning Snack": "Mid-Morning Snack",
    "Lunch": "Lunch",
    "Afternoon Snack": "Afternoon Snack",
    "Dinner": "Dinner",
    "Bedtime": "Bedtime",
  };

  const allInputs = foodInputs.filter(input => input.name && input.quantity && input.unit);
  if (allInputs.length === 0) {
    toast.error("Please fill at least one food item.");
    return;
  }

  try {
    for (const input of allInputs) {
      let date = input.date || new Date().toISOString().split("T")[0]; // Use today if not filled
      let time = input.time || "12:00"; // Default to noon if time is empty
      let consumedAt = new Date(`${date}T${time}:00`).toISOString();

      const data = {
        food_name: input.name,
        quantity: parseFloat(input.quantity),
        unit: input.unit.charAt(0).toUpperCase() + input.unit.slice(1),
        meal_type: mealTypeMap[mealType.trim()] || mealType,
        remarks: input.remark,
        date: date,
        consumed_at: consumedAt,
      };

      await createMeal(data, token);
    }

    toast.success("Meal(s) logged");
    fetchMeals(pagination.currentPageUrl);
    setFoodInputs([{ name: "", unit: "", quantity: "", remark: "", date: "", time: "" }]);
  } catch (err) {
    console.error("Create meal error:", err.response?.data || err.message);
    toast.error("Failed to add meal(s)");
  }
};


  const handleFoodChange = (idx, field, value) => {
    setFoodInputs((prev) =>
      prev.map((input, i) => (i === idx ? { ...input, [field]: value } : input))
    );
  };

  const addFoodField = () => {
    setFoodInputs((prev) => [
      ...prev,
      { name: "", unit: "", quantity: "", remark: "", date: "", time: "" },
    ]);
  };

  const removeFoodField = (index) => {
    setFoodInputs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteMeal = async (id) => {
    if (!id) {
      toast.error("Invalid meal ID");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await deleteMeal(id, token);
      toast.success("Meal deleted");
      fetchMeals(pagination.currentPageUrl);
    } catch (error) {
      toast.error("Failed to delete meal");
      console.error("❌ Error deleting meal:", error.response?.data || error.message);
    }
  };

  const handleNextPage = () => {
    if (pagination.next) {
      fetchMeals(pagination.next);
    }
  };

  const handlePrevPage = () => {
    if (pagination.previous) {
      fetchMeals(pagination.previous);
    }
  };

  const handlePageChange = (pageUrl) => {
    fetchMeals(pageUrl);
  };

  return {
    foodInputs,
    handleFoodChange,
    addFoodField,
    removeFoodField,
    mealType,
    setMealType,
    mealTypeOptions, // ✅ Added here
    handleSubmit,
    unitOptions,
    loggedMeals,
    pagination,
    currentPage,
    handleNextPage,
    handlePrevPage,
    handlePageChange,
    handleDeleteMeal,
    dailySummary,
    goals,
    searchDate,
    setSearchDate,
    searchByDate,
  };
};

export default useMealLogger;
