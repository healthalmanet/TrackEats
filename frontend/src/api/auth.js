import axios from "axios";
import axiosRetry from "axios-retry";

const BASE_URL = "https://trackeats.onrender.com/api";

// ✅ Axios retry setup (recommended for Render-based APIs)
axiosRetry(axios, {
  retries: 3, // Retry failed requests 3 times
  retryDelay: axiosRetry.exponentialDelay, // Exponential backoff
});

// ✅ Common headers with timeout
const defaultConfig = {
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15 seconds timeout
};

// ✅ Login API
export const loginUser = (loginData) => {
  return axios.post(`${BASE_URL}/login/`, loginData, defaultConfig);
};

// ✅ Register API
export const registerUser = (userData) => {
  return axios.post(`${BASE_URL}/signup/`, userData, defaultConfig);
};

// ✅ Refresh Token API
export const refreshToken = (refreshToken) => {
  return axios.post(
    `${BASE_URL}/token/refresh/`,
    { refresh: refreshToken },
    defaultConfig
  );
};

// ✅ Forgot Password API
export const forgotPassword = (email) => {
  return axios.post(
    `${BASE_URL}/forgot-password/`,
    { email },
    defaultConfig
  );
};

// ✅ Reset Password API
export const resetPassword = ({ uidb64, token, password }) => {
  return axios.post(
    `${BASE_URL}/reset-password/`,
    {
      uidb64,
      token,
      new_password: password,
    },
    defaultConfig
  );
};
