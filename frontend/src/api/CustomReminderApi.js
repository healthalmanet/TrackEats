
// ReminderApi.js
import axios from "axios";


const BASE_URL = 'https://trackeats.onrender.com/api';

// ✅ Shared Axios headers with timeout
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    timeout: 30000, // 15 seconds timeout for slow responses
  };
};

// ✅ Create Reminder
export const reminderCreate = async (formData) => {

const response = await axios.post(`${BASE_URL}/reminders/`, formData, getAuthHeaders());
  return response.data;
};

// ✅ Get All Reminders
export const getAllReminder = async () => {

  const response = await axios.get(
    `${BASE_URL}/reminders/`,
    getAuthHeaders()
  );
  return response.data;

};

export const deleteReminder = async (id) => {
  const response = await axios.delete(`${BASE_URL}/reminders/${id}/`, getAuthHeaders());
  return response.data;
};

