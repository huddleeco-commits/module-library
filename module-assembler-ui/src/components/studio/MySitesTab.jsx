/**
 * MySitesTab - View and manage all generated sites
 *
 * Features:
 * - List all sites with metrics
 * - Variant grid for batch-generated sites
 * - Deploy, delete, compare actions
 * - Access TestDashboard for each variant
 */

import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../constants';

const STYLES = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    color: '#fff',
    fontSize: '24px',
    fontWeight: '600'
  },
  refreshBtn: {
    padding: '10px 20px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s'
  },
  statsRow: {
    display: 'flex',
    gap: '16px'
  },
  statCard: {
    flex: 1,
    padding: '20px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.08)',
    textAlign: 'center'
  },
  statValue: {
    color: '#fff',
    fontSize: '32px',
    fontWeight: '700'
  },
  statLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '12px',
    marginTop: '4px'
  },
  sitesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px'
  },
  siteCard: {
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.08)',
    overflow: 'hidden',
    transition: 'all 0.2s'
  },
  siteCardHover: {
    borderColor: 'rgba(139, 92, 246, 0.3)'
  },
  siteHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  siteName: {
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600'
  },
  siteIndustry: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '12px',
    marginTop: '4px'
  },
  siteBadge: {
    fontSize: '10px',
    padding: '4px 8px',
    borderRadius: '4px',
    background: 'rgba(139, 92, 246, 0.2)',
    color: '#a78bfa'
  },
  siteMetrics: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1px',
    background: 'rgba(255,255,255,0.05)'
  },
  metricBox: {
    padding: '12px',
    background: '#12121a',
    textAlign: 'center'
  },
  metricValue: {
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600'
  },
  metricLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '10px',
    marginTop: '2px'
  },
  variantGrid: {
    padding: '16px',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px'
  },
  variantThumb: {
    aspectRatio: '16/9',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: '2px solid transparent',
    fontSize: '10px',
    color: 'rgba(255,255,255,0.5)'
  },
  variantThumbHover: {
    borderColor: '#8b5cf6',
    background: 'rgba(139, 92, 246, 0.1)'
  },
  siteActions: {
    padding: '16px 20px',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    gap: '8px'
  },
  actionBtn: {
    flex: 1,
    padding: '10px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px'
  },
  actionBtnPrimary: {
    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
    border: 'none'
  },
  actionBtnDanger: {
    borderColor: '#ef4444',
    color: '#ef4444'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: 'rgba(255,255,255,0.5)'
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px',
    opacity: 0.5
  },
  emptyTitle: {
    color: '#fff',
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '8px'
  },
  emptyDesc: {
    fontSize: '14px',
    maxWidth: '400px',
    margin: '0 auto'
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px',
    color: 'rgba(255,255,255,0.5)'
  }
};

export default function MySitesTab({ onSiteDeleted }) {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredSite, setHoveredSite] = useState(null);
  const [hoveredVariant, setHoveredVariant] = useState(null);

  const loadSites = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/studio/sites`);
      const data = await response.json();
      if (data.success) {
        setSites(data.sites || []);
      } else {
        throw new Error(data.error || 'Failed to load sites');
      }
    } catch (err) {
      console.error('Failed to load sites:', err);
      setError(err.message);
      // Fallback to legacy endpoint
      try {
        const legacyResponse = await fetch(`${API_BASE}/api/test-mode/projects`);
        const legacyData = await legacyResponse.json();
        if (legacyData.success) {
          // Transform legacy data to new format
          const transformedSites = legacyData.projects?.map(p => ({
            id: p.name,
            name: p.name,
            industry: p.industry || 'general',
            createdAt: p.createdAt,
            variants: [{
              id: 'default',
              preset: 'default',
              theme: 'light',
              status: 'generated',
              pages: p.pages || 5,
              linesOfCode: p.linesOfCode || 0
            }],
            totalMetrics: {
              variants: 1,
              totalPages: p.pages || 5,
              totalLines: p.linesOfCode || 0
            }
          })) || [];
          setSites(transformedSites);
          setError(null);
        }
      } catch (legacyErr) {
        console.error('Legacy fallback also failed:', legacyErr);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSites();
  }, []);

  const handleOpenDashboard = (site, variantId = null) => {
    const dashboardUrl = `${API_BASE}/output/generated-projects/${site.id}${variantId ? `/variants/${variantId}` : ''}/frontend/dashboard.html`;
    window.open(dashboardUrl, '_blank');
  };

  const handleDeploy = async (site, variantId = null) => {
    // TODO: Implement deploy flow
    alert(`Deploy ${site.name}${variantId ? ` (${variantId})` : ''} - Coming soon!`);
  };

  const [deleting, setDeleting] = useState(null);
  const [deleteResults, setDeleteResults] = useState(null);

  const handleDelete = async (site, localOnly = false) => {
    const confirmMsg = localOnly
      ? `Delete "${site.name}" locally? (External deployments will remain)`
      : `COMPLETE DELETE: "${site.name}"\n\nThis will remove:\n- Local files\n- Railway project\n- GitHub repositories\n- Cloudflare DNS records\n\nThis cannot be undone!`;

    if (!confirm(confirmMsg)) {
      return;
    }

    setDeleting(site.id);
    setDeleteResults(null);

    try {
      const url = localOnly
        ? `${API_BASE}/api/studio/sites/${site.id}?localOnly=true`
        : `${API_BASE}/api/studio/sites/${site.id}?complete=true`;

      const response = await fetch(url, { method: 'DELETE' });
      const data = await response.json();

      if (data.success) {
        setSites(prev => prev.filter(s => s.id !== site.id));
        onSiteDeleted?.();

        // Show results briefly
        if (data.results?.platformDeletion) {
          setDeleteResults({
            siteId: site.id,
            ...data.results.platformDeletion
          });
          setTimeout(() => setDeleteResults(null), 5000);
        }
      } else {
        throw new Error(data.error || 'Delete failed');
      }
    } catch (err) {
      console.error('Delete failed:', err);
      alert(`Failed to delete: ${err.message}`);
    } finally {
      setDeleting(null);
    }
  };

  // Calculate totals
  const totalSites = sites.length;
  const totalVariants = sites.reduce((sum, s) => sum + (s.variants?.length || 1), 0);
  const totalPages = sites.reduce((sum, s) => sum + (s.totalMetrics?.totalPages || 0), 0);
  const totalLines = sites.reduce((sum, s) => sum + (s.totalMetrics?.totalLines || 0), 0);

  if (loading) {
    return (
      <div style={STYLES.container}>
        <div style={STYLES.loading}>
          <span style={{ fontSize: '24px', marginRight: '12px' }}>⏳</span>
          Loading sites...
        </div>
      </div>
    );
  }

  return (
    <div style={STYLES.container}>
      {/* Header */}
      <div style={STYLES.header}>
        <div style={STYLES.title}>My Generated Sites</div>
        <button onClick={loadSites} style={STYLES.refreshBtn}>
          <span>🔄</span> Refresh
        </button>
      </div>

      {/* Stats Row */}
      <div style={STYLES.statsRow}>
        <div style={STYLES.statCard}>
          <div style={STYLES.statValue}>{totalSites}</div>
          <div style={STYLES.statLabel}>Sites</div>
        </div>
        <div style={STYLES.statCard}>
          <div style={STYLES.statValue}>{totalVariants}</div>
          <div style={STYLES.statLabel}>Variants</div>
        </div>
        <div style={STYLES.statCard}>
          <div style={STYLES.statValue}>{totalPages}</div>
          <div style={STYLES.statLabel}>Pages</div>
        </div>
        <div style={STYLES.statCard}>
          <div style={STYLES.statValue}>{(totalLines / 1000).toFixed(1)}k</div>
          <div style={STYLES.statLabel}>Lines of Code</div>
        </div>
      </div>

      {/* Sites Grid or Empty State */}
      {sites.length === 0 ? (
        <div style={STYLES.emptyState}>
          <div style={STYLES.emptyIcon}>📁</div>
          <div style={STYLES.emptyTitle}>No Sites Yet</div>
          <div style={STYLES.emptyDesc}>
            Generate your first site using the Generate tab. Your sites will appear here with metrics and quick actions.
          </div>
        </div>
      ) : (
        <div style={STYLES.sitesGrid}>
          {sites.map(site => (
            <div
              key={site.id}
              style={{
                ...STYLES.siteCard,
                ...(hoveredSite === site.id ? STYLES.siteCardHover : {})
              }}
              onMouseEnter={() => setHoveredSite(site.id)}
              onMouseLeave={() => setHoveredSite(null)}
            >
              {/* Site Header */}
              <div style={STYLES.siteHeader}>
                <div>
                  <div style={STYLES.siteName}>{site.name}</div>
                  <div style={STYLES.siteIndustry}>{site.industry}</div>
                </div>
                <div style={STYLES.siteBadge}>
                  {site.variants?.length || 1} variant{(site.variants?.length || 1) !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Metrics */}
              <div style={STYLES.siteMetrics}>
                <div style={STYLES.metricBox}>
                  <div style={STYLES.metricValue}>{site.totalMetrics?.totalPages || '-'}</div>
                  <div style={STYLES.metricLabel}>Pages</div>
                </div>
                <div style={STYLES.metricBox}>
                  <div style={STYLES.metricValue}>{site.totalMetrics?.totalLines || '-'}</div>
                  <div style={STYLES.metricLabel}>Lines</div>
                </div>
                <div style={STYLES.metricBox}>
                  <div style={STYLES.metricValue}>
                    {site.createdAt ? new Date(site.createdAt).toLocaleDateString() : '-'}
                  </div>
                  <div style={STYLES.metricLabel}>Created</div>
                </div>
              </div>

              {/* Variant Grid (if multiple variants) */}
              {site.variants?.length > 1 && (
                <div style={STYLES.variantGrid}>
                  {site.variants.slice(0, 6).map(v => (
                    <div
                      key={v.id}
                      onClick={() => handleOpenDashboard(site, v.id)}
                      style={{
                        ...STYLES.variantThumb,
                        ...(hoveredVariant === `${site.id}-${v.id}` ? STYLES.variantThumbHover : {})
                      }}
                      onMouseEnter={() => setHoveredVariant(`${site.id}-${v.id}`)}
                      onMouseLeave={() => setHoveredVariant(null)}
                      title={`${v.preset} / ${v.theme}`}
                    >
                      {v.preset?.charAt(0).toUpperCase()}/{v.theme?.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {site.variants.length > 6 && (
                    <div style={{
                      ...STYLES.variantThumb,
                      background: 'rgba(139, 92, 246, 0.1)'
                    }}>
                      +{site.variants.length - 6}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div style={STYLES.siteActions}>
                <button
                  onClick={() => handleOpenDashboard(site)}
                  style={STYLES.actionBtn}
                >
                  <span>📊</span> Dashboard
                </button>
                <button
                  onClick={() => handleDeploy(site)}
                  style={{ ...STYLES.actionBtn, ...STYLES.actionBtnPrimary }}
                >
                  <span>🚀</span> Deploy
                </button>
                <button
                  onClick={() => handleDelete(site)}
                  disabled={deleting === site.id}
                  style={{
                    ...STYLES.actionBtn,
                    ...STYLES.actionBtnDanger,
                    opacity: deleting === site.id ? 0.5 : 1
                  }}
                  title="Complete delete (Railway, GitHub, DNS, local)"
                >
                  {deleting === site.id ? <span>⏳</span> : <span>🗑️</span>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Results Toast */}
      {deleteResults && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#1a1a2e',
          borderRadius: '12px',
          padding: '16px 20px',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          maxWidth: '320px',
          zIndex: 1000
        }}>
          <div style={{ color: '#22c55e', fontWeight: '600', marginBottom: '8px' }}>
            ✅ Deletion Complete
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
            {deleteResults.railway?.attempted && (
              <div>Railway: {deleteResults.railway.success ? '✓ deleted' : '⚠ skipped'}</div>
            )}
            {deleteResults.github?.attempted && (
              <div>GitHub: {deleteResults.github.repos?.filter(r => r.deleted).length || 0} repos deleted</div>
            )}
            {deleteResults.cloudflare?.attempted && (
              <div>DNS: {deleteResults.cloudflare.domains?.length || 0} records cleared</div>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '8px',
          color: '#ef4444',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
