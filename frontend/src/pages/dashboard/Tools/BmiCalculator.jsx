import React, { useState } from 'react';
import { Calculator } from 'lucide-react';
// import BMIResult from './BMIResult';
// import HealthTips from './HealthTips';
// import ActionButtons from './ActionButtons';

const BMICalculator = () => {
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [heightUnit, setHeightUnit] = useState('cm');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [bmi, setBmi] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const calculateBMI = () => {
    if (!height || !weight) return;

    let heightInMeters = parseFloat(height);
    if (heightUnit === 'cm') {
      heightInMeters = heightInMeters / 100;
    }

    let weightInKg = parseFloat(weight);
    if (weightUnit === 'lbs') {
      weightInKg = weightInKg * 0.453592;
    }

    const bmiResult = weightInKg / (heightInMeters * heightInMeters);
    setBmi(bmiResult);
    setShowResults(true);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="text-center py-8 px-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <Calculator className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">BMI Calculator</h1>
        <p className="text-gray-600">Calculate your Body Mass Index and track your health progress</p>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Left Section - Form */}
        <div className="lg:w-1/2 p-6 border-r border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Enter Your Details</h2>
          
          {/* Gender Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Gender</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={gender === 'male'}
                  onChange={(e) => setGender(e.target.value)}
                  className="mr-2 text-green-600 focus:ring-green-500"
                />
                <span className="text-gray-700">Male</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={gender === 'female'}
                  onChange={(e) => setGender(e.target.value)}
                  className="mr-2 text-green-600 focus:ring-green-500"
                />
                <span className="text-gray-700">Female</span>
              </label>
            </div>
          </div>

          {/* Age Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
            <input
              type="number"
              placeholder="Enter your age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Height Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="170"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <select
                value={heightUnit}
                onChange={(e) => setHeightUnit(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="cm">cm</option>
                <option value="ft">ft</option>
              </select>
            </div>
          </div>

          {/* Weight Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Weight</label>
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="70"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <select
                value={weightUnit}
                onChange={(e) => setWeightUnit(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="kg">kg</option>
                <option value="lbs">lbs</option>
              </select>
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculateBMI}
            className="w-full bg-gradient-to-r from-green-500 to-orange-400 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-600 hover:to-orange-500 transition-all duration-200 transform hover:scale-105"
          >
            Calculate BMI
          </button>
        </div>

        {/* Right Section - Results */}
        <div className="lg:w-1/2 p-6">
          {showResults ? (
            <BMIResult bmi={bmi} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <Calculator className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">Enter your details and click</p>
                <p className="text-lg">"Calculate BMI" to see results</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Health Tips Section - Only show after results */}
      {showResults && (
        <div className="px-6 pb-6">
          <HealthTips />
        </div>
      )}

      {/* Action Buttons - Only show after results */}
      {showResults && (
        <div className="px-6 pb-6">
          <ActionButtons />
        </div>
      )}
    </div>
  );
};

export default BMICalculator;