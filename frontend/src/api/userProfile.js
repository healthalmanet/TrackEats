import axios from "axios";

// Set your backend base URL here
const BASE_URL = "http://trackeats.onrender.com/api/profile"; // change if different

// 1. Create user profile
export const createUserProfile = async (profileData) => {
  const response = await axios.post(`${BASE_URL}`, profileData);
  return response.data;
};

// 2. Get user profile
export const getUserProfile = async () => {
  const response = await axios.get(`${BASE_URL}`);
  return response.data;
};

// 3. Update user profile (partial update)
export const updateUserProfile = async (profileData) => {
  const response = await axios.patch(`${BASE_URL}`, profileData);
  return response.data;
};
