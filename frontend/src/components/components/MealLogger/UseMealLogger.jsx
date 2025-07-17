// src/components/dashboard/UseMealLogger.js

import { useEffect, useState, useCallback } from "react";
import { getMeals, createMeal, deleteMeal, getMealsByDate } from "../../../api/mealLog";
import { toast } from "react-hot-toast";
import { CheckCircle, AlertTriangle, CircleHelp } from "lucide-react";
import React from "react";

const useMealLogger = () => {
  const [foodInputs, setFoodInputs] = useState([
    { id: Date.now(), name: "", unit: "", quantity: "", remark: "" },
  ]);
  const [mealType, setMealType] = useState("Breakfast");
  const [loggedMeals, setLoggedMeals] = useState([]);
  const [pagination, setPagination] = useState({ next: null, previous: null, count: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [dailySummary, setDailySummary] = useState({ calories: 0, carbs: 0, protein: 0, fat: 0 });
  const [searchDate, setSearchDate] = useState(new Date().toISOString().split("T")[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const unitOptions = [ "Gram", "Kilogram", "Milliliters", "Liters", "Cup", "Bowl", "Piece", "Tbsp", "Tsp", "Plate", "Handful", "Pinch", "Other" ];
  const mealTypeOptions = [ "Early-Morning", "Breakfast", "Mid-Morning Snack", "Lunch", "Afternoon Snack", "Dinner", "Bedtime" ];
  
  const baseApiUrl = import.meta.env.VITE_API_URL || "https://trackeats.onrender.com/api/logmeals/";

  const fetchMeals = useCallback(async (url = null) => {
    setIsFetching(true);
    try {
      const token = localStorage.getItem("token");
      const data = url ? await getMeals(token, url) : await getMealsByDate(token, searchDate);
      
      const meals = data.results || [];
      setLoggedMeals(meals);
      setPagination({ next: data.next, previous: data.previous, count: data.count });
      
      const pageNumMatch = (url || `${baseApiUrl}?page=1`).match(/page=(\d+)/);
      setCurrentPage(pageNumMatch ? parseInt(pageNumMatch[1], 10) : 1);

    } catch (error) {
      toast.error("Could not fetch meals.", { icon: <AlertTriangle className="text-[var(--color-danger-text)]" /> });
    } finally {
      setIsFetching(false);
    }
  }, [baseApiUrl, searchDate]);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);
  
  const searchByDate = useCallback((date) => {
    const newDate = date || new Date().toISOString().split("T")[0];
    setSearchDate(newDate);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem("token");

    const allInputs = foodInputs.filter(input => input.name && input.quantity && input.unit);
    if (allInputs.length === 0) {
      toast.error("Please fill at least one complete food item.");
      setIsSubmitting(false);
      return;
    }

    try {
      const timeNow = new Date().toTimeString().slice(0, 5);

      for (const input of allInputs) {
        const consumedAt = new Date(`${searchDate}T${timeNow}:00`).toISOString();
        await createMeal({
          food_name: input.name,
          quantity: parseFloat(input.quantity),
          unit: input.unit,
          meal_type: mealType,
          remarks: input.remark,
          date: searchDate,
          consumed_at: consumedAt,
        }, token);
      }

      toast.success("Meal(s) logged successfully!", { icon: <CheckCircle className="text-[var(--color-success-text)]" /> });
      await fetchMeals();
      setFoodInputs([{ id: Date.now(), name: "", unit: "", quantity: "", remark: "" }]);
    } catch (err) {
      toast.error("Failed to add meal(s).", { icon: <AlertTriangle className="text-[var(--color-danger-text)]" /> });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFoodChange = (idx, field, value) => {
    setFoodInputs(prev => prev.map((input, i) => (i === idx ? { ...input, [field]: value } : input)));
  };

  const addFoodField = () => {
    setFoodInputs(prev => [...prev, { id: Date.now(), name: "", unit: "", quantity: "", remark: "" }]);
  };

  const removeFoodField = (index) => {
    setFoodInputs(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteMeal = async (id) => {
    if (!id) return toast.error("Invalid meal ID.");
    try {
      const token = localStorage.getItem("token");
      await deleteMeal(id, token);
      toast("Meal removed.", { icon: <CircleHelp className="text-[var(--color-text-default)]" /> });
      // Refetch the current state after deletion
      await fetchMeals(pagination.next || pagination.previous ? `${baseApiUrl}?page=${currentPage}` : null);
    } catch (error) {
      toast.error("Failed to delete meal.", { icon: <AlertTriangle className="text-[var(--color-danger-text)]" /> });
    }
  };

  const handlePageChange = (pageUrl) => {
    if (pageUrl) fetchMeals(pageUrl);
  };

  return {
    foodInputs, handleFoodChange, addFoodField, removeFoodField,
    mealType, setMealType, mealTypeOptions, handleSubmit, unitOptions,
    loggedMeals, pagination, currentPage, handlePageChange,
    handleDeleteMeal, dailySummary, searchDate,
    setSearchDate, searchByDate, isSubmitting, isFetching
  };
};

export default useMealLogger;