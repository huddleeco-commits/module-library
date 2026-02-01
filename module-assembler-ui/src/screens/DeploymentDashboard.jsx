/**
 * DeploymentDashboard Screen
 * Centralized deployment management with one-click deploy
 *
 * Features:
 * - One-click deployment for any project
 * - Real-time deployment status
 * - Deployment history
 * - Quick re-deploy functionality
 * - Service health monitoring
 */

import React, { useState, useEffect } from 'react';
import {
  Rocket,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Server,
  Database,
  Globe,
  Shield,
  AlertCircle,
  ChevronRight,
  Zap,
  Activity
} from 'lucide-react';
import OneClickDeploy from '../components/OneClickDeploy.jsx';

const API_BASE = '';

export default function DeploymentDashboard({ onBack, selectedProject = null }) {
  // State
  const [deployments, setDeployments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serviceStatus, setServiceStatus] = useState(null);
  const [activeDeployment, setActiveDeployment] = useState(null);
  const [pollingProject, setPollingProject] = useState(null);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  // Poll Railway status for active deployment
  useEffect(() => {
    if (!pollingProject) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE}/api/one-click-deploy/railway/${pollingProject}`);
        const data = await response.json();

        if (data.success) {
          if (data.allDeployed || data.hasFailure) {
            setPollingProject(null);
            loadData();
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [pollingProject]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [deploymentsRes, statsRes, statusRes] = await Promise.all([
        fetch(`${API_BASE}/api/one-click-deploy/recent?limit=20`),
        fetch(`${API_BASE}/api/deployments/stats/summary`),
        fetch(`${API_BASE}/api/one-click-deploy/status`)
      ]);

      const [deploymentsData, statsData, statusData] = await Promise.all([
        deploymentsRes.json(),
        statsRes.json(),
        statusRes.json()
      ]);

      if (deploymentsData.success) {
        setDeployments(deploymentsData.deployments || []);
      }
      if (statsData.success) {
        setStats(statsData.stats);
      }
      if (statusData.success) {
        setServiceStatus(statusData.services);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle deployment complete
  const handleDeployComplete = (result) => {
    if (result?.railwayProjectId) {
      setPollingProject(result.railwayProjectId);
    }
    loadData();
  };

  // Styles
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)',
      padding: '24px'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '32px'
    },
    backButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 16px',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '8px',
      color: '#fff',
      fontSize: '14px',
      cursor: 'pointer'
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '32px'
    },
    statCard: {
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '12px',
      padding: '20px'
    },
    statValue: {
      fontSize: '32px',
      fontWeight: '700',
      color: '#fff'
    },
    statLabel: {
      fontSize: '13px',
      color: '#888',
      marginTop: '4px'
    },
    mainGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 400px',
      gap: '24px'
    },
    section: {
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px',
      padding: '24px'
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#fff',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    deploymentList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    deploymentCard: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px',
      background: 'rgba(255,255,255,0.03)',
      borderRadius: '12px',
      border: '1px solid rgba(255,255,255,0.06)',
      transition: 'all 0.2s'
    },
    deploymentInfo: {
      flex: 1
    },
    deploymentName: {
      fontSize: '15px',
      fontWeight: '600',
      color: '#fff',
      marginBottom: '4px'
    },
    deploymentMeta: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '12px',
      color: '#666'
    },
    statusBadge: (status) => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '4px 8px',
      borderRadius: '6px',
      fontSize: '11px',
      fontWeight: '500',
      background: status === 'deployed'
        ? 'rgba(16, 185, 129, 0.15)'
        : status === 'building'
          ? 'rgba(245, 158, 11, 0.15)'
          : 'rgba(239, 68, 68, 0.15)',
      color: status === 'deployed'
        ? '#10b981'
        : status === 'building'
          ? '#f59e0b'
          : '#ef4444'
    }),
    deploymentActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    actionBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '32px',
      height: '32px',
      borderRadius: '8px',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      color: '#888',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    serviceStatusGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '12px',
      marginTop: '20px'
    },
    serviceCard: (ready) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '12px',
      background: ready ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
      borderRadius: '10px',
      border: `1px solid ${ready ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
    }),
    serviceName: {
      fontSize: '13px',
      fontWeight: '500',
      color: '#fff',
      textTransform: 'capitalize'
    },
    serviceReady: (ready) => ({
      fontSize: '11px',
      color: ready ? '#10b981' : '#ef4444'
    }),
    emptyState: {
      textAlign: 'center',
      padding: '48px 24px',
      color: '#666'
    },
    quickDeployPanel: {
      position: 'sticky',
      top: '24px'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <RefreshCw size={32} style={{ color: '#6366f1', animation: 'spin 1s linear infinite' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backButton}>
          <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />
          Back
        </button>
        <div style={styles.title}>
          <Rocket size={28} />
          Deployment Center
        </div>
        <button
          onClick={loadData}
          style={styles.backButton}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats?.total_deployed || 0}</div>
          <div style={styles.statLabel}>Total Deployed</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats?.websites || 0}</div>
          <div style={styles.statLabel}>Websites</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats?.companion_apps || 0}</div>
          <div style={styles.statLabel}>Companion Apps</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats?.deployed_today || 0}</div>
          <div style={styles.statLabel}>Deployed Today</div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={styles.mainGrid}>
        {/* Deployments List */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>
            <Activity size={20} />
            Recent Deployments
          </div>

          {deployments.length === 0 ? (
            <div style={styles.emptyState}>
              <Rocket size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
              <p>No deployments yet</p>
              <p style={{ fontSize: '13px', marginTop: '8px' }}>
                Generate a project and deploy it to see it here
              </p>
            </div>
          ) : (
            <div style={styles.deploymentList}>
              {deployments.map((deployment) => (
                <div
                  key={deployment.id}
                  style={styles.deploymentCard}
                  onClick={() => setActiveDeployment(deployment)}
                >
                  <div style={styles.deploymentInfo}>
                    <div style={styles.deploymentName}>
                      {deployment.project_name || deployment.site_name}
                    </div>
                    <div style={styles.deploymentMeta}>
                      <span style={styles.statusBadge(deployment.status)}>
                        {deployment.status === 'deployed' ? (
                          <CheckCircle size={12} />
                        ) : deployment.status === 'building' ? (
                          <Clock size={12} />
                        ) : (
                          <AlertCircle size={12} />
                        )}
                        {deployment.status}
                      </span>
                      <span>{deployment.industry}</span>
                      <span>
                        {new Date(deployment.deployed_at || deployment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div style={styles.deploymentActions}>
                    {deployment.frontend_url && (
                      <a
                        href={deployment.frontend_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.actionBtn}
                        onClick={(e) => e.stopPropagation()}
                        title="Open Site"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                    {deployment.railway_project_id && (
                      <a
                        href={deployment.railway_project_url || `https://railway.app/project/${deployment.railway_project_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.actionBtn}
                        onClick={(e) => e.stopPropagation()}
                        title="Railway Dashboard"
                      >
                        <Server size={14} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Deploy Panel */}
        <div style={styles.quickDeployPanel}>
          {/* One-Click Deploy Component */}
          {selectedProject ? (
            <OneClickDeploy
              projectPath={selectedProject.path}
              projectName={selectedProject.name}
              onDeployComplete={handleDeployComplete}
              showHistory={false}
            />
          ) : (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>
                <Zap size={20} />
                Quick Deploy
              </div>
              <div style={{ ...styles.emptyState, padding: '24px' }}>
                <p style={{ color: '#888' }}>
                  Select a project from the list or generate a new one to deploy
                </p>
              </div>
            </div>
          )}

          {/* Service Status */}
          <div style={{ ...styles.section, marginTop: '16px' }}>
            <div style={styles.sectionTitle}>
              <Shield size={20} />
              Service Status
            </div>
            {serviceStatus && (
              <div style={styles.serviceStatusGrid}>
                <div style={styles.serviceCard(serviceStatus.railway)}>
                  <Server size={18} />
                  <div>
                    <div style={styles.serviceName}>Railway</div>
                    <div style={styles.serviceReady(serviceStatus.railway)}>
                      {serviceStatus.railway ? 'Connected' : 'Not Configured'}
                    </div>
                  </div>
                </div>
                <div style={styles.serviceCard(serviceStatus.github)}>
                  <Database size={18} />
                  <div>
                    <div style={styles.serviceName}>GitHub</div>
                    <div style={styles.serviceReady(serviceStatus.github)}>
                      {serviceStatus.github ? 'Connected' : 'Not Configured'}
                    </div>
                  </div>
                </div>
                <div style={styles.serviceCard(serviceStatus.cloudflare)}>
                  <Globe size={18} />
                  <div>
                    <div style={styles.serviceName}>Cloudflare</div>
                    <div style={styles.serviceReady(serviceStatus.cloudflare)}>
                      {serviceStatus.cloudflare ? 'Connected' : 'Not Configured'}
                    </div>
                  </div>
                </div>
                <div style={styles.serviceCard(serviceStatus.database)}>
                  <Database size={18} />
                  <div>
                    <div style={styles.serviceName}>Database</div>
                    <div style={styles.serviceReady(serviceStatus.database)}>
                      {serviceStatus.database ? 'Connected' : 'Not Configured'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Spinning animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export { DeploymentDashboard };
