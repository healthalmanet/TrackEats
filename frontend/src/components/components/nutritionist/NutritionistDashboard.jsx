// ...imports remain unchanged
import React, { useEffect, useState } from "react";
import {
  createUserPatient,
  getAllUsers,
  searchUsersByName,
  getPatientProfile,
} from "../../../api/nutritionistApi";
import { useNavigate } from "react-router-dom";

const NutritionistDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newPatient, setNewPatient] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 4;
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    try {
      const res = await getAllUsers();
      const users = res.data.results || res.data;

      const enhancedUsers = await Promise.all(
        users.map(async (user) => {
          try {
            const profileRes = await getPatientProfile(user.id);
            const profile = profileRes.data.profile || {};
            return {
              ...user,
              goal: profile.goal || "",
              date_of_birth: profile.date_of_birth || "",
              updated_at: profile.updated_at || user.updated_at,
              created_at: user.created_at,
            };
          } catch (error) {
            console.error("Failed to get profile for user:", user.id);
            return user;
          }
        })
      );

      setPatients(enhancedUsers);
    } catch (err) {
      console.error("Error loading users", err);
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) {
      fetchAllUsers();
      return;
    }

    try {
      const res = await searchUsersByName(search);
      const searchResults = res.data.results || res.data;

      const enhancedSearch = await Promise.all(
        searchResults.map(async (user) => {
          try {
            const profileRes = await getPatientProfile(user.id);
            const profile = profileRes.data.profile || {};
            return {
              ...user,
              goal: profile.goal || "",
              date_of_birth: profile.date_of_birth || "",
              updated_at: profile.updated_at || user.updated_at,
              created_at: user.created_at,
            };
          } catch {
            return user;
          }
        })
      );

      setPatients(enhancedSearch);
    } catch (err) {
      console.error("Search failed", err);
    }
  };

  const handleCreatePatient = async () => {
    try {
      await createUserPatient(newPatient);
      alert("Patient added successfully!");
      setShowForm(false);
      fetchAllUsers();
    } catch (err) {
      console.error("Failed to create patient", err);
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return "-";
    const birthDate = new Date(dob);
    const diff = Date.now() - birthDate.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  return (
    <div className="min-h-screen bg-[#FAF3EB] font-roboto">
      <nav className="flex justify-between items-center px-6 py-4 bg-white shadow-md">
        <h1 className="text-2xl font-poppins font-bold text-[#263238]">TrackEats</h1>
        <button
  onClick={() => {
  localStorage.removeItem("token");
  window.location.href = "/"; // Force a full page reload
}}

  className="bg-[#FF7043] text-white px-4 py-2 rounded-full hover:bg-[#F4511E]"
>
  Logout
</button>

      </nav>

      <div className="flex flex-wrap justify-center items-center gap-4 px-6 py-8">
        <input
          type="text"
          placeholder="Search patients by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-[300px] px-4 py-2 border rounded shadow-sm"
        />
        <button
          onClick={handleSearch}
          className="bg-[#FF7043] text-white px-4 py-2 rounded-full hover:bg-[#F4511E]"
        >
          Search
        </button>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700"
        >
          + Add Patient
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-10 flex items-center justify-center">
          <div className="bg-white p-6 rounded-md w-[90%] max-w-[600px] max-h-[90vh] overflow-y-auto relative">
            <h2 className="text-xl font-bold mb-4">Add New Patient</h2>
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-6 text-gray-600 font-bold"
            >
              ✕
            </button>

            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-2">Basic Info</h3>

              {["email", "full_name", "password", "mobile_number", "occupation", "height_cm", "weight_kg", "allergies", "family_history"].map((key) => (
                <input
                  key={key}
                  placeholder={key.replace(/_/g, " ").toUpperCase()}
                  onChange={(e) => setNewPatient({ ...newPatient, [key]: e.target.value })}
                  className="mb-2 p-2 border w-full rounded"
                />
              ))}

              {/* Date of Birth */}
              <label className="block text-sm font-medium">Date of Birth</label>
              <input
                type="date"
                onChange={(e) => setNewPatient({ ...newPatient, date_of_birth: e.target.value })}
                className="mb-2 p-2 border w-full rounded"
              />

              {/* Country Dropdown */}
              <label className="block text-sm font-medium">Country</label>
              <select
                onChange={(e) => setNewPatient({ ...newPatient, country: e.target.value })}
                className="mb-2 p-2 border w-full rounded"
                defaultValue=""
              >
                <option value="" disabled>Select country</option>
                <option value="India">India</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
              </select>

              {/* Gender Dropdown */}
              <label className="block text-sm font-medium">Gender</label>
              <select
                onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                className="mb-2 p-2 border w-full rounded"
                defaultValue=""
              >
                <option value="" disabled>Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>

              {/* Activity Level Dropdown */}
              <label className="block text-sm font-medium">Activity Level</label>
              <select
                onChange={(e) => setNewPatient({ ...newPatient, activity_level: e.target.value })}
                className="mb-2 p-2 border w-full rounded"
                defaultValue=""
              >
                <option value="" disabled>Select activity level</option>
                <option value="sedentary">Sedentary</option>
                <option value="lightly_active">Lightly Active</option>
                <option value="moderately_active">Moderately Active</option>
                <option value="very_active">Very Active</option>
                <option value="extra_active">Extra Active</option>
              </select>

              {/* Goal Dropdown */}
              <label className="block text-sm font-medium">Goal</label>
              <select
                onChange={(e) => setNewPatient({ ...newPatient, goal: e.target.value })}
                className="mb-2 p-2 border w-full rounded"
                defaultValue=""
              >
                <option value="" disabled>Select goal</option>
                <option value="lose_weight">Lose Weight</option>
                <option value="maintain">Maintain Weight</option>
                <option value="gain_weight">Gain Weight</option>
              </select>

              {/* Diet Type Dropdown */}
              <label className="block text-sm font-medium">Diet Type</label>
              <select
                onChange={(e) => setNewPatient({ ...newPatient, diet_type: e.target.value })}
                className="mb-2 p-2 border w-full rounded"
                defaultValue=""
              >
                <option value="" disabled>Select diet type</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="non_vegetarian">Non-Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="eggetarian">Eggetarian</option>
                <option value="keto">Keto</option>
                <option value="other">Other</option>
              </select>

              {/* Checkboxes */}
              {[{ key: "is_diabetic", label: "Is Diabetic" },
                { key: "is_hypertensive", label: "Is Hypertensive" },
                { key: "has_gastric_issues", label: "Has Gastric Issues" }].map(({ key, label }) => (
                <label key={key} className="block mb-2">
                  <input
                    type="checkbox"
                    onChange={(e) => setNewPatient({ ...newPatient, [key]: e.target.checked })}
                    className="mr-2"
                  />
                  {label}
                </label>
              ))}
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Lab Report</h3>

              {/* Report Date Input (DATE) */}
              <label className="block text-sm font-medium">Report Date</label>
              <input
                type="date"
                onChange={(e) =>
                  setNewPatient({
                    ...newPatient,
                    lab_report: {
                      ...(newPatient.lab_report || {}),
                      report_date: e.target.value,
                    },
                  })
                }
                className="mb-2 p-2 border w-full rounded"
              />

              {/* Remaining Lab Fields */}
              {[
                "weight_kg", "waist_circumference_cm", "blood_pressure_systolic",
                "blood_pressure_diastolic", "fasting_blood_sugar", "postprandial", "hba1c", "ldl_cholesterol",
                "hdl_cholesterol", "triglycerides", "tc", "esr", "creatinine", "urea", "alt", "ast",
                "vitamin_d3", "vitamin_b12", "tsh"
              ].map((key) => (
                <input
                  key={key}
                  placeholder={key.replace(/_/g, " ").toUpperCase()}
                  onChange={(e) =>
                    setNewPatient({
                      ...newPatient,
                      lab_report: {
                        ...(newPatient.lab_report || {}),
                        [key]: e.target.value,
                      },
                    })
                  }
                  className="mb-2 p-2 border w-full rounded"
                />
              ))}
            </div>

            <button
              onClick={handleCreatePatient}
              className="mt-4 bg-[#FF7043] text-white px-4 py-2 rounded-full hover:bg-[#F4511E]"
            >
              Create Patient
            </button>
          </div>
        </div>
      )}

      {/* ...Patient Grid and Pagination remain unchanged */}
      {/* ... */}
      <div className="px-6 pb-16">
        <h2 className="text-xl font-poppins font-bold mb-6">
          Assigned Patients ({patients.length})
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {patients
            .slice((currentPage - 1) * perPage, currentPage * perPage)
            .map((patient) => (
              <div
                key={patient.id}
                onClick={() => navigate(`/nutritionist/patient/${patient.id}`)}

                className="bg-white p-4 rounded-xl shadow-md hover:shadow-xl transition cursor-pointer"
              >
                <div className="text-lg font-semibold text-[#263238]">{patient.full_name}</div>
                <div className="text-sm text-gray-700">
                  Age: {calculateAge(patient.date_of_birth)}<br />
                  Goal: {patient.goal || "—"}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Last updated: {new Date(patient.updated_at || patient.created_at).toLocaleString()}
                </div>
              </div>
            ))}
        </div>

        {patients.length > perPage && (
          <div className="flex justify-center items-center mt-10 gap-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="text-sm">Page {currentPage}</span>
            <button
              onClick={() =>
                setCurrentPage((p) =>
                  p * perPage < patients.length ? p + 1 : p
                )
              }
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              disabled={currentPage * perPage >= patients.length}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
    
  );
};

export default NutritionistDashboard;
