import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL || '';
const IS_TEST_MODE = import.meta.env.VITE_TEST_MODE === 'true' || import.meta.env.VITE_PREVIEW_MODE === 'true';

// Demo user for test/preview mode
const DEMO_USER = {
  id: 'demo-user-001',
  name: 'Demo Customer',
  email: 'demo@example.com',
  role: 'customer',
  points: 250,
  memberSince: '2024-01-15'
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTestMode] = useState(IS_TEST_MODE);

  useEffect(() => {
    // In test/preview mode, auto-login with demo user
    if (IS_TEST_MODE) {
      setUser(DEMO_USER);
      setLoading(false);
      return;
    }

    // Normal auth flow - check localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // In test mode, accept any credentials
    if (IS_TEST_MODE) {
      setUser(DEMO_USER);
      return { success: true };
    }

    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success && data.user) {
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      return { success: true };
    }
    return { success: false, error: data.error || 'Login failed' };
  };

  const register = async (name, email, password) => {
    // In test mode, simulate registration
    if (IS_TEST_MODE) {
      const newUser = { ...DEMO_USER, name, email };
      setUser(newUser);
      return { success: true };
    }

    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (data.success && data.user) {
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      return { success: true };
    }
    return { success: false, error: data.error || 'Registration failed' };
  };

  const logout = () => {
    // In test mode, just toggle off - can re-login anytime
    setUser(null);
    if (!IS_TEST_MODE) {
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user, isTestMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
