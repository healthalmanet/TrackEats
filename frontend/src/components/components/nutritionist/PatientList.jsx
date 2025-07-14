// Entire import and setup block remains unchanged
import React, { useEffect, useState } from "react";
import {
  getAllUsers,
  assignPatient,
  searchUsersByName,
  createUserPatient,
} from "../../../api/nutritionistApi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const initialFormState = {
  email: "",
  full_name: "",
  password: "",
  gender: "male",
  date_of_birth: "",
  mobile_number: "",
  country: "India",
  occupation: "",
  height_cm: "",
  weight_kg: "",
  activity_level: "moderately_active",
  goal: "lose_weight",
  diet_type: "vegetarian",
  is_diabetic: false,
  is_hypertensive: false,
  has_gastric_issues: false,
  allergies: "",
  family_history: "",
  lab_report: {
    report_date: "",
    weight_kg: "",
    height_cm: "",
    waist_circumference_cm: "",
    blood_pressure_systolic: "",
    blood_pressure_diastolic: "",
    fasting_blood_sugar: "",
    postprandial_blood_sugar: "",
    hba1c: "",
    total_cholesterol: "",
    ldl_cholesterol: "",
    hdl_cholesterol: "",
    triglycerides: "",
    esr: "",
    creatinine: "",
    uric_acid: "",
    urea: "",
    alt: "",
    ast: "",
    vitamin_d3: "",
    vitamin_b12: "",
    tsh: "",
    crp: ""
  }
};

// static dropdown options
const genderOptions = ["male", "female", "other"];
const countryOptions = ["India", "United States", "United Kingdom", "Canada", "Australia", "Germany"];
const activityLevels = [
  { value: "sedentary", label: "Sedentary (little or no exercise)" },
  { value: "lightly_active", label: "Lightly Active (1-3 days/week)" },
  { value: "moderately_active", label: "Moderately Active (3-5 days/week)" },
  { value: "very_active", label: "Very Active (6-7 days/week)" },
  { value: "extra_active", label: "Extra Active (very hard physical work)" },
];
const goalOptions = [
  { value: "lose_weight", label: "Lose Weight" },
  { value: "maintain", label: "Maintain Weight" },
  { value: "gain_weight", label: "Gain Weight" },
];
const dietOptions = [
  "vegetarian", "non_vegetarian", "vegan", "eggetarian", "keto", "other"
];

const PatientList = () => {
  const [users, setUsers] = useState([]);
  const [assigning, setAssigning] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState(initialFormState);

  const getAssignedIds = () => {
    try {
      const ids = JSON.parse(localStorage.getItem("assignedPatients")) || [];
      return Array.isArray(ids) ? ids : [];
    } catch {
      return [];
    }
  };

  const addAssignedId = (id) => {
    const current = getAssignedIds();
    const updated = [...new Set([...current, id])];
    localStorage.setItem("assignedPatients", JSON.stringify(updated));
  };

  const filterAssignedLocally = (userList) => {
    const assignedIds = getAssignedIds();
    return userList.filter((user) => !assignedIds.includes(user.id));
  };

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();
      const data = response?.data;
      if (Array.isArray(data?.results)) {
        const filtered = filterAssignedLocally(data.results);
        setUsers(filtered);
      } else {
        console.error("Unexpected response format:", data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim() === "") {
      fetchUsers();
      return;
    }
    try {
      const response = await searchUsersByName(value);
      const data = response?.data;
      if (Array.isArray(data?.results)) {
        const filtered = filterAssignedLocally(data.results);
        setUsers(filtered);
      } else {
        console.error("Unexpected search response:", data);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const handleAssign = async (patientId) => {
    const user = users.find((u) => u.id === patientId);
    if (!user) return;

    setAssigning(patientId);
    try {
      await assignPatient(patientId);
      addAssignedId(patientId);
      toast.success("Patient assigned successfully!");
      setUsers((prev) => prev.filter((u) => u.id !== patientId));
    } catch (error) {
      console.error("Failed to assign patient:", error);
      toast.error("Failed to assign patient.");
    } finally {
      setAssigning(null);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("lab_report.")) {
      const key = name.replace("lab_report.", "");
      setFormData((prev) => ({
        ...prev,
        lab_report: {
          ...prev.lab_report,
          [key]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleCreatePatient = async (e) => {
  e.preventDefault();
  try {
    const response = await createUserPatient(formData);
    console.log("Create Patient Response:", response);

    const newPatientId = response?.data?.id;

    if (!newPatientId) {
      console.warn("Patient created but no ID returned:", response?.data);
      throw new Error("Patient created but no ID returned.");
    }

    await assignPatient(newPatientId);
    addAssignedId(newPatientId);

    toast.success("Patient created and assigned successfully!");
    setShowAddModal(false);
    setFormData(initialFormState);
    fetchUsers();
  } catch (error) {
  console.error("Error creating or assigning patient:", error.response?.data || error.message);
  toast.error(`Error: ${error.response?.data?.detail || "Creating or assigning patient failed."}`);
}

};


  return (
    <div className="pt-23 pl-30 min-h-screen">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-1">Patient List</h2>
          <p className="text-sm text-gray-500">Search and assign patients to yourself.</p>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="🔍 Search by name"
            className="px-4 py-2 border rounded-full text-sm w-64"
          />
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 text-sm"
          >
            ➕ Add Patient
          </button>
        </div>
      </div>

      {/* User Cards */}
      {users.length === 0 ? (
        <p className="text-gray-500 text-center">No users found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-white border rounded-xl p-5 shadow hover:shadow-md transition"
            >
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-gray-800">{user.full_name}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
                <p className="text-xs text-gray-400">Joined: {new Date(user.date_joined).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => handleAssign(user.id)}
                disabled={assigning === user.id}
                className={`w-full py-2 text-sm rounded-lg ${
                  assigning === user.id
                    ? "bg-gray-300 text-gray-600"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}
              >
                {assigning === user.id ? "Assigning..." : "Assign as Patient"}
              </button>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-3 right-4 text-gray-600 hover:text-gray-900 text-xl"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold mb-4 text-center text-gray-800">Add New Patient</h3>
            <form onSubmit={handleCreatePatient} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-full text-lg font-semibold text-gray-700 pt-2">Personal Information</div>
              {Object.entries(initialFormState)
                .filter(([key]) => key !== "lab_report")
                .map(([key, value]) => (
                  <div key={key} className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 capitalize">
                      {key.replace(/_/g, " ")}
                    </label>
                    {typeof value === "boolean" ? (
                      <input type="checkbox" name={key} checked={formData[key]} onChange={handleFormChange} />
                    ) : key === "gender" ? (
                      <select name={key} value={formData[key]} onChange={handleFormChange} className="mt-1 px-3 py-2 border rounded-lg text-sm">
                        {genderOptions.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
                      </select>
                    ) : key === "country" ? (
                      <select name={key} value={formData[key]} onChange={handleFormChange} className="mt-1 px-3 py-2 border rounded-lg text-sm">
                        {countryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : key === "activity_level" ? (
                      <select name={key} value={formData[key]} onChange={handleFormChange} className="mt-1 px-3 py-2 border rounded-lg text-sm">
                        {activityLevels.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    ) : key === "goal" ? (
                      <select name={key} value={formData[key]} onChange={handleFormChange} className="mt-1 px-3 py-2 border rounded-lg text-sm">
                        {goalOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    ) : key === "diet_type" ? (
                      <select name={key} value={formData[key]} onChange={handleFormChange} className="mt-1 px-3 py-2 border rounded-lg text-sm">
                        {dietOptions.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1).replace('_', ' ')}</option>)}
                      </select>
                    ) : (
                      <input
                        type={key === "date_of_birth" ? "date" : "text"}
                        name={key}
                        value={formData[key]}
                        onChange={handleFormChange}
                        className="mt-1 px-3 py-2 border rounded-lg text-sm"
                      />
                    )}
                  </div>
                ))}
              <div className="col-span-full text-lg font-semibold text-gray-700 pt-4">Lab Report Details</div>
              {Object.entries(initialFormState.lab_report).map(([key]) => (
                <div key={key} className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 capitalize">{key.replace(/_/g, " ")}</label>
                  <input
                    type={key === "report_date" ? "date" : "text"}
                    name={`lab_report.${key}`}
                    value={formData.lab_report[key]}
                    onChange={handleFormChange}
                    className="mt-1 px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              ))}
              <button type="submit" className="col-span-full mt-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
                Create Patient
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientList;
