import React, { useEffect, useState, useRef } from "react";
// Import Link for navigation
import { useParams, Link } from "react-router-dom";
import { getMealsByDate } from "../../../api/mealLog";
// Import react-toastify for attractive notifications
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaUser,
  FaEnvelope,
  FaVenusMars,
  FaBirthdayCake,
  FaCalendarCheck,
  FaStethoscope,
  FaUtensils,
  FaFileMedicalAlt,
  FaCheck,
  FaTimes,
  FaSave,
  FaPlus,
  FaThumbsUp,
  FaThumbsDown,
  FaBullseye,
  FaAllergies,
  FaChevronDown,
  FaSpinner, // Added for loading indicators
  FaUndo,
  FaArrowLeft, // Icon for the new back button
} from "react-icons/fa";
import {
  getPatientProfile,
  getPatientMeals,
  getDietByPatientId,
  editDiet,
  reviewDietPlan,
  submitFeedbackForML,
  generateDietPlan,
} from "../../../api/nutritionistApi";
// Removed getLabReportsInRange from imports
import {
  getLatestLabReports,
  getLabReportByDate,
  getLabReportsByMonth,
} from "../../../api/diabeticApi";

const PatientDetailsPage = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [labReports, setLabReports] = useState([]);
  const [activeTab, setActiveTab] = useState("profile");
  const [meals, setMeals] = useState([]);
  const [diets, setDiets] = useState([]); // Now holds only the currently displayed plan
  const [comment, setComment] = useState("");
  const [feedback, setFeedback] = useState("");
  const [editStates, setEditStates] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const [filteredMeals, setFilteredMeals] = useState([]);
  const [selectedMealDate, setSelectedMealDate] = useState("");
  
  // --- START: NEW STATE FOR PLAN HISTORY ---
  const [allDietPlans, setAllDietPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  // --- END: NEW STATE FOR PLAN HISTORY ---

  const [reportDate, setReportDate] = useState("");
  const [reportMonth, setReportMonth] = useState("");
  const [mealCurrentPage, setMealCurrentPage] = useState(1);
  const mealsPerPage = 5;

  const [activeLogDate, setActiveLogDate] = useState(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [isSearchingMeals, setIsSearchingMeals] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportError, setReportError] = useState("");

  const [underlineStyle, setUnderlineStyle] = useState({});
  const tabRefs = useRef([]);

  const [activeDayPerDiet, setActiveDayPerDiet] = useState({});

  const today = new Date().toISOString().split("T")[0];
  
  // This helper function finds the most recent, non-rejected plan from a list
  const findLatestValidPlan = (allPlans) => {
     if (!allPlans || allPlans.length === 0) return null;
     const nonRejected = allPlans.filter((diet) => diet.status !== "rejected");
     // Already sorted, so the first one is the latest
     return nonRejected.length > 0 ? nonRejected[0] : null;
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const [profileRes, mealsRes, dietRes] = await Promise.all([
          getPatientProfile(id),
          getPatientMeals(id),
          getDietByPatientId(id),
        ]);
        setProfile(profileRes.data.profile);
        setLabReports(
          profileRes.data.latest_lab_report
            ? [profileRes.data.latest_lab_report]
            : []
        );

        const allMeals = mealsRes.data.results || [];
        setMeals(allMeals);
        if (allMeals.length > 0) {
          const firstDate = new Date(
            allMeals.sort((a, b) => new Date(b.date) - new Date(a.date))[0].date
          ).toDateString();
          setActiveLogDate(firstDate);
        }

        // --- MODIFIED LOGIC: To handle all plans for the dropdown ---
        const allDietsData = (dietRes.data.results || []).sort(
            (a, b) => new Date(b.for_week_starting) - new Date(a.for_week_starting)
        );
        setAllDietPlans(allDietsData);

        const latestPlan = findLatestValidPlan(allDietsData);

        if (latestPlan) {
            setDiets([latestPlan]); // Display the latest valid plan by default
            setSelectedPlanId(latestPlan.id);
            const planDays = Object.keys(latestPlan.meals || {});
            if (planDays.length > 0) {
                 setActiveDayPerDiet({ [latestPlan.id]: planDays[0] });
            }
        } else {
            setDiets([]); // No valid plans found
        }
        
      } catch (err) {
        console.error("Error fetching patient details:", err);
        toast.error("Failed to load patient data.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    const activeTabRef = tabRefs.current.find(
      (ref) => ref?.dataset.tabKey === activeTab
    );
    if (activeTabRef) {
      setUnderlineStyle({
        left: activeTabRef.offsetLeft,
        width: activeTabRef.offsetWidth,
      });
    }
  }, [activeTab]);

  const calculateAge = (dob) => {
    if (!dob) return "-";
    const birthDate = new Date(dob);
    return Math.floor(
      (Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
    );
  };
  
  // NEW: Handler for the plan history dropdown
  const handlePlanChange = async (e) => {
    const newPlanId = e.target.value;
    setSelectedPlanId(newPlanId);
    
    const planToDisplay = allDietPlans.find(p => String(p.id) === String(newPlanId));

    if (planToDisplay) {
        setDiets([planToDisplay]);
        setComment(""); // Reset comment field when switching plans
    }
  };


  const handleReview = async (dietId, action) => {
    if (!comment) {
      toast.warn(
        "A comment or instruction is required to approve or reject the plan."
      );
      return;
    }
    setIsReviewing(true);
    try {
      await reviewDietPlan(dietId, action, comment);
      const updated = await getDietByPatientId(id);
      const allDietsData = (updated.data.results || []).sort(
        (a, b) => new Date(b.for_week_starting) - new Date(a.for_week_starting)
      );
      setAllDietPlans(allDietsData); // Refresh all plans
      // Re-select the currently viewed plan to update its status
      const currentlyViewedPlan = allDietsData.find(p => p.id === dietId);
      if (currentlyViewedPlan && currentlyViewedPlan.status !== 'rejected') {
        setDiets([currentlyViewedPlan]);
      } else {
        // If the reviewed plan was rejected, show the latest valid one instead
        const latestPlan = findLatestValidPlan(allDietsData);
        if (latestPlan) {
          setDiets([latestPlan]);
          setSelectedPlanId(latestPlan.id);
        } else {
          setDiets([]);
        }
      }
      setComment("");
      toast.success(`Diet plan ${action} successfully.`);
    } catch (err) {
      console.error("Review failed:", err);
      toast.error("Review submission failed.");
    } finally {
      setIsReviewing(false);
    }
  };

  const handleMealSearchByDate = async (e) => {
    const input = e.target.value;
    setSelectedMealDate(input);
    setMealCurrentPage(1);

    if (!input) {
      setFilteredMeals([]);
      setActiveLogDate(null);
      return;
    }
    setActiveLogDate(null);
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("❌ No token found in localStorage.");
      toast.error("Authentication token not found. Please log in again.");
      return;
    }

    setIsSearchingMeals(true);
    try {
      const res = await getMealsByDate(token, input);
      const results = res.data?.results || [];
      setFilteredMeals(results);
      if (results.length > 0) {
        setActiveLogDate(new Date(results[0].date).toDateString());
      } else {
        toast.info(`No meals found for ${input}.`);
      }
    } catch (err) {
      console.error("❌ Error fetching meals by date:", err);
      toast.error("Failed to fetch meals for the selected date.");
    } finally {
      setIsSearchingMeals(false);
    }
  };

  const handleLogDateClick = (date) => {
    setActiveLogDate((prevDate) => (prevDate === date ? null : date));
  };

  // --- Lab Report Fetching Logic ---
  const handleApiCall = async (apiCall, successMessage) => {
    setLoadingReport(true);
    setReportError("");
    try {
      const response = await apiCall();
      let results =
        response.results ||
        response.data?.results ||
        (Array.isArray(response) ? response : [response]);
      if (!Array.isArray(results)) {
        results = [results];
      }

      setLabReports(results);

      if (results.length > 0) {
        toast.success(successMessage || `Found ${results.length} report(s).`);
      } else {
        toast.info("No lab reports found for the selected criteria.");
        setLabReports([]);
      }
    } catch (error) {
      let errorMessage = "Could not fetch lab reports. Please try again.";
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        if (typeof errorData === "object" && errorData !== null) {
          const firstKey = Object.keys(errorData)[0];
          if (firstKey && Array.isArray(errorData[firstKey])) {
            const formattedKey = firstKey.replace(/_/g, " ");
            errorMessage = `${
              formattedKey.charAt(0).toUpperCase() + formattedKey.slice(1)
            }: ${errorData[firstKey][0]}`;
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          }
        }
      }
      setReportError(errorMessage);
      toast.error(errorMessage);
      console.error("Lab Report Fetch error:", error);
    } finally {
      setLoadingReport(false);
    }
  };

  const handleFetchByDate = () => {
    if (!reportDate) return toast.warn("Please select a date.");
    handleApiCall(
      () => getLabReportByDate(id, reportDate),
      `Report for ${reportDate} loaded.`
    );
  };

  const handleFetchByMonth = () => {
    if (!reportMonth) return toast.warn("Please select a month.");
    handleApiCall(
      () => getLabReportsByMonth(id, reportMonth),
      `Reports for ${new Date(reportMonth + "-02").toLocaleString("default", {
        month: "long",
        year: "numeric",
      })} loaded.`
    );
  };

  const handleFetchLatest = () => {
    handleApiCall(() => getLatestLabReports(id), "Latest reports loaded.");
  };

  const handleResetFilters = () => {
    setReportDate("");
    setReportMonth("");
    handleFetchLatest();
    toast.success("Filters reset.");
  };

  const handleFeedback = async (dietId, approved) => {
    setIsSubmittingFeedback(true);
    try {
      await submitFeedbackForML(dietId, feedback, approved);
      setFeedback("");
      toast.success("Feedback submitted successfully. Thank you!");
    } catch (err) {
      console.error("Feedback failed:", err);
      toast.error("Feedback submission failed.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleGenerateDiet = async () => {
    const confirmGen = window.confirm(
      "Are you sure you want to generate a new AI-powered diet plan for this patient?"
    );
    if (!confirmGen) return;
    setIsGenerating(true);
    try {
      await generateDietPlan(id);
      toast.info(
        "Diet plan generation requested! The new plan will appear here shortly."
      );
       setTimeout(async () => {
         const updated = await getDietByPatientId(id);
         const allDietsData = (updated.data.results || []).sort(
           (a, b) => new Date(b.for_week_starting) - new Date(a.for_week_starting)
         );
         setAllDietPlans(allDietsData);
         const latestPlan = findLatestValidPlan(allDietsData);
         if (latestPlan) {
            setDiets([latestPlan]);
            setSelectedPlanId(latestPlan.id);
         }
         setIsGenerating(false);
      }, 3000);
    } catch (err) {
      console.error("Diet generation failed:", err);
      toast.error("Failed to generate diet plan.");
      setIsGenerating(false);
    }
  };

  const handleSave = async (dietId, day) => {
    const updatedMeals = editStates[dietId]?.[day];
    if (!updatedMeals) {
      toast.warn("No changes to save for this day.");
      return;
    }
    setIsSaving(true);
    try {
      await editDiet(dietId, id, day, updatedMeals);
      const updated = await getDietByPatientId(id);
      const allDietsData = (updated.data.results || []).sort(
        (a, b) => new Date(b.for_week_starting) - new Date(a.for_week_starting)
      );
      setAllDietPlans(allDietsData); // Refresh full list
      const currentlyViewedPlan = allDietsData.find(p => p.id === dietId);
      if (currentlyViewedPlan) {
        setDiets([currentlyViewedPlan]);
      }
      setEditStates((prev) => {
        const newState = { ...prev };
        if (newState[dietId]) {
          delete newState[dietId][day];
        }
        return newState;
      });
      toast.success(`Diet for ${day.replace(/_/g, " ")} updated successfully!`);
    } catch (err) {
      console.error("Save failed:", err);
      toast.error("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (dietId, day, mealType, field, value) => {
    setEditStates((prev) => ({
      ...prev,
      [dietId]: {
        ...(prev[dietId] || {}),
        [day]: {
          ...(prev[dietId]?.[day] || {}),
          [mealType]: {
            ...(prev[dietId]?.[day]?.[mealType] || {}),
            [field]: value,
          },
        },
      },
    }));
  };

  const mealsToDisplay = selectedMealDate ? filteredMeals : meals;
  const mealGroups = mealsToDisplay.reduce((acc, meal) => {
    const date = new Date(meal.date).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(meal);
    return acc;
  }, {});
  const sortedMealDates = Object.keys(mealGroups).sort(
    (a, b) => new Date(b) - new Date(a)
  );
  const indexOfLastMealDay = mealCurrentPage * mealsPerPage;
  const indexOfFirstMealDay = indexOfLastMealDay - mealsPerPage;
  const currentMealDays = sortedMealDates.slice(
    indexOfFirstMealDay,
    indexOfLastMealDay
  );
  const maxMealPage = Math.ceil(sortedMealDates.length / mealsPerPage);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#FFFDF9]">
        <p className="text-xl text-[#263238] font-['Poppins']">
          Loading Patient Details...
        </p>
      </div>
    );
  }
  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#FFFDF9]">
        <p className="text-xl text-red-600 font-['Poppins']">
          Could not load patient profile. Please try again.
        </p>
      </div>
    );
  }

  const TABS = [
    { key: "profile", label: "Profile", icon: <FaUser /> },
    { key: "reports", label: "Lab Reports", icon: <FaFileMedicalAlt /> },
    { key: "meals", label: "Meal Log", icon: <FaUtensils /> },
    { key: "diet", label: "Diet Plans", icon: <FaStethoscope /> },
  ];
  const mealTypeStyles = {
    "early-morning": "bg-purple-100 text-purple-800 border-purple-200",
    breakfast: "bg-orange-100 text-orange-800 border-orange-200",
    "mid-morning snack": "bg-yellow-100 text-yellow-800 border-yellow-200",
    lunch: "bg-green-100 text-green-800 border-green-200",
    "evening snack": "bg-sky-100 text-sky-800 border-sky-200",
    dinner: "bg-indigo-100 text-indigo-800 border-indigo-200",
    uncategorized: "bg-gray-100 text-gray-800 border-gray-200",
  };
  
  const hasPendingOrApprovedPlan = allDietPlans.some(
    (diet) => diet.status === "pending" || diet.status === "approved"
  );
  
  // MODIFIED: Create a filtered list of plans for the dropdown.
  const displayablePlans = allDietPlans.filter(plan => plan.status !== 'rejected');

  return (
    <div className="min-h-screen bg-[#FFFDF9] font-['Roboto']">
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <main className="text-[#546E7A] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <header className="mb-8 p-6 bg-white rounded-2xl shadow-lg border border-[#ECEFF1] transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1.5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-[#FFEDD5] text-[#F4511E] rounded-full text-4xl">
                <FaUser />
              </div>
              <div className="flex-grow">
                <h1
                  className="text-3xl sm:text-4xl font-bold text-[#263238] font-['Poppins']"
                  style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.05)" }}
                >
                  {profile.full_name}
                </h1>
                <p className="text-lg text-[#546E7A]">Patient Overview</p>
              </div>
            </div>
            <Link
              to="/nutritionist"
              className="flex items-center gap-2 px-4 py-2 bg-white text-[#546E7A] border border-[#ECEFF1] rounded-lg font-semibold text-sm transition-all duration-300 hover:shadow-md hover:border-[#FF7043] hover:text-[#FF7043] hover:-translate-y-0.5"
            >
              <FaArrowLeft />
              Back to Dashboard
            </Link>
          </div>
          <div className="mt-6 pt-6 border-t border-[#ECEFF1] flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[#546E7A]">
            <div className="flex items-center gap-2">
              <FaEnvelope className="text-[#FF7043]" />
              {profile.email}
            </div>
            <div className="flex items-center gap-2 capitalize">
              <FaVenusMars className="text-[#FF7043]" />
              {profile.gender}
            </div>
            <div className="flex items-center gap-2">
              <FaBirthdayCake className="text-[#FF7043]" />
              {calculateAge(profile.date_of_birth)} years old
            </div>
          </div>
        </header>

        <div className="bg-white rounded-2xl border border-[#ECEFF1] shadow-xl p-4 sm:p-6 lg:p-8">
          <nav className="relative mb-8">
            <div className="flex justify-center border-b border-gray-200">
              {TABS.map((tab, index) => (
                <button
                  key={tab.key}
                  ref={(el) => (tabRefs.current[index] = el)}
                  data-tab-key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2.5 px-6 py-3 text-sm font-semibold transition-colors duration-300 outline-none ${
                    activeTab === tab.key
                      ? "text-[#FF7043]"
                      : "text-[#546E7A] hover:text-[#263238]"
                  }`}
                >
                  {tab.icon} <span>{tab.label}</span>
                </button>
              ))}
            </div>
            <div
              className="absolute bottom-0 h-0.5 bg-[#FF7043] transition-all duration-300 ease-in-out"
              style={underlineStyle}
            />
          </nav>

          <div>
            {activeTab === "profile" && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <h3 className="text-xl font-['Poppins'] font-semibold text-[#263238]">
                    Core Statistics
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { label: "Height", value: `${profile.height_cm} cm` },
                      { label: "Weight", value: `${profile.weight_kg} kg` },
                      { label: "BMI", value: profile.bmi?.toFixed(1) || "N/A" },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="bg-[#FFFDF9] border border-[#ECEFF1] rounded-lg p-4 text-center transition-all hover:shadow-lg hover:-translate-y-1"
                      >
                        <p className="text-xs text-[#546E7A] font-semibold uppercase">
                          {s.label}
                        </p>
                        <p className="text-2xl font-bold font-['Poppins'] text-[#263238] mt-1">
                          {s.value}
                        </p>
                      </div>
                    ))}
                  </div>
                  <h3 className="text-xl font-['Poppins'] font-semibold text-[#263238] pt-4 border-t border-gray-200">
                    Goals & Preferences
                  </h3>
                  <div className="space-y-4">
                    {[
                      {
                        icon: <FaBullseye />,
                        label: "Primary Goal",
                        value: profile.goal?.replace(/_/g, " ") || "Not Set",
                      },
                      {
                        icon: <FaUtensils />,
                        label: "Dietary Preference",
                        value: profile.diet_type || "Not Set",
                      },
                      {
                        icon: <FaAllergies />,
                        label: "Allergies",
                        value: profile.allergies || "None Reported",
                      },
                    ].map((p) => (
                      <div
                        key={p.label}
                        className="flex items-center gap-4 bg-[#FFFDF9] border border-[#ECEFF1] p-4 rounded-lg"
                      >
                        <span className="text-xl text-[#FF7043]">{p.icon}</span>
                        <div>
                          <p className="text-sm text-[#546E7A]">{p.label}</p>
                          <p className="capitalize font-semibold text-[#263238]">
                            {p.value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-6">
                  <h3 className="text-xl font-['Poppins'] font-semibold text-[#263238]">
                    Medical Summary
                  </h3>
                  <div className="bg-[#FFFDF9] border border-[#ECEFF1] p-4 rounded-lg">
                    <p className="text-sm text-[#546E7A] font-semibold mb-2">
                      Reported Chronic Conditions
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {profile.is_diabetic && (
                        <div className="flex items-center gap-1.5">
                          <FaCheck className="text-green-500 text-xs" />
                          Diabetes
                        </div>
                      )}
                      {profile.is_hypertensive && (
                        <div className="flex items-center gap-1.5">
                          <FaCheck className="text-green-500 text-xs" />
                          Hypertension
                        </div>
                      )}
                      {!profile.is_diabetic && !profile.is_hypertensive && (
                        <p>None Reported</p>
                      )}
                    </div>
                  </div>
                  <div className="bg-[#FFFDF9] border border-[#ECEFF1] p-4 rounded-lg">
                    <p className="text-sm text-[#546E7A] font-semibold mb-2">
                      Family Medical History
                    </p>
                    <p className="text-sm text-[#263238] whitespace-pre-wrap">
                      {profile.family_history || "None Reported"}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "reports" && (
              <div>
                <h2 className="text-2xl font-bold font-['Poppins'] text-[#263238] mb-4">
                  Lab Reports
                </h2>
                <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-200 mb-6 space-y-4">
                  <h3 className="text-lg font-['Poppins'] font-semibold text-gray-800">
                    Filter Reports
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 items-end">
                    <div className="flex items-end gap-2">
                      <div className="flex-grow">
                        <label className="text-xs font-semibold text-gray-600 block mb-1">
                          By Specific Date
                        </label>
                        <input
                          type="date"
                          value={reportDate}
                          onChange={(e) => setReportDate(e.target.value)}
                          max={today}
                          className="w-full border border-[#ECEFF1] px-3 py-2 rounded-md text-sm bg-white focus:ring-1 focus:ring-[#FF7043]"
                        />
                      </div>
                      <button
                        onClick={handleFetchByDate}
                        disabled={loadingReport}
                        className="px-4 py-2 bg-[#FF7043] text-white rounded-md text-sm font-semibold hover:bg-[#F4511E] transition disabled:bg-gray-300"
                      >
                        Search
                      </button>
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-grow">
                        <label className="text-xs font-semibold text-gray-600 block mb-1">
                          By Month
                        </label>
                        <input
                          type="month"
                          value={reportMonth}
                          onChange={(e) => setReportMonth(e.target.value)}
                          max={today.slice(0, 7)}
                          className="w-full border border-[#ECEFF1] px-3 py-2 rounded-md text-sm bg-white focus:ring-1 focus:ring-[#FF7043]"
                        />
                      </div>
                      <button
                        onClick={handleFetchByMonth}
                        disabled={loadingReport}
                        className="px-4 py-2 bg-[#FF7043] text-white rounded-md text-sm font-semibold hover:bg-[#F4511E] transition disabled:bg-gray-300"
                      >
                        Search
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-200">
                   
                    <button
                      onClick={handleResetFilters}
                      disabled={loadingReport}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-md text-sm font-semibold hover:bg-gray-600 transition disabled:bg-gray-300"
                    >
                      <FaUndo /> Reset
                    </button>
                  </div>
                </div>
                {loadingReport ? (
                  <div className="flex justify-center items-center py-10">
                    <FaSpinner className="animate-spin text-4xl text-[#FF7043]" />
                  </div>
                ) : labReports.length > 0 ? (
                  <div className="space-y-8">
                    {labReports.map((report) => (
                      <div
                        key={report.id}
                        className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm"
                      >
                        <h4 className="text-lg font-bold font-['Poppins'] text-[#263238] mb-4 pb-3 border-b border-gray-200">
                          Report Date:{" "}
                          {new Date(
                            report.report_date + "T00:00:00"
                          ).toLocaleDateString()}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {Object.entries(report).map(([key, value]) => {
                            if (["id", "patient", "report_date"].includes(key))
                              return null;
                            return (
                              <div
                                key={key}
                                className="bg-[#FFFDF9] border border-[#ECEFF1] rounded-lg p-3 transition-all hover:shadow-md hover:border-[#FF7043]"
                              >
                                <p className="text-xs font-semibold text-[#546E7A] uppercase tracking-wider">
                                  {key.replace(/_/g, " ")}
                                </p>
                                <p className="text-2xl font-bold text-[#263238] mt-1">
                                  {value || "—"}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-[#FFFDF9] rounded-lg border-2 border-dashed border-[#ECEFF1]">
                    <p className="text-[#546E7A]">
                      No lab reports found for this patient or filter criteria.
                    </p>
                  </div>
                )}
              </div>
            )}
            {activeTab === "meals" && (
              <div>
                <h2 className="text-2xl font-bold font-['Poppins'] text-[#263238] mb-6">
                  Patient Meal Log
                </h2>
                <div className="mb-6 flex items-center gap-4">
                  <label
                    htmlFor="mealDate"
                    className="text-sm font-semibold text-[#546E7A]"
                  >
                    Filter by Date:
                  </label>
                  <input
                    type="date"
                    value={selectedMealDate}
                    onChange={handleMealSearchByDate}
                    max={new Date().toISOString().split("T")[0]}
                    className="border border-gray-300 rounded-md p-2"
                  />
                  {isSearchingMeals && (
                    <FaSpinner className="animate-spin text-gray-500" />
                  )}
                  {selectedMealDate && !isSearchingMeals && (
                    <button
                      onClick={() => {
                        setSelectedMealDate("");
                        setFilteredMeals([]);
                        setMealCurrentPage(1);
                      }}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {sortedMealDates.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {currentMealDays.map((date) => {
                        const mealsForDay = mealGroups[date];
                        const isActive = activeLogDate === date;
                        return (
                          <div
                            key={date}
                            className="border border-gray-200/80 bg-white rounded-xl shadow-sm transition-all duration-300 ease-in-out hover:shadow-md hover:border-[#FF7043]/50"
                          >
                            <button
                              onClick={() => handleLogDateClick(date)}
                              className="w-full flex justify-between items-center p-4"
                            >
                              <div className="flex items-center gap-4">
                                <FaCalendarCheck
                                  className={`text-xl ${
                                    isActive
                                      ? "text-[#FF7043]"
                                      : "text-gray-400"
                                  }`}
                                />
                                <h3 className="font-bold font-['Poppins'] text-lg text-left text-[#263238]">
                                  {date}
                                </h3>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="hidden sm:inline-block bg-[#FFEDD5] text-[#F4511E] text-xs font-bold px-2.5 py-1 rounded-full">
                                  {mealsForDay.length} items logged
                                </span>
                                <FaChevronDown
                                  className={`transform transition-transform duration-300 text-gray-500 ${
                                    isActive ? "rotate-180 text-[#FF7043]" : ""
                                  }`}
                                />
                              </div>
                            </button>

                            <div
                              className={`transition-[max-height,padding] duration-500 ease-in-out overflow-hidden ${
                                isActive ? "max-h-screen" : "max-h-0"
                              }`}
                            >
                              <div className="pb-4 px-4">
                                <div className="border-t pt-4">
                                  <table className="min-w-full text-sm align-middle">
                                    <thead className="bg-[#FFFDF9]">
                                      <tr>
                                        <th
                                          scope="col"
                                          className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold uppercase text-[#546E7A] sm:pl-6"
                                        >
                                          Meal Type
                                        </th>
                                        <th
                                          scope="col"
                                          className="px-3 py-3.5 text-left text-xs font-semibold uppercase text-[#546E7A]"
                                        >
                                          Food Item
                                        </th>
                                        <th
                                          scope="col"
                                          className="px-3 py-3.5 text-center text-xs font-semibold uppercase text-[#546E7A]"
                                        >
                                          Quantity
                                        </th>
                                        <th
                                          scope="col"
                                          className="px-3 py-3.5 text-center text-xs font-semibold uppercase text-[#546E7A]"
                                        >
                                          Time
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {mealsForDay
                                        .sort((a, b) =>
                                          a.consumed_at && b.consumed_at
                                            ? new Date(a.consumed_at) -
                                              new Date(b.consumed_at)
                                            : 0
                                        )
                                        .map((item) => (
                                          <tr
                                              key={item.id}
                                              className="transition-all duration-300 ease-in-out hover:bg-[#FFEDD5] hover:scale-[1.01] hover:shadow-md cursor-pointer"
                                            >

                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                                              <span
                                                className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full capitalize border ${
                                                  mealTypeStyles[
                                                    item.meal_type?.toLowerCase() ||
                                                      "uncategorized"
                                                  ]
                                                }`}
                                              >
                                                {item.meal_type?.replace(
                                                  /-/g,
                                                  " "
                                                ) || "Uncategorized"}
                                              </span>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 font-semibold text-[#263238]">
                                              {item.food_item_name}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-center">
                                              {item.quantity} {item.unit}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-center">
                                              {item.consumed_at
                                                ? new Date(
                                                    item.consumed_at
                                                  ).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                  })
                                                : "N/A"}
                                            </td>
                                          </tr>
                                        ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {maxMealPage > 1 && (
                      <div className="flex justify-center items-center mt-8 gap-4">
                        <button
                          onClick={() =>
                            setMealCurrentPage((p) => Math.max(1, p - 1))
                          }
                          disabled={mealCurrentPage === 1}
                          className="px-4 py-2 rounded-md text-sm font-semibold transition bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <span className="text-sm font-semibold text-gray-700">
                          Page {mealCurrentPage} of {maxMealPage}
                        </span>
                        <button
                          onClick={() =>
                            setMealCurrentPage((p) =>
                              Math.min(maxMealPage, p + 1)
                            )
                          }
                          disabled={mealCurrentPage === maxMealPage}
                          className="px-4 py-2 rounded-md text-sm font-semibold transition bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-16 bg-[#FFFDF9] rounded-xl border-2 border-dashed border-[#ECEFF1]">
                    <p className="text-[#546E7A]">
                      No meal logs have been recorded for this patient.
                    </p>
                  </div>
                )}
              </div>
            )}
            {activeTab === "diet" && (
               <div className="space-y-6">
                <div className="bg-[#FFFDF9] border border-[#ECEFF1] p-4 rounded-xl flex flex-wrap gap-4 justify-between items-center">
                   <div>
                      <h2 className="text-xl font-['Poppins'] font-semibold text-[#263238]">
                        Diet Plan Management
                      </h2>
                    </div>

                    {/* MODIFIED: PLAN HISTORY DROPDOWN only shows non-rejected plans */}
                    {displayablePlans.length > 0 && (
                        <div className="relative">
                           <label htmlFor="plan-selector" className="text-xs font-semibold text-gray-600 absolute -top-4 left-1">View Plan History</label>
                           <select 
                                id="plan-selector" 
                                value={selectedPlanId || ''} 
                                onChange={handlePlanChange} 
                                className="appearance-none w-full sm:w-60 bg-white border border-[#ECEFF1] text-sm text-[#263238] font-semibold py-2 pl-3 pr-8 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#FF7043]"
                            >
                            {displayablePlans.map(plan => (
                                <option key={plan.id} value={plan.id}>
                                {`Plan: ${new Date(plan.for_week_starting).toLocaleDateString()} (${plan.status})`}
                                </option>
                            ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                <FaChevronDown size={12} />
                            </div>
                        </div>
                    )}
                    
                  <div
                    title={
                      hasPendingOrApprovedPlan
                        ? "Cannot generate while a plan is pending or approved."
                        : ""
                    }
                  >
                    <button
                      onClick={handleGenerateDiet}
                      disabled={hasPendingOrApprovedPlan || isGenerating}
                      className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all w-40 ${
                        hasPendingOrApprovedPlan || isGenerating
                          ? "bg-gray-300 cursor-not-allowed text-white"
                          : "bg-[#FF7043] text-white hover:bg-[#F4511E] hover:shadow-md hover:-translate-y-0.5"
                      }`}
                    >
                      {isGenerating ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaPlus />
                      )}
                      {isGenerating ? "Generating..." : "Generate New Plan"}
                    </button>
                  </div>
                </div>

                {diets.length > 0 ? (
                  diets.map((diet) => { 
                    const planDays = Object.keys(diet.meals || {});
                    const activeDay =
                      activeDayPerDiet[diet.id] ||
                      (planDays.length > 0 ? planDays[0] : null);

                    return (
                      <div
                        key={diet.id}
                        className="bg-white p-6 rounded-xl border border-[#ECEFF1] space-y-4 shadow-sm"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <h3 className="font-bold font-['Poppins'] text-lg text-[#263238]">
                              Week of{" "}
                              {new Date(
                                diet.for_week_starting
                              ).toLocaleDateString()}
                            </h3>
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                                diet.status === "approved"
                                  ? "bg-green-100 text-green-700"
                                  : diet.status === "pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {diet.status}
                            </span>
                          </div>
                          <button
                            onClick={() => handleSave(diet.id, activeDay)}
                            title="Save Changes for this Day"
                            disabled={isSaving}
                            className={`h-9 w-9 flex items-center justify-center rounded-full transition flex-shrink-0 ${
                              isSaving
                                ? "bg-blue-200 cursor-wait"
                                : "bg-blue-100 hover:bg-blue-200 text-blue-600"
                            }`}
                          >
                            {isSaving ? (
                              <FaSpinner className="animate-spin text-blue-600" />
                            ) : (
                              <FaSave />
                            )}
                          </button>
                        </div>
                        <div className="pt-4 border-t border-[#ECEFF1] space-y-4">
                          <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg overflow-x-auto">
                            {planDays.map((day) => (
                              <button
                                key={day}
                                onClick={() =>
                                  setActiveDayPerDiet((prev) => ({
                                    ...prev,
                                    [diet.id]: day,
                                  }))
                                }
                                className={`flex-shrink-0 px-4 py-1.5 rounded-md text-sm font-semibold transition-colors duration-200 ${
                                  activeDay === day
                                    ? "bg-white text-[#FF7043] shadow-sm"
                                    : "text-[#546E7A] hover:bg-gray-200/70"
                                }`}
                              >
                                {day.replace(/_/g, " ")}
                              </button>
                            ))}
                          </div>
                          <div>
                            {activeDay &&
                              Object.entries(diet.meals?.[activeDay] || {}).map(
                                ([mealType, mealDetails]) => (
                                  <div
                                    key={mealType}
                                    className="mb-4 bg-[#FFFDF9] p-4 rounded-lg border border-[#ECEFF1]"
                                  >
                                    <h5 className="text-md font-semibold capitalize text-[#263238] mb-3">
                                      {mealType.replace(/_/g, " ")}
                                    </h5>
                                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                      {[
                                        "food_name",
                                        "Calories",
                                        "Protein",
                                        "Carbs",
                                        "Fats",
                                        "Fiber",
                                        "Gram_Equivalent",
                                      ].map((field) => (
                                        <div key={field}>
                                          <label className="text-xs text-[#546E7A] block mb-1 font-medium">
                                            {field.replace(/_/g, " ")}
                                          </label>
                                          <input
                                            type="text"
                                            className="w-full border border-[#ECEFF1] rounded-md px-3 py-1.5 text-sm bg-white focus:ring-1 focus:ring-[#FF7043]"
                                            value={
                                              editStates[diet.id]?.[
                                                activeDay
                                              ]?.[mealType]?.[field] ??
                                              mealDetails[field] ??
                                              ""
                                            }
                                            onChange={(e) =>
                                              handleInputChange(
                                                diet.id,
                                                activeDay,
                                                mealType,
                                                field,
                                                e.target.value
                                              )
                                            }
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )
                              )}
                          </div>
                        </div>

                        {diet.status === "pending" && (
                          <div className="mt-4 pt-4 border-t border-dashed border-[#B0BEC5] bg-amber-50 p-4 rounded-lg">
                            <h4 className="text-md font-semibold text-[#263238] mb-2 font-['Poppins']">
                              Review This Plan
                            </h4>
                            <label
                              htmlFor={`comment-${diet.id}`}
                              className="text-sm text-[#546E7A] mb-1 block"
                            >
                              Add a comment or instruction for the patient
                              (required):
                            </label>
                            <textarea
                              id={`comment-${diet.id}`}
                              placeholder="e.g., 'Let's try this for a week and monitor your blood sugar levels.'"
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              className="w-full border border-[#ECEFF1] rounded-md px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#FF7043] min-h-[70px]"
                              rows="3"
                            />
                            <div className="flex items-center gap-3 mt-3">
                              <button
                                onClick={() =>
                                  handleReview(diet.id, "rejected")
                                }
                                disabled={isReviewing}
                                className={`flex items-center justify-center gap-2 px-4 py-2 w-28 rounded-md transition text-sm font-semibold shadow-md ${
                                  isReviewing
                                    ? "bg-red-300 cursor-wait text-white"
                                    : "bg-red-500 hover:bg-red-600 text-white"
                                }`}
                              >
                                {isReviewing ? (
                                  <FaSpinner className="animate-spin" />
                                ) : (
                                  <FaTimes />
                                )}{" "}
                                Reject
                              </button>
                              <button
                                onClick={() =>
                                  handleReview(diet.id, "approved")
                                }
                                disabled={isReviewing}
                                className={`flex items-center justify-center gap-2 px-4 py-2 w-28 rounded-md transition text-sm font-semibold shadow-md ${
                                  isReviewing
                                    ? "bg-green-300 cursor-wait text-white"
                                    : "bg-green-500 hover:bg-green-600 text-white"
                                }`}
                              >
                                {isReviewing ? (
                                  <FaSpinner className="animate-spin" />
                                ) : (
                                  <FaCheck />
                                )}{" "}
                                Approve
                              </button>
                            </div>
                          </div>
                        )}

                        {diet.status === "approved" && (
                          <div className="mt-4 pt-4 border-t border-dashed border-[#B0BEC5] bg-sky-50 p-4 rounded-lg">
                            <h4 className="text-md font-semibold text-[#263238] mb-2 font-['Poppins']">
                              AI Model Feedback
                            </h4>
                            <p className="text-xs text-[#546E7A] mb-2">
                              Was this AI-generated plan helpful? Your feedback
                              improves our system.
                            </p>
                            <textarea
                              placeholder="Optional: Provide specific feedback..."
                              value={feedback}
                              onChange={(e) => setFeedback(e.target.value)}
                              disabled={isSubmittingFeedback}
                              className="w-full border border-[#ECEFF1] rounded-md px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#FF7043] min-h-[60px]"
                              rows="2"
                            />
                            <div className="flex items-center gap-3 mt-3">
                              <button
                                onClick={() => handleFeedback(diet.id, false)}
                                disabled={isSubmittingFeedback}
                                className={`flex items-center justify-center gap-2 px-3 py-2 w-32 rounded-md transition text-sm font-semibold ${
                                  isSubmittingFeedback
                                    ? "bg-red-200 cursor-wait text-red-700"
                                    : "bg-red-100 hover:bg-red-200 text-red-700"
                                }`}
                              >
                                {isSubmittingFeedback ? (
                                  <FaSpinner className="animate-spin" />
                                ) : (
                                  <FaThumbsDown />
                                )}{" "}
                                Not Helpful
                              </button>
                              <button
                                onClick={() => handleFeedback(diet.id, true)}
                                disabled={isSubmittingFeedback}
                                className={`flex items-center justify-center gap-2 px-3 py-2 w-32 rounded-md transition text-sm font-semibold ${
                                  isSubmittingFeedback
                                    ? "bg-green-200 cursor-wait text-green-700"
                                    : "bg-green-100 hover:bg-green-200 text-green-700"
                                }`}
                              >
                                {isSubmittingFeedback ? (
                                  <FaSpinner className="animate-spin" />
                                ) : (
                                  <FaThumbsUp />
                                )}{" "}
                                Helpful
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-[#ECEFF1]">
                    <p className="text-[#546E7A]">
                      No diet plans available for this patient. Generate a new one to get
                      started.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientDetailsPage;