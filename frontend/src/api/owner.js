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

// ✅ Get weight entries
export const getWeight = async () => {
  const response = await axios.get(`${BASE_URL}/weight/`, getAuthHeaders());
  return response.data;
};

// ✅ Post new weight entry
export const postWeight = async (formData) => {
  const response = await axios.post(`${BASE_URL}/weight/`, formData, getAuthHeaders());
  return response.data;
};

// ✅ Get owner details
export const getOwner = async () => {
  const response = await axios.get(`${BASE_URL}/owner/`, getAuthHeaders());
  return response.data;
};
