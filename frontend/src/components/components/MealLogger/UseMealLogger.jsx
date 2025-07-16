import { useEffect, useState, useCallback } from "react";
import { getMeals, createMeal, deleteMeal, getMealsByDate } from "../../../api/mealLog";
import { toast } from "react-hot-toast";
import { CheckCircle, AlertTriangle, CircleHelp } from "lucide-react"; // Themed icons for toasts

const useMealLogger = () => {
  const [foodInputs, setFoodInputs] = useState([
    { name: "", unit: "", quantity: "", remark: "", date: "", time: "" },
  ]);
  const [mealType, setMealType] = useState("Breakfast");
  const [loggedMeals, setLoggedMeals] = useState([]);
  const [pagination, setPagination] = useState({ next: null, previous: null, count: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [dailySummary, setDailySummary] = useState({ calories: 0, carbs: 0, protein: 0, fat: 0 });
  const [searchDate, setSearchDate] = useState("");

  const unitOptions = [ "Gram", "Kilogram", "Milliliters", "Liters", "Cup", "Bowl", "Piece", "Tbsp", "Tsp", "Plate", "Handful", "Pinch", "Dash", "Sprinkle", "Other" ];
  const mealTypeOptions = [ "Early-Morning", "Breakfast", "Mid-Morning Snack", "Lunch", "Afternoon Snack", "Dinner", "Bedtime" ];
  
  const baseApiUrl = import.meta.env.VITE_API_URL || "https://trackeats.onrender.com/api/logmeals/";

  const fetchMeals = useCallback(async (url = null) => {
    try {
      const token = localStorage.getItem("token");
      const data = await getMeals(token, url);
      const meals = data.results || [];

      setLoggedMeals(meals);
      setPagination({ next: data.next, previous: data.previous, count: data.count });
      
      const pageNumMatch = (url || `${baseApiUrl}?page=1`).match(/page=(\d+)/);
      setCurrentPage(pageNumMatch ? parseInt(pageNumMatch[1], 10) : 1);

      const summary = meals.reduce((acc, meal) => {
          acc.calories += meal.calories || 0; acc.carbs += meal.carbs || 0;
          acc.protein += meal.protein || 0; acc.fat += meal.fats || 0;
          return acc;
        }, { calories: 0, carbs: 0, protein: 0, fat: 0 }
      );
      setDailySummary(summary);
    } catch (error) {
      toast.error("Could not fetch meals. Please try again.", { icon: <AlertTriangle className="text-red" /> });
      console.error("❌ Error fetching meals:", error.response?.data || error.message);
    }
  }, [baseApiUrl]);

  const searchByDate = useCallback(async (date) => {
    if (!date) {
      fetchMeals();
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const data = await getMealsByDate(token, date);
      const meals = data.results || [];
      setLoggedMeals(meals);
      setPagination({ next: null, previous: null, count: meals.length });
      setCurrentPage(1); // Reset to page 1 for search results
    } catch (error) {
      toast.error("Could not find meals for that date.", { icon: <AlertTriangle className="text-red" /> });
      console.error("❌ Error searching meals by date:", error.response?.data || error.message);
    }
  }, [fetchMeals]);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const allInputs = foodInputs.filter(input => input.name && input.quantity && input.unit);
    if (allInputs.length === 0) {
      toast.error("Please fill at least one complete food item.");
      return;
    }

    try {
      for (const input of allInputs) {
        const date = input.date || new Date().toISOString().split("T")[0];
        const time = input.time || new Date().toTimeString().slice(0, 5); // Use current time if not filled
        const consumedAt = new Date(`${date}T${time}:00`).toISOString();

        await createMeal({
          food_name: input.name,
          quantity: parseFloat(input.quantity),
          unit: input.unit,
          meal_type: mealType,
          remarks: input.remark,
          date: date,
          consumed_at: consumedAt,
        }, token);
      }

      toast.success("Meal(s) logged successfully!", { icon: <CheckCircle className="text-primary" /> });
      fetchMeals(); // Fetch the first page to show the new entry
      setFoodInputs([{ name: "", unit: "", quantity: "", remark: "", date: "", time: "" }]);
    } catch (err) {
      console.error("Create meal error:", err.response?.data || err.message);
      toast.error("Failed to add meal(s). Please check your inputs.", { icon: <AlertTriangle className="text-red" /> });
    }
  };

  const handleFoodChange = (idx, field, value) => {
    setFoodInputs(prev => prev.map((input, i) => (i === idx ? { ...input, [field]: value } : input)));
  };

  const addFoodField = () => {
    setFoodInputs(prev => [...prev, { name: "", unit: "", quantity: "", remark: "", date: "", time: "" }]);
  };

  const removeFoodField = (index) => {
    setFoodInputs(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteMeal = async (id) => {
    if (!id) return toast.error("Invalid meal ID.");
    try {
      const token = localStorage.getItem("token");
      await deleteMeal(id, token);
      // Using a more neutral "info" style toast for deletion
      toast("Meal removed.", { icon: <CircleHelp className="text-body" /> });
      fetchMeals(`${baseApiUrl}?page=${currentPage}`); // Refetch the current page
    } catch (error) {
      toast.error("Failed to delete meal.", { icon: <AlertTriangle className="text-red" /> });
      console.error("❌ Error deleting meal:", error.response?.data || error.message);
    }
  };

  const handleNextPage = () => {
    if (pagination.next) fetchMeals(pagination.next);
  };
  const handlePrevPage = () => {
    if (pagination.previous) fetchMeals(pagination.previous);
  };
  const handlePageChange = (pageUrl) => {
    fetchMeals(pageUrl);
  };

  return {
    foodInputs, handleFoodChange, addFoodField, removeFoodField,
    mealType, setMealType, mealTypeOptions, handleSubmit, unitOptions,
    loggedMeals, pagination, currentPage, handleNextPage, handlePrevPage,
    handlePageChange, handleDeleteMeal, dailySummary, searchDate,
    setSearchDate, searchByDate,
  };
};

export default useMealLogger;