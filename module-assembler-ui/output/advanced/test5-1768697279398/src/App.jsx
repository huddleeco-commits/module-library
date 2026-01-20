import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';

// Components
const LoginForm = ({ onSwitch }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData.email, formData.password);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="card max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Login to test5 Loyalty</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="input-field"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="input-field"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="text-center mt-4 text-gray-600">
          Don't have an account?
          <button onClick={() => onSwitch('register')} className="text-blue-600 hover:underline ml-1">
            Register
          </button>
        </p>
      </div>
    </div>
  );
};

const RegisterForm = ({ onSwitch }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password);
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="card max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Join test5 Loyalty</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="input-field"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="input-field"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="input-field"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="text-center mt-4 text-gray-600">
          Already have an account?
          <button onClick={() => onSwitch('login')} className="text-blue-600 hover:underline ml-1">
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

const Navigation = ({ currentPage, setCurrentPage }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'rewards', label: 'Rewards' },
    { id: 'history', label: 'History' },
    { id: 'profile', label: 'Profile' }
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-gray-800">test5 Loyalty</h1>
            <div className="flex space-x-4">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`nav-link ${
                    currentPage === item.id ? 'nav-link-active' : 'nav-link-inactive'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {user?.name}</span>
            <button onClick={logout} className="btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Points Balance</h3>
          <p className="text-3xl font-bold text-blue-600">{user?.points || 0}</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Tier Status</h3>
          <p className="text-xl font-semibold text-green-600">{user?.tier || 'Bronze'}</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Next Reward</h3>
          <p className="text-sm text-gray-600">50 points away</p>
        </div>
      </div>
    </div>
  );
};

const Rewards = () => {
  const rewards = [
    { id: 1, name: '10% Discount', points: 100, description: 'Get 10% off your next purchase' },
    { id: 2, name: 'Free Shipping', points: 200, description: 'Free shipping on any order' },
    { id: 3, name: '$25 Gift Card', points: 500, description: '$25 gift card for test5 store' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Available Rewards</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map(reward => (
          <div key={reward.id} className="card">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">{reward.name}</h3>
            <p className="text-gray-600 mb-4">{reward.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-blue-600 font-semibold">{reward.points} points</span>
              <button className="btn-primary">Redeem</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const History = () => {
  const transactions = [
    { id: 1, type: 'earned', points: 50, description: 'Purchase at test5 store', date: '2024-01-15' },
    { id: 2, type: 'redeemed', points: -100, description: '10% Discount reward', date: '2024-01-10' },
    { id: 3, type: 'earned', points: 25, description: 'Review submitted', date: '2024-01-05' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Points History</h2>
      <div className="card">
        <div className="space-y-4">
          {transactions.map(transaction => (
            <div key={transaction.id} className="flex justify-between items-center border-b border-gray-200 pb-4">
              <div>
                <p className="font-medium text-gray-800">{transaction.description}</p>
                <p className="text-sm text-gray-500">{transaction.date}</p>
              </div>
              <span className={`font-semibold ${
                transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.points > 0 ? '+' : ''}{transaction.points} points
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Profile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle profile update
    console.log('Profile updated:', formData);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Profile Settings</h2>
      <div className="card max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              className="input-field"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              className="input-field"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              className="input-field"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <button type="submit" className="btn-primary w-full">
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
};

function App() {
  const { user } = useAuth();
  const [authMode, setAuthMode] = useState('login');
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!user) {
    return authMode === 'login' 
      ? <LoginForm onSwitch={setAuthMode} />
      : <RegisterForm onSwitch={setAuthMode} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'rewards':
        return <Rewards />;
      case 'history':
        return <History />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
      {renderPage()}
    </div>
  );
}

export default App;