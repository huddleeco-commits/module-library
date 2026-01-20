import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Gift, CreditCard, Star } from 'lucide-react';

const Dashboard = ({ user }) => {
  const [animatedPoints, setAnimatedPoints] = useState(0);
  const currentPoints = user?.points || 2450;
  const tier = user?.tier || 'Gold';
  const memberSince = user?.memberSince || '2023';
  
  const tierColors = {
    Bronze: 'from-amber-600 to-amber-800',
    Silver: 'from-gray-400 to-gray-600', 
    Gold: 'from-yellow-400 to-yellow-600',
    Platinum: 'from-purple-400 to-purple-600'
  };

  const tierRequirements = {
    Bronze: { min: 0, max: 1000 },
    Silver: { min: 1000, max: 2500 },
    Gold: { min: 2500, max: 5000 },
    Platinum: { min: 5000, max: Infinity }
  };

  const nextTier = {
    Bronze: 'Silver',
    Silver: 'Gold', 
    Gold: 'Platinum',
    Platinum: null
  };

  const pointsToNextTier = nextTier[tier] ? tierRequirements[nextTier[tier]].min - currentPoints : 0;
  const progressPercentage = nextTier[tier] 
    ? ((currentPoints - tierRequirements[tier].min) / (tierRequirements[nextTier[tier]].min - tierRequirements[tier].min)) * 100
    : 100;

  const recentTransactions = [
    { id: 1, type: 'earned', amount: 50, description: 'Purchase at Store A', icon: TrendingUp },
    { id: 2, type: 'redeemed', amount: -100, description: 'Coffee Reward', icon: Gift },
    { id: 3, type: 'earned', amount: 25, description: 'Friend Referral', icon: TrendingUp }
  ];

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = currentPoints / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= currentPoints) {
        setAnimatedPoints(currentPoints);
        clearInterval(timer);
      } else {
        setAnimatedPoints(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [currentPoints]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 p-4 pb-24">
      {/* Hero Section */}
      <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl mb-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Welcome back, {user?.name || 'Member'}!</h1>
          <p className="text-white/70">Member since {memberSince}</p>
        </div>
        
        <div className="text-center mb-6">
          <div className="text-6xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-orange-300 bg-clip-text text-transparent mb-2">
            {animatedPoints.toLocaleString()}
          </div>
          <p className="text-white/80 text-lg">Total Points</p>
        </div>

        <div className="flex justify-center mb-6">
          <div className={`inline-flex items-center px-4 py-2 bg-gradient-to-r ${tierColors[tier]} text-white font-semibold rounded-full animate-pulse`}>
            <Star className="w-5 h-5 mr-2" />
            {tier} Member
          </div>
        </div>

        {nextTier[tier] && (
          <div className="space-y-3">
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
            <p className="text-center text-white/80">
              {pointsToNextTier > 0 ? (
                <span>{pointsToNextTier} more points to reach <strong>{nextTier[tier]}</strong></span>
              ) : (
                <span>Congratulations! You've reached the highest tier!</span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 border border-white/20 shadow-2xl mb-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2" />
          Recent Activity
        </h2>
        <div className="space-y-3">
          {recentTransactions.map((transaction) => {
            const Icon = transaction.icon;
            return (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors duration-200">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${
                    transaction.type === 'earned' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    <Icon size={16} />
                  </div>
                  <div className="ml-3">
                    <p className="text-white font-medium">{transaction.description}</p>
                  </div>
                </div>
                <div className={`font-bold ${
                  transaction.type === 'earned' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 shadow-2xl hover:scale-[1.02] hover:bg-white/15 transition-all duration-200 group">
          <div className="flex flex-col items-center text-center">
            <div className="p-3 bg-purple-500/20 rounded-xl mb-3 group-hover:scale-110 transition-transform duration-200">
              <Gift className="w-8 h-8 text-purple-300" />
            </div>
            <h3 className="font-semibold text-white mb-1">View Rewards</h3>
            <p className="text-white/70 text-sm">Browse available rewards</p>
          </div>
        </button>
        
        <button className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 shadow-2xl hover:scale-[1.02] hover:bg-white/15 transition-all duration-200 group">
          <div className="flex flex-col items-center text-center">
            <div className="p-3 bg-blue-500/20 rounded-xl mb-3 group-hover:scale-110 transition-transform duration-200">
              <CreditCard className="w-8 h-8 text-blue-300" />
            </div>
            <h3 className="font-semibold text-white mb-1">My Card</h3>
            <p className="text-white/70 text-sm">Show your member card</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;