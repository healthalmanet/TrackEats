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
    if (plan.status?.toLowerCase() !== "rejected") {
      setEditedMeals(plan.meals || {});
    } else {
      setEditedMeals(null);
    }
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

      {/* Modal logic omitted for brevity */}
    </div>
  );
};

export default DietPlans;
