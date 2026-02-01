/**
 * Generation Studio - Unified Generation Interface
 *
 * Single entry point for all generation modes:
 * - Single site generation
 * - Batch mode (18 variants)
 * - AI picks mode
 *
 * All generated sites go to output/sites/ with consistent structure.
 */

import React, { useState, useEffect } from 'react';
import { API_BASE, TAGLINES } from './constants';
import { PasswordGate } from './components';
import { styles, initGlobalStyles } from './styles';
import StudioPage from './screens/StudioPage';

// Initialize global styles
initGlobalStyles();

export default function StudioApp() {
  // Auth state
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [showLanding, setShowLanding] = useState(false); // Skip landing for now

  // Check if already unlocked
  useEffect(() => {
    const access = localStorage.getItem('blink_access');
    if (access === 'granted') setIsUnlocked(true);
  }, []);

  // Rotate taglines
  useEffect(() => {
    if (!isUnlocked) return;
    const interval = setInterval(() => {
      setTaglineIndex(prev => (prev + 1) % TAGLINES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isUnlocked]);

  const handleLogout = () => {
    localStorage.removeItem('blink_access');
    setIsUnlocked(false);
  };

  const switchToLegacy = () => {
    localStorage.setItem('useLegacy', 'true');
    window.location.reload();
  };

  // Password gate
  if (!isUnlocked) {
    return <PasswordGate onUnlock={() => setIsUnlocked(true)} />;
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={{
        ...styles.header,
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={styles.logo}>
          <img
            src="/blink-logo.webp"
            alt="Blink"
            style={styles.logoImage}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <span style={styles.logoText}>BLINK</span>
          <span style={{
            fontSize: '10px',
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            padding: '2px 8px',
            borderRadius: '4px',
            marginLeft: '8px',
            fontWeight: '600'
          }}>
            STUDIO
          </span>
        </div>
        <div style={styles.headerRight}>
          <p style={styles.headerTagline} key={taglineIndex}>{TAGLINES[taglineIndex]}</p>
          <button
            onClick={switchToLegacy}
            style={{
              ...styles.logoutBtn,
              background: 'rgba(245, 158, 11, 0.2)',
              color: '#f59e0b',
              marginRight: '8px',
              fontSize: '12px'
            }}
            title="Switch to legacy interface"
          >
            Legacy UI
          </button>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </header>

      {/* Main Content - Studio Page */}
      <main style={{
        ...styles.main,
        padding: 0,
        overflow: 'hidden'
      }}>
        <StudioPage />
      </main>
    </div>
  );
}
