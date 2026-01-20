import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const Rewards = ({ userPoints = 150, onRedeem }) => {
  const [selectedReward, setSelectedReward] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);

  const rewards = [
    { id: 1, name: '$5 Off', points: 100, type: 'discount', icon: '💰', color: 'bg-green-500' },
    { id: 2, name: '$10 Off', points: 200, type: 'discount', icon: '💸', color: 'bg-blue-500' },
    { id: 3, name: 'Free Item', points: 500, type: 'freebie', icon: '🎁', color: 'bg-purple-500' },
    { id: 4, name: 'VIP Access', points: 1000, type: 'premium', icon: '👑', color: 'bg-yellow-500' }
  ];

  const handleRedeemClick = (reward) => {
    setSelectedReward(reward);
    setShowModal(true);
  };

  const handleConfirmRedeem = async () => {
    setIsRedeeming(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    onRedeem?.(selectedReward);
    setIsRedeeming(false);
    setShowModal(false);
    setSelectedReward(null);
  };

  const getTypeBadge = (type) => {
    const badges = {
      discount: { text: 'Discount', color: 'bg-green-100 text-green-800' },
      freebie: { text: 'Free Item', color: 'bg-purple-100 text-purple-800' },
      premium: { text: 'Premium', color: 'bg-yellow-100 text-yellow-800' }
    };
    return badges[type] || badges.discount;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Rewards</h2>
        <div className="flex items-center gap-2">
          <span className="text-lg text-gray-600">Your Points:</span>
          <span className="text-2xl font-bold text-blue-600">{userPoints}</span>
          <span className="text-lg text-gray-500">points</span>
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {rewards.map((reward) => {
          const canRedeem = userPoints >= reward.points;
          const badge = getTypeBadge(reward.type);
          
          return (
            <motion.div
              key={reward.id}
              whileHover={{ y: -4 }}
              className={`relative overflow-hidden rounded-2xl p-6 backdrop-blur-lg bg-white/30 border border-white/20 shadow-xl transition-all duration-300 ${
                canRedeem ? 'hover:shadow-2xl' : 'opacity-60'
              }`}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 ${reward.color} opacity-10`} />
              
              {/* Content */}
              <div className="relative z-10">
                {/* Icon */}
                <div className="text-4xl mb-4">{reward.icon}</div>
                
                {/* Badge */}
                <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium mb-3 ${badge.color}`}>
                  {badge.text}
                </div>
                
                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">{reward.name}</h3>
                
                {/* Points */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl font-bold text-gray-800">{reward.points}</span>
                  <span className="text-sm text-gray-600">points</span>
                </div>
                
                {/* Redeem Button */}
                <button
                  onClick={() => handleRedeemClick(reward)}
                  disabled={!canRedeem}
                  className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                    canRedeem
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {canRedeem ? 'Redeem' : 'Insufficient Points'}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showModal && selectedReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full border border-white/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">{selectedReward.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Redeem {selectedReward.name}?</h3>
                <p className="text-gray-600 mb-6">
                  This will cost <span className="font-bold">{selectedReward.points} points</span>
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    disabled={isRedeeming}
                    className="flex-1 py-3 px-4 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmRedeem}
                    disabled={isRedeeming}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold transition-all duration-200 disabled:opacity-50"
                  >
                    {isRedeeming ? 'Redeeming...' : 'Confirm'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Rewards;