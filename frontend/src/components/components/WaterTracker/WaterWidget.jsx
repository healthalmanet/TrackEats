import { useState } from "react";
import useWaterTracker from "./UseWaterTracker";
import { toast } from "react-hot-toast";
import { GlassWater } from "lucide-react"; // The perfect icon for this component

const WaterIntakeWidget = ({ onWaterLogged }) => {
  const {
    selectedDate,
    setSelectedDate,
    totalGlasses,
    addGlass,
  } = useWaterTracker();

  const maxGlasses = 10;
  const [lastAddedIndex, setLastAddedIndex] = useState(null);

  const handleAddGlass = async () => {
    const success = await addGlass();
    if (success) {
      setLastAddedIndex(totalGlasses);

      if (totalGlasses >= maxGlasses) {
        // Using a themed icon in the toast
        toast("🎉 You've surpassed your goal!", { icon: <GlassWater className="text-primary" /> });
      }

      if (typeof onWaterLogged === "function") {
        onWaterLogged();
      }

      setTimeout(() => {
        setLastAddedIndex(null);
      }, 1000);
    }
  };

  return (
    <div className="w-full bg-section pt-12 pb-16 font-['Poppins'] text-heading px-4 sm:px-8">
      <div className="max-w-3xl mx-auto px-6 sm:px-12 py-10 bg-main rounded-xl shadow-soft border border-custom transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
        
        {/* Heading now uses a clean Lucide icon */}
        <h2 
          className="text-center text-2xl sm:text-3xl font-['Lora'] font-bold mb-8 text-heading flex items-center justify-center gap-2"
        >
          Water Intake Tracker <GlassWater className="h-8 w-8 text-primary" />
        </h2>

        <div className="flex justify-center mb-8">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            className="bg-section text-heading border border-custom px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all"
          />
        </div>

        <div className="flex justify-center flex-wrap gap-4 mb-6">
          {Array.from({ length: Math.max(totalGlasses, maxGlasses) }).map((_, i) => (
            <div
              key={i}
              className={`w-5 h-10 sm:w-6 sm:h-12 rounded-full border-2 overflow-hidden relative group transition-all duration-300 ${
                i < totalGlasses
                  ? `border-primary ${i === lastAddedIndex ? "" : "bg-primary"}`
                  : "border-custom bg-section hover:border-primary"
              }`}
              title={`Glass ${i + 1}`}
            >
              {i < totalGlasses && i === lastAddedIndex && (
                <div className="absolute bottom-0 left-0 w-full h-full bg-primary animate-fill-grow"></div>
              )}
            </div>
          ))}
        </div>

        <p className="text-center font-semibold text-lg text-body mb-2">
          {totalGlasses} {totalGlasses >= maxGlasses ? "glasses logged" : `of ${maxGlasses} glasses completed`}
        </p>

        {totalGlasses > maxGlasses && (
          <p className="text-center text-primary font-semibold mb-4">
            You've surpassed your goal by {totalGlasses - maxGlasses} glass
            {totalGlasses - maxGlasses > 1 ? "es" : ""}!
          </p>
        )}

        <div className="flex justify-center mt-6">
          {/* Add Glass Button now uses a descriptive icon */}
          <button
            onClick={handleAddGlass}
            className="bg-primary text-light px-8 py-3 rounded-full font-semibold hover:bg-primary-hover transition-all duration-300 transform hover:-translate-y-1 shadow-soft hover:shadow-lg flex items-center gap-2"
          >
            <GlassWater size={20} /> Add a Glass
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fillGrow {
          from { height: 0%; }
          to { height: 100%; }
        }
        .animate-fill-grow {
          animation: fillGrow 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default WaterIntakeWidget;