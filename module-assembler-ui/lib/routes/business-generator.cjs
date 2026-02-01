/**
 * Business Generator API Routes
 *
 * Simplified, unified API for generating complete business presences.
 * Replaces the fragmented smart-template approach with a clean, single-endpoint design.
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const BusinessGenerator = require('../services/BusinessGenerator.cjs');

// Load config for industry listing
function loadConfig() {
  const configPath = path.join(__dirname, '..', 'config', 'business-templates.json');
  return JSON.parse(require('fs').readFileSync(configPath, 'utf8'));
}

/**
 * GET /api/business/industries
 * List all available industries with their configs
 */
router.get('/industries', (req, res) => {
  try {
    const config = loadConfig();
    const industries = Object.entries(config.industries).map(([key, data]) => ({
      key,
      name: data.name,
      icon: data.icon,
      tiers: Object.keys(data.tiers),
      variants: data.variants ? Object.keys(data.variants) : [],
      terminology: data.terminology
    }));

    res.json({ success: true, industries });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/business/industry/:key
 * Get detailed config for a specific industry
 */
router.get('/industry/:key', (req, res) => {
  try {
    const config = loadConfig();
    const industry = config.industries[req.params.key];

    if (!industry) {
      return res.status(404).json({ success: false, error: 'Industry not found' });
    }

    res.json({
      success: true,
      industry: {
        key: req.params.key,
        ...industry
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/business/generate
 * Generate a complete business presence
 *
 * Body:
 * {
 *   industry: 'cafe',
 *   variant: 'coffee-shop' (optional),
 *   tier: 'premium',
 *   business: {
 *     name: 'Coffee House Cafe',
 *     tagline: 'Your Daily Brew',
 *     location: 'Dallas, TX',
 *     phone: '(214) 555-1234',
 *     email: 'hello@coffeehouse.com'
 *   },
 *   theme: {
 *     colors: { primary: '#6366f1', accent: '#06b6d4', text: '#1a1a2e', background: '#ffffff' },
 *     moodSliders: { vibe: 50, energy: 50, era: 50, density: 50, price: 50 }
 *   },
 *   location: { city: 'Dallas', state: 'TX', neighborhood: 'Deep Ellum' },
 *   includePortal: true,
 *   portalTier: 'full',
 *   includeCompanion: false,
 *   aiEnabled: true
 * }
 */
router.post('/generate', async (req, res) => {
  try {
    const {
      industry,
      variant,
      tier = 'recommended',
      business,
      theme,
      location,
      includePortal = false,
      portalTier = 'basic',
      includeCompanion = false,
      aiEnabled = true,
      testMode = false
    } = req.body;

    // Validate required fields
    if (!industry) {
      return res.status(400).json({ success: false, error: 'Industry is required' });
    }
    if (!business?.name) {
      return res.status(400).json({ success: false, error: 'Business name is required' });
    }

    const isTestMode = testMode === true;
    const useAI = aiEnabled && !isTestMode;

    console.log(`[API] Generating ${industry} business: ${business.name}`);
    console.log(`[API] Tier: ${tier}, Variant: ${variant || 'none'}`);
    console.log(`[API] Portal: ${includePortal ? portalTier : 'none'}, Companion: ${includeCompanion}`);
    console.log(`[API] Mode: ${isTestMode ? 'TEST (no AI)' : 'PRODUCTION'}`);

    // Create generator instance
    const generator = new BusinessGenerator(industry, {
      variant,
      tier,
      aiEnabled: useAI,
      location,
      colors: theme?.colors,
      moodSliders: theme?.moodSliders,
      includePortal,
      portalTier,
      includeCompanion
    });

    // Connect AI service only if NOT in test mode and AI is enabled
    if (useAI && req.claudeService) {
      generator.setClaudeService(req.claudeService);
    }

    // Generate!
    const result = await generator.generate(business);

    // Write to output directory
    const outputDir = path.join(__dirname, '..', '..', 'output', 'generated-projects');
    const projectSlug = result.brain.business.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const projectDir = path.join(outputDir, projectSlug);
    const frontendDir = path.join(projectDir, 'frontend', 'src');
    const pagesDir = path.join(frontendDir, 'pages');

    // Create directories
    await fs.mkdir(pagesDir, { recursive: true });

    // Write brain.json
    await fs.writeFile(
      path.join(projectDir, 'brain.json'),
      JSON.stringify(result.brain, null, 2)
    );

    // Write page components
    for (const [filename, content] of Object.entries(result.websitePages)) {
      await fs.writeFile(path.join(pagesDir, filename), content);
    }

    console.log(`[API] Project written to: ${projectDir}`);

    res.json({
      success: true,
      projectPath: projectDir,
      testMode: isTestMode,
      ...result.summary,
      brain: result.brain
    });
  } catch (error) {
    console.error('[API] Generation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/business/preview
 * Generate a preview (brain.json only, no files written)
 */
router.post('/preview', async (req, res) => {
  try {
    const {
      industry,
      variant,
      tier = 'recommended',
      business,
      theme,
      location,
      includePortal = false,
      portalTier = 'basic',
      includeCompanion = false
    } = req.body;

    if (!industry || !business?.name) {
      return res.status(400).json({ success: false, error: 'Industry and business name required' });
    }

    const generator = new BusinessGenerator(industry, {
      variant,
      tier,
      aiEnabled: false, // No AI for preview
      location,
      colors: theme?.colors,
      moodSliders: theme?.moodSliders,
      includePortal,
      portalTier,
      includeCompanion
    });

    const result = await generator.generate(business);

    res.json({
      success: true,
      preview: true,
      ...result.summary,
      brain: result.brain,
      pages: Object.keys(result.websitePages)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/business/defaults
 * Get default configuration values
 */
router.get('/defaults', (req, res) => {
  const config = loadConfig();
  res.json({
    success: true,
    defaults: {
      moodSliders: config.defaultMoodSliders,
      colors: config.defaultColors,
      tier: 'recommended',
      portalTier: 'basic'
    }
  });
});

module.exports = router;
