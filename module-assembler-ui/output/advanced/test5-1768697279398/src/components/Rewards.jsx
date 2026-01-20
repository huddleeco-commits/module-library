import React, { useState } from 'react';
import { Gift, Star, Crown, Zap } from 'lucide-react';

const Rewards = () => {
  const [userPoints, setUserPoints] = useState(850);
  const [redeemedRewards, setRedeemedRewards] = useState([]);

  const rewards = [
    {
      id: 1,
      title: '$5 Off',
      description: 'Get $5 off your next purchase',
      points: 500,
      icon: Gift,
      color: 'bg-green-100 text-green-600',
      available: true
    },
    {
      id: 2,
      title: '$10 Off',
      description: 'Get $10 off your next purchase',
      points: 1000,
      icon: Star,
      color: 'bg-blue-100 text-blue-600',
      available: false
    },
    {
      id: 3,
      title: 'Free Item',
      description: 'Get a free item of your choice',
      points: 750,
      icon: Gift,
      color: 'bg-purple-100 text-purple-600',
      available: true
    },
    {
      id: 4,
      title: 'VIP Access',
      description: 'Exclusive early access to sales',
      points: 1200,
      icon: Crown,
      color: 'bg-yellow-100 text-yellow-600',
      available: false
    }
  ];

  const handleRedeem = (reward) => {
    if (userPoints >= reward.points) {
      setUserPoints(prev => prev - reward.points);
      setRedeemedRewards(prev => [...prev, { ...reward, redeemedAt: new Date() }]);
      alert(`Successfully redeemed: ${reward.title}`);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Rewards</h2>
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Your Points</p>
              <p className="text-3xl font-bold">{userPoints}</p>
            </div>
            <Zap className="h-12 w-12 opacity-80" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {rewards.map((reward) => {
          const Icon = reward.icon;
          const canRedeem = userPoints >= reward.points;
          
          return (
            <div
              key={reward.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className={`w-12 h-12 rounded-lg ${reward.color} flex items-center justify-center mb-4`}>
                <Icon className="h-6 w-6" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{reward.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{reward.description}</p>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-bold text-purple-600">{reward.points} pts</span>
                {reward.available && (
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                    Available
                  </span>
                )}
              </div>
              
              <button
                onClick={() => handleRedeem(reward)}
                disabled={!canRedeem || !reward.available}
                className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                  canRedeem && reward.available
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {!reward.available ? 'Unavailable' : canRedeem ? 'Redeem' : 'Not Enough Points'}
              </button>
            </div>
          );
        })}
      </div>

      {redeemedRewards.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recently Redeemed</h3>
          <div className="space-y-2">
            {redeemedRewards.slice(-3).map((reward, index) => (
              <div key={index} className="bg-green-50 border border-green-200 rounded-md p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-green-800">{reward.title}</span>
                  <span className="text-sm text-green-600">{reward.points} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Rewards;