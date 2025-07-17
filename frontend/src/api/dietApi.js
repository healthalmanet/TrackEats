import axios from "axios";
import axiosRetry from "axios-retry";

const BASE_URL = "https://trackeats.onrender.com/api";

// ✅ Setup retry for all axios requests
axiosRetry(axios, {
  retries: 3, // Number of retries
  retryDelay: (retryCount) => {
    // Exponential back-off delay (e.g., 1s, 2s, 4s)
    return retryCount * 1000;
  },
  retryCondition: (error) => {
    // Retry on network errors and 5xx server errors
    return (
      axiosRetry.isNetworkError(error) ||
      error.response?.status >= 500
    );
  },
});

// Function to return common axios config (headers, timeout)
const getAxiosConfig = () => {
  const token = localStorage.getItem("token"); // Assumes token is stored in localStorage
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    timeout: 30000, // ✅ 30 seconds timeout
  };
};

// --- API FUNCTIONS ---

/**
 * Fetches the current active diet plan.
 * Endpoint: GET /diet-plan/active/
 */
export const getDietApi = async () => {
  try {
    // The endpoint for the active plan
    const response = await axios.get(`${BASE_URL}/diet/`, getAxiosConfig());
    return response.data;
  } catch (error) {
    console.error("API Error in getDietApi:", error.response?.data || error.message);
    // Return a structured error to be handled by the component
    return { status_code: "FETCH_ERROR", message: "Could not fetch active diet plan." };
  }
};

/**
 * Fetches the history of approved diet plans.
 * Endpoint: GET /diet-plan/history/?status=approved
 */
export const getDietHistoryApi = async () => {
  try {
    const config = {
      ...getAxiosConfig(),
      // Use the 'params' property to add URL query parameters
      params: {
        status: 'approved'
      }
    };
    const response = await axios.get(`${BASE_URL}/diet-plan/history/`, config);
    return response.data;
  } catch (error) {
    console.error("API Error in getDietHistoryApi:", error.response?.data || error.message);
    // Return a structured error to be handled by the component
    return { status_code: "FETCH_ERROR", message: "Could not fetch diet plan history." };
  }
};