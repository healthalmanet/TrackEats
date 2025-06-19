// src/api/mealLog.js
import axios from 'axios';

const BASE_URL = 'https://trackeats.onrender.com/api/logmeals';

const createAxiosInstance = (token) =>
  axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

const formatMealData = (meal) => ({
  food_name: meal.food_name,
  quantity: meal.quantity,
  unit: meal.unit,
  meal_type: meal.meal_type,
  remarks: meal.remarks,
});

// Get meals (paginated)
export const getMeals = async (token, url = null) => {
  try {
    if (url) {
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } else {
      const axiosInstance = createAxiosInstance(token);
      const response = await axiosInstance.get('/?page_size=10');
      return response.data;
    }
  } catch (error) {
    console.error('Error fetching meals with pagination:', error);
    throw error;
  }
};

export const createMeal = async (mealData, token) => {
  try {
    const axiosInstance = createAxiosInstance(token);
    const response = await axiosInstance.post('/', formatMealData(mealData));
    return response.data;
  } catch (error) {
    console.error('Error creating meal:', error);
    throw error;
  }
};

export const updateMeal = async (mealId, updatedMealData, token) => {
  try {
    const axiosInstance = createAxiosInstance(token);
    const response = await axiosInstance.put(`/${mealId}`, formatMealData(updatedMealData));
    return response.data;
  } catch (error) {
    console.error(`Error updating meal with ID ${mealId}:`, error);
    throw error;
  }
};

export const patchMeal = async (mealId, partialMealData, token) => {
  try {
    const axiosInstance = createAxiosInstance(token);
    const response = await axiosInstance.patch(`/${mealId}`, partialMealData);
    return response.data;
  } catch (error) {
    console.error(`Error patching meal with ID ${mealId}:`, error);
    throw error;
  }
};

export const deleteMeal = async (mealId, token) => {
  try {
    const axiosInstance = createAxiosInstance(token);
    const response = await axiosInstance.delete(`/${mealId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting meal with ID ${mealId}:`, error);
    throw error;
  }
};
