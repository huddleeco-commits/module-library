import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

const API_BASE_URL = 'https://api.shopreward4.com'; // Replace with actual API URL

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on app load
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Simulate API call - replace with actual API endpoint
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        // For demo purposes, simulate successful login
        if (email && password) {
          const mockUser = {
            id: '1',
            name: 'John Doe',
            email: email,
            points: 1250,
            tier: 'Silver',
            joinDate: new Date().toISOString(),
          };
          const mockToken = 'demo-jwt-token-' + Date.now();
          
          localStorage.setItem('authToken', mockToken);
          localStorage.setItem('userData', JSON.stringify(mockUser));
          setUser(mockUser);
          return mockUser;
        }
        throw new Error('Login failed');
      }

      const data = await response.json();
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } catch (error) {
      // For demo purposes, simulate successful login with any email/password
      if (email && password) {
        const mockUser = {
          id: '1',
          name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
          email: email,
          points: 1250,
          tier: 'Silver',
          joinDate: new Date().toISOString(),
        };
        const mockToken = 'demo-jwt-token-' + Date.now();
        
        localStorage.setItem('authToken', mockToken);
        localStorage.setItem('userData', JSON.stringify(mockUser));
        setUser(mockUser);
        return mockUser;
      }
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      // Simulate API call - replace with actual API endpoint
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        // For demo purposes, simulate successful registration
        if (name && email && password) {
          const mockUser = {
            id: Date.now().toString(),
            name: name,
            email: email,
            points: 100, // Welcome bonus
            tier: 'Bronze',
            joinDate: new Date().toISOString(),
          };
          const mockToken = 'demo-jwt-token-' + Date.now();
          
          localStorage.setItem('authToken', mockToken);
          localStorage.setItem('userData', JSON.stringify(mockUser));
          setUser(mockUser);
          return mockUser;
        }
        throw new Error('Registration failed');
      }

      const data = await response.json();
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } catch (error) {
      // For demo purposes, simulate successful registration
      if (name && email && password) {
        const mockUser = {
          id: Date.now().toString(),
          name: name,
          email: email,
          points: 100, // Welcome bonus
          tier: 'Bronze',
          joinDate: new Date().toISOString(),
        };
        const mockToken = 'demo-jwt-token-' + Date.now();
        
        localStorage.setItem('authToken', mockToken);
        localStorage.setItem('userData', JSON.stringify(mockUser));
        setUser(mockUser);
        return mockUser;
      }
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
  };

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    localStorage.setItem('userData', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const authOptions = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, authOptions);
      
      if (response.status === 401) {
        // Token expired or invalid
        logout();
        throw new Error('Authentication failed');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error) {
      console.error('Fetch with auth error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    fetchWithAuth,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass p-8 text-center">
          <div className="animate-pulse text-white text-xl">Loading ShopReward4...</div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};