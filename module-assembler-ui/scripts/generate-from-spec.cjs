#!/usr/bin/env node

/**
 * Generate Customer Variants from Spec File
 *
 * Standalone script that the Coordinator can call to generate
 * 18 customer-facing variants from a shared specification file.
 *
 * Usage:
 *   node generate-from-spec.cjs --spec-file ../shared-spec.json
 *   node generate-from-spec.cjs --spec-file ../shared-spec.json --output ./customer-variants
 *   node generate-from-spec.cjs --spec-file ../shared-spec.json --variants 3
 *   node generate-from-spec.cjs --spec-file ../shared-spec.json --skip-validation
 *
 * Options:
 *   --spec-file        Path to shared specification JSON (required)
 *   --output           Output directory for variants (default: ./output/prospects/{slug})
 *   --variants         Number of variants to generate: 1, 3, or 18 (default: 18)
 *   --skip-build       Skip npm install and build steps entirely
 *   --skip-validation  Skip build validation (files still work in npm run dev)
 *   --verbose          Enable verbose logging
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Paths
const SCRIPT_DIR = __dirname;
const MODULE_ASSEMBLER_UI = path.resolve(SCRIPT_DIR, '..');
const MODULE_LIBRARY = path.resolve(MODULE_ASSEMBLER_UI, '..');
const ASSEMBLE_SCRIPT = path.join(MODULE_LIBRARY, 'scripts', 'assemble-project.cjs');

// Import generators
const { MasterAgent } = require('../lib/agents/master-agent.cjs');
const { INDUSTRY_LAYOUTS } = require('../config/industry-layouts.cjs');

// ═══════════════════════════════════════════════════════════════════════════
// PRESET & LAYOUT DEFINITIONS (matching scout.cjs)
// ═══════════════════════════════════════════════════════════════════════════

const VARIANT_PRESETS = [
  { id: 'luxury', name: 'Luxury', icon: '💎', values: { vibe: 30, energy: 35, era: 40, density: 30, price: 90 } },
  { id: 'friendly', name: 'Friendly Local', icon: '🏠', values: { vibe: 80, energy: 60, era: 50, density: 60, price: 40 } },
  { id: 'modern-minimal', name: 'Modern Minimal', icon: '◼️', values: { vibe: 50, energy: 40, era: 85, density: 20, price: 70 } },
  { id: 'sharp-corporate', name: 'Sharp & Clean', icon: '📐', values: { vibe: 35, energy: 45, era: 95, density: 40, price: 65 } },
  { id: 'bold-energetic', name: 'Bold & Fun', icon: '🎉', values: { vibe: 75, energy: 90, era: 70, density: 70, price: 50 } },
  { id: 'classic-elegant', name: 'Classic Elegant', icon: '🏛️', values: { vibe: 25, energy: 30, era: 20, density: 45, price: 80 } }
];

// Map industry types to layout categories
const INDUSTRY_TO_CATEGORY = {
  'bakery': 'restaurants-food',
  'restaurant': 'restaurants-food',
  'coffee-shop': 'restaurants-food',
  'coffee-cafe': 'restaurants-food',
  'pizza-restaurant': 'restaurants-food',
  'steakhouse': 'restaurants-food',
  'dental': 'dental',
  'healthcare': 'healthcare-medical',
  'salon-spa': 'beauty-grooming',
  'barbershop': 'beauty-grooming',
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

// Map industry names to valid fixture IDs (file names in test-fixtures/)
const INDUSTRY_TO_FIXTURE = {
  'coffee-shop': 'coffee-cafe',
  'coffee': 'coffee-cafe',
  'cafe': 'coffee-cafe',
  'gym': 'fitness-gym',
  'fitness': 'fitness-gym',
  'spa': 'salon-spa',
  'salon': 'salon-spa',
  'beauty': 'salon-spa',
  'medical': 'healthcare',
  'doctor': 'healthcare',
  'clinic': 'healthcare',
  'lawyer': 'law-firm',
  'legal': 'law-firm',
  'attorney': 'law-firm',
  'automotive': 'auto-shop',
  'mechanic': 'auto-shop',
  'car-repair': 'auto-shop',
  'pizza': 'pizza-restaurant',
  'pizzeria': 'pizza-restaurant'
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    specFile: null,
    output: null,
    variants: 18,
    skipBuild: false,
    skipValidation: false,
    verbose: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    if (arg === '--spec-file' && next) {
      config.specFile = path.resolve(next);
      i++;
    } else if (arg === '--output' && next) {
      config.output = path.resolve(next);
      i++;
    } else if (arg === '--variants' && next) {
      config.variants = parseInt(next, 10);
      i++;
    } else if (arg === '--skip-build') {
      config.skipBuild = true;
    } else if (arg === '--skip-validation') {
      config.skipValidation = true;
    } else if (arg === '--verbose') {
      config.verbose = true;
    } else if (arg === '--help') {
      console.log(`
Generate Customer Variants from Spec File

Usage:
  node generate-from-spec.js --spec-file <path> [options]

Options:
  --spec-file        Path to shared specification JSON (required)
  --output           Output directory for variants
  --variants         Number of variants: 1, 3, or 18 (default: 18)
  --skip-build       Skip npm install and build steps entirely
  --skip-validation  Skip build validation (still installs deps, but no vite build)
  --verbose          Enable verbose logging
  --help             Show this help

Examples:
  node generate-from-spec.cjs --spec-file ./spec.json --variants 1
  node generate-from-spec.cjs --spec-file ./spec.json --skip-validation
  node generate-from-spec.cjs --spec-file ./spec.json --variants 3 --verbose
`);
      process.exit(0);
    }
  }

  return config;
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Shorten variant key for Windows path compatibility
 * "luxury-appetizing-visual" -> "lux-vis"
 * "friendly-menu-focused" -> "fri-menu"
 * Max 12 characters
 */
function shortenVariantKey(variantKey) {
  // Preset abbreviations (consistent with scout.cjs)
  const presetAbbrev = {
    'luxury': 'lux',
    'friendly': 'fri',
    'modern-minimal': 'mod',
    'sharp-corporate': 'corp',
    'bold-energetic': 'bold',
    'bold': 'bld',
    'classic-elegant': 'clas',
    'warm': 'warm',
    'minimal': 'min'
  };

  // Layout abbreviations (consistent with scout.cjs)
  const layoutAbbrev = {
    // Food/Restaurant
    'appetizing-visual': 'vis',
    'menu-focused': 'menu',
    'story-driven': 'story',
    // Service-based
    'booking-focused': 'book',
    'portfolio-showcase': 'port',
    'team-highlight': 'team',
    'service-showcase': 'svc',
    'trust-building': 'trust',
    // General
    'trust-and-call': 'trust',
    'quote-generator': 'quote',
    'visual-first': 'vfirst',
    'conversion-focused': 'conv',
    'content-heavy': 'content',
    // Fallbacks
    'layout-a': 'a',
    'layout-b': 'b',
    'layout-c': 'c'
  };

  // Parse preset and layout from variantKey
  let presetId = null;
  let layoutId = null;

  for (const preset of Object.keys(presetAbbrev)) {
    if (variantKey.startsWith(preset + '-')) {
      presetId = preset;
      layoutId = variantKey.substring(preset.length + 1);
      break;
    }
  }

  if (!presetId) {
    // Can't parse, just truncate
    return variantKey.substring(0, 12);
  }

  const shortPreset = presetAbbrev[presetId] || presetId.substring(0, 4);
  const shortLayout = layoutAbbrev[layoutId] || layoutId.substring(0, 6);

  return `${shortPreset}-${shortLayout}`;
}

/**
 * Validate path length won't exceed Windows limit
 * Returns { valid: boolean, message?: string }
 */
function validatePathLength(outputDir, businessName, maxLength = 200) {
  // Estimate longest path: outputDir/variant-name/backend/node_modules/@some-long-package/dist/index.js
  // The variant name is max ~12 chars now
  // Backend deep path can be ~100 chars for node_modules
  const estimatedPath = path.join(outputDir, 'lux-vis', 'backend', 'node_modules', '@anthropic-ai', 'sdk', 'dist', 'index.js');

  if (estimatedPath.length > maxLength) {
    return {
      valid: false,
      message: `Path too long (${estimatedPath.length} chars). Move output closer to drive root or shorten business name.`,
      estimatedLength: estimatedPath.length
    };
  }

  return { valid: true, estimatedLength: estimatedPath.length };
}

function getFixtureId(industry) {
  // Check if it's already a valid fixture
  const validFixtures = [
    'auto-shop', 'bakery', 'barbershop', 'cleaning', 'coffee-cafe',
    'dental', 'ecommerce', 'fitness-gym', 'healthcare', 'law-firm',
    'pizza-restaurant', 'plumber', 'real-estate', 'restaurant',
    'saas', 'salon-spa', 'school', 'steakhouse', 'yoga'
  ];

  if (validFixtures.includes(industry)) {
    return industry;
  }

  // Check mapping
  if (INDUSTRY_TO_FIXTURE[industry]) {
    return INDUSTRY_TO_FIXTURE[industry];
  }

  // Default to restaurant
  return 'restaurant';
}

function getIndustryLayouts(industry) {
  const category = INDUSTRY_TO_CATEGORY[industry] || 'professional-services';
  const industryConfig = INDUSTRY_LAYOUTS[category];

  if (!industryConfig || !industryConfig.layouts) {
    return [
      { id: 'layout-a', name: 'Standard' },
      { id: 'layout-b', name: 'Visual First' },
      { id: 'layout-c', name: 'Conversion' }
    ];
  }

  return Object.entries(industryConfig.layouts).map(([id, layout]) => ({
    id,
    name: layout.name,
    sectionOrder: layout.sectionOrder
  }));
}

function getAllVariantKeys(industry) {
  const layouts = getIndustryLayouts(industry);
  const keys = [];

  for (const preset of VARIANT_PRESETS) {
    for (const layout of layouts) {
      keys.push(`${preset.id}-${layout.id}`);
    }
  }

  return keys;
}

function getMoodSliders(presetId) {
  const preset = VARIANT_PRESETS.find(p => p.id === presetId);
  if (!preset) return null;
  return { ...preset.values, theme: 'light' };
}

async function runAssembler(testDir, prospectData, specFile = null) {
  const assemblerEnv = {
    ...process.env,
    MODULE_LIBRARY_PATH: MODULE_LIBRARY,
    OUTPUT_PATH: testDir
  };

  return new Promise((resolve, reject) => {
    // Use "." as name to output directly to testDir (avoids nested folder)
    // The actual business name is in brain.json
    const args = [
      ASSEMBLE_SCRIPT,
      '--name', '.',
      '--industry', prospectData.industry || 'restaurant'
    ];

    // If spec file provided, pass it to assembler
    if (specFile) {
      args.push('--spec-file', specFile);
    }

    const assembler = spawn('node', args, {
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
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN GENERATION FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

async function generateFromSpec(config) {
  const startTime = Date.now();

  // Validate spec file exists
  if (!config.specFile || !fs.existsSync(config.specFile)) {
    console.error('❌ Spec file not found:', config.specFile);
    process.exit(1);
  }

  // Read and parse spec
  let spec;
  try {
    spec = JSON.parse(fs.readFileSync(config.specFile, 'utf8'));
  } catch (e) {
    console.error('❌ Failed to parse spec file:', e.message);
    process.exit(1);
  }

  // Extract business info
  const businessName = spec.business?.name || 'Unnamed Business';
  const industry = spec.business?.industry || 'restaurant';
  const fixtureId = getFixtureId(industry);
  const slug = slugify(businessName);

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║           BLINK - Customer Variant Generator                   ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  console.log(`📝 Business: ${businessName}`);
  console.log(`🏭 Industry: ${industry} (fixture: ${fixtureId})`);
  console.log(`📄 Spec: ${config.specFile}`);

  // Determine output directory
  const outputDir = config.output || path.join(MODULE_ASSEMBLER_UI, 'output', 'prospects', slug);
  console.log(`📁 Output: ${outputDir}`);

  // Validate path length for Windows compatibility
  const pathCheck = validatePathLength(outputDir, businessName);
  if (!pathCheck.valid) {
    console.error(`\n⚠️  WARNING: ${pathCheck.message}`);
    console.error(`   Estimated path length: ${pathCheck.estimatedLength} characters`);
    console.error(`   Recommendation: Use --output with a shorter path closer to drive root.`);
    console.error(`   Example: --output C:\\projects\\${slug.substring(0, 10)}\n`);
  } else {
    console.log(`   Path length OK (${pathCheck.estimatedLength} chars)\n`);
  }

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Copy spec file to output as prospect.json for compatibility
  const prospectData = {
    name: businessName,
    slug: slug,
    industry: industry,
    fixtureId: fixtureId,
    address: spec.business?.contact?.address || '',
    phone: spec.business?.contact?.phone || '',
    email: spec.business?.contact?.email || '',
    tagline: spec.business?.tagline || '',
    description: spec.business?.description || '',
    hours: spec.business?.hours || null,
    branding: spec.business?.branding || {},
    spec: spec, // Include full spec
    generatedAt: new Date().toISOString(),
    source: 'coordinator-spec'
  };

  fs.writeFileSync(
    path.join(outputDir, 'prospect.json'),
    JSON.stringify(prospectData, null, 2)
  );

  // Determine variants to generate
  const allVariants = getAllVariantKeys(industry);
  let variantsToGenerate;

  if (config.variants === 1) {
    // Just generate the first variant (friendly + first layout)
    variantsToGenerate = [allVariants[0]];
  } else if (config.variants === 3) {
    // Generate one variant per layout (using friendly preset)
    const layouts = getIndustryLayouts(industry);
    variantsToGenerate = layouts.map(l => `friendly-${l.id}`);
  } else {
    // Generate all 18
    variantsToGenerate = allVariants;
  }

  console.log(`🎨 Generating ${variantsToGenerate.length} variants...\n`);

  // Track results
  const results = {
    success: [],
    failed: [],
    metrics: {
      totalTime: 0,
      variants: []
    }
  };

  // Generate each variant
  for (let i = 0; i < variantsToGenerate.length; i++) {
    const variantKey = variantsToGenerate[i];
    const variantStartTime = Date.now();

    // Parse preset and layout from key
    let presetId = null;
    let layoutId = null;
    for (const p of VARIANT_PRESETS) {
      if (variantKey.startsWith(p.id + '-')) {
        presetId = p.id;
        layoutId = variantKey.substring(p.id.length + 1);
        break;
      }
    }

    const preset = VARIANT_PRESETS.find(p => p.id === presetId);
    const moodSliders = getMoodSliders(presetId);

    // Shorten variant key for Windows path compatibility
    const shortKey = shortenVariantKey(variantKey);

    console.log(`\n📦 [${i + 1}/${variantsToGenerate.length}] ${variantKey} -> ${shortKey}`);
    console.log(`   Preset: ${preset?.name || presetId}, Layout: ${layoutId}`);

    const testDir = path.join(outputDir, shortKey);

    try {
      // Clear existing variant directory
      if (fs.existsSync(testDir)) {
        fs.rmSync(testDir, { recursive: true, force: true });
      }
      fs.mkdirSync(testDir, { recursive: true });

      // Run backend assembler
      console.log('   🔧 Assembling backend...');
      await runAssembler(testDir, prospectData, config.specFile);

      // Delete generic frontend (we'll generate styled one)
      const frontendDir = path.join(testDir, 'frontend');
      if (fs.existsSync(frontendDir)) {
        fs.rmSync(frontendDir, { recursive: true, force: true });
      }

      // Generate styled frontend with MasterAgent
      console.log('   🎨 Generating styled frontend...');
      const master = new MasterAgent({ verbose: config.verbose });
      // Skip build if either --skip-build or --skip-validation is passed
      const shouldRunBuild = !config.skipBuild && !config.skipValidation;
      const generationResult = await master.generateProject({
        projectName: `${slug}-${variantKey}`,
        fixtureId: fixtureId,
        testMode: true,
        runBuild: shouldRunBuild,
        outputPath: testDir,
        prospectData: prospectData,
        moodSliders: moodSliders,
        layout: layoutId
      });

      if (!generationResult.success) {
        throw new Error(generationResult.errors?.join(', ') || 'Generation failed');
      }

      // Write variant-specific brain.json with spec overlay
      const brainPath = path.join(testDir, 'brain.json');
      if (fs.existsSync(brainPath)) {
        const brain = JSON.parse(fs.readFileSync(brainPath, 'utf8'));

        // Merge spec data
        brain.business = {
          ...brain.business,
          name: businessName,
          tagline: spec.business?.tagline || brain.business.tagline,
          description: spec.business?.description || '',
          contact: spec.business?.contact || brain.business.contact,
          hours: spec.business?.hours || brain.business.hours,
          branding: spec.business?.branding || {}
        };

        brain.sharedSpec = {
          version: spec.version || '1.0.0',
          loadedFrom: config.specFile,
          loadedAt: new Date().toISOString(),
          database: spec.database || null,
          api: spec.api || null,
          agents: spec.agents || null,
          features: spec.features || null
        };

        brain.variant = {
          key: variantKey,
          preset: presetId,
          layout: layoutId,
          moodSliders: moodSliders
        };

        fs.writeFileSync(brainPath, JSON.stringify(brain, null, 2));
      }

      const variantTime = Date.now() - variantStartTime;
      console.log(`   ✅ Complete (${(variantTime / 1000).toFixed(1)}s)`);

      results.success.push(variantKey);
      results.metrics.variants.push({
        key: variantKey,
        preset: presetId,
        layout: layoutId,
        time: variantTime,
        success: true
      });

    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`);
      results.failed.push({ key: variantKey, error: error.message });
      results.metrics.variants.push({
        key: variantKey,
        preset: presetId,
        layout: layoutId,
        success: false,
        error: error.message
      });
    }
  }

  // Final summary
  const totalTime = Date.now() - startTime;
  results.metrics.totalTime = totalTime;

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                      GENERATION COMPLETE                       ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log(`\n📊 Results:`);
  console.log(`   ✅ Success: ${results.success.length}`);
  console.log(`   ❌ Failed: ${results.failed.length}`);
  console.log(`   ⏱️  Total time: ${(totalTime / 1000).toFixed(1)}s`);
  console.log(`\n📁 Output: ${outputDir}`);

  // Write generation report
  const reportPath = path.join(outputDir, 'generation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    business: businessName,
    industry: industry,
    specFile: config.specFile,
    generatedAt: new Date().toISOString(),
    totalTime: totalTime,
    variants: {
      requested: variantsToGenerate.length,
      success: results.success.length,
      failed: results.failed.length
    },
    results: results.metrics.variants,
    outputDir: outputDir
  }, null, 2));

  // Exit with appropriate code
  if (results.failed.length > 0 && results.success.length === 0) {
    process.exit(1);
  }

  return results;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN ENTRY POINT
// ═══════════════════════════════════════════════════════════════════════════

const config = parseArgs();

if (!config.specFile) {
  console.error('❌ --spec-file is required');
  console.error('   Usage: node generate-from-spec.js --spec-file <path>');
  process.exit(1);
}

generateFromSpec(config).catch(err => {
  console.error('❌ Generation failed:', err.message);
  process.exit(1);
});
