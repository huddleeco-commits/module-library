import { useState, useEffect, useContext } from 'react';
import { User, CreditCard, Trash2, Lock, Mail, Save, ExternalLink, AlertCircle, Check, Shield, Zap, Crown, Package, Bell } from 'lucide-react';
import Navbar from '../components/shared/Navbar';
import Button from '../components/shared/Button';
import { AuthContext } from '../context/AuthContext';
import { apiFetch } from '../config/api';
import { cardsAPI } from '../api/cards'; // ✅ ADD THIS LINE

export default function Settings() {
  const { user, logout, refreshUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Profile form
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  
  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Payment Methods
  const [venmoUsername, setVenmoUsername] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [cashappTag, setCashappTag] = useState('');
  const [zelleInfo, setZelleInfo] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [loadingPayment, setLoadingPayment] = useState(false);
  
  // Subscription data
  const [subscription, setSubscription] = useState(null);
  const [loadingSub, setLoadingSub] = useState(true);
  const [scanLimit, setScanLimit] = useState(null);
  
  // Delete account
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Shipping Address
  const [shippingName, setShippingName] = useState('');
  const [shippingAddress1, setShippingAddress1] = useState('');
  const [shippingAddress2, setShippingAddress2] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingState, setShippingState] = useState('');
  const [shippingZip, setShippingZip] = useState('');
  const [shippingCountry, setShippingCountry] = useState('USA');
  const [loadingShipping, setLoadingShipping] = useState(false);

  // Notification Preferences
  const [notifPrefs, setNotifPrefs] = useState({
    email_enabled: true,
    push_enabled: true,
    notify_outbid: true,
    notify_auction_ending: true,
    notify_auction_won: true,
    notify_new_bid_on_my_auction: true,
    notify_auction_sold: true,
    notify_payment_received: true,
    notify_item_shipped: true,
    notify_item_delivered: true,
    notify_new_message: true
  });
  const [loadingNotifPrefs, setLoadingNotifPrefs] = useState(false);

  // eBay Seller Integration
  const [ebayConnected, setEbayConnected] = useState(false);
  const [ebayConnectedAt, setEbayConnectedAt] = useState(null);
  const [loadingEbay, setLoadingEbay] = useState(false);
  const [ebayPolicies, setEbayPolicies] = useState({ payment: null, return: null, shipping: null });

  // eBay Shipping Settings
  const [ebayShipCity, setEbayShipCity] = useState('');
  const [ebayShipState, setEbayShipState] = useState('');
  const [ebayShipZip, setEbayShipZip] = useState('');
  const [shippingService, setShippingService] = useState('USPSFirstClass');
  const [shippingCost, setShippingCost] = useState('4.99');
  const [handlingTime, setHandlingTime] = useState(3);
  const [enableFreeShipping, setEnableFreeShipping] = useState(false);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('100.00');
  const [returnPeriod, setReturnPeriod] = useState(0);
  
  // Best Offer Settings
  const [enableAutoAccept, setEnableAutoAccept] = useState(false);
  const [autoAcceptPercent, setAutoAcceptPercent] = useState(90);

  useEffect(() => {
  loadSubscription();
  loadScanLimit();
  loadEbayStatus();
  loadPaymentMethods();
  loadShippingAddress();
  loadNotificationPreferences();
}, []);

  useEffect(() => {
    if (ebayConnected) {
      loadEbayShippingSettings();
    }
  }, [ebayConnected]);

  const loadSubscription = async () => {
    try {
      const response = await apiFetch('/users/subscription');
      const data = await response.json();
      if (data.subscription) {
        setSubscription(data.subscription);
      }
    } catch (err) {
      console.error('Failed to load subscription:', err);
    } finally {
      setLoadingSub(false);
    }
  };

  const loadScanLimit = async () => {
    try {
      const [scanResponse, statsResponse] = await Promise.all([
        apiFetch('/stripe/scan-limit'),
        apiFetch('/cards/stats')
      ]);
      
      const scanData = await scanResponse.json();
      const statsData = await statsResponse.json();
      
      if (scanData.success) {
        setScanLimit({
          ...scanData,
          totalCards: statsData.stats?.totalCards || 0
        });
      }
    } catch (err) {
      console.error('Failed to load scan limit:', err);
    }
  };

  const loadEbayStatus = async () => {
    try {
      // 🔍 DEBUG: Check if token exists
      const token = localStorage.getItem('token');
      console.log('🔑 Token exists:', !!token);
      console.log('🔑 Token preview:', token ? token.substring(0, 20) + '...' : 'NONE');
      
      // Make the API call
      console.log('📡 Calling getEbaySellerStatus...');
      const data = await cardsAPI.getEbaySellerStatus();
      console.log('✅ eBay status response:', data);
      
      if (data.success) {
        setEbayConnected(data.connected);
        setEbayConnectedAt(data.connectedAt);
        
        // Use policies from status response
        if (data.policies) {
          setEbayPolicies({
            payment: data.policies.paymentPolicyId,
            return: data.policies.returnPolicyId,
            shipping: data.policies.fulfillmentPolicyId
          });
        }
      }
    } catch (err) {
      console.error('❌ Failed to load eBay status:', err);
      console.error('❌ Error response:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
    }
  };

  const loadShippingAddress = async () => {
    try {
      const response = await apiFetch('/shipping/my-address');
      const data = await response.json();
      
      if (data.success && data.address) {
        const a = data.address;
        setShippingName(a.shipping_name || user?.fullName || '');
        setShippingAddress1(a.address_line1 || '');
        setShippingAddress2(a.address_line2 || '');
        setShippingCity(a.city || '');
        setShippingState(a.state || '');
        setShippingZip(a.zip || '');
        setShippingCountry(a.country || 'USA');
      }
    } catch (err) {
      console.error('Failed to load shipping address:', err);
    }
  };

  const loadNotificationPreferences = async () => {
    try {
      const response = await apiFetch('/notifications/preferences');
      const data = await response.json();
      if (data.success && data.preferences) {
        setNotifPrefs(prev => ({ ...prev, ...data.preferences }));
      }
    } catch (err) {
      console.error('Failed to load notification preferences:', err);
    }
  };

  const saveNotificationPreferences = async () => {
    setLoadingNotifPrefs(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await apiFetch('/notifications/preferences', {
        method: 'PUT',
        body: JSON.stringify(notifPrefs)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Notification preferences saved!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to save preferences');
      }
    } catch (err) {
      console.error('Save notification preferences error:', err);
      setError('Failed to save preferences');
    } finally {
      setLoadingNotifPrefs(false);
    }
  };

  const saveShippingAddress = async () => {
    if (!shippingAddress1 || !shippingCity || !shippingState || !shippingZip) {
      setError('Address, city, state, and ZIP are required');
      return;
    }
    
    setLoadingShipping(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await apiFetch('/shipping/update-address', {
        method: 'POST',
        body: JSON.stringify({
          shipping_name: shippingName,
          address_line1: shippingAddress1,
          address_line2: shippingAddress2,
          city: shippingCity,
          state: shippingState,
          zip: shippingZip,
          country: shippingCountry
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Shipping address saved!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to save shipping address');
      }
    } catch (err) {
      console.error('Save shipping address error:', err);
      setError('Failed to save shipping address');
    } finally {
      setLoadingShipping(false);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const response = await apiFetch('/users/payment-methods');
      const data = await response.json();
      
      if (data.success && data.paymentMethods) {
        const p = data.paymentMethods;
        setVenmoUsername(p.venmo_username || '');
        setPaypalEmail(p.paypal_email || '');
        setCashappTag(p.cashapp_tag || '');
        setZelleInfo(p.zelle_info || '');
        setPaymentNotes(p.payment_notes || '');
      }
    } catch (err) {
      console.error('Failed to load payment methods:', err);
    }
  };

  const savePaymentMethods = async () => {
    setLoadingPayment(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await apiFetch('/users/payment-methods', {
        method: 'PUT',
        body: JSON.stringify({
          venmo_username: venmoUsername,
          paypal_email: paypalEmail,
          cashapp_tag: cashappTag,
          zelle_info: zelleInfo,
          payment_notes: paymentNotes
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Payment methods saved!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to save payment methods');
      }
    } catch (err) {
      console.error('Save payment methods error:', err);
      setError('Failed to save payment methods');
    } finally {
      setLoadingPayment(false);
    }
  };

  const loadEbayShippingSettings = async () => {
    try {
      const response = await apiFetch('/users/ebay-shipping-settings');
      const data = await response.json();
      
      if (data.success && data.settings) {
        const s = data.settings;
        setEbayShipCity(s.ebay_ship_from_city || '');
        setEbayShipState(s.ebay_ship_from_state || '');
        setEbayShipZip(s.ebay_ship_from_zip || '');
        setShippingService(s.default_shipping_service || 'USPSFirstClass');
        setShippingCost(s.default_shipping_cost || '4.99');
        setHandlingTime(s.default_handling_time || 3);
        setEnableFreeShipping(s.enable_free_shipping || false);
        setFreeShippingThreshold(s.free_shipping_threshold || '100.00');
        setReturnPeriod(s.default_return_period || 0);
        setEnableAutoAccept(s.enable_auto_accept_offers || false);
        setAutoAcceptPercent(s.auto_accept_percentage || 90);
      }
    } catch (err) {
      console.error('Failed to load eBay shipping settings:', err);
    }
  };

  const handleConnectEbay = async () => {
    setLoadingEbay(true);
    try {
      const data = await cardsAPI.connectEbaySeller();
      
      if (data.success && data.authUrl) {
        // Open eBay OAuth in popup
        const width = 600;
        const height = 700;
        const left = (window.screen.width / 2) - (width / 2);
        const top = (window.screen.height / 2) - (height / 2);
        
        const popup = window.open(
          data.authUrl,
          'eBay OAuth',
          `width=${width},height=${height},left=${left},top=${top}`
        );

        // Poll for popup close and refresh status
        const checkPopup = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkPopup);
            
            // 🔥 WAIT LONGER FOR BACKEND TO FINISH CREATING POLICIES
            setTimeout(async () => {
  console.log('🔄 Refreshing eBay status and user...');
  await loadEbayStatus();
  await refreshUser(); // 🔥 This refreshes the user object with policy IDs
  setLoadingEbay(false);
}, 2000);
          }
        }, 500);
      }
    } catch (err) {
      console.error('Failed to connect eBay:', err);
      setError('Failed to connect eBay seller account');
      setLoadingEbay(false);
    }
  };

  const handleDisconnectEbay = async () => {
    if (!confirm('Are you sure you want to disconnect your eBay seller account?')) {
      return;
    }

    setLoadingEbay(true);
    try {
      const data = await cardsAPI.disconnectEbaySeller();
      
      if (data.success) {
        setSuccess('eBay seller account disconnected');
        setEbayConnected(false);
        setEbayConnectedAt(null);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Failed to disconnect eBay:', err);
      setError('Failed to disconnect eBay seller account');
    } finally {
      setLoadingEbay(false);
    }
  };

  const saveEbayShippingSettings = async () => {
    if (!ebayShipCity || !ebayShipState || !ebayShipZip) {
      setError('City, state, and ZIP are required');
      return;
    }
    
    setLoadingEbay(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await apiFetch('/users/ebay-shipping-settings', {
        method: 'PUT',
        body: JSON.stringify({
          ebay_ship_from_city: ebayShipCity,
          ebay_ship_from_state: ebayShipState,
          ebay_ship_from_zip: ebayShipZip,
          ebay_ship_from_country: 'US',
          default_shipping_cost: parseFloat(shippingCost),
          default_shipping_service: shippingService,
          default_handling_time: parseInt(handlingTime),
          enable_free_shipping: enableFreeShipping,
          free_shipping_threshold: parseFloat(freeShippingThreshold),
          default_returns_accepted: returnPeriod > 0,
          default_return_period: returnPeriod,
          enable_auto_accept_offers: enableAutoAccept,
          auto_accept_percentage: parseInt(autoAcceptPercent)
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('eBay shipping settings saved!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to save settings');
      }
    } catch (err) {
      console.error('Save shipping settings error:', err);
      setError('Failed to save shipping settings');
    } finally {
      setLoadingEbay(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiFetch('/users/profile', {
        method: 'PUT',
        body: JSON.stringify({ fullName, email })
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Profile updated successfully!');
        await refreshUser();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await apiFetch('/users/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to change password');
      }
    } catch (err) {
      setError('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/stripe/portal-session', {
        method: 'POST'
      });

      const data = await response.json();
      
      if (data.url) {
        window.open(data.url, '_blank');
      } else {
        setError('Failed to open billing portal');
      }
    } catch (err) {
      setError('Failed to open billing portal');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch('/users/delete', {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Account deleted successfully');
        logout();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete account');
      }
    } catch (err) {
      setError('Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'payment', label: 'Payment Methods', icon: CreditCard },
    { id: 'shipping', label: 'Shipping Address', icon: Package },
    { id: 'subscription', label: 'Subscription', icon: Crown },
    { id: 'ebay', label: 'eBay Selling', icon: ExternalLink },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'danger', label: 'Danger Zone', icon: AlertCircle }
  ];

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden'>
      {/* Animated background effects */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <Navbar />
      
      <div className='max-w-6xl mx-auto px-4 sm:px-6 py-8 relative z-10'>
        <div className='mb-8'>
          <h2 className='text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400'>Account Settings</h2>
          <p className='text-slate-400'>Manage your profile, subscription, and security</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className='bg-emerald-500/20 border-2 border-emerald-500/50 rounded-xl p-4 mb-6 flex items-center gap-3 backdrop-blur-sm animate-fade-in-up'>
            <Check className='text-emerald-400 animate-bounce' size={22} />
            <p className='text-emerald-400 font-bold'>{success}</p>
          </div>
        )}

        {error && (
          <div className='bg-red-500/20 border-2 border-red-500/50 rounded-xl p-4 mb-6 flex items-center gap-3 backdrop-blur-sm animate-fade-in-up'>
            <AlertCircle className='text-red-400' size={22} />
            <p className='text-red-400 font-bold'>{error}</p>
          </div>
        )}

        <div className='grid md:grid-cols-4 gap-6'>
          {/* Sidebar Tabs - ENHANCED */}
          <div className='md:col-span-1'>
            <div className='bg-slate-800/50 backdrop-blur-xl rounded-2xl p-2 border-2 border-slate-700/50 shadow-xl'>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setError('');
                    setSuccess('');
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all font-medium ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/30'
                      : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <tab.icon size={20} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className='md:col-span-3'>
            {/* Profile Tab - ENHANCED */}
            {activeTab === 'profile' && (
              <div className='bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border-2 border-slate-700/50 shadow-xl hover:border-indigo-500/30 transition-all'>
                <div className='flex items-center gap-3 mb-6'>
                  <div className='p-3 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl shadow-lg'>
                    <User className='text-white' size={24} />
                  </div>
                  <h3 className='text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400'>Profile Information</h3>
                </div>
                <form onSubmit={handleUpdateProfile} className='space-y-6'>
                  <div>
                    <label className='block text-sm font-bold mb-2 text-slate-300 flex items-center gap-2'>
                      <User size={16} className='text-indigo-400' />
                      Full Name
                    </label>
                    <input
                      type='text'
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className='w-full px-4 py-3 bg-slate-900/70 border-2 border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 text-white transition-all'
                      required
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-bold mb-2 text-slate-300 flex items-center gap-2'>
                      <Mail size={16} className='text-indigo-400' />
                      Email
                    </label>
                    <input
                      type='email'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className='w-full px-4 py-3 bg-slate-900/70 border-2 border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 text-white transition-all'
                      required
                    />
                  </div>

                  <Button 
                    type='submit' 
                    disabled={loading} 
                    className='w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-lg hover:shadow-indigo-500/50 transition-all hover:scale-105'
                  >
                    <Save size={18} className='mr-2' />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className='bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border-2 border-slate-700/50 shadow-xl hover:border-indigo-500/30 transition-all'>
                <div className='flex items-center gap-3 mb-6'>
                  <div className='p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg'>
                    <Bell className='text-white' size={24} />
                  </div>
                  <div>
                    <h3 className='text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400'>Notification Preferences</h3>
                    <p className='text-sm text-slate-400'>Choose how you want to be notified</p>
                  </div>
                </div>

                <div className='space-y-6'>
                  {/* Notification Channels */}
                  <div className='bg-slate-900/70 rounded-xl p-5 border-2 border-purple-500/20'>
                    <h4 className='text-lg font-bold text-white mb-4 flex items-center gap-2'>
                      📡 Notification Channels
                    </h4>
                    <div className='space-y-4'>
                      {/* In-Platform */}
                      <label className='flex items-center justify-between p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-all'>
                        <div className='flex items-center gap-3'>
                          <div className='p-2 bg-indigo-500/20 rounded-lg'>
                            <Bell size={20} className='text-indigo-400' />
                          </div>
                          <div>
                            <p className='font-medium text-white'>In-Platform Notifications</p>
                            <p className='text-xs text-slate-400'>See notifications in the bell icon</p>
                          </div>
                        </div>
                        <input
                          type='checkbox'
                          checked={notifPrefs.push_enabled}
                          onChange={(e) => setNotifPrefs(prev => ({ ...prev, push_enabled: e.target.checked }))}
                          className='w-5 h-5 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500'
                        />
                      </label>

                      {/* Email */}
                      <label className='flex items-center justify-between p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-all'>
                        <div className='flex items-center gap-3'>
                          <div className='p-2 bg-blue-500/20 rounded-lg'>
                            <Mail size={20} className='text-blue-400' />
                          </div>
                          <div>
                            <p className='font-medium text-white'>Email Notifications</p>
                            <p className='text-xs text-slate-400'>Receive emails for important updates</p>
                          </div>
                        </div>
                        <input
                          type='checkbox'
                          checked={notifPrefs.email_enabled}
                          onChange={(e) => setNotifPrefs(prev => ({ ...prev, email_enabled: e.target.checked }))}
                          className='w-5 h-5 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500'
                        />
                      </label>
                    </div>
                  </div>

                  {/* Bidding Notifications */}
                  <div className='bg-slate-900/70 rounded-xl p-5 border-2 border-yellow-500/20'>
                    <h4 className='text-lg font-bold text-white mb-4 flex items-center gap-2'>
                      ⚡ Bidding Alerts
                    </h4>
                    <div className='space-y-3'>
                      <label className='flex items-center justify-between p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-all'>
                        <div>
                          <p className='font-medium text-white'>Outbid Alerts</p>
                          <p className='text-xs text-slate-400'>Get notified immediately when someone outbids you</p>
                        </div>
                        <input type='checkbox' checked={notifPrefs.notify_outbid} onChange={(e) => setNotifPrefs(prev => ({ ...prev, notify_outbid: e.target.checked }))} className='w-5 h-5 rounded border-slate-600 bg-slate-800 text-yellow-500 focus:ring-yellow-500' />
                      </label>
                      <label className='flex items-center justify-between p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-all'>
                        <div>
                          <p className='font-medium text-white'>Auction Ending Soon</p>
                          <p className='text-xs text-slate-400'>Reminder before auctions you bid on end</p>
                        </div>
                        <input type='checkbox' checked={notifPrefs.notify_auction_ending} onChange={(e) => setNotifPrefs(prev => ({ ...prev, notify_auction_ending: e.target.checked }))} className='w-5 h-5 rounded border-slate-600 bg-slate-800 text-orange-500 focus:ring-orange-500' />
                      </label>
                    </div>
                  </div>

                  {/* Auction Notifications */}
                  <div className='bg-slate-900/70 rounded-xl p-5 border-2 border-orange-500/20'>
                    <h4 className='text-lg font-bold text-white mb-4 flex items-center gap-2'>
                      🔨 Auction Results
                    </h4>
                    <div className='space-y-3'>
                      <label className='flex items-center justify-between p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-all'>
                        <div>
                          <p className='font-medium text-white'>Auction Won</p>
                          <p className='text-xs text-slate-400'>When you win an auction</p>
                        </div>
                        <input type='checkbox' checked={notifPrefs.notify_auction_won} onChange={(e) => setNotifPrefs(prev => ({ ...prev, notify_auction_won: e.target.checked }))} className='w-5 h-5 rounded border-slate-600 bg-slate-800 text-green-500 focus:ring-green-500' />
                      </label>
                      <label className='flex items-center justify-between p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-all'>
                        <div>
                          <p className='font-medium text-white'>New Bids on Your Auctions</p>
                          <p className='text-xs text-slate-400'>When someone bids on your listings</p>
                        </div>
                        <input type='checkbox' checked={notifPrefs.notify_new_bid_on_my_auction} onChange={(e) => setNotifPrefs(prev => ({ ...prev, notify_new_bid_on_my_auction: e.target.checked }))} className='w-5 h-5 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500' />
                      </label>
                      <label className='flex items-center justify-between p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-all'>
                        <div>
                          <p className='font-medium text-white'>Auction Sold</p>
                          <p className='text-xs text-slate-400'>When your auction sells</p>
                        </div>
                        <input type='checkbox' checked={notifPrefs.notify_auction_sold} onChange={(e) => setNotifPrefs(prev => ({ ...prev, notify_auction_sold: e.target.checked }))} className='w-5 h-5 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500' />
                      </label>
                    </div>
                  </div>

                  {/* Transaction Notifications */}
                  <div className='bg-slate-900/70 rounded-xl p-5 border-2 border-green-500/20'>
                    <h4 className='text-lg font-bold text-white mb-4 flex items-center gap-2'>
                      💳 Transaction Updates
                    </h4>
                    <div className='space-y-3'>
                      <label className='flex items-center justify-between p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-all'>
                        <div>
                          <p className='font-medium text-white'>Payment Received</p>
                          <p className='text-xs text-slate-400'>When buyer sends payment (sellers)</p>
                        </div>
                        <input type='checkbox' checked={notifPrefs.notify_payment_received} onChange={(e) => setNotifPrefs(prev => ({ ...prev, notify_payment_received: e.target.checked }))} className='w-5 h-5 rounded border-slate-600 bg-slate-800 text-green-500 focus:ring-green-500' />
                      </label>
                      <label className='flex items-center justify-between p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-all'>
                        <div>
                          <p className='font-medium text-white'>Item Shipped</p>
                          <p className='text-xs text-slate-400'>When seller ships your purchase</p>
                        </div>
                        <input type='checkbox' checked={notifPrefs.notify_item_shipped} onChange={(e) => setNotifPrefs(prev => ({ ...prev, notify_item_shipped: e.target.checked }))} className='w-5 h-5 rounded border-slate-600 bg-slate-800 text-purple-500 focus:ring-purple-500' />
                      </label>
                      <label className='flex items-center justify-between p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-all'>
                        <div>
                          <p className='font-medium text-white'>Item Delivered</p>
                          <p className='text-xs text-slate-400'>When your package is delivered</p>
                        </div>
                        <input type='checkbox' checked={notifPrefs.notify_item_delivered} onChange={(e) => setNotifPrefs(prev => ({ ...prev, notify_item_delivered: e.target.checked }))} className='w-5 h-5 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500' />
                      </label>
                      <label className='flex items-center justify-between p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-all'>
                        <div>
                          <p className='font-medium text-white'>New Messages</p>
                          <p className='text-xs text-slate-400'>When you receive transaction messages</p>
                        </div>
                        <input type='checkbox' checked={notifPrefs.notify_new_message} onChange={(e) => setNotifPrefs(prev => ({ ...prev, notify_new_message: e.target.checked }))} className='w-5 h-5 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500' />
                      </label>
                    </div>
                  </div>

                  {/* Player Watchlist - Coming Soon */}
                  <div className='bg-slate-900/70 rounded-xl p-5 border-2 border-slate-700 opacity-60'>
                    <div className='flex items-center justify-between mb-4'>
                      <h4 className='text-lg font-bold text-white flex items-center gap-2'>
                        👀 Player Watchlist
                      </h4>
                      <span className='text-xs bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded-full font-medium'>Coming Soon</span>
                    </div>
                    <p className='text-sm text-slate-400 mb-4'>
                      Get notified when cards of your favorite players go up for auction. Add players to your watchlist and never miss a deal!
                    </p>
                    <div className='flex flex-wrap gap-2'>
                      <span className='px-3 py-1.5 bg-slate-800 rounded-full text-sm text-slate-500 border border-slate-700'>+ Add Player</span>
                    </div>
                  </div>

                  <Button 
                    onClick={saveNotificationPreferences}
                    disabled={loadingNotifPrefs}
                    className='w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-105'
                  >
                    <Save size={18} className='mr-2' />
                    {loadingNotifPrefs ? 'Saving...' : 'Save Notification Preferences'}
                  </Button>

                  <div className='p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20'>
                    <p className='text-xs text-slate-400 text-center'>
                      💡 Notifications help you stay on top of your auctions and never miss a deal!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Subscription Tab - ENHANCED */}
            {activeTab === 'subscription' && (
              <div className='bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border-2 border-slate-700/50 shadow-xl hover:border-indigo-500/30 transition-all'>
                <div className='flex items-center gap-3 mb-6'>
                  <div className='p-3 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl shadow-lg'>
                    <CreditCard className='text-white' size={24} />
                  </div>
                  <h3 className='text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400'>Subscription & Billing</h3>
                </div>
                
                {loadingSub ? (
                  <div className='text-center py-16'>
                    <div className='relative inline-block'>
                      <div className='animate-spin rounded-full h-12 w-12 border-4 border-indigo-500/30 border-t-indigo-500'></div>
                      <div className='absolute inset-0 flex items-center justify-center'>
                        <Shield className='text-indigo-400 animate-pulse' size={20} />
                      </div>
                    </div>
                    <p className='text-slate-400 mt-4 font-medium'>Loading subscription...</p>
                  </div>
                ) : (
                  <div className='space-y-6'>
                    {/* Current Plan - ENHANCED */}
                    <div className={`rounded-2xl p-6 border-2 relative overflow-hidden ${
                      user?.subscriptionTier === 'premium' 
                        ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/50 shadow-lg shadow-yellow-500/20'
                        : user?.subscriptionTier === 'pro'
                        ? 'bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border-indigo-500/50 shadow-lg shadow-indigo-500/20'
                        : 'bg-slate-900/50 border-slate-700/50'
                    }`}>
                      <div className='absolute top-0 right-0 p-4'>
                        {user?.subscriptionTier === 'premium' && <Crown className='text-yellow-400' size={32} />}
                        {user?.subscriptionTier === 'pro' && <Zap className='text-indigo-400' size={32} />}
                      </div>
                      
                      <div className='flex items-center justify-between mb-4'>
                        <div>
                          <p className='text-sm text-slate-400 mb-1 font-medium'>Current Plan</p>
                          <h4 className='text-4xl font-black capitalize text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400'>
                            {user?.subscriptionTier}
                          </h4>
                        </div>
                        <div className='text-right'>
                          <p className='text-sm text-slate-400 mb-2 font-medium'>Status</p>
                          <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold border-2 ${
                            user?.subscriptionStatus === 'active' 
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' 
                              : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                          }`}>
                            {user?.subscriptionStatus || 'Active'}
                          </span>
                        </div>
                      </div>

                      {subscription?.nextBillingDate && (
                        <p className='text-sm text-slate-400 font-medium'>
                          Next billing date: <span className='text-white'>{new Date(subscription.nextBillingDate).toLocaleDateString()}</span>
                        </p>
                      )}
                    </div>

                    {/* Plan Features - ENHANCED */}
                    <div className='grid sm:grid-cols-2 gap-4'>
                      <div className='bg-slate-900/70 backdrop-blur-sm rounded-xl p-5 border-2 border-indigo-500/20 hover:border-indigo-500/40 transition-all'>
                        <p className='text-xs text-slate-400 mb-2 font-bold uppercase'>Scans Used</p>
                        <p className='text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400'>
                          {scanLimit ? (
                            <>{scanLimit.used} / {scanLimit.limit}</>
                          ) : (
                            '...'
                          )}
                        </p>
                      </div>
                      <div className='bg-slate-900/70 backdrop-blur-sm rounded-xl p-5 border-2 border-purple-500/20 hover:border-purple-500/40 transition-all'>
                        <p className='text-xs text-slate-400 mb-2 font-bold uppercase'>Total Cards</p>
                        <p className='text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400'>
                          {scanLimit?.totalCards || user?.cardCount || 0}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className='space-y-3'>
                      {user?.subscriptionTier !== 'free' && (
                        <Button
                          onClick={handleManageSubscription}
                          disabled={loading}
                          className='w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-lg hover:shadow-indigo-500/50 transition-all hover:scale-105'
                        >
                          <ExternalLink size={18} className='mr-2' />
                          Manage Subscription & Billing
                        </Button>
                      )}

                      {user?.subscriptionTier === 'free' && (
                        <Button
                          onClick={() => window.location.href = '/pricing'}
                          className='w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-lg hover:shadow-indigo-500/50 transition-all hover:scale-105'
                        >
                          <Zap size={18} className='mr-2' />
                          Upgrade to Pro
                        </Button>
                      )}

                      {user?.subscriptionTier === 'pro' && (
                        <Button
                          variant='secondary'
                          onClick={() => window.location.href = '/pricing'}
                          className='w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 shadow-lg hover:shadow-yellow-500/50 transition-all hover:scale-105'
                        >
                          <Crown size={18} className='mr-2' />
                          Upgrade to Premium
                        </Button>
                      )}
                    </div>

                    <div className='p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20'>
                      <p className='text-xs text-slate-400 text-center'>
                        Changes to your subscription will take effect immediately. View full pricing details on our pricing page.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* eBay Selling Tab */}
            {activeTab === 'ebay' && (
              <div className='bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border-2 border-slate-700/50 shadow-xl hover:border-indigo-500/30 transition-all'>
                <div className='flex items-center gap-3 mb-6'>
                  <div className='p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg'>
                    <ExternalLink className='text-white' size={24} />
                  </div>
                  <h3 className='text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400'>eBay Seller Integration</h3>
                </div>

                <div className='space-y-6'>
                  {/* Connection Status */}
                  <div className={`rounded-2xl p-6 border-2 ${
                    ebayConnected 
                      ? 'bg-emerald-500/10 border-emerald-500/50' 
                      : 'bg-slate-900/50 border-slate-700/50'
                  }`}>
                    <div className='flex items-center justify-between mb-4'>
                      <div>
                        <p className='text-sm text-slate-400 mb-1 font-medium'>Connection Status</p>
                        <div className='flex items-center gap-2'>
                          {ebayConnected ? (
                            <>
                              <div className='w-3 h-3 bg-emerald-400 rounded-full animate-pulse'></div>
                              <h4 className='text-2xl font-black text-emerald-400'>Connected</h4>
                            </>
                          ) : (
                            <>
                              <div className='w-3 h-3 bg-slate-500 rounded-full'></div>
                              <h4 className='text-2xl font-black text-slate-400'>Not Connected</h4>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {ebayConnected && (
                        <svg className='w-16 h-16 text-emerald-400' fill='currentColor' viewBox='0 0 24 24'>
                          <path d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z'/>
                        </svg>
                      )}
                    </div>

                    {ebayConnected && ebayConnectedAt && (
                      <p className='text-sm text-slate-400'>
                        Connected on: <span className='text-white font-medium'>{new Date(ebayConnectedAt).toLocaleDateString()}</span>
                      </p>
                    )}
                  </div>

                  {/* Business Policies Status (NEW!) */}
                  {ebayConnected && (
                    <div className='bg-slate-900/70 rounded-xl p-6 border-2 border-slate-700'>
                      <h4 className='text-sm font-bold text-white mb-4 flex items-center gap-2'>
                        <Shield size={16} className='text-cyan-400' />
                        Business Policies
                      </h4>
                      <div className='space-y-2'>
                        <div className='flex items-center justify-between text-sm'>
  <span className='text-slate-400'>Payment Policy</span>
  {ebayConnected && ebayPolicies.payment ? (
    <div className='flex items-center gap-2'>
      <Check size={16} className='text-green-400' />
      <span className='text-green-400 text-xs'>Configured</span>
    </div>
  ) : user?.ebay_payment_policy_id && !ebayConnected ? (
    <div className='flex items-center gap-2'>
      <AlertCircle className='text-orange-400' size={16} />
      <span className='text-orange-400 text-xs'>Reconnect Required</span>
    </div>
  ) : (
    <div className='flex items-center gap-2'>
      <AlertCircle className='text-yellow-400' size={16} />
      <span className='text-yellow-400 text-xs'>Missing</span>
    </div>
  )}
</div>
                        <div className='flex items-center justify-between text-sm'>
  <span className='text-slate-400'>Return Policy</span>
  {ebayConnected && ebayPolicies.return ? (
    <div className='flex items-center gap-2'>
      <Check size={16} className='text-green-400' />
      <span className='text-green-400 text-xs'>Configured</span>
    </div>
  ) : user?.ebay_return_policy_id && !ebayConnected ? (
    <div className='flex items-center gap-2'>
      <AlertCircle className='text-orange-400' size={16} />
      <span className='text-orange-400 text-xs'>Reconnect Required</span>
    </div>
  ) : (
    <div className='flex items-center gap-2'>
      <AlertCircle className='text-yellow-400' size={16} />
      <span className='text-yellow-400 text-xs'>Missing</span>
    </div>
  )}
</div>
                        <div className='flex items-center justify-between text-sm'>
  <span className='text-slate-400'>Shipping Policy</span>
  {ebayConnected && ebayPolicies.shipping ? (
    <div className='flex items-center gap-2'>
      <Check size={16} className='text-green-400' />
      <span className='text-green-400 text-xs'>Configured</span>
    </div>
  ) : user?.ebay_fulfillment_policy_id && !ebayConnected ? (
    <div className='flex items-center gap-2'>
      <AlertCircle className='text-orange-400' size={16} />
      <span className='text-orange-400 text-xs'>Reconnect Required</span>
    </div>
  ) : (
    <div className='flex items-center gap-2'>
      <AlertCircle className='text-yellow-400' size={16} />
      <span className='text-yellow-400 text-xs'>Missing</span>
    </div>
  )}
</div>
                      </div>
                      
                      {/* Warning: Policies exist but connection expired */}
{(ebayPolicies.payment && ebayPolicies.return && ebayPolicies.shipping) && !ebayConnected && (
  <div className='mt-4 p-3 bg-orange-500/10 rounded-lg border border-orange-500/30'>
    <p className='text-xs text-orange-400 mb-3'>
      <strong>⚠️ Reconnection Required:</strong> Your eBay connection has expired but your policies are still configured.
    </p>
    <Button 
      onClick={async () => {
        setLoadingEbay(true);
        await handleDisconnectEbay();
        setTimeout(async () => {
          await handleConnectEbay();
        }, 1000);
      }}
      disabled={loadingEbay}
      size='sm'
      className='w-full bg-orange-600 hover:bg-orange-500 text-xs'
    >
      {loadingEbay ? '⏳ Reconnecting...' : '🔄 Reconnect eBay Now'}
    </Button>
  </div>
)}

{/* Warning: Policies missing */}
{(!ebayPolicies.payment || !ebayPolicies.return || !ebayPolicies.shipping) && ebayConnected && (
  <div className='mt-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30'>
    <p className='text-xs text-yellow-400 mb-2'>
      <strong>⚠️ Action Required:</strong> Business policies missing
    </p>
    <div className='space-y-2'>
      <Button 
        onClick={async () => {
          try {
            setLoadingEbay(true);
            setError('');
            console.log('🔧 Fixing eBay policies...');
            
            const response = await apiFetch('/ebay/fix-policies');
            const data = await response.json();
            
            if (data.success) {
              console.log('✅ Policies fixed:', data);
              setSuccess('eBay policies configured successfully!');
              await refreshUser();
              await loadEbayStatus();
              setTimeout(() => setSuccess(''), 3000);
            } else {
              setError(data.error || 'Failed to fix policies');
            }
          } catch (err) {
            console.error('❌ Fix policies error:', err);
            setError('Failed to configure policies. Try reconnecting eBay.');
          } finally {
            setLoadingEbay(false);
          }
        }}
        disabled={loadingEbay}
        size='sm'
        className='w-full bg-cyan-600 hover:bg-cyan-500 text-xs'
      >
        {loadingEbay ? '⏳ Fixing Policies...' : '🔧 Fix Policies Now'}
      </Button>
      
      <Button 
        onClick={async () => {
          setLoadingEbay(true);
          await handleDisconnectEbay();
          setTimeout(async () => {
            await handleConnectEbay();
          }, 1500);
        }}
        disabled={loadingEbay}
        size='sm'
        variant='secondary'
        className='w-full text-xs'
      >
        Or Reconnect eBay Account
      </Button>
    </div>
  </div>
)}
                    </div>
                  )}

                  {/* eBay Shipping Settings */}
                  {ebayConnected && (
                    <div className='bg-slate-900/70 rounded-xl p-6 border-2 border-slate-700 mt-6'>
                      <h4 className='text-lg font-bold text-white mb-2 flex items-center gap-2'>
                        <svg className='w-5 h-5 text-cyan-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                        </svg>
                        Shipping Settings
                      </h4>
                      <p className='text-xs text-slate-400 mb-4'>
                        Configure your default shipping options for eBay listings
                      </p>
                      
                      {/* Ship From Location */}
                      <div className='mb-6'>
                        <h5 className='text-sm font-bold text-white mb-3 flex items-center gap-2'>
                          📍 Ships From Location
                        </h5>
                        <p className='text-xs text-slate-400 mb-3'>
                          This appears on your eBay listings. We only store City, State, and ZIP (no street address).
                        </p>
                        
                        <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                          <div>
                            <label className='block text-xs text-slate-400 mb-1'>City *</label>
                            <input 
                              type="text" 
                              value={ebayShipCity}
                              onChange={(e) => setEbayShipCity(e.target.value)}
                              placeholder="Dallas"
                              className='w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white'
                              required
                            />
                          </div>
                          
                          <div>
                            <label className='block text-xs text-slate-400 mb-1'>State *</label>
                            <select 
                              value={ebayShipState}
                              onChange={(e) => setEbayShipState(e.target.value)}
                              className='w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white'
                              required
                            >
                              <option value="">Select State</option>
                              <option value="AL">Alabama</option>
                              <option value="AK">Alaska</option>
                              <option value="AZ">Arizona</option>
                              <option value="AR">Arkansas</option>
                              <option value="CA">California</option>
                              <option value="CO">Colorado</option>
                              <option value="CT">Connecticut</option>
                              <option value="DE">Delaware</option>
                              <option value="FL">Florida</option>
                              <option value="GA">Georgia</option>
                              <option value="HI">Hawaii</option>
                              <option value="ID">Idaho</option>
                              <option value="IL">Illinois</option>
                              <option value="IN">Indiana</option>
                              <option value="IA">Iowa</option>
                              <option value="KS">Kansas</option>
                              <option value="KY">Kentucky</option>
                              <option value="LA">Louisiana</option>
                              <option value="ME">Maine</option>
                              <option value="MD">Maryland</option>
                              <option value="MA">Massachusetts</option>
                              <option value="MI">Michigan</option>
                              <option value="MN">Minnesota</option>
                              <option value="MS">Mississippi</option>
                              <option value="MO">Missouri</option>
                              <option value="MT">Montana</option>
                              <option value="NE">Nebraska</option>
                              <option value="NV">Nevada</option>
                              <option value="NH">New Hampshire</option>
                              <option value="NJ">New Jersey</option>
                              <option value="NM">New Mexico</option>
                              <option value="NY">New York</option>
                              <option value="NC">North Carolina</option>
                              <option value="ND">North Dakota</option>
                              <option value="OH">Ohio</option>
                              <option value="OK">Oklahoma</option>
                              <option value="OR">Oregon</option>
                              <option value="PA">Pennsylvania</option>
                              <option value="RI">Rhode Island</option>
                              <option value="SC">South Carolina</option>
                              <option value="SD">South Dakota</option>
                              <option value="TN">Tennessee</option>
                              <option value="TX">Texas</option>
                              <option value="UT">Utah</option>
                              <option value="VT">Vermont</option>
                              <option value="VA">Virginia</option>
                              <option value="WA">Washington</option>
                              <option value="WV">West Virginia</option>
                              <option value="WI">Wisconsin</option>
                              <option value="WY">Wyoming</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className='block text-xs text-slate-400 mb-1'>ZIP Code *</label>
                            <input 
                              type="text" 
                              value={ebayShipZip}
                              onChange={(e) => setEbayShipZip(e.target.value)}
                              placeholder="75001"
                              maxLength={10}
                              className='w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white'
                              required
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Shipping Service & Cost */}
                      <div className='mb-6'>
                        <h5 className='text-sm font-bold text-white mb-3 flex items-center gap-2'>
                          📦 Default Shipping Options
                        </h5>
                        <p className='text-xs text-slate-400 mb-3'>
                          These are auto-applied based on card value, but you can customize per-listing
                        </p>
                        
                        <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3'>
                          <div>
                            <label className='block text-xs text-slate-400 mb-1'>Shipping Service</label>
                            <select 
                              value={shippingService}
                              onChange={(e) => setShippingService(e.target.value)}
                              className='w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white'
                            >
                              <option value="USPSFirstClass">USPS First Class</option>
                              <option value="USPSPriority">USPS Priority Mail</option>
                              <option value="USPSPriorityExpress">USPS Priority Express</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className='block text-xs text-slate-400 mb-1'>Handling Time</label>
                            <select 
                              value={handlingTime}
                              onChange={(e) => setHandlingTime(parseInt(e.target.value))}
                              className='w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white'
                            >
                              <option value={1}>1 business day (Same day)</option>
                              <option value={2}>2 business days</option>
                              <option value={3}>3 business days (Standard)</option>
                              <option value={4}>4 business days</option>
                              <option value={5}>5 business days</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className='block text-xs text-slate-400 mb-1'>Default Shipping Cost</label>
                            <input 
                              type="number" 
                              step="0.01"
                              value={shippingCost}
                              onChange={(e) => setShippingCost(e.target.value)}
                              placeholder="4.99"
                              className='w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white'
                            />
                          </div>
                        </div>
                        
                        <div className='p-3 bg-blue-500/10 rounded-lg border border-blue-500/30 mb-3'>
                          <p className='text-xs text-blue-400'>
                            💡 <strong>Default Shipping Cost:</strong> This is the default that appears when creating listings. You can override it per batch in the listing modal.
                          </p>
                        </div>
                        
                        {/* Free Shipping Threshold */}
                        <label className='flex items-center gap-2 mb-2'>
                          <input 
                            type="checkbox"
                            checked={enableFreeShipping}
                            onChange={(e) => setEnableFreeShipping(e.target.checked)}
                            className='w-4 h-4'
                          />
                          <span className='text-sm text-slate-300'>Offer free shipping on cards over $</span>
                          <input 
                            type="number"
                            value={freeShippingThreshold}
                            onChange={(e) => setFreeShippingThreshold(e.target.value)}
                            disabled={!enableFreeShipping}
                            className='w-20 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-sm text-white disabled:opacity-50'
                          />
                        </label>
                        <p className='text-xs text-slate-500 ml-6'>
                          High-value cards often sell better with free shipping
                        </p>
                      </div>
                      
                      {/* Returns Policy */}
                      <div className='mb-6'>
                        <h5 className='text-sm font-bold text-white mb-3 flex items-center gap-2'>
                          ↩️ Returns Policy
                        </h5>
                        
                        <select 
                          value={returnPeriod}
                          onChange={(e) => setReturnPeriod(parseInt(e.target.value))}
                          className='w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white'
                        >
                          <option value={0}>No Returns Accepted (Recommended for Cards)</option>
                          <option value={30}>30-Day Returns Accepted</option>
                          <option value={60}>60-Day Returns Accepted</option>
                        </select>
                        
                        <p className='text-xs text-slate-400 mt-2'>
                          💡 Most card sellers don't accept returns due to authenticity concerns
                        </p>
                      </div>

                      {/* Best Offer Settings */}
                      <div className='mb-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700'>
                        <h4 className='text-sm font-bold mb-3 text-slate-300 flex items-center gap-2'>
                          <span className='text-green-400'>📊</span>
                          Best Offer Settings
                        </h4>
                        
                        <div className='mb-3'>
                          <label className='flex items-center gap-2 cursor-pointer'>
                            <input
                              type='checkbox'
                              checked={enableAutoAccept}
                              onChange={(e) => setEnableAutoAccept(e.target.checked)}
                              className='w-4 h-4 rounded border-slate-700 bg-slate-800 text-green-500 focus:ring-green-500 focus:ring-offset-slate-900'
                            />
                            <span className='text-sm text-slate-300'>Enable Auto-Accept Offers</span>
                          </label>
                        </div>
                        
                        {enableAutoAccept && (
                          <div className='ml-6 mb-3'>
                            <label className='block text-xs text-slate-400 mb-2'>
                              Auto-accept offers at
                            </label>
                            <div className='flex items-center gap-2'>
                              <input
                                type='number'
                                min='70'
                                max='100'
                                value={autoAcceptPercent}
                                onChange={(e) => setAutoAcceptPercent(parseInt(e.target.value))}
                                className='w-20 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white'
                              />
                              <span className='text-sm text-slate-400'>% of listing price</span>
                            </div>
                          </div>
                        )}
                        
                        <div className='p-3 bg-slate-900/50 rounded-lg border border-slate-700'>
                          <p className='text-xs text-slate-400 mb-2'>
                            <strong className='text-green-400'>✅ Always On:</strong>
                          </p>
                          <ul className='text-xs text-slate-400 space-y-1 ml-4'>
                            <li>• Buyers can make offers on all listings</li>
                            <li>• Auto-decline offers below 70% (prevents lowballs)</li>
                          </ul>
                          
                          {enableAutoAccept && (
                            <>
                              <p className='text-xs text-slate-400 mt-3 mb-2'>
                                <strong className='text-cyan-400'>⚡ When Enabled:</strong>
                              </p>
                              <ul className='text-xs text-slate-400 space-y-1 ml-4'>
                                <li>• Automatically accept offers at {autoAcceptPercent}% or higher</li>
                                <li>• Sells faster, but you might get less than asking price</li>
                              </ul>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <Button 
                        onClick={saveEbayShippingSettings}
                        disabled={loadingEbay || !ebayShipCity || !ebayShipState || !ebayShipZip}
                        className='w-full bg-cyan-600 hover:bg-cyan-500'
                      >
                        {loadingEbay ? 'Saving...' : 'Save Shipping Settings'}
                      </Button>
                      
                      <div className='mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30'>
                        <p className='text-xs text-blue-400'>
                          <strong>📝 Note:</strong> You can override these settings for individual cards when listing. Advanced options can be edited directly on eBay after listing.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Features List */}
                  <div className='bg-slate-900/70 rounded-xl p-6 border-2 border-blue-500/20'>
                    <h4 className='text-lg font-bold text-white mb-4 flex items-center gap-2'>
                      <Zap size={20} className='text-blue-400' />
                      What You Can Do:
                    </h4>
                    <ul className='space-y-3'>
                      {[
                        'List cards directly on eBay from SlabTrack',
                        'Auto-generate optimized titles and descriptions',
                        'Use AI-powered pricing suggestions',
                        'Upload card images automatically',
                        'Track all your eBay listings in one place'
                      ].map((feature, i) => (
                        <li key={i} className='flex items-start gap-3 text-slate-300'>
                          <Check size={20} className='text-emerald-400 flex-shrink-0 mt-0.5' />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className='space-y-3'>
                    {!ebayConnected ? (
                      <Button
                        onClick={handleConnectEbay}
                        disabled={loadingEbay}
                        className='w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-lg hover:shadow-blue-500/50 transition-all hover:scale-105'
                      >
                        <ExternalLink size={18} className='mr-2' />
                        {loadingEbay ? 'Connecting...' : 'Connect eBay Seller Account'}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleDisconnectEbay}
                        disabled={loadingEbay}
                        variant='secondary'
                        className='w-full bg-slate-700 hover:bg-slate-600 border-2 border-slate-600'
                      >
                        {loadingEbay ? 'Disconnecting...' : 'Disconnect eBay Account'}
                      </Button>
                    )}
                  </div>

                  {/* Info Box */}
                  <div className='p-4 bg-blue-500/10 rounded-xl border border-blue-500/20'>
                    <p className='text-xs text-slate-400 text-center'>
                      <strong className='text-blue-400'>Privacy Note:</strong> We only request permissions to list items on your behalf. We never access your buyer information or purchase history.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Methods Tab */}
            {activeTab === 'payment' && (
              <div className='bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border-2 border-slate-700/50 shadow-xl hover:border-indigo-500/30 transition-all'>
                <div className='flex items-center gap-3 mb-6'>
                  <div className='p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg'>
                    <CreditCard className='text-white' size={24} />
                  </div>
                  <div>
                    <h3 className='text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400'>Payment Methods</h3>
                    <p className='text-sm text-slate-400'>How buyers can pay you for won auctions</p>
                  </div>
                </div>

                <div className='space-y-6'>
                  {/* Venmo */}
                  <div>
                    <label className='block text-sm font-bold mb-2 text-slate-300 flex items-center gap-2'>
                      <span className='text-2xl'>💳</span>
                      Venmo Username
                    </label>
                    <div className='flex'>
                      <span className='px-4 py-3 bg-slate-900 border-2 border-r-0 border-slate-700 rounded-l-xl text-slate-400'>@</span>
                      <input
                        type='text'
                        value={venmoUsername}
                        onChange={(e) => setVenmoUsername(e.target.value.replace('@', ''))}
                        placeholder='yourvenmo'
                        className='flex-1 px-4 py-3 bg-slate-900/70 border-2 border-slate-700 rounded-r-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30 text-white transition-all'
                      />
                    </div>
                  </div>

                  {/* PayPal */}
                  <div>
                    <label className='block text-sm font-bold mb-2 text-slate-300 flex items-center gap-2'>
                      <span className='text-2xl'>🅿️</span>
                      PayPal Email
                    </label>
                    <input
                      type='email'
                      value={paypalEmail}
                      onChange={(e) => setPaypalEmail(e.target.value)}
                      placeholder='you@email.com'
                      className='w-full px-4 py-3 bg-slate-900/70 border-2 border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 text-white transition-all'
                    />
                    <p className='text-xs text-slate-500 mt-1'>PayPal.me link will be auto-generated</p>
                  </div>

                  {/* CashApp */}
                  <div>
                    <label className='block text-sm font-bold mb-2 text-slate-300 flex items-center gap-2'>
                      <span className='text-2xl'>💵</span>
                      Cash App Tag
                    </label>
                    <div className='flex'>
                      <span className='px-4 py-3 bg-slate-900 border-2 border-r-0 border-slate-700 rounded-l-xl text-slate-400'>$</span>
                      <input
                        type='text'
                        value={cashappTag}
                        onChange={(e) => setCashappTag(e.target.value.replace('$', ''))}
                        placeholder='yourcashtag'
                        className='flex-1 px-4 py-3 bg-slate-900/70 border-2 border-slate-700 rounded-r-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30 text-white transition-all'
                      />
                    </div>
                  </div>

                  {/* Zelle */}
                  <div>
                    <label className='block text-sm font-bold mb-2 text-slate-300 flex items-center gap-2'>
                      <span className='text-2xl'>⚡</span>
                      Zelle (Email or Phone)
                    </label>
                    <input
                      type='text'
                      value={zelleInfo}
                      onChange={(e) => setZelleInfo(e.target.value)}
                      placeholder='email@example.com or (555) 123-4567'
                      className='w-full px-4 py-3 bg-slate-900/70 border-2 border-slate-700 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 text-white transition-all'
                    />
                  </div>

                  {/* Payment Notes */}
                  <div>
                    <label className='block text-sm font-bold mb-2 text-slate-300 flex items-center gap-2'>
                      <span className='text-2xl'>📝</span>
                      Payment Notes (Optional)
                    </label>
                    <textarea
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                      placeholder='e.g., "Please include your username in payment notes" or "F&F preferred, add 3% for G&S"'
                      rows={3}
                      className='w-full px-4 py-3 bg-slate-900/70 border-2 border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 text-white transition-all resize-none'
                    />
                  </div>

                  {/* Preview */}
                  {(venmoUsername || paypalEmail || cashappTag || zelleInfo) && (
                    <div className='bg-slate-900/70 rounded-xl p-5 border-2 border-emerald-500/30'>
                      <h4 className='text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2'>
                        👀 Preview (shown to buyers)
                      </h4>
                      <div className='space-y-2 text-sm'>
                        {venmoUsername && (
                          <p className='text-slate-300'>💳 Venmo: <span className='text-white font-medium'>@{venmoUsername}</span></p>
                        )}
                        {paypalEmail && (
                          <p className='text-slate-300'>🅿️ PayPal: <span className='text-white font-medium'>{paypalEmail}</span></p>
                        )}
                        {cashappTag && (
                          <p className='text-slate-300'>💵 Cash App: <span className='text-white font-medium'>${cashappTag}</span></p>
                        )}
                        {zelleInfo && (
                          <p className='text-slate-300'>⚡ Zelle: <span className='text-white font-medium'>{zelleInfo}</span></p>
                        )}
                        {paymentNotes && (
                          <p className='text-slate-400 text-xs mt-2 italic'>"{paymentNotes}"</p>
                        )}
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={savePaymentMethods}
                    disabled={loadingPayment}
                    className='w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-lg hover:shadow-green-500/50 transition-all hover:scale-105'
                  >
                    <Save size={18} className='mr-2' />
                    {loadingPayment ? 'Saving...' : 'Save Payment Methods'}
                  </Button>

                  <div className='p-4 bg-blue-500/10 rounded-xl border border-blue-500/20'>
                    <p className='text-xs text-slate-400 text-center'>
                      💡 These payment methods will be shown to auction winners so they know how to pay you.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Shipping Address Tab */}
            {activeTab === 'shipping' && (
              <div className='bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border-2 border-slate-700/50 shadow-xl hover:border-indigo-500/30 transition-all'>
                <div className='flex items-center gap-3 mb-6'>
                  <div className='p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-lg'>
                    <Package className='text-white' size={24} />
                  </div>
                  <div>
                    <h3 className='text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400'>Shipping Address</h3>
                    <p className='text-sm text-slate-400'>Your return address for auction shipping labels</p>
                  </div>
                </div>

                <div className='space-y-6'>
                  {/* Return Name */}
                  <div>
                    <label className='block text-sm font-bold mb-2 text-slate-300 flex items-center gap-2'>
                      <User size={16} className='text-orange-400' />
                      Return Name (Personal or Business)
                    </label>
                    <input
                      type='text'
                      value={shippingName}
                      onChange={(e) => setShippingName(e.target.value)}
                      placeholder='John Smith or My Card Shop LLC'
                      className='w-full px-4 py-3 bg-slate-900/70 border-2 border-slate-700 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 text-white transition-all'
                    />
                    <p className='text-xs text-slate-500 mt-1'>This name appears on your shipping labels</p>
                  </div>

                  {/* Address Line 1 */}
                  <div>
                    <label className='block text-sm font-bold mb-2 text-slate-300'>
                      Street Address *
                    </label>
                    <input
                      type='text'
                      value={shippingAddress1}
                      onChange={(e) => setShippingAddress1(e.target.value)}
                      placeholder='123 Main Street'
                      className='w-full px-4 py-3 bg-slate-900/70 border-2 border-slate-700 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 text-white transition-all'
                      required
                    />
                  </div>

                  {/* Address Line 2 */}
                  <div>
                    <label className='block text-sm font-bold mb-2 text-slate-300'>
                      Apt, Suite, Unit (Optional)
                    </label>
                    <input
                      type='text'
                      value={shippingAddress2}
                      onChange={(e) => setShippingAddress2(e.target.value)}
                      placeholder='Apt 4B'
                      className='w-full px-4 py-3 bg-slate-900/70 border-2 border-slate-700 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 text-white transition-all'
                    />
                  </div>

                  {/* City, State, ZIP */}
                  <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                    <div>
                      <label className='block text-sm font-bold mb-2 text-slate-300'>City *</label>
                      <input
                        type='text'
                        value={shippingCity}
                        onChange={(e) => setShippingCity(e.target.value)}
                        placeholder='Dallas'
                        className='w-full px-4 py-3 bg-slate-900/70 border-2 border-slate-700 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 text-white transition-all'
                        required
                      />
                    </div>
                    
                    <div>
                      <label className='block text-sm font-bold mb-2 text-slate-300'>State *</label>
                      <select
                        value={shippingState}
                        onChange={(e) => setShippingState(e.target.value)}
                        className='w-full px-4 py-3 bg-slate-900/70 border-2 border-slate-700 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 text-white transition-all'
                        required
                      >
                        <option value="">Select</option>
                        <option value="AL">Alabama</option>
                        <option value="AK">Alaska</option>
                        <option value="AZ">Arizona</option>
                        <option value="AR">Arkansas</option>
                        <option value="CA">California</option>
                        <option value="CO">Colorado</option>
                        <option value="CT">Connecticut</option>
                        <option value="DE">Delaware</option>
                        <option value="FL">Florida</option>
                        <option value="GA">Georgia</option>
                        <option value="HI">Hawaii</option>
                        <option value="ID">Idaho</option>
                        <option value="IL">Illinois</option>
                        <option value="IN">Indiana</option>
                        <option value="IA">Iowa</option>
                        <option value="KS">Kansas</option>
                        <option value="KY">Kentucky</option>
                        <option value="LA">Louisiana</option>
                        <option value="ME">Maine</option>
                        <option value="MD">Maryland</option>
                        <option value="MA">Massachusetts</option>
                        <option value="MI">Michigan</option>
                        <option value="MN">Minnesota</option>
                        <option value="MS">Mississippi</option>
                        <option value="MO">Missouri</option>
                        <option value="MT">Montana</option>
                        <option value="NE">Nebraska</option>
                        <option value="NV">Nevada</option>
                        <option value="NH">New Hampshire</option>
                        <option value="NJ">New Jersey</option>
                        <option value="NM">New Mexico</option>
                        <option value="NY">New York</option>
                        <option value="NC">North Carolina</option>
                        <option value="ND">North Dakota</option>
                        <option value="OH">Ohio</option>
                        <option value="OK">Oklahoma</option>
                        <option value="OR">Oregon</option>
                        <option value="PA">Pennsylvania</option>
                        <option value="RI">Rhode Island</option>
                        <option value="SC">South Carolina</option>
                        <option value="SD">South Dakota</option>
                        <option value="TN">Tennessee</option>
                        <option value="TX">Texas</option>
                        <option value="UT">Utah</option>
                        <option value="VT">Vermont</option>
                        <option value="VA">Virginia</option>
                        <option value="WA">Washington</option>
                        <option value="WV">West Virginia</option>
                        <option value="WI">Wisconsin</option>
                        <option value="WY">Wyoming</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className='block text-sm font-bold mb-2 text-slate-300'>ZIP Code *</label>
                      <input
                        type='text'
                        value={shippingZip}
                        onChange={(e) => setShippingZip(e.target.value)}
                        placeholder='75001'
                        maxLength={10}
                        className='w-full px-4 py-3 bg-slate-900/70 border-2 border-slate-700 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 text-white transition-all'
                        required
                      />
                    </div>
                  </div>

                  {/* Country */}
                  <div>
                    <label className='block text-sm font-bold mb-2 text-slate-300'>Country</label>
                    <select
                      value={shippingCountry}
                      onChange={(e) => setShippingCountry(e.target.value)}
                      className='w-full px-4 py-3 bg-slate-900/70 border-2 border-slate-700 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 text-white transition-all'
                    >
                      <option value="USA">United States</option>
                      <option value="CAN">Canada</option>
                    </select>
                  </div>

                  {/* Preview */}
                  {(shippingAddress1 && shippingCity && shippingState && shippingZip) && (
                    <div className='bg-slate-900/70 rounded-xl p-5 border-2 border-orange-500/30'>
                      <h4 className='text-sm font-bold text-orange-400 mb-3 flex items-center gap-2'>
                        📬 Label Preview (Return Address)
                      </h4>
                      <div className='font-mono text-sm text-white space-y-1'>
                        <p className='font-bold'>{shippingName || user?.fullName || 'Your Name'}</p>
                        <p>{shippingAddress1}</p>
                        {shippingAddress2 && <p>{shippingAddress2}</p>}
                        <p>{shippingCity}, {shippingState} {shippingZip}</p>
                        <p>{shippingCountry}</p>
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={saveShippingAddress}
                    disabled={loadingShipping || !shippingAddress1 || !shippingCity || !shippingState || !shippingZip}
                    className='w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-lg hover:shadow-orange-500/50 transition-all hover:scale-105'
                  >
                    <Save size={18} className='mr-2' />
                    {loadingShipping ? 'Saving...' : 'Save Shipping Address'}
                  </Button>

                  <div className='p-4 bg-blue-500/10 rounded-xl border border-blue-500/20'>
                    <p className='text-xs text-slate-400 text-center'>
                      📦 This address is used as the return address on shipping labels when you sell cards through auctions.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab - ENHANCED */}
            {activeTab === 'security' && (
              <div className='bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border-2 border-slate-700/50 shadow-xl hover:border-indigo-500/30 transition-all'>
                <div className='flex items-center gap-3 mb-6'>
                  <div className='p-3 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl shadow-lg'>
                    <Lock className='text-white' size={24} />
                  </div>
                  <h3 className='text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400'>Change Password</h3>
                </div>
                <form onSubmit={handleChangePassword} className='space-y-6'>
                  <div>
                    <label className='block text-sm font-bold mb-2 text-slate-300'>Current Password</label>
                    <input
                      type='password'
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className='w-full px-4 py-3 bg-slate-900/70 border-2 border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 text-white transition-all'
                      required
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-bold mb-2 text-slate-300'>New Password</label>
                    <input
                      type='password'
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className='w-full px-4 py-3 bg-slate-900/70 border-2 border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 text-white transition-all'
                      required
                      minLength={6}
                    />
                    <p className='text-xs text-slate-500 mt-2 flex items-center gap-1'>
                      <Shield size={12} />
                      Must be at least 6 characters
                    </p>
                  </div>

                  <div>
                    <label className='block text-sm font-bold mb-2 text-slate-300'>Confirm New Password</label>
                    <input
                      type='password'
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className='w-full px-4 py-3 bg-slate-900/70 border-2 border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 text-white transition-all'
                      required
                      minLength={6}
                    />
                  </div>

                  <Button 
                    type='submit' 
                    disabled={loading} 
                    className='w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-lg hover:shadow-indigo-500/50 transition-all hover:scale-105'
                  >
                    <Lock size={18} className='mr-2' />
                    {loading ? 'Updating...' : 'Change Password'}
                  </Button>
                </form>
              </div>
            )}

            {/* Danger Zone Tab - ENHANCED */}
            {activeTab === 'danger' && (
              <div className='bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border-2 border-red-500/50 shadow-2xl shadow-red-500/20'>
                <div className='flex items-center gap-3 mb-3'>
                  <div className='p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl shadow-lg animate-pulse'>
                    <AlertCircle className='text-white' size={24} />
                  </div>
                  <h3 className='text-3xl font-black text-red-400'>Danger Zone</h3>
                </div>
                <p className='text-slate-400 mb-6 font-medium'>
                  Irreversible actions. Please proceed with caution.
                </p>

                <div className='bg-red-500/10 border-2 border-red-500/50 rounded-xl p-6'>
                  <div className='flex items-start gap-4 mb-6'>
                    <AlertCircle className='text-red-400 flex-shrink-0 mt-1 animate-pulse' size={28} />
                    <div>
                      <h4 className='text-xl font-black text-red-400 mb-3'>Delete Account</h4>
                      <p className='text-sm text-slate-300 mb-3 font-medium'>
                        Once you delete your account, there is no going back. This will:
                      </p>
                      <ul className='text-sm text-slate-400 space-y-2'>
                        {['Permanently delete all your cards', 'Cancel your subscription immediately', 'Remove all your data from our servers', 'This action cannot be undone'].map((item, i) => (
                          <li key={i} className='flex items-center gap-2'>
                            <div className='w-1.5 h-1.5 bg-red-400 rounded-full'></div>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <Button
                    variant='danger'
                    onClick={() => setShowDeleteModal(true)}
                    className='w-full sm:w-auto bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 shadow-lg hover:shadow-red-500/50 transition-all hover:scale-105'
                  >
                    <Trash2 size={18} className='mr-2' />
                    Delete My Account
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal - ENHANCED */}
      {showDeleteModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4' onClick={() => setShowDeleteModal(false)}>
          <div className='fixed inset-0 bg-black/90 backdrop-blur-sm' />
          
          <div className='relative bg-slate-900/95 backdrop-blur-xl rounded-2xl p-8 border-2 border-red-500/50 w-full max-w-md shadow-2xl shadow-red-500/30' onClick={(e) => e.stopPropagation()}>
            <div className='flex items-center gap-3 mb-4'>
              <div className='p-2 bg-red-500/20 rounded-lg'>
                <AlertCircle className='text-red-400 animate-pulse' size={28} />
              </div>
              <h3 className='text-2xl font-black text-red-400'>Delete Account?</h3>
            </div>
            <p className='text-slate-300 mb-6 font-medium'>
              This action is permanent and cannot be undone. All your data will be deleted immediately.
            </p>

            <div className='bg-red-500/10 border-2 border-red-500/50 rounded-xl p-5 mb-6'>
              <p className='text-sm text-slate-300 mb-3 font-medium'>
                Type <span className='font-mono font-black text-red-400 text-lg'>DELETE</span> to confirm:
              </p>
              <input
                type='text'
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className='w-full px-4 py-3 bg-slate-900 border-2 border-red-500/50 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/30 text-center font-mono font-bold text-lg text-white transition-all'
                placeholder='Type DELETE'
              />
            </div>

            <div className='flex gap-3'>
              <Button
                variant='secondary'
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                className='flex-1 bg-slate-700/50 hover:bg-slate-700 border-2 border-slate-600'
              >
                Cancel
              </Button>
              <Button
                variant='danger'
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || loading}
                className='flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 disabled:opacity-50'
              >
                {loading ? 'Deleting...' : 'Delete Forever'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}