// src/api/nutritionApi.js

import axios from "axios";

const BASE_URL = "https://trackeats.onrender.com/api/";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      "Content-Type": "application/json",
    },
  };
};

export const searchFoodNutrition = async (foodName) => {
  try {
    const response = await axios.get(
      `${BASE_URL}foods/?search=${encodeURIComponent(foodName)}`,
      getAuthHeaders()
    );

    // ✅ THE CRITICAL CHANGE IS HERE: Return the first object from the 'results' array
    if (response.data && response.data.results && response.data.results.length > 0) {
      return response.data.results[0]; // This extracts the actual food object
    } else {
      return null; // No results found
    }
  } catch (error) {
    console.error("Error fetching food nutrition:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.detail || "Failed to fetch food nutrition. Please try again."
    );
  }
};