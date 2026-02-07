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
  const { deployService, getDb = () => null } = deps;

  // Initialize deploy service if available
  let oneClickService = null;
  if (process.env.RAILWAY_TOKEN && process.env.GITHUB_TOKEN) {
    oneClickService = createOneClickDeployService({
      deployService,
      db: null, // db resolved at runtime via getDb()
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
    if (moodSliders && Object.keys(moodSliders).length > 0) {
      console.log(`   Mood Sliders: vibe=${moodSliders.vibe || '-'} energy=${moodSliders.energy || '-'} era=${moodSliders.era || '-'} density=${moodSliders.density || '-'} price=${moodSliders.price || '-'} theme=${moodSliders.theme || '-'}`);
    }
    if (businessData?.logo) {
      console.log(`   Logo: ${businessData.logo}`);
    }
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
      if (getDb() && result.success) {
        try {
          const insertResult = await getDb().query(
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

      // Use the project root directory (contains backend/, frontend/, admin/)
      const projectName = generationResult.projectSlug;

      const deployResult = await oneClickService.deploy({
        projectPath: generationResult.projectDir,
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
      if (getDb() && deployResult.success) {
        try {
          await getDb().query(
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

  // ============================================
  // THE 19 SHOWCASE INDUSTRY PROMPTS
  // ============================================
  const SHOWCASE_PROMPTS = [
    { input: "Sals Brick Oven Pizza on Arthur Ave Bronx NY", industry: 'pizza-restaurant' },
    { input: "The Capital Grille on E 42nd St NYC", industry: 'steakhouse' },
    { input: "Blue Bottle Coffee on Berry St Brooklyn NY", industry: 'coffee-cafe' },
    { input: "Harvest Table on Main St Hudson NY", industry: 'restaurant' },
    { input: "Magnolia Bakery on Bleecker St NYC", industry: 'bakery' },
    { input: "Glow Beauty Spa on Madison Ave NYC", industry: 'salon-spa' },
    { input: "Iron Works Gym on 3rd Ave NYC", industry: 'fitness-gym' },
    { input: "Bright Smile Dental on Court St Brooklyn NY", industry: 'dental' },
    { input: "Westside Family Medicine on Broadway NYC", industry: 'healthcare' },
    { input: "Lotus Flow Yoga on Smith St Brooklyn NY", industry: 'yoga' },
    { input: "Classic Cuts Barbershop on 5th Ave Park Slope Brooklyn", industry: 'barbershop' },
    { input: "Sterling & Associates on Wall St NYC", industry: 'law-firm' },
    { input: "Skyline Realty on Park Ave NYC", industry: 'real-estate' },
    { input: "FastFlow Plumbing on Atlantic Ave Brooklyn NY", industry: 'plumber' },
    { input: "Sparkle Clean Co on Fulton St Brooklyn NY", industry: 'cleaning' },
    { input: "Precision Auto Repair on Northern Blvd Queens NY", industry: 'auto-shop' },
    { input: "Taskflow Project Management App San Francisco CA", industry: 'saas' },
    { input: "Urban Thread Clothing on Broadway SoHo NYC", industry: 'ecommerce' },
    { input: "Bright Minds Academy on Prospect Park West Brooklyn NY", industry: 'school' }
  ];

  /**
   * GET /api/launchpad/showcase-prompts
   * Return the 19 hardcoded showcase prompts
   */
  router.get('/showcase-prompts', (req, res) => {
    res.json({ success: true, prompts: SHOWCASE_PROMPTS });
  });

  /**
   * POST /api/launchpad/deploy-batch
   * Generate + Deploy multiple sites with SSE streaming
   *
   * Body: { prompts: [{ input, variant }] } — or omit to use all 19 showcase prompts
   */
  router.post('/deploy-batch', async (req, res) => {
    const { prompts, variant = 'A' } = req.body;
    const batchPrompts = (prompts && prompts.length > 0)
      ? prompts
      : SHOWCASE_PROMPTS.map(p => ({ input: p.input, variant }));

    // Check deploy service
    if (!oneClickService || !oneClickService.isReady()) {
      return res.status(503).json({
        success: false,
        error: 'Deploy service not configured. Check RAILWAY_TOKEN and GITHUB_TOKEN.'
      });
    }

    const batchId = `showcase-${Date.now()}`;
    console.log(`\n🎯 SHOWCASE BATCH: Deploying ${batchPrompts.length} sites (batch ${batchId})`);

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    let clientDisconnected = false;
    req.on('close', () => { clientDisconnected = true; });

    const sendEvent = (data) => {
      if (clientDisconnected) return;
      try {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      } catch (e) {
        clientDisconnected = true;
      }
    };

    sendEvent({
      type: 'batch-start',
      batchId,
      total: batchPrompts.length,
      message: `Starting batch generation of ${batchPrompts.length} sites`
    });

    const results = [];

    for (let i = 0; i < batchPrompts.length; i++) {
      const prompt = batchPrompts[i];
      const siteInput = prompt.input;
      const siteVariant = (prompt.variant || variant || 'A').toUpperCase();

      sendEvent({
        type: 'site-start',
        index: i,
        total: batchPrompts.length,
        input: siteInput,
        percent: Math.round((i / batchPrompts.length) * 100)
      });

      try {
        // Generate
        const genResult = await generateSite(siteInput, siteVariant, 'test', {
          enablePortal: true
        });

        if (!genResult.success) {
          throw new Error('Generation failed: ' + (genResult.error || 'Unknown'));
        }

        // Insert preliminary DB record NOW so card appears in grid immediately
        let demoRecordId = null;
        if (getDb()) {
          try {
            const insertResult = await getDb().query(
              `INSERT INTO generated_projects
                (name, industry, status, is_demo, demo_batch_id, metadata)
               VALUES ($1,$2,'deploying',TRUE,$3,$4) RETURNING id`,
              [
                genResult.businessData.name,
                genResult.detection.industry,
                batchId,
                JSON.stringify({
                  source: 'showcase-batch',
                  variant: siteVariant,
                  industry: genResult.detection.industry,
                  detection: genResult.detection,
                  pages: Object.keys(genResult.pages),
                  metrics: genResult.metrics,
                  duration: genResult.duration,
                  tagline: genResult.businessData.tagline,
                  location: genResult.businessData.location
                })
              ]
            );
            demoRecordId = (insertResult.rows || insertResult)[0]?.id;
            console.log(`   📊 DB: Pre-saved demo record #${demoRecordId} for ${genResult.businessData.name}`);
          } catch (dbErr) {
            console.warn(`   ⚠️ DB pre-save failed for ${genResult.businessData.name}:`, dbErr.message);
          }
        }

        sendEvent({
          type: 'site-generated',
          index: i,
          name: genResult.businessData.name,
          industry: genResult.detection.industry,
          metrics: genResult.metrics,
          percent: Math.round(((i + 0.4) / batchPrompts.length) * 100)
        });

        // Deploy
        const deployResult = await oneClickService.deploy({
          projectPath: genResult.projectDir,
          projectName: genResult.projectSlug,
          adminEmail: 'admin@be1st.io',
          appType: 'website'
        }, (progress) => {
          sendEvent({
            type: 'site-deploy-progress',
            index: i,
            name: genResult.businessData.name,
            message: progress.message || 'Deploying...',
            percent: Math.round(((i + 0.4 + (progress.percent || 0) / 100 * 0.55) / batchPrompts.length) * 100)
          });
        });

        // Update the DB record with full deploy info
        const siteResult = {
          success: true,
          name: genResult.businessData.name,
          industry: genResult.detection.industry,
          urls: deployResult.urls || {},
          metrics: genResult.metrics,
          duration: genResult.duration
        };

        if (getDb() && demoRecordId) {
          try {
            const urls = deployResult.urls || {};
            await getDb().query(
              `UPDATE generated_projects SET
                status = $1, domain = $2, frontend_url = $3, admin_url = $4, backend_url = $5,
                github_frontend = $6, github_backend = $7, github_admin = $8,
                railway_project_id = $9, railway_project_url = $10,
                metadata = $11, deployed_at = NOW()
               WHERE id = $12`,
              [
                deployResult.success ? 'deployed' : 'failed',
                urls.frontend?.replace('https://', '').replace('http://', '') || null,
                urls.frontend || null,
                urls.admin || null,
                urls.backend || null,
                urls.githubFrontend || null,
                urls.githubBackend || null,
                urls.githubAdmin || null,
                deployResult.railwayProjectId || null,
                urls.railway || null,
                JSON.stringify({
                  source: 'showcase-batch',
                  variant: siteVariant,
                  industry: genResult.detection.industry,
                  detection: genResult.detection,
                  pages: Object.keys(genResult.pages),
                  metrics: genResult.metrics,
                  duration: genResult.duration,
                  deployDuration: deployResult.duration,
                  tagline: genResult.businessData.tagline,
                  location: genResult.businessData.location,
                  railwayFrontend: urls.railwayFrontend || null,
                  railwayBackend: urls.railwayBackend || null,
                  railwayAdmin: urls.railwayAdmin || null
                }),
                demoRecordId
              ]
            );
            console.log(`   📊 DB: Updated demo record #${demoRecordId} → deployed`);
          } catch (dbErr) {
            console.warn(`   ⚠️ DB update failed for ${genResult.businessData.name}:`, dbErr.message);
          }
        } else if (getDb() && !demoRecordId) {
          // Fallback: pre-save didn't work, insert fresh
          try {
            const urls = deployResult.urls || {};
            await getDb().query(
              `INSERT INTO generated_projects
                (name, industry, status, domain, frontend_url, admin_url, backend_url,
                 github_frontend, github_backend, github_admin,
                 railway_project_id, railway_project_url,
                 is_demo, demo_batch_id, metadata, deployed_at)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,TRUE,$13,$14,NOW())`,
              [
                genResult.businessData.name,
                genResult.detection.industry,
                deployResult.success ? 'deployed' : 'failed',
                urls.frontend?.replace('https://', '').replace('http://', '') || null,
                urls.frontend || null,
                urls.admin || null,
                urls.backend || null,
                urls.githubFrontend || null,
                urls.githubBackend || null,
                urls.githubAdmin || null,
                deployResult.railwayProjectId || null,
                urls.railway || null,
                batchId,
                JSON.stringify({
                  source: 'showcase-batch',
                  variant: siteVariant,
                  industry: genResult.detection.industry,
                  detection: genResult.detection,
                  pages: Object.keys(genResult.pages),
                  metrics: genResult.metrics,
                  duration: genResult.duration,
                  deployDuration: deployResult.duration,
                  tagline: genResult.businessData.tagline,
                  location: genResult.businessData.location,
                  railwayFrontend: urls.railwayFrontend || null,
                  railwayBackend: urls.railwayBackend || null,
                  railwayAdmin: urls.railwayAdmin || null
                })
              ]
            );
          } catch (dbErr) {
            console.warn(`   ⚠️ DB fallback save failed:`, dbErr.message);
          }
        }

        results.push(siteResult);

        sendEvent({
          type: 'site-complete',
          index: i,
          total: batchPrompts.length,
          result: siteResult,
          percent: Math.round(((i + 1) / batchPrompts.length) * 100)
        });

      } catch (err) {
        console.error(`Batch site ${i} failed:`, err.message);
        const failResult = { success: false, input: siteInput, error: err.message };
        results.push(failResult);

        // Save failed record too
        if (getDb()) {
          try {
            const detection = detectFromInput(siteInput);
            await getDb().query(
              `INSERT INTO generated_projects (name, industry, status, is_demo, demo_batch_id, metadata)
               VALUES ($1, $2, 'failed', TRUE, $3, $4)`,
              [
                siteInput.split(' on ')[0] || siteInput,
                detection.industry,
                batchId,
                JSON.stringify({ source: 'showcase-batch', error: err.message })
              ]
            );
            console.log(`   📊 DB: Saved failed record for ${siteInput}`);
          } catch (dbErr) {
            console.warn(`   ⚠️ DB save failed:`, dbErr.message);
          }
        }

        sendEvent({
          type: 'site-failed',
          index: i,
          total: batchPrompts.length,
          input: siteInput,
          error: err.message,
          percent: Math.round(((i + 1) / batchPrompts.length) * 100)
        });
      }
    }

    // Final summary
    const succeeded = results.filter(r => r.success).length;
    console.log(`\n🎯 SHOWCASE BATCH COMPLETE: ${succeeded}/${batchPrompts.length} succeeded (batch ${batchId})`);

    sendEvent({
      type: 'batch-complete',
      batchId,
      total: batchPrompts.length,
      succeeded,
      failed: batchPrompts.length - succeeded,
      results,
      percent: 100
    });

    if (!clientDisconnected) {
      try { res.end(); } catch (e) { /* client gone */ }
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

      // Wait for server to respond on health endpoint (up to 15s)
      const waitForServer = async (port, maxWaitMs = 15000) => {
        const start = Date.now();
        const http = require('http');
        while (Date.now() - start < maxWaitMs) {
          const ok = await new Promise(resolve => {
            const req = http.get(`http://localhost:${port}/health`, res => {
              resolve(res.statusCode === 200);
            });
            req.on('error', () => resolve(false));
            req.setTimeout(1000, () => { req.destroy(); resolve(false); });
          });
          if (ok) return true;
          await new Promise(r => setTimeout(r, 300));
        }
        return false;
      };

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

        // Wait for backend to actually respond
        const backendReady = await waitForServer(backendPort);
        if (backendReady) {
          console.log(`   ✅ Backend running at http://localhost:${backendPort}`);
        } else {
          console.log(`   ⚠️ Backend may still be starting at http://localhost:${backendPort}`);
        }
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

      // Wait for server to respond on health endpoint (up to 15s)
      const waitForServer = async (port, maxWaitMs = 15000) => {
        const start = Date.now();
        const http = require('http');
        while (Date.now() - start < maxWaitMs) {
          const ok = await new Promise(resolve => {
            const req = http.get(`http://localhost:${port}/health`, res => {
              resolve(res.statusCode === 200);
            });
            req.on('error', () => resolve(false));
            req.setTimeout(1000, () => { req.destroy(); resolve(false); });
          });
          if (ok) return true;
          await new Promise(r => setTimeout(r, 300));
        }
        return false;
      };

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
        // On Windows: npm → npm.cmd, but node stays as node (no .cmd wrapper)
        const resolvedCmd = isWindows && cmd !== 'node' ? cmd + '.cmd' : cmd;
        const proc = spawn(resolvedCmd, args, {
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
      let backendPort = 5001;

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

        backendPort = 5001;
        while (!(await isPortAvailable(backendPort)) && backendPort < 5010) {
          backendPort++;
        }

        const backend = startServer(backendDir, 'backend', backendPort, 'node', ['server.js']);
        processes.push({ name: 'backend', pid: backend.pid });
        urls.backend = `http://localhost:${backendPort}`;
        urls.api = `http://localhost:${backendPort}/api`;

        const backendReady = await waitForServer(backendPort);
        if (backendReady) {
          console.log(`   ✅ Backend running at ${urls.backend}`);
        } else {
          console.log(`   ⚠️ Backend may still be starting at ${urls.backend}`);
        }
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

      // Write .env for frontend proxy target (NOT VITE_ prefixed to avoid client exposure)
      if (urls.backend) {
        fs.writeFileSync(path.join(frontendDir, '.env'), `API_TARGET=${urls.backend}\n`);
      }

      const frontend = startServer(frontendDir, 'frontend', frontendPort, 'npm', ['run', 'dev', '--', '--port', frontendPort.toString()]);
      processes.push({ name: 'frontend', pid: frontend.pid });
      urls.frontend = `http://localhost:${frontendPort}`;

      // ============================================
      // START ADMIN DASHBOARD (port 5002+)
      // ============================================
      if (fs.existsSync(adminDir) && fs.existsSync(path.join(adminDir, 'package.json'))) {
        const adminNodeModules = path.join(adminDir, 'node_modules');
        if (!fs.existsSync(adminNodeModules)) {
          await npmInstall(adminDir, 'admin');
        }

        // Start above backend port to avoid collision
        let adminPort = Math.max(5002, (backendPort || 5001) + 1);
        while (!(await isPortAvailable(adminPort)) && adminPort < 5020) {
          adminPort++;
        }

        // Write .env for admin proxy target (NOT VITE_ prefixed to avoid client exposure)
        if (urls.backend) {
          fs.writeFileSync(path.join(adminDir, '.env'), `API_TARGET=${urls.backend}\n`);
        }

        const admin = startServer(adminDir, 'admin', adminPort, 'npm', ['run', 'dev', '--', '--port', adminPort.toString()]);
        processes.push({ name: 'admin', pid: admin.pid });
        urls.admin = `http://localhost:${adminPort}`;
      }

      // Wait for backend to be fully ready before declaring success
      if (urls.backend) {
        console.log('   Waiting for backend to be fully ready...');
        const finalReady = await waitForServer(backendPort, 30000);
        if (finalReady) {
          console.log('   ✅ Backend confirmed ready');
        } else {
          console.log('   ⚠️ Backend health check timed out, continuing anyway');
        }
      }

      // Give frontend/admin vite servers time to compile
      await new Promise(resolve => setTimeout(resolve, 3000));

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

  // ============================================
  // GET /demos - Public demo listing (no auth required)
  // Used by DemoTrackerPage which runs in skipAuth mode
  // ============================================
  router.get('/demos', async (req, res) => {
    const db = getDb();
    if (!db) return res.json({ success: true, demos: [], batches: [] });
    try {
      const demos = await db.query(`
        SELECT id, name, industry, status, domain, frontend_url, admin_url, backend_url,
               github_frontend, github_backend, github_admin,
               railway_project_id, railway_project_url,
               is_demo, demo_batch_id, metadata, deployed_at, created_at
        FROM generated_projects WHERE is_demo = true
        ORDER BY created_at DESC
      `);
      // Aggregate metrics
      let totalLines = 0, totalFiles = 0, totalPages = 0;
      for (const row of demos.rows) {
        const meta = typeof row.metadata === 'string' ? JSON.parse(row.metadata) : (row.metadata || {});
        if (meta.metrics) {
          totalLines += meta.metrics.totalLines || 0;
          totalFiles += meta.metrics.totalFiles || 0;
          totalPages += meta.metrics.frontendPages || 0;
        }
      }
      res.json({
        success: true,
        demos: demos.rows,
        batches: [],
        metrics: {
          totalSites: demos.rows.length,
          totalApps: demos.rows.length * 3,
          totalLines,
          totalFiles,
          totalPages,
          avgGenTime: 0
        }
      });
    } catch (err) {
      console.error('Error fetching demos:', err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // DELETE /demos/all - Delete all demos (no auth, dev tool)
  // Must be registered BEFORE /demos/:id so Express doesn't match "all" as an :id param
  router.delete('/demos/all', async (req, res) => {
    const db = getDb();
    if (!db) return res.json({ success: false, error: 'No database' });
    try {
      const demos = await db.query('SELECT id, name, domain FROM generated_projects WHERE is_demo = true');
      const { deleteProject } = require('../services/project-deleter.cjs');
      let deleted = 0;
      for (const demo of demos.rows) {
        const subdomain = (demo.domain || '').replace('.be1st.io', '');
        if (subdomain) {
          try { await deleteProject(subdomain, { force: true, skipVerification: true }); } catch (e) { console.warn('Delete error:', e.message); }
        }
        await db.query('DELETE FROM generated_projects WHERE id = $1', [demo.id]);
        deleted++;
      }
      res.json({ success: true, deleted });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // DELETE /demos/:id - Delete single demo (no auth, dev tool)
  router.delete('/demos/:id', async (req, res) => {
    const db = getDb();
    if (!db) return res.json({ success: false, error: 'No database' });
    try {
      const { id } = req.params;
      const row = await db.query('SELECT name, domain FROM generated_projects WHERE id = $1', [id]);
      if (row.rows.length === 0) return res.json({ success: false, error: 'Not found' });
      const subdomain = (row.rows[0].domain || '').replace('.be1st.io', '');
      if (subdomain && deployService) {
        const { deleteProject } = require('../services/project-deleter.cjs');
        try { await deleteProject(subdomain, { force: true, skipVerification: true }); } catch (e) { console.warn('Delete error:', e.message); }
      }
      await db.query('DELETE FROM generated_projects WHERE id = $1', [id]);
      res.json({ success: true, deleted: 1 });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
}

module.exports = { createLaunchpadRoutes };
