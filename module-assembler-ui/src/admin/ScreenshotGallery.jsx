/**
 * Screenshot Gallery
 *
 * View and compare screenshot galleries from generated projects
 * Useful for comparing layouts before deployment
 */

import React, { useState, useEffect } from 'react';

const API_BASE = '/api/screenshots';

export default function ScreenshotGallery() {
  const [galleries, setGalleries] = useState([]);
  const [selectedGallery, setSelectedGallery] = useState(null);
  const [screenshots, setScreenshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid, list, compare
  const [selectedViewport, setSelectedViewport] = useState('all');
  const [compareItems, setCompareItems] = useState([]);
  const [error, setError] = useState(null);

  // Fetch galleries on mount
  useEffect(() => {
    fetchGalleries();
  }, []);

  const fetchGalleries = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/gallery`);
      const data = await res.json();
      if (data.success) {
        setGalleries(data.galleries || []);
      }
    } catch (err) {
      setError('Failed to load galleries');
    } finally {
      setLoading(false);
    }
  };

  const fetchGalleryDetails = async (galleryId) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/gallery/${galleryId}`);
      const data = await res.json();
      if (data.success) {
        setSelectedGallery(data);
        setScreenshots(data.screenshots || []);
      }
    } catch (err) {
      setError('Failed to load gallery details');
    } finally {
      setLoading(false);
    }
  };

  const captureProject = async (projectId, quick = false) => {
    try {
      setCapturing(true);
      setError(null);
      const res = await fetch(`${API_BASE}/capture/${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quick })
      });
      const data = await res.json();
      if (data.success) {
        await fetchGalleries();
        if (data.galleryPath) {
          // Auto-select the new gallery
          const galleryId = data.galleryPath.split(/[/\\]/).pop();
          await fetchGalleryDetails(galleryId);
        }
      } else {
        setError(data.error || 'Capture failed');
      }
    } catch (err) {
      setError('Failed to capture screenshots');
    } finally {
      setCapturing(false);
    }
  };

  const deleteGallery = async (galleryId) => {
    if (!confirm('Delete this gallery?')) return;
    try {
      await fetch(`${API_BASE}/gallery/${galleryId}`, { method: 'DELETE' });
      await fetchGalleries();
      if (selectedGallery?.galleryId === galleryId) {
        setSelectedGallery(null);
        setScreenshots([]);
      }
    } catch (err) {
      setError('Failed to delete gallery');
    }
  };

  const toggleCompare = (screenshot) => {
    if (compareItems.find(s => s.url === screenshot.url)) {
      setCompareItems(compareItems.filter(s => s.url !== screenshot.url));
    } else if (compareItems.length < 2) {
      setCompareItems([...compareItems, screenshot]);
    }
  };

  const filteredScreenshots = selectedViewport === 'all'
    ? screenshots
    : screenshots.filter(s => s.viewport === selectedViewport);

  const viewports = [...new Set(screenshots.map(s => s.viewport))];
  const pages = [...new Set(screenshots.map(s => s.page))];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Screenshot Gallery</h1>
          <p style={styles.subtitle}>Preview and compare generated layouts</p>
        </div>
        <div style={styles.headerActions}>
          <button
            onClick={() => {
              const projectId = prompt('Enter project ID (e.g., cristy-s-cake-shop):');
              if (projectId) captureProject(projectId, true);
            }}
            disabled={capturing}
            style={styles.captureBtn}
          >
            {capturing ? 'Capturing...' : '📸 Quick Capture'}
          </button>
          <button
            onClick={fetchGalleries}
            style={styles.refreshBtn}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {error && (
        <div style={styles.error}>
          {error}
          <button onClick={() => setError(null)} style={styles.dismissBtn}>×</button>
        </div>
      )}

      <div style={styles.layout}>
        {/* Sidebar - Gallery List */}
        <div style={styles.sidebar}>
          <h3 style={styles.sidebarTitle}>Galleries</h3>
          {loading && !selectedGallery && <p style={styles.loading}>Loading...</p>}
          {galleries.length === 0 && !loading && (
            <p style={styles.empty}>No galleries yet. Capture a project to get started.</p>
          )}
          {galleries.map(gallery => (
            <div
              key={gallery.id}
              style={{
                ...styles.galleryItem,
                ...(selectedGallery?.galleryId === gallery.id ? styles.galleryItemActive : {})
              }}
              onClick={() => fetchGalleryDetails(gallery.id)}
            >
              <div style={styles.galleryName}>{gallery.projectName}</div>
              <div style={styles.galleryMeta}>
                {gallery.manifest?.summary?.totalScreenshots || 0} screenshots
              </div>
              <div style={styles.galleryDate}>
                {new Date(gallery.manifest?.capturedAt || gallery.timestamp).toLocaleDateString()}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); deleteGallery(gallery.id); }}
                style={styles.deleteBtn}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div style={styles.main}>
          {!selectedGallery ? (
            <div style={styles.placeholder}>
              <div style={styles.placeholderIcon}>📷</div>
              <h2>Select a Gallery</h2>
              <p>Choose a gallery from the sidebar or capture a new project</p>
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div style={styles.toolbar}>
                <div style={styles.toolbarLeft}>
                  <select
                    value={selectedViewport}
                    onChange={(e) => setSelectedViewport(e.target.value)}
                    style={styles.select}
                  >
                    <option value="all">All Viewports</option>
                    {viewports.map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                  <div style={styles.viewToggle}>
                    <button
                      onClick={() => setViewMode('grid')}
                      style={{ ...styles.viewBtn, ...(viewMode === 'grid' ? styles.viewBtnActive : {}) }}
                    >
                      ▦
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      style={{ ...styles.viewBtn, ...(viewMode === 'list' ? styles.viewBtnActive : {}) }}
                    >
                      ☰
                    </button>
                    <button
                      onClick={() => setViewMode('compare')}
                      style={{ ...styles.viewBtn, ...(viewMode === 'compare' ? styles.viewBtnActive : {}) }}
                    >
                      ⊞
                    </button>
                  </div>
                </div>
                <div style={styles.toolbarRight}>
                  <span style={styles.count}>{filteredScreenshots.length} screenshots</span>
                </div>
              </div>

              {/* Compare Mode */}
              {viewMode === 'compare' && (
                <div style={styles.compareContainer}>
                  <div style={styles.compareHeader}>
                    <span>Select 2 screenshots to compare</span>
                    {compareItems.length > 0 && (
                      <button onClick={() => setCompareItems([])} style={styles.clearBtn}>
                        Clear Selection
                      </button>
                    )}
                  </div>
                  {compareItems.length === 2 && (
                    <div style={styles.compareView}>
                      {compareItems.map((item, i) => (
                        <div key={i} style={styles.comparePane}>
                          <div style={styles.compareLabel}>{item.page} - {item.viewport}</div>
                          <img src={item.url} alt="" style={styles.compareImage} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Grid/List View */}
              <div style={viewMode === 'grid' ? styles.grid : styles.list}>
                {filteredScreenshots.map((screenshot, idx) => (
                  <div
                    key={idx}
                    style={{
                      ...styles.card,
                      ...(compareItems.find(s => s.url === screenshot.url) ? styles.cardSelected : {})
                    }}
                    onClick={() => viewMode === 'compare' && toggleCompare(screenshot)}
                  >
                    <img
                      src={screenshot.url}
                      alt={`${screenshot.page} - ${screenshot.viewport}`}
                      style={styles.thumbnail}
                      loading="lazy"
                    />
                    <div style={styles.cardInfo}>
                      <div style={styles.cardPage}>{screenshot.page}</div>
                      <div style={styles.cardViewport}>
                        {screenshot.viewport} ({screenshot.width}×{screenshot.height})
                      </div>
                    </div>
                    {viewMode === 'compare' && (
                      <div style={styles.checkmark}>
                        {compareItems.find(s => s.url === screenshot.url) ? '✓' : ''}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#0f172a',
    color: '#e2e8f0',
    padding: '24px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    margin: 0
  },
  subtitle: {
    color: '#64748b',
    marginTop: '4px'
  },
  headerActions: {
    display: 'flex',
    gap: '12px'
  },
  captureBtn: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  refreshBtn: {
    padding: '12px 16px',
    background: '#1e293b',
    color: '#e2e8f0',
    border: '1px solid #334155',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  error: {
    background: '#7f1d1d',
    color: '#fecaca',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  dismissBtn: {
    background: 'none',
    border: 'none',
    color: '#fecaca',
    fontSize: '20px',
    cursor: 'pointer'
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '280px 1fr',
    gap: '24px',
    minHeight: 'calc(100vh - 150px)'
  },
  sidebar: {
    background: '#1e293b',
    borderRadius: '12px',
    padding: '16px',
    height: 'fit-content',
    maxHeight: 'calc(100vh - 180px)',
    overflowY: 'auto'
  },
  sidebarTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '16px'
  },
  loading: {
    color: '#64748b',
    textAlign: 'center',
    padding: '20px'
  },
  empty: {
    color: '#64748b',
    fontSize: '14px',
    textAlign: 'center',
    padding: '20px'
  },
  galleryItem: {
    padding: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '8px',
    position: 'relative',
    background: '#0f172a',
    border: '1px solid #334155',
    transition: 'all 0.2s'
  },
  galleryItemActive: {
    background: '#3b82f6',
    borderColor: '#3b82f6'
  },
  galleryName: {
    fontWeight: '600',
    marginBottom: '4px'
  },
  galleryMeta: {
    fontSize: '12px',
    color: '#94a3b8'
  },
  galleryDate: {
    fontSize: '11px',
    color: '#64748b',
    marginTop: '4px'
  },
  deleteBtn: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    opacity: 0.5,
    fontSize: '14px'
  },
  main: {
    background: '#1e293b',
    borderRadius: '12px',
    padding: '24px',
    minHeight: '500px'
  },
  placeholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px',
    color: '#64748b'
  },
  placeholderIcon: {
    fontSize: '64px',
    marginBottom: '16px'
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid #334155'
  },
  toolbarLeft: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  },
  toolbarRight: {},
  select: {
    padding: '8px 12px',
    background: '#0f172a',
    color: '#e2e8f0',
    border: '1px solid #334155',
    borderRadius: '6px',
    fontSize: '14px'
  },
  viewToggle: {
    display: 'flex',
    background: '#0f172a',
    borderRadius: '6px',
    overflow: 'hidden'
  },
  viewBtn: {
    padding: '8px 12px',
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: '16px'
  },
  viewBtnActive: {
    background: '#3b82f6',
    color: '#fff'
  },
  count: {
    color: '#64748b',
    fontSize: '14px'
  },
  compareContainer: {
    marginBottom: '20px'
  },
  compareHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    color: '#94a3b8'
  },
  clearBtn: {
    padding: '6px 12px',
    background: '#334155',
    color: '#e2e8f0',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  compareView: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    background: '#0f172a',
    padding: '16px',
    borderRadius: '8px'
  },
  comparePane: {},
  compareLabel: {
    fontSize: '12px',
    color: '#94a3b8',
    marginBottom: '8px'
  },
  compareImage: {
    width: '100%',
    borderRadius: '8px',
    border: '1px solid #334155'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px'
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  card: {
    background: '#0f172a',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'relative'
  },
  cardSelected: {
    borderColor: '#3b82f6'
  },
  thumbnail: {
    width: '100%',
    height: '180px',
    objectFit: 'cover',
    objectPosition: 'top'
  },
  cardInfo: {
    padding: '12px'
  },
  cardPage: {
    fontWeight: '600',
    marginBottom: '4px'
  },
  cardViewport: {
    fontSize: '12px',
    color: '#64748b'
  },
  checkmark: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '24px',
    height: '24px',
    background: '#3b82f6',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    color: '#fff'
  }
};
