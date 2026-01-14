import React, { useState, useEffect } from 'react';
import WelcomeHero from '../components/WelcomeHero';
import FeatureCard from '../components/FeatureCard';
import RewardTeaser from '../components/RewardTeaser';

const Welcome = ({ 
  appName = 'Common Cents',
  tagline = 'Turn your spare time into real cash',
  userName,
  welcomeBonus = 0.50,
  features = [],
  onComplete,
  onSkip 
}) => {
  const [step, setStep] = useState('hero'); // hero, features, reward
  
  const defaultFeatures = [
    { icon: '📋', title: 'Take Surveys', description: 'Share your opinions and earn money for each completed survey' },
    { icon: '🎯', title: 'Complete Tasks', description: 'Simple micro-tasks that pay instantly to your balance' },
    { icon: '💰', title: 'Cash Out Anytime', description: 'Withdraw your earnings via PayPal, M-Pesa, or GCash' },
    { icon: '🏆', title: 'Earn Bonuses', description: 'Daily streaks, achievements, and special promotions' }
  ];
  
  const displayFeatures = features.length > 0 ? features : defaultFeatures;
  
  const handleGetStarted = () => {
    setStep('features');
  };
  
  const handleContinue = () => {
    setStep('reward');
  };
  
  const handleClaimBonus = () => {
    if (onComplete) onComplete();
  };
  
  return (
    <div className="welcome-page">
      {step === 'hero' && (
        <WelcomeHero
          appName={appName}
          tagline={tagline}
          userName={userName}
          onGetStarted={handleGetStarted}
        />
      )}
      
      {step === 'features' && (
        <div className="features-section">
          <h2 className="features-title">Here's how it works</h2>
          <div className="features-grid">
            {displayFeatures.map((feature, idx) => (
              <FeatureCard key={idx} {...feature} />
            ))}
          </div>
          <button className="continue-btn" onClick={handleContinue}>
            Continue →
          </button>
        </div>
      )}
      
      {step === 'reward' && (
        <div className="reward-section">
          <h2 className="reward-title">🎉 You're all set!</h2>
          <RewardTeaser
            amount={welcomeBonus}
            message="Complete your profile to claim your welcome bonus"
            onClaim={handleClaimBonus}
          />
        </div>
      )}
      
      {onSkip && step !== 'reward' && (
        <button className="skip-btn" onClick={onSkip}>
          Skip for now
        </button>
      )}
      
      <style jsx>{`
        .welcome-page {
          min-height: 100vh;
          background: #f8f9fa;
        }
        
        .features-section, .reward-section {
          padding: 40px 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .features-title, .reward-title {
          text-align: center;
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 32px;
          color: #1a1a2e;
        }
        
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        
        .continue-btn {
          display: block;
          width: 100%;
          max-width: 300px;
          margin: 0 auto;
          padding: 16px 32px;
          font-size: 18px;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 30px;
          cursor: pointer;
          transition: transform 0.2s;
        }
        
        .continue-btn:hover {
          transform: translateY(-2px);
        }
        
        .skip-btn {
          position: fixed;
          bottom: 30px;
          right: 30px;
          padding: 12px 24px;
          font-size: 14px;
          color: #666;
          background: white;
          border: 1px solid #ddd;
          border-radius: 20px;
          cursor: pointer;
        }
        
        .skip-btn:hover {
          background: #f5f5f5;
        }
      `}</style>
    </div>
  );
};

export default Welcome;
