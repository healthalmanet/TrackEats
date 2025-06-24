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
    <div className="p-6 relative">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Assigned Patients
      </h2>

      {patients.length === 0 ? (
        <p className="text-gray-500">No assigned patients found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((patient) => (
            <div
              key={patient.id}
              className="bg-white shadow-md rounded-2xl p-4 border hover:shadow-lg transition duration-300"
            >
              <p className="text-lg font-medium text-gray-800">{patient.full_name}</p>
              <p className="text-sm text-gray-600">{patient.email}</p>
              <p className="text-xs text-gray-500 mt-1">
              </p>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleViewProfile(patient.id)}
                  className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-1 rounded-lg transition"
                >
                  View Profile
                </button>
                <button
                  onClick={() => handleViewMeals(patient.id)}
                  className="bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-1 rounded-lg transition"
                >
                  View Meals
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Profile Modal */}
      {showModal && selectedPatientProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-lg shadow-lg relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            {selectedPatientProfile.user_profile && (
              <div className="mt-4">
                <h4 className="font-semibold text-gray-700 mb-2">Basic Info</h4>
                <p className="text-sm text-gray-600">Age: {selectedPatientProfile.user_profile.age}</p>
                <p className="text-sm text-gray-600">Height: {selectedPatientProfile.user_profile.height} cm</p>
                <p className="text-sm text-gray-600">Weight: {selectedPatientProfile.user_profile.weight} kg</p>
                <p className="text-sm text-gray-600">Activity Level: {selectedPatientProfile.user_profile.activity_level}</p>
                <p className="text-sm text-gray-600">
                  Health Conditions: {selectedPatientProfile.user_profile.health_conditions?.join(", ") || "None"}
                </p>
              </div>
            )}

            {selectedPatientProfile.diabetic_profiles?.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-gray-700 mb-2">Diabetic Profiles</h4>
                {selectedPatientProfile.diabetic_profiles.map((profile, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-md mb-2 border">
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
      )}

      {/* Meals Modal */}
      {showMealsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-lg shadow-lg relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={closeMealsModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Meal Logs</h3>
            {meals.length === 0 ? (
              <p className="text-sm text-gray-500">No meals found for this user.</p>
            ) : (
              meals.map((meal, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-md mb-2 border">
                  <p className="text-sm text-gray-600">Type: {meal.meal_type}</p>
                  <p className="text-sm text-gray-600">Food: {meal.food}</p>
                  <p className="text-sm text-gray-600">Calories: {meal.calories} kcal</p>
                  <p className="text-sm text-gray-600">Date: {meal.date}</p>
                  <p className="text-sm text-gray-600">Time: {meal.time}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
