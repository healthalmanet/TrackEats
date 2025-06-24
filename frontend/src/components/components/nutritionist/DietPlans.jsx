import React, { useEffect, useState } from "react";
import {
  getAssignedPatients,
  getDietRecommendationUsers,
  reviewDietPlan,
  editDiet,
} from "../../../api/nutritionistApi";

const DietPlans = () => {
  const [patients, setPatients] = useState([]);
  const [dietPlans, setDietPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState("");
  const [comment, setComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedMeals, setEditedMeals] = useState({});

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await getAssignedPatients();
        const data = response?.data;
        if (Array.isArray(data)) {
          setPatients(data);
        } else if (Array.isArray(data?.results)) {
          setPatients(data.results);
        }
      } catch (error) {
        console.error("Error fetching assigned patients:", error);
      }
    };

    const fetchDietPlans = async () => {
      try {
        const response = await getDietRecommendationUsers();
        const data = response?.data;
        if (Array.isArray(data?.results)) {
          setDietPlans(data.results);
        }
      } catch (error) {
        console.error("Error fetching diet recommendations:", error);
      }
    };

    fetchPatients();
    fetchDietPlans();
  }, []);

  const getPatientInfo = (id) => {
    const user = patients.find((p) => p.id === id || p.user_id === id);
    return user ? `${user.id} (${user.email})` : "Unknown Patient";
  };

  const handleViewPlan = (plan) => {
    setSelectedPlan(plan);
    setEditedMeals(plan.meals || {});
    setShowModal(true);
    setAction("");
    setComment("");
    setIsEditing(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPlan(null);
  };

  const handleSubmitReview = async () => {
    if (!action || !comment.trim()) {
      alert("Please select an action and enter a comment before submitting.");
      return;
    }

    const validActions = ["approve", "reject"];
    if (!validActions.includes(action)) {
      alert("Invalid action selected.");
      return;
    }

    try {
      await reviewDietPlan(selectedPlan.id, action, comment.trim());
      alert("Review submitted successfully!");
      setAction("");
      setComment("");
      setSelectedPlan(null);
      setShowModal(false);
    } catch (error) {
      console.error("Failed to submit review:", error);
      alert("Failed to submit review. Please try again.");
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    alert("You can now start editing the meal plan.");
  };

  const handleMealChange = (date, mealType, value) => {
    setEditedMeals((prev) => ({
      ...prev,
      [date]: {
        ...prev[date],
        meals: {
          ...prev[date].meals,
          [mealType]: value,
        },
      },
    }));
  };

  const handleSaveEdit = async () => {
    try {
      for (const date in editedMeals) {
        const updatedMeals = editedMeals[date].meals;
        await editDiet(selectedPlan.id, selectedPlan.id, date, updatedMeals);
      }
      alert("Diet plan updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update diet plan:", error);
      alert("Failed to update diet plan. Please try again.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Diet Plans</h2>

      {dietPlans.length === 0 ? (
        <p className="text-gray-500">No diet plans found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dietPlans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white shadow-md rounded-2xl p-4 border hover:shadow-lg transition duration-300"
            >
              <p className="text-lg font-medium text-gray-800">
                Patient: {getPatientInfo(plan.patient_id)}
              </p>
              <p className="text-sm text-gray-600">
                Week Starting: {plan.for_week_starting}
              </p>
              <button
                onClick={() => handleViewPlan(plan)}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-1 rounded-lg"
              >
                View Diet Plan
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-2xl shadow-lg relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Weekly Diet Plan</h3>

            {/* Nutritional Info */}
            <div className="mb-4">
              <p className="text-sm text-gray-700 font-medium">
                Calories: {selectedPlan.calories} kcal
              </p>
              <p className="text-sm text-gray-700 font-medium">
                Protein: {selectedPlan.protein} g
              </p>
              <p className="text-sm text-gray-700 font-medium">
                Carbs: {selectedPlan.carbs} g
              </p>
              <p className="text-sm text-gray-700 font-medium">
                Fats: {selectedPlan.fats} g
              </p>
            </div>

            {Object.entries(editedMeals || {}).map(([date, details]) => (
              <div key={date} className="mb-4">
                <h4 className="text-md font-semibold text-gray-700 mb-1">
                  {details.day} ({date})
                </h4>
                <div className="pl-4">
                  {['breakfast', 'lunch', 'dinner'].map((mealType) => (
                    <div key={mealType} className="mb-1">
                      <label className="text-sm text-gray-600">
                        {mealType.charAt(0).toUpperCase() + mealType.slice(1)}:
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="ml-2 border p-1 rounded text-sm"
                          value={details.meals[mealType] || ""}
                          onChange={(e) => handleMealChange(date, mealType, e.target.value)}
                        />
                      ) : (
                        <span className="ml-2 text-sm text-gray-600">
                          {details.meals[mealType]}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="mt-6">
              <h4 className="text-md font-semibold text-gray-700 mb-2">Review Diet Plan</h4>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="w-full mb-3 p-2 border rounded"
              >
                <option value="">Select Action</option>
                <option value="approve">Approve</option>
                <option value="reject">Reject</option>
              </select>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment (optional)"
                className="w-full p-2 border rounded mb-3"
                rows={3}
              ></textarea>
              <div className="flex gap-2">
                <button
                  onClick={handleSubmitReview}
                  className="bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 rounded"
                >
                  Submit Review
                </button>
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-4 py-2 rounded"
                  >
                    Edit
                  </button>
                ) : (
                  <button
                    onClick={handleSaveEdit}
                    className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded"
                  >
                    Save Changes
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DietPlans;
