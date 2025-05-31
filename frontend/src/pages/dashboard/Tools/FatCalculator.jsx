import React, { useState } from "react";
import { FaMars, FaVenus, FaPlus, FaMinus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const FatCalculator = () => {
  const [gender, setGender] = useState("male");
  const [height, setHeight] = useState(180); // cm
  const [weight, setWeight] = useState(60);  // kg
  const [age, setAge] = useState(20);        // years
  const [fat, setFat] = useState(null);      // body fat %


  const calculateFat = () => {
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    const bfp =
      gender === "male"
        ? (1.2 * bmi + 0.23 * age - 16.2).toFixed(1)
        : (1.2 * bmi + 0.23 * age - 5.4).toFixed(1);
    setFat(bfp);
  };

   const navigate = useNavigate();

  const handleClick = () => {
    navigate('/fat-result'); // Replace with your target route
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm bg-white p-4 rounded-xl shadow-md">
        <div className="text-center font-semibold text-gray-700 text-lg mb-4">
          FAT CALCULATOR
        </div>

        {/* Gender */}
        <div className="flex justify-around mb-6">
          <div
            onClick={() => setGender("male")}
            className={`w-24 h-24 flex flex-col items-center justify-center rounded-full border-2 ${
              gender === "male" ? "border-orange-500 bg-orange-100" : "border-gray-300"
            } cursor-pointer`}
          >
            <FaMars className="text-2xl text-blue-400" />
            <span className="mt-2 font-medium">Male</span>
          </div>
          <div
            onClick={() => setGender("female")}
            className={`w-24 h-24 flex flex-col items-center justify-center rounded-full border-2 ${
              gender === "female" ? "border-orange-500 bg-orange-100" : "border-gray-300"
            } cursor-pointer`}
          >
            <FaVenus className="text-2xl text-orange-400" />
            <span className="mt-2 font-medium">Female</span>
          </div>
        </div>

        {/* Height */}
        <div className="bg-gray-100 rounded-xl p-4 mb-6 shadow-inner text-center">
          <p className="text-sm text-gray-500 mb-2">HEIGHT</p>
          <h2 className="text-3xl font-bold">{height} <span className="text-sm">cm</span></h2>
          <input
            type="range"
            min={100}
            max={220}
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            className="w-full mt-4 accent-orange-500"
          />
        </div>

        {/* Weight and Age */}
        <div className="flex justify-between mb-6">
          <div className="w-1/2 text-center px-2">
            <p className="text-sm text-gray-500 mb-1">WEIGHT</p>
            <h2 className="text-3xl font-bold mb-2">{weight}</h2>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setWeight(weight > 1 ? weight - 1 : 1)}
                className="bg-orange-500 text-white p-2 rounded-full"
              >
                <FaMinus />
              </button>
              <button
                onClick={() => setWeight(weight + 1)}
                className="bg-orange-500 text-white p-2 rounded-full"
              >
                <FaPlus />
              </button>
            </div>
          </div>
          <div className="w-1/2 text-center px-2">
            <p className="text-sm text-gray-500 mb-1">AGE</p>
            <h2 className="text-3xl font-bold mb-2">{age}</h2>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setAge(age > 1 ? age - 1 : 1)}
                className="bg-orange-500 text-white p-2 rounded-full"
              >
                <FaMinus />
              </button>
              <button
                onClick={() => setAge(age + 1)}
                className="bg-orange-500 text-white p-2 rounded-full"
              >
                <FaPlus />
              </button>
            </div>
          </div>
        </div>
  
        <button onClick={handleClick }
        
         className="w-full bg-orange-500
         text-white py-3 rounded-full text-sm
          font-bold">Calculate</button>

        {/* Calculate Button */}
        {/* <button
          onClick={calculateFat}
          className="w-full bg-orange-500 text-white py-3 rounded-full text-sm font-bold"
        >
          CALCULATE
        </button>

        {/* Result */}
         
        {fat && (
          <div className="mt-4 text-center">
            {/* <p className="text-gray-600 text-sm mt-2">Your Body Fat % is</p> */}
            {/* <h2 className="text-2xl font-bold text-orange-600">{fat} %</h2> */}
          </div>
        )}

      </div>
     </div> 
  ); 
};

export default FatCalculator;