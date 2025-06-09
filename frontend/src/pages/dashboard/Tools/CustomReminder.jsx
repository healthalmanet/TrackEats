import React, { useState, useEffect } from 'react';


// Simple icon components using Unicode symbols
const Bell = () => <span className="text-2xl">🔔</span>;
const Plus = ({ className }) => <span className={className}>+</span>;
const Edit3 = ({ className }) => <span className={className}>✏️</span>;
const Trash2 = ({ className }) => <span className={className}>🗑️</span>;
const X = ({ className }) => <span className={className}>✕</span>;
const Repeat = ({ className }) => <span className={className}>🔄</span>;

const CustomReminder = () => {
  const [reminders, setReminders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    frequency: 'once'
  });

  // Load reminders from localStorage on component mount
  useEffect(() => {
    const savedReminders = localStorage.getItem('customReminders');
    if (savedReminders) {
      setReminders(JSON.parse(savedReminders));
    }
  }, []);

  // Save reminders to localStorage whenever reminders change
  useEffect(() => {
    localStorage.setItem('customReminders', JSON.stringify(reminders));
  }, [reminders]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      frequency: 'once'
    });
    setEditingReminder(null);
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) return;

    const reminderData = {
      id: editingReminder ? editingReminder.id : Date.now(),
      ...formData,
      createdAt: editingReminder ? editingReminder.createdAt : new Date().toISOString()
    };

    if (editingReminder) {
      setReminders(prev => prev.map(r => r.id === editingReminder.id ? reminderData : r));
    } else {
      setReminders(prev => [...prev, reminderData]);
    }

    resetForm();
    setShowForm(false);
  };

  const handleEdit = (reminder) => {
    setFormData({
      title: reminder.title,
      description: reminder.description,
      date: reminder.date,
      time: reminder.time,
      frequency: reminder.frequency
    });
    setEditingReminder(reminder);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const formatDateTime = (date, time) => {
    if (!date && !time) return '';
    const dateObj = new Date(date + 'T' + time);
    return dateObj.toLocaleString('en-US', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFrequencyDisplay = (frequency) => {
    const frequencyMap = {
      once: 'Once',
      daily: 'Everyday',
      weekly: 'Weekly',
      monthly: 'Monthly'
    };
    return frequencyMap[frequency] || 'Once';
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <h1 className="text-xl font-semibold text-center text-gray-800">
          REMINDER
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        {reminders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96">
            <div className="text-6xl mb-4">🔔</div>
            <p className="text-gray-600 text-center">
              You have not created any reminders yet!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <div key={reminder.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-800">{reminder.title}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(reminder)}
                      className="p-1 text-gray-600 hover:text-blue-600 text-sm"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(reminder.id)}
                      className="p-1 text-gray-600 hover:text-red-600 text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                {reminder.description && (
                  <p className="text-gray-600 text-sm mb-2">{reminder.description}</p>
                )}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{formatDateTime(reminder.date, reminder.time)}</span>
                  <div className="flex items-center">
                    <span className="text-orange-400 mr-1">🔄</span>
                    <span>{getFrequencyDisplay(reminder.frequency)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors text-2xl"
      >
        +
      </button>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-t-3xl max-h-[90vh] overflow-y-auto">
            {/* Form Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="p-2 text-xl"
              >
                ✕
              </button>
              <h2 className="text-lg font-semibold">
                {editingReminder ? 'Edit Reminder' : 'New Reminder'}
              </h2>
              <div className="w-9"></div>
            </div>

            {/* Form Content */}
            <div className="p-4 space-y-6">
              {/* Date & Time Picker */}
              <div className="flex justify-center space-x-4 text-3xl font-light text-gray-800 mb-6">
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="text-center bg-transparent border-none outline-none"
                  required
                />
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  className="text-center bg-transparent border-none outline-none"
                  required
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="  "
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder=" "
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequency
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="once">Once</option>
                  <option value="daily">Everyday</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                <div className="flex items-center mt-2 text-orange-500">
                  <span className="mr-1">🔄</span>
                  <span className="text-sm">{getFrequencyDisplay(formData.frequency)}</span>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-between pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-8 py-3 text-orange-500 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
                >
                  {editingReminder ? 'Update' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomReminder;