import { Link } from "react-router-dom";
import { Weight, Ruler, Gauge } from "lucide-react";

const HealthTools = () => {
  // Tools array now uses the "Fresh & Organic" theme's accent color classes
  const tools = [
    {
      name: "Weight Tracker",
      description: "Monitor your weight progress over time",
      icon: Weight,
      // Uses the theme's primary green with opacity
      bgColorClass: "bg-primary/10",
      link: "tools/weight-tracker",
    },
    {
      name: "BMI Calculator",
      description: "Calculate your Body Mass Index quickly",
      icon: Ruler,
      // Uses the theme's sunny yellow with opacity
      bgColorClass: "bg-accent-yellow/10",
      link: "tools/bmi",
    },
    {
      name: "Body Fat Calculator",
      description: "Estimate your body fat percentage",
      icon: Gauge,
      // Uses the theme's warm orange with opacity
      bgColorClass: "bg-accent-orange/10",
      link: "tools/fat-calculator",
    },
  ];

  return (
    // Section uses the theme's white background
    <section className="w-full bg-section py-16 px-6 text-center font-['Poppins']">
      <div className="max-w-4xl mx-auto">
        {/* Headings now use the theme's designated fonts and colors */}
        <h2 className="text-3xl font-['Lora'] font-bold mb-3 text-heading">
          Health Tools
        </h2>
        <p className="text-lg text-body mb-12">
          Calculate and track your key health metrics
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              // Each card uses its theme-based background and a consistent hover effect
              <div
                key={index}
                className={`p-8 rounded-2xl border border-custom shadow-soft transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-2 ${tool.bgColorClass}`}
              >
                {/* The icon container is styled with theme colors */}
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5 mx-auto bg-section shadow-sm border border-custom">
                  <Icon className="text-primary w-8 h-8" />
                </div>
                
                {/* Text uses theme's typography */}
                <h3 className="text-xl font-['Lora'] font-semibold text-heading">{tool.name}</h3>
                <p className="text-base text-body mt-2 h-12">{tool.description}</p>
                
                <Link to={tool.link}>
                  {/* Button is now a primary action button styled by the theme */}
                  <button
                    className="mt-6 px-8 py-3 rounded-full bg-primary text-light font-bold hover:bg-primary-hover transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md shadow-sm"
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