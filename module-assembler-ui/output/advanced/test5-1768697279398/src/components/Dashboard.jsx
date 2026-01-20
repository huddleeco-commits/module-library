import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  // Mock data - in real app this would come from API
  const loyaltyData = {
    points: user?.points || 1250,
    tier: user?.tier || 'Silver',
    nextTier: getNextTier(user?.tier || 'Silver'),
    pointsToNextTier: getPointsToNextTier(user?.points || 1250, user?.tier || 'Silver')
  };

  function getNextTier(currentTier) {
    const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum'];
    const currentIndex = tiers.indexOf(currentTier);
    return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
  }

  function getPointsToNextTier(points, tier) {
    const thresholds = { Bronze: 0, Silver: 1000, Gold: 2500, Platinum: 5000 };
    const nextTier = getNextTier(tier);
    return nextTier ? thresholds[nextTier] - points : 0;
  }

  function getTierColor(tier) {
    const colors = {
      Bronze: 'bg-amber-600',
      Silver: 'bg-gray-400',
      Gold: 'bg-yellow-500',
      Platinum: 'bg-purple-600'
    };
    return colors[tier] || 'bg-gray-400';
  }

  function getTierProgress(points, tier) {
    const thresholds = { Bronze: 0, Silver: 1000, Gold: 2500, Platinum: 5000 };
    const nextTier = getNextTier(tier);
    if (!nextTier) return 100;
    
    const currentThreshold = thresholds[tier];
    const nextThreshold = thresholds[nextTier];
    return ((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  }

  const progress = getTierProgress(loyaltyData.points, loyaltyData.tier);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="mt-2 text-gray-600">Here's your test5 Loyalty status</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Points Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Points</p>
                <p className="text-2xl font-bold text-gray-900">{loyaltyData.points.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Tier Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${getTierColor(loyaltyData.tier)}`}>
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Current Tier</p>
                <p className="text-2xl font-bold text-gray-900">{loyaltyData.tier}</p>
              </div>
            </div>
          </div>

          {/* Next Tier Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Points to {loyaltyData.nextTier || 'Max Tier'}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loyaltyData.nextTier ? loyaltyData.pointsToNextTier.toLocaleString() : 'Achieved!'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Tier Progress</h2>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{loyaltyData.tier}</span>
              <span>{loyaltyData.nextTier || 'Max Tier Reached'}</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${getTierColor(loyaltyData.nextTier || loyaltyData.tier)}`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>{loyaltyData.points} points</span>
              <span>{progress.toFixed(1)}% complete</span>
            </div>
          </div>

          {loyaltyData.nextTier && (
            <p className="text-sm text-gray-600">
              Earn {loyaltyData.pointsToNextTier} more points to reach {loyaltyData.nextTier} tier!
            </p>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">Purchase Reward</p>
                <p className="text-sm text-gray-500">Order #12345 - test5 Store</p>
              </div>
              <span className="text-green-600 font-medium">+150 points</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">Welcome Bonus</p>
                <p className="text-sm text-gray-500">Account registration</p>
              </div>
              <span className="text-green-600 font-medium">+500 points</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">Tier Upgrade Bonus</p>
                <p className="text-sm text-gray-500">Reached Silver tier</p>
              </div>
              <span className="text-green-600 font-medium">+200 points</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;