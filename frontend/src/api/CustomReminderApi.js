// ReminderApi.js (Already correct)
import axios from "axios";

const BASE_URL = "https://trackeats.onrender.com/api/reminders";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

export const reminderCreate = async (formData) => {
  const response = await axios.post(`${BASE_URL}/reminderCreate/`, formData, getAuthHeaders());
  return response.data;
};

export const getAllReminder = async () => {
  const response = await axios.get(`${BASE_URL}/getAllReminders/`, getAuthHeaders());
  return response.data;
};
