import { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../api/auth';

export const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const cacheVersion = localStorage.getItem('cacheVersion');
    
    // Force refresh if cache is from before scan count fix
    const CURRENT_VERSION = '3.1.0'; // Bump this to force all users to refresh
    
    if (token && cacheVersion !== CURRENT_VERSION) {
      console.log('🔄 Clearing outdated cache and fetching fresh data...');
      localStorage.removeItem('user');
      localStorage.setItem('cacheVersion', CURRENT_VERSION);
      // Will fetch fresh data on next API call
    }
    
    if (token && savedUser && cacheVersion === CURRENT_VERSION) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await authAPI.login(email, password);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('cacheVersion', '3.1.0');
    setUser(data.user);
    return data;
  };

  const register = async (email, password, fullName, referralCode = null) => {
    const data = await authAPI.register(email, password, fullName, referralCode);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('cacheVersion', '3.1.0'); // Set version on register
    // Clear referral code from storage after successful registration
    sessionStorage.removeItem('slabtrack_referral');
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cacheVersion');
    setUser(null);
  };

  const refreshUser = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('⚠️ No token, skipping refresh');
      return;
    }

const response = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('🔄 Fresh data from /users/me:', result);
      
      if (result.success && result.user) {
        const freshUser = {
          id: result.user.id,
          email: result.user.email,
          fullName: result.user.fullName || result.user.full_name,
          subscriptionTier: result.user.subscriptionTier,
          subscriptionStatus: result.user.subscriptionStatus,
          isAdmin: result.user.isAdmin,
          scansUsed: result.user.scansUsed || 0,
          // 🔥 ADD EBAY FIELDS
          ebay_seller_connected: result.user.ebay_seller_connected,
          ebay_payment_policy_id: result.user.ebay_payment_policy_id,
          ebay_return_policy_id: result.user.ebay_return_policy_id,
          ebay_fulfillment_policy_id: result.user.ebay_fulfillment_policy_id,
          ebay_listings_used: result.user.ebay_listings_used
        };
        
        console.log('✅ Setting fresh user:', freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
        setUser(freshUser);
      }
    } else {
      console.error('❌ /users/me returned error:', response.status);
    }
  } catch (error) {
    console.error('❌ refreshUser failed:', error);
  } 
};

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}