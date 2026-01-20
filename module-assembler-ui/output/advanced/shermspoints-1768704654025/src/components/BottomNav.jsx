import React from 'react';

const BottomNav = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'rewards', label: 'Rewards', icon: '🎁' },
    { id: 'card', label: 'Card', icon: '💳' },
    { id: 'profile', label: 'Profile', icon: '👤' }
  ];

  return (
    <div className="bottom-nav">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <span className="icon">{tab.icon}</span>
          <span className="label">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default BottomNav;