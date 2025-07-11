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
  const [editedMeals, setEditedMeals] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const patientRes = await getAssignedPatients();
        const patientData = patientRes?.data;
        const finalPatients = Array.isArray(patientData?.results)
          ? patientData.results
          : patientData;
        setPatients(finalPatients);

        const dietRes = await getDietRecommendationUsers();
        const dietData = dietRes?.data;

        if (Array.isArray(dietData?.results)) {
          const enrichedPlans = dietData.results.map((plan) => {
            const matchedPatient = finalPatients.find(
              (p) => p.email === plan.email
            );
            return {
              ...plan,
              patient_id: matchedPatient?.id || null,
            };
          });

          setDietPlans(enrichedPlans);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleViewPlan = (plan) => {
    setSelectedPlan(plan);
    setIsEditing(false);
    setIsSaved(false);
    setAction("");
    setComment("");
    setEditedMeals(plan.meals || {});
    setShowModal(true);
  };

  const getPatientInfo = (id) => {
    const user = patients.find((p) => p.id === id || p.user_id === id);
    return user ? `${user.id} (${user.email})` : "Unknown Patient";
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

      setDietPlans((prev) =>
        prev.map((plan) =>
          plan.id === selectedPlan.id ? { ...plan, status: action } : plan
        )
      );

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
    setIsSaved(false);
    toast.info("You can now start editing the meal plan.");
  };

  const handleMealChange = (date, mealType, field, value) => {
    setEditedMeals((prev) => ({
      ...prev,
      [date]: {
        ...prev[date],
        meals: {
          ...prev[date].meals,
          [mealType]: {
            ...prev[date].meals[mealType],
            [field]: value,
          },
        },
      },
    }));
  };

  const handleSaveEdit = async () => {
    try {
      for (const date in editedMeals) {
        const updatedMeals = {};
        for (const mealType of ["breakfast", "lunch", "dinner"]) {
          updatedMeals[mealType] = editedMeals[date].meals[mealType];
        }

        await editDiet(
          selectedPlan.id,
          selectedPlan.patient_id,
          date,
          updatedMeals
        );
      }
      toast.success("Diet plan updated successfully!");
      setIsEditing(false);
      setIsSaved(true);
    } catch (error) {
      console.error("Failed to update diet plan:", error);
      toast.error("Failed to update diet plan. Please try again.");
    }
  };

  return (
    <div className="pt-20 ml-[120px] pr-6 md:pr-8 lg:pr-10 xl:pr-12 2xl:pr-16 min-h-screen">


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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

          {dietPlans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white shadow-md rounded-2xl p-5 border border-gray-100 hover:shadow-xl transition-all duration-300 break-words w-full max-w-[420px]"

            >
              <p className="text-lg font-medium text-gray-800">
                Patient: {getPatientInfo(plan.patient_id)}
              </p>
              <p className="text-sm text-gray-600">
                Week Starting: {plan.for_week_starting}
              </p>

              <span
                className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-semibold
                ${plan.status === "approved" ? "bg-green-100 text-green-700" :
                  plan.status === "rejected" ? "bg-red-100 text-red-700" :
                  "bg-yellow-100 text-yellow-700"}`}
              >
                {plan.status
                  ? plan.status.charAt(0).toUpperCase() + plan.status.slice(1)
                  : "Pending"}
              </span>

              <button
                onClick={() => handleViewPlan(plan)}
                className="mt-6 px-4 ml-6 py-2 text-sm rounded-lg bg-green-400 hover:bg-green-500 text-white hover:scale-105 transition-all duration-200"
              >
                View Diet Plan
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-2">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col animate-fade-in overflow-hidden">
            <div className="flex justify-between items-center border-b px-5 py-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Diet Plan - {getPatientInfo(selectedPlan.patient_id)}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-red-500 transition text-xl"
              >
                ✕
              </button>
            </div>

            <div className="px-5 py-4 overflow-y-auto flex-1">
              {selectedPlan.status?.toLowerCase() === "rejected" && (
                <div className="mb-4 p-3 rounded-md text-red-700 text-sm font-medium">
                  This diet plan has been <span className="font-semibold">Rejected</span>.
                </div>
              )}

              <div className="overflow-x-auto">
                <div className="flex space-x-4 min-w-fit pb-2">
                  {editedMeals &&
                    Object.entries(editedMeals).map(([date, mealData]) => (
                      <div
                        key={date}
                        className="min-w-[250px] bg-gray-50 rounded-xl shadow-sm p-3 flex-shrink-0 border border-gray-200"
                      >
                        <h3 className="text-md font-bold text-blue-700 mb-2 text-center">
                          {date}
                        </h3>

                        {["breakfast", "lunch", "dinner"].map((mealType) => (
                          <div key={mealType} className="mb-3">
                            <label className="block text-xs font-medium text-gray-600 capitalize mb-1">
                              {mealType}
                            </label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={mealData.meals?.[mealType]?.name || ""}
                                onChange={(e) =>
                                  handleMealChange(date, mealType, "name", e.target.value)
                                }
                                className="w-full px-2 py-1 rounded-md border border-gray-300 text-sm"
                              />
                            ) : (
                              <div className="bg-white border border-gray-300 rounded-lg p-2 text-sm space-y-1">
                                {mealData.meals?.[mealType]?.name ? (
                                  <div className="text-gray-700">
                                    • {mealData.meals[mealType].name}
                                  </div>
                                ) : (
                                  <div className="text-gray-500 italic">No data</div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                </div>
              </div>

              {selectedPlan.status?.toLowerCase() !== "rejected" && (
                <div className="mt-6">
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Comment
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write your comment here..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                  />
                </div>
              )}
            </div>

            {selectedPlan.status?.toLowerCase() !== "rejected" && (
              <div className="flex flex-wrap justify-end gap-3 px-5 py-4 border-t">
                {!isEditing && (
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 rounded-md bg-yellow-500 hover:bg-yellow-600 text-white text-sm"
                  >
                    Edit
                  </button>
                )}

                {isEditing && (
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm"
                  >
                    Save Changes
                  </button>
                )}

                <button
                  onClick={() => {
                    if (!comment.trim()) {
                      toast.warn("Please enter a comment before rejecting.");
                      return;
                    }
                    setAction("reject");
                    handleSubmitReview();
                  }}
                  className="px-4 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white text-sm"
                >
                  Reject
                </button>

                <button
                  onClick={() => {
                    if (!comment.trim()) {
                      toast.warn("Please enter a comment before approving.");
                      return;
                    }
                    setAction("approve");
                    handleSubmitReview();
                  }}
                  className="px-4 py-2 rounded-md bg-green-500 hover:bg-green-600 text-white text-sm"
                >
                  Approve
                </button>

                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-md bg-gray-400 hover:bg-gray-500 text-white text-sm"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DietPlans;
