/**
 * Admin Dashboard Generator
 *
 * Generates a complete admin dashboard for each project including:
 * - Dashboard home with stats
 * - Industry-specific module pages (Catalog, Booking, Listings, Inquiries)
 * - Notification center
 * - AI Agent chat
 * - Sidebar navigation
 *
 * Now industry-aware: generates correct admin pages based on industry type
 */

const fs = require('fs');
const path = require('path');

// Industry module configuration
const {
  getIndustryModules,
  getModuleType,
  getModuleLabel,
  getModuleNames,
  MODULE_LABELS
} = require('../../config/industry-modules.cjs');

/**
 * Generate complete admin dashboard
 * @param {string} adminDir - Output directory for admin dashboard
 * @param {object} businessData - Business configuration
 * @param {string} industryId - Industry type
 * @returns {object} - Generation result
 */
function generateAdminDashboard(adminDir, businessData, industryId) {
  const businessName = businessData.name || 'My Business';
  const primaryColor = businessData.theme?.primary || businessData.theme?.colors?.primary || '#f59e0b';

  // Get industry-specific modules
  const industryModules = getIndustryModules(industryId);
  const moduleNames = Object.keys(industryModules);

  // Create directory structure
  const srcDir = path.join(adminDir, 'src');
  const componentsDir = path.join(srcDir, 'components');
  const pagesDir = path.join(srcDir, 'pages');

  [adminDir, srcDir, componentsDir, pagesDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  const files = [];

  // Generate package.json
  fs.writeFileSync(
    path.join(adminDir, 'package.json'),
    JSON.stringify(generateAdminPackageJson(businessName), null, 2)
  );
  files.push('package.json');

  // Generate vite.config.js
  fs.writeFileSync(path.join(adminDir, 'vite.config.js'), generateAdminViteConfig());
  files.push('vite.config.js');

  // Generate index.html
  fs.writeFileSync(path.join(adminDir, 'index.html'), generateAdminIndexHtml(businessName));
  files.push('index.html');

  // Generate main.jsx
  fs.writeFileSync(path.join(srcDir, 'main.jsx'), generateAdminMain());
  files.push('src/main.jsx');

  // Generate App.jsx - industry-aware routing
  fs.writeFileSync(path.join(srcDir, 'App.jsx'), generateAdminApp(businessName, primaryColor, industryModules));
  files.push('src/App.jsx');

  // Generate index.css
  fs.writeFileSync(path.join(srcDir, 'index.css'), generateAdminCSS(primaryColor));
  files.push('src/index.css');

  // Generate components
  fs.writeFileSync(path.join(componentsDir, 'AdminLayout.jsx'), generateAdminLayout(businessName, primaryColor));
  files.push('src/components/AdminLayout.jsx');

  // Generate Sidebar - industry-aware navigation
  fs.writeFileSync(path.join(componentsDir, 'Sidebar.jsx'), generateSidebar(businessName, primaryColor, industryModules));
  files.push('src/components/Sidebar.jsx');

  // Generate pages - Dashboard Home (industry-aware stats)
  fs.writeFileSync(path.join(pagesDir, 'DashboardHome.jsx'), generateDashboardHome(businessName, primaryColor, industryModules));
  files.push('src/pages/DashboardHome.jsx');

  // Generate industry-specific module pages
  for (const [moduleName, moduleType] of Object.entries(industryModules)) {
    const labelConfig = getModuleLabel(moduleName);
    const pageFileName = capitalize(moduleName) + 'Page.jsx';

    switch (moduleType) {
      case 'catalog':
        fs.writeFileSync(path.join(pagesDir, pageFileName), generateCatalogEditorPage(moduleName, labelConfig, primaryColor));
        break;
      case 'booking':
        fs.writeFileSync(path.join(pagesDir, pageFileName), generateBookingCalendarPage(moduleName, labelConfig, primaryColor));
        break;
      case 'listings':
        fs.writeFileSync(path.join(pagesDir, pageFileName), generateListingsManagerPage(moduleName, labelConfig, primaryColor));
        break;
      case 'inquiries':
        fs.writeFileSync(path.join(pagesDir, pageFileName), generateInquiriesManagerPage(moduleName, labelConfig, primaryColor));
        break;
      default:
        fs.writeFileSync(path.join(pagesDir, pageFileName), generateGenericModulePage(moduleName, labelConfig, primaryColor));
    }
    files.push('src/pages/' + pageFileName);
  }

  // Generate common pages
  fs.writeFileSync(path.join(pagesDir, 'Notifications.jsx'), generateNotificationsPage(businessName, primaryColor));
  files.push('src/pages/Notifications.jsx');

  fs.writeFileSync(path.join(pagesDir, 'AgentChat.jsx'), generateAgentChatPage(businessName, primaryColor));
  files.push('src/pages/AgentChat.jsx');

  fs.writeFileSync(path.join(pagesDir, 'Settings.jsx'), generateSettingsPage(businessName, primaryColor));
  files.push('src/pages/Settings.jsx');

  return {
    success: true,
    files: files.length,
    dir: adminDir,
    modules: moduleNames
  };
}

/**
 * Capitalize module name for component/file names
 */
function capitalize(str) {
  if (str.includes('-')) {
    return str.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================
// CONFIG FILES
// ============================================

function generateAdminPackageJson(businessName) {
  const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return {
    name: `${slug}-admin`,
    private: true,
    version: "1.0.0",
    type: "module",
    scripts: {
      dev: "vite --port 5002",
      build: "vite build",
      preview: "vite preview"
    },
    dependencies: {
      react: "^18.2.0",
      "react-dom": "^18.2.0",
      "react-router-dom": "^6.20.0",
      "lucide-react": "^0.294.0"
    },
    devDependencies: {
      "@vitejs/plugin-react": "^4.2.0",
      vite: "^5.0.0"
    }
  };
}

function generateAdminViteConfig() {
  return `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5002,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true
      }
    }
  }
});
`;
}

function generateAdminIndexHtml(businessName) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${businessName} - Admin Dashboard</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`;
}

function generateAdminMain() {
  return `import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
`;
}

function generateAdminCSS(primaryColor) {
  return `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f9fafb;
  color: #111827;
  line-height: 1.5;
}

:root {
  --primary: ${primaryColor};
  --primary-dark: color-mix(in srgb, ${primaryColor} 80%, black);
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
`;
}

// ============================================
// APP & LAYOUT
// ============================================

function generateAdminApp(businessName, primaryColor, industryModules = {}) {
  // Build imports and routes based on industry modules
  const moduleNames = Object.keys(industryModules);

  const moduleImports = moduleNames.map(mod => {
    const componentName = capitalize(mod) + 'Page';
    return `import ${componentName} from './pages/${componentName}';`;
  }).join('\n');

  const moduleRoutes = moduleNames.map(mod => {
    const componentName = capitalize(mod) + 'Page';
    return `        <Route path="${mod}" element={<${componentName} />} />`;
  }).join('\n');

  return `import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import DashboardHome from './pages/DashboardHome';
${moduleImports}
import Notifications from './pages/Notifications';
import AgentChat from './pages/AgentChat';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<DashboardHome />} />
${moduleRoutes}
        <Route path="notifications" element={<Notifications />} />
        <Route path="ai" element={<AgentChat />} />
        <Route path="ai/:agentId" element={<AgentChat />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
`;
}

function generateAdminLayout(businessName, primaryColor) {
  return `import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AdminLayout() {
  return (
    <div style={styles.layout}>
      <Sidebar />
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh'
  },
  main: {
    flex: 1,
    marginLeft: '260px',
    padding: '24px',
    background: '#f9fafb',
    minHeight: '100vh'
  }
};
`;
}

function generateSidebar(businessName, primaryColor, industryModules = {}) {
  // Build nav items from industry modules
  const moduleNames = Object.keys(industryModules);

  // Map module names to their icons
  const iconMap = {
    menu: 'UtensilsCrossed',
    services: 'Wrench',
    classes: 'Users',
    features: 'Sparkles',
    products: 'Package',
    programs: 'GraduationCap',
    reservations: 'Calendar',
    appointments: 'CalendarCheck',
    consultations: 'MessageSquare',
    bookings: 'CalendarDays',
    demos: 'Presentation',
    listings: 'Home',
    orders: 'ShoppingBag',
    quotes: 'FileText',
    memberships: 'CreditCard',
    enrollments: 'ClipboardList',
    inquiries: 'Mail'
  };

  // Build navItems array as a string
  const moduleNavItems = moduleNames.map(mod => {
    const label = MODULE_LABELS[mod]?.label || capitalize(mod);
    const icon = iconMap[mod] || 'FileText';
    return `  { path: '/${mod}', icon: ${icon}, label: '${label}' }`;
  }).join(',\n');

  // Build icons import
  const usedIcons = ['LayoutDashboard', 'Bell', 'Bot', 'Settings', 'ExternalLink', 'ChevronRight'];
  moduleNames.forEach(mod => {
    const icon = iconMap[mod] || 'FileText';
    if (!usedIcons.includes(icon)) usedIcons.push(icon);
  });
  const iconsImport = usedIcons.join(', ');

  return `import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  ${iconsImport}
} from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
${moduleNavItems},
  { path: '/notifications', icon: Bell, label: 'Notifications' },
  { path: '/ai', icon: Bot, label: 'AI Agents' },
  { path: '/settings', icon: Settings, label: 'Settings' }
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>
        <span style={styles.logoIcon}>🏪</span>
        <div>
          <h1 style={styles.logoText}>${businessName}</h1>
          <span style={styles.logoSub}>Admin Dashboard</span>
        </div>
      </div>

      <nav style={styles.nav}>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));

          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={{
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {})
              }}
            >
              <Icon size={20} />
              <span>{item.label}</span>
              {isActive && <ChevronRight size={16} style={{ marginLeft: 'auto' }} />}
            </NavLink>
          );
        })}
      </nav>

      <div style={styles.footer}>
        <a href="/" target="_blank" rel="noopener noreferrer" style={styles.viewSite}>
          <ExternalLink size={16} />
          View Public Site
        </a>
        <div style={styles.syncStatus}>
          <span style={styles.syncDot}></span>
          Real-time sync active
        </div>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: '260px',
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    background: '#1f2937',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 0'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '0 20px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)'
  },
  logoIcon: {
    fontSize: '28px'
  },
  logoText: {
    fontSize: '16px',
    fontWeight: '600',
    margin: 0
  },
  logoSub: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.6)'
  },
  nav: {
    flex: 1,
    padding: '20px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    color: 'rgba(255,255,255,0.7)',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  navItemActive: {
    background: '${primaryColor}',
    color: '#fff'
  },
  footer: {
    padding: '20px',
    borderTop: '1px solid rgba(255,255,255,0.1)'
  },
  viewSite: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    textDecoration: 'none',
    fontSize: '13px',
    marginBottom: '12px'
  },
  syncStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: 'rgba(255,255,255,0.5)'
  },
  syncDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#22c55e'
  }
};
`;
}

// ============================================
// PAGES
// ============================================

function generateDashboardHome(businessName, primaryColor, industryModules = {}) {
  // Determine primary and secondary modules
  const moduleNames = Object.keys(industryModules);
  const primaryModule = moduleNames[0] || 'services';
  const secondaryModule = moduleNames[1] || null;
  const primaryType = industryModules[primaryModule] || 'catalog';
  const secondaryType = secondaryModule ? industryModules[secondaryModule] : null;

  // Get labels for modules
  const primaryLabel = MODULE_LABELS[primaryModule]?.label || capitalize(primaryModule);
  const secondaryLabel = secondaryModule ? (MODULE_LABELS[secondaryModule]?.label || capitalize(secondaryModule)) : '';
  const primarySingular = MODULE_LABELS[primaryModule]?.singular || 'Item';
  const secondarySingular = secondaryModule ? (MODULE_LABELS[secondaryModule]?.singular || 'Item') : '';

  // Determine which stats API to call based on module types
  const hasBooking = Object.values(industryModules).includes('booking');
  const hasInquiries = Object.values(industryModules).includes('inquiries');
  const hasListings = Object.values(industryModules).includes('listings');

  // Find the booking module name if it exists
  const bookingModule = hasBooking ? Object.keys(industryModules).find(k => industryModules[k] === 'booking') : null;
  const inquiriesModule = hasInquiries ? Object.keys(industryModules).find(k => industryModules[k] === 'inquiries') : null;
  const listingsModule = hasListings ? Object.keys(industryModules).find(k => industryModules[k] === 'listings') : null;

  // Stat API endpoint
  const statsEndpoint = bookingModule ? `/${bookingModule}/admin/stats` :
                        inquiriesModule ? `/${inquiriesModule}/admin/stats` :
                        listingsModule ? `/${listingsModule}/admin/stats` : '/health';

  // Build stat cards dynamically
  let statCardsCode = '';
  if (hasBooking) {
    const bookingLabel = MODULE_LABELS[bookingModule]?.label || capitalize(bookingModule);
    statCardsCode = `[
    {
      label: "Today's ${bookingLabel}",
      value: stats?.today?.total || 0,
      icon: Calendar,
      color: '${primaryColor}',
      link: '/${bookingModule}'
    },
    {
      label: 'Pending Confirmation',
      value: stats?.needsAction || 0,
      icon: Clock,
      color: '#eab308',
      link: '/${bookingModule}?status=pending'
    },
    {
      label: 'This Week',
      value: stats?.thisWeek?.total || 0,
      icon: TrendingUp,
      color: '#22c55e',
      link: '/${bookingModule}'
    },
    {
      label: '${primaryLabel}',
      value: '—',
      icon: FileText,
      color: '#8b5cf6',
      link: '/${primaryModule}'
    }
  ]`;
  } else if (hasInquiries) {
    const inquiriesLabel = MODULE_LABELS[inquiriesModule]?.label || capitalize(inquiriesModule);
    statCardsCode = `[
    {
      label: "New ${inquiriesLabel}",
      value: stats?.new || 0,
      icon: Mail,
      color: '${primaryColor}',
      link: '/${inquiriesModule}'
    },
    {
      label: 'High Priority',
      value: stats?.highPriority || 0,
      icon: AlertCircle,
      color: '#ef4444',
      link: '/${inquiriesModule}?priority=high'
    },
    {
      label: 'Total',
      value: stats?.total || 0,
      icon: TrendingUp,
      color: '#22c55e',
      link: '/${inquiriesModule}'
    },
    {
      label: '${primaryLabel}',
      value: '—',
      icon: FileText,
      color: '#8b5cf6',
      link: '/${primaryModule}'
    }
  ]`;
  } else if (hasListings) {
    statCardsCode = `[
    {
      label: "Active Listings",
      value: stats?.active || 0,
      icon: Home,
      color: '${primaryColor}',
      link: '/${listingsModule}'
    },
    {
      label: 'Pending',
      value: stats?.pending || 0,
      icon: Clock,
      color: '#eab308',
      link: '/${listingsModule}?status=pending'
    },
    {
      label: 'Total',
      value: stats?.total || 0,
      icon: TrendingUp,
      color: '#22c55e',
      link: '/${listingsModule}'
    },
    {
      label: 'Avg Price',
      value: stats?.avgPrice ? '$' + stats.avgPrice.toLocaleString() : '—',
      icon: DollarSign,
      color: '#8b5cf6',
      link: '/${listingsModule}'
    }
  ]`;
  } else {
    // Default catalog-only dashboard
    statCardsCode = `[
    {
      label: "Total ${primaryLabel}",
      value: stats?.total || '—',
      icon: FileText,
      color: '${primaryColor}',
      link: '/${primaryModule}'
    },
    {
      label: 'Active',
      value: stats?.active || '—',
      icon: CheckCircle,
      color: '#22c55e',
      link: '/${primaryModule}'
    },
    {
      label: 'Categories',
      value: stats?.categories || '—',
      icon: Layers,
      color: '#8b5cf6',
      link: '/${primaryModule}'
    },
    {
      label: 'Views Today',
      value: '—',
      icon: TrendingUp,
      color: '#eab308',
      link: '/'
    }
  ]`;
  }

  return `import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, Bell, TrendingUp, Users, DollarSign, FileText, Layers,
  Clock, CheckCircle, AlertCircle, ArrowRight, Mail, Home
} from 'lucide-react';

const API_BASE = '/api';

// Demo data when API is unavailable
const DEMO_STATS = {
  today: { total: 8, confirmed: 5, pending: 3 },
  thisWeek: { total: 34 },
  needsAction: 3,
  new: 5,
  highPriority: 2,
  total: 45,
  active: 12,
  pending: 3,
  avgPrice: 350000
};

const DEMO_ITEMS = [
  { id: 1, customer_name: 'John Smith', time: '7:00 PM', status: 'confirmed' },
  { id: 2, customer_name: 'Sarah Johnson', time: '7:30 PM', status: 'pending' },
  { id: 3, customer_name: 'Mike Williams', time: '8:00 PM', status: 'confirmed' }
];

export default function DashboardHome() {
  const [stats, setStats] = useState(DEMO_STATS);
  const [recentItems, setRecentItems] = useState(DEMO_ITEMS);
  const [loading, setLoading] = useState(true);
  const [usingDemoData, setUsingDemoData] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const statsRes = await fetch(\`\${API_BASE}${statsEndpoint}\`);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (statsData.success) setStats(statsData.stats);
        } else {
          setUsingDemoData(true);
        }
      } catch (err) {
        console.log('Using demo data - API unavailable');
        setUsingDemoData(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const statCards = ${statCardsCode};

  return (
    <div>
      {usingDemoData && (
        <div style={styles.demoBanner}>
          <span>📊 Showing demo data - Backend API not connected</span>
        </div>
      )}

      <div style={styles.header}>
        <h1 style={styles.title}>Dashboard</h1>
        <p style={styles.subtitle}>Welcome back! Here's what's happening at ${businessName}.</p>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Link key={idx} to={stat.link} style={styles.statCard}>
              <div style={{ ...styles.statIcon, background: stat.color + '15', color: stat.color }}>
                <Icon size={24} />
              </div>
              <div>
                <p style={styles.statValue}>{stat.value}</p>
                <p style={styles.statLabel}>{stat.label}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Quick Actions</h2>
        <div style={styles.actionsGrid}>
          <Link to="/menu" style={styles.actionCard}>
            <UtensilsCrossed size={24} />
            <span>Edit Menu</span>
            <ArrowRight size={16} style={{ marginLeft: 'auto' }} />
          </Link>
          <Link to="/reservations" style={styles.actionCard}>
            <Calendar size={24} />
            <span>View Reservations</span>
            <ArrowRight size={16} style={{ marginLeft: 'auto' }} />
          </Link>
          <Link to="/ai" style={styles.actionCard}>
            <Bell size={24} />
            <span>Chat with AI Agent</span>
            <ArrowRight size={16} style={{ marginLeft: 'auto' }} />
          </Link>
        </div>
      </div>

      {/* Today's Reservations */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Today's Reservations</h2>
          <Link to="/reservations" style={styles.viewAll}>View all</Link>
        </div>

        {loading ? (
          <p style={styles.loading}>Loading...</p>
        ) : recentItems.length > 0 ? (
          <div style={styles.reservationsList}>
            {recentItems.map(res => (
              <div key={res.id} style={styles.reservationItem}>
                <div style={styles.resTime}>{res.time}</div>
                <div style={styles.resInfo}>
                  <p style={styles.resName}>{res.customer_name}</p>
                  <p style={styles.resDetails}>{res.party_size} guests</p>
                </div>
                <span style={{
                  ...styles.resStatus,
                  background: res.status === 'confirmed' ? '#dcfce7' : '#fef3c7',
                  color: res.status === 'confirmed' ? '#166534' : '#92400e'
                }}>
                  {res.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p style={styles.empty}>No reservations today</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  demoBanner: {
    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    border: '1px solid #f59e0b',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '20px',
    fontSize: '14px',
    color: '#92400e',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  header: { marginBottom: '32px' },
  title: { fontSize: '28px', fontWeight: '700', color: '#111827', margin: 0 },
  subtitle: { color: '#6b7280', marginTop: '8px' },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
    marginBottom: '32px'
  },
  statCard: {
    background: '#fff',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    textDecoration: 'none',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statValue: { fontSize: '28px', fontWeight: '700', color: '#111827', margin: 0 },
  statLabel: { fontSize: '14px', color: '#6b7280', margin: 0 },
  section: { marginBottom: '32px' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  sectionTitle: { fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 },
  viewAll: { color: '${primaryColor}', textDecoration: 'none', fontSize: '14px', fontWeight: '500' },
  actionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' },
  actionCard: {
    background: '#fff',
    borderRadius: '12px',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
    color: '#374151',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'all 0.2s'
  },
  reservationsList: { background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  reservationItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #f3f4f6',
    gap: '16px'
  },
  resTime: { fontSize: '14px', fontWeight: '600', color: '${primaryColor}', minWidth: '70px' },
  resInfo: { flex: 1 },
  resName: { fontWeight: '500', color: '#111827', margin: 0 },
  resDetails: { fontSize: '13px', color: '#6b7280', margin: 0 },
  resStatus: { padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '500', textTransform: 'capitalize' },
  loading: { color: '#6b7280', padding: '20px', textAlign: 'center' },
  empty: { color: '#9ca3af', padding: '40px', textAlign: 'center', background: '#fff', borderRadius: '12px' }
};
`;
}

function generateMenuEditorPage(businessName, primaryColor) {
  return `import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Edit2, Trash2, GripVertical, Check, X, ChevronDown, ChevronRight,
  Leaf, Star, Eye, EyeOff, Save, RefreshCw, AlertCircle
} from 'lucide-react';

const API_BASE = '/api/menu';

// Demo menu data when API is unavailable
const DEMO_CATEGORIES = [
  {
    id: 1,
    name: 'Popular Items',
    description: 'Customer favorites',
    items: [
      { id: 1, name: 'House Special', price: 14.99, description: 'Our signature dish', available: true, popular: true },
      { id: 2, name: 'Classic Combo', price: 12.99, description: 'A timeless favorite', available: true, popular: true }
    ]
  },
  {
    id: 2,
    name: 'Main Courses',
    description: 'Hearty entrees',
    items: [
      { id: 3, name: 'Grilled Selection', price: 18.99, description: 'Fresh and delicious', available: true },
      { id: 4, name: 'Chef\\'s Choice', price: 22.99, description: 'Daily special', available: false }
    ]
  },
  {
    id: 3,
    name: 'Beverages',
    description: 'Drinks and refreshments',
    items: [
      { id: 5, name: 'Fresh Lemonade', price: 4.99, description: 'House-made', available: true },
      { id: 6, name: 'Iced Tea', price: 3.99, description: 'Unsweetened', available: true }
    ]
  }
];

export default function MenuEditor() {
  const [categories, setCategories] = useState(DEMO_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingDemoData, setUsingDemoData] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({ 1: true, 2: true, 3: true });
  const [editingItem, setEditingItem] = useState(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddItem, setShowAddItem] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [newItem, setNewItem] = useState({ name: '', price: '', description: '' });

  const fetchMenu = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(\`\${API_BASE}/admin\`);
      if (!res.ok) {
        setUsingDemoData(true);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
        // Expand all categories by default
        const expanded = {};
        data.categories.forEach(cat => expanded[cat.id] = true);
        setExpandedCategories(expanded);
        setError(null);
        setUsingDemoData(false);
      }
    } catch (err) {
      console.log('Using demo menu data');
      setUsingDemoData(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();

    // SSE for real-time updates
    const eventSource = new EventSource(\`\${API_BASE}/events\`);
    eventSource.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type !== 'connected' && data.type !== 'initial_state' && data.type !== 'heartbeat') {
        fetchMenu();
      }
    };
    eventSource.onerror = () => {
      console.log('SSE connection error - using polling fallback');
      eventSource.close();
    };
    return () => eventSource.close();
  }, [fetchMenu]);

  const toggleAvailability = async (itemId, available) => {
    try {
      await fetch(\`\${API_BASE}/admin/item/\${itemId}/availability\`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available })
      });
      fetchMenu(); // Refresh after update
    } catch (err) {
      console.error('Failed to toggle availability:', err);
    }
  };

  const deleteItem = async (itemId) => {
    if (!confirm('Delete this item?')) return;
    try {
      await fetch(\`\${API_BASE}/admin/item/\${itemId}\`, { method: 'DELETE' });
      fetchMenu(); // Refresh after delete
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  const addCategory = async () => {
    if (!newCategory.name) return;
    try {
      await fetch(\`\${API_BASE}/admin/category\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory)
      });
      setNewCategory({ name: '', description: '' });
      setShowAddCategory(false);
      fetchMenu(); // Refresh after add
    } catch (err) {
      console.error('Failed to add category:', err);
    }
  };

  const addItem = async (categoryId) => {
    if (!newItem.name || !newItem.price) return;
    try {
      await fetch(\`\${API_BASE}/admin/item\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newItem, category_id: categoryId })
      });
      setNewItem({ name: '', price: '', description: '' });
      setShowAddItem(null);
      fetchMenu(); // Refresh after add
    } catch (err) {
      console.error('Failed to add item:', err);
    }
  };

  const updateItem = async (itemId, updates) => {
    try {
      await fetch(\`\${API_BASE}/admin/item/\${itemId}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      setEditingItem(null);
      fetchMenu(); // Refresh after update
    } catch (err) {
      console.error('Failed to update item:', err);
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite' }} />
        <p>Loading menu...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {usingDemoData && (
        <div style={styles.demoBanner}>
          <span>📋 Demo Mode - Changes won't be saved (API not connected)</span>
        </div>
      )}

      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Menu Editor</h1>
          <p style={styles.subtitle}>Manage your menu items and categories</p>
        </div>
        <div style={styles.headerActions}>
          <button onClick={fetchMenu} style={styles.refreshBtn}>
            <RefreshCw size={18} /> Refresh
          </button>
          <button onClick={() => setShowAddCategory(true)} style={styles.addBtn}>
            <Plus size={18} /> Add Category
          </button>
        </div>
      </div>

      {error && (
        <div style={styles.error}>
          <AlertCircle size={18} /> {error}
          <button onClick={() => setError(null)} style={styles.dismissBtn}><X size={16} /></button>
        </div>
      )}

      {showAddCategory && (
        <div style={styles.addForm}>
          <h3>New Category</h3>
          <input
            placeholder="Category name"
            value={newCategory.name}
            onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
            style={styles.input}
          />
          <input
            placeholder="Description (optional)"
            value={newCategory.description}
            onChange={e => setNewCategory({ ...newCategory, description: e.target.value })}
            style={styles.input}
          />
          <div style={styles.formActions}>
            <button onClick={() => setShowAddCategory(false)} style={styles.cancelBtn}>Cancel</button>
            <button onClick={addCategory} style={styles.saveBtn}><Plus size={16} /> Create</button>
          </div>
        </div>
      )}

      <div style={styles.categoriesList}>
        {categories.map(category => (
          <div key={category.id} style={styles.categoryCard}>
            <div
              style={styles.categoryHeader}
              onClick={() => setExpandedCategories(prev => ({ ...prev, [category.id]: !prev[category.id] }))}
            >
              {expandedCategories[category.id] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              <h3 style={styles.categoryName}>{category.name}</h3>
              <span style={styles.itemCount}>{category.items?.length || 0} items</span>
              <button
                onClick={(e) => { e.stopPropagation(); setShowAddItem(category.id); }}
                style={styles.addItemBtn}
              >
                <Plus size={16} /> Add Item
              </button>
            </div>

            {expandedCategories[category.id] && (
              <div style={styles.itemsList}>
                {showAddItem === category.id && (
                  <div style={styles.addItemForm}>
                    <input
                      placeholder="Item name"
                      value={newItem.name}
                      onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                      style={styles.input}
                    />
                    <input
                      placeholder="Price"
                      type="number"
                      step="0.01"
                      value={newItem.price}
                      onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                      style={{ ...styles.input, width: '100px' }}
                    />
                    <button onClick={() => addItem(category.id)} style={styles.saveBtn}>Add</button>
                    <button onClick={() => setShowAddItem(null)} style={styles.cancelBtn}>Cancel</button>
                  </div>
                )}

                {(category.items || []).map(item => (
                  <div key={item.id} style={{ ...styles.itemRow, opacity: item.available ? 1 : 0.5 }}>
                    <GripVertical size={16} style={{ color: '#9ca3af', cursor: 'grab' }} />

                    {editingItem === item.id ? (
                      <div style={styles.editForm}>
                        <input
                          defaultValue={item.name}
                          style={styles.input}
                          id={\`edit-name-\${item.id}\`}
                        />
                        <input
                          defaultValue={item.price}
                          type="number"
                          step="0.01"
                          style={{ ...styles.input, width: '80px' }}
                          id={\`edit-price-\${item.id}\`}
                        />
                        <button
                          onClick={() => updateItem(item.id, {
                            name: document.getElementById(\`edit-name-\${item.id}\`).value,
                            price: parseFloat(document.getElementById(\`edit-price-\${item.id}\`).value)
                          })}
                          style={styles.saveBtn}
                        >
                          <Check size={14} />
                        </button>
                        <button onClick={() => setEditingItem(null)} style={styles.cancelBtn}>
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div style={styles.itemInfo}>
                          <span style={styles.itemName}>
                            {item.name}
                            {item.popular && <Star size={14} style={{ color: '#f59e0b', marginLeft: '6px' }} fill="#f59e0b" />}
                          </span>
                          <span style={styles.itemDesc}>{item.description}</span>
                        </div>
                        <span style={styles.itemPrice}>\${parseFloat(item.price).toFixed(2)}</span>
                        <div style={styles.itemActions}>
                          <button
                            onClick={() => toggleAvailability(item.id, !item.available)}
                            style={{ ...styles.iconBtn, color: item.available ? '#22c55e' : '#ef4444' }}
                            title={item.available ? 'Mark unavailable' : 'Mark available'}
                          >
                            {item.available ? <Eye size={16} /> : <EyeOff size={16} />}
                          </button>
                          <button onClick={() => setEditingItem(item.id)} style={styles.iconBtn} title="Edit">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => deleteItem(item.id)} style={{ ...styles.iconBtn, color: '#ef4444' }} title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {(!category.items || category.items.length === 0) && !showAddItem && (
                  <p style={styles.emptyCategory}>No items in this category</p>
                )}
              </div>
            )}
          </div>
        ))}

        {categories.length === 0 && (
          <div style={styles.emptyState}>
            <p>No menu categories yet</p>
            <button onClick={() => setShowAddCategory(true)} style={styles.addBtn}>
              <Plus size={18} /> Create your first category
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '900px' },
  demoBanner: {
    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    border: '1px solid #f59e0b',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '20px',
    fontSize: '14px',
    color: '#92400e'
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  title: { fontSize: '28px', fontWeight: '700', margin: 0 },
  subtitle: { color: '#6b7280', marginTop: '4px' },
  headerActions: { display: 'flex', gap: '12px' },
  refreshBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '10px 16px', background: '#fff', border: '1px solid #e5e7eb',
    borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
  },
  addBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '10px 16px', background: '${primaryColor}', color: '#fff',
    border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500'
  },
  error: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '12px 16px', background: '#fef2f2', color: '#dc2626',
    borderRadius: '8px', marginBottom: '16px'
  },
  dismissBtn: { marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' },
  addForm: { background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  input: {
    padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px',
    fontSize: '14px', marginRight: '8px', marginBottom: '8px'
  },
  formActions: { display: 'flex', gap: '8px', marginTop: '12px' },
  cancelBtn: {
    padding: '8px 16px', background: '#f3f4f6', border: 'none',
    borderRadius: '6px', cursor: 'pointer', fontSize: '14px'
  },
  saveBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '8px 16px', background: '${primaryColor}', color: '#fff',
    border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px'
  },
  categoriesList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  categoryCard: { background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  categoryHeader: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '16px 20px', cursor: 'pointer', background: '#f9fafb'
  },
  categoryName: { fontSize: '16px', fontWeight: '600', margin: 0, flex: 1 },
  itemCount: { fontSize: '13px', color: '#6b7280' },
  addItemBtn: {
    display: 'flex', alignItems: 'center', gap: '4px',
    padding: '6px 12px', background: '${primaryColor}20', color: '${primaryColor}',
    border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px'
  },
  itemsList: { padding: '8px 0' },
  addItemForm: { display: 'flex', alignItems: 'center', padding: '12px 20px', gap: '8px', background: '#fefce8' },
  itemRow: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px 20px', borderBottom: '1px solid #f3f4f6'
  },
  itemInfo: { flex: 1 },
  itemName: { display: 'flex', alignItems: 'center', fontWeight: '500' },
  itemDesc: { fontSize: '13px', color: '#6b7280' },
  itemPrice: { fontWeight: '600', color: '${primaryColor}' },
  itemActions: { display: 'flex', gap: '4px' },
  iconBtn: {
    padding: '6px', background: 'none', border: 'none',
    cursor: 'pointer', color: '#6b7280', borderRadius: '4px'
  },
  editForm: { display: 'flex', alignItems: 'center', flex: 1, gap: '8px' },
  emptyCategory: { padding: '20px', textAlign: 'center', color: '#9ca3af' },
  emptyState: { textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '12px' },
  loading: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', color: '#6b7280' }
};

// Add keyframes for spin animation
const styleSheet = document.createElement('style');
styleSheet.textContent = \`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }\`;
document.head.appendChild(styleSheet);
`;
}

function generateReservationsPage(businessName, primaryColor) {
  return `import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar, Clock, Users, Check, X, Bell, ChevronLeft, ChevronRight,
  RefreshCw, AlertCircle, Mail, Phone
} from 'lucide-react';

const API_BASE = '/api/reservations';

export default function Reservations() {
  const [view, setView] = useState('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reservations, setReservations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRes, setSelectedRes] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const getDateRange = useCallback(() => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);
    if (view === 'day') {
      // Just today
    } else if (view === 'week') {
      start.setDate(start.getDate() - start.getDay());
      end.setDate(start.getDate() + 6);
    } else {
      start.setDate(1);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
    }
    return { from: start.toISOString().split('T')[0], to: end.toISOString().split('T')[0] };
  }, [currentDate, view]);

  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      const { from, to } = getDateRange();
      const params = new URLSearchParams({ from, to });
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const res = await fetch(\`\${API_BASE}/admin/all?\${params}\`);
      const data = await res.json();
      if (data.success) setReservations(data.reservations);

      const statsRes = await fetch(\`\${API_BASE}/admin/stats\`);
      const statsData = await statsRes.json();
      if (statsData.success) setStats(statsData.stats);
    } catch (err) {
      console.error('Failed to fetch reservations:', err);
    } finally {
      setLoading(false);
    }
  }, [getDateRange, statusFilter]);

  useEffect(() => {
    fetchReservations();
    const eventSource = new EventSource(\`\${API_BASE}/events\`);
    eventSource.onmessage = () => fetchReservations();
    eventSource.onerror = () => eventSource.close();
    return () => eventSource.close();
  }, [fetchReservations]);

  const navigate = (dir) => {
    const newDate = new Date(currentDate);
    if (view === 'day') newDate.setDate(newDate.getDate() + dir);
    else if (view === 'week') newDate.setDate(newDate.getDate() + dir * 7);
    else newDate.setMonth(newDate.getMonth() + dir);
    setCurrentDate(newDate);
  };

  const confirmReservation = async (res) => {
    await fetch(\`\${API_BASE}/admin/\${res.id}/confirm\`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ send_notification: true })
    });
    setSelectedRes(null);
    fetchReservations();
  };

  const cancelReservation = async (res) => {
    const reason = prompt('Cancellation reason (optional):');
    await fetch(\`\${API_BASE}/admin/\${res.id}/cancel\`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, notify: true })
    });
    setSelectedRes(null);
    fetchReservations();
  };

  const sendReminder = async (res) => {
    alert('Reminder sent!'); // Note: reminder endpoint not implemented yet
  };

  const groupByDate = reservations.reduce((acc, r) => {
    if (!acc[r.date]) acc[r.date] = [];
    acc[r.date].push(r);
    return acc;
  }, {});

  const getDays = () => {
    const { from, to } = getDateRange();
    const days = [];
    const current = new Date(from);
    const end = new Date(to);
    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  const days = getDays();
  const today = new Date().toISOString().split('T')[0];

  const statusColors = {
    pending: { bg: '#fef3c7', text: '#92400e' },
    confirmed: { bg: '#dcfce7', text: '#166534' },
    cancelled: { bg: '#fee2e2', text: '#991b1b' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Reservations</h1>
          {stats && <p style={styles.subtitle}>{stats.needsAction} pending | {stats.today?.confirmed || 0} confirmed today</p>}
        </div>
        <div style={styles.controls}>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={styles.select}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <div style={styles.viewToggle}>
            {['day', 'week', 'month'].map(v => (
              <button key={v} onClick={() => setView(v)} style={{ ...styles.viewBtn, ...(view === v ? styles.viewBtnActive : {}) }}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <button onClick={fetchReservations} style={styles.refreshBtn}><RefreshCw size={18} /></button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div style={styles.statsRow}>
          <div style={{ ...styles.statCard, borderLeft: '4px solid #eab308' }}>
            <span style={styles.statValue}>{stats.needsAction}</span>
            <span style={styles.statLabel}>Needs Action</span>
          </div>
          <div style={{ ...styles.statCard, borderLeft: '4px solid #22c55e' }}>
            <span style={styles.statValue}>{stats.today?.confirmed || 0}</span>
            <span style={styles.statLabel}>Confirmed Today</span>
          </div>
          <div style={{ ...styles.statCard, borderLeft: '4px solid #3b82f6' }}>
            <span style={styles.statValue}>{stats.thisWeek?.total || 0}</span>
            <span style={styles.statLabel}>This Week</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div style={styles.navRow}>
        <div style={styles.navButtons}>
          <button onClick={() => navigate(-1)} style={styles.navBtn}><ChevronLeft size={20} /></button>
          <button onClick={() => navigate(1)} style={styles.navBtn}><ChevronRight size={20} /></button>
          <button onClick={() => setCurrentDate(new Date())} style={styles.todayBtn}>Today</button>
        </div>
        <h2 style={styles.dateTitle}>
          {view === 'month'
            ? currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            : view === 'week'
              ? \`\${days[0]?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - \${days[days.length-1]?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}\`
              : currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
          }
        </h2>
      </div>

      {/* Calendar */}
      {loading ? (
        <div style={styles.loading}><RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} /></div>
      ) : (
        <div style={{ ...styles.calendar, gridTemplateColumns: view === 'month' ? 'repeat(7, 1fr)' : view === 'week' ? 'repeat(7, 1fr)' : '1fr' }}>
          {view === 'month' && ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} style={styles.dayHeader}>{d}</div>
          ))}
          {days.map((day, idx) => {
            const dateStr = day.toISOString().split('T')[0];
            const dayRes = (groupByDate[dateStr] || []).sort((a, b) => a.time.localeCompare(b.time));
            const isToday = dateStr === today;

            return (
              <div key={idx} style={{ ...styles.dayCard, ...(isToday ? styles.todayCard : {}) }}>
                <div style={styles.dayLabel}>
                  <span style={styles.dayName}>{day.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                  <span style={{ ...styles.dayNum, ...(isToday ? { color: '${primaryColor}' } : {}) }}>{day.getDate()}</span>
                </div>
                <div style={styles.resList}>
                  {dayRes.slice(0, view === 'month' ? 3 : 10).map(r => (
                    <div
                      key={r.id}
                      onClick={() => setSelectedRes(r)}
                      style={{ ...styles.resCard, background: statusColors[r.status]?.bg }}
                    >
                      <span style={styles.resTime}>{r.time}</span>
                      <span style={styles.resName}>{r.customer_name}</span>
                      <span style={styles.resGuests}>{r.party_size}</span>
                    </div>
                  ))}
                  {dayRes.length > (view === 'month' ? 3 : 10) && (
                    <span style={styles.moreCount}>+{dayRes.length - (view === 'month' ? 3 : 10)} more</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedRes && (
        <div style={styles.modalOverlay} onClick={() => setSelectedRes(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={{ ...styles.modalHeader, background: statusColors[selectedRes.status]?.bg }}>
              <h3 style={styles.modalTitle}>{selectedRes.customer_name}</h3>
              <span style={{ ...styles.statusBadge, background: statusColors[selectedRes.status]?.bg, color: statusColors[selectedRes.status]?.text }}>
                {selectedRes.status}
              </span>
            </div>
            <div style={styles.modalBody}>
              <p style={styles.refCode}>{selectedRes.reference_code}</p>
              <div style={styles.detailGrid}>
                <div style={styles.detailItem}><Calendar size={18} /> {new Date(selectedRes.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                <div style={styles.detailItem}><Clock size={18} /> {selectedRes.time}</div>
                <div style={styles.detailItem}><Users size={18} /> {selectedRes.party_size} guests</div>
              </div>
              <div style={styles.contactInfo}>
                <div style={styles.detailItem}><Mail size={16} /> {selectedRes.customer_email}</div>
                {selectedRes.customer_phone && <div style={styles.detailItem}><Phone size={16} /> {selectedRes.customer_phone}</div>}
              </div>
              {selectedRes.special_requests && (
                <div style={styles.requests}>
                  <strong>Special Requests:</strong>
                  <p>{selectedRes.special_requests}</p>
                </div>
              )}
            </div>
            <div style={styles.modalActions}>
              {selectedRes.status === 'pending' && (
                <>
                  <button onClick={() => confirmReservation(selectedRes)} style={styles.confirmBtn}><Check size={16} /> Confirm</button>
                  <button onClick={() => cancelReservation(selectedRes)} style={styles.cancelActionBtn}><X size={16} /> Cancel</button>
                </>
              )}
              {selectedRes.status === 'confirmed' && (
                <button onClick={() => sendReminder(selectedRes)} style={styles.reminderBtn}><Bell size={16} /> Send Reminder</button>
              )}
              <button onClick={() => setSelectedRes(null)} style={styles.closeBtn}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '1200px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' },
  title: { fontSize: '28px', fontWeight: '700', margin: 0 },
  subtitle: { color: '#6b7280', marginTop: '4px' },
  controls: { display: 'flex', gap: '12px', alignItems: 'center' },
  select: { padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '14px' },
  viewToggle: { display: 'flex', background: '#f3f4f6', borderRadius: '8px', padding: '4px' },
  viewBtn: { padding: '6px 12px', border: 'none', background: 'transparent', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  viewBtnActive: { background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' },
  refreshBtn: { padding: '8px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard: { background: '#fff', padding: '16px 20px', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
  statValue: { fontSize: '24px', fontWeight: '700', display: 'block' },
  statLabel: { fontSize: '13px', color: '#6b7280' },
  navRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  navButtons: { display: 'flex', gap: '8px' },
  navBtn: { padding: '8px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer' },
  todayBtn: { padding: '8px 16px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  dateTitle: { fontSize: '18px', fontWeight: '600', margin: 0 },
  calendar: { display: 'grid', gap: '8px' },
  dayHeader: { textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280', padding: '8px' },
  dayCard: { background: '#fff', borderRadius: '8px', padding: '12px', minHeight: '120px' },
  todayCard: { border: '2px solid ${primaryColor}' },
  dayLabel: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' },
  dayName: { fontSize: '12px', color: '#6b7280' },
  dayNum: { fontSize: '16px', fontWeight: '600' },
  resList: { display: 'flex', flexDirection: 'column', gap: '4px' },
  resCard: { padding: '6px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', display: 'flex', gap: '6px', alignItems: 'center' },
  resTime: { fontWeight: '600', minWidth: '50px' },
  resName: { flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  resGuests: { color: '#6b7280' },
  moreCount: { fontSize: '11px', color: '#6b7280', textAlign: 'center' },
  loading: { display: 'flex', justifyContent: 'center', padding: '60px' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal: { background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '400px', overflow: 'hidden' },
  modalHeader: { padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: '18px', fontWeight: '600', margin: 0 },
  statusBadge: { padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '500', textTransform: 'capitalize' },
  modalBody: { padding: '20px' },
  refCode: { fontSize: '13px', color: '#6b7280', marginBottom: '16px' },
  detailGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' },
  detailItem: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#374151' },
  contactInfo: { padding: '12px 0', borderTop: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: '8px' },
  requests: { padding: '12px 0', borderTop: '1px solid #f3f4f6', fontSize: '14px' },
  modalActions: { display: 'flex', gap: '8px', padding: '16px 20px', borderTop: '1px solid #f3f4f6' },
  confirmBtn: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' },
  cancelActionBtn: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' },
  reminderBtn: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' },
  closeBtn: { padding: '10px 16px', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }
};
`;
}

function generateNotificationsPage(businessName, primaryColor) {
  return `import React, { useState } from 'react';
import { Bell, Mail, Phone, Send, CheckCircle, XCircle, Clock, X } from 'lucide-react';

const TEMPLATES = [
  { id: 'reservation_confirmation', name: 'Reservation Confirmation', icon: CheckCircle, color: '#22c55e' },
  { id: 'reservation_reminder', name: 'Reservation Reminder', icon: Bell, color: '#3b82f6' },
  { id: 'reservation_cancellation', name: 'Cancellation Notice', icon: XCircle, color: '#ef4444' },
  { id: 'custom', name: 'Custom Message', icon: Mail, color: '#8b5cf6' }
];

export default function Notifications() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [sending, setSending] = useState(false);
  const [recipient, setRecipient] = useState({ email: '', phone: '' });
  const [channels, setChannels] = useState(['email']);
  const [customMessage, setCustomMessage] = useState({ subject: '', body: '' });

  const [recentNotifications] = useState([
    { id: 1, template: 'reservation_confirmation', to: 'john@example.com', status: 'sent', time: '2 hours ago' },
    { id: 2, template: 'reservation_reminder', to: 'sarah@example.com', status: 'sent', time: '5 hours ago' },
    { id: 3, template: 'reservation_cancellation', to: 'mike@example.com', status: 'failed', time: '1 day ago' }
  ]);

  const handleSend = async () => {
    setSending(true);
    // Simulate sending
    await new Promise(r => setTimeout(r, 1000));
    setSending(false);
    setSelectedTemplate(null);
    setRecipient({ email: '', phone: '' });
    alert('Notification sent!');
  };

  const statusColors = {
    sent: { bg: '#dcfce7', color: '#166534', icon: CheckCircle },
    pending: { bg: '#fef3c7', color: '#92400e', icon: Clock },
    failed: { bg: '#fee2e2', color: '#991b1b', icon: XCircle }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Notifications</h1>
        <p style={styles.subtitle}>Send notifications to customers</p>
      </div>

      {/* Quick Send Templates */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Quick Send</h2>
        <div style={styles.templatesGrid}>
          {TEMPLATES.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setSelectedTemplate(t)} style={styles.templateCard}>
                <div style={{ ...styles.templateIcon, background: t.color + '20', color: t.color }}>
                  <Icon size={24} />
                </div>
                <span style={styles.templateName}>{t.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Notifications */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Recent Notifications</h2>
        <div style={styles.notificationsList}>
          {recentNotifications.map(n => {
            const status = statusColors[n.status];
            const StatusIcon = status.icon;
            return (
              <div key={n.id} style={{ ...styles.notificationItem, background: status.bg }}>
                <StatusIcon size={18} style={{ color: status.color }} />
                <div style={styles.notificationInfo}>
                  <p style={styles.notificationTemplate}>{n.template.replace(/_/g, ' ')}</p>
                  <p style={styles.notificationTo}>To: {n.to}</p>
                </div>
                <span style={styles.notificationTime}>{n.time}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Send Modal */}
      {selectedTemplate && (
        <div style={styles.modalOverlay} onClick={() => setSelectedTemplate(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={{ ...styles.templateIcon, background: selectedTemplate.color + '20', color: selectedTemplate.color }}>
                <selectedTemplate.icon size={20} />
              </div>
              <h3 style={styles.modalTitle}>{selectedTemplate.name}</h3>
              <button onClick={() => setSelectedTemplate(null)} style={styles.closeModalBtn}><X size={20} /></button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Recipient</label>
                <div style={styles.inputGroup}>
                  <Mail size={16} style={{ color: '#9ca3af' }} />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={recipient.email}
                    onChange={e => setRecipient({ ...recipient, email: e.target.value })}
                    style={styles.input}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <Phone size={16} style={{ color: '#9ca3af' }} />
                  <input
                    type="tel"
                    placeholder="Phone number (optional)"
                    value={recipient.phone}
                    onChange={e => setRecipient({ ...recipient, phone: e.target.value })}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Send via</label>
                <div style={styles.channelOptions}>
                  {['email', 'sms'].map(ch => (
                    <label key={ch} style={styles.channelOption}>
                      <input
                        type="checkbox"
                        checked={channels.includes(ch)}
                        onChange={e => {
                          if (e.target.checked) setChannels([...channels, ch]);
                          else setChannels(channels.filter(c => c !== ch));
                        }}
                      />
                      {ch === 'email' ? <Mail size={14} /> : <Phone size={14} />}
                      {ch.toUpperCase()}
                    </label>
                  ))}
                </div>
              </div>

              {selectedTemplate.id === 'custom' && (
                <>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Subject</label>
                    <input
                      placeholder="Email subject"
                      value={customMessage.subject}
                      onChange={e => setCustomMessage({ ...customMessage, subject: e.target.value })}
                      style={{ ...styles.input, width: '100%' }}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Message</label>
                    <textarea
                      placeholder="Your message..."
                      value={customMessage.body}
                      onChange={e => setCustomMessage({ ...customMessage, body: e.target.value })}
                      rows={4}
                      style={{ ...styles.input, width: '100%', resize: 'vertical' }}
                    />
                  </div>
                </>
              )}
            </div>

            <div style={styles.modalActions}>
              <button onClick={() => setSelectedTemplate(null)} style={styles.cancelBtn}>Cancel</button>
              <button onClick={handleSend} disabled={sending || !recipient.email} style={styles.sendBtn}>
                <Send size={16} /> {sending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '800px' },
  header: { marginBottom: '32px' },
  title: { fontSize: '28px', fontWeight: '700', margin: 0 },
  subtitle: { color: '#6b7280', marginTop: '4px' },
  section: { marginBottom: '32px' },
  sectionTitle: { fontSize: '16px', fontWeight: '600', marginBottom: '16px' },
  templatesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' },
  templateCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
    padding: '20px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px',
    cursor: 'pointer', transition: 'all 0.2s'
  },
  templateIcon: { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  templateName: { fontSize: '14px', fontWeight: '500', color: '#374151', textAlign: 'center' },
  notificationsList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  notificationItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px' },
  notificationInfo: { flex: 1 },
  notificationTemplate: { fontWeight: '500', margin: 0, textTransform: 'capitalize' },
  notificationTo: { fontSize: '13px', color: '#6b7280', margin: 0 },
  notificationTime: { fontSize: '12px', color: '#9ca3af' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' },
  modal: { background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '400px' },
  modalHeader: { display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderBottom: '1px solid #f3f4f6' },
  modalTitle: { flex: 1, fontSize: '16px', fontWeight: '600', margin: 0 },
  closeModalBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' },
  modalBody: { padding: '20px' },
  formGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '8px' },
  inputGroup: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '8px' },
  input: { flex: 1, border: 'none', outline: 'none', fontSize: '14px' },
  channelOptions: { display: 'flex', gap: '16px' },
  channelOption: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' },
  modalActions: { display: 'flex', gap: '8px', padding: '16px 20px', borderTop: '1px solid #f3f4f6' },
  cancelBtn: { flex: 1, padding: '10px', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  sendBtn: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    padding: '10px', background: '${primaryColor}', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500'
  }
};
`;
}

function generateAgentChatPage(businessName, primaryColor) {
  return `import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Bot, User, Loader, ChevronRight, Utensils, Calendar, PenTool, Headphones, BarChart3 } from 'lucide-react';

const API_BASE = '/api/admin';

const AGENT_ICONS = {
  'menu-manager': Utensils,
  'reservations': Calendar,
  'website-editor': PenTool,
  'support': Headphones,
  'analytics': BarChart3,
  'marketing': Bot
};

export default function AgentChat() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    async function fetchAgents() {
      try {
        const res = await fetch(\`\${API_BASE}/ai/agents\`);
        const data = await res.json();
        if (data.success) {
          setAgents(data.agents);
          if (agentId) {
            const agent = data.agents.find(a => a.id === agentId);
            if (agent) setSelectedAgent(agent);
          }
        }
      } catch (err) {
        console.error('Failed to fetch agents:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAgents();
  }, [agentId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectAgent = (agent) => {
    setSelectedAgent(agent);
    setMessages([]);
    navigate(\`/ai/\${agent.id}\`);
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedAgent) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSending(true);

    try {
      const res = await fetch(\`\${API_BASE}/ai/chat\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgent.id,
          message: input,
          conversationHistory: messages
        })
      });

      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);

        // Show action results if any
        if (data.actions?.executed > 0) {
          setMessages(prev => [...prev, {
            role: 'system',
            content: \`Executed \${data.actions.executed} action(s): \${data.actions.results.map(r => r.message || r.type).join(', ')}\`
          }]);
        }
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'error', content: 'Failed to get response' }]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return <div style={styles.loading}><Loader size={24} style={{ animation: 'spin 1s linear infinite' }} /></div>;
  }

  return (
    <div style={styles.container}>
      {/* Agent Selector */}
      <div style={styles.sidebar}>
        <h2 style={styles.sidebarTitle}>AI Agents</h2>
        <p style={styles.sidebarSub}>Select an agent to chat with</p>
        <div style={styles.agentsList}>
          {agents.map(agent => {
            const Icon = AGENT_ICONS[agent.id] || Bot;
            const isSelected = selectedAgent?.id === agent.id;
            return (
              <button
                key={agent.id}
                onClick={() => selectAgent(agent)}
                style={{ ...styles.agentCard, ...(isSelected ? styles.agentCardActive : {}) }}
              >
                <div style={{ ...styles.agentIcon, background: agent.color + '20', color: agent.color }}>
                  <Icon size={20} />
                </div>
                <div style={styles.agentInfo}>
                  <span style={styles.agentName}>{agent.name}</span>
                  <span style={styles.agentRole}>{agent.role}</span>
                </div>
                <ChevronRight size={16} style={{ color: '#9ca3af' }} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div style={styles.chatArea}>
        {selectedAgent ? (
          <>
            <div style={styles.chatHeader}>
              <div style={{ ...styles.agentIcon, background: selectedAgent.color + '20', color: selectedAgent.color }}>
                {React.createElement(AGENT_ICONS[selectedAgent.id] || Bot, { size: 20 })}
              </div>
              <div>
                <h3 style={styles.chatTitle}>{selectedAgent.name}</h3>
                <p style={styles.chatSub}>{selectedAgent.role}</p>
              </div>
            </div>

            <div style={styles.messagesContainer}>
              {messages.length === 0 && (
                <div style={styles.welcome}>
                  <p>Chat with {selectedAgent.name} to manage your {selectedAgent.capabilities?.join(', ') || 'business'}.</p>
                  <p style={styles.welcomeHint}>Try: "Show me today's menu" or "What reservations do we have?"</p>
                </div>
              )}
              {messages.map((msg, idx) => (
                <div key={idx} style={{
                  ...styles.message,
                  ...(msg.role === 'user' ? styles.userMessage : msg.role === 'system' ? styles.systemMessage : styles.assistantMessage)
                }}>
                  {msg.role === 'assistant' && (
                    <div style={{ ...styles.msgIcon, background: selectedAgent.color + '20', color: selectedAgent.color }}>
                      <Bot size={16} />
                    </div>
                  )}
                  {msg.role === 'user' && (
                    <div style={{ ...styles.msgIcon, background: '#e5e7eb' }}>
                      <User size={16} />
                    </div>
                  )}
                  <div style={styles.msgContent}>
                    <pre style={styles.msgText}>{msg.content}</pre>
                  </div>
                </div>
              ))}
              {sending && (
                <div style={styles.typing}>
                  <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>{selectedAgent.name} is thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div style={styles.inputArea}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={\`Message \${selectedAgent.name}...\`}
                style={styles.input}
                rows={1}
              />
              <button onClick={sendMessage} disabled={sending || !input.trim()} style={styles.sendBtn}>
                <Send size={18} />
              </button>
            </div>
          </>
        ) : (
          <div style={styles.noAgent}>
            <Bot size={48} style={{ color: '#d1d5db' }} />
            <p>Select an agent to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', gap: '24px', height: 'calc(100vh - 48px)' },
  sidebar: { width: '280px', flexShrink: 0 },
  sidebarTitle: { fontSize: '18px', fontWeight: '600', margin: 0 },
  sidebarSub: { color: '#6b7280', fontSize: '13px', marginTop: '4px', marginBottom: '16px' },
  agentsList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  agentCard: {
    display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
    padding: '12px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
    cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
  },
  agentCardActive: { borderColor: '${primaryColor}', background: '${primaryColor}08' },
  agentIcon: { width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  agentInfo: { flex: 1 },
  agentName: { display: 'block', fontWeight: '500', fontSize: '14px' },
  agentRole: { display: 'block', fontSize: '12px', color: '#6b7280' },
  chatArea: { flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: '12px', overflow: 'hidden' },
  chatHeader: { display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderBottom: '1px solid #f3f4f6' },
  chatTitle: { fontSize: '16px', fontWeight: '600', margin: 0 },
  chatSub: { fontSize: '13px', color: '#6b7280', margin: 0 },
  messagesContainer: { flex: 1, overflow: 'auto', padding: '20px' },
  welcome: { textAlign: 'center', color: '#6b7280', padding: '40px 20px' },
  welcomeHint: { fontSize: '13px', color: '#9ca3af', marginTop: '8px' },
  message: { display: 'flex', gap: '12px', marginBottom: '16px' },
  userMessage: { flexDirection: 'row-reverse' },
  assistantMessage: {},
  systemMessage: { justifyContent: 'center' },
  msgIcon: { width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  msgContent: { maxWidth: '70%' },
  msgText: { margin: 0, padding: '12px 16px', borderRadius: '12px', background: '#f3f4f6', fontSize: '14px', whiteSpace: 'pre-wrap', fontFamily: 'inherit' },
  typing: { display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '13px' },
  inputArea: { display: 'flex', gap: '12px', padding: '16px 20px', borderTop: '1px solid #f3f4f6' },
  input: {
    flex: 1, padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: '10px',
    fontSize: '14px', resize: 'none', outline: 'none', fontFamily: 'inherit'
  },
  sendBtn: {
    width: '44px', height: '44px', background: '${primaryColor}', color: '#fff',
    border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  noAgent: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }
};
`;
}

function generateSettingsPage(businessName, primaryColor) {
  return `import React, { useState } from 'react';
import { Save, Building, Clock, Globe, Bell, Palette } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState({
    businessName: '${businessName}',
    phone: '(555) 123-4567',
    email: 'hello@example.com',
    address: '123 Main St',
    hours: {
      monday: '9:00 AM - 9:00 PM',
      tuesday: '9:00 AM - 9:00 PM',
      wednesday: '9:00 AM - 9:00 PM',
      thursday: '9:00 AM - 9:00 PM',
      friday: '9:00 AM - 10:00 PM',
      saturday: '10:00 AM - 10:00 PM',
      sunday: '10:00 AM - 8:00 PM'
    },
    notifications: {
      emailOnReservation: true,
      smsOnReservation: false,
      dailySummary: true
    }
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // In production, this would save to API
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Settings</h1>
        <button onClick={handleSave} style={styles.saveBtn}>
          <Save size={18} /> {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Business Info */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <Building size={20} />
          <h2 style={styles.sectionTitle}>Business Information</h2>
        </div>
        <div style={styles.grid}>
          <div style={styles.field}>
            <label style={styles.label}>Business Name</label>
            <input
              value={settings.businessName}
              onChange={e => setSettings({ ...settings, businessName: e.target.value })}
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Phone</label>
            <input
              value={settings.phone}
              onChange={e => setSettings({ ...settings, phone: e.target.value })}
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={settings.email}
              onChange={e => setSettings({ ...settings, email: e.target.value })}
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Address</label>
            <input
              value={settings.address}
              onChange={e => setSettings({ ...settings, address: e.target.value })}
              style={styles.input}
            />
          </div>
        </div>
      </div>

      {/* Hours */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <Clock size={20} />
          <h2 style={styles.sectionTitle}>Business Hours</h2>
        </div>
        <div style={styles.hoursGrid}>
          {Object.entries(settings.hours).map(([day, hours]) => (
            <div key={day} style={styles.hourRow}>
              <span style={styles.dayLabel}>{day.charAt(0).toUpperCase() + day.slice(1)}</span>
              <input
                value={hours}
                onChange={e => setSettings({
                  ...settings,
                  hours: { ...settings.hours, [day]: e.target.value }
                })}
                style={styles.hourInput}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <Bell size={20} />
          <h2 style={styles.sectionTitle}>Notifications</h2>
        </div>
        <div style={styles.toggleList}>
          <label style={styles.toggle}>
            <input
              type="checkbox"
              checked={settings.notifications.emailOnReservation}
              onChange={e => setSettings({
                ...settings,
                notifications: { ...settings.notifications, emailOnReservation: e.target.checked }
              })}
            />
            <span>Email me on new reservations</span>
          </label>
          <label style={styles.toggle}>
            <input
              type="checkbox"
              checked={settings.notifications.smsOnReservation}
              onChange={e => setSettings({
                ...settings,
                notifications: { ...settings.notifications, smsOnReservation: e.target.checked }
              })}
            />
            <span>SMS alerts for reservations</span>
          </label>
          <label style={styles.toggle}>
            <input
              type="checkbox"
              checked={settings.notifications.dailySummary}
              onChange={e => setSettings({
                ...settings,
                notifications: { ...settings.notifications, dailySummary: e.target.checked }
              })}
            />
            <span>Daily summary email</span>
          </label>
        </div>
      </div>

      {/* Theme */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <Palette size={20} />
          <h2 style={styles.sectionTitle}>Theme</h2>
        </div>
        <p style={styles.themeNote}>Primary color: <span style={{ color: '${primaryColor}', fontWeight: '600' }}>${primaryColor}</span></p>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '700px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' },
  title: { fontSize: '28px', fontWeight: '700', margin: 0 },
  saveBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '10px 20px', background: '${primaryColor}', color: '#fff',
    border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500'
  },
  section: { background: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: '#374151' },
  sectionTitle: { fontSize: '16px', fontWeight: '600', margin: 0 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' },
  field: {},
  label: { display: 'block', fontSize: '13px', fontWeight: '500', color: '#6b7280', marginBottom: '6px' },
  input: {
    width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px',
    fontSize: '14px', outline: 'none'
  },
  hoursGrid: { display: 'flex', flexDirection: 'column', gap: '10px' },
  hourRow: { display: 'flex', alignItems: 'center', gap: '16px' },
  dayLabel: { width: '100px', fontSize: '14px', fontWeight: '500' },
  hourInput: { flex: 1, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' },
  toggleList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  toggle: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px' },
  themeNote: { fontSize: '14px', color: '#6b7280' }
};
`;
}

// ============================================
// INDUSTRY-AWARE PAGE GENERATORS
// ============================================

/**
 * Generate Catalog Editor Page (Menu, Services, Classes, Features, Products, Programs)
 */
function generateCatalogEditorPage(moduleName, labelConfig, primaryColor) {
  const { label, singular, plural } = labelConfig;

  return `import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, GripVertical, Eye, EyeOff, Save, X, ChevronDown, ChevronUp } from 'lucide-react';

const API_BASE = '/api/${moduleName}';

export default function ${capitalize(moduleName)}Page() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [newItemForm, setNewItemForm] = useState({ category_id: null, name: '', price: '', description: '' });
  const [showNewItemForm, setShowNewItemForm] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    fetchData();
    const cleanup = setupSSE();
    return cleanup;
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(\`\${API_BASE}/admin\`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCategories(data.categories || []);
          const expanded = {};
          (data.categories || []).forEach(cat => expanded[cat.id] = true);
          setExpandedCategories(expanded);
        }
      }
    } catch (err) {
      console.error('Failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  };

  const setupSSE = () => {
    const eventSource = new EventSource(\`\${API_BASE}/events\`);
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'initial_state') {
        setCategories(data.categories || []);
      } else if (['item_added', 'item_updated', 'item_deleted', 'category_added', 'reordered'].includes(data.type)) {
        fetchData();
      }
    };
    return () => eventSource.close();
  };

  const toggleAvailability = async (itemId, available) => {
    try {
      await fetch(\`\${API_BASE}/admin/item/\${itemId}/availability\`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: !available })
      });
    } catch (err) {
      console.error('Failed to toggle:', err);
    }
  };

  const saveItem = async (item) => {
    try {
      await fetch(\`\${API_BASE}/admin/item/\${item.id}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      setEditingItem(null);
    } catch (err) {
      console.error('Failed to save:', err);
    }
  };

  const deleteItem = async (itemId) => {
    if (!confirm('Delete this ${singular.toLowerCase()}?')) return;
    try {
      await fetch(\`\${API_BASE}/admin/item/\${itemId}\`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const addItem = async () => {
    if (!newItemForm.name || !newItemForm.category_id) return;
    try {
      await fetch(\`\${API_BASE}/admin/item\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItemForm)
      });
      setNewItemForm({ category_id: null, name: '', price: '', description: '' });
      setShowNewItemForm(false);
    } catch (err) {
      console.error('Failed to add:', err);
    }
  };

  const toggleCategory = (catId) => {
    setExpandedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  if (loading) return <div style={styles.loading}>Loading ${label.toLowerCase()}...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>${label} Editor</h1>
          <p style={styles.subtitle}>Manage your ${plural.toLowerCase()} and categories</p>
        </div>
        <button onClick={() => setShowNewItemForm(true)} style={styles.addBtn}>
          <Plus size={18} /> Add ${singular}
        </button>
      </div>

      {showNewItemForm && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3>Add New ${singular}</h3>
              <button onClick={() => setShowNewItemForm(false)} style={styles.closeBtn}><X size={20} /></button>
            </div>
            <div style={styles.form}>
              <select value={newItemForm.category_id || ''} onChange={e => setNewItemForm({ ...newItemForm, category_id: parseInt(e.target.value) })} style={styles.input}>
                <option value="">Select Category</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
              <input placeholder="${singular} Name" value={newItemForm.name} onChange={e => setNewItemForm({ ...newItemForm, name: e.target.value })} style={styles.input} />
              <input placeholder="Price" type="number" step="0.01" value={newItemForm.price} onChange={e => setNewItemForm({ ...newItemForm, price: e.target.value })} style={styles.input} />
              <textarea placeholder="Description" value={newItemForm.description} onChange={e => setNewItemForm({ ...newItemForm, description: e.target.value })} style={{ ...styles.input, minHeight: '80px' }} />
              <button onClick={addItem} style={styles.saveBtn}><Save size={16} /> Add ${singular}</button>
            </div>
          </div>
        </div>
      )}

      {categories.map(category => (
        <div key={category.id} style={styles.category}>
          <div style={styles.categoryHeader} onClick={() => toggleCategory(category.id)}>
            <div style={styles.categoryInfo}>
              <GripVertical size={16} style={{ color: '#9ca3af', cursor: 'grab' }} />
              <h2 style={styles.categoryTitle}>{category.name}</h2>
              <span style={styles.categoryCount}>{category.items?.length || 0} ${plural.toLowerCase()}</span>
            </div>
            {expandedCategories[category.id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>

          {expandedCategories[category.id] && (
            <div style={styles.items}>
              {(category.items || []).map(item => (
                <div key={item.id} style={{ ...styles.item, opacity: item.available ? 1 : 0.5 }}>
                  {editingItem?.id === item.id ? (
                    <div style={styles.editForm}>
                      <input value={editingItem.name} onChange={e => setEditingItem({ ...editingItem, name: e.target.value })} style={styles.editInput} />
                      <input value={editingItem.price || ''} onChange={e => setEditingItem({ ...editingItem, price: e.target.value })} style={{ ...styles.editInput, width: '100px' }} type="number" step="0.01" />
                      <button onClick={() => saveItem(editingItem)} style={styles.iconBtn}><Save size={16} /></button>
                      <button onClick={() => setEditingItem(null)} style={styles.iconBtn}><X size={16} /></button>
                    </div>
                  ) : (
                    <>
                      <div style={styles.itemInfo}>
                        <GripVertical size={14} style={{ color: '#d1d5db', cursor: 'grab' }} />
                        <span style={styles.itemName}>{item.name}</span>
                        {item.price && <span style={styles.itemPrice}>\${parseFloat(item.price).toFixed(2)}</span>}
                      </div>
                      <div style={styles.itemActions}>
                        <button onClick={() => toggleAvailability(item.id, item.available)} style={styles.iconBtn} title={item.available ? 'Hide' : 'Show'}>
                          {item.available ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <button onClick={() => setEditingItem({ ...item })} style={styles.iconBtn}><Edit2 size={16} /></button>
                        <button onClick={() => deleteItem(item.id)} style={{ ...styles.iconBtn, color: '#ef4444' }}><Trash2 size={16} /></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {(!category.items || category.items.length === 0) && <p style={styles.emptyMsg}>No ${plural.toLowerCase()} in this category</p>}
            </div>
          )}
        </div>
      ))}

      {categories.length === 0 && <div style={styles.emptyState}><p>No categories yet. Add your first category to get started.</p></div>}
    </div>
  );
}

const styles = {
  container: { padding: '0' },
  loading: { padding: '40px', textAlign: 'center', color: '#6b7280' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  title: { fontSize: '24px', fontWeight: '700', margin: 0, color: '#111827' },
  subtitle: { fontSize: '14px', color: '#6b7280', marginTop: '4px' },
  addBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', background: '${primaryColor}', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  category: { background: '#fff', borderRadius: '12px', marginBottom: '16px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  categoryHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' },
  categoryInfo: { display: 'flex', alignItems: 'center', gap: '12px' },
  categoryTitle: { fontSize: '16px', fontWeight: '600', margin: 0 },
  categoryCount: { fontSize: '13px', color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: '12px' },
  items: { padding: '8px' },
  item: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: '8px', transition: 'background 0.15s' },
  itemInfo: { display: 'flex', alignItems: 'center', gap: '12px' },
  itemName: { fontWeight: '500' },
  itemPrice: { color: '#6b7280', fontSize: '14px' },
  itemActions: { display: 'flex', gap: '4px' },
  iconBtn: { padding: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', borderRadius: '4px' },
  editForm: { display: 'flex', gap: '8px', alignItems: 'center', flex: 1 },
  editInput: { padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' },
  modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '480px', padding: '24px' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  input: { padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' },
  saveBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px', background: '${primaryColor}', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  emptyMsg: { padding: '20px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' },
  emptyState: { padding: '60px 20px', textAlign: 'center', color: '#6b7280', background: '#fff', borderRadius: '12px' }
};
`;
}

/**
 * Generate Booking Calendar Page (Reservations, Appointments, Consultations, Bookings, Demos)
 */
function generateBookingCalendarPage(moduleName, labelConfig, primaryColor) {
  const { label, singular, plural } = labelConfig;

  return `import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, Mail, CheckCircle, XCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const API_BASE = '/api/${moduleName}';

export default function ${capitalize(moduleName)}Page() {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ today: { total: 0, confirmed: 0, pending: 0 }, thisWeek: { total: 0 }, needsAction: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
    fetchStats();
    const cleanup = setupSSE();
    return cleanup;
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      const res = await fetch(\`\${API_BASE}/admin/all?date=\${selectedDate}\`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) setBookings(data.${moduleName} || []);
      }
    } catch (err) {
      console.error('Failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(\`\${API_BASE}/admin/stats\`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const setupSSE = () => {
    const eventSource = new EventSource(\`\${API_BASE}/events\`);
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (['new_booking', 'booking_confirmed', 'booking_cancelled', 'booking_updated'].includes(data.type)) {
        fetchData();
        fetchStats();
      }
    };
    return () => eventSource.close();
  };

  const confirmBooking = async (id) => {
    try { await fetch(\`\${API_BASE}/admin/\${id}/confirm\`, { method: 'PUT' }); } catch (err) { console.error('Failed to confirm:', err); }
  };

  const cancelBooking = async (id) => {
    if (!confirm('Cancel this ${singular.toLowerCase()}?')) return;
    try { await fetch(\`\${API_BASE}/admin/\${id}/cancel\`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: 'Cancelled by admin' }) }); } catch (err) { console.error('Failed to cancel:', err); }
  };

  const changeDate = (days) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const filteredBookings = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);
  const statusColors = { confirmed: { bg: '#dcfce7', text: '#16a34a' }, pending: { bg: '#fef3c7', text: '#d97706' }, cancelled: { bg: '#fee2e2', text: '#dc2626' } };

  if (loading) return <div style={styles.loading}>Loading ${label.toLowerCase()}...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>${label}</h1>
          <p style={styles.subtitle}>Manage your ${plural.toLowerCase()} and schedule</p>
        </div>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}><div style={{ ...styles.statIcon, background: '${primaryColor}20', color: '${primaryColor}' }}><Calendar size={20} /></div><div><div style={styles.statValue}>{stats.today?.total || 0}</div><div style={styles.statLabel}>Today</div></div></div>
        <div style={styles.statCard}><div style={{ ...styles.statIcon, background: '#fef3c720', color: '#d97706' }}><AlertCircle size={20} /></div><div><div style={styles.statValue}>{stats.needsAction || 0}</div><div style={styles.statLabel}>Needs Action</div></div></div>
        <div style={styles.statCard}><div style={{ ...styles.statIcon, background: '#dcfce720', color: '#16a34a' }}><CheckCircle size={20} /></div><div><div style={styles.statValue}>{stats.today?.confirmed || 0}</div><div style={styles.statLabel}>Confirmed</div></div></div>
        <div style={styles.statCard}><div style={{ ...styles.statIcon, background: '#ede9fe20', color: '#7c3aed' }}><Clock size={20} /></div><div><div style={styles.statValue}>{stats.thisWeek?.total || 0}</div><div style={styles.statLabel}>This Week</div></div></div>
      </div>

      <div style={styles.controls}>
        <div style={styles.dateNav}>
          <button onClick={() => changeDate(-1)} style={styles.navBtn}><ChevronLeft size={20} /></button>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={styles.dateInput} />
          <button onClick={() => changeDate(1)} style={styles.navBtn}><ChevronRight size={20} /></button>
        </div>
        <div style={styles.filters}>
          {['all', 'pending', 'confirmed', 'cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ ...styles.filterBtn, ...(filter === f ? styles.filterBtnActive : {}) }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
          ))}
        </div>
      </div>

      <div style={styles.bookingsList}>
        {filteredBookings.length === 0 ? (
          <div style={styles.emptyState}><Calendar size={48} style={{ color: '#d1d5db', marginBottom: '16px' }} /><p>No ${plural.toLowerCase()} for this date</p></div>
        ) : (
          filteredBookings.map(booking => {
            const statusStyle = statusColors[booking.status] || statusColors.pending;
            return (
              <div key={booking.id} style={styles.bookingCard}>
                <div style={styles.bookingTime}><Clock size={16} /><span>{booking.time}</span></div>
                <div style={styles.bookingInfo}>
                  <div style={styles.customerName}><User size={16} /> {booking.customer_name}</div>
                  <div style={styles.bookingDetails}>
                    {booking.customer_email && <span><Mail size={14} /> {booking.customer_email}</span>}
                    {booking.customer_phone && <span><Phone size={14} /> {booking.customer_phone}</span>}
                  </div>
                  {booking.notes && <div style={styles.notes}>{booking.notes}</div>}
                </div>
                <div style={styles.bookingActions}>
                  <span style={{ ...styles.statusBadge, background: statusStyle.bg, color: statusStyle.text }}>{booking.status}</span>
                  {booking.status === 'pending' && (
                    <>
                      <button onClick={() => confirmBooking(booking.id)} style={{ ...styles.actionBtn, color: '#16a34a' }}><CheckCircle size={18} /></button>
                      <button onClick={() => cancelBooking(booking.id)} style={{ ...styles.actionBtn, color: '#dc2626' }}><XCircle size={18} /></button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '0' },
  loading: { padding: '40px', textAlign: 'center', color: '#6b7280' },
  header: { marginBottom: '24px' },
  title: { fontSize: '24px', fontWeight: '700', margin: 0, color: '#111827' },
  subtitle: { fontSize: '14px', color: '#6b7280', marginTop: '4px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard: { background: '#fff', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  statIcon: { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: '24px', fontWeight: '700', color: '#111827' },
  statLabel: { fontSize: '13px', color: '#6b7280' },
  controls: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  dateNav: { display: 'flex', alignItems: 'center', gap: '8px' },
  navBtn: { padding: '8px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer' },
  dateInput: { padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' },
  filters: { display: 'flex', gap: '8px' },
  filterBtn: { padding: '8px 16px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
  filterBtnActive: { background: '${primaryColor}', color: '#fff', borderColor: '${primaryColor}' },
  bookingsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  bookingCard: { background: '#fff', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  bookingTime: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '16px', fontWeight: '600', color: '${primaryColor}', minWidth: '80px' },
  bookingInfo: { flex: 1 },
  customerName: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '500', marginBottom: '4px' },
  bookingDetails: { display: 'flex', gap: '16px', fontSize: '13px', color: '#6b7280' },
  notes: { fontSize: '13px', color: '#6b7280', marginTop: '6px', fontStyle: 'italic' },
  bookingActions: { display: 'flex', alignItems: 'center', gap: '8px' },
  statusBadge: { padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '500', textTransform: 'capitalize' },
  actionBtn: { padding: '6px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '6px' },
  emptyState: { padding: '60px 20px', textAlign: 'center', color: '#6b7280', background: '#fff', borderRadius: '12px' }
};
`;
}

/**
 * Generate Listings Manager Page (Real Estate Listings)
 */
function generateListingsManagerPage(moduleName, labelConfig, primaryColor) {
  const { label, singular, plural } = labelConfig;

  return `import React, { useState, useEffect } from 'react';
import { Home, DollarSign, Bed, Bath, Square, Plus, Trash2, MapPin } from 'lucide-react';

const API_BASE = '/api/${moduleName}';

export default function ${capitalize(moduleName)}Page() {
  const [listings, setListings] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, sold: 0, avgPrice: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
    fetchStats();
    const cleanup = setupSSE();
    return cleanup;
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(\`\${API_BASE}/admin\`);
      if (res.ok) { const data = await res.json(); if (data.success) setListings(data.${moduleName} || []); }
    } catch (err) { console.error('Failed to fetch:', err); } finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(\`\${API_BASE}/admin/stats\`);
      if (res.ok) { const data = await res.json(); if (data.success) setStats(data.stats); }
    } catch (err) { console.error('Failed to fetch stats:', err); }
  };

  const setupSSE = () => {
    const eventSource = new EventSource(\`\${API_BASE}/events\`);
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (['listing_added', 'listing_updated', 'listing_deleted', 'listing_status_changed'].includes(data.type)) { fetchData(); fetchStats(); }
    };
    return () => eventSource.close();
  };

  const updateStatus = async (id, status) => {
    try { await fetch(\`\${API_BASE}/admin/\${id}/status\`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }); } catch (err) { console.error('Failed to update status:', err); }
  };

  const deleteListing = async (id) => {
    if (!confirm('Delete this ${singular.toLowerCase()}?')) return;
    try { await fetch(\`\${API_BASE}/admin/\${id}\`, { method: 'DELETE' }); } catch (err) { console.error('Failed to delete:', err); }
  };

  const filteredListings = filter === 'all' ? listings : listings.filter(l => l.status === filter);
  const statusColors = { active: { bg: '#dcfce7', text: '#16a34a' }, pending: { bg: '#fef3c7', text: '#d97706' }, sold: { bg: '#dbeafe', text: '#2563eb' }, 'off-market': { bg: '#f3f4f6', text: '#6b7280' } };
  const formatPrice = (price) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);

  if (loading) return <div style={styles.loading}>Loading ${label.toLowerCase()}...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div><h1 style={styles.title}>${label}</h1><p style={styles.subtitle}>Manage your property ${plural.toLowerCase()}</p></div>
        <button style={styles.addBtn}><Plus size={18} /> Add ${singular}</button>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}><Home size={20} style={{ color: '${primaryColor}' }} /><div style={styles.statValue}>{stats.active}</div><div style={styles.statLabel}>Active</div></div>
        <div style={styles.statCard}><DollarSign size={20} style={{ color: '#16a34a' }} /><div style={styles.statValue}>{formatPrice(stats.avgPrice)}</div><div style={styles.statLabel}>Avg Price</div></div>
        <div style={styles.statCard}><Home size={20} style={{ color: '#d97706' }} /><div style={styles.statValue}>{stats.pending}</div><div style={styles.statLabel}>Pending</div></div>
        <div style={styles.statCard}><Home size={20} style={{ color: '#2563eb' }} /><div style={styles.statValue}>{stats.sold}</div><div style={styles.statLabel}>Sold</div></div>
      </div>

      <div style={styles.filters}>
        {['all', 'active', 'pending', 'sold', 'off-market'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ ...styles.filterBtn, ...(filter === f ? styles.filterBtnActive : {}) }}>{f === 'off-market' ? 'Off Market' : f.charAt(0).toUpperCase() + f.slice(1)}</button>
        ))}
      </div>

      <div style={styles.listingsGrid}>
        {filteredListings.map(listing => {
          const statusStyle = statusColors[listing.status] || statusColors.active;
          return (
            <div key={listing.id} style={styles.listingCard}>
              <div style={styles.listingHeader}>
                <span style={{ ...styles.statusBadge, background: statusStyle.bg, color: statusStyle.text }}>{listing.status}</span>
                <button onClick={() => deleteListing(listing.id)} style={styles.iconBtn}><Trash2 size={16} /></button>
              </div>
              <div style={styles.listingPrice}>{formatPrice(listing.price)}</div>
              <div style={styles.listingAddress}><MapPin size={14} /> {listing.address}</div>
              <div style={styles.listingCity}>{listing.city}</div>
              <div style={styles.listingSpecs}>
                <span><Bed size={14} /> {listing.beds} beds</span>
                <span><Bath size={14} /> {listing.baths} baths</span>
                <span><Square size={14} /> {listing.sqft?.toLocaleString()} sqft</span>
              </div>
              <select value={listing.status} onChange={e => updateStatus(listing.id, e.target.value)} style={styles.statusSelect}>
                <option value="active">Active</option><option value="pending">Pending</option><option value="sold">Sold</option><option value="off-market">Off Market</option>
              </select>
            </div>
          );
        })}
      </div>

      {filteredListings.length === 0 && <div style={styles.emptyState}><Home size={48} style={{ color: '#d1d5db', marginBottom: '16px' }} /><p>No ${plural.toLowerCase()} found</p></div>}
    </div>
  );
}

const styles = {
  container: { padding: '0' },
  loading: { padding: '40px', textAlign: 'center', color: '#6b7280' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  title: { fontSize: '24px', fontWeight: '700', margin: 0, color: '#111827' },
  subtitle: { fontSize: '14px', color: '#6b7280', marginTop: '4px' },
  addBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', background: '${primaryColor}', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard: { background: '#fff', borderRadius: '12px', padding: '20px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  statValue: { fontSize: '20px', fontWeight: '700', color: '#111827', margin: '8px 0 4px' },
  statLabel: { fontSize: '13px', color: '#6b7280' },
  filters: { display: 'flex', gap: '8px', marginBottom: '20px' },
  filterBtn: { padding: '8px 16px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
  filterBtnActive: { background: '${primaryColor}', color: '#fff', borderColor: '${primaryColor}' },
  listingsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  listingCard: { background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  listingHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  statusBadge: { padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '500', textTransform: 'capitalize' },
  iconBtn: { padding: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' },
  listingPrice: { fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '8px' },
  listingAddress: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '500' },
  listingCity: { fontSize: '13px', color: '#6b7280', marginBottom: '12px' },
  listingSpecs: { display: 'flex', gap: '16px', fontSize: '13px', color: '#6b7280', marginBottom: '12px' },
  statusSelect: { width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px' },
  emptyState: { padding: '60px 20px', textAlign: 'center', color: '#6b7280', background: '#fff', borderRadius: '12px' }
};
`;
}

/**
 * Generate Inquiries Manager Page (Orders, Quotes, Memberships, Enrollments, Inquiries)
 */
function generateInquiriesManagerPage(moduleName, labelConfig, primaryColor) {
  const { label, singular, plural } = labelConfig;

  return `import React, { useState, useEffect } from 'react';
import { Mail, Phone, User, Clock, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';

const API_BASE = '/api/${moduleName}';
const STATUS_PIPELINE = ['new', 'contacted', 'qualified', 'converted', 'archived'];

export default function ${capitalize(moduleName)}Page() {
  const [inquiries, setInquiries] = useState([]);
  const [stats, setStats] = useState({ total: 0, new: 0, highPriority: 0, converted: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [respondingTo, setRespondingTo] = useState(null);
  const [response, setResponse] = useState('');

  useEffect(() => {
    fetchData();
    fetchStats();
    const cleanup = setupSSE();
    return cleanup;
  }, []);

  const fetchData = async () => {
    try { const res = await fetch(\`\${API_BASE}/admin/all\`); if (res.ok) { const data = await res.json(); if (data.success) setInquiries(data.${moduleName} || []); } } catch (err) { console.error('Failed to fetch:', err); } finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try { const res = await fetch(\`\${API_BASE}/admin/stats\`); if (res.ok) { const data = await res.json(); if (data.success) setStats(data.stats); } } catch (err) { console.error('Failed to fetch stats:', err); }
  };

  const setupSSE = () => {
    const eventSource = new EventSource(\`\${API_BASE}/events\`);
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (['new_inquiry', 'inquiry_updated', 'inquiry_status_changed', 'inquiry_responded'].includes(data.type)) { fetchData(); fetchStats(); }
    };
    return () => eventSource.close();
  };

  const updateStatus = async (id, status) => {
    try { await fetch(\`\${API_BASE}/admin/\${id}/status\`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }); } catch (err) { console.error('Failed to update status:', err); }
  };

  const sendResponse = async (id) => {
    if (!response.trim()) return;
    try { await fetch(\`\${API_BASE}/admin/\${id}/respond\`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ response }) }); setRespondingTo(null); setResponse(''); } catch (err) { console.error('Failed to respond:', err); }
  };

  const filteredInquiries = filter === 'all' ? inquiries : inquiries.filter(i => i.status === filter);
  const statusColors = { new: { bg: '#dbeafe', text: '#2563eb' }, contacted: { bg: '#fef3c7', text: '#d97706' }, qualified: { bg: '#ede9fe', text: '#7c3aed' }, converted: { bg: '#dcfce7', text: '#16a34a' }, archived: { bg: '#f3f4f6', text: '#6b7280' } };
  const priorityColors = { high: { bg: '#fee2e2', text: '#dc2626' }, normal: { bg: '#f3f4f6', text: '#6b7280' }, low: { bg: '#f0fdf4', text: '#16a34a' } };

  if (loading) return <div style={styles.loading}>Loading ${label.toLowerCase()}...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}><div><h1 style={styles.title}>${label}</h1><p style={styles.subtitle}>Manage your ${plural.toLowerCase()} and leads</p></div></div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}><Mail size={20} style={{ color: '${primaryColor}' }} /><div style={styles.statValue}>{stats.new}</div><div style={styles.statLabel}>New</div></div>
        <div style={styles.statCard}><AlertCircle size={20} style={{ color: '#dc2626' }} /><div style={styles.statValue}>{stats.highPriority}</div><div style={styles.statLabel}>High Priority</div></div>
        <div style={styles.statCard}><CheckCircle size={20} style={{ color: '#16a34a' }} /><div style={styles.statValue}>{stats.converted}</div><div style={styles.statLabel}>Converted</div></div>
        <div style={styles.statCard}><Mail size={20} style={{ color: '#6b7280' }} /><div style={styles.statValue}>{stats.total}</div><div style={styles.statLabel}>Total</div></div>
      </div>

      <div style={styles.filters}>
        <button onClick={() => setFilter('all')} style={{ ...styles.filterBtn, ...(filter === 'all' ? styles.filterBtnActive : {}) }}>All</button>
        {STATUS_PIPELINE.map(s => (<button key={s} onClick={() => setFilter(s)} style={{ ...styles.filterBtn, ...(filter === s ? styles.filterBtnActive : {}) }}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>))}
      </div>

      <div style={styles.inquiriesList}>
        {filteredInquiries.length === 0 ? (
          <div style={styles.emptyState}><Mail size={48} style={{ color: '#d1d5db', marginBottom: '16px' }} /><p>No ${plural.toLowerCase()} found</p></div>
        ) : (
          filteredInquiries.map(inquiry => {
            const statusStyle = statusColors[inquiry.status] || statusColors.new;
            const priorityStyle = priorityColors[inquiry.priority] || priorityColors.normal;
            return (
              <div key={inquiry.id} style={styles.inquiryCard}>
                <div style={styles.inquiryHeader}>
                  <div style={styles.customerInfo}><User size={16} /><span style={styles.customerName}>{inquiry.customer_name}</span><span style={{ ...styles.priorityBadge, background: priorityStyle.bg, color: priorityStyle.text }}>{inquiry.priority}</span></div>
                  <span style={{ ...styles.statusBadge, background: statusStyle.bg, color: statusStyle.text }}>{inquiry.status}</span>
                </div>
                <div style={styles.contactInfo}><span><Mail size={14} /> {inquiry.customer_email}</span>{inquiry.customer_phone && <span><Phone size={14} /> {inquiry.customer_phone}</span>}</div>
                {inquiry.message && <div style={styles.message}>{inquiry.message}</div>}
                <div style={styles.inquiryFooter}>
                  <span style={styles.timestamp}><Clock size={12} /> {new Date(inquiry.created_at).toLocaleDateString()}</span>
                  <div style={styles.actions}>
                    <select value={inquiry.status} onChange={e => updateStatus(inquiry.id, e.target.value)} style={styles.statusSelect}>{STATUS_PIPELINE.map(s => (<option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>))}</select>
                    <button onClick={() => setRespondingTo(inquiry.id)} style={styles.respondBtn}><MessageSquare size={14} /> Respond</button>
                  </div>
                </div>
                {respondingTo === inquiry.id && (
                  <div style={styles.respondForm}>
                    <textarea value={response} onChange={e => setResponse(e.target.value)} placeholder="Type your response..." style={styles.textarea} />
                    <div style={styles.respondActions}><button onClick={() => setRespondingTo(null)} style={styles.cancelBtn}>Cancel</button><button onClick={() => sendResponse(inquiry.id)} style={styles.sendBtn}>Send</button></div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '0' },
  loading: { padding: '40px', textAlign: 'center', color: '#6b7280' },
  header: { marginBottom: '24px' },
  title: { fontSize: '24px', fontWeight: '700', margin: 0, color: '#111827' },
  subtitle: { fontSize: '14px', color: '#6b7280', marginTop: '4px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard: { background: '#fff', borderRadius: '12px', padding: '20px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  statValue: { fontSize: '24px', fontWeight: '700', color: '#111827', margin: '8px 0 4px' },
  statLabel: { fontSize: '13px', color: '#6b7280' },
  filters: { display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' },
  filterBtn: { padding: '8px 16px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
  filterBtnActive: { background: '${primaryColor}', color: '#fff', borderColor: '${primaryColor}' },
  inquiriesList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  inquiryCard: { background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  inquiryHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  customerInfo: { display: 'flex', alignItems: 'center', gap: '8px' },
  customerName: { fontWeight: '600' },
  priorityBadge: { padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '500', textTransform: 'capitalize' },
  statusBadge: { padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '500', textTransform: 'capitalize' },
  contactInfo: { display: 'flex', gap: '16px', fontSize: '13px', color: '#6b7280', marginBottom: '8px' },
  message: { fontSize: '14px', color: '#374151', padding: '12px', background: '#f9fafb', borderRadius: '8px', marginBottom: '12px' },
  inquiryFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  timestamp: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#9ca3af' },
  actions: { display: 'flex', gap: '8px' },
  statusSelect: { padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '12px' },
  respondBtn: { display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: '${primaryColor}', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  respondForm: { marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f3f4f6' },
  textarea: { width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', minHeight: '80px', resize: 'vertical' },
  respondActions: { display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' },
  cancelBtn: { padding: '8px 16px', background: '#f3f4f6', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  sendBtn: { padding: '8px 16px', background: '${primaryColor}', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  emptyState: { padding: '60px 20px', textAlign: 'center', color: '#6b7280', background: '#fff', borderRadius: '12px' }
};
`;
}

/**
 * Generate Generic Module Page (Fallback)
 */
function generateGenericModulePage(moduleName, labelConfig, primaryColor) {
  const { label, singular, plural } = labelConfig;

  return `import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';

const API_BASE = '/api/${moduleName}';

export default function ${capitalize(moduleName)}Page() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(API_BASE);
      if (res.ok) { const data = await res.json(); if (data.success) setItems(data.${moduleName} || []); }
    } catch (err) { console.error('Failed to fetch:', err); } finally { setLoading(false); }
  };

  if (loading) return <div style={styles.loading}>Loading ${label.toLowerCase()}...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}><h1 style={styles.title}>${label}</h1><p style={styles.subtitle}>Manage your ${plural.toLowerCase()}</p></div>
      <div style={styles.list}>
        {items.length === 0 ? (
          <div style={styles.emptyState}><FileText size={48} style={{ color: '#d1d5db', marginBottom: '16px' }} /><p>No ${plural.toLowerCase()} found</p></div>
        ) : (
          items.map(item => (
            <div key={item.id} style={styles.item}>
              <div><div style={styles.itemName}>{item.name || item.title || '${singular} ' + item.id}</div>{item.description && <div style={styles.itemDesc}>{item.description}</div>}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '0' },
  loading: { padding: '40px', textAlign: 'center', color: '#6b7280' },
  header: { marginBottom: '24px' },
  title: { fontSize: '24px', fontWeight: '700', margin: 0, color: '#111827' },
  subtitle: { fontSize: '14px', color: '#6b7280', marginTop: '4px' },
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  item: { background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  itemName: { fontWeight: '600', marginBottom: '4px' },
  itemDesc: { fontSize: '14px', color: '#6b7280' },
  emptyState: { padding: '60px 20px', textAlign: 'center', color: '#6b7280', background: '#fff', borderRadius: '12px' }
};
`;
}

module.exports = {
  generateAdminDashboard
};
