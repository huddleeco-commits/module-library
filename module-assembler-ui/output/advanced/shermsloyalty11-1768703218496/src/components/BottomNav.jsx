import React from 'react';

const BottomNav = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'rewards', label: 'Rewards', icon: '🎁' },
    { id: 'card', label: 'Card', icon: '💳' },
    { id: 'profile', label: 'Profile', icon: '👤' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white bg-opacity-20 backdrop-blur-lg border-t border-white border-opacity-30 z-50">
      <div className="flex justify-around items-center py-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center py-2 px-4 rounded-lg transition-all ${
              activeTab === tab.id ? 'bg-white bg-opacity-30 text-blue-600' : 'text-gray-600'
            }`}
          >
            <span className="text-xl mb-1">{tab.icon}</span>
            <span className="text-xs">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;