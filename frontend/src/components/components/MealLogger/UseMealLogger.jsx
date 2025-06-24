import { useEffect, useState } from "react";
import { getMeals, createMeal, deleteMeal } from "../../../api/mealLog";
import { toast } from "react-hot-toast";

const useMealLogger = () => {
  const [foodInputs, setFoodInputs] = useState([
    { name: "", unit: "", quantity: "", remark: "", date: "", time: "" },
  ]);
  const [mealType, setMealType] = useState("breakfast");
  const [loggedMeals, setLoggedMeals] = useState([]);
  const [pagination, setPagination] = useState({
    next: null,
    previous: null,
    count: 0,
    currentPageUrl: null,
  });

  const [currentPage, setCurrentPage] = useState(1);

  const unitOptions = ["g", "ml", "piece", "cup", "bowl", "tbsp", "tsp"];
  const token = localStorage.getItem("token");

  const extractPageNumber = (url) => {
    if (!url) return 1;
    const match = url.match(/page=(\d+)/);
    return match ? parseInt(match[1], 10) : 1;
  };

  const fetchMeals = async (url = null) => {
    try {
      const data = await getMeals(token, url);
      setLoggedMeals(data.results || []);
      setPagination({
        next: data.next,
        previous: data.previous,
        count: data.count,
        currentPageUrl: url,
      });

      const pageNum = extractPageNumber(url || `${process.env.REACT_APP_API_URL || 'https://trackeats.onrender.com/api/logmeals/'}?page=1`);
      setCurrentPage(pageNum);
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
      fetchMeals(pagination.currentPageUrl); // Refresh same page
      setFoodInputs([{ name: "", unit: "", quantity: "", remark: "", date: "", time: "" }]);
    } catch (err) {
      console.error("Create meal error:", err.response?.data || err.message);
      toast.error("Failed to add meal");
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
    handleSubmit,
    unitOptions,
    loggedMeals,
    pagination,
    currentPage,
    handleNextPage,
    handlePrevPage,
    handlePageChange,
    handleDeleteMeal,
  };
};

export default useMealLogger;
