import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.shoprewardtest.com';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  // Fetch with authentication wrapper
  const fetchWithAuth = async (url, options = {}) => {
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${API_BASE_URL}${url}`, config);
      
      if (response.status === 401) {
        // Token expired or invalid
        logout();
        throw new Error('Authentication failed');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  };

  // Load user data on token change
  const loadUser = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // For demo purposes, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data - in real app, fetch from API
      const userData = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        points: 2500,
        tier: 'Silver',
        nextTierPoints: 5000,
        avatar: 'https://ui-avatars.io/api/?name=John+Doe&background=667eea&color=fff',
        createdAt: '2023-01-15T00:00:00Z'
      };
      
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user:', error);
      // Clear invalid token
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email, password) => {
    setAuthLoading(true);
    
    try {
      // Simulate API login call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock response - in real app, call actual API
      const response = {
        token: 'mock_jwt_token_' + Date.now(),
        user: {
          id: '1',
          name: 'John Doe',
          email: email,
          points: 2500,
          tier: 'Silver',
          nextTierPoints: 5000,
          avatar: `https://ui-avatars.io/api/?name=John+Doe&background=667eea&color=fff`
        }
      };
      
      // Store token
      localStorage.setItem('auth_token', response.token);
      setToken(response.token);
      setUser(response.user);
      
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Invalid email or password');
    } finally {
      setAuthLoading(false);
    }
  };

  // Register function
  const register = async (name, email, password) => {
    setAuthLoading(true);
    
    try {
      // Simulate API register call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock response - in real app, call actual API
      const response = {
        token: 'mock_jwt_token_' + Date.now(),
        user: {
          id: '1',
          name: name,
          email: email,
          points: 100, // Welcome bonus
          tier: 'Bronze',
          nextTierPoints: 1000,
          avatar: `https://ui-avatars.io/api/?name=${encodeURIComponent(name)}&background=667eea&color=fff`
        }
      };
      
      // Store token
      localStorage.setItem('auth_token', response.token);
      setToken(response.token);
      setUser(response.user);
      
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw new Error('Registration failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setAuthLoading(true);
    
    try {
      // In real app, might want to invalidate token on server
      // await fetchWithAuth('/auth/logout', { method: 'POST' });
      
      // Clear local storage
      localStorage.removeItem('auth_token');
      
      // Reset state
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear local state even if server call fails
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  // Update user data
  const updateUser = async (userData) => {
    try {
      // In real app, update on server first
      // const updatedUser = await fetchWithAuth('/user/profile', {
      //   method: 'PUT',
      //   body: JSON.stringify(userData)
      // });
      
      // For demo, just update local state
      setUser(prevUser => ({
        ...prevUser,
        ...userData
      }));
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    if (!token) return;
    
    try {
      await loadUser();
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  // Check if user is authenticated
  const isAuthenticated = Boolean(user && token);

  // Load user on mount and token change
  useEffect(() => {
    loadUser();
  }, [token]);

  // Context value
  const value = {
    // State
    user,
    token,
    loading,
    authLoading,
    isAuthenticated,
    
    // Methods
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    fetchWithAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};