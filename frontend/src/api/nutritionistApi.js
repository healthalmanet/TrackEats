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

// --------- Nutritionist API ---------

// ✅ POST: Assign a patient to the nutritionist
export const assignPatient = (patientId) =>
  axiosInstance.post('/assign-patient/', { patient_id: patientId });

// ✅ GET: Get patients assigned to the logged-in nutritionist
export const getAssignedPatients = () =>
  axiosInstance.get('/patients/');

// ✅ GET: Get a specific patient's profile by ID
export const getPatientProfile = (patientId) =>
  axiosInstance.get(`/patient/${patientId}/profile/`);

// ✅ GET: Get meals logged by a specific patient
export const getPatientMeals = (patientId) =>
  axiosInstance.get(`/patient/${patientId}/meals/`);

// ✅ GET: Get paginated list of users
export const getAllUsers = (page = 1, pageSize = 20) =>
  axiosInstance.get(`/users/?page=${page}&page_size=${pageSize}`);

// ✅ GET: Search users by name
export const searchUsersByName = (name) =>
  axiosInstance.get(`/users/?search=${encodeURIComponent(name)}`);

// ✅ PATCH: Edit a patient's diet plan for a specific date
export const editDiet = (dietId, patientId, date, updatedMeals) =>
  axiosInstance.patch(`/diet/${dietId}/edit/`, {
    patient_id: patientId,
    meals: {
      [date]: {
        meals: updatedMeals,
      },
    },
  });

// ✅ POST: Approve or reject a diet plan
export const reviewDietPlan = (dietId, action, comment) =>
  axiosInstance.post(`/diet/${dietId}/review/`, {
    action,
    comment,
  });

// ✅ POST: Submit feedback for ML model retraining
export const submitFeedbackForML = (dietId, feedback, approved) =>
  axiosInstance.post(`/diet/${dietId}/feedback/`, {
    feedback,
    approved,
  });

// ✅ GET: View diet plan by patient ID
export const getDietByPatientId = (patientId) =>
  axiosInstance.get(`/diet/${patientId}`);

// ✅ GET: Get users for ML-based diet recommendation (paginated)
export const getDietRecommendationUsers = (page = 1, pageSize = 10) =>
  axiosInstance.get(`/diet/recommendations/?page=${page}&page_size=${pageSize}`);
