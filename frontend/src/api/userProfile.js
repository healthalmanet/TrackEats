import axios from "axios";

const BASE_URL = "https://trackeats.onrender.com/api/profile";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getAuthHeaders = () => {
  const token = localStorage.getItem("token"); // ensure token is set on login
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

// 1. Create user profile
export const createUserProfile = async (profileData) => {
  await delay(500);
  const response = await axios.post(`${BASE_URL}/create/`, profileData, getAuthHeaders());
  return response.data;
};

// 2. Get user profile
export const getUserProfile = async () => {
  await delay(500);
  const response = await axios.get(`${BASE_URL}/`, getAuthHeaders());
  return response.data;
};

// 3. Update user profile
export const updateUserProfile = async (profileData) => {
  await delay(500);
  const response = await axios.patch(`${BASE_URL}/`, profileData, getAuthHeaders());
  return response.data;
};
