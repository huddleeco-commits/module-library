/**
 * Smart Template Mode Routes
 *
 * API routes for the hybrid template + AI content generation approach
 * Supports modular assembly: website + portal + companion app
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const {
  generateSmartTemplate,
  generatePagesFromTemplate,
  CONTENT_ZONES,
  INDUSTRY_PAGE_PACKAGES,
  PORTAL_PAGES,
  getIndustryConfig,
  getIndustryPages,
  getPortalPages
} = require('../services/smart-template-generator.cjs');

// Import companion app generator for modular assembly
let generateCompanionApp;
try {
  const companionModule = require('../generators/companion-generator.cjs');
  generateCompanionApp = companionModule.generateCompanionApp;
} catch (err) {
  console.warn('Companion generator not available:', err.message);
}

// Paths
const MODULE_LIBRARY = path.resolve(__dirname, '..', '..', '..');
const GENERATED_PROJECTS = path.join(MODULE_LIBRARY, 'generated-projects');

function createSmartTemplateRouter() {
  const router = express.Router();

  /**
   * GET /api/smart-template/info
   * Get information about smart template mode
   */
  router.get('/info', (req, res) => {
    res.json({
      name: 'Smart Template Mode',
      description: 'Hybrid approach: proven template structure + AI-generated content',
      benefits: [
        'Faster generation (~30 seconds vs 2-3 minutes)',
        'Lower cost (~$0.10-0.30 vs $1.50)',
        'Consistent structure with creative content',
        'Location-aware personalization',
        'Industry-specific page names and terminology'
      ],
      contentZones: Object.keys(CONTENT_ZONES),
      requiredInputs: ['businessName', 'industry', 'location'],
      optionalInputs: ['logo', 'colors', 'hours', 'phone', 'email', 'teamMembers', 'menuText', 'moodSliders', 'pages', 'pageTier', 'includePortal', 'portalTier'],
      pageTiers: ['essential', 'recommended', 'premium'],
      portalTiers: Object.keys(PORTAL_PAGES)
    });
  });

  /**
   * GET /api/smart-template/industries
   * Get all available industries and their page configurations
   */
  router.get('/industries', (req, res) => {
    const industries = Object.keys(INDUSTRY_PAGE_PACKAGES).map(key => {
      const config = INDUSTRY_PAGE_PACKAGES[key];
      return {
        key,
        label: key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        terminology: config.terminology,
        pageTiers: {
          essential: config.essential,
          recommended: config.recommended,
          premium: config.premium
        }
      };
    });

    res.json({
      industries,
      portalOptions: PORTAL_PAGES
    });
  });

  /**
   * GET /api/smart-template/industry/:key
   * Get configuration for a specific industry
   */
  router.get('/industry/:key', (req, res) => {
    const { key } = req.params;
    const { tier = 'recommended' } = req.query;

    const config = getIndustryConfig(key);
    const pages = getIndustryPages(key, tier);

    res.json({
      industry: key,
      terminology: config.terminology,
      selectedTier: tier,
      pages,
      allTiers: {
        essential: config.essential,
        recommended: config.recommended,
        premium: config.premium
      }
    });
  });

  /**
   * POST /api/smart-template/preview
   * Generate a preview of smart template content (without creating files)
   */
  router.post('/preview', async (req, res) => {
    const {
      businessName,
      industry,
      location,
      moodSliders,
      teamMembers,
      menuText,
      skipAI = false
    } = req.body;

    if (!businessName || !industry || !location) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: businessName, industry, location'
      });
    }

    try {
      console.log('\n📋 Smart Template Preview Request');
      console.log(`   Business: ${businessName}`);
      console.log(`   Industry: ${industry}`);
      console.log(`   Location: ${location}`);
      console.log(`   Skip AI: ${skipAI}`);

      const templateData = await generateSmartTemplate({
        businessName,
        industry,
        location,
        moodSliders,
        teamMembers: teamMembers || [],
        menuText
      }, {
        skipAI,
        onProgress: (progress) => console.log(`   ${progress.message}`)
      });

      res.json({
        success: true,
        preview: templateData
      });
    } catch (error) {
      console.error('Smart template preview error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/smart-template/generate
   * Full generation with SSE progress updates
   */
  router.post('/generate', async (req, res) => {
    const {
      businessName,
      industry,
      location,
      tagline,
      logo,
      colors,
      hours,
      phone,
      email,
      teamMembers,
      menuText,
      moodSliders,
      layoutKey,
      features,
      pages,
      pageTier = 'recommended',
      includePortal = false,
      portalTier = 'standard',
      // Companion app options
      includeCompanion = false,
      quickActions,
      yearsInBusiness,
      skipAI = false
    } = req.body;

    if (!businessName || !industry || !location) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: businessName, industry, location'
      });
    }

    // Set up SSE for real-time progress
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const sendEvent = (type, data) => {
      res.write(`event: ${type}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    try {
      sendEvent('start', { message: '🎨 Smart Template generation starting...' });

      // Generate template data with AI content
      const templateData = await generateSmartTemplate({
        businessName,
        industry,
        location,
        tagline,
        logo,
        colors,
        hours,
        phone,
        email,
        teamMembers: teamMembers || [],
        menuText,
        moodSliders,
        layoutKey,
        features: features || [],
        pages,  // Let the generator handle industry-aware defaults
        pageTier,
        includePortal,
        portalTier,
        yearsInBusiness
      }, {
        skipAI,
        onProgress: (progress) => sendEvent('progress', progress)
      });

      // Create project directory
      const projectName = businessName.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-');
      const projectPath = path.join(GENERATED_PROJECTS, projectName);

      sendEvent('progress', { step: 'Creating project', message: `📁 Creating project: ${projectName}` });

      // Create directories
      if (!fs.existsSync(projectPath)) {
        fs.mkdirSync(projectPath, { recursive: true });
      }

      const frontendSrcPath = path.join(projectPath, 'frontend', 'src');
      if (!fs.existsSync(frontendSrcPath)) {
        fs.mkdirSync(frontendSrcPath, { recursive: true });
      }

      // Generate pages from template
      sendEvent('progress', { step: 'Generating pages', message: '📝 Generating page components...' });
      const generatedPages = generatePagesFromTemplate(templateData, projectPath);

      for (const page of generatedPages) {
        sendEvent('log', { message: `   ✅ ${page.component}.jsx` });
      }

      // Generate App.jsx
      sendEvent('progress', { step: 'Generating App.jsx', message: '📱 Generating App.jsx...' });
      const appJsxContent = generateAppJsx(generatedPages, templateData);
      fs.writeFileSync(path.join(frontendSrcPath, 'App.jsx'), appJsxContent);
      sendEvent('log', { message: '   ✅ App.jsx' });

      // Generate brain.json
      sendEvent('progress', { step: 'Generating brain.json', message: '🧠 Generating brain.json...' });
      const brainContent = generateBrainJson(templateData);
      fs.writeFileSync(path.join(projectPath, 'brain.json'), brainContent);
      sendEvent('log', { message: '   ✅ brain.json' });

      // Generate companion app if requested and generator is available
      let companionResult = null;
      if (includeCompanion && generateCompanionApp) {
        sendEvent('progress', { step: 'Generating companion app', message: '📱 Generating companion app...' });

        const companionOutputDir = path.join(path.dirname(projectPath), '..', 'module-assembler-ui', 'output', 'companion-apps');
        const companionProjectName = `${projectName.toLowerCase()}-companion`;
        const companionPath = path.join(companionOutputDir, companionProjectName);

        // Default quick actions based on industry
        const defaultQuickActions = getDefaultQuickActions(industry);
        const companionQuickActions = quickActions || defaultQuickActions;

        try {
          await generateCompanionApp(
            {
              appType: 'customer',
              industry,
              quickActions: companionQuickActions,
              parentSite: {
                name: businessName,
                subdomain: projectName.toLowerCase(),
                industry
              }
            },
            companionPath
          );

          companionResult = {
            name: companionProjectName,
            path: companionPath,
            quickActions: companionQuickActions
          };
          sendEvent('log', { message: `   ✅ Companion app: ${companionProjectName}` });
        } catch (companionError) {
          sendEvent('log', { message: `   ⚠️ Companion app error: ${companionError.message}` });
        }
      }

      // Calculate cost estimate
      const aiCalls = skipAI ? 0 : Object.keys(CONTENT_ZONES).length;
      const estimatedCost = skipAI ? 0 : (aiCalls * 0.02).toFixed(2); // ~$0.02 per small call

      sendEvent('complete', {
        success: true,
        projectName,
        projectPath,
        pagesGenerated: generatedPages.length,
        aiCalls,
        estimatedCost: `$${estimatedCost}`,
        companionApp: companionResult,
        templateData: {
          business: templateData.business,
          theme: templateData.theme,
          pages: templateData.pages,
          portalPages: templateData.portalPages
        }
      });

      res.end();

    } catch (error) {
      console.error('Smart template generation error:', error);
      sendEvent('error', { message: error.message });
      res.end();
    }
  });

  /**
   * POST /api/smart-template/content-zone
   * Generate content for a single zone (for testing/preview)
   */
  router.post('/content-zone', async (req, res) => {
    const { zone, context, skipAI = false } = req.body;

    if (!zone || !context) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: zone, context'
      });
    }

    if (!CONTENT_ZONES[zone]) {
      return res.status(400).json({
        success: false,
        error: `Unknown content zone: ${zone}`,
        availableZones: Object.keys(CONTENT_ZONES)
      });
    }

    try {
      const { generateContentZone, interpretMoodSliders } = require('../services/smart-template-generator.cjs');

      // Add mood interpretation to context
      const fullContext = {
        ...context,
        moodInterpretation: interpretMoodSliders(context.moodSliders)
      };

      const content = await generateContentZone(zone, fullContext, { skipAI });

      res.json({
        success: true,
        zone,
        content
      });
    } catch (error) {
      console.error(`Content zone generation error (${zone}):`, error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
}

/**
 * Generate App.jsx for smart template projects
 */
function generateAppJsx(pages, templateData) {
  const { business, theme } = templateData;
  const { colors } = theme;

  const imports = pages.map(p =>
    `import ${p.component} from './pages/${p.component}';`
  ).join('\n');

  const navLinks = pages.map(p => {
    const path = p.name === 'home' ? '/' : `/${p.name}`;
    const label = p.name.charAt(0).toUpperCase() + p.name.slice(1);
    return `            <Link to="${path}" style={styles.navLink}>${label}</Link>`;
  }).join('\n');

  const routes = pages.map(p => {
    const path = p.name === 'home' ? '/' : `/${p.name}`;
    return `            <Route path="${path}" element={<${p.component} />} />`;
  }).join('\n');

  return `/**
 * ${business.name} - App
 * Generated with Smart Template Mode
 */
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

${imports}

function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav style={styles.nav}>
      <Link to="/home" style={styles.brand}>${business.name}</Link>

      <div style={styles.desktopNav}>
${navLinks}
      </div>

      <button
        onClick={() => setMenuOpen(!menuOpen)}
        style={styles.menuButton}
      >
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {menuOpen && (
        <div style={styles.mobileNav}>
${navLinks.replace(/styles\.navLink/g, 'styles.mobileNavLink')}
        </div>
      )}
    </nav>
  );
}

function Footer() {
  return (
    <footer style={styles.footer}>
      <p>&copy; ${new Date().getFullYear()} ${business.name}. All rights reserved.</p>
      ${business.location ? `<p>${business.location}</p>` : ''}
    </footer>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div style={styles.app}>
        <Navigation />
        <main style={styles.main}>
          <Routes>
${routes}
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

const styles = {
  app: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '${colors.background}',
    color: '${colors.text}'
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    backgroundColor: '${colors.background}',
    borderBottom: '1px solid rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  brand: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '${colors.primary}',
    textDecoration: 'none'
  },
  desktopNav: {
    display: 'flex',
    gap: '24px'
  },
  navLink: {
    color: '${colors.text}',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    opacity: 0.8
  },
  menuButton: {
    display: 'none',
    background: 'none',
    border: 'none',
    color: '${colors.text}',
    cursor: 'pointer'
  },
  mobileNav: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '${colors.background}',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    borderBottom: '1px solid rgba(0,0,0,0.1)'
  },
  mobileNavLink: {
    color: '${colors.text}',
    textDecoration: 'none',
    fontSize: '16px',
    padding: '8px 0'
  },
  main: {
    flex: 1
  },
  footer: {
    textAlign: 'center',
    padding: '40px 24px',
    borderTop: '1px solid rgba(0,0,0,0.1)',
    color: '${colors.text}',
    opacity: 0.7
  }
};

export default App;
`;
}

/**
 * Generate brain.json for smart template projects
 */
function generateBrainJson(templateData) {
  const { business, theme, content, pages, portalPages, pageTier, industryConfig, features } = templateData;

  return JSON.stringify({
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    generationMode: 'smart-template',
    business: {
      name: business.name,
      tagline: business.tagline,
      industry: business.industry,
      location: business.location,
      phone: business.phone,
      email: business.email,
      hours: business.hours,
      yearsInBusiness: business.yearsInBusiness
    },
    theme: {
      colors: theme.colors,
      moodSliders: theme.moodSliders,
      moodInterpretation: theme.moodInterpretation
    },
    content: {
      hero: content.hero,
      testimonials: content.testimonials,
      team: content.team
    },
    pages,
    portalPages: portalPages || [],
    pageTier: pageTier || 'recommended',
    industryConfig: industryConfig || {},
    features
  }, null, 2);
}

/**
 * Get default quick actions based on industry
 */
function getDefaultQuickActions(industry) {
  const industryActions = {
    // Food & Beverage
    restaurant: ['viewMenu', 'makeReservation', 'viewLoyalty', 'messages'],
    cafe: ['viewMenu', 'viewLoyalty', 'earnPoints', 'messages'],
    pizza: ['orderFood', 'viewMenu', 'viewLoyalty', 'messages'],
    bakery: ['orderFood', 'viewMenu', 'viewLoyalty', 'messages'],
    bar: ['viewMenu', 'makeReservation', 'viewLoyalty', 'messages'],

    // Healthcare
    dental: ['bookAppointment', 'viewRecords', 'documents', 'messages'],
    healthcare: ['bookAppointment', 'viewRecords', 'documents', 'messages'],

    // Beauty & Wellness
    'spa-salon': ['bookAppointment', 'viewMenu', 'viewLoyalty', 'messages'],
    barbershop: ['bookAppointment', 'viewMenu', 'viewLoyalty', 'messages'],
    fitness: ['viewClasses', 'bookAppointment', 'viewLoyalty', 'messages'],
    yoga: ['viewClasses', 'bookAppointment', 'viewLoyalty', 'messages'],

    // Professional Services
    'law-firm': ['bookAppointment', 'documents', 'messages'],
    'real-estate': ['viewListings', 'bookAppointment', 'messages'],
    consulting: ['bookAppointment', 'documents', 'messages'],

    // Default
    default: ['viewMenu', 'bookAppointment', 'viewLoyalty', 'messages']
  };

  const key = (industry || '').toLowerCase().replace(/\s+/g, '-');
  return industryActions[key] || industryActions.default;
}

module.exports = { createSmartTemplateRouter };
