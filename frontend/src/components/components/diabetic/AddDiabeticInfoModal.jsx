import React, { useEffect, useState } from "react";
import {
  createDiabeticProfile,
  getDiabeticProfile,
  updateDiabeticProfile,
} from "../../../api/diabeticApi";
import { toast } from "react-hot-toast";

const defaultForm = {
  date: "", weight_kg: "", height_cm: "", waist_circumference_cm: "",
  blood_pressure_systolic: "", blood_pressure_diastolic: "",
  fasting_blood_sugar: "", postprandial_sugar: "", hba1c: "",
  ldl_cholesterol: "", hdl_cholesterol: "", triglycerides: "",
  crp: "", esr: "", uric_acid: "", creatinine: "", urea: "",
  alt: "", ast: "", vitamin_d3: "", vitamin_b12: "", tsh: "",
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

  useEffect(() => {
    if (isOpen && initialMode === "create") {
      setMode("create");
      setFormData(defaultForm);
      setRecordId(null);
    }
  }, [isOpen, initialMode]);

  useEffect(() => {
    const fetchLatestProfileForEdit = async () => {
      try {
        const res = await getDiabeticProfile();
        const latest = res?.results?.[res.results.length - 1];
        if (latest) {
          const id = latest.id || latest._id;
          if (!id) return toast.error("No ID found in profile.");
          setFormData({ ...defaultForm, ...latest });
          setRecordId(id);
        } else {
          toast.error("No existing profile found to edit.");
        }
      } catch (err) {
        toast.error("Failed to load diabetic info.");
      }
    };

    if (mode === "edit" && isOpen) {
      fetchLatestProfileForEdit();
    }
  }, [mode, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData, date: formData.date?.split("T")[0] };
      if (mode === "edit") {
        if (!recordId) return toast.error("Profile ID missing.");
        await updateDiabeticProfile({ ...payload, id: recordId });
        toast.success("Diabetic info updated.");
      } else {
        await createDiabeticProfile(payload);
        toast.success("Diabetic info added.");
      }
      if (onSubmit) onSubmit();
      handleClose();
    } catch (err) {
      toast.error("Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => setMode("edit");

  const handleClose = () => {
    onClose();
    // Reset form state after a delay to avoid flicker during closing animation
    setTimeout(() => {
      setMode(initialMode);
      setFormData(defaultForm);
      setRecordId(null);
    }, 300); 
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30 p-4 animate-fade-in">
      {/* Modal is styled with theme variables */}
      <div className="bg-section p-6 rounded-2xl shadow-xl w-full max-w-2xl mx-auto my-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <h2 className="text-xl font-['Lora'] font-bold mb-4 text-heading">
          {mode === "edit" ? "Edit Lab Report" : "Add Lab Report"}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.keys(defaultForm).map((field) => (
            <input
              key={field}
              name={field}
              value={formData[field]}
              onChange={handleChange}
              placeholder={field === "date" ? undefined : field.replace(/_/g, " ").toUpperCase()}
              type={field === "date" ? "date" : "number"}
              step={field === "date" ? undefined : "any"}
              // Inputs are styled with theme variables
              className="bg-main border border-custom px-4 py-3 rounded-md w-full text-body placeholder:text-body/60 focus:outline-none focus:ring-2 focus:ring-primary"
              required={field === "date"} // Only date is strictly required initially
            />
          ))}

          <div className="col-span-full flex justify-end gap-3 mt-6">
            {/* Cancel button is a secondary, outline-style button */}
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2 rounded-full border border-custom text-body font-semibold hover:bg-light transition"
            >
              Cancel
            </button>
            {/* Submit button is a primary action button */}
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-full font-semibold shadow-soft text-light transition duration-300 bg-primary hover:bg-primary-hover disabled:bg-primary/50 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>

        {mode !== "edit" && (
          <div className="mt-6 text-right">
            {/* "Edit" link uses the primary theme color */}
            <button
              onClick={handleEditClick}
              className="text-sm text-primary hover:underline font-medium"
            >
              Edit Latest Info
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddDiabeticInfoModal;