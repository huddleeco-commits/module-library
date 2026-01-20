import React from 'react';

const MemberCard = ({ user }) => {
  const tierColors = {
    Bronze: '#CD7F32',
    Silver: '#C0C0C0',
    Gold: '#FFD700',
    Platinum: '#E5E4E2'
  };

  const getCurrentTier = (points) => {
    if (points >= 15000) return 'Platinum';
    if (points >= 5000) return 'Gold';
    if (points >= 1000) return 'Silver';
    return 'Bronze';
  };

  const tier = getCurrentTier(user.points);
  const memberNumber = user.id?.toString().padStart(8, '0') || '00000000';

  return (
    <div className="member-card-container">
      <div 
        className="member-card"
        style={{ 
          background: `linear-gradient(135deg, ${tierColors[tier]}20, ${tierColors[tier]}40)`,
          borderColor: tierColors[tier]
        }}
      >
        <div className="card-header">
          <h3>ShermCoin Member</h3>
          <div className="tier-badge" style={{ backgroundColor: tierColors[tier] }}>
            {tier}
          </div>
        </div>
        
        <div className="member-info">
          <h2>{user.name}</h2>
          <p>Member #{memberNumber}</p>
        </div>
        
        <div className="qr-section">
          <div className="qr-placeholder">
            <div className="qr-code">
              <div className="qr-pattern"></div>
              <div className="qr-pattern"></div>
              <div className="qr-pattern"></div>
              <div className="qr-pattern"></div>
            </div>
          </div>
          <p>Scan to earn points</p>
        </div>
        
        <div className="card-footer">
          <span>{user.points?.toLocaleString() || 0} ShermCoins</span>
          <span>Valid Member</span>
        </div>
      </div>
    </div>
  );
};

export default MemberCard;