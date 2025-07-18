// src/pages/user/UserProfileForm.jsx

import React, { useState, useEffect } from "react";
import {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
} from "../../api/userProfile";
import { Toaster, toast } from "react-hot-toast";
import Select from "react-select";
import { motion } from "framer-motion";

// --- OPTIONS FOR DROPDOWNS ---
const countryOptions = [
  { value: "India", label: "India" },
  { value: "United States", label: "United States" },
  { value: "Canada", label: "Canada" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "Australia", label: "Australia" },
  { value: "Germany", label: "Germany" },
  { value: "Japan", label: "Japan" },
  { value: "Brazil", label: "Brazil" },
  { value: "South Africa", label: "South Africa" },
  { value: "United Arab Emirates", label: "United Arab Emirates" },
];
const activityLevels = [
  { value: "Sedentary", label: "Sedentary (little or no exercise)" },
  { value: 'Lightly Active', label: 'Lightly Active (light exercise/sports 1-3 days/week)' },
  { value: 'Moderately Active', label: 'Moderately Active (moderate exercise/sports 3-5 days/week)' },
  { value: 'Very Active', label: 'Very Active (hard exercise/sports 6-7 days a week)' },
  { value: 'Extra Active', label: 'Extra Active (very hard exercise/physical job)' }
];
// FIX: Corrected the 'value' for "Maintain Weight" to match the backend model ("maintain")
const goals = [
  { value: "Lose Weight", label: "Lose Weight" },
  { value: "Maintain Weight", label: "Maintain Weight" },
  { value: "Gain Weight", label: "Gain Weight" }
];
const dietTypeOptions = [
  { value: "Vegetarian", label: "Vegetarian" },
  { value: 'Non_Vegetarian', label: 'Non-Vegetarian' },
  { value: 'Vegan', label: 'Vegan' },
  { value: 'Eggetarian', label: 'Eggetarian' },
  { value: 'Keto', label: 'Keto' },
  { value: 'Other', label: 'Other' }
];
const genderOptions = [ { value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other" } ];

// --- THEMED STYLES FOR REACT-SELECT ---
const themedSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: 'var(--color-bg-app)',
    borderColor: state.isFocused ? 'var(--color-primary)' : 'var(--color-border-default)',
    borderWidth: '2px',
    boxShadow: 'none',
    '&:hover': { borderColor: 'var(--color-primary)' },
    borderRadius: '0.75rem',
    padding: '0.3rem',
    minHeight: '52px',
    transition: 'border-color 0.2s ease-in-out',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? 'var(--color-primary)' : state.isFocused ? 'var(--color-bg-interactive-subtle)' : 'var(--color-bg-surface)',
    color: state.isSelected ? 'var(--color-text-on-primary)' : 'var(--color-text-strong)',
    '&:active': { backgroundColor: 'var(--color-primary-hover)' },
    cursor: 'pointer',
    fontWeight: '500',
  }),
  placeholder: (provided) => ({ ...provided, color: 'var(--color-text-muted)' }),
  singleValue: (provided) => ({ ...provided, color: 'var(--color-text-strong)', fontWeight: '500' }),
  menu: (provided) => ({ ...provided, backgroundColor: 'var(--color-bg-surface)', border: '2px solid var(--color-border-default)', zIndex: 50 }),
};

const UserProfileForm = () => {
  const [formData, setFormData] = useState({
    date_of_birth: "", gender: "", height_cm: "", weight_kg: "", mobile_number: "",
    occupation: "", activity_level: "", goal: "", country: "", diet_type: "",
    allergies: "", is_diabetic: false, is_hypertensive: false, has_heart_condition: false,
    has_thyroid_disorder: false, has_arthritis: false, has_gastric_issues: false,
    other_chronic_condition: "", family_history: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        if (data && Object.keys(data).length > 1) { // Check if profile is not empty
          const sanitizedData = { ...data, is_diabetic: !!data.is_diabetic, is_hypertensive: !!data.is_hypertensive, has_heart_condition: !!data.has_heart_condition, has_thyroid_disorder: !!data.has_thyroid_disorder, has_arthritis: !!data.has_arthritis, has_gastric_issues: !!data.has_gastric_issues };
          setFormData(sanitizedData);
          setIsEditing(true);
        }
      } catch (error) {
          console.log("No profile found. Ready to create a new one.");
          setIsEditing(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        await updateUserProfile(formData);
        toast.success("✅ Profile updated successfully!");
      } else {
        await createUserProfile(formData);
        toast.success("🎉 Profile created successfully!");
        setIsEditing(true);
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("❌ Something went wrong. Please check your inputs.");
    } finally {
        setLoading(false);
    }
  };
  
  const baseInputStyles = "w-full px-4 py-3 bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-all duration-300 placeholder:text-[var(--color-text-muted)] text-[var(--color-text-strong)]";
  
  const medicalConditions = [
      { field: "is_diabetic", label: "Diabetic" },
      { field: "is_hypertensive", label: "Hypertensive" },
      { field: "has_heart_condition", label: "Heart Condition" },
      { field: "has_thyroid_disorder", label: "Thyroid Disorder" },
      { field: "has_arthritis", label: "Arthritis" },
      { field: "has_gastric_issues", label: "Gastric Issues" },
  ];

  return (
    <div className="max-w-4xl mx-auto my-10 bg-[var(--color-bg-surface)] py-10 px-6 sm:px-10 rounded-2xl shadow-2xl border-2 border-[var(--color-border-default)] font-[var(--font-secondary)] text-[var(--color-text-strong)]">
      <Toaster position="top-center" />
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-[var(--font-primary)] font-bold text-[var(--color-primary)]">
          Personalize Your Profile
        </h2>
        <p className="text-md text-[var(--color-text-default)] mt-2">
          Help us understand your health and nutrition needs better.
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-10">
        
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="space-y-6">
            <h3 className="text-xl font-[var(--font-primary)] font-semibold text-[var(--color-text-strong)] border-b-2 border-dashed border-[var(--color-primary)]/20 pb-3">Personal Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <input type="date" name="date_of_birth" value={formData.date_of_birth || ''} onChange={handleChange} className={baseInputStyles}/>
              <Select styles={themedSelectStyles} options={genderOptions} value={genderOptions.find((opt) => opt.value === formData.gender)} onChange={(selected) => setFormData({ ...formData, gender: selected.value })} placeholder="Select Gender..." />
              <input type="number" name="height_cm" value={formData.height_cm || ''} onChange={handleChange} placeholder="Height (cm)" className={baseInputStyles}/>
              <input type="number" name="weight_kg" value={formData.weight_kg || ''} onChange={handleChange} placeholder="Weight (kg)" className={baseInputStyles}/>
              <input type="tel" name="mobile_number" value={formData.mobile_number || ''} onChange={handleChange} placeholder="Mobile Number" className={baseInputStyles}/>
              <input name="occupation" value={formData.occupation || ''} onChange={handleChange} placeholder="Occupation" className={baseInputStyles}/>
            </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="space-y-6">
            <h3 className="text-xl font-[var(--font-primary)] font-semibold text-[var(--color-text-strong)] border-b-2 border-dashed border-[var(--color-primary)]/20 pb-3">Lifestyle & Goals</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Select styles={themedSelectStyles} options={activityLevels} value={activityLevels.find((opt) => opt.value === formData.activity_level)} onChange={(selected) => setFormData({ ...formData, activity_level: selected.value })} placeholder="Select Activity Level..."/>
              <Select styles={themedSelectStyles} options={goals} value={goals.find((opt) => opt.value === formData.goal)} onChange={(selected) => setFormData({ ...formData, goal: selected.value })} placeholder="Select Your Goal..." />
              <Select styles={themedSelectStyles} options={countryOptions} value={countryOptions.find((opt) => opt.value === formData.country)} onChange={(selected) => setFormData({ ...formData, country: selected.value })} placeholder="Select Country..." />
              <Select styles={themedSelectStyles} options={dietTypeOptions} value={dietTypeOptions.find((opt) => opt.value.toLowerCase() === formData.diet_type?.toLowerCase())} onChange={(selected) => setFormData({ ...formData, diet_type: selected.value })} placeholder="Select Diet Type..." />
              <div className="sm:col-span-2">
                  <input name="allergies" value={formData.allergies || ''} onChange={handleChange} placeholder="Any food allergies? (e.g., peanuts, gluten, shellfish)" className={baseInputStyles} />
              </div>
            </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="space-y-6">
            <h3 className="text-xl font-[var(--font-primary)] font-semibold text-[var(--color-text-strong)] border-b-2 border-dashed border-[var(--color-primary)]/20 pb-3">Medical History</h3>
            <div className="sm:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 text-sm text-[var(--color-text-default)] font-medium">
              {medicalConditions.map(({field, label}) => (
                <label key={field} className="flex items-center space-x-3 cursor-pointer p-2 rounded-md">
                  <input type="checkbox" name={field} checked={!!formData[field]} onChange={handleChange} className="h-4 w-4 rounded border-[var(--color-border-default)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"/>
                  <span>{label}</span>
                </label>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-6 pt-2">
                <input name="other_chronic_condition" value={formData.other_chronic_condition || ''} onChange={handleChange} placeholder="Other chronic conditions (if any)" className={baseInputStyles} />
                <input name="family_history" value={formData.family_history || ''} onChange={handleChange} placeholder="Any relevant family medical history?" className={baseInputStyles} />
            </div>
        </motion.section>

        <motion.button
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-lg text-[var(--color-text-on-primary)] font-semibold bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:transform-none"
        >
          {loading ? "Saving..." : (isEditing ? "Save Changes" : "Create My Profile")}
        </motion.button>
      </form>
    </div>
  );
};

export default UserProfileForm;