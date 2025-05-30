import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const FastingSugarChart = ({ fastingBloodSugar }) => {
  const data = [
    { name: 'Fasting Blood Sugar', value: fastingBloodSugar },
  ];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <XAxis dataKey="name" />
        <YAxis domain={[70, 200]} />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#82ca9d" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default FastingSugarChart;
