import React, { useState } from 'react';
import { Calculator, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

// Data for BMI categories
const bmiCategories = [
  {
    name: 'Underweight',
    range: '< 18.5',
    colorClasses: {
      bg: 'bg-blue-100',
      border: 'border-blue-300',
      text: 'text-blue-600',
    },
  },
  {
    name: 'Normal',
    range: '18.5 - 24.9',
    colorClasses: {
      bg: 'bg-green-100',
      border: 'border-green-300',
      text: 'text-green-600',
    },
  },
  {
    name: 'Overweight',
    range: '25 - 29.9',
    colorClasses: {
      bg: 'bg-orange-100',
      border: 'border-orange-300',
      text: 'text-orange-600',
    },
  },
  {
    name: 'Obese',
    range: '> 30',
    colorClasses: {
      bg: 'bg-red-100',
      border: 'border-red-300',
      text: 'text-red-600',
    },
  },
];

const getBMICategory = (bmiValue) => {
  if (bmiValue < 18.5) return bmiCategories[0];
  if (bmiValue < 25) return bmiCategories[1];
  if (bmiValue < 30) return bmiCategories[2];
  return bmiCategories[3];
};

export default function BMICalculator() {
  const [gender, setGender] = useState('Male');
  const [age, setAge] = useState('');
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState('lbs');
  const [bmi, setBmi] = useState(null);

  const calculateBMI = () => {
    const numFeet = parseInt(feet);
    const numInches = parseInt(inches);
    const numWeight = parseFloat(weight);

    if (!isNaN(numFeet) && !isNaN(numInches) && !isNaN(numWeight) && numWeight > 0) {
      const totalInches = numFeet * 12 + numInches;
      const heightInMeters = totalInches * 0.0254;

      if (heightInMeters === 0) return;

      const weightInKg =
        weightUnit === 'lbs'
          ? numWeight * 0.453592
          : numWeight;

      const bmiValue = weightInKg / (heightInMeters * heightInMeters);
      setBmi(bmiValue.toFixed(1));
    }
  };

  const bmiInfo = bmi ? getBMICategory(parseFloat(bmi)) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 bg-orange-100 rounded-full shadow-lg mb-4">
            {/* --- MODIFIED: Brighter icon color --- */}
            <Calculator className="w-7 h-7 text-orange-500" />
          </div>
          {/* --- MODIFIED: Brighter heading color --- */}
          <h1 className="text-3xl font-bold text-orange-500 mb-2 tracking-tight">BMI Calculator</h1>
          <p className="text-gray-600">Know your body mass index and stay fit</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white border border-orange-100 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
          >
            {/* --- MODIFIED: Brighter heading color --- */}
            <h2 className="text-xl font-semibold text-orange-500 mb-5">Enter Your Details</h2>

            <div className="mb-5">
              <label className="block text-sm font-medium text-orange-600 mb-2">Gender</label>
              <div className="flex gap-4">
                {['Male', 'Female'].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-200 ease-in-out ${
                      gender === g ? 'border-orange-500 bg-orange-100 text-orange-700 scale-105' : 'border-gray-200 hover:border-orange-300 hover:scale-105'
                    }`}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full ${gender === g ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-orange-600 mb-2">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                placeholder="Enter your age"
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-orange-600 mb-2">Height</label>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={feet}
                  onChange={(e) => setFeet(e.target.value)}
                  className="w-1/2 px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  placeholder="Feet"
                />
                <select
                  value={inches}
                  onChange={(e) => setInches(e.target.value)}
                  className="w-1/2 px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                  <option value="">Inches</option>
                  {[...Array(12)].map((_, i) => (<option key={i} value={i}>{i} in</option>))}
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-orange-600 mb-2">Weight</label>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-3/4 px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  placeholder="Enter weight"
                />
                <select
                  value={weightUnit}
                  onChange={(e) => setWeightUnit(e.target.value)}
                  className="w-1/4 px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                  <option value="lbs">lbs</option>
                  <option value="kg">kg</option>
                </select>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={calculateBMI}
              disabled={!feet || inches === '' || !weight}
              className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Calculate BMI
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white border border-orange-100 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
          >
            {/* --- MODIFIED: Brighter heading color --- */}
            <h2 className="text-xl font-semibold text-orange-500 mb-5">Your BMI Result</h2>

            <div className="text-center mb-6">
              {/* --- MODIFIED: Brighter result color --- */}
              <div className="text-5xl font-bold text-orange-500 mb-1 tracking-tight">
                {bmi || '--'}
              </div>
              <div className="text-sm text-gray-500">BMI</div>
              {bmiInfo && (
                <div className={`mt-2 text-lg font-semibold ${bmiInfo.colorClasses.text}`}>{bmiInfo.name}</div>
              )}
            </div>

            <div className="space-y-3 mb-6">
              {/* --- MODIFIED: Brighter heading color --- */}
              <h3 className="font-semibold text-orange-500 mb-3">BMI Categories</h3>
              {bmiCategories.map((item) => (
                <div
                  key={item.name}
                  className={`flex justify-between items-center p-3 rounded-lg transition-all ${
                    bmiInfo?.name === item.name ? `${item.colorClasses.bg} ${item.colorClasses.border} border` : 'bg-gray-50'
                  }`}
                >
                  <span className={`${bmiInfo?.name === item.name ? bmiInfo.colorClasses.text : 'text-gray-700'} font-medium text-sm`}>{item.name}</span>
                  <span className="text-sm text-gray-600">{item.range}</span>
                </div>
              ))}
            </div>

            <div className="bg-orange-50 rounded-xl p-4 shadow-inner">
              {/* --- MODIFIED: Brighter heading color --- */}
              <h3 className="font-semibold text-orange-500 mb-3">Health Tips</h3>
              <div className="space-y-2 text-sm text-gray-700">
                {[
                  'Maintain a balanced diet with proper nutrition',
                  'Regular physical activity is essential',
                  'Stay hydrated throughout the day',
                  'Consult healthcare professionals for guidance'
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}