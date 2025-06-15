import { useState, useEffect } from 'react';
import { fetchNutritionData } from '../../../api/nutritionApi';
import axios from 'axios';

const unitOptions = ['g', 'kg', 'ml', 'l', 'piece', 'cup', 'tbsp', 'tsp', 'slice', 'bowl'];

export default function useMealLogger() {
  const [foodInputs, setFoodInputs] = useState([{ name: '', quantity: '', unit: '', remark: '' }]);
  const [mealType, setMealType] = useState('breakfast');
  const [selectedDate, setSelectedDate] = useState('');
  const [weekDates, setWeekDates] = useState([]);
  const [loggedMeals, setLoggedMeals] = useState([]);
  const [calendarDate, setCalendarDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const today = new Date();
    const startOfWeek = today.getDate() - today.getDay() + 1;
    const dates = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(today.setDate(startOfWeek + i));
      dates.push({
        day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
        date: d.toISOString().split('T')[0],
      });
    }

    setWeekDates(dates);
    setSelectedDate(dates[0].date);
  }, []);

  useEffect(() => {
    fetchLoggedMeals();
  }, [calendarDate]);

  const fetchLoggedMeals = async () => {
    try {
      const res = await axios.get(`/api/meals?date=${calendarDate}`);

      // ✅ Ensure response is an array before setting
      const meals = Array.isArray(res.data) ? res.data : [];
      setLoggedMeals(meals);
    } catch (error) {
      console.error('Error fetching logged meals:', error);
      setLoggedMeals([]); // Fallback to empty array
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

    const newEntries = [];

    for (const foodItem of foodInputs) {
      if (!foodItem.name.trim()) continue;
      try {
        const nutrition = await fetchNutritionData(foodItem.name);
        const newMeal = {
          food: foodItem.name,
          quantity: foodItem.quantity,
          unit: foodItem.unit,
          remark: foodItem.remark,
          mealType,
          date: selectedDate,
          timestamp: new Date().toLocaleString(),
          nutrition,
        };

        // Save to backend
        await axios.post('/api/meals', newMeal);

        newEntries.push(newMeal);
      } catch (error) {
        console.error(`Error logging meal ${foodItem.name}:`, error);
      }
    }

    setFoodInputs([{ name: '', quantity: '', unit: '', remark: '' }]);

    // Refresh meals from backend
    fetchLoggedMeals();
  };

  return {
    foodInputs,
    handleFoodChange,
    addFoodField,
    removeFoodField,
    mealType,
    setMealType,
    selectedDate,
    setSelectedDate,
    weekDates,
    calendarDate,
    setCalendarDate,
    handleSubmit,
    unitOptions,
    loggedMeals,
  };
}
