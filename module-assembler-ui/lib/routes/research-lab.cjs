/**
 * Research Lab API Routes
 *
 * Backend API for the Research Test Lab UI
 * Provides endpoints for structural page generation based on design research
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Design research config
const {
  getAvailableIndustries,
  getIndustryResearch,
  getLayoutVariant,
  getAllVariants,
  buildStructuralConfig,
  getWinningElements,
  getColorGuidance
} = require('../../config/industry-design-research.cjs');

// Structural page generator
const {
  generateStructuralPage,
  generateAllVariants
} = require('../generators/structural-generator.cjs');

// Hero images config
const { getHeroImages, getHeroImage } = require('../config/hero-images.cjs');

// Output directory for generated projects
const OUTPUT_DIR = path.join(__dirname, '../../output/research-lab');

// Test fixtures directory
const FIXTURES_DIR = path.join(__dirname, '../../test-fixtures');

/**
 * Load test fixture for an industry (provides rich business data)
 */
function loadTestFixture(industryId) {
  const fixturePath = path.join(FIXTURES_DIR, `${industryId}.json`);
  if (fs.existsSync(fixturePath)) {
    return JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
  }
  return null;
}

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// ═══════════════════════════════════════════════════════════════════════════
// GET ENDPOINTS - Data Retrieval
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET /api/research-lab/industries
 * Get list of all available industries
 */
router.get('/industries', (req, res) => {
  try {
    const industries = getAvailableIndustries();
    res.json({
      success: true,
      data: industries,
      count: industries.length
    });
  } catch (error) {
    console.error('Error getting industries:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/research-lab/industry/:industryId
 * Get full research config for a specific industry
 */
router.get('/industry/:industryId', (req, res) => {
  try {
    const { industryId } = req.params;
    const research = getIndustryResearch(industryId);

    if (!research) {
      return res.status(404).json({
        success: false,
        error: `Industry not found: ${industryId}`
      });
    }

    res.json({
      success: true,
      data: {
        id: industryId,
        ...research,
        variants: getAllVariants(industryId),
        winningElements: getWinningElements(industryId),
        colorGuidance: getColorGuidance(industryId)
      }
    });
  } catch (error) {
    console.error('Error getting industry:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/research-lab/industry/:industryId/fixture
 * Get test fixture data with industry-specific images
 */
router.get('/industry/:industryId/fixture', (req, res) => {
  try {
    const { industryId } = req.params;

    // Load test fixture
    const fixture = loadTestFixture(industryId);

    // Get industry-specific images
    const images = {
      hero: getHeroImages(industryId, 'primary'),
      interior: getHeroImages(industryId, 'interior'),
      products: getHeroImages(industryId, 'products'),
      food: getHeroImages(industryId, 'food')
    };

    res.json({
      success: true,
      data: {
        industryId,
        fixture: fixture || null,
        images,
        hasFixture: !!fixture
      }
    });
  } catch (error) {
    console.error('Error loading fixture:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/research-lab/industry/:industryId/variant/:variant
 * Get specific variant config for an industry
 */
router.get('/industry/:industryId/variant/:variant', (req, res) => {
  try {
    const { industryId, variant } = req.params;
    const variantConfig = getLayoutVariant(industryId, variant);

    if (!variantConfig) {
      return res.status(404).json({
        success: false,
        error: `Variant not found: ${industryId}/${variant}`
      });
    }

    res.json({
      success: true,
      data: {
        industryId,
        variant,
        ...variantConfig
      }
    });
  } catch (error) {
    console.error('Error getting variant:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/research-lab/industry/:industryId/structural-config/:variant
 * Get the full structural config that will be passed to the generator
 */
router.get('/industry/:industryId/structural-config/:variant', (req, res) => {
  try {
    const { industryId, variant } = req.params;
    const businessData = req.query.businessData ? JSON.parse(req.query.businessData) : {};

    const config = buildStructuralConfig(industryId, variant, businessData);

    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error getting structural config:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// POST ENDPOINTS - Generation
// ═══════════════════════════════════════════════════════════════════════════

/**
 * POST /api/research-lab/generate
 * Generate a structural page for a single variant
 */
router.post('/generate', async (req, res) => {
  try {
    const {
      industryId,
      variant = 'A',
      moodSliders = {},
      businessData = {}
    } = req.body;

    if (!industryId) {
      return res.status(400).json({
        success: false,
        error: 'industryId is required'
      });
    }

    console.log(`\n🔬 Research Lab: Generating ${industryId} Layout ${variant}`);

    // Generate the structural page
    const pageCode = generateStructuralPage(industryId, variant, moodSliders, businessData);

    // Get the config for reference
    const config = buildStructuralConfig(industryId, variant, businessData);

    res.json({
      success: true,
      data: {
        industryId,
        variant,
        config: {
          name: config.variant.name,
          reference: config.variant.reference,
          mood: config.variant.mood,
          heroType: config.hero.type,
          sectionCount: config.sections.length
        },
        code: pageCode,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error generating page:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/research-lab/generate-all-variants
 * Generate all three variants (A, B, C) for an industry
 */
router.post('/generate-all-variants', async (req, res) => {
  try {
    const {
      industryId,
      moodSliders = {},
      businessData = {}
    } = req.body;

    if (!industryId) {
      return res.status(400).json({
        success: false,
        error: 'industryId is required'
      });
    }

    console.log(`\n🔬 Research Lab: Generating all variants for ${industryId}`);

    // Generate all three variants
    const variants = generateAllVariants(industryId, moodSliders, businessData);

    // Get configs for each
    const configs = {
      A: buildStructuralConfig(industryId, 'A', businessData),
      B: buildStructuralConfig(industryId, 'B', businessData),
      C: buildStructuralConfig(industryId, 'C', businessData)
    };

    res.json({
      success: true,
      data: {
        industryId,
        variants: {
          A: {
            config: {
              name: configs.A.variant.name,
              reference: configs.A.variant.reference,
              mood: configs.A.variant.mood,
              heroType: configs.A.hero.type
            },
            code: variants.A
          },
          B: {
            config: {
              name: configs.B.variant.name,
              reference: configs.B.variant.reference,
              mood: configs.B.variant.mood,
              heroType: configs.B.hero.type
            },
            code: variants.B
          },
          C: {
            config: {
              name: configs.C.variant.name,
              reference: configs.C.variant.reference,
              mood: configs.C.variant.mood,
              heroType: configs.C.hero.type
            },
            code: variants.C
          }
        },
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error generating all variants:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/research-lab/batch-generate
 * Batch generate multiple industries at once
 */
router.post('/batch-generate', async (req, res) => {
  try {
    const {
      industryIds = [],
      variants = ['A', 'B', 'C'],
      moodSliders = {},
      businessData = {}
    } = req.body;

    if (!industryIds.length) {
      return res.status(400).json({
        success: false,
        error: 'industryIds array is required'
      });
    }

    console.log(`\n🔬 Research Lab: Batch generating ${industryIds.length} industries × ${variants.length} variants`);

    const results = [];
    const errors = [];

    for (const industryId of industryIds) {
      try {
        const industryResults = {};

        for (const variant of variants) {
          try {
            const pageCode = generateStructuralPage(industryId, variant, moodSliders, businessData);
            const config = buildStructuralConfig(industryId, variant, businessData);

            industryResults[variant] = {
              success: true,
              config: {
                name: config.variant.name,
                reference: config.variant.reference,
                mood: config.variant.mood,
                heroType: config.hero.type
              },
              codeLength: pageCode.length
            };
          } catch (variantError) {
            industryResults[variant] = {
              success: false,
              error: variantError.message
            };
            errors.push({ industryId, variant, error: variantError.message });
          }
        }

        results.push({
          industryId,
          variants: industryResults
        });
      } catch (industryError) {
        errors.push({ industryId, error: industryError.message });
      }
    }

    res.json({
      success: errors.length === 0,
      data: {
        results,
        summary: {
          total: industryIds.length * variants.length,
          successful: results.reduce((sum, r) =>
            sum + Object.values(r.variants).filter(v => v.success).length, 0),
          failed: errors.length
        },
        errors: errors.length > 0 ? errors : undefined
      },
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in batch generation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/research-lab/generate-comparison
 * Generate all 3 variants as previewable HTML files
 */
router.post('/generate-comparison', async (req, res) => {
  try {
    const { industryId, useFixture = true } = req.body;

    if (!industryId) {
      return res.status(400).json({
        success: false,
        error: 'industryId is required'
      });
    }

    console.log(`\n🔬 Research Lab: Generating 3-way comparison for ${industryId}`);

    // Load fixture data for rich content
    const fixture = useFixture ? loadTestFixture(industryId) : null;
    const images = {
      hero: getHeroImages(industryId, 'primary'),
      interior: getHeroImages(industryId, 'interior'),
      products: getHeroImages(industryId, 'products')
    };

    // Business data from fixture or defaults
    const businessData = fixture ? {
      name: fixture.business.name,
      tagline: fixture.business.tagline,
      phone: fixture.business.phone,
      address: fixture.business.address,
      hours: fixture.business.hours,
      menu: fixture.pages?.menu,
      about: fixture.pages?.about,
      gallery: fixture.pages?.gallery,
      theme: fixture.theme,
      images
    } : {
      name: `Test ${industryId}`,
      tagline: `Your local ${industryId}`,
      images
    };

    // Create output directory
    const comparisonDir = path.join(OUTPUT_DIR, 'comparisons', industryId);
    fs.mkdirSync(comparisonDir, { recursive: true });

    const results = {};

    // Generate each variant
    for (const variant of ['A', 'B', 'C']) {
      const pageCode = generateStructuralPage(industryId, variant, {}, businessData);
      const config = buildStructuralConfig(industryId, variant, businessData);

      // Create previewable HTML
      const html = createPreviewHtml(pageCode, config, businessData);

      // Save HTML file
      const htmlPath = path.join(comparisonDir, `layout-${variant}.html`);
      fs.writeFileSync(htmlPath, html, 'utf8');

      results[variant] = {
        config: {
          name: config.variant.name,
          reference: config.variant.reference,
          mood: config.variant.mood,
          heroType: config.hero.type,
          sections: config.sections.map(s => s.type)
        },
        previewUrl: `/output/research-lab/comparisons/${industryId}/layout-${variant}.html`,
        codeLength: pageCode.length
      };
    }

    // Create index page for comparison
    const indexHtml = createComparisonIndexHtml(industryId, results, businessData);
    fs.writeFileSync(path.join(comparisonDir, 'index.html'), indexHtml, 'utf8');

    res.json({
      success: true,
      data: {
        industryId,
        comparisonUrl: `/output/research-lab/comparisons/${industryId}/index.html`,
        variants: results,
        hasFixture: !!fixture,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error generating comparison:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Create previewable HTML from generated code
 */
function createPreviewHtml(code, config, businessData) {
  // Strip imports and exports
  let cleanCode = code
    .replace(/import\s+React.*?from\s+['"]react['"];?\n?/g, '')
    .replace(/import\s+\{[^}]*\}\s+from\s+['"]react-router-dom['"];?\n?/g, '')
    .replace(/import\s+\{[^}]*\}\s+from\s+['"]lucide-react['"];?\n?/g, '')
    .replace(/export\s+default\s+/g, 'const HomePage = ');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${businessData.name} - Layout ${config.variant?.name || 'Preview'}</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', system-ui, sans-serif; }
    img { max-width: 100%; height: auto; }
    video { max-width: 100%; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    const { useState, useEffect } = React;

    // Mock react-router-dom
    const Link = ({ to, children, style, ...props }) =>
      React.createElement('a', { href: to || '#', style, ...props }, children);

    // Mock Lucide icons
    const iconStyle = (size) => ({ fontSize: size, display: 'inline-block', width: size, textAlign: 'center' });
    const ChevronLeft = ({ size = 24 }) => React.createElement('span', { style: iconStyle(size) }, '‹');
    const ChevronRight = ({ size = 24 }) => React.createElement('span', { style: iconStyle(size) }, '›');
    const Star = ({ size = 24 }) => React.createElement('span', { style: iconStyle(size) }, '★');
    const MapPin = ({ size = 24 }) => React.createElement('span', { style: iconStyle(size) }, '📍');
    const Phone = ({ size = 24 }) => React.createElement('span', { style: iconStyle(size) }, '📞');
    const Clock = ({ size = 24 }) => React.createElement('span', { style: iconStyle(size) }, '🕐');
    const ArrowRight = ({ size = 24 }) => React.createElement('span', { style: iconStyle(size) }, '→');
    const Check = ({ size = 24 }) => React.createElement('span', { style: iconStyle(size) }, '✓');
    const Play = ({ size = 24 }) => React.createElement('span', { style: iconStyle(size) }, '▶');
    const Calendar = ({ size = 24 }) => React.createElement('span', { style: iconStyle(size) }, '📅');
    const Menu = ({ size = 24 }) => React.createElement('span', { style: iconStyle(size) }, '☰');
    const X = ({ size = 24 }) => React.createElement('span', { style: iconStyle(size) }, '✕');

    ${cleanCode}

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(HomePage));
  </script>
</body>
</html>`;
}

/**
 * Create comparison index page with 3 iframes
 */
function createComparisonIndexHtml(industryId, results, businessData) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${businessData.name} - Layout Comparison</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: #111; color: #fff; }
    .header { padding: 20px; background: #1a1a1a; border-bottom: 1px solid #333; }
    .header h1 { font-size: 24px; margin-bottom: 8px; }
    .header p { color: #888; font-size: 14px; }
    .comparison-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; height: calc(100vh - 100px); }
    .variant-panel { display: flex; flex-direction: column; background: #1a1a1a; }
    .variant-header { padding: 12px 16px; background: #222; border-bottom: 1px solid #333; }
    .variant-header h2 { font-size: 16px; margin-bottom: 4px; }
    .variant-header .meta { font-size: 12px; color: #888; }
    .variant-header .hero-type { display: inline-block; padding: 2px 8px; background: #333; border-radius: 4px; font-size: 11px; margin-top: 4px; }
    .variant-iframe { flex: 1; border: none; background: #fff; }
    .tabs { display: flex; gap: 8px; margin-top: 12px; }
    .tab { padding: 8px 16px; background: #333; border: none; color: #fff; cursor: pointer; border-radius: 4px; font-size: 13px; }
    .tab.active { background: #3B82F6; }
    .sections-list { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px; }
    .section-badge { font-size: 10px; padding: 2px 6px; background: #333; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔬 ${businessData.name} - Layout Comparison</h1>
    <p>Industry: ${industryId} | Comparing 3 structural variants</p>
  </div>
  <div class="comparison-grid">
    ${['A', 'B', 'C'].map(v => `
    <div class="variant-panel">
      <div class="variant-header">
        <h2>Layout ${v}: ${results[v].config.name}</h2>
        <div class="meta">${results[v].config.reference} • ${results[v].config.mood}</div>
        <span class="hero-type">Hero: ${results[v].config.heroType}</span>
        <div class="sections-list">
          ${results[v].config.sections.slice(0, 4).map(s => `<span class="section-badge">${s}</span>`).join('')}
          ${results[v].config.sections.length > 4 ? `<span class="section-badge">+${results[v].config.sections.length - 4}</span>` : ''}
        </div>
      </div>
      <iframe class="variant-iframe" src="layout-${v}.html"></iframe>
    </div>
    `).join('')}
  </div>
</body>
</html>`;
}

/**
 * POST /api/research-lab/save
 * Save a generated page to disk
 */
router.post('/save', async (req, res) => {
  try {
    const {
      industryId,
      variant,
      code,
      businessName = 'test-business'
    } = req.body;

    if (!industryId || !variant || !code) {
      return res.status(400).json({
        success: false,
        error: 'industryId, variant, and code are required'
      });
    }

    // Create directory structure
    const projectDir = path.join(OUTPUT_DIR, `${industryId}-${businessName}`, `layout-${variant}`);
    fs.mkdirSync(projectDir, { recursive: true });

    // Save the HomePage.jsx
    const filePath = path.join(projectDir, 'HomePage.jsx');
    fs.writeFileSync(filePath, code, 'utf8');

    console.log(`   💾 Saved to: ${filePath}`);

    res.json({
      success: true,
      data: {
        path: filePath,
        industryId,
        variant,
        savedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error saving page:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// PREVIEW ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * POST /api/research-lab/preview
 * Generate a quick preview (summary) of what a variant will look like
 */
router.post('/preview', async (req, res) => {
  try {
    const { industryId, variant = 'A' } = req.body;

    if (!industryId) {
      return res.status(400).json({
        success: false,
        error: 'industryId is required'
      });
    }

    const config = buildStructuralConfig(industryId, variant, {});

    // Build a preview summary
    const preview = {
      industry: config.industry,
      variant: config.variant,
      hero: {
        type: config.hero.type,
        component: config.hero.component,
        description: getHeroDescription(config.hero.type)
      },
      sections: config.sections.map((s, i) => ({
        order: i + 1,
        type: s.type,
        component: s.component,
        description: getSectionDescription(s.type)
      })),
      features: config.features,
      structuralDifferences: getStructuralDifferences(industryId)
    };

    res.json({
      success: true,
      data: preview
    });
  } catch (error) {
    console.error('Error generating preview:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/research-lab/compare/:industryId
 * Compare all three variants side by side
 */
router.get('/compare/:industryId', (req, res) => {
  try {
    const { industryId } = req.params;
    const research = getIndustryResearch(industryId);

    if (!research) {
      return res.status(404).json({
        success: false,
        error: `Industry not found: ${industryId}`
      });
    }

    const configA = buildStructuralConfig(industryId, 'A', {});
    const configB = buildStructuralConfig(industryId, 'B', {});
    const configC = buildStructuralConfig(industryId, 'C', {});

    const comparison = {
      industry: {
        id: industryId,
        name: research.name,
        styleNote: research.styleNote
      },
      variants: {
        A: {
          name: configA.variant.name,
          reference: configA.variant.reference,
          mood: configA.variant.mood,
          heroType: configA.hero.type,
          heroComponent: configA.hero.component,
          sections: configA.sections.map(s => s.type),
          features: configA.features
        },
        B: {
          name: configB.variant.name,
          reference: configB.variant.reference,
          mood: configB.variant.mood,
          heroType: configB.hero.type,
          heroComponent: configB.hero.component,
          sections: configB.sections.map(s => s.type),
          features: configB.features
        },
        C: {
          name: configC.variant.name,
          reference: configC.variant.reference,
          mood: configC.variant.mood,
          heroType: configC.hero.type,
          heroComponent: configC.hero.component,
          sections: configC.sections.map(s => s.type),
          features: configC.features
        }
      },
      structuralDifferences: {
        heroTypes: {
          A: configA.hero.type,
          B: configB.hero.type,
          C: configC.hero.type
        },
        uniqueSections: {
          A: configA.sections.filter(s =>
            !configB.sections.some(sb => sb.type === s.type) &&
            !configC.sections.some(sc => sc.type === s.type)
          ).map(s => s.type),
          B: configB.sections.filter(s =>
            !configA.sections.some(sa => sa.type === s.type) &&
            !configC.sections.some(sc => sc.type === s.type)
          ).map(s => s.type),
          C: configC.sections.filter(s =>
            !configA.sections.some(sa => sa.type === s.type) &&
            !configB.sections.some(sb => sb.type === s.type)
          ).map(s => s.type)
        }
      }
    };

    res.json({
      success: true,
      data: comparison
    });
  } catch (error) {
    console.error('Error comparing variants:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get human-readable description for a hero type
 */
function getHeroDescription(heroType) {
  const descriptions = {
    'video': 'Full-screen autoplay video background with text overlay',
    'story-split': 'Split layout with story/narrative on one side, image on other',
    'gallery-fullbleed': 'Full-bleed rotating image gallery with parallax effect',
    'minimal-text': 'Clean, minimal text-focused hero with generous whitespace',
    'dark-luxury': 'Dark background with luxury gold accents and subtle animations',
    'split-animated': 'Dynamic split-screen with animated transitions',
    'image-overlay': 'Full-width image with gradient overlay and text',
    'centered-cta': 'Centered content with prominent call-to-action buttons'
  };
  return descriptions[heroType] || 'Standard hero section';
}

/**
 * Get human-readable description for a section type
 */
function getSectionDescription(sectionType) {
  const descriptions = {
    'menu-scroll-reveal': 'Menu items that reveal on scroll with animation',
    'menu-visual-cards': 'Menu as visual cards with images and descriptions',
    'menu-integrated-ordering': 'Menu with built-in online ordering buttons',
    'origin-timeline': 'Business origin story displayed as a timeline',
    'gallery-hover-zoom': 'Image gallery with hover zoom effect',
    'gallery-masonry': 'Pinterest-style masonry image gallery',
    'locations-showcase': 'Multi-location display with images and info',
    'merchandise-shop': 'Product grid for merchandise/retail items',
    'instagram-feed': 'Embedded Instagram feed grid',
    'gift-cards-prominent': 'Prominent gift card purchase section',
    'reviews-carousel': 'Customer reviews in carousel format',
    'services-grid': 'Services displayed in responsive grid',
    'booking-widget': 'Appointment/reservation booking form',
    'about-team-grid': 'Team member profiles in grid layout',
    'faq-accordion': 'Frequently asked questions with accordion',
    'stats-animated': 'Animated statistics/metrics display'
  };
  return descriptions[sectionType] || sectionType;
}

/**
 * Get structural differences summary for an industry
 */
function getStructuralDifferences(industryId) {
  const research = getIndustryResearch(industryId);
  if (!research) return null;

  return {
    layoutA: {
      focus: research.layoutVariants.A.description,
      keyFeatures: research.layoutVariants.A.features.slice(0, 3)
    },
    layoutB: {
      focus: research.layoutVariants.B.description,
      keyFeatures: research.layoutVariants.B.features.slice(0, 3)
    },
    layoutC: {
      focus: research.layoutVariants.C.description,
      keyFeatures: research.layoutVariants.C.features.slice(0, 3)
    }
  };
}

module.exports = router;
