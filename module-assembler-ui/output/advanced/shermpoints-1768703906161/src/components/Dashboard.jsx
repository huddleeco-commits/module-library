import React from 'react';

const Dashboard = ({ user }) => {
  const tierColors = {
    Bronze: '#CD7F32',
    Silver: '#C0C0C0',
    Gold: '#FFD700',
    Platinum: '#E5E4E2'
  };

  const tierThresholds = {
    Bronze: 0,
    Silver: 1000,
    Gold: 5000,
    Platinum: 10000
  };

  const getCurrentTier = (points) => {
    if (points >= 10000) return 'Platinum';
    if (points >= 5000) return 'Gold';
    if (points >= 1000) return 'Silver';
    return 'Bronze';
  };

  const getNextTier = (tier) => {
    const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum'];
    const currentIndex = tiers.indexOf(tier);
    return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
  };

  const currentTier = getCurrentTier(user.points);
  const nextTier = getNextTier(currentTier);
  const nextTierPoints = nextTier ? tierThresholds[nextTier] : null;
  const progress = nextTier ? ((user.points - tierThresholds[currentTier]) / (nextTierPoints - tierThresholds[currentTier])) * 100 : 100;

  return (
    <div className="dashboard">
      <div className="balance-card">
        <h1>ShermCoin Balance</h1>
        <div className="points-display">{user.points.toLocaleString()}</div>
        <div className="tier-badge" style={{ backgroundColor: tierColors[currentTier] }}>
          {currentTier} Member
        </div>
      </div>
      
      {nextTier && (
        <div className="progress-card">
          <h3>Progress to {nextTier}</h3>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${progress}%`,
                backgroundColor: tierColors[nextTier]
              }}
            />
          </div>
          <p>{nextTierPoints - user.points} ShermCoins to {nextTier}</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;