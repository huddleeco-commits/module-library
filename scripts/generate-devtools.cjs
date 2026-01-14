/**
 * Module Library DevTools Generator
 * 
 * Generates a comprehensive HTML dashboard that documents:
 * - All backend and frontend modules
 * - Module connections and dependencies
 * - Industry presets and bundles
 * - File structure and stats
 * - Extraction and assembly scripts
 * - Diagnostics and health checks
 * 
 * Usage: node generate-devtools.cjs
 * Output: module-library-devtools.html
 * 
 * Save to: C:\Users\huddl\OneDrive\Desktop\module-library\scripts\generate-devtools.cjs
 */

const fs = require('fs');
const path = require('path');

// ══════════════════════════════════════════════════════════════
// CONFIGURATION
// ══════════════════════════════════════════════════════════════

const MODULE_LIBRARY = 'C:\\Users\\huddl\\OneDrive\\Desktop\\module-library';
const GENERATED_PROJECTS = 'C:\\Users\\huddl\\OneDrive\\Desktop\\generated-projects';

// ══════════════════════════════════════════════════════════════
// BUNDLE DEFINITIONS (must match assemble-project.cjs)
// ══════════════════════════════════════════════════════════════

const BUNDLES = {
  'core': {
    description: 'Essential modules every platform needs',
    backend: ['auth', 'file-upload'],
    frontend: ['login-form', 'register-form', 'header-nav', 'footer-section', 'modal-system', 'auth-context']
  },
  'dashboard': {
    description: 'Admin dashboard with analytics',
    backend: ['admin-dashboard', 'analytics'],
    frontend: ['stat-cards', 'data-table', 'admin-panel']
  },
  'commerce': {
    description: 'E-commerce and payments',
    backend: ['stripe-payments', 'payments', 'inventory', 'marketplace', 'vendor-system', 'transfers'],
    frontend: ['checkout-flow', 'pricing-table', 'marketplace-ui', 'trading-hub']
  },
  'social': {
    description: 'Social features',
    backend: ['notifications', 'chat', 'social-feed', 'posts'],
    frontend: ['card-components']
  },
  'collectibles': {
    description: 'Collection management + AI scanning',
    backend: ['ai-scanner', 'collections', 'ebay-integration', 'nfc-tags', 'showcase'],
    frontend: ['collection-grid', 'item-detail', 'file-uploader', 'image-gallery', 'search-filter']
  },
  'sports': {
    description: 'Sports/fantasy/betting features',
    backend: ['fantasy', 'betting', 'leaderboard', 'pools', 'schools'],
    frontend: []
  },
  'healthcare': {
    description: 'Healthcare/booking features',
    backend: ['booking'],
    frontend: ['settings-panel']
  },
  'family': {
    description: 'Family management features',
    backend: ['calendar', 'tasks', 'meals', 'kids-banking', 'family-groups', 'documents'],
    frontend: []
  },
  'gamification': {
    description: 'Achievements and challenges',
    backend: ['achievements', 'portfolio'],
    frontend: []
  }
};

// ══════════════════════════════════════════════════════════════
// INDUSTRY PRESETS (must match assemble-project.cjs)
// ══════════════════════════════════════════════════════════════

const INDUSTRY_PRESETS = {
  'restaurant': {
    name: 'Restaurant / Food Service',
    description: 'Menu management, reservations, online ordering',
    bundles: ['core', 'commerce'],
    additionalBackend: ['booking', 'inventory', 'notifications'],
    additionalFrontend: ['image-gallery', 'search-filter'],
    icon: '🍽️'
  },
  'healthcare': {
    name: 'Healthcare / Medical',
    description: 'Patient management, appointments, telemedicine',
    bundles: ['core', 'dashboard', 'healthcare'],
    additionalBackend: ['notifications', 'chat', 'documents'],
    additionalFrontend: [],
    icon: '🏥'
  },
  'ecommerce': {
    name: 'E-Commerce / Retail',
    description: 'Product catalog, cart, checkout, payments',
    bundles: ['core', 'commerce', 'dashboard'],
    additionalBackend: ['notifications'],
    additionalFrontend: ['search-filter', 'image-gallery'],
    icon: '🛒'
  },
  'collectibles': {
    name: 'Collectibles / Trading Cards',
    description: 'AI scanning, collection management, eBay pricing',
    bundles: ['core', 'commerce', 'collectibles', 'dashboard'],
    additionalBackend: [],
    additionalFrontend: [],
    icon: '🃏'
  },
  'sports': {
    name: 'Sports / Fantasy / Betting',
    description: 'Fantasy leagues, betting pools, leaderboards',
    bundles: ['core', 'social', 'sports', 'dashboard'],
    additionalBackend: ['notifications'],
    additionalFrontend: [],
    icon: '🎮'
  },
  'saas': {
    name: 'SaaS / B2B Platform',
    description: 'Subscriptions, analytics, admin dashboard',
    bundles: ['core', 'commerce', 'dashboard', 'gamification'],
    additionalBackend: ['notifications', 'analytics'],
    additionalFrontend: [],
    icon: '🏢'
  },
  'family': {
    name: 'Family / Community',
    description: 'Calendar, tasks, kids banking, meal planning',
    bundles: ['core', 'family', 'social'],
    additionalBackend: [],
    additionalFrontend: [],
    icon: '👨‍👩‍👧‍👦'
  }
};

// ══════════════════════════════════════════════════════════════
// SOURCE PLATFORMS
// ══════════════════════════════════════════════════════════════

const SOURCE_PLATFORMS = {
  'slabtrack': {
    name: 'SlabTrack',
    path: 'C:\\Users\\huddl\\OneDrive\\Desktop\\GitHub\\slabtrack',
    status: 'production',
    description: 'Sports card collection management with AI scanning',
    icon: '🃏'
  },
  'huddle': {
    name: 'Huddle',
    path: 'C:\\Users\\huddl\\OneDrive\\Desktop\\HOMESCREEN-PREVIOUS\\PLATFORMS\\Huddle',
    status: 'archived',
    description: 'Fantasy sports and betting platform',
    icon: '🏈'
  },
  'healthcareos': {
    name: 'HealthcareOS',
    path: 'C:\\Users\\huddl\\OneDrive\\Desktop\\HOMESCREEN-PREVIOUS\\PLATFORMS\\HealthcareOS',
    status: 'archived',
    description: 'Healthcare management platform',
    icon: '🏥'
  },
  'family-huddle': {
    name: 'Family Huddle',
    path: 'C:\\Users\\huddl\\OneDrive\\Desktop\\HOMESCREEN-PREVIOUS\\My-Family-Huddle',
    status: 'archived',
    description: 'Family organization and management',
    icon: '👨‍👩‍👧‍👦'
  },
  'ubg': {
    name: 'Universal Business Generator',
    path: 'C:\\Users\\huddl\\OneDrive\\Desktop\\HOMESCREEN-PREVIOUS\\PLATFORMS\\universal-business-generator',
    status: 'archived',
    description: 'Multi-industry website generator',
    icon: '🏗️'
  },
  'campuswager': {
    name: 'CampusWager',
    path: 'C:\\Users\\huddl\\OneDrive\\Desktop\\HOMESCREEN-PREVIOUS\\CampusWager',
    status: 'archived',
    description: 'Campus sports betting platform',
    icon: '🎓'
  },
  'financial': {
    name: 'Financial Services',
    path: 'C:\\Users\\huddl\\OneDrive\\Desktop\\HOMESCREEN-PREVIOUS\\Financial-Services-Platform',
    status: 'archived',
    description: 'Financial services and investment platform',
    icon: '💰'
  }
};

// ══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ══════════════════════════════════════════════════════════════

function scanModules(type) {
  const modulesPath = path.join(MODULE_LIBRARY, type);
  const modules = [];
  
  if (!fs.existsSync(modulesPath)) {
    return modules;
  }
  
  const dirs = fs.readdirSync(modulesPath, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);
  
  for (const dir of dirs) {
    const modulePath = path.join(modulesPath, dir);
    const files = [];
    let totalSize = 0;
    
    // Scan all files recursively
    function scanDir(dirPath, relativePath = '') {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const relPath = path.join(relativePath, entry.name);
        
        if (entry.isDirectory()) {
          scanDir(fullPath, relPath);
        } else {
          const stat = fs.statSync(fullPath);
          files.push({
            name: entry.name,
            path: relPath,
            size: stat.size
          });
          totalSize += stat.size;
        }
      }
    }
    
    scanDir(modulePath);
    
    // Determine source platform
    let source = 'unknown';
    for (const [key, bundle] of Object.entries(BUNDLES)) {
      if (bundle.backend?.includes(dir) || bundle.frontend?.includes(dir)) {
        // Find which platform this module came from
        const manifestPath = path.join(modulePath, 'module.json');
        if (fs.existsSync(manifestPath)) {
          try {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
            source = manifest.source || 'unknown';
          } catch (e) {}
        }
        break;
      }
    }
    
    // Check module.json for source
    const manifestPath = path.join(modulePath, 'module.json');
    if (fs.existsSync(manifestPath)) {
      try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        source = manifest.source || source;
      } catch (e) {}
    }
    
    modules.push({
      name: dir,
      type: type,
      files: files,
      fileCount: files.length,
      totalSize: totalSize,
      source: source,
      path: modulePath
    });
  }
  
  return modules;
}

function scanGeneratedProjects() {
  const projects = [];
  
  if (!fs.existsSync(GENERATED_PROJECTS)) {
    return projects;
  }
  
  const dirs = fs.readdirSync(GENERATED_PROJECTS, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);
  
  for (const dir of dirs) {
    const projectPath = path.join(GENERATED_PROJECTS, dir);
    const manifestPath = path.join(projectPath, 'project-manifest.json');
    
    let manifest = null;
    if (fs.existsSync(manifestPath)) {
      try {
        manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      } catch (e) {}
    }
    
    projects.push({
      name: dir,
      path: projectPath,
      manifest: manifest,
      hasBackend: fs.existsSync(path.join(projectPath, 'backend')),
      hasFrontend: fs.existsSync(path.join(projectPath, 'frontend'))
    });
  }
  
  return projects;
}

function getModuleConnections(backendModules, frontendModules) {
  const connections = [];
  
  // Define known connections between backend and frontend modules
  const knownConnections = {
    'auth': ['login-form', 'register-form', 'auth-context'],
    'stripe-payments': ['checkout-flow', 'pricing-table'],
    'payments': ['checkout-flow', 'pricing-table'],
    'admin-dashboard': ['admin-panel', 'stat-cards', 'data-table'],
    'analytics': ['stat-cards', 'data-table'],
    'collections': ['collection-grid', 'item-detail'],
    'ai-scanner': ['file-uploader'],
    'showcase': ['image-gallery'],
    'marketplace': ['marketplace-ui'],
    'inventory': ['trading-hub'],
    'file-upload': ['file-uploader']
  };
  
  for (const [backend, frontends] of Object.entries(knownConnections)) {
    if (backendModules.find(m => m.name === backend)) {
      for (const frontend of frontends) {
        if (frontendModules.find(m => m.name === frontend)) {
          connections.push({
            backend: backend,
            frontend: frontend,
            type: 'api'
          });
        }
      }
    }
  }
  
  return connections;
}

function runDiagnostics(backendModules, frontendModules) {
  const diagnostics = [];
  
  // Check module library exists
  diagnostics.push({
    test: 'Module library exists',
    status: fs.existsSync(MODULE_LIBRARY) ? 'pass' : 'fail',
    message: fs.existsSync(MODULE_LIBRARY) ? `Found at ${MODULE_LIBRARY}` : 'Module library not found'
  });
  
  // Check backend folder
  diagnostics.push({
    test: 'Backend modules folder',
    status: fs.existsSync(path.join(MODULE_LIBRARY, 'backend')) ? 'pass' : 'fail',
    message: `${backendModules.length} modules found`
  });
  
  // Check frontend folder
  diagnostics.push({
    test: 'Frontend modules folder',
    status: fs.existsSync(path.join(MODULE_LIBRARY, 'frontend')) ? 'pass' : 'fail',
    message: `${frontendModules.length} modules found`
  });
  
  // Check scripts folder
  diagnostics.push({
    test: 'Scripts folder',
    status: fs.existsSync(path.join(MODULE_LIBRARY, 'scripts')) ? 'pass' : 'fail',
    message: fs.existsSync(path.join(MODULE_LIBRARY, 'scripts')) ? 'Found' : 'Missing'
  });
  
  // Check extract script
  diagnostics.push({
    test: 'Extract modules script',
    status: fs.existsSync(path.join(MODULE_LIBRARY, 'scripts', 'extract-modules.cjs')) ? 'pass' : 'fail',
    message: fs.existsSync(path.join(MODULE_LIBRARY, 'scripts', 'extract-modules.cjs')) ? 'Found' : 'Missing'
  });
  
  // Check assemble script
  diagnostics.push({
    test: 'Assemble project script',
    status: fs.existsSync(path.join(MODULE_LIBRARY, 'scripts', 'assemble-project.cjs')) ? 'pass' : 'fail',
    message: fs.existsSync(path.join(MODULE_LIBRARY, 'scripts', 'assemble-project.cjs')) ? 'Found' : 'Missing'
  });
  
  // Check each bundle has modules
  for (const [bundleName, bundle] of Object.entries(BUNDLES)) {
    const backendFound = bundle.backend.filter(m => backendModules.find(bm => bm.name === m)).length;
    const frontendFound = bundle.frontend.filter(m => frontendModules.find(fm => fm.name === m)).length;
    const total = bundle.backend.length + bundle.frontend.length;
    const found = backendFound + frontendFound;
    
    diagnostics.push({
      test: `Bundle "${bundleName}" modules`,
      status: found === total ? 'pass' : found > 0 ? 'warn' : 'fail',
      message: `${found}/${total} modules available`
    });
  }
  
  // Check source platforms exist
  for (const [key, platform] of Object.entries(SOURCE_PLATFORMS)) {
    diagnostics.push({
      test: `Source: ${platform.name}`,
      status: fs.existsSync(platform.path) ? 'pass' : 'warn',
      message: fs.existsSync(platform.path) ? 'Accessible' : 'Not found (may be moved)'
    });
  }
  
  // Check generated projects folder
  diagnostics.push({
    test: 'Generated projects folder',
    status: fs.existsSync(GENERATED_PROJECTS) ? 'pass' : 'warn',
    message: fs.existsSync(GENERATED_PROJECTS) ? `Found at ${GENERATED_PROJECTS}` : 'Will be created on first assembly'
  });
  
  return diagnostics;
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ══════════════════════════════════════════════════════════════
// MAIN GENERATOR
// ══════════════════════════════════════════════════════════════

function generateDevTools() {
  console.log('🔧 Module Library DevTools Generator');
  console.log('=====================================\n');
  
  const startTime = Date.now();
  
  // Scan modules
  console.log('📦 Scanning backend modules...');
  const backendModules = scanModules('backend');
  console.log(`   Found ${backendModules.length} backend modules`);
  
  console.log('📦 Scanning frontend modules...');
  const frontendModules = scanModules('frontend');
  console.log(`   Found ${frontendModules.length} frontend modules`);
  
  // Scan generated projects
  console.log('📁 Scanning generated projects...');
  const generatedProjects = scanGeneratedProjects();
  console.log(`   Found ${generatedProjects.length} generated projects`);
  
  // Get connections
  console.log('🔗 Mapping module connections...');
  const connections = getModuleConnections(backendModules, frontendModules);
  console.log(`   Found ${connections.length} connections`);
  
  // Run diagnostics
  console.log('🧪 Running diagnostics...');
  const diagnostics = runDiagnostics(backendModules, frontendModules);
  
  // Calculate stats
  const totalBackendFiles = backendModules.reduce((sum, m) => sum + m.fileCount, 0);
  const totalFrontendFiles = frontendModules.reduce((sum, m) => sum + m.fileCount, 0);
  const totalSize = backendModules.reduce((sum, m) => sum + m.totalSize, 0) + 
                    frontendModules.reduce((sum, m) => sum + m.totalSize, 0);
  
  const stats = {
    backendModules: backendModules.length,
    frontendModules: frontendModules.length,
    totalModules: backendModules.length + frontendModules.length,
    totalFiles: totalBackendFiles + totalFrontendFiles,
    totalSize: totalSize,
    bundles: Object.keys(BUNDLES).length,
    industries: Object.keys(INDUSTRY_PRESETS).length,
    sourcePlatforms: Object.keys(SOURCE_PLATFORMS).length,
    generatedProjects: generatedProjects.length,
    connections: connections.length,
    diagnosticsPassed: diagnostics.filter(d => d.status === 'pass').length,
    diagnosticsWarnings: diagnostics.filter(d => d.status === 'warn').length,
    diagnosticsFailed: diagnostics.filter(d => d.status === 'fail').length,
    generatedAt: new Date().toISOString(),
    generationTime: Date.now() - startTime
  };
  
  // Generate HTML
  console.log('🎨 Generating HTML...');
  const html = generateHTML(backendModules, frontendModules, generatedProjects, connections, diagnostics, stats);
  
  // Save file
  const outputPath = path.join(MODULE_LIBRARY, 'scripts', 'module-library-devtools.html');
  fs.writeFileSync(outputPath, html);
  
  console.log(`\n✅ DevTools saved to: ${outputPath}`);
  console.log(`📊 ${stats.backendModules} backend + ${stats.frontendModules} frontend = ${stats.totalModules} total modules`);
  console.log(`📁 ${stats.totalFiles} files | ${formatBytes(stats.totalSize)}`);
  console.log(`🧪 Diagnostics: ${stats.diagnosticsPassed} passed, ${stats.diagnosticsWarnings} warnings, ${stats.diagnosticsFailed} failed`);
}

function generateHTML(backendModules, frontendModules, generatedProjects, connections, diagnostics, stats) {
  const healthScore = Math.round((stats.diagnosticsPassed / diagnostics.length) * 100);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Module Library DevTools</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    :root {
      --bg-primary: #0a0a0f;
      --bg-secondary: #12121a;
      --bg-tertiary: #1a1a2e;
      --text-primary: #e4e4e4;
      --text-secondary: #a0a0a0;
      --accent-orange: #f97316;
      --accent-purple: #8b5cf6;
      --accent-blue: #3b82f6;
      --accent-green: #22c55e;
      --accent-yellow: #eab308;
      --accent-red: #ef4444;
      --accent-cyan: #06b6d4;
    }
    
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      line-height: 1.6;
      min-height: 100vh;
    }
    
    /* Header */
    .header {
      background: linear-gradient(135deg, #f97316 0%, #8b5cf6 50%, #3b82f6 100%);
      padding: 50px 30px;
      text-align: center;
      position: relative;
    }
    
    .header h1 {
      font-size: 2.8rem;
      font-weight: 800;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    
    .header .subtitle {
      font-size: 1.2rem;
      opacity: 0.95;
      margin-top: 10px;
    }
    
    .header .generated-at {
      font-size: 0.85rem;
      opacity: 0.8;
      margin-top: 15px;
    }
    
    .health-score {
      position: absolute;
      top: 20px;
      right: 30px;
      background: rgba(0,0,0,0.3);
      padding: 15px 25px;
      border-radius: 12px;
      text-align: center;
    }
    
    .health-score .score {
      font-size: 2rem;
      font-weight: 800;
      color: ${healthScore >= 80 ? 'var(--accent-green)' : healthScore >= 60 ? 'var(--accent-yellow)' : 'var(--accent-red)'};
    }
    
    .health-score .label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      opacity: 0.8;
    }
    
    /* Navigation */
    .nav {
      background: var(--bg-secondary);
      padding: 15px 30px;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    
    .nav-btn {
      background: var(--bg-tertiary);
      border: 1px solid rgba(255,255,255,0.1);
      color: var(--text-primary);
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.95rem;
      font-weight: 500;
      transition: all 0.2s;
    }
    
    .nav-btn:hover, .nav-btn.active {
      background: linear-gradient(135deg, var(--accent-orange), var(--accent-purple));
      border-color: transparent;
    }
    
    /* Main Content */
    .main {
      max-width: 1800px;
      margin: 0 auto;
      padding: 30px;
    }
    
    .section { display: none; }
    .section.active { display: block; }
    
    .section-title {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 10px;
      background: linear-gradient(135deg, var(--accent-orange), var(--accent-purple));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .section-subtitle {
      color: var(--text-secondary);
      margin-bottom: 30px;
    }
    
    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    
    .stat-card {
      background: linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary));
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 25px;
      text-align: center;
    }
    
    .stat-card .value {
      font-size: 2.5rem;
      font-weight: 800;
      background: linear-gradient(135deg, var(--accent-orange), var(--accent-cyan));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .stat-card .label {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin-top: 8px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    /* Module Cards */
    .modules-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
    
    .module-card {
      background: var(--bg-secondary);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 20px;
      transition: all 0.2s;
    }
    
    .module-card:hover {
      border-color: var(--accent-purple);
      transform: translateY(-2px);
    }
    
    .module-card.backend { border-left: 4px solid var(--accent-orange); }
    .module-card.frontend { border-left: 4px solid var(--accent-cyan); }
    
    .module-card .name {
      font-size: 1.2rem;
      font-weight: 700;
      margin-bottom: 8px;
    }
    
    .module-card .meta {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin-bottom: 12px;
    }
    
    .module-card .files {
      font-family: 'Consolas', monospace;
      font-size: 0.8rem;
      color: var(--text-secondary);
      background: var(--bg-primary);
      padding: 10px;
      border-radius: 6px;
      max-height: 150px;
      overflow-y: auto;
    }
    
    .module-card .files div {
      padding: 2px 0;
    }
    
    /* Bundle Cards */
    .bundles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 25px;
    }
    
    .bundle-card {
      background: var(--bg-secondary);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      overflow: hidden;
    }
    
    .bundle-header {
      padding: 20px;
      background: var(--bg-tertiary);
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    
    .bundle-header .name {
      font-size: 1.3rem;
      font-weight: 700;
    }
    
    .bundle-header .desc {
      font-size: 0.9rem;
      color: var(--text-secondary);
      margin-top: 5px;
    }
    
    .bundle-body {
      padding: 20px;
    }
    
    .bundle-section {
      margin-bottom: 15px;
    }
    
    .bundle-section-title {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--text-secondary);
      margin-bottom: 8px;
    }
    
    .module-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .module-chip {
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.85rem;
    }
    
    .module-chip.backend {
      background: rgba(249, 115, 22, 0.2);
      color: var(--accent-orange);
    }
    
    .module-chip.frontend {
      background: rgba(6, 182, 212, 0.2);
      color: var(--accent-cyan);
    }
    
    /* Industry Cards */
    .industry-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 25px;
    }
    
    .industry-card {
      background: var(--bg-secondary);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 25px;
    }
    
    .industry-card .header {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 15px;
    }
    
    .industry-card .icon {
      font-size: 2.5rem;
    }
    
    .industry-card .name {
      font-size: 1.3rem;
      font-weight: 700;
    }
    
    .industry-card .desc {
      font-size: 0.9rem;
      color: var(--text-secondary);
    }
    
    .industry-card .bundles-used {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid rgba(255,255,255,0.1);
    }
    
    .industry-card .bundles-used .label {
      font-size: 0.8rem;
      color: var(--text-secondary);
      margin-bottom: 8px;
    }
    
    .bundle-tag {
      display: inline-block;
      padding: 4px 10px;
      margin: 3px;
      background: var(--bg-tertiary);
      border-radius: 4px;
      font-size: 0.8rem;
    }
    
    /* Connections */
    .connections-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 15px;
    }
    
    .connection-item {
      background: var(--bg-secondary);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      padding: 15px;
      display: flex;
      align-items: center;
      gap: 15px;
    }
    
    .connection-item .backend {
      background: rgba(249, 115, 22, 0.2);
      color: var(--accent-orange);
      padding: 8px 12px;
      border-radius: 6px;
      font-weight: 600;
    }
    
    .connection-item .arrow {
      color: var(--text-secondary);
    }
    
    .connection-item .frontend {
      background: rgba(6, 182, 212, 0.2);
      color: var(--accent-cyan);
      padding: 8px 12px;
      border-radius: 6px;
      font-weight: 600;
    }
    
    /* Projects */
    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }
    
    .project-card {
      background: var(--bg-secondary);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 20px;
    }
    
    .project-card .name {
      font-size: 1.3rem;
      font-weight: 700;
      margin-bottom: 10px;
    }
    
    .project-card .meta {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }
    
    .project-card .modules-count {
      margin-top: 15px;
      display: flex;
      gap: 15px;
    }
    
    .project-card .count-item {
      padding: 8px 12px;
      background: var(--bg-tertiary);
      border-radius: 6px;
      font-size: 0.85rem;
    }
    
    /* Diagnostics */
    .diagnostic {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 12px 20px;
      background: var(--bg-secondary);
      border-radius: 8px;
      margin-bottom: 10px;
    }
    
    .diagnostic.pass { border-left: 4px solid var(--accent-green); }
    .diagnostic.warn { border-left: 4px solid var(--accent-yellow); }
    .diagnostic.fail { border-left: 4px solid var(--accent-red); }
    
    .diagnostic-icon { font-size: 1.2rem; }
    .diagnostic-test { font-weight: 600; flex: 1; }
    .diagnostic-message { color: var(--text-secondary); font-size: 0.9rem; }
    
    /* Source Platforms */
    .platforms-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
    
    .platform-card {
      background: var(--bg-secondary);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 20px;
    }
    
    .platform-card .header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 10px;
    }
    
    .platform-card .icon { font-size: 2rem; }
    .platform-card .name { font-size: 1.2rem; font-weight: 700; }
    .platform-card .desc { font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 10px; }
    .platform-card .path { font-family: 'Consolas', monospace; font-size: 0.75rem; color: var(--text-secondary); word-break: break-all; }
    
    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .status-badge.production { background: var(--accent-green); color: #000; }
    .status-badge.archived { background: var(--accent-yellow); color: #000; }
    
    /* AI Context */
    .ai-context {
      background: var(--bg-secondary);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 25px;
    }
    
    .ai-context pre {
      background: var(--bg-primary);
      padding: 20px;
      border-radius: 8px;
      overflow-x: auto;
      font-size: 0.85rem;
      margin: 15px 0;
      max-height: 500px;
      overflow-y: auto;
    }
    
    .copy-btn {
      background: linear-gradient(135deg, var(--accent-orange), var(--accent-purple));
      border: none;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.95rem;
      font-weight: 600;
    }
    
    .copy-btn:hover { opacity: 0.9; }
    
    /* Footer */
    .footer {
      text-align: center;
      padding: 40px;
      color: var(--text-secondary);
      border-top: 1px solid rgba(255,255,255,0.1);
      margin-top: 50px;
    }
    
    /* Search */
    .search-box {
      background: var(--bg-tertiary);
      border: 1px solid rgba(255,255,255,0.1);
      color: var(--text-primary);
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 1rem;
      width: 100%;
      max-width: 400px;
      margin-bottom: 25px;
    }
    
    .search-box:focus {
      outline: none;
      border-color: var(--accent-purple);
    }
  </style>
</head>
<body>
  <header class="header">
    <h1>📦 Module Library DevTools</h1>
    <p class="subtitle">Modular Full-Stack Application Generator</p>
    <p class="generated-at">Generated: ${new Date().toLocaleString()} | ${stats.generationTime}ms</p>
    
    <div class="health-score">
      <div class="score">${healthScore}%</div>
      <div class="label">Health</div>
    </div>
  </header>
  
  <nav class="nav">
    <button class="nav-btn active" onclick="showSection('overview')">📊 Overview</button>
    <button class="nav-btn" onclick="showSection('backend')">🔧 Backend (${stats.backendModules})</button>
    <button class="nav-btn" onclick="showSection('frontend')">🎨 Frontend (${stats.frontendModules})</button>
    <button class="nav-btn" onclick="showSection('bundles')">📦 Bundles (${stats.bundles})</button>
    <button class="nav-btn" onclick="showSection('industries')">🏭 Industries (${stats.industries})</button>
    <button class="nav-btn" onclick="showSection('connections')">🔗 Connections</button>
    <button class="nav-btn" onclick="showSection('projects')">📁 Projects (${stats.generatedProjects})</button>
    <button class="nav-btn" onclick="showSection('sources')">🗂️ Sources</button>
    <button class="nav-btn" onclick="showSection('diagnostics')">🧪 Diagnostics</button>
    <button class="nav-btn" onclick="showSection('ai-context')">🤖 AI Context</button>
  </nav>
  
  <main class="main">
    <!-- OVERVIEW -->
    <section id="overview" class="section active">
      <h2 class="section-title">Module Library Overview</h2>
      <p class="section-subtitle">Your modular full-stack application foundation</p>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="value">${stats.totalModules}</div>
          <div class="label">Total Modules</div>
        </div>
        <div class="stat-card">
          <div class="value">${stats.backendModules}</div>
          <div class="label">Backend</div>
        </div>
        <div class="stat-card">
          <div class="value">${stats.frontendModules}</div>
          <div class="label">Frontend</div>
        </div>
        <div class="stat-card">
          <div class="value">${stats.totalFiles}</div>
          <div class="label">Total Files</div>
        </div>
        <div class="stat-card">
          <div class="value">${formatBytes(stats.totalSize)}</div>
          <div class="label">Total Size</div>
        </div>
        <div class="stat-card">
          <div class="value">${stats.bundles}</div>
          <div class="label">Bundles</div>
        </div>
        <div class="stat-card">
          <div class="value">${stats.industries}</div>
          <div class="label">Industries</div>
        </div>
        <div class="stat-card">
          <div class="value">${stats.generatedProjects}</div>
          <div class="label">Projects</div>
        </div>
      </div>
      
      <h3 style="margin-bottom: 20px;">Quick Commands</h3>
      <div style="background: var(--bg-secondary); border-radius: 12px; padding: 25px; font-family: 'Consolas', monospace;">
        <div style="margin-bottom: 15px;">
          <span style="color: var(--text-secondary);"># List all modules</span><br>
          <span style="color: var(--accent-cyan);">node extract-modules.cjs --list</span>
        </div>
        <div style="margin-bottom: 15px;">
          <span style="color: var(--text-secondary);"># Generate a project by industry</span><br>
          <span style="color: var(--accent-cyan);">node assemble-project.cjs --name "MyApp" --industry collectibles</span>
        </div>
        <div style="margin-bottom: 15px;">
          <span style="color: var(--text-secondary);"># Generate a project by bundles</span><br>
          <span style="color: var(--accent-cyan);">node assemble-project.cjs --name "MyApp" --bundles core,commerce,dashboard</span>
        </div>
        <div>
          <span style="color: var(--text-secondary);"># Regenerate this devtools</span><br>
          <span style="color: var(--accent-cyan);">node generate-devtools.cjs</span>
        </div>
      </div>
    </section>
    
    <!-- BACKEND MODULES -->
    <section id="backend" class="section">
      <h2 class="section-title">Backend Modules (${stats.backendModules})</h2>
      <p class="section-subtitle">Routes, services, middleware, and models</p>
      
      <input type="text" class="search-box" placeholder="Search backend modules..." onkeyup="searchModules(this.value, 'backend')">
      
      <div class="modules-grid">
        ${backendModules.map(m => `
          <div class="module-card backend" data-name="${m.name}">
            <div class="name">${m.name}</div>
            <div class="meta">${m.fileCount} files | ${formatBytes(m.totalSize)} | Source: ${m.source}</div>
            <div class="files">
              ${m.files.slice(0, 10).map(f => `<div>${f.path}</div>`).join('')}
              ${m.files.length > 10 ? `<div style="color: var(--accent-purple);">... and ${m.files.length - 10} more</div>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </section>
    
    <!-- FRONTEND MODULES -->
    <section id="frontend" class="section">
      <h2 class="section-title">Frontend Modules (${stats.frontendModules})</h2>
      <p class="section-subtitle">Components, pages, context, and hooks</p>
      
      <input type="text" class="search-box" placeholder="Search frontend modules..." onkeyup="searchModules(this.value, 'frontend')">
      
      <div class="modules-grid">
        ${frontendModules.map(m => `
          <div class="module-card frontend" data-name="${m.name}">
            <div class="name">${m.name}</div>
            <div class="meta">${m.fileCount} files | ${formatBytes(m.totalSize)} | Source: ${m.source}</div>
            <div class="files">
              ${m.files.slice(0, 10).map(f => `<div>${f.path}</div>`).join('')}
              ${m.files.length > 10 ? `<div style="color: var(--accent-purple);">... and ${m.files.length - 10} more</div>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </section>
    
    <!-- BUNDLES -->
    <section id="bundles" class="section">
      <h2 class="section-title">Module Bundles (${stats.bundles})</h2>
      <p class="section-subtitle">Pre-configured module combinations</p>
      
      <div class="bundles-grid">
        ${Object.entries(BUNDLES).map(([name, bundle]) => `
          <div class="bundle-card">
            <div class="bundle-header">
              <div class="name">${name}</div>
              <div class="desc">${bundle.description}</div>
            </div>
            <div class="bundle-body">
              <div class="bundle-section">
                <div class="bundle-section-title">Backend (${bundle.backend.length})</div>
                <div class="module-chips">
                  ${bundle.backend.map(m => `<span class="module-chip backend">${m}</span>`).join('')}
                  ${bundle.backend.length === 0 ? '<span style="color: var(--text-secondary);">None</span>' : ''}
                </div>
              </div>
              <div class="bundle-section">
                <div class="bundle-section-title">Frontend (${bundle.frontend.length})</div>
                <div class="module-chips">
                  ${bundle.frontend.map(m => `<span class="module-chip frontend">${m}</span>`).join('')}
                  ${bundle.frontend.length === 0 ? '<span style="color: var(--text-secondary);">None</span>' : ''}
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
    
    <!-- INDUSTRIES -->
    <section id="industries" class="section">
      <h2 class="section-title">Industry Presets (${stats.industries})</h2>
      <p class="section-subtitle">One-command project generation for specific industries</p>
      
      <div class="industry-grid">
        ${Object.entries(INDUSTRY_PRESETS).map(([key, industry]) => `
          <div class="industry-card">
            <div class="header">
              <span class="icon">${industry.icon}</span>
              <div>
                <div class="name">${industry.name}</div>
                <div class="desc">${industry.description}</div>
              </div>
            </div>
            <div class="bundles-used">
              <div class="label">Bundles included:</div>
              ${industry.bundles.map(b => `<span class="bundle-tag">${b}</span>`).join('')}
            </div>
            <div style="margin-top: 15px; font-family: 'Consolas', monospace; font-size: 0.8rem; color: var(--accent-cyan);">
              node assemble-project.cjs --name "App" --industry ${key}
            </div>
          </div>
        `).join('')}
      </div>
    </section>
    
    <!-- CONNECTIONS -->
    <section id="connections" class="section">
      <h2 class="section-title">Module Connections (${stats.connections})</h2>
      <p class="section-subtitle">How backend and frontend modules connect</p>
      
      <div class="connections-list">
        ${connections.map(c => `
          <div class="connection-item">
            <span class="backend">${c.backend}</span>
            <span class="arrow">→</span>
            <span class="frontend">${c.frontend}</span>
          </div>
        `).join('')}
      </div>
    </section>
    
    <!-- GENERATED PROJECTS -->
    <section id="projects" class="section">
      <h2 class="section-title">Generated Projects (${stats.generatedProjects})</h2>
      <p class="section-subtitle">Projects assembled from this library</p>
      
      ${generatedProjects.length === 0 ? '<p style="color: var(--text-secondary);">No projects generated yet. Use assemble-project.cjs to create one!</p>' : ''}
      
      <div class="projects-grid">
        ${generatedProjects.map(p => `
          <div class="project-card">
            <div class="name">${p.name}</div>
            <div class="meta">
              ${p.manifest ? `Generated: ${new Date(p.manifest.generatedAt).toLocaleString()}` : 'No manifest found'}
            </div>
            ${p.manifest ? `
              <div class="modules-count">
                <span class="count-item">🔧 ${p.manifest.counts?.backendModules || 0} backend</span>
                <span class="count-item">🎨 ${p.manifest.counts?.frontendModules || 0} frontend</span>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </section>
    
    <!-- SOURCE PLATFORMS -->
    <section id="sources" class="section">
      <h2 class="section-title">Source Platforms (${stats.sourcePlatforms})</h2>
      <p class="section-subtitle">Where modules were extracted from</p>
      
      <div class="platforms-grid">
        ${Object.entries(SOURCE_PLATFORMS).map(([key, platform]) => `
          <div class="platform-card">
            <div class="header">
              <span class="icon">${platform.icon}</span>
              <span class="name">${platform.name}</span>
              <span class="status-badge ${platform.status}">${platform.status}</span>
            </div>
            <div class="desc">${platform.description}</div>
            <div class="path">${platform.path}</div>
          </div>
        `).join('')}
      </div>
    </section>
    
    <!-- DIAGNOSTICS -->
    <section id="diagnostics" class="section">
      <h2 class="section-title">Diagnostics (${diagnostics.length} tests)</h2>
      <p class="section-subtitle">System health checks</p>
      
      <div class="stats-grid" style="margin-bottom: 30px;">
        <div class="stat-card">
          <div class="value" style="color: var(--accent-green);">${stats.diagnosticsPassed}</div>
          <div class="label">Passed</div>
        </div>
        <div class="stat-card">
          <div class="value" style="color: var(--accent-yellow);">${stats.diagnosticsWarnings}</div>
          <div class="label">Warnings</div>
        </div>
        <div class="stat-card">
          <div class="value" style="color: var(--accent-red);">${stats.diagnosticsFailed}</div>
          <div class="label">Failed</div>
        </div>
      </div>
      
      ${diagnostics.map(d => `
        <div class="diagnostic ${d.status}">
          <span class="diagnostic-icon">${d.status === 'pass' ? '✅' : d.status === 'warn' ? '⚠️' : '❌'}</span>
          <span class="diagnostic-test">${d.test}</span>
          <span class="diagnostic-message">${d.message}</span>
        </div>
      `).join('')}
    </section>
    
    <!-- AI CONTEXT -->
    <section id="ai-context" class="section">
      <h2 class="section-title">🤖 AI Context</h2>
      <p class="section-subtitle">Copy this to give Claude full awareness of your module library</p>
      
      <div class="ai-context">
        <button class="copy-btn" onclick="copyAIContext()">📋 Copy to Clipboard</button>
        
        <pre id="ai-context-text">${generateAIContext(backendModules, frontendModules, stats)}</pre>
      </div>
    </section>
  </main>
  
  <footer class="footer">
    <p><strong>Module Library DevTools</strong></p>
    <p style="margin-top: 10px;">${stats.totalModules} Modules | ${stats.bundles} Bundles | ${stats.industries} Industries</p>
    <p style="margin-top: 5px; font-size: 0.85rem;">Generated: ${new Date().toISOString()}</p>
  </footer>
  
  <script>
    function showSection(id) {
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      document.getElementById(id).classList.add('active');
      event.target.classList.add('active');
    }
    
    function searchModules(query, type) {
      query = query.toLowerCase();
      document.querySelectorAll('#' + type + ' .module-card').forEach(card => {
        const name = card.dataset.name.toLowerCase();
        card.style.display = name.includes(query) ? '' : 'none';
      });
    }
    
    function copyAIContext() {
      const text = document.getElementById('ai-context-text').textContent;
      navigator.clipboard.writeText(text).then(() => {
        const btn = event.target;
        btn.textContent = '✅ Copied!';
        setTimeout(() => btn.textContent = '📋 Copy to Clipboard', 2000);
      });
    }
  </script>
</body>
</html>`;
}

function generateAIContext(backendModules, frontendModules, stats) {
  const backendList = backendModules.map(m => '  - ' + m.name + ' (' + m.fileCount + ' files, source: ' + m.source + ')').join('\n');
  const frontendList = frontendModules.map(m => '  - ' + m.name + ' (' + m.fileCount + ' files, source: ' + m.source + ')').join('\n');
  const bundlesList = Object.entries(BUNDLES).map(([name, b]) => 
    '  - ' + name + ': ' + b.backend.join(', ') + ' | ' + b.frontend.join(', ')
  ).join('\n');
  const industriesList = Object.entries(INDUSTRY_PRESETS).map(([key, i]) => 
    '  - ' + key + ': ' + i.name + ' (bundles: ' + i.bundles.join(', ') + ')'
  ).join('\n');

  return `# Module Library Context
# Generated: ${stats.generatedAt}
# Use this to understand the module library architecture

## What is This?
A modular full-stack application library extracted from 7 production platforms.
Enables instant project generation by assembling pre-built, tested modules.

## Location
C:\\\\Users\\\\huddl\\\\OneDrive\\\\Desktop\\\\module-library

## Stats
- Backend Modules: ${stats.backendModules}
- Frontend Modules: ${stats.frontendModules}
- Total Files: ${stats.totalFiles}
- Bundles: ${stats.bundles}
- Industry Presets: ${stats.industries}

## Backend Modules (${stats.backendModules})
${backendList}

## Frontend Modules (${stats.frontendModules})
${frontendList}

## Bundles
${bundlesList}

## Industry Presets
${industriesList}

## Key Scripts
- extract-modules.cjs: Extract modules from source platforms
- assemble-project.cjs: Generate new projects from modules
- generate-devtools.cjs: Regenerate this documentation

## Usage Examples
# List all modules
node extract-modules.cjs --list

# Generate by industry
node assemble-project.cjs --name "MyApp" --industry collectibles

# Generate by bundles
node assemble-project.cjs --name "MyApp" --bundles core,commerce,dashboard

# Generate with specific modules
node assemble-project.cjs --name "MyApp" --modules auth,stripe-payments,login-form

## Output Location
Generated projects go to: C:\\Users\\huddl\\OneDrive\\Desktop\\generated-projects`;
}

// Run the generator
generateDevTools();
