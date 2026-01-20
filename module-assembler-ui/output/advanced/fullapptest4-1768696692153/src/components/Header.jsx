import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="backdrop-blur-md bg-white/20 border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Business Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800">fullapptest4</h1>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-8">
            <a href="#dashboard" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Dashboard
            </a>
            <a href="#rewards" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Rewards
            </a>
            <a href="#history" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              History
            </a>
            <a href="#profile" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Profile
            </a>
          </nav>

          {/* User Info and Logout */}
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-600">{user.points} points</p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-red-600 transition-colors font-medium"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <a href="#login" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Login
              </a>
              <a href="#register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium">
                Sign Up
              </a>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 rounded-lg hover:bg-white/20 transition-colors">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;