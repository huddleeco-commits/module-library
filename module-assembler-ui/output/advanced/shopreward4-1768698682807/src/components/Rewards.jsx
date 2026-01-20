import React, { useState } from 'react';
import { CheckIcon, SparklesIcon, GiftIcon, StarIcon } from '@heroicons/react/24/outline';

const Rewards = ({ userPoints = 150, onRedeemReward }) => {
  const [selectedReward, setSelectedReward] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const rewards = [
    {
      id: 1,
      name: '$5 Off',
      points: 100,
      type: 'discount',
      description: 'Get $5 off your next purchase',
      icon: SparklesIcon
    },
    {
      id: 2,
      name: '$10 Off',
      points: 200,
      type: 'discount',
      description: 'Get $10 off your next purchase',
      icon: SparklesIcon
    },
    {
      id: 3,
      name: 'Free Item',
      points: 500,
      type: 'gift',
      description: 'Choose any item for free',
      icon: GiftIcon
    },
    {
      id: 4,
      name: 'VIP Access',
      points: 1000,
      type: 'premium',
      description: 'Unlock exclusive VIP benefits',
      icon: StarIcon
    }
  ];

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'discount': return 'bg-blue-500/20 text-blue-400 border-blue-400/30';
      case 'gift': return 'bg-green-500/20 text-green-400 border-green-400/30';
      case 'premium': return 'bg-purple-500/20 text-purple-400 border-purple-400/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
    }
  };

  const handleRedeemClick = (reward) => {
    setSelectedReward(reward);
    setShowConfirmModal(true);
  };

  const confirmRedeem = () => {
    if (selectedReward && userPoints >= selectedReward.points) {
      onRedeemReward?.(selectedReward);
      setShowConfirmModal(false);
      setShowConfetti(true);
      
      // Hide confetti after 3 seconds
      setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
    }
  };

  const cancelRedeem = () => {
    setShowConfirmModal(false);
    setSelectedReward(null);
  };

  return (
    <div className="relative">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="animate-pulse text-6xl">🎉</div>
          <div className="absolute animate-bounce" style={{ animationDelay: '0.2s' }}>🎊</div>
          <div className="absolute animate-ping" style={{ animationDelay: '0.4s' }}>✨</div>
        </div>
      )}

      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Rewards</h2>
          <p className="text-gray-600">You have <span className="font-semibold text-blue-600">{userPoints} points</span></p>
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {rewards.map((reward) => {
            const IconComponent = reward.icon;
            const canAfford = userPoints >= reward.points;
            
            return (
              <div
                key={reward.id}
                className={`relative backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                  canAfford ? 'hover:bg-white/20' : 'opacity-60'
                }`}
              >
                {/* Type Badge */}
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border mb-4 ${getTypeBadgeColor(reward.type)}`}>
                  {reward.type.charAt(0).toUpperCase() + reward.type.slice(1)}
                </div>

                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-white/10 rounded-full">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{reward.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{reward.description}</p>
                  <div className="text-xl font-bold text-blue-600">{reward.points} points</div>
                </div>

                {/* Redeem Button */}
                <button
                  onClick={() => handleRedeemClick(reward)}
                  disabled={!canAfford}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                    canAfford
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {canAfford ? 'Redeem' : 'Insufficient Points'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedReward && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <selectedReward.icon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Confirm Redemption</h3>
              <p className="text-gray-600">
                Redeem <span className="font-semibold">{selectedReward.name}</span> for{' '}
                <span className="font-semibold text-blue-600">{selectedReward.points} points</span>?
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={cancelRedeem}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRedeem}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rewards;