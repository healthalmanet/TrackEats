import React, { useState, useEffect } from 'react';
import { fetchNutritionData } from '../../../api/nutritionApi';

const MealLogger = () => {
  const [foodInputs, setFoodInputs] = useState([{ name: '', quantity: '', unit: '', remark: '' }]);
  const [mealType, setMealType] = useState('breakfast');
  const [selectedDate, setSelectedDate] = useState('');
  const [weekDates, setWeekDates] = useState([]);
  const [loggedMeals, setLoggedMeals] = useState([]);
  const [calendarDate, setCalendarDate] = useState(() => new Date().toISOString().split('T')[0]);

  const unitOptions = ['g', 'kg', 'ml', 'l', 'piece', 'cup', 'tbsp', 'tsp', 'slice', 'bowl'];

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
        newEntries.push({
          food: foodItem.name,
          quantity: foodItem.quantity,
          unit: foodItem.unit,
          remark: foodItem.remark,
          mealType,
          date: selectedDate,
          timestamp: new Date().toLocaleString(),
          nutrition,
        });
      } catch (error) {
        console.error(`Error fetching nutrition for ${foodItem.name}`, error);
      }
    }

    setLoggedMeals([...loggedMeals, ...newEntries]);
    setFoodInputs([{ name: '', quantity: '', unit: '', remark: '' }]); // reset
  };

  return (
    <div>
      <h2>Meal Logger</h2>

      <div style={{ marginBottom: '10px' }}>
        <label>
          <strong>Check Meals by Date: </strong>
          <input
            type="date"
            value={calendarDate}
            onChange={(e) => setCalendarDate(e.target.value)}
          />
        </label>
      </div>

      <div>
        <p>Select a day to log meal:</p>
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
          {foodInputs.map((item, index) => (
            <div key={index} style={{ marginBottom: '10px' }}>
              <input
                type="text"
                placeholder={`Food item ${index + 1}`}
                value={item.name}
                onChange={(e) => handleFoodChange(index, 'name', e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Qty"
                value={item.quantity}
                onChange={(e) => handleFoodChange(index, 'quantity', e.target.value)}
                style={{ marginLeft: '5px', width: '80px' }}
              />
              <select
                value={item.unit}
                onChange={(e) => handleFoodChange(index, 'unit', e.target.value)}
                style={{ marginLeft: '5px' }}
              >
                <option value="">Unit</option>
                {unitOptions.map((unit) => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Remarks"
                value={item.remark}
                onChange={(e) => handleFoodChange(index, 'remark', e.target.value)}
                style={{ marginLeft: '5px', width: '150px' }}
              />
              {foodInputs.length > 1 && (
                <button type="button" onClick={() => removeFoodField(index)} style={{ marginLeft: '5px' }}>
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addFoodField}>+ Add Another Food</button>
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
      {loggedMeals
        .filter((meal) => meal.date === calendarDate)
        .map((meal, index) => (
          <div key={index}>
            <p><strong>{meal.date} - {meal.mealType.toUpperCase()}</strong></p>
            <p><em>Logged at: {meal.timestamp}</em></p>
            <p>Food: {meal.food}</p>
            <p>Quantity: {meal.quantity} {meal.unit}</p>
            <p>Remarks: {meal.remark}</p>
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
