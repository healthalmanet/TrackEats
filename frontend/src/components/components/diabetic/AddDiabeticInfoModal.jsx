import React, { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import {
  createDiabeticProfile,
  getDiabeticProfile,
  updateDiabeticProfile,
} from "../../../api/diabeticApi";
import { toast } from "react-hot-toast";
import { X, Edit3, Plus, Loader } from "lucide-react";

// Default form state
const defaultForm = {
  date: "",
  weight_kg: "",
  height_cm: "",
  waist_circumference_cm: "",
  blood_pressure_systolic: "",
  blood_pressure_diastolic: "",
  fasting_blood_sugar: "",
  postprandial_sugar: "",
  hba1c: "",
  ldl_cholesterol: "",
  hdl_cholesterol: "",
  triglycerides: "",
  crp: "",
  esr: "",
  uric_acid: "",
  creatinine: "",
  urea: "",
  alt: "",
  ast: "",
  vitamin_d3: "",
  vitamin_b12: "",
  tsh: "",
};

// --- HELPER FUNCTIONS ---
const formatFieldName = (field) =>
  field
    .replace(/_/g, " ")
    .replace(/\b(kg|cm|d3|b12)\b/gi, (match) => match.toUpperCase())
    .replace(/\b(alt|ast|tsh|crp|esr|hdl|ldl)\b/gi, (match) => match.toUpperCase())
    .replace(/\b\w/g, (char) => char.toUpperCase());

// Robust date formatting for input fields
const getLocalDateString = (date) => {
  if (!date || isNaN(new Date(date).getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
};

const AddDiabeticInfoModal = ({ isOpen, onClose, onSubmit, initialMode = "create" }) => {
  const [formData, setFormData] = useState(defaultForm);
  const [recordId, setRecordId] = useState(null);
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const fetchLatestProfileForEdit = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDiabeticProfile();
      const latest = res?.results?.sort((a, b) => new Date(b.report_date) - new Date(a.report_date))[0];
      
      // For debugging: Check if the API keys match your form fields
      // console.log("Latest API data:", latest);

      if (latest) {
        const id = latest.id || latest._id;
        if (!id) {
          toast.error("No ID found in profile.");
          setMode("create");
          setFormData({ ...defaultForm, date: getLocalDateString(new Date()) });
          return;
        }

        // *** FIX #1: ROBUST DATA MAPPING ***
        // Create a new object to guarantee keys match the form state.
        const populatedForm = {};
        for (const key of Object.keys(defaultForm)) {
          if (key === 'date') {
            // Special handling for the date field
            populatedForm.date = getLocalDateString(latest.report_date);
          } else if (latest[key] !== null && latest[key] !== undefined) {
            // For all other fields, use the value from 'latest' if it exists.
            populatedForm[key] = latest[key];
          } else {
            // Otherwise, keep it as an empty string.
            populatedForm[key] = "";
          }
        }
        
        setFormData(populatedForm);
        setRecordId(id);
      } else {
        toast.error("No existing profile found to edit.");
        setMode("create");
        setFormData({ ...defaultForm, date: getLocalDateString(new Date()) });
      }
    } catch (err) {
      toast.error("Failed to load diabetic info.");
      setMode("create");
      setFormData({ ...defaultForm, date: getLocalDateString(new Date()) });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setFormData(defaultForm);
      setRecordId(null);
      setMode(initialMode);
      return;
    }
    if (initialMode === "create") {
      setMode("create");
      setFormData({ ...defaultForm, date: getLocalDateString(new Date()) });
      setRecordId(null);
    } else if (initialMode === "edit") {
      fetchLatestProfileForEdit();
    }
  }, [isOpen, initialMode, fetchLatestProfileForEdit]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date) {
      toast.error("Date is required.");
      return;
    }
    setLoading(true);
    try {
      const payload = { ...formData };
      for (const key in payload) {
        if (payload[key] === "" || payload[key] === null) {
          delete payload[key];
        }
      }
      payload.report_date = payload.date;
      delete payload.date;

      if (mode === "edit") {
        if (!recordId) {
          toast.error("Profile ID missing.");
          setLoading(false);
          return;
        }
        await updateDiabeticProfile({ ...payload, id: recordId });
        toast.success("Lab Report Updated Successfully!");
      } else {
        await createDiabeticProfile(payload);
        toast.success("New Lab Report Added!");
      }
      onSubmit?.();
      handleClose();
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Submission failed. Please check the values.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setMode("edit");
    fetchLatestProfileForEdit();
  };

  const handleCreateClick = () => {
    setMode("create");
    setFormData({ ...defaultForm, date: getLocalDateString(new Date()) });
    setRecordId(null);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setMode(initialMode);
      setFormData(defaultForm);
      setRecordId(null);
    }, 300);
  };

  if (!isOpen) return null;
  const animationClass = isClosing ? "animate-fade-out-down" : "animate-fade-in-up";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-bg-backdrop)] backdrop-blur-sm p-4 animate-fade-in"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={`bg-[var(--color-bg-surface)] p-6 rounded-2xl shadow-2xl w-full max-w-3xl mx-auto my-10 max-h-[90vh] flex flex-col ${animationClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between pb-4 border-b-2 border-dashed border-[var(--color-border-default)]">
          <h2 id="modal-title" className="text-xl font-[var(--font-primary)] font-bold text-[var(--color-text-strong)]">
            {mode === "edit" ? "Edit Lab Report" : "Add New Lab Report"}
          </h2>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full transition-all duration-300 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-interactive-subtle)] hover:text-[var(--color-danger-text)] hover:rotate-90"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </header>
        <form onSubmit={handleSubmit} className="flex-grow flex flex-col overflow-y-hidden">
          <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 -mr-2 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Object.keys(defaultForm).map((field) => (
                <div key={field} className="relative">
                  <input
                    id={field}
                    name={field}
                    // *** FIX #2: CORRECT VALUE BINDING ***
                    // Use `??` to handle null/undefined correctly without affecting the number 0.
                    value={formData[field] ?? ""}
                    onChange={handleChange}
                    placeholder=" "
                    type={field === "date" ? "date" : "number"}
                    step="any"
                    className="peer block w-full bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] px-3 py-3 rounded-lg text-[var(--color-text-default)] transition-colors duration-300 focus:outline-none focus:border-[var(--color-primary)] placeholder-transparent"
                    required={field === "date"}
                    aria-required={field === "date"}
                    aria-label={formatFieldName(field)}
                  />
                  <label
                    htmlFor={field}
                    className="absolute left-3 -top-2.5 text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-app)] px-1 transition-all duration-300 pointer-events-none peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-[var(--color-primary)]"
                  >
                    {formatFieldName(field)}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <footer className="col-span-full flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t-2 border-dashed border-[var(--color-border-default)]">
            {mode === "create" ? (
              <button type="button" onClick={handleEditClick} disabled={loading} className="group flex items-center gap-2 text-sm text-[var(--color-primary)] font-medium transition-transform hover:scale-105" aria-label="Edit latest report">
                <Edit3 size={14} className="transition-transform group-hover:-rotate-12" />
                Edit Latest Instead
              </button>
            ) : (
              <button type="button" onClick={handleCreateClick} disabled={loading} className="group flex items-center gap-2 text-sm text-[var(--color-primary)] font-medium transition-transform hover:scale-105" aria-label="Add new report">
                <Plus size={16} className="transition-transform group-hover:rotate-90" />
                Add New Instead
              </button>
            )}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={handleClose} className="px-5 py-2 rounded-lg border-2 border-[var(--color-border-default)] text-[var(--color-text-default)] font-semibold hover:bg-[var(--color-bg-interactive-subtle)] hover:border-[var(--color-text-muted)] transition-all duration-300 active:scale-95" aria-label="Cancel">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="flex items-center justify-center gap-2 w-36 px-6 py-2 rounded-lg font-semibold shadow-lg text-[var(--color-text-on-primary)] transition-all duration-300 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] hover:-translate-y-0.5 hover:shadow-xl active:scale-95 disabled:bg-opacity-50 disabled:cursor-not-allowed disabled:shadow-md disabled:transform-none" aria-label="Submit report">
                {loading ? <Loader size={20} className="animate-spin" /> : "Submit Report"}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
};

AddDiabeticInfoModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
  initialMode: PropTypes.oneOf(["create", "edit"]),
};

export default AddDiabeticInfoModal;