/**
 * Customer Service Setup Wizard
 * Initial onboarding wizard for setting up customer service operations
 *
 * Steps:
 * 1. Welcome - Introduction to the customer service platform
 * 2. Service Type - What kind of support are you providing?
 * 3. Business Info - Company details and industry
 * 4. Channels - Communication channels setup
 * 5. Team - Team structure and roles
 * 6. Review - Summary and launch
 */

import React, { useState, useEffect } from 'react';
import { WizardBreadcrumb, CollapsibleSection } from './wizard';
import CustomerServiceAssistant from './CustomerServiceAssistant';

const STEPS = [
  { id: 'welcome', name: 'Welcome', icon: '👋' },
  { id: 'service-type', name: 'Service Type', icon: '🎯' },
  { id: 'business', name: 'Business', icon: '🏢' },
  { id: 'channels', name: 'Channels', icon: '📡' },
  { id: 'team', name: 'Team', icon: '👥' },
  { id: 'review', name: 'Review', icon: '✅' }
];

const SERVICE_TYPES = [
  {
    id: 'helpdesk',
    icon: '🎫',
    name: 'Help Desk',
    desc: 'Traditional ticket-based support with queue management',
    features: ['Ticket tracking', 'SLA management', 'Priority levels', 'Assignment rules'],
    color: '#22c55e',
    recommended: true
  },
  {
    id: 'live-chat',
    icon: '💬',
    name: 'Live Chat Support',
    desc: 'Real-time chat with customers on your website or app',
    features: ['Instant messaging', 'Chat routing', 'Canned responses', 'File sharing'],
    color: '#3b82f6'
  },
  {
    id: 'call-center',
    icon: '📞',
    name: 'Call Center',
    desc: 'Phone-based support with call routing and IVR',
    features: ['Call queues', 'IVR menus', 'Call recording', 'Callbacks'],
    color: '#8b5cf6'
  },
  {
    id: 'omnichannel',
    icon: '🌐',
    name: 'Omnichannel',
    desc: 'Unified support across all communication channels',
    features: ['All channels', 'Unified inbox', 'Customer timeline', 'Cross-channel context'],
    color: '#f97316'
  }
];

const CHANNEL_OPTIONS = [
  { id: 'email', icon: '📧', name: 'Email', desc: 'Support via email ticketing' },
  { id: 'chat', icon: '💬', name: 'Live Chat', desc: 'Real-time website chat widget' },
  { id: 'phone', icon: '📞', name: 'Phone', desc: 'Voice call support' },
  { id: 'social', icon: '📱', name: 'Social Media', desc: 'Facebook, Twitter, Instagram' },
  { id: 'whatsapp', icon: '💚', name: 'WhatsApp', desc: 'WhatsApp Business messaging' },
  { id: 'sms', icon: '📲', name: 'SMS', desc: 'Text message support' }
];

const TEAM_SIZES = [
  { id: 'solo', name: 'Just Me', desc: 'Solo operation', agents: '1' },
  { id: 'small', name: 'Small Team', desc: '2-5 agents', agents: '2-5' },
  { id: 'medium', name: 'Medium Team', desc: '6-20 agents', agents: '6-20' },
  { id: 'large', name: 'Large Team', desc: '21-50 agents', agents: '21-50' },
  { id: 'enterprise', name: 'Enterprise', desc: '50+ agents', agents: '50+' }
];

const SUPPORT_HOURS = [
  { id: 'business', name: 'Business Hours', desc: '9 AM - 5 PM, Mon-Fri' },
  { id: 'extended', name: 'Extended Hours', desc: '8 AM - 8 PM, Mon-Sat' },
  { id: '24-5', name: '24/5 Support', desc: '24 hours, weekdays only' },
  { id: '24-7', name: '24/7 Support', desc: 'Round-the-clock coverage' }
];

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '80vh',
    maxWidth: '900px',
    margin: '0 auto',
    padding: '32px 24px'
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px'
  },
  stepIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '24px',
    flexWrap: 'wrap'
  },
  stepDot: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.9rem',
    fontWeight: '600',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '2px solid rgba(255, 255, 255, 0.15)',
    color: '#666',
    transition: 'all 0.3s ease'
  },
  stepDotActive: {
    background: 'rgba(99, 102, 241, 0.2)',
    borderColor: '#6366f1',
    color: '#a5b4fc',
    boxShadow: '0 0 0 4px rgba(99, 102, 241, 0.15)'
  },
  stepDotComplete: {
    background: 'rgba(34, 197, 94, 0.2)',
    borderColor: '#22c55e',
    color: '#22c55e'
  },
  stepLine: {
    width: '32px',
    height: '2px',
    background: 'rgba(255, 255, 255, 0.1)'
  },
  stepLineComplete: {
    background: '#22c55e'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '8px',
    background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#888',
    marginBottom: '0'
  },
  content: {
    flex: 1,
    marginBottom: '24px'
  },
  section: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '28px',
    marginBottom: '20px'
  },
  sectionTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  // Welcome step styles
  welcomeHero: {
    textAlign: 'center',
    padding: '40px 20px'
  },
  welcomeIcon: {
    fontSize: '4rem',
    marginBottom: '20px',
    display: 'block'
  },
  welcomeTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '16px',
    background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  welcomeDesc: {
    fontSize: '1.15rem',
    color: '#888',
    maxWidth: '600px',
    margin: '0 auto 32px auto',
    lineHeight: 1.6
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    marginTop: '32px'
  },
  featureCard: {
    padding: '24px 20px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '14px',
    textAlign: 'center'
  },
  featureIcon: {
    fontSize: '2rem',
    marginBottom: '12px',
    display: 'block'
  },
  featureTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '6px'
  },
  featureDesc: {
    fontSize: '0.85rem',
    color: '#888',
    margin: 0
  },
  // Service type cards
  serviceTypeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px'
  },
  serviceCard: {
    position: 'relative',
    padding: '24px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '2px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'left'
  },
  serviceCardSelected: {
    borderColor: '#6366f1',
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.08))',
    boxShadow: '0 0 0 1px rgba(99, 102, 241, 0.3), 0 8px 24px rgba(99, 102, 241, 0.2)'
  },
  serviceCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '12px'
  },
  serviceIcon: {
    fontSize: '2rem'
  },
  serviceName: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#fff',
    margin: 0
  },
  serviceDesc: {
    fontSize: '0.9rem',
    color: '#888',
    marginBottom: '14px'
  },
  serviceFeatures: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px'
  },
  serviceFeatureTag: {
    padding: '4px 10px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '10px',
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.7)'
  },
  recommendedBadge: {
    position: 'absolute',
    top: '-10px',
    right: '16px',
    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
    color: '#fff',
    padding: '5px 14px',
    borderRadius: '12px',
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '0.5px'
  },
  selectedCheck: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    width: '26px',
    height: '26px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    color: '#fff',
    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)'
  },
  // Input styles
  inputGroup: {
    marginBottom: '20px'
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '500',
    color: '#aaa',
    marginBottom: '8px',
    display: 'block'
  },
  required: {
    color: '#ef4444',
    marginLeft: '4px'
  },
  input: {
    width: '100%',
    padding: '14px 18px',
    fontSize: '1rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: '#fff',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box'
  },
  inputHint: {
    fontSize: '0.8rem',
    color: '#666',
    marginTop: '8px',
    fontStyle: 'italic'
  },
  inputRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },
  // Channel selection
  channelGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px'
  },
  channelCard: {
    position: 'relative',
    padding: '18px 16px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '2px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'center'
  },
  channelCardSelected: {
    borderColor: '#6366f1',
    background: 'rgba(99, 102, 241, 0.1)'
  },
  channelIcon: {
    fontSize: '2rem',
    marginBottom: '10px',
    display: 'block'
  },
  channelName: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '4px'
  },
  channelDesc: {
    fontSize: '0.75rem',
    color: '#888'
  },
  channelCheck: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '20px',
    height: '20px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    color: '#fff'
  },
  // Team settings
  teamSizeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '12px',
    marginBottom: '24px'
  },
  teamSizeCard: {
    padding: '16px 12px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '2px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'center'
  },
  teamSizeSelected: {
    borderColor: '#6366f1',
    background: 'rgba(99, 102, 241, 0.1)'
  },
  teamSizeName: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '4px'
  },
  teamSizeDesc: {
    fontSize: '0.7rem',
    color: '#888'
  },
  hoursGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px'
  },
  hoursCard: {
    padding: '18px 16px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '2px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },
  hoursCardSelected: {
    borderColor: '#6366f1',
    background: 'rgba(99, 102, 241, 0.1)'
  },
  hoursRadio: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  hoursRadioSelected: {
    borderColor: '#6366f1',
    background: '#6366f1'
  },
  hoursContent: {
    flex: 1
  },
  hoursName: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '2px'
  },
  hoursDesc: {
    fontSize: '0.8rem',
    color: '#888'
  },
  // Review step styles
  reviewSection: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px'
  },
  reviewTitle: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#6366f1',
    marginBottom: '14px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  reviewItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
  },
  reviewLabel: {
    fontSize: '0.9rem',
    color: '#888'
  },
  reviewValue: {
    fontSize: '0.9rem',
    color: '#fff',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  reviewTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    justifyContent: 'flex-end'
  },
  reviewTag: {
    padding: '4px 10px',
    background: 'rgba(99, 102, 241, 0.15)',
    borderRadius: '8px',
    fontSize: '0.75rem',
    color: '#a5b4fc'
  },
  readyBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px 24px',
    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.1))',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    borderRadius: '14px',
    marginTop: '20px'
  },
  readyIcon: {
    fontSize: '2.5rem'
  },
  readyContent: {
    flex: 1
  },
  readyTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#22c55e',
    marginBottom: '4px'
  },
  readyDesc: {
    fontSize: '0.9rem',
    color: '#888',
    margin: 0
  },
  // Actions
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '24px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)'
  },
  backBtn: {
    padding: '14px 28px',
    fontSize: '0.95rem',
    background: 'transparent',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    cursor: 'pointer',
    color: '#888',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  },
  nextBtn: {
    padding: '14px 36px',
    fontSize: '1rem',
    fontWeight: '600',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)'
  },
  nextBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  launchBtn: {
    padding: '16px 44px',
    fontSize: '1.1rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 20px rgba(34, 197, 94, 0.4)'
  },
  skipBtn: {
    padding: '8px 16px',
    fontSize: '0.85rem',
    background: 'transparent',
    border: 'none',
    color: '#666',
    cursor: 'pointer',
    textDecoration: 'underline'
  }
};

export function CustomerServiceSetupWizard({
  onComplete,
  onSkip,
  onBack,
  initialData = {}
}) {
  const [currentStep, setCurrentStep] = useState(0);

  // Wizard state
  const [serviceType, setServiceType] = useState(initialData.serviceType || null);
  const [companyName, setCompanyName] = useState(initialData.companyName || '');
  const [industry, setIndustry] = useState(initialData.industry || '');
  const [supportEmail, setSupportEmail] = useState(initialData.supportEmail || '');
  const [channels, setChannels] = useState(initialData.channels || ['email']);
  const [teamSize, setTeamSize] = useState(initialData.teamSize || 'small');
  const [supportHours, setSupportHours] = useState(initialData.supportHours || 'business');
  const [enableAI, setEnableAI] = useState(initialData.enableAI !== false);
  const [enableSLA, setEnableSLA] = useState(initialData.enableSLA !== false);

  // Hover states
  const [hoveredService, setHoveredService] = useState(null);
  const [hoveredChannel, setHoveredChannel] = useState(null);

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Welcome
        return true;
      case 1: // Service Type
        return serviceType !== null;
      case 2: // Business
        return companyName.trim().length > 0;
      case 3: // Channels
        return channels.length > 0;
      case 4: // Team
        return teamSize !== null && supportHours !== null;
      case 5: // Review
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else if (onBack) {
      onBack();
    }
  };

  const toggleChannel = (channelId) => {
    setChannels(prev =>
      prev.includes(channelId)
        ? prev.filter(c => c !== channelId)
        : [...prev, channelId]
    );
  };

  const handleComplete = () => {
    const setupData = {
      serviceType,
      companyName,
      industry,
      supportEmail,
      channels,
      teamSize,
      supportHours,
      enableAI,
      enableSLA,
      completedAt: new Date().toISOString()
    };

    // Save to localStorage for persistence
    localStorage.setItem('customer_service_setup_complete', 'true');
    localStorage.setItem('customer_service_setup_data', JSON.stringify(setupData));

    if (onComplete) {
      onComplete(setupData);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderWelcomeStep();
      case 1:
        return renderServiceTypeStep();
      case 2:
        return renderBusinessStep();
      case 3:
        return renderChannelsStep();
      case 4:
        return renderTeamStep();
      case 5:
        return renderReviewStep();
      default:
        return null;
    }
  };

  const renderWelcomeStep = () => (
    <div style={styles.welcomeHero}>
      <span style={styles.welcomeIcon}>🎧</span>
      <h1 style={styles.welcomeTitle}>Customer Service Hub</h1>
      <p style={styles.welcomeDesc}>
        Set up your customer service operations in minutes. We'll help you configure
        support channels, team structure, and automation to deliver exceptional customer experiences.
      </p>

      <div style={styles.featureGrid}>
        <div style={styles.featureCard}>
          <span style={styles.featureIcon}>📥</span>
          <div style={styles.featureTitle}>Unified Inbox</div>
          <p style={styles.featureDesc}>All customer conversations in one place</p>
        </div>
        <div style={styles.featureCard}>
          <span style={styles.featureIcon}>🤖</span>
          <div style={styles.featureTitle}>AI-Powered</div>
          <p style={styles.featureDesc}>Smart routing, suggestions, and automation</p>
        </div>
        <div style={styles.featureCard}>
          <span style={styles.featureIcon}>📊</span>
          <div style={styles.featureTitle}>Analytics</div>
          <p style={styles.featureDesc}>Track performance and customer satisfaction</p>
        </div>
      </div>
    </div>
  );

  const renderServiceTypeStep = () => (
    <div>
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          <span>🎯</span> What type of support will you provide?
        </div>

        <div style={styles.serviceTypeGrid}>
          {SERVICE_TYPES.map(service => (
            <div
              key={service.id}
              style={{
                ...styles.serviceCard,
                ...(serviceType === service.id ? styles.serviceCardSelected : {}),
                ...(hoveredService === service.id && serviceType !== service.id ? {
                  borderColor: `${service.color}60`,
                  background: `${service.color}08`,
                  transform: 'translateY(-2px)'
                } : {})
              }}
              onClick={() => setServiceType(service.id)}
              onMouseEnter={() => setHoveredService(service.id)}
              onMouseLeave={() => setHoveredService(null)}
            >
              {service.recommended && (
                <div style={styles.recommendedBadge}>RECOMMENDED</div>
              )}
              {serviceType === service.id && (
                <div style={styles.selectedCheck}>✓</div>
              )}

              <div style={styles.serviceCardHeader}>
                <span style={styles.serviceIcon}>{service.icon}</span>
                <h3 style={styles.serviceName}>{service.name}</h3>
              </div>

              <p style={styles.serviceDesc}>{service.desc}</p>

              <div style={styles.serviceFeatures}>
                {service.features.map((feature, i) => (
                  <span key={i} style={styles.serviceFeatureTag}>{feature}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBusinessStep = () => (
    <div>
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          <span>🏢</span> Tell us about your company
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>
            Company Name
            <span style={styles.required}>*</span>
          </label>
          <input
            type="text"
            placeholder="e.g., Acme Corporation, TechStart Inc."
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            style={styles.input}
            autoFocus
          />
          <div style={styles.inputHint}>
            This will appear in customer-facing communications
          </div>
        </div>

        <div style={styles.inputRow}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Industry (optional)</label>
            <input
              type="text"
              placeholder="e.g., SaaS, E-commerce, Healthcare"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Support Email (optional)</label>
            <input
              type="email"
              placeholder="e.g., support@yourcompany.com"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              style={styles.input}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderChannelsStep = () => (
    <div>
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          <span>📡</span> Select your support channels
        </div>
        <p style={{ color: '#888', marginBottom: '20px', marginTop: '-10px' }}>
          Choose the channels your customers will use to reach you. You can add more later.
        </p>

        <div style={styles.channelGrid}>
          {CHANNEL_OPTIONS.map(channel => (
            <div
              key={channel.id}
              style={{
                ...styles.channelCard,
                ...(channels.includes(channel.id) ? styles.channelCardSelected : {}),
                ...(hoveredChannel === channel.id && !channels.includes(channel.id) ? {
                  borderColor: 'rgba(99, 102, 241, 0.4)',
                  transform: 'translateY(-2px)'
                } : {})
              }}
              onClick={() => toggleChannel(channel.id)}
              onMouseEnter={() => setHoveredChannel(channel.id)}
              onMouseLeave={() => setHoveredChannel(null)}
            >
              {channels.includes(channel.id) && (
                <div style={styles.channelCheck}>✓</div>
              )}
              <span style={styles.channelIcon}>{channel.icon}</span>
              <div style={styles.channelName}>{channel.name}</div>
              <div style={styles.channelDesc}>{channel.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTeamStep = () => (
    <div>
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          <span>👥</span> Team Size
        </div>

        <div style={styles.teamSizeGrid}>
          {TEAM_SIZES.map(size => (
            <div
              key={size.id}
              style={{
                ...styles.teamSizeCard,
                ...(teamSize === size.id ? styles.teamSizeSelected : {})
              }}
              onClick={() => setTeamSize(size.id)}
            >
              <div style={styles.teamSizeName}>{size.name}</div>
              <div style={styles.teamSizeDesc}>{size.agents} agents</div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          <span>🕐</span> Support Hours
        </div>

        <div style={styles.hoursGrid}>
          {SUPPORT_HOURS.map(hours => (
            <div
              key={hours.id}
              style={{
                ...styles.hoursCard,
                ...(supportHours === hours.id ? styles.hoursCardSelected : {})
              }}
              onClick={() => setSupportHours(hours.id)}
            >
              <div style={{
                ...styles.hoursRadio,
                ...(supportHours === hours.id ? styles.hoursRadioSelected : {})
              }}>
                {supportHours === hours.id && (
                  <span style={{ color: '#fff', fontSize: '10px' }}>✓</span>
                )}
              </div>
              <div style={styles.hoursContent}>
                <div style={styles.hoursName}>{hours.name}</div>
                <div style={styles.hoursDesc}>{hours.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          <span>⚙️</span> Additional Features
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            padding: '14px 18px',
            background: enableAI ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
            border: '1px solid',
            borderColor: enableAI ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255,255,255,0.1)',
            borderRadius: '10px',
            transition: 'all 0.2s ease'
          }}>
            <input
              type="checkbox"
              checked={enableAI}
              onChange={(e) => setEnableAI(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: '#6366f1' }}
            />
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: '500', color: '#fff' }}>
                Enable AI Assistant
              </div>
              <div style={{ fontSize: '0.8rem', color: '#888' }}>
                Get AI-powered response suggestions and auto-categorization
              </div>
            </div>
          </label>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            padding: '14px 18px',
            background: enableSLA ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
            border: '1px solid',
            borderColor: enableSLA ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255,255,255,0.1)',
            borderRadius: '10px',
            transition: 'all 0.2s ease'
          }}>
            <input
              type="checkbox"
              checked={enableSLA}
              onChange={(e) => setEnableSLA(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: '#6366f1' }}
            />
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: '500', color: '#fff' }}>
                Enable SLA Tracking
              </div>
              <div style={{ fontSize: '0.8rem', color: '#888' }}>
                Track response and resolution times against service level agreements
              </div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderReviewStep = () => {
    const selectedService = SERVICE_TYPES.find(s => s.id === serviceType);
    const selectedTeamSize = TEAM_SIZES.find(t => t.id === teamSize);
    const selectedHours = SUPPORT_HOURS.find(h => h.id === supportHours);
    const selectedChannels = CHANNEL_OPTIONS.filter(c => channels.includes(c.id));

    return (
      <div>
        <div style={styles.reviewSection}>
          <div style={styles.reviewTitle}>Service Configuration</div>
          <div style={styles.reviewItem}>
            <span style={styles.reviewLabel}>Service Type</span>
            <span style={styles.reviewValue}>
              <span>{selectedService?.icon}</span>
              {selectedService?.name}
            </span>
          </div>
          <div style={styles.reviewItem}>
            <span style={styles.reviewLabel}>Company Name</span>
            <span style={styles.reviewValue}>{companyName}</span>
          </div>
          {industry && (
            <div style={styles.reviewItem}>
              <span style={styles.reviewLabel}>Industry</span>
              <span style={styles.reviewValue}>{industry}</span>
            </div>
          )}
          {supportEmail && (
            <div style={styles.reviewItem}>
              <span style={styles.reviewLabel}>Support Email</span>
              <span style={styles.reviewValue}>{supportEmail}</span>
            </div>
          )}
        </div>

        <div style={styles.reviewSection}>
          <div style={styles.reviewTitle}>Support Channels</div>
          <div style={{ ...styles.reviewItem, borderBottom: 'none' }}>
            <span style={styles.reviewLabel}>Active Channels</span>
            <div style={styles.reviewTags}>
              {selectedChannels.map(channel => (
                <span key={channel.id} style={styles.reviewTag}>
                  {channel.icon} {channel.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div style={styles.reviewSection}>
          <div style={styles.reviewTitle}>Team Settings</div>
          <div style={styles.reviewItem}>
            <span style={styles.reviewLabel}>Team Size</span>
            <span style={styles.reviewValue}>
              {selectedTeamSize?.name} ({selectedTeamSize?.agents} agents)
            </span>
          </div>
          <div style={styles.reviewItem}>
            <span style={styles.reviewLabel}>Support Hours</span>
            <span style={styles.reviewValue}>{selectedHours?.name}</span>
          </div>
          <div style={styles.reviewItem}>
            <span style={styles.reviewLabel}>AI Assistant</span>
            <span style={styles.reviewValue}>
              {enableAI ? '✅ Enabled' : '❌ Disabled'}
            </span>
          </div>
          <div style={styles.reviewItem}>
            <span style={styles.reviewLabel}>SLA Tracking</span>
            <span style={styles.reviewValue}>
              {enableSLA ? '✅ Enabled' : '❌ Disabled'}
            </span>
          </div>
        </div>

        <div style={styles.readyBanner}>
          <span style={styles.readyIcon}>🎉</span>
          <div style={styles.readyContent}>
            <div style={styles.readyTitle}>You're all set!</div>
            <p style={styles.readyDesc}>
              Click "Launch Support Hub" to start handling customer inquiries.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Header with Step Indicator */}
      <div style={styles.header}>
        <div style={styles.stepIndicator}>
          {STEPS.map((step, idx) => (
            <React.Fragment key={step.id}>
              <div
                style={{
                  ...styles.stepDot,
                  ...(idx === currentStep ? styles.stepDotActive : {}),
                  ...(idx < currentStep ? styles.stepDotComplete : {})
                }}
                title={step.name}
              >
                {idx < currentStep ? '✓' : step.icon}
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  style={{
                    ...styles.stepLine,
                    ...(idx < currentStep ? styles.stepLineComplete : {})
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <h1 style={styles.title}>
          {STEPS[currentStep].icon} {STEPS[currentStep].name}
        </h1>
        <p style={styles.subtitle}>
          {currentStep === 0 && 'Set up your customer service operations'}
          {currentStep === 1 && 'Choose your support model'}
          {currentStep === 2 && 'Tell us about your company'}
          {currentStep === 3 && 'Configure communication channels'}
          {currentStep === 4 && 'Set up your support team'}
          {currentStep === 5 && 'Review your setup and launch'}
        </p>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {renderStepContent()}
      </div>

      {/* Actions */}
      <div style={styles.actions}>
        <div>
          {currentStep > 0 ? (
            <button style={styles.backBtn} onClick={handleBack}>
              ← Back
            </button>
          ) : onSkip ? (
            <button style={styles.skipBtn} onClick={onSkip}>
              Skip setup
            </button>
          ) : (
            <div />
          )}
        </div>

        {currentStep < STEPS.length - 1 ? (
          <button
            style={{
              ...styles.nextBtn,
              ...(!canProceed() ? styles.nextBtnDisabled : {})
            }}
            onClick={handleNext}
            disabled={!canProceed()}
          >
            Continue <span>→</span>
          </button>
        ) : (
          <button
            style={styles.launchBtn}
            onClick={handleComplete}
          >
            <span>🚀</span> Launch Support Hub
          </button>
        )}
      </div>

      {/* AI Assistant */}
      <CustomerServiceAssistant
        currentStep={STEPS[currentStep].id}
        wizardContext={{
          serviceType,
          companyName,
          industry,
          supportEmail,
          channels,
          teamSize,
          supportHours,
          enableAI,
          enableSLA
        }}
        onSuggestion={(suggestion) => {
          if (suggestion.serviceType) setServiceType(suggestion.serviceType);
          if (suggestion.teamSize) setTeamSize(suggestion.teamSize);
          if (suggestion.supportHours) setSupportHours(suggestion.supportHours);
          if (suggestion.companyName) setCompanyName(suggestion.companyName);
          if (suggestion.industry) setIndustry(suggestion.industry);
          if (suggestion.channels) setChannels(suggestion.channels);
        }}
      />

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 768px) {
          .feature-grid,
          .service-type-grid {
            grid-template-columns: 1fr !important;
          }
          .channel-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .team-size-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
          .hours-grid,
          .input-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default CustomerServiceSetupWizard;
