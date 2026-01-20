/**
 * AppGuidedStep
 * Step 1: Select an app template
 * Step 2: Configure and customize
 * Step 3: Generate the app
 */

import React, { useState } from 'react';
import { API_BASE } from '../constants';

// App templates with detailed configuration
const APP_TEMPLATES = [
  {
    id: 'expense-tracker',
    icon: '💰',
    name: 'Expense Tracker',
    desc: 'Track spending, categories & budgets',
    longDesc: 'A complete expense tracking app with categories, monthly charts, budget limits, and CSV export.',
    features: [
      { id: 'categories', name: 'Custom Categories', desc: 'Organize expenses by type' },
      { id: 'charts', name: 'Monthly Charts', desc: 'Visualize spending trends' },
      { id: 'budgets', name: 'Budget Limits', desc: 'Set monthly spending caps' },
      { id: 'export', name: 'CSV Export', desc: 'Download your data' },
    ],
    defaultCategories: ['Food', 'Transport', 'Bills', 'Shopping', 'Entertainment', 'Health'],
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    popular: true,
  },
  {
    id: 'habit-tracker',
    icon: '✅',
    name: 'Habit Tracker',
    desc: 'Daily habits, streaks & calendar',
    longDesc: 'Build better habits with daily check-ins, streak tracking, calendar view, and completion statistics.',
    features: [
      { id: 'daily', name: 'Daily Check-ins', desc: 'Mark habits as complete' },
      { id: 'streaks', name: 'Streak Tracking', desc: 'Build momentum with streaks' },
      { id: 'calendar', name: 'Calendar View', desc: 'See your history at a glance' },
      { id: 'stats', name: 'Statistics', desc: 'Track completion rates' },
    ],
    defaultCategories: ['Exercise', 'Reading', 'Meditation', 'Water', 'Sleep', 'Journal'],
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    popular: true,
  },
  {
    id: 'project-timer',
    icon: '⏱️',
    name: 'Project Timer',
    desc: 'Track time across projects',
    longDesc: 'Track time spent on multiple projects with start/stop controls, time logs, and detailed reports.',
    features: [
      { id: 'projects', name: 'Multiple Projects', desc: 'Organize time by project' },
      { id: 'timer', name: 'Start/Stop Timer', desc: 'One-click time tracking' },
      { id: 'logs', name: 'Time Logs', desc: 'Detailed session history' },
      { id: 'reports', name: 'Reports', desc: 'Weekly/monthly summaries' },
    ],
    defaultCategories: ['Client Work', 'Personal', 'Learning', 'Admin', 'Meetings'],
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    popular: true,
  },
  {
    id: 'bookmark-manager',
    icon: '🔖',
    name: 'Bookmark Manager',
    desc: 'Save links, tags & folders',
    longDesc: 'Organize your bookmarks with tags, folders, and powerful search. Import and export your collection.',
    features: [
      { id: 'tags', name: 'Tags & Folders', desc: 'Organize your links' },
      { id: 'search', name: 'Search', desc: 'Find bookmarks instantly' },
      { id: 'preview', name: 'Link Preview', desc: 'See titles and favicons' },
      { id: 'import', name: 'Import/Export', desc: 'Backup your bookmarks' },
    ],
    defaultCategories: ['Work', 'Personal', 'Reading', 'Tools', 'Inspiration'],
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
  },
];

const styles = {
  container: {
    padding: '40px 24px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  title: {
    fontSize: '2.4rem',
    fontWeight: '700',
    marginBottom: '12px',
    background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: 'rgba(255,255,255,0.6)',
  },
  step: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '32px',
  },
  stepDot: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  stepLine: {
    width: '60px',
    height: '2px',
    background: 'rgba(255,255,255,0.1)',
    alignSelf: 'center',
  },
  appGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
  },
  appCard: {
    position: 'relative',
    padding: '28px 24px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '2px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '20px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'left',
  },
  appSelected: {
    borderWidth: '2px',
    transform: 'scale(1.02)',
  },
  appIcon: {
    fontSize: '3rem',
    marginBottom: '16px',
  },
  appName: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '8px',
  },
  appDesc: {
    fontSize: '0.95rem',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: '16px',
    lineHeight: 1.5,
  },
  featureList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  featureTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '20px',
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.7)',
  },
  popularBadge: {
    position: 'absolute',
    top: '-10px',
    right: '16px',
    background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
    color: '#fff',
    padding: '6px 14px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '700',
  },
  checkmark: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    color: '#fff',
  },

  // Customize Step Styles
  customizeContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: '32px',
    marginBottom: '32px',
  },
  customizeMain: {
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '20px',
    padding: '32px',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  customizeSidebar: {
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '20px',
    padding: '28px',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  previewHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '24px',
    paddingBottom: '24px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  previewIconLarge: {
    fontSize: '4rem',
  },
  previewTitle: {
    fontSize: '1.6rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '4px',
  },
  previewSubtitle: {
    fontSize: '0.95rem',
    color: 'rgba(255,255,255,0.5)',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  featureCard: {
    padding: '16px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  featureCardName: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '4px',
  },
  featureCardDesc: {
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.5)',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    fontSize: '1rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    color: '#fff',
    outline: 'none',
  },
  colorPicker: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  colorSwatch: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    cursor: 'pointer',
    border: '3px solid transparent',
    transition: 'all 0.2s ease',
  },
  categoryList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '12px',
  },
  categoryTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '8px',
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.8)',
  },
  categoryRemove: {
    cursor: 'pointer',
    opacity: 0.5,
    transition: 'opacity 0.2s',
  },
  addCategoryInput: {
    display: 'flex',
    gap: '8px',
  },

  // Actions
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '32px',
  },
  backBtn: {
    padding: '14px 28px',
    fontSize: '1rem',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '12px',
    color: 'rgba(255,255,255,0.7)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  continueBtn: {
    padding: '16px 40px',
    fontSize: '1.1rem',
    fontWeight: '600',
    background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  continueBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },

  // Building state
  buildingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    gap: '24px',
  },
  spinner: {
    width: '60px',
    height: '60px',
    border: '4px solid rgba(255,255,255,0.1)',
    borderTop: '4px solid #8b5cf6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  buildingTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#fff',
  },
  buildingSubtitle: {
    fontSize: '1rem',
    color: 'rgba(255,255,255,0.5)',
  },
};

const COLOR_PRESETS = ['#10b981', '#8b5cf6', '#3b82f6', '#f59e0b', '#ec4899', '#ef4444', '#06b6d4', '#6366f1'];

// Font options (Google Fonts)
const FONT_OPTIONS = [
  { id: 'system', name: 'System Default', value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
  { id: 'inter', name: 'Inter', value: "'Inter', sans-serif" },
  { id: 'poppins', name: 'Poppins', value: "'Poppins', sans-serif" },
  { id: 'roboto', name: 'Roboto', value: "'Roboto', sans-serif" },
  { id: 'opensans', name: 'Open Sans', value: "'Open Sans', sans-serif" },
  { id: 'lato', name: 'Lato', value: "'Lato', sans-serif" },
  { id: 'montserrat', name: 'Montserrat', value: "'Montserrat', sans-serif" },
  { id: 'nunito', name: 'Nunito', value: "'Nunito', sans-serif" },
  { id: 'raleway', name: 'Raleway', value: "'Raleway', sans-serif" },
  { id: 'ubuntu', name: 'Ubuntu', value: "'Ubuntu', sans-serif" },
  { id: 'playfair', name: 'Playfair Display', value: "'Playfair Display', serif" },
  { id: 'merriweather', name: 'Merriweather', value: "'Merriweather', serif" },
  { id: 'space-mono', name: 'Space Mono', value: "'Space Mono', monospace" },
  { id: 'jetbrains', name: 'JetBrains Mono', value: "'JetBrains Mono', monospace" },
];

// Layout variants
const LAYOUT_OPTIONS = [
  { id: 'default', name: 'Default', desc: 'Balanced spacing and sizing', icon: '📐' },
  { id: 'compact', name: 'Compact', desc: 'Tighter spacing, more content visible', icon: '📦' },
  { id: 'spacious', name: 'Spacious', desc: 'More breathing room, relaxed feel', icon: '🌿' },
  { id: 'minimal', name: 'Minimal', desc: 'Clean, stripped-down aesthetic', icon: '✨' },
];

// Theme options
const THEME_OPTIONS = [
  { id: 'dark', name: 'Dark', desc: 'Dark background, light text', icon: '🌙' },
  { id: 'light', name: 'Light', desc: 'Light background, dark text', icon: '☀️' },
  { id: 'auto', name: 'Auto', desc: 'Follows system preference', icon: '🔄' },
];

// Icon style options
const ICON_STYLE_OPTIONS = [
  { id: 'emoji', name: 'Emoji', desc: 'Colorful emoji icons', sample: ['💰', '✅', '📊', '⚙️'] },
  { id: 'minimal', name: 'Minimal', desc: 'Simple text symbols', sample: ['$', '✓', '◉', '≡'] },
  { id: 'circles', name: 'Circles', desc: 'Circled indicators', sample: ['◐', '●', '◎', '○'] },
  { id: 'squares', name: 'Squares', desc: 'Square-based icons', sample: ['■', '□', '▣', '▪'] },
];

export function AppGuidedStep({ preselectedApp, onComplete, onBack }) {
  const [currentStep, setCurrentStep] = useState(preselectedApp ? 2 : 1);
  const [selectedApp, setSelectedApp] = useState(
    preselectedApp ? APP_TEMPLATES.find(a => a.id === preselectedApp) : null
  );
  const [appName, setAppName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#8b5cf6');
  const [secondaryColor, setSecondaryColor] = useState('#06b6d4');
  const [accentColor, setAccentColor] = useState('#f59e0b');
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState(null);

  // Phase 1: New customization options
  const [selectedFont, setSelectedFont] = useState('system');
  const [selectedLayout, setSelectedLayout] = useState('default');
  const [selectedTheme, setSelectedTheme] = useState('dark');
  const [selectedIconStyle, setSelectedIconStyle] = useState('emoji');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Step 1: Select App
  const handleSelectApp = (app) => {
    setSelectedApp(app);
    setPrimaryColor(app.color);
    setAppName(`My ${app.name}`);
    setCategories([...app.defaultCategories]);
  };

  const handleContinueToCustomize = () => {
    if (selectedApp) {
      setCurrentStep(2);
    }
  };

  // Category management
  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (cat) => {
    setCategories(categories.filter(c => c !== cat));
  };

  // Step 2: Build App
  const handleBuildApp = async () => {
    setBuilding(true);
    setError(null);

    // Get font value from selected font
    const fontConfig = FONT_OPTIONS.find(f => f.id === selectedFont);

    try {
      const response = await fetch(`${API_BASE}/api/apps/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedApp.id,
          config: {
            name: appName || selectedApp.name,
            color: primaryColor,
            secondaryColor: secondaryColor,
            accentColor: accentColor,
            categories: categories,
            // Phase 1: New customization options
            font: fontConfig?.value || FONT_OPTIONS[0].value,
            fontId: selectedFont,
            layout: selectedLayout,
            theme: selectedTheme,
            iconStyle: selectedIconStyle,
          },
          branding: {
            appName: appName || selectedApp.name,
            colors: {
              primary: primaryColor,
              secondary: secondaryColor,
              accent: accentColor
            },
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        onComplete(data);
      } else {
        setError(data.error || 'Failed to generate app');
        setBuilding(false);
      }
    } catch (err) {
      setError(`Build failed: ${err.message}`);
      setBuilding(false);
    }
  };

  // Building state
  if (building) {
    return (
      <div style={styles.container}>
        <div style={styles.buildingContainer}>
          <div style={styles.spinner} />
          <h2 style={styles.buildingTitle}>Building Your App</h2>
          <p style={styles.buildingSubtitle}>
            Generating {selectedApp?.name} with {categories.length} categories...
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>
          {currentStep === 1 ? '📱 Choose Your App' : '🎨 Customize Your App'}
        </h1>
        <p style={styles.subtitle}>
          {currentStep === 1
            ? 'Select an app template to get started'
            : `Configure your ${selectedApp?.name}`}
        </p>
      </div>

      {/* Step Indicator */}
      <div style={styles.step}>
        <div style={{
          ...styles.stepDot,
          background: currentStep >= 1 ? 'linear-gradient(135deg, #8b5cf6, #06b6d4)' : 'rgba(255,255,255,0.1)',
          color: currentStep >= 1 ? '#fff' : 'rgba(255,255,255,0.4)',
        }}>1</div>
        <div style={{...styles.stepLine, background: currentStep >= 2 ? '#8b5cf6' : 'rgba(255,255,255,0.1)'}} />
        <div style={{
          ...styles.stepDot,
          background: currentStep >= 2 ? 'linear-gradient(135deg, #8b5cf6, #06b6d4)' : 'rgba(255,255,255,0.1)',
          color: currentStep >= 2 ? '#fff' : 'rgba(255,255,255,0.4)',
        }}>2</div>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          color: '#ef4444',
        }}>
          {error}
        </div>
      )}

      {/* Step 1: App Selection */}
      {currentStep === 1 && (
        <>
          <div style={styles.appGrid}>
            {APP_TEMPLATES.map(app => (
              <div
                key={app.id}
                style={{
                  ...styles.appCard,
                  ...(selectedApp?.id === app.id ? {
                    ...styles.appSelected,
                    borderColor: app.color,
                    boxShadow: `0 8px 32px ${app.color}30`,
                  } : {}),
                }}
                onClick={() => handleSelectApp(app)}
                onMouseEnter={(e) => {
                  if (selectedApp?.id !== app.id) {
                    e.currentTarget.style.borderColor = `${app.color}60`;
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedApp?.id !== app.id) {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {app.popular && <div style={styles.popularBadge}>POPULAR</div>}
                {selectedApp?.id === app.id && (
                  <div style={{...styles.checkmark, background: app.gradient}}>✓</div>
                )}
                <div style={styles.appIcon}>{app.icon}</div>
                <h3 style={styles.appName}>{app.name}</h3>
                <p style={styles.appDesc}>{app.longDesc}</p>
                <div style={styles.featureList}>
                  {app.features.map(f => (
                    <span key={f.id} style={styles.featureTag}>
                      ✓ {f.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={styles.actions}>
            <button style={styles.backBtn} onClick={onBack}>
              ← Back
            </button>
            <button
              style={{
                ...styles.continueBtn,
                ...(selectedApp ? {} : styles.continueBtnDisabled),
              }}
              onClick={handleContinueToCustomize}
              disabled={!selectedApp}
            >
              Continue to Customize →
            </button>
          </div>
        </>
      )}

      {/* Step 2: Customize & Build */}
      {currentStep === 2 && selectedApp && (
        <>
          <div style={styles.customizeContainer}>
            {/* Main Preview */}
            <div style={styles.customizeMain}>
              <div style={styles.previewHeader}>
                <div style={styles.previewIconLarge}>{selectedApp.icon}</div>
                <div>
                  <h2 style={styles.previewTitle}>{selectedApp.name}</h2>
                  <p style={styles.previewSubtitle}>{selectedApp.features.length} features included</p>
                </div>
              </div>

              <h3 style={{color: '#fff', fontSize: '1.1rem', marginBottom: '16px', fontWeight: '600'}}>
                Features in this app:
              </h3>
              <div style={styles.featuresGrid}>
                {selectedApp.features.map(feature => (
                  <div key={feature.id} style={styles.featureCard}>
                    <div style={styles.featureCardName}>✓ {feature.name}</div>
                    <div style={styles.featureCardDesc}>{feature.desc}</div>
                  </div>
                ))}
              </div>

              {/* Categories Section */}
              <h3 style={{color: '#fff', fontSize: '1.1rem', marginTop: '24px', marginBottom: '16px', fontWeight: '600'}}>
                {selectedApp.id === 'expense-tracker' ? 'Expense Categories:' :
                 selectedApp.id === 'habit-tracker' ? 'Habit Categories:' :
                 selectedApp.id === 'project-timer' ? 'Project Categories:' :
                 'Categories:'}
              </h3>
              <div style={styles.categoryList}>
                {categories.map(cat => (
                  <span key={cat} style={styles.categoryTag}>
                    {cat}
                    <span
                      style={styles.categoryRemove}
                      onClick={() => handleRemoveCategory(cat)}
                      onMouseEnter={(e) => e.target.style.opacity = 1}
                      onMouseLeave={(e) => e.target.style.opacity = 0.5}
                    >
                      ×
                    </span>
                  </span>
                ))}
              </div>
              <div style={styles.addCategoryInput}>
                <input
                  type="text"
                  style={{...styles.input, flex: 1}}
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Add a category..."
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                />
                <button
                  style={{...styles.continueBtn, padding: '14px 24px'}}
                  onClick={handleAddCategory}
                >
                  Add
                </button>
              </div>
            </div>

            {/* Customization Sidebar */}
            <div style={{...styles.customizeSidebar, maxHeight: '80vh', overflowY: 'auto'}}>
              <h3 style={{color: '#fff', fontSize: '1.2rem', marginBottom: '24px', fontWeight: '600'}}>
                ✨ Customize
              </h3>

              <div style={styles.formGroup}>
                <label style={styles.label}>App Name</label>
                <input
                  type="text"
                  style={styles.input}
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="My App"
                />
              </div>

              {/* Theme Toggle */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Theme</label>
                <div style={{display: 'flex', gap: '8px'}}>
                  {THEME_OPTIONS.map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme.id)}
                      style={{
                        flex: 1,
                        padding: '12px 8px',
                        background: selectedTheme === theme.id ? `${primaryColor}20` : 'rgba(255,255,255,0.05)',
                        border: selectedTheme === theme.id ? `2px solid ${primaryColor}` : '2px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{fontSize: '1.2rem', marginBottom: '4px'}}>{theme.icon}</div>
                      <div style={{fontSize: '0.8rem', color: selectedTheme === theme.id ? '#fff' : 'rgba(255,255,255,0.6)'}}>{theme.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary Color */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Primary Color</label>
                <div style={styles.colorPicker}>
                  {COLOR_PRESETS.map(color => (
                    <div
                      key={color}
                      style={{
                        ...styles.colorSwatch,
                        background: color,
                        borderColor: primaryColor === color ? '#fff' : 'transparent',
                        transform: primaryColor === color ? 'scale(1.1)' : 'scale(1)',
                      }}
                      onClick={() => setPrimaryColor(color)}
                    />
                  ))}
                </div>
              </div>

              {/* Font Picker */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Font</label>
                <select
                  value={selectedFont}
                  onChange={(e) => setSelectedFont(e.target.value)}
                  style={{
                    ...styles.input,
                    cursor: 'pointer',
                  }}
                >
                  {FONT_OPTIONS.map(font => (
                    <option key={font.id} value={font.id}>{font.name}</option>
                  ))}
                </select>
              </div>

              {/* Layout Variants */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Layout Style</label>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px'}}>
                  {LAYOUT_OPTIONS.map(layout => (
                    <button
                      key={layout.id}
                      onClick={() => setSelectedLayout(layout.id)}
                      style={{
                        padding: '12px',
                        background: selectedLayout === layout.id ? `${primaryColor}20` : 'rgba(255,255,255,0.05)',
                        border: selectedLayout === layout.id ? `2px solid ${primaryColor}` : '2px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{fontSize: '1rem', marginBottom: '2px'}}>{layout.icon} {layout.name}</div>
                      <div style={{fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)'}}>{layout.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Options Toggle */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  color: 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>Advanced Options</span>
                <span>{showAdvanced ? '▲' : '▼'}</span>
              </button>

              {showAdvanced && (
                <>
                  {/* Secondary Color */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Secondary Color</label>
                    <div style={styles.colorPicker}>
                      {COLOR_PRESETS.map(color => (
                        <div
                          key={color}
                          style={{
                            ...styles.colorSwatch,
                            background: color,
                            borderColor: secondaryColor === color ? '#fff' : 'transparent',
                            transform: secondaryColor === color ? 'scale(1.1)' : 'scale(1)',
                          }}
                          onClick={() => setSecondaryColor(color)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Accent Color */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Accent Color</label>
                    <div style={styles.colorPicker}>
                      {COLOR_PRESETS.map(color => (
                        <div
                          key={color}
                          style={{
                            ...styles.colorSwatch,
                            background: color,
                            borderColor: accentColor === color ? '#fff' : 'transparent',
                            transform: accentColor === color ? 'scale(1.1)' : 'scale(1)',
                          }}
                          onClick={() => setAccentColor(color)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Icon Style */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Icon Style</label>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px'}}>
                      {ICON_STYLE_OPTIONS.map(style => (
                        <button
                          key={style.id}
                          onClick={() => setSelectedIconStyle(style.id)}
                          style={{
                            padding: '12px',
                            background: selectedIconStyle === style.id ? `${primaryColor}20` : 'rgba(255,255,255,0.05)',
                            border: selectedIconStyle === style.id ? `2px solid ${primaryColor}` : '2px solid rgba(255,255,255,0.1)',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.2s',
                          }}
                        >
                          <div style={{fontSize: '1rem', marginBottom: '4px', letterSpacing: '4px'}}>
                            {style.sample.join(' ')}
                          </div>
                          <div style={{fontSize: '0.8rem', color: selectedIconStyle === style.id ? '#fff' : 'rgba(255,255,255,0.6)'}}>{style.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div style={{
                marginTop: '16px',
                padding: '16px',
                background: `${primaryColor}15`,
                borderRadius: '12px',
                border: `1px solid ${primaryColor}30`,
              }}>
                <p style={{color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', margin: 0}}>
                  <strong style={{color: primaryColor}}>Pro tip:</strong> Your app will use localStorage
                  for data persistence. All data stays on your device.
                </p>
              </div>
            </div>
          </div>

          <div style={styles.actions}>
            <button style={styles.backBtn} onClick={() => setCurrentStep(1)}>
              ← Change App
            </button>
            <button style={styles.continueBtn} onClick={handleBuildApp}>
              🚀 Build My App
            </button>
          </div>
        </>
      )}
    </div>
  );
}
