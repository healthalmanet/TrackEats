import React, { useState } from 'react';
import { Clock, Droplets, Scale, Pill, Plus, X } from 'lucide-react';

const CustomReminder = () => {
  const [activeReminders, setActiveReminders] = useState([
    { id: 1, type: 'meal', title: 'Breakfast Time', time: '8:00 AM', frequency: 'Daily', icon: '🍳', color: 'bg-green-100 text-green-800' },
    { id: 2, type: 'water', title: 'Hydration Check', time: 'Every 2 hours', frequency: 'Daily', icon: '💧', color: 'bg-blue-100 text-blue-800' },
    { id: 3, type: 'supplement', title: 'Vitamins', time: '9:00 AM', frequency: 'Daily', icon: '💊', color: 'bg-orange-100 text-orange-800' }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'meal',
    title: '',
    time: '',
    frequency: 'Daily',
    days: ['M', 'T', 'W', 'T', 'F'],
    message: ''
  });

  const reminderTypes = [
    { type: 'meal', label: 'Meal Reminder', icon: '🍽️' },
    { type: 'water', label: 'Water Intake', icon: '💧' },
    { type: 'supplement', label: 'Supplement', icon: '💊' },
    { type: 'weigh', label: 'Weigh-in', icon: '⚖️' }
  ];

  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleDay = (day) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  const getColorForType = (type) => {
    const colors = {
      meal: 'bg-green-100 text-green-800',
      water: 'bg-blue-100 text-blue-800',
      supplement: 'bg-orange-100 text-orange-800',
      weigh: 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const handleSaveReminder = () => {
    if (formData.title && formData.time) {
      const newReminder = {
        id: Date.now(),
        type: formData.type,
        title: formData.title,
        time: formData.time,
        frequency: formData.frequency,
        icon: reminderTypes.find(t => t.type === formData.type)?.icon,
        color: getColorForType(formData.type)
      };
      setActiveReminders(prev => [...prev, newReminder]);
      setFormData({
        type: 'meal',
        title: '',
        time: '',
        frequency: 'Daily',
        days: ['M', 'T', 'W', 'T', 'F'],
        message: ''
      });
      setShowForm(false);
    }
  };

  const removeReminder = (id) => {
    setActiveReminders(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Custom Reminders</h1>
            <p className="text-gray-600">Set personalized nutrition and meal reminders to stay on track</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 sm:mt-0 bg-gradient-to-r from-green-400 to-green-500 text-white px-6 py-2 rounded-full font-medium hover:from-green-500 hover:to-green-600 transition-all duration-200 flex items-center gap-2"
          >
            <Plus size={20} />
            Add Reminder
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create New Reminder Form */}
          {showForm && (
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Create New Reminder</h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Reminder Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Breakfast Time"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => handleInputChange('frequency', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Days of Week</label>
                <div className="flex gap-2">
                  {dayLabels.map((day, index) => (
                    <button
                      key={index}
                      onClick={() => toggleDay(day)}
                      className={`w-12 h-12 rounded-full font-medium transition-all duration-200 ${
                        formData.days.includes(day)
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Custom Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="Add a motivational message..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveReminder}
                  className="flex-1 bg-gradient-to-r from-green-400 to-green-500 text-white py-3 rounded-xl font-medium hover:from-green-500 hover:to-green-600 transition-all duration-200"
                >
                  Save Reminder
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Active Reminders */}
          <div className={`${showForm ? 'lg:col-span-1' : 'lg:col-span-2'}`}>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Active Reminders</h2>
              <div className="space-y-4">
                {activeReminders.map((reminder) => (
                  <div key={reminder.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${reminder.color}`}>
                        <span className="text-lg">{reminder.icon}</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{reminder.title}</h3>
                        <p className="text-sm text-gray-600">{reminder.time} • {reminder.frequency}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeReminder(reminder.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CustomReminder;
