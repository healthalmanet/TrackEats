import React, { useEffect, useState } from "react";
import Select from "react-select";
import {
  createUserPatient,
  getAllUsers,
  searchUsersByName,
  getPatientProfile,
  generateDietPlan, // This import is here but not used in the dashboard, kept for context
} from "../../../api/nutritionistApi";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaUserPlus,
  FaUserCircle,
  FaTimes,
  FaArrowRight,
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

// --- Reusable Loader Components ---
const Spinner = ({ size = "w-5 h-5", color = "border-t-white" }) => (
  <div
    className={`animate-spin rounded-full border-2 border-white/50 ${color} ${size}`}
  ></div>
);

const PageLoader = () => (
  <div className="flex flex-col items-center justify-center py-20">
    <div className="w-16 h-16 animate-spin rounded-full border-4 border-t-[#FF7043] border-[#FFEDD5]"></div>
    <p className="mt-4 text-lg text-[#546E7A]">Loading patients...</p>
  </div>
);

const NutritionistDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newPatient, setNewPatient] = useState({ lab_report: {} });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // For form submission
  const [error, setError] = useState(null);
  const perPage = 8;
  const navigate = useNavigate();

  // --- Theme-aligned colors for the new dynamic avatars ---
  const AVATAR_COLORS = [
    "#FF7043",
    "#AED581",
    "#4DD0E1",
    "#FBC02D",
    "#BA68C8",
    "#7986CB",
  ];
  const countryOptions = [
    { value: "India", label: "India" },
    { value: "United States", label: "United States" },
    { value: "United Kingdom", label: "United Kingdom" },
    { value: "Canada", label: "Canada" },
    { value: "Australia", label: "Australia" },
  ];
  const activityLevels = [
    { value: "sedentary", label: "Sedentary (little or no exercise)" },
    {
      value: "lightly_active",
      label: "Lightly Active (light exercise/sports 1-3 days/week)",
    },
    {
      value: "moderately_active",
      label: "Moderately Active (moderate exercise/sports 3-5 days/week)",
    },
    {
      value: "very_active",
      label: "Very Active (hard exercise/sports 6-7 days a week)",
    },
    {
      value: "extra_active",
      label: "Extra Active (very hard exercise/physical job)",
    },
  ];
  const goals = [
    { value: "lose_weight", label: "Lose Weight" },
    { value: "maintain", label: "Maintain Weight" },
    { value: "gain_weight", label: "Gain Weight" },
  ];
  const dietTypeOptions = [
    { value: "vegetarian", label: "Vegetarian" },
    { value: "non_vegetarian", label: "Non-Vegetarian" },
    { value: "vegan", label: "Vegan" },
    { value: "eggetarian", label: "Eggetarian" },
    { value: "keto", label: "Keto" },
    { value: "other", label: "Other" },
  ];
  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ];
  const today = new Date().toISOString().split("T")[0];

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: "white",
      borderColor: state.isFocused ? "#FF7043" : "#ECEFF1",
      boxShadow: state.isFocused ? "0 0 0 1px #FF7043" : "none",
      "&:hover": { borderColor: state.isFocused ? "#FF7043" : "#FFC9B6" },
      borderRadius: "0.5rem",
      padding: "0.1rem",
      minHeight: "48px",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#FF7043"
        : state.isFocused
        ? "#FFF1E8"
        : "white",
      color: state.isSelected ? "white" : "#263238",
      "&:active": { backgroundColor: "#F4511E" },
      cursor: "pointer",
    }),
    placeholder: (provided) => ({ ...provided, color: "#90A4AE" }),
    singleValue: (provided) => ({ ...provided, color: "#263238" }),
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getAllUsers();
      const users = res.data.results || res.data;
      const enhancedUsers = await Promise.all(
        users.map(async (user) => {
          try {
            const profileRes = await getPatientProfile(user.id);
            const profile = profileRes.data.profile || {};
            return {
              ...user,
              goal: profile.goal ? profile.goal.replace(/_/g, " ") : "Not Set",
              date_of_birth: profile.date_of_birth || "",
              updated_at: profile.updated_at || user.updated_at,
              created_at: user.created_at,
            };
          } catch (error) {
            console.error("Failed to get profile for user:", user.id);
            return user;
          }
        })
      );
      setPatients(enhancedUsers);
    } catch (err) {
      console.error("Error loading users", err);
      setError("Failed to load patient data. Please try again later.");
      toast.error("Could not fetch patient data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) {
      fetchAllUsers();
      return;
    }
    setIsLoading(true);
    try {
      const res = await searchUsersByName(search);
      const searchResults = res.data.results || res.data;
      const enhancedSearch = await Promise.all(
        searchResults.map(async (user) => {
          try {
            const profileRes = await getPatientProfile(user.id);
            const profile = profileRes.data.profile || {};
            return {
              ...user,
              goal: profile.goal ? profile.goal.replace(/_/g, " ") : "Not Set",
              date_of_birth: profile.date_of_birth || "",
              updated_at: profile.updated_at || user.updated_at,
              created_at: user.created_at,
            };
          } catch {
            return user;
          }
        })
      );
      setPatients(enhancedSearch);
      toast.success(`${enhancedSearch.length} patient(s) found.`);
    } catch (err) {
      console.error("Search failed", err);
      setError("Failed to perform search.");
      toast.error("Search failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const toastId = toast.loading("Creating new patient...");

    try {
      await createUserPatient(newPatient);
      toast.success("Patient added successfully!", { id: toastId });
      setShowForm(false);
      setNewPatient({ lab_report: {} });
      fetchAllUsers(); // Refresh the list
    } catch (err) {
      console.error("Failed to create patient", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to create patient.";
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const diff = Date.now() - birthDate.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  const handleFormChange = (e, section = null) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    if (section) {
      setNewPatient((prev) => ({
        ...prev,
        [section]: { ...(prev[section] || {}), [name]: val },
      }));
    } else {
      setNewPatient((prev) => ({ ...prev, [name]: val }));
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#263238",
            color: "white",
            fontFamily: "Roboto",
          },
          success: {
            iconTheme: { primary: "#AED581", secondary: "#263238" },
          },
          error: {
            iconTheme: { primary: "#FF7043", secondary: "#263238" },
          },
        }}
      />
      <nav className="flex justify-between items-center px-4 sm:px-6 lg:px-8 py-4 bg-white shadow-md sticky top-0 z-20">
        <h1 className="text-3xl font-bold text-[#FF7043] font-['Poppins']">
          TrackEats
        </h1>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/";
          }}
          className="bg-[#FF7043] text-white px-5 py-2 rounded-full font-semibold font-['Roboto'] transition-all duration-300 ease-in-out hover:bg-[#F4511E] hover:shadow-lg hover:-translate-y-0.5"
        >
          Logout
        </button>
      </nav>

      <main className="text-[#546E7A] p-4 sm:p-6 lg:p-8 font-['Roboto'] max-w-7xl mx-auto">
        <header className="mb-8 p-6 bg-gradient-to-br from-[#FFEDD5]/30 to-transparent rounded-2xl">
          <h1
            className="text-4xl font-bold text-[#263238] font-['Poppins']"
            style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.1)" }}
          >
            Nutritionist Dashboard
          </h1>
          <p className="text-[#546E7A] mt-2 text-lg">
            A central hub to manage, search, and onboard your patients.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:flex-grow">
              <FaSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-[#546E7A]/60" />
              <input
                type="text"
                placeholder="Search patients by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-12 pr-4 py-3 border bg-white/70 border-[#ECEFF1] rounded-lg text-[#263238] placeholder:text-[#546E7A]/60 focus:ring-2 focus:ring-[#FF7043] focus:border-transparent transition"
              />
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="whitespace-nowrap w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FF7043] text-white px-5 py-3 rounded-full font-semibold transition-all duration-300 ease-in-out hover:bg-[#F4511E] hover:shadow-lg hover:-translate-y-0.5"
            >
              <FaUserPlus className="text-base" />
              <span className="text-sm">Add Patient</span>
            </button>
          </div>
        </header>

        {showForm && (
          <div
            className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center p-4"
            onClick={() => setShowForm(false)}
          >
            <div
              className="bg-[#FFFDF9] p-6 sm:p-8 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#263238] font-['Poppins']">
                  Add New Patient
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 rounded-full text-[#546E7A] hover:bg-[#ECEFF1] transition-colors"
                  aria-label="Close"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              <form onSubmit={handleCreatePatient}>
                {/* --- Form sections are unchanged --- */}
                <div className="mb-6">
                  <h3 className="font-semibold text-lg text-[#263238] font-['Poppins'] border-b-2 border-[#FFEDD5] pb-2 mb-6">
                    Basic & Contact Info
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {["full_name", "email", "password", "mobile_number"].map(
                      (field) => (
                        <input
                          key={field}
                          name={field}
                          placeholder={field
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase())}
                          onChange={(e) => handleFormChange(e)}
                          className="p-3 bg-white border border-[#ECEFF1] rounded-lg focus:ring-2 focus:ring-[#FF7043]/50 placeholder:text-[#263238]"
                          type={field === "password" ? "password" : "text"}
                        />
                      )
                    )}
                    <input
                      name="date_of_birth"
                      placeholder="Date of Birth"
                      onChange={(e) => handleFormChange(e)}
                      className="p-3 bg-white border border-[#ECEFF1] rounded-lg focus:ring-2 focus:ring-[#FF7043]/50 placeholder:text-[#263238]"
                      type="text"
                      max={today}
                      onFocus={(e) => (e.target.type = "date")}
                      onBlur={(e) => (e.target.type = "text")}
                    />
                    <Select
                      styles={customSelectStyles}
                      options={countryOptions}
                      value={countryOptions.find(
                        (opt) => opt.value === newPatient.country
                      )}
                      onChange={(selected) =>
                        setNewPatient({
                          ...newPatient,
                          country: selected.value,
                        })
                      }
                      placeholder="Select Country..."
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <h3 className="font-semibold text-lg text-[#263238] font-['Poppins'] border-b-2 border-[#FFEDD5] pb-2 mb-6">
                    Physical & Lifestyle
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                    {["height_cm", "weight_kg", "occupation", "bmi"].map(
                      (field) => (
                        <input
                          key={field}
                          name={field}
                          placeholder={field
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase())}
                          onChange={(e) => handleFormChange(e)}
                          className="p-3 bg-white border border-[#ECEFF1] rounded-lg focus:ring-2 focus:ring-[#FF7043]/50 placeholder:text-[#263238]"
                        />
                      )
                    )}
                    <Select
                      styles={customSelectStyles}
                      options={genderOptions}
                      value={genderOptions.find(
                        (opt) => opt.value === newPatient.gender
                      )}
                      onChange={(selected) =>
                        setNewPatient({ ...newPatient, gender: selected.value })
                      }
                      placeholder="Select Gender..."
                    />
                    <Select
                      styles={customSelectStyles}
                      options={activityLevels}
                      value={activityLevels.find(
                        (opt) => opt.value === newPatient.activity_level
                      )}
                      onChange={(selected) =>
                        setNewPatient({
                          ...newPatient,
                          activity_level: selected.value,
                        })
                      }
                      placeholder="Activity Level..."
                    />
                    <Select
                      styles={customSelectStyles}
                      options={goals}
                      value={goals.find((opt) => opt.value === newPatient.goal)}
                      onChange={(selected) =>
                        setNewPatient({ ...newPatient, goal: selected.value })
                      }
                      placeholder="Primary Goal..."
                    />
                    <Select
                      styles={customSelectStyles}
                      options={dietTypeOptions}
                      value={dietTypeOptions.find(
                        (opt) => opt.value === newPatient.diet_type
                      )}
                      onChange={(selected) =>
                        setNewPatient({
                          ...newPatient,
                          diet_type: selected.value,
                        })
                      }
                      placeholder="Dietary Preference..."
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <h3 className="font-semibold text-lg text-[#263238] font-['Poppins'] border-b-2 border-[#FFEDD5] pb-2 mb-6">
                    Medical History
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {["allergies", "family_history"].map((field) => (
                      <input
                        key={field}
                        name={field}
                        placeholder={field
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                        onChange={(e) => handleFormChange(e)}
                        className="p-3 bg-white border border-[#ECEFF1] rounded-lg focus:ring-2 focus:ring-[#FF7043]/50 placeholder:text-[#263238]"
                      />
                    ))}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 md:col-span-2">
                      {[
                        { key: "is_diabetic", label: "Diabetic" },
                        { key: "is_hypertensive", label: "Hypertensive" },
                        { key: "has_gastric_issues", label: "Gastric Issues" },
                        {
                          key: "has_heart_condition",
                          label: "Heart Condition",
                        },
                        {
                          key: "has_thyroid_disorder",
                          label: "Thyroid Disorder",
                        },
                        { key: "has_arthritis", label: "Arthritis" },
                      ].map(({ key, label }) => (
                        <label
                          key={key}
                          className="flex items-center gap-2 p-3 bg-white border border-[#ECEFF1] rounded-lg"
                        >
                          <input
                            type="checkbox"
                            name={key}
                            onChange={(e) => handleFormChange(e)}
                            className="h-4 w-4 accent-[#FF7043]"
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                    <input
                      name="other_chronic_condition"
                      placeholder="Other Chronic Conditions"
                      onChange={(e) => handleFormChange(e)}
                      className="p-3 mt-4 bg-white border border-[#ECEFF1] rounded-lg focus:ring-2 focus:ring-[#FF7043]/50 placeholder:text-[#263238]"
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <h3 className="font-semibold text-lg text-[#263238] font-['Poppins'] border-b-2 border-[#FFEDD5] pb-2 mb-6">
                    Lab Report
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
                    <input
                      name="report_date"
                      placeholder="Report Date"
                      onChange={(e) => handleFormChange(e, "lab_report")}
                      className="p-3 col-span-2 md:col-span-4 bg-white border border-[#ECEFF1] rounded-lg focus:ring-2 focus:ring-[#FF7043]/50"
                      type="text"
                      max={today}
                      onFocus={(e) => (e.target.type = "date")}
                      onBlur={(e) => (e.target.type = "text")}
                    />
                    {[
                      "weight_kg",
                      "height_cm",
                      "waist_circumference_cm",
                      "blood_pressure_systolic",
                      "blood_pressure_diastolic",
                      "fasting_blood_sugar",
                      "postprandial_sugar",
                      "hba1c",
                      "ldl_cholesterol",
                      "hdl_cholesterol",
                      "triglycerides",
                      "esr",
                      "creatinine",
                      "urea",
                      "alt",
                      "ast",
                      "vitamin_d3",
                      "vitamin_b12",
                      "tsh",
                      "crp",
                      "uric_acid",
                    ].map((field) => (
                      <input
                        key={field}
                        name={field}
                        placeholder={field.replace(/_/g, " ").toLowerCase().replace(/^\w/, c => c.toUpperCase())}

                        onChange={(e) => handleFormChange(e, "lab_report")}
                      className="p-3 bg-white border border-[#ECEFF1] rounded-lg focus:ring-2 focus:ring-[#FF7043]/50 p"
                      />
                    ))}
                  </div>
                </div>
                {/* --- End of form sections --- */}

                <div className="flex justify-end mt-8">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 bg-[#FF7043] text-white px-8 py-3 rounded-lg font-semibold font-['Roboto'] transition-all duration-300 ease-in-out hover:bg-[#F4511E] hover:shadow-lg hover:-translate-y-0.5 disabled:bg-[#FFC9B6] disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting && <Spinner />}
                    {isSubmitting ? "Creating..." : "Create Patient"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <section>
          <div className="flex justify-between items-baseline mb-6">
            <h2 className="text-2xl font-bold text-[#263238] font-['Poppins']">
              Assigned Patients
            </h2>
            <span className="font-semibold text-[#546E7A]">
              {patients.length} Total
            </span>
          </div>
          {isLoading ? (
            <PageLoader />
          ) : error ? (
            <div className="text-center py-20 bg-red-50 text-red-700 border border-red-200 rounded-lg">
              <p className="font-semibold">{error}</p>
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-[#ECEFF1]">
              <p className="text-xl font-semibold text-[#263238] font-['Poppins']">
                No Patients Found
              </p>
              <p className="text-[#546E7A] mt-2">
                Try adjusting your search or add a new patient to get started.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {patients
                .slice((currentPage - 1) * perPage, currentPage * perPage)
                .map((patient) => {
                  const avatarColor =
                    AVATAR_COLORS[patient.id % AVATAR_COLORS.length];
                  const patientInitial = patient.full_name
                    ? patient.full_name.charAt(0).toUpperCase()
                    : "?";

                  return (
                    <div
                      key={patient.id}
                      onClick={() =>
                        navigate(`/nutritionist/patient/${patient.id}`)
                      }
                      className="cursor-pointer bg-white p-5 rounded-2xl border border-gray-200/80 shadow-md transition-all duration-300 ease-in-out hover:shadow-xl hover:border-[#FF7043] hover:-translate-y-1.5 flex flex-col group relative overflow-hidden"
                    >
                      <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center gap-4 mb-4">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl text-white"
                            style={{ backgroundColor: avatarColor }}
                          >
                            {patientInitial}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-[#263238] font-['Poppins'] capitalize leading-tight">
                              {patient.full_name}
                            </h3>
                            <p className="text-xs text-gray-500">
                              ID: {patient.id}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm space-y-2 text-[#546E7A] flex-grow">
                          <p>
                            <span className="font-semibold text-[#263238]">
                              Age:
                            </span>{" "}
                            {calculateAge(patient.date_of_birth)} years
                          </p>
                        </div>
                        <div className="mt-4 flex flex-col items-start gap-2">
                          <p className="text-xs font-semibold text-[#546E7A]">
                            Goal
                          </p>
                          <span className="inline-block bg-[#FFEDD5] text-[#F4511E] text-xs font-semibold px-2.5 py-1 rounded-full capitalize">
                            {patient.goal}
                          </span>
                        </div>
                        <div className="border-t border-gray-200 mt-4 pt-3 flex justify-end items-center">
                          <span className="text-xs font-semibold text-[#FF7043] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1">
                            View Details <FaArrowRight size={10} />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </section>

        {patients.length > perPage && (
          <div className="flex justify-center items-center mt-10 gap-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 rounded-lg bg-white border border-[#ECEFF1] text-[#546E7A] font-semibold transition-all hover:bg-[#FF7043]/10 hover:border-[#FF7043]/50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="text-sm font-semibold text-[#263238]">
              Page {currentPage} of {Math.ceil(patients.length / perPage)}
            </span>
            <button
              onClick={() =>
                setCurrentPage((p) =>
                  p * perPage < patients.length ? p + 1 : p
                )
              }
              className="px-4 py-2 rounded-lg bg-white border border-[#ECEFF1] text-[#546E7A] font-semibold transition-all hover:bg-[#FF7043]/10 hover:border-[#FF7043]/50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage * perPage >= patients.length}
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default NutritionistDashboard;
