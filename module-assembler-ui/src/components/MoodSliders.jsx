/**
 * MoodSliders Component
 *
 * Quick creative input sliders that help generate unique, personalized sites
 * even when users don't provide detailed descriptions.
 *
 * Each slider provides structured data that the AI can interpret to adjust:
 * - Color palettes, typography, layout density
 * - Copy tone and imagery style
 * - Animation levels and visual effects
 */

import React, { useState, useEffect } from 'react';

// Theme modes - explicit control over light/medium/dark
const THEME_MODES = [
  { id: 'light', label: 'Light', icon: '☀️', description: 'Clean, bright backgrounds' },
  { id: 'medium', label: 'Medium', icon: '🌤️', description: 'Subtle, soft backgrounds' },
  { id: 'dark', label: 'Dark', icon: '🌙', description: 'Bold, dark backgrounds' }
];

// Slider definitions with labels and what they affect
const MOOD_SLIDERS = [
  {
    id: 'vibe',
    label: 'Vibe',
    leftLabel: 'Professional',
    rightLabel: 'Friendly',
    leftIcon: '🏢',
    rightIcon: '😊',
    description: 'How formal should your site feel?',
    affects: ['copy tone', 'imagery warmth', 'color warmth']
  },
  {
    id: 'energy',
    label: 'Energy',
    leftLabel: 'Calm',
    rightLabel: 'Bold',
    leftIcon: '🌊',
    rightIcon: '⚡',
    description: 'Subtle elegance or eye-catching impact?',
    affects: ['color saturation', 'animations', 'typography weight']
  },
  {
    id: 'era',
    label: 'Style',
    leftLabel: 'Classic',
    rightLabel: 'Modern',
    leftIcon: '🏛️',
    rightIcon: '✨',
    description: 'Timeless traditional or cutting-edge trendy?',
    affects: ['fonts', 'layout patterns', 'effects']
  },
  {
    id: 'density',
    label: 'Content',
    leftLabel: 'Minimal',
    rightLabel: 'Rich',
    leftIcon: '◻️',
    rightIcon: '▣',
    description: 'Clean and spacious or detailed and informative?',
    affects: ['sections count', 'whitespace', 'content depth']
  },
  {
    id: 'price',
    label: 'Market',
    leftLabel: 'Value',
    rightLabel: 'Premium',
    leftIcon: '💰',
    rightIcon: '💎',
    description: 'Budget-friendly appeal or luxury positioning?',
    affects: ['color palette', 'typography elegance', 'imagery quality']
  }
];

// Quick presets that set multiple sliders at once
const PRESETS = [
  {
    id: 'luxury',
    name: 'Luxury',
    icon: '💎',
    values: { vibe: 30, energy: 35, era: 40, density: 30, price: 90 },
    theme: 'medium'
  },
  {
    id: 'friendly',
    name: 'Friendly Local',
    icon: '🏠',
    values: { vibe: 80, energy: 60, era: 50, density: 60, price: 40 },
    theme: 'light'
  },
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    icon: '◼️',
    values: { vibe: 50, energy: 40, era: 85, density: 20, price: 70 },
    theme: 'light'
  },
  {
    id: 'sharp-corporate',
    name: 'Sharp & Clean',
    icon: '📐',
    values: { vibe: 35, energy: 45, era: 95, density: 40, price: 65 },
    theme: 'light'
  },
  {
    id: 'bold-energetic',
    name: 'Bold & Fun',
    icon: '🎉',
    values: { vibe: 75, energy: 90, era: 70, density: 70, price: 50 },
    theme: 'light'
  },
  {
    id: 'classic-elegant',
    name: 'Classic Elegant',
    icon: '🏛️',
    values: { vibe: 25, energy: 30, era: 20, density: 45, price: 80 },
    theme: 'medium'
  },
  {
    id: 'dark-sleek',
    name: 'Dark & Sleek',
    icon: '🌙',
    values: { vibe: 40, energy: 55, era: 80, density: 35, price: 60 },
    theme: 'dark'
  }
];

const sliderStyles = {
  container: {
    marginTop: '24px',
    padding: '20px',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.08)'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px'
  },
  title: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#e4e4e4',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  expandBtn: {
    padding: '6px 12px',
    background: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    color: '#888',
    fontSize: '12px',
    cursor: 'pointer'
  },
  presets: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '20px'
  },
  presetBtn: {
    padding: '8px 14px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    color: '#aaa',
    fontSize: '13px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s ease'
  },
  presetBtnActive: {
    background: 'rgba(99, 102, 241, 0.2)',
    border: '1px solid rgba(99, 102, 241, 0.5)',
    color: '#a5b4fc'
  },
  slidersGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  sliderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  sliderLabel: {
    width: '70px',
    fontSize: '13px',
    color: '#888',
    flexShrink: 0
  },
  sliderLeft: {
    width: '80px',
    fontSize: '11px',
    color: '#666',
    textAlign: 'right',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '4px'
  },
  sliderRight: {
    width: '80px',
    fontSize: '11px',
    color: '#666',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  sliderTrack: {
    flex: 1,
    height: '6px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '3px',
    position: 'relative'
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
    borderRadius: '3px',
    transition: 'width 0.1s ease'
  },
  sliderInput: {
    width: '100%',
    height: '6px',
    appearance: 'none',
    background: 'transparent',
    cursor: 'pointer',
    position: 'relative',
    zIndex: 2
  },
  sliderWrapper: {
    flex: 1,
    position: 'relative'
  },
  collapsedPreview: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap'
  },
  previewItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#888'
  },
  previewValue: {
    padding: '2px 8px',
    background: 'rgba(99, 102, 241, 0.2)',
    borderRadius: '4px',
    color: '#a5b4fc',
    fontSize: '11px'
  }
};

// Add slider thumb styles via CSS
const sliderThumbCSS = `
  .mood-slider::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid #1a1a2e;
    box-shadow: 0 2px 6px rgba(99, 102, 241, 0.4);
    transition: transform 0.15s ease;
  }
  .mood-slider::-webkit-slider-thumb:hover {
    transform: scale(1.15);
  }
  .mood-slider::-moz-range-thumb {
    width: 18px;
    height: 18px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid #1a1a2e;
    box-shadow: 0 2px 6px rgba(99, 102, 241, 0.4);
  }
`;

export function MoodSliders({ values, onChange, compact = false }) {
  const [expanded, setExpanded] = useState(!compact);
  const [activePreset, setActivePreset] = useState(null);
  const [themeMode, setThemeMode] = useState(values?.theme || 'light');

  // Initialize with defaults (50 = neutral)
  // Handle null/undefined values by defaulting to empty object
  const [sliderValues, setSliderValues] = useState(() => {
    const safeValues = values || {};
    const defaults = {};
    MOOD_SLIDERS.forEach(s => {
      defaults[s.id] = safeValues[s.id] ?? 50;
    });
    return defaults;
  });

  // Inject CSS for slider thumbs
  useEffect(() => {
    const styleId = 'mood-slider-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = sliderThumbCSS;
      document.head.appendChild(style);
    }
  }, []);

  // Update parent when values change
  useEffect(() => {
    if (onChange) {
      onChange({ ...sliderValues, theme: themeMode });
    }
  }, [sliderValues, themeMode]);

  const handleSliderChange = (id, value) => {
    setSliderValues(prev => ({ ...prev, [id]: parseInt(value) }));
    setActivePreset(null); // Clear preset when manually adjusting
  };

  const applyPreset = (preset) => {
    setSliderValues(preset.values);
    if (preset.theme) setThemeMode(preset.theme);
    setActivePreset(preset.id);
  };

  // Get human-readable value label
  const getValueLabel = (slider, value) => {
    if (value < 35) return slider.leftLabel;
    if (value > 65) return slider.rightLabel;
    return 'Balanced';
  };

  // Collapsed view - just show current values
  if (!expanded) {
    return (
      <div style={sliderStyles.container}>
        <div style={sliderStyles.header}>
          <span style={sliderStyles.title}>
            🎨 Style Preferences
          </span>
          <button
            style={sliderStyles.expandBtn}
            onClick={() => setExpanded(true)}
          >
            Customize ▼
          </button>
        </div>
        <div style={sliderStyles.collapsedPreview}>
          {MOOD_SLIDERS.slice(0, 3).map(slider => (
            <div key={slider.id} style={sliderStyles.previewItem}>
              <span>{slider.label}:</span>
              <span style={sliderStyles.previewValue}>
                {getValueLabel(slider, sliderValues[slider.id])}
              </span>
            </div>
          ))}
          {activePreset && (
            <div style={sliderStyles.previewItem}>
              <span style={sliderStyles.previewValue}>
                {PRESETS.find(p => p.id === activePreset)?.icon} {PRESETS.find(p => p.id === activePreset)?.name}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={sliderStyles.container}>
      <div style={sliderStyles.header}>
        <span style={sliderStyles.title}>
          🎨 Style Preferences
          <span style={{ fontWeight: '400', color: '#666', fontSize: '12px' }}>
            (affects design generation)
          </span>
        </span>
        {compact && (
          <button
            style={sliderStyles.expandBtn}
            onClick={() => setExpanded(false)}
          >
            Collapse ▲
          </button>
        )}
      </div>

      {/* Theme Mode Selector */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
          Background Theme
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {THEME_MODES.map(mode => (
            <button
              key={mode.id}
              onClick={() => setThemeMode(mode.id)}
              style={{
                flex: 1,
                padding: '10px 12px',
                background: themeMode === mode.id
                  ? (mode.id === 'dark' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)')
                  : (mode.id === 'dark' ? 'rgba(0,0,0,0.3)' : mode.id === 'medium' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)'),
                border: themeMode === mode.id
                  ? '2px solid rgba(99, 102, 241, 0.6)'
                  : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: themeMode === mode.id ? '#a5b4fc' : '#888',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontWeight: themeMode === mode.id ? '600' : '400'
              }}
            >
              <span>{mode.icon}</span>
              <span>{mode.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Presets */}
      <div style={sliderStyles.presets}>
        {PRESETS.map(preset => (
          <button
            key={preset.id}
            style={{
              ...sliderStyles.presetBtn,
              ...(activePreset === preset.id ? sliderStyles.presetBtnActive : {})
            }}
            onClick={() => applyPreset(preset)}
          >
            <span>{preset.icon}</span>
            <span>{preset.name}</span>
          </button>
        ))}
      </div>

      {/* Sliders */}
      <div style={sliderStyles.slidersGrid}>
        {MOOD_SLIDERS.map(slider => (
          <div key={slider.id} style={sliderStyles.sliderRow}>
            <span style={sliderStyles.sliderLabel}>{slider.label}</span>
            <span style={sliderStyles.sliderLeft}>
              {slider.leftIcon} {slider.leftLabel}
            </span>
            <div style={sliderStyles.sliderWrapper}>
              <div style={sliderStyles.sliderTrack}>
                <div
                  style={{
                    ...sliderStyles.sliderFill,
                    width: `${sliderValues[slider.id]}%`
                  }}
                />
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sliderValues[slider.id]}
                onChange={(e) => handleSliderChange(slider.id, e.target.value)}
                className="mood-slider"
                style={{
                  ...sliderStyles.sliderInput,
                  position: 'absolute',
                  top: '-6px',
                  left: 0
                }}
              />
            </div>
            <span style={sliderStyles.sliderRight}>
              {slider.rightLabel} {slider.rightIcon}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Export slider definitions for use in prompt builders
export { MOOD_SLIDERS, PRESETS, THEME_MODES };
