import { Link } from "react-router-dom";
import { Weight, Ruler, Gauge } from "lucide-react";

const HealthTools = () => {
  const tools = [
    {
      name: "Weight Tracker",
      description: "Monitor your weight progress",
      bgColor: "bg-green-100",
      iconColor: "bg-green-400",
      buttonColor: "bg-green-400 hover:bg-green-500",
      link: "tools/weight-tracker",
      icon: <Weight className="text-white w-5 h-5" />,
    },
    {
      name: "BMI Calculator",
      description: "Calculate body mass index",
      bgColor: "bg-yellow-100",
      iconColor: "bg-yellow-400",
      buttonColor: "bg-yellow-400 hover:bg-yellow-500",
      link: "tools/bmi",
      icon: <Ruler className="text-white w-5 h-5" />,
    },
    {
      name: "Body Fat Calculator",
      description: "Estimate body fat percentage",
      bgColor: "bg-red-100",
      iconColor: "bg-red-400",
      buttonColor: "bg-red-400 hover:bg-red-500",
      link: "tools/fat-calculator",
      icon: <Gauge className="text-white w-5 h-5" />,
    },
  ];

  return (
    <section className="py-12 bg-white text-center">
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">Health Tools</h2>
      <p className="text-sm font-semibold text-gray-500 mb-10">
        Calculate and track your health metrics
      </p>

      <div className="flex justify-center gap-10 flex-wrap">
        {tools.map((tool, index) => (
          <div
            key={index}
            className={`w-64 p-6 rounded-xl shadow-sm hover:shadow-md transition ${tool.bgColor} cursor-pointer`}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto ${tool.iconColor}`}
            >
              {tool.icon}
            </div>
            <h3 className="text-lg font-medium text-gray-700">{tool.name}</h3>
            <p className="text-sm font-semibold text-gray-500 mt-1">
              {tool.description}
            </p>

            {/* Capsule Button */}
            <Link to={tool.link}>
              <button
                className={`mt-4 px-15 py-1 text-sm text-white rounded-full font-medium transition-transform duration-200 ${tool.buttonColor} hover:scale-105 active:scale-95`}
              >
                Try it out
              </button>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HealthTools;
