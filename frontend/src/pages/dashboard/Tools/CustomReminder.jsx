import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { reminderCreate, getAllReminder, deleteReminder } from '../../../api/CustomReminderApi';

const CustomReminder = () => {
  const [activeReminders, setActiveReminders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    time: '',
    frequency: 'Daily',
    message: ''
  });

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const data = await getAllReminder();
      setActiveReminders(Array.isArray(data.results) ? data.results : []);
    } catch (error) {
      console.error("Error fetching reminders:", error);
      setActiveReminders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveReminder = async () => {
    if (formData.title && formData.time) {
      try {
        setSaving(true);
        const payload = {
          title: formData.title,
          description: formData.message,
          reminder_time: formData.time,
          frequency: formData.frequency.toLowerCase()
        };
        await reminderCreate(payload);
        await fetchReminders();
        setShowForm(false);
        setFormData({ title: '', time: '', frequency: 'Daily', message: '' });
      } catch (error) {
        console.error("Error saving reminder:", error);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleDeleteReminder = async (id) => {
    try {
      await deleteReminder(id);
      setActiveReminders(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error("Failed to delete reminder:", error);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Custom Reminders</h1>
            <p className="text-gray-600">Set personalized nutrition and meal reminders to stay on track</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 sm:mt-0 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-medium transition-all duration-200 flex items-center gap-2"
          >
            <Plus size={20} /> Add Reminder
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {showForm && (
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-orange-100 p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900">Create New Reminder</h2>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Reminder Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Breakfast Time"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => handleInputChange('frequency', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Custom Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="Add a motivational message..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSaveReminder}
                  disabled={saving}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Reminder'}
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

          <div className={showForm ? 'lg:col-span-1' : 'lg:col-span-2'}>
            <div className="bg-white rounded-2xl shadow-md border border-orange-100 p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900">Active Reminders</h2>
              {loading ? (
                <p className="text-gray-500">Loading reminders...</p>
              ) : activeReminders.length === 0 ? (
                <p className="text-gray-500">No reminders yet.</p>
              ) : (
                <div className="space-y-4">
                  {activeReminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-200"
                    >
                      <div>
                        <h3 className="font-medium text-gray-900">{reminder.title}</h3>
                        <p className="text-sm text-orange-700">{reminder.reminder_time} • {reminder.frequency}</p>
                        <p className="text-xs text-gray-500">{reminder.description}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteReminder(reminder.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomReminder;
