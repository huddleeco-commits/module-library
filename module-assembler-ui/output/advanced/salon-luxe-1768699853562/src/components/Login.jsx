import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';

const Login = ({ onLogin, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (formData.email && formData.password) {
        onLogin(formData);
      } else {
        setError('Please fill in all fields');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#ed720c]/20 via-white to-[#ed720c]/10">
      <div className="w-full max-w-md">
        {/* Glassmorphism Card */}
        <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="text-[#ed720c] mr-2" size={32} />
              <h1 className="text-3xl font-bold text-gray-800">Salon Luxe</h1>
            </div>
            <p className="text-gray-600">Welcome back to luxury</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-4 bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#ed720c]/50 focus:border-[#ed720c] transition-all duration-300 text-gray-800 placeholder-gray-500"
                required
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-12 pr-12 py-4 bg-white/30 border border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#ed720c]/50 focus:border-[#ed720c] transition-all duration-300 text-gray-800 placeholder-gray-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50/50 py-2 px-4 rounded-xl border border-red-200/50">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#ed720c] to-[#ff8c2a] text-white py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
            >
              <span className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                Sign In
              </span>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              )}
            </button>
          </form>

          {/* Switch to Register */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={onSwitchToRegister}
                className="text-[#ed720c] font-semibold hover:underline transition-all duration-300"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;