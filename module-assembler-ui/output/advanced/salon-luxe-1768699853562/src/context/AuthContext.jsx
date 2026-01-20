import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Mock API call - replace with actual API
      const mockResponse = {
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: 1,
          email,
          name: email.split('@')[0],
          role: email.includes('admin') ? 'admin' : 'customer'
        }
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { token: newToken, user: userData } = mockResponse;
      
      setToken(newToken);
      setUser(userData);
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return userData;
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Login failed');
    }
  };

  const register = async (name, email, password) => {
    try {
      // Mock API call - replace with actual API
      const mockResponse = {
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: Date.now(),
          email,
          name,
          role: 'customer'
        }
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { token: newToken, user: userData } = mockResponse;
      
      setToken(newToken);
      setUser(userData);
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return userData;
    } catch (error) {
      console.error('Registration failed:', error);
      throw new Error('Registration failed');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const isAuthenticated = () => {
    return !!(token && user);
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};