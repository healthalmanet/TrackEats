import { useState } from "react";
import useWaterTracker from "./UseWaterTracker";
import { toast } from "react-hot-toast";

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
      toast.success("Logged 250ml of water!");
      setLastAddedIndex(totalGlasses);

      if (totalGlasses >= maxGlasses) {
        toast("🎉 You've surpassed your goal!", { icon: "💧" });
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
    <div className="w-full bg-white pt-12 pb-20 font-['Poppins'] text-[#263238] px-4 sm:px-8">
      <div className="max-w-5xl mx-auto px-6 sm:px-12 py-10 bg-[#FAF3EB] rounded-2xl shadow-md border border-[#ECEFF1] animate-fade-in-up">
        <h2 className="text-center text-2xl sm:text-3xl font-bold mb-6 text-[#FF7043] drop-shadow-sm">
          Water Intake Tracker 💧
        </h2>

        {/* Date Picker */}
        <div className="flex justify-center mb-6">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-white text-[#263238] border border-[#FF7043] px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F4511E] transition-all"
          />
        </div>

        {/* Capsules */}
        <div className="flex justify-center flex-wrap gap-3 mb-5">
          {Array.from({ length: Math.max(totalGlasses, maxGlasses) }).map((_, i) => (
            <div
              key={i}
              className={`w-5 h-10 sm:w-6 sm:h-12 rounded-full border-2 overflow-hidden relative group transition-all duration-300 ${
                i < totalGlasses
                  ? `border-[#FF7043] ${i === lastAddedIndex ? "animate-fill-up" : "bg-[#FF7043]"}`
                  : "border-[#ECEFF1] bg-white hover:border-[#F4511E]"
              }`}
              title={`Glass ${i + 1}`}
            >
              {i < totalGlasses && i === lastAddedIndex && (
                <div className="absolute bottom-0 left-0 w-full h-full bg-[#FF7043] animate-fill-grow"></div>
              )}
            </div>
          ))}
        </div>

        {/* Progress Text */}
        <p className="text-center font-semibold text-[#546E7A] mb-2">
          {totalGlasses} {totalGlasses > maxGlasses ? "glasses logged" : `out of ${maxGlasses} glasses completed`}
        </p>

        {totalGlasses > maxGlasses && (
          <p className="text-center text-[#F4511E] font-semibold mb-4">
            You've surpassed your goal by {totalGlasses - maxGlasses} glass
            {totalGlasses - maxGlasses > 1 ? "es" : ""}!
          </p>
        )}

        {/* Add Glass Button */}
        <div className="flex justify-center">
          <button
            onClick={handleAddGlass}
            className="bg-[#FF7043] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#F4511E] transition-all duration-200 hover:scale-105 shadow-md"
          >
            + Add Glass
          </button>
        </div>
      </div>

      {/* Custom Capsule Fill Animation */}
      <style>{`
        @keyframes fillGrow {
          0% { height: 0%; }
          100% { height: 100%; }
        }

        .animate-fill-grow {
          animation: fillGrow 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default WaterIntakeWidget;
