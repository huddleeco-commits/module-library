/**
 * LAUNCHPAD API ROUTES
 *
 * The unified generation and deployment API that combines:
 * - QuickStart simplicity (single input)
 * - Scout power (test mode, AI levels, deployment)
 * - Research Lab intelligence (structural variants)
 *
 * Endpoints:
 * - POST /api/launchpad/detect - Detect industry/business from input
 * - POST /api/launchpad/generate - Generate a full site
 * - POST /api/launchpad/deploy - Generate + Deploy in one step
 * - GET /api/launchpad/modes - Get available generation modes
 * - GET /api/launchpad/industries - Get supported industries
 * - GET /api/launchpad/fixture/:industryId - Get fixture for industry
 * - GET /api/launchpad/status - Get service status
 * - GET /api/launchpad/trends/:industry - Get current design trends for industry
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

// Launchpad engine
const {
  detectFromInput,
  buildBusinessData,
  generateSite,
  loadFixture,
  GENERATION_MODES,
  INDUSTRY_PAGES,
  INDUSTRY_KEYWORDS
} = require('../services/launchpad-engine.cjs');

// Industry research configs
const {
  getAvailableIndustries,
  getIndustryResearch,
  getAllVariants
} = require('../../config/industry-design-research.cjs');

// Deploy service
const {
  createOneClickDeployService,
  DEPLOY_PHASES
} = require('../services/one-click-deploy.cjs');

// Trend research service
const {
  researchIndustryTrends,
  getDefaultTrends,
  getCacheStats
} = require('../services/trend-research.cjs');

/**
 * Create Launchpad routes
 * @param {Object} deps - Dependencies
 * @param {Object} deps.deployService - Deploy service module
 * @param {Object} deps.db - Database module
 */
function createLaunchpadRoutes(deps = {}) {
  const router = express.Router();
  const { deployService, db } = deps;

  // Initialize deploy service if available
  let oneClickService = null;
  if (process.env.RAILWAY_TOKEN && process.env.GITHUB_TOKEN) {
    oneClickService = createOneClickDeployService({
      deployService,
      db,
      railwayToken: process.env.RAILWAY_TOKEN,
      githubToken: process.env.GITHUB_TOKEN,
      cloudflareToken: process.env.CLOUDFLARE_TOKEN,
      cloudflareZoneId: process.env.CLOUDFLARE_ZONE_ID
    });
  }

  /**
   * GET /api/launchpad/status
   * Check service status and configuration
   */
  router.get('/status', (req, res) => {
    res.json({
      success: true,
      ready: true,
      deploy: {
        ready: !!oneClickService?.isReady?.(),
        services: {
          railway: !!process.env.RAILWAY_TOKEN,
          github: !!process.env.GITHUB_TOKEN,
          cloudflare: !!process.env.CLOUDFLARE_TOKEN && !!process.env.CLOUDFLARE_ZONE_ID
        }
      },
      generation: {
        modes: Object.keys(GENERATION_MODES),
        industries: Object.keys(INDUSTRY_KEYWORDS).length
      }
    });
  });

  /**
   * GET /api/launchpad/modes
   * Get available generation modes with their features and costs
   */
  router.get('/modes', (req, res) => {
    res.json({
      success: true,
      modes: GENERATION_MODES
    });
  });

  /**
   * GET /api/launchpad/industries
   * Get all supported industries with their configs
   */
  router.get('/industries', (req, res) => {
    const industries = getAvailableIndustries();

    const industryDetails = industries.map(id => {
      const research = getIndustryResearch(id);
      const variants = getAllVariants(id);
      const pages = INDUSTRY_PAGES[id] || INDUSTRY_PAGES['restaurant'];

      return {
        id,
        name: research?.name || id,
        styleNote: research?.styleNote || '',
        pages,
        variants: variants ? {
          A: { name: variants.A?.name, heroType: variants.A?.heroType, mood: variants.A?.mood },
          B: { name: variants.B?.name, heroType: variants.B?.heroType, mood: variants.B?.mood },
          C: { name: variants.C?.name, heroType: variants.C?.heroType, mood: variants.C?.mood }
        } : null,
        keywords: INDUSTRY_KEYWORDS[id] || []
      };
    });

    res.json({
      success: true,
      count: industries.length,
      industries: industryDetails
    });
  });

  /**
   * GET /api/launchpad/fixture/:industryId
   * Get fixture data for an industry
   */
  router.get('/fixture/:industryId', (req, res) => {
    const { industryId } = req.params;
    const fixture = loadFixture(industryId);

    if (!fixture) {
      return res.status(404).json({
        success: false,
        error: `No fixture found for industry: ${industryId}`
      });
    }

    res.json({
      success: true,
      industryId,
      fixture
    });
  });

  /**
   * GET /api/launchpad/trends/:industry
   * Get current design trends for an industry
   *
   * Returns color palettes, must-have features, trust builders,
   * hero section trends, and supporting statistics.
   */
  router.get('/trends/:industry', async (req, res) => {
    const { industry } = req.params;
    const { location } = req.query;

    console.log(`\n🔍 LAUNCHPAD: Trend research request for ${industry}`);

    try {
      // Research trends (uses caching internally)
      const trends = await researchIndustryTrends(industry, location);

      res.json({
        success: true,
        industry,
        location: location || null,
        trends,
        cached: trends.cached || false
      });
    } catch (error) {
      console.error('Trend research error:', error);

      // Fall back to default trends on error
      const defaultTrends = getDefaultTrends(industry);
      res.json({
        success: true,
        industry,
        trends: defaultTrends,
        cached: false,
        fallback: true
      });
    }
  });

  /**
   * GET /api/launchpad/trends-cache-stats
   * Get trend cache statistics (for debugging)
   */
  router.get('/trends-cache-stats', (req, res) => {
    const stats = getCacheStats();
    res.json({
      success: true,
      stats
    });
  });

  /**
   * POST /api/launchpad/detect
   * Detect industry, business name, and location from input
   *
   * Body: { input: "Mario's Pizza in Brooklyn" }
   */
  router.post('/detect', (req, res) => {
    const { input } = req.body;

    if (!input || typeof input !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Input string is required'
      });
    }

    try {
      const detection = detectFromInput(input);
      res.json({
        success: true,
        detection
      });
    } catch (error) {
      console.error('Detection error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/launchpad/generate
   * Generate a complete site
   *
   * Body: {
   *   input: "Mario's Pizza in Brooklyn",
   *   variant: "A", // A, B, or C
   *   mode: "test", // test, enhanced, creative, premium
   *   moodSliders: {}, // optional mood settings
   *   businessData: {}, // optional overrides
   *   trendOverrides: {}, // optional trend data to apply
   *   customMenu: [] // optional custom menu categories
   * }
   */
  router.post('/generate', async (req, res) => {
    const { input, variant = 'A', mode = 'test', moodSliders = {}, businessData = {}, trendOverrides = null, menuStyle = null, customMenu = null } = req.body;

    if (!input) {
      return res.status(400).json({
        success: false,
        error: 'Input is required'
      });
    }

    // Validate variant
    if (!['A', 'B', 'C'].includes(variant.toUpperCase())) {
      return res.status(400).json({
        success: false,
        error: 'Variant must be A, B, or C'
      });
    }

    // Validate mode
    if (!GENERATION_MODES[mode]) {
      return res.status(400).json({
        success: false,
        error: `Invalid mode. Must be one of: ${Object.keys(GENERATION_MODES).join(', ')}`
      });
    }

    console.log(`\n🚀 LAUNCHPAD: Generate request`);
    console.log(`   Input: "${input}"`);
    console.log(`   Variant: ${variant}`);
    console.log(`   Mode: ${mode}`);
    console.log(`   Menu Style: ${menuStyle || '(auto)'}`);
    console.log(`   Request body keys: ${Object.keys(req.body).join(', ')}`);
    if (req.body.menuStyle !== undefined) {
      console.log(`   menuStyle from body: "${req.body.menuStyle}" (type: ${typeof req.body.menuStyle})`);
    }

    if (trendOverrides) {
      console.log(`   Trends: Applied (${Object.keys(trendOverrides).filter(k => trendOverrides[k]?.length).join(', ')})`);
    }

    if (customMenu) {
      console.log(`   Custom Menu: ${customMenu.length} categories, ${customMenu.reduce((sum, c) => sum + (c.items?.length || 0), 0)} items`);
    }

    try {
      const result = await generateSite(input, variant.toUpperCase(), mode, {
        moodSliders,
        businessData: { ...businessData, menuStyle },
        trendOverrides,
        customMenu,
        enablePortal: true
      });

      // Save to database if available
      if (db && result.success) {
        try {
          const insertResult = await db.query(
            `INSERT INTO generated_projects (name, project_path, status, metadata)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
            [
              result.businessData.name,
              result.projectDir,
              'generated',
              JSON.stringify({
                source: 'launchpad',
                variant: result.variant,
                mode: result.mode,
                industry: result.detection.industry,
                detection: result.detection,
                pages: result.pages,
                duration: result.duration
              })
            ]
          );
          result.projectId = insertResult.rows[0]?.id;
        } catch (dbError) {
          console.warn('Failed to save project to database:', dbError.message);
        }
      }

      res.json(result);
    } catch (error) {
      console.error('Generation error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/launchpad/generate-all
   * Generate all 3 variants at once for comparison
   *
   * Body: {
   *   input: "Mario's Pizza in Brooklyn",
   *   mode: "test"
   * }
   */
  router.post('/generate-all', async (req, res) => {
    const { input, mode = 'test', moodSliders = {}, menuStyle = null } = req.body;

    if (!input) {
      return res.status(400).json({
        success: false,
        error: 'Input is required'
      });
    }

    console.log(`\n🚀 LAUNCHPAD: Generate all variants`);
    console.log(`   Input: "${input}"`);
    if (menuStyle) {
      console.log(`   Menu Style: ${menuStyle}`);
    }

    try {
      const results = {};

      for (const variant of ['A', 'B', 'C']) {
        console.log(`\n   Generating variant ${variant}...`);
        results[variant] = await generateSite(input, variant, mode, {
          moodSliders,
          businessData: menuStyle ? { menuStyle } : {},
          enablePortal: true
        });
      }

      res.json({
        success: true,
        input,
        mode,
        variants: results
      });
    } catch (error) {
      console.error('Generate-all error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/launchpad/generate-all-styles
   * Generate all 4 menu styles for comparison
   *
   * Body: {
   *   input: "Mario's Pizza in Brooklyn",
   *   variant: "A",
   *   mode: "test"
   * }
   */
  router.post('/generate-all-styles', async (req, res) => {
    const { input, variant = 'A', mode = 'test', moodSliders = {}, trendOverrides = null } = req.body;

    if (!input) {
      return res.status(400).json({
        success: false,
        error: 'Input is required'
      });
    }

    const MENU_STYLES = ['photo-grid', 'elegant-list', 'compact-table', 'storytelling-cards'];

    console.log(`\n🎨 LAUNCHPAD: Generate all menu styles`);
    console.log(`   Input: "${input}"`);
    console.log(`   Variant: ${variant}`);
    console.log(`   Styles: ${MENU_STYLES.join(', ')}`);

    try {
      const results = {};
      let businessData = null;

      for (const menuStyle of MENU_STYLES) {
        console.log(`\n   Generating ${menuStyle} style...`);
        const result = await generateSite(input, variant, mode, {
          moodSliders,
          businessData: { menuStyle },
          trendOverrides,
          enablePortal: true
        });
        results[menuStyle] = result;

        // Capture business data from first result
        if (!businessData && result.businessData) {
          businessData = result.businessData;
        }
      }

      res.json({
        success: true,
        input,
        variant,
        mode,
        businessData,
        styles: results
      });
    } catch (error) {
      console.error('Generate-all-styles error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/launchpad/deploy
   * Generate + Deploy in one step with SSE streaming
   *
   * Body: {
   *   input: "Mario's Pizza in Brooklyn",
   *   variant: "A",
   *   mode: "test",
   *   adminEmail: "admin@example.com"
   * }
   */
  router.post('/deploy', async (req, res) => {
    const {
      input,
      variant = 'A',
      mode = 'test',
      adminEmail = 'admin@be1st.io',
      moodSliders = {},
      businessData = {}
    } = req.body;

    if (!input) {
      return res.status(400).json({
        success: false,
        error: 'Input is required'
      });
    }

    // Check deploy service
    if (!oneClickService || !oneClickService.isReady()) {
      return res.status(503).json({
        success: false,
        error: 'Deploy service not configured. Check RAILWAY_TOKEN and GITHUB_TOKEN.'
      });
    }

    console.log(`\n🚀 LAUNCHPAD: Deploy request`);
    console.log(`   Input: "${input}"`);

    // Set up SSE streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const sendEvent = (data) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    sendEvent({ type: 'connected', message: 'Launchpad stream connected' });

    try {
      // Phase 1: Detection
      sendEvent({
        type: 'progress',
        phase: 'detecting',
        message: 'Analyzing business input...',
        percent: 5
      });

      const detection = detectFromInput(input);

      sendEvent({
        type: 'progress',
        phase: 'detected',
        message: `Detected: ${detection.industryName}`,
        percent: 10,
        detection
      });

      // Phase 2: Generation
      sendEvent({
        type: 'progress',
        phase: 'generating',
        message: `Generating Layout ${variant}...`,
        percent: 15
      });

      const generationResult = await generateSite(input, variant.toUpperCase(), mode, {
        moodSliders,
        businessData,
        enablePortal: true
      });

      if (!generationResult.success) {
        throw new Error('Generation failed: ' + (generationResult.error || 'Unknown error'));
      }

      sendEvent({
        type: 'progress',
        phase: 'generated',
        message: `Generated ${Object.keys(generationResult.pages).length} pages`,
        percent: 30,
        pages: Object.keys(generationResult.pages)
      });

      // Phase 3: Deployment
      sendEvent({
        type: 'progress',
        phase: 'deploying',
        message: 'Starting deployment pipeline...',
        percent: 35
      });

      // Use the frontend directory for deployment
      const frontendPath = path.join(generationResult.projectDir, 'frontend');
      const projectName = generationResult.projectSlug;

      const deployResult = await oneClickService.deploy({
        projectPath: frontendPath,
        projectName,
        adminEmail,
        appType: 'website'
      }, (progress) => {
        // Stream deployment progress
        const basePercent = 35;
        const deployPercent = Math.min(progress.percent || 0, 100);
        const totalPercent = basePercent + (deployPercent * 0.65); // Scale 0-65% to 35-100%

        sendEvent({
          type: 'progress',
          phase: progress.phase || 'deploying',
          message: progress.message || 'Deploying...',
          percent: Math.round(totalPercent),
          details: progress.details
        });
      });

      // Save to database
      if (db && deployResult.success) {
        try {
          await db.query(
            `INSERT INTO generated_projects (name, project_path, status, metadata, deployed_url, railway_project_id)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              generationResult.businessData.name,
              generationResult.projectDir,
              'deployed',
              JSON.stringify({
                source: 'launchpad',
                variant,
                mode,
                industry: detection.industry,
                detection,
                pages: generationResult.pages,
                duration: generationResult.duration,
                deployment: deployResult
              }),
              deployResult.urls?.frontend || null,
              deployResult.railwayProjectId || null
            ]
          );
        } catch (dbError) {
          console.warn('Failed to save deployment to database:', dbError.message);
        }
      }

      // Send final result
      sendEvent({
        type: 'complete',
        result: {
          success: true,
          businessName: generationResult.businessData.name,
          industry: detection.industryName,
          variant,
          mode,
          pages: Object.keys(generationResult.pages),
          projectDir: generationResult.projectDir,
          urls: deployResult.urls,
          railwayProjectId: deployResult.railwayProjectId,
          duration: {
            generation: generationResult.duration,
            total: deployResult.duration
          }
        }
      });

      res.end();

    } catch (error) {
      console.error('Launchpad deploy error:', error);

      sendEvent({
        type: 'error',
        error: error.message,
        phase: DEPLOY_PHASES?.FAILED || 'failed'
      });

      res.end();
    }
  });

  /**
   * POST /api/launchpad/quick
   * Quick one-click generation (uses defaults)
   *
   * Body: { input: "Mario's Pizza in Brooklyn" }
   */
  router.post('/quick', async (req, res) => {
    const { input } = req.body;

    if (!input) {
      return res.status(400).json({
        success: false,
        error: 'Input is required'
      });
    }

    console.log(`\n⚡ LAUNCHPAD Quick: "${input}"`);

    try {
      // Detect
      const detection = detectFromInput(input);

      // Generate with Layout A and test mode (fastest)
      const result = await generateSite(input, 'A', 'test', { enablePortal: true });

      res.json({
        success: true,
        message: `Generated ${result.businessData.name}`,
        detection,
        projectDir: result.projectDir,
        pages: Object.keys(result.pages),
        duration: result.duration,
        previewUrl: result.previewUrl,
        nextSteps: {
          preview: `Open ${result.projectDir}/frontend in browser`,
          deploy: 'POST /api/launchpad/deploy with same input',
          compare: 'POST /api/launchpad/generate-all to see all variants'
        }
      });
    } catch (error) {
      console.error('Quick generation error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/launchpad/project/:projectSlug
   * Get generated project info
   */
  router.get('/project/:projectSlug', (req, res) => {
    const { projectSlug } = req.params;

    const outputDir = path.join(__dirname, '../../output/launchpad');

    // Find matching project directories
    const dirs = fs.existsSync(outputDir)
      ? fs.readdirSync(outputDir).filter(d => d.startsWith(projectSlug))
      : [];

    if (dirs.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    const projects = dirs.map(dir => {
      const projectPath = path.join(outputDir, dir);
      const brainPath = path.join(projectPath, 'brain.json');

      let brain = null;
      if (fs.existsSync(brainPath)) {
        try {
          brain = JSON.parse(fs.readFileSync(brainPath, 'utf8'));
        } catch (e) {
          // ignore
        }
      }

      return {
        directory: dir,
        path: projectPath,
        brain,
        variant: dir.split('-').pop().toUpperCase(),
        created: fs.statSync(projectPath).mtime
      };
    });

    res.json({
      success: true,
      projectSlug,
      projects
    });
  });

  /**
   * POST /api/launchpad/preview
   * Build and serve a preview of a generated project (full-stack)
   *
   * Body: { projectDir: "path/to/project" }
   */
  router.post('/preview', async (req, res) => {
    const { projectDir } = req.body;

    if (!projectDir) {
      return res.status(400).json({
        success: false,
        error: 'projectDir is required'
      });
    }

    const frontendDir = path.join(projectDir, 'frontend');
    const backendDir = path.join(projectDir, 'backend');
    const hasBackend = fs.existsSync(backendDir) && fs.existsSync(path.join(backendDir, 'server.js'));

    if (!fs.existsSync(frontendDir)) {
      return res.status(404).json({
        success: false,
        error: 'Frontend directory not found'
      });
    }

    console.log(`\n👁️ LAUNCHPAD: Starting preview for ${projectDir}`);
    console.log(`   Full-stack: ${hasBackend ? 'Yes (backend detected)' : 'No (frontend only)'}`);

    try {
      const { spawn } = require('child_process');
      const net = require('net');

      const isPortAvailable = (p) => new Promise(resolve => {
        const server = net.createServer();
        server.once('error', () => resolve(false));
        server.once('listening', () => {
          server.close();
          resolve(true);
        });
        server.listen(p);
      });

      let backendPort = null;

      // ============================================
      // START BACKEND (if exists)
      // ============================================
      if (hasBackend) {
        // Install backend dependencies if needed
        const backendNodeModules = path.join(backendDir, 'node_modules');
        if (!fs.existsSync(backendNodeModules)) {
          console.log('   Installing backend dependencies...');
          await new Promise((resolve, reject) => {
            const npm = spawn('npm', ['install'], {
              cwd: backendDir,
              shell: true
            });
            npm.on('close', code => code === 0 ? resolve() : reject(new Error('Backend npm install failed')));
            npm.on('error', reject);
          });
        }

        // Find available port for backend
        backendPort = 3001;
        while (!(await isPortAvailable(backendPort)) && backendPort < 3100) {
          backendPort++;
        }

        // Start backend server
        console.log(`   Starting backend server on port ${backendPort}...`);
        const backend = spawn('node', ['server.js'], {
          cwd: backendDir,
          shell: true,
          detached: true,
          stdio: 'ignore',
          env: { ...process.env, PORT: backendPort.toString() }
        });
        backend.unref();

        // Give backend time to start
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log(`   ✅ Backend running at http://localhost:${backendPort}`);
      }

      // ============================================
      // START FRONTEND
      // ============================================

      // Install frontend dependencies if needed
      const nodeModulesPath = path.join(frontendDir, 'node_modules');
      if (!fs.existsSync(nodeModulesPath)) {
        console.log('   Installing frontend dependencies...');
        await new Promise((resolve, reject) => {
          const npm = spawn('npm', ['install'], {
            cwd: frontendDir,
            shell: true
          });
          npm.on('close', code => code === 0 ? resolve() : reject(new Error('npm install failed')));
          npm.on('error', reject);
        });
      }

      // Find an available port for frontend
      const basePort = 5200;
      let port = basePort;

      while (!(await isPortAvailable(port)) && port < basePort + 100) {
        port++;
      }

      // Create .env file for frontend to know backend URL
      if (hasBackend) {
        const envContent = `VITE_API_URL=http://localhost:${backendPort}\n`;
        fs.writeFileSync(path.join(frontendDir, '.env'), envContent);
      }

      // Start vite dev server
      console.log(`   Starting frontend server on port ${port}...`);
      const vite = spawn('npm', ['run', 'dev', '--', '--port', port.toString()], {
        cwd: frontendDir,
        shell: true,
        detached: true,
        stdio: 'ignore'
      });
      vite.unref();

      // Give it a moment to start
      await new Promise(resolve => setTimeout(resolve, 2000));

      const previewUrl = `http://localhost:${port}`;
      console.log(`   ✅ Frontend available at ${previewUrl}`);

      if (hasBackend) {
        console.log(`\n   🔐 Demo accounts:`);
        console.log(`      demo@demo.com / admin123`);
        console.log(`      admin@demo.com / admin123`);
      }

      res.json({
        success: true,
        previewUrl,
        port,
        backendPort: hasBackend ? backendPort : null,
        backendUrl: hasBackend ? `http://localhost:${backendPort}` : null,
        projectDir,
        fullStack: hasBackend,
        message: hasBackend ? 'Full-stack preview started' : 'Frontend preview started',
        demoAccounts: hasBackend ? [
          { email: 'demo@demo.com', password: 'admin123' },
          { email: 'admin@demo.com', password: 'admin123' }
        ] : null
      });

    } catch (error) {
      console.error('Preview error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/launchpad/preview-all
   * Start preview servers for multiple projects (for side-by-side comparison)
   *
   * Body: {
   *   projects: [
   *     { style: 'photo-grid', projectDir: '/path/to/project' },
   *     { style: 'elegant-list', projectDir: '/path/to/project' },
   *     ...
   *   ]
   * }
   */
  router.post('/preview-all', async (req, res) => {
    const { projects } = req.body;

    if (!projects || !Array.isArray(projects) || projects.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'projects array is required'
      });
    }

    console.log(`\n🖥️ LAUNCHPAD: Starting ${projects.length} preview servers for comparison`);

    const { spawn } = require('child_process');
    const net = require('net');

    const isPortAvailable = (p) => new Promise(resolve => {
      const server = net.createServer();
      server.once('error', () => resolve(false));
      server.once('listening', () => {
        server.close();
        resolve(true);
      });
      server.listen(p);
    });

    const urls = {};
    let basePort = 5200;

    try {
      for (const project of projects) {
        const { style, projectDir } = project;
        const frontendDir = path.join(projectDir, 'frontend');

        if (!fs.existsSync(frontendDir)) {
          console.log(`   ⚠️ Skipping ${style}: frontend not found`);
          continue;
        }

        console.log(`   Starting ${style}...`);

        // Install dependencies if needed
        const nodeModulesPath = path.join(frontendDir, 'node_modules');
        if (!fs.existsSync(nodeModulesPath)) {
          console.log(`   Installing dependencies for ${style}...`);
          await new Promise((resolve, reject) => {
            const npm = spawn('npm', ['install'], {
              cwd: frontendDir,
              shell: true
            });
            npm.on('close', code => code === 0 ? resolve() : reject(new Error(`npm install failed for ${style}`)));
            npm.on('error', reject);
          });
        }

        // Find available port
        while (!(await isPortAvailable(basePort)) && basePort < 5400) {
          basePort++;
        }

        const port = basePort;
        basePort++; // Reserve for next project

        // Start vite dev server
        const vite = spawn('npm', ['run', 'dev', '--', '--port', port.toString()], {
          cwd: frontendDir,
          shell: true,
          detached: true,
          stdio: 'ignore'
        });
        vite.unref();

        urls[style] = `http://localhost:${port}`;
        console.log(`   ✅ ${style} → http://localhost:${port}`);
      }

      // Give servers time to start
      await new Promise(resolve => setTimeout(resolve, 2500));

      res.json({
        success: true,
        urls,
        count: Object.keys(urls).length,
        message: `Started ${Object.keys(urls).length} preview servers`
      });

    } catch (error) {
      console.error('Preview-all error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/launchpad/run
   * Run a generated project (frontend + backend + admin)
   *
   * Body: { projectDir: "path/to/project" }
   */
  router.post('/run', async (req, res) => {
    const { projectDir } = req.body;

    if (!projectDir) {
      return res.status(400).json({
        success: false,
        error: 'projectDir is required'
      });
    }

    const frontendDir = path.join(projectDir, 'frontend');
    const backendDir = path.join(projectDir, 'backend');
    const adminDir = path.join(projectDir, 'admin');

    if (!fs.existsSync(frontendDir)) {
      return res.status(404).json({
        success: false,
        error: `Project not found at ${frontendDir}`
      });
    }

    console.log(`\n🚀 LAUNCHPAD: Running full project from ${projectDir}`);

    try {
      const { spawn, exec } = require('child_process');
      const net = require('net');
      const isWindows = process.platform === 'win32';

      const isPortAvailable = (p) => new Promise(resolve => {
        const server = net.createServer();
        server.once('error', () => resolve(false));
        server.once('listening', () => {
          server.close();
          resolve(true);
        });
        server.listen(p);
      });

      // Helper to run npm install
      const npmInstall = (dir, name) => new Promise((resolve, reject) => {
        console.log(`   Installing ${name} dependencies...`);
        const proc = spawn(isWindows ? 'npm.cmd' : 'npm', ['install'], {
          cwd: dir,
          shell: true,
          stdio: ['ignore', 'pipe', 'pipe']
        });
        let stderr = '';
        proc.stderr.on('data', d => stderr += d.toString());
        proc.on('close', code => {
          if (code === 0) resolve();
          else reject(new Error(`${name} npm install failed: ${stderr.slice(-200)}`));
        });
        proc.on('error', err => reject(new Error(`${name} spawn error: ${err.message}`)));
      });

      // Helper to start a dev server
      const startServer = (dir, name, port, cmd, args) => {
        console.log(`   Starting ${name} on port ${port}...`);
        const proc = spawn(isWindows ? cmd + '.cmd' : cmd, args, {
          cwd: dir,
          shell: true,
          detached: !isWindows,
          stdio: 'ignore',
          env: { ...process.env, PORT: port.toString() }
        });
        if (!isWindows) proc.unref();
        return proc;
      };

      const urls = {};
      const processes = [];

      // ============================================
      // INSTALL ROOT DEPENDENCIES (for concurrently)
      // ============================================
      const rootPackageJson = path.join(projectDir, 'package.json');
      const rootNodeModules = path.join(projectDir, 'node_modules');

      if (fs.existsSync(rootPackageJson) && !fs.existsSync(rootNodeModules)) {
        await npmInstall(projectDir, 'root');
      }

      // ============================================
      // START BACKEND (port 5001)
      // ============================================
      if (fs.existsSync(backendDir) && fs.existsSync(path.join(backendDir, 'server.js'))) {
        const backendNodeModules = path.join(backendDir, 'node_modules');
        if (!fs.existsSync(backendNodeModules)) {
          await npmInstall(backendDir, 'backend');
        }

        let backendPort = 5001;
        while (!(await isPortAvailable(backendPort)) && backendPort < 5010) {
          backendPort++;
        }

        const backend = startServer(backendDir, 'backend', backendPort, 'node', ['server.js']);
        processes.push({ name: 'backend', pid: backend.pid });
        urls.backend = `http://localhost:${backendPort}`;
        urls.api = `http://localhost:${backendPort}/api`;

        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log(`   ✅ Backend running at ${urls.backend}`);
      }

      // ============================================
      // START FRONTEND (port 5000)
      // ============================================
      const frontendNodeModules = path.join(frontendDir, 'node_modules');
      if (!fs.existsSync(frontendNodeModules)) {
        await npmInstall(frontendDir, 'frontend');
      }

      let frontendPort = 5000;
      while (!(await isPortAvailable(frontendPort)) && frontendPort < 5001) {
        frontendPort++;
      }

      // Write .env for frontend API URL
      if (urls.backend) {
        fs.writeFileSync(path.join(frontendDir, '.env'), `VITE_API_URL=${urls.backend}\n`);
      }

      const frontend = startServer(frontendDir, 'frontend', frontendPort, 'npm', ['run', 'dev', '--', '--port', frontendPort.toString()]);
      processes.push({ name: 'frontend', pid: frontend.pid });
      urls.frontend = `http://localhost:${frontendPort}`;

      // ============================================
      // START ADMIN DASHBOARD (port 5002)
      // ============================================
      if (fs.existsSync(adminDir) && fs.existsSync(path.join(adminDir, 'package.json'))) {
        const adminNodeModules = path.join(adminDir, 'node_modules');
        if (!fs.existsSync(adminNodeModules)) {
          await npmInstall(adminDir, 'admin');
        }

        let adminPort = 5002;
        while (!(await isPortAvailable(adminPort)) && adminPort < 5010) {
          adminPort++;
        }

        // Write .env for admin API URL
        if (urls.backend) {
          fs.writeFileSync(path.join(adminDir, '.env'), `VITE_API_URL=${urls.backend}\n`);
        }

        const admin = startServer(adminDir, 'admin', adminPort, 'npm', ['run', 'dev', '--', '--port', adminPort.toString()]);
        processes.push({ name: 'admin', pid: admin.pid });
        urls.admin = `http://localhost:${adminPort}`;
      }

      // Give servers time to start
      await new Promise(resolve => setTimeout(resolve, 2500));

      console.log(`\n   ✅ All services running:`);
      console.log(`      Frontend: ${urls.frontend}`);
      if (urls.backend) console.log(`      Backend:  ${urls.backend}`);
      if (urls.admin) console.log(`      Admin:    ${urls.admin}`);

      res.json({
        success: true,
        urls,
        processes,
        projectDir,
        message: 'All services started successfully',
        demoAccounts: urls.backend ? [
          { email: 'demo@demo.com', password: 'admin123', role: 'User' },
          { email: 'admin@demo.com', password: 'admin123', role: 'Admin' }
        ] : null
      });

    } catch (error) {
      console.error('Run error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/launchpad/open-folder
   * Open project folder in file explorer
   */
  router.post('/open-folder', (req, res) => {
    const { projectDir } = req.body;

    if (!projectDir || !fs.existsSync(projectDir)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid project directory'
      });
    }

    const { exec } = require('child_process');
    const command = process.platform === 'win32'
      ? `explorer "${projectDir}"`
      : process.platform === 'darwin'
        ? `open "${projectDir}"`
        : `xdg-open "${projectDir}"`;

    exec(command, (error) => {
      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }
      res.json({ success: true });
    });
  });

  /**
   * POST /api/launchpad/open-vscode
   * Open project in VS Code
   */
  router.post('/open-vscode', (req, res) => {
    const { projectDir } = req.body;

    if (!projectDir || !fs.existsSync(projectDir)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid project directory'
      });
    }

    const { exec } = require('child_process');
    exec(`code "${projectDir}"`, (error) => {
      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }
      res.json({ success: true });
    });
  });

  return router;
}

module.exports = { createLaunchpadRoutes };
