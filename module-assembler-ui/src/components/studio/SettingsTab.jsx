/**
 * SettingsTab - Studio preferences and defaults
 *
 * Features:
 * - Default preset & theme selection
 * - Output directory configuration
 * - Legacy mode toggle
 * - Admin dashboard access
 */

import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../constants';

const STYLES = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    maxWidth: '800px',
    margin: '0 auto'
  },
  title: {
    color: '#fff',
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '8px'
  },
  section: {
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid rgba(255,255,255,0.08)'
  },
  sectionTitle: {
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  sectionDesc: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '13px',
    marginBottom: '16px',
    lineHeight: '1.5'
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid rgba(255,255,255,0.05)'
  },
  rowLast: {
    borderBottom: 'none'
  },
  label: {
    color: '#fff',
    fontSize: '14px'
  },
  labelDesc: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '12px',
    marginTop: '2px'
  },
  select: {
    padding: '8px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer',
    minWidth: '150px'
  },
  toggle: {
    position: 'relative',
    width: '48px',
    height: '24px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  toggleActive: {
    background: '#8b5cf6'
  },
  toggleKnob: {
    position: 'absolute',
    top: '2px',
    left: '2px',
    width: '20px',
    height: '20px',
    background: '#fff',
    borderRadius: '50%',
    transition: 'all 0.2s'
  },
  toggleKnobActive: {
    left: '26px'
  },
  button: {
    padding: '12px 24px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  buttonPrimary: {
    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
    border: 'none'
  },
  buttonDanger: {
    borderColor: '#ef4444',
    color: '#ef4444'
  },
  infoBox: {
    padding: '16px',
    background: 'rgba(59, 130, 246, 0.1)',
    borderRadius: '8px',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    color: 'rgba(255,255,255,0.8)',
    fontSize: '13px',
    lineHeight: '1.5'
  },
  codeBlock: {
    fontFamily: 'monospace',
    background: 'rgba(0,0,0,0.3)',
    padding: '8px 12px',
    borderRadius: '4px',
    color: '#a78bfa',
    fontSize: '12px',
    marginTop: '8px'
  },
  version: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.3)',
    fontSize: '12px',
    marginTop: '24px'
  }
};

const PRESETS = [
  { id: 'luxury', label: 'Luxury' },
  { id: 'friendly', label: 'Friendly' },
  { id: 'bold', label: 'Bold' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'warm', label: 'Warm' },
  { id: 'corporate', label: 'Corporate' }
];

const THEMES = [
  { id: 'light', label: 'Light' },
  { id: 'medium', label: 'Medium' },
  { id: 'dark', label: 'Dark' }
];

export default function SettingsTab() {
  const [settings, setSettings] = useState({
    defaultPreset: 'luxury',
    defaultTheme: 'light',
    defaultLayout: 'visual',
    autoPreview: true,
    showMetrics: true
  });

  const [devMode, setDevMode] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('studio_settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.warn('Failed to parse settings:', e);
      }
    }

    // Check dev mode
    const devAccess = localStorage.getItem('blink_dev_access');
    setDevMode(devAccess === 'granted');
  }, []);

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('studio_settings', JSON.stringify(newSettings));
  };

  const switchToLegacy = () => {
    localStorage.setItem('useLegacy', 'true');
    window.location.reload();
  };

  const clearAllData = () => {
    if (!confirm('This will clear all local settings and cached data. Continue?')) {
      return;
    }
    localStorage.removeItem('studio_settings');
    localStorage.removeItem('useLegacy');
    window.location.reload();
  };

  const openAdminDashboard = () => {
    window.location.href = '/?admin=true';
  };

  return (
    <div style={STYLES.container}>
      <div style={STYLES.title}>Settings</div>

      {/* Default Options */}
      <div style={STYLES.section}>
        <div style={STYLES.sectionTitle}>
          <span>🎨</span> Default Options
        </div>
        <div style={STYLES.sectionDesc}>
          These defaults are applied when creating new sites. You can override them during generation.
        </div>

        <div style={STYLES.row}>
          <div>
            <div style={STYLES.label}>Default Preset</div>
            <div style={STYLES.labelDesc}>Style preset for new sites</div>
          </div>
          <select
            value={settings.defaultPreset}
            onChange={e => updateSetting('defaultPreset', e.target.value)}
            style={STYLES.select}
          >
            {PRESETS.map(p => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </div>

        <div style={STYLES.row}>
          <div>
            <div style={STYLES.label}>Default Theme</div>
            <div style={STYLES.labelDesc}>Light/Dark theme preference</div>
          </div>
          <select
            value={settings.defaultTheme}
            onChange={e => updateSetting('defaultTheme', e.target.value)}
            style={STYLES.select}
          >
            {THEMES.map(t => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>

        <div style={{ ...STYLES.row, ...STYLES.rowLast }}>
          <div>
            <div style={STYLES.label}>Default Layout</div>
            <div style={STYLES.labelDesc}>Visual, Content, or Hybrid</div>
          </div>
          <select
            value={settings.defaultLayout}
            onChange={e => updateSetting('defaultLayout', e.target.value)}
            style={STYLES.select}
          >
            <option value="visual">Visual</option>
            <option value="content">Content</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
      </div>

      {/* Display Options */}
      <div style={STYLES.section}>
        <div style={STYLES.sectionTitle}>
          <span>👁️</span> Display Options
        </div>

        <div style={STYLES.row}>
          <div>
            <div style={STYLES.label}>Auto Preview</div>
            <div style={STYLES.labelDesc}>Update preview as you configure</div>
          </div>
          <div
            onClick={() => updateSetting('autoPreview', !settings.autoPreview)}
            style={{
              ...STYLES.toggle,
              ...(settings.autoPreview ? STYLES.toggleActive : {})
            }}
          >
            <div style={{
              ...STYLES.toggleKnob,
              ...(settings.autoPreview ? STYLES.toggleKnobActive : {})
            }} />
          </div>
        </div>

        <div style={{ ...STYLES.row, ...STYLES.rowLast }}>
          <div>
            <div style={STYLES.label}>Show Metrics</div>
            <div style={STYLES.labelDesc}>Display lines of code and file counts</div>
          </div>
          <div
            onClick={() => updateSetting('showMetrics', !settings.showMetrics)}
            style={{
              ...STYLES.toggle,
              ...(settings.showMetrics ? STYLES.toggleActive : {})
            }}
          >
            <div style={{
              ...STYLES.toggleKnob,
              ...(settings.showMetrics ? STYLES.toggleKnobActive : {})
            }} />
          </div>
        </div>
      </div>

      {/* Interface Mode */}
      <div style={STYLES.section}>
        <div style={STYLES.sectionTitle}>
          <span>🔧</span> Interface Mode
        </div>
        <div style={STYLES.sectionDesc}>
          You're currently using the new Generation Studio interface. The legacy interface is still available as a fallback.
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={switchToLegacy} style={STYLES.button}>
            <span>↩️</span> Switch to Legacy UI
          </button>
        </div>

        <div style={{ ...STYLES.infoBox, marginTop: '16px' }}>
          <strong>Tip:</strong> You can also access legacy mode by adding <code>?legacy=true</code> to the URL.
          <div style={STYLES.codeBlock}>
            {window.location.origin}?legacy=true
          </div>
        </div>
      </div>

      {/* Developer Tools (if dev mode) */}
      {devMode && (
        <div style={STYLES.section}>
          <div style={STYLES.sectionTitle}>
            <span>🛠️</span> Developer Tools
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={openAdminDashboard}
              style={{ ...STYLES.button, ...STYLES.buttonPrimary }}
            >
              <span>📊</span> Admin Dashboard
            </button>
            <button
              onClick={() => window.open('/api/health-check/full', '_blank')}
              style={STYLES.button}
            >
              <span>💚</span> Health Check
            </button>
            <button
              onClick={clearAllData}
              style={{ ...STYLES.button, ...STYLES.buttonDanger }}
            >
              <span>🗑️</span> Clear Local Data
            </button>
          </div>
        </div>
      )}

      {/* Version */}
      <div style={STYLES.version}>
        Generation Studio v1.0.0 | BLINK by BE1st
      </div>
    </div>
  );
}
