import HbA1CChart from './HbA1CChart';
import FastingSugarChart from './FastingSugarChart';
import InfoCards from './InfoCards';

const DiabeticDashboard = ({ data }) => {
  // Provide default values to avoid undefined issues
  const safeData = {
    hba1c: data?.hba1c ?? 0,
    fasting_blood_sugar: data?.fasting_blood_sugar ?? 0,
    insulin_dependent: data?.insulin_dependent ?? false,
    medications: data?.medications ?? 'N/A',
    diagnosis_date: data?.diagnosis_date ?? 'Unknown',
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h3 style={{ marginBottom: '15px' }}>Patient Info</h3>
      <div
        style={{
          border: '1px solid #ccc',
          padding: '15px',
          marginBottom: '25px',
          borderRadius: '8px',
          backgroundColor: '#f9f9f9',
        }}
      >
        <InfoCards data={safeData} />
      </div>

      <div
        style={{
          marginBottom: '30px',
          border: '1px solid #8884d8',
          borderRadius: '8px',
          padding: '15px',
          backgroundColor: '#fafafa',
          height: '250px',
        }}
      >
        <h4>HbA1c Chart</h4>
        <div style={{ width: '100%', height: '200px' }}>
          <HbA1CChart hba1c={safeData.hba1c} />
        </div>
      </div>

      <div
        style={{
          border: '1px solid #82ca9d',
          borderRadius: '8px',
          padding: '15px',
          backgroundColor: '#fafafa',
          height: '250px',
        }}
      >
        <h4>Fasting Blood Sugar Chart</h4>
        <div style={{ width: '100%', height: '200px' }}>
          <FastingSugarChart fastingBloodSugar={safeData.fasting_blood_sugar} />
        </div>
      </div>
    </div>
  );
};

export default DiabeticDashboard;
