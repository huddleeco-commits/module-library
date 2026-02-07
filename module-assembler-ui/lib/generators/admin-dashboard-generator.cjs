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
 * Industry page lists (duplicated from launchpad-engine to avoid circular require)
 */
const INDUSTRY_PAGES_MAP = {
  'pizza-restaurant': ['home', 'menu', 'about', 'contact', 'gallery', 'order'],
  'steakhouse': ['home', 'menu', 'about', 'contact', 'gallery', 'reservations'],
  'coffee-cafe': ['home', 'menu', 'about', 'contact', 'gallery', 'order', 'reservations'],
  'restaurant': ['home', 'menu', 'about', 'contact', 'gallery', 'reservations'],
  'bakery': ['home', 'menu', 'about', 'contact', 'gallery', 'order'],
  'salon-spa': ['home', 'services', 'about', 'contact', 'gallery', 'book'],
  'fitness-gym': ['home', 'classes', 'about', 'contact', 'gallery', 'membership'],
  'dental': ['home', 'services', 'about', 'contact', 'team', 'book'],
  'healthcare': ['home', 'services', 'about', 'contact', 'team', 'book'],
  'yoga': ['home', 'classes', 'about', 'contact', 'schedule', 'membership'],
  'barbershop': ['home', 'services', 'about', 'contact', 'gallery', 'book'],
  'law-firm': ['home', 'services', 'about', 'contact', 'team', 'consultation'],
  'real-estate': ['home', 'listings', 'about', 'contact', 'team', 'valuation'],
  'plumber': ['home', 'services', 'about', 'contact', 'areas', 'quote'],
  'cleaning': ['home', 'services', 'about', 'contact', 'pricing', 'quote'],
  'auto-shop': ['home', 'services', 'about', 'contact', 'gallery', 'appointment'],
  'saas': ['home', 'features', 'pricing', 'about', 'contact', 'demo'],
  'ecommerce': ['home', 'products', 'about', 'contact', 'cart', 'account'],
  'school': ['home', 'programs', 'about', 'contact', 'admissions', 'calendar']
};

/**
 * Generate complete admin dashboard
 * @param {string} adminDir - Output directory for admin dashboard
 * @param {object} businessData - Business configuration
 * @param {string} industryId - Industry type
 * @returns {object} - Generation result
 */
function generateAdminDashboard(adminDir, businessData, industryId, menuStyleId = 'photo-grid') {
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
  fs.writeFileSync(path.join(pagesDir, 'Notifications.jsx'), generateNotificationsPage(businessName, primaryColor, industryModules));
  files.push('src/pages/Notifications.jsx');

  fs.writeFileSync(path.join(pagesDir, 'AgentChat.jsx'), generateAgentChatPage(businessName, primaryColor, industryModules));
  files.push('src/pages/AgentChat.jsx');

  fs.writeFileSync(path.join(pagesDir, 'AICosts.jsx'), generateAICostsPage(businessName, primaryColor));
  files.push('src/pages/AICosts.jsx');

  fs.writeFileSync(path.join(pagesDir, 'Settings.jsx'), generateSettingsPage(businessName, primaryColor));
  files.push('src/pages/Settings.jsx');

  // Generate Website Editor page
  fs.writeFileSync(path.join(pagesDir, 'WebsiteEditor.jsx'), generateWebsiteEditorPage(businessName, primaryColor, industryId, menuStyleId));
  files.push('src/pages/WebsiteEditor.jsx');

  // Generate Customers & Loyalty page
  fs.writeFileSync(path.join(pagesDir, 'CustomersPage.jsx'), generateCustomersPage(businessName, primaryColor, industryId));
  files.push('src/pages/CustomersPage.jsx');

  // Generate assets directory structure organized by industry
  const assetsDir = path.join(adminDir, 'public', 'assets');
  if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

  // Build combined manifest from all catalog modules
  const manifest = {};
  for (const [modName, modType] of Object.entries(industryModules)) {
    if (modType === 'catalog') {
      const assets = getIndustryAssets(modName);
      manifest[modName] = assets;
      // Create per-category subdirectories
      for (const group of assets) {
        const catDir = path.join(assetsDir, modName, group.category.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
        if (!fs.existsSync(catDir)) fs.mkdirSync(catDir, { recursive: true });
      }
    }
  }
  fs.writeFileSync(path.join(assetsDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  files.push('public/assets/manifest.json');

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
  return `import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.API_TARGET || env.VITE_API_URL || 'http://localhost:5001';

  return {
    plugins: [react()],
    server: {
      port: 5002,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true
        }
      }
    }
  };
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
import WebsiteEditor from './pages/WebsiteEditor';
import CustomersPage from './pages/CustomersPage';
import Notifications from './pages/Notifications';
import AgentChat from './pages/AgentChat';
import AICosts from './pages/AICosts';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<DashboardHome />} />
${moduleRoutes}
        <Route path="customers" element={<CustomersPage />} />
        <Route path="website" element={<WebsiteEditor />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="ai" element={<AgentChat />} />
        <Route path="ai/:agentId" element={<AgentChat />} />
        <Route path="ai-costs" element={<AICosts />} />
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

  // Industry-aware logo emoji
  const logoEmojiMap = {
    menu: '🍽️', services: '🔧', classes: '💪', features: '💻',
    products: '🛒', programs: '🎓', listings: '🏠', appointments: '✂️',
    consultations: '⚖️', demos: '💻', quotes: '🔧', memberships: '💪',
    enrollments: '🎓', orders: '📦', bookings: '🧘', inquiries: '📬'
  };
  const primaryModule = moduleNames[0] || 'services';
  const logoEmoji = logoEmojiMap[primaryModule] || '🏢';

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
  const usedIcons = ['LayoutDashboard', 'Globe', 'Bell', 'Bot', 'DollarSign', 'Settings', 'ExternalLink', 'ChevronRight', 'Users2'];
  moduleNames.forEach(mod => {
    const icon = iconMap[mod] || 'FileText';
    if (!usedIcons.includes(icon)) usedIcons.push(icon);
  });
  const iconsImport = usedIcons.join(', ');

  return `import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  ${iconsImport}
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || '';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
${moduleNavItems},
  { path: '/customers', icon: Users2, label: 'Customers' },
  { path: '/website', icon: Globe, label: 'Website' },
  { path: '/notifications', icon: Bell, label: 'Notifications' },
  { path: '/ai', icon: Bot, label: 'AI Agents' },
  { path: '/ai-costs', icon: DollarSign, label: 'AI Costs' },
  { path: '/settings', icon: Settings, label: 'Settings' }
];

export default function Sidebar() {
  const location = useLocation();
  const [unreadChats, setUnreadChats] = useState(0);

  const fetchUnread = async () => {
    try {
      const res = await fetch(\`\${API}/api/chat/unread-count\`);
      const data = await res.json();
      if (data.success) setUnreadChats(data.unreadCount || 0);
    } catch {}
  };

  useEffect(() => {
    fetchUnread();
    const es = new EventSource(\`\${API}/api/chat/events\`);
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'chat_update') fetchUnread();
      } catch {}
    };
    return () => es.close();
  }, []);

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>
        <span style={styles.logoIcon}>${logoEmoji}</span>
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
          const showChatBadge = item.path === '/customers' && unreadChats > 0;

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
              {showChatBadge ? (
                <span style={{
                  marginLeft: 'auto',
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 700,
                  minWidth: 20,
                  height: 20,
                  borderRadius: 10,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 6px'
                }}>{unreadChats}</span>
              ) : isActive ? <ChevronRight size={16} style={{ marginLeft: 'auto' }} /> : null}
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
  // Get labels for modules
  const primaryLabel = MODULE_LABELS[primaryModule]?.label || capitalize(primaryModule);
  const secondaryLabel = secondaryModule ? (MODULE_LABELS[secondaryModule]?.label || capitalize(secondaryModule)) : '';

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

  // Items API endpoint (today's bookings, all inquiries, or all listings)
  const itemsEndpoint = bookingModule ? `/${bookingModule}/admin/today` :
                        inquiriesModule ? `/${inquiriesModule}/admin/all` :
                        listingsModule ? `/${listingsModule}/admin/all` : null;

  // The key used in the API response object
  const itemsResponseKey = bookingModule || inquiriesModule || listingsModule || null;

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

  // Get icons for modules
  const primaryIcon = MODULE_LABELS[primaryModule]?.icon || 'FileText';
  const secondaryIcon = secondaryModule ? (MODULE_LABELS[secondaryModule]?.icon || 'Calendar') : 'Calendar';

  return `import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, Bell, TrendingUp, Users, DollarSign, FileText, Layers,
  Clock, CheckCircle, AlertCircle, ArrowRight, Mail, Home,
  UtensilsCrossed, Wrench, Package, Briefcase, GraduationCap, Sparkles,
  MessageSquare, ClipboardList, Building, Car
} from 'lucide-react';

// Module icons mapping
const MODULE_ICONS = {
  menu: UtensilsCrossed,
  services: Wrench,
  products: Package,
  features: Sparkles,
  classes: Users,
  programs: GraduationCap,
  listings: Building,
  reservations: Calendar,
  appointments: Calendar,
  consultations: MessageSquare,
  bookings: Calendar,
  demos: Calendar,
  orders: ClipboardList,
  quotes: ClipboardList,
  memberships: Users,
  enrollments: GraduationCap,
  inquiries: Mail
};

const PrimaryIcon = MODULE_ICONS['${primaryModule}'] || FileText;
const SecondaryIcon = MODULE_ICONS['${secondaryModule || 'calendar'}'] || Calendar;

const API_BASE = (import.meta.env.VITE_API_URL || '') + '/api';

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
        ${itemsEndpoint ? `// Fetch today's items
        try {
          const itemsRes = await fetch(\`\${API_BASE}${itemsEndpoint}\`);
          if (itemsRes.ok) {
            const itemsData = await itemsRes.json();
            const items = itemsData['${itemsResponseKey}'] || itemsData.items || [];
            if (items.length > 0) setRecentItems(items.slice(0, 5));
          }
        } catch (e) { /* items fetch is non-critical */ }` : ''}
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
          <Link to="/${primaryModule}" style={styles.actionCard}>
            <PrimaryIcon size={24} />
            <span>Manage ${primaryLabel}</span>
            <ArrowRight size={16} style={{ marginLeft: 'auto' }} />
          </Link>
          ${secondaryModule ? `<Link to="/${secondaryModule}" style={styles.actionCard}>
            <SecondaryIcon size={24} />
            <span>View ${secondaryLabel}</span>
            <ArrowRight size={16} style={{ marginLeft: 'auto' }} />
          </Link>` : ''}
          <Link to="/ai" style={styles.actionCard}>
            <Bell size={24} />
            <span>Chat with AI Agent</span>
            <ArrowRight size={16} style={{ marginLeft: 'auto' }} />
          </Link>
        </div>
      </div>

      {/* Today's ${secondaryLabel || 'Activity'} */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Today's ${secondaryLabel || 'Activity'}</h2>
          <Link to="/${secondaryModule || primaryModule}" style={styles.viewAll}>View all</Link>
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
                  <p style={styles.resDetails}>{res.service || res.party_size ? (res.party_size + ' guests') : res.duration ? (res.duration + ' min') : res.type || ''}</p>
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
          <p style={styles.empty}>No ${secondaryLabel?.toLowerCase() || 'items'} today</p>
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


function generateNotificationsPage(businessName, primaryColor, industryModules) {
  // Build industry-aware notification templates
  const modules = Object.entries(industryModules || {});
  const bookingMod = modules.find(([, type]) => type === 'booking');
  const inquiryMod = modules.find(([, type]) => type === 'inquiries');
  const catalogMod = modules.find(([, type]) => type === 'catalog');

  // Determine the primary action module for notifications
  const actionMod = bookingMod || inquiryMod;
  const actionLabel = actionMod ? (MODULE_LABELS[actionMod[0]]?.singular || 'Booking') : 'Booking';

  const templates = [
    `  { id: '${actionMod ? actionMod[0] : 'booking'}_confirmation', name: '${actionLabel} Confirmation', icon: CheckCircle, color: '#22c55e' }`,
    `  { id: '${actionMod ? actionMod[0] : 'booking'}_reminder', name: '${actionLabel} Reminder', icon: Bell, color: '#3b82f6' }`,
    `  { id: 'cancellation', name: 'Cancellation Notice', icon: XCircle, color: '#ef4444' }`,
    `  { id: 'custom', name: 'Custom Message', icon: Mail, color: '#8b5cf6' }`
  ];

  const recentItems = [
    `    { id: 1, template: '${actionMod ? actionMod[0] : 'booking'}_confirmation', to: 'john@example.com', status: 'sent', time: '2 hours ago' }`,
    `    { id: 2, template: '${actionMod ? actionMod[0] : 'booking'}_reminder', to: 'sarah@example.com', status: 'sent', time: '5 hours ago' }`,
    `    { id: 3, template: 'cancellation', to: 'mike@example.com', status: 'failed', time: '1 day ago' }`
  ];

  return `import React, { useState } from 'react';
import { Bell, Mail, Phone, Send, CheckCircle, XCircle, Clock, X } from 'lucide-react';

const TEMPLATES = [
${templates.join(',\n')}
];

export default function Notifications() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [sending, setSending] = useState(false);
  const [recipient, setRecipient] = useState({ email: '', phone: '' });
  const [channels, setChannels] = useState(['email']);
  const [customMessage, setCustomMessage] = useState({ subject: '', body: '' });

  const [recentNotifications] = useState([
${recentItems.join(',\n')}
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

function generateAgentChatPage(businessName, primaryColor, industryModules) {
  // Build industry-aware icon imports and agent icon map
  const modules = Object.entries(industryModules || {});
  const iconImportMap = {
    catalog: 'Package', booking: 'Calendar', listings: 'Home', inquiries: 'MessageSquare'
  };
  const moduleIconEntries = modules.map(([name, type]) => {
    const icon = iconImportMap[type] || 'Package';
    return `  '${name}-manager': ${icon}`;
  });
  const extraIcons = new Set(modules.map(([, type]) => iconImportMap[type] || 'Package'));
  const iconImports = ['Send', 'Bot', 'User', 'Loader', 'ChevronRight', 'PenTool', 'Headphones', 'BarChart3', 'Zap', 'Wrench', ...extraIcons].join(', ');

  // Build industry-aware chat suggestions
  const hintMap = {
    menu: '"Show me today\'s menu"',
    services: '"Show me our services"',
    classes: '"What classes are available?"',
    features: '"Show me our features"',
    products: '"Show me our products"',
    programs: '"What programs do we offer?"',
    listings: '"Show me active listings"',
    reservations: '"What reservations do we have?"',
    appointments: '"Show me today\'s appointments"',
    consultations: '"Any consultations scheduled?"',
    demos: '"What demos are booked?"',
    bookings: '"Show today\'s bookings"',
    orders: '"Show me recent orders"',
    quotes: '"Any new quote requests?"',
    memberships: '"Show new membership signups"',
    enrollments: '"Show enrollment requests"',
    inquiries: '"Show me new inquiries"'
  };
  const moduleNames = Object.keys(industryModules || {});
  const hint1 = hintMap[moduleNames[0]] || '"Show me today\'s activity"';
  const hint2 = hintMap[moduleNames[1]] || '"How is business this week?"';
  const welcomeHint = `Try: ${hint1} or ${hint2}`;

  return `import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ${iconImports} } from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || '') + '/api/admin';

const AGENT_ICONS = {
${moduleIconEntries.join(',\n')},
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
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.message,
          usage: data.usage || null
        }]);
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
                  <p style={styles.welcomeHint}>${welcomeHint}</p>
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
                    {msg.usage && (
                      <div style={styles.usageBar}>
                        <span style={styles.usageItem}>
                          <Zap size={12} /> {msg.usage.inputTokens + msg.usage.outputTokens} tokens
                        </span>
                        <span style={styles.usageItem}>
                          $\{msg.usage.cost?.toFixed(4) || '0.0000'}
                        </span>
                        {msg.usage.toolsUsed?.length > 0 && (
                          <span style={styles.usageItem}>
                            <Wrench size={12} /> {msg.usage.toolsUsed.join(', ')}
                          </span>
                        )}
                        {msg.usage.apiCalls > 1 && (
                          <span style={styles.usageItem}>
                            {msg.usage.apiCalls} API calls
                          </span>
                        )}
                      </div>
                    )}
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
  usageBar: { display: 'flex', gap: '12px', marginTop: '6px', padding: '0 4px', flexWrap: 'wrap' },
  usageItem: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#9ca3af' },
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
  return `import React, { useState, useEffect } from 'react';
import { Save, Building, Clock, Globe, Bell, Palette, Key, Eye, EyeOff, Trash2, ExternalLink } from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || '');

export default function Settings() {
  const [settings, setSettings] = useState({
    businessName: '${businessName.replace(/'/g, "\\'")}',
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

  // API Key state
  const [apiKeyStatus, setApiKeyStatus] = useState({ configured: false, masked: null });
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyLoading, setApiKeyLoading] = useState(false);
  const [apiKeyMsg, setApiKeyMsg] = useState(null);

  useEffect(() => {
    fetch(API_BASE + '/api/admin/settings')
      .then(r => r.json())
      .then(data => {
        if (data.success) setApiKeyStatus(data.anthropicKey);
      })
      .catch(() => {});
  }, []);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveApiKey = async () => {
    if (!apiKeyInput.trim()) return;
    setApiKeyLoading(true);
    setApiKeyMsg(null);
    try {
      const res = await fetch(API_BASE + '/api/admin/settings/api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: apiKeyInput.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setApiKeyStatus(data.anthropicKey);
        setApiKeyInput('');
        setApiKeyMsg({ type: 'success', text: 'API key saved successfully' });
      } else {
        setApiKeyMsg({ type: 'error', text: data.error || 'Failed to save key' });
      }
    } catch (e) {
      setApiKeyMsg({ type: 'error', text: 'Network error saving key' });
    }
    setApiKeyLoading(false);
    setTimeout(() => setApiKeyMsg(null), 4000);
  };

  const handleRemoveApiKey = async () => {
    setApiKeyLoading(true);
    setApiKeyMsg(null);
    try {
      const res = await fetch(API_BASE + '/api/admin/settings/api-key', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setApiKeyStatus(data.anthropicKey);
        setApiKeyMsg({ type: 'success', text: 'API key removed' });
      }
    } catch (e) {
      setApiKeyMsg({ type: 'error', text: 'Network error removing key' });
    }
    setApiKeyLoading(false);
    setTimeout(() => setApiKeyMsg(null), 4000);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Settings</h1>
        <button onClick={handleSave} style={styles.saveBtn}>
          <Save size={18} /> {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* API Keys */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <Key size={20} />
          <h2 style={styles.sectionTitle}>API Keys</h2>
          <span style={{
            marginLeft: 'auto',
            fontSize: '12px',
            fontWeight: '600',
            padding: '3px 10px',
            borderRadius: '12px',
            background: apiKeyStatus.configured ? '#dcfce7' : '#fef9c3',
            color: apiKeyStatus.configured ? '#166534' : '#854d0e'
          }}>
            {apiKeyStatus.configured ? 'Configured' : 'Not configured'}
          </span>
        </div>

        {apiKeyStatus.configured && (
          <div style={{ marginBottom: '16px', padding: '12px', background: '#f9fafb', borderRadius: '8px', fontSize: '14px', color: '#6b7280' }}>
            Current key: <code style={{ background: '#e5e7eb', padding: '2px 6px', borderRadius: '4px' }}>{apiKeyStatus.masked}</code>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type={showApiKey ? 'text' : 'password'}
              value={apiKeyInput}
              onChange={e => setApiKeyInput(e.target.value)}
              placeholder="sk-ant-api03-..."
              style={{ ...styles.input, paddingRight: '40px' }}
            />
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              style={{
                position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px'
              }}
            >
              {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <button
            onClick={handleSaveApiKey}
            disabled={apiKeyLoading || !apiKeyInput.trim()}
            style={{
              ...styles.saveBtn,
              opacity: apiKeyLoading || !apiKeyInput.trim() ? 0.5 : 1,
              minWidth: '80px', justifyContent: 'center'
            }}
          >
            {apiKeyLoading ? '...' : 'Save'}
          </button>
          {apiKeyStatus.configured && (
            <button
              onClick={handleRemoveApiKey}
              disabled={apiKeyLoading}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '10px 16px', background: '#fee2e2', color: '#991b1b',
                border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500',
                opacity: apiKeyLoading ? 0.5 : 1
              }}
            >
              <Trash2 size={16} /> Remove
            </button>
          )}
        </div>

        {apiKeyMsg && (
          <div style={{
            padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '12px',
            background: apiKeyMsg.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: apiKeyMsg.type === 'success' ? '#166534' : '#991b1b'
          }}>
            {apiKeyMsg.text}
          </div>
        )}

        <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>
          <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" style={{ color: '${primaryColor}', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            Get a key at console.anthropic.com <ExternalLink size={12} />
          </a>
        </p>
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
 * Industry-specific sample assets — images + prefilled items per module type.
 * Uses picsum.photos (seeded) for stable placeholder images.
 */
function getIndustryAssets(moduleName) {
  const p = 'https://picsum.photos/seed';
  const assets = {
    menu: [
      { category: 'Breads', items: [
        { name: 'Sourdough Loaf', price: '6.50', description: 'Artisan sourdough with a crispy crust and tangy crumb', image_url: `${p}/bread-sourdough/400/300`, dietary_flags: { vegetarian: true, vegan: true } },
        { name: 'French Baguette', price: '4.00', description: 'Classic French baguette, baked fresh daily', image_url: `${p}/bread-baguette/400/300`, dietary_flags: { vegetarian: true, vegan: true } },
        { name: 'Ciabatta Roll', price: '3.50', description: 'Light and airy Italian bread with olive oil', image_url: `${p}/bread-ciabatta/400/300`, dietary_flags: { vegetarian: true, vegan: true } },
      ]},
      { category: 'Pastries', items: [
        { name: 'Butter Croissant', price: '3.75', description: 'Flaky, buttery layers of perfection', image_url: `${p}/pastry-croissant/400/300`, dietary_flags: { vegetarian: true } },
        { name: 'Blueberry Muffin', price: '3.25', description: 'Loaded with fresh blueberries and a crumb topping', image_url: `${p}/pastry-muffin/400/300`, dietary_flags: { vegetarian: true } },
        { name: 'Chocolate Eclair', price: '4.50', description: 'Choux pastry filled with cream, topped with chocolate', image_url: `${p}/pastry-eclair/400/300`, dietary_flags: { vegetarian: true } },
      ]},
      { category: 'Cakes', items: [
        { name: 'Chocolate Cake Slice', price: '5.50', description: 'Rich, moist chocolate cake with ganache frosting', image_url: `${p}/cake-chocolate/400/300`, dietary_flags: { vegetarian: true } },
        { name: 'Carrot Cake', price: '5.00', description: 'Spiced carrot cake with cream cheese frosting', image_url: `${p}/cake-carrot/400/300`, dietary_flags: { vegetarian: true } },
        { name: 'New York Cheesecake', price: '6.00', description: 'Creamy classic cheesecake on a graham cracker crust', image_url: `${p}/cake-cheesecake/400/300`, dietary_flags: { vegetarian: true } },
      ]},
      { category: 'Drinks', items: [
        { name: 'Espresso', price: '3.00', description: 'Double-shot espresso from locally roasted beans', image_url: `${p}/drink-espresso/400/300`, dietary_flags: { vegetarian: true, vegan: true, glutenFree: true } },
        { name: 'Vanilla Latte', price: '4.50', description: 'Smooth espresso with steamed milk and vanilla', image_url: `${p}/drink-latte/400/300`, dietary_flags: { vegetarian: true } },
        { name: 'Fresh Orange Juice', price: '4.00', description: 'Freshly squeezed orange juice', image_url: `${p}/drink-oj/400/300`, dietary_flags: { vegetarian: true, vegan: true, glutenFree: true } },
      ]},
    ],
    services: [
      { category: 'Hair', items: [
        { name: 'Precision Haircut', price: '45.00', description: 'Expert cut tailored to your face shape and style', image_url: `${p}/svc-haircut/400/300` },
        { name: 'Color & Highlights', price: '120.00', description: 'Full color treatment with balayage or foil highlights', image_url: `${p}/svc-hair-color/400/300` },
        { name: 'Blowout & Style', price: '35.00', description: 'Professional blowout with styling finish', image_url: `${p}/svc-blowout/400/300` },
      ]},
      { category: 'Skin Care', items: [
        { name: 'Classic Facial', price: '85.00', description: 'Deep cleansing facial with extraction and mask', image_url: `${p}/svc-facial/400/300` },
        { name: 'Chemical Peel', price: '110.00', description: 'Professional-grade peel for skin renewal', image_url: `${p}/svc-peel/400/300` },
        { name: 'Hydrating Treatment', price: '95.00', description: 'Intensive moisture therapy for dry or aging skin', image_url: `${p}/svc-hydrate/400/300` },
      ]},
      { category: 'Nails', items: [
        { name: 'Gel Manicure', price: '40.00', description: 'Long-lasting gel polish with cuticle care', image_url: `${p}/svc-manicure/400/300` },
        { name: 'Spa Pedicure', price: '55.00', description: 'Relaxing foot soak, scrub, and polish', image_url: `${p}/svc-pedicure/400/300` },
        { name: 'Nail Art', price: '25.00', description: 'Custom nail art designs per nail', image_url: `${p}/svc-nail-art/400/300` },
      ]},
      { category: 'Body', items: [
        { name: 'Swedish Massage', price: '90.00', description: '60-minute full body relaxation massage', image_url: `${p}/svc-massage/400/300` },
        { name: 'Hot Stone Therapy', price: '110.00', description: 'Heated basalt stones for deep muscle relief', image_url: `${p}/svc-hotstone/400/300` },
        { name: 'Body Scrub', price: '75.00', description: 'Exfoliating scrub with essential oils', image_url: `${p}/svc-scrub/400/300` },
      ]},
    ],
    classes: [
      { category: 'Cardio', items: [
        { name: 'HIIT Blast', price: '25.00', description: 'High-intensity interval training for maximum burn', image_url: `${p}/cls-hiit/400/300` },
        { name: 'Spin Class', price: '22.00', description: 'Indoor cycling with energizing music and coaching', image_url: `${p}/cls-spin/400/300` },
        { name: 'Kickboxing', price: '28.00', description: 'Full-body cardio with boxing and martial arts moves', image_url: `${p}/cls-kickbox/400/300` },
      ]},
      { category: 'Strength', items: [
        { name: 'Power Lifting', price: '30.00', description: 'Barbell-focused strength training for all levels', image_url: `${p}/cls-lift/400/300` },
        { name: 'CrossFit WOD', price: '28.00', description: 'Workout of the day with varied functional movements', image_url: `${p}/cls-crossfit/400/300` },
        { name: 'Kettlebell Flow', price: '25.00', description: 'Dynamic kettlebell exercises for strength and conditioning', image_url: `${p}/cls-kettle/400/300` },
      ]},
      { category: 'Mind & Body', items: [
        { name: 'Vinyasa Yoga', price: '20.00', description: 'Flowing yoga sequences synced with breath', image_url: `${p}/cls-yoga/400/300` },
        { name: 'Pilates Core', price: '22.00', description: 'Mat Pilates focusing on core stability and posture', image_url: `${p}/cls-pilates/400/300` },
        { name: 'Meditation', price: '15.00', description: 'Guided meditation for stress relief and mindfulness', image_url: `${p}/cls-meditate/400/300` },
      ]},
    ],
    features: [
      { category: 'Analytics', items: [
        { name: 'Real-Time Dashboard', price: '29.00', description: 'Live metrics and KPIs at a glance', image_url: `${p}/feat-dashboard/400/300` },
        { name: 'Custom Reports', price: '19.00', description: 'Build and schedule custom report templates', image_url: `${p}/feat-reports/400/300` },
        { name: 'Data Export', price: '9.00', description: 'Export data in CSV, JSON, or PDF formats', image_url: `${p}/feat-export/400/300` },
      ]},
      { category: 'Integrations', items: [
        { name: 'API Access', price: '49.00', description: 'Full REST API with webhooks and SDKs', image_url: `${p}/feat-api/400/300` },
        { name: 'Slack Integration', price: '15.00', description: 'Push notifications and commands in Slack', image_url: `${p}/feat-slack/400/300` },
        { name: 'Zapier Connect', price: '19.00', description: 'Connect to 5,000+ apps via Zapier', image_url: `${p}/feat-zapier/400/300` },
      ]},
      { category: 'Security', items: [
        { name: 'SSO / SAML', price: '39.00', description: 'Single sign-on with SAML 2.0 support', image_url: `${p}/feat-sso/400/300` },
        { name: 'Audit Logs', price: '25.00', description: 'Complete activity audit trail with search', image_url: `${p}/feat-audit/400/300` },
        { name: 'Two-Factor Auth', price: '0.00', description: 'Two-factor authentication for all accounts', image_url: `${p}/feat-2fa/400/300` },
      ]},
    ],
    products: [
      { category: 'New Arrivals', items: [
        { name: 'Premium Headphones', price: '89.00', description: 'Wireless noise-canceling headphones with 30hr battery', image_url: `${p}/prod-headphones/400/300` },
        { name: 'Smart Watch', price: '199.00', description: 'Fitness tracking, notifications, and GPS', image_url: `${p}/prod-watch/400/300` },
        { name: 'Laptop Stand', price: '45.00', description: 'Ergonomic aluminum stand for better posture', image_url: `${p}/prod-stand/400/300` },
      ]},
      { category: 'Best Sellers', items: [
        { name: 'Wireless Charger', price: '29.00', description: 'Fast Qi charging pad for all devices', image_url: `${p}/prod-charger/400/300` },
        { name: 'USB-C Hub', price: '55.00', description: '7-in-1 hub with HDMI, USB-A, and SD card', image_url: `${p}/prod-hub/400/300` },
        { name: 'Desk Organizer', price: '35.00', description: 'Bamboo desk organizer with device slots', image_url: `${p}/prod-organizer/400/300` },
      ]},
      { category: 'Accessories', items: [
        { name: 'Phone Case', price: '19.00', description: 'Slim protective case with MagSafe support', image_url: `${p}/prod-case/400/300` },
        { name: 'Cable Kit', price: '15.00', description: 'Braided cables: Lightning, USB-C, and Micro-USB', image_url: `${p}/prod-cables/400/300` },
        { name: 'Screen Protector', price: '12.00', description: 'Tempered glass screen protector, bubble-free', image_url: `${p}/prod-protector/400/300` },
      ]},
    ],
    programs: [
      { category: 'Beginner', items: [
        { name: 'Intro to Coding', price: '199.00', description: '8-week course covering HTML, CSS, and JavaScript basics', image_url: `${p}/prog-coding/400/300` },
        { name: 'Digital Literacy', price: '149.00', description: 'Essential computer skills for the modern world', image_url: `${p}/prog-digital/400/300` },
        { name: 'Creative Writing', price: '129.00', description: 'Find your voice through guided writing exercises', image_url: `${p}/prog-writing/400/300` },
      ]},
      { category: 'Intermediate', items: [
        { name: 'Data Science', price: '349.00', description: 'Python, pandas, and data visualization', image_url: `${p}/prog-datasci/400/300` },
        { name: 'UX Design', price: '299.00', description: 'User research, wireframing, and prototyping', image_url: `${p}/prog-ux/400/300` },
        { name: 'Project Management', price: '249.00', description: 'Agile, Scrum, and project planning fundamentals', image_url: `${p}/prog-pm/400/300` },
      ]},
      { category: 'Advanced', items: [
        { name: 'Machine Learning', price: '499.00', description: 'Build and deploy ML models with TensorFlow', image_url: `${p}/prog-ml/400/300` },
        { name: 'Cloud Architecture', price: '449.00', description: 'AWS and GCP infrastructure design and deployment', image_url: `${p}/prog-cloud/400/300` },
        { name: 'Leadership & Strategy', price: '399.00', description: 'Executive leadership skills and strategic thinking', image_url: `${p}/prog-lead/400/300` },
      ]},
    ],
  };
  return assets[moduleName] || assets.services;
}

/**
 * Generate Catalog Editor Page (Menu, Services, Classes, Features, Products, Programs)
 */
function generateCatalogEditorPage(moduleName, labelConfig, primaryColor) {
  const { label, singular, plural } = labelConfig;
  const isMenu = moduleName === 'menu';
  const assetsJson = JSON.stringify(getIndustryAssets(moduleName), null, 2);

  return `import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, GripVertical, Eye, EyeOff, Save, X, ChevronDown, ChevronUp, Image, Star, Leaf, Flame, WheatOff, Search, LayoutGrid, List, Monitor, Pencil, FolderOpen, Download } from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || '') + '/api/${moduleName}';
const IS_MENU = ${isMenu};
const SAMPLE_CONTENT = ${assetsJson};

export default function ${capitalize(moduleName)}Page() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [viewMode, setViewMode] = useState('split');
  const [editModalItem, setEditModalItem] = useState(null);
  const [isNewItem, setIsNewItem] = useState(false);
  const [activePreviewCategory, setActivePreviewCategory] = useState(null);
  const [previewSearch, setPreviewSearch] = useState('');
  const [imgErrors, setImgErrors] = useState({});
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [loadingSamples, setLoadingSamples] = useState(false);

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
          if (!activePreviewCategory && (data.categories || []).length > 0) {
            setActivePreviewCategory(data.categories[0].id);
          }
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
      if (isNewItem) {
        await fetch(\`\${API_BASE}/admin/item\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });
      } else {
        await fetch(\`\${API_BASE}/admin/item/\${item.id}\`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });
      }
      setEditModalItem(null);
      setIsNewItem(false);
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

  const openNewItemModal = () => {
    setEditModalItem({
      category_id: categories.length > 0 ? categories[0].id : null,
      name: '', price: '', description: '', image_url: '', popular: false,
      dietary_flags: IS_MENU ? { vegetarian: false, vegan: false, glutenFree: false, spicy: false } : undefined
    });
    setIsNewItem(true);
  };

  const openEditModal = (item) => {
    setEditModalItem({
      ...item,
      dietary_flags: IS_MENU ? (item.dietary_flags || { vegetarian: false, vegan: false, glutenFree: false, spicy: false }) : undefined
    });
    setIsNewItem(false);
  };

  const loadSamples = async () => {
    if (!confirm('Load sample ${plural.toLowerCase()}? This will add demo items to your catalog.')) return;
    setLoadingSamples(true);
    try {
      for (const group of SAMPLE_CONTENT) {
        // Create category first
        const catRes = await fetch(\`\${API_BASE}/admin/category\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: group.category })
        });
        let catId = null;
        if (catRes.ok) {
          const catData = await catRes.json();
          catId = catData.category?.id;
        }
        // If category creation fails, try to find existing one
        if (!catId) {
          const existing = categories.find(c => c.name === group.category);
          catId = existing?.id;
        }
        if (!catId) continue;
        // Add items
        for (const item of group.items) {
          await fetch(\`\${API_BASE}/admin/item\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...item, category_id: catId, available: true })
          });
        }
      }
      await fetchData();
    } catch (err) {
      console.error('Failed to load samples:', err);
    } finally {
      setLoadingSamples(false);
    }
  };

  const toggleCategory = (catId) => {
    setExpandedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  // All sample images flattened for the asset picker
  const allSampleImages = useMemo(() => {
    return SAMPLE_CONTENT.flatMap(g => g.items.map(i => ({ url: i.image_url, label: i.name, category: g.category })));
  }, []);

  // Merge editing item into categories for live preview
  const previewCategories = useMemo(() => {
    return categories.map(cat => ({
      ...cat,
      items: (cat.items || []).map(item => {
        if (editModalItem && !isNewItem && item.id === editModalItem.id) {
          return { ...item, ...editModalItem };
        }
        return item;
      }).filter(item => item.available !== false)
    }));
  }, [categories, editModalItem, isNewItem]);

  const filteredPreviewItems = useMemo(() => {
    const activeCat = previewCategories.find(c => c.id === activePreviewCategory);
    if (!activeCat) return [];
    let items = activeCat.items || [];
    if (previewSearch.trim()) {
      const q = previewSearch.toLowerCase();
      items = items.filter(i => i.name?.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q));
    }
    return items;
  }, [previewCategories, activePreviewCategory, previewSearch]);

  if (loading) return <div style={st.loading}>Loading ${label.toLowerCase()}...</div>;

  const showEditor = viewMode === 'editor' || viewMode === 'split';
  const showPreview = viewMode === 'preview' || viewMode === 'split';

  return (
    <div style={st.container}>
      {/* Header */}
      <div style={st.header}>
        <div>
          <h1 style={st.title}>${label} Editor</h1>
          <p style={st.subtitle}>Manage your ${plural.toLowerCase()} with live preview</p>
        </div>
        <div style={st.headerActions}>
          <div style={st.viewToggle}>
            {[['editor', List, 'Editor'], ['split', LayoutGrid, 'Split'], ['preview', Monitor, 'Preview']].map(([mode, Icon, lbl]) => (
              <button key={mode} onClick={() => setViewMode(mode)} style={{ ...st.viewBtn, ...(viewMode === mode ? st.viewBtnActive : {}) }}>
                <Icon size={14} /> {lbl}
              </button>
            ))}
          </div>
          <button onClick={loadSamples} disabled={loadingSamples} style={st.samplesBtn}>
            <Download size={16} /> {loadingSamples ? 'Loading...' : 'Load Samples'}
          </button>
          <button onClick={openNewItemModal} style={st.addBtn}>
            <Plus size={18} /> Add ${singular}
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Editor Panel */}
        {showEditor && (
          <div style={{ flex: viewMode === 'split' ? '0 0 50%' : '1 1 100%', minWidth: 0 }}>
            {categories.map(category => (
              <div key={category.id} style={st.category}>
                <div style={st.categoryHeader} onClick={() => toggleCategory(category.id)}>
                  <div style={st.categoryInfo}>
                    <GripVertical size={16} style={{ color: '#9ca3af', cursor: 'grab' }} />
                    <h2 style={st.categoryTitle}>{category.name}</h2>
                    <span style={st.categoryCount}>{category.items?.length || 0}</span>
                  </div>
                  {expandedCategories[category.id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                {expandedCategories[category.id] && (
                  <div style={st.items}>
                    {(category.items || []).map(item => (
                      <div key={item.id} style={{ ...st.item, opacity: item.available ? 1 : 0.5 }} onClick={() => openEditModal(item)}>
                        <div style={st.itemInfo}>
                          <GripVertical size={14} style={{ color: '#d1d5db', cursor: 'grab' }} />
                          {item.image_url ? (
                            <img src={item.image_url} alt="" style={st.itemThumb} onError={e => { e.target.style.display = 'none'; }} />
                          ) : (
                            <div style={st.itemThumbPlaceholder}><Image size={14} /></div>
                          )}
                          <div>
                            <div style={st.itemNameRow}>
                              <span style={st.itemName}>{item.name}</span>
                              {item.popular && <Star size={12} style={{ color: '#f59e0b', fill: '#f59e0b' }} />}
                              {IS_MENU && item.dietary_flags?.vegetarian && <Leaf size={12} style={{ color: '#22c55e' }} />}
                              {IS_MENU && item.dietary_flags?.spicy && <Flame size={12} style={{ color: '#ef4444' }} />}
                              {IS_MENU && item.dietary_flags?.glutenFree && <WheatOff size={12} style={{ color: '#a855f7' }} />}
                            </div>
                            {item.price && <span style={st.itemPrice}>\${parseFloat(item.price).toFixed(2)}</span>}
                          </div>
                        </div>
                        <div style={st.itemActions} onClick={e => e.stopPropagation()}>
                          <button onClick={() => toggleAvailability(item.id, item.available)} style={st.iconBtn} title={item.available ? 'Hide' : 'Show'}>
                            {item.available ? <Eye size={16} /> : <EyeOff size={16} />}
                          </button>
                          <button onClick={() => openEditModal(item)} style={st.iconBtn}><Pencil size={16} /></button>
                          <button onClick={() => deleteItem(item.id)} style={{ ...st.iconBtn, color: '#ef4444' }}><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                    {(!category.items || category.items.length === 0) && <p style={st.emptyMsg}>No ${plural.toLowerCase()} in this category</p>}
                  </div>
                )}
              </div>
            ))}
            {categories.length === 0 && <div style={st.emptyState}><p>No categories yet. Add your first category to get started.</p></div>}
          </div>
        )}

        {/* Preview Panel */}
        {showPreview && (
          <div style={{ flex: viewMode === 'split' ? '0 0 50%' : '1 1 100%', minWidth: 0 }}>
            <div style={st.previewContainer}>
              <div style={st.previewHeader}>
                <h3 style={st.previewTitle}>Customer Preview</h3>
                <div style={st.previewSearchBox}>
                  <Search size={14} style={{ color: '#9ca3af' }} />
                  <input placeholder="Search ${plural.toLowerCase()}..." value={previewSearch} onChange={e => setPreviewSearch(e.target.value)} style={st.previewSearchInput} />
                </div>
              </div>

              {/* Category pill tabs */}
              <div style={st.previewTabs}>
                {previewCategories.map(cat => (
                  <button key={cat.id} onClick={() => setActivePreviewCategory(cat.id)} style={{ ...st.previewTab, ...(activePreviewCategory === cat.id ? st.previewTabActive : {}) }}>
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Card grid */}
              <div style={st.previewGrid}>
                {filteredPreviewItems.map(item => (
                  <div key={item.id} style={st.previewCard} onClick={() => openEditModal(item)}>
                    <div style={st.previewImageWrap}>
                      {item.image_url && !imgErrors[item.id] ? (
                        <img src={item.image_url} alt={item.name} style={st.previewImage} onError={() => setImgErrors(prev => ({ ...prev, [item.id]: true }))} />
                      ) : (
                        <div style={st.previewImageFallback}><Image size={32} style={{ color: '#d1d5db' }} /></div>
                      )}
                      {item.popular && <span style={st.previewBadge}><Star size={10} style={{ fill: '#fff' }} /> Popular</span>}
                      <div style={st.previewCardOverlay}><Pencil size={16} /> Edit</div>
                    </div>
                    <div style={st.previewCardBody}>
                      <div style={st.previewCardTop}>
                        <span style={st.previewCardName}>{item.name}</span>
                        {item.price && <span style={st.previewCardPrice}>\${parseFloat(item.price).toFixed(2)}</span>}
                      </div>
                      {IS_MENU && (
                        <div style={st.previewDietary}>
                          {item.dietary_flags?.vegetarian && <span style={{ ...st.dietaryIcon, background: '#dcfce7', color: '#16a34a' }}><Leaf size={10} /> Veg</span>}
                          {item.dietary_flags?.vegan && <span style={{ ...st.dietaryIcon, background: '#d1fae5', color: '#059669' }}><Leaf size={10} /> Vegan</span>}
                          {item.dietary_flags?.glutenFree && <span style={{ ...st.dietaryIcon, background: '#f3e8ff', color: '#9333ea' }}><WheatOff size={10} /> GF</span>}
                          {item.dietary_flags?.spicy && <span style={{ ...st.dietaryIcon, background: '#fee2e2', color: '#dc2626' }}><Flame size={10} /> Spicy</span>}
                        </div>
                      )}
                      {item.description && <p style={st.previewCardDesc}>{item.description}</p>}
                    </div>
                  </div>
                ))}
                {filteredPreviewItems.length === 0 && <p style={st.emptyMsg}>No visible ${plural.toLowerCase()} in this category</p>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rich Edit Modal */}
      {editModalItem && (
        <div style={st.modal} onClick={() => { setEditModalItem(null); setIsNewItem(false); }}>
          <div style={st.modalContent} onClick={e => e.stopPropagation()}>
            <div style={st.modalHeader}>
              <h3 style={{ margin: 0 }}>{isNewItem ? 'Add New' : 'Edit'} ${singular}</h3>
              <button onClick={() => { setEditModalItem(null); setIsNewItem(false); }} style={st.closeBtn}><X size={20} /></button>
            </div>
            <div style={st.form}>
              {/* Category */}
              <label style={st.fieldLabel}>Category</label>
              <select value={editModalItem.category_id || ''} onChange={e => setEditModalItem({ ...editModalItem, category_id: parseInt(e.target.value) })} style={st.input}>
                <option value="">Select Category</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>

              {/* Name */}
              <label style={st.fieldLabel}>Name</label>
              <input placeholder="${singular} Name" value={editModalItem.name || ''} onChange={e => setEditModalItem({ ...editModalItem, name: e.target.value })} style={st.input} />

              {/* Price */}
              <label style={st.fieldLabel}>Price</label>
              <input placeholder="0.00" type="number" step="0.01" value={editModalItem.price || ''} onChange={e => setEditModalItem({ ...editModalItem, price: e.target.value })} style={st.input} />

              {/* Description */}
              <label style={st.fieldLabel}>Description</label>
              <textarea placeholder="Description" value={editModalItem.description || ''} onChange={e => setEditModalItem({ ...editModalItem, description: e.target.value })} style={{ ...st.input, minHeight: '80px', resize: 'vertical' }} />

              {/* Image URL */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={st.fieldLabel}>Image URL</label>
                <button type="button" onClick={() => setShowAssetPicker(!showAssetPicker)} style={st.browseBtn}>
                  <FolderOpen size={12} /> {showAssetPicker ? 'Hide' : 'Browse'} Assets
                </button>
              </div>
              <input placeholder="https://..." value={editModalItem.image_url || ''} onChange={e => setEditModalItem({ ...editModalItem, image_url: e.target.value })} style={st.input} />
              {showAssetPicker && (
                <div style={st.assetPicker}>
                  <div style={st.assetPickerGrid}>
                    {allSampleImages.map((img, i) => (
                      <div key={i} onClick={() => { setEditModalItem({ ...editModalItem, image_url: img.url }); setShowAssetPicker(false); }} style={{ ...st.assetPickerItem, border: editModalItem.image_url === img.url ? '2px solid ${primaryColor}' : '2px solid transparent' }}>
                        <img src={img.url} alt={img.label} style={st.assetPickerImg} />
                        <span style={st.assetPickerLabel}>{img.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {editModalItem.image_url && !showAssetPicker && (
                <div style={st.imagePreview}>
                  <img src={editModalItem.image_url} alt="Preview" style={st.imagePreviewImg} onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                  <div style={{ ...st.imagePreviewFallback, display: 'none' }}>Invalid image URL</div>
                </div>
              )}

              {/* Popular toggle */}
              <label style={st.toggleRow}>
                <input type="checkbox" checked={editModalItem.popular || false} onChange={e => setEditModalItem({ ...editModalItem, popular: e.target.checked })} />
                <Star size={14} style={{ color: '#f59e0b' }} /> Popular / Featured
              </label>

              {/* Dietary flags (menu only) */}
              ${isMenu ? `{IS_MENU && (
                <div style={st.dietarySection}>
                  <label style={st.fieldLabel}>Dietary Flags</label>
                  <div style={st.dietaryGrid}>
                    {[
                      ['vegetarian', 'Vegetarian', '#22c55e'],
                      ['vegan', 'Vegan', '#059669'],
                      ['glutenFree', 'Gluten-Free', '#9333ea'],
                      ['spicy', 'Spicy', '#ef4444']
                    ].map(([key, lbl, color]) => (
                      <label key={key} style={st.dietaryCheck}>
                        <input type="checkbox" checked={editModalItem.dietary_flags?.[key] || false} onChange={e => setEditModalItem({ ...editModalItem, dietary_flags: { ...editModalItem.dietary_flags, [key]: e.target.checked } })} />
                        <span style={{ color }}>{lbl}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}` : ''}

              <button onClick={() => saveItem(editModalItem)} style={st.saveBtn}>
                <Save size={16} /> {isNewItem ? 'Add' : 'Save'} ${singular}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const st = {
  container: { padding: 0 },
  loading: { padding: '40px', textAlign: 'center', color: '#6b7280' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  title: { fontSize: '24px', fontWeight: '700', margin: 0, color: '#111827' },
  subtitle: { fontSize: '14px', color: '#6b7280', marginTop: '4px' },
  headerActions: { display: 'flex', alignItems: 'center', gap: '12px' },
  viewToggle: { display: 'flex', background: '#f3f4f6', borderRadius: '8px', padding: '2px' },
  viewBtn: { display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: 'none', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', color: '#6b7280', whiteSpace: 'nowrap' },
  viewBtnActive: { background: '#fff', color: '#111827', boxShadow: '0 1px 2px rgba(0,0,0,0.08)' },
  addBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', background: '${primaryColor}', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  samplesBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', background: '#fff', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },

  /* Editor styles */
  category: { background: '#fff', borderRadius: '12px', marginBottom: '16px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  categoryHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' },
  categoryInfo: { display: 'flex', alignItems: 'center', gap: '12px' },
  categoryTitle: { fontSize: '16px', fontWeight: '600', margin: 0 },
  categoryCount: { fontSize: '12px', color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: '12px' },
  items: { padding: '8px' },
  item: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.15s' },
  itemInfo: { display: 'flex', alignItems: 'center', gap: '10px' },
  itemThumb: { width: '48px', height: '36px', objectFit: 'cover', borderRadius: '4px', background: '#f3f4f6' },
  itemThumbPlaceholder: { width: '48px', height: '36px', borderRadius: '4px', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d1d5db' },
  itemNameRow: { display: 'flex', alignItems: 'center', gap: '6px' },
  itemName: { fontWeight: '500', fontSize: '14px' },
  itemPrice: { color: '#6b7280', fontSize: '13px' },
  itemActions: { display: 'flex', gap: '4px' },
  iconBtn: { padding: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', borderRadius: '4px' },

  /* Preview styles */
  previewContainer: { background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', position: 'sticky', top: '20px' },
  previewHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' },
  previewTitle: { margin: 0, fontSize: '16px', fontWeight: '600', color: '#111827' },
  previewSearchBox: { display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#f9fafb' },
  previewSearchInput: { border: 'none', outline: 'none', background: 'none', fontSize: '13px', width: '140px' },
  previewTabs: { display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px', borderBottom: '1px solid #f3f4f6' },
  previewTab: { padding: '6px 14px', borderRadius: '20px', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: '13px', color: '#6b7280', whiteSpace: 'nowrap' },
  previewTabActive: { background: '${primaryColor}', color: '#fff', border: '1px solid ${primaryColor}' },
  previewGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' },
  previewCard: { borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb', cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.2s', position: 'relative' },
  previewImageWrap: { position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: '#f9fafb' },
  previewImage: { width: '100%', height: '100%', objectFit: 'cover' },
  previewImageFallback: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' },
  previewBadge: { position: 'absolute', top: '8px', left: '8px', display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '6px', background: '${primaryColor}', color: '#fff', fontSize: '11px', fontWeight: '600' },
  previewCardOverlay: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#fff', fontSize: '14px', fontWeight: '500', opacity: 0, transition: 'opacity 0.2s' },
  previewCardBody: { padding: '12px' },
  previewCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' },
  previewCardName: { fontWeight: '600', fontSize: '14px', color: '#111827' },
  previewCardPrice: { fontWeight: '600', fontSize: '14px', color: '${primaryColor}' },
  previewDietary: { display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '4px' },
  dietaryIcon: { display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '1px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '500' },
  previewCardDesc: { margin: 0, fontSize: '12px', color: '#6b7280', lineHeight: '1.4', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' },

  /* Modal styles */
  modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '520px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' },
  form: { display: 'flex', flexDirection: 'column', gap: '10px' },
  fieldLabel: { fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '-4px' },
  input: { padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' },
  imagePreview: { borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb', height: '120px' },
  imagePreviewImg: { width: '100%', height: '100%', objectFit: 'cover' },
  imagePreviewFallback: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontSize: '13px', background: '#fef2f2' },
  toggleRow: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer', padding: '4px 0' },
  dietarySection: { borderTop: '1px solid #f3f4f6', paddingTop: '12px', marginTop: '4px' },
  dietaryGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' },
  dietaryCheck: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' },
  saveBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px', background: '${primaryColor}', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', marginTop: '8px' },

  /* Asset picker styles */
  browseBtn: { display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: '#6b7280' },
  assetPicker: { border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px', maxHeight: '200px', overflowY: 'auto', background: '#f9fafb' },
  assetPickerGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px' },
  assetPickerItem: { borderRadius: '6px', overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.15s', background: '#fff' },
  assetPickerImg: { width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' },
  assetPickerLabel: { display: 'block', fontSize: '10px', color: '#6b7280', padding: '2px 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },

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

const API_BASE = (import.meta.env.VITE_API_URL || '') + '/api/${moduleName}';

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

const API_BASE = (import.meta.env.VITE_API_URL || '') + '/api/${moduleName}';

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

const API_BASE = (import.meta.env.VITE_API_URL || '') + '/api/${moduleName}';
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
                {inquiry.items && inquiry.items.length > 0 && (
                  <div style={styles.orderItems}>
                    <div style={styles.orderItemsHeader}>
                      <span style={styles.orderItemsLabel}>Order Items</span>
                      <span style={styles.orderTotal}>Total: \${typeof inquiry.total === 'number' ? inquiry.total.toFixed(2) : inquiry.total || '—'}</span>
                    </div>
                    {inquiry.items.map((item, idx) => (
                      <div key={idx} style={styles.orderItemRow}>
                        <span>{item.quantity || 1}x {item.name}</span>
                        <span>\${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
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
  orderItems: { background: '#f3f4f6', borderRadius: '8px', padding: '14px', marginBottom: '12px' },
  orderItemsHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb' },
  orderItemsLabel: { fontWeight: '600', fontSize: '13px', color: '#374151' },
  orderTotal: { fontWeight: '700', fontSize: '14px', color: '${primaryColor}' },
  orderItemRow: { display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '13px', color: '#4b5563' },
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

const API_BASE = (import.meta.env.VITE_API_URL || '') + '/api/${moduleName}';

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

// ============================================
// AI COSTS PAGE
// ============================================

function generateAICostsPage(businessName, primaryColor) {
  return `import React, { useState, useEffect } from 'react';
import { DollarSign, Activity, Cpu, Wrench, Clock, RefreshCw } from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || '') + '/api/admin';

function formatCost(cost) {
  return '$' + (Number(cost) || 0).toFixed(4);
}

function getCost(obj) {
  return obj.cost != null ? obj.cost : obj.totalCost || 0;
}

function formatTokens(n) {
  if (!n) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + 'm ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  return Math.floor(hrs / 24) + 'd ago';
}

export default function AICosts() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchUsage() {
    try {
      const res = await fetch(\`\${API_BASE}/ai/usage\`);
      const json = await res.json();
      if (json.success) setData(json);
      else setError('Failed to load usage data');
    } catch (err) {
      setError('Could not reach API');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsage();
    const interval = setInterval(fetchUsage, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div style={styles.loading}>Loading AI cost data\u2026</div>;
  if (error) return <div style={styles.loading}>{error}</div>;

  const totals = data.totals || {};
  const byAgent = (Array.isArray(data.byAgent)
    ? data.byAgent
    : Object.entries(data.byAgent || {}).map(([id, v]) => ({ agentId: id, ...v }))
  ).sort((a, b) => getCost(b) - getCost(a));
  const byDay = (Array.isArray(data.byDay)
    ? data.byDay
    : Object.entries(data.byDay || {}).map(([date, v]) => ({ date, ...v }))
  ).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const recentCalls = Array.isArray(data.recentCalls) ? data.recentCalls : [];
  const today = new Date().toISOString().split('T')[0];

  const summaryCards = [
    { label: 'Total Calls', value: totals.calls, icon: Activity, color: '#3b82f6' },
    { label: 'Total Tokens', value: formatTokens(totals.inputTokens + totals.outputTokens), icon: Cpu, color: '#8b5cf6' },
    { label: 'Total Cost', value: formatCost(getCost(totals)), icon: DollarSign, color: '#10b981' },
    { label: 'Tool Calls', value: totals.toolCalls, icon: Wrench, color: '#f59e0b' }
  ];

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>AI Costs</h1>
          <p style={styles.subtitle}>Usage and spending across all AI agents</p>
        </div>
        <button onClick={() => { setLoading(true); fetchUsage(); }} style={styles.refreshBtn}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div style={styles.cardRow}>
        {summaryCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} style={styles.summaryCard}>
              <div style={{ ...styles.iconCircle, background: card.color + '18', color: card.color }}>
                <Icon size={22} />
              </div>
              <div style={styles.cardValue}>{card.value}</div>
              <div style={styles.cardLabel}>{card.label}</div>
            </div>
          );
        })}
      </div>

      {/* Per-Agent Breakdown */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Per-Agent Breakdown</h2>
        {byAgent.length === 0 ? (
          <div style={styles.empty}>No agent usage yet</div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Agent</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Calls</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Input Tokens</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Output Tokens</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Tool Calls</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Cost</th>
                </tr>
              </thead>
              <tbody>
                {byAgent.map((row, i) => (
                  <tr key={i} style={i % 2 === 0 ? {} : styles.altRow}>
                    <td style={styles.td}>
                      <span style={{ ...styles.agentBadge, background: '${primaryColor}18', color: '${primaryColor}' }}>{row.agentName || row.agentId}</span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>{row.calls}</td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>{formatTokens(row.inputTokens)}</td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>{formatTokens(row.outputTokens)}</td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>{row.toolCalls}</td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '600' }}>{formatCost(getCost(row))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Per-Day Breakdown */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Per-Day Breakdown</h2>
        {byDay.length === 0 ? (
          <div style={styles.empty}>No daily data yet</div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Date</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Calls</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Input Tokens</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Output Tokens</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Tool Calls</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Cost</th>
                </tr>
              </thead>
              <tbody>
                {byDay.map((row, i) => (
                  <tr key={i} style={row.date === today ? styles.todayRow : (i % 2 === 0 ? {} : styles.altRow)}>
                    <td style={styles.td}>
                      {row.date}
                      {row.date === today && <span style={styles.todayBadge}>Today</span>}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>{row.calls}</td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>{formatTokens(row.inputTokens)}</td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>{formatTokens(row.outputTokens)}</td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>{row.toolCalls}</td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '600' }}>{formatCost(getCost(row))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Calls */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Recent Calls</h2>
        {recentCalls.length === 0 ? (
          <div style={styles.empty}>No calls recorded yet. Chat with an AI agent to see usage here.</div>
        ) : (
          <div style={{ ...styles.tableWrap, maxHeight: '480px', overflowY: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Time</th>
                  <th style={styles.th}>Agent</th>
                  <th style={styles.th}>Model</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>In Tokens</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Out Tokens</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Tools</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Cost</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Duration</th>
                </tr>
              </thead>
              <tbody>
                {recentCalls.slice(0, 50).map((call, i) => (
                  <tr key={i} style={i % 2 === 0 ? {} : styles.altRow}>
                    <td style={{ ...styles.td, whiteSpace: 'nowrap' }}>
                      <Clock size={12} style={{ marginRight: '4px', opacity: 0.5, verticalAlign: 'middle' }} />
                      {timeAgo(call.timestamp)}
                    </td>
                    <td style={styles.td}>{call.agentName || call.agentId}</td>
                    <td style={{ ...styles.td, fontSize: '12px', color: '#6b7280' }}>{(call.model || '').split('-').slice(-1)[0]}</td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>{formatTokens(call.inputTokens)}</td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>{formatTokens(call.outputTokens)}</td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>{call.toolCalls || 0}</td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '600' }}>{formatCost(getCost(call))}</td>
                    <td style={{ ...styles.td, textAlign: 'right', color: '#6b7280' }}>{call.durationMs ? (call.durationMs / 1000).toFixed(1) + 's' : '\u2014'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { padding: '32px', maxWidth: '1200px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  title: { fontSize: '24px', fontWeight: '700', margin: 0, color: '#111827' },
  subtitle: { color: '#6b7280', fontSize: '14px', marginTop: '4px' },
  refreshBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px',
    background: '#fff', cursor: 'pointer', fontSize: '13px', color: '#374151'
  },
  loading: { padding: '60px 20px', textAlign: 'center', color: '#6b7280' },

  cardRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' },
  summaryCard: {
    background: '#fff', borderRadius: '12px', padding: '20px',
    border: '1px solid #e5e7eb', textAlign: 'center'
  },
  iconCircle: {
    width: '44px', height: '44px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 12px'
  },
  cardValue: { fontSize: '28px', fontWeight: '700', color: '#111827' },
  cardLabel: { fontSize: '13px', color: '#6b7280', marginTop: '4px' },

  section: { marginBottom: '32px' },
  sectionTitle: { fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#111827' },
  tableWrap: { background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
  th: {
    padding: '12px 16px', textAlign: 'left', fontWeight: '600',
    fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em',
    color: '#6b7280', borderBottom: '1px solid #e5e7eb', background: '#f9fafb',
    position: 'sticky', top: 0
  },
  td: { padding: '10px 16px', borderBottom: '1px solid #f3f4f6', color: '#374151' },
  altRow: { background: '#f9fafb' },
  todayRow: { background: '${primaryColor}08' },
  todayBadge: {
    marginLeft: '8px', padding: '2px 8px', borderRadius: '9999px',
    fontSize: '11px', fontWeight: '600',
    background: '${primaryColor}18', color: '${primaryColor}'
  },
  agentBadge: {
    padding: '3px 10px', borderRadius: '9999px', fontSize: '13px', fontWeight: '500'
  },
  empty: { padding: '40px 20px', textAlign: 'center', color: '#9ca3af', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb' }
};
`;
}

// ============================================
// WEBSITE EDITOR PAGE
// ============================================

/**
 * Get page schema for an industry - defines which sections each page has and their field types
 */
function getPageSchema(industryId) {
  // Common sections across all industries
  const homeBase = {
    hero: {
      label: 'Hero Section',
      fields: {
        headline: { type: 'text', label: 'Headline' },
        tagline: { type: 'textarea', label: 'Tagline' },
        backgroundImage: { type: 'image', label: 'Background Image' },
        ctaText: { type: 'text', label: 'CTA Button Text' },
        ctaPath: { type: 'text', label: 'CTA Link Path' }
      }
    },
    features: {
      label: 'Features / Highlights',
      type: 'array',
      itemFields: {
        icon: { type: 'text', label: 'Icon (emoji or name)' },
        title: { type: 'text', label: 'Title' },
        description: { type: 'textarea', label: 'Description' }
      }
    },
    reviews: {
      label: 'Customer Reviews',
      type: 'array',
      itemFields: {
        text: { type: 'textarea', label: 'Review Text' },
        author: { type: 'text', label: 'Author Name' },
        rating: { type: 'number', label: 'Rating (1-5)' }
      }
    },
    faq: {
      label: 'FAQ',
      type: 'array',
      itemFields: {
        question: { type: 'text', label: 'Question' },
        answer: { type: 'textarea', label: 'Answer' }
      }
    },
    gallery: {
      label: 'Gallery',
      type: 'array',
      itemFields: {
        src: { type: 'image', label: 'Image URL' },
        caption: { type: 'text', label: 'Caption' }
      }
    }
  };

  const aboutSection = {
    story: {
      label: 'Our Story',
      fields: {
        heading: { type: 'text', label: 'Heading' },
        text: { type: 'textarea', label: 'Story Text' },
        image: { type: 'image', label: 'Story Image' }
      }
    },
    values: {
      label: 'Values',
      type: 'array',
      itemFields: {
        icon: { type: 'text', label: 'Icon' },
        title: { type: 'text', label: 'Title' },
        description: { type: 'textarea', label: 'Description' }
      }
    },
    timeline: {
      label: 'Timeline',
      type: 'array',
      itemFields: {
        year: { type: 'text', label: 'Year' },
        title: { type: 'text', label: 'Title' },
        description: { type: 'text', label: 'Description' }
      }
    },
    team: {
      label: 'Team Members',
      type: 'array',
      itemFields: {
        name: { type: 'text', label: 'Name' },
        role: { type: 'text', label: 'Role' },
        bio: { type: 'textarea', label: 'Bio' },
        image: { type: 'image', label: 'Photo' }
      }
    }
  };

  const contactSection = {
    info: {
      label: 'Contact Information',
      fields: {
        phone: { type: 'text', label: 'Phone' },
        email: { type: 'text', label: 'Email' },
        address: { type: 'textarea', label: 'Address' },
      }
    }
  };

  const galleryPage = {
    hero: {
      label: 'Gallery Header',
      fields: {
        title: { type: 'text', label: 'Title' },
        subtitle: { type: 'text', label: 'Subtitle' }
      }
    },
    images: {
      label: 'Gallery Images',
      type: 'array',
      itemFields: {
        src: { type: 'image', label: 'Image URL' },
        caption: { type: 'text', label: 'Caption' }
      }
    }
  };

  const servicePage = {
    hero: {
      label: 'Page Header',
      fields: {
        title: { type: 'text', label: 'Title' },
        subtitle: { type: 'text', label: 'Subtitle' }
      }
    },
    categories: {
      label: 'Service Categories',
      type: 'array',
      itemFields: {
        name: { type: 'text', label: 'Category Name' },
        items: {
          type: 'array', label: 'Items',
          itemFields: {
            name: { type: 'text', label: 'Name' },
            description: { type: 'text', label: 'Description' },
            price: { type: 'text', label: 'Price' },
            image: { type: 'image', label: 'Image' }
          }
        }
      }
    }
  };

  const globalSection = {
    navbar: {
      label: 'Navigation Bar',
      fields: {
        logoText: { type: 'text', label: 'Logo Text' },
        phone: { type: 'text', label: 'Phone Number' },
        ctaText: { type: 'text', label: 'CTA Button Text' },
        ctaPath: { type: 'text', label: 'CTA Link Path' }
      }
    },
    footer: {
      label: 'Footer',
      fields: {
        tagline: { type: 'textarea', label: 'Tagline' },
        phone: { type: 'text', label: 'Phone' },
        email: { type: 'text', label: 'Email' },
        address: { type: 'textarea', label: 'Address' },
        trustText: { type: 'text', label: 'Trust Badge Text' }
      }
    }
  };

  // Use the INDUSTRY_PAGES constant passed in or use sensible defaults
  const pageList = INDUSTRY_PAGES_MAP[industryId] || ['home', 'about', 'contact'];

  const schema = { home: homeBase, about: aboutSection, contact: contactSection };
  const serviceKeys = ['menu', 'services', 'classes', 'features', 'products', 'programs'];

  const teamPage = {
    hero: {
      label: 'Page Header',
      fields: {
        title: { type: 'text', label: 'Title' },
        subtitle: { type: 'text', label: 'Subtitle' }
      }
    },
    members: {
      label: 'Team Members',
      type: 'array',
      itemFields: {
        name: { type: 'text', label: 'Name' },
        role: { type: 'text', label: 'Role / Title' },
        bio: { type: 'textarea', label: 'Bio' },
        image: { type: 'image', label: 'Photo' },
        credentials: { type: 'text', label: 'Credentials (comma-separated)' }
      }
    }
  };

  for (const p of pageList) {
    if (serviceKeys.includes(p)) {
      schema[p] = servicePage;
    } else if (p === 'gallery') {
      schema.gallery = galleryPage;
    } else if (p === 'team') {
      schema.team = teamPage;
    }
    // home, about, contact already handled above
  }

  schema._global = globalSection;
  return schema;
}

/**
 * Generate the Website Editor admin page
 */
function generateWebsiteEditorPage(businessName, primaryColor, industryId, menuStyleId = 'photo-grid') {
  const pageList = INDUSTRY_PAGES_MAP[industryId] || ['home', 'about', 'contact'];

  // Add _global to tabs
  const allTabs = [...pageList.filter(p => !['order', 'book', 'reservations', 'membership', 'consultation', 'quote', 'appointment', 'demo', 'cart', 'account', 'admissions', 'calendar', 'valuation', 'schedule', 'pricing', 'areas', 'listings'].includes(p)), '_global'];

  const tabsJson = JSON.stringify(allTabs);

  // Determine which tab is the "service" page that gets the visual menu editor
  const serviceKeys = ['menu', 'services', 'classes', 'features', 'products', 'programs'];
  const servicePageKey = allTabs.find(t => serviceKeys.includes(t)) || null;

  // Generate visual menu editor JSX for the matching style
  const visualEditorJsx = servicePageKey ? generateVisualMenuEditor(menuStyleId, primaryColor) : '';

  return `/**
 * WebsiteEditor - Visual content editor for ${businessName}
 * Edit all page sections (text, images, reviews, FAQ, etc.)
 * Changes persist to brain.json and sync to the customer site in real-time.
 * Generated by Launchpad
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Globe, Save, X, Plus, Trash2, ChevronDown, ChevronUp, ExternalLink, Image, Edit3, RefreshCw, Camera } from 'lucide-react';

const PAGE_TABS = ${tabsJson};
const SERVICE_PAGE_KEY = ${servicePageKey ? `'${servicePageKey}'` : 'null'};
const SERVICE_KEYS = ['menu', 'services', 'classes', 'features', 'products', 'programs'];

// Page-level section schemas (drives which fields appear for each section)
const SECTION_SCHEMAS = ${generateSectionSchemaJson(industryId)};

/* ─── EditableText ─── */
function EditableText({ value, onChange, style = {}, tag = 'span', placeholder = 'Click to edit' }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');
  const inputRef = useRef(null);

  useEffect(() => { setDraft(value || ''); }, [value]);
  useEffect(() => { if (editing && inputRef.current) inputRef.current.focus(); }, [editing]);

  const commit = () => { setEditing(false); if (draft !== value) onChange(draft); };
  const cancel = () => { setEditing(false); setDraft(value || ''); };
  const handleKey = (e) => { if (e.key === 'Enter' && tag !== 'p') commit(); if (e.key === 'Escape') cancel(); };

  if (editing) {
    const baseStyle = { ...style, border: '2px solid ${primaryColor}', borderRadius: '4px', outline: 'none', background: '#fff', padding: '2px 6px', boxSizing: 'border-box', width: '100%', fontFamily: 'inherit' };
    if (tag === 'p') {
      return <textarea ref={inputRef} value={draft} onChange={e => setDraft(e.target.value)} onBlur={commit} onKeyDown={e => { if (e.key === 'Escape') cancel(); }} style={{ ...baseStyle, resize: 'vertical', minHeight: '60px' }} />;
    }
    return <input ref={inputRef} value={draft} onChange={e => setDraft(e.target.value)} onBlur={commit} onKeyDown={handleKey} style={baseStyle} />;
  }

  const displayStyle = { ...style, cursor: 'text', borderBottom: '1px dashed #d1d5db', minWidth: '40px', display: 'inline-block' };
  const Tag = tag;
  return <Tag style={displayStyle} onClick={() => setEditing(true)} title="Click to edit">{value || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>{placeholder}</span>}</Tag>;
}

/* ─── EditableImage ─── */
function EditableImage({ src, alt, onChangeSrc, style = {}, containerStyle = {} }) {
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [draft, setDraft] = useState(src || '');
  const inputRef = useRef(null);

  useEffect(() => { setDraft(src || ''); }, [src]);
  useEffect(() => { if (showUrlInput && inputRef.current) inputRef.current.focus(); }, [showUrlInput]);

  const commit = () => { setShowUrlInput(false); if (draft !== src) onChangeSrc(draft); };
  const cancel = () => { setShowUrlInput(false); setDraft(src || ''); };

  return (
    <div style={{ position: 'relative', ...containerStyle }}>
      <img src={src || 'https://placehold.co/400x300?text=No+Image'} alt={alt || ''} style={style} onError={e => { e.target.src = 'https://placehold.co/400x300?text=No+Image'; }} />
      <button onClick={() => setShowUrlInput(true)} style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Change image"><Camera size={14} /></button>
      {showUrlInput && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: style.borderRadius || 0, padding: 12 }}>
          <input ref={inputRef} value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') cancel(); }} placeholder="Paste image URL..." style={{ width: '90%', padding: '8px', borderRadius: '6px', border: 'none', fontSize: '13px' }} />
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={commit} style={{ padding: '4px 14px', background: '${primaryColor}', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Save</button>
            <button onClick={cancel} style={{ padding: '4px 14px', background: '#fff', color: '#333', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

${visualEditorJsx}

export default function WebsiteEditor() {
  const [content, setContent] = useState(null);
  const [activePage, setActivePage] = useState('home');
  const [editingSection, setEditingSection] = useState(null);
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch content from API
  const fetchContent = useCallback(() => {
    setLoading(true);
    fetch((import.meta.env.VITE_API_URL || '') + '/api/content')
      .then(r => r.json())
      .then(data => {
        if (data.success) setContent(data.content);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchContent(); }, [fetchContent]);

  const pageData = content?.pages?.[activePage] || {};
  const schema = SECTION_SCHEMAS[activePage] || {};

  // Start editing a section
  const startEdit = (sectionKey) => {
    setEditingSection(sectionKey);
    setEditData(JSON.parse(JSON.stringify(pageData[sectionKey] || getDefault(schema[sectionKey]))));
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingSection(null);
    setEditData(null);
  };

  // Save section
  const saveSection = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + \`/api/content/\${activePage}/\${editingSection}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: editData })
      });
      const result = await res.json();
      if (result.success) {
        setMessage({ type: 'success', text: 'Saved!' });
        // Update local state
        setContent(prev => ({
          ...prev,
          pages: {
            ...prev.pages,
            [activePage]: {
              ...prev.pages[activePage],
              [editingSection]: editData
            }
          }
        }));
        setEditingSection(null);
        setEditData(null);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to save' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Network error' });
    }
    setSaving(false);
    setTimeout(() => setMessage(null), 3000);
  };

  // Get default value for a schema section
  function getDefault(schemaDef) {
    if (!schemaDef) return {};
    if (schemaDef.type === 'array') return [];
    const obj = {};
    if (schemaDef.fields) {
      Object.keys(schemaDef.fields).forEach(k => { obj[k] = ''; });
    }
    return obj;
  }

  if (loading) {
    return (
      <div style={styles.loading}>
        <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
        <p>Loading content...</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div style={styles.loading}>
        <p>Could not load content. Make sure the backend is running.</p>
        <button onClick={fetchContent} style={styles.retryBtn}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <Globe size={24} color={'${primaryColor}'} />
          <div>
            <h1 style={styles.title}>Website Editor</h1>
            <p style={styles.subtitle}>Edit your site content — changes go live instantly</p>
          </div>
        </div>
        <a href={import.meta.env.VITE_SITE_URL || '/'} target="_blank" rel="noopener noreferrer" style={styles.openSiteBtn}>
          <ExternalLink size={16} /> Open Site
        </a>
      </div>

      {/* Message */}
      {message && (
        <div style={{ ...styles.message, background: message.type === 'success' ? '#dcfce7' : '#fee2e2', color: message.type === 'success' ? '#166534' : '#991b1b' }}>
          {message.text}
        </div>
      )}

      {/* Page Tabs */}
      <div style={styles.tabs}>
        {PAGE_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => { setActivePage(tab); setEditingSection(null); }}
            style={{ ...styles.tab, ...(activePage === tab ? styles.tabActive : {}) }}
          >
            {tab === '_global' ? 'Global' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Section Cards or Visual Menu Editor */}
      {SERVICE_KEYS.includes(activePage) ? (
        <VisualMenuEditor content={content} activePage={activePage} setContent={setContent} setMessage={setMessage} />
      ) : (
      <div style={styles.sections}>
        {Object.entries(schema).map(([sectionKey, schemaDef]) => {
          const data = pageData[sectionKey];
          const isEditing = editingSection === sectionKey;

          return (
            <div key={sectionKey} style={{ ...styles.card, ...(isEditing ? styles.cardEditing : {}) }}>
              {/* Card Header */}
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>{schemaDef.label || sectionKey}</h3>
                {!isEditing ? (
                  <button onClick={() => startEdit(sectionKey)} style={styles.editBtn}>
                    <Edit3 size={14} /> Edit
                  </button>
                ) : (
                  <div style={styles.editActions}>
                    <button onClick={saveSection} disabled={saving} style={styles.saveBtn}>
                      <Save size={14} /> {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={cancelEdit} style={styles.cancelBtn}>
                      <X size={14} /> Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Card Body */}
              {isEditing ? (
                <div style={styles.cardBody}>
                  {schemaDef.type === 'array' ? (
                    <ArrayEditor
                      items={editData || []}
                      itemFields={schemaDef.itemFields}
                      onChange={setEditData}
                    />
                  ) : (
                    <FieldEditor
                      data={editData || {}}
                      fields={schemaDef.fields || {}}
                      onChange={setEditData}
                    />
                  )}
                </div>
              ) : (
                <div style={styles.cardPreview}>
                  <SectionPreview data={data} schema={schemaDef} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}

/* ─── Sub-components ─── */

function SectionPreview({ data, schema }) {
  if (!data) return <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>No content yet — click Edit to add</span>;

  if (schema.type === 'array' && Array.isArray(data)) {
    if (data.length === 0) return <span style={{ color: '#9ca3af' }}>No items</span>;
    const firstField = Object.keys(schema.itemFields || {})[0];
    return (
      <div>
        {data.slice(0, 3).map((item, i) => (
          <div key={i} style={styles.previewItem}>
            {typeof item === 'object' ? (item[firstField] || item.name || item.title || item.text || JSON.stringify(item).slice(0, 60)) : String(item)}
          </div>
        ))}
        {data.length > 3 && <span style={{ color: '#9ca3af', fontSize: '13px' }}>+ {data.length - 3} more</span>}
      </div>
    );
  }

  if (typeof data === 'object') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {Object.entries(data).slice(0, 4).map(([k, v]) => (
          <div key={k} style={styles.previewField}>
            <span style={styles.previewLabel}>{k}:</span>
            {schema.fields?.[k]?.type === 'image' && v ? (
              <img src={v} alt={k} style={styles.previewThumb} onError={(e) => { e.target.style.display = 'none'; }} />
            ) : (
              <span style={styles.previewValue}>{typeof v === 'object' ? JSON.stringify(v).slice(0, 60) : String(v || '').slice(0, 80)}</span>
            )}
          </div>
        ))}
      </div>
    );
  }

  return <span>{String(data).slice(0, 100)}</span>;
}

function FieldEditor({ data, fields, onChange }) {
  const update = (key, value) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {Object.entries(fields).map(([key, fieldDef]) => (
        <div key={key}>
          <label style={styles.fieldLabel}>{fieldDef.label || key}</label>
          {fieldDef.type === 'textarea' ? (
            <textarea
              value={data[key] || ''}
              onChange={e => update(key, e.target.value)}
              rows={3}
              style={styles.textarea}
            />
          ) : fieldDef.type === 'image' ? (
            <div>
              <input
                type="url"
                value={data[key] || ''}
                onChange={e => update(key, e.target.value)}
                placeholder="https://..."
                style={styles.input}
              />
              {data[key] && (
                <img src={data[key]} alt="preview" style={styles.imagePreview} onError={(e) => { e.target.style.display = 'none'; }} />
              )}
            </div>
          ) : fieldDef.type === 'number' ? (
            <input
              type="number"
              value={data[key] || ''}
              onChange={e => update(key, e.target.value ? Number(e.target.value) : '')}
              style={styles.input}
            />
          ) : (
            <input
              type="text"
              value={data[key] || ''}
              onChange={e => update(key, e.target.value)}
              style={styles.input}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function ArrayEditor({ items, itemFields, onChange }) {
  const addItem = () => {
    const newItem = {};
    Object.keys(itemFields).forEach(k => {
      if (itemFields[k].type === 'array') newItem[k] = [];
      else newItem[k] = '';
    });
    onChange([...items, newItem]);
  };

  const removeItem = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const updated = items.map((item, i) => i === index ? { ...item, [field]: value } : item);
    onChange(updated);
  };

  const moveItem = (index, direction) => {
    const newItems = [...items];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    onChange(newItems);
  };

  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={styles.arrayItem}>
          <div style={styles.arrayItemHeader}>
            <span style={styles.arrayItemNum}>Item {i + 1}</span>
            <div style={styles.arrayItemActions}>
              <button onClick={() => moveItem(i, -1)} disabled={i === 0} style={styles.arrayMoveBtn} title="Move up">
                <ChevronUp size={14} />
              </button>
              <button onClick={() => moveItem(i, 1)} disabled={i === items.length - 1} style={styles.arrayMoveBtn} title="Move down">
                <ChevronDown size={14} />
              </button>
              <button onClick={() => removeItem(i)} style={styles.arrayDeleteBtn} title="Remove">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          <div style={styles.arrayItemFields}>
            {Object.entries(itemFields).map(([key, fieldDef]) => {
              if (fieldDef.type === 'array') {
                // Nested array (e.g., services within categories)
                return (
                  <div key={key} style={{ marginTop: '8px' }}>
                    <label style={styles.fieldLabel}>{fieldDef.label || key}</label>
                    <ArrayEditor
                      items={item[key] || []}
                      itemFields={fieldDef.itemFields}
                      onChange={(newVal) => updateItem(i, key, newVal)}
                    />
                  </div>
                );
              }
              return (
                <div key={key} style={{ flex: fieldDef.type === 'textarea' ? '1 1 100%' : '1 1 45%', minWidth: '150px' }}>
                  <label style={styles.fieldLabelSmall}>{fieldDef.label || key}</label>
                  {fieldDef.type === 'textarea' ? (
                    <textarea
                      value={item[key] || ''}
                      onChange={e => updateItem(i, key, e.target.value)}
                      rows={2}
                      style={styles.textareaSmall}
                    />
                  ) : fieldDef.type === 'image' ? (
                    <div>
                      <input
                        type="url"
                        value={item[key] || ''}
                        onChange={e => updateItem(i, key, e.target.value)}
                        placeholder="https://..."
                        style={styles.inputSmall}
                      />
                      {item[key] && <img src={item[key]} alt="" style={styles.thumbSmall} onError={e => { e.target.style.display='none'; }} />}
                    </div>
                  ) : fieldDef.type === 'number' ? (
                    <input
                      type="number"
                      value={item[key] || ''}
                      onChange={e => updateItem(i, key, e.target.value ? Number(e.target.value) : '')}
                      style={styles.inputSmall}
                    />
                  ) : (
                    <input
                      type="text"
                      value={item[key] || ''}
                      onChange={e => updateItem(i, key, e.target.value)}
                      style={styles.inputSmall}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <button onClick={addItem} style={styles.addBtn}>
        <Plus size={14} /> Add Item
      </button>
    </div>
  );
}

/* ─── Styles ─── */

const styles = {
  loading: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '16px', color: '#6b7280' },
  retryBtn: { padding: '8px 20px', background: '${primaryColor}', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },

  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  title: { fontSize: '24px', fontWeight: '700', margin: 0, color: '#111827' },
  subtitle: { fontSize: '14px', color: '#6b7280', margin: 0 },
  openSiteBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '${primaryColor}', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', textDecoration: 'none', fontSize: '14px', fontWeight: '500' },

  message: { padding: '10px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: '500' },

  tabs: { display: 'flex', gap: '4px', marginBottom: '24px', flexWrap: 'wrap', borderBottom: '2px solid #e5e7eb', paddingBottom: '0' },
  tab: { padding: '10px 20px', background: 'none', border: 'none', borderBottom: '2px solid transparent', marginBottom: '-2px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#6b7280', borderRadius: '8px 8px 0 0', transition: 'all 0.2s' },
  tabActive: { color: '${primaryColor}', borderBottomColor: '${primaryColor}', background: '${primaryColor}10' },

  sections: { display: 'flex', flexDirection: 'column', gap: '16px' },

  card: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', transition: 'box-shadow 0.2s' },
  cardEditing: { boxShadow: '0 0 0 2px ${primaryColor}40', borderColor: '${primaryColor}' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f3f4f6' },
  cardTitle: { fontSize: '15px', fontWeight: '600', margin: 0, color: '#111827' },
  cardBody: { padding: '20px' },
  cardPreview: { padding: '16px 20px', fontSize: '14px', color: '#374151' },

  editBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#374151' },
  editActions: { display: 'flex', gap: '8px' },
  saveBtn: { display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 14px', background: '${primaryColor}', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' },
  cancelBtn: { display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 14px', background: '#fff', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },

  fieldLabel: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' },
  fieldLabelSmall: { display: 'block', fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  inputSmall: { width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' },
  textareaSmall: { width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' },
  imagePreview: { marginTop: '8px', maxWidth: '200px', maxHeight: '120px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e5e7eb' },
  thumbSmall: { marginTop: '4px', maxWidth: '80px', maxHeight: '50px', borderRadius: '4px', objectFit: 'cover' },

  previewItem: { padding: '4px 0', fontSize: '14px', color: '#374151', borderBottom: '1px solid #f3f4f6' },
  previewField: { display: 'flex', gap: '8px', alignItems: 'flex-start' },
  previewLabel: { fontSize: '12px', fontWeight: '600', color: '#6b7280', minWidth: '80px' },
  previewValue: { fontSize: '13px', color: '#374151' },
  previewThumb: { width: '60px', height: '40px', borderRadius: '4px', objectFit: 'cover' },

  arrayItem: { border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px', marginBottom: '12px', background: '#fafafa' },
  arrayItemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  arrayItemNum: { fontSize: '13px', fontWeight: '600', color: '#6b7280' },
  arrayItemActions: { display: 'flex', gap: '4px' },
  arrayMoveBtn: { padding: '4px', background: 'none', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center' },
  arrayDeleteBtn: { padding: '4px', background: 'none', border: '1px solid #fca5a5', borderRadius: '4px', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center' },
  arrayItemFields: { display: 'flex', flexWrap: 'wrap', gap: '12px' },
  addBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#fff', border: '1px dashed #d1d5db', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#6b7280', width: '100%', justifyContent: 'center', marginTop: '4px' }
};
`;
}

/**
 * Generate the VisualMenuEditor component JSX
 * Dispatches to the correct style-specific renderer based on menuStyleId
 */
function generateVisualMenuEditor(menuStyleId, primaryColor) {
  const styleRenderer = {
    'photo-grid': generatePhotoGridEditorJsx,
    'elegant-list': generateElegantListEditorJsx,
    'compact-table': generateCompactTableEditorJsx,
    'storytelling-cards': generateStorytellingEditorJsx
  };

  const renderFn = styleRenderer[menuStyleId] || generatePhotoGridEditorJsx;
  const styleSpecificJsx = renderFn(primaryColor);

  return `
/* ─── VisualMenuEditor ─── */
function VisualMenuEditor({ content, activePage, setContent, setMessage }) {
  const pageData = content?.pages?.[activePage] || {};
  const [categories, setCategories] = useState(() => {
    const cats = pageData.categories;
    if (Array.isArray(cats) && cats.length > 0) return JSON.parse(JSON.stringify(cats));
    return [{ name: 'Main', items: [{ name: 'Sample Item', description: 'Description here', price: '10', image: '' }] }];
  });
  const [heroTitle, setHeroTitle] = useState(pageData.hero?.title || activePage.charAt(0).toUpperCase() + activePage.slice(1));
  const [heroSubtitle, setHeroSubtitle] = useState(pageData.hero?.subtitle || '');
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  // Re-sync when activePage changes
  useEffect(() => {
    const pd = content?.pages?.[activePage] || {};
    const cats = pd.categories;
    if (Array.isArray(cats) && cats.length > 0) setCategories(JSON.parse(JSON.stringify(cats)));
    else setCategories([{ name: 'Main', items: [{ name: 'Sample Item', description: 'Description here', price: '10', image: '' }] }]);
    setHeroTitle(pd.hero?.title || activePage.charAt(0).toUpperCase() + activePage.slice(1));
    setHeroSubtitle(pd.hero?.subtitle || '');
    setHasChanges(false);
  }, [activePage, content]);

  const markChanged = () => setHasChanges(true);

  // Category CRUD
  const updateCategoryName = (catIdx, name) => {
    setCategories(prev => prev.map((c, i) => i === catIdx ? { ...c, name } : c));
    markChanged();
  };
  const addCategory = () => {
    setCategories(prev => [...prev, { name: 'New Category', items: [] }]);
    markChanged();
  };
  const removeCategory = (catIdx) => {
    if (!confirm('Delete this category and all its items?')) return;
    setCategories(prev => prev.filter((_, i) => i !== catIdx));
    markChanged();
  };

  // Item CRUD
  const updateItem = (catIdx, itemIdx, field, value) => {
    setCategories(prev => prev.map((c, ci) => ci === catIdx ? {
      ...c, items: c.items.map((item, ii) => ii === itemIdx ? { ...item, [field]: value } : item)
    } : c));
    markChanged();
  };
  const addItem = (catIdx) => {
    setCategories(prev => prev.map((c, ci) => ci === catIdx ? {
      ...c, items: [...c.items, { name: 'New Item', description: '', price: '0', image: '' }]
    } : c));
    markChanged();
  };
  const removeItem = (catIdx, itemIdx) => {
    setCategories(prev => prev.map((c, ci) => ci === catIdx ? {
      ...c, items: c.items.filter((_, ii) => ii !== itemIdx)
    } : c));
    markChanged();
  };

  // Save
  const handleSave = async () => {
    setSaving(true);
    try {
      // Save hero
      await fetch((import.meta.env.VITE_API_URL || '') + \`/api/content/\${activePage}/hero\`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { title: heroTitle, subtitle: heroSubtitle } })
      });
      // Save categories
      const res = await fetch((import.meta.env.VITE_API_URL || '') + \`/api/content/\${activePage}/categories\`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: categories })
      });
      const result = await res.json();
      if (result.success) {
        setMessage({ type: 'success', text: 'Menu saved!' });
        setContent(prev => ({
          ...prev,
          pages: { ...prev.pages, [activePage]: { ...prev.pages[activePage], hero: { title: heroTitle, subtitle: heroSubtitle }, categories } }
        }));
        setHasChanges(false);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to save' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Network error saving menu' });
    }
    setSaving(false);
    setTimeout(() => setMessage(null), 3000);
  };

  // Discard
  const handleDiscard = () => {
    const pd = content?.pages?.[activePage] || {};
    const cats = pd.categories;
    if (Array.isArray(cats) && cats.length > 0) setCategories(JSON.parse(JSON.stringify(cats)));
    setHeroTitle(pd.hero?.title || activePage.charAt(0).toUpperCase() + activePage.slice(1));
    setHeroSubtitle(pd.hero?.subtitle || '');
    setHasChanges(false);
  };

  const editorProps = { categories, heroTitle, heroSubtitle, setHeroTitle: (v) => { setHeroTitle(v); markChanged(); }, setHeroSubtitle: (v) => { setHeroSubtitle(v); markChanged(); }, updateCategoryName, addCategory, removeCategory, updateItem, addItem, removeItem };

  return (
    <div>
      {/* Save Toolbar */}
      {hasChanges && (
        <div style={{ position: 'sticky', top: 0, zIndex: 20, background: '#fffbeb', border: '1px solid #fbbf24', borderRadius: '10px', padding: '10px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '14px', color: '#92400e', fontWeight: 500 }}>You have unsaved changes</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleDiscard} style={{ padding: '6px 14px', background: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', color: '#6b7280' }}>Discard</button>
            <button onClick={handleSave} disabled={saving} style={{ padding: '6px 14px', background: '${primaryColor}', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{saving ? 'Saving...' : '💾 Save'}</span>
            </button>
          </div>
        </div>
      )}

      ${styleSpecificJsx}
    </div>
  );
}
`;
}

/**
 * Photo Grid style visual editor JSX
 */
function generatePhotoGridEditorJsx(primaryColor) {
  return `
      {/* Photo Grid Editor */}
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <EditableText value={editorProps.heroTitle} onChange={editorProps.setHeroTitle} tag="h2" style={{ fontSize: '28px', fontWeight: 700, color: '#111827', margin: 0 }} placeholder="Page Title" />
        <EditableText value={editorProps.heroSubtitle} onChange={editorProps.setHeroSubtitle} tag="p" style={{ fontSize: '15px', color: '#6b7280', marginTop: '8px' }} placeholder="Subtitle or tagline" />
      </div>

      {editorProps.categories.map((cat, catIdx) => (
        <div key={catIdx} style={{ marginBottom: '32px' }}>
          {/* Category Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>
            <EditableText value={cat.name} onChange={(v) => editorProps.updateCategoryName(catIdx, v)} tag="h3" style={{ fontSize: '20px', fontWeight: 600, color: '#111827', margin: 0 }} placeholder="Category Name" />
            <button onClick={() => editorProps.removeCategory(catIdx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }} title="Delete category"><Trash2 size={16} /></button>
          </div>

          {/* Items Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {cat.items.map((item, itemIdx) => (
              <div key={itemIdx} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', position: 'relative' }}>
                {/* Remove button */}
                <button onClick={() => editorProps.removeItem(catIdx, itemIdx)} style={{ position: 'absolute', top: 8, right: 8, zIndex: 10, background: 'rgba(239,68,68,0.9)', color: '#fff', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }} title="Remove item">&times;</button>

                {/* Image */}
                <EditableImage src={item.image} alt={item.name} onChangeSrc={(v) => editorProps.updateItem(catIdx, itemIdx, 'image', v)} style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }} containerStyle={{ width: '100%' }} />

                {/* Content */}
                <div style={{ padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                    <EditableText value={item.name} onChange={(v) => editorProps.updateItem(catIdx, itemIdx, 'name', v)} tag="h3" style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0, flex: 1 }} placeholder="Item name" />
                    <EditableText value={item.price} onChange={(v) => editorProps.updateItem(catIdx, itemIdx, 'price', v)} tag="span" style={{ fontSize: '16px', fontWeight: 700, color: '${primaryColor}', whiteSpace: 'nowrap' }} placeholder="0" />
                  </div>
                  <EditableText value={item.description} onChange={(v) => editorProps.updateItem(catIdx, itemIdx, 'description', v)} tag="p" style={{ fontSize: '13px', color: '#6b7280', margin: 0, lineHeight: 1.4 }} placeholder="Item description" />
                </div>
              </div>
            ))}

            {/* Add Item Card */}
            <button onClick={() => editorProps.addItem(catIdx)} style={{ background: '#fafafa', borderRadius: '12px', border: '2px dashed #d1d5db', minHeight: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#9ca3af', gap: '8px', fontSize: '14px' }}>
              <Plus size={24} /> Add Item
            </button>
          </div>
        </div>
      ))}

      {/* Add Category */}
      <button onClick={editorProps.addCategory} style={{ width: '100%', padding: '14px', background: '#f9fafb', border: '2px dashed #d1d5db', borderRadius: '12px', cursor: 'pointer', color: '#6b7280', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
        <Plus size={16} /> Add Category
      </button>
  `;
}

/**
 * Elegant List style visual editor JSX
 */
function generateElegantListEditorJsx(primaryColor) {
  return `
      {/* Elegant List Editor */}
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <EditableText value={editorProps.heroTitle} onChange={editorProps.setHeroTitle} tag="h2" style={{ fontSize: '32px', fontWeight: 300, color: '#111827', margin: 0, fontFamily: 'Georgia, serif', letterSpacing: '2px' }} placeholder="Page Title" />
          <EditableText value={editorProps.heroSubtitle} onChange={editorProps.setHeroSubtitle} tag="p" style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px', fontStyle: 'italic', fontFamily: 'Georgia, serif' }} placeholder="Subtitle" />
        </div>

        {editorProps.categories.map((cat, catIdx) => (
          <div key={catIdx} style={{ marginBottom: '40px' }}>
            {/* Category Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '20px', position: 'relative' }}>
              <div style={{ flex: 1, height: '1px', background: '#d1d5db' }} />
              <EditableText value={cat.name} onChange={(v) => editorProps.updateCategoryName(catIdx, v)} tag="h3" style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280', margin: 0, textTransform: 'uppercase', letterSpacing: '3px', whiteSpace: 'nowrap' }} placeholder="Category" />
              <button onClick={() => editorProps.removeCategory(catIdx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '2px' }} title="Delete"><Trash2 size={14} /></button>
              <div style={{ flex: 1, height: '1px', background: '#d1d5db' }} />
            </div>

            {/* Items */}
            {cat.items.map((item, itemIdx) => (
              <div key={itemIdx} style={{ marginBottom: '16px', position: 'relative', paddingRight: '28px' }}>
                <button onClick={() => editorProps.removeItem(catIdx, itemIdx)} style={{ position: 'absolute', top: 0, right: 0, background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '2px', opacity: 0.6 }} title="Remove">&times;</button>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <EditableText value={item.name} onChange={(v) => editorProps.updateItem(catIdx, itemIdx, 'name', v)} tag="span" style={{ fontSize: '16px', fontWeight: 500, color: '#111827', fontFamily: 'Georgia, serif' }} placeholder="Item name" />
                  <span style={{ flex: 1, borderBottom: '1px dotted #d1d5db', minWidth: '20px', margin: '0 4px', alignSelf: 'flex-end', marginBottom: '4px' }} />
                  <EditableText value={item.price} onChange={(v) => editorProps.updateItem(catIdx, itemIdx, 'price', v)} tag="span" style={{ fontSize: '16px', fontWeight: 500, color: '#111827', fontFamily: 'Georgia, serif', whiteSpace: 'nowrap' }} placeholder="0" />
                </div>
                <EditableText value={item.description} onChange={(v) => editorProps.updateItem(catIdx, itemIdx, 'description', v)} tag="p" style={{ fontSize: '13px', color: '#9ca3af', margin: '4px 0 0', fontStyle: 'italic', fontFamily: 'Georgia, serif' }} placeholder="Description" />
              </div>
            ))}

            {/* Add Item */}
            <button onClick={() => editorProps.addItem(catIdx)} style={{ width: '100%', padding: '10px', background: 'none', border: '1px dashed #d1d5db', borderRadius: '4px', cursor: 'pointer', color: '#9ca3af', fontSize: '13px', marginTop: '8px' }}>
              + Add Item
            </button>
          </div>
        ))}

        {/* Add Category */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button onClick={editorProps.addCategory} style={{ padding: '10px 32px', background: 'none', border: '1px dashed #d1d5db', borderRadius: '4px', cursor: 'pointer', color: '#6b7280', fontSize: '13px', letterSpacing: '1px' }}>
            + Add Category
          </button>
        </div>
      </div>
  `;
}

/**
 * Compact Table style visual editor JSX
 */
function generateCompactTableEditorJsx(primaryColor) {
  return `
      {/* Compact Table Editor */}
      <div>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <EditableText value={editorProps.heroTitle} onChange={editorProps.setHeroTitle} tag="h2" style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: 0 }} placeholder="Page Title" />
          <EditableText value={editorProps.heroSubtitle} onChange={editorProps.setHeroSubtitle} tag="p" style={{ fontSize: '14px', color: '#6b7280', marginTop: '6px' }} placeholder="Subtitle" />
        </div>

        {editorProps.categories.map((cat, catIdx) => (
          <div key={catIdx} style={{ marginBottom: '28px' }}>
            {/* Category Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '${primaryColor}12', padding: '10px 14px', borderRadius: '8px 8px 0 0', borderBottom: '2px solid ${primaryColor}' }}>
              <EditableText value={cat.name} onChange={(v) => editorProps.updateCategoryName(catIdx, v)} tag="h3" style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: 0, textTransform: 'uppercase' }} placeholder="Category" />
              <button onClick={() => editorProps.removeCategory(catIdx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }} title="Delete category"><Trash2 size={14} /></button>
            </div>

            {/* Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f3f4f6' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', width: '48px' }}>Img</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Name</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Description</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280', width: '80px' }}>Price</th>
                  <th style={{ width: '36px' }}></th>
                </tr>
              </thead>
              <tbody>
                {cat.items.map((item, itemIdx) => (
                  <tr key={itemIdx} style={{ borderBottom: '1px solid #e5e7eb', background: itemIdx % 2 === 1 ? '#f9fafb' : '#fff' }}>
                    <td style={{ padding: '6px 12px' }}>
                      <EditableImage src={item.image} alt={item.name} onChangeSrc={(v) => editorProps.updateItem(catIdx, itemIdx, 'image', v)} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: '6px', display: 'block' }} containerStyle={{ width: 40, height: 40 }} />
                    </td>
                    <td style={{ padding: '6px 12px' }}>
                      <EditableText value={item.name} onChange={(v) => editorProps.updateItem(catIdx, itemIdx, 'name', v)} tag="span" style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }} placeholder="Item name" />
                    </td>
                    <td style={{ padding: '6px 12px' }}>
                      <EditableText value={item.description} onChange={(v) => editorProps.updateItem(catIdx, itemIdx, 'description', v)} tag="span" style={{ fontSize: '13px', color: '#6b7280' }} placeholder="Description" />
                    </td>
                    <td style={{ padding: '6px 12px', textAlign: 'right' }}>
                      <EditableText value={item.price} onChange={(v) => editorProps.updateItem(catIdx, itemIdx, 'price', v)} tag="span" style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }} placeholder="0" />
                    </td>
                    <td style={{ padding: '6px 4px', textAlign: 'center' }}>
                      <button onClick={() => editorProps.removeItem(catIdx, itemIdx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '2px' }}><X size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Add Item Row */}
            <button onClick={() => editorProps.addItem(catIdx)} style={{ width: '100%', padding: '8px', background: '#fafafa', border: '1px dashed #d1d5db', borderRadius: '0 0 8px 8px', cursor: 'pointer', color: '#9ca3af', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <Plus size={14} /> Add Item
            </button>
          </div>
        ))}

        {/* Add Category */}
        <button onClick={editorProps.addCategory} style={{ width: '100%', padding: '12px', background: '#f9fafb', border: '2px dashed #d1d5db', borderRadius: '8px', cursor: 'pointer', color: '#6b7280', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <Plus size={16} /> Add Category
        </button>
      </div>
  `;
}

/**
 * Storytelling Cards style visual editor JSX
 */
function generateStorytellingEditorJsx(primaryColor) {
  return `
      {/* Storytelling Cards Editor */}
      <div>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <EditableText value={editorProps.heroTitle} onChange={editorProps.setHeroTitle} tag="h2" style={{ fontSize: '32px', fontWeight: 800, color: '#111827', margin: 0 }} placeholder="Page Title" />
          <EditableText value={editorProps.heroSubtitle} onChange={editorProps.setHeroSubtitle} tag="p" style={{ fontSize: '16px', color: '#6b7280', marginTop: '8px', maxWidth: '600px', margin: '8px auto 0' }} placeholder="Tell your story..." />
        </div>

        {editorProps.categories.map((cat, catIdx) => (
          <div key={catIdx} style={{ marginBottom: '40px' }}>
            {/* Category Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <EditableText value={cat.name} onChange={(v) => editorProps.updateCategoryName(catIdx, v)} tag="h3" style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: 0 }} placeholder="Category" />
              <button onClick={() => editorProps.removeCategory(catIdx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }} title="Delete category"><Trash2 size={16} /></button>
            </div>

            {/* Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
              {cat.items.map((item, itemIdx) => (
                <div key={itemIdx} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden', position: 'relative', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                  {/* Remove button */}
                  <button onClick={() => editorProps.removeItem(catIdx, itemIdx)} style={{ position: 'absolute', top: 10, right: 10, zIndex: 10, background: 'rgba(239,68,68,0.9)', color: '#fff', border: 'none', borderRadius: '50%', width: 26, height: 26, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }} title="Remove">&times;</button>

                  {/* Large Image */}
                  <EditableImage src={item.image} alt={item.name} onChangeSrc={(v) => editorProps.updateItem(catIdx, itemIdx, 'image', v)} style={{ width: '100%', height: '280px', objectFit: 'cover', display: 'block' }} containerStyle={{ width: '100%' }} />

                  {/* Content */}
                  <div style={{ padding: '20px' }}>
                    <EditableText value={item.name} onChange={(v) => editorProps.updateItem(catIdx, itemIdx, 'name', v)} tag="h3" style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: '0 0 8px' }} placeholder="Item name" />
                    <EditableText value={item.description} onChange={(v) => editorProps.updateItem(catIdx, itemIdx, 'description', v)} tag="p" style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 16px', lineHeight: 1.6 }} placeholder="Tell the story of this item — origin, ingredients, inspiration..." />
                    <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                      <EditableText value={item.price} onChange={(v) => editorProps.updateItem(catIdx, itemIdx, 'price', v)} tag="span" style={{ fontSize: '18px', fontWeight: 700, color: '${primaryColor}' }} placeholder="0" />
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Item Card */}
              <button onClick={() => editorProps.addItem(catIdx)} style={{ background: '#fafafa', borderRadius: '16px', border: '2px dashed #d1d5db', minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#9ca3af', gap: '8px', fontSize: '14px' }}>
                <Plus size={28} /> Add Item
              </button>
            </div>
          </div>
        ))}

        {/* Add Category */}
        <button onClick={editorProps.addCategory} style={{ width: '100%', padding: '16px', background: '#f9fafb', border: '2px dashed #d1d5db', borderRadius: '16px', cursor: 'pointer', color: '#6b7280', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <Plus size={16} /> Add Category
        </button>
      </div>
  `;
}

/**
 * Generate Customers & Loyalty page for admin dashboard
 */
function generateCustomersPage(businessName, primaryColor, industryId) {
  // Map industry to reward template
  const templateMap = {
    'pizza-restaurant': 'food', 'steakhouse': 'food', 'coffee-cafe': 'food',
    'restaurant': 'food', 'bakery': 'food',
    'salon-spa': 'salon', 'barbershop': 'salon',
    'fitness-gym': 'fitness', 'yoga': 'fitness',
    'dental': 'professional', 'healthcare': 'professional', 'law-firm': 'professional',
    'plumber': 'trade', 'cleaning': 'trade', 'auto-shop': 'trade',
    'saas': 'tech', 'ecommerce': 'tech', 'school': 'tech',
    'real-estate': 'realestate'
  };
  const defaultTemplate = templateMap[industryId] || 'food';

  return `import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Users, Search, Award, Gift, Star, ChevronDown, Plus, Trash2, Save, X, TrendingUp, UserPlus, Crown, MessageCircle, Send } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || '';

// ============================================
// REWARD TEMPLATES
// ============================================

const REWARD_TEMPLATES = {
  food: {
    id: 'food', name: 'Food & Beverage', pointsModel: 'per-dollar', pointsRate: 10,
    rewards: [
      { id: 'r1', name: 'Free Drink', description: 'Any regular beverage on us', pointsCost: 100, active: true },
      { id: 'r2', name: 'Free Side', description: 'Add a side dish for free', pointsCost: 75, active: true },
      { id: 'r3', name: '20% Off', description: '20% off your entire order', pointsCost: 150, active: true },
      { id: 'r4', name: 'Free Entree', description: 'Any main course for free', pointsCost: 300, active: true },
      { id: 'r5', name: 'VIP Dinner', description: 'Private chef experience', pointsCost: 500, active: true }
    ]
  },
  salon: {
    id: 'salon', name: 'Salon & Spa', pointsModel: 'per-visit', pointsRate: 10,
    rewards: [
      { id: 'r1', name: 'Free Blowout', description: 'Complimentary blowout service', pointsCost: 100, active: true },
      { id: 'r2', name: 'Free Add-On', description: 'Free deep conditioning or treatment', pointsCost: 75, active: true },
      { id: 'r3', name: '20% Off', description: '20% off any service', pointsCost: 150, active: true },
      { id: 'r4', name: 'Free Color', description: 'Complimentary color service', pointsCost: 300, active: true },
      { id: 'r5', name: 'Spa Day', description: 'Full spa day experience', pointsCost: 500, active: true }
    ]
  },
  fitness: {
    id: 'fitness', name: 'Fitness & Wellness', pointsModel: 'per-class', pointsRate: 10,
    rewards: [
      { id: 'r1', name: 'Free Class', description: 'Any group class for free', pointsCost: 100, active: true },
      { id: 'r2', name: 'Free Smoothie', description: 'Complimentary post-workout shake', pointsCost: 75, active: true },
      { id: 'r3', name: 'PT Session', description: 'Free personal training session', pointsCost: 200, active: true },
      { id: 'r4', name: 'Guest Pass', description: 'Bring a friend for free', pointsCost: 150, active: true },
      { id: 'r5', name: 'Retreat Access', description: 'Weekend wellness retreat', pointsCost: 500, active: true }
    ]
  },
  professional: {
    id: 'professional', name: 'Professional Services', pointsModel: 'per-visit', pointsRate: 10,
    rewards: [
      { id: 'r1', name: 'Free Consult', description: 'Complimentary consultation', pointsCost: 100, active: true },
      { id: 'r2', name: '15% Off', description: '15% off next service', pointsCost: 75, active: true },
      { id: 'r3', name: 'Priority Access', description: 'Skip the waitlist', pointsCost: 150, active: true },
      { id: 'r4', name: 'Premium Review', description: 'Comprehensive premium review', pointsCost: 300, active: true },
      { id: 'r5', name: 'VIP Package', description: 'All-inclusive VIP service package', pointsCost: 500, active: true }
    ]
  },
  trade: {
    id: 'trade', name: 'Trade Services', pointsModel: 'per-booking', pointsRate: 10,
    rewards: [
      { id: 'r1', name: '\\$10 Off', description: '\\$10 off your next booking', pointsCost: 100, active: true },
      { id: 'r2', name: 'Free Inspection', description: 'Complimentary inspection visit', pointsCost: 75, active: true },
      { id: 'r3', name: '15% Off', description: '15% off any service', pointsCost: 150, active: true },
      { id: 'r4', name: 'Free Checkup', description: 'Annual maintenance checkup', pointsCost: 300, active: true },
      { id: 'r5', name: 'Annual Plan', description: 'Full year maintenance plan', pointsCost: 500, active: true }
    ]
  },
  tech: {
    id: 'tech', name: 'Tech & Education', pointsModel: 'per-dollar', pointsRate: 10,
    rewards: [
      { id: 'r1', name: 'Free Month', description: 'One month free subscription', pointsCost: 100, active: true },
      { id: 'r2', name: 'Feature Upgrade', description: 'Unlock a premium feature', pointsCost: 75, active: true },
      { id: 'r3', name: '20% Off Renewal', description: '20% off your next renewal', pointsCost: 150, active: true },
      { id: 'r4', name: 'Priority Support', description: 'Dedicated priority support', pointsCost: 300, active: true },
      { id: 'r5', name: 'Enterprise', description: 'Enterprise tier for one quarter', pointsCost: 500, active: true }
    ]
  },
  realestate: {
    id: 'realestate', name: 'Real Estate', pointsModel: 'per-referral', pointsRate: 50,
    rewards: [
      { id: 'r1', name: 'Staging Consult', description: 'Free home staging consultation', pointsCost: 100, active: true },
      { id: 'r2', name: 'Pro Photos', description: 'Professional photography session', pointsCost: 200, active: true },
      { id: 'r3', name: 'Priority Showings', description: 'First access to new listings', pointsCost: 150, active: true },
      { id: 'r4', name: 'Closing Credit', description: 'Credit toward closing costs', pointsCost: 500, active: true }
    ]
  }
};

const DEFAULT_TIERS = [
  { name: 'Bronze', minPoints: 0, multiplier: 1.0, benefits: ['Earn points on every purchase'] },
  { name: 'Silver', minPoints: 200, multiplier: 1.2, benefits: ['1.2x point multiplier', 'Birthday bonus'] },
  { name: 'Gold', minPoints: 500, multiplier: 1.5, benefits: ['1.5x point multiplier', 'Priority service', 'Exclusive offers'] },
  { name: 'Platinum', minPoints: 1000, multiplier: 2.0, benefits: ['2x point multiplier', 'VIP access', 'Free upgrades', 'Dedicated support'] }
];

const TIER_COLORS = {
  bronze: { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' },
  silver: { bg: '#f1f5f9', text: '#475569', border: '#94a3b8' },
  gold: { bg: '#fef9c3', text: '#854d0e', border: '#eab308' },
  platinum: { bg: '#ede9fe', text: '#6d28d9', border: '#8b5cf6' }
};

export default function CustomersPage() {
  const [activeTab, setActiveTab] = useState('customers');
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [pointsAdjust, setPointsAdjust] = useState({ amount: '', reason: '' });
  const [rewardsConfig, setRewardsConfig] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  const fetchChatForCustomer = useCallback(async (customerId) => {
    if (!customerId) return;
    try {
      const res = await fetch(\`\${API}/api/chat/conversations/\${customerId}\`);
      const data = await res.json();
      if (data.success && data.conversation) {
        setChatMessages(data.conversation.messages || []);
      } else {
        setChatMessages([]);
      }
    } catch (e) { console.error('Chat fetch error:', e); }
  }, []);

  const sendAdminChat = useCallback(async () => {
    if (!chatInput.trim() || !selectedCustomer || chatLoading) return;
    setChatLoading(true);
    try {
      const res = await fetch(\`\${API}/api/chat/send\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          customerName: selectedCustomer.full_name,
          customerEmail: selectedCustomer.email,
          sender: 'admin',
          text: chatInput.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setChatMessages(data.conversation.messages || []);
        setChatInput('');
      }
    } catch (e) { console.error('Send error:', e); }
    setChatLoading(false);
  }, [chatInput, selectedCustomer, chatLoading]);

  // Fetch chat when customer selected
  useEffect(() => {
    if (selectedCustomer?.id) fetchChatForCustomer(selectedCustomer.id);
    else setChatMessages([]);
  }, [selectedCustomer?.id, fetchChatForCustomer]);

  // SSE for real-time chat updates
  useEffect(() => {
    const es = new EventSource(\`\${API}/api/chat/events\`);
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'chat_update' && selectedCustomer && String(data.customerId) === String(selectedCustomer.id)) {
          fetchChatForCustomer(selectedCustomer.id);
        }
      } catch {}
    };
    return () => es.close();
  }, [selectedCustomer?.id, fetchChatForCustomer]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const fetchCustomers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (tierFilter) params.set('tier', tierFilter);
      const res = await fetch(\`\${API}/api/admin/customers?\${params}\`);
      const data = await res.json();
      if (data.success) setCustomers(data.customers);
    } catch (e) { console.error('Failed to fetch customers:', e); }
  }, [search, tierFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(\`\${API}/api/admin/customers/stats\`);
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (e) { console.error('Failed to fetch stats:', e); }
  }, []);

  const fetchRewardsConfig = useCallback(async () => {
    try {
      const res = await fetch(\`\${API}/api/admin/rewards/config\`);
      const data = await res.json();
      if (data.success) setRewardsConfig(data.config);
    } catch (e) { console.error('Failed to fetch rewards config:', e); }
  }, []);

  useEffect(() => {
    Promise.all([fetchCustomers(), fetchStats(), fetchRewardsConfig()])
      .finally(() => setLoading(false));
  }, [fetchCustomers, fetchStats, fetchRewardsConfig]);

  useEffect(() => {
    fetchCustomers();
  }, [search, tierFilter, fetchCustomers]);

  // SSE for real-time updates
  useEffect(() => {
    const es = new EventSource(\`\${API}/api/admin/customers/events\`);
    es.onmessage = () => { fetchCustomers(); fetchStats(); };
    return () => es.close();
  }, [fetchCustomers, fetchStats]);

  const adjustPoints = async () => {
    if (!selectedCustomer || !pointsAdjust.amount) return;
    try {
      await fetch(\`\${API}/api/admin/customers/\${selectedCustomer.id}/points\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseInt(pointsAdjust.amount), reason: pointsAdjust.reason })
      });
      setPointsAdjust({ amount: '', reason: '' });
      fetchCustomers();
      fetchStats();
    } catch (e) { console.error('Failed to adjust points:', e); }
  };

  const updateTier = async (customerId, tier) => {
    try {
      await fetch(\`\${API}/api/admin/customers/\${customerId}/tier\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier })
      });
      fetchCustomers();
      fetchStats();
      if (selectedCustomer?.id === customerId) {
        setSelectedCustomer(prev => ({ ...prev, tier }));
      }
    } catch (e) { console.error('Failed to update tier:', e); }
  };

  const applyTemplate = (templateId) => {
    const template = REWARD_TEMPLATES[templateId];
    if (!template) return;
    setRewardsConfig(prev => ({
      ...prev,
      templateId,
      pointsModel: template.pointsModel,
      pointsRate: template.pointsRate,
      rewards: template.rewards.map(r => ({ ...r })),
      tiers: DEFAULT_TIERS.map(t => ({ ...t, benefits: [...t.benefits] }))
    }));
  };

  const saveRewardsConfig = async () => {
    setSaving(true);
    try {
      await fetch(\`\${API}/api/admin/rewards/config\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rewardsConfig)
      });
    } catch (e) { console.error('Failed to save rewards config:', e); }
    setSaving(false);
  };

  const addReward = () => {
    setRewardsConfig(prev => ({
      ...prev,
      rewards: [...(prev.rewards || []), {
        id: 'r' + Date.now(),
        name: 'New Reward',
        description: 'Description',
        pointsCost: 100,
        active: true
      }]
    }));
  };

  const removeReward = (id) => {
    setRewardsConfig(prev => ({
      ...prev,
      rewards: prev.rewards.filter(r => r.id !== id)
    }));
  };

  const updateReward = (id, field, value) => {
    setRewardsConfig(prev => ({
      ...prev,
      rewards: prev.rewards.map(r => r.id === id ? { ...r, [field]: value } : r)
    }));
  };

  const updateTierConfig = (index, field, value) => {
    setRewardsConfig(prev => ({
      ...prev,
      tiers: prev.tiers.map((t, i) => i === index ? { ...t, [field]: value } : t)
    }));
  };

  const updateRule = (field, value) => {
    setRewardsConfig(prev => ({
      ...prev,
      rules: { ...prev.rules, [field]: value }
    }));
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 }}>Customers & Loyalty</h1>
          <p style={{ color: '#6b7280', margin: '4px 0 0' }}>Manage portal members and loyalty rewards</p>
        </div>
      </div>

      {/* Tab Toggle */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, background: '#f3f4f6', borderRadius: 8, padding: 4, width: 'fit-content' }}>
        {[{ key: 'customers', label: 'Customers', icon: Users }, { key: 'loyalty', label: 'Loyalty Program', icon: Award }].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 20px',
              borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500,
              background: activeTab === tab.key ? '#fff' : 'transparent',
              color: activeTab === tab.key ? '${primaryColor}' : '#6b7280',
              boxShadow: activeTab === tab.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <tab.icon size={16} />{tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'customers' && (
        <div>
          {/* Stats Row */}
          {stats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Total Customers', value: stats.total, icon: Users, color: '${primaryColor}' },
                { label: 'New This Week', value: stats.newThisWeek, icon: UserPlus, color: '#10b981' },
                { label: 'Avg Points', value: stats.avgPoints, icon: TrendingUp, color: '#8b5cf6' },
                { label: 'Gold & Platinum', value: (stats.tiers.gold || 0) + (stats.tiers.platinum || 0), icon: Crown, color: '#f59e0b' }
              ].map((stat, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: '#6b7280', fontSize: 13 }}>{stat.label}</span>
                    <stat.icon size={20} style={{ color: stat.color }} />
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#111827' }}>{stat.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Search & Filter */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: 12, top: 10, color: '#9ca3af' }} />
              <input
                type="text"
                placeholder="Search customers..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '8px 12px 8px 38px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <select
              value={tierFilter}
              onChange={e => setTierFilter(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, outline: 'none', background: '#fff' }}
            >
              <option value="">All Tiers</option>
              <option value="bronze">Bronze</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
              <option value="platinum">Platinum</option>
            </select>
          </div>

          {/* Customer Table */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  {['Name', 'Email', 'Tier', 'Points', 'Joined', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.map(c => {
                  const tc = TIER_COLORS[c.tier] || TIER_COLORS.bronze;
                  return (
                    <tr key={c.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 500, color: '#111827' }}>{c.full_name}</td>
                      <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: 14 }}>{c.email}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: tc.bg, color: tc.text, border: \`1px solid \${tc.border}\` }}>
                          {c.tier.charAt(0).toUpperCase() + c.tier.slice(1)}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#111827' }}>{c.points}</td>
                      <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: 13 }}>{new Date(c.joined).toLocaleDateString()}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          onClick={() => setSelectedCustomer(c)}
                          style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: 13, color: '${primaryColor}' }}
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {customers.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No customers found</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Customer Detail Drawer */}
          {selectedCustomer && (
            <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 420, background: '#fff', boxShadow: '-4px 0 24px rgba(0,0,0,0.12)', zIndex: 1000, overflowY: 'auto', padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#111827' }}>{selectedCustomer.full_name}</h2>
                <button onClick={() => setSelectedCustomer(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#6b7280' }}><X size={20} /></button>
              </div>

              <div style={{ background: '#f9fafb', borderRadius: 10, padding: 16, marginBottom: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div><span style={{ fontSize: 12, color: '#6b7280' }}>Email</span><div style={{ fontWeight: 500, fontSize: 14 }}>{selectedCustomer.email}</div></div>
                  <div><span style={{ fontSize: 12, color: '#6b7280' }}>Points</span><div style={{ fontWeight: 700, fontSize: 20, color: '${primaryColor}' }}>{selectedCustomer.points}</div></div>
                  <div><span style={{ fontSize: 12, color: '#6b7280' }}>Tier</span><div>{(() => { const tc = TIER_COLORS[selectedCustomer.tier] || TIER_COLORS.bronze; return <span style={{ padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: tc.bg, color: tc.text, border: \`1px solid \${tc.border}\` }}>{selectedCustomer.tier.charAt(0).toUpperCase() + selectedCustomer.tier.slice(1)}</span>; })()}</div></div>
                  <div><span style={{ fontSize: 12, color: '#6b7280' }}>Joined</span><div style={{ fontSize: 14 }}>{new Date(selectedCustomer.joined).toLocaleDateString()}</div></div>
                </div>
              </div>

              {/* Points Adjustment */}
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#374151' }}>Adjust Points</h3>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input
                    type="number"
                    placeholder="+/- amount"
                    value={pointsAdjust.amount}
                    onChange={e => setPointsAdjust(p => ({ ...p, amount: e.target.value }))}
                    style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, outline: 'none' }}
                  />
                  <button
                    onClick={adjustPoints}
                    disabled={!pointsAdjust.amount}
                    style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '${primaryColor}', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, opacity: pointsAdjust.amount ? 1 : 0.5 }}
                  >
                    Apply
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Reason (optional)"
                  value={pointsAdjust.reason}
                  onChange={e => setPointsAdjust(p => ({ ...p, reason: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Tier Override */}
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#374151' }}>Override Tier</h3>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['bronze', 'silver', 'gold', 'platinum'].map(t => {
                    const tc = TIER_COLORS[t];
                    const isActive = selectedCustomer.tier === t;
                    return (
                      <button
                        key={t}
                        onClick={() => updateTier(selectedCustomer.id, t)}
                        style={{
                          flex: 1, padding: '6px 0', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                          background: isActive ? tc.bg : '#fff',
                          color: isActive ? tc.text : '#6b7280',
                          border: \`1px solid \${isActive ? tc.border : '#e5e7eb'}\`
                        }}
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chat Messages */}
              <div style={{ marginTop: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MessageCircle size={16} /> Chat
                </h3>
                <div style={{ background: '#f9fafb', borderRadius: 10, padding: 12, maxHeight: 260, overflowY: 'auto', marginBottom: 8 }}>
                  {chatMessages.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#9ca3af', padding: '20px 0', fontSize: 13 }}>No messages yet</div>
                  )}
                  {chatMessages.map(m => (
                    <div key={m.id} style={{
                      display: 'flex',
                      justifyContent: m.sender === 'admin' ? 'flex-end' : 'flex-start',
                      marginBottom: 6
                    }}>
                      <div style={{
                        maxWidth: '80%',
                        padding: '6px 12px',
                        borderRadius: 10,
                        fontSize: 13,
                        lineHeight: 1.4,
                        ...(m.sender === 'admin'
                          ? { background: '${primaryColor}', color: '#fff', borderBottomRightRadius: 2 }
                          : m.sender === 'system'
                          ? { background: '#e5e7eb', color: '#6b7280', fontStyle: 'italic', borderBottomLeftRadius: 2 }
                          : { background: '#fff', border: '1px solid #e5e7eb', color: '#111827', borderBottomLeftRadius: 2 })
                      }}>
                        <div style={{ fontSize: 10, fontWeight: 600, marginBottom: 1, opacity: 0.8 }}>
                          {m.sender === 'customer' ? selectedCustomer.full_name : m.sender === 'admin' ? 'You' : 'System'}
                        </div>
                        {m.text}
                        <div style={{ fontSize: 9, marginTop: 2, opacity: 0.6 }}>
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendAdminChat()}
                    placeholder="Reply..."
                    style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, outline: 'none' }}
                  />
                  <button
                    onClick={sendAdminChat}
                    disabled={chatLoading || !chatInput.trim()}
                    style={{
                      padding: '8px 14px', borderRadius: 8, border: 'none', background: '${primaryColor}', color: '#fff',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600,
                      opacity: (chatLoading || !chatInput.trim()) ? 0.5 : 1
                    }}
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'loyalty' && rewardsConfig && (
        <div>
          {/* Active Plan Summary */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e5e7eb', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <Award size={24} style={{ color: '${primaryColor}' }} />
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#111827' }}>{rewardsConfig.programName || 'Rewards Club'}</h2>
                <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
                  {rewardsConfig.pointsRate} pts / {rewardsConfig.pointsModel?.replace('per-', '')} &middot; Template: {REWARD_TEMPLATES[rewardsConfig.templateId]?.name || rewardsConfig.templateId}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={rewardsConfig.programName || ''}
                onChange={e => setRewardsConfig(prev => ({ ...prev, programName: e.target.value }))}
                style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, outline: 'none' }}
                placeholder="Program name"
              />
              <input
                type="number"
                value={rewardsConfig.pointsRate || 10}
                onChange={e => setRewardsConfig(prev => ({ ...prev, pointsRate: parseInt(e.target.value) || 10 }))}
                style={{ width: 80, padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, outline: 'none', textAlign: 'center' }}
              />
              <span style={{ alignSelf: 'center', fontSize: 13, color: '#6b7280' }}>pts / {rewardsConfig.pointsModel?.replace('per-', '')}</span>
            </div>
          </div>

          {/* Template Picker */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#111827' }}>Industry Templates</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
              {Object.values(REWARD_TEMPLATES).map(template => (
                <button
                  key={template.id}
                  onClick={() => applyTemplate(template.id)}
                  style={{
                    padding: 16, borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                    background: rewardsConfig.templateId === template.id ? '${primaryColor}08' : '#fff',
                    border: \`2px solid \${rewardsConfig.templateId === template.id ? '${primaryColor}' : '#e5e7eb'}\`,
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 14, color: rewardsConfig.templateId === template.id ? '${primaryColor}' : '#111827', marginBottom: 4 }}>{template.name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{template.pointsRate} pts / {template.pointsModel.replace('per-', '')}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>{template.rewards.length} rewards</div>
                </button>
              ))}
            </div>
          </div>

          {/* Tier Configuration */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#111827' }}>Tiers</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {(rewardsConfig.tiers || DEFAULT_TIERS).map((tier, i) => {
                const tc = TIER_COLORS[tier.name.toLowerCase()] || TIER_COLORS.bronze;
                return (
                  <div key={i} style={{ background: '#fff', borderRadius: 10, padding: 16, border: \`2px solid \${tc.border}\`, borderTop: \`4px solid \${tc.border}\` }}>
                    <input
                      value={tier.name}
                      onChange={e => updateTierConfig(i, 'name', e.target.value)}
                      style={{ width: '100%', fontWeight: 700, fontSize: 16, border: 'none', outline: 'none', marginBottom: 8, boxSizing: 'border-box', color: tc.text }}
                    />
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: 11, color: '#6b7280' }}>Min Points</label>
                        <input type="number" value={tier.minPoints} onChange={e => updateTierConfig(i, 'minPoints', parseInt(e.target.value) || 0)} style={{ width: '100%', padding: '4px 8px', borderRadius: 4, border: '1px solid #d1d5db', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: 11, color: '#6b7280' }}>Multiplier</label>
                        <input type="number" step="0.1" value={tier.multiplier} onChange={e => updateTierConfig(i, 'multiplier', parseFloat(e.target.value) || 1)} style={{ width: '100%', padding: '4px 8px', borderRadius: 4, border: '1px solid #d1d5db', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: '#6b7280' }}>
                      {(tier.benefits || []).join(' \\u2022 ')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rewards Management */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: '#111827' }}>Rewards</h3>
              <button onClick={addReward} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 6, border: 'none', background: '${primaryColor}', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                <Plus size={14} /> Add
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(rewardsConfig.rewards || []).map(reward => (
                <div key={reward.id} style={{ background: '#fff', borderRadius: 10, padding: 16, border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Gift size={20} style={{ color: '${primaryColor}', flexShrink: 0 }} />
                  <div style={{ flex: 1, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <input value={reward.name} onChange={e => updateReward(reward.id, 'name', e.target.value)} style={{ fontWeight: 600, fontSize: 14, border: 'none', outline: 'none', minWidth: 120 }} />
                    <input value={reward.description} onChange={e => updateReward(reward.id, 'description', e.target.value)} style={{ flex: 1, fontSize: 13, color: '#6b7280', border: 'none', outline: 'none', minWidth: 150 }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="number" value={reward.pointsCost} onChange={e => updateReward(reward.id, 'pointsCost', parseInt(e.target.value) || 0)} style={{ width: 70, padding: '4px 8px', borderRadius: 4, border: '1px solid #d1d5db', fontSize: 13, outline: 'none', textAlign: 'center' }} />
                    <span style={{ fontSize: 12, color: '#6b7280' }}>pts</span>
                    <button
                      onClick={() => updateReward(reward.id, 'active', !reward.active)}
                      style={{ padding: '4px 10px', borderRadius: 12, border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer', background: reward.active ? '#dcfce7' : '#f3f4f6', color: reward.active ? '#166534' : '#9ca3af' }}
                    >
                      {reward.active ? 'Active' : 'Off'}
                    </button>
                    <button onClick={() => removeReward(reward.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rules */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e5e7eb', marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#111827' }}>Bonus Rules</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              {[
                { key: 'signupBonus', label: 'Signup Bonus', suffix: 'pts' },
                { key: 'referralBonus', label: 'Referral Bonus', suffix: 'pts' },
                { key: 'birthdayBonus', label: 'Birthday Bonus', suffix: 'pts' },
                { key: 'pointExpiry', label: 'Point Expiry', suffix: 'days' }
              ].map(rule => (
                <div key={rule.key}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4, display: 'block' }}>{rule.label}</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="number"
                      value={rewardsConfig.rules?.[rule.key] || 0}
                      onChange={e => updateRule(rule.key, parseInt(e.target.value) || 0)}
                      style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, outline: 'none' }}
                    />
                    <span style={{ fontSize: 13, color: '#6b7280' }}>{rule.suffix}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={saveRewardsConfig}
            disabled={saving}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 8,
              border: 'none', background: '${primaryColor}', color: '#fff', cursor: 'pointer',
              fontSize: 15, fontWeight: 600, opacity: saving ? 0.7 : 1
            }}
          >
            <Save size={18} />{saving ? 'Saving...' : 'Save Loyalty Program'}
          </button>
        </div>
      )}
    </div>
  );
}
`;
}

/**
 * Generate section schema as JSON for embedding in WebsiteEditor
 * This creates a static schema per industry so the editor knows which fields to show
 */
function generateSectionSchemaJson(industryId) {
  const schema = getPageSchema(industryId);
  // Convert to JSON string for embedding, but we can't use getPageSchema at runtime
  // because it's a generator-time function. So we inline the schema as a const.
  return JSON.stringify(schema, null, 2);
}

module.exports = {
  generateAdminDashboard
};
