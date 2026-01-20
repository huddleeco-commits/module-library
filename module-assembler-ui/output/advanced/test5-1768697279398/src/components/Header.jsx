import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-white">test5 Loyalty</h1>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <a href="#dashboard" className="text-white hover:text-purple-200 transition-colors">
              Dashboard
            </a>
            <a href="#rewards" className="text-white hover:text-purple-200 transition-colors">
              Rewards
            </a>
            <a href="#history" className="text-white hover:text-purple-200 transition-colors">
              History
            </a>
          </nav>

          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-white font-medium">Welcome, {user.name}</span>
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="space-x-2">
              <a href="#login" className="text-white hover:text-purple-200 transition-colors">
                Login
              </a>
              <a href="#register" className="bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors">
                Register
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;