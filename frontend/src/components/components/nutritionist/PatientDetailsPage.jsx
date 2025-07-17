import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaUser, FaEnvelope, FaVenusMars, FaBirthdayCake, FaFileMedicalAlt, FaCheck, FaTimes, FaSave, FaPlus, FaThumbsUp, FaThumbsDown, FaBullseye, FaAllergies, FaChevronDown, FaSpinner, FaArrowLeft
} from "react-icons/fa";
import { Utensils, CalendarCheck, Loader } from "lucide-react";
import {
  getPatientProfile, getPatientMeals, getDietByPatientId, editDiet, reviewDietPlan,
  submitFeedbackForML, generateDietPlan, getAllLabReports, getPatientMealsByDate
} from "../../../api/nutritionistApi";
import { motion, AnimatePresence } from "framer-motion";

const PageLoader = () => (
  <div className="flex flex-col items-center justify-center py-20">
    <Loader className="w-16 h-16 animate-spin text-[var(--color-primary)]" />
    <p className="mt-4 text-lg text-[var(--color-text-default)] font-[var(--font-secondary)]">Loading Patient Details...</p>
  </div>
);

const PatientDetailsPage = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [meals, setMeals] = useState([]);
  const [filteredMeals, setFilteredMeals] = useState([]);
  const [diets, setDiets] = useState([]);
  const [comment, setComment] = useState("");
  const [feedback, setFeedback] = useState("");
  const [editStates, setEditStates] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMealDate, setSelectedMealDate] = useState("");
  const [allDietPlans, setAllDietPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [mealCurrentPage, setMealCurrentPage] = useState(1);
  const mealsPerPage = 5;
  const [activeLogDate, setActiveLogDate] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [isSearchingMeals, setIsSearchingMeals] = useState(false);
  const [underlineStyle, setUnderlineStyle] = useState({});
  const tabRefs = useRef([]);
  const [activeDayPerDiet, setActiveDayPerDiet] = useState({});
  const [allLabReportsHistory, setAllLabReportsHistory] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState('latest');
  const [labReports, setLabReports] = useState([]);
  const [loadingReport, setLoadingReport] = useState(false);
  const [planOptions, setPlanOptions] = useState([]);

  const findLatestValidPlan = (allPlans) => {
    if (!allPlans || allPlans.length === 0) return null;
    const nonRejected = allPlans.filter((diet) => diet.status !== "rejected");
    nonRejected.sort((a, b) => new Date(b.for_week_starting) - new Date(a.for_week_starting));
    return nonRejected.length > 0 ? nonRejected[0] : null;
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const [profileRes, mealsRes, dietRes, allReportsRes] = await Promise.all([
          getPatientProfile(id), getPatientMeals(id), getDietByPatientId(id), getAllLabReports(id),
        ]);

        setProfile(profileRes.data.profile);

        const allReports = (allReportsRes.data.results || []).sort((a, b) => new Date(b.report_date) - new Date(a.report_date));
        setAllLabReportsHistory(allReports);
        if (allReports.length > 0) setLabReports([allReports[0]]);

        const allMeals = mealsRes.data.results || [];
        setMeals(allMeals);
        if (allMeals.length > 0) {
          const firstDate = new Date([...allMeals].sort((a, b) => new Date(b.date) - new Date(a.date))[0].date).toDateString();
          setActiveLogDate(firstDate);
        }

        const allDietsData = (dietRes.data.results || []).sort((a, b) => new Date(b.for_week_starting) - new Date(a.for_week_starting));
        setAllDietPlans(allDietsData);
        const latestPlan = findLatestValidPlan(allDietsData);
        
        if (latestPlan) {
          setDiets([latestPlan]);
          setSelectedPlanId(latestPlan.id);
          const planDays = Object.keys(latestPlan.meals || {});
          if (planDays.length > 0) setActiveDayPerDiet({ [latestPlan.id]: planDays[0] });
          const options = [{ id: latestPlan.id, label: 'Current Active Plan' }];
          const historicalPlans = allDietsData.filter(p => p.id !== latestPlan.id && p.status !== 'rejected');
          historicalPlans.forEach(p => {
            options.push({ id: p.id, label: `Plan: ${new Date(p.for_week_starting + 'T00:00:00').toLocaleDateString()} (${p.status})` });
          });
          setPlanOptions(options);
        } else {
          setDiets([]);
          setPlanOptions([]);
        }
      } catch (err) {
        toast.error("Failed to load patient data.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    const activeTabRef = tabRefs.current.find((ref) => ref?.dataset.tabKey === activeTab);
    if (activeTabRef) {
      setUnderlineStyle({ left: activeTabRef.offsetLeft, width: activeTabRef.offsetWidth });
    }
  }, [activeTab]);

  const calculateAge = (dob) => {
    if (!dob) return "-";
    return Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  };
  
  const handleReportSelectionChange = (e) => {
    const newId = e.target.value;
    setSelectedReportId(newId);
    setLoadingReport(true);
    setTimeout(() => {
      let reportToShow = [];
      if (newId === 'latest') {
        if (allLabReportsHistory.length > 0) reportToShow = [allLabReportsHistory[0]];
      } else {
        const foundReport = allLabReportsHistory.find(report => String(report.id) === newId);
        if (foundReport) reportToShow = [foundReport];
      }
      setLabReports(reportToShow);
      setLoadingReport(false);
    }, 300);
  };

  const handlePlanChange = async (e) => {
    const newPlanId = e.target.value;
    setSelectedPlanId(newPlanId);
    const planToDisplay = allDietPlans.find(p => String(p.id) === String(newPlanId));
    if (planToDisplay) {
      setDiets([planToDisplay]);
      setComment("");
    }
  };

  const handleReview = async (dietId, action) => {
    if (action === 'rejected' && !comment) { toast.warn("A comment or instruction is required to reject a plan."); return; }
    setIsReviewing(true);
    try {
      await reviewDietPlan(dietId, action, comment);
      const updated = await getDietByPatientId(id);
      const allDietsData = (updated.data.results || []).sort((a, b) => new Date(b.for_week_starting) - new Date(a.for_week_starting));
      setAllDietPlans(allDietsData);
      const latestPlan = findLatestValidPlan(allDietsData);
      setDiets(latestPlan ? [latestPlan] : []);
      setSelectedPlanId(latestPlan ? latestPlan.id : null);
      setComment("");
      toast.success(`Diet plan ${action} successfully.`);
    } catch (err) { toast.error("Review submission failed.");
    } finally { setIsReviewing(false); }
  };

  const handleMealSearchByDate = async (e) => {
    const input = e.target.value;
    setSelectedMealDate(input);
    if (!input) { setFilteredMeals([]); setActiveLogDate(null); return; }
    setIsSearchingMeals(true);
    try {
      const res = await getPatientMealsByDate(id, input);
      setFilteredMeals(res.data?.results || []);
    } catch (err) { toast.error("Failed to fetch meals.");
    } finally { setIsSearchingMeals(false); }
  };

  const handleLogDateClick = (date) => setActiveLogDate((prev) => (prev === date ? null : date));

  const handleFeedback = async (dietId, approved) => {
    setIsSubmittingFeedback(true);
    try {
      await submitFeedbackForML(dietId, feedback, approved);
      setFeedback("");
      toast.success("Feedback submitted!");
    } catch (err) { toast.error("Feedback submission failed.");
    } finally { setIsSubmittingFeedback(false); }
  };

  const handleGenerateDiet = async () => {
    if (window.confirm("Generate a new AI diet plan? This cannot be undone.")) {
      setIsGenerating(true);
      try {
        await generateDietPlan(id);
        toast.info("Diet plan generation requested! It will appear shortly.");
        setTimeout(async () => {
          const updated = await getDietByPatientId(id);
          const allDietsData = (updated.data.results || []).sort((a, b) => new Date(b.for_week_starting) - new Date(a.for_week_starting));
          setAllDietPlans(allDietsData);
          const latestPlan = findLatestValidPlan(allDietsData);
          setDiets(latestPlan ? [latestPlan] : []);
          setSelectedPlanId(latestPlan ? latestPlan.id : null);
          setIsGenerating(false);
        }, 4000);
      } catch (err) { toast.error("Failed to generate diet plan."); setIsGenerating(false); }
    }
  };

  const handleSave = async (dietId, day) => {
    const updatedMeals = editStates[dietId]?.[day];
    if (!updatedMeals) { toast.warn("No changes to save."); return; }
    setIsSaving(true);
    try {
      await editDiet(dietId, id, day, updatedMeals);
      const updated = await getDietByPatientId(id);
      const allDietsData = (updated.data.results || []).sort((a, b) => new Date(b.for_week_starting) - new Date(a.for_week_starting));
      setAllDietPlans(allDietsData);
      const currentlyViewedPlan = allDietsData.find(p => p.id === dietId);
      if (currentlyViewedPlan) setDiets([currentlyViewedPlan]);
      setEditStates((prev) => {
        const newState = { ...prev };
        if (newState[dietId]) delete newState[dietId][day];
        return newState;
      });
      toast.success(`Diet for ${day.replace(/_/g, " ")} updated!`);
    } catch (err) { toast.error("Failed to save changes.");
    } finally { setIsSaving(false); }
  };

  const handleInputChange = (dietId, day, mealType, field, value) => {
    setEditStates((prev) => ({...prev, [dietId]: {...(prev[dietId] || {}), [day]: {...(prev[dietId]?.[day] || diet.meals[day]), [mealType]: {...(prev[dietId]?.[day]?.[mealType] || diet.meals[day][mealType]), [field]: value,},},},}));
  };
  
  const TABS = [{ key: "profile", label: "Profile", icon: <FaUser /> }, { key: "reports", label: "Lab Reports", icon: <FaFileMedicalAlt /> }, { key: "meals", label: "Meal Log", icon: <Utensils /> }, { key: "diet", label: "Diet Plans", icon: <CalendarCheck /> }];
  const mealTypeStyles = {
    "early-morning": "bg-[var(--color-accent-1-bg-subtle)] text-[var(--color-accent-1-text)] border-[var(--color-accent-1-text)]/20",
    "breakfast": "bg-[var(--color-success-bg-subtle)] text-[var(--color-success-text)] border-[var(--color-success-text)]/20",
    "mid-morning snack": "bg-[var(--color-accent-2-bg-subtle)] text-[var(--color-accent-2-text)] border-[var(--color-accent-2-text)]/20",
    "lunch": "bg-[var(--color-warning-bg-subtle)] text-[var(--color-warning-text)] border-[var(--color-warning-text)]/20",
    "afternoon snack": "bg-[var(--color-accent-3-bg-subtle)] text-[var(--color-accent-3-text)] border-[var(--color-accent-3-text)]/20",
    "dinner": "bg-[var(--color-danger-bg-subtle)] text-[var(--color-danger-text)] border-[var(--color-danger-text)]/20",
    "bedtime": "bg-[var(--color-info-bg-subtle)] text-[var(--color-info-text)] border-[var(--color-info-text)]/20",
    "uncategorized": "bg-[var(--color-bg-interactive-subtle)] text-[var(--color-text-muted)] border-[var(--color-border-default)]",
  };
  const hasPendingOrApprovedPlan = allDietPlans.some((diet) => diet.status === "pending" || diet.status === "approved");
  const mealsToDisplay = selectedMealDate ? filteredMeals : meals;
  const mealGroups = mealsToDisplay.reduce((acc, meal) => { const date = new Date(meal.date).toDateString(); if (!acc[date]) acc[date] = []; acc[date].push(meal); return acc; }, {});
  const sortedMealDates = Object.keys(mealGroups).sort((a, b) => new Date(b) - new Date(a));
  const indexOfLastMealDay = mealCurrentPage * mealsPerPage;
  const indexOfFirstMealDay = indexOfLastMealDay - mealsPerPage;
  const currentMealDays = sortedMealDates.slice(indexOfFirstMealDay, indexOfLastMealDay);
  const maxMealPage = Math.ceil(sortedMealDates.length / mealsPerPage);

  if (isLoading) return <div className="flex justify-center items-center h-screen bg-[var(--color-bg-app)]"><PageLoader /></div>;
  if (!profile) return <div className="flex justify-center items-center h-screen bg-[var(--color-bg-app)]"><p className="text-xl text-[var(--color-danger-text)]">Could not load patient profile.</p></div>;

  return (
    <div className="min-h-screen bg-[var(--color-bg-app)] font-[var(--font-primary)]">
      <ToastContainer position="top-right" autoClose={4000} theme="dark" />
      <main className="text-[var(--color-text-default)] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-6 bg-[var(--color-bg-surface)] rounded-2xl shadow-xl border-2 border-[var(--color-border-default)] transition-all hover:shadow-2xl hover:-translate-y-1.5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-[var(--color-primary-bg-subtle)] text-[var(--color-primary)] rounded-full text-4xl"><FaUser /></div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-strong)] font-[var(--font-secondary)]">{profile.full_name}</h1>
                <p className="text-lg text-[var(--color-text-default)]">Patient Overview</p>
              </div>
            </div>
            <Link to="/nutritionist" className="flex items-center gap-2 px-4 py-2 bg-[var(--color-bg-interactive-subtle)] text-[var(--color-text-default)] border-2 border-[var(--color-border-default)] rounded-lg font-semibold text-sm transition-all hover:shadow-md hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:-translate-y-0.5"><FaArrowLeft />Back to Dashboard</Link>
          </div>
          <div className="mt-6 pt-6 border-t-2 border-dashed border-[var(--color-border-default)] flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
            <div className="flex items-center gap-2"><FaEnvelope className="text-[var(--color-primary)]" />{profile.email}</div>
            <div className="flex items-center gap-2 capitalize"><FaVenusMars className="text-[var(--color-primary)]" />{profile.gender}</div>
            <div className="flex items-center gap-2"><FaBirthdayCake className="text-[var(--color-primary)]" />{calculateAge(profile.date_of_birth)} years old</div>
          </div>
        </motion.header>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }} className="bg-[var(--color-bg-surface)] rounded-2xl border-2 border-[var(--color-border-default)] shadow-xl p-4 sm:p-6 lg:p-8">
          <nav className="relative mb-8">
            <div className="flex justify-center border-b-2 border-[var(--color-border-default)]">
              {TABS.map((tab, index) => (<button key={tab.key} ref={(el) => (tabRefs.current[index] = el)} data-tab-key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-2.5 px-6 py-3 text-sm font-semibold transition-colors duration-300 outline-none ${activeTab === tab.key ? "text-[var(--color-primary)]" : "text-[var(--color-text-default)] hover:text-[var(--color-text-strong)]"}`}>{tab.icon} <span>{tab.label}</span></button>))}
            </div>
            <motion.div className="absolute bottom-0 h-0.5 bg-[var(--color-primary)]" animate={underlineStyle} transition={{ type: 'spring', stiffness: 300, damping: 25 }} />
          </nav>
          
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {activeTab === "profile" && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <h3 className="text-xl font-[var(--font-secondary)] font-semibold text-[var(--color-text-strong)]">Core Statistics</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[{ label: "Height", value: `${profile.height_cm} cm` }, { label: "Weight", value: `${profile.weight_kg} kg` }, { label: "BMI", value: profile.bmi?.toFixed(1) || "N/A" }].map((s) => (
                        <div key={s.label} className="bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] rounded-lg p-4 text-center transition-all hover:shadow-lg hover:-translate-y-1">
                          <p className="text-xs text-[var(--color-text-muted)] font-semibold uppercase">{s.label}</p>
                          <p className="text-2xl font-bold font-[var(--font-primary)] text-[var(--color-text-strong)] mt-1">{s.value}</p>
                        </div>
                      ))}
                    </div>
                    <h3 className="text-xl font-[var(--font-secondary)] font-semibold text-[var(--color-text-strong)] pt-4 border-t-2 border-dashed border-[var(--color-border-default)]">Goals & Preferences</h3>
                    <div className="space-y-4">
                      {[{ icon: <FaBullseye />, label: "Primary Goal", value: profile.goal?.replace(/_/g, " ") || "Not Set" }, { icon: <Utensils />, label: "Dietary Preference", value: profile.diet_type || "Not Set" }, { icon: <FaAllergies />, label: "Allergies", value: profile.allergies || "None Reported" }].map((p) => (
                        <div key={p.label} className="flex items-center gap-4 bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] p-4 rounded-lg">
                          <span className="text-xl text-[var(--color-primary)]">{p.icon}</span>
                          <div><p className="text-sm text-[var(--color-text-default)]">{p.label}</p><p className="capitalize font-semibold text-[var(--color-text-strong)]">{p.value}</p></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-xl font-[var(--font-secondary)] font-semibold text-[var(--color-text-strong)]">Medical Summary</h3>
                    <div className="bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] p-4 rounded-lg">
                      <p className="text-sm text-[var(--color-text-default)] font-semibold mb-2">Reported Chronic Conditions</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {profile.is_diabetic && <div className="flex items-center gap-1.5"><FaCheck className="text-[var(--color-success-text)] text-xs" />Diabetes</div>}
                        {profile.is_hypertensive && <div className="flex items-center gap-1.5"><FaCheck className="text-[var(--color-success-text)] text-xs" />Hypertension</div>}
                        {!profile.is_diabetic && !profile.is_hypertensive && <p>None Reported</p>}
                      </div>
                    </div>
                    <div className="bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] p-4 rounded-lg">
                      <p className="text-sm text-[var(--color-text-default)] font-semibold mb-2">Family Medical History</p>
                      <p className="text-sm text-[var(--color-text-strong)] whitespace-pre-wrap">{profile.family_history || "None Reported"}</p>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "reports" && (
                <div>
                    <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-[var(--font-secondary)] font-bold text-[var(--color-text-strong)]">Lab Reports</h2>
                    {allLabReportsHistory.length > 0 && (
                        <div className="relative">
                        <select id="report-selector" value={selectedReportId} onChange={handleReportSelectionChange} className="appearance-none w-full sm:w-56 bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] text-sm text-[var(--color-text-strong)] font-semibold py-2 pl-3 pr-8 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]">
                            <option value="latest">Latest Report</option>
                            {allLabReportsHistory.map(report => (<option key={report.id} value={report.id}>Report: {new Date(report.report_date + 'T00:00:00').toLocaleDateString()}</option>))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--color-text-default)]"><FaChevronDown size={12} /></div>
                        </div>
                    )}
                    </div>
                    {loadingReport ? (<div className="flex justify-center items-center py-10"><FaSpinner className="animate-spin text-4xl text-[var(--color-primary)]" /></div>) 
                    : labReports.length > 0 ? (
                    <div className="space-y-8">
                        {labReports.map((report) => (
                        <div key={report.id} className="bg-[var(--color-bg-app)] p-5 rounded-xl border-2 border-[var(--color-border-default)] shadow-sm">
                            <h4 className="text-lg font-bold font-[var(--font-secondary)] text-[var(--color-text-strong)] mb-4 pb-3 border-b-2 border-dashed border-[var(--color-border-default)]">Report Date: {new Date(report.report_date + "T00:00:00").toLocaleDateString()}</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {Object.entries(report).map(([key, value]) => {
                                if (["id", "user", "report_date"].includes(key)) return null;
                                return (
                                <div key={key} className="bg-[var(--color-bg-surface)] border-2 border-[var(--color-border-default)] rounded-lg p-3 transition-all hover:shadow-lg hover:border-[var(--color-primary)]">
                                    <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">{key.replace(/_/g, " ")}</p>
                                    <p className="text-2xl font-bold text-[var(--color-text-strong)] mt-1">{value ?? "—"}</p>
                                </div>
                                );
                            })}
                            </div>
                        </div>
                        ))}
                    </div>
                    ) : (
                    <div className="text-center py-10 bg-[var(--color-bg-app)] rounded-lg border-2 border-dashed border-[var(--color-border-default)]"><p className="text-[var(--color-text-default)]">No lab reports found.</p></div>
                    )}
                </div>
              )}
              {activeTab === "meals" && (
                <div>
                    <h2 className="text-2xl font-bold font-[var(--font-secondary)] text-[var(--color-text-strong)] mb-6">Patient Meal Log</h2>
                    <div className="mb-6 flex items-center gap-4">
                        <label htmlFor="mealDate" className="text-sm font-semibold text-[var(--color-text-default)]">Filter by Date:</label>
                        <input type="date" value={selectedMealDate} onChange={handleMealSearchByDate} max={new Date().toISOString().split("T")[0]} className="bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] rounded-md p-2 text-[var(--color-text-strong)]" />
                        {isSearchingMeals && <FaSpinner className="animate-spin text-[var(--color-primary)]" />}
                    </div>
                    {sortedMealDates.length > 0 ? (
                    <>
                        <div className="space-y-3">
                        {currentMealDays.map((date) => {
                            const mealsForDay = mealGroups[date];
                            const isActive = activeLogDate === date;
                            return (
                            <div key={date} className="border-2 border-[var(--color-border-default)] bg-[var(--color-bg-surface)] rounded-xl shadow-sm transition-all duration-300 hover:shadow-md hover:border-[var(--color-primary)]/50">
                                <button onClick={() => setActiveLogDate(prev => prev === date ? null : date)} className="w-full flex justify-between items-center p-4">
                                <div className="flex items-center gap-4"><CalendarCheck className={`text-xl ${isActive ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"}`} /><h3 className="font-bold font-[var(--font-primary)] text-lg text-left text-[var(--color-text-strong)]">{date}</h3></div>
                                <div className="flex items-center gap-4"><span className="hidden sm:inline-block bg-[var(--color-primary-bg-subtle)] text-[var(--color-primary)] text-xs font-bold px-2.5 py-1 rounded-full">{mealsForDay.length} items logged</span><FaChevronDown className={`transform transition-transform duration-300 text-[var(--color-text-muted)] ${isActive ? "rotate-180 text-[var(--color-primary)]" : ""}`} /></div>
                                </button>
                                <div className={`transition-[max-height,padding] duration-500 ease-in-out overflow-hidden ${isActive ? "max-h-screen" : "max-h-0"}`}>
                                <div className="pb-4 px-4"><div className="border-t-2 border-dashed border-[var(--color-border-default)] pt-4">
                                    <table className="min-w-full text-sm align-middle">
                                    <thead className="bg-[var(--color-bg-app)]"><tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold uppercase text-[var(--color-text-muted)] sm:pl-6">Meal Type</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase text-[var(--color-text-muted)]">Food Item</th>
                                        <th scope="col" className="px-3 py-3.5 text-center text-xs font-semibold uppercase text-[var(--color-text-muted)]">Quantity</th>
                                    </tr></thead>
                                    <tbody>
                                        {mealsForDay.map((item) => (
                                        <tr key={item.id} className="transition-colors duration-200 hover:bg-[var(--color-bg-app)]">
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6"><span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full capitalize border-2 ${mealTypeStyles[item.meal_type?.toLowerCase() || "uncategorized"]}`}>{item.meal_type?.replace(/-/g, " ") || "Uncategorized"}</span></td>
                                            <td className="whitespace-nowrap px-3 py-4 font-semibold text-[var(--color-text-strong)]">{item.food_name}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-center text-[var(--color-text-default)]">{item.quantity} {item.unit}</td>
                                        </tr>
                                        ))}
                                    </tbody>
                                    </table>
                                </div></div>
                                </div>
                            </div>
                            );
                        })}
                        </div>
                        {maxMealPage > 1 && (<div className="flex justify-center items-center mt-8 gap-4"><button onClick={() => setMealCurrentPage((p) => Math.max(1, p - 1))} disabled={mealCurrentPage === 1} className="px-4 py-2 rounded-md text-sm font-semibold transition bg-[var(--color-bg-interactive-subtle)] hover:bg-opacity-80 text-[var(--color-text-default)] disabled:opacity-50 disabled:cursor-not-allowed">Previous</button><span className="text-sm font-semibold text-[var(--color-text-default)]">Page {mealCurrentPage} of {maxMealPage}</span><button onClick={() => setMealCurrentPage((p) => Math.min(maxMealPage, p + 1))} disabled={mealCurrentPage === maxMealPage} className="px-4 py-2 rounded-md text-sm font-semibold transition bg-[var(--color-bg-interactive-subtle)] hover:bg-opacity-80 text-[var(--color-text-default)] disabled:opacity-50 disabled:cursor-not-allowed">Next</button></div>)}
                    </>
                    ) : (<div className="text-center py-16 bg-[var(--color-bg-app)] rounded-xl border-2 border-dashed border-[var(--color-border-default)]"><p className="text-[var(--color-text-default)]">No meal logs recorded.</p></div>)}
                </div>
              )}
              {activeTab === "diet" && (
                <div className="space-y-6">
                    <div className="bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] p-4 rounded-xl flex flex-wrap gap-6 justify-between items-center">
                        <h2 className="text-xl font-[var(--font-secondary)] font-semibold text-[var(--color-text-strong)]">Diet Plan Management</h2>
                        <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
                            {planOptions.length > 1 && (
                                <div>
                                    <label htmlFor="plan-selector" className="block text-sm font-medium text-[var(--color-text-default)] mb-1">View Plan:</label>
                                    <div className="relative">
                                        <select id="plan-selector" value={selectedPlanId || ''} onChange={handlePlanChange} className="appearance-none w-full sm:w-60 bg-[var(--color-bg-surface)] border-2 border-[var(--color-border-default)] text-sm text-[var(--color-text-strong)] font-semibold py-2 pl-3 pr-8 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]">
                                            {planOptions.map(plan => (<option key={plan.id} value={plan.id}>{plan.label}</option>))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--color-text-default)]"><FaChevronDown size={12} /></div>
                                    </div>
                                </div>
                            )}
                            <div title={hasPendingOrApprovedPlan ? "Cannot generate while a plan is pending or approved." : "Generate a new AI diet plan"}>
                                <button onClick={handleGenerateDiet} disabled={hasPendingOrApprovedPlan || isGenerating} className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all w-44 ${hasPendingOrApprovedPlan || isGenerating ? "bg-[var(--color-bg-interactive-subtle)] opacity-50 cursor-not-allowed text-[var(--color-text-muted)]" : "bg-[var(--color-primary)] text-[var(--color-text-on-primary)] hover:bg-[var(--color-primary-hover)] hover:shadow-lg hover:-translate-y-0.5"}`}>
                                    {isGenerating ? <FaSpinner className="animate-spin" /> : <FaPlus />} {isGenerating ? "Generating..." : "Generate New Plan"}
                                </button>
                            </div>
                        </div>
                    </div>
                    {diets.length > 0 ? (diets.map((diet) => {
                        const planDays = Object.keys(diet.meals || {});
                        const activeDay = activeDayPerDiet[diet.id] || (planDays.length > 0 ? planDays[0] : null);
                        return (
                        <div key={diet.id} className="bg-[var(--color-bg-surface)] p-6 rounded-xl border-2 border-[var(--color-border-default)] space-y-4 shadow-sm">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-3 pb-4 border-b-2 border-dashed border-[var(--color-border-default)]">
                                <div>
                                    <h3 className="text-lg font-bold font-[var(--font-secondary)] text-[var(--color-text-strong)]">Plan for week starting: {new Date(diet.for_week_starting + 'T00:00:00').toLocaleDateString()}</h3>
                                    <p className="text-sm text-[var(--color-text-muted)]">Generated by: <strong className="capitalize">{diet.generated_by || "Manual"}</strong></p>
                                </div>
                                <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${
                                    diet.status === 'approved' ? 'bg-[var(--color-success-bg-subtle)] text-[var(--color-success-text)]' :
                                    diet.status === 'pending' ? 'bg-[var(--color-warning-bg-subtle)] text-[var(--color-warning-text)]' :
                                    'bg-[var(--color-danger-bg-subtle)] text-[var(--color-danger-text)]'
                                }`}>{diet.status}</span>
                            </div>

                            {planDays.length > 0 && (
                                <div className="flex flex-wrap gap-2 border-b-2 border-[var(--color-border-default)] pb-4">
                                    {planDays.map(day => (
                                        <button key={day} onClick={() => setActiveDayPerDiet(prev => ({ ...prev, [diet.id]: day }))}
                                            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all capitalize ${activeDay === day ? 'bg-[var(--color-primary)] text-[var(--color-text-on-primary)] shadow-md' : 'bg-[var(--color-bg-app)] text-[var(--color-text-default)] hover:bg-[var(--color-bg-interactive-subtle)]'}`}>
                                            {day.replace(/_/g, ' ')}
                                        </button>
                                    ))}
                                </div>
                            )}
                            
                            {activeDay && diet.meals[activeDay] && (
                                <AnimatePresence mode="wait">
                                    <motion.div key={activeDay} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="overflow-x-auto">
                                        <table className="min-w-full text-sm">
                                            <thead className="bg-[var(--color-bg-app)]">
                                                <tr>
                                                    <th className="py-2 px-3 text-left font-semibold text-[var(--color-text-muted)]">Meal Time</th>
                                                    <th className="py-2 px-3 text-left font-semibold text-[var(--color-text-muted)]">Food Item</th>
                                                    <th className="py-2 px-3 text-left font-semibold text-[var(--color-text-muted)]">Quantity</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Object.entries(diet.meals[activeDay]).map(([mealType, meal]) => {
                                                    const currentMeal = editStates[diet.id]?.[activeDay]?.[mealType] || meal;
                                                    const isEditingThisMeal = !!editStates[diet.id]?.[activeDay]?.[mealType];
                                                    return (
                                                        <tr key={mealType} className={`border-b border-[var(--color-border-default)] ${isEditingThisMeal ? 'bg-[var(--color-primary-bg-subtle)]/50' : ''}`}>
                                                            <td className="py-3 px-3 capitalize font-semibold text-[var(--color-text-strong)]">{mealType.replace(/-/g, " ")}</td>
                                                            <td className="py-3 px-3"><input type="text" value={currentMeal.food || ''} onChange={(e) => handleInputChange(diet.id, activeDay, mealType, 'food', e.target.value)} className="w-full bg-transparent p-1 rounded-md border-2 border-transparent focus:bg-[var(--color-bg-surface)] focus:border-[var(--color-primary)] outline-none"/></td>
                                                            <td className="py-3 px-3">
                                                                <div className="flex items-center gap-2">
                                                                    <input type="text" value={currentMeal.quantity || ''} onChange={(e) => handleInputChange(diet.id, activeDay, mealType, 'quantity', e.target.value)} className="w-20 bg-transparent p-1 rounded-md border-2 border-transparent focus:bg-[var(--color-bg-surface)] focus:border-[var(--color-primary)] outline-none"/>
                                                                    <input type="text" value={currentMeal.unit || ''} onChange={(e) => handleInputChange(diet.id, activeDay, mealType, 'unit', e.target.value)} className="w-24 bg-transparent p-1 rounded-md border-2 border-transparent focus:bg-[var(--color-bg-surface)] focus:border-[var(--color-primary)] outline-none"/>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </motion.div>
                                </AnimatePresence>
                            )}
                            
                            <div className="pt-4 space-y-4">
                                {editStates[diet.id]?.[activeDay] && (
                                    <div className="flex items-center gap-4 p-4 bg-[var(--color-bg-app)] rounded-lg"><p className="text-sm font-semibold text-[var(--color-text-strong)] flex-grow">You have unsaved changes for <span className="capitalize">{activeDay?.replace(/_/g, ' ')}</span>.</p>
                                        <button onClick={() => setEditStates(prev => { const newState = { ...prev }; if (newState[diet.id]) delete newState[diet.id][activeDay]; if (Object.keys(newState[diet.id] || {}).length === 0) delete newState[diet.id]; return newState;})} className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm bg-[var(--color-bg-interactive-subtle)] text-[var(--color-text-default)] hover:bg-opacity-80"><FaTimes /> Cancel</button>
                                        <button onClick={() => handleSave(diet.id, activeDay)} disabled={isSaving} className="flex items-center justify-center gap-2 px-4 py-2 w-28 rounded-lg font-semibold text-sm bg-[var(--color-success-bg)] text-[var(--color-success-text)] hover:bg-[var(--color-success-bg-hover)] disabled:opacity-50">{isSaving ? <FaSpinner className="animate-spin" /> : <FaSave />} Save</button>
                                    </div>
                                )}
                                {diet.status === 'pending' && (
                                    <div className="p-4 bg-[var(--color-info-bg-subtle)] border-2 border-[var(--color-info-text)]/20 rounded-lg space-y-3">
                                        <h4 className="font-semibold text-[var(--color-info-text)]">Review This Plan</h4>
                                        <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add instructions or comments... (required for rejection)" className="w-full p-2 text-sm bg-[var(--color-bg-surface)] border-2 border-[var(--color-border-default)] rounded-md focus:border-[var(--color-primary)] outline-none" rows="3"></textarea>
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => handleReview(diet.id, 'approved')} disabled={isReviewing} className="flex items-center justify-center gap-2 px-4 py-2 w-32 rounded-lg font-semibold text-sm bg-[var(--color-success-bg)] text-[var(--color-success-text)] hover:bg-[var(--color-success-bg-hover)] disabled:opacity-50">{isReviewing ? <FaSpinner className="animate-spin"/> : <FaCheck />} Approve</button>
                                            <button onClick={() => handleReview(diet.id, 'rejected')} disabled={isReviewing || !comment} className="flex items-center justify-center gap-2 px-4 py-2 w-32 rounded-lg font-semibold text-sm bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] hover:bg-[var(--color-danger-bg-hover)] disabled:opacity-50">{isReviewing ? <FaSpinner className="animate-spin"/> : <FaTimes />} Reject</button>
                                        </div>
                                    </div>
                                )}
                                {diet.status === 'approved' && diet.generated_by === 'AI' && (
                                    <div className="p-4 bg-[var(--color-accent-1-bg-subtle)] border-2 border-[var(--color-accent-1-text)]/20 rounded-lg space-y-3">
                                        <h4 className="font-semibold text-[var(--color-accent-1-text)]">Help Improve Our AI</h4>
                                        <p className="text-sm text-[var(--color-text-default)]">Was this AI-generated plan helpful for the patient?</p>
                                        <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Optional: Provide specific feedback..." className="w-full p-2 text-sm bg-[var(--color-bg-surface)] border-2 border-[var(--color-border-default)] rounded-md focus:border-[var(--color-primary)] outline-none" rows="2"></textarea>
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => handleFeedback(diet.id, true)} disabled={isSubmittingFeedback} className="flex items-center justify-center gap-2 px-4 py-2 w-32 rounded-lg font-semibold text-sm bg-[var(--color-success-bg)] text-[var(--color-text-on-primary)] hover:bg-[var(--color-success-bg-hover)] disabled:opacity-50">{isSubmittingFeedback ? <FaSpinner className="animate-spin"/> : <FaThumbsUp />} Helpful</button>
                                            <button onClick={() => handleFeedback(diet.id, false)} disabled={isSubmittingFeedback} className="flex items-center justify-center gap-2 px-4 py-2 w-36 rounded-lg font-semibold text-sm bg-[var(--color-danger-bg)] text-[var(--color-text-on-primary)] hover:bg-[var(--color-danger-bg-hover)] disabled:opacity-50">{isSubmittingFeedback ? <FaSpinner className="animate-spin"/> : <FaThumbsDown />} Not Helpful</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        );
                    })) : (<div className="text-center py-16 bg-[var(--color-bg-app)] rounded-xl border-2 border-dashed border-[var(--color-border-default)]"><p className="text-[var(--color-text-default)]">No diet plans available. Generate a new one to get started.</p></div>)}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
};

export default PatientDetailsPage;