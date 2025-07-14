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

  // Logic remains completely unchanged
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
    // Section has a white background and uses Roboto as the base font
    <div className="w-full bg-white  pt-12 pb-16 font-['Roboto'] text-[#263238] px-4 sm:px-8">
      {/* The card uses the theme's light beige tint and has themed hover effects */}
      <div className="max-w-3xl mx-auto px-6 sm:px-12 py-10 bg-[#FFFDF9] rounded-xl shadow-md border border-[#ECEFF1] transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
        {/* Heading uses Poppins, Charcoal Gray color, and theme's text shadow */}
        <h2 
          className="text-center text-2xl sm:text-3xl font-bold mb-8 text-[#263238] font-['Poppins']"
          style={{ textShadow: '1px 1px 3px rba(0,0,0,0.1)' }}
        >
          Water Intake Tracker 💧
        </h2>

        {/* Date Picker is styled to match the theme's inputs */}
        <div className="flex justify-center mb-8">
          
         <input
  type="date"
  value={selectedDate}
  onChange={(e) => setSelectedDate(e.target.value)}
  max={new Date().toISOString().split("T")[0]} // 🔒 Prevents future dates
  className="bg-white text-[#263238] border border-[#ECEFF1] px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#FFEDD5] focus:border-[#FF7043] transition-all"
/>


        </div>

        {/* Capsules are visually aligned with theme colors */}
        <div className="flex justify-center flex-wrap gap-4 mb-6">
          {Array.from({ length: Math.max(totalGlasses, maxGlasses) }).map((_, i) => (
            <div
              key={i}
              className={`w-5 h-10 sm:w-6 sm:h-12 rounded-full border-2 overflow-hidden relative group transition-all duration-300 ${
                i < totalGlasses
                  // Filled capsule uses the primary accent color
                  ? `border-[#FF7043] ${i === lastAddedIndex ? "" : "bg-[#FF7043]"}`
                  // Empty capsule uses the theme's pale border and softer hover
                  : "border-[#ECEFF1] bg-white hover:border-[#FFC9B6]"
              }`}
              title={`Glass ${i + 1}`}
            >
              {/* Animation color is the primary accent */}
              {i < totalGlasses && i === lastAddedIndex && (
                <div className="absolute bottom-0 left-0 w-full h-full bg-[#FF7043] animate-fill-grow"></div>
              )}
            </div>
          ))}
        </div>

        {/* Progress Text uses Roboto font and Slate Gray color */}
        <p className="text-center font-semibold text-lg text-[#546E7A] mb-2">
          {totalGlasses} {totalGlasses >= maxGlasses ? "glasses logged" : `of ${maxGlasses} glasses completed`}
        </p>

        {/* Surpassed goal text uses the theme's darker accent color */}
        {totalGlasses > maxGlasses && (
          <p className="text-center text-[#F4511E] font-semibold mb-4">
            You've surpassed your goal by {totalGlasses - maxGlasses} glass
            {totalGlasses - maxGlasses > 1 ? "es" : ""}!
          </p>
        )}

        {/* Add Glass Button styled with the theme's primary button style */}
        <div className="flex justify-center mt-6">
          <button
            onClick={handleAddGlass}
            className="bg-[#FF7043] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#F4511E] transition-all duration-300 transform hover:-translate-y-1 shadow-md hover:shadow-lg"
          >
            + Add Glass
          </button>
        </div>
      </div>

      {/* Custom Capsule Fill Animation remains unchanged */}
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