import React, { useState, useEffect } from 'react';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(user.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareReferral = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join with my referral code',
        text: `Use my referral code: ${user.referralCode}`,
        url: `${window.location.origin}?ref=${user.referralCode}`
      });
    }
  };

  if (!user) return <div className="loading">Loading...</div>;

  const getTierColor = (tier) => {
    switch(tier) {
      case 'Bronze': return '#CD7F32';
      case 'Silver': return '#C0C0C0';
      case 'Gold': return '#FFD700';
      case 'Platinum': return '#E5E4E2';
      default: return '#666';
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="avatar">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="user-info">
          <h2>{user.name}</h2>
          <p className="email">{user.email}</p>
        </div>
      </div>

      <div className="tier-section">
        <div 
          className="tier-badge" 
          style={{ backgroundColor: getTierColor(user.tier) }}
        >
          <span className="tier-name">{user.tier}</span>
          <span className="tier-label">TIER</span>
        </div>
      </div>

      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-value">{user.lifetimeShermCoin.toLocaleString()}</div>
          <div className="stat-label">Lifetime ShermCoin</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{user.currentShermCoin.toLocaleString()}</div>
          <div className="stat-label">Current ShermCoin</div>
        </div>
      </div>

      <div className="referral-section">
        <h3>Referral Code</h3>
        <div className="referral-code-container">
          <div className="referral-code">{user.referralCode}</div>
          <div className="referral-actions">
            <button 
              onClick={copyReferralCode}
              className={`copy-btn ${copied ? 'copied' : ''}`}
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
            <button onClick={shareReferral} className="share-btn">
              Share
            </button>
          </div>
        </div>
        <p className="referral-info">
          Share your code and earn 100 ShermCoin for each friend who joins!
        </p>
      </div>

      <style jsx>{`
        .profile-container {
          max-width: 400px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        
        .profile-header {
          display: flex;
          align-items: center;
          margin-bottom: 30px;
        }
        
        .avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          font-weight: bold;
          margin-right: 15px;
        }
        
        .user-info h2 {
          margin: 0 0 5px 0;
          font-size: 24px;
          color: #333;
        }
        
        .email {
          margin: 0;
          color: #666;
          font-size: 14px;
        }
        
        .tier-section {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .tier-badge {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          padding: 15px 30px;
          border-radius: 12px;
          color: white;
          font-weight: bold;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
        }
        
        .tier-name {
          font-size: 20px;
          margin-bottom: 2px;
        }
        
        .tier-label {
          font-size: 12px;
          opacity: 0.9;
        }
        
        .stats-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 30px;
        }
        
        .stat-card {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
        }
        
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #333;
          margin-bottom: 5px;
        }
        
        .stat-label {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
        }
        
        .referral-section h3 {
          margin: 0 0 15px 0;
          color: #333;
        }
        
        .referral-code-container {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 10px;
        }
        
        .referral-code {
          font-size: 18px;
          font-weight: bold;
          color: #333;
          text-align: center;
          margin-bottom: 15px;
          letter-spacing: 2px;
        }
        
        .referral-actions {
          display: flex;
          gap: 10px;
        }
        
        .copy-btn, .share-btn {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 6px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .copy-btn {
          background: #007bff;
          color: white;
        }
        
        .copy-btn.copied {
          background: #28a745;
        }
        
        .share-btn {
          background: #6c757d;
          color: white;
        }
        
        .copy-btn:hover, .share-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        
        .referral-info {
          font-size: 12px;
          color: #666;
          text-align: center;
          margin: 0;
        }
        
        .loading {
          text-align: center;
          padding: 40px;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default Profile;