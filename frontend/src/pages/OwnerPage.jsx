import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Activity, DollarSign, Calendar, Eye, Star } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { getOwner } from '../api/owner'; // Adjust path if needed

const OwnerPage = () => {
  const [userStatsView, setUserStatsView] = useState('Weekly');
  const [mealsView, setMealsView] = useState('Weekly');
  const [ownerData, setOwnerData] = useState(null);

  useEffect(() => {
    const fetchOwnerData = async () => {
      try {
        const data = await getOwner();
        setOwnerData(data);
      } catch (error) {
        console.error('Error fetching owner data:', error);
      }
    };

    fetchOwnerData();
  }, []);

  const MetricCard = ({ title, value, change, changeType, icon: Icon, iconBg }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <div className="flex items-center mt-2">
            <span className={`text-sm font-medium ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
              {changeType === 'positive' ? '↗' : '↘'} {change}
            </span>
            <span className="text-xs text-gray-500 ml-1">Since last month</span>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${iconBg}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );

  const TabButton = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
        active ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 sm:mb-0">Dashboard Overview</h1>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            Sunday, June 22, 2025
          </div>
        </div>

        {/* Owner Info */}
        {ownerData && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Owner Details</h2>
            <p className="text-sm text-gray-700"><strong>Name:</strong> {ownerData.name}</p>
            <p className="text-sm text-gray-700"><strong>Email:</strong> {ownerData.email}</p>
            {/* Add more fields if needed */}
          </div>
        )}

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard title="TOTAL USERS" value="8,549" change="12.5%" changeType="positive" icon={Users} iconBg="bg-blue-500" />
          <MetricCard title="NEW USERS (MONTHLY)" value="1,234" change="8.2%" changeType="positive" icon={UserPlus} iconBg="bg-green-500" />
          <MetricCard title="ACTIVE PATIENTS (WEEKLY)" value="3,879" change="2.7%" changeType="negative" icon={Activity} iconBg="bg-purple-500" />
          <MetricCard title="TOTAL REVENUE" value="$256,890" change="15.2%" changeType="positive" icon={DollarSign} iconBg="bg-emerald-500" />
        </div>

        {/* ...All chart code and bottom section remain unchanged */}
        {/* Just place back your chart & campaign JSX here as you provided in the original */}
      </div>
    </div>
  );
};

export default OwnerPage;
