import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaUser, FaEnvelope, FaVenusMars, FaBirthdayCake, FaCalendarCheck, FaStethoscope, FaUtensils,
  FaFileMedicalAlt, FaCheck, FaTimes, FaSave, FaPlus, FaThumbsUp, FaThumbsDown, FaBullseye,
  FaAllergies, FaChevronDown, FaSpinner, FaArrowLeft
} from "react-icons/fa";
import {
  getPatientProfile, getPatientMeals, getDietByPatientId, editDiet, reviewDietPlan,
  submitFeedbackForML, generateDietPlan, getAllLabReports, getPatientMealsByDate
} from "../../../api/nutritionistApi";

const PatientDetailsPage = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [meals, setMeals] = useState([]);
  const [diets, setDiets] = useState([]);
  const [comment, setComment] = useState("");
  const [feedback, setFeedback] = useState("");
  const [editStates, setEditStates] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [filteredMeals, setFilteredMeals] = useState([]);
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

  // Lab Report State
  const [labReports, setLabReports] = useState([]);
  const [allLabReportsHistory, setAllLabReportsHistory] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState('latest');
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
          getPatientProfile(id),
          getPatientMeals(id),
          getDietByPatientId(id),
          getAllLabReports(id),
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
            options.push({ id: p.id, label: `Plan: ${new Date(p.for_week_starting).toLocaleDateString()} (${p.status})` });
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
    if (!comment) {
      toast.warn("A comment or instruction is required.");
      return;
    }
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
    } catch (err) {
      toast.error("Review submission failed.");
    } finally {
      setIsReviewing(false);
    }
  };

  const handleMealSearchByDate = async (e) => {
    const input = e.target.value;
    setSelectedMealDate(input);
    if (!input) {
      setFilteredMeals([]);
      setActiveLogDate(null);
      return;
    }
    setIsSearchingMeals(true);
    try {
      const res = await getPatientMealsByDate(id, input);
      setFilteredMeals(res.data?.results || []);
    } catch (err) {
      toast.error("Failed to fetch meals.");
    } finally {
      setIsSearchingMeals(false);
    }
  };

  const handleLogDateClick = (date) => setActiveLogDate((prev) => (prev === date ? null : date));

  const handleFeedback = async (dietId, approved) => {
    setIsSubmittingFeedback(true);
    try {
      await submitFeedbackForML(dietId, feedback, approved);
      setFeedback("");
      toast.success("Feedback submitted!");
    } catch (err) {
      toast.error("Feedback submission failed.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleGenerateDiet = async () => {
    if (window.confirm("Generate a new AI diet plan?")) {
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
      } catch (err) {
        toast.error("Failed to generate diet plan.");
        setIsGenerating(false);
      }
    }
  };

  const handleSave = async (dietId, day) => {
    const updatedMeals = editStates[dietId]?.[day];
    if (!updatedMeals) {
      toast.warn("No changes to save.");
      return;
    }
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
    } catch (err) {
      toast.error("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (dietId, day, mealType, field, value) => {
    setEditStates((prev) => ({...prev, [dietId]: {...(prev[dietId] || {}), [day]: {...(prev[dietId]?.[day] || {}), [mealType]: {...(prev[dietId]?.[day]?.[mealType] || {}), [field]: value,},},},}));
  };

  const mealsToDisplay = selectedMealDate ? filteredMeals : meals;
  const mealGroups = mealsToDisplay.reduce((acc, meal) => {
    const date = new Date(meal.date).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(meal);
    return acc;
  }, {});
  const sortedMealDates = Object.keys(mealGroups).sort((a, b) => new Date(b) - new Date(a));
  const indexOfLastMealDay = mealCurrentPage * mealsPerPage;
  const indexOfFirstMealDay = indexOfLastMealDay - mealsPerPage;
  const currentMealDays = sortedMealDates.slice(indexOfFirstMealDay, indexOfLastMealDay);
  const maxMealPage = Math.ceil(sortedMealDates.length / mealsPerPage);

  if (isLoading) return <div className="flex justify-center items-center h-screen bg-main"><p className="text-xl text-heading font-secondary">Loading Patient Details...</p></div>;
  if (!profile) return <div className="flex justify-center items-center h-screen bg-main"><p className="text-xl text-red">Could not load patient profile.</p></div>;

  const TABS = [{ key: "profile", label: "Profile", icon: <FaUser /> }, { key: "reports", label: "Lab Reports", icon: <FaFileMedicalAlt /> }, { key: "meals", label: "Meal Log", icon: <FaUtensils /> }, { key: "diet", label: "Diet Plans", icon: <FaStethoscope /> }];
  const mealTypeStyles = {
    "early-morning": "bg-pink/10 text-pink border-pink/20",
    "breakfast": "bg-primary/10 text-primary border-primary/20",
    "mid-morning snack": "bg-yellow/10 text-yellow border-yellow/20",
    "lunch": "bg-blue/10 text-blue border-blue/20",
    "evening snack": "bg-yellow/10 text-yellow border-yellow/20",
    "dinner": "bg-primary/10 text-primary border-primary/20",
    "uncategorized": "bg-light/10 text-body border-custom",
  };
  const hasPendingOrApprovedPlan = allDietPlans.some((diet) => diet.status === "pending" || diet.status === "approved");

  return (
    <div className="min-h-screen bg-main font-primary">
      <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="dark" />
      <main className="text-body p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <header className="mb-8 p-6 bg-section rounded-2xl shadow-lg border-custom transition-all hover:shadow-neon hover:-translate-y-1.5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-primary/10 text-primary rounded-full text-4xl"><FaUser /></div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-heading font-secondary">{profile.full_name}</h1>
                <p className="text-lg text-body">Patient Overview</p>
              </div>
            </div>
            <Link to="/nutritionist" className="flex items-center gap-2 px-4 py-2 bg-light text-body border-custom rounded-lg font-semibold text-sm transition-all hover:shadow-md hover:border-primary hover:text-primary hover:-translate-y-0.5"><FaArrowLeft />Back to Dashboard</Link>
          </div>
          <div className="mt-6 pt-6 border-t border-custom flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
            <div className="flex items-center gap-2"><FaEnvelope className="text-primary" />{profile.email}</div>
            <div className="flex items-center gap-2 capitalize"><FaVenusMars className="text-primary" />{profile.gender}</div>
            <div className="flex items-center gap-2"><FaBirthdayCake className="text-primary" />{calculateAge(profile.date_of_birth)} years old</div>
          </div>
        </header>

        <div className="bg-section rounded-2xl border-custom shadow-xl p-4 sm:p-6 lg:p-8">
          <nav className="relative mb-8">
            <div className="flex justify-center border-b border-custom">
              {TABS.map((tab, index) => (<button key={tab.key} ref={(el) => (tabRefs.current[index] = el)} data-tab-key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-2.5 px-6 py-3 text-sm font-semibold transition-colors duration-300 outline-none ${activeTab === tab.key ? "text-primary" : "text-body hover:text-heading"}`}>{tab.icon} <span>{tab.label}</span></button>))}
            </div>
            <div className="absolute bottom-0 h-0.5 bg-primary transition-all duration-300" style={underlineStyle} />
          </nav>

          <div className="animate-fade-in">
            {activeTab === "profile" && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <h3 className="text-xl font-secondary font-semibold text-heading">Core Statistics</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[{ label: "Height", value: `${profile.height_cm} cm` }, { label: "Weight", value: `${profile.weight_kg} kg` }, { label: "BMI", value: profile.bmi?.toFixed(1) || "N/A" }].map((s) => (
                      <div key={s.label} className="bg-light border-custom rounded-lg p-4 text-center transition-all hover:shadow-lg hover:-translate-y-1">
                        <p className="text-xs text-body font-semibold uppercase">{s.label}</p>
                        <p className="text-2xl font-bold font-primary text-heading mt-1">{s.value}</p>
                      </div>
                    ))}
                  </div>
                  <h3 className="text-xl font-secondary font-semibold text-heading pt-4 border-t border-custom">Goals & Preferences</h3>
                  <div className="space-y-4">
                    {[{ icon: <FaBullseye />, label: "Primary Goal", value: profile.goal?.replace(/_/g, " ") || "Not Set" }, { icon: <FaUtensils />, label: "Dietary Preference", value: profile.diet_type || "Not Set" }, { icon: <FaAllergies />, label: "Allergies", value: profile.allergies || "None Reported" }].map((p) => (
                      <div key={p.label} className="flex items-center gap-4 bg-light border-custom p-4 rounded-lg">
                        <span className="text-xl text-primary">{p.icon}</span>
                        <div>
                          <p className="text-sm text-body">{p.label}</p>
                          <p className="capitalize font-semibold text-heading">{p.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-6">
                  <h3 className="text-xl font-secondary font-semibold text-heading">Medical Summary</h3>
                  <div className="bg-light border-custom p-4 rounded-lg">
                    <p className="text-sm text-body font-semibold mb-2">Reported Chronic Conditions</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {profile.is_diabetic && <div className="flex items-center gap-1.5"><FaCheck className="text-primary text-xs" />Diabetes</div>}
                      {profile.is_hypertensive && <div className="flex items-center gap-1.5"><FaCheck className="text-primary text-xs" />Hypertension</div>}
                      {!profile.is_diabetic && !profile.is_hypertensive && <p>None Reported</p>}
                    </div>
                  </div>
                  <div className="bg-light border-custom p-4 rounded-lg">
                    <p className="text-sm text-body font-semibold mb-2">Family Medical History</p>
                    <p className="text-sm text-heading whitespace-pre-wrap">{profile.family_history || "None Reported"}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reports" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-secondary font-bold text-heading">Lab Reports</h2>
                  {allLabReportsHistory.length > 0 && (
                    <div className="relative">
                      <select id="report-selector" value={selectedReportId} onChange={handleReportSelectionChange} className="appearance-none w-full sm:w-56 bg-light border-custom text-sm text-heading font-semibold py-2 pl-3 pr-8 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary">
                        <option value="latest">Latest Report</option>
                        {allLabReportsHistory.map(report => (<option key={report.id} value={report.id}>Report: {new Date(report.report_date + 'T00:00:00').toLocaleDateString()}</option>))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-body"><FaChevronDown size={12} /></div>
                    </div>
                  )}
                </div>
                {loadingReport ? (<div className="flex justify-center items-center py-10"><FaSpinner className="animate-spin text-4xl text-primary" /></div>) 
                : labReports.length > 0 ? (
                  <div className="space-y-8">
                    {labReports.map((report) => (
                      <div key={report.id} className="bg-light p-5 rounded-xl border-custom shadow-sm animate-fade-in">
                        <h4 className="text-lg font-bold font-secondary text-heading mb-4 pb-3 border-b border-custom">Report Date: {new Date(report.report_date + "T00:00:00").toLocaleDateString()}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {Object.entries(report).map(([key, value]) => {
                            if (["id", "user", "report_date"].includes(key)) return null;
                            return (
                              <div key={key} className="bg-section border-custom rounded-lg p-3 transition-all hover:shadow-lg hover:border-primary">
                                <p className="text-xs font-semibold text-body uppercase tracking-wider">{key.replace(/_/g, " ")}</p>
                                <p className="text-2xl font-bold text-heading mt-1">{value ?? "—"}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-light rounded-lg border-2 border-dashed border-custom"><p className="text-body">No lab reports found.</p></div>
                )}
              </div>
            )}
            
            {activeTab === "meals" && (
              <div>
                <h2 className="text-2xl font-bold font-secondary text-heading mb-6">Patient Meal Log</h2>
                <div className="mb-6 flex items-center gap-4">
                  <label htmlFor="mealDate" className="text-sm font-semibold text-body">Filter by Date:</label>
                  <input type="date" value={selectedMealDate} onChange={handleMealSearchByDate} max={new Date().toISOString().split("T")[0]} className="bg-light border-custom rounded-md p-2 text-heading" />
                  {isSearchingMeals && <FaSpinner className="animate-spin text-primary" />}
                  {selectedMealDate && !isSearchingMeals && <button onClick={() => { setSelectedMealDate(""); setFilteredMeals([]); }} className="text-xs text-red hover:underline">Clear</button>}
                </div>
                {sortedMealDates.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {currentMealDays.map((date) => {
                        const mealsForDay = mealGroups[date];
                        const isActive = activeLogDate === date;
                        return (
                          <div key={date} className="border-custom bg-section rounded-xl shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/50">
                            <button onClick={() => handleLogDateClick(date)} className="w-full flex justify-between items-center p-4">
                              <div className="flex items-center gap-4">
                                <FaCalendarCheck className={`text-xl ${isActive ? "text-primary" : "text-body/50"}`} />
                                <h3 className="font-bold font-primary text-lg text-left text-heading">{date}</h3>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="hidden sm:inline-block bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full">{mealsForDay.length} items logged</span>
                                <FaChevronDown className={`transform transition-transform duration-300 text-body/70 ${isActive ? "rotate-180 text-primary" : ""}`} />
                              </div>
                            </button>
                            <div className={`transition-[max-height,padding] duration-500 ease-in-out overflow-hidden ${isActive ? "max-h-screen" : "max-h-0"}`}>
                              <div className="pb-4 px-4"><div className="border-t border-custom pt-4">
                                <table className="min-w-full text-sm align-middle">
                                  <thead className="bg-light"><tr >
                                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold uppercase text-body sm:pl-6">Meal Type</th>
                                      <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase text-body">Food Item</th>
                                      <th scope="col" className="px-3 py-3.5 text-center text-xs font-semibold uppercase text-body">Quantity</th>
                                      <th scope="col" className="px-3 py-3.5 text-center text-xs font-semibold uppercase text-body">Time</th>
                                  </tr></thead>
                                  <tbody>
                                    {mealsForDay.sort((a, b) => a.consumed_at && b.consumed_at ? new Date(`1970-01-01T${a.consumed_at}`) - new Date(`1970-01-01T${b.consumed_at}`) : 0).map((item) => (
                                      <tr key={item.id} className="transition-colors duration-200 hover:bg-light">
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6"><span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full capitalize border ${mealTypeStyles[item.meal_type?.toLowerCase() || "uncategorized"]}`}>{item.meal_type?.replace(/-/g, " ") || "Uncategorized"}</span></td>
                                        <td className="whitespace-nowrap px-3 py-4 font-semibold text-heading">{item.food_name}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-center text-body">{item.quantity} {item.unit}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-center text-body">{item.consumed_at ? new Date(`1970-01-01T${item.consumed_at}`).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "N/A"}</td>
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
                    {maxMealPage > 1 && (<div className="flex justify-center items-center mt-8 gap-4"><button onClick={() => setMealCurrentPage((p) => Math.max(1, p - 1))} disabled={mealCurrentPage === 1} className="px-4 py-2 rounded-md text-sm font-semibold transition bg-light hover:bg-section-light text-body disabled:opacity-50 disabled:cursor-not-allowed">Previous</button><span className="text-sm font-semibold text-body">Page {mealCurrentPage} of {maxMealPage}</span><button onClick={() => setMealCurrentPage((p) => Math.min(maxMealPage, p + 1))} disabled={mealCurrentPage === maxMealPage} className="px-4 py-2 rounded-md text-sm font-semibold transition bg-light hover:bg-section-light text-body disabled:opacity-50 disabled:cursor-not-allowed">Next</button></div>)}
                  </>
                ) : (<div className="text-center py-16 bg-light rounded-xl border-2 border-dashed border-custom"><p className="text-body">No meal logs recorded.</p></div>)}
              </div>
            )}
            
            {activeTab === "diet" && (
              <div className="space-y-6">
                <div className="bg-light border-custom p-4 rounded-xl flex flex-wrap gap-6 justify-between items-center">
                    <div><h2 className="text-xl font-secondary font-semibold text-heading">Diet Plan Management</h2></div>
                    <div className="flex items-center gap-x-6 gap-y-4">
                        {planOptions.length > 1 && (
                            <div className="relative">
                                <label htmlFor="plan-selector" className="text-sm font-medium text-body">View Plan:</label>
                                <select id="plan-selector" value={selectedPlanId || ''} onChange={handlePlanChange} className="mt-1 appearance-none w-full sm:w-60 bg-section border-custom text-sm text-heading font-semibold py-2 pl-3 pr-8 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary">
                                {planOptions.map(plan => (<option key={plan.id} value={plan.id}>{plan.label}</option>))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 top-6 flex items-center px-2 text-body"><FaChevronDown size={12} /></div>
                            </div>
                        )}
                        <div title={hasPendingOrApprovedPlan ? "Cannot generate while a plan is pending or approved." : "Generate a new AI diet plan"} className="self-end">
                            <button onClick={handleGenerateDiet} disabled={hasPendingOrApprovedPlan || isGenerating} className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all w-44 ${hasPendingOrApprovedPlan || isGenerating ? "bg-light opacity-50 cursor-not-allowed text-body" : "bg-primary text-bg-main hover:bg-primary-hover hover:shadow-neon hover:-translate-y-0.5"}`}>
                            {isGenerating ? <FaSpinner className="animate-spin" /> : <FaPlus />} {isGenerating ? "Generating..." : "Generate New Plan"}
                            </button>
                        </div>
                    </div>
                </div>

                {diets.length > 0 ? (diets.map((diet) => {
                    const planDays = Object.keys(diet.meals || {});
                    const activeDay = activeDayPerDiet[diet.id] || (planDays.length > 0 ? planDays[0] : null);
                    return (
                      <div key={diet.id} className="bg-section p-6 rounded-xl border-custom space-y-4 shadow-sm">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <h3 className="font-bold font-secondary text-lg text-heading">Week of {new Date(diet.for_week_starting).toLocaleDateString()}</h3>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${diet.status === "approved" ? "bg-primary/10 text-primary" : diet.status === "pending" ? "bg-yellow/10 text-yellow" : "bg-red/10 text-red"}`}>{diet.status}</span>
                          </div>
                          <button onClick={() => handleSave(diet.id, activeDay)} title="Save Changes" disabled={isSaving} className={`h-9 w-9 flex items-center justify-center rounded-full transition flex-shrink-0 ${isSaving ? "bg-blue/10 cursor-wait" : "bg-blue/20 hover:bg-blue/30 text-blue"}`}>
                            {isSaving ? <FaSpinner className="animate-spin text-blue" /> : <FaSave />}
                          </button>
                        </div>
                        <div className="pt-4 border-t border-custom space-y-4">
                          <div className="flex items-center gap-2 p-1 bg-main rounded-lg overflow-x-auto">
                            {planDays.map((day) => (<button key={day} onClick={() => setActiveDayPerDiet((prev) => ({ ...prev, [diet.id]: day }))} className={`flex-shrink-0 px-4 py-1.5 rounded-md text-sm font-semibold transition-colors duration-200 ${activeDay === day ? "bg-light text-primary shadow-sm" : "text-body hover:bg-light/50"}`}>{day.replace(/_/g, " ")}</button>))}
                          </div>
                          <div>
                            {activeDay && Object.entries(diet.meals?.[activeDay] || {}).map(([mealType, mealDetails]) => (
                              <div key={mealType} className="mb-4 bg-light p-4 rounded-lg border-custom">
                                <h5 className="text-md font-semibold capitalize text-heading mb-3">{mealType.replace(/_/g, " ")}</h5>
                                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                  {["food_name", "Calories", "Protein", "Carbs", "Fats", "Fiber", "Gram_Equivalent"].map((field) => (
                                    <div key={field}>
                                      <label className="text-xs text-body block mb-1 font-medium">{field.replace(/_/g, " ")}</label>
                                      <input type="text" className="w-full bg-main border-custom rounded-md px-3 py-1.5 text-sm text-heading focus:ring-1 focus:ring-primary" value={editStates[diet.id]?.[activeDay]?.[mealType]?.[field] ?? mealDetails[field] ?? ""} onChange={(e) => handleInputChange(diet.id, activeDay, mealType, field, e.target.value)} />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {diet.status === "pending" && (
                          <div className="mt-4 pt-4 border-t border-dashed border-custom bg-yellow/5 p-4 rounded-lg">
                            <h4 className="text-md font-semibold text-heading mb-2 font-secondary">Review Plan</h4>
                            <label htmlFor={`comment-${diet.id}`} className="text-sm text-body mb-1 block">Add comment (required):</label>
                            <textarea id={`comment-${diet.id}`} placeholder="e.g., 'Let's try this...'" value={comment} onChange={(e) => setComment(e.target.value)} className="w-full bg-light border-custom rounded-md px-3 py-2 text-sm text-heading focus:ring-1 focus:ring-primary min-h-[70px]" rows="3" />
                            <div className="flex items-center gap-3 mt-3">
                              <button onClick={() => handleReview(diet.id, "rejected")} disabled={isReviewing} className={`flex items-center justify-center gap-2 px-4 py-2 w-28 rounded-md transition text-sm font-semibold shadow-md ${isReviewing ? "bg-red/50 cursor-wait text-light" : "bg-red hover:bg-red/80 text-light"}`}>{isReviewing ? <FaSpinner className="animate-spin" /> : <FaTimes />} Reject</button>
                              <button onClick={() => handleReview(diet.id, "approved")} disabled={isReviewing} className={`flex items-center justify-center gap-2 px-4 py-2 w-28 rounded-md transition text-sm font-semibold shadow-md ${isReviewing ? "bg-primary/50 cursor-wait text-bg-main" : "bg-primary hover:bg-primary-hover text-bg-main"}`}>{isReviewing ? <FaSpinner className="animate-spin" /> : <FaCheck />} Approve</button>
                            </div>
                          </div>
                        )}

                        {diet.status === "approved" && (
                          <div className="mt-4 pt-4 border-t border-dashed border-custom bg-blue/5 p-4 rounded-lg">
                            <h4 className="text-md font-semibold text-heading mb-2 font-secondary">AI Model Feedback</h4>
                            <p className="text-xs text-body mb-2">Was this AI-generated plan helpful?</p>
                            <textarea placeholder="Optional feedback..." value={feedback} onChange={(e) => setFeedback(e.target.value)} disabled={isSubmittingFeedback} className="w-full bg-light border-custom rounded-md px-3 py-2 text-sm text-heading focus:ring-1 focus:ring-primary min-h-[60px]" rows="2" />
                            <div className="flex items-center gap-3 mt-3">
                              <button onClick={() => handleFeedback(diet.id, false)} disabled={isSubmittingFeedback} className={`flex items-center justify-center gap-2 px-3 py-2 w-32 rounded-md transition text-sm font-semibold ${isSubmittingFeedback ? "bg-red/10 cursor-wait" : "bg-red/20 hover:bg-red/30 text-red"}`}>{isSubmittingFeedback ? <FaSpinner className="animate-spin" /> : <FaThumbsDown />} Not Helpful</button>
                              <button onClick={() => handleFeedback(diet.id, true)} disabled={isSubmittingFeedback} className={`flex items-center justify-center gap-2 px-3 py-2 w-32 rounded-md transition text-sm font-semibold ${isSubmittingFeedback ? "bg-primary/10 cursor-wait" : "bg-primary/20 hover:bg-primary/30 text-primary"}`}>{isSubmittingFeedback ? <FaSpinner className="animate-spin" /> : <FaThumbsUp />} Helpful</button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-16 bg-light rounded-xl border-2 border-dashed border-custom"><p className="text-body">No diet plans available. Generate a new one to get started.</p></div>
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