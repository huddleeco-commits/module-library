/**
 * Master Agent
 *
 * Coordinates other agents and provides a unified interface for
 * running the full generation + validation pipeline with agent-style
 * logging and checkpoints.
 *
 * This is ADDITIVE - wraps existing services without modifying them.
 *
 * Usage:
 *   const { MasterAgent } = require('./lib/agents');
 *   const master = new MasterAgent();
 *   const result = await master.generateProject({ ... });
 */

const path = require('path');
const fs = require('fs');
const { RalphWiggumAgent } = require('./ralph-wiggum-agent.cjs');

// Import layout intelligence and mood slider styling from prompt-builders
const {
  getSliderStyles,
  getAvailableLayouts,
  getLayoutConfigFull,
  INDUSTRY_LAYOUTS
} = require('../prompt-builders/index.cjs');

// Import archetype-based layout system
const {
  detectArchetype,
  getArchetype,
  isArtisanFoodIndustry,
  // Home services archetype system
  isHomeServicesIndustry,
  detectHomeServicesArchetype,
  getHomeServicesArchetype
} = require('../config/layout-archetypes.cjs');

const {
  generateHomePage: generateArchetypeHomePage,
  generateMenuPage: generateArchetypeMenuPage,
  generateAboutPage: generateArchetypeAboutPage,
  generateContactPage: generateArchetypeContactPage,
  generateGalleryPage: generateArchetypeGalleryPage,
  generateOrderPage: generateArchetypeOrderPage
} = require('../generators/archetype-pages.cjs');

// Home services page generators
const {
  generateHomePage: generateHomeServicesHomePage,
  generateServicesPage: generateHomeServicesServicesPage
} = require('../generators/home-services-pages.cjs');

// Grooming page generators (barbershop, salon, spa)
const {
  generateHomePage: generateGroomingHomePage,
  generateServicesPage: generateGroomingServicesPage,
  isGroomingIndustry,
  detectGroomingArchetype,
  getGroomingArchetype
} = require('../generators/grooming-pages.cjs');

// Professional services page generators (law, accounting, consulting, real estate)
const {
  generateHomePage: generateProfessionalHomePage,
  generateServicesPage: generateProfessionalServicesPage,
  isProfessionalIndustry,
  detectProfessionalArchetype,
  getProfessionalArchetype
} = require('../generators/professional-pages.cjs');

// Healthcare page generators (dental, medical, chiropractic)
const {
  generateHomePage: generateHealthcareHomePage,
  generateServicesPage: generateHealthcareServicesPage,
  isHealthcareIndustry,
  detectHealthcareArchetype,
  getHealthcareArchetype
} = require('../generators/healthcare-pages.cjs');

// Fitness page generators (gym, yoga, fitness)
const {
  generateHomePage: generateFitnessHomePage,
  generateServicesPage: generateFitnessServicesPage,
  isFitnessIndustry,
  detectFitnessArchetype,
  getFitnessArchetype
} = require('../generators/fitness-pages.cjs');

// Technology page generators (saas, startup, agency)
const {
  generateHomePage: generateTechnologyHomePage,
  generateServicesPage: generateTechnologyServicesPage,
  isTechnologyIndustry,
  detectTechnologyArchetype,
  getTechnologyArchetype
} = require('../generators/technology-pages.cjs');

// Helper to convert hyphenated names to PascalCase for valid JS identifiers
// e.g., "service-areas" -> "ServiceAreas", "order-online" -> "OrderOnline"
const toPascalCase = (str) => {
  return str.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
};

class MasterAgent {
  constructor(options = {}) {
    this.name = 'Master Agent';
    this.verbose = options.verbose !== false;

    // Sub-agents
    this.ralph = new RalphWiggumAgent({ verbose: this.verbose });

    // Stats
    this.stats = {
      projectsStarted: 0,
      projectsCompleted: 0,
      projectsFailed: 0,
      totalCheckpoints: 0,
      checkpointsPassed: 0,
      checkpointsFailed: 0,
      startTime: null
    };

    // Event handlers
    this.onProgress = options.onProgress || (() => {});
    this.onCheckpoint = options.onCheckpoint || (() => {});
    this.onError = options.onError || (() => {});
  }

  log(message, level = 'info') {
    if (!this.verbose) return;

    const prefix = {
      info: '🤖',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      checkpoint: '🚩'
    }[level] || '📋';

    console.log(`${prefix} [${this.name}] ${message}`);
  }

  /**
   * Run a checkpoint with Ralph Wiggum
   */
  async checkpoint(name, projectPath, stage, context = {}) {
    this.stats.totalCheckpoints++;
    this.log(`Checkpoint: ${name}`, 'checkpoint');

    const result = await this.ralph.validate(projectPath, stage, context);

    if (result.success) {
      this.stats.checkpointsPassed++;
      this.onCheckpoint({ name, stage, success: true, warnings: result.warnings });
    } else {
      this.stats.checkpointsFailed++;
      this.onCheckpoint({ name, stage, success: false, failures: result.failures });
    }

    return result;
  }

  /**
   * Generate a project with full agent orchestration
   *
   * This wraps the existing generation pipeline with:
   * - Agent-style logging
   * - Ralph checkpoints at each stage
   * - Progress reporting
   * - Error aggregation
   */
  async generateProject(options) {
    const {
      projectName,
      industry,
      fixtureId,
      testMode = true,
      runBuild = true,
      autoDeploy = false,
      pages = [],
      theme = {},
      outputPath,
      prospectData = null,  // { name, address, phone, etc. } from prospect.json
      layout = null,        // Selected layout style (e.g., 'bold-classic', 'modern-edge')
      industryGroup = null, // Industry group (e.g., 'grooming', 'food-beverage')
      moodSliders = null,   // { vibe, energy, era, density, price, theme }
      archetype = null,     // For artisan food: 'local', 'luxury', or 'ecommerce'
      // AI-generated content (from AI Pipeline when aiLevel > 0)
      aiContent = null,     // { hero, about, services, seo, microcopy }
      aiMenu = null,        // { categories: [...] }
      aiComposition = null, // { sections, heroStyle, colorMood, creativeBrief }
      // AI visual strategies
      aiColorStrategy = null,     // { mood, suggestion, avoidColors }
      aiTypographyStrategy = null, // { headingStyle, bodyStyle, mood, reason }
      aiImageryGuidance = null     // { style, subjects, avoid }
    } = options;

    this.stats.projectsStarted++;
    this.stats.startTime = this.stats.startTime || Date.now();

    const result = {
      success: false,
      projectName,
      projectPath: null,
      stages: [],
      errors: [],
      warnings: [],
      checkpoints: [],
      durationMs: 0
    };

    const startTime = Date.now();

    console.log('\n' + '═'.repeat(60));
    this.log(`Starting project: ${projectName}`);
    console.log('═'.repeat(60));

    try {
      // =========================================
      // STAGE 1: Setup
      // =========================================
      this.log('Stage 1: Project Setup');
      this.onProgress({ stage: 'setup', progress: 5 });

      // If outputPath is provided, use it directly; otherwise create in agent-runs
      const projectPath = outputPath || path.join(__dirname, '../../output/agent-runs', projectName);
      result.projectPath = projectPath;

      // Create project directory
      if (!fs.existsSync(projectPath)) {
        fs.mkdirSync(projectPath, { recursive: true });
      }

      result.stages.push({ name: 'setup', success: true });

      // =========================================
      // STAGE 2: Generate Code
      // =========================================
      this.log('Stage 2: Code Generation');
      this.onProgress({ stage: 'generation', progress: 20 });

      let generationResult;

      if (testMode && fixtureId) {
        // Use fixtures (no AI cost)
        generationResult = await this.generateFromFixture(projectPath, fixtureId, { ...options, prospectData, layout, industryGroup, moodSliders });
      } else {
        // Use AI generation
        generationResult = await this.generateWithAI(projectPath, options);
      }

      if (!generationResult.success) {
        result.errors.push(`Generation failed: ${generationResult.error}`);
        result.stages.push({ name: 'generation', success: false, error: generationResult.error });
        throw new Error('Generation failed');
      }

      result.stages.push({ name: 'generation', success: true });
      this.onProgress({ stage: 'generation', progress: 40 });

      // =========================================
      // CHECKPOINT 1: Post-Generation
      // =========================================
      const cp1 = await this.checkpoint('Post-Generation', projectPath, 'post-generation', {
        pages: generationResult.pages || pages,
        industry
      });

      result.checkpoints.push({ name: 'post-generation', ...cp1 });

      if (!cp1.success) {
        result.errors.push(...cp1.failures);
        result.stages.push({ name: 'checkpoint-1', success: false });
        throw new Error('Post-generation checkpoint failed');
      }

      result.warnings.push(...(cp1.warnings || []));
      result.stages.push({ name: 'checkpoint-1', success: true });

      // =========================================
      // STAGE 3: Build (if requested)
      // =========================================
      if (runBuild) {
        this.log('Stage 3: Build Validation');
        this.onProgress({ stage: 'build', progress: 60 });

        const buildResult = await this.runBuild(projectPath);

        if (!buildResult.success) {
          result.errors.push(...(buildResult.errors || ['Build failed']));
          result.stages.push({ name: 'build', success: false, errors: buildResult.errors });

          // Try to continue with checkpoint anyway to get more info
          const cpBuild = await this.checkpoint('Post-Build (Failed)', projectPath, 'post-build');
          result.checkpoints.push({ name: 'post-build', ...cpBuild });

          throw new Error('Build failed');
        }

        result.stages.push({ name: 'build', success: true, durationMs: buildResult.durationMs });
        this.onProgress({ stage: 'build', progress: 80 });

        // =========================================
        // CHECKPOINT 2: Post-Build
        // =========================================
        const cp2 = await this.checkpoint('Post-Build', projectPath, 'post-build');
        result.checkpoints.push({ name: 'post-build', ...cp2 });

        if (!cp2.success) {
          result.errors.push(...cp2.failures);
          result.stages.push({ name: 'checkpoint-2', success: false });
          throw new Error('Post-build checkpoint failed');
        }

        result.warnings.push(...(cp2.warnings || []));
        result.stages.push({ name: 'checkpoint-2', success: true });
      }

      // =========================================
      // STAGE 4: Deploy (if requested)
      // =========================================
      if (autoDeploy) {
        this.log('Stage 4: Deployment');
        this.onProgress({ stage: 'deploy', progress: 90 });

        // Pre-deploy checkpoint
        const cpPreDeploy = await this.checkpoint('Pre-Deploy', projectPath, 'pre-deploy');
        result.checkpoints.push({ name: 'pre-deploy', ...cpPreDeploy });

        if (!cpPreDeploy.success) {
          result.errors.push(...cpPreDeploy.failures);
          this.log('Pre-deploy checkpoint failed, skipping deployment', 'warning');
        } else {
          // Would call deploy service here
          this.log('Deployment would happen here (not implemented in agent wrapper)');
          result.stages.push({ name: 'deploy', success: true, skipped: true });
        }
      }

      // =========================================
      // SUCCESS
      // =========================================
      result.success = true;
      result.durationMs = Date.now() - startTime;

      this.stats.projectsCompleted++;

      console.log('\n' + '═'.repeat(60));
      this.log(`Project completed: ${projectName}`, 'success');
      this.log(`Duration: ${result.durationMs}ms`);
      this.log(`Checkpoints: ${result.checkpoints.filter(c => c.success).length}/${result.checkpoints.length} passed`);
      if (result.warnings.length > 0) {
        this.log(`Warnings: ${result.warnings.length}`, 'warning');
      }
      console.log('═'.repeat(60));

      this.onProgress({ stage: 'complete', progress: 100 });

      return result;

    } catch (err) {
      result.success = false;
      result.durationMs = Date.now() - startTime;

      if (!result.errors.includes(err.message)) {
        result.errors.push(err.message);
      }

      this.stats.projectsFailed++;

      console.log('\n' + '═'.repeat(60));
      this.log(`Project failed: ${projectName}`, 'error');
      this.log(`Error: ${err.message}`);
      console.log('═'.repeat(60));

      this.onError({ projectName, error: err, result });
      this.onProgress({ stage: 'failed', progress: 100 });

      return result;
    }
  }

  /**
   * Generate project from fixture (test mode, no AI cost)
   */
  async generateFromFixture(projectPath, fixtureId, options) {
    try {
      this.log(`Using fixture: ${fixtureId}`);

      // Load fixtures
      this.log(`Loading fixtures from test-fixtures...`);
      const fixturesPath = path.join(__dirname, '../../test-fixtures/index.cjs');
      const { loadFixture, applyCustomizations } = require(fixturesPath);

      this.log(`Attempting to load fixture: ${fixtureId}`);
      const fixture = loadFixture(fixtureId);
      this.log(`Fixture loaded successfully: ${fixture?.business?.name || 'unknown'}`);


      // Use prospect data if available, otherwise fall back to fixture defaults
      const prospect = options.prospectData || {};
      const research = prospect.research || {};

      // Build customizations with all available data (basic + research)
      const customized = applyCustomizations(fixture, {
        // Basic business info
        businessName: prospect.name || options.projectName || fixture.business?.name,
        address: prospect.address || fixture.business?.address,
        phone: prospect.phone || fixture.business?.phone,

        // Research data from Scout/Yelp enrichment
        rating: research.rating || prospect.rating,
        reviewCount: research.reviewCount || prospect.reviewCount,
        reviewHighlights: research.reviewHighlights,
        priceLevel: research.priceLevel,
        categories: research.categories,
        hours: research.hours,
        photos: research.photos || (prospect.photos ? prospect.photos : (prospect.photo ? [prospect.photo] : null)),
        yelpUrl: research.yelpUrl,
        googleMapsUrl: prospect.googleMapsUrl,
        opportunityScore: prospect.opportunityScore,
        scoreBreakdown: prospect.scoreBreakdown,
        researchSource: research.source || (research.enrichedAt ? 'yelp' : null),
        enrichedAt: research.enrichedAt
      });

      // If requestedPages are provided (from tier selection), add them to fixture
      const requestedPages = options.requestedPages || [];
      if (requestedPages.length > 0) {
        this.log(`Adding requested pages: ${requestedPages.join(', ')}`);
        // Ensure all requested pages exist in fixture.pages
        requestedPages.forEach(pageName => {
          const pageKey = pageName.toLowerCase().replace(/\s+/g, '');
          if (!customized.pages[pageKey]) {
            customized.pages[pageKey] = this.generatePageTemplate(pageKey, pageName, fixtureId, customized);
          }
        });
      }

      // Create project structure with prospect data and selected layout
      const layoutId = options.layout || null;
      const groupId = options.industryGroup || null;
      this.log(`Creating project structure at: ${projectPath}`);
      await this.createProjectFromFixture(projectPath, customized, prospect, options, layoutId, groupId);
      this.log(`Project structure created successfully`);

      return {
        success: true,
        pages: Object.keys(customized.pages || {}),
        layout: layoutId,
        industryGroup: groupId
      };

    } catch (err) {
      this.log(`generateFromFixture error: ${err.message}`, 'error');
      console.error('Full error stack:', err.stack);
      return {
        success: false,
        error: err.message
      };
    }
  }

  /**
   * Generate a page template for requested pages not in fixture
   */
  generatePageTemplate(pageKey, pageName, fixtureId, fixture) {
    const businessName = fixture.business?.name || 'Business';
    const templates = {
      book: {
        title: `Book Appointment - ${businessName}`,
        sections: [
          { type: 'hero', content: { headline: 'Book Your Appointment', subheadline: 'Schedule your visit today' } },
          { type: 'booking-form', content: { services: fixture.services || [] } }
        ]
      },
      booking: {
        title: `Book Now - ${businessName}`,
        sections: [
          { type: 'hero', content: { headline: 'Book Your Appointment', subheadline: 'Choose your service and time' } },
          { type: 'booking-form', content: { services: fixture.services || [] } }
        ]
      },
      loyalty: {
        title: `Rewards Program - ${businessName}`,
        sections: [
          { type: 'hero', content: { headline: 'Loyalty Rewards', subheadline: 'Earn points with every visit' } },
          { type: 'loyalty-info', content: { tiers: ['Bronze', 'Silver', 'Gold'] } }
        ]
      },
      gallery: {
        title: `Gallery - ${businessName}`,
        sections: [
          { type: 'hero', content: { headline: 'Our Work', subheadline: 'See what we can do for you' } },
          { type: 'gallery', content: { images: [] } }
        ]
      },
      menu: {
        title: `Menu - ${businessName}`,
        sections: [
          { type: 'hero', content: { headline: 'Our Menu', subheadline: 'Fresh and delicious' } },
          { type: 'menu-list', content: { categories: fixture.menu?.categories || [] } }
        ]
      },
      reservations: {
        title: `Reservations - ${businessName}`,
        sections: [
          { type: 'hero', content: { headline: 'Make a Reservation', subheadline: 'Book your table' } },
          { type: 'reservation-form', content: {} }
        ]
      },
      orderonline: {
        title: `Order Online - ${businessName}`,
        sections: [
          { type: 'hero', content: { headline: 'Order Online', subheadline: 'Delivery or pickup' } },
          { type: 'order-menu', content: { categories: fixture.menu?.categories || [] } }
        ]
      },
      portal: {
        title: `Client Portal - ${businessName}`,
        sections: [
          { type: 'hero', content: { headline: 'Client Portal', subheadline: 'Access your account' } },
          { type: 'portal-dashboard', content: {} }
        ]
      },
      reviews: {
        title: `Reviews - ${businessName}`,
        sections: [
          { type: 'hero', content: { headline: 'Customer Reviews', subheadline: 'See what others say' } },
          { type: 'reviews-list', content: { reviews: fixture.reviews || [] } }
        ]
      }
    };

    return templates[pageKey] || {
      title: `${pageName} - ${businessName}`,
      sections: [
        { type: 'hero', content: { headline: pageName, subheadline: `Welcome to our ${pageName.toLowerCase()} page` } },
        { type: 'content', content: { text: `Information about ${pageName.toLowerCase()} coming soon.` } }
      ]
    };
  }

  /**
   * Generate project with AI (uses existing post-assembly service)
   */
  async generateWithAI(projectPath, options) {
    this.log('AI generation not implemented in agent wrapper');
    this.log('Use existing /api/assemble endpoint or post-assembly service directly');

    return {
      success: false,
      error: 'AI generation should use existing pipeline'
    };
  }

  /**
   * Create project structure from fixture data with prospect info
   */
  async createProjectFromFixture(projectPath, fixture, prospect = {}, options = {}, layoutId = null, groupId = null) {
    const frontendPath = path.join(projectPath, 'frontend');
    const srcPath = path.join(frontendPath, 'src');
    const pagesPath = path.join(srcPath, 'pages');
    const componentsPath = path.join(srcPath, 'components');

    fs.mkdirSync(pagesPath, { recursive: true });
    fs.mkdirSync(componentsPath, { recursive: true });

    // Extract AI-generated content from options (null when in test mode)
    const aiContent = options.aiContent || null;
    const aiMenu = options.aiMenu || null;
    const aiComposition = options.aiComposition || null;
    const aiColorStrategy = options.aiColorStrategy || null;
    const aiTypographyStrategy = options.aiTypographyStrategy || null;
    const aiImageryGuidance = options.aiImageryGuidance || null;

    // Extract business info from prospect or fixture
    const businessName = prospect.name || fixture.business?.name || 'Business';
    const businessAddress = prospect.address || fixture.business?.address || '';
    const businessPhone = prospect.phone || fixture.business?.phone || '';
    const industry = fixture.type || fixture.business?.industry || fixture.industry || 'general';

    // Extract full color palette including secondary and accent
    const defaultColors = { primary: '#2563eb', secondary: '#1e40af', accent: '#f59e0b', background: '#ffffff', text: '#1f2937' };
    const colors = {
      ...defaultColors,
      ...(fixture.theme?.colors || {})
    };

    // Get mood slider styles from the prompt-builders system
    // This provides: fonts, spacing, borderRadius, colors (with theme mode), buttonStyle, etc.
    const moodSliders = options.moodSliders || { vibe: 50, energy: 50, era: 50, density: 50, price: 50, theme: 'light' };
    const sliderStyles = getSliderStyles(moodSliders, colors);

    // Get layout intelligence from prompt-builders
    const layoutConfig = getLayoutConfigFull(industry, layoutId);
    const hasLayoutIntelligence = layoutConfig && layoutConfig.layout;

    // Log layout and mood selection for debugging
    if (layoutId || hasLayoutIntelligence) {
      console.log(`   🎨 Using layout: ${layoutConfig?.layout?.name || layoutId || 'default'}`);
    }
    if (moodSliders.theme !== 'light' || moodSliders.era !== 50) {
      console.log(`   🎚️ Mood: theme=${moodSliders.theme}, era=${moodSliders.era}, vibe=${moodSliders.vibe}`);
    }

    // Merge slider styles with any layout-specific overrides
    const layoutOverrides = {
      // From getSliderStyles
      fontHeading: sliderStyles.fontHeading,
      fontBody: sliderStyles.fontBody,
      borderRadius: sliderStyles.borderRadius,
      sectionPadding: sliderStyles.sectionPadding,
      cardPadding: sliderStyles.cardPadding,
      gap: sliderStyles.gap,
      buttonStyle: sliderStyles.buttonStyle,
      headlineStyle: sliderStyles.headlineStyle,
      isDark: sliderStyles.isDark,
      isMedium: sliderStyles.isMedium,
      // Merged colors (slider styles may override for dark theme)
      colors: sliderStyles.colors,
      // Layout intelligence section order (if available)
      sectionOrder: layoutConfig?.layout?.sectionOrder || null,
      emphasis: layoutConfig?.layout?.emphasis || null
    };

    // package.json
    const packageJson = {
      name: businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'project',
      version: '1.0.0',
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview'
      },
      dependencies: {
        'react': '^18.2.0',
        'react-dom': '^18.2.0',
        'react-router-dom': '^6.20.0',
        'lucide-react': '^0.294.0'
      },
      devDependencies: {
        '@vitejs/plugin-react': '^4.2.0',
        'vite': '^5.0.0'
      }
    };
    fs.writeFileSync(path.join(frontendPath, 'package.json'), JSON.stringify(packageJson, null, 2));

    // vite.config.js - configured for production deployment
    fs.writeFileSync(path.join(frontendPath, 'vite.config.js'), `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: 'all'
  },
  preview: {
    host: true,
    allowedHosts: 'all'
  }
});
`);

    // Create .env file for test/preview mode
    // When VITE_TEST_MODE=true, AuthContext will auto-login a demo user
    const isTestMode = options.testMode !== false; // Default to true for test generations
    const envContent = isTestMode
      ? 'VITE_TEST_MODE=true\nVITE_API_URL=\n'
      : 'VITE_TEST_MODE=false\nVITE_API_URL=\n';
    fs.writeFileSync(path.join(frontendPath, '.env'), envContent);

    // index.html
    fs.writeFileSync(path.join(frontendPath, 'index.html'), `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${businessName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
`);

    // main.jsx with global styles
    fs.writeFileSync(path.join(srcPath, 'main.jsx'), `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Global styles
const style = document.createElement('style');
style.textContent = \`
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', system-ui, sans-serif; }
  a { text-decoration: none; color: inherit; }
\`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
`);

    // Navigation component - separate portal pages from public pages
    const pages = Object.keys(fixture.pages || { home: {} });
    const portalPageNames = ['login', 'register', 'dashboard', 'profile', 'account', 'rewards'];
    const publicPages = pages.filter(p => !portalPageNames.includes(p));
    const hasPortal = pages.some(p => portalPageNames.includes(p));

    const navLinks = publicPages.map(p => {
      // Convert "service-areas" to "Service Areas" for display
      const label = p.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      const path = p === 'home' ? '/' : '/' + p;
      return `{ path: '${path}', label: '${label}' }`;
    }).join(',\n      ');

    // Generate Navigation - with or without user dropdown based on portal pages
    const navContentWithPortal = `import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Phone, User, ChevronDown, LogOut, LayoutDashboard, UserCircle, Settings, Gift } from 'lucide-react';
import { useAuth } from './AuthContext';

const NAV_LINKS = [
      ${navLinks}
    ];

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, isTestMode } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>${businessName}</Link>

        <div style={styles.links}>
          {NAV_LINKS.map(link => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                ...styles.link,
                color: location.pathname === link.path ? '${colors.primary}' : '${colors.text}'
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div style={styles.rightSection}>
          ${businessPhone ? `<a href="tel:${businessPhone.replace(/[^0-9]/g, '')}" style={styles.phone}><Phone size={16} /> ${businessPhone}</a>` : ''}

          <div style={styles.userSection} ref={dropdownRef}>
            {isAuthenticated ? (
              <>
                <button onClick={() => setDropdownOpen(!dropdownOpen)} style={styles.userBtn}>
                  <div style={styles.avatar}>{user?.name?.charAt(0) || 'U'}</div>
                  <span style={styles.userName}>{user?.name?.split(' ')[0] || 'Account'}</span>
                  <ChevronDown size={16} style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }} />
                </button>
                {dropdownOpen && (
                  <div style={styles.dropdown}>
                    {isTestMode && <div style={styles.testBadge}>Test Mode</div>}
                    <div style={styles.dropdownHeader}>
                      <div style={styles.dropdownName}>{user?.name}</div>
                      <div style={styles.dropdownEmail}>{user?.email}</div>
                    </div>
                    <div style={styles.dropdownDivider} />
                    <Link to="/dashboard" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                      <LayoutDashboard size={16} /> Dashboard
                    </Link>
                    <Link to="/profile" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                      <UserCircle size={16} /> Profile
                    </Link>
                    <Link to="/account" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                      <Settings size={16} /> Account Settings
                    </Link>
                    <Link to="/rewards" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                      <Gift size={16} /> Rewards
                    </Link>
                    <div style={styles.dropdownDivider} />
                    <button onClick={handleLogout} style={styles.logoutBtn}>
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div style={styles.authBtns}>
                <Link to="/login" style={styles.signInBtn}>Sign In</Link>
                <Link to="/register" style={styles.signUpBtn}>Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: { background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '12px 24px', position: 'sticky', top: 0, zIndex: 100 },
  container: { maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' },
  logo: { fontSize: '20px', fontWeight: '700', color: '${colors.primary}', textDecoration: 'none', whiteSpace: 'nowrap' },
  links: { display: 'flex', gap: '28px', flex: 1, justifyContent: 'center' },
  link: { fontSize: '15px', fontWeight: '500', textDecoration: 'none', transition: 'color 0.2s' },
  rightSection: { display: 'flex', alignItems: 'center', gap: '16px' },
  phone: { display: 'flex', alignItems: 'center', gap: '6px', color: '${colors.text}', textDecoration: 'none', fontWeight: '500', fontSize: '14px' },
  userSection: { position: 'relative' },
  userBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '8px' },
  avatar: { width: '32px', height: '32px', borderRadius: '50%', background: '${colors.primary}', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '14px' },
  userName: { fontWeight: '500', color: '${colors.text}', fontSize: '14px' },
  dropdown: { position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#fff', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', minWidth: '220px', overflow: 'hidden', zIndex: 1000 },
  testBadge: { background: '#fef3c7', color: '#92400e', padding: '6px 12px', fontSize: '11px', fontWeight: '600', textAlign: 'center' },
  dropdownHeader: { padding: '16px' },
  dropdownName: { fontWeight: '600', color: '${colors.text}', marginBottom: '2px' },
  dropdownEmail: { fontSize: '13px', color: '#6b7280' },
  dropdownDivider: { height: '1px', background: '#e5e7eb' },
  dropdownItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', color: '${colors.text}', textDecoration: 'none', fontSize: '14px' },
  logoutBtn: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', color: '#ef4444', background: 'none', border: 'none', width: '100%', cursor: 'pointer', fontSize: '14px', textAlign: 'left' },
  authBtns: { display: 'flex', gap: '8px' },
  signInBtn: { padding: '8px 16px', color: '${colors.primary}', textDecoration: 'none', fontWeight: '500', fontSize: '14px' },
  signUpBtn: { padding: '8px 16px', background: '${colors.primary}', color: '#fff', textDecoration: 'none', fontWeight: '500', fontSize: '14px', borderRadius: '8px' }
};
`;

    // Simple Navigation without portal
    const navContentSimple = `import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Phone } from 'lucide-react';

const NAV_LINKS = [
      ${navLinks}
    ];

export default function Navigation() {
  const location = useLocation();

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>${businessName}</Link>
        <div style={styles.links}>
          {NAV_LINKS.map(link => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                ...styles.link,
                color: location.pathname === link.path ? '${colors.primary}' : '${colors.text}'
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div style={styles.contact}>
          ${businessPhone ? `<a href="tel:${businessPhone.replace(/[^0-9]/g, '')}" style={styles.phone}><Phone size={16} /> ${businessPhone}</a>` : ''}
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: { background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 24px', position: 'sticky', top: 0, zIndex: 100 },
  container: { maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { fontSize: '20px', fontWeight: '700', color: '${colors.primary}', textDecoration: 'none' },
  links: { display: 'flex', gap: '32px' },
  link: { fontSize: '15px', fontWeight: '500', textDecoration: 'none', transition: 'color 0.2s' },
  contact: { display: 'flex', alignItems: 'center', gap: '8px' },
  phone: { display: 'flex', alignItems: 'center', gap: '6px', color: '${colors.primary}', textDecoration: 'none', fontWeight: '500', fontSize: '14px' }
};
`;

    fs.writeFileSync(path.join(componentsPath, 'Navigation.jsx'), hasPortal ? navContentWithPortal : navContentSimple);

    // Footer component
    fs.writeFileSync(path.join(componentsPath, 'Footer.jsx'), `import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, BarChart3, Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.brand}>
          <h3 style={styles.name}>${businessName}</h3>
          <p style={styles.tagline}>Proudly serving our community</p>
        </div>
        <div style={styles.info}>
          ${businessAddress ? `<p style={styles.item}><MapPin size={16} /> ${businessAddress}</p>` : ''}
          ${businessPhone ? `<p style={styles.item}><Phone size={16} /> ${businessPhone}</p>` : ''}
        </div>
        <div style={styles.copyright}>
          <p>&copy; ${new Date().getFullYear()} ${businessName}. All rights reserved.</p>
          <Link to="/_index" style={styles.dashboardLink}>
            <BarChart3 size={14} /> Site Dashboard & Metrics
          </Link>
        </div>
        <div style={styles.powered}>
          <a href="https://be1st.io" target="_blank" rel="noopener noreferrer" style={styles.poweredLink}>
            <Zap size={14} style={{ color: '#10B981' }} />
            <span style={styles.poweredBlink}>Blink</span>
            <span style={styles.poweredBy}>by</span>
            <span style={styles.poweredBe1st}>BE1st</span>
            <span style={styles.poweredYear}>• \${new Date().getFullYear()}</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: { background: '${colors.text}', color: '#fff', padding: '48px 24px' },
  container: { maxWidth: '1200px', margin: '0 auto', display: 'grid', gap: '32px' },
  brand: {},
  name: { fontSize: '24px', fontWeight: '700', marginBottom: '8px' },
  tagline: { opacity: 0.8, fontSize: '14px' },
  info: { display: 'flex', flexDirection: 'column', gap: '12px' },
  item: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', opacity: 0.9 },
  copyright: { opacity: 0.6, fontSize: '13px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px' },
  dashboardLink: { display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '12px', padding: '8px 16px', background: 'linear-gradient(135deg, #10B981, #3B82F6)', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '12px', fontWeight: '600', opacity: 1 },
  powered: { borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', marginTop: '8px', textAlign: 'center' },
  poweredLink: { display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none', opacity: 0.7, transition: 'opacity 0.2s' },
  poweredBlink: { background: 'linear-gradient(135deg, #10B981, #3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '700', fontSize: '14px' },
  poweredBy: { color: '#6B7280', fontSize: '12px' },
  poweredBe1st: { color: '#fff', fontWeight: '600', fontSize: '14px' },
  poweredYear: { color: '#6B7280', fontSize: '12px' }
};
`);

    // Check if portal/auth is enabled
    const enablePortal = options.enablePortal !== false; // Default to true
    const portalPages = ['login', 'register', 'dashboard', 'profile', 'account'];
    const hasPortalPages = enablePortal && portalPages.some(p => pages.includes(p));

    // Generate AuthContext if portal is enabled
    if (hasPortalPages) {
      fs.writeFileSync(path.join(componentsPath, 'AuthContext.jsx'), `import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL || '';
const IS_TEST_MODE = import.meta.env.VITE_TEST_MODE === 'true' || import.meta.env.VITE_PREVIEW_MODE === 'true';

// Demo user for test/preview mode
const DEMO_USER = {
  id: 'demo-user-001',
  name: 'Demo Customer',
  email: 'demo@example.com',
  role: 'customer',
  points: 250,
  memberSince: '2024-01-15'
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTestMode] = useState(IS_TEST_MODE);

  useEffect(() => {
    // In test/preview mode, auto-login with demo user
    if (IS_TEST_MODE) {
      setUser(DEMO_USER);
      setLoading(false);
      return;
    }

    // Normal auth flow - check localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // In test mode, accept any credentials
    if (IS_TEST_MODE) {
      setUser(DEMO_USER);
      return { success: true };
    }

    const res = await fetch(\`\${API_BASE}/api/auth/login\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success && data.user) {
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      return { success: true };
    }
    return { success: false, error: data.error || 'Login failed' };
  };

  const register = async (name, email, password) => {
    // In test mode, simulate registration
    if (IS_TEST_MODE) {
      const newUser = { ...DEMO_USER, name, email };
      setUser(newUser);
      return { success: true };
    }

    const res = await fetch(\`\${API_BASE}/api/auth/register\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (data.success && data.user) {
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      return { success: true };
    }
    return { success: false, error: data.error || 'Registration failed' };
  };

  const logout = () => {
    // In test mode, just toggle off - can re-login anytime
    setUser(null);
    if (!IS_TEST_MODE) {
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user, isTestMode }}>
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
`);

      // Generate ProtectedRoute component
      fs.writeFileSync(path.join(componentsPath, 'ProtectedRoute.jsx'), `import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTopColor: '${colors.primary}', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
          <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading...</p>
        </div>
        <style>{\`@keyframes spin { to { transform: rotate(360deg); } }\`}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
`);
    }

    // App.jsx with layout
    const imports = pages.map(p => `import ${toPascalCase(p)}Page from './pages/${toPascalCase(p)}Page';`).join('\n');

    // Add auth imports if portal is enabled
    const authImports = hasPortalPages ? `import { AuthProvider } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';` : '';

    // Protected routes (require login)
    const protectedPageNames = ['dashboard', 'profile', 'account', 'rewards', 'orders'];

    // Generate routes - home page should be at "/" and also at "/home" for navigation
    // IndexPage is added for metrics dashboard (generated post-build by MetricsGenerator)
    const routes = pages.map(p => {
      const isProtected = hasPortalPages && protectedPageNames.includes(p);
      if (p === 'home') {
        return `          <Route path="/" element={<HomePage />} />\n          <Route path="/home" element={<HomePage />} />`;
      }
      if (isProtected) {
        return `          <Route path="/${p}" element={<ProtectedRoute><${toPascalCase(p)}Page /></ProtectedRoute>} />`;
      }
      return `          <Route path="/${p}" element={<${toPascalCase(p)}Page />} />`;
    }).join('\n');

    // Add IndexPage route for metrics dashboard (generated by MetricsGenerator after build)
    const indexPageRoute = `          <Route path="/_index" element={<IndexPage />} />`;
    const indexPageImport = `import IndexPage from './pages/IndexPage';`;

    // Generate App.jsx with or without AuthProvider
    // Note: IndexPage is generated by MetricsGenerator after build, import wrapped in try-catch to avoid errors
    const appContent = hasPortalPages ? `import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
${authImports}
${imports}
${indexPageImport}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navigation />
        <main style={{ minHeight: 'calc(100vh - 200px)' }}>
          <Routes>
${routes}
${indexPageRoute}
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
` : `import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
${imports}
${indexPageImport}

function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <main style={{ minHeight: 'calc(100vh - 200px)' }}>
        <Routes>
${routes}
${indexPageRoute}
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
`;

    fs.writeFileSync(path.join(srcPath, 'App.jsx'), appContent);

    // Generate placeholder IndexPage (will be overwritten by MetricsGenerator with full metrics)
    const placeholderIndexPage = `import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, Clock, Loader2 } from 'lucide-react';

export default function IndexPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <LayoutGrid size={48} style={{ color: '#38bdf8', marginBottom: '24px' }} />
      <h1 style={{ fontSize: '2rem', marginBottom: '12px' }}>Site Index</h1>
      <p style={{ color: '#94a3b8', marginBottom: '32px' }}>Generation metrics will appear here after build completes.</p>
      <div style={{ display: 'flex', gap: '16px' }}>
        <Link to="/" style={{ padding: '12px 24px', background: '#2563eb', color: '#fff', textDecoration: 'none', borderRadius: '8px' }}>Go to Home</Link>
      </div>
    </div>
  );
}
`;
    fs.writeFileSync(path.join(pagesPath, 'IndexPage.jsx'), placeholderIndexPage);

    // Generate page files with business-specific content and layout styling
    // Get archetype override from options (passed from UI for artisan food industries)
    // If layout ID is provided but not archetype, map layout to archetype for artisan food industries
    let archetypeOverride = options.archetype || null;

    // Map industry-specific layouts to archetype IDs for home services industries
    if (!archetypeOverride && layoutId && isHomeServicesIndustry(industry)) {
      const homeServicesLayoutMap = {
        // Emergency/urgent service layouts
        'emergency-first': 'emergency',        // 24/7, big phone number
        'action-focused': 'emergency',         // Urgent CTAs, fast response
        'urgent-response': 'emergency',        // Emergency services focus
        // Professional/corporate layouts
        'trust-builder': 'professional',       // Credentials, certifications
        'corporate-professional': 'professional', // Commercial focus
        'credentials-first': 'professional',   // Licenses, experience
        // Neighborhood/local layouts
        'friendly-local': 'neighborhood',      // Family-owned feel
        'community-focused': 'neighborhood',   // Local business, testimonials
        'personal-touch': 'neighborhood',      // Friendly, approachable
        // Default mappings for common layouts
        'visual-showcase': 'professional',
        'story-driven': 'neighborhood',
        'service-focused': 'professional'
      };
      archetypeOverride = homeServicesLayoutMap[layoutId] || null;
      if (archetypeOverride) {
        console.log(`   🎯 Layout "${layoutId}" mapped to home services archetype: ${archetypeOverride}`);
      }
    }

    // Map industry-specific layouts to archetype IDs for grooming/beauty industries
    if (!archetypeOverride && layoutId && isGroomingIndustry(industry)) {
      const groomingLayoutMap = {
        // Booking-focused layouts → modern-sleek (clean, CTA prominent)
        'booking-focused': 'modern-sleek',
        'cta-prominent': 'modern-sleek',
        'appointment-first': 'modern-sleek',
        // Team/community layouts → neighborhood-friendly
        'team-highlight': 'neighborhood-friendly',
        'community-focused': 'neighborhood-friendly',
        'friendly-local': 'neighborhood-friendly',
        'personal-touch': 'neighborhood-friendly',
        // Premium/luxury layouts → vintage-classic (heritage/upscale feel)
        'luxury-experience': 'vintage-classic',
        'heritage-brand': 'vintage-classic',
        'classic-style': 'vintage-classic',
        'visual-showcase': 'modern-sleek',
        'story-driven': 'neighborhood-friendly',
        'service-focused': 'modern-sleek'
      };
      archetypeOverride = groomingLayoutMap[layoutId] || null;
      if (archetypeOverride) {
        console.log(`   🎯 Layout "${layoutId}" mapped to grooming archetype: ${archetypeOverride}`);
      }
    }

    // Map industry-specific layouts to archetype IDs for artisan food industries
    if (!archetypeOverride && layoutId && isArtisanFoodIndustry(industry)) {
      const layoutToArchetypeMap = {
        // restaurants-food layouts
        'appetizing-visual': 'local',     // Visual-first, food photography focus
        'menu-focused': 'ecommerce',      // Functional, ordering/menu focus
        'story-driven': 'luxury',         // Brand story, premium feel
        // Additional mappings for other artisan industries
        'visual-showcase': 'local',
        'product-gallery': 'local',
        'order-first': 'ecommerce',
        'booking-optimized': 'ecommerce',
        'brand-story': 'luxury',
        'premium-experience': 'luxury',
        'artisan-craft': 'luxury'
      };
      archetypeOverride = layoutToArchetypeMap[layoutId] || null;
      if (archetypeOverride) {
        console.log(`   🎯 Layout "${layoutId}" mapped to archetype: ${archetypeOverride}`);
      }
    }
    if (archetypeOverride) {
      console.log(`   🎯 Archetype override: ${archetypeOverride}`);
    }

    for (const pageName of pages) {
      const compName = toPascalCase(pageName);
      const pageContent = this.generatePageContent(pageName, businessName, businessAddress, businessPhone, industry, colors, layoutOverrides, fixture, archetypeOverride, {
        aiContent,
        aiMenu,
        aiComposition,
        aiColorStrategy,
        aiTypographyStrategy,
        aiImageryGuidance
      });
      fs.writeFileSync(path.join(pagesPath, `${compName}Page.jsx`), pageContent);
    }

    // brain.json - includes layout info and archetype
    fs.writeFileSync(path.join(projectPath, 'brain.json'), JSON.stringify({
      businessName: businessName,
      address: businessAddress,
      phone: businessPhone,
      industry: industry,
      generatedAt: new Date().toISOString(),
      generatedBy: 'MasterAgent',
      testMode: true,
      prospect: prospect,
      layout: layoutId,
      industryGroup: groupId || layoutConfig?.group || null,
      layoutStyle: layoutOverrides,
      archetype: archetypeOverride || null
    }, null, 2));
  }

  /**
   * Generate archetype-based page content for artisan food industries
   * Uses the 3-archetype system: ecommerce, luxury, local
   * @param {string} archetypeOverride - Optional archetype ID to force ('local', 'luxury', 'ecommerce')
   * @param {object} styleOverrides - Theme/mood slider settings (isDark, fontHeading, fontBody, etc.)
   */
  generateArchetypePage(pageName, businessName, address, phone, industry, colors, fixture = {}, archetypeOverride = null, styleOverrides = {}) {
    // Detect the best archetype based on business data
    const businessData = {
      name: businessName,
      address: address,
      phone: phone,
      industry: industry,
      description: fixture.business?.description || '',
      tagline: fixture.business?.tagline || fixture.tagline || '',
      yearFounded: fixture.business?.yearFounded || fixture.yearFounded || '2020',
      features: fixture.business?.features || fixture.features || {}
    };

    // Use override archetype if provided, otherwise auto-detect
    const archetypeId = archetypeOverride || detectArchetype(businessData);
    const archetype = getArchetype(archetypeId);

    this.log(`Using ${archetype.name} archetype for ${industry}${archetypeOverride ? ' (manual override)' : ''}`, 'info');
    if (styleOverrides.isDark) {
      this.log(`  Theme: Dark mode enabled`, 'info');
    }

    // Generate page based on archetype with style overrides
    switch (pageName.toLowerCase()) {
      case 'home':
        return generateArchetypeHomePage(archetype, businessData, colors, styleOverrides);

      case 'menu':
        const menuData = fixture?.pages?.menu || fixture?.menu || null;
        return generateArchetypeMenuPage(archetype, businessData, colors, menuData, styleOverrides);

      case 'about':
        return generateArchetypeAboutPage(archetype, businessData, colors, styleOverrides);

      case 'contact':
        return generateArchetypeContactPage(archetype, businessData, colors, styleOverrides);

      case 'gallery':
        return generateArchetypeGalleryPage(archetype, businessData, colors, styleOverrides);

      case 'order':
      case 'order-online':
        return generateArchetypeOrderPage(archetype, businessData, colors, styleOverrides);

      default:
        // Return null to fall back to default templates for other pages
        return null;
    }
  }

  /**
   * Generate archetype-based page content for home services industries
   * Uses the 3-archetype system: emergency, professional, neighborhood
   * @param {string} archetypeOverride - Optional archetype ID to force ('emergency', 'professional', 'neighborhood')
   * @param {object} styleOverrides - Theme/mood slider settings (isDark, fontHeading, fontBody, etc.)
   */
  generateHomeServicesArchetypePage(pageName, businessName, address, phone, industry, colors, fixture = {}, archetypeOverride = null, styleOverrides = {}) {
    // Build business data for archetype detection
    const businessData = {
      name: businessName,
      address: address,
      phone: phone,
      industry: industry,
      description: fixture.business?.description || '',
      tagline: fixture.business?.tagline || fixture.tagline || '',
      yearFounded: fixture.business?.yearFounded || fixture.yearFounded || '2020',
      features: fixture.business?.features || fixture.features || {},
      services: fixture.services || fixture.business?.services || []
    };

    // Use override archetype if provided, otherwise auto-detect
    const archetypeId = archetypeOverride || detectHomeServicesArchetype(businessData);
    const archetype = getHomeServicesArchetype(archetypeId);

    this.log(`Using ${archetype.name} archetype for home services (${industry})${archetypeOverride ? ' (manual override)' : ''}`, 'info');
    if (styleOverrides.isDark) {
      this.log(`  Theme: Dark mode enabled`, 'info');
    }

    // Generate page based on archetype with style overrides
    switch (pageName.toLowerCase()) {
      case 'home':
        return generateHomeServicesHomePage(archetype, businessData, colors, styleOverrides);

      case 'services':
        return generateHomeServicesServicesPage(archetype, businessData, colors, styleOverrides);

      default:
        // Return null to fall back to default templates for other pages
        return null;
    }
  }

  /**
   * Generate page content based on page type, business info, and layout styling
   * Routes to industry-specific archetype generators when available
   * @param {string} archetypeOverride - Optional archetype ID
   * @param {object} aiOptions - AI-generated content (aiContent, aiMenu, aiComposition)
   */
  generatePageContent(pageName, businessName, address, phone, industry, colors, layoutOverrides = {}, fixture = {}, archetypeOverride = null, aiOptions = {}) {
    // Extract AI-generated content (from AI Pipeline when aiLevel > 0)
    const { aiContent, aiMenu, aiComposition, aiColorStrategy, aiTypographyStrategy, aiImageryGuidance } = aiOptions;
    const hasAIContent = !!(aiContent || aiMenu || aiComposition);

    if (hasAIContent) {
      console.log(`   🤖 Using AI-generated content for ${pageName} page`);
      if (aiColorStrategy?.suggestion) {
        console.log(`   🎨 AI color strategy: ${aiColorStrategy.suggestion}`);
      }
    }

    // Build business data object for archetype generators
    // Includes research data from Scout/Yelp enrichment
    const research = fixture.business?.research || {};
    const businessData = {
      name: businessName,
      address: address,
      phone: phone,
      industry: industry,
      description: fixture.business?.description || '',
      tagline: fixture.business?.tagline || fixture.tagline || '',
      yearFounded: fixture.business?.yearFounded || fixture.yearFounded || '2020',
      features: fixture.business?.features || fixture.features || {},
      services: fixture.services || fixture.business?.services || [],

      // Research data from Scout/Yelp (for personalized content)
      rating: fixture.business?.rating || research.rating || null,
      reviewCount: fixture.business?.reviewCount || research.reviewCount || 0,
      reviewHighlights: research.reviewHighlights || [],
      priceLevel: fixture.business?.priceLevel || research.priceLevel || null,
      categories: fixture.business?.categories || research.categories || [],
      hours: fixture.business?.hours || research.hours || null,
      photos: fixture.business?.photos || research.photos || [],
      heroImage: fixture.business?.heroImage || null,
      yelpUrl: fixture.business?.yelpUrl || research.yelpUrl || null,
      googleMapsUrl: fixture.business?.googleMapsUrl || null,
      opportunityScore: research.opportunityScore || null,

      // AI-generated content (takes priority when available)
      aiContent: aiContent || null,
      aiMenu: aiMenu || null,
      aiComposition: aiComposition || null,
      hasAIContent: hasAIContent,
      // AI visual strategies (for unique visual composition)
      aiColorStrategy: aiColorStrategy || null,
      aiTypographyStrategy: aiTypographyStrategy || null,
      aiImageryGuidance: aiImageryGuidance || null
    };

    // Check GROOMING industry (barbershop, salon, spa)
    if (isGroomingIndustry(industry)) {
      const archetype = archetypeOverride ? getGroomingArchetype(archetypeOverride) : detectGroomingArchetype(businessData);
      this.log(`Using ${archetype.name} archetype for grooming (${industry})`, 'info');

      if (pageName.toLowerCase() === 'home') {
        return generateGroomingHomePage(archetype, businessData, colors, layoutOverrides);
      }
      if (pageName.toLowerCase() === 'services') {
        return generateGroomingServicesPage(archetype, businessData, colors, layoutOverrides);
      }
    }

    // Check HEALTHCARE industry (dental, medical, chiropractic)
    if (isHealthcareIndustry(industry)) {
      const archetype = archetypeOverride ? getHealthcareArchetype(archetypeOverride) : detectHealthcareArchetype(businessData);
      this.log(`Using ${archetype.name} archetype for healthcare (${industry})`, 'info');

      if (pageName.toLowerCase() === 'home') {
        return generateHealthcareHomePage(archetype, businessData, colors, layoutOverrides);
      }
      if (pageName.toLowerCase() === 'services') {
        return generateHealthcareServicesPage(archetype, businessData, colors, layoutOverrides);
      }
    }

    // Check PROFESSIONAL industry (law, accounting, consulting, real estate)
    if (isProfessionalIndustry(industry)) {
      const archetype = archetypeOverride ? getProfessionalArchetype(archetypeOverride) : detectProfessionalArchetype(businessData);
      this.log(`Using ${archetype.name} archetype for professional services (${industry})`, 'info');

      if (pageName.toLowerCase() === 'home') {
        return generateProfessionalHomePage(archetype, businessData, colors, layoutOverrides);
      }
      if (pageName.toLowerCase() === 'services') {
        return generateProfessionalServicesPage(archetype, businessData, colors, layoutOverrides);
      }
    }

    // Check FITNESS industry (gym, yoga, fitness)
    if (isFitnessIndustry(industry)) {
      const archetype = archetypeOverride ? getFitnessArchetype(archetypeOverride) : detectFitnessArchetype(businessData);
      this.log(`Using ${archetype.name} archetype for fitness (${industry})`, 'info');

      if (pageName.toLowerCase() === 'home') {
        return generateFitnessHomePage(archetype, businessData, colors, layoutOverrides);
      }
      if (pageName.toLowerCase() === 'services') {
        return generateFitnessServicesPage(archetype, businessData, colors, layoutOverrides);
      }
    }

    // Check TECHNOLOGY industry (saas, startup, agency)
    if (isTechnologyIndustry(industry)) {
      const archetype = archetypeOverride ? getTechnologyArchetype(archetypeOverride) : detectTechnologyArchetype(businessData);
      this.log(`Using ${archetype.name} archetype for technology (${industry})`, 'info');

      if (pageName.toLowerCase() === 'home') {
        return generateTechnologyHomePage(archetype, businessData, colors, layoutOverrides);
      }
      if (pageName.toLowerCase() === 'services') {
        return generateTechnologyServicesPage(archetype, businessData, colors, layoutOverrides);
      }
    }

    // Check HOME SERVICES industry (plumber, electrician, cleaning)
    if (isHomeServicesIndustry(industry)) {
      const archetypeResult = this.generateHomeServicesArchetypePage(pageName, businessName, address, phone, industry, colors, fixture, archetypeOverride, layoutOverrides);
      if (archetypeResult) {
        return archetypeResult;
      }
    }

    // Check ARTISAN FOOD industry (restaurant, bakery, cafe)
    if (isArtisanFoodIndustry(industry)) {
      const archetypeResult = this.generateArchetypePage(pageName, businessName, address, phone, industry, colors, fixture, archetypeOverride, layoutOverrides);
      if (archetypeResult) {
        return archetypeResult;
      }
    }

    // Extract styling from layoutOverrides (comes from getSliderStyles)
    const fontHeading = layoutOverrides.fontHeading || "'Inter', system-ui, sans-serif";
    const fontBody = layoutOverrides.fontBody || "system-ui, sans-serif";
    const corners = layoutOverrides.borderRadius || '12px';
    const sectionPadding = layoutOverrides.sectionPadding || '80px 24px';
    const cardPadding = layoutOverrides.cardPadding || '32px';
    const gap = layoutOverrides.gap || '32px';
    const isDark = layoutOverrides.isDark || false;
    const headlineStyle = layoutOverrides.headlineStyle || 'none';
    const buttonStyle = layoutOverrides.buttonStyle || { padding: '14px 28px', borderRadius: corners, fontWeight: '600' };

    // Use slider-adjusted colors (dark mode may override background/text)
    const styleColors = layoutOverrides.colors || colors;
    const bgColor = styleColors.background || colors.background || '#ffffff';
    const textColor = styleColors.text || colors.text || '#1f2937';
    const surfaceColor = styleColors.surface || (isDark ? '#1e293b' : '#f9fafb');
    const primaryColor = styleColors.primary || colors.primary || '#2563eb';
    const accentColor = colors.secondary || colors.accent || primaryColor;

    // Card shadow based on theme
    const cardShadow = isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.08)';

    // Hero background based on dark mode
    const heroBackground = isDark
      ? `background: 'linear-gradient(135deg, ${primaryColor} 0%, #0f172a 100%)'`
      : `background: 'linear-gradient(135deg, ${primaryColor}11 0%, ${primaryColor}22 100%)'`;

    // Hero text color based on dark mode
    const heroTextColor = isDark ? '#ffffff' : textColor;

    // Extract menu data from fixture for menu page
    const fixtureMenuCategories = fixture?.pages?.menu?.categories || fixture?.menu?.categories || [];
    const menuCategories = fixtureMenuCategories.length > 0
      ? ['All', ...fixtureMenuCategories.map(cat => cat.name)]
      : ['All', 'Appetizers', 'Main Courses', 'Sides', 'Desserts', 'Beverages'];

    // Convert fixture menu items to flat array with category
    const menuItemsFromFixture = fixtureMenuCategories.length > 0
      ? fixtureMenuCategories.flatMap(cat =>
          (cat.items || []).map(item => ({
            name: item.name,
            description: item.description || '',
            price: typeof item.price === 'number' ? `$${item.price.toFixed(2)}` : (item.price || ''),
            category: cat.name,
            popular: item.popular || false,
            vegetarian: item.vegetarian || item.tags?.includes('Vegetarian') || false
          }))
        )
      : null; // null means use defaults

    const templates = {
      home: `import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Phone, Star, Clock } from 'lucide-react';

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Welcome to ${businessName}</h1>
          <p style={styles.heroSubtitle}>Your trusted local ${industry} in the community</p>
          ${address ? `<p style={styles.heroLocation}><MapPin size={18} /> ${address}</p>` : ''}
          <div style={styles.heroCtas}>
            <Link to="/contact" style={styles.primaryBtn}>Get in Touch</Link>
            <Link to="/menu" style={styles.secondaryBtn}>View Menu <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.features}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Why Choose Us</h2>
          <div style={styles.featureGrid}>
            <div style={styles.featureCard}>
              <div style={styles.iconWrap}><Star size={28} color="${colors.secondary || colors.primary}" /></div>
              <h3 style={styles.featureTitle}>Quality Service</h3>
              <p style={styles.featureText}>We pride ourselves on delivering exceptional quality every time.</p>
            </div>
            <div style={styles.featureCard}>
              <div style={styles.iconWrap}><Clock size={28} color="${colors.secondary || colors.primary}" /></div>
              <h3 style={styles.featureTitle}>Reliable & On Time</h3>
              <p style={styles.featureText}>Count on us to be there when you need us most.</p>
            </div>
            <div style={styles.featureCard}>
              <div style={styles.iconWrap}><MapPin size={28} color="${colors.secondary || colors.primary}" /></div>
              <h3 style={styles.featureTitle}>Locally Owned</h3>
              <p style={styles.featureText}>Proudly serving our neighbors in the community.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.cta}>
        <div style={styles.container}>
          <h2 style={styles.ctaTitle}>Ready to get started?</h2>
          <p style={styles.ctaText}>Contact us today and let us help you.</p>
          ${phone ? `<a href="tel:${phone.replace(/[^0-9]/g, '')}" style={styles.primaryBtn}><Phone size={18} /> Call ${phone}</a>` : '<Link to="/contact" style={styles.primaryBtn}>Contact Us</Link>'}
        </div>
      </section>
    </div>
  );
}

const styles = {
  hero: { ${heroBackground}, padding: '${sectionPadding}', textAlign: 'center' },
  heroContent: { maxWidth: '800px', margin: '0 auto' },
  heroTitle: { fontFamily: "${fontHeading}", fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '700', color: '${heroTextColor}', marginBottom: '16px', textTransform: '${headlineStyle}' },
  heroSubtitle: { fontFamily: "${fontBody}", fontSize: '1.25rem', color: '${heroTextColor}', opacity: 0.85, marginBottom: '12px' },
  heroLocation: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '${heroTextColor}', opacity: 0.7, marginBottom: '32px' },
  heroCtas: { display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' },
  primaryBtn: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: '${isDark ? accentColor : primaryColor}', color: '${isDark ? textColor : '#fff'}', padding: '${buttonStyle.padding}', borderRadius: '${corners}', fontWeight: '${buttonStyle.fontWeight}', fontSize: '15px' },
  secondaryBtn: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: '${isDark ? 'rgba(255,255,255,0.1)' : accentColor + '22'}', color: '${isDark ? '#fff' : accentColor}', padding: '${buttonStyle.padding}', borderRadius: '${corners}', fontWeight: '${buttonStyle.fontWeight}', fontSize: '15px', border: '2px solid ${isDark ? 'rgba(255,255,255,0.3)' : accentColor}' },
  features: { padding: '${sectionPadding}', background: '${bgColor}' },
  container: { maxWidth: '1200px', margin: '0 auto' },
  sectionTitle: { fontFamily: "${fontHeading}", fontSize: '2rem', fontWeight: '700', textAlign: 'center', marginBottom: '48px', color: '${textColor}', textTransform: '${headlineStyle}' },
  featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '${gap}' },
  featureCard: { textAlign: 'center', padding: '${cardPadding}', borderRadius: '${corners}', background: '${surfaceColor}', borderTop: '4px solid ${accentColor}', boxShadow: '${cardShadow}' },
  iconWrap: { width: '64px', height: '64px', borderRadius: '50%', background: '${accentColor}15', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' },
  featureTitle: { fontFamily: "${fontHeading}", fontSize: '1.25rem', fontWeight: '600', margin: '0 0 8px', color: '${textColor}' },
  featureText: { fontFamily: "${fontBody}", color: '${textColor}', opacity: 0.7, lineHeight: 1.6 },
  cta: { padding: '${sectionPadding}', background: '${primaryColor}', textAlign: 'center' },
  ctaTitle: { fontFamily: "${fontHeading}", fontSize: '2rem', fontWeight: '700', color: '#fff', marginBottom: '16px' },
  ctaText: { fontFamily: "${fontBody}", color: '#fff', opacity: 0.9, marginBottom: '32px', fontSize: '1.1rem' }
};
`,
      about: `import React from 'react';
import { Award, Users, Heart, MapPin } from 'lucide-react';

export default function AboutPage() {
  return (
    <div>
      <section style={styles.hero}>
        <div style={styles.container}>
          <h1 style={styles.title}>About ${businessName}</h1>
          <p style={styles.subtitle}>Learn more about who we are and what drives us</p>
        </div>
      </section>

      <section style={styles.content}>
        <div style={styles.container}>
          <div style={styles.story}>
            <h2 style={styles.sectionTitle}>Our Story</h2>
            <p style={styles.text}>
              ${businessName} was founded with a simple mission: to provide outstanding ${industry} services
              to our local community. We believe in building lasting relationships with our customers
              through quality, reliability, and genuine care.
            </p>
            <p style={styles.text}>
              ${address ? `Located in ${address}, we're proud to be a part of this wonderful community.` : 'We are proud to serve our wonderful community.'}
              Every day, we strive to exceed expectations and deliver an experience that keeps
              our customers coming back.
            </p>
          </div>

          <div style={styles.values}>
            <h2 style={styles.sectionTitle}>Our Values</h2>
            <div style={styles.valueGrid}>
              <div style={styles.valueCard}>
                <Award size={28} color="${colors.primary}" />
                <h3>Excellence</h3>
                <p>We never settle for anything less than our best.</p>
              </div>
              <div style={styles.valueCard}>
                <Users size={28} color="${colors.primary}" />
                <h3>Community</h3>
                <p>We're neighbors first, business second.</p>
              </div>
              <div style={styles.valueCard}>
                <Heart size={28} color="${colors.primary}" />
                <h3>Passion</h3>
                <p>We love what we do and it shows.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  hero: { background: '${colors.primary}', padding: '60px 24px', textAlign: 'center' },
  container: { maxWidth: '900px', margin: '0 auto' },
  title: { fontSize: '2.5rem', fontWeight: '700', color: '#fff', marginBottom: '16px' },
  subtitle: { fontSize: '1.1rem', color: '#fff', opacity: 0.9 },
  content: { padding: '60px 24px' },
  story: { marginBottom: '60px' },
  sectionTitle: { fontSize: '1.75rem', fontWeight: '600', color: '${colors.text}', marginBottom: '24px' },
  text: { fontSize: '1.1rem', lineHeight: 1.8, color: '${colors.text}', opacity: 0.85, marginBottom: '16px' },
  values: {},
  valueGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' },
  valueCard: { padding: '24px', background: '${surfaceColor}', borderRadius: '${corners}', textAlign: 'center', boxShadow: '${cardShadow}' }
};
`,
      services: `import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ServicesPage() {
  const services = [
    { name: 'Service One', description: 'High-quality service tailored to your needs.' },
    { name: 'Service Two', description: 'Professional and reliable, every time.' },
    { name: 'Service Three', description: 'Customized solutions for your unique situation.' },
    { name: 'Service Four', description: 'Exceptional value and outstanding results.' }
  ];

  return (
    <div>
      <section style={styles.hero}>
        <div style={styles.container}>
          <h1 style={styles.title}>Our Services</h1>
          <p style={styles.subtitle}>Discover what ${businessName} can do for you</p>
        </div>
      </section>

      <section style={styles.content}>
        <div style={styles.container}>
          <div style={styles.serviceGrid}>
            {services.map((service, i) => (
              <div key={i} style={styles.serviceCard}>
                <CheckCircle size={32} color="${colors.primary}" />
                <h3 style={styles.serviceName}>{service.name}</h3>
                <p style={styles.serviceDesc}>{service.description}</p>
              </div>
            ))}
          </div>

          <div style={styles.cta}>
            <h2>Ready to get started?</h2>
            <p>Contact us today to learn more about our services.</p>
            <Link to="/contact" style={styles.ctaBtn}>Contact Us <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  hero: { background: '${colors.primary}', padding: '60px 24px', textAlign: 'center' },
  container: { maxWidth: '1000px', margin: '0 auto' },
  title: { fontSize: '2.5rem', fontWeight: '700', color: '#fff', marginBottom: '16px' },
  subtitle: { fontSize: '1.1rem', color: '#fff', opacity: 0.9 },
  content: { padding: '60px 24px' },
  serviceGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '60px' },
  serviceCard: { padding: '32px', background: '${surfaceColor}', borderRadius: '${corners}', textAlign: 'center', boxShadow: '${cardShadow}' },
  serviceName: { fontSize: '1.25rem', fontWeight: '600', margin: '16px 0 8px', color: '${colors.text}' },
  serviceDesc: { color: '${colors.text}', opacity: 0.7, lineHeight: 1.6 },
  cta: { textAlign: 'center', padding: '48px', background: '${colors.primary}11', borderRadius: '16px' },
  ctaBtn: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: '${colors.primary}', color: '#fff', padding: '14px 28px', borderRadius: '${corners}', fontWeight: '600', marginTop: '20px' }
};
`,
      contact: `import React, { useState } from 'react';
import { MapPin, Phone, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react';

// API base URL
const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3001'
  : 'https://api.' + window.location.hostname.replace('www.', '');

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle, sending, success, error
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');

    try {
      const res = await fetch(API_URL + '/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to send message');
        setStatus('error');
      }
    } catch (err) {
      setErrorMsg('Could not connect to server');
      setStatus('error');
    }
  };

  return (
    <div>
      <section style={styles.hero}>
        <div style={styles.container}>
          <h1 style={styles.title}>Contact Us</h1>
          <p style={styles.subtitle}>We'd love to hear from you</p>
        </div>
      </section>

      <section style={styles.content}>
        <div style={styles.container}>
          <div style={styles.grid}>
            <div style={styles.info}>
              <h2 style={styles.sectionTitle}>Get in Touch</h2>

              ${address ? `<div style={styles.infoItem}>
                <MapPin size={20} color="${colors.primary}" />
                <div>
                  <strong>Address</strong>
                  <p>${address}</p>
                </div>
              </div>` : ''}

              ${phone ? `<div style={styles.infoItem}>
                <Phone size={20} color="${colors.primary}" />
                <div>
                  <strong>Phone</strong>
                  <p><a href="tel:${phone.replace(/[^0-9]/g, '')}" style={styles.link}>${phone}</a></p>
                </div>
              </div>` : ''}

              <div style={styles.infoItem}>
                <Clock size={20} color="${colors.primary}" />
                <div>
                  <strong>Hours</strong>
                  <p>Monday - Friday: 9am - 6pm</p>
                  <p>Saturday: 10am - 4pm</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>

            <div style={styles.formContainer}>
              <h2 style={styles.sectionTitle}>Send us a Message</h2>

              {status === 'success' ? (
                <div style={styles.successBox}>
                  <CheckCircle size={48} color="#10b981" />
                  <h3 style={styles.successTitle}>Message Sent!</h3>
                  <p style={styles.successText}>Thank you for reaching out. We'll get back to you soon.</p>
                  <button onClick={() => setStatus('idle')} style={styles.resetBtn}>Send Another Message</button>
                </div>
              ) : (
                <form style={styles.form} onSubmit={handleSubmit}>
                  {status === 'error' && (
                    <div style={styles.errorBox}>
                      <AlertCircle size={18} />
                      <span>{errorMsg}</span>
                    </div>
                  )}
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
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    style={styles.textarea}
                    required
                  ></textarea>
                  <button type="submit" style={styles.submitBtn} disabled={status === 'sending'}>
                    {status === 'sending' ? 'Sending...' : <><Send size={18} /> Send Message</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  hero: { background: '${colors.primary}', padding: '60px 24px', textAlign: 'center' },
  container: { maxWidth: '1000px', margin: '0 auto' },
  title: { fontSize: '2.5rem', fontWeight: '700', color: '#fff', marginBottom: '16px' },
  subtitle: { fontSize: '1.1rem', color: '#fff', opacity: 0.9 },
  content: { padding: '60px 24px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px' },
  info: {},
  sectionTitle: { fontSize: '1.5rem', fontWeight: '600', marginBottom: '24px', color: '${colors.text}' },
  infoItem: { display: 'flex', gap: '16px', marginBottom: '24px' },
  link: { color: '${colors.primary}' },
  formContainer: {},
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  input: { padding: '14px 16px', border: '1px solid #e5e7eb', borderRadius: '${corners}', fontSize: '15px' },
  textarea: { padding: '14px 16px', border: '1px solid #e5e7eb', borderRadius: '${corners}', fontSize: '15px', resize: 'vertical' },
  submitBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '${colors.primary}', color: '#fff', padding: '14px 28px', borderRadius: '${corners}', fontWeight: '600', fontSize: '15px', border: 'none', cursor: 'pointer' },
  successBox: { textAlign: 'center', padding: '40px', background: '#10b98110', borderRadius: '12px' },
  successTitle: { fontSize: '1.5rem', fontWeight: '600', marginTop: '16px', color: '${colors.text}' },
  successText: { color: '${colors.text}', opacity: 0.7, marginTop: '8px' },
  resetBtn: { marginTop: '20px', background: '${colors.primary}', color: '#fff', padding: '12px 24px', borderRadius: '${corners}', border: 'none', cursor: 'pointer', fontWeight: '500' },
  errorBox: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: '#ef444420', color: '#ef4444', borderRadius: '${corners}', fontSize: '14px' }
};
`,
      book: `import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle } from 'lucide-react';

export default function BookPage() {
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const services = [
    { id: 1, name: 'Standard Service', duration: '30 min', price: '$25' },
    { id: 2, name: 'Premium Service', duration: '45 min', price: '$40' },
    { id: 3, name: 'Deluxe Package', duration: '60 min', price: '$55' },
    { id: 4, name: 'VIP Experience', duration: '90 min', price: '$85' }
  ];

  const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];

  return (
    <div>
      <section style={styles.hero}>
        <div style={styles.container}>
          <h1 style={styles.title}>Book an Appointment</h1>
          <p style={styles.subtitle}>Schedule your visit with ${businessName}</p>
        </div>
      </section>

      <section style={styles.content}>
        <div style={styles.container}>
          <div style={styles.bookingGrid}>
            <div style={styles.step}>
              <div style={styles.stepHeader}>
                <span style={styles.stepNumber}>1</span>
                <h3>Choose a Service</h3>
              </div>
              <div style={styles.serviceList}>
                {services.map(service => (
                  <div
                    key={service.id}
                    style={{
                      ...styles.serviceOption,
                      borderColor: selectedService === service.name ? '${colors.primary}' : '#e5e7eb',
                      background: selectedService === service.name ? '${colors.primary}11' : '#fff'
                    }}
                    onClick={() => setSelectedService(service.name)}
                  >
                    <div style={styles.serviceInfo}>
                      <strong>{service.name}</strong>
                      <span style={styles.serviceMeta}>{service.duration}</span>
                    </div>
                    <span style={styles.servicePrice}>{service.price}</span>
                    {selectedService === service.name && <CheckCircle size={20} color="${colors.primary}" />}
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.step}>
              <div style={styles.stepHeader}>
                <span style={styles.stepNumber}>2</span>
                <h3>Pick Date & Time</h3>
              </div>
              <div style={styles.dateTimeGrid}>
                <div style={styles.dateInput}>
                  <Calendar size={18} color="${colors.primary}" />
                  <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={styles.input} />
                </div>
                <div style={styles.timeSlots}>
                  {timeSlots.map(time => (
                    <button key={time} style={{ ...styles.timeSlot, background: selectedTime === time ? '${colors.primary}' : '#fff', color: selectedTime === time ? '#fff' : '${colors.text}' }} onClick={() => setSelectedTime(time)}>{time}</button>
                  ))}
                </div>
              </div>
            </div>

            <div style={styles.step}>
              <div style={styles.stepHeader}>
                <span style={styles.stepNumber}>3</span>
                <h3>Your Information</h3>
              </div>
              <form style={styles.form}>
                <input type="text" placeholder="Full Name" style={styles.formInput} />
                <input type="email" placeholder="Email Address" style={styles.formInput} />
                <input type="tel" placeholder="Phone Number" style={styles.formInput} />
                <textarea placeholder="Special requests (optional)" style={styles.formTextarea} rows={3}></textarea>
                <button type="submit" style={styles.submitBtn}>Confirm Booking</button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  hero: { background: '${colors.primary}', padding: '60px 24px', textAlign: 'center' },
  container: { maxWidth: '900px', margin: '0 auto' },
  title: { fontSize: '2.5rem', fontWeight: '700', color: '#fff', marginBottom: '16px' },
  subtitle: { fontSize: '1.1rem', color: '#fff', opacity: 0.9 },
  content: { padding: '60px 24px' },
  bookingGrid: { display: 'flex', flexDirection: 'column', gap: '40px' },
  step: { background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  stepHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' },
  stepNumber: { width: '32px', height: '32px', borderRadius: '50%', background: '${colors.primary}', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600' },
  serviceList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  serviceOption: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '2px solid', borderRadius: '${corners}', cursor: 'pointer' },
  serviceInfo: { display: 'flex', flexDirection: 'column', gap: '4px' },
  serviceMeta: { fontSize: '13px', color: '${colors.text}', opacity: 0.6 },
  servicePrice: { fontWeight: '600', color: '${colors.primary}' },
  dateTimeGrid: { display: 'flex', flexDirection: 'column', gap: '20px' },
  dateInput: { display: 'flex', alignItems: 'center', gap: '12px' },
  input: { flex: 1, padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: '${corners}', fontSize: '15px' },
  timeSlots: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px' },
  timeSlot: { padding: '12px', border: '1px solid #e5e7eb', borderRadius: '${corners}', cursor: 'pointer', fontWeight: '500', fontSize: '14px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  formInput: { padding: '14px 16px', border: '1px solid #e5e7eb', borderRadius: '${corners}', fontSize: '15px' },
  formTextarea: { padding: '14px 16px', border: '1px solid #e5e7eb', borderRadius: '${corners}', fontSize: '15px', resize: 'vertical' },
  submitBtn: { background: '${colors.primary}', color: '#fff', padding: '16px 28px', borderRadius: '${corners}', fontWeight: '600', fontSize: '16px', border: 'none', cursor: 'pointer' }
};
`,
      loyalty: `import React, { useState } from 'react';
import { Star, Gift, Award, TrendingUp, Check } from 'lucide-react';

export default function LoyaltyPage() {
  const [email, setEmail] = useState('');

  const tiers = [
    { name: 'Bronze', points: '0-499', perks: ['5% off all services', 'Birthday bonus'], color: '#CD7F32' },
    { name: 'Silver', points: '500-999', perks: ['10% off all services', 'Priority booking', 'Free upgrade once/month'], color: '#C0C0C0' },
    { name: 'Gold', points: '1000+', perks: ['15% off all services', 'VIP access', 'Free monthly service', 'Exclusive events'], color: '#FFD700' }
  ];

  const howItWorks = [
    { icon: Star, title: 'Earn Points', desc: 'Get 1 point for every dollar spent' },
    { icon: TrendingUp, title: 'Level Up', desc: 'Reach new tiers for better rewards' },
    { icon: Gift, title: 'Redeem Rewards', desc: 'Use points for free services & perks' }
  ];

  return (
    <div>
      <section style={styles.hero}>
        <div style={styles.container}>
          <Award size={48} color="#fff" style={{ marginBottom: '16px' }} />
          <h1 style={styles.title}>Loyalty Rewards</h1>
          <p style={styles.subtitle}>Join our rewards program and start earning today</p>
        </div>
      </section>

      <section style={styles.content}>
        <div style={styles.container}>
          <div style={styles.howItWorks}>
            <h2 style={styles.sectionTitle}>How It Works</h2>
            <div style={styles.stepsGrid}>
              {howItWorks.map((step, i) => (
                <div key={i} style={styles.stepCard}>
                  <step.icon size={36} color="${colors.primary}" />
                  <h3 style={styles.stepTitle}>{step.title}</h3>
                  <p style={styles.stepDesc}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.tiers}>
            <h2 style={styles.sectionTitle}>Reward Tiers</h2>
            <div style={styles.tierGrid}>
              {tiers.map((tier, i) => (
                <div key={i} style={{ ...styles.tierCard, borderTopColor: tier.color }}>
                  <div style={{ ...styles.tierBadge, background: tier.color }}><Award size={24} color="#fff" /></div>
                  <h3 style={styles.tierName}>{tier.name}</h3>
                  <p style={styles.tierPoints}>{tier.points} points</p>
                  <ul style={styles.perkList}>
                    {tier.perks.map((perk, j) => (<li key={j} style={styles.perkItem}><Check size={16} color="${colors.primary}" />{perk}</li>))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.signUp}>
            <h2 style={styles.signUpTitle}>Ready to Start Earning?</h2>
            <p style={styles.signUpText}>Enter your email to join our rewards program</p>
            <form style={styles.signUpForm}>
              <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.emailInput} />
              <button type="submit" style={styles.joinBtn}>Join Now</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  hero: { background: 'linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary}dd 100%)', padding: '80px 24px', textAlign: 'center' },
  container: { maxWidth: '1000px', margin: '0 auto' },
  title: { fontSize: '2.5rem', fontWeight: '700', color: '#fff', marginBottom: '16px' },
  subtitle: { fontSize: '1.1rem', color: '#fff', opacity: 0.9 },
  content: { padding: '60px 24px' },
  howItWorks: { marginBottom: '60px' },
  sectionTitle: { fontSize: '1.75rem', fontWeight: '600', textAlign: 'center', marginBottom: '32px', color: '${colors.text}' },
  stepsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' },
  stepCard: { textAlign: 'center', padding: '32px', background: '#f9fafb', borderRadius: '12px' },
  stepTitle: { fontSize: '1.25rem', fontWeight: '600', margin: '16px 0 8px', color: '${colors.text}' },
  stepDesc: { color: '${colors.text}', opacity: 0.7 },
  tiers: { marginBottom: '60px' },
  tierGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' },
  tierCard: { padding: '32px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderTop: '4px solid', textAlign: 'center' },
  tierBadge: { width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' },
  tierName: { fontSize: '1.5rem', fontWeight: '700', color: '${colors.text}' },
  tierPoints: { fontSize: '0.9rem', color: '${colors.text}', opacity: 0.6, marginBottom: '20px' },
  perkList: { listStyle: 'none', textAlign: 'left' },
  perkItem: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', borderBottom: '1px solid #f0f0f0', fontSize: '14px', color: '${colors.text}' },
  signUp: { textAlign: 'center', padding: '48px', background: '${colors.primary}11', borderRadius: '16px' },
  signUpTitle: { fontSize: '1.75rem', fontWeight: '600', color: '${colors.text}', marginBottom: '8px' },
  signUpText: { color: '${colors.text}', opacity: 0.7, marginBottom: '24px' },
  signUpForm: { display: 'flex', gap: '12px', maxWidth: '400px', margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' },
  emailInput: { flex: 1, minWidth: '200px', padding: '14px 16px', border: '1px solid #e5e7eb', borderRadius: '${corners}', fontSize: '15px' },
  joinBtn: { background: '${colors.primary}', color: '#fff', padding: '14px 28px', borderRadius: '${corners}', fontWeight: '600', fontSize: '15px', border: 'none', cursor: 'pointer' }
};
`,
      gallery: `import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState(null);

  // Industry-appropriate placeholder images from Unsplash
  const images = ${(() => {
    const industryGalleries = {
      // Food & Beverage
      bakery: [
        { id: 1, title: 'Fresh Croissants', category: 'Products', url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600' },
        { id: 2, title: 'Artisan Breads', category: 'Products', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600' },
        { id: 3, title: 'Our Bakery', category: 'Interior', url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600' },
        { id: 4, title: 'Custom Cakes', category: 'Products', url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600' },
        { id: 5, title: 'Morning Rush', category: 'Team', url: 'https://images.unsplash.com/photo-1556217477-d325251ece38?w=600' },
        { id: 6, title: 'Display Counter', category: 'Interior', url: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=600' }
      ],
      restaurant: [
        { id: 1, title: 'Signature Dish', category: 'Food', url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600' },
        { id: 2, title: 'Dining Room', category: 'Interior', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600' },
        { id: 3, title: 'Chef at Work', category: 'Team', url: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600' },
        { id: 4, title: 'Fresh Ingredients', category: 'Food', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600' },
        { id: 5, title: 'Bar Area', category: 'Interior', url: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600' },
        { id: 6, title: 'Happy Guests', category: 'Events', url: 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=600' }
      ],
      'pizza-restaurant': [
        { id: 1, title: 'Wood-Fired Pizza', category: 'Food', url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600' },
        { id: 2, title: 'Fresh Ingredients', category: 'Food', url: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600' },
        { id: 3, title: 'Our Kitchen', category: 'Interior', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600' },
        { id: 4, title: 'Pizza Making', category: 'Team', url: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600' },
        { id: 5, title: 'Dining Area', category: 'Interior', url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600' },
        { id: 6, title: 'Family Dinner', category: 'Events', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600' }
      ],
      steakhouse: [
        { id: 1, title: 'Prime Cut', category: 'Food', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600' },
        { id: 2, title: 'Fine Dining Room', category: 'Interior', url: 'https://images.unsplash.com/photo-1550966871-3ed3cdb51f3a?w=600' },
        { id: 3, title: 'Chef Preparation', category: 'Team', url: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600' },
        { id: 4, title: 'Wine Selection', category: 'Interior', url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600' },
        { id: 5, title: 'Grilled Perfection', category: 'Food', url: 'https://images.unsplash.com/photo-1558030006-450675393462?w=600' },
        { id: 6, title: 'Private Event', category: 'Events', url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600' }
      ],
      'coffee-cafe': [
        { id: 1, title: 'Latte Art', category: 'Drinks', url: 'https://images.unsplash.com/photo-1534778101666-5e6d00b56f13?w=600' },
        { id: 2, title: 'Cozy Corner', category: 'Interior', url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600' },
        { id: 3, title: 'Barista at Work', category: 'Team', url: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600' },
        { id: 4, title: 'Fresh Pastries', category: 'Food', url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600' },
        { id: 5, title: 'Coffee Bar', category: 'Interior', url: 'https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=600' },
        { id: 6, title: 'Morning Vibes', category: 'Events', url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600' }
      ],
      cafe: [
        { id: 1, title: 'Latte Art', category: 'Drinks', url: 'https://images.unsplash.com/photo-1534778101666-5e6d00b56f13?w=600' },
        { id: 2, title: 'Cozy Corner', category: 'Interior', url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600' },
        { id: 3, title: 'Barista at Work', category: 'Team', url: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600' },
        { id: 4, title: 'Fresh Pastries', category: 'Food', url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600' },
        { id: 5, title: 'Coffee Bar', category: 'Interior', url: 'https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=600' },
        { id: 6, title: 'Morning Vibes', category: 'Events', url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600' }
      ],
      // Beauty & Wellness
      'salon-spa': [
        { id: 1, title: 'Relaxation Room', category: 'Interior', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600' },
        { id: 2, title: 'Hair Styling', category: 'Services', url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600' },
        { id: 3, title: 'Spa Treatment', category: 'Services', url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600' },
        { id: 4, title: 'Our Team', category: 'Team', url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600' },
        { id: 5, title: 'Nail Station', category: 'Interior', url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600' },
        { id: 6, title: 'Product Display', category: 'Products', url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600' }
      ],
      'spa-salon': [
        { id: 1, title: 'Relaxation Room', category: 'Interior', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600' },
        { id: 2, title: 'Hair Styling', category: 'Services', url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600' },
        { id: 3, title: 'Spa Treatment', category: 'Services', url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600' },
        { id: 4, title: 'Our Team', category: 'Team', url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600' },
        { id: 5, title: 'Nail Station', category: 'Interior', url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600' },
        { id: 6, title: 'Product Display', category: 'Products', url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600' }
      ],
      barbershop: [
        { id: 1, title: 'Classic Cut', category: 'Services', url: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600' },
        { id: 2, title: 'The Chair', category: 'Interior', url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600' },
        { id: 3, title: 'Straight Razor Shave', category: 'Services', url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600' },
        { id: 4, title: 'Our Barbers', category: 'Team', url: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600' },
        { id: 5, title: 'Shop Interior', category: 'Interior', url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600' },
        { id: 6, title: 'Fresh Fade', category: 'Results', url: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600' }
      ],
      yoga: [
        { id: 1, title: 'Morning Flow', category: 'Classes', url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600' },
        { id: 2, title: 'Studio Space', category: 'Interior', url: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=600' },
        { id: 3, title: 'Group Session', category: 'Classes', url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600' },
        { id: 4, title: 'Meditation Corner', category: 'Interior', url: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600' },
        { id: 5, title: 'Our Instructors', category: 'Team', url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600' },
        { id: 6, title: 'Peaceful Practice', category: 'Classes', url: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=600' }
      ],
      'fitness-gym': [
        { id: 1, title: 'Weight Room', category: 'Equipment', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600' },
        { id: 2, title: 'Group Class', category: 'Classes', url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600' },
        { id: 3, title: 'Personal Training', category: 'Services', url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600' },
        { id: 4, title: 'Cardio Area', category: 'Equipment', url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600' },
        { id: 5, title: 'Our Trainers', category: 'Team', url: 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=600' },
        { id: 6, title: 'Member Success', category: 'Results', url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600' }
      ],
      fitness: [
        { id: 1, title: 'Weight Room', category: 'Equipment', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600' },
        { id: 2, title: 'Group Class', category: 'Classes', url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600' },
        { id: 3, title: 'Personal Training', category: 'Services', url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600' },
        { id: 4, title: 'Cardio Area', category: 'Equipment', url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600' },
        { id: 5, title: 'Our Trainers', category: 'Team', url: 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=600' },
        { id: 6, title: 'Member Success', category: 'Results', url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600' }
      ],
      // Healthcare
      dental: [
        { id: 1, title: 'Modern Office', category: 'Interior', url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600' },
        { id: 2, title: 'Treatment Room', category: 'Interior', url: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600' },
        { id: 3, title: 'Bright Smiles', category: 'Results', url: 'https://images.unsplash.com/photo-1606265752439-1f18756aa5fc?w=600' },
        { id: 4, title: 'Our Team', category: 'Team', url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600' },
        { id: 5, title: 'Waiting Area', category: 'Interior', url: 'https://images.unsplash.com/photo-1629909615957-be38d6c54e24?w=600' },
        { id: 6, title: 'Advanced Technology', category: 'Equipment', url: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=600' }
      ],
      healthcare: [
        { id: 1, title: 'Reception Area', category: 'Interior', url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600' },
        { id: 2, title: 'Patient Care', category: 'Services', url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600' },
        { id: 3, title: 'Medical Team', category: 'Team', url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600' },
        { id: 4, title: 'Exam Room', category: 'Interior', url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600' },
        { id: 5, title: 'Lab Services', category: 'Services', url: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=600' },
        { id: 6, title: 'Community Health', category: 'Events', url: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=600' }
      ],
      // Professional Services
      'law-firm': [
        { id: 1, title: 'Conference Room', category: 'Interior', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600' },
        { id: 2, title: 'Legal Library', category: 'Interior', url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600' },
        { id: 3, title: 'Our Attorneys', category: 'Team', url: 'https://images.unsplash.com/photo-1556157382-97edd2d9e772?w=600' },
        { id: 4, title: 'Client Meeting', category: 'Services', url: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600' },
        { id: 5, title: 'Office Lobby', category: 'Interior', url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600' },
        { id: 6, title: 'Courtroom Success', category: 'Results', url: 'https://images.unsplash.com/photo-1589391886645-d51941baf7fb?w=600' }
      ],
      'real-estate': [
        { id: 1, title: 'Luxury Listing', category: 'Properties', url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600' },
        { id: 2, title: 'Modern Kitchen', category: 'Properties', url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600' },
        { id: 3, title: 'Home Tour', category: 'Services', url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600' },
        { id: 4, title: 'Our Agents', category: 'Team', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600' },
        { id: 5, title: 'New Homeowners', category: 'Results', url: 'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=600' },
        { id: 6, title: 'Office Location', category: 'Interior', url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600' }
      ],
      // Home Services
      plumber: [
        { id: 1, title: 'Professional Service', category: 'Services', url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600' },
        { id: 2, title: 'Modern Fixtures', category: 'Work', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600' },
        { id: 3, title: 'Our Team', category: 'Team', url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600' },
        { id: 4, title: 'Quality Work', category: 'Results', url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600' },
        { id: 5, title: 'Service Van', category: 'Equipment', url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600' },
        { id: 6, title: 'Happy Customer', category: 'Results', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600' }
      ],
      cleaning: [
        { id: 1, title: 'Spotless Results', category: 'Results', url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600' },
        { id: 2, title: 'Professional Team', category: 'Team', url: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=600' },
        { id: 3, title: 'Deep Cleaning', category: 'Services', url: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600' },
        { id: 4, title: 'Quality Products', category: 'Equipment', url: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=600' },
        { id: 5, title: 'Kitchen Shine', category: 'Results', url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600' },
        { id: 6, title: 'Office Cleaning', category: 'Services', url: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600' }
      ],
      'auto-shop': [
        { id: 1, title: 'Service Bay', category: 'Interior', url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600' },
        { id: 2, title: 'Expert Mechanics', category: 'Team', url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600' },
        { id: 3, title: 'Diagnostic Tools', category: 'Equipment', url: 'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=600' },
        { id: 4, title: 'Quality Parts', category: 'Equipment', url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600' },
        { id: 5, title: 'Oil Change', category: 'Services', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600' },
        { id: 6, title: 'Happy Driver', category: 'Results', url: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600' }
      ],
      // Tech & Education
      saas: [
        { id: 1, title: 'Modern Dashboard', category: 'Product', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600' },
        { id: 2, title: 'Team Collaboration', category: 'Features', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600' },
        { id: 3, title: 'Our Office', category: 'Interior', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600' },
        { id: 4, title: 'Dev Team', category: 'Team', url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600' },
        { id: 5, title: 'Analytics', category: 'Product', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600' },
        { id: 6, title: 'Customer Success', category: 'Results', url: 'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=600' }
      ],
      ecommerce: [
        { id: 1, title: 'Product Display', category: 'Products', url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600' },
        { id: 2, title: 'Warehouse', category: 'Interior', url: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=600' },
        { id: 3, title: 'Packaging', category: 'Services', url: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600' },
        { id: 4, title: 'Our Team', category: 'Team', url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600' },
        { id: 5, title: 'Quality Products', category: 'Products', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600' },
        { id: 6, title: 'Fast Shipping', category: 'Services', url: 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=600' }
      ],
      school: [
        { id: 1, title: 'Classroom', category: 'Interior', url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600' },
        { id: 2, title: 'Library', category: 'Interior', url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600' },
        { id: 3, title: 'Students Learning', category: 'Classes', url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600' },
        { id: 4, title: 'Our Faculty', category: 'Team', url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600' },
        { id: 5, title: 'Campus Grounds', category: 'Interior', url: 'https://images.unsplash.com/photo-1562774053-701939374585?w=600' },
        { id: 6, title: 'Graduation Day', category: 'Events', url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600' }
      ],
      // Default fallback
      default: [
        { id: 1, title: 'Our Work', category: 'Featured', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600' },
        { id: 2, title: 'Our Space', category: 'Interior', url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600' },
        { id: 3, title: 'Team at Work', category: 'Team', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600' },
        { id: 4, title: 'Quality Service', category: 'Featured', url: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600' },
        { id: 5, title: 'Our Equipment', category: 'Interior', url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600' },
        { id: 6, title: 'Happy Customers', category: 'Featured', url: 'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=600' }
      ]
    };
    const gallery = industryGalleries[industry] || industryGalleries.default;
    return JSON.stringify(gallery);
  })()};

  const categories = ['All', ...new Set(images.map(img => img.category))];
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredImages = activeCategory === 'All' ? images : images.filter(img => img.category === activeCategory);

  return (
    <div>
      <section style={styles.hero}>
        <div style={styles.container}>
          <h1 style={styles.title}>Our Gallery</h1>
          <p style={styles.subtitle}>See our work and happy customers at ${businessName}</p>
        </div>
      </section>

      <section style={styles.content}>
        <div style={styles.container}>
          <div style={styles.filters}>
            {categories.map(cat => (
              <button key={cat} style={{ ...styles.filterBtn, background: activeCategory === cat ? '${colors.primary}' : '#fff', color: activeCategory === cat ? '#fff' : '${colors.text}' }} onClick={() => setActiveCategory(cat)}>{cat}</button>
            ))}
          </div>

          <div style={styles.grid}>
            {filteredImages.map(img => (
              <div key={img.id} style={styles.imageCard} onClick={() => setSelectedImage(img)}>
                <img src={img.url} alt={img.title} style={styles.galleryImage} />
                <div style={styles.imageOverlay}>
                  <p style={styles.imageTitle}>{img.title}</p>
                  <span style={styles.imageCategory}>{img.category}</span>
                </div>
              </div>
            ))}
          </div>

          {selectedImage && (
            <div style={styles.lightbox} onClick={() => setSelectedImage(null)}>
              <button style={styles.closeBtn} onClick={() => setSelectedImage(null)}><X size={24} /></button>
              <div style={styles.lightboxContent} onClick={e => e.stopPropagation()}>
                <img src={selectedImage.url} alt={selectedImage.title} style={styles.lightboxImage} />
                <div style={styles.lightboxInfo}><h3>{selectedImage.title}</h3><p>{selectedImage.category}</p></div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

const styles = {
  hero: { background: '${colors.primary}', padding: '60px 24px', textAlign: 'center' },
  container: { maxWidth: '1200px', margin: '0 auto' },
  title: { fontSize: '2.5rem', fontWeight: '700', color: '#fff', marginBottom: '16px' },
  subtitle: { fontSize: '1.1rem', color: '#fff', opacity: 0.9 },
  content: { padding: '60px 24px' },
  filters: { display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '40px', flexWrap: 'wrap' },
  filterBtn: { padding: '10px 20px', border: '1px solid #e5e7eb', borderRadius: '24px', cursor: 'pointer', fontWeight: '500', fontSize: '14px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' },
  imageCard: { position: 'relative', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', aspectRatio: '4/3' },
  galleryImage: { width: '100%', height: '100%', objectFit: 'cover' },
  imageOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', color: '#fff' },
  imageTitle: { fontWeight: '600', marginBottom: '4px' },
  imageCategory: { fontSize: '13px', opacity: 0.8 },
  lightbox: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  closeBtn: { position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px' },
  lightboxContent: { maxWidth: '800px', width: '90%' },
  lightboxImage: { width: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '12px' },
  lightboxInfo: { color: '#fff', textAlign: 'center', marginTop: '16px' }
};
`,
      menu: `import React, { useState } from 'react';
import { Search, Star, Leaf } from 'lucide-react';

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ${JSON.stringify(menuCategories)};

  const menuItems = ${menuItemsFromFixture ? JSON.stringify(menuItemsFromFixture) : `[
    { name: 'Signature Dish', description: 'Our house specialty with fresh ingredients', price: '$18.99', category: 'Main Courses', popular: true },
    { name: 'Garden Salad', description: 'Mixed greens with house dressing', price: '$8.99', category: 'Appetizers', vegetarian: true },
    { name: 'Grilled Chicken', description: 'Herb-marinated chicken breast', price: '$16.99', category: 'Main Courses' },
    { name: 'Crispy Fries', description: 'Hand-cut and seasoned to perfection', price: '$5.99', category: 'Sides', popular: true },
    { name: 'Chocolate Cake', description: 'Rich, decadent chocolate layers', price: '$7.99', category: 'Desserts' },
    { name: 'Fresh Lemonade', description: 'House-made with real lemons', price: '$3.99', category: 'Beverages' }
  ]`};

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      <section style={styles.hero}>
        <div style={styles.container}>
          <h1 style={styles.title}>Our Menu</h1>
          <p style={styles.subtitle}>Fresh, delicious options at ${businessName}</p>
        </div>
      </section>

      <section style={styles.content}>
        <div style={styles.container}>
          <div style={styles.searchBar}>
            <Search size={20} color="#999" />
            <input type="text" placeholder="Search menu..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={styles.searchInput} />
          </div>

          <div style={styles.categories}>
            {categories.map(cat => (
              <button key={cat} style={{ ...styles.categoryBtn, background: activeCategory === cat ? '${colors.primary}' : 'transparent', color: activeCategory === cat ? '#fff' : '${colors.text}' }} onClick={() => setActiveCategory(cat)}>{cat}</button>
            ))}
          </div>

          <div style={styles.menuGrid}>
            {filteredItems.map((item, i) => (
              <div key={i} style={styles.menuItem}>
                <div style={styles.menuItemHeader}>
                  <h3 style={styles.itemName}>
                    {item.name}
                    {item.popular && <Star size={14} color="#FFD700" fill="#FFD700" style={{ marginLeft: '8px' }} />}
                    {item.vegetarian && <Leaf size={14} color="#22C55E" style={{ marginLeft: '6px' }} />}
                  </h3>
                  <span style={styles.itemPrice}>{item.price}</span>
                </div>
                <p style={styles.itemDesc}>{item.description}</p>
                <span style={styles.itemCategory}>{item.category}</span>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && <div style={styles.noResults}><p>No items found.</p></div>}

          <div style={styles.legend}>
            <span style={styles.legendItem}><Star size={14} color="#FFD700" fill="#FFD700" /> Popular</span>
            <span style={styles.legendItem}><Leaf size={14} color="#22C55E" /> Vegetarian</span>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  hero: { background: '${colors.primary}', padding: '60px 24px', textAlign: 'center' },
  container: { maxWidth: '1000px', margin: '0 auto' },
  title: { fontSize: '2.5rem', fontWeight: '700', color: '#fff', marginBottom: '16px' },
  subtitle: { fontSize: '1.1rem', color: '#fff', opacity: 0.9 },
  content: { padding: '60px 24px' },
  searchBar: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', background: '#f9fafb', borderRadius: '12px', marginBottom: '24px' },
  searchInput: { flex: 1, border: 'none', background: 'transparent', fontSize: '16px', outline: 'none' },
  categories: { display: 'flex', gap: '8px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '8px' },
  categoryBtn: { padding: '10px 20px', border: 'none', borderRadius: '24px', cursor: 'pointer', fontWeight: '500', fontSize: '14px', whiteSpace: 'nowrap' },
  menuGrid: { display: 'flex', flexDirection: 'column', gap: '16px' },
  menuItem: { padding: '20px', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  menuItemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' },
  itemName: { fontSize: '1.1rem', fontWeight: '600', color: '${colors.text}', display: 'flex', alignItems: 'center' },
  itemPrice: { fontWeight: '700', color: '${colors.primary}', fontSize: '1.1rem' },
  itemDesc: { color: '${colors.text}', opacity: 0.7, fontSize: '14px', marginBottom: '8px' },
  itemCategory: { fontSize: '12px', color: '${colors.primary}', background: '${colors.primary}11', padding: '4px 10px', borderRadius: '12px' },
  noResults: { textAlign: 'center', padding: '40px', color: '${colors.text}', opacity: 0.6 },
  legend: { display: 'flex', gap: '24px', justifyContent: 'center', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '${colors.text}', opacity: 0.7 }
};
`,

      // Portal/Auth Pages
      login: `import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../components/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.error || 'Invalid email or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <LogIn size={32} color="${primaryColor}" />
          <h1 style={styles.title}>Welcome Back</h1>
          <p style={styles.subtitle}>Sign in to your ${businessName} account</p>
        </div>
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <div style={styles.inputWrap}>
              <Mail size={18} style={styles.inputIcon} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" style={styles.input} required />
            </div>
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrap}>
              <Lock size={18} style={styles.inputIcon} />
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={styles.input} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={styles.footerText}>Don't have an account? <Link to="/register" style={styles.link}>Create one</Link></p>
        <p style={styles.demoText}>Demo: demo@demo.com / demo1234</p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: '${bgColor}' },
  card: { width: '100%', maxWidth: '420px', background: '${surfaceColor}', borderRadius: '${corners}', padding: '40px', boxShadow: '${cardShadow}' },
  header: { textAlign: 'center', marginBottom: '32px' },
  title: { fontSize: '24px', fontWeight: '700', color: '${textColor}', marginTop: '16px', marginBottom: '8px' },
  subtitle: { fontSize: '14px', color: '${textColor}', opacity: 0.7 },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  error: { background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', fontSize: '14px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '14px', fontWeight: '500', color: '${textColor}' },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: '14px', color: '#9ca3af' },
  input: { width: '100%', padding: '14px 14px 14px 44px', border: '1px solid #e5e7eb', borderRadius: '${corners}', fontSize: '16px', outline: 'none' },
  eyeBtn: { position: 'absolute', right: '14px', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' },
  submitBtn: { padding: '14px', background: '${primaryColor}', color: '#fff', border: 'none', borderRadius: '${corners}', fontSize: '16px', fontWeight: '600', cursor: 'pointer' },
  footerText: { textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '${textColor}', opacity: 0.7 },
  link: { color: '${primaryColor}', fontWeight: '500' },
  demoText: { textAlign: 'center', marginTop: '12px', fontSize: '12px', color: '#9ca3af' }
};
`,

      register: `import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '../components/AuthContext';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const result = await register(name, email, password);
      if (result.success) { navigate('/dashboard'); }
      else { setError(result.error || 'Registration failed'); }
    } catch (err) { setError('Registration failed. Please try again.'); }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <UserPlus size={32} color="${primaryColor}" />
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>Join ${businessName} today</p>
        </div>
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <div style={styles.inputWrap}><User size={18} style={styles.inputIcon} /><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" style={styles.input} required /></div>
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <div style={styles.inputWrap}><Mail size={18} style={styles.inputIcon} /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" style={styles.input} required /></div>
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrap}><Lock size={18} style={styles.inputIcon} /><input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={styles.input} required /><button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password</label>
            <div style={styles.inputWrap}><Lock size={18} style={styles.inputIcon} /><input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" style={styles.input} required /></div>
          </div>
          <button type="submit" disabled={loading} style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}>{loading ? 'Creating Account...' : 'Create Account'}</button>
        </form>
        <p style={styles.footerText}>Already have an account? <Link to="/login" style={styles.link}>Sign in</Link></p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: '${bgColor}' },
  card: { width: '100%', maxWidth: '420px', background: '${surfaceColor}', borderRadius: '${corners}', padding: '40px', boxShadow: '${cardShadow}' },
  header: { textAlign: 'center', marginBottom: '32px' },
  title: { fontSize: '24px', fontWeight: '700', color: '${textColor}', marginTop: '16px', marginBottom: '8px' },
  subtitle: { fontSize: '14px', color: '${textColor}', opacity: 0.7 },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  error: { background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', fontSize: '14px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '14px', fontWeight: '500', color: '${textColor}' },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: '14px', color: '#9ca3af' },
  input: { width: '100%', padding: '14px 14px 14px 44px', border: '1px solid #e5e7eb', borderRadius: '${corners}', fontSize: '16px', outline: 'none' },
  eyeBtn: { position: 'absolute', right: '14px', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' },
  submitBtn: { padding: '14px', background: '${primaryColor}', color: '#fff', border: 'none', borderRadius: '${corners}', fontSize: '16px', fontWeight: '600', cursor: 'pointer' },
  footerText: { textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '${textColor}', opacity: 0.7 },
  link: { color: '${primaryColor}', fontWeight: '500' }
};
`,

      dashboard: `import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Calendar, Clock, Star, ShoppingBag, Award, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '../components/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ visits: 3, orders: 2, points: 150 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(\`\${API_BASE}/api/user/dashboard\`);
        const data = await res.json();
        if (data.success && data.stats) setStats(data.stats);
      } catch (err) { console.log('Using default stats'); }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (<div style={styles.loadingPage}><Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} color="${primaryColor}" /><style>{\`@keyframes spin { to { transform: rotate(360deg); } }\`}</style></div>);
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.welcomeCard}>
          <div style={styles.avatar}>{user?.name?.charAt(0) || 'U'}</div>
          <div><h1 style={styles.welcomeTitle}>Welcome back, {user?.name || 'Guest'}!</h1><p style={styles.welcomeText}>Here's what's happening with your account</p></div>
        </div>
        <div style={styles.statsGrid}>
          <div style={styles.statCard}><Calendar size={24} color="${primaryColor}" /><div style={styles.statValue}>{stats.visits}</div><div style={styles.statLabel}>Total Visits</div></div>
          <div style={styles.statCard}><ShoppingBag size={24} color="${primaryColor}" /><div style={styles.statValue}>{stats.orders}</div><div style={styles.statLabel}>Orders</div></div>
          <div style={styles.statCard}><Award size={24} color="${primaryColor}" /><div style={styles.statValue}>{stats.points}</div><div style={styles.statLabel}>Reward Points</div></div>
        </div>
        <h2 style={styles.sectionTitle}>Quick Actions</h2>
        <div style={styles.actionsGrid}>
          <Link to="/booking" style={styles.actionCard}><Calendar size={24} color="${primaryColor}" /><span>Book Appointment</span><ChevronRight size={18} color="#9ca3af" /></Link>
          <Link to="/profile" style={styles.actionCard}><User size={24} color="${primaryColor}" /><span>Edit Profile</span><ChevronRight size={18} color="#9ca3af" /></Link>
          <Link to="/rewards" style={styles.actionCard}><Star size={24} color="${primaryColor}" /><span>View Rewards</span><ChevronRight size={18} color="#9ca3af" /></Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '80vh', padding: '40px 20px', background: '${bgColor}' },
  container: { maxWidth: '900px', margin: '0 auto' },
  loadingPage: { minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  welcomeCard: { display: 'flex', alignItems: 'center', gap: '20px', padding: '32px', background: '${surfaceColor}', borderRadius: '${corners}', marginBottom: '32px', boxShadow: '${cardShadow}' },
  avatar: { width: '64px', height: '64px', borderRadius: '50%', background: '${primaryColor}', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '700' },
  welcomeTitle: { fontSize: '24px', fontWeight: '700', color: '${textColor}', marginBottom: '4px' },
  welcomeText: { fontSize: '14px', color: '${textColor}', opacity: 0.7 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '40px' },
  statCard: { padding: '24px', background: '${surfaceColor}', borderRadius: '${corners}', textAlign: 'center', boxShadow: '${cardShadow}' },
  statValue: { fontSize: '32px', fontWeight: '700', color: '${textColor}', margin: '12px 0 4px' },
  statLabel: { fontSize: '14px', color: '${textColor}', opacity: 0.7 },
  sectionTitle: { fontSize: '18px', fontWeight: '600', color: '${textColor}', marginBottom: '16px' },
  actionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' },
  actionCard: { display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', background: '${surfaceColor}', borderRadius: '${corners}', textDecoration: 'none', color: '${textColor}', fontWeight: '500', boxShadow: '${cardShadow}' }
};
`,

      profile: `import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Save, LogOut } from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { if (user) setProfile(p => ({ ...p, name: user.name || '', email: user.email || '' })); }, [user]);

  const handleSave = async () => {
    setSaving(true); setMessage('');
    try {
      const res = await fetch(\`\${API_BASE}/api/user/profile\`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile) });
      const data = await res.json();
      setMessage(data.success ? 'Profile updated!' : 'Saved locally');
    } catch (err) { setMessage('Saved locally'); }
    setSaving(false);
  };

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}><h1 style={styles.title}>Your Profile</h1><p style={styles.subtitle}>Manage your account settings</p></div>
        <div style={styles.card}>
          <div style={styles.avatarSection}><div style={styles.avatar}>{profile.name.charAt(0) || 'U'}</div></div>
          <div style={styles.form}>
            {message && <div style={styles.message}>{message}</div>}
            <div style={styles.inputGroup}><label style={styles.label}><User size={16} /> Full Name</label><input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} style={styles.input} /></div>
            <div style={styles.inputGroup}><label style={styles.label}><Mail size={16} /> Email</label><input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} style={styles.input} /></div>
            <div style={styles.inputGroup}><label style={styles.label}><Phone size={16} /> Phone</label><input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="(555) 123-4567" style={styles.input} /></div>
            <div style={styles.inputGroup}><label style={styles.label}><MapPin size={16} /> Address</label><input type="text" value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} placeholder="123 Main St" style={styles.input} /></div>
            <div style={styles.actions}>
              <button onClick={handleSave} disabled={saving} style={styles.saveBtn}><Save size={18} /> {saving ? 'Saving...' : 'Save'}</button>
              <button onClick={handleLogout} style={styles.logoutBtn}><LogOut size={18} /> Sign Out</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '80vh', padding: '40px 20px', background: '${bgColor}' },
  container: { maxWidth: '600px', margin: '0 auto' },
  header: { textAlign: 'center', marginBottom: '32px' },
  title: { fontSize: '28px', fontWeight: '700', color: '${textColor}', marginBottom: '8px' },
  subtitle: { fontSize: '14px', color: '${textColor}', opacity: 0.7 },
  card: { background: '${surfaceColor}', borderRadius: '${corners}', padding: '32px', boxShadow: '${cardShadow}' },
  avatarSection: { display: 'flex', justifyContent: 'center', marginBottom: '32px' },
  avatar: { width: '100px', height: '100px', borderRadius: '50%', background: '${primaryColor}', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: '700' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  message: { padding: '12px', borderRadius: '8px', fontSize: '14px', textAlign: 'center', background: '#dcfce7', color: '#16a34a' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500', color: '${textColor}' },
  input: { padding: '14px', border: '1px solid #e5e7eb', borderRadius: '${corners}', fontSize: '16px', outline: 'none' },
  actions: { display: 'flex', gap: '16px', marginTop: '16px' },
  saveBtn: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', background: '${primaryColor}', color: '#fff', border: 'none', borderRadius: '${corners}', fontSize: '16px', fontWeight: '600', cursor: 'pointer' },
  logoutBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px 24px', background: 'transparent', color: '#dc2626', border: '1px solid #dc2626', borderRadius: '${corners}', fontSize: '16px', fontWeight: '500', cursor: 'pointer' }
};
`,

      account: `import React from 'react';
import { Link } from 'react-router-dom';
import { User, CreditCard, Bell, Shield, HelpCircle, ChevronRight } from 'lucide-react';
import { useAuth } from '../components/AuthContext';

export default function AccountPage() {
  const { user } = useAuth();
  const menuItems = [
    { icon: User, label: 'Edit Profile', path: '/profile', desc: 'Update your personal information' },
    { icon: CreditCard, label: 'Payment Methods', path: '#', desc: 'Manage your payment options' },
    { icon: Bell, label: 'Notifications', path: '#', desc: 'Configure your alerts' },
    { icon: Shield, label: 'Privacy & Security', path: '#', desc: 'Manage your data and security' },
    { icon: HelpCircle, label: 'Help & Support', path: '/contact', desc: 'Get help with your account' }
  ];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.avatar}>{user?.name?.charAt(0) || 'U'}</div>
          <h1 style={styles.name}>{user?.name || 'Guest'}</h1>
          <p style={styles.email}>{user?.email || ''}</p>
        </div>
        <div style={styles.menuList}>
          {menuItems.map((item, idx) => (
            <Link key={idx} to={item.path} style={styles.menuItem}>
              <item.icon size={22} color="${primaryColor}" />
              <div style={styles.menuInfo}><span style={styles.menuLabel}>{item.label}</span><span style={styles.menuDesc}>{item.desc}</span></div>
              <ChevronRight size={20} color="#9ca3af" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '80vh', padding: '40px 20px', background: '${bgColor}' },
  container: { maxWidth: '600px', margin: '0 auto' },
  header: { textAlign: 'center', marginBottom: '40px' },
  avatar: { width: '80px', height: '80px', borderRadius: '50%', background: '${primaryColor}', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: '700', margin: '0 auto 16px' },
  name: { fontSize: '24px', fontWeight: '700', color: '${textColor}', marginBottom: '4px' },
  email: { fontSize: '14px', color: '${textColor}', opacity: 0.7 },
  menuList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  menuItem: { display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', background: '${surfaceColor}', borderRadius: '${corners}', textDecoration: 'none', boxShadow: '${cardShadow}' },
  menuInfo: { flex: 1, display: 'flex', flexDirection: 'column' },
  menuLabel: { fontWeight: '600', color: '${textColor}', marginBottom: '2px' },
  menuDesc: { fontSize: '13px', color: '${textColor}', opacity: 0.6 }
};
`
    };

    // Return template if exists, otherwise generate a generic page
    if (templates[pageName]) {
      return templates[pageName];
    }

    // Generic page template
    const compName = toPascalCase(pageName);
    // Convert "service-areas" to "Service Areas" for display
    const displayName = pageName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return `import React from 'react';

export default function ${compName}Page() {
  return (
    <div>
      <section style={styles.hero}>
        <div style={styles.container}>
          <h1 style={styles.title}>${displayName}</h1>
          <p style={styles.subtitle}>${businessName}</p>
        </div>
      </section>

      <section style={styles.content}>
        <div style={styles.container}>
          <p style={styles.text}>Welcome to our ${displayName.toLowerCase()} page. Content coming soon!</p>
        </div>
      </section>
    </div>
  );
}

const styles = {
  hero: { background: '${colors.primary}', padding: '60px 24px', textAlign: 'center' },
  container: { maxWidth: '900px', margin: '0 auto' },
  title: { fontSize: '2.5rem', fontWeight: '700', color: '#fff', marginBottom: '16px' },
  subtitle: { fontSize: '1.1rem', color: '#fff', opacity: 0.9 },
  content: { padding: '60px 24px' },
  text: { fontSize: '1.1rem', lineHeight: 1.8, color: '${colors.text}' }
};
`;
  }

  /**
   * Run build using audit service
   */
  async runBuild(projectPath) {
    try {
      const auditService = require('../services/audit-service.cjs');
      const result = await auditService.audit1PostGeneration(projectPath, {
        maxRetries: 2,
        timeout: 120000
      });

      return {
        success: result.success,
        errors: result.errors?.map(e => e.message) || [],
        warnings: result.warnings?.map(w => w.message) || [],
        durationMs: result.durationMs
      };
    } catch (err) {
      return {
        success: false,
        errors: [err.message]
      };
    }
  }

  /**
   * Industry groups - similar industries share layout styles
   */
  static INDUSTRY_GROUPS = {
    'grooming': {
      industries: ['barbershop', 'barber', 'salon', 'salon-spa', 'hair', 'nail', 'beauty', 'tattoo', 'spa'],
      style: 'bold-modern',
      typography: 'bold',
      corners: 'sharp',
      featureStyle: 'icon-cards',
      ctaStyle: 'prominent'
    },
    'food-beverage': {
      industries: ['restaurant', 'cafe', 'coffee', 'bakery', 'pizza', 'steakhouse', 'bar', 'bistro', 'catering'],
      style: 'warm-inviting',
      typography: 'mixed',
      corners: 'rounded',
      featureStyle: 'image-cards',
      ctaStyle: 'warm'
    },
    'healthcare': {
      industries: ['healthcare', 'medical', 'dental', 'clinic', 'doctor', 'therapy', 'chiropractic', 'veterinary'],
      style: 'clean-professional',
      typography: 'modern',
      corners: 'subtle',
      featureStyle: 'stat-cards',
      ctaStyle: 'trust'
    },
    'fitness': {
      industries: ['gym', 'fitness', 'yoga', 'pilates', 'crossfit', 'trainer', 'martial-arts', 'boxing', 'wellness'],
      style: 'energetic',
      typography: 'bold',
      corners: 'rounded',
      featureStyle: 'bento',
      ctaStyle: 'action'
    },
    'professional': {
      industries: ['law', 'legal', 'accounting', 'consulting', 'finance', 'insurance', 'advisor'],
      style: 'corporate',
      typography: 'traditional',
      corners: 'subtle',
      featureStyle: 'list-cards',
      ctaStyle: 'formal'
    },
    'home-services': {
      industries: ['plumber', 'plumbing', 'electrician', 'hvac', 'roofing', 'contractor', 'cleaning', 'landscaping', 'handyman', 'auto-shop'],
      style: 'trust-action',
      typography: 'modern',
      corners: 'subtle',
      featureStyle: 'trust-badges',
      ctaStyle: 'urgent'
    },
    'retail': {
      industries: ['retail', 'shop', 'store', 'boutique', 'ecommerce', 'jewelry', 'clothing', 'fashion'],
      style: 'showcase',
      typography: 'modern',
      corners: 'rounded',
      featureStyle: 'product-grid',
      ctaStyle: 'shop'
    },
    'real-estate': {
      industries: ['real-estate', 'realtor', 'property', 'homes', 'broker'],
      style: 'sophisticated',
      typography: 'modern',
      corners: 'subtle',
      featureStyle: 'property-cards',
      ctaStyle: 'consultation'
    },
    'education': {
      industries: ['school', 'academy', 'tutoring', 'courses', 'training', 'education'],
      style: 'friendly',
      typography: 'modern',
      corners: 'rounded',
      featureStyle: 'feature-grid',
      ctaStyle: 'enroll'
    }
  };

  /**
   * Get layout-specific style overrides based on selected layout
   */
  getLayoutStyleOverrides(layoutId, groupName) {
    const overrides = {
      // Grooming layouts
      'bold-classic': {
        heroStyle: 'dark',
        corners: '4px',
        buttonStyle: 'solid',
        featureBg: '#1a1a2e',
        featureText: '#fff',
        cardShadow: '0 4px 20px rgba(0,0,0,0.3)',
        typography: 'bold'
      },
      'modern-edge': {
        heroStyle: 'gradient',
        corners: '0px',
        buttonStyle: 'outline',
        featureBg: '#f9fafb',
        featureText: 'inherit',
        cardShadow: '0 2px 8px rgba(0,0,0,0.08)',
        typography: 'modern'
      },
      'urban-vibe': {
        heroStyle: 'image-overlay',
        corners: '8px',
        buttonStyle: 'solid',
        featureBg: '#111',
        featureText: '#fff',
        cardShadow: '0 8px 32px rgba(0,0,0,0.4)',
        typography: 'condensed'
      },

      // Food & Beverage layouts
      'appetizing': {
        heroStyle: 'warm-gradient',
        corners: '16px',
        buttonStyle: 'rounded',
        featureBg: '#fffbeb',
        featureText: 'inherit',
        cardShadow: '0 4px 16px rgba(0,0,0,0.1)',
        typography: 'warm'
      },
      'menu-focused': {
        heroStyle: 'minimal',
        corners: '8px',
        buttonStyle: 'solid',
        featureBg: '#fff',
        featureText: 'inherit',
        cardShadow: '0 2px 8px rgba(0,0,0,0.06)',
        typography: 'clean'
      },
      'story-driven': {
        heroStyle: 'large-image',
        corners: '12px',
        buttonStyle: 'outline',
        featureBg: '#f5f5f4',
        featureText: 'inherit',
        cardShadow: '0 4px 12px rgba(0,0,0,0.08)',
        typography: 'serif'
      },

      // Healthcare layouts
      'clinical': {
        heroStyle: 'clean',
        corners: '8px',
        buttonStyle: 'solid',
        featureBg: '#f0f9ff',
        featureText: 'inherit',
        cardShadow: '0 2px 6px rgba(0,0,0,0.05)',
        typography: 'professional'
      },
      'patient-first': {
        heroStyle: 'warm-gradient',
        corners: '16px',
        buttonStyle: 'rounded',
        featureBg: '#f0fdf4',
        featureText: 'inherit',
        cardShadow: '0 4px 12px rgba(0,0,0,0.08)',
        typography: 'friendly'
      },
      'booking-focused': {
        heroStyle: 'cta-prominent',
        corners: '12px',
        buttonStyle: 'solid',
        featureBg: '#fff',
        featureText: 'inherit',
        cardShadow: '0 4px 16px rgba(0,0,0,0.1)',
        typography: 'modern'
      },

      // Fitness layouts
      'motivation': {
        heroStyle: 'bold-gradient',
        corners: '12px',
        buttonStyle: 'solid',
        featureBg: '#18181b',
        featureText: '#fff',
        cardShadow: '0 8px 24px rgba(0,0,0,0.2)',
        typography: 'impact'
      },
      'class-schedule': {
        heroStyle: 'minimal',
        corners: '8px',
        buttonStyle: 'solid',
        featureBg: '#fafafa',
        featureText: 'inherit',
        cardShadow: '0 2px 8px rgba(0,0,0,0.06)',
        typography: 'clean'
      },
      'results': {
        heroStyle: 'testimonial',
        corners: '12px',
        buttonStyle: 'solid',
        featureBg: '#f5f5f5',
        featureText: 'inherit',
        cardShadow: '0 4px 16px rgba(0,0,0,0.1)',
        typography: 'bold'
      },

      // Professional layouts
      'trust-builder': {
        heroStyle: 'professional',
        corners: '4px',
        buttonStyle: 'solid',
        featureBg: '#f8fafc',
        featureText: 'inherit',
        cardShadow: '0 2px 8px rgba(0,0,0,0.06)',
        typography: 'traditional'
      },
      'lead-gen': {
        heroStyle: 'cta-prominent',
        corners: '8px',
        buttonStyle: 'solid',
        featureBg: '#fff',
        featureText: 'inherit',
        cardShadow: '0 4px 12px rgba(0,0,0,0.08)',
        typography: 'modern'
      },
      'corporate': {
        heroStyle: 'minimal',
        corners: '2px',
        buttonStyle: 'outline',
        featureBg: '#fff',
        featureText: 'inherit',
        cardShadow: 'none',
        typography: 'clean'
      },

      // Home Services layouts
      'trust-call': {
        heroStyle: 'cta-prominent',
        corners: '8px',
        buttonStyle: 'solid',
        featureBg: '#f0f9ff',
        featureText: 'inherit',
        cardShadow: '0 4px 12px rgba(0,0,0,0.08)',
        typography: 'bold'
      },
      'quote-gen': {
        heroStyle: 'form-prominent',
        corners: '8px',
        buttonStyle: 'solid',
        featureBg: '#fff',
        featureText: 'inherit',
        cardShadow: '0 4px 16px rgba(0,0,0,0.1)',
        typography: 'modern'
      },
      'portfolio': {
        heroStyle: 'gallery',
        corners: '12px',
        buttonStyle: 'outline',
        featureBg: '#fafafa',
        featureText: 'inherit',
        cardShadow: '0 4px 12px rgba(0,0,0,0.08)',
        typography: 'modern'
      }
    };

    return overrides[layoutId] || {
      heroStyle: 'gradient',
      corners: '12px',
      buttonStyle: 'solid',
      featureBg: '#f9fafb',
      featureText: 'inherit',
      cardShadow: '0 4px 12px rgba(0,0,0,0.08)',
      typography: 'modern'
    };
  }

  /**
   * Get layout style for an industry
   */
  getIndustryLayoutStyle(industry) {
    const normalizedIndustry = industry.toLowerCase().replace(/[_\s]+/g, '-');

    for (const [groupName, group] of Object.entries(MasterAgent.INDUSTRY_GROUPS)) {
      if (group.industries.includes(normalizedIndustry)) {
        return {
          group: groupName,
          ...group
        };
      }
    }

    // Default fallback
    return {
      group: 'general',
      style: 'modern',
      typography: 'modern',
      corners: 'rounded',
      featureStyle: 'icon-cards',
      ctaStyle: 'standard'
    };
  }

  /**
   * Get available layout options for an industry group
   */
  static getLayoutOptionsForIndustry(industry) {
    const normalizedIndustry = industry.toLowerCase().replace(/[_\s]+/g, '-');

    for (const [groupName, group] of Object.entries(MasterAgent.INDUSTRY_GROUPS)) {
      if (group.industries.includes(normalizedIndustry)) {
        return {
          group: groupName,
          layouts: MasterAgent.getLayoutsForGroup(groupName)
        };
      }
    }

    return {
      group: 'general',
      layouts: MasterAgent.getLayoutsForGroup('general')
    };
  }

  /**
   * Get available layouts for a group
   */
  static getLayoutsForGroup(groupName) {
    const layouts = {
      'grooming': [
        { id: 'bold-classic', name: 'Bold Classic', description: 'Dark theme with gold accents, vintage feel' },
        { id: 'modern-edge', name: 'Modern Edge', description: 'Clean lines, sharp corners, contemporary' },
        { id: 'urban-vibe', name: 'Urban Vibe', description: 'Street style, bold typography, edgy' }
      ],
      'food-beverage': [
        { id: 'appetizing', name: 'Appetizing Visual', description: 'Food photography prominent, warm colors' },
        { id: 'menu-focused', name: 'Menu Focused', description: 'Menu front and center, easy ordering' },
        { id: 'story-driven', name: 'Story Driven', description: 'Tell your restaurant story' }
      ],
      'healthcare': [
        { id: 'clinical', name: 'Clinical Professional', description: 'Clean, trustworthy, calm colors' },
        { id: 'patient-first', name: 'Patient First', description: 'Warm, welcoming, accessible' },
        { id: 'booking-focused', name: 'Booking Focused', description: 'Appointment scheduling prominent' }
      ],
      'fitness': [
        { id: 'motivation', name: 'Motivation Driven', description: 'Inspiring, energetic, action shots' },
        { id: 'class-schedule', name: 'Class Scheduler', description: 'Schedule and booking centered' },
        { id: 'results', name: 'Results Focused', description: 'Transformations, testimonials' }
      ],
      'professional': [
        { id: 'trust-builder', name: 'Trust Builder', description: 'Credentials, testimonials prominent' },
        { id: 'lead-gen', name: 'Lead Generator', description: 'Form-focused, multiple CTAs' },
        { id: 'corporate', name: 'Corporate Clean', description: 'Minimal, lots of whitespace' }
      ],
      'home-services': [
        { id: 'trust-call', name: 'Trust & Call', description: 'Build trust fast, easy contact' },
        { id: 'quote-gen', name: 'Quote Generator', description: 'Easy quote requests' },
        { id: 'portfolio', name: 'Portfolio Showcase', description: 'Show off completed work' }
      ],
      'retail': [
        { id: 'product-showcase', name: 'Product Showcase', description: 'Visual grid, product focused' },
        { id: 'brand-story', name: 'Brand Story', description: 'Tell your brand story' },
        { id: 'collection', name: 'Collection View', description: 'Curated collections display' }
      ],
      'real-estate': [
        { id: 'property-search', name: 'Property Search', description: 'Search and listings prominent' },
        { id: 'agent-focused', name: 'Agent Focused', description: 'Agent credibility centered' },
        { id: 'market-stats', name: 'Market Stats', description: 'Data and market info' }
      ],
      'education': [
        { id: 'course-catalog', name: 'Course Catalog', description: 'Courses and programs display' },
        { id: 'instructor', name: 'Instructor Led', description: 'Teacher/instructor focused' },
        { id: 'enrollment', name: 'Enrollment Focused', description: 'Easy signup and registration' }
      ],
      'general': [
        { id: 'modern-clean', name: 'Modern Clean', description: 'Clean, professional, versatile' },
        { id: 'visual-first', name: 'Visual First', description: 'Image-heavy, gallery style' },
        { id: 'content-focused', name: 'Content Focused', description: 'Text and information centered' }
      ]
    };

    return layouts[groupName] || layouts['general'];
  }

  /**
   * Get agent statistics
   */
  getStats() {
    const elapsed = this.stats.startTime
      ? Math.round((Date.now() - this.stats.startTime) / 1000)
      : 0;

    return {
      ...this.stats,
      elapsedSeconds: elapsed,
      successRate: this.stats.projectsStarted > 0
        ? Math.round((this.stats.projectsCompleted / this.stats.projectsStarted) * 100)
        : 0,
      checkpointSuccessRate: this.stats.totalCheckpoints > 0
        ? Math.round((this.stats.checkpointsPassed / this.stats.totalCheckpoints) * 100)
        : 0,
      ralphStats: this.ralph.getSummary()
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      projectsStarted: 0,
      projectsCompleted: 0,
      projectsFailed: 0,
      totalCheckpoints: 0,
      checkpointsPassed: 0,
      checkpointsFailed: 0,
      startTime: null
    };
    this.ralph.reset();
  }
}

module.exports = { MasterAgent };
