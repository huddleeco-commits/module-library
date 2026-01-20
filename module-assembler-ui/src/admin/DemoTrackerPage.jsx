/**
 * Demo Tracker Page
 * Track and manage demo deployments with easy deletion
 */

import React, { useState, useEffect, useCallback } from 'react';
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
  Calendar
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

// ============================================
// HELPER COMPONENTS
// ============================================

function StatusBadge({ status }) {
  const styles = {
    deployed: { bg: '#10b981', text: 'Deployed' },
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
      onMouseEnter={(e) => e.target.style.background = `${color}25`}
      onMouseLeave={(e) => e.target.style.background = `${color}15`}
    >
      <Icon size={14} />
      {label}
    </a>
  );
}

function DemoCard({ demo, onDelete, deleting }) {
  const metadata = typeof demo.metadata === 'string' ? JSON.parse(demo.metadata) : (demo.metadata || {});
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
            {demo.industry} • {metadata.tagline || 'No tagline'}
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
// MAIN COMPONENT
// ============================================

export default function DemoTrackerPage() {
  const [demos, setDemos] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState(null);
  const [view, setView] = useState('all'); // 'all' or 'batches'

  const fetchDemos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminFetch('/demos');
      setDemos(data.demos || []);
      setBatches(data.batches || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDemos();
  }, [fetchDemos]);

  const handleDelete = async (demo) => {
    if (!confirm(`Delete "${demo.name}" and all its resources?\n\nThis will delete:\n• Railway project\n• GitHub repos\n• Cloudflare DNS\n• Local files\n• Database record`)) {
      return;
    }

    setDeleting(demo.id);
    try {
      const data = await adminFetch(`/demos/${demo.id}`, {
        method: 'DELETE',
        body: JSON.stringify({ name: demo.name })
      });
      setDemos(demos.filter(d => d.id !== demo.id));
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
      const data = await adminFetch('/demos/all', { method: 'DELETE' });
      setDemos([]);
      setBatches([]);
      alert(`Deleted ${data.deleted} demo deployments`);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#fff' }}>
            Demo Tracker
          </h1>
          <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
            Track and manage demo deployments
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={fetchDemos}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: '#6366f120',
              color: '#6366f1',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            Refresh
          </button>
          {demos.length > 0 && (
            <button
              onClick={handleDeleteAll}
              disabled={deleting === 'all'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: '#ef4444',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                opacity: deleting === 'all' ? 0.5 : 1
              }}
            >
              <Trash2 size={16} />
              Delete All ({demos.length})
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ background: '#16162a', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#10b981' }}>{demos.length}</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Total Demos</div>
        </div>
        <div style={{ background: '#16162a', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#6366f1' }}>{batches.length}</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Batches</div>
        </div>
        <div style={{ background: '#16162a', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#f59e0b' }}>
            {demos.filter(d => d.status === 'deployed').length}
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Deployed</div>
        </div>
        <div style={{ background: '#16162a', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#ef4444' }}>
            {demos.filter(d => d.status === 'failed').length}
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Failed</div>
        </div>
      </div>

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

      {/* Empty State */}
      {!loading && demos.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '48px',
          background: '#16162a',
          borderRadius: '12px',
          color: 'rgba(255,255,255,0.5)'
        }}>
          <Calendar size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <h3 style={{ margin: '0 0 8px', color: '#fff' }}>No Demo Deployments</h3>
          <p style={{ margin: 0 }}>Run a demo generation to see tracked deployments here</p>
        </div>
      )}

      {/* Demo List */}
      {!loading && demos.length > 0 && (
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
