import React, { useState } from "react";
import { FaMars, FaVenus, FaCalculator, FaClipboard } from "react-icons/fa";

export default function FatCalculator() {
  const [gender, setGender] = useState("male");
  const [height, setHeight] = useState(170);
  const [age, setAge] = useState(25);
  const [weight, setWeight] = useState(70);
  const [result, setResult] = useState(null);

  const calculateFat = () => {
    const bmi = weight / Math.pow(height / 100, 2);
    let fat = 0;
    if (gender === "male") {
      fat = 1.2 * bmi + 0.23 * age - 16.2;
    } else {
      fat = 1.2 * bmi + 0.23 * age - 5.4;
    }
    setResult(fat.toFixed(1));
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center font-sans">
      <div className="w-full max-w-4xl bg-white p-8 rounded-xl shadow-md grid grid-cols-1 md:grid-cols-2 gap-6 border border-orange-100">
        {/* Left Section - Input */}
        <div>
          <h2 className="text-xl font-semibold mb-6 text-orange-700">Enter Your Details</h2>

          <div className="mb-4">
            <label className="font-medium mb-1 block text-orange-600">Gender</label>
            <div className="flex gap-2">
              <button
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition ${
                  gender === "male"
                    ? "bg-orange-500 text-white"
                    : "bg-white text-gray-700 border border-orange-300"
                }`}
                onClick={() => setGender("male")}
              >
                <FaMars /> Male
              </button>
              <button
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition ${
                  gender === "female"
                    ? "bg-orange-500 text-white"
                    : "bg-white text-gray-700 border border-orange-300"
                }`}
                onClick={() => setGender("female")}
              >
                <FaVenus /> Female
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-1 text-orange-600">Height (cm)</label>
            <input
              type="range"
              min="100"
              max="220"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full accent-orange-500"
            />
            <div className="text-right text-sm mt-1 text-gray-600">{height} cm</div>
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-1 text-orange-600">Age (years)</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAge(age > 1 ? age - 1 : 1)}
                className="bg-orange-100 px-3 py-1 rounded-md text-orange-600"
              >
                -
              </button>
              <span className="w-12 text-center">{age}</span>
              <button
                onClick={() => setAge(age + 1)}
                className="bg-orange-100 px-3 py-1 rounded-md text-orange-600"
              >
                +
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block font-medium mb-1 text-orange-600">Weight (kg)</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWeight(weight > 1 ? weight - 1 : 1)}
                className="bg-orange-100 px-3 py-1 rounded-md text-orange-600"
              >
                -
              </button>
              <span className="w-12 text-center">{weight}</span>
              <button
                onClick={() => setWeight(weight + 1)}
                className="bg-orange-100 px-3 py-1 rounded-md text-orange-600"
              >
                +
              </button>
            </div>
          </div>

          <button
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
            onClick={calculateFat}
          >
            <FaCalculator /> Calculate Fat
          </button>
        </div>

        {/* Right Section - Result */}
        <div className="flex flex-col items-center justify-center text-center px-4">
          <h2 className="text-xl font-semibold mb-4 text-orange-700">Your Results</h2>
          {result ? (
            <div className="text-3xl font-bold text-orange-600">{result}% Body Fat</div>
          ) : (
            <div className="text-gray-500 flex flex-col items-center gap-2">
              <FaClipboard className="text-3xl text-orange-300" />
              <p className="text-sm">
                Your body fat calculation results will appear here once you enter your details and
                click "Calculate Fat".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
