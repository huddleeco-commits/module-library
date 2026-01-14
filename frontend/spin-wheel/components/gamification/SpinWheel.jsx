import React, { useState, useRef } from 'react';

const PRIZES = [
  { value: 0.01, label: '$0.01', color: '#4ade80' },
  { value: 0.05, label: '$0.05', color: '#22d3ee' },
  { value: 0.10, label: '$0.10', color: '#a78bfa' },
  { value: 0.25, label: '$0.25', color: '#f472b6' },
  { value: 0.50, label: '$0.50', color: '#fb923c' },
  { value: 1.00, label: '$1.00', color: '#facc15' },
  { value: 5.00, label: '$5.00', color: '#ef4444' },
  { value: 0.10, label: '$0.10', color: '#a78bfa' }
];

export default function SpinWheel({ onSpinComplete, disabled, canSpin, timeRemaining }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(null);
  const wheelRef = useRef(null);

  const spinWheel = async () => {
    if (isSpinning || disabled || !canSpin) return;
    
    setIsSpinning(true);
    setResult(null);
    
    // Random prize index (would come from API)
    const prizeIndex = Math.floor(Math.random() * PRIZES.length);
    const prize = PRIZES[prizeIndex];
    
    // Calculate rotation
    const segmentAngle = 360 / PRIZES.length;
    const targetAngle = 360 - (prizeIndex * segmentAngle) - (segmentAngle / 2);
    const fullRotations = 5 * 360;
    const finalRotation = rotation + fullRotations + targetAngle + (Math.random() * 20 - 10);
    
    setRotation(finalRotation);
    
    // Wait for animation
    setTimeout(() => {
      setIsSpinning(false);
      setResult(prize);
      if (onSpinComplete) {
        onSpinComplete(prize);
      }
    }, 4000);
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  return (
    <div className="spin-wheel-container" style={styles.container}>
      <div className="wheel-wrapper" style={styles.wheelWrapper}>
        <div className="pointer" style={styles.pointer}>▼</div>
        <svg
          ref={wheelRef}
          viewBox="0 0 200 200"
          style={{
            ...styles.wheel,
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
          }}
        >
          {PRIZES.map((prize, i) => {
            const angle = (360 / PRIZES.length) * i;
            const nextAngle = (360 / PRIZES.length) * (i + 1);
            const startRad = (angle - 90) * Math.PI / 180;
            const endRad = (nextAngle - 90) * Math.PI / 180;
            const x1 = 100 + 95 * Math.cos(startRad);
            const y1 = 100 + 95 * Math.sin(startRad);
            const x2 = 100 + 95 * Math.cos(endRad);
            const y2 = 100 + 95 * Math.sin(endRad);
            const largeArc = nextAngle - angle > 180 ? 1 : 0;
            
            const midAngle = (angle + nextAngle) / 2 - 90;
            const midRad = midAngle * Math.PI / 180;
            const textX = 100 + 60 * Math.cos(midRad);
            const textY = 100 + 60 * Math.sin(midRad);
            
            return (
              <g key={i}>
                <path
                  d={`M100,100 L${x1},${y1} A95,95 0 ${largeArc},1 ${x2},${y2} Z`}
                  fill={prize.color}
                  stroke="#1a1a2e"
                  strokeWidth="2"
                />
                <text
                  x={textX}
                  y={textY}
                  fill="#fff"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${angle + (360 / PRIZES.length / 2)}, ${textX}, ${textY})`}
                >
                  {prize.label}
                </text>
              </g>
            );
          })}
          <circle cx="100" cy="100" r="15" fill="#1a1a2e" />
        </svg>
      </div>
      
      {result && (
        <div style={styles.result}>
          🎉 You won {result.label}!
        </div>
      )}
      
      <button
        onClick={spinWheel}
        disabled={isSpinning || disabled || !canSpin}
        style={{
          ...styles.spinButton,
          opacity: (isSpinning || disabled || !canSpin) ? 0.5 : 1,
          cursor: (isSpinning || disabled || !canSpin) ? 'not-allowed' : 'pointer'
        }}
      >
        {isSpinning ? 'Spinning...' : canSpin ? '🎰 SPIN NOW!' : `Next spin in ${formatTime(timeRemaining || 0)}`}
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    borderRadius: '16px',
    border: '1px solid #2a2a4a'
  },
  wheelWrapper: {
    position: 'relative',
    width: '280px',
    height: '280px'
  },
  wheel: {
    width: '100%',
    height: '100%'
  },
  pointer: {
    position: 'absolute',
    top: '-10px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '30px',
    color: '#facc15',
    zIndex: 10,
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
  },
  result: {
    marginTop: '20px',
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #00e676 0%, #00b0ff 100%)',
    borderRadius: '8px',
    color: '#000',
    fontWeight: 'bold',
    fontSize: '18px'
  },
  spinButton: {
    marginTop: '20px',
    padding: '16px 48px',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#000',
    background: 'linear-gradient(135deg, #00e676 0%, #00b0ff 100%)',
    border: 'none',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0, 230, 118, 0.4)'
  }
};
