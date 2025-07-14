// Filename: src/api/WaterTracker.js
// This is the complete, corrected file.

import axios from 'axios';

const BASE_URL = 'https://trackeats.onrender.com/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
};

/**
 * --- DYNAMIC DATA FIX ---
 * The `params` object now includes a `_` key with a timestamp.
 * This is a "cache buster". It makes every GET request URL unique,
 * forcing the server to return fresh, non-cached data every time.
 */

// Fetches the total water logged directly for a specific day.
export const getTotalWaterForDate = async (date) => {
  const config = {
    ...getAuthHeaders(),
    params: { date, _: Date.now() } // Cache buster added
  };
  const response = await axios.get(`${BASE_URL}/water/total/`, config);
  return response.data;
};


// Fetches a paginated history of daily water totals.
export const getWaterHistory = async (page = 1) => {
  const config = {
    ...getAuthHeaders(),
    params: { page, _: Date.now() } // Cache buster added
  };
  const response = await axios.get(`${BASE_URL}/water/`, config);
  return response.data;
};

export const getWaterLogForDate = async (date) => {
  const config = {
    ...getAuthHeaders(),
    // Using a cache-buster to ensure we always get fresh data
    params: { date, _: Date.now() }
  };
  const response = await axios.get(`${BASE_URL}/water/log/`, config);
  return response.data; // Should return { results: [{ id, amount_ml, created_at }, ...] }
};

// --- POST request does not need a cache buster ---
// It is designed to change data, so it's not cached.
export const postWater = async (formData) => {
  // Your API seems to default to today's date if not provided,
  // which is fine. This body is correct.
  const response = await axios.post(`${BASE_URL}/water/`, formData, getAuthHeaders());
  return response.data;
};
// ✅ GET water entry by date: /water/?date=YYYY-MM-DD
export const getWater = async (date) => {
  const response = await axios.get(`${BASE_URL}/water/?date=${date}`, getAuthHeaders());
  return response.data;
};
