/**
 * OrchestratorStep
 * One-sentence generation mode - AI handles everything
 */

import React, { useState, useEffect } from 'react';
import { API_BASE } from '../constants';

// Device target options
const DEVICE_OPTIONS = [
  { id: 'mobile', name: 'Mobile-First', icon: '📱', desc: 'Phone optimized' },
  { id: 'desktop', name: 'Desktop-First', icon: '🖥️', desc: 'Desktop optimized' },
  { id: 'both', name: 'Responsive', icon: '📱🖥️', desc: 'All devices equally' },
];

const orchestratorStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '70vh',
    padding: '40px 20px',
    textAlign: 'center'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '8px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#666',
    marginBottom: '40px',
    maxWidth: '500px'
  },
  inputContainer: {
    width: '100%',
    maxWidth: '700px',
    marginBottom: '24px'
  },
  input: {
    width: '100%',
    padding: '20px 24px',
    fontSize: '1.2rem',
    border: '2px solid #e2e8f0',
    borderRadius: '16px',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box'
  },
  inputFocused: {
    borderColor: '#667eea',
    boxShadow: '0 0 0 4px rgba(102, 126, 234, 0.1)'
  },
  blinkButton: {
    padding: '18px 60px',
    fontSize: '1.3rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
  },
  blinkButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed'
  },
  backButton: {
    marginTop: '24px',
    padding: '10px 24px',
    fontSize: '0.9rem',
    color: '#666',
    background: 'transparent',
    border: '1px solid #ddd',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  progressContainer: {
    marginTop: '32px',
    padding: '24px',
    background: '#f8fafc',
    borderRadius: '12px',
    maxWidth: '600px',
    width: '100%'
  },
  progressText: {
    fontSize: '1.1rem',
    color: '#333',
    marginBottom: '16px'
  },
  decisionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
    textAlign: 'left'
  },
  decisionItem: {
    padding: '12px 16px',
    background: 'white',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  decisionLabel: {
    fontSize: '0.75rem',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '4px'
  },
  decisionValue: {
    fontSize: '0.95rem',
    color: '#1a1a2e',
    fontWeight: '500'
  },
  error: {
    marginTop: '16px',
    padding: '12px 20px',
    background: '#fee2e2',
    color: '#dc2626',
    borderRadius: '8px',
    fontSize: '0.95rem'
  },
  colorPalette: {
    display: 'flex',
    gap: '8px',
    marginTop: '4px'
  },
  colorSwatch: {
    width: '24px',
    height: '24px',
    borderRadius: '4px',
    border: '1px solid rgba(0,0,0,0.1)'
  },
  // New progress step styles
  stepList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '24px',
    width: '100%',
    textAlign: 'left'
  },
  stepItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    background: 'white'
  },
  stepIcon: {
    fontSize: '18px',
    width: '28px',
    textAlign: 'center'
  },
  stepLabel: {
    fontSize: '0.95rem',
    flex: 1
  },
  activeDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#667eea',
    animation: 'pulse 1.5s infinite'
  },
  progressBar: {
    width: '100%',
    height: '6px',
    background: '#e2e8f0',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '16px'
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '3px',
    transition: 'width 0.5s ease'
  },
  timeRow: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    fontSize: '0.85rem',
    color: '#666',
    marginTop: '8px'
  },
  // Device target styles
  deviceSection: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    marginTop: '8px',
  },
  deviceButton: {
    padding: '8px 16px',
    borderRadius: '20px',
    border: '2px solid #e2e8f0',
    background: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.85rem',
    transition: 'all 0.2s',
  },
  deviceButtonActive: {
    borderColor: '#667eea',
    background: 'rgba(102, 126, 234, 0.1)',
    color: '#667eea',
    fontWeight: '600'
  },
  // Companion app toggle styles
  companionToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
    padding: '12px 16px',
    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(102, 126, 234, 0.1) 100%)',
    borderRadius: '12px',
    border: '1px solid rgba(139, 92, 246, 0.2)',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  companionToggleActive: {
    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(102, 126, 234, 0.2) 100%)',
    border: '2px solid #8b5cf6'
  },
  companionCheckbox: {
    width: '20px',
    height: '20px',
    borderRadius: '6px',
    border: '2px solid #8b5cf6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'white',
    flexShrink: 0
  },
  companionCheckboxActive: {
    background: '#8b5cf6'
  },
  companionText: {
    flex: 1,
    textAlign: 'left'
  },
  companionLabel: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#1a1a2e'
  },
  companionDesc: {
    fontSize: '0.8rem',
    color: '#666',
    marginTop: '2px'
  }
};

// Tool display names mapping
const toolDisplayNames = {
  'invoice-generator': 'Invoice Generator',
  'qr-generator': 'QR Code Generator',
  'calculator': 'Calculator',
  'countdown': 'Countdown Timer',
  'tip-calculator': 'Tip Calculator',
  'bmi-calculator': 'BMI Calculator',
  'unit-converter': 'Unit Converter',
  'password-generator': 'Password Generator',
};

// Business placeholders
const businessPlaceholders = [
  "Mario's Pizza in Brooklyn - authentic Italian since 1985",
  "Dr. Sarah Chen's Family Dental Practice in Austin",
  "Zen Flow Yoga Studio - modern wellness in downtown Seattle",
  "Thompson & Associates Law Firm specializing in business law",
  "Jake's Auto Repair - honest service in small town Ohio",
  "Sunrise Coffee Roasters - artisan coffee in Portland",
  "Elite CrossFit Gym - transform your fitness journey",
  "The Rustic Table Restaurant - farm to table dining"
];

// Tool placeholders
const toolPlaceholders = [
  "A tip calculator with bill splitting",
  "Pomodoro timer with customizable intervals",
  "BMI calculator with health recommendations",
  "Unit converter for cooking measurements",
  "Password generator with strength indicator",
  "Expense tracker with categories",
  "Color palette generator for designers",
  "Countdown timer for events"
];

// Generation steps for business websites
const BUSINESS_GENERATION_STEPS = [
  { id: 'analyzing', label: 'Analyzing your request', icon: '🔍' },
  { id: 'planning', label: 'Planning website structure', icon: '📋' },
  { id: 'selecting', label: 'Selecting industry template', icon: '🏭' },
  { id: 'generating-home', label: 'Generating Home page', icon: '🏠' },
  { id: 'generating-about', label: 'Generating About page', icon: '📝' },
  { id: 'generating-services', label: 'Generating Services page', icon: '⚙️' },
  { id: 'generating-contact', label: 'Generating Contact page', icon: '📬' },
  { id: 'styling', label: 'Applying theme & colors', icon: '🎨' },
  { id: 'wiring', label: 'Wiring up components', icon: '🔧' },
  { id: 'finalizing', label: 'Finalizing project', icon: '✨' }
];

// Generation steps for tools
const TOOL_GENERATION_STEPS = [
  { id: 'analyzing', label: 'Analyzing your request', icon: '🔍' },
  { id: 'designing', label: 'Designing tool layout', icon: '📐' },
  { id: 'building', label: 'Building functionality', icon: '🛠️' },
  { id: 'styling', label: 'Applying styles', icon: '🎨' },
  { id: 'testing', label: 'Running validation tests', icon: '🧪' },
  { id: 'finalizing', label: 'Finalizing tool', icon: '✨' }
];

export function OrchestratorStep({ onComplete, onBack, isToolMode = false, preselectedTool = null, onSuggestTools, onAmbiguousInput, onToolRecommendations, skipIntentDetection = false, pendingInput = null, pendingIndustryKey = null, onPendingInputUsed }) {
  const [input, setInput] = useState(pendingInput || '');
  const [selectedDevice, setSelectedDevice] = useState('both');
  const [includeCompanionApp, setIncludeCompanionApp] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(null);
  const [aiDecisions, setAiDecisions] = useState(null);
  const [nameAvailability, setNameAvailability] = useState(null); // { available, suggestions, message }
  const [error, setError] = useState(null);
  const [autoStarted, setAutoStarted] = useState(false);
  const [showSuggestInput, setShowSuggestInput] = useState(false);
  const [suggestInput, setSuggestInput] = useState('');
  const [detectingIntent, setDetectingIntent] = useState(false);
  const [pendingTriggered, setPendingTriggered] = useState(false);

  // New: Step-based progress tracking
  const [generationSteps, setGenerationSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [pendingResult, setPendingResult] = useState(null); // Hold result until user confirms

  const placeholders = isToolMode ? toolPlaceholders : businessPlaceholders;

  const [placeholder] = useState(() =>
    placeholders[Math.floor(Math.random() * placeholders.length)]
  );

  // Update elapsed time every second during generation
  useEffect(() => {
    if (!startTime || !generating) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, generating]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  // Check name availability when AI detects a business name
  useEffect(() => {
    if (aiDecisions?.businessName) {
      setNameAvailability(null); // Reset while checking
      fetch(`/api/check-name?name=${encodeURIComponent(aiDecisions.businessName)}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setNameAvailability(data);
          }
        })
        .catch(err => {
          console.error('Name check failed:', err);
        });
    }
  }, [aiDecisions?.businessName]);

  // Auto-trigger if there's a pending input from choice screen
  useEffect(() => {
    if (pendingInput && !pendingTriggered && !generating) {
      setPendingTriggered(true);
      if (onPendingInputUsed) onPendingInputUsed();
      // Auto-trigger with skip intent detection since user already chose
      setTimeout(() => {
        handleBlinkWithInput(pendingInput, true); // Pass true to skip intent
      }, 300);
    }
  }, [pendingInput, pendingTriggered, generating]);

  // Auto-generate for preselected tools
  useEffect(() => {
    if (preselectedTool && !autoStarted) {
      setAutoStarted(true);
      const toolName = toolDisplayNames[preselectedTool] || preselectedTool;
      setInput(`Create a ${toolName.toLowerCase()}`);
      // Auto-trigger generation after a brief delay
      setTimeout(() => {
        handleBlinkWithInput(`Create a ${toolName.toLowerCase()}`);
      }, 500);
    }
  }, [preselectedTool, autoStarted]);

  const handleBlinkWithInput = async (customInput, forceSkipIntent = false) => {
    const inputToUse = customInput || input.trim();
    if (!inputToUse) {
      setError(isToolMode ? 'Please describe the tool you want to create' : 'Please describe your business');
      return;
    }

    // First, detect intent (unless we're skipping it or in explicit tool mode)
    if (!skipIntentDetection && !forceSkipIntent && !isToolMode && !preselectedTool) {
      setDetectingIntent(true);
      setError(null);

      try {
        const intentResponse = await fetch(`${API_BASE}/api/orchestrate/detect-intent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input: inputToUse })
        });

        const intentData = await intentResponse.json();

        if (intentData.success) {
          // Handle based on intent type
          if (intentData.type === 'ambiguous' && onAmbiguousInput) {
            setDetectingIntent(false);
            onAmbiguousInput(intentData);
            return;
          }

          if (intentData.type === 'recommendations' && onToolRecommendations) {
            setDetectingIntent(false);
            onToolRecommendations(intentData.detectedIndustry);
            return;
          }
        }

        setDetectingIntent(false);
      } catch (intentError) {
        console.warn('Intent detection failed, proceeding with generation:', intentError);
        setDetectingIntent(false);
      }
    }

    setGenerating(true);
    setError(null);
    setProgress(isToolMode ? '🛠️ Building your tool...' : '🤖 AI is analyzing your request...');

    // Initialize step-based progress
    const steps = isToolMode ? TOOL_GENERATION_STEPS : BUSINESS_GENERATION_STEPS;
    setGenerationSteps(steps);
    setCurrentStepIndex(0);
    setStartTime(Date.now());
    setElapsed(0);

    // Start step simulation - advance steps every 3 seconds
    const stepInterval = setInterval(() => {
      setCurrentStepIndex(prev => {
        const next = prev + 1;
        if (next >= steps.length - 1) {
          // Stay at second-to-last step until done
          return steps.length - 2;
        }
        return next;
      });
    }, 3000);

    try {
      const response = await fetch(`${API_BASE}/api/orchestrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: inputToUse,
          deviceTarget: selectedDevice,
          includeCompanionApp: includeCompanionApp,
          // Pass explicit industry key to override AI detection (from SiteCustomizationScreen)
          industryKey: pendingIndustryKey || null
        })
      });

      // Stop step simulation
      clearInterval(stepInterval);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Generation failed');
      }

      // Jump to final step
      setCurrentStepIndex(steps.length - 1);

      // Show AI decisions (different for tools vs business)
      if (data.type === 'tool') {
        setAiDecisions({
          toolName: data.tool?.template,
          category: data.tool?.category,
          features: data.tool?.features?.join(', ')
        });
        // Tools auto-complete (no name collision issue)
        setProgress('✅ Complete!');
        setTimeout(() => {
          onComplete(data);
        }, 2000);
      } else {
        setAiDecisions(data.orchestrator?.decisions);
        setProgress('✅ Generation complete!');
        // Hold the result - user must confirm (especially if name taken)
        setPendingResult(data);
      }

    } catch (err) {
      clearInterval(stepInterval);
      setError(err.message || 'Something went wrong');
      setGenerating(false);
      setProgress(null);
      setGenerationSteps([]);
      setCurrentStepIndex(0);
      setStartTime(null);
    }
  };

  const handleBlink = () => handleBlinkWithInput(input.trim());

  return (
    <div style={orchestratorStyles.container}>
      <h1 style={orchestratorStyles.title}>
        {isToolMode ? '🛠️ Tool Builder' : '🧠 Orchestrator Mode'}
      </h1>
      <p style={orchestratorStyles.subtitle}>
        {isToolMode
          ? (preselectedTool
              ? `Creating your ${toolDisplayNames[preselectedTool] || preselectedTool}...`
              : 'Describe the tool you want to create. AI builds it instantly.')
          : 'Describe your business in one sentence. AI handles everything else.'
        }
      </p>

      {!generating && !preselectedTool && (
        <>
          <div style={orchestratorStyles.inputContainer}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isToolMode ? "Describe the tool you want to create..." : placeholder}
              style={orchestratorStyles.input}
              onKeyDown={(e) => e.key === 'Enter' && !detectingIntent && handleBlink()}
              autoFocus
              disabled={detectingIntent}
            />
          </div>

          {/* Device Target Selector - show for websites, not tools */}
          {!isToolMode && (
            <>
              <div style={orchestratorStyles.deviceSection}>
                {DEVICE_OPTIONS.map((device) => (
                  <button
                    key={device.id}
                    onClick={() => setSelectedDevice(device.id)}
                    style={{
                      ...orchestratorStyles.deviceButton,
                      ...(selectedDevice === device.id ? orchestratorStyles.deviceButtonActive : {})
                    }}
                    title={device.desc}
                  >
                    <span>{device.icon}</span>
                    <span>{device.name}</span>
                  </button>
                ))}
              </div>

              {/* Companion App Toggle */}
              <div
                style={{
                  ...orchestratorStyles.companionToggle,
                  ...(includeCompanionApp ? orchestratorStyles.companionToggleActive : {})
                }}
                onClick={() => setIncludeCompanionApp(!includeCompanionApp)}
              >
                <div
                  style={{
                    ...orchestratorStyles.companionCheckbox,
                    ...(includeCompanionApp ? orchestratorStyles.companionCheckboxActive : {})
                  }}
                >
                  {includeCompanionApp && <span style={{ color: 'white', fontSize: '14px' }}>✓</span>}
                </div>
                <div style={orchestratorStyles.companionText}>
                  <div style={orchestratorStyles.companionLabel}>
                    📱 Also generate companion app
                  </div>
                  <div style={orchestratorStyles.companionDesc}>
                    PWA mobile app at yoursite.be1st.app with loyalty, bookings & push notifications
                  </div>
                </div>
              </div>
            </>
          )}

          <button
            style={{
              ...orchestratorStyles.blinkButton,
              ...(input.trim().length < 3 || detectingIntent ? orchestratorStyles.blinkButtonDisabled : {})
            }}
            onClick={handleBlink}
            disabled={input.trim().length < 3 || detectingIntent}
          >
            {detectingIntent ? '🔍 Analyzing...' : isToolMode ? '🛠️ BUILD TOOL' : '⚡ BLINK'}
          </button>

          {/* Suggest Tools Button (only in tool mode) */}
          {isToolMode && onSuggestTools && (
            <>
              {!showSuggestInput ? (
                <button
                  style={{
                    ...orchestratorStyles.backButton,
                    marginTop: '16px',
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                    border: '1px solid #f59e0b',
                    color: '#92400e'
                  }}
                  onClick={() => setShowSuggestInput(true)}
                >
                  💡 Not sure? Get tool suggestions for your industry
                </button>
              ) : (
                <div style={{
                  marginTop: '16px',
                  padding: '20px',
                  background: '#fffbeb',
                  borderRadius: '12px',
                  border: '1px solid #fde68a',
                  width: '100%',
                  maxWidth: '500px'
                }}>
                  <p style={{ fontSize: '0.9rem', color: '#92400e', marginBottom: '12px' }}>
                    What's your profession or industry?
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={suggestInput}
                      onChange={(e) => setSuggestInput(e.target.value)}
                      placeholder="e.g., freelancer, restaurant, plumber..."
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        border: '2px solid #fde68a',
                        borderRadius: '8px',
                        fontSize: '1rem'
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && suggestInput.trim()) {
                          onSuggestTools(suggestInput.trim());
                        }
                      }}
                      autoFocus
                    />
                    <button
                      style={{
                        padding: '12px 20px',
                        background: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: suggestInput.trim() ? 'pointer' : 'not-allowed',
                        opacity: suggestInput.trim() ? 1 : 0.5
                      }}
                      onClick={() => suggestInput.trim() && onSuggestTools(suggestInput.trim())}
                      disabled={!suggestInput.trim()}
                    >
                      Get Suggestions
                    </button>
                  </div>
                  <button
                    style={{
                      marginTop: '12px',
                      padding: '6px 12px',
                      background: 'transparent',
                      border: 'none',
                      color: '#92400e',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                    onClick={() => {
                      setShowSuggestInput(false);
                      setSuggestInput('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </>
          )}

          <button style={orchestratorStyles.backButton} onClick={onBack}>
            ← Back to options
          </button>

          {error && (
            <div style={orchestratorStyles.error}>{error}</div>
          )}
        </>
      )}

      {generating && (
        <div style={orchestratorStyles.progressContainer}>
          {/* Step list */}
          {generationSteps.length > 0 && !aiDecisions && (
            <>
              <div style={orchestratorStyles.stepList}>
                {generationSteps.map((step, idx) => (
                  <div
                    key={step.id}
                    style={{
                      ...orchestratorStyles.stepItem,
                      opacity: idx <= currentStepIndex ? 1 : 0.4,
                      background: idx === currentStepIndex ? 'rgba(102, 126, 234, 0.1)' : 'white',
                      borderLeft: idx === currentStepIndex ? '3px solid #667eea' : '3px solid transparent'
                    }}
                  >
                    <span style={orchestratorStyles.stepIcon}>
                      {idx < currentStepIndex ? '✓' : step.icon}
                    </span>
                    <span style={{
                      ...orchestratorStyles.stepLabel,
                      color: idx < currentStepIndex ? '#22c55e' : idx === currentStepIndex ? '#1a1a2e' : '#888'
                    }}>
                      {step.label}
                    </span>
                    {idx === currentStepIndex && (
                      <span style={orchestratorStyles.activeDot} />
                    )}
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div style={orchestratorStyles.progressBar}>
                <div style={{
                  ...orchestratorStyles.progressFill,
                  width: `${Math.min(((currentStepIndex + 1) / generationSteps.length) * 100, 100)}%`
                }} />
              </div>

              {/* Time display */}
              <div style={orchestratorStyles.timeRow}>
                <span>Elapsed: {formatTime(elapsed)}</span>
                <span style={{ color: '#667eea' }}>
                  {currentStepIndex < generationSteps.length - 1 ? 'Building your site...' : 'Almost done!'}
                </span>
              </div>
            </>
          )}

          {/* Show completion message and decisions */}
          {aiDecisions && (
            <>
              <div style={orchestratorStyles.progressText}>{progress}</div>
              <div style={orchestratorStyles.decisionsGrid}>
                {/* Tool-specific decisions */}
                {aiDecisions.toolName && (
                  <>
                    <div style={orchestratorStyles.decisionItem}>
                      <div style={orchestratorStyles.decisionLabel}>Tool Type</div>
                      <div style={orchestratorStyles.decisionValue}>{aiDecisions.toolName}</div>
                    </div>
                    <div style={orchestratorStyles.decisionItem}>
                      <div style={orchestratorStyles.decisionLabel}>Category</div>
                      <div style={orchestratorStyles.decisionValue}>{aiDecisions.category}</div>
                    </div>
                    {aiDecisions.features && (
                      <div style={{...orchestratorStyles.decisionItem, gridColumn: '1 / -1'}}>
                        <div style={orchestratorStyles.decisionLabel}>Features</div>
                        <div style={orchestratorStyles.decisionValue}>{aiDecisions.features}</div>
                      </div>
                    )}
                  </>
                )}

                {/* Business-specific decisions */}
                {aiDecisions.businessName && (
                  <>
                    <div style={orchestratorStyles.decisionItem}>
                      <div style={orchestratorStyles.decisionLabel}>Business Name</div>
                      <div style={{...orchestratorStyles.decisionValue, display: 'flex', alignItems: 'center', gap: '8px'}}>
                        {aiDecisions.businessName}
                        {nameAvailability && (
                          nameAvailability.available
                            ? <span style={{ color: '#10b981', fontSize: '14px' }}>✓ Available</span>
                            : <span style={{ color: '#ef4444', fontSize: '14px' }}>✗ Already exists</span>
                        )}
                      </div>
                    </div>
                    <div style={orchestratorStyles.decisionItem}>
                      <div style={orchestratorStyles.decisionLabel}>Industry</div>
                      <div style={orchestratorStyles.decisionValue}>{aiDecisions.industryName}</div>
                    </div>
                    <div style={orchestratorStyles.decisionItem}>
                      <div style={orchestratorStyles.decisionLabel}>Location</div>
                      <div style={orchestratorStyles.decisionValue}>{aiDecisions.location || 'Not specified'}</div>
                    </div>
                    <div style={orchestratorStyles.decisionItem}>
                      <div style={orchestratorStyles.decisionLabel}>Pages</div>
                      <div style={orchestratorStyles.decisionValue}>{aiDecisions.pages?.length || 0} pages</div>
                    </div>
                    <div style={orchestratorStyles.decisionItem}>
                      <div style={orchestratorStyles.decisionLabel}>Modules</div>
                      <div style={orchestratorStyles.decisionValue}>{aiDecisions.modules?.length || 0} modules</div>
                    </div>
                    {aiDecisions.adminTier && (
                      <div style={orchestratorStyles.decisionItem}>
                        <div style={orchestratorStyles.decisionLabel}>Admin Dashboard</div>
                        <div style={orchestratorStyles.decisionValue}>
                          {aiDecisions.adminTier.charAt(0).toUpperCase() + aiDecisions.adminTier.slice(1)}
                          {aiDecisions.adminModuleCount ? ` (${aiDecisions.adminModuleCount} modules)` : ''}
                        </div>
                    </div>
                  )}
                  {aiDecisions.colors && (
                    <div style={orchestratorStyles.decisionItem}>
                      <div style={orchestratorStyles.decisionLabel}>Colors</div>
                      <div style={orchestratorStyles.colorPalette}>
                        <div style={{...orchestratorStyles.colorSwatch, background: aiDecisions.colors.primary}} title="Primary" />
                        <div style={{...orchestratorStyles.colorSwatch, background: aiDecisions.colors.accent}} title="Accent" />
                      </div>
                    </div>
                  )}
                  {aiDecisions.tagline && (
                    <div style={{...orchestratorStyles.decisionItem, gridColumn: '1 / -1'}}>
                      <div style={orchestratorStyles.decisionLabel}>Tagline</div>
                      <div style={orchestratorStyles.decisionValue}>"{aiDecisions.tagline}"</div>
                    </div>
                  )}
                  <div style={orchestratorStyles.decisionItem}>
                    <div style={orchestratorStyles.decisionLabel}>Confidence</div>
                    <div style={orchestratorStyles.decisionValue}>
                      {aiDecisions.confidence === 'high' ? '🟢 High' :
                       aiDecisions.confidence === 'medium' ? '🟡 Medium' : '🟠 Low'}
                    </div>
                  </div>
                  {includeCompanionApp && (
                    <div style={{...orchestratorStyles.decisionItem, background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)'}}>
                      <div style={orchestratorStyles.decisionLabel}>Companion App</div>
                      <div style={orchestratorStyles.decisionValue}>📱 Will deploy to .be1st.app</div>
                    </div>
                  )}
                </>
              )}
              </div>

              {/* Launch / Confirmation Section */}
              {pendingResult && (
                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                  {/* Name collision - block and require different name */}
                  {nameAvailability && !nameAvailability.available && (
                    <div style={{
                      padding: '20px',
                      background: '#fef2f2',
                      border: '2px solid #fecaca',
                      borderRadius: '12px',
                      marginBottom: '16px'
                    }}>
                      <p style={{ color: '#dc2626', fontWeight: '700', fontSize: '1.1rem', marginBottom: '12px' }}>
                        This name is already taken
                      </p>
                      <p style={{ color: '#7f1d1d', fontSize: '0.95rem', marginBottom: '16px' }}>
                        Please choose a different name for your business:
                      </p>
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {nameAvailability.suggestions?.map(s => (
                          <button
                            key={s}
                            onClick={() => {
                              setInput(s);
                              setGenerating(false);
                              setAiDecisions(null);
                              setPendingResult(null);
                              setNameAvailability(null);
                              setProgress(null);
                            }}
                            style={{
                              padding: '10px 20px',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              border: 'none',
                              borderRadius: '8px',
                              color: 'white',
                              fontWeight: '600',
                              cursor: 'pointer',
                              fontSize: '0.95rem'
                            }}
                          >
                            Try "{s}"
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => {
                          setGenerating(false);
                          setAiDecisions(null);
                          setPendingResult(null);
                          setNameAvailability(null);
                          setProgress(null);
                        }}
                        style={{
                          marginTop: '16px',
                          padding: '8px 16px',
                          background: 'transparent',
                          border: '1px solid #dc2626',
                          borderRadius: '6px',
                          color: '#dc2626',
                          cursor: 'pointer',
                          fontSize: '0.9rem'
                        }}
                      >
                        Enter a different name
                      </button>
                    </div>
                  )}

                  {/* Launch button - only if name is available */}
                  {nameAvailability?.available && (
                    <button
                      onClick={() => onComplete(pendingResult)}
                      style={{
                        ...orchestratorStyles.blinkButton,
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
                      }}
                    >
                      🚀 Launch Site
                    </button>
                  )}

                  {/* Loading state while checking */}
                  {!nameAvailability && (
                    <div style={{ color: '#666' }}>Checking name availability...</div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
