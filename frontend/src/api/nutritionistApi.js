import axios from "axios";
import { getToken } from "../services/tokenService";

const axiosInstance = axios.create({
  baseURL: "https://trackeats.onrender.com/api/nutritionist",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Utility delay function
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// --------- Nutritionist API ---------

export const assignPatient = async (patientId) => {
  await delay(500);
  return axiosInstance.post('/assign-patient/', { patient_id: patientId });
};

export const getAssignedPatients = async () => {
  await delay(500);
  return axiosInstance.get('/patients/');
};

export const getPatientProfile = async (patientId) => {
  await delay(500);
  return axiosInstance.get(`/patient/${patientId}/profile/`);
};

export const getPatientMeals = async (patientId) => {
  await delay(500);
  return axiosInstance.get(`/patient/${patientId}/meals/`);
};

export const getAllUsers = async (page = 1, pageSize = 20) => {
  await delay(500);
  return axiosInstance.get(`/users/?page=${page}&page_size=${pageSize}`);
};

export const searchUsersByName = async (name) => {
  await delay(500);
  return axiosInstance.get(`/users/?search=${encodeURIComponent(name)}`);
};

export const editDiet = async (dietId, patientId, date, updatedMeals) => {
  await delay(500);
  return axiosInstance.patch(`/diet/${dietId}/edit/`, {
    patient_id: patientId,
    meals: {
      [date]: {
        meals: updatedMeals,
      },
    },
  });
};

export const reviewDietPlan = async (dietId, action, comment) => {
  await delay(500);
  return axiosInstance.post(`/diet/${dietId}/review/`, {
    action,
    comment,
  });
};

export const submitFeedbackForML = async (dietId, feedback, approved) => {
  await delay(500);
  return axiosInstance.post(`/diet/${dietId}/feedback/`, {
    feedback,
    approved,
  });
};

export const getDietByPatientId = async (patientId) => {
  await delay(500);
  return axiosInstance.get(`/diet/${patientId}`);
};

export const getDietRecommendationUsers = async (page = 1, pageSize = 10) => {
  await delay(500);
  return axiosInstance.get(`/diet/recommendations/?page=${page}&page_size=${pageSize}`);
};

export const createUserPatient = async (userData) => {
  await delay(500);
  const response = await axiosInstance.post('/create-patient/', userData);
  return response; // or `return response.data;` if you want to simplify usage
};

// --- Separate Axios for non-nutritionist base URL ---
const generalAxios = axios.create({
  baseURL: "https://trackeats.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach auth token to the generalAxios requests too
generalAxios.interceptors.request.use((config) => {
  const token = getToken(); // Reuse your tokenService method
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Generate Diet Plan (Different base URL) ---
export const generateDietPlan = async (patientId) => {
  await delay(500);
  return generalAxios.post(`/patients/${patientId}/generate-plan/`);
};





