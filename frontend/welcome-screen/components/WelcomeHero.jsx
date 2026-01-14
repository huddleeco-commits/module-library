import React from 'react';

const WelcomeHero = ({ appName, tagline, userName, onGetStarted }) => {
  return (
    <div className="welcome-hero">
      <div className="welcome-hero-content">
        <div className="welcome-emoji">👋</div>
        <h1 className="welcome-title">
          {userName ? `Welcome, ${userName}!` : `Welcome to ${appName}!`}
        </h1>
        <p className="welcome-tagline">{tagline}</p>
        <button className="welcome-cta" onClick={onGetStarted}>
          Get Started →
        </button>
      </div>
      
      <style jsx>{`
        .welcome-hero {
          min-height: 60vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 40px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 0 0 40px 40px;
        }
        
        .welcome-hero-content {
          max-width: 500px;
        }
        
        .welcome-emoji {
          font-size: 64px;
          margin-bottom: 20px;
          animation: wave 1s ease-in-out infinite;
        }
        
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(20deg); }
          75% { transform: rotate(-20deg); }
        }
        
        .welcome-title {
          font-size: 32px;
          font-weight: 800;
          color: white;
          margin-bottom: 12px;
        }
        
        .welcome-tagline {
          font-size: 18px;
          color: rgba(255,255,255,0.9);
          margin-bottom: 32px;
          line-height: 1.5;
        }
        
        .welcome-cta {
          padding: 16px 48px;
          font-size: 18px;
          font-weight: 600;
          color: #667eea;
          background: white;
          border: none;
          border-radius: 30px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .welcome-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default WelcomeHero;
