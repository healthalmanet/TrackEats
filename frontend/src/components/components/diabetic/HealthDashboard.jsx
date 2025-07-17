import React, { useState, useEffect } from 'react';
import { getDiabeticProfile } from "../../../api/diabeticApi";
import AddInfoButton from "./AddInfoButton";
import AddDiabeticInfoModal from './AddDiabeticInfoModal';

// --- RECHARTS & ICONS ---
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ReferenceLine, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";
import { FaHeartbeat, FaTint, FaShieldAlt } from 'react-icons/fa';

// --- HELPER FUNCTIONS (Unchanged) ---
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

// --- THEMED CARD COLORS (uses CSS classes, which are inherently dynamic) ---
const THEMED_CARD_COLORS = [
    'bg-primary/10', 'bg-accent-orange/10', 'bg-accent-yellow/10', 'bg-accent-coral/10',
];

// --- UI SUB-COMPONENTS ---
const KeyMetricsOverview = ({ latestReport, activeView }) => {
  if (!latestReport) return null;
  const metricCategories = {
    diabetes: [ { key: 'fasting_blood_sugar', label: 'Fasting Sugar', unit: 'mg/dL', icon: <FaTint /> }, { key: 'postprandial_sugar', label: 'Post-Meal Sugar', unit: 'mg/dL', icon: <FaTint /> }, { key: 'hba1c', label: 'HbA1c', unit: '%', icon: <FaTint /> } ],
    thyroid: [ { key: 'tsh', label: 'TSH', unit: 'mU/L', icon: <FaShieldAlt /> } ],
    heart: [ { key: 'ldl_cholesterol', label: 'LDL', unit: 'mg/dL', icon: <FaHeartbeat /> }, { key: 'hdl_cholesterol', label: 'HDL', unit: 'mg/dL', icon: <FaHeartbeat /> }, { key: 'triglycerides', label: 'Triglycerides', unit: 'mg/dL', icon: <FaHeartbeat /> } ],
    hypertension: [ { key: 'blood_pressure', label: 'Blood Pressure', unit: 'mmHg', icon: <FaHeartbeat /> } ]
  };
  const metrics = metricCategories[activeView] || [];
  return (
    <div className="mb-10">
      <h2 className="text-xl font-['Lora'] font-bold text-heading mb-4">Latest Snapshot</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => {
          const value = metric.key === 'blood_pressure' ? `${latestReport.blood_pressure_systolic}/${latestReport.blood_pressure_diastolic}` : latestReport[metric.key];
          const numericValue = metric.key === 'blood_pressure' ? latestReport.blood_pressure_systolic : latestReport[metric.key];
          const remarkText = getRemarkText(metric.key, numericValue, latestReport.blood_pressure_diastolic);
          const cardColor = THEMED_CARD_COLORS[index % THEMED_CARD_COLORS.length];
          return (
            <div key={metric.key} className={`p-5 rounded-xl border border-custom shadow-soft transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-2 ${cardColor}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-heading font-['Lora'] font-semibold text-base">{metric.label}</h3>
                <span className="text-2xl text-primary">{metric.icon}</span>
              </div>
              <p className="text-3xl font-bold text-heading">{value}{' '}<span className="text-base font-normal text-body">{metric.unit}</span></p>
              <p className="font-semibold mt-1 text-sm text-primary">{remarkText}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ChartContainer = ({ title, children }) => (
    <div className="bg-section p-4 rounded-xl border border-custom shadow-soft h-full flex flex-col">
        <h3 className="text-lg font-['Lora'] font-semibold text-center mb-3 text-heading">{title}</h3>
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

    // ✅ STATE TO HOLD DYNAMICALLY LOADED THEME COLORS FROM CSS
    const [chartColors, setChartColors] = useState({
      // Fallback colors are used for the very first render before useEffect runs
      primary: '#4CAF50',
      accentOrange: '#FF9800',
      accentYellow: '#FFC107',
      accentCoral: '#FF7043',
      textBody: '#555555',
      border: '#DDDDDD',
    });

    // ✅ EFFECT TO READ CSS VARIABLES FROM THE DOM AT RUNTIME
    useEffect(() => {
      // This makes the component truly dynamic. It reads the variables from your index.css.
      const styles = getComputedStyle(document.documentElement);
      setChartColors({
        primary: styles.getPropertyValue('--color-primary-accent').trim(),
        accentOrange: styles.getPropertyValue('--color-accent-orange').trim(),
        accentYellow: styles.getPropertyValue('--color-accent-yellow').trim(),
        accentCoral: styles.getPropertyValue('--color-accent-coral').trim(),
        textBody: styles.getPropertyValue('--color-text-body').trim(),
        border: styles.getPropertyValue('--color-border').trim(),
      });
    }, []); // Empty array ensures this runs only once after the component mounts.

    const fetchReportData = async () => {
        setIsLoading(true);
        try {
            const response = await getDiabeticProfile();
            if (response && response.results && response.results.length > 0) {
                const sortedByNewest = response.results.slice().sort((a, b) => new Date(b.report_date) - new Date(a.report_date));
                setLatestReport(sortedByNewest[0]);
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

    useEffect(() => { fetchReportData(); }, []);

    const Navigation = () => (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex flex-wrap gap-3">
                {['Diabetes', 'Thyroid', 'Heart', 'Hypertension'].map(view => (
                    <button
                        key={view}
                        onClick={() => setActiveView(view.toLowerCase())}
                        className={`font-['Poppins'] font-semibold py-2 px-5 rounded-lg shadow-soft transition-all duration-300 transform hover:-translate-y-1 ${
                            activeView === view.toLowerCase() 
                            ? 'bg-primary text-light' 
                            : 'bg-section text-body hover:bg-light'
                        }`}
                    >
                        {view}
                    </button>
                ))}
            </div>
            <AddInfoButton onClick={() => setModalOpen(true)} />
            <AddDiabeticInfoModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={() => { setTimeout(fetchReportData, 500); setModalOpen(false); }} />
        </div>
    );
    
    // --- CHART RENDER FUNCTIONS NOW USE THE DYNAMIC 'chartColors' STATE ---
    
    const renderDiabetesCharts = () => {
        const chartData = allReports.map(r => ({ date: formatDate(r.report_date), 'HbA1c': r.hba1c }));
        const latestSugarData = [{ name: 'Fasting', value: latestReport.fasting_blood_sugar }, { name: 'Post-Meal', value: latestReport.postprandial_sugar }];
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartContainer title="HbA1c Trend">
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.border} />
                            <XAxis dataKey="date" fontSize={12} stroke={chartColors.textBody}/>
                            <YAxis domain={[4, 'dataMax + 1']} fontSize={12} stroke={chartColors.textBody}/>
                            <Tooltip />
                            <ReferenceLine y={6.5} label={{ value: "High Risk", fontSize: 12, fill: chartColors.textBody }} stroke={chartColors.border} strokeDasharray="3 3" />
                            <Line type="monotone" dataKey="HbA1c" stroke={chartColors.primary} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }}/>
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>
                <ChartContainer title="Latest Sugar Levels">
                     <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={latestSugarData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.border} />
                            <XAxis dataKey="name" fontSize={12} stroke={chartColors.textBody}/>
                            <YAxis fontSize={12} stroke={chartColors.textBody}/>
                            <Tooltip formatter={(value) => `${value} mg/dL`} />
                            <ReferenceLine y={100} label={{ value: "Normal Fasting", fontSize: 12, position:'insideTopLeft', fill: chartColors.textBody }} stroke={chartColors.border} strokeDasharray="3 3"/>
                            <Bar dataKey="value" fill={chartColors.accentOrange} radius={[4, 4, 0, 0]} barSize={50} />
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
                            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.border} />
                            <XAxis dataKey="date" fontSize={12} stroke={chartColors.textBody}/>
                            <YAxis domain={[0, 'dataMax + 1']} fontSize={12} stroke={chartColors.textBody}/>
                            <Tooltip />
                            <ReferenceLine y={4.0} label={{ value: "Upper Limit", fontSize: 12, fill: chartColors.textBody, position: 'insideTop' }} stroke={chartColors.border} strokeDasharray="3 3" />
                            <Line type="monotone" dataKey="TSH" stroke={chartColors.primary} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>
                <ChartContainer title="Latest TSH Reading">
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={latestTshData} margin={{ top: 25, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.border} />
                            <XAxis dataKey="name" fontSize={12} stroke={chartColors.textBody} />
                            <YAxis fontSize={12} stroke={chartColors.textBody}/>
                            <Tooltip />
                            <ReferenceLine y={0.4} stroke={chartColors.border} strokeDasharray="2 2" />
                            <ReferenceLine y={4.0} label={{ value: "Normal Range", fill: chartColors.textBody, position: 'inside', angle: -90, dx: -55 }} stroke={chartColors.border} strokeDasharray="2 2" />
                            <Bar dataKey="value" fill={chartColors.accentOrange} barSize={60} radius={[4, 4, 0, 0]}/>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>
        );
    };
    
    const renderHeartCharts = () => {
        const chartData = allReports.map(r => ({ date: formatDate(r.report_date), 'LDL': r.ldl_cholesterol, 'HDL': r.hdl_cholesterol, 'Triglycerides': r.triglycerides }));
        const latestLipidData = [{ name: 'LDL', value: latestReport.ldl_cholesterol }, { name: 'HDL', value: latestReport.hdl_cholesterol }, { name: 'Triglycerides', value: latestReport.triglycerides }];
        const colors = [chartColors.primary, chartColors.accentOrange, chartColors.accentYellow];
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartContainer title="Lipid Panel Trend">
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.border}/>
                            <XAxis dataKey="date" fontSize={12} stroke={chartColors.textBody}/>
                            <YAxis fontSize={12} stroke={chartColors.textBody}/>
                            <Tooltip />
                            <Legend wrapperStyle={{fontSize: "14px"}}/>
                            <Line type="monotone" dataKey="LDL" stroke={colors[0]} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }}/>
                            <Line type="monotone" dataKey="HDL" stroke={colors[1]} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }}/>
                            <Line type="monotone" dataKey="Triglycerides" stroke={colors[2]} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }}/>
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
                            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.border}/>
                            <XAxis dataKey="date" fontSize={12} stroke={chartColors.textBody}/>
                            <YAxis fontSize={12} stroke={chartColors.textBody} domain={[50, 'dataMax + 10']}/>
                            <Tooltip /> <Legend wrapperStyle={{fontSize: "14px"}}/>
                            <ReferenceLine y={120} label={{ value: 'Elevated Systolic', fontSize: 12, fill: chartColors.textBody }} stroke={chartColors.border} strokeDasharray="3 3"/>
                            <Line type="monotone" dataKey="Systolic" stroke={chartColors.primary} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }}/>
                            <Line type="monotone" dataKey="Diastolic" stroke={chartColors.accentOrange} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }}/>
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>
                <ChartContainer title="Latest Blood Pressure">
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={latestBpData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                           <CartesianGrid strokeDasharray="3 3" stroke={chartColors.border}/>
                           <XAxis dataKey="name" fontSize={12} stroke={chartColors.textBody} />
                           <YAxis fontSize={12} stroke={chartColors.textBody}/>
                           <Tooltip /> <Legend wrapperStyle={{fontSize: "14px"}}/>
                           <ReferenceLine y={120} label={{ value: "Elevated", fill: chartColors.textBody, fontSize: 12 }} stroke={chartColors.border} strokeDasharray="3 3"/>
                           <ReferenceLine y={80} stroke={chartColors.border} strokeDasharray="3 3" />
                           <Bar dataKey="Systolic" fill={chartColors.primary} radius={[4, 4, 0, 0]} />
                           <Bar dataKey="Diastolic" fill={chartColors.accentOrange} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>
        );
    };

    if (isLoading) { return <div className="flex justify-center items-center h-screen bg-main"><p className="text-lg text-heading font-['Poppins']">Loading your dashboard...</p></div>; }
    
    if (error) { return ( <div className="flex flex-col justify-center items-center h-screen bg-main text-center p-4"> <p className="text-xl text-red font-['Poppins'] mb-4">{error}</p> <AddInfoButton onClick={() => setModalOpen(true)} /> </div> ); }

    const viewToChartMap = {
      'diabetes': renderDiabetesCharts, 'thyroid': renderThyroidCharts,
      'heart': renderHeartCharts, 'hypertension': renderHypertensionCharts
    };
    
    return (
        <div className="bg-main min-h-screen">
            <main className="text-body p-4 sm:p-6 lg:p-8 font-['Poppins'] max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-4xl font-['Lora'] font-bold text-heading">Health Dashboard</h1>
                    <p className="text-body mt-2 text-lg">Your consolidated health report. Track your progress over time.</p>
                </header>
                <Navigation />
                <KeyMetricsOverview key={latestReport?.id || latestReport?.report_date} latestReport={{ ...latestReport }} activeView={activeView}/>
                <h2 className="text-2xl font-['Lora'] font-bold text-heading mb-5 mt-10">Historical Trends</h2>
                <div className="mt-4">{viewToChartMap[activeView]()}</div>
                <div className="text-center mt-12 text-xs text-body/70">
                    Showing {allReports.length} report(s). Last updated on: {latestReport ? new Date(latestReport.report_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                </div>
            </main>
        </div>
    );
};

export default HealthDashboard;