/**
 * Test Generator Component
 *
 * Automated testing system for rapid generation testing.
 * Provides one-click test generation with pre-configured presets.
 *
 * Keyboard shortcuts:
 * - Ctrl+Shift+T: Open/close test panel
 * - Ctrl+1: Run minimal-pizza test
 * - Ctrl+2: Run minimal-salon test
 * - Ctrl+3: Run full-luxury-pizza test
 * - Ctrl+4: Run full-ecommerce test
 * - Ctrl+5: Run full-saas test
 */

import React, { useState, useEffect, useCallback } from 'react';

// Test presets aligned with TIER SYSTEM (L1-L4)
// All L1-L4 tests use DETERMINISTIC path (/api/assemble) - no AI detection needed
const testCategories = {
  'L1 - Landing Pages': ['pizza-L1', 'salon-L1', 'saas-L1', 'fitness-L1'],
  'L2 - Brochure Sites': ['pizza-L2', 'salon-L2', 'restaurant-L2', 'agency-L2'],
  'L3 - With Auth': ['pizza-L3', 'ecommerce-L3', 'fitness-L3', 'saas-L3'],
  'L4 - Full Platform': ['pizza-L4', 'ecommerce-L4', 'saas-L4', 'restaurant-L4'],
  'Assemble Tests': ['quickstart-L1', 'assemble-L2', 'assemble-L4'],
  'AI Detection': ['orchestrate-pizza', 'orchestrate-saas']
};

const presetInfo = {
  // L1 - Landing Pages (1 page, no auth) - DETERMINISTIC
  'pizza-L1': { name: 'Pizza Landing', tier: 'L1', mode: 'assemble', icon: '🍕', pages: 1 },
  'salon-L1': { name: 'Salon Landing', tier: 'L1', mode: 'assemble', icon: '💇', pages: 1 },
  'saas-L1': { name: 'SaaS Landing', tier: 'L1', mode: 'assemble', icon: '💻', pages: 1 },
  'fitness-L1': { name: 'Fitness Landing', tier: 'L1', mode: 'assemble', icon: '💪', pages: 1 },

  // L2 - Brochure Sites (5-7 pages, no auth) - DETERMINISTIC
  'pizza-L2': { name: 'Pizza Brochure', tier: 'L2', mode: 'assemble', icon: '🍕', pages: 5 },
  'salon-L2': { name: 'Salon Brochure', tier: 'L2', mode: 'assemble', icon: '💇', pages: 6 },
  'restaurant-L2': { name: 'Restaurant Brochure', tier: 'L2', mode: 'assemble', icon: '🍽️', pages: 6 },
  'agency-L2': { name: 'Agency Brochure', tier: 'L2', mode: 'assemble', icon: '🏢', pages: 6 },

  // L3 - With Auth (8-10 pages, user accounts) - DETERMINISTIC
  'pizza-L3': { name: 'Pizza + Auth', tier: 'L3', mode: 'assemble', icon: '🍕', pages: 10 },
  'ecommerce-L3': { name: 'Ecommerce + Auth', tier: 'L3', mode: 'assemble', icon: '🛒', pages: 10 },
  'fitness-L3': { name: 'Fitness + Auth', tier: 'L3', mode: 'assemble', icon: '💪', pages: 10 },
  'saas-L3': { name: 'SaaS + Auth', tier: 'L3', mode: 'assemble', icon: '📊', pages: 10 },

  // L4 - Full Platform (12+ pages, everything) - DETERMINISTIC
  'pizza-L4': { name: 'Pizza Platform', tier: 'L4', mode: 'assemble', icon: '🍕', pages: 16 },
  'ecommerce-L4': { name: 'Ecommerce Platform', tier: 'L4', mode: 'assemble', icon: '🛍️', pages: 16 },
  'saas-L4': { name: 'SaaS Platform', tier: 'L4', mode: 'assemble', icon: '📊', pages: 15 },
  'restaurant-L4': { name: 'Restaurant Platform', tier: 'L4', mode: 'assemble', icon: '🍽️', pages: 16 },

  // Assemble Tests (direct path testing)
  'quickstart-L1': { name: 'Quick Start', tier: 'L1', mode: 'assemble', icon: '⚡', pages: 1 },
  'assemble-L2': { name: 'Assemble L2', tier: 'L2', mode: 'assemble', icon: '📋', pages: 6 },
  'assemble-L4': { name: 'Assemble L4', tier: 'L4', mode: 'assemble', icon: '📋', pages: 15 },

  // AI Detection Tests (use orchestrator - tests AI inference)
  'orchestrate-pizza': { name: 'AI: Pizza', tier: '?', mode: 'orchestrate', icon: '🤖', pages: '?' },
  'orchestrate-saas': { name: 'AI: SaaS', tier: '?', mode: 'orchestrate', icon: '🤖', pages: '?' }
};

// Tier descriptions for UI
const tierDescriptions = {
  'L1': '1 page, no auth',
  'L2': '5-7 pages, no auth',
  'L3': '8-10 pages, with auth',
  'L4': '12+ pages, full platform'
};

const keyboardShortcuts = {
  'ctrl+1': 'pizza-L1',
  'ctrl+2': 'pizza-L2',
  'ctrl+3': 'pizza-L3',
  'ctrl+4': 'pizza-L4',
  'ctrl+5': 'saas-L4'
};

export function TestGenerator({ isOpen, onClose, onRunTest }) {
  const [options, setOptions] = useState({
    autoGenerate: true,
    deployAfter: false,
    deleteAfter: false
  });
  const [lastResult, setLastResult] = useState(null);
  const [runningTest, setRunningTest] = useState(null);
  const [testHistory, setTestHistory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('L1 - Landing Pages');
  const [batchMode, setBatchMode] = useState(false);
  const [batchQueue, setBatchQueue] = useState([]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Shift+T to toggle panel
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
        return;
      }

      // Ctrl+1-5 for quick tests
      if (e.ctrlKey && !e.shiftKey && !e.altKey) {
        const key = `ctrl+${e.key}`;
        const preset = keyboardShortcuts[key];
        if (preset) {
          e.preventDefault();
          runTest(preset);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Run a test
  const runTest = useCallback(async (presetId) => {
    if (runningTest) return;

    setRunningTest(presetId);
    const startTime = Date.now();

    try {
      const response = await fetch('/api/test-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preset: presetId,
          options: {
            deploy: options.deployAfter,
            cleanup: options.deleteAfter
          }
        })
      });

      const data = await response.json();
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);

      const result = {
        preset: presetId,
        presetName: presetInfo[presetId]?.name || presetId,
        success: data.success,
        duration,
        timestamp: new Date().toISOString(),
        pages: data.result?.pages?.length || 0,
        modules: data.result?.moduleCount || 0,
        cost: data.result?.cost || 0,
        error: data.error,
        projectPath: data.result?.projectPath
      };

      setLastResult(result);
      setTestHistory(prev => [result, ...prev].slice(0, 20));

      // If batch mode, continue to next
      if (batchQueue.length > 0) {
        const next = batchQueue[0];
        setBatchQueue(prev => prev.slice(1));
        setTimeout(() => runTest(next), 1000);
      }

      // Call parent callback if provided
      if (onRunTest) {
        onRunTest(result);
      }

    } catch (err) {
      const result = {
        preset: presetId,
        presetName: presetInfo[presetId]?.name || presetId,
        success: false,
        duration: ((Date.now() - startTime) / 1000).toFixed(1),
        timestamp: new Date().toISOString(),
        error: err.message
      };
      setLastResult(result);
      setTestHistory(prev => [result, ...prev].slice(0, 20));
    } finally {
      setRunningTest(null);
    }
  }, [runningTest, options, batchQueue, onRunTest]);

  // Run batch tests
  const runBatchTests = (presets) => {
    if (presets.length === 0) return;
    setBatchQueue(presets.slice(1));
    runTest(presets[0]);
  };

  // Run all tests in a category
  const runCategoryTests = (category) => {
    const presets = testCategories[category] || [];
    runBatchTests(presets);
  };

  if (!isOpen) return null;

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      backdropFilter: 'blur(4px)'
    },
    panel: {
      background: 'linear-gradient(135deg, rgba(20, 20, 35, 0.98), rgba(30, 30, 50, 0.98))',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      borderRadius: '16px',
      width: '600px',
      maxHeight: '85vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
    },
    header: {
      padding: '20px 24px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    title: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    closeBtn: {
      background: 'transparent',
      border: 'none',
      color: '#888',
      fontSize: '20px',
      cursor: 'pointer',
      padding: '4px 8px',
      borderRadius: '6px'
    },
    body: {
      padding: '20px 24px',
      overflowY: 'auto',
      flex: 1
    },
    section: {
      marginBottom: '20px'
    },
    sectionTitle: {
      fontSize: '12px',
      fontWeight: '700',
      color: '#888',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginBottom: '12px'
    },
    categoryTabs: {
      display: 'flex',
      gap: '8px',
      marginBottom: '16px',
      flexWrap: 'wrap'
    },
    categoryTab: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '8px',
      padding: '8px 14px',
      color: '#aaa',
      fontSize: '12px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    categoryTabActive: {
      background: 'rgba(102, 126, 234, 0.2)',
      borderColor: 'rgba(102, 126, 234, 0.5)',
      color: '#fff'
    },
    testGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '10px'
    },
    testBtn: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '10px',
      padding: '14px 12px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      textAlign: 'center',
      position: 'relative'
    },
    testBtnRunning: {
      background: 'rgba(234, 179, 8, 0.15)',
      borderColor: 'rgba(234, 179, 8, 0.5)'
    },
    testIcon: {
      fontSize: '24px',
      marginBottom: '6px'
    },
    testName: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#fff',
      marginBottom: '4px'
    },
    testMeta: {
      fontSize: '10px',
      color: '#666'
    },
    tierBadge: {
      position: 'absolute',
      top: '6px',
      right: '6px',
      fontSize: '9px',
      fontWeight: '700',
      padding: '2px 6px',
      borderRadius: '4px'
    },
    tierBadgeL1: {
      background: 'rgba(34, 197, 94, 0.2)',
      color: '#22c55e'
    },
    tierBadgeL2: {
      background: 'rgba(59, 130, 246, 0.2)',
      color: '#3b82f6'
    },
    tierBadgeL3: {
      background: 'rgba(234, 179, 8, 0.2)',
      color: '#eab308'
    },
    tierBadgeL4: {
      background: 'rgba(239, 68, 68, 0.2)',
      color: '#ef4444'
    },
    optionsRow: {
      display: 'flex',
      gap: '16px',
      flexWrap: 'wrap'
    },
    optionLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '13px',
      color: '#aaa',
      cursor: 'pointer'
    },
    checkbox: {
      width: '16px',
      height: '16px',
      accentColor: '#667eea'
    },
    resultBox: {
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '10px',
      padding: '14px'
    },
    resultHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px'
    },
    resultTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#fff'
    },
    resultStatus: {
      fontSize: '12px',
      fontWeight: '600',
      padding: '3px 10px',
      borderRadius: '6px'
    },
    resultSuccess: {
      background: 'rgba(34, 197, 94, 0.2)',
      color: '#22c55e'
    },
    resultFail: {
      background: 'rgba(239, 68, 68, 0.2)',
      color: '#ef4444'
    },
    resultStats: {
      display: 'flex',
      gap: '16px',
      fontSize: '12px',
      color: '#888'
    },
    resultStat: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    shortcutHint: {
      fontSize: '10px',
      color: '#555',
      marginTop: '8px',
      textAlign: 'center'
    },
    batchBtn: {
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      border: 'none',
      borderRadius: '8px',
      padding: '10px 16px',
      color: '#fff',
      fontSize: '12px',
      fontWeight: '600',
      cursor: 'pointer',
      marginLeft: 'auto'
    },
    historyList: {
      maxHeight: '150px',
      overflowY: 'auto'
    },
    historyItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 0',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      fontSize: '12px'
    },
    historyName: {
      color: '#fff',
      fontWeight: '500'
    },
    historyMeta: {
      color: '#666'
    }
  };

  const getTierBadgeStyle = (tier) => {
    const tierStyles = {
      'L1': styles.tierBadgeL1,
      'L2': styles.tierBadgeL2,
      'L3': styles.tierBadgeL3,
      'L4': styles.tierBadgeL4
    };
    return { ...styles.tierBadge, ...(tierStyles[tier] || styles.tierBadgeL1) };
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.panel} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.title}>
            <span>🧪</span> Test Generator
            {runningTest && <span style={{ fontSize: '12px', color: '#eab308' }}>Running...</span>}
          </div>
          <button
            style={styles.closeBtn}
            onClick={onClose}
            onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#888'}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={styles.body}>
          {/* Category Tabs */}
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Test Categories</div>
            <div style={styles.categoryTabs}>
              {Object.keys(testCategories).map(category => (
                <button
                  key={category}
                  style={{
                    ...styles.categoryTab,
                    ...(selectedCategory === category ? styles.categoryTabActive : {})
                  }}
                  onClick={() => setSelectedCategory(category)}
                  onMouseEnter={(e) => {
                    if (selectedCategory !== category) {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCategory !== category) {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    }
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Test Grid */}
          <div style={styles.section}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={styles.sectionTitle}>One-Click Tests</div>
              <button
                style={styles.batchBtn}
                onClick={() => runCategoryTests(selectedCategory)}
                disabled={runningTest}
              >
                Run All {selectedCategory}
              </button>
            </div>
            <div style={styles.testGrid}>
              {testCategories[selectedCategory]?.map(presetId => {
                const info = presetInfo[presetId] || { name: presetId, level: 1, icon: '📦' };
                const isRunning = runningTest === presetId;

                return (
                  <button
                    key={presetId}
                    style={{
                      ...styles.testBtn,
                      ...(isRunning ? styles.testBtnRunning : {})
                    }}
                    onClick={() => runTest(presetId)}
                    disabled={runningTest}
                    onMouseEnter={(e) => {
                      if (!runningTest) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isRunning) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      }
                    }}
                  >
                    <div style={getTierBadgeStyle(info.tier)}>{info.tier}</div>
                    <div style={styles.testIcon}>{isRunning ? '⏳' : info.icon}</div>
                    <div style={styles.testName}>{info.name}</div>
                    <div style={styles.testMeta}>{info.pages} pg | {info.mode}</div>
                  </button>
                );
              })}
            </div>
            <div style={styles.shortcutHint}>
              Ctrl+1 (L1) | Ctrl+2 (L2) | Ctrl+3 (L3) | Ctrl+4 (L4) | Ctrl+5 (SaaS-L4)
            </div>
          </div>

          {/* Options */}
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Options</div>
            <div style={styles.optionsRow}>
              <label style={styles.optionLabel}>
                <input
                  type="checkbox"
                  style={styles.checkbox}
                  checked={options.autoGenerate}
                  onChange={(e) => setOptions(prev => ({ ...prev, autoGenerate: e.target.checked }))}
                />
                Auto-generate (skip confirmation)
              </label>
              <label style={styles.optionLabel}>
                <input
                  type="checkbox"
                  style={styles.checkbox}
                  checked={options.deployAfter}
                  onChange={(e) => setOptions(prev => ({ ...prev, deployAfter: e.target.checked }))}
                />
                Deploy after generation
              </label>
              <label style={styles.optionLabel}>
                <input
                  type="checkbox"
                  style={styles.checkbox}
                  checked={options.deleteAfter}
                  onChange={(e) => setOptions(prev => ({ ...prev, deleteAfter: e.target.checked }))}
                />
                Delete after test (cleanup)
              </label>
            </div>
          </div>

          {/* Last Result */}
          {lastResult && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>Last Test Result</div>
              <div style={styles.resultBox}>
                <div style={styles.resultHeader}>
                  <div style={styles.resultTitle}>{lastResult.presetName}</div>
                  <div style={{
                    ...styles.resultStatus,
                    ...(lastResult.success ? styles.resultSuccess : styles.resultFail)
                  }}>
                    {lastResult.success ? '✓ Success' : '✕ Failed'}
                  </div>
                </div>
                <div style={styles.resultStats}>
                  <div style={styles.resultStat}>⏱️ {lastResult.duration}s</div>
                  {lastResult.pages > 0 && <div style={styles.resultStat}>📄 {lastResult.pages} pages</div>}
                  {lastResult.modules > 0 && <div style={styles.resultStat}>📦 {lastResult.modules} modules</div>}
                  {lastResult.cost > 0 && <div style={styles.resultStat}>💰 ${lastResult.cost.toFixed(2)}</div>}
                </div>
                {lastResult.error && (
                  <div style={{ marginTop: '8px', fontSize: '11px', color: '#ef4444' }}>
                    Error: {lastResult.error}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Test History */}
          {testHistory.length > 1 && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>Recent Tests ({testHistory.length})</div>
              <div style={styles.historyList}>
                {testHistory.slice(1, 10).map((result, idx) => (
                  <div key={idx} style={styles.historyItem}>
                    <span style={styles.historyName}>
                      {result.success ? '✓' : '✕'} {result.presetName}
                    </span>
                    <span style={styles.historyMeta}>
                      {result.duration}s | {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TestGenerator;
