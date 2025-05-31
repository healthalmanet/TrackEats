import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const getDiabeticReport = async (token) => {
  const response = await axios.get(`${API_BASE_URL}/diabetic/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
