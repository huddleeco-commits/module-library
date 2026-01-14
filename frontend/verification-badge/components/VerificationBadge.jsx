import React from 'react';

const VerificationBadge = ({ 
  level = 'none', 
  size = 'medium',
  showLabel = true,
  onClick 
}) => {
  const levels = {
    none: { icon: '○', color: '#ccc', label: 'Unverified', bg: '#f5f5f5' },
    phone: { icon: '✓', color: '#3b82f6', label: 'Phone Verified', bg: '#eff6ff' },
    full: { icon: '✓✓', color: '#22c55e', label: 'Fully Verified', bg: '#f0fdf4' }
  };
  
  const sizes = {
    small: { badge: 20, font: 10, labelSize: 10 },
    medium: { badge: 28, font: 12, labelSize: 12 },
    large: { badge: 36, font: 16, labelSize: 14 }
  };
  
  const config = levels[level] || levels.none;
  const sizeConfig = sizes[size] || sizes.medium;
  
  return (
    <div 
      className={`verification-badge ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      title={config.label}
    >
      <span className="badge-icon">{config.icon}</span>
      {showLabel && <span className="badge-label">{config.label}</span>}
      
      <style jsx>{`
        .verification-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: ${config.bg};
          border-radius: 20px;
          border: 1px solid ${config.color}33;
        }
        
        .verification-badge.clickable {
          cursor: pointer;
          transition: transform 0.2s;
        }
        
        .verification-badge.clickable:hover {
          transform: scale(1.05);
        }
        
        .badge-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: ${sizeConfig.badge}px;
          height: ${sizeConfig.badge}px;
          background: ${config.color};
          color: white;
          border-radius: 50%;
          font-size: ${sizeConfig.font}px;
          font-weight: 700;
        }
        
        .badge-label {
          font-size: ${sizeConfig.labelSize}px;
          font-weight: 600;
          color: ${config.color};
        }
      `}</style>
    </div>
  );
};

export default VerificationBadge;
