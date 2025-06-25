// ReminderApi.js
import axios from "axios";

const BASE_URL = "https://trackeats.onrender.com/api/reminders";

// ✅ Shared Axios headers with timeout
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    timeout: 15000, // 15 seconds timeout for slow responses
  };
};

// ✅ Create Reminder
export const reminderCreate = async (formData) => {
  const response = await axios.post(
    `${BASE_URL}/reminderCreate/`,
    formData,
    getAuthHeaders()
  );
  return response.data;
};

// ✅ Get All Reminders
export const getAllReminder = async () => {
  const response = await axios.get(
    `${BASE_URL}/getAllReminders/`,
    getAuthHeaders()
  );
  return response.data;
};
