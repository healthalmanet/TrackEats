import React, { useState, useEffect } from 'react';
import { getDiabeticProfile } from "../../../api/diabeticApi";
import AddInfoButton from "./AddInfoButton"
import AddDiabeticInfoModal from './AddDiabeticInfoModal';

// --- RECHARTS & ICONS (with added components for new charts) ---
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ReferenceLine, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";
import { FaHeartbeat, FaTint, FaShieldAlt } from 'react-icons/fa';

// --- THEME & PALETTES ---
const THEME = {
  background: '#FFFDF9',
  textPrimary: '#263238',
  textSecondary: '#546E7A',
  accent: '#FF7043', // The Brand Orange
  border: '#ECEFF1',
};
const PASTEL_CARD_COLORS = [
    'bg-blue-50', 'bg-green-50', 'bg-yellow-50', 'bg-purple-50', 'bg-red-50', 'bg-indigo-50',
];
const LINE_CHART_PALETTE = {
  color1: '#a0d2eb', // Sky Blue
  color2: '#FFB79D', // Peach
  color3: '#C7E9B0', // Mint Green
};


// --- HELPER FUNCTIONS ---
const getRemarkText = (key, value, diastolic = null) => {
    switch (key) {
        case 'hba1c': if (value < 5.7) return 'Normal'; if (value <= 6.4) return 'Prediabetes'; return 'High Risk';
        case 'fasting_blood_sugar': if (value < 100) return 'Normal'; if (value <= 125) return 'Prediabetes'; return 'High';
        case 'blood_pressure': const systolic = value; if (!diastolic) return ''; if (systolic < 120 && diastolic < 80) return 'Normal'; if (systolic <= 129 && diastolic < 80) return 'Elevated'; return 'Hypertension';
        case 'ldl_cholesterol': if (value < 100) return 'Optimal'; if (value <= 159) return 'Borderline High'; return 'High';
        case 'triglycerides': if (value < 150) return 'Normal'; if (value <= 199) return 'Borderline High'; return 'High';
        case 'tsh': if (value >= 0.4 && value <= 4.0) return 'Normal'; if (value < 0.4) return 'Low (Hyperthyroid)'; return 'High (Hypothyroid)';
        default: return '';
    }
};

const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });


// --- UI SUB-COMPONENTS ---




  const KeyMetricsOverview = ({ latestReport, activeView }) => {
  if (!latestReport) return null;

  const metricCategories = {
    diabetes: [
      { key: 'fasting_blood_sugar', label: 'Fasting Sugar', unit: 'mg/dL', icon: <FaTint /> },
      { key: 'postprandial_sugar', label: 'Post-Meal Sugar', unit: 'mg/dL', icon: <FaTint /> },
      { key: 'hba1c', label: 'HbA1c', unit: '%', icon: <FaTint /> }
    ],
    thyroid: [
      { key: 'tsh', label: 'TSH', unit: 'mU/L', icon: <FaShieldAlt /> }
    ],
    heart: [
      { key: 'ldl_cholesterol', label: 'LDL Cholesterol', unit: 'mg/dL', icon: <FaHeartbeat /> },
      { key: 'hdl_cholesterol', label: 'HDL Cholesterol', unit: 'mg/dL', icon: <FaHeartbeat /> },
      { key: 'triglycerides', label: 'Triglycerides', unit: 'mg/dL', icon: <FaHeartbeat /> }
    ],
    hypertension: [
      { key: 'blood_pressure', label: 'Blood Pressure', unit: 'mmHg', icon: <FaHeartbeat /> }
    ]
  };

  const metrics = metricCategories[activeView] || [];

  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold text-gray-700 font-['Poppins'] mb-4">Latest Snapshot</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => {
          const value = metric.key === 'blood_pressure'
            ? `${latestReport.blood_pressure_systolic}/${latestReport.blood_pressure_diastolic}`
            : latestReport[metric.key];

          const numericValue = metric.key === 'blood_pressure'
            ? latestReport.blood_pressure_systolic
            : latestReport[metric.key];

          const remarkText = getRemarkText(
            metric.key,
            numericValue,
            latestReport.blood_pressure_diastolic
          );

          const cardColor = PASTEL_CARD_COLORS[index % PASTEL_CARD_COLORS.length];

          return (
            <div
              key={metric.key}
              className={`p-5 rounded-xl border border-gray-200 shadow-md transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-2 ${cardColor}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[#263238] font-['Poppins'] font-semibold text-base">
                  {metric.label}
                </h3>
                <span className="text-2xl" style={{ color: THEME.accent }}>
                  {metric.icon}
                </span>
              </div>
              <p className="text-3xl font-bold text-[#263238]">
                {value}{' '}
                <span className="text-base font-normal text-[#546E7A]">
                  {metric.unit}
                </span>
              </p>
              <p className="font-semibold mt-1 text-sm" style={{ color: THEME.accent }}>
                {remarkText}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};



const ChartContainer = ({ title, children }) => (
    <div className="bg-white p-4 rounded-xl border border-[#ECEFF1] shadow-md h-full flex flex-col">
        <h3 className="text-lg font-semibold text-center mb-3 text-[#263238]">{title}</h3>
        <div className="flex-grow">{children}</div>
    </div>
);


const HealthDashboard = () => {
    const [allReports, setAllReports] = useState([]);
    const [latestReport, setLatestReport] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeView, setActiveView] = useState('diabetes');
    const [modalOpen, setModalOpen] = useState(false);

    const fetchReportData = async () => {
        setIsLoading(true);
        try {
            const response = await getDiabeticProfile();
            console.log("✅ All Reports Fetched:", response.results);
            if (response && response.results && response.results.length > 0) {
                // Sort to get the most recent report first
                const sortedByNewest = response.results.slice().sort((a, b) => new Date(b.report_date) - new Date(a.report_date));
                console.log("🔁 Refetched after update:", response.results);

                setLatestReport(sortedByNewest[0]); // The newest is at the top
                console.log("📌 New latestReport is:", sortedByNewest[0]);

                // Sort chronologically for trend charts
                const chronologicalReports = response.results.slice().sort((a, b) => new Date(a.report_date) - new Date(b.report_date));
                setAllReports(chronologicalReports);
            } else {
                throw new Error("No lab reports found. Please add one to see your dashboard.");
            }
        } catch (err) {
            setError(err.message || "Failed to load report data.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReportData();
    }, []);

    const Navigation = () => (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex flex-wrap gap-3">
                {['Diabetes', 'Thyroid', 'Heart', 'Hypertension'].map(view => (
                    <button
                        key={view}
                        onClick={() => setActiveView(view.toLowerCase())}
                        className={`font-['Poppins'] font-semibold py-2 px-5 rounded-lg shadow-md transition-all duration-300 transform hover:-translate-y-1 ${activeView === view.toLowerCase() ? `bg-[${THEME.accent}] text-white` : `bg-white text-[${THEME.textSecondary}] hover:bg-orange-50`}`}>
                        {view}
                    </button>
                ))}
            </div>
            <AddInfoButton onClick={() => setModalOpen(true)} />
            <AddDiabeticInfoModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={async () => {
  setTimeout(async () => {
    await fetchReportData();
    setModalOpen(false);
  }, 500); // wait 0.5s before fetching data
}}


            />
        </div>
    );
    
    // --- UPDATED CHART RENDER FUNCTIONS ---

    const renderDiabetesCharts = () => {
        const chartData = allReports.map(r => ({ date: formatDate(r.report_date), 'Fasting Sugar': r.fasting_blood_sugar, 'HbA1c': r.hba1c }));
        const latestSugarData = [{ name: 'Fasting', value: latestReport.fasting_blood_sugar }, { name: 'Post-Meal', value: latestReport.postprandial_sugar }];
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartContainer title="HbA1c Trend">
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={THEME.border} />
                            <XAxis dataKey="date" fontSize={12} stroke={THEME.textSecondary}/>
                            <YAxis domain={[4, 'dataMax + 1']} fontSize={12} stroke={THEME.textSecondary}/>
                            <Tooltip />
                            <ReferenceLine y={6.5} label={{ value: "High Risk", fontSize: 12, fill: 'gray' }} stroke="#cccccc" strokeDasharray="3 3" />
                            <Line type="monotone" dataKey="HbA1c" stroke={LINE_CHART_PALETTE.color1} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }}/>
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>
                <ChartContainer title="Latest Sugar Levels">
                     <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={latestSugarData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={THEME.border} />
                            <XAxis dataKey="name" fontSize={12} stroke={THEME.textSecondary}/>
                            <YAxis fontSize={12} stroke={THEME.textSecondary}/>
                            <Tooltip formatter={(value) => `${value} mg/dL`} />
                            <ReferenceLine y={100} label={{ value: "Normal Fasting", fontSize: 12, position:'insideTopLeft', fill: 'gray' }} stroke="#cccccc" strokeDasharray="3 3"/>
                            <Bar dataKey="value" fill={LINE_CHART_PALETTE.color2} radius={[4, 4, 0, 0]} barSize={50} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>
        );
    };

    const renderThyroidCharts = () => {
        const chartData = allReports.map(r => ({ date: formatDate(r.report_date), 'TSH': r.tsh }));
        const latestTshData = [{ name: 'TSH', value: latestReport.tsh }];
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartContainer title="TSH Trend">
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={THEME.border} />
                            <XAxis dataKey="date" fontSize={12} stroke={THEME.textSecondary}/>
                            <YAxis domain={[0, 'dataMax + 1']} fontSize={12} stroke={THEME.textSecondary}/>
                            <Tooltip />
                            <ReferenceLine y={4.0} label={{ value: "Upper Limit", fontSize: 12, fill: 'gray', position: 'insideTop' }} stroke="#cccccc" strokeDasharray="3 3" />
                            <Line type="monotone" dataKey="TSH" stroke={LINE_CHART_PALETTE.color1} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>
                <ChartContainer title="Latest TSH Reading">
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={latestTshData} margin={{ top: 25, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={THEME.border} />
                            <XAxis dataKey="name" fontSize={12} stroke={THEME.textSecondary} />
                            <YAxis fontSize={12} stroke={THEME.textSecondary}/>
                            <Tooltip />
                            <ReferenceLine y={0.4} stroke="#cccccc" strokeDasharray="2 2" />
                            <ReferenceLine y={4.0} label={{ value: "Normal Range", fill: 'gray', position: 'inside', angle: -90, dx: -55 }} stroke="#cccccc" strokeDasharray="2 2" />
                            <Bar dataKey="value" fill={LINE_CHART_PALETTE.color2} barSize={60} radius={[4, 4, 0, 0]}/>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>
        );
    };
    
    const renderHeartCharts = () => {
        const chartData = allReports.map(r => ({ date: formatDate(r.report_date), 'LDL': r.ldl_cholesterol, 'HDL': r.hdl_cholesterol, 'Triglycerides': r.triglycerides }));
        const latestLipidData = [{ name: 'LDL', value: latestReport.ldl_cholesterol }, { name: 'HDL', value: latestReport.hdl_cholesterol }, { name: 'Triglycerides', value: latestReport.triglycerides }];
        const colors = [LINE_CHART_PALETTE.color1, LINE_CHART_PALETTE.color2, LINE_CHART_PALETTE.color3];
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartContainer title="Lipid Panel Trend">
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={THEME.border}/>
                            <XAxis dataKey="date" fontSize={12} stroke={THEME.textSecondary}/>
                            <YAxis fontSize={12} stroke={THEME.textSecondary}/>
                            <Tooltip />
                            <Legend wrapperStyle={{fontSize: "14px"}}/>
                            <Line type="monotone" dataKey="LDL" stroke={LINE_CHART_PALETTE.color1} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }}/>
                            <Line type="monotone" dataKey="HDL" stroke={LINE_CHART_PALETTE.color2} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }}/>
                            <Line type="monotone" dataKey="Triglycerides" stroke={LINE_CHART_PALETTE.color3} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }}/>
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>
                <ChartContainer title="Latest Lipid Composition">
                     <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                             <Pie data={latestLipidData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                 {latestLipidData.map((entry, index) => <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />)}
                             </Pie>
                             <Tooltip formatter={(value) => `${value} mg/dL`} />
                             <Legend />
                         </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>
        );
    };

    const renderHypertensionCharts = () => {
        const chartData = allReports.map(r => ({ date: formatDate(r.report_date), 'Systolic': r.blood_pressure_systolic, 'Diastolic': r.blood_pressure_diastolic }));
        const latestBpData = [{ name: 'Latest', 'Systolic': latestReport.blood_pressure_systolic, 'Diastolic': latestReport.blood_pressure_diastolic }];
        return (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <ChartContainer title="Blood Pressure Trend">
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={THEME.border}/>
                            <XAxis dataKey="date" fontSize={12} stroke={THEME.textSecondary}/>
                            <YAxis fontSize={12} stroke={THEME.textSecondary} domain={[50, 'dataMax + 10']}/>
                            <Tooltip /> <Legend wrapperStyle={{fontSize: "14px"}}/>
                            <ReferenceLine y={120} label={{ value: 'Elevated Systolic', fontSize: 12, fill: 'gray' }} stroke="#cccccc" strokeDasharray="3 3"/>
                            <Line type="monotone" dataKey="Systolic" stroke={LINE_CHART_PALETTE.color1} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }}/>
                            <Line type="monotone" dataKey="Diastolic" stroke={LINE_CHART_PALETTE.color2} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }}/>
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>
                <ChartContainer title="Latest Blood Pressure">
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={latestBpData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                           <CartesianGrid strokeDasharray="3 3" stroke={THEME.border}/>
                           <XAxis dataKey="name" fontSize={12} stroke={THEME.textSecondary} />
                           <YAxis fontSize={12} stroke={THEME.textSecondary}/>
                           <Tooltip /> <Legend wrapperStyle={{fontSize: "14px"}}/>
                           <ReferenceLine y={120} label={{ value: "Elevated", fill: "gray", fontSize: 12 }} stroke="#cccccc" strokeDasharray="3 3"/>
                           <ReferenceLine y={80} stroke="#cccccc" strokeDasharray="3 3" />
                           <Bar dataKey="Systolic" fill={LINE_CHART_PALETTE.color1} radius={[4, 4, 0, 0]} />
                           <Bar dataKey="Diastolic" fill={LINE_CHART_PALETTE.color2} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>
        );
    };

    if (isLoading) { return <div className="flex justify-center items-center h-screen bg-[#FFFDF9]"><p className="text-lg text-[#263238] font-['Poppins']">Loading your dashboard...</p></div>; }
    
    if (error) { return ( <div className="flex flex-col justify-center items-center h-screen bg-[#FFFDF9] text-center p-4"> <p className="text-xl text-red-600 font-['Poppins'] mb-4">{error}</p> <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 bg-green-500 text-white font-['Poppins'] font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-green-600">Add Your First Report</button> </div> ); }

    const viewToChartMap = {
      'diabetes': renderDiabetesCharts, 'thyroid': renderThyroidCharts,
      'heart': renderHeartCharts, 'hypertension': renderHypertensionCharts
    };
    
    return (
        <div className="bg-[#FFFDF9] min-h-screen">
            <main className="text-[#546E7A] p-4 sm:p-6 lg:p-8 font-['Roboto'] max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold text-[#263238] font-['Poppins']" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.1)' }}>Health Dashboard</h1>
                    <p className="text-[#546E7A] mt-2 text-lg">Your consolidated health report. Track your progress over time.</p>
                </header>
                <Navigation />
               <KeyMetricsOverview
  key={latestReport?.id || latestReport?.report_date}
  latestReport={{ ...latestReport }}
  activeView={activeView}
/>





                <h2 className="text-2xl font-bold text-gray-700 font-['Poppins'] mb-5 mt-10">Historical Trends</h2>
                <div className="mt-4 max-w-5xl mx-auto">{viewToChartMap[activeView]()}</div>
                <div className="text-center mt-12 text-xs text-gray-400">
                    Showing {allReports.length} report(s). Last updated on: {latestReport ? new Date(latestReport.report_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                </div>
            </main>
        </div>
    );
};

export default HealthDashboard;