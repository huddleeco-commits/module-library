/**
 * Platform Health & Test Center
 * Visual dashboard for testing and monitoring all platform components
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  Server,
  Database,
  Code,
  Layers,
  FileCode,
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Play,
  ChevronDown,
  ChevronRight,
  Clock,
  Cpu,
  HardDrive,
  Globe,
  Settings,
  Package,
  LayoutGrid,
  Eye,
  Terminal,
  Bot
} from 'lucide-react';
import AIAssistPanel from './AIAssistPanel';

const API_URL = window.location.origin;

// ============================================
// HELPER COMPONENTS
// ============================================

function StatusIcon({ status, size = 16 }) {
  switch (status) {
    case 'healthy':
      return <CheckCircle2 size={size} color="#10b981" />;
    case 'warning':
      return <AlertTriangle size={size} color="#f59e0b" />;
    case 'isolated':
      // Expected isolation issue - not a real error
      return <AlertTriangle size={size} color="#6b7280" />;
    case 'error':
    case 'degraded':
      return <XCircle size={size} color="#ef4444" />;
    case 'running':
      return <RefreshCw size={size} color="#6366f1" className="spin" />;
    default:
      return <Activity size={size} color="#6b7280" />;
  }
}

function HealthScoreRing({ score, size = 120 }) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (score) => {
    if (score >= 90) return '#10b981';
    if (score >= 70) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1a1a2e"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(score)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '28px', fontWeight: 700, color: getColor(score) }}>{score}%</div>
        <div style={{ fontSize: '11px', color: '#888' }}>Health</div>
      </div>
    </div>
  );
}

function CategoryCard({ category, icon, onClick, isExpanded }) {
  const status = category.status || 'unknown';
  const score = category.summary?.healthScore || 0;

  return (
    <div
      onClick={onClick}
      style={{
        ...styles.categoryCard,
        borderColor: status === 'healthy' ? '#10b98140' : status === 'warning' ? '#f59e0b40' : '#ef444440',
        cursor: 'pointer'
      }}
    >
      <div style={styles.categoryHeader}>
        <div style={{ ...styles.categoryIcon, backgroundColor: status === 'healthy' ? '#10b98120' : status === 'warning' ? '#f59e0b20' : '#ef444420' }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={styles.categoryName}>{category.name}</div>
          <div style={styles.categoryStats}>
            {category.summary?.total || category.summary?.totalModules || 0} items
            {category.summary?.healthy !== undefined && ` • ${category.summary.healthy} healthy`}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <StatusIcon status={status} size={20} />
          <span style={{ fontSize: '18px', fontWeight: 600, color: status === 'healthy' ? '#10b981' : status === 'warning' ? '#f59e0b' : '#ef4444' }}>
            {score}%
          </span>
          {isExpanded ? <ChevronDown size={20} color="#888" /> : <ChevronRight size={20} color="#888" />}
        </div>
      </div>
    </div>
  );
}

function ModuleItem({ item, onTest, onAIAssist }) {
  const status = item.status || 'unknown';
  // Only show AI Fix for real errors, not isolated module issues
  const isClickable = status === 'error' && onAIAssist;

  return (
    <div
      style={{
        ...styles.moduleItem,
        cursor: isClickable ? 'pointer' : 'default',
        ...(isClickable && { ':hover': { backgroundColor: '#1a1a2e' } })
      }}
      onClick={isClickable ? () => onAIAssist(item) : undefined}
    >
      <StatusIcon status={status} />
      <div style={{ flex: 1 }}>
        <div style={styles.moduleName}>{item.name}</div>
        {item.relativePath && <div style={styles.modulePath}>{item.relativePath}</div>}
        {item.error && (
          <div style={{
            ...styles.moduleError,
            color: item.status === 'isolated' ? '#6b7280' : '#ef4444'
          }}>
            {item.status === 'isolated' && '(Expected) '}
            {item.error}
          </div>
        )}
        {item.issues?.length > 0 && (
          <div style={styles.moduleIssues}>
            {item.issues.map((issue, i) => (
              <span key={i} style={styles.issueTag}>{issue}</span>
            ))}
          </div>
        )}
      </div>
      <div style={styles.moduleStats}>
        {item.loadTime && <span style={styles.statBadge}>{item.loadTime}ms</span>}
        {item.size && <span style={styles.statBadge}>{Math.round(item.size / 1024)}KB</span>}
        {item.lineCount && <span style={styles.statBadge}>{item.lineCount} lines</span>}
      </div>
      {isClickable && (
        <span style={styles.aiAssistBadge} title="Click to debug with AI">
          <Bot size={14} />
          AI Fix
        </span>
      )}
      {onTest && (
        <button onClick={(e) => { e.stopPropagation(); onTest(item); }} style={styles.testBtn}>
          <Play size={12} />
          Test
        </button>
      )}
    </div>
  );
}

function ExpandedCategory({ category, categoryName, onAIAssist }) {
  const items = category.categories || category.effects || category.templates ||
    category.services || category.checks || category.paths || category.apis ||
    category.admin || [];

  // Handle nested structure for backend modules
  if (category.categories) {
    return (
      <div style={styles.expandedContent}>
        {category.categories.map((cat, i) => (
          <div key={i} style={styles.subCategory}>
            <div style={styles.subCategoryHeader}>
              <Package size={14} color="#888" />
              <span style={styles.subCategoryName}>{cat.category}</span>
              <span style={styles.subCategoryCount}>{cat.total} files • {cat.passed} passed</span>
            </div>
            <div style={styles.moduleList}>
              {(cat.files || []).map((file, j) => (
                <ModuleItem key={j} item={file} onAIAssist={onAIAssist} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Handle admin components with multiple sections
  if (category.components) {
    return (
      <div style={styles.expandedContent}>
        {['admin', 'components', 'screens', 'hooks'].map(section => (
          category[section]?.length > 0 && (
            <div key={section} style={styles.subCategory}>
              <div style={styles.subCategoryHeader}>
                <Code size={14} color="#888" />
                <span style={styles.subCategoryName}>{section.charAt(0).toUpperCase() + section.slice(1)}</span>
                <span style={styles.subCategoryCount}>{category[section].length} files</span>
              </div>
              <div style={styles.moduleList}>
                {category[section].map((item, i) => (
                  <ModuleItem key={i} item={item} onAIAssist={onAIAssist} />
                ))}
              </div>
            </div>
          )
        ))}
      </div>
    );
  }

  return (
    <div style={styles.expandedContent}>
      <div style={styles.moduleList}>
        {items.map((item, i) => (
          <ModuleItem key={i} item={item} onAIAssist={onAIAssist} />
        ))}
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function PlatformHealthPage() {
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [healthData, setHealthData] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [lastChecked, setLastChecked] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);

  const categoryIcons = {
    'Backend Modules': <Server size={20} color="#6366f1" />,
    'Frontend Effects': <Zap size={20} color="#f59e0b" />,
    'Templates': <LayoutGrid size={20} color="#10b981" />,
    'Lib Services': <Settings size={20} color="#8b5cf6" />,
    'Database': <Database size={20} color="#06b6d4" />,
    'External APIs': <Globe size={20} color="#ec4899" />,
    'File System': <HardDrive size={20} color="#14b8a6" />,
    'Admin Components': <Code size={20} color="#f97316" />,
    'Preview System': <Eye size={20} color="#22c55e" />
  };

  const runFullHealthCheck = useCallback(async () => {
    setRunning(true);
    try {
      const response = await fetch(`${API_URL}/api/health-check/full`);
      const data = await response.json();
      setHealthData(data);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setRunning(false);
      setLoading(false);
    }
  }, []);

  const runCategoryCheck = async (categoryName) => {
    const endpoints = {
      'Backend Modules': 'backend-modules',
      'Frontend Effects': 'frontend-effects',
      'Templates': 'templates',
      'Lib Services': 'lib-services',
      'Database': 'database',
      'External APIs': 'external-apis',
      'File System': 'filesystem',
      'Admin Components': 'admin-components',
      'Preview System': 'preview'
    };

    const endpoint = endpoints[categoryName];
    if (!endpoint) return;

    try {
      const response = await fetch(`${API_URL}/api/health-check/${endpoint}`);
      const data = await response.json();

      setHealthData(prev => ({
        ...prev,
        categories: prev.categories.map(cat =>
          cat.name === categoryName ? { ...cat, ...data } : cat
        )
      }));
    } catch (error) {
      console.error(`Category check failed for ${categoryName}:`, error);
    }
  };

  const toggleCategory = (categoryName) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  useEffect(() => {
    runFullHealthCheck();
  }, [runFullHealthCheck]);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <RefreshCw size={48} color="#6366f1" className="spin" />
        <p style={{ color: '#888', marginTop: '16px' }}>Running platform health checks...</p>
      </div>
    );
  }

  const overallScore = healthData?.summary?.overallScore || 0;
  const overallStatus = healthData?.status || 'unknown';

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Platform Health & Test Center</h1>
          <p style={styles.subtitle}>
            Monitor and test all platform components in real-time
          </p>
        </div>
        <div style={styles.headerActions}>
          {lastChecked && (
            <span style={styles.lastChecked}>
              <Clock size={14} />
              Last checked: {lastChecked.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={runFullHealthCheck}
            disabled={running}
            style={styles.runAllBtn}
          >
            {running ? (
              <>
                <RefreshCw size={16} className="spin" />
                Running...
              </>
            ) : (
              <>
                <Play size={16} />
                Run All Tests
              </>
            )}
          </button>
        </div>
      </div>

      {/* Overall Health Summary */}
      <div style={styles.summarySection}>
        <div style={styles.summaryCard}>
          <HealthScoreRing score={overallScore} />
          <div style={styles.summaryDetails}>
            <div style={styles.summaryTitle}>Overall Platform Health</div>
            <div style={styles.summaryStatus}>
              <StatusIcon status={overallStatus} size={24} />
              <span style={{
                fontSize: '18px',
                fontWeight: 600,
                color: overallStatus === 'healthy' ? '#10b981' : overallStatus === 'warning' ? '#f59e0b' : '#ef4444',
                textTransform: 'capitalize'
              }}>
                {overallStatus}
              </span>
            </div>
            {healthData?.executionTime && (
              <div style={styles.executionTime}>
                <Terminal size={14} />
                Completed in {healthData.executionTime}ms
              </div>
            )}
          </div>
        </div>

        <div style={styles.quickStats}>
          <div style={styles.quickStatCard}>
            <div style={styles.quickStatValue}>{healthData?.summary?.totalCategories || 0}</div>
            <div style={styles.quickStatLabel}>Categories</div>
          </div>
          <div style={styles.quickStatCard}>
            <div style={{ ...styles.quickStatValue, color: '#10b981' }}>{healthData?.summary?.healthy || 0}</div>
            <div style={styles.quickStatLabel}>Healthy</div>
          </div>
          <div style={styles.quickStatCard}>
            <div style={{ ...styles.quickStatValue, color: '#f59e0b' }}>{healthData?.summary?.degraded || 0}</div>
            <div style={styles.quickStatLabel}>Degraded</div>
          </div>
          <div style={styles.quickStatCard}>
            <div style={{ ...styles.quickStatValue, color: '#ef4444' }}>{healthData?.summary?.errors || 0}</div>
            <div style={styles.quickStatLabel}>Errors</div>
          </div>
        </div>
      </div>

      {/* Category Cards */}
      <div style={styles.categoriesSection}>
        <h2 style={styles.sectionTitle}>Health by Category</h2>

        <div style={styles.categoriesGrid}>
          {(healthData?.categories || []).map((category, index) => (
            <div key={index}>
              <CategoryCard
                category={category}
                icon={categoryIcons[category.name] || <Package size={20} color="#888" />}
                onClick={() => toggleCategory(category.name)}
                isExpanded={expandedCategories[category.name]}
              />
              {expandedCategories[category.name] && (
                <ExpandedCategory
                  category={category}
                  categoryName={category.name}
                  onAIAssist={setSelectedModule}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Test Results Log */}
      {testResults.length > 0 && (
        <div style={styles.testResultsSection}>
          <h2 style={styles.sectionTitle}>Test Results Log</h2>
          <div style={styles.testLog}>
            {testResults.map((result, i) => (
              <div key={i} style={styles.testLogEntry}>
                <StatusIcon status={result.success ? 'healthy' : 'error'} />
                <span style={styles.testLogTime}>{new Date(result.timestamp).toLocaleTimeString()}</span>
                <span style={styles.testLogTarget}>{result.target}</span>
                <span style={styles.testLogResult}>{result.success ? 'PASS' : 'FAIL'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CSS for animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>

      {/* AI Assist Panel */}
      {selectedModule && (
        <AIAssistPanel
          module={selectedModule}
          onClose={() => setSelectedModule(null)}
          onFixApplied={() => {
            setSelectedModule(null);
            runFullHealthCheck();
          }}
        />
      )}
    </div>
  );
}

// ============================================
// STYLES
// ============================================

const styles = {
  container: {
    padding: '0',
    maxWidth: '100%'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60vh'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px'
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#fff',
    margin: 0
  },
  subtitle: {
    fontSize: '14px',
    color: '#888',
    marginTop: '4px'
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  lastChecked: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#888'
  },
  runAllBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: '#6366f1',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  summarySection: {
    display: 'flex',
    gap: '24px',
    marginBottom: '32px'
  },
  summaryCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    padding: '24px',
    backgroundColor: '#12121a',
    border: '1px solid #2a2a3a',
    borderRadius: '16px',
    flex: 1
  },
  summaryDetails: {
    flex: 1
  },
  summaryTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '8px'
  },
  summaryStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px'
  },
  executionTime: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#888'
  },
  quickStats: {
    display: 'flex',
    gap: '12px'
  },
  quickStatCard: {
    padding: '16px 24px',
    backgroundColor: '#12121a',
    border: '1px solid #2a2a3a',
    borderRadius: '12px',
    textAlign: 'center',
    minWidth: '100px'
  },
  quickStatValue: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#fff'
  },
  quickStatLabel: {
    fontSize: '12px',
    color: '#888',
    marginTop: '4px'
  },
  categoriesSection: {
    marginBottom: '32px'
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '16px'
  },
  categoriesGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  categoryCard: {
    padding: '16px 20px',
    backgroundColor: '#12121a',
    border: '1px solid #2a2a3a',
    borderRadius: '12px',
    transition: 'all 0.2s'
  },
  categoryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  categoryIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  categoryName: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#fff'
  },
  categoryStats: {
    fontSize: '12px',
    color: '#888',
    marginTop: '2px'
  },
  expandedContent: {
    backgroundColor: '#0a0a0f',
    border: '1px solid #1a1a2e',
    borderTop: 'none',
    borderRadius: '0 0 12px 12px',
    padding: '16px',
    marginTop: '-12px'
  },
  subCategory: {
    marginBottom: '16px'
  },
  subCategoryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
    paddingBottom: '8px',
    borderBottom: '1px solid #1a1a2e'
  },
  subCategoryName: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#ccc',
    textTransform: 'capitalize'
  },
  subCategoryCount: {
    fontSize: '11px',
    color: '#666',
    marginLeft: 'auto'
  },
  moduleList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  moduleItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    backgroundColor: '#12121a',
    borderRadius: '8px'
  },
  moduleName: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#fff'
  },
  modulePath: {
    fontSize: '11px',
    color: '#666'
  },
  moduleError: {
    fontSize: '11px',
    color: '#ef4444',
    marginTop: '2px'
  },
  moduleIssues: {
    display: 'flex',
    gap: '6px',
    marginTop: '4px',
    flexWrap: 'wrap'
  },
  issueTag: {
    fontSize: '10px',
    padding: '2px 6px',
    backgroundColor: '#f59e0b20',
    color: '#f59e0b',
    borderRadius: '4px'
  },
  moduleStats: {
    display: 'flex',
    gap: '8px'
  },
  statBadge: {
    fontSize: '10px',
    padding: '2px 6px',
    backgroundColor: '#1a1a2e',
    color: '#888',
    borderRadius: '4px'
  },
  testBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    backgroundColor: '#6366f120',
    border: '1px solid #6366f1',
    borderRadius: '4px',
    color: '#6366f1',
    fontSize: '11px',
    cursor: 'pointer'
  },
  aiAssistBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    backgroundColor: '#8b5cf620',
    border: '1px solid #8b5cf6',
    borderRadius: '4px',
    color: '#8b5cf6',
    fontSize: '11px',
    fontWeight: 500,
    cursor: 'pointer'
  },
  testResultsSection: {
    marginTop: '24px'
  },
  testLog: {
    backgroundColor: '#0a0a0f',
    border: '1px solid #1a1a2e',
    borderRadius: '8px',
    padding: '12px',
    maxHeight: '200px',
    overflowY: 'auto'
  },
  testLogEntry: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '6px 0',
    borderBottom: '1px solid #1a1a2e',
    fontSize: '12px'
  },
  testLogTime: {
    color: '#666',
    minWidth: '80px'
  },
  testLogTarget: {
    color: '#ccc',
    flex: 1
  },
  testLogResult: {
    fontWeight: 600
  }
};
