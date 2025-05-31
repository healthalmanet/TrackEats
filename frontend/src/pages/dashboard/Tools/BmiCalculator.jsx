import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const BmiCalculator = () => {
  const [formData, setFormData] = useState({
    gender: "",
    height: "",
    weight: "",
    age: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateBMI = (e) => {
    e.preventDefault();
    const { height, weight } = formData;

    if (!height || !weight) {
      alert("Please enter height and weight.");
      return;
    }

    const heightInMeters = height / 100;
    const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(2);

    let category = "";
    if (bmi < 18.5) category = "Underweight";
    else if (bmi >= 18.5 && bmi < 24.9) category = "Normal weight";
    else if (bmi >= 25 && bmi < 29.9) category = "Overweight";
    else category = "Obese";

    // Redirect to result page with state
    navigate("/dashboard/tools/bmi-result", {
      state: { bmi, category },
    });
  };

  return (
    <div>
      <h2>BMI Calculator</h2>
      <form onSubmit={calculateBMI}>
        <div>
          <label>
            Gender:
            <label>
              <input
                type="radio"
                name="gender"
                value="Male"
                checked={formData.gender === "Male"}
                onChange={handleChange}
              /> Male
            </label>
            <label>
              <input
                type="radio"
                name="gender"
                value="Female"
                checked={formData.gender === "Female"}
                onChange={handleChange}
              /> Female
            </label>
          </label>
        </div>

        <div>
          <label>
            Height (cm):
            <input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
            />
          </label>
        </div>

        <div>
          <label>
            Weight (kg):
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
            />
          </label>
        </div>

        <div>
          <label>
            Age:
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
            />
          </label>
        </div>

        <button type="submit">Calculate</button>
      </form>
    </div>
  );
};

export default BmiCalculator;
