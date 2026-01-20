import React from 'react';

const BottomNav = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'rewards', label: 'Rewards', icon: '🎁' },
    { id: 'card', label: 'Card', icon: '💳' },
    { id: 'profile', label: 'Profile', icon: '👤' }
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <span className="nav-icon">{tab.icon}</span>
          <span className="nav-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;