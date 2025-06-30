import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart, PieChart, Pie, Cell } from 'recharts';
import { Users, UserPlus, Activity, DollarSign, Plus, Eye, Calendar, Star } from 'lucide-react';

const Dashboard = () => {
  const [userStatsView, setUserStatsView] = useState('Weekly');
  const [mealsView, setMealsView] = useState('Weekly');
  const [ownerData, setOwnerData] = useState(null);
  const [loading, setLoading] = useState(true);

  const BASE_URL = 'https://trackeats.onrender.com/api';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const getWeight = async () => {
    const response = await fetch(`${BASE_URL}/weight/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return response.json();
  };

  const postWeight = async (formData) => {
    const response = await fetch(`${BASE_URL}/weight/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(formData),
    });
    return response.json();
  };

  const getOwner = async () => {
    const response = await fetch(`${BASE_URL}/owner/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return response.json();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getOwner();
        setOwnerData(data);
      } catch (error) {
        console.error('Error fetching owner data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getMealsData = () => {
    if (!ownerData || !ownerData.usage) {
      return [];
    }

    const total = mealsView === 'Weekly' 
      ? ownerData.usage.meals_logged_week 
      : ownerData.usage.meals_logged_month;

    const count = mealsView === 'Weekly' ? 7 : 4;
    const labels = mealsView === 'Weekly'
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

    const perUnit = Math.round(total / count);

    return labels.map((label) => ({
      name: label,
      meals: perUnit + Math.floor(Math.random() * 50) - 25,
    }));
  };

  const getUserStatsData = () => {
    if (!ownerData || !ownerData.user_stats) {
      return [];
    }

    const { total_users, new_users_month, active_patients_week } = ownerData.user_stats;
    
    if (userStatsView === 'Weekly') {
      const dailyNew = Math.round(new_users_month / 30 * 7);
      const dailyTotal = Math.round(total_users / 7);
      
      return [
        { name: 'Mon', newUsers: Math.round(dailyNew * 0.8), totalUsers: Math.round(dailyTotal * 0.9) },
        { name: 'Tue', newUsers: Math.round(dailyNew * 0.6), totalUsers: Math.round(dailyTotal * 0.7) },
        { name: 'Wed', newUsers: Math.round(dailyNew * 1.2), totalUsers: Math.round(dailyTotal * 1.1) },
        { name: 'Thu', newUsers: Math.round(dailyNew * 0.5), totalUsers: Math.round(dailyTotal * 0.6) },
        { name: 'Fri', newUsers: Math.round(dailyNew * 0.9), totalUsers: Math.round(dailyTotal * 0.8) },
        { name: 'Sat', newUsers: Math.round(dailyNew * 1.4), totalUsers: Math.round(dailyTotal * 1.3) },
        { name: 'Sun', newUsers: Math.round(dailyNew * 1.1), totalUsers: Math.round(dailyTotal * 1.0) }
      ];
    }
    
    return [];
  };

  const countryColors = ['#1e40af', '#7c3aed', '#059669', '#dc2626', '#ea580c', '#6b7280'];

  const getCountryData = () => {
    if (!ownerData || !ownerData.users_by_country) {
      return [];
    }

    const totalUsers = ownerData?.user_stats?.total_users || 1;
    return ownerData.users_by_country.map((item, index) => {
      const percentage = ((item.user_count / totalUsers) * 100).toFixed(1);
      return {
        name: item.country,
        value: item.user_count,
        percentage,
        color: countryColors[index % countryColors.length]
      };
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': 
      case 'Running': 
        return 'bg-green-100 text-green-800';
      case 'Scheduled': 
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
      case 'Ended': 
        return 'bg-gray-100 text-gray-800';
      default: 
        return 'bg-gray-100 text-gray-800';
    }
  };

  const MetricCard = ({ title, value, change, changeType, icon: Icon, iconBg }) => (
    <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs sm:text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-xs sm:text-sm ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
              {changeType === 'positive' ? '↗' : '↘'} {change} Since last month
            </p>
          )}
        </div>
        <Icon className="h-8 w-8 sm:h-12 sm:w-12 text-blue-600" />
      </div>
    </div>
  );

  const TabButton = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-sm rounded transition-colors ${
        active
          ? 'bg-blue-600 text-white'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    console.log('Logout clicked');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  if (!ownerData) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-lg text-red-600">Failed to load dashboard data. Please try again.</div>
      </div>
    );
  }

  const mealsData = getMealsData();
  const countryData = getCountryData();
  const userStatsData = getUserStatsData();

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <div className="flex items-center text-gray-600 space-x-4">
            <div className="flex items-center text-sm">
              <Calendar className="w-4 h-4 mr-2" />
              {new Date(ownerData.date).toDateString()}
            </div>
            <span className="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">3</span>
            <button
              onClick={handleLogout}
              className="px-3 py-1 text-xs font-medium bg-red-500 text-white rounded-md hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Owner Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <p className="text-sm text-gray-700"><strong>Name:</strong> {ownerData.name}</p>
            <p className="text-sm text-gray-700"><strong>Email:</strong> {ownerData.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <MetricCard 
            title="TOTAL USERS" 
            value={ownerData.user_stats?.total_users?.toLocaleString() || "0"} 
            change="+3.2%" 
            changeType="positive" 
            icon={Users} 
            iconBg="bg-blue-600" 
          />
          <MetricCard 
            title="NEW USERS (MONTHLY)" 
            value={ownerData.user_stats?.new_users_month?.toLocaleString() || "0"} 
            change="+8.1%" 
            changeType="positive" 
            icon={UserPlus} 
            iconBg="bg-green-600" 
          />
          <MetricCard 
            title="ACTIVE PATIENTS (WEEKLY)" 
            value={ownerData.user_stats?.active_patients_week?.toLocaleString() || "0"} 
            change="-2.7%" 
            changeType="negative" 
            icon={Activity} 
            iconBg="bg-purple-600" 
          />
          <MetricCard 
            title="TOTAL REVENUE" 
            value={ownerData.revenue || "$0"} 
            change="+15.3%" 
            changeType="positive" 
            icon={DollarSign} 
            iconBg="bg-green-600" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
              <h3 className="text-lg font-semibold text-gray-900">User Statistics</h3>
              <div className="flex flex-wrap space-x-2">
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
              {userStatsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={userStatsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="totalUsers" fill="#1e40af" name="Total Users" />
                    <Bar dataKey="newUsers" fill="#10b981" name="New Users" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No data available for {userStatsView.toLowerCase()} view
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
              <h3 className="text-lg font-semibold text-gray-900">Meals Logged</h3>
              <div className="flex space-x-2">
                <TabButton active={mealsView === 'Weekly'} onClick={() => setMealsView('Weekly')}>
                  Weekly
                </TabButton>
                <TabButton active={mealsView === 'Monthly'} onClick={() => setMealsView('Monthly')}>
                  Monthly
                </TabButton>
              </div>
            </div>
            <div className="h-64">
              {mealsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mealsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="meals" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No meal data available
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Users by Country</h3>
              <button className="text-blue-600 text-sm hover:text-blue-800 transition-colors">📊 Export</button>
            </div>
            {countryData.length > 0 ? (
              <>
                <div className="flex items-center justify-center mb-4">
                  <div className="w-48 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={countryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {countryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="space-y-2">
                  {countryData.map((country, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: country.color }}></div>
                        <span className="text-gray-700">{country.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-900 font-medium">{country.value.toLocaleString()}</span>
                        <span className="text-gray-500">{country.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-500">
                No country data available
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">User Feedback</h3>
              <span className="text-blue-600 text-sm">New 24</span>
            </div>
            {ownerData.feedback_summary ? (
              <>
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-gray-900 mb-2">
                    {ownerData.feedback_summary.average_rating}
                  </div>
                  <div className="flex justify-center mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="text-yellow-400 text-xl">★</span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    Based on {ownerData.feedback_summary.total_reviews} reviews
                  </p>
                </div>
                <div className="space-y-3">
                  {[
                    { stars: 5, percentage: 75 },
                    { stars: 4, percentage: 20 },
                    { stars: 3, percentage: 3 },
                    { stars: 2, percentage: 1 },
                    { stars: 1, percentage: 1 }
                  ].map((rating) => (
                    <div key={rating.stars} className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 w-8">{rating.stars} star</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full" 
                          style={{ width: `${rating.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8">{rating.percentage}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-500">
                No feedback data available
              </div>
            )}
          </div>
        </div>

        {ownerData.feedback_summary?.latest_feedbacks && ownerData.promotions && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8">
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Latest Feedback</h3>
              <div className="space-y-4">
                {ownerData.feedback_summary.latest_feedbacks.map((fb) => (
                  <div key={fb.id} className="border-b pb-4 last:border-b-0">
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
            </div>

            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Promotions</h3>
              <div className="space-y-4">
                {ownerData.promotions.map((promo, idx) => (
                  <div key={idx} className="border-b pb-4 last:border-b-0">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-medium text-gray-800">{promo.campaign}</p>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(promo.status)}`}>
                        {promo.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Reach: {promo.reach}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {ownerData.promotions && (
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h3 className="text-xl font-semibold text-gray-900">Promotional Campaigns</h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm flex items-center hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4 mr-1" />
                New Campaign
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-gray-600 bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium">CAMPAIGN NAME</th>
                    <th className="text-left py-3 px-4 font-medium">STATUS</th>
                    <th className="text-left py-3 px-4 font-medium">REACH</th>
                    <th className="text-center py-3 px-4 font-medium">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {ownerData.promotions.map((campaign, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <span className="text-gray-900 font-medium">{campaign.campaign}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-700 font-medium">{campaign.reach}</td>
                      <td className="py-4 px-4 text-center">
                        <button className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;