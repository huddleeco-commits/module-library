/**
 * ToolSuiteGuidedStep
 * Step 1: Select a pre-made business bundle
 * Step 2: Preview tools and customize branding
 * Step 3: Build the suite
 */

import React, { useState } from 'react';
import { API_BASE } from '../constants';

// Pre-made business bundles (matching ChoosePathStep)
const TOOL_BUNDLES = [
  {
    id: 'freelancer',
    icon: '💼',
    name: 'Freelancer Pack',
    desc: 'Invoice, time tracking & expenses',
    longDesc: 'Everything a freelancer needs to manage clients, track hours, and get paid.',
    tools: [
      { id: 'invoice-generator', icon: '📄', name: 'Invoice Generator', desc: 'Create professional invoices' },
      { id: 'time-tracker', icon: '⏰', name: 'Time Tracker', desc: 'Log hours & projects' },
      { id: 'expense-tracker', icon: '💰', name: 'Expense Tracker', desc: 'Track spending & budgets' },
      { id: 'receipt-generator', icon: '🧾', name: 'Receipt Generator', desc: 'Generate receipts instantly' },
    ],
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    popular: true,
  },
  {
    id: 'developer',
    icon: '👨‍💻',
    name: 'Developer Pack',
    desc: 'UUID, JSON, Base64 & more',
    longDesc: 'Essential tools every developer needs for daily coding tasks.',
    tools: [
      { id: 'uuid-generator', icon: '🔑', name: 'UUID Generator', desc: 'Generate unique identifiers' },
      { id: 'json-formatter', icon: '📋', name: 'JSON Formatter', desc: 'Format & validate JSON' },
      { id: 'base64-encoder', icon: '🔐', name: 'Base64 Encoder', desc: 'Encode & decode Base64' },
      { id: 'hash-generator', icon: '🔒', name: 'Hash Generator', desc: 'MD5, SHA256 & more' },
      { id: 'regex-tester', icon: '🔍', name: 'Regex Tester', desc: 'Test regular expressions' },
    ],
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
    popular: true,
  },
  {
    id: 'restaurant',
    icon: '🍽️',
    name: 'Restaurant Pack',
    desc: 'Tips, recipes & reservations',
    longDesc: 'Essential tools for restaurants, cafes, and food service businesses.',
    tools: [
      { id: 'tip-calculator', icon: '💵', name: 'Tip Calculator', desc: 'Split bills & calculate tips' },
      { id: 'recipe-scaler', icon: '🍳', name: 'Recipe Scaler', desc: 'Adjust recipe portions' },
      { id: 'countdown', icon: '⏱️', name: 'Countdown Timer', desc: 'Kitchen & event timers' },
      { id: 'qr-generator', icon: '📱', name: 'QR Menu Generator', desc: 'Create scannable menus' },
    ],
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444, #b91c1c)',
    popular: true,
  },
  {
    id: 'fitness',
    icon: '💪',
    name: 'Fitness Pack',
    desc: 'BMI, calories & habit tracking',
    longDesc: 'Health and wellness tools for gyms, trainers, and fitness enthusiasts.',
    tools: [
      { id: 'bmi-calculator', icon: '⚖️', name: 'BMI Calculator', desc: 'Health & fitness metrics' },
      { id: 'calorie-calculator', icon: '🍎', name: 'Calorie Calculator', desc: 'Nutrition & diet planning' },
      { id: 'habit-tracker', icon: '✅', name: 'Habit Tracker', desc: 'Build better habits daily' },
      { id: 'pomodoro', icon: '🍅', name: 'Workout Timer', desc: 'Interval & rest timing' },
    ],
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
  },
  {
    id: 'real-estate',
    icon: '🏠',
    name: 'Real Estate Pack',
    desc: 'Mortgage, ROI & appointments',
    longDesc: 'Essential calculators and tools for real estate agents and investors.',
    tools: [
      { id: 'calculator', icon: '🧮', name: 'Mortgage Calculator', desc: 'Monthly payments & rates' },
      { id: 'roi-calculator', icon: '📊', name: 'ROI Calculator', desc: 'Investment returns' },
      { id: 'countdown', icon: '⏱️', name: 'Open House Timer', desc: 'Event countdowns' },
      { id: 'qr-generator', icon: '📱', name: 'Property QR Codes', desc: 'Link to listings' },
    ],
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
  },
  {
    id: 'creator',
    icon: '🎨',
    name: 'Creator Pack',
    desc: 'Colors, images & productivity',
    longDesc: 'Creative tools for designers, developers, and digital creators.',
    tools: [
      { id: 'color-picker', icon: '🎨', name: 'Color Palette', desc: 'Find perfect colors' },
      { id: 'image-resizer', icon: '🖼️', name: 'Image Resizer', desc: 'Resize & compress images' },
      { id: 'password-generator', icon: '🔐', name: 'Password Generator', desc: 'Secure random passwords' },
      { id: 'pomodoro', icon: '🍅', name: 'Pomodoro Timer', desc: 'Focus & productivity' },
    ],
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899, #be185d)',
  },
  {
    id: 'retail',
    icon: '🛒',
    name: 'Retail Pack',
    desc: 'Receipts, inventory & pricing',
    longDesc: 'Point-of-sale tools for retail stores and small businesses.',
    tools: [
      { id: 'receipt-generator', icon: '🧾', name: 'Receipt Generator', desc: 'Professional receipts' },
      { id: 'calculator', icon: '🧮', name: 'Price Calculator', desc: 'Markups & discounts' },
      { id: 'qr-generator', icon: '📱', name: 'Product QR Codes', desc: 'Inventory tracking' },
      { id: 'unit-converter', icon: '🔄', name: 'Unit Converter', desc: 'Measurements & weights' },
    ],
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
    background: 'linear-gradient(135deg, #f97316, #ea580c)',
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
  bundleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
  },
  bundleCard: {
    position: 'relative',
    padding: '28px 24px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '2px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '20px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'left',
  },
  bundleSelected: {
    borderWidth: '2px',
    transform: 'scale(1.02)',
  },
  bundleIcon: {
    fontSize: '3rem',
    marginBottom: '16px',
  },
  bundleName: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '8px',
  },
  bundleDesc: {
    fontSize: '0.95rem',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: '16px',
    lineHeight: 1.5,
  },
  bundleToolList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  bundleToolTag: {
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
    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
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

  // Preview Step Styles
  previewContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: '32px',
    marginBottom: '32px',
  },
  previewMain: {
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '20px',
    padding: '32px',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  previewSidebar: {
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
  toolsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  toolPreviewCard: {
    padding: '20px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '14px',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  toolPreviewIcon: {
    fontSize: '2rem',
    marginBottom: '12px',
  },
  toolPreviewName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '4px',
  },
  toolPreviewDesc: {
    fontSize: '0.85rem',
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
  styleOptions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  styleOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    background: 'rgba(255,255,255,0.03)',
    border: '2px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  styleOptionSelected: {
    borderColor: '#f97316',
    background: 'rgba(249, 115, 22, 0.1)',
  },
  styleIcon: {
    fontSize: '1.2rem',
  },
  styleName: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#fff',
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
    background: 'linear-gradient(135deg, #f97316, #ea580c)',
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
    borderTop: '4px solid #f97316',
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

const COLOR_PRESETS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#6366f1', '#14b8a6'];
const STYLE_PRESETS = [
  { id: 'modern', name: 'Modern', icon: '✨' },
  { id: 'minimal', name: 'Minimal', icon: '○' },
  { id: 'bold', name: 'Bold', icon: '💪' },
  { id: 'elegant', name: 'Elegant', icon: '👑' },
];

export function ToolSuiteGuidedStep({ preselectedBundle, onComplete, onBack }) {
  const [currentStep, setCurrentStep] = useState(preselectedBundle ? 2 : 1);
  const [selectedBundle, setSelectedBundle] = useState(
    preselectedBundle ? TOOL_BUNDLES.find(b => b.id === preselectedBundle) : null
  );
  const [businessName, setBusinessName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#f97316');
  const [stylePreset, setStylePreset] = useState('modern');
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState(null);

  // Step 1: Select Bundle
  const handleSelectBundle = (bundle) => {
    setSelectedBundle(bundle);
    setPrimaryColor(bundle.color);
    setBusinessName(`${bundle.name.replace(' Pack', '')} Tools`);
  };

  const handleContinueToCustomize = () => {
    if (selectedBundle) {
      setCurrentStep(2);
    }
  };

  // Step 2: Build Suite
  const handleBuildSuite = async () => {
    setBuilding(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/orchestrate/build-suite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tools: selectedBundle.tools.map(t => ({
            toolType: t.id,
            name: t.name,
            icon: t.icon,
            description: t.desc,
          })),
          branding: {
            businessName: businessName || selectedBundle.name,
            colors: { primary: primaryColor, accent: primaryColor },
            style: stylePreset,
          },
          options: {
            bundleId: selectedBundle.id,
            organization: 'auto',
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        onComplete(data);
      } else {
        setError(data.error || 'Failed to build suite');
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
          <h2 style={styles.buildingTitle}>Building Your Tool Suite</h2>
          <p style={styles.buildingSubtitle}>
            Generating {selectedBundle?.tools.length} tools with unified branding...
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
          {currentStep === 1 ? '📦 Choose Your Bundle' : '🎨 Customize Your Suite'}
        </h1>
        <p style={styles.subtitle}>
          {currentStep === 1
            ? 'Select a pre-made tool pack for your industry'
            : `Configure your ${selectedBundle?.name}`}
        </p>
      </div>

      {/* Step Indicator */}
      <div style={styles.step}>
        <div style={{
          ...styles.stepDot,
          background: currentStep >= 1 ? 'linear-gradient(135deg, #f97316, #ea580c)' : 'rgba(255,255,255,0.1)',
          color: currentStep >= 1 ? '#fff' : 'rgba(255,255,255,0.4)',
        }}>1</div>
        <div style={{...styles.stepLine, background: currentStep >= 2 ? '#f97316' : 'rgba(255,255,255,0.1)'}} />
        <div style={{
          ...styles.stepDot,
          background: currentStep >= 2 ? 'linear-gradient(135deg, #f97316, #ea580c)' : 'rgba(255,255,255,0.1)',
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

      {/* Step 1: Bundle Selection */}
      {currentStep === 1 && (
        <>
          <div style={styles.bundleGrid}>
            {TOOL_BUNDLES.map(bundle => (
              <div
                key={bundle.id}
                style={{
                  ...styles.bundleCard,
                  ...(selectedBundle?.id === bundle.id ? {
                    ...styles.bundleSelected,
                    borderColor: bundle.color,
                    boxShadow: `0 8px 32px ${bundle.color}30`,
                  } : {}),
                }}
                onClick={() => handleSelectBundle(bundle)}
                onMouseEnter={(e) => {
                  if (selectedBundle?.id !== bundle.id) {
                    e.currentTarget.style.borderColor = `${bundle.color}60`;
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedBundle?.id !== bundle.id) {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {bundle.popular && <div style={styles.popularBadge}>POPULAR</div>}
                {selectedBundle?.id === bundle.id && (
                  <div style={{...styles.checkmark, background: bundle.gradient}}>✓</div>
                )}
                <div style={styles.bundleIcon}>{bundle.icon}</div>
                <h3 style={styles.bundleName}>{bundle.name}</h3>
                <p style={styles.bundleDesc}>{bundle.longDesc}</p>
                <div style={styles.bundleToolList}>
                  {bundle.tools.map(tool => (
                    <span key={tool.id} style={styles.bundleToolTag}>
                      {tool.icon} {tool.name}
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
                ...(selectedBundle ? {} : styles.continueBtnDisabled),
              }}
              onClick={handleContinueToCustomize}
              disabled={!selectedBundle}
            >
              Continue to Customize →
            </button>
          </div>
        </>
      )}

      {/* Step 2: Customize & Build */}
      {currentStep === 2 && selectedBundle && (
        <>
          <div style={styles.previewContainer}>
            {/* Main Preview */}
            <div style={styles.previewMain}>
              <div style={styles.previewHeader}>
                <div style={styles.previewIconLarge}>{selectedBundle.icon}</div>
                <div>
                  <h2 style={styles.previewTitle}>{selectedBundle.name}</h2>
                  <p style={styles.previewSubtitle}>{selectedBundle.tools.length} tools included</p>
                </div>
              </div>

              <h3 style={{color: '#fff', fontSize: '1.1rem', marginBottom: '16px', fontWeight: '600'}}>
                Tools in this bundle:
              </h3>
              <div style={styles.toolsGrid}>
                {selectedBundle.tools.map(tool => (
                  <div key={tool.id} style={styles.toolPreviewCard}>
                    <div style={styles.toolPreviewIcon}>{tool.icon}</div>
                    <div style={styles.toolPreviewName}>{tool.name}</div>
                    <div style={styles.toolPreviewDesc}>{tool.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customization Sidebar */}
            <div style={styles.previewSidebar}>
              <h3 style={{color: '#fff', fontSize: '1.2rem', marginBottom: '24px', fontWeight: '600'}}>
                ✨ Customize
              </h3>

              <div style={styles.formGroup}>
                <label style={styles.label}>Suite Name</label>
                <input
                  type="text"
                  style={styles.input}
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="My Business Tools"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Brand Color</label>
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

              <div style={styles.formGroup}>
                <label style={styles.label}>Visual Style</label>
                <div style={styles.styleOptions}>
                  {STYLE_PRESETS.map(style => (
                    <div
                      key={style.id}
                      style={{
                        ...styles.styleOption,
                        ...(stylePreset === style.id ? styles.styleOptionSelected : {}),
                      }}
                      onClick={() => setStylePreset(style.id)}
                    >
                      <span style={styles.styleIcon}>{style.icon}</span>
                      <span style={styles.styleName}>{style.name}</span>
                      {stylePreset === style.id && <span style={{marginLeft: 'auto', color: '#f97316'}}>✓</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={styles.actions}>
            <button style={styles.backBtn} onClick={() => setCurrentStep(1)}>
              ← Change Bundle
            </button>
            <button style={styles.continueBtn} onClick={handleBuildSuite}>
              🚀 Build My Suite ({selectedBundle.tools.length} tools)
            </button>
          </div>
        </>
      )}
    </div>
  );
}
