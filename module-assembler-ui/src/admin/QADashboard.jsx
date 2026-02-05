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
  Monitor, Settings, Server, Loader, AlertTriangle, Check
} from 'lucide-react';

const API_BASE = '/api/qa-suite';

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
  const [previewUrl, setPreviewUrl] = useState(null);
  const [generating, setGenerating] = useState(null);

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

  useEffect(() => {
    fetchIndustries();
    fetchIssues();
    fetchStatus();

    // Poll status while batch is running
    const interval = setInterval(() => {
      fetchStatus();
      if (batchStatus?.running) fetchIndustries();
    }, 2000);

    return () => clearInterval(interval);
  }, [fetchIndustries, fetchIssues, fetchStatus, batchStatus?.running]);

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
          <button onClick={handleExportReport} style={styles.button}>
            <Download size={16} />
            Export Report
          </button>
        </div>
      </header>

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
              <div style={styles.previewContainer}>
                {selected.generated ? (
                  <div style={styles.previewPlaceholder}>
                    <Monitor size={48} color="#64748b" />
                    <h3>Preview: {selected.name}</h3>
                    <p style={styles.previewPath}>
                      View: {VIEWS[selectedView]?.label}
                    </p>
                    <p style={styles.previewNote}>
                      To preview, run the generated site locally:
                    </p>
                    <code style={styles.codeBlock}>
                      cd output/qa-suite/sites/{selected.id}/{selectedView === 'customer' ? 'frontend' : selectedView}
                      {'\n'}npm install && npm run dev
                    </code>
                    <button
                      onClick={() => {
                        // Open file explorer or copy path
                        const path = `output/qa-suite/sites/${selected.id}`;
                        navigator.clipboard.writeText(path);
                        alert(`Path copied: ${path}`);
                      }}
                      style={{ ...styles.button, marginTop: 16 }}
                    >
                      <FileText size={16} />
                      Copy Path
                    </button>
                  </div>
                ) : (
                  <div style={styles.previewPlaceholder}>
                    <AlertCircle size={48} color="#f59e0b" />
                    <h3>Not Generated Yet</h3>
                    <p>Click "Generate" to create this industry's sites</p>
                  </div>
                )}
              </div>

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

      {/* Issue Modal */}
      {showIssueModal && (
        <IssueModal
          industry={selectedIndustry}
          view={selectedView}
          onSubmit={handleFlagIssue}
          onClose={() => setShowIssueModal(false)}
        />
      )}

      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
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
    minHeight: 400,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
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
  }
};
