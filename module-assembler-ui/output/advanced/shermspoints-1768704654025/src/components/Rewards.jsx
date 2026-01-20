import React, { useState } from 'react';

const Rewards = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);

  const rewards = [
    { id: 1, name: 'Free Coffee', cost: 100, description: 'Any size coffee' },
    { id: 2, name: 'Pizza Slice', cost: 250, description: 'One slice of pizza' },
    { id: 3, name: '10% Discount', cost: 150, description: 'Next purchase' },
    { id: 4, name: 'Free Dessert', cost: 200, description: 'Any dessert item' },
    { id: 5, name: 'Lunch Combo', cost: 400, description: 'Sandwich + drink' },
    { id: 6, name: 'VIP Access', cost: 500, description: '1 month premium' }
  ];

  const handleRedeem = (reward) => {
    setSelectedReward(reward);
    setShowModal(true);
  };

  const confirmRedeem = () => {
    console.log('Redeeming:', selectedReward.name);
    setShowModal(false);
    setSelectedReward(null);
  };

  return (
    <div className="rewards">
      <h2>Available Rewards</h2>
      <div className="rewards-grid">
        {rewards.map(reward => (
          <div key={reward.id} className="reward-card">
            <h3>{reward.name}</h3>
            <p className="reward-description">{reward.description}</p>
            <div className="reward-cost">{reward.cost} ShermCoins</div>
            <button onClick={() => handleRedeem(reward)} className="redeem-btn">
              Redeem
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Redemption</h3>
            <p>Redeem {selectedReward?.name} for {selectedReward?.cost} ShermCoins?</p>
            <div className="modal-buttons">
              <button onClick={confirmRedeem} className="confirm-btn">Confirm</button>
              <button onClick={() => setShowModal(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rewards;