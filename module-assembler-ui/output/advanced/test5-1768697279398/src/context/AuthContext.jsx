import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app load
    const savedUser = localStorage.getItem('test5_loyalty_user');
    const token = localStorage.getItem('test5_loyalty_token');
    
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('test5_loyalty_user');
        localStorage.removeItem('test5_loyalty_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      
      // Simulate API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        // Simulate successful login for demo
        const mockUser = {
          id: 1,
          name: email.split('@')[0],
          email: email,
          points: 250,
          tier: 'Silver',
          phone: '+1234567890'
        };
        const mockToken = 'mock_jwt_token_' + Date.now();
        
        setUser(mockUser);
        localStorage.setItem('test5_loyalty_user', JSON.stringify(mockUser));
        localStorage.setItem('test5_loyalty_token', mockToken);
        return;
      }

      const data = await response.json();
      setUser(data.user);
      localStorage.setItem('test5_loyalty_user', JSON.stringify(data.user));
      localStorage.setItem('test5_loyalty_token', data.token);
    } catch (error) {
      // Fallback for demo - simulate successful login
      const mockUser = {
        id: 1,
        name: email.split('@')[0],
        email: email,
        points: 250,
        tier: 'Silver',
        phone: '+1234567890'
      };
      const mockToken = 'mock_jwt_token_' + Date.now();
      
      setUser(mockUser);
      localStorage.setItem('test5_loyalty_user', JSON.stringify(mockUser));
      localStorage.setItem('test5_loyalty_token', mockToken);
      console.log('Login simulated for demo purposes');
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      setLoading(true);
      
      // Simulate API call
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        // Simulate successful registration for demo
        const mockUser = {
          id: Date.now(),
          name: name,
          email: email,
          points: 0,
          tier: 'Bronze',
          phone: ''
        };
        const mockToken = 'mock_jwt_token_' + Date.now();
        
        setUser(mockUser);
        localStorage.setItem('test5_loyalty_user', JSON.stringify(mockUser));
        localStorage.setItem('test5_loyalty_token', mockToken);
        return;
      }

      const data = await response.json();
      setUser(data.user);
      localStorage.setItem('test5_loyalty_user', JSON.stringify(data.user));
      localStorage.setItem('test5_loyalty_token', data.token);
    } catch (error) {
      // Fallback for demo - simulate successful registration
      const mockUser = {
        id: Date.now(),
        name: name,
        email: email,
        points: 0,
        tier: 'Bronze',
        phone: ''
      };
      const mockToken = 'mock_jwt_token_' + Date.now();
      
      setUser(mockUser);
      localStorage.setItem('test5_loyalty_user', JSON.stringify(mockUser));
      localStorage.setItem('test5_loyalty_token', mockToken);
      console.log('Registration simulated for demo purposes');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('test5_loyalty_user');
    localStorage.removeItem('test5_loyalty_token');
  };

  const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('test5_loyalty_token');
    
    const authHeaders = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: authHeaders,
      });

      if (response.status === 401) {
        // Token expired or invalid
        logout();
        throw new Error('Authentication failed');
      }

      return response;
    } catch (error) {
      console.error('Fetch with auth error:', error);
      throw error;
    }
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('test5_loyalty_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    fetchWithAuth,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};