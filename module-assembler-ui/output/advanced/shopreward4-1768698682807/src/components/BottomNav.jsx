import React from 'react';
import { Home, Gift, CreditCard, User } from 'lucide-react';

const BottomNav = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'rewards', icon: Gift, label: 'Rewards' },
    { id: 'card', icon: CreditCard, label: 'Card' },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="backdrop-blur-xl bg-white/10 border-t border-white/20">
        <div className="flex justify-around items-center px-4 py-2">
          {tabs.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`relative flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 hover:scale-105 ${
                activeTab === id ? 'text-white' : 'text-white/60 hover:text-white/80'
              }`}
            >
              <Icon size={24} className="mb-1" />
              <span className="text-xs font-medium">{label}</span>
              {activeTab === id && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400 rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BottomNav;