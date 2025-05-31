import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const HbA1CChart = ({ hba1c }) => {
  const data = [
    { name: 'HbA1c', value: hba1c },
  ];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <XAxis dataKey="name" />
        <YAxis domain={[0, 12]} />
        <Tooltip />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default HbA1CChart;
