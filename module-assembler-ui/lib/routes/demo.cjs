/**
 * Demo Batch Generate Routes
 * For investor demos - generates 4 businesses simultaneously
 *
 * Uses SSE for real-time progress updates
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { createBackup, findProjectPath } = require('../services/backup-service.cjs');
const { findRailwayProject, deleteRailwayProject, deleteGitHubRepo, sanitizeName } = require('../services/project-deleter.cjs');

/**
 * Count files and estimate stats for a generated project
 * @param {string} projectPath - Path to the project
 * @returns {object} - Stats object
 */
function countProjectStats(projectPath) {
  const stats = {
    files: 0,
    linesOfCode: 0,
    reactComponents: 0,
    apiEndpoints: 0,
    adminModules: 0
  };

  const codeExtensions = ['.js', '.jsx', '.cjs', '.ts', '.tsx', '.css', '.json', '.html'];

  function walkDir(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      // Skip node_modules and hidden folders
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;

      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (codeExtensions.includes(ext)) {
          stats.files++;

          // Count lines of code
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n').length;
            stats.linesOfCode += lines;

            // Count React components (files with JSX that export)
            if ((ext === '.jsx' || ext === '.tsx') && content.includes('export')) {
              stats.reactComponents++;
            }

            // Count API endpoints (router.get, router.post, etc.)
            if (content.includes('router.') && (content.includes('.get(') || content.includes('.post(') || content.includes('.put(') || content.includes('.delete('))) {
              const matches = content.match(/router\.(get|post|put|delete|patch)\s*\(/g);
              if (matches) {
                stats.apiEndpoints += matches.length;
              }
            }
          } catch (e) {
            // Ignore read errors
          }
        }
      }
    }
  }

  walkDir(projectPath);

  // Count admin modules from admin-config.json if exists
  const adminConfigPath = path.join(projectPath, 'admin', 'admin-config.json');
  if (fs.existsSync(adminConfigPath)) {
    try {
      const adminConfig = JSON.parse(fs.readFileSync(adminConfigPath, 'utf8'));
      stats.adminModules = adminConfig.modules?.length || 0;
    } catch (e) {
      // Ignore
    }
  }

  return stats;
}

/**
 * Preset Demo Businesses - ready for investor presentations
 */
const DEMO_BUSINESSES = [
  {
    id: 'aurelius',
    name: "Aurelius Steakhouse",
    industry: 'restaurant',
    industryIcon: '🥩',
    tagline: "Where tradition meets perfection",
    location: "Upper East Side, Manhattan",
    theme: {
      colors: {
        primary: '#722F37',    // Burgundy
        accent: '#C9A961',     // Gold
        secondary: '#2D2D2D',
        background: '#1A1A1A',
        text: '#F5F0E6'
      }
    },
    // Full page set: marketing + user account pages (required for companion app)
    pages: ['home', 'menu', 'reservations', 'about', 'contact', 'login', 'signup', 'dashboard', 'profile', 'rewards'],
    modules: ['booking-system', 'loyalty-program', 'auth'],
    adminTier: 'professional',
    adminModules: ['admin-dashboard', 'admin-bookings', 'admin-customers', 'admin-analytics']
  },
  {
    id: 'slice-house',
    name: "Slice House",
    industry: 'pizza',
    industryIcon: '🍕',
    tagline: "NYC's finest artisan pizza",
    location: "Brooklyn, New York",
    theme: {
      colors: {
        primary: '#E63946',    // Pizza red
        accent: '#F4A261',     // Orange
        secondary: '#2A9D8F',
        background: '#1D3557',
        text: '#F1FAEE'
      }
    },
    // Full page set: marketing + user account pages (required for companion app)
    pages: ['home', 'menu', 'order', 'about', 'contact', 'login', 'signup', 'dashboard', 'profile', 'rewards'],
    modules: ['online-ordering', 'loyalty-program', 'auth'],
    adminTier: 'professional',
    adminModules: ['admin-dashboard', 'admin-bookings', 'admin-customers', 'admin-analytics']
  },
  {
    id: 'studio-luxe',
    name: "Studio Luxe",
    industry: 'spa-salon',
    industryIcon: '💆',
    tagline: "Luxury wellness reimagined",
    location: "Beverly Hills, California",
    theme: {
      colors: {
        primary: '#9D8189',    // Mauve
        accent: '#D4AF37',     // Gold
        secondary: '#5D5C61',
        background: '#F5F5F5',
        text: '#2D2D2D'
      }
    },
    // Full page set: marketing + user account pages (required for companion app)
    pages: ['home', 'services', 'booking', 'about', 'contact', 'login', 'signup', 'dashboard', 'profile', 'rewards'],
    modules: ['booking-system', 'loyalty-program', 'auth'],
    adminTier: 'professional',
    adminModules: ['admin-dashboard', 'admin-bookings', 'admin-customers', 'admin-analytics']
  },
  {
    id: 'fitzone',
    name: "FitZone",
    industry: 'fitness',
    industryIcon: '💪',
    tagline: "Transform your limits",
    location: "Austin, Texas",
    theme: {
      colors: {
        primary: '#00B4D8',    // Electric blue
        accent: '#90E0EF',     // Light blue
        secondary: '#023E8A',
        background: '#0A0A0A',
        text: '#FFFFFF'
      }
    },
    // Full page set: marketing + user account pages (required for companion app)
    pages: ['home', 'classes', 'membership', 'trainers', 'contact', 'login', 'signup', 'dashboard', 'profile', 'rewards'],
    modules: ['booking-system', 'membership-system', 'auth'],
    adminTier: 'professional',
    adminModules: ['admin-dashboard', 'admin-bookings', 'admin-customers', 'admin-analytics']
  }
];

/**
 * Create demo routes
 * @param {Object} deps - Dependencies from server
 */
function createDemoRoutes(deps) {
  const router = express.Router();
  const {
    INDUSTRIES,
    generateBrainJson,
    copyDirectorySync,
    GENERATED_PROJECTS,
    MODULE_LIBRARY,
    ASSEMBLE_SCRIPT,
    autoDeployProject,
    deployCompanionApp,
    db,
    buildOrchestratorPagePrompt,
    buildAppJsx,
    buildFallbackPage,
    buildFallbackThemeCss,
    validateGeneratedCode,
    toComponentName,
    getLayoutConfigFull
  } = deps;

  /**
   * GET /api/demo/presets
   * Returns the demo business presets for UI display
   */
  router.get('/presets', (req, res) => {
    res.json({
      success: true,
      businesses: DEMO_BUSINESSES.map(b => ({
        id: b.id,
        name: b.name,
        industry: b.industry,
        industryIcon: b.industryIcon,
        tagline: b.tagline,
        location: b.location,
        pages: b.pages,
        colors: b.theme.colors
      }))
    });
  });

  /**
   * POST /api/demo/batch-generate
   * Generates all 4 demo businesses in parallel
   *
   * Uses Server-Sent Events (SSE) for real-time progress
   *
   * Query params:
   *   ?deploy=true - Also deploys to .be1st.io/.be1st.app
   */
  router.post('/batch-generate', async (req, res) => {
    const { deploy = false, businesses = null, businessIds = null, cleanFirst = false, customizations = null } = req.body;
    const startTime = Date.now();

    // Generate unique batch ID for this demo run
    const now = new Date();
    const demoBatchId = `demo-${now.toISOString().slice(0, 10)}-${now.getHours()}${String(now.getMinutes()).padStart(2, '0')}`;

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
    res.flushHeaders();

    // Helper to send SSE events
    const sendEvent = (type, data) => {
      res.write(`event: ${type}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // Filter businesses based on provided IDs, or use all presets
    let businessesToGenerate;
    if (businessIds && Array.isArray(businessIds)) {
      // Filter to only selected IDs, maintaining order
      businessesToGenerate = businessIds
        .map(id => DEMO_BUSINESSES.find(b => b.id === id))
        .filter(Boolean);
    } else if (businesses) {
      businessesToGenerate = businesses;
    } else {
      businessesToGenerate = DEMO_BUSINESSES;
    }

    // Apply customizations (edited names/taglines) if provided
    if (customizations && Array.isArray(customizations)) {
      businessesToGenerate = businessesToGenerate.map(biz => {
        const custom = customizations.find(c => c.id === biz.id);
        if (custom) {
          return {
            ...biz,
            name: custom.name || biz.name,
            tagline: custom.tagline || biz.tagline,
            location: custom.location || biz.location
          };
        }
        return biz;
      });
    }

    // Add Demo- prefix and date stamp to all business names for easy identification
    const dateStamp = `${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    businessesToGenerate = businessesToGenerate.map(biz => ({
      ...biz,
      name: `Demo-${biz.name}-${dateStamp}`,
      originalName: biz.name // Keep original for display purposes
    }));

    // Clean existing projects if requested (with automatic backup)
    if (cleanFirst) {
      console.log('🧹 Cleaning existing demo projects...');
      for (const business of businessesToGenerate) {
        const projectSanitizedName = sanitizeName(business.name);
        const projectPath = path.join(GENERATED_PROJECTS, business.name.replace(/&/g, ' and ').replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-').trim().substring(0, 50));

        // Clean local files
        if (fs.existsSync(projectPath)) {
          try {
            // Create backup before deleting
            console.log(`   💾 Backing up: ${projectSanitizedName}`);
            const backupResult = await createBackup(business.name, 'Before demo regeneration');
            if (backupResult.success) {
              console.log(`   ✓ Backup created: ${backupResult.backup.id}`);
            }
            // Now delete local
            fs.rmSync(projectPath, { recursive: true, force: true });
            console.log(`   🗑️ Deleted local: ${projectSanitizedName}`);
          } catch (err) {
            console.warn(`   ⚠️ Could not clean local ${projectSanitizedName}: ${err.message}`);
          }
        }

        // Clean Railway project if it exists
        try {
          const railwayProject = await findRailwayProject(projectSanitizedName);
          if (railwayProject) {
            console.log(`   🚂 Found Railway project: ${railwayProject.name} (${railwayProject.id})`);
            const railwayResult = await deleteRailwayProject(railwayProject.id);
            if (railwayResult.success) {
              console.log(`   🗑️ Deleted Railway: ${railwayProject.name}`);
            } else {
              console.warn(`   ⚠️ Railway delete failed: ${railwayResult.message}`);
            }
          }
        } catch (railwayErr) {
          console.warn(`   ⚠️ Railway cleanup error: ${railwayErr.message}`);
        }

        // Clean companion app Railway project if exists
        try {
          const companionProject = await findRailwayProject(`${projectSanitizedName}-app`);
          if (companionProject) {
            console.log(`   📱 Found companion Railway: ${companionProject.name}`);
            const companionResult = await deleteRailwayProject(companionProject.id);
            if (companionResult.success) {
              console.log(`   🗑️ Deleted companion Railway: ${companionProject.name}`);
            }
          }
        } catch (companionErr) {
          // Ignore companion cleanup errors
        }

        // Clean GitHub repos (optional - uncomment if desired)
        // const GITHUB_OWNER = 'huddleeco-commits';
        // for (const suffix of ['-backend', '-frontend', '-admin']) {
        //   try {
        //     await deleteGitHubRepo(GITHUB_OWNER, `${projectSanitizedName}${suffix}`);
        //   } catch (e) { /* ignore */ }
        // }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🚀 INVESTOR DEMO - BATCH GENERATION');
    console.log('='.repeat(60));
    console.log(`📦 Generating ${businessesToGenerate.length} businesses in parallel`);
    console.log(`🚀 Auto-deploy: ${deploy ? 'YES' : 'NO'}`);
    console.log(`🧹 Clean first: ${cleanFirst ? 'YES' : 'NO'}`);
    console.log('');

    // Track progress for each business
    const progress = {};
    businessesToGenerate.forEach(b => {
      progress[b.id] = {
        id: b.id,
        name: b.name,
        industryIcon: b.industryIcon,
        status: 'pending',
        step: 'Waiting...',
        progress: 0,
        urls: {}
      };
    });

    // Send initial state
    sendEvent('init', {
      businesses: Object.values(progress),
      totalCount: businessesToGenerate.length,
      startTime: startTime
    });

    /**
     * Generate a single business
     */
    async function generateBusiness(business, businessIndex = 0) {
      const businessStartTime = Date.now();
      const updateProgress = (step, pct, status = 'in_progress') => {
        progress[business.id] = {
          ...progress[business.id],
          status,
          step,
          progress: pct
        };
        sendEvent('progress', progress[business.id]);
      };

      try {
        updateProgress('Starting...', 5);
        console.log(`\n📦 [${business.id}] Starting ${business.name}...`);

        // Sanitize project name
        const sanitizedName = business.name
          .replace(/&/g, ' and ')
          .replace(/[^a-zA-Z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .trim()
          .substring(0, 50);

        const projectPath = path.join(GENERATED_PROJECTS, sanitizedName);

        // Build assembly args
        const args = [
          '--name', sanitizedName,
          '--industry', business.industry.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        ];

        updateProgress('Running assembly...', 15);

        // Run the assembly script
        await new Promise((resolve, reject) => {
          const childProcess = spawn(process.execPath, [ASSEMBLE_SCRIPT, ...args], {
            cwd: path.dirname(ASSEMBLE_SCRIPT),
            shell: false,
            env: { ...process.env, MODULE_LIBRARY_PATH: MODULE_LIBRARY, OUTPUT_PATH: GENERATED_PROJECTS }
          });

          let output = '';
          let errorOutput = '';

          childProcess.stdout.on('data', (data) => {
            output += data.toString();
          });

          childProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
          });

          childProcess.on('close', (code) => {
            if (code === 0) {
              resolve(output);
            } else {
              reject(new Error(`Assembly failed with code ${code}: ${errorOutput}`));
            }
          });

          childProcess.on('error', reject);

          // Timeout after 3 minutes
          setTimeout(() => {
            childProcess.kill('SIGTERM');
            reject(new Error('Assembly timeout'));
          }, 180000);
        });

        updateProgress('Generating brain.json...', 30);

        // Generate brain.json with demo metadata
        const industryConfig = INDUSTRIES[business.industry] || {};
        const brainJsonContent = generateBrainJson(sanitizedName, business.industry, industryConfig, {
          adminTier: business.adminTier,
          adminModules: business.adminModules,
          adminReason: 'Demo mode'
        });

        // Parse and enhance with demo-specific data
        const brainData = JSON.parse(brainJsonContent);
        brainData.tagline = business.tagline;
        brainData.location = business.location;
        brainData.theme = business.theme;
        brainData.demoMode = true;
        brainData.generatedAt = new Date().toISOString();

        fs.writeFileSync(path.join(projectPath, 'brain.json'), JSON.stringify(brainData, null, 2));

        updateProgress('Generating pages...', 40);

        // Generate frontend pages
        const frontendSrcPath = path.join(projectPath, 'frontend', 'src');
        const pagesDir = path.join(frontendSrcPath, 'pages');

        if (!fs.existsSync(pagesDir)) {
          fs.mkdirSync(pagesDir, { recursive: true });
        }

        const promptConfig = {
          businessName: business.name,
          industry: industryConfig,
          colors: business.theme.colors,
          typography: { heading: "'Inter', sans-serif", body: "system-ui, sans-serif" }
        };

        // Try AI generation, fall back to templates
        const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;

        if (apiKey) {
          try {
            const { default: Anthropic } = await import('@anthropic-ai/sdk');
            const client = new Anthropic({ apiKey });
            const MODEL_NAME = 'claude-sonnet-4-20250514';

            // Get layout intelligence for this industry
            const layoutConfig = getLayoutConfigFull ? getLayoutConfigFull(business.industry, null) : null;

            // Generate pages in parallel
            const pagePromises = business.pages.map(async (pageId) => {
              const componentName = toComponentName(pageId);
              const description = {
                text: `${business.name} - ${business.tagline}`,
                pages: business.pages,
                businessName: business.name,
                tagline: business.tagline,
                industryKey: business.industry,
                location: business.location
              };
              const otherPages = business.pages.filter(p => p !== pageId).map(p => `/${p}`).join(', ');

              try {
                const pagePrompt = buildOrchestratorPagePrompt(pageId, componentName, otherPages, description, promptConfig, layoutConfig);
                const pageResponse = await client.messages.create({
                  model: MODEL_NAME,
                  max_tokens: 8000,
                  messages: [{ role: 'user', content: pagePrompt }]
                });

                let pageCode = pageResponse.content[0].text;
                pageCode = pageCode.replace(/^```jsx?\n?/g, '').replace(/\n?```$/g, '').trim();

                const validation = validateGeneratedCode(pageCode, componentName);
                // Always use fixedCode - it contains auto-fixes for apostrophes, quotes, fonts, etc.
                pageCode = validation.fixedCode;

                if (!pageCode.includes('export default')) {
                  pageCode = buildFallbackPage(componentName, pageId, promptConfig);
                }

                fs.writeFileSync(path.join(pagesDir, `${componentName}Page.jsx`), pageCode);
                return { success: true };
              } catch (err) {
                const fallbackCode = buildFallbackPage(componentName, pageId, promptConfig);
                fs.writeFileSync(path.join(pagesDir, `${componentName}Page.jsx`), fallbackCode);
                return { success: false, fallback: true };
              }
            });

            await Promise.all(pagePromises);
          } catch (aiError) {
            console.log(`   [${business.id}] AI generation failed, using fallbacks`);
            // Generate fallback pages
            for (const pageId of business.pages) {
              const componentName = toComponentName(pageId);
              const fallbackCode = buildFallbackPage(componentName, pageId, promptConfig);
              fs.writeFileSync(path.join(pagesDir, `${componentName}Page.jsx`), fallbackCode);
            }
          }
        } else {
          // Generate fallback pages without AI
          for (const pageId of business.pages) {
            const componentName = toComponentName(pageId);
            const fallbackCode = buildFallbackPage(componentName, pageId, promptConfig);
            fs.writeFileSync(path.join(pagesDir, `${componentName}Page.jsx`), fallbackCode);
          }
        }

        // Generate App.jsx
        const appJsx = buildAppJsx(sanitizedName, business.pages, promptConfig, business.industry);
        fs.writeFileSync(path.join(frontendSrcPath, 'App.jsx'), appJsx);

        // Generate theme.css
        const themeCssPath = path.join(frontendSrcPath, 'theme.css');
        if (!fs.existsSync(themeCssPath)) {
          const fallbackTheme = buildFallbackThemeCss(promptConfig);
          fs.writeFileSync(themeCssPath, fallbackTheme);
        }

        // Create CartContext for industries that need cart functionality
        const cartIndustries = ['restaurant', 'pizza', 'retail', 'ecommerce', 'collectibles'];
        if (cartIndustries.includes(business.industry)) {
          const contextDir = path.join(frontendSrcPath, 'context');
          if (!fs.existsSync(contextDir)) {
            fs.mkdirSync(contextDir, { recursive: true });
          }

          const cartContextCode = `/**
 * Cart Context - Global state management for shopping cart
 * Auto-generated for ${business.name}
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext(null);

const initialState = {
  items: [],
  promoCode: null,
  promoDiscount: 0,
  orderType: 'pickup',
  specialInstructions: ''
};

const ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  SET_PROMO: 'SET_PROMO',
  CLEAR_PROMO: 'CLEAR_PROMO',
  SET_ORDER_TYPE: 'SET_ORDER_TYPE',
  LOAD_CART: 'LOAD_CART'
};

function generateCartItemId(item) {
  const optionsKey = (item.options || []).map(o => o.id).sort().join('|');
  return \`\${item.id}-\${item.variantId || 'default'}-\${optionsKey}\`;
}

function cartReducer(state, action) {
  switch (action.type) {
    case ACTIONS.ADD_ITEM: {
      const cartItemId = generateCartItemId(action.payload);
      const existingIndex = state.items.findIndex(i => i.cartItemId === cartItemId);
      if (existingIndex >= 0) {
        const newItems = [...state.items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + (action.payload.quantity || 1)
        };
        return { ...state, items: newItems };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, cartItemId, quantity: action.payload.quantity || 1 }]
      };
    }
    case ACTIONS.REMOVE_ITEM:
      return { ...state, items: state.items.filter(i => i.cartItemId !== action.payload) };
    case ACTIONS.UPDATE_QUANTITY: {
      const { cartItemId, quantity } = action.payload;
      if (quantity <= 0) {
        return { ...state, items: state.items.filter(i => i.cartItemId !== cartItemId) };
      }
      return { ...state, items: state.items.map(i => i.cartItemId === cartItemId ? { ...i, quantity } : i) };
    }
    case ACTIONS.CLEAR_CART:
      return { ...initialState, orderType: state.orderType };
    case ACTIONS.SET_PROMO:
      return { ...state, promoCode: action.payload.code, promoDiscount: action.payload.discount };
    case ACTIONS.CLEAR_PROMO:
      return { ...state, promoCode: null, promoDiscount: 0 };
    case ACTIONS.SET_ORDER_TYPE:
      return { ...state, orderType: action.payload };
    case ACTIONS.LOAD_CART:
      return { ...initialState, ...action.payload };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cart_${sanitizedName.toLowerCase()}');
      if (saved) dispatch({ type: ACTIONS.LOAD_CART, payload: JSON.parse(saved) });
    } catch (e) { console.error('Failed to load cart:', e); }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('cart_${sanitizedName.toLowerCase()}', JSON.stringify(state));
    } catch (e) { console.error('Failed to save cart:', e); }
  }, [state]);

  const subtotal = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const tax = (subtotal - state.promoDiscount) * 0.08;
  const total = subtotal - state.promoDiscount + tax;

  const value = {
    items: state.items,
    promoCode: state.promoCode,
    promoDiscount: state.promoDiscount,
    orderType: state.orderType,
    subtotal,
    tax,
    total,
    itemCount,
    isEmpty: state.items.length === 0,
    addItem: (item) => dispatch({ type: ACTIONS.ADD_ITEM, payload: item }),
    removeItem: (cartItemId) => dispatch({ type: ACTIONS.REMOVE_ITEM, payload: cartItemId }),
    updateQuantity: (cartItemId, quantity) => dispatch({ type: ACTIONS.UPDATE_QUANTITY, payload: { cartItemId, quantity } }),
    clearCart: () => dispatch({ type: ACTIONS.CLEAR_CART }),
    setPromo: (code, discount) => dispatch({ type: ACTIONS.SET_PROMO, payload: { code, discount } }),
    clearPromo: () => dispatch({ type: ACTIONS.CLEAR_PROMO }),
    setOrderType: (type) => dispatch({ type: ACTIONS.SET_ORDER_TYPE, payload: type })
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}

export default CartContext;
`;
          fs.writeFileSync(path.join(contextDir, 'CartContext.jsx'), cartContextCode);
          console.log(`   [${business.id}] Created CartContext for ${business.industry} industry`);
        }

        updateProgress('Setting up admin...', 60);

        // Copy admin modules
        const adminDest = path.join(projectPath, 'admin');
        try {
          const { loadModulesForAssembly, generateAdminAppJsx } = require('../services/admin-module-loader.cjs');
          const moduleData = loadModulesForAssembly(business.adminModules);

          const businessAdminSrc = path.join(MODULE_LIBRARY, 'frontend', 'business-admin');
          if (fs.existsSync(businessAdminSrc)) {
            copyDirectorySync(businessAdminSrc, adminDest);
          }

          const modulesDir = path.join(adminDest, 'src', 'modules');
          if (!fs.existsSync(modulesDir)) {
            fs.mkdirSync(modulesDir, { recursive: true });
          }

          // Admin modules are at module-assembler-ui/backend/admin-modules/
          // __dirname is lib/routes/, so we go up 2 levels to module-assembler-ui/
          const adminModulesRoot = path.join(__dirname, '../../backend/admin-modules');

          const sharedSrc = path.join(adminModulesRoot, '_shared');
          if (fs.existsSync(sharedSrc)) {
            copyDirectorySync(sharedSrc, path.join(modulesDir, '_shared'));
          }

          for (const mod of moduleData.modules) {
            const modSrc = path.join(adminModulesRoot, mod.name);
            const modDest = path.join(modulesDir, mod.name);
            if (fs.existsSync(modSrc)) {
              copyDirectorySync(modSrc, modDest);
            } else {
              console.log(`   [${business.id}] Admin module not found: ${modSrc}`);
            }
          }

          const adminAppJsx = generateAdminAppJsx(business.adminModules, { businessName: business.name });
          fs.writeFileSync(path.join(adminDest, 'src', 'App.jsx'), adminAppJsx);

          fs.writeFileSync(path.join(adminDest, 'admin-config.json'), JSON.stringify({
            tier: business.adminTier,
            modules: business.adminModules,
            generatedAt: new Date().toISOString(),
            sidebar: moduleData.sidebar,
            routes: moduleData.routes
          }, null, 2));
        } catch (adminErr) {
          console.log(`   [${business.id}] Admin setup fallback: ${adminErr.message}`);
          const businessAdminSrc = path.join(MODULE_LIBRARY, 'frontend', 'business-admin');
          if (fs.existsSync(businessAdminSrc)) {
            copyDirectorySync(businessAdminSrc, adminDest);
          }
        }

        updateProgress('Generating companion app...', 75);

        // Generate companion app
        try {
          const { generateCompanionApp } = require('../generators/companion-generator.cjs');

          // Determine quick actions based on industry
          // These must match QUICK_ACTION_CONFIG keys or ACTION_ALIASES in companion-generator.cjs
          // Comprehensive industry quick actions mapping for companion apps
          // Each industry gets 4 relevant quick actions for the home screen
          const industryQuickActions = {
            // === FOOD & BEVERAGE ===
            'restaurant': ['viewMenu', 'makeReservation', 'viewLoyalty', 'orderFood'],
            'pizza': ['viewMenu', 'orderFood', 'viewLoyalty', 'checkIn'],
            'pizzeria': ['viewMenu', 'orderFood', 'viewLoyalty', 'checkIn'],
            'steakhouse': ['viewMenu', 'makeReservation', 'viewLoyalty', 'orderFood'],
            'cafe': ['viewMenu', 'orderFood', 'viewLoyalty', 'checkIn'],
            'bar': ['viewMenu', 'makeReservation', 'viewLoyalty', 'events'],
            'bakery': ['viewMenu', 'orderFood', 'viewLoyalty', 'checkIn'],
            'brewery': ['viewMenu', 'makeReservation', 'viewLoyalty', 'events'],
            'winery': ['viewMenu', 'makeReservation', 'viewLoyalty', 'events'],
            'coffee-shop': ['viewMenu', 'orderFood', 'viewLoyalty', 'checkIn'],

            // === HEALTHCARE ===
            'healthcare': ['bookAppointment', 'viewRecords', 'prescriptions', 'messages'],
            'dental': ['bookAppointment', 'viewRecords', 'messages', 'profile'],
            'chiropractic': ['bookAppointment', 'viewRecords', 'messages', 'profile'],
            'veterinary': ['bookAppointment', 'viewRecords', 'messages', 'profile'],

            // === BEAUTY & WELLNESS ===
            'spa-salon': ['bookAppointment', 'viewLoyalty', 'messages', 'profile'],
            'barbershop': ['bookAppointment', 'viewLoyalty', 'messages', 'profile'],
            'fitness': ['viewClasses', 'bookAppointment', 'viewLoyalty', 'checkIn'],
            'yoga': ['viewClasses', 'bookAppointment', 'viewLoyalty', 'checkIn'],
            'yoga-studio': ['viewClasses', 'bookAppointment', 'viewLoyalty', 'checkIn'],
            'martial-arts': ['viewClasses', 'bookAppointment', 'viewLoyalty', 'checkIn'],

            // === PROFESSIONAL SERVICES ===
            'law-firm': ['bookAppointment', 'documents', 'messages', 'profile'],
            'accounting': ['bookAppointment', 'documents', 'messages', 'profile'],
            'consulting': ['bookAppointment', 'documents', 'messages', 'profile'],
            'real-estate': ['savedListings', 'scheduleTour', 'messages', 'calculator'],
            'insurance': ['documents', 'messages', 'billing', 'profile'],
            'finance': ['dashboard', 'documents', 'messages', 'profile'],
            'financial-advisor': ['bookAppointment', 'documents', 'messages', 'profile'],

            // === TECHNOLOGY ===
            'saas': ['dashboard', 'messages', 'billing', 'profile'],
            'startup': ['dashboard', 'messages', 'community', 'profile'],
            'agency': ['dashboard', 'documents', 'messages', 'profile'],
            'gaming': ['dashboard', 'leaderboard', 'community', 'profile'],

            // === RETAIL ===
            'ecommerce': ['viewMenu', 'orderFood', 'viewLoyalty', 'profile'],
            'subscription-box': ['dashboard', 'viewLoyalty', 'messages', 'profile'],
            'collectibles': ['myCollection', 'marketplace', 'scan', 'profile'],

            // === CREATIVE ===
            'photography': ['bookAppointment', 'viewLoyalty', 'messages', 'profile'],
            'wedding': ['bookAppointment', 'documents', 'messages', 'profile'],
            'portfolio': ['messages', 'profile', 'dashboard', 'documents'],
            'musician': ['events', 'community', 'messages', 'profile'],
            'podcast': ['dashboard', 'community', 'messages', 'profile'],

            // === ORGANIZATIONS ===
            'nonprofit': ['events', 'community', 'messages', 'profile'],
            'church': ['events', 'community', 'messages', 'profile'],
            'school': ['myCourses', 'assignments', 'messages', 'profile'],
            'online-course': ['myCourses', 'progress', 'certificates', 'profile'],

            // === TRADE SERVICES ===
            'construction': ['bookAppointment', 'documents', 'messages', 'profile'],
            'plumber': ['bookAppointment', 'messages', 'billing', 'profile'],
            'electrician': ['bookAppointment', 'messages', 'billing', 'profile'],
            'hvac': ['bookAppointment', 'messages', 'billing', 'profile'],
            'landscaping': ['bookAppointment', 'messages', 'billing', 'profile'],
            'roofing': ['bookAppointment', 'documents', 'messages', 'profile'],
            'cleaning': ['bookAppointment', 'viewLoyalty', 'messages', 'profile'],
            'auto-repair': ['bookAppointment', 'viewRecords', 'messages', 'profile'],
            'moving': ['bookAppointment', 'documents', 'messages', 'profile'],

            // === OTHER ===
            'pet-services': ['bookAppointment', 'viewLoyalty', 'messages', 'profile'],
            'event-venue': ['bookAppointment', 'events', 'messages', 'profile'],
            'hotel': ['bookRoom', 'events', 'messages', 'profile'],
            'travel': ['savedListings', 'bookAppointment', 'messages', 'profile'],
            'daycare': ['bookAppointment', 'documents', 'messages', 'profile'],
            'tutoring': ['bookAppointment', 'myCourses', 'messages', 'profile'],
            'music-school': ['bookAppointment', 'myCourses', 'messages', 'profile'],
            'florist': ['viewMenu', 'orderFood', 'viewLoyalty', 'profile'],
            'survey-rewards': ['dashboard', 'viewLoyalty', 'leaderboard', 'profile']
          };

          const quickActions = industryQuickActions[business.industry] || ['dashboard', 'viewLoyalty', 'messages', 'profile'];
          const companionOutputPath = path.join(projectPath, 'companion-app');

          // Use Railway URL directly for more reliable connectivity (custom domains may have DNS delays)
          // Railway URL format: https://{project-name}-backend.up.railway.app
          const railwayBackendUrl = `https://${sanitizedName.toLowerCase()}-backend.up.railway.app`;

          const companionResult = await generateCompanionApp({
            appType: 'customer',
            industry: business.industry,
            quickActions: quickActions,
            parentSite: {
              name: business.name,
              subdomain: sanitizedName.toLowerCase(),
              backendUrl: railwayBackendUrl,
              theme: {
                primaryColor: business.theme?.colors?.primary || '#6366f1',
                accentColor: business.theme?.colors?.accent || '#8b5cf6',
                backgroundColor: business.theme?.colors?.background || '#0a0a0f',
                textColor: business.theme?.colors?.text || '#ffffff'
              },
              brain: brainData
            }
          }, companionOutputPath);

          if (companionResult) {
            console.log(`   [${business.id}] Companion app generated at ${companionOutputPath}`);
            progress[business.id].companionApp = true;
          }
        } catch (companionErr) {
          console.log(`   [${business.id}] Companion app skipped: ${companionErr.message}`);
          progress[business.id].companionApp = false;
        }

        // Save demo metadata
        const demoMeta = {
          generatedAt: new Date().toISOString(),
          demoMode: true,
          business: {
            id: business.id,
            name: business.name,
            industry: business.industry,
            tagline: business.tagline,
            location: business.location
          },
          generationTimeMs: Date.now() - businessStartTime
        };
        fs.writeFileSync(path.join(projectPath, 'demo-meta.json'), JSON.stringify(demoMeta, null, 2));

        // Handle deployment if requested
        if (deploy && autoDeployProject) {
          updateProgress('Deploying website to cloud...', 85);

          try {
            const deployResult = await autoDeployProject(projectPath, sanitizedName.toLowerCase(), 'demo@be1st.io');

            if (deployResult.success) {
              progress[business.id].urls = deployResult.urls || {};

              // NOTE: Companion apps are now deployed in Phase 2 SEQUENTIALLY after all main sites complete
              // This avoids Railway rate limiting (30s between project creations)

              updateProgress('Main site deployed!', 90, 'in_progress'); // Keep in_progress for companion phase

              // Track in database
              if (db && db.trackDemoDeployment) {
                try {
                  await db.trackDemoDeployment({
                    name: business.name,
                    originalName: business.originalName || business.name,
                    industry: business.industry,
                    tagline: business.tagline,
                    location: business.location,
                    demoBatchId: demoBatchId,
                    status: 'deployed',
                    domain: `${sanitizedName.toLowerCase()}.be1st.io`,
                    urls: {
                      frontend: progress[business.id].urls.frontend,
                      admin: progress[business.id].urls.admin,
                      backend: progress[business.id].urls.backend,
                      companion: progress[business.id].urls.companion
                    },
                    github: {
                      frontend: deployResult.github?.frontend,
                      backend: deployResult.github?.backend,
                      admin: deployResult.github?.admin
                    },
                    railwayProjectId: deployResult.railwayProjectId,
                    railwayProjectUrl: deployResult.railwayUrl,
                    stats: countProjectStats(projectPath)
                  });
                  console.log(`   [${business.id}] Tracked in database (batch: ${demoBatchId})`);
                } catch (dbErr) {
                  console.warn(`   [${business.id}] DB tracking failed: ${dbErr.message}`);
                }
              }
            } else {
              updateProgress('Generated (deploy failed)', 100, 'completed');
              // Track failed deployment
              if (db && db.trackDemoDeployment) {
                try {
                  await db.trackDemoDeployment({
                    name: business.name,
                    originalName: business.originalName || business.name,
                    industry: business.industry,
                    tagline: business.tagline,
                    location: business.location,
                    demoBatchId: demoBatchId,
                    status: 'failed',
                    domain: `${sanitizedName.toLowerCase()}.be1st.io`,
                    stats: countProjectStats(projectPath)
                  });
                  console.log(`   [${business.id}] Tracked failed deployment (batch: ${demoBatchId})`);
                } catch (dbErr) {
                  console.warn(`   [${business.id}] DB tracking failed: ${dbErr.message}`);
                }
              }
            }
          } catch (deployErr) {
            console.log(`   [${business.id}] Deploy error: ${deployErr.message}`);
            updateProgress('Generated (deploy skipped)', 100, 'completed');
            // Track deploy error
            if (db && db.trackDemoDeployment) {
              try {
                await db.trackDemoDeployment({
                  name: business.name,
                  originalName: business.originalName || business.name,
                  industry: business.industry,
                  tagline: business.tagline,
                  location: business.location,
                  demoBatchId: demoBatchId,
                  status: 'failed',
                  domain: `${sanitizedName.toLowerCase()}.be1st.io`,
                  stats: countProjectStats(projectPath)
                });
                console.log(`   [${business.id}] Tracked deploy error (batch: ${demoBatchId})`);
              } catch (dbErr) {
                console.warn(`   [${business.id}] DB tracking failed: ${dbErr.message}`);
              }
            }
          }
        } else {
          updateProgress('Generated!', 100, 'completed');
          // Track generated-only (no deployment)
          if (db && db.trackDemoDeployment) {
            try {
              await db.trackDemoDeployment({
                name: business.name,
                originalName: business.originalName || business.name,
                industry: business.industry,
                tagline: business.tagline,
                location: business.location,
                demoBatchId: demoBatchId,
                status: 'generated',
                domain: `${sanitizedName.toLowerCase()}.be1st.io`,
                stats: countProjectStats(projectPath)
              });
              console.log(`   [${business.id}] Tracked generated project (batch: ${demoBatchId})`);
            } catch (dbErr) {
              console.warn(`   [${business.id}] DB tracking failed: ${dbErr.message}`);
            }
          }
        }

        const duration = Date.now() - businessStartTime;
        console.log(`✅ [${business.id}] Complete in ${(duration / 1000).toFixed(1)}s`);

        // Count project stats for display
        const projectStats = countProjectStats(projectPath);
        console.log(`   📊 Stats: ${projectStats.files} files, ~${projectStats.linesOfCode} lines, ${projectStats.reactComponents} components`);

        return {
          success: true,
          business: business.id,
          name: business.name,
          projectPath,
          duration,
          urls: progress[business.id].urls,
          stats: projectStats
        };

      } catch (error) {
        console.error(`❌ [${business.id}] Failed:`, error.message);
        updateProgress(`Error: ${error.message}`, progress[business.id].progress, 'error');
        return {
          success: false,
          business: business.id,
          name: business.name,
          error: error.message
        };
      }
    }

    // =============================================================
    // TWO-PHASE DEPLOYMENT to avoid Railway rate limiting
    // Phase 1: Generate all code + deploy main sites (parallel OK)
    // Phase 2: Deploy companion apps SEQUENTIALLY with delays
    // =============================================================

    try {
      // PHASE 1: Generate code and deploy main sites in parallel
      console.log('\n📦 PHASE 1: Generating code and deploying main sites...');
      const mainSiteResults = await Promise.all(
        businessesToGenerate.map((b, idx) => generateBusiness(b, idx))
      );

      const successfulMainSites = mainSiteResults.filter(r => r.success);
      console.log(`\n✅ Phase 1 complete: ${successfulMainSites.length}/${businessesToGenerate.length} main sites deployed`);

      // PHASE 2: Deploy companion apps SEQUENTIALLY
      // Only if deploy is enabled and there are successful main sites
      if (deploy && deployCompanionApp && successfulMainSites.length > 0) {
        console.log('\n📱 PHASE 2: Deploying companion apps SEQUENTIALLY...');

        // Initial delay to ensure all main site Railway projects are settled
        const initialDelay = 45000; // 45 seconds after last main site deployment
        console.log(`   ⏳ Waiting ${initialDelay / 1000}s for Railway rate limit to reset...`);
        sendEvent('phase', { phase: 'companion', message: 'Waiting for Railway rate limit...' });
        await new Promise(resolve => setTimeout(resolve, initialDelay));

        for (let i = 0; i < successfulMainSites.length; i++) {
          const result = mainSiteResults.find(r => r.success && r.business === successfulMainSites[i].business);
          if (!result) continue;

          const business = businessesToGenerate.find(b => b.id === result.business);
          if (!business) continue;

          const sanitizedName = result.name
            .replace(/&/g, ' and ')
            .replace(/[^a-zA-Z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .trim()
            .substring(0, 50);

          const companionAppPath = path.join(result.projectPath, 'companion-app');

          if (!fs.existsSync(companionAppPath)) {
            console.log(`   [${business.id}] No companion app found, skipping`);
            continue;
          }

          // Add delay between companion apps (except for the first one)
          if (i > 0) {
            const betweenDelay = 40000; // 40 seconds between each companion app
            console.log(`   [${business.id}] Waiting ${betweenDelay / 1000}s before next companion deploy...`);
            progress[business.id].step = `Waiting ${betweenDelay / 1000}s (Railway rate limit)...`;
            sendEvent('progress', progress[business.id]);
            await new Promise(resolve => setTimeout(resolve, betweenDelay));
          }

          // Update progress
          progress[business.id].step = 'Deploying companion app...';
          progress[business.id].progress = 95;
          sendEvent('progress', progress[business.id]);
          console.log(`   [${business.id}] Deploying companion app (${i + 1}/${successfulMainSites.length})...`);

          try {
            const companionResult = await deployCompanionApp(companionAppPath, `${sanitizedName.toLowerCase()}-app`, {
              parentSiteSubdomain: sanitizedName.toLowerCase(),
              adminEmail: 'demo@be1st.io'
            });

            if (companionResult.success) {
              progress[business.id].urls.companion = companionResult.urls?.companion || companionResult.urls?.frontend;
              console.log(`   ✅ [${business.id}] Companion app deployed: ${progress[business.id].urls.companion}`);

              // Update the result object
              result.urls.companion = progress[business.id].urls.companion;

              // Update database with companion URL
              if (db && db.updateDemoDeployment) {
                try {
                  await db.run(
                    `UPDATE demo_deployments SET urls = json_set(urls, '$.companion', ?) WHERE name = ?`,
                    [progress[business.id].urls.companion, business.name]
                  );
                } catch (dbErr) {
                  console.warn(`   [${business.id}] DB update failed: ${dbErr.message}`);
                }
              }
            } else {
              console.log(`   ❌ [${business.id}] Companion deploy failed: ${companionResult.error || 'Unknown error'}`);
            }
          } catch (companionErr) {
            console.log(`   ❌ [${business.id}] Companion deploy error: ${companionErr.message}`);
          }

          // Update final status
          progress[business.id].step = 'Complete';
          progress[business.id].progress = 100;
          sendEvent('progress', progress[business.id]);
        }

        console.log('\n✅ Phase 2 complete: Companion apps deployed');
      }

      const totalDuration = Date.now() - startTime;
      const successCount = mainSiteResults.filter(r => r.success).length;

      console.log('\n' + '='.repeat(60));
      console.log('🎉 BATCH GENERATION COMPLETE');
      console.log(`   ✅ ${successCount}/${businessesToGenerate.length} successful`);
      console.log(`   ⏱️ Total time: ${(totalDuration / 1000).toFixed(1)}s`);
      console.log('='.repeat(60));

      // Send completion event
      sendEvent('complete', {
        success: true,
        results: mainSiteResults,
        summary: {
          total: businessesToGenerate.length,
          successful: successCount,
          failed: businessesToGenerate.length - successCount,
          totalDurationMs: totalDuration,
          totalDurationSeconds: (totalDuration / 1000).toFixed(1)
        }
      });

      res.end();

    } catch (error) {
      console.error('❌ Batch generation error:', error);
      sendEvent('error', {
        success: false,
        error: error.message
      });
      res.end();
    }
  });

  /**
   * GET /api/demo/status
   * Check if demo generation is available (API keys present, etc.)
   */
  router.get('/status', (req, res) => {
    const hasApiKey = !!(process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY);
    const hasRailwayToken = !!process.env.RAILWAY_TOKEN;
    const hasGitHubToken = !!process.env.GITHUB_TOKEN;
    const hasCloudflareToken = !!process.env.CLOUDFLARE_TOKEN;

    res.json({
      success: true,
      ready: hasApiKey,
      capabilities: {
        aiGeneration: hasApiKey,
        deployment: hasRailwayToken && hasGitHubToken,
        customDomains: hasCloudflareToken
      },
      presetCount: DEMO_BUSINESSES.length
    });
  });

  return router;
}

module.exports = { createDemoRoutes, DEMO_BUSINESSES };
