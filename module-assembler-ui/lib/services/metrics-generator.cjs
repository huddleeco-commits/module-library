/**
 * Metrics Generator Service
 *
 * Generates comprehensive metrics dashboards and index pages for generated sites.
 * - Master metrics HTML page at prospect level (aggregates all variants)
 * - Per-variant IndexPage.jsx with stats, page links, and live testing
 */

const fs = require('fs');
const path = require('path');

/**
 * Escape string for use in JavaScript single-quoted strings
 */
function escapeJs(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

/**
 * Escape string for use in HTML content
 */
function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

class MetricsGenerator {
  /**
   * Get all files in a directory recursively
   */
  getAllFiles(dir, extensions = []) {
    const files = [];
    if (!fs.existsSync(dir)) return files;

    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        // Skip node_modules, dist, .git
        if (!['node_modules', 'dist', '.git', 'build'].includes(item.name)) {
          files.push(...this.getAllFiles(fullPath, extensions));
        }
      } else if (extensions.length === 0 || extensions.some(ext => item.name.endsWith(ext))) {
        files.push(fullPath);
      }
    }
    return files;
  }

  /**
   * Count lines of code in a directory
   */
  countLinesOfCode(dir, extensions = ['.jsx', '.js', '.cjs', '.css', '.json']) {
    let total = 0;
    const files = this.getAllFiles(dir, extensions);
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        total += content.split('\n').length;
      } catch (e) {
        // Skip unreadable files
      }
    }
    return total;
  }

  /**
   * Count total files in a directory
   */
  countFiles(dir, extensions = []) {
    return this.getAllFiles(dir, extensions).length;
  }

  /**
   * Count page files in a variant
   */
  countPages(variantDir) {
    const pagesDir = path.join(variantDir, 'frontend', 'src', 'pages');
    if (!fs.existsSync(pagesDir)) return 0;
    return fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx') || f.endsWith('.js')).length;
  }

  /**
   * Get list of pages with their routes
   */
  getPagesList(variantDir) {
    const pagesDir = path.join(variantDir, 'frontend', 'src', 'pages');
    if (!fs.existsSync(pagesDir)) return [];

    const pages = [];
    const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx') || f.endsWith('.js'));

    for (const file of files) {
      const name = file.replace(/Page\.(jsx|js)$/, '').replace(/\.(jsx|js)$/, '');
      const routeName = name.toLowerCase();

      // Determine page type
      let type = 'public';
      const portalPages = ['login', 'register', 'dashboard', 'profile', 'account', 'rewards'];
      if (portalPages.includes(routeName)) {
        type = 'portal';
      } else if (['index', 'testdashboard', 'metrics'].includes(routeName)) {
        type = 'system';
      }

      pages.push({
        name: name === 'Home' ? 'Home' : name,
        path: routeName === 'home' ? '/' : `/${routeName}`,
        file: file,
        type: type
      });
    }

    return pages.sort((a, b) => {
      // Sort: system first, then public, then portal
      const typeOrder = { system: 0, public: 1, portal: 2 };
      return (typeOrder[a.type] || 1) - (typeOrder[b.type] || 1);
    });
  }

  /**
   * Get backend endpoints from a variant
   */
  getBackendEndpoints(variantDir) {
    const backendDir = path.join(variantDir, 'backend');
    if (!fs.existsSync(backendDir)) return ['/api/health'];

    const endpoints = ['/api/health'];

    // Look for route files
    const routesDir = path.join(backendDir, 'routes');
    if (fs.existsSync(routesDir)) {
      const routeFiles = fs.readdirSync(routesDir).filter(f => f.endsWith('.js') || f.endsWith('.cjs'));
      for (const file of routeFiles) {
        const name = file.replace(/\.(js|cjs)$/, '');
        if (name !== 'index') {
          endpoints.push(`/api/${name}`);
        }
      }
    }

    // Look for module directories
    const modulesDir = path.join(backendDir, 'modules');
    if (fs.existsSync(modulesDir)) {
      const modules = fs.readdirSync(modulesDir, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name);
      for (const mod of modules) {
        endpoints.push(`/api/${mod}`);
      }
    }

    return [...new Set(endpoints)]; // Remove duplicates
  }

  /**
   * Calculate metrics for a single variant
   */
  calculateVariantMetrics(variantDir, variantKey, preset, layout, theme, generationTimeMs) {
    const frontendDir = path.join(variantDir, 'frontend');
    const backendDir = path.join(variantDir, 'backend');
    const adminDir = path.join(variantDir, 'admin');

    const frontendLOC = this.countLinesOfCode(frontendDir);
    const backendLOC = this.countLinesOfCode(backendDir);
    const adminLOC = this.countLinesOfCode(adminDir);
    const totalLOC = frontendLOC + backendLOC + adminLOC;

    const frontendFiles = this.countFiles(frontendDir);
    const backendFiles = this.countFiles(backendDir);
    const adminFiles = this.countFiles(adminDir);
    const totalFiles = frontendFiles + backendFiles + adminFiles;

    const pageCount = this.countPages(variantDir);
    const pages = this.getPagesList(variantDir);
    const endpoints = this.getBackendEndpoints(variantDir);

    const timeSeconds = generationTimeMs / 1000;

    return {
      variantKey,
      preset,
      layout,
      theme,
      generationTimeMs,
      linesOfCode: {
        frontend: frontendLOC,
        backend: backendLOC,
        admin: adminLOC,
        total: totalLOC
      },
      files: {
        frontend: frontendFiles,
        backend: backendFiles,
        admin: adminFiles,
        total: totalFiles
      },
      pageCount,
      pages,
      endpoints,
      pagesPerSecond: timeSeconds > 0 ? (pageCount / timeSeconds).toFixed(2) : 0,
      linesPerSecond: timeSeconds > 0 ? Math.round(totalLOC / timeSeconds) : 0,
      filesPerSecond: timeSeconds > 0 ? (totalFiles / timeSeconds).toFixed(2) : 0,
      hasBackend: fs.existsSync(backendDir),
      hasAdmin: fs.existsSync(adminDir),
      hasDatabase: fs.existsSync(path.join(variantDir, 'database'))
    };
  }

  /**
   * Generate the IndexPage.jsx for a variant
   */
  generateIndexPage(variantDir, metrics, businessName) {
    const pagesDir = path.join(variantDir, 'frontend', 'src', 'pages');
    if (!fs.existsSync(pagesDir)) {
      fs.mkdirSync(pagesDir, { recursive: true });
    }

    const pagesArray = metrics.pages.map(p =>
      `    { name: '${escapeJs(p.name)}', path: '${escapeJs(p.path)}', type: '${escapeJs(p.type)}' }`
    ).join(',\n');

    const endpointsArray = metrics.endpoints.map(e => `'${escapeJs(e)}'`).join(', ');

    // Escape business name for safe embedding in JSX
    const safeName = escapeJs(businessName);

    const jsx = `import React, { useState, useEffect } from 'react';
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
    businessName: '${safeName}',
    variant: '${escapeJs(metrics.variantKey)}',
    preset: '${escapeJs(metrics.preset)}',
    layout: '${escapeJs(metrics.layout)}',
    theme: '${escapeJs(metrics.theme)}',
    generationTimeMs: ${metrics.generationTimeMs},
    linesOfCode: ${metrics.linesOfCode.total},
    frontendLOC: ${metrics.linesOfCode.frontend},
    backendLOC: ${metrics.linesOfCode.backend},
    adminLOC: ${metrics.linesOfCode.admin},
    totalFiles: ${metrics.files.total},
    totalPages: ${metrics.pageCount},
    pagesPerSecond: ${metrics.pagesPerSecond},
    linesPerSecond: ${metrics.linesPerSecond},
    hasBackend: ${metrics.hasBackend},
    hasAdmin: ${metrics.hasAdmin},
    hasDatabase: ${metrics.hasDatabase},
    generatedAt: '${new Date().toISOString()}'
  };

  const pages = [
${pagesArray}
  ];

  const endpoints = [${endpointsArray}];

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
      <style>{\`@keyframes spin { to { transform: rotate(360deg); } }\`}</style>

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
          <StatCard icon={Clock} value={\`\${(metrics.generationTimeMs / 1000).toFixed(1)}s\`} label="Generation Time" sublabel={\`\${metrics.generationTimeMs}ms\`} />
          <StatCard icon={Code} value={metrics.linesOfCode.toLocaleString()} label="Lines of Code" sublabel={\`\${metrics.linesPerSecond} LOC/sec\`} />
          <StatCard icon={FileText} value={metrics.totalFiles} label="Files Generated" />
          <StatCard icon={LayoutGrid} value={metrics.totalPages} label="Pages" sublabel={\`\${metrics.pagesPerSecond} pages/sec\`} />
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
`;

    fs.writeFileSync(path.join(pagesDir, 'IndexPage.jsx'), jsx);
    return true;
  }

  /**
   * Update App.jsx to include IndexPage route
   */
  updateAppRoutes(variantDir) {
    const appPath = path.join(variantDir, 'frontend', 'src', 'App.jsx');
    if (!fs.existsSync(appPath)) return false;

    let content = fs.readFileSync(appPath, 'utf8');

    // Add import if not present
    if (!content.includes("import IndexPage from './pages/IndexPage'")) {
      // Find last import line and add after it
      const importMatch = content.match(/^import .+ from ['"].+['"];?\s*$/gm);
      if (importMatch) {
        const lastImport = importMatch[importMatch.length - 1];
        content = content.replace(
          lastImport,
          `${lastImport}\nimport IndexPage from './pages/IndexPage';`
        );
      }
    }

    // Add route if not present
    if (!content.includes('path="/_index"') && !content.includes("path='/_index'")) {
      // Find the home route - must match the complete Route element including element={<Component />}
      // The pattern matches: <Route path="/" element={<ComponentName />} />
      // We use a specific pattern to avoid matching the /> inside the element prop
      const homeRouteRegex = /<Route\s+path=["']\/["']\s+element=\{<\w+\s*\/>\}\s*\/>/;
      const routesMatch = content.match(homeRouteRegex);
      if (routesMatch) {
        // Add IndexPage route after the home route
        content = content.replace(
          routesMatch[0],
          `${routesMatch[0]}\n          <Route path="/_index" element={<IndexPage />} />`
        );
      }
    }

    fs.writeFileSync(appPath, content);
    return true;
  }

  /**
   * Generate the master metrics HTML page at prospect level
   */
  generateMasterMetricsPage(prospectDir, variants, masterMetrics) {
    const variantRows = variants.map(v => `
      <tr>
        <td><a href="${v.variantKey}/frontend/dist/index.html" class="variant-link">${v.variantKey}</a></td>
        <td>${v.preset}</td>
        <td>${v.layout}</td>
        <td>${v.theme}</td>
        <td>${v.pageCount}</td>
        <td>${v.linesOfCode.total.toLocaleString()}</td>
        <td>${(v.generationTimeMs / 1000).toFixed(1)}s</td>
        <td><span class="badge badge-success">Success</span></td>
      </tr>
    `).join('');

    const safeName = escapeHtml(masterMetrics.businessName);

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generation Metrics - ${safeName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f1f5f9; padding: 40px 20px; line-height: 1.6; }
    .container { max-width: 1200px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 48px; }
    .badge { display: inline-block; background: #1e3a5f; color: #38bdf8; padding: 6px 16px; border-radius: 20px; font-size: 0.85rem; margin-bottom: 16px; }
    .title { font-size: clamp(2rem, 5vw, 3rem); font-weight: 700; margin-bottom: 12px; }
    .subtitle { color: #94a3b8; font-size: 1.1rem; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; margin-bottom: 48px; }
    .stat-card { background: #1e293b; padding: 24px; border-radius: 12px; text-align: center; }
    .stat-value { display: block; font-size: 2rem; font-weight: 700; color: #38bdf8; margin-bottom: 4px; }
    .stat-label { color: #94a3b8; font-size: 0.9rem; }
    .stat-sublabel { color: #64748b; font-size: 0.8rem; margin-top: 4px; }
    h2 { font-size: 1.25rem; margin-bottom: 20px; color: #e2e8f0; }
    .variants-table { width: 100%; border-collapse: collapse; background: #1e293b; border-radius: 12px; overflow: hidden; margin-bottom: 48px; }
    .variants-table th, .variants-table td { padding: 16px 20px; text-align: left; border-bottom: 1px solid #334155; }
    .variants-table th { background: #334155; font-weight: 600; color: #e2e8f0; }
    .variants-table tr:last-child td { border-bottom: none; }
    .variants-table tr:hover { background: #253344; }
    .variant-link { color: #38bdf8; text-decoration: none; font-weight: 500; }
    .variant-link:hover { text-decoration: underline; }
    .badge { padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 500; }
    .badge-success { background: #166534; color: #4ade80; }
    .quick-links { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; margin-bottom: 48px; }
    .quick-link { display: flex; align-items: center; gap: 16px; background: #1e293b; padding: 20px 24px; border-radius: 12px; text-decoration: none; color: #f1f5f9; transition: background 0.2s; }
    .quick-link:hover { background: #253344; }
    .quick-link-icon { width: 48px; height: 48px; background: #334155; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .quick-link-icon svg { width: 24px; height: 24px; stroke: #38bdf8; fill: none; stroke-width: 2; }
    .quick-link-text { flex: 1; }
    .quick-link-title { font-weight: 600; margin-bottom: 2px; }
    .quick-link-desc { color: #94a3b8; font-size: 0.9rem; }
    .footer { text-align: center; margin-top: 60px; padding-top: 40px; border-top: 1px solid #334155; color: #64748b; }
    @media (max-width: 768px) {
      .variants-table { display: block; overflow-x: auto; }
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">Generation Report</span>
      <h1 class="title">${safeName}</h1>
      <p class="subtitle">${masterMetrics.totalVariants} variant${masterMetrics.totalVariants > 1 ? 's' : ''} generated</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-value">${(masterMetrics.totalGenerationTimeMs / 1000).toFixed(1)}s</span>
        <span class="stat-label">Total Generation Time</span>
        <span class="stat-sublabel">${masterMetrics.totalGenerationTimeMs.toLocaleString()}ms</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">${masterMetrics.totalLinesOfCode.toLocaleString()}</span>
        <span class="stat-label">Total Lines of Code</span>
        <span class="stat-sublabel">${masterMetrics.linesPerSecond.toLocaleString()} LOC/sec</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">${masterMetrics.totalFiles.toLocaleString()}</span>
        <span class="stat-label">Total Files</span>
        <span class="stat-sublabel">${masterMetrics.filesPerSecond} files/sec</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">${masterMetrics.totalPages}</span>
        <span class="stat-label">Total Pages</span>
        <span class="stat-sublabel">${masterMetrics.pagesPerSecond} pages/sec</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">${masterMetrics.totalVariants}</span>
        <span class="stat-label">Variants Generated</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">${masterMetrics.pagesPerSecond}</span>
        <span class="stat-label">Pages/Second</span>
      </div>
    </div>

    <h2>Quick Access</h2>
    <div class="quick-links">
      ${variants.map(v => `
      <a href="full-test${v.variantKey}/frontend/dist/index.html" class="quick-link">
        <div class="quick-link-icon">
          <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </div>
        <div class="quick-link-text">
          <div class="quick-link-title">${v.preset} + ${v.layout}</div>
          <div class="quick-link-desc">${v.pageCount} pages | ${v.linesOfCode.total.toLocaleString()} LOC</div>
        </div>
      </a>
      `).join('')}
    </div>

    <h2>Variant Comparison</h2>
    <table class="variants-table">
      <thead>
        <tr>
          <th>Variant</th>
          <th>Preset</th>
          <th>Layout</th>
          <th>Theme</th>
          <th>Pages</th>
          <th>Lines of Code</th>
          <th>Time</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${variantRows}
      </tbody>
    </table>

    <footer class="footer">
      <p>Generated ${new Date(masterMetrics.generatedAt).toLocaleString()}</p>
      <p>Module Assembler Platform</p>
    </footer>
  </div>
</body>
</html>`;

    fs.writeFileSync(path.join(prospectDir, '_metrics.html'), html);
    return true;
  }

  /**
   * Main method to generate all metrics after variants are complete
   */
  generateAllMetrics(prospectDir, variantResults, businessName, totalGenerationTimeMs) {
    const variants = [];

    // Calculate metrics for each variant and generate IndexPage
    for (const result of variantResults) {
      const variantKey = result.suffix || '';
      const metrics = this.calculateVariantMetrics(
        result.testDir,
        variantKey,
        result.preset || 'default',
        result.layout || 'default',
        result.theme || 'light',
        result.generationTimeMs || 0
      );

      variants.push(metrics);

      // Generate IndexPage for this variant
      this.generateIndexPage(result.testDir, metrics, businessName);

      // Update App.jsx routes
      this.updateAppRoutes(result.testDir);
    }

    // Calculate master metrics
    const masterMetrics = {
      businessName,
      totalGenerationTimeMs,
      totalVariants: variants.length,
      totalLinesOfCode: variants.reduce((sum, v) => sum + v.linesOfCode.total, 0),
      totalFiles: variants.reduce((sum, v) => sum + v.files.total, 0),
      totalPages: variants.reduce((sum, v) => sum + v.pageCount, 0),
      generatedAt: new Date().toISOString()
    };

    const timeSeconds = totalGenerationTimeMs / 1000;
    masterMetrics.pagesPerSecond = timeSeconds > 0 ? (masterMetrics.totalPages / timeSeconds).toFixed(2) : 0;
    masterMetrics.linesPerSecond = timeSeconds > 0 ? Math.round(masterMetrics.totalLinesOfCode / timeSeconds) : 0;
    masterMetrics.filesPerSecond = timeSeconds > 0 ? (masterMetrics.totalFiles / timeSeconds).toFixed(2) : 0;

    // Generate master metrics page
    this.generateMasterMetricsPage(prospectDir, variants, masterMetrics);

    return {
      masterMetrics,
      variants
    };
  }
}

module.exports = MetricsGenerator;
