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
    Platinum: 15000
  };

  const getCurrentTier = (points) => {
    if (points >= tierThresholds.Platinum) return 'Platinum';
    if (points >= tierThresholds.Gold) return 'Gold';
    if (points >= tierThresholds.Silver) return 'Silver';
    return 'Bronze';
  };

  const getNextTier = (currentTier) => {
    const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum'];
    const currentIndex = tiers.indexOf(currentTier);
    return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
  };

  const currentTier = getCurrentTier(user.points);
  const nextTier = getNextTier(currentTier);
  const currentThreshold = tierThresholds[currentTier];
  const nextThreshold = nextTier ? tierThresholds[nextTier] : user.points;
  const progress = nextTier ? ((user.points - currentThreshold) / (nextThreshold - currentThreshold)) * 100 : 100;

  return (
    <div className="dashboard">
      <div className="points-card">
        <h3>ShermCoin Balance</h3>
        <div className="points-amount">{user.points?.toLocaleString() || 0}</div>
        <div className="tier-badge" style={{ backgroundColor: tierColors[currentTier] }}>
          {currentTier} Member
        </div>
      </div>
      
      {nextTier && (
        <div className="progress-card">
          <h4>Progress to {nextTier}</h4>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%`, backgroundColor: tierColors[nextTier] }}
            ></div>
          </div>
          <p>{nextThreshold - user.points} ShermCoins to {nextTier}</p>
        </div>
      )}
      
      <div className="welcome-message">
        <h2>Welcome back, {user.name}!</h2>
      </div>
    </div>
  );
};

export default Dashboard;