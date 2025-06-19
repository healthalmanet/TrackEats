import { useState, useEffect } from 'react';
import {
  getMeals,
  createMeal,
  updateMeal,
  patchMeal,
  deleteMeal,
} from '../../../api/mealLog';

const unitOptions = ['g', 'kg', 'ml', 'l', 'piece', 'cup', 'tbsp', 'tsp', 'slice', 'bowl'];

export default function useMealLogger() {
  const [foodInputs, setFoodInputs] = useState([{ name: '', quantity: '', unit: '', remark: '' }]);
  const [mealType, setMealType] = useState('breakfast');
  const [weekDates, setWeekDates] = useState([]);
  const [calendarDate, setCalendarDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loggedMeals, setLoggedMeals] = useState([]);
  const [pagination, setPagination] = useState({
    next: null,
    previous: null,
    count: 0,
    currentPageUrl: null,
  });

  useEffect(() => {
    const today = new Date();
    const startOfWeek = today.getDate() - today.getDay() + 1;
    const dates = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(new Date().setDate(startOfWeek + i));
      dates.push({
        day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
        date: d.toISOString().split('T')[0],
      });
    }

    setWeekDates(dates);
  }, []);

  useEffect(() => {
    fetchLoggedMeals(); // initial load or when date changes
  }, [calendarDate]);

  const fetchLoggedMeals = async (pageUrl = null) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await getMeals(token, pageUrl);
      const meals = response?.results || [];

      const formatted = meals.map((m) => ({
        id: m.id,
        name: m.food_name || '',
        quantity: m.quantity || '',
        unit: m.unit || '',
        mealType: m.meal_type || '',
        remark: m.remarks || '',
        date: m.date || '',
        nutrition: {
          calories: m.calories ?? 0,
          protein: m.protein ?? 0,
          carbs: m.carbs ?? 0,
          fats: m.fats ?? 0,
          sugar: m.sugar ?? 0,
          fiber: m.fiber ?? 0,
        },
      }));

      setLoggedMeals(formatted);
      setPagination({
        next: response.next,
        previous: response.previous,
        count: response.count,
        currentPageUrl: pageUrl,
      });
    } catch (error) {
      console.error('❌ Error fetching meals:', error);
    }
  };

  const handleNextPage = () => {
    if (pagination.next) {
      fetchLoggedMeals(pagination.next);
    }
  };

  const handlePrevPage = () => {
    if (pagination.previous) {
      fetchLoggedMeals(pagination.previous);
    }
  };

  const handleFoodChange = (index, field, value) => {
    const updated = [...foodInputs];
    updated[index][field] = value;
    setFoodInputs(updated);
  };

  const addFoodField = () => {
    setFoodInputs([...foodInputs, { name: '', quantity: '', unit: '', remark: '' }]);
  };

  const removeFoodField = (index) => {
    const updated = foodInputs.filter((_, i) => i !== index);
    setFoodInputs(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    const newMeals = [];

    for (const foodItem of foodInputs) {
      const { name, quantity, unit, remark } = foodItem;
      if (!name?.trim()) continue;

      const parsedQuantity = Number(quantity);
      if (!parsedQuantity || parsedQuantity <= 0 || isNaN(parsedQuantity)) continue;

      if (!unit) continue;

      const mealData = {
        food_name: name.trim(),
        quantity: parsedQuantity,
        unit,
        meal_type: mealType,
        remarks: remark?.trim() || '',
      };

      try {
        const created = await createMeal(mealData, token);
        if (created) {
          newMeals.push({
            id: created.id,
            name: created.food_name,
            quantity: created.quantity,
            unit: created.unit,
            mealType: created.meal_type,
            remark: created.remarks,
            date: created.date || '',
            nutrition: {
              calories: created.calories ?? 0,
              protein: created.protein ?? 0,
              carbs: created.carbs ?? 0,
              fats: created.fats ?? 0,
              sugar: created.sugar ?? 0,
              fiber: created.fiber ?? 0,
            },
          });
        }
      } catch (error) {
        console.error(`❌ Error logging meal '${name}':`, error.response?.data || error);
      }
    }

    setFoodInputs([{ name: '', quantity: '', unit: '', remark: '' }]);
    await fetchLoggedMeals(pagination.currentPageUrl);
  };

  const handleDeleteMeal = async (mealId) => {
    try {
      console.log('Deleting meal with ID:', mealId);
      const token = localStorage.getItem('token');
      if (!token) return;

      await deleteMeal(mealId, token);
      console.log('✅ Meal deleted');
      await fetchLoggedMeals(pagination.currentPageUrl);
    } catch (err) {
      console.error('❌ Error deleting meal:', err.response?.data || err);
    }
  };

  return {
    foodInputs,
    handleFoodChange,
    addFoodField,
    removeFoodField,
    mealType,
    setMealType,
    weekDates,
    calendarDate,
    setCalendarDate,
    handleSubmit,
    unitOptions,
    loggedMeals,
    handleDeleteMeal,
    handleNextPage,
    handlePrevPage,
    pagination,
    fetchLoggedMeals,
  };
}
