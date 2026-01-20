import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';

function App() {
  const { user, login, register, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', phone: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(loginForm.email, loginForm.password);
      setCurrentPage('home');
    } catch (error) {
      alert('Login failed');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await register(registerForm.name, registerForm.email, registerForm.password, registerForm.phone);
      setCurrentPage('home');
    } catch (error) {
      alert('Registration failed');
    }
  };

  const rewards = [
    { id: 1, name: 'Free Coffee', cost: 100, image: '☕' },
    { id: 2, name: '$5 Off', cost: 250, image: '💵' },
    { id: 3, name: 'Free Meal', cost: 500, image: '🍔' },
    { id: 4, name: 'VIP Access', cost: 1000, image: '⭐' }
  ];

  const getTierInfo = (points) => {
    if (points >= 1000) return { tier: 'Gold', next: 'Max', progress: 100, color: 'bg-yellow-500' };
    if (points >= 500) return { tier: 'Silver', next: 'Gold', progress: (points - 500) / 5, color: 'bg-gray-400' };
    return { tier: 'Bronze', next: 'Silver', progress: points / 5, color: 'bg-orange-600' };
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h1 className="text-3xl font-bold text-white text-center mb-8">ShermsPoints</h1>
          
          {currentPage === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/30"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/30"
                required
              />
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold">Login</button>
              <button type="button" onClick={() => setCurrentPage('register')} className="w-full text-white/80">Need an account? Register</button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={registerForm.name}
                onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/30"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/30"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/30"
                required
              />
              <input
                type="tel"
                placeholder="Phone"
                value={registerForm.phone}
                onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})}
                className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/30"
                required
              />
              <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold">Register</button>
              <button type="button" onClick={() => setCurrentPage('login')} className="w-full text-white/80">Have an account? Login</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  const tierInfo = getTierInfo(user.points || 0);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Welcome, {user.name}!</h2>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="text-4xl font-bold text-yellow-400 mb-2">{user.points || 0}</div>
                <div className="text-white/80">ShermCoins</div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-3">
                <span className={`px-3 py-1 rounded-full text-white font-semibold ${tierInfo.color}`}>
                  {tierInfo.tier} Member
                </span>
                <span className="text-white/80">{tierInfo.next !== 'Max' ? `Next: ${tierInfo.next}` : 'Max Level'}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full" style={{width: `${Math.min(tierInfo.progress, 100)}%`}}></div>
              </div>
            </div>
          </div>
        );
      
      case 'rewards':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">Rewards</h2>
            <div className="grid grid-cols-2 gap-4">
              {rewards.map(reward => (
                <div key={reward.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center">
                  <div className="text-3xl mb-2">{reward.image}</div>
                  <div className="text-white font-semibold mb-2">{reward.name}</div>
                  <div className="text-yellow-400 font-bold">{reward.cost} SC</div>
                  <button 
                    disabled={user.points < reward.cost}
                    className="mt-2 w-full py-2 rounded-lg font-semibold disabled:bg-gray-600 disabled:text-gray-400 bg-blue-600 text-white"
                  >
                    {user.points >= reward.cost ? 'Redeem' : 'Need More'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'card':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">Member Card</h2>
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-6 border border-white/20">
              <div className="text-white/80 mb-2">ShermsPoints Member</div>
              <div className="text-2xl font-bold text-white mb-4">{user.name}</div>
              <div className="text-right">
                <div className={`inline-block px-3 py-1 rounded-full text-white font-semibold ${tierInfo.color} mb-4`}>
                  {tierInfo.tier}
                </div>
              </div>
              <div className="bg-white/20 rounded-lg p-4 text-center">
                <div className="text-6xl mb-2">📱</div>
                <div className="text-white/80 text-sm">QR Code</div>
                <div className="text-white/60 text-xs mt-2">ID: {user.id}</div>
              </div>
            </div>
          </div>
        );
      
      case 'profile':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">Profile</h2>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 space-y-4">
              <div>
                <label className="text-white/80 text-sm">Name</label>
                <div className="text-white font-semibold">{user.name}</div>
              </div>
              <div>
                <label className="text-white/80 text-sm">Email</label>
                <div className="text-white font-semibold">{user.email}</div>
              </div>
              {user.phone && (
                <div>
                  <label className="text-white/80 text-sm">Phone</label>
                  <div className="text-white font-semibold">{user.phone}</div>
                </div>
              )}
              <div>
                <label className="text-white/80 text-sm">Member Since</label>
                <div className="text-white font-semibold">{new Date(user.created_at).toLocaleDateString()}</div>
              </div>
            </div>
            <button 
              onClick={logout}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold"
            >
              Logout
            </button>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="pb-20 px-4 pt-8">
        {renderPage()}
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-md border-t border-white/20">
        <div className="flex justify-around py-2">
          {[
            { id: 'home', icon: '🏠', label: 'Home' },
            { id: 'rewards', icon: '🎁', label: 'Rewards' },
            { id: 'card', icon: '💳', label: 'Card' },
            { id: 'profile', icon: '👤', label: 'Profile' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentPage(tab.id)}
              className={`flex flex-col items-center py-2 px-4 rounded-lg ${
                currentPage === tab.id ? 'bg-white/20 text-white' : 'text-white/60'
              }`}
            >
              <span className="text-xl mb-1">{tab.icon}</span>
              <span className="text-xs">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;