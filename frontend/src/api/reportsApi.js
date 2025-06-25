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
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    timeout: 15000, // ✅ 15 seconds timeout for slow responses (increase if needed)
  };
};

// GET /recommend-calories/
export const targetApi = async () => {
  const response = await axios.get(`${BASE_URL}/recommend-calories/`, getAuthHeaders());
  return response.data;
};

// GET /daily-calorie-summary/
export const targetProgressApi = async () => {
  const response = await axios.get(`${BASE_URL}/daily-calorie-summary/`, getAuthHeaders());
  return response.data;
}

export const weeklyTrack = async () => {
  const response = await axios.get(`${BASE_URL}/nutrition7day/`, getAuthHeaders());
  return response.data;
};


