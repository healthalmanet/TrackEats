import { useState, useEffect } from "react";
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

const activityLevelMap = {
  "Sedentary": "sedentary",
  "Light Activity": "light",
  "Moderate Activity": "moderate",
  "Active": "active",
  "Very Active": "very_active",
};

const goalMap = {
  "Lose Weight": "lose_weight",
  "Maintain Weight": "maintain",
  "Gain Weight": "gain_weight",
};

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
    health_conditions: [],
    country: "",
    diet_type: "",
  });

  const [originalData, setOriginalData] = useState(null);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCountryChange = (selectedOption) => {
    setFormData({ ...formData, country: selectedOption?.value || "" });
  };

  const handleHealthConditionChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
    setFormData({ ...formData, health_conditions: selected });
  };

  const formatDataForBackend = (data) => {
    const result = {};
    if (data.name) result.name = data.name;
    if (data.age) result.age = parseInt(data.age, 10);
    if (data.gender) result.gender = data.gender.toLowerCase();
    if (data.height_cm) result.height_cm = parseFloat(data.height_cm);
    if (data.weight_kg) result.weight_kg = parseFloat(data.weight_kg);
    if (data.mobile_number) result.mobile_number = data.mobile_number;
    if (data.activity_level) result.activity_level = activityLevelMap[data.activity_level] || data.activity_level;
    if (data.goal) result.goal = goalMap[data.goal] || data.goal;
    if (data.country) result.country = data.country;
    if (data.diet_type) result.diet_type = data.diet_type.toLowerCase();
    if (Array.isArray(data.health_conditions)) {
      result.health_conditions = data.health_conditions.map((h) => h.toLowerCase());
    }
    return result;
  };

  const getChangedFields = (original, current) => {
    const changed = {};
    for (let key in current) {
      if (
        typeof current[key] === "object" &&
        Array.isArray(current[key])
      ) {
        const sortedOriginal = (original?.[key] || []).slice().sort().join(",");
        const sortedCurrent = current[key].slice().sort().join(",");
        if (sortedOriginal !== sortedCurrent) changed[key] = current[key];
      } else if (original?.[key] !== current[key]) {
        changed[key] = current[key];
      }
    }
    return changed;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formatted = formatDataForBackend(formData);

    try {
      if (isEditing) {
        const originalFormatted = formatDataForBackend(originalData || {});
        const changedFields = getChangedFields(originalFormatted, formatted);

        if (Object.keys(changedFields).length === 0) {
          toast("No changes made.");
          return;
        }

        await updateUserProfile(changedFields);
        toast.success("✅ Profile updated!");
      } else {
        await createUserProfile(formatted);
        toast.success("🎉 Profile created!");
      }
    } catch (err) {
      console.error("Submission error:", err);
      toast.error("❌ Something went wrong.");
    }
  };

  const handleEditProfile = async () => {
    try {
      const data = await getUserProfile();
      if (data) {
        const normalizedData = {
          ...data,
          gender: data.gender.charAt(0).toUpperCase() + data.gender.slice(1),
          diet_type: data.diet_type.charAt(0).toUpperCase() + data.diet_type.slice(1),
          activity_level: Object.keys(activityLevelMap).find(
            key => activityLevelMap[key] === data.activity_level
          ) || data.activity_level,
          goal: Object.keys(goalMap).find(
            key => goalMap[key] === data.goal
          ) || data.goal,
          health_conditions: Array.isArray(data.health_conditions)
            ? data.health_conditions.map(h =>
              h.charAt(0).toUpperCase() + h.slice(1)
            )
            : [],
        };

        setFormData(normalizedData);
        setOriginalData(normalizedData);
        setIsEditing(true);
        toast.success("✏️ Profile loaded for editing!");
      }
    } catch (e) {
      console.error("Fetching profile error:", e);
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-8 md:p-10">
          {[ // main input fields
            { label: "Name", type: "text", name: "name", placeholder: "Enter your name" },
            { label: "Age", type: "number", name: "age", placeholder: "Enter your age" },
            { label: "Gender", type: "select", name: "gender", options: ["Male", "Female"] },
            { label: "Height (cm)", type: "number", name: "height_cm", placeholder: "e.g. 170" },
            { label: "Weight (kg)", type: "number", name: "weight_kg", placeholder: "e.g. 65" },
            { label: "Mobile Number", type: "tel", name: "mobile_number", placeholder: "Enter mobile number" },
            { label: "Activity Level", type: "select", name: "activity_level", options: Object.keys(activityLevelMap) },
            { label: "Goal", type: "select", name: "goal", options: Object.keys(goalMap) },
          ].map((field, index) => (
            <div key={index}>
              <label className="block text-gray-700 font-medium mb-1">{field.label}</label>
              {field.type === "select" ? (
                <select
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700"
                >
                  <option value="">Select {field.label}</option>
                  {field.options.map((opt, i) => (
                    <option key={i} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              )}
            </div>
          ))}

          {/* Health Conditions */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Health Conditions</label>
            <select
              name="health_conditions"
              multiple
              value={formData.health_conditions}
              onChange={handleHealthConditionChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              {[
                "None", "Diabetes", "Hypertension", "Thyroid",
                "Cholesterol", "PCOS/PCOD", "Anemia", "Cancer",
              ].map((cond, i) => (
                <option key={i} value={cond}>{cond}</option>
              ))}
            </select>
          </div>

          {/* Country */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Country</label>
            <Select
              options={countryOptions}
              value={countryOptions.find((c) => c.value === formData.country)}
              onChange={handleCountryChange}
              placeholder="Select your country"
            />
          </div>

          {/* Diet Type */}
          <div className="col-span-1 sm:col-span-2">
            <label className="block text-gray-700 font-medium mb-1">Diet Type</label>
            <select
              name="diet_type"
              value={formData.diet_type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select Diet Type</option>
              {["Vegetarian", "Non-Vegetarian", "Vegan", "Eggetarian", "Other"].map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="px-8 pb-8 md:px-10 flex flex-col gap-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleEditProfile}
              className="text-sm text-gray-600 border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-100"
            >
              Edit Existing Profile
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-6 rounded-lg text-white font-semibold bg-gradient-to-r from-green-400 to-yellow-400 hover:scale-[1.02] active:scale-95"
          >
            {isEditing ? "Update Profile" : "Save Profile"}
          </button>

          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        </div>
      </form>
    </div>
  );
};

export default UserProfileForm;
