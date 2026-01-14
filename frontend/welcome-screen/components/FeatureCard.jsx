import React from 'react';

const FeatureCard = ({ icon, title, description, highlight }) => {
  return (
    <div className={`feature-card ${highlight ? 'highlight' : ''}`}>
      <div className="feature-icon">{icon}</div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-desc">{description}</p>
      
      <style jsx>{`
        .feature-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          transition: transform 0.2s;
        }
        
        .feature-card:hover {
          transform: translateY(-4px);
        }
        
        .feature-card.highlight {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .feature-icon {
          font-size: 40px;
          margin-bottom: 16px;
        }
        
        .feature-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        
        .feature-desc {
          font-size: 14px;
          color: #666;
          line-height: 1.5;
        }
        
        .feature-card.highlight .feature-desc {
          color: rgba(255,255,255,0.9);
        }
      `}</style>
    </div>
  );
};

export default FeatureCard;
