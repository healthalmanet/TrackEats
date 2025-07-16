import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    FiBookOpen,
    FiTrendingUp,
    FiTarget,
    FiSearch,
    FiBarChart2,
    FiDroplet,
    FiBell,
    FiArrowRight,
  } from "react-icons/fi";

const Tools = () => {
  const navigate = useNavigate();

  // The tools array is updated to use the "Fresh & Organic" theme's accent colors.
  const tools = [
    {
      id: "meal-log",
      title: "Meal Log",
      description: "Track daily meals and monitor nutritional intake.",
      icon: <FiBookOpen className="h-6 w-6" />,
      route: "/dashboard/tools/meal-log",
      iconBg: "bg-primary/10", // Using theme's primary accent
    },
    {
      id: "bmi-calculator",
      title: "BMI Calculator",
      description: "Calculate your Body Mass Index with precision.",
      icon: <FiTrendingUp className="h-6 w-6" />,
      route: "/dashboard/tools/bmi",
      iconBg: "bg-accent-orange/10", // Using theme's orange accent
    },
    {
      id: "weight-tracker",
      title: "Weight Tracker",
      description: "Monitor your weight progress with visual charts.",
      icon: <FiBarChart2 className="h-6 w-6" />,
      route: "/dashboard/tools/weight-tracker",
      iconBg: "bg-accent-coral/10", // Using theme's coral accent
    },
    {
      id: "nutrition-search",
      title: "Nutrition Search",
      description: "Find detailed nutritional information for any food.",
      icon: <FiSearch className="h-6 w-6" />,
      route: "/dashboard/tools/nutrition-search",
      iconBg: "bg-primary/10",
    },
    {
      id: "body-fat-calculator",
      title: "Body Fat Calculator",
      description: "Analyze your body composition and fat percentage.",
      icon: <FiTarget className="h-6 w-6" />,
      route: "/dashboard/tools/fat-calculator",
      iconBg: "bg-accent-yellow/10", // Using theme's yellow accent
    },
    {
      id: "water-tracker",
      title: "Water Tracker",
      description: "Stay hydrated with daily water intake tracking.",
      icon: <FiDroplet className="h-6 w-6" />,
      route: "/dashboard/tools/water-tracker",
      iconBg: "bg-accent-orange/10",
    },
    {
      id: "health-reminders",
      title: "Custom Reminders",
      description: "Set personalized alerts for health activities.",
      icon: <FiBell className="h-6 w-6" />,
      route: "/dashboard/tools/custom-reminder",
      iconBg: "bg-accent-yellow/10",
    },
  ];

  // Animation variants can remain as they control logic, not style.
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  const handleToolClick = (route) => {
    navigate(route);
  };

  return (
    // Replaced the complex gradient background with the theme's simple 'bg-main'
    <div className="min-h-screen bg-main font-['Poppins']">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          {/* H1 is now styled with the theme's heading font and color */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-['Lora'] font-bold text-heading mb-6">
            Health & Wellness Tools
          </h1>
          <p className="text-lg md:text-xl text-body max-w-3xl mx-auto leading-relaxed">
            A suite of precision tools to accelerate your health and nutrition goals.
          </p>
        </motion.div>

        {/* Tools Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {tools.map((tool) => (
            <motion.div
              key={tool.id}
              variants={itemVariants}
              onClick={() => handleToolClick(tool.route)}
              // Cards now use theme's section background, border, shadow, and hover states
              className="group relative bg-section rounded-2xl p-6 shadow-soft border border-custom cursor-pointer transition-all duration-300 ease-out hover:shadow-lg hover:border-primary hover:scale-105"
            >
              {/* Icon Container with themed background and icon color */}
              <div
                className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${tool.iconBg} text-primary mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                {tool.icon}
              </div>

              {/* Content with themed text colors */}
              <div className="mb-4">
                <h3 className="text-xl font-['Lora'] font-semibold text-heading mb-2 group-hover:text-primary transition-colors duration-300">
                  {tool.title}
                </h3>
                <p className="text-body text-sm leading-relaxed">
                  {tool.description}
                </p>
              </div>

              {/* Arrow Icon with themed colors */}
              <div className="flex justify-end">
                <FiArrowRight className="w-5 h-5 text-body/60 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300 opacity-0 group-hover:opacity-100" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mt-16 pt-8 border-t border-custom"
        >
          <p className="text-body/80 text-sm">
            Start your health journey today with our comprehensive tools
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Tools;