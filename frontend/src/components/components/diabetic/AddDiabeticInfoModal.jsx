import React, { useEffect, useState } from "react";
import {
  createDiabeticProfile,
  getDiabeticProfile,
  updateDiabeticProfile,
} from "../../../api/diabeticApi";
import { toast } from "react-hot-toast";

const defaultForm = {
  hba1c: "",
  fasting_blood_sugar: "",
  insulin_dependent: false,
  medications: "",
  diagnosis_date: "",
  diabetes_type: "type2",
  total_cholesterol: "",
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

  // Reset to fresh form on open if in create mode
  useEffect(() => {
    if (isOpen && initialMode === "create") {
      setMode("create");
      setFormData(defaultForm);
      setRecordId(null);
    }
  }, [isOpen, initialMode]);

  // Fetch existing data if in edit mode
  useEffect(() => {
    if (mode === "edit" && isOpen) {
      fetchLatestProfileForEdit();
    }
  }, [mode, isOpen]);

  const fetchLatestProfileForEdit = async () => {
    try {
      const res = await getDiabeticProfile();
      const latest = res?.results?.[res.results.length - 1];
      if (latest) {
        const id = latest.id || latest._id;
        if (!id) {
          toast.error("No ID found in profile.");
          return;
        }
        setFormData({
          hba1c: latest.hba1c || "",
          fasting_blood_sugar: latest.fasting_blood_sugar || "",
          insulin_dependent: latest.insulin_dependent || false,
          medications: latest.medications || "",
          diagnosis_date: latest.diagnosis_date || "",
          diabetes_type: latest.diabetes_type || "type2",
          total_cholesterol: latest.total_cholesterol || "",
        });
        setRecordId(id);
      } else {
        toast.error("No existing profile found.");
      }
    } catch (err) {
      toast.error("Failed to load diabetic info.");
      console.error("GET error:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "edit") {
        if (!recordId) {
          toast.error("Profile ID missing.");
          return;
        }
        await updateDiabeticProfile({ ...formData, id: recordId });
        toast.success("Diabetic info updated.");
      } else {
        await createDiabeticProfile(formData);
        toast.success("Diabetic info added.");
      }

      if (onSubmit) onSubmit();
      handleClose(); // use reset close
    } catch (err) {
      toast.error("Submission failed.");
      console.error("Submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setMode("edit");
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setMode("create");
      setFormData(defaultForm);
      setRecordId(null);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
      <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-xl mx-4 sm:mx-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          {mode === "edit" ? "Edit Diabetic Information" : "Add Diabetic Information"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="hba1c"
              value={formData.hba1c}
              onChange={handleChange}
              placeholder="HbA1c (%)"
              type="number"
              step="0.1"
              className="border border-gray-300 px-4 py-2 rounded-md w-full"
              required
            />
            <input
              name="fasting_blood_sugar"
              value={formData.fasting_blood_sugar}
              onChange={handleChange}
              placeholder="Fasting Blood Sugar (mg/dL)"
              type="number"
              className="border border-gray-300 px-4 py-2 rounded-md w-full"
              required
            />
            <input
              name="total_cholesterol"
              value={formData.total_cholesterol}
              onChange={handleChange}
              placeholder="Total Cholesterol (mg/dL)"
              type="number"
              className="border border-gray-300 px-4 py-2 rounded-md w-full"
            />
            <input
              name="diagnosis_date"
              value={formData.diagnosis_date}
              onChange={handleChange}
              type="date"
              className="border border-gray-300 px-4 py-2 rounded-md w-full"
              required
            />
          </div>

          <textarea
            name="medications"
            value={formData.medications}
            onChange={handleChange}
            placeholder="Medications (optional)"
            className="border border-gray-300 px-4 py-2 rounded-md w-full resize-none"
            rows={3}
          />

          <div className="flex items-center gap-2">
            <input
              id="insulin_dependent"
              name="insulin_dependent"
              type="checkbox"
              checked={formData.insulin_dependent}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <label htmlFor="insulin_dependent" className="text-sm text-gray-700">
              Insulin Dependent
            </label>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Diabetes Type
            </label>
            <select
              name="diabetes_type"
              value={formData.diabetes_type}
              onChange={handleChange}
              className="border border-gray-300 px-4 py-2 rounded-md w-full"
            >
              <option value="type1">Type 1 Diabetes</option>
              <option value="type2">Type 2 Diabetes</option>
              <option value="prediabetes">Prediabetes</option>
              <option value="gestational">Gestational Diabetes</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2 text-white rounded-md font-medium shadow transition ${
                loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>

        {mode !== "edit" && (
          <div className="mt-6 text-right">
            <button
              onClick={handleEditClick}
              className="text-sm text-blue-600 hover:underline font-medium"
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
