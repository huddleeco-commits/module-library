import React, { useState, useEffect } from 'react';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    tier: 'Gold',
    lifetimeShermCoin: 2450,
    referralCode: 'JOHN2024'
  });
  const [copySuccess, setCopySuccess] = useState('');

  const getTierColor = (tier) => {
    switch(tier.toLowerCase()) {
      case 'bronze': return '#CD7F32';
      case 'silver': return '#C0C0C0';
      case 'gold': return '#FFD700';
      case 'platinum': return '#E5E4E2';
      default: return '#6B7280';
    }
  };

  const copyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(user.referralCode);
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      setCopySuccess('Failed to copy');
    }
  };

  const shareReferralCode = () => {
    const shareData = {
      title: 'Join ShermCoin Loyalty',
      text: `Use my referral code: ${user.referralCode}`,
      url: window.location.origin
    };
    
    if (navigator.share) {
      navigator.share(shareData);
    } else {
      copyReferralCode();
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {user.name.split(' ').map(n => n[0]).join('')}
        </div>
        <h1>{user.name}</h1>
        <p className="email">{user.email}</p>
      </div>

      <div className="tier-section">
        <div 
          className="tier-badge"
          style={{ backgroundColor: getTierColor(user.tier) }}
        >
          {user.tier} Member
        </div>
      </div>

      <div className="coins-section">
        <h2>Lifetime ShermCoin</h2>
        <div className="coin-amount">
          {user.lifetimeShermCoin.toLocaleString()}
        </div>
      </div>

      <div className="referral-section">
        <h2>Referral Code</h2>
        <div className="referral-code-container">
          <span className="referral-code">{user.referralCode}</span>
          <div className="referral-actions">
            <button onClick={copyReferralCode} className="copy-btn">
              {copySuccess || 'Copy'}
            </button>
            <button onClick={shareReferralCode} className="share-btn">
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;