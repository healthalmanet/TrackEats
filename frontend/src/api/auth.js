import axios from "axios";

const BASE_URL = "https://trackeats.onrender.com/api";

// ✅ Login API - Calls real backend only
export const loginUser = (loginData) => {
  return axios.post(`${BASE_URL}/login/`, loginData, {
    headers: { "Content-Type": "application/json" },
  });
};

// ✅ Register API - Calls real backend
export const registerUser = (userData) => {
  return axios.post(`${BASE_URL}/signup/`, userData, {
    headers: { "Content-Type": "application/json" },
  });
};

// ✅ Refresh Token API
export const refreshToken = (refreshToken) => {
  return axios.post(
    `${BASE_URL}/token/refresh/`,
    { refresh: refreshToken }, // Django usually expects this key to be `refresh`
    {
      headers: { "Content-Type": "application/json" },
    }
  );
};

export const forgotPassword = (email) => {
  return axios.post(
    `${BASE_URL}/forgot-password/`,
    { email }, // Sends the email in body
    {
      headers: { "Content-Type": "application/json" },
    }
  );
};

export const resetPassword = ({ uidb, token, password }) => {
  return axios.post(
    `${BASE_URL}/reset-password/${uidb}/${token}/`,
    { password },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};