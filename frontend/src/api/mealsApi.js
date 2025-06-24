import axios from "axios";

const BASE_URL = "https://trackeats.onrender.com/api/dally/-calorie-summary/";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token"); // ensure token is set on login
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

// 2. Get user profile
export const getUserProfile = async () => {
  const response = await axios.get(`${BASE_URL}`, getAuthHeaders());
  return response.data;
};