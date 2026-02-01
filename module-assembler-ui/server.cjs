/**
 * Module Assembler Backend Server
 *
 * Express server that provides API endpoints for the assembler UI
 * and executes the actual assembly script.
 *
 * Save to: C:\Users\huddl\OneDrive\Desktop\module-library\module-assembler-ui\server.cjs
 */

require('dotenv').config();

// Initialize Sentry FIRST - before any other code
const {
  initSentry,
  sentryRequestHandler,
  sentryErrorHandler,
  captureException,
  addBreadcrumb
} = require('./lib/sentry.cjs');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ===========================================
// EXTRACTED UTILITIES
// ===========================================
const {
  PASSWORD_MIN_LENGTH,
  PASSWORD_REQUIREMENTS,
  validatePasswordStrength,
  toComponentName,
  toPageFileName,
  toRoutePath,
  toNavLabel,
  copyDirectorySync
} = require('./lib/utils/index.cjs');

// ===========================================
// EXTRACTED CONFIGS
// ===========================================
const {
  BUNDLES,
  INDUSTRY_PRESETS,
  VISUAL_ARCHETYPES,
  VALID_LUCIDE_ICONS,
  ICON_REPLACEMENTS
} = require('./lib/configs/index.cjs');

// ===========================================
// TIER SELECTION (L1-L4 recommendations)
// ===========================================
const { selectTier } = require('./lib/orchestrators/index.cjs');

// ===========================================
// EXTRACTED ROUTES
// ===========================================
const {
  createAuthRoutes,
  createConfigRoutes,
  createUtilityRoutes,
  createDeployRoutes,
  createOrchestratorRoutes,
  createStudioRoutes
} = require('./lib/routes/index.cjs');


// ===========================================
// EXTRACTED SERVICES
// ===========================================
const {
  extractPdfText,
  fetchPexelsVideo,
  getIndustryVideo
} = require('./lib/services/index.cjs');

// ===========================================
// PLATFORM LEARNING SERVICE
// ===========================================
const learningService = require('./lib/services/learning-service.cjs');

// ===========================================
// EXTRACTED PROMPT BUILDERS
// ===========================================
const {
  initPromptBuilders,
  detectIndustryFromDescription,
  buildPrompt,
  buildSmartContextGuide,
  buildLayoutContextFromPreview,
  extractBusinessStats,
  generateDefaultStats,
  getIndustryImageUrls,
  buildRebuildContext,
  buildInspiredContext,
  buildUploadedAssetsContext,
  buildFreshModePrompt,
  getIndustryDesignGuidance,
  getPageRequirements,
  buildEnhanceModePrompt,
  getPageSpecificInstructions,
  getEnhancePageInstructions,
  buildOrchestratorPagePrompt,
  buildFallbackPage,
  getIndustryHeaderConfig,
  buildFallbackThemeCss
} = require('./lib/prompt-builders/index.cjs');

// ===========================================
// EXTRACTED GENERATORS
// ===========================================
const {
  generateBrainJson,
  generateToolHtml,
  generateBrainRoutes,
  generateHealthRoutes,
  buildAppJsx,
  validateGeneratedCode
} = require('./lib/generators/index.cjs');

// ===========================================
// DEPLOY SERVICE (needed early for autoDeploy)
// ===========================================
const deployService = require('./services/deploy-service.cjs');
const deployReady = deployService.checkCredentials();

// ===========================================
// AUDIT SERVICE (pre-deployment validation)
// ===========================================
const auditService = require('./lib/services/audit-service.cjs');
const ENABLE_PRE_DEPLOY_AUDIT = process.env.ENABLE_PRE_DEPLOY_AUDIT !== 'false'; // Default: enabled

// ===========================================
// QUEUE SERVICE (BullMQ for background jobs)
// ===========================================
const queueService = require('./lib/services/queue-service.cjs');
const ENABLE_QUEUE = process.env.ENABLE_QUEUE !== 'false'; // Default: enabled if Redis available

// ===========================================
// MODULE VALIDATOR (icon imports, SQL syntax)
// ===========================================
const { validateProject, validateFrontendPages } = require('./lib/services/module-validator.cjs');

// Validation error handler middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// Industry Layout System
const { INDUSTRY_LAYOUTS, buildLayoutContext, getLayoutConfig, getLayoutConfigFull } = require('./config/industry-layouts.cjs');

// Database and Admin Routes
let db = null;
let adminRoutes = null;

async function initializeServices() {
  try {
    // Only initialize DB if DATABASE_URL is set
    if (process.env.DATABASE_URL) {
      db = require('./database/db.cjs');
      await db.initializeDatabase();
      console.log('   ✅ Database initialized');

      // Use the full blink-admin routes that match the frontend
      adminRoutes = require('../backend/blink-admin/routes/admin');
      console.log('   ✅ Admin routes loaded (blink-admin)');
    } else {
      console.log('   ⚠️ DATABASE_URL not set - admin features disabled');
    }

    // Initialize queue service (BullMQ/Redis)
    if (ENABLE_QUEUE) {
      const queueReady = await queueService.initialize();
      if (queueReady) {
        console.log('   ✅ Queue service initialized (BullMQ/Redis)');
      } else {
        console.log('   ⚠️ Queue service unavailable - using sync assembly fallback');
      }
    } else {
      console.log('   ⚠️ Queue service disabled via ENABLE_QUEUE=false');
    }

    // Initialize learning service (platform improvement tracking)
    const learningReady = await learningService.initialize();
    if (learningReady) {
      console.log('   ✅ Learning service initialized (generation tracking)');
    } else {
      console.log('   ⚠️ Learning service unavailable - generation tracking disabled');
    }
  } catch (err) {
    console.error('   ⚠️ Service init error:', err.message);
  }
}

// Load prompt configs
const PROMPTS_DIR = path.join(__dirname, 'prompts');
const INDUSTRIES = JSON.parse(fs.readFileSync(path.join(PROMPTS_DIR, 'industries.json'), 'utf-8'));
const LAYOUTS = JSON.parse(fs.readFileSync(path.join(PROMPTS_DIR, 'layouts.json'), 'utf-8'));
const EFFECTS = JSON.parse(fs.readFileSync(path.join(PROMPTS_DIR, 'effects.json'), 'utf-8'));
const SECTIONS = JSON.parse(fs.readFileSync(path.join(PROMPTS_DIR, 'sections.json'), 'utf-8'));

// Initialize prompt builders with loaded configs
initPromptBuilders({ INDUSTRIES, LAYOUTS, EFFECTS, SECTIONS });

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Sentry error tracking
initSentry(app);

// Sentry request handler - MUST be first middleware
app.use(sentryRequestHandler());

// Paths - Environment-based with sensible defaults
// MODULE_LIBRARY: parent of module-assembler-ui (this file is in module-assembler-ui/)
// GENERATED_PROJECTS: sibling to module-library
const MODULE_LIBRARY = process.env.MODULE_LIBRARY_PATH || path.resolve(__dirname, '..');
const GENERATED_PROJECTS = process.env.OUTPUT_PATH || path.resolve(__dirname, '..', '..', 'generated-projects');
const ASSEMBLE_SCRIPT = path.join(MODULE_LIBRARY, 'scripts', 'assemble-project.cjs');

// Validate critical paths on startup
if (!fs.existsSync(MODULE_LIBRARY)) {
  console.error(`❌ MODULE_LIBRARY_PATH not found: ${MODULE_LIBRARY}`);
  process.exit(1);
}
if (!fs.existsSync(ASSEMBLE_SCRIPT)) {
  console.error(`❌ Assembler script not found: ${ASSEMBLE_SCRIPT}`);
  process.exit(1);
}
// Create output directory if needed
if (!fs.existsSync(GENERATED_PROJECTS)) {
  fs.mkdirSync(GENERATED_PROJECTS, { recursive: true });
  console.log(`📁 Created output directory: ${GENERATED_PROJECTS}`);
}

// ===========================================
// SECURITY MIDDLEWARE
// ===========================================

// Helmet security headers - MUST be early in middleware chain
app.use(helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // React needs these
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      mediaSrc: ["'self'", "https://player.vimeo.com", "https://*.pexels.com"],
      connectSrc: ["'self'", "https://api.anthropic.com", "https://api.pexels.com", "https://*.sentry.io"],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },
  // Cross-Origin settings
  crossOriginEmbedderPolicy: false, // Needed for external images/videos
  crossOriginResourcePolicy: { policy: "cross-origin" },
  // Strict Transport Security (HSTS)
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  // Prevent clickjacking
  frameguard: { action: 'deny' },
  // Prevent MIME type sniffing
  noSniff: true,
  // XSS protection
  xssFilter: true,
  // Referrer Policy
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  // Don't advertise Express
  hidePoweredBy: true
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL, /\.be1st\.io$/]
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from dist (production build)
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// AI Assist routes (must be before generic admin routes to avoid auth interception)
const aiAssistRouter = require('./lib/routes/ai-assist.cjs');
app.use('/api/admin/ai-assist', aiAssistRouter);

// Retry Build endpoint - re-runs AUDIT 1 without regenerating
app.post('/api/admin/retry-build/:projectId', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);

    // Get project from database
    const result = await db.query('SELECT * FROM generated_projects WHERE id = $1', [projectId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const project = result.rows[0];
    const projectPath = path.join(GENERATED_PROJECTS, project.name);

    // Check if project directory exists
    if (!fs.existsSync(projectPath)) {
      return res.status(404).json({
        success: false,
        error: 'Project directory not found',
        details: `Expected at: ${projectPath}`
      });
    }

    console.log(`\n🔄 Retry build requested for: ${project.name} (ID: ${projectId})`);

    // Run AUDIT 1 again
    const auditResult = await auditService.audit1PostGeneration(projectPath, {
      maxRetries: 2,
      timeout: 120000
    });

    // Track build result in database
    if (db && db.trackBuildResult) {
      await db.trackBuildResult(projectId, auditResult);
    }

    // Return result
    res.json({
      success: true,
      build_passed: auditResult.success,
      audit: {
        success: auditResult.success,
        duration_ms: auditResult.durationMs,
        error_count: auditResult.errors?.length || 0,
        warning_count: auditResult.warnings?.length || 0,
        errors: auditResult.errors || [],
        warnings: auditResult.warnings || [],
        auto_fixes: auditResult.autoFixesApplied || [],
        retry_count: auditResult.retryCount || 0
      }
    });
  } catch (err) {
    console.error('Retry build error:', err);
    res.status(500).json({
      success: false,
      error: 'Retry build failed',
      details: err.message
    });
  }
});

// Admin routes (mounted after initialization)
app.use('/api/admin', (req, res, next) => {
  if (adminRoutes) {
    adminRoutes(req, res, next);
  } else {
    res.status(503).json({ success: false, error: 'Admin features not available - DATABASE_URL not configured' });
  }
});

// Admin page route
app.get('/admin', (req, res) => {
  const adminHtml = path.join(__dirname, 'dist', 'admin.html');
  if (fs.existsSync(adminHtml)) {
    res.sendFile(adminHtml);
  } else {
    // Fallback for development
    res.redirect('http://localhost:5173/admin.html');
  }
});

// ============================================
// MOUNTED ROUTE MODULES
// ============================================

// Utility routes (open-folder, open-vscode, analyze-site, generate-theme, analyze-existing-site)
const utilityRouter = createUtilityRoutes({
  GENERATED_PROJECTS,
  MODULE_LIBRARY,
  db
});
app.use('/api', utilityRouter);

// Auth routes (health, validate, validate-dev, login)
const authRouter = createAuthRoutes({ db });
app.use('/api', authRouter);

// Config routes (bundles, industries, layouts, effects, sections, modules, projects)
const configRouter = createConfigRoutes({
  BUNDLES,
  INDUSTRIES,
  LAYOUTS,
  EFFECTS,
  SECTIONS,
  INDUSTRY_PRESETS,
  buildPrompt,
  GENERATED_PROJECTS
});
app.use('/api', configRouter);

// Deploy routes (deploy, deploy/status, deploy/railway-status)
const deployRouter = createDeployRoutes({
  deployService,
  deployReady,
  db  // Pass db to check build status before allowing deployment
});
app.use('/api', deployRouter);

// Orchestrator routes (orchestrate, orchestrate/detect-intent, etc.)
const orchestratorRouter = createOrchestratorRoutes({
  INDUSTRIES,
  LAYOUTS,
  EFFECTS,
  SECTIONS,
  buildPrompt,
  buildOrchestratorPagePrompt,
  getIndustryImageUrls,
  getIndustryDesignGuidance,
  buildFallbackPage,
  buildFallbackThemeCss,
  generateBrainJson,
  generateToolHtml,
  generateBrainRoutes,
  generateHealthRoutes,
  buildAppJsx,
  validateGeneratedCode,
  toComponentName,
  toPageFileName,
  toRoutePath,
  toNavLabel,
  copyDirectorySync,
  GENERATED_PROJECTS,
  MODULE_LIBRARY,
  ASSEMBLE_SCRIPT,
  autoDeployProject,
  db,
  INDUSTRY_LAYOUTS,
  buildLayoutContext,
  getLayoutConfig,
  getLayoutConfigFull
});
app.use('/api', orchestratorRouter);

// Admin tiers routes (admin tier selection and suggestions)
const adminTiersRouter = require('./lib/routes/admin-tiers.cjs');
app.use('/api/admin/tiers', adminTiersRouter);

// Simple health endpoint for Railway/deployment health checks
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Health check routes (platform-wide health monitoring)
const healthCheckRouter = require('./lib/routes/health-check.cjs');
app.use('/api/health-check', healthCheckRouter);

// Preview routes (site preview before deploy)
const { createPreviewRoutes } = require('./lib/routes/preview.cjs');
app.use('/api/preview', createPreviewRoutes());

// Apps routes (focused applications like Expense Tracker, Habit Tracker)
const appsRouter = require('./lib/routes/apps.cjs');
app.use('/api/apps', appsRouter);

// Companion App routes (mobile PWA that connects to existing website)
const companionRouter = require('./lib/routes/companion.cjs');
app.use('/api/companion', companionRouter);

// Demo Batch Generation routes (investor demos)
const { createDemoRoutes } = require('./lib/routes/demo.cjs');
const demoRouter = createDemoRoutes({
  INDUSTRIES,
  generateBrainJson,
  copyDirectorySync,
  GENERATED_PROJECTS,
  MODULE_LIBRARY,
  ASSEMBLE_SCRIPT,
  autoDeployProject,
  deployCompanionApp: deployService.deployCompanionApp,
  db,
  buildOrchestratorPagePrompt,
  buildAppJsx,
  buildFallbackPage,
  buildFallbackThemeCss,
  validateGeneratedCode,
  toComponentName,
  getLayoutConfigFull
});
app.use('/api/demo', demoRouter);

// Railway Status routes (live deployment status)
const railwayStatusRouter = require('./lib/routes/railway-status.cjs');
app.use('/api/railway', railwayStatusRouter);

// Deployments routes (user-facing deployment management)
const deploymentsRouter = require('./lib/routes/deployments.cjs');
app.use('/api/deployments', deploymentsRouter);

// Studio routes (unified generation interface)
const studioRouter = createStudioRoutes({
  GENERATED_PROJECTS,
  STUDIO_SITES: path.join(__dirname, 'output/sites'),
  MODULE_LIBRARY,
  autoDeployProject,
  db
});
app.use('/api/studio', studioRouter);

// Backup/Rollback routes
const backupRouter = require('./lib/routes/backup.cjs');
app.use('/api/backups', backupRouter);

// Queue routes (job status, SSE streaming)
const { createQueueRoutes } = require('./lib/routes/queue.cjs');
app.use('/api/queue', createQueueRoutes());

// Test Mode routes (for testing pipeline without AI costs)
const { createTestModeRoutes } = require('./lib/routes/test-mode.cjs');
const testModeRouter = createTestModeRoutes({
  GENERATED_PROJECTS,
  MODULE_LIBRARY,
  ASSEMBLE_SCRIPT,
  db
});
app.use('/api/test-mode', testModeRouter);

// Style Preview routes (generate/compare/deploy multiple archetypes)
const stylePreviewRouter = require('./lib/routes/style-preview.cjs');
app.use('/api/style-preview', stylePreviewRouter);

// Smart Template routes (hybrid: template structure + AI content)
const { createSmartTemplateRouter } = require('./lib/routes/smart-template.cjs');
app.use('/api/smart-template', createSmartTemplateRouter());

// Business Generator routes (unified business generation - simplified approach)
const businessGeneratorRouter = require('./lib/routes/business-generator.cjs');
app.use('/api/business', businessGeneratorRouter);

// Scout routes (find businesses without websites)
const scoutRouter = require('./lib/routes/scout.cjs');
app.use('/api/scout', scoutRouter);

// Browser test routes (ClawdBot / Claude --chrome integration)
const browserTestRouter = require('./lib/routes/browser-test.cjs');
app.use('/api/browser-test', browserTestRouter);

// Screenshot gallery routes (automated preview captures)
const screenshotRouter = require('./lib/routes/screenshots.cjs');
app.use('/api/screenshots', screenshotRouter);

// Static file handler for prospect preview assets
// Serves the generated site's dist folder directly
const SCOUT_PROSPECTS_DIR = path.join(__dirname, 'output', 'prospects');

// Track the current preview folder for asset serving
let currentPreviewFolder = null;

// Helper: Find the dist directory (check full-test first, then test)
function findDistDir(folder, variantDir = null) {
  // Support variant directories (e.g., full-test-luxury, full-test-local)
  if (variantDir) {
    const variantDistDir = path.join(SCOUT_PROSPECTS_DIR, folder, variantDir, 'frontend', 'dist');
    if (fs.existsSync(path.join(variantDistDir, 'index.html'))) {
      return variantDistDir;
    }
    // Fallback - maybe it's directly in variantDir without dist
    const variantFrontendDir = path.join(SCOUT_PROSPECTS_DIR, folder, variantDir, 'frontend');
    if (fs.existsSync(path.join(variantFrontendDir, 'index.html'))) {
      return variantFrontendDir;
    }
    return null;
  }

  const fullTestDir = path.join(SCOUT_PROSPECTS_DIR, folder, 'full-test', 'frontend', 'dist');
  const testDir = path.join(SCOUT_PROSPECTS_DIR, folder, 'test', 'frontend', 'dist');

  if (fs.existsSync(path.join(fullTestDir, 'index.html'))) {
    return fullTestDir;
  }
  if (fs.existsSync(path.join(testDir, 'index.html'))) {
    return testDir;
  }
  return null;
}

// Serve prospect preview - sets the folder context and serves index.html
app.get('/prospect-preview/:folder', (req, res) => {
  const folder = req.params.folder;
  const distDir = findDistDir(folder);

  if (!distDir) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html>
      <head><title>Preview Not Found</title>
      <style>
        body { display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #1a1a2e; color: #fff; font-family: system-ui, sans-serif; text-align: center; }
        h1 { font-size: 36px; margin: 0 0 16px; }
        p { color: #888; }
      </style>
      </head>
      <body>
        <div>
          <h1>Preview Not Ready</h1>
          <p>Test site for "${folder}" hasn't been generated yet.</p>
          <p>Click "Test" or "Full Stack" button to generate first.</p>
        </div>
      </body>
      </html>
    `);
  }

  const indexPath = path.join(distDir, 'index.html');

  // Read and modify the HTML to use correct asset paths
  let html = fs.readFileSync(indexPath, 'utf-8');
  // Rewrite absolute asset paths to include the preview folder prefix
  html = html.replace(/src="\/assets\//g, `src="/prospect-preview/${folder}/assets/`);
  html = html.replace(/href="\/assets\//g, `href="/prospect-preview/${folder}/assets/`);

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// Serve assets for prospect preview
app.get('/prospect-preview/:folder/assets/:filename', (req, res) => {
  const { folder, filename } = req.params;
  const distDir = findDistDir(folder);

  if (!distDir) {
    return res.status(404).send('Preview not found');
  }

  const assetPath = path.join(distDir, 'assets', filename);

  if (fs.existsSync(assetPath)) {
    res.sendFile(assetPath);
  } else {
    res.status(404).send('Asset not found');
  }
});

// Serve variant preview - for archetype comparison (e.g., full-test-luxury, full-test-local)
app.get('/prospect-preview/:folder/:variantDir/frontend/', (req, res) => {
  const { folder, variantDir } = req.params;
  const distDir = findDistDir(folder, variantDir);

  if (!distDir) {
    // Check if source files exist (skipBuild was used)
    const srcDir = path.join(SCOUT_PROSPECTS_DIR, folder, variantDir, 'frontend', 'src');
    const hasSrc = fs.existsSync(srcDir);

    // Load variant metrics if available
    let variantInfo = { preset: variantDir, layout: '' };
    try {
      const metricsFile = path.join(SCOUT_PROSPECTS_DIR, folder, variantDir, 'variant-metrics.json');
      if (fs.existsSync(metricsFile)) {
        variantInfo = JSON.parse(fs.readFileSync(metricsFile, 'utf-8'));
      }
    } catch (e) {}

    return res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>Build Required - ${variantInfo.presetName || variantDir}</title>
      <style>
        body { display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #fff; font-family: system-ui, sans-serif; text-align: center; }
        .card { background: rgba(255,255,255,0.1); padding: 40px; border-radius: 16px; max-width: 500px; }
        h1 { font-size: 28px; margin: 0 0 8px; }
        .subtitle { color: #94a3b8; margin-bottom: 24px; }
        .info { background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px; margin-bottom: 24px; text-align: left; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .info-row:last-child { border-bottom: none; }
        .label { color: #94a3b8; }
        .btn { display: inline-block; padding: 12px 24px; background: #3b82f6; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none; margin: 8px; }
        .btn:hover { background: #2563eb; }
        .btn-secondary { background: #475569; }
        .btn-secondary:hover { background: #64748b; }
        code { background: #0f172a; padding: 12px 16px; border-radius: 6px; display: block; margin: 16px 0; font-size: 12px; text-align: left; overflow-x: auto; }
        .status { display: inline-block; padding: 4px 12px; background: ${hasSrc ? '#22c55e' : '#ef4444'}; border-radius: 20px; font-size: 12px; margin-bottom: 16px; }
      </style>
      </head>
      <body>
        <div class="card">
          <div class="status">${hasSrc ? '✅ Source Ready' : '❌ No Source'}</div>
          <h1>${variantInfo.presetName || 'Variant'} - ${variantInfo.layoutName || variantInfo.layout || ''}</h1>
          <p class="subtitle">${folder} / ${variantDir}</p>

          <div class="info">
            <div class="info-row"><span class="label">Preset</span><span>${variantInfo.presetName || variantInfo.preset || '-'}</span></div>
            <div class="info-row"><span class="label">Layout</span><span>${variantInfo.layoutName || variantInfo.layout || '-'}</span></div>
            <div class="info-row"><span class="label">Pages</span><span>${variantInfo.pages || '-'}</span></div>
            <div class="info-row"><span class="label">Lines of Code</span><span>${(variantInfo.linesOfCode || 0).toLocaleString()}</span></div>
          </div>

          ${hasSrc ? `
            <p style="color: #94a3b8; font-size: 13px;">This variant was generated with <strong>Skip Build</strong>. To preview it, run:</p>
            <code>cd "${path.join(SCOUT_PROSPECTS_DIR, folder, variantDir, 'frontend').replace(/\\/g, '/')}"<br>npm install && npm run dev</code>
            <p style="color: #94a3b8; font-size: 13px; margin-top: 16px;">Or build it for static preview:</p>
            <code>npm install && npm run build</code>
          ` : `
            <p style="color: #ef4444;">Source files not found. Regenerate this variant.</p>
          `}

          <div style="margin-top: 24px;">
            <a href="/prospect-compare/${folder}" class="btn btn-secondary">← Back to Compare</a>
          </div>
        </div>
      </body>
      </html>
    `);
  }

  const indexPath = path.join(distDir, 'index.html');

  // Read and modify the HTML to use correct asset paths
  let html = fs.readFileSync(indexPath, 'utf-8');
  // Rewrite absolute asset paths to include the full preview path
  html = html.replace(/src="\/assets\//g, `src="/prospect-preview/${folder}/${variantDir}/frontend/assets/`);
  html = html.replace(/href="\/assets\//g, `href="/prospect-preview/${folder}/${variantDir}/frontend/assets/`);

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// Serve assets for variant preview
app.get('/prospect-preview/:folder/:variantDir/frontend/assets/:filename', (req, res) => {
  const { folder, variantDir, filename } = req.params;
  const distDir = findDistDir(folder, variantDir);

  if (!distDir) {
    return res.status(404).send('Variant preview not found');
  }

  const assetPath = path.join(distDir, 'assets', filename);

  if (fs.existsSync(assetPath)) {
    res.sendFile(assetPath);
  } else {
    res.status(404).send('Asset not found');
  }
});

// SPA fallback for variant preview - serves index.html for any route (React Router support)
app.get(/^\/prospect-preview\/([^\/]+)\/([^\/]+)\/frontend\/(.+)$/, (req, res) => {
  const folder = req.params[0];
  const variantDir = req.params[1];
  const distDir = findDistDir(folder, variantDir);

  if (!distDir) {
    return res.status(404).send('Variant preview not found');
  }

  const indexPath = path.join(distDir, 'index.html');

  if (!fs.existsSync(indexPath)) {
    return res.status(404).send('Index not found');
  }

  // Read and modify the HTML to use correct asset paths
  let html = fs.readFileSync(indexPath, 'utf-8');
  html = html.replace(/src="\/assets\//g, `src="/prospect-preview/${folder}/${variantDir}/frontend/assets/`);
  html = html.replace(/href="\/assets\//g, `href="/prospect-preview/${folder}/${variantDir}/frontend/assets/`);

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// Comparison page - shows all variants side-by-side for easy switching
app.get('/prospect-compare/:folder', (req, res) => {
  const { folder } = req.params;
  const prospectDir = path.join(SCOUT_PROSPECTS_DIR, folder);

  if (!fs.existsSync(prospectDir)) {
    return res.status(404).send('Prospect not found');
  }

  // Get optional variants filter from query
  const variantsFilter = req.query.variants ? req.query.variants.split(',') : null;

  // Find all variant directories
  const dirs = fs.readdirSync(prospectDir);
  const variants = [];

  // Preset colors for new format variants
  const presetColors = {
    'luxury': '#8B5CF6',
    'friendly': '#22C55E',
    'modern-minimal': '#64748B',
    'sharp-corporate': '#3B82F6',
    'bold-energetic': '#F59E0B',
    'classic-elegant': '#78350F'
  };

  // Check for standard full-test first
  if (dirs.includes('full-test') && (!variantsFilter || variantsFilter.includes('default'))) {
    const distDir = findDistDir(folder);
    if (distDir) {
      variants.push({
        id: 'default',
        name: 'Default',
        color: '#6B7280',
        previewUrl: `/prospect-preview/${folder}`
      });
    }
  }

  // Check for archetype variants (old format)
  const archetypeConfig = {
    'full-test-local': { id: 'local', name: 'Local / Community', color: '#22c55e', icon: '🏘️' },
    'full-test-luxury': { id: 'luxury', name: 'Brand Story / Luxury', color: '#8b5cf6', icon: '✨' },
    'full-test-ecommerce': { id: 'ecommerce', name: 'E-Commerce Focus', color: '#3b82f6', icon: '🛒' }
  };

  // Check for new preset-layout variants (format: full-test-{preset}-{layout})
  for (const dir of dirs) {
    if (dir.startsWith('full-test-') && dir !== 'full-test') {
      // Check if this is an old archetype format
      if (archetypeConfig[dir]) {
        if (!variantsFilter || variantsFilter.includes(archetypeConfig[dir].id)) {
          const hasFrontend = fs.existsSync(path.join(prospectDir, dir, 'frontend'));
          if (hasFrontend) {
            variants.push({
              ...archetypeConfig[dir],
              dir: dir,
              previewUrl: `/prospect-preview/${folder}/${dir}/frontend/`
            });
          }
        }
      } else {
        // New preset-layout format
        const variantKey = dir.replace('full-test-', '');

        // Filter if variantsFilter is provided
        if (variantsFilter && !variantsFilter.includes(variantKey)) continue;

        // Parse preset from variant key (e.g., "luxury-appetizing-visual" -> "luxury")
        let presetId = null;
        for (const preset of Object.keys(presetColors)) {
          if (variantKey.startsWith(preset + '-') || variantKey === preset) {
            presetId = preset;
            break;
          }
        }

        const hasFrontend = fs.existsSync(path.join(prospectDir, dir, 'frontend'));
        if (hasFrontend) {
          // Try to load variant metrics for name
          let variantName = variantKey;
          let layoutName = '';
          try {
            const metricsFile = path.join(prospectDir, dir, 'variant-metrics.json');
            if (fs.existsSync(metricsFile)) {
              const metrics = JSON.parse(fs.readFileSync(metricsFile, 'utf-8'));
              variantName = `${metrics.presetName || presetId} - ${metrics.layoutName || metrics.layout || ''}`;
              layoutName = metrics.layoutName || metrics.layout || '';
            }
          } catch (e) {}

          variants.push({
            id: variantKey,
            name: variantName,
            layout: layoutName,
            color: presetColors[presetId] || '#6B7280',
            icon: presetId === 'luxury' ? '💎' : presetId === 'friendly' ? '🏠' : presetId === 'modern-minimal' ? '◼️' : presetId === 'sharp-corporate' ? '📐' : presetId === 'bold-energetic' ? '🎉' : '🏛️',
            dir: dir,
            previewUrl: `/prospect-preview/${folder}/${dir}/frontend/`
          });
        }
      }
    }
  }

  if (variants.length === 0) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html><head><title>No Variants Found</title>
      <style>body{display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#1a1a2e;color:#fff;font-family:system-ui;text-align:center}</style>
      </head><body><div><h1>No Variants Found</h1><p>Generate test variants first using the Scout pipeline.</p></div></body></html>
    `);
  }

  // Load prospect info for display
  let prospectName = folder;
  try {
    const prospectFile = path.join(prospectDir, 'prospect.json');
    if (fs.existsSync(prospectFile)) {
      const prospect = JSON.parse(fs.readFileSync(prospectFile, 'utf-8'));
      prospectName = prospect.name || folder;
    }
  } catch (e) {}

  // Standard pages for bakery/food industry
  const standardPages = [
    { name: 'Home', path: '/', icon: '🏠' },
    { name: 'Menu', path: '/menu', icon: '📋' },
    { name: 'About', path: '/about', icon: 'ℹ️' },
    { name: 'Gallery', path: '/gallery', icon: '🖼️' },
    { name: 'Contact', path: '/contact', icon: '📞' },
    { name: 'Order Online', path: '/order-online', icon: '🛒' },
    { name: 'Catering', path: '/catering', icon: '🍽️' },
    { name: 'Dashboard', path: '/dashboard', icon: '📊' }
  ];

  // Generate comparison HTML
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Compare Variants - ${prospectName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #fff; min-height: 100vh; }
    .header { background: #1e293b; padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #334155; }
    .header h1 { font-size: 20px; font-weight: 600; }
    .header .business-name { color: #94a3b8; font-size: 14px; margin-top: 4px; }
    .view-tabs { display: flex; gap: 4px; background: #0f172a; padding: 12px 24px; border-bottom: 1px solid #334155; }
    .view-tab { padding: 8px 16px; border-radius: 6px; background: transparent; color: #94a3b8; cursor: pointer; font-size: 13px; font-weight: 500; border: 1px solid transparent; transition: all 0.2s; }
    .view-tab:hover { color: #fff; background: #1e293b; }
    .view-tab.active { background: #3b82f6; color: #fff; border-color: #3b82f6; }
    .tabs { display: flex; gap: 8px; background: #1e293b; padding: 12px 24px; border-bottom: 1px solid #334155; overflow-x: auto; }
    .tab { padding: 10px 20px; border-radius: 8px; border: 2px solid transparent; background: #334155; color: #fff; cursor: pointer; font-size: 14px; font-weight: 500; display: flex; align-items: center; gap: 8px; transition: all 0.2s; white-space: nowrap; }
    .tab:hover { background: #475569; }
    .tab.active { border-color: var(--color); background: color-mix(in srgb, var(--color) 20%, #1e293b); }
    .tab .icon { font-size: 18px; }
    .preview-container { height: calc(100vh - 190px); position: relative; }
    .preview-frame { width: 100%; height: 100%; border: none; display: none; }
    .preview-frame.active { display: block; }
    .actions { display: flex; gap: 12px; }
    .btn { padding: 8px 16px; border-radius: 6px; border: none; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
    .btn-deploy { background: #10b981; color: #fff; }
    .btn-deploy:hover { background: #059669; }
    .btn-deploy:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-open { background: #3b82f6; color: #fff; }
    .btn-open:hover { background: #2563eb; }
    .btn-back { background: #475569; color: #fff; }
    .btn-back:hover { background: #64748b; }
    .status { padding: 4px 12px; background: #334155; border-radius: 20px; font-size: 12px; color: #94a3b8; }
    .deploy-status { position: fixed; bottom: 24px; right: 24px; background: #1e293b; border: 1px solid #334155; padding: 16px 24px; border-radius: 12px; display: none; }
    .deploy-status.show { display: block; }
    .deploy-status.success { border-color: #10b981; }
    .deploy-status.error { border-color: #ef4444; }
    .view-content { display: none; }
    .view-content.active { display: block; }
    .pages-grid { display: grid; grid-template-columns: repeat(${variants.length}, 1fr); gap: 16px; padding: 24px; }
    .variant-column { background: #1e293b; border-radius: 12px; overflow: hidden; }
    .variant-header { padding: 16px; color: #fff; font-weight: 600; display: flex; align-items: center; gap: 10px; }
    .page-list { padding: 8px; }
    .page-link { display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: #0f172a; border-radius: 6px; margin-bottom: 6px; color: #e2e8f0; text-decoration: none; transition: all 0.15s; font-size: 13px; }
    .page-link:hover { background: #334155; }
    .page-link .arrow { opacity: 0.5; margin-left: auto; }
    .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; padding: 24px; }
    .metric-card { background: #1e293b; border-radius: 12px; padding: 20px; text-align: center; }
    .metric-value { font-size: 32px; font-weight: 700; margin-bottom: 4px; }
    .metric-label { font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
    .variants-table { width: 100%; margin: 24px; max-width: calc(100% - 48px); background: #1e293b; border-radius: 12px; overflow: hidden; }
    .variants-table th { text-align: left; padding: 12px 16px; background: #0f172a; color: #94a3b8; font-size: 12px; text-transform: uppercase; }
    .variants-table td { padding: 12px 16px; border-bottom: 1px solid #334155; }
    .variants-table tr:last-child td { border-bottom: none; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>🎨 Style Comparison</h1>
      <div class="business-name">${prospectName}</div>
    </div>
    <div class="actions">
      <button class="btn btn-back" onclick="window.location.href='/admin#/scout'">← Back to Scout</button>
      <button class="btn btn-open" id="openNewTab">Open in New Tab</button>
      <button class="btn btn-deploy" id="deployBtn">🚀 Deploy Selected</button>
    </div>
  </div>

  <div class="view-tabs">
    <button class="view-tab active" data-view="preview">🖥️ Live Preview</button>
    <button class="view-tab" data-view="pages">📑 All Pages Index</button>
    <button class="view-tab" data-view="metrics">📊 Metrics</button>
  </div>

  <!-- Preview View -->
  <div class="view-content active" id="preview-view">
    <div class="tabs">
    ${variants.map((v, i) => `
      <button class="tab ${i === 0 ? 'active' : ''}" data-variant="${v.id}" data-url="${v.previewUrl}" data-dir="${v.dir || ''}" style="--color: ${v.color}">
        <span class="icon">${v.icon || '📄'}</span>
        ${v.name}
      </button>
    `).join('')}
    <span class="status">${variants.length} variant${variants.length > 1 ? 's' : ''} available</span>
  </div>

  <div class="preview-container">
    ${variants.map((v, i) => `
      <iframe class="preview-frame ${i === 0 ? 'active' : ''}" data-variant="${v.id}" src="${v.previewUrl}"></iframe>
    `).join('')}
  </div>

  <div class="deploy-status" id="deployStatus"></div>
  </div>

  <!-- Pages Index View -->
  <div class="view-content" id="pages-view">
    <div class="pages-grid">
      ${variants.map(v => `
        <div class="variant-column">
          <div class="variant-header" style="background: ${v.color}">
            <span style="font-size: 24px">${v.icon || '📄'}</span>
            ${v.name}
          </div>
          <div class="page-list">
            ${standardPages.map(page => `
              <a href="${v.previewUrl}#${page.path}" target="_blank" class="page-link">
                <span>${page.icon}</span>
                ${page.name}
                <span class="arrow">→</span>
              </a>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  </div>

  <!-- Metrics View -->
  <div class="view-content" id="metrics-view">
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-value" style="color: #3b82f6">${variants.length}</div>
        <div class="metric-label">Variants Generated</div>
      </div>
      <div class="metric-card">
        <div class="metric-value" style="color: #22c55e">${variants.length * standardPages.length}</div>
        <div class="metric-label">Total Pages</div>
      </div>
      <div class="metric-card">
        <div class="metric-value" style="color: #f59e0b">1</div>
        <div class="metric-label">Video Generated</div>
      </div>
      <div class="metric-card">
        <div class="metric-value" style="color: #ec4899">7</div>
        <div class="metric-label">Logo Variants</div>
      </div>
    </div>

    <table class="variants-table">
      <thead>
        <tr>
          <th>Variant</th>
          <th>Style</th>
          <th>Pages</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${variants.map(v => `
          <tr>
            <td>
              <span style="display: flex; align-items: center; gap: 8px">
                <span style="font-size: 20px">${v.icon || '📄'}</span>
                <strong>${v.name}</strong>
              </span>
            </td>
            <td>
              <span class="badge" style="background: ${v.color}; color: #fff">${v.id}</span>
            </td>
            <td>${standardPages.length}</td>
            <td><span style="color: #22c55e">✓ Ready</span></td>
            <td>
              <a href="${v.previewUrl}" target="_blank" class="btn btn-open" style="margin-right: 8px; text-decoration: none; display: inline-block">Preview</a>
              <a href="${v.previewUrl}_index" target="_blank" class="btn btn-back" style="text-decoration: none; display: inline-block">Stats</a>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <script>
    // View tab switching
    const viewTabs = document.querySelectorAll('.view-tab');
    const viewContents = document.querySelectorAll('.view-content');

    viewTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const viewId = tab.dataset.view + '-view';
        viewTabs.forEach(t => t.classList.remove('active'));
        viewContents.forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(viewId).classList.add('active');
      });
    });

    // Preview variant switching
    const tabs = document.querySelectorAll('.tab');
    const frames = document.querySelectorAll('.preview-frame');
    let activeVariant = '${variants[0]?.id}';
    let activeUrl = '${variants[0]?.previewUrl}';
    let activeDir = '${variants[0]?.dir || ''}';

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const variantId = tab.dataset.variant;
        const url = tab.dataset.url;
        const dir = tab.dataset.dir;

        tabs.forEach(t => t.classList.remove('active'));
        frames.forEach(f => f.classList.remove('active'));

        tab.classList.add('active');
        document.querySelector(\`.preview-frame[data-variant="\${variantId}"]\`).classList.add('active');

        activeVariant = variantId;
        activeUrl = url;
        activeDir = dir;
      });
    });

    document.getElementById('openNewTab').addEventListener('click', () => {
      window.open(activeUrl, '_blank');
    });

    document.getElementById('deployBtn').addEventListener('click', async () => {
      const btn = document.getElementById('deployBtn');
      const status = document.getElementById('deployStatus');

      btn.disabled = true;
      btn.textContent = '⏳ Deploying...';
      status.className = 'deploy-status show';
      status.textContent = 'Deploying ' + activeVariant + ' variant...';

      try {
        const variantSuffix = activeDir ? '-' + activeVariant : '';
        const res = await fetch('/api/scout/prospects/${folder}/deploy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            variantSuffix: variantSuffix,
            projectName: 'test-${folder}' + variantSuffix
          })
        });
        const data = await res.json();

        if (data.success) {
          status.className = 'deploy-status show success';
          status.innerHTML = '✅ Deployed! <a href="' + data.url + '" target="_blank" style="color:#10b981">' + data.url + '</a>';
        } else {
          status.className = 'deploy-status show error';
          status.textContent = '❌ ' + (data.error || 'Deploy failed');
        }
      } catch (err) {
        status.className = 'deploy-status show error';
        status.textContent = '❌ ' + err.message;
      }

      btn.disabled = false;
      btn.textContent = '🚀 Deploy Selected';
    });
  </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// ============================================
// API ENDPOINTS (remaining inline routes)
// ============================================

// ============================================
// ASYNC ASSEMBLY ENDPOINT (Queue-based)
// ============================================

/**
 * POST /api/assemble-async
 *
 * Queue-based project assembly that returns immediately with a job ID.
 * Use /api/queue/job/:jobId to check status or /api/queue/job/:jobId/stream for SSE updates.
 *
 * This is the preferred endpoint for production - allows concurrent builds
 * without blocking the API server.
 */
app.post('/api/assemble-async', async (req, res) => {
  // Check if queue is available
  if (!queueService.isAvailable()) {
    return res.status(503).json({
      success: false,
      error: 'Queue service unavailable',
      hint: 'Redis may be down. Use /api/assemble for synchronous fallback.',
      queueError: queueService.getInitError()?.message
    });
  }

  const { name, industry, references, theme, description, autoDeploy, adminTier, adminModules, testMode } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, error: 'Project name required' });
  }

  // Sanitize project name - same logic as sync endpoint
  const sanitizedName = name
    .replace(/&/g, ' and ')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 100);

  if (!sanitizedName || sanitizedName.length < 2) {
    return res.status(400).json({ success: false, error: 'Project name must be at least 2 characters (alphanumeric only)' });
  }

  // Validate required fields
  if (!industry && (!req.body.bundles || req.body.bundles.length === 0) && (!req.body.modules || req.body.modules.length === 0)) {
    return res.status(400).json({ success: false, error: 'Must provide industry, bundles, or modules' });
  }

  // Track generation start in database
  let generationId = null;
  if (db && db.trackGenerationStart) {
    try {
      generationId = await db.trackGenerationStart({
        siteName: sanitizedName,
        industry: industry,
        templateUsed: 'blink-assembler',
        modulesSelected: req.body.modules || [],
        pagesGenerated: description?.pages?.length || 0
      });
      console.log(`   📊 Generation tracked: ID ${generationId}`);
    } catch (trackErr) {
      console.warn('   ⚠️ Generation tracking failed:', trackErr.message);
    }
  }

  try {
    // Add job to queue
    const jobId = await queueService.addAssemblyJob({
      name: sanitizedName,
      industry,
      references,
      theme,
      description,
      autoDeploy,
      adminTier,
      adminModules,
      testMode,
      generationId,
      bundles: req.body.bundles,
      modules: req.body.modules
    });

    console.log(`\n🚀 Project queued: ${sanitizedName} (Job: ${jobId})`);

    // Return immediately with job info
    res.json({
      success: true,
      message: 'Project queued for assembly',
      queued: true,
      jobId,
      generationId,
      statusUrl: `/api/queue/job/${jobId}`,
      streamUrl: `/api/queue/job/${jobId}/stream`,
      project: {
        name: sanitizedName,
        industry
      }
    });

  } catch (queueErr) {
    console.error('Queue error:', queueErr.message);

    // Update generation status to failed
    if (generationId && db && db.trackGenerationFailed) {
      await db.trackGenerationFailed(generationId, { message: `Queue error: ${queueErr.message}` });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to queue project',
      details: queueErr.message
    });
  }
});

// ============================================
// ASSEMBLY ENDPOINT (Synchronous fallback)
// ============================================

app.post('/api/assemble', async (req, res) => {
  const { name, industry, references, theme, description, autoDeploy, adminTier, adminModules, testMode } = req.body;

  // TEST MODE: When testMode is true, skip AI API calls and use deterministic fallback pages
  // This allows testing the EXACT same pipeline as production without AI costs
  const skipAI = testMode === true;

  if (!name) {
    return res.status(400).json({ success: false, error: 'Project name required' });
  }

  // Sanitize project name - SECURITY: Remove ALL shell-dangerous characters
  // Only allow alphanumeric, spaces, and dashes
  const sanitizedName = name
    .replace(/&/g, ' and ')           // Convert & to "and"
    .replace(/[^a-zA-Z0-9\s-]/g, '')  // Remove ALL special chars (prevents shell injection)
    .replace(/\s+/g, ' ')             // Collapse multiple spaces
    .trim()
    .substring(0, 100);               // Limit length

  if (!sanitizedName || sanitizedName.length < 2) {
    return res.status(400).json({ success: false, error: 'Project name must be at least 2 characters (alphanumeric only)' });
  }

  // Start learning log (non-blocking) - tracks generation for platform improvement
  const learningLogId = await learningService.startGenerationLog({
    businessName: sanitizedName,
    industryKey: industry,
    descriptionText: description?.text || '',
    moodSliders: description?.moodSliders || null,
    pagesRequested: description?.pages || [],
    adminTier: adminTier || 'standard',
    adminModules: adminModules || [],
    layoutKey: description?.layoutKey || description?.layoutStyleId || null,
    effects: description?.effects || [],
    testMode: skipAI,
    enhanceMode: !!description?.existingSite
  }).catch(() => null); // Don't block on logging errors

  // Build command arguments
  const args = ['--name', sanitizedName];

  // Declare sanitizedIndustry in outer scope so it's accessible throughout
  let sanitizedIndustry = null;

  if (industry) {
    // Sanitize industry key - remove special chars, use lowercase with dashes
    sanitizedIndustry = industry
      .toLowerCase()
      .replace(/[&]/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    // Map unknown industries to closest available match
    const industryFallbacks = {
      // Shooting/Outdoor/Recreation
      'gun-range-and-sporting-grounds': 'fitness',
      'shooting-range-and-firearms-training': 'fitness',
      'shooting-range': 'fitness',
      'firearms': 'fitness',
      'gun-range': 'fitness',
      'gun-range-and-shooting-sports': 'fitness',
      'outdoor-range': 'fitness',
      'tactical-training': 'fitness',
      'sporting-clays': 'fitness',
      'archery': 'fitness',
      'hunting': 'fitness',
      'outdoor-recreation': 'fitness',
      'golf-course': 'fitness',
      'golf': 'fitness',
      'bowling': 'fitness',
      'skating-rink': 'fitness',
      'rock-climbing': 'fitness',
      'trampoline-park': 'fitness',
      'laser-tag': 'fitness',
      'paintball': 'fitness',
      'go-kart': 'fitness',
      'escape-room': 'fitness',
      'axe-throwing': 'fitness',
      
      // Retail/Ecommerce
      'sporting-goods': 'ecommerce',
      'retail-store': 'ecommerce',
      'shop': 'ecommerce',
      'boutique': 'ecommerce',
      'clothing-store': 'ecommerce',
      'jewelry-store': 'ecommerce',
      'gift-shop': 'ecommerce',
      'furniture-store': 'ecommerce',
      'electronics-store': 'ecommerce',
      'hardware-store': 'ecommerce',
      'pet-store': 'ecommerce',
      'bookstore': 'ecommerce',
      'toy-store': 'ecommerce',
      'antique-shop': 'ecommerce',
      'thrift-store': 'ecommerce',
      'dispensary': 'ecommerce',
      'smoke-shop': 'ecommerce',
      'vape-shop': 'ecommerce',
      'liquor-store': 'ecommerce',
      
      // Food & Beverage
      'cafe': 'restaurant',
      'coffee-shop': 'restaurant',
      'bakery': 'restaurant',
      'pizza': 'restaurant',
      'pizzeria': 'restaurant',
      'food-truck': 'restaurant',
      'catering': 'restaurant',
      'bar': 'restaurant',
      'brewery': 'restaurant',
      'winery': 'restaurant',
      'distillery': 'restaurant',
      'ice-cream-shop': 'restaurant',
      'juice-bar': 'restaurant',
      'deli': 'restaurant',
      'fast-food': 'restaurant',
      'fine-dining': 'steakhouse',

      // Steakhouse variations (map to steakhouse)
      'luxury-steakhouse': 'steakhouse',
      'steak-house': 'steakhouse',
      'prime-steakhouse': 'steakhouse',
      'fine-dining-steakhouse': 'steakhouse',
      'upscale-steakhouse': 'steakhouse',
      'grill': 'steakhouse',
      'chophouse': 'steakhouse',
      'beef-restaurant': 'steakhouse',
      
      // Healthcare/Wellness
      'medical-practice': 'healthcare',
      'doctor': 'healthcare',
      'clinic': 'healthcare',
      'urgent-care': 'healthcare',
      'physical-therapy': 'healthcare',
      'chiropractic': 'healthcare',
      'chiropractor': 'healthcare',
      'dentist': 'dental',
      'orthodontist': 'dental',
      'optometrist': 'healthcare',
      'dermatologist': 'healthcare',
      'mental-health': 'healthcare',
      'therapist': 'healthcare',
      'counseling': 'healthcare',
      'acupuncture': 'spa-salon',
      'massage': 'spa-salon',
      'medspa': 'spa-salon',
      'wellness-center': 'spa-salon',
      
      // Fitness/Sports
      'gym': 'fitness',
      'personal-training': 'fitness',
      'crossfit': 'fitness',
      'pilates': 'fitness',
      'yoga-studio': 'fitness',
      'dance-studio': 'fitness',
      'martial-arts': 'fitness',
      'boxing': 'fitness',
      'swimming-pool': 'fitness',
      'tennis-club': 'fitness',
      'sports-league': 'fitness',
      
      // Professional Services
      'service-business': 'consulting',
      'professional-services': 'consulting',
      'marketing': 'agency',
      'advertising': 'agency',
      'pr-firm': 'agency',
      'web-design': 'agency',
      'graphic-design': 'agency',
      'it-services': 'saas',
      'managed-services': 'saas',
      'staffing': 'consulting',
      'recruiting': 'consulting',
      'hr-services': 'consulting',
      
      // Home Services
      'plumbing': 'plumber',
      'electrical': 'electrician',
      'hvac-services': 'plumber',
      'roofing': 'construction',
      'painting': 'construction',
      'flooring': 'construction',
      'remodeling': 'construction',
      'handyman': 'construction',
      'pest-control': 'cleaning',
      'pool-service': 'cleaning',
      'pressure-washing': 'cleaning',
      'window-cleaning': 'cleaning',
      'junk-removal': 'moving',
      'storage': 'moving',
      
      // Automotive
      'car-dealership': 'auto-repair',
      'auto-body': 'auto-repair',
      'tire-shop': 'auto-repair',
      'oil-change': 'auto-repair',
      'car-wash': 'auto-repair',
      'auto-detailing': 'auto-repair',
      'towing': 'auto-repair',
      
      // Real Estate
      'property-management': 'real-estate',
      'apartment-complex': 'real-estate',
      'mortgage': 'real-estate',
      'title-company': 'real-estate',
      'home-inspection': 'real-estate',
      
      // Legal/Financial
      'attorney': 'law-firm',
      'lawyer': 'law-firm',
      'legal-services': 'law-firm',
      'notary': 'law-firm',
      'cpa': 'accounting',
      'bookkeeper': 'accounting',
      'tax-services': 'accounting',
      'financial-planning': 'accounting',
      'wealth-management': 'accounting',
      
      // Education
      'tutoring': 'school',
      'driving-school': 'school',
      'music-lessons': 'school',
      'art-classes': 'school',
      'language-school': 'school',
      'preschool': 'school',
      'daycare': 'school',
      'afterschool': 'school',
      'summer-camp': 'school',
      'coding-bootcamp': 'online-course',
      
      // Events/Entertainment
      'wedding-venue': 'event-venue',
      'party-venue': 'event-venue',
      'conference-center': 'event-venue',
      'dj': 'musician',
      'band': 'musician',
      'photographer': 'photography',
      'videographer': 'photography',
      'photo-booth': 'photography',
      'florist': 'wedding',
      'event-planner': 'wedding',
      'caterer': 'wedding',
      
      // Hospitality
      'motel': 'hotel',
      'bed-and-breakfast': 'hotel',
      'vacation-rental': 'hotel',
      'airbnb': 'hotel',
      'campground': 'hotel',
      'rv-park': 'hotel',
      
      // Animals
      'veterinarian': 'pet-services',
      'vet': 'pet-services',
      'pet-grooming': 'pet-services',
      'dog-training': 'pet-services',
      'boarding': 'pet-services',
      'kennel': 'pet-services',
      'pet-sitting': 'pet-services',
      'dog-walking': 'pet-services',
      
      // Religious/Nonprofit
      'ministry': 'church',
      'synagogue': 'church',
      'mosque': 'church',
      'temple': 'church',
      'charity': 'nonprofit',
      'foundation': 'nonprofit',
      'association': 'nonprofit',
      
      // Sports Cards / Collectibles
      'sports-card-trading': 'collectibles',
      'sports-card-trading-and-collecting': 'collectibles',
      'sports-cards': 'collectibles',
      'trading-cards': 'collectibles',
      'card-shop': 'collectibles',
      'card-store': 'collectibles',
      'memorabilia': 'collectibles',
      
      // Default
      'unknown': 'saas',
      'other': 'saas',
      'business': 'saas'
    };
    
    // Check if industry exists, otherwise use fallback
    const validIndustries = Object.keys(INDUSTRIES);
    if (!validIndustries.includes(sanitizedIndustry)) {
      const fallback = industryFallbacks[sanitizedIndustry] || 'saas';
      console.log(`   ⚠️ Unknown industry "${sanitizedIndustry}" → using "${fallback}"`);
      sanitizedIndustry = fallback;
    }
    
    args.push('--industry', sanitizedIndustry);
  } else if (req.body.bundles && req.body.bundles.length > 0) {
    args.push('--bundles', req.body.bundles.join(','));
  } else if (req.body.modules && req.body.modules.length > 0) {
    args.push('--modules', req.body.modules.join(','));
  } else {
    return res.status(400).json({ success: false, error: 'Must provide industry, bundles, or modules' });
  }

  // ============================================
  // TIER RECOMMENDATION (L1-L4)
  // Runs selectTier() and compares to what they're requesting
  // ============================================
  let tierRecommendation = null;
  try {
    // Build description text from available inputs
    const descriptionText = description?.text || name || '';
    const industryForTier = sanitizedIndustry || 'consulting';

    // Get AI's recommendation based on business description
    const tierResult = selectTier(descriptionText, industryForTier);

    // Infer what tier they're "requesting" based on their explicit config
    // L1 = single page, no admin, no backend
    // L2 = multi-page, basic admin, no backend
    // L3 = multi-page, admin with booking/auth
    // L4 = full backend with cart/payments
    let requestedTier = 'L2'; // Default assumption
    const requestedPages = description?.pages || [];
    const requestedModules = req.body.modules || [];
    const requestedAdminTier = adminTier || 'standard';

    // Detect what tier they're asking for based on config
    const hasCartFeatures = requestedPages.some(p => ['checkout', 'cart', 'tracking'].includes(p)) ||
                           requestedModules.some(m => m.includes('checkout') || m.includes('payment'));
    const hasBookingFeatures = requestedPages.some(p => ['booking', 'appointments'].includes(p)) ||
                              requestedModules.some(m => m.includes('booking'));
    const hasAuthFeatures = requestedPages.some(p => ['login', 'register', 'account'].includes(p)) ||
                           requestedModules.some(m => m.includes('auth'));

    if (hasCartFeatures) {
      requestedTier = 'L4';
    } else if (hasBookingFeatures || hasAuthFeatures || requestedAdminTier === 'pro') {
      requestedTier = 'L3';
    } else if (requestedPages.length > 1 || requestedAdminTier !== 'none') {
      requestedTier = 'L2';
    } else if (requestedPages.length <= 1) {
      requestedTier = 'L1';
    }

    // Build recommendation object
    tierRecommendation = {
      recommendedTier: tierResult.recommended,
      recommendedTierName: tierResult.tier?.name || 'Presence',
      requestedTier: requestedTier,
      detectedFeatures: tierResult.detectedFeatures || [],
      match: tierResult.recommended === requestedTier,
      tierMismatchWarning: null,
      upgradeOptions: tierResult.upgradeOptions || [],
      downgradeOptions: tierResult.downgradeOptions || []
    };

    // Generate mismatch warning if recommendation differs
    if (tierResult.recommended !== requestedTier) {
      const tierOrder = { 'L1': 1, 'L2': 2, 'L3': 3, 'L4': 4 };
      const recommendedLevel = tierOrder[tierResult.recommended];
      const requestedLevel = tierOrder[requestedTier];

      if (recommendedLevel > requestedLevel) {
        // They're under-building - suggest upgrade
        const missingFeatures = tierResult.detectedFeatures?.slice(0, 3).join(', ') || 'additional features';
        tierRecommendation.tierMismatchWarning = `Your business may benefit from ${tierResult.tier?.name || 'a higher tier'} features like ${missingFeatures}`;
        tierRecommendation.direction = 'upgrade';
      } else {
        // They're over-building - could save money
        tierRecommendation.tierMismatchWarning = `Your business might not need all ${requestedTier} features. Consider ${tierResult.tier?.name || 'a simpler tier'} to reduce complexity.`;
        tierRecommendation.direction = 'downgrade';
      }

      console.log(`   📊 Tier mismatch: Recommended ${tierResult.recommended}, Requested ${requestedTier}`);
    } else {
      console.log(`   ✅ Tier match: ${tierResult.recommended} (${tierResult.tier?.name})`);
    }
  } catch (tierErr) {
    console.warn('   ⚠️ Tier recommendation failed:', tierErr.message);
    // Continue without tier recommendation - don't block assembly
  }

  const startTime = Date.now();
  const ASSEMBLY_TIMEOUT = 5 * 60 * 1000; // 5 minute timeout
  let responded = false;

  // ========================================
  // TRACK GENERATION START
  // ========================================
  let generationId = null;
  if (db && db.trackGenerationStart) {
    try {
      generationId = await db.trackGenerationStart({
        siteName: sanitizedName,
        industry: sanitizedIndustry,
        templateUsed: 'blink-assembler',
        modulesSelected: req.body.modules || [],
        pagesGenerated: description?.pages?.length || 0
      });
      console.log(`   📊 Generation tracked: ID ${generationId}`);
    } catch (trackErr) {
      console.warn('   ⚠️ Generation tracking failed:', trackErr.message);
    }
  }

  console.log(`\n🚀 Assembling project: ${sanitizedName}`);
  console.log(`   Command: node ${ASSEMBLE_SCRIPT} ${args.join(' ')}`);

  // Execute the assembly script - SECURITY: shell: false prevents injection
  const childProcess = spawn(process.execPath, [ASSEMBLE_SCRIPT, ...args], {
    cwd: path.dirname(ASSEMBLE_SCRIPT),
    shell: false,  // CRITICAL: Never use shell: true with user input
    env: { ...process.env, MODULE_LIBRARY_PATH: MODULE_LIBRARY, OUTPUT_PATH: GENERATED_PROJECTS }
  });

  // Timeout handler - kill process if it takes too long
  const timeoutId = setTimeout(async () => {
    if (!responded) {
      responded = true;
      childProcess.kill('SIGTERM');
      console.error(`❌ Assembly timeout after ${ASSEMBLY_TIMEOUT / 1000}s`);

      // Track generation failure (timeout)
      if (generationId && db && db.trackGenerationFailed) {
        try {
          await db.trackGenerationFailed(generationId, { message: 'Assembly timeout - process took too long' });
        } catch (trackErr) {
          console.warn('   ⚠️ Generation failure tracking failed:', trackErr.message);
        }
      }

      res.status(504).json({
        success: false,
        error: 'Assembly timeout - process took too long',
        duration: Date.now() - startTime
      });
    }
  }, ASSEMBLY_TIMEOUT);

  let output = '';
  let errorOutput = '';

  childProcess.stdout.on('data', (data) => {
    output += data.toString();
    console.log(data.toString());
  });

  childProcess.stderr.on('data', (data) => {
    errorOutput += data.toString();
    console.error(data.toString());
  });

  // Handle spawn errors (e.g., ENOENT if node not found)
  childProcess.on('error', async (err) => {
    clearTimeout(timeoutId);
    if (!responded) {
      responded = true;
      console.error(`❌ Spawn error: ${err.message}`);

      // Track generation failure (spawn error)
      if (generationId && db && db.trackGenerationFailed) {
        try {
          await db.trackGenerationFailed(generationId, { message: `Spawn error: ${err.message}` });
        } catch (trackErr) {
          console.warn('   ⚠️ Generation failure tracking failed:', trackErr.message);
        }
      }

      res.status(500).json({ success: false, error: `Failed to start assembly: ${err.message}` });
    }
  });

  childProcess.on('close', async (code) => {
    clearTimeout(timeoutId);
    if (responded) return; // Already responded (timeout or error)

    // Cost tracking variables for generation tracking (populated later if AI is used)
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalCost = 0;

    if (code === 0) {
      const projectPath = path.join(GENERATED_PROJECTS, sanitizedName);
      const manifestPath = path.join(projectPath, 'project-manifest.json');
      let manifest = null;
      
      if (fs.existsSync(manifestPath)) {
        try {
          manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        } catch (e) {
          console.warn(`   ⚠️ Failed to parse project manifest:`, e.message);
          captureException(e, { tags: { component: 'manifest-parser' } });
        }
      }

      // ============================================
      // GENERATE BRAIN.JSON & COPY ADMIN MODULE
      // ============================================
      
      // Determine industry key
      let resolvedIndustryKey = industry;
      if (!resolvedIndustryKey && description?.industryKey) {
        resolvedIndustryKey = description.industryKey;
      }
      if (!resolvedIndustryKey && description?.text) {
        resolvedIndustryKey = detectIndustryFromDescription(description.text);
      }
      resolvedIndustryKey = resolvedIndustryKey || 'saas';

      // Get industry config for brain.json
      const industryConfig = INDUSTRIES[resolvedIndustryKey] || null;

      // Build additional config with user-provided data
      const brainAdditionalConfig = {
        adminTier: adminTier || 'standard',
        adminModules: adminModules || [],
        // User business data
        businessLocation: description?.location || description?.businessLocation || '',
        businessHours: description?.hours || null,
        businessPhone: description?.phone || '',
        businessEmail: description?.email || '',
        tagline: description?.tagline || '',
        menuText: description?.menuText || '',
        features: description?.features || []
      };

      // Generate brain.json at project root
      const brainJsonContent = generateBrainJson(name, resolvedIndustryKey, industryConfig, brainAdditionalConfig);
      fs.writeFileSync(path.join(projectPath, 'brain.json'), brainJsonContent);
      console.log('   🧠 brain.json generated');

      // Save uploaded assets to project
      const uploadedAssets = description?.uploadedAssets;
      if (uploadedAssets) {
        const assetsDir = path.join(projectPath, 'frontend', 'public', 'uploads');
        if (!fs.existsSync(assetsDir)) {
          fs.mkdirSync(assetsDir, { recursive: true });
        }
        
        // Save logo
        if (uploadedAssets.logo?.base64) {
          try {
            const logoData = uploadedAssets.logo.base64.replace(/^data:image\/\w+;base64,/, '');
            const logoExt = uploadedAssets.logo.type?.split('/')[1] || 'png';
            fs.writeFileSync(path.join(assetsDir, `logo.${logoExt}`), Buffer.from(logoData, 'base64'));
            console.log('   🎨 Logo saved to uploads/logo.' + logoExt);
          } catch (e) {
            console.log('   ⚠️ Failed to save logo:', e.message);
          }
        }
        
        // Save photos
        if (uploadedAssets.photos && uploadedAssets.photos.length > 0) {
          uploadedAssets.photos.forEach((photo, index) => {
            try {
              const photoData = photo.base64.replace(/^data:image\/\w+;base64,/, '');
              const photoExt = photo.type?.split('/')[1] || 'jpg';
              fs.writeFileSync(path.join(assetsDir, `photo-${index + 1}.${photoExt}`), Buffer.from(photoData, 'base64'));
            } catch (e) {
              console.log(`   ⚠️ Failed to save photo ${index + 1}:`, e.message);
            }
          });
          console.log(`   🖼️ ${uploadedAssets.photos.length} photos saved to uploads/`);
        }
        
        // Save menu and extract text if PDF
        if (uploadedAssets.menu?.base64) {
          try {
            const menuData = uploadedAssets.menu.base64.replace(/^data:[^;]+;base64,/, '');
            const menuExt = uploadedAssets.menu.type?.includes('pdf') ? 'pdf' : 
                           uploadedAssets.menu.type?.split('/')[1] || 'jpg';
            fs.writeFileSync(path.join(assetsDir, `menu.${menuExt}`), Buffer.from(menuData, 'base64'));
            console.log('   📋 Menu saved to uploads/menu.' + menuExt);
            
            // Extract text from PDF
            if (menuExt === 'pdf') {
              try {
                const extractedText = await extractPdfText(menuData);
                if (extractedText) {
                  uploadedAssets.menu.extractedText = extractedText;
                  console.log(`   📝 Extracted ${extractedText.length} chars from menu PDF`);
                }
              } catch (pdfErr) {
                console.log('   ⚠️ Could not extract PDF text:', pdfErr.message);
              }
            }
          } catch (e) {
            console.log('   ⚠️ Failed to save menu:', e.message);
          }
        }
      }

      // Generate admin routes in backend
      const backendRoutesDir = path.join(projectPath, 'backend', 'routes');
      if (!fs.existsSync(backendRoutesDir)) {
        fs.mkdirSync(backendRoutesDir, { recursive: true });
      }
      fs.writeFileSync(path.join(backendRoutesDir, 'brain.js'), generateBrainRoutes());
      fs.writeFileSync(path.join(backendRoutesDir, 'health.js'), generateHealthRoutes());
      console.log('   🔌 Admin routes generated (brain.js, health.js)');

      // Copy admin modules based on tier
      const resolvedAdminTier = adminTier || 'standard';
      let resolvedAdminModules = adminModules || [];
      const businessAdminDest = path.join(projectPath, 'admin');

      // If no modules specified, get default modules for tier
      if (!resolvedAdminModules || resolvedAdminModules.length === 0) {
        try {
          const { suggestAdminTier, getModulesForTier } = require('./lib/services/admin-module-loader.cjs');

          // Try to suggest based on industry, or use the specified tier
          if (resolvedIndustryKey) {
            const suggestion = suggestAdminTier(resolvedIndustryKey, description?.text || '');
            resolvedAdminModules = suggestion.modules;
            console.log(`   🎛️ Auto-detected admin tier: ${suggestion.tier} (${suggestion.reason})`);
          } else {
            resolvedAdminModules = getModulesForTier(resolvedAdminTier);
          }
        } catch (e) {
          console.warn('   ⚠️ Failed to get admin modules, using default tier:', e.message);
          resolvedAdminModules = ['admin-dashboard', 'admin-content', 'admin-settings', 'admin-analytics', 'admin-customers', 'admin-bookings', 'admin-notifications'];
        }
      }

      try {
        const { loadModulesForAssembly, generateAdminAppJsx } = require('./lib/services/admin-module-loader.cjs');

        // Load selected admin modules
        const moduleData = loadModulesForAssembly(resolvedAdminModules);

        // STEP 1: Copy base business-admin for build infrastructure
        // (includes index.html, package.json, vite.config.js, main.jsx, etc.)
        const businessAdminSrc = path.join(MODULE_LIBRARY, 'frontend', 'business-admin');
        if (fs.existsSync(businessAdminSrc)) {
          copyDirectorySync(businessAdminSrc, businessAdminDest);
          console.log('   📦 Admin base infrastructure copied');
        } else if (!fs.existsSync(businessAdminDest)) {
          fs.mkdirSync(businessAdminDest, { recursive: true });
        }

        // STEP 2: Copy each selected module to src/modules/ (Vite requires imports from within src/)
        const modulesDir = path.join(businessAdminDest, 'src', 'modules');
        if (!fs.existsSync(modulesDir)) {
          fs.mkdirSync(modulesDir, { recursive: true });
        }
        for (const mod of moduleData.modules) {
          // Build path from module name - admin modules are in module-assembler-ui/backend/admin-modules/
          const modSrc = path.join(__dirname, 'backend', 'admin-modules', mod.name);
          const modDest = path.join(modulesDir, mod.name);
          if (fs.existsSync(modSrc)) {
            copyDirectorySync(modSrc, modDest);
          } else {
            console.warn(`   ⚠️ Admin module not found: ${mod.name} (looked in ${modSrc})`);
          }
        }

        // STEP 3: Copy _shared module (shared styles and components) to src/modules/
        const sharedModuleSrc = path.join(__dirname, 'backend', 'admin-modules', '_shared');
        const sharedModuleDest = path.join(modulesDir, '_shared');
        if (fs.existsSync(sharedModuleSrc)) {
          copyDirectorySync(sharedModuleSrc, sharedModuleDest);
          console.log('   📦 Admin shared module copied (_shared styles/components)');
        }

        // STEP 4: Generate custom admin App.jsx (overwrites base)
        const adminAppJsx = generateAdminAppJsx(resolvedAdminModules, {
          businessName: name
        });
        fs.writeFileSync(path.join(businessAdminDest, 'src', 'App.jsx'), adminAppJsx);

        // STEP 5: Save admin config
        fs.writeFileSync(path.join(businessAdminDest, 'admin-config.json'), JSON.stringify({
          tier: resolvedAdminTier,
          modules: resolvedAdminModules,
          generatedAt: new Date().toISOString(),
          sidebar: moduleData.sidebar,
          routes: moduleData.routes
        }, null, 2));

        // STEP 6: Copy brain.json to admin config folder
        const adminConfigDir = path.join(businessAdminDest, 'src', 'config');
        if (!fs.existsSync(adminConfigDir)) {
          fs.mkdirSync(adminConfigDir, { recursive: true });
        }
        fs.copyFileSync(path.join(projectPath, 'brain.json'), path.join(adminConfigDir, 'brain.json'));

        console.log(`   🎛️ Admin modules copied (${resolvedAdminTier} tier, ${resolvedAdminModules.length} modules)`);
      } catch (adminErr) {
        console.warn('   ⚠️ Modular admin setup failed, using fallback business-admin:', adminErr.message);

        // Fallback to old business-admin module
        const businessAdminSrc = path.join(MODULE_LIBRARY, 'frontend', 'business-admin');
        if (fs.existsSync(businessAdminSrc)) {
          copyDirectorySync(businessAdminSrc, businessAdminDest);

          // Copy brain.json to admin config folder
          const adminConfigDir = path.join(businessAdminDest, 'src', 'config');
          if (!fs.existsSync(adminConfigDir)) {
            fs.mkdirSync(adminConfigDir, { recursive: true });
          }
          fs.copyFileSync(path.join(projectPath, 'brain.json'), path.join(adminConfigDir, 'brain.json'));
          console.log('   🎛️ Fallback business-admin module copied');
        } else {
          console.log('   ⚠️ business-admin module not found at:', businessAdminSrc);
        }
      }

      // Copy auth-pages module for industries that require authentication
      const authRequiredIndustries = ['survey-rewards', 'saas', 'ecommerce', 'collectibles', 'healthcare', 'family'];
      if (authRequiredIndustries.includes(sanitizedIndustry)) {
        const authPagesSrc = path.join(MODULE_LIBRARY, 'frontend', 'auth-pages');
        const authPagesDest = path.join(projectPath, 'frontend', 'src', 'modules', 'auth-pages');
        if (fs.existsSync(authPagesSrc)) {
          if (!fs.existsSync(authPagesDest)) {
            fs.mkdirSync(authPagesDest, { recursive: true });
          }
          copyDirectorySync(authPagesSrc, authPagesDest);
          console.log('   🔐 auth-pages module copied');
        } else {
          console.log('   ⚠️ auth-pages module not found at:', authPagesSrc);
        }
      }

      // ============================================
      // BUILD PROMPT CONFIG
      // ============================================
      
      // Build prompt config from selections - use detection if no explicit key
      let industryKey = description?.industryKey || industry;
      if (!industryKey && description?.text) {
        industryKey = detectIndustryFromDescription(description.text);
      }
      industryKey = industryKey || 'saas';
      // Support both layoutKey and layoutStyleId (frontend sends layoutStyleId)
      const layoutKey = description?.layoutStyleId || description?.layoutKey || null;
      const selectedEffects = description?.effects || null;
      const promptConfig = buildPrompt(industryKey, layoutKey, selectedEffects);

      // Log layout selection for debugging
      if (layoutKey) {
        console.log(`   🎨 Using layout style: ${layoutKey} for industry: ${industryKey}`);
      }
      
      // Save theme: industry colors take priority, then user theme, then defaults
      // This ensures barbershop gets dark/gold theme even if frontend sends default blue
      const industryColors = promptConfig?.colors || {};
      const userColors = theme?.colors || {};
      const defaultColors = { primary: '#6366f1', accent: '#06b6d4', background: '#ffffff', text: '#1a1a2e' };

      const themeToUse = {
        colors: {
          primary: industryColors.primary || userColors.primary || defaultColors.primary,
          accent: industryColors.accent || userColors.accent || defaultColors.accent,
          secondary: industryColors.secondary || userColors.secondary || defaultColors.primary,
          background: industryColors.background || userColors.background || defaultColors.background,
          text: industryColors.text || userColors.text || defaultColors.text,
          textMuted: industryColors.textMuted || userColors.textMuted || '#64748b',
          surface: industryColors.surface || userColors.surface || '#f8f9fa'
        },
        fonts: {
          heading: promptConfig?.typography?.heading || theme?.fonts?.heading || "'Inter', sans-serif",
          body: promptConfig?.typography?.body || theme?.fonts?.body || "system-ui, sans-serif"
        },
        borderRadius: theme?.borderRadius || '8px'
      };
      
      if (themeToUse) {
        try {
          const frontendSrcPath = path.join(projectPath, 'frontend', 'src');
          
          // Generate CSS variables from theme
          const themeCss = `/* Auto-generated theme from industry config */
:root {
  /* Colors */
  --color-primary: ${themeToUse.colors?.primary || '#6366f1'};
  --color-secondary: ${themeToUse.colors?.secondary || '#8b5cf6'};
  --color-accent: ${themeToUse.colors?.accent || '#06b6d4'};
  --color-background: ${themeToUse.colors?.background || '#ffffff'};
  --color-surface: ${themeToUse.colors?.surface || '#f8f9fa'};
  --color-text: ${themeToUse.colors?.text || '#1a1a2e'};
  --color-text-muted: ${themeToUse.colors?.textMuted || '#64748b'};
  
  /* Typography */
  --font-heading: ${themeToUse.fonts?.heading || "'Inter', sans-serif"};
  --font-body: ${themeToUse.fonts?.body || "system-ui, sans-serif"};
  
  /* Spacing & Borders */
  --border-radius: ${themeToUse.borderRadius || '8px'};
}

/* Utility Classes */
.bg-primary { background-color: var(--color-primary); }
.bg-secondary { background-color: var(--color-secondary); }
.bg-accent { background-color: var(--color-accent); }
.bg-surface { background-color: var(--color-surface); }
.text-primary { color: var(--color-primary); }
.text-accent { color: var(--color-accent); }
.text-muted { color: var(--color-text-muted); }

/* Button Styles */
.btn-primary {
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  padding: 12px 24px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-accent {
  background: var(--color-accent);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  padding: 12px 24px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

/* Card Styles */
.card {
  background: var(--color-surface);
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: var(--border-radius);
  padding: 24px;
}

body {
  margin: 0;
  font-family: var(--font-body);
  color: var(--color-text);
  background: var(--color-background);
}
`;
          
          if (fs.existsSync(frontendSrcPath)) {
            fs.writeFileSync(path.join(frontendSrcPath, 'theme.css'), themeCss);
            console.log('   🎨 Theme saved to frontend/src/theme.css');
            
            // Also save theme.json for reference
            fs.writeFileSync(
              path.join(frontendSrcPath, 'theme.json'), 
              JSON.stringify(themeToUse, null, 2)
            );
          }
        } catch (themeErr) {
          console.error('   ⚠️ Failed to save theme:', themeErr.message);
        }
      }
      
      // Generate AI pages if description provided
      console.log('   🔍 AI Page Generation Check:');
      console.log(`      - description exists: ${!!description}`);
      console.log(`      - description.pages exists: ${!!(description && description.pages)}`);
      console.log(`      - pages count: ${description?.pages?.length || 0}`);
      console.log(`      - pages: ${JSON.stringify(description?.pages || [])}`);
      console.log(`      - API key present: ${!!process.env.ANTHROPIC_API_KEY}`);

      if (description && description.pages && description.pages.length > 0) {
        try {
          console.log(`   🤖 Generating ${description.pages.length} AI pages...`);
          
          const apiKey = process.env.ANTHROPIC_API_KEY;
          const frontendSrcPath = path.join(projectPath, 'frontend', 'src');
          const pagesDir = path.join(frontendSrcPath, 'pages');
          
          // Create pages directory
          if (!fs.existsSync(pagesDir)) {
            fs.mkdirSync(pagesDir, { recursive: true });
          }
          
          if (apiKey && !skipAI) {
            const Anthropic = require('@anthropic-ai/sdk');
            const client = new Anthropic({ apiKey });

            // Cost tracking uses outer scope variables (totalInputTokens, totalOutputTokens, totalCost)
            const MODEL_NAME = 'claude-sonnet-4-20250514';

            // Generate all pages in parallel for speed
            console.log(`      ⚡ Generating ${description.pages.length} pages in parallel...`);

            const pagePromises = description.pages.map(async (pageId) => {
              const componentName = toComponentName(pageId);
              const maxRetries = 2;
              
              for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                  console.log(`      🎨 Generating ${pageId} → ${componentName}Page.jsx${attempt > 1 ? ` (retry ${attempt})` : ''}...`);
                
                // ALL PAGES get AI freedom
                const otherPages = description.pages.filter(p => p !== pageId).map(p => `/${p}`).join(', ');
                const isEnhanceMode = description.enhanceMode === true;
                const existingSiteData = description.existingSite || null;
                
                const pagePrompt = isEnhanceMode
                  ? buildEnhanceModePrompt(pageId, componentName, existingSiteData, promptConfig)
                  : await buildFreshModePrompt(pageId, componentName, otherPages, description, promptConfig);

                const pageResponse = await client.messages.create({
                  model: MODEL_NAME,
                  max_tokens: 16000,
                  messages: [{ role: 'user', content: pagePrompt }]
                });

                // Track API usage from response
                if (pageResponse.usage) {
                  const inputTokens = pageResponse.usage.input_tokens || 0;
                  const outputTokens = pageResponse.usage.output_tokens || 0;
                  totalInputTokens += inputTokens;
                  totalOutputTokens += outputTokens;
                  // Calculate cost: Claude Sonnet = $3/M input, $15/M output
                  const pageCost = (inputTokens / 1000000) * 3.0 + (outputTokens / 1000000) * 15.0;
                  totalCost += pageCost;
                }

                let pageCode = pageResponse.content[0].text;
                pageCode = pageCode.replace(/^```jsx?\n?/g, '').replace(/\n?```$/g, '').trim();
                
                // Validate and fix generated code
                const validation = validateGeneratedCode(pageCode, componentName);
                if (!validation.isValid) {
                  console.log(`      ❌ ${pageId} ERRORS: ${validation.errors.join(', ')}`);
                }
                // Always use fixedCode - it contains auto-fixes for apostrophes, quotes, fonts, etc.
                pageCode = validation.fixedCode;
                if (validation.warnings && validation.warnings.length > 0) {
                  console.log(`      ⚠️ ${pageId} WARNINGS: ${validation.warnings.join(', ')}`);
                }
                if (validation.stats) {
                  console.log(`      📊 ${pageId}: ${validation.stats.lines} lines, content: ${validation.stats.hasRealContent ? 'yes' : 'NO'}`);
                }

                if (!pageCode.includes('export default')) {
                  console.log(`      ⚠️ ${pageId} incomplete, using fallback`);
                  pageCode = buildFallbackPage(componentName, pageId, promptConfig, sanitizedIndustry);
                }
                
                const pagePath = path.join(pagesDir, `${componentName}Page.jsx`);
                fs.writeFileSync(pagePath, pageCode);
                console.log(`      ✅ ${componentName}Page.jsx`);
                return { pageId, componentName, success: true };
                
              } catch (pageErr) {
                  console.error(`      ⚠️ ${pageId} attempt ${attempt} failed: ${pageErr.message}`);
                  
                  if (attempt === maxRetries) {
                    console.log(`      🔄 ${pageId}: Using fallback after ${maxRetries} attempts`);
                    const fallbackCode = buildFallbackPage(componentName, pageId, promptConfig, sanitizedIndustry);
                    fs.writeFileSync(path.join(pagesDir, `${componentName}Page.jsx`), fallbackCode);
                    return { pageId, componentName, success: false, fallback: true };
                  }
                  
                  // Wait 1 second before retry
                  await new Promise(r => setTimeout(r, 1000));
                }
              }
            });
            
            const results = await Promise.all(pagePromises);
            const successCount = results.filter(r => r.success).length;
            console.log(`      ✅ ${successCount}/${description.pages.length} pages complete`);

            // Log and save API cost tracking
            if (totalCost > 0) {
              console.log(`      💰 API Cost: $${totalCost.toFixed(4)} (${totalInputTokens} in / ${totalOutputTokens} out tokens)`);

              // Save to database if available
              if (db && db.trackApiUsage) {
                try {
                  await db.trackApiUsage({
                    projectId: null, // No project ID tracked yet
                    endpoint: 'claude-api',
                    operation: 'page-generation',
                    tokensUsed: totalInputTokens + totalOutputTokens,
                    inputTokens: totalInputTokens,
                    outputTokens: totalOutputTokens,
                    cost: totalCost,
                    durationMs: Date.now() - startTime,
                    responseStatus: 200
                  });
                  console.log(`      ✅ Cost tracked in database`);
                } catch (dbErr) {
                  console.error(`      ⚠️ Failed to track cost: ${dbErr.message}`);
                }
              }
            }

            // Generate updated App.jsx with routes to new pages
            const appJsx = buildAppJsx(name, description.pages, promptConfig, sanitizedIndustry);
            fs.writeFileSync(path.join(frontendSrcPath, 'App.jsx'), appJsx);
            console.log('   ✅ App.jsx updated with routes');
console.log(`   ⏱️ Total generation time: ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
            
            // Ensure theme.css exists
            const themeCssPath = path.join(frontendSrcPath, 'theme.css');
            if (!fs.existsSync(themeCssPath)) {
              const fallbackTheme = buildFallbackThemeCss(promptConfig);
              fs.writeFileSync(themeCssPath, fallbackTheme);
              console.log('   🎨 Created theme.css from industry config');
            }

            // Copy CartContext if needed (for ecommerce/restaurant industries that sell products)
            // Service businesses (spa-salon, barbershop) use booking, not carts
            const cartRequiredIndustries = ['restaurant', 'ecommerce', 'retail', 'pizzeria', 'pizza', 'cafe', 'bakery', 'food-truck'];
            const needsCart = cartRequiredIndustries.includes(sanitizedIndustry) ||
                             description.pages.some(p => ['menu', 'cart', 'checkout', 'order', 'products', 'services', 'booking'].includes(p.toLowerCase()));
            if (needsCart) {
              const contextDir = path.join(frontendSrcPath, 'context');
              if (!fs.existsSync(contextDir)) {
                fs.mkdirSync(contextDir, { recursive: true });
              }
              const cartContextSrc = path.join(__dirname, 'lib/saas-templates/pizza-ordering/frontend/context/CartContext.jsx');
              if (fs.existsSync(cartContextSrc)) {
                fs.copyFileSync(cartContextSrc, path.join(contextDir, 'CartContext.jsx'));
                console.log('   🛒 CartContext copied for cart functionality');
              }
            }

            // Copy effects library (ScrollReveal, AnimatedCounter, ParallaxSection, etc.)
            // AI-generated pages import from '../effects' - this folder MUST exist
            const effectsSrc = path.join(__dirname, '..', 'frontend', 'effects');
            const effectsDest = path.join(frontendSrcPath, 'effects');
            if (fs.existsSync(effectsSrc)) {
              copyDirectorySync(effectsSrc, effectsDest);
              console.log('   ✨ Effects library copied (ScrollReveal, AnimatedCounter, etc.)');
            } else {
              console.log('   ⚠️ Effects library not found at:', effectsSrc);
            }

          } else {
            // TEST MODE or NO API KEY: Generate deterministic fallback pages
            if (skipAI) {
              console.log('   🧪 TEST MODE: Using deterministic fallback pages (no AI cost)');
            } else {
              console.log('   ⚠️ No API key - using fallback pages');
            }

            // Generate fallback pages for each requested page
            // Pass industry for industry-specific content (menu items, services, etc.)
            for (const pageId of description.pages) {
              const componentName = toComponentName(pageId);
              const fallbackCode = buildFallbackPage(componentName, pageId, promptConfig, sanitizedIndustry);
              fs.writeFileSync(path.join(pagesDir, `${componentName}Page.jsx`), fallbackCode);
              console.log(`      ✅ ${componentName}Page.jsx (fallback)`);
            }

            // Generate App.jsx with routes
            const appJsx = buildAppJsx(name, description.pages, promptConfig, sanitizedIndustry);
            fs.writeFileSync(path.join(frontendSrcPath, 'App.jsx'), appJsx);
            console.log('   ✅ App.jsx updated with routes');

            // Copy effects library (needed for fallback pages too)
            const effectsSrc = path.join(__dirname, '..', 'frontend', 'effects');
            const effectsDest = path.join(frontendSrcPath, 'effects');
            if (fs.existsSync(effectsSrc)) {
              copyDirectorySync(effectsSrc, effectsDest);
              console.log('   ✨ Effects library copied');
            }

            // Copy CartContext if needed (same logic as AI path)
            const cartRequiredIndustries = ['restaurant', 'ecommerce', 'retail', 'pizzeria', 'pizza', 'cafe', 'bakery', 'food-truck'];
            const needsCart = cartRequiredIndustries.includes(sanitizedIndustry) ||
                             description.pages.some(p => ['menu', 'cart', 'checkout', 'order', 'products', 'services', 'booking'].includes(p.toLowerCase()));
            if (needsCart) {
              const contextDir = path.join(frontendSrcPath, 'context');
              if (!fs.existsSync(contextDir)) {
                fs.mkdirSync(contextDir, { recursive: true });
              }
              const cartContextSrc = path.join(__dirname, 'lib/saas-templates/pizza-ordering/frontend/context/CartContext.jsx');
              if (fs.existsSync(cartContextSrc)) {
                fs.copyFileSync(cartContextSrc, path.join(contextDir, 'CartContext.jsx'));
                console.log('   🛒 CartContext copied for cart functionality');
              }
            }
          }
          
        } catch (pagesErr) {
          console.error('   ⚠️ Page generation error:', pagesErr.message);
        }
      } else {
        console.log('   ⏭️ Skipping AI page generation - no pages in description');
      }

      // ========================================
      // MODULE VALIDATION (auto-fix icon imports)
      // ========================================
      console.log('\n   ═══════════════════════════════════════════════════');
      console.log('   🔍 Running module validation (icon imports, SQL)...');
      console.log('   ═══════════════════════════════════════════════════');

      try {
        const validationResults = await validateProject(projectPath);

        if (validationResults.summary.totalFixes > 0) {
          console.log(`   ✅ Auto-fixed ${validationResults.summary.totalFixes} issue(s)`);
        }
        if (validationResults.summary.totalIssues > validationResults.summary.totalFixes) {
          const unfixed = validationResults.summary.totalIssues - validationResults.summary.totalFixes;
          console.log(`   ⚠️ ${unfixed} issue(s) require manual review`);
        }
        if (validationResults.summary.totalIssues === 0) {
          console.log('   ✅ All module validations passed');
        }
      } catch (validationErr) {
        console.warn('   ⚠️ Module validation error:', validationErr.message);
        // Don't block on validation errors - just log and continue
      }

      // ========================================
      // AUDIT 1: PRE-DEPLOYMENT BUILD VALIDATION
      // ========================================
      let auditResult = null;
      let auditPassed = true;

      if (ENABLE_PRE_DEPLOY_AUDIT) {
        console.log('\n   ═══════════════════════════════════════════════════');
        console.log('   🔍 Running pre-deployment build validation...');
        console.log('   ═══════════════════════════════════════════════════');

        try {
          auditResult = await auditService.audit1PostGeneration(projectPath, {
            maxRetries: 2,
            timeout: 120000 // 2 min build timeout
          });

          auditPassed = auditResult.success;

          // Track build result in database
          if (generationId && db && db.trackBuildResult) {
            await db.trackBuildResult(generationId, auditResult);
          }

          if (auditPassed) {
            console.log('   ✅ Build validation passed - safe to deploy');
          } else {
            console.log(`   ❌ Build validation FAILED with ${auditResult.errors?.length || 0} error(s)`);
            auditResult.errors?.slice(0, 3).forEach((err, i) => {
              console.log(`      ${i + 1}. ${err.message || err.type}`);
            });
          }
        } catch (auditErr) {
          console.error('   ⚠️ Audit service error:', auditErr.message);
          // Don't block on audit service errors - just log and continue
          auditPassed = true;
        }
      }

      // Check if auto-deploy requested (ONLY if audit passed)
      let deployResult = null;
      if (autoDeploy && deployReady && auditPassed) {
        deployResult = await autoDeployProject(projectPath, name, 'admin@be1st.io');
      } else if (autoDeploy && !auditPassed) {
        console.log('   ⏭️ Skipping auto-deploy due to failed build validation');
        deployResult = {
          success: false,
          error: 'Build validation failed - deployment blocked',
          auditErrors: auditResult?.errors || []
        };
      }

      // ========================================
      // TRACK GENERATION COMPLETE
      // ========================================
      if (generationId && db && db.trackGenerationComplete) {
        try {
          await db.trackGenerationComplete(generationId, {
            pagesGenerated: description?.pages?.length || 0,
            totalCost: totalCost || 0,
            totalTokens: totalInputTokens + totalOutputTokens,
            inputTokens: totalInputTokens || 0,
            outputTokens: totalOutputTokens || 0,
            generationTimeMs: Date.now() - startTime
          });
          console.log(`   📊 Generation ${generationId} marked complete`);
        } catch (trackErr) {
          console.warn('   ⚠️ Generation complete tracking failed:', trackErr.message);
        }
      }

      // ========================================
      // TRACK DEPLOYMENT URLS (if deployed)
      // ========================================
      if (generationId && deployResult && deployResult.success && deployResult.urls && db && db.updateProjectDeploymentUrls) {
        try {
          const urls = deployResult.urls;
          await db.updateProjectDeploymentUrls(generationId, {
            domain: urls.frontend?.replace('https://', '').replace('http://', '') || null,
            frontend: urls.frontend || null,
            admin: urls.admin || null,
            backend: urls.backend || null,
            githubFrontend: urls.githubFrontend || urls.github || null,
            githubBackend: urls.githubBackend || null,
            githubAdmin: urls.githubAdmin || null,
            railway: urls.railway || null,
            railwayProjectId: deployResult.railwayProjectId || null
          });
          console.log(`   📊 Generation ${generationId} deployment URLs saved`);
        } catch (trackErr) {
          console.warn('   ⚠️ Deployment URL tracking failed:', trackErr.message);
        }
      } else if (generationId && deployResult && !deployResult.success && db && db.trackDeploymentFailed) {
        // ========================================
        // TRACK DEPLOYMENT FAILURE
        // ========================================
        try {
          await db.trackDeploymentFailed(generationId, {
            message: deployResult.error || 'Deployment failed - no URLs returned',
            stage: deployResult.failedStage || 'unknown',
            details: deployResult.errorDetails || null
          });
          console.log(`   ⚠️ Generation ${generationId} marked as deploy_failed`);
        } catch (trackErr) {
          console.warn('   ⚠️ Deployment failure tracking failed:', trackErr.message);
        }
      }

      // Complete learning log (non-blocking) - success case
      learningService.completeGenerationLog(learningLogId, {
        success: true,
        projectId: generationId,
        pagesGenerated: description?.pages?.length || 0,
        auditPassed: auditPassed,
        auditErrors: auditResult?.errors?.length || 0,
        auditWarnings: auditResult?.warnings?.length || 0,
        auditFixes: auditResult?.autoFixesApplied?.length || 0,
        generationTimeMs: Date.now() - startTime,
        auditTimeMs: auditResult?.durationMs || 0,
        inputTokens: totalInputTokens || 0,
        outputTokens: totalOutputTokens || 0,
        cost: totalCost || 0
      }).catch(() => {}); // Don't block on logging errors

      responded = true;
      res.json({
        success: true,
        message: auditPassed ? 'Project assembled successfully' : 'Project assembled but build validation failed',
        project: {
          name: name,
          path: projectPath,
          manifest: manifest,
          admin: {
            included: true,
            path: path.join(projectPath, 'admin'),
            brainPath: path.join(projectPath, 'brain.json')
          },
          endpoints: {
            frontend: 'http://localhost:5173',
            admin: 'http://localhost:5174',
            api: 'http://localhost:5000',
            brain: 'http://localhost:5000/api/brain',
            health: 'http://localhost:5000/api/health'
          }
        },
        output: output,
        deployment: deployResult,
        // Audit results (AUDIT 1: Pre-deployment build validation)
        audit: auditResult ? {
          passed: auditResult.success,
          durationMs: auditResult.durationMs,
          errorCount: auditResult.errors?.length || 0,
          warningCount: auditResult.warnings?.length || 0,
          autoFixesApplied: auditResult.autoFixesApplied?.length || 0,
          errors: (auditResult.errors || []).slice(0, 5), // Top 5 errors
          warnings: (auditResult.warnings || []).slice(0, 3) // Top 3 warnings
        } : null,
        // Tier recommendation (L1-L4) - for frontend upsell/suggestion UI
        tierRecommendation: tierRecommendation,
        duration: Date.now() - startTime,
        generationId: generationId,
        // Include learning log ID for potential feedback later
        learningLogId: learningLogId
      });
    } else {
      // ========================================
      // TRACK GENERATION FAILED
      // ========================================
      if (generationId && db && db.trackGenerationFailed) {
        try {
          await db.trackGenerationFailed(generationId, { message: 'Assembly failed', output: errorOutput });
        } catch (trackErr) {
          console.warn('   ⚠️ Generation failure tracking failed:', trackErr.message);
        }
      }

      // Complete learning log (non-blocking) - failure case
      learningService.completeGenerationLog(learningLogId, {
        success: false,
        errorType: 'ASSEMBLY_FAILED',
        errorMessage: errorOutput?.substring(0, 1000) || 'Assembly failed',
        generationTimeMs: Date.now() - startTime
      }).catch(() => {}); // Don't block on logging errors

      responded = true;
      res.status(500).json({
        success: false,
        error: 'Assembly failed',
        output: output,
        errorOutput: errorOutput,
        duration: Date.now() - startTime,
        learningLogId: learningLogId
      });
    }
  });
});

// Auto-deploy helper function (uses deployService defined at top)
async function autoDeployProject(projectPath, projectName, adminEmail) {
  if (!deployReady) {
    console.log('⚠️ Auto-deploy skipped: Deploy service not configured');
    return null;
  }
  
  console.log(`\n🚀 Auto-deploying: ${projectName}`);
  try {
    const result = await deployService.deployProject(projectPath, projectName, {
      adminEmail: adminEmail || 'admin@be1st.io'
    });
    return result;
  } catch (error) {
    console.error('Auto-deploy error:', error.message);
    return { success: false, error: error.message };
  }
}

// ============================================
// AI PAGE CHAT ENDPOINT (Full Control Mode)
// ============================================
const Anthropic = require('@anthropic-ai/sdk');

app.post('/api/ai/page-chat', async (req, res) => {
  const { message, pageType, pageName, businessContext, currentSettings, conversationHistory } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, error: 'Message is required' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ success: false, error: 'AI service not configured' });
  }

  try {
    const client = new Anthropic({ apiKey });

    // Build context for the AI
    const businessInfo = businessContext || {};
    const systemPrompt = `You are a helpful web design assistant helping a user customize their ${pageName || pageType} page for "${businessInfo.businessName || 'their business'}".

Business Context:
- Business Name: ${businessInfo.businessName || 'Not specified'}
- Industry: ${businessInfo.industryDisplay || businessInfo.industry || 'Not specified'}
- Location: ${businessInfo.location || 'Not specified'}
- Tagline: ${businessInfo.tagline || 'Not specified'}

Current Page Settings:
- Layout: ${currentSettings?.layout || 'Not selected'}
- Style: ${currentSettings?.style || 'modern'}
- Sections: ${currentSettings?.sections?.join(', ') || 'Default sections'}
- Primary Color: ${currentSettings?.colors?.primary || '#3b82f6'}
- Accent Color: ${currentSettings?.colors?.accent || '#10b981'}

Your role:
1. Answer questions about page design, layouts, and best practices
2. Suggest improvements based on the business type and industry
3. When the user describes how they want the page to look, extract concrete suggestions
4. Be concise but helpful

When you have specific actionable suggestions for the page, include them in a JSON block at the end of your response like this:
\`\`\`suggestions
{
  "layout": "layout-id-if-suggesting",
  "style": "style-id-if-suggesting",
  "sections": ["section1", "section2"],
  "colors": { "primary": "#hex", "accent": "#hex" }
}
\`\`\`

Only include the suggestions block when you have concrete recommendations. Omit fields you're not suggesting changes for.`;

    // Build messages array with conversation history
    const messages = [];
    if (conversationHistory && conversationHistory.length > 0) {
      for (const msg of conversationHistory) {
        messages.push({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        });
      }
    }
    messages.push({ role: 'user', content: message });

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages
    });

    const responseText = response.content[0].text;

    // Extract suggestions if present
    let suggestions = null;
    const suggestionsMatch = responseText.match(/```suggestions\n([\s\S]*?)\n```/);
    if (suggestionsMatch) {
      try {
        suggestions = JSON.parse(suggestionsMatch[1]);
      } catch (e) {
        console.warn('Failed to parse suggestions JSON:', e.message);
      }
    }

    // Remove suggestions block from response text for display
    const cleanResponse = responseText.replace(/```suggestions\n[\s\S]*?\n```/g, '').trim();

    res.json({
      success: true,
      response: cleanResponse,
      suggestions: suggestions
    });

  } catch (error) {
    console.error('AI page chat error:', error.message);
    captureException(error, { tags: { component: 'ai-page-chat' } });
    res.status(500).json({
      success: false,
      error: 'Failed to get AI response'
    });
  }
});

// AI Suggest Pages Endpoint (for auto-fill)
app.post('/api/ai/suggest-pages', async (req, res) => {
  const { businessName, industry, location, tagline, pages, existingSettings } = req.body;

  if (!pages || pages.length === 0) {
    return res.status(400).json({ success: false, error: 'Pages list is required' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ success: false, error: 'AI service not configured' });
  }

  try {
    const client = new Anthropic({ apiKey });

    // Find pages that don't have settings yet
    const pagesToSuggest = pages.filter(p => !existingSettings || !existingSettings[p]);

    if (pagesToSuggest.length === 0) {
      return res.json({ success: true, suggestions: {} });
    }

    const systemPrompt = `You are a web design expert. Generate page settings for a ${industry || 'business'} website.

Business: ${businessName || 'Unknown'}
Industry: ${industry || 'general'}
Location: ${location || 'Not specified'}
Tagline: ${tagline || 'Not specified'}

Generate settings for these pages: ${pagesToSuggest.join(', ')}

For each page, suggest:
- layout: A layout ID (hero-stack, split-screen, card-grid, minimal, etc.)
- style: A style ID (modern, minimal, warm, bold, luxury, playful, corporate, natural)
- sections: Array of section IDs appropriate for that page type
- colors: { primary: "#hex", accent: "#hex" }

Return ONLY valid JSON with page names as keys:
{
  "home": { "layout": "hero-stack", "style": "modern", "sections": ["hero", "features", "testimonials", "cta"], "colors": { "primary": "#3b82f6", "accent": "#10b981" } },
  "about": { ... }
}`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: `Generate page settings for: ${pagesToSuggest.join(', ')}` }]
    });

    const responseText = response.content[0].text;

    // Try to parse the JSON response
    let suggestions = {};
    try {
      // Find JSON in the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.warn('Failed to parse AI suggestions:', e.message);
    }

    res.json({
      success: true,
      suggestions: suggestions
    });

  } catch (error) {
    console.error('AI suggest pages error:', error.message);
    captureException(error, { tags: { component: 'ai-suggest-pages' } });
    res.status(500).json({
      success: false,
      error: 'Failed to get AI suggestions'
    });
  }
});

// ============================================
// SENTRY TEST ENDPOINT (for verification)
// ============================================
app.get('/api/sentry-test', (req, res) => {
  throw new Error('Sentry test error - this is intentional!');
});

app.post('/api/sentry-test', (req, res) => {
  const { message } = req.body;
  captureException(new Error(message || 'Manual test error'), {
    tags: { type: 'manual-test' },
    extra: { timestamp: new Date().toISOString() }
  });
  res.json({ success: true, message: 'Error sent to Sentry' });
});

// ============================================
// SENTRY ERROR HANDLER - Must be AFTER all routes
// ============================================
app.use(sentryErrorHandler());

// Global error handler (after Sentry captures the error)
app.use((err, req, res, next) => {
  console.error('🔴 Server error:', err.message);

  // Capture to Sentry if not already captured
  captureException(err, {
    tags: { handler: 'global-error-handler' },
    extra: {
      url: req.url,
      method: req.method,
      body: req.body
    }
  });

  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});

// ============================================
// START SERVER
// ============================================
async function startServer() {
  // Initialize database and admin services
  await initializeServices();

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   ⚡ BLINK Module Assembler v2.0                         ║
║                                                          ║
║   Server:    http://localhost:${PORT}                      ║
║   API:       http://localhost:${PORT}/api                  ║
║   Admin:     http://localhost:${PORT}/admin                ║
║                                                          ║
║   ✅ Prompt configs loaded:                              ║
║      - ${Object.keys(INDUSTRIES).length} industries                                   ║
║      - ${Object.keys(LAYOUTS).length} layouts                                      ║
║      - ${Object.keys(EFFECTS).length} effects                                      ║
║      - ${Object.keys(SECTIONS).length} sections                                     ║
║   ${db ? '✅ Database connected' : '⚠️  No database (admin disabled)'}                           ║
║                                                          ║
║   Endpoints:                                             ║
║   - GET  /api/health           Health check              ║
║   - GET  /api/bundles          List all bundles          ║
║   - GET  /api/industries       List all industries       ║
║   - GET  /api/layouts          List all layouts          ║
║   - GET  /api/effects          List all effects          ║
║   - GET  /api/sections         List all sections         ║
║   - GET  /api/projects         List generated projects   ║
║   - POST /api/build-prompt     Build prompt from config  ║
║   - POST /api/assemble         Assemble a new project    ║
║   - POST /api/analyze-site     Analyze reference site    ║
║   - POST /api/analyze-existing-site  Analyze for enhance ║
║   - POST /api/generate-theme   Generate theme            ║
║   - POST /api/open-folder      Open folder in explorer   ║
║   - POST /api/open-vscode      Open folder in VS Code    ║
║                                                          ║
║   Press Ctrl+C to stop                                   ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
  `);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ Port ${PORT} is already in use.`);
    } else {
      console.error('Server error:', err);
    }
    process.exit(1);
  });

  process.on('SIGINT', () => {
    console.log('\n\n👋 Shutting down server...');
    server.close(() => {
      console.log('Server closed.');
      process.exit(0);
    });
  });
}

// Start the server
startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
