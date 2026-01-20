/**
 * MyDeploymentsPage
 * User-facing dashboard showing all their deployed sites
 * Groups websites with their companion apps
 */

import React, { useState, useEffect } from 'react';
import { styles } from '../styles';

const API_URL = window.location.origin;

// Styles specific to this page
const deployStyles = {
  container: {
    padding: '32px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#fff',
    margin: 0
  },
  subtitle: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.6)',
    marginTop: '4px'
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: 'rgba(99, 102, 241, 0.2)',
    border: '1px solid rgba(99, 102, 241, 0.5)',
    borderRadius: '8px',
    color: '#6366f1',
    fontSize: '14px',
    cursor: 'pointer'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '16px',
    border: '1px dashed rgba(255,255,255,0.1)'
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px'
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '8px'
  },
  emptyText: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.5)'
  },
  projectGroup: {
    marginBottom: '24px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.08)',
    overflow: 'hidden'
  },
  projectHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px 24px',
    background: 'rgba(255,255,255,0.02)',
    borderBottom: '1px solid rgba(255,255,255,0.05)'
  },
  projectIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px'
  },
  projectInfo: {
    flex: 1
  },
  projectName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '4px'
  },
  projectDomain: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.6)'
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500'
  },
  projectBody: {
    padding: '20px 24px'
  },
  urlGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
    marginBottom: '16px'
  },
  urlCard: {
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.05)'
  },
  urlLabel: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px'
  },
  urlLink: {
    fontSize: '13px',
    color: '#6366f1',
    textDecoration: 'none',
    wordBreak: 'break-all'
  },
  companionSection: {
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid rgba(255,255,255,0.05)'
  },
  companionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
    fontSize: '14px',
    color: 'rgba(255,255,255,0.7)'
  },
  companionCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.1))',
    borderRadius: '12px',
    border: '1px solid rgba(139, 92, 246, 0.2)'
  },
  companionIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'rgba(139, 92, 246, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px'
  },
  actionBar: {
    display: 'flex',
    gap: '8px',
    marginTop: '16px'
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s'
  },
  primaryAction: {
    background: '#6366f1',
    color: '#fff'
  },
  secondaryAction: {
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.1)'
  },
  dangerAction: {
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.2)'
  }
};

function StatusBadge({ status, railwayStatus }) {
  const displayStatus = railwayStatus || status;
  const config = {
    'deployed': { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', icon: '🟢', label: 'Live' },
    'healthy': { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', icon: '🟢', label: 'Healthy' },
    'building': { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', icon: '🟡', label: 'Building' },
    'down': { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', icon: '🔴', label: 'Down' },
    'failed': { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', icon: '🔴', label: 'Failed' },
    'sleeping': { bg: 'rgba(107, 114, 128, 0.15)', color: '#6b7280', icon: '😴', label: 'Sleeping' }
  };
  const c = config[displayStatus] || config['deployed'];

  return (
    <div style={{ ...deployStyles.statusBadge, background: c.bg, color: c.color }}>
      <span>{c.icon}</span>
      <span>{c.label}</span>
    </div>
  );
}

function DomainBadge({ domainType }) {
  const isApp = domainType === 'be1st.app';
  return (
    <span style={{
      padding: '2px 8px',
      borderRadius: '4px',
      fontSize: '10px',
      fontWeight: '600',
      background: isApp ? 'rgba(139, 92, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)',
      color: isApp ? '#8b5cf6' : '#10b981'
    }}>
      {domainType}
    </span>
  );
}

function ProjectCard({ project, companions, railwayStatus, onCheckStatus, onRedeploy, onDelete }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const urls = [
    { label: 'Website', url: project.frontend_url, icon: '🌐' },
    { label: 'Admin Panel', url: project.admin_url, icon: '📊' },
    { label: 'API', url: project.backend_url, icon: '⚙️' },
    { label: 'GitHub', url: project.github_frontend, icon: '🐙' },
    { label: 'Railway', url: project.railway_project_url, icon: '🚂' }
  ].filter(u => u.url);

  const isApp = project.app_type === 'advanced-app';

  return (
    <div style={deployStyles.projectGroup}>
      <div style={deployStyles.projectHeader}>
        <div style={{
          ...deployStyles.projectIcon,
          background: isApp
            ? 'linear-gradient(135deg, #f59e0b, #d97706)'
            : 'linear-gradient(135deg, #10b981, #059669)'
        }}>
          {isApp ? '⚡' : '🌐'}
        </div>
        <div style={deployStyles.projectInfo}>
          <div style={deployStyles.projectName}>{project.site_name || 'Untitled'}</div>
          <div style={deployStyles.projectDomain}>
            {project.frontend_url?.replace('https://', '') || `${project.site_name}.be1st.io`}
            <DomainBadge domainType={project.domain_type || 'be1st.io'} />
          </div>
        </div>
        <StatusBadge
          status={project.status}
          railwayStatus={railwayStatus?.status}
        />
      </div>

      <div style={deployStyles.projectBody}>
        {/* URL Grid */}
        <div style={deployStyles.urlGrid}>
          {urls.map((item, i) => (
            <div key={i} style={deployStyles.urlCard}>
              <div style={deployStyles.urlLabel}>{item.icon} {item.label}</div>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                style={deployStyles.urlLink}
              >
                {item.url.replace('https://', '').substring(0, 40)}...
              </a>
            </div>
          ))}
        </div>

        {/* Companion Apps */}
        {companions && companions.length > 0 && (
          <div style={deployStyles.companionSection}>
            <div style={deployStyles.companionHeader}>
              <span>📱</span>
              <span>Companion Apps ({companions.length})</span>
            </div>
            {companions.map((comp, i) => (
              <div key={i} style={{ ...deployStyles.companionCard, marginBottom: i < companions.length - 1 ? '8px' : 0 }}>
                <div style={deployStyles.companionIcon}>📱</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>
                    {comp.site_name || 'Companion App'}
                  </div>
                  <a
                    href={comp.frontend_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '12px', color: '#8b5cf6' }}
                  >
                    {comp.frontend_url?.replace('https://', '')}
                  </a>
                </div>
                <DomainBadge domainType="be1st.app" />
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div style={deployStyles.actionBar}>
          <button
            style={{ ...deployStyles.actionBtn, ...deployStyles.primaryAction }}
            onClick={() => window.open(project.frontend_url, '_blank')}
          >
            🌐 Visit Site
          </button>
          {project.admin_url && (
            <button
              style={{ ...deployStyles.actionBtn, ...deployStyles.secondaryAction }}
              onClick={() => window.open(project.admin_url, '_blank')}
            >
              📊 Admin
            </button>
          )}
          <button
            style={{ ...deployStyles.actionBtn, ...deployStyles.secondaryAction }}
            onClick={() => onCheckStatus(project.railway_project_id)}
          >
            🔄 Check Status
          </button>
          {project.railway_project_id && (
            <button
              style={{ ...deployStyles.actionBtn, ...deployStyles.secondaryAction }}
              onClick={() => onRedeploy(project.railway_project_id)}
            >
              🚀 Redeploy
            </button>
          )}
          {!showDeleteConfirm ? (
            <button
              style={{ ...deployStyles.actionBtn, ...deployStyles.dangerAction }}
              onClick={() => setShowDeleteConfirm(true)}
            >
              🗑️ Delete
            </button>
          ) : (
            <>
              <button
                style={{ ...deployStyles.actionBtn, background: '#ef4444', color: '#fff' }}
                onClick={() => {
                  onDelete(project.id);
                  setShowDeleteConfirm(false);
                }}
              >
                Confirm Delete
              </button>
              <button
                style={{ ...deployStyles.actionBtn, ...deployStyles.secondaryAction }}
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function MyDeploymentsPage({ onBack, onCreateNew }) {
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [railwayStatuses, setRailwayStatuses] = useState({});
  const [error, setError] = useState(null);

  // Fetch deployments
  const loadDeployments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/deployments/my`);
      const data = await res.json();
      if (data.success) {
        setDeployments(data.deployments || []);
      } else {
        setError(data.error || 'Failed to load deployments');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Check Railway status
  const checkRailwayStatus = async (projectId) => {
    if (!projectId) return;

    setRailwayStatuses(prev => ({
      ...prev,
      [projectId]: { loading: true }
    }));

    try {
      const res = await fetch(`${API_URL}/api/railway/status/${projectId}`);
      const data = await res.json();

      setRailwayStatuses(prev => ({
        ...prev,
        [projectId]: {
          status: data.success ? data.overallStatus?.status : 'unknown',
          loading: false
        }
      }));
    } catch (err) {
      setRailwayStatuses(prev => ({
        ...prev,
        [projectId]: { status: 'unknown', loading: false }
      }));
    }
  };

  // Redeploy project
  const handleRedeploy = async (projectId) => {
    try {
      const res = await fetch(`${API_URL}/api/railway/redeploy/${projectId}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        alert('Redeploy triggered successfully!');
        checkRailwayStatus(projectId);
      } else {
        alert(`Redeploy failed: ${data.error}`);
      }
    } catch (err) {
      alert(`Redeploy failed: ${err.message}`);
    }
  };

  // Delete project
  const handleDelete = async (projectId) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('blink_admin_token')}`
        }
      });
      const data = await res.json();
      if (data.success) {
        loadDeployments();
      } else {
        alert(`Delete failed: ${data.error}`);
      }
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  useEffect(() => {
    loadDeployments();
  }, []);

  // Group deployments: websites with their companion apps
  const groupedDeployments = deployments.reduce((acc, dep) => {
    if (dep.app_type === 'companion-app' && dep.parent_project_id) {
      // Add to parent's companions array
      if (!acc.companions) acc.companions = {};
      if (!acc.companions[dep.parent_project_id]) acc.companions[dep.parent_project_id] = [];
      acc.companions[dep.parent_project_id].push(dep);
    } else {
      // It's a main project (website or standalone app)
      if (!acc.projects) acc.projects = [];
      acc.projects.push(dep);
    }
    return acc;
  }, { projects: [], companions: {} });

  if (loading) {
    return (
      <div style={deployStyles.container}>
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
          <div style={{ color: 'rgba(255,255,255,0.6)' }}>Loading your deployments...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={deployStyles.container}>
      {/* Header */}
      <div style={deployStyles.header}>
        <div>
          <h1 style={deployStyles.title}>My Deployments</h1>
          <p style={deployStyles.subtitle}>
            {groupedDeployments.projects?.length || 0} sites deployed
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={deployStyles.refreshBtn} onClick={loadDeployments}>
            🔄 Refresh
          </button>
          {onBack && (
            <button
              style={{ ...deployStyles.refreshBtn, background: 'rgba(255,255,255,0.1)', color: '#fff' }}
              onClick={onBack}
            >
              ← Back
            </button>
          )}
          {onCreateNew && (
            <button
              style={{ ...deployStyles.refreshBtn, background: '#6366f1', color: '#fff', border: 'none' }}
              onClick={onCreateNew}
            >
              + New Site
            </button>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div style={{
          padding: '16px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          color: '#ef4444',
          marginBottom: '24px'
        }}>
          {error}
        </div>
      )}

      {/* Empty State */}
      {!error && groupedDeployments.projects?.length === 0 && (
        <div style={deployStyles.emptyState}>
          <div style={deployStyles.emptyIcon}>🚀</div>
          <div style={deployStyles.emptyTitle}>No deployments yet</div>
          <div style={deployStyles.emptyText}>
            Create your first website to see it here
          </div>
          {onCreateNew && (
            <button
              style={{
                marginTop: '20px',
                padding: '12px 24px',
                background: '#6366f1',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
              onClick={onCreateNew}
            >
              Create Your First Site
            </button>
          )}
        </div>
      )}

      {/* Project Cards */}
      {groupedDeployments.projects?.map(project => (
        <ProjectCard
          key={project.id}
          project={project}
          companions={groupedDeployments.companions[project.id]}
          railwayStatus={railwayStatuses[project.railway_project_id]}
          onCheckStatus={checkRailwayStatus}
          onRedeploy={handleRedeploy}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
