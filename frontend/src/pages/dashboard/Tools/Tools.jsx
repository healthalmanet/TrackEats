import React, { useState } from 'react';
import { Scale, Calculator, Zap, Search, Droplets, Bell, Plus, Menu, ChevronRight, Wrench, Book, Percent, } from 'lucide-react';
import { FaWeight } from "react-icons/fa";
import { FaDroplet } from "react-icons/fa6";
const Tools = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [weight, setWeight] = useState('');
  const [waterIntake, setWaterIntake] = useState(0);
  const [meals, setMeals] = useState([]);
  const [bmi, setBmi] = useState(null);
  const [height, setHeight] = useState('');
  const [reminders, setReminders] = useState([]);

  const tools = [
    {
      id: 'meal-log',
      name: 'Meal Log',
      description: 'Track your daily meals and monitor nutritional intake with detailed logging.',
      icon: <div className="w-6 flex items-center justify-center h-6 bg-green-100 rounded">< Book className='h-4 w-4 text-green-500 ' /></div>,
      color: 'green'
    },
    {
      id: 'bmi-calculator',
      name: 'BMI Calculator',
      description: 'Calculate your Body Mass Index and understand your health status.',
      icon: <div className="w-6 flex items-center justify-center h-6 bg-orange-100 rounded"><Calculator className="w-4 h-4 text-yellow-500" /></div>,
     
      color: 'yellow'
    },
    {
      id: 'fat-calculator',
      name: 'Fat Calculator',
      description: 'Analyze your body fat percentage and composition metrics.',
      icon:  <div className="w-6 flex items-center justify-center h-6 bg-orange-100 rounded"><Percent className="w-4 h-4 text-yellow-500" /></div>
     ,
      color: 'orange'
    },
    {
      id: 'nutrition-search',
      name: 'Nutrition Search',
      description: 'Search and explore nutritional information for countless products.',
      icon:  <div className="w-6 flex items-center justify-center h-6 bg-green-100 rounded"><Search className="w-4 h-4 text-green-500" /></div>
     ,
      color: 'green'
    }
  ];

  const trackers = [
    {
      id: 'weight-tracker',
      name: 'Weight Tracker',
      description: 'Monitor your weight progress with detailed charts and history.',
      icon: <div className="w-6 flex items-center justify-center h-6 bg-green-100 rounded"><FaWeight className=" text-blue-500" /></div>
    
,
      color: 'blue'
    },
    {
      id: 'water-tracker',
      name: 'Water Tracker',
      description: 'Stay hydrated by tracking your daily water intake goals.',
      icon: <div className="w-6 flex items-center justify-center h-6 bg-green-100 rounded"><FaDroplet className=" text-blue-500" /></div>
,
      color: 'cyan'
    }
  ];

  const addMeal = () => {
    setMeals([...meals, { id: Date.now(), name: '', calories: 0, time: new Date().toLocaleTimeString() }]);
  };

  const addWater = (amount) => {
    setWaterIntake(prev => prev + amount);
  };

  const calculateBMI = () => {
    if (weight && height) {
      const heightInMeters = height / 100;
      const bmiValue = (weight / (heightInMeters * heightInMeters)).toFixed(1);
      setBmi(bmiValue);
    }
  };

  const addReminder = () => {
    const newReminder = {
      id: Date.now(),
      text: 'Drink water',
      time: new Date().toLocaleTimeString(),
      type: 'hydration'
    };
    setReminders([...reminders, newReminder]);
  };

  const ToolCard = ({ tool, onClick }) => (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer group"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {tool.icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
            {tool.name}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {tool.description}
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors" />
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          Track Eat Rest Repeat
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Powerful Tools for Your{' '}
          <span className="text-green-500">Health Journey</span>
        </h1>
        <p className="text-gray-600 text-lg leading-relaxed">
          Access comprehensive tracking tools, calculators, and personalized 
          recommendations to achieve your nutrition and fitness goals.
        </p>
      </div>

      {/* Tools Section */}
      <div>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <div className="w-5 h-5 bg-green-500 rounded justify-items-center flex p-0.5"><Wrench  className='w-3 h-3 m-0.5 text-white '/></div>
          </div>
         
          <h2 className="text-2xl font-bold text-gray-900">  Tools</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {tools.map((tool) => (
            <ToolCard 
              key={tool.id} 
              tool={tool} 
              onClick={() => setActiveSection(tool.id)}
            />
          ))}
        </div>
      </div>

      {/* Tracker Section */}
      <div>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Scale className="w-4 h-4 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Tracker</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {trackers.map((tracker) => (
            <ToolCard 
              key={tracker.id} 
              tool={tracker} 
              onClick={() => setActiveSection(tracker.id)}
            />
          ))}
        </div>
      </div>

      {/* Reminder Section */}
      <div>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
            <Bell className="w-4 h-4 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Reminder</h2>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Bell className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">Custom Reminder</h3>
              <p className="text-sm text-gray-600 mb-4">
                Set personalized reminders for meals, water, medications, and more.
              </p>
              <button 
                onClick={addReminder}
                className="bg-purple-50 text-purple-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors"
              >
                Add Reminder
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Ready to Transform Your Health?
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Start using our powerful tools today and take control of your nutrition journey.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors">
            Get Started Now
          </button>
          <button className="bg-white text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors border border-gray-200">
            Watch Demo
          </button>
        </div>
      </div>
    </div>
  );

  const renderWeightTracker = () => (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => setActiveSection('dashboard')}
          className="text-gray-500 hover:text-gray-700"
        >
          ← Back
        </button>
        <h2 className="text-3xl font-bold text-gray-900">Weight Tracker</h2>
      </div>
      
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Weight (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your weight"
            />
          </div>
          
          {weight && (
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Current Weight</h3>
              <p className="text-2xl font-bold text-blue-600">{weight} kg</p>
              <p className="text-sm text-blue-700 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderWaterTracker = () => (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => setActiveSection('dashboard')}
          className="text-gray-500 hover:text-gray-700"
        >
          ← Back
        </button>
        <h2 className="text-3xl font-bold text-gray-900">Water Tracker</h2>
      </div>
      
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Daily Water Intake</h3>
            <div className="text-4xl font-bold text-cyan-600 mb-4">{waterIntake}ml</div>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
              <div 
                className="bg-cyan-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((waterIntake / 2000) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">Goal: 2000ml per day</p>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {[250, 500, 750].map((amount) => (
              <button
                key={amount}
                onClick={() => addWater(amount)}
                className="bg-cyan-50 text-cyan-700 py-3 px-4 rounded-lg font-medium hover:bg-cyan-100 transition-colors"
              >
                +{amount}ml
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderBMICalculator = () => (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => setActiveSection('dashboard')}
          className="text-gray-500 hover:text-gray-700"
        >
          ← Back
        </button>
        <h2 className="text-3xl font-bold text-gray-900">BMI Calculator</h2>
      </div>
      
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="70"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="175"
              />
            </div>
          </div>
          
          <button
            onClick={calculateBMI}
            className="w-full bg-yellow-500 text-white py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
          >
            Calculate BMI
          </button>
          
          {bmi && (
            <div className="bg-yellow-50 p-6 rounded-lg text-center">
              <h3 className="font-semibold text-yellow-900 mb-2">Your BMI</h3>
              <p className="text-3xl font-bold text-yellow-600 mb-2">{bmi}</p>
              <p className="text-sm text-yellow-700">
                {bmi < 18.5 ? 'Underweight' : 
                 bmi < 25 ? 'Normal weight' : 
                 bmi < 30 ? 'Overweight' : 'Obese'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {activeSection === 'dashboard' && renderDashboard()}
        {activeSection === 'weight-tracker' && renderWeightTracker()}
        {activeSection === 'water-tracker' && renderWaterTracker()}
        {activeSection === 'bmi-calculator' && renderBMICalculator()}
        
        {/* Footer */}
        {activeSection === 'dashboard' && (
          <footer className="mt-16 pt-12 border-t border-gray-200">
            <div className="grid md:grid-cols-4 gap-8 text-sm">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-green-500 rounded"></div>
                  <span className="font-bold text-gray-900">TrackEats</span>
                </div>
                <p className="text-gray-600">Smart nutrition tracking for a healthier lifestyle. Monitor, analyze, and optimize your daily nutrition intake.

</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Quick Links</h4>
                <ul className="space-y-2 text-gray-600">
                  <li>Dashboard</li>
                  <li>Tools</li>
                  <li>Tracker</li>
                  <li>Support</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Legal</h4>
                <ul className="space-y-2 text-gray-600">
                  <li>Privacy Policy</li>
                  <li>Terms of Service</li>
                  <li>Contact</li>
                </ul>
              </div>
              <div className="text-right text-gray-500">
                <p>© 2024 • TrackEats • All rights reserved.</p>
              </div>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};

export default Tools;