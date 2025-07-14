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

        if (Array.isArray(data?.results)) {
          setPatients(data.results);
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

  const groupMealsByDateAndType = () => {
    const grouped = {};

    meals.forEach((meal) => {
      const date = meal.date;
      const mealType = meal.meal_type;

      if (!grouped[date]) {
        grouped[date] = {};
      }
      if (!grouped[date][mealType]) {
        grouped[date][mealType] = [];
      }

      grouped[date][mealType].push(meal);
    });

    return grouped;
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
          <div className="bg-white rounded-xl pt-10 px-6 pb-6 w-[90%] max-w-3xl shadow-lg relative">
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

            <div className="overflow-y-auto max-h-[70vh] pr-1 space-y-6">
              {selectedPatientProfile.profile && (
                <div>
                  <h4 className="font-semibold text-red-700 mb-3">Basic Info</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm font-medium text-gray-600">
                    <div>Date of Birth: <span className="font-semibold text-gray-800">{selectedPatientProfile.profile.date_of_birth}</span></div>
                    <div>Gender: <span className="font-semibold text-gray-800">{selectedPatientProfile.profile.gender}</span></div>
                    <div>Occupation: <span className="font-semibold text-gray-800">{selectedPatientProfile.profile.occupation}</span></div>
                    <div>Height: <span className="font-semibold text-gray-800">{selectedPatientProfile.profile.height_cm} cm</span></div>
                    <div>Weight: <span className="font-semibold text-gray-800">{selectedPatientProfile.profile.weight_kg} kg</span></div>
                    <div>BMI: <span className="font-semibold text-gray-800">{selectedPatientProfile.profile.bmi}</span></div>
                    <div>Activity Level: <span className="font-semibold text-gray-800">{selectedPatientProfile.profile.activity_level}</span></div>
                    <div>Goal: <span className="font-semibold text-gray-800">{selectedPatientProfile.profile.goal}</span></div>
                    <div>Diet Type: <span className="font-semibold text-gray-800">{selectedPatientProfile.profile.diet_type}</span></div>
                    <div>Allergies: <span className="font-semibold text-gray-800">{selectedPatientProfile.profile.allergies || "None"}</span></div>
                    <div>Chronic Conditions: 
                      <span className="font-semibold text-gray-800">
                        {[selectedPatientProfile.profile.is_diabetic && "Diabetes",
                          selectedPatientProfile.profile.is_hypertensive && "Hypertension",
                          selectedPatientProfile.profile.has_heart_condition && "Heart Issue",
                          selectedPatientProfile.profile.has_thyroid_disorder && "Thyroid",
                          selectedPatientProfile.profile.has_arthritis && "Arthritis",
                          selectedPatientProfile.profile.has_gastric_issues && "Gastric",
                          selectedPatientProfile.profile.other_chronic_condition,]
                          .filter(Boolean)
                          .join(", ") || "None"}
                      </span>
                    </div>
                    <div>Family History: <span className="font-semibold text-gray-800">{selectedPatientProfile.profile.family_history || "None"}</span></div>
                  </div>
                </div>
              )}

              {selectedPatientProfile.latest_lab_report && (
                <div>
                  <h4 className="font-semibold text-red-700 mb-3">Latest Lab Report</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm font-medium text-gray-600">
                    {Object.entries(selectedPatientProfile.latest_lab_report).map(([key, value]) => (
                      <div key={key}>
                        <span className="capitalize">{key.replace(/_/g, " ")}:</span>{" "}
                        <span className="font-semibold text-gray-800">{value || "N/A"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Meals Modal */}
      {showMealsModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[6px] flex items-center justify-center z-50">
          <div className="bg-white rounded-xl pt-10 px-6 pb-6 w-[90%] max-w-3xl shadow-lg relative">
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

            <div className="overflow-y-auto max-h-[70vh] pr-1 space-y-6 text-sm text-gray-700 font-medium">
              {Object.entries(groupMealsByDateAndType())
                .sort((a, b) => new Date(b[0]) - new Date(a[0])) // latest date first
                .map(([date, mealTypes]) => (
                  <div key={date}>
                    <h4 className="text-base font-semibold text-gray-800 mb-2 border-b pb-1">{new Date(date).toDateString()}</h4>
                    {Object.entries(mealTypes).map(([mealType, items]) => (
                      <div key={mealType} className="mb-4 ml-2">
                        <h5 className="text-sm font-bold text-blue-700 mb-1">{mealType}</h5>
                        <div className="space-y-2">
                          {items.map((meal, idx) => (
                            <div
                              key={idx}
                              className="bg-blue-50 border border-blue-100 rounded-md px-3 py-2"
                            >
                              <p>🍽 <strong>{meal.food_item_name}</strong></p>
                              <p>Calories: {meal.calories} kcal</p>
                              <p>Time: {new Date(meal.consumed_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
