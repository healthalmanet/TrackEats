import { useEffect, useState } from "react";
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
  Sedentary: "sedentary",
  "Light Activity": "light",
  "Moderate Activity": "moderately_active",
  "Very Active": "very_active",
};

const goalMap = {
  "Lose Weight": "lose_weight",
  "Maintain Weight": "maintain",
  "Gain Weight": "gain_weight",
};

const dietTypeOptions = [
  { value: "Vegetarian", label: "Vegetarian" },
  { value: "Non-Vegetarian", label: "Non-Vegetarian" },
  { value: "Vegan", label: "Vegan" },
  { value: "Eggetarian", label: "Eggetarian" },
  { value: "Other", label: "Other" },
];

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const activityLevelOptions = Object.keys(activityLevelMap).map((key) => ({
  value: activityLevelMap[key],
  label: key,
}));

const goalOptions = Object.keys(goalMap).map((key) => ({
  value: goalMap[key],
  label: key,
}));

const UserProfileForm = () => {
  const [formData, setFormData] = useState({
    date_of_birth: "",
    gender: "",
    height_cm: "",
    weight_kg: "",
    mobile_number: "",
    occupation: "",
    activity_level: "",
    goal: "",
    country: "",
    diet_type: "",
    allergies: "",
    is_diabetic: false,
    is_hypertensive: false,
    has_heart_condition: false,
    has_thyroid_disorder: false,
    has_arthritis: false,
    has_gastric_issues: false,
    other_chronic_condition: "",
    family_history: "",
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const data = await getUserProfile();
      if (data) {
        setFormData(data);
        setIsEditing(true);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
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
        setIsEditing(true);
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("❌ Something went wrong.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 mb-30 bg-[#FAF3EB] py-10 px-6 sm:px-10 rounded-2xl shadow-xl border border-[#ECEFF1] font-['Poppins'] text-[#263238]">
      <Toaster />
      <div className="text-center mb-10">
        <h2 className="text-center text-2xl sm:text-3xl font-bold text-[#FF7043] drop-shadow-sm">
          Personalize Your Profile
        </h2>
        <p className="text-sm text-[#546E7A] mt-1 font-medium">
          Help us understand your health and nutrition needs
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <input
          type="date"
          name="date_of_birth"
          value={formData.date_of_birth}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
        />

        <Select
          options={genderOptions}
          value={genderOptions.find((opt) => opt.value === formData.gender)}
          onChange={(selected) =>
            setFormData({ ...formData, gender: selected.value })
          }
          placeholder="Gender"
        />

        <input
          type="number"
          name="height_cm"
          value={formData.height_cm}
          onChange={handleChange}
          placeholder="Height (cm)"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
        />

        <input
          type="number"
          name="weight_kg"
          value={formData.weight_kg}
          onChange={handleChange}
          placeholder="Weight (kg)"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
        />

        <input
          type="tel"
          name="mobile_number"
          value={formData.mobile_number}
          onChange={handleChange}
          placeholder="Mobile Number"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
        />

        <input
          name="occupation"
          value={formData.occupation}
          onChange={handleChange}
          placeholder="Occupation"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
        />

        <Select
          options={activityLevelOptions}
          value={activityLevelOptions.find(
            (opt) => opt.value === formData.activity_level
          )}
          onChange={(selected) =>
            setFormData({ ...formData, activity_level: selected.value })
          }
          placeholder="Activity Level"
        />

        <Select
          options={goalOptions}
          value={goalOptions.find((opt) => opt.value === formData.goal)}
          onChange={(selected) =>
            setFormData({ ...formData, goal: selected.value })
          }
          placeholder="Goal"
        />

        <Select
          options={countryOptions}
          value={countryOptions.find((opt) => opt.value === formData.country)}
          onChange={(selected) =>
            setFormData({ ...formData, country: selected.value })
          }
          placeholder="Country"
        />

        <Select
          options={dietTypeOptions}
          value={dietTypeOptions.find(
            (opt) =>
              opt.value.toLowerCase() === formData.diet_type?.toLowerCase()
          )}
          onChange={(selected) =>
            setFormData({ ...formData, diet_type: selected.value })
          }
          placeholder="Diet Type"
        />

        <input
          name="allergies"
          value={formData.allergies}
          onChange={handleChange}
          placeholder="Allergies (comma separated)"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white sm:col-span-2"
        />

        {/* Checkbox Grid */}
        <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm text-[#546E7A]">
          {[
            "is_diabetic",
            "is_hypertensive",
            "has_heart_condition",
            "has_thyroid_disorder",
            "has_arthritis",
            "has_gastric_issues",
          ].map((field) => (
            <label key={field} className="flex items-center space-x-2">
              <input
                type="checkbox"
                name={field}
                checked={formData[field]}
                onChange={handleChange}
                className="accent-[#FF7043]"
              />
              <span className="capitalize">{field.replace(/_/g, " ")}</span>
            </label>
          ))}
        </div>

        <input
          name="other_chronic_condition"
          value={formData.other_chronic_condition}
          onChange={handleChange}
          placeholder="Other Chronic Conditions"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white sm:col-span-2"
        />

        <input
          name="family_history"
          value={formData.family_history}
          onChange={handleChange}
          placeholder="Family History"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white sm:col-span-2"
        />

        <button
          type="submit"
          className="mt-6 w-full sm:col-span-2 py-3 px-6 rounded-lg text-white font-semibold bg-[#FF7043] hover:bg-[#F4511E] transition duration-200"
        >
          {isEditing ? "Save Changes" : "Create Profile"}
        </button>
      </form>
    </div>
  );
};

export default UserProfileForm;
