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
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-4 mb-4 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl">
        <div className="flex items-center justify-around py-3 px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  relative flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300
                  ${isActive 
                    ? 'text-white transform scale-110' 
                    : 'text-white/70 hover:text-white/90 hover:scale-105'
                  }
                `}
              >
                <Icon size={24} className="mb-1" />
                <span className="text-xs font-medium">{tab.label}</span>
                
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse" />
                )}
                
                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;