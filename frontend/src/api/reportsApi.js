import axios from "axios";
import axiosRetry from "axios-retry";

const BASE_URL = "https://trackeats.onrender.com/api";

// Axios retry setup (optional but recommended for Render)
axiosRetry(axios, {
  retries: 3,                             // ✅ Number of retries
  retryDelay: axiosRetry.exponentialDelay, // ✅ Exponential backoff
});

// Function to return headers with Authorization token
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  // Throw an error if token is missing to prevent unnecessary API calls
  if (!token) {
    throw new Error("Authentication token not found. Please log in.");
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    timeout: 15000, // ✅ 15 seconds timeout
  };
};

/**
 * GET /recommend-calories/
 * Fetches user's calorie and macronutrient recommendations.
 * @param {string} currentDate - The user's current local date in 'YYYY-MM-DD' format.
 * This is passed to the backend to ensure accurate age calculation.
 */
export const targetApi = async (currentDate) => {
  if (!currentDate) throw new Error("currentDate is required for targetApi.");
  const response = await axios.get(`${BASE_URL}/recommend-calories/?current_date=${currentDate}`, getAuthHeaders());
  return response.data;
};

/**
 * GET /daily-calorie-summary/
 * Fetches the calorie and macronutrient summary for a specific day.
 * @param {string} date - The target date in 'YYYY-MM-DD' format.
 */
export const targetProgressApi = async (date) => {
  if (!date) throw new Error("date is required for targetProgressApi.");
  const response = await axios.get(`${BASE_URL}/daily-calorie-summary/?date=${date}`, getAuthHeaders());
  return response.data;
}

/**
 * GET /nutrition7day/
 * Fetches nutritional data for the 7-day period ending on the given date.
 * @param {string} endDate - The end date for the 7-day range in 'YYYY-MM-DD' format.
 */
export const weeklyTrack = async (endDate) => {
  if (!endDate) throw new Error("endDate is required for weeklyTrack.");
  const response = await axios.get(`${BASE_URL}/nutrition7day/?end_date=${endDate}`, getAuthHeaders());
  return response.data;
};