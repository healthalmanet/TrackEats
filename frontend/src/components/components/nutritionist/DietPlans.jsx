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
          const filteredPlans = data.results.filter(
            (plan) => plan.status?.toLowerCase() !== "approved"
          );
          setDietPlans(filteredPlans);
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
  setIsEditing(false);
  setIsSaved(false); // Reset saved state
  setAction("");
  setComment("");
  if (plan.status?.toLowerCase() !== "rejected") {
    setEditedMeals(plan.meals || {});
  } else {
    setEditedMeals(null);
  }
  setShowModal(true);
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

      if (action === "reject") {
        setDietPlans((prev) =>
          prev.map((plan) =>
            plan.id === selectedPlan.id ? { ...plan, status: "rejected" } : plan
          )
        );
      }

      if (action === "approve") {
        setDietPlans((prev) =>
          prev.filter((plan) => plan.id !== selectedPlan.id)
        );
      }

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
      await editDiet(selectedPlan.id, selectedPlan.patient_id, date, updatedMeals);

    }
    toast.success("Diet plan updated successfully!");
    setIsEditing(false);
    setIsSaved(true); // Show approve/reject buttons now
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

                  {/* ✅ Status Badge */}
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
                className="mt-6 ml-15 px-4 py-2 text-sm rounded-lg bg-green-400 hover:bg-green-500 text-white hover:scale-105 transition-all duration-200"
              >
                View Diet Plan
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal logic omitted for brevity */}
    {showModal && selectedPlan && (
  <div className="fixed inset-0 z-50 flex items-center justify-center  bg-black/40 backdrop-blur-sm">
    <div className="relative bg-white rounded-2xl shadow-2xl w-[92%] max-w-4xl max-h-[90vh] flex flex-col animate-fade-in">

      {/* Modal Header */}
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

      {/* Scrollable Content Area */}
      <div className="px-5 py-4 overflow-y-auto flex-1">
        {selectedPlan.status?.toLowerCase() === "rejected" && (
  <div className="mb-4 p-3 rounded-md   text-red-700 text-sm font-medium">
    This diet plan has been <span className="font-semibold">Rejected</span>.
  </div>
)}

        {/* Horizontal Scrollable Diet Grid */}
        <div className="overflow-x-auto">
          <div className="flex space-x-4 min-w-fit pb-2">
            {editedMeals &&
              Object.entries(editedMeals).map(([date, mealData]) => (
                <div
                  key={date}
                  className="min-w-[220px] bg-gray-50 rounded-xl shadow-sm p-3 flex-shrink-0 border border-gray-200"
                >
                  <h3 className="text-md font-bold text-blue-700 mb-2 text-center">
                    {date}
                  </h3>

                  {["breakfast", "lunch", "dinner"].map((mealType) => (
                    <div key={mealType} className="mb-3">
                      <label className="block text-xs font-medium text-gray-600 capitalize mb-1">
                        {mealType}
                      </label>
                      <textarea
                        value={mealData.meals?.[mealType] || ""}
                        onChange={(e) =>
                          isEditing && handleMealChange(date, mealType, e.target.value)
                        }
                        disabled={!isEditing}
                        rows={3}
                        className={`w-full p-2 rounded-md border border-gray-300 resize-none text-sm ${
                          isEditing
                            ? "focus:outline-none focus:ring-2 focus:ring-blue-300"
                            : "bg-gray-100 text-gray-600 cursor-not-allowed"
                        }`}
                        placeholder={`Enter ${mealType}...`}
                      />
                    </div>
                  ))}
                </div>
              ))}
          </div>
        </div>

        {/* Comment Box */}
        {selectedPlan.status?.toLowerCase() !== "rejected" && (
  <div className="mt-6">
    <label className="block mb-1 text-sm font-medium text-gray-700">Comment</label>
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

      {/* Action Buttons */}
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
