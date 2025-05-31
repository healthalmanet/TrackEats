import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const BmiResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bmi, category } = location.state || {};

  if (!bmi) {
    return <p>No BMI data found. Please calculate BMI first.</p>;
  }

  return (
    <div>
      <h2>BMI Result</h2>
      <p><strong>BMI:</strong> {bmi}</p>
      <p><strong>Category:</strong> {category}</p>
      <button onClick={() => navigate(-1)}>Go Back</button>
    </div>
  );
};

export default BmiResult;
