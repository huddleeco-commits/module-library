/**
 * OneClickDeploy Component
 * Single-button deployment with real-time progress tracking
 *
 * Features:
 * - One-click deployment trigger
 * - Real-time SSE progress streaming
 * - Service health monitoring
 * - Deployment history
 * - Quick re-deploy functionality
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Rocket, RefreshCw, CheckCircle, XCircle, Clock, ExternalLink, Server, Database, Globe, Shield } from 'lucide-react';

const API_BASE = '';

// Deployment phases with icons and colors
const PHASE_CONFIG = {
  initializing: { icon: '🚀', color: '#6366f1', label: 'Initializing' },
  creating_project: { icon: '🔧', color: '#8b5cf6', label: 'Creating Project' },
  pushing_code: { icon: '📤', color: '#3b82f6', label: 'Pushing Code' },
  building: { icon: '🔨', color: '#f59e0b', label: 'Building' },
  deploying: { icon: '🚀', color: '#10b981', label: 'Deploying' },
  health_check: { icon: '🏥', color: '#06b6d4', label: 'Health Check' },
  complete: { icon: '✅', color: '#10b981', label: 'Complete' },
  failed: { icon: '❌', color: '#ef4444', label: 'Failed' }
};

// Service status icons
const ServiceIcon = ({ type }) => {
  switch (type) {
    case 'postgres':
    case 'database':
      return <Database size={16} />;
    case 'backend':
    case 'api':
      return <Server size={16} />;
    case 'frontend':
      return <Globe size={16} />;
    case 'admin':
      return <Shield size={16} />;
    default:
      return <Server size={16} />;
  }
};

export default function OneClickDeploy({
  projectPath,
  projectName,
  adminEmail = 'admin@be1st.io',
  appType = 'website',
  onDeployStart,
  onDeployComplete,
  onDeployError,
  showHistory = true,
  compact = false
}) {
  // State
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployPhase, setDeployPhase] = useState(null);
  const [deployProgress, setDeployProgress] = useState(0);
  const [deployMessage, setDeployMessage] = useState('');
  const [deployResult, setDeployResult] = useState(null);
  const [deployError, setDeployError] = useState(null);
  const [serviceStatus, setServiceStatus] = useState(null);
  const [recentDeployments, setRecentDeployments] = useState([]);
  const [isServiceReady, setIsServiceReady] = useState(null);

  // Check deployment service status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/one-click-deploy/status`);
        const data = await response.json();
        setIsServiceReady(data.ready);
      } catch (error) {
        setIsServiceReady(false);
      }
    };
    checkStatus();
  }, []);

  // Load recent deployments
  useEffect(() => {
    if (showHistory) {
      loadRecentDeployments();
    }
  }, [showHistory]);

  const loadRecentDeployments = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/one-click-deploy/recent?limit=5`);
      const data = await response.json();
      if (data.success) {
        setRecentDeployments(data.deployments || []);
      }
    } catch (error) {
      console.error('Failed to load recent deployments:', error);
    }
  };

  // Execute deployment
  const handleDeploy = useCallback(async () => {
    if (!projectPath || !projectName) {
      setDeployError('Project path and name are required');
      return;
    }

    setIsDeploying(true);
    setDeployPhase('initializing');
    setDeployProgress(0);
    setDeployMessage('Starting deployment...');
    setDeployResult(null);
    setDeployError(null);
    setServiceStatus(null);

    onDeployStart?.();

    try {
      const response = await fetch(`${API_BASE}/api/one-click-deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectPath,
          projectName,
          adminEmail,
          appType
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Deployment failed');
      }

      // Handle SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'progress') {
                setDeployPhase(data.phase);
                setDeployProgress(data.progress || 0);
                setDeployMessage(data.message || '');
              } else if (data.type === 'complete') {
                setDeployResult(data.result);
                setDeployPhase('complete');
                setDeployProgress(100);
                setDeployMessage('Deployment complete!');
                onDeployComplete?.(data.result);
                loadRecentDeployments();
              } else if (data.type === 'error') {
                throw new Error(data.error);
              }
            } catch (parseError) {
              if (parseError.message && !parseError.message.includes('parse')) {
                throw parseError;
              }
            }
          }
        }
      }

    } catch (error) {
      setDeployError(error.message);
      setDeployPhase('failed');
      onDeployError?.(error);
    } finally {
      setIsDeploying(false);
    }
  }, [projectPath, projectName, adminEmail, appType, onDeployStart, onDeployComplete, onDeployError]);

  // Quick re-deploy
  const handleRedeploy = useCallback(async (railwayProjectId) => {
    setIsDeploying(true);
    setDeployPhase('initializing');
    setDeployProgress(0);
    setDeployMessage('Initiating re-deployment...');
    setDeployResult(null);
    setDeployError(null);

    try {
      const response = await fetch(`${API_BASE}/api/one-click-deploy/redeploy/${railwayProjectId}`, {
        method: 'POST'
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'progress') {
                setDeployPhase(data.phase);
                setDeployProgress(data.progress || 0);
                setDeployMessage(data.message || '');
              } else if (data.type === 'complete') {
                setDeployResult(data.result);
                setDeployPhase('complete');
                setDeployProgress(100);
                setDeployMessage('Re-deployment initiated!');
                loadRecentDeployments();
              } else if (data.type === 'error') {
                throw new Error(data.error);
              }
            } catch (parseError) {
              if (parseError.message && !parseError.message.includes('parse')) {
                throw parseError;
              }
            }
          }
        }
      }

    } catch (error) {
      setDeployError(error.message);
      setDeployPhase('failed');
    } finally {
      setIsDeploying(false);
    }
  }, []);

  // Styles
  const styles = {
    container: {
      background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
      borderRadius: '16px',
      padding: compact ? '16px' : '24px',
      border: '1px solid rgba(255,255,255,0.1)'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: compact ? '12px' : '20px'
    },
    title: {
      fontSize: compact ? '16px' : '20px',
      fontWeight: '700',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    deployButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      padding: compact ? '12px 24px' : '16px 32px',
      fontSize: compact ? '14px' : '16px',
      fontWeight: '700',
      background: isDeploying
        ? 'rgba(99, 102, 241, 0.5)'
        : 'linear-gradient(135deg, #6366f1, #4f46e5)',
      color: '#fff',
      border: 'none',
      borderRadius: '12px',
      cursor: isDeploying || !isServiceReady ? 'not-allowed' : 'pointer',
      opacity: isServiceReady === false ? 0.5 : 1,
      transition: 'all 0.2s',
      boxShadow: isDeploying ? 'none' : '0 4px 16px rgba(99, 102, 241, 0.4)'
    },
    progressContainer: {
      marginTop: '20px'
    },
    progressBar: {
      height: '8px',
      background: 'rgba(255,255,255,0.1)',
      borderRadius: '4px',
      overflow: 'hidden',
      marginBottom: '12px'
    },
    progressFill: {
      height: '100%',
      background: `linear-gradient(90deg, ${PHASE_CONFIG[deployPhase]?.color || '#6366f1'}, ${PHASE_CONFIG[deployPhase]?.color || '#6366f1'}99)`,
      width: `${deployProgress}%`,
      transition: 'width 0.3s ease, background 0.3s ease',
      borderRadius: '4px'
    },
    phaseIndicator: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      color: PHASE_CONFIG[deployPhase]?.color || '#888'
    },
    message: {
      color: '#888',
      fontSize: '13px',
      marginTop: '8px'
    },
    resultContainer: {
      marginTop: '20px',
      padding: '16px',
      background: deployError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
      borderRadius: '12px',
      border: `1px solid ${deployError ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
    },
    resultTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '16px',
      fontWeight: '600',
      color: deployError ? '#ef4444' : '#10b981',
      marginBottom: '12px'
    },
    urlGrid: {
      display: 'grid',
      gridTemplateColumns: compact ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '12px',
      marginTop: '12px'
    },
    urlCard: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 12px',
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '8px',
      color: '#fff',
      fontSize: '13px',
      textDecoration: 'none',
      transition: 'background 0.2s'
    },
    historySection: {
      marginTop: '24px',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      paddingTop: '20px'
    },
    historyTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#888',
      marginBottom: '12px',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    },
    historyItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px',
      background: 'rgba(255,255,255,0.03)',
      borderRadius: '8px',
      marginBottom: '8px'
    },
    historyName: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#fff'
    },
    historyDate: {
      fontSize: '12px',
      color: '#666'
    },
    redeployBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 12px',
      fontSize: '12px',
      background: 'rgba(99, 102, 241, 0.2)',
      color: '#6366f1',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer'
    },
    serviceGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: '8px',
      marginTop: '12px'
    },
    serviceCard: (status) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      background: status?.isDeployed
        ? 'rgba(16, 185, 129, 0.1)'
        : status?.isFailed
          ? 'rgba(239, 68, 68, 0.1)'
          : 'rgba(255,255,255,0.05)',
      borderRadius: '8px',
      border: `1px solid ${
        status?.isDeployed
          ? 'rgba(16, 185, 129, 0.3)'
          : status?.isFailed
            ? 'rgba(239, 68, 68, 0.3)'
            : 'rgba(255,255,255,0.1)'
      }`
    }),
    serviceName: {
      fontSize: '12px',
      fontWeight: '500',
      color: '#fff',
      textTransform: 'capitalize'
    },
    serviceStatus: (status) => ({
      fontSize: '10px',
      color: status?.isDeployed
        ? '#10b981'
        : status?.isFailed
          ? '#ef4444'
          : '#f59e0b'
    })
  };

  // Render compact button only
  if (compact && !isDeploying && !deployResult) {
    return (
      <button
        onClick={handleDeploy}
        disabled={isDeploying || !isServiceReady}
        style={styles.deployButton}
        title={!isServiceReady ? 'Deployment service not configured' : 'Deploy to Railway'}
      >
        <Rocket size={18} />
        Deploy Now
      </button>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.title}>
          <Rocket size={compact ? 18 : 22} />
          One-Click Deploy
        </div>
        {isServiceReady === false && (
          <span style={{ fontSize: '12px', color: '#ef4444' }}>
            Service not configured
          </span>
        )}
      </div>

      {/* Deploy Button */}
      {!isDeploying && !deployResult && (
        <button
          onClick={handleDeploy}
          disabled={isDeploying || !isServiceReady}
          style={styles.deployButton}
        >
          {isDeploying ? (
            <>
              <RefreshCw size={18} className="spin" />
              Deploying...
            </>
          ) : (
            <>
              <Rocket size={18} />
              Deploy to Railway
            </>
          )}
        </button>
      )}

      {/* Progress */}
      {isDeploying && (
        <div style={styles.progressContainer}>
          <div style={styles.progressBar}>
            <div style={styles.progressFill} />
          </div>
          <div style={styles.phaseIndicator}>
            <span>{PHASE_CONFIG[deployPhase]?.icon}</span>
            <span>{PHASE_CONFIG[deployPhase]?.label}</span>
            <span style={{ color: '#666' }}>({deployProgress}%)</span>
          </div>
          <p style={styles.message}>{deployMessage}</p>
        </div>
      )}

      {/* Result */}
      {(deployResult || deployError) && (
        <div style={styles.resultContainer}>
          <div style={styles.resultTitle}>
            {deployError ? (
              <>
                <XCircle size={20} />
                Deployment Failed
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                Deployed Successfully!
              </>
            )}
          </div>

          {deployError ? (
            <p style={{ color: '#f87171', fontSize: '14px' }}>{deployError}</p>
          ) : (
            <>
              {deployResult?.urls && (
                <div style={styles.urlGrid}>
                  {deployResult.urls.frontend && (
                    <a
                      href={deployResult.urls.frontend}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.urlCard}
                    >
                      <Globe size={16} />
                      <span>Frontend</span>
                      <ExternalLink size={14} style={{ marginLeft: 'auto' }} />
                    </a>
                  )}
                  {deployResult.urls.admin && (
                    <a
                      href={deployResult.urls.admin}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.urlCard}
                    >
                      <Shield size={16} />
                      <span>Admin</span>
                      <ExternalLink size={14} style={{ marginLeft: 'auto' }} />
                    </a>
                  )}
                  {deployResult.urls.backend && (
                    <a
                      href={deployResult.urls.backend}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.urlCard}
                    >
                      <Server size={16} />
                      <span>Backend</span>
                      <ExternalLink size={14} style={{ marginLeft: 'auto' }} />
                    </a>
                  )}
                  {deployResult.urls.railway && (
                    <a
                      href={deployResult.urls.railway}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.urlCard}
                    >
                      <Clock size={16} />
                      <span>Railway Dashboard</span>
                      <ExternalLink size={14} style={{ marginLeft: 'auto' }} />
                    </a>
                  )}
                </div>
              )}

              {deployResult?.duration && (
                <p style={{ color: '#888', fontSize: '13px', marginTop: '12px' }}>
                  Deployed in {deployResult.duration}s
                </p>
              )}

              {/* Deploy another button */}
              <button
                onClick={handleDeploy}
                style={{
                  ...styles.deployButton,
                  marginTop: '16px',
                  background: 'rgba(99, 102, 241, 0.2)',
                  boxShadow: 'none'
                }}
              >
                <RefreshCw size={16} />
                Deploy Again
              </button>
            </>
          )}
        </div>
      )}

      {/* Service Status Grid */}
      {serviceStatus && (
        <div style={styles.serviceGrid}>
          {Object.entries(serviceStatus).map(([name, status]) => (
            <div key={name} style={styles.serviceCard(status)}>
              <ServiceIcon type={name} />
              <div>
                <div style={styles.serviceName}>{name}</div>
                <div style={styles.serviceStatus(status)}>
                  {status.isDeployed ? 'Online' : status.isFailed ? 'Failed' : 'Building'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Deployments */}
      {showHistory && recentDeployments.length > 0 && (
        <div style={styles.historySection}>
          <div style={styles.historyTitle}>Recent Deployments</div>
          {recentDeployments.slice(0, 5).map((deployment) => (
            <div key={deployment.id} style={styles.historyItem}>
              <div>
                <div style={styles.historyName}>{deployment.project_name}</div>
                <div style={styles.historyDate}>
                  {new Date(deployment.deployed_at || deployment.created_at).toLocaleDateString()}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {deployment.frontend_url && (
                  <a
                    href={deployment.frontend_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#6366f1' }}
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
                {deployment.railway_project_id && (
                  <button
                    onClick={() => handleRedeploy(deployment.railway_project_id)}
                    style={styles.redeployBtn}
                    disabled={isDeploying}
                  >
                    <RefreshCw size={12} />
                    Redeploy
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Named export for flexibility
export { OneClickDeploy };
