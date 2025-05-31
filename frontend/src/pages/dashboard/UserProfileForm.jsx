import { useState, useEffect } from "react";
import { submitUserProfile, getUserProfile } from "../../api/userProfile";
import React from "react";

const UserProfileForm = () => {
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    height: "",
    weight: "",
    mobileNumber: "",
    activityLevel: "",
    goal: "",
    healthCondition: "",
    dietType: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getUserProfile();
        if (data) setFormData(data);
      } catch (e) {
        console.log("No existing profile.");
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitUserProfile(formData);
      alert("Profile submitted.");
    } catch (err) {
      setError("Error submitting form.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Age: <input type="number" name="age" value={formData.age} onChange={handleChange} /></label><br />
      <label>Gender: <input name="gender" value={formData.gender} onChange={handleChange} /></label><br />
      <label>Height (cm): <input type="number" name="height" value={formData.height} onChange={handleChange} /></label><br />
      <label>Weight (kg): <input type="number" name="weight" value={formData.weight} onChange={handleChange} /></label><br />
      <label>Mobile Number: <input type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} /></label><br />
      <label>Activity Level: <input name="activityLevel" value={formData.activityLevel} onChange={handleChange} /></label><br />
      <label>Goal: <input name="goal" value={formData.goal} onChange={handleChange} /></label><br />
      <label>Health Condition: <input name="healthCondition" value={formData.healthCondition} onChange={handleChange} /></label><br />
      
      <label>
        Diet Type:
        <select name="dietType" value={formData.dietType} onChange={handleChange}>
          <option value="">Select</option>
          <option value="Vegetarian">Vegetarian</option>
          <option value="Non-Vegetarian">Non-Vegetarian</option>
          <option value="Vegan">Vegan</option>
          <option value="Eggetarian">Eggetarian</option>
        </select>
      </label>
      <br />
      <button type="submit">Submit</button>
      {error && <p>{error}</p>}
    </form>
  );
};

export default UserProfileForm;
