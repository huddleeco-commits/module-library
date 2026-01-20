import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Rewards from './components/Rewards';
import History from './components/History';
import Profile from './components/Profile';
import AdminPanel from './components/AdminPanel';
import Navigation from './components/Navigation';

function App() {
  const { user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showAuth, setShowAuth] = useState('login');

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">fullapptest4</h1>
            <p className="text-gray-200">Loyalty Program</p>
          </div>
          
          {showAuth === 'login' ? (
            <>
              <Login />
              <p className="text-center mt-4 text-gray-200">
                Don't have an account?{' '}
                <button 
                  onClick={() => setShowAuth('register')}
                  className="text-blue-300 hover:text-blue-200 underline"
                >
                  Sign up
                </button>
              </p>
            </>
          ) : (
            <>
              <Register />
              <p className="text-center mt-4 text-gray-200">
                Already have an account?{' '}
                <button 
                  onClick={() => setShowAuth('login')}
                  className="text-blue-300 hover:text-blue-200 underline"
                >
                  Sign in
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    );
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
      case 'admin':
        return <AdminPanel />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="container mx-auto px-4 py-8">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;