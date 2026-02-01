/**
 * QuickStart DevTool
 *
 * Development/testing version of the QuickStart flow.
 * Same UI as production - test here first, then port changes to main QuickStep.
 *
 * Features:
 * - Same flow as production QuickStep
 * - Generate & Deploy same as production
 * - List of recent generations with easy delete
 * - Test mode toggle (fixtures vs AI)
 */

import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '';

// Industry options (matches production)
const INDUSTRIES = [
  { key: 'restaurant', label: 'Restaurant', icon: '🍽️' },
  { key: 'cafe', label: 'Cafe', icon: '☕' },
  { key: 'pizza', label: 'Pizza', icon: '🍕' },
  { key: 'salon', label: 'Salon', icon: '💇' },
  { key: 'fitness', label: 'Fitness', icon: '💪' },
  { key: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { key: 'dental', label: 'Dental', icon: '🦷' },
  { key: 'legal', label: 'Legal', icon: '⚖️' },
  { key: 'realestate', label: 'Real Estate', icon: '🏠' },
  { key: 'ecommerce', label: 'E-Commerce', icon: '🛒' },
  { key: 'saas', label: 'SaaS', icon: '💻' },
  { key: 'agency', label: 'Agency', icon: '🏢' }
];

// Page tiers (matches HealthcareOS vision)
const PAGE_TIERS = [
  { key: 'essential', label: 'Essential', pages: '4 pages', desc: 'Home, About, Services, Contact' },
  { key: 'recommended', label: 'Recommended', pages: '6 pages', desc: '+ Gallery, Testimonials' },
  { key: 'premium', label: 'Premium', pages: '8+ pages', desc: '+ Team, Blog, Booking, FAQ' }
];

// Portal options
const PORTAL_OPTIONS = [
  { key: 'none', label: 'No Portal' },
  { key: 'basic', label: 'Basic', desc: 'Dashboard + Profile' },
  { key: 'full', label: 'Full', desc: 'Rewards, Wallet, Leaderboard' }
];

export default function QuickStartDevTool() {
  // Mode
  const [testMode, setTestMode] = useState(true);

  // Form state (mirrors QuickStep)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    industry: 'restaurant',
    location: '',
    tier: 'recommended',
    portal: 'none',
    companion: false,
    // Theme
    primaryColor: '#6366f1',
    accentColor: '#06b6d4',
    // Mood sliders
    vibe: 50,
    energy: 50
  });

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Recent generations
  const [recentProjects, setRecentProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Load recent projects on mount
  useEffect(() => {
    loadRecentProjects();
  }, []);

  async function loadRecentProjects() {
    setLoadingProjects(true);
    try {
      // Use admin endpoint with auth
      const token = localStorage.getItem('blink_admin_token');
      const res = await fetch(`${API_URL}/api/admin/generations?limit=20`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      const data = await res.json();
      if (data.success) {
        // Map to expected format for rendering
        const generations = (data.generations || []).map(g => ({
          id: g.id,
          name: g.site_name,
          industry: g.industry,
          status: g.status,
          pageCount: g.pages_generated || 0,
          createdAt: g.created_at,
          deployedUrl: g.frontend_url,
          adminUrl: g.admin_url,
          githubUrl: g.github_frontend
        }));
        setRecentProjects(generations);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoadingProjects(false);
    }
  }

  function updateForm(updates) {
    setFormData(prev => ({ ...prev, ...updates }));
  }

  // Get pages based on tier
  function getPagesForTier(tier, industry) {
    const basePagesMap = {
      essential: ['home', 'about', 'menu', 'contact'],
      recommended: ['home', 'about', 'menu', 'gallery', 'testimonials', 'contact'],
      premium: ['home', 'about', 'menu', 'gallery', 'testimonials', 'team', 'events', 'booking', 'faq', 'contact']
    };

    // Adjust for industry
    let pages = basePagesMap[tier] || basePagesMap.recommended;

    // Swap 'menu' for 'services' for non-food industries
    if (!['restaurant', 'cafe', 'pizza'].includes(industry)) {
      pages = pages.map(p => p === 'menu' ? 'services' : p);
    }

    return pages;
  }

  // Generate project (same API as production)
  async function handleGenerate() {
    if (!formData.name.trim()) {
      setError('Business name is required');
      return;
    }

    setGenerating(true);
    setError(null);
    setResult(null);

    try {
      // Get pages for selected tier
      const pages = getPagesForTier(formData.tier, formData.industry);

      // Build description with pages included
      const description = {
        text: formData.description ||
          `${formData.name} - ${INDUSTRIES.find(i => i.key === formData.industry)?.label || formData.industry}${formData.location ? ` in ${formData.location}` : ''}`,
        pages: pages,
        location: formData.location || null
      };

      const payload = {
        name: formData.name,
        industry: formData.industry,
        description: description,
        theme: {
          primary: formData.primaryColor,
          accent: formData.accentColor
        },
        moodSliders: {
          vibe: formData.vibe,
          energy: formData.energy,
          era: 50,
          density: 50,
          price: 50
        },
        // Tier selection
        adminTier: formData.tier === 'essential' ? 'L2' : formData.tier === 'premium' ? 'L4' : 'L3',
        // Test mode flag
        testMode: testMode
      };

      console.log('[DevTool] Generating with payload:', payload);

      // Use the same API as production
      const res = await fetch(`${API_URL}/api/assemble`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success) {
        setResult(data);
        // Refresh project list
        loadRecentProjects();
      } else {
        setError(data.error || 'Generation failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  // Deploy project (same API as production)
  async function handleDeploy(projectId) {
    if (!projectId && !result?.projectId) {
      setError('No project to deploy');
      return;
    }

    setDeploying(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: projectId || result.projectId
        })
      });

      const data = await res.json();

      if (data.success) {
        setResult(prev => ({ ...prev, deployed: true, deployUrl: data.url }));
        loadRecentProjects();
      } else {
        setError(data.error || 'Deploy failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setDeploying(false);
    }
  }

  // Get auth token for admin API calls
  function getAuthHeaders() {
    const token = localStorage.getItem('blink_admin_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  // Delete project (removes from Railway, GitHub, Cloudflare, local files, and database)
  async function handleDelete(projectId) {
    if (!confirm('Delete this project? This will remove it from Railway, GitHub, Cloudflare DNS, and local files.')) return;

    try {
      const res = await fetch(`${API_URL}/api/admin/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });

      const data = await res.json();
      if (data.success) {
        alert(`Deleted: ${data.message}`);
        loadRecentProjects();
        if (result?.projectId === projectId) {
          setResult(null);
        }
      } else {
        alert(`Delete failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Delete failed:', err);
      alert(`Delete error: ${err.message}`);
    }
  }

  // Fill with example data
  function fillExample() {
    updateForm({
      name: 'Sunrise Cafe',
      description: 'Cozy neighborhood cafe with fresh pastries',
      industry: 'cafe',
      location: 'Austin, TX',
      tier: 'recommended',
      portal: 'basic',
      companion: false,
      primaryColor: '#f59e0b',
      accentColor: '#10b981',
      vibe: 65,
      energy: 55
    });
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>QuickStart DevTool</h1>
          <p style={styles.subtitle}>Test the generation flow - same as production</p>
        </div>
        <div style={styles.modeToggle}>
          <button
            onClick={() => setTestMode(true)}
            style={{
              ...styles.modeBtn,
              ...(testMode ? styles.modeBtnActiveTest : {})
            }}
          >
            🧪 Test Mode
          </button>
          <button
            onClick={() => setTestMode(false)}
            style={{
              ...styles.modeBtn,
              ...(!testMode ? styles.modeBtnActiveProd : {})
            }}
          >
            🚀 Production
          </button>
        </div>
      </div>

      <div style={styles.layout}>
        {/* Left: Form */}
        <div style={styles.formPanel}>
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Business Info</h2>
              <button onClick={fillExample} style={styles.exampleBtn}>Fill Example</button>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Business Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => updateForm({ name: e.target.value })}
                placeholder="My Business"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Description</label>
              <textarea
                value={formData.description}
                onChange={e => updateForm({ description: e.target.value })}
                placeholder="Brief description of your business..."
                style={styles.textarea}
                rows={2}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={e => updateForm({ location: e.target.value })}
                placeholder="City, State"
                style={styles.input}
              />
            </div>
          </div>

          {/* Industry */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Industry</h2>
            <div style={styles.industryGrid}>
              {INDUSTRIES.map(ind => (
                <button
                  key={ind.key}
                  onClick={() => updateForm({ industry: ind.key })}
                  style={{
                    ...styles.industryBtn,
                    ...(formData.industry === ind.key ? styles.industryBtnActive : {})
                  }}
                >
                  <span style={styles.industryIcon}>{ind.icon}</span>
                  <span>{ind.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Page Tier */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Pages</h2>
            <div style={styles.tierGrid}>
              {PAGE_TIERS.map(tier => (
                <button
                  key={tier.key}
                  onClick={() => updateForm({ tier: tier.key })}
                  style={{
                    ...styles.tierBtn,
                    ...(formData.tier === tier.key ? styles.tierBtnActive : {})
                  }}
                >
                  <strong>{tier.label}</strong>
                  <span style={styles.tierPages}>{tier.pages}</span>
                  <span style={styles.tierDesc}>{tier.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Portal */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Member Portal</h2>
            <div style={styles.portalGrid}>
              {PORTAL_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => updateForm({ portal: opt.key })}
                  style={{
                    ...styles.portalBtn,
                    ...(formData.portal === opt.key ? styles.portalBtnActive : {})
                  }}
                >
                  <strong>{opt.label}</strong>
                  {opt.desc && <span style={styles.portalDesc}>{opt.desc}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Companion App */}
          <div style={styles.section}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.companion}
                onChange={e => updateForm({ companion: e.target.checked })}
                style={styles.checkbox}
              />
              <span>Generate Companion App</span>
            </label>
          </div>

          {/* Theme */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Theme</h2>
            <div style={styles.colorRow}>
              <div style={styles.colorField}>
                <label style={styles.label}>Primary</label>
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={e => updateForm({ primaryColor: e.target.value })}
                  style={styles.colorInput}
                />
              </div>
              <div style={styles.colorField}>
                <label style={styles.label}>Accent</label>
                <input
                  type="color"
                  value={formData.accentColor}
                  onChange={e => updateForm({ accentColor: e.target.value })}
                  style={styles.colorInput}
                />
              </div>
            </div>

            <div style={styles.sliderField}>
              <label style={styles.label}>Vibe: {formData.vibe}</label>
              <div style={styles.sliderRow}>
                <span>Professional</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.vibe}
                  onChange={e => updateForm({ vibe: parseInt(e.target.value) })}
                  style={styles.slider}
                />
                <span>Playful</span>
              </div>
            </div>

            <div style={styles.sliderField}>
              <label style={styles.label}>Energy: {formData.energy}</label>
              <div style={styles.sliderRow}>
                <span>Calm</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.energy}
                  onChange={e => updateForm({ energy: parseInt(e.target.value) })}
                  style={styles.slider}
                />
                <span>Energetic</span>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={generating || !formData.name.trim()}
            style={{
              ...styles.generateBtn,
              ...(generating ? styles.btnDisabled : {})
            }}
          >
            {generating ? '⏳ Generating...' : '🚀 Generate'}
          </button>

          {/* Error */}
          {error && (
            <div style={styles.error}>{error}</div>
          )}

          {/* Result */}
          {result && (
            <div style={styles.result}>
              <h3>✅ Generated!</h3>
              <div style={styles.resultInfo}>
                <div><strong>Project:</strong> {result.projectName || result.projectId}</div>
                <div><strong>Pages:</strong> {result.pages?.length || '?'}</div>
                {result.deployUrl && (
                  <div>
                    <strong>URL:</strong>{' '}
                    <a href={result.deployUrl} target="_blank" rel="noreferrer">{result.deployUrl}</a>
                  </div>
                )}
              </div>
              <div style={styles.resultActions}>
                {!result.deployed && (
                  <button
                    onClick={() => handleDeploy()}
                    disabled={deploying}
                    style={styles.deployBtn}
                  >
                    {deploying ? 'Deploying...' : '🌐 Deploy'}
                  </button>
                )}
                <button
                  onClick={() => handleDelete(result.projectId)}
                  style={styles.deleteBtn}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Recent Projects */}
        <div style={styles.projectsPanel}>
          <h2 style={styles.sectionTitle}>Recent Generations</h2>

          {loadingProjects ? (
            <div style={styles.loading}>Loading...</div>
          ) : recentProjects.length === 0 ? (
            <div style={styles.empty}>No projects yet</div>
          ) : (
            <div style={styles.projectList}>
              {recentProjects.map(project => (
                <div key={project.id} style={styles.projectCard}>
                  <div style={styles.projectInfo}>
                    <strong style={{ color: '#fff' }}>{project.name}</strong>
                    <span style={styles.projectMeta}>
                      {project.industry} • {project.status}
                    </span>
                    <span style={styles.projectDate}>
                      {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div style={styles.projectActions}>
                    {project.deployedUrl ? (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <a href={project.deployedUrl} target="_blank" rel="noreferrer" style={styles.linkBtn} title="Site">🌐</a>
                        {project.adminUrl && <a href={project.adminUrl} target="_blank" rel="noreferrer" style={styles.linkBtn} title="Admin">📊</a>}
                        {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noreferrer" style={styles.linkBtn} title="GitHub">🐙</a>}
                      </div>
                    ) : (
                      <span style={{ color: '#6b7280', fontSize: '11px' }}>Not deployed</span>
                    )}
                    <button
                      onClick={() => handleDelete(project.id)}
                      style={styles.smallDeleteBtn}
                      title="Delete from everywhere"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={loadRecentProjects}
            style={styles.refreshBtn}
          >
            🔄 Refresh
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '24px',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#f0f0f0',
    margin: 0
  },
  subtitle: {
    color: '#888',
    margin: '4px 0 0 0'
  },
  modeToggle: {
    display: 'flex',
    gap: '8px',
    background: 'rgba(255,255,255,0.05)',
    padding: '4px',
    borderRadius: '8px'
  },
  modeBtn: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    background: 'transparent',
    color: '#888',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  modeBtnActiveTest: {
    background: 'rgba(245, 158, 11, 0.2)',
    color: '#fbbf24'
  },
  modeBtnActiveProd: {
    background: 'rgba(34, 197, 94, 0.2)',
    color: '#22c55e'
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 350px',
    gap: '24px'
  },
  formPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  section: {
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid rgba(255,255,255,0.06)'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#e0e0e0',
    margin: 0
  },
  exampleBtn: {
    padding: '6px 12px',
    background: 'rgba(99, 102, 241, 0.2)',
    border: 'none',
    borderRadius: '6px',
    color: '#a5b4fc',
    fontSize: '12px',
    cursor: 'pointer'
  },
  field: {
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    fontSize: '13px',
    color: '#aaa',
    marginBottom: '6px'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none'
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    resize: 'vertical'
  },
  industryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: '8px'
  },
  industryBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '12px 8px',
    background: 'rgba(0,0,0,0.2)',
    border: '2px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#aaa',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  industryBtnActive: {
    borderColor: '#6366f1',
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#fff'
  },
  industryIcon: {
    fontSize: '20px'
  },
  tierGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px'
  },
  tierBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '16px 12px',
    background: 'rgba(0,0,0,0.2)',
    border: '2px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: '#ccc',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'center'
  },
  tierBtnActive: {
    borderColor: '#6366f1',
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#fff'
  },
  tierPages: {
    fontSize: '11px',
    color: '#888'
  },
  tierDesc: {
    fontSize: '10px',
    color: '#666',
    marginTop: '4px'
  },
  portalGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px'
  },
  portalBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '14px 12px',
    background: 'rgba(0,0,0,0.2)',
    border: '2px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: '#ccc',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  portalBtnActive: {
    borderColor: '#6366f1',
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#fff'
  },
  portalDesc: {
    fontSize: '10px',
    color: '#888'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#ccc',
    cursor: 'pointer'
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer'
  },
  colorRow: {
    display: 'flex',
    gap: '24px',
    marginBottom: '16px'
  },
  colorField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  colorInput: {
    width: '60px',
    height: '40px',
    border: '2px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    cursor: 'pointer',
    background: 'transparent'
  },
  sliderField: {
    marginBottom: '16px'
  },
  sliderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '11px',
    color: '#888'
  },
  slider: {
    flex: 1,
    height: '6px',
    cursor: 'pointer',
    accentColor: '#6366f1'
  },
  generateBtn: {
    padding: '16px 24px',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  btnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  error: {
    padding: '12px 16px',
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    color: '#f87171'
  },
  result: {
    padding: '16px',
    background: 'rgba(34, 197, 94, 0.1)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    borderRadius: '10px'
  },
  resultInfo: {
    margin: '12px 0',
    fontSize: '14px',
    color: '#ccc',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  resultActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '12px'
  },
  deployBtn: {
    padding: '8px 16px',
    background: '#22c55e',
    border: 'none',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '14px',
    cursor: 'pointer'
  },
  deleteBtn: {
    padding: '8px 16px',
    background: 'rgba(239, 68, 68, 0.2)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '6px',
    color: '#f87171',
    fontSize: '14px',
    cursor: 'pointer'
  },
  projectsPanel: {
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid rgba(255,255,255,0.06)',
    height: 'fit-content'
  },
  loading: {
    color: '#888',
    textAlign: 'center',
    padding: '40px 0'
  },
  empty: {
    color: '#666',
    textAlign: 'center',
    padding: '40px 0'
  },
  projectList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '16px'
  },
  projectCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.06)'
  },
  projectInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  projectMeta: {
    fontSize: '12px',
    color: '#888'
  },
  projectDate: {
    fontSize: '11px',
    color: '#666'
  },
  projectActions: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center'
  },
  viewBtn: {
    padding: '6px 12px',
    background: 'rgba(99, 102, 241, 0.2)',
    borderRadius: '6px',
    color: '#a5b4fc',
    fontSize: '12px',
    textDecoration: 'none'
  },
  smallDeployBtn: {
    padding: '6px 12px',
    background: 'rgba(34, 197, 94, 0.2)',
    border: 'none',
    borderRadius: '6px',
    color: '#22c55e',
    fontSize: '12px',
    cursor: 'pointer'
  },
  smallDeleteBtn: {
    padding: '4px 8px',
    background: 'rgba(220,38,38,0.2)',
    border: 'none',
    borderRadius: '4px',
    color: '#ef4444',
    fontSize: '14px',
    cursor: 'pointer'
  },
  linkBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '4px',
    textDecoration: 'none',
    fontSize: '12px'
  },
  refreshBtn: {
    width: '100%',
    padding: '10px',
    background: 'rgba(255,255,255,0.05)',
    border: 'none',
    borderRadius: '8px',
    color: '#888',
    fontSize: '13px',
    cursor: 'pointer',
    marginTop: '16px'
  }
};
