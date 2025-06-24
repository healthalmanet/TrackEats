import axios from "axios";

const BASE_URL = "https://trackeats.onrender.com/api/recommend-calories/";


const fetchData = () => {
  const token = localStorage.getItem("token"); // ensure token is set on login
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};


// 2. Get user profile
export const f = async () => {
  const response = await axios.get(`${BASE_URL}`, getAuthHeaders());
  return response.data;
};