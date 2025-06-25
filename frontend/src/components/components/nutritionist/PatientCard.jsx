import React from "react";

const PatientCard = ({ name, age, bmi }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow hover:shadow-md transition">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-lg font-semibold">{name}</h3>
          <p className="text-sm text-gray-500">Age: {age} | BMI: {bmi}</p>
        </div>
        <img
          src="https://via.placeholder.com/40"
          alt="Avatar"
          className="w-10 h-10 rounded-full"
        />
      </div>
      <button className="w-full bg-green-500 hover:bg-green-600 text-white py-1 rounded mt-2">
        + Add Patient
      </button>
    </div>
  );
};

export default PatientCard;
