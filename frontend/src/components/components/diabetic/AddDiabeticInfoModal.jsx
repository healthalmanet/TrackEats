import React, { useEffect, useState } from "react";
import {
  createDiabeticProfile,
  getDiabeticProfile,
  updateDiabeticProfile,
} from "../../../api/diabeticApi";
import { toast } from "react-hot-toast";

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
        if (!id) return toast.error("No ID found in profile.");
        setFormData({ ...defaultForm, ...latest });
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const payload = {
      ...formData,
      // ✅ Ensure only date part is sent
      date: formData.date?.split("T")[0], // This strips time if any
    };

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
    console.error("Submission error:", err);
  } finally {
    setLoading(false);
  }
};


  const handleEditClick = () => setMode("edit");

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setMode("create");
      setFormData(defaultForm);
      setRecordId(null);
    }, 60000);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
      <div className="bg-[#FFFDF9] p-6 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 sm:mx-6 my-10 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-[#263238]">
          {mode === "edit" ? "Edit Lab Report" : "Add Lab Report"}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.keys(defaultForm).map((field) => (
            <input
              key={field}
              name={field}
              value={formData[field]}
              onChange={handleChange}
              placeholder={
                field === "date"
                  ? undefined
                  : field.replace(/_/g, " ").toUpperCase()
              }
              type={field === "date" ? "date" : "number"}
              step={field === "date" ? undefined : "any"}
              className="border border-gray-300 px-4 py-2 rounded-md w-full focus:ring-2 focus:ring-[#FF7043]"
              required
            />
          ))}

          <div className="col-span-full flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2 rounded-full font-medium shadow-md text-white transition duration-300 ${
                loading
                  ? "bg-orange-300 cursor-not-allowed"
                  : "bg-[#FF7043] hover:bg-[#F4511E]"
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
              className="text-sm text-[#FF7043] hover:underline font-medium"
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
