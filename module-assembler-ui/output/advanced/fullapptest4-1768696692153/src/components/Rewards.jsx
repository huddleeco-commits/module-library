import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { CheckCircleIcon, GiftIcon, TagIcon, SparklesIcon } from '@heroicons/react/24/outline';

const Rewards = () => {
  const { user, updateUser } = useUser();
  const [redeemedReward, setRedeemedReward] = useState(null);
  const [animatingReward, setAnimatingReward] = useState(null);

  const rewards = [
    { id: 1, name: "$5 Off", cost: 100, type: "discount" },
    { id: 2, name: "$10 Off", cost: 200, type: "discount" },
    { id: 3, name: "Free Item", cost: 500, type: "freebie" },
    { id: 4, name: "VIP Access", cost: 1000, type: "exclusive" }
  ];

  const getRewardIcon = (type) => {
    switch (type) {
      case 'discount': return <TagIcon className="w-8 h-8" />;
      case 'freebie': return <GiftIcon className="w-8 h-8" />;
      case 'exclusive': return <SparklesIcon className="w-8 h-8" />;
      default: return <GiftIcon className="w-8 h-8" />;
    }
  };

  const getRewardColor = (type) => {
    switch (type) {
      case 'discount': return 'from-green-400 to-blue-500';
      case 'freebie': return 'from-purple-400 to-pink-500';
      case 'exclusive': return 'from-yellow-400 to-orange-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const handleRedeem = async (reward) => {
    if (user.points < reward.cost) return;
    
    setAnimatingReward(reward.id);
    
    setTimeout(() => {
      updateUser({
        ...user,
        points: user.points - reward.cost,
        history: [
          ...user.history,
          {
            id: Date.now(),
            type: 'spent',
            points: reward.cost,
            description: `Redeemed: ${reward.name}`,
            date: new Date().toISOString().split('T')[0]
          }
        ]
      });
      
      setRedeemedReward(reward.id);
      setAnimatingReward(null);
      
      setTimeout(() => {
        setRedeemedReward(null);
      }, 3000);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Redeem Rewards</h2>
        <p className="text-purple-200">Use your {user.points} points to unlock exclusive rewards</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {rewards.map((reward) => {
          const canRedeem = user.points >= reward.cost;
          const isAnimating = animatingReward === reward.id;
          const isRedeemed = redeemedReward === reward.id;
          
          return (
            <div
              key={reward.id}
              className={`relative overflow-hidden backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 transition-all duration-500 ${
                isAnimating ? 'scale-105 shadow-2xl' : 'hover:scale-105 hover:shadow-xl'
              } ${!canRedeem ? 'opacity-60' : ''}`}
            >
              {isRedeemed && (
                <div className="absolute inset-0 bg-green-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center animate-pulse">
                  <div className="text-center">
                    <CheckCircleIcon className="w-16 h-16 text-green-400 mx-auto mb-2" />
                    <p className="text-green-300 font-semibold">Redeemed!</p>
                  </div>
                </div>
              )}
              
              <div className={`bg-gradient-to-r ${getRewardColor(reward.type)} rounded-xl p-4 mb-4 text-white flex items-center justify-center`}>
                {getRewardIcon(reward.type)}
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">{reward.name}</h3>
              <p className="text-purple-200 mb-4 capitalize">{reward.type} Reward</p>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-yellow-400 font-bold text-lg">{reward.cost} points</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  canRedeem ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {canRedeem ? 'Available' : 'Insufficient Points'}
                </span>
              </div>
              
              <button
                onClick={() => handleRedeem(reward)}
                disabled={!canRedeem || isAnimating || isRedeemed}
                className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                  canRedeem && !isAnimating && !isRedeemed
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                } ${isAnimating ? 'animate-pulse' : ''}`}
              >
                {isAnimating ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Redeeming...
                  </div>
                ) : isRedeemed ? (
                  'Redeemed'
                ) : (
                  'Redeem Now'
                )}
              </button>
              
              {isAnimating && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
                        style={{
                          animationDelay: `${i * 0.2}s`,
                          transform: `rotate(${i * 45}deg) translateY(-30px)`
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Rewards;