import { useEffect, useState } from "react";
import {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
} from "../../api/userProfile";
import { Toaster, toast } from "react-hot-toast";
import Select from "react-select";
import React from "react";

// --- OPTIONS FOR DROPDOWNS (Unchanged) ---
const countryOptions = [
  { value: "India", label: "India" },
  { value: "United States", label: "United States" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "Canada", label: "Canada" },
  { value: "Australia", label: "Australia" },
];

const activityLevels = [
  { value: "sedentary", label: "Sedentary (little or no exercise)" },
  { value: "lightly_active", label: "Lightly Active (light exercise/sports 1-3 days/week)" },
  { value: "moderately_active", label: "Moderately Active (moderate exercise/sports 3-5 days/week)" },
  { value: "very_active", label: "Very Active (hard exercise/sports 6-7 days a week)" },
  { value: "extra_active", label: "Extra Active (very hard exercise/physical job)" }
];

const goals = [
  { value: "lose_weight", label: "Lose Weight" },
  { value: "maintain", label: "Maintain Weight" },
  { value: "gain_weight", label: "Gain Weight" }
];

const dietTypeOptions = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "non_vegetarian", label: "Non-Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "eggetarian", label: "Eggetarian" },
  { value: "keto", label: "Keto" },
  { value: "other", label: "Other" }
];

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];


// --- THEMED STYLES FOR REACT-SELECT DROPDOWNS ---
const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: 'white',
    borderColor: state.isFocused ? '#FF7043' : '#ECEFF1',
    boxShadow: state.isFocused ? '0 0 0 1px #FF7043' : 'none',
    '&:hover': {
      borderColor: state.isFocused ? '#FF7043' : '#FFC9B6',
    },
    borderRadius: '0.5rem',
    padding: '0.1rem',
    minHeight: '48px',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#FF7043' : state.isFocused ? '#FFF1E8' : 'white',
    color: state.isSelected ? 'white' : '#263238',
    '&:active': {
        backgroundColor: '#F4511E',
    },
    cursor: 'pointer',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#90A4AE',
  }),
  singleValue: (provided) => ({
      ...provided,
      color: '#263238',
  })
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
          // Sanitize boolean fields to prevent React warnings
          const sanitizedData = { ...data,
            is_diabetic: !!data.is_diabetic,
            is_hypertensive: !!data.is_hypertensive,
            has_heart_condition: !!data.has_heart_condition,
            has_thyroid_disorder: !!data.has_thyroid_disorder,
            has_arthritis: !!data.has_arthritis,
            has_gastric_issues: !!data.has_gastric_issues,
          };
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
  
  const baseInputStyles = "w-full px-4 py-2.5 bg-white border border-[#ECEFF1] rounded-lg focus:ring-1 focus:ring-[#FF7043] focus:border-[#FF7043] transition duration-200 placeholder-[#90A4AE]";
  
  const medicalConditions = [
      { field: "is_diabetic", label: "Diabetic" },
      { field: "is_hypertensive", label: "Hypertensive" },
      { field: "has_heart_condition", label: "Heart Condition" },
      { field: "has_thyroid_disorder", label: "Thyroid Disorder" },
      { field: "has_arthritis", label: "Arthritis" },
      { field: "has_gastric_issues", label: "Gastric Issues" },
  ];

  return (
    <div className="max-w-4xl mx-auto my-10 bg-[#FFFDF9] py-10 px-6 sm:px-10 rounded-2xl shadow-xl border border-[#ECEFF1] font-['Poppins'] text-[#263238]">
      <Toaster position="top-center" />
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#FF7043]" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>
          Personalize Your Profile
        </h2>
        <p className="text-md text-[#546E7A] mt-2">
          Help us understand your health and nutrition needs better.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        
        {/* --- SECTION 1: Personal Details --- */}
        <section className="space-y-6">
            <h3 className="text-xl font-semibold text-[#263238] border-b-2 border-orange-100 pb-3">Personal Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className={baseInputStyles}/>
              <Select styles={customSelectStyles} options={genderOptions} value={genderOptions.find((opt) => opt.value === formData.gender)} onChange={(selected) => setFormData({ ...formData, gender: selected.value })} placeholder="Select Gender..." />
              <input type="number" name="height_cm" value={formData.height_cm} onChange={handleChange} placeholder="Height (cm)" className={baseInputStyles}/>
              <input type="number" name="weight_kg" value={formData.weight_kg} onChange={handleChange} placeholder="Weight (kg)" className={baseInputStyles}/>
              <input type="tel" name="mobile_number" value={formData.mobile_number} onChange={handleChange} placeholder="Mobile Number" className={baseInputStyles}/>
              <input name="occupation" value={formData.occupation} onChange={handleChange} placeholder="Occupation" className={baseInputStyles}/>
            </div>
        </section>

        {/* --- SECTION 2: Lifestyle & Goals --- */}
        <section className="space-y-6">
            <h3 className="text-xl font-semibold text-[#263238] border-b-2 border-orange-100 pb-3">Lifestyle & Goals</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Select styles={customSelectStyles} options={activityLevels} value={activityLevels.find((opt) => opt.value === formData.activity_level)} onChange={(selected) => setFormData({ ...formData, activity_level: selected.value })} placeholder="Select Activity Level..."/>
              <Select styles={customSelectStyles} options={goals} value={goals.find((opt) => opt.value === formData.goal)} onChange={(selected) => setFormData({ ...formData, goal: selected.value })} placeholder="Select Your Goal..." />
              <Select styles={customSelectStyles} options={countryOptions} value={countryOptions.find((opt) => opt.value === formData.country)} onChange={(selected) => setFormData({ ...formData, country: selected.value })} placeholder="Select Country..." />
              <Select styles={customSelectStyles} options={dietTypeOptions} value={dietTypeOptions.find((opt) => opt.value.toLowerCase() === formData.diet_type?.toLowerCase())} onChange={(selected) => setFormData({ ...formData, diet_type: selected.value })} placeholder="Select Diet Type..." />
              <div className="sm:col-span-2">
                  <input name="allergies" value={formData.allergies} onChange={handleChange} placeholder="Any food allergies? (e.g., peanuts, gluten, shellfish)" className={baseInputStyles} />
              </div>
            </div>
        </section>

        {/* --- SECTION 3: Medical History --- */}
        <section className="space-y-6">
            <h3 className="text-xl font-semibold text-[#263238] border-b-2 border-orange-100 pb-3">Medical History</h3>
            <div className="sm:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 text-sm text-[#546E7A] font-medium">
              {medicalConditions.map(({field, label}) => (
                <label key={field} className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-orange-50 transition-colors">
                  <input type="checkbox" name={field} checked={!!formData[field]} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 accent-[#FF7043]"/>
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
          className="w-full py-3.5 px-6 rounded-lg text-white font-semibold bg-[#FF7043] hover:bg-[#F4511E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF7043] transition-all duration-300 transform hover:-translate-y-1 shadow-md hover:shadow-lg"
        >
          {isEditing ? "Save Changes" : "Create My Profile"}
        </button>
      </form>
    </div>
  );
};

export default UserProfileForm;