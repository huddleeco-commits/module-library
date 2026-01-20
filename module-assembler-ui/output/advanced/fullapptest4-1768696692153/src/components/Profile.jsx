import React from 'react';
import { useUser } from '../context/UserContext';
import { CalendarDaysIcon, TrophyIcon, StarIcon, SparklesIcon } from '@heroicons/react/24/outline';

const Profile = () => {
  const { user } = useUser();

  const tiers = [
    { name: "Bronze", minPoints: 0, multiplier: 1, color: "#CD7F32" },
    { name: "Silver", minPoints: 500, multiplier: 1.25, color: "#C0C0C0" },
    { name: "Gold", minPoints: 2000, multiplier: 1.5, color: "#FFD700" },
    { name: "Platinum", minPoints: 5000, multiplier: 2, color: "#E5E4E2" }
  ];

  const getCurrentTier = () => {
    const lifetimePoints = user.history.filter(t => t.type === 'earned').reduce((sum, t) => sum + t.points, 0);
    for (let i = tiers.length - 1; i >= 0; i--) {
      if (lifetimePoints >= tiers[i].minPoints) {
        return tiers[i];
      }
    }
    return tiers[0];
  };

  const getNextTier = () => {
    const currentTier = getCurrentTier();
    const currentIndex = tiers.findIndex(t => t.name === currentTier.name);
    return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
  };

  const getProgressToNextTier = () => {
    const currentTier = getCurrentTier();
    const nextTier = getNextTier();
    const lifetimePoints = user.history.filter(t => t.type === 'earned').reduce((sum, t) => sum + t.points, 0);
    
    if (!nextTier) return 100;
    
    const pointsInCurrentTier = lifetimePoints - currentTier.minPoints;
    const pointsNeededForNextTier = nextTier.minPoints - currentTier.minPoints;
    
    return Math.min(100, (pointsInCurrentTier / pointsNeededForNextTier) * 100);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const currentTier = getCurrentTier();
  const nextTier = getNextTier();
  const progress = getProgressToNextTier();
  const lifetimePoints = user.history.filter(t => t.type === 'earned').reduce((sum, t) => sum + t.points, 0);
  const totalSpent = user.history.filter(t => t.type === 'spent').reduce((sum, t) => sum + t.points, 0);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">My Profile</h2>
        <p className="text-purple-200">Manage your fullapptest4 loyalty account</p>
      </div>

      {/* User Info Card */}
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold text-white mb-2">{user.name}</h3>
            <p className="text-purple-200 mb-1">{user.email}</p>
            <div className="flex items-center justify-center md:justify-start gap-2 text-purple-300">
              <CalendarDaysIcon className="w-5 h-5" />
              <span>Member since {formatDate(user.memberSince)}</span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400">{user.points}</div>
            <div className="text-purple-200 text-sm">Current Points</div>
          </div>
        </div>
      </div>

      {/* Tier Status Card */}
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-8">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-white mb-4">Tier Status</h3>
          
          {/* Current Tier Badge */}
          <div 
            className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl text-black font-bold text-lg mb-6"
            style={{ backgroundColor: currentTier.color }}
          >
            <TrophyIcon className="w-6 h-6" />
            {currentTier.name} Member
            <span className="text-sm opacity-80">({currentTier.multiplier}x points)</span>
          </div>
        </div>

        {nextTier ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-purple-200">Progress to {nextTier.name}</span>
              <span className="text-white font-medium">
                {lifetimePoints} / {nextTier.minPoints} points
              </span>
            </div>
            
            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <p className="text-center text-purple-200 text-sm">
              {nextTier.minPoints - lifetimePoints} more points to reach {nextTier.name}
            </p>
          </div>
        ) : (
          <div className="text-center">
            <SparklesIcon className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
            <p className="text-purple-200">You've reached the highest tier! 🎉</p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 text-center">
          <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
            <StarIcon className="w-6 h-6 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-green-400 mb-1">{lifetimePoints}</div>
          <div className="text-purple-200 text-sm">Lifetime Points Earned</div>
        </div>
        
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 text-center">
          <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
            <TrophyIcon className="w-6 h-6 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-red-400 mb-1">{totalSpent}</div>
          <div className="text-purple-200 text-sm">Total Points Spent</div>
        </div>
        
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 text-center">
          <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
            <SparklesIcon className="w-6 h-6 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400 mb-1">{user.history.length}</div>
          <div className="text-purple-200 text-sm">Total Transactions</div>
        </div>
      </div>

      {/* Tier Benefits */}
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white mb-6 text-center">Tier Benefits</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiers.map((tier, index) => {
            const isCurrentTier = tier.name === currentTier.name;
            const isUnlocked = lifetimePoints >= tier.minPoints;
            
            return (
              <div
                key={tier.name}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  isCurrentTier 
                    ? 'border-white/40 bg-white/10 shadow-lg' 
                    : isUnlocked
                    ? 'border-white/20 bg-white/5'
                    : 'border-white/10 bg-white/5 opacity-60'
                }`}
              >
                <div 
                  className="w-8 h-8 rounded-full mb-3 flex items-center justify-center"
                  style={{ backgroundColor: tier.color }}
                >
                  {isCurrentTier ? (
                    <StarIcon className="w-5 h-5 text-black" />
                  ) : (
                    <TrophyIcon className="w-5 h-5 text-black" />
                  )}
                </div>
                
                <h4 className="font-bold text-white mb-1">{tier.name}</h4>
                <p className="text-purple-200 text-sm mb-2">{tier.minPoints}+ points</p>
                <p className="text-yellow-400 text-sm font-medium">
                  {tier.multiplier}x points multiplier
                </p>
                
                {isCurrentTier && (
                  <div className="mt-2">
                    <span className="inline-block px-2 py-1 bg-white/20 rounded-full text-xs text-white font-medium">
                      Current Tier
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Profile;