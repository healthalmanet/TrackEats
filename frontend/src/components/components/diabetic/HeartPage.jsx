// src/pages/HeartHealthPage.jsx

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ReferenceLine } from 'recharts';
import { Droplet, HeartPulse, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { getDiabeticProfile } from '../../../api/diabeticApi'; // Using the provided API

// --- Helper Functions for Health Status ---

const getBPStatus = (systolic, diastolic) => {
  if (!systolic || !diastolic) return { remark: 'No Data', theme: 'gray' };
  if (systolic < 120 && diastolic < 80) return { remark: 'Normal', theme: 'green' };
  if (systolic >= 120 && systolic <= 129 && diastolic < 80) return { remark: 'Elevated', theme: 'yellow' };
  if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) return { remark: 'Stage 1 High', theme: 'orange' };
  if (systolic >= 140 || diastolic >= 90) return { remark: 'Stage 2 High', theme: 'rose' };
  return { remark: 'Normal', theme: 'green' };
};

const getLDLStatus = (ldl) => {
  if (!ldl) return { remark: 'No Data', theme: 'gray' };
  if (ldl < 100) return { remark: 'Optimal', theme: 'green' };
  if (ldl < 130) return { remark: 'Near Optimal', theme: 'yellow' };
  if (ldl < 160) return { remark: 'Borderline High', theme: 'orange' };
  return { remark: 'High', theme: 'rose' };
};

const getHDLStatus = (hdl) => {
  if (!hdl) return { remark: 'No Data', theme: 'gray' };
  if (hdl >= 60) return { remark: 'Optimal', theme: 'green' };
  if (hdl >= 40) return { remark: 'Acceptable', theme: 'yellow' };
  return { remark: 'Low', theme: 'rose' };
};

const getTriglycerideStatus = (tri) => {
  if (!tri) return { remark: 'No Data', theme: 'gray' };
  if (tri < 150) return { remark: 'Normal', theme: 'green' };
  if (tri < 200) return { remark: 'Borderline High', theme: 'yellow' };
  if (tri < 500) return { remark: 'High', theme: 'orange' };
  return { remark: 'Very High', theme: 'rose' };
};

// --- Reusable Themed Card Component ---
const HealthStatCard = ({ title, value, unit, icon, status, theme = 'gray' }) => {
  const themeStyles = {
    green: { bg: 'bg-lime-100/60', text: 'text-lime-700', border: 'border-lime-200' },
    yellow: { bg: 'bg-amber-100/60', text: 'text-amber-700', border: 'border-amber-200' },
    orange: { bg: 'bg-orange-100/60', text: 'text-orange-700', border: 'border-orange-200' },
    rose: { bg: 'bg-rose-100/60', text: 'text-rose-700', border: 'border-rose-200' },
    gray: { bg: 'bg-slate-100/60', text: 'text-slate-700', border: 'border-slate-200' },
  };
  const currentTheme = themeStyles[theme];

  return (
    <div className="bg-white/70 backdrop-blur-sm border border-[#ECEFF1] rounded-2xl shadow-lg p-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-[#FF7043]/50">
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-white/60 ${currentTheme.bg}`}>
          {React.cloneElement(icon, { className: `${currentTheme.text}`, size: 24 })}
        </div>
        <div>
          <h4 className="font-['Poppins'] font-semibold text-sm text-[#546E7A]">{title}</h4>
          <div className="text-3xl font-bold text-[#263238] font-['Poppins'] flex items-baseline mt-1">
            {value ?? 'N/A'}
            {unit && <span className="ml-1.5 text-base font-medium text-[#546E7A] font-['Roboto']">{unit}</span>}
          </div>
        </div>
      </div>
      {status && (
        <div className={`mt-3 text-sm font-semibold text-center py-1.5 rounded-lg border-2 ${currentTheme.bg} ${currentTheme.text} ${currentTheme.border}`}>
          {status}
        </div>
      )}
    </div>
  );
};


// --- Main Heart Health Page Component ---
const HeartPage = () => {
    const [summaryData, setSummaryData] = useState(null);
    const [historicalData, setHistoricalData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHeartData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await getDiabeticProfile();
                const reports = response?.results || [];

                if (reports.length === 0) {
                    throw new Error("No lab reports found for your profile.");
                }

                // Sort reports by date, most recent first
                reports.sort((a, b) => new Date(b.report_date) - new Date(a.report_date));
                
                // Set the latest report for summary cards
                const latestReport = reports[0];
                setSummaryData(latestReport);

                // Format historical data for charts
                const formattedHistory = reports
                    .map(d => ({
                        date: new Date(d.report_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        systolic: d.blood_pressure_systolic,
                        diastolic: d.blood_pressure_diastolic,
                        ldl: d.ldl_cholesterol,
                        hdl: d.hdl_cholesterol,
                        triglycerides: d.triglycerides,
                    }))
                    .reverse(); // reverse to show oldest to newest in charts
                
                setHistoricalData(formattedHistory);

            } catch (err) {
                console.error("Failed to fetch heart health data:", err);
                setError(err.message || "Could not load data. Please try again.");
                setSummaryData({}); // Set to empty object on error to hide loading state
            } finally {
                setIsLoading(false);
            }
        };

        fetchHeartData();
    }, []);

    // --- Loading State ---
    if (isLoading) {
        return <div className="flex flex-col justify-center items-center h-screen bg-[#FFFDF9]"><div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-[#FF7043]"></div><p className="text-xl text-[#546E7A] font-['Poppins'] mt-4">Loading Heart Health Data...</p></div>;
    }
    
    // --- Error State ---
    if (error) {
        return <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center p-6"><div className="bg-white border border-[#ECEFF1] rounded-2xl p-8 max-w-lg w-full text-center shadow-xl"><h1 className="text-2xl font-['Poppins'] font-bold text-rose-600 mb-3">An Error Occurred</h1><p className="mt-4 text-md text-[#546E7A]">{error}</p></div></div>;
    }

    const bpStatus = getBPStatus(summaryData.blood_pressure_systolic, summaryData.blood_pressure_diastolic);
    const ldlStatus = getLDLStatus(summaryData.ldl_cholesterol);
    const hdlStatus = getHDLStatus(summaryData.hdl_cholesterol);
    const triStatus = getTriglycerideStatus(summaryData.triglycerides);

    return (
        <div className="min-h-screen bg-[#FFFDF9] p-4 sm:p-6 lg:p-10 font-['Roboto'] text-[#546E7A]">
            <div className="max-w-7xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-4xl lg:text-5xl font-extrabold text-[#263238] font-['Poppins']" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.05)' }}>
                        Heart Health
                    </h1>
                    <p className="text-lg mt-2">
                        Your summary and trends for key cardiovascular markers.
                    </p>
                </header>

                {/* --- Summary Cards Section --- */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                    <HealthStatCard
                        title="Blood Pressure"
                        value={`${summaryData.blood_pressure_systolic || 'N/A'}/${summaryData.blood_pressure_diastolic || 'N/A'}`}
                        unit="mmHg"
                        icon={<HeartPulse />}
                        status={bpStatus.remark}
                        theme={bpStatus.theme}
                    />
                     <HealthStatCard
                        title="LDL Cholesterol"
                        value={summaryData.ldl_cholesterol}
                        unit="mg/dL"
                        icon={<ChevronDown />}
                        status={ldlStatus.remark}
                        theme={ldlStatus.theme}
                    />
                     <HealthStatCard
                        title="HDL Cholesterol"
                        value={summaryData.hdl_cholesterol}
                        unit="mg/dL"
                        icon={<ChevronUp />}
                        status={hdlStatus.remark}
                        theme={hdlStatus.theme}
                    />
                     <HealthStatCard
                        title="Triglycerides"
                        value={summaryData.triglycerides}
                        unit="mg/dL"
                        icon={<Droplet />}
                        status={triStatus.remark}
                        theme={triStatus.theme}
                    />
                </section>
                
                 {/* --- Charts Section --- */}
                 <section>
                    <h2 className="text-2xl font-['Poppins'] font-semibold text-[#263238] mb-6">Historical Trends</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                         {/* Blood Pressure Chart */}
                        <div className="bg-white/70 backdrop-blur-sm border border-[#ECEFF1] rounded-2xl shadow-lg p-4 sm:p-6">
                            <h3 className="text-lg font-['Poppins'] font-semibold text-[#263238] mb-4">Blood Pressure Over Time (mmHg)</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={historicalData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ECEFF1" />
                                    <XAxis dataKey="date" stroke="#546E7A" />
                                    <YAxis stroke="#546E7A" />
                                    <Tooltip />
                                    <Legend />
                                    <ReferenceLine y={120} label={{ value: "Normal Systolic", position: 'insideTopLeft', fill: '#689F38', fontSize: 12 }} stroke="#AED581" strokeDasharray="4 4" />
                                    <ReferenceLine y={80} label={{ value: "Normal Diastolic", position: 'insideBottomLeft', fill: '#689F38', fontSize: 12 }} stroke="#AED581" strokeDasharray="4 4" />
                                    <Line type="monotone" dataKey="systolic" name="Systolic" stroke="#FF7043" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="diastolic" name="Diastolic" stroke="#B3E5FC" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        {/* Lipid Profile Chart */}
                        <div className="bg-white/70 backdrop-blur-sm border border-[#ECEFF1] rounded-2xl shadow-lg p-4 sm:p-6">
                            <h3 className="text-lg font-['Poppins'] font-semibold text-[#263238] mb-4">Lipid Profile Over Time (mg/dL)</h3>
                             <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={historicalData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ECEFF1" />
                                    <XAxis dataKey="date" stroke="#546E7A" />
                                    <YAxis stroke="#546E7A" domain={[0, 'dataMax + 20']} />
                                    <Tooltip />
                                    <Legend />
                                    <ReferenceLine y={100} label={{ value: "Optimal LDL", position: 'insideTopLeft', fill: '#689F38', fontSize: 12 }} stroke="#AED581" strokeDasharray="4 4" />
                                    <Line type="monotone" dataKey="ldl" name="LDL (Bad)" stroke="#FF7043" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }}/>
                                    <Line type="monotone" dataKey="hdl" name="HDL (Good)" stroke="#AED581" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }}/>
                                    <Line type="monotone" dataKey="triglycerides" name="Triglycerides" stroke="#B3E5FC" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }}/>
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                 </section>
            </div>
        </div>
    );
}

export default HeartPage;