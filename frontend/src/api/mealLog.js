import axios from 'axios';

// ✅ Always use HTTPS to prevent CORS redirect issues
const BASE_URL = 'https://trackeats.onrender.com/api/logmeals';

const createAxiosInstance = (token) =>
  axios.create({
    baseURL: BASE_URL,
    timeout: 60000, // ⏱️ 15 seconds timeout
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

// ✅ Get meals (paginated), with forced HTTPS on pagination URLs
export const getMeals = async (token, url = null) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    const finalUrl = url
      ? url.replace(/^http:\/\//, 'https://')
      : `${BASE_URL}/?page=1&page_size=5`;

    const response = await axios.get(finalUrl, {
      headers,
      timeout: 30000, // ⏱️ Added timeout here
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching meals:', error.response?.data || error.message);
    throw error;
  }
};

// ✅ Create new meal
export const createMeal = async (mealData, token) => {
  try {
    const axiosInstance = createAxiosInstance(token);
    const response = await axiosInstance.post('/', formatMealData(mealData));
    return response.data;
  } catch (error) {
    console.error('❌ Error creating meal:', error.response?.data || error.message);
    throw error;
  }
};

// ✅ Full update of a meal
export const updateMeal = async (mealId, updatedMealData, token) => {
  try {
    const axiosInstance = createAxiosInstance(token);
    const response = await axiosInstance.put(`/${mealId}/`, formatMealData(updatedMealData));
    return response.data;
  } catch (error) {
    console.error(`❌ Error updating meal ${mealId}:`, error.response?.data || error.message);
    throw error;
  }
};

// ✅ Partial update of a meal
export const patchMeal = async (mealId, partialMealData, token) => {
  try {
    const axiosInstance = createAxiosInstance(token);
    const response = await axiosInstance.patch(`/${mealId}/`, partialMealData);
    return response.data;
  } catch (error) {
    console.error(`❌ Error patching meal ${mealId}:`, error.response?.data || error.message);
    throw error;
  }
};

// ✅ Delete a meal
export const deleteMeal = async (mealId, token) => {
  try {
    const axiosInstance = createAxiosInstance(token);
    const response = await axiosInstance.delete(`/${mealId}/`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error deleting meal ${mealId}:`, error.response?.data || error.message);
    throw error;
  }
};

export const getMealsByDate = async (token, date) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    const url = `https://trackeats.onrender.com/api/logmeals/?date=${date}&page=1`;
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching meals by date:', error.response?.data || error.message);
    throw error;
  }
};

