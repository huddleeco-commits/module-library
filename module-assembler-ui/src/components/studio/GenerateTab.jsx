/**
 * GenerateTab - Unified Generation Interface
 *
 * Features:
 * - Source: Pipeline prospect or Manual entry
 * - Input Levels: Minimal/Moderate/Extreme/Custom (auto-populate fields)
 * - Full-stack generation with video, logo, portal options
 * - Multi-variant support
 */

import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../constants';

const STYLES = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  section: {
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid rgba(255,255,255,0.08)'
  },
  sectionTitle: {
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  row: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none'
  },
  inputAutoFilled: {
    borderColor: 'rgba(234, 179, 8, 0.5)',
    background: 'rgba(234, 179, 8, 0.05)'
  },
  select: {
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer'
  },
  levelCard: {
    flex: 1,
    padding: '16px',
    background: 'rgba(255,255,255,0.03)',
    border: '2px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'center'
  },
  levelCardActive: {
    background: 'rgba(139, 92, 246, 0.15)',
    borderColor: '#8b5cf6'
  },
  levelIcon: {
    fontSize: '24px',
    marginBottom: '8px'
  },
  levelTitle: {
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600'
  },
  levelDesc: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '11px',
    marginTop: '4px'
  },
  presetGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px'
  },
  presetChip: {
    padding: '10px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'center'
  },
  presetChipActive: {
    background: 'rgba(139, 92, 246, 0.2)',
    borderColor: '#8b5cf6',
    color: '#fff'
  },
  themeRow: {
    display: 'flex',
    gap: '8px'
  },
  themeChip: {
    flex: 1,
    padding: '10px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'center',
    fontSize: '12px',
    fontWeight: '500'
  },
  checkbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  checkboxActive: {
    background: 'rgba(139, 92, 246, 0.1)'
  },
  generateBtn: {
    padding: '16px 32px',
    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  progressOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  progressCard: {
    background: '#1a1a1f',
    borderRadius: '16px',
    padding: '40px',
    maxWidth: '500px',
    width: '90%',
    textAlign: 'center'
  },
  progressTitle: {
    color: '#fff',
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '12px'
  },
  progressStatus: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '14px',
    marginBottom: '20px'
  },
  progressBar: {
    height: '8px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #8b5cf6, #6366f1)',
    borderRadius: '4px',
    transition: 'width 0.3s'
  },
  hint: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '11px',
    marginTop: '8px'
  },
  badge: {
    fontSize: '10px',
    padding: '2px 6px',
    borderRadius: '4px',
    background: 'rgba(234, 179, 8, 0.2)',
    color: '#eab308',
    marginLeft: '8px'
  }
};

const INPUT_LEVELS = [
  { id: 'minimal', icon: '⚡', title: 'Minimal', desc: 'AI picks everything' },
  { id: 'moderate', icon: '⚖️', title: 'Moderate', desc: 'Balanced defaults' },
  { id: 'extreme', icon: '🎛️', title: 'Extreme', desc: 'Full control' },
  { id: 'custom', icon: '✏️', title: 'Custom', desc: 'Start from scratch' }
];

const PRESETS = [
  { id: 'luxury', label: 'Luxury', color: '#d4af37' },
  { id: 'friendly', label: 'Friendly', color: '#22c55e' },
  { id: 'bold', label: 'Bold', color: '#ef4444' },
  { id: 'minimal', label: 'Minimal', color: '#94a3b8' },
  { id: 'warm', label: 'Warm', color: '#f59e0b' },
  { id: 'clean', label: 'Clean', color: '#3b82f6' }
];

const THEMES = [
  { id: 'light', label: 'Light', bg: '#ffffff', text: '#1a1a2e' },
  { id: 'medium', label: 'Medium', bg: '#2a2a3e', text: '#ffffff' },
  { id: 'dark', label: 'Dark', bg: '#0a0a0f', text: '#ffffff' }
];

const TIERS = [
  { id: 'premium', label: 'Premium (8+ pages)' },
  { id: 'standard', label: 'Standard (5 pages)' },
  { id: 'basic', label: 'Basic (3 pages)' }
];

export default function GenerateTab({ onSiteGenerated }) {
  // Source state
  const [sourceType, setSourceType] = useState('manual'); // 'pipeline' or 'manual'
  const [prospects, setProspects] = useState([]);
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [loadingProspects, setLoadingProspects] = useState(false);

  // Input level
  const [inputLevel, setInputLevel] = useState('moderate');
  const [autoFilledFields, setAutoFilledFields] = useState(new Set());

  // Business info
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [tagline, setTagline] = useState('');

  // Configuration
  const [preset, setPreset] = useState('luxury');
  const [theme, setTheme] = useState('light');
  const [tier, setTier] = useState('premium');
  const [layout, setLayout] = useState('visual');

  // Extras
  const [generateVideo, setGenerateVideo] = useState(true);
  const [generateLogo, setGenerateLogo] = useState(true);
  const [enablePortal, setEnablePortal] = useState(true);

  // Variants
  const [enableVariants, setEnableVariants] = useState(false);
  const [selectedPresets, setSelectedPresets] = useState(['luxury', 'friendly']);
  const [selectedThemes, setSelectedThemes] = useState(['light', 'dark']);

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState({ status: '', percent: 0 });

  // Load prospects when pipeline is selected
  useEffect(() => {
    if (sourceType === 'pipeline') {
      loadProspects();
    }
  }, [sourceType]);

  const loadProspects = async () => {
    setLoadingProspects(true);
    try {
      const res = await fetch(`${API_BASE}/api/studio/prospects`);
      const data = await res.json();
      if (data.success) {
        setProspects(data.prospects || []);
      }
    } catch (err) {
      console.error('Failed to load prospects:', err);
    } finally {
      setLoadingProspects(false);
    }
  };

  // Auto-fill when prospect + level changes
  useEffect(() => {
    if (sourceType === 'pipeline' && selectedProspect && inputLevel !== 'custom') {
      autoFillFromProspect();
    }
  }, [selectedProspect, inputLevel]);

  const autoFillFromProspect = async () => {
    if (!selectedProspect) return;

    try {
      const res = await fetch(`${API_BASE}/api/studio/inputs-preview/${selectedProspect.folder}/${inputLevel}`);
      const data = await res.json();

      if (data.success && data.inputs) {
        const inputs = data.inputs;
        const filled = new Set();

        // Fill fields
        if (inputs.businessName) { setBusinessName(inputs.businessName); filled.add('businessName'); }
        if (inputs.industry) { setIndustry(inputs.industry); filled.add('industry'); }
        if (inputs.city || inputs.address) {
          setLocation(inputs.city || inputs.address);
          filled.add('location');
        }
        if (inputs.tagline) { setTagline(inputs.tagline); filled.add('tagline'); }
        if (inputs.preset) { setPreset(inputs.preset); filled.add('preset'); }
        if (inputs.theme) { setTheme(inputs.theme); filled.add('theme'); }
        if (inputs.pageTier) { setTier(inputs.pageTier); filled.add('tier'); }
        if (inputs.layout) { setLayout(inputs.layout); filled.add('layout'); }

        setAutoFilledFields(filled);
      }
    } catch (err) {
      console.error('Failed to auto-fill:', err);
    }
  };

  // Clear auto-fill indicator when field is manually changed
  const handleFieldChange = (field, value, setter) => {
    setter(value);
    setAutoFilledFields(prev => {
      const next = new Set(prev);
      next.delete(field);
      return next;
    });
  };

  const variantCount = selectedPresets.length * selectedThemes.length;

  const handleGenerate = async () => {
    if (!businessName.trim()) {
      alert('Please enter a business name');
      return;
    }

    setGenerating(true);
    setProgress({ status: 'Starting generation...', percent: 5 });

    try {
      const payload = {
        source: sourceType === 'pipeline' && selectedProspect
          ? { type: 'prospect', prospectFolder: selectedProspect.folder }
          : {
              type: 'manual',
              business: {
                name: businessName,
                industry: industry || 'restaurant',
                location,
                tagline
              }
            },
        inputLevel,
        config: {
          preset,
          theme,
          tier,
          layout,
          generateVideo,
          generateLogo,
          enablePortal
        },
        variants: enableVariants ? {
          enabled: true,
          presets: selectedPresets,
          themes: selectedThemes
        } : { enabled: false },
        outputLocation: sourceType === 'pipeline' ? 'prospects' : 'generated-projects'
      };

      // Use EventSource for SSE
      const response = await fetch(`${API_BASE}/api/studio/unified-generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify(payload)
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n').filter(l => l.startsWith('data:'));

        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(5).trim());
            if (data.step === 'error') {
              throw new Error(data.error);
            }
            if (data.status) {
              setProgress({
                status: data.status,
                percent: data.progress || 50
              });
            }
            if (data.step === 'complete' || data.step === 'done') {
              setProgress({ status: 'Complete!', percent: 100 });
              setTimeout(() => {
                setGenerating(false);
                onSiteGenerated?.();
              }, 1500);
              return;
            }
          } catch (e) {
            if (e.message && !e.message.includes('JSON')) {
              throw e;
            }
          }
        }
      }

    } catch (err) {
      console.error('Generation failed:', err);
      setProgress({ status: `Error: ${err.message}`, percent: 0 });
      setTimeout(() => setGenerating(false), 3000);
    }
  };

  const isAutoFilled = (field) => autoFilledFields.has(field);

  return (
    <div style={STYLES.container}>
      {/* Source Selection */}
      <div style={STYLES.section}>
        <div style={STYLES.sectionTitle}>
          <span>📁</span> Source
        </div>
        <div style={STYLES.row}>
          <label style={{ ...STYLES.checkbox, flex: 1, ...(sourceType === 'pipeline' ? STYLES.checkboxActive : {}) }}>
            <input
              type="radio"
              checked={sourceType === 'pipeline'}
              onChange={() => setSourceType('pipeline')}
            />
            <span>From Pipeline</span>
          </label>
          <label style={{ ...STYLES.checkbox, flex: 1, ...(sourceType === 'manual' ? STYLES.checkboxActive : {}) }}>
            <input
              type="radio"
              checked={sourceType === 'manual'}
              onChange={() => setSourceType('manual')}
            />
            <span>Manual Entry</span>
          </label>
        </div>

        {sourceType === 'pipeline' && (
          <div style={{ marginTop: '12px' }}>
            <select
              value={selectedProspect?.folder || ''}
              onChange={e => {
                const p = prospects.find(pr => pr.folder === e.target.value);
                setSelectedProspect(p || null);
              }}
              style={{ ...STYLES.select, width: '100%' }}
              disabled={loadingProspects}
            >
              <option value="">
                {loadingProspects ? 'Loading prospects...' : 'Select a prospect...'}
              </option>
              {prospects.map(p => (
                <option key={p.folder} value={p.folder}>
                  {p.name} ({p.industry}) {p.hasResearch ? `- ${p.rating}★` : ''} - Score: {p.score || 0}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Input Level */}
      <div style={STYLES.section}>
        <div style={STYLES.sectionTitle}>
          <span>🎚️</span> Input Level
          {inputLevel !== 'custom' && (
            <span style={STYLES.badge}>Auto-fills fields below</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {INPUT_LEVELS.map(level => (
            <div
              key={level.id}
              onClick={() => setInputLevel(level.id)}
              style={{
                ...STYLES.levelCard,
                ...(inputLevel === level.id ? STYLES.levelCardActive : {})
              }}
            >
              <div style={STYLES.levelIcon}>{level.icon}</div>
              <div style={STYLES.levelTitle}>{level.title}</div>
              <div style={STYLES.levelDesc}>{level.desc}</div>
            </div>
          ))}
        </div>
        <div style={STYLES.hint}>
          {inputLevel === 'minimal' && 'System picks all style decisions based on industry and research data'}
          {inputLevel === 'moderate' && 'Balanced defaults with key options - best for most cases'}
          {inputLevel === 'extreme' && 'All options visible and pre-filled with intelligent defaults'}
          {inputLevel === 'custom' && 'Start with empty fields - full manual control'}
        </div>
      </div>

      {/* Business Info */}
      <div style={STYLES.section}>
        <div style={STYLES.sectionTitle}>
          <span>🏢</span> Business Info
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="text"
            placeholder="Business Name *"
            value={businessName}
            onChange={e => handleFieldChange('businessName', e.target.value, setBusinessName)}
            style={{
              ...STYLES.input,
              ...(isAutoFilled('businessName') ? STYLES.inputAutoFilled : {})
            }}
          />
          <div style={STYLES.row}>
            <input
              type="text"
              placeholder="Industry (e.g., bakery, dental)"
              value={industry}
              onChange={e => handleFieldChange('industry', e.target.value, setIndustry)}
              style={{
                ...STYLES.input,
                ...(isAutoFilled('industry') ? STYLES.inputAutoFilled : {})
              }}
            />
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={e => handleFieldChange('location', e.target.value, setLocation)}
              style={{
                ...STYLES.input,
                ...(isAutoFilled('location') ? STYLES.inputAutoFilled : {})
              }}
            />
          </div>
          <input
            type="text"
            placeholder="Tagline (optional)"
            value={tagline}
            onChange={e => handleFieldChange('tagline', e.target.value, setTagline)}
            style={{
              ...STYLES.input,
              ...(isAutoFilled('tagline') ? STYLES.inputAutoFilled : {})
            }}
          />
        </div>
      </div>

      {/* Style Configuration */}
      <div style={STYLES.section}>
        <div style={STYLES.sectionTitle}>
          <span>🎨</span> Style
        </div>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '8px' }}>
            Preset {isAutoFilled('preset') && <span style={STYLES.badge}>auto</span>}
          </div>
          <div style={STYLES.presetGrid}>
            {PRESETS.map(p => (
              <div
                key={p.id}
                onClick={() => handleFieldChange('preset', p.id, setPreset)}
                style={{
                  ...STYLES.presetChip,
                  ...(preset === p.id ? STYLES.presetChipActive : {}),
                  borderLeft: `3px solid ${p.color}`
                }}
              >
                {p.label}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '8px' }}>
            Theme {isAutoFilled('theme') && <span style={STYLES.badge}>auto</span>}
          </div>
          <div style={STYLES.themeRow}>
            {THEMES.map(t => (
              <div
                key={t.id}
                onClick={() => handleFieldChange('theme', t.id, setTheme)}
                style={{
                  ...STYLES.themeChip,
                  background: t.bg,
                  color: t.text,
                  border: theme === t.id ? '2px solid #8b5cf6' : '2px solid rgba(255,255,255,0.1)'
                }}
              >
                {t.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Structure */}
      <div style={STYLES.section}>
        <div style={STYLES.sectionTitle}>
          <span>📐</span> Structure
        </div>
        <div style={STYLES.row}>
          <div style={{ flex: 1 }}>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '8px' }}>
              Tier {isAutoFilled('tier') && <span style={STYLES.badge}>auto</span>}
            </div>
            <select
              value={tier}
              onChange={e => handleFieldChange('tier', e.target.value, setTier)}
              style={{ ...STYLES.select, width: '100%' }}
            >
              {TIERS.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '8px' }}>
              Layout {isAutoFilled('layout') && <span style={STYLES.badge}>auto</span>}
            </div>
            <select
              value={layout}
              onChange={e => handleFieldChange('layout', e.target.value, setLayout)}
              style={{ ...STYLES.select, width: '100%' }}
            >
              <option value="visual">Visual (image-heavy)</option>
              <option value="content">Content (text-focused)</option>
              <option value="hybrid">Hybrid (balanced)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Variants */}
      <div style={STYLES.section}>
        <div style={STYLES.sectionTitle}>
          <span>📊</span> Variants
        </div>
        <label style={{ ...STYLES.checkbox, ...(enableVariants ? STYLES.checkboxActive : {}) }}>
          <input
            type="checkbox"
            checked={enableVariants}
            onChange={e => setEnableVariants(e.target.checked)}
          />
          <span>Generate multiple variants for comparison</span>
        </label>

        {enableVariants && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '8px' }}>
              Select presets:
            </div>
            <div style={STYLES.presetGrid}>
              {PRESETS.map(p => (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedPresets(prev =>
                      prev.includes(p.id)
                        ? prev.filter(x => x !== p.id)
                        : [...prev, p.id]
                    );
                  }}
                  style={{
                    ...STYLES.presetChip,
                    ...(selectedPresets.includes(p.id) ? STYLES.presetChipActive : {}),
                    borderLeft: `3px solid ${p.color}`
                  }}
                >
                  {p.label}
                </div>
              ))}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginTop: '12px', marginBottom: '8px' }}>
              Select themes:
            </div>
            <div style={STYLES.themeRow}>
              {THEMES.map(t => (
                <div
                  key={t.id}
                  onClick={() => {
                    setSelectedThemes(prev =>
                      prev.includes(t.id)
                        ? prev.filter(x => x !== t.id)
                        : [...prev, t.id]
                    );
                  }}
                  style={{
                    ...STYLES.themeChip,
                    background: t.bg,
                    color: t.text,
                    border: selectedThemes.includes(t.id) ? '2px solid #8b5cf6' : '2px solid rgba(255,255,255,0.1)'
                  }}
                >
                  {t.label}
                </div>
              ))}
            </div>
            <div style={{
              marginTop: '12px',
              padding: '10px',
              background: 'rgba(139, 92, 246, 0.1)',
              borderRadius: '8px',
              textAlign: 'center',
              color: '#a78bfa',
              fontSize: '14px'
            }}>
              {selectedPresets.length} presets x {selectedThemes.length} themes = <strong>{variantCount} variants</strong>
            </div>
          </div>
        )}
      </div>

      {/* Extras */}
      <div style={STYLES.section}>
        <div style={STYLES.sectionTitle}>
          <span>✨</span> Extras
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <label style={{ ...STYLES.checkbox, flex: 1, ...(generateVideo ? STYLES.checkboxActive : {}) }}>
            <input
              type="checkbox"
              checked={generateVideo}
              onChange={e => setGenerateVideo(e.target.checked)}
            />
            <span>Generate Video</span>
          </label>
          <label style={{ ...STYLES.checkbox, flex: 1, ...(generateLogo ? STYLES.checkboxActive : {}) }}>
            <input
              type="checkbox"
              checked={generateLogo}
              onChange={e => setGenerateLogo(e.target.checked)}
            />
            <span>Generate Logo</span>
          </label>
          <label style={{ ...STYLES.checkbox, flex: 1, ...(enablePortal ? STYLES.checkboxActive : {}) }}>
            <input
              type="checkbox"
              checked={enablePortal}
              onChange={e => setEnablePortal(e.target.checked)}
            />
            <span>Add Portal Pages</span>
          </label>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={generating || !businessName.trim()}
        style={{
          ...STYLES.generateBtn,
          opacity: generating || !businessName.trim() ? 0.5 : 1,
          cursor: generating || !businessName.trim() ? 'not-allowed' : 'pointer'
        }}
      >
        {generating ? (
          <>
            <span>⏳</span>
            Generating...
          </>
        ) : (
          <>
            <span>🚀</span>
            {enableVariants ? `Generate ${variantCount} Variants` : 'Generate Full-Stack Site'}
          </>
        )}
      </button>

      {/* Progress Overlay */}
      {generating && (
        <div style={STYLES.progressOverlay}>
          <div style={STYLES.progressCard}>
            <div style={STYLES.progressTitle}>
              {enableVariants ? `Generating ${variantCount} Variants` : 'Generating Your Site'}
            </div>
            <div style={STYLES.progressStatus}>{progress.status}</div>
            <div style={STYLES.progressBar}>
              <div style={{ ...STYLES.progressFill, width: `${progress.percent}%` }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
