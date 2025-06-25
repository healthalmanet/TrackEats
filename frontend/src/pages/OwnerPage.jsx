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
//             <span className={`text-sm font-medium ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
//               {changeType === 'positive' ? '↗' : '↘'} {change}
//             </span>
//             <span className="text-xs text-gray-500 ml-1">Since last month</span>
//           </div>
//         </div>
//         <div className={`p-3 rounded-lg ${iconBg}`}>
//           <Icon className="w-5 h-5 text-white" />
//         </div>
//       </div>
//     </div>
//   );

//   const TabButton = ({ active, onClick, children }) => (
//     <button
//       onClick={onClick}
//       className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
//         active ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
//       }`}
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
import React, { useState } from 'react';
import { Users, UserPlus, Activity, DollarSign, Calendar, Eye, MoreVertical, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const [userStatsView, setUserStatsView] = useState('Weekly');
  const [mealsView, setMealsView] = useState('Weekly');

  // Sample data for charts
  const userStatsData = [
    { name: 'Mon', newUsers: 120, totalUsers: 280 },
    { name: 'Tue', newUsers: 80, totalUsers: 320 },
    { name: 'Wed', newUsers: 150, totalUsers: 380 },
    { name: 'Thu', newUsers: 90, totalUsers: 290 },
    { name: 'Fri', newUsers: 110, totalUsers: 350 },
    { name: 'Sat', newUsers: 140, totalUsers: 400 },
    { name: 'Sun', newUsers: 160, totalUsers: 420 }
  ];

  const mealsData = [
    { name: 'Mon', meals: 320 },
    { name: 'Tue', meals: 380 },
    { name: 'Wed', meals: 350 },
    { name: 'Thu', meals: 420 },
    { name: 'Fri', meals: 480 },
    { name: 'Sat', meals: 510 },
    { name: 'Sun', meals: 550 }
  ];

  const countryData = [
    { name: 'United States', value: 3621, percentage: 42.4, color: '#1e40af' },
    { name: 'United Kingdom', value: 1298, percentage: 15.2, color: '#9333ea' },
    { name: 'Canada', value: 952, percentage: 11.1, color: '#059669' },
    { name: 'Australia', value: 745, percentage: 8.7, color: '#dc2626' },
    { name: 'Germany', value: 694, percentage: 8.1, color: '#ea580c' },
    { name: 'Others', value: 1235, percentage: 14.5, color: '#6b7280' }
  ];

  const campaigns = [
    {
      name: 'Summer Health Challenge',
      status: 'Active',
      startDate: 'Jun 15, 2025',
      endDate: 'Aug 15, 2025',
      reach: '5,432',
      conversion: '12.8%',
      icon: '🏃'
    },
    {
      name: 'New User Discount',
      status: 'Active',
      startDate: 'May 1, 2025',
      endDate: 'Ongoing',
      reach: '8,576',
      conversion: '18.3%',
      icon: '🎁'
    },
    {
      name: 'Premium Membership Drive',
      status: 'Scheduled',
      startDate: 'Aug 20, 2025',
      endDate: 'Oct 20, 2025',
      reach: '-',
      conversion: '-',
      icon: '⭐'
    },
    {
      name: 'Spring Wellness Program',
      status: 'Completed',
      startDate: 'Mar 1, 2025',
      endDate: 'May 31, 2025',
      reach: '12,345',
      conversion: '23.1%',
      icon: '🌸'
    }
  ];

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
        active 
          ? 'bg-blue-600 text-white' 
          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
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

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="TOTAL USERS"
            value="8,549"
            change="12.5%"
            changeType="positive"
            icon={Users}
            iconBg="bg-blue-500"
          />
          <MetricCard
            title="NEW USERS (MONTHLY)"
            value="1,234"
            change="8.2%"
            changeType="positive"
            icon={UserPlus}
            iconBg="bg-green-500"
          />
          <MetricCard
            title="ACTIVE PATIENTS (WEEKLY)"
            value="3,879"
            change="2.7%"
            changeType="negative"
            icon={Activity}
            iconBg="bg-purple-500"
          />
          <MetricCard
            title="TOTAL REVENUE"
            value="$256,890"
            change="15.2%"
            changeType="positive"
            icon={DollarSign}
            iconBg="bg-emerald-500"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Statistics */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">User Statistics</h3>
              <div className="flex space-x-1">
                <TabButton active={userStatsView === 'Weekly'} onClick={() => setUserStatsView('Weekly')}>
                  Weekly
                </TabButton>
                <TabButton active={userStatsView === 'Monthly'} onClick={() => setUserStatsView('Monthly')}>
                  Monthly
                </TabButton>
                <TabButton active={userStatsView === 'Yearly'} onClick={() => setUserStatsView('Yearly')}>
                  Yearly
                </TabButton>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userStatsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Bar dataKey="totalUsers" fill="#1e40af" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="newUsers" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center space-x-6 mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Total Users</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">New Users</span>
              </div>
            </div>
          </div>

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
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

          {/* User Feedback */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">User Feedback</h3>
              <span className="text-xs text-blue-600 font-medium">New 24</span>
            </div>
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-gray-900 mb-2">4.7</div>
              <div className="flex justify-center mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className="w-4 h-4 fill-yellow-400 text-yellow-400" 
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600">Based on 1,234 reviews</p>
            </div>
            <div className="space-y-3">
              {[
                { stars: 5, percentage: 75 },
                { stars: 4, percentage: 20 },
                { stars: 3, percentage: 3 },
                { stars: 2, percentage: 1 },
                { stars: 1, percentage: 1 }
              ].map((rating) => (
                <div key={rating.stars} className="flex items-center text-sm">
                  <span className="text-gray-700 w-12">{rating.stars} stars</span>
                  <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${rating.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-gray-600 w-8 text-right">{rating.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Promotional Campaigns */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Promotional Campaigns</h3>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs font-medium transition-colors">
                + New Campaign
              </button>
            </div>
            <div className="space-y-4">
              {campaigns.map((campaign, index) => (
                <div key={index} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{campaign.icon}</span>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{campaign.name}</h4>
                        <div className="flex items-center mt-1 space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            campaign.status === 'Active' ? 'bg-green-100 text-green-800' :
                            campaign.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {campaign.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-xs text-gray-600 grid grid-cols-2 gap-2">
                    <div>Reach: <span className="font-medium">{campaign.reach}</span></div>
                    <div>Conversion: <span className="font-medium">{campaign.conversion}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

