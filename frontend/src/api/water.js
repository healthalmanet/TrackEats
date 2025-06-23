// src/api/water.js
import axios from 'axios';

// Use either local or deployed URL
const BASE_URL = 'https://trackeats.onrender.com/api/water/'; // ✅ Update if needed

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
    // 🔍 Debug Logs
    console.log('📤 Sending water log request');
    console.log('➡️ URL:', BASE_URL);
    console.log('📦 Body:', { amount_ml: 500 });
    console.log('🛡️ Headers:', {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    const axiosInstance = createAxiosInstance(token);
    const response = await axiosInstance.post('/', {
      amount_ml: 500, // One glass = 500ml
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

// 🔄 Future additions
// export const getWaterByDate = async (...) => { ... }
// export const getPaginatedWaterLogs = async (...) => { ... }
