import { Link } from "react-router-dom";
import { Weight, Ruler, Gauge } from "lucide-react";

const HealthTools = () => {
  const tools = [
    {
      name: "Weight Tracker",
      description: "Monitor your weight progress",
      icon: Weight,
      bgColor: "#E8F5E9", // soft green for the first card
      link: "tools/weight-tracker",
    },
    {
      name: "BMI Calculator",
      description: "Calculate body mass index",
      icon: Ruler,
      bgColor: "#FFF8E1",
      link: "tools/bmi",
    },
    {
      name: "Body Fat Calculator",
      description: "Estimate body fat percentage",
      icon: Gauge,
      bgColor: "#E3F2FD",
      link: "tools/fat-calculator",
    },
  ];

  return (
    <section className="w-full bg-white py-16 px-6 text-center font-['Poppins'] text-[#263238]">
      <h2 className="text-3xl font-bold mb-2 text-[#FF7043] drop-shadow-sm">Health Tools</h2>
      <p className="text-sm font-medium text-[#546E7A] mb-10">
        Calculate and track your health metrics
      </p>

      <div className="flex justify-center gap-10 flex-wrap">
        {tools.map((tool, index) => {
          const Icon = tool.icon;
          return (
            <div
              key={index}
              className="w-72 p-6 rounded-2xl border border-[#ECEFF1] shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in-up"
              style={{ backgroundColor: tool.bgColor }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto bg-white border border-[#FF7043] shadow-sm">
                <Icon className="text-[#FF7043] w-6 h-6 drop-shadow-md" />
              </div>

              <h3 className="text-lg font-semibold text-[#263238]">{tool.name}</h3>
              <p className="text-sm text-[#546E7A] mt-1">{tool.description}</p>

              <Link to={tool.link}>
                <button
                  className="mt-5 px-6 py-2 rounded-full border-none bg-[#FF7043] text-white font-semibold hover:bg-[#F4511E] transition-all duration-300 hover:scale-105 shadow-md"
                >
                  Try it out
                </button>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default HealthTools;
