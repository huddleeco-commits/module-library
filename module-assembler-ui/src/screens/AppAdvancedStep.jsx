/**
 * AppAdvancedStep - Configuration screen for Advanced (Full Stack) Apps
 *
 * Allows users to configure Loyalty Program and other full-stack app templates
 * with customizable business details, reward structures, and tier systems.
 */

import React, { useState, useMemo } from 'react';
import { styles } from '../styles';

// Anthropic API pricing (Claude Sonnet) - for cost estimation
const PRICING = {
  inputPerMillion: 3.00,
  outputPerMillion: 15.00,
};

// Template configurations
const TEMPLATES = {
  'loyalty-program': {
    id: 'loyalty-program',
    name: 'Loyalty Program',
    icon: '🏆',
    description: 'Complete customer loyalty system with points, tiers, and rewards',
    features: [
      { id: 'auth', name: 'User Authentication', description: 'JWT-based login/signup with password hashing' },
      { id: 'points', name: 'Points System', description: 'Earn, spend, and transfer points' },
      { id: 'tiers', name: 'Reward Tiers', description: 'Bronze, Silver, Gold, Platinum levels' },
      { id: 'admin', name: 'Admin Dashboard', description: 'Manage users, rewards, and analytics' },
      { id: 'database', name: 'SQLite Database', description: 'Persistent data storage' },
    ],
    defaultConfig: {
      businessName: '',
      currency: 'points',
      tiers: [
        { name: 'Bronze', minPoints: 0, multiplier: 1.0, color: '#CD7F32' },
        { name: 'Silver', minPoints: 500, multiplier: 1.25, color: '#C0C0C0' },
        { name: 'Gold', minPoints: 2000, multiplier: 1.5, color: '#FFD700' },
        { name: 'Platinum', minPoints: 5000, multiplier: 2.0, color: '#E5E4E2' },
      ],
      rewards: [
        { name: '$5 Off', cost: 100, type: 'discount' },
        { name: '$10 Off', cost: 200, type: 'discount' },
        { name: 'Free Item', cost: 500, type: 'freebie' },
        { name: 'VIP Access', cost: 1000, type: 'exclusive' },
      ],
      earnRate: 1, // points per dollar spent
    },
    estimatedTokens: {
      input: 8000,
      outputLow: 15000,
      outputHigh: 25000,
    },
  },
  'appointment-booking': {
    id: 'appointment-booking',
    name: 'Appointment Booking',
    icon: '📅',
    description: 'Online booking system for services with calendar, staff, and customer management',
    features: [
      { id: 'booking', name: 'Online Booking', description: 'Customers book appointments 24/7' },
      { id: 'calendar', name: 'Calendar View', description: 'Day, week, and month views for staff' },
      { id: 'staff', name: 'Staff Management', description: 'Multiple staff with individual schedules' },
      { id: 'customers', name: 'Customer Database', description: 'History, notes, and preferences' },
      { id: 'admin', name: 'Admin Dashboard', description: 'Manage bookings, services, and analytics' },
    ],
    defaultConfig: {
      businessName: '',
      primaryColor: '#8b5cf6',
      services: [
        { name: 'Consultation', duration: 30, price: 50 },
        { name: 'Standard Service', duration: 60, price: 100 },
        { name: 'Premium Service', duration: 90, price: 150 },
      ],
      staff: [
        { name: 'Staff Member 1', services: [0, 1, 2] }, // indices of services they offer
      ],
      businessHours: {
        monday: { open: '09:00', close: '17:00', closed: false },
        tuesday: { open: '09:00', close: '17:00', closed: false },
        wednesday: { open: '09:00', close: '17:00', closed: false },
        thursday: { open: '09:00', close: '17:00', closed: false },
        friday: { open: '09:00', close: '17:00', closed: false },
        saturday: { open: '10:00', close: '14:00', closed: false },
        sunday: { open: '00:00', close: '00:00', closed: true },
      },
      bookingSettings: {
        minAdvanceHours: 2, // minimum hours in advance to book
        maxAdvanceDays: 30, // maximum days in advance to book
        slotDuration: 30, // slot increment in minutes
      },
    },
    estimatedTokens: {
      input: 10000,
      outputLow: 18000,
      outputHigh: 28000,
    },
  },
  'admin-dashboard': {
    id: 'admin-dashboard',
    name: 'Admin Dashboard',
    icon: '🎛️',
    description: 'Universal business command center - manage customers, analytics, and connected Blink apps',
    features: [
      { id: 'dashboard', name: 'Command Center', description: 'Quick stats, actions, and activity feed' },
      { id: 'customerMgmt', name: 'Customer Management', description: 'Search, filter, and manage customers' },
      { id: 'analytics', name: 'Analytics', description: 'Revenue charts, customer growth, and insights' },
      { id: 'notifications', name: 'Notifications', description: 'Alerts, to-dos, and real-time updates' },
      { id: 'integrations', name: 'App Integrations', description: 'Connect Loyalty, Booking, and more' },
      { id: 'settings', name: 'Settings', description: 'Staff, hours, and business profile' },
    ],
    defaultConfig: {
      businessName: '',
      logoUrl: '',
      primaryColor: '#8b5cf6',
      businessType: 'service',
      connectedApps: {
        loyalty: false,
        booking: false,
        website: false,
        inventory: false,
      },
      staff: [
        { name: 'Admin', email: 'admin@example.com', role: 'owner', permissions: ['all'] },
      ],
      businessHours: {
        monday: { open: '09:00', close: '17:00', closed: false },
        tuesday: { open: '09:00', close: '17:00', closed: false },
        wednesday: { open: '09:00', close: '17:00', closed: false },
        thursday: { open: '09:00', close: '17:00', closed: false },
        friday: { open: '09:00', close: '17:00', closed: false },
        saturday: { open: '10:00', close: '14:00', closed: false },
        sunday: { open: '00:00', close: '00:00', closed: true },
      },
      quickActions: ['addCustomer', 'addPoints', 'newBooking', 'sendAnnouncement', 'generateQR', 'exportData'],
    },
    estimatedTokens: {
      input: 12000,
      outputLow: 22000,
      outputHigh: 32000,
    },
  },
};

// Generation steps for progress tracking (config is instant, then all AI runs in parallel)
const GENERATION_STEPS = [
  { id: 'config', label: 'Creating config files', icon: '📦' },
  { id: 'backend', label: 'Generating backend', icon: '⚙️' },
  { id: 'frontend', label: 'Generating frontend', icon: '🎨' },
  { id: 'database', label: 'Generating database', icon: '💾' },
  { id: 'assembly', label: 'Assembling project', icon: '🔧' },
];

export function AppAdvancedStep({ templateId = 'loyalty-program', onBack, onGenerate }) {
  const template = TEMPLATES[templateId] || TEMPLATES['loyalty-program'];

  const [config, setConfig] = useState(template.defaultConfig);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSteps, setGenerationSteps] = useState({}); // Track each step's status
  const [error, setError] = useState(null);
  const [generatedProject, setGeneratedProject] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);

  // Deployment state
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployProgress, setDeployProgress] = useState(null);
  const [deployResult, setDeployResult] = useState(null);
  const [deployError, setDeployError] = useState(null);

  // Admin credentials (for Loyalty Program - baked into generated app)
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Cost estimation
  const estimatedCost = useMemo(() => {
    const { input, outputLow, outputHigh } = template.estimatedTokens;
    const costLow = (input / 1_000_000) * PRICING.inputPerMillion + (outputLow / 1_000_000) * PRICING.outputPerMillion;
    const costHigh = (input / 1_000_000) * PRICING.inputPerMillion + (outputHigh / 1_000_000) * PRICING.outputPerMillion;
    return {
      low: costLow.toFixed(2),
      high: costHigh.toFixed(2),
      display: `$${costLow.toFixed(2)}-${costHigh.toFixed(2)}`,
    };
  }, [template]);

  // Update config fields
  const updateConfig = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  // Update tier
  const updateTier = (index, field, value) => {
    const newTiers = [...config.tiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setConfig(prev => ({ ...prev, tiers: newTiers }));
  };

  // Update reward
  const updateReward = (index, field, value) => {
    const newRewards = [...config.rewards];
    newRewards[index] = { ...newRewards[index], [field]: value };
    setConfig(prev => ({ ...prev, rewards: newRewards }));
  };

  // Add new reward
  const addReward = () => {
    setConfig(prev => ({
      ...prev,
      rewards: [...prev.rewards, { name: 'New Reward', cost: 100, type: 'discount' }],
    }));
  };

  // Remove reward
  const removeReward = (index) => {
    setConfig(prev => ({
      ...prev,
      rewards: prev.rewards.filter((_, i) => i !== index),
    }));
  };

  // ═══ APPOINTMENT BOOKING HELPERS ═══
  // Update service
  const updateService = (index, field, value) => {
    const newServices = [...(config.services || [])];
    newServices[index] = { ...newServices[index], [field]: value };
    setConfig(prev => ({ ...prev, services: newServices }));
  };

  // Add new service
  const addService = () => {
    setConfig(prev => ({
      ...prev,
      services: [...(prev.services || []), { name: 'New Service', duration: 30, price: 50 }],
    }));
  };

  // Remove service
  const removeService = (index) => {
    setConfig(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
      // Also update staff to remove references to this service
      staff: prev.staff.map(s => ({
        ...s,
        services: s.services.filter(si => si !== index).map(si => si > index ? si - 1 : si)
      }))
    }));
  };

  // Update staff
  const updateStaff = (index, field, value) => {
    const newStaff = [...(config.staff || [])];
    newStaff[index] = { ...newStaff[index], [field]: value };
    setConfig(prev => ({ ...prev, staff: newStaff }));
  };

  // Add new staff
  const addStaff = () => {
    setConfig(prev => ({
      ...prev,
      staff: [...(prev.staff || []), { name: 'New Staff Member', services: [] }],
    }));
  };

  // Remove staff
  const removeStaff = (index) => {
    setConfig(prev => ({
      ...prev,
      staff: prev.staff.filter((_, i) => i !== index),
    }));
  };

  // Toggle staff service
  const toggleStaffService = (staffIndex, serviceIndex) => {
    const newStaff = [...(config.staff || [])];
    const services = newStaff[staffIndex].services || [];
    if (services.includes(serviceIndex)) {
      newStaff[staffIndex].services = services.filter(s => s !== serviceIndex);
    } else {
      newStaff[staffIndex].services = [...services, serviceIndex];
    }
    setConfig(prev => ({ ...prev, staff: newStaff }));
  };

  // Update business hours
  const updateBusinessHours = (day, field, value) => {
    setConfig(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: { ...prev.businessHours[day], [field]: value }
      }
    }));
  };

  // Update booking settings
  const updateBookingSettings = (field, value) => {
    setConfig(prev => ({
      ...prev,
      bookingSettings: { ...prev.bookingSettings, [field]: value }
    }));
  };

  // ═══ ADMIN DASHBOARD HELPERS ═══
  // Update admin staff member
  const updateAdminStaff = (index, field, value) => {
    const newStaff = [...(config.staff || [])];
    newStaff[index] = { ...newStaff[index], [field]: value };
    setConfig(prev => ({ ...prev, staff: newStaff }));
  };

  // Add new admin staff
  const addAdminStaff = () => {
    setConfig(prev => ({
      ...prev,
      staff: [...(prev.staff || []), { name: '', email: '', role: 'staff', permissions: ['customers', 'bookings'] }],
    }));
  };

  // Remove admin staff
  const removeAdminStaff = (index) => {
    if (index === 0) return; // Don't remove the owner
    setConfig(prev => ({
      ...prev,
      staff: prev.staff.filter((_, i) => i !== index),
    }));
  };

  // Toggle admin staff permission
  const toggleAdminPermission = (staffIndex, permission) => {
    const newStaff = [...(config.staff || [])];
    const perms = newStaff[staffIndex].permissions || [];
    if (perms.includes('all')) return; // Owner has all
    if (perms.includes(permission)) {
      newStaff[staffIndex].permissions = perms.filter(p => p !== permission);
    } else {
      newStaff[staffIndex].permissions = [...perms, permission];
    }
    setConfig(prev => ({ ...prev, staff: newStaff }));
  };

  // Toggle connected app
  const toggleConnectedApp = (appId) => {
    setConfig(prev => ({
      ...prev,
      connectedApps: {
        ...prev.connectedApps,
        [appId]: !prev.connectedApps?.[appId]
      }
    }));
  };

  // Generate the project using SSE for progress updates
  const handleGenerate = async () => {
    if (!config.businessName.trim()) {
      setError('Please enter a business name');
      return;
    }

    // Validate admin credentials for loyalty program
    if (templateId === 'loyalty-program') {
      if (!adminEmail.trim()) {
        setError('Please enter an admin email');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
        setError('Please enter a valid email address');
        return;
      }
      if (!adminPassword) {
        setError('Please enter an admin password');
        return;
      }
      if (adminPassword.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
      if (adminPassword !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    setIsGenerating(true);
    setError(null);
    setGenerationSteps({}); // Reset step progress

    // Include admin credentials in config for loyalty program
    const finalConfig = templateId === 'loyalty-program'
      ? { ...config, adminEmail, adminPassword }
      : config;

    try {
      const response = await fetch('/api/apps/generate-advanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId,
          config: finalConfig,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          throw new Error(data.error || 'Generation failed');
        } catch {
          throw new Error('Generation failed: ' + text.substring(0, 100));
        }
      }

      // Handle SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'progress') {
                // Update step progress
                setGenerationSteps(prev => ({
                  ...prev,
                  [data.step]: {
                    status: data.status,
                    completed: data.completed
                  }
                }));
              } else if (data.type === 'complete') {
                // Generation complete
                setGeneratedProject(data);
                setIsGenerating(false);
                if (onGenerate) {
                  onGenerate(data);
                }
              } else if (data.type === 'error') {
                throw new Error(data.error);
              }
            } catch (parseErr) {
              if (parseErr.message && !parseErr.message.includes('JSON')) {
                throw parseErr; // Re-throw actual errors
              }
              console.warn('Failed to parse SSE data:', parseErr);
            }
          }
        }
      }
    } catch (err) {
      setError(err.message);
      setIsGenerating(false);
    }
  };

  // Download the project as zip
  const handleDownload = () => {
    // URL is nested under project object from SSE response
    const downloadUrl = generatedProject?.project?.downloadUrl;
    if (downloadUrl) {
      window.location.href = downloadUrl;
    } else {
      console.error('No download URL found:', generatedProject);
    }
  };

  // Deploy to Railway
  const handleDeploy = async () => {
    const projectPath = generatedProject?.project?.path;
    const projectName = config.businessName;

    if (!projectPath || !projectName) {
      setDeployError('Project path or name not found');
      return;
    }

    setIsDeploying(true);
    setDeployError(null);
    setDeployProgress({ step: 'starting', status: 'Starting deployment...', progress: 0 });

    try {
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectPath,
          projectName,
          adminEmail: adminEmail || config.staff?.[0]?.email || 'admin@be1st.io',
          appType: 'advanced-app',
          stream: true
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Deployment failed');
      }

      // Handle SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'complete') {
                setDeployResult(data.result);
                setIsDeploying(false);
              } else if (data.type === 'error') {
                throw new Error(data.error);
              } else {
                // Progress update
                setDeployProgress(data);
              }
            } catch (parseErr) {
              if (parseErr.message && !parseErr.message.includes('JSON')) {
                throw parseErr;
              }
            }
          }
        }
      }
    } catch (err) {
      setDeployError(err.message);
      setIsDeploying(false);
    }
  };

  // Component styles
  const advancedStyles = {
    container: {
      ...styles.stepContainer,
      maxWidth: '900px',
      padding: '32px',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      marginBottom: '24px',
    },
    backButton: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '10px',
      padding: '10px 16px',
      color: 'rgba(255, 255, 255, 0.7)',
      cursor: 'pointer',
      fontSize: '0.9rem',
      transition: 'all 0.2s ease',
    },
    title: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#fff',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    subtitle: {
      fontSize: '1rem',
      color: 'rgba(255, 255, 255, 0.6)',
      marginBottom: '32px',
    },
    section: {
      marginBottom: '32px',
    },
    sectionTitle: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#fff',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    inputGroup: {
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      fontSize: '0.9rem',
      color: 'rgba(255, 255, 255, 0.7)',
      marginBottom: '8px',
    },
    input: {
      width: '100%',
      padding: '14px 16px',
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '10px',
      color: '#fff',
      fontSize: '1rem',
      outline: 'none',
      transition: 'border-color 0.2s ease',
      boxSizing: 'border-box',
    },
    tiersGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: '16px',
    },
    tierCard: {
      padding: '16px',
      background: 'rgba(255, 255, 255, 0.03)',
      border: '2px solid',
      borderRadius: '12px',
    },
    tierName: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#fff',
      marginBottom: '12px',
    },
    tierInput: {
      width: '100%',
      padding: '10px 12px',
      background: 'rgba(0, 0, 0, 0.2)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '8px',
      color: '#fff',
      fontSize: '0.85rem',
      marginBottom: '8px',
      outline: 'none',
      boxSizing: 'border-box',
    },
    tierLabel: {
      fontSize: '0.75rem',
      color: 'rgba(255, 255, 255, 0.5)',
      marginBottom: '4px',
    },
    rewardsTable: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    rewardsHeader: {
      background: 'rgba(255, 255, 255, 0.03)',
      textAlign: 'left',
      padding: '12px 16px',
      fontSize: '0.85rem',
      color: 'rgba(255, 255, 255, 0.7)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    },
    rewardsCell: {
      padding: '12px 16px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    },
    rewardInput: {
      width: '100%',
      padding: '8px 12px',
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '6px',
      color: '#fff',
      fontSize: '0.85rem',
      outline: 'none',
      boxSizing: 'border-box',
    },
    rewardSelect: {
      width: '100%',
      padding: '8px 12px',
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '6px',
      color: '#fff',
      fontSize: '0.85rem',
      outline: 'none',
    },
    removeButton: {
      background: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      borderRadius: '6px',
      color: '#ef4444',
      padding: '6px 12px',
      cursor: 'pointer',
      fontSize: '0.85rem',
    },
    addButton: {
      background: 'rgba(34, 197, 94, 0.1)',
      border: '1px solid rgba(34, 197, 94, 0.3)',
      borderRadius: '8px',
      color: '#22c55e',
      padding: '10px 16px',
      cursor: 'pointer',
      fontSize: '0.9rem',
      marginTop: '12px',
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '12px',
    },
    featureCard: {
      padding: '16px',
      background: 'rgba(236, 72, 153, 0.06)',
      border: '1px solid rgba(236, 72, 153, 0.2)',
      borderRadius: '10px',
    },
    featureIcon: {
      fontSize: '1.5rem',
      marginBottom: '8px',
    },
    featureName: {
      fontSize: '0.9rem',
      fontWeight: '600',
      color: '#fff',
      marginBottom: '4px',
    },
    featureDesc: {
      fontSize: '0.75rem',
      color: 'rgba(255, 255, 255, 0.5)',
    },
    costCard: {
      padding: '20px 24px',
      background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(236, 72, 153, 0.08))',
      border: '1px solid rgba(245, 158, 11, 0.3)',
      borderRadius: '12px',
      marginBottom: '24px',
    },
    costTitle: {
      fontSize: '0.9rem',
      color: 'rgba(255, 255, 255, 0.7)',
      marginBottom: '8px',
    },
    costValue: {
      fontSize: '1.8rem',
      fontWeight: '700',
      color: '#f59e0b',
    },
    generateButton: {
      width: '100%',
      padding: '18px 24px',
      background: 'linear-gradient(135deg, #ec4899, #f59e0b)',
      border: 'none',
      borderRadius: '12px',
      color: '#fff',
      fontSize: '1.1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 20px rgba(236, 72, 153, 0.3)',
    },
    generateButtonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
    progressCard: {
      padding: '32px',
      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.08))',
      border: '1px solid rgba(139, 92, 246, 0.3)',
      borderRadius: '16px',
    },
    progressTitle: {
      fontSize: '1.3rem',
      fontWeight: '700',
      color: '#fff',
      marginBottom: '24px',
      textAlign: 'center',
    },
    progressSteps: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    progressStep: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '16px 20px',
      background: 'rgba(255, 255, 255, 0.03)',
      borderRadius: '12px',
      transition: 'all 0.3s ease',
    },
    progressStepActive: {
      background: 'rgba(139, 92, 246, 0.15)',
      border: '1px solid rgba(139, 92, 246, 0.3)',
    },
    progressStepComplete: {
      background: 'rgba(34, 197, 94, 0.1)',
      border: '1px solid rgba(34, 197, 94, 0.3)',
    },
    progressStepIcon: {
      fontSize: '1.5rem',
      width: '40px',
      textAlign: 'center',
    },
    progressStepSpinner: {
      width: '24px',
      height: '24px',
      border: '3px solid rgba(139, 92, 246, 0.3)',
      borderTopColor: '#8b5cf6',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 8px',
    },
    progressStepCheck: {
      fontSize: '1.5rem',
      color: '#22c55e',
    },
    progressStepLabel: {
      flex: 1,
      fontSize: '1rem',
      color: 'rgba(255, 255, 255, 0.9)',
      fontWeight: '500',
    },
    progressStepStatus: {
      fontSize: '0.85rem',
      color: 'rgba(255, 255, 255, 0.5)',
    },
    progressMessage: {
      fontSize: '1rem',
      color: 'rgba(255, 255, 255, 0.8)',
    },
    errorCard: {
      padding: '16px 20px',
      background: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      borderRadius: '10px',
      color: '#ef4444',
      marginBottom: '20px',
    },
    successCard: {
      padding: '32px',
      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.08))',
      border: '2px solid rgba(34, 197, 94, 0.4)',
      borderRadius: '16px',
      textAlign: 'center',
    },
    successIcon: {
      fontSize: '4rem',
      marginBottom: '16px',
    },
    successTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#22c55e',
      marginBottom: '8px',
    },
    successSubtitle: {
      fontSize: '1rem',
      color: 'rgba(255, 255, 255, 0.7)',
      marginBottom: '24px',
    },
    downloadButton: {
      padding: '16px 32px',
      background: 'linear-gradient(135deg, #22c55e, #16a34a)',
      border: 'none',
      borderRadius: '10px',
      color: '#fff',
      fontSize: '1.1rem',
      fontWeight: '600',
      cursor: 'pointer',
      marginRight: '12px',
    },
    instructionsButton: {
      padding: '16px 24px',
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '10px',
      color: '#fff',
      fontSize: '1rem',
      cursor: 'pointer',
    },
    deployButton: {
      padding: '16px 32px',
      background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
      border: 'none',
      borderRadius: '10px',
      color: '#fff',
      fontSize: '1.1rem',
      fontWeight: '600',
      cursor: 'pointer',
      marginLeft: '12px',
      boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
      transition: 'all 0.2s ease',
    },
    deployButtonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
    deployProgressCard: {
      marginTop: '24px',
      padding: '24px',
      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.08))',
      border: '1px solid rgba(139, 92, 246, 0.3)',
      borderRadius: '16px',
    },
    deployProgressBar: {
      height: '8px',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '4px',
      marginTop: '16px',
      overflow: 'hidden',
    },
    deployProgressFill: {
      height: '100%',
      background: 'linear-gradient(90deg, #8b5cf6, #6366f1)',
      borderRadius: '4px',
      transition: 'width 0.3s ease',
    },
    deploySuccessCard: {
      marginTop: '24px',
      padding: '24px',
      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.08))',
      border: '2px solid rgba(34, 197, 94, 0.4)',
      borderRadius: '16px',
    },
    urlGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: '12px',
      marginTop: '16px',
    },
    urlCard: {
      padding: '16px',
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '10px',
      textAlign: 'left',
    },
    urlLabel: {
      fontSize: '0.75rem',
      color: 'rgba(255, 255, 255, 0.5)',
      marginBottom: '4px',
      textTransform: 'uppercase',
    },
    urlLink: {
      color: '#22c55e',
      textDecoration: 'none',
      fontSize: '0.9rem',
      wordBreak: 'break-all',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '16px',
      marginTop: '24px',
    },
    statCard: {
      padding: '16px',
      background: 'rgba(255, 255, 255, 0.03)',
      borderRadius: '10px',
      textAlign: 'center',
    },
    statValue: {
      fontSize: '1.4rem',
      fontWeight: '700',
      color: '#fff',
    },
    statLabel: {
      fontSize: '0.75rem',
      color: 'rgba(255, 255, 255, 0.5)',
      marginTop: '4px',
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    },
    modalContent: {
      background: '#1a1a2e',
      borderRadius: '20px',
      padding: '32px',
      maxWidth: '600px',
      width: '100%',
      maxHeight: '80vh',
      overflow: 'auto',
    },
    modalTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#fff',
      marginBottom: '20px',
    },
    modalClose: {
      position: 'absolute',
      top: '16px',
      right: '16px',
      background: 'none',
      border: 'none',
      color: 'rgba(255, 255, 255, 0.5)',
      fontSize: '1.5rem',
      cursor: 'pointer',
    },
    codeBlock: {
      background: 'rgba(0, 0, 0, 0.4)',
      borderRadius: '8px',
      padding: '16px',
      fontFamily: 'monospace',
      fontSize: '0.85rem',
      color: '#22c55e',
      marginBottom: '16px',
      overflowX: 'auto',
    },
    instructionStep: {
      display: 'flex',
      gap: '12px',
      marginBottom: '16px',
    },
    stepNumber: {
      width: '28px',
      height: '28px',
      background: 'linear-gradient(135deg, #ec4899, #f59e0b)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.85rem',
      fontWeight: '700',
      color: '#fff',
      flexShrink: 0,
    },
    stepText: {
      fontSize: '0.95rem',
      color: 'rgba(255, 255, 255, 0.8)',
      lineHeight: 1.5,
    },
  };

  // Feature icons mapping
  const featureIcons = {
    auth: '🔐',
    points: '⭐',
    tiers: '🏅',
    admin: '👑',
    database: '💾',
    // Appointment booking
    booking: '📅',
    calendar: '📆',
    staff: '👥',
    customers: '👤',
    // Admin dashboard
    dashboard: '🎛️',
    customerMgmt: '👥',
    analytics: '📊',
    notifications: '🔔',
    integrations: '🔗',
    settings: '⚙️',
  };

  // Render success state
  if (generatedProject) {
    return (
      <div style={advancedStyles.container}>
        <div style={advancedStyles.successCard}>
          <div style={advancedStyles.successIcon}>🎉</div>
          <h2 style={advancedStyles.successTitle}>Project Generated!</h2>
          <p style={advancedStyles.successSubtitle}>
            Your {config.businessName} {templateId === 'appointment-booking' ? 'booking system' : templateId === 'admin-dashboard' ? 'dashboard' : 'loyalty program'} is ready
          </p>

          {/* Domain indicator */}
          <div style={{
            marginBottom: '16px',
            padding: '12px 20px',
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '10px',
            textAlign: 'center',
            fontSize: '14px',
            color: 'rgba(255,255,255,0.7)'
          }}>
            📱 Standalone App → <strong style={{ color: '#8b5cf6' }}>
              {config.businessName?.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-') || 'your-app'}.be1st.app
            </strong>
          </div>

          <div style={{ marginBottom: '24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px' }}>
            <button style={advancedStyles.downloadButton} onClick={handleDownload}>
              📦 Download Project
            </button>
            <button
              style={{
                ...advancedStyles.deployButton,
                ...(isDeploying || deployResult ? advancedStyles.deployButtonDisabled : {})
              }}
              onClick={handleDeploy}
              disabled={isDeploying || deployResult}
            >
              {isDeploying ? '🚀 Deploying...' : deployResult ? '✅ Deployed' : '🚀 Deploy to be1st.app'}
            </button>
            <button
              style={advancedStyles.instructionsButton}
              onClick={() => setShowInstructions(true)}
            >
              📖 Instructions
            </button>
          </div>

          {/* Deployment Error */}
          {deployError && (
            <div style={advancedStyles.errorCard}>
              ⚠️ Deployment failed: {deployError}
            </div>
          )}

          {/* Deployment Progress */}
          {isDeploying && deployProgress && (
            <div style={advancedStyles.deployProgressCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.5rem' }}>{deployProgress.icon || '🚀'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: '#fff' }}>{deployProgress.status}</div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>Step: {deployProgress.step}</div>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#8b5cf6' }}>{deployProgress.progress || 0}%</div>
              </div>
              <div style={advancedStyles.deployProgressBar}>
                <div style={{ ...advancedStyles.deployProgressFill, width: `${deployProgress.progress || 0}%` }} />
              </div>
            </div>
          )}

          {/* Deployment Success */}
          {deployResult && deployResult.success && (
            <div style={advancedStyles.deploySuccessCard}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🎊</div>
              <h3 style={{ color: '#22c55e', margin: '0 0 8px 0' }}>Deployed Successfully!</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '16px', fontSize: '0.9rem' }}>
                Your app is now live. Build takes 2-3 minutes to complete on Railway.
              </p>

              <div style={advancedStyles.urlGrid}>
                {deployResult.urls?.frontend && (
                  <div style={advancedStyles.urlCard}>
                    <div style={advancedStyles.urlLabel}>Live Site</div>
                    <a href={deployResult.urls.frontend} target="_blank" rel="noopener noreferrer" style={advancedStyles.urlLink}>
                      {deployResult.urls.frontend}
                    </a>
                  </div>
                )}
                {deployResult.urls?.admin && (
                  <div style={advancedStyles.urlCard}>
                    <div style={advancedStyles.urlLabel}>Admin Panel</div>
                    <a href={deployResult.urls.admin} target="_blank" rel="noopener noreferrer" style={advancedStyles.urlLink}>
                      {deployResult.urls.admin}
                    </a>
                  </div>
                )}
                {deployResult.urls?.railway && (
                  <div style={advancedStyles.urlCard}>
                    <div style={advancedStyles.urlLabel}>Railway Dashboard</div>
                    <a href={deployResult.urls.railway} target="_blank" rel="noopener noreferrer" style={advancedStyles.urlLink}>
                      {deployResult.urls.railway}
                    </a>
                  </div>
                )}
              </div>

              {/* Admin credentials reminder */}
              <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', textAlign: 'left' }}>
                <div style={{ fontWeight: '600', color: '#f59e0b', marginBottom: '8px' }}>🔐 Admin Login</div>
                <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
                  {templateId === 'loyalty-program' && adminEmail ? (
                    <>Login with the credentials you set during generation: <strong>{adminEmail}</strong></>
                  ) : (
                    <>Email: <strong>{deployResult.credentials?.adminEmail}</strong> | Password: <strong>{deployResult.credentials?.adminPassword}</strong></>
                  )}
                </div>
              </div>
            </div>
          )}

          <div style={advancedStyles.statsGrid}>
            <div style={advancedStyles.statCard}>
              <div style={advancedStyles.statValue}>{generatedProject.stats?.files || 0}</div>
              <div style={advancedStyles.statLabel}>Files Generated</div>
            </div>
            <div style={advancedStyles.statCard}>
              <div style={advancedStyles.statValue}>{generatedProject.stats?.linesOfCode || 0}</div>
              <div style={advancedStyles.statLabel}>Lines of Code</div>
            </div>
            <div style={advancedStyles.statCard}>
              <div style={advancedStyles.statValue}>${generatedProject.usage?.costFormatted || '0.00'}</div>
              <div style={advancedStyles.statLabel}>Generation Cost</div>
            </div>
            <div style={advancedStyles.statCard}>
              <div style={advancedStyles.statValue}>{(generatedProject.usage?.durationMs / 1000).toFixed(1)}s</div>
              <div style={advancedStyles.statLabel}>Generation Time</div>
            </div>
          </div>
        </div>

        <button
          style={{ ...advancedStyles.backButton, marginTop: '24px' }}
          onClick={onBack}
        >
          ← Back to Templates
        </button>

        {/* Instructions Modal */}
        {showInstructions && (
          <div style={advancedStyles.modal} onClick={() => setShowInstructions(false)}>
            <div style={advancedStyles.modalContent} onClick={e => e.stopPropagation()}>
              <h3 style={advancedStyles.modalTitle}>🚀 Setup Instructions</h3>

              <div style={advancedStyles.instructionStep}>
                <div style={advancedStyles.stepNumber}>1</div>
                <div style={advancedStyles.stepText}>
                  Extract the downloaded zip file to your desired location
                </div>
              </div>

              <div style={advancedStyles.instructionStep}>
                <div style={advancedStyles.stepNumber}>2</div>
                <div style={advancedStyles.stepText}>
                  Open a terminal in the project folder and install dependencies:
                </div>
              </div>
              <div style={advancedStyles.codeBlock}>npm install</div>

              <div style={advancedStyles.instructionStep}>
                <div style={advancedStyles.stepNumber}>3</div>
                <div style={advancedStyles.stepText}>
                  Copy the example environment file and configure it:
                </div>
              </div>
              <div style={advancedStyles.codeBlock}>cp .env.example .env</div>

              <div style={advancedStyles.instructionStep}>
                <div style={advancedStyles.stepNumber}>4</div>
                <div style={advancedStyles.stepText}>
                  Start the development server:
                </div>
              </div>
              <div style={advancedStyles.codeBlock}>npm run dev</div>

              <div style={advancedStyles.instructionStep}>
                <div style={advancedStyles.stepNumber}>5</div>
                <div style={advancedStyles.stepText}>
                  Open <strong>http://localhost:3000</strong> in your browser
                </div>
              </div>

              <div style={{ ...advancedStyles.instructionStep, marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={advancedStyles.stepText}>
                  <strong>Docker Deployment:</strong><br />
                  For production, use: <code style={{ color: '#22c55e' }}>docker-compose up -d</code>
                </div>
              </div>

              <button
                style={{ ...advancedStyles.instructionsButton, width: '100%', marginTop: '20px' }}
                onClick={() => setShowInstructions(false)}
              >
                Got it!
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={advancedStyles.container}>
      {/* Add keyframes for spinner animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Header */}
      <div style={advancedStyles.header}>
        <button
          style={advancedStyles.backButton}
          onClick={onBack}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          }}
        >
          ← Back
        </button>
        <h1 style={advancedStyles.title}>
          <span>{template.icon}</span>
          {template.name}
        </h1>
      </div>

      <p style={advancedStyles.subtitle}>{template.description}</p>

      {/* Error Display */}
      {error && (
        <div style={advancedStyles.errorCard}>
          ⚠️ {error}
        </div>
      )}

      {/* Generation Progress - Step by Step */}
      {isGenerating && (
        <div style={advancedStyles.progressCard}>
          <h3 style={advancedStyles.progressTitle}>🚀 Building Your Project</h3>
          <div style={advancedStyles.progressSteps}>
            {GENERATION_STEPS.map((step) => {
              const stepStatus = generationSteps[step.id];
              const isActive = stepStatus && !stepStatus.completed;
              const isComplete = stepStatus?.completed;

              return (
                <div
                  key={step.id}
                  style={{
                    ...advancedStyles.progressStep,
                    ...(isActive ? advancedStyles.progressStepActive : {}),
                    ...(isComplete ? advancedStyles.progressStepComplete : {}),
                  }}
                >
                  {/* Icon/Status indicator */}
                  <div style={advancedStyles.progressStepIcon}>
                    {isComplete ? (
                      <span style={advancedStyles.progressStepCheck}>✓</span>
                    ) : isActive ? (
                      <div style={advancedStyles.progressStepSpinner} />
                    ) : (
                      <span style={{ opacity: 0.4 }}>{step.icon}</span>
                    )}
                  </div>

                  {/* Label */}
                  <span style={{
                    ...advancedStyles.progressStepLabel,
                    opacity: isComplete ? 1 : isActive ? 1 : 0.4,
                  }}>
                    {step.label}
                  </span>

                  {/* Status text */}
                  {isComplete && (
                    <span style={{ ...advancedStyles.progressStepStatus, color: '#22c55e' }}>
                      Done
                    </span>
                  )}
                  {isActive && (
                    <span style={advancedStyles.progressStepStatus}>
                      In progress...
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!isGenerating && (
        <>
          {/* Business Details - Common to all templates */}
          <div style={advancedStyles.section}>
            <h3 style={advancedStyles.sectionTitle}>
              <span>📋</span> Business Details
            </h3>
            <div style={advancedStyles.inputGroup}>
              <label style={advancedStyles.label}>Business Name *</label>
              <input
                style={advancedStyles.input}
                type="text"
                placeholder={templateId === 'appointment-booking' ? "Enter your business name (e.g., Style Studio)" : "Enter your business name (e.g., Coffee Corner)"}
                value={config.businessName}
                onChange={e => updateConfig('businessName', e.target.value)}
                onFocus={e => e.target.style.borderColor = 'rgba(236, 72, 153, 0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              />
            </div>
            {templateId === 'appointment-booking' && (
              <div style={advancedStyles.inputGroup}>
                <label style={advancedStyles.label}>Primary Color</label>
                <input
                  style={{ ...advancedStyles.input, width: '150px' }}
                  type="color"
                  value={config.primaryColor || '#8b5cf6'}
                  onChange={e => updateConfig('primaryColor', e.target.value)}
                />
              </div>
            )}
            {templateId === 'loyalty-program' && (
              <>
                <div style={advancedStyles.inputGroup}>
                  <label style={advancedStyles.label}>Points Currency Name</label>
                  <input
                    style={advancedStyles.input}
                    type="text"
                    placeholder="e.g., points, stars, coins"
                    value={config.currency}
                    onChange={e => updateConfig('currency', e.target.value)}
                    onFocus={e => e.target.style.borderColor = 'rgba(236, 72, 153, 0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                  />
                </div>
                <div style={advancedStyles.inputGroup}>
                  <label style={advancedStyles.label}>Earn Rate ({config.currency} per dollar spent)</label>
                  <input
                    style={{ ...advancedStyles.input, width: '150px' }}
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={config.earnRate}
                    onChange={e => updateConfig('earnRate', parseFloat(e.target.value) || 1)}
                    onFocus={e => e.target.style.borderColor = 'rgba(236, 72, 153, 0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                  />
                </div>
              </>
            )}
          </div>

          {/* ═══ LOYALTY PROGRAM: Admin Login Credentials ═══ */}
          {templateId === 'loyalty-program' && (
            <div style={{
              ...advancedStyles.section,
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(236, 72, 153, 0.08))',
              border: '2px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '16px',
              padding: '24px',
            }}>
              <h3 style={{ ...advancedStyles.sectionTitle, color: '#f59e0b' }}>
                <span>🔐</span> Your Admin Login
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: '20px' }}>
                Set your admin credentials now. You'll use these to log in when you launch your app.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                <div style={advancedStyles.inputGroup}>
                  <label style={advancedStyles.label}>Admin Email *</label>
                  <input
                    style={advancedStyles.input}
                    type="email"
                    placeholder="admin@yourbusiness.com"
                    value={adminEmail}
                    onChange={e => setAdminEmail(e.target.value)}
                    onFocus={e => e.target.style.borderColor = 'rgba(245, 158, 11, 0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                  />
                </div>
                <div style={advancedStyles.inputGroup}>
                  <label style={advancedStyles.label}>Admin Password * (min 8 characters)</label>
                  <input
                    style={advancedStyles.input}
                    type="password"
                    placeholder="Enter a secure password"
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    onFocus={e => e.target.style.borderColor = 'rgba(245, 158, 11, 0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                  />
                </div>
                <div style={advancedStyles.inputGroup}>
                  <label style={advancedStyles.label}>Confirm Password *</label>
                  <input
                    style={{
                      ...advancedStyles.input,
                      borderColor: confirmPassword && confirmPassword !== adminPassword
                        ? 'rgba(239, 68, 68, 0.5)'
                        : confirmPassword && confirmPassword === adminPassword
                          ? 'rgba(34, 197, 94, 0.5)'
                          : 'rgba(255, 255, 255, 0.1)'
                    }}
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    onFocus={e => e.target.style.borderColor = 'rgba(245, 158, 11, 0.5)'}
                    onBlur={e => {
                      if (confirmPassword && confirmPassword !== adminPassword) {
                        e.target.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                      } else if (confirmPassword && confirmPassword === adminPassword) {
                        e.target.style.borderColor = 'rgba(34, 197, 94, 0.5)';
                      } else {
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      }
                    }}
                  />
                  {confirmPassword && confirmPassword !== adminPassword && (
                    <span style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                      Passwords do not match
                    </span>
                  )}
                  {confirmPassword && confirmPassword === adminPassword && adminPassword.length >= 8 && (
                    <span style={{ fontSize: '0.8rem', color: '#22c55e', marginTop: '4px', display: 'block' }}>
                      Passwords match
                    </span>
                  )}
                </div>
              </div>
              <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                <strong style={{ color: '#f59e0b' }}>Note:</strong> Your password will be securely hashed and stored in the generated app. You'll use these credentials to log in as admin when you first launch your loyalty program.
              </div>
            </div>
          )}

          {/* ═══ APPOINTMENT BOOKING: Services ═══ */}
          {templateId === 'appointment-booking' && (
            <div style={advancedStyles.section}>
              <h3 style={advancedStyles.sectionTitle}>
                <span>🛎️</span> Services
              </h3>
              <table style={advancedStyles.rewardsTable}>
                <thead>
                  <tr>
                    <th style={advancedStyles.rewardsHeader}>Service Name</th>
                    <th style={advancedStyles.rewardsHeader}>Duration (min)</th>
                    <th style={advancedStyles.rewardsHeader}>Price ($)</th>
                    <th style={{ ...advancedStyles.rewardsHeader, width: '80px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {(config.services || []).map((service, index) => (
                    <tr key={index}>
                      <td style={advancedStyles.rewardsCell}>
                        <input
                          style={advancedStyles.rewardInput}
                          type="text"
                          value={service.name}
                          onChange={e => updateService(index, 'name', e.target.value)}
                        />
                      </td>
                      <td style={advancedStyles.rewardsCell}>
                        <input
                          style={advancedStyles.rewardInput}
                          type="number"
                          min="15"
                          step="15"
                          value={service.duration}
                          onChange={e => updateService(index, 'duration', parseInt(e.target.value) || 30)}
                        />
                      </td>
                      <td style={advancedStyles.rewardsCell}>
                        <input
                          style={advancedStyles.rewardInput}
                          type="number"
                          min="0"
                          value={service.price}
                          onChange={e => updateService(index, 'price', parseInt(e.target.value) || 0)}
                        />
                      </td>
                      <td style={advancedStyles.rewardsCell}>
                        <button style={advancedStyles.removeButton} onClick={() => removeService(index)}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button style={advancedStyles.addButton} onClick={addService}>+ Add Service</button>
            </div>
          )}

          {/* ═══ APPOINTMENT BOOKING: Staff ═══ */}
          {templateId === 'appointment-booking' && (
            <div style={advancedStyles.section}>
              <h3 style={advancedStyles.sectionTitle}>
                <span>👥</span> Staff Members
              </h3>
              {(config.staff || []).map((member, staffIndex) => (
                <div key={staffIndex} style={{ ...advancedStyles.tierCard, borderColor: 'rgba(139, 92, 246, 0.3)', marginBottom: '16px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <input
                      style={{ ...advancedStyles.input, flex: 1, marginRight: '12px' }}
                      type="text"
                      placeholder="Staff name"
                      value={member.name}
                      onChange={e => updateStaff(staffIndex, 'name', e.target.value)}
                    />
                    <button style={advancedStyles.removeButton} onClick={() => removeStaff(staffIndex)}>✕</button>
                  </div>
                  <div style={advancedStyles.tierLabel}>Services offered:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                    {(config.services || []).map((service, serviceIndex) => (
                      <button
                        key={serviceIndex}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '16px',
                          border: '1px solid',
                          borderColor: (member.services || []).includes(serviceIndex) ? 'rgba(34, 197, 94, 0.5)' : 'rgba(255, 255, 255, 0.2)',
                          background: (member.services || []).includes(serviceIndex) ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                          color: (member.services || []).includes(serviceIndex) ? '#22c55e' : 'rgba(255, 255, 255, 0.6)',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                        }}
                        onClick={() => toggleStaffService(staffIndex, serviceIndex)}
                      >
                        {service.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <button style={advancedStyles.addButton} onClick={addStaff}>+ Add Staff Member</button>
            </div>
          )}

          {/* ═══ APPOINTMENT BOOKING: Business Hours ═══ */}
          {templateId === 'appointment-booking' && (
            <div style={advancedStyles.section}>
              <h3 style={advancedStyles.sectionTitle}>
                <span>🕐</span> Business Hours
              </h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                  <div key={day} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                    <span style={{ width: '100px', textTransform: 'capitalize', color: config.businessHours?.[day]?.closed ? 'rgba(255,255,255,0.4)' : '#fff' }}>{day}</span>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={config.businessHours?.[day]?.closed || false}
                        onChange={e => updateBusinessHours(day, 'closed', e.target.checked)}
                      />
                      <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Closed</span>
                    </label>
                    {!config.businessHours?.[day]?.closed && (
                      <>
                        <input
                          style={{ ...advancedStyles.tierInput, width: '100px', marginBottom: 0 }}
                          type="time"
                          value={config.businessHours?.[day]?.open || '09:00'}
                          onChange={e => updateBusinessHours(day, 'open', e.target.value)}
                        />
                        <span style={{ color: 'rgba(255,255,255,0.5)' }}>to</span>
                        <input
                          style={{ ...advancedStyles.tierInput, width: '100px', marginBottom: 0 }}
                          type="time"
                          value={config.businessHours?.[day]?.close || '17:00'}
                          onChange={e => updateBusinessHours(day, 'close', e.target.value)}
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ APPOINTMENT BOOKING: Booking Settings ═══ */}
          {templateId === 'appointment-booking' && (
            <div style={advancedStyles.section}>
              <h3 style={advancedStyles.sectionTitle}>
                <span>⚙️</span> Booking Settings
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                <div style={advancedStyles.inputGroup}>
                  <label style={advancedStyles.label}>Min advance notice (hours)</label>
                  <input
                    style={advancedStyles.input}
                    type="number"
                    min="0"
                    value={config.bookingSettings?.minAdvanceHours || 2}
                    onChange={e => updateBookingSettings('minAdvanceHours', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div style={advancedStyles.inputGroup}>
                  <label style={advancedStyles.label}>Max advance booking (days)</label>
                  <input
                    style={advancedStyles.input}
                    type="number"
                    min="1"
                    value={config.bookingSettings?.maxAdvanceDays || 30}
                    onChange={e => updateBookingSettings('maxAdvanceDays', parseInt(e.target.value) || 30)}
                  />
                </div>
                <div style={advancedStyles.inputGroup}>
                  <label style={advancedStyles.label}>Time slot increment (min)</label>
                  <select
                    style={advancedStyles.rewardSelect}
                    value={config.bookingSettings?.slotDuration || 30}
                    onChange={e => updateBookingSettings('slotDuration', parseInt(e.target.value))}
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">60 minutes</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ═══ ADMIN DASHBOARD: Business Type & Logo ═══ */}
          {templateId === 'admin-dashboard' && (
            <div style={advancedStyles.section}>
              <h3 style={advancedStyles.sectionTitle}>
                <span>🏢</span> Business Profile
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                <div style={advancedStyles.inputGroup}>
                  <label style={advancedStyles.label}>Logo URL (optional)</label>
                  <input
                    style={advancedStyles.input}
                    type="url"
                    placeholder="https://example.com/logo.png"
                    value={config.logoUrl || ''}
                    onChange={e => updateConfig('logoUrl', e.target.value)}
                  />
                </div>
                <div style={advancedStyles.inputGroup}>
                  <label style={advancedStyles.label}>Primary Color</label>
                  <input
                    style={{ ...advancedStyles.input, width: '150px' }}
                    type="color"
                    value={config.primaryColor || '#8b5cf6'}
                    onChange={e => updateConfig('primaryColor', e.target.value)}
                  />
                </div>
                <div style={advancedStyles.inputGroup}>
                  <label style={advancedStyles.label}>Business Type</label>
                  <select
                    style={advancedStyles.rewardSelect}
                    value={config.businessType || 'service'}
                    onChange={e => updateConfig('businessType', e.target.value)}
                  >
                    <option value="retail">Retail / Shop</option>
                    <option value="restaurant">Restaurant / Cafe</option>
                    <option value="salon">Salon / Spa</option>
                    <option value="gym">Gym / Fitness</option>
                    <option value="service">Service Business</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ═══ ADMIN DASHBOARD: Connected Apps ═══ */}
          {templateId === 'admin-dashboard' && (
            <div style={advancedStyles.section}>
              <h3 style={advancedStyles.sectionTitle}>
                <span>🔗</span> Connected Blink Apps
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: '16px' }}>
                Select which Blink apps this dashboard will integrate with
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                {[
                  { id: 'loyalty', icon: '🏆', name: 'Loyalty Program', desc: 'Points, tiers, rewards' },
                  { id: 'booking', icon: '📅', name: 'Appointment Booking', desc: 'Calendar, scheduling' },
                  { id: 'website', icon: '🌐', name: 'Website', desc: 'Contact forms, leads' },
                  { id: 'inventory', icon: '📦', name: 'Inventory', desc: 'Stock tracking' },
                ].map(app => (
                  <button
                    key={app.id}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: '2px solid',
                      borderColor: config.connectedApps?.[app.id] ? 'rgba(34, 197, 94, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                      background: config.connectedApps?.[app.id] ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                    }}
                    onClick={() => toggleConnectedApp(app.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '1.5rem' }}>{app.icon}</span>
                      <span style={{ fontWeight: '600', color: config.connectedApps?.[app.id] ? '#22c55e' : '#fff' }}>{app.name}</span>
                      {config.connectedApps?.[app.id] && <span style={{ marginLeft: 'auto', color: '#22c55e' }}>✓</span>}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{app.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ═══ ADMIN DASHBOARD: Staff & Permissions ═══ */}
          {templateId === 'admin-dashboard' && (
            <div style={advancedStyles.section}>
              <h3 style={advancedStyles.sectionTitle}>
                <span>👥</span> Staff & Permissions
              </h3>
              {(config.staff || []).map((member, staffIndex) => (
                <div key={staffIndex} style={{
                  ...advancedStyles.tierCard,
                  borderColor: member.role === 'owner' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(139, 92, 246, 0.3)',
                  marginBottom: '16px',
                  padding: '16px'
                }}>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <input
                      style={{ ...advancedStyles.input, flex: '1', minWidth: '150px' }}
                      type="text"
                      placeholder="Name"
                      value={member.name}
                      onChange={e => updateAdminStaff(staffIndex, 'name', e.target.value)}
                      disabled={staffIndex === 0}
                    />
                    <input
                      style={{ ...advancedStyles.input, flex: '1', minWidth: '200px' }}
                      type="email"
                      placeholder="Email"
                      value={member.email}
                      onChange={e => updateAdminStaff(staffIndex, 'email', e.target.value)}
                    />
                    <select
                      style={{ ...advancedStyles.rewardSelect, width: '120px' }}
                      value={member.role}
                      onChange={e => updateAdminStaff(staffIndex, 'role', e.target.value)}
                      disabled={staffIndex === 0}
                    >
                      <option value="owner">Owner</option>
                      <option value="manager">Manager</option>
                      <option value="staff">Staff</option>
                    </select>
                    {staffIndex !== 0 && (
                      <button style={advancedStyles.removeButton} onClick={() => removeAdminStaff(staffIndex)}>✕</button>
                    )}
                  </div>
                  {member.role !== 'owner' && (
                    <>
                      <div style={advancedStyles.tierLabel}>Permissions:</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                        {[
                          { id: 'customers', label: 'Customers' },
                          { id: 'bookings', label: 'Bookings' },
                          { id: 'loyalty', label: 'Loyalty' },
                          { id: 'analytics', label: 'Analytics' },
                          { id: 'settings', label: 'Settings' },
                        ].map(perm => (
                          <button
                            key={perm.id}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '16px',
                              border: '1px solid',
                              borderColor: (member.permissions || []).includes(perm.id) ? 'rgba(139, 92, 246, 0.5)' : 'rgba(255, 255, 255, 0.2)',
                              background: (member.permissions || []).includes(perm.id) ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                              color: (member.permissions || []).includes(perm.id) ? '#a78bfa' : 'rgba(255, 255, 255, 0.6)',
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                            }}
                            onClick={() => toggleAdminPermission(staffIndex, perm.id)}
                          >
                            {perm.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  {member.role === 'owner' && (
                    <div style={{ fontSize: '0.8rem', color: 'rgba(245, 158, 11, 0.8)', marginTop: '8px' }}>
                      👑 Owner has full access to all features
                    </div>
                  )}
                </div>
              ))}
              <button style={advancedStyles.addButton} onClick={addAdminStaff}>+ Add Staff Member</button>
            </div>
          )}

          {/* ═══ ADMIN DASHBOARD: Business Hours ═══ */}
          {templateId === 'admin-dashboard' && (
            <div style={advancedStyles.section}>
              <h3 style={advancedStyles.sectionTitle}>
                <span>🕐</span> Business Hours
              </h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                  <div key={day} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                    <span style={{ width: '100px', textTransform: 'capitalize', color: config.businessHours?.[day]?.closed ? 'rgba(255,255,255,0.4)' : '#fff' }}>{day}</span>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={config.businessHours?.[day]?.closed || false}
                        onChange={e => updateBusinessHours(day, 'closed', e.target.checked)}
                      />
                      <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Closed</span>
                    </label>
                    {!config.businessHours?.[day]?.closed && (
                      <>
                        <input
                          style={{ ...advancedStyles.tierInput, width: '100px', marginBottom: 0 }}
                          type="time"
                          value={config.businessHours?.[day]?.open || '09:00'}
                          onChange={e => updateBusinessHours(day, 'open', e.target.value)}
                        />
                        <span style={{ color: 'rgba(255,255,255,0.5)' }}>to</span>
                        <input
                          style={{ ...advancedStyles.tierInput, width: '100px', marginBottom: 0 }}
                          type="time"
                          value={config.businessHours?.[day]?.close || '17:00'}
                          onChange={e => updateBusinessHours(day, 'close', e.target.value)}
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ LOYALTY PROGRAM: Reward Tiers ═══ */}
          {templateId === 'loyalty-program' && (
            <div style={advancedStyles.section}>
              <h3 style={advancedStyles.sectionTitle}>
                <span>🏅</span> Reward Tiers
              </h3>
              <div style={advancedStyles.tiersGrid}>
                {(config.tiers || []).map((tier, index) => (
                  <div
                    key={index}
                    style={{
                      ...advancedStyles.tierCard,
                      borderColor: tier.color + '40',
                    }}
                  >
                    <div style={{ ...advancedStyles.tierName, color: tier.color }}>{tier.name}</div>
                    <div style={advancedStyles.tierLabel}>Min {config.currency}</div>
                    <input
                      style={advancedStyles.tierInput}
                      type="number"
                      value={tier.minPoints}
                      onChange={e => updateTier(index, 'minPoints', parseInt(e.target.value) || 0)}
                    />
                    <div style={advancedStyles.tierLabel}>Points Multiplier</div>
                    <input
                      style={advancedStyles.tierInput}
                      type="number"
                      step="0.25"
                      value={tier.multiplier}
                      onChange={e => updateTier(index, 'multiplier', parseFloat(e.target.value) || 1)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ LOYALTY PROGRAM: Rewards ═══ */}
          {templateId === 'loyalty-program' && (
            <div style={advancedStyles.section}>
              <h3 style={advancedStyles.sectionTitle}>
                <span>🎁</span> Redeemable Rewards
              </h3>
              <table style={advancedStyles.rewardsTable}>
                <thead>
                  <tr>
                    <th style={advancedStyles.rewardsHeader}>Reward Name</th>
                    <th style={advancedStyles.rewardsHeader}>Cost ({config.currency})</th>
                    <th style={advancedStyles.rewardsHeader}>Type</th>
                    <th style={{ ...advancedStyles.rewardsHeader, width: '80px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {(config.rewards || []).map((reward, index) => (
                    <tr key={index}>
                      <td style={advancedStyles.rewardsCell}>
                        <input
                          style={advancedStyles.rewardInput}
                          type="text"
                          value={reward.name}
                          onChange={e => updateReward(index, 'name', e.target.value)}
                        />
                      </td>
                      <td style={advancedStyles.rewardsCell}>
                        <input
                          style={advancedStyles.rewardInput}
                          type="number"
                          value={reward.cost}
                          onChange={e => updateReward(index, 'cost', parseInt(e.target.value) || 0)}
                        />
                      </td>
                      <td style={advancedStyles.rewardsCell}>
                        <select
                          style={advancedStyles.rewardSelect}
                          value={reward.type}
                          onChange={e => updateReward(index, 'type', e.target.value)}
                        >
                          <option value="discount">Discount</option>
                          <option value="freebie">Free Item</option>
                          <option value="exclusive">Exclusive Access</option>
                          <option value="merchandise">Merchandise</option>
                        </select>
                      </td>
                      <td style={advancedStyles.rewardsCell}>
                        <button
                          style={advancedStyles.removeButton}
                          onClick={() => removeReward(index)}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button style={advancedStyles.addButton} onClick={addReward}>
                + Add Reward
              </button>
            </div>
          )}

          {/* Features Included - Common to all templates */}
          <div style={advancedStyles.section}>
            <h3 style={advancedStyles.sectionTitle}>
              <span>✨</span> Features Included
            </h3>
            <div style={advancedStyles.featuresGrid}>
              {template.features.map(feature => (
                <div key={feature.id} style={advancedStyles.featureCard}>
                  <div style={advancedStyles.featureIcon}>{featureIcons[feature.id]}</div>
                  <div style={advancedStyles.featureName}>{feature.name}</div>
                  <div style={advancedStyles.featureDesc}>{feature.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Estimate */}
          <div style={advancedStyles.costCard}>
            <div style={advancedStyles.costTitle}>Estimated Generation Cost</div>
            <div style={advancedStyles.costValue}>{estimatedCost.display}</div>
          </div>

          {/* Generate Button */}
          <button
            style={{
              ...advancedStyles.generateButton,
              ...(isGenerating || !config.businessName.trim() ? advancedStyles.generateButtonDisabled : {}),
            }}
            onClick={handleGenerate}
            disabled={isGenerating || !config.businessName.trim()}
            onMouseEnter={e => {
              if (!isGenerating && config.businessName.trim()) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(236, 72, 153, 0.4)';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(236, 72, 153, 0.3)';
            }}
          >
            ⚡ Generate Full Stack Project
          </button>
        </>
      )}
    </div>
  );
}
