import React, { useState } from 'react';
import { Calendar, User, Clock } from 'lucide-react';

const BottomNav = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'book', label: 'Book', icon: Calendar },
    { id: 'bookings', label: 'My Bookings', icon: Clock },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="backdrop-blur-lg bg-white/10 border-t border-white/20 px-4 py-2">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-[#ed720c] text-white shadow-lg shadow-[#ed720c]/30 scale-105' 
                    : 'text-gray-600 hover:text-[#ed720c] hover:bg-white/10'
                }`}
              >
                <Icon 
                  size={24} 
                  className={`transition-transform duration-300 ${
                    isActive ? 'scale-110' : 'hover:scale-105'
                  }`} 
                />
                <span className={`text-xs mt-1 font-medium transition-all duration-300 ${
                  isActive ? 'opacity-100' : 'opacity-70'
                }`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomNav;