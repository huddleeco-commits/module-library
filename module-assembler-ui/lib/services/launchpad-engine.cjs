/**
 * LAUNCHPAD ENGINE
 *
 * The unified generation engine that combines:
 * - QuickStart simplicity (single input)
 * - Scout power (test mode, AI levels, deployment)
 * - Research Lab intelligence (structural variants)
 *
 * "Business name to live website in 60 seconds"
 */

const path = require('path');
const fs = require('fs');

// Structural research configs
const {
  buildStructuralConfig,
  getAvailableIndustries,
  getIndustryResearch,
  getAllVariants,
  getMenuStyle,
  getMenuStyleId,
  getAllMenuStyles,
  MENU_STYLES
} = require('../../config/industry-design-research.cjs');

// Industry module configuration
const {
  getIndustryModules: getIndustryModulesConfig,
  getModuleType,
  getModuleTypeDefinition,
  getModuleLabel,
  getModuleNames,
  getVariantPalette,
  MODULE_TYPES,
  INDUSTRY_MODULES
} = require('../../config/industry-modules.cjs');

// Hero images library
const { getHeroImages, getHeroImage, normalizeIndustry } = require('../config/hero-images.cjs');

// Structural page generator
const { generateStructuralPage, generateAllVariants, getSmartCTA, getSmartCtaPath, getSmartFeatures } = require('../generators/structural-generator.cjs');

// Admin dashboard generator
const { generateAdminDashboard } = require('../generators/admin-dashboard-generator.cjs');

// Archetype page generators (order, about, gallery, etc.)
const { generateOrderPage: generateArchetypeOrderPage } = require('../generators/archetype-pages.cjs');

// Specialized page generators
const { generateServicesPage: generateFitnessServices, detectFitnessArchetype } = require('../generators/fitness-pages.cjs');
const { generateServicesPage: generateGroomingServices, detectGroomingArchetype } = require('../generators/grooming-pages.cjs');
const { generateServicesPage: generateHealthcareServices, detectHealthcareArchetype } = require('../generators/healthcare-pages.cjs');
const { generateServicesPage: generateProfessionalServices, detectProfessionalArchetype } = require('../generators/professional-pages.cjs');
const { generateServicesPage: generateTechnologyServices, detectTechnologyArchetype } = require('../generators/technology-pages.cjs');
const { generateServicesPage: generateHomeServices } = require('../generators/home-services-pages.cjs');

// Layout archetype detection
const { detectArchetype, detectHomeServicesArchetype } = require('../config/layout-archetypes.cjs');

// Slider style computation (maps vibe/energy/era/density/price to CSS values)
const { getSliderStyles } = require('../prompt-builders/index.cjs');

// Metrics generator for index pages and comparison views
const MetricsGenerator = require('./metrics-generator.cjs');

// Fixtures directory
const FIXTURES_DIR = path.join(__dirname, '../../test-fixtures');
const OUTPUT_DIR = path.join(__dirname, '../../output/launchpad');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// ============================================
// INDUSTRY DETECTION
// ============================================

/**
 * Industry keywords for detection
 */
const INDUSTRY_KEYWORDS = {
  'pizza-restaurant': ['pizza', 'pizzeria', 'pie', 'slice'],
  'steakhouse': ['steak', 'steakhouse', 'grill', 'chophouse', 'prime', 'ribeye'],
  'coffee-cafe': ['coffee', 'cafe', 'espresso', 'roaster', 'beans', 'latte', 'cappuccino'],
  'restaurant': ['restaurant', 'bistro', 'eatery', 'dining', 'kitchen', 'tavern', 'farm-to-table'],
  'bakery': ['bakery', 'baker', 'bread', 'pastry', 'patisserie', 'croissant', 'cake'],
  'salon-spa': ['salon', 'spa', 'beauty', 'hair', 'nails', 'facial', 'massage', 'wellness'],
  'fitness-gym': ['gym', 'fitness', 'crossfit', 'workout', 'training', 'muscle', 'weights'],
  'dental': ['dental', 'dentist', 'orthodont', 'teeth', 'smile', 'oral'],
  'healthcare': ['medical', 'clinic', 'doctor', 'health', 'physician', 'wellness', 'care'],
  'yoga': ['yoga', 'pilates', 'meditation', 'mindful', 'zen', 'stretch'],
  'barbershop': ['barber', 'barbershop', 'haircut', 'fade', 'shave', 'grooming'],
  'law-firm': ['law', 'lawyer', 'attorney', 'legal', 'firm', 'counsel', 'litigation', 'associates', 'justice', 'paralegal'],
  'real-estate': ['real estate', 'realtor', 'realty', 'property', 'properties', 'homes', 'broker', 'premier'],
  'plumber': ['plumb', 'plumber', 'plumbing', 'pipe', 'drain', 'water heater'],
  'cleaning': ['clean', 'cleaning', 'maid', 'janitorial', 'housekeep'],
  'auto-shop': ['auto', 'mechanic', 'car', 'automotive', 'repair', 'garage', 'tire'],
  'saas': ['saas', 'software', 'app', 'platform', 'tech', 'startup', 'digital', 'analytics', 'cloud', 'data-driven'],
  'ecommerce': ['shop', 'store', 'boutique', 'retail', 'ecommerce', 'online store'],
  'school': ['school', 'academy', 'learning', 'education', 'tutor', 'class', 'institute']
};

/**
 * Location patterns for extraction
 */
const LOCATION_PATTERNS = [
  /in\s+([A-Z][a-zA-Z\s]+,?\s*[A-Z]{2})/i,  // "in Brooklyn, NY"
  /in\s+([A-Z][a-zA-Z\s]+)/i,                // "in Brooklyn"
  /,\s*([A-Z][a-zA-Z\s]+,?\s*[A-Z]{2})/i,   // ", Austin, TX"
  /([A-Z][a-zA-Z]+,\s*[A-Z]{2})$/i           // ends with "Austin, TX"
];

/**
 * Detect industry, business name, and location from a single input
 * @param {string} input - User input like "Mario's Pizza in Brooklyn"
 * @returns {object} - Detected info
 */
function detectFromInput(input) {
  const inputLower = input.toLowerCase();

  // Detect industry
  let detectedIndustry = 'restaurant'; // Default fallback
  let highestScore = 0;

  for (const [industry, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (inputLower.includes(keyword)) {
        score += keyword.length; // Longer matches = more specific
      }
    }
    if (score > highestScore) {
      highestScore = score;
      detectedIndustry = industry;
    }
  }

  // Extract location
  let location = null;
  for (const pattern of LOCATION_PATTERNS) {
    const match = input.match(pattern);
    if (match) {
      location = match[1].trim();
      break;
    }
  }

  // Extract business name (remove location and common words)
  let businessName = input
    .replace(/\s+in\s+.*/i, '')  // Remove "in Location"
    .replace(/,\s*[A-Z]{2}$/i, '') // Remove state abbreviation
    .trim();

  // Clean up business name
  if (!businessName || businessName.length < 2) {
    businessName = `New ${detectedIndustry.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`;
  }

  // Get industry info
  const industryInfo = getIndustryResearch(detectedIndustry);
  const variants = getAllVariants(detectedIndustry);

  return {
    input,
    businessName,
    industry: detectedIndustry,
    industryName: industryInfo?.name || detectedIndustry,
    location: location || 'Your City',
    styleNote: industryInfo?.styleNote || '',
    variants: variants ? {
      A: { name: variants.A?.name, heroType: variants.A?.heroType, mood: variants.A?.mood },
      B: { name: variants.B?.name, heroType: variants.B?.heroType, mood: variants.B?.mood },
      C: { name: variants.C?.name, heroType: variants.C?.heroType, mood: variants.C?.mood }
    } : null,
    confidence: highestScore > 0 ? 'high' : 'medium'
  };
}

// ============================================
// FIXTURE LOADING
// ============================================

/**
 * Load fixture for an industry
 */
function loadFixture(industryId) {
  const fixturePath = path.join(FIXTURES_DIR, `${industryId}.json`);
  if (fs.existsSync(fixturePath)) {
    try {
      return JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
    } catch (e) {
      console.warn(`Failed to load fixture for ${industryId}:`, e.message);
    }
  }
  return null;
}

/**
 * Build complete business data from detection + fixture + overrides
 */
function buildBusinessData(detection, overrides = {}) {
  const fixture = loadFixture(detection.industry);
  const images = {
    hero: getHeroImages(detection.industry, 'primary'),
    interior: getHeroImages(detection.industry, 'interior'),
    products: getHeroImages(detection.industry, 'products'),
    team: getHeroImages(detection.industry, 'team')
  };

  // Start with fixture data
  const base = fixture ? {
    name: detection.businessName,
    logo: fixture.business?.logo || null,
    tagline: fixture.business?.tagline || `Welcome to ${detection.businessName}`,
    phone: fixture.business?.phone || '(555) 123-4567',
    email: fixture.business?.email || `hello@${detection.businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
    address: `123 Main St, ${detection.location}`,
    location: detection.location,
    hours: fixture.business?.hours || { 'monday-friday': '9am-6pm', 'saturday-sunday': '10am-4pm' },
    established: fixture.business?.established || '2020',
    // Pages data
    menu: fixture.pages?.menu || null,
    about: fixture.pages?.about || null,
    gallery: fixture.pages?.gallery || null,
    contact: fixture.pages?.contact || null,
    home: fixture.pages?.home || null,
    // Theme
    theme: fixture.theme || {},
    // Industry info
    industry: detection.industry,
    industryName: detection.industryName
  } : {
    name: detection.businessName,
    logo: null,
    tagline: `Welcome to ${detection.businessName}`,
    phone: '(555) 123-4567',
    email: `hello@${detection.businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
    address: `123 Main St, ${detection.location}`,
    location: detection.location,
    hours: { 'monday-friday': '9am-6pm' },
    established: '2020',
    menu: null,
    about: null,
    gallery: null,
    contact: null,
    home: null,
    theme: {},
    industry: detection.industry,
    industryName: detection.industryName
  };

  // Add images
  base.images = images;
  base.heroImage = images.hero?.[0] || '/images/hero.jpg';
  base.heroImages = images.hero || [];

  // Apply overrides
  return { ...base, ...overrides };
}

// ============================================
// GENERATION MODES
// ============================================

/**
 * Generation modes with their features and costs
 */
const GENERATION_MODES = {
  test: {
    id: 'test',
    name: 'Instant',
    description: 'Beautiful baseline, no AI',
    cost: 0,
    features: ['6 pages', 'Real data', 'Industry images', 'Responsive'],
    aiLevel: 0
  },
  enhanced: {
    id: 'enhanced',
    name: 'Enhanced',
    description: 'AI picks optimal layout',
    cost: 0.05,
    features: ['Everything in Instant', 'AI layout selection', 'Optimized sections'],
    aiLevel: 1
  },
  creative: {
    id: 'creative',
    name: 'Creative',
    description: 'AI visual freedom',
    cost: 0.25,
    features: ['Everything in Enhanced', 'Custom copy', 'Unique colors', 'Brand personality'],
    aiLevel: 3
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    description: 'Full AI + competitor analysis',
    cost: 0.50,
    features: ['Everything in Creative', 'Competitor research', 'SEO optimization', 'Conversion focus'],
    aiLevel: 4
  }
};

// ============================================
// PAGE TYPES BY INDUSTRY
// ============================================

/**
 * Recommended pages for each industry
 */
const INDUSTRY_PAGES = {
  'pizza-restaurant': ['home', 'menu', 'about', 'contact', 'gallery', 'order'],
  'steakhouse': ['home', 'menu', 'about', 'contact', 'gallery', 'reservations'],
  'coffee-cafe': ['home', 'menu', 'about', 'contact', 'gallery', 'order', 'reservations'],
  'restaurant': ['home', 'menu', 'about', 'contact', 'gallery', 'reservations'],
  'bakery': ['home', 'menu', 'about', 'contact', 'gallery', 'order'],
  'salon-spa': ['home', 'services', 'about', 'contact', 'gallery', 'book'],
  'fitness-gym': ['home', 'classes', 'about', 'contact', 'gallery', 'membership'],
  'dental': ['home', 'services', 'about', 'contact', 'team', 'book'],
  'healthcare': ['home', 'services', 'about', 'contact', 'team', 'book'],
  'yoga': ['home', 'classes', 'about', 'contact', 'schedule', 'membership'],
  'barbershop': ['home', 'services', 'about', 'contact', 'gallery', 'book'],
  'law-firm': ['home', 'services', 'about', 'contact', 'team', 'consultation'],
  'real-estate': ['home', 'listings', 'about', 'contact', 'team', 'valuation'],
  'plumber': ['home', 'services', 'about', 'contact', 'areas', 'quote'],
  'cleaning': ['home', 'services', 'about', 'contact', 'pricing', 'quote'],
  'auto-shop': ['home', 'services', 'about', 'contact', 'gallery', 'appointment'],
  'saas': ['home', 'features', 'pricing', 'about', 'contact', 'demo'],
  'ecommerce': ['home', 'products', 'about', 'contact', 'cart', 'account'],
  'school': ['home', 'programs', 'about', 'contact', 'admissions', 'calendar']
};

/**
 * Reservation page styles - Different visual treatments for the same booking flow
 */
const RESERVATION_STYLES = {
  'fine-dining': {
    name: 'Fine Dining',
    description: 'Elegant, refined - serif fonts, dark palettes, gold accents, generous whitespace',
    layout: 'centered',
    industries: ['steakhouse', 'restaurant']
  },
  'casual': {
    name: 'Casual',
    description: 'Friendly, approachable - bright colors, bold buttons, playful icons',
    layout: 'card',
    industries: ['pizza-restaurant', 'bakery']
  },
  'modern': {
    name: 'Modern',
    description: 'Trendy, bold - gradients, animations, asymmetric layouts, social proof',
    layout: 'split',
    industries: []
  },
  'classic': {
    name: 'Classic',
    description: 'Timeless, warm - burgundy/green palettes, heritage feel, traditional imagery',
    layout: 'full-width',
    industries: []
  },
  'cafe': {
    name: 'Cafe',
    description: 'Cozy, light - earthy tones, friendly, walk-in friendly messaging',
    layout: 'compact',
    industries: ['coffee-cafe']
  }
};

/**
 * Map industry + variant to reservation style
 */
const INDUSTRY_RESERVATION_STYLES = {
  'steakhouse': { A: 'fine-dining', B: 'classic', C: 'fine-dining' },
  'restaurant': { A: 'fine-dining', B: 'modern', C: 'classic' },
  'pizza-restaurant': { A: 'casual', B: 'modern', C: 'casual' },
  'coffee-cafe': { A: 'cafe', B: 'modern', C: 'casual' },
  'bakery': { A: 'cafe', B: 'casual', C: 'casual' }
};

// ============================================
// FULL SITE GENERATION
// ============================================

/**
 * Generate a complete multi-page site
 * @param {string} input - User input ("Mario's Pizza in Brooklyn")
 * @param {string} variant - Layout variant (A, B, or C)
 * @param {string} mode - Generation mode (test, enhanced, creative, premium)
 * @param {object} options - Additional options
 */
/**
 * Count project metrics: lines of code, files by category
 * @param {string} projectDir - Root project directory
 * @returns {{ totalLines: number, totalFiles: number, frontendFiles: number, backendFiles: number, adminFiles: number }}
 */
function countProjectMetrics(projectDir) {
  const EXTENSIONS = new Set(['.jsx', '.js', '.json', '.css', '.html']);
  const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build']);
  let totalLines = 0;
  let totalFiles = 0;
  let frontendFiles = 0;
  let backendFiles = 0;
  let adminFiles = 0;

  function walk(dir, category) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (SKIP_DIRS.has(entry.name)) continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath, category);
      } else if (EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const lines = content.split('\n').length;
          totalLines += lines;
          totalFiles++;
          if (category === 'frontend') frontendFiles++;
          else if (category === 'backend') backendFiles++;
          else if (category === 'admin') adminFiles++;
        } catch (e) { /* skip unreadable */ }
      }
    }
  }

  walk(path.join(projectDir, 'frontend'), 'frontend');
  walk(path.join(projectDir, 'backend'), 'backend');
  walk(path.join(projectDir, 'admin'), 'admin');
  // Count root-level files (brain.json, package.json, etc.)
  const rootFiles = fs.existsSync(projectDir) ? fs.readdirSync(projectDir).filter(f => {
    const ext = path.extname(f).toLowerCase();
    return EXTENSIONS.has(ext) && !fs.statSync(path.join(projectDir, f)).isDirectory();
  }) : [];
  for (const f of rootFiles) {
    try {
      totalLines += fs.readFileSync(path.join(projectDir, f), 'utf8').split('\n').length;
      totalFiles++;
    } catch (e) { /* skip */ }
  }

  return { totalLines, totalFiles, frontendFiles, backendFiles, adminFiles };
}

async function generateSite(input, variant = 'A', mode = 'test', options = {}) {
  const startTime = Date.now();

  // Step 1: Detect from input (or use override)
  console.log('\n🚀 LAUNCHPAD: Starting generation...');
  const detection = detectFromInput(input);

  // Allow explicit industry override (used by QA suite for reliable generation)
  if (options.industryOverride && INDUSTRY_PAGES[options.industryOverride]) {
    detection.industry = options.industryOverride;
    detection.industryName = options.industryOverride.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    console.log(`   Industry: ${detection.industryName} (${detection.industry}) [override]`);
  } else {
    console.log(`   Industry: ${detection.industryName} (${detection.industry})`);
  }
  console.log(`   Business: ${detection.businessName}`);
  console.log(`   Location: ${detection.location}`);
  console.log(`   Variant: Layout ${variant}`);
  console.log(`   Mode: ${GENERATION_MODES[mode]?.name || mode}`);

  // Step 2: Build business data
  const businessData = buildBusinessData(detection, options.businessData || {});

  // Step 2a: Apply variant-specific color palette
  const variantPalette = getVariantPalette(detection.industry, variant);
  if (variantPalette) {
    businessData.theme = {
      ...businessData.theme,
      colors: {
        ...(businessData.theme?.colors || {}),
        primary: variantPalette.primary,
        secondary: variantPalette.secondary,
        accent: variantPalette.accent
      }
    };
    console.log(`   Variant ${variant} palette: ${variantPalette.primary} / ${variantPalette.accent}`);
  }

  // Step 2b: Apply trend overrides if provided
  const trendOverrides = options.trendOverrides;
  if (trendOverrides) {
    console.log('   📈 Applying trend overrides...');

    // Apply color trends to theme
    if (trendOverrides.colors && trendOverrides.colors.length > 0) {
      const trendColors = parseTrendColors(trendOverrides.colors);
      if (trendColors) {
        businessData.theme = {
          ...businessData.theme,
          trendColors: trendColors,
          colorNote: trendOverrides.colors[0] // First color trend as note
        };
        console.log(`      Colors: ${trendOverrides.colors[0]}`);
      }
    }

    // Apply feature trends
    if (trendOverrides.features && trendOverrides.features.length > 0) {
      businessData.trendingFeatures = trendOverrides.features;
      console.log(`      Features: ${trendOverrides.features.length} trending features`);
    }

    // Apply trust signal trends
    if (trendOverrides.trust && trendOverrides.trust.length > 0) {
      businessData.trendingTrustSignals = trendOverrides.trust;
      console.log(`      Trust: ${trendOverrides.trust.length} trust signals`);
    }

    // Apply hero section trends
    if (trendOverrides.hero && trendOverrides.hero.length > 0) {
      businessData.trendingHeroFeatures = trendOverrides.hero;
      console.log(`      Hero: ${trendOverrides.hero.length} hero features`);
    }

    // Store the full trend data for reference
    businessData._appliedTrends = {
      colors: trendOverrides.colors,
      features: trendOverrides.features,
      trust: trendOverrides.trust,
      hero: trendOverrides.hero,
      stats: trendOverrides.stats,
      appliedAt: new Date().toISOString()
    };
  }

  // Step 2c: Apply custom menu if provided
  if (options.customMenu && options.customMenu.length > 0) {
    console.log('   📋 Applying custom menu...');
    console.log(`      Categories: ${options.customMenu.length}`);
    const totalItems = options.customMenu.reduce((sum, c) => sum + (c.items?.length || 0), 0);
    console.log(`      Items: ${totalItems}`);

    // Override the menu in businessData
    businessData.menu = {
      settings: businessData.menu?.settings || {
        showPriceSymbol: true,
        showPhotos: false,
        enableFilters: true
      },
      categories: options.customMenu.map(cat => ({
        name: cat.name,
        description: cat.description || '',
        items: (cat.items || []).map(item => ({
          name: item.name,
          description: item.description || '',
          price: item.price || 0,
          badges: [],
          dietary: [],
          allergens: []
        }))
      }))
    };
  }

  // Step 3: Get pages for this industry
  const pageTypes = INDUSTRY_PAGES[detection.industry] || INDUSTRY_PAGES['restaurant'];

  // Step 4: Create output directory
  const projectSlug = businessData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
  const menuStyleSuffix = businessData.menuStyle ? `-${businessData.menuStyle}` : '';
  const projectDir = options.outputDir || path.join(OUTPUT_DIR, `${projectSlug}-${variant.toLowerCase()}${menuStyleSuffix}`);
  const frontendDir = path.join(projectDir, 'frontend');
  const srcDir = path.join(frontendDir, 'src');
  const pagesDir = path.join(srcDir, 'pages');
  const componentsDir = path.join(srcDir, 'components');

  // Create directories
  [projectDir, frontendDir, srcDir, pagesDir, componentsDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  // Step 5: Generate pages
  const generatedPages = {};
  const moodSliders = options.moodSliders || {};
  const enablePortal = options.enablePortal !== false; // Default to true
  businessData.enablePortal = enablePortal;

  // Enrich moodSliders with computed design tokens from slider values
  // This makes all 5 sliders (vibe, energy, era, density, price) affect visual output
  const sliderStyles = getSliderStyles(moodSliders, getColors(moodSliders, businessData));
  if (!moodSliders.fontHeading) moodSliders.fontHeading = sliderStyles.fontHeading;
  if (!moodSliders.fontBody) moodSliders.fontBody = sliderStyles.fontBody;
  if (!moodSliders.borderRadius) moodSliders.borderRadius = sliderStyles.borderRadius;
  if (!moodSliders.sectionPadding) moodSliders.sectionPadding = sliderStyles.sectionPadding;
  if (!moodSliders.cardPadding) moodSliders.cardPadding = sliderStyles.cardPadding;
  if (!moodSliders.gap) moodSliders.gap = sliderStyles.gap;
  if (!moodSliders.fontWeight) moodSliders.fontWeight = sliderStyles.fontWeight;
  if (!moodSliders.headlineStyle) moodSliders.headlineStyle = sliderStyles.headlineStyle;
  if (!moodSliders.buttonStyle) moodSliders.buttonStyle = sliderStyles.buttonStyle;
  moodSliders.isLuxury = sliderStyles.isLuxury;
  moodSliders.isPremium = sliderStyles.isPremium;
  // Derive isDark/isMedium from theme if not explicitly set
  if (moodSliders.isDark === undefined && sliderStyles.isDark) moodSliders.isDark = true;
  if (moodSliders.isMedium === undefined && sliderStyles.isMedium) moodSliders.isMedium = true;
  // Luxury with light theme should auto-upgrade to medium for cream backgrounds
  if (sliderStyles.isLuxury && !moodSliders.isDark && !moodSliders.isMedium) {
    moodSliders.isMedium = true;
  }
  // Apply luxury/premium color if no explicit primary color set
  if (!moodSliders.primaryColor && (sliderStyles.isLuxury || sliderStyles.isPremium)) {
    moodSliders.primaryColor = sliderStyles.colors.primary;
  }
  const portalPages = ['login', 'register', 'dashboard', 'profile', 'rewards', 'my-reservations', 'order-history'];

  // Generate HomePage using structural generator
  console.log('   Generating HomePage...');
  const homePageCode = generateStructuralPage(detection.industry, variant, moodSliders, businessData);
  fs.writeFileSync(path.join(pagesDir, 'HomePage.jsx'), homePageCode);
  generatedPages.home = { file: 'HomePage.jsx', lines: homePageCode.split('\n').length };

  // Generate other pages
  for (const pageType of pageTypes.slice(1)) { // Skip 'home', already done
    if (pageType === 'menu' && businessData.menuStyle) {
      console.log(`   Generating ${pageType}Page with style: ${businessData.menuStyle}...`);
    } else {
      console.log(`   Generating ${pageType}Page...`);
    }
    const pageCode = generatePage(pageType, detection.industry, variant, moodSliders, businessData);
    const fileName = `${capitalize(pageType)}Page.jsx`;
    fs.writeFileSync(path.join(pagesDir, fileName), pageCode);
    generatedPages[pageType] = { file: fileName, lines: pageCode.split('\n').length };
  }

  // Step 5b: Generate portal pages if enabled
  if (enablePortal) {
    console.log('   🔐 Generating portal pages...');
    const colors = getColors(moodSliders, businessData);

    for (const portalPage of portalPages) {
      const pageCode = generatePortalPage(portalPage, businessData, colors);
      const fileName = `${capitalize(portalPage)}Page.jsx`;
      fs.writeFileSync(path.join(pagesDir, fileName), pageCode);
      generatedPages[portalPage] = { file: fileName, lines: pageCode.split('\n').length };
    }

    // Generate AuthContext
    console.log('   Generating AuthContext...');
    const authContextCode = generateAuthContext(colors);
    fs.writeFileSync(path.join(componentsDir, 'AuthContext.jsx'), authContextCode);

    // Generate ChatWidget
    console.log('   Generating ChatWidget...');
    fs.writeFileSync(path.join(componentsDir, 'ChatWidget.jsx'), generateChatWidget(colors.primary));
  }

  // Step 6: Generate shared components
  console.log('   Generating Navbar...');
  const allPages = enablePortal ? [...pageTypes, ...portalPages] : pageTypes;
  const navbarCode = generateNavbar(businessData, pageTypes, enablePortal, moodSliders);
  fs.writeFileSync(path.join(componentsDir, 'Navbar.jsx'), navbarCode);

  console.log('   Generating Footer...');
  const footerCode = generateFooter(businessData);
  fs.writeFileSync(path.join(componentsDir, 'Footer.jsx'), footerCode);

  // Step 6c: Generate ContentProvider for data-driven pages
  console.log('   Generating ContentProvider...');
  const contentProviderCode = generateContentProvider();
  fs.writeFileSync(path.join(componentsDir, 'ContentProvider.jsx'), contentProviderCode);

  // Step 6d: Generate CartProvider for shared cart state
  console.log('   Generating CartProvider...');
  const cartProviderCode = generateCartProvider();
  fs.writeFileSync(path.join(componentsDir, 'CartProvider.jsx'), cartProviderCode);

  // Step 6b: Generate API hooks for real-time sync
  console.log('   Generating API hooks...');
  const hooksDir = path.join(srcDir, 'hooks');
  if (!fs.existsSync(hooksDir)) fs.mkdirSync(hooksDir, { recursive: true });

  // Copy useMenu hook
  const useMenuCode = generateUseMenuHook();
  fs.writeFileSync(path.join(hooksDir, 'useMenu.js'), useMenuCode);

  // Copy useReservations hook
  const useReservationsCode = generateUseReservationsHook();
  fs.writeFileSync(path.join(hooksDir, 'useReservations.js'), useReservationsCode);

  // Generate useApi hook (used by BookPage, etc.)
  fs.writeFileSync(path.join(hooksDir, 'useApi.js'), generateUseApiHook());

  // Step 7: Generate App.jsx with routing
  console.log('   Generating App.jsx...');
  const appCode = generateAppWithRouting(pageTypes, businessData, enablePortal, portalPages);
  fs.writeFileSync(path.join(srcDir, 'App.jsx'), appCode);

  // Step 8: Generate brain.json (with structured page content for Website Editor)
  console.log('   Generating brain.json...');
  const pageContent = buildPageContent(businessData, detection.industry, generatedPages);
  const brainJson = {
    ...businessData,
    pages: pageContent,
    _generated: {
      by: 'launchpad',
      at: new Date().toISOString(),
      variant,
      mode,
      pageList: Object.keys(generatedPages),
      trendsApplied: !!trendOverrides
    }
  };
  fs.writeFileSync(path.join(projectDir, 'brain.json'), JSON.stringify(brainJson, null, 2));

  // Step 9: Generate package.json
  const packageJson = generatePackageJson(businessData.name);
  fs.writeFileSync(path.join(frontendDir, 'package.json'), JSON.stringify(packageJson, null, 2));

  // Step 10: Generate index.html
  const indexHtml = generateIndexHtml(businessData);
  fs.writeFileSync(path.join(frontendDir, 'index.html'), indexHtml);

  // Step 11: Generate main.jsx
  const mainJsx = generateMainJsx();
  fs.writeFileSync(path.join(srcDir, 'main.jsx'), mainJsx);

  // Step 12: Generate vite.config.js
  const viteConfig = generateViteConfig();
  fs.writeFileSync(path.join(frontendDir, 'vite.config.js'), viteConfig);

  // ============================================
  // STEP 13: GENERATE BACKEND (Full Stack)
  // ============================================
  console.log('\n📦 Generating Backend...');
  const backendDir = path.join(projectDir, 'backend');
  const backendResult = generateBackend(backendDir, businessData, detection.industry, enablePortal);
  console.log(`   ✅ Backend: ${backendResult.files} files, ${backendResult.modules.length} modules`);

  // ============================================
  // STEP 13b: GENERATE ADMIN DASHBOARD
  // ============================================
  console.log('\n🎛️ Generating Admin Dashboard...');
  const adminDir = path.join(projectDir, 'admin');
  const menuStyleId = businessData.menuStyle || businessData.menu?.style || getMenuStyleId(detection.industry, variant);
  const adminResult = generateAdminDashboard(adminDir, businessData, detection.industry, menuStyleId);
  console.log(`   ✅ Admin Dashboard: ${adminResult.files} files`);

  // ============================================
  // STEP 13c: GENERATE ROOT PACKAGE.JSON
  // ============================================
  console.log('\n📋 Generating Root Package.json...');
  const rootPackageJson = generateRootPackageJson(businessData.name, projectSlug);
  fs.writeFileSync(path.join(projectDir, 'package.json'), JSON.stringify(rootPackageJson, null, 2));

  // Generate README with instructions
  const readmeContent = generateProjectReadme(businessData.name);
  fs.writeFileSync(path.join(projectDir, 'README.md'), readmeContent);
  console.log('   ✅ Root package.json and README generated');

  // ============================================
  // STEP 14: GENERATE INDEX PAGE (Metrics Dashboard)
  // ============================================
  console.log('\n📊 Generating IndexPage...');
  try {
    const metricsGen = new MetricsGenerator();
    const metrics = metricsGen.calculateVariantMetrics(
      projectDir,
      variant,
      'launchpad',
      variant,
      'modern',
      Date.now() - startTime
    );
    metricsGen.generateIndexPage(projectDir, metrics, businessData.name);
    metricsGen.updateAppRoutes(projectDir);
    console.log('   ✅ IndexPage generated with metrics dashboard');
  } catch (metricsErr) {
    console.log('   ⚠️ IndexPage generation skipped:', metricsErr.message);
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(1);

  // Collect project metrics
  const projectMetrics = countProjectMetrics(projectDir);
  projectMetrics.generationTime = parseFloat(duration);
  projectMetrics.pageCount = Object.keys(generatedPages).length;

  console.log(`\n✅ LAUNCHPAD: Full-stack generation complete in ${duration}s`);
  console.log(`   Output: ${projectDir}`);
  console.log(`   Frontend: ${Object.keys(generatedPages).length} pages`);
  console.log(`   Backend: ${backendResult.files} files (${backendResult.modules.join(', ')})`);
  console.log(`   Admin: ${adminResult.files} files`);
  console.log(`   Metrics: ${projectMetrics.totalLines} lines, ${projectMetrics.totalFiles} files`);
  console.log(`\n📖 To run the project:`);
  console.log(`   cd ${projectDir}`);
  console.log(`   npm install`);
  console.log(`   npm run dev:all`);

  return {
    success: true,
    projectDir,
    projectSlug,
    detection,
    businessData: {
      name: businessData.name,
      tagline: businessData.tagline,
      industry: businessData.industry,
      location: businessData.location
    },
    variant,
    mode,
    pages: generatedPages,
    backend: {
      files: backendResult.files,
      modules: backendResult.modules,
      apiUrl: 'http://localhost:5001',
      demoAccounts: [
        { email: 'demo@demo.com', password: 'admin123', role: 'user' },
        { email: 'admin@demo.com', password: 'admin123', role: 'admin' }
      ]
    },
    admin: {
      files: adminResult.files,
      url: 'http://localhost:5002'
    },
    metrics: projectMetrics,
    trendsApplied: !!trendOverrides,
    appliedTrends: trendOverrides ? {
      colorCount: trendOverrides.colors?.length || 0,
      featureCount: trendOverrides.features?.length || 0,
      trustCount: trendOverrides.trust?.length || 0,
      heroCount: trendOverrides.hero?.length || 0
    } : null,
    duration: parseFloat(duration),
    previewUrl: `/output/launchpad/${projectSlug}-${variant.toLowerCase()}/frontend/index.html`,
    fullStack: true
  };
}

// ============================================
// PAGE GENERATORS
// ============================================

/**
 * Generate a specific page type
 */
function generatePage(pageType, industryId, variant, moodSliders, businessData) {
  const generators = {
    menu: generateMenuPage,
    services: generateServicesPage,
    about: generateAboutPage,
    contact: generateContactPage,
    gallery: generateGalleryPage,
    classes: generateClassesPage,
    team: generateTeamPage,
    book: generateBookingPage,
    order: generateOrderPage,
    reservations: generatePublicReservationsPage,
    membership: generateMembershipPage,
    pricing: generatePricingPage,
    features: generateFeaturesPage,
    listings: generateListingsPage,
    products: generateProductsPage,
    quote: generateQuotePage,
    areas: generateAreasPage,
    schedule: generateSchedulePage,
    programs: generateProgramsPage,
    admissions: generateAdmissionsPage,
    demo: generateDemoPage,
    consultation: generateConsultationPage,
    valuation: generateValuationPage,
    appointment: generateBookingPage,
    calendar: generateSchedulePage,
    cart: generateCartPage,
    account: generateAccountPage
  };

  const generator = generators[pageType] || generateGenericPage;
  return generator(industryId, variant, moodSliders, businessData, pageType);
}

// ============================================
// SHARED MENU COMPONENTS CODE
// These are used by all menu style generators
// ============================================

/**
 * Get shared React components code for menu pages
 * All styles use these components for consistency
 */
function getSharedMenuComponents(colors) {
  return `
// Fallback image for broken images
const FALLBACK_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"%3E%3Crect fill="%23f3f4f6" width="120" height="120"/%3E%3Ctext fill="%239ca3af" font-family="system-ui" font-size="12" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';

// Toast notification component
const Toast = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div style={toastStyles.toast} role="alert" aria-live="polite">
      <Check size={18} style={{ color: '#22C55E' }} />
      <span>{message}</span>
    </div>
  );
};

const toastStyles = {
  toast: {
    position: 'fixed',
    bottom: '100px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    zIndex: 100,
    fontSize: '14px',
    fontWeight: '500'
  }
};

// Dietary icons mapping with accessibility
const DietaryIcon = ({ type, size = 16 }) => {
  const iconData = {
    'vegetarian': { icon: <Leaf size={size} style={{ color: '#22C55E' }} aria-hidden="true" />, label: 'Vegetarian' },
    'vegan': { icon: <Leaf size={size} style={{ color: '#16A34A' }} aria-hidden="true" />, label: 'Vegan' },
    'gluten-free': { icon: <WheatOff size={size} style={{ color: '#EAB308' }} aria-hidden="true" />, label: 'Gluten-Free' },
    'spicy': { icon: <Flame size={size} style={{ color: '#EF4444' }} aria-hidden="true" />, label: 'Spicy' }
  };
  const data = iconData[type];
  if (!data) return null;
  return (
    <span title={data.label} aria-label={data.label} role="img">
      {data.icon}
    </span>
  );
};

// Badge component
const Badge = ({ type }) => {
  const badges = {
    'popular': { icon: <Star size={12} aria-hidden="true" />, label: 'Popular', bg: '#FEF3C7', color: '#D97706' },
    'new': { icon: <Sparkles size={12} aria-hidden="true" />, label: 'New', bg: '#EDE9FE', color: '#7C3AED' },
    'chef-pick': { icon: <ChefHat size={12} aria-hidden="true" />, label: "Chef's Pick", bg: '#D1FAE5', color: '#059669' }
  };
  const badge = badges[type];
  if (!badge) return null;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '2px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '600',
      background: badge.bg,
      color: badge.color
    }} aria-label={badge.label}>
      {badge.icon} {badge.label}
    </span>
  );
};

// Image component with fallback
const MenuImage = ({ src, alt, style }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (src) { setImgSrc(src); setHasError(false); }
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(FALLBACK_IMAGE);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      style={style}
      loading="lazy"
      onError={handleError}
    />
  );
};

// Back to top button
const BackToTopButton = ({ show, onClick }) => {
  if (!show) return null;
  return (
    <button onClick={onClick} style={backToTopStyles.button} aria-label="Back to top">
      <ChevronUp size={24} />
    </button>
  );
};

const backToTopStyles = {
  button: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: '${colors.primary}',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 50
  }
};
`;
}

/**
 * Build menu data code from business data
 */
function buildMenuDataCode(menu) {
  let menuDataCode = '';
  let dietaryLegendCode = '';
  let badgeLegendCode = '';
  let allergenLegendCode = '';

  if (menu?.categories) {
    const cats = menu.categories.map(cat => {
      const items = (cat.items || []).map(item => {
        // Format price without $ symbol (pricing psychology)
        const priceVal = typeof item.price === 'number' ? item.price.toFixed(2) : String(item.price).replace('$', '');
        const dietaryArr = item.dietary ? JSON.stringify(item.dietary) : '[]';
        const badgesArr = item.badges ? JSON.stringify(item.badges) : '[]';
        const allergensArr = item.allergens ? JSON.stringify(item.allergens) : '[]';
        const imageStr = item.image ? `, image: '${item.image}'` : '';
        const chefNoteStr = item.chefNote ? `, chefNote: '${escapeQuotes(item.chefNote)}'` : '';
        const originStr = item.origin ? `, origin: '${escapeQuotes(item.origin)}'` : '';
        const pairsWithStr = item.pairsWith ? `, pairsWith: ${JSON.stringify(item.pairsWith)}` : '';

        return `{ name: '${escapeQuotes(item.name)}', description: '${escapeQuotes(item.description || '')}', price: '${priceVal}'${imageStr}, dietary: ${dietaryArr}, badges: ${badgesArr}, allergens: ${allergensArr}${chefNoteStr}${originStr}${pairsWithStr} }`;
      }).join(',\n        ');
      const descStr = cat.description ? `, description: '${escapeQuotes(cat.description)}'` : '';
      return `{ name: '${escapeQuotes(cat.name)}'${descStr}, items: [\n        ${items}\n      ]}`;
    }).join(',\n    ');
    menuDataCode = cats;

    // Build legend code from fixture
    if (menu.dietaryLegend) {
      dietaryLegendCode = Object.entries(menu.dietaryLegend).map(([key, val]) =>
        `'${key}': { icon: '${val.icon}', label: '${escapeQuotes(val.label)}', color: '${val.color}' }`
      ).join(',\n    ');
    }
    if (menu.badgeLegend) {
      badgeLegendCode = Object.entries(menu.badgeLegend).map(([key, val]) =>
        `'${key}': { icon: '${val.icon}', label: '${escapeQuotes(val.label)}', color: '${val.color}' }`
      ).join(',\n    ');
    }
    if (menu.allergenLegend) {
      allergenLegendCode = Object.entries(menu.allergenLegend).map(([key, val]) =>
        `'${key}': '${escapeQuotes(val)}'`
      ).join(',\n    ');
    }
  } else {
    menuDataCode = `{ name: 'Featured Items', items: [
        { name: 'Signature Item', description: 'Our specialty', price: '15.99', dietary: [], badges: ['popular'], allergens: [] },
        { name: 'Popular Choice', description: 'Customer favorite', price: '12.99', dietary: ['vegetarian'], badges: [], allergens: ['dairy'] },
        { name: 'House Special', description: 'Chef recommended', price: '18.99', dietary: [], badges: ['chef-pick'], allergens: [] }
      ]}`;
  }

  // Default legends if not provided
  if (!dietaryLegendCode) {
    dietaryLegendCode = `'vegetarian': { icon: 'leaf', label: 'Vegetarian', color: '#22C55E' },
    'vegan': { icon: 'seedling', label: 'Vegan', color: '#16A34A' },
    'gluten-free': { icon: 'wheat-off', label: 'Gluten-Free', color: '#EAB308' },
    'spicy': { icon: 'flame', label: 'Spicy', color: '#EF4444' }`;
  }
  if (!badgeLegendCode) {
    badgeLegendCode = `'popular': { icon: 'star', label: 'Popular', color: '#F59E0B' },
    'new': { icon: 'sparkles', label: 'New', color: '#8B5CF6' },
    'chef-pick': { icon: 'chef-hat', label: "Chef's Pick", color: '#10B981' }`;
  }
  if (!allergenLegendCode) {
    allergenLegendCode = `'eggs': 'Contains Eggs',
    'dairy': 'Contains Dairy',
    'wheat': 'Contains Wheat/Gluten',
    'nuts': 'Contains Tree Nuts',
    'shellfish': 'Contains Shellfish',
    'fish': 'Contains Fish',
    'soy': 'Contains Soy',
    'sesame': 'Contains Sesame'`;
  }

  return { menuDataCode, dietaryLegendCode, badgeLegendCode, allergenLegendCode };
}

/**
 * Get allergen footer code shared by all styles
 */
function getAllergenFooterCode(colors) {
  return `
      {/* Allergen Legend */}
      <footer style={styles.allergenFooter}>
        <div style={styles.allergenContainer}>
          <h3 style={styles.allergenTitle}>Dietary & Allergen Information</h3>
          <div style={styles.legendGrid}>
            <div style={styles.legendSection}>
              <h4 style={styles.legendLabel}>Dietary Icons</h4>
              <div style={styles.legendItems}>
                {Object.entries(dietaryLegend).map(([key, val]) => (
                  <span key={key} style={styles.legendItem}>
                    <DietaryIcon type={key} size={14} /> {val.label}
                  </span>
                ))}
              </div>
            </div>
            <div style={styles.legendSection}>
              <h4 style={styles.legendLabel}>Allergen Notice</h4>
              <p style={styles.legendText}>
                Please inform your server of any allergies. Our kitchen handles common allergens including eggs, dairy, wheat, nuts, shellfish, and soy.
              </p>
            </div>
          </div>
        </div>
      </footer>`;
}

// ============================================
// MENU PAGE STYLE DISPATCHER
// ============================================

/**
 * Generate Menu Page - Style Dispatcher
 *
 * Routes to the appropriate menu style generator based on industry and variant.
 * All styles preserve research-backed best practices:
 * - No $ symbol on prices
 * - 48px minimum tap targets
 * - Sticky category navigation
 * - Dietary filters
 * - Toast notifications
 * - Accessibility labels
 */
function generateMenuPage(industryId, variant, moodSliders, businessData, pageType) {
  // Get menu style for this industry/variant combination
  const menuStyleId = getMenuStyleId(industryId, variant);

  // Allow override from business data if provided
  const styleOverride = businessData.menuStyle || businessData.menu?.style;
  const finalStyleId = styleOverride || menuStyleId;

  console.log(`   Menu style: ${finalStyleId} (industry: ${industryId}, variant: ${variant})`);

  // Dispatch to appropriate style generator
  const styleGenerators = {
    'photo-grid': generatePhotoGridMenu,
    'elegant-list': generateElegantListMenu,
    'compact-table': generateCompactTableMenu,
    'storytelling-cards': generateStorytellingMenu
  };

  const generator = styleGenerators[finalStyleId] || generatePhotoGridMenu;
  return generator(industryId, variant, moodSliders, businessData, pageType);
}

// ============================================
// STYLE A: PHOTO GRID (Order-Focused, Modern)
// ============================================

/**
 * Photo Grid Menu Style
 *
 * Best for: Pizza, bakeries, coffee cafes, QSR
 * Layout: 3-column responsive grid (2-col tablet, 1-col mobile)
 * Features: Floating cart pill, quick-add on tap, category hero images
 */
function generatePhotoGridMenu(industryId, variant, moodSliders, businessData, pageType) {
  const colors = getColors(moodSliders, businessData);
  const menu = businessData.menu;
  const settings = menu?.settings || { showPriceSymbol: false, showPhotos: true, enableFilters: true };

  // Build menu data code
  let menuDataCode = '';
  let dietaryLegendCode = '';
  let badgeLegendCode = '';
  let allergenLegendCode = '';

  if (menu?.categories) {
    const cats = menu.categories.map(cat => {
      const items = (cat.items || []).map(item => {
        // Format price without $ symbol (pricing psychology)
        const priceVal = typeof item.price === 'number' ? item.price.toFixed(2) : String(item.price).replace('$', '');
        const dietaryArr = item.dietary ? JSON.stringify(item.dietary) : '[]';
        const badgesArr = item.badges ? JSON.stringify(item.badges) : '[]';
        const allergensArr = item.allergens ? JSON.stringify(item.allergens) : '[]';
        const imageStr = item.image ? `, image: '${item.image}'` : '';

        return `{ name: '${escapeQuotes(item.name)}', description: '${escapeQuotes(item.description || '')}', price: '${priceVal}'${imageStr}, dietary: ${dietaryArr}, badges: ${badgesArr}, allergens: ${allergensArr} }`;
      }).join(',\n        ');
      const descStr = cat.description ? `, description: '${escapeQuotes(cat.description)}'` : '';
      return `{ name: '${escapeQuotes(cat.name)}'${descStr}, items: [\n        ${items}\n      ]}`;
    }).join(',\n    ');
    menuDataCode = cats;

    // Build legend code from fixture (escape single quotes in labels)
    if (menu.dietaryLegend) {
      dietaryLegendCode = Object.entries(menu.dietaryLegend).map(([key, val]) =>
        `'${key}': { icon: '${val.icon}', label: '${escapeQuotes(val.label)}', color: '${val.color}' }`
      ).join(',\n    ');
    }
    if (menu.badgeLegend) {
      badgeLegendCode = Object.entries(menu.badgeLegend).map(([key, val]) =>
        `'${key}': { icon: '${val.icon}', label: '${escapeQuotes(val.label)}', color: '${val.color}' }`
      ).join(',\n    ');
    }
    if (menu.allergenLegend) {
      allergenLegendCode = Object.entries(menu.allergenLegend).map(([key, val]) =>
        `'${key}': '${escapeQuotes(val)}'`
      ).join(',\n    ');
    }
  } else {
    menuDataCode = `{ name: 'Featured Items', items: [
        { name: 'Signature Item', description: 'Our specialty', price: '15.99', dietary: [], badges: ['popular'], allergens: [] },
        { name: 'Popular Choice', description: 'Customer favorite', price: '12.99', dietary: ['vegetarian'], badges: [], allergens: ['dairy'] },
        { name: 'House Special', description: 'Chef recommended', price: '18.99', dietary: [], badges: ['chef-pick'], allergens: [] }
      ]}`;
  }

  // Default legends if not provided
  if (!dietaryLegendCode) {
    dietaryLegendCode = `'vegetarian': { icon: 'leaf', label: 'Vegetarian', color: '#22C55E' },
    'vegan': { icon: 'seedling', label: 'Vegan', color: '#16A34A' },
    'gluten-free': { icon: 'wheat-off', label: 'Gluten-Free', color: '#EAB308' },
    'spicy': { icon: 'flame', label: 'Spicy', color: '#EF4444' }`;
  }
  if (!badgeLegendCode) {
    badgeLegendCode = `'popular': { icon: 'star', label: 'Popular', color: '#F59E0B' },
    'new': { icon: 'sparkles', label: 'New', color: '#8B5CF6' },
    'chef-pick': { icon: 'chef-hat', label: "Chef's Pick", color: '#10B981' }`;
  }
  if (!allergenLegendCode) {
    allergenLegendCode = `'eggs': 'Contains Eggs',
    'dairy': 'Contains Dairy',
    'wheat': 'Contains Wheat/Gluten',
    'nuts': 'Contains Tree Nuts',
    'shellfish': 'Contains Shellfish',
    'fish': 'Contains Fish',
    'soy': 'Contains Soy',
    'sesame': 'Contains Sesame'`;
  }

  // Get hero image - use reliable Unsplash image
  const heroImage = businessData.images?.hero?.[0] || businessData.heroImage || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1920&q=80';

  return `/**
 * Menu Page - ${businessData.name}
 *
 * Research-backed best practices:
 * - Pricing psychology: No $ symbol (Cornell study)
 * - Golden Triangle: High-margin items positioned strategically
 * - 7 items visible max reduces choice anxiety
 * - Photos increase sales +44% (DoorDash)
 * - Sticky category tabs for easy navigation
 * - Mobile-first: 48px min tap targets
 * - Cart with toast notifications
 * - Search functionality
 * - Accessibility labels
 *
 * API-Connected: Uses useMenu hook for real-time sync with admin dashboard.
 * Fallback data embedded for offline/API-unavailable scenarios.
 *
 * Generated by Launchpad Engine v2
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Star, Sparkles, ChefHat, Leaf, Flame, WheatOff, Plus, Filter, X, Search, ChevronUp, ChevronDown, ShoppingBag, Check, RefreshCw } from 'lucide-react';
import { useMenu } from '../hooks/useMenu';
import { useCart } from '../components/CartProvider';
import { usePageContent } from '../components/ContentProvider';

// Fallback image for broken images
const FALLBACK_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"%3E%3Crect fill="%23f3f4f6" width="120" height="120"/%3E%3Ctext fill="%239ca3af" font-family="system-ui" font-size="12" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';

// Toast notification component
const Toast = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div style={styles.toast} role="alert" aria-live="polite">
      <Check size={18} style={{ color: '#22C55E' }} />
      <span>{message}</span>
    </div>
  );
};

// Dietary icons mapping with accessibility
const DietaryIcon = ({ type, size = 16 }) => {
  const iconData = {
    'vegetarian': { icon: <Leaf size={size} style={{ color: '#22C55E' }} aria-hidden="true" />, label: 'Vegetarian' },
    'vegan': { icon: <Leaf size={size} style={{ color: '#16A34A' }} aria-hidden="true" />, label: 'Vegan' },
    'gluten-free': { icon: <WheatOff size={size} style={{ color: '#EAB308' }} aria-hidden="true" />, label: 'Gluten-Free' },
    'spicy': { icon: <Flame size={size} style={{ color: '#EF4444' }} aria-hidden="true" />, label: 'Spicy' }
  };
  const data = iconData[type];
  if (!data) return null;
  return (
    <span title={data.label} aria-label={data.label} role="img">
      {data.icon}
    </span>
  );
};

// Badge component
const Badge = ({ type }) => {
  const badges = {
    'popular': { icon: <Star size={12} aria-hidden="true" />, label: 'Popular', bg: '#FEF3C7', color: '#D97706' },
    'new': { icon: <Sparkles size={12} aria-hidden="true" />, label: 'New', bg: '#EDE9FE', color: '#7C3AED' },
    'chef-pick': { icon: <ChefHat size={12} aria-hidden="true" />, label: "Chef's Pick", bg: '#D1FAE5', color: '#059669' }
  };
  const badge = badges[type];
  if (!badge) return null;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '2px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '600',
      background: badge.bg,
      color: badge.color
    }} aria-label={badge.label}>
      {badge.icon} {badge.label}
    </span>
  );
};

// Image component with fallback
const MenuImage = ({ src, alt, style }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (src) { setImgSrc(src); setHasError(false); }
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(FALLBACK_IMAGE);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      style={style}
      loading="lazy"
      onError={handleError}
    />
  );
};

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [activeFilters, setActiveFilters] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { cart, addToCart: contextAddToCart, cartItemCount } = useCart();
  const [toast, setToast] = useState({ visible: false, message: '' });
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const categoryRefs = useRef({});
  const moreDropdownRef = useRef(null);

  // Max visible categories before "More" dropdown
  const MAX_VISIBLE_CATEGORIES = 8;

  // Embedded fallback menu data (used when API unavailable)
  const fallbackMenuData = {
    categories: [
      ${menuDataCode}
    ]
  };

  // Use the menu hook for real-time sync with admin dashboard
  // Falls back to embedded data if API unavailable
  const { categories: apiCategories, loading: menuLoading, error: menuError, connected, isFallback } = useMenu(fallbackMenuData);

  // ContentProvider overlay for admin-edited images
  const menuContent = usePageContent('menu');

  // Transform API data to match expected format, or use fallback
  const menuCategories = useMemo(() => {
    let cats;
    if (apiCategories && apiCategories.length > 0) {
      cats = apiCategories.map(cat => ({
        name: cat.name,
        description: cat.description || '',
        items: (cat.items || []).map(item => ({
          name: item.name,
          description: item.description || '',
          price: typeof item.price === 'number' ? item.price.toFixed(2) : String(item.price).replace('$', ''),
          image: item.image_url || item.image,
          dietary: Object.entries(item.dietary_flags || {}).filter(([k,v]) => v).map(([k]) => k),
          badges: item.popular ? ['popular'] : [],
          allergens: []
        }))
      }));
    } else {
      cats = fallbackMenuData.categories;
    }
    // Overlay brain.json edits (admin-edited text + images)
    if (menuContent?.categories) {
      const contentCats = menuContent.categories;
      cats = cats.map(cat => {
        const cc = contentCats.find(c => c.name === cat.name);
        if (!cc?.items) return cat;
        return { ...cat, items: cat.items.map(item => {
          const ci = cc.items.find(i => i.name === item.name);
          if (!ci) return item;
          return { ...item, ...(ci.name && { name: ci.name }), ...(ci.description && { description: ci.description }), ...(ci.price && { price: ci.price }), ...(ci.image && { image: ci.image }) };
        })};
      });
    }
    return cats;
  }, [apiCategories, menuContent]);

  // Featured items (Golden Triangle: chef-picks, popular, and new items)
  const featuredItems = menuCategories
    .flatMap(cat => cat.items)
    .filter(item => item.badges?.some(b => ['chef-pick', 'popular', 'new'].includes(b)))
    .slice(0, 3);

  // Legends
  const dietaryLegend = {
    ${dietaryLegendCode}
  };

  const badgeLegend = {
    ${badgeLegendCode}
  };

  const allergenLegend = {
    ${allergenLegendCode}
  };

  // Calculate total items for filter count
  const totalItems = menuCategories.reduce((sum, cat) => sum + cat.items.length, 0);

  // Add to cart function (shared via CartProvider)
  const addToCart = useCallback((item) => {
    contextAddToCart(item);
    setToast({ visible: true, message: \`Added \${item.name} to cart\` });
  }, [contextAddToCart]);

  // Close toast
  const closeToast = useCallback(() => {
    setToast({ visible: false, message: '' });
  }, []);

  // Scroll to category
  const scrollToCategory = (idx) => {
    setActiveCategory(idx);
    setShowMoreCategories(false);
    const element = categoryRefs.current[idx];
    if (element) {
      const yOffset = -140;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Split categories into visible and overflow
  const visibleCategories = menuCategories.slice(0, MAX_VISIBLE_CATEGORIES);
  const overflowCategories = menuCategories.slice(MAX_VISIBLE_CATEGORIES);
  const hasOverflow = overflowCategories.length > 0;

  // Back to top visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close "More" dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(e.target)) {
        setShowMoreCategories(false);
      }
    };
    if (showMoreCategories) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMoreCategories]);

  // Intersection Observer for active category highlighting
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.dataset.categoryIndex);
            setActiveCategory(idx);
          }
        });
      },
      { rootMargin: '-140px 0px -50% 0px', threshold: 0.1 }
    );

    Object.values(categoryRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  // Filter items based on dietary preferences and search
  const filterItems = (items) => {
    let filtered = items;

    // Apply dietary filters
    if (activeFilters.length > 0) {
      filtered = filtered.filter(item =>
        activeFilters.every(filter => item.dietary?.includes(filter))
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  // Get total filtered items count
  const getFilteredCount = () => {
    return menuCategories.reduce((sum, cat) => sum + filterItems(cat.items).length, 0);
  };

  // Toggle dietary filter
  const toggleFilter = (filter) => {
    setActiveFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  // Check if item has photo (hero items)
  const hasPhoto = (item) => !!item.image;

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredCount = getFilteredCount();
  const isFiltering = activeFilters.length > 0 || searchQuery.trim();

  return (
    <div style={styles.page}>
      {/* Toast Notification */}
      <Toast message={toast.message} isVisible={toast.visible} onClose={closeToast} />

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroOverlay} />
        <img src="${heroImage}" alt="Menu" style={styles.heroImage} loading="eager" />
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Our Menu</h1>
          <p style={styles.heroSubtitle}>${escapeQuotes(businessData.tagline || 'Fresh, delicious, made with love')}</p>
        </div>
      </section>

      {/* Featured/Seasonal Section - Research: Golden triangle positioning */}
      {featuredItems.length > 0 && (
        <section style={styles.featuredSection}>
          <div style={styles.featuredContainer}>
            <div style={styles.featuredHeader}>
              <span style={styles.featuredBadge}>Limited Time</span>
              <h2 style={styles.featuredTitle}>Featured Items</h2>
            </div>
            <div style={styles.featuredGrid}>
              {featuredItems.slice(0, 3).map((item, idx) => (
                <article key={idx} style={styles.featuredCard}>
                  <div style={styles.featuredImageWrap}>
                    <MenuImage src={item.image} alt={item.name} style={styles.featuredImage} />
                    {item.badges?.[0] && (
                      <span style={styles.featuredItemBadge}>
                        {item.badges.includes('chef-pick') ? "Chef's Pick" : item.badges.includes('new') ? 'New' : 'Popular'}
                      </span>
                    )}
                  </div>
                  <div style={styles.featuredContent}>
                    <div style={styles.featuredTop}>
                      <h3 style={styles.featuredName}>{item.name}</h3>
                      <span style={styles.featuredPrice}>{item.price}</span>
                    </div>
                    <p style={styles.featuredDesc}>{item.description}</p>
                    <button
                      style={styles.featuredOrderBtn}
                      onClick={() => addToCart(item)}
                      aria-label={\`Add \${item.name} to cart\`}
                    >
                      Add to Order
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Search Bar */}
      <section style={styles.searchSection}>
        <div style={styles.searchContainer}>
          <div style={styles.searchInputWrapper}>
            <Search size={20} style={styles.searchIcon} aria-hidden="true" />
            <input
              type="search"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
              aria-label="Search menu items"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={styles.searchClear}
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>
          {cartItemCount > 0 && (
            <Link to="/order" style={styles.cartButton} aria-label={\`Cart with \${cartItemCount} items\`}>
              <ShoppingBag size={20} />
              <span style={styles.cartBadge}>{cartItemCount}</span>
            </Link>
          )}
        </div>
      </section>

      {/* Sticky Category Tabs */}
      <nav style={styles.categoryNav} aria-label="Menu categories">
        <div style={styles.categoryTabsContainer}>
          <div style={styles.categoryTabs}>
            {visibleCategories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => scrollToCategory(idx)}
                style={{
                  ...styles.categoryTab,
                  background: activeCategory === idx ? '${colors.primary}' : 'transparent',
                  color: activeCategory === idx ? '#fff' : '${colors.text}',
                  borderColor: activeCategory === idx ? '${colors.primary}' : '#e5e7eb'
                }}
                aria-pressed={activeCategory === idx}
              >
                {cat.name}
              </button>
            ))}
            {hasOverflow && (
              <div style={styles.moreDropdownWrapper} ref={moreDropdownRef}>
                <button
                  onClick={() => setShowMoreCategories(!showMoreCategories)}
                  style={{
                    ...styles.categoryTab,
                    ...styles.moreButton,
                    background: activeCategory >= MAX_VISIBLE_CATEGORIES ? '${colors.primary}' : 'transparent',
                    color: activeCategory >= MAX_VISIBLE_CATEGORIES ? '#fff' : '${colors.text}',
                    borderColor: activeCategory >= MAX_VISIBLE_CATEGORIES ? '${colors.primary}' : '#e5e7eb'
                  }}
                  aria-expanded={showMoreCategories}
                  aria-haspopup="true"
                >
                  +{overflowCategories.length} More
                  <ChevronDown size={16} style={{ marginLeft: '4px', transform: showMoreCategories ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                </button>
                {showMoreCategories && (
                  <div style={styles.moreDropdown}>
                    {overflowCategories.map((cat, idx) => {
                      const actualIdx = MAX_VISIBLE_CATEGORIES + idx;
                      return (
                        <button
                          key={actualIdx}
                          onClick={() => scrollToCategory(actualIdx)}
                          style={{
                            ...styles.dropdownItem,
                            background: activeCategory === actualIdx ? '${colors.primary}10' : 'transparent',
                            color: activeCategory === actualIdx ? '${colors.primary}' : '${colors.text}'
                          }}
                        >
                          {cat.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Dietary Filters */}
      ${settings.enableFilters !== false ? `<section style={styles.filtersSection}>
        <div style={styles.filtersContainer}>
          <div style={styles.filtersRow}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={styles.filterToggle}
              aria-expanded={showFilters}
            >
              <Filter size={18} aria-hidden="true" />
              Dietary Filters
              {activeFilters.length > 0 && (
                <span style={styles.filterCount}>{activeFilters.length}</span>
              )}
            </button>
            {isFiltering && (
              <span style={styles.resultsCount}>
                Showing {filteredCount} of {totalItems} items
              </span>
            )}
          </div>
          {showFilters && (
            <div style={styles.filterButtons}>
              {Object.entries(dietaryLegend).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => toggleFilter(key)}
                  style={{
                    ...styles.filterBtn,
                    background: activeFilters.includes(key) ? val.color : '#f3f4f6',
                    color: activeFilters.includes(key) ? '#fff' : '#374151'
                  }}
                  aria-pressed={activeFilters.includes(key)}
                >
                  <DietaryIcon type={key} size={14} />
                  {val.label}
                  {activeFilters.includes(key) && <X size={14} aria-hidden="true" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>` : ''}

      {/* Menu Sections */}
      <main style={styles.main}>
        {menuCategories.map((category, catIdx) => {
          const filteredItems = filterItems(category.items);
          if (filteredItems.length === 0) return null;

          return (
            <section
              key={catIdx}
              ref={el => categoryRefs.current[catIdx] = el}
              data-category-index={catIdx}
              style={styles.menuSection}
              id={\`category-\${catIdx}\`}
              aria-labelledby={\`category-title-\${catIdx}\`}
            >
              <div style={styles.categoryHeader}>
                <h2 style={styles.categoryTitle} id={\`category-title-\${catIdx}\`}>{category.name}</h2>
                {category.description && (
                  <p style={styles.categoryDesc}>{category.description}</p>
                )}
              </div>

              <div style={styles.menuItems}>
                {filteredItems.map((item, idx) => (
                  /* Photo Grid Card - Image-first design */
                  <article key={idx} style={styles.menuCard}>
                    {/* Item Image */}
                    <div style={styles.cardImageWrapper}>
                      <MenuImage
                        src={item.image || \`https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80&fit=crop\`}
                        alt={item.name}
                        style={styles.cardImage}
                      />
                      {item.badges?.length > 0 && (
                        <div style={styles.imageBadges}>
                          {item.badges.map((badge, i) => (
                            <Badge key={i} type={badge} />
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Card Content */}
                    <div style={styles.cardContent}>
                      <div style={styles.cardHeader}>
                        <h3 style={styles.itemName}>{item.name}</h3>
                        <span style={styles.itemPrice}>{item.price}</span>
                      </div>
                      {item.dietary?.length > 0 && (
                        <div style={styles.cardDietary}>
                          {item.dietary.map((d, i) => (
                            <DietaryIcon key={i} type={d} size={14} />
                          ))}
                        </div>
                      )}
                      <p style={styles.itemDesc}>{item.description}</p>
                    </div>
                    <button
                      style={styles.addButton}
                      onClick={() => addToCart(item)}
                      aria-label={\`Add \${item.name} to cart\`}
                    >
                      <Plus size={16} aria-hidden="true" /> Add to Cart
                    </button>
                  </article>
                ))}
              </div>
            </section>
          );
        })}

        {/* No results message */}
        {filteredCount === 0 && isFiltering && (
          <div style={styles.noResults}>
            <p>No items match your filters.</p>
            <button onClick={() => { setActiveFilters([]); setSearchQuery(''); }} style={styles.clearFiltersBtn}>
              Clear all filters
            </button>
          </div>
        )}
      </main>

      {/* Allergen Legend */}
      <footer style={styles.allergenFooter}>
        <div style={styles.allergenContainer}>
          <h3 style={styles.allergenTitle}>Dietary & Allergen Information</h3>
          <div style={styles.legendGrid}>
            <div style={styles.legendSection}>
              <h4 style={styles.legendLabel}>Dietary Icons</h4>
              <div style={styles.legendItems}>
                {Object.entries(dietaryLegend).map(([key, val]) => (
                  <span key={key} style={styles.legendItem}>
                    <DietaryIcon type={key} size={14} /> {val.label}
                  </span>
                ))}
              </div>
            </div>
            <div style={styles.legendSection}>
              <h4 style={styles.legendLabel}>Allergen Notice</h4>
              <p style={styles.legendText}>
                Please inform your server of any allergies. Our kitchen handles common allergens including eggs, dairy, wheat, nuts, shellfish, and soy.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          style={styles.backToTop}
          aria-label="Back to top"
        >
          <ChevronUp size={24} />
        </button>
      )}
    </div>
  );
}

const styles = {
  page: {
    background: '#ffffff',
    minHeight: '100vh',
    position: 'relative'
  },

  /* Toast Notification */
  toast: {
    position: 'fixed',
    bottom: '100px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    zIndex: 100,
    fontSize: '14px',
    fontWeight: '500',
    animation: 'slideUp 0.3s ease'
  },

  /* Hero Styles */
  hero: {
    position: 'relative',
    height: '300px',
    overflow: 'hidden'
  },
  heroImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6))',
    zIndex: 1
  },
  heroContent: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    zIndex: 2,
    padding: '20px'
  },
  heroTitle: {
    fontSize: 'clamp(2.5rem, 6vw, 4rem)',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '12px',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
  },
  heroSubtitle: {
    fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
    color: 'rgba(255,255,255,0.9)',
    maxWidth: '600px'
  },

  /* Search Section */
  searchSection: {
    background: '#ffffff',
    padding: '12px 0',
    borderBottom: '1px solid #e5e7eb'
  },
  searchContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 16px',
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  },
  searchInputWrapper: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  searchIcon: {
    position: 'absolute',
    left: '14px',
    color: '#9ca3af',
    pointerEvents: 'none'
  },
  searchInput: {
    width: '100%',
    padding: '12px 44px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  searchClear: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#9ca3af',
    padding: '4px',
    display: 'flex'
  },
  cartButton: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    background: '${colors.primary}',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer'
  },
  cartBadge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    background: '#EF4444',
    color: '#fff',
    fontSize: '11px',
    fontWeight: '700',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  /* Sticky Category Nav */
  categoryNav: {
    position: 'sticky',
    top: '72px',
    background: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    zIndex: 40,
    padding: '12px 0'
  },
  categoryTabsContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 16px'
  },
  categoryTabs: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    padding: '4px 0',
    alignItems: 'center'
  },
  categoryTab: {
    padding: '10px 20px',
    border: '2px solid #e5e7eb',
    borderRadius: '24px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    minHeight: '48px',
    minWidth: '48px',
    flexShrink: 0
  },
  moreDropdownWrapper: {
    position: 'relative'
  },
  moreButton: {
    display: 'inline-flex',
    alignItems: 'center'
  },
  moreDropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
    padding: '8px 0',
    minWidth: '200px',
    maxHeight: '300px',
    overflowY: 'auto',
    zIndex: 50
  },
  dropdownItem: {
    display: 'block',
    width: '100%',
    padding: '12px 16px',
    border: 'none',
    background: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background 0.15s'
  },

  /* Filters Section */
  filtersSection: {
    background: '#f9fafb',
    padding: '12px 0',
    borderBottom: '1px solid #e5e7eb'
  },
  filtersContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 16px'
  },
  filtersRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px'
  },
  resultsCount: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '500'
  },
  filterToggle: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151'
  },
  filterCount: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    background: '${colors.primary}',
    color: '#fff',
    borderRadius: '50%',
    fontSize: '11px',
    fontWeight: '600'
  },
  filterButtons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '12px'
  },
  filterBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.2s',
    minHeight: '36px'
  },

  /* Main Menu Content */
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '32px 20px 60px'
  },
  menuSection: {
    marginBottom: '48px'
  },
  categoryHeader: {
    marginBottom: '20px',
    paddingBottom: '12px',
    borderBottom: '2px solid ${colors.primary}'
  },
  categoryTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '4px'
  },
  categoryDesc: {
    fontSize: '0.9rem',
    color: '#6b7280',
    fontStyle: 'italic'
  },
  menuItems: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '24px'
  },

  /* Photo Grid Card - Image-first design */
  menuCard: {
    display: 'flex',
    flexDirection: 'column',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    overflow: 'hidden',
    transition: 'box-shadow 0.2s, transform 0.2s'
  },
  cardImageWrapper: {
    position: 'relative',
    width: '100%',
    aspectRatio: '4/3',
    overflow: 'hidden',
    background: '#f3f4f6'
  },
  cardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  imageBadges: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    display: 'flex',
    gap: '6px'
  },
  cardContent: {
    padding: '16px',
    flex: 1
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '8px'
  },
  cardDietary: {
    display: 'flex',
    gap: '6px',
    marginBottom: '8px'
  },

  /* Shared Item Styles */
  itemName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1f2937',
    display: 'inline-flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '6px'
  },
  itemDesc: {
    fontSize: '0.875rem',
    color: '#6b7280',
    lineHeight: 1.5,
    margin: 0
  },
  itemPrice: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '${colors.primary}',
    whiteSpace: 'nowrap'
  },
  dietaryIcon: {
    display: 'inline-flex',
    marginLeft: '2px'
  },
  inlineBadge: {
    display: 'inline-flex',
    marginLeft: '4px'
  },

  /* Add Buttons */
  addButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px 20px',
    margin: '0 16px 16px 16px',
    background: '${colors.primary}',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    transition: 'opacity 0.2s, transform 0.1s',
    minHeight: '48px'
  },
  addButtonSmall: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    background: '${colors.primary}',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    flexShrink: 0
  },

  /* Allergen Footer */
  allergenFooter: {
    background: '#f9fafb',
    borderTop: '1px solid #e5e7eb',
    padding: '40px 16px'
  },
  allergenContainer: {
    maxWidth: '900px',
    margin: '0 auto'
  },
  allergenTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '16px'
  },
  legendGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px'
  },
  legendSection: {},
  legendLabel: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px'
  },
  legendItems: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px'
  },
  legendItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.875rem',
    color: '#6b7280'
  },
  legendText: {
    fontSize: '0.875rem',
    color: '#6b7280',
    lineHeight: 1.6,
    margin: 0
  },

  /* Featured/Seasonal Section - Golden Triangle */
  featuredSection: {
    background: 'linear-gradient(to bottom, ${colors.primary}08, #ffffff)',
    padding: '32px 0'
  },
  featuredContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px'
  },
  featuredHeader: {
    textAlign: 'center',
    marginBottom: '24px'
  },
  featuredBadge: {
    display: 'inline-block',
    padding: '6px 16px',
    background: '#DC2626',
    color: '#ffffff',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  featuredTitle: {
    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
    fontWeight: '700',
    color: '#1f2937',
    margin: 0
  },
  featuredGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px'
  },
  featuredCard: {
    background: '#ffffff',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  featuredImageWrap: {
    position: 'relative',
    height: '200px'
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  featuredItemBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    padding: '6px 14px',
    background: '${colors.primary}',
    color: '#ffffff',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600'
  },
  featuredContent: {
    padding: '20px'
  },
  featuredTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '12px'
  },
  featuredName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0
  },
  featuredPrice: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '${colors.primary}',
    whiteSpace: 'nowrap'
  },
  featuredDesc: {
    fontSize: '0.875rem',
    color: '#6b7280',
    lineHeight: 1.5,
    margin: '0 0 16px 0'
  },
  featuredOrderBtn: {
    display: 'block',
    width: '100%',
    padding: '12px 20px',
    background: '${colors.primary}',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'center',
    minHeight: '48px'
  }
};

/* Responsive styles would be handled by media queries in a real app */
`;
}

// ============================================
// STYLE B: ELEGANT LIST (Fine Dining, Text-Focused)
// ============================================

/**
 * Elegant List Menu Style
 *
 * Best for: Steakhouses, fine dining, upscale restaurants
 * Layout: Single-column centered (max-width: 700px)
 * Features: Dotted leader lines, ornamental dividers, luxurious spacing
 * Typography: Elegant serif (Playfair Display / Cormorant)
 */
function generateElegantListMenu(industryId, variant, moodSliders, businessData, pageType) {
  const colors = getColors(moodSliders, businessData);
  const menu = businessData.menu;
  const settings = menu?.settings || { showPriceSymbol: false, enableFilters: true };

  // Build menu data
  const { menuDataCode, dietaryLegendCode, badgeLegendCode, allergenLegendCode } = buildMenuDataCode(menu);

  // Get hero image
  const heroImage = businessData.images?.hero?.[0] || businessData.heroImage || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80';

  return `/**
 * Menu Page - ${businessData.name}
 * Style: Elegant List (Fine Dining)
 *
 * Research-backed best practices:
 * - Pricing psychology: No $ symbol (Cornell study)
 * - Luxurious spacing reduces rush, increases spend
 * - Serif typography conveys sophistication
 * - Minimal imagery lets food speak for itself
 * - 48px tap targets for accessibility
 *
 * Generated by Launchpad Engine v2
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Star, Sparkles, ChefHat, Leaf, Flame, WheatOff, Filter, X, Search, ChevronUp, ChevronDown, Check, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '../components/CartProvider';
import { usePageContent } from '../components/ContentProvider';

// Fallback image for broken images
const FALLBACK_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50"%3E%3Crect fill="%23f3f4f6" width="50" height="50"/%3E%3C/svg%3E';

// Toast notification component
const Toast = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div style={styles.toast} role="alert" aria-live="polite">
      <Check size={18} style={{ color: '#22C55E' }} />
      <span>{message}</span>
    </div>
  );
};

// Dietary icons mapping with accessibility
const DietaryIcon = ({ type, size = 14 }) => {
  const iconData = {
    'vegetarian': { icon: <Leaf size={size} style={{ color: '#22C55E' }} aria-hidden="true" />, label: 'Vegetarian' },
    'vegan': { icon: <Leaf size={size} style={{ color: '#16A34A' }} aria-hidden="true" />, label: 'Vegan' },
    'gluten-free': { icon: <WheatOff size={size} style={{ color: '#B8860B' }} aria-hidden="true" />, label: 'Gluten-Free' },
    'spicy': { icon: <Flame size={size} style={{ color: '#DC2626' }} aria-hidden="true" />, label: 'Spicy' }
  };
  const data = iconData[type];
  if (!data) return null;
  return (
    <span title={data.label} aria-label={data.label} role="img" style={{ marginLeft: '8px' }}>
      {data.icon}
    </span>
  );
};

// Badge component - subtle for elegant style
const Badge = ({ type }) => {
  const badges = {
    'popular': { label: '★ Popular' },
    'new': { label: '✦ New' },
    'chef-pick': { label: "◆ Chef's Selection" }
  };
  const badge = badges[type];
  if (!badge) return null;
  return (
    <span style={styles.elegantBadge} aria-label={badge.label}>
      {badge.label}
    </span>
  );
};

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [activeFilters, setActiveFilters] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const { cart, addToCart: contextAddToCart, cartItemCount } = useCart();
  const [toast, setToast] = useState({ visible: false, message: '' });
  const categoryRefs = useRef({});
  const moreDropdownRef = useRef(null);

  // Max visible categories before "More" dropdown
  const MAX_VISIBLE_CATEGORIES = 6;

  // Menu data (fallback)
  const fallbackCategories = [
    ${menuDataCode}
  ];

  // ContentProvider overlay for admin-edited text
  const menuContent = usePageContent('menu');

  const menuCategories = useMemo(() => {
    let cats = fallbackCategories;
    if (menuContent?.categories) {
      const contentCats = menuContent.categories;
      cats = cats.map(cat => {
        const cc = contentCats.find(c => c.name === cat.name);
        if (!cc?.items) return cat;
        return { ...cat, items: cat.items.map(item => {
          const ci = cc.items.find(i => i.name === item.name);
          if (!ci) return item;
          return { ...item, ...(ci.name && { name: ci.name }), ...(ci.description && { description: ci.description }), ...(ci.price && { price: ci.price }), ...(ci.image && { image: ci.image }) };
        })};
      });
    }
    return cats;
  }, [menuContent]);

  // Chef's Selections (featured items for elegant presentation)
  const chefSelections = menuCategories
    .flatMap(cat => cat.items)
    .filter(item => item.badges?.includes('chef-pick'))
    .slice(0, 3);

  // Split categories into visible and overflow
  const visibleCategories = menuCategories.slice(0, MAX_VISIBLE_CATEGORIES);
  const overflowCategories = menuCategories.slice(MAX_VISIBLE_CATEGORIES);
  const hasOverflow = overflowCategories.length > 0;

  // Legends
  const dietaryLegend = {
    ${dietaryLegendCode}
  };

  const allergenLegend = {
    ${allergenLegendCode}
  };

  // Add to cart function (shared via CartProvider)
  const addToCart = useCallback((item) => {
    contextAddToCart(item);
    setToast({ visible: true, message: \`Added \${item.name} to your order\` });
  }, [contextAddToCart]);

  // Close toast
  const closeToast = useCallback(() => {
    setToast({ visible: false, message: '' });
  }, []);

  // Filter items
  const filterItems = (items) => {
    let filtered = items;
    if (activeFilters.length > 0) {
      filtered = filtered.filter(item =>
        activeFilters.every(filter => item.dietary?.includes(filter))
      );
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      );
    }
    return filtered;
  };

  const toggleFilter = (filter) => {
    setActiveFilters(prev =>
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  // Back to top visibility
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close "More" dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(e.target)) {
        setShowMoreCategories(false);
      }
    };
    if (showMoreCategories) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMoreCategories]);

  const scrollToCategory = (idx) => {
    setActiveCategory(idx);
    setShowMoreCategories(false);
    const element = categoryRefs.current[idx];
    if (element) {
      const y = element.getBoundingClientRect().top + window.pageYOffset - 120;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div style={styles.page}>
      {/* Toast Notification */}
      <Toast message={toast.message} isVisible={toast.visible} onClose={closeToast} />

      {/* Elegant Hero */}
      <section style={styles.hero}>
        <div style={styles.heroOverlay} />
        <img src="${heroImage}" alt="Menu" style={styles.heroImage} loading="eager" />
        <div style={styles.heroContent}>
          <div style={styles.ornament}>✦</div>
          <h1 style={styles.heroTitle}>The Menu</h1>
          <p style={styles.heroSubtitle}>${escapeQuotes(businessData.tagline || 'A culinary journey')}</p>
          <div style={styles.ornament}>✦</div>
        </div>
      </section>

      {/* Chef's Selections - Elegant Featured Section */}
      {chefSelections.length > 0 && (
        <section style={styles.chefSection}>
          <div style={styles.chefContainer}>
            <div style={styles.chefHeader}>
              <div style={styles.dividerLine} />
              <h2 style={styles.chefTitle}>CHEF'S SELECTIONS</h2>
              <div style={styles.dividerLine} />
            </div>
            <div style={styles.chefGrid}>
              {chefSelections.map((item, idx) => (
                <div key={idx} style={styles.chefCard}>
                  <span style={styles.chefItemBadge}>◆</span>
                  <h3 style={styles.chefItemName}>{item.name}</h3>
                  <p style={styles.chefItemDesc}>{item.description}</p>
                  <div style={styles.chefItemFooter}>
                    <span style={styles.chefItemPrice}>{item.price}</span>
                    <button
                      onClick={() => addToCart(item)}
                      style={styles.chefAddBtn}
                      aria-label={\`Add \${item.name} to order\`}
                    >
                      Add to Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Search & Filter */}
      <section style={styles.searchSection}>
        <div style={styles.searchContainer}>
          <div style={styles.searchInputWrapper}>
            <Search size={18} style={styles.searchIcon} aria-hidden="true" />
            <input
              type="search"
              placeholder="Search our menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
              aria-label="Search menu"
            />
          </div>
          ${settings.enableFilters !== false ? `<button
            onClick={() => setShowFilters(!showFilters)}
            style={styles.filterToggle}
            aria-expanded={showFilters}
          >
            <Filter size={16} /> Dietary
          </button>` : ''}
          {cartItemCount > 0 && (
            <Link to="/order" style={styles.cartButton} aria-label={\`Cart with \${cartItemCount} items\`}>
              <ShoppingBag size={18} />
              <span style={styles.cartBadge}>{cartItemCount}</span>
            </Link>
          )}
        </div>
        ${settings.enableFilters !== false ? `{showFilters && (
          <div style={styles.filterButtons}>
            {Object.entries(dietaryLegend).map(([key, val]) => (
              <button
                key={key}
                onClick={() => toggleFilter(key)}
                style={{
                  ...styles.filterBtn,
                  background: activeFilters.includes(key) ? '#1f2937' : 'transparent',
                  color: activeFilters.includes(key) ? '#fff' : '#1f2937'
                }}
                aria-pressed={activeFilters.includes(key)}
              >
                {val.label}
              </button>
            ))}
          </div>
        )}` : ''}
      </section>

      {/* Category Navigation */}
      <nav style={styles.categoryNav} aria-label="Menu categories">
        {visibleCategories.map((cat, idx) => (
          <button
            key={idx}
            onClick={() => scrollToCategory(idx)}
            style={{
              ...styles.categoryLink,
              color: activeCategory === idx ? '${colors.primary}' : '#6b7280',
              borderBottomColor: activeCategory === idx ? '${colors.primary}' : 'transparent'
            }}
          >
            {cat.name}
          </button>
        ))}
        {hasOverflow && (
          <div style={styles.moreDropdownWrapper} ref={moreDropdownRef}>
            <button
              onClick={() => setShowMoreCategories(!showMoreCategories)}
              style={{
                ...styles.categoryLink,
                ...styles.moreButton,
                color: activeCategory >= MAX_VISIBLE_CATEGORIES ? '${colors.primary}' : '#6b7280',
                borderBottomColor: activeCategory >= MAX_VISIBLE_CATEGORIES ? '${colors.primary}' : 'transparent'
              }}
              aria-expanded={showMoreCategories}
              aria-haspopup="true"
            >
              +{overflowCategories.length} More
              <ChevronDown size={14} style={{ marginLeft: '4px', transform: showMoreCategories ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
            </button>
            {showMoreCategories && (
              <div style={styles.moreDropdown}>
                {overflowCategories.map((cat, idx) => {
                  const actualIdx = MAX_VISIBLE_CATEGORIES + idx;
                  return (
                    <button
                      key={actualIdx}
                      onClick={() => scrollToCategory(actualIdx)}
                      style={{
                        ...styles.dropdownItem,
                        color: activeCategory === actualIdx ? '${colors.primary}' : '#1f2937',
                        background: activeCategory === actualIdx ? '${colors.primary}10' : 'transparent'
                      }}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Menu Content */}
      <main style={styles.main}>
        {menuCategories.map((category, catIdx) => {
          const filteredItems = filterItems(category.items);
          if (filteredItems.length === 0) return null;

          return (
            <section
              key={catIdx}
              ref={el => categoryRefs.current[catIdx] = el}
              style={styles.menuSection}
            >
              {/* Ornamental Category Header */}
              <div style={styles.categoryHeader}>
                <div style={styles.dividerLine} />
                <h2 style={styles.categoryTitle}>{category.name.toUpperCase()}</h2>
                <div style={styles.dividerLine} />
              </div>
              {category.description && (
                <p style={styles.categoryDesc}>{category.description}</p>
              )}

              {/* Menu Items - Elegant List */}
              <div style={styles.menuItems}>
                {filteredItems.map((item, idx) => (
                  <article key={idx} style={styles.menuItem}>
                    <div style={styles.itemHeader}>
                      <h3 style={styles.itemName}>
                        {item.name}
                        {item.dietary?.map((d, i) => (
                          <DietaryIcon key={i} type={d} size={12} />
                        ))}
                      </h3>
                      <span style={styles.leaderLine} aria-hidden="true" />
                      <span style={styles.itemPrice}>{item.price}</span>
                    </div>
                    <div style={styles.itemDetails}>
                      <p style={styles.itemDesc}>{item.description}</p>
                      {item.badges?.map((badge, i) => (
                        <Badge key={i} type={badge} />
                      ))}
                    </div>
                    <button
                      style={styles.addButton}
                      onClick={() => addToCart(item)}
                      aria-label={\`Add \${item.name} to order\`}
                    >
                      <Plus size={14} aria-hidden="true" /> Add to Order
                    </button>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </main>

      {/* Allergen Footer */}
      <footer style={styles.allergenFooter}>
        <div style={styles.allergenContainer}>
          <div style={styles.footerOrnament}>❧</div>
          <h3 style={styles.allergenTitle}>Dietary Information</h3>
          <div style={styles.legendItems}>
            {Object.entries(dietaryLegend).map(([key, val]) => (
              <span key={key} style={styles.legendItem}>
                <DietaryIcon type={key} size={12} /> {val.label}
              </span>
            ))}
          </div>
          <p style={styles.allergenText}>
            Please inform your server of any allergies or dietary restrictions.
          </p>
        </div>
      </footer>

      {/* Back to Top */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={styles.backToTop}
          aria-label="Back to top"
        >
          <ChevronUp size={24} />
        </button>
      )}
    </div>
  );
}

const styles = {
  page: {
    background: '#fffef9',
    minHeight: '100vh',
    fontFamily: "'Playfair Display', 'Cormorant', Georgia, serif"
  },
  toast: {
    position: 'fixed',
    bottom: '100px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '12px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    zIndex: 100
  },
  hero: {
    position: 'relative',
    height: '50vh',
    minHeight: '400px',
    overflow: 'hidden'
  },
  heroImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.6))',
    zIndex: 1
  },
  heroContent: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    zIndex: 2,
    padding: '20px'
  },
  ornament: {
    fontSize: '1.5rem',
    color: '${colors.primary}',
    margin: '8px 0',
    letterSpacing: '8px'
  },
  heroTitle: {
    fontSize: 'clamp(2.5rem, 8vw, 5rem)',
    fontWeight: '400',
    color: '#fff',
    letterSpacing: '12px',
    textTransform: 'uppercase',
    marginBottom: '8px'
  },
  heroSubtitle: {
    fontSize: '1.1rem',
    color: 'rgba(255,255,255,0.85)',
    fontStyle: 'italic',
    letterSpacing: '2px'
  },
  searchSection: {
    maxWidth: '700px',
    margin: '0 auto',
    padding: '24px 20px'
  },
  searchContainer: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  },
  searchInputWrapper: {
    flex: 1,
    position: 'relative'
  },
  searchIcon: {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af'
  },
  searchInput: {
    width: '100%',
    padding: '14px 16px 14px 44px',
    border: '1px solid #d4d4d4',
    borderRadius: '0',
    fontSize: '15px',
    fontFamily: 'inherit',
    outline: 'none',
    background: 'transparent'
  },
  filterToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '14px 20px',
    border: '1px solid #d4d4d4',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: 'inherit',
    minHeight: '48px'
  },
  filterButtons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '16px',
    justifyContent: 'center'
  },
  filterBtn: {
    padding: '10px 20px',
    border: '1px solid #1f2937',
    borderRadius: '0',
    cursor: 'pointer',
    fontSize: '13px',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
    minHeight: '40px'
  },
  categoryNav: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px 24px',
    padding: '16px 20px',
    borderTop: '1px solid #e5e5e5',
    borderBottom: '1px solid #e5e5e5',
    position: 'sticky',
    top: '72px',
    background: '#fffef9',
    zIndex: 40
  },
  categoryLink: {
    padding: '8px 0',
    border: 'none',
    borderBottom: '2px solid transparent',
    background: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    fontFamily: 'inherit',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    transition: 'all 0.2s',
    minHeight: '40px',
    whiteSpace: 'nowrap'
  },
  moreDropdownWrapper: {
    position: 'relative'
  },
  moreButton: {
    display: 'inline-flex',
    alignItems: 'center'
  },
  moreDropdown: {
    position: 'absolute',
    top: 'calc(100% + 12px)',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#fffef9',
    border: '1px solid #e5e5e5',
    padding: '12px 0',
    minWidth: '180px',
    maxHeight: '280px',
    overflowY: 'auto',
    zIndex: 50,
    boxShadow: '0 8px 30px rgba(0,0,0,0.1)'
  },
  dropdownItem: {
    display: 'block',
    width: '100%',
    padding: '10px 20px',
    border: 'none',
    background: 'transparent',
    textAlign: 'center',
    cursor: 'pointer',
    fontSize: '12px',
    fontFamily: 'inherit',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    transition: 'background 0.15s'
  },
  main: {
    maxWidth: '700px',
    margin: '0 auto',
    padding: '48px 20px 80px'
  },
  menuSection: {
    marginBottom: '64px'
  },
  categoryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    marginBottom: '12px'
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: '#d4d4d4'
  },
  categoryTitle: {
    fontSize: '1.5rem',
    fontWeight: '400',
    color: '#1f2937',
    letterSpacing: '6px',
    textAlign: 'center'
  },
  categoryDesc: {
    textAlign: 'center',
    color: '#6b7280',
    fontStyle: 'italic',
    marginBottom: '32px',
    fontSize: '0.95rem'
  },
  menuItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  menuItem: {
    padding: '0'
  },
  itemHeader: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px'
  },
  itemName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1f2937',
    whiteSpace: 'nowrap'
  },
  leaderLine: {
    flex: 1,
    borderBottom: '1px dotted #d4d4d4',
    marginBottom: '4px'
  },
  itemPrice: {
    fontSize: '1.1rem',
    fontWeight: '500',
    color: '#1f2937',
    whiteSpace: 'nowrap'
  },
  itemDesc: {
    color: '#6b7280',
    fontStyle: 'italic',
    fontSize: '0.9rem',
    marginTop: '4px',
    lineHeight: 1.6
  },
  elegantBadge: {
    display: 'inline-block',
    marginTop: '6px',
    fontSize: '11px',
    letterSpacing: '2px',
    color: '${colors.primary}',
    textTransform: 'uppercase'
  },
  itemDetails: {
    marginTop: '4px'
  },
  addButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 20px',
    marginTop: '12px',
    background: 'transparent',
    color: '${colors.primary}',
    border: '1px solid ${colors.primary}',
    borderRadius: '0',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    fontFamily: 'inherit',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    transition: 'all 0.2s',
    minHeight: '44px'
  },
  cartButton: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
    background: 'transparent',
    color: '#1f2937',
    border: '1px solid #d4d4d4',
    borderRadius: '0',
    cursor: 'pointer',
    fontFamily: 'inherit'
  },
  cartBadge: {
    position: 'absolute',
    top: '-6px',
    right: '-6px',
    background: '${colors.primary}',
    color: '#fff',
    fontSize: '10px',
    fontWeight: '600',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  allergenFooter: {
    textAlign: 'center',
    padding: '48px 20px',
    borderTop: '1px solid #e5e5e5'
  },
  allergenContainer: {
    maxWidth: '600px',
    margin: '0 auto'
  },
  footerOrnament: {
    fontSize: '2rem',
    color: '${colors.primary}',
    marginBottom: '16px'
  },
  allergenTitle: {
    fontSize: '1rem',
    fontWeight: '400',
    color: '#1f2937',
    letterSpacing: '4px',
    textTransform: 'uppercase',
    marginBottom: '16px'
  },
  legendItems: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '20px',
    marginBottom: '16px'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.875rem',
    color: '#6b7280'
  },
  allergenText: {
    fontSize: '0.85rem',
    color: '#9ca3af',
    fontStyle: 'italic'
  },
  backToTop: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: '${colors.primary}',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 50
  },

  /* Chef's Selections - Elegant Featured Section */
  chefSection: {
    background: '#faf9f7',
    padding: '60px 20px',
    borderBottom: '1px solid #e5e7eb'
  },
  chefContainer: {
    maxWidth: '900px',
    margin: '0 auto'
  },
  chefHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '24px',
    marginBottom: '40px'
  },
  chefTitle: {
    fontFamily: "'Playfair Display', 'Cormorant', Georgia, serif",
    fontSize: '1.25rem',
    fontWeight: '400',
    letterSpacing: '0.2em',
    color: '#1f2937',
    whiteSpace: 'nowrap'
  },
  chefGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '32px'
  },
  chefCard: {
    textAlign: 'center',
    padding: '24px'
  },
  chefItemBadge: {
    display: 'block',
    fontSize: '1.5rem',
    color: '${colors.primary}',
    marginBottom: '12px'
  },
  chefItemName: {
    fontFamily: "'Playfair Display', 'Cormorant', Georgia, serif",
    fontSize: '1.25rem',
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: '8px'
  },
  chefItemDesc: {
    fontSize: '0.9rem',
    color: '#6b7280',
    lineHeight: 1.6,
    marginBottom: '16px'
  },
  chefItemFooter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px'
  },
  chefItemPrice: {
    fontFamily: "'Playfair Display', 'Cormorant', Georgia, serif",
    fontSize: '1.1rem',
    fontWeight: '500',
    color: '${colors.primary}'
  },
  chefAddBtn: {
    padding: '12px 24px',
    background: 'transparent',
    color: '${colors.primary}',
    border: '1px solid ${colors.primary}',
    borderRadius: '0',
    fontSize: '13px',
    fontWeight: '500',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'all 0.2s',
    minHeight: '48px'
  }
};
`;
}

// ============================================
// STYLE C: COMPACT TABLE (Efficient, Dense)
// ============================================

/**
 * Compact Table Menu Style
 *
 * Best for: Delis, diners, large menus (50+ items), takeout
 * Layout: Table rows with alternating backgrounds
 * Features: Accordion categories, inline filters, sortable columns
 * Typography: Efficient sans-serif
 */
function generateCompactTableMenu(industryId, variant, moodSliders, businessData, pageType) {
  const colors = getColors(moodSliders, businessData);
  const menu = businessData.menu;
  const settings = menu?.settings || { showPriceSymbol: false, enableFilters: true };

  // Build menu data
  const { menuDataCode, dietaryLegendCode, badgeLegendCode, allergenLegendCode } = buildMenuDataCode(menu);

  // Get hero image
  const heroImage = businessData.images?.hero?.[0] || businessData.heroImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80';

  return `/**
 * Menu Page - ${businessData.name}
 * Style: Compact Table (Efficient)
 *
 * Research-backed best practices:
 * - Pricing psychology: No $ symbol
 * - Dense layout for quick scanning
 * - Sortable columns for efficiency
 * - Accordion categories reduce overwhelm
 * - 48px tap targets for accessibility
 *
 * Generated by Launchpad Engine v2
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Star, Sparkles, ChefHat, Leaf, Flame, WheatOff, Filter, X, Search, ChevronUp, ChevronDown, Plus, Check, ShoppingBag } from 'lucide-react';
import { useCart } from '../components/CartProvider';
import { usePageContent } from '../components/ContentProvider';

// Fallback image
const FALLBACK_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"%3E%3Crect fill="%23f3f4f6" width="40" height="40"/%3E%3C/svg%3E';

// Toast notification
const Toast = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div style={styles.toast} role="alert" aria-live="polite">
      <Check size={18} style={{ color: '#22C55E' }} />
      <span>{message}</span>
    </div>
  );
};

// Dietary icon with tooltip
const DietaryIcon = ({ type }) => {
  const icons = {
    'vegetarian': { symbol: 'V', color: '#22C55E', label: 'Vegetarian' },
    'vegan': { symbol: 'VG', color: '#16A34A', label: 'Vegan' },
    'gluten-free': { symbol: 'GF', color: '#EAB308', label: 'Gluten-Free' },
    'spicy': { symbol: '🌶', color: '#EF4444', label: 'Spicy' }
  };
  const icon = icons[type];
  if (!icon) return null;
  return (
    <span
      title={icon.label}
      aria-label={icon.label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '22px',
        height: '22px',
        borderRadius: '4px',
        background: icon.color + '20',
        color: icon.color,
        fontSize: '10px',
        fontWeight: '700',
        marginRight: '4px'
      }}
    >
      {icon.symbol}
    </span>
  );
};

// Badge component
const Badge = ({ type }) => {
  const badges = {
    'popular': { label: '⭐', title: 'Popular' },
    'new': { label: '✨', title: 'New' },
    'chef-pick': { label: '👨‍🍳', title: "Chef's Pick" }
  };
  const badge = badges[type];
  if (!badge) return null;
  return <span title={badge.title} style={{ marginRight: '4px' }}>{badge.label}</span>;
};

// Menu Image with fallback
const MenuImage = ({ src, alt }) => {
  const [imgSrc, setImgSrc] = useState(src);
  useEffect(() => { if (src) setImgSrc(src); }, [src]);
  return (
    <img
      src={imgSrc}
      alt={alt}
      style={styles.thumbnail}
      loading="lazy"
      onError={() => setImgSrc(FALLBACK_IMAGE)}
    />
  );
};

export default function MenuPage() {
  const [expandedCategories, setExpandedCategories] = useState([0]); // First category expanded by default
  const [activeFilters, setActiveFilters] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default'); // 'default', 'price-asc', 'price-desc', 'name'
  const { cart, addToCart: contextAddToCart, cartItemCount } = useCart();
  const [toast, setToast] = useState({ visible: false, message: '' });
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Menu data (fallback)
  const fallbackCategories = [
    ${menuDataCode}
  ];

  // ContentProvider overlay for admin-edited text + images
  const menuContent = usePageContent('menu');

  const menuCategories = useMemo(() => {
    let cats = fallbackCategories;
    if (menuContent?.categories) {
      const contentCats = menuContent.categories;
      cats = cats.map(cat => {
        const cc = contentCats.find(c => c.name === cat.name);
        if (!cc?.items) return cat;
        return { ...cat, items: cat.items.map(item => {
          const ci = cc.items.find(i => i.name === item.name);
          if (!ci) return item;
          return { ...item, ...(ci.name && { name: ci.name }), ...(ci.description && { description: ci.description }), ...(ci.price && { price: ci.price }), ...(ci.image && { image: ci.image }) };
        })};
      });
    }
    return cats;
  }, [menuContent]);

  // Legends
  const dietaryLegend = {
    ${dietaryLegendCode}
  };

  const allergenLegend = {
    ${allergenLegendCode}
  };

  const totalItems = menuCategories.reduce((sum, cat) => sum + cat.items.length, 0);

  // Toggle category expansion
  const toggleCategory = (idx) => {
    setExpandedCategories(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  // Filter and sort items
  const getFilteredItems = (items) => {
    let filtered = items;

    // Apply dietary filters
    if (activeFilters.length > 0) {
      filtered = filtered.filter(item =>
        activeFilters.every(filter => item.dietary?.includes(filter))
      );
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    if (sortBy === 'price-asc') {
      filtered = [...filtered].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortBy === 'price-desc') {
      filtered = [...filtered].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    } else if (sortBy === 'name') {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  };

  const toggleFilter = (filter) => {
    setActiveFilters(prev =>
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  const addToCart = useCallback((item) => {
    contextAddToCart(item);
    setToast({ visible: true, message: \`Added \${item.name} to cart\` });
  }, [contextAddToCart]);

  // Back to top
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={styles.page}>
      <Toast message={toast.message} isVisible={toast.visible} onClose={() => setToast({ visible: false, message: '' })} />

      {/* Compact Hero */}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Menu</h1>
        <p style={styles.heroSubtitle}>{totalItems} items</p>
      </section>

      {/* Search, Filter & Sort Bar */}
      <section style={styles.toolbar}>
        <div style={styles.toolbarInner}>
          {/* Search */}
          <div style={styles.searchWrapper}>
            <Search size={18} style={styles.searchIcon} />
            <input
              type="search"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
              aria-label="Search menu"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={styles.clearBtn} aria-label="Clear">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filters */}
          <div style={styles.filterGroup}>
            {Object.entries(dietaryLegend).map(([key, val]) => (
              <button
                key={key}
                onClick={() => toggleFilter(key)}
                style={{
                  ...styles.filterChip,
                  background: activeFilters.includes(key) ? val.color : '#f3f4f6',
                  color: activeFilters.includes(key) ? '#fff' : '#374151'
                }}
                aria-pressed={activeFilters.includes(key)}
              >
                {val.label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={styles.sortSelect}
            aria-label="Sort by"
          >
            <option value="default">Default Order</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name A-Z</option>
          </select>

          {/* Cart */}
          {cartItemCount > 0 && (
            <Link to="/order" style={styles.cartBtn} aria-label={\`Cart: \${cartItemCount} items\`}>
              <ShoppingBag size={18} />
              <span style={styles.cartCount}>{cartItemCount}</span>
            </Link>
          )}
        </div>
      </section>

      {/* Menu Categories */}
      <main style={styles.main}>
        {menuCategories.map((category, catIdx) => {
          const filteredItems = getFilteredItems(category.items);
          const isExpanded = expandedCategories.includes(catIdx);

          return (
            <section key={catIdx} style={styles.categorySection}>
              {/* Accordion Header */}
              <button
                onClick={() => toggleCategory(catIdx)}
                style={styles.categoryHeader}
                aria-expanded={isExpanded}
              >
                <span style={styles.categoryName}>
                  {category.name}
                  <span style={styles.itemCount}>({filteredItems.length})</span>
                </span>
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>

              {/* Table Content */}
              {isExpanded && filteredItems.length > 0 && (
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Item</th>
                        <th style={{ ...styles.th, width: '40%' }}>Description</th>
                        <th style={{ ...styles.th, width: '80px' }}>Diet</th>
                        <th style={{ ...styles.th, width: '70px', textAlign: 'right' }}>Price</th>
                        <th style={{ ...styles.th, width: '60px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item, idx) => (
                        <tr key={idx} style={{ background: idx % 2 === 0 ? '#f9fafb' : '#fff' }}>
                          <td style={styles.td}>
                            <div style={styles.itemCell}>
                              {item.image && <MenuImage src={item.image} alt={item.name} />}
                              <div>
                                <span style={styles.itemName}>
                                  {item.badges?.map((b, i) => <Badge key={i} type={b} />)}
                                  {item.name}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td style={{ ...styles.td, color: '#6b7280', fontSize: '13px' }}>
                            {item.description}
                          </td>
                          <td style={styles.td}>
                            {item.dietary?.map((d, i) => <DietaryIcon key={i} type={d} />)}
                          </td>
                          <td style={{ ...styles.td, textAlign: 'right', fontWeight: '600' }}>
                            {item.price}
                          </td>
                          <td style={styles.td}>
                            <button
                              onClick={() => addToCart(item)}
                              style={styles.addBtn}
                              aria-label={\`Add \${item.name}\`}
                            >
                              <Plus size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {isExpanded && filteredItems.length === 0 && (
                <p style={styles.noItems}>No items match your filters.</p>
              )}
            </section>
          );
        })}
      </main>

      {/* Allergen Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <h3 style={styles.footerTitle}>Dietary Key</h3>
          <div style={styles.legendRow}>
            {Object.entries(dietaryLegend).map(([key, val]) => (
              <span key={key} style={styles.legendItem}>
                <DietaryIcon type={key} /> {val.label}
              </span>
            ))}
          </div>
          <p style={styles.footerNote}>Please inform staff of any allergies.</p>
        </div>
      </footer>

      {/* Back to Top */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={styles.backToTop}
          aria-label="Back to top"
        >
          <ChevronUp size={24} />
        </button>
      )}
    </div>
  );
}

const styles = {
  page: {
    background: '#fff',
    minHeight: '100vh',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  },
  toast: {
    position: 'fixed',
    bottom: '100px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    zIndex: 100,
    fontSize: '14px'
  },
  hero: {
    background: '${colors.primary}',
    padding: '24px 20px',
    textAlign: 'center'
  },
  heroTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '4px'
  },
  heroSubtitle: {
    fontSize: '0.875rem',
    color: 'rgba(255,255,255,0.8)'
  },
  toolbar: {
    position: 'sticky',
    top: '72px',
    background: '#fff',
    borderBottom: '1px solid #e5e7eb',
    zIndex: 40,
    padding: '12px 0'
  },
  toolbarInner: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
  },
  searchWrapper: {
    position: 'relative',
    minWidth: '200px',
    flex: '1'
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af'
  },
  searchInput: {
    width: '100%',
    padding: '10px 36px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none'
  },
  clearBtn: {
    position: 'absolute',
    right: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#9ca3af',
    padding: '4px'
  },
  filterGroup: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap'
  },
  filterChip: {
    padding: '8px 12px',
    border: 'none',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    minHeight: '36px'
  },
  sortSelect: {
    padding: '10px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '13px',
    outline: 'none',
    cursor: 'pointer',
    minHeight: '40px'
  },
  cartBtn: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
    background: '${colors.primary}',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  cartCount: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    width: '18px',
    height: '18px',
    background: '#EF4444',
    color: '#fff',
    borderRadius: '50%',
    fontSize: '10px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '16px'
  },
  categorySection: {
    marginBottom: '8px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  categoryHeader: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    background: '#f9fafb',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937',
    minHeight: '56px'
  },
  categoryName: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  itemCount: {
    fontSize: '13px',
    fontWeight: '400',
    color: '#6b7280'
  },
  tableWrapper: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    textAlign: 'left',
    padding: '12px 16px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '1px solid #e5e7eb'
  },
  td: {
    padding: '12px 16px',
    borderBottom: '1px solid #f3f4f6',
    verticalAlign: 'middle'
  },
  itemCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  thumbnail: {
    width: '40px',
    height: '40px',
    borderRadius: '6px',
    objectFit: 'cover'
  },
  itemName: {
    fontWeight: '500',
    color: '#1f2937',
    fontSize: '14px'
  },
  addBtn: {
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '${colors.primary}',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  noItems: {
    padding: '24px',
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '14px'
  },
  footer: {
    background: '#f9fafb',
    padding: '32px 16px',
    marginTop: '24px',
    borderTop: '1px solid #e5e7eb'
  },
  footerInner: {
    maxWidth: '800px',
    margin: '0 auto',
    textAlign: 'center'
  },
  footerTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '12px'
  },
  legendRow: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '12px'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#6b7280'
  },
  footerNote: {
    fontSize: '12px',
    color: '#9ca3af'
  },
  backToTop: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: '${colors.primary}',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 50
  }
};
`;
}

// ============================================
// STYLE D: STORYTELLING CARDS (Experience-Focused)
// ============================================

/**
 * Storytelling Cards Menu Style
 *
 * Best for: Farm-to-table, craft coffee, artisan bakeries
 * Layout: Large feature cards (500px+ height)
 * Features: Chef's notes, origin stories, horizontal category preview
 * Typography: Editorial/magazine style
 */
function generateStorytellingMenu(industryId, variant, moodSliders, businessData, pageType) {
  const colors = getColors(moodSliders, businessData);
  const menu = businessData.menu;
  const settings = menu?.settings || { showPriceSymbol: false, enableFilters: true };

  // Build menu data
  const { menuDataCode, dietaryLegendCode, badgeLegendCode, allergenLegendCode } = buildMenuDataCode(menu);

  // Get hero image
  const heroImage = businessData.images?.hero?.[0] || businessData.heroImage || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1920&q=80';

  return `/**
 * Menu Page - ${businessData.name}
 * Style: Storytelling Cards (Experience-Focused)
 *
 * Research-backed best practices:
 * - Pricing psychology: No $ symbol
 * - Stories create emotional connection
 * - Large imagery increases appetite appeal
 * - Chef's notes add credibility (+trust)
 * - 48px tap targets for accessibility
 *
 * Generated by Launchpad Engine v2
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Star, Sparkles, ChefHat, Leaf, Flame, WheatOff, Filter, X, Search, ChevronUp, ChevronDown, ChevronRight, Plus, Check, ShoppingBag } from 'lucide-react';
import { useCart } from '../components/CartProvider';
import { usePageContent } from '../components/ContentProvider';

// Fallback image
const FALLBACK_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="system-ui" font-size="16" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';

// Toast notification
const Toast = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div style={styles.toast} role="alert" aria-live="polite">
      <Check size={18} style={{ color: '#22C55E' }} />
      <span>{message}</span>
    </div>
  );
};

// Dietary Icon
const DietaryIcon = ({ type, size = 16 }) => {
  const icons = {
    'vegetarian': { icon: <Leaf size={size} style={{ color: '#22C55E' }} />, label: 'Vegetarian' },
    'vegan': { icon: <Leaf size={size} style={{ color: '#16A34A' }} />, label: 'Vegan' },
    'gluten-free': { icon: <WheatOff size={size} style={{ color: '#EAB308' }} />, label: 'Gluten-Free' },
    'spicy': { icon: <Flame size={size} style={{ color: '#EF4444' }} />, label: 'Spicy' }
  };
  const data = icons[type];
  if (!data) return null;
  return <span title={data.label} aria-label={data.label}>{data.icon}</span>;
};

// Badge Component
const Badge = ({ type }) => {
  const badges = {
    'popular': { icon: <Star size={14} />, label: 'Popular', bg: '#FEF3C7', color: '#D97706' },
    'new': { icon: <Sparkles size={14} />, label: 'New', bg: '#EDE9FE', color: '#7C3AED' },
    'chef-pick': { icon: <ChefHat size={14} />, label: "Chef's Pick", bg: '#D1FAE5', color: '#059669' }
  };
  const badge = badges[type];
  if (!badge) return null;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '13px',
      fontWeight: '600',
      background: badge.bg,
      color: badge.color
    }}>
      {badge.icon} {badge.label}
    </span>
  );
};

// Menu Image with fallback
const MenuImage = ({ src, alt, style }) => {
  const [imgSrc, setImgSrc] = useState(src || FALLBACK_IMAGE);
  useEffect(() => { if (src) setImgSrc(src); }, [src]);
  return (
    <img
      src={imgSrc}
      alt={alt}
      style={style}
      loading="lazy"
      onError={() => setImgSrc(FALLBACK_IMAGE)}
    />
  );
};

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [activeFilters, setActiveFilters] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { cart, addToCart: contextAddToCart, cartItemCount } = useCart();
  const [toast, setToast] = useState({ visible: false, message: '' });
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const categoryRefs = useRef({});
  const moreDropdownRef = useRef(null);

  // Max visible categories before "More" dropdown
  const MAX_VISIBLE_CATEGORIES = 6;

  // Menu data (fallback)
  const fallbackCategories = [
    ${menuDataCode}
  ];

  // ContentProvider overlay for admin-edited text + images
  const menuContent = usePageContent('menu');

  const menuCategories = useMemo(() => {
    let cats = fallbackCategories;
    if (menuContent?.categories) {
      const contentCats = menuContent.categories;
      cats = cats.map(cat => {
        const cc = contentCats.find(c => c.name === cat.name);
        if (!cc?.items) return cat;
        return { ...cat, items: cat.items.map(item => {
          const ci = cc.items.find(i => i.name === item.name);
          if (!ci) return item;
          return { ...item, ...(ci.name && { name: ci.name }), ...(ci.description && { description: ci.description }), ...(ci.price && { price: ci.price }), ...(ci.image && { image: ci.image }) };
        })};
      });
    }
    return cats;
  }, [menuContent]);

  // Split categories into visible and overflow
  const visibleCategories = menuCategories.slice(0, MAX_VISIBLE_CATEGORIES);
  const overflowCategories = menuCategories.slice(MAX_VISIBLE_CATEGORIES);
  const hasOverflow = overflowCategories.length > 0;

  // Legends
  const dietaryLegend = {
    ${dietaryLegendCode}
  };

  const allergenLegend = {
    ${allergenLegendCode}
  };

  // Filter items
  const filterItems = (items) => {
    let filtered = items;
    if (activeFilters.length > 0) {
      filtered = filtered.filter(item =>
        activeFilters.every(filter => item.dietary?.includes(filter))
      );
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      );
    }
    return filtered;
  };

  const toggleFilter = (filter) => {
    setActiveFilters(prev =>
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  const addToCart = useCallback((item) => {
    contextAddToCart(item);
    setToast({ visible: true, message: \`Added \${item.name} to cart\` });
  }, [contextAddToCart]);

  // Back to top
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close "More" dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(e.target)) {
        setShowMoreCategories(false);
      }
    };
    if (showMoreCategories) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMoreCategories]);

  const scrollToCategory = (idx) => {
    setActiveCategory(idx);
    setShowMoreCategories(false);
    const element = categoryRefs.current[idx];
    if (element) {
      const y = element.getBoundingClientRect().top + window.pageYOffset - 120;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div style={styles.page}>
      <Toast message={toast.message} isVisible={toast.visible} onClose={() => setToast({ visible: false, message: '' })} />

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroOverlay} />
        <img src="${heroImage}" alt="Menu" style={styles.heroImage} loading="eager" />
        <div style={styles.heroContent}>
          <span style={styles.heroLabel}>Our Menu</span>
          <h1 style={styles.heroTitle}>${escapeQuotes(businessData.name)}</h1>
          <p style={styles.heroSubtitle}>${escapeQuotes(businessData.tagline || 'Crafted with passion, served with love')}</p>
        </div>
      </section>

      {/* Category Navigation */}
      <section style={styles.categoryPreview}>
        <div style={styles.previewContainer}>
          {visibleCategories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => scrollToCategory(idx)}
              style={{
                ...styles.previewCard,
                borderColor: activeCategory === idx ? '${colors.primary}' : 'transparent',
                background: activeCategory === idx ? '${colors.primary}08' : 'transparent'
              }}
            >
              <span style={styles.previewName}>{cat.name}</span>
              <span style={styles.previewCount}>{cat.items.length} items</span>
            </button>
          ))}
          {hasOverflow && (
            <div style={styles.moreDropdownWrapper} ref={moreDropdownRef}>
              <button
                onClick={() => setShowMoreCategories(!showMoreCategories)}
                style={{
                  ...styles.previewCard,
                  ...styles.moreButton,
                  borderColor: activeCategory >= MAX_VISIBLE_CATEGORIES ? '${colors.primary}' : 'transparent',
                  background: activeCategory >= MAX_VISIBLE_CATEGORIES ? '${colors.primary}08' : 'transparent'
                }}
                aria-expanded={showMoreCategories}
                aria-haspopup="true"
              >
                <span style={styles.previewName}>+{overflowCategories.length} More</span>
                <ChevronDown size={16} style={{ color: '#9ca3af', transform: showMoreCategories ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
              </button>
              {showMoreCategories && (
                <div style={styles.moreDropdown}>
                  {overflowCategories.map((cat, idx) => {
                    const actualIdx = MAX_VISIBLE_CATEGORIES + idx;
                    return (
                      <button
                        key={actualIdx}
                        onClick={() => scrollToCategory(actualIdx)}
                        style={{
                          ...styles.dropdownItem,
                          background: activeCategory === actualIdx ? '${colors.primary}08' : 'transparent'
                        }}
                      >
                        <span>{cat.name}</span>
                        <span style={{ color: '#9ca3af', fontSize: '13px' }}>{cat.items.length} items</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Search & Filters */}
      <section style={styles.toolbar}>
        <div style={styles.toolbarInner}>
          <div style={styles.searchWrapper}>
            <Search size={18} style={styles.searchIcon} />
            <input
              type="search"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <div style={styles.filterRow}>
            {Object.entries(dietaryLegend).map(([key, val]) => (
              <button
                key={key}
                onClick={() => toggleFilter(key)}
                style={{
                  ...styles.filterChip,
                  background: activeFilters.includes(key) ? val.color : '#f9fafb',
                  color: activeFilters.includes(key) ? '#fff' : '#374151'
                }}
              >
                {val.label}
              </button>
            ))}
          </div>
          {cartItemCount > 0 && (
            <Link to="/order" style={styles.cartPill}>
              <ShoppingBag size={18} />
              <span>{cartItemCount} items</span>
            </Link>
          )}
        </div>
      </section>

      {/* Main Content - Storytelling Cards */}
      <main style={styles.main}>
        {menuCategories.map((category, catIdx) => {
          const filteredItems = filterItems(category.items);
          if (filteredItems.length === 0) return null;

          return (
            <section
              key={catIdx}
              ref={el => categoryRefs.current[catIdx] = el}
              style={styles.categorySection}
            >
              <div style={styles.categoryHeader}>
                <h2 style={styles.categoryTitle}>{category.name}</h2>
                {category.description && (
                  <p style={styles.categoryDesc}>{category.description}</p>
                )}
              </div>

              <div style={styles.cardsContainer}>
                {filteredItems.map((item, idx) => (
                  <article key={idx} style={styles.storyCard}>
                    {/* Large Hero Image */}
                    {item.image && (
                      <div style={styles.cardImageContainer}>
                        <MenuImage src={item.image} alt={item.name} style={styles.cardImage} />
                        {item.badges?.length > 0 && (
                          <div style={styles.cardBadges}>
                            {item.badges.map((badge, i) => (
                              <Badge key={i} type={badge} />
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div style={styles.cardContent}>
                      {/* Header */}
                      <div style={styles.cardHeader}>
                        <h3 style={styles.cardTitle}>{item.name}</h3>
                        <div style={styles.dietaryIcons}>
                          {item.dietary?.map((d, i) => (
                            <DietaryIcon key={i} type={d} size={18} />
                          ))}
                        </div>
                      </div>

                      {/* Description */}
                      <p style={styles.cardDescription}>{item.description}</p>

                      {/* Chef's Note (if available) */}
                      {item.chefNote && (
                        <div style={styles.chefNote}>
                          <ChefHat size={16} style={{ color: '${colors.primary}' }} />
                          <span>{item.chefNote}</span>
                        </div>
                      )}

                      {/* Origin Story (if available) */}
                      {item.origin && (
                        <div style={styles.originStory}>
                          <strong>Origin:</strong> {item.origin}
                        </div>
                      )}

                      {/* Pairs With (if available) */}
                      {item.pairsWith && item.pairsWith.length > 0 && (
                        <div style={styles.pairsWith}>
                          <strong>Pairs with:</strong> {item.pairsWith.join(', ')}
                        </div>
                      )}

                      {/* Footer - Price & Add */}
                      <div style={styles.cardFooter}>
                        <button
                          onClick={() => addToCart(item)}
                          style={styles.addToOrderBtn}
                        >
                          Add to Order
                        </button>
                        <span style={styles.cardPrice}>{item.price}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </main>

      {/* Allergen Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <h3 style={styles.footerTitle}>Dietary Information</h3>
          <div style={styles.legendGrid}>
            {Object.entries(dietaryLegend).map(([key, val]) => (
              <span key={key} style={styles.legendItem}>
                <DietaryIcon type={key} size={14} /> {val.label}
              </span>
            ))}
          </div>
          <p style={styles.footerNote}>
            Please inform our team of any allergies or dietary requirements.
          </p>
        </div>
      </footer>

      {/* Floating Cart Pill */}
      {cartItemCount > 0 && (
        <Link to="/order" style={styles.floatingCart}>
          <ShoppingBag size={20} />
          <span>View Order ({cartItemCount})</span>
        </Link>
      )}

      {/* Back to Top */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={styles.backToTop}
          aria-label="Back to top"
        >
          <ChevronUp size={24} />
        </button>
      )}
    </div>
  );
}

const styles = {
  page: {
    background: '#fafaf9',
    minHeight: '100vh',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  },
  toast: {
    position: 'fixed',
    bottom: '120px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '14px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    zIndex: 100,
    fontSize: '15px'
  },
  hero: {
    position: 'relative',
    height: '60vh',
    minHeight: '450px',
    overflow: 'hidden'
  },
  heroImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.5))',
    zIndex: 1
  },
  heroContent: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    zIndex: 2,
    padding: '20px'
  },
  heroLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '${colors.primary}',
    letterSpacing: '3px',
    textTransform: 'uppercase',
    marginBottom: '12px'
  },
  heroTitle: {
    fontSize: 'clamp(2.5rem, 7vw, 4.5rem)',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '16px',
    lineHeight: 1.1
  },
  heroSubtitle: {
    fontSize: '1.1rem',
    color: 'rgba(255,255,255,0.9)',
    maxWidth: '500px'
  },
  categoryPreview: {
    background: '#fff',
    borderBottom: '1px solid #e5e7eb',
    padding: '16px 0'
  },
  previewContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    padding: '0 16px',
    maxWidth: '900px',
    margin: '0 auto',
    alignItems: 'center',
    justifyContent: 'center'
  },
  previewCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 16px',
    background: '#f9fafb',
    border: '2px solid transparent',
    borderRadius: '10px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    minHeight: '48px',
    transition: 'all 0.2s'
  },
  previewName: {
    fontWeight: '600',
    color: '#1f2937',
    fontSize: '14px'
  },
  previewCount: {
    fontSize: '12px',
    color: '#6b7280'
  },
  moreDropdownWrapper: {
    position: 'relative'
  },
  moreButton: {
    display: 'inline-flex',
    alignItems: 'center'
  },
  moreDropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
    padding: '8px 0',
    minWidth: '220px',
    maxHeight: '300px',
    overflowY: 'auto',
    zIndex: 50
  },
  dropdownItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: '12px 16px',
    border: 'none',
    background: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#1f2937',
    transition: 'background 0.15s'
  },
  toolbar: {
    position: 'sticky',
    top: '72px',
    background: '#fff',
    borderBottom: '1px solid #e5e7eb',
    zIndex: 40,
    padding: '12px 0'
  },
  toolbarInner: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '0 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  searchWrapper: {
    position: 'relative'
  },
  searchIcon: {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af'
  },
  searchInput: {
    width: '100%',
    padding: '14px 16px 14px 48px',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '15px',
    outline: 'none'
  },
  filterRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  filterChip: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    minHeight: '36px'
  },
  cartPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: '${colors.primary}',
    color: '#fff',
    border: 'none',
    borderRadius: '24px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    alignSelf: 'flex-start'
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '32px 16px 100px'
  },
  categorySection: {
    marginBottom: '64px'
  },
  categoryHeader: {
    marginBottom: '24px'
  },
  categoryTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '8px'
  },
  categoryDesc: {
    color: '#6b7280',
    fontSize: '1rem',
    lineHeight: 1.6
  },
  cardsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '24px'
  },
  storyCard: {
    background: '#fff',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
  },
  cardImageContainer: {
    position: 'relative',
    height: '300px',
    overflow: 'hidden'
  },
  cardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  cardBadges: {
    position: 'absolute',
    top: '16px',
    left: '16px',
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  cardContent: {
    padding: '24px'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '12px'
  },
  cardTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1f2937',
    lineHeight: 1.2
  },
  dietaryIcons: {
    display: 'flex',
    gap: '6px'
  },
  cardDescription: {
    color: '#4b5563',
    fontSize: '1rem',
    lineHeight: 1.7,
    marginBottom: '16px'
  },
  chefNote: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '12px 16px',
    background: '#f0fdf4',
    borderRadius: '12px',
    marginBottom: '12px',
    fontSize: '14px',
    color: '#166534',
    fontStyle: 'italic'
  },
  originStory: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '8px'
  },
  pairsWith: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '16px'
  },
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '16px',
    borderTop: '1px solid #f3f4f6'
  },
  addToOrderBtn: {
    padding: '14px 28px',
    background: '${colors.primary}',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontWeight: '600',
    fontSize: '15px',
    cursor: 'pointer',
    minHeight: '48px'
  },
  cardPrice: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1f2937'
  },
  footer: {
    background: '#fff',
    padding: '48px 16px',
    borderTop: '1px solid #e5e7eb'
  },
  footerInner: {
    maxWidth: '600px',
    margin: '0 auto',
    textAlign: 'center'
  },
  footerTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '16px'
  },
  legendGrid: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '20px',
    marginBottom: '16px'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#6b7280'
  },
  footerNote: {
    fontSize: '13px',
    color: '#9ca3af'
  },
  floatingCart: {
    position: 'fixed',
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '16px 28px',
    background: '${colors.primary}',
    color: '#fff',
    borderRadius: '30px',
    fontWeight: '600',
    fontSize: '15px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    cursor: 'pointer',
    zIndex: 50
  },
  backToTop: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: '#fff',
    color: '${colors.primary}',
    border: '2px solid ${colors.primary}',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    zIndex: 45
  }
};
`;
}

/**
 * Generate Services Page - Industry-aware dispatcher
 * Routes to specialized generators for 10+ industries, falls back to generic for the rest
 */
function generateServicesPage(industryId, variant, moodSliders, businessData, pageType) {
  const colors = getColors(moodSliders, businessData);
  const overrides = buildStyleOverrides(moodSliders, colors);
  const bData = { ...businessData, industry: industryId };

  // Dispatch to specialized generators by industry
  if (['fitness-gym', 'yoga'].includes(industryId)) {
    const arch = detectFitnessArchetype(bData);
    return generateFitnessServices(arch, bData, colors, overrides);
  }
  if (['salon-spa', 'barbershop'].includes(industryId)) {
    const arch = detectGroomingArchetype(bData);
    return generateGroomingServices(arch, bData, colors, overrides);
  }
  if (['dental', 'healthcare'].includes(industryId)) {
    const arch = detectHealthcareArchetype(bData);
    return generateHealthcareServices(arch, bData, colors, overrides);
  }
  if (['law-firm', 'real-estate', 'accounting'].includes(industryId)) {
    const arch = detectProfessionalArchetype(bData);
    return generateProfessionalServices(arch, bData, colors, overrides);
  }
  if (['saas', 'ecommerce'].includes(industryId)) {
    const arch = detectTechnologyArchetype(bData);
    return generateTechnologyServices(arch, bData, colors, overrides);
  }
  if (['plumber', 'cleaning', 'auto-shop'].includes(industryId)) {
    const arch = detectHomeServicesArchetype(bData);
    return generateHomeServices(arch, bData, colors, overrides);
  }

  // Fallback: generic stub for remaining industries (school, etc.)
  return generateServicesPageFallback(industryId, variant, moodSliders, businessData, pageType);
}

/**
 * Generate Services Page - Fallback (original stub)
 */
function generateServicesPageFallback(industryId, variant, moodSliders, businessData, pageType) {
  const colors = getColors(moodSliders, businessData);
  const dt = getDesignTokens(moodSliders, businessData);
  const fixture = loadFixture(industryId);

  // Try to get services from fixture
  let servicesData = '';
  if (fixture?.pages?.home?.sections) {
    const featuresSection = fixture.pages.home.sections.find(s => s.type === 'features');
    if (featuresSection?.items) {
      servicesData = featuresSection.items.map(item =>
        `{ name: '${escapeQuotes(item.title)}', description: '${escapeQuotes(item.description)}', icon: '${item.icon || '✨'}' }`
      ).join(',\n    ');
    }
  }

  if (!servicesData) {
    servicesData = `{ name: 'Service One', description: 'Professional service tailored to your needs', icon: '✨' },
    { name: 'Service Two', description: 'Expert care and attention to detail', icon: '🎯' },
    { name: 'Service Three', description: 'Quality results you can count on', icon: '🚀' }`;
  }

  return `/**
 * Services Page - ${businessData.name}
 * Generated by Launchpad
 */

import React from 'react';
import { Link } from 'react-router-dom';
export default function ServicesPage() {
  const services = [
    ${servicesData}
  ];

  return (
    <div style={styles.page}>
      <main style={styles.main}>
        <section style={styles.hero}>
          <h1 style={styles.title}>Our Services</h1>
          <p style={styles.subtitle}>Professional solutions for your needs</p>
        </section>

        <section style={styles.servicesSection}>
          <div style={styles.servicesGrid}>
            {services.map((service, idx) => (
              <div key={idx} style={styles.serviceCard}>
                <div style={styles.serviceIcon}>{service.icon}</div>
                <h3 style={styles.serviceName}>{service.name}</h3>
                <p style={styles.serviceDesc}>{service.description}</p>
                <Link to="/contact" style={styles.serviceBtn}>Learn More</Link>
              </div>
            ))}
          </div>
        </section>

        <section style={styles.ctaSection}>
          <h2 style={styles.ctaTitle}>Ready to get started?</h2>
          <p style={styles.ctaText}>Contact us today for a consultation</p>
          <Link to="/contact" style={styles.ctaBtn}>Contact Us</Link>
        </section>
      </main>
    </div>
  );
}

const styles = {
  page: { background: '${dt.background}', fontFamily: "${dt.fontBody}" },
  main: { },
  hero: { textAlign: 'center', padding: '${dt.sectionPadding}', background: '${dt.surface}' },
  title: { fontSize: 'clamp(2rem, 5vw, 3rem)', fontFamily: "${dt.fontHeading}", fontWeight: '700', color: '${dt.text}', marginBottom: '12px', textTransform: '${dt.headlineStyle}' },
  subtitle: { fontSize: '1.1rem', color: '${dt.textMuted}' },
  servicesSection: { maxWidth: '1200px', margin: '0 auto', padding: '${dt.sectionPadding}' },
  servicesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '${dt.gap}' },
  serviceCard: { background: '${dt.cardBg}', border: '1px solid ${dt.border}', borderRadius: '${dt.borderRadius}', padding: '${dt.cardPadding}', textAlign: 'center', transition: 'all 0.2s', boxShadow: '${dt.shadow}' },
  serviceIcon: { fontSize: '3rem', marginBottom: '16px' },
  serviceName: { fontSize: '1.25rem', fontFamily: "${dt.fontHeading}", fontWeight: '${dt.fontWeight}', color: '${dt.text}', marginBottom: '12px' },
  serviceDesc: { color: '${dt.textMuted}', marginBottom: '20px', lineHeight: 1.6 },
  serviceBtn: { color: '${dt.primary}', fontWeight: '${dt.buttonWeight}', textDecoration: 'none', textTransform: '${dt.buttonTransform}' },
  ctaSection: { textAlign: 'center', padding: '${dt.sectionPadding}', background: '${dt.primary}' },
  ctaTitle: { fontSize: '2rem', fontFamily: "${dt.fontHeading}", fontWeight: '700', color: '#fff', marginBottom: '12px' },
  ctaText: { fontSize: '1.1rem', color: 'rgba(255,255,255,0.9)', marginBottom: '24px' },
  ctaBtn: { display: 'inline-block', background: '#fff', color: '${dt.primary}', padding: '${dt.buttonPadding}', borderRadius: '${dt.borderRadius}', fontWeight: '${dt.buttonWeight}', textDecoration: 'none', textTransform: '${dt.buttonTransform}' }
};
`;
}

/**
 * Generate About Page
 */
function generateAboutPage(industryId, variant, moodSliders, businessData, pageType) {
  // Route to variant-specific generator
  const generators = {
    'A': generateAboutPageStoryFirst,
    'B': generateAboutPageValuesForward,
    'C': generateAboutPageVisualJourney
  };

  const generator = generators[variant] || generateAboutPageStoryFirst;
  return generator(industryId, variant, moodSliders, businessData, pageType);
}

/**
 * Build About page data from fixture
 */
function buildAboutData(businessData) {
  const about = businessData.about || {};
  const images = businessData.images || {};
  const fixture = businessData._fixture;

  // Story content
  const story = about?.story || `${businessData.name} was founded with a simple mission: to provide exceptional quality and service to our community. What started as a dream has grown into a beloved local destination, but we've never lost sight of what matters most - creating memorable experiences for every guest who walks through our doors.`;

  // Founder info
  const founder = about?.founder || {
    name: 'Our Founder',
    title: 'Owner & Founder',
    quote: `"Every day, we strive to create something special for our community."`,
    image: images.team?.[0] || images.hero?.[0] || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600'
  };

  // Team members
  let team = [];
  if (about?.team) {
    team = about.team.map(member => ({
      name: member.name,
      role: member.role,
      bio: member.bio || '',
      image: member.image || images.team?.[0] || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
    }));
  } else {
    team = [
      { name: 'Team Member', role: 'Dedicated Professional', bio: 'Passionate about quality.', image: images.team?.[0] || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' }
    ];
  }

  // Values
  const values = about?.values || [
    { icon: '✨', title: 'Quality First', description: 'We never compromise on quality in anything we do.' },
    { icon: '🤝', title: 'Community', description: 'Building meaningful connections with our neighbors.' },
    { icon: '🌱', title: 'Sustainability', description: 'Making responsible choices for our planet.' },
    { icon: '❤️', title: 'Passion', description: 'Loving what we do, every single day.' }
  ];

  // Timeline/milestones
  const established = businessData.established || '2020';
  const establishedYear = parseInt(established) || 2020;
  const timeline = about?.timeline || [
    { year: establishedYear.toString(), title: 'The Beginning', description: `${businessData.name} opens its doors for the first time.` },
    { year: (establishedYear + 2).toString(), title: 'Growing Strong', description: 'Expanded our team and menu based on community feedback.' },
    { year: new Date().getFullYear().toString(), title: 'Today', description: 'Proudly serving our community with the same passion as day one.' }
  ];

  // Press/awards
  const press = about?.press || [
    { name: 'Local Best', year: '2024' },
    { name: 'Community Choice', year: '2023' }
  ];

  // Mission statement
  const mission = about?.mission || `At ${businessData.name}, our mission is simple: to create exceptional experiences through quality, community, and genuine hospitality.`;

  // Community impact
  const community = about?.community || [
    { title: 'Local Partnerships', description: 'Working with local suppliers and artisans.' },
    { title: 'Community Events', description: 'Hosting gatherings that bring people together.' },
    { title: 'Giving Back', description: 'Supporting local causes that matter.' }
  ];

  return {
    story,
    founder,
    team,
    values,
    timeline,
    press,
    mission,
    community,
    images
  };
}

/**
 * Layout A: Story-First About Page
 * Full-bleed founder image with quote, origin narrative, timeline, values grid, team carousel, press strip
 */
function generateAboutPageStoryFirst(industryId, variant, moodSliders, businessData, pageType) {
  const colors = getColors(moodSliders, businessData);
  const dt = getDesignTokens(moodSliders, businessData);
  const data = buildAboutData(businessData);

  const founderData = `{ name: '${escapeQuotes(data.founder.name)}', title: '${escapeQuotes(data.founder.title)}', quote: '${escapeQuotes(data.founder.quote)}', image: '${data.founder.image}' }`;

  const teamData = data.team.map(m =>
    `{ name: '${escapeQuotes(m.name)}', role: '${escapeQuotes(m.role)}', bio: '${escapeQuotes(m.bio)}', image: '${m.image}' }`
  ).join(',\n    ');

  const valuesData = data.values.map(v =>
    `{ icon: '${v.icon}', title: '${escapeQuotes(v.title)}', description: '${escapeQuotes(v.description)}' }`
  ).join(',\n    ');

  const timelineData = data.timeline.map(t =>
    `{ year: '${t.year}', title: '${escapeQuotes(t.title)}', description: '${escapeQuotes(t.description)}' }`
  ).join(',\n    ');

  const pressData = data.press.map(p =>
    `{ name: '${escapeQuotes(p.name)}', year: '${p.year}' }`
  ).join(',\n    ');

  return `/**
 * About Page - ${businessData.name}
 * Layout A: Story-First
 *
 * Research-backed structure:
 * - Full-bleed founder hero with quote (builds trust)
 * - Origin narrative (150-300 words, emotional connection)
 * - Timeline milestones (credibility)
 * - Values grid (brand identity)
 * - Team carousel (humanizes brand)
 * - Press/awards strip (social proof)
 * - CTA band (conversion)
 */

import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star, Award, Users, Heart, Leaf, Sparkles } from 'lucide-react';
import { usePageContent } from '../components/ContentProvider';

export default function AboutPage() {
  const [activeTeamIndex, setActiveTeamIndex] = useState(0);
  const teamCarouselRef = useRef(null);
  const pageContent = usePageContent('about');

  const founder = ${founderData};

  const story = pageContent.story?.text || "${escapeQuotes(data.story)}";

  const _defaultTeam = [
    ${teamData}
  ];
  const team = (pageContent.team && pageContent.team.length > 0) ? pageContent.team : _defaultTeam;

  const _defaultValues = [
    ${valuesData}
  ];
  const values = (pageContent.values && pageContent.values.length > 0) ? pageContent.values : _defaultValues;

  const _defaultTimeline = [
    ${timelineData}
  ];
  const timeline = (pageContent.timeline && pageContent.timeline.length > 0) ? pageContent.timeline : _defaultTimeline;

  const press = [
    ${pressData}
  ];

  const scrollTeam = (direction) => {
    const newIndex = direction === 'next'
      ? Math.min(activeTeamIndex + 1, team.length - 1)
      : Math.max(activeTeamIndex - 1, 0);
    setActiveTeamIndex(newIndex);
  };

  return (
    <div style={styles.page}>
      {/* Hero: Full-bleed Founder Image with Quote */}
      <section style={styles.hero}>
        <div style={styles.heroOverlay} />
        <img src={founder.image} alt={founder.name} style={styles.heroImage} />
        <div style={styles.heroContent}>
          <blockquote style={styles.heroQuote}>{founder.quote}</blockquote>
          <div style={styles.founderInfo}>
            <span style={styles.founderName}>{founder.name}</span>
            <span style={styles.founderTitle}>{founder.title}</span>
          </div>
          <Link to="/menu" style={styles.heroCta}>View Our Menu</Link>
        </div>
      </section>

      {/* Origin Story Section */}
      <section style={styles.storySection}>
        <div style={styles.container}>
          <div style={styles.storyGrid}>
            <div style={styles.storyContent}>
              <span style={styles.sectionLabel}>Our Story</span>
              <h2 style={styles.storyTitle}>How It All Began</h2>
              <p style={styles.storyText}>{story}</p>
            </div>
            <div style={styles.storyImageWrapper}>
              <img
                src="${data.images.interior?.[0] || data.images.hero?.[0] || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800'}"
                alt="Our story"
                style={styles.storyImage}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section style={styles.timelineSection}>
        <div style={styles.container}>
          <span style={styles.sectionLabel}>Our Journey</span>
          <h2 style={styles.sectionTitle}>Milestones</h2>
          <div style={styles.timeline}>
            {timeline.map((item, idx) => (
              <div key={idx} style={styles.timelineItem}>
                <div style={styles.timelineYear}>{item.year}</div>
                <div style={styles.timelineDot} />
                <div style={styles.timelineContent}>
                  <h3 style={styles.timelineTitle}>{item.title}</h3>
                  <p style={styles.timelineDesc}>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section style={styles.valuesSection}>
        <div style={styles.container}>
          <span style={styles.sectionLabel}>What We Stand For</span>
          <h2 style={styles.sectionTitle}>Our Values</h2>
          <div style={styles.valuesGrid}>
            {values.map((value, idx) => (
              <div key={idx} style={styles.valueCard}>
                <span style={styles.valueIcon}>{value.icon}</span>
                <h3 style={styles.valueTitle}>{value.title}</h3>
                <p style={styles.valueDesc}>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Carousel */}
      <section style={styles.teamSection}>
        <div style={styles.container}>
          <span style={styles.sectionLabel}>The People</span>
          <h2 style={styles.sectionTitle}>Meet Our Team</h2>
          <div style={styles.teamCarousel}>
            <button
              onClick={() => scrollTeam('prev')}
              style={{...styles.carouselBtn, ...styles.carouselBtnPrev}}
              disabled={activeTeamIndex === 0}
              aria-label="Previous team member"
            >
              <ChevronLeft size={24} />
            </button>
            <div style={styles.teamCards} ref={teamCarouselRef}>
              {team.map((member, idx) => (
                <div
                  key={idx}
                  style={{
                    ...styles.teamCard,
                    transform: \`translateX(\${(idx - activeTeamIndex) * 110}%)\`,
                    opacity: idx === activeTeamIndex ? 1 : 0.5,
                    scale: idx === activeTeamIndex ? '1' : '0.9'
                  }}
                >
                  <img src={member.image} alt={member.name} style={styles.teamImage} />
                  <h3 style={styles.teamName}>{member.name}</h3>
                  <p style={styles.teamRole}>{member.role}</p>
                  {member.bio && <p style={styles.teamBio}>{member.bio}</p>}
                </div>
              ))}
            </div>
            <button
              onClick={() => scrollTeam('next')}
              style={{...styles.carouselBtn, ...styles.carouselBtnNext}}
              disabled={activeTeamIndex === team.length - 1}
              aria-label="Next team member"
            >
              <ChevronRight size={24} />
            </button>
          </div>
          <div style={styles.carouselDots}>
            {team.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTeamIndex(idx)}
                style={{
                  ...styles.dot,
                  background: idx === activeTeamIndex ? '${colors.primary}' : '#d1d5db'
                }}
                aria-label={\`View team member \${idx + 1}\`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Press/Awards Strip */}
      {press.length > 0 && (
        <section style={styles.pressSection}>
          <div style={styles.container}>
            <div style={styles.pressStrip}>
              {press.map((item, idx) => (
                <div key={idx} style={styles.pressItem}>
                  <Award size={24} style={{ color: '${colors.primary}' }} />
                  <span style={styles.pressName}>{item.name}</span>
                  <span style={styles.pressYear}>{item.year}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Band */}
      <section style={styles.ctaSection}>
        <div style={styles.container}>
          <h2 style={styles.ctaTitle}>Ready to Experience ${escapeQuotes(businessData.name)}?</h2>
          <p style={styles.ctaText}>We can't wait to welcome you.</p>
          <div style={styles.ctaButtons}>
            <Link to="/menu" style={styles.ctaPrimary}>View Menu</Link>
            <Link to="/contact" style={styles.ctaSecondary}>Get in Touch</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: {
    background: '${dt.background}',
    fontFamily: "${dt.fontBody}"
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px'
  },
  sectionLabel: {
    display: 'block',
    color: '${colors.primary}',
    fontWeight: '600',
    fontSize: '0.875rem',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    marginBottom: '12px'
  },
  sectionTitle: {
    fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
    fontFamily: "${dt.fontHeading}",
    fontWeight: '700',
    color: '${dt.text}',
    marginBottom: '40px'
  },

  /* Hero */
  hero: {
    position: 'relative',
    height: '80vh',
    minHeight: '500px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%)',
    zIndex: 1
  },
  heroImage: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center'
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
    textAlign: 'center',
    padding: '40px 20px',
    maxWidth: '700px'
  },
  heroQuote: {
    fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
    fontWeight: '400',
    color: '#ffffff',
    fontStyle: 'italic',
    lineHeight: 1.4,
    marginBottom: '24px'
  },
  founderInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '32px'
  },
  founderName: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: '1.1rem'
  },
  founderTitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: '0.95rem'
  },
  heroCta: {
    display: 'inline-block',
    padding: '16px 32px',
    background: '${colors.primary}',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '1rem',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },

  /* Story Section */
  storySection: {
    padding: '80px 0'
  },
  storyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '60px',
    alignItems: 'center'
  },
  storyContent: {},
  storyTitle: {
    fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '24px'
  },
  storyText: {
    color: '#6b7280',
    fontSize: '1.1rem',
    lineHeight: 1.8
  },
  storyImageWrapper: {
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
  },
  storyImage: {
    width: '100%',
    height: '400px',
    objectFit: 'cover'
  },

  /* Timeline */
  timelineSection: {
    padding: '80px 0',
    background: '#f9fafb',
    textAlign: 'center'
  },
  timeline: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0',
    flexWrap: 'wrap',
    position: 'relative'
  },
  timelineItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '200px',
    padding: '0 24px',
    position: 'relative'
  },
  timelineYear: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '${colors.primary}',
    marginBottom: '16px'
  },
  timelineDot: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    background: '${colors.primary}',
    marginBottom: '16px',
    position: 'relative'
  },
  timelineContent: {
    textAlign: 'center'
  },
  timelineTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '8px'
  },
  timelineDesc: {
    color: '#6b7280',
    fontSize: '0.95rem',
    lineHeight: 1.6
  },

  /* Values */
  valuesSection: {
    padding: '80px 0',
    textAlign: 'center'
  },
  valuesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px'
  },
  valueCard: {
    background: '#f9fafb',
    borderRadius: '16px',
    padding: '32px 24px',
    textAlign: 'center'
  },
  valueIcon: {
    fontSize: '2.5rem',
    display: 'block',
    marginBottom: '16px'
  },
  valueTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '12px'
  },
  valueDesc: {
    color: '#6b7280',
    fontSize: '0.95rem',
    lineHeight: 1.6
  },

  /* Team Carousel */
  teamSection: {
    padding: '80px 0',
    background: '#f9fafb',
    textAlign: 'center'
  },
  teamCarousel: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px 60px',
    overflow: 'hidden'
  },
  carouselBtn: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    transition: 'all 0.2s'
  },
  carouselBtnPrev: {
    left: '0'
  },
  carouselBtnNext: {
    right: '0'
  },
  teamCards: {
    display: 'flex',
    gap: '24px',
    transition: 'transform 0.3s ease'
  },
  teamCard: {
    flex: '0 0 280px',
    background: '#ffffff',
    borderRadius: '16px',
    padding: '32px',
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease'
  },
  teamImage: {
    width: '140px',
    height: '140px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginBottom: '20px',
    border: '4px solid ${colors.primary}20'
  },
  teamName: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '4px'
  },
  teamRole: {
    color: '${colors.primary}',
    fontWeight: '500',
    marginBottom: '12px'
  },
  teamBio: {
    color: '#6b7280',
    fontSize: '0.9rem',
    lineHeight: 1.6
  },
  carouselDots: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '24px'
  },
  dot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },

  /* Press Strip */
  pressSection: {
    padding: '48px 0',
    borderTop: '1px solid #e5e7eb',
    borderBottom: '1px solid #e5e7eb'
  },
  pressStrip: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '48px'
  },
  pressItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  pressName: {
    fontWeight: '600',
    color: '#1f2937'
  },
  pressYear: {
    color: '#9ca3af',
    fontSize: '0.875rem'
  },

  /* CTA Section */
  ctaSection: {
    padding: '80px 0',
    background: '${colors.primary}',
    textAlign: 'center'
  },
  ctaTitle: {
    fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '16px'
  },
  ctaText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: '1.1rem',
    marginBottom: '32px'
  },
  ctaButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    flexWrap: 'wrap'
  },
  ctaPrimary: {
    display: 'inline-block',
    padding: '16px 32px',
    background: '#ffffff',
    color: '${colors.primary}',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '1rem'
  },
  ctaSecondary: {
    display: 'inline-block',
    padding: '16px 32px',
    background: 'transparent',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '1rem',
    border: '2px solid #ffffff'
  }
};
`;
}

/**
 * Layout B: Values-Forward About Page
 * Mission statement hero, values bento grid, origin narrative, team grid, community impact
 */
function generateAboutPageValuesForward(industryId, variant, moodSliders, businessData, pageType) {
  const colors = getColors(moodSliders, businessData);
  const dt = getDesignTokens(moodSliders, businessData);
  const data = buildAboutData(businessData);

  const teamData = data.team.map(m =>
    `{ name: '${escapeQuotes(m.name)}', role: '${escapeQuotes(m.role)}', image: '${m.image}' }`
  ).join(',\n    ');

  const valuesData = data.values.map(v =>
    `{ icon: '${v.icon}', title: '${escapeQuotes(v.title)}', description: '${escapeQuotes(v.description)}' }`
  ).join(',\n    ');

  const communityData = data.community.map(c =>
    `{ title: '${escapeQuotes(c.title)}', description: '${escapeQuotes(c.description)}' }`
  ).join(',\n    ');

  return `/**
 * About Page - ${businessData.name}
 * Layout B: Values-Forward
 *
 * Research-backed structure:
 * - Mission statement hero (clear value proposition above fold)
 * - Values bento grid (asymmetrical, visually engaging)
 * - Origin narrative (ties mission to founder)
 * - Team grid (humanizes brand)
 * - Community impact (local connection)
 * - Social proof + CTA
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, Users, Leaf, Award } from 'lucide-react';
import { usePageContent } from '../components/ContentProvider';

export default function AboutPage() {
  const pageContent = usePageContent('about');

  const mission = "${escapeQuotes(data.mission)}";
  const story = pageContent.story?.text || "${escapeQuotes(data.story)}";

  const _defaultValues = [
    ${valuesData}
  ];
  const values = (pageContent.values && pageContent.values.length > 0) ? pageContent.values : _defaultValues;

  const _defaultTeam = [
    ${teamData}
  ];
  const team = (pageContent.team && pageContent.team.length > 0) ? pageContent.team : _defaultTeam;

  const community = [
    ${communityData}
  ];

  return (
    <div style={styles.page}>
      {/* Mission Statement Hero */}
      <section style={styles.hero}>
        <div style={styles.heroBackground}>
          <video
            autoPlay
            muted
            loop
            playsInline
            style={styles.heroVideo}
            poster="${data.images.interior?.[0] || data.images.hero?.[0] || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1920'}"
          >
            <source src="" type="video/mp4" />
          </video>
          <div style={styles.heroOverlay} />
        </div>
        <div style={styles.heroContent}>
          <span style={styles.heroLabel}>Our Mission</span>
          <h1 style={styles.heroTitle}>{mission}</h1>
          <Link to="/menu" style={styles.heroCta}>Explore Our Menu</Link>
        </div>
      </section>

      {/* Values Bento Grid */}
      <section style={styles.valuesSection}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>What We Believe In</h2>
          <div style={styles.bentoGrid}>
            {values.map((value, idx) => (
              <div
                key={idx}
                style={{
                  ...styles.bentoCard,
                  ...(idx === 0 ? styles.bentoPrimary : {}),
                  ...(idx === 1 ? styles.bentoSecondary : {})
                }}
              >
                <span style={styles.bentoIcon}>{value.icon}</span>
                <h3 style={styles.bentoTitle}>{value.title}</h3>
                <p style={styles.bentoDesc}>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Origin Story */}
      <section style={styles.storySection}>
        <div style={styles.container}>
          <div style={styles.storyGrid}>
            <div style={styles.storyImageWrapper}>
              <img
                src="${data.founder.image}"
                alt="Our founder"
                style={styles.storyImage}
              />
            </div>
            <div style={styles.storyContent}>
              <span style={styles.sectionLabel}>Our Story</span>
              <h2 style={styles.storyTitle}>From Passion to Purpose</h2>
              <p style={styles.storyText}>{story}</p>
              <div style={styles.founderSig}>
                <span style={styles.sigName}>${escapeQuotes(data.founder.name)}</span>
                <span style={styles.sigTitle}>${escapeQuotes(data.founder.title)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Grid */}
      <section style={styles.teamSection}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>The Team Behind It All</h2>
          <div style={styles.teamGrid}>
            {team.map((member, idx) => (
              <div key={idx} style={styles.teamCard}>
                <img src={member.image} alt={member.name} style={styles.teamImage} />
                <h3 style={styles.teamName}>{member.name}</h3>
                <p style={styles.teamRole}>{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Impact */}
      <section style={styles.communitySection}>
        <div style={styles.container}>
          <span style={styles.sectionLabel}>Community</span>
          <h2 style={styles.sectionTitle}>Our Local Impact</h2>
          <div style={styles.communityGrid}>
            {community.map((item, idx) => (
              <div key={idx} style={styles.communityCard}>
                <div style={styles.communityIcon}>
                  {idx === 0 ? <Users size={32} /> : idx === 1 ? <Heart size={32} /> : <Leaf size={32} />}
                </div>
                <h3 style={styles.communityTitle}>{item.title}</h3>
                <p style={styles.communityDesc}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <div style={styles.container}>
          <h2 style={styles.ctaTitle}>Come Be Part of Our Story</h2>
          <div style={styles.ctaButtons}>
            <Link to="/menu" style={styles.ctaPrimary}>View Menu</Link>
            <Link to="/contact" style={styles.ctaSecondary}>Visit Us</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: {
    background: '${dt.background}',
    fontFamily: "${dt.fontBody}"
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px'
  },
  sectionLabel: {
    display: 'block',
    color: '${colors.primary}',
    fontWeight: '600',
    fontSize: '0.875rem',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    marginBottom: '12px'
  },
  sectionTitle: {
    fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
    fontFamily: "${dt.fontHeading}",
    fontWeight: '700',
    color: '${dt.text}',
    marginBottom: '48px',
    textAlign: 'center'
  },

  /* Hero */
  hero: {
    position: 'relative',
    minHeight: '70vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  heroBackground: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden'
  },
  heroVideo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.6)'
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
    textAlign: 'center',
    padding: '40px 20px',
    maxWidth: '800px'
  },
  heroLabel: {
    display: 'inline-block',
    color: '${colors.primary}',
    fontWeight: '600',
    fontSize: '0.875rem',
    textTransform: 'uppercase',
    letterSpacing: '3px',
    marginBottom: '24px',
    background: 'rgba(255,255,255,0.9)',
    padding: '8px 20px',
    borderRadius: '4px'
  },
  heroTitle: {
    fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
    fontWeight: '600',
    color: '#ffffff',
    lineHeight: 1.4,
    marginBottom: '32px'
  },
  heroCta: {
    display: 'inline-block',
    padding: '16px 32px',
    background: '${colors.primary}',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '1rem'
  },

  /* Values Bento */
  valuesSection: {
    padding: '80px 0'
  },
  bentoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gridTemplateRows: 'repeat(2, auto)',
    gap: '20px'
  },
  bentoCard: {
    background: '#f9fafb',
    borderRadius: '16px',
    padding: '32px',
    gridColumn: 'span 1'
  },
  bentoPrimary: {
    gridColumn: 'span 2',
    gridRow: 'span 2',
    background: '${colors.primary}10',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  bentoSecondary: {
    gridColumn: 'span 2'
  },
  bentoIcon: {
    fontSize: '2rem',
    marginBottom: '16px',
    display: 'block'
  },
  bentoTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '12px'
  },
  bentoDesc: {
    color: '#6b7280',
    lineHeight: 1.6
  },

  /* Story */
  storySection: {
    padding: '80px 0',
    background: '#f9fafb'
  },
  storyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '60px',
    alignItems: 'center'
  },
  storyImageWrapper: {
    borderRadius: '16px',
    overflow: 'hidden'
  },
  storyImage: {
    width: '100%',
    height: '500px',
    objectFit: 'cover'
  },
  storyContent: {},
  storyTitle: {
    fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '24px'
  },
  storyText: {
    color: '#6b7280',
    fontSize: '1.1rem',
    lineHeight: 1.8,
    marginBottom: '32px'
  },
  founderSig: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    paddingLeft: '20px',
    borderLeft: '3px solid ${colors.primary}'
  },
  sigName: {
    fontWeight: '600',
    color: '#1f2937'
  },
  sigTitle: {
    color: '#6b7280',
    fontSize: '0.9rem'
  },

  /* Team */
  teamSection: {
    padding: '80px 0'
  },
  teamGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '24px'
  },
  teamCard: {
    textAlign: 'center'
  },
  teamImage: {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginBottom: '16px'
  },
  teamName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '4px'
  },
  teamRole: {
    color: '${colors.primary}',
    fontSize: '0.9rem'
  },

  /* Community */
  communitySection: {
    padding: '80px 0',
    background: '#f9fafb',
    textAlign: 'center'
  },
  communityGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px'
  },
  communityCard: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '40px 32px',
    textAlign: 'center'
  },
  communityIcon: {
    color: '${colors.primary}',
    marginBottom: '20px'
  },
  communityTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '12px'
  },
  communityDesc: {
    color: '#6b7280',
    lineHeight: 1.6
  },

  /* CTA */
  ctaSection: {
    padding: '80px 0',
    textAlign: 'center'
  },
  ctaTitle: {
    fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '32px'
  },
  ctaButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    flexWrap: 'wrap'
  },
  ctaPrimary: {
    display: 'inline-block',
    padding: '16px 32px',
    background: '${colors.primary}',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: '600'
  },
  ctaSecondary: {
    display: 'inline-block',
    padding: '16px 32px',
    background: 'transparent',
    color: '${colors.primary}',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    border: '2px solid ${colors.primary}'
  }
};
`;
}

/**
 * Layout C: Visual Journey About Page
 * Photo gallery hero, alternating photo-story bands, horizontal timeline, team spotlights
 */
function generateAboutPageVisualJourney(industryId, variant, moodSliders, businessData, pageType) {
  const colors = getColors(moodSliders, businessData);
  const dt = getDesignTokens(moodSliders, businessData);
  const data = buildAboutData(businessData);

  const teamData = data.team.slice(0, 3).map(m =>
    `{ name: '${escapeQuotes(m.name)}', role: '${escapeQuotes(m.role)}', bio: '${escapeQuotes(m.bio)}', image: '${m.image}' }`
  ).join(',\n    ');

  const timelineData = data.timeline.map(t =>
    `{ year: '${t.year}', title: '${escapeQuotes(t.title)}', description: '${escapeQuotes(t.description)}' }`
  ).join(',\n    ');

  const valuesData = data.values.slice(0, 4).map(v =>
    `{ icon: '${v.icon}', title: '${escapeQuotes(v.title)}' }`
  ).join(',\n    ');

  // Gallery images for the hero slideshow
  const galleryImages = [
    data.images.interior?.[0] || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200',
    data.images.products?.[0] || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200',
    data.images.hero?.[0] || 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=1200'
  ];

  const heroImagesData = galleryImages.map(url => `'${url}'`).join(',\n    ');

  return `/**
 * About Page - ${businessData.name}
 * Layout C: Visual Journey
 *
 * Research-backed structure:
 * - Photo gallery slideshow hero (immersive visual impact)
 * - Alternating photo-story bands (scroll-driven narrative)
 * - Horizontal scrolling timeline (interactive engagement)
 * - Featured team spotlights (personal connection)
 * - Instagram/UGC gallery (social proof + freshness)
 * - Values strip + CTA
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePageContent } from '../components/ContentProvider';

export default function AboutPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const pageContent = usePageContent('about');

  const heroImages = [
    ${heroImagesData}
  ];

  const story = pageContent.story?.text || "${escapeQuotes(data.story)}";

  const _defaultTimeline = [
    ${timelineData}
  ];
  const timeline = (pageContent.timeline && pageContent.timeline.length > 0) ? pageContent.timeline : _defaultTimeline;

  const _defaultTeam = [
    ${teamData}
  ];
  const teamSpotlights = (pageContent.team && pageContent.team.length > 0) ? pageContent.team : _defaultTeam;

  const _defaultValues = [
    ${valuesData}
  ];
  const values = (pageContent.values && pageContent.values.length > 0) ? pageContent.values : _defaultValues;

  // Auto-advance slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % heroImages.length);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + heroImages.length) % heroImages.length);

  return (
    <div style={styles.page}>
      {/* Photo Gallery Hero */}
      <section style={styles.hero}>
        {heroImages.map((img, idx) => (
          <div
            key={idx}
            style={{
              ...styles.heroSlide,
              opacity: idx === currentSlide ? 1 : 0
            }}
          >
            <img src={img} alt={\`Slide \${idx + 1}\`} style={styles.heroImage} />
          </div>
        ))}
        <div style={styles.heroOverlay} />
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Our Story</h1>
          <p style={styles.heroSubtitle}>A visual journey through ${escapeQuotes(businessData.name)}</p>
        </div>
        <button onClick={prevSlide} style={{...styles.slideBtn, left: '20px'}} aria-label="Previous slide">
          <ChevronLeft size={32} />
        </button>
        <button onClick={nextSlide} style={{...styles.slideBtn, right: '20px'}} aria-label="Next slide">
          <ChevronRight size={32} />
        </button>
        <div style={styles.slideDots}>
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              style={{
                ...styles.dot,
                background: idx === currentSlide ? '#fff' : 'rgba(255,255,255,0.4)'
              }}
              aria-label={\`Go to slide \${idx + 1}\`}
            />
          ))}
        </div>
      </section>

      {/* Photo-Story Band 1 */}
      <section style={styles.storyBand}>
        <div style={styles.storyBandImage}>
          <img
            src="${data.images.interior?.[0] || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800'}"
            alt="Our space"
            style={styles.bandImage}
          />
        </div>
        <div style={styles.storyBandContent}>
          <span style={styles.bandLabel}>The Beginning</span>
          <h2 style={styles.bandTitle}>Where Passion Meets Purpose</h2>
          <p style={styles.bandText}>{story}</p>
        </div>
      </section>

      {/* Photo-Story Band 2 (Reversed) */}
      <section style={{...styles.storyBand, ...styles.storyBandReverse}}>
        <div style={styles.storyBandContent}>
          <span style={styles.bandLabel}>The Experience</span>
          <h2 style={styles.bandTitle}>More Than Just a Visit</h2>
          <p style={styles.bandText}>
            Every detail matters - from the ambiance to the quality of what we serve.
            We've created a space where you can slow down, connect, and enjoy the moment.
          </p>
        </div>
        <div style={styles.storyBandImage}>
          <img
            src="${data.images.products?.[0] || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800'}"
            alt="Our products"
            style={styles.bandImage}
          />
        </div>
      </section>

      {/* Horizontal Timeline */}
      <section style={styles.timelineSection}>
        <h2 style={styles.sectionTitle}>Our Journey</h2>
        <div style={styles.timelineWrapper}>
          <div style={styles.timelineScroll}>
            {timeline.map((item, idx) => (
              <div key={idx} style={styles.timelineItem}>
                <div style={styles.timelineYear}>{item.year}</div>
                <div style={styles.timelineBar}>
                  <div style={styles.timelineDot} />
                </div>
                <div style={styles.timelineContent}>
                  <h3 style={styles.timelineTitle}>{item.title}</h3>
                  <p style={styles.timelineDesc}>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Spotlights */}
      <section style={styles.teamSection}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>The Faces Behind It All</h2>
          <div style={styles.spotlightGrid}>
            {teamSpotlights.map((member, idx) => (
              <div key={idx} style={styles.spotlightCard}>
                <img src={member.image} alt={member.name} style={styles.spotlightImage} />
                <div style={styles.spotlightContent}>
                  <h3 style={styles.spotlightName}>{member.name}</h3>
                  <p style={styles.spotlightRole}>{member.role}</p>
                  {member.bio && <p style={styles.spotlightBio}>{member.bio}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Strip */}
      <section style={styles.valuesStrip}>
        <div style={styles.container}>
          <div style={styles.valuesRow}>
            {values.map((value, idx) => (
              <div key={idx} style={styles.valueItem}>
                <span style={styles.valueIcon}>{value.icon}</span>
                <span style={styles.valueTitle}>{value.title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <div style={styles.container}>
          <h2 style={styles.ctaTitle}>Ready to Visit?</h2>
          <p style={styles.ctaText}>We'd love to welcome you to ${escapeQuotes(businessData.name)}.</p>
          <div style={styles.ctaButtons}>
            <Link to="/menu" style={styles.ctaPrimary}>See Our Menu</Link>
            <Link to="/contact" style={styles.ctaSecondary}>Find Us</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: {
    background: '${dt.background}',
    fontFamily: "${dt.fontBody}"
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px'
  },
  sectionTitle: {
    fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
    fontFamily: "${dt.fontHeading}",
    fontWeight: '700',
    color: '${dt.text}',
    marginBottom: '48px',
    textAlign: 'center'
  },

  /* Hero Slideshow */
  hero: {
    position: 'relative',
    height: '85vh',
    minHeight: '500px',
    overflow: 'hidden'
  },
  heroSlide: {
    position: 'absolute',
    inset: 0,
    transition: 'opacity 0.8s ease'
  },
  heroImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.5) 100%)',
    zIndex: 1
  },
  heroContent: {
    position: 'absolute',
    bottom: '100px',
    left: '50%',
    transform: 'translateX(-50%)',
    textAlign: 'center',
    zIndex: 2,
    padding: '0 20px'
  },
  heroTitle: {
    fontSize: 'clamp(2.5rem, 6vw, 4rem)',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '16px',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
  },
  heroSubtitle: {
    fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
    color: 'rgba(255,255,255,0.9)'
  },
  slideBtn: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)',
    backdropFilter: 'blur(4px)',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
    transition: 'background 0.2s'
  },
  slideDots: {
    position: 'absolute',
    bottom: '32px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '12px',
    zIndex: 3
  },
  dot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },

  /* Story Bands */
  storyBand: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    minHeight: '500px'
  },
  storyBandReverse: {
    direction: 'rtl'
  },
  storyBandImage: {
    overflow: 'hidden',
    direction: 'ltr'
  },
  bandImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    minHeight: '500px'
  },
  storyBandContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '60px',
    direction: 'ltr'
  },
  bandLabel: {
    color: '${colors.primary}',
    fontWeight: '600',
    fontSize: '0.875rem',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    marginBottom: '16px'
  },
  bandTitle: {
    fontSize: 'clamp(1.5rem, 3vw, 2rem)',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '20px'
  },
  bandText: {
    color: '#6b7280',
    fontSize: '1.1rem',
    lineHeight: 1.8
  },

  /* Timeline */
  timelineSection: {
    padding: '80px 0',
    background: '#f9fafb'
  },
  timelineWrapper: {
    overflowX: 'auto',
    paddingBottom: '20px'
  },
  timelineScroll: {
    display: 'flex',
    gap: '0',
    minWidth: 'max-content',
    padding: '0 40px'
  },
  timelineItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '220px',
    padding: '0 20px'
  },
  timelineYear: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '${colors.primary}',
    marginBottom: '16px'
  },
  timelineBar: {
    width: '100%',
    height: '4px',
    background: '#e5e7eb',
    position: 'relative',
    marginBottom: '16px'
  },
  timelineDot: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    background: '${colors.primary}',
    border: '4px solid #fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  timelineContent: {
    textAlign: 'center'
  },
  timelineTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '8px'
  },
  timelineDesc: {
    color: '#6b7280',
    fontSize: '0.9rem',
    lineHeight: 1.5
  },

  /* Team Spotlights */
  teamSection: {
    padding: '80px 0'
  },
  spotlightGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '32px'
  },
  spotlightCard: {
    display: 'grid',
    gridTemplateColumns: '140px 1fr',
    gap: '24px',
    background: '#f9fafb',
    borderRadius: '16px',
    padding: '24px',
    alignItems: 'center'
  },
  spotlightImage: {
    width: '140px',
    height: '140px',
    borderRadius: '12px',
    objectFit: 'cover'
  },
  spotlightContent: {},
  spotlightName: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '4px'
  },
  spotlightRole: {
    color: '${colors.primary}',
    fontWeight: '500',
    marginBottom: '12px'
  },
  spotlightBio: {
    color: '#6b7280',
    fontSize: '0.9rem',
    lineHeight: 1.6
  },

  /* Values Strip */
  valuesStrip: {
    padding: '48px 0',
    background: '${colors.primary}10',
    borderTop: '1px solid ${colors.primary}20',
    borderBottom: '1px solid ${colors.primary}20'
  },
  valuesRow: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '48px'
  },
  valueItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  valueIcon: {
    fontSize: '1.5rem'
  },
  valueTitle: {
    fontWeight: '600',
    color: '#1f2937'
  },

  /* CTA */
  ctaSection: {
    padding: '80px 0',
    textAlign: 'center'
  },
  ctaTitle: {
    fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '16px'
  },
  ctaText: {
    color: '#6b7280',
    fontSize: '1.1rem',
    marginBottom: '32px'
  },
  ctaButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    flexWrap: 'wrap'
  },
  ctaPrimary: {
    display: 'inline-block',
    padding: '16px 32px',
    background: '${colors.primary}',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: '600'
  },
  ctaSecondary: {
    display: 'inline-block',
    padding: '16px 32px',
    background: 'transparent',
    color: '${colors.primary}',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    border: '2px solid ${colors.primary}'
  }
};
`;
}

/**
 * Generate Contact Page
 */
function generateContactPage(industryId, variant, moodSliders, businessData, pageType) {
  const colors = getColors(moodSliders, businessData);
  const dt = getDesignTokens(moodSliders, businessData);

  return `/**
 * Contact Page - ${businessData.name}
 * Generated by Launchpad
 */

import React, { useState } from 'react';
import { usePageContent } from '../components/ContentProvider';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const pageContent = usePageContent('contact');
  const contactInfo = pageContent.info || {};

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    setSubmitted(true);
  };

  const businessInfo = {
    name: '${escapeQuotes(businessData.name)}',
    address: contactInfo.address || '${escapeQuotes(businessData.address)}',
    phone: contactInfo.phone || '${businessData.phone}',
    email: contactInfo.email || '${businessData.email}',
    hours: contactInfo.hours || ${JSON.stringify(businessData.hours)}
  };

  return (
    <div style={styles.page}>
      <main style={styles.main}>
        <section style={styles.hero}>
          <h1 style={styles.title}>Contact Us</h1>
          <p style={styles.subtitle}>We'd love to hear from you</p>
        </section>

        <section style={styles.contactSection}>
          <div style={styles.contactInfo}>
            <h2 style={styles.infoTitle}>Get in Touch</h2>

            <div style={styles.infoItem}>
              <span style={styles.infoIcon}>📍</span>
              <div>
                <h3 style={styles.infoLabel}>Address</h3>
                <p style={styles.infoText}>{businessInfo.address}</p>
              </div>
            </div>

            <div style={styles.infoItem}>
              <span style={styles.infoIcon}>📞</span>
              <div>
                <h3 style={styles.infoLabel}>Phone</h3>
                <p style={styles.infoText}>{businessInfo.phone}</p>
              </div>
            </div>

            <div style={styles.infoItem}>
              <span style={styles.infoIcon}>✉️</span>
              <div>
                <h3 style={styles.infoLabel}>Email</h3>
                <p style={styles.infoText}>{businessInfo.email}</p>
              </div>
            </div>

            <div style={styles.infoItem}>
              <span style={styles.infoIcon}>🕐</span>
              <div>
                <h3 style={styles.infoLabel}>Hours</h3>
                {Object.entries(businessInfo.hours).map(([day, hours], idx) => (
                  <p key={idx} style={styles.infoText}>{day}: {hours}</p>
                ))}
              </div>
            </div>
          </div>

          <div style={styles.contactForm}>
            {submitted ? (
              <div style={styles.successMessage}>
                <span style={styles.successIcon}>✓</span>
                <h3>Thank you!</h3>
                <p>We'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h2 style={styles.formTitle}>Send a Message</h2>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={styles.input}
                  required
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  style={styles.input}
                  required
                />
                <input
                  type="tel"
                  placeholder="Your Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  style={styles.input}
                />
                <textarea
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  style={styles.textarea}
                  rows={5}
                  required
                />
                <button type="submit" style={styles.submitBtn}>Send Message</button>
              </form>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

const styles = {
  page: { background: '${dt.background}', fontFamily: "${dt.fontBody}" },
  main: { },
  hero: { textAlign: 'center', padding: '${dt.sectionPadding}', background: '${dt.surface}' },
  title: { fontSize: 'clamp(2rem, 5vw, 3rem)', fontFamily: "${dt.fontHeading}", fontWeight: '700', color: '${dt.text}', marginBottom: '12px', textTransform: '${dt.headlineStyle}' },
  subtitle: { fontSize: '1.1rem', color: '${dt.textMuted}' },
  contactSection: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '${dt.gap}', maxWidth: '1100px', margin: '0 auto', padding: '${dt.sectionPadding}' },
  contactInfo: {},
  infoTitle: { fontSize: '1.5rem', fontFamily: "${dt.fontHeading}", fontWeight: '700', color: '${dt.text}', marginBottom: '24px' },
  infoItem: { display: 'flex', gap: '16px', marginBottom: '24px' },
  infoIcon: { fontSize: '1.5rem' },
  infoLabel: { fontSize: '0.9rem', fontWeight: '600', color: '${dt.text}', marginBottom: '4px' },
  infoText: { color: '${dt.textMuted}', fontSize: '0.95rem' },
  contactForm: { background: '${dt.surface}', borderRadius: '${dt.borderRadius}', padding: '${dt.cardPadding}', boxShadow: '${dt.shadow}' },
  formTitle: { fontSize: '1.5rem', fontFamily: "${dt.fontHeading}", fontWeight: '700', color: '${dt.text}', marginBottom: '24px' },
  input: { width: '100%', padding: '14px 16px', border: '1px solid ${dt.border}', borderRadius: '${dt.borderRadius}', fontSize: '1rem', marginBottom: '16px', outline: 'none', background: '${dt.inputBg}', color: '${dt.text}' },
  textarea: { width: '100%', padding: '14px 16px', border: '1px solid ${dt.border}', borderRadius: '${dt.borderRadius}', fontSize: '1rem', marginBottom: '16px', outline: 'none', resize: 'vertical', background: '${dt.inputBg}', color: '${dt.text}' },
  submitBtn: { width: '100%', padding: '${dt.buttonPadding}', background: '${dt.primary}', color: '#fff', border: 'none', borderRadius: '${dt.borderRadius}', fontSize: '1rem', fontWeight: '${dt.buttonWeight}', cursor: 'pointer', textTransform: '${dt.buttonTransform}' },
  successMessage: { textAlign: 'center', padding: '40px' },
  successIcon: { display: 'inline-block', width: '60px', height: '60px', background: '#10b981', color: '#fff', borderRadius: '50%', fontSize: '2rem', lineHeight: '60px', marginBottom: '16px' }
};
`;
}

/**
 * Generate Gallery Page
 */
function generateGalleryPage(industryId, variant, moodSliders, businessData, pageType) {
  const colors = getColors(moodSliders, businessData);
  const dt = getDesignTokens(moodSliders, businessData);
  const images = businessData.images || {};
  const gallery = businessData.gallery;

  let galleryData = '';
  if (gallery?.images) {
    galleryData = gallery.images.map(img =>
      `{ src: '${img.url || img}', caption: '${escapeQuotes(img.caption || '')}' }`
    ).join(',\n    ');
  } else {
    const allImages = [...(images.hero || []), ...(images.interior || []), ...(images.products || [])].slice(0, 9);
    galleryData = allImages.map((url, idx) =>
      `{ src: '${url}', caption: 'Gallery Image ${idx + 1}' }`
    ).join(',\n    ');
  }

  return `/**
 * Gallery Page - ${businessData.name}
 * Generated by Launchpad
 */

import React, { useState } from 'react';

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState(null);

  const images = [
    ${galleryData}
  ];

  return (
    <div style={styles.page}>
      <main style={styles.main}>
        <section style={styles.hero}>
          <h1 style={styles.title}>Gallery</h1>
          <p style={styles.subtitle}>A glimpse into what we do</p>
        </section>

        <section style={styles.gallerySection}>
          <div style={styles.galleryGrid}>
            {images.map((img, idx) => (
              <div
                key={idx}
                style={styles.galleryItem}
                onClick={() => setSelectedImage(img)}
              >
                <img src={img.src} alt={img.caption} style={styles.galleryImage} />
                <div style={styles.imageOverlay}>
                  <span style={styles.imageCaption}>{img.caption}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {selectedImage && (
          <div style={styles.lightbox} onClick={() => setSelectedImage(null)}>
            <img src={selectedImage.src} alt={selectedImage.caption} style={styles.lightboxImage} />
            <p style={styles.lightboxCaption}>{selectedImage.caption}</p>
            <button style={styles.closeBtn} onClick={() => setSelectedImage(null)}>×</button>
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  page: { background: '${dt.background}', fontFamily: "${dt.fontBody}" },
  main: { },
  hero: { textAlign: 'center', padding: '${dt.sectionPadding}', background: '${dt.surface}' },
  title: { fontSize: 'clamp(2rem, 5vw, 3rem)', fontFamily: "${dt.fontHeading}", fontWeight: '700', color: '${dt.text}', marginBottom: '12px', textTransform: '${dt.headlineStyle}' },
  subtitle: { fontSize: '1.1rem', color: '${dt.textMuted}' },
  gallerySection: { maxWidth: '1200px', margin: '0 auto', padding: '${dt.sectionPadding}' },
  galleryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '${dt.gap}' },
  galleryItem: { position: 'relative', borderRadius: '${dt.borderRadius}', overflow: 'hidden', cursor: 'pointer', aspectRatio: '1', boxShadow: '${dt.shadow}' },
  galleryImage: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' },
  imageOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)', display: 'flex', alignItems: 'flex-end', padding: '16px', opacity: 0, transition: 'opacity 0.3s' },
  imageCaption: { color: '#fff', fontWeight: '500' },
  lightbox: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  lightboxImage: { maxWidth: '90%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '${dt.borderRadius}' },
  lightboxCaption: { color: '#fff', marginTop: '16px', fontSize: '1.1rem' },
  closeBtn: { position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#fff', fontSize: '2rem', cursor: 'pointer' }
};
`;
}

/**
 * Generate generic page as fallback
 */
function generateGenericPage(industryId, variant, moodSliders, businessData, pageType) {
  const dt = getDesignTokens(moodSliders, businessData);
  const pageName = capitalize(pageType);

  return `/**
 * ${pageName} Page - ${businessData.name}
 * Generated by Launchpad
 */

import React from 'react';
import { Link } from 'react-router-dom';

export default function ${pageName}Page() {
  return (
    <div style={styles.page}>
      <main style={styles.main}>
        <section style={styles.hero}>
          <h1 style={styles.title}>${pageName}</h1>
          <p style={styles.subtitle}>Welcome to our ${pageType} page</p>
        </section>

        <section style={styles.content}>
          <div style={styles.container}>
            <p style={styles.text}>This page is coming soon. Contact us for more information.</p>
            <Link to="/contact" style={styles.btn}>Contact Us</Link>
          </div>
        </section>
      </main>
    </div>
  );
}

const styles = {
  page: { background: '${dt.background}', fontFamily: "${dt.fontBody}" },
  main: { },
  hero: { textAlign: 'center', padding: '${dt.sectionPadding}', background: '${dt.surface}' },
  title: { fontSize: 'clamp(2rem, 5vw, 3rem)', fontFamily: "${dt.fontHeading}", fontWeight: '${dt.fontWeight === '400' ? '700' : '800'}', color: '${dt.text}', marginBottom: '12px', textTransform: '${dt.headlineStyle}' },
  subtitle: { fontSize: '1.1rem', color: '${dt.textMuted}' },
  content: { padding: '${dt.sectionPadding}', textAlign: 'center' },
  container: { maxWidth: '600px', margin: '0 auto' },
  text: { fontSize: '1.1rem', color: '${dt.textMuted}', marginBottom: '24px' },
  btn: { display: 'inline-block', background: '${dt.primary}', color: '#fff', padding: '${dt.buttonPadding}', borderRadius: '${dt.borderRadius}', fontWeight: '${dt.buttonWeight}', textDecoration: 'none', textTransform: '${dt.buttonTransform}' }
};
`;
}

// Shared adapter: converts moodSliders + colors into styleOverrides for specialized generators
function buildStyleOverrides(moodSliders, colors) {
  return {
    isDark: moodSliders.isDark || false,
    isMedium: moodSliders.isMedium || false,
    primaryColor: colors.primary,
    fontHeading: moodSliders.fontHeading,
    fontBody: moodSliders.fontBody,
    borderRadius: moodSliders.borderRadius,
    sectionPadding: moodSliders.sectionPadding,
    cardPadding: moodSliders.cardPadding,
    gap: moodSliders.gap,
    headlineStyle: moodSliders.headlineStyle,
    buttonStyle: moodSliders.buttonStyle
  };
}

// Classes pages use the same services generator for their industry
function generateClassesPage(industryId, variant, moodSliders, businessData, pageType) {
  return generateServicesPage(industryId, variant, moodSliders, businessData, 'services');
}

/**
 * Generate Team Page
 * Displays team/staff member cards with credentials and bios
 * Uses usePageContent('team') for CMS editing
 */
function generateTeamPage(industryId, variant, moodSliders, businessData, pageType) {
  const dt = getDesignTokens(moodSliders, businessData);
  const businessName = escapeQuotes(businessData.name);

  // Industry-specific team content
  const teamContentByIndustry = {
    'law-firm': {
      title: 'Our Attorneys',
      subtitle: 'Experienced legal professionals dedicated to your case',
      ctaHeadline: 'Let Us Fight For You',
      ctaText: 'Our experienced attorneys are ready to review your case and discuss your options.',
      ctaButton: 'Schedule Consultation',
      ctaPath: '/consultation',
      members: [
        { name: 'Robert Mitchell', role: 'Managing Partner', bio: 'Over 25 years of trial experience in personal injury and civil litigation.', credentials: ['J.D. Harvard Law', 'Super Lawyer', 'Top 100 Trial Lawyers'] },
        { name: 'Sarah Chen', role: 'Senior Partner', bio: 'Specializing in family law with a focus on divorce and custody matters.', credentials: ['J.D. Stanford Law', 'Family Law Specialist', 'Certified Mediator'] },
        { name: 'Michael Torres', role: 'Partner', bio: 'Criminal defense attorney with an exceptional track record.', credentials: ['J.D. Columbia Law', 'Ex-District Attorney', 'Criminal Law Expert'] },
        { name: 'Jennifer Adams', role: 'Associate Attorney', bio: 'Business law specialist helping entrepreneurs protect their interests.', credentials: ['J.D. UCLA Law', 'MBA Finance', 'Corporate Law'] }
      ]
    },
    'real-estate': {
      title: 'Our Agents',
      subtitle: 'Experienced agents ready to help you find your dream home',
      ctaHeadline: 'Work With the Best',
      ctaText: 'Our team has the experience and dedication to help you achieve your real estate goals.',
      ctaButton: 'Contact Us',
      ctaPath: '/contact',
      members: [
        { name: 'Jennifer Williams', role: 'Principal Broker', bio: 'Over 20 years in real estate with $200M+ in career sales.', credentials: ['Licensed Broker', 'Top Producer', 'Luxury Certified'] },
        { name: 'David Park', role: 'Senior Agent', bio: 'Specializing in first-time buyers and investment properties.', credentials: ['15+ Years Experience', 'Buyer Specialist'] },
        { name: 'Amanda Rodriguez', role: 'Listing Specialist', bio: 'Marketing expert who gets homes sold fast and for top dollar.', credentials: ['Listing Expert', 'Digital Marketing'] },
        { name: 'Marcus Johnson', role: 'Buyer Agent', bio: 'Dedicated to finding the perfect home for every client.', credentials: ['Buyer Representative', 'Relocation Specialist'] }
      ]
    },
    'dental': {
      title: 'Our Dental Team',
      subtitle: 'Caring professionals committed to your oral health',
      ctaHeadline: 'Schedule Your Visit',
      ctaText: 'Our friendly team is ready to welcome you and your family.',
      ctaButton: 'Book Appointment',
      ctaPath: '/book',
      members: [
        { name: 'Dr. Sarah Mitchell', role: 'Lead Dentist', bio: 'Over 15 years of experience in general and cosmetic dentistry.', credentials: ['DDS', 'Cosmetic Specialist'] },
        { name: 'Dr. James Park', role: 'Orthodontist', bio: 'Specializing in Invisalign and traditional braces for all ages.', credentials: ['DMD', 'Orthodontics Board Certified'] },
        { name: 'Lisa Chen', role: 'Dental Hygienist', bio: 'Gentle, thorough cleanings with a focus on patient comfort.', credentials: ['RDH', '10+ Years Experience'] }
      ]
    },
    'auto-shop': {
      title: 'Our Mechanics',
      subtitle: 'ASE certified technicians you can trust',
      ctaHeadline: 'Mechanics You Can Trust',
      ctaText: 'Our ASE certified team has the training and experience to service any vehicle.',
      ctaButton: 'Schedule Service',
      ctaPath: '/book',
      members: [
        { name: 'Tony Ramirez', role: 'Owner / Master Technician', bio: 'ASE Master Tech with 30+ years of experience.', credentials: ['ASE Master', 'Shop Owner'] },
        { name: 'Steve Miller', role: 'Lead Technician', bio: 'Engine diagnostics and repair specialist.', credentials: ['ASE Certified', 'Diagnostics Expert'] },
        { name: 'Kevin Park', role: 'Technician', bio: 'Expert in electrical systems and hybrid vehicles.', credentials: ['ASE Certified', 'Hybrid Specialist'] }
      ]
    }
  };

  const defaultContent = {
    title: 'Our Team',
    subtitle: 'Meet the people behind ' + businessName,
    ctaHeadline: 'Ready to Get Started?',
    ctaText: 'Our team is here to help. Reach out today.',
    ctaButton: 'Contact Us',
    ctaPath: '/contact',
    members: [
      { name: 'Owner', role: 'Founder & Owner', bio: 'Leading ' + businessName + ' with passion and dedication.', credentials: [] },
      { name: 'Team Lead', role: 'Senior Staff', bio: 'Bringing years of experience and expertise.', credentials: [] },
      { name: 'Team Member', role: 'Staff', bio: 'Committed to delivering excellent service.', credentials: [] }
    ]
  };

  const content = teamContentByIndustry[industryId] || defaultContent;
  const membersJson = JSON.stringify(content.members);

  return `/**
 * Team Page - ${businessName}
 * Team member cards with credentials and bios
 * Generated by Launchpad
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Award, ChevronRight } from 'lucide-react';
import { usePageContent } from '../components/ContentProvider';

const FALLBACK_MEMBERS = ${membersJson};

export default function TeamPage() {
  const pageContent = usePageContent('team');
  const members = pageContent?.members || FALLBACK_MEMBERS;
  const title = pageContent?.hero?.title || '${escapeQuotes(content.title)}';
  const subtitle = pageContent?.hero?.subtitle || '${escapeQuotes(content.subtitle)}';

  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>{title}</h1>
        <p style={styles.heroSubtitle}>{subtitle}</p>
      </section>

      <section style={styles.teamSection}>
        <div style={styles.grid}>
          {members.map((member, idx) => (
            <div key={idx} style={styles.card}>
              <div style={styles.avatarWrap}>
                {member.image ? (
                  <img src={member.image} alt={member.name} style={styles.avatarImg} />
                ) : (
                  <div style={styles.avatarInitials}>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
              </div>
              <div style={styles.cardBody}>
                <h3 style={styles.memberName}>{member.name}</h3>
                <p style={styles.memberRole}>{member.role}</p>
                <p style={styles.memberBio}>{member.bio}</p>
                {member.credentials && member.credentials.length > 0 && (
                  <div style={styles.credentials}>
                    {member.credentials.map((cred, i) => (
                      <span key={i} style={styles.credBadge}>{cred}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.cta}>
        <Award size={48} color={'${dt.primary}'} style={{ marginBottom: '24px' }} />
        <h2 style={styles.ctaTitle}>${escapeQuotes(content.ctaHeadline)}</h2>
        <p style={styles.ctaText}>${escapeQuotes(content.ctaText)}</p>
        <Link to="${content.ctaPath}" style={styles.ctaBtn}>
          ${escapeQuotes(content.ctaButton)} <ChevronRight size={20} />
        </Link>
      </section>
    </div>
  );
}

const styles = {
  page: { background: '${dt.background}', minHeight: '100vh', fontFamily: "${dt.fontBody}" },
  hero: { textAlign: 'center', padding: '${dt.sectionPadding}', background: '${dt.primary}', color: '#fff' },
  heroTitle: { fontFamily: "${dt.fontHeading}", fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '700', marginBottom: '12px' },
  heroSubtitle: { fontSize: '1.15rem', opacity: 0.9 },
  teamSection: { padding: '${dt.sectionPadding}' },
  grid: { maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '${dt.gap}' },
  card: { background: '${dt.cardBg}', borderRadius: '${dt.borderRadius}', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid ${dt.border}' },
  avatarWrap: { height: '200px', background: '${dt.surface}', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  avatarImg: { width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover' },
  avatarInitials: { width: '120px', height: '120px', borderRadius: '50%', background: '${dt.primary}22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', fontWeight: '700', color: '${dt.primary}' },
  cardBody: { padding: '${dt.cardPadding}' },
  memberName: { fontFamily: "${dt.fontHeading}", fontSize: '1.35rem', fontWeight: '700', color: '${dt.text}', marginBottom: '4px' },
  memberRole: { color: '${dt.primary}', fontWeight: '600', marginBottom: '16px', fontSize: '0.95rem' },
  memberBio: { color: '${dt.textMuted}', lineHeight: 1.6, fontSize: '0.95rem', marginBottom: '16px' },
  credentials: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  credBadge: { padding: '4px 12px', background: '${dt.primary}12', color: '${dt.primary}', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  cta: { padding: '${dt.sectionPadding}', background: '${dt.cardBg}', textAlign: 'center' },
  ctaTitle: { fontFamily: "${dt.fontHeading}", fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: '700', color: '${dt.text}', marginBottom: '16px' },
  ctaText: { color: '${dt.textMuted}', fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px' },
  ctaBtn: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: '${dt.primary}', color: '#fff', padding: '${dt.buttonPadding}', borderRadius: '${dt.borderRadius}', fontWeight: '${dt.buttonWeight}', textDecoration: 'none' }
};
`;
}
/**
 * Generate Booking/Appointment Page
 * Full booking form with service selection, date/time picker, and API integration
 */
function generateBookingPage(industryId, variant, moodSliders, businessData, pageType) {
  const dt = getDesignTokens(moodSliders, businessData);
  const colors = getColors(moodSliders, businessData);

  // Industry-specific services for the booking dropdown
  const servicesByIndustry = {
    'salon-spa': [
      { name: 'Classic Haircut', duration: 30 },
      { name: 'Fade', duration: 45 },
      { name: 'Color & Highlights', duration: 90 },
      { name: 'Beard Trim', duration: 20 },
      { name: 'Hot Towel Shave', duration: 45 },
      { name: 'The Works (Cut + Beard + Towel)', duration: 75 },
      { name: 'Deep Conditioning Treatment', duration: 45 },
      { name: 'Blowout & Style', duration: 40 }
    ],
    'barbershop': [
      { name: 'Classic Haircut', duration: 30 },
      { name: 'Fade', duration: 45 },
      { name: 'Beard Trim', duration: 20 },
      { name: 'Hot Towel Shave', duration: 45 },
      { name: 'Beard Design', duration: 30 },
      { name: 'The Works (Cut + Beard + Towel)', duration: 75 },
      { name: 'Kids Cut', duration: 20 }
    ],
    'dental': [
      { name: 'Routine Cleaning', duration: 60 },
      { name: 'New Patient Exam', duration: 90 },
      { name: 'Teeth Whitening', duration: 60 },
      { name: 'Filling', duration: 45 },
      { name: 'Crown Consultation', duration: 30 },
      { name: 'Emergency Visit', duration: 30 },
      { name: 'Orthodontic Consultation', duration: 45 }
    ],
    'healthcare': [
      { name: 'Annual Physical', duration: 60 },
      { name: 'Sick Visit', duration: 30 },
      { name: 'Follow-Up Appointment', duration: 20 },
      { name: 'Lab Work', duration: 15 },
      { name: 'Vaccination', duration: 15 },
      { name: 'Wellness Consultation', duration: 45 },
      { name: 'Specialist Referral', duration: 30 }
    ],
    'yoga': [
      { name: 'Beginner Yoga Class', duration: 60 },
      { name: 'Vinyasa Flow', duration: 75 },
      { name: 'Hot Yoga', duration: 60 },
      { name: 'Private Session', duration: 60 },
      { name: 'Meditation Workshop', duration: 45 },
      { name: 'Restorative Yoga', duration: 75 },
      { name: 'Prenatal Yoga', duration: 60 }
    ],
    'fitness-gym': [
      { name: 'Personal Training Session', duration: 60 },
      { name: 'Group Fitness Class', duration: 45 },
      { name: 'Nutrition Consultation', duration: 30 },
      { name: 'Body Composition Assessment', duration: 30 },
      { name: 'Gym Orientation', duration: 45 },
      { name: 'Recovery Session', duration: 30 }
    ],
    'auto-shop': [
      { name: 'Oil Change', duration: 30 },
      { name: 'Tire Rotation', duration: 30 },
      { name: 'Brake Inspection', duration: 45 },
      { name: 'Full Diagnostic', duration: 60 },
      { name: 'A/C Service', duration: 60 },
      { name: 'State Inspection', duration: 30 }
    ],
    'law-firm': [
      { name: 'Free Initial Consultation', duration: 15 },
      { name: 'Case Evaluation', duration: 30 },
      { name: 'Legal Consultation', duration: 60 },
      { name: 'Contract Review', duration: 45 },
      { name: 'Estate Planning Session', duration: 60 },
      { name: 'Business Formation Consult', duration: 45 }
    ]
  };

  const services = servicesByIndustry[industryId] || [
    { name: 'Consultation', duration: 30 },
    { name: 'Standard Appointment', duration: 60 },
    { name: 'Extended Session', duration: 90 }
  ];

  const servicesJson = JSON.stringify(services);

  // Determine the booking module name from industry config
  const moduleNames = {
    'salon-spa': 'appointments', 'barbershop': 'appointments',
    'dental': 'appointments', 'healthcare': 'appointments',
    'yoga': 'bookings', 'fitness-gym': 'bookings',
    'auto-shop': 'appointments', 'law-firm': 'consultations',
    'real-estate': 'appointments', 'accounting': 'consultations',
    'saas': 'demos'
  };
  const moduleName = moduleNames[industryId] || 'appointments';

  const pageLabel = pageType === 'appointment' ? 'Appointment' : capitalize(pageType);

  return `/**
 * Booking Page - ${businessData.name}
 * Full booking form with date/time selection and API integration
 * Generated by Launchpad
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Mail, Phone, FileText, CheckCircle, ArrowRight, Loader } from 'lucide-react';
import { useApi } from '../hooks/useApi';

export default function BookPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    service: '', date: '', time: '', duration: 60,
    customer_name: '', customer_email: '', customer_phone: '', notes: ''
  });
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [error, setError] = useState('');
  const api = useApi();

  const services = ${servicesJson};

  // Get today's date in YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Fetch available slots when date changes
  useEffect(() => {
    if (!form.date) return;
    setLoadingSlots(true);
    setForm(f => ({ ...f, time: '' }));
    api.get('/api/${moduleName}/availability?date=' + form.date)
      .then(data => {
        setSlots(data.slots || []);
        setLoadingSlots(false);
      })
      .catch(() => {
        // Fallback slots if API isn't running
        const fallback = ['09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00'].map(t => ({ time: t, available: true }));
        setSlots(fallback);
        setLoadingSlots(false);
      });
  }, [form.date]);

  const handleServiceSelect = (svc) => {
    setForm(f => ({ ...f, service: svc.name, duration: svc.duration }));
    setStep(2);
  };

  const handleTimeSelect = (time) => {
    setForm(f => ({ ...f, time }));
    setStep(3);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await api.post('/api/${moduleName}', form);
      setConfirmation(res.booking || res);
      setStep(4);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    }
    setSubmitting(false);
  };

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // Confirmation screen
  if (step === 4 && confirmation) {
    return (
      <div style={styles.page}>
        <section style={styles.confirmSection}>
          <div style={styles.confirmCard}>
            <CheckCircle size={64} color="${colors.primary}" />
            <h1 style={styles.confirmTitle}>Booking Confirmed!</h1>
            <p style={styles.confirmRef}>Reference: <strong>{confirmation.reference_code}</strong></p>
            <div style={styles.confirmDetails}>
              <p><strong>Service:</strong> {confirmation.service}</p>
              <p><strong>Date:</strong> {confirmation.date}</p>
              <p><strong>Time:</strong> {confirmation.time}</p>
              <p><strong>Name:</strong> {confirmation.customer_name}</p>
            </div>
            <p style={styles.confirmNote}>You will receive a confirmation email shortly. Save your reference code to manage your booking.</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Book ${pageLabel === 'Book' ? 'an Appointment' : 'Your ' + pageLabel}</h1>
        <p style={styles.heroSubtitle}>Choose a service, pick a time, and you are all set</p>
      </section>

      {/* Progress Steps */}
      <div style={styles.progress}>
        {['Service', 'Date & Time', 'Your Info'].map((label, i) => (
          <div key={i} style={{ ...styles.progressStep, opacity: step > i ? 1 : 0.4 }}>
            <div style={{ ...styles.progressDot, background: step > i ? '${colors.primary}' : '${dt.border}' }}>{step > i + 1 ? '\\u2713' : i + 1}</div>
            <span style={styles.progressLabel}>{label}</span>
          </div>
        ))}
      </div>

      <main style={styles.main}>
        {error && <div style={styles.error}>{error}</div>}

        {/* Step 1: Service Selection */}
        {step >= 1 && (
          <section style={{ ...styles.stepSection, display: step === 1 ? 'block' : 'none' }}>
            <h2 style={styles.stepTitle}>Select a Service</h2>
            <div style={styles.serviceGrid}>
              {services.map((svc, i) => (
                <button key={i} onClick={() => handleServiceSelect(svc)}
                  style={{ ...styles.serviceBtn, border: form.service === svc.name ? '2px solid ${colors.primary}' : '1px solid ${dt.border}' }}>
                  <span style={styles.serviceName}>{svc.name}</span>
                  <span style={styles.serviceDuration}><Clock size={14} /> {svc.duration} min</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Step 2: Date & Time */}
        {step >= 2 && (
          <section style={{ ...styles.stepSection, display: step === 2 ? 'block' : 'none' }}>
            <button onClick={() => setStep(1)} style={styles.backBtn}>\\u2190 Change service: {form.service}</button>
            <h2 style={styles.stepTitle}>Pick a Date & Time</h2>
            <div style={styles.dateTimeGrid}>
              <div>
                <label style={styles.label}><Calendar size={16} /> Select Date</label>
                <input type="date" min={today} max={maxDate} value={form.date}
                  onChange={e => update('date', e.target.value)} style={styles.dateInput} />
              </div>
              {form.date && (
                <div>
                  <label style={styles.label}><Clock size={16} /> Available Times</label>
                  {loadingSlots ? (
                    <div style={styles.loading}><Loader size={20} /> Loading times...</div>
                  ) : (
                    <div style={styles.timeGrid}>
                      {slots.filter(s => s.available).map((slot, i) => (
                        <button key={i} onClick={() => handleTimeSelect(slot.time)}
                          style={{ ...styles.timeBtn, background: form.time === slot.time ? '${colors.primary}' : '${dt.cardBg}',
                            color: form.time === slot.time ? '#fff' : '${dt.text}' }}>
                          {slot.time}
                        </button>
                      ))}
                      {slots.filter(s => s.available).length === 0 && (
                        <p style={styles.noSlots}>No available times on this date. Please try another day.</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Step 3: Contact Info */}
        {step >= 3 && (
          <section style={{ ...styles.stepSection, display: step === 3 ? 'block' : 'none' }}>
            <button onClick={() => setStep(2)} style={styles.backBtn}>\\u2190 Change time: {form.date} at {form.time}</button>
            <h2 style={styles.stepTitle}>Your Information</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}><User size={16} /> Full Name *</label>
                <input type="text" required value={form.customer_name}
                  onChange={e => update('customer_name', e.target.value)}
                  placeholder="Your full name" style={styles.input} />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}><Mail size={16} /> Email *</label>
                <input type="email" required value={form.customer_email}
                  onChange={e => update('customer_email', e.target.value)}
                  placeholder="your@email.com" style={styles.input} />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}><Phone size={16} /> Phone</label>
                <input type="tel" value={form.customer_phone}
                  onChange={e => update('customer_phone', e.target.value)}
                  placeholder="(555) 123-4567" style={styles.input} />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}><FileText size={16} /> Notes</label>
                <textarea value={form.notes} onChange={e => update('notes', e.target.value)}
                  placeholder="Any special requests or notes..." rows={3} style={{ ...styles.input, resize: 'vertical' }} />
              </div>

              <div style={styles.summary}>
                <h3 style={styles.summaryTitle}>Booking Summary</h3>
                <p><strong>Service:</strong> {form.service} ({form.duration} min)</p>
                <p><strong>Date:</strong> {form.date}</p>
                <p><strong>Time:</strong> {form.time}</p>
              </div>

              <button type="submit" disabled={submitting} style={{ ...styles.submitBtn, opacity: submitting ? 0.7 : 1 }}>
                {submitting ? 'Booking...' : 'Confirm Booking'} {!submitting && <ArrowRight size={18} />}
              </button>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}

const styles = {
  page: { background: '${dt.background}', fontFamily: "${dt.fontBody}", minHeight: '100vh' },
  hero: { textAlign: 'center', padding: '100px 20px 48px', background: '${dt.surface}' },
  heroTitle: { fontSize: 'clamp(2rem, 5vw, 2.75rem)', fontFamily: "${dt.fontHeading}", fontWeight: '700', color: '${dt.text}', marginBottom: '12px', textTransform: '${dt.headlineStyle}' },
  heroSubtitle: { fontSize: '1.1rem', color: '${dt.textMuted}' },
  progress: { display: 'flex', justifyContent: 'center', gap: '48px', padding: '32px 20px', borderBottom: '1px solid ${dt.border}' },
  progressStep: { display: 'flex', alignItems: 'center', gap: '8px', transition: 'opacity 0.3s' },
  progressDot: { width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '14px' },
  progressLabel: { fontSize: '0.9rem', fontWeight: '600', color: '${dt.text}' },
  main: { maxWidth: '700px', margin: '0 auto', padding: '40px 20px 80px' },
  error: { background: '#FEE2E2', color: '#991B1B', padding: '12px 16px', borderRadius: '${dt.borderRadius}', marginBottom: '24px', fontSize: '0.95rem' },
  stepSection: { },
  stepTitle: { fontSize: '1.5rem', fontFamily: "${dt.fontHeading}", fontWeight: '600', color: '${dt.text}', marginBottom: '24px' },
  backBtn: { background: 'none', border: 'none', color: '${dt.primary}', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500', padding: '0', marginBottom: '16px', fontFamily: "${dt.fontBody}" },
  serviceGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' },
  serviceBtn: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderRadius: '${dt.borderRadius}', background: '${dt.cardBg}', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left', fontFamily: "${dt.fontBody}" },
  serviceName: { fontWeight: '600', color: '${dt.text}', fontSize: '0.95rem' },
  serviceDuration: { display: 'flex', alignItems: 'center', gap: '4px', color: '${dt.textMuted}', fontSize: '0.85rem' },
  dateTimeGrid: { display: 'grid', gap: '24px' },
  label: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: '600', color: '${dt.text}', marginBottom: '8px' },
  dateInput: { width: '100%', padding: '14px 16px', border: '1px solid ${dt.border}', borderRadius: '${dt.borderRadius}', fontSize: '1rem', fontFamily: "${dt.fontBody}", background: '${dt.inputBg}', color: '${dt.text}', boxSizing: 'border-box' },
  loading: { display: 'flex', alignItems: 'center', gap: '8px', color: '${dt.textMuted}', padding: '20px 0' },
  timeGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px' },
  timeBtn: { padding: '12px 8px', border: '1px solid ${dt.border}', borderRadius: '${dt.borderRadius}', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', fontFamily: "${dt.fontBody}", transition: 'all 0.2s' },
  noSlots: { color: '${dt.textMuted}', fontStyle: 'italic', padding: '16px 0' },
  form: { display: 'grid', gap: '20px' },
  fieldGroup: { },
  input: { width: '100%', padding: '14px 16px', border: '1px solid ${dt.border}', borderRadius: '${dt.borderRadius}', fontSize: '1rem', fontFamily: "${dt.fontBody}", background: '${dt.inputBg}', color: '${dt.text}', boxSizing: 'border-box' },
  summary: { background: '${dt.surface}', border: '1px solid ${dt.border}', borderRadius: '${dt.borderRadius}', padding: '20px', marginTop: '8px' },
  summaryTitle: { fontSize: '1.1rem', fontFamily: "${dt.fontHeading}", fontWeight: '600', color: '${dt.text}', marginBottom: '12px' },
  submitBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', background: '${dt.primary}', color: '#fff', padding: '${dt.buttonPadding}', borderRadius: '${dt.borderRadius}', fontWeight: '${dt.buttonWeight}', fontSize: '1.05rem', border: 'none', cursor: 'pointer', fontFamily: "${dt.fontBody}", textTransform: '${dt.buttonTransform}', marginTop: '8px' },
  confirmSection: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '40px 20px' },
  confirmCard: { textAlign: 'center', maxWidth: '500px', background: '${dt.cardBg}', border: '1px solid ${dt.border}', borderRadius: '${dt.borderRadius}', padding: '48px 32px', boxShadow: '${dt.shadow}' },
  confirmTitle: { fontSize: '2rem', fontFamily: "${dt.fontHeading}", fontWeight: '700', color: '${dt.text}', margin: '24px 0 8px' },
  confirmRef: { fontSize: '1.1rem', color: '${dt.primary}', marginBottom: '24px' },
  confirmDetails: { textAlign: 'left', background: '${dt.surface}', borderRadius: '${dt.borderRadius}', padding: '20px', marginBottom: '24px' },
  confirmNote: { fontSize: '0.9rem', color: '${dt.textMuted}', lineHeight: 1.6 }
};
`;
}

function generateOrderPage(industryId, variant, moodSliders, businessData, pageType) {
  const archetype = detectArchetype(businessData);
  const colors = getColors(moodSliders, businessData);
  const overrides = buildStyleOverrides(moodSliders, colors);
  return generateArchetypeOrderPage(archetype, { ...businessData, industry: industryId }, colors, overrides);
}

const generateMembershipPage = generateGenericPage;
const generatePricingPage = generateGenericPage;

// Features page (SaaS/ecommerce) uses technology services generator
function generateFeaturesPage(industryId, variant, moodSliders, businessData, pageType) {
  if (['saas', 'ecommerce'].includes(industryId)) {
    const colors = getColors(moodSliders, businessData);
    const overrides = buildStyleOverrides(moodSliders, colors);
    const arch = detectTechnologyArchetype({ ...businessData, industry: industryId });
    return generateTechnologyServices(arch, { ...businessData, industry: industryId }, colors, overrides);
  }
  return generateGenericPage(industryId, variant, moodSliders, businessData, pageType);
}

const generateListingsPage = generateGenericPage;

// Products page (ecommerce) also uses technology services
function generateProductsPage(industryId, variant, moodSliders, businessData, pageType) {
  return generateFeaturesPage(industryId, variant, moodSliders, businessData, pageType);
}

const generateQuotePage = generateGenericPage;
const generateAreasPage = generateGenericPage;
const generateSchedulePage = generateGenericPage;
const generateProgramsPage = generateGenericPage;
const generateAdmissionsPage = generateGenericPage;
const generateDemoPage = generateGenericPage;
const generateConsultationPage = generateBookingPage;
const generateValuationPage = generateGenericPage;
const generateCartPage = generateGenericPage;
const generateAccountPage = generateGenericPage;

// ============================================
// PUBLIC RESERVATIONS PAGE
// Based on 2024-2025 UX best practices research
// ============================================

/**
 * Generate Public Reservations Page
 * 3-step flow: Find Table → Your Details → Confirmation
 * Guest checkout with optional account creation after booking
 * Supports multiple visual styles: fine-dining, casual, modern, classic, cafe
 */
function generatePublicReservationsPage(industryId, variant, moodSliders, businessData, pageType) {
  const colors = getColors(moodSliders, businessData);
  const businessName = businessData.name || 'Our Business';

  // Determine reservation style based on industry + variant
  const styleMap = INDUSTRY_RESERVATION_STYLES[industryId] || {};
  const reservationStyle = businessData.reservationStyle || styleMap[variant] || 'modern';

  // Style-specific configurations
  const styleConfigs = {
    'fine-dining': {
      heroGradient: `linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)`,
      accentColor: '#d4af37',
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      headingFont: "'Cormorant Garamond', Georgia, serif",
      buttonRadius: '4px',
      cardBg: 'rgba(255,255,255,0.03)',
      cardBorder: '1px solid rgba(212,175,55,0.2)',
      inputBorder: '1px solid rgba(255,255,255,0.1)',
      trustBadgeBg: 'rgba(212,175,55,0.15)',
      progressBg: '#d4af37',
      tagline: 'Reserve Your Experience',
      ctaText: 'Request Reservation'
    },
    'casual': {
      heroGradient: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark || colors.primary} 100%)`,
      accentColor: colors.primary,
      fontFamily: "'Inter', -apple-system, sans-serif",
      headingFont: "'Inter', -apple-system, sans-serif",
      buttonRadius: '12px',
      cardBg: '#ffffff',
      cardBorder: 'none',
      inputBorder: '2px solid #e5e7eb',
      trustBadgeBg: 'rgba(255,255,255,0.2)',
      progressBg: colors.primary,
      tagline: 'Book a Table',
      ctaText: 'Find a Table'
    },
    'modern': {
      heroGradient: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark || colors.primary} 100%)`,
      accentColor: colors.primary,
      fontFamily: "'Inter', -apple-system, sans-serif",
      headingFont: "'Inter', -apple-system, sans-serif",
      buttonRadius: '10px',
      cardBg: '#ffffff',
      cardBorder: 'none',
      inputBorder: '2px solid #e5e7eb',
      trustBadgeBg: 'rgba(255,255,255,0.15)',
      progressBg: colors.primary,
      tagline: 'Reserve a Table',
      ctaText: 'Continue'
    },
    'classic': {
      heroGradient: `linear-gradient(135deg, #2d3436 0%, #1e272e 100%)`,
      accentColor: '#8b0000',
      fontFamily: "'Georgia', serif",
      headingFont: "'Playfair Display', Georgia, serif",
      buttonRadius: '6px',
      cardBg: '#faf9f7',
      cardBorder: '1px solid #e8e4df',
      inputBorder: '1px solid #d4cfc7',
      trustBadgeBg: 'rgba(139,0,0,0.1)',
      progressBg: '#8b0000',
      tagline: 'Make a Reservation',
      ctaText: 'Reserve Table'
    },
    'cafe': {
      heroGradient: `linear-gradient(135deg, #f5f0e8 0%, #ebe4d8 100%)`,
      accentColor: '#6f4e37',
      fontFamily: "'Inter', -apple-system, sans-serif",
      headingFont: "'Playfair Display', Georgia, serif",
      buttonRadius: '8px',
      cardBg: '#ffffff',
      cardBorder: '1px solid #e8e4df',
      inputBorder: '1px solid #d4cfc7',
      trustBadgeBg: 'rgba(111,78,55,0.1)',
      progressBg: '#6f4e37',
      tagline: 'Reserve a Spot',
      ctaText: 'Book Table',
      heroTextColor: '#2d2a26',
      walkInMessage: true
    }
  };

  const config = styleConfigs[reservationStyle] || styleConfigs['modern'];
  const heroTextColor = config.heroTextColor || '#ffffff';

  return `/**
 * Reservations Page - ${businessName}
 * Public booking - no account required
 * API-Connected: Uses useReservations hook for real-time availability and booking.
 * Generated by Launchpad
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, ChevronRight, ChevronLeft, Check, Phone, Mail, User, MessageSquare, CalendarPlus, Star, RefreshCw, AlertCircle } from 'lucide-react';
import { useReservations } from '../hooks/useReservations';
${businessData.enablePortal ? "import { useAuth } from '../components/AuthContext';" : ''}

export default function ReservationsPage() {
  ${businessData.enablePortal ? "const { user, isAuthenticated } = useAuth();" : "const user = null; const isAuthenticated = false;"}

  const [step, setStep] = useState(1);
  const [partySize, setPartySize] = useState(2);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', specialRequests: '', smsReminder: true });
  const [errors, setErrors] = useState({});
  const [isSearching, setIsSearching] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState('');

  // Use the reservations hook for API integration
  const {
    createReservation,
    checkAvailability,
    loading: apiLoading,
    error: apiError,
    availability,
    clearError
  } = useReservations();

  // Auto-fill form for logged-in users
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone
      }));
    }
  }, [user]);

  // Generate next 14 days
  const dates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      dateStr: date.toISOString().split('T')[0],
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      isToday: i === 0,
      isTomorrow: i === 1
    };
  });

  // Time slots by service period
  const timeSlots = {
    breakfast: ['8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM'],
    lunch: ['11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM'],
    dinner: ['5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM']
  };

  // Demo: some slots unavailable
  const unavailableSlots = ['12:00 PM', '12:30 PM', '7:00 PM', '7:30 PM'];
  const isSlotAvailable = (time) => !unavailableSlots.includes(time);

  const handleSearchTimes = async () => {
    if (!selectedDate) return;
    setIsSearching(true);

    try {
      // Check availability via API
      await checkAvailability(selectedDate);
    } catch (err) {
      console.warn('Availability check failed:', err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\\S+@\\S+\\.\\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = async () => {
    if (!validateForm()) return;

    try {
      // Try to create reservation via API
      const result = await createReservation({
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        date: selectedDate,
        time: convertTo24Hour(selectedTime).substring(0, 5), // HH:MM format
        partySize: partySize,
        specialRequests: formData.specialRequests
      });

      setConfirmationNumber(result.booking?.reference_code || result.reference_code || 'N/A');
      setConfirmed(true);
    } catch (err) {
      // Show error to user instead of faking success
      console.error('Reservation failed:', err.message);
      setErrors(prev => ({ ...prev, submit: err.message || 'Failed to create reservation. Please try again.' }));
    }
  };

  const formatSelectedDate = () => {
    if (!selectedDate) return '';
    const d = dates.find(d => d.dateStr === selectedDate);
    if (!d) return '';
    return \`\${d.day}, \${d.month} \${d.dayNum}\`;
  };

  const getCalendarUrl = (type) => {
    const dateObj = new Date(selectedDate + 'T' + convertTo24Hour(selectedTime));
    const endDate = new Date(dateObj.getTime() + 2 * 60 * 60 * 1000);
    const title = encodeURIComponent(\`Reservation at ${businessName.replace(/`/g, "\\`")}\`);
    const details = encodeURIComponent(\`Party of \${partySize}\\\\nConfirmation: \${confirmationNumber}\`);

    if (type === 'google') {
      const start = dateObj.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const end = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      return \`https://calendar.google.com/calendar/render?action=TEMPLATE&text=\${title}&dates=\${start}/\${end}&details=\${details}\`;
    }
    return '#';
  };

  const convertTo24Hour = (time12h) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (modifier === 'PM' && hours !== '12') hours = parseInt(hours, 10) + 12;
    if (modifier === 'AM' && hours === '12') hours = '00';
    return \`\${hours}:\${minutes}:00\`;
  };

  // Step 3: Confirmation
  if (confirmed) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.successCard}>
            <div style={styles.successIcon}><Check size={36} /></div>
            <h1 style={styles.successTitle}>You're Booked!</h1>
            <p style={styles.confirmationNum}>Confirmation #{confirmationNumber}</p>

            <div style={styles.summaryBox}>
              <div style={styles.summaryItem}><Calendar size={18} /> {formatSelectedDate()}</div>
              <div style={styles.summaryItem}><Clock size={18} /> {selectedTime}</div>
              <div style={styles.summaryItem}><Users size={18} /> {partySize} {partySize === 1 ? 'guest' : 'guests'}</div>
            </div>

            <p style={styles.confirmText}>A confirmation has been sent to <strong>{formData.email}</strong></p>
            {formData.smsReminder && <p style={styles.reminderText}>You'll receive an SMS reminder 24 hours before your reservation.</p>}

            <div style={styles.calendarButtons}>
              <a href={getCalendarUrl('google')} target="_blank" rel="noopener noreferrer" style={styles.calendarBtn}>
                <CalendarPlus size={18} /> Add to Google Calendar
              </a>
            </div>

            <div style={styles.policyNote}>
              <strong>Cancellation Policy:</strong> Please cancel at least 4 hours in advance. No-shows may affect future bookings.
            </div>

            <div style={styles.accountPrompt}>
              <h3>Save your details for next time?</h3>
              <p>Create an account for faster booking, reservation history, and exclusive offers.</p>
              <Link to="/register" style={styles.createAccountBtn}>Create Account</Link>
              <Link to="/" style={styles.homeLink}>Return to Home</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>\${config.tagline}</h1>
          <p style={styles.heroSubtitle}>Book your experience at ${businessName}</p>
          {config.walkInMessage && <p style={styles.walkInNote}>Walk-ins welcome · Reservations recommended for groups</p>}
          <div style={styles.trustBadge}><Star size={16} fill="#fbbf24" color="#fbbf24" /> 4.8 rating · 500+ reservations this month</div>
        </div>
      </div>

      <div style={styles.container}>
        {/* Progress Bar */}
        <div style={styles.progressBar}>
          <div style={{...styles.progressStep, ...(step >= 1 ? styles.progressStepActive : {})}}>
            <span style={styles.stepNum}>1</span>
            <span style={styles.stepLabel}>Find a Table</span>
          </div>
          <div style={{...styles.progressLine, ...(step >= 2 ? styles.progressLineActive : {})}} />
          <div style={{...styles.progressStep, ...(step >= 2 ? styles.progressStepActive : {})}}>
            <span style={styles.stepNum}>2</span>
            <span style={styles.stepLabel}>Your Details</span>
          </div>
          <div style={{...styles.progressLine, ...(step >= 3 ? styles.progressLineActive : {})}} />
          <div style={{...styles.progressStep, ...(step >= 3 ? styles.progressStepActive : {})}}>
            <span style={styles.stepNum}>3</span>
            <span style={styles.stepLabel}>Confirm</span>
          </div>
        </div>

        {/* Step 1: Find a Table */}
        {step === 1 && (
          <div style={styles.card}>
            {/* Party Size */}
            <div style={styles.section}>
              <label style={styles.sectionLabel}><Users size={18} /> Party Size</label>
              <div style={styles.partySizeGrid}>
                {[1, 2, 3, 4, 5, 6].map(size => (
                  <button key={size} onClick={() => setPartySize(size)} style={{...styles.partyBtn, ...(partySize === size ? styles.partyBtnActive : {})}}>
                    {size}
                  </button>
                ))}
                <button onClick={() => setPartySize(7)} style={{...styles.partyBtn, ...styles.partyBtnLarge, ...(partySize >= 7 ? styles.partyBtnActive : {})}}>
                  7+
                </button>
              </div>
              {partySize >= 7 && (
                <p style={styles.largePartyNote}>For parties of 7+, we may contact you to confirm availability and discuss menu options.</p>
              )}
            </div>

            {/* Date Selection */}
            <div style={styles.section}>
              <label style={styles.sectionLabel}><Calendar size={18} /> Select Date</label>
              <div style={styles.dateScroll}>
                {dates.map(d => (
                  <button key={d.dateStr} onClick={() => { setSelectedDate(d.dateStr); setSelectedTime(null); }} style={{...styles.dateCard, ...(selectedDate === d.dateStr ? styles.dateCardActive : {})}}>
                    <span style={styles.dateLabel}>{d.isToday ? 'Today' : d.isTomorrow ? 'Tomorrow' : d.day}</span>
                    <span style={styles.dateNum}>{d.dayNum}</span>
                    <span style={styles.dateMonth}>{d.month}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div style={styles.section}>
                <label style={styles.sectionLabel}><Clock size={18} /> Select Time</label>
                {isSearching ? (
                  <div style={styles.searching}>Checking availability...</div>
                ) : (
                  <>
                    {Object.entries(timeSlots).map(([period, times]) => (
                      <div key={period} style={styles.timePeriod}>
                        <span style={styles.periodLabel}>{period.charAt(0).toUpperCase() + period.slice(1)}</span>
                        <div style={styles.timeGrid}>
                          {times.map(time => {
                            const available = isSlotAvailable(time);
                            return (
                              <button
                                key={time}
                                onClick={() => available && setSelectedTime(time)}
                                disabled={!available}
                                style={{...styles.timeSlot, ...(selectedTime === time ? styles.timeSlotActive : {}), ...(!available ? styles.timeSlotUnavailable : {})}}
                              >
                                {time}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    {unavailableSlots.length > 0 && selectedTime === null && (
                      <p style={styles.availabilityNote}>Some times are fully booked. Select an available time above.</p>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Continue Button */}
            <button onClick={() => setStep(2)} disabled={!selectedDate || !selectedTime} style={{...styles.continueBtn, ...(!selectedDate || !selectedTime ? styles.continueBtnDisabled : {})}}>
              Continue <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Step 2: Your Details */}
        {step === 2 && (
          <div style={styles.card}>
            <div style={styles.miniSummary}>
              <span><Users size={16} /> {partySize}</span>
              <span><Calendar size={16} /> {formatSelectedDate()}</span>
              <span><Clock size={16} /> {selectedTime}</span>
              <button onClick={() => setStep(1)} style={styles.changeBtn}>Change</button>
            </div>

            <div style={styles.formSection}>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}><User size={16} /> Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Your full name" style={{...styles.input, ...(errors.name ? styles.inputError : {})}} />
                {errors.name && <span style={styles.errorText}>{errors.name}</span>}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}><Mail size={16} /> Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="you@example.com" style={{...styles.input, ...(errors.email ? styles.inputError : {})}} />
                {errors.email && <span style={styles.errorText}>{errors.email}</span>}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}><Phone size={16} /> Phone *</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="(555) 123-4567" style={{...styles.input, ...(errors.phone ? styles.inputError : {})}} />
                {errors.phone && <span style={styles.errorText}>{errors.phone}</span>}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}><MessageSquare size={16} /> Special Requests (optional)</label>
                <textarea name="specialRequests" value={formData.specialRequests} onChange={handleInputChange} placeholder="Allergies, high chair, wheelchair access, birthday celebration..." style={styles.textarea} />
              </div>

              <label style={styles.checkboxLabel}>
                <input type="checkbox" name="smsReminder" checked={formData.smsReminder} onChange={handleInputChange} style={styles.checkbox} />
                Send me an SMS reminder before my reservation
              </label>
            </div>

            {errors.submit && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '0.9rem', marginBottom: '16px' }}>
                <AlertCircle size={16} /> {errors.submit}
              </div>
            )}

            <div style={styles.actionRow}>
              <button onClick={() => setStep(1)} style={styles.backBtn}><ChevronLeft size={18} /> Back</button>
              <button onClick={handleConfirm} disabled={apiLoading} style={{...styles.confirmBtn, opacity: apiLoading ? 0.7 : 1}}>{apiLoading ? 'Submitting...' : 'Confirm Reservation'}</button>
            </div>

            <p style={styles.policyText}>By confirming, you agree to our cancellation policy. Please arrive on time; tables are held for 15 minutes.</p>
          </div>
        )}
      </div>

      {/* Sticky Mobile CTA */}
      {step === 1 && selectedDate && selectedTime && (
        <div style={styles.stickyBar}>
          <div style={styles.stickyInfo}>
            <strong>{partySize} guests</strong> · {formatSelectedDate()} · {selectedTime}
          </div>
          <button onClick={() => setStep(2)} style={styles.stickyCta}>Continue</button>
        </div>
      )}
    </div>
  );
}

const config = ${JSON.stringify(config)};
const styles = {
  page: { minHeight: '100vh', background: config.heroTextColor ? '#faf9f7' : '#f8fafc', paddingBottom: '100px', fontFamily: config.fontFamily },
  hero: { background: config.heroGradient, padding: '48px 20px', color: config.heroTextColor || '#fff', textAlign: 'center' },
  heroContent: { maxWidth: '600px', margin: '0 auto' },
  heroTitle: { fontSize: '2rem', fontWeight: '700', marginBottom: '8px', fontFamily: config.headingFont },
  heroSubtitle: { fontSize: '1.1rem', opacity: 0.9, marginBottom: '12px' },
  walkInNote: { fontSize: '0.9rem', opacity: 0.8, marginBottom: '12px' },
  trustBadge: { display: 'inline-flex', alignItems: 'center', gap: '6px', background: config.trustBadgeBg, padding: '8px 16px', borderRadius: '20px', fontSize: '0.9rem' },
  container: { maxWidth: '600px', margin: '0 auto', padding: '24px 20px' },
  progressBar: { display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', gap: '0' },
  progressStep: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', opacity: 0.4 },
  progressStepActive: { opacity: 1 },
  stepNum: { width: '32px', height: '32px', borderRadius: '50%', background: config.progressBg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '0.9rem' },
  stepLabel: { fontSize: '0.75rem', fontWeight: '500', color: '#374151' },
  progressLine: { width: '40px', height: '2px', background: '#e5e7eb', margin: '0 8px' },
  progressLineActive: { background: config.progressBg },
  card: { background: config.cardBg, borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: config.cardBorder },
  section: { marginBottom: '24px' },
  sectionLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '12px', fontFamily: config.headingFont },
  partySizeGrid: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  partyBtn: { width: '48px', height: '48px', border: config.inputBorder, borderRadius: config.buttonRadius, background: '#fff', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s' },
  partyBtnActive: { borderColor: config.accentColor, background: config.accentColor, color: '#fff' },
  partyBtnLarge: { width: 'auto', padding: '0 16px' },
  largePartyNote: { marginTop: '12px', padding: '12px', background: '#fef3c7', color: '#92400e', borderRadius: '8px', fontSize: '0.85rem' },
  dateScroll: { display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', scrollSnapType: 'x mandatory' },
  dateCard: { minWidth: '72px', padding: '12px 8px', border: config.inputBorder, borderRadius: config.buttonRadius, background: '#fff', textAlign: 'center', cursor: 'pointer', flexShrink: 0, scrollSnapAlign: 'start', transition: 'all 0.15s' },
  dateCardActive: { borderColor: config.accentColor, background: config.accentColor, color: '#fff' },
  dateLabel: { display: 'block', fontSize: '0.7rem', fontWeight: '500', textTransform: 'uppercase', marginBottom: '4px', opacity: 0.8 },
  dateNum: { display: 'block', fontSize: '1.5rem', fontWeight: '700', lineHeight: 1 },
  dateMonth: { display: 'block', fontSize: '0.75rem', marginTop: '2px' },
  timePeriod: { marginBottom: '16px' },
  periodLabel: { display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px' },
  timeGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px' },
  timeSlot: { padding: '12px 8px', border: config.inputBorder, borderRadius: config.buttonRadius, background: '#fff', fontSize: '0.9rem', fontWeight: '500', cursor: 'pointer', transition: 'all 0.15s', minHeight: '44px' },
  timeSlotActive: { borderColor: config.accentColor, background: config.accentColor, color: '#fff' },
  timeSlotUnavailable: { background: '#f3f4f6', color: '#9ca3af', borderColor: '#f3f4f6', cursor: 'not-allowed', textDecoration: 'line-through' },
  searching: { textAlign: 'center', padding: '40px', color: '#6b7280' },
  availabilityNote: { marginTop: '12px', fontSize: '0.85rem', color: '#6b7280' },
  continueBtn: { width: '100%', padding: '16px', background: config.accentColor, color: '#fff', border: 'none', borderRadius: config.buttonRadius, fontSize: '1rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' },
  continueBtnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  miniSummary: { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#f9fafb', borderRadius: '10px', marginBottom: '24px', flexWrap: 'wrap', fontSize: '0.9rem', color: '#374151' },
  changeBtn: { marginLeft: 'auto', color: config.accentColor, background: 'none', border: 'none', fontWeight: '500', cursor: 'pointer', fontSize: '0.9rem' },
  formSection: { display: 'flex', flexDirection: 'column', gap: '16px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  inputLabel: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: '500', color: '#374151' },
  input: { padding: '14px 16px', border: config.inputBorder, borderRadius: config.buttonRadius, fontSize: '1rem', outline: 'none', transition: 'border-color 0.15s' },
  inputError: { borderColor: '#ef4444' },
  errorText: { color: '#ef4444', fontSize: '0.8rem' },
  textarea: { padding: '14px 16px', border: config.inputBorder, borderRadius: config.buttonRadius, fontSize: '1rem', minHeight: '80px', resize: 'vertical', outline: 'none' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#374151', cursor: 'pointer' },
  checkbox: { width: '20px', height: '20px', accentColor: config.accentColor },
  actionRow: { display: 'flex', gap: '12px', marginTop: '24px' },
  backBtn: { display: 'flex', alignItems: 'center', gap: '4px', padding: '14px 20px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: config.buttonRadius, fontSize: '0.95rem', fontWeight: '500', cursor: 'pointer' },
  confirmBtn: { flex: 1, padding: '16px', background: config.accentColor, color: '#fff', border: 'none', borderRadius: config.buttonRadius, fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
  policyText: { marginTop: '16px', fontSize: '0.8rem', color: '#6b7280', textAlign: 'center' },
  stickyBar: { position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', padding: '12px 20px', boxShadow: '0 -4px 12px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', zIndex: 100 },
  stickyInfo: { fontSize: '0.9rem', color: '#374151' },
  stickyCta: { padding: '12px 24px', background: config.accentColor, color: '#fff', border: 'none', borderRadius: config.buttonRadius, fontWeight: '600', cursor: 'pointer' },
  successCard: { background: '#fff', borderRadius: '16px', padding: '32px 24px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  successIcon: { width: '72px', height: '72px', background: '#d1fae5', color: '#059669', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' },
  successTitle: { fontSize: '1.75rem', fontWeight: '700', color: '#1f2937', marginBottom: '8px' },
  confirmationNum: { fontSize: '1.1rem', color: config.accentColor, fontWeight: '600', marginBottom: '24px' },
  summaryBox: { display: 'flex', justifyContent: 'center', gap: '24px', padding: '20px', background: '#f9fafb', borderRadius: '12px', marginBottom: '20px', flexWrap: 'wrap' },
  summaryItem: { display: 'flex', alignItems: 'center', gap: '8px', color: '#374151', fontWeight: '500' },
  confirmText: { color: '#374151', marginBottom: '8px' },
  reminderText: { color: '#6b7280', fontSize: '0.9rem', marginBottom: '20px' },
  calendarButtons: { marginBottom: '24px' },
  calendarBtn: { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: '#f3f4f6', color: '#374151', borderRadius: '8px', textDecoration: 'none', fontWeight: '500', fontSize: '0.9rem' },
  policyNote: { padding: '16px', background: '#fef3c7', borderRadius: '10px', fontSize: '0.85rem', color: '#92400e', marginBottom: '24px', textAlign: 'left' },
  accountPrompt: { padding: '24px', background: '#f0f9ff', borderRadius: '12px', textAlign: 'center' },
  createAccountBtn: { display: 'inline-block', marginTop: '12px', padding: '12px 32px', background: config.accentColor, color: '#fff', borderRadius: config.buttonRadius, textDecoration: 'none', fontWeight: '600' },
  homeLink: { display: 'block', marginTop: '12px', color: config.accentColor, textDecoration: 'none', fontWeight: '500' }
};
`;
}

/**
 * Generate ChatWidget component for portal customers
 */
function generateChatWidget(primaryColor) {
  return `/**
 * ChatWidget - Floating customer chat
 * Generated by Launchpad
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';

const API = import.meta.env.VITE_API_URL || '';

export default function ChatWidget() {
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef(null);

  const fetchConversation = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(\`\${API}/api/chat/conversations/\${user.id}\`);
      const data = await res.json();
      if (data.success && data.conversation) {
        setMessages(data.conversation.messages || []);
      }
    } catch (e) { console.error('Chat fetch error:', e); }
  }, [user?.id]);

  useEffect(() => {
    if (isAuthenticated && user?.id) fetchConversation();
  }, [isAuthenticated, user?.id, fetchConversation]);

  // SSE for real-time updates
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    const es = new EventSource(\`\${API}/api/chat/events\`);
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'chat_update' && String(data.customerId) === String(user.id)) {
          fetchConversation().then(() => {
            if (!open) setUnread(u => u + 1);
          });
        }
      } catch {}
    };
    return () => es.close();
  }, [isAuthenticated, user?.id, open, fetchConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleOpen = () => {
    setOpen(true);
    setUnread(0);
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(\`\${API}/api/chat/send\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: user.id,
          customerName: user.name || user.full_name || 'Customer',
          customerEmail: user.email,
          sender: 'customer',
          text: input.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessages(data.conversation.messages || []);
        setInput('');
      }
    } catch (e) { console.error('Send error:', e); }
    setSending(false);
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Floating bubble */}
      {!open && (
        <button onClick={handleOpen} style={styles.bubble}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          {unread > 0 && <span style={styles.badge}>{unread}</span>}
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div style={styles.panel}>
          <div style={styles.header}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>Chat with us</span>
            <button onClick={() => setOpen(false)} style={styles.closeBtn}>&times;</button>
          </div>

          <div style={styles.messagesArea}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: '#9ca3af', padding: '40px 16px', fontSize: 14 }}>
                Send us a message and we'll get back to you!
              </div>
            )}
            {messages.map(m => (
              <div key={m.id} style={{
                display: 'flex',
                justifyContent: m.sender === 'customer' ? 'flex-end' : 'flex-start',
                marginBottom: 8
              }}>
                <div style={{
                  maxWidth: '80%',
                  padding: '8px 14px',
                  borderRadius: 14,
                  fontSize: 14,
                  lineHeight: 1.4,
                  ...(m.sender === 'customer'
                    ? { background: '${primaryColor}', color: '#fff', borderBottomRightRadius: 4 }
                    : m.sender === 'system'
                    ? { background: '#f3f4f6', color: '#6b7280', fontStyle: 'italic', borderBottomLeftRadius: 4 }
                    : { background: '#fff', border: '1px solid #e5e7eb', color: '#111827', borderBottomLeftRadius: 4 })
                }}>
                  {m.sender === 'admin' && <div style={{ fontSize: 11, fontWeight: 600, color: '${primaryColor}', marginBottom: 2 }}>Support</div>}
                  {m.text}
                  <div style={{ fontSize: 10, marginTop: 4, opacity: 0.7, textAlign: m.sender === 'customer' ? 'right' : 'left' }}>
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div style={styles.inputArea}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              style={styles.input}
            />
            <button onClick={sendMessage} disabled={sending || !input.trim()} style={{
              ...styles.sendBtn,
              opacity: (sending || !input.trim()) ? 0.5 : 1
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  bubble: {
    position: 'fixed',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: '${primaryColor}',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
    zIndex: 1000,
    transition: 'transform 0.2s'
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    background: '#ef4444',
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    width: 22,
    height: 22,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #fff'
  },
  panel: {
    position: 'fixed',
    bottom: 24,
    right: 24,
    width: 380,
    height: 520,
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 1000
  },
  header: {
    padding: '16px 20px',
    background: '${primaryColor}',
    color: '#fff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: 22,
    cursor: 'pointer',
    lineHeight: 1,
    padding: 0
  },
  messagesArea: {
    flex: 1,
    overflowY: 'auto',
    padding: 16,
    background: '#f9fafb'
  },
  inputArea: {
    display: 'flex',
    gap: 8,
    padding: 12,
    borderTop: '1px solid #e5e7eb',
    background: '#fff'
  },
  input: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: 20,
    border: '1px solid #d1d5db',
    fontSize: 14,
    outline: 'none'
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: '${primaryColor}',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};
`;
}

// ============================================
// PORTAL PAGE GENERATORS
// ============================================

/**
 * Generate a portal page (login, register, dashboard, profile, rewards)
 */
function generatePortalPage(pageType, businessData, colors) {
  const generators = {
    login: generateLoginPage,
    register: generateRegisterPage,
    dashboard: generateDashboardPage,
    profile: generateProfilePage,
    rewards: generateRewardsPage,
    'my-reservations': generateReservationsPage,
    'order-history': generateOrderHistoryPage
  };

  const generator = generators[pageType];
  if (!generator) {
    throw new Error(`Unknown portal page type: ${pageType}`);
  }
  return generator(businessData, colors);
}

/**
 * Generate Login Page
 */
function generateLoginPage(businessData, colors) {
  return `/**
 * Login Page - ${businessData.name}
 * Generated by Launchpad
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <h1 style={styles.title}>Welcome Back</h1>
            <p style={styles.subtitle}>Sign in to your account</p>
          </div>

          <div style={styles.demoBanner}>
            Demo: demo@demo.com / admin123
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                placeholder="you@example.com"
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                placeholder="••••••••"
                required
              />
            </div>

            <div style={styles.options}>
              <label style={styles.remember}>
                <input type="checkbox" /> Remember me
              </label>
              <Link to="/forgot-password" style={styles.forgot}>Forgot password?</Link>
            </div>

            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <button
              type="button"
              onClick={() => { setEmail('demo@demo.com'); setPassword('admin123'); }}
              style={styles.demoBtn}
            >
              Fill Demo Credentials
            </button>
          </form>

          <div style={styles.footer}>
            <p style={styles.footerText}>
              Don't have an account? <Link to="/register" style={styles.link}>Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  container: { width: '100%', maxWidth: '400px' },
  card: { background: '#fff', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  header: { textAlign: 'center', marginBottom: '32px' },
  title: { fontSize: '1.75rem', fontWeight: '700', color: '#1f2937', marginBottom: '8px' },
  subtitle: { color: '#6b7280', fontSize: '0.95rem' },
  demoBanner: { background: '#e0f2fe', color: '#0369a1', padding: '12px 16px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '24px', textAlign: 'center' },
  error: { background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '24px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '0.9rem', fontWeight: '500', color: '#374151' },
  input: { padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' },
  options: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' },
  remember: { display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', cursor: 'pointer' },
  forgot: { color: '${colors.primary}', textDecoration: 'none', fontWeight: '500' },
  submitBtn: { padding: '14px', background: '${colors.primary}', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', transition: 'opacity 0.2s' },
  demoBtn: { padding: '12px', background: 'transparent', color: '${colors.primary}', border: '2px solid ${colors.primary}', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '500', cursor: 'pointer' },
  footer: { marginTop: '24px', textAlign: 'center' },
  footerText: { color: '#6b7280', fontSize: '0.9rem' },
  link: { color: '${colors.primary}', textDecoration: 'none', fontWeight: '500' }
};
`;
}

/**
 * Generate Register Page
 */
function generateRegisterPage(businessData, colors) {
  return `/**
 * Register Page - ${businessData.name}
 * Generated by Launchpad
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, testMode } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <h1 style={styles.title}>Create Account</h1>
            <p style={styles.subtitle}>Join ${escapeQuotes(businessData.name)} today</p>
          </div>

          {testMode && (
            <div style={styles.testBanner}>
              🧪 Test Mode - Registration creates a local test account
            </div>
          )}

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={styles.input}
                placeholder="John Doe"
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={styles.input}
                placeholder="you@example.com"
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Phone (optional)</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                style={styles.input}
                placeholder="(555) 123-4567"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                style={styles.input}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                style={styles.input}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div style={styles.footer}>
            <p style={styles.footerText}>
              Already have an account? <Link to="/login" style={styles.link}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  container: { width: '100%', maxWidth: '400px' },
  card: { background: '#fff', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  header: { textAlign: 'center', marginBottom: '32px' },
  title: { fontSize: '1.75rem', fontWeight: '700', color: '#1f2937', marginBottom: '8px' },
  subtitle: { color: '#6b7280', fontSize: '0.95rem' },
  demoBanner: { background: '#e0f2fe', color: '#0369a1', padding: '12px 16px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '24px', textAlign: 'center' },
  error: { background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '24px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '0.9rem', fontWeight: '500', color: '#374151' },
  input: { padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' },
  submitBtn: { padding: '14px', background: '${colors.primary}', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', marginTop: '8px' },
  footer: { marginTop: '24px', textAlign: 'center' },
  footerText: { color: '#6b7280', fontSize: '0.9rem' },
  link: { color: '${colors.primary}', textDecoration: 'none', fontWeight: '500' }
};
`;
}

/**
 * Generate Dashboard Page - Customer Portal Home
 * "What can I do in the next 30 seconds?" - Reorder, Order, Reserve, Use Rewards
 */
function generateDashboardPage(businessData, colors) {
  const ind = businessData.industry || 'restaurant';
  // Industry-aware dashboard data
  const isFood = ['pizza-restaurant', 'steakhouse', 'coffee-cafe', 'restaurant', 'bakery'].includes(ind);
  const isSalon = ['salon-spa', 'barbershop'].includes(ind);
  const isFitness = ['fitness-gym', 'yoga'].includes(ind);
  const isHealth = ['dental', 'healthcare'].includes(ind);
  const isProfessional = ['law-firm'].includes(ind);
  const isRealEstate = ['real-estate'].includes(ind);
  const isTrade = ['plumber', 'cleaning', 'auto-shop'].includes(ind);
  const isTech = ['saas', 'ecommerce'].includes(ind);
  const isSchool = ['school'].includes(ind);

  // Industry-specific reward names
  let nextRewardName = 'Free Medium Drink';
  let recentLabel = 'Order Again';
  let recentLink = '/order-history';
  let bookingLabel = 'Upcoming Reservation';
  let bookingManageLink = '/my-reservations';
  let recentItems, primaryActionsCode;

  if (isSalon) {
    nextRewardName = 'Free Blowout';
    recentLabel = 'Recent Appointments';
    recentLink = '/my-appointments';
    bookingLabel = 'Upcoming Appointment';
    bookingManageLink = '/my-appointments';
    recentItems = `[
      { id: 101, date: '2024-12-15', items: ['Haircut & Style', 'Deep Conditioning'], total: 85.00 },
      { id: 102, date: '2024-12-01', items: ['Color Touch-Up', 'Blow Dry'], total: 120.00 }
    ]`;
    primaryActionsCode = `[
    { label: 'Book Now', path: '/book', Icon: Calendar, primary: true },
    { label: 'My Appointments', path: '/my-appointments', Icon: Clock },
    { label: 'Use Reward', path: '/rewards', Icon: Gift },
    { label: 'Services', path: '/services', Icon: Star }
  ]`;
  } else if (isFitness) {
    nextRewardName = 'Free Personal Training Session';
    recentLabel = 'Recent Classes';
    recentLink = '/schedule';
    bookingLabel = 'Next Class';
    bookingManageLink = '/schedule';
    recentItems = `[
      { id: 101, date: '2024-12-15', items: ['HIIT Blast', 'Yoga Flow'], total: 0 },
      { id: 102, date: '2024-12-12', items: ['Spin Class', 'Core & Stretch'], total: 0 }
    ]`;
    primaryActionsCode = `[
    { label: 'Book Class', path: '/book-class', Icon: Calendar, primary: true },
    { label: 'Schedule', path: '/schedule', Icon: Clock },
    { label: 'Use Reward', path: '/rewards', Icon: Gift },
    { label: 'Programs', path: '/programs', Icon: Star }
  ]`;
  } else if (isHealth) {
    nextRewardName = 'Free Consultation';
    recentLabel = 'Recent Visits';
    recentLink = '/my-appointments';
    bookingLabel = 'Upcoming Appointment';
    bookingManageLink = '/my-appointments';
    recentItems = `[
      { id: 101, date: '2024-12-15', items: ['Regular Checkup'], total: 150.00 },
      { id: 102, date: '2024-11-20', items: ['Follow-up Visit'], total: 75.00 }
    ]`;
    primaryActionsCode = `[
    { label: 'Book Appointment', path: '/book', Icon: Calendar, primary: true },
    { label: 'My Appointments', path: '/my-appointments', Icon: Clock },
    { label: 'Messages', path: '/messages', Icon: Star },
    { label: 'Services', path: '/services', Icon: ShoppingBag }
  ]`;
  } else if (isProfessional) {
    nextRewardName = 'Free Initial Review';
    recentLabel = 'Recent Consultations';
    recentLink = '/my-consultations';
    bookingLabel = 'Upcoming Consultation';
    bookingManageLink = '/my-consultations';
    recentItems = `[
      { id: 101, date: '2024-12-15', items: ['Case Review'], total: 250.00 },
      { id: 102, date: '2024-12-01', items: ['Initial Consultation'], total: 0 }
    ]`;
    primaryActionsCode = `[
    { label: 'Book Consultation', path: '/book', Icon: Calendar, primary: true },
    { label: 'My Cases', path: '/my-consultations', Icon: Clock },
    { label: 'Documents', path: '/documents', Icon: ShoppingBag },
    { label: 'Services', path: '/services', Icon: Star }
  ]`;
  } else if (isRealEstate) {
    nextRewardName = 'Priority Showing Access';
    recentLabel = 'Saved Listings';
    recentLink = '/saved';
    bookingLabel = 'Upcoming Showing';
    bookingManageLink = '/my-showings';
    recentItems = `[
      { id: 101, date: '2024-12-15', items: ['123 Oak St - 3BR/2BA'], total: 425000 },
      { id: 102, date: '2024-12-10', items: ['456 Maple Ave - 4BR/3BA'], total: 550000 }
    ]`;
    primaryActionsCode = `[
    { label: 'Browse Listings', path: '/listings', Icon: ShoppingBag, primary: true },
    { label: 'My Showings', path: '/my-showings', Icon: Calendar },
    { label: 'Saved Homes', path: '/saved', Icon: Star },
    { label: 'Contact Agent', path: '/contact', Icon: Clock }
  ]`;
  } else if (isTrade) {
    nextRewardName = '10% Off Next Service';
    recentLabel = 'Recent Services';
    recentLink = '/my-services';
    bookingLabel = 'Upcoming Appointment';
    bookingManageLink = '/my-appointments';
    recentItems = `[
      { id: 101, date: '2024-12-15', items: ['Emergency Repair'], total: 185.00 },
      { id: 102, date: '2024-11-28', items: ['Routine Maintenance'], total: 95.00 }
    ]`;
    primaryActionsCode = `[
    { label: 'Get Quote', path: '/quote', Icon: ShoppingBag, primary: true },
    { label: 'Book Service', path: '/book', Icon: Calendar },
    { label: 'My Services', path: '/my-services', Icon: Clock },
    { label: 'Services', path: '/services', Icon: Star }
  ]`;
  } else if (isTech) {
    nextRewardName = 'Free Month Upgrade';
    recentLabel = 'Recent Activity';
    recentLink = '/activity';
    bookingLabel = 'Upcoming Demo';
    bookingManageLink = '/my-demos';
    recentItems = `[
      { id: 101, date: '2024-12-15', items: ['Pro Plan Subscription'], total: 49.00 },
      { id: 102, date: '2024-11-15', items: ['Pro Plan Subscription'], total: 49.00 }
    ]`;
    primaryActionsCode = `[
    { label: 'Dashboard', path: '/app', Icon: Star, primary: true },
    { label: 'Billing', path: '/billing', Icon: ShoppingBag },
    { label: 'Support', path: '/support', Icon: Clock },
    { label: 'Settings', path: '/settings', Icon: Calendar }
  ]`;
  } else {
    // Food/default
    recentItems = `[
      { id: 101, date: '2024-12-15', items: ['${ind === 'coffee-cafe' ? 'Caramel Latte' : 'House Special'}', '${ind === 'coffee-cafe' ? 'Croissant' : 'Side Salad'}'], total: 12.50 },
      { id: 102, date: '2024-12-10', items: ['${ind === 'coffee-cafe' ? 'Cold Brew' : 'Grilled Chicken'}', '${ind === 'coffee-cafe' ? 'Muffin' : 'Soup'}'], total: 9.75 }
    ]`;
    primaryActionsCode = `[
    { label: 'Start Order', path: '/order', Icon: ShoppingBag, primary: true },
    { label: 'Reserve Table', path: '/reservations', Icon: Calendar },
    { label: 'Use Reward', path: '/rewards', Icon: Gift },
    { label: 'Browse Menu', path: '/menu', Icon: Coffee }
  ]`;
  }

  return `/**
 * Dashboard Page - ${businessData.name}
 * Customer Portal Home
 * Generated by Launchpad
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { Coffee, Calendar, Gift, ShoppingBag, Clock, ChevronRight, RotateCcw, Star, Award } from 'lucide-react';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const dashboardData = {
    points: user?.points || 240,
    pointsToNextReward: 60,
    nextRewardName: '${nextRewardName}',
    tier: user?.tier || 'Gold',
    tierProgress: 75,
    upcomingReservation: { id: 1, date: '2024-12-20', time: '10:00 AM', partySize: 2, status: 'confirmed' },
    recentOrders: ${recentItems},
    latestOffer: { title: 'Double Points Weekend', description: 'Earn 2x points this Saturday & Sunday' }
  };

  const handleReorder = (order) => navigate('/order', { state: { reorder: order } });
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  if (!isAuthenticated) {
    return (<div style={styles.page}><div style={styles.container}><div style={styles.authPrompt}><h2>Sign in to access your dashboard</h2><p>View your rewards, orders, and reservations</p><Link to="/login" style={styles.signInBtn}>Sign In</Link></div></div></div>);
  }

  // "What can I do in 30 seconds?" - Primary actions
  const primaryActions = ${primaryActionsCode};

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.greeting}>Welcome back, {user?.name || 'Guest'}!</h1>
            <p style={styles.subtitle}>Here's what's happening with your account</p>
          </div>
        </div>

        {/* Points & Tier Stats */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <Star size={24} color={\`\${styles.statValue.color}\`} style={{marginBottom: '8px'}} />
            <div style={styles.statValue}>{dashboardData.points}</div>
            <div style={styles.statLabel}>Points</div>
          </div>
          <div style={styles.statCard}>
            <Award size={24} color="#f59e0b" style={{marginBottom: '8px'}} />
            <div style={styles.statValue}>{dashboardData.tier}</div>
            <div style={styles.statLabel}>Member Tier</div>
          </div>
          <div style={styles.statCard}>
            <Gift size={24} color="#10b981" style={{marginBottom: '8px'}} />
            <div style={styles.statValue}>{dashboardData.pointsToNextReward}</div>
            <div style={styles.statLabel}>Points to Reward</div>
          </div>
        </div>

        {/* Primary Actions - "What can I do in 30 seconds?" */}
        <div style={styles.actionsRow}>
          {primaryActions.map((action, idx) => (
            <Link key={idx} to={action.path} style={{...styles.actionCard, ...(action.primary ? styles.actionPrimary : {})}}>
              <action.Icon size={24} />
              <span>{action.label}</span>
            </Link>
          ))}
        </div>

        <div style={styles.sections}>
          {/* Upcoming Booking */}
          {dashboardData.upcomingReservation && (
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>${bookingLabel}</h2>
                <Link to="${bookingManageLink}" style={styles.seeAll}>Manage <ChevronRight size={16} /></Link>
              </div>
              <div style={styles.reservationCard}>
                <div style={styles.reservationDate}>
                  <span style={styles.dateDay}>{new Date(dashboardData.upcomingReservation.date).getDate()}</span>
                  <span style={styles.dateMonth}>{new Date(dashboardData.upcomingReservation.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                </div>
                <div style={styles.reservationDetails}>
                  <p style={styles.reservationTime}><Clock size={14} /> {dashboardData.upcomingReservation.time}</p>
                  <p style={styles.reservationParty}>{dashboardData.upcomingReservation.partySize} guests</p>
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>${recentLabel}</h2>
              <Link to="${recentLink}" style={styles.seeAll}>View All <ChevronRight size={16} /></Link>
            </div>
            <div style={styles.ordersList}>
              {dashboardData.recentOrders.map((order) => (
                <div key={order.id} style={styles.orderCard}>
                  <div style={styles.orderInfo}>
                    <p style={styles.orderItems}>{order.items.join(', ')}</p>
                    <p style={styles.orderMeta}>{formatDate(order.date)} · {order.total.toFixed(2)}</p>
                  </div>
                  <button onClick={() => handleReorder(order)} style={styles.reorderBtn}>
                    <RotateCcw size={16} />
                    Reorder
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f8fafc', padding: '40px 20px' },
  container: { maxWidth: '1000px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  greeting: { fontSize: '1.75rem', fontWeight: '700', color: '#1f2937', marginBottom: '4px' },
  subtitle: { color: '#6b7280', fontSize: '1rem' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard: { background: '#fff', borderRadius: '12px', padding: '20px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  statValue: { fontSize: '1.75rem', fontWeight: '700', color: '${colors.primary}', marginBottom: '4px' },
  statLabel: { color: '#6b7280', fontSize: '0.85rem' },
  actionsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' },
  actionCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '20px 16px', background: '#fff', borderRadius: '12px', textDecoration: 'none', color: '#374151', fontWeight: '500', fontSize: '0.9rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', transition: 'transform 0.2s', cursor: 'pointer' },
  actionPrimary: { background: '${colors.primary}', color: '#fff' },
  sections: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' },
  section: { background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  sectionTitle: { fontSize: '1rem', fontWeight: '600', color: '#1f2937' },
  seeAll: { display: 'flex', alignItems: 'center', gap: '4px', color: '${colors.primary}', fontSize: '0.85rem', textDecoration: 'none', fontWeight: '500' },
  reservationCard: { display: 'flex', gap: '16px', padding: '16px', background: '#f9fafb', borderRadius: '10px' },
  reservationDate: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '${colors.primary}', color: '#fff', borderRadius: '8px', padding: '12px 16px', minWidth: '60px' },
  dateDay: { fontSize: '1.5rem', fontWeight: '700', lineHeight: 1 },
  dateMonth: { fontSize: '0.75rem', textTransform: 'uppercase', marginTop: '2px' },
  reservationDetails: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  reservationTime: { display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' },
  reservationParty: { color: '#6b7280', fontSize: '0.9rem' },
  ordersList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  orderCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: '#f9fafb', borderRadius: '10px' },
  orderInfo: { flex: 1 },
  orderItems: { fontWeight: '500', color: '#1f2937', marginBottom: '4px', fontSize: '0.95rem' },
  orderMeta: { color: '#6b7280', fontSize: '0.8rem' },
  reorderBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: '${colors.primary}', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: '500', cursor: 'pointer', fontSize: '0.85rem' },
  authPrompt: { textAlign: 'center', padding: '60px 20px' },
  signInBtn: { display: 'inline-block', marginTop: '16px', background: '${colors.primary}', color: '#fff', padding: '12px 32px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }
};
`;
}

/**
 * Generate Profile Page
 */
function generateProfilePage(businessData, colors) {
  return `/**
 * Profile Page - ${businessData.name}
 * Generated by Launchpad
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';

export default function ProfilePage() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateProfile(formData);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>My Profile</h1>
        </div>

        {saved && (
          <div style={styles.successBanner}>
            ✓ Profile updated successfully
          </div>
        )}

        <div style={styles.card}>
          <div style={styles.avatar}>
            <span style={styles.avatarText}>{(user?.name || 'U')[0].toUpperCase()}</span>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={styles.input}
                disabled={!editing}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={styles.input}
                disabled={!editing}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                style={styles.input}
                disabled={!editing}
                placeholder="(555) 123-4567"
              />
            </div>

            <div style={styles.actions}>
              {editing ? (
                <>
                  <button type="submit" style={styles.saveBtn}>Save Changes</button>
                  <button type="button" onClick={() => setEditing(false)} style={styles.cancelBtn}>Cancel</button>
                </>
              ) : (
                <button type="button" onClick={() => setEditing(true)} style={styles.editBtn}>Edit Profile</button>
              )}
            </div>
          </form>
        </div>

        <div style={styles.dangerZone}>
          <h2 style={styles.dangerTitle}>Account Actions</h2>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f9fafb', padding: '40px 20px' },
  container: { maxWidth: '500px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { fontSize: '1.75rem', fontWeight: '700', color: '#1f2937' },
  testBadge: { background: '#fef3c7', color: '#92400e', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '500' },
  successBanner: { background: '#d1fae5', color: '#065f46', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', fontWeight: '500' },
  card: { background: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  avatar: { width: '80px', height: '80px', borderRadius: '50%', background: '${colors.primary}', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' },
  avatarText: { color: '#fff', fontSize: '2rem', fontWeight: '600' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '0.9rem', fontWeight: '500', color: '#374151' },
  input: { padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' },
  actions: { display: 'flex', gap: '12px', marginTop: '8px' },
  editBtn: { flex: 1, padding: '12px', background: '${colors.primary}', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
  saveBtn: { flex: 1, padding: '12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
  cancelBtn: { flex: 1, padding: '12px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
  dangerZone: { marginTop: '24px', padding: '24px', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  dangerTitle: { fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '16px' },
  logoutBtn: { width: '100%', padding: '12px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }
};
`;
}

/**
 * Generate Rewards Page
 */
function generateRewardsPage(businessData, colors) {
  const ind = businessData.industry || 'restaurant';
  const isSalon = ['salon-spa', 'barbershop'].includes(ind);
  const isFitness = ['fitness-gym', 'yoga'].includes(ind);
  const isHealth = ['dental', 'healthcare'].includes(ind);
  const isProfessional = ['law-firm'].includes(ind);
  const isRealEstate = ['real-estate'].includes(ind);
  const isTrade = ['plumber', 'cleaning', 'auto-shop'].includes(ind);
  const isTech = ['saas', 'ecommerce'].includes(ind);

  let tiersCode, rewardsCode, activityCode;

  if (isSalon) {
    tiersCode = `[
    { name: 'Bronze', minPoints: 0, benefits: ['Earn 10 pts per visit', 'Birthday discount'] },
    { name: 'Silver', minPoints: 200, benefits: ['Earn 12 pts per visit', 'Free add-on service', 'Early booking access'] },
    { name: 'Gold', minPoints: 500, benefits: ['Earn 15 pts per visit', 'Free monthly blowout', 'Priority booking', 'Exclusive offers'] },
    { name: 'Platinum', minPoints: 1000, benefits: ['Earn 20 pts per visit', 'Free weekly service', 'VIP events', 'Personal stylist'] }
  ]`;
    rewardsCode = `[
    { id: 1, name: 'Free Blowout', description: 'Wash and style session', points: 100, available: true },
    { id: 2, name: 'Free Add-On', description: 'Deep conditioning or scalp treatment', points: 75, available: true },
    { id: 3, name: '20% Off Service', description: 'Save on any single service', points: 150, available: true },
    { id: 4, name: 'Free Color Gloss', description: 'Shine-enhancing color treatment', points: 300, available: currentPoints >= 300 },
    { id: 5, name: 'VIP Spa Day', description: 'Full day spa experience', points: 500, available: false, special: true }
  ]`;
    activityCode = `[
    { id: 1, action: 'Earned points', details: 'Haircut & Style', points: '+45', date: 'Today' },
    { id: 2, action: 'Redeemed reward', details: 'Free Blowout', points: '-100', date: 'Dec 15' },
    { id: 3, action: 'Earned points', details: 'Color Treatment', points: '+80', date: 'Dec 12' },
    { id: 4, action: 'Tier bonus', details: 'Gold member bonus', points: '+50', date: 'Dec 1' }
  ]`;
  } else if (isFitness) {
    tiersCode = `[
    { name: 'Bronze', minPoints: 0, benefits: ['Earn 10 pts per class', 'Birthday reward'] },
    { name: 'Silver', minPoints: 200, benefits: ['Earn 12 pts per class', 'Free guest pass', 'Early class registration'] },
    { name: 'Gold', minPoints: 500, benefits: ['Earn 15 pts per class', 'Free monthly PT session', 'Priority booking', 'Exclusive workshops'] },
    { name: 'Platinum', minPoints: 1000, benefits: ['Earn 20 pts per class', 'Free weekly PT session', 'VIP lounge access', 'Personal trainer'] }
  ]`;
    rewardsCode = `[
    { id: 1, name: 'Free Class', description: 'Any group fitness class', points: 100, available: true },
    { id: 2, name: 'Free Smoothie', description: 'Post-workout smoothie bar', points: 75, available: true },
    { id: 3, name: 'PT Session', description: '1-on-1 personal training', points: 200, available: true },
    { id: 4, name: 'Guest Pass', description: 'Bring a friend for the day', points: 150, available: currentPoints >= 150 },
    { id: 5, name: 'Retreat Weekend', description: 'Exclusive fitness retreat', points: 500, available: false, special: true }
  ]`;
    activityCode = `[
    { id: 1, action: 'Earned points', details: 'HIIT Blast Class', points: '+30', date: 'Today' },
    { id: 2, action: 'Redeemed reward', details: 'Free Class', points: '-100', date: 'Dec 15' },
    { id: 3, action: 'Earned points', details: 'Spin Class', points: '+30', date: 'Dec 12' },
    { id: 4, action: 'Tier bonus', details: 'Gold member bonus', points: '+50', date: 'Dec 1' }
  ]`;
  } else if (isHealth || isProfessional) {
    tiersCode = `[
    { name: 'Bronze', minPoints: 0, benefits: ['Earn 10 pts per visit', 'Birthday bonus'] },
    { name: 'Silver', minPoints: 200, benefits: ['Earn 12 pts per visit', 'Priority scheduling', 'Free consultation add-on'] },
    { name: 'Gold', minPoints: 500, benefits: ['Earn 15 pts per visit', 'Preferred rates', 'Priority scheduling', 'Exclusive resources'] },
    { name: 'Platinum', minPoints: 1000, benefits: ['Earn 20 pts per visit', 'VIP scheduling', 'Dedicated advisor', 'Annual review'] }
  ]`;
    rewardsCode = `[
    { id: 1, name: 'Free Consultation', description: 'Complimentary initial review', points: 100, available: true },
    { id: 2, name: '15% Off Service', description: 'Discount on any service', points: 75, available: true },
    { id: 3, name: 'Priority Access', description: 'Skip the waitlist for 30 days', points: 150, available: true },
    { id: 4, name: 'Premium Review', description: 'In-depth case or health review', points: 300, available: currentPoints >= 300 },
    { id: 5, name: 'VIP Package', description: 'Annual premium membership', points: 500, available: false, special: true }
  ]`;
    activityCode = `[
    { id: 1, action: 'Earned points', details: 'Visit completed', points: '+45', date: 'Today' },
    { id: 2, action: 'Redeemed reward', details: 'Free Consultation', points: '-100', date: 'Dec 15' },
    { id: 3, action: 'Earned points', details: 'Referral bonus', points: '+50', date: 'Dec 12' },
    { id: 4, action: 'Tier bonus', details: 'Gold member bonus', points: '+50', date: 'Dec 1' }
  ]`;
  } else {
    // Food / default
    tiersCode = `[
    { name: 'Bronze', minPoints: 0, benefits: ['Earn 10 pts per $1', 'Birthday reward'] },
    { name: 'Silver', minPoints: 200, benefits: ['Earn 12 pts per $1', 'Free drink upgrade', 'Early access to new items'] },
    { name: 'Gold', minPoints: 500, benefits: ['Earn 15 pts per $1', 'Free monthly drink', 'Priority reservations', 'Exclusive offers'] },
    { name: 'Platinum', minPoints: 1000, benefits: ['Earn 20 pts per $1', 'Free weekly drink', 'VIP events', 'Personal concierge'] }
  ]`;
    rewardsCode = `[
    { id: 1, name: 'Free Medium Drink', description: 'Any handcrafted beverage', points: 100, available: true },
    { id: 2, name: 'Free Pastry', description: 'Choose from our bakery selection', points: 75, available: true },
    { id: 3, name: '20% Off Order', description: 'Save on your entire order', points: 150, available: true },
    { id: 4, name: 'Free Bag of Coffee', description: '12oz bag of house blend', points: 300, available: currentPoints >= 300 },
    { id: 5, name: 'VIP Experience', description: 'Barista for a day experience', points: 500, available: false, special: true }
  ]`;
    activityCode = `[
    { id: 1, action: 'Earned points', details: 'Order #2847', points: '+45', date: 'Today' },
    { id: 2, action: 'Redeemed reward', details: 'Free Medium Drink', points: '-100', date: 'Dec 15' },
    { id: 3, action: 'Earned points', details: 'Order #2831', points: '+32', date: 'Dec 12' },
    { id: 4, action: 'Tier bonus', details: 'Gold member bonus', points: '+50', date: 'Dec 1' }
  ]`;
  }

  return `/**
 * Rewards Page - ${businessData.name}
 * Generated by Launchpad
 */

import React, { useState } from 'react';
import { useAuth } from '../components/AuthContext';

export default function RewardsPage() {
  const { user } = useAuth();
  const [redeeming, setRedeeming] = useState(null);
  const [activeTab, setActiveTab] = useState('rewards');

  const currentPoints = user?.points || 240;
  const currentTier = user?.tier || 'Gold';
  const tierProgress = 75;
  const pointsToNextTier = 100;

  const tiers = ${tiersCode};

  const rewards = ${rewardsCode};

  const activityLog = ${activityCode};

  const handleRedeem = (reward) => {
    if (currentPoints >= reward.points) {
      setRedeeming(reward.id);
      setTimeout(() => {
        setRedeeming(null);
        alert(\`🎉 You redeemed: \${reward.name}!\`);
      }, 1000);
    }
  };

  return (
    <div style={styles.page}>
      {/* Points Hero */}
      <div style={styles.pointsHero}>
        <div style={styles.heroContent}>
          <div style={styles.pointsDisplay}>
            <span style={styles.pointsNumber}>{currentPoints}</span>
            <span style={styles.pointsLabel}>points</span>
          </div>
          <div style={styles.tierBadge}>
            <span style={styles.tierIcon}>★</span>
            <span>{currentTier} Member</span>
          </div>
          <div style={styles.progressSection}>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: tierProgress + '%' }} />
            </div>
            <p style={styles.progressText}>{pointsToNextTier} points to next tier</p>
          </div>
        </div>
      </div>

      <div style={styles.container}>
        {/* Tabs */}
        <div style={styles.tabs}>
          <button onClick={() => setActiveTab('rewards')} style={{...styles.tab, ...(activeTab === 'rewards' ? styles.tabActive : {})}}>
            Rewards
          </button>
          <button onClick={() => setActiveTab('tiers')} style={{...styles.tab, ...(activeTab === 'tiers' ? styles.tabActive : {})}}>
            Tiers & Benefits
          </button>
          <button onClick={() => setActiveTab('activity')} style={{...styles.tab, ...(activeTab === 'activity' ? styles.tabActive : {})}}>
            Activity
          </button>
        </div>

        {/* Rewards Tab */}
        {activeTab === 'rewards' && (
          <div style={styles.tabContent}>
            <div style={styles.rewardsGrid}>
          {rewards.map((reward) => (
            <div key={reward.id} style={{
              ...styles.rewardCard,
              opacity: !reward.available && currentPoints < reward.points ? 0.6 : 1
            }}>
              {reward.special && <span style={styles.specialBadge}>Special</span>}
              <h3 style={styles.rewardName}>{reward.name}</h3>
              <p style={styles.rewardDesc}>{reward.description}</p>
              <div style={styles.rewardFooter}>
                {reward.points > 0 ? (
                  <span style={styles.rewardPoints}>{reward.points} points</span>
                ) : (
                  <span style={styles.freeLabel}>Free!</span>
                )}
                <button
                  onClick={() => handleRedeem(reward)}
                  disabled={!reward.available || currentPoints < reward.points || redeeming === reward.id}
                  style={{
                    ...styles.redeemBtn,
                    opacity: !reward.available || currentPoints < reward.points ? 0.5 : 1,
                    cursor: !reward.available || currentPoints < reward.points ? 'not-allowed' : 'pointer'
                  }}
                >
                  {redeeming === reward.id ? 'Redeeming...' : 'Redeem'}
                </button>
              </div>
            </div>
          ))}
            </div>
          </div>
        )}

        {/* Tiers Tab */}
        {activeTab === 'tiers' && (
          <div style={styles.tabContent}>
            <div style={styles.tiersGrid}>
              {tiers.map((tier, idx) => (
                <div key={tier.name} style={{
                  ...styles.tierCard,
                  ...(currentTier === tier.name ? styles.tierCardActive : {})
                }}>
                  {currentTier === tier.name && <span style={styles.currentBadge}>Current</span>}
                  <h3 style={styles.tierName}>{tier.name}</h3>
                  <p style={styles.tierReq}>{tier.minPoints}+ points</p>
                  <ul style={styles.benefitsList}>
                    {tier.benefits.map((benefit, i) => (
                      <li key={i} style={styles.benefitItem}>✓ {benefit}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div style={styles.tabContent}>
            <div style={styles.activityList}>
              {activityLog.map((item) => (
                <div key={item.id} style={styles.activityItem}>
                  <div style={styles.activityInfo}>
                    <p style={styles.activityAction}>{item.action}</p>
                    <p style={styles.activityDetails}>{item.details}</p>
                  </div>
                  <div style={styles.activityRight}>
                    <span style={{...styles.activityPoints, color: item.points.startsWith('+') ? '#10b981' : '#ef4444'}}>{item.points}</span>
                    <span style={styles.activityDate}>{item.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f8fafc' },
  pointsHero: { background: 'linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark || colors.primary} 100%)', padding: '48px 20px', marginBottom: '24px', color: '#fff' },
  heroContent: { maxWidth: '800px', margin: '0 auto', textAlign: 'center' },
  pointsDisplay: { marginBottom: '16px' },
  pointsNumber: { fontSize: '4rem', fontWeight: '700' },
  pointsLabel: { fontSize: '1.25rem', opacity: 0.9, marginLeft: '8px' },
  tierBadge: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.2)', padding: '8px 20px', borderRadius: '50px', marginBottom: '20px' },
  tierIcon: { fontSize: '1.25rem' },
  progressSection: { maxWidth: '300px', margin: '0 auto' },
  progressBar: { height: '8px', background: 'rgba(255,255,255,0.3)', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' },
  progressFill: { height: '100%', background: '#fff', borderRadius: '4px', transition: 'width 0.3s' },
  progressText: { fontSize: '0.9rem', opacity: 0.9 },
  container: { maxWidth: '800px', margin: '0 auto', padding: '0 20px 40px' },
  tabs: { display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #e5e7eb', paddingBottom: '0' },
  tab: { padding: '12px 20px', background: 'none', border: 'none', fontSize: '0.95rem', fontWeight: '500', color: '#6b7280', cursor: 'pointer', borderBottom: '2px solid transparent', marginBottom: '-1px' },
  tabActive: { color: '${colors.primary}', borderBottomColor: '${colors.primary}' },
  tabContent: { minHeight: '300px' },
  rewardsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' },
  rewardCard: { background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', position: 'relative' },
  specialBadge: { position: 'absolute', top: '12px', right: '12px', background: '#fef3c7', color: '#92400e', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '600' },
  rewardName: { fontSize: '1.1rem', fontWeight: '600', color: '#1f2937', marginBottom: '8px' },
  rewardDesc: { color: '#6b7280', fontSize: '0.9rem', marginBottom: '16px' },
  rewardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  rewardPoints: { color: '${colors.primary}', fontWeight: '600', fontSize: '0.9rem' },
  freeLabel: { color: '#10b981', fontWeight: '600' },
  redeemBtn: { padding: '10px 16px', background: '${colors.primary}', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '500', fontSize: '0.85rem', cursor: 'pointer' },
  tiersGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' },
  tierCard: { background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', position: 'relative', border: '2px solid transparent' },
  tierCardActive: { borderColor: '${colors.primary}', background: '#f0fdf4' },
  currentBadge: { position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: '${colors.primary}', color: '#fff', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600' },
  tierName: { fontSize: '1.25rem', fontWeight: '700', color: '#1f2937', marginBottom: '4px', textAlign: 'center' },
  tierReq: { color: '#6b7280', fontSize: '0.85rem', marginBottom: '16px', textAlign: 'center' },
  benefitsList: { listStyle: 'none', padding: 0, margin: 0 },
  benefitItem: { color: '#374151', fontSize: '0.9rem', padding: '6px 0', borderBottom: '1px solid #f3f4f6' },
  activityList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  activityItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  activityInfo: { flex: 1 },
  activityAction: { fontWeight: '500', color: '#1f2937', marginBottom: '4px' },
  activityDetails: { color: '#6b7280', fontSize: '0.85rem' },
  activityRight: { textAlign: 'right' },
  activityPoints: { display: 'block', fontWeight: '600', fontSize: '1rem' },
  activityDate: { color: '#9ca3af', fontSize: '0.8rem' }
};
`;
}


/**
 * Generate Reservations Page (customer-facing booking UI)
 */
function generateReservationsPage(businessData, colors) {
  const ind = businessData.industry || 'restaurant';
  const isSalon = ['salon-spa', 'barbershop'].includes(ind);
  const isFitness = ['fitness-gym', 'yoga'].includes(ind);
  const isHealth = ['dental', 'healthcare'].includes(ind);
  const isProfessional = ['law-firm'].includes(ind);
  const isTrade = ['plumber', 'cleaning', 'auto-shop'].includes(ind);
  const isBookingType = isSalon || isFitness || isHealth || isProfessional || isTrade;

  const bookingTitle = isSalon ? 'Book an Appointment' : isFitness ? 'Book a Class' : isHealth ? 'Schedule an Appointment' : isProfessional ? 'Book a Consultation' : isTrade ? 'Schedule a Service' : 'Make a Reservation';
  const bookingAuthMsg = isBookingType ? 'Sign in to book' : 'Sign in to make a reservation';
  const bookingAuthDesc = isBookingType ? 'Manage your upcoming bookings' : 'Save your favorite times and manage your bookings';
  const partySizeLabel = isBookingType ? '' : 'Party Size';
  const confirmLabel = isBookingType ? 'Confirm Booking' : 'Confirm Reservation';
  const successLabel = isBookingType ? 'Booking Confirmed!' : 'Reservation Confirmed!';
  const newBookingLabel = isBookingType ? 'Make Another Booking' : 'Make Another Reservation';
  const yourBookingsLabel = isBookingType ? 'Your Bookings' : 'Your Reservations';

  return `/**
 * Reservations Page - ${businessData.name}
 * Generated by Launchpad
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { useReservations } from '../hooks/useReservations';
import { Calendar, Clock, Users, ChevronLeft, ChevronRight, Check, X, AlertCircle } from 'lucide-react';

export default function ReservationsPage() {
  const { user, isAuthenticated } = useAuth();
  const { createReservation, loading: apiLoading, error: apiError } = useReservations();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [partySize, setPartySize] = useState(2);
  const [specialRequests, setSpecialRequests] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Auto-fill name/email from logged-in user
  const userName = user?.name || '';
  const userEmail = user?.email || '';
  const userPhone = user?.phone || '';

  const dates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      date: date.toISOString().split('T')[0],
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' })
    };
  });

  const timeSlots = [
    '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
    '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'
  ];

  const unavailableSlots = ['12:00 PM', '12:30 PM', '1:00 PM'];

  const userReservations = [
    { id: 1, date: '2024-12-20', time: '10:00 AM', partySize: 2, status: 'confirmed' },
    { id: 2, date: '2024-12-25', time: '2:00 PM', partySize: 4, status: 'pending' }
  ];

  const convertTo24Hour = (time12h) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (modifier === 'PM' && hours !== '12') hours = parseInt(hours, 10) + 12;
    if (modifier === 'AM' && hours === '12') hours = '00';
    return \`\${hours}:\${minutes}\`;
  };

  const handleConfirm = async () => {
    setSubmitError('');
    try {
      const result = await createReservation({
        customerName: userName,
        customerEmail: userEmail,
        customerPhone: userPhone,
        date: selectedDate,
        time: convertTo24Hour(selectedTime),
        partySize: partySize,
        specialRequests: specialRequests
      });
      setConfirmationNumber(result.booking?.reference_code || result.reference_code || 'N/A');
      setConfirmed(true);
    } catch (err) {
      console.error('Reservation failed:', err.message);
      setSubmitError(err.message || 'Failed to create reservation. Please try again.');
    }
  };

  const formatSelectedDate = () => {
    if (!selectedDate) return '';
    const d = dates.find(d => d.date === selectedDate);
    return d ? \`\${d.day}, \${d.month} \${d.dayNum}\` : '';
  };

  if (!isAuthenticated) {
    return (<div style={styles.page}><div style={styles.container}><div style={styles.authPrompt}><Calendar size={48} color="#d1d5db" /><h2>${bookingAuthMsg}</h2><p>${bookingAuthDesc}</p><Link to="/login" style={styles.signInBtn}>Sign In</Link></div></div></div>);
  }

  if (confirmed) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.successCard}>
            <div style={styles.successIcon}><Check size={32} /></div>
            <h2 style={styles.successTitle}>${successLabel}</h2>
            <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '${colors.primary}', marginBottom: '12px' }}>Confirmation #{confirmationNumber}</p>
            <p style={styles.successDetails}>{formatSelectedDate()} at {selectedTime}<br />Party of {partySize}</p>
            <p style={styles.confirmationNote}>A confirmation email has been sent to {user?.email}</p>
            <div style={styles.successActions}>
              <button onClick={() => { setConfirmed(false); setStep(1); setSelectedDate(null); setSelectedTime(null); }} style={styles.newReservationBtn}>${newBookingLabel}</button>
              <Link to="/dashboard" style={styles.dashboardLink}>Back to Dashboard</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>${bookingTitle}</h1>
        <div style={styles.progressBar}>
          <div style={{...styles.progressStep, ...(step >= 1 ? styles.progressStepActive : {})}}><span style={styles.stepNumber}>1</span><span style={styles.stepLabel}>Select Time</span></div>
          <div style={styles.progressLine}></div>
          <div style={{...styles.progressStep, ...(step >= 2 ? styles.progressStepActive : {})}}><span style={styles.stepNumber}>2</span><span style={styles.stepLabel}>Confirm</span></div>
        </div>

        {step === 1 && (
          <div style={styles.stepContent}>
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}><Users size={18} /> Party Size</h3>
              <div style={styles.partySizeGrid}>
                {[1, 2, 3, 4, 5, 6].map(size => (
                  <button key={size} onClick={() => setPartySize(size)} style={{...styles.partySizeBtn, ...(partySize === size ? styles.partySizeBtnActive : {})}}>{size}</button>
                ))}
              </div>
            </div>
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}><Calendar size={18} /> Select Date</h3>
              <div style={styles.dateScroller}>
                {dates.map(d => (
                  <button key={d.date} onClick={() => setSelectedDate(d.date)} style={{...styles.dateCard, ...(selectedDate === d.date ? styles.dateCardActive : {})}}>
                    <span style={styles.dateDay}>{d.day}</span><span style={styles.dateNum}>{d.dayNum}</span><span style={styles.dateMonth}>{d.month}</span>
                  </button>
                ))}
              </div>
            </div>
            {selectedDate && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}><Clock size={18} /> Select Time</h3>
                <div style={styles.timeGrid}>
                  {timeSlots.map(time => {
                    const unavailable = unavailableSlots.includes(time);
                    return (<button key={time} onClick={() => !unavailable && setSelectedTime(time)} disabled={unavailable} style={{...styles.timeSlot, ...(selectedTime === time ? styles.timeSlotActive : {}), ...(unavailable ? styles.timeSlotUnavailable : {})}}>{time}</button>);
                  })}
                </div>
              </div>
            )}
            {selectedDate && selectedTime && (<button onClick={() => setStep(2)} style={styles.continueBtn}>Continue <ChevronRight size={18} /></button>)}
          </div>
        )}

        {step === 2 && (
          <div style={styles.stepContent}>
            <div style={styles.summaryCard}>
              <h3 style={styles.summaryTitle}>Reservation Summary</h3>
              <div style={styles.summaryRow}><span><Calendar size={16} /> Date</span><span>{formatSelectedDate()}</span></div>
              <div style={styles.summaryRow}><span><Clock size={16} /> Time</span><span>{selectedTime}</span></div>
              <div style={styles.summaryRow}><span><Users size={16} /> Party Size</span><span>{partySize} {partySize === 1 ? 'guest' : 'guests'}</span></div>
            </div>
            <div style={styles.section}>
              <label style={styles.label}>Special Requests (optional)</label>
              <textarea value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} style={styles.textarea} placeholder="High chair needed, birthday celebration, dietary restrictions..." />
            </div>
            {submitError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '0.9rem', marginBottom: '16px' }}>
                <AlertCircle size={16} /> {submitError}
              </div>
            )}
            <div style={styles.actionRow}>
              <button onClick={() => setStep(1)} style={styles.backBtn}><ChevronLeft size={18} /> Back</button>
              <button onClick={handleConfirm} disabled={apiLoading} style={{...styles.confirmBtn, opacity: apiLoading ? 0.7 : 1}}>{apiLoading ? 'Booking...' : '${confirmLabel}'}</button>
            </div>
          </div>
        )}

        {userReservations.length > 0 && (
          <div style={styles.existingSection}>
            <h2 style={styles.existingTitle}>${yourBookingsLabel}</h2>
            <div style={styles.reservationsList}>
              {userReservations.map(res => (
                <div key={res.id} style={styles.reservationCard}>
                  <div style={styles.resDate}><span style={styles.resDay}>{new Date(res.date).getDate()}</span><span style={styles.resMonth}>{new Date(res.date).toLocaleDateString('en-US', { month: 'short' })}</span></div>
                  <div style={styles.resDetails}><p style={styles.resTime}>{res.time}</p><p style={styles.resParty}>{res.partySize} guests</p></div>
                  <span style={{...styles.resStatus, background: res.status === 'confirmed' ? '#d1fae5' : '#fef3c7', color: res.status === 'confirmed' ? '#065f46' : '#92400e'}}>{res.status}</span>
                  <button style={styles.cancelBtn}><X size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f8fafc', padding: '40px 20px' },
  container: { maxWidth: '700px', margin: '0 auto' },
  title: { fontSize: '1.75rem', fontWeight: '700', color: '#1f2937', marginBottom: '24px' },
  progressBar: { display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' },
  progressStep: { display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.5 },
  progressStepActive: { opacity: 1 },
  stepNumber: { width: '32px', height: '32px', borderRadius: '50%', background: '${colors.primary}', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600' },
  stepLabel: { fontWeight: '500', color: '#374151' },
  progressLine: { width: '60px', height: '2px', background: '#e5e7eb', margin: '0 12px' },
  stepContent: { background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  section: { marginBottom: '24px' },
  sectionTitle: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '12px' },
  partySizeGrid: { display: 'flex', gap: '8px' },
  partySizeBtn: { width: '48px', height: '48px', border: '2px solid #e5e7eb', borderRadius: '8px', background: '#fff', fontSize: '1.1rem', fontWeight: '500', cursor: 'pointer' },
  partySizeBtnActive: { borderColor: '${colors.primary}', background: '${colors.primary}', color: '#fff' },
  dateScroller: { display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' },
  dateCard: { minWidth: '70px', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '12px', background: '#fff', textAlign: 'center', cursor: 'pointer', flexShrink: 0 },
  dateCardActive: { borderColor: '${colors.primary}', background: '${colors.primary}', color: '#fff' },
  dateDay: { display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '4px' },
  dateNum: { display: 'block', fontSize: '1.5rem', fontWeight: '700' },
  dateMonth: { display: 'block', fontSize: '0.75rem' },
  timeGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '8px' },
  timeSlot: { padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', background: '#fff', fontSize: '0.9rem', cursor: 'pointer', fontWeight: '500' },
  timeSlotActive: { borderColor: '${colors.primary}', background: '${colors.primary}', color: '#fff' },
  timeSlotUnavailable: { background: '#f3f4f6', color: '#9ca3af', cursor: 'not-allowed', borderColor: '#f3f4f6' },
  continueBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '14px', background: '${colors.primary}', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', marginTop: '16px' },
  summaryCard: { background: '#f9fafb', borderRadius: '12px', padding: '20px', marginBottom: '24px' },
  summaryTitle: { fontSize: '1.1rem', fontWeight: '600', color: '#1f2937', marginBottom: '16px' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #e5e7eb' },
  label: { display: 'block', fontSize: '0.9rem', fontWeight: '500', color: '#374151', marginBottom: '8px' },
  textarea: { width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.95rem', minHeight: '80px', resize: 'vertical', boxSizing: 'border-box' },
  actionRow: { display: 'flex', gap: '12px', marginTop: '24px' },
  backBtn: { display: 'flex', alignItems: 'center', gap: '4px', padding: '12px 20px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontSize: '0.95rem', fontWeight: '500', cursor: 'pointer' },
  confirmBtn: { flex: 1, padding: '14px', background: '${colors.primary}', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
  existingSection: { marginTop: '40px' },
  existingTitle: { fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '16px' },
  reservationsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  reservationCard: { display: 'flex', alignItems: 'center', gap: '16px', background: '#fff', padding: '16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  resDate: { background: '${colors.primary}', color: '#fff', borderRadius: '8px', padding: '8px 12px', textAlign: 'center', minWidth: '50px' },
  resDay: { display: 'block', fontSize: '1.25rem', fontWeight: '700' },
  resMonth: { display: 'block', fontSize: '0.7rem', textTransform: 'uppercase' },
  resDetails: { flex: 1 },
  resTime: { fontWeight: '600', color: '#1f2937' },
  resParty: { color: '#6b7280', fontSize: '0.85rem' },
  resStatus: { padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '500', textTransform: 'capitalize' },
  cancelBtn: { padding: '8px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  authPrompt: { textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '16px' },
  signInBtn: { display: 'inline-block', marginTop: '16px', background: '${colors.primary}', color: '#fff', padding: '12px 32px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' },
  successCard: { textAlign: 'center', background: '#fff', borderRadius: '16px', padding: '48px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  successIcon: { width: '64px', height: '64px', background: '#d1fae5', color: '#065f46', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' },
  successTitle: { fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', marginBottom: '8px' },
  successDetails: { fontSize: '1.1rem', color: '#374151', marginBottom: '12px' },
  confirmationNote: { color: '#6b7280', fontSize: '0.9rem', marginBottom: '24px' },
  successActions: { display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' },
  newReservationBtn: { padding: '12px 24px', background: '${colors.primary}', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer' },
  dashboardLink: { color: '${colors.primary}', textDecoration: 'none', fontWeight: '500' }
};
`;
}

/**
 * Generate Order History Page
 */
function generateOrderHistoryPage(businessData, colors) {
  const ind = businessData.industry || 'restaurant';
  const isSalon = ['salon-spa', 'barbershop'].includes(ind);
  const isFitness = ['fitness-gym', 'yoga'].includes(ind);
  const isHealth = ['dental', 'healthcare'].includes(ind);
  const isProfessional = ['law-firm'].includes(ind);
  const isTrade = ['plumber', 'cleaning', 'auto-shop'].includes(ind);

  let pageTitle = 'Order History';
  let ordersCode, emptyMsg, authMsg;

  if (isSalon) {
    pageTitle = 'Appointment History';
    emptyMsg = 'No appointments found';
    authMsg = 'Sign in to view your appointment history';
    ordersCode = `[
    { id: 'APT-2847', date: '2024-12-18', time: '10:30 AM', status: 'completed', total: 85.00, items: [{ name: 'Haircut & Style', qty: 1, price: 45.00 }, { name: 'Deep Conditioning', qty: 1, price: 40.00 }], pointsEarned: 45 },
    { id: 'APT-2831', date: '2024-12-15', time: '2:00 PM', status: 'completed', total: 120.00, items: [{ name: 'Color Touch-Up', qty: 1, price: 80.00 }, { name: 'Blow Dry', qty: 1, price: 40.00 }], pointsEarned: 60 },
    { id: 'APT-2798', date: '2024-12-10', time: '11:00 AM', status: 'completed', total: 65.00, items: [{ name: 'Manicure', qty: 1, price: 35.00 }, { name: 'Pedicure', qty: 1, price: 30.00 }], pointsEarned: 32 },
    { id: 'APT-2756', date: '2024-12-05', time: '3:00 PM', status: 'cancelled', total: 45.00, items: [{ name: 'Haircut', qty: 1, price: 45.00 }], pointsEarned: 0, refundNote: 'Cancelled by client' }
  ]`;
  } else if (isFitness) {
    pageTitle = 'Class History';
    emptyMsg = 'No classes found';
    authMsg = 'Sign in to view your class history';
    ordersCode = `[
    { id: 'CLS-2847', date: '2024-12-18', time: '6:00 AM', status: 'completed', total: 0, items: [{ name: 'HIIT Blast', qty: 1, price: 0 }, { name: 'Core & Stretch', qty: 1, price: 0 }], pointsEarned: 60 },
    { id: 'CLS-2831', date: '2024-12-15', time: '7:30 AM', status: 'completed', total: 0, items: [{ name: 'Spin Cycle', qty: 1, price: 0 }], pointsEarned: 30 },
    { id: 'CLS-2798', date: '2024-12-10', time: '12:00 PM', status: 'completed', total: 35.00, items: [{ name: 'Personal Training', qty: 1, price: 35.00 }], pointsEarned: 45 },
    { id: 'CLS-2756', date: '2024-12-05', time: '5:30 PM', status: 'cancelled', total: 0, items: [{ name: 'Power Yoga', qty: 1, price: 0 }], pointsEarned: 0, refundNote: 'Class cancelled' }
  ]`;
  } else if (isHealth || isProfessional) {
    pageTitle = 'Visit History';
    emptyMsg = 'No visits found';
    authMsg = 'Sign in to view your visit history';
    ordersCode = `[
    { id: 'VST-2847', date: '2024-12-18', time: '10:00 AM', status: 'completed', total: 150.00, items: [{ name: 'Regular Checkup', qty: 1, price: 150.00 }], pointsEarned: 45 },
    { id: 'VST-2831', date: '2024-12-01', time: '2:00 PM', status: 'completed', total: 75.00, items: [{ name: 'Follow-up Consultation', qty: 1, price: 75.00 }], pointsEarned: 32 },
    { id: 'VST-2798', date: '2024-11-15', time: '11:00 AM', status: 'completed', total: 200.00, items: [{ name: 'Comprehensive Review', qty: 1, price: 200.00 }], pointsEarned: 60 },
    { id: 'VST-2756', date: '2024-11-01', time: '9:00 AM', status: 'cancelled', total: 0, items: [{ name: 'Initial Consultation', qty: 1, price: 0 }], pointsEarned: 0, refundNote: 'Rescheduled' }
  ]`;
  } else if (isTrade) {
    pageTitle = 'Service History';
    emptyMsg = 'No services found';
    authMsg = 'Sign in to view your service history';
    ordersCode = `[
    { id: 'SVC-2847', date: '2024-12-18', time: '10:00 AM', status: 'completed', total: 185.00, items: [{ name: 'Emergency Repair', qty: 1, price: 185.00 }], pointsEarned: 45 },
    { id: 'SVC-2831', date: '2024-11-28', time: '9:00 AM', status: 'completed', total: 95.00, items: [{ name: 'Routine Maintenance', qty: 1, price: 95.00 }], pointsEarned: 25 },
    { id: 'SVC-2798', date: '2024-11-10', time: '2:00 PM', status: 'completed', total: 350.00, items: [{ name: 'Full Service', qty: 1, price: 250.00 }, { name: 'Parts', qty: 1, price: 100.00 }], pointsEarned: 60 },
    { id: 'SVC-2756', date: '2024-10-20', time: '11:00 AM', status: 'refunded', total: 75.00, items: [{ name: 'Inspection', qty: 1, price: 75.00 }], pointsEarned: 0, refundNote: 'No issues found - complimentary' }
  ]`;
  } else {
    // Food / default
    emptyMsg = 'No orders found';
    authMsg = 'Sign in to view your orders';
    ordersCode = `[
    { id: 'ORD-2847', date: '2024-12-18', time: '10:32 AM', status: 'completed', total: 18.50, items: [{ name: '${ind === 'coffee-cafe' ? 'Caramel Latte' : 'House Special'}', qty: 1, price: 5.50 }, { name: '${ind === 'coffee-cafe' ? 'Chocolate Croissant' : 'Side Dish'}', qty: 2, price: 4.00 }, { name: '${ind === 'coffee-cafe' ? 'Cold Brew' : 'Beverage'}', qty: 1, price: 5.00 }], pointsEarned: 45 },
    { id: 'ORD-2831', date: '2024-12-15', time: '2:15 PM', status: 'completed', total: 12.75, items: [{ name: '${ind === 'coffee-cafe' ? 'Vanilla Oat Latte' : 'Lunch Special'}', qty: 1, price: 6.25 }, { name: '${ind === 'coffee-cafe' ? 'Blueberry Muffin' : 'Appetizer'}', qty: 1, price: 3.50 }, { name: '${ind === 'coffee-cafe' ? 'Espresso Shot' : 'Drink'}', qty: 1, price: 3.00 }], pointsEarned: 32 },
    { id: 'ORD-2798', date: '2024-12-10', time: '9:05 AM', status: 'completed', total: 24.00, items: [{ name: '${ind === 'coffee-cafe' ? 'Mocha' : 'Entree'}', qty: 2, price: 6.00 }, { name: '${ind === 'coffee-cafe' ? 'Bagel with Cream Cheese' : 'Side'}', qty: 2, price: 4.50 }, { name: '${ind === 'coffee-cafe' ? 'Orange Juice' : 'Drink'}', qty: 1, price: 3.00 }], pointsEarned: 60 },
    { id: 'ORD-2756', date: '2024-12-05', time: '11:45 AM', status: 'refunded', total: 8.50, items: [{ name: '${ind === 'coffee-cafe' ? 'Iced Americano' : 'Special'}', qty: 1, price: 4.50 }, { name: '${ind === 'coffee-cafe' ? 'Almond Biscotti' : 'Snack'}', qty: 2, price: 2.00 }], pointsEarned: 0, refundNote: 'Item unavailable' }
  ]`;
  }

  return `/**
 * Order History Page - ${businessData.name}
 * Generated by Launchpad
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { Search, RotateCcw, ChevronDown, ChevronUp, Calendar, Clock, ShoppingBag } from 'lucide-react';

export default function OrderHistoryPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);

  const orders = ${ordersCode};

  const filteredOrders = orders
    .filter(order => filterStatus === 'all' || order.status === filterStatus)
    .filter(order => !searchQuery || order.id.toLowerCase().includes(searchQuery.toLowerCase()) || order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())));

  const handleReorder = (order) => navigate('/order', { state: { reorder: order } });
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  if (!isAuthenticated) {
    return (<div style={styles.page}><div style={styles.container}><div style={styles.authPrompt}><ShoppingBag size={48} color="#d1d5db" /><h2>${authMsg}</h2><p>Track your history and manage your account</p><Link to="/login" style={styles.signInBtn}>Sign In</Link></div></div></div>);
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>${pageTitle}</h1>
        <div style={styles.toolbar}>
          <div style={styles.searchBox}><Search size={18} color="#9ca3af" /><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search orders or items..." style={styles.searchInput} /></div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={styles.select}><option value="all">All Orders</option><option value="completed">Completed</option><option value="refunded">Refunded</option></select>
        </div>
        <div style={styles.ordersList}>
          {filteredOrders.length === 0 ? (<div style={styles.emptyState}><ShoppingBag size={48} color="#d1d5db" /><p>${emptyMsg}</p></div>) : (
            filteredOrders.map(order => (
              <div key={order.id} style={styles.orderCard}>
                <div style={styles.orderHeader} onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                  <div style={styles.orderMain}><span style={styles.orderId}>{order.id}</span><span style={{...styles.orderStatus, background: order.status === 'completed' ? '#d1fae5' : '#fef3c7', color: order.status === 'completed' ? '#065f46' : '#92400e'}}>{order.status}</span></div>
                  <div style={styles.orderMeta}><span><Calendar size={14} /> {formatDate(order.date)}</span><span><Clock size={14} /> {order.time}</span></div>
                  <div style={styles.orderSummary}><span style={styles.itemCount}>{order.items.length} items</span><span style={styles.orderTotal}>{order.total.toFixed(2)}</span>{expandedOrder === order.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</div>
                </div>
                {expandedOrder === order.id && (
                  <div style={styles.orderDetails}>
                    <div style={styles.itemsList}>{order.items.map((item, idx) => (<div key={idx} style={styles.itemRow}><span style={styles.itemQty}>{item.qty}x</span><span style={styles.itemName}>{item.name}</span><span style={styles.itemPrice}>{(item.price * item.qty).toFixed(2)}</span></div>))}</div>
                    <div style={styles.orderFooter}>{order.pointsEarned > 0 && <span style={styles.pointsEarned}>+{order.pointsEarned} points earned</span>}{order.refundNote && <span style={styles.refundNote}>{order.refundNote}</span>}<button onClick={() => handleReorder(order)} style={styles.reorderBtn}><RotateCcw size={16} />Reorder</button></div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        <div style={styles.statsCard}>
          <div style={styles.stat}><span style={styles.statValue}>{orders.length}</span><span style={styles.statLabel}>Total Orders</span></div>
          <div style={styles.stat}><span style={styles.statValue}>{orders.reduce((sum, o) => sum + o.pointsEarned, 0)}</span><span style={styles.statLabel}>Points Earned</span></div>
          <div style={styles.stat}><span style={styles.statValue}>{orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}</span><span style={styles.statLabel}>Total Spent</span></div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f8fafc', padding: '40px 20px' },
  container: { maxWidth: '800px', margin: '0 auto' },
  title: { fontSize: '1.75rem', fontWeight: '700', color: '#1f2937', marginBottom: '24px' },
  toolbar: { display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' },
  searchBox: { flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e5e7eb' },
  searchInput: { flex: 1, border: 'none', outline: 'none', fontSize: '0.95rem' },
  select: { padding: '12px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fff', fontSize: '0.9rem', cursor: 'pointer' },
  ordersList: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' },
  orderCard: { background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  orderHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', cursor: 'pointer', flexWrap: 'wrap', gap: '12px' },
  orderMain: { display: 'flex', alignItems: 'center', gap: '12px' },
  orderId: { fontWeight: '600', color: '#1f2937' },
  orderStatus: { padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '500', textTransform: 'capitalize' },
  orderMeta: { display: 'flex', alignItems: 'center', gap: '16px', color: '#6b7280', fontSize: '0.85rem' },
  orderSummary: { display: 'flex', alignItems: 'center', gap: '16px' },
  itemCount: { color: '#6b7280', fontSize: '0.9rem' },
  orderTotal: { fontWeight: '600', color: '#1f2937', fontSize: '1.1rem' },
  orderDetails: { padding: '0 20px 20px', borderTop: '1px solid #f3f4f6' },
  itemsList: { padding: '16px 0' },
  itemRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: '1px solid #f9fafb' },
  itemQty: { background: '#f3f4f6', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '500' },
  itemName: { flex: 1, color: '#374151' },
  itemPrice: { fontWeight: '500', color: '#1f2937' },
  orderFooter: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingTop: '16px', flexWrap: 'wrap', gap: '12px' },
  pointsEarned: { color: '#10b981', fontWeight: '500', fontSize: '0.9rem', marginRight: 'auto' },
  refundNote: { color: '#f59e0b', fontWeight: '500', fontSize: '0.9rem' },
  reorderBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', background: '${colors.primary}', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '500', cursor: 'pointer', fontSize: '0.9rem' },
  emptyState: { textAlign: 'center', padding: '60px 20px', color: '#9ca3af' },
  statsCard: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  stat: { textAlign: 'center' },
  statValue: { display: 'block', fontSize: '1.5rem', fontWeight: '700', color: '${colors.primary}', marginBottom: '4px' },
  statLabel: { color: '#6b7280', fontSize: '0.85rem' },
  authPrompt: { textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '16px' },
  signInBtn: { display: 'inline-block', marginTop: '16px', background: '${colors.primary}', color: '#fff', padding: '12px 32px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }
};
`;
}

/**
 * Generate AuthContext component
 */
function generateAuthContext(colors) {
  return `/**
 * AuthContext - Authentication Provider
 * Generated by Launchpad
 *
 * Connects to backend API for real authentication
 * Demo accounts: demo@demo.com / admin123, admin@demo.com / admin123
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// API base URL - uses backend if available, falls back to localStorage
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [apiAvailable, setApiAvailable] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const savedToken = localStorage.getItem('launchpad_token');
      const savedUser = localStorage.getItem('launchpad_user');

      if (savedToken) {
        // Try to verify token with backend
        try {
          const res = await fetch(\`\${API_URL}/api/auth/me\`, {
            headers: { 'Authorization': \`Bearer \${savedToken}\` }
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
            setToken(savedToken);
            setApiAvailable(true);
          } else {
            // Token expired, clear storage
            localStorage.removeItem('launchpad_token');
            localStorage.removeItem('launchpad_user');
          }
        } catch (e) {
          // Backend not available, use cached user
          if (savedUser) {
            try { setUser(JSON.parse(savedUser)); } catch (e) {}
          }
        }
      } else if (savedUser) {
        try { setUser(JSON.parse(savedUser)); } catch (e) {}
      }

      setLoading(false);
    };

    checkSession();
  }, []);

  const login = async (email, password) => {
    try {
      // Try backend first
      const res = await fetch(\`\${API_URL}/api/auth/login\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setUser(data.user);
        setToken(data.token);
        setApiAvailable(true);
        localStorage.setItem('launchpad_token', data.token);
        localStorage.setItem('launchpad_user', JSON.stringify(data.user));
        return data.user;
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (e) {
      // If backend unavailable, use demo fallback
      if (e.message === 'Failed to fetch') {
        console.log('[Auth] Backend not available, using demo mode');
        const demoUser = {
          id: 'demo-' + Date.now(),
          name: email.split('@')[0] || 'Demo User',
          email: email,
          fullName: email.split('@')[0] || 'Demo User',
          points: 100,
          tier: 'bronze'
        };
        setUser(demoUser);
        localStorage.setItem('launchpad_user', JSON.stringify(demoUser));
        return demoUser;
      }
      throw e;
    }
  };

  const register = async (data) => {
    try {
      const res = await fetch(\`\${API_URL}/api/auth/register\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          fullName: data.name || data.fullName,
          phone: data.phone
        })
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setUser(result.user);
        setToken(result.token);
        setApiAvailable(true);
        localStorage.setItem('launchpad_token', result.token);
        localStorage.setItem('launchpad_user', JSON.stringify(result.user));
        return result.user;
      } else {
        throw new Error(result.error || 'Registration failed');
      }
    } catch (e) {
      // Backend unavailable fallback
      if (e.message === 'Failed to fetch') {
        console.log('[Auth] Backend not available, using demo mode');
        const newUser = {
          id: 'demo-' + Date.now(),
          name: data.name,
          email: data.email,
          fullName: data.name,
          points: 0,
          tier: 'bronze'
        };
        setUser(newUser);
        localStorage.setItem('launchpad_user', JSON.stringify(newUser));
        return newUser;
      }
      throw e;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch(\`\${API_URL}/api/auth/logout\`, {
          method: 'POST',
          headers: { 'Authorization': \`Bearer \${token}\` }
        });
      }
    } catch (e) {}

    setUser(null);
    setToken(null);
    localStorage.removeItem('launchpad_token');
    localStorage.removeItem('launchpad_user');
  };

  const updateProfile = async (data) => {
    try {
      if (token && apiAvailable) {
        const res = await fetch(\`\${API_URL}/api/auth/profile\`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': \`Bearer \${token}\`
          },
          body: JSON.stringify(data)
        });

        const result = await res.json();
        if (res.ok && result.success) {
          setUser(result.user);
          localStorage.setItem('launchpad_user', JSON.stringify(result.user));
          return result.user;
        }
      }
    } catch (e) {}

    // Fallback: update locally
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem('launchpad_user', JSON.stringify(updatedUser));
    return updatedUser;
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      token,
      apiAvailable,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
`;
}

// ============================================
// CART PROVIDER
// ============================================

/**
 * Generate CartProvider - shared cart context with localStorage persistence
 */
function generateCartProvider() {
  return `import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'launchpad_cart';

function loadCart() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function saveCart(cart) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch {}
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(loadCart);

  useEffect(() => { saveCart(cart); }, [cart]);

  const addToCart = useCallback((item) => {
    setCart(prev => {
      const id = item.id || item.name;
      const existing = prev.find(i => (i.id || i.name) === id);
      if (existing) {
        return prev.map(i => (i.id || i.name) === id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart(prev => prev.filter(i => (i.id || i.name) !== id));
  }, []);

  const updateQuantity = useCallback((id, qty) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(i => (i.id || i.name) !== id));
    } else {
      setCart(prev => prev.map(i => (i.id || i.name) === id ? { ...i, quantity: qty } : i));
    }
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartItemCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    return { cart: [], addToCart: () => {}, removeFromCart: () => {}, updateQuantity: () => {}, clearCart: () => {}, cartItemCount: 0, cartTotal: 0 };
  }
  return ctx;
}

export default CartContext;
`;
}

// ============================================
// SHARED COMPONENTS
// ============================================

/**
 * Generate Navbar component
 */
function generateNavbar(businessData, pageTypes, enablePortal = false, moodSliders = {}) {
  const dt = getDesignTokens(moodSliders, businessData);

  // Ensure logo color has enough contrast on dark backgrounds
  const logoColor = dt.isDark ? ensureContrast(dt.primary, dt.background) : dt.primary;

  // Get trend-aware primary CTA
  const trendCta = getTrendNavCta(businessData);

  const navLinks = pageTypes.filter(p => p !== 'order').map(p => ({
    path: p === 'home' ? '/' : `/${p}`,
    label: capitalize(p)
  }));

  const hasOrderPage = pageTypes.includes('order');

  // Add auth import if portal enabled
  const authImport = enablePortal ? `
import { useAuth } from './AuthContext';
import { User, ChevronDown, LogOut } from 'lucide-react';` : '';

  // Auth hook usage
  const authHook = enablePortal ? `
  const { user, isAuthenticated, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);` : '';

  // User menu component
  const userMenuJsx = enablePortal ? `
          {isAuthenticated ? (
            <div style={styles.userMenu}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={styles.userBtn}
              >
                <div style={styles.userAvatar}>
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="user-name" style={styles.userName}>{user?.name || 'User'}</span>
                <ChevronDown size={16} />
              </button>
              {userMenuOpen && (
                <div style={styles.userDropdown}>
                  <Link to="/dashboard" style={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>Dashboard</Link>
                  <Link to="/rewards" style={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>Rewards</Link>
                  <Link to="/profile" style={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>Profile</Link>
                  <button onClick={() => { logout(); setUserMenuOpen(false); }} style={styles.dropdownLogout}>
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={styles.authButtons}>
              <Link to="/login" style={styles.loginBtn}>Sign In</Link>
              <Link to="/register" style={styles.registerBtn}>Join</Link>
            </div>
          )}` : '';

  // Mobile user links
  const mobileUserLinks = enablePortal ? `
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" style={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
              <Link to="/rewards" style={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Rewards</Link>
              <Link to="/profile" style={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Profile</Link>
              <button onClick={() => { logout(); setMobileMenuOpen(false); }} style={styles.mobileLogout}>Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
              <Link to="/register" style={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>Join</Link>
            </>
          )}` : '';

  // Additional styles for portal
  const portalStyles = enablePortal ? `
  userMenu: { position: 'relative' },
  userBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px' },
  userAvatar: { width: '32px', height: '32px', borderRadius: '50%', background: '${dt.primary}', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '600' },
  userName: { color: '${dt.isDark ? '#e5e7eb' : '#374151'}', fontWeight: '500', fontSize: '0.9rem' },
  userDropdown: { position: 'absolute', top: '100%', right: 0, background: '${dt.cardBg}', borderRadius: '${dt.borderRadius}', boxShadow: '${dt.shadow}', padding: '8px 0', minWidth: '160px', marginTop: '8px', zIndex: 101, border: '1px solid ${dt.border}' },
  dropdownItem: { display: 'block', padding: '10px 16px', color: '${dt.text}', textDecoration: 'none', fontSize: '0.9rem', transition: 'background 0.2s' },
  dropdownLogout: { display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 16px', color: '#dc2626', background: 'transparent', border: 'none', borderTop: '1px solid ${dt.border}', cursor: 'pointer', fontSize: '0.9rem', marginTop: '4px' },
  authButtons: { display: 'flex', alignItems: 'center', gap: '12px' },
  loginBtn: { color: '${dt.primary}', textDecoration: 'none', fontWeight: '500', fontSize: '0.9rem' },
  registerBtn: { background: '${dt.primary}', color: '#fff', padding: '8px 16px', borderRadius: '${dt.borderRadius}', textDecoration: 'none', fontWeight: '500', fontSize: '0.9rem' },
  mobileLogout: { display: 'block', width: '100%', padding: '12px 0', color: '#dc2626', background: 'transparent', border: 'none', borderTop: '1px solid ${dt.border}', textAlign: 'left', fontWeight: '500', cursor: 'pointer', marginTop: '8px' },` : '';

  return `/**
 * Navbar - ${businessData.name}
 * Generated by Launchpad
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, ShoppingBag } from 'lucide-react';${authImport}
import { usePageContent } from './ContentProvider';
import { useCart } from './CartProvider';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();${authHook}
  const { cartItemCount } = useCart();
  const globalContent = usePageContent('_global');
  const navData = globalContent.navbar || {};

  const logoText = navData.logoText || '${escapeQuotes(businessData.name)}';
  const ctaLabel = navData.ctaText || '${escapeQuotes(trendCta?.label || '')}';
  const ctaPath = navData.ctaPath || '${trendCta?.path || ''}';
  const phoneNum = navData.phone || '${businessData.phone || ''}';

  const links = ${JSON.stringify(navLinks, null, 4)};

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.logoLink}>
          ${businessData.logo ? `<img src="${escapeQuotes(businessData.logo)}" alt={logoText} style={styles.logoImg} />` : `<span style={styles.logoText}>{logoText}</span>`}
        </Link>

        <div className="desktop-links" style={styles.desktopLinks}>
          {links.map((link, idx) => (
            <Link
              key={idx}
              to={link.path}
              style={{
                ...styles.link,
                color: location.pathname === link.path ? '${dt.primary}' : '${dt.isDark ? '#d1d5db' : dt.textMuted}'
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div style={styles.rightSection}>
          ${hasOrderPage ? `{cartItemCount > 0 && (
            <Link to="/order" style={styles.cartBadge} className="cart-badge" aria-label={\`Cart: \${cartItemCount} items\`}>
              <ShoppingBag size={18} />
              <span style={styles.cartCount}>{cartItemCount}</span>
            </Link>
          )}` : ''}
          ${trendCta ? `<Link to="${trendCta.path}" style={styles.primaryCta} className="nav-cta">${trendCta.label}</Link>` : ''}
          ${businessData.phone ? `<a href="tel:${businessData.phone.replace(/[^0-9]/g, '')}" style={styles.phone} className="phone-link">
            <Phone size={16} /> <span className="phone-text" style={styles.phoneText}>${businessData.phone}</span>
          </a>` : ''}${userMenuJsx}
          <button
            className="mobile-btn"
            style={styles.mobileBtn}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-menu" style={styles.mobileMenu}>
          {links.map((link, idx) => (
            <Link
              key={idx}
              to={link.path}
              style={styles.mobileLink}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          ${trendCta ? `<Link to="${trendCta.path}" style={styles.mobileCta} onClick={() => setMobileMenuOpen(false)}>${trendCta.label}</Link>` : ''}${mobileUserLinks}
        </div>
      )}
    </nav>
  );
}

const styles = {
  nav: { position: 'fixed', top: 0, left: 0, right: 0, background: '${dt.isDark ? dt.background : dt.isMedium ? dt.surface : '#fff'}', borderBottom: '1px solid ${dt.border}', zIndex: 100, fontFamily: "${dt.fontBody}" },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logoLink: { textDecoration: 'none', display: 'flex', alignItems: 'center' },
  logoImg: { height: '36px', width: 'auto', objectFit: 'contain' },
  logoText: { fontSize: '1.25rem', fontWeight: '700', color: '${logoColor}', fontFamily: "${dt.fontHeading}" },
  desktopLinks: { display: 'flex', gap: '32px', flex: 1, justifyContent: 'center' },
  link: { textDecoration: 'none', fontWeight: '500', fontSize: '15px', letterSpacing: ${dt.isLuxury ? "'1px'" : "'0.5px'"}, transition: 'color 0.2s', fontFamily: "${dt.fontBody}"${dt.isLuxury ? ", textTransform: 'uppercase', fontSize: '13px'" : ''} },
  rightSection: { display: 'flex', alignItems: 'center', gap: '16px' },
  cartBadge: { position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '${dt.isDark ? '#e5e7eb' : '#374151'}', textDecoration: 'none', padding: '6px', cursor: 'pointer' },
  cartCount: { position: 'absolute', top: '-2px', right: '-6px', background: '${dt.primary}', color: '#fff', fontSize: '11px', fontWeight: '700', minWidth: '18px', height: '18px', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 },
  phone: { display: 'flex', alignItems: 'center', gap: '6px', color: '${dt.primary}', textDecoration: 'none', fontWeight: '500', fontSize: '14px' },
  phoneText: { display: 'inline' },
  primaryCta: { background: '${dt.primary}', color: '#fff', padding: '10px 20px', borderRadius: '${dt.borderRadius}', textDecoration: 'none', fontWeight: '${dt.buttonWeight}', fontSize: '14px', transition: 'opacity 0.2s', textTransform: '${dt.buttonTransform}', letterSpacing: ${dt.isLuxury ? "'1px'" : "'0'"} },
  mobileBtn: { display: 'none', background: 'transparent', border: 'none', cursor: 'pointer', color: '${dt.isDark ? '#e5e7eb' : '#1f2937'}', padding: '8px' },
  mobileMenu: { display: 'none', padding: '16px 24px', borderTop: '1px solid ${dt.border}', background: '${dt.isDark ? dt.background : dt.isMedium ? dt.surface : '#fff'}' },
  mobileLink: { display: 'block', padding: '12px 0', color: '${dt.isDark ? '#d1d5db' : '#4b5563'}', textDecoration: 'none', fontWeight: '500', borderBottom: '1px solid ${dt.border}' },
  mobileCta: { display: 'block', marginTop: '16px', padding: '14px 20px', background: '${dt.primary}', color: '#fff', textAlign: 'center', borderRadius: '${dt.borderRadius}', textDecoration: 'none', fontWeight: '${dt.buttonWeight}' },${portalStyles}
};

// Add responsive styles via media query injection
const styleSheet = document.createElement('style');
styleSheet.textContent = \`
  @media (max-width: 768px) {
    nav .desktop-links { display: none !important; }
    nav .mobile-btn { display: flex !important; align-items: center; justify-content: center; }
    nav .mobile-menu { display: block !important; }
    nav .phone-text { display: none !important; }
    nav .phone-link { display: none !important; }
    nav .nav-cta { display: none !important; }
    nav .user-name { display: none !important; }
    nav .authButtons { display: none !important; }
    nav .userMenu { display: none !important; }
  }
\`;
document.head.appendChild(styleSheet);
`;
}

/**
 * Generate Footer component
 */
function generateFooter(businessData) {
  const colors = getColors({}, businessData);
  const year = new Date().getFullYear();
  const industry = businessData.industry || '';

  // Generate trust text from trending trust signals
  const trustText = generateFooterTrustText(businessData);

  // Determine if this is a food industry (should show Menu link)
  const foodIndustries = ['pizza-restaurant', 'steakhouse', 'coffee-cafe', 'restaurant', 'bakery'];
  const hasMenu = foodIndustries.includes(industry);

  // Format business hours for footer display
  const hours = businessData.hours || {};
  const hoursEntries = Object.entries(hours);
  let hoursDisplay = '';
  if (hoursEntries.length > 0) {
    // Check if all days have same hours
    const firstHours = hoursEntries[0][1];
    const allSame = hoursEntries.every(([_, h]) => h === firstHours);
    if (allSame) {
      hoursDisplay = `Open Daily: ${firstHours}`;
    } else {
      // Show abbreviated schedule
      const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
      const weekdayHours = weekdays.map(d => hours[d]).filter(Boolean);
      if (weekdayHours.length > 0 && weekdayHours.every(h => h === weekdayHours[0])) {
        hoursDisplay = `Mon-Fri: ${weekdayHours[0]}`;
        if (hours.saturday) hoursDisplay += ` | Sat: ${hours.saturday}`;
        if (hours.sunday) hoursDisplay += ` | Sun: ${hours.sunday}`;
      } else {
        hoursDisplay = 'See Contact for hours';
      }
    }
  }

  // Build quick links based on industry
  const quickLinksJsx = hasMenu ? `
            <Link to="/" style={styles.link}>Home</Link>
            <Link to="/menu" style={styles.link}>Menu</Link>
            <Link to="/about" style={styles.link}>About</Link>
            <Link to="/contact" style={styles.link}>Contact</Link>` : `
            <Link to="/" style={styles.link}>Home</Link>
            <Link to="/about" style={styles.link}>About</Link>
            <Link to="/contact" style={styles.link}>Contact</Link>`;

  return `/**
 * Footer - ${businessData.name}
 * Generated by Launchpad
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { usePageContent } from './ContentProvider';

export default function Footer() {
  const globalContent = usePageContent('_global');
  const footerData = globalContent.footer || {};

  const businessInfo = {
    name: footerData.logoText || '${escapeQuotes(businessData.name)}',
    address: footerData.address || '${escapeQuotes(businessData.address)}',
    phone: footerData.phone || '${businessData.phone}',
    email: footerData.email || '${businessData.email}'
  };

  const trustText = footerData.trustText || '${escapeQuotes(trustText)}';

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.grid}>
          <div style={styles.column}>
            <h3 style={styles.logo}>{businessInfo.name}</h3>
            <p style={styles.tagline}>{footerData.tagline || '${escapeQuotes(businessData.tagline)}'}</p>
            {trustText && <p style={styles.trustText}>{trustText}</p>}
          </div>

          <div style={styles.column}>
            <h4 style={styles.columnTitle}>Contact</h4>
            <a href={\`https://maps.google.com/?q=\${encodeURIComponent(businessInfo.address)}\`} target="_blank" rel="noopener noreferrer" style={styles.contactLink}>
              <MapPin size={14} style={styles.contactIcon} />
              <span>{businessInfo.address}</span>
            </a>
            <a href={\`tel:\${businessInfo.phone.replace(/[^0-9]/g, '')}\`} style={styles.contactLink}>
              <Phone size={14} style={styles.contactIcon} />
              <span>{businessInfo.phone}</span>
            </a>
            <a href={\`mailto:\${businessInfo.email}\`} style={styles.contactLink}>
              <Mail size={14} style={styles.contactIcon} />
              <span>{businessInfo.email}</span>
            </a>
            ${hoursDisplay ? `<div style={styles.hoursRow}>
              <Clock size={14} style={styles.contactIcon} />
              <span>${hoursDisplay}</span>
            </div>` : ''}
          </div>

          <div style={styles.column}>
            <h4 style={styles.columnTitle}>Quick Links</h4>${quickLinksJsx}
          </div>
        </div>

        <div style={styles.bottom}>
          <p style={styles.copyright}>© ${year} {businessInfo.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: { background: '#1f2937', color: '#fff', padding: '60px 0 24px' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '0 20px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px' },
  column: {},
  logo: { fontSize: '1.25rem', fontWeight: '700', marginBottom: '12px' },
  tagline: { color: '#9ca3af', fontSize: '0.9rem' },
  trustText: { color: '#10B981', fontSize: '0.85rem', marginTop: '12px', fontStyle: 'italic' },
  columnTitle: { fontSize: '1rem', fontWeight: '600', marginBottom: '16px' },
  text: { color: '#9ca3af', fontSize: '0.9rem', marginBottom: '8px' },
  contactLink: { display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '10px', transition: 'color 0.2s' },
  contactIcon: { flexShrink: 0, opacity: 0.7 },
  hoursRow: { display: 'flex', alignItems: 'center', gap: '8px', color: '#d1d5db', fontSize: '0.9rem', marginTop: '4px' },
  link: { display: 'block', color: '#9ca3af', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '8px', transition: 'color 0.2s' },
  bottom: { borderTop: '1px solid #374151', paddingTop: '24px', textAlign: 'center' },
  copyright: { color: '#6b7280', fontSize: '0.85rem' }
};
`;
}

// ============================================
// APP & CONFIG GENERATORS
// ============================================

/**
 * Generate App.jsx with routing
 * Now includes Navigation and Footer in the app shell for professional structure
 */
function generateAppWithRouting(pageTypes, businessData, enablePortal = false, portalPages = []) {
  const imports = pageTypes.map(p => {
    const name = capitalize(p) + 'Page';
    return `import ${name} from './pages/${name}';`;
  }).join('\n');

  const routes = pageTypes.map(p => {
    const name = capitalize(p) + 'Page';
    const path = p === 'home' ? '/' : `/${p}`;
    return `          <Route path="${path}" element={<${name} />} />`;
  }).join('\n');

  // Portal-specific imports and routes
  const portalImports = enablePortal ? portalPages.map(p => {
    const name = capitalize(p) + 'Page';
    return `import ${name} from './pages/${name}';`;
  }).join('\n') : '';

  const authContextImport = enablePortal ? `import { AuthProvider } from './components/AuthContext';` : '';
  const chatWidgetImport = enablePortal ? `import ChatWidget from './components/ChatWidget';` : '';

  const portalRoutes = enablePortal ? portalPages.map(p => {
    const name = capitalize(p) + 'Page';
    return `          <Route path="/${p}" element={<${name} />} />`;
  }).join('\n') : '';

  // App content with or without AuthProvider wrapper
  const appContent = enablePortal ? `
    <ContentProvider>
      <CartProvider>
        <AuthProvider>
          <BrowserRouter>
            <div style={styles.app}>
              <Navbar />
              <main style={styles.main}>
                <Routes>
${routes}
${portalRoutes}
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
          <ChatWidget />
        </AuthProvider>
      </CartProvider>
    </ContentProvider>` : `
    <ContentProvider>
      <CartProvider>
        <BrowserRouter>
          <div style={styles.app}>
            <Navbar />
            <main style={styles.main}>
              <Routes>
${routes}
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </CartProvider>
    </ContentProvider>`;

  return `/**
 * App.jsx - ${businessData.name}
 * Generated by Launchpad
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ContentProvider } from './components/ContentProvider';
import { CartProvider } from './components/CartProvider';
${authContextImport}
${chatWidgetImport}

${imports}
${portalImports}

export default function App() {
  return (${appContent}
  );
}

const styles = {
  app: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column'
  },
  main: {
    flex: 1,
    paddingTop: '72px' // Account for fixed navbar
  }
};
`;
}

/**
 * Generate package.json
 */
function generatePackageJson(businessName) {
  const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return {
    name: slug,
    private: true,
    version: "1.0.0",
    type: "module",
    scripts: {
      dev: "vite",
      build: "vite build",
      preview: "vite preview"
    },
    dependencies: {
      react: "^18.2.0",
      "react-dom": "^18.2.0",
      "react-router-dom": "^6.20.0",
      "lucide-react": "^0.294.0"
    },
    devDependencies: {
      "@vitejs/plugin-react": "^4.2.0",
      vite: "^5.0.0"
    }
  };
}

/**
 * Generate index.html
 */
function generateIndexHtml(businessData) {
  const businessName = typeof businessData === 'string' ? businessData : businessData.name;
  const metaDescription = generateMetaDescription(businessData);

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${escapeQuotes(metaDescription)}" />
    <title>${businessName}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Inter', system-ui, sans-serif; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`;
}

/**
 * Generate smart meta description with trending keywords
 */
function generateMetaDescription(businessData) {
  if (typeof businessData === 'string') {
    return `Welcome to ${businessData}`;
  }

  const name = businessData.name || 'Business';
  const location = businessData.location || '';
  const features = businessData.trendingFeatures || [];
  const trust = businessData.trendingTrustSignals || [];
  const tagline = businessData.tagline || '';

  let desc = name;

  // Add location
  if (location && location !== 'Your City') {
    desc += ` in ${location}`;
  }

  desc += ' - ';

  // Add tagline if short enough
  if (tagline && tagline.length < 50) {
    desc += tagline + '. ';
  }

  // Add top trending features
  if (features.length > 0) {
    const topFeatures = features.slice(0, 3).join(', ');
    desc += topFeatures + '. ';
  }

  // Add top trust signal
  if (trust.length > 0) {
    const topTrust = trust[0];
    if (topTrust.length < 30) {
      desc += topTrust + '.';
    }
  }

  // Trim to SEO-friendly length (155 chars)
  if (desc.length > 155) {
    desc = desc.substring(0, 152) + '...';
  }

  return desc;
}

/**
 * Generate main.jsx
 */
function generateMainJsx() {
  return `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;
}

/**
 * Generate vite.config.js
 */
function generateViteConfig() {
  return `import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.API_TARGET || 'http://localhost:5001';

  return {
    plugins: [react()],
    server: {
      port: 5000,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true
        }
      }
    },
    build: {
      outDir: 'dist'
    }
  };
});
`;
}

// ============================================
// AI AGENT DEFINITIONS & GENERATORS
// ============================================

const AGENT_DEFINITIONS = {
  support: {
    id: 'support', name: 'Support', role: 'Customer Support',
    icon: '🎧', color: '#10B981', category: 'operations',
    capabilities: ['Answer questions about services and hours', 'Help schedule appointments', 'Handle customer complaints', 'Provide directions and contact info']
  },
  content: {
    id: 'content', name: 'Content', role: 'Content Creation',
    icon: '✍️', color: '#8B5CF6', category: 'operations',
    capabilities: ['Create social media posts', 'Write blog outlines', 'Craft email marketing copy', 'Generate promotional content']
  },
  ads: {
    id: 'ads', name: 'Ads', role: 'Advertising',
    icon: '📢', color: '#F59E0B', category: 'revenue',
    capabilities: ['Create ad copy for Facebook/Google/Instagram', 'Suggest targeting audiences', 'Recommend ad budgets', 'A/B test variations']
  },
  monitor: {
    id: 'monitor', name: 'Monitor', role: 'System Monitoring',
    icon: '📊', color: '#EF4444', category: 'operations',
    capabilities: ['Track website traffic', 'Monitor social engagement', 'Alert on significant changes', 'Provide daily/weekly summaries']
  },
  scout: {
    id: 'scout', name: 'Scout', role: 'Market Research',
    icon: '🔍', color: '#06B6D4', category: 'revenue',
    capabilities: ['Research local competitors', 'Track competitor pricing', 'Identify market trends', 'Find partnership opportunities']
  }
};

const INDUSTRY_AGENT_MAP = {
  bakery: ['support', 'content', 'ads', 'monitor'],
  restaurant: ['support', 'content', 'ads', 'monitor'],
  cafe: ['support', 'content', 'ads', 'monitor'],
  pizza: ['support', 'content', 'ads', 'monitor'],
  bar: ['support', 'content', 'ads', 'monitor'],
  'salon-spa': ['support', 'content', 'ads', 'monitor'],
  barbershop: ['support', 'content', 'ads', 'monitor'],
  fitness: ['support', 'content', 'ads', 'monitor'],
  'yoga-studio': ['support', 'content', 'ads', 'monitor'],
  'auto-repair': ['support', 'content', 'ads', 'monitor'],
  cleaning: ['support', 'content', 'ads', 'monitor'],
  'pet-care': ['support', 'content', 'ads', 'monitor'],
  'real-estate': ['support', 'content', 'ads', 'monitor', 'scout'],
  ecommerce: ['support', 'content', 'ads', 'monitor', 'scout'],
  saas: ['support', 'content', 'ads', 'monitor'],
  photography: ['support', 'content', 'ads', 'monitor'],
  'home-improvement': ['support', 'content', 'ads', 'monitor'],
  education: ['support', 'content', 'ads', 'monitor']
};

function generateAgentPrompt(agentId, businessData) {
  const name = businessData.name || 'this business';
  const industry = businessData.industry || 'General';
  const location = businessData.location || businessData.address || '';

  const prompts = {
    support: `You are the customer support agent for ${name}.

BUSINESS INFO:
- Name: ${name}
- Industry: ${industry}
- Location: ${location}

YOUR ROLE:
- Answer customer questions about services, hours, and location
- Help schedule appointments or reservations
- Handle complaints with empathy and solutions
- Escalate complex issues appropriately

TONE: Professional, friendly, helpful. Match the business's brand voice.

When you need to create a support ticket, output:
[TICKET]
priority: low|medium|high
subject: Brief description
details: Full details
[/TICKET]`,

    content: `You are the content creation specialist for ${name}.

BUSINESS INFO:
- Name: ${name}
- Industry: ${industry}
- Location: ${location}

YOUR ROLE:
- Create social media posts (Facebook, Instagram, Twitter)
- Write blog post outlines and content
- Craft email marketing copy
- Generate promotional content

TONE: Match the business's established brand. Professional but approachable.

When creating content, always include:
1. A headline/hook
2. Main content
3. Call to action
4. Suggested hashtags (for social)`,

    ads: `You are the advertising specialist for ${name}.

BUSINESS INFO:
- Name: ${name}
- Industry: ${industry}
- Location: ${location}

YOUR ROLE:
- Create ad copy for Facebook, Google, Instagram
- Suggest targeting audiences
- Recommend ad budgets
- Write compelling headlines and descriptions
- A/B test variations

AD GUIDELINES:
- Keep headlines under 30 characters when possible
- Descriptions under 90 characters for Google
- Always include a clear CTA`,

    monitor: `You are the monitoring and analytics agent for ${name}.

BUSINESS INFO:
- Name: ${name}
- Industry: ${industry}

YOUR ROLE:
- Track website traffic and conversions
- Monitor social media engagement
- Watch review platforms for new reviews
- Alert on significant changes
- Provide daily/weekly summaries

ALERT THRESHOLDS:
- New negative review: Immediate alert
- Traffic drop >20%: Alert
- No leads in 48 hours: Alert`,

    scout: `You are the market research agent for ${name}.

BUSINESS INFO:
- Name: ${name}
- Industry: ${industry}
- Location: ${location}

YOUR ROLE:
- Research local competitors
- Track competitor pricing and offerings
- Identify market trends
- Find partnership opportunities
- Monitor industry news`
  };

  return prompts[agentId] || `You are an AI assistant for ${name}.`;
}

/**
 * Generate agents.json config for a given industry
 */
function generateAgentsJson(businessData, industry) {
  const agentIds = INDUSTRY_AGENT_MAP[industry] || INDUSTRY_AGENT_MAP.bakery;

  // Build available tools set based on industry modules
  const modules = getIndustryModulesConfig(industry);
  const availableTools = new Set(['get_business_info']);
  for (const [, type] of Object.entries(modules)) {
    if (type === 'catalog') availableTools.add('get_catalog');
    if (type === 'booking') { availableTools.add('get_bookings_today'); availableTools.add('get_booking_stats'); }
    if (type === 'listings') availableTools.add('get_listings');
    if (type === 'inquiries') availableTools.add('get_inquiry_stats');
  }

  // Agent → desired tools mapping
  const agentToolMap = {
    support: ['get_catalog', 'get_listings', 'get_bookings_today', 'get_booking_stats', 'get_inquiry_stats', 'get_business_info'],
    content: ['get_catalog', 'get_business_info'],
    ads: ['get_catalog', 'get_business_info'],
    monitor: ['get_catalog', 'get_listings', 'get_booking_stats', 'get_inquiry_stats', 'get_business_info'],
    scout: ['get_business_info']
  };

  const agents = agentIds.map(id => {
    const def = AGENT_DEFINITIONS[id];
    const desiredTools = agentToolMap[id] || ['get_business_info'];
    const tools = desiredTools.filter(t => availableTools.has(t));
    return {
      ...def,
      tools,
      systemPrompt: generateAgentPrompt(id, businessData)
    };
  });

  const categories = [
    { id: 'operations', name: 'Operations', agents: agents.filter(a => a.category === 'operations').map(a => a.id) },
    { id: 'revenue', name: 'Revenue', agents: agents.filter(a => a.category === 'revenue').map(a => a.id) }
  ].filter(c => c.agents.length > 0);

  return {
    business: {
      name: businessData.name,
      industry: industry,
      generatedAt: new Date().toISOString()
    },
    agents,
    categories
  };
}

/**
 * Generate routes/ai.js Express router for AI agent chat
 * Includes tool-use loop and usage/cost tracking
 */
function generateAIRoutes(businessData, industry) {
  const businessName = escapeQuotes(businessData.name);

  // Get industry modules to build tool definitions
  const modules = getIndustryModulesConfig(industry);
  // modules is { moduleName: moduleType } e.g. { menu: 'catalog', orders: 'inquiries' }

  // Find which module names map to each type
  let catalogModule = null;
  let bookingModule = null;
  let listingsModule = null;
  let inquiriesModule = null;

  for (const [name, type] of Object.entries(modules)) {
    if (type === 'catalog') catalogModule = name;
    if (type === 'booking') bookingModule = name;
    if (type === 'listings') listingsModule = name;
    if (type === 'inquiries') inquiriesModule = name;
  }

  // Build the tool definitions object literal as a string
  // Each tool has: name, description, input_schema, endpoint
  const toolDefs = [];

  if (catalogModule) {
    toolDefs.push(`  get_catalog: {
    name: 'get_catalog',
    description: 'Get the full ${catalogModule} catalog with all items, categories, and prices',
    input_schema: { type: 'object', properties: {}, required: [] },
    endpoint: '/api/${catalogModule}/admin'
  }`);
  }

  if (bookingModule) {
    toolDefs.push(`  get_bookings_today: {
    name: 'get_bookings_today',
    description: 'Get today\\'s ${bookingModule} - includes customer names, times, and status',
    input_schema: { type: 'object', properties: {}, required: [] },
    endpoint: '/api/${bookingModule}/admin/today'
  }`);
    toolDefs.push(`  get_booking_stats: {
    name: 'get_booking_stats',
    description: 'Get ${bookingModule} statistics - counts, trends, busiest times',
    input_schema: { type: 'object', properties: {}, required: [] },
    endpoint: '/api/${bookingModule}/admin/stats'
  }`);
  }

  if (listingsModule) {
    toolDefs.push(`  get_listings: {
    name: 'get_listings',
    description: 'Get all ${listingsModule} with status, details, and images',
    input_schema: { type: 'object', properties: {}, required: [] },
    endpoint: '/api/${listingsModule}/admin'
  }`);
  }

  if (inquiriesModule) {
    toolDefs.push(`  get_inquiry_stats: {
    name: 'get_inquiry_stats',
    description: 'Get ${inquiriesModule} statistics - new, pending, resolved counts and trends',
    input_schema: { type: 'object', properties: {}, required: [] },
    endpoint: '/api/${inquiriesModule}/admin/stats'
  }`);
  }

  // Business info is always available
  toolDefs.push(`  get_business_info: {
    name: 'get_business_info',
    description: 'Get business information - name, hours, location, contact details',
    input_schema: { type: 'object', properties: {}, required: [] },
    endpoint: '/api/brain'
  }`);

  const allToolDefsStr = toolDefs.join(',\n');

  // Build agent→tools mapping
  // Only include tools that exist for this industry
  const agentToolNames = {};

  const supportTools = ['get_catalog', 'get_bookings_today', 'get_booking_stats', 'get_inquiry_stats', 'get_business_info'];
  const contentTools = ['get_catalog', 'get_business_info'];
  const adsTools = ['get_catalog', 'get_business_info'];
  const monitorTools = ['get_catalog', 'get_booking_stats', 'get_inquiry_stats', 'get_business_info'];
  const scoutTools = ['get_business_info'];

  // Add listings tools where applicable
  if (listingsModule) {
    supportTools.splice(1, 0, 'get_listings');
    monitorTools.splice(1, 0, 'get_listings');
  }

  // All available tool names for this industry
  const availableTools = new Set(toolDefs.map(td => {
    const match = td.match(/name: '([^']+)'/);
    return match ? match[1] : null;
  }).filter(Boolean));

  agentToolNames.support = supportTools.filter(t => availableTools.has(t));
  agentToolNames.content = contentTools.filter(t => availableTools.has(t));
  agentToolNames.ads = adsTools.filter(t => availableTools.has(t));
  agentToolNames.monitor = monitorTools.filter(t => availableTools.has(t));
  agentToolNames.scout = scoutTools.filter(t => availableTools.has(t));

  const agentToolMapStr = Object.entries(agentToolNames)
    .map(([agent, tools]) => `  ${agent}: [${tools.map(t => `'${t}'`).join(', ')}]`)
    .join(',\n');

  return `/**
 * AI Agent Routes - ${businessName}
 * Generated by Launchpad
 *
 * Endpoints:
 *   GET  /agents        - List available agents
 *   POST /chat          - Chat with an agent (tool-use enabled)
 *   GET  /health        - AI health check
 *   GET  /usage         - Full usage/cost tracking data
 *   GET  /usage/summary - Today's cost summary
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// ============================================
// LOAD API KEY FROM SETTINGS (if not in .env)
// ============================================
if (!process.env.ANTHROPIC_API_KEY) {
  try {
    const settingsPath = path.join(__dirname, '..', 'data', 'settings.json');
    if (fs.existsSync(settingsPath)) {
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      if (settings.anthropicApiKey) {
        process.env.ANTHROPIC_API_KEY = settings.anthropicApiKey;
        console.log('[AI] API key loaded from settings.json');
      }
    }
  } catch (e) {
    console.error('[AI] Failed to load API key from settings:', e.message);
  }
}

// ============================================
// TOOL DEFINITIONS (industry-specific)
// ============================================

const TOOL_DEFINITIONS = {
${allToolDefsStr}
};

// Agent → allowed tool names
const AGENT_TOOLS = {
${agentToolMapStr}
};

// ============================================
// USAGE TRACKING
// ============================================

const USAGE_FILE = path.join(__dirname, '..', 'data', 'ai-usage.json');
const MAX_RECENT_CALLS = 200;

// Cost per million tokens (Claude Sonnet)
const COST_INPUT = 3.00;
const COST_OUTPUT = 15.00;

function calculateCost(inputTokens, outputTokens) {
  return (inputTokens / 1_000_000 * COST_INPUT) + (outputTokens / 1_000_000 * COST_OUTPUT);
}

function loadUsageData() {
  try {
    if (fs.existsSync(USAGE_FILE)) {
      return JSON.parse(fs.readFileSync(USAGE_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('[AI] Failed to read usage file:', e.message);
  }
  return {
    totals: { calls: 0, inputTokens: 0, outputTokens: 0, totalCost: 0, toolCalls: 0 },
    byAgent: {},
    byDay: {},
    recentCalls: []
  };
}

function saveUsageData(data) {
  try {
    const dir = path.dirname(USAGE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(USAGE_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('[AI] Failed to write usage file:', e.message);
  }
}

function trackUsage(agentId, model, inputTokens, outputTokens, toolsUsed, durationMs) {
  const data = loadUsageData();
  const cost = calculateCost(inputTokens, outputTokens);
  const today = new Date().toISOString().split('T')[0];
  const toolCallCount = toolsUsed.length;

  // Update totals
  data.totals.calls += 1;
  data.totals.inputTokens += inputTokens;
  data.totals.outputTokens += outputTokens;
  data.totals.totalCost += cost;
  data.totals.toolCalls += toolCallCount;

  // Update byAgent
  if (!data.byAgent[agentId]) {
    data.byAgent[agentId] = { calls: 0, inputTokens: 0, outputTokens: 0, totalCost: 0, toolCalls: 0 };
  }
  data.byAgent[agentId].calls += 1;
  data.byAgent[agentId].inputTokens += inputTokens;
  data.byAgent[agentId].outputTokens += outputTokens;
  data.byAgent[agentId].totalCost += cost;
  data.byAgent[agentId].toolCalls += toolCallCount;

  // Update byDay
  if (!data.byDay[today]) {
    data.byDay[today] = { calls: 0, inputTokens: 0, outputTokens: 0, totalCost: 0, toolCalls: 0 };
  }
  data.byDay[today].calls += 1;
  data.byDay[today].inputTokens += inputTokens;
  data.byDay[today].outputTokens += outputTokens;
  data.byDay[today].totalCost += cost;
  data.byDay[today].toolCalls += toolCallCount;

  // Add to recent calls (capped)
  data.recentCalls.unshift({
    timestamp: new Date().toISOString(),
    agentId,
    model,
    inputTokens,
    outputTokens,
    cost,
    toolsUsed,
    durationMs
  });
  if (data.recentCalls.length > MAX_RECENT_CALLS) {
    data.recentCalls = data.recentCalls.slice(0, MAX_RECENT_CALLS);
  }

  saveUsageData(data);
  return { cost, inputTokens, outputTokens, toolsUsed, toolCallCount };
}

// ============================================
// TOOL EXECUTOR
// ============================================

async function executeTool(toolName, toolInput) {
  const tool = TOOL_DEFINITIONS[toolName];
  if (!tool) {
    return { error: 'Unknown tool: ' + toolName };
  }

  try {
    // Internal fetch to our own server
    const port = process.env.PORT || 3001;
    const url = 'http://localhost:' + port + tool.endpoint;
    const res = await fetch(url);
    if (!res.ok) {
      return { error: 'Endpoint returned ' + res.status + ': ' + res.statusText };
    }
    return await res.json();
  } catch (e) {
    return { error: 'Tool execution failed: ' + e.message };
  }
}

// ============================================
// AGENT HELPERS
// ============================================

// Load agents config
function loadAgents() {
  // Clear require cache so edits to agents.json are picked up
  const agentsPath = path.join(__dirname, '..', '..', 'admin', 'agents.json');
  delete require.cache[require.resolve(agentsPath)];
  return require(agentsPath);
}

function getToolsForAgent(agentId) {
  const toolNames = AGENT_TOOLS[agentId] || [];
  return toolNames
    .filter(name => TOOL_DEFINITIONS[name])
    .map(name => ({
      name: TOOL_DEFINITIONS[name].name,
      description: TOOL_DEFINITIONS[name].description,
      input_schema: TOOL_DEFINITIONS[name].input_schema
    }));
}

// ============================================
// ROUTES
// ============================================

// GET /agents - list available agents (without system prompts)
router.get('/agents', (req, res) => {
  try {
    const config = loadAgents();
    const safeAgents = config.agents.map(a => ({
      id: a.id,
      name: a.name,
      role: a.role,
      icon: a.icon,
      color: a.color,
      category: a.category,
      capabilities: a.capabilities || [],
      tools: a.tools || []
    }));

    res.json({
      success: true,
      agents: safeAgents,
      categories: config.categories,
      business: config.business
    });
  } catch (error) {
    console.error('[AI] Failed to load agents:', error.message);
    res.status(500).json({ success: false, error: 'Failed to load agents' });
  }
});

// POST /chat - chat with an agent (tool-use loop)
router.post('/chat', async (req, res) => {
  const startTime = Date.now();
  try {
    const { agentId, message, conversationHistory = [] } = req.body;

    if (!agentId || !message) {
      return res.status(400).json({ success: false, error: 'agentId and message are required' });
    }

    // Load agent config
    const config = loadAgents();
    const agent = config.agents.find(a => a.id === agentId);
    if (!agent) {
      return res.status(404).json({ success: false, error: 'Agent not found' });
    }

    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(503).json({
        success: false,
        error: 'AI not configured',
        message: 'Add ANTHROPIC_API_KEY to your .env file to enable AI chat. Get a key at https://console.anthropic.com'
      });
    }

    // Call Anthropic API with tools
    const Anthropic = require('@anthropic-ai/sdk');
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const MODEL = 'claude-sonnet-4-20250514';

    const tools = getToolsForAgent(agentId);
    const messages = [
      ...conversationHistory.filter(m => m.role === 'user' || m.role === 'assistant'),
      { role: 'user', content: message }
    ];

    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    const toolsUsed = [];
    let apiCalls = 0;

    // Initial API call
    const apiParams = {
      model: MODEL,
      max_tokens: 2048,
      system: agent.systemPrompt,
      messages
    };
    if (tools.length > 0) {
      apiParams.tools = tools;
    }

    let response = await anthropic.messages.create(apiParams);
    apiCalls++;
    totalInputTokens += response.usage.input_tokens;
    totalOutputTokens += response.usage.output_tokens;

    // Tool-use loop
    while (response.stop_reason === 'tool_use') {
      // Find all tool_use blocks
      const toolUseBlocks = response.content.filter(b => b.type === 'tool_use');

      // Execute each tool and build results
      const toolResults = [];
      for (const block of toolUseBlocks) {
        toolsUsed.push(block.name);
        const result = await executeTool(block.name, block.input);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: JSON.stringify(result)
        });
      }

      // Append assistant response + tool results to messages
      messages.push({ role: 'assistant', content: response.content });
      messages.push({ role: 'user', content: toolResults });

      // Call API again
      response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 2048,
        system: agent.systemPrompt,
        messages,
        tools: tools.length > 0 ? tools : undefined
      });
      apiCalls++;
      totalInputTokens += response.usage.input_tokens;
      totalOutputTokens += response.usage.output_tokens;
    }

    // Extract final text
    const textBlock = response.content.find(b => b.type === 'text');
    const assistantMessage = textBlock ? textBlock.text : '';

    // Track usage
    const durationMs = Date.now() - startTime;
    const usageInfo = trackUsage(agentId, MODEL, totalInputTokens, totalOutputTokens, toolsUsed, durationMs);

    res.json({
      success: true,
      agentId,
      agentName: agent.name,
      message: assistantMessage,
      usage: {
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
        cost: usageInfo.cost,
        toolsUsed: [...new Set(toolsUsed)],
        apiCalls
      }
    });
  } catch (error) {
    console.error('[AI] Chat error:', error.message);
    res.status(500).json({ success: false, error: 'AI request failed', details: error.message });
  }
});

// GET /usage - full usage tracking data
router.get('/usage', (req, res) => {
  try {
    const data = loadUsageData();
    res.json({ success: true, ...data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to load usage data' });
  }
});

// GET /usage/summary - lightweight today's cost only
router.get('/usage/summary', (req, res) => {
  try {
    const data = loadUsageData();
    const today = new Date().toISOString().split('T')[0];
    res.json({
      success: true,
      totals: data.totals,
      today: data.byDay[today] || { calls: 0, inputTokens: 0, outputTokens: 0, totalCost: 0, toolCalls: 0 }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to load usage summary' });
  }
});

// GET /health - AI health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    aiConfigured: !!process.env.ANTHROPIC_API_KEY,
    toolsAvailable: Object.keys(TOOL_DEFINITIONS).length,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
`;
}

// ============================================
// SETTINGS / API-KEY MANAGEMENT ROUTE
// ============================================

/**
 * Generate settings route for API key management
 * Endpoints:
 *   GET    /              - Get current settings (masked key)
 *   POST   /api-key       - Save API key
 *   DELETE /api-key       - Remove API key
 */
function generateSettingsRoute() {
  return `/**
 * Settings Routes - API Key Management
 * Generated by Launchpad
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const SETTINGS_FILE = path.join(__dirname, '..', 'data', 'settings.json');

function loadSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('[Settings] Failed to read settings:', e.message);
  }
  return {};
}

function saveSettings(data) {
  try {
    const dir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('[Settings] Failed to write settings:', e.message);
  }
}

function maskKey(key) {
  if (!key || key.length < 12) return '****';
  return key.substring(0, 7) + '...' + key.substring(key.length - 4);
}

// GET / - Current settings (masked)
router.get('/', (req, res) => {
  const settings = loadSettings();
  const hasKey = !!settings.anthropicApiKey;
  res.json({
    success: true,
    anthropicKey: {
      configured: hasKey,
      masked: hasKey ? maskKey(settings.anthropicApiKey) : null
    }
  });
});

// POST /api-key - Save API key
router.post('/api-key', (req, res) => {
  const { key } = req.body;
  if (!key || typeof key !== 'string') {
    return res.status(400).json({ success: false, error: 'API key is required' });
  }
  if (!key.startsWith('sk-ant-')) {
    return res.status(400).json({ success: false, error: 'Invalid key format. Anthropic keys start with sk-ant-' });
  }

  const settings = loadSettings();
  settings.anthropicApiKey = key;
  saveSettings(settings);

  // Set in process so AI routes work immediately
  process.env.ANTHROPIC_API_KEY = key;

  console.log('[Settings] API key saved and activated');
  res.json({
    success: true,
    anthropicKey: {
      configured: true,
      masked: maskKey(key)
    }
  });
});

// DELETE /api-key - Remove API key
router.delete('/api-key', (req, res) => {
  const settings = loadSettings();
  delete settings.anthropicApiKey;
  saveSettings(settings);

  delete process.env.ANTHROPIC_API_KEY;

  console.log('[Settings] API key removed');
  res.json({
    success: true,
    anthropicKey: { configured: false, masked: null }
  });
});

module.exports = router;
`;
}

// ============================================
// BACKEND GENERATION
// ============================================

/**
 * Generate complete backend with auth, API routes, and server
 */
function generateBackend(backendDir, businessData, industry, enablePortal = true) {
  const modulesDir = path.join(backendDir, 'modules');
  const routesDir = path.join(backendDir, 'routes');
  const authDir = path.join(modulesDir, 'auth');
  const authRoutesDir = path.join(authDir, 'routes');

  // Create directories
  [backendDir, modulesDir, routesDir, authDir, authRoutesDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  const generatedFiles = [];

  // 1. Generate server.js
  const serverCode = generateServerJs(businessData, enablePortal, industry);
  fs.writeFileSync(path.join(backendDir, 'server.js'), serverCode);
  generatedFiles.push('server.js');

  // 2. Generate auth routes
  const authCode = generateAuthRoutes(businessData);
  fs.writeFileSync(path.join(authRoutesDir, 'auth.js'), authCode);
  generatedFiles.push('modules/auth/routes/auth.js');

  // 3. Generate health route
  const healthCode = generateHealthRoute(businessData);
  fs.writeFileSync(path.join(routesDir, 'health.js'), healthCode);
  generatedFiles.push('routes/health.js');

  // 4. Generate brain route
  const brainCode = generateBrainRoute(businessData);
  fs.writeFileSync(path.join(routesDir, 'brain.js'), brainCode);
  generatedFiles.push('routes/brain.js');

  // 5. Generate package.json
  const packageJson = generateBackendPackageJson(businessData.name);
  fs.writeFileSync(path.join(backendDir, 'package.json'), JSON.stringify(packageJson, null, 2));
  generatedFiles.push('package.json');

  // 6. Generate .env.example
  const envExample = generateEnvExample(businessData);
  fs.writeFileSync(path.join(backendDir, '.env.example'), envExample);
  generatedFiles.push('.env.example');

  // 6b. Generate .gitignore
  const gitignoreContent = `node_modules/\n.env\ndata/\n`;
  fs.writeFileSync(path.join(backendDir, '.gitignore'), gitignoreContent);
  generatedFiles.push('.gitignore');

  // 7. Generate AI agent routes and config
  const aiRouteCode = generateAIRoutes(businessData, industry);
  fs.writeFileSync(path.join(routesDir, 'ai.js'), aiRouteCode);
  generatedFiles.push('routes/ai.js');

  // 7b. Generate settings route (API key management)
  const settingsRouteCode = generateSettingsRoute();
  fs.writeFileSync(path.join(routesDir, 'settings.js'), settingsRouteCode);
  generatedFiles.push('routes/settings.js');

  // 7c. Generate content routes (Website Editor API)
  const contentRouteCode = generateContentRoutes(businessData);
  fs.writeFileSync(path.join(routesDir, 'content.js'), contentRouteCode);
  generatedFiles.push('routes/content.js');

  // 7d. Generate customer & loyalty routes
  const customerRouteCode = generateCustomerRoutes(businessData, industry);
  fs.writeFileSync(path.join(routesDir, 'customers.js'), customerRouteCode);
  generatedFiles.push('routes/customers.js');

  // 7e. Generate chat routes
  const chatRouteCode = generateChatRoutes(businessData);
  fs.writeFileSync(path.join(routesDir, 'chat.js'), chatRouteCode);
  generatedFiles.push('routes/chat.js');

  // Generate agents.json in admin directory (sibling to backend)
  const adminDir = path.join(backendDir, '..', 'admin');
  if (!fs.existsSync(adminDir)) fs.mkdirSync(adminDir, { recursive: true });
  const agentsConfig = generateAgentsJson(businessData, industry);
  fs.writeFileSync(path.join(adminDir, 'agents.json'), JSON.stringify(agentsConfig, null, 2));
  generatedFiles.push('../admin/agents.json');

  // 8. Generate industry-specific routes if needed
  const industryRoutes = generateIndustryRoutes(industry, modulesDir, businessData);
  generatedFiles.push(...industryRoutes);

  return {
    files: generatedFiles.length,
    modules: ['auth', 'ai', ...getIndustryModules(industry)]
  };
}

/**
 * Generate server.js
 */
function generateServerJs(businessData, enablePortal, industry) {
  const businessName = escapeQuotes(businessData.name);
  const industryModules = getIndustryModules(industry);

  // Build module imports
  const moduleImports = industryModules.map(mod =>
    `const ${mod}Routes = require('./modules/${mod}/routes/${mod}.js');`
  ).join('\n');

  // Build route registrations
  const routeRegistrations = industryModules.map(mod =>
    `app.use('/api/${mod}', ${mod}Routes);`
  ).join('\n');

  return `/**
 * ${businessName} - Backend Server
 * Generated by Launchpad
 *
 * Run: npm install && npm run dev
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// Trust proxy (required for Railway/Heroku/etc behind load balancer)
app.set('trust proxy', 1);

// ============================================
// MIDDLEWARE
// ============================================

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    const allowedPatterns = [/localhost/, /127\\.0\\.0\\.1/, /\\.railway\\.app$/, /\\.vercel\\.app$/];
    const isAllowed = allowedPatterns.some(p => p.test(origin));
    callback(null, isAllowed || true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.options('*', cors());
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ============================================
// AUTH ROUTES
// ============================================

const authRoutes = require('./modules/auth/routes/auth.js');
app.use('/api/auth', authRoutes);

// ============================================
// INDUSTRY ROUTES
// ============================================

${moduleImports}

${routeRegistrations}

// ============================================
// AI AGENT ROUTES
// ============================================

try {
  const aiRoutes = require('./routes/ai.js');
  app.use('/api/admin/ai', aiRoutes);
  console.log('[AI] Agent routes loaded');
} catch (e) {
  console.log('[AI] Agent routes not available:', e.message);
}

// ============================================
// SETTINGS ROUTES (API key management)
// ============================================

try {
  const settingsRoutes = require('./routes/settings.js');
  app.use('/api/admin/settings', settingsRoutes);
  console.log('[Settings] Settings routes loaded');
} catch (e) {
  console.log('[Settings] Settings routes not available:', e.message);
}

// ============================================
// CONTENT ROUTES (Website Editor)
// ============================================

try {
  const contentRoutes = require('./routes/content.js');
  app.use('/api/content', contentRoutes);
  console.log('[Content] Website editor routes loaded');
} catch (e) {
  console.log('[Content] Content routes not available:', e.message);
}

// ============================================
// CUSTOMER & LOYALTY ROUTES
// ============================================

try {
  const customerRoutes = require('./routes/customers.js');
  app.use('/api/admin', customerRoutes);
  console.log('[Customers] Customer & loyalty routes loaded');
} catch (e) {
  console.log('[Customers] Customer routes not available:', e.message);
}

// ============================================
// CHAT ROUTES
// ============================================

try {
  const chatRoutes = require('./routes/chat.js');
  app.use('/api/chat', chatRoutes);
  console.log('[Chat] Customer-admin chat routes loaded');
} catch (e) {
  console.log('[Chat] Chat routes not available:', e.message);
}

// ============================================
// CORE ROUTES
// ============================================

const healthRoutes = require('./routes/health');
const brainRoutes = require('./routes/brain');

app.use('/api/health', healthRoutes);
app.use('/api/brain', brainRoutes);

// Quick health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    project: '${businessName.replace(/'/g, "\\'")}',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════════════');
  console.log(\`  ${businessName.replace(/`/g, "\\`")} Backend\`);
  console.log('═══════════════════════════════════════════════');
  console.log(\`  🚀 Server running on port \${PORT}\`);
  console.log(\`  📍 http://localhost:\${PORT}\`);
  console.log(\`  🔐 Auth: http://localhost:\${PORT}/api/auth\`);
  console.log(\`  🤖 AI Agents: http://localhost:\${PORT}/api/admin/ai/agents\`);
  console.log(\`  💚 Health: http://localhost:\${PORT}/health\`);
  console.log('');
  console.log('  Demo accounts:');
  console.log('    demo@demo.com / admin123');
  console.log('    admin@demo.com / admin123');
  console.log('═══════════════════════════════════════════════');
});

module.exports = app;
`;
}

/**
 * Generate auth routes with test mode
 */
function generateAuthRoutes(businessData) {
  return `/**
 * Auth Routes - ${escapeQuotes(businessData.name)}
 * Generated by Launchpad
 *
 * Features:
 * - Test mode: Demo accounts + in-memory storage
 * - Database mode: PostgreSQL (when DATABASE_URL set)
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'launchpad-dev-secret-change-in-production';
const JWT_EXPIRES = '24h';
const PASSWORD_MIN_LENGTH = 8;

// Try to load database
let db = null;
try {
  db = require('../database/db');
} catch (e) {
  console.log('[Auth] Database not available, using test mode');
}

// ============================================
// TEST MODE: In-Memory Storage
// ============================================

const testUsers = new Map();
let testUserIdCounter = 100;

// Demo accounts
const DEMO_ACCOUNTS = {
  'demo@demo.com': {
    id: 1, email: 'demo@demo.com',
    password_hash: '$2a$12$eBQLfuGeiFOT8x/n.z1G2e4L5LDXz8tNMP9CvufFVJUtUxHnPg42m', // admin123
    full_name: 'Demo User', subscription_tier: 'free', is_admin: false,
    points: 150, tier: 'bronze'
  },
  'admin@demo.com': {
    id: 2, email: 'admin@demo.com',
    password_hash: '$2a$12$eBQLfuGeiFOT8x/n.z1G2e4L5LDXz8tNMP9CvufFVJUtUxHnPg42m', // admin123
    full_name: 'Admin Demo', subscription_tier: 'premium', is_admin: true,
    points: 500, tier: 'gold'
  }
};

Object.values(DEMO_ACCOUNTS).forEach(u => testUsers.set(u.email.toLowerCase(), { ...u }));

// ============================================
// HELPERS
// ============================================

function isDatabaseAvailable() { return db && typeof db.query === 'function'; }
function generateToken(user) { return jwt.sign({ id: user.id, userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES }); }
function formatUserResponse(user) {
  return {
    id: user.id, email: user.email,
    fullName: user.full_name || user.fullName || user.name,
    name: user.full_name || user.fullName || user.name,
    subscriptionTier: user.subscription_tier || 'free',
    isAdmin: user.is_admin || false,
    points: user.points || 0, tier: user.tier || 'bronze'
  };
}

// ============================================
// REGISTER
// ============================================

router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, name } = req.body;
    const userName = fullName || name || 'User';
    const userEmail = email?.toLowerCase();

    if (!userEmail) return res.status(400).json({ success: false, error: 'Email is required' });
    if (!password || password.length < PASSWORD_MIN_LENGTH) {
      return res.status(400).json({ success: false, error: \`Password must be at least \${PASSWORD_MIN_LENGTH} characters\` });
    }

    if (isDatabaseAvailable()) {
      const existing = await db.query('SELECT * FROM users WHERE email = $1', [userEmail]);
      if (existing.rows?.length > 0) return res.status(400).json({ success: false, error: 'Email already registered' });

      const hash = await bcrypt.hash(password, 12);
      const result = await db.query(
        'INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id',
        [userEmail, hash, userName]
      );
      const userResult = await db.query('SELECT * FROM users WHERE id = $1', [result.rows[0].id]);
      const user = userResult.rows[0];
      res.json({ success: true, token: generateToken(user), user: formatUserResponse(user), source: 'database' });
    } else {
      if (testUsers.has(userEmail)) return res.status(400).json({ success: false, error: 'Email already registered' });

      const hash = await bcrypt.hash(password, 12);
      const newUser = {
        id: ++testUserIdCounter, email: userEmail, password_hash: hash,
        full_name: userName, subscription_tier: 'free', is_admin: false,
        points: 0, tier: 'bronze', created_at: new Date().toISOString()
      };
      testUsers.set(userEmail, newUser);
      res.json({ success: true, token: generateToken(newUser), user: formatUserResponse(newUser), source: 'test-mode' });
    }
  } catch (error) {
    console.error('[Auth] Register error:', error);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

// ============================================
// LOGIN
// ============================================

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const userEmail = email?.toLowerCase();
    if (!userEmail || !password) return res.status(400).json({ success: false, error: 'Email and password required' });

    let user = null, source = 'database';

    if (isDatabaseAvailable()) {
      try {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [userEmail]);
        user = result.rows?.[0];
      } catch (e) { console.log('[Auth] DB query failed, falling back to test mode'); }
    }

    if (!user) { user = testUsers.get(userEmail); source = 'test-mode'; }
    if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    res.json({ success: true, token: generateToken(user), user: formatUserResponse(user), source });
  } catch (error) {
    console.error('[Auth] Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// ============================================
// AUTH MIDDLEWARE
// ============================================

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, error: 'Access token required' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(403).json({ success: false, error: 'Invalid or expired token' });
  }
};

// ============================================
// GET PROFILE
// ============================================

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email?.toLowerCase();
    let user = null, source = 'database';

    if (isDatabaseAvailable()) {
      try {
        const result = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
        user = result.rows?.[0];
      } catch (e) {}
    }

    if (!user && userEmail) { user = testUsers.get(userEmail); source = 'test-mode'; }
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    res.json({ success: true, user: formatUserResponse(user), source });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/profile', authenticateToken, (req, res) => router.handle({ ...req, method: 'GET', url: '/me' }, res));

// ============================================
// UPDATE PROFILE
// ============================================

router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email?.toLowerCase();
    const { fullName, name, phone } = req.body;
    const newName = fullName || name;

    if (isDatabaseAvailable()) {
      await db.query('UPDATE users SET full_name = COALESCE($1, full_name), phone = COALESCE($2, phone) WHERE id = $3', [newName, phone, req.user.id]);
      const result = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
      res.json({ success: true, user: formatUserResponse(result.rows[0]), source: 'database' });
    } else {
      const user = testUsers.get(userEmail);
      if (!user) return res.status(404).json({ success: false, error: 'User not found' });
      if (newName) user.full_name = newName;
      if (phone) user.phone = phone;
      res.json({ success: true, user: formatUserResponse(user), source: 'test-mode' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Update failed' });
  }
});

// ============================================
// LOGOUT & VERIFY
// ============================================

router.post('/logout', (req, res) => res.json({ success: true, message: 'Logged out' }));
router.get('/verify', authenticateToken, (req, res) => res.json({ success: true, valid: true, user: { id: req.user.id, email: req.user.email } }));

// Expose internals for other modules (e.g. customers.js)
router.testUsers = testUsers;
router.DEMO_ACCOUNTS = DEMO_ACCOUNTS;
router.db = db;
router.isDatabaseAvailable = isDatabaseAvailable;

module.exports = router;
`;
}

/**
 * Generate health route
 */
function generateHealthRoute(businessData) {
  const businessName = escapeQuotes(businessData.name);
  return `/**
 * Health Check Route - ${businessName}
 */

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    project: '${businessName.replace(/'/g, "\\'")}',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '1.0.0'
  });
});

router.get('/ready', (req, res) => {
  res.json({ ready: true });
});

router.get('/live', (req, res) => {
  res.json({ live: true });
});

module.exports = router;
`;
}

/**
 * Generate brain route
 */
function generateBrainRoute(businessData) {
  const businessName = escapeQuotes(businessData.name);
  return `/**
 * Brain Route - ${businessName}
 * Returns business configuration
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Try to load brain.json
let brain = null;
try {
  const brainPath = path.join(__dirname, '../../brain.json');
  if (fs.existsSync(brainPath)) {
    brain = JSON.parse(fs.readFileSync(brainPath, 'utf8'));
  }
} catch (e) {
  console.log('[Brain] Could not load brain.json');
}

router.get('/', (req, res) => {
  if (brain) {
    res.json({ success: true, brain });
  } else {
    res.json({
      success: true,
      brain: {
        name: '${businessName.replace(/'/g, "\\'")}',
        generatedBy: 'launchpad',
        note: 'brain.json not found, using defaults'
      }
    });
  }
});

module.exports = router;
`;
}

/**
 * Generate backend package.json
 */
function generateBackendPackageJson(businessName) {
  const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
  return {
    name: slug + '-backend',
    version: '1.0.0',
    description: 'Backend API for ' + businessName,
    main: 'server.js',
    scripts: {
      start: 'node server.js',
      dev: 'node server.js',
      test: 'echo "No tests configured"'
    },
    dependencies: {
      'express': '^4.18.2',
      'cors': '^2.8.5',
      'helmet': '^7.1.0',
      'dotenv': '^16.3.1',
      'bcryptjs': '^2.4.3',
      'jsonwebtoken': '^9.0.2',
      '@anthropic-ai/sdk': '^0.39.0'
    },
    engines: {
      node: '>=18.0.0'
    }
  };
}

/**
 * Generate .env.example
 */
function generateEnvExample(businessData) {
  return `# ${businessData.name} Backend Environment Variables
# Copy this file to .env and fill in your values

# Server
PORT=5001
NODE_ENV=development

# JWT Secret (change this in production!)
JWT_SECRET=your-super-secret-jwt-key-change-me

# Database (optional - uses test mode if not set)
# DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5000

# AI Agents (optional - enables AI chat in admin)
# ANTHROPIC_API_KEY=sk-ant-...
`;
}

/**
 * Get industry-specific modules (array of module names)
 * Now uses the centralized config from industry-modules.cjs
 */
function getIndustryModules(industry) {
  return getModuleNames(industry);
}

/**
 * Generate industry-specific routes
 */
function generateIndustryRoutes(industry, modulesDir, businessData) {
  const modules = getIndustryModules(industry);
  const generatedFiles = [];

  modules.forEach(mod => {
    const modDir = path.join(modulesDir, mod, 'routes');
    if (!fs.existsSync(modDir)) fs.mkdirSync(modDir, { recursive: true });

    const routeCode = generateModuleRoute(mod, industry, businessData);
    fs.writeFileSync(path.join(modDir, mod + '.js'), routeCode);
    generatedFiles.push('modules/' + mod + '/routes/' + mod + '.js');
  });

  return generatedFiles;
}

/**
 * Generate a module route file
 * Dispatches to the appropriate generator based on module type
 */
function generateModuleRoute(moduleName, industry, businessData) {
  // Get the module type from config
  const moduleType = getModuleType(moduleName, industry);
  const labelConfig = getModuleLabel(moduleName);

  // Dispatch to type-specific generator
  switch (moduleType) {
    case 'catalog':
      return generateCatalogRoutes(moduleName, industry, businessData, labelConfig);
    case 'booking':
      return generateBookingRoutes(moduleName, industry, businessData, labelConfig);
    case 'listings':
      return generateListingsRoutes(moduleName, industry, businessData, labelConfig);
    case 'inquiries':
      return generateInquiriesRoutes(moduleName, industry, businessData, labelConfig);
    default:
      return generateGenericModuleRoutes(moduleName, industry, businessData, labelConfig);
  }
}

// ============================================
// CATALOG ROUTES GENERATOR (Menu, Services, Classes, Features, Products, Programs)
// ============================================

/**
 * Generate Catalog Routes - generalized for menu, services, classes, etc.
 * Includes admin routes and SSE for real-time updates
 */
function generateCatalogRoutes(moduleName, industry, businessData, labelConfig) {
  const moduleTitle = labelConfig.label;
  const singular = labelConfig.singular;
  const plural = labelConfig.plural;

  // Get catalog data from businessData based on module name
  let catalogData = [];
  let itemIdCounter = 1;
  let categoryIdCounter = 1;

  // Try to get data from fixture - check multiple possible locations
  const fixtureData = businessData?.[moduleName]?.categories
    || businessData?.pages?.[moduleName]?.categories
    || businessData?.pages?.['practice-areas']?.areas
    || businessData?.[moduleName]
    || null;

  if (fixtureData && Array.isArray(fixtureData) && fixtureData.length > 0) {
    catalogData = fixtureData.map((cat, catIdx) => ({
      id: categoryIdCounter++,
      name: cat.name,
      description: cat.description || '',
      display_order: catIdx + 1,
      active: true,
      items: (cat.items || cat.services || []).map((item, itemIdx) => ({
        id: itemIdCounter++,
        name: item.name,
        price: item.price || null,
        description: item.description || '',
        image: item.image || null,
        duration: item.duration || null,
        available: true,
        popular: (item.badges || []).includes('popular'),
        display_order: itemIdx + 1
      }))
    }));
  } else {
    catalogData = generateSampleCatalogData(moduleName, industry);
    itemIdCounter = 10;
    categoryIdCounter = 5;
  }

  // Escape for safe embedding in template literal: backticks, ${, and backslashes
  const catalogDataStr = JSON.stringify(catalogData, null, 2)
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');

  return `/**
 * ${moduleTitle} Routes - Public & Admin APIs with SSE
 * Module: ${moduleName} (catalog type)
 * Generated by Launchpad
 */

const express = require('express');
const router = express.Router();

// ============================================
// IN-MEMORY DATA STORE (replace with database)
// ============================================

let categories = ${catalogDataStr};

let nextItemId = ${itemIdCounter};
let nextCategoryId = ${categoryIdCounter};

// SSE clients for real-time updates
const sseClients = new Set();

function broadcastUpdate(type, data) {
  const message = JSON.stringify({ type, data, timestamp: new Date().toISOString() });
  sseClients.forEach(client => {
    client.write(\`data: \${message}\\n\\n\`);
  });
}

// Helper to get flat item list
function getAllItems() {
  return categories.flatMap(cat => cat.items.map(item => ({ ...item, category: cat.name, category_id: cat.id })));
}

// ============================================
// PUBLIC ROUTES
// ============================================

// GET /api/${moduleName} - Full ${moduleName} for public display
router.get('/', (req, res) => {
  const publicData = categories
    .filter(cat => cat.active)
    .map(cat => ({
      ...cat,
      items: cat.items.filter(item => item.available)
    }));
  res.json({ success: true, categories: publicData, ${moduleName}: getAllItems().filter(i => i.available) });
});

// ============================================
// ADMIN ROUTES
// ============================================

// GET /api/${moduleName}/admin - Full data for admin (includes inactive/unavailable)
router.get('/admin', (req, res) => {
  res.json({ success: true, categories });
});

// POST /api/${moduleName}/admin/category - Create category
router.post('/admin/category', (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ success: false, error: 'Name is required' });

  const newCategory = {
    id: nextCategoryId++,
    name,
    description: description || '',
    display_order: categories.length + 1,
    active: true,
    items: []
  };
  categories.push(newCategory);
  broadcastUpdate('category_added', newCategory);
  res.status(201).json({ success: true, category: newCategory });
});

// POST /api/${moduleName}/admin/item - Create item
router.post('/admin/item', (req, res) => {
  const { category_id, name, price, description, duration } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, error: 'Name is required' });
  }

  const category = categories.find(c => c.id === parseInt(category_id));
  if (!category) return res.status(404).json({ success: false, error: 'Category not found' });

  const newItem = {
    id: nextItemId++,
    name,
    price: price ? parseFloat(price) : null,
    description: description || '',
    duration: duration || null,
    available: true,
    popular: false,
    display_order: category.items.length + 1
  };
  category.items.push(newItem);
  broadcastUpdate('item_added', { ...newItem, category_id: category.id });
  res.status(201).json({ success: true, item: newItem });
});

// PUT /api/${moduleName}/admin/item/:id - Update item
router.put('/admin/item/:id', (req, res) => {
  const itemId = parseInt(req.params.id);

  for (const category of categories) {
    const idx = category.items.findIndex(i => i.id === itemId);
    if (idx !== -1) {
      category.items[idx] = {
        ...category.items[idx],
        ...req.body,
        id: itemId,
        price: req.body.price !== undefined ? parseFloat(req.body.price) : category.items[idx].price,
        updatedAt: new Date().toISOString()
      };
      broadcastUpdate('item_updated', { ...category.items[idx], category_id: category.id });
      return res.json({ success: true, item: category.items[idx] });
    }
  }
  res.status(404).json({ success: false, error: '${singular} not found' });
});

// PATCH /api/${moduleName}/admin/item/:id/availability - Toggle availability
router.patch('/admin/item/:id/availability', (req, res) => {
  const itemId = parseInt(req.params.id);
  const { available } = req.body;

  for (const category of categories) {
    const item = category.items.find(i => i.id === itemId);
    if (item) {
      item.available = available;
      item.updatedAt = new Date().toISOString();
      broadcastUpdate('item_availability_changed', { id: itemId, available, category_id: category.id });
      return res.json({ success: true, item });
    }
  }
  res.status(404).json({ success: false, error: '${singular} not found' });
});

// DELETE /api/${moduleName}/admin/item/:id - Delete item
router.delete('/admin/item/:id', (req, res) => {
  const itemId = parseInt(req.params.id);

  for (const category of categories) {
    const idx = category.items.findIndex(i => i.id === itemId);
    if (idx !== -1) {
      const deleted = category.items.splice(idx, 1)[0];
      broadcastUpdate('item_deleted', { id: itemId, category_id: category.id });
      return res.json({ success: true, deleted });
    }
  }
  res.status(404).json({ success: false, error: '${singular} not found' });
});

// PUT /api/${moduleName}/admin/reorder - Reorder items/categories
router.put('/admin/reorder', (req, res) => {
  const { type, order } = req.body;

  if (type === 'categories') {
    order.forEach(({ id, display_order }) => {
      const cat = categories.find(c => c.id === id);
      if (cat) cat.display_order = display_order;
    });
    categories.sort((a, b) => a.display_order - b.display_order);
  } else if (type === 'items') {
    const { category_id } = req.body;
    const category = categories.find(c => c.id === category_id);
    if (category) {
      order.forEach(({ id, display_order }) => {
        const item = category.items.find(i => i.id === id);
        if (item) item.display_order = display_order;
      });
      category.items.sort((a, b) => a.display_order - b.display_order);
    }
  }

  broadcastUpdate('reordered', { type });
  res.json({ success: true });
});

// ============================================
// SSE ENDPOINT
// ============================================

router.get('/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  res.write(\`data: \${JSON.stringify({ type: 'connected', message: 'SSE connected' })}\\n\\n\`);
  res.write(\`data: \${JSON.stringify({ type: 'initial_state', categories })}\\n\\n\`);

  sseClients.add(res);

  const heartbeat = setInterval(() => {
    res.write(\`data: \${JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() })}\\n\\n\`);
  }, 30000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
  });
});

// ============================================
// GET SINGLE ITEM
// ============================================

router.get('/:id', (req, res) => {
  const itemId = parseInt(req.params.id);
  const item = getAllItems().find(i => i.id === itemId);
  if (!item) return res.status(404).json({ success: false, error: '${singular} not found' });
  res.json({ success: true, item });
});

module.exports = router;
`;
}

// ============================================
// BOOKING ROUTES GENERATOR (Reservations, Appointments, Consultations, Bookings, Demos)
// ============================================

/**
 * Generate Booking Routes - generalized for reservations, appointments, etc.
 * Includes admin routes and SSE for real-time updates
 */
function generateBookingRoutes(moduleName, industry, businessData, labelConfig) {
  const moduleTitle = labelConfig.label;
  const singular = labelConfig.singular;
  const plural = labelConfig.plural;

  // Customize reference code prefix based on module
  const refPrefix = moduleName.substring(0, 3).toUpperCase();

  // Customize field names based on module type
  const partyField = ['reservations'].includes(moduleName) ? 'party_size' : 'duration';
  const defaultParty = ['reservations'].includes(moduleName) ? '4' : '60';

  // Industry-aware time slots
  const foodIndustries = ['pizza-restaurant', 'steakhouse', 'restaurant'];
  const eveningIndustries = ['salon-spa', 'barbershop'];
  let timeSlots;
  if (foodIndustries.includes(industry)) {
    // Dinner service: 5pm - 9:30pm
    timeSlots = "['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30']";
  } else if (eveningIndustries.includes(industry)) {
    // Salon hours: 9am - 7pm
    timeSlots = "['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00']";
  } else if (['coffee-cafe', 'bakery'].includes(industry)) {
    // Cafe hours: 7am - 3pm
    timeSlots = "['07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00']";
  } else {
    // Business hours: 9am - 5pm
    timeSlots = "['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00']";
  }

  return `/**
 * ${moduleTitle} Routes - Public & Admin APIs with SSE
 * Module: ${moduleName} (booking type)
 * Generated by Launchpad
 */

const express = require('express');
const router = express.Router();

// ============================================
// IN-MEMORY DATA STORE (replace with database)
// ============================================

let bookings = [
  {
    id: 1,
    reference_code: '${refPrefix}-A1B2',
    customer_name: 'John Smith',
    customer_email: 'john@example.com',
    customer_phone: '555-123-4567',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    ${partyField}: ${defaultParty},
    service: '${singular}',
    status: 'confirmed',
    notes: '',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    reference_code: '${refPrefix}-C3D4',
    customer_name: 'Sarah Johnson',
    customer_email: 'sarah@example.com',
    customer_phone: '555-987-6543',
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    ${partyField}: ${['reservations'].includes(moduleName) ? '2' : '30'},
    service: '${singular}',
    status: 'pending',
    notes: '',
    created_at: new Date().toISOString()
  }
];

let nextBookingId = 3;

// SSE clients
const sseClients = new Set();

function broadcastUpdate(type, data) {
  const message = JSON.stringify({ type, data, timestamp: new Date().toISOString() });
  sseClients.forEach(client => {
    client.write(\`data: \${message}\\n\\n\`);
  });
}

function generateReferenceCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '${refPrefix}-';
  for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

// ============================================
// PUBLIC ROUTES
// ============================================

// POST /api/${moduleName} - Create new ${singular.toLowerCase()}
router.post('/', (req, res) => {
  const { customer_name, customer_email, customer_phone, date, time, ${partyField}, service, notes, special_requests } = req.body;

  if (!customer_name || !customer_email || !date || !time) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  const newBooking = {
    id: nextBookingId++,
    reference_code: generateReferenceCode(),
    customer_name,
    customer_email,
    customer_phone: customer_phone || '',
    date,
    time,
    ${partyField}: parseInt(${partyField}) || ${defaultParty},
    service: service || '${singular}',
    status: 'pending',
    notes: notes || special_requests || '',
    created_at: new Date().toISOString()
  };

  bookings.push(newBooking);
  broadcastUpdate('new_booking', newBooking);

  res.status(201).json({
    success: true,
    booking: newBooking,
    message: \`${singular} confirmed! Your reference code is \${newBooking.reference_code}\`
  });
});

// GET /api/${moduleName}/availability - Check available time slots
router.get('/availability', (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ success: false, error: 'Date is required' });

  const allSlots = ${timeSlots};
  const bookedSlots = bookings
    .filter(b => b.date === date && b.status !== 'cancelled')
    .map(b => b.time);

  const slots = allSlots.map(time => ({
    time,
    available: bookedSlots.filter(t => t === time).length < 3
  }));

  res.json({ success: true, date, slots });
});

// ============================================
// ADMIN ROUTES
// ============================================

// GET /api/${moduleName}/admin/all - All ${plural.toLowerCase()} with filters
router.get('/admin/all', (req, res) => {
  let filtered = [...bookings];

  const { date, status, from, to } = req.query;
  if (date) filtered = filtered.filter(b => b.date === date);
  if (status) filtered = filtered.filter(b => b.status === status);
  if (from) filtered = filtered.filter(b => b.date >= from);
  if (to) filtered = filtered.filter(b => b.date <= to);

  filtered.sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));

  res.json({ success: true, ${moduleName}: filtered });
});

// GET /api/${moduleName}/admin/today - Today's ${plural.toLowerCase()}
router.get('/admin/today', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const todayBookings = bookings
    .filter(b => b.date === today)
    .sort((a, b) => a.time.localeCompare(b.time));

  res.json({ success: true, ${moduleName}: todayBookings });
});

// GET /api/${moduleName}/admin/stats - Statistics
router.get('/admin/stats', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const todayB = bookings.filter(b => b.date === today);
  const weekB = bookings.filter(b => b.date >= today && b.date <= weekFromNow);
  const pendingB = bookings.filter(b => b.status === 'pending');

  res.json({
    success: true,
    stats: {
      today: {
        total: todayB.length,
        confirmed: todayB.filter(b => b.status === 'confirmed').length,
        pending: todayB.filter(b => b.status === 'pending').length
      },
      thisWeek: { total: weekB.length },
      needsAction: pendingB.length
    }
  });
});

// PUT /api/${moduleName}/admin/:id/confirm - Confirm ${singular.toLowerCase()}
router.put('/admin/:id/confirm', (req, res) => {
  const booking = bookings.find(b => b.id === parseInt(req.params.id));
  if (!booking) return res.status(404).json({ success: false, error: '${singular} not found' });

  booking.status = 'confirmed';
  booking.confirmed_at = new Date().toISOString();
  broadcastUpdate('booking_confirmed', booking);

  res.json({ success: true, booking });
});

// PUT /api/${moduleName}/admin/:id/cancel - Cancel ${singular.toLowerCase()}
router.put('/admin/:id/cancel', (req, res) => {
  const booking = bookings.find(b => b.id === parseInt(req.params.id));
  if (!booking) return res.status(404).json({ success: false, error: '${singular} not found' });

  booking.status = 'cancelled';
  booking.cancelled_at = new Date().toISOString();
  booking.cancel_reason = req.body.reason || '';
  broadcastUpdate('booking_cancelled', booking);

  res.json({ success: true, booking });
});

// POST /api/${moduleName}/admin/:id/reminder - Send reminder
router.post('/admin/:id/reminder', (req, res) => {
  const booking = bookings.find(b => b.id === parseInt(req.params.id));
  if (!booking) return res.status(404).json({ success: false, error: '${singular} not found' });

  booking.reminder_sent_at = new Date().toISOString();
  booking.reminders_count = (booking.reminders_count || 0) + 1;
  broadcastUpdate('booking_reminder_sent', { id: booking.id, reminder_sent_at: booking.reminder_sent_at });

  res.json({
    success: true,
    booking,
    message: \`Reminder sent to \${booking.customer_email}\`
  });
});

// PUT /api/${moduleName}/admin/:id - Update ${singular.toLowerCase()} details
router.put('/admin/:id', (req, res) => {
  const idx = bookings.findIndex(b => b.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ success: false, error: '${singular} not found' });

  bookings[idx] = {
    ...bookings[idx],
    ...req.body,
    id: bookings[idx].id,
    reference_code: bookings[idx].reference_code,
    updated_at: new Date().toISOString()
  };
  broadcastUpdate('booking_updated', bookings[idx]);

  res.json({ success: true, booking: bookings[idx] });
});

// ============================================
// SSE ENDPOINT
// ============================================

router.get('/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  res.write(\`data: \${JSON.stringify({ type: 'connected', message: 'SSE connected' })}\\n\\n\`);

  sseClients.add(res);

  const heartbeat = setInterval(() => {
    res.write(\`data: \${JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() })}\\n\\n\`);
  }, 30000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
  });
});

// ============================================
// LOOKUP BY REFERENCE CODE
// ============================================

router.get('/:code', (req, res) => {
  const booking = bookings.find(b =>
    b.reference_code === req.params.code || b.id === parseInt(req.params.code)
  );
  if (!booking) return res.status(404).json({ success: false, error: '${singular} not found' });
  res.json({ success: true, booking });
});

module.exports = router;
`;
}

// ============================================
// LISTINGS ROUTES GENERATOR (Real Estate Listings)
// ============================================

/**
 * Generate Listings Routes - for real estate listings
 * Includes admin routes, filtering, and SSE
 */
function generateListingsRoutes(moduleName, industry, businessData, labelConfig) {
  const moduleTitle = labelConfig.label;
  const singular = labelConfig.singular;

  // Get listings data from fixture
  let listingsData = [];
  const fixtureListings = businessData?.pages?.listings?.listings || businessData?.listings || [];

  if (fixtureListings.length > 0) {
    listingsData = fixtureListings.map((listing, idx) => ({
      id: idx + 1,
      address: listing.address,
      city: listing.city || '',
      price: listing.price,
      beds: listing.beds,
      baths: listing.baths,
      sqft: listing.sqft,
      type: listing.type || 'Single Family',
      status: listing.status || 'active',
      description: listing.description || '',
      images: listing.images || [],
      features: listing.features || [],
      created_at: new Date().toISOString()
    }));
  } else {
    listingsData = [
      { id: 1, address: '123 Main Street', city: 'Downtown', price: 450000, beds: 3, baths: 2, sqft: 1800, type: 'Single Family', status: 'active', description: 'Beautiful home', images: [], features: [], created_at: new Date().toISOString() },
      { id: 2, address: '456 Oak Avenue', city: 'Suburbs', price: 325000, beds: 4, baths: 2.5, sqft: 2200, type: 'Single Family', status: 'active', description: 'Spacious family home', images: [], features: [], created_at: new Date().toISOString() }
    ];
  }

  // Escape for safe embedding in template literal: backticks, ${, and backslashes
  const listingsDataStr = JSON.stringify(listingsData, null, 2)
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');

  return `/**
 * ${moduleTitle} Routes - Public & Admin APIs with SSE
 * Module: ${moduleName} (listings type)
 * Generated by Launchpad
 */

const express = require('express');
const router = express.Router();

// ============================================
// IN-MEMORY DATA STORE
// ============================================

let listings = ${listingsDataStr};

let nextListingId = ${listingsData.length + 1};

// SSE clients
const sseClients = new Set();

function broadcastUpdate(type, data) {
  const message = JSON.stringify({ type, data, timestamp: new Date().toISOString() });
  sseClients.forEach(client => {
    client.write(\`data: \${message}\\n\\n\`);
  });
}

// ============================================
// PUBLIC ROUTES
// ============================================

// GET /api/${moduleName} - All active listings with filters
router.get('/', (req, res) => {
  let filtered = listings.filter(l => l.status === 'active');

  const { minPrice, maxPrice, beds, baths, type, city } = req.query;
  if (minPrice) filtered = filtered.filter(l => l.price >= parseInt(minPrice));
  if (maxPrice) filtered = filtered.filter(l => l.price <= parseInt(maxPrice));
  if (beds) filtered = filtered.filter(l => l.beds >= parseInt(beds));
  if (baths) filtered = filtered.filter(l => l.baths >= parseFloat(baths));
  if (type) filtered = filtered.filter(l => l.type.toLowerCase() === type.toLowerCase());
  if (city) filtered = filtered.filter(l => l.city.toLowerCase().includes(city.toLowerCase()));

  res.json({ success: true, ${moduleName}: filtered, total: filtered.length });
});

// GET /api/${moduleName}/featured - Featured listings
router.get('/featured', (req, res) => {
  const featured = listings.filter(l => l.status === 'active').slice(0, 6);
  res.json({ success: true, ${moduleName}: featured });
});

// ============================================
// ADMIN ROUTES
// ============================================

// GET /api/${moduleName}/admin - All listings for admin
router.get('/admin', (req, res) => {
  res.json({ success: true, ${moduleName}: listings });
});

// POST /api/${moduleName}/admin - Create listing
router.post('/admin', (req, res) => {
  const { address, city, price, beds, baths, sqft, type, description, images, features } = req.body;
  if (!address || !price) return res.status(400).json({ success: false, error: 'Address and price are required' });

  const newListing = {
    id: nextListingId++,
    address,
    city: city || '',
    price: parseFloat(price),
    beds: parseInt(beds) || 0,
    baths: parseFloat(baths) || 0,
    sqft: parseInt(sqft) || 0,
    type: type || 'Single Family',
    status: 'active',
    description: description || '',
    images: images || [],
    features: features || [],
    created_at: new Date().toISOString()
  };

  listings.push(newListing);
  broadcastUpdate('listing_added', newListing);
  res.status(201).json({ success: true, listing: newListing });
});

// PUT /api/${moduleName}/admin/:id - Update listing
router.put('/admin/:id', (req, res) => {
  const idx = listings.findIndex(l => l.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ success: false, error: '${singular} not found' });

  listings[idx] = {
    ...listings[idx],
    ...req.body,
    id: listings[idx].id,
    price: req.body.price !== undefined ? parseFloat(req.body.price) : listings[idx].price,
    updated_at: new Date().toISOString()
  };
  broadcastUpdate('listing_updated', listings[idx]);
  res.json({ success: true, listing: listings[idx] });
});

// PATCH /api/${moduleName}/admin/:id/status - Update listing status
router.patch('/admin/:id/status', (req, res) => {
  const listing = listings.find(l => l.id === parseInt(req.params.id));
  if (!listing) return res.status(404).json({ success: false, error: '${singular} not found' });

  const { status } = req.body;
  if (!['active', 'pending', 'sold', 'off-market'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status' });
  }

  listing.status = status;
  listing.updated_at = new Date().toISOString();
  broadcastUpdate('listing_status_changed', { id: listing.id, status });
  res.json({ success: true, listing });
});

// DELETE /api/${moduleName}/admin/:id - Delete listing
router.delete('/admin/:id', (req, res) => {
  const idx = listings.findIndex(l => l.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ success: false, error: '${singular} not found' });

  const deleted = listings.splice(idx, 1)[0];
  broadcastUpdate('listing_deleted', { id: deleted.id });
  res.json({ success: true, deleted });
});

// GET /api/${moduleName}/admin/stats - Listing statistics
router.get('/admin/stats', (req, res) => {
  const active = listings.filter(l => l.status === 'active');
  const pending = listings.filter(l => l.status === 'pending');
  const sold = listings.filter(l => l.status === 'sold');
  const avgPrice = active.length > 0 ? active.reduce((sum, l) => sum + l.price, 0) / active.length : 0;

  res.json({
    success: true,
    stats: {
      total: listings.length,
      active: active.length,
      pending: pending.length,
      sold: sold.length,
      avgPrice: Math.round(avgPrice)
    }
  });
});

// ============================================
// SSE ENDPOINT
// ============================================

router.get('/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  res.write(\`data: \${JSON.stringify({ type: 'connected', message: 'SSE connected' })}\\n\\n\`);
  res.write(\`data: \${JSON.stringify({ type: 'initial_state', listings })}\\n\\n\`);

  sseClients.add(res);

  const heartbeat = setInterval(() => {
    res.write(\`data: \${JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() })}\\n\\n\`);
  }, 30000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
  });
});

// ============================================
// GET SINGLE LISTING
// ============================================

router.get('/:id', (req, res) => {
  const listing = listings.find(l => l.id === parseInt(req.params.id));
  if (!listing) return res.status(404).json({ success: false, error: '${singular} not found' });
  res.json({ success: true, listing });
});

module.exports = router;
`;
}

// ============================================
// INQUIRIES ROUTES GENERATOR (Orders, Quotes, Memberships, Enrollments, Inquiries)
// ============================================

/**
 * Generate Inquiries Routes - for lead/inquiry management
 * Includes admin routes, pipeline view, and SSE
 */
function generateInquiriesRoutes(moduleName, industry, businessData, labelConfig) {
  const moduleTitle = labelConfig.label;
  const singular = labelConfig.singular;
  const plural = labelConfig.plural;

  // Customize reference code prefix
  const refPrefix = moduleName.substring(0, 3).toUpperCase();

  return `/**
 * ${moduleTitle} Routes - Public & Admin APIs with SSE
 * Module: ${moduleName} (inquiries type)
 * Generated by Launchpad
 */

const express = require('express');
const router = express.Router();

// ============================================
// IN-MEMORY DATA STORE
// ============================================

let ${moduleName} = [
  {
    id: 1,
    reference_code: '${refPrefix}-A1B2',
    customer_name: 'John Smith',
    customer_email: 'john@example.com',
    customer_phone: '555-123-4567',
    type: '${singular}',
    message: 'I would like more information about your services.',
    status: 'new',
    priority: 'normal',
    source: 'website',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    reference_code: '${refPrefix}-C3D4',
    customer_name: 'Sarah Johnson',
    customer_email: 'sarah@example.com',
    customer_phone: '555-987-6543',
    type: '${singular}',
    message: 'Interested in getting started.',
    status: 'contacted',
    priority: 'high',
    source: 'referral',
    created_at: new Date().toISOString()
  }
];

let next${singular}Id = 3;

// SSE clients
const sseClients = new Set();

function broadcastUpdate(type, data) {
  const message = JSON.stringify({ type, data, timestamp: new Date().toISOString() });
  sseClients.forEach(client => {
    client.write(\`data: \${message}\\n\\n\`);
  });
}

function generateReferenceCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '${refPrefix}-';
  for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

// Status pipeline
const STATUS_PIPELINE = ['new', 'contacted', 'qualified', 'converted', 'archived'];

// ============================================
// PUBLIC ROUTES
// ============================================

// POST /api/${moduleName} - Submit new ${singular.toLowerCase()}
router.post('/', (req, res) => {
  const { customer_name, customer_email, customer_phone, type, message, items, total } = req.body;

  if (!customer_name || !customer_email) {
    return res.status(400).json({ success: false, error: 'Name and email are required' });
  }

  const newItem = {
    id: next${singular}Id++,
    reference_code: generateReferenceCode(),
    customer_name,
    customer_email,
    customer_phone: customer_phone || '',
    type: type || '${singular}',
    message: message || '',
    items: items || [],
    total: total || null,
    status: 'new',
    priority: 'normal',
    source: 'website',
    created_at: new Date().toISOString()
  };

  ${moduleName}.push(newItem);
  broadcastUpdate('new_${singular.toLowerCase()}', newItem);

  res.status(201).json({
    success: true,
    ${singular.toLowerCase()}: newItem,
    message: \`Thank you! Your reference code is \${newItem.reference_code}\`
  });
});

// ============================================
// ADMIN ROUTES
// ============================================

// GET /api/${moduleName}/admin/all - All ${plural.toLowerCase()} with filters
router.get('/admin/all', (req, res) => {
  let filtered = [...${moduleName}];

  const { status, priority, from, to } = req.query;
  if (status) filtered = filtered.filter(i => i.status === status);
  if (priority) filtered = filtered.filter(i => i.priority === priority);
  if (from) filtered = filtered.filter(i => i.created_at >= from);
  if (to) filtered = filtered.filter(i => i.created_at <= to);

  filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  res.json({ success: true, ${moduleName}: filtered });
});

// GET /api/${moduleName}/admin/pipeline - ${plural} by status
router.get('/admin/pipeline', (req, res) => {
  const pipeline = {};
  STATUS_PIPELINE.forEach(status => {
    pipeline[status] = ${moduleName}.filter(i => i.status === status);
  });
  res.json({ success: true, pipeline, statuses: STATUS_PIPELINE });
});

// GET /api/${moduleName}/admin/stats - Statistics
router.get('/admin/stats', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const todayItems = ${moduleName}.filter(i => i.created_at.startsWith(today));
  const newItems = ${moduleName}.filter(i => i.status === 'new');
  const highPriority = ${moduleName}.filter(i => i.priority === 'high' && i.status !== 'converted' && i.status !== 'archived');

  res.json({
    success: true,
    stats: {
      total: ${moduleName}.length,
      today: todayItems.length,
      new: newItems.length,
      highPriority: highPriority.length,
      converted: ${moduleName}.filter(i => i.status === 'converted').length
    }
  });
});

// PUT /api/${moduleName}/admin/:id - Update ${singular.toLowerCase()}
router.put('/admin/:id', (req, res) => {
  const idx = ${moduleName}.findIndex(i => i.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ success: false, error: '${singular} not found' });

  ${moduleName}[idx] = {
    ...${moduleName}[idx],
    ...req.body,
    id: ${moduleName}[idx].id,
    reference_code: ${moduleName}[idx].reference_code,
    updated_at: new Date().toISOString()
  };
  broadcastUpdate('${singular.toLowerCase()}_updated', ${moduleName}[idx]);

  res.json({ success: true, ${singular.toLowerCase()}: ${moduleName}[idx] });
});

// PATCH /api/${moduleName}/admin/:id/status - Update status
router.patch('/admin/:id/status', (req, res) => {
  const item = ${moduleName}.find(i => i.id === parseInt(req.params.id));
  if (!item) return res.status(404).json({ success: false, error: '${singular} not found' });

  const { status } = req.body;
  if (!STATUS_PIPELINE.includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status' });
  }

  item.status = status;
  item.updated_at = new Date().toISOString();
  if (status === 'contacted') item.contacted_at = new Date().toISOString();
  if (status === 'converted') item.converted_at = new Date().toISOString();

  broadcastUpdate('${singular.toLowerCase()}_status_changed', { id: item.id, status });
  res.json({ success: true, ${singular.toLowerCase()}: item });
});

// POST /api/${moduleName}/admin/:id/respond - Quick respond
router.post('/admin/:id/respond', (req, res) => {
  const item = ${moduleName}.find(i => i.id === parseInt(req.params.id));
  if (!item) return res.status(404).json({ success: false, error: '${singular} not found' });

  const { response } = req.body;
  item.responses = item.responses || [];
  item.responses.push({
    message: response,
    sent_at: new Date().toISOString()
  });
  item.status = item.status === 'new' ? 'contacted' : item.status;
  item.updated_at = new Date().toISOString();

  broadcastUpdate('${singular.toLowerCase()}_responded', item);
  res.json({ success: true, ${singular.toLowerCase()}: item });
});

// DELETE /api/${moduleName}/admin/:id - Delete ${singular.toLowerCase()}
router.delete('/admin/:id', (req, res) => {
  const idx = ${moduleName}.findIndex(i => i.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ success: false, error: '${singular} not found' });

  const deleted = ${moduleName}.splice(idx, 1)[0];
  broadcastUpdate('${singular.toLowerCase()}_deleted', { id: deleted.id });
  res.json({ success: true, deleted });
});

// ============================================
// SSE ENDPOINT
// ============================================

router.get('/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  res.write(\`data: \${JSON.stringify({ type: 'connected', message: 'SSE connected' })}\\n\\n\`);

  sseClients.add(res);

  const heartbeat = setInterval(() => {
    res.write(\`data: \${JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() })}\\n\\n\`);
  }, 30000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
  });
});

// ============================================
// LOOKUP BY REFERENCE CODE
// ============================================

router.get('/:code', (req, res) => {
  const item = ${moduleName}.find(i =>
    i.reference_code === req.params.code || i.id === parseInt(req.params.code)
  );
  if (!item) return res.status(404).json({ success: false, error: '${singular} not found' });
  res.json({ success: true, ${singular.toLowerCase()}: item });
});

module.exports = router;
`;
}

// ============================================
// GENERIC MODULE ROUTES (Fallback)
// ============================================

/**
 * Generate Generic Module Routes - fallback for unknown types
 */
function generateGenericModuleRoutes(moduleName, industry, businessData, labelConfig) {
  const moduleTitle = labelConfig.label;
  const sampleData = getSampleData(moduleName, industry);

  return `/**
 * ${moduleTitle} Routes
 * Generated by Launchpad
 */

const express = require('express');
const router = express.Router();

let items = ${JSON.stringify(sampleData, null, 2)};

router.get('/', (req, res) => {
  res.json({ success: true, ${moduleName}: items });
});

router.get('/:id', (req, res) => {
  const item = items.find(i => i.id === parseInt(req.params.id));
  if (!item) return res.status(404).json({ success: false, error: 'Not found' });
  res.json({ success: true, item });
});

router.post('/', (req, res) => {
  const newItem = { id: items.length + 1, ...req.body, createdAt: new Date().toISOString() };
  items.push(newItem);
  res.status(201).json({ success: true, item: newItem });
});

router.put('/:id', (req, res) => {
  const idx = items.findIndex(i => i.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ success: false, error: 'Not found' });
  items[idx] = { ...items[idx], ...req.body, updatedAt: new Date().toISOString() };
  res.json({ success: true, item: items[idx] });
});

router.delete('/:id', (req, res) => {
  const idx = items.findIndex(i => i.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ success: false, error: 'Not found' });
  const deleted = items.splice(idx, 1);
  res.json({ success: true, deleted: deleted[0] });
});

module.exports = router;
`;
}

/**
 * Generate sample catalog data based on industry
 */
function generateSampleCatalogData(moduleName, industry) {
  // Industry-specific templates (keyed by industry-moduleName)
  const industryTemplates = {
    // ===== LAW FIRM =====
    'law-firm-services': [
      { id: 1, name: 'Practice Areas', description: 'Legal services we offer', display_order: 1, active: true, items: [
        { id: 1, name: 'Family Law', price: 300, description: 'Divorce, custody, and family matters', duration: 60, available: true, popular: true, display_order: 1 },
        { id: 2, name: 'Estate Planning', price: 250, description: 'Wills, trusts, and asset protection', duration: 60, available: true, popular: true, display_order: 2 },
        { id: 3, name: 'Criminal Defense', price: 350, description: 'Misdemeanor and felony defense', duration: 60, available: true, popular: false, display_order: 3 },
        { id: 4, name: 'Business Law', price: 275, description: 'Contracts, formation, and compliance', duration: 60, available: true, popular: false, display_order: 4 }
      ]},
      { id: 2, name: 'Consultations', description: 'Initial meeting options', display_order: 2, active: true, items: [
        { id: 5, name: 'Free Initial Consultation', price: 0, description: '15-minute phone consultation', duration: 15, available: true, popular: true, display_order: 1 },
        { id: 6, name: 'Case Review', price: 150, description: 'In-depth review of your case', duration: 45, available: true, popular: false, display_order: 2 }
      ]}
    ],
    // ===== SALON / SPA =====
    'salon-spa-services': [
      { id: 1, name: 'Hair Services', description: 'Cuts, color, and styling', display_order: 1, active: true, items: [
        { id: 1, name: 'Haircut & Blowout', price: 65, description: 'Precision cut with professional styling', duration: 45, available: true, popular: true, display_order: 1 },
        { id: 2, name: 'Color Treatment', price: 120, description: 'Full color or highlights', duration: 90, available: true, popular: true, display_order: 2 },
        { id: 3, name: 'Keratin Treatment', price: 250, description: 'Smooth and frizz-free for weeks', duration: 120, available: true, popular: false, display_order: 3 }
      ]},
      { id: 2, name: 'Skin & Body', description: 'Facials and body treatments', display_order: 2, active: true, items: [
        { id: 4, name: 'Classic Facial', price: 85, description: 'Deep cleansing and hydration', duration: 60, available: true, popular: true, display_order: 1 },
        { id: 5, name: 'Deep Tissue Massage', price: 110, description: 'Targeted muscle relief', duration: 60, available: true, popular: true, display_order: 2 },
        { id: 6, name: 'Manicure & Pedicure', price: 75, description: 'Full nail care package', duration: 60, available: true, popular: false, display_order: 3 }
      ]}
    ],
    // ===== BARBERSHOP =====
    'barbershop-services': [
      { id: 1, name: 'Haircuts', description: 'Classic and modern cuts', display_order: 1, active: true, items: [
        { id: 1, name: 'Classic Cut', price: 30, description: 'Traditional barbershop cut', duration: 30, available: true, popular: true, display_order: 1 },
        { id: 2, name: 'Fade & Style', price: 40, description: 'Modern fade with styling', duration: 40, available: true, popular: true, display_order: 2 },
        { id: 3, name: 'Kids Cut', price: 20, description: 'For children 12 and under', duration: 20, available: true, popular: false, display_order: 3 }
      ]},
      { id: 2, name: 'Grooming', description: 'Beard and shave services', display_order: 2, active: true, items: [
        { id: 4, name: 'Hot Towel Shave', price: 35, description: 'Luxurious straight razor shave', duration: 30, available: true, popular: true, display_order: 1 },
        { id: 5, name: 'Beard Trim & Shape', price: 20, description: 'Precision beard grooming', duration: 20, available: true, popular: false, display_order: 2 }
      ]}
    ],
    // ===== DENTAL =====
    'dental-services': [
      { id: 1, name: 'General Dentistry', description: 'Preventive and restorative care', display_order: 1, active: true, items: [
        { id: 1, name: 'Dental Exam & Cleaning', price: 150, description: 'Comprehensive exam with professional cleaning', duration: 60, available: true, popular: true, display_order: 1 },
        { id: 2, name: 'Dental Filling', price: 200, description: 'Composite filling for cavities', duration: 45, available: true, popular: false, display_order: 2 },
        { id: 3, name: 'Root Canal', price: 800, description: 'Endodontic treatment', duration: 90, available: true, popular: false, display_order: 3 }
      ]},
      { id: 2, name: 'Cosmetic Dentistry', description: 'Smile enhancement', display_order: 2, active: true, items: [
        { id: 4, name: 'Teeth Whitening', price: 350, description: 'Professional whitening treatment', duration: 60, available: true, popular: true, display_order: 1 },
        { id: 5, name: 'Porcelain Veneers', price: 1200, description: 'Per tooth, custom veneers', duration: 90, available: true, popular: false, display_order: 2 }
      ]}
    ],
    // ===== HEALTHCARE =====
    'healthcare-services': [
      { id: 1, name: 'Primary Care', description: 'General health services', display_order: 1, active: true, items: [
        { id: 1, name: 'Annual Physical', price: 200, description: 'Comprehensive health assessment', duration: 45, available: true, popular: true, display_order: 1 },
        { id: 2, name: 'Sick Visit', price: 125, description: 'Acute illness evaluation', duration: 20, available: true, popular: true, display_order: 2 },
        { id: 3, name: 'Lab Work', price: 75, description: 'Blood tests and diagnostics', duration: 15, available: true, popular: false, display_order: 3 }
      ]},
      { id: 2, name: 'Specialty Care', description: 'Focused treatments', display_order: 2, active: true, items: [
        { id: 4, name: 'Physical Therapy Session', price: 150, description: 'Rehabilitation and recovery', duration: 45, available: true, popular: false, display_order: 1 },
        { id: 5, name: 'Vaccination', price: 50, description: 'Immunization services', duration: 15, available: true, popular: true, display_order: 2 }
      ]}
    ],
    // ===== PLUMBER =====
    'plumber-services': [
      { id: 1, name: 'Repairs', description: 'Fix and maintenance services', display_order: 1, active: true, items: [
        { id: 1, name: 'Leak Repair', price: 150, description: 'Pipe and faucet leak fixes', duration: 60, available: true, popular: true, display_order: 1 },
        { id: 2, name: 'Drain Cleaning', price: 125, description: 'Clear clogged drains and pipes', duration: 45, available: true, popular: true, display_order: 2 },
        { id: 3, name: 'Toilet Repair', price: 100, description: 'Flush valve, flapper, and fill valve fixes', duration: 30, available: true, popular: false, display_order: 3 }
      ]},
      { id: 2, name: 'Installations', description: 'New fixture installation', display_order: 2, active: true, items: [
        { id: 4, name: 'Water Heater Install', price: 500, description: 'Tank or tankless water heater', duration: 180, available: true, popular: true, display_order: 1 },
        { id: 5, name: 'Faucet Installation', price: 175, description: 'Kitchen or bathroom faucet', duration: 60, available: true, popular: false, display_order: 2 }
      ]}
    ],
    // ===== CLEANING =====
    'cleaning-services': [
      { id: 1, name: 'Residential Cleaning', description: 'Home cleaning services', display_order: 1, active: true, items: [
        { id: 1, name: 'Standard Clean', price: 150, description: 'Kitchen, bathrooms, dusting, and vacuuming', duration: 120, available: true, popular: true, display_order: 1 },
        { id: 2, name: 'Deep Clean', price: 275, description: 'Thorough top-to-bottom cleaning', duration: 240, available: true, popular: true, display_order: 2 },
        { id: 3, name: 'Move-In/Move-Out', price: 350, description: 'Complete property cleaning', duration: 300, available: true, popular: false, display_order: 3 }
      ]},
      { id: 2, name: 'Add-On Services', description: 'Extra services', display_order: 2, active: true, items: [
        { id: 4, name: 'Window Cleaning', price: 75, description: 'Interior window cleaning', duration: 60, available: true, popular: false, display_order: 1 },
        { id: 5, name: 'Carpet Cleaning', price: 100, description: 'Steam carpet cleaning per room', duration: 45, available: true, popular: false, display_order: 2 }
      ]}
    ],
    // ===== AUTO SHOP =====
    'auto-shop-services': [
      { id: 1, name: 'Maintenance', description: 'Regular vehicle maintenance', display_order: 1, active: true, items: [
        { id: 1, name: 'Oil Change', price: 45, description: 'Full synthetic oil change with filter', duration: 30, available: true, popular: true, display_order: 1 },
        { id: 2, name: 'Tire Rotation', price: 30, description: 'Rotate and balance all four tires', duration: 30, available: true, popular: true, display_order: 2 },
        { id: 3, name: 'Brake Inspection', price: 0, description: 'Free visual brake inspection', duration: 15, available: true, popular: false, display_order: 3 }
      ]},
      { id: 2, name: 'Repairs', description: 'Vehicle repair services', display_order: 2, active: true, items: [
        { id: 4, name: 'Brake Pad Replacement', price: 250, description: 'Front or rear brake pads', duration: 90, available: true, popular: true, display_order: 1 },
        { id: 5, name: 'Engine Diagnostic', price: 100, description: 'Full computer diagnostic scan', duration: 60, available: true, popular: false, display_order: 2 }
      ]}
    ],
    // ===== YOGA =====
    'yoga-classes': [
      { id: 1, name: 'Yoga Classes', description: 'Mind and body practice', display_order: 1, active: true, items: [
        { id: 1, name: 'Vinyasa Flow', price: 25, description: 'Dynamic flowing sequence', duration: 60, available: true, popular: true, display_order: 1 },
        { id: 2, name: 'Gentle Yoga', price: 20, description: 'Slow-paced restorative practice', duration: 60, available: true, popular: true, display_order: 2 },
        { id: 3, name: 'Hot Yoga', price: 30, description: 'Heated room for deeper stretch', duration: 75, available: true, popular: false, display_order: 3 }
      ]},
      { id: 2, name: 'Workshops', description: 'Special sessions', display_order: 2, active: true, items: [
        { id: 4, name: 'Meditation Workshop', price: 35, description: 'Guided meditation practice', duration: 90, available: true, popular: false, display_order: 1 },
        { id: 5, name: 'Yoga for Beginners', price: 15, description: 'Introduction to yoga fundamentals', duration: 60, available: true, popular: true, display_order: 2 }
      ]}
    ],
    // ===== FITNESS GYM =====
    'fitness-gym-classes': [
      { id: 1, name: 'Group Classes', description: 'High-energy group workouts', display_order: 1, active: true, items: [
        { id: 1, name: 'HIIT Training', price: 20, description: 'High intensity interval training', duration: 45, available: true, popular: true, display_order: 1 },
        { id: 2, name: 'Spin Class', price: 20, description: 'Indoor cycling workout', duration: 45, available: true, popular: true, display_order: 2 },
        { id: 3, name: 'CrossFit', price: 25, description: 'Functional fitness training', duration: 60, available: true, popular: false, display_order: 3 }
      ]},
      { id: 2, name: 'Personal Training', description: 'One-on-one sessions', display_order: 2, active: true, items: [
        { id: 4, name: 'Single PT Session', price: 75, description: 'One-on-one with certified trainer', duration: 60, available: true, popular: true, display_order: 1 },
        { id: 5, name: '5-Session Package', price: 300, description: 'Save with a package deal', duration: 60, available: true, popular: false, display_order: 2 }
      ]}
    ],
    // ===== SAAS =====
    'saas-features': [
      { id: 1, name: 'Core Platform', description: 'Essential features included in all plans', display_order: 1, active: true, items: [
        { id: 1, name: 'Real-time Dashboard', price: null, description: 'Live metrics and KPI tracking', available: true, popular: true, display_order: 1 },
        { id: 2, name: 'Team Collaboration', price: null, description: 'Shared workspaces and commenting', available: true, popular: true, display_order: 2 },
        { id: 3, name: 'API Access', price: null, description: 'REST API with webhooks', available: true, popular: false, display_order: 3 }
      ]},
      { id: 2, name: 'Enterprise Add-ons', description: 'Advanced capabilities', display_order: 2, active: true, items: [
        { id: 4, name: 'SSO & SAML', price: null, description: 'Enterprise single sign-on', available: true, popular: false, display_order: 1 },
        { id: 5, name: 'Advanced Analytics', price: null, description: 'Custom reports and data exports', available: true, popular: true, display_order: 2 }
      ]}
    ],
    // ===== ECOMMERCE =====
    'ecommerce-products': [
      { id: 1, name: 'Best Sellers', description: 'Most popular products', display_order: 1, active: true, items: [
        { id: 1, name: 'Premium Wireless Earbuds', price: 79.99, description: 'Active noise cancellation', available: true, popular: true, display_order: 1 },
        { id: 2, name: 'Organic Cotton T-Shirt', price: 34.99, description: 'Sustainably sourced cotton', available: true, popular: true, display_order: 2 }
      ]},
      { id: 2, name: 'New Arrivals', description: 'Just added to the store', display_order: 2, active: true, items: [
        { id: 3, name: 'Smart Water Bottle', price: 44.99, description: 'Temperature tracking display', available: true, popular: false, display_order: 1 },
        { id: 4, name: 'Bamboo Desk Organizer', price: 29.99, description: 'Eco-friendly workspace accessory', available: true, popular: false, display_order: 2 }
      ]}
    ],
    // ===== SCHOOL =====
    'school-programs': [
      { id: 1, name: 'Certificate Programs', description: 'Professional certifications', display_order: 1, active: true, items: [
        { id: 1, name: 'Web Development Bootcamp', price: 4500, description: '12-week immersive coding program', duration: null, available: true, popular: true, display_order: 1 },
        { id: 2, name: 'Data Science Fundamentals', price: 3500, description: '10-week data analysis program', duration: null, available: true, popular: true, display_order: 2 }
      ]},
      { id: 2, name: 'Short Courses', description: 'Skill-building workshops', display_order: 2, active: true, items: [
        { id: 3, name: 'UX Design Workshop', price: 800, description: '4-week design thinking course', duration: null, available: true, popular: false, display_order: 1 },
        { id: 4, name: 'Digital Marketing', price: 600, description: '3-week marketing essentials', duration: null, available: true, popular: false, display_order: 2 }
      ]}
    ]
  };

  // Generic fallbacks by module name
  const genericTemplates = {
    menu: [
      { id: 1, name: 'Popular Items', description: 'Customer favorites', display_order: 1, active: true, items: [
        { id: 1, name: 'House Special', price: 14.99, description: 'Our signature dish', available: true, popular: true, display_order: 1 },
        { id: 2, name: 'Classic Combo', price: 12.99, description: 'A timeless favorite', available: true, popular: true, display_order: 2 }
      ]}
    ],
    services: [
      { id: 1, name: 'Core Services', description: 'Our main offerings', display_order: 1, active: true, items: [
        { id: 1, name: 'Standard Service', price: 50, description: 'Our basic service offering', duration: 30, available: true, popular: false, display_order: 1 },
        { id: 2, name: 'Premium Service', price: 100, description: 'Enhanced experience with extras', duration: 60, available: true, popular: true, display_order: 2 }
      ]}
    ],
    classes: [
      { id: 1, name: 'Group Classes', description: 'Group sessions', display_order: 1, active: true, items: [
        { id: 1, name: 'Beginner Class', price: 25, description: 'Perfect for newcomers', duration: 45, available: true, popular: false, display_order: 1 },
        { id: 2, name: 'Advanced Class', price: 35, description: 'Challenging session', duration: 60, available: true, popular: true, display_order: 2 }
      ]}
    ],
    features: [
      { id: 1, name: 'Core Features', description: 'Essential functionality', display_order: 1, active: true, items: [
        { id: 1, name: 'Dashboard', price: null, description: 'Central command center', available: true, popular: true, display_order: 1 },
        { id: 2, name: 'Analytics', price: null, description: 'Insights and reports', available: true, popular: false, display_order: 2 }
      ]}
    ],
    products: [
      { id: 1, name: 'Featured Products', description: 'Best sellers', display_order: 1, active: true, items: [
        { id: 1, name: 'Product A', price: 29.99, description: 'Quality product', available: true, popular: true, display_order: 1 },
        { id: 2, name: 'Product B', price: 49.99, description: 'Premium quality', available: true, popular: false, display_order: 2 }
      ]}
    ],
    programs: [
      { id: 1, name: 'Academic Programs', description: 'Educational offerings', display_order: 1, active: true, items: [
        { id: 1, name: 'Foundation Course', price: 500, description: 'Beginner level', duration: null, available: true, popular: false, display_order: 1 },
        { id: 2, name: 'Advanced Course', price: 1000, description: 'Expert level', duration: null, available: true, popular: true, display_order: 2 }
      ]}
    ]
  };

  // Try industry-specific first, then generic by module name
  return industryTemplates[`${industry}-${moduleName}`] || genericTemplates[moduleName] || genericTemplates.services;
}

/**
 * Generate sample data for a module
 */
function getSampleData(moduleName, industry) {
  const samples = {
    menu: [
      { id: 1, name: 'Classic Item', description: 'A customer favorite', price: 12.99, category: 'Popular' },
      { id: 2, name: 'Special Item', description: "Chef's recommendation", price: 18.99, category: 'Specials' },
      { id: 3, name: 'Premium Item', description: 'Premium quality', price: 24.99, category: 'Premium' }
    ],
    orders: [
      { id: 1, customer: 'John Doe', items: ['Classic Item'], total: 12.99, status: 'completed' },
      { id: 2, customer: 'Jane Smith', items: ['Special Item', 'Classic Item'], total: 31.98, status: 'pending' }
    ],
    services: [
      { id: 1, name: 'Basic Service', description: 'Standard service', price: 50, duration: 30 },
      { id: 2, name: 'Premium Service', description: 'Enhanced experience', price: 100, duration: 60 },
      { id: 3, name: 'VIP Service', description: 'Full treatment', price: 200, duration: 120 }
    ],
    booking: [
      { id: 1, customer: 'Alice', service: 'Basic Service', date: '2025-02-05', time: '10:00', status: 'confirmed' },
      { id: 2, customer: 'Bob', service: 'Premium Service', date: '2025-02-06', time: '14:00', status: 'pending' }
    ],
    classes: [
      { id: 1, name: 'Beginner Class', instructor: 'Coach Mike', time: '9:00 AM', capacity: 20, enrolled: 12 },
      { id: 2, name: 'Advanced Class', instructor: 'Coach Sarah', time: '6:00 PM', capacity: 15, enrolled: 14 }
    ],
    products: [
      { id: 1, name: 'Product A', description: 'Quality product', price: 29.99, inStock: 50 },
      { id: 2, name: 'Product B', description: 'Best seller', price: 49.99, inStock: 25 }
    ],
    listings: [
      { id: 1, title: '123 Main St', type: 'House', price: 450000, beds: 3, baths: 2 },
      { id: 2, title: '456 Oak Ave', type: 'Condo', price: 275000, beds: 2, baths: 1 }
    ],
    appointments: [
      { id: 1, patient: 'John D.', type: 'Checkup', date: '2025-02-05', time: '10:00', status: 'scheduled' }
    ],
    features: [
      { id: 1, name: 'Core Feature', description: 'Essential functionality', tier: 'basic' },
      { id: 2, name: 'Pro Feature', description: 'Advanced capabilities', tier: 'pro' }
    ],
    pricing: [
      { id: 1, name: 'Starter', price: 0, features: ['Basic feature 1', 'Basic feature 2'] },
      { id: 2, name: 'Pro', price: 29, features: ['All Starter features', 'Pro feature 1', 'Pro feature 2'] }
    ]
  };

  return samples[moduleName] || [{ id: 1, name: 'Sample Item', description: 'Sample description' }];
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function getColors(moodSliders, businessData) {
  const theme = businessData.theme?.colors || {};
  const trendColors = businessData.theme?.trendColors || {};

  // Get the raw primary color
  let primary = trendColors.primary || moodSliders.primaryColor || theme.primary || '#3B82F6';

  // Light colors that have poor contrast on white backgrounds
  // These should NOT be used as primary colors for navbar text/buttons
  const lightColors = ['#FFFDD0', '#FFFFF0', '#F5F5DC', '#FEFCE8', '#FEF3C7', '#FFF7ED', '#FDF4FF'];

  // If primary is a light color, fall back to theme primary or a safe brown
  if (lightColors.includes(primary.toUpperCase())) {
    primary = theme.primary || '#78350F'; // Safe warm brown fallback
  }

  // Handle dark/medium theme backgrounds
  let text, textMuted, background;
  if (moodSliders.isDark) {
    text = '#f8fafc';
    textMuted = '#94a3b8';
    background = moodSliders.isLuxury ? '#0d0d0f' : '#0f172a';
  } else if (moodSliders.isMedium) {
    text = moodSliders.isLuxury ? '#2d2a26' : '#1f2937';
    textMuted = moodSliders.isLuxury ? '#5c5955' : '#4b5563';
    background = moodSliders.isLuxury ? '#faf6ef' : '#f0f0f0';
  } else {
    text = theme.text || '#1f2937';
    textMuted = '#6b7280';
    background = '#ffffff';
  }

  return {
    primary,
    secondary: trendColors.secondary || theme.secondary || '#6366F1',
    accent: trendColors.accent || theme.accent || '#10B981',
    text,
    textMuted,
    background
  };
}

/**
 * Get design tokens from enriched moodSliders + colors
 * Used by page generators to apply slider-driven styles
 */
function getDesignTokens(moodSliders, businessData) {
  const colors = getColors(moodSliders, businessData);
  const energy = moodSliders.energy || 50;

  return {
    ...colors,
    // Typography
    fontHeading: moodSliders.fontHeading || "'Inter', system-ui, sans-serif",
    fontBody: moodSliders.fontBody || "system-ui, sans-serif",
    fontWeight: moodSliders.fontWeight || '600',
    headlineStyle: moodSliders.headlineStyle || 'none',
    // Spacing
    sectionPadding: moodSliders.sectionPadding || '80px 20px',
    cardPadding: moodSliders.cardPadding || '28px',
    gap: moodSliders.gap || '32px',
    // Shapes
    borderRadius: moodSliders.borderRadius || '12px',
    // Shadows - energy based (calm=soft, bold=strong)
    shadow: energy < 35 ? '0 1px 3px rgba(0,0,0,0.05)' : energy > 65 ? '0 8px 30px rgba(0,0,0,0.12)' : '0 4px 20px rgba(0,0,0,0.08)',
    shadowHover: energy < 35 ? '0 2px 8px rgba(0,0,0,0.08)' : energy > 65 ? '0 12px 40px rgba(0,0,0,0.18)' : '0 8px 30px rgba(0,0,0,0.12)',
    // Buttons
    buttonPadding: moodSliders.buttonStyle?.padding || '16px 32px',
    buttonWeight: moodSliders.buttonStyle?.fontWeight || '600',
    buttonTransform: moodSliders.buttonStyle?.textTransform || 'none',
    // Theme flags
    isDark: moodSliders.isDark || false,
    isMedium: moodSliders.isMedium || false,
    isLuxury: moodSliders.isLuxury || false,
    isPremium: moodSliders.isPremium || false,
    // Pre-computed surface colors for card backgrounds, hero sections, inputs
    surface: moodSliders.isDark ? '#1e293b' : moodSliders.isMedium ? (moodSliders.isLuxury ? '#f5f0e6' : '#e5e5e5') : '#f9fafb',
    cardBg: moodSliders.isDark ? '#1e293b' : moodSliders.isMedium ? '#ffffff' : '#ffffff',
    border: moodSliders.isDark ? '#334155' : moodSliders.isMedium ? '#d1d5db' : '#e5e7eb',
    inputBg: moodSliders.isDark ? '#0f172a' : moodSliders.isMedium ? '#ffffff' : '#ffffff'
  };
}

function ensureContrast(foreground, background) {
  // Simple luminance check: if both colors are dark, lighten the foreground
  const hex2lum = (hex) => {
    const c = hex.replace('#', '');
    const r = parseInt(c.substr(0, 2), 16) / 255;
    const g = parseInt(c.substr(2, 2), 16) / 255;
    const b = parseInt(c.substr(4, 2), 16) / 255;
    return 0.299 * r + 0.587 * g + 0.114 * b;
  };
  const fgLum = hex2lum(foreground);
  const bgLum = hex2lum(background);
  // If contrast ratio is too low (both dark or both light), return white or primary lightened
  if (Math.abs(fgLum - bgLum) < 0.3) {
    return bgLum < 0.5 ? '#f8fafc' : '#1f2937';
  }
  return foreground;
}

// ============================================
// CONTENT API & PAGE CONTENT BUILDER
// ============================================

/**
 * Build structured page content for brain.json
 * Extracts data that's currently hardcoded in page generators
 * and organizes it by page/section for the Website Editor
 */
function buildPageContent(businessData, industryId, generatedPages) {
  const pages = {};
  const pageList = INDUSTRY_PAGES[industryId] || INDUSTRY_PAGES['restaurant'];
  const trustText = generateFooterTrustText(businessData);
  const smartCta = getSmartCTA(businessData);
  const smartCtaPath = getSmartCtaPath(businessData);

  // HOME page content
  pages.home = {
    hero: {
      headline: businessData.heroHeadline || businessData.name,
      tagline: businessData.tagline || `Welcome to ${businessData.name}`,
      backgroundImage: businessData.heroImage || '',
      ctaText: smartCta,
      ctaPath: smartCtaPath
    },
    features: getSmartFeatures(businessData, 6).map(f => ({
      icon: f.icon || 'Star',
      title: f.title || f,
      description: f.description || ''
    })),
    reviews: buildDefaultReviews(businessData),
    faq: buildDefaultFAQ(businessData, industryId),
    gallery: (businessData.heroImages || []).slice(0, 6).map((src, i) => ({
      src,
      caption: `${businessData.name} - Image ${i + 1}`
    }))
  };

  // ABOUT page content
  const established = businessData.established || '2020';
  const yearsInBusiness = new Date().getFullYear() - parseInt(established);
  pages.about = {
    story: {
      heading: 'How It All Started',
      text: `${businessData.name} began with a simple dream and a passion for excellence. What started as a small operation has grown into a trusted name in our community.\n\nFor over ${yearsInBusiness} years, we've been dedicated to providing the highest quality service. We take pride in our craft and in building lasting relationships with our customers.`,
      image: businessData.images?.interior?.[0] || businessData.heroImage || ''
    },
    values: [
      { icon: 'Heart', title: 'Made with Love', description: 'Every detail is crafted with care and passion' },
      { icon: 'Award', title: 'Quality First', description: 'We use only the finest materials and methods' },
      { icon: 'Users', title: 'Community', description: 'Our neighbors are our family' }
    ],
    timeline: [
      { year: established, title: 'Founded', description: 'Founded with a dream and a vision' },
      { year: String(parseInt(established) + 2), title: 'Growing', description: 'Expanded to serve more customers' },
      { year: String(parseInt(established) + 5), title: 'Thriving', description: 'Became a community staple' },
      { year: 'Today', title: 'Today', description: 'Proudly serving our community' }
    ],
    team: buildDefaultTeam(businessData, industryId)
  };

  // CONTACT page content
  pages.contact = {
    info: {
      phone: businessData.phone || '(555) 123-4567',
      email: businessData.email || `hello@${businessData.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      address: businessData.address || '123 Main St',
      hours: businessData.hours || { 'monday-friday': '9am-6pm' }
    }
  };

  // SERVICES/MENU page content (if applicable)
  const servicePages = ['menu', 'services', 'classes', 'features', 'products', 'programs'];
  for (const sp of servicePages) {
    if (pageList.includes(sp)) {
      pages[sp] = {
        hero: {
          title: capitalize(sp) + (sp === 'menu' ? '' : ''),
          subtitle: `Explore our ${sp}`
        },
        categories: buildServiceCategories(businessData, sp, industryId)
      };
    }
  }

  // GALLERY page
  if (pageList.includes('gallery')) {
    pages.gallery = {
      hero: {
        title: 'Gallery',
        subtitle: `See what makes ${businessData.name} special`
      },
      images: (businessData.heroImages || []).map((src, i) => ({
        src,
        caption: `${businessData.name} - Photo ${i + 1}`
      }))
    };
  }

  // TEAM page
  if (pageList.includes('team')) {
    const teamMembers = buildDefaultTeam(businessData, industryId);
    const teamTitles = {
      'law-firm': { title: 'Our Attorneys', subtitle: 'Experienced legal professionals dedicated to your case' },
      'real-estate': { title: 'Our Agents', subtitle: 'Experienced agents ready to help you' },
      'dental': { title: 'Our Dental Team', subtitle: 'Caring professionals committed to your oral health' },
      'auto-shop': { title: 'Our Mechanics', subtitle: 'ASE certified technicians you can trust' }
    };
    const tt = teamTitles[industryId] || { title: 'Our Team', subtitle: `Meet the people behind ${businessData.name}` };
    pages.team = {
      hero: { title: tt.title, subtitle: tt.subtitle },
      members: teamMembers
    };
  }

  // _global: navbar + footer
  pages._global = {
    navbar: {
      logoText: businessData.name,
      phone: businessData.phone || '',
      ctaText: smartCta,
      ctaPath: smartCtaPath
    },
    footer: {
      tagline: businessData.tagline || `Welcome to ${businessData.name}`,
      phone: businessData.phone || '',
      email: businessData.email || '',
      address: businessData.address || '',
      trustText: trustText || ''
    }
  };

  return pages;
}

/**
 * Build default reviews for brain.json
 */
function buildDefaultReviews(businessData) {
  const name = businessData.name || 'this place';
  return [
    { text: `Absolutely amazing experience at ${name}! The quality and service exceeded all expectations.`, author: 'Sarah M.', rating: 5 },
    { text: `We\'ve been coming here for years. Always consistent, always excellent. Highly recommend!`, author: 'Mike R.', rating: 5 },
    { text: `Best in town! The attention to detail and customer care is unmatched.`, author: 'Lisa T.', rating: 5 }
  ];
}

/**
 * Build default FAQ for brain.json
 */
function buildDefaultFAQ(businessData, industryId) {
  const name = businessData.name || 'we';
  const phone = businessData.phone || '(555) 123-4567';

  const industryFAQs = {
    'salon-spa': [
      { question: 'Do I need an appointment?', answer: 'While walk-ins are welcome, we recommend booking in advance to ensure availability.' },
      { question: 'What services do you offer?', answer: 'We offer a full range of hair, skin, and nail services. Visit our Services page for details.' },
      { question: 'What is your cancellation policy?', answer: 'We ask for 24 hours notice for cancellations to avoid a cancellation fee.' }
    ],
    'restaurant': [
      { question: 'Do you take reservations?', answer: 'Yes! You can reserve a table through our website or by calling us.' },
      { question: 'Do you offer catering?', answer: 'Yes, we offer catering for events of all sizes. Contact us for a custom quote.' },
      { question: 'Do you have dietary options?', answer: 'We offer vegetarian, vegan, and gluten-free options. Let your server know about any allergies.' }
    ],
    'law-firm': [
      { question: 'Do you offer free consultations?', answer: 'Yes, we offer a free initial consultation to discuss your case and legal options.' },
      { question: 'What areas of law do you practice?', answer: 'We handle a wide range of legal matters. Visit our Services page for our practice areas.' },
      { question: 'How do I get started?', answer: `Call us at ${phone} or fill out our contact form to schedule your consultation.` }
    ]
  };

  // Try industry-specific, fall back to generic
  if (industryFAQs[industryId]) return industryFAQs[industryId];

  // Generic FAQ
  return [
    { question: 'What are your hours?', answer: `Please visit our Contact page or call us at ${phone} for current hours.` },
    { question: 'How do I book an appointment?', answer: 'You can book online through our website or give us a call.' },
    { question: 'Where are you located?', answer: businessData.address || 'Visit our Contact page for directions.' }
  ];
}

/**
 * Build default team members for brain.json
 */
function buildDefaultTeam(businessData, industryId) {
  const teamImages = businessData.images?.team || [];

  const teamByIndustry = {
    'law-firm': [
      { name: 'Robert Mitchell', role: 'Managing Partner', bio: 'Over 25 years of trial experience in personal injury and civil litigation.', credentials: ['J.D. Harvard Law', 'Super Lawyer', 'Top 100 Trial Lawyers'] },
      { name: 'Sarah Chen', role: 'Senior Partner', bio: 'Specializing in family law with a focus on divorce and custody matters.', credentials: ['J.D. Stanford Law', 'Family Law Specialist', 'Certified Mediator'] },
      { name: 'Michael Torres', role: 'Partner', bio: 'Criminal defense attorney with an exceptional track record.', credentials: ['J.D. Columbia Law', 'Ex-District Attorney', 'Criminal Law Expert'] },
      { name: 'Jennifer Adams', role: 'Associate Attorney', bio: 'Business law specialist helping entrepreneurs protect their interests.', credentials: ['J.D. UCLA Law', 'MBA Finance', 'Corporate Law'] }
    ],
    'real-estate': [
      { name: 'Jennifer Williams', role: 'Principal Broker', bio: 'Over 20 years in real estate with $200M+ in career sales.', credentials: ['Licensed Broker', 'Top Producer'] },
      { name: 'David Park', role: 'Senior Agent', bio: 'Specializing in first-time buyers and investment properties.', credentials: ['15+ Years Experience', 'Buyer Specialist'] },
      { name: 'Amanda Rodriguez', role: 'Listing Specialist', bio: 'Marketing expert who gets homes sold fast and for top dollar.', credentials: ['Listing Expert', 'Digital Marketing'] }
    ],
    'dental': [
      { name: 'Dr. Sarah Mitchell', role: 'Lead Dentist', bio: 'Over 15 years of experience in general and cosmetic dentistry.', credentials: ['DDS', 'Cosmetic Specialist'] },
      { name: 'Dr. James Park', role: 'Orthodontist', bio: 'Specializing in Invisalign and traditional braces.', credentials: ['DMD', 'Board Certified'] },
      { name: 'Lisa Chen', role: 'Dental Hygienist', bio: 'Gentle, thorough cleanings with a focus on patient comfort.', credentials: ['RDH', '10+ Years Experience'] }
    ],
    'auto-shop': [
      { name: 'Tony Ramirez', role: 'Owner / Master Technician', bio: 'ASE Master Tech with 30+ years of experience.', credentials: ['ASE Master', 'Shop Owner'] },
      { name: 'Steve Miller', role: 'Lead Technician', bio: 'Engine diagnostics and repair specialist.', credentials: ['ASE Certified', 'Diagnostics Expert'] },
      { name: 'Kevin Park', role: 'Technician', bio: 'Expert in electrical systems and hybrid vehicles.', credentials: ['ASE Certified', 'Hybrid Specialist'] }
    ]
  };

  const members = teamByIndustry[industryId] || [
    { name: 'Owner', role: 'Founder & Owner', bio: `Leading ${businessData.name} with passion and dedication.` },
    { name: 'Team Member', role: 'Senior Staff', bio: 'Bringing years of experience and expertise.' }
  ];

  return members.map((m, i) => ({ ...m, image: teamImages[i] || '' }));
}

/**
 * Build service categories for brain.json
 */
function buildServiceCategories(businessData, pageType, industryId) {
  // Try to pull from existing fixture data
  if (pageType === 'menu' && businessData.menu?.categories) {
    return businessData.menu.categories.map(cat => ({
      name: cat.name,
      items: (cat.items || []).map(item => ({
        name: item.name,
        description: item.description || '',
        price: item.price || '',
        image: item.image || ''
      }))
    }));
  }

  // Generic fallback
  return [
    {
      name: 'Popular',
      items: [
        { name: 'Service 1', description: 'Our most popular option', price: '' },
        { name: 'Service 2', description: 'A great choice', price: '' },
        { name: 'Service 3', description: 'Premium quality', price: '' }
      ]
    }
  ];
}

/**
 * Generate content API routes (content.js)
 * Produces backend/routes/content.js with CRUD for brain.json pages
 */
function generateContentRoutes(businessData) {
  const businessName = escapeQuotes(businessData.name);
  return `/**
 * Content Routes - ${businessName}
 * Website Editor API for reading/writing brain.json page content
 * Generated by Launchpad
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const BRAIN_PATH = path.join(__dirname, '../../brain.json');

// SSE clients for real-time sync
let sseClients = [];

function loadBrain() {
  try {
    return JSON.parse(fs.readFileSync(BRAIN_PATH, 'utf8'));
  } catch (e) {
    return null;
  }
}

function saveBrain(data) {
  fs.writeFileSync(BRAIN_PATH, JSON.stringify(data, null, 2));
  // Notify SSE clients
  sseClients.forEach(res => {
    try { res.write('data: ' + JSON.stringify({ type: 'content-updated', ts: Date.now() }) + '\\n\\n'); }
    catch (e) { /* client disconnected */ }
  });
}

// SSE endpoint for real-time preview sync
router.get('/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });
  res.write('data: ' + JSON.stringify({ type: 'connected' }) + '\\n\\n');
  sseClients.push(res);
  req.on('close', () => {
    sseClients = sseClients.filter(c => c !== res);
  });
});

// GET /api/content - full brain.json
router.get('/', (req, res) => {
  const brain = loadBrain();
  if (!brain) return res.status(404).json({ success: false, error: 'brain.json not found' });
  res.json({ success: true, content: brain });
});

// GET /api/content/pages - just the pages object
router.get('/pages', (req, res) => {
  const brain = loadBrain();
  if (!brain) return res.status(404).json({ success: false, error: 'brain.json not found' });
  res.json({ success: true, pages: brain.pages || {} });
});

// GET /api/content/:page - single page data
router.get('/:page', (req, res) => {
  const brain = loadBrain();
  if (!brain) return res.status(404).json({ success: false, error: 'brain.json not found' });
  const pageData = brain.pages?.[req.params.page];
  if (!pageData) return res.status(404).json({ success: false, error: 'Page not found' });
  res.json({ success: true, page: req.params.page, data: pageData });
});

// PUT /api/content/:page/:section - update a section within a page
router.put('/:page/:section', (req, res) => {
  const brain = loadBrain();
  if (!brain) return res.status(404).json({ success: false, error: 'brain.json not found' });

  if (!brain.pages) brain.pages = {};
  if (!brain.pages[req.params.page]) brain.pages[req.params.page] = {};

  brain.pages[req.params.page][req.params.section] = req.body.data;
  brain._lastEdited = { page: req.params.page, section: req.params.section, at: new Date().toISOString() };

  saveBrain(brain);
  res.json({ success: true, message: 'Section updated' });
});

// PUT /api/content/business - update root-level business fields
router.put('/business', (req, res) => {
  const brain = loadBrain();
  if (!brain) return res.status(404).json({ success: false, error: 'brain.json not found' });

  const allowed = ['name', 'tagline', 'phone', 'email', 'address', 'hours', 'established'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) brain[key] = req.body[key];
  }
  brain._lastEdited = { type: 'business', at: new Date().toISOString() };

  saveBrain(brain);
  res.json({ success: true, message: 'Business info updated' });
});

// PUT /api/content/theme - update theme
router.put('/theme', (req, res) => {
  const brain = loadBrain();
  if (!brain) return res.status(404).json({ success: false, error: 'brain.json not found' });

  brain.theme = { ...(brain.theme || {}), ...req.body };
  brain._lastEdited = { type: 'theme', at: new Date().toISOString() };

  saveBrain(brain);
  res.json({ success: true, message: 'Theme updated' });
});

module.exports = router;
`;
}

/**
 * Generate customer & loyalty routes for admin dashboard
 */
function generateCustomerRoutes(businessData, industryId) {
  const businessName = escapeQuotes(businessData.name);

  // Map industry to reward template
  const templateMap = {
    'pizza-restaurant': 'food', 'steakhouse': 'food', 'coffee-cafe': 'food',
    'restaurant': 'food', 'bakery': 'food',
    'salon-spa': 'salon', 'barbershop': 'salon',
    'fitness-gym': 'fitness', 'yoga': 'fitness',
    'dental': 'professional', 'healthcare': 'professional', 'law-firm': 'professional',
    'plumber': 'trade', 'cleaning': 'trade', 'auto-shop': 'trade',
    'saas': 'tech', 'ecommerce': 'tech', 'school': 'tech',
    'real-estate': 'realestate'
  };
  const defaultTemplate = templateMap[industryId] || 'food';

  return `/**
 * Customer & Loyalty Routes - ${businessName}
 * Generated by Launchpad
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Import auth module for user data access
const authModule = require('../modules/auth/routes/auth.js');

// ============================================
// HELPERS
// ============================================

function loadBrain() {
  try {
    const brainPath = path.join(__dirname, '..', 'data', 'brain.json');
    if (fs.existsSync(brainPath)) {
      return JSON.parse(fs.readFileSync(brainPath, 'utf-8'));
    }
  } catch (e) { /* ignore */ }
  return {};
}

function saveBrain(brain) {
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(path.join(dataDir, 'brain.json'), JSON.stringify(brain, null, 2));
}

function getAllCustomers() {
  const customers = [];

  // Gather from demo accounts + runtime signups
  if (authModule.DEMO_ACCOUNTS) {
    for (const [email, user] of Object.entries(authModule.DEMO_ACCOUNTS)) {
      customers.push({
        id: user.id,
        email: user.email,
        full_name: user.full_name || 'Unknown',
        tier: user.tier || 'bronze',
        points: user.points || 0,
        is_admin: user.is_admin || false,
        joined: user.created_at || new Date().toISOString(),
        last_active: user.last_login || new Date().toISOString(),
        source: 'demo'
      });
    }
  }

  // Add runtime signups from testUsers Map
  if (authModule.testUsers) {
    for (const [email, user] of authModule.testUsers) {
      // Avoid duplicating demo accounts
      if (authModule.DEMO_ACCOUNTS && authModule.DEMO_ACCOUNTS[email]) continue;
      customers.push({
        id: user.id,
        email: user.email,
        full_name: user.full_name || 'Unknown',
        tier: user.tier || 'bronze',
        points: user.points || 0,
        is_admin: user.is_admin || false,
        joined: user.created_at || new Date().toISOString(),
        last_active: user.last_login || new Date().toISOString(),
        source: 'signup'
      });
    }
  }

  return customers;
}

// SSE clients
const sseClients = [];

function broadcastCustomerUpdate(data) {
  sseClients.forEach(res => {
    res.write(\`data: \${JSON.stringify(data)}\\n\\n\`);
  });
}

// ============================================
// CUSTOMER ENDPOINTS
// ============================================

// SSE stream for real-time updates
router.get('/customers/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.write('data: {"type":"connected"}\\n\\n');
  sseClients.push(res);
  req.on('close', () => {
    const idx = sseClients.indexOf(res);
    if (idx > -1) sseClients.splice(idx, 1);
  });
});

// GET /customers - list with search, pagination, tier filter
router.get('/customers', (req, res) => {
  try {
    const { search, tier, page = 1, limit = 20 } = req.query;
    let customers = getAllCustomers();

    if (search) {
      const q = search.toLowerCase();
      customers = customers.filter(c =>
        c.full_name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
      );
    }
    if (tier) {
      customers = customers.filter(c => c.tier === tier);
    }

    const total = customers.length;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginated = customers.slice(offset, offset + parseInt(limit));

    res.json({ success: true, customers: paginated, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /customers/stats
router.get('/customers/stats', (req, res) => {
  try {
    const customers = getAllCustomers();
    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const tiers = { bronze: 0, silver: 0, gold: 0, platinum: 0 };
    let totalPoints = 0;
    let newThisWeek = 0;

    customers.forEach(c => {
      tiers[c.tier] = (tiers[c.tier] || 0) + 1;
      totalPoints += c.points || 0;
      if (new Date(c.joined) >= weekAgo) newThisWeek++;
    });

    res.json({
      success: true,
      stats: {
        total: customers.length,
        tiers,
        newThisWeek,
        avgPoints: customers.length ? Math.round(totalPoints / customers.length) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /customers/:id
router.get('/customers/:id', (req, res) => {
  try {
    const customers = getAllCustomers();
    const customer = customers.find(c => String(c.id) === req.params.id);
    if (!customer) return res.status(404).json({ success: false, error: 'Customer not found' });
    res.json({ success: true, customer });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /customers/:id/points - adjust points
router.put('/customers/:id/points', (req, res) => {
  try {
    const { amount, reason } = req.body;
    const id = parseInt(req.params.id);

    // Update in demo accounts
    if (authModule.DEMO_ACCOUNTS) {
      for (const user of Object.values(authModule.DEMO_ACCOUNTS)) {
        if (user.id === id) {
          user.points = Math.max(0, (user.points || 0) + parseInt(amount));
          broadcastCustomerUpdate({ type: 'points_updated', customerId: id, points: user.points, reason });
          return res.json({ success: true, points: user.points });
        }
      }
    }

    // Update in testUsers
    if (authModule.testUsers) {
      for (const [, user] of authModule.testUsers) {
        if (user.id === id) {
          user.points = Math.max(0, (user.points || 0) + parseInt(amount));
          broadcastCustomerUpdate({ type: 'points_updated', customerId: id, points: user.points, reason });
          return res.json({ success: true, points: user.points });
        }
      }
    }

    res.status(404).json({ success: false, error: 'Customer not found' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /customers/:id/tier - override tier
router.put('/customers/:id/tier', (req, res) => {
  try {
    const { tier } = req.body;
    const id = parseInt(req.params.id);
    const validTiers = ['bronze', 'silver', 'gold', 'platinum'];
    if (!validTiers.includes(tier)) {
      return res.status(400).json({ success: false, error: 'Invalid tier' });
    }

    // Update in demo accounts
    if (authModule.DEMO_ACCOUNTS) {
      for (const user of Object.values(authModule.DEMO_ACCOUNTS)) {
        if (user.id === id) {
          user.tier = tier;
          broadcastCustomerUpdate({ type: 'tier_updated', customerId: id, tier });
          return res.json({ success: true, tier });
        }
      }
    }

    // Update in testUsers
    if (authModule.testUsers) {
      for (const [, user] of authModule.testUsers) {
        if (user.id === id) {
          user.tier = tier;
          broadcastCustomerUpdate({ type: 'tier_updated', customerId: id, tier });
          return res.json({ success: true, tier });
        }
      }
    }

    res.status(404).json({ success: false, error: 'Customer not found' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// REWARDS CONFIG ENDPOINTS
// ============================================

// GET /rewards/config
router.get('/rewards/config', (req, res) => {
  try {
    const brain = loadBrain();
    const config = brain.rewardsConfig || getDefaultRewardsConfig();
    res.json({ success: true, config });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /rewards/config
router.put('/rewards/config', (req, res) => {
  try {
    const brain = loadBrain();
    brain.rewardsConfig = req.body;
    saveBrain(brain);
    res.json({ success: true, message: 'Rewards config saved' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

function getDefaultRewardsConfig() {
  return ${JSON.stringify({
    templateId: defaultTemplate,
    programName: 'Rewards Club',
    pointsModel: 'per-dollar',
    pointsRate: 10,
    tiers: [
      { name: 'Bronze', minPoints: 0, multiplier: 1.0, benefits: ['Earn points on every purchase'] },
      { name: 'Silver', minPoints: 200, multiplier: 1.2, benefits: ['1.2x point multiplier', 'Birthday bonus'] },
      { name: 'Gold', minPoints: 500, multiplier: 1.5, benefits: ['1.5x point multiplier', 'Priority service', 'Exclusive offers'] },
      { name: 'Platinum', minPoints: 1000, multiplier: 2.0, benefits: ['2x point multiplier', 'VIP access', 'Free upgrades', 'Dedicated support'] }
    ],
    rewards: [],
    rules: { signupBonus: 50, referralBonus: 100, birthdayBonus: 200, pointExpiry: 365 }
  }, null, 2)};
}

module.exports = router;
`;
}

/**
 * Generate Chat Routes for real-time customer-admin messaging
 */
function generateChatRoutes(businessData) {
  const businessName = escapeQuotes(businessData.name);

  return `/**
 * Chat Routes - ${businessName}
 * Real-time customer-admin messaging
 * Generated by Launchpad
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const BRAIN_PATH = path.join(__dirname, '..', '..', 'brain.json');

function loadBrain() {
  try { return JSON.parse(fs.readFileSync(BRAIN_PATH, 'utf8')); }
  catch { return {}; }
}

function saveBrain(data) {
  fs.writeFileSync(BRAIN_PATH, JSON.stringify(data, null, 2));
}

// SSE clients
const sseClients = [];

function broadcastChat(data) {
  const msg = \`data: \${JSON.stringify(data)}\\n\\n\`;
  sseClients.forEach(res => res.write(msg));
}

// SSE endpoint
router.get('/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });
  res.write('data: {"type":"connected"}\\n\\n');
  sseClients.push(res);
  req.on('close', () => {
    const idx = sseClients.indexOf(res);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});

// List all conversations (admin)
router.get('/conversations', (req, res) => {
  const brain = loadBrain();
  const convos = brain.chatConversations || {};
  const list = Object.values(convos).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  res.json({ success: true, conversations: list });
});

// Get conversation for a specific customer
router.get('/conversations/:customerId', (req, res) => {
  const brain = loadBrain();
  const convos = brain.chatConversations || {};
  const convo = Object.values(convos).find(c => String(c.customerId) === String(req.params.customerId));
  res.json({ success: true, conversation: convo || null });
});

// Send a message
router.post('/send', (req, res) => {
  const { customerId, customerName, customerEmail, sender, text } = req.body;
  if (!customerId || !sender || !text) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  const brain = loadBrain();
  if (!brain.chatConversations) brain.chatConversations = {};

  // Find or create conversation
  let convo = Object.values(brain.chatConversations).find(c => String(c.customerId) === String(customerId));
  const now = new Date().toISOString();

  if (!convo) {
    const id = 'conv_' + Date.now();
    convo = {
      id,
      customerId,
      customerName: customerName || 'Customer',
      customerEmail: customerEmail || '',
      status: 'active',
      unreadByAdmin: 0,
      createdAt: now,
      updatedAt: now,
      messages: []
    };
    brain.chatConversations[convo.id] = convo;
  }

  // Add message
  const msg = {
    id: 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    sender,
    text,
    timestamp: now
  };
  convo.messages.push(msg);
  convo.updatedAt = now;

  if (sender === 'customer') {
    convo.unreadByAdmin = (convo.unreadByAdmin || 0) + 1;

    // Auto-reply
    const autoReply = {
      id: 'msg_' + (Date.now() + 1) + '_' + Math.random().toString(36).slice(2, 6),
      sender: 'system',
      text: "Thanks for reaching out! We'll get back to you shortly.",
      timestamp: new Date(Date.now() + 1).toISOString()
    };
    convo.messages.push(autoReply);
    convo.updatedAt = autoReply.timestamp;
  }

  if (sender === 'admin') {
    convo.unreadByAdmin = 0;
  }

  saveBrain(brain);
  broadcastChat({ type: 'chat_update', conversationId: convo.id, customerId: convo.customerId });
  res.json({ success: true, conversation: convo });
});

// Update conversation status
router.put('/conversations/:id/status', (req, res) => {
  const brain = loadBrain();
  const convo = (brain.chatConversations || {})[req.params.id];
  if (!convo) return res.status(404).json({ success: false, error: 'Not found' });
  convo.status = req.body.status || 'active';
  convo.updatedAt = new Date().toISOString();
  saveBrain(brain);
  broadcastChat({ type: 'chat_update', conversationId: convo.id, customerId: convo.customerId });
  res.json({ success: true, conversation: convo });
});

// Unread count
router.get('/unread-count', (req, res) => {
  const brain = loadBrain();
  const convos = brain.chatConversations || {};
  const total = Object.values(convos).reduce((sum, c) => sum + (c.unreadByAdmin || 0), 0);
  res.json({ success: true, unreadCount: total });
});

module.exports = router;
`;
}

/**
 * Generate ContentProvider component for frontend
 * Provides page content from brain.json to all components via React context
 */
function generateContentProvider() {
  return `/**
 * ContentProvider - Data layer for editable content
 * Fetches page content from /api/content and provides it via React context.
 * Page components use usePageContent('home') to get their data,
 * falling back to hardcoded defaults if the API is unreachable.
 *
 * Generated by Launchpad
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

const ContentContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL || '';

export function ContentProvider({ children }) {
  const [content, setContent] = useState(null);

  useEffect(() => {
    fetch(API_URL + '/api/content')
      .then(r => r.json())
      .then(data => {
        if (data.success) setContent(data.content);
      })
      .catch(() => {}); // Silently fall back to defaults

    // Listen for SSE updates from admin editor
    let es;
    try {
      es = new EventSource(API_URL + '/api/content/events');
      es.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.type === 'content-updated') {
          // Re-fetch content on update
          fetch(API_URL + '/api/content')
            .then(r => r.json())
            .then(data => {
              if (data.success) setContent(data.content);
            })
            .catch(() => {});
        }
      };
    } catch (e) { /* SSE not available */ }

    return () => { if (es) es.close(); };
  }, []);

  return (
    <ContentContext.Provider value={content}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  return useContext(ContentContext);
}

export function usePageContent(page) {
  const content = useContent();
  return content?.pages?.[page] || {};
}
`;
}

function capitalize(str) {
  // Handle hyphenated strings like 'order-history' -> 'OrderHistory'
  if (str.includes('-')) {
    return str.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeQuotes(str) {
  if (!str) return '';
  return String(str).replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, ' ');
}

function formatPrice(price) {
  if (typeof price === 'number') return '$' + price.toFixed(2);
  if (typeof price === 'string' && !price.startsWith('$')) return '$' + price;
  return price;
}

/**
 * Get trend-aware nav CTA based on trending features
 * Returns { label, path } or null
 */
function getTrendNavCta(businessData) {
  const features = businessData.trendingFeatures || [];
  const industry = businessData.industry || '';

  // Check trending features for action keywords
  for (const feature of features) {
    const f = feature.toLowerCase();
    if (f.includes('order') || f.includes('delivery')) {
      return { label: 'Order Online', path: '/order' };
    }
    if (f.includes('book') || f.includes('appointment')) {
      return { label: 'Book Now', path: '/book' };
    }
    if (f.includes('quote')) {
      return { label: 'Get Quote', path: '/quote' };
    }
    if (f.includes('reserve') || f.includes('reservation')) {
      return { label: 'Reserve', path: '/reservations' };
    }
    if (f.includes('schedule')) {
      return { label: 'Schedule', path: '/schedule' };
    }
    if (f.includes('trial') || f.includes('demo')) {
      return { label: 'Start Free', path: '/demo' };
    }
  }

  // Industry-specific defaults
  const industryDefaults = {
    'pizza-restaurant': { label: 'Order Now', path: '/order' },
    'steakhouse': { label: 'Reserve', path: '/reservations' },
    'coffee-cafe': { label: 'Order Ahead', path: '/order' },
    'restaurant': { label: 'Reserve', path: '/reservations' },
    'salon-spa': { label: 'Book Now', path: '/book' },
    'fitness-gym': { label: 'Join Now', path: '/membership' },
    'dental': { label: 'Book', path: '/book' },
    'healthcare': { label: 'Schedule', path: '/book' },
    'yoga': { label: 'Book Class', path: '/classes' },
    'barbershop': { label: 'Book Now', path: '/book' },
    'law-firm': { label: 'Consult', path: '/consultation' },
    'plumber': { label: 'Get Quote', path: '/quote' },
    'cleaning': { label: 'Get Quote', path: '/quote' },
    'auto-shop': { label: 'Schedule', path: '/appointment' },
    'saas': { label: 'Try Free', path: '/demo' }
  };

  return industryDefaults[industry] || null;
}

/**
 * Generate footer trust text from trending trust signals
 * Expanded to cover more industry-specific trust patterns
 */
function generateFooterTrustText(businessData) {
  const trust = businessData.trendingTrustSignals || [];
  if (trust.length === 0) return '';

  const parts = [];

  for (const t of trust) {
    const tLower = t.toLowerCase();

    // Family/ownership
    if (tLower.includes('family') && !parts.some(p => p.includes('family'))) {
      parts.push('Family-owned business');
    }
    // Licensed/insured (service industries)
    if ((tLower.includes('licens') || tLower.includes('insur')) && !parts.some(p => p.includes('Licensed'))) {
      parts.push('Licensed & insured');
    }
    // Experience/years
    if (tLower.includes('years') || tLower.includes('established') || tLower.includes('experience')) {
      const yearMatch = t.match(/(\d+)/);
      if (yearMatch && !parts.some(p => p.includes('Serving'))) {
        const years = parseInt(yearMatch[1]);
        parts.push(`Serving since ${new Date().getFullYear() - years}`);
      }
    }
    // Certified professionals
    if ((tLower.includes('certified') || tLower.includes('certification')) && !parts.some(p => p.includes('Certified'))) {
      parts.push('Certified professionals');
    }
    // Guarantee
    if (tLower.includes('guarantee') && !parts.some(p => p.includes('guarantee'))) {
      parts.push('100% satisfaction guaranteed');
    }
    // Local
    if (tLower.includes('local') && !parts.some(p => p.includes('local'))) {
      parts.push('Proudly local');
    }
    // Awards
    if (tLower.includes('award') && !parts.some(p => p.includes('Award'))) {
      parts.push('Award-winning service');
    }
    // Sourcing/ethical (cafe, restaurant)
    if ((tLower.includes('sourcing') || tLower.includes('source') || tLower.includes('ethic')) && !parts.some(p => p.includes('Ethically'))) {
      parts.push('Ethically sourced');
    }
    // Sustainability/eco (cafe, retail)
    if ((tLower.includes('sustainab') || tLower.includes('eco') || tLower.includes('green')) && !parts.some(p => p.includes('Sustainab'))) {
      parts.push('Sustainability focused');
    }
    // Testimonials/reviews (all industries)
    if ((tLower.includes('testimonial') || tLower.includes('review') || tLower.includes('rated')) && !parts.some(p => p.includes('rated'))) {
      parts.push('Highly rated');
    }
    // Fresh/roasted (food, cafe)
    if ((tLower.includes('fresh') || tLower.includes('roasted') || tLower.includes('daily')) && !parts.some(p => p.includes('Fresh'))) {
      parts.push('Fresh daily');
    }
    // Artisan/craft/handmade (cafe, bakery)
    if ((tLower.includes('artisan') || tLower.includes('craft') || tLower.includes('handmade')) && !parts.some(p => p.includes('Artisan'))) {
      parts.push('Artisan crafted');
    }
    // Organic/natural (food, wellness)
    if ((tLower.includes('organic') || tLower.includes('natural')) && !parts.some(p => p.includes('Organic'))) {
      parts.push('Organic options');
    }
    // Trained/skilled (service, fitness)
    if ((tLower.includes('trained') || tLower.includes('skilled') || tLower.includes('expert')) && !parts.some(p => p.includes('Expert'))) {
      parts.push('Expert team');
    }
    // Community (all industries)
    if (tLower.includes('community') && !parts.some(p => p.includes('Community'))) {
      parts.push('Community-focused');
    }
  }

  return parts.slice(0, 3).join(' • ');
}

/**
 * Parse trend color descriptions into usable color values
 * Extracts color codes or maps descriptive colors to hex values
 */
function parseTrendColors(colorTrends) {
  if (!colorTrends || colorTrends.length === 0) return null;

  // Common color mappings from trend descriptions
  const colorMap = {
    // Earth tones
    'terracotta': '#D97859',
    'amber': '#F59E0B',
    'warm earth': '#B8860B',
    'earth tones': '#9C6D4E',
    'burnt orange': '#CC5500',
    'rust': '#B7410E',
    // Greens
    'sage': '#9CAF88',
    'sage green': '#9CAF88',
    'natural green': '#4A7C59',
    'eucalyptus': '#5F9EA0',
    'olive': '#808000',
    'forest': '#228B22',
    // Neutrals
    'cream': '#FFFDD0',
    'ivory': '#FFFFF0',
    'beige': '#F5F5DC',
    'sand': '#C2B280',
    'charcoal': '#36454F',
    // Rich tones
    'burgundy': '#800020',
    'wine': '#722F37',
    'navy': '#000080',
    'deep navy': '#001F3F',
    // Soft tones
    'blush': '#DE5D83',
    'rose gold': '#B76E79',
    'lavender': '#E6E6FA',
    'lilac': '#C8A2C8',
    'coral': '#FF7F50',
    // Modern
    'electric blue': '#7DF9FF',
    'teal': '#008080',
    // Pastels
    'pastel': '#FFD1DC',
    'soft pink': '#FFB6C1'
  };

  // Try to extract colors from the trend descriptions
  const extractedColors = {
    primary: null,
    secondary: null,
    accent: null
  };

  for (const trend of colorTrends) {
    const trendLower = trend.toLowerCase();

    // Check for hex codes
    const hexMatch = trend.match(/#[0-9A-Fa-f]{6}/);
    if (hexMatch) {
      if (!extractedColors.primary) {
        extractedColors.primary = hexMatch[0];
      } else if (!extractedColors.secondary) {
        extractedColors.secondary = hexMatch[0];
      }
      continue;
    }

    // Check color mappings
    for (const [name, hex] of Object.entries(colorMap)) {
      if (trendLower.includes(name)) {
        if (!extractedColors.primary) {
          extractedColors.primary = hex;
        } else if (!extractedColors.secondary) {
          extractedColors.secondary = hex;
        } else if (!extractedColors.accent) {
          extractedColors.accent = hex;
        }
        break;
      }
    }
  }

  // Return only if we found at least one color
  if (extractedColors.primary || extractedColors.secondary || extractedColors.accent) {
    return extractedColors;
  }

  return null;
}

// ============================================
// EXPORTS
// ============================================
// API HOOK GENERATORS
// ============================================

/**
 * Generate useApi hook for simple API calls
 */
function generateUseApiHook() {
  return `/**
 * Simple API hook for making fetch requests
 * Generated by Launchpad
 */
export function useApi() {
  const base = '';
  return {
    get: (url) => fetch(base + url).then(r => r.json()),
    post: (url, data) => fetch(base + url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    put: (url, data) => fetch(base + url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json())
  };
}
`;
}

/**
 * Generate useMenu hook code for real-time menu sync
 */
function generateUseMenuHook() {
  return `/**
 * useMenu Hook
 *
 * Hook for fetching and subscribing to menu updates from the admin API.
 * Includes SSE subscription for real-time sync.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

const API_BASE = (import.meta.env?.VITE_API_URL || '') + '/api';

export function useMenu(fallbackData = null, options = {}) {
  const { enableSSE = true, retryDelay = 5000, maxRetries = 3 } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);

  const eventSourceRef = useRef(null);
  const retryCountRef = useRef(0);

  const fetchMenu = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(\`\${API_BASE}/menu\`);
      if (!response.ok) throw new Error(\`HTTP error! status: \${response.status}\`);

      const result = await response.json();
      if (result.success) {
        setData(result);
        retryCountRef.current = 0;
      } else {
        throw new Error(result.error || 'Failed to fetch menu');
      }
    } catch (err) {
      console.warn('[useMenu] API fetch failed:', err.message);
      setError(err.message);
      if (fallbackData && !data) {
        setData({ categories: fallbackData.categories || [], success: true, fallback: true });
      }
    } finally {
      setLoading(false);
    }
  }, [fallbackData, data]);

  const setupSSE = useCallback(() => {
    if (!enableSSE) return;
    if (eventSourceRef.current) eventSourceRef.current.close();

    try {
      const eventSource = new EventSource(\`\${API_BASE}/menu/events\`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setConnected(true);
        retryCountRef.current = 0;
      };

      eventSource.onmessage = (event) => {
        const message = JSON.parse(event.data);
        // Refetch on any menu change event (ignore heartbeat and initial_state)
        if (message.type && !['connected', 'heartbeat', 'initial_state'].includes(message.type)) {
          fetchMenu();
        }
      };

      eventSource.onerror = () => {
        setConnected(false);
        eventSource.close();
        if (retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          setTimeout(setupSSE, retryDelay * retryCountRef.current);
        }
      };
    } catch (err) {
      console.warn('[useMenu] SSE setup failed:', err.message);
    }
  }, [enableSSE, fetchMenu, maxRetries, retryDelay]);

  useEffect(() => {
    fetchMenu();
    setupSSE();
    return () => { if (eventSourceRef.current) eventSourceRef.current.close(); };
  }, [fetchMenu, setupSSE]);

  const categories = data?.categories || fallbackData?.categories || [];
  const items = categories.flatMap(cat => cat.items || []);

  return {
    categories,
    items,
    availableItems: items.filter(item => item.available !== false),
    popularItems: items.filter(item => item.popular && item.available !== false),
    loading,
    error,
    connected,
    isFallback: data?.fallback || false,
    refetch: fetchMenu
  };
}

export default useMenu;
`;
}

/**
 * Generate useReservations hook code for booking functionality
 */
function generateUseReservationsHook() {
  return `/**
 * useReservations Hook
 *
 * Hook for creating reservations and checking availability.
 */

import { useState, useCallback, useEffect } from 'react';

const API_BASE = (import.meta.env?.VITE_API_URL || '') + '/api';

export function useReservations(options = {}) {
  const { onNewReservation = null } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [lastReservation, setLastReservation] = useState(null);

  const createReservation = useCallback(async (reservationData) => {
    const { customerName, customerEmail, customerPhone, date, time, partySize, specialRequests } = reservationData;

    if (!customerName || !customerEmail || !date || !time || !partySize) {
      const err = 'Please fill in all required fields';
      setError(err);
      throw new Error(err);
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(\`\${API_BASE}/reservations\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone || '',
          date, time,
          party_size: parseInt(partySize),
          special_requests: specialRequests || ''
        })
      });

      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Failed to create reservation');

      setLastReservation(result);
      if (onNewReservation) onNewReservation(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [onNewReservation]);

  const checkAvailability = useCallback(async (date) => {
    if (!date) { setError('Date is required'); return null; }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(\`\${API_BASE}/reservations/availability?date=\${date}\`);
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Failed to check availability');

      setAvailability(result);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const lookupReservation = useCallback(async (referenceCode) => {
    if (!referenceCode) { setError('Reference code is required'); return null; }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(\`\${API_BASE}/reservations/\${referenceCode}\`);
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Reservation not found');

      return result.reservation;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return {
    createReservation,
    checkAvailability,
    lookupReservation,
    loading,
    error,
    availability,
    lastReservation,
    clearError: () => setError(null),
    availableSlots: availability?.slots?.filter(s => s.available) || []
  };
}

export default useReservations;
`;
}

/**
 * Generate root package.json for monorepo-style project
 * Includes scripts to run frontend, backend, and admin concurrently
 */
function generateRootPackageJson(businessName, projectSlug) {
  const slug = projectSlug || businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return {
    name: `${slug}-fullstack`,
    version: "1.0.0",
    private: true,
    description: `Full-stack project for ${businessName} - Frontend, Backend, and Admin Dashboard`,
    scripts: {
      // Individual commands
      "dev:frontend": "cd frontend && npm run dev",
      "dev:backend": "cd backend && npm run dev",
      "dev:admin": "cd admin && npm run dev",
      // Kill lingering processes on ports 5000/5001/5002
      "kill": "npx kill-port 5000 5001 5002",
      // Combined commands (kills old ports first)
      "dev:all": "npm run kill && concurrently \"npm run dev:frontend\" \"npm run dev:backend\" \"npm run dev:admin\"",
      "dev": "npm run dev:all",
      // Install all dependencies (run this manually, not as postinstall to avoid circular deps)
      "install:all": "cd frontend && npm install && cd ../backend && npm install && cd ../admin && npm install",
      // Build commands
      "build:frontend": "cd frontend && npm run build",
      "build:admin": "cd admin && npm run build",
      "build": "npm run build:frontend && npm run build:admin",
      // Start production
      "start": "cd backend && npm start"
    },
    devDependencies: {
      "concurrently": "^8.2.2"
    },
    engines: {
      node: ">=18.0.0"
    }
  };
}

/**
 * Generate README with instructions for running the project
 */
function generateProjectReadme(businessName) {
  return `# ${businessName}

Full-stack website with admin dashboard and real-time sync.

## Quick Start

\`\`\`bash
# Install all dependencies
npm install

# Start everything (frontend + backend + admin)
npm run dev
\`\`\`

## URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:5000 | Public website |
| Backend API | http://localhost:5001 | REST API server |
| Admin Dashboard | http://localhost:5002 | Business management |

## Project Structure

\`\`\`
${businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/
├── frontend/          # Public website (React + Vite)
│   ├── src/
│   │   ├── pages/     # Page components
│   │   ├── hooks/     # useMenu, useReservations
│   │   └── App.jsx    # Main app with routing
│   └── package.json
│
├── backend/           # API server (Express)
│   ├── server.js      # Main server
│   ├── routes/        # API routes
│   └── package.json
│
├── admin/             # Admin dashboard (React + Vite)
│   ├── src/
│   │   ├── pages/     # Dashboard, Menu, Reservations
│   │   ├── components/# Reusable components
│   │   └── App.jsx    # Admin app
│   └── package.json
│
└── package.json       # Root package (runs all services)
\`\`\`

## Commands

| Command | Description |
|---------|-------------|
| \`npm run dev\` | Start all services |
| \`npm run dev:frontend\` | Start frontend only |
| \`npm run dev:backend\` | Start backend only |
| \`npm run dev:admin\` | Start admin only |
| \`npm run build\` | Build for production |

## Features

### Public Website
- Dynamic menu from API (with fallback)
- Online reservations
- Real-time updates via SSE

### Admin Dashboard
- AI chat agents for natural language management
- Visual menu editor with drag-and-drop
- Reservation calendar with confirm/cancel
- Notification center

### Real-Time Sync
Changes in admin dashboard instantly appear on the public website:
1. Admin updates menu item price
2. Backend broadcasts via Server-Sent Events
3. Frontend receives update, re-renders
4. Customer sees new price immediately

## Demo Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@demo.com | admin123 | Admin |
| demo@demo.com | admin123 | User |

## API Endpoints

### Public API
- \`GET /api/menu\` - Get full menu with categories
- \`POST /api/reservations\` - Create reservation
- \`GET /api/reservations/availability?date=YYYY-MM-DD\` - Check availability
- \`GET /api/reservations/:code\` - Lookup reservation by reference code

### Admin API (Menu)
- \`GET /api/menu/admin\` - List all menu items with categories
- \`POST /api/menu/admin/category\` - Create menu category
- \`POST /api/menu/admin/item\` - Create menu item
- \`PUT /api/menu/admin/item/:id\` - Update menu item
- \`PATCH /api/menu/admin/item/:id/availability\` - Toggle item availability
- \`DELETE /api/menu/admin/item/:id\` - Delete menu item

### Admin API (Reservations)
- \`GET /api/reservations/admin/all\` - List all reservations with filters
- \`GET /api/reservations/admin/today\` - Today's reservations
- \`GET /api/reservations/admin/stats\` - Reservation statistics
- \`PUT /api/reservations/admin/:id/confirm\` - Confirm reservation
- \`PUT /api/reservations/admin/:id/cancel\` - Cancel reservation

### Real-Time Events (SSE)
- \`GET /api/menu/events\` - Menu update stream
- \`GET /api/reservations/events\` - Reservation notifications

---

Generated with Launchpad Engine
`;
}

// ============================================

module.exports = {
  detectFromInput,
  buildBusinessData,
  generateSite,
  countProjectMetrics,
  loadFixture,
  GENERATION_MODES,
  INDUSTRY_PAGES,
  INDUSTRY_KEYWORDS,
  generateUseMenuHook,
  generateUseReservationsHook
};
