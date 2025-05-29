import axios from "axios";

const BASE_URL = "https://trackeats.onrender.com/api/auth";

// Login API
export const loginUser = (loginData) => {
  return axios.post(`${BASE_URL}/login/`, loginData, {
    headers: { "Content-Type": "application/json" },
  });
};

// Register API
export const registerUser = (userData) => {
  return axios.post(`${BASE_URL}/register/`, userData, {
    headers: { "Content-Type": "application/json" },
  });
};

// Refresh Token API
export const refreshToken = (refreshToken) => {
  return axios.post(`${BASE_URL}/token/refresh/`, { refreshToken }, {
    headers: { "Content-Type": "application/json" },
  });
};
