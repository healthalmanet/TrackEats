const InfoCards = ({ data }) => {
  return (
    <div>
      <p>Insulin Dependent: {data.insulin_dependent ? 'Yes' : 'No'}</p>
      <p>Medications: {data.medications}</p>
      <p>Diagnosis Date: {data.diagnosis_date}</p>
    </div>
  );
};

export default InfoCards;
