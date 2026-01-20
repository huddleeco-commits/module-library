import React, { useState, useEffect } from 'react';
import './Rewards.css';

const Rewards = () => {
  const [rewards, setRewards] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [userBalance, setUserBalance] = useState(0);

  useEffect(() => {
    fetchRewards();
    fetchUserBalance();
  }, []);

  const fetchRewards = async () => {
    try {
      const response = await fetch('/api/rewards');
      const data = await response.json();
      setRewards(data);
    } catch (error) {
      console.error('Error fetching rewards:', error);
    }
  };

  const fetchUserBalance = async () => {
    try {
      const response = await fetch('/api/user/balance');
      const data = await response.json();
      setUserBalance(data.balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const handleRedeemClick = (reward) => {
    setSelectedReward(reward);
    setShowModal(true);
  };

  const confirmRedeem = async () => {
    try {
      const response = await fetch('/api/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardId: selectedReward.id })
      });
      
      if (response.ok) {
        setUserBalance(userBalance - selectedReward.cost);
        setShowModal(false);
        setSelectedReward(null);
      }
    } catch (error) {
      console.error('Error redeeming reward:', error);
    }
  };

  return (
    <div className="rewards-container">
      <h2>Available Rewards</h2>
      <div className="balance-display">
        <span>Your Balance: {userBalance} ShermCoins</span>
      </div>
      
      <div className="rewards-grid">
        {rewards.map(reward => (
          <div key={reward.id} className="reward-card">
            <img src={reward.image} alt={reward.name} />
            <h3>{reward.name}</h3>
            <p className="reward-description">{reward.description}</p>
            <div className="reward-cost">{reward.cost} ShermCoins</div>
            <button 
              className={`redeem-btn ${userBalance < reward.cost ? 'disabled' : ''}`}
              onClick={() => handleRedeemClick(reward)}
              disabled={userBalance < reward.cost}
            >
              {userBalance < reward.cost ? 'Insufficient Funds' : 'Redeem'}
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Redemption</h3>
            <p>Redeem {selectedReward.name} for {selectedReward.cost} ShermCoins?</p>
            <div className="modal-actions">
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button onClick={confirmRedeem} className="confirm-btn">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rewards;