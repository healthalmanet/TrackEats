// src/api/nutritionApi.js
import axios from 'axios';

const APP_ID = 'your_app_id';       // Replace with your Nutritionix App ID
const APP_KEY = 'your_app_key';     // Replace with your Nutritionix App Key

const mockData = {
  apple: { calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
  banana: { calories: 105, protein: 1.3, carbs: 27, fat: 0.3 },
  rice: { calories: 200, protein: 4, carbs: 45, fat: 0.4 },
};

export const fetchNutritionData = async (foodName) => {
  const lowerCaseName = foodName.toLowerCase();

  // Check mock data first
  if (mockData[lowerCaseName]) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ food_name: lowerCaseName, ...mockData[lowerCaseName] });
      }, 500);
    });
  }

  // If not found in mock data, fallback to Nutritionix API
  try {
    const response = await axios.post(
      'https://trackapi.nutritionix.com/v2/natural/nutrients',
      { query: foodName },
      {
        headers: {
          'x-app-id': APP_ID,
          'x-app-key': APP_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    const food = response.data.foods[0];
    return {
      food_name: food.food_name,
      calories: food.nf_calories,
      protein: food.nf_protein,
      carbs: food.nf_total_carbohydrate,
      fat: food.nf_total_fat,
    };
  } catch (error) {
    console.error('Nutritionix API error:', error);
    throw error;
  }
};
