/**
 * Test Dashboard Generator
 *
 * Generates a comprehensive dashboard page for test sites showing:
 * - All pages with navigation
 * - Generation statistics
 * - Backend API tester
 * - Deployment info
 *
 * This is the LANDING PAGE for test sites - showcases the platform capabilities
 */

const fs = require('fs');
const path = require('path');

/**
 * Count lines of code in a directory
 */
function countLinesOfCode(dir, extensions = ['.js', '.jsx', '.ts', '.tsx', '.css', '.json']) {
  let totalLines = 0;
  let fileCount = 0;

  function walkDir(currentPath) {
    if (!fs.existsSync(currentPath)) return;

    const items = fs.readdirSync(currentPath);
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        if (item !== 'node_modules' && item !== 'dist' && item !== '.git') {
          walkDir(fullPath);
        }
      } else if (extensions.some(ext => item.endsWith(ext))) {
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          totalLines += content.split('\n').length;
          fileCount++;
        } catch (e) {}
      }
    }
  }

  walkDir(dir);
  return { totalLines, fileCount };
}

/**
 * Get list of pages from the frontend
 */
function getPagesList(frontendPath) {
  const pagesDir = path.join(frontendPath, 'src', 'pages');
  const pages = [];

  if (fs.existsSync(pagesDir)) {
    const files = fs.readdirSync(pagesDir);
    for (const file of files) {
      if ((file.endsWith('.jsx') || file.endsWith('.tsx')) && !file.includes('TestDashboard')) {
        const name = file.replace(/\.(jsx|tsx)$/, '');
        // HomePage should be at "/" (the landing page with hero)
        const routePath = name === 'HomePage' ? '/' : `/${name.toLowerCase().replace(/page$/, '')}`;
        pages.push({ name, file, route: routePath });
      }
    }
  }

  return pages;
}

/**
 * Get backend modules/features
 */
function getBackendModules(backendPath) {
  const modulesDir = path.join(backendPath, 'modules');
  const modules = [];

  if (fs.existsSync(modulesDir)) {
    const dirs = fs.readdirSync(modulesDir);
    for (const dir of dirs) {
      const modulePath = path.join(modulesDir, dir);
      if (fs.statSync(modulePath).isDirectory()) {
        modules.push(dir);
      }
    }
  }

  return modules;
}

/**
 * Get API endpoints from backend
 */
function getApiEndpoints(industry) {
  const endpoints = {
    common: [
      { method: 'GET', path: '/api/health', description: 'Health check' },
      { method: 'GET', path: '/api/brain', description: 'Site configuration' }
    ],
    restaurant: [
      { method: 'GET', path: '/api/menu', description: 'Get menu items' },
      { method: 'GET', path: '/api/menu/categories', description: 'Get menu categories' }
    ],
    bakery: [
      { method: 'GET', path: '/api/menu', description: 'Get bakery items' },
      { method: 'GET', path: '/api/menu/categories', description: 'Get categories' }
    ],
    barbershop: [
      { method: 'GET', path: '/api/booking/slots', description: 'Get available slots' }
    ],
    'salon-spa': [
      { method: 'GET', path: '/api/booking/services', description: 'Get services' },
      { method: 'GET', path: '/api/booking/slots', description: 'Get available slots' }
    ],
    'fitness-gym': [
      { method: 'GET', path: '/api/classes', description: 'Get fitness classes' }
    ]
  };

  return [...endpoints.common, ...(endpoints[industry] || endpoints.restaurant)];
}

/**
 * Generate the test dashboard JSX
 */
function generateTestDashboard(options) {
  const {
    projectPath,
    projectName,
    industry,
    prospect,
    generationTimeMs,
    deploymentUrl,
    adminUrl,
    backendUrl,
    adminCredentials = { email: 'admin@be1st.io', password: 'admin1234' }
  } = options;

  const frontendPath = path.join(projectPath, 'frontend');
  const backendPath = path.join(projectPath, 'backend');

  // Gather stats
  const pages = getPagesList(frontendPath);
  const backendModules = getBackendModules(backendPath);
  const frontendStats = countLinesOfCode(frontendPath);
  const backendStats = countLinesOfCode(backendPath);
  const adminStats = countLinesOfCode(path.join(projectPath, 'admin'));
  const endpoints = getApiEndpoints(industry);

  const totalLines = frontendStats.totalLines + backendStats.totalLines + adminStats.totalLines;
  const totalFiles = frontendStats.fileCount + backendStats.fileCount + adminStats.fileCount;

  const businessName = prospect?.name || projectName;

  const dashboardPage = `import React, { useState } from 'react';

/**
 * Blink Test Dashboard - Auto-generated showcase
 * Business: ${businessName}
 * Industry: ${industry}
 * Generated: ${new Date().toISOString()}
 */
export default function TestDashboard() {
  const [apiResults, setApiResults] = useState({});
  const [loading, setLoading] = useState({});
  const [activeTab, setActiveTab] = useState('overview');

  const stats = {
    projectName: '${projectName}',
    businessName: '${businessName.replace(/'/g, "\\'")}',
    industry: '${industry}',
    generationTime: ${generationTimeMs || 0},
    pages: ${JSON.stringify(pages)},
    backendModules: ${JSON.stringify(backendModules)},
    totalLinesOfCode: ${totalLines},
    totalFiles: ${totalFiles},
    frontendLines: ${frontendStats.totalLines},
    backendLines: ${backendStats.totalLines},
    adminLines: ${adminStats.totalLines},
    deploymentUrl: '${deploymentUrl || ''}',
    adminUrl: '${adminUrl || ''}',
    backendUrl: '${backendUrl || ''}',
    adminCredentials: {
      email: '${adminCredentials.email}',
      password: '${adminCredentials.password}'
    }
  };

  const endpoints = ${JSON.stringify(endpoints, null, 2)};

  const testEndpoint = async (endpoint, index) => {
    setLoading(prev => ({ ...prev, [index]: true }));
    try {
      const baseUrl = stats.backendUrl || '';
      const response = await fetch(baseUrl + endpoint.path);
      const data = await response.json().catch(() => response.text());
      setApiResults(prev => ({
        ...prev,
        [index]: { status: response.status, data, ok: response.ok }
      }));
    } catch (error) {
      setApiResults(prev => ({
        ...prev,
        [index]: { status: 'Error', data: error.message, ok: false }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [index]: false }));
    }
  };

  const formatTime = (ms) => {
    if (ms < 1000) return ms + 'ms';
    return (ms / 1000).toFixed(1) + 's';
  };

  const formatNumber = (num) => num.toLocaleString();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Hero Header */}
      <header style={{
        background: 'rgba(0,0,0,0.3)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '0'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '24px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span style={{
                background: 'linear-gradient(135deg, #10B981 0%, #3B82F6 100%)',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Test Mode
              </span>
              <span style={{ color: '#6B7280', fontSize: '14px' }}>Zero AI Cost</span>
            </div>
            <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '700' }}>
              {stats.businessName}
            </h1>
            <p style={{ margin: '8px 0 0', color: '#9CA3AF', fontSize: '16px' }}>
              Full-stack {stats.industry} website generated in {formatTime(stats.generationTime)}
            </p>
          </div>
          <a
            href="/"
            style={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: '#fff',
              padding: '14px 28px',
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.5)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(16, 185, 129, 0.4)'; }}
          >
            View Live Site →
          </a>
        </div>
      </header>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px' }}>
        {/* Stats Cards */}
        <section style={{ marginBottom: '48px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '20px'
          }}>
            {[
              { label: 'Industry', value: stats.industry, icon: '🏭', color: '#8B5CF6' },
              { label: 'Pages', value: stats.pages.length, icon: '📄', color: '#3B82F6' },
              { label: 'Backend Modules', value: stats.backendModules.length, icon: '⚙️', color: '#10B981' },
              { label: 'Lines of Code', value: formatNumber(stats.totalLinesOfCode), icon: '💻', color: '#F59E0B' },
              { label: 'Files Generated', value: formatNumber(stats.totalFiles), icon: '📁', color: '#EC4899' },
              { label: 'Generation Time', value: formatTime(stats.generationTime), icon: '⚡', color: '#06B6D4' }
            ].map((stat, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid rgba(255,255,255,0.08)',
                transition: 'transform 0.2s, background 0.2s'
              }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              >
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>{stat.icon}</div>
                <div style={{ color: '#6B7280', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{stat.label}</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: stat.color }}>{stat.value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Generated Promo Video */}
        <section style={{ marginBottom: '48px' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
            borderRadius: '20px',
            padding: '32px',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
              <div style={{ flex: '1', minWidth: '280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '32px' }}>🎬</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#fff' }}>Promo Video</h3>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      <span style={{
                        background: '#10B981',
                        color: '#fff',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>Generated</span>
                      <span style={{
                        background: '#3B82F6',
                        color: '#fff',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>10s • 1080p</span>
                    </div>
                  </div>
                </div>
                <p style={{ color: '#9CA3AF', fontSize: '14px', margin: '12px 0 16px', lineHeight: '1.5' }}>
                  Auto-generated promotional video featuring your brand colors, business name, and key features.
                  Ready for social media and marketing campaigns.
                </p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <a
                    href="/videos/promo-video.mp4"
                    target="_blank"
                    style={{
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      color: '#fff',
                      padding: '10px 20px',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      fontWeight: '600',
                      fontSize: '14px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    ▶️ Watch Video
                  </a>
                  <a
                    href="/videos/promo-video.mp4"
                    download
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      color: '#fff',
                      padding: '10px 20px',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      fontWeight: '500',
                      fontSize: '14px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    ⬇️ Download
                  </a>
                </div>
              </div>
              <div style={{
                width: '320px',
                aspectRatio: '16/9',
                background: 'rgba(0,0,0,0.4)',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)',
                position: 'relative'
              }}>
                <video
                  src="/videos/promo-video.mp4"
                  poster="/videos/thumbnail.svg"
                  controls
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
                />
                <div style={{
                  display: 'none',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  color: '#6B7280',
                  fontSize: '14px',
                  textAlign: 'center',
                  padding: '20px'
                }}>
                  <span style={{ fontSize: '32px', marginBottom: '8px' }}>🎥</span>
                  <span>Video preview available after Remotion render</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Admin Credentials Card */}
        <section style={{ marginBottom: '48px' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)',
            borderRadius: '16px',
            padding: '24px 32px',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                🔐
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#fff' }}>Admin Login Credentials</h3>
                <p style={{ margin: '4px 0 0', color: '#9CA3AF', fontSize: '14px' }}>Use these to test the admin dashboard</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '12px 20px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <div style={{ color: '#6B7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Email</div>
                <div style={{ color: '#fff', fontFamily: 'monospace', fontSize: '15px', fontWeight: '500' }}>{stats.adminCredentials.email}</div>
              </div>
              <div style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '12px 20px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <div style={{ color: '#6B7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Password</div>
                <div style={{ color: '#fff', fontFamily: 'monospace', fontSize: '15px', fontWeight: '500' }}>{stats.adminCredentials.password}</div>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(stats.adminCredentials.email + ' / ' + stats.adminCredentials.password)}
                style={{
                  background: 'rgba(139, 92, 246, 0.3)',
                  color: '#fff',
                  border: '1px solid rgba(139, 92, 246, 0.5)',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.5)'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.3)'; }}
              >
                📋 Copy
              </button>
            </div>
          </div>
        </section>

        {/* Two Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          {/* Left Column */}
          <div>
            {/* Pages Section */}
            <section style={{ marginBottom: '32px' }}>
              <h2 style={{ color: '#fff', marginBottom: '16px', fontSize: '20px', fontWeight: '600' }}>
                Generated Pages
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {stats.pages.map((page, i) => (
                  <a
                    key={i}
                    href={page.route}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: '10px',
                      padding: '14px 18px',
                      textDecoration: 'none',
                      color: '#fff',
                      border: '1px solid rgba(255,255,255,0.08)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'; e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                  >
                    <span style={{ fontWeight: '500' }}>{page.name.replace('Page', '')}</span>
                    <span style={{ color: '#6B7280', fontSize: '13px' }}>{page.route} →</span>
                  </a>
                ))}
              </div>
            </section>

            {/* Code Breakdown */}
            <section style={{ marginBottom: '32px' }}>
              <h2 style={{ color: '#fff', marginBottom: '16px', fontSize: '20px', fontWeight: '600' }}>
                Code Breakdown
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'Frontend', lines: stats.frontendLines, color: '#3B82F6', icon: '🎨' },
                  { label: 'Backend API', lines: stats.backendLines, color: '#10B981', icon: '⚙️' },
                  { label: 'Admin Panel', lines: stats.adminLines, color: '#F59E0B', icon: '🛠️' }
                ].map((item, i) => (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '10px',
                    padding: '16px 18px',
                    borderLeft: \`4px solid \${item.color}\`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <span style={{ fontSize: '20px' }}>{item.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#9CA3AF', fontSize: '13px' }}>{item.label}</div>
                      <div style={{ fontSize: '20px', fontWeight: '600' }}>{formatNumber(item.lines)} <span style={{ fontSize: '12px', color: '#6B7280' }}>lines</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Deployment Info */}
            <section>
              <h2 style={{ color: '#fff', marginBottom: '16px', fontSize: '20px', fontWeight: '600' }}>
                Deployment
              </h2>
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid rgba(255,255,255,0.08)'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <div style={{ color: '#6B7280', fontSize: '12px', marginBottom: '4px' }}>Frontend</div>
                    <a href={stats.deploymentUrl} target="_blank" rel="noreferrer" style={{ color: '#3B82F6', fontSize: '14px', wordBreak: 'break-all' }}>{stats.deploymentUrl}</a>
                  </div>
                  <div>
                    <div style={{ color: '#6B7280', fontSize: '12px', marginBottom: '4px' }}>Backend API</div>
                    <a href={stats.backendUrl} target="_blank" rel="noreferrer" style={{ color: '#10B981', fontSize: '14px', wordBreak: 'break-all' }}>{stats.backendUrl}</a>
                  </div>
                  <div>
                    <div style={{ color: '#6B7280', fontSize: '12px', marginBottom: '4px' }}>Admin Panel</div>
                    <a href={stats.adminUrl} target="_blank" rel="noreferrer" style={{ color: '#F59E0B', fontSize: '14px', wordBreak: 'break-all' }}>{stats.adminUrl}</a>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - API Tester */}
          <div>
            <section>
              <h2 style={{ color: '#fff', marginBottom: '16px', fontSize: '20px', fontWeight: '600' }}>
                Backend API Tester
              </h2>
              <p style={{ color: '#6B7280', marginBottom: '16px', fontSize: '14px' }}>
                Live API endpoints for this {stats.industry} site
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {endpoints.map((endpoint, i) => (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    border: '1px solid rgba(255,255,255,0.08)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: apiResults[i] ? '12px' : '0' }}>
                      <span style={{
                        background: endpoint.method === 'GET' ? '#10B981' : '#3B82F6',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '700'
                      }}>
                        {endpoint.method}
                      </span>
                      <code style={{ color: '#E5E7EB', fontSize: '13px', flex: 1 }}>{endpoint.path}</code>
                      <button
                        onClick={() => testEndpoint(endpoint, i)}
                        disabled={loading[i]}
                        style={{
                          background: loading[i] ? '#4B5563' : '#3B82F6',
                          color: '#fff',
                          border: 'none',
                          padding: '6px 14px',
                          borderRadius: '6px',
                          cursor: loading[i] ? 'wait' : 'pointer',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                      >
                        {loading[i] ? '...' : 'Test'}
                      </button>
                    </div>
                    {apiResults[i] && (
                      <div style={{
                        background: 'rgba(0,0,0,0.3)',
                        borderRadius: '6px',
                        padding: '10px 12px',
                        fontSize: '12px'
                      }}>
                        <div style={{
                          color: apiResults[i].ok ? '#10B981' : '#EF4444',
                          marginBottom: '6px',
                          fontWeight: '500'
                        }}>
                          Status: {apiResults[i].status}
                        </div>
                        <pre style={{
                          margin: 0,
                          overflow: 'auto',
                          maxHeight: '120px',
                          color: '#9CA3AF',
                          fontSize: '11px',
                          lineHeight: '1.4'
                        }}>
                          {typeof apiResults[i].data === 'string'
                            ? apiResults[i].data
                            : JSON.stringify(apiResults[i].data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Backend Modules */}
            <section style={{ marginTop: '32px' }}>
              <h2 style={{ color: '#fff', marginBottom: '16px', fontSize: '20px', fontWeight: '600' }}>
                Backend Modules
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {stats.backendModules.map((mod, i) => (
                  <span key={i} style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#10B981',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}>
                    {mod}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '32px 40px',
        color: '#6B7280',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        marginTop: '60px',
        background: 'rgba(0,0,0,0.2)'
      }}>
        <div style={{ marginBottom: '8px' }}>
          <span style={{
            background: 'linear-gradient(135deg, #10B981 0%, #3B82F6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: '700',
            fontSize: '18px'
          }}>
            Blink
          </span>
          <span style={{ color: '#4B5563', marginLeft: '8px' }}>by</span>
          <span style={{ color: '#9CA3AF', fontWeight: '600', marginLeft: '8px' }}>BE1st</span>
        </div>
        <div style={{ fontSize: '13px' }}>
          Full-stack website generation platform • Zero AI cost test mode
        </div>
      </footer>
    </div>
  );
}
`;

  return {
    dashboardPage,
    stats: {
      pages: pages.length,
      backendModules: backendModules.length,
      totalLinesOfCode: totalLines,
      totalFiles,
      frontendLines: frontendStats.totalLines,
      backendLines: backendStats.totalLines,
      adminLines: adminStats.totalLines
    }
  };
}

/**
 * Write the test dashboard to the project as the LANDING PAGE
 */
function writeTestDashboard(projectPath, options) {
  const { dashboardPage } = generateTestDashboard({ projectPath, ...options });

  const pagesDir = path.join(projectPath, 'frontend', 'src', 'pages');
  if (!fs.existsSync(pagesDir)) {
    fs.mkdirSync(pagesDir, { recursive: true });
  }

  fs.writeFileSync(path.join(pagesDir, 'TestDashboard.jsx'), dashboardPage);
  console.log('   ✅ Generated TestDashboard.jsx');

  // Update App.jsx to add TestDashboard at /dashboard route (keep HomePage at /)
  const appPath = path.join(projectPath, 'frontend', 'src', 'App.jsx');
  if (fs.existsSync(appPath)) {
    let appContent = fs.readFileSync(appPath, 'utf-8');

    if (!appContent.includes('TestDashboard')) {
      // Add import
      const importLine = "import TestDashboard from './pages/TestDashboard';";

      if (appContent.includes("import Navigation")) {
        appContent = appContent.replace(
          /(import Navigation)/,
          `${importLine}\n$1`
        );
      } else {
        appContent = appContent.replace(
          /(import.*from ['"]react-router-dom['"];?\n)/,
          `$1${importLine}\n`
        );
      }

      // Add TestDashboard at /dashboard route (NOT at / - keep HomePage there)
      appContent = appContent.replace(
        /(\s*)<\/Routes>/,
        `$1  <Route path="/dashboard" element={<TestDashboard />} />\n$1</Routes>`
      );

      fs.writeFileSync(appPath, appContent);
      console.log('   ✅ Added TestDashboard at /dashboard route');
    }
  }

  return { dashboardPage };
}

module.exports = {
  generateTestDashboard,
  writeTestDashboard,
  countLinesOfCode,
  getPagesList,
  getBackendModules,
  getApiEndpoints
};
