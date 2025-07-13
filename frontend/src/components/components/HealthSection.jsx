import { Link } from "react-router-dom";
import { Weight, Ruler, Gauge } from "lucide-react";

const HealthTools = () => {
  // Updated tools array to use Tailwind CSS classes directly from the "Warm Analytics" theme
  const tools = [
    {
      name: "Weight Tracker",
      description: "Monitor your weight progress",
      icon: Weight,
      // Uses the Green Tint from the theme
      bgColorClass: "bg-[#AED581]/20",
      link: "tools/weight-tracker",
    },
    {
      name: "BMI Calculator",
      description: "Calculate body mass index",
      icon: Ruler,
      // Uses the Yellow Tint from the theme
      bgColorClass: "bg-[#FFF9C4]/40",
      link: "tools/bmi",
    },
    {
      name: "Body Fat Calculator",
      description: "Estimate body fat percentage",
      icon: Gauge,
      // Uses the Blue Tint from the theme
      bgColorClass: "bg-[#B3E5FC]/30",
      link: "tools/fat-calculator",
    },
  ];

  return (
    // Section has a white background and uses Roboto as the base font
    <section className="w-full bg-white py-16 px-6 text-center font-['Roboto']">
      <div className="max-w-4xl mx-auto">
        {/* Headings now use the theme's typography and colors */}
        <h2 
          className="text-3xl font-bold mb-3 text-[#263238] font-['Poppins']"
          style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.1)' }}
        >
          Health Tools
        </h2>
        <p className="text-lg text-[#546E7A] mb-12">
          Calculate and track your health metrics
        </p>

        {/* Layout is preserved, but card styles are enhanced */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">




          {tools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              // Each card now uses its theme-based background color and enhanced hover effect
              <div
  key={index}
  className={`min-w-[18rem] p-8 rounded-2xl border border-[#ECEFF1] shadow-md transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-2 ${tool.bgColorClass}`}
  style={{ overflow: 'visible' }}
>


                {/* The icon container is styled like others in the theme */}
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5 mx-auto bg-white shadow-sm border border-slate-200">
                  <Icon className="text-[#FF7043] w-8 h-8" />
                </div>
                
                {/* Text uses theme's typography */}
                <h3 className="text-xl font-semibold text-[#263238] font-['Poppins']">{tool.name}</h3>
                <p className="text-base text-[#546E7A] mt-2 h-12">{tool.description}</p>
                
                <Link to={tool.link}>
                  {/* Button now has an enhanced hover effect consistent with the theme */}
                  <button
                    className="mt-6 px-8 py-3 rounded-full border-none bg-[#FF7043] text-white font-bold font-['Roboto'] hover:bg-[#F4511E] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg shadow-md"
                  >
                    Try it out
                  </button>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HealthTools;