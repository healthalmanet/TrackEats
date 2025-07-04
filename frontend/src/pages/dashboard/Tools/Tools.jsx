// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const Tools = () => {
  const navigate = useNavigate();
  
  const tools = [
  {
    id: "meal-log",
    title: "Meal Log",
    description: "Track your daily meals and monitor nutritional intake with detailed logging.",
    icon: "🍽️",
    color: "bg-green-100 text-green-600",
    route: "/dashboard/tools/meal-log"  // ✅ fixed
  },
  {
    id: "bmi-calculator",
    title: "BMI Calculator",
    description: "Calculate your Body Mass Index and understand your health status.",
    icon: "📊",
    color: "bg-yellow-100 text-yellow-600",
    route: "/dashboard/tools/bmi"  // ✅ fixed
  },
  {
    id: "fat-calculator",
    title: "Fat Calculator",
    description: "Analyze your body fat percentage and composition metrics.",
    icon: "🎯",
    color: "bg-red-100 text-red-600",
    route: "/dashboard/tools/fat-calculator"  // ✅ fixed
  },
  {
    id: "nutrition-search",
    title: "Nutrition Search",
    description: "Search and explore nutritional information for thousands of foods.",
    icon: "🔍",
    color: "bg-green-100 text-green-600",
    route: "/dashboard/tools/nutrition-search"  // ✅ fixed
  },
];

const trackers = [
  {
    id: "weight-tracker",
    title: "Weight Tracker",
    description: "Monitor your weight progress with detailed charts and trends.",
    icon: "⚖️",
    color: "bg-blue-100 text-blue-600",
    route: "/dashboard/tools/weight-tracker"  // ✅ fixed
  },
  {
    id: "water-tracker",
    title: "Water Tracker",
    description: "Stay hydrated by tracking your daily water intake goals.",
    icon: "💧",
    color: "bg-cyan-100 text-cyan-600",
    route: "/dashboard/tools/water-tracker"  // ✅ fixed
  },
];

const reminders = [
  {
    id: "custom-reminder",
    title: "Custom Reminder",
    description: "Set personalized reminders for meals, water, medications, and more.",
    icon: "🔔",
    color: "bg-purple-100 text-purple-600",
    route: "/dashboard/tools/custom-reminder"  // ✅ fixed
  },
];
  const handleToolClick = (route) => {
    navigate(route);
  };

  const ToolCard = ({ tool }) => (
    <div 
      className="hover:shadow-lg transition-shadow duration-300 cursor-pointer border border-gray-200 rounded-lg bg-white shadow-md"
      onClick={() => handleToolClick(tool.route)}
    >
      <div className="p-6">
        <div
          className={`w-12 h-12 rounded-xl ${tool.color} flex items-center justify-center text-2xl mb-4`}
        >
          {tool.icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{tool.title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{tool.description}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center">
            🌟 Smart Tools & Trackers
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Tools for Your <span className="text-green-500">Health Journey</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Access comprehensive tracking tools, calculators, and personalized recommendations
              to achieve your nutrition and fitness goals.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Tools Section */}
        <Section title="Tools" icon="🛠️" iconColor="bg-green-500" items={tools} />

        {/* Tracker Section */}
        <Section title="Tracker" icon="📊" iconColor="bg-yellow-500" items={trackers} />

        {/* Reminder Section */}
        <Section
          title="Reminder"
          icon="🔔"
          iconColor="bg-orange-500"
          items={reminders}
          singleColumn
        />
      </div>
    </div>
  );

  function Section({ title, icon, iconColor, items, singleColumn }) {
    return (
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <div className={`w-8 h-8 ${iconColor} rounded-lg flex items-center justify-center`}>
            <span className="text-white font-bold">{icon}</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>
        <div
          className={`grid ${
            singleColumn ? "grid-cols-1 max-w-md" : "grid-cols-1 md:grid-cols-2"
          } gap-6`}
        >
          {items.map((item) => (
            <ToolCard key={item.id} tool={item} />
          ))}
        </div>
      </div>
    );
  }
};

export default Tools;