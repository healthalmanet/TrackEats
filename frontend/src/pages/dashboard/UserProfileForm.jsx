import { useState, useEffect } from "react";
import { submitUserProfile, getUserProfile } from "../../api/userProfile";
import React from "react";

const UserProfileForm = () => {
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    height: "",
    weight: "",
    mobileNumber: "",
    activityLevel: "",
    goal: "",
    healthCondition: "",
    dietType: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getUserProfile();
        if (data) setFormData(data);
      } catch (e) {
        console.log("No existing profile.");
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitUserProfile(formData);
      alert("Profile submitted.");
    } catch (err) {
      setError("Error submitting form.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-4xl bg-white shadow-xl rounded-2xl overflow-hidden"
      >
        {/* Gradient Header */}
        <div className="w-full bg-gradient-to-r from-green-100 to-yellow-100">
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-green-400 to-yellow-300 flex items-center justify-center text-white text-2xl shadow-md">
              👤
            </div>
            <h2 className="text-2xl font-semibold text-gray-700 mt-3">
              Complete Your Profile
            </h2>
            <p className="text-sm font-semibold text-gray-600">
              Help us personalize your nutrition journey
            </p>
          </div>
        </div>

        {/* Grid Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-8 md:p-10">
          {[
            { label: "Age", type: "number", name: "age", placeholder: "Enter your age" },
            { label: "Gender", type: "select", name: "gender", options: ["Male", "Female", "Other"] },
            { label: "Height (cm)", type: "number", name: "height", placeholder: "e.g. 170" },
            { label: "Weight (kg)", type: "number", name: "weight", placeholder: "e.g. 65" },
            { label: "Mobile Number", type: "tel", name: "mobileNumber", placeholder: "Enter mobile number" },
            {
              label: "Activity Level",
              type: "select",
              name: "activityLevel",
              options: ["Sedentary", "Light", "Moderate", "Active"],
            },
            {
              label: "Goal",
              type: "select",
              name: "goal",
              options: ["Weight Loss", "Muscle Gain", "Maintain"],
            },
            {
              label: "Health Condition",
              type: "select",
              name: "healthCondition",
              options: ["None", "Diabetes", "Hypertension", "Thyroid"],
            },
          ].map((field, index) => (
            <div key={index}>
              <label className="block text-gray-700 font-medium mb-1">{field.label}</label>
              {field.type === "select" ? (
                <select
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-300 appearance-none"
                >
                  <option value="">Select {field.label}</option>
                  {field.options.map((opt, i) => (
                    <option key={i} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-300"
                />
              )}
            </div>
          ))}

          {/* Diet Type - Full Width */}
          <div className="sm:col-span-2">
            <label className="block text-gray-700 font-medium mb-1">Diet Type</label>
            <select
              name="dietType"
              value={formData.dietType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-300 appearance-none"
            >
              <option value="">Select Diet Type</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Non-Vegetarian">Non-Vegetarian</option>
              <option value="Vegan">Vegan</option>
              <option value="Eggetarian">Eggetarian</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="px-8 pb-8 md:px-10">
          <button
            type="submit"
            className="w-full py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-green-400 to-yellow-400 hover:opacity-90 transition"
          >
            Save Profile
          </button>
          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        </div>
      </form>
    </div>
  );
};

export default UserProfileForm;
