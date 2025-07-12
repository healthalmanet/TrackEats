import React, { useState } from 'react';
import { Calculator, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

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

      const weightInKg =
        weightUnit === 'lbs'
          ? parseFloat(weight) * 0.453592
          : parseFloat(weight);

      const bmiValue = weightInKg / (heightInMeters * heightInMeters);
      setBmi(bmiValue.toFixed(1));
    }
  };

  const getBMICategory = (bmiValue) => {
    if (bmiValue < 18.5)
      return { category: 'Underweight', color: 'text-blue-600', range: '< 18.5' };
    if (bmiValue < 25)
      return { category: 'Normal', color: 'text-green-600', range: '18.5 - 24.9' };
    if (bmiValue < 30)
      return { category: 'Overweight', color: 'text-orange-600', range: '25 - 29.9' };
    return { category: 'Obese', color: 'text-red-600', range: '> 30' };
  };

  const bmiInfo = bmi ? getBMICategory(parseFloat(bmi)) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full shadow-lg mb-4 animate-bounce">
            <Calculator className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-4xl font-bold text-orange-700 mb-2 tracking-tight">BMI Calculator</h1>
          <p className="text-gray-600 text-lg">Know your body mass index and stay fit</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white border border-orange-100 rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
          >
            <h2 className="text-2xl font-semibold text-orange-700 mb-6">Enter Your Details</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-orange-600 mb-2">Gender</label>
              <div className="flex gap-4">
                {['Male', 'Female'].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-2 transition-all duration-200 ease-in-out ${
                      gender === g ? 'border-orange-500 bg-orange-100 text-orange-700 scale-105' : 'border-gray-200 hover:border-orange-300 hover:scale-105'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${
                      gender === g ? 'bg-orange-500' : 'bg-gray-300'
                    }`}></div>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-orange-600 mb-2">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                placeholder="Enter your age"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-orange-600 mb-2">Height</label>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={feet}
                  onChange={(e) => setFeet(e.target.value)}
                  className="w-1/2 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  placeholder="Feet"
                />
                <select
                  value={inches}
                  onChange={(e) => setInches(e.target.value)}
                  className="w-1/2 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                  <option value="">Inches</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i} value={i}>{i} in</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-orange-600 mb-2">Weight</label>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-3/4 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  placeholder="Enter weight"
                />
                <select
                  value={weightUnit}
                  onChange={(e) => setWeightUnit(e.target.value)}
                  className="w-1/4 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                  <option value="lbs">lbs</option>
                  <option value="kg">kg</option>
                </select>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={calculateBMI}
              disabled={!feet || !inches || !weight}
              className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
            >
              Calculate BMI
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white border border-orange-100 rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
          >
            <h2 className="text-2xl font-semibold text-orange-700 mb-6">Your BMI Result</h2>

            <div className="text-center mb-8">
              <div className="text-6xl font-bold text-orange-600 mb-1 tracking-tight">
                {bmi || '--'}
              </div>
              <div className="text-sm text-gray-500">BMI</div>
              {bmi && bmiInfo && (
                <div className={`mt-2 text-xl font-semibold ${bmiInfo.color}`}>{bmiInfo.category}</div>
              )}
            </div>

            <div className="space-y-3 mb-8">
              <h3 className="font-semibold text-orange-600 mb-4">BMI Categories</h3>
              {[
                { name: 'Underweight', color: 'blue', range: '< 18.5' },
                { name: 'Normal', color: 'green', range: '18.5 - 24.9' },
                { name: 'Overweight', color: 'orange', range: '25 - 29.9' },
                { name: 'Obese', color: 'red', range: '> 30' }
              ].map((item) => (
                <div
                  key={item.name}
                  className={`flex justify-between items-center p-3 rounded-xl ${
                    bmiInfo?.category === item.name
                      ? `bg-${item.color}-100 border border-${item.color}-300`
                      : 'bg-gray-50'
                  }`}
                >
                  <span className={`text-${item.color}-700 font-medium`}>{item.name}</span>
                  <span className="text-sm text-gray-600">{item.range}</span>
                </div>
              ))}
            </div>

            <div className="bg-orange-50 rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-orange-700 mb-3">Health Tips</h3>
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
