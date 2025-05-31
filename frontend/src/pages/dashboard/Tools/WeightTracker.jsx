import React, { useState } from 'react';

const WeightTracker = () => {
  const [gender, setGender] = useState('male');
  const [height, setHeight] = useState(170);
  const [age, setAge] = useState(25);
  const [idealWeight, setIdealWeight] = useState(null);

  const calculateIdealWeight = () => {
    let weight = 0;
    if (gender === 'male') {
      weight = 50 + 0.9 * (height - 152);
    } else {
      weight = 45.5 + 0.9 * (height - 152);
    }
    setIdealWeight(parseFloat(weight.toFixed(1)));
  };

  const resetCalculator = () => {
    setIdealWeight(null);
    setGender('male');
    setHeight(170);
    setAge(25);
  };

  if (idealWeight !== null) {
    return (
      <div>
        <div>
          <button onClick={resetCalculator}>← Back</button>
          <h2>RESULT</h2>
          <p>Your Ideal Weight</p>
          <div>{idealWeight} kg</div>
          <p>This is an estimate based on your height and gender.</p>
          <p>Formula: Devine Formula</p>
          <button onClick={resetCalculator}>Recalculate</button>
        </div>
      </div>
    );
  }
// css lagana hai isme 
  return (
    <div>
      <div>
        <h2>WEIGHT TRACKER</h2>

        {/* Gender bataya ga isme  */}
        <div>
          {['male', 'female'].map((g) => (
            <div key={g} onClick={() => setGender(g)}>
              <div>{g === 'male' ? '♂' : '♀'}</div>
              <div>{g}</div>
            </div>
          ))}
        </div>

        {/* Height dena hogi */}
        <div>
          <p>HEIGHT</p>
          <p>{height} cm</p>
          <input
            type="range"
            min="100"
            max="250"
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
          />
        </div>

        {/* Age */}
        <div>
          <p>AGE</p>
          <p>{age}</p>
          <div>
            <button onClick={() => setAge((prev) => Math.max(prev - 1, 1))}>−</button>
            <button onClick={() => setAge((prev) => prev + 1)}>+</button>
          </div>
        </div>

        <button onClick={calculateIdealWeight}>CALCULATE</button>
      </div>
    </div>
  );
};

export default WeightTracker;
