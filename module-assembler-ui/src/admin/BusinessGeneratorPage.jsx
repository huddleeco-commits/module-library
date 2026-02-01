/**
 * Business Generator Page (Admin)
 *
 * Uses the same BusinessCreator component as production.
 * Set testMode=true for testing without AI API calls.
 */
import React, { useState } from 'react';
import BusinessCreator from '../components/BusinessCreator';

export default function BusinessGeneratorPage() {
  const [testMode, setTestMode] = useState(true); // Default to test mode in admin
  const [lastResult, setLastResult] = useState(null);

  return (
    <div style={styles.container}>
      {/* Mode Toggle */}
      <div style={styles.modeToggle}>
        <span style={styles.modeLabel}>Mode:</span>
        <button
          onClick={() => setTestMode(true)}
          style={{
            ...styles.modeBtn,
            ...(testMode ? styles.modeBtnActive : {})
          }}
        >
          Test Mode
        </button>
        <button
          onClick={() => setTestMode(false)}
          style={{
            ...styles.modeBtn,
            ...(!testMode ? styles.modeBtnActiveProduction : {})
          }}
        >
          Production
        </button>
      </div>

      {/* The Creator Component - Same for test and production */}
      <BusinessCreator
        testMode={testMode}
        onComplete={(result) => {
          setLastResult(result);
          console.log('Generation complete:', result);
        }}
      />

      {/* Last Result Panel (Admin only) */}
      {lastResult && (
        <div style={styles.resultPanel}>
          <h3>Last Generation Result</h3>
          <pre style={styles.resultJson}>
            {JSON.stringify(lastResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '24px'
  },
  modeToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
    padding: '16px',
    background: '#f3f4f6',
    borderRadius: '12px'
  },
  modeLabel: {
    fontWeight: '600',
    color: '#374151'
  },
  modeBtn: {
    padding: '8px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  modeBtnActive: {
    borderColor: '#f59e0b',
    background: '#fef3c7',
    color: '#92400e'
  },
  modeBtnActiveProduction: {
    borderColor: '#10b981',
    background: '#d1fae5',
    color: '#065f46'
  },
  resultPanel: {
    marginTop: '40px',
    padding: '24px',
    background: '#1f2937',
    borderRadius: '12px',
    color: '#fff'
  },
  resultJson: {
    background: '#111827',
    padding: '16px',
    borderRadius: '8px',
    overflow: 'auto',
    maxHeight: '400px',
    fontSize: '12px',
    fontFamily: 'monospace'
  }
};
