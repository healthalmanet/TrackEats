import { useState } from "react";
import {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
} from "../../api/userProfile";
import { Toaster, toast } from "react-hot-toast";
import Select from "react-select";
import React from "react";

const countryOptions = [
  { value: "India", label: "India" },
  { value: "United States", label: "United States" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "Canada", label: "Canada" },
  { value: "Australia", label: "Australia" },
];

const UserProfileForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    height_cm: "",
    weight_kg: "",
    mobile_number: "",
    activity_level: "",
    goal: "",
    health_conditions: "",
    country: "",
    diet_type: "",
  });

  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCountryChange = (selectedOption) => {
    setFormData({ ...formData, country: selectedOption?.value || "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateUserProfile(formData);
        toast.success("✅ Profile updated!");
      } else {
        await createUserProfile(formData);
        toast.success("🎉 Profile created!");
      }
    } catch (err) {
      toast.error("❌ Something went wrong.");
    }
  };

  const handleEditProfile = async () => {
    try {
      const data = await getUserProfile();
      if (data) {
        setFormData(data);
        setIsEditing(true);
        toast.success("✏️ Profile loaded for editing!");
      }
    } catch (e) {
      toast.error("No profile found to edit.");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 px-4 py-10">
      <Toaster />

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-4xl bg-white shadow-xl rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="w-full bg-gradient-to-r from-green-100 to-yellow-100">
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-green-400 to-yellow-300 flex items-center justify-center text-white text-2xl shadow-md">
              👤
            </div>
            <h2 className="text-2xl font-semibold text-gray-700 mt-3">
              {isEditing ? "Edit Your Profile" : "Complete Your Profile"}
            </h2>
            <p className="text-sm font-semibold text-gray-600">
              Help us personalize your nutrition journey
            </p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-8 md:p-10">
          {[
            { label: "Name", type: "text", name: "name", placeholder: "Enter your name" },
            { label: "Age", type: "number", name: "age", placeholder: "Enter your age" },
            { label: "Gender", type: "select", name: "gender", options: ["Male", "Female"] },
            { label: "Height (cm)", type: "number", name: "height_cm", placeholder: "e.g. 170" },
            { label: "Weight (kg)", type: "number", name: "weight_kg", placeholder: "e.g. 65" },
            { label: "Mobile Number", type: "tel", name: "mobile_number", placeholder: "Enter mobile number" },
            {
              label: "Activity Level",
              type: "select",
              name: "activity_level",
              options: ["Sedentary", "Light Activity", "Moderate Activity", "Active", "Very Active"],
            },
            {
              label: "Goal",
              type: "select",
              name: "goal",
              options: ["Lose Weight", "Gain Weight", "Maintain Weight"],
            },
            {
              label: "Health Condition",
              type: "select",
              name: "health_conditions",
              options: ["None", "Diabetes", "Hypertension", "Thyroid", "Cholesterol", "PCOS/PCOD", "Anemia", "Cancer"],
            },
          ].map((field, index) => (
            <div key={index}>
              <label className="block text-gray-700 font-medium mb-1">{field.label}</label>
              {field.type === "select" ? (
                <select
                  name={field.name}
                  value={formData[field.name] || ""}
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
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-300"
                />
              )}
            </div>
          ))}

          {/* Country */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Country</label>
            <Select
              options={countryOptions}
              value={countryOptions.find((c) => c.value === formData.country)}
              onChange={handleCountryChange}
              placeholder="Select your country"
              classNamePrefix="react-select"
              styles={{
                control: (base) => ({
                  ...base,
                  padding: "2px",
                  borderColor: "#D1D5DB",
                  boxShadow: "none",
                }),
              }}
            />
          </div>

          {/* Diet Type */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Diet Type</label>
            <select
              name="diet_type"
              value={formData.diet_type || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-300 appearance-none"
            >
              <option value="">Select Diet Type</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Non-Vegetarian">Non-Vegetarian</option>
              <option value="Vegan">Vegan</option>
              <option value="Eggetarian">Eggetarian</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Edit & Submit Buttons */}
        <div className="px-8 pb-8 md:px-10 flex flex-col gap-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleEditProfile}
              className="text-sm text-gray-600 border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-100 transition"
            >
              ✏️ Edit Existing Profile
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-6 rounded-lg text-white font-semibold bg-gradient-to-r from-green-400 to-yellow-400 hover:opacity-90 transition"
          >
            {isEditing ? "Update Profile" : "Save Profile"}
          </button>

          {error && (
            <p className="text-red-500 text-sm mt-4">{error}</p>
          )}
        </div>
      </form>
    </div>
  );
};

export default UserProfileForm;
