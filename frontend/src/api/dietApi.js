import axios from "axios";
import axiosRetry from "axios-retry";

const BASE_URL = "https://trackeats.onrender.com/api";

// ✅ Setup retry for failed requests (e.g., Render sleeping)
axiosRetry(axios, {
  retries: 3, // Number of retries
  retryDelay: axiosRetry.exponentialDelay, // Exponential backoff between retries
});

// Function to return headers with Authorization token and timeout
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    timeout: 15000, // ✅ 15 seconds timeout to handle slow responses
  };
};

// ✅ GET /diet/week/
export const getDietApi = async () => {
  const response = await axios.get(`${BASE_URL}/diet/week/`, getAuthHeaders());
  return response.data;
};
