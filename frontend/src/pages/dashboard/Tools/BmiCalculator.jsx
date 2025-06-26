import React, { useState } from 'react';
import { Calculator, CheckCircle } from 'lucide-react';

export default function BMICalculator() {
  const [gender, setGender] = useState('Male');
  const [age, setAge] = useState('');
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState('lbs');
  const [bmi, setBmi] = useState(null);

  const calculateBMI = () => {
    if (feet && inches && weight) {
      const totalInches = parseInt(feet) * 12 + parseInt(inches);
      const heightInMeters = totalInches * 0.0254;
      
      const weightInKg = weightUnit === 'lbs' 
        ? parseFloat(weight) * 0.453592 
        : parseFloat(weight);
      
      const bmiValue = weightInKg / (heightInMeters * heightInMeters);
      setBmi(bmiValue.toFixed(1));
    }
  };

  const getBMICategory = (bmiValue) => {
    if (bmiValue < 18.5) return { category: 'Underweight', color: 'text-blue-600', range: '< 18.5' };
    if (bmiValue < 25) return { category: 'Normal', color: 'text-green-600', range: '18.5 - 24.9' };
    if (bmiValue < 30) return { category: 'Overweight', color: 'text-orange-600', range: '25 - 29.9' };
    return { category: 'Obese', color: 'text-red-600', range: '> 30' };
  };

  const bmiInfo = bmi ? getBMICategory(parseFloat(bmi)) : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Calculator className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">BMI Calculator</h1>
          <p className="text-gray-600">Calculate your Body Mass Index and track your health progress</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Enter Your Details</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Gender</label>
              <div className="flex gap-4">
                <button
                  onClick={() => setGender('Male')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                    gender === 'Male'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${gender === 'Male' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                  Male
                </button>
                <button
                  onClick={() => setGender('Female')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                    gender === 'Female'
                      ? 'border-pink-500 bg-pink-50 text-pink-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${gender === 'Female' ? 'bg-pink-500' : 'bg-gray-300'}`}></div>
                  Female
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your age"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="number"
                    value={feet}
                    onChange={(e) => setFeet(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="ft"
                  />
                </div>
                <div className="flex-1">
                  <select
                    value={inches}
                    onChange={(e) => setInches(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">in</option>
                    {[...Array(12)].map((_, i) => (
                      <option key={i} value={i}>{i} in</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">Weight</label>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter weight"
                />
                <select 
                  value={weightUnit}
                  onChange={(e) => setWeightUnit(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="lbs">lbs</option>
                  <option value="kg">kg</option>
                </select>
              </div>
            </div>

            <button
              onClick={calculateBMI}
              disabled={!feet || !inches || !weight}
              className="w-full bg-gradient-to-r from-green-500 to-orange-500 text-white font-semibold py-4 rounded-lg hover:from-green-600 hover:to-orange-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Calculate BMI
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Your BMI Result</h2>
            
            <div className="text-center mb-8">
              <div className="text-6xl font-bold text-green-600 mb-2">
                {bmi || '--'}
              </div>
              <div className="text-sm text-gray-500">BMI</div>
              {bmi && bmiInfo && (
                <div className={`mt-2 text-lg font-semibold ${bmiInfo.color}`}>
                  {bmiInfo.category}
                </div>
              )}
            </div>

            <div className="space-y-3 mb-8">
              <h3 className="font-semibold text-gray-700 mb-4">BMI Categories</h3>
              
              <div className={`flex justify-between items-center p-3 rounded-lg ${bmiInfo?.category === 'Underweight' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
                <span className="text-blue-600">Underweight</span>
                <span className="text-sm text-gray-500">&lt; 18.5</span>
              </div>
              
              <div className={`flex justify-between items-center p-3 rounded-lg ${bmiInfo?.category === 'Normal' ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                <span className="text-green-600">Normal</span>
                <span className="text-sm text-gray-500">18.5 - 24.9</span>
              </div>
              
              <div className={`flex justify-between items-center p-3 rounded-lg ${bmiInfo?.category === 'Overweight' ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50'}`}>
                <span className="text-orange-600">Overweight</span>
                <span className="text-sm text-gray-500">25 - 29.9</span>
              </div>
              
              <div className={`flex justify-between items-center p-3 rounded-lg ${bmiInfo?.category === 'Obese' ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
                <span className="text-red-600">Obese</span>
                <span className="text-sm text-gray-500">&gt; 30</span>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-700 mb-3">Health Tips</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Maintain a balanced diet with proper nutrition</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Regular physical activity is essential</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Stay hydrated throughout the day</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Consult healthcare professionals for guidance</span>
                </div>
              </div>
            </div>

            {/* <div className="flex gap-3">
              <button className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors">
                📊 View History
              </button>
              <button className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors">
                💾 Save Result
              </button>
              <button className="flex-1 bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors">
                📤 Share
              </button>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}