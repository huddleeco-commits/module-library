/**
 * QA SUITE ROUTES
 *
 * Batch generation and comparison testing for all 19 industries.
 *
 * Endpoints:
 * - GET  /api/qa-suite/industries       - List all industries with generation status
 * - POST /api/qa-suite/generate-all     - Generate all industries (batch)
 * - POST /api/qa-suite/generate/:id     - Generate single industry
 * - GET  /api/qa-suite/status           - Get batch generation status
 * - GET  /api/qa-suite/preview/:id/:view - Get iframe URL for preview
 * - GET  /api/qa-suite/issues           - Get all flagged issues
 * - POST /api/qa-suite/issues           - Flag a new issue
 * - PUT  /api/qa-suite/issues/:id       - Update issue status
 * - DELETE /api/qa-suite/issues/:id     - Delete an issue
 * - GET  /api/qa-suite/audit-report     - Export audit report for Claude
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

// Launchpad engine
const {
  generateSite
} = require('../services/launchpad-engine.cjs');

// Industry modules config
const { INDUSTRY_MODULES, MODULE_LABELS, getIndustryModules } = require('../../config/industry-modules.cjs');

/**
 * Sample business data for each industry
 */
const SAMPLE_BUSINESSES = {
  'pizza-restaurant': { name: "Mario's Pizzeria", location: "Brooklyn, NY", tagline: "Authentic Italian since 1985" },
  'steakhouse': { name: "Prime Cut Steakhouse", location: "Manhattan, NY", tagline: "Dry-aged perfection" },
  'coffee-cafe': { name: "Bean & Leaf Cafe", location: "Portland, OR", tagline: "Artisan coffee, fresh pastries" },
  'restaurant': { name: "The Garden Table", location: "Austin, TX", tagline: "Farm-to-table dining" },
  'bakery': { name: "Golden Crust Bakery", location: "Boston, MA", tagline: "Fresh baked daily" },
  'salon-spa': { name: "Luxe Beauty Spa", location: "Beverly Hills, CA", tagline: "Your wellness destination" },
  'barbershop': { name: "Classic Cuts Barbershop", location: "Chicago, IL", tagline: "Traditional grooming for modern men" },
  'dental': { name: "Bright Smile Dental", location: "Seattle, WA", tagline: "Your family dentist" },
  'yoga': { name: "Harmony Yoga Studio", location: "San Diego, CA", tagline: "Find your balance" },
  'fitness-gym': { name: "Iron Works Fitness", location: "Denver, CO", tagline: "Transform your body" },
  'law-firm': { name: "Parker & Associates", location: "Washington, DC", tagline: "Justice with integrity" },
  'healthcare': { name: "Wellness Medical Center", location: "Atlanta, GA", tagline: "Compassionate care" },
  'real-estate': { name: "Premier Properties", location: "Miami, FL", tagline: "Your dream home awaits" },
  'plumber': { name: "Reliable Plumbing Co", location: "Phoenix, AZ", tagline: "24/7 emergency service" },
  'cleaning': { name: "Sparkle Clean Services", location: "Dallas, TX", tagline: "We make it shine" },
  'auto-shop': { name: "Precision Auto Care", location: "Detroit, MI", tagline: "Expert mechanics you trust" },
  'saas': { name: "CloudFlow Analytics", location: "San Francisco, CA", tagline: "Data-driven decisions" },
  'ecommerce': { name: "Urban Style Shop", location: "New York, NY", tagline: "Curated fashion finds" },
  'school': { name: "Bright Futures Academy", location: "Nashville, TN", tagline: "Nurturing tomorrow's leaders" }
};

/**
 * Create QA Suite routes
 */
function createQASuiteRoutes() {
  const router = express.Router();

  // State for batch generation
  let batchStatus = {
    running: false,
    current: null,
    completed: [],
    failed: [],
    total: 0,
    startTime: null
  };

  // Issues storage (in-memory, persisted to file)
  const issuesFile = path.join(__dirname, '../../output/qa-suite/issues.json');
  let issues = [];

  // Load existing issues
  try {
    if (fs.existsSync(issuesFile)) {
      issues = JSON.parse(fs.readFileSync(issuesFile, 'utf8'));
    }
  } catch (e) {
    console.log('[QA Suite] No existing issues file');
  }

  function saveIssues() {
    const dir = path.dirname(issuesFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(issuesFile, JSON.stringify(issues, null, 2));
  }

  // Output directory for generated sites
  const outputDir = path.join(__dirname, '../../output/qa-suite/sites');

  /**
   * GET /api/qa-suite/industries
   * List all industries with their generation status
   */
  router.get('/industries', (req, res) => {
    const industries = Object.keys(INDUSTRY_MODULES).map(id => {
      const siteDir = path.join(outputDir, id);
      const exists = fs.existsSync(siteDir);
      const modules = getIndustryModules(id);
      const sample = SAMPLE_BUSINESSES[id];

      // Check what's generated
      let hasCustomer = false, hasAdmin = false, hasBackend = false;
      if (exists) {
        hasCustomer = fs.existsSync(path.join(siteDir, 'frontend'));
        hasAdmin = fs.existsSync(path.join(siteDir, 'admin'));
        hasBackend = fs.existsSync(path.join(siteDir, 'backend'));
      }

      // Count issues for this industry
      const issueCount = issues.filter(i => i.industry === id && i.status !== 'resolved').length;

      return {
        id,
        name: sample?.name || id,
        location: sample?.location || '',
        modules: Object.keys(modules),
        generated: exists,
        hasCustomer,
        hasAdmin,
        hasBackend,
        issueCount,
        generatedAt: exists ? fs.statSync(siteDir).mtime : null
      };
    });

    // Group by category
    const grouped = {
      food: industries.filter(i => ['pizza-restaurant', 'steakhouse', 'coffee-cafe', 'restaurant', 'bakery'].includes(i.id)),
      services: industries.filter(i => ['salon-spa', 'barbershop', 'dental', 'yoga', 'fitness-gym'].includes(i.id)),
      professional: industries.filter(i => ['law-firm', 'healthcare', 'real-estate'].includes(i.id)),
      trade: industries.filter(i => ['plumber', 'cleaning', 'auto-shop'].includes(i.id)),
      tech: industries.filter(i => ['saas', 'ecommerce', 'school'].includes(i.id))
    };

    res.json({
      success: true,
      total: industries.length,
      generated: industries.filter(i => i.generated).length,
      industries,
      grouped
    });
  });

  /**
   * POST /api/qa-suite/generate-all
   * Generate all 19 industries in batch
   */
  router.post('/generate-all', async (req, res) => {
    if (batchStatus.running) {
      return res.status(409).json({
        success: false,
        error: 'Batch generation already in progress',
        status: batchStatus
      });
    }

    const { force = false } = req.body;
    const industriesToGenerate = Object.keys(INDUSTRY_MODULES);

    // Reset status
    batchStatus = {
      running: true,
      current: null,
      completed: [],
      failed: [],
      total: industriesToGenerate.length,
      startTime: Date.now()
    };

    res.json({
      success: true,
      message: `Starting batch generation of ${industriesToGenerate.length} industries`,
      status: batchStatus
    });

    // Run generation in background
    (async () => {
      for (const industryId of industriesToGenerate) {
        batchStatus.current = industryId;

        try {
          const siteDir = path.join(outputDir, industryId);

          // Skip if already generated (unless force)
          if (!force && fs.existsSync(siteDir)) {
            batchStatus.completed.push({ id: industryId, skipped: true });
            continue;
          }

          // Load fixture and generate
          const sample = SAMPLE_BUSINESSES[industryId];
          const businessInput = `${sample?.name || industryId} - ${sample?.tagline || ''} in ${sample?.location || 'Test City, USA'}`;

          // Generate site using launchpad engine
          // generateSite(input, variant, mode, options)
          await generateSite(businessInput, 'A', 'test', {
            outputDir: siteDir,
            enablePortal: true
          });

          batchStatus.completed.push({ id: industryId, success: true });

        } catch (err) {
          console.error(`[QA Suite] Failed to generate ${industryId}:`, err.message);
          batchStatus.failed.push({ id: industryId, error: err.message });
        }
      }

      batchStatus.running = false;
      batchStatus.current = null;
      batchStatus.endTime = Date.now();

      console.log(`[QA Suite] Batch complete: ${batchStatus.completed.length} success, ${batchStatus.failed.length} failed`);
    })();
  });

  /**
   * POST /api/qa-suite/generate/:id
   * Generate a single industry
   */
  router.post('/generate/:id', async (req, res) => {
    const { id } = req.params;

    if (!INDUSTRY_MODULES[id]) {
      return res.status(404).json({ success: false, error: `Unknown industry: ${id}` });
    }

    try {
      const siteDir = path.join(outputDir, id);
      const sample = SAMPLE_BUSINESSES[id];
      const businessInput = `${sample?.name || id} - ${sample?.tagline || ''} in ${sample?.location || 'Test City, USA'}`;

      // Generate site using launchpad engine
      await generateSite(businessInput, 'A', 'test', {
        outputDir: siteDir,
        enablePortal: true
      });

      res.json({
        success: true,
        industry: id,
        outputDir: siteDir
      });

    } catch (err) {
      console.error(`[QA Suite] Failed to generate ${id}:`, err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  /**
   * GET /api/qa-suite/status
   * Get current batch generation status
   */
  router.get('/status', (req, res) => {
    res.json({
      success: true,
      status: batchStatus,
      elapsed: batchStatus.startTime ? Date.now() - batchStatus.startTime : 0
    });
  });

  /**
   * GET /api/qa-suite/preview/:id/:view
   * Get preview info for a generated site
   */
  router.get('/preview/:id/:view', (req, res) => {
    const { id, view } = req.params;
    const siteDir = path.join(outputDir, id);

    if (!fs.existsSync(siteDir)) {
      return res.status(404).json({ success: false, error: 'Site not generated yet' });
    }

    let previewPath;
    switch (view) {
      case 'customer':
        previewPath = path.join(siteDir, 'frontend');
        break;
      case 'admin':
        previewPath = path.join(siteDir, 'admin');
        break;
      case 'backend':
        previewPath = path.join(siteDir, 'backend');
        break;
      default:
        return res.status(400).json({ success: false, error: 'Invalid view type' });
    }

    if (!fs.existsSync(previewPath)) {
      return res.status(404).json({ success: false, error: `${view} not generated for this industry` });
    }

    // Return file listing for now (actual preview would need a dev server)
    const files = fs.readdirSync(previewPath);

    res.json({
      success: true,
      industry: id,
      view,
      path: previewPath,
      files,
      // Preview URL would be set up by a separate dev server
      previewUrl: `/qa-preview/${id}/${view}`
    });
  });

  /**
   * GET /api/qa-suite/issues
   * Get all flagged issues
   */
  router.get('/issues', (req, res) => {
    const { industry, status, severity } = req.query;

    let filtered = [...issues];
    if (industry) filtered = filtered.filter(i => i.industry === industry);
    if (status) filtered = filtered.filter(i => i.status === status);
    if (severity) filtered = filtered.filter(i => i.severity === parseInt(severity));

    res.json({
      success: true,
      total: filtered.length,
      issues: filtered
    });
  });

  /**
   * POST /api/qa-suite/issues
   * Flag a new issue
   */
  router.post('/issues', (req, res) => {
    const { industry, view, page, title, description, severity = 3, screenshot } = req.body;

    if (!industry || !title) {
      return res.status(400).json({ success: false, error: 'industry and title required' });
    }

    const issue = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      industry,
      view: view || 'customer',
      page: page || 'unknown',
      title,
      description: description || '',
      severity,
      status: 'open',
      screenshot: screenshot || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    issues.push(issue);
    saveIssues();

    res.status(201).json({ success: true, issue });
  });

  /**
   * PUT /api/qa-suite/issues/:id
   * Update an issue
   */
  router.put('/issues/:id', (req, res) => {
    const { id } = req.params;
    const idx = issues.findIndex(i => i.id === id);

    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Issue not found' });
    }

    const updates = req.body;
    issues[idx] = {
      ...issues[idx],
      ...updates,
      id: issues[idx].id, // Prevent ID change
      updatedAt: new Date().toISOString()
    };

    saveIssues();
    res.json({ success: true, issue: issues[idx] });
  });

  /**
   * DELETE /api/qa-suite/issues/:id
   * Delete an issue
   */
  router.delete('/issues/:id', (req, res) => {
    const { id } = req.params;
    const idx = issues.findIndex(i => i.id === id);

    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Issue not found' });
    }

    issues.splice(idx, 1);
    saveIssues();

    res.json({ success: true, deleted: id });
  });

  /**
   * GET /api/qa-suite/audit-report
   * Generate a markdown audit report for Claude
   */
  router.get('/audit-report', (req, res) => {
    const industries = Object.keys(INDUSTRY_MODULES);

    // Count stats
    const generated = industries.filter(id => fs.existsSync(path.join(outputDir, id))).length;
    const openIssues = issues.filter(i => i.status !== 'resolved');
    const criticalIssues = openIssues.filter(i => i.severity >= 4);

    // Group issues by industry
    const issuesByIndustry = {};
    openIssues.forEach(issue => {
      if (!issuesByIndustry[issue.industry]) issuesByIndustry[issue.industry] = [];
      issuesByIndustry[issue.industry].push(issue);
    });

    // Generate markdown report
    let report = `# QA AUDIT REPORT\n\n`;
    report += `Generated: ${new Date().toISOString()}\n\n`;
    report += `## Summary\n\n`;
    report += `- **Industries Generated:** ${generated}/${industries.length}\n`;
    report += `- **Open Issues:** ${openIssues.length}\n`;
    report += `- **Critical (Severity 4-5):** ${criticalIssues.length}\n\n`;

    if (openIssues.length > 0) {
      report += `## Issues by Industry\n\n`;

      Object.entries(issuesByIndustry).forEach(([industry, industryIssues]) => {
        report += `### ${industry} (${industryIssues.length} issues)\n\n`;

        industryIssues.forEach(issue => {
          const severityEmoji = issue.severity >= 4 ? '🔴' : issue.severity >= 3 ? '🟡' : '🟢';
          report += `${severityEmoji} **[${issue.view}/${issue.page}]** ${issue.title}\n`;
          if (issue.description) report += `   ${issue.description}\n`;
          report += `   _Severity: ${issue.severity}/5, ID: ${issue.id}_\n\n`;
        });
      });
    }

    // List industries not yet generated
    const notGenerated = industries.filter(id => !fs.existsSync(path.join(outputDir, id)));
    if (notGenerated.length > 0) {
      report += `## Not Yet Generated\n\n`;
      notGenerated.forEach(id => {
        report += `- ${id}\n`;
      });
      report += `\n`;
    }

    report += `---\n\n`;
    report += `_Copy this report and paste to Claude for analysis._\n`;

    // Return as markdown or JSON
    if (req.query.format === 'json') {
      res.json({
        success: true,
        summary: {
          generated,
          total: industries.length,
          openIssues: openIssues.length,
          criticalIssues: criticalIssues.length
        },
        issuesByIndustry,
        notGenerated,
        report
      });
    } else {
      res.type('text/markdown').send(report);
    }
  });

  return router;
}

module.exports = { createQASuiteRoutes };
