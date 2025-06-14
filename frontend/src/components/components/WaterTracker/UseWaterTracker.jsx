// src/hooks/useWaterTracker.js

import { useState, useEffect } from 'react';

const useWaterTracker = () => {
  const [selectedDate, setSelectedDate] = useState(() => {
    // default to today's date in YYYY-MM-DD format
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [waterLogs, setWaterLogs] = useState({}); // logs by date

  // Get total glasses for selected date
  const totalGlasses = waterLogs[selectedDate] || 0;

  // Add 1 glass
  const addGlass = () => {
    setWaterLogs((prev) => ({
      ...prev,
      [selectedDate]: (prev[selectedDate] || 0) + 1,
    }));
  };

  // Reset glasses for selected date
  const resetGlasses = () => {
    setWaterLogs((prev) => ({
      ...prev,
      [selectedDate]: 0,
    }));
  };

  // Change selected date
  const changeDate = (newDate) => {
    setSelectedDate(newDate);
  };

  return {
    selectedDate,
    setSelectedDate: changeDate,
    totalGlasses,
    addGlass,
    resetGlasses,
    waterLogs, // optional, if you want to show a log chart later
  };
};

export default useWaterTracker;
