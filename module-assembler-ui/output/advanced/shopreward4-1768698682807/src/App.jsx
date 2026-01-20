import React, { useState, useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import { triggerConfetti } from './utils/confetti';

// Components
function LoginForm({ onToggle }) {
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData.email, formData.password);
    } catch (error) {
      console.error('Login failed:', error);
    }
    setLoading(false);
  };

  return (
    <div className="glass p-6 m-4 animate-fadeIn">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Welcome Back</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/70 focus-ring"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/70 focus-ring"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white/20 hover:bg-white/30 text-white py-3 rounded-lg transition-smooth font-medium"
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
      <p className="text-center text-white/70 mt-4">
        Don't have an account?{' '}
        <button onClick={onToggle} className="text-white font-medium hover:underline">
          Sign Up
        </button>
      </p>
    </div>
  );
}

function RegisterForm({ onToggle }) {
  const { register } = useContext(AuthContext);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password);
      triggerConfetti();
    } catch (error) {
      console.error('Registration failed:', error);
    }
    setLoading(false);
  };

  return (
    <div className="glass p-6 m-4 animate-fadeIn">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Join ShopReward4</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/70 focus-ring"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/70 focus-ring"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/70 focus-ring"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white/20 hover:bg-white/30 text-white py-3 rounded-lg transition-smooth font-medium"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
      <p className="text-center text-white/70 mt-4">
        Already have an account?{' '}
        <button onClick={onToggle} className="text-white font-medium hover:underline">
          Sign In
        </button>
      </p>
    </div>
  );
}

function HomeScreen() {
  const { user } = useContext(AuthContext);
  const [points] = useState(user?.points || 1250);

  const getTierInfo = (points) => {
    if (points >= 5000) return { name: 'Platinum', color: 'var(--platinum)', gradient: 'gradient-platinum' };
    if (points >= 2500) return { name: 'Gold', color: 'var(--gold)', gradient: 'gradient-gold' };
    if (points >= 1000) return { name: 'Silver', color: 'var(--silver)', gradient: 'gradient-silver' };
    return { name: 'Bronze', color: 'var(--bronze)', gradient: 'gradient-bronze' };
  };

  const tier = getTierInfo(points);

  return (
    <div className="p-4 space-y-6 animate-fadeIn">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Hello, {user?.name || 'Member'}!</h1>
        <p className="text-white/80">Welcome back to ShopReward4</p>
      </div>

      <div className="glass p-6 text-center">
        <div className="animate-pulse">
          <h2 className="text-4xl font-bold text-white mb-2">{points.toLocaleString()}</h2>
          <p className="text-white/80">Points Available</p>
        </div>
        <div className="mt-4">
          <div className={`inline-block px-4 py-2 rounded-full ${tier.gradient} text-white font-medium`}>
            {tier.name} Member
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass p-4 text-center card-hover">
          <div className="text-2xl mb-2">🎁</div>
          <h3 className="font-medium text-white">Rewards</h3>
          <p className="text-sm text-white/70">12 available</p>
        </div>
        <div className="glass p-4 text-center card-hover">
          <div className="text-2xl mb-2">📈</div>
          <h3 className="font-medium text-white">This Month</h3>
          <p className="text-sm text-white/70">+340 points</p>
        </div>
      </div>

      <div className="glass p-4">
        <h3 className="font-medium text-white mb-3">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white text-sm">Purchase at Store A</p>
              <p className="text-white/60 text-xs">2 hours ago</p>
            </div>
            <span className="text-green-300 font-medium">+50 points</span>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white text-sm">Bonus Points</p>
              <p className="text-white/60 text-xs">1 day ago</p>
            </div>
            <span className="text-green-300 font-medium">+100 points</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function RewardsScreen() {
  const rewards = [
    { id: 1, name: '$5 Off Purchase', points: 500, description: 'Valid on orders over $25' },
    { id: 2, name: 'Free Coffee', points: 200, description: 'Any size, any flavor' },
    { id: 3, name: '10% Discount', points: 300, description: 'On next purchase' },
    { id: 4, name: '$20 Gift Card', points: 2000, description: 'Digital gift card' },
  ];

  const handleRedeem = (reward) => {
    triggerConfetti();
    alert(`Redeemed: ${reward.name}!`);
  };

  return (
    <div className="p-4 animate-fadeIn">
      <h1 className="text-2xl font-bold text-white mb-6 text-center">Available Rewards</h1>
      <div className="space-y-4">
        {rewards.map((reward) => (
          <div key={reward.id} className="glass p-4 card-hover">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-medium text-white">{reward.name}</h3>
                <p className="text-white/70 text-sm">{reward.description}</p>
              </div>
              <span className="text-yellow-300 font-bold">{reward.points} pts</span>
            </div>
            <button
              onClick={() => handleRedeem(reward)}
              className="w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg transition-smooth font-medium"
            >
              Redeem
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CardScreen() {
  const { user } = useContext(AuthContext);
  const [points] = useState(user?.points || 1250);

  return (
    <div className="p-4 animate-fadeIn">
      <h1 className="text-2xl font-bold text-white mb-6 text-center">Loyalty Card</h1>
      
      <div className="glass p-6 mb-6 text-center animate-slideUp">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-white mb-2">ShopReward4</h2>
          <p className="text-white/80">{user?.name || 'Member'}</p>
        </div>
        
        <div className="border-t border-white/20 pt-4">
          <div className="text-3xl font-bold text-white mb-1">{points.toLocaleString()}</div>
          <div className="text-white/80">Points Balance</div>
        </div>
        
        <div className="mt-4 p-3 bg-white/10 rounded-lg">
          <p className="text-white/90 text-sm font-mono tracking-wider">
            **** **** **** {Math.random().toString().substr(2, 4)}
          </p>
        </div>
      </div>

      <div className="glass p-4">
        <h3 className="font-medium text-white mb-3">QR Code</h3>
        <div className="bg-white p-4 rounded-lg text-center">
          <div className="text-6xl mb-2">⬛</div>
          <p className="text-gray-600 text-sm">Scan at checkout</p>
        </div>
      </div>
    </div>
  );
}

function ProfileScreen() {
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <div className="p-4 animate-fadeIn">
      <h1 className="text-2xl font-bold text-white mb-6 text-center">Profile</h1>
      
      <div className="glass p-6 mb-6">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl text-white">{user?.name?.[0] || 'U'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">{user?.name || 'User'}</h2>
          <p className="text-white/80">{user?.email || 'user@example.com'}</p>
        </div>
      </div>

      <div className="space-y-4">
        <button className="w-full glass p-4 text-left text-white transition-smooth hover:bg-white/10">
          <div className="flex items-center justify-between">
            <span>🎯 Purchase History</span>
            <span className="text-white/60">→</span>
          </div>
        </button>
        
        <button className="w-full glass p-4 text-left text-white transition-smooth hover:bg-white/10">
          <div className="flex items-center justify-between">
            <span>🔔 Notifications</span>
            <span className="text-white/60">→</span>
          </div>
        </button>
        
        <button className="w-full glass p-4 text-left text-white transition-smooth hover:bg-white/10">
          <div className="flex items-center justify-between">
            <span>⚙️ Settings</span>
            <span className="text-white/60">→</span>
          </div>
        </button>
        
        <button className="w-full glass p-4 text-left text-white transition-smooth hover:bg-white/10">
          <div className="flex items-center justify-between">
            <span>❓ Help & Support</span>
            <span className="text-white/60">→</span>
          </div>
        </button>
        
        <button
          onClick={handleLogout}
          className="w-full glass p-4 text-left text-red-300 transition-smooth hover:bg-red-500/20"
        >
          <div className="flex items-center justify-between">
            <span>🚪 Logout</span>
            <span className="text-red-300/60">→</span>
          </div>
        </button>
      </div>
    </div>
  );
}

function BottomNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'home', icon: '🏠', label: 'Home' },
    { id: 'rewards', icon: '🎁', label: 'Rewards' },
    { id: 'card', icon: '💳', label: 'Card' },
    { id: 'profile', icon: '👤', label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 glass border-t border-white/20">
      <div className="flex justify-around py-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center py-2 px-4 transition-smooth ${
              activeTab === tab.id ? 'text-white' : 'text-white/60'
            }`}
          >
            <span className="text-xl mb-1">{tab.icon}</span>
            <span className="text-xs">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function App() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('home');
  const [showLogin, setShowLogin] = useState(true);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {showLogin ? (
          <LoginForm onToggle={() => setShowLogin(false)} />
        ) : (
          <RegisterForm onToggle={() => setShowLogin(true)} />
        )}
      </div>
    );
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'rewards':
        return <RewardsScreen />;
      case 'card':
        return <CardScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {renderScreen()}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;