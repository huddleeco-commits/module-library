import React, { useState, useEffect } from 'react';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Failed to load profile');
      }
    };
    fetchProfile();
  }, []);

  const handleCopyReferral = async () => {
    if (user?.referralCode) {
      await navigator.clipboard.writeText(user.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getTierBadge = (tier) => {
    const badges = {
      bronze: { color: '#cd7f32', icon: '🥉' },
      silver: { color: '#c0c0c0', icon: '🥈' },
      gold: { color: '#ffd700', icon: '🥇' },
      platinum: { color: '#e5e4e2', icon: '💎' }
    };
    return badges[tier] || badges.bronze;
  };

  if (!user) return <div className="loading">Loading...</div>;

  const badge = getTierBadge(user.tier);

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
        <h1>{user.name}</h1>
        <p className="email">{user.email}</p>
      </div>

      <div className="tier-section">
        <div className="tier-badge" style={{ backgroundColor: badge.color }}>
          <span className="tier-icon">{badge.icon}</span>
          <span className="tier-name">{user.tier.toUpperCase()}</span>
        </div>
      </div>

      <div className="stats-section">
        <div className="stat-card">
          <h3>Lifetime ShermCoin</h3>
          <div className="coin-amount">{user.lifetimeCoins.toLocaleString()}</div>
        </div>
      </div>

      <div className="referral-section">
        <h3>Referral Code</h3>
        <div className="referral-card">
          <div className="referral-code">{user.referralCode}</div>
          <button 
            className={`copy-btn ${copied ? 'copied' : ''}`}
            onClick={handleCopyReferral}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <p className="referral-info">Share your code and earn 100 ShermCoin for each friend who joins!</p>
      </div>
    </div>
  );
};

export default Profile;