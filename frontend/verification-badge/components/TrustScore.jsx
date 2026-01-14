import React from 'react';

const TrustScore = ({ 
  score = 0, 
  maxScore = 100,
  showLabel = true,
  size = 'medium'
}) => {
  const percentage = Math.min(100, Math.max(0, (score / maxScore) * 100));
  
  const getColor = (pct) => {
    if (pct >= 80) return '#22c55e';
    if (pct >= 60) return '#84cc16';
    if (pct >= 40) return '#eab308';
    if (pct >= 20) return '#f97316';
    return '#ef4444';
  };
  
  const getLabel = (pct) => {
    if (pct >= 80) return 'Excellent';
    if (pct >= 60) return 'Good';
    if (pct >= 40) return 'Fair';
    if (pct >= 20) return 'Low';
    return 'New';
  };
  
  const color = getColor(percentage);
  const label = getLabel(percentage);
  
  const sizes = {
    small: { width: 60, height: 6, font: 11 },
    medium: { width: 100, height: 8, font: 13 },
    large: { width: 150, height: 10, font: 15 }
  };
  
  const sizeConfig = sizes[size] || sizes.medium;
  
  return (
    <div className="trust-score">
      <div className="score-bar">
        <div className="score-fill" />
      </div>
      {showLabel && (
        <div className="score-info">
          <span className="score-value">{Math.round(score)}</span>
          <span className="score-label">{label}</span>
        </div>
      )}
      
      <style jsx>{`
        .trust-score {
          display: inline-flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .score-bar {
          width: ${sizeConfig.width}px;
          height: ${sizeConfig.height}px;
          background: #e5e7eb;
          border-radius: ${sizeConfig.height}px;
          overflow: hidden;
        }
        
        .score-fill {
          width: ${percentage}%;
          height: 100%;
          background: ${color};
          border-radius: ${sizeConfig.height}px;
          transition: width 0.5s ease;
        }
        
        .score-info {
          display: flex;
          justify-content: space-between;
          font-size: ${sizeConfig.font}px;
        }
        
        .score-value {
          font-weight: 700;
          color: ${color};
        }
        
        .score-label {
          color: #888;
        }
      `}</style>
    </div>
  );
};

export default TrustScore;
