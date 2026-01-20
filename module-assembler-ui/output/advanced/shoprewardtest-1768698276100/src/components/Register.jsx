import React, { useState } from 'react';
import { User, Mail, Phone, Lock, Gift, CheckCircle } from 'lucide-react';

const Register = ({ onRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    referralCode: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (formData.name && formData.email && formData.phone && formData.password) {
        setShowSuccess(true);
        
        // Success animation then proceed
        setTimeout(() => {
          onRegister(formData);
        }, 2000);
      } else {
        throw new Error('Please fill in all required fields');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-900 via-blue-900 to-indigo-900">
        <div className="w-full max-w-md backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 shadow-2xl p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="mx-auto text-green-400 animate-bounce" size={80} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Welcome to ShopRewardTest!</h2>
          <p className="text-white/70 mb-6">Your account has been created successfully.</p>
          <div className="flex items-center justify-center space-x-2 text-purple-400">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="w-full max-w-md backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Join ShopRewardTest</h1>
          <p className="text-white/70">Create your rewards account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
            <input
              type="text"
              placeholder="Full name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              required
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
            <input
              type="email"
              placeholder="Email address *"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              required
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
            <input
              type="tel"
              placeholder="Phone number *"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
            <input
              type="password"
              placeholder="Create password *"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              required
            />
          </div>

          <div className="relative">
            <Gift className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
            <input
              type="text"
              placeholder="Referral code (optional)"
              value={formData.referralCode}
              onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-6"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Creating account...</span>
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-white/70 text-sm mb-4">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
            >
              Sign in
            </button>
          </p>
          <p className="text-white/50 text-xs">
            By creating an account, you agree to our Terms & Conditions
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;