import axios from "axios";

const BASE_URL = "https://trackeats.onrender.com/api/lab-reports";

// ✅ Auth Headers with Timeout
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    // timeout: 60000, // ⏱️ 15 seconds timeout for slow responses
  };
};

// ✅ 1. Create diabetic profile
export const createDiabeticProfile = async (formData) => {
  const response = await axios.post(
    `${BASE_URL}/`,
    formData,
    getAuthHeaders()
  );
  return response.data;
};

// ✅ 2. Get diabetic profile
export const getDiabeticProfile = async () => {
  const response = await axios.get(`${BASE_URL}/`, getAuthHeaders());
  return response.data;
};

// ✅ 3. Update diabetic profile
export const updateDiabeticProfile = async (formData) => {
  if (!formData.id) {
    throw new Error("Diabetic profile ID is required for update.");
  }

  const response = await axios.patch(
    `${BASE_URL}/${formData.id}/`,
    formData,
    getAuthHeaders()
  );
  return response.data;
};
