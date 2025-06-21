import React, { useState } from 'react';

const HealthTabs = () => {
  const [activeTab, setActiveTab] = useState('Diabetes');

  const tabs = ['Diabetes', 'Thyroid', 'Heart'];

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex gap-2 bg-white rounded-xl shadow p-2 max-w-max">
        {tabs.map((tab) => (
          <label key={tab} className="cursor-pointer">
            <input
              type="radio"
              name="health-tab"
              value={tab}
              checked={activeTab === tab}
              onChange={() => setActiveTab(tab)}
              className="hidden"
            />
            <div
              className={`px-4 py-2 rounded-lg text-sm font-medium transition duration-200 ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab}
            </div>
          </label>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'Diabetes' && (
          <div className="text-gray-800">
            {/* Replace with your full diabetes dashboard component */}
            <h2 className="text-lg font-semibold">Diabetes Dashboard</h2>
            <p>Latest HbA1c, sugar levels, trends, and charts...</p>
          </div>
        )}
        {activeTab === 'Thyroid' && (
          <div className="text-gray-800">
            {/* Replace with your full thyroid dashboard component */}
            <h2 className="text-lg font-semibold">Thyroid Dashboard</h2>
            <p>TSH, T3, T4 trends and analytics...</p>
          </div>
        )}
        {activeTab === 'Heart' && (
          <div className="text-gray-800">
            {/* Replace with your full heart dashboard component */}
            <h2 className="text-lg font-semibold">Heart Dashboard</h2>
            <p>Cholesterol, heart rate, ECG analytics...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthTabs;
