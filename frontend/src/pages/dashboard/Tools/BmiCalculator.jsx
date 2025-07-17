import React, { useState } from 'react';
import { Calculator, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

// Data for BMI categories, now using "Fresh & Organic" theme colors
const bmiCategories = [
  {
    name: 'Underweight',
    range: '< 18.5',
    colorClasses: {
      bg: 'bg-accent-yellow/10',
      border: 'border-accent-yellow',
      text: 'text-accent-yellow',
    },
  },
  {
    name: 'Normal',
    range: '18.5 - 24.9',
    colorClasses: {
      bg: 'bg-primary/10',
      border: 'border-primary',
      text: 'text-primary',
    },
  },
  {
    name: 'Overweight',
    range: '25 - 29.9',
    colorClasses: {
      bg: 'bg-accent-orange/10',
      border: 'border-accent-orange',
      text: 'text-accent-orange',
    },
  },
  {
    name: 'Obese',
    range: '> 30',
    colorClasses: {
      bg: 'bg-red/10',
      border: 'border-red',
      text: 'text-red',
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
      const weightInKg = weightUnit === 'lbs' ? numWeight * 0.453592 : numWeight;
      const bmiValue = weightInKg / (heightInMeters * heightInMeters);
      setBmi(bmiValue.toFixed(1));
    }
  };

  const bmiInfo = bmi ? getBMICategory(parseFloat(bmi)) : null;

  return (
    <div className="min-h-screen bg-main py-10 px-4 sm:px-6 lg:px-8 font-['Poppins']">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-full shadow-soft mb-4">
            <Calculator className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl font-['Lora'] font-bold text-heading mb-2 tracking-tight">BMI Calculator</h1>
          <p className="text-body">Know your body mass index and stay fit</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-section border border-custom rounded-2xl shadow-soft p-6 hover:shadow-lg transition-shadow duration-300"
          >
            <h2 className="text-xl font-['Lora'] font-semibold text-heading mb-5">Enter Your Details</h2>

            <div className="mb-5">
              <label className="block text-sm font-medium text-heading mb-2">Gender</label>
              <div className="flex gap-4">
                {['Male', 'Female'].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-200 ease-in-out ${
                      gender === g ? 'border-primary bg-primary/10 text-primary scale-105' : 'border-custom text-body hover:border-primary/50 hover:scale-105'
                    }`}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full ${gender === g ? 'bg-primary' : 'bg-light'}`}></div>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-heading mb-2">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-4 py-2.5 bg-main border border-custom rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-body"
                placeholder="Enter your age"
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-heading mb-2">Height</label>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={feet}
                  onChange={(e) => setFeet(e.target.value)}
                  className="w-1/2 px-4 py-2.5 bg-main border border-custom rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-body"
                  placeholder="Feet"
                />
                <select
                  value={inches}
                  onChange={(e) => setInches(e.target.value)}
                  className="w-1/2 px-4 py-2.5 bg-main border border-custom rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-body"
                >
                  <option value="">Inches</option>
                  {[...Array(12)].map((_, i) => (<option key={i} value={i}>{i} in</option>))}
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-heading mb-2">Weight</label>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-3/4 px-4 py-2.5 bg-main border border-custom rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-body"
                  placeholder="Enter weight"
                />
                <select
                  value={weightUnit}
                  onChange={(e) => setWeightUnit(e.target.value)}
                  className="w-1/4 px-4 py-2.5 bg-main border border-custom rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-body"
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
              className="w-full bg-primary text-light font-bold py-3 rounded-lg hover:bg-primary-hover transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Calculate BMI
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-section border border-custom rounded-2xl shadow-soft p-6 hover:shadow-lg transition-shadow duration-300"
          >
            <h2 className="text-xl font-['Lora'] font-semibold text-heading mb-5">Your BMI Result</h2>

            <div className="text-center mb-6">
              <div className={`text-5xl font-bold ${bmiInfo ? bmiInfo.colorClasses.text : 'text-heading'} mb-1 tracking-tight`}>
                {bmi || '--'}
              </div>
              <div className="text-sm text-body">BMI</div>
              {bmiInfo && (
                <div className={`mt-2 text-lg font-semibold ${bmiInfo.colorClasses.text}`}>{bmiInfo.name}</div>
              )}
            </div>

            <div className="space-y-3 mb-6">
              <h3 className="font-semibold text-heading mb-3">BMI Categories</h3>
              {bmiCategories.map((item) => (
                <div
                  key={item.name}
                  className={`flex justify-between items-center p-3 rounded-lg transition-all ${
                    bmiInfo?.name === item.name ? `${item.colorClasses.bg} ${item.colorClasses.border} border-2` : 'bg-light'
                  }`}
                >
                  <span className={`${bmiInfo?.name === item.name ? item.colorClasses.text : 'text-body'} font-medium text-sm`}>{item.name}</span>
                  <span className="text-sm text-body/80">{item.range}</span>
                </div>
              ))}
            </div>

            <div className="bg-primary/10 rounded-xl p-4 shadow-inner">
              <h3 className="font-semibold text-primary mb-3">Health Tips</h3>
              <div className="space-y-2 text-sm text-body">
                {[
                  'Maintain a balanced diet with proper nutrition',
                  'Regular physical activity is essential',
                  'Stay hydrated throughout the day',
                  'Consult healthcare professionals for guidance'
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
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