import axios from 'axios';

// ✅ Use local or deployed base URL
const BASE_URL = 'https://trackeats.onrender.com/api/water/'; // change if testing locally

const createAxiosInstance = (token) =>
  axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

/**
 * Logs 500ml of water (equivalent to 2 glasses).
 */
export const logWaterGlass = async (token) => {
  try {
    console.log('📤 Sending water log request');
    const axiosInstance = createAxiosInstance(token);
    const response = await axiosInstance.post('/', {
      amount_ml: 250,
    });

    return response.data;
  } catch (error) {
    console.error('❌ Failed to log water:');
    if (error.response) {
      console.error('🔴 Server responded with status:', error.response.status);
      console.error('📨 Response data:', error.response.data);
    } else if (error.request) {
      console.error('🟡 Request sent but no response received:', error.request);
    } else {
      console.error('⚠️ Error setting up request:', error.message);
    }
    throw error;
  }
};

/**
 * Gets water log for a specific date in YYYY-MM-DD format.
 */
export const getWaterByDate = async (token, date) => {
  try {
    const axiosInstance = createAxiosInstance(token);
    const response = await axiosInstance.get(`/?date=${date}`);

    return response.data; // e.g., { amount_ml: 500, date: "...", id: ..., user: ... }
  } catch (error) {
    console.error(`❌ Failed to fetch water for ${date}:`);
    if (error.response) {
      console.error('🔴 Server responded with status:', error.response.status);
      console.error('📨 Response data:', error.response.data);
    } else if (error.request) {
      console.error('🟡 Request sent but no response received:', error.request);
    } else {
      console.error('⚠️ Error setting up request:', error.message);
    }
    throw error;
  }
};
