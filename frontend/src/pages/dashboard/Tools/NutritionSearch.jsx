// src/components/NutritionSearch.js
import React, { useState } from 'react';
import { fetchNutritionData } from '../../../api/nutritionApi';

const NutritionSearch = () => {
  const [foodItem, setFoodItem] = useState('');
  const [nutritionData, setNutritionData] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    try {
      const data = await fetchNutritionData(foodItem);
      setNutritionData(data.foods[0]);
      setError('');
    } catch (err) {
      setError('Could not fetch data. Try again.');
      setNutritionData(null);
    }
  };

  return (
    <div>
      <h1>Nutrition Tracker</h1>
      <input
        type="text"
        value={foodItem}
        placeholder="Enter a food item"
        onChange={(e) => setFoodItem(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {nutritionData && (
        <div>
          <h3>{nutritionData.food_name}</h3>
          <p>Calories: {nutritionData.nf_calories}</p>
          <p>Protein: {nutritionData.nf_protein}g</p>
          <p>Carbs: {nutritionData.nf_total_carbohydrate}g</p>
          <p>Fat: {nutritionData.nf_total_fat}g</p>
        </div>
      )}
    </div>
  );
};

export default NutritionSearch;
