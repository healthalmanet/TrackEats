import React, { useState, useEffect } from 'react';
import { Plus, X, Bell, Clock, ClipboardCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { reminderCreate, getAllReminder, deleteReminder } from '../../../api/CustomReminderApi';

// --- Helper & UI Components (Now Themed) ---

const SkeletonCard = () => (
  // Uses theme's section, light, and custom border colors
  <div className="flex items-center space-x-4 p-4 bg-section border border-custom rounded-2xl animate-pulse">
    <div className="w-10 h-10 bg-light rounded-full"></div>
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-light rounded w-3/4"></div>
      <div className="h-3 bg-light rounded w-1/2"></div>
    </div>
  </div>
);

const EmptyState = ({ onAddClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="text-center p-8 border-2 border-dashed border-custom rounded-2xl flex flex-col items-center bg-section"
  >
    <ClipboardCheck className="w-16 h-16 text-body/40 mb-4" strokeWidth={1} />
    <h3 className="text-xl font-['Lora'] font-semibold text-heading mb-2">No Reminders Yet</h3>
    <p className="text-body mb-6">Ready to get organized? Add your first reminder.</p>
    <button
      onClick={onAddClick}
      className="bg-primary hover:bg-primary-hover text-light font-bold py-2 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-soft flex items-center gap-2"
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
    className="group flex items-center p-4 bg-section border border-custom rounded-2xl hover:border-primary hover:shadow-lg transition-all duration-300 shadow-soft"
  >
    <div className="flex-shrink-0 w-12 h-12 bg-light rounded-full flex items-center justify-center mr-4">
      <Bell className="text-primary" />
    </div>
    <div className="flex-grow">
      <h3 className="font-bold text-lg text-heading">{reminder.title}</h3>
      <div className="flex items-center text-sm text-body mt-1 space-x-4">
        <span className="flex items-center gap-1.5"><Clock size={14} /> {reminder.reminder_time}</span>
        <span className="capitalize">{reminder.frequency}</span>
      </div>
      {reminder.description && (
        <p className="text-xs text-body/70 mt-2">{reminder.description}</p>
      )}
    </div>
    <motion.button
      whileHover={{ scale: 1.2, rotate: 90 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => onDelete(reminder.id)}
      className="ml-4 p-2 rounded-full text-body/60 hover:text-red hover:bg-light transition-colors"
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
    title: '', time: '', frequency: 'Daily', message: ''
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

  useEffect(() => { fetchReminders(); }, []);

  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSaveReminder = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.time) return;
    if (formData.title.length > 151) {
      alert("Reminder title should not exceed 150 characters.");
      return;
    }
    setSaving(true);
    try {
      await reminderCreate({
        title: formData.title,
        description: formData.message,
        reminder_time: formData.time,
        frequency: formData.frequency.toLowerCase()
      });
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
    visible: { opacity: 1, y: 0, height: 'auto', transition: { type: 'spring', duration: 0.8, bounce: 0.3 } }
  };

  return (
    <div className="min-h-screen bg-main text-body font-['Poppins'] p-4 sm:p-6 lg:p-10">
      <main className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-['Lora'] font-bold text-heading mb-3">
            Your Reminders
          </h1>
          <p className="text-lg text-body">Stay present, stay organized.</p>
        </header>
        
        <AnimatePresence>
          {showForm && (
            <motion.div
              key="form"
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="bg-section border border-custom rounded-3xl p-8 mb-12 shadow-xl"
            >
              <h2 className="text-3xl font-['Lora'] font-bold text-heading mb-6">Create New Reminder</h2>
              <form onSubmit={handleSaveReminder} className="space-y-6">
                <div className="relative">
                  <input
                    type="text" id="title" required
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="peer w-full px-4 py-3 bg-main border-2 border-custom rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition placeholder-transparent text-body"
                    placeholder="e.g., Afternoon stretch break"
                  />
                   <label htmlFor="title" className="absolute left-4 -top-3.5 text-body/70 text-sm transition-all bg-section px-1 peer-placeholder-shown:text-base peer-placeholder-shown:text-body/70 peer-placeholder-shown:top-3.5 peer-placeholder-shown:bg-transparent peer-focus:-top-3.5 peer-focus:text-primary peer-focus:text-sm peer-focus:bg-section">Title</label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input type="time" value={formData.time} onChange={(e) => handleInputChange('time', e.target.value)} required className="w-full px-4 py-3 bg-main border-2 border-custom rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition text-body" />
                    <select value={formData.frequency} onChange={(e) => handleInputChange('frequency', e.target.value)} className="w-full px-4 py-3 bg-main border-2 border-custom rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition text-body">
                        <option>Daily</option> <option>Weekly</option> <option>Custom</option>
                    </select>
                </div>
                 <textarea value={formData.message} onChange={(e) => handleInputChange('message', e.target.value)} placeholder="Add an optional message..." rows={3} className="w-full px-4 py-3 bg-main border-2 border-custom rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition placeholder:text-body/60 text-body" />
                <div className="flex gap-4 pt-4">
                  <button type="submit" disabled={saving} className="flex-1 bg-primary hover:bg-primary-hover text-light py-3 rounded-xl font-semibold shadow-soft transition transform hover:scale-105 disabled:opacity-50 disabled:scale-100">
                    {saving ? 'Saving...' : 'Save Reminder'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="px-8 py-3 bg-light hover:bg-light/80 border border-custom text-body rounded-xl font-semibold transition">
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
                    className="bg-primary hover:bg-primary-hover text-light font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-soft flex items-center gap-2 mx-auto"
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