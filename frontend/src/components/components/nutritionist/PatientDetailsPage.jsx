import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
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
  FaBullseye,
  FaAllergies,
  FaChevronDown,
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

const PatientDetailsPage = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [labReport, setLabReport] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [meals, setMeals] = useState([]);
  const [diets, setDiets] = useState([]);
  const [comment, setComment] = useState("");
  const [feedback, setFeedback] = useState("");
  const [editStates, setEditStates] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // --- State and Refs for the animated tabs ---
  const [underlineStyle, setUnderlineStyle] = useState({});
  const tabRefs = useRef([]);

  // --- UI State ONLY for the Diet Plan UX ---
  const [activeDayPerDiet, setActiveDayPerDiet] = useState({});

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
        setLabReport(profileRes.data.latest_lab_report);
        setMeals(mealsRes.data.results || mealsRes.data);
        setDiets(dietRes.data.results || []);

        // Pre-select Day 1 for each diet plan
        if (dietRes.data.results && dietRes.data.results.length > 0) {
          const initialActiveDays = {};
          dietRes.data.results.forEach((diet) => {
            const planDays = Object.keys(diet.meals || {});
            if (planDays.length > 0) {
              initialActiveDays[diet.id] = planDays[0];
            }
          });
          setActiveDayPerDiet(initialActiveDays);
        }
      } catch (err) {
        console.error("Error fetching patient details:", err);
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
  const handleReview = async (dietId, action) => {
    try {
      await reviewDietPlan(dietId, action, comment);
      const updated = await getDietByPatientId(id);
      setDiets(updated.data.results || []);
      setComment("");
      alert(`Diet plan ${action} successfully.`);
    } catch (err) {
      console.error("Review failed:", err);
      alert("Review submission failed.");
    }
  };
  const handleFeedback = async (dietId, approved) => {
    try {
      await submitFeedbackForML(dietId, feedback, approved);
      const updated = await getDietByPatientId(id);
      setDiets(updated.data.results || []);
      setFeedback("");
      alert("Feedback submitted successfully.");
    } catch (err) {
      console.error("Feedback failed:", err);
      alert("Feedback submission failed.");
    }
  };
  const handleGenerateDiet = async () => {
    const confirmGen = window.confirm(
      "Are you sure you want to generate a new AI-powered diet plan for this patient?"
    );
    if (!confirmGen) return;
    try {
      await generateDietPlan(id);
      alert(
        "Diet plan generation requested! The new plan will appear here shortly."
      );
      const updated = await getDietByPatientId(id);
      setDiets(updated.data.results || []);
    } catch (err) {
      console.error("Diet generation failed:", err);
      alert("Failed to generate diet plan.");
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
  const handleSave = async (dietId, day) => {
    const updatedMeals = editStates[dietId]?.[day];
    if (!updatedMeals) {
      alert("No changes to save for this day.");
      return;
    }
    try {
      await editDiet(dietId, id, day, updatedMeals);
      const updated = await getDietByPatientId(id);
      setDiets(updated.data.results || []);
      setEditStates((prev) => {
        const newState = { ...prev };
        if (newState[dietId]) {
          delete newState[dietId][day];
        }
        return newState;
      });
      alert(`Diet for ${day} updated successfully!`);
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save changes.");
    }
  };

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

  return (
    <div className="min-h-screen bg-[#FFFDF9] font-['Roboto']">
      <main className="text-[#546E7A] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <header className="mb-8 p-6 bg-white rounded-2xl shadow-lg border border-[#ECEFF1] transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1.5">
          {/* ...Header is unchanged... */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
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
            {/* ...Navigation is unchanged... */}
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
                  {" "}
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
              /* ...Profile Tab content is unchanged... */ <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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
              /* ...Reports Tab content is unchanged... */ <div>
                <h2 className="text-2xl font-bold font-['Poppins'] text-[#263238] mb-6">
                  Latest Lab Report
                </h2>
                {labReport ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Object.entries(labReport).map(([key, value]) => (
                      <div
                        key={key}
                        className="bg-[#FFFDF9] border border-[#ECEFF1] rounded-lg p-4 transition-all duration-300 hover:shadow-lg hover:border-[#FF7043] hover:-translate-y-1"
                      >
                        <p className="text-xs font-semibold text-[#546E7A] uppercase tracking-wider">
                          {key.replace(/_/g, " ")}
                        </p>
                        <p className="text-2xl font-bold text-[#263238] mt-1">
                          {value || "—"}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-[#FFFDF9] rounded-lg border-2 border-dashed border-[#ECEFF1]">
                    <p className="text-[#546E7A]">
                      No lab report found for this patient.
                    </p>
                  </div>
                )}
              </div>
            )}
            {activeTab === "meals" && (
              /* ...Meals Tab content is unchanged... */ <div>
                <h2 className="text-2xl font-bold font-['Poppins'] text-[#263238] mb-6">
                  Patient Meal Log
                </h2>
                {meals.length > 0 ? (
                  <div className="space-y-10">
                    {Object.entries(
                      meals.reduce((acc, meal) => {
                        const date = new Date(meal.date).toDateString();
                        if (!acc[date]) acc[date] = [];
                        acc[date].push(meal);
                        return acc;
                      }, {})
                    ).map(([date, mealsForDay]) => (
                      <div key={date}>
                        <h3 className="text-lg font-['Poppins'] font-bold text-[#263238] mb-3 pb-2 border-b-2 border-[#FFEDD5]">
                          {date}
                        </h3>
                        <div className="overflow-x-auto">
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
                                <th
                                  scope="col"
                                  className="px-3 py-3.5 text-right text-xs font-semibold uppercase text-[#546E7A]"
                                >
                                  Calories
                                </th>
                                <th
                                  scope="col"
                                  className="px-3 py-3.5 text-right text-xs font-semibold uppercase text-[#546E7A]"
                                >
                                  Protein
                                </th>
                                <th
                                  scope="col"
                                  className="px-3 py-3.5 text-right text-xs font-semibold uppercase text-[#546E7A]"
                                >
                                  Carbs
                                </th>
                                <th
                                  scope="col"
                                  className="relative py-3.5 pl-3 pr-4 text-right text-xs font-semibold uppercase text-[#546E7A] sm:pr-6"
                                >
                                  Fats
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {mealsForDay.map((item) => (
                                <tr
                                  key={item.id}
                                  className="transition-all duration-200 ease-in-out hover:bg-[#FFFDF9] hover:shadow-md hover:-translate-y-px"
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
                                      {item.meal_type?.replace(/-/g, " ") ||
                                        "Uncategorized"}
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
                                  <td className="whitespace-nowrap px-3 py-4 text-right font-bold text-[#263238]">
                                    {item.calories?.toFixed(0)}kcal
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-4 text-right font-bold text-[#263238]">
                                    {item.protein?.toFixed(1)}g
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-4 text-right font-bold text-[#263238]">
                                    {item.carbs?.toFixed(1)}g
                                  </td>
                                  <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right font-bold text-[#263238] sm:pr-6">
                                    {item.fats?.toFixed(1)}g
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
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
                <div className="bg-[#FFFDF9] border border-[#ECEFF1] p-4 rounded-xl flex justify-between items-center">
                  <h2 className="text-xl font-['Poppins'] font-semibold text-[#263238]">
                    Diet Plan Management
                  </h2>
                  <button
                    onClick={handleGenerateDiet}
                    className="flex items-center justify-center gap-2 bg-[#FF7043] text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all hover:bg-[#F4511E] hover:shadow-md hover:-translate-y-0.5"
                  >
                    <FaPlus />
                    Generate New Plan
                  </button>
                </div>
                {diets.length > 0 ? (
                  diets.map((diet) => {
                    const planDays = Object.keys(
                      diet.meals || {}
                    );
                    const activeDay =
                      activeDayPerDiet[diet.id] ||
                      (planDays.length > 0 ? planDays[0] : null);

                    return (
                      <div
                        key={diet.id}
                        className="bg-[#FFFDF9] p-6 rounded-xl border border-[#ECEFF1] space-y-4 transition-all duration-300"
                      >
                        <div className="flex justify-between items-center">
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
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {diet.status}
                            </span>
                          </div>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleSave(diet.id, activeDay)}
                              title="Save Changes for this Day"
                              className="h-9 w-9 flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-full transition"
                            >
                              <FaSave />
                            </button>
                            <button
                              onClick={() => handleReview(diet.id, "rejected")}
                              title="Reject Entire Plan"
                              className="h-9 w-9 flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-600 rounded-full transition"
                            >
                              <FaTimes />
                            </button>
                            <button
                              onClick={() => handleReview(diet.id, "approved")}
                              title="Approve Entire Plan"
                              className="h-9 w-9 flex items-center justify-center bg-green-100 hover:bg-green-200 text-green-600 rounded-full transition"
                            >
                              <FaCheck />
                            </button>
                          </div>
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
                              Object.entries(
                                diet.meals?.[activeDay] || {}
                              ).map(([mealType, mealDetails]) => (
                                <div
                                  key={mealType}
                                  className="mb-4 bg-white p-4 rounded-lg border border-[#ECEFF1]"
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
                                            editStates[diet.id]?.[activeDay]?.[
                                              mealType
                                            ]?.[field] ??
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
                              ))}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-[#ECEFF1]">
                    <p className="text-[#546E7A]">
                      No diet plans available. Generate a new one to get
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
