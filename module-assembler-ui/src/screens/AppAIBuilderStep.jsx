/**
 * AppAIBuilderStep
 * Phase 2: AI-powered app generation
 * User describes their app, Claude generates complete custom code
 * Cost: ~$0.10 per generation
 */

import React, { useState, useMemo } from 'react';
import { API_BASE } from '../constants';

// Anthropic API pricing (Claude Sonnet)
const PRICING = {
  inputPerMillion: 3.00,   // $3 per 1M input tokens
  outputPerMillion: 15.00, // $15 per 1M output tokens
};

// Estimate tokens from text (rough: ~4 chars per token)
const estimateTokens = (text) => Math.ceil(text.length / 4);

// Calculate cost from tokens
const calculateCost = (inputTokens, outputTokens) => {
  const inputCost = (inputTokens / 1_000_000) * PRICING.inputPerMillion;
  const outputCost = (outputTokens / 1_000_000) * PRICING.outputPerMillion;
  return inputCost + outputCost;
};

// Format cost for display
const formatCost = (cost) => {
  if (cost < 0.01) return `$${cost.toFixed(4)}`;
  if (cost < 0.10) return `$${cost.toFixed(3)}`;
  return `$${cost.toFixed(2)}`;
};

// Device target options
const DEVICE_OPTIONS = [
  {
    id: 'mobile',
    name: 'Mobile-First',
    icon: '📱',
    desc: 'Phone optimized, works on desktop',
    details: 'Bottom nav, larger touch targets, single column, swipe gestures'
  },
  {
    id: 'desktop',
    name: 'Desktop-First',
    icon: '🖥️',
    desc: 'Desktop optimized, responsive to mobile',
    details: 'Sidebar nav, hover effects, multi-column layouts, keyboard shortcuts'
  },
  {
    id: 'both',
    name: 'Both Equally',
    icon: '📱🖥️',
    desc: 'Fully responsive for all devices',
    details: 'Full breakpoint system, adapts navigation and layout per screen'
  },
];

// Theme options
const THEME_OPTIONS = [
  { id: 'dark', name: 'Dark', icon: '🌙' },
  { id: 'light', name: 'Light', icon: '☀️' },
  { id: 'auto', name: 'Auto', icon: '🔄' },
];

// Style options
const STYLE_OPTIONS = [
  { id: 'modern', name: 'Modern', desc: 'Clean lines, subtle shadows' },
  { id: 'playful', name: 'Playful', desc: 'Rounded, colorful, friendly' },
  { id: 'minimal', name: 'Minimal', desc: 'Stripped down, focused' },
  { id: 'professional', name: 'Professional', desc: 'Corporate, serious' },
];

// Color presets
const COLOR_PRESETS = [
  { color: '#8b5cf6', name: 'Purple' },
  { color: '#10b981', name: 'Green' },
  { color: '#3b82f6', name: 'Blue' },
  { color: '#f59e0b', name: 'Orange' },
  { color: '#ec4899', name: 'Pink' },
  { color: '#ef4444', name: 'Red' },
  { color: '#06b6d4', name: 'Cyan' },
  { color: '#6366f1', name: 'Indigo' },
];

// Example prompts
const EXAMPLE_PROMPTS = [
  "A recipe manager where I can save recipes with ingredients and instructions, tag them, and create weekly meal plans with a shopping list",
  "A reading list tracker with book covers, progress bars, ratings, and reading statistics",
  "A simple invoice generator for freelancers with client management and PDF export",
  "A workout log with exercises, sets/reps tracking, and weekly progress charts",
  "A mood tracker with daily entries, mood patterns over time, and journaling",
];

const styles = {
  container: {
    padding: '40px 24px',
    maxWidth: '900px',
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
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: 'rgba(255,255,255,0.6)',
  },
  costBadge: {
    display: 'inline-block',
    padding: '6px 14px',
    background: 'linear-gradient(135deg, #667eea20, #764ba220)',
    border: '1px solid rgba(102, 126, 234, 0.3)',
    borderRadius: '20px',
    fontSize: '0.85rem',
    color: '#667eea',
    marginTop: '16px',
  },
  mainCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '20px',
    padding: '32px',
    marginBottom: '24px',
  },
  label: {
    display: 'block',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '12px',
  },
  textarea: {
    width: '100%',
    minHeight: '160px',
    padding: '16px',
    fontSize: '1rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: '#fff',
    resize: 'vertical',
    outline: 'none',
    fontFamily: 'inherit',
    lineHeight: 1.6,
    boxSizing: 'border-box',
  },
  examplesSection: {
    marginTop: '16px',
  },
  examplesLabel: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: '8px',
  },
  examplesList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  exampleChip: {
    padding: '8px 14px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '20px',
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.7)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    maxWidth: '250px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '24px',
    marginBottom: '24px',
  },
  optionGroup: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '20px',
  },
  optionLabel: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: '12px',
  },
  themeButtons: {
    display: 'flex',
    gap: '8px',
  },
  themeButton: {
    flex: 1,
    padding: '12px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.2s',
  },
  colorPicker: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  colorSwatch: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    cursor: 'pointer',
    border: '3px solid transparent',
    transition: 'all 0.2s',
  },
  styleGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
  },
  styleButton: {
    padding: '12px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s',
  },
  deviceSection: {
    marginBottom: '24px',
  },
  deviceLabel: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '12px',
  },
  deviceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  deviceCard: {
    padding: '16px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '2px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '14px',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.2s',
  },
  deviceIcon: {
    fontSize: '2rem',
    marginBottom: '8px',
  },
  deviceName: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '4px',
  },
  deviceDesc: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: '8px',
  },
  deviceDetails: {
    fontSize: '0.7rem',
    color: 'rgba(255,255,255,0.4)',
    lineHeight: 1.3,
  },
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
  generateBtn: {
    padding: '16px 40px',
    fontSize: '1.1rem',
    fontWeight: '600',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  generateBtnDisabled: {
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
    borderTop: '4px solid #667eea',
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
    textAlign: 'center',
    maxWidth: '400px',
  },
  errorBox: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '24px',
    color: '#ef4444',
  },
  // Preview state
  previewContainer: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '20px',
    overflow: 'hidden',
  },
  previewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.02)',
  },
  previewTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#fff',
  },
  previewActions: {
    display: 'flex',
    gap: '12px',
  },
  previewBtn: {
    padding: '8px 16px',
    fontSize: '0.85rem',
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  downloadBtn: {
    padding: '8px 16px',
    fontSize: '0.85rem',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  previewFrame: {
    width: '100%',
    height: '500px',
    border: 'none',
    background: '#fff',
  },
  usageInfo: {
    padding: '16px 24px',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.02)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.5)',
  },
  // Cost estimation styles
  costEstimate: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    padding: '12px 20px',
    background: 'rgba(139, 92, 246, 0.1)',
    border: '1px solid rgba(139, 92, 246, 0.2)',
    borderRadius: '12px',
    marginBottom: '24px',
    fontSize: '0.9rem',
  },
  costLabel: {
    color: 'rgba(255,255,255,0.6)',
  },
  costValue: {
    color: '#8b5cf6',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  sessionCost: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '0.8rem',
  },
  actualCost: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  costBreakdown: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.4)',
  },
  // Download modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(8px)',
  },
  modalContent: {
    background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
    borderRadius: '24px',
    padding: '32px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
  },
  modalHeader: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  modalEmoji: {
    fontSize: '3rem',
    marginBottom: '16px',
  },
  modalTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#fff',
    margin: 0,
  },
  modalSubtitle: {
    fontSize: '0.95rem',
    color: 'rgba(255,255,255,0.6)',
    marginTop: '8px',
  },
  instructionSection: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '16px',
  },
  instructionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '12px',
  },
  instructionList: {
    margin: 0,
    padding: '0 0 0 20px',
    color: 'rgba(255,255,255,0.8)',
    fontSize: '0.9rem',
    lineHeight: 1.8,
  },
  instructionNote: {
    marginTop: '12px',
    padding: '12px',
    background: 'rgba(16, 185, 129, 0.15)',
    borderRadius: '8px',
    fontSize: '0.85rem',
    color: '#10b981',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
  },
  modalBtn: {
    flex: 1,
    padding: '14px 24px',
    borderRadius: '12px',
    border: 'none',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  modalBtnPrimary: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#fff',
  },
  modalBtnSecondary: {
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  pwaFeatures: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    marginTop: '16px',
  },
  pwaFeature: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 12px',
    background: 'rgba(139, 92, 246, 0.1)',
    borderRadius: '8px',
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.8)',
  },
};

export function AppAIBuilderStep({ onComplete, onBack }) {
  const [description, setDescription] = useState('');
  const [selectedDevice, setSelectedDevice] = useState('both');
  const [selectedTheme, setSelectedTheme] = useState('dark');
  const [selectedColor, setSelectedColor] = useState('#8b5cf6');
  const [selectedStyle, setSelectedStyle] = useState('modern');
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState(null);
  const [generatedApp, setGeneratedApp] = useState(null);
  const [usage, setUsage] = useState(null);
  const [previewDevice, setPreviewDevice] = useState('desktop'); // for preview toggle
  const [sessionCost, setSessionCost] = useState(0); // cumulative session cost
  const [showDownloadModal, setShowDownloadModal] = useState(false); // download instructions modal

  const canGenerate = description.trim().length >= 20;

  // Estimate cost before generation
  // System prompt is ~4000 tokens, output is typically 3000-8000 tokens
  const estimatedCost = useMemo(() => {
    const systemPromptTokens = 4500; // base prompt size
    const userDescriptionTokens = estimateTokens(description);
    const estimatedInputTokens = systemPromptTokens + userDescriptionTokens;

    // Output varies: simple apps ~3000, complex apps ~8000
    const descWords = description.trim().split(/\s+/).length;
    const complexityFactor = Math.min(descWords / 20, 1.5); // more words = more complex
    const estimatedOutputLow = 3000;
    const estimatedOutputHigh = Math.round(3000 + (5000 * complexityFactor));

    const costLow = calculateCost(estimatedInputTokens, estimatedOutputLow);
    const costHigh = calculateCost(estimatedInputTokens, estimatedOutputHigh);

    return {
      inputTokens: estimatedInputTokens,
      outputLow: estimatedOutputLow,
      outputHigh: estimatedOutputHigh,
      costLow,
      costHigh,
      display: `${formatCost(costLow)}-${formatCost(costHigh)}`
    };
  }, [description]);

  const handleExampleClick = (example) => {
    setDescription(example);
  };

  const handleGenerate = async () => {
    if (!canGenerate) return;

    setBuilding(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/apps/generate-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: description.trim(),
          preferences: {
            deviceTarget: selectedDevice,
            theme: selectedTheme,
            primaryColor: selectedColor,
            style: selectedStyle,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedApp(data);
        setUsage(data.usage);
        // Track cumulative session cost
        if (data.usage?.cost) {
          setSessionCost(prev => prev + data.usage.cost);
        }
      } else {
        setError(data.error || 'Failed to generate app');
      }
    } catch (err) {
      setError(`Generation failed: ${err.message}`);
    } finally {
      setBuilding(false);
    }
  };

  const handleDownload = () => {
    if (!generatedApp?.html) return;
    setShowDownloadModal(true);
  };

  const performDownload = () => {
    if (!generatedApp?.html) return;
    const blob = new Blob([generatedApp.html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(generatedApp.appName || 'my-app').toLowerCase().replace(/\s+/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowDownloadModal(false);
  };

  const handleComplete = () => {
    if (generatedApp) {
      onComplete({
        ...generatedApp,
        project: {
          name: generatedApp.appName || 'Custom App',
          type: 'ai-app',
        },
      });
    }
  };

  // Building state
  if (building) {
    return (
      <div style={styles.container}>
        <div style={styles.buildingContainer}>
          <div style={styles.spinner} />
          <h2 style={styles.buildingTitle}>🧠 AI is Building Your App</h2>
          <p style={styles.buildingSubtitle}>
            Claude is analyzing your requirements and generating custom code.
            This usually takes 10-30 seconds.
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Preview state (app generated)
  if (generatedApp) {
    const previewUrl = URL.createObjectURL(
      new Blob([generatedApp.html], { type: 'text/html' })
    );

    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>✨ Your App is Ready!</h1>
          <p style={styles.subtitle}>{generatedApp.appName || 'Custom App'}</p>
        </div>

        <div style={styles.previewContainer}>
          <div style={styles.previewHeader}>
            <span style={styles.previewTitle}>Live Preview</span>
            <div style={styles.previewActions}>
              {/* Device Toggle */}
              <div style={{ display: 'flex', gap: '4px', marginRight: '12px' }}>
                <button
                  style={{
                    ...styles.previewBtn,
                    background: previewDevice === 'mobile' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                  }}
                  onClick={() => setPreviewDevice('mobile')}
                  title="Mobile view (375px)"
                >
                  📱
                </button>
                <button
                  style={{
                    ...styles.previewBtn,
                    background: previewDevice === 'desktop' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                  }}
                  onClick={() => setPreviewDevice('desktop')}
                  title="Desktop view (full width)"
                >
                  🖥️
                </button>
              </div>
              <button
                style={styles.previewBtn}
                onClick={() => setGeneratedApp(null)}
              >
                ← Edit Prompt
              </button>
              <button style={styles.downloadBtn} onClick={handleDownload}>
                ⬇️ Download
              </button>
            </div>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            background: previewDevice === 'mobile' ? 'rgba(0,0,0,0.3)' : 'transparent',
            padding: previewDevice === 'mobile' ? '16px' : '0',
          }}>
            <iframe
              src={previewUrl}
              style={{
                ...styles.previewFrame,
                width: previewDevice === 'mobile' ? '375px' : '100%',
                borderRadius: previewDevice === 'mobile' ? '20px' : '0',
                border: previewDevice === 'mobile' ? '8px solid #333' : 'none',
              }}
              title="App Preview"
            />
          </div>
          {usage && (
            <div style={styles.usageInfo}>
              <div style={styles.actualCost}>
                <span>Actual: <strong style={{color: '#10b981'}}>{formatCost(usage.cost || calculateCost(usage.inputTokens, usage.outputTokens))}</strong></span>
                <span style={styles.costBreakdown}>
                  {(usage.inputTokens + usage.outputTokens).toLocaleString()} tokens ({usage.inputTokens.toLocaleString()} in, {usage.outputTokens.toLocaleString()} out)
                </span>
              </div>
              <span>Time: {(usage.durationMs / 1000).toFixed(1)}s</span>
              {sessionCost > 0 && (
                <span style={{color: '#8b5cf6'}}>Session: {formatCost(sessionCost)}</span>
              )}
            </div>
          )}
        </div>

        <div style={styles.actions}>
          <button style={styles.backBtn} onClick={onBack}>
            ← Back to Menu
          </button>
          <button style={styles.generateBtn} onClick={handleComplete}>
            Continue →
          </button>
        </div>

        {/* Download Instructions Modal */}
        {showDownloadModal && (
          <div style={styles.modalOverlay} onClick={() => setShowDownloadModal(false)}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <div style={styles.modalEmoji}>📱</div>
                <h2 style={styles.modalTitle}>Your App is Ready!</h2>
                <p style={styles.modalSubtitle}>
                  {generatedApp?.appName || 'Your custom app'} is a Progressive Web App
                </p>
              </div>

              {/* PWA Features */}
              <div style={styles.pwaFeatures}>
                <div style={styles.pwaFeature}>✅ Works Offline</div>
                <div style={styles.pwaFeature}>✅ Installable</div>
                <div style={styles.pwaFeature}>✅ Data Saved Locally</div>
                <div style={styles.pwaFeature}>✅ Export/Import Data</div>
              </div>

              {/* Phone Instructions */}
              <div style={{...styles.instructionSection, marginTop: '20px'}}>
                <div style={styles.instructionTitle}>
                  <span>📱</span> Install on Phone (Recommended)
                </div>
                <ol style={styles.instructionList}>
                  <li>Download and open the file in your phone's browser</li>
                  <li><strong>iPhone:</strong> Tap Share ↗ → "Add to Home Screen"</li>
                  <li><strong>Android:</strong> Tap ⋮ menu → "Install app" or "Add to Home Screen"</li>
                </ol>
                <div style={styles.instructionNote}>
                  <span>✨</span> Your app will work offline like a native app!
                </div>
              </div>

              {/* Computer Instructions */}
              <div style={styles.instructionSection}>
                <div style={styles.instructionTitle}>
                  <span>💻</span> Use on Computer
                </div>
                <ol style={styles.instructionList}>
                  <li>Open the downloaded HTML file in any browser</li>
                  <li>Bookmark it for easy access</li>
                  <li>Chrome users: Click install icon in address bar</li>
                </ol>
              </div>

              {/* Data Persistence Note */}
              <div style={{...styles.instructionSection, background: 'rgba(139, 92, 246, 0.1)'}}>
                <div style={styles.instructionTitle}>
                  <span>💾</span> Your Data is Safe
                </div>
                <p style={{margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: 1.6}}>
                  All your data is saved locally on your device. Use the Export button in the app's settings to backup your data, and Import to restore it anytime.
                </p>
              </div>

              <div style={styles.modalActions}>
                <button
                  style={{...styles.modalBtn, ...styles.modalBtnSecondary}}
                  onClick={() => setShowDownloadModal(false)}
                >
                  Cancel
                </button>
                <button
                  style={{...styles.modalBtn, ...styles.modalBtnPrimary}}
                  onClick={performDownload}
                >
                  ⬇️ Download App
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Input state
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>✨ AI App Builder</h1>
        <p style={styles.subtitle}>
          Describe the app you want, and Claude will build it for you
        </p>
        <div style={styles.costBadge}>Powered by Claude Sonnet</div>
      </div>

      {/* Cost Estimation Display */}
      {description.trim().length > 0 && (
        <div style={styles.costEstimate}>
          <span style={styles.costLabel}>Estimated cost:</span>
          <span style={styles.costValue}>~{estimatedCost.display}</span>
          {sessionCost > 0 && (
            <span style={styles.sessionCost}>
              Session total: {formatCost(sessionCost)}
            </span>
          )}
        </div>
      )}

      {error && <div style={styles.errorBox}>{error}</div>}

      {/* Description Input */}
      <div style={styles.mainCard}>
        <label style={styles.label}>Describe your app:</label>
        <textarea
          style={styles.textarea}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="I want an app that... (be specific about features, what data it tracks, what views it should have)"
        />

        <div style={styles.examplesSection}>
          <div style={styles.examplesLabel}>Try an example:</div>
          <div style={styles.examplesList}>
            {EXAMPLE_PROMPTS.map((example, i) => (
              <button
                key={i}
                style={styles.exampleChip}
                onClick={() => handleExampleClick(example)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#667eea';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                }}
              >
                {example.slice(0, 50)}...
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Device Target Selector */}
      <div style={styles.deviceSection}>
        <div style={styles.deviceLabel}>What device is this primarily for?</div>
        <div style={styles.deviceGrid}>
          {DEVICE_OPTIONS.map((device) => (
            <div
              key={device.id}
              onClick={() => setSelectedDevice(device.id)}
              style={{
                ...styles.deviceCard,
                borderColor: selectedDevice === device.id ? selectedColor : 'rgba(255, 255, 255, 0.08)',
                background: selectedDevice === device.id ? `${selectedColor}15` : 'rgba(255, 255, 255, 0.03)',
              }}
            >
              <div style={styles.deviceIcon}>{device.icon}</div>
              <div style={styles.deviceName}>{device.name}</div>
              <div style={styles.deviceDesc}>{device.desc}</div>
              <div style={styles.deviceDetails}>{device.details}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Options Grid */}
      <div style={styles.optionsGrid}>
        {/* Theme */}
        <div style={styles.optionGroup}>
          <div style={styles.optionLabel}>Theme</div>
          <div style={styles.themeButtons}>
            {THEME_OPTIONS.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                style={{
                  ...styles.themeButton,
                  borderColor: selectedTheme === theme.id ? selectedColor : 'rgba(255, 255, 255, 0.1)',
                  background: selectedTheme === theme.id ? `${selectedColor}20` : 'rgba(255, 255, 255, 0.05)',
                }}
              >
                <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{theme.icon}</div>
                <div style={{ fontSize: '0.8rem', color: selectedTheme === theme.id ? '#fff' : 'rgba(255,255,255,0.6)' }}>
                  {theme.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Primary Color */}
        <div style={styles.optionGroup}>
          <div style={styles.optionLabel}>Primary Color</div>
          <div style={styles.colorPicker}>
            {COLOR_PRESETS.map((preset) => (
              <div
                key={preset.color}
                style={{
                  ...styles.colorSwatch,
                  background: preset.color,
                  borderColor: selectedColor === preset.color ? '#fff' : 'transparent',
                  transform: selectedColor === preset.color ? 'scale(1.1)' : 'scale(1)',
                }}
                onClick={() => setSelectedColor(preset.color)}
                title={preset.name}
              />
            ))}
          </div>
        </div>

        {/* Style */}
        <div style={{ ...styles.optionGroup, gridColumn: 'span 2' }}>
          <div style={styles.optionLabel}>Visual Style</div>
          <div style={styles.styleGrid}>
            {STYLE_OPTIONS.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                style={{
                  ...styles.styleButton,
                  borderColor: selectedStyle === style.id ? selectedColor : 'rgba(255, 255, 255, 0.1)',
                  background: selectedStyle === style.id ? `${selectedColor}20` : 'rgba(255, 255, 255, 0.05)',
                }}
              >
                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: selectedStyle === style.id ? '#fff' : 'rgba(255,255,255,0.8)', marginBottom: '4px' }}>
                  {style.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                  {style.desc}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.actions}>
        <button style={styles.backBtn} onClick={onBack}>
          ← Back
        </button>
        <button
          style={{
            ...styles.generateBtn,
            ...(canGenerate ? {} : styles.generateBtnDisabled),
          }}
          onClick={handleGenerate}
          disabled={!canGenerate}
        >
          ✨ Generate Premium App
          {canGenerate && (
            <span style={{ opacity: 0.7, fontSize: '0.85rem' }}>
              (~{estimatedCost.display})
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
