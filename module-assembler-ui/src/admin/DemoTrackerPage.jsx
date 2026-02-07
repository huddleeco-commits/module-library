/**
 * Showcase Dashboard (enhanced Demo Tracker)
 * Two views: Showcase Grid (shareable demo grid) + Management Table (full control)
 * Supports batch generation of all 19 industries with SSE progress
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Trash2,
  ExternalLink,
  RefreshCw,
  Globe,
  Server,
  Smartphone,
  Github,
  Train,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Layers,
  Calendar,
  LayoutGrid,
  List,
  Rocket,
  FileCode,
  Hash,
  Timer,
  X,
  Play,
  Loader
} from 'lucide-react';

const API_URL = window.location.origin;

// Authenticated fetch helper
async function adminFetch(endpoint, options = {}) {
  const token = localStorage.getItem('blink_admin_token');
  const res = await fetch(`${API_URL}/api/admin${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers
    }
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return data;
}

// Industry emoji map
const INDUSTRY_EMOJI = {
  'pizza-restaurant': '\u{1F355}', steakhouse: '\u{1F969}', 'coffee-cafe': '\u{2615}',
  restaurant: '\u{1F37D}', bakery: '\u{1F370}', 'salon-spa': '\u{1F485}',
  'fitness-gym': '\u{1F4AA}', dental: '\u{1F9B7}', healthcare: '\u{1FA7A}',
  yoga: '\u{1F9D8}', barbershop: '\u{1F488}', 'law-firm': '\u{2696}',
  'real-estate': '\u{1F3E0}', plumber: '\u{1F527}', cleaning: '\u{2728}',
  'auto-shop': '\u{1F697}', saas: '\u{1F4BB}', ecommerce: '\u{1F6CD}',
  school: '\u{1F393}'
};

function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString();
}

// ============================================
// HELPER COMPONENTS
// ============================================

function StatusBadge({ status }) {
  const styles = {
    deployed: { bg: '#10b981', text: 'Live' },
    deploying: { bg: '#3b82f6', text: 'Deploying...' },
    failed: { bg: '#ef4444', text: 'Failed' },
    building: { bg: '#f59e0b', text: 'Building' },
    pending: { bg: '#6b7280', text: 'Pending' }
  };
  const style = styles[status] || styles.pending;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '2px 8px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: '600',
      background: `${style.bg}20`,
      color: style.bg
    }}>
      {status === 'deployed' && <CheckCircle2 size={12} />}
      {status === 'failed' && <XCircle size={12} />}
      {style.text}
    </span>
  );
}

function LinkButton({ href, icon: Icon, label, color = '#6366f1' }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        color: color,
        background: `${color}15`,
        textDecoration: 'none',
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = `${color}25`; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = `${color}15`; }}
    >
      <Icon size={14} />
      {label}
    </a>
  );
}

// ============================================
// SHOWCASE GRID CARD (the pretty, shareable card)
// ============================================

function ShowcaseCard({ demo, onDelete, deleting }) {
  const metadata = typeof demo.metadata === 'string' ? JSON.parse(demo.metadata) : (demo.metadata || {});
  const emoji = INDUSTRY_EMOJI[demo.industry] || '\u{1F310}';
  const metrics = metadata.metrics || {};
  const siteUrl = metadata.railwayFrontend || demo.frontend_url;
  const adminUrl = metadata.railwayAdmin || demo.admin_url;

  return (
    <div style={{
      background: '#16162a',
      borderRadius: '14px',
      border: '1px solid rgba(255,255,255,0.08)',
      overflow: 'hidden',
      position: 'relative',
      transition: 'transform 0.2s, box-shadow 0.2s'
    }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Delete X (top-right, hover-visible via parent hover) */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(demo); }}
        disabled={deleting}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          width: '24px',
          height: '24px',
          borderRadius: '6px',
          border: 'none',
          background: 'rgba(239,68,68,0.15)',
          color: '#ef4444',
          cursor: deleting ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.4,
          transition: 'opacity 0.2s',
          zIndex: 2
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.4'; }}
      >
        <X size={14} />
      </button>

      {/* Top section */}
      <div style={{ padding: '20px 20px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <span style={{ fontSize: '28px' }}>{emoji}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {(demo.industry || '').replace(/-/g, ' ')}
            </div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {demo.name}
            </h3>
          </div>
          <StatusBadge status={demo.status} />
        </div>

        {/* Metrics row */}
        {(metrics.totalLines || metrics.totalFiles) ? (
          <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FileCode size={12} /> {formatNumber(metrics.totalLines)} lines
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Hash size={12} /> {metrics.totalFiles} files
            </span>
            {metrics.generationTime && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Timer size={12} /> {metrics.generationTime}s
              </span>
            )}
          </div>
        ) : null}
      </div>

      {/* Action buttons */}
      <div style={{
        display: 'flex',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        {demo.status === 'deploying' ? (
          <span style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px', color: '#3b82f6', fontSize: '13px', fontWeight: '600' }}>
            <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Deploying to Railway...
          </span>
        ) : (
          <>
            {siteUrl ? (
              <a
                href={siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '12px',
                  color: '#10b981',
                  fontSize: '13px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  borderRight: '1px solid rgba(255,255,255,0.06)',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(16,185,129,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <Globe size={15} /> View Site
              </a>
            ) : (
              <span style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', color: 'rgba(255,255,255,0.2)', fontSize: '13px', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                No URL
              </span>
            )}
            {adminUrl ? (
              <a
                href={adminUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '12px',
                  color: '#f59e0b',
                  fontSize: '13px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(245,158,11,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <Server size={15} /> View Admin
              </a>
            ) : (
              <span style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>
                No Admin
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ============================================
// MANAGEMENT CARD (full detail view)
// ============================================

function DemoCard({ demo, onDelete, deleting }) {
  const metadata = typeof demo.metadata === 'string' ? JSON.parse(demo.metadata) : (demo.metadata || {});
  const metrics = metadata.metrics || {};
  const createdDate = new Date(demo.created_at).toLocaleString();

  return (
    <div style={{
      background: '#16162a',
      borderRadius: '12px',
      padding: '16px',
      border: '1px solid rgba(255,255,255,0.1)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#fff' }}>
            {demo.name}
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
            {demo.industry} {metadata.tagline ? `\u2022 ${metadata.tagline}` : ''}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <StatusBadge status={demo.status} />
          <button
            onClick={() => onDelete(demo)}
            disabled={deleting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              background: '#ef444420',
              color: '#ef4444',
              cursor: deleting ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              opacity: deleting ? 0.5 : 1
            }}
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>

      {/* Metrics row */}
      {(metrics.totalLines || metrics.totalFiles) && (
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '12px',
          padding: '8px 12px',
          background: 'rgba(99,102,241,0.06)',
          borderRadius: '8px',
          fontSize: '12px',
          color: 'rgba(255,255,255,0.6)'
        }}>
          <span><FileCode size={12} style={{ verticalAlign: '-2px' }} /> {formatNumber(metrics.totalLines)} lines</span>
          <span><Hash size={12} style={{ verticalAlign: '-2px' }} /> {metrics.totalFiles} files</span>
          <span>FE: {metrics.frontendFiles || 0} | BE: {metrics.backendFiles || 0} | Admin: {metrics.adminFiles || 0}</span>
          {metrics.generationTime && <span><Timer size={12} style={{ verticalAlign: '-2px' }} /> {metrics.generationTime}s gen</span>}
        </div>
      )}

      {/* URLs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
        <LinkButton href={demo.frontend_url} icon={Globe} label="Website" color="#10b981" />
        <LinkButton href={demo.admin_url} icon={Server} label="Admin" color="#f59e0b" />
        <LinkButton href={demo.companion_app_url} icon={Smartphone} label="Companion App" color="#6366f1" />
        <LinkButton href={demo.backend_url} icon={Server} label="API" color="#8b5cf6" />
      </div>

      {/* GitHub & Railway */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
        <LinkButton href={demo.github_frontend} icon={Github} label="Frontend Repo" color="#6b7280" />
        <LinkButton href={demo.github_backend} icon={Github} label="Backend Repo" color="#6b7280" />
        <LinkButton href={demo.github_admin} icon={Github} label="Admin Repo" color="#6b7280" />
        <LinkButton href={demo.railway_project_url} icon={Train} label="Railway" color="#9333ea" />
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '12px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        fontSize: '12px',
        color: 'rgba(255,255,255,0.4)'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={12} />
          {createdDate}
        </span>
        {demo.demo_batch_id && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Layers size={12} />
            Batch: {demo.demo_batch_id}
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================
// BATCH PROGRESS OVERLAY
// ============================================

function LiveTimer({ startTime, done }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!startTime) return;
    const tick = () => setElapsed(Math.floor((Date.now() - startTime) / 1000));
    tick();
    if (done) return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startTime, done]);
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  return (
    <span style={{ fontFamily: 'monospace', fontSize: '18px', fontWeight: '700', color: '#6366f1' }}>
      {mins}:{secs.toString().padStart(2, '0')}
    </span>
  );
}

function BatchProgressOverlay({ progress, onClose }) {
  if (!progress) return null;
  const { batchId, total, completed, current, log, percent, done, failed, startTime } = progress;

  return (
    <div style={{
      background: '#1a1a2e',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '20px',
      border: '1px solid rgba(99,102,241,0.3)'
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '16px' }}>
              {done ? 'Batch Complete' : 'Generating & Deploying...'}
            </h3>
            <LiveTimer startTime={startTime} done={done} />
          </div>
          {done && (
            <button onClick={onClose} style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer'
            }}>
              <X size={18} />
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>
            <span>{completed}/{total} sites</span>
            <span>{percent}%</span>
          </div>
          <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.1)' }}>
            <div style={{
              height: '100%',
              borderRadius: '3px',
              background: failed > 0 ? 'linear-gradient(90deg, #10b981, #f59e0b)' : '#10b981',
              width: `${percent}%`,
              transition: 'width 0.3s'
            }} />
          </div>
        </div>

        {/* Current site */}
        {current && !done && (
          <div style={{
            padding: '8px 12px',
            background: 'rgba(99,102,241,0.08)',
            borderRadius: '6px',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Loader size={14} className="spin" style={{ color: '#6366f1' }} />
            <span style={{ color: '#fff', fontSize: '13px' }}>{current}</span>
          </div>
        )}

        {/* Summary (when done) */}
        {done && (
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '8px'
          }}>
            <div style={{ flex: 1, background: 'rgba(16,185,129,0.1)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#10b981' }}>{completed - failed}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Succeeded</div>
            </div>
            {failed > 0 && (
              <div style={{ flex: 1, background: 'rgba(239,68,68,0.1)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#ef4444' }}>{failed}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Failed</div>
              </div>
            )}
          </div>
        )}

        {/* Log */}
        <div style={{
          overflowY: 'auto',
          maxHeight: '120px',
          background: '#0d0d1a',
          borderRadius: '6px',
          padding: '8px 10px',
          fontFamily: 'monospace',
          fontSize: '11px',
          lineHeight: '1.5'
        }}>
          {log.map((entry, i) => (
            <div key={i} style={{
              color: entry.type === 'error' ? '#ef4444' : entry.type === 'success' ? '#10b981' : 'rgba(255,255,255,0.6)'
            }}>
              {entry.message}
            </div>
          ))}
        </div>
    </div>
  );
}

// ============================================
// METRICS BAR
// ============================================

function MetricsBar({ metrics }) {
  const stats = [
    { label: 'Live Businesses', value: metrics.totalSites, color: '#10b981', icon: Globe },
    { label: 'Deployed Apps', value: metrics.totalApps || metrics.totalSites * 3, color: '#f59e0b', icon: Rocket },
    { label: 'Lines of Code', value: formatNumber(metrics.totalLines), color: '#6366f1', icon: FileCode },
    { label: 'Total Pages', value: metrics.totalPages || '-', color: '#8b5cf6', icon: Layers }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
      gap: '12px',
      marginBottom: '24px'
    }}>
      {stats.map(s => (
        <div key={s.label} style={{
          background: '#16162a',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: `${s.color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: s.color
          }}>
            <s.icon size={20} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: '700', color: '#fff' }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', fontWeight: '500' }}>{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function DemoTrackerPage() {
  const [demos, setDemos] = useState([]);
  const [batches, setBatches] = useState([]);
  const [metrics, setMetrics] = useState({ totalSites: 0, totalLines: 0, totalFiles: 0, avgGenTime: 0 });
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'management'
  const [batchProgress, setBatchProgress] = useState(null);
  const eventSourceRef = useRef(null);

  const initialLoadDone = useRef(false);
  const fetchDemos = useCallback(async () => {
    if (!initialLoadDone.current) setLoading(true);
    setError(null);
    try {
      // Use launchpad demos endpoint (no auth required, works in skipAuth mode)
      const res = await fetch(`${API_URL}/api/launchpad/demos`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch demos');
      const newDemos = data.demos || [];
      setDemos(newDemos);
      setBatches(data.batches || []);
      setMetrics(data.metrics || { totalSites: 0, totalLines: 0, totalFiles: 0, avgGenTime: 0 });

      // Update batch progress from DB if batch is running
      setBatchProgress(prev => {
        if (!prev || prev.done) return prev;
        const deployed = newDemos.filter(d => d.status === 'deployed').length;
        const deploying = newDemos.filter(d => d.status === 'deploying').length;
        const failed = newDemos.filter(d => d.status === 'failed').length;
        const total = prev.total || 19;
        const completed = deployed + failed;
        const pct = Math.round(((completed + deploying * 0.5) / total) * 100);
        const lastDemo = newDemos[0]; // Most recent
        return {
          ...prev,
          completed,
          failed,
          percent: Math.max(prev.percent, pct),
          current: deploying > 0 ? `Deploying ${newDemos.find(d => d.status === 'deploying')?.name || '...'}` : prev.current,
          log: prev.log // Keep SSE log if available
        };
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      initialLoadDone.current = true;
    }
  }, []);

  useEffect(() => {
    fetchDemos();
  }, [fetchDemos]);

  // Cleanup SSE on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const handleDelete = async (demo) => {
    if (!confirm(`Delete "${demo.name}" and all its resources?\n\nThis will delete:\n\u2022 Railway project\n\u2022 GitHub repos\n\u2022 Cloudflare DNS\n\u2022 Local files\n\u2022 Database record`)) {
      return;
    }

    setDeleting(demo.id);
    try {
      await fetch(`${API_URL}/api/launchpad/demos/${demo.id}`, {
        method: 'DELETE'
      }).then(r => r.json());
      setDemos(prev => prev.filter(d => d.id !== demo.id));
    } catch (err) {
      alert(`Delete error: ${err.message}`);
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm(`Delete ALL ${demos.length} demo deployments?\n\nThis will permanently remove all demo resources from Railway, GitHub, Cloudflare, and local storage.`)) {
      return;
    }

    setDeleting('all');
    try {
      const data = await fetch(`${API_URL}/api/launchpad/demos/all`, { method: 'DELETE' }).then(r => r.json());
      setDemos([]);
      setBatches([]);
      setMetrics({ totalSites: 0, totalLines: 0, totalFiles: 0, avgGenTime: 0 });
      alert(`Deleted ${data.deleted} demo deployments`);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setDeleting(null);
    }
  };

  const handleBatchGenerate = async () => {
    if (!confirm('Generate & deploy all 19 industries?\n\nThis will take ~30-60 minutes and deploy to be1st.io subdomains.')) {
      return;
    }

    const progress = {
      batchId: null,
      total: 19,
      completed: 0,
      failed: 0,
      current: 'Starting batch...',
      log: [{ type: 'info', message: 'Initiating showcase batch deployment...' }],
      percent: 0,
      done: false,
      startTime: Date.now()
    };
    setBatchProgress(progress);

    // Poll DB every 5s so grid updates even if SSE is buffered by proxy
    const pollId = setInterval(() => fetchDemos(), 5000);

    try {
      const token = localStorage.getItem('blink_admin_token');
      const response = await fetch(`${API_URL}/api/launchpad/deploy-batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({})
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice(6));

            setBatchProgress(prev => {
              const next = { ...prev };

              switch (event.type) {
                case 'batch-start':
                  next.batchId = event.batchId;
                  next.total = event.total;
                  next.log = [...next.log, { type: 'info', message: `Batch ${event.batchId}: ${event.total} sites to deploy` }];
                  break;

                case 'site-start':
                  next.current = `[${event.index + 1}/${event.total}] ${event.input}`;
                  next.percent = event.percent || next.percent;
                  next.log = [...next.log, { type: 'info', message: `\u25B6 Starting: ${event.input}` }];
                  break;

                case 'site-generated':
                  next.current = `[${event.index + 1}/${next.total}] Deploying ${event.name}...`;
                  next.percent = event.percent || next.percent;
                  next.log = [...next.log, {
                    type: 'info',
                    message: `  Generated ${event.name} (${event.industry})${event.metrics ? ` - ${formatNumber(event.metrics.totalLines)} lines` : ''}`
                  }];
                  // Card is now in DB with status 'deploying' — refresh grid
                  setTimeout(() => fetchDemos(), 500);
                  break;

                case 'site-deploy-progress':
                  next.current = `[${event.index + 1}/${next.total}] ${event.name}: ${event.message}`;
                  next.percent = event.percent || next.percent;
                  break;

                case 'site-complete':
                  next.completed = (next.completed || 0) + 1;
                  next.percent = event.percent || next.percent;
                  next.log = [...next.log, {
                    type: 'success',
                    message: `  \u2713 ${event.result.name} deployed${event.result.urls?.frontend ? ` \u2192 ${event.result.urls.frontend}` : ''}`
                  }];
                  // Refresh demos from DB so new card appears in grid behind overlay
                  setTimeout(() => fetchDemos(), 500);
                  break;

                case 'site-failed':
                  next.completed = (next.completed || 0) + 1;
                  next.failed = (next.failed || 0) + 1;
                  next.percent = event.percent || next.percent;
                  next.log = [...next.log, { type: 'error', message: `  \u2717 ${event.input}: ${event.error}` }];
                  break;

                case 'batch-complete':
                  next.done = true;
                  next.percent = 100;
                  next.current = null;
                  next.log = [...next.log, {
                    type: 'success',
                    message: `\nBatch complete: ${event.succeeded}/${event.total} succeeded${event.failed > 0 ? `, ${event.failed} failed` : ''}`
                  }];
                  setTimeout(() => fetchDemos(), 500);
                  break;
              }

              return next;
            });
          } catch (e) { /* skip bad JSON */ }
        }
      }
    } catch (err) {
      setBatchProgress(prev => ({
        ...prev,
        done: true,
        current: null,
        log: [...(prev?.log || []), { type: 'error', message: `Batch error: ${err.message}` }]
      }));
    } finally {
      clearInterval(pollId);
      fetchDemos();
    }
  };

  const closeBatchProgress = () => {
    setBatchProgress(null);
    fetchDemos();
  };

  const deployedDemos = demos.filter(d => d.status === 'deployed');

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#fff' }}>
            Showcase Dashboard
          </h1>
          <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
            {viewMode === 'grid' ? 'Live demo grid \u2014 shareable with stakeholders' : 'Full management view with all links & controls'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* View toggle */}
          <div style={{
            display: 'flex',
            background: '#16162a',
            borderRadius: '8px',
            padding: '2px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '6px 12px', borderRadius: '6px', border: 'none',
                background: viewMode === 'grid' ? '#6366f1' : 'transparent',
                color: viewMode === 'grid' ? '#fff' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer', fontSize: '13px', fontWeight: '500'
              }}
            >
              <LayoutGrid size={14} /> Grid
            </button>
            <button
              onClick={() => setViewMode('management')}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '6px 12px', borderRadius: '6px', border: 'none',
                background: viewMode === 'management' ? '#6366f1' : 'transparent',
                color: viewMode === 'management' ? '#fff' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer', fontSize: '13px', fontWeight: '500'
              }}
            >
              <List size={14} /> Manage
            </button>
          </div>

          <button
            onClick={fetchDemos}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', borderRadius: '8px', border: 'none',
              background: '#6366f120', color: '#6366f1',
              cursor: 'pointer', fontSize: '13px', fontWeight: '500'
            }}
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
          </button>

          <button
            onClick={handleBatchGenerate}
            disabled={!!batchProgress}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '8px', border: 'none',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff', cursor: batchProgress ? 'not-allowed' : 'pointer',
              fontSize: '13px', fontWeight: '600',
              opacity: batchProgress ? 0.5 : 1
            }}
          >
            <Rocket size={15} />
            Generate All 19
          </button>

          {demos.length > 0 && viewMode === 'management' && (
            <button
              onClick={handleDeleteAll}
              disabled={deleting === 'all'}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: '8px', border: 'none',
                background: '#ef4444', color: '#fff',
                cursor: 'pointer', fontSize: '13px', fontWeight: '500',
                opacity: deleting === 'all' ? 0.5 : 1
              }}
            >
              <Trash2 size={15} />
              Delete All ({demos.length})
            </button>
          )}
        </div>
      </div>

      {/* Metrics Bar */}
      <MetricsBar metrics={metrics} />

      {/* Error */}
      {error && (
        <div style={{
          background: '#ef444420',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#ef4444'
        }}>
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '48px', color: 'rgba(255,255,255,0.5)' }}>
          <RefreshCw size={32} className="spin" style={{ marginBottom: '12px' }} />
          <div>Loading demos...</div>
        </div>
      )}

      {/* Empty State (hidden during batch) */}
      {!loading && demos.length === 0 && !batchProgress && (
        <div style={{
          textAlign: 'center',
          padding: '60px 24px',
          background: '#16162a',
          borderRadius: '16px',
          color: 'rgba(255,255,255,0.5)'
        }}>
          <Rocket size={56} style={{ marginBottom: '16px', opacity: 0.3 }} />
          <h3 style={{ margin: '0 0 8px', color: '#fff', fontSize: '18px' }}>No Showcase Demos Yet</h3>
          <p style={{ margin: '0 0 24px', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
            Click "Generate All 19" to build and deploy every industry template as a live demo.
          </p>
          <button
            onClick={handleBatchGenerate}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '12px 24px', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff', cursor: 'pointer', fontSize: '15px', fontWeight: '600'
            }}
          >
            <Rocket size={18} />
            Generate All 19 Industries
          </button>
        </div>
      )}

      {/* Batch Progress (inline, non-blocking) */}
      <BatchProgressOverlay
        progress={batchProgress}
        onClose={closeBatchProgress}
      />

      {/* ============================================ */}
      {/* SHOWCASE GRID VIEW */}
      {/* ============================================ */}
      {!loading && demos.length > 0 && viewMode === 'grid' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px'
        }}>
          {demos.map(demo => (
            <ShowcaseCard
              key={demo.id}
              demo={demo}
              onDelete={handleDelete}
              deleting={deleting === demo.id}
            />
          ))}
        </div>
      )}

      {/* ============================================ */}
      {/* MANAGEMENT LIST VIEW */}
      {/* ============================================ */}
      {!loading && demos.length > 0 && viewMode === 'management' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          {demos.map(demo => (
            <DemoCard
              key={demo.id}
              demo={demo}
              onDelete={handleDelete}
              deleting={deleting === demo.id}
            />
          ))}
        </div>
      )}

      {/* Batch Progress Overlay */}
      {/* Spin animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
