import axios from "axios";

const BASE_URL = "https://trackeats.onrender.com/api/lab-reports";

// ✅ Auth Headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

// ✅ 1. Create lab report
export const createDiabeticProfile = async (formData) => {
  const response = await axios.post(`${BASE_URL}/`, formData, getAuthHeaders());
  return response.data;
};

// ✅ 2. Get all lab reports
export const getDiabeticProfile = async () => {
  const response = await axios.get(`${BASE_URL}/`, getAuthHeaders());
  return response.data;
};

// ✅ 3. Update lab report
export const updateDiabeticProfile = async (formData) => {
  if (!formData.id) {
    throw new Error("Diabetic profile ID is required for update.");
  }
  const response = await axios.patch(`${BASE_URL}/${formData.id}/`, formData, getAuthHeaders());
  return response.data;
};

// ✅ 4. Get lab report by exact date
export const getLabReportByDate = async (date) => {
  return axios.get(
    `${BASE_URL}/?report_date=${date}`,
    getAuthHeaders()
  );
};




// ✅ 5. Get lab reports by month prefix (e.g., "2025-07")
export const getLabReportsByMonth = async (monthPrefix) => {
  const response = await axios.get(`${BASE_URL}/?search=${monthPrefix}`, getAuthHeaders());
  return response.data;
};

// ✅ 6. Get latest lab reports (ordered)
export const getLatestLabReports = async () => {
  const response = await axios.get(`${BASE_URL}/?ordering=-report_date`, getAuthHeaders());
  return response.data;
};

// ✅ 7. Get lab reports in a date range
export const getLabReportsInRange = async (startDate, endDate) => {
  const response = await axios.get(
    `${BASE_URL}/?report_date__gte=${startDate}&report_date__lte=${endDate}`,
    getAuthHeaders()
  );
  return response.data;
};

