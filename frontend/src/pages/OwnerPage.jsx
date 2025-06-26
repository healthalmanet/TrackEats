import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Activity, DollarSign, Calendar, Star } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { getOwner } from '../api/owner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/context/AuthContext';
import { Tooltip } from 'chart.js';

const Dashboard = () => {
  const [userStatsView, setUserStatsView] = useState('Weekly');
  const [mealsView, setMealsView] = useState('Weekly');
  const [ownerData, setOwnerData] = useState(null);
  const { logout } = useAuth(); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getOwner();
        setOwnerData(data);
      } catch (error) {
        console.error('Error fetching owner data:', error);
      }
    };
    fetchData();
  }, []);


  const getMealsData = () => {
  if (!ownerData || !ownerData.usage) return [];

  const total =
    mealsView === 'Weekly'
      ? ownerData.usage.meals_logged_week
      : ownerData.usage.meals_logged_month;

  const count = mealsView === 'Weekly' ? 7 : 4;
  const labels = mealsView === 'Weekly'
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

  const perUnit = Math.round(total / count);

  return labels.map((label) => ({
    name: label,
    meals: perUnit,
  }));
};

const mealsData = getMealsData();
 

  const handleLogout = () => {
    logout();         // ✅ clears token + user from context and localStorage
    navigate('/'); // Adjust path if needed
  };

  const countryColors = ['#1e40af', '#9333ea', '#059669', '#dc2626', '#ea580c', '#6b7280'];

  const MetricCard = ({ title, value, icon: Icon, iconBg }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
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
        active
          ? 'bg-blue-600 text-white'
          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );

  

const countryData = ownerData?.users_by_country?.map((item, index) => {
  const totalUsers = ownerData?.user_stats?.total_users || 1;
  const percentage = ((item.user_count / totalUsers) * 100).toFixed(1);
  return {
    name: item.country,
    value: item.user_count,
    percentage,
    color: countryColors[index % countryColors.length]
  };
}) || [];



  if (!ownerData) return <div className="p-4">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 sm:mb-0">Dashboard Overview</h1>
          <div className="flex items-center text-sm text-gray-600 space-x-4">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {new Date(ownerData.date).toDateString()}
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1 text-xs font-medium bg-red-500 text-white rounded-md hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard title="TOTAL USERS" value={ownerData.user_stats.total_users} icon={Users} iconBg="bg-blue-500" />
          <MetricCard title="NEW USERS (MONTHLY)" value={ownerData.user_stats.new_users_month} icon={UserPlus} iconBg="bg-green-500" />
          <MetricCard title="ACTIVE PATIENTS (WEEKLY)" value={ownerData.user_stats.active_patients_week} icon={Activity} iconBg="bg-purple-500" />
          <MetricCard title="TOTAL REVENUE" value={ownerData.revenue} icon={DollarSign} iconBg="bg-emerald-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Meals Logged */}
<div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
  <div className="flex justify-between items-center mb-6">
    <h3 className="text-lg font-semibold text-gray-900">Meals Logged</h3>
    <div className="flex space-x-1">
      <TabButton active={mealsView === 'Weekly'} onClick={() => setMealsView('Weekly')}>
        Weekly
      </TabButton>
      <TabButton active={mealsView === 'Monthly'} onClick={() => setMealsView('Monthly')}>
        Monthly
      </TabButton>
    </div>
  </div>
  <div className="h-64">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={mealsData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
        <Line 
          type="monotone" 
          dataKey="meals" 
          stroke="#8b5cf6" 
          strokeWidth={3}
          dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
</div>


          {/* Users by Country */}
<div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
  <div className="flex justify-between items-center mb-6">
    <h3 className="text-lg font-semibold text-gray-900">Users by Country</h3>
    <button className="text-blue-600 text-xs font-medium hover:text-blue-700">
      Export
    </button>
  </div>
  <div className="flex items-center justify-center mb-6">
    <div className="w-32 h-32">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={countryData}
            cx="50%"
            cy="50%"
            innerRadius={25}
            outerRadius={60}
            paddingAngle={2}
            dataKey="value"
          >
            {countryData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
    <div className="space-y-3">
      {countryData.map((country, index) => (
        <div key={index} className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-3"
              style={{ backgroundColor: country.color }}
            ></div>
            <span className="text-gray-700">{country.name}</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-gray-900 font-medium">{country.value.toLocaleString()}</span>
            <span className="text-gray-500 min-w-[3rem] text-right">{country.percentage}%</span>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>


<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
  {/* Feedback Card */}
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Latest Feedback</h3>
    {ownerData.feedback_summary.latest_feedbacks.map((fb) => (
      <div key={fb.id} className="mb-4 border-b pb-4">
        <p className="text-sm text-gray-800 font-medium">{fb.user_email}</p>
        <div className="flex items-center text-yellow-500 mb-1">
          {[...Array(fb.rating)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-yellow-500" />
          ))}
        </div>
        <p className="text-sm text-gray-600">{fb.message}</p>
      </div>
    ))}
  </div>

  {/* Promotions Card */}
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Promotions</h3>
    {ownerData.promotions.map((promo, idx) => (
      <div key={idx} className="mb-4 border-b pb-4">
        <div className="flex justify-between">
          <p className="text-sm font-medium text-gray-800">{promo.campaign}</p>
          <span
            className={`text-xs font-medium ${
              promo.status === 'Running'
                ? 'text-green-600'
                : promo.status === 'Ended'
                ? 'text-red-600'
                : 'text-gray-600'
            }`}
          >
            {promo.status}
          </span>
        </div>
        <p className="text-sm text-gray-600">Reach: {promo.reach}</p>
      </div>
    ))}
  </div>
</div>


        </div>
      </div>
    
  );
};

export default Dashboard;




// import React, { useState, useEffect } from 'react';
// import { Users, UserPlus, Activity, DollarSign, Calendar, Eye, Star } from 'lucide-react';
// import {
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
//   LineChart, Line, PieChart, Pie, Cell
// } from 'recharts';
// import { getOwner } from '../api/owner'; // Adjust path if needed



// const OwnerPage = () => {
//   const [userStatsView, setUserStatsView] = useState('Weekly');
//   const [mealsView, setMealsView] = useState('Weekly');
//   const [ownerData, setOwnerData] = useState(null);

//   useEffect(() => {
//     const fetchOwnerData = async () => {
//       try {
//         const data = await getOwner();
//         setOwnerData(data);
//       } catch (error) {
//         console.error('Error fetching owner data:', error);
//       }
//     };

//     fetchOwnerData();
//   }, []);

//   const MetricCard = ({ title, value, change, changeType, icon: Icon, iconBg }) => (
//     <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
//       <div className="flex items-start justify-between">
//         <div>
//           <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
//           <p className="text-2xl font-bold text-gray-900">{value}</p>
//           <div className="flex items-center mt-2">
//             <span className={text-sm font-medium ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}}>
//               {changeType === 'positive' ? '↗' : '↘'} {change}
//             </span>
//             <span className="text-xs text-gray-500 ml-1">Since last month</span>
//           </div>
//         </div>
//         <div className={p-3 rounded-lg ${iconBg}}>
//           <Icon className="w-5 h-5 text-white" />
//         </div>
//       </div>
//     </div>
//   );

//   const TabButton = ({ active, onClick, children }) => (
//     <button
//       onClick={onClick}
//       className={px-3 py-1 text-xs font-medium rounded-md transition-colors ${
//         active ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
//       }}
//     >
//       {children}
//     </button>
//   );

//   return (
//     <div className="min-h-screen bg-gray-50 p-4">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
//           <h1 className="text-2xl font-bold text-gray-900 mb-2 sm:mb-0">Dashboard Overview</h1>
//           <div className="flex items-center text-sm text-gray-600">
//             <Calendar className="w-4 h-4 mr-2" />
//             Sunday, June 22, 2025
//           </div>
//         </div>

//         {/* Owner Info */}
//         {ownerData && (
//           <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
//             <h2 className="text-lg font-semibold text-gray-900 mb-2">Owner Details</h2>
//             <p className="text-sm text-gray-700"><strong>Name:</strong> {ownerData.name}</p>
//             <p className="text-sm text-gray-700"><strong>Email:</strong> {ownerData.email}</p>
//             {/* Add more fields if needed */}
//           </div>
//         )}

//         {/* Metrics Cards */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//           <MetricCard title="TOTAL USERS" value="8,549" change="12.5%" changeType="positive" icon={Users} iconBg="bg-blue-500" />
//           <MetricCard title="NEW USERS (MONTHLY)" value="1,234" change="8.2%" changeType="positive" icon={UserPlus} iconBg="bg-green-500" />
//           <MetricCard title="ACTIVE PATIENTS (WEEKLY)" value="3,879" change="2.7%" changeType="negative" icon={Activity} iconBg="bg-purple-500" />
//           <MetricCard title="TOTAL REVENUE" value="$256,890" change="15.2%" changeType="positive" icon={DollarSign} iconBg="bg-emerald-500" />
//         </div>

//         {/* ...All chart code and bottom section remain unchanged */}
//         {/* Just place back your chart & campaign JSX here as you provided in the original */}
//       </div>
//     </div>
//   );
// };

// export default OwnerPage;

