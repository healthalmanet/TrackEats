import { useState, useEffect, useCallback } from 'react';
import { getWater, postWater } from '../../../api/WaterTracker';
import { toast } from 'react-hot-toast';
import { GlassWater } from 'lucide-react'; // A nice icon for the toast

const useWaterTracker = () => {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [waterLogs, setWaterLogs] = useState({});
  const totalGlasses = waterLogs[selectedDate] || 0;

  // useCallback ensures this function isn't recreated on every render
  const fetchWaterLogs = useCallback(async (date) => {
    try {
      const response = await getWater(date);
      // Ensure results is an array before reducing
      const results = Array.isArray(response.results) ? response.results : [];
      const totalMl = results.reduce((sum, entry) => sum + (entry.amount_ml || 0), 0);
      const glasses = Math.floor(totalMl / 250);
      setWaterLogs((prev) => ({
        ...prev,
        [date]: glasses,
      }));
    } catch (err) {
      console.error("❌ Failed to fetch water data for date:", date, err);
      // Set to 0 for the given date if fetch fails to avoid stale data
      setWaterLogs((prev) => ({
        ...prev,
        [date]: 0,
      }));
    }
  }, []);

  const addGlass = async () => {
    try {
      // Log 250ml for the currently selected date
      await postWater({ amount_ml: 250, date: selectedDate }); 
      
      // Refresh the logs for the current date
      await fetchWaterLogs(selectedDate); 
      
      // Themed success toast
      toast.success("Water logged successfully!", {
        icon: <GlassWater size={20} className="text-primary" />,
        style: {
          borderRadius: '10px',
          background: 'var(--color-bg-section)',
          color: 'var(--color-text-heading)',
          border: '1px solid var(--color-border)',
        },
      });
      return true;
    } catch (error) {
      console.error("❌ Error logging water:", error);
      toast.error("Could not log water. Please try again.");
      return false;
    }
  };

  // This function is less common in a real app, as logs are usually deleted, not reset locally.
  // Kept for completeness based on original code.
  const resetGlasses = () => {
    setWaterLogs((prev) => ({
      ...prev,
      [selectedDate]: 0,
    }));
    toast.error("Water for this day has been reset locally.");
  };

  // Fetch logs when the component mounts or the selected date changes
  useEffect(() => {
    fetchWaterLogs(selectedDate);
  }, [selectedDate, fetchWaterLogs]);

  return {
    selectedDate,
    setSelectedDate: (date) => setSelectedDate(date),
    totalGlasses,
    addGlass,
    resetGlasses,
    waterLogs,
  };
};

export default useWaterTracker;