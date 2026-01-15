#!/usr/bin/env node

/**
 * Module Library - Project Assembler (v3 - AUTO-WIRED with correct paths)
 *
 * Assembles full-stack projects from the module library with:
 * - Auto-wired backend routes in server.js
 * - Auto-generated App.jsx with React Router
 * - Ready to run with npm install && npm run dev
 *
 * Environment Variables:
 * - MODULE_LIBRARY_PATH: Root of the module library (default: parent of scripts/)
 * - OUTPUT_PATH: Where to generate projects (default: ../generated-projects)
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

// ============================================
// PATHS - Environment-based with sensible defaults
// ============================================

const MODULE_LIBRARY = process.env.MODULE_LIBRARY_PATH || path.resolve(__dirname, '..');
const OUTPUT_BASE = process.env.OUTPUT_PATH || path.resolve(__dirname, '..', '..', 'generated-projects');

// Validate paths on startup
if (!fs.existsSync(MODULE_LIBRARY)) {
  console.error(`❌ MODULE_LIBRARY_PATH not found: ${MODULE_LIBRARY}`);
  console.error('   Set MODULE_LIBRARY_PATH environment variable or ensure module-library exists');
  process.exit(1);
}

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_BASE)) {
  fs.mkdirSync(OUTPUT_BASE, { recursive: true });
  console.log(`📁 Created output directory: ${OUTPUT_BASE}`);
}

const BACKEND_MODULES_PATH = path.join(MODULE_LIBRARY, 'backend');
const FRONTEND_MODULES_PATH = path.join(MODULE_LIBRARY, 'frontend');

// Validate module directories exist
if (!fs.existsSync(BACKEND_MODULES_PATH)) {
  console.error(`❌ Backend modules not found: ${BACKEND_MODULES_PATH}`);
  process.exit(1);
}
if (!fs.existsSync(FRONTEND_MODULES_PATH)) {
  console.error(`❌ Frontend modules not found: ${FRONTEND_MODULES_PATH}`);
  process.exit(1);
}

// ============================================
// ROUTE MAPPINGS - Maps module names to API routes and actual file paths
// ============================================

const ROUTE_MAPPINGS = {
  // Core
  'auth': { route: '/api/auth', routeFile: 'routes/auth.js' },
  'file-upload': { route: '/api/upload', routeFile: 'routes/upload.js' },
  
  // Dashboard
  'admin-dashboard': { route: '/api/admin', routeFile: 'routes/admin.js' },
  'analytics': { route: '/api/analytics', routeFile: 'routes/analytics.js' },
  'admin-api': { route: '/api/admin', routeFile: 'index.js', isModule: true },
  
  // Commerce
  'stripe-payments': { route: '/api/payments', routeFile: 'routes/payments.js' },
  'payments': { route: '/api/billing', routeFile: 'routes/billing.js' },
  'inventory': { route: '/api/inventory', routeFile: 'routes/inventory.js' },
  'marketplace': { route: '/api/marketplace', routeFile: 'routes/marketplace.js' },
  'vendor-system': { route: '/api/vendors', routeFile: 'routes/vendors.js' },
  'transfers': { route: '/api/transfers', routeFile: 'routes/transfers.js' },
  
  // Social
  'notifications': { route: '/api/notifications', routeFile: 'routes/notifications.js' },
  'chat': { route: '/api/chat', routeFile: 'routes/chat.js' },
  'social-feed': { route: '/api/feed', routeFile: 'routes/feed.js' },
  'posts': { route: '/api/posts', routeFile: 'routes/posts.js' },
  
  // Collectibles
  'ai-scanner': { route: '/api/scanner', routeFile: 'routes/scanner.js' },
  'collections': { route: '/api/collections', routeFile: 'routes/collections.js' },
  'ebay-integration': { route: '/api/ebay', routeFile: 'routes/ebay.js' },
  'nfc-tags': { route: '/api/nfc', routeFile: 'routes/nfc.js' },
  'showcase': { route: '/api/showcase', routeFile: 'routes/showcase.js' },
  
  // Sports
  'fantasy': { route: '/api/fantasy', routeFile: 'routes/fantasy.js' },
  'betting': { route: '/api/betting', routeFile: 'routes/betting.js' },
  'leaderboard': { route: '/api/leaderboard', routeFile: 'routes/leaderboard.js' },
  'pools': { route: '/api/pools', routeFile: 'routes/pools.js' },
  'schools': { route: '/api/schools', routeFile: 'routes/schools.js' },
  
  // Healthcare
  'booking': { route: '/api/booking', routeFile: 'routes/booking.js' },
  
  // Family
  'calendar': { route: '/api/calendar', routeFile: 'routes/calendar.js' },
  'tasks': { route: '/api/tasks', routeFile: 'routes/tasks.js' },
  'meals': { route: '/api/meals', routeFile: 'routes/meals.js' },
  'kids-banking': { route: '/api/kids-banking', routeFile: 'routes/kids-banking.js' },
  'family-groups': { route: '/api/family', routeFile: 'routes/family.js' },
  'documents': { route: '/api/documents', routeFile: 'routes/documents.js' },
  
  // Gamification
  'achievements': { route: '/api/achievements', routeFile: 'routes/achievements.js' },
  'portfolio': { route: '/api/portfolio', routeFile: 'routes/portfolio.js' },

  // Survey Rewards (CommonCents)
  'surveys': { route: '/api/surveys', routeFile: 'routes/surveys.js' },
  'streaks': { route: '/api/streaks', routeFile: 'routes/streaks.js' },
  'daily-spin': { route: '/api/spin', routeFile: 'routes/spin.js' },
  'cashouts': { route: '/api/cashouts', routeFile: 'routes/cashouts.js' },
  'user-balance': { route: '/api/balance', routeFile: 'routes/balance.js' },

  // Other
  'page-generator': { route: '/api/pages', routeFile: 'routes/pages.js' }
};

// ============================================
// FRONTEND COMPONENT MAPPINGS
// ============================================

const FRONTEND_MAPPINGS = {
  'login-form': { component: 'LoginForm', path: '/login' },
  'register-form': { component: 'RegisterForm', path: '/register' },
  'header-nav': { component: 'HeaderNav', layout: true },
  'footer-section': { component: 'Footer', layout: true },
  'modal-system': { component: 'ModalProvider', provider: true },
  'auth-context': { component: 'AuthProvider', provider: true },
  'stat-cards': { component: 'StatCards', path: '/dashboard' },
  'data-table': { component: 'DataTable' },
  'admin-panel': { component: 'AdminPanel', path: '/admin' },
  'collection-grid': { component: 'CollectionGrid', path: '/collection' },
  'item-detail': { component: 'ItemDetail', path: '/item/:id' },
  'file-uploader': { component: 'FileUploader' },
  'checkout-flow': { component: 'Checkout', path: '/checkout' },
  'pricing-table': { component: 'PricingTable', path: '/pricing' },
  'settings-panel': { component: 'Settings', path: '/settings' },
  'search-filter': { component: 'SearchFilter' },
  'image-gallery': { component: 'ImageGallery' },
  'trading-hub': { component: 'TradingHub', path: '/trading' },
  'marketplace-ui': { component: 'Marketplace', path: '/marketplace' },
  'card-components': { component: 'CardComponents' },

  // Survey Rewards (CommonCents)
  'spin-wheel': { component: 'SpinWheel', path: '/rewards' },
  'streak-tracker': { component: 'StreakTracker' },
  'survey-card': { component: 'SurveyList', path: '/earn' },
  'balance-display': { component: 'BalanceDisplay' },
  'level-progress': { component: 'LevelProgress' }
};

// ============================================
// BUNDLES
// ============================================

const BUNDLES = {
  'core': {
  backend: ['auth', 'file-upload'],
  frontend: ['login-form', 'register-form', 'header-nav', 'footer-section', 'modal-system', 'auth-context', 'auth-pages']
},
  'dashboard': {
    backend: ['admin-dashboard', 'analytics', 'admin-api'],
    frontend: ['stat-cards', 'data-table', 'admin-panel']
  },
  'commerce': {
    backend: ['stripe-payments', 'payments', 'inventory', 'marketplace', 'vendor-system', 'transfers'],
    frontend: ['checkout-flow', 'pricing-table', 'marketplace-ui', 'trading-hub']
  },
  'social': {
    backend: ['notifications', 'chat', 'social-feed', 'posts'],
    frontend: ['card-components']
  },
  'collectibles': {
    backend: ['ai-scanner', 'collections', 'ebay-integration', 'nfc-tags', 'showcase'],
    frontend: ['collection-grid', 'item-detail', 'file-uploader', 'image-gallery', 'search-filter']
  },
  'sports': {
    backend: ['fantasy', 'betting', 'leaderboard', 'pools', 'schools'],
    frontend: []
  },
  'healthcare': {
    backend: ['booking'],
    frontend: ['settings-panel']
  },
  'family': {
    backend: ['calendar', 'tasks', 'meals', 'kids-banking', 'family-groups', 'documents'],
    frontend: []
  },
  'gamification': {
    backend: ['achievements', 'portfolio'],
    frontend: []
  },
  'survey-rewards': {
    backend: ['auth', 'surveys', 'streaks', 'daily-spin', 'achievements', 'user-balance', 'cashouts', 'notifications', 'analytics', 'fraud-detection', 'honeypot', 'payout-verification', 'onboarding'],
    frontend: ['auth-pages', 'spin-wheel', 'streak-tracker', 'survey-card', 'balance-display', 'level-progress', 'stat-cards', 'business-admin', 'header-nav', 'footer-section', 'modal-system', 'welcome-screen', 'onboarding-wizard', 'verification-badge']
  }
};

// ============================================
// INDUSTRY PRESETS - Load from JSON + defaults
// ============================================

// Try to load from industries.json, fall back to defaults
let INDUSTRIES_FROM_JSON = {};
try {
  const industriesPath = path.join(MODULE_LIBRARY, 'prompts', 'industries.json');
  if (fs.existsSync(industriesPath)) {
    INDUSTRIES_FROM_JSON = JSON.parse(fs.readFileSync(industriesPath, 'utf-8'));
    console.log(`📋 Loaded ${Object.keys(INDUSTRIES_FROM_JSON).length} industries from JSON`);
  }
} catch (e) {
  console.log('⚠️ Could not load industries.json, using defaults');
}

// Default bundle mappings for industries (used when JSON doesn't specify)
const DEFAULT_BUNDLES = {
  'restaurant': { bundles: ['core', 'commerce'], additionalBackend: ['booking', 'inventory', 'notifications'], additionalFrontend: ['image-gallery', 'search-filter'] },
  'healthcare': { bundles: ['core', 'dashboard', 'healthcare'], additionalBackend: ['notifications', 'chat', 'documents'], additionalFrontend: [] },
  'dental': { bundles: ['core', 'dashboard', 'healthcare'], additionalBackend: ['booking', 'notifications'], additionalFrontend: [] },
  'ecommerce': { bundles: ['core', 'commerce', 'dashboard'], additionalBackend: ['notifications'], additionalFrontend: ['search-filter', 'image-gallery'] },
  'collectibles': { bundles: ['core', 'commerce', 'collectibles', 'dashboard'], additionalBackend: [], additionalFrontend: [] },
  'sports': { bundles: ['core', 'social', 'sports', 'dashboard'], additionalBackend: ['notifications'], additionalFrontend: [] },
  'saas': { bundles: ['core', 'commerce', 'dashboard', 'gamification'], additionalBackend: ['notifications', 'analytics'], additionalFrontend: [] },
  'startup': { bundles: ['core', 'commerce', 'dashboard'], additionalBackend: ['notifications', 'analytics'], additionalFrontend: [] },
  'family': { bundles: ['core', 'family', 'social'], additionalBackend: [], additionalFrontend: [] },
  'law-firm': { bundles: ['core', 'dashboard'], additionalBackend: ['booking', 'documents', 'notifications'], additionalFrontend: [] },
  'accounting': { bundles: ['core', 'dashboard'], additionalBackend: ['documents', 'notifications'], additionalFrontend: [] },
  'real-estate': { bundles: ['core', 'commerce', 'dashboard'], additionalBackend: ['booking', 'notifications'], additionalFrontend: ['image-gallery', 'search-filter'] },
  'fitness': { bundles: ['core', 'commerce', 'dashboard'], additionalBackend: ['booking', 'notifications'], additionalFrontend: [] },
  'photography': { bundles: ['core', 'commerce'], additionalBackend: ['booking', 'notifications'], additionalFrontend: ['image-gallery'] },
  'coffee-shop': { bundles: ['core', 'commerce'], additionalBackend: ['inventory', 'notifications'], additionalFrontend: ['image-gallery'] },
  'agency': { bundles: ['core', 'dashboard'], additionalBackend: ['notifications'], additionalFrontend: [] },
  'consulting': { bundles: ['core', 'dashboard'], additionalBackend: ['booking', 'documents', 'notifications'], additionalFrontend: [] },
  'hotel': { bundles: ['core', 'commerce', 'dashboard'], additionalBackend: ['booking', 'notifications'], additionalFrontend: ['image-gallery'] },
  'spa-salon': { bundles: ['core', 'commerce'], additionalBackend: ['booking', 'notifications'], additionalFrontend: ['image-gallery'] },
  'construction': { bundles: ['core', 'dashboard'], additionalBackend: ['documents', 'notifications'], additionalFrontend: ['image-gallery'] },
  'plumber': { bundles: ['core'], additionalBackend: ['booking', 'notifications'], additionalFrontend: [] },
  'electrician': { bundles: ['core'], additionalBackend: ['booking', 'notifications'], additionalFrontend: [] },
  'hvac': { bundles: ['core'], additionalBackend: ['booking', 'notifications'], additionalFrontend: [] },
  'cleaning': { bundles: ['core', 'commerce'], additionalBackend: ['booking', 'notifications'], additionalFrontend: [] },
  'landscaping': { bundles: ['core'], additionalBackend: ['booking', 'notifications'], additionalFrontend: ['image-gallery'] },
  'roofing': { bundles: ['core'], additionalBackend: ['booking', 'notifications'], additionalFrontend: ['image-gallery'] },
  'moving': { bundles: ['core', 'commerce'], additionalBackend: ['booking', 'notifications'], additionalFrontend: [] },
  'auto-repair': { bundles: ['core'], additionalBackend: ['booking', 'inventory', 'notifications'], additionalFrontend: [] },
  'veterinary': { bundles: ['core', 'healthcare'], additionalBackend: ['booking', 'notifications'], additionalFrontend: [] },
  'daycare': { bundles: ['core', 'family'], additionalBackend: ['booking', 'notifications', 'documents'], additionalFrontend: [] },
  'tutoring': { bundles: ['core'], additionalBackend: ['booking', 'notifications'], additionalFrontend: [] },
  'music-school': { bundles: ['core'], additionalBackend: ['booking', 'notifications'], additionalFrontend: [] },
  'yoga-studio': { bundles: ['core', 'commerce'], additionalBackend: ['booking', 'notifications'], additionalFrontend: [] },
  'martial-arts': { bundles: ['core', 'commerce'], additionalBackend: ['booking', 'notifications'], additionalFrontend: [] },
  'church': { bundles: ['core', 'social'], additionalBackend: ['calendar', 'notifications'], additionalFrontend: [] },
  'nonprofit': { bundles: ['core', 'social'], additionalBackend: ['notifications'], additionalFrontend: [] },
  'event-venue': { bundles: ['core', 'commerce'], additionalBackend: ['booking', 'notifications'], additionalFrontend: ['image-gallery'] },
  'florist': { bundles: ['core', 'commerce'], additionalBackend: ['inventory', 'notifications'], additionalFrontend: ['image-gallery'] },
  'bakery': { bundles: ['core', 'commerce'], additionalBackend: ['inventory', 'notifications'], additionalFrontend: ['image-gallery'] },
  'brewery': { bundles: ['core', 'commerce'], additionalBackend: ['inventory', 'notifications'], additionalFrontend: ['image-gallery'] },
  'winery': { bundles: ['core', 'commerce'], additionalBackend: ['booking', 'inventory', 'notifications'], additionalFrontend: ['image-gallery'] },
  'insurance': { bundles: ['core', 'dashboard'], additionalBackend: ['documents', 'notifications'], additionalFrontend: [] },
  'financial-advisor': { bundles: ['core', 'dashboard'], additionalBackend: ['booking', 'documents', 'notifications'], additionalFrontend: [] },
  'survey-rewards': { bundles: ['survey-rewards'], additionalBackend: [], additionalFrontend: [] }
};

// Build INDUSTRY_PRESETS from JSON + defaults
const INDUSTRY_PRESETS = {};
for (const [key, industry] of Object.entries(INDUSTRIES_FROM_JSON)) {
  const defaults = DEFAULT_BUNDLES[key] || { bundles: ['core'], additionalBackend: [], additionalFrontend: [] };
  INDUSTRY_PRESETS[key] = {
    name: industry.name,
    bundles: industry.bundles || defaults.bundles,
    additionalBackend: industry.additionalBackend || defaults.additionalBackend,
    additionalFrontend: industry.additionalFrontend || defaults.additionalFrontend
  };
}

// Add any defaults not in JSON
for (const [key, defaults] of Object.entries(DEFAULT_BUNDLES)) {
  if (!INDUSTRY_PRESETS[key]) {
    INDUSTRY_PRESETS[key] = {
      name: key.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      ...defaults
    };
  }
}

console.log(`✅ ${Object.keys(INDUSTRY_PRESETS).length} industries available`);

// ============================================
// HELPER FUNCTIONS
// ============================================

function copyDirectorySync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectorySync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Regenerate package-lock.json for a folder
 * Deletes existing lock file and runs npm install to create fresh one
 * This prevents "npm ci" errors on Railway when package.json was modified
 */
function regeneratePackageLock(folderPath, folderName) {
  const packageJsonPath = path.join(folderPath, 'package.json');
  const packageLockPath = path.join(folderPath, 'package-lock.json');

  // Only process if package.json exists
  if (!fs.existsSync(packageJsonPath)) {
    return false;
  }

  console.log(`   📦 Regenerating package-lock.json for ${folderName}...`);

  try {
    // Delete existing package-lock.json if it exists
    if (fs.existsSync(packageLockPath)) {
      fs.unlinkSync(packageLockPath);
    }

    // Run npm install to generate fresh package-lock.json
    // Use --package-lock-only to just update the lock file without installing node_modules
    execSync('npm install --package-lock-only --legacy-peer-deps', {
      cwd: folderPath,
      stdio: 'pipe',
      timeout: 120000, // 2 minute timeout
      windowsHide: true
    });

    if (fs.existsSync(packageLockPath)) {
      console.log(`      ✅ Generated fresh package-lock.json`);
      return true;
    } else {
      console.log(`      ⚠️ package-lock.json not created`);
      return false;
    }
  } catch (error) {
    console.log(`      ⚠️ Failed to regenerate: ${error.message}`);
    // Try fallback: full npm install
    try {
      execSync('npm install --legacy-peer-deps', {
        cwd: folderPath,
        stdio: 'pipe',
        timeout: 180000, // 3 minute timeout
        windowsHide: true
      });
      if (fs.existsSync(packageLockPath)) {
        console.log(`      ✅ Generated via full install`);
        return true;
      }
    } catch (fallbackError) {
      // Silently fail - deployment script will handle it
    }
    return false;
  }
}

function getModulesForIndustry(industryKey) {
  const industry = INDUSTRY_PRESETS[industryKey];
  if (!industry) return { backend: [], frontend: [] };
  
  const backend = new Set();
  const frontend = new Set();
  
  for (const bundleKey of industry.bundles) {
    const bundle = BUNDLES[bundleKey];
    if (bundle) {
      bundle.backend.forEach(m => backend.add(m));
      bundle.frontend.forEach(m => frontend.add(m));
    }
  }
  
  industry.additionalBackend?.forEach(m => backend.add(m));
  industry.additionalFrontend?.forEach(m => frontend.add(m));
  
  return {
    backend: Array.from(backend),
    frontend: Array.from(frontend)
  };
}

function getModulesForBundles(bundleKeys) {
  const backend = new Set();
  const frontend = new Set();
  
  for (const bundleKey of bundleKeys) {
    const bundle = BUNDLES[bundleKey];
    if (bundle) {
      bundle.backend.forEach(m => backend.add(m));
      bundle.frontend.forEach(m => frontend.add(m));
    }
  }
  
  return {
    backend: Array.from(backend),
    frontend: Array.from(frontend)
  };
}

// Find actual route file in module directory
function findRouteFile(modulePath, moduleName) {
  const routesDir = path.join(modulePath, 'routes');

  if (!fs.existsSync(routesDir)) {
    // Check for index.js in module root
    const indexFile = path.join(modulePath, 'index.js');
    if (fs.existsSync(indexFile)) return 'index.js';
    console.warn(`   ⚠️ Module "${moduleName}" has no routes/ directory or index.js - skipping`);
    return null;
  }

  // Get first .js file in routes directory
  const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));
  if (files.length > 0) {
    if (files.length > 1) {
      console.warn(`   ⚠️ Module "${moduleName}" has multiple route files, using: ${files[0]}`);
    }
    return `routes/${files[0]}`;
  }

  console.warn(`   ⚠️ Module "${moduleName}" routes/ directory is empty - skipping`);
  return null;
}

// ============================================
// GENERATE MODEL STUBS (MongoDB/Mongoose compatible)
// ============================================

function generateModelStub(modelName) {
  return `/**
 * ${modelName} Model Stub
 * Auto-generated - Replace with actual schema
 */

const mongoose = require('mongoose');

const ${modelName}Schema = new mongoose.Schema({
  // Add your schema fields here
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.models.${modelName} || mongoose.model('${modelName}', ${modelName}Schema);
`;
}

// ============================================
// RALPH WIGGUM VALIDATION - Pre-flight checks
// ============================================

function validateGeneratedProject(projectDir) {
  const issues = [];
  const fixes = [];
  const frontendSrc = path.join(projectDir, 'frontend', 'src');
  const pagesDir = path.join(frontendSrc, 'pages');
  const adminHooks = path.join(projectDir, 'frontend', 'admin', 'hooks');
  
  console.log('');
  console.log('🔍 Running Ralph Wiggum validation...');
  
  // Check 1: Validate JSX files for syntax errors
  if (fs.existsSync(pagesDir)) {
    const jsxFiles = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));
    
    for (const file of jsxFiles) {
      const filePath = path.join(pagesDir, file);
      let content = fs.readFileSync(filePath, 'utf-8');
      let modified = false;
      
      // Fix common AI hallucinations
      const jsxFixes = [
        { pattern: /(\w+:\s*)(\d{1,3}),(\d{3})(\s*[,}\]])/g, replacement: '$1$2$3$4', desc: 'Remove comma from number (e.g., 1,247 → 1247)' },
        { pattern: /<2hr/g, replacement: '<hr', desc: '<2hr → <hr' },
        { pattern: /<3div/g, replacement: '<div', desc: '<3div → <div' },
        { pattern: /<1span/g, replacement: '<span', desc: '<1span → <span' },
        { pattern: /console log\(/g, replacement: 'console.log(', desc: 'console log( → console.log(' },
        { pattern: /import\s+{([^}]+)}\s+from\s+['"]\.\.\/modules\//g, replacement: 'import {$1} from \'../components/', desc: 'Fix module imports' },
        { pattern: />(\s*)<(\d+\.?\d*[a-zA-Z%]*)\s*</g, replacement: '>&lt;$2<', desc: '<number in JSX text' },
        { pattern: />(\s*)<(\$[\d,\.]+)/g, replacement: '>&lt;$2', desc: '<$amount in JSX text' },
        { pattern: />\s*<(\d+)/g, replacement: '>&lt;$1', desc: 'Bare <number' },
        // Fix missing opening quotes in object properties (e.g., id: alltime' → id: 'alltime')
        { pattern: /(\w+:\s*)([a-zA-Z_][a-zA-Z0-9_-]*)'/g, replacement: "$1'$2'", desc: 'Add missing opening quote (id: word\' → id: \'word\')' },
        // Fix missing opening quote before closing double quote
        { pattern: /(\w+:\s*)([a-zA-Z_][a-zA-Z0-9_-]*)"/g, replacement: '$1"$2"', desc: 'Add missing opening double quote' }
      ];
      
      for (const fix of jsxFixes) {
        if (fix.pattern.test(content)) {
          content = content.replace(fix.pattern, fix.replacement);
          fixes.push(`${file}: ${fix.desc}`);
          modified = true;
        }
      }
      
      // Check for unbalanced braces
      const openBraces = (content.match(/\{/g) || []).length;
      const closeBraces = (content.match(/\}/g) || []).length;
      if (openBraces !== closeBraces) {
        issues.push(`${file}: Unbalanced braces (${openBraces} open, ${closeBraces} close)`);
      }
      
      // Check for unbalanced parentheses
      const openParens = (content.match(/\(/g) || []).length;
      const closeParens = (content.match(/\)/g) || []).length;
      if (openParens !== closeParens) {
        issues.push(`${file}: Unbalanced parentheses (${openParens} open, ${closeParens} close)`);
      }
      
      // Check for missing export default
      if (!content.includes('export default')) {
        issues.push(`${file}: Missing export default`);
      }
      
      // Save if modified
      if (modified) {
        fs.writeFileSync(filePath, content);
      }
    }
  }
  
  // Check 2: Fix admin useBrain.js import issue
  const useBrainPath = path.join(adminHooks, 'useBrain.js');
  if (fs.existsSync(useBrainPath)) {
    let content = fs.readFileSync(useBrainPath, 'utf-8');
    if (content.includes("import('../config/brain.json')") || content.includes("from '../src/config/brain.json'")) {
      // Replace with API-only version
      const fixedUseBrain = generateFixedUseBrainHook();
      fs.writeFileSync(useBrainPath, fixedUseBrain);
      fixes.push('admin/hooks/useBrain.js: Removed broken local import');
    }
  }
  
  // Check 3: Verify backend auth middleware exists in each module
  const backendModules = path.join(projectDir, 'backend', 'modules');
  if (fs.existsSync(backendModules)) {
    const modules = fs.readdirSync(backendModules, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);
    
    for (const mod of modules) {
      const middlewarePath = path.join(backendModules, mod, 'middleware', 'auth.js');
      if (!fs.existsSync(middlewarePath) && mod !== 'auth') {
        // Create the middleware folder and file
        const middlewareDir = path.join(backendModules, mod, 'middleware');
        if (!fs.existsSync(middlewareDir)) {
          fs.mkdirSync(middlewareDir, { recursive: true });
        }
        fs.writeFileSync(middlewarePath, generateAuthMiddleware());
        fixes.push(`${mod}/middleware/auth.js: Created missing auth middleware`);
      }
    }
  }
  
  // Report results
  if (fixes.length > 0) {
    console.log(`   🔧 Auto-fixed ${fixes.length} issue(s):`);
    fixes.forEach(f => console.log(`      • ${f}`));
  }
  
  if (issues.length > 0) {
    console.log(`   ⚠️  ${issues.length} issue(s) need attention:`);
    issues.forEach(i => console.log(`      • ${i}`));
  }
  
  if (fixes.length === 0 && issues.length === 0) {
    console.log('   ✅ All validations passed!');
  }
  
  return { issues, fixes, valid: issues.length === 0 };
}

function generateFixedUseBrainHook() {
  return `/**
 * useBrain Hook
 * Fetches brain.json configuration from API
 */

import { useState, useEffect } from 'react';

const defaultBrain = {
  business: { name: 'My Business', tagline: '', ownerName: '' },
  theme: { primaryColor: '#22c55e', accentColor: '#3b82f6' },
  labels: { customers: 'Customers', orders: 'Orders', items: 'Items', revenue: 'Revenue' }
};

export function useBrain() {
  const [brain, setBrain] = useState(defaultBrain);
  const [business, setBusiness] = useState(defaultBrain.business);
  const [theme, setTheme] = useState(defaultBrain.theme);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBrain = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(\`\${apiUrl}/api/brain\`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.brain) {
            setBrain(data.brain);
            setBusiness(data.brain.business || defaultBrain.business);
            setTheme(data.brain.theme || defaultBrain.theme);
          }
        }
      } catch (err) {
        console.warn('Could not fetch brain config:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBrain();
  }, []);

  const refreshBrain = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(\`\${apiUrl}/api/brain\`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.brain) {
          setBrain(data.brain);
          setBusiness(data.brain.business || defaultBrain.business);
          setTheme(data.brain.theme || defaultBrain.theme);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { brain, business, theme, loading, error, refreshBrain };
}

export default useBrain;
`;
}

// All models that modules might reference
const COMMON_MODELS = [
  'User', 'Card', 'Listing', 'Trade', 'PendingAction', 'SpendingLog',
  'Family', 'Event', 'Document', 'Appointment', 'Patient', 'Provider', 
  'Practice', 'Notification', 'FamCoin', 'Meal', 'ShoppingItem', 'Recipe',
  'Inventory', 'Receipt', 'PriceHistory', 'Bet', 'Pick', 'SideBet',
  'Leaderboard', 'Reputation', 'BetAgreement'
];

// ============================================
// GENERATE SERVICE STUBS
// ============================================

function generateNotificationServiceStub() {
  return `/**
 * Notification Service Stub
 */

module.exports = {
  notifyUser: async (userId, message, type = 'info') => {
    console.log(\`📢 Notify user \${userId}: \${message}\`);
    return { success: true };
  },
  notifyParent: async (childId, message) => {
    console.log(\`📢 Notify parent of \${childId}: \${message}\`);
    return { success: true };
  }
};
`;
}

function generateSocketServiceStub() {
  return `/**
 * Socket Service Stub
 */

let io = null;

module.exports = {
  init: (server) => {
    console.log('📡 Socket service initialized (stub)');
    return io;
  },
  getIO: () => io,
  io: io,
  emit: (event, data) => {
    console.log(\`📡 Socket emit: \${event}\`, data);
  }
};
`;
}

function generateSyncServiceStub() {
  return `/**
 * Sync Service Stub
 */

module.exports = {
  syncToCalendar: async (event) => {
    console.log('🔄 Sync to calendar (stub):', event);
    return { success: true };
  },
  syncFromCalendar: async (userId) => {
    console.log('🔄 Sync from calendar (stub)');
    return [];
  }
};
`;
}

function generateCloudinaryServiceStub() {
  return `/**
 * Cloudinary Service Stub
 */

const cloudinary = require('cloudinary').v2;

// Configure if env vars exist
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

module.exports = {
  uploadImage: async (imagePath, options = {}) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      console.log('☁️ Cloudinary not configured - using stub');
      return { secure_url: 'https://via.placeholder.com/300', public_id: 'stub_' + Date.now() };
    }
    return await cloudinary.uploader.upload(imagePath, options);
  },
  deleteImage: async (publicId) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME) return { result: 'ok' };
    return await cloudinary.uploader.destroy(publicId);
  }
};
`;
}

function generateCardDatabaseLookupStub() {
  return `/**
 * Card Database Lookup Stub
 */

module.exports = {
  lookupCardInDatabase: async (cardInfo) => {
    console.log('🔍 Card lookup (stub):', cardInfo);
    return { found: false, suggestions: [] };
  },
  searchCards: async (query) => {
    return [];
  }
};
`;
}

function generateParallelMatcherStub() {
  return `/**
 * Parallel Matcher Stub
 */

module.exports = {
  matchCards: async (cards) => {
    console.log('🔄 Parallel matching (stub)');
    return cards.map(c => ({ ...c, matched: false }));
  }
};
`;
}

function generateClaudeScannerStub() {
  return `/**
 * Claude Scanner Stub
 */

const Anthropic = require('@anthropic-ai/sdk');

const client = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;

module.exports = {
  scanCard: async (imageBase64) => {
    if (!client) {
      console.log('🤖 Claude scanner not configured - using stub');
      return { success: false, error: 'API key not configured' };
    }
    // Real implementation would call Claude API
    return { success: true, data: {} };
  },
  analyzeImage: async (imageBuffer) => {
    console.log('🔍 Analyzing image (stub)');
    return { cardName: 'Unknown', set: 'Unknown', condition: 'Unknown' };
  }
};
`;
}

function generateEbayOauthStub() {
  return `/**
 * eBay OAuth Service Stub
 */

module.exports = {
  getAccessToken: async () => {
    console.log('🏷️ eBay OAuth (stub)');
    return { access_token: 'stub_token', expires_in: 7200 };
  },
  refreshToken: async (refreshToken) => {
    return { access_token: 'stub_refreshed_token' };
  },
  searchItems: async (query, options = {}) => {
    console.log('🔍 eBay search (stub):', query);
    return { items: [], total: 0 };
  },
  getItemPrice: async (itemId) => {
    return { price: 0, currency: 'USD' };
  }
};
`;
}

function generateCollageServiceStub() {
  return `/**
 * Collage Service Stub
 */

module.exports = {
  generateLotCollages: async (images, options = {}) => {
    console.log('🖼️ Generating collage (stub)');
    return { url: 'https://via.placeholder.com/800x600', images: images.length };
  },
  createCollage: async (imageUrls) => {
    return 'https://via.placeholder.com/800x600';
  }
};
`;
}

function generatePasswordResetEmailStub() {
  return `/**
 * Password Reset Email Stub
 */

module.exports = {
  sendPasswordResetEmail: async (email, resetToken) => {
    console.log('📧 Password reset email (stub) to:', email);
    return { success: true, messageId: 'stub_' + Date.now() };
  }
};
`;
}

function generateFamcoinEngineStub() {
  return `/**
 * FamCoin Engine Stub
 */

module.exports = {
  getBalance: async (userId) => {
    return { balance: 0, pending: 0 };
  },
  transfer: async (fromId, toId, amount) => {
    console.log('💰 FamCoin transfer (stub):', amount);
    return { success: true, newBalance: 0 };
  },
  earn: async (userId, amount, reason) => {
    return { success: true, earned: amount };
  }
};
`;
}

function generateMealsEngineStub() {
  return `/**
 * Meals Engine Stub
 */

module.exports = {
  planMeal: async (familyId, date, mealType) => {
    return { success: true, meal: null };
  },
  getSuggestions: async (preferences) => {
    return [];
  },
  generateShoppingList: async (meals) => {
    return [];
  }
};
`;
}

function generateCalendarServiceStub() {
  return `/**
 * Calendar Service Stub
 */

module.exports = {
  addEvent: async (event) => {
    console.log('📅 Add event (stub):', event);
    return { success: true, eventId: 'stub_' + Date.now() };
  },
  getEvents: async (userId, startDate, endDate) => {
    return [];
  },
  syncWithGoogle: async (userId) => {
    return { synced: 0 };
  }
};
`;
}

function generateFormationAnalyzerStub() {
  return `/**
 * Formation Analyzer Stub
 */

module.exports = class FormationAnalyzer {
  analyze(data) {
    console.log('⚽ Formation analysis (stub)');
    return { formation: '4-4-2', confidence: 0 };
  }
  
  getRecommendations(formation) {
    return [];
  }
};
`;
}

function generatePlayerPropsAnalyzerStub() {
  return `/**
 * Player Props Analyzer Stub
 */

module.exports = class PlayerPropsAnalyzer {
  analyze(playerId, gameId) {
    console.log('🏀 Player props analysis (stub)');
    return { props: [], confidence: 0 };
  }
  
  getBestBets(props) {
    return [];
  }
};
`;
}

// ============================================
// GENERATE AUTH MIDDLEWARE (exports ALL common names)
// ============================================

function generateAuthMiddleware() {
  return `/**
 * Auth Middleware
 * Auto-generated - exports all common naming patterns
 */

const jwt = require('jsonwebtoken');

// Main authentication function
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'dev-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Invalid token' });
    }
    req.user = {
      id: user.id,
      userId: user.id,
      email: user.email,
      is_admin: user.is_admin || false
    };
    next();
  });
}

// Admin check middleware
function isAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  if (!req.user.is_admin) {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  next();
}

// Export ALL common naming patterns
module.exports = {
  // Common names used across different modules
  authenticateToken,
  authenticate: authenticateToken,
  auth: authenticateToken,
  verifyToken: authenticateToken,
  requireAuth: authenticateToken,
  protect: authenticateToken,
  
  // Admin middleware
  isAdmin,
  adminOnly: isAdmin,
  requireAdmin: isAdmin
};
`;
}

function generateRateLimiterMiddleware() {
  return `/**
 * Rate Limiter Middleware
 * Auto-generated
 */

const rateLimit = require('express-rate-limit');

// Track usage per user
const usageMap = new Map();

const getRateLimitMiddleware = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes
    max: options.max || 100, // limit each IP
    message: { error: 'Too many requests, please try again later' }
  });
};

const incrementUsage = async (userId, feature = 'default') => {
  const key = \`\${userId}:\${feature}\`;
  const current = usageMap.get(key) || 0;
  usageMap.set(key, current + 1);
  return current + 1;
};

const getUsage = async (userId, feature = 'default') => {
  return usageMap.get(\`\${userId}:\${feature}\`) || 0;
};

module.exports = {
  getRateLimitMiddleware,
  incrementUsage,
  getUsage,
  rateLimit: getRateLimitMiddleware()
};
`;
}

// ============================================
// GENERATE SERVICE STUBS
// ============================================

function generateStripeServiceStub() {
  return `/**
 * Stripe Service Stub
 * Replace with actual Stripe integration
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = {
  createCustomer: async (email, name) => {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.log('⚠️ Stripe not configured - using stub');
      return { id: 'cus_stub_' + Date.now() };
    }
    return await stripe.customers.create({ email, name });
  },
  
  createSubscription: async (customerId, priceId) => {
    if (!process.env.STRIPE_SECRET_KEY) {
      return { id: 'sub_stub_' + Date.now(), status: 'active' };
    }
    return await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }]
    });
  },
  
  cancelSubscription: async (subscriptionId) => {
    if (!process.env.STRIPE_SECRET_KEY) {
      return { id: subscriptionId, status: 'canceled' };
    }
    return await stripe.subscriptions.cancel(subscriptionId);
  },
  
  createPaymentIntent: async (amount, currency = 'usd') => {
    if (!process.env.STRIPE_SECRET_KEY) {
      return { client_secret: 'pi_stub_secret_' + Date.now() };
    }
    return await stripe.paymentIntents.create({ amount, currency });
  }
};
`;
}

function generateEmailServiceStub() {
  return `/**
 * Email Service Stub
 * Replace with actual email provider (SendGrid, AWS SES, etc.)
 */

module.exports = {
  sendEmail: async ({ to, subject, html, text }) => {
    console.log('📧 Email stub - would send to:', to);
    console.log('   Subject:', subject);
    // In production, integrate with SendGrid, AWS SES, etc.
    return { success: true, messageId: 'stub_' + Date.now() };
  },
  
  sendWelcomeEmail: async (email, name) => {
    return module.exports.sendEmail({
      to: email,
      subject: 'Welcome!',
      html: \`<h1>Welcome \${name}!</h1>\`
    });
  },
  
  sendPasswordReset: async (email, resetToken) => {
    return module.exports.sendEmail({
      to: email,
      subject: 'Password Reset',
      html: \`<p>Reset your password with token: \${resetToken}</p>\`
    });
  }
};
`;
}

// ============================================
// GENERATE DATABASE FILE
// ============================================

function generateDatabaseFile() {
  return `/**
 * Database Connection
 * Auto-generated by Module Library Assembler
 */

const { Pool } = require('pg');

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test connection on startup
pool.query('SELECT NOW()')
  .then(() => console.log('✅ Database connected'))
  .catch(() => {
    console.log('⚠️  Database not connected - some features may not work');
    console.log('   Set DATABASE_URL in .env to enable database features');
  });

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
`;
}

// ============================================
// GENERATE ADMIN/BRAIN ROUTES
// ============================================

function generateBrainRoutes() {
  return `/**
 * Brain API Routes
 * Single source of truth for business configuration
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const BRAIN_PATH = path.join(__dirname, '..', '..', 'brain.json');

// Helper to read brain
function readBrain() {
  try {
    if (fs.existsSync(BRAIN_PATH)) {
      return JSON.parse(fs.readFileSync(BRAIN_PATH, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading brain.json:', e.message);
  }
  return null;
}

// Helper to write brain
function writeBrain(data) {
  try {
    fs.writeFileSync(BRAIN_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (e) {
    console.error('Error writing brain.json:', e.message);
    return false;
  }
}

// GET /api/brain - Get full brain config
router.get('/', (req, res) => {
  const brain = readBrain();
  if (!brain) {
    return res.status(500).json({ success: false, error: 'Could not read brain.json' });
  }
  res.json({ success: true, brain });
});

// GET /api/brain/:section - Get specific section
router.get('/:section', (req, res) => {
  const brain = readBrain();
  if (!brain) {
    return res.status(500).json({ success: false, error: 'Could not read brain.json' });
  }
  const section = brain[req.params.section];
  if (!section) {
    return res.status(404).json({ success: false, error: 'Section not found' });
  }
  res.json({ success: true, [req.params.section]: section });
});

// PUT /api/brain/:section - Update specific section
router.put('/:section', (req, res) => {
  const brain = readBrain();
  if (!brain) {
    return res.status(500).json({ success: false, error: 'Could not read brain.json' });
  }
  
  brain[req.params.section] = { ...brain[req.params.section], ...req.body };
  brain.lastUpdated = new Date().toISOString();
  
  if (writeBrain(brain)) {
    res.json({ success: true, message: 'Updated', [req.params.section]: brain[req.params.section] });
  } else {
    res.status(500).json({ success: false, error: 'Could not save changes' });
  }
});

// PATCH /api/brain - Partial update any field
router.patch('/', (req, res) => {
  const brain = readBrain();
  if (!brain) {
    return res.status(500).json({ success: false, error: 'Could not read brain.json' });
  }
  
  // Deep merge
  const deepMerge = (target, source) => {
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        target[key] = target[key] || {};
        deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  };
  
  deepMerge(brain, req.body);
  brain.lastUpdated = new Date().toISOString();
  
  if (writeBrain(brain)) {
    res.json({ success: true, message: 'Updated', brain });
  } else {
    res.status(500).json({ success: false, error: 'Could not save changes' });
  }
});

module.exports = router;
`;
}

function generateHealthRoutes() {
  return `/**
 * Health Check Routes
 * System diagnostics and status
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// GET /api/health - Full health check
router.get('/', async (req, res) => {
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    services: {}
  };

  // Check brain.json exists
  const brainPath = path.join(__dirname, '..', '..', 'brain.json');
  checks.services.brain = {
    status: fs.existsSync(brainPath) ? 'healthy' : 'missing',
    path: brainPath
  };

  // Check database connection
  try {
    const db = require('../database/db');
    await db.query('SELECT 1');
    checks.services.database = { status: 'healthy' };
  } catch (e) {
    checks.services.database = { status: 'unhealthy', error: e.message };
  }

  // Check env vars
  const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'];
  const missingEnv = requiredEnvVars.filter(v => !process.env[v]);
  checks.services.environment = {
    status: missingEnv.length === 0 ? 'healthy' : 'warning',
    missing: missingEnv
  };

  // Check optional services
  checks.services.stripe = {
    status: process.env.STRIPE_SECRET_KEY ? 'configured' : 'not_configured'
  };
  checks.services.ai = {
    status: process.env.ANTHROPIC_API_KEY ? 'configured' : 'not_configured'
  };

  // Overall status
  const hasUnhealthy = Object.values(checks.services).some(s => s.status === 'unhealthy');
  checks.status = hasUnhealthy ? 'unhealthy' : 'healthy';

  res.json(checks);
});

// GET /api/health/quick - Quick ping
router.get('/quick', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
`;
}

// ============================================
// GENERATE AUTO-WIRED SERVER.JS
// ============================================

function generateServerJs(projectName, backendModules) {
  const imports = [];
  const routes = [];
  const loadedModules = [];
  
  // Generate imports and route registrations based on actual files
  for (const moduleName of backendModules) {
    const modulePath = path.join(BACKEND_MODULES_PATH, moduleName);
    const routeFile = findRouteFile(modulePath, moduleName);

    if (routeFile) {
      const varName = moduleName.replace(/-/g, '_') + 'Routes';
      const mapping = ROUTE_MAPPINGS[moduleName] || { route: `/api/${moduleName}` };
      
      imports.push(`const ${varName} = require('./modules/${moduleName}/${routeFile}');`);
      routes.push(`app.use('${mapping.route}', ${varName});`);
      loadedModules.push(moduleName);
    }
  }
  
  return `/**
 * ${projectName} - Backend Server
 * Auto-generated by Module Library Assembler
 * 
 * Run: npm install && npm run dev
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// ============================================
// MIDDLEWARE
// ============================================

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ============================================
// MODULE ROUTES (Auto-Wired)
// ============================================

${imports.length > 0 ? imports.join('\n') : '// No route modules found'}

// Register routes
${routes.length > 0 ? routes.join('\n') : '// No routes registered'}

// ============================================
// BRAIN & HEALTH ROUTES (Admin System)
// ============================================

const brainRoutes = require('./routes/brain');
const healthRoutes = require('./routes/health');

app.use('/api/brain', brainRoutes);
app.use('/api/health', healthRoutes);

// Quick health check (legacy)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    project: '${projectName}',
    timestamp: new Date().toISOString(),
    modules: ${loadedModules.length}
  });
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ${projectName} backend running on port ' + PORT);
  console.log('   Health: http://localhost:' + PORT + '/health');
  console.log('   API:    http://localhost:' + PORT + '/api');
  console.log('');
  console.log('📦 Loaded modules (${loadedModules.length}):');
${loadedModules.map(m => `  console.log('   ✅ ${m}');`).join('\n')}
});

module.exports = app;
`;
}

// ============================================
// GENERATE AUTO-WIRED APP.JSX
// ============================================

function generateAppJsx(projectName, frontendModules) {
  const imports = [];
  const routeElements = [];
  const providers = [];
  const layoutComponents = [];
  
  // Find actual component files in each module
  for (const moduleName of frontendModules) {
    const modulePath = path.join(FRONTEND_MODULES_PATH, moduleName);
    const mapping = FRONTEND_MAPPINGS[moduleName];
    
    if (!mapping) continue;
    
    // Find main component file
    let componentFile = null;
    if (fs.existsSync(modulePath)) {
      const files = fs.readdirSync(modulePath).filter(f => f.endsWith('.jsx') || f.endsWith('.js'));
      if (files.length > 0) {
        componentFile = files[0];
      }
    }
    
    if (componentFile) {
      const componentName = componentFile.replace(/\.(jsx|js)$/, '');
      imports.push(`import ${mapping.component} from './modules/${moduleName}/${componentFile}';`);
      
      if (mapping.provider) {
        providers.push(mapping.component);
      } else if (mapping.layout) {
        layoutComponents.push(mapping.component);
      } else if (mapping.path) {
        routeElements.push({
          path: mapping.path,
          component: mapping.component
        });
      }
    }
  }
  
  return `/**
 * ${projectName} - Frontend App
 * Auto-generated by Module Library Assembler
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

// Module imports
${imports.length > 0 ? imports.join('\n') : '// No modules imported'}

// Home page component
function HomePage() {
  return (
    <div style={{ 
      padding: '40px', 
      maxWidth: '800px', 
      margin: '0 auto',
      fontFamily: '-apple-system, sans-serif'
    }}>
      <h1 style={{ 
        fontSize: '48px',
        background: 'linear-gradient(135deg, #f97316, #8b5cf6)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '10px'
      }}>
        ${projectName}
      </h1>
      <p style={{ color: '#888', marginBottom: '30px' }}>
        Your app is running! Edit src/App.jsx to customize.
      </p>
      
      <div style={{ 
        background: 'rgba(255,255,255,0.05)', 
        borderRadius: '12px', 
        padding: '24px',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <h3 style={{ marginBottom: '16px', color: '#22c55e' }}>Available Routes:</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li style={{ padding: '8px 0' }}>
            <Link to="/" style={{ color: '#f97316' }}>/ - Home</Link>
          </li>
${routeElements.map(r => `          <li style={{ padding: '8px 0' }}>
            <Link to="${r.path}" style={{ color: '#f97316' }}>${r.path} - ${r.component}</Link>
          </li>`).join('\n')}
        </ul>
      </div>
      
      <div style={{ marginTop: '30px', color: '#666', fontSize: '14px' }}>
        <p>Backend API: <a href="http://localhost:5000/health" style={{ color: '#f97316' }}>http://localhost:5000/health</a></p>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      ${providers.length > 0 ? providers.map(p => `<${p}>`).join('\n        ') : ''}
        <div className="app" style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e4e4e4' }}>
          ${layoutComponents.includes('HeaderNav') ? '<HeaderNav />' : ''}
          
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
${routeElements.map(r => `              <Route path="${r.path}" element={<${r.component} />} />`).join('\n')}
            </Routes>
          </main>
          
          ${layoutComponents.includes('Footer') ? '<Footer />' : ''}
        </div>
      ${providers.length > 0 ? providers.map(p => `</${p}>`).reverse().join('\n        ') : ''}
    </BrowserRouter>
  );
}

export default App;
`;
}

// ============================================
// GENERATE OTHER FILES
// ============================================

function generateMainJsx() {
  return `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './theme.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;
}

function generateIndexCss() {
  return `/* Base styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background: #0a0a0f;
  color: #e4e4e4;
  min-height: 100vh;
}

a {
  color: #f97316;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}
`;
}

function generateThemeCss(industryConfig) {
  const colors = industryConfig?.colors || {};
  const typography = industryConfig?.typography || {};

  return `/* Auto-generated theme from industry config */
:root {
  --color-primary: ${colors.primary || '#6366f1'};
  --color-secondary: ${colors.secondary || '#8b5cf6'};
  --color-accent: ${colors.accent || '#06b6d4'};
  --color-background: ${colors.background || '#0a0a0f'};
  --color-surface: ${colors.surface || '#12121a'};
  --color-text: ${colors.text || '#e4e4e4'};
  --color-text-muted: ${colors.textMuted || '#64748b'};
  --font-heading: ${typography.heading || "'Inter', sans-serif"};
  --font-body: ${typography.body || "system-ui, sans-serif"};
  --border-radius: 8px;
}

/* Dark mode default */
body {
  margin: 0;
  font-family: var(--font-body);
  color: var(--color-text);
  background: var(--color-background);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
}
`;
}

function generateBackendPackageJson(projectName, backendModules) {
  const pkg = {
    name: `${projectName.toLowerCase()}-backend`,
    version: '1.0.0',
    description: `${projectName} backend - Generated by Module Library`,
    main: 'server.js',
    scripts: {
  start: 'node setup-db.js && node server.js',
  dev: 'nodemon server.js',
  'setup-db': 'node setup-db.js'
},
    dependencies: {
      // Core Express
      express: '^4.18.2',
      cors: '^2.8.5',
      helmet: '^7.1.0',
      morgan: '^1.10.0',
      dotenv: '^16.3.1',
      
      // Auth & Security
      bcryptjs: '^2.4.3',
      bcrypt: '^5.1.1',
      jsonwebtoken: '^9.0.2',
      'express-rate-limit': '^7.1.5',
      ioredis: '^5.3.2',
      'ioredis': '^5.3.2',
      'sanitize-html': '^2.11.0',
      'express-validator': '^7.0.1',
      
      // Database
      pg: '^8.11.3',
      mongoose: '^8.0.3',
      redis: '^4.6.12',
      
      // File handling
      multer: '^1.4.5-lts.1',
      sharp: '^0.33.0',
      cloudinary: '^1.41.0',
      exceljs: '^4.4.0',
      
      // HTTP & APIs
      axios: '^1.6.0',
      'node-fetch': '^2.7.0',
      stripe: '^14.5.0',
      
      // AI
      '@anthropic-ai/sdk': '^0.10.0',
      
      // Email
      nodemailer: '^6.9.7',
      resend: '^2.0.0',
      '@sendgrid/mail': '^8.1.0',
      
      // Utilities
      uuid: '^9.0.0',
      slugify: '^1.6.6',
      'date-fns': '^2.30.0',
      'node-cron': '^3.0.3'
    },
    devDependencies: {
      nodemon: '^3.0.2'
    }
  };
  
  // Add module-specific dependencies
  if (backendModules.includes('stripe-payments')) {
    pkg.dependencies['stripe'] = '^14.5.0';
  }
  if (backendModules.includes('ai-scanner')) {
    pkg.dependencies['@anthropic-ai/sdk'] = '^0.10.0';
    pkg.dependencies['sharp'] = '^0.33.0';
  }
  if (backendModules.includes('ebay-integration')) {
    pkg.dependencies['axios'] = '^1.6.0';
  }
  if (backendModules.includes('chat') || backendModules.includes('notifications')) {
    pkg.dependencies['socket.io'] = '^4.7.2';
  }
  
  return JSON.stringify(pkg, null, 2);
}

function generateFrontendPackageJson(projectName) {
  return JSON.stringify({
    name: `${projectName.toLowerCase()}-frontend`,
    version: '1.0.0',
    description: `${projectName} frontend - Generated by Module Library`,
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
      start: 'npx serve dist -s -l $PORT'
    },
    dependencies: {
      react: '^18.2.0',
      'react-dom': '^18.2.0',
      'react-router-dom': '^6.20.0',
      'lucide-react': '^0.454.0',
      axios: '^1.6.0',
      serve: '^14.2.0'
    },
    devDependencies: {
      '@vitejs/plugin-react': '^4.2.0',
      vite: '^5.0.0'
    }
  }, null, 2);
}

function generateFrontendRailwayJson() {
  return JSON.stringify({
    "$schema": "https://railway.app/railway.schema.json",
    "build": {
      "builder": "NIXPACKS",
      "buildCommand": "npm install && npm run build"
    },
    "deploy": {
      "startCommand": "npm run start",
      "healthcheckPath": "/",
      "healthcheckTimeout": 300,
      "restartPolicyType": "ON_FAILURE",
      "restartPolicyMaxRetries": 3
    }
  }, null, 2);
}

function generateBackendRailwayJson() {
  return JSON.stringify({
    "$schema": "https://railway.app/railway.schema.json",
    "build": {
      "builder": "NIXPACKS",
      "buildCommand": "npm install"
    },
    "deploy": {
      "startCommand": "npm start",
      "healthcheckPath": "/api/health",
      "healthcheckTimeout": 300,
      "restartPolicyType": "ON_FAILURE",
      "restartPolicyMaxRetries": 3
    }
  }, null, 2);
}

function generateEnvExample(backendModules) {
  // Use comprehensive template from templates/env.example
  const templatePath = path.join(__dirname, '..', 'templates', 'env.example');
  if (fs.existsSync(templatePath)) {
    return fs.readFileSync(templatePath, 'utf-8');
  }

  // Fallback to basic env if template not found
  let env = `# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# Admin Account (created on first run)
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=change-this-secure-password
`;

  if (backendModules.includes('stripe-payments')) {
    env += `
# Stripe
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
`;
  }

  if (backendModules.includes('ai-scanner')) {
    env += `
# AI Scanner (Anthropic)
ANTHROPIC_API_KEY=your_anthropic_key
`;
  }

  if (backendModules.includes('ebay-integration')) {
    env += `
# eBay API
EBAY_APP_ID=your_ebay_app_id
EBAY_CERT_ID=your_ebay_cert_id
`;
  }

  return env;
}

function generateViteConfig() {
  return `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    },
    allowedHosts: true
  },
  preview: {
    host: true,
    port: process.env.PORT || 4173,
    allowedHosts: true
  }
});
`;
}

function generateReadme(projectName, backendModules, frontendModules, industry) {
  return `# ${projectName}

Generated by Module Library Assembler
${industry ? `Industry: ${industry}` : ''}

## Quick Start

### Backend
\`\`\`bash
cd backend
npm install
cp .env.example .env
# Edit .env with your keys
npm run dev
\`\`\`

### Frontend (Customer-Facing)
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

### Admin Dashboard
\`\`\`bash
cd admin
npm install
npm run dev
\`\`\`

## Architecture

\`\`\`
${projectName}/
├── brain.json          # Single source of truth - all config lives here
├── backend/            # API server
│   ├── routes/
│   │   ├── brain.js    # GET/PUT /api/brain - config management
│   │   └── health.js   # GET /api/health - system diagnostics
│   └── modules/        # Feature modules
├── frontend/           # Customer-facing website
└── admin/              # Business owner dashboard
    └── src/
        └── config/
            └── brain.json  # Synced copy of root brain.json
\`\`\`

## brain.json - Single Source of Truth

All business configuration lives in \`brain.json\`:
- Business info (name, address, hours, contact)
- Industry terminology (Product vs Menu Item vs Service)
- Module enable/disable flags
- Theme colors
- Infrastructure connections

**API Endpoints:**
- \`GET /api/brain\` - Get full config
- \`GET /api/brain/:section\` - Get specific section (business, theme, etc.)
- \`PUT /api/brain/:section\` - Update a section
- \`PATCH /api/brain\` - Partial update any field

## Health Check

\`GET /api/health\` returns system status:
- Database connection
- Required environment variables
- External service connections (Stripe, AI, etc.)

## Modules Included

### Backend (${backendModules.length} modules)
${backendModules.map(m => `- ${m}`).join('\n')}

### Frontend (${frontendModules.length} modules)
${frontendModules.map(m => `- ${m}`).join('\n')}

### Admin Dashboard
- Dashboard with health status and quick actions
- AI Manager - Chat interface to manage your business
- Orders, Products, Customers, Inventory management
- Analytics and Reports
- Marketing campaigns
- Settings (APIs, Payments, Integrations)

## API Endpoints

| Module | Endpoint |
|--------|----------|
| brain | /api/brain |
| health | /api/health |
${backendModules.map(m => {
  const mapping = ROUTE_MAPPINGS[m];
  return mapping ? `| ${m} | ${mapping.route} |` : `| ${m} | /api/${m} |`;
}).join('\n')}
`;
}

// ============================================
// GENERATE BRAIN.JSON - Single source of truth
// ============================================

function generateBrainJson(projectName, industry, industryConfig) {
  const cfg = industryConfig || {};
  
  // Industry-specific terminology
  const terminologyMap = {
    'restaurant': { product: 'Menu Item', products: 'Menu Items', customer: 'Guest', customers: 'Guests' },
    'healthcare': { product: 'Service', products: 'Services', customer: 'Patient', customers: 'Patients' },
    'dental': { product: 'Service', products: 'Services', customer: 'Patient', customers: 'Patients' },
    'ecommerce': { product: 'Product', products: 'Products', customer: 'Customer', customers: 'Customers' },
    'collectibles': { product: 'Item', products: 'Items', customer: 'Collector', customers: 'Collectors' },
    'saas': { product: 'Plan', products: 'Plans', customer: 'User', customers: 'Users' },
    'law-firm': { product: 'Service', products: 'Services', customer: 'Client', customers: 'Clients' },
    'fitness': { product: 'Class', products: 'Classes', customer: 'Member', customers: 'Members' },
    'spa-salon': { product: 'Treatment', products: 'Treatments', customer: 'Client', customers: 'Clients' },
    'real-estate': { product: 'Listing', products: 'Listings', customer: 'Client', customers: 'Clients' },
    'default': { product: 'Product', products: 'Products', customer: 'Customer', customers: 'Customers' }
  };

  const terminology = terminologyMap[industry] || terminologyMap['default'];
  const colors = cfg.colors || { primary: '#3b82f6', accent: '#8b5cf6' };

  return JSON.stringify({
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    industry: {
      type: industry || 'business',
      terminology: {
        product: terminology.product,
        products: terminology.products,
        order: 'Order',
        orders: 'Orders',
        customer: terminology.customer,
        customers: terminology.customers,
        inventory: 'Inventory',
        category: 'Category',
        categories: 'Categories'
      }
    },
    business: {
      name: projectName.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      tagline: '',
      logo: null,
      currency: 'USD',
      currencySymbol: '$',
      timezone: 'America/New_York',
      locale: 'en-US',
      address: { street: '', city: '', state: '', zip: '', country: 'USA' },
      contact: { phone: '', email: '', website: '' },
      hours: {
        monday: { open: '09:00', close: '17:00' },
        tuesday: { open: '09:00', close: '17:00' },
        wednesday: { open: '09:00', close: '17:00' },
        thursday: { open: '09:00', close: '17:00' },
        friday: { open: '09:00', close: '17:00' },
        saturday: { open: '10:00', close: '14:00' },
        sunday: { open: 'closed', close: 'closed' }
      },
      features: {
        onlineOrdering: true,
        reservations: industry === 'restaurant' || industry === 'spa-salon',
        loyaltyProgram: false,
        giftCards: false
      }
    },
    modules: {
      dashboard: { enabled: true },
      orders: { enabled: true },
      products: { enabled: true },
      customers: { enabled: true },
      inventory: { enabled: true },
      analytics: { enabled: true },
      marketing: { enabled: true },
      ai: { enabled: true },
      settings: { enabled: true }
    },
    infrastructure: {
      frontend: { provider: 'vercel', url: null },
      backend: { provider: 'railway', url: null },
      database: { provider: 'railway', type: 'postgresql' },
      storage: { provider: 'cloudinary' },
      payments: { provider: 'stripe', connected: false }
    },
    ai: {
      enabled: true,
      provider: 'anthropic',
      features: { insights: true, chat: true, automation: true, forecasting: true }
    },
    theme: {
      mode: 'dark',
      primaryColor: colors.primary || '#3b82f6',
      accentColor: colors.accent || '#8b5cf6'
    }
  }, null, 2);
}

function generateManifest(projectName, backendModules, frontendModules, industry, bundles) {
  return JSON.stringify({
    name: projectName,
    generatedAt: new Date().toISOString(),
    generator: 'Module Library Assembler v4',
    industry: industry || null,
    bundles: bundles || null,
    counts: {
      backendModules: backendModules.length,
      frontendModules: frontendModules.length
    },
    modules: {
      backend: backendModules,
      frontend: frontendModules
    },
    admin: {
      included: true,
      module: 'business-admin',
      features: [
        'dashboard',
        'orders',
        'products', 
        'customers',
        'inventory',
        'analytics',
        'marketing',
        'ai-manager',
        'settings'
      ]
    },
    brain: {
      path: 'brain.json',
      apiEndpoint: '/api/brain'
    },
    health: {
      apiEndpoint: '/api/health'
    }
  }, null, 2);
}

// ============================================
// MAIN ASSEMBLY FUNCTION
// ============================================

function assembleProject(config) {
  const { name, backendModules, frontendModules, industry, industryKey, bundles } = config;
  
  const projectDir = path.join(OUTPUT_BASE, name);
  const backendDir = path.join(projectDir, 'backend');
  const frontendDir = path.join(projectDir, 'frontend');
  
  console.log(`🚀 Assembling Project: ${name}`);
  console.log(`   Location: ${projectDir}`);
  console.log(`   Backend modules: ${backendModules.length}`);
  console.log(`   Frontend modules: ${frontendModules.length}`);
  
  // Create directories
  fs.mkdirSync(path.join(backendDir, 'modules'), { recursive: true });
  fs.mkdirSync(path.join(frontendDir, 'src', 'modules'), { recursive: true });
  fs.mkdirSync(path.join(frontendDir, 'public'), { recursive: true });
  
  // Copy backend modules
  console.log('📦 Backend Modules:');
  
  for (const moduleName of backendModules) {
    const srcPath = path.join(BACKEND_MODULES_PATH, moduleName);
    const destPath = path.join(backendDir, 'modules', moduleName);

    if (fs.existsSync(srcPath)) {
      copyDirectorySync(srcPath, destPath);
      console.log(`  ✅ ${moduleName}`);
      
      // Create database folder in each module for shared db access
      const dbFolder = path.join(destPath, 'database');
      if (!fs.existsSync(dbFolder)) {
        fs.mkdirSync(dbFolder, { recursive: true });
      }
      fs.writeFileSync(path.join(dbFolder, 'db.js'), generateDatabaseFile());
      
      // Create middleware folder and copy auth middleware (shared dependency)
      // Create BOTH naming patterns since different modules use different names
      if (moduleName !== 'auth') {
        const middlewareFolder = path.join(destPath, 'middleware');
        if (!fs.existsSync(middlewareFolder)) {
          fs.mkdirSync(middlewareFolder, { recursive: true });
        }
        // Create a comprehensive auth middleware that exports ALL common names
        const comprehensiveAuthMiddleware = generateAuthMiddleware();
        fs.writeFileSync(path.join(middlewareFolder, 'auth.js'), comprehensiveAuthMiddleware);
        fs.writeFileSync(path.join(middlewareFolder, 'auth.middleware.js'), comprehensiveAuthMiddleware);
        fs.writeFileSync(path.join(middlewareFolder, 'authMiddleware.js'), comprehensiveAuthMiddleware);
        
        // Rate limiter middleware
        fs.writeFileSync(path.join(middlewareFolder, 'rate-limiter.js'), generateRateLimiterMiddleware());
      }
      
      // Create services folder with common stubs
      const servicesFolder = path.join(destPath, 'services');
      if (!fs.existsSync(servicesFolder)) {
        fs.mkdirSync(servicesFolder, { recursive: true });
      }
      
      // Create common service stubs if they don't exist
      const serviceStubs = {
        'stripe-service.js': generateStripeServiceStub(),
        'email-service.js': generateEmailServiceStub(),
        'notificationService.js': generateNotificationServiceStub(),
        'socketService.js': generateSocketServiceStub(),
        'SyncService.js': generateSyncServiceStub(),
        'cloudinary.js': generateCloudinaryServiceStub(),
        'cardDatabaseLookup.js': generateCardDatabaseLookupStub(),
        'parallel-matcher.js': generateParallelMatcherStub(),
        'claude-scanner.js': generateClaudeScannerStub(),
        'ebay-oauth.js': generateEbayOauthStub(),
        'collageService.js': generateCollageServiceStub(),
        'password-reset-email.js': generatePasswordResetEmailStub(),
        'famcoinEngine.js': generateFamcoinEngineStub(),
        'mealsEngine.js': generateMealsEngineStub(),
        'calendarService.js': generateCalendarServiceStub(),
        'FormationAnalyzer.js': generateFormationAnalyzerStub(),
        'PlayerPropsAnalyzer.js': generatePlayerPropsAnalyzerStub()
      };
      
      for (const [fileName, content] of Object.entries(serviceStubs)) {
        const filePath = path.join(servicesFolder, fileName);
        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, content);
        }
      }
      
      // Create models folder with common model stubs
      const modelsFolder = path.join(destPath, 'models');
      if (!fs.existsSync(modelsFolder)) {
        fs.mkdirSync(modelsFolder, { recursive: true });
      }
      
      // Create all common model stubs
      for (const modelName of COMMON_MODELS) {
        const modelPath = path.join(modelsFolder, `${modelName}.js`);
        if (!fs.existsSync(modelPath)) {
          fs.writeFileSync(modelPath, generateModelStub(modelName));
        }
      }
    } else {
      console.log(`  ⚠️ ${moduleName} (not found in ${BACKEND_MODULES_PATH})`);
    }
  }

  // Copy effects library (always included)
const effectsSrc = path.join(FRONTEND_MODULES_PATH, 'effects');
const effectsDest = path.join(frontendDir, 'src', 'effects');
if (fs.existsSync(effectsSrc)) {
  copyDirectorySync(effectsSrc, effectsDest);
  console.log('  ✅ effects (visual effects library)');
}
  
  // Copy frontend modules
  console.log('📦 Frontend Modules:');
  for (const moduleName of frontendModules) {
    const srcPath = path.join(FRONTEND_MODULES_PATH, moduleName);
    const destPath = path.join(frontendDir, 'src', 'modules', moduleName);
    
    if (fs.existsSync(srcPath)) {
      copyDirectorySync(srcPath, destPath);
      console.log(`  ✅ ${moduleName}`);
    } else {
      console.log(`  ⚠️ ${moduleName} (not found)`);
    }
  }
  
  // Generate backend files
  fs.writeFileSync(path.join(backendDir, 'server.js'), generateServerJs(name, backendModules));
  fs.writeFileSync(path.join(backendDir, 'package.json'), generateBackendPackageJson(name, backendModules));
  fs.writeFileSync(path.join(backendDir, 'railway.json'), generateBackendRailwayJson());
  fs.writeFileSync(path.join(backendDir, '.env.example'), generateEnvExample(backendModules));

  // Generate brain.json (single source of truth)
  let industryConfig = null;
  if (industryKey && INDUSTRIES_FROM_JSON[industryKey]) {
    industryConfig = INDUSTRIES_FROM_JSON[industryKey];
  }
  fs.writeFileSync(path.join(projectDir, 'brain.json'), generateBrainJson(name, industry, industryConfig));
  console.log('  ✅ brain.json (single source of truth)');

  // Generate admin routes
  const routesDir = path.join(backendDir, 'routes');
  if (!fs.existsSync(routesDir)) {
    fs.mkdirSync(routesDir, { recursive: true });
  }
  fs.writeFileSync(path.join(routesDir, 'brain.js'), generateBrainRoutes());
  fs.writeFileSync(path.join(routesDir, 'health.js'), generateHealthRoutes());
  console.log('  ✅ Admin routes (brain.js, health.js)');

  // Copy business-admin module (admin dashboard for all businesses)
  // Admin goes to project root /admin (not /frontend/admin) for deploy-service compatibility
  const businessAdminSrc = path.join(FRONTEND_MODULES_PATH, 'business-admin');
  const businessAdminDest = path.join(projectDir, 'admin');
  if (fs.existsSync(businessAdminSrc)) {
    copyDirectorySync(businessAdminSrc, businessAdminDest);

    // Update brain.json path in admin to point to project root
    const adminBrainPath = path.join(businessAdminDest, 'src', 'config', 'brain.json');
    if (fs.existsSync(adminBrainPath)) {
      // Copy the generated brain.json to admin config
      fs.copyFileSync(path.join(projectDir, 'brain.json'), adminBrainPath);
    }
    console.log('  ✅ business-admin (admin dashboard)');
  } else {
    console.log('  ⚠️ business-admin module not found');
  }
  
  // Copy setup-db.js if it exists in templates
  const setupDbTemplate = path.join(MODULE_LIBRARY, 'templates', 'setup-db.js');
  if (fs.existsSync(setupDbTemplate)) {
    fs.copyFileSync(setupDbTemplate, path.join(backendDir, 'setup-db.js'));
    console.log('  ✅ setup-db.js (database migration script)');
  }
  
  // Generate frontend files
  fs.writeFileSync(path.join(frontendDir, 'src', 'App.jsx'), generateAppJsx(name, frontendModules));
  fs.writeFileSync(path.join(frontendDir, 'src', 'main.jsx'), generateMainJsx());
  fs.writeFileSync(path.join(frontendDir, 'src', 'index.css'), generateIndexCss());
  fs.writeFileSync(path.join(frontendDir, 'src', 'theme.css'), generateThemeCss(industryConfig));
  fs.writeFileSync(path.join(frontendDir, 'package.json'), generateFrontendPackageJson(name));
  fs.writeFileSync(path.join(frontendDir, 'vite.config.js'), generateViteConfig());
  fs.writeFileSync(path.join(frontendDir, 'railway.json'), generateFrontendRailwayJson());
  
  fs.writeFileSync(path.join(frontendDir, 'index.html'), `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${name}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`);
  
  // Generate project files
  fs.writeFileSync(path.join(projectDir, 'README.md'), generateReadme(name, backendModules, frontendModules, industry));
  fs.writeFileSync(path.join(projectDir, 'project-manifest.json'), generateManifest(name, backendModules, frontendModules, industry, bundles));

  // Regenerate package-lock.json files to prevent Railway "npm ci" errors
  // This ensures lock files are in sync with generated package.json files
  console.log('');
  console.log('📦 Regenerating package-lock.json files for deployment...');
  regeneratePackageLock(backendDir, 'backend');
  regeneratePackageLock(frontendDir, 'frontend');
  regeneratePackageLock(path.join(projectDir, 'admin'), 'admin');

  // Run Ralph Wiggum validation
  const validation = validateGeneratedProject(projectDir);

  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  ✅ PROJECT ASSEMBLED SUCCESSFULLY!');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`   📁 Location: ${projectDir}`);
  console.log(`   📦 Backend modules: ${backendModules.length}`);
  console.log(`   📦 Frontend modules: ${frontendModules.length}`);
  console.log(`   🎛️  Admin dashboard: INCLUDED`);
  console.log(`   🧠 brain.json: GENERATED`);
  console.log('');
  console.log('📝 Quick Start:');
  console.log('');
  console.log('   Backend:');
  console.log(`      cd "${path.join(projectDir, 'backend')}"`);
  console.log('      npm install && cp .env.example .env && npm run dev');
  console.log('');
  console.log('   Frontend (Customer):');
  console.log(`      cd "${path.join(projectDir, 'frontend')}"`);
  console.log('      npm install && npm run dev');
  console.log('');
  console.log('   Admin Dashboard:');
  console.log(`      cd "${path.join(projectDir, 'admin')}"`);
  console.log('      npm install && npm run dev');
  console.log('');
  console.log('🔗 Endpoints:');
  console.log('   Customer site:  http://localhost:5173');
  console.log('   Admin panel:    http://localhost:5174');
  console.log('   API:            http://localhost:5000');
  console.log('   Health:         http://localhost:5000/api/health');
  console.log('   Brain:          http://localhost:5000/api/brain');
  console.log('═══════════════════════════════════════════════════════════════');

  return { success: true, path: projectDir };
}

// ============================================
// CLI
// ============================================

function parseArgs() {
  const args = process.argv.slice(2);
  const config = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];
    
    if (arg === '--name' && next) {
      config.name = next;
      i++;
    } else if (arg === '--industry' && next) {
      config.industry = next;
      i++;
    } else if (arg === '--bundles' && next) {
      config.bundles = next.split(',').map(b => b.trim());
      i++;
    } else if (arg === '--modules' && next) {
      config.modules = next.split(',').map(m => m.trim());
      i++;
    } else if (arg === '--list-industries') {
      console.log('\n📋 Available Industries:\n');
      for (const [key, val] of Object.entries(INDUSTRY_PRESETS)) {
        console.log(`  ${key}: ${val.name}`);
      }
      process.exit(0);
    } else if (arg === '--list-bundles') {
      console.log('\n📋 Available Bundles:\n');
      for (const [key, val] of Object.entries(BUNDLES)) {
        console.log(`  ${key}: ${val.backend.length} backend, ${val.frontend.length} frontend`);
      }
      process.exit(0);
    } else if (arg === '--help') {
      console.log(`
Module Library - Project Assembler v3

Usage:
  node assemble-project.cjs --name "MyApp" --industry collectibles
  node assemble-project.cjs --name "MyApp" --bundles core,commerce
  node assemble-project.cjs --name "MyApp" --modules auth,login-form

Options:
  --name             Project name (required)
  --industry         Use industry preset
  --bundles          Comma-separated bundle names
  --modules          Comma-separated module names
  --list-industries  List available industries
  --list-bundles     List available bundles
  --help             Show this help
`);
      process.exit(0);
    }
  }
  
  return config;
}

// Main
const config = parseArgs();

if (!config.name) {
  console.error('❌ Error: Project name required. Use --name "ProjectName"');
  process.exit(1);
}

let backendModules = [];
let frontendModules = [];
let industryName = null;
let industryKey = null;
let bundlesList = null;

if (config.industry) {
  const industry = INDUSTRY_PRESETS[config.industry];
  if (!industry) {
    console.error(`❌ Error: Unknown industry "${config.industry}"`);
    process.exit(1);
  }
  console.log(`🏭 Using industry preset: ${industry.name}`);
  const modules = getModulesForIndustry(config.industry);
  backendModules = modules.backend;
  frontendModules = modules.frontend;
  industryName = industry.name;
  industryKey = config.industry;  // Keep the key for looking up config
  bundlesList = industry.bundles;
} else if (config.bundles) {
  const modules = getModulesForBundles(config.bundles);
  backendModules = modules.backend;
  frontendModules = modules.frontend;
  bundlesList = config.bundles;
} else if (config.modules) {
  for (const mod of config.modules) {
    if (fs.existsSync(path.join(BACKEND_MODULES_PATH, mod))) {
      backendModules.push(mod);
    } else if (fs.existsSync(path.join(FRONTEND_MODULES_PATH, mod))) {
      frontendModules.push(mod);
    }
  }
} else {
  const modules = getModulesForBundles(['core']);
  backendModules = modules.backend;
  frontendModules = modules.frontend;
  bundlesList = ['core'];
}

assembleProject({
  name: config.name,
  backendModules,
  frontendModules,
  industry: industryName,
  industryKey: industryKey,
  bundles: bundlesList
});
