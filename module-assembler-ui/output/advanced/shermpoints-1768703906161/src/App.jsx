import { useState } from 'react';
import { useAuth } from './context/AuthContext';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const { user, login, logout, register } = useAuth();

  if (!user && currentPage !== 'register') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">ShermPoints</h1>
            <p className="text-white/80">Your loyalty rewards await</p>
          </div>
          {currentPage === 'login' ? (
            <LoginForm onLogin={login} onSwitch={() => setCurrentPage('register')} />
          ) : (
            <div className="text-center">
              <button 
                onClick={() => setCurrentPage('login')}
                className="w-full bg-white/20 text-white py-3 rounded-xl mb-4 font-semibold hover:bg-white/30 transition-colors"
              >
                Sign In
              </button>
              <button 
                onClick={() => setCurrentPage('register')}
                className="w-full border border-white/30 text-white py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors"
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentPage === 'register') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20">
          <RegisterForm onRegister={register} onSwitch={() => setCurrentPage('login')} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {currentPage === 'home' && <HomePage user={user} />}
      {currentPage === 'rewards' && <RewardsPage />}
      {currentPage === 'card' && <CardPage user={user} />}
      {currentPage === 'profile' && <ProfilePage user={user} onLogout={logout} />}
      
      <BottomNav currentPage={currentPage} onPageChange={setCurrentPage} />
    </div>
  );
}

function LoginForm({ onLogin, onSwitch }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full bg-white/20 text-white placeholder-white/60 px-4 py-3 rounded-xl border border-white/30 focus:outline-none focus:border-white/50"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full bg-white/20 text-white placeholder-white/60 px-4 py-3 rounded-xl border border-white/30 focus:outline-none focus:border-white/50"
        required
      />
      <button type="submit" className="w-full bg-white text-purple-600 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
        Sign In
      </button>
      <button type="button" onClick={onSwitch} className="w-full text-white/80 text-sm hover:text-white">
        Need an account? Sign up
      </button>
    </form>
  );
}

function RegisterForm({ onRegister, onSwitch }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister(name, email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold text-white text-center mb-6">Create Account</h2>
      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full bg-white/20 text-white placeholder-white/60 px-4 py-3 rounded-xl border border-white/30 focus:outline-none focus:border-white/50"
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full bg-white/20 text-white placeholder-white/60 px-4 py-3 rounded-xl border border-white/30 focus:outline-none focus:border-white/50"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full bg-white/20 text-white placeholder-white/60 px-4 py-3 rounded-xl border border-white/30 focus:outline-none focus:border-white/50"
        required
      />
      <button type="submit" className="w-full bg-white text-purple-600 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
        Create Account
      </button>
      <button type="button" onClick={onSwitch} className="w-full text-white/80 text-sm hover:text-white">
        Already have an account? Sign in
      </button>
    </form>
  );
}

function HomePage({ user }) {
  const balance = user?.balance || 0;
  const tier = user?.tier || 'Bronze';
  const nextTierPoints = { Bronze: 500, Silver: 1000, Gold: 2500, Platinum: 5000 };
  const progress = (balance / nextTierPoints[tier]) * 100;

  return (
    <div className="p-4">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Welcome back!</h1>
        <p className="text-gray-600">{user?.name}</p>
      </div>

      <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl p-6 text-white mb-6">
        <div className="text-center">
          <p className="text-white/80 mb-2">ShermCoin Balance</p>
          <p className="text-4xl font-bold">{balance}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            tier === 'Bronze' ? 'bg-orange-100 text-orange-800' :
            tier === 'Silver' ? 'bg-gray-100 text-gray-800' :
            tier === 'Gold' ? 'bg-yellow-100 text-yellow-800' :
            'bg-purple-100 text-purple-800'
          }`}>
            {tier} Member
          </span>
        </div>
        <p className="text-gray-600 mb-2">Progress to next tier</p>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-purple-500 h-2 rounded-full" style={{width: `${Math.min(progress, 100)}%`}}></div>
        </div>
        <p className="text-sm text-gray-500 mt-2">{nextTierPoints[tier] - balance} points to go</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <div className="text-2xl mb-2">🎁</div>
          <p className="font-semibold text-gray-800">Rewards</p>
          <p className="text-sm text-gray-600">Redeem points</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <div className="text-2xl mb-2">💳</div>
          <p className="font-semibold text-gray-800">Member Card</p>
          <p className="text-sm text-gray-600">Show at checkout</p>
        </div>
      </div>
    </div>
  );
}

function RewardsPage() {
  const rewards = [
    { id: 1, name: '10% Off Purchase', cost: 100, icon: '🛍️' },
    { id: 2, name: 'Free Shipping', cost: 150, icon: '📦' },
    { id: 3, name: '$5 Store Credit', cost: 250, icon: '💰' },
    { id: 4, name: 'Free Product', cost: 500, icon: '🎁' },
    { id: 5, name: 'VIP Access', cost: 750, icon: '⭐' },
    { id: 6, name: 'Birthday Bonus', cost: 1000, icon: '🎂' }
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Rewards</h1>
      <div className="grid grid-cols-1 gap-4">
        {rewards.map(reward => (
          <div key={reward.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-2xl mr-4">{reward.icon}</div>
              <div>
                <h3 className="font-semibold text-gray-800">{reward.name}</h3>
                <p className="text-sm text-gray-600">{reward.cost} ShermCoins</p>
              </div>
            </div>
            <button className="bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-600 transition-colors">
              Redeem
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CardPage({ user }) {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Member Card</h1>
      <div className="max-w-sm mx-auto">
        <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">ShermPoints</h2>
            <p className="text-white/80">Member Card</p>
          </div>
          
          <div className="text-center mb-6">
            <div className="w-32 h-32 bg-white rounded-lg mx-auto flex items-center justify-center">
              <div className="text-4xl text-gray-400">📱</div>
            </div>
            <p className="text-sm text-white/60 mt-2">Scan at checkout</p>
          </div>
          
          <div className="space-y-2">
            <p className="font-semibold">{user?.name}</p>
            <p className="text-white/80 text-sm">Member ID: {user?.id}</p>
            <p className="text-white/80 text-sm">{user?.tier} Member</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfilePage({ user, onLogout }) {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Profile</h1>
      
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-purple-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-purple-600">{user?.name?.charAt(0)}</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
          <p className="text-gray-600">{user?.email}</p>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Member Since</span>
            <span className="font-semibold">Jan 2024</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Current Tier</span>
            <span className="font-semibold">{user?.tier}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Points Earned</span>
            <span className="font-semibold">{user?.balance}</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <button className="w-full bg-white text-gray-800 py-3 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 transition-colors">
          Account Settings
        </button>
        <button className="w-full bg-white text-gray-800 py-3 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 transition-colors">
          Transaction History
        </button>
        <button className="w-full bg-white text-gray-800 py-3 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 transition-colors">
          Help & Support
        </button>
        <button 
          onClick={onLogout}
          className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

function BottomNav({ currentPage, onPageChange }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'rewards', label: 'Rewards', icon: '🎁' },
    { id: 'card', label: 'Card', icon: '💳' },
    { id: 'profile', label: 'Profile', icon: '👤' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-200">
      <div className="flex">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onPageChange(tab.id)}
            className={`flex-1 py-3 text-center ${
              currentPage === tab.id ? 'text-purple-600' : 'text-gray-500'
            }`}
          >
            <div className="text-xl mb-1">{tab.icon}</div>
            <div className="text-xs font-medium">{tab.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;