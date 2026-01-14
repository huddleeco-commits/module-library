import React from 'react';

const VerificationPrompt = ({ 
  currentLevel = 'none',
  nextStep = 'phone',
  reward = 2.00,
  onVerify,
  onDismiss
}) => {
  const prompts = {
    phone: {
      icon: '📱',
      title: 'Verify Your Phone',
      description: 'Unlock higher earning limits and faster payouts',
      cta: 'Verify Now'
    },
    payout: {
      icon: '💳',
      title: 'Set Up Payouts',
      description: 'Add a payout method to withdraw your earnings',
      cta: 'Add Method'
    },
    full: {
      icon: '🏆',
      title: 'Complete Verification',
      description: 'Get access to premium surveys and instant payouts',
      cta: 'Complete Now'
    }
  };
  
  const prompt = prompts[nextStep] || prompts.phone;
  
  return (
    <div className="verification-prompt">
      <button className="dismiss-btn" onClick={onDismiss}>×</button>
      
      <div className="prompt-icon">{prompt.icon}</div>
      <div className="prompt-content">
        <h3 className="prompt-title">{prompt.title}</h3>
        <p className="prompt-desc">{prompt.description}</p>
        {reward > 0 && (
          <div className="prompt-reward">
            +${reward.toFixed(2)} bonus
          </div>
        )}
      </div>
      <button className="prompt-cta" onClick={onVerify}>
        {prompt.cta}
      </button>
      
      <style jsx>{`
        .verification-prompt {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
          border: 1px solid #667eea33;
          border-radius: 12px;
          position: relative;
        }
        
        .dismiss-btn {
          position: absolute;
          top: 8px;
          right: 12px;
          background: none;
          border: none;
          font-size: 20px;
          color: #888;
          cursor: pointer;
          line-height: 1;
        }
        
        .prompt-icon {
          font-size: 36px;
          flex-shrink: 0;
        }
        
        .prompt-content {
          flex: 1;
        }
        
        .prompt-title {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 4px;
          color: #1a1a2e;
        }
        
        .prompt-desc {
          font-size: 13px;
          color: #666;
          margin-bottom: 6px;
        }
        
        .prompt-reward {
          display: inline-block;
          padding: 4px 10px;
          background: #22c55e;
          color: white;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .prompt-cta {
          padding: 12px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          white-space: nowrap;
          transition: transform 0.2s;
        }
        
        .prompt-cta:hover {
          transform: translateY(-2px);
        }
        
        @media (max-width: 500px) {
          .verification-prompt {
            flex-direction: column;
            text-align: center;
          }
          
          .prompt-cta {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default VerificationPrompt;
