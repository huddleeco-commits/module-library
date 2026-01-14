import React from 'react';

const CompletionStep = ({ totalRewards = 0, onFinish }) => {
  return (
    <div className="completion-step">
      <div className="confetti">🎉</div>
      <h2>You're All Set!</h2>
      <p className="subtitle">Your account is ready to start earning</p>
      
      {totalRewards > 0 && (
        <div className="rewards-earned">
          <span className="rewards-label">Total Bonuses Earned</span>
          <span className="rewards-amount">${totalRewards.toFixed(2)}</span>
        </div>
      )}
      
      <div className="next-steps">
        <h3>What's next?</h3>
        <ul>
          <li>📋 Complete your first survey</li>
          <li>🔥 Build a daily streak for bonus rewards</li>
          <li>💰 Cash out when you reach $5.00</li>
        </ul>
      </div>
      
      <button className="primary-btn" onClick={onFinish}>
        Start Earning →
      </button>
      
      <style jsx>{`
        .completion-step {
          max-width: 400px;
          margin: 0 auto;
          padding: 20px;
          text-align: center;
        }
        
        .confetti {
          font-size: 64px;
          margin-bottom: 20px;
          animation: bounce 0.6s ease infinite;
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        h2 {
          font-size: 28px;
          margin-bottom: 8px;
          color: #22c55e;
        }
        
        .subtitle {
          color: #666;
          margin-bottom: 30px;
        }
        
        .rewards-earned {
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          color: white;
          padding: 20px;
          border-radius: 16px;
          margin-bottom: 30px;
        }
        
        .rewards-label {
          display: block;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          opacity: 0.9;
          margin-bottom: 8px;
        }
        
        .rewards-amount {
          font-size: 36px;
          font-weight: 800;
        }
        
        .next-steps {
          text-align: left;
          background: #f8f9fa;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 30px;
        }
        
        .next-steps h3 {
          font-size: 14px;
          color: #666;
          margin-bottom: 12px;
        }
        
        .next-steps ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .next-steps li {
          padding: 10px 0;
          border-bottom: 1px solid #e0e0e0;
          font-size: 15px;
        }
        
        .next-steps li:last-child {
          border-bottom: none;
        }
        
        .primary-btn {
          width: 100%;
          padding: 18px;
          font-size: 18px;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: transform 0.2s;
        }
        
        .primary-btn:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

export default CompletionStep;
