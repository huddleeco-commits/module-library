/**
 * BE1st Module Extractor
 * 
 * Run this script locally to extract modules from your platforms
 * into a clean, standardized module library.
 * 
 * Usage:
 *   node extract-modules.js --platform slabtrack --module auth
 *   node extract-modules.js --all
 *   node extract-modules.js --bundle core
 */

const fs = require('fs');
const path = require('path');

// ══════════════════════════════════════════════════════════════
// CONFIGURATION - Update these paths to match your system
// ══════════════════════════════════════════════════════════════

const PLATFORM_PATHS = {
  'slabtrack': 'C:\\Users\\huddl\\OneDrive\\Desktop\\GitHub\\slabtrack',
  'huddle': 'C:\\Users\\huddl\\OneDrive\\Desktop\\HOMESCREEN-PREVIOUS\\PLATFORMS\\Huddle',
  'healthcareos': 'C:\\Users\\huddl\\OneDrive\\Desktop\\HOMESCREEN-PREVIOUS\\PLATFORMS\\HealthcareOS',
  'family-huddle': 'C:\\Users\\huddl\\OneDrive\\Desktop\\HOMESCREEN-PREVIOUS\\My-Family-Huddle',
  'ubg': 'C:\\Users\\huddl\\OneDrive\\Desktop\\HOMESCREEN-PREVIOUS\\PLATFORMS\\universal-business-generator',
  'campuswager': 'C:\\Users\\huddl\\OneDrive\\Desktop\\HOMESCREEN-PREVIOUS\\CampusWager',
  'financial': 'C:\\Users\\huddl\\OneDrive\\Desktop\\HOMESCREEN-PREVIOUS\\Financial-Services-Platform',
  'be1st': 'C:\\Users\\huddl\\OneDrive\\Desktop\\be1st'
};

const OUTPUT_PATH = 'C:\\Users\\huddl\\OneDrive\\Desktop\\module-library';

// ══════════════════════════════════════════════════════════════
// MODULE DEFINITIONS (from extraction map)
// ══════════════════════════════════════════════════════════════

const MODULES = {
  // BACKEND MODULES
  'auth': {
    type: 'backend',
    bestSource: 'slabtrack',
    files: [
      'backend/routes/auth.routes.js',
      'backend/middleware/auth.js',
      'backend/models/User.js',
      'backend/services/password-reset-email.js'
    ],
    outputFiles: [
      'routes/auth.js',
      'middleware/auth.js',
      'models/User.js',
      'services/password-reset.js'
    ]
  },
  
  'stripe-payments': {
    type: 'backend',
    bestSource: 'slabtrack',
    files: [
      'backend/routes/stripe.routes.js',
      'backend/routes/subscription.routes.js',
      'backend/services/stripe-service.js',
      'backend/config/plans.js'
    ],
    outputFiles: [
      'routes/stripe.js',
      'routes/subscription.js',
      'services/stripe.js',
      'config/plans.js'
    ]
  },
  
  'notifications': {
    type: 'backend',
    bestSource: 'huddle',
    files: [
      'backend/routes/notifications.js',
      'backend/services/notificationService.js',
      'backend/services/email.service.js',
      'backend/models/Notification.js'
    ],
    outputFiles: [
      'routes/notifications.js',
      'services/notification.js',
      'services/email.js',
      'models/Notification.js'
    ]
  },
  
  'chat': {
    type: 'backend',
    bestSource: 'family-huddle',
    files: [
      'backend/routes/chat.js',
      'backend/routes/messages.js'
    ],
    outputFiles: [
      'routes/chat.js',
      'routes/messages.js'
    ]
  },
  
  'booking': {
    type: 'backend',
    bestSource: 'healthcareos',
    files: [
      'backend/routes/appointments.js',
      'backend/routes/services.js'
    ],
    outputFiles: [
      'routes/booking.js',
      'routes/services.js'
    ]
  },
  
  'admin-dashboard': {
    type: 'backend',
    bestSource: 'healthcareos',
    files: [
      'backend/routes/admin.js'
    ],
    outputFiles: [
      'routes/admin.js'
    ]
  },
  
  'analytics': {
    type: 'backend',
    bestSource: 'healthcareos',
    files: [
      'backend/routes/analytics.js',
      'backend/routes/metrics.js'
    ],
    outputFiles: [
      'routes/analytics.js',
      'routes/metrics.js'
    ]
  },
  
  'ai-scanner': {
    type: 'backend',
    bestSource: 'slabtrack',
    files: [
      'backend/routes/scanner.routes.js',
      'backend/services/ai-scanner.js',
      'backend/services/claude-scanner.js'
    ],
    outputFiles: [
      'routes/scanner.js',
      'services/ai-scanner.js',
      'services/claude-scanner.js'
    ]
  },
  
  'file-upload': {
    type: 'backend',
    bestSource: 'slabtrack',
    files: [
      'backend/middleware/upload.js',
      'backend/services/cloudinary.js',
      'backend/services/imageProcessor.js'
    ],
    outputFiles: [
      'middleware/upload.js',
      'services/cloudinary.js',
      'services/image-processor.js'
    ]
  },
  
  'vendor-system': {
    type: 'backend',
    bestSource: 'slabtrack',
    files: [
      'backend/routes/vendor.routes.js',
      'backend/routes/vendor-sales-shows.routes.js'
    ],
    outputFiles: [
      'routes/vendor.js',
      'routes/vendor-sales.js'
    ]
  },
  
  'collections': {
    type: 'backend',
    bestSource: 'slabtrack',
    files: [
      'backend/routes/collections.js'
    ],
    outputFiles: [
      'routes/collections.js'
    ]
  },
  
  'showcase': {
    type: 'backend',
    bestSource: 'slabtrack',
    files: [
      'backend/routes/showcase.routes.js'
    ],
    outputFiles: [
      'routes/showcase.js'
    ]
  },
  
  'transfers': {
    type: 'backend',
    bestSource: 'slabtrack',
    files: [
      'backend/routes/transfer.routes.js'
    ],
    outputFiles: [
      'routes/transfer.js'
    ]
  },
  
  'nfc-tags': {
    type: 'backend',
    bestSource: 'slabtrack',
    files: [
      'backend/routes/nfc.routes.js'
    ],
    outputFiles: [
      'routes/nfc.js'
    ]
  },
  
  'ebay-integration': {
    type: 'backend',
    bestSource: 'slabtrack',
    files: [
      'backend/routes/ebay.routes.js',
      'backend/routes/ebayAuth.js',
      'backend/services/ebay-api.js',
      'backend/services/ebay-oauth.js'
    ],
    outputFiles: [
      'routes/ebay.js',
      'routes/ebay-auth.js',
      'services/ebay-api.js',
      'services/ebay-oauth.js'
    ]
  },
  
  'fantasy': {
    type: 'backend',
    bestSource: 'huddle',
    files: [
      'backend/routes/fantasy/fantasy-leagues.js',
      'backend/routes/fantasy/draft-management.js',
      'backend/services/fantasy/DraftOptimizer.js',
      'backend/services/fantasy/TradeEngine.js'
    ],
    outputFiles: [
      'routes/fantasy-leagues.js',
      'routes/draft.js',
      'services/draft-optimizer.js',
      'services/trade-engine.js'
    ]
  },
  
  'betting': {
    type: 'backend',
    bestSource: 'huddle',
    files: [
      'backend/routes/betting-tools.js',
      'backend/routes/picks.routes.js',
      'backend/routes/sidebets.routes.js',
      'backend/models/Bet.js',
      'backend/models/Pick.js'
    ],
    outputFiles: [
      'routes/betting.js',
      'routes/picks.js',
      'routes/sidebets.js',
      'models/Bet.js',
      'models/Pick.js'
    ]
  },
  
  'leaderboard': {
    type: 'backend',
    bestSource: 'huddle',
    files: [
      'backend/models/Leaderboard.js',
      'backend/routes/reputation.js'
    ],
    outputFiles: [
      'models/Leaderboard.js',
      'routes/leaderboard.js'
    ]
  },
  
  // FRONTEND MODULES
  'login-form': {
    type: 'frontend',
    bestSource: 'slabtrack',
    files: [
      'frontend/src/components/auth/LoginForm.jsx',
      'frontend/src/pages/Login.jsx'
    ],
    outputFiles: [
      'components/auth/LoginForm.jsx',
      'pages/Login.jsx'
    ]
  },
  
  'register-form': {
    type: 'frontend',
    bestSource: 'slabtrack',
    files: [
      'frontend/src/components/auth/RegisterForm.jsx',
      'frontend/src/pages/Register.jsx'
    ],
    outputFiles: [
      'components/auth/RegisterForm.jsx',
      'pages/Register.jsx'
    ]
  },
  
  'header-nav': {
    type: 'frontend',
    bestSource: 'slabtrack',
    files: [
      'frontend/src/components/shared/Navbar.jsx'
    ],
    outputFiles: [
      'components/layout/Navbar.jsx'
    ]
  },
  
  'footer-section': {
    type: 'frontend',
    bestSource: 'slabtrack',
    files: [
      'frontend/src/components/layout/Footer.jsx'
    ],
    outputFiles: [
      'components/layout/Footer.jsx'
    ]
  },
  
  'modal-system': {
    type: 'frontend',
    bestSource: 'slabtrack',
    files: [
      'frontend/src/components/shared/Modal.jsx'
    ],
    outputFiles: [
      'components/ui/Modal.jsx'
    ]
  },
  
  'stat-cards': {
    type: 'frontend',
    bestSource: 'slabtrack',
    files: [
      'frontend/src/components/dashboard/DashboardStats.jsx',
      'frontend/src/components/dashboard/UsageWidget.jsx'
    ],
    outputFiles: [
      'components/dashboard/StatCards.jsx',
      'components/dashboard/UsageWidget.jsx'
    ]
  },
  
  'data-table': {
    type: 'frontend',
    bestSource: 'slabtrack',
    files: [
      'frontend/src/components/cards/CardGrid.jsx'
    ],
    outputFiles: [
      'components/data/DataTable.jsx'
    ]
  },
  
  'collection-grid': {
    type: 'frontend',
    bestSource: 'slabtrack',
    files: [
      'frontend/src/components/cards/CardGrid.jsx',
      'frontend/src/pages/CollectionViewer.jsx'
    ],
    outputFiles: [
      'components/collection/CollectionGrid.jsx',
      'pages/CollectionViewer.jsx'
    ]
  },
  
  'item-detail': {
    type: 'frontend',
    bestSource: 'slabtrack',
    files: [
      'frontend/src/components/cards/CardDetailModal.jsx',
      'frontend/src/components/cards/CardDisplay.jsx'
    ],
    outputFiles: [
      'components/items/ItemDetailModal.jsx',
      'components/items/ItemDisplay.jsx'
    ]
  },
  
  'file-uploader': {
    type: 'frontend',
    bestSource: 'slabtrack',
    files: [
      'frontend/src/components/scanner/ImageUpload.jsx',
      'frontend/src/components/ImageUploadModal.jsx'
    ],
    outputFiles: [
      'components/upload/ImageUpload.jsx',
      'components/upload/UploadModal.jsx'
    ]
  },
  
  'checkout-flow': {
    type: 'frontend',
    bestSource: 'slabtrack',
    files: [
      'frontend/src/pages/CheckoutPage.jsx'
    ],
    outputFiles: [
      'pages/Checkout.jsx'
    ]
  },
  
  'pricing-table': {
    type: 'frontend',
    bestSource: 'slabtrack',
    files: [
      'frontend/src/pages/Pricing.jsx'
    ],
    outputFiles: [
      'pages/Pricing.jsx'
    ]
  },
  
  'settings-panel': {
    type: 'frontend',
    bestSource: 'slabtrack',
    files: [
      'frontend/src/pages/Settings.jsx'
    ],
    outputFiles: [
      'pages/Settings.jsx'
    ]
  },
  
  'search-filter': {
    type: 'frontend',
    bestSource: 'slabtrack',
    files: [
      'frontend/src/pages/MasterCardSearch.jsx'
    ],
    outputFiles: [
      'components/search/SearchFilter.jsx'
    ]
  },
  
  'image-gallery': {
    type: 'frontend',
    bestSource: 'slabtrack',
    files: [
      'frontend/src/pages/Gallery.jsx'
    ],
    outputFiles: [
      'components/media/Gallery.jsx'
    ]
  },
  
  'auth-context': {
    type: 'frontend',
    bestSource: 'slabtrack',
    files: [
      'frontend/src/context/AuthContext.jsx',
      'frontend/src/hooks/useAuth.js',
      'frontend/src/api/auth.js'
    ],
    outputFiles: [
      'context/AuthContext.jsx',
      'hooks/useAuth.js',
      'api/auth.js'
    ]
  },
  
  // ══════════════════════════════════════════════════════════════
  // NEW MODULES FROM FAMILY HUDDLE
  // ══════════════════════════════════════════════════════════════
  
  'calendar': {
    type: 'backend',
    bestSource: 'family-huddle',
    files: [
      'backend/routes/calendar.js'
    ],
    outputFiles: [
      'routes/calendar.js'
    ]
  },
  
  'tasks': {
    type: 'backend',
    bestSource: 'family-huddle',
    files: [
      'backend/routes/home.js'
    ],
    outputFiles: [
      'routes/tasks.js'
    ]
  },
  
  'meals': {
    type: 'backend',
    bestSource: 'family-huddle',
    files: [
      'backend/routes/meals.js'
    ],
    outputFiles: [
      'routes/meals.js'
    ]
  },
  
  'kids-banking': {
    type: 'backend',
    bestSource: 'family-huddle',
    files: [
      'backend/routes/kids-banking.js',
      'backend/routes/famcoin.js',
      'backend/services/famcoinEngine.js'
    ],
    outputFiles: [
      'routes/kids-banking.js',
      'routes/virtual-currency.js',
      'services/virtual-currency-engine.js'
    ]
  },
  
  'family-groups': {
    type: 'backend',
    bestSource: 'family-huddle',
    files: [
      'backend/routes/family.js'
    ],
    outputFiles: [
      'routes/groups.js'
    ]
  },
  
  'documents': {
    type: 'backend',
    bestSource: 'family-huddle',
    files: [
      'backend/routes/documents.js',
      'backend/services/documentsIntegration.js'
    ],
    outputFiles: [
      'routes/documents.js',
      'services/documents.js'
    ]
  },
  
  // ══════════════════════════════════════════════════════════════
  // NEW MODULES FROM UBG
  // ══════════════════════════════════════════════════════════════
  
  'inventory': {
    type: 'backend',
    bestSource: 'ubg',
    files: [
      'backend/routes/inventory.js',
      'backend/routes/cards.js'
    ],
    outputFiles: [
      'routes/inventory.js',
      'routes/items.js'
    ]
  },
  
  'marketplace': {
    type: 'backend',
    bestSource: 'ubg',
    files: [
      'backend/routes/marketplace.js',
      'backend/routes/trading.js'
    ],
    outputFiles: [
      'routes/marketplace.js',
      'routes/trading.js'
    ]
  },
  
  'page-generator': {
    type: 'backend',
    bestSource: 'ubg',
    files: [
      'backend/routes/generate.js',
      'backend/routes/ai-editor.js'
    ],
    outputFiles: [
      'routes/generate.js',
      'routes/ai-editor.js'
    ]
  },
  
  // ══════════════════════════════════════════════════════════════
  // NEW MODULES FROM CAMPUSWAGER
  // ══════════════════════════════════════════════════════════════
  
  'pools': {
    type: 'backend',
    bestSource: 'campuswager',
    files: [
      'backend/routes/pools.js'
    ],
    outputFiles: [
      'routes/pools.js'
    ]
  },
  
  'schools': {
    type: 'backend',
    bestSource: 'campuswager',
    files: [
      'backend/routes/schools.js',
      'backend/routes/platforms.js'
    ],
    outputFiles: [
      'routes/schools.js',
      'routes/platforms.js'
    ]
  },
  
  'posts': {
    type: 'backend',
    bestSource: 'campuswager',
    files: [
      'backend/routes/posts.js'
    ],
    outputFiles: [
      'routes/posts.js'
    ]
  },
  
  // ══════════════════════════════════════════════════════════════
  // NEW MODULES FROM FINANCIAL SERVICES
  // ══════════════════════════════════════════════════════════════
  
  'portfolio': {
    type: 'backend',
    bestSource: 'financial',
    files: [
      'backend/routes/collection.js',
      'backend/routes/grading.js'
    ],
    outputFiles: [
      'routes/portfolio.js',
      'routes/grading.js'
    ]
  },
  
  'achievements': {
    type: 'backend',
    bestSource: 'financial',
    files: [
      'backend/routes/achievements.js',
      'backend/routes/challenges.js'
    ],
    outputFiles: [
      'routes/achievements.js',
      'routes/challenges.js'
    ]
  },
  
  'social-feed': {
    type: 'backend',
    bestSource: 'financial',
    files: [
      'backend/routes/feed.js'
    ],
    outputFiles: [
      'routes/feed.js'
    ]
  },
  
  'payments': {
    type: 'backend',
    bestSource: 'financial',
    files: [
      'backend/routes/payments.js',
      'backend/services/stripe-service.js'
    ],
    outputFiles: [
      'routes/payments.js',
      'services/stripe.js'
    ]
  },
  
  // ══════════════════════════════════════════════════════════════
  // NEW FRONTEND MODULES
  // ══════════════════════════════════════════════════════════════
  
  'admin-panel': {
    type: 'frontend',
    bestSource: 'financial',
    files: [
      'frontend/components/admin-dashboard.js',
      'frontend/components/settings-panel.js'
    ],
    outputFiles: [
      'components/admin/Dashboard.js',
      'components/admin/SettingsPanel.js'
    ]
  },
  
  'trading-hub': {
    type: 'frontend',
    bestSource: 'financial',
    files: [
      'frontend/components/trading-hub.js',
      'frontend/components/trade-calculator.js'
    ],
    outputFiles: [
      'components/trading/TradingHub.js',
      'components/trading/Calculator.js'
    ]
  },
  
  'marketplace-ui': {
    type: 'frontend',
    bestSource: 'financial',
    files: [
      'frontend/components/marketplace/index.js',
      'frontend/components/marketplace/MarketplaceFilters.js',
      'frontend/components/marketplace/MarketplaceStats.js'
    ],
    outputFiles: [
      'components/marketplace/Marketplace.js',
      'components/marketplace/Filters.js',
      'components/marketplace/Stats.js'
    ]
  },
  
  'card-components': {
    type: 'frontend',
    bestSource: 'financial',
    files: [
      'frontend/components/card/CardPrice.js',
      'frontend/components/card-marketplace-092025.js'
    ],
    outputFiles: [
      'components/cards/CardPrice.js',
      'components/cards/CardMarketplace.js'
    ]
  }
};

// ══════════════════════════════════════════════════════════════
// BUNDLES
// ══════════════════════════════════════════════════════════════

const BUNDLES = {
  'core': ['auth', 'file-upload', 'login-form', 'register-form', 'header-nav', 'footer-section', 'modal-system', 'auth-context'],
  'dashboard': ['admin-dashboard', 'analytics', 'stat-cards', 'data-table', 'admin-panel'],
  'commerce': ['stripe-payments', 'checkout-flow', 'pricing-table', 'payments', 'marketplace', 'marketplace-ui'],
  'social': ['notifications', 'chat', 'social-feed', 'posts'],
  'collectibles': ['ai-scanner', 'collections', 'showcase', 'transfers', 'collection-grid', 'item-detail', 'file-uploader', 'card-components'],
  'ebay': ['ebay-integration'],
  'sports': ['fantasy', 'betting', 'leaderboard', 'pools', 'schools'],
  'family': ['calendar', 'tasks', 'meals', 'kids-banking', 'family-groups', 'documents'],
  'inventory': ['inventory', 'portfolio', 'trading-hub'],
  'gamification': ['achievements']
};

// ══════════════════════════════════════════════════════════════
// EXTRACTION FUNCTIONS
// ══════════════════════════════════════════════════════════════

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`  📁 Created: ${dirPath}`);
  }
}

function copyFile(srcPath, destPath) {
  try {
    const content = fs.readFileSync(srcPath, 'utf-8');
    ensureDir(path.dirname(destPath));
    fs.writeFileSync(destPath, content);
    console.log(`  ✅ Copied: ${path.basename(srcPath)}`);
    return true;
  } catch (err) {
    console.log(`  ⚠️  Not found: ${srcPath}`);
    return false;
  }
}

function extractModule(moduleName) {
  const module = MODULES[moduleName];
  if (!module) {
    console.log(`❌ Unknown module: ${moduleName}`);
    return false;
  }
  
  console.log(`\n📦 Extracting: ${moduleName}`);
  console.log(`   Source: ${module.bestSource}`);
  console.log(`   Type: ${module.type}`);
  
  const sourcePath = PLATFORM_PATHS[module.bestSource];
  if (!sourcePath) {
    console.log(`❌ Unknown platform: ${module.bestSource}`);
    return false;
  }
  
  const outputBase = path.join(OUTPUT_PATH, module.type, moduleName);
  let successCount = 0;
  
  for (let i = 0; i < module.files.length; i++) {
    const srcFile = path.join(sourcePath, module.files[i]);
    const destFile = path.join(outputBase, module.outputFiles[i]);
    
    if (copyFile(srcFile, destFile)) {
      successCount++;
    }
  }
  
  console.log(`   ✓ Extracted ${successCount}/${module.files.length} files`);
  
  // Create module manifest
  const manifest = {
    name: moduleName,
    type: module.type,
    source: module.bestSource,
    extractedAt: new Date().toISOString(),
    files: module.outputFiles
  };
  
  fs.writeFileSync(
    path.join(outputBase, 'module.json'),
    JSON.stringify(manifest, null, 2)
  );
  
  return successCount > 0;
}

function extractBundle(bundleName) {
  const modules = BUNDLES[bundleName];
  if (!modules) {
    console.log(`❌ Unknown bundle: ${bundleName}`);
    return;
  }
  
  console.log(`\n🎁 Extracting Bundle: ${bundleName}`);
  console.log(`   Modules: ${modules.join(', ')}`);
  
  for (const moduleName of modules) {
    extractModule(moduleName);
  }
}

function extractAll() {
  console.log('\n🚀 Extracting ALL modules...\n');
  
  for (const moduleName of Object.keys(MODULES)) {
    extractModule(moduleName);
  }
}

function listModules() {
  console.log('\n📋 Available Modules:\n');
  
  console.log('BACKEND:');
  for (const [name, module] of Object.entries(MODULES)) {
    if (module.type === 'backend') {
      console.log(`  • ${name} (from ${module.bestSource})`);
    }
  }
  
  console.log('\nFRONTEND:');
  for (const [name, module] of Object.entries(MODULES)) {
    if (module.type === 'frontend') {
      console.log(`  • ${name} (from ${module.bestSource})`);
    }
  }
  
  console.log('\nBUNDLES:');
  for (const [name, modules] of Object.entries(BUNDLES)) {
    console.log(`  • ${name}: ${modules.join(', ')}`);
  }
}

// ══════════════════════════════════════════════════════════════
// CLI
// ══════════════════════════════════════════════════════════════

const args = process.argv.slice(2);

if (args.includes('--list')) {
  listModules();
} else if (args.includes('--all')) {
  extractAll();
} else if (args.includes('--bundle')) {
  const bundleIndex = args.indexOf('--bundle');
  const bundleName = args[bundleIndex + 1];
  extractBundle(bundleName);
} else if (args.includes('--module')) {
  const moduleIndex = args.indexOf('--module');
  const moduleName = args[moduleIndex + 1];
  extractModule(moduleName);
} else {
  console.log(`
BE1st Module Extractor
======================

Usage:
  node extract-modules.js --list              List all available modules
  node extract-modules.js --module auth       Extract single module
  node extract-modules.js --bundle core       Extract module bundle
  node extract-modules.js --all               Extract ALL modules

Bundles:
  core        - Auth, upload, login, register, navbar, footer, modal
  dashboard   - Admin, analytics, stat cards, data table
  commerce    - Stripe, checkout, pricing
  social      - Notifications, chat
  collectibles - Scanner, collections, showcase, transfers
  ebay        - eBay integration
  sports      - Fantasy, betting, leaderboard

Output: ${OUTPUT_PATH}
  `);
}
