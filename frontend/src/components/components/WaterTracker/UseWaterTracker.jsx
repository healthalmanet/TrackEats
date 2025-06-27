import { useState, useEffect } from 'react';
import { getWater,postWater } from '../../../api/WaterTracker';
import { toast } from 'react-hot-toast';

const useWaterTracker = () => {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [waterLogs, setWaterLogs] = useState({});
  const totalGlasses = waterLogs[selectedDate] || 0;

  const fetchWaterLogs = async (date) => {
    try {
      const response = await getWater(date);
      const totalMl = response.results.reduce((sum, entry) => sum + entry.amount_ml, 0);
      const glasses = Math.floor(totalMl / 250);
      setWaterLogs((prev) => ({
        ...prev,
        [date]: glasses,
      }));
    } catch (err) {
      console.error("❌ Failed to fetch water data:", err);
    }
  };

  const addGlass = async () => {
    try {
      await postWater({ amount_ml: 250, date: selectedDate }); // 💧 Log 250ml
      await fetchWaterLogs(selectedDate); // 🌀 Refresh
      toast.success("250ml of water logged!");
      return true;
    } catch (error) {
      console.error("❌ Error logging water:", error);
      toast.error("Failed to log water");
      return false;
    }
  };

  const resetGlasses = () => {
    setWaterLogs((prev) => ({
      ...prev,
      [selectedDate]: 0,
    }));
  };

  useEffect(() => {
    fetchWaterLogs(selectedDate);
  }, [selectedDate]);

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
