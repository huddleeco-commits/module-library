/**
 * Scout API Routes
 *
 * Backend API for the Scout Dashboard UI
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

// Scout Agent & Master Agent
const { ScoutAgent, MasterAgent } = require('../agents/index.cjs');

// Deploy Service
const deployService = require('../../services/deploy-service.cjs');

// Full-stack assembler script path (module-library is the root)
const MODULE_LIBRARY = path.join(__dirname, '..', '..', '..');
const ASSEMBLE_SCRIPT = path.join(MODULE_LIBRARY, 'scripts', 'assemble-project.cjs');

// Test fixtures
const { loadFixture, applyCustomizations } = require('../../test-fixtures/index.cjs');

// Test dashboard generator
const { writeTestDashboard } = require('../generators/test-dashboard-generator.cjs');

// Video generator (generates promo videos from brain.json)
const { VideoGenerator } = require('../services/video-generator.cjs');

// Logo generator (generates SVG logo variants from brain.json)
const { LogoGenerator } = require('../services/logo-generator.cjs');

// Test manifest generator (for ClawdBot/Claude --chrome testing)
const { TestManifestGenerator } = require('../services/test-manifest-generator.cjs');

// Input generator for auto-filling configuration based on research
const { InputGenerator } = require('../services/input-generator.cjs');

// Metrics generator for dashboard and index pages
const MetricsGenerator = require('../services/metrics-generator.cjs');

// AI Pipeline for AI-powered content and composition
const { AIPipeline, AI_LEVELS } = require('../services/ai-pipeline.cjs');

// Database for tracking generations
const db = require('../../database/db.cjs');

// Project deleter for full cleanup (Railway, GitHub, Cloudflare, local)
const { deleteProject } = require('../services/project-deleter.cjs');

// Config file for persisting API keys
const CONFIG_FILE = path.join(__dirname, '../../.scout-config.json');

// Load saved config or use env
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    }
  } catch (e) {}
  return {};
}

function saveConfig(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

// Initialize API keys from saved config or env
const config = loadConfig();
let yelpApiKey = config.yelpApiKey || process.env.YELP_API_KEY || '';
let googleApiKey = config.googleApiKey || process.env.GOOGLE_PLACES_API_KEY || '';

// Prospects directory
const PROSPECTS_DIR = path.join(__dirname, '../../output/prospects');

// Helper functions for variant display
function getPresetColor(preset) {
  const colors = {
    'friendly': '#4ade80',
    'bold-energetic': '#f97316',
    'luxury': '#a78bfa',
    'modern-minimal': '#38bdf8',
    'classic-elegant': '#fbbf24',
    'sharp-corporate': '#6366f1'
  };
  return colors[preset] || '#94a3b8';
}

function getPresetIcon(preset) {
  const icons = {
    'friendly': 'smile',
    'bold-energetic': 'zap',
    'luxury': 'crown',
    'modern-minimal': 'square',
    'classic-elegant': 'bookmark',
    'sharp-corporate': 'briefcase'
  };
  return icons[preset] || 'palette';
}

/**
 * POST /api/scout/search
 * Search for businesses without websites
 *
 * Options:
 *   - location: Required. "Dallas, TX" or "75201"
 *   - industry: Optional. "salon", "barbershop", etc.
 *   - limit: Max results (default 50, capped at 20 for Google)
 *   - includeWithWebsite: Return all businesses (default false)
 *   - source: 'google' (default, best for discovery) or 'yelp'
 *   - enrichWithYelp: Also research prospects via Yelp (default false)
 */
router.post('/search', async (req, res) => {
  try {
    const {
      location,
      industry,
      limit = 50,
      includeWithWebsite = false,
      source = 'google',  // Default to Google for discovery
      enrichWithYelp = false  // NEW: Enable Yelp research enrichment
    } = req.body;

    if (!location) {
      return res.status(400).json({ error: 'Location is required' });
    }

    // Prefer Google for discovery (better website detection)
    const useGoogle = googleApiKey && (source === 'google' || source === 'auto');
    const useYelp = yelpApiKey && (source === 'yelp' || (!useGoogle && source === 'auto'));

    if (!useGoogle && !useYelp) {
      return res.status(400).json({
        error: 'No API key configured. Add Google Places API key for best results.',
        needsApiKey: true
      });
    }

    const scout = new ScoutAgent({
      yelpApiKey: yelpApiKey,  // Always pass for enrichment
      googleApiKey: useGoogle ? googleApiKey : null,
      verbose: true
    });

    console.log(`[Scout] Discovery via ${useGoogle ? 'Google Places' : 'Yelp'} API`);
    if (enrichWithYelp && yelpApiKey) {
      console.log(`[Scout] Research enrichment enabled via Yelp`);
    }

    const result = await scout.scan({
      location,
      industry,
      limit: Math.min(limit, 20),  // Google max is 20 per request
      includeWithWebsite,
      source: useGoogle ? 'google' : 'yelp',
      enrichWithYelp: enrichWithYelp && !!yelpApiKey  // Only if Yelp key exists
    });

    // Include coordinates and research data for mapping
    const prospects = result.prospects.map(p => ({
      id: p.id,
      name: p.name,
      address: p.address,
      phone: p.phone || p.raw?.display_phone || p.raw?.nationalPhoneNumber || '',
      category: p.category,
      fixtureId: p.fixtureId,
      rating: p.rating || p.research?.rating,
      reviewCount: p.reviewCount || p.research?.reviewCount,
      photo: p.photo || p.photos?.[0] || p.raw?.image_url,
      photos: p.photos || [],
      coordinates: p.coordinates || p.raw?.coordinates || null,
      yelpUrl: p.yelpUrl || p.research?.yelpUrl || null,
      googleMapsUrl: p.googleMapsUrl || null,
      source: p.source || 'unknown',
      hasWebsite: p.hasWebsite,
      detectedWebsite: p.website || null,
      // Research data (if enriched)
      research: p.research || null,
      opportunityScore: p.opportunityScore || null,
      priceLevel: p.research?.priceLevel || null,
      // CRM data
      crm: p.crm || null
    }));

    console.log(`[Scout] Total: ${result.totalScanned}, With Website: ${result.withWebsite}, Without: ${result.withoutWebsite}`);
    if (result.enrichedWithYelp) {
      console.log(`[Scout] Researched: ${result.stats?.researched || 0} prospects enriched`);
    }

    res.json({
      success: true,
      location,
      industry,
      total: result.totalScanned || result.stats.scanned,
      withWebsite: result.withWebsite || 0,
      withoutWebsite: result.withoutWebsite || prospects.length,
      enrichedWithYelp: result.enrichedWithYelp || false,
      prospects
    });

  } catch (err) {
    console.error('Scout search error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/scout/save
 * Save prospects for generation (with duplicate detection)
 */
router.post('/save', async (req, res) => {
  try {
    const { prospects } = req.body;

    if (!prospects || !prospects.length) {
      return res.status(400).json({ error: 'No prospects to save' });
    }

    // Load existing prospect IDs to check for duplicates
    const existingIds = new Set();
    const existingNames = new Set();

    if (fs.existsSync(PROSPECTS_DIR)) {
      const folders = fs.readdirSync(PROSPECTS_DIR).filter(f => {
        const stat = fs.statSync(path.join(PROSPECTS_DIR, f));
        return stat.isDirectory();
      });

      for (const folder of folders) {
        const prospectFile = path.join(PROSPECTS_DIR, folder, 'prospect.json');
        if (fs.existsSync(prospectFile)) {
          try {
            const data = JSON.parse(fs.readFileSync(prospectFile, 'utf-8'));
            if (data.id) existingIds.add(data.id);
            if (data.name) existingNames.add(data.name.toLowerCase().trim());
          } catch (e) {}
        }
      }
    }

    // Filter out duplicates
    const newProspects = prospects.filter(p => {
      const isDuplicateId = p.id && existingIds.has(p.id);
      const isDuplicateName = p.name && existingNames.has(p.name.toLowerCase().trim());
      return !isDuplicateId && !isDuplicateName;
    });

    const duplicateCount = prospects.length - newProspects.length;

    if (newProspects.length === 0) {
      return res.json({
        success: true,
        saved: 0,
        duplicates: duplicateCount,
        message: 'All prospects already exist in pipeline'
      });
    }

    const scout = new ScoutAgent({ verbose: false });

    const result = {
      prospects: newProspects,
      stats: { scanned: newProspects.length, withoutWebsite: newProspects.length },
      scannedAt: new Date().toISOString()
    };

    const saved = await scout.saveProspects(result);

    res.json({
      success: true,
      saved: newProspects.length,
      duplicates: duplicateCount,
      scanFile: saved.scanFile,
      folders: saved.prospectFolders
    });

  } catch (err) {
    console.error('Scout save error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/scout/set-api-key
 * Set API key (Yelp or Google, persists to config file)
 */
router.post('/set-api-key', (req, res) => {
  const { apiKey, provider = 'google' } = req.body;

  if (!apiKey) {
    return res.status(400).json({ error: 'API key is required' });
  }

  const config = loadConfig();

  if (provider === 'google') {
    googleApiKey = apiKey;
    config.googleApiKey = apiKey;
  } else {
    yelpApiKey = apiKey;
    config.yelpApiKey = apiKey;
  }

  saveConfig(config);

  res.json({ success: true, message: `${provider} API key saved` });
});

/**
 * GET /api/scout/status
 * Check if API keys are configured
 */
router.get('/status', (req, res) => {
  res.json({
    hasApiKey: !!(googleApiKey || yelpApiKey),
    hasGoogleKey: !!googleApiKey,
    hasYelpKey: !!yelpApiKey,
    googleKeyPreview: googleApiKey ? `${googleApiKey.slice(0, 10)}...` : null,
    yelpKeyPreview: yelpApiKey ? `${yelpApiKey.slice(0, 8)}...` : null,
    preferredSource: googleApiKey ? 'google' : (yelpApiKey ? 'yelp' : null)
  });
});

// Industry definitions for scouting
const SCOUT_INDUSTRIES = [
  { id: 'barbershop', name: 'Barbershop', icon: '💈', color: '#3B82F6' },
  { id: 'salon', name: 'Hair Salon', icon: '💇', color: '#EC4899' },
  { id: 'nail salon', name: 'Nail Salon', icon: '💅', color: '#F472B6' },
  { id: 'spa', name: 'Spa', icon: '💆', color: '#8B5CF6' },
  { id: 'gym', name: 'Gym / Fitness', icon: '💪', color: '#EF4444' },
  { id: 'yoga', name: 'Yoga Studio', icon: '🧘', color: '#10B981' },
  { id: 'restaurant', name: 'Restaurant', icon: '🍽️', color: '#F59E0B' },
  { id: 'pizza', name: 'Pizza', icon: '🍕', color: '#DC2626' },
  { id: 'coffee', name: 'Coffee Shop', icon: '☕', color: '#78350F' },
  { id: 'bakery', name: 'Bakery', icon: '🥐', color: '#D97706' },
  { id: 'dentist', name: 'Dentist', icon: '🦷', color: '#06B6D4' },
  { id: 'doctor', name: 'Doctor / Clinic', icon: '🏥', color: '#0EA5E9' },
  { id: 'lawyer', name: 'Law Firm', icon: '⚖️', color: '#1E3A8A' },
  { id: 'real estate', name: 'Real Estate', icon: '🏠', color: '#059669' },
  { id: 'auto repair', name: 'Auto Shop', icon: '🚗', color: '#4B5563' },
  { id: 'plumber', name: 'Plumber', icon: '🔧', color: '#2563EB' },
  { id: 'cleaning', name: 'Cleaning Service', icon: '🧹', color: '#14B8A6' }
];

/**
 * GET /api/scout/industries
 * Get available industries
 */
router.get('/industries', (req, res) => {
  res.json({ industries: SCOUT_INDUSTRIES });
});

/**
 * POST /api/scout/search-all
 * Search ALL industries in parallel for a location
 * Returns aggregated results from all industry searches
 */
router.post('/search-all', async (req, res) => {
  try {
    const { location, industries = null } = req.body;

    if (!location) {
      return res.status(400).json({ error: 'Location is required' });
    }

    if (!googleApiKey) {
      return res.status(400).json({
        error: 'Google API key not configured',
        needsApiKey: true
      });
    }

    // Use provided industries or default to all
    const industriesToSearch = industries || SCOUT_INDUSTRIES.map(i => i.id);

    console.log(`[Scout] Starting parallel search for ${industriesToSearch.length} industries in ${location}`);

    // Create scout agents for parallel searching
    const searchPromises = industriesToSearch.map(async (industry) => {
      const scout = new ScoutAgent({
        googleApiKey,
        verbose: false  // Quiet mode for parallel
      });

      try {
        const result = await scout.scan({
          location,
          industry,
          limit: 20,
          source: 'google',
          includeWithWebsite: false
        });

        console.log(`[Scout] ${industry}: ${result.withoutWebsite || 0} prospects found`);

        return {
          industry,
          prospects: result.prospects || [],
          stats: {
            scanned: result.totalScanned || 0,
            withWebsite: result.withWebsite || 0,
            withoutWebsite: result.withoutWebsite || 0
          }
        };
      } catch (err) {
        console.error(`[Scout] ${industry} failed:`, err.message);
        return {
          industry,
          prospects: [],
          stats: { scanned: 0, withWebsite: 0, withoutWebsite: 0 },
          error: err.message
        };
      }
    });

    // Run all searches in parallel
    const results = await Promise.all(searchPromises);

    // Aggregate results
    const allProspects = [];
    const seenIds = new Set();
    let totalScanned = 0;
    let totalWithWebsite = 0;
    let totalWithoutWebsite = 0;
    const byIndustry = {};

    for (const result of results) {
      totalScanned += result.stats.scanned;
      totalWithWebsite += result.stats.withWebsite;
      totalWithoutWebsite += result.stats.withoutWebsite;

      byIndustry[result.industry] = {
        scanned: result.stats.scanned,
        prospects: result.prospects.length
      };

      // Deduplicate prospects by ID
      for (const prospect of result.prospects) {
        if (!seenIds.has(prospect.id)) {
          seenIds.add(prospect.id);
          allProspects.push({
            ...prospect,
            id: prospect.id,
            name: prospect.name,
            address: prospect.address,
            phone: prospect.phone || '',
            category: prospect.category,
            fixtureId: prospect.fixtureId,
            rating: prospect.rating,
            reviewCount: prospect.reviewCount,
            photo: prospect.photo,  // Include photo URL
            photos: prospect.photos,  // Include all photo URLs
            coordinates: prospect.coordinates,
            googleMapsUrl: prospect.googleMapsUrl,
            source: 'google',
            hasWebsite: false,
            detectedWebsite: null
          });
        }
      }
    }

    console.log(`[Scout] Complete: ${totalScanned} scanned, ${allProspects.length} unique prospects without websites`);

    res.json({
      success: true,
      location,
      totalScanned,
      totalWithWebsite,
      totalWithoutWebsite: allProspects.length,
      prospects: allProspects,
      byIndustry
    });

  } catch (err) {
    console.error('Scout all industries error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// PROSPECT MANAGEMENT ROUTES
// ============================================

/**
 * GET /api/scout/prospects
 * List all saved prospects with their status
 */
router.get('/prospects', (req, res) => {
  try {
    if (!fs.existsSync(PROSPECTS_DIR)) {
      return res.json({ prospects: [] });
    }

    const folders = fs.readdirSync(PROSPECTS_DIR).filter(f => {
      const stat = fs.statSync(path.join(PROSPECTS_DIR, f));
      return stat.isDirectory();
    });

    const prospects = [];

    for (const folder of folders) {
      const prospectFile = path.join(PROSPECTS_DIR, folder, 'prospect.json');
      if (fs.existsSync(prospectFile)) {
        const data = JSON.parse(fs.readFileSync(prospectFile, 'utf-8'));

        // Check what exists
        const hasTest = fs.existsSync(path.join(PROSPECTS_DIR, folder, 'test', 'frontend'));
        const hasProduction = fs.existsSync(path.join(PROSPECTS_DIR, folder, 'production', 'frontend'));
        const hasFullTest = fs.existsSync(path.join(PROSPECTS_DIR, folder, 'full-test', 'frontend'));

        // Count all variant directories (old and new formats)
        const prospectDir = path.join(PROSPECTS_DIR, folder);
        const prospectDirs = fs.readdirSync(prospectDir);

        // Count preset-layout variants (new format: full-test-{preset}-{layout})
        // Also count old archetype variants for backwards compatibility
        let variantCount = 0;
        for (const dir of prospectDirs) {
          if (dir.startsWith('full-test-') && dir !== 'full-test') {
            // Check if it has a frontend directory (may not have dist if skipBuild was used)
            const hasFrontend = fs.existsSync(path.join(prospectDir, dir, 'frontend'));
            if (hasFrontend) {
              variantCount++;
            }
          }
        }
        // Also count the default full-test if it exists
        if (hasFullTest) {
          variantCount++;
        }

        // Determine status
        let status = 'scouted';
        if (data.deployed) status = 'deployed';
        else if (data.aiGenerated) status = 'ai-generated';
        else if (data.verified) status = 'verified';
        else if (data.testGenerated || hasTest || hasFullTest || variantCount > 0) status = 'test-generated';

        prospects.push({
          id: data.id || folder,
          folder,
          name: data.name,
          address: data.address,
          phone: data.phone || data.raw?.display_phone || data.raw?.nationalPhoneNumber,
          fixtureId: data.fixtureId,
          rating: data.rating,
          reviewCount: data.reviewCount,
          photo: data.photo || data.photos?.[0] || data.raw?.image_url,  // Use new photo URL first
          yelpUrl: data.yelpUrl || null,
          googleMapsUrl: data.googleMapsUrl || null,
          source: data.source || 'unknown',
          status,
          hasTest,
          hasProduction,
          hasFullTest,
          variantCount,
          hasVariants: variantCount > 0,
          testUrl: data.testUrl || null,
          productionUrl: data.productionUrl || null,
          scannedAt: data.scannedAt,
          testGeneratedAt: data.testGeneratedAt,
          aiGeneratedAt: data.aiGeneratedAt,
          deployedAt: data.deployedAt
        });
      }
    }

    // Sort by name
    prospects.sort((a, b) => a.name.localeCompare(b.name));

    res.json({ prospects, total: prospects.length });

  } catch (err) {
    console.error('Error listing prospects:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/scout/prospects/:folder/generate-test
 * Generate test version (fixture mode, no AI cost)
 */
router.post('/prospects/:folder/generate-test', async (req, res) => {
  const { folder } = req.params;

  try {
    const prospectDir = path.join(PROSPECTS_DIR, folder);
    const prospectFile = path.join(prospectDir, 'prospect.json');

    if (!fs.existsSync(prospectFile)) {
      return res.status(404).json({ error: 'Prospect not found' });
    }

    const prospect = JSON.parse(fs.readFileSync(prospectFile, 'utf-8'));

    // Create test output directory (clear if exists for regeneration)
    const testDir = path.join(prospectDir, 'test');
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
      console.log(`🔄 Cleared existing test directory for regeneration: ${folder}`);
    }

    const master = new MasterAgent({ verbose: false });

    const result = await master.generateProject({
      projectName: folder,
      fixtureId: prospect.fixtureId,
      testMode: true,
      runBuild: true,
      outputPath: testDir,
      prospectData: prospect
    });

    if (result.success) {
      // Update prospect status (reset to test-generated on regeneration)
      prospect.status = 'test-generated';
      prospect.testGenerated = true;
      prospect.testGeneratedAt = new Date().toISOString();
      prospect.testUrl = `test-${folder}.be1st.io`;
      // Clear verified status on regeneration
      delete prospect.verified;
      delete prospect.verifiedAt;
      fs.writeFileSync(prospectFile, JSON.stringify(prospect, null, 2));

      res.json({
        success: true,
        status: 'test-generated',
        testPath: testDir,
        testUrl: prospect.testUrl,
        duration: result.durationMs
      });
    } else {
      res.status(500).json({
        success: false,
        errors: result.errors
      });
    }

  } catch (err) {
    console.error('Test generation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// INPUT GENERATOR ENDPOINTS (Admin Testing)
// ============================================

/**
 * GET /api/scout/prospects/:folder/inputs/:level
 * Preview auto-generated inputs for a prospect at a specific level
 *
 * Levels: 'minimal' | 'moderate' | 'extreme' | 'all'
 */
router.get('/prospects/:folder/inputs/:level', (req, res) => {
  const { folder, level } = req.params;

  try {
    const prospectFile = path.join(PROSPECTS_DIR, folder, 'prospect.json');
    if (!fs.existsSync(prospectFile)) {
      return res.status(404).json({ error: 'Prospect not found' });
    }

    const prospect = JSON.parse(fs.readFileSync(prospectFile, 'utf-8'));
    const generator = new InputGenerator({ verbose: true });

    let inputs;
    if (level === 'all') {
      inputs = generator.generateAllLevels(prospect);
    } else {
      inputs = generator.generateInputs(prospect, level);
    }

    res.json({
      prospect: {
        id: folder,
        name: prospect.name,
        industry: prospect.fixtureId,
        score: prospect.opportunityScore
      },
      level: level,
      inputs: inputs
    });

  } catch (err) {
    console.error('Input generation error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/scout/prospects/:folder/generate-with-level
 * Generate a site using auto-filled inputs at a specific level
 *
 * Request body: { level: 'minimal' | 'moderate' | 'extreme' }
 *
 * This uses the InputGenerator to auto-fill all configuration,
 * then runs the full generation pipeline.
 */
router.post('/prospects/:folder/generate-with-level', async (req, res) => {
  const { folder } = req.params;
  const { level = 'moderate' } = req.body || {};

  console.log(`\n🔧 Generating with ${level.toUpperCase()} inputs for: ${folder}`);

  try {
    const prospectFile = path.join(PROSPECTS_DIR, folder, 'prospect.json');
    if (!fs.existsSync(prospectFile)) {
      return res.status(404).json({ error: 'Prospect not found' });
    }

    const prospect = JSON.parse(fs.readFileSync(prospectFile, 'utf-8'));

    // Generate inputs using the InputGenerator
    const generator = new InputGenerator({ verbose: true });
    const inputs = generator.generateInputs(prospect, level);

    console.log(`   📋 Generated ${level} inputs:`, JSON.stringify(inputs, null, 2).substring(0, 500) + '...');

    // Map inputs to generation parameters
    const genParams = {
      tier: inputs.pageTier === 'premium' ? 'premium' : 'standard',
      pages: inputs.pages || [],
      features: inputs.features || [],
      layout: inputs.layout !== 'auto' ? inputs.layout : null,
      industryGroup: null,
      moodSliders: inputs.moodSliders || null,
      archetype: inputs.archetype !== 'auto' ? inputs.archetype : null,
      variantSuffix: `-${level}`,  // Add level as variant suffix
      enablePortal: true,
      // Pass the full inputs for brain.json storage
      inputLevel: level,
      generatedInputs: inputs
    };

    // Store the inputs in the prospect for reference
    prospect.lastGenerationInputs = {
      level: level,
      inputs: inputs,
      generatedAt: new Date().toISOString()
    };
    fs.writeFileSync(prospectFile, JSON.stringify(prospect, null, 2));

    // Now trigger the actual generation
    // We'll call the generate-full-test logic directly
    const testDir = path.join(PROSPECTS_DIR, folder, `${level}-test`);

    // Check if fixture exists
    const fixtureId = prospect.fixtureId || 'restaurant';
    let fixture;
    try {
      fixture = loadFixture(fixtureId);
    } catch (e) {
      console.log(`   ⚠️ Fixture ${fixtureId} not found, using restaurant fallback`);
      fixture = loadFixture('restaurant');
    }

    // Apply customizations with research data and generated inputs
    const customized = applyCustomizations(fixture, {
      businessName: inputs.businessName,
      address: inputs.address,
      phone: inputs.phone,
      rating: inputs.rating,
      reviewCount: inputs.reviewCount,
      priceLevel: inputs.priceLevel,
      categories: inputs.categories,
      hours: inputs.hours,
      photos: inputs.photos,
      yelpUrl: inputs.yelpUrl,
      googleMapsUrl: inputs.googleMapsUrl,
      reviewHighlights: inputs.reviewHighlights,
      researchSource: 'yelp'
    });

    // Run full-stack assembler
    const runAssembler = () => new Promise((resolve, reject) => {
      const assemblerArgs = [
        ASSEMBLE_SCRIPT,
        '--name', inputs.businessName.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-').toLowerCase() + `-${level}`,
        '--industry', fixtureId,
        '--output', testDir,
        '--admin-tier', genParams.tier
      ];

      console.log(`   🔨 Running assembler: node ${assemblerArgs.join(' ')}`);

      const proc = spawn('node', assemblerArgs, {
        cwd: MODULE_LIBRARY,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '', stderr = '';
      proc.stdout.on('data', d => stdout += d.toString());
      proc.stderr.on('data', d => stderr += d.toString());

      proc.on('close', code => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(`Assembler failed with code ${code}: ${stderr}`));
        }
      });
    });

    await runAssembler();
    console.log(`   ✅ Assembler completed for ${level} level`);

    // Generate styled pages with MasterAgent
    const master = new MasterAgent({ verbose: true });
    const genResult = await master.generateProject({
      projectName: folder,
      fixtureId: fixtureId,
      testMode: true,
      runBuild: false,
      outputPath: testDir,
      prospectData: prospect,
      layout: genParams.layout,
      moodSliders: genParams.moodSliders
    });

    // Update prospect status
    prospect.status = 'test-generated';
    prospect[`${level}TestGenerated`] = true;
    prospect[`${level}TestPath`] = testDir;
    prospect[`${level}TestGeneratedAt`] = new Date().toISOString();
    fs.writeFileSync(prospectFile, JSON.stringify(prospect, null, 2));

    res.json({
      success: true,
      level: level,
      inputs: inputs,
      testPath: testDir,
      pages: genResult.pages || [],
      message: `Generated ${level} test site successfully`
    });

  } catch (err) {
    console.error('Generation with level error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/scout/prospects/:folder/generate-all-levels
 * Generate sites at ALL THREE input levels for comparison
 *
 * Creates three variants: minimal-test, moderate-test, extreme-test
 */
router.post('/prospects/:folder/generate-all-levels', async (req, res) => {
  const { folder } = req.params;

  console.log(`\n🔧 Generating ALL input levels for: ${folder}`);

  try {
    const prospectFile = path.join(PROSPECTS_DIR, folder, 'prospect.json');
    if (!fs.existsSync(prospectFile)) {
      return res.status(404).json({ error: 'Prospect not found' });
    }

    const prospect = JSON.parse(fs.readFileSync(prospectFile, 'utf-8'));
    const generator = new InputGenerator({ verbose: true });
    const allInputs = generator.generateAllLevels(prospect);

    const results = {
      minimal: null,
      moderate: null,
      extreme: null
    };

    // Generate each level sequentially
    for (const level of ['minimal', 'moderate', 'extreme']) {
      console.log(`\n   📦 Generating ${level.toUpperCase()} variant...`);

      try {
        const inputs = allInputs[level];
        const testDir = path.join(PROSPECTS_DIR, folder, `${level}-test`);

        // Check if fixture exists
        const fixtureId = prospect.fixtureId || 'restaurant';
        let fixture;
        try {
          fixture = loadFixture(fixtureId);
        } catch (e) {
          fixture = loadFixture('restaurant');
        }

        // Apply customizations
        const customized = applyCustomizations(fixture, {
          businessName: inputs.businessName,
          address: inputs.address,
          phone: inputs.phone,
          rating: inputs.rating,
          reviewCount: inputs.reviewCount,
          priceLevel: inputs.priceLevel,
          categories: inputs.categories,
          hours: inputs.hours,
          photos: inputs.photos,
          yelpUrl: inputs.yelpUrl
        });

        // Run assembler
        const runAssembler = () => new Promise((resolve, reject) => {
          const assemblerArgs = [
            ASSEMBLE_SCRIPT,
            '--name', inputs.businessName.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-').toLowerCase() + `-${level}`,
            '--industry', fixtureId,
            '--output', testDir,
            '--admin-tier', inputs.pageTier === 'premium' ? 'premium' : 'standard'
          ];

          const proc = spawn('node', assemblerArgs, {
            cwd: MODULE_LIBRARY,
            stdio: ['pipe', 'pipe', 'pipe']
          });

          let stdout = '', stderr = '';
          proc.stdout.on('data', d => stdout += d.toString());
          proc.stderr.on('data', d => stderr += d.toString());

          proc.on('close', code => {
            if (code === 0) resolve({ stdout, stderr });
            else reject(new Error(`Assembler failed: ${stderr}`));
          });
        });

        await runAssembler();

        // Generate with MasterAgent
        const master = new MasterAgent({ verbose: false });
        const genResult = await master.generateProject({
          projectName: folder,
          fixtureId: fixtureId,
          testMode: true,
          runBuild: false,
          outputPath: testDir,
          prospectData: prospect,
          layout: inputs.layout !== 'auto' ? inputs.layout : null,
          moodSliders: inputs.moodSliders || null
        });

        results[level] = {
          success: true,
          testPath: testDir,
          pages: genResult.pages || [],
          inputs: inputs
        };

        console.log(`   ✅ ${level} variant completed`);

      } catch (levelErr) {
        console.error(`   ❌ ${level} variant failed:`, levelErr.message);
        results[level] = { success: false, error: levelErr.message };
      }
    }

    // Update prospect status
    prospect.allLevelsGenerated = true;
    prospect.allLevelsGeneratedAt = new Date().toISOString();
    prospect.generatedLevels = results;
    fs.writeFileSync(prospectFile, JSON.stringify(prospect, null, 2));

    res.json({
      success: true,
      folder: folder,
      results: results,
      message: 'Generated all three input levels'
    });

  } catch (err) {
    console.error('Generate all levels error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * ============================================================================
 * UNIFIED GENERATION ENDPOINT
 * ============================================================================
 * POST /api/scout/prospects/:folder/unified-generate
 *
 * Combines the best of all generation methods:
 * - Full-stack base (frontend + backend + admin + database)
 * - Input level auto-population (minimal/moderate/extreme)
 * - Optional variant support (presets × layouts/themes)
 * - SSE progress streaming
 *
 * Request body:
 * {
 *   inputLevel: 'minimal' | 'moderate' | 'extreme' | 'custom',
 *   overrides: { tier, pages, features, layout, moodSliders, archetype, ... },
 *   variants: { enabled: false, presets: [...], themes: [...] },
 *   generateVideo: true,
 *   generateLogo: true,
 *   enablePortal: true
 * }
 */
router.post('/prospects/:folder/unified-generate', async (req, res) => {
  const { folder } = req.params;
  const {
    inputLevel = 'moderate',
    overrides = {},
    variants = { enabled: false },
    generateVideo = true,
    generateLogo = true,
    enablePortal = true,
    // AI Pipeline parameters
    generationMode = 'test', // 'test' (free, fixtures) or 'ai' (paid, AI-generated)
    aiLevel = 0 // 0=test, 1=composer, 2=content, 3=both, 4=full freedom
  } = req.body || {};

  // AI Level definitions for logging/future use
  const AI_LEVEL_NAMES = ['Test Mode', 'AI Composer', 'AI Content', 'Composer+Content', 'Full Freedom'];
  const isAIMode = generationMode === 'ai' && aiLevel > 0;

  // Set up SSE for progress streaming
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendProgress = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const sendComplete = (result) => {
    res.write(`data: ${JSON.stringify({ step: 'complete', ...result })}\n\n`);
    res.end();
  };

  const sendError = (error) => {
    res.write(`data: ${JSON.stringify({ step: 'error', error: error.message || error })}\n\n`);
    res.end();
  };

  try {
    const startTime = Date.now();
    sendProgress({ step: 'init', status: 'Loading prospect data...', progress: 5 });

    // 1. Load prospect data
    const prospectDir = path.join(PROSPECTS_DIR, folder);
    const prospectFile = path.join(prospectDir, 'prospect.json');

    if (!fs.existsSync(prospectFile)) {
      return sendError('Prospect not found');
    }

    const prospect = JSON.parse(fs.readFileSync(prospectFile, 'utf-8'));
    console.log(`\n🚀 UNIFIED GENERATION: ${prospect.name}`);
    console.log(`   Mode: ${isAIMode ? `🤖 AI (Level ${aiLevel}: ${AI_LEVEL_NAMES[aiLevel]})` : '🧪 Test (Free)'}`);
    console.log(`   Input Level: ${inputLevel}`);
    console.log(`   Variants: ${variants.enabled ? 'Yes' : 'No'}`);

    // 2. Generate inputs based on level (or use custom)
    sendProgress({ step: 'inputs', status: `Generating ${inputLevel} inputs...`, progress: 10 });

    let inputs = {};
    if (inputLevel !== 'custom') {
      const generator = new InputGenerator({ verbose: true });
      inputs = generator.generateInputs(prospect, inputLevel);
      console.log(`   📋 Auto-generated ${inputLevel} inputs`);
    }

    // 3. Merge with overrides (user overrides take precedence)
    const finalConfig = {
      tier: overrides.tier || inputs.pageTier || 'premium',
      pages: overrides.pages || inputs.pages || [],
      features: overrides.features || inputs.features || [],
      layout: overrides.layout || (inputs.layout !== 'auto' ? inputs.layout : null),
      moodSliders: overrides.moodSliders || inputs.moodSliders || null,
      archetype: overrides.archetype || (inputs.archetype !== 'auto' ? inputs.archetype : null),
      enablePortal,
      inputLevel,
      generatedInputs: inputs
    };

    console.log(`   Final config: tier=${finalConfig.tier}, pages=${finalConfig.pages.length}, layout=${finalConfig.layout || 'default'}`);

    // Store config in prospect for reference
    prospect.lastUnifiedGeneration = {
      inputLevel,
      config: finalConfig,
      variants: variants.enabled ? variants : null,
      generatedAt: new Date().toISOString()
    };
    fs.writeFileSync(prospectFile, JSON.stringify(prospect, null, 2));

    // 4. Determine variants to generate
    let variantsToGenerate = [{ suffix: '', preset: null, layout: null }]; // Default: single generation

    // Smart layout-preset pairings: each layout has an ideal preset that matches its character
    const LAYOUT_PRESET_PAIRINGS = {
      // Artisan food layouts
      'appetizing-visual': 'friendly',     // Local/community vibe → warm, friendly
      'menu-focused': 'bold-energetic',    // Conversion/ecommerce → bold, action-oriented
      'story-driven': 'luxury',            // Premium/luxury → elegant, refined
      // General layouts
      'visual-first': 'friendly',
      'conversion-focused': 'bold-energetic',
      'content-heavy': 'modern-minimal',
      // Fallback
      'default': 'friendly'
    };

    if (variants.enabled) {
      variantsToGenerate = [];

      // Check if smart pairing is requested (new default behavior)
      const useSmartPairing = variants.smartPairing !== false;
      const layouts = variants.layouts || ['appetizing-visual', 'menu-focused', 'story-driven'];

      if (useSmartPairing) {
        // Smart pairing: each layout gets its ideal preset automatically
        for (const layout of layouts) {
          const pairedPreset = LAYOUT_PRESET_PAIRINGS[layout] || LAYOUT_PRESET_PAIRINGS['default'];
          variantsToGenerate.push({
            suffix: `-${pairedPreset}-${layout}`,
            preset: pairedPreset,
            layout
          });
        }
        console.log(`   📦 Generating ${variantsToGenerate.length} smart-paired variants (layout→preset)`);
        variantsToGenerate.forEach(v => console.log(`      • ${v.layout} → ${v.preset}`));
      } else {
        // Legacy behavior: all combinations (preset × layout)
        const presets = variants.presets || ['luxury', 'friendly', 'bold'];
        for (const preset of presets) {
          for (const layout of layouts) {
            variantsToGenerate.push({
              suffix: `-${preset}-${layout}`,
              preset,
              layout
            });
          }
        }
        console.log(`   📦 Generating ${variantsToGenerate.length} variants (${presets.length} presets × ${layouts.length} layouts)`);
      }
    }

    // 5. Load fixture
    const fixtureId = prospect.fixtureId || 'restaurant';
    let fixture;
    try {
      fixture = loadFixture(fixtureId);
    } catch (e) {
      fixture = loadFixture('restaurant');
    }

    // 5b. AI Pipeline Enhancement (if AI mode enabled)
    let aiEnhancedConfig = null;
    let aiPipeline = null;
    if (isAIMode) {
      aiPipeline = new AIPipeline({ verbose: true });
      sendProgress({ step: 'ai-enhance', status: `Running AI Pipeline (Level ${aiLevel}: ${AI_LEVEL_NAMES[aiLevel]})...`, progress: 12 });

      try {
        aiEnhancedConfig = await aiPipeline.enhance(
          finalConfig,
          prospect,
          aiLevel,
          sendProgress
        );

        // Apply AI enhancements to fixture
        fixture = aiPipeline.applyToFixture(fixture, aiEnhancedConfig);

        console.log(`   🤖 AI Enhancement complete: Level ${aiLevel} (${AI_LEVEL_NAMES[aiLevel]})`);
        if (aiEnhancedConfig.aiTotalCost) {
          console.log(`   💰 AI Cost: $${aiEnhancedConfig.aiTotalCost.toFixed(4)}`);
        }
        if (aiEnhancedConfig.aiComposition?.creativeBrief) {
          console.log(`   🎨 Creative brief: ${aiEnhancedConfig.aiComposition.creativeBrief}`);
        }
      } catch (aiError) {
        console.error('   ⚠️ AI Pipeline error (falling back to test mode):', aiError.message);
        // Continue with original fixture on AI error
      }
    }

    const results = [];
    let sharedVideoPath = null;
    let sharedLogoPath = null;

    // 6. Generate each variant
    for (let i = 0; i < variantsToGenerate.length; i++) {
      const variant = variantsToGenerate[i];
      const isFirstVariant = i === 0;
      const variantLabel = variant.suffix || 'main';
      const variantStartTime = Date.now(); // Track per-variant timing
      const progressBase = 15 + (i * (70 / variantsToGenerate.length));

      sendProgress({
        step: 'variant',
        status: `Generating ${variantLabel} (${i + 1}/${variantsToGenerate.length})...`,
        progress: progressBase,
        variant: variantLabel
      });

      const testDirName = variant.suffix ? `full-test${variant.suffix}` : 'full-test';
      const testDir = path.join(prospectDir, testDirName);

      // Clear existing directory
      if (fs.existsSync(testDir)) {
        fs.rmSync(testDir, { recursive: true, force: true });
      }

      // Run assembler
      sendProgress({ step: 'assembler', status: 'Creating full-stack structure...', progress: progressBase + 5 });

      const FIXTURE_TO_ASSEMBLER = {
        'salon': 'spa-salon', 'nail salon': 'spa-salon', 'spa': 'spa-salon',
        'gym': 'fitness', 'coffee': 'cafe', 'dentist': 'dental',
        'doctor': 'healthcare', 'lawyer': 'law-firm', 'real estate': 'real-estate',
        'auto repair': 'auto-repair', 'salon-spa': 'spa-salon', 'fitness-gym': 'fitness',
        'coffee-cafe': 'cafe', 'pizza-restaurant': 'pizza', 'pizzeria': 'pizza',
        'pizza': 'pizza', 'restaurant': 'restaurant', 'cafe': 'cafe', 'bakery': 'bakery',
        'spa-salon': 'spa-salon', 'barbershop': 'barbershop', 'dental': 'dental',
        'healthcare': 'healthcare', 'fitness': 'fitness', 'yoga': 'yoga',
        'law-firm': 'law-firm', 'real-estate': 'real-estate', 'plumber': 'plumber',
        'electrician': 'electrician', 'hvac': 'hvac', 'cleaning': 'cleaning',
        'auto-repair': 'auto-repair', 'saas': 'saas', 'ecommerce': 'retail',
        'retail': 'retail', 'education': 'education', 'school': 'education'
      };

      const industry = FIXTURE_TO_ASSEMBLER[fixtureId] || fixtureId;

      await new Promise((resolve, reject) => {
        const args = [ASSEMBLE_SCRIPT, '--name', testDirName.replace('full-test', 'full-test') || 'full-test', '--industry', industry];
        const child = spawn('node', args, {
          cwd: MODULE_LIBRARY,
          env: { ...process.env, MODULE_LIBRARY_PATH: MODULE_LIBRARY, OUTPUT_PATH: prospectDir }
        });
        child.on('close', (code) => code === 0 ? resolve() : reject(new Error(`Assembler failed with code ${code}`)));
        child.on('error', reject);
      });

      // Generate styled frontend with MasterAgent
      sendProgress({ step: 'frontend', status: 'Generating styled pages...', progress: progressBase + 15 });

      const frontendDir = path.join(testDir, 'frontend');
      if (fs.existsSync(frontendDir)) {
        fs.rmSync(frontendDir, { recursive: true, force: true });
      }

      // Apply variant-specific mood sliders and layout if this is a variant
      let variantMoodSliders = finalConfig.moodSliders;
      let variantLayout = finalConfig.layout;
      if (variant.preset) {
        const PRESET_MOOD_MAP = {
          // LUXURY: Maximum elegance - dark, refined, premium feel
          'luxury': { vibe: 95, energy: 30, era: 85, density: 20, price: 100, theme: 'dark' },
          // FRIENDLY: Warm and approachable - light, welcoming, community feel
          'friendly': { vibe: 55, energy: 70, era: 45, density: 65, price: 35, theme: 'light' },
          // BOLD: High energy, attention-grabbing - medium, dynamic
          'bold': { vibe: 45, energy: 95, era: 35, density: 75, price: 50, theme: 'medium' },
          'minimal': { vibe: 70, energy: 30, era: 60, density: 20, price: 60, theme: 'light' },
          'modern-minimal': { vibe: 70, energy: 30, era: 60, density: 20, price: 60, theme: 'light' },
          'warm': { vibe: 75, energy: 55, era: 45, density: 50, price: 45, theme: 'light' },
          'corporate': { vibe: 40, energy: 50, era: 65, density: 45, price: 70, theme: 'light' },
          'sharp-corporate': { vibe: 40, energy: 50, era: 65, density: 45, price: 70, theme: 'light' },
          // BOLD-ENERGETIC: Conversion-focused, high action - great for ecommerce
          'bold-energetic': { vibe: 45, energy: 95, era: 35, density: 80, price: 45, theme: 'medium' },
          'classic-elegant': { vibe: 80, energy: 35, era: 80, density: 35, price: 85, theme: 'dark' }
        };
        variantMoodSliders = PRESET_MOOD_MAP[variant.preset] || variantMoodSliders;
      }
      // Use variant layout if specified
      if (variant.layout) {
        variantLayout = variant.layout;
      }

      // Normalize pages
      const normalizePageKey = (label) => label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      let normalizedPages = (finalConfig.pages || []).map(normalizePageKey);

      // Add portal pages if enabled
      if (enablePortal) {
        const PORTAL_PAGES = ['login', 'register', 'dashboard', 'profile', 'account', 'rewards'];
        PORTAL_PAGES.forEach(page => {
          if (!normalizedPages.includes(page)) normalizedPages.push(page);
        });
      }

      const master = new MasterAgent({ verbose: false });
      // Determine archetype:
      // 1. AI mode: Use AI-selected archetype (location-aware)
      // 2. Test mode with layout: Let layout-to-archetype mapping determine it
      // 3. Test mode without layout: Use config archetype or auto-detect
      let variantArchetype = null;
      if (isAIMode && aiEnhancedConfig?.aiArchetype) {
        variantArchetype = aiEnhancedConfig.aiArchetype;
        console.log(`   🤖 AI selected archetype: ${variantArchetype} (${aiEnhancedConfig.aiArchetypeReason || 'AI decision'})`);
      } else if (!variant.layout) {
        variantArchetype = finalConfig.archetype;
      }
      // else: variantArchetype stays null, let layout mapping handle it

      const frontendResult = await master.generateProject({
        projectName: folder + (variant.suffix || ''),
        fixtureId: prospect.fixtureId || 'restaurant',
        testMode: true,
        runBuild: false,
        outputPath: testDir,
        prospectData: prospect,
        requestedPages: normalizedPages.length > 0 ? normalizedPages : null,
        requestedFeatures: finalConfig.features.length > 0 ? finalConfig.features : null,
        tier: finalConfig.tier,
        layout: variantLayout,  // Use variant-specific layout
        moodSliders: variantMoodSliders,
        archetype: variantArchetype,  // AI-selected or layout-mapped
        enablePortal,
        // AI-generated content (when aiLevel > 0)
        aiContent: aiEnhancedConfig?.aiContent || null,
        aiMenu: aiEnhancedConfig?.aiMenu || null,
        aiComposition: aiEnhancedConfig?.aiComposition || null,
        // AI visual strategies
        aiColorStrategy: aiEnhancedConfig?.aiColorStrategy || null,
        aiTypographyStrategy: aiEnhancedConfig?.aiTypographyStrategy || null,
        aiImageryGuidance: aiEnhancedConfig?.aiImageryGuidance || null
      });

      // Generate video (first variant only, share across)
      if (generateVideo && isFirstVariant) {
        sendProgress({ step: 'video', status: 'Generating video assets...', progress: progressBase + 25 });
        try {
          const videoGenerator = new VideoGenerator(testDir);
          const videoResult = await videoGenerator.generateVideos();
          if (videoResult.success) {
            sharedVideoPath = path.join(testDir, 'videos');
          }
        } catch (e) {
          console.warn('Video generation failed:', e.message);
        }
      }

      // Generate logo (first variant only, share across)
      if (generateLogo && isFirstVariant) {
        sendProgress({ step: 'logo', status: 'Generating logo variants...', progress: progressBase + 30 });
        try {
          const logoGenerator = new LogoGenerator(testDir);
          const logoResult = await logoGenerator.generateLogos();
          if (logoResult.success) {
            sharedLogoPath = path.join(testDir, 'logos');
          }
        } catch (e) {
          console.warn('Logo generation failed:', e.message);
        }
      }

      // Copy shared assets to subsequent variants
      if (!isFirstVariant) {
        if (sharedVideoPath && fs.existsSync(sharedVideoPath)) {
          const destVideoDir = path.join(testDir, 'videos');
          fs.cpSync(sharedVideoPath, destVideoDir, { recursive: true });
        }
        if (sharedLogoPath && fs.existsSync(sharedLogoPath)) {
          const destLogoDir = path.join(testDir, 'logos');
          fs.cpSync(sharedLogoPath, destLogoDir, { recursive: true });
        }
      }

      // Generate IndexPage with metrics BEFORE build (so it's included in dist)
      try {
        const variantTimeMs = Date.now() - variantStartTime;
        const metricsGen = new MetricsGenerator();
        const variantMetrics = metricsGen.calculateVariantMetrics(
          testDir,
          variant.suffix || '',
          variant.preset || 'default',
          variant.layout || 'default',
          variantMoodSliders?.theme || 'light',
          variantTimeMs
        );
        metricsGen.generateIndexPage(testDir, variantMetrics, prospect.businessName || prospect.name || folder);

        // Save variant-metrics.json for this variant
        const variantMetricsJson = {
          key: variant.suffix || '',
          preset: variant.preset || 'default',
          presetName: variant.preset || 'default',
          presetColor: getPresetColor(variant.preset),
          presetIcon: getPresetIcon(variant.preset),
          layout: variant.layout || 'default',
          layoutName: variant.layout || 'default',
          theme: variantMoodSliders?.theme || 'light',
          pages: variantMetrics.pageCount,
          linesOfCode: variantMetrics.linesOfCode?.total || 0,
          files: variantMetrics.files?.total || 0,
          generationTimeMs: variantTimeMs,
          success: true,
          previewUrl: `/api/scout/preview/${folder}/full-test${variant.suffix || ''}/`
        };
        fs.writeFileSync(path.join(testDir, 'variant-metrics.json'), JSON.stringify(variantMetricsJson, null, 2));

        console.log(`   📊 IndexPage generated for ${variantLabel}: ${variantMetrics.pageCount} pages, ${variantMetrics.linesOfCode.total.toLocaleString()} LOC`);
      } catch (metricsErr) {
        console.warn('IndexPage generation warning:', metricsErr.message);
      }

      // Build frontend
      sendProgress({ step: 'build', status: `Building ${variantLabel}...`, progress: progressBase + 35 });
      if (fs.existsSync(frontendDir)) {
        const { execSync } = require('child_process');
        try {
          execSync('npm install --legacy-peer-deps', { cwd: frontendDir, stdio: 'pipe', timeout: 180000 });
          execSync('npm run build', { cwd: frontendDir, stdio: 'pipe', timeout: 180000 });
        } catch (buildErr) {
          console.warn('Build failed:', buildErr.message);
        }
      }

      results.push({
        variant: variantLabel,
        suffix: variant.suffix || '',
        testDir,
        success: true,
        preset: variant.preset,
        layout: variant.layout,
        theme: variantMoodSliders?.theme || 'light',
        generationTimeMs: Date.now() - variantStartTime
      });
    }

    // 7. Update prospect status
    const totalTime = Date.now() - startTime;
    const firstVariantDir = results[0]?.testDir || path.join(prospectDir, 'full-test');

    prospect.status = 'test-generated'; // Use test-generated so UI shows preview
    prospect.testGenerated = true;
    prospect.testGeneratedAt = new Date().toISOString();
    prospect.testUrl = `test-${folder}.be1st.io`;
    prospect.testPath = firstVariantDir;
    prospect.fullStackTest = true;
    prospect.unifiedGenerated = true;
    prospect.unifiedGeneratedAt = new Date().toISOString();
    prospect.generationTimeMs = totalTime;
    // Track AI mode info
    prospect.generationMode = generationMode;
    prospect.aiLevel = aiLevel;
    prospect.aiLevelName = AI_LEVEL_NAMES[aiLevel] || 'Test Mode';
    prospect.aiCost = aiEnhancedConfig?.aiTotalCost || 0;
    fs.writeFileSync(prospectFile, JSON.stringify(prospect, null, 2));

    // 8. Generate master metrics HTML page (IndexPages already generated per-variant before build)
    sendProgress({ step: 'metrics', status: 'Generating metrics dashboard...', progress: 95 });
    try {
      const metricsGen = new MetricsGenerator();

      // Calculate final metrics for each variant
      const variantMetrics = results.map(r => {
        return metricsGen.calculateVariantMetrics(
          r.testDir,
          r.suffix || '',
          r.preset || 'default',
          r.layout || 'default',
          r.theme || 'light',
          r.generationTimeMs || 0
        );
      });

      // Calculate master metrics
      const masterMetrics = {
        businessName: prospect.businessName || prospect.name || folder,
        totalGenerationTimeMs: totalTime,
        totalVariants: variantMetrics.length,
        totalLinesOfCode: variantMetrics.reduce((sum, v) => sum + v.linesOfCode.total, 0),
        totalFiles: variantMetrics.reduce((sum, v) => sum + v.files.total, 0),
        totalPages: variantMetrics.reduce((sum, v) => sum + v.pageCount, 0),
        generatedAt: new Date().toISOString(),
        // AI mode info
        generationMode,
        aiLevel,
        aiLevelName: AI_LEVEL_NAMES[aiLevel] || 'Test Mode',
        aiCost: aiEnhancedConfig?.aiTotalCost || 0,
        aiEnhanced: isAIMode
      };
      const timeSeconds = totalTime / 1000;
      masterMetrics.pagesPerSecond = timeSeconds > 0 ? (masterMetrics.totalPages / timeSeconds).toFixed(2) : 0;
      masterMetrics.linesPerSecond = timeSeconds > 0 ? Math.round(masterMetrics.totalLinesOfCode / timeSeconds) : 0;
      masterMetrics.filesPerSecond = timeSeconds > 0 ? (masterMetrics.totalFiles / timeSeconds).toFixed(2) : 0;

      // Generate master metrics HTML
      metricsGen.generateMasterMetricsPage(prospectDir, variantMetrics, masterMetrics);

      // Save master-metrics.json for UI to load
      const fullMasterMetrics = {
        folder,
        businessName: masterMetrics.businessName,
        totalGenerationTimeMs: totalTime,
        totalPages: masterMetrics.totalPages,
        totalLinesOfCode: masterMetrics.totalLinesOfCode,
        totalFiles: masterMetrics.totalFiles,
        pagesPerSecond: masterMetrics.pagesPerSecond,
        linesPerSecond: masterMetrics.linesPerSecond,
        filesPerSecond: masterMetrics.filesPerSecond,
        generatedAt: masterMetrics.generatedAt,
        successCount: variantMetrics.length,
        failCount: 0,
        // AI mode info
        generationMode,
        aiLevel,
        aiLevelName: AI_LEVEL_NAMES[aiLevel] || 'Test Mode',
        aiCost: aiEnhancedConfig?.aiTotalCost || 0,
        aiEnhanced: isAIMode,
        variants: variantMetrics.map((vm, i) => {
          // Extract values safely
          const loc = typeof vm.linesOfCode === 'object' ? vm.linesOfCode.total : (vm.linesOfCode || 0);
          const files = typeof vm.files === 'object' ? vm.files.total : (vm.files || 0);
          const suffix = results[i]?.suffix || vm.variantKey || '';

          return {
            key: suffix,
            preset: vm.preset || 'default',
            presetName: vm.preset || 'default',
            layout: vm.layout || 'default',
            layoutName: vm.layout || 'default',
            theme: vm.theme || 'light',
            pages: vm.pageCount || 0,
            linesOfCode: loc,
            files: files,
            generationTimeMs: results[i]?.generationTimeMs || vm.generationTimeMs || 0,
            success: true,
            testDir: results[i]?.testDir || '',
            previewUrl: `/api/scout/preview/${folder}/full-test${suffix}/`,
            presetColor: getPresetColor(vm.preset),
            presetIcon: getPresetIcon(vm.preset)
          };
        })
      };

      fs.writeFileSync(
        path.join(prospectDir, 'master-metrics.json'),
        JSON.stringify(fullMasterMetrics, null, 2)
      );

      console.log(`   📊 Master metrics: ${masterMetrics.totalLinesOfCode.toLocaleString()} LOC, ${masterMetrics.totalPages} pages, ${masterMetrics.pagesPerSecond} pages/sec`);

      sendProgress({ step: 'finalizing', status: 'Generation complete!', progress: 100 });

      sendComplete({
        success: true,
        folder,
        inputLevel,
        config: finalConfig,
        variants: results,
        totalVariants: results.length,
        generationTimeMs: totalTime,
        fullStack: true,
        components: ['frontend', 'backend', 'admin', 'database'],
        masterMetrics: fullMasterMetrics,
        // AI mode info
        generationMode,
        aiLevel,
        aiLevelName: AI_LEVEL_NAMES[aiLevel] || 'Test Mode',
        aiCost: aiEnhancedConfig?.aiTotalCost || 0,
        aiEnhanced: isAIMode
      });
    } catch (metricsErr) {
      console.warn('Master metrics generation warning:', metricsErr.message);
      // Still complete but without rich metrics
      sendProgress({ step: 'finalizing', status: 'Generation complete!', progress: 100 });

      sendComplete({
        success: true,
        folder,
        inputLevel,
        config: finalConfig,
        variants: results,
        totalVariants: results.length,
        generationTimeMs: totalTime,
        fullStack: true,
        components: ['frontend', 'backend', 'admin', 'database'],
        // AI mode info
        generationMode,
        aiLevel,
        aiLevelName: AI_LEVEL_NAMES[aiLevel] || 'Test Mode',
        aiCost: aiEnhancedConfig?.aiTotalCost || 0,
        aiEnhanced: isAIMode
      });
    }

  } catch (err) {
    console.error('Unified generation error:', err);
    sendError(err.message);
  }
});

/**
 * POST /api/scout/prospects/:folder/generate-full-test
 * Generate FULL STACK test (frontend + backend + admin + database)
 * Uses the same assembler as QuickStart mode
 *
 * Request body (optional): { tier, pages, features, layout, industryGroup }
 */
router.post('/prospects/:folder/generate-full-test', async (req, res) => {
  const { folder } = req.params;
  const {
    tier = 'premium',
    pages = [],
    features = [],
    layout = null,
    industryGroup = null,
    moodSliders = null,
    archetype = null,
    variantSuffix = null,  // For generating multiple variants (e.g., '-luxury', '-local')
    enablePortal = true    // Enable login/auth portal pages
  } = req.body || {};

  // Use variant suffix for unique project naming when generating multiple archetypes
  const effectiveFolder = variantSuffix ? `${folder}${variantSuffix}` : folder;

  try {
    const prospectDir = path.join(PROSPECTS_DIR, folder);
    const prospectFile = path.join(prospectDir, 'prospect.json');

    if (!fs.existsSync(prospectFile)) {
      return res.status(404).json({ error: 'Prospect not found' });
    }

    const prospect = JSON.parse(fs.readFileSync(prospectFile, 'utf-8'));

    // Check if assembler script exists
    if (!fs.existsSync(ASSEMBLE_SCRIPT)) {
      return res.status(500).json({
        error: 'Assembler script not found',
        path: ASSEMBLE_SCRIPT
      });
    }

    // Load fixture and apply prospect customizations
    let fixture;
    try {
      fixture = loadFixture(prospect.fixtureId || 'restaurant');
    } catch (e) {
      fixture = loadFixture('restaurant'); // Default fallback
    }

    const customizedFixture = applyCustomizations(fixture, {
      businessName: prospect.name,
      address: prospect.address,
      phone: prospect.phone,
      tagline: prospect.tagline || fixture.business?.tagline
    });

    // Comprehensive mapping of fixture IDs and scout IDs to assembler-compatible industry keys
    // This handles: Scout search IDs → Assembler keys used in INDUSTRY_PAGE_PACKAGES
    const FIXTURE_TO_ASSEMBLER = {
      // ═══════════════════════════════════════════════════════════════
      // SCOUT SEARCH INDUSTRY IDs (from Google/Yelp)
      // ═══════════════════════════════════════════════════════════════
      'salon': 'spa-salon',
      'nail salon': 'spa-salon',
      'spa': 'spa-salon',
      'gym': 'fitness',
      'coffee': 'cafe',
      'dentist': 'dental',
      'doctor': 'healthcare',
      'lawyer': 'law-firm',
      'real estate': 'real-estate',
      'auto repair': 'auto-repair',

      // ═══════════════════════════════════════════════════════════════
      // LEGACY/ALIAS FIXTURE IDs
      // ═══════════════════════════════════════════════════════════════
      'salon-spa': 'spa-salon',
      'fitness-gym': 'fitness',
      'coffee-cafe': 'cafe',
      'pizza-restaurant': 'pizza',
      'pizzeria': 'pizza',

      // ═══════════════════════════════════════════════════════════════
      // FOOD & BEVERAGE (10 Fully Ready includes: pizza, restaurant, cafe)
      // ═══════════════════════════════════════════════════════════════
      'pizza': 'pizza',
      'restaurant': 'restaurant',
      'cafe': 'cafe',
      'bakery': 'bakery',
      'bar': 'bar',

      // ═══════════════════════════════════════════════════════════════
      // HEALTHCARE & BEAUTY (10 Fully Ready includes: spa-salon, dental)
      // ═══════════════════════════════════════════════════════════════
      'spa-salon': 'spa-salon',
      'barbershop': 'barbershop',
      'dental': 'dental',
      'healthcare': 'healthcare',
      'chiropractic': 'chiropractic',
      'medical-spa': 'medical-spa',
      'veterinary': 'veterinary',
      'tattoo': 'tattoo',

      // ═══════════════════════════════════════════════════════════════
      // HEALTH & WELLNESS (10 Fully Ready includes: fitness)
      // ═══════════════════════════════════════════════════════════════
      'fitness': 'fitness',
      'yoga': 'yoga',

      // ═══════════════════════════════════════════════════════════════
      // PROFESSIONAL SERVICES (10 Fully Ready includes: law-firm, real-estate)
      // ═══════════════════════════════════════════════════════════════
      'law-firm': 'law-firm',
      'real-estate': 'real-estate',
      'accounting': 'accounting',
      'consulting': 'consulting',
      'insurance': 'insurance',
      'finance': 'finance',

      // ═══════════════════════════════════════════════════════════════
      // TRADE SERVICES (10 Fully Ready includes: plumber)
      // ═══════════════════════════════════════════════════════════════
      'plumber': 'plumber',
      'electrician': 'electrician',
      'hvac': 'hvac',
      'construction': 'construction',
      'landscaping': 'landscaping',
      'cleaning': 'cleaning',
      'roofing': 'roofing',
      'auto-repair': 'auto-repair',

      // ═══════════════════════════════════════════════════════════════
      // TECHNOLOGY & CREATIVE
      // ═══════════════════════════════════════════════════════════════
      'saas': 'saas',
      'startup': 'saas',
      'agency': 'agency',
      'photography': 'photography',
      'wedding': 'photography',
      'portfolio': 'photography',

      // ═══════════════════════════════════════════════════════════════
      // RETAIL & E-COMMERCE (10 Fully Ready includes: ecommerce)
      // ═══════════════════════════════════════════════════════════════
      'ecommerce': 'retail',
      'retail': 'retail',
      'subscription-box': 'retail',
      'collectibles': 'collectibles',
      'survey-rewards': 'collectibles',

      // ═══════════════════════════════════════════════════════════════
      // EDUCATION & ORGANIZATIONS
      // ═══════════════════════════════════════════════════════════════
      'education': 'education',
      'school': 'education',
      'online-course': 'education',
      'nonprofit': 'nonprofit',
      'church': 'nonprofit',

      // ═══════════════════════════════════════════════════════════════
      // OTHER SERVICES
      // ═══════════════════════════════════════════════════════════════
      'pet-services': 'pet-services',
      'moving': 'moving',
      'event-venue': 'event-venue',
      'hotel': 'hotel',
      'travel': 'travel',
      'musician': 'musician',
      'podcast': 'podcast',
      'gaming': 'gaming'
    };

    // Ensure industry is set - map to assembler-compatible key
    const fixtureIndustry = prospect.fixtureId || fixture.type || 'restaurant';
    const industry = FIXTURE_TO_ASSEMBLER[fixtureIndustry] || fixtureIndustry;
    customizedFixture.business.industry = industry;

    // Store tier/package/layout info in prospect for reference
    prospect.testTier = tier;
    prospect.testPages = pages;
    prospect.testFeatures = features;
    prospect.testLayout = layout;
    prospect.industryGroup = industryGroup;
    prospect.testArchetype = archetype;

    // Clear full-test directory if exists (assembler will create it)
    // Use effectiveFolder for variant naming (e.g., bakery-luxury, bakery-local)
    const testDirName = variantSuffix ? `full-test${variantSuffix}` : 'full-test';
    const testDir = path.join(prospectDir, testDirName);
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
      console.log(`🔄 Cleared existing test directory: ${testDirName}`);
    }

    const generationStartTime = Date.now();

    console.log(`\n🏗️ FULL STACK TEST: ${effectiveFolder}`);
    console.log(`   Tier: ${tier}`);
    console.log(`   Pages: ${pages.join(', ') || 'all'}`);
    console.log(`   Features: ${features.join(', ') || 'all'}`);
    console.log(`   Layout: ${layout || 'default'}`);
    console.log(`   Industry Group: ${industryGroup || 'auto'}`);
    console.log(`   Archetype: ${archetype || 'default'}`);
    if (moodSliders) {
      console.log(`   🎚️ Mood: theme=${moodSliders.theme || 'light'}, era=${moodSliders.era || 50}, vibe=${moodSliders.vibe || 50}`);
    }
    console.log(`   Fixture: ${prospect.fixtureId}`);
    console.log(`   Industry: ${industry}`);
    console.log(`   Output: ${testDir}`);

    // Run the assembler script (same as orchestrator/QuickStart mode)
    // The assembler creates OUTPUT_PATH/name so we use prospectDir + 'full-test' as name
    const assemblePromise = new Promise((resolve, reject) => {
      const args = [
        ASSEMBLE_SCRIPT,
        '--name', 'full-test',
        '--industry', industry
      ];

      console.log(`   📂 OUTPUT_PATH: ${prospectDir}`);
      console.log(`   📂 MODULE_LIBRARY: ${MODULE_LIBRARY}`);
      console.log(`   📂 SCRIPT: ${ASSEMBLE_SCRIPT}`);

      const child = spawn('node', args, {
        cwd: MODULE_LIBRARY,
        env: {
          ...process.env,
          MODULE_LIBRARY_PATH: MODULE_LIBRARY,
          OUTPUT_PATH: prospectDir
        }
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
        console.log(data.toString());
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
        console.error(data.toString());
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(`Assembler exited with code ${code}: ${stderr}`));
        }
      });

      child.on('error', reject);
    });

    await assemblePromise;

    // Now replace the generic frontend with styled pages from MasterAgent
    console.log('\n🎨 Generating styled frontend pages...');
    const frontendDir = path.join(testDir, 'frontend');

    // Delete the assembler's generic frontend
    if (fs.existsSync(frontendDir)) {
      fs.rmSync(frontendDir, { recursive: true, force: true });
      console.log('   🗑️ Removed generic frontend');
    }

    // Convert page labels to page keys (e.g., "Services" → "services", "Order Online" → "order-online")
    const normalizePageKey = (label) => {
      return label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    };
    let normalizedPages = pages.map(normalizePageKey);

    // Add portal pages if enabled (login, register, dashboard, profile, etc.)
    const PORTAL_PAGES = ['login', 'register', 'dashboard', 'profile', 'account', 'rewards'];
    if (enablePortal) {
      // Add portal pages that aren't already in the list
      PORTAL_PAGES.forEach(page => {
        if (!normalizedPages.includes(page)) {
          normalizedPages.push(page);
        }
      });
      console.log('   🔐 Portal enabled - added auth pages:', PORTAL_PAGES.join(', '));
    }

    // Use MasterAgent to create styled frontend with requested pages
    const master = new MasterAgent({ verbose: false });
    const frontendResult = await master.generateProject({
      projectName: effectiveFolder,
      fixtureId: prospect.fixtureId || 'restaurant',
      testMode: true,
      runBuild: false, // We'll build after
      outputPath: testDir,
      prospectData: prospect,
      // Pass the requested pages from tier selection (normalized to keys)
      requestedPages: normalizedPages.length > 0 ? normalizedPages : null,
      requestedFeatures: features.length > 0 ? features : null,
      tier: tier,
      // Pass layout selection from UI
      layout: layout,
      industryGroup: industryGroup,
      // Pass mood sliders for styling (vibe, energy, era, density, price, theme)
      moodSliders: moodSliders,
      // Pass archetype for artisan food industries (local, luxury, ecommerce)
      archetype: archetype,
      // Enable portal/auth system (login, register, dashboard pages)
      enablePortal: enablePortal
    });

    if (!frontendResult.success) {
      console.warn('⚠️ MasterAgent frontend generation had issues:', frontendResult.errors);
    } else {
      console.log('   ✅ Styled frontend pages generated');
    }

    // Generate Test Dashboard page
    console.log('\n📊 Generating Test Dashboard...');
    const generationEndTime = Date.now();
    try {
      writeTestDashboard(testDir, {
        projectName: folder,
        industry,
        prospect,
        generationTimeMs: generationEndTime - generationStartTime,
        deploymentUrl: `https://test-${folder}.be1st.io`,
        adminUrl: `https://admin.test-${folder}.be1st.io`,
        backendUrl: `https://api.test-${folder}.be1st.io`,
        adminCredentials: { email: 'admin@be1st.io', password: 'admin1234' }
      });
    } catch (dashErr) {
      console.warn('⚠️ Test dashboard generation failed:', dashErr.message);
    }

    // Generate video metadata and placeholder assets
    // skipVideo param allows skipping for 2nd/3rd variants in multi-variant mode
    const skipVideo = req.body.skipVideo || false;
    let videoResult = null;
    if (!skipVideo) {
      console.log('\n🎬 Generating video assets...');
      try {
        const videoGenerator = new VideoGenerator(testDir);
        videoResult = await videoGenerator.generateVideos();
        if (videoResult.success) {
          console.log('   ✅ Video assets generated');
          if (videoResult.placeholder) {
            console.log('   📝 Note: Remotion not installed - video metadata saved for future rendering');
          }
        }
      } catch (videoErr) {
        console.warn('⚠️ Video generation failed:', videoErr.message);
      }
    } else {
      console.log('\n🎬 Skipping video generation (already generated for first variant)');
    }

    // Generate logo variants
    // skipLogo param allows skipping for 2nd/3rd variants in multi-variant mode
    const skipLogo = req.body.skipLogo || false;
    let logoResult = null;
    if (!skipLogo) {
      console.log('\n🎨 Generating logo variants...');
      try {
        const logoGenerator = new LogoGenerator(testDir);
        logoResult = await logoGenerator.generateLogos();
        if (logoResult.success) {
          console.log('   ✅ Logo variants generated:');
          logoResult.files.forEach(f => console.log(`      - ${f}`));
        }
      } catch (logoErr) {
        console.warn('⚠️ Logo generation failed:', logoErr.message);
      }
    } else {
      console.log('🎨 Skipping logo generation (already generated for first variant)');
    }

    // Build the frontend for local preview
    console.log('\n📦 Building frontend for preview...');
    if (fs.existsSync(frontendDir)) {
      const { execSync } = require('child_process');
      try {
        execSync('npm install --legacy-peer-deps', {
          cwd: frontendDir,
          stdio: 'inherit',
          timeout: 180000
        });
        execSync('npm run build', {
          cwd: frontendDir,
          stdio: 'inherit',
          timeout: 180000
        });
        console.log('✅ Frontend built successfully');
      } catch (buildErr) {
        console.warn('⚠️ Frontend build failed:', buildErr.message);
        // Continue anyway - deploy will build on Railway
      }
    }

    // Calculate final generation time
    const totalGenerationTimeMs = Date.now() - generationStartTime;

    // Update prospect status
    prospect.status = 'test-generated';
    prospect.testGenerated = true;
    prospect.fullStackTest = true;
    prospect.testGeneratedAt = new Date().toISOString();
    prospect.testUrl = `test-${folder}.be1st.io`;
    prospect.testPath = testDir;
    prospect.generationTimeMs = totalGenerationTimeMs;
    delete prospect.verified;
    delete prospect.verifiedAt;
    fs.writeFileSync(prospectFile, JSON.stringify(prospect, null, 2));

    console.log(`\n✅ Full stack test generated in ${(totalGenerationTimeMs / 1000).toFixed(1)}s`);
    console.log(`   📊 Test Dashboard: /test-dashboard`);

    res.json({
      success: true,
      status: 'full-test-generated',
      testPath: testDir,
      testUrl: prospect.testUrl,
      dashboardUrl: '/test-dashboard',
      fullStack: true,
      tier,
      pages,
      features,
      archetype: archetype || null,
      variantSuffix: variantSuffix || null,
      effectiveProjectName: effectiveFolder,
      components: ['frontend', 'backend', 'admin', 'database'],
      generationTimeMs: totalGenerationTimeMs,
      video: videoResult ? {
        generated: videoResult.success,
        placeholder: videoResult.placeholder || false,
        metadataPath: videoResult.metadataPath || null,
        specPath: videoResult.specPath || null,
        thumbnailPath: videoResult.thumbnailPath || null
      } : null,
      logo: logoResult ? {
        generated: logoResult.success,
        outputDir: logoResult.outputDir,
        files: logoResult.files
      } : null
    });

  } catch (err) {
    console.error('Full stack test generation error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/scout/prospects/:folder/verify
 * Mark test as verified
 */
router.post('/prospects/:folder/verify', async (req, res) => {
  const { folder } = req.params;

  try {
    const prospectFile = path.join(PROSPECTS_DIR, folder, 'prospect.json');

    if (!fs.existsSync(prospectFile)) {
      return res.status(404).json({ error: 'Prospect not found' });
    }

    const prospect = JSON.parse(fs.readFileSync(prospectFile, 'utf-8'));
    prospect.verified = true;
    prospect.verifiedAt = new Date().toISOString();
    fs.writeFileSync(prospectFile, JSON.stringify(prospect, null, 2));

    res.json({ success: true, status: 'verified' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/scout/prospects/:folder/delete-variant
 * Delete a specific archetype variant (local files only)
 * Used when comparing multiple generated variants
 */
router.post('/prospects/:folder/delete-variant', async (req, res) => {
  const { folder } = req.params;
  const { variantSuffix } = req.body || {};

  try {
    if (!variantSuffix) {
      return res.status(400).json({ error: 'variantSuffix is required' });
    }

    const prospectDir = path.join(PROSPECTS_DIR, folder);
    const variantDir = path.join(prospectDir, `full-test${variantSuffix}`);

    if (!fs.existsSync(variantDir)) {
      return res.status(404).json({ error: 'Variant directory not found' });
    }

    // Delete the variant directory
    fs.rmSync(variantDir, { recursive: true, force: true });
    console.log(`🗑️ Deleted variant: ${folder}${variantSuffix}`);

    res.json({
      success: true,
      deleted: variantDir,
      message: `Variant ${variantSuffix} deleted`
    });

  } catch (err) {
    console.error('Delete variant error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/scout/prospects/:folder/variants
 * Get all existing archetype variants for a prospect
 * Used to show the compare modal for prospects with previously generated variants
 */
router.get('/prospects/:folder/variants', (req, res) => {
  const { folder } = req.params;

  try {
    const prospectDir = path.join(PROSPECTS_DIR, folder);

    if (!fs.existsSync(prospectDir)) {
      return res.status(404).json({ error: 'Prospect not found' });
    }

    // Load prospect info
    const prospectFile = path.join(prospectDir, 'prospect.json');
    let prospect = { name: folder };
    if (fs.existsSync(prospectFile)) {
      prospect = JSON.parse(fs.readFileSync(prospectFile, 'utf-8'));
    }

    // Find all variant directories
    const dirs = fs.readdirSync(prospectDir);
    const variants = [];

    // Archetype config
    const archetypeConfig = {
      'full-test-local': { id: 'local', archetype: 'local', name: 'Local / Community', color: '#22c55e', icon: '🏘️' },
      'full-test-luxury': { id: 'luxury', archetype: 'luxury', name: 'Brand Story / Luxury', color: '#8b5cf6', icon: '✨' },
      'full-test-ecommerce': { id: 'ecommerce', archetype: 'ecommerce', name: 'E-Commerce Focus', color: '#3b82f6', icon: '🛒' }
    };

    // Check for standard full-test first
    if (dirs.includes('full-test')) {
      const distDir = path.join(prospectDir, 'full-test', 'frontend', 'dist');
      if (fs.existsSync(distDir)) {
        variants.push({
          id: 'default',
          archetype: 'default',
          name: 'Default',
          color: '#6B7280',
          icon: '📄',
          success: true,
          previewUrl: `/prospect-preview/${folder}`
        });
      }
    }

    // Check for archetype variants (legacy 3-archetype system)
    for (const dir of dirs) {
      if (archetypeConfig[dir]) {
        const distDir = path.join(prospectDir, dir, 'frontend', 'dist');
        if (fs.existsSync(distDir)) {
          const config = archetypeConfig[dir];
          variants.push({
            ...config,
            success: true,
            previewUrl: `/prospect-preview/${folder}/${dir}/frontend/`
          });
        }
      }
    }

    // Check for new 18-variant system (preset-theme combinations)
    for (const dir of dirs) {
      if (dir.startsWith('full-test-') && !archetypeConfig[dir]) {
        const variantKey = dir.replace('full-test-', '');
        const distDir = path.join(prospectDir, dir, 'frontend', 'dist');

        // Try to load variant metrics for detailed info
        const metricsFile = path.join(prospectDir, dir, 'variant-metrics.json');
        let variantInfo = null;

        if (fs.existsSync(metricsFile)) {
          try {
            variantInfo = JSON.parse(fs.readFileSync(metricsFile, 'utf-8'));
          } catch (e) {}
        }

        if (fs.existsSync(distDir)) {
          variants.push({
            id: variantKey,
            key: variantKey,
            preset: variantInfo?.preset || variantKey.split('-').slice(0, -1).join('-'),
            presetName: variantInfo?.presetName || variantKey,
            presetIcon: variantInfo?.presetIcon || '🎨',
            presetColor: variantInfo?.presetColor || '#6B7280',
            theme: variantInfo?.theme || variantKey.split('-').pop(),
            name: variantInfo?.presetName ? `${variantInfo.presetName} (${variantInfo.theme})` : variantKey,
            color: variantInfo?.presetColor || '#6B7280',
            icon: variantInfo?.presetIcon || '🎨',
            success: true,
            pages: variantInfo?.pages || 0,
            linesOfCode: variantInfo?.linesOfCode || 0,
            generationTimeMs: variantInfo?.generationTimeMs || 0,
            previewUrl: `/prospect-preview/${folder}/${dir}/frontend/`
          });
        }
      }
    }

    // Get additional stats
    let logoCount = 0;
    let videoCount = 0;
    let totalPages = 0;

    // Count logos if they exist
    const logoDir = path.join(prospectDir, 'logos');
    if (fs.existsSync(logoDir)) {
      logoCount = fs.readdirSync(logoDir).filter(f => f.endsWith('.svg') || f.endsWith('.png')).length;
    }

    // Count videos
    const videoDir = path.join(prospectDir, 'videos');
    if (fs.existsSync(videoDir)) {
      videoCount = fs.readdirSync(videoDir).filter(f => f.endsWith('.mp4')).length;
    }

    // Count pages (estimate 7 per variant)
    totalPages = variants.length * 7;

    res.json({
      success: true,
      folder,
      prospect: {
        name: prospect.name,
        folder,
        fixtureId: prospect.fixtureId,
        industry: prospect.fixtureId
      },
      variants,
      stats: {
        variantCount: variants.length,
        totalPages,
        logoCount: logoCount || 7, // Default if not generated
        videoCount: videoCount || 1 // Default if not generated
      }
    });

  } catch (err) {
    console.error('Get variants error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/scout/prospects/:folder/reset
 * Reset prospect to scouted status - clears all generated files
 * If deployed, also deletes from Railway, GitHub, Cloudflare
 */
router.post('/prospects/:folder/reset', async (req, res) => {
  const { folder } = req.params;
  const { fullDelete = true } = req.body || {}; // Default to full delete

  try {
    const prospectDir = path.join(PROSPECTS_DIR, folder);
    const prospectFile = path.join(prospectDir, 'prospect.json');

    if (!fs.existsSync(prospectFile)) {
      return res.status(404).json({ error: 'Prospect not found' });
    }

    const prospect = JSON.parse(fs.readFileSync(prospectFile, 'utf-8'));
    const wasDeployed = prospect.deployed || prospect.deployedUrl;
    const deleteResults = { local: false, cloud: false };

    // If deployed and fullDelete requested, use project-deleter for complete cleanup
    if (wasDeployed && fullDelete) {
      console.log(`\n🗑️ Full reset for deployed prospect: ${folder}`);
      console.log(`   Deleting from: Railway, GitHub, Cloudflare, Local`);

      try {
        // Determine the project name used for deployment
        const environment = prospect.deployEnvironment || 'test';
        const baseProjectName = environment === 'test' ? `test-${folder}` : folder;

        // Delete main deployment
        const result = await deleteProject(baseProjectName, {
          dryRun: false,
          localOnly: false,
          skipVerification: false
        });

        deleteResults.cloud = result.success;
        console.log(`   ✅ Main project deleted: ${baseProjectName}`);

        // Also delete any variant deployments (local, luxury, ecommerce)
        const variantSuffixes = ['-local', '-luxury', '-ecommerce'];
        for (const suffix of variantSuffixes) {
          const variantProjectName = `${baseProjectName}${suffix}`;
          try {
            console.log(`   🔍 Checking for variant: ${variantProjectName}...`);
            const variantResult = await deleteProject(variantProjectName, {
              dryRun: false,
              localOnly: false,
              skipVerification: true // Skip verification for variants to speed up
            });
            if (variantResult.success) {
              console.log(`   ✅ Variant deleted: ${variantProjectName}`);
            }
          } catch (variantErr) {
            // Variant might not exist, that's fine
            console.log(`   ℹ️ Variant ${variantProjectName} not found or already deleted`);
          }
        }

        // Also delete from database if we have a generation ID
        if (prospect.generationId) {
          try {
            await db.query('DELETE FROM generated_projects WHERE id = $1', [prospect.generationId]);
            console.log(`   ✅ Removed from Generations database (ID: ${prospect.generationId})`);
          } catch (dbErr) {
            console.warn(`   ⚠️ DB cleanup failed: ${dbErr.message}`);
          }
        }

        // Also try to delete any variant entries from database
        try {
          const variantNames = variantSuffixes.map(s => `${baseProjectName}${s}`);
          await db.query(
            'DELETE FROM generated_projects WHERE name = ANY($1::text[])',
            [variantNames]
          );
        } catch (dbErr) {
          // Non-critical - might not have any variant entries
        }
      } catch (deleteErr) {
        console.warn(`   ⚠️ Cloud delete failed (continuing): ${deleteErr.message}`);
      }
    }

    // Delete local test directories with process cleanup and retry
    const testDir = path.join(prospectDir, 'test');
    const fullTestDir = path.join(prospectDir, 'full-test');

    // Helper to kill processes holding a folder (Windows-specific)
    const killProcessesHoldingFolder = async (dirPath) => {
      if (process.platform !== 'win32') return;

      try {
        const { execSync } = require('child_process');
        // Kill any node processes that might be running Vite in this folder
        // This is safe - only kills processes with this specific path in command line
        const psCommand = `Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.Path -and $_.MainModule.FileName } | ForEach-Object { $_.Id }`;
        try {
          execSync(`powershell -Command "${psCommand}"`, { stdio: 'pipe' });
        } catch (e) {
          // Ignore - no matching processes
        }

        // Also try to release any handles using handle64 if available, or just wait
        // Most reliable: just kill child node processes spawned by this server
        console.log(`   🔧 Attempting to release file handles on ${path.basename(dirPath)}...`);

        // Use rimraf-style deletion with retries and handle closing
        await new Promise(r => setTimeout(r, 500));
      } catch (e) {
        // Non-fatal - continue with deletion attempt
      }
    };

    const deleteWithRetry = async (dirPath, dirName) => {
      if (!fs.existsSync(dirPath)) {
        return true; // Doesn't exist, success
      }

      // First, try to kill any processes holding the folder
      await killProcessesHoldingFolder(dirPath);

      for (let attempt = 1; attempt <= 5; attempt++) {
        try {
          fs.rmSync(dirPath, { recursive: true, force: true, maxRetries: 3, retryDelay: 500 });
          console.log(`🗑️ Deleted ${dirName} directory: ${folder}/${dirName}`);
          return true;
        } catch (err) {
          if ((err.code === 'EBUSY' || err.code === 'EPERM' || err.code === 'ENOTEMPTY') && attempt < 5) {
            console.log(`   ⏳ Folder busy, retrying in ${attempt}s... (attempt ${attempt}/5)`);

            // On Windows, try taskkill for node processes as a last resort on attempt 3+
            if (process.platform === 'win32' && attempt >= 3) {
              try {
                const { execSync } = require('child_process');
                // Kill any orphaned vite/node dev server processes
                execSync('taskkill /F /IM node.exe /FI "WINDOWTITLE eq npm*" 2>nul', {
                  stdio: 'pipe',
                  shell: true
                });
              } catch (e) {
                // Expected to fail if no matching processes
              }
            }

            await new Promise(r => setTimeout(r, attempt * 1000));
          } else {
            console.warn(`   ⚠️ Could not delete ${dirName}: ${err.message}`);
            // On final failure, try PowerShell Remove-Item as last resort on Windows
            if (process.platform === 'win32') {
              try {
                const { execSync } = require('child_process');
                console.log(`   🔧 Trying PowerShell force delete...`);
                execSync(`powershell -Command "Remove-Item -Path '${dirPath}' -Recurse -Force -ErrorAction SilentlyContinue"`, {
                  stdio: 'pipe',
                  shell: true
                });
                if (!fs.existsSync(dirPath)) {
                  console.log(`🗑️ Deleted ${dirName} directory via PowerShell: ${folder}/${dirName}`);
                  return true;
                }
              } catch (psErr) {
                console.warn(`   ⚠️ PowerShell delete also failed`);
              }
            }
            return false;
          }
        }
      }
      return false;
    };

    await deleteWithRetry(testDir, 'test');
    await deleteWithRetry(fullTestDir, 'full-test');

    // Also delete archetype variant directories (full-test-local, full-test-luxury, full-test-ecommerce)
    const archetypeVariants = ['full-test-local', 'full-test-luxury', 'full-test-ecommerce'];
    for (const variant of archetypeVariants) {
      const variantDir = path.join(prospectDir, variant);
      if (fs.existsSync(variantDir)) {
        await deleteWithRetry(variantDir, variant);
      }
    }

    // Also delete ai-generated directory if it exists
    const aiDir = path.join(prospectDir, 'ai-generated');
    if (fs.existsSync(aiDir)) {
      await deleteWithRetry(aiDir, 'ai-generated');
    }

    // Delete logos and videos directories (regenerated on next build)
    const logosDir = path.join(prospectDir, 'logos');
    const videosDir = path.join(prospectDir, 'videos');
    if (fs.existsSync(logosDir)) {
      await deleteWithRetry(logosDir, 'logos');
    }
    if (fs.existsSync(videosDir)) {
      await deleteWithRetry(videosDir, 'videos');
    }

    deleteResults.local = true;

    // Reset prospect.json - keep only original scouted data
    // Clear all generation/deployment fields
    delete prospect.status;
    delete prospect.testGenerated;
    delete prospect.testGeneratedAt;
    delete prospect.testUrl;
    delete prospect.testPath;
    delete prospect.fullStackTest;
    delete prospect.verified;
    delete prospect.verifiedAt;
    delete prospect.deployed;
    delete prospect.deployedAt;
    delete prospect.deployedUrl;
    delete prospect.deployEnvironment;
    delete prospect.fullStackDeployed;
    delete prospect.backendUrl;
    delete prospect.adminUrl;
    delete prospect.generationId;

    // Set back to scouted
    prospect.status = 'scouted';

    fs.writeFileSync(prospectFile, JSON.stringify(prospect, null, 2));

    console.log(`↩️ Reset prospect to scouted: ${folder}`);

    res.json({
      success: true,
      status: 'scouted',
      wasDeployed,
      deleteResults
    });

  } catch (err) {
    console.error('Reset error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/scout/prospects/:folder/generate-ai
 * Generate AI version using Claude (costs ~$0.15-$1.20 depending on tier)
 *
 * Request body: { tier: 'essential' | 'recommended' | 'premium', pages: [...], features: [...] }
 */
router.post('/prospects/:folder/generate-ai', async (req, res) => {
  const { folder } = req.params;
  const { tier = 'recommended', pages = [], features = [] } = req.body;
  const startTime = Date.now();

  try {
    const prospectDir = path.join(PROSPECTS_DIR, folder);
    const prospectFile = path.join(prospectDir, 'prospect.json');

    if (!fs.existsSync(prospectFile)) {
      return res.status(404).json({ error: 'Prospect not found' });
    }

    const prospect = JSON.parse(fs.readFileSync(prospectFile, 'utf-8'));
    const aiDir = path.join(prospectDir, 'ai-generated');

    console.log(`\n🤖 AI Generation for: ${prospect.name}`);
    console.log(`   Tier: ${tier}`);
    console.log(`   Pages: ${pages.join(', ')}`);
    console.log(`   Features: ${features.join(', ')}`);

    // Load orchestrator
    const { orchestrate } = require('../../services/orchestrator.cjs');

    // Build the input string for orchestrator
    const inputParts = [
      `Create a ${tier} website for ${prospect.name}`,
      prospect.fixtureId ? `Industry: ${prospect.fixtureId}` : '',
      prospect.address ? `Location: ${prospect.address}` : '',
      prospect.phone ? `Phone: ${prospect.phone}` : '',
      pages.length > 0 ? `Pages: ${pages.join(', ')}` : '',
      features.length > 0 ? `Features: ${features.join(', ')}` : ''
    ].filter(Boolean).join('. ');

    console.log(`   Input: ${inputParts.substring(0, 100)}...`);

    // Call orchestrator with prospect data
    const result = await orchestrate(inputParts, {
      deviceTarget: 'both',
      industryKey: prospect.fixtureId || null
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'AI orchestration failed'
      });
    }

    // Copy generated files to prospect's ai-generated directory
    const generatedPath = result.projectPath || result.outputPath;
    if (generatedPath && fs.existsSync(generatedPath)) {
      // Clear old ai-generated if exists
      if (fs.existsSync(aiDir)) {
        fs.rmSync(aiDir, { recursive: true, force: true });
      }

      // Copy new generation
      const copyDir = (src, dest) => {
        fs.mkdirSync(dest, { recursive: true });
        const entries = fs.readdirSync(src, { withFileTypes: true });
        for (const entry of entries) {
          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);
          if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
          } else {
            fs.copyFileSync(srcPath, destPath);
          }
        }
      };
      copyDir(generatedPath, aiDir);
      console.log(`   ✅ Copied AI generated files to ${aiDir}`);
    }

    // Update prospect status
    prospect.aiGenerated = true;
    prospect.aiGeneratedAt = new Date().toISOString();
    prospect.aiTier = tier;
    prospect.aiPages = pages;
    prospect.aiFeatures = features;
    fs.writeFileSync(prospectFile, JSON.stringify(prospect, null, 2));

    const generationTime = Date.now() - startTime;
    console.log(`   ✅ AI Generation complete in ${(generationTime / 1000).toFixed(1)}s`);

    res.json({
      success: true,
      message: `AI generated ${tier} site for ${prospect.name}`,
      tier,
      pages,
      features,
      generationTimeMs: generationTime,
      projectPath: aiDir
    });

  } catch (err) {
    console.error('AI generation error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/scout/prospects/:folder/deploy
 * Deploy to be1st.io via Railway
 * Supports both frontend-only (test) and full-stack (full-test) deployments
 * Also supports variant deployments with variantSuffix for archetype comparison
 */
router.post('/prospects/:folder/deploy', async (req, res) => {
  const { folder } = req.params;
  const {
    environment = 'test',
    variantSuffix = null,  // For deploying specific archetype variant (e.g., '-luxury')
    projectName: customProjectName = null  // Custom project name for variants
  } = req.body;

  try {
    const prospectDir = path.join(PROSPECTS_DIR, folder);
    const prospectFile = path.join(prospectDir, 'prospect.json');
    const testDir = path.join(prospectDir, 'test');

    // Support variant directories (e.g., full-test-luxury, full-test-local)
    const fullTestDirName = variantSuffix ? `full-test${variantSuffix}` : 'full-test';
    const fullTestDir = path.join(prospectDir, fullTestDirName);

    if (!fs.existsSync(prospectFile)) {
      return res.status(404).json({ error: 'Prospect not found' });
    }

    // Determine which test directory to use
    // Prefer full-test (or variant) if it exists, otherwise use regular test
    const hasFullTest = fs.existsSync(fullTestDir) && fs.existsSync(path.join(fullTestDir, 'frontend'));
    const hasTest = fs.existsSync(testDir) && fs.existsSync(path.join(testDir, 'frontend', 'dist'));
    const isFullStack = hasFullTest;
    const deployDir = isFullStack ? fullTestDir : testDir;

    if (!hasFullTest && !hasTest) {
      return res.status(400).json({
        error: variantSuffix
          ? `No variant test found for ${variantSuffix}. Generate test first.`
          : 'No test site found. Generate test first.',
        hint: 'Click "🧪 Test" for frontend-only or "🏗️ Full Stack" for full stack'
      });
    }

    const prospect = JSON.parse(fs.readFileSync(prospectFile, 'utf-8'));

    // Check deploy credentials
    if (!deployService.checkCredentials()) {
      return res.status(500).json({
        error: 'Deploy service not configured',
        hint: 'Check .env for RAILWAY_TOKEN and GITHUB_TOKEN'
      });
    }

    // Determine subdomain - test sites get "test-" prefix
    // Variant suffix is for internal selection only, NOT included in deployed URL
    // Test: test-cristys-cake-shop.be1st.io
    // Production: cristys-cake-shop.be1st.io
    const sanitizedFolder = folder.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const baseSubdomain = environment === 'test' ? `test-${sanitizedFolder}` : sanitizedFolder;
    const subdomain = customProjectName || baseSubdomain;
    const projectName = subdomain;

    console.log(`\n🚀 Deploying prospect: ${folder} as ${subdomain}.be1st.io`);
    console.log(`   Mode: ${isFullStack ? 'FULL STACK (frontend + backend + admin)' : 'Frontend Only'}`);
    console.log(`   Source: ${deployDir}`);

    // Deploy using the deploy service
    const result = await deployService.deployProject(
      deployDir,
      projectName,
      {
        adminEmail: 'admin@be1st.io',
        frontendOnly: !isFullStack,  // Full stack if full-test exists
        onProgress: (progress) => {
          console.log(`  📦 ${progress.step}: ${progress.message || ''}`);
        }
      }
    );

    if (result.success) {
      // Update prospect with deployment info
      prospect.status = 'deployed';
      prospect.deployed = true;
      prospect.deployedAt = new Date().toISOString();
      prospect.deployedUrl = result.frontendUrl || `https://${subdomain}.be1st.io`;
      prospect.deployEnvironment = environment;
      prospect.fullStackDeployed = isFullStack;

      // Track all URLs for full-stack deployments
      if (isFullStack && result.backendUrl) {
        prospect.backendUrl = result.backendUrl;
      }
      if (isFullStack && result.adminUrl) {
        prospect.adminUrl = result.adminUrl;
      }

      // Store admin credentials for the deployed site (NOT the BLINK platform admin)
      // These are for the generated business site's backend/admin panel
      if (result.credentials) {
        prospect.siteAdminCredentials = {
          email: result.credentials.adminEmail,
          password: result.credentials.adminPassword,
          note: 'Credentials for the deployed business site admin panel'
        };
      }

      fs.writeFileSync(prospectFile, JSON.stringify(prospect, null, 2));

      // Track deployment in database so it shows in Generations page
      try {
        const generationId = await db.trackGenerationStart({
          siteName: prospect.name || folder,
          industry: prospect.industry || 'general',
          templateUsed: 'scout-prospect',
          modulesSelected: [],
          pagesGenerated: 0
        });

        await db.updateProjectDeploymentUrls(generationId, {
          frontendUrl: prospect.deployedUrl,
          adminUrl: prospect.adminUrl || null,
          backendUrl: prospect.backendUrl || null,
          railwayProjectId: result.railwayProjectId || null,
          railwayProjectUrl: result.railwayUrl || null,
          githubFrontend: result.githubFrontend || null,
          githubBackend: result.githubBackend || null,
          githubAdmin: result.githubAdmin || null
        });

        console.log(`   📊 Tracked in Generations database (ID: ${generationId})`);

        // Store generation ID in prospect for future reference
        prospect.generationId = generationId;
        fs.writeFileSync(prospectFile, JSON.stringify(prospect, null, 2));
      } catch (dbErr) {
        console.warn('⚠️ Database tracking failed (non-critical):', dbErr.message);
      }

      // Generate test manifest for browser testing (ClawdBot/Claude --chrome)
      let testManifest = null;
      try {
        console.log('\n📋 Generating browser test manifest...');
        const manifestGenerator = new TestManifestGenerator(deployDir);
        const manifestResult = manifestGenerator.generate(prospect.deployedUrl);
        testManifest = {
          manifestPath: manifestResult.outputPath,
          instructionsPath: manifestResult.instructionsPath
        };
        console.log(`   ✅ Test manifest generated: ${manifestResult.outputPath}`);
        console.log(`   ✅ Test instructions: ${manifestResult.instructionsPath}`);
        console.log(`\n   🧪 To run browser tests:`);
        console.log(`      ClawdBot: GET /api/browser-test/clawdbot-message/${folder}`);
        console.log(`      Claude:   claude --chrome "Test ${prospect.deployedUrl}"`);
      } catch (manifestErr) {
        console.warn('⚠️ Test manifest generation failed:', manifestErr.message);
      }

      res.json({
        success: true,
        url: prospect.deployedUrl,
        environment,
        fullStack: isFullStack,
        backendUrl: isFullStack ? result.backendUrl : null,
        adminUrl: isFullStack ? result.adminUrl : null,
        siteAdminCredentials: result.credentials || null,
        deployResult: result,
        testManifest
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Deployment failed',
        details: result
      });
    }

  } catch (err) {
    console.error('Deploy error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/scout/prospects/:folder
 * Delete a prospect - includes full cleanup from Railway, GitHub, Cloudflare if deployed
 */
router.delete('/prospects/:folder', async (req, res) => {
  const { folder } = req.params;
  const { localOnly = false } = req.query;

  try {
    const prospectDir = path.join(PROSPECTS_DIR, folder);
    const prospectFile = path.join(prospectDir, 'prospect.json');

    if (!fs.existsSync(prospectDir)) {
      return res.status(404).json({ error: 'Prospect not found' });
    }

    const deleteResults = { local: false, cloud: false, database: false };

    // Check if prospect was deployed
    let prospect = null;
    if (fs.existsSync(prospectFile)) {
      prospect = JSON.parse(fs.readFileSync(prospectFile, 'utf-8'));
    }

    const wasDeployed = prospect?.deployed || prospect?.deployedUrl;

    // If deployed and not localOnly, do full cloud cleanup
    if (wasDeployed && !localOnly) {
      console.log(`\n🗑️ Full delete for deployed prospect: ${folder}`);

      try {
        const environment = prospect.deployEnvironment || 'test';
        const baseProjectName = environment === 'test' ? `test-${folder}` : folder;

        // Delete main deployment
        const result = await deleteProject(baseProjectName, {
          dryRun: false,
          localOnly: false,
          skipVerification: false
        });

        deleteResults.cloud = result.success;
        console.log(`   ✅ Main project deleted: ${baseProjectName}`);

        // Also delete any variant deployments (local, luxury, ecommerce)
        const variantSuffixes = ['-local', '-luxury', '-ecommerce'];
        for (const suffix of variantSuffixes) {
          const variantProjectName = `${baseProjectName}${suffix}`;
          try {
            console.log(`   🔍 Checking for variant: ${variantProjectName}...`);
            const variantResult = await deleteProject(variantProjectName, {
              dryRun: false,
              localOnly: false,
              skipVerification: true
            });
            if (variantResult.success) {
              console.log(`   ✅ Variant deleted: ${variantProjectName}`);
            }
          } catch (variantErr) {
            console.log(`   ℹ️ Variant ${variantProjectName} not found or already deleted`);
          }
        }
      } catch (cloudErr) {
        console.warn(`   ⚠️ Cloud cleanup failed: ${cloudErr.message}`);
      }

      // Remove from database
      if (prospect?.generationId) {
        try {
          await db.query('DELETE FROM generated_projects WHERE id = $1', [prospect.generationId]);
          deleteResults.database = true;
          console.log(`   ✅ Removed from Generations database`);
        } catch (dbErr) {
          console.warn(`   ⚠️ DB cleanup failed: ${dbErr.message}`);
        }
      }

      // Also try to delete any variant entries from database
      try {
        const environment = prospect?.deployEnvironment || 'test';
        const baseProjectName = environment === 'test' ? `test-${folder}` : folder;
        const variantNames = ['-local', '-luxury', '-ecommerce'].map(s => `${baseProjectName}${s}`);
        await db.query(
          'DELETE FROM generated_projects WHERE name = ANY($1::text[])',
          [variantNames]
        );
      } catch (dbErr) {
        // Non-critical
      }
    }

    // Delete local prospect folder
    fs.rmSync(prospectDir, { recursive: true });
    deleteResults.local = true;
    console.log(`🗑️ Deleted prospect folder: ${folder}`);

    res.json({
      success: true,
      wasDeployed,
      deleteResults
    });

  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/scout/prospects/batch-generate-test
 * Generate test versions for multiple prospects
 */
router.post('/prospects/batch-generate-test', async (req, res) => {
  const { folders } = req.body;

  if (!folders || !folders.length) {
    return res.status(400).json({ error: 'No prospects selected' });
  }

  const results = { success: [], failed: [] };

  for (const folder of folders) {
    try {
      const prospectDir = path.join(PROSPECTS_DIR, folder);
      const prospectFile = path.join(prospectDir, 'prospect.json');

      if (!fs.existsSync(prospectFile)) {
        results.failed.push({ folder, error: 'Not found' });
        continue;
      }

      const prospect = JSON.parse(fs.readFileSync(prospectFile, 'utf-8'));
      const testDir = path.join(prospectDir, 'test');

      const master = new MasterAgent({ verbose: false });

      const result = await master.generateProject({
        projectName: folder,
        fixtureId: prospect.fixtureId,
        testMode: true,
        runBuild: true,
        outputPath: testDir,
        prospectData: prospect
      });

      if (result.success) {
        prospect.testGenerated = true;
        prospect.testGeneratedAt = new Date().toISOString();
        prospect.testUrl = `test-${folder}.be1st.io`;
        fs.writeFileSync(prospectFile, JSON.stringify(prospect, null, 2));
        results.success.push({ folder, url: prospect.testUrl });
      } else {
        results.failed.push({ folder, errors: result.errors });
      }
    } catch (err) {
      results.failed.push({ folder, error: err.message });
    }
  }

  res.json({
    success: results.failed.length === 0,
    generated: results.success.length,
    failed: results.failed.length,
    results
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 18-VARIANT GENERATION SYSTEM
// Generate 6 presets × 3 industry layouts = 18 style variants with shared video/logo
// Theme (light/dark) is handled by in-app toggle, not separate builds
// ═══════════════════════════════════════════════════════════════════════════

// Import industry layouts for dynamic layout selection
const { INDUSTRY_LAYOUTS, getLayoutCategory } = require('../../config/industry-layouts.cjs');

// Preset configurations (must match MoodSliders.jsx)
const VARIANT_PRESETS = [
  { id: 'luxury', name: 'Luxury', icon: '💎', color: '#8B5CF6', values: { vibe: 30, energy: 35, era: 40, density: 30, price: 90 } },
  { id: 'friendly', name: 'Friendly Local', icon: '🏠', color: '#22C55E', values: { vibe: 80, energy: 60, era: 50, density: 60, price: 40 } },
  { id: 'modern-minimal', name: 'Modern Minimal', icon: '◼️', color: '#64748B', values: { vibe: 50, energy: 40, era: 85, density: 20, price: 70 } },
  { id: 'sharp-corporate', name: 'Sharp & Clean', icon: '📐', color: '#3B82F6', values: { vibe: 35, energy: 45, era: 95, density: 40, price: 65 } },
  { id: 'bold-energetic', name: 'Bold & Fun', icon: '🎉', color: '#F59E0B', values: { vibe: 75, energy: 90, era: 70, density: 70, price: 50 } },
  { id: 'classic-elegant', name: 'Classic Elegant', icon: '🏛️', color: '#78350F', values: { vibe: 25, energy: 30, era: 20, density: 45, price: 80 } }
];

// Get layouts for an industry (returns 3 layout options)
function getIndustryLayouts(fixtureId) {
  // Map fixture IDs to industry layout categories
  const fixtureToCategory = {
    'bakery': 'restaurants-food',
    'restaurant': 'restaurants-food',
    'coffee-cafe': 'restaurants-food',
    'pizza-restaurant': 'restaurants-food',
    'steakhouse': 'restaurants-food',
    'dental': 'dental',
    'healthcare': 'healthcare-medical',
    'salon-spa': 'grooming',
    'barbershop': 'grooming',
    'fitness-gym': 'fitness-wellness',
    'yoga': 'fitness-wellness',
    'law-firm': 'professional-services',
    'real-estate': 'real-estate',
    'plumber': 'home-services',
    'cleaning': 'home-services',
    'auto-shop': 'automotive',
    'saas': 'saas-tech',
    'ecommerce': 'ecommerce-retail',
    'school': 'education'
  };

  const category = fixtureToCategory[fixtureId] || 'professional-services';
  const industryConfig = INDUSTRY_LAYOUTS[category];

  if (!industryConfig || !industryConfig.layouts) {
    // Fallback layouts
    return [
      { id: 'layout-a', name: 'Standard', description: 'Classic layout structure' },
      { id: 'layout-b', name: 'Visual First', description: 'Image-focused layout' },
      { id: 'layout-c', name: 'Conversion', description: 'CTA-optimized layout' }
    ];
  }

  // Convert layouts object to array
  return Object.entries(industryConfig.layouts).map(([id, layout]) => ({
    id,
    name: layout.name,
    description: layout.description,
    sectionOrder: layout.sectionOrder,
    emphasis: layout.emphasis
  }));
}

// Get all 18 variant keys for an industry
function getAllVariantKeys(fixtureId = 'restaurant') {
  const layouts = getIndustryLayouts(fixtureId);
  const keys = [];
  for (const preset of VARIANT_PRESETS) {
    for (const layout of layouts) {
      keys.push(`${preset.id}-${layout.id}`);
    }
  }
  return keys;
}

// Get mood slider values from preset (layout doesn't affect sliders)
function getMoodSlidersFromVariant(presetId) {
  const preset = VARIANT_PRESETS.find(p => p.id === presetId);
  if (!preset) return null;
  return {
    ...preset.values,
    theme: 'light' // Default theme, user can toggle in app
  };
}

/**
 * POST /api/scout/prospects/:folder/generate-variants
 * Generate multiple style variants (up to 18) with shared video/logo
 *
 * Request body:
 * {
 *   selectedVariants: ['luxury-light', 'luxury-dark', ...] || null (all 18),
 *   tier: 'premium',
 *   layout: 'brand-story',
 *   industryGroup: 'Food & Beverage'
 * }
 */
router.post('/prospects/:folder/generate-variants', async (req, res) => {
  const { folder } = req.params;
  const { selectedVariants, tier = 'premium', layout = null, industryGroup = null, skipBuild = false } = req.body;

  try {
    const prospectDir = path.join(PROSPECTS_DIR, folder);
    const prospectFile = path.join(prospectDir, 'prospect.json');

    if (!fs.existsSync(prospectFile)) {
      return res.status(404).json({ error: 'Prospect not found' });
    }

    const prospect = JSON.parse(fs.readFileSync(prospectFile, 'utf-8'));
    const fixtureId = prospect.fixtureId || 'restaurant';
    const industryLayouts = getIndustryLayouts(fixtureId);

    // Determine which variants to generate
    const variantsToGenerate = selectedVariants && selectedVariants.length > 0
      ? selectedVariants
      : getAllVariantKeys(fixtureId);

    console.log(`\n🎨 Starting ${variantsToGenerate.length}-variant generation for ${prospect.name}`);
    console.log(`   Industry: ${fixtureId}, Layouts: ${industryLayouts.map(l => l.id).join(', ')}`);
    console.log(`   Variants: ${variantsToGenerate.join(', ')}`);

    // Master metrics
    const masterMetrics = {
      prospectName: prospect.name,
      folder: folder,
      fixtureId: fixtureId,
      industryLayouts: industryLayouts.map(l => ({ id: l.id, name: l.name })),
      startTime: Date.now(),
      variants: [],
      totalPages: 0,
      totalLinesOfCode: 0,
      totalFiles: 0,
      videoGenerationTime: 0,
      logoGenerationTime: 0,
      sharedAssetsGenerated: false
    };

    // Create shared assets directory
    const sharedDir = path.join(prospectDir, 'shared');
    if (!fs.existsSync(sharedDir)) {
      fs.mkdirSync(sharedDir, { recursive: true });
    }

    // Track shared assets
    let sharedVideoPath = null;
    let sharedLogoPath = null;
    let firstVariantDir = null;

    // Generate each variant
    for (let i = 0; i < variantsToGenerate.length; i++) {
      const variantKey = variantsToGenerate[i];

      // Parse variant key: "preset-layoutId" (e.g., "luxury-appetizing-visual")
      // Find the preset that matches the beginning of the key
      let presetId = null;
      let layoutId = null;
      for (const p of VARIANT_PRESETS) {
        if (variantKey.startsWith(p.id + '-')) {
          presetId = p.id;
          layoutId = variantKey.substring(p.id.length + 1);
          break;
        }
      }

      if (!presetId) {
        console.warn(`⚠️ Could not parse variant key: ${variantKey}, skipping`);
        masterMetrics.variants.push({
          key: variantKey,
          success: false,
          error: 'Could not parse variant key'
        });
        continue;
      }

      const preset = VARIANT_PRESETS.find(p => p.id === presetId);
      const layoutConfig = industryLayouts.find(l => l.id === layoutId);
      const moodSliders = getMoodSlidersFromVariant(presetId);

      if (!moodSliders) {
        console.warn(`⚠️ Unknown preset: ${presetId}, skipping`);
        masterMetrics.variants.push({
          key: variantKey,
          preset: presetId,
          layout: layoutId,
          success: false,
          error: 'Unknown preset'
        });
        continue;
      }

      console.log(`\n📦 [${i + 1}/${variantsToGenerate.length}] Generating variant: ${variantKey}`);
      console.log(`   Preset: ${preset?.name || presetId}, Layout: ${layoutConfig?.name || layoutId}`);

      const variantStartTime = Date.now();
      const variantSuffix = `-${variantKey}`;
      const testDir = path.join(prospectDir, `full-test${variantSuffix}`);

      try {
        // Clear existing variant directory
        if (fs.existsSync(testDir)) {
          fs.rmSync(testDir, { recursive: true, force: true });
        }
        fs.mkdirSync(testDir, { recursive: true });

        // Load and customize fixture
        let fixture;
        try {
          fixture = loadFixture(prospect.fixtureId || 'restaurant');
        } catch (e) {
          fixture = loadFixture('restaurant');
        }

        const customizedFixture = applyCustomizations(fixture, {
          businessName: prospect.name,
          address: prospect.address,
          phone: prospect.phone,
          tagline: prospect.tagline || fixture.business?.tagline
        });

        // Run the full-stack assembler
        const assemblerEnv = {
          ...process.env,
          MODULE_LIBRARY_PATH: MODULE_LIBRARY,
          OUTPUT_PATH: testDir
        };

        await new Promise((resolve, reject) => {
          const assembler = spawn('node', [
            ASSEMBLE_SCRIPT,
            '--fixture', customizedFixture.id || prospect.fixtureId || 'restaurant',
            '--tier', tier,
            '--name', prospect.name,
            '--skip-build'
          ], {
            cwd: MODULE_LIBRARY,
            env: assemblerEnv,
            stdio: 'inherit'
          });

          assembler.on('close', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`Assembler exited with code ${code}`));
          });

          assembler.on('error', reject);
        });

        // Delete generic frontend and generate styled one
        const frontendDir = path.join(testDir, 'frontend');
        if (fs.existsSync(frontendDir)) {
          fs.rmSync(frontendDir, { recursive: true, force: true });
        }

        // Generate styled frontend with MasterAgent
        const master = new MasterAgent({ verbose: true });
        const generationResult = await master.generateProject({
          projectName: `${folder}${variantSuffix}`,
          fixtureId: prospect.fixtureId || 'restaurant',
          testMode: true,
          runBuild: false,
          outputPath: testDir,
          prospectData: prospect,
          moodSliders: moodSliders,
          layout: layoutId // Use the industry-specific layout from variant key
        });

        // Check if generation succeeded before continuing
        if (!generationResult.success) {
          const errorMsg = generationResult.errors?.join(', ') || 'MasterAgent generation failed';
          console.error(`   ❌ Frontend generation failed: ${errorMsg}`);
          throw new Error(`Frontend generation failed: ${errorMsg}`);
        }

        // Count pages and lines
        let pageCount = 0;
        let linesOfCode = 0;
        let fileCount = 0;

        const srcDir = path.join(frontendDir, 'src');
        if (fs.existsSync(srcDir)) {
          const countFiles = (dir) => {
            const items = fs.readdirSync(dir);
            for (const item of items) {
              const itemPath = path.join(dir, item);
              const stat = fs.statSync(itemPath);
              if (stat.isDirectory()) {
                countFiles(itemPath);
              } else if (item.endsWith('.jsx') || item.endsWith('.js')) {
                fileCount++;
                const content = fs.readFileSync(itemPath, 'utf-8');
                linesOfCode += content.split('\n').length;
                if (item.endsWith('Page.jsx') || item === 'HomePage.jsx') {
                  pageCount++;
                }
              }
            }
          };
          countFiles(srcDir);
        }

        // Generate video/logo only for first variant
        let videoResult = null;
        let logoResult = null;

        if (i === 0) {
          // Generate video
          console.log('   🎬 Generating video assets (first variant only)...');
          const videoStartTime = Date.now();
          try {
            const videoGenerator = new VideoGenerator(testDir);
            videoResult = await videoGenerator.generateVideos();
            masterMetrics.videoGenerationTime = Date.now() - videoStartTime;

            if (videoResult.success) {
              // Copy to shared directory
              const videoDir = path.join(testDir, 'frontend', 'public', 'videos');
              sharedVideoPath = path.join(sharedDir, 'videos');
              if (fs.existsSync(videoDir)) {
                fs.cpSync(videoDir, sharedVideoPath, { recursive: true });
              }
            }
          } catch (videoErr) {
            console.warn('   ⚠️ Video generation failed:', videoErr.message);
          }

          // Generate logos
          console.log('   🎨 Generating logo variants (first variant only)...');
          const logoStartTime = Date.now();
          try {
            const logoGenerator = new LogoGenerator(testDir);
            logoResult = await logoGenerator.generateLogos();
            masterMetrics.logoGenerationTime = Date.now() - logoStartTime;

            if (logoResult.success) {
              // Copy to shared directory
              const logoDir = path.join(testDir, 'frontend', 'public', 'logos');
              sharedLogoPath = path.join(sharedDir, 'logos');
              if (fs.existsSync(logoDir)) {
                fs.cpSync(logoDir, sharedLogoPath, { recursive: true });
              }
            }
          } catch (logoErr) {
            console.warn('   ⚠️ Logo generation failed:', logoErr.message);
          }

          masterMetrics.sharedAssetsGenerated = true;
          firstVariantDir = testDir;
        } else {
          // Copy shared assets to this variant
          console.log('   📋 Copying shared assets from first variant...');
          const destVideoDir = path.join(testDir, 'frontend', 'public', 'videos');
          const destLogoDir = path.join(testDir, 'frontend', 'public', 'logos');

          if (sharedVideoPath && fs.existsSync(sharedVideoPath)) {
            fs.mkdirSync(path.dirname(destVideoDir), { recursive: true });
            fs.cpSync(sharedVideoPath, destVideoDir, { recursive: true });
          }
          if (sharedLogoPath && fs.existsSync(sharedLogoPath)) {
            fs.mkdirSync(path.dirname(destLogoDir), { recursive: true });
            fs.cpSync(sharedLogoPath, destLogoDir, { recursive: true });
          }
        }

        // Build the frontend (can be skipped for faster testing)
        if (!skipBuild) {
          console.log('   📦 Building frontend...');
          const { execSync } = require('child_process');
          try {
            execSync('npm install --legacy-peer-deps', {
              cwd: frontendDir,
              stdio: 'pipe',
              timeout: 180000
            });
            execSync('npm run build', {
              cwd: frontendDir,
              stdio: 'pipe',
              timeout: 180000
            });
          } catch (buildErr) {
            console.warn('   ⚠️ Build failed:', buildErr.message);
          }
        } else {
          console.log('   ⏭️ Skipping build (skipBuild=true)');
        }

        const variantTimeMs = Date.now() - variantStartTime;

        // Save per-variant metrics
        const variantMetrics = {
          key: variantKey,
          preset: presetId,
          presetName: preset?.name || presetId,
          presetIcon: preset?.icon || '📄',
          presetColor: preset?.color || '#6B7280',
          layout: layoutId,
          layoutName: layoutConfig?.name || layoutId,
          success: true,
          generationTimeMs: variantTimeMs,
          pages: pageCount || 7,
          linesOfCode: linesOfCode,
          files: fileCount,
          moodSliders: moodSliders,
          previewUrl: `/prospect-preview/${folder}/full-test${variantSuffix}/frontend/`
        };

        fs.writeFileSync(
          path.join(testDir, 'variant-metrics.json'),
          JSON.stringify(variantMetrics, null, 2)
        );

        // Generate Test Dashboard page for this variant
        console.log('   📊 Generating Test Dashboard...');
        try {
          writeTestDashboard(testDir, {
            projectName: `${folder}-${variantKey}`,
            industry: prospect.fixtureId || 'bakery',
            prospect: prospect,
            generationTimeMs: variantTimeMs,
            deploymentUrl: `https://test-${folder}.be1st.io`,
            tier: tier,
            presetName: preset?.name || presetId,
            layoutName: layoutConfig?.name || layoutId
          });
        } catch (dashErr) {
          console.warn('   ⚠️ Test Dashboard generation failed:', dashErr.message);
        }

        masterMetrics.variants.push(variantMetrics);
        masterMetrics.totalPages += variantMetrics.pages;
        masterMetrics.totalLinesOfCode += variantMetrics.linesOfCode;
        masterMetrics.totalFiles += variantMetrics.files;

        console.log(`   ✅ Variant ${variantKey} complete (${(variantTimeMs / 1000).toFixed(1)}s)`);

      } catch (variantErr) {
        console.error(`   ❌ Variant ${variantKey} failed:`, variantErr.message);
        masterMetrics.variants.push({
          key: variantKey,
          preset: presetId,
          theme: themeId,
          success: false,
          error: variantErr.message
        });
      }

      // Small delay between variants to let Windows clean up resources
      if (i < variantsToGenerate.length - 1) {
        console.log('   ⏳ Cooling down before next variant...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Encourage garbage collection
        if (global.gc) {
          global.gc();
        }
      }
    }

    // Calculate final metrics
    masterMetrics.totalGenerationTimeMs = Date.now() - masterMetrics.startTime;
    masterMetrics.timePerPage = masterMetrics.totalPages > 0
      ? Math.round(masterMetrics.totalGenerationTimeMs / masterMetrics.totalPages)
      : 0;
    masterMetrics.successCount = masterMetrics.variants.filter(v => v.success).length;
    masterMetrics.failCount = masterMetrics.variants.filter(v => !v.success).length;
    masterMetrics.completedAt = new Date().toISOString();

    // Save master metrics
    fs.writeFileSync(
      path.join(prospectDir, 'master-metrics.json'),
      JSON.stringify(masterMetrics, null, 2)
    );

    // Update prospect status
    prospect.status = 'test-generated';
    prospect.variantsGenerated = masterMetrics.successCount;
    prospect.lastVariantGenerationAt = new Date().toISOString();
    fs.writeFileSync(prospectFile, JSON.stringify(prospect, null, 2));

    console.log(`\n✅ ${masterMetrics.successCount}/${variantsToGenerate.length} variants generated in ${(masterMetrics.totalGenerationTimeMs / 1000).toFixed(1)}s`);

    res.json({
      success: true,
      masterMetrics,
      sharedAssets: {
        video: sharedVideoPath,
        logo: sharedLogoPath
      }
    });

  } catch (err) {
    console.error('Multi-variant generation error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/scout/prospects/:folder/master-metrics
 * Get aggregated metrics for all variants
 */
router.get('/prospects/:folder/master-metrics', (req, res) => {
  const { folder } = req.params;

  try {
    const prospectDir = path.join(PROSPECTS_DIR, folder);
    const metricsFile = path.join(prospectDir, 'master-metrics.json');

    // Load master metrics if exists
    if (fs.existsSync(metricsFile)) {
      const metrics = JSON.parse(fs.readFileSync(metricsFile, 'utf-8'));
      return res.json({ success: true, metrics });
    }

    // Otherwise calculate from existing variant directories
    const dirs = fs.readdirSync(prospectDir);
    const variants = [];
    let totalPages = 0;
    let totalLinesOfCode = 0;
    let totalFiles = 0;

    for (const dir of dirs) {
      if (dir.startsWith('full-test-')) {
        const variantDir = path.join(prospectDir, dir);
        const variantMetricsFile = path.join(variantDir, 'variant-metrics.json');
        const metricsFile = path.join(variantDir, 'metrics.json'); // Also check metrics.json

        let vm = null;

        // Try variant-metrics.json first, then metrics.json
        if (fs.existsSync(variantMetricsFile)) {
          vm = JSON.parse(fs.readFileSync(variantMetricsFile, 'utf-8'));
        } else if (fs.existsSync(metricsFile)) {
          vm = JSON.parse(fs.readFileSync(metricsFile, 'utf-8'));
        }

        if (vm) {
          // Merge in deployed info from metrics.json if available
          if (fs.existsSync(metricsFile) && metricsFile !== variantMetricsFile) {
            try {
              const deployMetrics = JSON.parse(fs.readFileSync(metricsFile, 'utf-8'));
              if (deployMetrics.deployed) {
                vm.deployed = deployMetrics.deployed;
                vm.deployedAt = deployMetrics.deployedAt;
                vm.deployedUrl = deployMetrics.deployedUrl;
                vm.subdomain = deployMetrics.subdomain;
              }
            } catch (e) {
              // Ignore
            }
          }

          variants.push(vm);
          totalPages += vm.pages || vm.pageCount || 0;
          // Handle both formats: linesOfCode can be a number or { total: number }
          const loc = typeof vm.linesOfCode === 'object' ? vm.linesOfCode.total : (vm.linesOfCode || 0);
          totalLinesOfCode += loc;
          const files = typeof vm.files === 'object' ? vm.files.total : (vm.files || 0);
          totalFiles += files;
        } else {
          // No metrics file - extract variant key from directory name
          const variantKey = dir.replace('full-test-', '');
          variants.push({
            key: variantKey,
            success: fs.existsSync(path.join(variantDir, 'frontend', 'dist')),
            previewUrl: `/prospect-preview/${folder}/${dir}/frontend/`
          });
        }
      }
    }

    res.json({
      success: true,
      metrics: {
        folder,
        variants,
        totalPages,
        totalLinesOfCode,
        totalFiles,
        successCount: variants.filter(v => v.success).length,
        failCount: variants.filter(v => !v.success).length
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/scout/prospects/:folder/build-variant
 * Build a single variant's frontend
 */
router.post('/prospects/:folder/build-variant', async (req, res) => {
  const { folder } = req.params;
  const { variantKey } = req.body;

  if (!variantKey) {
    return res.status(400).json({ error: 'variantKey is required' });
  }

  try {
    const prospectDir = path.join(PROSPECTS_DIR, folder);
    const variantDir = path.join(prospectDir, `full-test-${variantKey}`);
    const frontendDir = path.join(variantDir, 'frontend');

    if (!fs.existsSync(frontendDir)) {
      return res.status(404).json({ error: 'Variant frontend not found' });
    }

    console.log(`\n📦 Building variant: ${variantKey}`);

    const { execSync } = require('child_process');

    // Install dependencies
    console.log('   Installing dependencies...');
    execSync('npm install --legacy-peer-deps', {
      cwd: frontendDir,
      stdio: 'pipe',
      timeout: 180000
    });

    // Build
    console.log('   Building...');
    execSync('npm run build', {
      cwd: frontendDir,
      stdio: 'pipe',
      timeout: 180000
    });

    console.log(`   ✅ Build complete for ${variantKey}`);

    res.json({
      success: true,
      message: `Built ${variantKey}`,
      previewUrl: `/prospect-preview/${folder}/full-test-${variantKey}/frontend/`
    });

  } catch (err) {
    console.error(`Build failed for ${variantKey}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/scout/prospects/:folder/bulk-delete-variants
 * Delete all variants or specific ones
 * Also cleans up deployed variants from Railway/GitHub/Cloudflare
 *
 * Query params:
 *   - all=true: Delete all variants
 *   - variants=luxury-light,luxury-dark: Delete specific ones
 */
router.delete('/prospects/:folder/bulk-delete-variants', async (req, res) => {
  const { folder } = req.params;
  const { all, variants } = req.query;

  try {
    const prospectDir = path.join(PROSPECTS_DIR, folder);

    if (!fs.existsSync(prospectDir)) {
      return res.status(404).json({ error: 'Prospect not found' });
    }

    const deleted = [];
    const failed = [];

    // Get list of variants to delete
    let variantsToDelete = [];

    if (all === 'true') {
      // Find all variant directories
      const dirs = fs.readdirSync(prospectDir);
      for (const dir of dirs) {
        if (dir.startsWith('full-test-')) {
          variantsToDelete.push(dir.replace('full-test-', ''));
        }
      }
    } else if (variants) {
      variantsToDelete = variants.split(',').map(v => v.trim());
    }

    console.log(`🗑️ Deleting ${variantsToDelete.length} variants for ${folder}`);

    for (const variant of variantsToDelete) {
      const variantDir = path.join(prospectDir, `full-test-${variant}`);

      try {
        // Delete local directory
        if (fs.existsSync(variantDir)) {
          fs.rmSync(variantDir, { recursive: true, force: true });
          console.log(`   ✅ Deleted local: full-test-${variant}`);
        }

        // Try to delete deployed version if it exists
        const deployedName = `test-${folder}-${variant}`;
        try {
          await deleteProject(deployedName);
          console.log(`   ✅ Deleted deployed: ${deployedName}`);
        } catch (deployErr) {
          // Deployed version may not exist, that's OK
        }

        deleted.push(variant);
      } catch (err) {
        failed.push({ variant, error: err.message });
      }
    }

    // Delete shared assets if deleting all
    if (all === 'true') {
      const sharedDir = path.join(prospectDir, 'shared');
      if (fs.existsSync(sharedDir)) {
        fs.rmSync(sharedDir, { recursive: true, force: true });
        console.log('   ✅ Deleted shared assets');
      }

      const metricsFile = path.join(prospectDir, 'master-metrics.json');
      if (fs.existsSync(metricsFile)) {
        fs.unlinkSync(metricsFile);
        console.log('   ✅ Deleted master metrics');
      }

      // Update prospect status
      const prospectFile = path.join(prospectDir, 'prospect.json');
      if (fs.existsSync(prospectFile)) {
        const prospect = JSON.parse(fs.readFileSync(prospectFile, 'utf-8'));
        prospect.status = 'scouted';
        delete prospect.variantsGenerated;
        delete prospect.lastVariantGenerationAt;
        fs.writeFileSync(prospectFile, JSON.stringify(prospect, null, 2));
      }
    }

    res.json({
      success: failed.length === 0,
      deleted,
      failed,
      message: `Deleted ${deleted.length} variant(s)${failed.length > 0 ? `, ${failed.length} failed` : ''}`
    });

  } catch (err) {
    console.error('Bulk delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/scout/prospects/:folder/deploy-variants
 * Deploy selected variants with unique subdomain names
 *
 * Request body:
 * {
 *   variants: ['luxury-light', 'modern-minimal-dark'],
 *   environment: 'test',
 *   force: false  // Set to true to skip confirmation and overwrite existing deployment
 * }
 */
router.post('/prospects/:folder/deploy-variants', async (req, res) => {
  const { folder } = req.params;
  const { variants, environment = 'test', force = false } = req.body;

  if (!variants || !variants.length) {
    return res.status(400).json({ error: 'No variants selected for deployment' });
  }

  try {
    const prospectDir = path.join(PROSPECTS_DIR, folder);
    const prospectFile = path.join(prospectDir, 'prospect.json');

    if (!fs.existsSync(prospectFile)) {
      return res.status(404).json({ error: 'Prospect not found' });
    }

    const prospect = JSON.parse(fs.readFileSync(prospectFile, 'utf-8'));

    // Check if any variant is already deployed (unless force=true)
    if (!force) {
      const dirs = fs.readdirSync(prospectDir);
      let existingDeployment = null;

      for (const dir of dirs) {
        if (dir.startsWith('full-test-')) {
          const metricsPath = path.join(prospectDir, dir, 'variant-metrics.json');
          const altMetricsPath = path.join(prospectDir, dir, 'metrics.json');

          for (const mPath of [metricsPath, altMetricsPath]) {
            if (fs.existsSync(mPath)) {
              try {
                const metrics = JSON.parse(fs.readFileSync(mPath, 'utf-8'));
                if (metrics.deployed && metrics.deployedUrl) {
                  existingDeployment = {
                    variant: dir.replace('full-test-', ''),
                    url: metrics.deployedUrl,
                    deployedAt: metrics.deployedAt
                  };
                  break;
                }
              } catch (e) {}
            }
          }
          if (existingDeployment) break;
        }
      }

      // If something is already deployed, ask for confirmation
      if (existingDeployment) {
        return res.json({
          success: false,
          requiresConfirmation: true,
          existingDeployment,
          message: `"${existingDeployment.variant}" is already deployed to ${existingDeployment.url}. Deploying a new variant will replace it.`,
          newVariants: variants
        });
      }
    }

    const deployResults = [];

    // If force=true, clear deployed status from all other variants first
    if (force) {
      const dirs = fs.readdirSync(prospectDir);
      for (const dir of dirs) {
        if (dir.startsWith('full-test-')) {
          const variantKey = dir.replace('full-test-', '');
          // Don't clear the variant we're about to deploy
          if (variants.includes(variantKey)) continue;

          const metricsFiles = [
            path.join(prospectDir, dir, 'variant-metrics.json'),
            path.join(prospectDir, dir, 'metrics.json')
          ];

          for (const mPath of metricsFiles) {
            if (fs.existsSync(mPath)) {
              try {
                const metrics = JSON.parse(fs.readFileSync(mPath, 'utf-8'));
                if (metrics.deployed) {
                  console.log(`   🧹 Clearing deployed status from ${variantKey}`);
                  metrics.deployed = false;
                  delete metrics.deployedUrl;
                  delete metrics.deployedAt;
                  delete metrics.subdomain;
                  fs.writeFileSync(mPath, JSON.stringify(metrics, null, 2));
                }
              } catch (e) {}
            }
          }
        }
      }
    }

    console.log(`🚀 Deploying ${variants.length} variants for ${prospect.name}${force ? ' (forced)' : ''}`);

    for (const variant of variants) {
      const variantDir = path.join(prospectDir, `full-test-${variant}`);

      if (!fs.existsSync(variantDir)) {
        deployResults.push({
          variant,
          success: false,
          error: 'Variant directory not found'
        });
        continue;
      }

      // Create subdomain from business name only (variant is just for internal selection)
      // Test: test-cristys-cake-shop.be1st.io
      // Production: cristys-cake-shop.be1st.io
      const sanitizedFolder = folder.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      const subdomain = `${environment === 'test' ? 'test-' : ''}${sanitizedFolder}`;

      // Ensure subdomain is within Railway's 63 char limit
      // If too long, abbreviate the preset/layout portion
      let finalSubdomain = subdomain.substring(0, 63).replace(/-$/, '');

      // Make sure subdomain starts with a letter (Railway requirement)
      if (!/^[a-z]/.test(finalSubdomain)) {
        finalSubdomain = 't-' + finalSubdomain.substring(0, 61);
      }

      console.log(`   🚀 Deploying ${variant} to ${finalSubdomain}.be1st.io`);

      // Check if this is a frontend-only variant (test variants don't have backend)
      const hasBackend = fs.existsSync(path.join(variantDir, 'backend'));
      const hasFrontend = fs.existsSync(path.join(variantDir, 'frontend'));
      const isFrontendOnly = hasFrontend && !hasBackend;

      console.log(`   📁 Structure: ${isFrontendOnly ? 'Frontend-only' : 'Full-stack'}`);

      try {
        const result = await deployService.deployProject(variantDir, finalSubdomain, {
          frontendOnly: isFrontendOnly,
          projectName: finalSubdomain
        });

        // For frontend-only, the main URL is directly result.frontendUrl
        // For full-stack, use result.urls.frontend
        const deployedUrl = isFrontendOnly
          ? result.frontendUrl || `https://${finalSubdomain}.be1st.io`
          : (result.urls?.frontend || result.frontendUrl || `https://${finalSubdomain}.be1st.io`);

        deployResults.push({
          variant,
          subdomain: finalSubdomain,
          url: deployedUrl,
          success: result.success,
          frontendUrl: deployedUrl,
          backendUrl: isFrontendOnly ? null : result.backendUrl,
          adminUrl: isFrontendOnly ? null : result.adminUrl,
          railwayUrl: result.urls?.railway || null,
          isFrontendOnly
        });

        if (result.success) {
          console.log(`   ✅ ${variant} deployed to ${deployedUrl}`);

          // Save deployed URL to variant metrics (try variant-metrics.json first, then metrics.json)
          const possibleMetricsFiles = [
            path.join(variantDir, 'variant-metrics.json'),
            path.join(variantDir, 'metrics.json')
          ];

          for (const metricsPath of possibleMetricsFiles) {
            if (fs.existsSync(metricsPath)) {
              try {
                const metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf-8'));
                metrics.deployed = true;
                metrics.deployedAt = new Date().toISOString();
                metrics.deployedUrl = deployedUrl;
                metrics.subdomain = finalSubdomain;
                fs.writeFileSync(metricsPath, JSON.stringify(metrics, null, 2));
                console.log(`   📊 Updated metrics: ${metricsPath}`);
                break;
              } catch (e) {
                // Try next file
              }
            }
          }
        }
      } catch (deployErr) {
        deployResults.push({
          variant,
          subdomain: finalSubdomain,
          success: false,
          error: deployErr.message
        });
        console.error(`   ❌ ${variant} deployment failed:`, deployErr.message);
      }
    }

    const successCount = deployResults.filter(r => r.success).length;

    res.json({
      success: successCount > 0,
      deployed: successCount,
      failed: deployResults.length - successCount,
      results: deployResults
    });

  } catch (err) {
    console.error('Deploy variants error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/scout/variant-presets
 * Get available presets and themes for variant generation
 */
router.get('/variant-presets', (req, res) => {
  res.json({
    presets: VARIANT_PRESETS,
    themes: VARIANT_THEMES,
    totalCombinations: VARIANT_PRESETS.length * VARIANT_THEMES.length
  });
});

// ================================================================
// RESEARCH & INTELLIGENCE ROUTES (Phase 2)
// ================================================================

/**
 * POST /api/scout/research
 * Research and enrich prospects with Yelp data
 * Use AFTER discovery to add ratings, reviews, price level, etc.
 *
 * Body params:
 *   - prospectIds: array of folder names to research (optional, defaults to all)
 *   - force: boolean - re-research even if already done (default false)
 */
router.post('/research', async (req, res) => {
  try {
    const { prospectIds, force = false } = req.body;

    if (!yelpApiKey) {
      return res.status(400).json({
        error: 'Yelp API key not configured',
        needsYelpKey: true
      });
    }

    // Get prospects to research
    let prospects = [];

    if (prospectIds && prospectIds.length > 0) {
      // Research specific prospects
      for (const folder of prospectIds) {
        const prospectFile = path.join(PROSPECTS_DIR, folder, 'prospect.json');
        if (fs.existsSync(prospectFile)) {
          const data = JSON.parse(fs.readFileSync(prospectFile, 'utf-8'));
          prospects.push({ folder, data, file: prospectFile });
        }
      }
    } else {
      // Research all prospects
      if (fs.existsSync(PROSPECTS_DIR)) {
        const folders = fs.readdirSync(PROSPECTS_DIR).filter(f => {
          const stat = fs.statSync(path.join(PROSPECTS_DIR, f));
          return stat.isDirectory();
        });

        for (const folder of folders) {
          const prospectFile = path.join(PROSPECTS_DIR, folder, 'prospect.json');
          if (fs.existsSync(prospectFile)) {
            const data = JSON.parse(fs.readFileSync(prospectFile, 'utf-8'));
            // Skip if already researched (unless force=true)
            if (force || !data.research?.enrichedAt) {
              prospects.push({ folder, data, file: prospectFile });
            }
          }
        }
      }
    }

    if (prospects.length === 0) {
      return res.json({
        success: true,
        message: force ? 'No prospects found' : 'No prospects to research (all already researched). Use force=true to re-research.',
        researched: 0
      });
    }

    console.log(`[Scout] ${force ? 'RE-' : ''}Researching ${prospects.length} prospects via Yelp...`);

    const scout = new ScoutAgent({
      yelpApiKey,
      verbose: true
    });

    console.log(`[Scout] Researching ${prospects.length} prospects via Yelp...`);

    const results = [];
    for (const { folder, data, file } of prospects) {
      try {
        const research = await scout.researchSingleProspect(data);
        const { score, breakdown } = scout.calculateOpportunityScore(data, research);

        // Extract and store city
        const city = scout.extractCity(data.address);

        // Update prospect file
        data.research = research;
        data.opportunityScore = score;
        data.scoreBreakdown = breakdown;
        data.city = city;  // Store extracted city for sorting/filtering
        if (data.crm) {
          data.crm.status = 'researched';
          data.crm.history.push({
            activity: 'researched',
            details: `Enriched via Yelp API. Score: ${score}/100`,
            timestamp: new Date().toISOString()
          });
        }

        fs.writeFileSync(file, JSON.stringify(data, null, 2));

        results.push({
          folder,
          name: data.name,
          score,
          breakdown,
          matched: research.matched,
          rating: research.rating,
          reviewCount: research.reviewCount,
          priceLevel: research.priceLevel
        });

        console.log(`   ✅ ${data.name}: ${score}/100`);
      } catch (err) {
        console.error(`   ❌ ${data.name}: ${err.message}`);
        results.push({
          folder,
          name: data.name,
          error: err.message
        });
      }

      // Rate limiting
      await new Promise(r => setTimeout(r, 250));
    }

    // Sort by score
    results.sort((a, b) => (b.score || 0) - (a.score || 0));

    res.json({
      success: true,
      researched: results.filter(r => !r.error).length,
      failed: results.filter(r => r.error).length,
      results
    });

  } catch (err) {
    console.error('Research error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/scout/discover-and-research
 * Full pipeline: Discover businesses → Filter → Research → Score → Return ranked
 */
router.post('/discover-and-research', async (req, res) => {
  try {
    const { location, industry, limit = 20 } = req.body;

    if (!location) {
      return res.status(400).json({ error: 'Location is required' });
    }

    if (!googleApiKey) {
      return res.status(400).json({
        error: 'Google Places API key required for discovery',
        needsGoogleKey: true
      });
    }

    const scout = new ScoutAgent({
      googleApiKey,
      yelpApiKey,  // Optional - will skip research if not configured
      verbose: true
    });

    console.log(`\n[Scout] FULL PIPELINE: ${industry || 'all'} in ${location}`);

    const result = await scout.discoverAndResearch({
      location,
      industry,
      limit: Math.min(limit, 20)
    });

    res.json({
      success: true,
      location,
      industry,
      ...result
    });

  } catch (err) {
    console.error('Discover and research error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ================================================================
// CRM ROUTES (Phase 3: Track Outreach)
// ================================================================

/**
 * GET /api/scout/crm/statuses
 * Get available CRM status values
 */
router.get('/crm/statuses', (req, res) => {
  const { CRM_STATUSES } = require('../agents/scout-agent.cjs');
  res.json({ statuses: CRM_STATUSES });
});

/**
 * PUT /api/scout/crm/:prospectId/status
 * Update prospect CRM status
 */
router.put('/crm/:prospectId/status', (req, res) => {
  try {
    const { prospectId } = req.params;
    const { status, note } = req.body;

    const prospectFile = path.join(PROSPECTS_DIR, prospectId, 'prospect.json');
    if (!fs.existsSync(prospectFile)) {
      return res.status(404).json({ error: 'Prospect not found' });
    }

    const scout = new ScoutAgent({ verbose: false });
    let prospect = JSON.parse(fs.readFileSync(prospectFile, 'utf-8'));

    try {
      prospect = scout.updateProspectStatus(prospect, status, note || '');
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }

    fs.writeFileSync(prospectFile, JSON.stringify(prospect, null, 2));

    res.json({
      success: true,
      prospectId,
      status: prospect.crm.status,
      history: prospect.crm.history
    });

  } catch (err) {
    console.error('CRM status update error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/scout/crm/:prospectId/activity
 * Add activity to prospect history
 */
router.post('/crm/:prospectId/activity', (req, res) => {
  try {
    const { prospectId } = req.params;
    const { activity, details } = req.body;

    const prospectFile = path.join(PROSPECTS_DIR, prospectId, 'prospect.json');
    if (!fs.existsSync(prospectFile)) {
      return res.status(404).json({ error: 'Prospect not found' });
    }

    const scout = new ScoutAgent({ verbose: false });
    let prospect = JSON.parse(fs.readFileSync(prospectFile, 'utf-8'));

    prospect = scout.addActivity(prospect, activity, details || '');

    fs.writeFileSync(prospectFile, JSON.stringify(prospect, null, 2));

    res.json({
      success: true,
      prospectId,
      history: prospect.crm.history
    });

  } catch (err) {
    console.error('CRM activity error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/scout/crm/:prospectId/next-action
 * Set next action for follow-up
 */
router.put('/crm/:prospectId/next-action', (req, res) => {
  try {
    const { prospectId } = req.params;
    const { action, dueDate } = req.body;

    const prospectFile = path.join(PROSPECTS_DIR, prospectId, 'prospect.json');
    if (!fs.existsSync(prospectFile)) {
      return res.status(404).json({ error: 'Prospect not found' });
    }

    const scout = new ScoutAgent({ verbose: false });
    let prospect = JSON.parse(fs.readFileSync(prospectFile, 'utf-8'));

    prospect = scout.setNextAction(prospect, action, dueDate);

    fs.writeFileSync(prospectFile, JSON.stringify(prospect, null, 2));

    res.json({
      success: true,
      prospectId,
      nextAction: prospect.crm.nextAction
    });

  } catch (err) {
    console.error('CRM next action error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/scout/crm/pipeline
 * Get all prospects grouped by CRM status
 */
router.get('/crm/pipeline', (req, res) => {
  try {
    const { CRM_STATUSES } = require('../agents/scout-agent.cjs');

    // Initialize pipeline with all statuses
    const pipeline = {};
    CRM_STATUSES.forEach(status => {
      pipeline[status] = [];
    });

    // Load all prospects
    if (fs.existsSync(PROSPECTS_DIR)) {
      const folders = fs.readdirSync(PROSPECTS_DIR).filter(f => {
        try {
          return fs.statSync(path.join(PROSPECTS_DIR, f)).isDirectory();
        } catch { return false; }
      });

      for (const folder of folders) {
        const prospectFile = path.join(PROSPECTS_DIR, folder, 'prospect.json');
        if (fs.existsSync(prospectFile)) {
          try {
            const data = JSON.parse(fs.readFileSync(prospectFile, 'utf-8'));
            const status = data.crm?.status || 'discovered';

            pipeline[status].push({
              id: folder,
              name: data.name,
              industry: data.fixtureId || data.category,
              score: data.opportunityScore,
              rating: data.research?.rating,
              reviewCount: data.research?.reviewCount,
              nextAction: data.crm?.nextAction,
              address: data.address
            });
          } catch {}
        }
      }
    }

    // Sort each pipeline stage by score
    Object.keys(pipeline).forEach(status => {
      pipeline[status].sort((a, b) => (b.score || 0) - (a.score || 0));
    });

    // Calculate totals
    const totals = {};
    Object.keys(pipeline).forEach(status => {
      totals[status] = pipeline[status].length;
    });

    res.json({
      pipeline,
      totals,
      statuses: CRM_STATUSES
    });

  } catch (err) {
    console.error('CRM pipeline error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/scout/crm/follow-ups
 * Get prospects needing follow-up
 */
router.get('/crm/follow-ups', (req, res) => {
  try {
    const now = new Date();
    const followUps = [];

    if (fs.existsSync(PROSPECTS_DIR)) {
      const folders = fs.readdirSync(PROSPECTS_DIR).filter(f => {
        try {
          return fs.statSync(path.join(PROSPECTS_DIR, f)).isDirectory();
        } catch { return false; }
      });

      for (const folder of folders) {
        const prospectFile = path.join(PROSPECTS_DIR, folder, 'prospect.json');
        if (fs.existsSync(prospectFile)) {
          try {
            const data = JSON.parse(fs.readFileSync(prospectFile, 'utf-8'));
            if (data.crm?.nextAction?.dueDate) {
              const dueDate = new Date(data.crm.nextAction.dueDate);
              if (dueDate <= now) {
                followUps.push({
                  id: folder,
                  name: data.name,
                  action: data.crm.nextAction.action,
                  dueDate: data.crm.nextAction.dueDate,
                  status: data.crm.status,
                  score: data.opportunityScore,
                  overdueDays: Math.floor((now - dueDate) / (1000 * 60 * 60 * 24))
                });
              }
            }
          } catch {}
        }
      }
    }

    // Sort by most overdue first
    followUps.sort((a, b) => b.overdueDays - a.overdueDays);

    res.json({
      followUps,
      count: followUps.length
    });

  } catch (err) {
    console.error('CRM follow-ups error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ================================================================
// OUTREACH ROUTES (Phase 4: Email Drafts)
// ================================================================

/**
 * GET /api/scout/outreach/:prospectId/draft
 * Generate personalized outreach email draft
 */
router.get('/outreach/:prospectId/draft', (req, res) => {
  try {
    const { prospectId } = req.params;

    const prospectFile = path.join(PROSPECTS_DIR, prospectId, 'prospect.json');
    if (!fs.existsSync(prospectFile)) {
      return res.status(404).json({ error: 'Prospect not found' });
    }

    const prospect = JSON.parse(fs.readFileSync(prospectFile, 'utf-8'));
    const scout = new ScoutAgent({ verbose: false });

    const draft = scout.generateOutreachDraft(prospect);

    res.json({
      success: true,
      prospectId,
      prospectName: prospect.name,
      draft
    });

  } catch (err) {
    console.error('Outreach draft error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/scout/scores
 * Get score breakdown for a prospect
 */
router.get('/scores/:prospectId', (req, res) => {
  try {
    const { prospectId } = req.params;

    const prospectFile = path.join(PROSPECTS_DIR, prospectId, 'prospect.json');
    if (!fs.existsSync(prospectFile)) {
      return res.status(404).json({ error: 'Prospect not found' });
    }

    const prospect = JSON.parse(fs.readFileSync(prospectFile, 'utf-8'));
    const scout = new ScoutAgent({ verbose: false });

    const breakdown = scout.getScoreBreakdown(prospect);

    res.json({
      prospectId,
      name: prospect.name,
      score: prospect.opportunityScore || 0,
      breakdown,
      research: prospect.research || null
    });

  } catch (err) {
    console.error('Score breakdown error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/scout/leaderboard
 * Get prospects ranked by opportunity score with sorting options
 *
 * Query params:
 *   - limit: max results (default 50)
 *   - minScore: minimum score filter (default 0)
 *   - sortBy: 'score' | 'name' | 'city' | 'industry' | 'rating' | 'generatedAt' | 'deployedAt' (default 'score')
 *   - sortDir: 'asc' | 'desc' (default 'desc')
 *   - filterCity: city name filter
 *   - filterIndustry: industry filter
 *   - filterStatus: CRM status filter
 *   - filterGenerated: 'true' | 'false' - filter by generation status
 *   - filterDeployed: 'true' | 'false' - filter by deployment status
 */
router.get('/leaderboard', (req, res) => {
  try {
    const {
      limit = 50,
      minScore = 0,
      sortBy = 'score',
      sortDir = 'desc',
      filterCity,
      filterIndustry,
      filterStatus,
      filterGenerated,
      filterDeployed
    } = req.query;

    // Use ScoutAgent for city extraction (has zipcode lookup)
    const scout = new ScoutAgent({ verbose: false });

    let allProspects = [];  // All prospects (for filter options)
    let filteredProspects = [];  // Filtered prospects (for display)

    if (fs.existsSync(PROSPECTS_DIR)) {
      const folders = fs.readdirSync(PROSPECTS_DIR).filter(f => {
        try {
          return fs.statSync(path.join(PROSPECTS_DIR, f)).isDirectory();
        } catch { return false; }
      });

      for (const folder of folders) {
        const prospectFile = path.join(PROSPECTS_DIR, folder, 'prospect.json');
        if (fs.existsSync(prospectFile)) {
          try {
            const data = JSON.parse(fs.readFileSync(prospectFile, 'utf-8'));
            const score = data.opportunityScore || 0;
            // Use stored city if available, otherwise extract (with zipcode lookup)
            const city = data.city || scout.extractCity(data.address);
            const industry = data.fixtureId || data.category || '';
            const status = data.crm?.status || 'discovered';

            // Check for generated variants in the prospect folder
            const variantsDir = path.join(PROSPECTS_DIR, folder);
            let variants = [];
            try {
              const subfolders = fs.readdirSync(variantsDir).filter(f => {
                const stat = fs.statSync(path.join(variantsDir, f));
                return stat.isDirectory() && f !== 'node_modules' && !f.startsWith('.');
              });
              // Look for generated site folders (have frontend/ or package.json)
              for (const subfolder of subfolders) {
                const subPath = path.join(variantsDir, subfolder);
                const hasFrontend = fs.existsSync(path.join(subPath, 'frontend'));
                const hasPackage = fs.existsSync(path.join(subPath, 'package.json'));
                if (hasFrontend || hasPackage) {
                  variants.push({
                    name: subfolder,
                    path: subPath,
                    hasFrontend,
                    hasBackend: fs.existsSync(path.join(subPath, 'backend'))
                  });
                }
              }
            } catch {}

            const prospect = {
              id: folder,
              name: data.name,
              industry,
              city,
              score,
              scoreBreakdown: data.scoreBreakdown || null,
              rating: data.research?.rating,
              reviewCount: data.research?.reviewCount,
              priceLevel: data.research?.priceLevel,
              status,
              address: data.address,
              phone: data.phone,
              researched: !!data.research?.enrichedAt,
              // Generation status
              generated: data.testGenerated || false,
              generatedAt: data.testGeneratedAt || null,
              generationTimeMs: data.generationTimeMs || null,
              testUrl: data.testUrl || null,
              testPath: data.testPath || null,
              testTier: data.testTier || null,
              testPages: data.testPages || [],
              testLayout: data.testLayout || null,
              testArchetype: data.testArchetype || null,
              // Deployment status
              deployed: data.deployed || false,
              deployedAt: data.deployedAt || null,
              deployedUrl: data.deployedUrl || null,
              backendUrl: data.backendUrl || null,
              adminUrl: data.adminUrl || null,
              fullStackDeployed: data.fullStackDeployed || false,
              generationId: data.generationId || null,
              // Variants (multiple generated versions)
              variants: variants,
              variantCount: variants.length
            };

            // Add to all prospects (for filter dropdowns)
            allProspects.push(prospect);

            // Apply filters for display
            if (score < Number(minScore)) continue;
            if (filterCity && !city.toLowerCase().includes(filterCity.toLowerCase())) continue;
            if (filterIndustry && industry !== filterIndustry) continue;
            if (filterStatus && status !== filterStatus) continue;
            // Generation/deployment filters
            if (filterGenerated === 'true' && !prospect.generated) continue;
            if (filterGenerated === 'false' && prospect.generated) continue;
            if (filterDeployed === 'true' && !prospect.deployed) continue;
            if (filterDeployed === 'false' && prospect.deployed) continue;

            filteredProspects.push(prospect);
          } catch {}
        }
      }
    }

    // Sort filtered prospects
    const sortMultiplier = sortDir === 'asc' ? 1 : -1;
    filteredProspects.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '');
          break;
        case 'city':
          comparison = (a.city || '').localeCompare(b.city || '');
          break;
        case 'industry':
          comparison = (a.industry || '').localeCompare(b.industry || '');
          break;
        case 'rating':
          comparison = (a.rating || 0) - (b.rating || 0);
          break;
        case 'generatedAt':
          // Sort by generation date (null = not generated, goes last)
          const aGen = a.generatedAt ? new Date(a.generatedAt).getTime() : 0;
          const bGen = b.generatedAt ? new Date(b.generatedAt).getTime() : 0;
          comparison = aGen - bGen;
          break;
        case 'deployedAt':
          // Sort by deployment date (null = not deployed, goes last)
          const aDep = a.deployedAt ? new Date(a.deployedAt).getTime() : 0;
          const bDep = b.deployedAt ? new Date(b.deployedAt).getTime() : 0;
          comparison = aDep - bDep;
          break;
        case 'variants':
          comparison = (a.variantCount || 0) - (b.variantCount || 0);
          break;
        case 'score':
        default:
          comparison = (a.score || 0) - (b.score || 0);
      }
      return comparison * sortMultiplier;
    });

    // Get unique cities and industries from ALL prospects (not just filtered)
    // This ensures dropdowns always show all available options
    const cities = [...new Set(allProspects.map(p => p.city).filter(Boolean))].sort();
    const industries = [...new Set(allProspects.map(p => p.industry).filter(Boolean))].sort();

    // Calculate stats
    const stats = {
      total: allProspects.length,
      researched: allProspects.filter(p => p.researched).length,
      generated: allProspects.filter(p => p.generated).length,
      deployed: allProspects.filter(p => p.deployed).length,
      withVariants: allProspects.filter(p => p.variantCount > 0).length,
      totalVariants: allProspects.reduce((sum, p) => sum + (p.variantCount || 0), 0)
    };

    res.json({
      leaderboard: filteredProspects.slice(0, Number(limit)),
      total: filteredProspects.length,
      totalAll: allProspects.length,
      stats,
      filters: {
        cities,
        industries
      }
    });

  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
