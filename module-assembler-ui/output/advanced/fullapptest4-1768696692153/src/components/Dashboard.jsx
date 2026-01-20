import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  const tiers = [
    { name: "Bronze", minPoints: 0, multiplier: 1, color: "#CD7F32" },
    { name: "Silver", minPoints: 500, multiplier: 1.25, color: "#C0C0C0" },
    { name: "Gold", minPoints: 2000, multiplier: 1.5, color: "#FFD700" },
    { name: "Platinum", minPoints: 5000, multiplier: 2, color: "#E5E4E2" }
  ];

  const getCurrentTier = (points) => {
    return tiers.reduce((current, tier) => {
      return points >= tier.minPoints ? tier : current;
    }, tiers[0]);
  };

  const getNextTier = (points) => {
    return tiers.find(tier => points < tier.minPoints);
  };

  const getProgressToNextTier = (points) => {
    const currentTier = getCurrentTier(points);
    const nextTier = getNextTier(points);
    
    if (!nextTier) return 100;
    
    const progress = ((points - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100;
    return Math.min(progress, 100);
  };

  const currentTier = getCurrentTier(user?.points || 0);
  const nextTier = getNextTier(user?.points || 0);
  const progress = getProgressToNextTier(user?.points || 0);

  const recentTransactions = [
    { id: 1, date: '2024-01-15', description: 'Purchase at Store', points: 25, type: 'earn' },
    { id: 2, date: '2024-01-14', description: '$5 Off Reward Redeemed', points: -100, type: 'redeem' },
    { id: 3, date: '2024-01-12', description: 'Purchase at Store', points: 45, type: 'earn' },
    { id: 4, date: '2024-01-10', description: 'Bonus Points', points: 50, type: 'bonus' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="backdrop-blur-lg bg-white/30 border border-white/20 rounded-2xl shadow-xl p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-gray-600 text-lg">
                You're doing great with your loyalty journey at fullapptest4.
              </p>
            </div>
            <div className="mt-6 lg:mt-0">
              <div className="flex items-center space-x-4">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg"
                  style={{ backgroundColor: currentTier.color }}
                >
                  {currentTier.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Tier</p>
                  <p className="text-xl font-bold" style={{ color: currentTier.color }}>
                    {currentTier.name}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Points Display */}
          <div className="backdrop-blur-lg bg-white/30 border border-white/20 rounded-2xl shadow-xl p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Points</h2>
              <div className="mb-6">
                <div className="text-5xl font-bold text-blue-600 mb-2">
                  {user?.points || 0}
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: currentTier.color }}
                  ></div>
                  <span className="text-gray-600">{currentTier.name} Member</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">{currentTier.multiplier}x multiplier</span>
                </div>
              </div>
              
              {nextTier && (
                <div className="bg-white/50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">
                    {nextTier.minPoints - (user?.points || 0)} points to {nextTier.name}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="h-3 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${progress}%`,
                        backgroundColor: nextTier.color
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {!nextTier && (
                <div className="bg-gradient-to-r from-purple-100 to-gold-100 rounded-lg p-4">
                  <p className="text-lg font-semibold text-purple-800">
                    🎉 You've reached the highest tier!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Tier Progress */}
          <div className="backdrop-blur-lg bg-white/30 border border-white/20 rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Tier Progress</h3>
            <div className="space-y-4">
              {tiers.map((tier, index) => {
                const isUnlocked = (user?.points || 0) >= tier.minPoints;
                const isCurrent = currentTier.name === tier.name;
                
                return (
                  <div 
                    key={tier.name}
                    className={`flex items-center space-x-4 p-3 rounded-lg transition-all ${
                      isCurrent ? 'bg-white/70 ring-2' : isUnlocked ? 'bg-white/40' : 'bg-gray-100/30'
                    }`}
                    style={isCurrent ? { ringColor: tier.color } : {}}
                  >
                    <div 
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                        isUnlocked ? '' : 'opacity-50'
                      }`}
                      style={{ backgroundColor: tier.color }}
                    >
                      {isUnlocked ? (
                        tier.name.charAt(0)
                      ) : (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-semibold ${isCurrent ? 'text-gray-800' : isUnlocked ? 'text-gray-700' : 'text-gray-500'}`}>
                          {tier.name}
                        </span>
                        <span className="text-sm text-gray-600">
                          {tier.multiplier}x points
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {tier.minPoints === 0 ? 'Starting tier' : `${tier.minPoints}+ points`}
                      </p>
                    </div>
                    {isCurrent && (
                      <div className="text-blue-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="backdrop-blur-lg bg-white/30 border border-white/20 rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'earn' ? 'bg-green-100 text-green-600' :
                    transaction.type === 'redeem' ? 'bg-red-100 text-red-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {transaction.type === 'earn' ? '+' : transaction.type === 'redeem' ? '-' : '★'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{transaction.description}</p>
                    <p className="text-sm text-gray-600">{transaction.date}</p>
                  </div>
                </div>
                <div className={`font-bold ${
                  transaction.points > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.points > 0 ? '+' : ''}{transaction.points} points
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <button className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
              View All Transactions →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;