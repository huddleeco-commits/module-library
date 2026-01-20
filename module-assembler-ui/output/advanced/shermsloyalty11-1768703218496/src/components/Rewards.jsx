import React, { useState } from 'react';
import './Rewards.css';

function Rewards() {
  const [showModal, setShowModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);

  const rewards = [
    { id: 1, title: '10% Off Purchase', cost: 100, description: 'Get 10% off your next order' },
    { id: 2, title: 'Free Coffee', cost: 150, description: 'Complimentary coffee of your choice' },
    { id: 3, title: 'Free Dessert', cost: 200, description: 'Any dessert from our menu' },
    { id: 4, title: '20% Off Purchase', cost: 300, description: 'Get 20% off your next order' },
    { id: 5, title: 'Free Meal', cost: 500, description: 'Complimentary main course' },
    { id: 6, title: '$25 Gift Card', cost: 800, description: '$25 credit for future purchases' }
  ];

  const handleRedeem = (reward) => {
    setSelectedReward(reward);
    setShowModal(true);
  };

  const confirmRedeem = () => {
    console.log('Redeeming:', selectedReward);
    setShowModal(false);
    setSelectedReward(null);
  };

  return (
    <div className="rewards-container">
      <h2>Available Rewards</h2>
      <div className="rewards-grid">
        {rewards.map(reward => (
          <div key={reward.id} className="reward-card">
            <h3>{reward.title}</h3>
            <p>{reward.description}</p>
            <div className="reward-cost">{reward.cost} ShermCoins</div>
            <button 
              className="redeem-btn"
              onClick={() => handleRedeem(reward)}
            >
              Redeem
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Redemption</h3>
            <p>Redeem {selectedReward.title} for {selectedReward.cost} ShermCoins?</p>
            <div className="modal-buttons">
              <button onClick={confirmRedeem} className="confirm-btn">Confirm</button>
              <button onClick={() => setShowModal(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Rewards;