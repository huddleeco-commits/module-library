import React from 'react';

const RewardTeaser = ({ amount, currency = '$', message, onClaim }) => {
  return (
    <div className="reward-teaser">
      <div className="reward-badge">
        <span className="reward-amount">{currency}{amount.toFixed(2)}</span>
        <span className="reward-label">Welcome Bonus</span>
      </div>
      <p className="reward-message">{message}</p>
      {onClaim && (
        <button className="reward-claim" onClick={onClaim}>
          Claim Your Bonus
        </button>
      )}
      
      <style jsx>{`
        .reward-teaser {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          border-radius: 20px;
          padding: 32px;
          text-align: center;
          color: white;
          margin: 20px 0;
        }
        
        .reward-badge {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          width: 120px;
          height: 120px;
          justify-content: center;
          margin-bottom: 20px;
          animation: pulse 2s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .reward-amount {
          font-size: 32px;
          font-weight: 800;
        }
        
        .reward-label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          opacity: 0.9;
        }
        
        .reward-message {
          font-size: 16px;
          margin-bottom: 20px;
          opacity: 0.95;
        }
        
        .reward-claim {
          padding: 14px 36px;
          font-size: 16px;
          font-weight: 600;
          color: #f5576c;
          background: white;
          border: none;
          border-radius: 25px;
          cursor: pointer;
          transition: transform 0.2s;
        }
        
        .reward-claim:hover {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

export default RewardTeaser;
