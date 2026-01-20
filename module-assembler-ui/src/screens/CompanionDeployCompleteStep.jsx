/**
 * CompanionDeployCompleteStep Screen
 * Shows companion app deployment success with URLs
 */

import React, { useState } from 'react';
import { styles } from '../styles';

// Component-specific styles
const companionStyles = {
  toggleBtn: {
    padding: '4px 8px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    opacity: 0.7,
    transition: 'opacity 0.2s'
  },
  parentLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    background: 'rgba(99, 102, 241, 0.1)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    borderRadius: '10px',
    marginBottom: '16px'
  },
  parentLinkLabel: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: '2px'
  },
  parentLinkValue: {
    fontSize: '14px',
    color: '#6366f1',
    textDecoration: 'none',
    fontWeight: '500'
  }
};

export function CompanionDeployCompleteStep({ result, parentSite, onReset, onBackToWebsite }) {
  const [copied, setCopied] = useState(null);

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const urls = result?.urls || {};

  return (
    <div style={styles.deployCompleteContainer}>
      <div style={styles.deployCompleteIcon}>📱</div>
      <h1 style={styles.deployCompleteTitle}>Companion App Live!</h1>
      <p style={styles.deployCompleteSubtitle}>Your mobile app is now on the internet</p>

      {/* Main URL */}
      <div style={styles.liveUrlCard}>
        <span style={styles.liveUrlLabel}>Your Companion App</span>
        <a
          href={urls.companion}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.liveUrlLink}
        >
          {urls.companion || 'https://your-app.be1st.app'}
        </a>
        <button
          style={styles.visitBtn}
          onClick={() => window.open(urls.companion, '_blank')}
        >
          Open App
        </button>
      </div>

      {/* Parent Site Link */}
      {urls.parentSite && (
        <div style={companionStyles.parentLink}>
          <div style={{ fontSize: '24px' }}>🔗</div>
          <div style={{ flex: 1 }}>
            <div style={companionStyles.parentLinkLabel}>Connected to Website</div>
            <a
              href={urls.parentSite}
              target="_blank"
              rel="noopener noreferrer"
              style={companionStyles.parentLinkValue}
            >
              {urls.parentSite}
            </a>
          </div>
        </div>
      )}

      {/* All URLs */}
      <div style={styles.allUrlsCard}>
        <h3 style={styles.allUrlsTitle}>All Your URLs</h3>

        <div style={styles.urlRow}>
          <span style={styles.urlLabel}>App (.app):</span>
          <a href={urls.companion} target="_blank" rel="noopener noreferrer" style={styles.urlValue}>
            {urls.companion}
          </a>
          <button style={styles.copyBtn} onClick={() => copyToClipboard(urls.companion, 'companion')}>
            {copied === 'companion' ? '✓' : '📋'}
          </button>
        </div>

        <div style={styles.urlRow}>
          <span style={styles.urlLabel}>Website (.io):</span>
          <a href={urls.parentSite} target="_blank" rel="noopener noreferrer" style={styles.urlValue}>
            {urls.parentSite}
          </a>
          <button style={styles.copyBtn} onClick={() => copyToClipboard(urls.parentSite, 'parentSite')}>
            {copied === 'parentSite' ? '✓' : '📋'}
          </button>
        </div>

        <div style={styles.urlRow}>
          <span style={styles.urlLabel}>API:</span>
          <a href={urls.parentApi} target="_blank" rel="noopener noreferrer" style={styles.urlValue}>
            {urls.parentApi}
          </a>
          <button style={styles.copyBtn} onClick={() => copyToClipboard(urls.parentApi, 'api')}>
            {copied === 'api' ? '✓' : '📋'}
          </button>
        </div>

        <div style={styles.urlRow}>
          <span style={styles.urlLabel}>GitHub:</span>
          <a href={urls.github} target="_blank" rel="noopener noreferrer" style={styles.urlValue}>
            {urls.github}
          </a>
          <button style={styles.copyBtn} onClick={() => copyToClipboard(urls.github, 'github')}>
            {copied === 'github' ? '✓' : '📋'}
          </button>
        </div>

        <div style={styles.urlRow}>
          <span style={styles.urlLabel}>Railway:</span>
          <a href={urls.railway} target="_blank" rel="noopener noreferrer" style={styles.urlValue}>
            {urls.railway}
          </a>
          <button style={styles.copyBtn} onClick={() => copyToClipboard(urls.railway, 'railway')}>
            {copied === 'railway' ? '✓' : '📋'}
          </button>
        </div>
      </div>

      {/* Credentials Note */}
      <div style={{
        ...styles.credentialsCard,
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15))',
        border: '1px solid rgba(99, 102, 241, 0.3)'
      }}>
        <h3 style={styles.credentialsTitle}>Login Info</h3>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
          Users log in with the <strong>same credentials</strong> as the main website.
          The companion app connects to the website's backend and shares the same user accounts.
        </p>
      </div>

      <div style={styles.deployCompleteActions}>
        <button style={styles.primaryBtn} onClick={() => window.open(urls.companion, '_blank')}>
          📱 Open Companion App
        </button>
        {onBackToWebsite && (
          <button style={styles.secondaryBtn} onClick={onBackToWebsite}>
            🌐 Back to Website
          </button>
        )}
        <button style={{ ...styles.secondaryBtn, opacity: 0.7 }} onClick={onReset}>
          + Create Another
        </button>
      </div>

      {/* Domain Info */}
      <div style={{
        marginTop: '24px',
        padding: '16px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
          Domain Architecture
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{
            padding: '8px 16px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '10px', color: '#10b981', marginBottom: '2px' }}>WEBSITE</div>
            <div style={{ fontSize: '13px', color: '#fff' }}>{parentSite?.subdomain || 'your-site'}.be1st.io</div>
          </div>
          <div style={{ fontSize: '20px', color: 'rgba(255,255,255,0.3)' }}>→</div>
          <div style={{
            padding: '8px 16px',
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '10px', color: '#8b5cf6', marginBottom: '2px' }}>COMPANION APP</div>
            <div style={{ fontSize: '13px', color: '#fff' }}>{parentSite?.subdomain || 'your-site'}.be1st.app</div>
          </div>
        </div>
      </div>

      <p style={styles.dnsNote}>
        💡 If the app doesn't load immediately, wait 1-2 minutes for DNS propagation.
      </p>
    </div>
  );
}
