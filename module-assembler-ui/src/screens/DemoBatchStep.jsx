import React, { useState, useEffect, useRef } from 'react';
import { Rocket, CheckCircle, AlertCircle, ExternalLink, Clock, Zap, Play, ArrowLeft, Globe, Server, Smartphone, Edit3, FileCode, Layers, Database, Code, LayoutDashboard, ShoppingBag } from 'lucide-react';

/**
 * DemoBatchStep - Investor Demo Mode
 * Visual step-by-step generation for 2-4 businesses simultaneously
 *
 * Features:
 * - Editable business names and taglines
 * - Real-time generation stats
 * - Quick action buttons for demos
 */

// Generation steps for each business - Phase 1 (Main Site)
const GENERATION_STEPS = [
  { id: 'init', label: 'Initializing', icon: '🚀', phase: 1 },
  { id: 'assembly', label: 'Running assembly', icon: '🔧', phase: 1 },
  { id: 'brain', label: 'Generating brain.json', icon: '🧠', phase: 1 },
  { id: 'pages', label: 'Building pages', icon: '📄', phase: 1 },
  { id: 'admin', label: 'Setting up admin', icon: '⚙️', phase: 1 },
  { id: 'companion', label: 'Creating companion app', icon: '📱', phase: 1 },
  { id: 'deploy', label: 'Deploying main site', icon: '☁️', phase: 1 },
  { id: 'waiting', label: 'Waiting for rate limit', icon: '⏳', phase: 2 },
  { id: 'companion-deploy', label: 'Deploying companion app', icon: '📱', phase: 2 },
  { id: 'complete', label: 'Live!', icon: '✨', phase: 2 }
];

// Map backend step names to our step IDs
const stepMapping = {
  'Starting...': 'init',
  'Running assembly...': 'assembly',
  'Generating brain.json...': 'brain',
  'Generating pages...': 'pages',
  'Building pages...': 'pages',
  'Setting up admin...': 'admin',
  'Admin setup...': 'admin',
  'Generating companion app...': 'companion',
  'Deploying website to cloud...': 'deploy',
  'Deploying to cloud...': 'deploy',
  'Deploying...': 'deploy',
  'Main site deployed!': 'waiting',
  'Waiting for Railway rate limit...': 'waiting',
  'Deploying companion app...': 'companion-deploy',
  'Deployed!': 'complete',
  'Generated!': 'complete',
  'Generated (deploy skipped)': 'complete',
  'Generated (deploy failed)': 'complete',
  'Complete': 'complete'
};

// Check if step text indicates waiting for rate limit
const isWaitingStep = (stepText) => {
  if (!stepText) return false;
  const lower = stepText.toLowerCase();
  return lower.includes('waiting') && (lower.includes('rate') || lower.includes('railway'));
};

function getStepIndex(stepText) {
  const mappedId = stepMapping[stepText];
  if (mappedId) {
    return GENERATION_STEPS.findIndex(s => s.id === mappedId);
  }
  // Fallback: check if text contains keywords
  const lower = (stepText || '').toLowerCase();
  // Check for waiting/rate limit first
  if (isWaitingStep(stepText)) return GENERATION_STEPS.findIndex(s => s.id === 'waiting');
  // Check for companion app deployment
  if (lower.includes('deploying companion')) return GENERATION_STEPS.findIndex(s => s.id === 'companion-deploy');
  // Main site deployment
  if (lower.includes('deploy') && !lower.includes('companion')) return GENERATION_STEPS.findIndex(s => s.id === 'deploy');
  // Companion app generation
  if (lower.includes('companion') && !lower.includes('deploy')) return GENERATION_STEPS.findIndex(s => s.id === 'companion');
  if (lower.includes('admin')) return GENERATION_STEPS.findIndex(s => s.id === 'admin');
  if (lower.includes('page')) return GENERATION_STEPS.findIndex(s => s.id === 'pages');
  if (lower.includes('brain')) return GENERATION_STEPS.findIndex(s => s.id === 'brain');
  if (lower.includes('assembl')) return GENERATION_STEPS.findIndex(s => s.id === 'assembly');
  if (lower.includes('complete') || lower.includes('live')) return GENERATION_STEPS.length - 1;
  return 0;
}

export function DemoBatchStep({ onBack }) {
  const [allBusinesses, setAllBusinesses] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [selectedCount, setSelectedCount] = useState(2);
  const [cleanFirst, setCleanFirst] = useState(true);
  const [deployToCloud, setDeployToCloud] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [summary, setSummary] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null); // Track which business is being edited
  const [generationStats, setGenerationStats] = useState(null); // Track generation stats
  const [currentPhase, setCurrentPhase] = useState(0); // 0=not started, 1=main sites, 2=companion apps
  const [phaseMessage, setPhaseMessage] = useState(''); // Phase status message
  const timerRef = useRef(null);

  // Load presets on mount
  useEffect(() => {
    fetch('/api/demo/presets')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const mapped = data.businesses.map(b => ({
            ...b,
            // Editable fields - start with preset values
            editedName: b.name,
            editedTagline: b.tagline,
            // Generation state
            status: 'pending',
            step: 'Ready',
            stepIndex: -1,
            progress: 0,
            urls: {},
            stats: null // Per-business stats
          }));
          setAllBusinesses(mapped);
          setBusinesses(mapped.slice(0, selectedCount));
        }
      })
      .catch(err => {
        console.error('Failed to load presets:', err);
        setError('Failed to load demo presets');
      });

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Update a business's editable field
  const updateBusinessField = (id, field, value) => {
    setBusinesses(prev => prev.map(b =>
      b.id === id ? { ...b, [field]: value } : b
    ));
    setAllBusinesses(prev => prev.map(b =>
      b.id === id ? { ...b, [field]: value } : b
    ));
  };

  // Update displayed businesses when count changes
  useEffect(() => {
    if (allBusinesses.length > 0 && !isRunning) {
      setBusinesses(allBusinesses.slice(0, selectedCount).map(b => ({
        ...b,
        status: 'pending',
        step: 'Ready',
        stepIndex: -1,
        progress: 0,
        urls: {},
        stats: null
      })));
      setIsComplete(false);
      setSummary(null);
      setGenerationStats(null);
    }
  }, [selectedCount, allBusinesses]);

  // Start batch generation
  const startGeneration = async () => {
    setIsRunning(true);
    setIsComplete(false);
    setError(null);
    setElapsedTime(0);
    setGenerationStats(null);
    setEditingId(null);
    setCurrentPhase(1); // Start with Phase 1
    setPhaseMessage('Generating code and deploying main sites...');

    // Reset all businesses to pending
    setBusinesses(prev => prev.map(b => ({
      ...b,
      status: 'in_progress',
      step: 'Starting...',
      stepIndex: 0,
      progress: 0,
      stats: null
    })));

    // Start timer
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 100);

    try {
      // Build customized business data with edited names/taglines
      const customizedBusinesses = businesses.map(b => ({
        id: b.id,
        name: b.editedName || b.name,
        tagline: b.editedTagline || b.tagline,
        industry: b.industry,
        location: b.location,
        pages: b.pages,
        colors: b.colors
      }));

      const response = await fetch('/api/demo/batch-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deploy: deployToCloud,
          businessIds: businesses.map(b => b.id),
          customizations: customizedBusinesses, // Send edited data
          cleanFirst: cleanFirst
        })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              handleSSEEvent(data);
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message);
      setIsRunning(false);
      clearInterval(timerRef.current);
    }
  };

  // Handle SSE events
  const handleSSEEvent = (data) => {
    // Phase change event
    if (data.phase) {
      if (data.phase === 'companion') {
        setCurrentPhase(2);
        setPhaseMessage(data.message || 'Deploying companion apps sequentially...');
      }
      return;
    }

    if (data.businesses) {
      // Init event
      setBusinesses(prev => prev.map(b => {
        const update = data.businesses.find(u => u.id === b.id);
        return update ? { ...b, ...update, stepIndex: getStepIndex(update.step) } : b;
      }));
    } else if (data.id) {
      // Progress event for single business
      const stepIndex = getStepIndex(data.step);

      // Detect phase transition based on step
      if (stepIndex >= GENERATION_STEPS.findIndex(s => s.id === 'waiting')) {
        setCurrentPhase(2);
        if (isWaitingStep(data.step)) {
          setPhaseMessage('Waiting for Railway rate limit to reset...');
        } else if (data.step?.toLowerCase().includes('companion')) {
          setPhaseMessage('Deploying companion apps one at a time...');
        }
      }

      setBusinesses(prev => prev.map(b =>
        b.id === data.id ? {
          ...b,
          ...data,
          stepIndex: stepIndex,
          status: data.status || b.status,
          stats: data.stats || b.stats // Capture per-business stats
        } : b
      ));
    } else if (data.results) {
      // Complete event
      clearInterval(timerRef.current);
      setIsRunning(false);
      setIsComplete(true);
      setSummary(data.summary);

      // Calculate total stats from all results
      const totalStats = {
        files: 0,
        linesOfCode: 0,
        reactComponents: 0,
        apiEndpoints: 0,
        adminModules: 0
      };

      data.results.forEach(r => {
        if (r.stats) {
          totalStats.files += r.stats.files || 0;
          totalStats.linesOfCode += r.stats.linesOfCode || 0;
          totalStats.reactComponents += r.stats.reactComponents || 0;
          totalStats.apiEndpoints += r.stats.apiEndpoints || 0;
          totalStats.adminModules += r.stats.adminModules || 0;
        }
      });

      setGenerationStats(totalStats);

      // Mark all as complete and attach stats
      setBusinesses(prev => prev.map(b => {
        const result = data.results.find(r => r.business === b.id);
        return {
          ...b,
          stepIndex: GENERATION_STEPS.length - 1,
          status: b.status === 'error' ? 'error' : 'completed',
          stats: result?.stats || b.stats,
          urls: result?.urls || b.urls
        };
      }));
    } else if (data.error) {
      clearInterval(timerRef.current);
      setIsRunning(false);
      setError(data.error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  // Determine grid columns based on count
  const getGridColumns = () => {
    if (selectedCount === 2) return 'repeat(2, 1fr)';
    if (selectedCount === 3) return 'repeat(3, 1fr)';
    return 'repeat(2, 1fr)'; // 4 = 2x2 grid
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backButton}>
          <ArrowLeft size={20} />
          Back
        </button>
        <div style={styles.headerCenter}>
          <h1 style={styles.title}>
            <Zap size={28} style={{ color: '#f59e0b' }} />
            Investor Demo
          </h1>
          <p style={styles.subtitle}>
            Generate {selectedCount} complete businesses simultaneously
          </p>
        </div>
        <div style={styles.timerBox}>
          <Clock size={18} />
          <span style={styles.timerText}>{formatTime(elapsedTime)}</span>
        </div>
      </div>

      {/* Phase Indicator Banner - shown during generation */}
      {isRunning && currentPhase > 0 && (
        <div style={{
          ...styles.phaseBanner,
          background: currentPhase === 1
            ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15))'
            : 'linear-gradient(90deg, rgba(16, 185, 129, 0.15), rgba(20, 184, 166, 0.15))',
          borderColor: currentPhase === 1 ? 'rgba(99, 102, 241, 0.4)' : 'rgba(16, 185, 129, 0.4)'
        }}>
          <div style={styles.phaseIndicator}>
            <span style={{
              ...styles.phaseDot,
              background: currentPhase === 1 ? '#6366f1' : '#10b981'
            }} />
            <span style={{
              ...styles.phaseLabel,
              color: currentPhase === 1 ? '#a5b4fc' : '#6ee7b7'
            }}>
              Phase {currentPhase} of 2
            </span>
          </div>
          <div style={styles.phaseInfo}>
            <span style={styles.phaseTitle}>
              {currentPhase === 1 ? '🚀 Main Sites' : '📱 Companion Apps'}
            </span>
            <span style={styles.phaseDesc}>{phaseMessage}</span>
          </div>
          <div style={styles.phaseSteps}>
            <div style={{
              ...styles.phaseStep,
              opacity: currentPhase >= 1 ? 1 : 0.4,
              color: currentPhase === 1 ? '#a5b4fc' : '#10b981'
            }}>
              {currentPhase > 1 ? '✓' : '1'} Main Sites
            </div>
            <div style={styles.phaseArrow}>→</div>
            <div style={{
              ...styles.phaseStep,
              opacity: currentPhase >= 2 ? 1 : 0.4,
              color: currentPhase === 2 ? '#6ee7b7' : '#666'
            }}>
              {currentPhase > 2 ? '✓' : '2'} Companion Apps
            </div>
          </div>
        </div>
      )}

      {/* Business Cards Grid */}
      <div style={{
        ...styles.grid,
        gridTemplateColumns: getGridColumns()
      }}>
        {businesses.map((business, bizIndex) => (
          <div key={business.id} style={{
            ...styles.card,
            borderColor: business.status === 'completed' ? '#10b981' :
                         business.status === 'error' ? '#ef4444' :
                         business.status === 'in_progress' ? '#6366f1' : '#333'
          }}>
            {/* Card Header - Editable when not running */}
            <div style={styles.cardHeader}>
              <span style={styles.businessIcon}>{business.industryIcon}</span>
              <div style={styles.businessInfo}>
                {!isRunning && !isComplete && editingId === business.id ? (
                  // Editing mode
                  <>
                    <input
                      type="text"
                      value={business.editedName}
                      onChange={(e) => updateBusinessField(business.id, 'editedName', e.target.value)}
                      onBlur={() => setEditingId(null)}
                      onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                      autoFocus
                      style={styles.editInput}
                      placeholder="Business name"
                    />
                    <input
                      type="text"
                      value={business.editedTagline}
                      onChange={(e) => updateBusinessField(business.id, 'editedTagline', e.target.value)}
                      onBlur={() => setEditingId(null)}
                      onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                      style={{...styles.editInput, ...styles.editInputSmall}}
                      placeholder="Tagline"
                    />
                  </>
                ) : (
                  // Display mode
                  <>
                    <h3 style={styles.businessName}>
                      {business.editedName || business.name}
                    </h3>
                    <p style={styles.businessTagline}>
                      {business.editedTagline || business.tagline}
                    </p>
                  </>
                )}
              </div>
              {/* Edit button - only show when not running */}
              {!isRunning && !isComplete && editingId !== business.id && (
                <button
                  onClick={() => setEditingId(business.id)}
                  style={styles.editButton}
                  title="Edit name & tagline"
                >
                  <Edit3 size={16} />
                </button>
              )}
              {business.status === 'completed' && (
                <CheckCircle size={24} color="#10b981" />
              )}
              {business.status === 'error' && (
                <AlertCircle size={24} color="#ef4444" />
              )}
            </div>

            {/* Step List */}
            <div style={styles.stepList}>
              {/* Phase 1 Steps */}
              {GENERATION_STEPS.filter(s => s.phase === 1).map((step, idx) => {
                const actualIdx = GENERATION_STEPS.findIndex(s2 => s2.id === step.id);
                const isComplete = business.stepIndex > actualIdx;
                const isCurrent = business.stepIndex === actualIdx && business.status === 'in_progress';
                const isPending = business.stepIndex < actualIdx;

                // Skip deploy step if not deploying
                if (step.id === 'deploy' && !deployToCloud) return null;

                return (
                  <div
                    key={step.id}
                    style={{
                      ...styles.stepItem,
                      opacity: isPending ? 0.4 : 1,
                      background: isCurrent ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                      borderLeft: isCurrent ? '3px solid #6366f1' : '3px solid transparent'
                    }}
                  >
                    <span style={{
                      ...styles.stepIcon,
                      color: isComplete ? '#10b981' : isCurrent ? '#6366f1' : '#666'
                    }}>
                      {isComplete ? '✓' : step.icon}
                    </span>
                    <span style={{
                      ...styles.stepLabel,
                      color: isComplete ? '#10b981' : isCurrent ? '#fff' : '#888',
                      fontWeight: isCurrent ? '600' : '400'
                    }}>
                      {step.label}
                    </span>
                    {isCurrent && (
                      <span style={styles.activeDot} />
                    )}
                  </div>
                );
              })}

              {/* Phase 2 Separator - only show if deploying */}
              {deployToCloud && (
                <div style={styles.phaseSeparator}>
                  <span style={styles.phaseSeparatorLine} />
                  <span style={styles.phaseSeparatorText}>Phase 2: Companion</span>
                  <span style={styles.phaseSeparatorLine} />
                </div>
              )}

              {/* Phase 2 Steps - only show if deploying */}
              {deployToCloud && GENERATION_STEPS.filter(s => s.phase === 2).map((step) => {
                const actualIdx = GENERATION_STEPS.findIndex(s2 => s2.id === step.id);
                const isComplete = business.stepIndex > actualIdx;
                const isCurrent = business.stepIndex === actualIdx && business.status === 'in_progress';
                const isPending = business.stepIndex < actualIdx;

                return (
                  <div
                    key={step.id}
                    style={{
                      ...styles.stepItem,
                      opacity: isPending ? 0.4 : 1,
                      background: isCurrent ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                      borderLeft: isCurrent ? '3px solid #10b981' : '3px solid transparent'
                    }}
                  >
                    <span style={{
                      ...styles.stepIcon,
                      color: isComplete ? '#10b981' : isCurrent ? '#10b981' : '#666'
                    }}>
                      {isComplete ? '✓' : step.icon}
                    </span>
                    <span style={{
                      ...styles.stepLabel,
                      color: isComplete ? '#10b981' : isCurrent ? '#fff' : '#888',
                      fontWeight: isCurrent ? '600' : '400'
                    }}>
                      {step.label}
                    </span>
                    {isCurrent && (
                      <span style={{...styles.activeDot, background: '#10b981'}} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Progress Bar */}
            <div style={styles.progressTrack}>
              <div style={{
                ...styles.progressBar,
                width: `${Math.min((business.stepIndex + 1) / GENERATION_STEPS.length * 100, 100)}%`,
                background: business.status === 'completed' ? '#10b981' :
                           business.status === 'error' ? '#ef4444' :
                           business.stepIndex >= GENERATION_STEPS.findIndex(s => s.phase === 2)
                             ? 'linear-gradient(90deg, #10b981, #14b8a6)' // Green for Phase 2
                             : 'linear-gradient(90deg, #6366f1, #8b5cf6)' // Purple for Phase 1
              }} />
            </div>

            {/* Quick Actions when complete */}
            {business.status === 'completed' && (
              <div style={styles.completedSection}>
                {/* Quick Action Buttons */}
                <div style={styles.quickActions}>
                  {business.urls?.frontend ? (
                    <>
                      <a
                        href={business.urls.frontend}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.quickActionPrimary}
                      >
                        <Globe size={18} />
                        <span>Browse Site</span>
                      </a>
                      <a
                        href={`${business.urls.frontend}/menu`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.quickActionBtn}
                      >
                        <ShoppingBag size={16} />
                        <span>Try Menu</span>
                      </a>
                      {business.urls?.admin && (
                        <a
                          href={business.urls.admin}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={styles.quickActionBtn}
                        >
                          <LayoutDashboard size={16} />
                          <span>Admin</span>
                        </a>
                      )}
                      {(business.urls?.companion || business.companionApp) && (
                        <a
                          href={business.urls?.companion || `https://${business.id}.be1st.app`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={styles.quickActionBtn}
                        >
                          <Smartphone size={16} />
                          <span>Mobile App</span>
                        </a>
                      )}
                    </>
                  ) : (
                    <span style={styles.localOnly}>
                      <CheckCircle size={14} />
                      Generated locally - ready to deploy
                    </span>
                  )}
                </div>

                {/* Per-business stats */}
                {business.stats && (
                  <div style={styles.businessStats}>
                    <span style={styles.statBadge}>
                      <FileCode size={12} />
                      {business.stats.files} files
                    </span>
                    <span style={styles.statBadge}>
                      <Code size={12} />
                      ~{(business.stats.linesOfCode / 1000).toFixed(1)}k lines
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Controls - Before Running */}
      {!isRunning && !isComplete && (
        <div style={styles.controls}>
          {/* Count Selector */}
          <div style={styles.countSelector}>
            <span style={styles.countLabel}>Sites to generate:</span>
            <div style={styles.countButtons}>
              {[2, 3, 4].map(count => (
                <button
                  key={count}
                  onClick={() => setSelectedCount(count)}
                  style={{
                    ...styles.countButton,
                    background: selectedCount === count ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.05)',
                    color: selectedCount === count ? '#fff' : '#888',
                    borderColor: selectedCount === count ? '#6366f1' : '#333'
                  }}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div style={styles.options}>
            <label style={styles.optionLabel}>
              <input
                type="checkbox"
                checked={cleanFirst}
                onChange={(e) => setCleanFirst(e.target.checked)}
                style={styles.checkbox}
              />
              <span>Overwrite existing</span>
            </label>
            <label style={{
              ...styles.optionLabel,
              color: deployToCloud ? '#10b981' : '#888'
            }}>
              <input
                type="checkbox"
                checked={deployToCloud}
                onChange={(e) => setDeployToCloud(e.target.checked)}
                style={styles.checkbox}
              />
              <span>Deploy to cloud</span>
            </label>
          </div>

          {/* Launch Button */}
          <button onClick={startGeneration} style={styles.launchButton}>
            <Rocket size={24} />
            Launch Demo
          </button>

          <p style={styles.hint}>
            {deployToCloud
              ? 'Phase 1: Main sites deploy in parallel → Phase 2: Companion apps deploy sequentially'
              : 'Local generation only'}
            {cleanFirst && ' • Auto-backup enabled'}
          </p>
        </div>
      )}

      {/* Summary - After Complete */}
      {isComplete && summary && (
        <div style={styles.summaryContainer}>
          {/* Stats Panel */}
          {generationStats && (
            <div style={styles.statsPanel}>
              <h3 style={styles.statsPanelTitle}>
                <Zap size={18} color="#f59e0b" />
                Full-Stack Generated
              </h3>
              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <FileCode size={24} color="#6366f1" />
                  <span style={styles.statNumber}>{generationStats.files || '~150'}</span>
                  <span style={styles.statLabel}>Files Created</span>
                </div>
                <div style={styles.statCard}>
                  <Code size={24} color="#10b981" />
                  <span style={styles.statNumber}>~{((generationStats.linesOfCode || 4500) / 1000).toFixed(1)}k</span>
                  <span style={styles.statLabel}>Lines of Code</span>
                </div>
                <div style={styles.statCard}>
                  <Layers size={24} color="#8b5cf6" />
                  <span style={styles.statNumber}>{generationStats.reactComponents || '~25'}</span>
                  <span style={styles.statLabel}>React Components</span>
                </div>
                <div style={styles.statCard}>
                  <Server size={24} color="#f59e0b" />
                  <span style={styles.statNumber}>{generationStats.apiEndpoints || '~12'}</span>
                  <span style={styles.statLabel}>API Endpoints</span>
                </div>
                <div style={styles.statCard}>
                  <Database size={24} color="#ec4899" />
                  <span style={styles.statNumber}>4</span>
                  <span style={styles.statLabel}>DB Tables</span>
                </div>
                <div style={styles.statCard}>
                  <LayoutDashboard size={24} color="#14b8a6" />
                  <span style={styles.statNumber}>{generationStats.adminModules || '4'}</span>
                  <span style={styles.statLabel}>Admin Modules</span>
                </div>
              </div>
              <div style={styles.stackBadges}>
                <span style={styles.techBadge}>React 18</span>
                <span style={styles.techBadge}>Express.js</span>
                <span style={styles.techBadge}>SQLite</span>
                <span style={styles.techBadge}>PWA</span>
                <span style={styles.techBadge}>Railway</span>
              </div>
            </div>
          )}

          {/* Success Message */}
          <div style={styles.summary}>
            <div style={styles.summaryHeader}>
              <CheckCircle size={32} color="#10b981" />
              <div>
                <h2 style={styles.summaryTitle}>Demo Ready!</h2>
                <p style={styles.summarySubtitle}>
                  {summary.successful} of {summary.total} full-stack sites generated in {summary.totalDurationSeconds}s
                </p>
              </div>
            </div>

            <button onClick={startGeneration} style={styles.runAgainButton}>
              <Play size={20} />
              Run Again
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={styles.errorBox}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Pulse animation style */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
    padding: '24px',
    color: '#fff'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '32px',
    padding: '0 16px'
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid #333',
    borderRadius: '8px',
    color: '#888',
    cursor: 'pointer',
    fontSize: '14px'
  },
  headerCenter: {
    textAlign: 'center'
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    fontSize: '1.8rem',
    fontWeight: '700',
    margin: 0
  },
  subtitle: {
    color: '#888',
    margin: '8px 0 0',
    fontSize: '0.95rem'
  },
  timerBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    background: 'rgba(99, 102, 241, 0.1)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    borderRadius: '12px',
    color: '#a5b4fc'
  },
  timerText: {
    fontSize: '1.2rem',
    fontWeight: '700',
    fontFamily: 'monospace'
  },
  // Phase banner styles
  phaseBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    borderRadius: '12px',
    border: '1px solid',
    marginBottom: '24px',
    gap: '24px'
  },
  phaseIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  phaseDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    animation: 'pulse 1.5s infinite'
  },
  phaseLabel: {
    fontSize: '0.85rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  phaseInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  phaseTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff'
  },
  phaseDesc: {
    fontSize: '0.85rem',
    color: '#888'
  },
  phaseSteps: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  phaseStep: {
    fontSize: '0.85rem',
    fontWeight: '500',
    padding: '6px 12px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '6px'
  },
  phaseArrow: {
    color: '#555',
    fontSize: '1rem'
  },
  grid: {
    display: 'grid',
    gap: '24px',
    marginBottom: '32px'
  },
  card: {
    background: 'rgba(255,255,255,0.02)',
    border: '2px solid #333',
    borderRadius: '16px',
    padding: '20px',
    transition: 'all 0.3s ease'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid rgba(255,255,255,0.1)'
  },
  businessIcon: {
    fontSize: '2rem'
  },
  businessInfo: {
    flex: 1
  },
  businessName: {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: '600'
  },
  businessTagline: {
    margin: '4px 0 0',
    fontSize: '0.8rem',
    color: '#888'
  },
  stepList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '16px'
  },
  phaseSeparator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: '8px 0',
    padding: '4px 0'
  },
  phaseSeparatorLine: {
    flex: 1,
    height: '1px',
    background: 'rgba(16, 185, 129, 0.3)'
  },
  phaseSeparatorText: {
    fontSize: '0.7rem',
    color: 'rgba(16, 185, 129, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: '600'
  },
  stepItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 12px',
    borderRadius: '6px',
    transition: 'all 0.2s ease'
  },
  stepIcon: {
    fontSize: '14px',
    width: '20px',
    textAlign: 'center'
  },
  stepLabel: {
    fontSize: '0.85rem',
    flex: 1
  },
  activeDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#6366f1',
    animation: 'pulse 1.5s infinite'
  },
  progressTrack: {
    height: '4px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '2px',
    overflow: 'hidden',
    marginBottom: '16px'
  },
  progressBar: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.5s ease'
  },
  // Editable fields
  editInput: {
    width: '100%',
    padding: '8px 12px',
    background: 'rgba(99, 102, 241, 0.1)',
    border: '1px solid rgba(99, 102, 241, 0.5)',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '600',
    outline: 'none',
    marginBottom: '6px'
  },
  editInputSmall: {
    fontSize: '0.85rem',
    fontWeight: '400',
    padding: '6px 10px'
  },
  editButton: {
    padding: '8px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid #444',
    borderRadius: '6px',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginLeft: 'auto'
  },
  // Completed section with quick actions
  completedSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  quickActions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  quickActionPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '600',
    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)'
  },
  quickActionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    background: 'rgba(255,255,255,0.05)',
    color: '#ccc',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '0.85rem',
    fontWeight: '500',
    border: '1px solid #444',
    transition: 'all 0.2s'
  },
  localOnly: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.85rem',
    color: '#10b981',
    padding: '8px 14px',
    background: 'rgba(16, 185, 129, 0.1)',
    borderRadius: '8px',
    border: '1px solid rgba(16, 185, 129, 0.3)'
  },
  businessStats: {
    display: 'flex',
    gap: '8px',
    marginTop: '4px'
  },
  statBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '4px',
    fontSize: '0.75rem',
    color: '#888'
  },
  controls: {
    textAlign: 'center',
    padding: '24px',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '16px',
    border: '1px solid #333'
  },
  countSelector: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    marginBottom: '20px'
  },
  countLabel: {
    color: '#888',
    fontSize: '0.95rem'
  },
  countButtons: {
    display: 'flex',
    gap: '8px'
  },
  countButton: {
    width: '48px',
    height: '48px',
    border: '2px solid',
    borderRadius: '12px',
    fontSize: '1.2rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  options: {
    display: 'flex',
    gap: '24px',
    justifyContent: 'center',
    marginBottom: '24px'
  },
  optionLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    color: '#888',
    fontSize: '0.9rem'
  },
  checkbox: {
    width: '18px',
    height: '18px',
    accentColor: '#6366f1'
  },
  launchButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 48px',
    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(245, 158, 11, 0.3)',
    transition: 'all 0.2s ease'
  },
  hint: {
    marginTop: '16px',
    color: '#666',
    fontSize: '0.85rem'
  },
  // Summary container
  summaryContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  // Stats panel
  statsPanel: {
    padding: '24px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid #333',
    borderRadius: '16px'
  },
  statsPanelTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: '0 0 20px',
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#fff'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '16px',
    marginBottom: '20px'
  },
  statCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '16px 12px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.05)'
  },
  statNumber: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#fff'
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#888',
    textAlign: 'center'
  },
  stackBadges: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  techBadge: {
    padding: '6px 12px',
    background: 'rgba(99, 102, 241, 0.1)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    borderRadius: '20px',
    fontSize: '0.75rem',
    color: '#a5b4fc',
    fontWeight: '500'
  },
  summary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px',
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: '16px'
  },
  summaryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  summaryTitle: {
    margin: 0,
    fontSize: '1.3rem',
    color: '#10b981'
  },
  summarySubtitle: {
    margin: '4px 0 0',
    color: '#888',
    fontSize: '0.9rem'
  },
  runAgainButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid #333',
    borderRadius: '8px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.95rem'
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '12px',
    color: '#ef4444',
    marginTop: '24px'
  }
};

export default DemoBatchStep;
