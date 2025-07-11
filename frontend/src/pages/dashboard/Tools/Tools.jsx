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

const tools = [
      {
        id: "meal-log",
        title: "Meal Log",
        description: "Track daily meals and monitor nutritional intake.",
        icon: <FiBookOpen className="h-6 w-6" />,
        route: "/dashboard/tools/meal-log",
        iconBg: "bg-green-100",
        hoverBg: "hover:bg-green-50",
      },
      {
        id: "bmi-calculator",
        title: "BMI Calculator",
        description: "Calculate your Body Mass Index with precision.",
        icon: <FiTrendingUp className="h-6 w-6" />,
        route: "/dashboard/tools/bmi",  // ✅ fixed
        iconBg: "bg-blue-100",
        hoverBg: "hover:bg-blue-50",
      },
      {
        id: "weight-tracker",
        title: "Weight Tracker",
        description: "Monitor your weight progress with visual charts.",
        icon: <FiBarChart2 className="h-6 w-6" />,
        route: "/dashboard/tools/weight-tracker",
        iconBg: "bg-purple-100",
        hoverBg: "hover:bg-purple-50",
      },
      {
        id: "nutrition-search",
        title: "Nutrition Search",
        description: "Find detailed nutritional information for any food.",
        icon: <FiSearch className="h-6 w-6" />,
        route: "/dashboard/tools/nutrition-search",  // ✅ fixed,
        iconBg: "bg-orange-100",
        hoverBg: "hover:bg-orange-50",
      },
      {
        id: "body-fat-calculator",
        title: "Body Fat Calculator",
        description: "Analyze your body composition and fat percentage.",
        icon: <FiTarget className="h-6 w-6" />,
        route: "/dashboard/tools/fat-calculator",  // ✅ fixed,
        iconBg: "bg-pink-100",
        hoverBg: "hover:bg-pink-50",
      },
      {
        id: "water-tracker",
        title: "Water Tracker",
        description: "Stay hydrated with daily water intake tracking.",
        icon: <FiDroplet className="h-6 w-6" />,
        route: "/dashboard/tools/water-tracker",
        iconBg: "bg-cyan-100",
        hoverBg: "hover:bg-cyan-50",
      },
      {
id: "health-reminders",
title: "Custom Reminders",
description: "Set personalized alerts for health activities.",
icon: <FiBell className="h-6 w-6" />,
route: "/dashboard/tools/custom-reminder",  // ✅ fixed
iconBg: "bg-yellow-100",
hoverBg: "hover:bg-yellow-50",
      },
    ];

const containerVariants = {
hidden: { opacity: 0 },
visible: {
opacity: 1,
transition: {
staggerChildren: 0.1,
delayChildren: 0.2,
        },
      },
    };

const itemVariants = {
hidden: {
opacity: 0,
y: 20,
scale: 0.95,
      },
visible: {
opacity: 1,
y: 0,
scale: 1,
transition: {
type: "spring",
stiffness: 100,
damping: 15,
        },
      },
    };

const handleToolClick = (route) => {
navigate(route);
    };

return (
<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-r from-green-200/30 to-blue-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-pink-200/20 to-orange-200/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header Section */}
          <motion.div
initial={{ opacity: 0, y: -30 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.8, ease: "easeOut" }}
className="text-center mb-16"
>
<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-poppins bg-gradient-to-r from-[#FF7043] via-[#FF7043] to-[#FF7043] bg-clip-text text-transparent mb-6 drop-shadow-md">
  Health & Wellness Tools
</h1>
<p className="text-lg md:text-xl text-[#546E7A] max-w-3xl mx-auto leading-relaxed">
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
className={`group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer transition-all duration-300 ease-out ${tool.hoverBg} hover:shadow-xl hover:shadow-blue-100/50 hover:scale-105 hover:border-blue-200`}
>
                {/* Icon Container */}
                <div
className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${tool.iconBg} text-gray-700 mb-4 group-hover:scale-110 transition-transform duration-300`}
>
                  {tool.icon}
                </div>

                {/* Content */}
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-900 transition-colors duration-300">
                    {tool.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {tool.description}
                  </p>
                </div>

                {/* Arrow Icon */}
                <div className="flex justify-end">
                  <FiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300 opacity-0 group-hover:opacity-100" />
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom CTA Section */}
          <motion.div
initial={{ opacity: 0, y: 30 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.8, delay: 0.5 }}
className="text-center mt-16 pt-8 border-t border-gray-200"
>
            <p className="text-gray-500 text-sm">
              Start your health journey today with our comprehensive tools
            </p>
          </motion.div>
        </div>
      </div>
    );
  };

export default Tools;

