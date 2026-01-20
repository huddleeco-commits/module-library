/**
 * PreviewStep Screen
 * Shows a preview of the generated site before deployment
 *
 * Phase 1: Preview Only - View the generated site structure
 * Future phases will add editing capabilities
 */

import React, { useState, useEffect } from 'react';

export function PreviewStep({
  projectData,
  generationResult,
  onDeploy,
  onRegenerate,
  onBack
}) {
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewError, setPreviewError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Generate preview URL based on project data
  useEffect(() => {
    const loadPreview = async () => {
      setPreviewLoading(true);
      setPreviewError(null);

      try {
        // Build preview config from project data and generation result
        const previewConfig = {
          businessName: projectData.name || generationResult?.orchestrator?.summary?.businessName || 'My Business',
          industry: projectData.industry || generationResult?.orchestrator?.summary?.industry || 'business',
          industryName: generationResult?.orchestrator?.summary?.industryName || projectData.industry || 'Business',
          pages: projectData.pages || generationResult?.orchestrator?.payload?.pages || ['Home', 'About', 'Services', 'Contact'],
          colors: projectData.colors || {},
          tagline: generationResult?.orchestrator?.payload?.metadata?.inferredDetails?.tagline || '',
          location: generationResult?.orchestrator?.summary?.location || projectData.location || ''
        };

        // Request preview from server
        const response = await fetch('/api/preview/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(previewConfig)
        });

        if (!response.ok) {
          throw new Error('Failed to generate preview');
        }

        const data = await response.json();
        if (data.success && data.previewUrl) {
          setPreviewUrl(data.previewUrl);
        } else {
          throw new Error(data.error || 'Preview generation failed');
        }
      } catch (err) {
        console.error('Preview error:', err);
        setPreviewError(err.message);
      } finally {
        setPreviewLoading(false);
      }
    };

    loadPreview();
  }, [projectData, generationResult]);

  // Extract summary info
  const summary = generationResult?.orchestrator?.summary || {};
  const pages = projectData.pages || generationResult?.orchestrator?.payload?.pages || [];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button onClick={onBack} style={styles.backButton}>
            <span style={styles.backArrow}>&larr;</span>
            Back
          </button>
        </div>
        <div style={styles.headerCenter}>
          <h1 style={styles.title}>Preview Your Site</h1>
          <p style={styles.subtitle}>Review your generated website before deploying</p>
        </div>
        <div style={styles.headerRight}>
          <button onClick={() => setShowDetails(!showDetails)} style={styles.detailsButton}>
            {showDetails ? 'Hide' : 'Show'} Details
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        {/* Preview Frame */}
        <div style={styles.previewSection}>
          <div style={styles.browserFrame}>
            <div style={styles.browserBar}>
              <div style={styles.browserDots}>
                <span style={{...styles.dot, background: '#ff5f56'}}></span>
                <span style={{...styles.dot, background: '#ffbd2e'}}></span>
                <span style={{...styles.dot, background: '#27c93f'}}></span>
              </div>
              <div style={styles.browserUrl}>
                <span style={styles.lockIcon}>🔒</span>
                {projectData.name || 'your-site'}.netlify.app
              </div>
            </div>

            <div style={styles.previewContainer}>
              {previewLoading ? (
                <div style={styles.loadingState}>
                  <div style={styles.spinner}></div>
                  <p style={styles.loadingText}>Generating preview...</p>
                </div>
              ) : previewError ? (
                <div style={styles.errorState}>
                  <span style={styles.errorIcon}>⚠️</span>
                  <p style={styles.errorText}>Could not load preview</p>
                  <p style={styles.errorDetail}>{previewError}</p>
                  <button onClick={() => window.location.reload()} style={styles.retryButton}>
                    Retry
                  </button>
                </div>
              ) : previewUrl ? (
                <iframe
                  src={previewUrl}
                  style={styles.iframe}
                  title="Site Preview"
                  sandbox="allow-scripts allow-same-origin"
                />
              ) : null}
            </div>
          </div>
        </div>

        {/* Details Panel */}
        {showDetails && (
          <div style={styles.detailsPanel}>
            <h3 style={styles.detailsTitle}>Generation Summary</h3>

            <div style={styles.detailsGrid}>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Business</span>
                <span style={styles.detailValue}>{summary.businessName || projectData.name || 'My Business'}</span>
              </div>

              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Industry</span>
                <span style={styles.detailValue}>{summary.industryName || projectData.industry || 'Business'}</span>
              </div>

              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Pages</span>
                <span style={styles.detailValue}>{pages.length} pages</span>
              </div>

              {summary.location && (
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Location</span>
                  <span style={styles.detailValue}>{summary.location}</span>
                </div>
              )}
            </div>

            <div style={styles.pagesList}>
              <span style={styles.pagesLabel}>Pages included:</span>
              <div style={styles.pageTags}>
                {pages.map((page, i) => (
                  <span key={i} style={styles.pageTag}>
                    {typeof page === 'string' ? page.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : page}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={styles.actions}>
        <button onClick={onRegenerate} style={styles.secondaryButton}>
          <span style={styles.buttonIcon}>🔄</span>
          Regenerate
        </button>

        <button onClick={onDeploy} style={styles.primaryButton}>
          <span style={styles.buttonIcon}>🚀</span>
          Deploy Now
        </button>
      </div>

      {/* Phase 2 Teaser */}
      <div style={styles.teaser}>
        <span style={styles.teaserBadge}>Coming Soon</span>
        <span style={styles.teaserText}>Edit content, add your menu items, products, and more before deploying</span>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(180deg, #0a0a0f 0%, #12121a 100%)',
    padding: '24px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
    gap: '24px',
  },
  headerLeft: {
    flex: '0 0 auto',
  },
  headerCenter: {
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    flex: '0 0 auto',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#888',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  backArrow: {
    fontSize: '16px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#fff',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    margin: '8px 0 0',
  },
  detailsButton: {
    padding: '10px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#888',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  content: {
    flex: 1,
    display: 'flex',
    gap: '24px',
    marginBottom: '24px',
  },
  previewSection: {
    flex: 1,
  },
  browserFrame: {
    background: '#1a1a2e',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  browserBar: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    background: '#252536',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    gap: '16px',
  },
  browserDots: {
    display: 'flex',
    gap: '8px',
  },
  dot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
  },
  browserUrl: {
    flex: 1,
    background: '#1a1a2e',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#888',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  lockIcon: {
    fontSize: '12px',
  },
  previewContainer: {
    flex: 1,
    background: '#fff',
    minHeight: '500px',
    position: 'relative',
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
    minHeight: '500px',
  },
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    minHeight: '500px',
    background: '#f8fafc',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #e5e7eb',
    borderTopColor: '#3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '16px',
    color: '#64748b',
    fontSize: '14px',
  },
  errorState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    minHeight: '500px',
    background: '#fef2f2',
  },
  errorIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  errorText: {
    color: '#dc2626',
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 8px',
  },
  errorDetail: {
    color: '#ef4444',
    fontSize: '14px',
    margin: '0 0 16px',
  },
  retryButton: {
    padding: '10px 20px',
    background: '#dc2626',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  detailsPanel: {
    width: '300px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  detailsTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '20px',
  },
  detailsGrid: {
    display: 'grid',
    gap: '16px',
    marginBottom: '24px',
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  detailLabel: {
    fontSize: '12px',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  detailValue: {
    fontSize: '15px',
    color: '#fff',
    fontWeight: '500',
  },
  pagesList: {
    borderTop: '1px solid rgba(255,255,255,0.08)',
    paddingTop: '20px',
  },
  pagesLabel: {
    fontSize: '12px',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'block',
    marginBottom: '12px',
  },
  pageTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  pageTag: {
    padding: '6px 12px',
    background: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#60a5fa',
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    marginBottom: '24px',
  },
  secondaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '16px 32px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '16px 40px',
    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 20px rgba(34, 197, 94, 0.3)',
  },
  buttonIcon: {
    fontSize: '18px',
  },
  teaser: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '16px',
    background: 'rgba(139, 92, 246, 0.1)',
    borderRadius: '12px',
    border: '1px dashed rgba(139, 92, 246, 0.3)',
  },
  teaserBadge: {
    padding: '4px 12px',
    background: 'rgba(139, 92, 246, 0.2)',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#a78bfa',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  teaserText: {
    fontSize: '14px',
    color: '#a78bfa',
  },
};
