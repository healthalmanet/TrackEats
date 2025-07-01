import React, { useEffect, useState } from "react";
import {
  getAssignedPatients,
  getPatientProfile,
  getPatientMeals,
} from "../../../api/nutritionistApi";

const Dashboard = () => {
  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPatientProfile, setSelectedPatientProfile] = useState(null);

  const [meals, setMeals] = useState([]);
  const [showMealsModal, setShowMealsModal] = useState(false);

  useEffect(() => {
    const fetchAssignedPatients = async () => {
      try {
        const response = await getAssignedPatients();
        const data = response?.data;

        if (Array.isArray(data)) {
          setPatients(data);
        } else {
          console.error("Unexpected response format:", data);
        }
      } catch (error) {
        console.error("Error fetching assigned patients:", error);
      }
    };

    fetchAssignedPatients();
  }, []);

  const handleViewProfile = async (patientId) => {
    try {
      const response = await getPatientProfile(patientId);
      setSelectedPatientProfile(response?.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching patient profile:", error);
    }
  };

  const handleViewMeals = async (patientId) => {
    try {
      const response = await getPatientMeals(patientId);
      const mealsData = response?.data?.results;

      if (Array.isArray(mealsData)) {
        setMeals(mealsData);
      } else {
        setMeals([]);
      }

      setShowMealsModal(true);
    } catch (error) {
      console.error("Error fetching patient meals:", error);
      setMeals([]);
      setShowMealsModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPatientProfile(null);
  };

  const closeMealsModal = () => {
    setShowMealsModal(false);
    setMeals([]);
  };

  return (
    <div className="pl-20 pt-23 relative min-h-screen">
      <div>
        <h2 className=" mt-8 text-3xl font-bold text-gray-800 mb-1">Dashboard Overview</h2>
        <p className="text-sm text-gray-500 mb-9">
          Manage your patients and track their nutrition journey
        </p>
      </div>

      {patients.length === 0 ? (
        <p className="text-gray-500">No assigned patients found.</p>
      ) : (
        <div className="space-y-4">
          {patients.map((patient) => (
            <div
              key={patient.id}
              className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg">
                  {patient.full_name?.[0] || "U"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {patient.full_name}
                  </p>
                  <p className="text-sm font-semibold text-gray-600">{patient.email}</p>
                  <p className="text-xs text-gray-400">
                    ID: #{patient.id?.toString().padStart(5, "0")} 
                    
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleViewMeals(patient.id)}
                  className="text-xs px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition font-medium"
                >
                  🍽 View Meals
                </button>
                <button
                  onClick={() => handleViewProfile(patient.id)}
                  className="text-xs px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition font-medium"
                >
                  👤 Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Profile Modal */}
      {showModal && selectedPatientProfile && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/10 flex items-center justify-center z-50">

          <div className="bg-white rounded-xl pt-10 px-6 pb-6 w-[90%] max-w-lg shadow-lg relative">

            <button
              onClick={closeModal}
              className="absolute top-3 right-4 text-gray-500 hover:text-gray-700 text-xl z-10"
            >
              ✕
            </button>

            <div className="sticky top-0 bg-white pb-2 z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xl font-bold shadow">
                  👤
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Patient Profile
                </h3>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[70vh] pr-1 space-y-4">
              {selectedPatientProfile.user_profile && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Basic Info</h4>
                  <div className="space-y-1 font-semibold text-sm text-gray-600">
                    <p>Age: {selectedPatientProfile.user_profile.age}</p>
                    <p>Height: {selectedPatientProfile.user_profile.height} cm</p>
                    <p>Weight: {selectedPatientProfile.user_profile.weight} kg</p>
                    <p>Activity Level: {selectedPatientProfile.user_profile.activity_level}</p>
                    <p>Health Conditions: {selectedPatientProfile.user_profile.health_conditions?.join(", ") || "None"}</p>
                  </div>
                </div>
              )}

              {selectedPatientProfile.diabetic_profiles?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Diabetic Profiles</h4>
                  {selectedPatientProfile.diabetic_profiles.map((profile, index) => (
                    <div key={index} className="bg-purple-50 p-3 rounded-lg mb-2 border border-purple-100">
                      <p className="text-sm text-gray-600">HbA1c: {profile.hba1c}</p>
                      <p className="text-sm text-gray-600">Fasting Blood Sugar: {profile.fasting_blood_sugar}</p>
                      <p className="text-sm text-gray-600">Diabetes Type: {profile.diabetes_type}</p>
                      <p className="text-sm text-gray-600">Total Cholesterol: {profile.total_cholesterol}</p>
                      <p className="text-sm text-gray-600">Medications: {profile.medications}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Meals Modal */}
      {showMealsModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[6px] flex items-center justify-center z-50">

          <div className="bg-white rounded-xl pt-10 px-6 pb-6 w-[90%] max-w-lg shadow-lg relative">
            <button
              onClick={closeMealsModal}
              className="absolute top-3 right-4 text-gray-500 hover:text-gray-700 text-xl z-10"
            >
              ✕
            </button>

            <div className="sticky top-0 bg-white pb-2 z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold shadow">
                  🍽
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Meal Logs</h3>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[70vh] pr-1 space-y-3">
              {meals.length === 0 ? (
                <p className="text-sm text-gray-500">No meals found for this user.</p>
              ) : (
                meals.map((meal, index) => {
                  const colors = [
                    "bg-green-50 border-green-100",
                    "bg-yellow-50 border-yellow-100",
                    "bg-blue-50 border-blue-100",
                    "bg-pink-50 border-pink-100",
                    "bg-indigo-50 border-indigo-100",
                  ];
                  const color = colors[index % colors.length];

                  return (
                    <div key={index} className={`p-3 font-semibold rounded-md border ${color} text-sm text-gray-700`}>
                      <p>Type: {meal.meal_type}</p>
                      <p>Food: {meal.food}</p>
                      <p>Calories: {meal.calories} kcal</p>
                      <p>Date: {meal.date}</p>
                      <p>Time: {meal.time}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
