/**
 * CompanionAppStep - Configuration screen for Companion Apps
 *
 * Companion apps are mobile-first PWAs that connect to an existing website's backend.
 * They deploy to [sitename].be1st.app and call [sitename].be1st.io/api
 */

import React, { useState, useEffect } from 'react';
import { styles } from '../styles';

// Industry-specific quick actions
const INDUSTRY_QUICK_ACTIONS = {
  // Food & Beverage industries
  restaurant: {
    customer: ['viewMenu', 'makeReservation', 'earnPoints', 'viewRewards', 'orderFood'],
    staff: ['seatTable', 'addPoints', 'viewOrders', 'sendNotification']
  },
  pizza: {
    customer: ['viewMenu', 'orderFood', 'earnPoints', 'viewRewards', 'checkIn'],
    staff: ['viewOrders', 'addPoints', 'sendNotification', 'analytics']
  },
  cafe: {
    customer: ['viewMenu', 'orderFood', 'earnPoints', 'viewRewards', 'checkIn'],
    staff: ['viewOrders', 'addPoints', 'sendNotification', 'analytics']
  },
  bar: {
    customer: ['viewMenu', 'makeReservation', 'earnPoints', 'viewRewards', 'orderFood'],
    staff: ['seatTable', 'addPoints', 'viewOrders', 'sendNotification']
  },
  steakhouse: {
    customer: ['viewMenu', 'makeReservation', 'earnPoints', 'viewRewards', 'orderFood'],
    staff: ['seatTable', 'addPoints', 'viewOrders', 'sendNotification']
  },
  bakery: {
    customer: ['viewMenu', 'orderFood', 'earnPoints', 'viewRewards', 'checkIn'],
    staff: ['viewOrders', 'addPoints', 'sendNotification', 'analytics']
  },
  // Services industries
  salon: {
    customer: ['bookAppointment', 'viewLoyalty', 'pastVisits', 'referFriend'],
    staff: ['checkInClient', 'addPoints', 'viewSchedule', 'quickSale']
  },
  fitness: {
    customer: ['checkIn', 'viewClasses', 'earnPoints', 'leaderboard', 'workoutLog'],
    staff: ['checkInMember', 'viewClasses', 'memberSearch', 'analytics']
  },
  healthcare: {
    customer: ['bookAppointment', 'viewRecords', 'prescriptions', 'messages'],
    staff: ['patientQueue', 'vitals', 'appointments', 'charts']
  },
  dental: {
    customer: ['bookAppointment', 'viewRecords', 'messages', 'viewRewards'],
    staff: ['patientQueue', 'appointments', 'charts', 'sendNotification']
  },
  'real-estate': {
    customer: ['savedListings', 'scheduleTour', 'calculator', 'messages'],
    staff: ['clientPortal', 'scheduleShowings', 'leads', 'analytics']
  },
  education: {
    customer: ['myCourses', 'progress', 'certificates', 'assignments'],
    staff: ['studentRoster', 'grades', 'attendance', 'announcements']
  },
  professional: {
    customer: ['appointments', 'documents', 'billing', 'messages'],
    staff: ['clientFiles', 'timeTracking', 'invoices', 'calendar']
  },
  'law-firm': {
    customer: ['appointments', 'documents', 'billing', 'messages'],
    staff: ['clientFiles', 'timeTracking', 'invoices', 'calendar']
  },
  coworking: {
    customer: ['bookRoom', 'accessPass', 'community', 'events'],
    staff: ['roomStatus', 'checkIns', 'members', 'billing']
  },
  collectibles: {
    customer: ['myCollection', 'scan', 'marketplace', 'wishlist'],
    staff: ['inventory', 'priceCheck', 'authentications', 'sales']
  },
  default: {
    customer: ['dashboard', 'rewards', 'profile', 'notifications'],
    staff: ['customers', 'analytics', 'settings', 'reports']
  }
};

// Quick action metadata
const QUICK_ACTION_META = {
  viewMenu: { icon: '📖', label: 'View Menu' },
  makeReservation: { icon: '📅', label: 'Reserve Table' },
  earnPoints: { icon: '⭐', label: 'Earn Points' },
  viewRewards: { icon: '🎁', label: 'My Rewards' },
  orderFood: { icon: '🍽️', label: 'Order Food' },
  seatTable: { icon: '🪑', label: 'Seat Table' },
  addPoints: { icon: '➕', label: 'Add Points' },
  viewOrders: { icon: '📋', label: 'Orders' },
  sendNotification: { icon: '📢', label: 'Announce' },
  bookAppointment: { icon: '📅', label: 'Book Now' },
  viewLoyalty: { icon: '💎', label: 'Loyalty' },
  pastVisits: { icon: '📜', label: 'History' },
  referFriend: { icon: '👥', label: 'Refer' },
  checkInClient: { icon: '✅', label: 'Check In' },
  viewSchedule: { icon: '📆', label: 'Schedule' },
  quickSale: { icon: '💳', label: 'Quick Sale' },
  checkIn: { icon: '✅', label: 'Check In' },
  viewClasses: { icon: '🏋️', label: 'Classes' },
  leaderboard: { icon: '🏆', label: 'Leaderboard' },
  workoutLog: { icon: '📝', label: 'Log Workout' },
  checkInMember: { icon: '✅', label: 'Check In' },
  memberSearch: { icon: '🔍', label: 'Find Member' },
  analytics: { icon: '📊', label: 'Analytics' },
  viewRecords: { icon: '📋', label: 'Records' },
  prescriptions: { icon: '💊', label: 'Prescriptions' },
  messages: { icon: '💬', label: 'Messages' },
  patientQueue: { icon: '👥', label: 'Queue' },
  vitals: { icon: '❤️', label: 'Vitals' },
  appointments: { icon: '📅', label: 'Appointments' },
  charts: { icon: '📈', label: 'Charts' },
  savedListings: { icon: '🏠', label: 'Saved' },
  scheduleTour: { icon: '🚗', label: 'Schedule Tour' },
  calculator: { icon: '🧮', label: 'Calculator' },
  clientPortal: { icon: '👤', label: 'Clients' },
  scheduleShowings: { icon: '📅', label: 'Showings' },
  leads: { icon: '📞', label: 'Leads' },
  myCourses: { icon: '📚', label: 'My Courses' },
  progress: { icon: '📈', label: 'Progress' },
  certificates: { icon: '🏆', label: 'Certificates' },
  assignments: { icon: '📝', label: 'Assignments' },
  studentRoster: { icon: '👥', label: 'Students' },
  grades: { icon: '📊', label: 'Grades' },
  attendance: { icon: '✅', label: 'Attendance' },
  announcements: { icon: '📢', label: 'Announce' },
  documents: { icon: '📄', label: 'Documents' },
  billing: { icon: '💳', label: 'Billing' },
  clientFiles: { icon: '📁', label: 'Files' },
  timeTracking: { icon: '⏱️', label: 'Time' },
  invoices: { icon: '🧾', label: 'Invoices' },
  calendar: { icon: '📅', label: 'Calendar' },
  bookRoom: { icon: '🚪', label: 'Book Room' },
  accessPass: { icon: '🔑', label: 'Access' },
  community: { icon: '👥', label: 'Community' },
  events: { icon: '🎉', label: 'Events' },
  roomStatus: { icon: '🚪', label: 'Rooms' },
  checkIns: { icon: '✅', label: 'Check-ins' },
  members: { icon: '👥', label: 'Members' },
  myCollection: { icon: '📦', label: 'Collection' },
  scan: { icon: '📷', label: 'Scan' },
  marketplace: { icon: '🛒', label: 'Marketplace' },
  wishlist: { icon: '❤️', label: 'Wishlist' },
  inventory: { icon: '📦', label: 'Inventory' },
  priceCheck: { icon: '💰', label: 'Price Check' },
  authentications: { icon: '✓', label: 'Auth' },
  sales: { icon: '💳', label: 'Sales' },
  dashboard: { icon: '📊', label: 'Dashboard' },
  rewards: { icon: '🎁', label: 'Rewards' },
  profile: { icon: '👤', label: 'Profile' },
  notifications: { icon: '🔔', label: 'Alerts' },
  customers: { icon: '👥', label: 'Customers' },
  settings: { icon: '⚙️', label: 'Settings' },
  reports: { icon: '📈', label: 'Reports' }
};

// Component styles
const companionStyles = {
  container: {
    ...styles.stepContainer,
    maxWidth: '900px',
    padding: '40px 24px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '16px',
    color: 'rgba(255,255,255,0.6)',
  },
  parentInfo: {
    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2))',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '32px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  parentIcon: {
    fontSize: '32px',
  },
  parentDetails: {
    flex: 1,
  },
  parentLabel: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  parentName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#fff',
  },
  parentUrl: {
    fontSize: '14px',
    color: '#8b5cf6',
  },
  appTypeSelector: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    marginBottom: '32px',
  },
  appTypeCard: {
    position: 'relative',
    background: 'rgba(255,255,255,0.05)',
    border: '2px solid transparent',
    borderRadius: '16px',
    padding: '24px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'center',
  },
  appTypeCardSelected: {
    background: 'rgba(139, 92, 246, 0.15)',
    borderColor: '#8b5cf6',
  },
  appTypeIcon: {
    fontSize: '48px',
    marginBottom: '12px',
  },
  appTypeName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '4px',
  },
  appTypeDesc: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.6)',
  },
  section: {
    marginBottom: '32px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  quickActionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
  },
  quickActionItem: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '12px',
    padding: '16px 12px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: '2px solid transparent',
  },
  quickActionItemSelected: {
    background: 'rgba(139, 92, 246, 0.2)',
    borderColor: '#8b5cf6',
  },
  quickActionIcon: {
    fontSize: '24px',
    marginBottom: '6px',
  },
  quickActionLabel: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.8)',
  },
  previewSection: {
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '24px',
    padding: '24px',
    marginBottom: '32px',
  },
  phoneFrame: {
    width: '280px',
    height: '500px',
    background: '#000',
    borderRadius: '36px',
    padding: '12px',
    margin: '0 auto',
    boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
  },
  phoneScreen: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
    borderRadius: '28px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  phoneHeader: {
    padding: '16px',
    textAlign: 'center',
  },
  phoneHeaderText: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#fff',
  },
  phoneContent: {
    flex: 1,
    padding: '12px',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    alignContent: 'start',
  },
  phoneQuickAction: {
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '16px',
    padding: '20px 12px',
    textAlign: 'center',
  },
  phoneQuickActionIcon: {
    fontSize: '28px',
    marginBottom: '8px',
  },
  phoneQuickActionLabel: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.8)',
  },
  phoneNavBar: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '12px',
    background: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(10px)',
  },
  phoneNavItem: {
    textAlign: 'center',
    opacity: 0.6,
  },
  phoneNavItemActive: {
    opacity: 1,
  },
  phoneNavIcon: {
    fontSize: '20px',
  },
  phoneNavLabel: {
    fontSize: '10px',
    color: '#fff',
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    marginTop: '32px',
  },
  generateBtn: {
    padding: '16px 48px',
    fontSize: '16px',
    fontWeight: '600',
    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  cancelBtn: {
    padding: '16px 32px',
    fontSize: '16px',
    background: 'transparent',
    color: 'rgba(255,255,255,0.6)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '12px',
    cursor: 'pointer',
  },
  deployInfo: {
    textAlign: 'center',
    marginTop: '24px',
    padding: '16px',
    background: 'rgba(16, 185, 129, 0.1)',
    borderRadius: '12px',
    border: '1px solid rgba(16, 185, 129, 0.3)',
  },
  deployInfoText: {
    fontSize: '14px',
    color: '#10b981',
  },
};

export function CompanionAppStep({ parentSite, onGenerate, onCancel }) {
  const [selectedAppTypes, setSelectedAppTypes] = useState(['customer']); // Array of 'customer' and/or 'staff'
  const [selectedActions, setSelectedActions] = useState([]);
  const [generating, setGenerating] = useState(false);

  // Toggle app type selection (allows both)
  const toggleAppType = (type) => {
    setSelectedAppTypes(prev => {
      if (prev.includes(type)) {
        // Don't allow deselecting if it's the only one
        if (prev.length === 1) return prev;
        return prev.filter(t => t !== type);
      }
      return [...prev, type];
    });
  };

  // Primary app type for quick actions display
  const primaryAppType = selectedAppTypes[0] || 'customer';

  // Detect industry from parent site
  const detectIndustry = () => {
    const name = (parentSite?.name || '').toLowerCase();
    // Order matters - more specific matches first
    const keywords = {
      // Food & Beverage - specific types first
      pizza: ['pizza', 'pizzeria', 'pie'],
      steakhouse: ['steak', 'steakhouse', 'chophouse'],
      bakery: ['bakery', 'bakehouse', 'pastry', 'cupcake', 'donut'],
      bar: ['bar', 'pub', 'tavern', 'brewery', 'taproom', 'lounge', 'beer', 'wine'],
      cafe: ['cafe', 'coffee', 'espresso', 'roaster', 'tea'],
      // Then generic restaurant
      restaurant: ['restaurant', 'bistro', 'grill', 'diner', 'eatery', 'kitchen', 'food', 'bbq', 'barbecue', 'smokehouse', 'taco', 'sushi', 'thai', 'chinese', 'mexican', 'italian'],
      // Services
      dental: ['dental', 'dentist', 'orthodont', 'teeth'],
      healthcare: ['clinic', 'medical', 'health', 'doctor', 'therapy', 'physician'],
      salon: ['salon', 'spa', 'beauty', 'hair', 'nails', 'barber'],
      fitness: ['gym', 'fitness', 'crossfit', 'yoga', 'pilates', 'training', 'workout'],
      'law-firm': ['law', 'legal', 'attorney', 'lawyer'],
      'real-estate': ['realty', 'properties', 'homes', 'estate', 'realtor', 'property'],
      education: ['school', 'academy', 'learning', 'tutoring', 'courses', 'tutor'],
      professional: ['accounting', 'consulting', 'services', 'agency'],
      coworking: ['cowork', 'workspace', 'office', 'hub'],
      collectibles: ['collectibles', 'sneaker', 'cards', 'vintage', 'antique', 'card', 'memorabilia']
    };

    for (const [industry, words] of Object.entries(keywords)) {
      if (words.some(word => name.includes(word))) {
        return industry;
      }
    }
    return 'default';
  };

  const industry = detectIndustry();
  const availableActions = INDUSTRY_QUICK_ACTIONS[industry] || INDUSTRY_QUICK_ACTIONS.default;

  // Initialize with default actions when app type changes
  useEffect(() => {
    // Combine actions from all selected app types
    let allActions = [];
    selectedAppTypes.forEach(type => {
      const typeActions = availableActions[type] || [];
      typeActions.forEach(action => {
        if (!allActions.includes(action)) {
          allActions.push(action);
        }
      });
    });
    // Select first 4 unique actions
    setSelectedActions(allActions.slice(0, 4));
  }, [selectedAppTypes, industry]);

  const toggleAction = (actionId) => {
    setSelectedActions(prev => {
      if (prev.includes(actionId)) {
        return prev.filter(a => a !== actionId);
      }
      if (prev.length >= 6) return prev; // Max 6 actions
      return [...prev, actionId];
    });
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await onGenerate({
        appTypes: selectedAppTypes, // Now an array
        appType: selectedAppTypes[0], // Keep backward compatibility
        industry,
        quickActions: selectedActions,
        parentSite: {
          name: parentSite.name,
          subdomain: parentSite.subdomain,
          url: parentSite.url,
          // Backend URL for API calls - companion apps call the parent's backend on Railway
          // The actual URL will be set by deploy-service via VITE_API_URL env var
          backendUrl: parentSite.backendUrl || `https://${parentSite.subdomain || parentSite.name?.toLowerCase().replace(/[^a-z0-9]/g, '-')}-backend.up.railway.app`,
        }
      });
    } catch (error) {
      console.error('Generation failed:', error);
      setGenerating(false);
    }
  };

  const subdomain = parentSite?.subdomain || parentSite?.name?.toLowerCase().replace(/[^a-z0-9]/g, '-');

  return (
    <div style={companionStyles.container}>
      <div style={companionStyles.header}>
        <h1 style={companionStyles.title}>Create Companion App</h1>
        <p style={companionStyles.subtitle}>
          Mobile-first PWA that connects to your website
        </p>
      </div>

      {/* Parent Site Info */}
      <div style={companionStyles.parentInfo}>
        <div style={companionStyles.parentIcon}>🔗</div>
        <div style={companionStyles.parentDetails}>
          <div style={companionStyles.parentLabel}>Connected to</div>
          <div style={companionStyles.parentName}>{parentSite?.name || 'Your Website'}</div>
          <div style={companionStyles.parentUrl}>{subdomain}.be1st.io</div>
        </div>
      </div>

      {/* App Type Selector */}
      <div style={companionStyles.section}>
        <div style={companionStyles.sectionTitle}>
          <span>📱</span> Choose App Types <span style={{ fontSize: '12px', opacity: 0.6, marginLeft: '8px' }}>(select one or both)</span>
        </div>
        <div style={companionStyles.appTypeSelector}>
          <div
            style={{
              ...companionStyles.appTypeCard,
              ...(selectedAppTypes.includes('customer') ? companionStyles.appTypeCardSelected : {}),
            }}
            onClick={() => toggleAppType('customer')}
          >
            <div style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '18px' }}>
              {selectedAppTypes.includes('customer') ? '✓' : '○'}
            </div>
            <div style={companionStyles.appTypeIcon}>👤</div>
            <div style={companionStyles.appTypeName}>Customer App</div>
            <div style={companionStyles.appTypeDesc}>
              For your customers to check points, book, and more
            </div>
          </div>
          <div
            style={{
              ...companionStyles.appTypeCard,
              ...(selectedAppTypes.includes('staff') ? companionStyles.appTypeCardSelected : {}),
            }}
            onClick={() => toggleAppType('staff')}
          >
            <div style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '18px' }}>
              {selectedAppTypes.includes('staff') ? '✓' : '○'}
            </div>
            <div style={companionStyles.appTypeIcon}>💼</div>
            <div style={companionStyles.appTypeName}>Staff App</div>
            <div style={companionStyles.appTypeDesc}>
              For your team to manage customers and operations
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={companionStyles.section}>
        <div style={companionStyles.sectionTitle}>
          <span>⚡</span> Quick Actions (select up to 6)
        </div>
        <div style={companionStyles.quickActionsGrid}>
          {/* Show actions from all selected app types */}
          {[...new Set(selectedAppTypes.flatMap(type => availableActions[type] || []))].map(actionId => {
            const meta = QUICK_ACTION_META[actionId] || { icon: '📱', label: actionId };
            const isSelected = selectedActions.includes(actionId);
            return (
              <div
                key={actionId}
                style={{
                  ...companionStyles.quickActionItem,
                  ...(isSelected ? companionStyles.quickActionItemSelected : {}),
                }}
                onClick={() => toggleAction(actionId)}
              >
                <div style={companionStyles.quickActionIcon}>{meta.icon}</div>
                <div style={companionStyles.quickActionLabel}>{meta.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Phone Preview */}
      <div style={companionStyles.previewSection}>
        <div style={companionStyles.phoneFrame}>
          <div style={companionStyles.phoneScreen}>
            <div style={companionStyles.phoneHeader}>
              <div style={companionStyles.phoneHeaderText}>
                {parentSite?.name || 'Your App'}
              </div>
            </div>
            <div style={companionStyles.phoneContent}>
              {selectedActions.slice(0, 4).map(actionId => {
                const meta = QUICK_ACTION_META[actionId] || { icon: '📱', label: actionId };
                return (
                  <div key={actionId} style={companionStyles.phoneQuickAction}>
                    <div style={companionStyles.phoneQuickActionIcon}>{meta.icon}</div>
                    <div style={companionStyles.phoneQuickActionLabel}>{meta.label}</div>
                  </div>
                );
              })}
            </div>
            <div style={companionStyles.phoneNavBar}>
              <div style={{ ...companionStyles.phoneNavItem, ...companionStyles.phoneNavItemActive }}>
                <div style={companionStyles.phoneNavIcon}>🏠</div>
                <div style={companionStyles.phoneNavLabel}>Home</div>
              </div>
              <div style={companionStyles.phoneNavItem}>
                <div style={companionStyles.phoneNavIcon}>⭐</div>
                <div style={companionStyles.phoneNavLabel}>Rewards</div>
              </div>
              <div style={companionStyles.phoneNavItem}>
                <div style={companionStyles.phoneNavIcon}>👤</div>
                <div style={companionStyles.phoneNavLabel}>Profile</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deploy Info */}
      <div style={companionStyles.deployInfo}>
        <div style={companionStyles.deployInfoText}>
          📱 Will deploy {selectedAppTypes.length === 2 ? 'both apps' : `${selectedAppTypes[0]} app`} to <strong>{subdomain}.be1st.app</strong>
          {selectedAppTypes.length === 2 && <span> (staff: <strong>{subdomain}-admin.be1st.app</strong>)</span>}
          <br />
          Connecting to <strong>{subdomain}.be1st.io/api</strong>
        </div>
      </div>

      {/* Actions */}
      <div style={companionStyles.actions}>
        <button style={companionStyles.cancelBtn} onClick={onCancel} disabled={generating}>
          Cancel
        </button>
        <button
          style={{
            ...companionStyles.generateBtn,
            opacity: generating ? 0.7 : 1,
          }}
          onClick={handleGenerate}
          disabled={generating || selectedActions.length === 0}
        >
          {generating ? '⏳ Generating...' : `🚀 Generate ${selectedAppTypes.length === 2 ? 'Both Apps' : 'Companion App'}`}
        </button>
      </div>
    </div>
  );
}
