import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';

function App() {
  const { user, login, register, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });

  const rewards = [
    { id: 1, name: 'Free Coffee', cost: 100, image: '☕' },
    { id: 2, name: '10% Discount', cost: 250, image: '🎫' },
    { id: 3, name: 'Free Meal', cost: 500, image: '🍔' },
    { id: 4, name: 'VIP Access', cost: 1000, image: '⭐' }
  ];

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    if (type === 'login') {
      await login(formData.email, formData.password);
    } else {
      await register(formData.name, formData.email, formData.password);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 p-4">
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20">
            <h1 className="text-3xl font-bold text-white text-center mb-8">ShermsLoyalty11</h1>
            
            <div className="flex mb-6">
              <button 
                onClick={() => setCurrentPage('login')}
                className={`flex-1 py-2 px-4 rounded-l-lg font-medium ${currentPage === 'login' ? 'bg-white text-purple-600' : 'bg-white/20 text-white'}`}
              >
                Login
              </button>
              <button 
                onClick={() => setCurrentPage('register')}
                className={`flex-1 py-2 px-4 rounded-r-lg font-medium ${currentPage === 'register' ? 'bg-white text-purple-600' : 'bg-white/20 text-white'}`}
              >
                Register
              </button>
            </div>

            <form onSubmit={(e) => handleSubmit(e, currentPage)}>
              {currentPage === 'register' && (
                <input
                  type="text"
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 mb-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60"
                  required
                />
              )}
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full p-3 mb-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full p-3 mb-6 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60"
                required
              />
              <button type="submit" className="w-full bg-white text-purple-600 py-3 rounded-lg font-bold">
                {currentPage === 'login' ? 'Login' : 'Register'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const renderHome = () => (
    <div className="p-6">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4">Welcome, {user.name}!</h2>
        <div className="text-center">
          <div className="text-4xl font-bold text-yellow-300 mb-2">{user.balance || 0}</div>
          <div className="text-white/80">ShermCoins</div>
        </div>
      </div>
      
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <span className="text-white font-medium">Tier: Gold</span>
          <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">⭐</span>
        </div>
        <div className="bg-white/20 rounded-full h-2 mb-2">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full" style={{width: '75%'}}></div>
        </div>
        <div className="text-white/80 text-sm">250 ShermCoins to Platinum</div>
      </div>
    </div>
  );

  const renderRewards = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Rewards</h2>
      <div className="grid grid-cols-2 gap-4">
        {rewards.map(reward => (
          <div key={reward.id} className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
            <div className="text-3xl text-center mb-2">{reward.image}</div>
            <h3 className="text-white font-medium text-center mb-2">{reward.name}</h3>
            <div className="text-yellow-300 text-center font-bold">{reward.cost} SC</div>
            <button className="w-full bg-white/20 text-white py-2 rounded-lg mt-3 font-medium">
              Redeem
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCard = () => (
    <div className="p-6">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-white text-center mb-6">Member Card</h2>
        <div className="bg-white rounded-xl p-6 text-center">
          <div className="text-purple-600 font-bold text-xl mb-4">ShermsLoyalty11</div>
          <div className="text-gray-800 mb-4">{user.name}</div>
          <div className="w-32 h-32 bg-gray-200 mx-auto mb-4 rounded-lg flex items-center justify-center">
            <div className="text-4xl">📱</div>
          </div>
          <div className="text-sm text-gray-600">Member ID: #{user.id}</div>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="p-6">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6">Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="text-white/80 text-sm">Name</label>
            <div className="text-white font-medium">{user.name}</div>
          </div>
          <div>
            <label className="text-white/80 text-sm">Email</label>
            <div className="text-white font-medium">{user.email}</div>
          </div>
          <div>
            <label className="text-white/80 text-sm">Member Since</label>
            <div className="text-white font-medium">{new Date(user.created_at).toLocaleDateString()}</div>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full bg-red-500 text-white py-3 rounded-lg font-bold mt-8"
        >
          Logout
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch(currentPage) {
      case 'rewards': return renderRewards();
      case 'card': return renderCard();
      case 'profile': return renderProfile();
      default: return renderHome();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500">
      <div className="pb-20">
        {renderContent()}
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-lg border-t border-white/20">
        <div className="flex">
          {[
            { id: 'home', icon: '🏠', label: 'Home' },
            { id: 'rewards', icon: '🎁', label: 'Rewards' },
            { id: 'card', icon: '💳', label: 'Card' },
            { id: 'profile', icon: '👤', label: 'Profile' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentPage(tab.id)}
              className={`flex-1 py-3 text-center ${currentPage === tab.id ? 'text-yellow-300' : 'text-white/60'}`}
            >
              <div className="text-xl mb-1">{tab.icon}</div>
              <div className="text-xs font-medium">{tab.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;