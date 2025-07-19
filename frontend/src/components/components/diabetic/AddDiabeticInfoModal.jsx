import React, { useEffect, useState } from "react";
import {
  createDiabeticProfile,
  getDiabeticProfile,
  updateDiabeticProfile,
} from "../../../api/diabeticApi";
import { toast } from "react-hot-toast";
import { X, Edit3, Plus, Loader } from "lucide-react";

const defaultForm = {
  date: "", weight_kg: "", height_cm: "", waist_circumference_cm: "",
  blood_pressure_systolic: "", blood_pressure_diastolic: "",
  fasting_blood_sugar: "", postprandial_sugar: "", hba1c: "",
  ldl_cholesterol: "", hdl_cholesterol: "", triglycerides: "",
  crp: "", esr: "", uric_acid: "", creatinine: "", urea: "",
  alt: "", ast: "", vitamin_d3: "", vitamin_b12: "", tsh: "",
};

// --- HELPER FUNCTIONS ---
const formatFieldName = (field) => {
  return field
    .replace(/_/g, " ")
    .replace(/\b(kg|cm|d3|b12)\b/g, match => match.toUpperCase())
    .replace(/\b(alt|ast|tsh|crp|esr|hdl|ldl)\b/g, match => match.toUpperCase())
    .replace(/\b\w/g, char => char.toUpperCase());
};

// ✅ Robust date formatting for input fields
const getLocalDateString = (date) => {
  if (!date) return "";
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(date));
};


const AddDiabeticInfoModal = ({
  isOpen,
  onClose,
  onSubmit,
  mode: initialMode = "create",
}) => {
  const [formData, setFormData] = useState(defaultForm);
  const [recordId, setRecordId] = useState(null);
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (initialMode === "create") {
      setMode("create");
      // Set today's date automatically for new reports
      setFormData({ ...defaultForm, date: getLocalDateString(new Date()) });
      setRecordId(null);
    }
    
    const fetchLatestProfileForEdit = async () => {
      try {
        const res = await getDiabeticProfile();
        const latest = res?.results?.sort((a,b) => new Date(b.report_date) - new Date(a.report_date))[0];
        if (latest) {
          const id = latest.id || latest._id;
          if (!id) return toast.error("No ID found in profile.");
          // Ensure date is correctly formatted for the input type="date"
          const formattedData = { ...latest, date: getLocalDateString(latest.report_date) };
          setFormData({ ...defaultForm, ...formattedData });
          setRecordId(id);
        } else {
          toast.error("No existing profile found to edit.");
          setMode("create"); // Revert to create mode if no profile exists
        }
      } catch (err) {
        toast.error("Failed to load diabetic info.");
      }
    };

    if (mode === "edit") {
      fetchLatestProfileForEdit();
    }
  }, [mode, isOpen, initialMode]);

  // ✅ THE FIX: Correctly destructure name and value from the event target.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData, date: getLocalDateString(formData.date) };
      
      // Filter out empty string fields before submission
      for (const key in payload) {
        if (payload[key] === "") {
          delete payload[key];
        }
      }
      
      if (mode === "edit") {
        if (!recordId) return toast.error("Profile ID missing.");
        await updateDiabeticProfile({ ...payload, id: recordId });
        toast.success("Lab Report Updated Successfully!");
      } else {
        await createDiabeticProfile(payload);
        toast.success("New Lab Report Added!");
      }
      if (onSubmit) onSubmit();
      handleClose();
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Submission failed. Please check the values.";
      toast.error(errorMessage);
    } finally { setLoading(false); }
  };

  const handleEditClick = () => setMode("edit");
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
      // Reset to initial mode to avoid stale state on next open
      setMode(initialMode);
      setFormData(defaultForm);
      setRecordId(null);
    }, 300);
  };

  useEffect(() => {
    if (isOpen) { document.body.style.overflow = "hidden"; } 
    else { document.body.style.overflow = ""; }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const animationClass = isClosing ? 'animate-fade-out-down' : 'animate-fade-in-up';

  return (
    // ... The rest of your JSX is correct and remains unchanged ...
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-bg-backdrop)] backdrop-blur-sm p-4 animate-fade-in" onClick={handleClose}>
      <div className={`bg-[var(--color-bg-surface)] p-6 rounded-2xl shadow-2xl w-full max-w-3xl mx-auto my-10 max-h-[90vh] flex flex-col ${animationClass}`} onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between pb-4 border-b-2 border-dashed border-[var(--color-border-default)]">
            <h2 className="text-xl font-[var(--font-primary)] font-bold text-[var(--color-text-strong)]">{mode === "edit" ? "Edit Lab Report" : "Add New Lab Report"}</h2>
            <button onClick={handleClose} className="p-1.5 rounded-full transition-all duration-300 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-interactive-subtle)] hover:text-[var(--color-danger-text)] hover:rotate-90"><X size={20} /></button>
        </header>
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto custom-scrollbar pr-2 -mr-2 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Object.keys(defaultForm).map((field) => (
              <div key={field} className="relative">
                <input id={field} name={field} value={formData[field] || ''} onChange={handleChange} placeholder=" " type={field === "date" ? "date" : "number"} step="any" className="peer block w-full bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] px-3 py-3 rounded-lg text-[var(--color-text-default)] transition-colors duration-300 focus:outline-none focus:border-[var(--color-primary)] placeholder-transparent" required={field === "date"} />
                <label htmlFor={field} className="absolute left-3 -top-2.5 text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-app)] px-1 transition-all duration-300 pointer-events-none peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-[var(--color-primary)]">{formatFieldName(field)}</label>
              </div>
            ))}
          </div>
        </form>
        <footer className="col-span-full flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t-2 border-dashed border-[var(--color-border-default)]">
            {mode === "create" ? (
                <button type="button" onClick={handleEditClick} className="group flex items-center gap-2 text-sm text-[var(--color-primary)] font-medium transition-transform hover:scale-105"><Edit3 size={14} className="transition-transform group-hover:-rotate-12"/> Edit Latest Instead</button>
            ) : (
                <button type="button" onClick={handleCreateClick} className="group flex items-center gap-2 text-sm text-[var(--color-primary)] font-medium transition-transform hover:scale-105"><Plus size={16} className="transition-transform group-hover:rotate-90"/> Add New Instead</button>
            )}
            <div className="flex justify-end gap-3">
                <button type="button" onClick={handleClose} className="px-5 py-2 rounded-lg border-2 border-[var(--color-border-default)] text-[var(--color-text-default)] font-semibold hover:bg-[var(--color-bg-interactive-subtle)] hover:border-[var(--color-text-muted)] transition-all duration-300 active:scale-95">Cancel</button>
                <button type="submit" onClick={handleSubmit} disabled={loading} className="flex items-center justify-center gap-2 w-36 px-6 py-2 rounded-lg font-semibold shadow-lg text-[var(--color-text-on-primary)] transition-all duration-300 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] hover:-translate-y-0.5 hover:shadow-xl active:scale-95 disabled:bg-opacity-50 disabled:cursor-not-allowed disabled:shadow-md disabled:transform-none">{loading ? <Loader size={20} className="animate-spin" /> : "Submit Report"}</button>
            </div>
        </footer>
      </div>
    </div>
  );
};

export default AddDiabeticInfoModal;