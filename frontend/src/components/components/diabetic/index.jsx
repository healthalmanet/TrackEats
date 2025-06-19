import { useEffect, useState } from 'react';
import { getDiabeticReport } from '../../../api/diabeticApi';
import DiabeticDashboard from './DiabeticDashboard';
import { useAuth } from '../../context/AuthContext';  // import your custom hook


const DiabeticPage = () => {
  const { token } = useAuth();  // use the hook to get token
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (token) {
          const res = await getDiabeticReport(token);
          setData(res);
        }
      } catch (err) {
        console.error("Error fetching diabetic report:", err);
      }
    };

    fetchData();
  }, [token]);

  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <h2>Diabetic Report</h2>
      <DiabeticDashboard data={data} />
    </div>
    
  );
};

export default DiabeticPage;
