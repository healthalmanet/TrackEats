import React, { useState, useEffect } from 'react';
import { Plus, X, Bell, Clock, ClipboardCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { reminderCreate, getAllReminder, deleteReminder } from '../../../api/CustomReminderApi';

// --- Helper & UI Components ---

const AuroraBackground = () => (
  <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
    <div
      className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-orange-400/30 to-rose-400/30 rounded-full filter blur-3xl opacity-50 animate-pulse"
    />
    <div
      className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-teal-300/30 to-blue-400/30 rounded-full filter blur-3xl opacity-50 animate-pulse-slow"
    />
  </div>
);

const SkeletonCard = () => (
  <div className="flex items-center space-x-4 p-4 bg-white/50 border border-gray-200 rounded-2xl animate-pulse">
    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
);

const EmptyState = ({ onAddClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="text-center p-8 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center bg-white/30"
  >
    <ClipboardCheck className="w-16 h-16 text-gray-400 mb-4" strokeWidth={1} />
    <h3 className="text-xl font-semibold text-gray-800 mb-2">No Reminders Yet</h3>
    <p className="text-gray-500 mb-6">Ready to get organized? Add your first reminder.</p>
    <button
      onClick={onAddClick}
      className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg shadow-orange-500/20 flex items-center gap-2"
    >
      <Plus size={20} />
      Create a Reminder
    </button>
  </motion.div>
);

const ReminderCard = ({ reminder, onDelete }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, x: -50, transition: { duration: 0.3 } }}
    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    className="group flex items-center p-4 bg-white/60 backdrop-blur-sm border border-gray-200/80 rounded-2xl hover:bg-white/90 transition-all duration-300 shadow-lg shadow-gray-200/60"
  >
    <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-4">
      <Bell className="text-orange-500" />
    </div>
    <div className="flex-grow">
      <h3 className="font-bold text-lg text-gray-800">{reminder.title}</h3>
      <div className="flex items-center text-sm text-gray-500 mt-1 space-x-4">
        <span className="flex items-center gap-1.5"><Clock size={14} /> {reminder.reminder_time}</span>
        <span className="capitalize">{reminder.frequency}</span>
      </div>
      {reminder.description && (
        <p className="text-xs text-gray-400 mt-2">{reminder.description}</p>
      )}
    </div>
    <motion.button
      whileHover={{ scale: 1.2, rotate: 90 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => onDelete(reminder.id)}
      className="ml-4 p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-100/80 transition-colors"
    >
      <X size={20} />
    </motion.button>
  </motion.div>
);

// --- Main Component ---

const CustomReminder = () => {
  const [reminders, setReminders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
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
      setReminders(Array.isArray(data.results) ? data.results : []);
    } catch (error) {
      console.error("Error fetching reminders:", error);
      setReminders([]);
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

  const handleSaveReminder = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.time) return;
    if (formData.title.length > 151) {
      alert("Reminder title should not exceed 150 characters.");
      return;
    }
    setSaving(true);
    try {
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
  };

  const handleDeleteReminder = async (id) => {
    try {
      await deleteReminder(id);
      setReminders(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error("Failed to delete reminder:", error);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: -50, height: 0 },
    visible: {
      opacity: 1,
      y: 0,
      height: 'auto',
      transition: { type: 'spring', duration: 0.8, bounce: 0.3 }
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50 text-gray-800 font-sans p-4 sm:p-6 lg:p-10 transition-colors duration-300">
      <AuroraBackground />

      <main className="max-w-4xl mx-auto relative z-10">
        <header className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-serif font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-rose-500 mb-3">
            Your Reminders
          </h1>
          <p className="text-lg text-gray-600">Stay present, stay organized.</p>
        </header>
        
        <AnimatePresence>
          {showForm && (
            <motion.div
              key="form"
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="bg-white/70 backdrop-blur-xl border border-gray-200 rounded-3xl p-8 mb-12 shadow-2xl shadow-gray-200/80"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Create New Reminder</h2>
              <form onSubmit={handleSaveReminder} className="space-y-6">
                <div className="relative">
                  <input
                    type="text" id="title" required
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="peer w-full px-4 py-3 bg-gray-100/50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none transition placeholder-transparent text-gray-900"
                    placeholder="e.g., Afternoon stretch break"
                  />
                   <label htmlFor="title" className="absolute left-4 -top-3.5 text-gray-500 text-sm transition-all bg-white/0 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3.5 peer-focus:-top-3.5 peer-focus:text-orange-600 peer-focus:text-sm">Title</label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input type="time" value={formData.time} onChange={(e) => handleInputChange('time', e.target.value)} required className="w-full px-4 py-3 bg-gray-100/50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none transition text-gray-900" />
                    <select value={formData.frequency} onChange={(e) => handleInputChange('frequency', e.target.value)} className="w-full px-4 py-3 bg-gray-100/50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none transition text-gray-900">
                        <option>Daily</option>
                        <option>Weekly</option>
                        <option>Custom</option>
                    </select>
                </div>
                 <textarea value={formData.message} onChange={(e) => handleInputChange('message', e.target.value)} placeholder="Add an optional message..." rows={3} className="w-full px-4 py-3 bg-gray-100/50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none transition placeholder-gray-400 text-gray-900" />
                <div className="flex gap-4 pt-4">
                  <button type="submit" disabled={saving} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-orange-500/30 transition transform hover:scale-105 disabled:opacity-50 disabled:scale-100">
                    {saving ? 'Saving...' : 'Save Reminder'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
            {loading ? (
                Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            ) : reminders.length === 0 ? (
                <EmptyState onAddClick={() => setShowForm(true)} />
            ) : (
                <AnimatePresence>
                    {reminders.map((reminder) => (
                        <ReminderCard key={reminder.id} reminder={reminder} onDelete={handleDeleteReminder} />
                    ))}
                </AnimatePresence>
            )}
        </div>
        
        {!showForm && reminders.length > 0 && (
             <div className="mt-12 text-center">
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg shadow-orange-500/20 flex items-center gap-2 mx-auto"
                >
                    <Plus size={20} />
                    Add Another Reminder
                </button>
             </div>
        )}
      </main>
    </div>
  );
};

export default CustomReminder;