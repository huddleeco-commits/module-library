import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { triggerConfetti } from './utils/confetti';

// Mock data
const mockUser = {
  name: 'John Doe',
  email: 'john@example.com',
  points: 2500,
  tier: 'Silver',
  nextTierPoints: 5000,
  avatar: 'https://ui-avatars.io/api/?name=John+Doe&background=667eea&color=fff'
};

const mockRewards = [
  { id: 1, name: '10% Off Coupon', points: 500, image: '🎫', description: 'Save on your next purchase' },
  { id: 2, name: 'Free Coffee', points: 200, image: '☕', description: 'Enjoy a complimentary beverage' },
  { id: 3, name: 'Premium Shipping', points: 800, image: '📦', description: 'Free express delivery' },
  { id: 4, name: 'VIP Access', points: 1500, image: '👑', description: 'Exclusive member benefits' }
];

const mockTransactions = [
  { id: 1, type: 'earned', points: 50, description: 'Purchase at Store A', date: '2024-01-15' },
  { id: 2, type: 'redeemed', points: -200, description: 'Free Coffee', date: '2024-01-14' },
  { id: 3, type: 'earned', points: 100, description: 'Bonus Points', date: '2024-01-13' },
  { id: 4, type: 'earned', points: 75, description: 'Purchase at Store B', date: '2024-01-12' }
];

const Navigation = ({ currentPage, setCurrentPage, isMobile }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'rewards', label: 'Rewards', icon: '🎁' },
    { id: 'card', label: 'Card', icon: '💳' },
    { id: 'profile', label: 'Profile', icon: '👤' }
  ];

  const NavButton = ({ item }) => (
    <button
      onClick={() => setCurrentPage(item.id)}
      className={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-center ${isMobile ? 'px-2 py-1' : 'px-4 py-3 w-full'} rounded-lg transition-smooth ${
        currentPage === item.id
          ? 'bg-white bg-opacity-20 text-white'
          : 'text-white text-opacity-70 hover:text-white hover:bg-white hover:bg-opacity-10'
      }`}
    >
      <span className={`text-lg ${!isMobile ? 'mr-3' : ''}`}>{item.icon}</span>
      <span className={`text-xs ${!isMobile ? 'text-sm' : ''} font-medium`}>{item.label}</span>
    </button>
  );

  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-premium glass-dark border-t border-white border-opacity-20 px-4 py-2 z-50">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {navItems.map(item => <NavButton key={item.id} item={item} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-gradient-premium glass-dark h-screen fixed left-0 top-0 p-6 z-40">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">ShopRewardTest</h1>
        <p className="text-white text-opacity-70 text-sm">Loyalty Program</p>
      </div>
      <nav className="space-y-2">
        {navItems.map(item => <NavButton key={item.id} item={item} />)}
      </nav>
    </div>
  );
};

const LoadingSkeleton = ({ className = '' }) => (
  <div className={`skeleton ${className}`}></div>
);

const HomePage = ({ user, transactions }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const tierProgress = (user.points / user.nextTierPoints) * 100;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <LoadingSkeleton className="h-32 rounded-2xl" />
        <LoadingSkeleton className="h-24 rounded-xl" />
        <div className="space-y-3">
          {[1,2,3].map(i => <LoadingSkeleton key={i} className="h-16 rounded-lg" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slideUp">
      {/* Points Card */}
      <div className="glass rounded-2xl p-6 bg-gradient-premium-alt">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white text-opacity-80 text-sm">Available Points</p>
            <p className="text-3xl font-bold text-white">{user.points.toLocaleString()}</p>
          </div>
          <div className="animate-pulse-custom">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-2xl">💎</span>
            </div>
          </div>
        </div>
        
        {/* Tier Progress */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white text-opacity-80 text-sm">{user.tier} Tier</span>
            <span className="text-white text-opacity-80 text-sm">{user.nextTierPoints - user.points} to next tier</span>
          </div>
          <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-smooth"
              style={{ width: `${tierProgress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-xl p-4">
          <p className="text-white text-opacity-80 text-sm">This Month</p>
          <p className="text-xl font-bold text-white">+{transactions.filter(t => t.type === 'earned').reduce((sum, t) => sum + t.points, 0)}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-white text-opacity-80 text-sm">Redeemed</p>
          <p className="text-xl font-bold text-white">{Math.abs(transactions.filter(t => t.type === 'redeemed').reduce((sum, t) => sum + t.points, 0))}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {transactions.slice(0, 3).map(transaction => (
            <div key={transaction.id} className="flex items-center justify-between py-2">
              <div>
                <p className="text-white font-medium">{transaction.description}</p>
                <p className="text-white text-opacity-60 text-sm">{transaction.date}</p>
              </div>
              <span className={`font-bold ${
                transaction.type === 'earned' ? 'text-green-300' : 'text-red-300'
              }`}>
                {transaction.type === 'earned' ? '+' : ''}{transaction.points}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const RewardsPage = ({ user, rewards }) => {
  const [redeeming, setRedeeming] = useState(null);

  const handleRedeem = async (reward) => {
    if (user.points < reward.points) return;
    
    setRedeeming(reward.id);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    triggerConfetti();
    setRedeeming(null);
    
    // Show success message
    alert(`Successfully redeemed ${reward.name}!`);
  };

  return (
    <div className="space-y-6 animate-slideUp">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Reward Store</h2>
        <p className="text-white text-opacity-80">Redeem your points for amazing rewards</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {rewards.map(reward => (
          <div key={reward.id} className="glass rounded-xl p-6 transition-smooth hover:scale-105">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">{reward.image}</div>
              <h3 className="text-lg font-semibold text-white">{reward.name}</h3>
              <p className="text-white text-opacity-70 text-sm">{reward.description}</p>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-yellow-300 font-bold">{reward.points} points</span>
              <button
                onClick={() => handleRedeem(reward)}
                disabled={user.points < reward.points || redeeming === reward.id}
                className={`px-4 py-2 rounded-lg font-medium transition-smooth ${
                  user.points >= reward.points && redeeming !== reward.id
                    ? 'bg-white text-purple-600 hover:bg-opacity-90'
                    : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                }`}
              >
                {redeeming === reward.id ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full"></div>
                    <span>Redeeming...</span>
                  </div>
                ) : (
                  'Redeem'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CardPage = ({ user }) => {
  return (
    <div className="space-y-6 animate-slideUp">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Membership Card</h2>
        <p className="text-white text-opacity-80">Show this card to earn points</p>
      </div>

      {/* Digital Card */}
      <div className="relative mx-auto max-w-sm">
        <div className={`tier-${user.tier.toLowerCase()} rounded-2xl p-6 shadow-2xl transform transition-smooth hover:scale-105`}>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-white font-bold text-lg">ShopRewardTest</h3>
              <p className="text-white text-opacity-80 text-sm">{user.tier} Member</p>
            </div>
            <div className="text-2xl">
              {user.tier === 'Bronze' ? '🥉' : user.tier === 'Silver' ? '🥈' : user.tier === 'Gold' ? '🥇' : '💎'}
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-white text-opacity-80 text-xs mb-1">MEMBER NAME</p>
            <p className="text-white font-semibold">{user.name}</p>
          </div>
          
          <div className="flex justify-between items-end">
            <div>
              <p className="text-white text-opacity-80 text-xs mb-1">POINTS BALANCE</p>
              <p className="text-white font-bold text-xl">{user.points.toLocaleString()}</p>
            </div>
            <div className="text-white text-opacity-60">
              <div className="w-12 h-8 bg-white bg-opacity-20 rounded flex items-center justify-center">
                <span className="text-xs font-mono">SCAN</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code */}
      <div className="glass rounded-xl p-6 text-center">
        <h3 className="text-lg font-semibold text-white mb-4">Scan to Earn</h3>
        <div className="w-32 h-32 bg-white rounded-lg mx-auto mb-4 flex items-center justify-center">
          <span className="text-4xl">📱</span>
        </div>
        <p className="text-white text-opacity-70 text-sm">Show this QR code at checkout to earn points</p>
      </div>
    </div>
  );
};

const ProfilePage = ({ user }) => {
  const { logout } = useAuth();

  return (
    <div className="space-y-6 animate-slideUp">
      {/* Profile Header */}
      <div className="glass rounded-xl p-6 text-center">
        <img 
          src={user.avatar} 
          alt={user.name}
          className="w-20 h-20 rounded-full mx-auto mb-4 ring-4 ring-white ring-opacity-30"
        />
        <h2 className="text-xl font-bold text-white">{user.name}</h2>
        <p className="text-white text-opacity-70">{user.email}</p>
        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 tier-${user.tier.toLowerCase()}`}>
          {user.tier} Member
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-white">{user.points}</p>
          <p className="text-white text-opacity-70 text-sm">Total Points</p>
        </div>
        <div className="glass rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-white">12</p>
          <p className="text-white text-opacity-70 text-sm">Rewards</p>
        </div>
        <div className="glass rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-white">6</p>
          <p className="text-white text-opacity-70 text-sm">Months</p>
        </div>
      </div>

      {/* Menu Items */}
      <div className="space-y-3">
        {[
          { icon: '📊', label: 'Points History', action: () => {} },
          { icon: '🎁', label: 'My Rewards', action: () => {} },
          { icon: '⚙️', label: 'Settings', action: () => {} },
          { icon: '📞', label: 'Support', action: () => {} },
          { icon: '📋', label: 'Terms & Privacy', action: () => {} }
        ].map((item, index) => (
          <button
            key={index}
            onClick={item.action}
            className="w-full glass rounded-lg p-4 flex items-center space-x-3 transition-smooth hover:bg-white hover:bg-opacity-10"
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-white font-medium">{item.label}</span>
            <span className="ml-auto text-white text-opacity-50">›</span>
          </button>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full bg-red-500 bg-opacity-80 text-white font-medium py-3 rounded-lg transition-smooth hover:bg-opacity-100"
      >
        Sign Out
      </button>
    </div>
  );
};

const LoginForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.name, formData.email, formData.password);
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-premium flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-8 w-full max-w-md animate-slideUp">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">ShopRewardTest</h1>
          <p className="text-white text-opacity-80">
            {isLogin ? 'Welcome back!' : 'Join our loyalty program'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-white text-opacity-80 text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                placeholder="Enter your name"
                required
              />
            </div>
          )}
          
          <div>
            <label className="block text-white text-opacity-80 text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div>
            <label className="block text-white text-opacity-80 text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-purple-600 font-bold py-3 rounded-lg transition-smooth hover:bg-opacity-90 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin h-5 w-5 border-2 border-purple-600 border-t-transparent rounded-full"></div>
                <span>Processing...</span>
              </div>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-white text-opacity-80 hover:text-opacity-100 transition-smooth"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

function App() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-premium flex items-center justify-center">
        <div className="text-center animate-pulse-custom">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">💎</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">ShopRewardTest</h1>
          <p className="text-white text-opacity-70">Loading your rewards...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage user={mockUser} transactions={mockTransactions} />;
      case 'rewards':
        return <RewardsPage user={mockUser} rewards={mockRewards} />;
      case 'card':
        return <CardPage user={mockUser} />;
      case 'profile':
        return <ProfilePage user={mockUser} />;
      default:
        return <HomePage user={mockUser} transactions={mockTransactions} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-premium">
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} isMobile={isMobile} />
      
      <main className={`transition-smooth ${
        isMobile ? 'pb-20 px-4 pt-6' : 'ml-64 p-8'
      }`}>
        <div className="max-w-4xl mx-auto">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default App;