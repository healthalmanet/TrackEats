// src/api/Weight.js

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

// ✅ GET water entry by date: /water/?date=YYYY-MM-DD
export const getWater = async (date) => {
  const response = await axios.get(`${BASE_URL}/water/?date=${date}`, getAuthHeaders());
  return response.data;
};

// ✅ POST new water entry to /water/
// export const postWater = async (formData) => {
//     const amount_ml=formData.amount;
//     console.log("formData", JSON.parse(amount_ml));
    
//   const response = await axios.post(`${BASE_URL}/water/`, amount_ml, getAuthHeaders());
//   return response.data;
// };
export const postWater = async (formData) => {
  console.log("formData", formData); // formData is expected to have { amount_ml, date }
  const response = await axios.post(`${BASE_URL}/water/`, formData, getAuthHeaders());
  return response.data;
};