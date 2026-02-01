import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutGrid, Clock, Code, FileText, Zap, ArrowRight,
  CheckCircle, XCircle, Loader2, Server, Globe, Database,
  Home, Users, Mail, Menu, Image, ShoppingBag, Star, Settings
} from 'lucide-react';

export default function IndexPage() {
  const [backendStatus, setBackendStatus] = useState('checking');
  const [apiTests, setApiTests] = useState({});

  const metrics = {
    businessName: 'Cristy\'s Cake Shop',
    variant: '-luxury-story-driven',
    preset: 'luxury',
    layout: 'story-driven',
    theme: 'dark',
    generationTimeMs: 13823,
    linesOfCode: 103133,
    frontendLOC: 1353,
    backendLOC: 20954,
    adminLOC: 80826,
    totalFiles: 277,
    totalPages: 13,
    pagesPerSecond: 0.94,
    linesPerSecond: 7461,
    hasBackend: true,
    hasAdmin: true,
    hasDatabase: false,
    generatedAt: '2026-01-27T23:24:18.521Z'
  };

  const pages = [
    { name: 'About', path: '/about', type: 'public' },
    { name: 'Contact', path: '/contact', type: 'public' },
    { name: 'Gallery', path: '/gallery', type: 'public' },
    { name: 'Home', path: '/', type: 'public' },
    { name: 'Index', path: '/index', type: 'system' },
    { name: 'Menu', path: '/menu', type: 'public' },
    { name: 'Order', path: '/order', type: 'public' },
    { name: 'Account', path: '/account', type: 'portal' },
    { name: 'Dashboard', path: '/dashboard', type: 'portal' },
    { name: 'Login', path: '/login', type: 'portal' },
    { name: 'Profile', path: '/profile', type: 'portal' },
    { name: 'Register', path: '/register', type: 'portal' },
    { name: 'Rewards', path: '/rewards', type: 'portal' }
  ];

  const endpoints = ['/api/health', '/api/brain', '/api/auth', '/api/file-upload', '/api/inventory', '/api/marketplace', '/api/menu', '/api/notifications', '/api/orders', '/api/payments', '/api/stripe-payments', '/api/transfers', '/api/vendor-system'];

  useEffect(() => {
    const testBackend = async () => {
      if (!metrics.hasBackend) {
        setBackendStatus('not-configured');
        return;
      }
      try {
        const res = await fetch('/api/health');
        setBackendStatus(res.ok ? 'connected' : 'error');
      } catch {
        setBackendStatus('disconnected');
      }
    };
    testBackend();
  }, []);

  const testEndpoint = async (endpoint) => {
    setApiTests(prev => ({ ...prev, [endpoint]: 'testing' }));
    try {
      const res = await fetch(endpoint);
      setApiTests(prev => ({ ...prev, [endpoint]: res.ok ? 'pass' : 'fail' }));
    } catch {
      setApiTests(prev => ({ ...prev, [endpoint]: 'error' }));
    }
  };

  const testAllEndpoints = () => {
    endpoints.forEach(ep => testEndpoint(ep));
  };

  const getPageIcon = (name) => {
    const icons = {
      Home: Home, About: Users, Contact: Mail, Menu: Menu,
      Gallery: Image, Services: Settings, Order: ShoppingBag,
      Testimonials: Star, Index: LayoutGrid, Dashboard: LayoutGrid
    };
    return icons[name] || FileText;
  };

  const StatusBadge = ({ status }) => {
    const configs = {
      'checking': { icon: Loader2, color: '#94a3b8', bg: '#1e293b', text: 'Checking...' },
      'connected': { icon: CheckCircle, color: '#4ade80', bg: '#166534', text: 'Connected' },
      'disconnected': { icon: XCircle, color: '#f87171', bg: '#991b1b', text: 'Disconnected' },
      'not-configured': { icon: XCircle, color: '#94a3b8', bg: '#334155', text: 'Not Configured' },
      'pass': { icon: CheckCircle, color: '#4ade80', bg: '#166534', text: 'Pass' },
      'fail': { icon: XCircle, color: '#f87171', bg: '#991b1b', text: 'Fail' },
      'error': { icon: XCircle, color: '#fbbf24', bg: '#92400e', text: 'Error' },
      'testing': { icon: Loader2, color: '#60a5fa', bg: '#1e40af', text: 'Testing...' }
    };
    const config = configs[status] || configs['checking'];
    const Icon = config.icon;
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', background: config.bg, color: config.color, fontSize: '0.8rem' }}>
        <Icon size={14} style={status === 'checking' || status === 'testing' ? { animation: 'spin 1s linear infinite' } : {}} />
        {config.text}
      </span>
    );
  };

  const StatCard = ({ icon: Icon, value, label, sublabel }) => (
    <div style={styles.statCard}>
      <Icon size={24} style={{ color: '#38bdf8', marginBottom: '8px' }} />
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
      {sublabel && <div style={styles.statSublabel}>{sublabel}</div>}
    </div>
  );

  const ConnectionCard = ({ icon: Icon, label, status }) => (
    <div style={styles.connectionCard}>
      <Icon size={28} style={{ color: status === 'connected' ? '#4ade80' : '#94a3b8' }} />
      <div style={styles.connectionLabel}>{label}</div>
      <StatusBadge status={status} />
    </div>
  );

  return (
    <div style={styles.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.badge}>Generation Metrics</div>
        <h1 style={styles.title}>{metrics.businessName}</h1>
        <p style={styles.subtitle}>
          {metrics.variant} | {metrics.preset} preset | {metrics.theme} theme
        </p>
      </header>

      {/* Quick Stats */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Performance Metrics</h2>
        <div style={styles.statsGrid}>
          <StatCard icon={Clock} value={`${(metrics.generationTimeMs / 1000).toFixed(1)}s`} label="Generation Time" sublabel={`${metrics.generationTimeMs}ms`} />
          <StatCard icon={Code} value={metrics.linesOfCode.toLocaleString()} label="Lines of Code" sublabel={`${metrics.linesPerSecond} LOC/sec`} />
          <StatCard icon={FileText} value={metrics.totalFiles} label="Files Generated" />
          <StatCard icon={LayoutGrid} value={metrics.totalPages} label="Pages" sublabel={`${metrics.pagesPerSecond} pages/sec`} />
          <StatCard icon={Zap} value={metrics.pagesPerSecond} label="Pages/Second" />
        </div>
      </section>

      {/* Code Breakdown */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Code Breakdown</h2>
        <div style={styles.breakdownGrid}>
          <div style={styles.breakdownCard}>
            <Globe size={20} style={{ color: '#38bdf8' }} />
            <span style={styles.breakdownLabel}>Frontend</span>
            <span style={styles.breakdownValue}>{metrics.frontendLOC.toLocaleString()} lines</span>
          </div>
          <div style={styles.breakdownCard}>
            <Server size={20} style={{ color: '#a78bfa' }} />
            <span style={styles.breakdownLabel}>Backend</span>
            <span style={styles.breakdownValue}>{metrics.backendLOC.toLocaleString()} lines</span>
          </div>
          <div style={styles.breakdownCard}>
            <Settings size={20} style={{ color: '#f472b6' }} />
            <span style={styles.breakdownLabel}>Admin</span>
            <span style={styles.breakdownValue}>{metrics.adminLOC.toLocaleString()} lines</span>
          </div>
        </div>
      </section>

      {/* Page Directory */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Site Pages ({pages.length})</h2>
        <div style={styles.pagesGrid}>
          {pages.map(page => {
            const Icon = getPageIcon(page.name);
            return (
              <Link key={page.path} to={page.path} style={styles.pageCard}>
                <Icon size={20} style={{ color: page.type === 'portal' ? '#a78bfa' : page.type === 'system' ? '#38bdf8' : '#4ade80' }} />
                <span style={styles.pageName}>{page.name}</span>
                <span style={{...styles.pageType, background: page.type === 'portal' ? '#4c1d95' : page.type === 'system' ? '#1e3a5f' : '#166534' }}>{page.type}</span>
                <ArrowRight size={16} style={{ color: '#64748b' }} />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Connection Testing */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Connection Status</h2>
        <div style={styles.connectionGrid}>
          <ConnectionCard icon={Globe} label="Frontend" status="connected" />
          <ConnectionCard icon={Server} label="Backend API" status={backendStatus} />
          <ConnectionCard icon={Database} label="Database" status={metrics.hasDatabase && backendStatus === 'connected' ? 'connected' : metrics.hasDatabase ? 'disconnected' : 'not-configured'} />
        </div>
      </section>

      {/* API Endpoint Tests */}
      {metrics.hasBackend && (
        <section style={styles.section}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={styles.sectionTitle}>API Endpoint Tests</h2>
            <button onClick={testAllEndpoints} style={styles.testAllBtn}>Test All</button>
          </div>
          <div style={styles.endpointList}>
            {endpoints.map(endpoint => (
              <div key={endpoint} style={styles.endpointRow}>
                <code style={styles.endpointCode}>{endpoint}</code>
                <button onClick={() => testEndpoint(endpoint)} style={styles.testBtn}>Test</button>
                <StatusBadge status={apiTests[endpoint] || 'pending'} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer style={styles.footer}>
        <p>Generated {new Date(metrics.generatedAt).toLocaleString()}</p>
        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Module Assembler Platform</p>
      </footer>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#0f172a', color: '#f1f5f9', padding: '40px 20px' },
  header: { textAlign: 'center', marginBottom: '48px', maxWidth: '800px', margin: '0 auto 48px' },
  badge: { display: 'inline-block', background: '#1e3a5f', color: '#38bdf8', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', marginBottom: '16px' },
  title: { fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '700', marginBottom: '12px' },
  subtitle: { color: '#94a3b8', fontSize: '1.1rem' },
  section: { maxWidth: '1200px', margin: '0 auto 48px' },
  sectionTitle: { fontSize: '1.25rem', fontWeight: '600', marginBottom: '20px', color: '#e2e8f0' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' },
  statCard: { background: '#1e293b', padding: '24px', borderRadius: '12px', textAlign: 'center' },
  statValue: { fontSize: '2rem', fontWeight: '700', color: '#f1f5f9', marginBottom: '4px' },
  statLabel: { color: '#94a3b8', fontSize: '0.9rem' },
  statSublabel: { color: '#64748b', fontSize: '0.8rem', marginTop: '4px' },
  breakdownGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' },
  breakdownCard: { display: 'flex', alignItems: 'center', gap: '12px', background: '#1e293b', padding: '16px 20px', borderRadius: '8px' },
  breakdownLabel: { flex: 1, color: '#94a3b8' },
  breakdownValue: { fontWeight: '600', color: '#f1f5f9' },
  pagesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' },
  pageCard: { display: 'flex', alignItems: 'center', gap: '12px', background: '#1e293b', padding: '16px 20px', borderRadius: '8px', textDecoration: 'none', color: '#f1f5f9', transition: 'background 0.2s' },
  pageName: { flex: 1, fontWeight: '500' },
  pageType: { padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', color: '#fff' },
  connectionGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' },
  connectionCard: { background: '#1e293b', padding: '24px', borderRadius: '12px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
  connectionLabel: { fontWeight: '500', color: '#e2e8f0' },
  endpointList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  endpointRow: { display: 'flex', alignItems: 'center', gap: '12px', background: '#1e293b', padding: '12px 16px', borderRadius: '8px' },
  endpointCode: { flex: 1, fontFamily: 'monospace', color: '#38bdf8', fontSize: '0.9rem' },
  testBtn: { padding: '6px 16px', background: '#334155', border: 'none', borderRadius: '6px', color: '#f1f5f9', cursor: 'pointer', fontSize: '0.85rem' },
  testAllBtn: { padding: '8px 20px', background: '#2563eb', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' },
  footer: { textAlign: 'center', marginTop: '60px', paddingTop: '40px', borderTop: '1px solid #334155' }
};
