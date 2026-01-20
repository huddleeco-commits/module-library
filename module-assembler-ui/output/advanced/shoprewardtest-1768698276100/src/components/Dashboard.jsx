import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Gift, CreditCard, Star, ArrowRight } from 'lucide-react';

const Dashboard = ({ user }) => {
  const [pointsCounter, setPointsCounter] = useState(0);
  const [isCountingUp, setIsCountingUp] = useState(false);
  
  const currentPoints = user?.points || 2750;
  const currentTier = user?.tier || 'Silver';
  
  const tiers = {
    Bronze: { next: 'Silver', threshold: 1000, color: 'from-orange-400 to-orange-600' },
    Silver: { next: 'Gold', threshold: 5000, color: 'from-gray-300 to-gray-500' },
    Gold: { next: 'Platinum', threshold: 10000, color: 'from-yellow-400 to-yellow-600' },
    Platinum: { next: null, threshold: null, color: 'from-purple-400 to-purple-600' }
  };
  
  const tierInfo = tiers[currentTier];
  const progressPercentage = tierInfo.next 
    ? Math.min((currentPoints / tierInfo.threshold) * 100, 100)
    : 100;
  const pointsToNext = tierInfo.next 
    ? tierInfo.threshold - currentPoints 
    : 0;

  const recentTransactions = [
    { id: 1, type: 'earned', amount: 150, description: 'Purchase at Store #123', icon: TrendingUp, date: '2 hours ago' },
    { id: 2, type: 'redeemed', amount: -500, description: 'Redeemed $5 Gift Card', icon: TrendingDown, date: '1 day ago' },
    { id: 3, type: 'earned', amount: 75, description: 'Bonus Points Reward', icon: Star, date: '3 days ago' }
  ];

  // Animated counter effect
  useEffect(() => {
    setIsCountingUp(true);
    const duration = 2000;
    const steps = 60;
    const stepValue = currentPoints / steps;
    const stepDuration = duration / steps;
    
    let current = 0;
    const timer = setInterval(() => {
      current += stepValue;
      if (current >= currentPoints) {
        setPointsCounter(currentPoints);
        setIsCountingUp(false);
        clearInterval(timer);
      } else {
        setPointsCounter(Math.floor(current));
      }
    }, stepDuration);
    
    return () => clearInterval(timer);
  }, [currentPoints]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 pb-24">
      {/* Hero Section */}
      <div className="mb-8">
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">
              Hello, {user?.name || 'Member'}! 👋
            </h1>
            <p className="text-white/70">Welcome to ShopRewardTest</p>
          </div>
          
          {/* Points Balance */}
          <div className="text-center mb-8">
            <div className="relative">
              <h2 className={`
                text-6xl font-bold bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2
                ${isCountingUp ? 'animate-pulse' : ''}
              `}>
                {pointsCounter.toLocaleString()}
              </h2>
              <p className="text-xl text-white/80">points</p>
            </div>
          </div>
          
          {/* Tier Badge */}
          <div className="flex justify-center mb-6">
            <div className={`
              px-6 py-3 rounded-2xl bg-gradient-to-r ${tierInfo.color} 
              text-white font-bold text-lg shadow-lg animate-pulse
              ring-4 ring-white/20
            `}>
              {currentTier} Member
            </div>
          </div>
          
          {/* Progress to Next Tier */}
          {tierInfo.next && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/80 text-sm">Progress to {tierInfo.next}</span>
                <span className="text-white/80 text-sm">{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-center text-white/70 text-sm mt-2">
                {pointsToNext.toLocaleString()} more points to {tierInfo.next}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Recent Transactions */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-white mb-4 px-2">Recent Activity</h3>
        <div className="space-y-3">
          {recentTransactions.map((transaction) => {
            const Icon = transaction.icon;
            return (
              <div 
                key={transaction.id}
                className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-4 hover:bg-white/15 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`
                      p-2 rounded-full 
                      ${transaction.type === 'earned' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                      }
                    `}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="text-white font-medium">{transaction.description}</p>
                      <p className="text-white/60 text-sm">{transaction.date}</p>
                    </div>
                  </div>
                  <div className={`
                    font-bold text-lg
                    ${transaction.type === 'earned' 
                      ? 'text-green-400' 
                      : 'text-red-400'
                    }
                  `}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-white mb-4 px-2">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4">
          <button className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6 hover:bg-white/15 hover:scale-105 transition-all duration-300 group">
            <div className="flex flex-col items-center space-y-3">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 group-hover:shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
                <Gift className="text-white" size={24} />
              </div>
              <span className="text-white font-semibold">View Rewards</span>
              <ArrowRight className="text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" size={16} />
            </div>
          </button>
          
          <button className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6 hover:bg-white/15 hover:scale-105 transition-all duration-300 group">
            <div className="flex flex-col items-center space-y-3">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 group-hover:shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                <CreditCard className="text-white" size={24} />
              </div>
              <span className="text-white font-semibold">My Card</span>
              <ArrowRight className="text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" size={16} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;