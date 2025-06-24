
import { useState, useEffect } from 'react';
import { logWaterGlass } from '../../../api/water'; // Your API file
import { toast } from 'react-hot-toast';

const GLASS_SIZE_ML = 250;

const useWaterTracker = () => {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [waterLogs, setWaterLogs] = useState({}); // { "2025-06-23": 2, ... }

  const totalGlasses = waterLogs[selectedDate] || 0;

  
  

  // Add a glass and log to backend
  const addGlass = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Login required');
      return;
    }

    try {
      await logWaterGlass(token); // logs 500ml to backend
      // Update local log (1 glass = 250ml, 500ml = 2 glasses)
      setWaterLogs((prev) => ({
        ...prev,
        [selectedDate]: (prev[selectedDate] || 0) + 1,
      }));
      toast.success('Logged 500ml (1 glasses) of water');
    } catch (error) {
      console.error('❌ Failed to log water to backend:', error);
      toast.error('Failed to sync with server');
    }
  };

  const resetGlasses = () => {
    setWaterLogs((prev) => ({
      ...prev,
      [selectedDate]: 0,
    }));
    // Optional: add API reset if needed
  };

  const changeDate = (newDate) => {
    setSelectedDate(newDate);
  };

  return {
    selectedDate,
    setSelectedDate: changeDate,
    totalGlasses,
    addGlass,
    resetGlasses,
    waterLogs,
  };
};

export default useWaterTracker;
