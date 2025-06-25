import React, { useEffect, useState } from "react";
import {
  getAssignedPatients,
  getDietRecommendationUsers,
  reviewDietPlan,
  editDiet,
} from "../../../api/nutritionistApi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
      toast.warn("Please enter a comment before submitting.");
      return;
    }

    try {
      await reviewDietPlan(selectedPlan.id, action, comment.trim());
      toast.success("Review submitted successfully!");
      setAction("");
      setComment("");
      setSelectedPlan(null);
      setShowModal(false);
    } catch (error) {
      console.error("Failed to submit review:", error);
      toast.error("Failed to submit review. Please try again.");
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    toast.info("You can now start editing the meal plan.");
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
      toast.success("Diet plan updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update diet plan:", error);
      toast.error("Failed to update diet plan. Please try again.");
    }
  };

  return (
    <div className="pt-23 pl-70 min-h-screen">
      <ToastContainer />
      <div>
        <h2 className="mt-8 text-3xl font-bold text-gray-800 mb-1">Diet Plan</h2>
        <p className="text-sm text-gray-500 mb-9">
          Help your patients to take right nutrients
        </p>
      </div>

      {dietPlans.length === 0 ? (
        <p className="text-gray-500">No diet plans found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dietPlans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white shadow-md rounded-2xl p-4 border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <p className="text-lg font-medium text-gray-800">
                Patient: {getPatientInfo(plan.patient_id)}
              </p>
              <p className="text-sm text-gray-600">
                Week Starting: {plan.for_week_starting}
              </p>
              <button
                onClick={() => handleViewPlan(plan)}
                className="mt-6 px-4 py-2 text-sm rounded-lg bg-green-400 hover:bg-green-500 text-white hover:scale-105 transition-all duration-200"
              >
                View Diet Plan
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && selectedPlan && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/10 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-3xl shadow-lg relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Weekly Diet Plan
            </h3>

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

            <div className="overflow-x-auto mb-6">
              <div className="flex gap-4 min-w-full">
                {Object.entries(editedMeals || {}).map(([date, details]) => (
                  <div
                    key={date}
                    className="bg-gray-50 border border-gray-200 rounded-xl p-4 min-w-[220px] shadow hover:shadow-md transition-all duration-300"
                  >
                    <h4 className="text-md font-semibold text-gray-700 mb-2">
                      {details.day}
                      <span className="text-xs text-gray-500 block">{date}</span>
                    </h4>
                    {["breakfast", "lunch", "dinner", "snack"].map((mealType) => (
                      <div key={mealType} className="mb-2">
                        <label className="text-sm font-medium text-gray-600 capitalize">
                          {mealType}:
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            className="w-full border p-1 rounded text-sm mt-1"
                            value={details.meals[mealType] || ""}
                            onChange={(e) =>
                              handleMealChange(date, mealType, e.target.value)
                            }
                          />
                        ) : (
                          <p className="text-sm text-gray-700 mt-1">
                            {details.meals[mealType]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment (optional)"
              className="w-full p-2 border rounded mb-4"
              rows={3}
            />

            <div className="flex items-center justify-between">
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="bg-green-400 hover:bg-green-500 text-white text-sm px-4 py-2 rounded transition-transform hover:scale-105"
                >
                  Edit
                </button>
              ) : (
                <button
                  onClick={handleSaveEdit}
                  className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded transition-transform hover:scale-105"
                >
                  Save Changes
                </button>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setAction("reject");
                    handleSubmitReview();
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded transition-transform hover:scale-105"
                >
                  Reject
                </button>
                <button
                  onClick={() => {
                    setAction("approve");
                    handleSubmitReview();
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 rounded transition-transform hover:scale-105"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DietPlans;
