// src/hooks/useWaterTracker.js

import { useState, useEffect, useCallback } from 'react';
import { getWater, postWater } from '../../../api/WaterTracker';
import { toast } from 'react-hot-toast';
import { GlassWater, AlertTriangle } from 'lucide-react';
import React from 'react';

const useWaterTracker = () => {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [waterLogs, setWaterLogs] = useState({});
  const totalGlasses = waterLogs[selectedDate] || 0;

  const fetchWaterLogs = useCallback(async (date) => {
    try {
      const response = await getWater(date);
      const results = Array.isArray(response.results) ? response.results : [];
      const totalMl = results.reduce((sum, entry) => sum + (entry.amount_ml || 0), 0);
      const glasses = Math.floor(totalMl / 250);
      setWaterLogs((prev) => ({ ...prev, [date]: glasses }));
    } catch (err) {
      console.error("❌ Failed to fetch water data for date:", date, err);
      setWaterLogs((prev) => ({ ...prev, [date]: 0 }));
    }
  }, []);

  const addGlass = async () => {
    try {
      await postWater({ amount_ml: 250, date: selectedDate }); 
      await fetchWaterLogs(selectedDate); 
      
      toast.success("Water logged successfully!", {
        icon: <GlassWater size={20} className="text-[var(--color-primary)]" />,
        style: {
          borderRadius: '12px',
          background: 'var(--color-bg-surface)',
          color: 'var(--color-text-strong)',
          border: '2px solid var(--color-border-default)',
        },
      });
      return true;
    } catch (error) {
      console.error("❌ Error logging water:", error);
      toast.error("Could not log water. Please try again.", {
        icon: <AlertTriangle size={20} className="text-[var(--color-danger-text)]" />,
      });
      return false;
    }
  };

  const resetGlasses = () => {
    setWaterLogs((prev) => ({ ...prev, [selectedDate]: 0 }));
    toast.error("Water for this day has been reset locally.");
  };

  useEffect(() => {
    fetchWaterLogs(selectedDate);
  }, [selectedDate, fetchWaterLogs]);

  return {
    selectedDate,
    setSelectedDate,
    totalGlasses,
    addGlass,
    resetGlasses,
    waterLogs,
  };
};

export default useWaterTracker;