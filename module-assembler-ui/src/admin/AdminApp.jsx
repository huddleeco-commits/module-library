/**
 * BLINK Admin Dashboard - Comprehensive 16-Tab Admin Interface
 * Modeled after SlabTrack admin system
 */

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import {
  LayoutDashboard,
  Users,
  Layers,
  DollarSign,
  TrendingUp,
  Building2,
  Package,
  AlertTriangle,
  Gauge,
  FileCode,
  Mail,
  Gift,
  Bell,
  CheckCircle2,
  Settings,
  Server,
  LogOut,
  Download,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  Filter,
  Zap,
  Activity,
  Clock,
  FlaskConical,
  Archive,
  Rocket,
  Sparkles,
  Camera,
  ClipboardCheck
} from 'lucide-react';

// Import Platform Health Page
import PlatformHealthPage from './PlatformHealthPage';
import BackupManager from './BackupManager';
import DemoTrackerPage from './DemoTrackerPage';
import TestLabPage from './TestLabPage';
import SmartTemplateDevPage from './SmartTemplateDevPage';
import BusinessGeneratorPage from './BusinessGeneratorPage';
import QuickStartDevTool from './QuickStartDevTool';
import ScoutDashboard from './ScoutDashboard';
import ScreenshotGallery from './ScreenshotGallery';
import StylePreviewPage from './StylePreviewPage';
import ResearchTestLab from './ResearchTestLab';
import LaunchpadDashboard from './LaunchpadDashboard';
import QADashboard from './QADashboard';

// ============================================
// CONTEXT & API
// ============================================

const AdminContext = createContext(null);
export function useAdmin() {
  return useContext(AdminContext);
}

const API_URL = window.location.origin;

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
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ============================================
// SHARED COMPONENTS
// ============================================

function StatCard({ title, value, subtitle, icon, color, trend }) {
  return (
    <div style={styles.statCard}>
      <div style={{ ...styles.statIcon, backgroundColor: `${color}20`, color }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={styles.statValue}>{value}</div>
        <div style={styles.statTitle}>{title}</div>
        {subtitle && <div style={styles.statSubtitle}>{subtitle}</div>}
      </div>
      {trend !== undefined && (
        <div style={{ color: trend >= 0 ? '#10b981' : '#ef4444', fontSize: '14px', fontWeight: 600 }}>
          {trend >= 0 ? '+' : ''}{trend}%
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    // Generation states
    building: { bg: '#f59e0b20', text: '#f59e0b' }, // Yellow - in progress
    completed: { bg: '#10b98120', text: '#10b981' }, // Green - code gen done
    failed: { bg: '#ef444420', text: '#ef4444' }, // Red - code gen failed

    // Build validation states (AUDIT 1)
    build_passed: { bg: '#22c55e20', text: '#22c55e' }, // Bright green - ready to deploy
    build_failed: { bg: '#dc262620', text: '#dc2626' }, // Dark red - build errors

    // Deployment states
    deployed: { bg: '#06b6d420', text: '#06b6d4' }, // Cyan - live
    deploy_failed: { bg: '#f9731620', text: '#f97316' }, // Orange - deploy failed

    // Generic states
    active: { bg: '#10b98120', text: '#10b981' },
    generating: { bg: '#f59e0b20', text: '#f59e0b' },
    pending: { bg: '#6366f120', text: '#6366f1' },
    cancelled: { bg: '#6b728020', text: '#6b7280' },
    warning: { bg: '#f59e0b20', text: '#f59e0b' },
    critical: { bg: '#ef444420', text: '#ef4444' },
    info: { bg: '#3b82f620', text: '#3b82f6' },
    resolved: { bg: '#10b98120', text: '#10b981' }
  };
  const c = colors[status] || colors.pending;
  return (
    <span style={{ ...styles.badge, backgroundColor: c.bg, color: c.text }}>
      {status}
    </span>
  );
}

function TierBadge({ tier }) {
  const colors = {
    admin: { bg: '#8b5cf620', text: '#8b5cf6' },
    dealer: { bg: '#6366f120', text: '#6366f1' },
    power: { bg: '#10b98120', text: '#10b981' },
    free: { bg: '#6b728020', text: '#6b7280' }
  };
  const c = colors[tier] || colors.free;
  return (
    <span style={{ ...styles.badge, backgroundColor: c.bg, color: c.text }}>
      {tier}
    </span>
  );
}

function AppTypeBadge({ appType, parentProjectId }) {
  const types = {
    'website': { bg: '#10b98120', text: '#10b981', icon: '🌐', label: 'Website' },
    'companion-app': { bg: '#8b5cf620', text: '#8b5cf6', icon: '📱', label: 'Companion' },
    'advanced-app': { bg: '#f5990e20', text: '#f59e0b', icon: '⚡', label: 'App' }
  };
  const t = types[appType] || types['website'];
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '2px 8px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: '500',
      backgroundColor: t.bg,
      color: t.text
    }}>
      <span style={{ fontSize: '10px' }}>{t.icon}</span>
      {t.label}
      {parentProjectId && (
        <span title={`Child of project #${parentProjectId}`} style={{ marginLeft: '2px', opacity: 0.7 }}>
          ↗
        </span>
      )}
    </span>
  );
}

function RailwayStatusBadge({ status, onClick, loading }) {
  const statusConfig = {
    'healthy': { bg: '#10b98120', text: '#10b981', icon: '🟢' },
    'building': { bg: '#f59e0b20', text: '#f59e0b', icon: '🟡' },
    'down': { bg: '#ef444420', text: '#ef4444', icon: '🔴' },
    'sleeping': { bg: '#6b728020', text: '#6b7280', icon: '😴' },
    'unknown': { bg: '#6b728020', text: '#6b7280', icon: '⚪' }
  };
  const s = statusConfig[status] || statusConfig['unknown'];

  return (
    <button
      onClick={onClick}
      disabled={loading}
      title={loading ? 'Checking...' : `Status: ${status || 'unknown'}. Click to refresh`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 6px',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: '500',
        backgroundColor: s.bg,
        color: s.text,
        border: 'none',
        cursor: loading ? 'wait' : 'pointer',
        opacity: loading ? 0.6 : 1,
        transition: 'opacity 0.2s'
      }}
    >
      <span style={{ fontSize: '10px' }}>{loading ? '⏳' : s.icon}</span>
    </button>
  );
}

function LoadingSpinner() {
  return (
    <div style={styles.loading}>
      <div style={styles.spinner} />
      <span>Loading...</span>
    </div>
  );
}

function DataTable({ columns, data, loading }) {
  if (loading) return <LoadingSpinner />;
  return (
    <div style={styles.tableContainer}>
      <table style={styles.table}>
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i} style={styles.th}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} style={styles.tr}>
              {columns.map((col, j) => (
                <td key={j} style={styles.td}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Pagination({ page, setPage, total, limit }) {
  const totalPages = Math.ceil(total / limit);
  return (
    <div style={styles.pagination}>
      <button
        onClick={() => setPage(p => Math.max(1, p - 1))}
        disabled={page === 1}
        style={styles.paginationBtn}
      >
        <ChevronLeft size={16} />
      </button>
      <span style={styles.paginationText}>
        Page {page} of {totalPages || 1} ({total} total)
      </span>
      <button
        onClick={() => setPage(p => p + 1)}
        disabled={page >= totalPages}
        style={styles.paginationBtn}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

function SearchBar({ value, onChange, placeholder }) {
  return (
    <div style={styles.searchContainer}>
      <Search size={18} style={{ color: '#888' }} />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={styles.searchInput}
      />
      {value && (
        <button onClick={() => onChange('')} style={styles.clearBtn}>
          <X size={16} />
        </button>
      )}
    </div>
  );
}

function DateFilter({ startDate, endDate, onStartChange, onEndChange }) {
  return (
    <div style={styles.dateFilter}>
      <input
        type="date"
        value={startDate}
        onChange={e => onStartChange(e.target.value)}
        style={styles.dateInput}
      />
      <span style={{ color: '#888' }}>to</span>
      <input
        type="date"
        value={endDate}
        onChange={e => onEndChange(e.target.value)}
        style={styles.dateInput}
      />
    </div>
  );
}

function ExportButton({ onClick, label = 'Export CSV' }) {
  return (
    <button onClick={onClick} style={styles.exportBtn}>
      <Download size={16} />
      {label}
    </button>
  );
}

// ============================================
// TAB 1: OVERVIEW DASHBOARD
// ============================================

function OverviewPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch('/overview')
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const stats = data || {};

  return (
    <div>
      <h1 style={styles.pageTitle}>Dashboard Overview</h1>

      <div style={styles.statsGrid}>
        <StatCard
          title="Total Users"
          value={stats.totalUsers || 0}
          subtitle={`${stats.activeToday || 0} active today`}
          icon={<Users size={24} />}
          color="#6366f1"
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${(stats.mrr || 0).toLocaleString()}`}
          subtitle={`ARR: $${((stats.mrr || 0) * 12).toLocaleString()}`}
          icon={<DollarSign size={24} />}
          color="#10b981"
        />
        <StatCard
          title="API Costs (MTD)"
          value={`$${parseFloat(stats.apiCostThisMonth || 0).toFixed(2)}`}
          subtitle={`${(parseFloat(stats.tokensThisMonth || 0) / 1000).toFixed(0)}K tokens`}
          icon={<Activity size={24} />}
          color="#f59e0b"
        />
        <StatCard
          title="Generations"
          value={stats.totalGenerations || 0}
          subtitle={`${stats.generationsToday || 0} today`}
          icon={<Layers size={24} />}
          color="#8b5cf6"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Quick Stats</h2>
          <div style={styles.quickStats}>
            <div style={styles.quickStatRow}>
              <span>Success Rate</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>{stats.successRate || 0}%</span>
            </div>
            <div style={styles.quickStatRow}>
              <span>Avg Generation Time</span>
              <span>{(parseFloat(stats.avgGenerationTime || 0) / 1000).toFixed(1)}s</span>
            </div>
            <div style={styles.quickStatRow}>
              <span>Conversion Rate</span>
              <span>{stats.conversionRate || 0}%</span>
            </div>
            <div style={styles.quickStatRow}>
              <span>Profit Margin</span>
              <span style={{ color: (stats.profitMargin || 0) > 50 ? '#10b981' : '#ef4444' }}>
                {stats.profitMargin || 0}%
              </span>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Tier Distribution</h2>
          <div style={styles.quickStats}>
            {(stats.tierDistribution || []).map((tier, i) => (
              <div key={i} style={styles.quickStatRow}>
                <span><TierBadge tier={tier.tier} /></span>
                <span>{tier.count} users</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// TAB 2: USERS
// ============================================

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    adminFetch(`/users?page=${page}&limit=25&search=${encodeURIComponent(search)}`)
      .then(data => {
        setUsers(data.users || []);
        setTotal(data.total || 0);
      })
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleExport = () => {
    window.open(`${API_URL}/api/admin/export/users`, '_blank');
  };

  const handleTierChange = async (userId, newTier) => {
    try {
      await adminFetch(`/users/${userId}/tier`, {
        method: 'PUT',
        body: JSON.stringify({ tier: newTier })
      });
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleBan = async (userId, banned) => {
    if (!confirm(`Are you sure you want to ${banned ? 'ban' : 'unban'} this user?`)) return;
    try {
      await adminFetch(`/users/${userId}/ban`, {
        method: 'PUT',
        body: JSON.stringify({ banned })
      });
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>Users ({total})</h1>
        <ExportButton onClick={handleExport} />
      </div>

      <div style={styles.toolbar}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search by email..." />
      </div>

      <DataTable
        loading={loading}
        data={users}
        columns={[
          { header: 'ID', key: 'id' },
          { header: 'Email', key: 'email', render: v => <strong>{v}</strong> },
          { header: 'Tier', key: 'subscription_tier', render: v => <TierBadge tier={v} /> },
          { header: 'Gens Used', key: 'generations_used', render: v => v || 0 },
          { header: 'Gens Limit', key: 'generations_limit', render: v => v || '-' },
          { header: 'Last Active', key: 'last_active_at', render: v => v ? new Date(v).toLocaleDateString() : 'Never' },
          { header: 'Joined', key: 'created_at', render: v => new Date(v).toLocaleDateString() },
          { header: 'Actions', key: 'id', render: (id, row) => (
            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                value={row.subscription_tier}
                onChange={e => handleTierChange(id, e.target.value)}
                style={styles.miniSelect}
              >
                <option value="free">Free</option>
                <option value="power">Power</option>
                <option value="dealer">Dealer</option>
                <option value="admin">Admin</option>
              </select>
              <button
                onClick={() => handleBan(id, !row.banned)}
                style={{ ...styles.miniBtn, color: row.banned ? '#10b981' : '#ef4444' }}
              >
                {row.banned ? 'Unban' : 'Ban'}
              </button>
            </div>
          )}
        ]}
      />

      <Pagination page={page} setPage={setPage} total={total} limit={25} />
    </div>
  );
}

// ============================================
// TAB 3: GENERATIONS
// ============================================

function GenerationsPage() {
  const [generations, setGenerations] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [buildLogModal, setBuildLogModal] = useState(null);
  const [retrying, setRetrying] = useState(null);
  const [railwayStatus, setRailwayStatus] = useState({}); // { projectId: { status, loading } }

  const loadGenerations = () => {
    setLoading(true);
    adminFetch(`/generations?page=${page}&limit=25`)
      .then(data => {
        console.log('Generations response:', data);
        setGenerations(data.generations || []);
        // Backend returns total in pagination object
        setTotal(data.pagination?.total || data.total || 0);
      })
      .catch(err => {
        console.error('Failed to load generations:', err);
        setGenerations([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  };

  // Fetch Railway status for a single project
  const checkRailwayStatus = async (projectId) => {
    if (!projectId) return;

    setRailwayStatus(prev => ({
      ...prev,
      [projectId]: { ...prev[projectId], loading: true }
    }));

    try {
      const res = await fetch(`${API_URL}/api/railway/status/${projectId}`);
      const data = await res.json();

      setRailwayStatus(prev => ({
        ...prev,
        [projectId]: {
          status: data.success ? data.overallStatus?.status : 'unknown',
          loading: false,
          lastChecked: new Date().toISOString()
        }
      }));
    } catch (err) {
      console.error('Railway status check failed:', err);
      setRailwayStatus(prev => ({
        ...prev,
        [projectId]: { status: 'unknown', loading: false }
      }));
    }
  };

  // Refresh all Railway statuses for deployed projects
  const refreshAllStatuses = async () => {
    const deployedProjects = generations.filter(g =>
      g.status === 'deployed' && g.railway_project_id
    );

    if (deployedProjects.length === 0) return;

    // Mark all as loading
    const loadingState = {};
    deployedProjects.forEach(p => {
      loadingState[p.railway_project_id] = { loading: true };
    });
    setRailwayStatus(prev => ({ ...prev, ...loadingState }));

    try {
      const res = await fetch(`${API_URL}/api/railway/status/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectIds: deployedProjects.map(p => p.railway_project_id)
        })
      });
      const data = await res.json();

      if (data.success) {
        const newStatus = {};
        Object.entries(data.results || {}).forEach(([id, result]) => {
          newStatus[id] = {
            status: result.status,
            loading: false,
            lastChecked: data.checkedAt
          };
        });
        setRailwayStatus(prev => ({ ...prev, ...newStatus }));
      }
    } catch (err) {
      console.error('Batch status check failed:', err);
    }
  };

  useEffect(() => {
    loadGenerations();
  }, [page]);

  const handleExport = () => {
    window.open(`${API_URL}/api/admin/export/generations`, '_blank');
  };

  const handleDelete = async (project) => {
    setDeleting(true);
    try {
      const result = await adminFetch(`/projects/${project.id}`, { method: 'DELETE' });
      if (result.success) {
        setDeleteModal(null);
        loadGenerations();
      } else {
        alert(`Delete failed: ${result.error || 'Unknown error'}`);
      }
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleRetryBuild = async (project) => {
    setRetrying(project.id);
    try {
      const result = await fetch(`${API_URL}/api/admin/retry-build/${project.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).then(r => r.json());

      if (result.success) {
        loadGenerations(); // Refresh to show new status
        if (result.build_passed) {
          alert(`Build passed! Project is ready for deployment.`);
        } else {
          alert(`Build still failing with ${result.audit?.error_count || 0} error(s).`);
        }
      } else {
        alert(`Retry failed: ${result.error || 'Unknown error'}`);
      }
    } catch (err) {
      alert(`Retry failed: ${err.message}`);
    } finally {
      setRetrying(null);
    }
  };

  // Link button component
  const LinkIcon = ({ url, icon, title }) => {
    if (!url) return null;
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        title={title}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '24px',
          height: '24px',
          fontSize: '14px',
          textDecoration: 'none',
          borderRadius: '4px',
          background: '#f3f4f6',
          cursor: 'pointer'
        }}
      >
        {icon}
      </a>
    );
  };

  // Check if row has build errors to show expand button
  const hasBuildInfo = (row) => {
    return row.build_errors?.length > 0 ||
           row.build_warnings?.length > 0 ||
           row.auto_fixes?.length > 0 ||
           row.status === 'build_failed' ||
           row.error_message;
  };

  // Expanded row content for build details
  const BuildDetails = ({ row }) => {
    const errors = row.build_errors || [];
    const warnings = row.build_warnings || [];
    const fixes = row.auto_fixes || [];
    const errorMsg = row.error_message;

    return (
      <div style={{
        background: '#f9fafb',
        borderTop: '1px solid #e5e7eb',
        padding: '16px 20px',
        fontSize: '13px'
      }}>
        {/* Error message for failed generations */}
        {errorMsg && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontWeight: '600', color: '#dc2626', marginBottom: '8px' }}>
              Error Message
            </div>
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              padding: '12px',
              color: '#991b1b',
              fontFamily: 'monospace',
              fontSize: '12px',
              whiteSpace: 'pre-wrap'
            }}>
              {errorMsg}
            </div>
          </div>
        )}

        {/* Build Errors */}
        {errors.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontWeight: '600', color: '#dc2626', marginBottom: '8px' }}>
              Build Errors ({errors.length})
            </div>
            {errors.map((err, i) => (
              <div key={i} style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                padding: '10px 12px',
                marginBottom: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ color: '#dc2626' }}>❌</span>
                  <div style={{ flex: 1 }}>
                    {err.file && (
                      <div style={{
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        color: '#6b7280',
                        marginBottom: '4px'
                      }}>
                        {err.file}{err.line ? `:${err.line}` : ''}{err.column ? `:${err.column}` : ''}
                      </div>
                    )}
                    <div style={{ color: '#991b1b' }}>{err.message || err.type}</div>
                    {err.suggestion && (
                      <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>
                        💡 {err.suggestion}
                      </div>
                    )}
                  </div>
                  {err.autoFixable && (
                    <span style={{
                      background: '#dbeafe',
                      color: '#1d4ed8',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '500'
                    }}>
                      Auto-fixable
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontWeight: '600', color: '#d97706', marginBottom: '8px' }}>
              Warnings ({warnings.length})
            </div>
            {warnings.map((warn, i) => (
              <div key={i} style={{
                background: '#fffbeb',
                border: '1px solid #fcd34d',
                borderRadius: '6px',
                padding: '10px 12px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px'
              }}>
                <span style={{ color: '#d97706' }}>⚠️</span>
                <div style={{ color: '#92400e' }}>{warn.message || warn.type}</div>
              </div>
            ))}
          </div>
        )}

        {/* Auto-fixes applied */}
        {fixes.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontWeight: '600', color: '#059669', marginBottom: '8px' }}>
              Auto-Fixes Applied ({fixes.length})
            </div>
            {fixes.map((fix, i) => (
              <div key={i} style={{
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '6px',
                padding: '10px 12px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px'
              }}>
                <span style={{ color: '#059669' }}>🔧</span>
                <div>
                  <div style={{ color: '#065f46' }}>{fix.description || fix.type}</div>
                  {fix.file && (
                    <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#6b7280' }}>
                      {fix.file}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Build info summary */}
        {row.build_result && (
          <div style={{
            display: 'flex',
            gap: '24px',
            fontSize: '12px',
            color: '#6b7280',
            marginBottom: '12px'
          }}>
            <span>Duration: {((row.build_result.duration_ms || 0) / 1000).toFixed(1)}s</span>
            {row.build_result.timestamp && (
              <span>Tested: {new Date(row.build_result.timestamp).toLocaleString()}</span>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
          {(row.status === 'build_failed' || row.status === 'failed') && (
            <button
              onClick={() => handleRetryBuild(row)}
              disabled={retrying === row.id}
              style={{
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '13px',
                cursor: retrying === row.id ? 'wait' : 'pointer',
                fontWeight: '500',
                opacity: retrying === row.id ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {retrying === row.id ? '⏳ Retrying...' : '🔄 Retry Build'}
            </button>
          )}
          {row.build_log && (
            <button
              onClick={() => setBuildLogModal(row)}
              style={{
                background: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '13px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              📄 View Build Log
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>Generations ({total})</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={refreshAllStatuses}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              background: '#10b98120',
              border: '1px solid #10b981',
              borderRadius: '6px',
              color: '#10b981',
              fontSize: '13px',
              cursor: 'pointer'
            }}
            title="Check Railway status for all deployed projects"
          >
            🔄 Check Status
          </button>
          <ExportButton onClick={handleExport} />
        </div>
      </div>

      {/* Custom table with expandable rows */}
      <div style={styles.card}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Loading...</div>
        ) : generations.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>No generations found</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '12px' }}></th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '12px' }}>ID</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '12px' }}>Type</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '12px' }}>Site Name</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '12px' }}>Industry</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '12px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '12px' }}>Cost</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '12px' }}>Links</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '12px' }}>Created</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '12px' }}></th>
              </tr>
            </thead>
            <tbody>
              {generations.map(row => (
                <React.Fragment key={row.id}>
                  <tr style={{
                    borderBottom: expandedRow === row.id ? 'none' : '1px solid #e5e7eb',
                    background: expandedRow === row.id ? '#f9fafb' : 'transparent'
                  }}>
                    <td style={{ padding: '12px 16px', width: '40px' }}>
                      {hasBuildInfo(row) && (
                        <button
                          onClick={() => setExpandedRow(expandedRow === row.id ? null : row.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '12px',
                            color: '#6b7280',
                            padding: '4px'
                          }}
                          title={expandedRow === row.id ? 'Collapse' : 'Expand build details'}
                        >
                          {expandedRow === row.id ? '▼' : '▶'}
                        </button>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#9ca3af' }}>{row.id}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <AppTypeBadge appType={row.app_type} parentProjectId={row.parent_project_id} />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {row.frontend_url ? (
                        <a href={row.frontend_url} target="_blank" rel="noopener noreferrer" style={{ ...styles.link, fontWeight: 600 }}>
                          {row.site_name || 'Unnamed'}
                        </a>
                      ) : (
                        <span style={{ color: '#f3f4f6', fontWeight: 600 }}>{row.site_name || 'Unnamed'}</span>
                      )}
                      {row.parent_project_id && row.app_type === 'companion-app' && (
                        <div style={{ fontSize: '11px', color: '#8b5cf6', marginTop: '2px' }}>
                          ↳ Parent: #{row.parent_project_id}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#d1d5db' }}>{row.industry}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <StatusBadge status={row.status} />
                      {row.build_errors?.length > 0 && (
                        <span style={{
                          marginLeft: '6px',
                          background: '#fef2f2',
                          color: '#dc2626',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: '500'
                        }}>
                          {row.build_errors.length} error{row.build_errors.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#d1d5db', fontWeight: 500 }}>
                      ${parseFloat(row.total_cost || 0).toFixed(4)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {row.status === 'deployed' && row.railway_project_id && (
                          <RailwayStatusBadge
                            status={railwayStatus[row.railway_project_id]?.status}
                            loading={railwayStatus[row.railway_project_id]?.loading}
                            onClick={() => checkRailwayStatus(row.railway_project_id)}
                          />
                        )}
                        <LinkIcon url={row.frontend_url} icon="🌐" title="Frontend" />
                        <LinkIcon url={row.admin_url} icon="📊" title="Admin Panel" />
                        <LinkIcon url={row.backend_url} icon="⚙️" title="Backend API" />
                        <LinkIcon url={row.github_frontend} icon="🐙" title="GitHub Frontend" />
                        <LinkIcon url={row.github_backend} icon="🐙" title="GitHub Backend" />
                        <LinkIcon url={row.railway_project_url} icon="🚂" title="Railway Project" />
                        {!row.frontend_url && !row.admin_url && !row.github_frontend && (
                          <span style={{ color: '#9ca3af', fontSize: '12px' }}>-</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#9ca3af' }}>
                      {new Date(row.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        onClick={() => setDeleteModal(row)}
                        style={{
                          background: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                        title="Delete project"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  {/* Expanded row */}
                  {expandedRow === row.id && hasBuildInfo(row) && (
                    <tr>
                      <td colSpan="10" style={{ padding: 0 }}>
                        <BuildDetails row={row} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination page={page} setPage={setPage} total={total} limit={25} />

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '450px',
            width: '90%',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
          }}>
            <h3 style={{ margin: '0 0 16px', color: '#dc2626' }}>Delete Project</h3>
            <p style={{ margin: '0 0 8px', color: '#374151' }}>
              Are you sure you want to delete <strong>{deleteModal.site_name}</strong>?
            </p>
            <p style={{ margin: '0 0 20px', color: '#6b7280', fontSize: '14px' }}>
              This will permanently remove:
            </p>
            <ul style={{ margin: '0 0 20px', paddingLeft: '20px', color: '#6b7280', fontSize: '14px' }}>
              <li>GitHub repositories (frontend, backend, admin)</li>
              <li>Railway project and all services</li>
              <li>Cloudflare DNS records</li>
              <li>Local project files</li>
              <li>Database records</li>
            </ul>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeleteModal(null)}
                disabled={deleting}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  background: '#fff',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteModal)}
                disabled={deleting}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#dc2626',
                  color: '#fff',
                  cursor: deleting ? 'wait' : 'pointer',
                  fontWeight: '500',
                  opacity: deleting ? 0.7 : 1
                }}
              >
                {deleting ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Build Log Modal */}
      {buildLogModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h3 style={{ margin: 0, color: '#111827' }}>
                Build Log - {buildLogModal.site_name}
              </h3>
              <button
                onClick={() => setBuildLogModal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '4px'
                }}
              >
                ×
              </button>
            </div>
            <div style={{
              flex: 1,
              overflow: 'auto',
              background: '#1f2937',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <pre style={{
                margin: 0,
                color: '#e5e7eb',
                fontFamily: 'Menlo, Monaco, Consolas, monospace',
                fontSize: '12px',
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {buildLogModal.build_log || 'No build log available'}
              </pre>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setBuildLogModal(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  background: '#fff',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// TAB 4: API COSTS
// ============================================

function CostAnalyticsPage() {
  const [data, setData] = useState(null);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminFetch(`/cost-analytics?startDate=${startDate}&endDate=${endDate}`)
      .then(setData)
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 style={styles.pageTitle}>API Cost Analytics</h1>

      <div style={styles.toolbar}>
        <DateFilter
          startDate={startDate}
          endDate={endDate}
          onStartChange={setStartDate}
          onEndChange={setEndDate}
        />
      </div>

      <div style={styles.statsGrid}>
        <StatCard
          title="Total API Cost"
          value={`$${parseFloat(data?.summary?.totalCost || 0).toFixed(2)}`}
          icon={<DollarSign size={24} />}
          color="#ef4444"
        />
        <StatCard
          title="Total Tokens"
          value={`${(parseFloat(data?.summary?.totalTokens || 0) / 1000).toFixed(0)}K`}
          icon={<Zap size={24} />}
          color="#f59e0b"
        />
        <StatCard
          title="Total Calls"
          value={(data?.summary?.totalCalls || 0).toLocaleString()}
          icon={<Activity size={24} />}
          color="#6366f1"
        />
        <StatCard
          title="Avg Cost/Call"
          value={`$${parseFloat(data?.summary?.avgCostPerCall || 0).toFixed(4)}`}
          icon={<TrendingUp size={24} />}
          color="#10b981"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Cost by Operation</h2>
          <DataTable
            data={data?.byOperation || []}
            columns={[
              { header: 'Operation', key: 'operation_type', render: v => <strong>{v}</strong> },
              { header: 'Calls', key: 'count', render: v => parseInt(v).toLocaleString() },
              { header: 'Tokens', key: 'total_tokens', render: v => parseInt(v).toLocaleString() },
              { header: 'Cost', key: 'total_cost', render: v => `$${parseFloat(v).toFixed(2)}` }
            ]}
          />
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Cost by Model</h2>
          <DataTable
            data={data?.byModel || []}
            columns={[
              { header: 'Model', key: 'model_used', render: v => <strong>{v}</strong> },
              { header: 'Calls', key: 'count', render: v => parseInt(v).toLocaleString() },
              { header: 'Cost', key: 'total_cost', render: v => `$${parseFloat(v).toFixed(2)}` }
            ]}
          />
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Daily Cost Trend</h2>
        <div style={styles.chartArea}>
          {(data?.dailyCosts || []).slice(-14).map((d, i) => (
            <div key={i} style={styles.barRow}>
              <span style={styles.barLabel}>{new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              <div style={styles.barTrack}>
                <div style={{
                  ...styles.bar,
                  width: `${Math.min(100, (parseFloat(d.total_cost) / Math.max(...(data?.dailyCosts || []).map(x => parseFloat(x.total_cost) || 0.01))) * 100)}%`,
                  backgroundColor: '#6366f1'
                }} />
              </div>
              <span style={styles.barValue}>${parseFloat(d.total_cost).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// TAB 5: REVENUE
// ============================================

function RevenuePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch('/revenue')
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 style={styles.pageTitle}>Revenue Analytics</h1>

      <div style={styles.statsGrid}>
        <StatCard
          title="Monthly Revenue (MRR)"
          value={`$${(data?.mrr || 0).toLocaleString()}`}
          icon={<DollarSign size={24} />}
          color="#10b981"
        />
        <StatCard
          title="Annual Run Rate (ARR)"
          value={`$${(data?.arr || 0).toLocaleString()}`}
          icon={<TrendingUp size={24} />}
          color="#6366f1"
        />
        <StatCard
          title="Total Lifetime Revenue"
          value={`$${(data?.totalRevenue || 0).toLocaleString()}`}
          icon={<DollarSign size={24} />}
          color="#8b5cf6"
        />
        <StatCard
          title="Net Profit (MTD)"
          value={`$${parseFloat(data?.netProfit || 0).toFixed(2)}`}
          subtitle={`Margin: ${data?.profitMargin || 0}%`}
          icon={<TrendingUp size={24} />}
          color={(data?.netProfit || 0) >= 0 ? '#10b981' : '#ef4444'}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Revenue by Tier</h2>
          <DataTable
            data={data?.byTier || []}
            columns={[
              { header: 'Tier', key: 'tier', render: v => <TierBadge tier={v} /> },
              { header: 'Users', key: 'count', render: v => parseInt(v).toLocaleString() },
              { header: 'MRR', key: 'mrr', render: v => `$${parseFloat(v || 0).toFixed(2)}` }
            ]}
          />
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Monthly Trend</h2>
          <DataTable
            data={(data?.monthly || []).slice(-6)}
            columns={[
              { header: 'Month', key: 'month', render: v => new Date(v).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) },
              { header: 'Revenue', key: 'revenue', render: v => `$${parseFloat(v || 0).toFixed(2)}` },
              { header: 'New Users', key: 'new_users', render: v => parseInt(v || 0) },
              { header: 'Churn', key: 'churned', render: v => parseInt(v || 0) }
            ]}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// TAB 6: INDUSTRIES
// ============================================

function IndustriesPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch('/industries')
      .then(res => setData(res.industries || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const total = data.reduce((sum, d) => sum + parseInt(d.count), 0);

  return (
    <div>
      <h1 style={styles.pageTitle}>Industry Analytics</h1>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Generations by Industry</h2>
        <div style={styles.chartArea}>
          {data.map((d, i) => {
            const pct = total > 0 ? (parseInt(d.count) / total * 100).toFixed(1) : 0;
            return (
              <div key={i} style={styles.barRow}>
                <span style={{ ...styles.barLabel, width: '150px' }}>{d.industry}</span>
                <div style={styles.barTrack}>
                  <div style={{
                    ...styles.bar,
                    width: `${pct}%`,
                    backgroundColor: `hsl(${i * 30}, 70%, 50%)`
                  }} />
                </div>
                <span style={styles.barValue}>{d.count} ({pct}%)</span>
              </div>
            );
          })}
        </div>
      </div>

      <DataTable
        data={data}
        columns={[
          { header: 'Industry', key: 'industry', render: v => <strong>{v}</strong> },
          { header: 'Generations', key: 'count', render: v => parseInt(v).toLocaleString() },
          { header: 'Avg Pages', key: 'avg_pages', render: v => parseFloat(v || 0).toFixed(1) },
          { header: 'Total Cost', key: 'total_cost', render: v => `$${parseFloat(v || 0).toFixed(2)}` },
          { header: 'Success Rate', key: 'success_rate', render: v => `${parseFloat(v || 0).toFixed(1)}%` }
        ]}
      />
    </div>
  );
}

// ============================================
// TAB 7: MODULES
// ============================================

function ModulesPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch('/modules')
      .then(res => setData(res.modules || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 style={styles.pageTitle}>Module Usage Analytics</h1>

      <DataTable
        data={data}
        columns={[
          { header: 'Module', key: 'module_name', render: v => <strong>{v}</strong> },
          { header: 'Usage Count', key: 'usage_count', render: v => parseInt(v).toLocaleString() },
          { header: 'Industries', key: 'industries_used', render: v => v || '-' },
          { header: 'Avg Cost', key: 'avg_cost', render: v => `$${parseFloat(v || 0).toFixed(4)}` }
        ]}
      />
    </div>
  );
}

// ============================================
// TAB 8: ERRORS
// ============================================

function ErrorsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch('/errors')
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 style={styles.pageTitle}>Error Monitoring</h1>

      <div style={styles.statsGrid}>
        <StatCard
          title="Total Errors (24h)"
          value={data?.errorsToday || 0}
          icon={<AlertTriangle size={24} />}
          color="#ef4444"
        />
        <StatCard
          title="Error Rate"
          value={`${parseFloat(data?.errorRate || 0).toFixed(2)}%`}
          icon={<Activity size={24} />}
          color="#f59e0b"
        />
        <StatCard
          title="Avg Response Time"
          value={`${(data?.avgResponseTime || 0)}ms`}
          icon={<Clock size={24} />}
          color="#6366f1"
        />
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Error Patterns</h2>
        <DataTable
          data={data?.patterns || []}
          columns={[
            { header: 'Error Type', key: 'error_type', render: v => <strong>{v}</strong> },
            { header: 'Count', key: 'count', render: v => parseInt(v) },
            { header: 'Last Occurrence', key: 'last_occurred', render: v => v ? new Date(v).toLocaleString() : '-' },
            { header: 'Affected Users', key: 'affected_users', render: v => v || 0 }
          ]}
        />
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Recent Errors</h2>
        <DataTable
          data={data?.recent || []}
          columns={[
            { header: 'Time', key: 'timestamp', render: v => new Date(v).toLocaleString() },
            { header: 'Operation', key: 'operation_type' },
            { header: 'Error', key: 'error_message', render: v => <span style={{ color: '#ef4444' }}>{v}</span> },
            { header: 'User', key: 'user_email', render: v => v || 'Anonymous' }
          ]}
        />
      </div>
    </div>
  );
}

// ============================================
// TAB 9: PERFORMANCE
// ============================================

function PerformancePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch('/performance')
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 style={styles.pageTitle}>Performance Metrics</h1>

      <div style={styles.statsGrid}>
        <StatCard
          title="Avg Generation Time"
          value={`${(parseFloat(data?.avgGenerationTime || 0) / 1000).toFixed(1)}s`}
          icon={<Clock size={24} />}
          color="#6366f1"
        />
        <StatCard
          title="P95 Response Time"
          value={`${(parseFloat(data?.p95ResponseTime || 0) / 1000).toFixed(1)}s`}
          icon={<Gauge size={24} />}
          color="#f59e0b"
        />
        <StatCard
          title="Throughput"
          value={`${data?.throughput || 0}/hr`}
          icon={<Activity size={24} />}
          color="#10b981"
        />
        <StatCard
          title="Success Rate"
          value={`${parseFloat(data?.successRate || 0).toFixed(1)}%`}
          icon={<CheckCircle2 size={24} />}
          color="#10b981"
        />
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Performance by Operation</h2>
        <DataTable
          data={data?.byOperation || []}
          columns={[
            { header: 'Operation', key: 'operation_type', render: v => <strong>{v}</strong> },
            { header: 'Avg Time', key: 'avg_duration', render: v => `${parseInt(v)}ms` },
            { header: 'P95 Time', key: 'p95_duration', render: v => `${parseInt(v)}ms` },
            { header: 'Count', key: 'count', render: v => parseInt(v).toLocaleString() }
          ]}
        />
      </div>
    </div>
  );
}

// ============================================
// TAB 10: TEMPLATES
// ============================================

function TemplatesPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch('/templates')
      .then(res => setData(res.templates || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 style={styles.pageTitle}>Template Analytics</h1>

      <DataTable
        data={data}
        columns={[
          { header: 'Template', key: 'template_name', render: v => <strong>{v}</strong> },
          { header: 'Usage Count', key: 'usage_count', render: v => parseInt(v).toLocaleString() },
          { header: 'Industries', key: 'industries_used', render: v => v || '-' },
          { header: 'Avg Pages', key: 'avg_pages', render: v => parseFloat(v || 0).toFixed(1) },
          { header: 'Success Rate', key: 'success_rate', render: v => `${parseFloat(v || 0).toFixed(1)}%` }
        ]}
      />
    </div>
  );
}

// ============================================
// TAB 11: EMAIL CAMPAIGNS
// ============================================

function EmailPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    adminFetch('/email/campaigns')
      .then(res => setCampaigns(res.campaigns || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>Email Campaigns</h1>
        <button onClick={() => setShowCreate(true)} style={styles.primaryBtn}>
          + New Campaign
        </button>
      </div>

      <DataTable
        data={campaigns}
        columns={[
          { header: 'Name', key: 'name', render: v => <strong>{v}</strong> },
          { header: 'Subject', key: 'subject' },
          { header: 'Status', key: 'status', render: v => <StatusBadge status={v} /> },
          { header: 'Target', key: 'target_tier', render: v => <TierBadge tier={v || 'all'} /> },
          { header: 'Sent', key: 'sent_count', render: v => v || 0 },
          { header: 'Opened', key: 'opened_count', render: v => v || 0 },
          { header: 'Open Rate', key: 'open_rate', render: (_, row) =>
            `${row.sent_count ? ((row.opened_count / row.sent_count) * 100).toFixed(1) : 0}%`
          },
          { header: 'Created', key: 'created_at', render: v => new Date(v).toLocaleDateString() }
        ]}
      />
    </div>
  );
}

// ============================================
// TAB 12: REFERRALS
// ============================================

function ReferralsPage() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newCode, setNewCode] = useState({ code: '', discount_percent: 20, max_uses: 100 });

  const fetchReferrals = () => {
    setLoading(true);
    adminFetch('/referrals')
      .then(res => setReferrals(res.referrals || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReferrals(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await adminFetch('/referrals', {
        method: 'POST',
        body: JSON.stringify(newCode)
      });
      setShowCreate(false);
      setNewCode({ code: '', discount_percent: 20, max_uses: 100 });
      fetchReferrals();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>Referral Codes</h1>
        <button onClick={() => setShowCreate(true)} style={styles.primaryBtn}>
          + New Code
        </button>
      </div>

      {showCreate && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3 style={{ color: '#fff', marginBottom: '16px' }}>Create Referral Code</h3>
            <form onSubmit={handleCreate}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Code</label>
                <input
                  type="text"
                  value={newCode.code}
                  onChange={e => setNewCode({ ...newCode, code: e.target.value.toUpperCase() })}
                  style={styles.input}
                  placeholder="SAVE20"
                  required
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Discount %</label>
                <input
                  type="number"
                  value={newCode.discount_percent}
                  onChange={e => setNewCode({ ...newCode, discount_percent: parseInt(e.target.value) })}
                  style={styles.input}
                  min="1"
                  max="100"
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Max Uses</label>
                <input
                  type="number"
                  value={newCode.max_uses}
                  onChange={e => setNewCode({ ...newCode, max_uses: parseInt(e.target.value) })}
                  style={styles.input}
                  min="1"
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="submit" style={styles.primaryBtn}>Create</button>
                <button type="button" onClick={() => setShowCreate(false)} style={styles.secondaryBtn}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DataTable
        data={referrals}
        columns={[
          { header: 'Code', key: 'code', render: v => <strong>{v}</strong> },
          { header: 'Discount', key: 'discount_percent', render: v => `${v}%` },
          { header: 'Uses', key: 'times_used', render: (v, row) => `${v || 0} / ${row.max_uses}` },
          { header: 'Status', key: 'is_active', render: v => <StatusBadge status={v ? 'active' : 'inactive'} /> },
          { header: 'Revenue', key: 'total_revenue', render: v => `$${parseFloat(v || 0).toFixed(2)}` },
          { header: 'Created', key: 'created_at', render: v => new Date(v).toLocaleDateString() }
        ]}
      />
    </div>
  );
}

// ============================================
// TAB 13: ALERTS
// ============================================

function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      adminFetch('/alerts'),
      adminFetch('/alerts/rules')
    ]).then(([alertsRes, rulesRes]) => {
      setAlerts(alertsRes.alerts || []);
      setRules(rulesRes.rules || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleResolve = async (alertId) => {
    try {
      await adminFetch(`/alerts/${alertId}/resolve`, { method: 'PUT' });
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 style={styles.pageTitle}>System Alerts</h1>

      <div style={styles.statsGrid}>
        <StatCard
          title="Active Alerts"
          value={alerts.filter(a => !a.resolved).length}
          icon={<Bell size={24} />}
          color="#ef4444"
        />
        <StatCard
          title="Critical"
          value={alerts.filter(a => !a.resolved && a.severity === 'critical').length}
          icon={<AlertTriangle size={24} />}
          color="#ef4444"
        />
        <StatCard
          title="Warnings"
          value={alerts.filter(a => !a.resolved && a.severity === 'warning').length}
          icon={<AlertTriangle size={24} />}
          color="#f59e0b"
        />
        <StatCard
          title="Alert Rules"
          value={rules.length}
          icon={<Settings size={24} />}
          color="#6366f1"
        />
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Recent Alerts</h2>
        <DataTable
          data={alerts.slice(0, 20)}
          columns={[
            { header: 'Severity', key: 'severity', render: v => <StatusBadge status={v} /> },
            { header: 'Title', key: 'title', render: v => <strong>{v}</strong> },
            { header: 'Message', key: 'message' },
            { header: 'Time', key: 'created_at', render: v => new Date(v).toLocaleString() },
            { header: 'Status', key: 'resolved', render: v => <StatusBadge status={v ? 'resolved' : 'active'} /> },
            { header: 'Action', key: 'id', render: (id, row) => (
              !row.resolved && (
                <button onClick={() => handleResolve(id)} style={styles.miniBtn}>
                  Resolve
                </button>
              )
            )}
          ]}
        />
      </div>
    </div>
  );
}

// ============================================
// TAB 14: DATA QUALITY
// ============================================

function DataQualityPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch('/data-quality')
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 style={styles.pageTitle}>Data Quality</h1>

      <div style={styles.statsGrid}>
        <StatCard
          title="Data Quality Score"
          value={`${data?.overallScore || 0}%`}
          icon={<CheckCircle2 size={24} />}
          color={(data?.overallScore || 0) >= 90 ? '#10b981' : '#f59e0b'}
        />
        <StatCard
          title="Issues Found"
          value={data?.issuesCount || 0}
          icon={<AlertTriangle size={24} />}
          color="#ef4444"
        />
        <StatCard
          title="Last Check"
          value={data?.lastCheck ? new Date(data.lastCheck).toLocaleTimeString() : 'Never'}
          icon={<RefreshCw size={24} />}
          color="#6366f1"
        />
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Quality Checks</h2>
        <DataTable
          data={data?.checks || []}
          columns={[
            { header: 'Check', key: 'check_name', render: v => <strong>{v}</strong> },
            { header: 'Status', key: 'passed', render: v => <StatusBadge status={v ? 'passed' : 'failed'} /> },
            { header: 'Records Affected', key: 'affected_count', render: v => parseInt(v || 0).toLocaleString() },
            { header: 'Last Run', key: 'last_run', render: v => v ? new Date(v).toLocaleString() : '-' }
          ]}
        />
      </div>
    </div>
  );
}

// ============================================
// TAB 15: CONFIG
// ============================================

function ConfigPage() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const fetchConfigs = () => {
    setLoading(true);
    adminFetch('/config')
      .then(res => setConfigs(res.configs || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchConfigs(); }, []);

  const handleSave = async (key, value) => {
    try {
      await adminFetch('/config', {
        method: 'PUT',
        body: JSON.stringify({ key, value })
      });
      setEditing(null);
      fetchConfigs();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 style={styles.pageTitle}>Platform Configuration</h1>

      <div style={styles.section}>
        <DataTable
          data={configs}
          columns={[
            { header: 'Key', key: 'config_key', render: v => <strong>{v}</strong> },
            { header: 'Value', key: 'config_value', render: (v, row) =>
              editing === row.config_key ? (
                <input
                  type="text"
                  defaultValue={v}
                  onBlur={e => handleSave(row.config_key, e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSave(row.config_key, e.target.value)}
                  style={styles.input}
                  autoFocus
                />
              ) : (
                <span onClick={() => setEditing(row.config_key)} style={{ cursor: 'pointer' }}>
                  {v}
                </span>
              )
            },
            { header: 'Category', key: 'category' },
            { header: 'Updated', key: 'updated_at', render: v => v ? new Date(v).toLocaleString() : '-' }
          ]}
        />
      </div>
    </div>
  );
}

// ============================================
// TAB 16: SYSTEM HEALTH
// ============================================

function SystemPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = () => {
    setLoading(true);
    adminFetch('/health')
      .then(setData)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>System Health</h1>
        <button onClick={fetchHealth} style={styles.secondaryBtn}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div style={styles.statsGrid}>
        <StatCard
          title="System Status"
          value={data?.status || 'Unknown'}
          icon={<Server size={24} />}
          color={data?.status === 'healthy' ? '#10b981' : '#ef4444'}
        />
        <StatCard
          title="Uptime"
          value={data?.uptime || '0h'}
          icon={<Clock size={24} />}
          color="#6366f1"
        />
        <StatCard
          title="Memory Usage"
          value={`${data?.memoryUsage || 0}%`}
          icon={<Gauge size={24} />}
          color={(data?.memoryUsage || 0) < 80 ? '#10b981' : '#ef4444'}
        />
        <StatCard
          title="Database Pool"
          value={`${data?.dbPoolUsed || 0}/${data?.dbPoolMax || 0}`}
          icon={<Server size={24} />}
          color="#f59e0b"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Services</h2>
          <div style={styles.quickStats}>
            {(data?.services || []).map((svc, i) => (
              <div key={i} style={styles.quickStatRow}>
                <span>{svc.name}</span>
                <StatusBadge status={svc.status} />
              </div>
            ))}
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Recent Activity</h2>
          <div style={styles.quickStats}>
            <div style={styles.quickStatRow}>
              <span>API Requests (1h)</span>
              <span>{data?.recentRequests || 0}</span>
            </div>
            <div style={styles.quickStatRow}>
              <span>Errors (1h)</span>
              <span style={{ color: '#ef4444' }}>{data?.recentErrors || 0}</span>
            </div>
            <div style={styles.quickStatRow}>
              <span>Active Sessions</span>
              <span>{data?.activeSessions || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// LOGIN PAGE
// ============================================

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Login failed');
      if (!data.user?.is_admin) throw new Error('Admin access required');

      localStorage.setItem('blink_admin_token', data.token);
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.loginContainer}>
      <div style={styles.loginCard}>
        <div style={styles.loginHeader}>
          <Zap size={48} color="#6366f1" />
          <h1 style={styles.loginTitle}>BLINK Admin</h1>
          <p style={styles.loginSubtitle}>Sign in to your admin dashboard</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={styles.input}
              placeholder="admin@blink.be1st.io"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={styles.input}
              placeholder="Enter password"
              required
            />
          </div>

          <button type="submit" style={styles.loginBtn} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ============================================
// SIDEBAR
// ============================================

function Sidebar({ currentPage, setPage, onLogout }) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'launchpad', label: 'Launchpad', icon: <Rocket size={20} />, highlight: true },
    { id: 'qa-suite', label: 'QA Suite', icon: <ClipboardCheck size={20} />, highlight: true },
    { id: 'scout', label: 'Scout', icon: <Search size={20} />, highlight: true },
    { id: 'research-lab', label: 'Research Lab', icon: <FlaskConical size={20} />, highlight: true },
    { id: 'style-preview', label: 'Style Preview', icon: <Layers size={20} />, highlight: true },
    { id: 'quickstart-dev', label: 'QuickStart Dev', icon: <Zap size={20} />, highlight: true },
    { id: 'test-lab', label: 'Test Lab', icon: <FlaskConical size={20} />, highlight: true },
    { id: 'screenshots', label: 'Screenshots', icon: <Camera size={20} />, highlight: true },
    { id: 'smart-template', label: 'Smart Template', icon: <Sparkles size={20} /> },
    { id: 'business-generator', label: 'Business Gen', icon: <Building2 size={20} /> },
    { id: 'platform-health', label: 'Health Check', icon: <Activity size={20} /> },
    { id: 'demo-tracker', label: 'Demo Tracker', icon: <Rocket size={20} /> },
    { id: 'users', label: 'Users', icon: <Users size={20} /> },
    { id: 'generations', label: 'Generations', icon: <Layers size={20} /> },
    { id: 'costs', label: 'API Costs', icon: <DollarSign size={20} /> },
    { id: 'revenue', label: 'Revenue', icon: <TrendingUp size={20} /> },
    { id: 'industries', label: 'Industries', icon: <Building2 size={20} /> },
    { id: 'modules', label: 'Modules', icon: <Package size={20} /> },
    { id: 'errors', label: 'Errors', icon: <AlertTriangle size={20} /> },
    { id: 'performance', label: 'Performance', icon: <Gauge size={20} /> },
    { id: 'templates', label: 'Templates', icon: <FileCode size={20} /> },
    { id: 'email', label: 'Email', icon: <Mail size={20} /> },
    { id: 'referrals', label: 'Referrals', icon: <Gift size={20} /> },
    { id: 'alerts', label: 'Alerts', icon: <Bell size={20} /> },
    { id: 'data-quality', label: 'Data Quality', icon: <CheckCircle2 size={20} /> },
    { id: 'config', label: 'Config', icon: <Settings size={20} /> },
    { id: 'system', label: 'System', icon: <Server size={20} /> },
    { id: 'backups', label: 'Backups', icon: <Archive size={20} /> }
  ];

  return (
    <div style={styles.sidebar}>
      <div style={styles.sidebarHeader}>
        <Zap size={28} color="#6366f1" />
        <span style={styles.sidebarTitle}>BLINK Admin</span>
      </div>

      <nav style={styles.nav}>
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            style={{
              ...styles.navItem,
              ...(currentPage === item.id ? styles.navItemActive : {})
            }}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div style={styles.sidebarFooter}>
        <button onClick={onLogout} style={styles.logoutBtn}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

// ============================================
// MAIN APP
// ============================================

export default function AdminApp({ skipAuth = false, startPage = 'overview' }) {
  const [admin, setAdmin] = useState(skipAuth ? { email: 'dev@blink.local', is_admin: true } : null);
  const [currentPage, setCurrentPage] = useState(startPage);
  const [loading, setLoading] = useState(!skipAuth);

  useEffect(() => {
    // Skip auth check if accessed from dev tools
    if (skipAuth) {
      setAdmin({ email: 'dev@blink.local', is_admin: true });
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('blink_admin_token');
    if (token) {
      adminFetch('/me')
        .then(data => setAdmin(data.admin || data.user))
        .catch(() => localStorage.removeItem('blink_admin_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [skipAuth]);

  const handleLogout = () => {
    localStorage.removeItem('blink_admin_token');
    setAdmin(null);
  };

  if (loading) return <LoadingSpinner />;

  if (!admin) {
    return <LoginPage onLogin={setAdmin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'overview': return <OverviewPage />;
      case 'launchpad': return <LaunchpadDashboard />;
      case 'qa-suite': return <QADashboard />;
      case 'scout': return <ScoutDashboard />;
      case 'research-lab': return <ResearchTestLab />;
      case 'style-preview': return <StylePreviewPage />;
      case 'quickstart-dev': return <QuickStartDevTool />;
      case 'test-lab': return <TestLabPage />;
      case 'screenshots': return <ScreenshotGallery />;
      case 'smart-template': return <SmartTemplateDevPage />;
      case 'business-generator': return <BusinessGeneratorPage />;
      case 'platform-health': return <PlatformHealthPage />;
      case 'demo-tracker': return <DemoTrackerPage />;
      case 'users': return <UsersPage />;
      case 'generations': return <GenerationsPage />;
      case 'costs': return <CostAnalyticsPage />;
      case 'revenue': return <RevenuePage />;
      case 'industries': return <IndustriesPage />;
      case 'modules': return <ModulesPage />;
      case 'errors': return <ErrorsPage />;
      case 'performance': return <PerformancePage />;
      case 'templates': return <TemplatesPage />;
      case 'email': return <EmailPage />;
      case 'referrals': return <ReferralsPage />;
      case 'alerts': return <AlertsPage />;
      case 'data-quality': return <DataQualityPage />;
      case 'config': return <ConfigPage />;
      case 'system': return <SystemPage />;
      case 'backups': return <BackupManager />;
      default: return <OverviewPage />;
    }
  };

  return (
    <AdminContext.Provider value={{ admin }}>
      <div style={styles.container}>
        <Sidebar currentPage={currentPage} setPage={setCurrentPage} onLogout={handleLogout} />
        <main style={styles.main}>
          {renderPage()}
        </main>
      </div>
    </AdminContext.Provider>
  );
}

// ============================================
// STYLES
// ============================================

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#0a0a0f'
  },
  sidebar: {
    width: '240px',
    backgroundColor: '#12121a',
    borderRight: '1px solid #2a2a3a',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    height: '100vh',
    overflowY: 'auto'
  },
  sidebarHeader: {
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '1px solid #2a2a3a'
  },
  sidebarTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#fff'
  },
  nav: {
    padding: '12px',
    flex: 1
  },
  navItem: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    marginBottom: '2px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: '#888',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  navItemActive: {
    backgroundColor: '#6366f120',
    color: '#6366f1'
  },
  sidebarFooter: {
    padding: '12px',
    borderTop: '1px solid #2a2a3a'
  },
  logoutBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    backgroundColor: 'transparent',
    border: '1px solid #2a2a3a',
    borderRadius: '6px',
    color: '#888',
    fontSize: '13px',
    cursor: 'pointer'
  },
  main: {
    flex: 1,
    marginLeft: '240px',
    padding: '24px'
  },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#fff',
    marginBottom: '24px'
  },
  toolbar: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
    flexWrap: 'wrap'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  },
  statCard: {
    backgroundColor: '#12121a',
    border: '1px solid #2a2a3a',
    borderRadius: '10px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },
  statIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statValue: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#fff'
  },
  statTitle: {
    fontSize: '13px',
    color: '#888'
  },
  statSubtitle: {
    fontSize: '11px',
    color: '#666',
    marginTop: '2px'
  },
  section: {
    backgroundColor: '#12121a',
    border: '1px solid #2a2a3a',
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '20px'
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '14px'
  },
  tableContainer: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    textAlign: 'left',
    padding: '10px 12px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#888',
    textTransform: 'uppercase',
    borderBottom: '1px solid #2a2a3a'
  },
  tr: {
    borderBottom: '1px solid #1a1a2a'
  },
  td: {
    padding: '10px 12px',
    fontSize: '13px',
    color: '#ccc'
  },
  badge: {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: 500,
    textTransform: 'capitalize'
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    marginTop: '20px'
  },
  paginationBtn: {
    padding: '6px 12px',
    backgroundColor: '#1a1a2e',
    border: '1px solid #2a2a3a',
    borderRadius: '6px',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center'
  },
  paginationText: {
    color: '#888',
    fontSize: '13px'
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 14px',
    backgroundColor: '#1a1a2e',
    border: '1px solid #2a2a3a',
    borderRadius: '8px',
    flex: 1,
    maxWidth: '300px'
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '13px',
    outline: 'none'
  },
  clearBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    padding: '0',
    display: 'flex'
  },
  dateFilter: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  dateInput: {
    padding: '8px 12px',
    backgroundColor: '#1a1a2e',
    border: '1px solid #2a2a3a',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '13px'
  },
  exportBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#1a1a2e',
    border: '1px solid #2a2a3a',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '13px',
    cursor: 'pointer'
  },
  primaryBtn: {
    padding: '10px 20px',
    backgroundColor: '#6366f1',
    border: 'none',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  secondaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: 'transparent',
    border: '1px solid #2a2a3a',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '13px',
    cursor: 'pointer'
  },
  miniSelect: {
    padding: '4px 8px',
    backgroundColor: '#1a1a2e',
    border: '1px solid #2a2a3a',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '12px'
  },
  miniBtn: {
    padding: '4px 10px',
    backgroundColor: 'transparent',
    border: '1px solid #2a2a3a',
    borderRadius: '4px',
    fontSize: '11px',
    cursor: 'pointer'
  },
  quickStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  quickStatRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #1a1a2a',
    color: '#ccc',
    fontSize: '13px'
  },
  chartArea: {
    padding: '16px',
    backgroundColor: '#0a0a0f',
    borderRadius: '8px'
  },
  barRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px'
  },
  barLabel: {
    width: '80px',
    fontSize: '11px',
    color: '#888',
    flexShrink: 0
  },
  barTrack: {
    flex: 1,
    height: '20px',
    backgroundColor: '#1a1a2e',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  bar: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease'
  },
  barValue: {
    width: '70px',
    fontSize: '12px',
    color: '#ccc',
    textAlign: 'right',
    flexShrink: 0
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: '#12121a',
    border: '1px solid #2a2a3a',
    borderRadius: '12px',
    padding: '24px',
    width: '100%',
    maxWidth: '400px'
  },
  inputGroup: {
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 500,
    color: '#ccc',
    marginBottom: '6px'
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    backgroundColor: '#0a0a0f',
    border: '1px solid #2a2a3a',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: '14px',
    color: '#888'
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid #2a2a3a',
    borderTop: '3px solid #6366f1',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loginContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0a0f',
    padding: '20px'
  },
  loginCard: {
    width: '100%',
    maxWidth: '380px',
    backgroundColor: '#12121a',
    border: '1px solid #2a2a3a',
    borderRadius: '14px',
    padding: '36px'
  },
  loginHeader: {
    textAlign: 'center',
    marginBottom: '28px'
  },
  loginTitle: {
    fontSize: '26px',
    fontWeight: 700,
    color: '#fff',
    marginTop: '14px'
  },
  loginSubtitle: {
    fontSize: '13px',
    color: '#888',
    marginTop: '6px'
  },
  loginBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#6366f1',
    border: 'none',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '8px'
  },
  error: {
    padding: '10px',
    backgroundColor: '#ef444420',
    border: '1px solid #ef4444',
    borderRadius: '6px',
    color: '#ef4444',
    fontSize: '13px',
    marginBottom: '16px'
  },
  link: {
    color: '#6366f1',
    textDecoration: 'none',
    cursor: 'pointer'
  },
  linkBtn: {
    display: 'inline-block',
    padding: '3px 8px',
    backgroundColor: '#10b98120',
    border: '1px solid #10b981',
    borderRadius: '4px',
    color: '#10b981',
    fontSize: '11px',
    fontWeight: 500,
    textDecoration: 'none',
    cursor: 'pointer'
  },
  downloadBtn: {
    display: 'inline-block',
    padding: '3px 8px',
    backgroundColor: '#6366f120',
    border: '1px solid #6366f1',
    borderRadius: '4px',
    color: '#6366f1',
    fontSize: '11px',
    fontWeight: 500,
    textDecoration: 'none',
    cursor: 'pointer'
  }
};
