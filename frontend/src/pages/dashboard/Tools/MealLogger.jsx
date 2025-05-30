import React, { useState, useEffect } from 'react';
import { fetchNutritionData } from '../../../api/nutritionApi';

const MealLogger = () => {
  const [foodInputs, setFoodInputs] = useState(['']); // multiple food fields
  const [mealType, setMealType] = useState('breakfast');
  const [selectedDate, setSelectedDate] = useState('');
  const [weekDates, setWeekDates] = useState([]);
  const [loggedMeals, setLoggedMeals] = useState([]);

  useEffect(() => {
    const today = new Date();
    const startOfWeek = today.getDate() - today.getDay() + 1; // Monday start
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

  const handleFoodChange = (index, value) => {
    const updated = [...foodInputs];
    updated[index] = value;
    setFoodInputs(updated);
  };

  const addFoodField = () => {
    setFoodInputs([...foodInputs, '']);
  };

  const removeFoodField = (index) => {
    const updated = foodInputs.filter((_, i) => i !== index);
    setFoodInputs(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newEntries = [];

    for (const food of foodInputs) {
      if (!food.trim()) continue;
      try {
        const nutrition = await fetchNutritionData(food);
        newEntries.push({
          food,
          mealType,
          date: selectedDate,
          nutrition,
        });
      } catch (error) {
        console.error(`Error fetching nutrition for ${food}`, error);
      }
    }

    setLoggedMeals([...loggedMeals, ...newEntries]);
    setFoodInputs(['']); // reset to one empty field
  };

  return (
    <div>
      <h2>Meal Logger</h2>

      <div>
        <p>Select a day:</p>
        {weekDates.map((d) => (
          <label key={d.date} style={{ marginRight: '10px' }}>
            <input
              type="radio"
              name="day"
              value={d.date}
              checked={selectedDate === d.date}
              onChange={() => setSelectedDate(d.date)}
            />
            {d.day} ({d.date})
          </label>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Food Items:</label>
          {foodInputs.map((food, index) => (
            <div key={index} style={{ marginBottom: '5px' }}>
              <input
                type="text"
                value={food}
                onChange={(e) => handleFoodChange(index, e.target.value)}
                required
                placeholder={`Food item ${index + 1}`}
              />
              {foodInputs.length > 1 && (
                <button type="button" onClick={() => removeFoodField(index)} style={{ marginLeft: '5px' }}>
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addFoodField} style={{ marginTop: '5px' }}>
            + Add Another Food
          </button>
        </div>

        <div style={{ marginTop: '10px' }}>
          <label>Meal Type: </label>
          {['breakfast', 'lunch', 'dinner'].map((type) => (
            <label key={type} style={{ marginRight: '10px' }}>
              <input
                type="radio"
                value={type}
                checked={mealType === type}
                onChange={() => setMealType(type)}
              />
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </label>
          ))}
        </div>

        <button type="submit" style={{ marginTop: '10px' }}>Log Meal</button>
      </form>

      <h3>Logged Meals:</h3>
      {loggedMeals.map((meal, index) => (
        <div key={index}>
          <p><strong>{meal.date} - {meal.mealType.toUpperCase()}</strong></p>
          <p>Food: {meal.food}</p>
          <p>Calories: {meal.nutrition.calories}</p>
          <p>Protein: {meal.nutrition.protein}g</p>
          <p>Carbs: {meal.nutrition.carbs}g</p>
          <p>Fat: {meal.nutrition.fat}g</p>
          <hr />
        </div>
      ))}
    </div>
  );
};

export default MealLogger;
