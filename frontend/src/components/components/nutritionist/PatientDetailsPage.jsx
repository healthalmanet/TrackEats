import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPatientProfile, getPatientMeals, getDietByPatientId, editDiet, reviewDietPlan, submitFeedbackForML } from "../../../api/nutritionistApi";

const PatientDetailsPage = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [labReport, setLabReport] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [meals, setMeals] = useState([]);
  const [diets, setDiets] = useState([]);
  const [comment, setComment] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const profileRes = await getPatientProfile(id);
        setProfile(profileRes.data.profile);
        setLabReport(profileRes.data.latest_lab_report);

        const mealsRes = await getPatientMeals(id);
        setMeals(mealsRes.data.results || mealsRes.data);

        const dietRes = await getDietByPatientId(id);
setDiets(dietRes.data.results || []);

      } catch (err) {
        console.error("Error fetching patient profile:", err);
      }
    })();
  }, [id]);

  const calculateAge = (dob) => {
    if (!dob) return "-";
    const birthDate = new Date(dob);
    const age = Math.floor((Date.now() - birthDate) / (1000 * 60 * 60 * 24 * 365.25));
    return age;
  };

  const handleReview = async (dietId, action) => {
    try {
      await reviewDietPlan(dietId, action, comment);
      const updated = await getDietByPatientId(id);
      setDiets(updated.data);
      setComment("");
    } catch (err) {
      console.error("Review failed:", err);
    }
  };

  const handleEdit = async (dietId, date, updatedMeals) => {
    try {
      await editDiet(dietId, id, date, updatedMeals);
      const updated = await getDietByPatientId(id);
      setDiets(updated.data);
    } catch (err) {
      console.error("Edit failed:", err);
    }
  };

  const handleFeedback = async (dietId, approved) => {
    try {
      await submitFeedbackForML(dietId, feedback, approved);
      const updated = await getDietByPatientId(id);
      setDiets(updated.data);
      setFeedback("");
    } catch (err) {
      console.error("Feedback failed:", err);
    }
  };

  if (!profile) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-roboto">
      <div className="bg-white px-6 py-4 shadow-md flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#263238] mb-1">Patient Overview</h1>
          <p className="text-gray-700 text-sm">
            <span className="font-medium">Name:</span> {profile.full_name} |{" "}
            <span className="font-medium">Email:</span> {profile.email} |{" "}
            <span className="font-medium">Gender:</span> {profile.gender} |{" "}
            <span className="font-medium">Age:</span> {calculateAge(profile.date_of_birth)} |{" "}
            <span className="font-medium">Joined:</span>{" "}
            {new Date(profile.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="bg-white px-6 pt-4 border-b">
        <nav className="flex space-x-6">
          {["profile", "reports", "meals", "diet"].map((tab) => (
            <button
              key={tab}
              className={`pb-2 text-sm font-medium ${
                activeTab === tab
                  ? "border-b-2 border-[#FF7043] text-[#263238]"
                  : "text-gray-500 hover:text-[#263238]"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "profile" && "Profile"}
              {tab === "reports" && "Reports"}
              {tab === "meals" && "Meals"}
              {tab === "diet" && "Diet Plans"}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-2">Basic Information</h2>
              <p><strong>Full Name:</strong> {profile.full_name}</p>
              <p><strong>Gender:</strong> {profile.gender}</p>
              <p><strong>Age:</strong> {calculateAge(profile.date_of_birth)}</p>
              <p><strong>Height:</strong> {profile.height_cm} cm</p>
              <p><strong>Weight:</strong> {profile.weight_kg} kg</p>
              <p><strong>BMI:</strong> {profile.bmi || "N/A"}</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-2">Health Goals</h2>
              <ul className="list-disc pl-5 text-sm text-gray-700">
                {profile.goal ? <li>{profile.goal}</li> : <li>No goals defined.</li>}
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-2">Dietary Preferences</h2>
              <p className="text-sm">{profile.diet_type || "Not specified"}</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-2">Allergies</h2>
              <p className="text-sm">{profile.allergies || "None reported"}</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow md:col-span-2">
              <h2 className="text-lg font-semibold mb-2">Medical History</h2>
              <ul className="list-disc pl-5 text-sm text-gray-700">
                {profile.is_diabetic && <li>Diabetes</li>}
                {profile.is_hypertensive && <li>Hypertension</li>}
                {profile.has_gastric_issues && <li>Gastric Issues</li>}
                {!profile.is_diabetic && !profile.is_hypertensive && !profile.has_gastric_issues && (
                  <li>No chronic issues reported.</li>
                )}
              </ul>
            </div>
          </div>
        )}

        {activeTab === "reports" && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-[#263238]">Latest Lab Report</h2>
            {labReport ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {Object.entries(labReport).map(([key, value]) => (
                  <p key={key}><strong>{key.replace(/_/g, ' ').toUpperCase()}:</strong> {value || "—"}</p>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No lab report found.</p>
            )}
          </div>
        )}

        {activeTab === "meals" && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-[#263238]">Meal Logs</h2>
            {meals.length > 0 ? (
              Object.entries(
                meals.reduce((acc, meal) => {
                  const date = meal.date;
                  const type = meal.meal_type?.toLowerCase();
                  if (!acc[date]) acc[date] = {};
                  if (!acc[date][type]) acc[date][type] = [];
                  acc[date][type].push(meal);
                  return acc;
                }, {})
              ).map(([date, mealsByType]) => (
                <div key={date} className="mb-6">
                  <h3 className="text-lg font-bold text-[#FF7043] mb-2">{new Date(date).toLocaleDateString()}</h3>
                  {[
                    "early-morning",
                    "breakfast",
                    "mid-morning snack",
                    "lunch",
                    "evening snack",
                    "dinner",
                  ].map((type) =>
                    mealsByType[type] ? (
                      <div key={type} className="mb-4">
                        <h4 className="text-md font-semibold text-[#263238] capitalize mb-2">
                          {type.replace(/-/g, " ")}
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          {mealsByType[type].map((meal) => (
                            <div key={meal.id} className="border rounded-md p-4 shadow-sm bg-[#FFFDF9]">
                              <p><strong>Item:</strong> {meal.food_item_name}</p>
                              <p><strong>Quantity:</strong> {meal.quantity} {meal.unit}</p>
                              <p><strong>Time:</strong> {meal.consumed_at ? new Date(meal.consumed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}</p>
                              <p><strong>Calories:</strong> {meal.calories} kcal</p>
                              <p><strong>Protein:</strong> {meal.protein} g</p>
                              <p><strong>Carbs:</strong> {meal.carbs} g</p>
                              <p><strong>Fats:</strong> {meal.fats} g</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-600">No meal logs available.</p>
            )}
          </div>
        )}

        {activeTab === "diet" && (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h2 className="text-xl font-semibold mb-4 text-[#263238]">Diet Plans</h2>
    {diets.length > 0 ? (
      diets.map((diet) => {
        const planMeals = diet.meals?.plan_data?.meals || {};

        return (
          <div key={diet.id} className="mb-6 border p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-700 mb-2">
              <strong>Week Starting:</strong> {new Date(diet.for_week_starting).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              <strong>Status:</strong> {diet.status}
            </p>

            {Object.entries(planMeals).map(([day, mealsPerDay]) => (
              <div key={day} className="mb-4">
                <h4 className="text-md font-semibold text-[#FF7043] mb-2">{day}</h4>
                {Object.entries(mealsPerDay).map(([mealType, mealDetails]) => (
                  <div key={mealType} className="mb-2">
                    <h5 className="text-sm font-semibold capitalize text-[#263238]">{mealType}</h5>
                    <ul className="text-sm text-gray-700 pl-4 list-disc">
                      <li><strong>Food:</strong> {mealDetails.food_name}</li>
                      <li><strong>Calories:</strong> {mealDetails.Calories} kcal</li>
                      <li><strong>Protein:</strong> {mealDetails.Protein} g</li>
                      <li><strong>Carbs:</strong> {mealDetails.Carbs} g</li>
                      <li><strong>Fats:</strong> {mealDetails.Fats} g</li>
                      <li><strong>Fiber:</strong> {mealDetails.Fiber} g</li>
                      <li><strong>Gram Equivalent:</strong> {mealDetails.Gram_Equivalent}</li>
                    </ul>
                  </div>
                ))}
              </div>
            ))}

            {/* Review Buttons */}
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mt-4">
              <textarea
                placeholder="Enter review comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="border rounded p-2 w-full mb-2 md:mb-0 text-sm"
              />
              <button
                onClick={() => handleReview(diet.id, "approve")}
                className="px-3 py-1 bg-green-500 text-white rounded"
              >Approve</button>
              <button
                onClick={() => handleReview(diet.id, "reject")}
                className="px-3 py-1 bg-red-500 text-white rounded"
              >Reject</button>
            </div>

            {/* Feedback */}
            <div className="mt-4">
              <textarea
                placeholder="Enter feedback here..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="border rounded p-2 w-full text-sm mb-2"
              />
              <button
                onClick={() => handleFeedback(diet.id, true)}
                className="px-3 py-1 bg-yellow-500 text-white rounded"
              >Submit Feedback</button>
            </div>
          </div>
        );
      })
    ) : (
      <p className="text-gray-600">No diet plans available.</p>
    )}
  </div>
)}

      </div>
    </div>
  );
};

export default PatientDetailsPage;
