/**
 * ToolSuiteInstantStep
 * AI-powered tool suite builder
 * User describes their business, AI picks the best tools
 */

import React, { useState, useRef } from 'react';
import { API_BASE } from '../constants';

const styles = {
  container: {
    padding: '40px 24px',
    maxWidth: '900px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '48px',
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
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: 1.6,
  },
  inputSection: {
    marginBottom: '40px',
  },
  inputWrapper: {
    position: 'relative',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '2px solid rgba(102, 126, 234, 0.3)',
    borderRadius: '20px',
    padding: '8px',
    transition: 'all 0.3s ease',
  },
  inputWrapperFocused: {
    borderColor: 'rgba(102, 126, 234, 0.6)',
    boxShadow: '0 0 30px rgba(102, 126, 234, 0.2)',
  },
  textarea: {
    width: '100%',
    minHeight: '120px',
    padding: '20px 24px',
    fontSize: '1.1rem',
    background: 'transparent',
    border: 'none',
    color: '#fff',
    resize: 'none',
    outline: 'none',
    lineHeight: 1.6,
  },
  inputFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderTop: '1px solid rgba(255,255,255,0.05)',
  },
  charCount: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.4)',
  },
  analyzeBtn: {
    padding: '12px 32px',
    fontSize: '1rem',
    fontWeight: '600',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'all 0.2s ease',
  },
  analyzeBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  examples: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginTop: '16px',
  },
  exampleChip: {
    padding: '8px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  // Analysis Results
  resultsSection: {
    marginTop: '40px',
  },
  resultHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
    padding: '20px 24px',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.05))',
    borderRadius: '16px',
    border: '1px solid rgba(102, 126, 234, 0.2)',
  },
  resultIcon: {
    fontSize: '2.5rem',
  },
  resultTitle: {
    fontSize: '1.3rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '4px',
  },
  resultSubtitle: {
    fontSize: '0.95rem',
    color: 'rgba(255,255,255,0.5)',
  },
  toolsRecommended: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
    marginBottom: '32px',
  },
  toolCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    padding: '20px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    transition: 'all 0.2s ease',
  },
  toolCardSelected: {
    borderColor: 'rgba(102, 126, 234, 0.5)',
    background: 'rgba(102, 126, 234, 0.08)',
  },
  toolIcon: {
    fontSize: '2rem',
    flexShrink: 0,
  },
  toolInfo: {
    flex: 1,
  },
  toolName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '4px',
  },
  toolDesc: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 1.4,
  },
  toolReason: {
    fontSize: '0.8rem',
    color: '#667eea',
    marginTop: '8px',
    fontStyle: 'italic',
  },
  checkbox: {
    width: '22px',
    height: '22px',
    borderRadius: '6px',
    border: '2px solid rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
  },
  checkboxSelected: {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    borderColor: 'transparent',
    color: '#fff',
  },

  // Customization
  customizeSection: {
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '20px',
    padding: '28px',
    border: '1px solid rgba(255,255,255,0.08)',
    marginBottom: '32px',
  },
  customizeTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '20px',
  },
  customizeGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
  },
  formGroup: {
    marginBottom: '0',
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
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    cursor: 'pointer',
    border: '3px solid transparent',
    transition: 'all 0.2s ease',
  },

  // Actions
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    padding: '14px 28px',
    fontSize: '1rem',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '12px',
    color: 'rgba(255,255,255,0.7)',
    cursor: 'pointer',
  },
  buildBtn: {
    padding: '16px 40px',
    fontSize: '1.1rem',
    fontWeight: '600',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  buildBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },

  // Loading states
  analyzing: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '60px',
    gap: '24px',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '3px solid rgba(255,255,255,0.1)',
    borderTop: '3px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  building: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    gap: '24px',
  },
};

const EXAMPLE_PROMPTS = [
  "I run a coffee shop and need tools for tips and inventory",
  "Personal trainer who tracks client progress and meals",
  "Freelance designer managing projects and invoices",
  "Small bakery handling orders and recipes",
  "YouTube creator tracking habits and passwords",
];

const COLOR_PRESETS = ['#667eea', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6'];

export function ToolSuiteInstantStep({ onComplete, onBack }) {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [selectedTools, setSelectedTools] = useState([]);
  const [businessName, setBusinessName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#667eea');
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);

  const handleAnalyze = async () => {
    if (!input.trim() || input.length < 10) return;

    setAnalyzing(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/orchestrate/analyze-for-tools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: input }),
      });

      const data = await response.json();

      if (data.success) {
        setAnalysis(data);
        // Pre-select all recommended tools
        setSelectedTools(data.tools.map(t => t.toolType));
        // Set suggested name
        if (data.suggestedName) {
          setBusinessName(data.suggestedName);
        }
      } else {
        setError(data.error || 'Analysis failed');
      }
    } catch (err) {
      setError(`Analysis failed: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleTool = (toolType) => {
    setSelectedTools(prev =>
      prev.includes(toolType)
        ? prev.filter(t => t !== toolType)
        : [...prev, toolType]
    );
  };

  const handleBuild = async () => {
    if (selectedTools.length < 2) {
      setError('Please select at least 2 tools');
      return;
    }

    setBuilding(true);
    setError(null);

    try {
      const tools = analysis.tools.filter(t => selectedTools.includes(t.toolType));

      const response = await fetch(`${API_BASE}/api/orchestrate/build-suite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tools: tools.map(t => ({
            toolType: t.toolType,
            name: t.name,
            icon: t.icon,
            description: t.description,
          })),
          branding: {
            businessName: businessName || 'My Tool Suite',
            colors: { primary: primaryColor, accent: primaryColor },
            style: 'modern',
          },
          options: {
            aiGenerated: true,
            originalDescription: input,
            organization: 'auto',
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        onComplete(data);
      } else {
        setError(data.error || 'Build failed');
        setBuilding(false);
      }
    } catch (err) {
      setError(`Build failed: ${err.message}`);
      setBuilding(false);
    }
  };

  const handleExampleClick = (example) => {
    setInput(example);
    textareaRef.current?.focus();
  };

  // Building state
  if (building) {
    return (
      <div style={styles.container}>
        <div style={styles.building}>
          <div style={styles.spinner} />
          <h2 style={{fontSize: '1.5rem', fontWeight: '600', color: '#fff'}}>Building Your AI-Curated Suite</h2>
          <p style={{color: 'rgba(255,255,255,0.5)'}}>
            Generating {selectedTools.length} personalized tools...
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
        <h1 style={styles.title}>🚀 AI Tool Picker</h1>
        <p style={styles.subtitle}>
          Describe your business or work in a few sentences.
          Our AI will recommend the perfect tools for you.
        </p>
      </div>

      {/* Input Section */}
      <div style={styles.inputSection}>
        <div style={{
          ...styles.inputWrapper,
          ...(isFocused ? styles.inputWrapperFocused : {}),
        }}>
          <textarea
            ref={textareaRef}
            style={styles.textarea}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Example: I'm a personal trainer who needs to track client workouts, calculate their nutrition, and manage my schedule..."
            disabled={analyzing || !!analysis}
          />
          <div style={styles.inputFooter}>
            <span style={styles.charCount}>{input.length} characters</span>
            {!analysis && (
              <button
                style={{
                  ...styles.analyzeBtn,
                  ...(input.length < 10 || analyzing ? styles.analyzeBtnDisabled : {}),
                }}
                onClick={handleAnalyze}
                disabled={input.length < 10 || analyzing}
              >
                {analyzing ? (
                  <>
                    <span style={{...styles.spinner, width: '18px', height: '18px', borderWidth: '2px'}} />
                    Analyzing...
                  </>
                ) : (
                  <>✨ Analyze & Recommend</>
                )}
              </button>
            )}
          </div>
        </div>

        {!analysis && !analyzing && (
          <div style={styles.examples}>
            <span style={{color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginRight: '8px'}}>Try:</span>
            {EXAMPLE_PROMPTS.slice(0, 3).map((example, i) => (
              <span
                key={i}
                style={styles.exampleChip}
                onClick={() => handleExampleClick(example)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                }}
              >
                {example.length > 40 ? example.slice(0, 40) + '...' : example}
              </span>
            ))}
          </div>
        )}
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

      {/* Analysis Results */}
      {analysis && (
        <div style={styles.resultsSection}>
          <div style={styles.resultHeader}>
            <div style={styles.resultIcon}>{analysis.industryIcon || '🎯'}</div>
            <div>
              <div style={styles.resultTitle}>
                {analysis.industry ? `Perfect for ${analysis.industry}!` : 'AI Recommendations'}
              </div>
              <div style={styles.resultSubtitle}>
                We found {analysis.tools.length} tools that match your needs
              </div>
            </div>
          </div>

          <h3 style={{color: '#fff', fontSize: '1.1rem', marginBottom: '16px', fontWeight: '600'}}>
            Recommended Tools (select the ones you want):
          </h3>

          <div style={styles.toolsRecommended}>
            {analysis.tools.map(tool => (
              <div
                key={tool.toolType}
                style={{
                  ...styles.toolCard,
                  ...(selectedTools.includes(tool.toolType) ? styles.toolCardSelected : {}),
                  cursor: 'pointer',
                }}
                onClick={() => toggleTool(tool.toolType)}
              >
                <div
                  style={{
                    ...styles.checkbox,
                    ...(selectedTools.includes(tool.toolType) ? styles.checkboxSelected : {}),
                  }}
                >
                  {selectedTools.includes(tool.toolType) && '✓'}
                </div>
                <div style={styles.toolIcon}>{tool.icon}</div>
                <div style={styles.toolInfo}>
                  <div style={styles.toolName}>{tool.name}</div>
                  <div style={styles.toolDesc}>{tool.description}</div>
                  {tool.reason && <div style={styles.toolReason}>"{tool.reason}"</div>}
                </div>
              </div>
            ))}
          </div>

          {/* Customization */}
          <div style={styles.customizeSection}>
            <h3 style={styles.customizeTitle}>✨ Quick Customize</h3>
            <div style={styles.customizeGrid}>
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
            </div>
          </div>

          {/* Actions */}
          <div style={styles.actions}>
            <button
              style={styles.backBtn}
              onClick={() => {
                setAnalysis(null);
                setSelectedTools([]);
                setInput('');
              }}
            >
              ← Start Over
            </button>
            <button
              style={{
                ...styles.buildBtn,
                ...(selectedTools.length < 2 ? styles.buildBtnDisabled : {}),
              }}
              onClick={handleBuild}
              disabled={selectedTools.length < 2}
            >
              🚀 Build Suite ({selectedTools.length} tools)
            </button>
          </div>
        </div>
      )}

      {/* Back button when no analysis */}
      {!analysis && (
        <div style={styles.actions}>
          <button style={styles.backBtn} onClick={onBack}>
            ← Back
          </button>
          <div />
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
