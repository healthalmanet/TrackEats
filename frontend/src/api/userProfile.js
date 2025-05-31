// src/api/userProfile.js
import axios from "axios";

const API_BASE_URL = " "; // Replace with your actual backend URL

export const submitUserProfile = async (profileData) => {
  const token = localStorage.getItem("jwtToken");

  const response = await axios.post(
    `${API_BASE_URL}/profile`,
    profileData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const getUserProfile = async () => {
  const token = localStorage.getItem("jwtToken");

  const response = await axios.get(`${API_BASE_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
