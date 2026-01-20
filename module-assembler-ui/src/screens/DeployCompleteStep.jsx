/**
 * DeployCompleteStep Screen
 * Shows deployment success with URLs and credentials
 */

import React, { useState } from 'react';
import { styles } from '../styles';

// Component-specific styles
const deployCompleteStyles = {
  toggleBtn: {
    padding: '4px 8px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    opacity: 0.7,
    transition: 'opacity 0.2s'
  }
};

export function DeployCompleteStep({ result, onReset, onGenerateCompanion }) {
  const [copied, setCopied] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const maskPassword = (pw) => {
    if (!pw) return '';
    return '*'.repeat(pw.length);
  };

  return (
    <div style={styles.deployCompleteContainer}>
      <div style={styles.deployCompleteIcon}>🎉</div>
      <h1 style={styles.deployCompleteTitle}>You're Live!</h1>
      <p style={styles.deployCompleteSubtitle}>Your site is now on the internet</p>

      {/* Main URL */}
      <div style={styles.liveUrlCard}>
        <span style={styles.liveUrlLabel}>Your Website</span>
        <a
          href={result?.urls?.frontend}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.liveUrlLink}
        >
          {result?.urls?.frontend || 'https://your-site.be1st.io'}
        </a>
        <button
          style={styles.visitBtn}
          onClick={() => window.open(result?.urls?.frontend, '_blank')}
        >
          Visit Site
        </button>
      </div>

      {/* All URLs */}
      <div style={styles.allUrlsCard}>
        <h3 style={styles.allUrlsTitle}>All Your URLs</h3>

        <div style={styles.urlRow}>
          <span style={styles.urlLabel}>Frontend:</span>
          <a href={result?.urls?.frontend} target="_blank" rel="noopener noreferrer" style={styles.urlValue}>
            {result?.urls?.frontend}
          </a>
          <button style={styles.copyBtn} onClick={() => copyToClipboard(result?.urls?.frontend, 'frontend')}>
            {copied === 'frontend' ? '✓' : '📋'}
          </button>
        </div>

        <div style={styles.urlRow}>
          <span style={styles.urlLabel}>API:</span>
          <a href={result?.urls?.backend} target="_blank" rel="noopener noreferrer" style={styles.urlValue}>
            {result?.urls?.backend}
          </a>
          <button style={styles.copyBtn} onClick={() => copyToClipboard(result?.urls?.backend, 'backend')}>
            {copied === 'backend' ? '✓' : '📋'}
          </button>
        </div>

        <div style={styles.urlRow}>
          <span style={styles.urlLabel}>Admin:</span>
          <a href={result?.urls?.admin} target="_blank" rel="noopener noreferrer" style={styles.urlValue}>
            {result?.urls?.admin}
          </a>
          <button style={styles.copyBtn} onClick={() => copyToClipboard(result?.urls?.admin, 'admin')}>
            {copied === 'admin' ? '✓' : '📋'}
          </button>
        </div>

        <div style={styles.urlRow}>
          <span style={styles.urlLabel}>GitHub:</span>
          <a href={result?.urls?.github} target="_blank" rel="noopener noreferrer" style={styles.urlValue}>
            {result?.urls?.github}
          </a>
          <button style={styles.copyBtn} onClick={() => copyToClipboard(result?.urls?.github, 'github')}>
            {copied === 'github' ? '✓' : '📋'}
          </button>
        </div>

        <div style={styles.urlRow}>
          <span style={styles.urlLabel}>Railway:</span>
          <a href={result?.urls?.railway} target="_blank" rel="noopener noreferrer" style={styles.urlValue}>
            {result?.urls?.railway}
          </a>
          <button style={styles.copyBtn} onClick={() => copyToClipboard(result?.urls?.railway, 'railway')}>
            {copied === 'railway' ? '✓' : '📋'}
          </button>
        </div>
      </div>

      {/* Admin Credentials */}
      {result?.credentials && (
        <div style={styles.credentialsCard}>
          <h3 style={styles.credentialsTitle}>Admin Login</h3>
          <div style={styles.credentialRow}>
            <span style={styles.credentialLabel}>Email:</span>
            <span style={styles.credentialValue}>{result.credentials.adminEmail}</span>
            <button style={styles.copyBtn} onClick={() => copyToClipboard(result.credentials.adminEmail, 'email')}>
              {copied === 'email' ? '✓' : '📋'}
            </button>
          </div>
          <div style={styles.credentialRow}>
            <span style={styles.credentialLabel}>Password:</span>
            <span style={styles.credentialValue}>
              {showPassword ? result.credentials.adminPassword : maskPassword(result.credentials.adminPassword)}
            </span>
            <button
              style={deployCompleteStyles.toggleBtn}
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
            <button style={styles.copyBtn} onClick={() => copyToClipboard(result.credentials.adminPassword, 'password')}>
              {copied === 'password' ? '✓' : '📋'}
            </button>
          </div>
          <p style={styles.credentialHint}>Save these! You'll need them to access the admin dashboard.</p>
        </div>
      )}

      <div style={styles.deployCompleteActions}>
        <button style={styles.primaryBtn} onClick={() => window.open(result?.urls?.frontend, '_blank')}>
          🌐 View Live Site
        </button>
        <button style={styles.secondaryBtn} onClick={onReset}>
          + Create Another
        </button>
      </div>

      {/* Companion App CTA */}
      {onGenerateCompanion && result?.appType !== 'companion-app' && result?.appType !== 'advanced-app' && (
        <div style={{
          marginTop: '24px',
          padding: '20px',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.15))',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '16px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📱</div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
            Want a Mobile App?
          </h3>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>
            Create a companion app that connects to this site's backend
          </p>
          <button
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
            onClick={onGenerateCompanion}
          >
            🚀 Generate Companion App
          </button>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>
            Deploys to <strong>{result?.urls?.frontend?.replace('https://', '').split('.')[0]}.be1st.app</strong>
          </p>
        </div>
      )}

      <p style={styles.dnsNote}>
        💡 If the site doesn't load immediately, wait 1-2 minutes for DNS propagation.
      </p>
    </div>
  );
}
