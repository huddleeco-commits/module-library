/**
 * CardFlow Setup Wizard
 * Initial onboarding wizard that guides users through platform setup
 *
 * Steps:
 * 1. Welcome - Introduction to Blink platform
 * 2. Project Type - What are you building?
 * 3. Business Profile - Basic business information
 * 4. Preferences - UI and workflow preferences
 * 5. Review - Summary and launch
 */

import React, { useState, useEffect } from 'react';
import { WizardBreadcrumb, CollapsibleSection } from '../components/wizard';
import CardFlowAssistant from '../components/CardFlowAssistant';

const STEPS = [
  { id: 'welcome', name: 'Welcome', icon: '👋' },
  { id: 'project-type', name: 'Project Type', icon: '🎯' },
  { id: 'business', name: 'Business', icon: '🏢' },
  { id: 'preferences', name: 'Preferences', icon: '⚙️' },
  { id: 'review', name: 'Review', icon: '✅' }
];

const PROJECT_TYPES = [
  {
    id: 'website',
    icon: '🌐',
    name: 'Business Website',
    desc: 'Multi-page website with full business functionality',
    features: ['Multiple pages', 'Contact forms', 'SEO optimized', 'Mobile responsive'],
    color: '#22c55e',
    recommended: true
  },
  {
    id: 'app',
    icon: '📱',
    name: 'Web Application',
    desc: 'Interactive app with state management and data persistence',
    features: ['User interaction', 'Data storage', 'Charts & analytics', 'Real-time updates'],
    color: '#8b5cf6'
  },
  {
    id: 'tool-suite',
    icon: '🛠️',
    name: 'Tool Suite',
    desc: 'Collection of business tools and utilities',
    features: ['Multiple tools', 'Dashboard view', 'Quick access', 'Customizable'],
    color: '#f97316'
  },
  {
    id: 'landing-page',
    icon: '🚀',
    name: 'Landing Page',
    desc: 'Single-page focused on conversion',
    features: ['Hero section', 'Call-to-action', 'Fast loading', 'A/B testing ready'],
    color: '#3b82f6'
  }
];

const WORKFLOW_MODES = [
  {
    id: 'guided',
    icon: '✨',
    name: 'Guided Mode',
    desc: 'Step-by-step wizard with recommendations',
    detail: 'Best for first-time users. We\'ll guide you through each decision.',
    recommended: true
  },
  {
    id: 'instant',
    icon: '🚀',
    name: 'Instant Mode',
    desc: 'Describe what you need, AI builds it',
    detail: 'Fastest option. Just describe your project in natural language.'
  },
  {
    id: 'custom',
    icon: '⚙️',
    name: 'Custom Mode',
    desc: 'Full control over every detail',
    detail: 'For power users who want to configure every aspect.'
  }
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
    marginBottom: '24px'
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
    width: '40px',
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
  // Project type cards
  projectTypeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px'
  },
  projectCard: {
    position: 'relative',
    padding: '24px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '2px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'left'
  },
  projectCardSelected: {
    borderColor: '#6366f1',
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.08))',
    boxShadow: '0 0 0 1px rgba(99, 102, 241, 0.3), 0 8px 24px rgba(99, 102, 241, 0.2)'
  },
  projectCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '12px'
  },
  projectIcon: {
    fontSize: '2rem'
  },
  projectName: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#fff',
    margin: 0
  },
  projectDesc: {
    fontSize: '0.9rem',
    color: '#888',
    marginBottom: '14px'
  },
  projectFeatures: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px'
  },
  projectFeatureTag: {
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
    transition: 'border-color 0.2s ease'
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
  // Workflow mode cards
  workflowGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px'
  },
  workflowCard: {
    position: 'relative',
    padding: '24px 20px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '2px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'center'
  },
  workflowCardSelected: {
    borderColor: '#6366f1',
    background: 'rgba(99, 102, 241, 0.1)'
  },
  workflowIcon: {
    fontSize: '2.5rem',
    marginBottom: '12px',
    display: 'block'
  },
  workflowName: {
    fontSize: '1.05rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '6px'
  },
  workflowDesc: {
    fontSize: '0.85rem',
    color: '#888',
    marginBottom: '10px'
  },
  workflowDetail: {
    fontSize: '0.75rem',
    color: '#666',
    lineHeight: 1.4
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

export function CardFlowSetupWizard({
  onComplete,
  onSkip,
  onBack,
  initialData = {}
}) {
  const [currentStep, setCurrentStep] = useState(0);

  // Wizard state
  const [projectType, setProjectType] = useState(initialData.projectType || null);
  const [businessName, setBusinessName] = useState(initialData.businessName || '');
  const [industry, setIndustry] = useState(initialData.industry || '');
  const [location, setLocation] = useState(initialData.location || '');
  const [workflowMode, setWorkflowMode] = useState(initialData.workflowMode || 'guided');
  const [enableTutorials, setEnableTutorials] = useState(initialData.enableTutorials !== false);
  const [autoSave, setAutoSave] = useState(initialData.autoSave !== false);

  // Hover states
  const [hoveredProject, setHoveredProject] = useState(null);
  const [hoveredWorkflow, setHoveredWorkflow] = useState(null);

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Welcome
        return true;
      case 1: // Project Type
        return projectType !== null;
      case 2: // Business
        return businessName.trim().length > 0;
      case 3: // Preferences
        return workflowMode !== null;
      case 4: // Review
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

  const handleComplete = () => {
    const setupData = {
      projectType,
      businessName,
      industry,
      location,
      workflowMode,
      enableTutorials,
      autoSave,
      completedAt: new Date().toISOString()
    };

    // Save to localStorage for persistence
    localStorage.setItem('blink_setup_complete', 'true');
    localStorage.setItem('blink_setup_data', JSON.stringify(setupData));

    if (onComplete) {
      onComplete(setupData);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderWelcomeStep();
      case 1:
        return renderProjectTypeStep();
      case 2:
        return renderBusinessStep();
      case 3:
        return renderPreferencesStep();
      case 4:
        return renderReviewStep();
      default:
        return null;
    }
  };

  const renderWelcomeStep = () => (
    <div style={styles.welcomeHero}>
      <span style={styles.welcomeIcon}>⚡</span>
      <h1 style={styles.welcomeTitle}>Welcome to Blink</h1>
      <p style={styles.welcomeDesc}>
        Create professional websites, apps, and tools in minutes using AI-powered generation.
        Let's get you set up with a quick walkthrough.
      </p>

      <div style={styles.featureGrid}>
        <div style={styles.featureCard}>
          <span style={styles.featureIcon}>🎨</span>
          <div style={styles.featureTitle}>AI-Powered Design</div>
          <p style={styles.featureDesc}>Beautiful, responsive layouts generated automatically</p>
        </div>
        <div style={styles.featureCard}>
          <span style={styles.featureIcon}>🚀</span>
          <div style={styles.featureTitle}>One-Click Deploy</div>
          <p style={styles.featureDesc}>Publish to the web instantly with Railway</p>
        </div>
        <div style={styles.featureCard}>
          <span style={styles.featureIcon}>📱</span>
          <div style={styles.featureTitle}>Companion Apps</div>
          <p style={styles.featureDesc}>PWA admin apps for managing your site</p>
        </div>
      </div>
    </div>
  );

  const renderProjectTypeStep = () => (
    <div>
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          <span>🎯</span> What would you like to build?
        </div>

        <div style={styles.projectTypeGrid}>
          {PROJECT_TYPES.map(project => (
            <div
              key={project.id}
              style={{
                ...styles.projectCard,
                ...(projectType === project.id ? styles.projectCardSelected : {}),
                ...(hoveredProject === project.id && projectType !== project.id ? {
                  borderColor: `${project.color}60`,
                  background: `${project.color}08`,
                  transform: 'translateY(-2px)'
                } : {})
              }}
              onClick={() => setProjectType(project.id)}
              onMouseEnter={() => setHoveredProject(project.id)}
              onMouseLeave={() => setHoveredProject(null)}
            >
              {project.recommended && (
                <div style={styles.recommendedBadge}>RECOMMENDED</div>
              )}
              {projectType === project.id && (
                <div style={styles.selectedCheck}>✓</div>
              )}

              <div style={styles.projectCardHeader}>
                <span style={styles.projectIcon}>{project.icon}</span>
                <h3 style={styles.projectName}>{project.name}</h3>
              </div>

              <p style={styles.projectDesc}>{project.desc}</p>

              <div style={styles.projectFeatures}>
                {project.features.map((feature, i) => (
                  <span key={i} style={styles.projectFeatureTag}>{feature}</span>
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
          <span>🏢</span> Tell us about your project
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>
            Business or Project Name
            <span style={styles.required}>*</span>
          </label>
          <input
            type="text"
            placeholder="e.g., Sunrise Bakery, My Portfolio, Task Manager"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            style={styles.input}
            autoFocus
          />
          <div style={styles.inputHint}>
            This will be used as the title and branding for your project
          </div>
        </div>

        <div style={styles.inputRow}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Industry (optional)</label>
            <input
              type="text"
              placeholder="e.g., Restaurant, SaaS, Healthcare"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Location (optional)</label>
            <input
              type="text"
              placeholder="e.g., Austin, TX"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={styles.input}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreferencesStep = () => (
    <div>
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          <span>✨</span> Choose your workflow style
        </div>

        <div style={styles.workflowGrid}>
          {WORKFLOW_MODES.map(mode => (
            <div
              key={mode.id}
              style={{
                ...styles.workflowCard,
                ...(workflowMode === mode.id ? styles.workflowCardSelected : {}),
                ...(hoveredWorkflow === mode.id && workflowMode !== mode.id ? {
                  borderColor: 'rgba(99, 102, 241, 0.4)',
                  transform: 'translateY(-2px)'
                } : {})
              }}
              onClick={() => setWorkflowMode(mode.id)}
              onMouseEnter={() => setHoveredWorkflow(mode.id)}
              onMouseLeave={() => setHoveredWorkflow(null)}
            >
              {mode.recommended && (
                <div style={{...styles.recommendedBadge, top: '-8px', right: '12px'}}>
                  RECOMMENDED
                </div>
              )}
              {workflowMode === mode.id && (
                <div style={{...styles.selectedCheck, top: '8px', right: '8px', width: '22px', height: '22px', fontSize: '12px'}}>
                  ✓
                </div>
              )}

              <span style={styles.workflowIcon}>{mode.icon}</span>
              <div style={styles.workflowName}>{mode.name}</div>
              <div style={styles.workflowDesc}>{mode.desc}</div>
              <div style={styles.workflowDetail}>{mode.detail}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          <span>⚙️</span> Additional Settings
        </div>

        <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            padding: '14px 18px',
            background: enableTutorials ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
            border: '1px solid',
            borderColor: enableTutorials ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255,255,255,0.1)',
            borderRadius: '10px',
            transition: 'all 0.2s ease'
          }}>
            <input
              type="checkbox"
              checked={enableTutorials}
              onChange={(e) => setEnableTutorials(e.target.checked)}
              style={{width: '18px', height: '18px', accentColor: '#6366f1'}}
            />
            <div>
              <div style={{fontSize: '0.95rem', fontWeight: '500', color: '#fff'}}>
                Show helpful tips
              </div>
              <div style={{fontSize: '0.8rem', color: '#888'}}>
                Display tooltips and guidance as you build
              </div>
            </div>
          </label>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            padding: '14px 18px',
            background: autoSave ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
            border: '1px solid',
            borderColor: autoSave ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255,255,255,0.1)',
            borderRadius: '10px',
            transition: 'all 0.2s ease'
          }}>
            <input
              type="checkbox"
              checked={autoSave}
              onChange={(e) => setAutoSave(e.target.checked)}
              style={{width: '18px', height: '18px', accentColor: '#6366f1'}}
            />
            <div>
              <div style={{fontSize: '0.95rem', fontWeight: '500', color: '#fff'}}>
                Auto-save progress
              </div>
              <div style={{fontSize: '0.8rem', color: '#888'}}>
                Automatically save your work as you go
              </div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderReviewStep = () => {
    const selectedProject = PROJECT_TYPES.find(p => p.id === projectType);
    const selectedWorkflow = WORKFLOW_MODES.find(m => m.id === workflowMode);

    return (
      <div>
        <div style={styles.reviewSection}>
          <div style={styles.reviewTitle}>Project Setup</div>
          <div style={styles.reviewItem}>
            <span style={styles.reviewLabel}>Project Type</span>
            <span style={styles.reviewValue}>
              <span>{selectedProject?.icon}</span>
              {selectedProject?.name}
            </span>
          </div>
          <div style={styles.reviewItem}>
            <span style={styles.reviewLabel}>Project Name</span>
            <span style={styles.reviewValue}>{businessName}</span>
          </div>
          {industry && (
            <div style={styles.reviewItem}>
              <span style={styles.reviewLabel}>Industry</span>
              <span style={styles.reviewValue}>{industry}</span>
            </div>
          )}
          {location && (
            <div style={styles.reviewItem}>
              <span style={styles.reviewLabel}>Location</span>
              <span style={styles.reviewValue}>{location}</span>
            </div>
          )}
        </div>

        <div style={styles.reviewSection}>
          <div style={styles.reviewTitle}>Workflow Preferences</div>
          <div style={styles.reviewItem}>
            <span style={styles.reviewLabel}>Workflow Mode</span>
            <span style={styles.reviewValue}>
              <span>{selectedWorkflow?.icon}</span>
              {selectedWorkflow?.name}
            </span>
          </div>
          <div style={styles.reviewItem}>
            <span style={styles.reviewLabel}>Helpful Tips</span>
            <span style={styles.reviewValue}>
              {enableTutorials ? '✅ Enabled' : '❌ Disabled'}
            </span>
          </div>
          <div style={styles.reviewItem}>
            <span style={styles.reviewLabel}>Auto-Save</span>
            <span style={styles.reviewValue}>
              {autoSave ? '✅ Enabled' : '❌ Disabled'}
            </span>
          </div>
        </div>

        <div style={styles.readyBanner}>
          <span style={styles.readyIcon}>🎉</span>
          <div style={styles.readyContent}>
            <div style={styles.readyTitle}>You're all set!</div>
            <p style={styles.readyDesc}>
              Click "Launch Builder" to start creating your {selectedProject?.name.toLowerCase()}.
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
          {currentStep === 0 && 'Get started with Blink'}
          {currentStep === 1 && 'Choose what you want to create'}
          {currentStep === 2 && 'Tell us about your project'}
          {currentStep === 3 && 'Customize your experience'}
          {currentStep === 4 && 'Review your setup and launch'}
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
            <span>🚀</span> Launch Builder
          </button>
        )}
      </div>

      {/* AI Assistant */}
      <CardFlowAssistant
        currentStep={STEPS[currentStep].id}
        wizardContext={{
          projectType,
          businessName,
          industry,
          location,
          workflowMode,
          enableTutorials,
          autoSave
        }}
        onSuggestion={(suggestion) => {
          // Apply AI suggestions to wizard state
          if (suggestion.projectType) setProjectType(suggestion.projectType);
          if (suggestion.workflowMode) setWorkflowMode(suggestion.workflowMode);
          if (suggestion.businessName) setBusinessName(suggestion.businessName);
          if (suggestion.industry) setIndustry(suggestion.industry);
          if (suggestion.location) setLocation(suggestion.location);
        }}
      />

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 768px) {
          .feature-grid,
          .project-type-grid,
          .workflow-grid {
            grid-template-columns: 1fr !important;
          }
          .input-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
