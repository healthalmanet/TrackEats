// src/pages/nutritionist/NutritionistDashboard.jsx

import React, { useState, useEffect, useCallback } from "react";
import Select from "react-select";
import {
  createUserPatient,
  getAssignedPatients,
  searchUsersByName,
  getPatientProfile,
} from "../../../api/nutritionistApi";
import { useNavigate } from "react-router-dom";
import {
  Search, UserPlus, X, ArrowRight, Loader
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const Spinner = ({ size = "w-5 h-5" }) => (
  <div className={`animate-spin rounded-full border-2 border-[var(--color-text-on-primary)]/50 border-t-[var(--color-text-on-primary)] ${size}`}></div>
);

const PageLoader = () => (
  <div className="flex flex-col items-center justify-center py-20">
    <Loader className="w-16 h-16 animate-spin text-[var(--color-primary)]" />
    <p className="mt-4 text-lg text-[var(--color-text-default)] font-[var(--font-secondary)]">Loading patients...</p>
  </div>
);

const NutritionistDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newPatient, setNewPatient] = useState({ lab_report: {} });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const perPage = 8;
  const navigate = useNavigate();

  const AVATAR_COLORS = ['var(--color-primary)', 'var(--color-accent-2-text)', 'var(--color-accent-3-text)', 'var(--color-info-text)'];
  const countryOptions = [{ value: "India", label: "India" }];
  const activityLevels = [{ value: "sedentary", label: "Sedentary" }, { value: "lightly_active", label: "Lightly Active" }, { value: "moderately_active", label: "Moderately Active" }, { value: "very_active", label: "Very Active" }, { value: "extra_active", label: "Extra Active" }];
  const goals = [{ value: "lose_weight", label: "Lose Weight" }, { value: "maintain", label: "Maintain Weight" }, { value: "gain_weight", label: "Gain Weight" }];
  const dietTypeOptions = [{ value: "vegetarian", label: "Vegetarian" }, { value: "non_vegetarian", label: "Non-Vegetarian" }, { value: "vegan", label: "Vegan" }, { value: "eggetarian", label: "Eggetarian" }];
  const genderOptions = [{ value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other" }];
  const today = new Date().toISOString().split("T")[0];

  const customSelectStyles = {
    control: (p, s) => ({ ...p, backgroundColor: 'var(--color-bg-app)', borderColor: s.isFocused ? 'var(--color-primary)' : 'var(--color-border-default)', borderWidth: '2px', boxShadow: 'none', '&:hover': { borderColor: 'var(--color-primary)' }, borderRadius: '0.75rem', padding: '0.1rem' }),
    option: (p, s) => ({ ...p, backgroundColor: s.isSelected ? 'var(--color-primary)' : s.isFocused ? 'var(--color-bg-interactive-subtle)' : 'var(--color-bg-surface)', color: s.isSelected ? 'var(--color-text-on-primary)' : 'var(--color-text-strong)', '&:active': { backgroundColor: 'var(--color-primary-hover)' }, cursor: 'pointer' }),
    menu: (p) => ({ ...p, backgroundColor: 'var(--color-bg-surface)', border: '2px solid var(--color-border-default)' }),
    placeholder: (p) => ({ ...p, color: 'var(--color-text-muted)' }),
    singleValue: (p) => ({ ...p, color: 'var(--color-text-strong)' }),
    input: (p) => ({ ...p, color: 'var(--color-text-strong)' }),
  };
  
  const fetchAllUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getAssignedPatients();
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
      setError("Failed to load patient data. Please try again later.");
      toast.error("Could not fetch patient data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

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
            return { ...user, goal: profile.goal ? profile.goal.replace(/_/g, " ") : "Not Set", date_of_birth: profile.date_of_birth || "", };
          } catch { return user; }
        })
      );
      setPatients(enhancedSearch);
      toast.success(`${enhancedSearch.length} patient(s) found.`);
    } catch (err) {
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
      fetchAllUsers();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to create patient.";
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  const handleFormChange = (e, section = null) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    if (section) {
      setNewPatient((prev) => ({ ...prev, [section]: { ...(prev[section] || {}), [name]: val }, }));
    } else {
      setNewPatient((prev) => ({ ...prev, [name]: val }));
    }
  };
  
  return (
    <div className="min-h-screen bg-[var(--color-bg-app)] font-[var(--font-primary)]">
      <Toaster position="top-right" />
      <nav className="flex justify-between items-center px-4 sm:px-6 lg:px-8 py-4 bg-[var(--color-bg-surface)] border-b border-[var(--color-border-default)] sticky top-0 z-20 shadow-lg">
        <span className="font-extrabold text-3xl tracking-wide font-[var(--font-primary)]">
          <span className="text-[var(--color-primary)]">Track</span>
          <span className="text-[var(--color-text-strong)]">Eats</span>
        </span>
        <button onClick={() => { localStorage.removeItem("token"); window.location.href = "/"; }} className="bg-[var(--color-primary)] text-[var(--color-text-on-primary)] px-5 py-2 rounded-full font-semibold transition-all hover:bg-[var(--color-primary-hover)] hover:shadow-lg hover:-translate-y-0.5">
          Logout
        </button>
      </nav>

      <main className="text-[var(--color-text-default)] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8 p-6 bg-[var(--color-bg-surface)]/50 backdrop-blur-sm border-2 border-[var(--color-border-default)] rounded-2xl">
          <h1 className="text-4xl font-bold text-[var(--color-text-strong)] font-[var(--font-secondary)]">Nutritionist Dashboard</h1>
          <p className="text-[var(--color-text-default)] mt-2 text-lg">A central hub to manage, search, and onboard your patients.</p>
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:flex-grow">
              <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input type="text" placeholder="Search patients by name..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} className="w-full pl-12 pr-4 py-3 border-2 bg-[var(--color-bg-app)] border-[var(--color-border-default)] rounded-lg text-[var(--color-text-strong)] placeholder:text-[var(--color-text-muted)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition" />
            </div>
            <button onClick={() => setShowForm(true)} className="whitespace-nowrap w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[var(--color-primary)] text-[var(--color-text-on-primary)] px-5 py-3 rounded-full font-semibold transition-all hover:bg-[var(--color-primary-hover)] hover:shadow-lg hover:-translate-y-0.5">
              <UserPlus className="text-base" />
              <span className="text-sm">Add Patient</span>
            </button>
          </div>
        </motion.header>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
              <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-[var(--color-bg-surface)] p-6 sm:p-8 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative shadow-2xl border-2 border-[var(--color-border-default)] custom-scrollbar" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-[var(--color-text-strong)] font-[var(--font-secondary)]">Add New Patient</h2>
                  <button onClick={() => setShowForm(false)} className="p-2 rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-bg-interactive-subtle)] transition-colors" aria-label="Close"><X size={20} /></button>
                </div>
                <form onSubmit={handleCreatePatient}>
                  <div className="mb-6">
                    <h3 className="font-semibold text-lg text-[var(--color-text-strong)] font-[var(--font-secondary)] border-b-2 border-dashed border-[var(--color-border-default)] pb-2 mb-6">Basic & Contact Info</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      {["full_name", "email", "password", "mobile_number"].map((field) => (
                        <input key={field} name={field} placeholder={field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} onChange={(e) => handleFormChange(e)} className="p-3 bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] text-[var(--color-text-strong)] placeholder:text-[var(--color-text-muted)]" type={field === "password" ? "password" : "text"} />
                      ))}
                      <input name="date_of_birth" placeholder="Date of Birth" onChange={(e) => handleFormChange(e)} className="p-3 bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] text-[var(--color-text-strong)] placeholder:text-[var(--color-text-muted)]" type="text" max={today} onFocus={(e) => (e.target.type = "date")} onBlur={(e) => (e.target.type = "text")} />
                      <Select styles={customSelectStyles} options={countryOptions} onChange={(selected) => setNewPatient({ ...newPatient, country: selected.value })} placeholder="Select Country..." />
                    </div>
                  </div>
                  <div className="mb-6">
                    <h3 className="font-semibold text-lg text-[var(--color-text-strong)] font-[var(--font-secondary)] border-b-2 border-dashed border-[var(--color-border-default)] pb-2 mb-6">Physical & Lifestyle</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                      {["height_cm", "weight_kg", "occupation", "bmi"].map((field) => (
                        <input key={field} name={field} placeholder={field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} onChange={(e) => handleFormChange(e)} className="p-3 bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] text-[var(--color-text-strong)] placeholder:text-[var(--color-text-muted)]" />
                      ))}
                      <Select styles={customSelectStyles} options={genderOptions} onChange={(selected) => setNewPatient({ ...newPatient, gender: selected.value })} placeholder="Select Gender..." />
                      <Select styles={customSelectStyles} options={activityLevels} onChange={(selected) => setNewPatient({ ...newPatient, activity_level: selected.value })} placeholder="Activity Level..." />
                      <Select styles={customSelectStyles} options={goals} onChange={(selected) => setNewPatient({ ...newPatient, goal: selected.value })} placeholder="Primary Goal..." />
                      <Select styles={customSelectStyles} options={dietTypeOptions} onChange={(selected) => setNewPatient({ ...newPatient, diet_type: selected.value })} placeholder="Dietary Preference..." />
                    </div>
                  </div>
                  <div className="mb-6">
                    <h3 className="font-semibold text-lg text-[var(--color-text-strong)] font-[var(--font-secondary)] border-b-2 border-dashed border-[var(--color-border-default)] pb-2 mb-6">Medical History</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      {["allergies", "family_history"].map((field) => (<input key={field} name={field} placeholder={field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} onChange={(e) => handleFormChange(e)} className="p-3 bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] text-[var(--color-text-strong)] placeholder:text-[var(--color-text-muted)]" />))}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 md:col-span-2">
                        {[{ key: "is_diabetic", label: "Diabetic" }, { key: "is_hypertensive", label: "Hypertensive" }, { key: "has_gastric_issues", label: "Gastric Issues" }, { key: "has_heart_condition", label: "Heart Condition" }, { key: "has_thyroid_disorder", label: "Thyroid Disorder" }, { key: "has_arthritis", label: "Arthritis" }].map(({ key, label }) => (<label key={key} className="flex items-center gap-2 p-3 bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] rounded-lg"><input type="checkbox" name={key} onChange={(e) => handleFormChange(e)} className="h-4 w-4 accent-[var(--color-primary)]" />{label}</label>))}
                      </div>
                      <input name="other_chronic_condition" placeholder="Other Chronic Conditions" onChange={(e) => handleFormChange(e)} className="p-3 mt-4 bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] text-[var(--color-text-strong)] placeholder:text-[var(--color-text-muted)]" />
                    </div>
                  </div>
                  <div className="mb-6">
                    <h3 className="font-semibold text-lg text-[var(--color-text-strong)] font-[var(--font-secondary)] border-b-2 border-dashed border-[var(--color-border-default)] pb-2 mb-6">Lab Report</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
                      <input name="report_date" placeholder="Report Date" onChange={(e) => handleFormChange(e, "lab_report")} className="p-3 col-span-2 md:col-span-4 bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] text-[var(--color-text-strong)] placeholder:text-[var(--color-text-muted)]" type="text" max={today} onFocus={(e) => (e.target.type = "date")} onBlur={(e) => (e.target.type = "text")} />
                      {["weight_kg", "height_cm", "waist_circumference_cm", "blood_pressure_systolic", "blood_pressure_diastolic", "fasting_blood_sugar", "postprandial_sugar", "hba1c", "ldl_cholesterol", "hdl_cholesterol", "triglycerides", "esr", "creatinine", "urea", "alt", "ast", "vitamin_d3", "vitamin_b12", "tsh", "crp", "uric_acid"].map((field) => (<input key={field} name={field} placeholder={field.replace(/_/g, " ").toLowerCase().replace(/^\w/, c => c.toUpperCase())} onChange={(e) => handleFormChange(e, "lab_report")} className="p-3 bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] text-[var(--color-text-strong)] placeholder:text-[var(--color-text-muted)]" />))}
                    </div>
                  </div>
                  <div className="flex justify-end mt-8">
                    <button type="submit" disabled={isSubmitting} className="flex items-center justify-center gap-2 bg-[var(--color-primary)] text-[var(--color-text-on-primary)] px-8 py-3 rounded-lg font-semibold transition-all hover:bg-[var(--color-primary-hover)] hover:shadow-lg hover:-translate-y-0.5 disabled:bg-opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                      {isSubmitting && <Spinner />} {isSubmitting ? "Creating..." : "Create Patient"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.2 } }}>
          <div className="flex justify-between items-baseline mb-6">
            <h2 className="text-2xl font-bold text-[var(--color-text-strong)] font-[var(--font-secondary)]">Assigned Patients</h2>
            <span className="font-semibold text-[var(--color-text-default)]">{patients.length} Total</span>
          </div>
          {isLoading ? <PageLoader />
          : error ? <div className="text-center py-20 bg-[var(--color-danger-bg-subtle)] text-[var(--color-danger-text)] border border-[var(--color-danger-text)]/20 rounded-lg"><p className="font-semibold">{error}</p></div>
          : patients.length === 0 ? (
            <div className="text-center py-20 bg-[var(--color-bg-surface)] rounded-xl border-2 border-dashed border-[var(--color-border-default)]">
              <p className="text-xl font-semibold text-[var(--color-text-strong)] font-[var(--font-secondary)]">No Patients Found</p>
              <p className="text-[var(--color-text-default)] mt-2">Try adjusting your search or add a new patient to get started.</p>
            </div>
          ) : (
            <motion.div variants={{ visible: { transition: { staggerChildren: 0.05 } } }} initial="hidden" animate="visible" className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {patients.slice((currentPage - 1) * perPage, currentPage * perPage).map((patient) => {
                  const avatarColor = AVATAR_COLORS[patient.id % AVATAR_COLORS.length];
                  const patientInitial = patient.full_name ? patient.full_name.charAt(0).toUpperCase() : "?";
                  return (
                    <motion.div key={patient.id} variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} onClick={() => navigate(`/nutritionist/patient/${patient.id}`)} className="cursor-pointer bg-[var(--color-bg-surface)] p-5 rounded-2xl border-2 border-[var(--color-border-default)] shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:border-[var(--color-primary)] hover:-translate-y-1.5 flex flex-col group relative overflow-hidden">
                      <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl text-[var(--color-text-on-primary)]" style={{ backgroundColor: avatarColor }}>{patientInitial}</div>
                          <div>
                            <h3 className="text-xl font-bold text-[var(--color-text-strong)] font-[var(--font-primary)] capitalize leading-tight">{patient.full_name}</h3>
                            <p className="text-xs text-[var(--color-text-muted)]">ID: {patient.id}</p>
                          </div>
                        </div>
                        <div className="text-sm space-y-2 text-[var(--color-text-default)] flex-grow">
                          <p><span className="font-semibold text-[var(--color-text-strong)]">Age:</span> {calculateAge(patient.date_of_birth)} years</p>
                        </div>
                        <div className="mt-4 flex flex-col items-start gap-2">
                          <p className="text-xs font-semibold text-[var(--color-text-default)]">Goal</p>
                          <span className="inline-block bg-[var(--color-primary-bg-subtle)] text-[var(--color-primary)] text-xs font-semibold px-2.5 py-1 rounded-full capitalize">{patient.goal}</span>
                        </div>
                        <div className="border-t-2 border-dashed border-[var(--color-border-default)] mt-4 pt-3 flex justify-end items-center">
                          <span className="text-xs font-semibold text-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1">View Details <ArrowRight size={10} /></span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </motion.div>
          )}
        </motion.section>

        {patients.length > perPage && (
          <div className="flex justify-center items-center mt-10 gap-4">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="px-4 py-2 rounded-lg bg-[var(--color-bg-interactive-subtle)] border-2 border-[var(--color-border-default)] text-[var(--color-text-default)] font-semibold transition-all hover:bg-[var(--color-bg-surface)] hover:border-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed" disabled={currentPage === 1}>Previous</button>
            <span className="text-sm font-semibold text-[var(--color-text-strong)]">Page {currentPage} of {Math.ceil(patients.length / perPage)}</span>
            <button onClick={() => setCurrentPage((p) => p * perPage < patients.length ? p + 1 : p)} className="px-4 py-2 rounded-lg bg-[var(--color-bg-interactive-subtle)] border-2 border-[var(--color-border-default)] text-[var(--color-text-default)] font-semibold transition-all hover:bg-[var(--color-bg-surface)] hover:border-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed" disabled={currentPage * perPage >= patients.length}>Next</button>
          </div>
        )}
      </main>
    </div>
  );
};
export default NutritionistDashboard;