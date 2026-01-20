import React from 'react';

const MemberCard = ({ user }) => {
  const tierColors = {
    Bronze: '#CD7F32',
    Silver: '#C0C0C0',
    Gold: '#FFD700',
    Platinum: '#E5E4E2'
  };

  const getCurrentTier = (points) => {
    if (points >= 10000) return 'Platinum';
    if (points >= 5000) return 'Gold';
    if (points >= 1000) return 'Silver';
    return 'Bronze';
  };

  const currentTier = getCurrentTier(user.points);

  return (
    <div className="member-card-container">
      <div 
        className="member-card"
        style={{
          background: `linear-gradient(135deg, ${tierColors[currentTier]}40, ${tierColors[currentTier]}20)`
        }}
      >
        <div className="card-header">
          <h2>ShermCoin Member</h2>
          <div className="tier-badge" style={{ backgroundColor: tierColors[currentTier] }}>
            {currentTier}
          </div>
        </div>
        
        <div className="card-content">
          <div className="member-info">
            <h3>{user.name}</h3>
            <p>Member ID: {user.id}</p>
            <p>Points: {user.points.toLocaleString()}</p>
          </div>
          
          <div className="qr-section">
            <div className="qr-placeholder">
              <div className="qr-code">
                <div className="qr-pattern">
                  {Array.from({ length: 49 }, (_, i) => (
                    <div key={i} className={`qr-dot ${Math.random() > 0.5 ? 'filled' : ''}`} />
                  ))}
                </div>
              </div>
              <p>Scan to earn points</p>
            </div>
          </div>
        </div>
        
        <div className="card-footer">
          <p>Valid until: Dec 2024</p>
        </div>
      </div>
    </div>
  );
};

export default MemberCard;