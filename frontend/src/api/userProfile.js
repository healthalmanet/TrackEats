import axios from "axios";

const BASE_URL = "https://trackeats.onrender.com/api/profile";

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
  const response = await axios.post(`${BASE_URL}/create/`, profileData, getAuthHeaders());
  return response.data;
};

// 2. Get user profile
export const getUserProfile = async () => {
  const response = await axios.get(`${BASE_URL}`, getAuthHeaders());
  return response.data;
};

// 3. Update user profile
export const updateUserProfile = async (profileData) => {
  const response = await axios.patch(`${BASE_URL}/`, profileData, getAuthHeaders());
  return response.data;
};
