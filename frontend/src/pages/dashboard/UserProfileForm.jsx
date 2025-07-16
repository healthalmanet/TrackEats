import React, { useState, useEffect } from "react";
import {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
} from "../../api/userProfile";
import { Toaster, toast } from "react-hot-toast";
import Select from "react-select";

// --- OPTIONS FOR DROPDOWNS (Unchanged) ---
const countryOptions = [ { value: "India", label: "India" }, /* ... other countries */ ];
const activityLevels = [ { value: "sedentary", label: "Sedentary (little or no exercise)" }, /* ... other levels */ ];
const goals = [ { value: "lose_weight", label: "Lose Weight" }, /* ... other goals */ ];
const dietTypeOptions = [ { value: "vegetarian", label: "Vegetarian" }, /* ... other types */ ];
const genderOptions = [ { value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other" } ];

// --- TRULY DYNAMIC & THEMED STYLES FOR REACT-SELECT ---
// This object uses CSS variables to pull colors directly from your index.css file.
const themedSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: 'var(--color-bg-main)',
    borderColor: state.isFocused ? 'var(--color-primary-accent)' : 'var(--color-border)',
    boxShadow: state.isFocused ? '0 0 0 1px var(--color-primary-accent)' : 'none',
    '&:hover': {
      borderColor: state.isFocused ? 'var(--color-primary-accent)' : 'var(--color-primary-hover)',
    },
    borderRadius: '0.5rem',
    padding: '0.2rem',
    minHeight: '48px',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? 'var(--color-primary-accent)' : state.isFocused ? 'var(--color-bg-light)' : 'var(--color-bg-section)',
    color: state.isSelected ? 'var(--color-text-light)' : 'var(--color-text-heading)',
    '&:active': {
        backgroundColor: 'var(--color-primary-hover)',
    },
    cursor: 'pointer',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: 'var(--color-text-body)',
    opacity: 0.6,
  }),
  singleValue: (provided) => ({
      ...provided,
      color: 'var(--color-text-heading)',
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: 'var(--color-bg-section)',
    border: '1px solid var(--color-border)',
  }),
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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        if (data) {
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
    }
  };
  
  const baseInputStyles = "w-full px-4 py-3 bg-main border border-custom rounded-lg focus:ring-1 focus:ring-primary focus:outline-none transition duration-200 placeholder:text-body/60 text-heading";
  
  const medicalConditions = [
      { field: "is_diabetic", label: "Diabetic" },
      { field: "is_hypertensive", label: "Hypertensive" },
      { field: "has_heart_condition", label: "Heart Condition" },
      { field: "has_thyroid_disorder", label: "Thyroid Disorder" },
      { field: "has_arthritis", label: "Arthritis" },
      { field: "has_gastric_issues", label: "Gastric Issues" },
  ];

  return (
    <div className="max-w-4xl mx-auto my-10 bg-section py-10 px-6 sm:px-10 rounded-2xl shadow-lg border border-custom font-['Poppins'] text-heading">
      <Toaster position="top-center" />
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-['Lora'] font-bold text-primary">
          Personalize Your Profile
        </h2>
        <p className="text-md text-body mt-2">
          Help us understand your health and nutrition needs better.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        
        <section className="space-y-6">
            <h3 className="text-xl font-['Lora'] font-semibold text-heading border-b-2 border-primary/20 pb-3">Personal Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className={baseInputStyles}/>
              <Select styles={themedSelectStyles} options={genderOptions} value={genderOptions.find((opt) => opt.value === formData.gender)} onChange={(selected) => setFormData({ ...formData, gender: selected.value })} placeholder="Select Gender..." />
              <input type="number" name="height_cm" value={formData.height_cm} onChange={handleChange} placeholder="Height (cm)" className={baseInputStyles}/>
              <input type="number" name="weight_kg" value={formData.weight_kg} onChange={handleChange} placeholder="Weight (kg)" className={baseInputStyles}/>
              <input type="tel" name="mobile_number" value={formData.mobile_number} onChange={handleChange} placeholder="Mobile Number" className={baseInputStyles}/>
              <input name="occupation" value={formData.occupation} onChange={handleChange} placeholder="Occupation" className={baseInputStyles}/>
            </div>
        </section>

        <section className="space-y-6">
            <h3 className="text-xl font-['Lora'] font-semibold text-heading border-b-2 border-primary/20 pb-3">Lifestyle & Goals</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Select styles={themedSelectStyles} options={activityLevels} value={activityLevels.find((opt) => opt.value === formData.activity_level)} onChange={(selected) => setFormData({ ...formData, activity_level: selected.value })} placeholder="Select Activity Level..."/>
              <Select styles={themedSelectStyles} options={goals} value={goals.find((opt) => opt.value === formData.goal)} onChange={(selected) => setFormData({ ...formData, goal: selected.value })} placeholder="Select Your Goal..." />
              <Select styles={themedSelectStyles} options={countryOptions} value={countryOptions.find((opt) => opt.value === formData.country)} onChange={(selected) => setFormData({ ...formData, country: selected.value })} placeholder="Select Country..." />
              <Select styles={themedSelectStyles} options={dietTypeOptions} value={dietTypeOptions.find((opt) => opt.value.toLowerCase() === formData.diet_type?.toLowerCase())} onChange={(selected) => setFormData({ ...formData, diet_type: selected.value })} placeholder="Select Diet Type..." />
              <div className="sm:col-span-2">
                  <input name="allergies" value={formData.allergies} onChange={handleChange} placeholder="Any food allergies? (e.g., peanuts, gluten, shellfish)" className={baseInputStyles} />
              </div>
            </div>
        </section>

        <section className="space-y-6">
            <h3 className="text-xl font-['Lora'] font-semibold text-heading border-b-2 border-primary/20 pb-3">Medical History</h3>
            <div className="sm:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 text-sm text-body font-medium">
              {medicalConditions.map(({field, label}) => (
                <label key={field} className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-light transition-colors">
                  <input type="checkbox" name={field} checked={!!formData[field]} onChange={handleChange} className="h-4 w-4 rounded border-custom text-primary focus:ring-primary"/>
                  <span>{label}</span>
                </label>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-6 pt-2">
                <input name="other_chronic_condition" value={formData.other_chronic_condition} onChange={handleChange} placeholder="Other chronic conditions (if any)" className={baseInputStyles} />
                <input name="family_history" value={formData.family_history} onChange={handleChange} placeholder="Any relevant family medical history?" className={baseInputStyles} />
            </div>
        </section>

        <button
          type="submit"
          className="w-full py-3.5 px-6 rounded-lg text-light font-semibold bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 transform hover:-translate-y-1 shadow-soft hover:shadow-lg"
        >
          {isEditing ? "Save Changes" : "Create My Profile"}
        </button>
      </form>
    </div>
  );
};

export default UserProfileForm;