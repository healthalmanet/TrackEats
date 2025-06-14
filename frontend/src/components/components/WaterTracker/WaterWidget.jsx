import useWaterTracker from "./UseWaterTracker";

const WaterIntakeWidget = () => {
  const {
    selectedDate,
    setSelectedDate,
    totalGlasses,
    addGlass,
  } = useWaterTracker();

  const maxGlasses = 8;

  return (
    <div className="w-full bg-blue-100 py-10 mt-20">
      <div className="max-w-4xl mx-auto px-6 rounded-2xl shadow-lg bg-white py-10">
        <h2 className="text-center text-2xl font-bold text-gray-800 mb-6">
          Water Intake Tracker
        </h2>

        {/* Date Picker - Styled */}
        <div className="flex justify-center mb-6">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-blue-300 text-gray-700 px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
          />
        </div>

        {/* Vertical Capsule Indicators */}
        <div className="flex justify-center flex-wrap gap-3 mb-5">
          {Array.from({ length: maxGlasses }).map((_, i) => (
            <div
              key={i}
              className={`w-5 h-10 sm:w-6 sm:h-12 rounded-full border-2 transition-all duration-300 ${
                i < totalGlasses ? "bg-blue-500 border-blue-500" : "bg-white border-gray-300"
              }`}
              title={`Glass ${i + 1}`}
            />
          ))}
        </div>

        {/* Progress Text */}
        <p className="text-center text-gray-600 mb-4">
          {totalGlasses} out of {maxGlasses} glasses completed
        </p>

        {/* Add Glass Button */}
        <div className="flex justify-center">
          <button
            onClick={addGlass}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-semibold"
            disabled={totalGlasses >= maxGlasses}
          >
            + Add Glass
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaterIntakeWidget;
