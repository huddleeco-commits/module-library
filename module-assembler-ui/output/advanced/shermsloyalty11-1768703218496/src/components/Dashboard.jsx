import React from 'react';

const Dashboard = ({ user }) => {
  const getTierColor = (tier) => {
    switch(tier) {
      case 'Bronze': return '#CD7F32';
      case 'Silver': return '#C0C0C0';
      case 'Gold': return '#FFD700';
      case 'Platinum': return '#E5E4E2';
      default: return '#CD7F32';
    }
  };

  const getNextTier = (tier) => {
    const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum'];
    const currentIndex = tiers.indexOf(tier);
    return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
  };

  const getTierThreshold = (tier) => {
    const thresholds = { Bronze: 1000, Silver: 2500, Gold: 5000, Platinum: 10000 };
    return thresholds[tier] || 0;
  };

  const nextTier = getNextTier(user.tier);
  const currentThreshold = getTierThreshold(user.tier);
  const nextThreshold = nextTier ? getTierThreshold(nextTier) : null;
  const progress = nextThreshold ? ((user.points - currentThreshold) / (nextThreshold - currentThreshold)) * 100 : 100;

  return (
    <div className="p-4 space-y-6">
      <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-30">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome, {user.name}!</h1>
          <div className="text-4xl font-bold mb-2" style={{color: getTierColor(user.tier)}}>
            {user.points.toLocaleString()} ShermCoins
          </div>
          <div className="text-lg font-semibold mb-4" style={{color: getTierColor(user.tier)}}>
            {user.tier} Member
          </div>
        </div>
      </div>

      {nextTier && (
        <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-30">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Progress to {nextTier}</h2>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
            <div 
              className="h-3 rounded-full transition-all duration-500"
              style={{width: `${Math.min(progress, 100)}%`, backgroundColor: getTierColor(nextTier)}}
            ></div>
          </div>
          <div className="text-sm text-gray-600">
            {nextThreshold - user.points} ShermCoins to {nextTier}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-4 border border-white border-opacity-30 text-center">
          <div className="text-2xl mb-2">💰</div>
          <div className="text-sm text-gray-600">Total Earned</div>
          <div className="text-lg font-bold text-gray-800">{user.totalEarned || 0}</div>
        </div>
        
        <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-4 border border-white border-opacity-30 text-center">
          <div className="text-2xl mb-2">🎁</div>
          <div className="text-sm text-gray-600">Rewards Used</div>
          <div className="text-lg font-bold text-gray-800">{user.rewardsUsed || 0}</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;