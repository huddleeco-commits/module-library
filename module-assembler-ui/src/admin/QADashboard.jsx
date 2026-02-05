/**
 * QA Dashboard - Industry Showcase & Testing Suite
 *
 * Features:
 * - Generate all 19 industries at once
 * - Side-by-side comparison viewer
 * - Issue flagging with severity levels
 * - Export audit report for Claude
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Play, RefreshCw, AlertCircle, CheckCircle, Clock, ExternalLink,
  ChevronRight, Flag, FileText, Download, Eye, EyeOff, X,
  Monitor, Settings, Server, Loader, AlertTriangle, Check, Square,
  Maximize2, Minimize2, LayoutGrid
} from 'lucide-react';

const API_BASE = '/api/qa-suite';
const PREVIEW_API = '/api/qa-preview';

// Industry categories for sidebar grouping
const CATEGORIES = {
  food: { label: 'Food & Beverage', icon: '🍽️' },
  services: { label: 'Personal Services', icon: '💆' },
  professional: { label: 'Professional', icon: '💼' },
  trade: { label: 'Trade Services', icon: '🔧' },
  tech: { label: 'Business & Tech', icon: '💻' }
};

// View types
const VIEWS = {
  customer: { label: 'Customer Site', icon: Monitor, color: '#3b82f6' },
  admin: { label: 'Admin Dashboard', icon: Settings, color: '#8b5cf6' },
  backend: { label: 'Backend API', icon: Server, color: '#10b981' }
};

export default function QADashboard() {
  // State
  const [industries, setIndustries] = useState({ grouped: {}, industries: [] });
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [selectedView, setSelectedView] = useState('customer');
  const [batchStatus, setBatchStatus] = useState(null);
  const [issues, setIssues] = useState([]);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null);

  // Preview server state
  const [runningServers, setRunningServers] = useState({});
  const [startingPreview, setStartingPreview] = useState(null);
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [showAllServers, setShowAllServers] = useState(false);
  const [startingAll, setStartingAll] = useState(false);
  const [gridViewMode, setGridViewMode] = useState(false); // Grid view for all previews

  // Fetch industries on mount
  const fetchIndustries = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/industries`);
      const data = await res.json();
      if (data.success) {
        setIndustries(data);
        // Auto-select first generated industry
        if (!selectedIndustry && data.industries?.length) {
          const firstGenerated = data.industries.find(i => i.generated);
          if (firstGenerated) setSelectedIndustry(firstGenerated.id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch industries:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedIndustry]);

  // Fetch issues
  const fetchIssues = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/issues`);
      const data = await res.json();
      if (data.success) setIssues(data.issues);
    } catch (err) {
      console.error('Failed to fetch issues:', err);
    }
  }, []);

  // Fetch batch status
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/status`);
      const data = await res.json();
      if (data.success) setBatchStatus(data.status);
    } catch (err) {
      console.error('Failed to fetch status:', err);
    }
  }, []);

  // Fetch running preview servers
  const fetchPreviewServers = useCallback(async () => {
    try {
      const res = await fetch(`${PREVIEW_API}/status`);
      const data = await res.json();
      if (data.success) setRunningServers(data.servers);
    } catch (err) {
      console.error('Failed to fetch preview servers:', err);
    }
  }, []);

  // Start a preview server
  const startPreview = async (industry, view) => {
    setStartingPreview(`${industry}-${view}`);
    try {
      const res = await fetch(`${PREVIEW_API}/start/${industry}/${view}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await fetchPreviewServers();
        // If static site, handle differently
        if (data.staticUrl) {
          alert(`Static site available at: ${data.staticUrl}`);
        }
      } else {
        alert(data.error || 'Failed to start preview');
      }
    } catch (err) {
      alert('Failed to start preview: ' + err.message);
    } finally {
      setStartingPreview(null);
    }
  };

  // Stop a preview server
  const stopPreview = async (industry, view) => {
    try {
      const res = await fetch(`${PREVIEW_API}/stop/${industry}/${view}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await fetchPreviewServers();
      }
    } catch (err) {
      console.error('Failed to stop preview:', err);
    }
  };

  // Stop all preview servers
  const stopAllPreviews = async () => {
    try {
      const res = await fetch(`${PREVIEW_API}/stop-all`, { method: 'POST' });
      await res.json();
      await fetchPreviewServers();
    } catch (err) {
      console.error('Failed to stop all previews:', err);
    }
  };

  // Start ALL preview servers for all generated industries
  const startAllPreviews = async (views = ['customer', 'admin']) => {
    setStartingAll(true);
    try {
      const res = await fetch(`${PREVIEW_API}/start-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ views })
      });
      const data = await res.json();
      if (data.success) {
        await fetchPreviewServers();
        // Auto-switch to grid view when starting all
        if (data.started.length > 1) {
          setGridViewMode(true);
        }
        alert(`Started ${data.started.length} previews. ${data.skipped.length} skipped, ${data.failed.length} failed.`);
      }
    } catch (err) {
      alert('Failed to start all previews: ' + err.message);
    } finally {
      setStartingAll(false);
    }
  };

  // Get current preview URL if running
  const getCurrentPreviewUrl = () => {
    const key = `${selectedIndustry}-${selectedView}`;
    return runningServers[key]?.url || null;
  };

  useEffect(() => {
    fetchIndustries();
    fetchIssues();
    fetchStatus();
    fetchPreviewServers();

    // Poll status while batch is running
    const interval = setInterval(() => {
      fetchStatus();
      fetchPreviewServers();
      if (batchStatus?.running) fetchIndustries();
    }, 2000);

    return () => clearInterval(interval);
  }, [fetchIndustries, fetchIssues, fetchStatus, fetchPreviewServers, batchStatus?.running]);

  // Generate all industries
  const handleGenerateAll = async (force = false) => {
    try {
      const res = await fetch(`${API_BASE}/generate-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force })
      });
      const data = await res.json();
      if (data.success) {
        setBatchStatus(data.status);
      } else {
        alert(data.error || 'Failed to start batch generation');
      }
    } catch (err) {
      alert('Failed to start generation: ' + err.message);
    }
  };

  // Generate single industry
  const handleGenerateSingle = async (id) => {
    setGenerating(id);
    try {
      const res = await fetch(`${API_BASE}/generate/${id}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        fetchIndustries();
        setSelectedIndustry(id);
      } else {
        alert(data.error || 'Failed to generate');
      }
    } catch (err) {
      alert('Failed: ' + err.message);
    } finally {
      setGenerating(null);
    }
  };

  // Flag an issue
  const handleFlagIssue = async (issueData) => {
    try {
      const res = await fetch(`${API_BASE}/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: selectedIndustry,
          view: selectedView,
          ...issueData
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchIssues();
        fetchIndustries();
        setShowIssueModal(false);
      }
    } catch (err) {
      alert('Failed to flag issue: ' + err.message);
    }
  };

  // Export audit report
  const handleExportReport = async () => {
    try {
      const res = await fetch(`${API_BASE}/audit-report`);
      const text = await res.text();

      // Copy to clipboard
      await navigator.clipboard.writeText(text);
      alert('Audit report copied to clipboard! Paste it to Claude for analysis.');
    } catch (err) {
      // Fallback: open in new window
      window.open(`${API_BASE}/audit-report`, '_blank');
    }
  };

  // Get selected industry data
  const selected = industries.industries?.find(i => i.id === selectedIndustry);

  // Get issues for selected industry
  const industryIssues = issues.filter(i => i.industry === selectedIndustry);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} />
        <p>Loading QA Dashboard...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>QA Dashboard</h1>
          <p style={styles.subtitle}>
            {industries.generated}/{industries.total} industries generated
            {issues.filter(i => i.status !== 'resolved').length > 0 &&
              ` • ${issues.filter(i => i.status !== 'resolved').length} open issues`
            }
          </p>
        </div>
        <div style={styles.headerActions}>
          <button
            onClick={() => handleGenerateAll(false)}
            disabled={batchStatus?.running}
            style={{
              ...styles.button,
              ...styles.primaryButton,
              opacity: batchStatus?.running ? 0.6 : 1
            }}
          >
            {batchStatus?.running ? (
              <>
                <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Generating {batchStatus.current}...
              </>
            ) : (
              <>
                <Play size={16} />
                Generate All
              </>
            )}
          </button>
          <button
            onClick={() => startAllPreviews(['customer', 'admin'])}
            disabled={startingAll || industries.generated === 0}
            style={{
              ...styles.button,
              ...styles.successButton,
              opacity: startingAll ? 0.6 : 1
            }}
          >
            {startingAll ? (
              <>
                <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Starting All...
              </>
            ) : (
              <>
                <LayoutGrid size={16} />
                Start All Previews
              </>
            )}
          </button>
          {Object.keys(runningServers).length > 0 && (
            <button
              onClick={() => setGridViewMode(!gridViewMode)}
              style={{
                ...styles.button,
                ...(gridViewMode ? styles.activeButton : {})
              }}
            >
              <LayoutGrid size={16} />
              {gridViewMode ? 'Single View' : 'Grid View'} ({Object.keys(runningServers).length})
            </button>
          )}
          <button onClick={handleExportReport} style={styles.button}>
            <Download size={16} />
            Export Report
          </button>
        </div>
      </header>

      {/* Grid View Mode - Shows all running previews */}
      {gridViewMode && Object.keys(runningServers).length > 0 ? (
        <div style={styles.gridViewContainer}>
          <div style={styles.gridViewHeader}>
            <h2 style={styles.gridViewTitle}>
              <LayoutGrid size={24} />
              All Running Previews ({Object.keys(runningServers).length})
            </h2>
            <div style={styles.gridViewActions}>
              <button
                onClick={stopAllPreviews}
                style={{ ...styles.button, ...styles.dangerButton }}
              >
                <Square size={16} />
                Stop All
              </button>
              <button
                onClick={() => setGridViewMode(false)}
                style={styles.button}
              >
                <X size={16} />
                Exit Grid View
              </button>
            </div>
          </div>
          <div style={styles.previewGrid}>
            {Object.entries(runningServers).map(([key, server]) => (
              <div key={key} style={styles.gridPreviewCard}>
                <div style={styles.gridPreviewHeader}>
                  <span style={styles.gridPreviewTitle}>
                    {server.industry}
                    <span style={styles.gridPreviewView}>{server.view}</span>
                  </span>
                  <div style={styles.gridPreviewActions}>
                    <a
                      href={server.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.smallButton}
                      title="Open in new tab"
                    >
                      <ExternalLink size={14} />
                    </a>
                    <button
                      onClick={() => stopPreview(server.industry, server.view)}
                      style={{ ...styles.smallButton, color: '#ef4444' }}
                      title="Stop"
                    >
                      <Square size={14} />
                    </button>
                  </div>
                </div>
                <iframe
                  src={server.url}
                  style={styles.gridPreviewIframe}
                  title={`${server.industry} ${server.view}`}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
      <div style={styles.main}>
        {/* Sidebar - Industry List */}
        <aside style={styles.sidebar}>
          {Object.entries(CATEGORIES).map(([catKey, cat]) => (
            <div key={catKey} style={styles.category}>
              <h3 style={styles.categoryTitle}>{cat.icon} {cat.label}</h3>
              {industries.grouped?.[catKey]?.map(industry => (
                <button
                  key={industry.id}
                  onClick={() => setSelectedIndustry(industry.id)}
                  style={{
                    ...styles.industryItem,
                    ...(selectedIndustry === industry.id ? styles.industryItemActive : {})
                  }}
                >
                  <div style={styles.industryInfo}>
                    <span style={styles.industryName}>{industry.name}</span>
                    <span style={styles.industryLocation}>{industry.location}</span>
                  </div>
                  <div style={styles.industryStatus}>
                    {industry.generated ? (
                      <CheckCircle size={14} color="#22c55e" />
                    ) : generating === industry.id ? (
                      <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
                    ) : (
                      <Clock size={14} color="#94a3b8" />
                    )}
                    {industry.issueCount > 0 && (
                      <span style={styles.issueBadge}>{industry.issueCount}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ))}
        </aside>

        {/* Main Content */}
        <main style={styles.content}>
          {selected ? (
            <>
              {/* Industry Header */}
              <div style={styles.industryHeader}>
                <div>
                  <h2 style={styles.industryTitle}>{selected.name}</h2>
                  <p style={styles.industryMeta}>
                    {selected.location} • Modules: {selected.modules?.join(', ')}
                  </p>
                </div>
                <div style={styles.industryActions}>
                  {!selected.generated ? (
                    <button
                      onClick={() => handleGenerateSingle(selected.id)}
                      disabled={generating === selected.id}
                      style={{ ...styles.button, ...styles.primaryButton }}
                    >
                      {generating === selected.id ? (
                        <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Generating...</>
                      ) : (
                        <><Play size={16} /> Generate</>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleGenerateSingle(selected.id)}
                      style={styles.button}
                    >
                      <RefreshCw size={16} />
                      Regenerate
                    </button>
                  )}
                  <button
                    onClick={() => setShowIssueModal(true)}
                    style={{ ...styles.button, ...styles.dangerButton }}
                  >
                    <Flag size={16} />
                    Flag Issue
                  </button>
                </div>
              </div>

              {/* View Tabs */}
              <div style={styles.viewTabs}>
                {Object.entries(VIEWS).map(([key, view]) => {
                  const Icon = view.icon;
                  const available = selected[`has${key.charAt(0).toUpperCase() + key.slice(1)}`];
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedView(key)}
                      disabled={!available}
                      style={{
                        ...styles.viewTab,
                        ...(selectedView === key ? { ...styles.viewTabActive, borderColor: view.color, color: view.color } : {}),
                        opacity: available ? 1 : 0.4
                      }}
                    >
                      <Icon size={18} />
                      {view.label}
                      {!available && <span style={styles.notGenerated}>Not generated</span>}
                    </button>
                  );
                })}
              </div>

              {/* Preview Area */}
              <div style={{
                ...styles.previewContainer,
                ...(previewExpanded ? styles.previewExpanded : {})
              }}>
                {selected.generated ? (
                  getCurrentPreviewUrl() ? (
                    // Live preview iframe
                    <div style={styles.livePreview}>
                      <div style={styles.previewToolbar}>
                        <div style={styles.previewInfo}>
                          <span style={styles.previewLive}>● LIVE</span>
                          <span>{selected.name} - {VIEWS[selectedView]?.label}</span>
                          <a
                            href={getCurrentPreviewUrl()}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={styles.previewLink}
                          >
                            <ExternalLink size={14} />
                            Open in new tab
                          </a>
                        </div>
                        <div style={styles.previewActions}>
                          <button
                            onClick={() => setPreviewExpanded(!previewExpanded)}
                            style={styles.iconButton}
                            title={previewExpanded ? 'Minimize' : 'Maximize'}
                          >
                            {previewExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                          </button>
                          <button
                            onClick={() => stopPreview(selectedIndustry, selectedView)}
                            style={{ ...styles.iconButton, color: '#ef4444' }}
                            title="Stop preview"
                          >
                            <Square size={16} />
                          </button>
                        </div>
                      </div>
                      <iframe
                        src={getCurrentPreviewUrl()}
                        style={styles.previewIframe}
                        title={`${selected.name} Preview`}
                      />
                    </div>
                  ) : (
                    // Not running - show start button
                    <div style={styles.previewPlaceholder}>
                      <Monitor size={48} color="#64748b" />
                      <h3>Preview: {selected.name}</h3>
                      <p style={styles.previewPath}>
                        View: {VIEWS[selectedView]?.label}
                      </p>
                      <button
                        onClick={() => startPreview(selectedIndustry, selectedView)}
                        disabled={startingPreview === `${selectedIndustry}-${selectedView}`}
                        style={{
                          ...styles.button,
                          ...styles.primaryButton,
                          marginTop: 16
                        }}
                      >
                        {startingPreview === `${selectedIndustry}-${selectedView}` ? (
                          <>
                            <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                            Starting...
                          </>
                        ) : (
                          <>
                            <Play size={16} />
                            Start Live Preview
                          </>
                        )}
                      </button>
                      <p style={styles.previewNote}>
                        Or run manually:
                      </p>
                      <code style={styles.codeBlock}>
                        cd output/qa-suite/sites/{selected.id}/{selectedView === 'customer' ? 'frontend' : selectedView}
                        {'\n'}npm install && npm run dev
                      </code>
                    </div>
                  )
                ) : (
                  <div style={styles.previewPlaceholder}>
                    <AlertCircle size={48} color="#f59e0b" />
                    <h3>Not Generated Yet</h3>
                    <p>Click "Generate" to create this industry's sites</p>
                  </div>
                )}
              </div>

              {/* Running Servers Panel */}
              {Object.keys(runningServers).length > 0 && (
                <div style={styles.serversPanel}>
                  <div
                    style={styles.serversPanelHeader}
                    onClick={() => setShowAllServers(!showAllServers)}
                  >
                    <div style={styles.serversPanelTitle}>
                      <LayoutGrid size={16} />
                      <span>{Object.keys(runningServers).length} Preview{Object.keys(runningServers).length > 1 ? 's' : ''} Running</span>
                    </div>
                    <div style={styles.serversPanelActions}>
                      <button
                        onClick={(e) => { e.stopPropagation(); stopAllPreviews(); }}
                        style={{ ...styles.smallButton, color: '#ef4444' }}
                      >
                        Stop All
                      </button>
                      <ChevronRight
                        size={16}
                        style={{
                          transform: showAllServers ? 'rotate(90deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s'
                        }}
                      />
                    </div>
                  </div>
                  {showAllServers && (
                    <div style={styles.serversList}>
                      {Object.entries(runningServers).map(([key, server]) => (
                        <div key={key} style={styles.serverItem}>
                          <div style={styles.serverInfo}>
                            <span style={styles.serverName}>{server.industry} / {server.view}</span>
                            <a
                              href={server.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={styles.serverUrl}
                            >
                              {server.url}
                            </a>
                          </div>
                          <div style={styles.serverActions}>
                            <button
                              onClick={() => {
                                setSelectedIndustry(server.industry);
                                setSelectedView(server.view);
                              }}
                              style={styles.smallButton}
                            >
                              <Eye size={14} />
                            </button>
                            <a
                              href={server.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={styles.smallButton}
                            >
                              <ExternalLink size={14} />
                            </a>
                            <button
                              onClick={() => stopPreview(server.industry, server.view)}
                              style={{ ...styles.smallButton, color: '#ef4444' }}
                            >
                              <Square size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Issues for this industry */}
              {industryIssues.length > 0 && (
                <div style={styles.issuesSection}>
                  <h3 style={styles.issuesSectionTitle}>
                    <AlertTriangle size={18} />
                    Issues ({industryIssues.length})
                  </h3>
                  <div style={styles.issuesList}>
                    {industryIssues.map(issue => (
                      <div key={issue.id} style={styles.issueCard}>
                        <div style={styles.issueHeader}>
                          <span style={{
                            ...styles.severityBadge,
                            background: issue.severity >= 4 ? '#fee2e2' : issue.severity >= 3 ? '#fef3c7' : '#dcfce7',
                            color: issue.severity >= 4 ? '#dc2626' : issue.severity >= 3 ? '#d97706' : '#16a34a'
                          }}>
                            {issue.severity}/5
                          </span>
                          <span style={styles.issueView}>{issue.view}/{issue.page}</span>
                        </div>
                        <h4 style={styles.issueTitle}>{issue.title}</h4>
                        {issue.description && (
                          <p style={styles.issueDescription}>{issue.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={styles.noSelection}>
              <Eye size={48} color="#64748b" />
              <h3>Select an Industry</h3>
              <p>Choose an industry from the sidebar to view or generate</p>
            </div>
          )}
        </main>
      </div>
      )}

      {/* Issue Modal */}
      {showIssueModal && (
        <IssueModal
          industry={selectedIndustry}
          view={selectedView}
          onSubmit={handleFlagIssue}
          onClose={() => setShowIssueModal(false)}
        />
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

// Issue Modal Component
function IssueModal({ industry, view, onSubmit, onClose }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [page, setPage] = useState('');
  const [severity, setSeverity] = useState(3);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return alert('Title is required');
    onSubmit({ title, description, page, severity });
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2>Flag Issue</h2>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} style={styles.modalBody}>
          <div style={styles.formGroup}>
            <label>Industry</label>
            <input value={industry} disabled style={styles.input} />
          </div>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label>View</label>
              <input value={view} disabled style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label>Page/Component</label>
              <input
                value={page}
                onChange={e => setPage(e.target.value)}
                placeholder="e.g., DashboardHome, Sidebar"
                style={styles.input}
              />
            </div>
          </div>
          <div style={styles.formGroup}>
            <label>Issue Title *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Brief description of the issue"
              style={styles.input}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label>Details</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Steps to reproduce, expected behavior, etc."
              style={{ ...styles.input, minHeight: 80, resize: 'vertical' }}
            />
          </div>
          <div style={styles.formGroup}>
            <label>Severity: {severity}/5</label>
            <input
              type="range"
              min="1"
              max="5"
              value={severity}
              onChange={e => setSeverity(parseInt(e.target.value))}
              style={styles.rangeInput}
            />
            <div style={styles.severityLabels}>
              <span>Minor</span>
              <span>Critical</span>
            </div>
          </div>
          <div style={styles.modalActions}>
            <button type="button" onClick={onClose} style={styles.button}>
              Cancel
            </button>
            <button type="submit" style={{ ...styles.button, ...styles.dangerButton }}>
              <Flag size={16} />
              Flag Issue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Styles
const styles = {
  container: {
    minHeight: '100vh',
    background: '#0f172a',
    color: '#e2e8f0'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: 16
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #1e293b',
    background: '#1e293b'
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    margin: 0
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    margin: '4px 0 0'
  },
  headerActions: {
    display: 'flex',
    gap: 12
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 16px',
    border: '1px solid #334155',
    borderRadius: 8,
    background: '#1e293b',
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  primaryButton: {
    background: '#3b82f6',
    borderColor: '#3b82f6',
    color: '#fff'
  },
  dangerButton: {
    background: '#dc2626',
    borderColor: '#dc2626',
    color: '#fff'
  },
  main: {
    display: 'flex',
    height: 'calc(100vh - 81px)'
  },
  sidebar: {
    width: 280,
    borderRight: '1px solid #1e293b',
    overflowY: 'auto',
    padding: '16px 0'
  },
  category: {
    marginBottom: 16
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: '#64748b',
    padding: '8px 16px',
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  industryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: '12px 16px',
    border: 'none',
    background: 'transparent',
    color: '#e2e8f0',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  industryItemActive: {
    background: '#1e293b',
    borderLeft: '3px solid #3b82f6'
  },
  industryInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2
  },
  industryName: {
    fontSize: 14,
    fontWeight: 500
  },
  industryLocation: {
    fontSize: 12,
    color: '#64748b'
  },
  industryStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: 8
  },
  issueBadge: {
    background: '#dc2626',
    color: '#fff',
    fontSize: 10,
    fontWeight: 600,
    padding: '2px 6px',
    borderRadius: 10
  },
  content: {
    flex: 1,
    padding: 24,
    overflowY: 'auto'
  },
  industryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24
  },
  industryTitle: {
    fontSize: 28,
    fontWeight: 700,
    margin: 0
  },
  industryMeta: {
    fontSize: 14,
    color: '#94a3b8',
    margin: '4px 0 0'
  },
  industryActions: {
    display: 'flex',
    gap: 12
  },
  viewTabs: {
    display: 'flex',
    gap: 12,
    marginBottom: 24
  },
  viewTab: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 20px',
    border: '2px solid #334155',
    borderRadius: 8,
    background: 'transparent',
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  viewTabActive: {
    background: '#1e293b',
    color: '#fff'
  },
  notGenerated: {
    fontSize: 10,
    color: '#64748b',
    marginLeft: 4
  },
  previewContainer: {
    background: '#1e293b',
    borderRadius: 12,
    minHeight: 500,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  previewExpanded: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 900,
    borderRadius: 0,
    margin: 0
  },
  livePreview: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  previewToolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    background: '#0f172a',
    borderBottom: '1px solid #334155'
  },
  previewInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontSize: 13
  },
  previewLive: {
    color: '#22c55e',
    fontWeight: 600,
    animation: 'pulse 2s infinite'
  },
  previewLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    color: '#60a5fa',
    textDecoration: 'none',
    fontSize: 12
  },
  previewActions: {
    display: 'flex',
    gap: 4
  },
  iconButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    background: 'transparent',
    border: '1px solid #334155',
    borderRadius: 6,
    color: '#94a3b8',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  previewIframe: {
    flex: 1,
    width: '100%',
    border: 'none',
    background: '#fff'
  },
  previewPlaceholder: {
    textAlign: 'center',
    padding: 40
  },
  previewPath: {
    color: '#94a3b8',
    margin: '8px 0'
  },
  previewNote: {
    color: '#64748b',
    fontSize: 14,
    margin: '16px 0 8px'
  },
  codeBlock: {
    display: 'block',
    background: '#0f172a',
    padding: 16,
    borderRadius: 8,
    fontSize: 13,
    fontFamily: 'monospace',
    color: '#22d3ee',
    textAlign: 'left',
    whiteSpace: 'pre'
  },
  noSelection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    textAlign: 'center',
    color: '#64748b'
  },
  issuesSection: {
    marginTop: 24
  },
  issuesSectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 12,
    color: '#f59e0b'
  },
  issuesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },
  issueCard: {
    background: '#1e293b',
    borderRadius: 8,
    padding: 16,
    borderLeft: '3px solid #f59e0b'
  },
  issueHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8
  },
  severityBadge: {
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 600
  },
  issueView: {
    fontSize: 12,
    color: '#64748b'
  },
  issueTitle: {
    fontSize: 14,
    fontWeight: 600,
    margin: 0
  },
  issueDescription: {
    fontSize: 13,
    color: '#94a3b8',
    margin: '8px 0 0'
  },
  // Modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    background: '#1e293b',
    borderRadius: 12,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90vh',
    overflow: 'auto'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #334155'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: 4
  },
  modalBody: {
    padding: 20
  },
  formGroup: {
    marginBottom: 16
  },
  formRow: {
    display: 'flex',
    gap: 16
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: 6,
    color: '#e2e8f0',
    fontSize: 14,
    marginTop: 6
  },
  rangeInput: {
    width: '100%',
    marginTop: 8
  },
  severityLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 12,
    color: '#64748b'
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20
  },
  // Running servers panel styles
  serversPanel: {
    marginTop: 16,
    background: '#1e293b',
    borderRadius: 8,
    border: '1px solid #334155'
  },
  serversPanelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  serversPanelTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 14,
    fontWeight: 500
  },
  serversPanelActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 8
  },
  serversList: {
    borderTop: '1px solid #334155'
  },
  serverItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 16px',
    borderBottom: '1px solid #334155'
  },
  serverInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2
  },
  serverName: {
    fontSize: 13,
    fontWeight: 500
  },
  serverUrl: {
    fontSize: 12,
    color: '#60a5fa',
    textDecoration: 'none'
  },
  serverActions: {
    display: 'flex',
    gap: 4
  },
  smallButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px 10px',
    background: 'transparent',
    border: '1px solid #334155',
    borderRadius: 4,
    color: '#94a3b8',
    fontSize: 12,
    cursor: 'pointer',
    textDecoration: 'none'
  },
  // New button styles
  successButton: {
    background: '#22c55e',
    borderColor: '#22c55e',
    color: '#fff'
  },
  activeButton: {
    background: '#3b82f6',
    borderColor: '#3b82f6',
    color: '#fff'
  },
  // Grid view styles
  gridViewContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  gridViewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    borderBottom: '1px solid #1e293b',
    background: '#0f172a'
  },
  gridViewTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontSize: 20,
    fontWeight: 600,
    margin: 0
  },
  gridViewActions: {
    display: 'flex',
    gap: 12
  },
  previewGrid: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: 16,
    padding: 16,
    overflow: 'auto',
    background: '#0f172a'
  },
  gridPreviewCard: {
    display: 'flex',
    flexDirection: 'column',
    background: '#1e293b',
    borderRadius: 8,
    overflow: 'hidden',
    border: '1px solid #334155'
  },
  gridPreviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    background: '#0f172a',
    borderBottom: '1px solid #334155'
  },
  gridPreviewTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    fontWeight: 600
  },
  gridPreviewView: {
    fontSize: 11,
    color: '#94a3b8',
    background: '#334155',
    padding: '2px 6px',
    borderRadius: 4
  },
  gridPreviewActions: {
    display: 'flex',
    gap: 4
  },
  gridPreviewIframe: {
    width: '100%',
    height: 300,
    border: 'none',
    background: '#fff'
  }
};
