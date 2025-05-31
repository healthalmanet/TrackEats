import React, { useState } from 'react';

const WaterTracker = () => {
  const [weight, setWeight] = useState(60); // in kg k liye h
  const [age, setAge] = useState(25);
  const [waterIntake, setWaterIntake] = useState(null);

  const calculateWaterIntake = () => {
    // General rule: 35 ml of water per kg body weight
    const intake = (weight * 35) / 1000; // in liters
    setWaterIntake(parseFloat(intake.toFixed(2)));
  };

  const resetTracker = () => {
    setWeight(60);
    setAge(25);
    setWaterIntake(null);
  };

  if (waterIntake !== null) {
    return (
      <div>
        <div>
          <button onClick={resetTracker}>← Back</button>
          <h2>RESULT</h2>
          <p>Your Recommended Daily Water Intake:</p>
          <div>{waterIntake} Liters</div>
          <p>This is based on your body weight using the 35ml/kg formula.</p>
          <button onClick={resetTracker}>Recalculate</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div>
        <h2>WATER TRACKER</h2>

        {/* Weight */}
        <div>
          <p>WEIGHT</p>
          <p>{weight} kg</p>
          <div>
            <button onClick={() => setWeight((prev) => Math.max(prev - 1, 1))}>−</button>
            <button onClick={() => setWeight((prev) => prev + 1)}>+</button>
          </div>
        </div>

        {/* Ag k liye*/}
        <div>
          <p>AGE</p>
          <p>{age}</p>
          <div>
            <button onClick={() => setAge((prev) => Math.max(prev - 1, 1))}>−</button>
            <button onClick={() => setAge((prev) => prev + 1)}>+</button>
          </div>
        </div>

        <button onClick={calculateWaterIntake}>CALCULATE</button>
      </div>
    </div>
  );
};

export default WaterTracker;
